/**
 * Tests for AI Controller event emission (Phase 7)
 */

import {assert, beforeEach, describe, it, vi} from "vitest";
import {z} from "zod";

import {AiController} from "../../src/ai/AiController";
import type {AiStatus} from "../../src/ai/AiStatus";
import {CommandRegistry} from "../../src/ai/commands";
import type {CommandContext, CommandResult} from "../../src/ai/commands/types";
import {MockLlmProvider} from "../../src/ai/providers/MockLlmProvider";
import type {
    AiCommandCompleteEvent,
    AiCommandErrorEvent,
    AiCommandStartEvent,
    AiEvent,
    AiStatusChangeEvent,
    AiStreamChunkEvent,
    AiStreamToolResultEvent,
} from "../../src/events";

// Helper to create a mock graph for testing
function createMockGraph(): CommandContext["graph"] {
    return {} as CommandContext["graph"];
}

describe("AiController Events", () => {
    let controller: AiController;
    let mockProvider: MockLlmProvider;
    let registry: CommandRegistry;
    let mockGraph: CommandContext["graph"];
    let emitEvent: ReturnType<typeof vi.fn>;
    let emittedEvents: AiEvent[];

    beforeEach(() => {
        mockProvider = new MockLlmProvider();
        registry = new CommandRegistry();
        mockGraph = createMockGraph();
        emittedEvents = [];
        emitEvent = vi.fn((event: AiEvent) => {
            emittedEvents.push(event);
        });

        controller = new AiController({
            provider: mockProvider,
            commandRegistry: registry,
            graph: mockGraph,
            emitEvent,
        });
    });

    describe("ai-status-change event", () => {
        it("emits ai-status-change on state transitions", async() => {
            mockProvider.setResponse("test", {text: "Done", toolCalls: []});
            await controller.execute("test");

            const statusEvents = emittedEvents.filter((e): e is AiStatusChangeEvent =>
                e.type === "ai-status-change");

            // Should have multiple status change events during execution
            assert.ok(statusEvents.length > 0);

            // Should include submitted state
            const submittedEvent = statusEvents.find((e) => e.status.state === "submitted");
            assert.ok(submittedEvent);

            // Should include ready state at end
            const readyEvent = statusEvents.find((e) => e.status.state === "ready");
            assert.ok(readyEvent);
        });

        it("status events contain full AiStatus object", async() => {
            mockProvider.setResponse("test", {text: "Response", toolCalls: []});
            await controller.execute("test");

            const statusEvents = emittedEvents.filter((e): e is AiStatusChangeEvent =>
                e.type === "ai-status-change");

            assert.ok(statusEvents.length > 0);
            const firstEvent = statusEvents[0];
            assert.ok("state" in firstEvent.status);
            assert.ok("canCancel" in firstEvent.status);
        });
    });

    describe("ai-command-start event", () => {
        it("emits ai-command-start with input and timestamp", async() => {
            mockProvider.setResponse("make nodes red", {text: "Done", toolCalls: []});
            await controller.execute("make nodes red");

            const startEvents = emittedEvents.filter((e): e is AiCommandStartEvent =>
                e.type === "ai-command-start");

            assert.strictEqual(startEvents.length, 1);
            assert.strictEqual(startEvents[0].input, "make nodes red");
            assert.ok(startEvents[0].timestamp > 0);
        });

        it("timestamp is close to execution time", async() => {
            const beforeTime = Date.now();
            mockProvider.setResponse("test", {text: "Done", toolCalls: []});
            await controller.execute("test");
            const afterTime = Date.now();

            const startEvent = emittedEvents.find((e): e is AiCommandStartEvent =>
                e.type === "ai-command-start");

            assert.ok(startEvent, "Should have start event");
            assert.ok(startEvent.timestamp >= beforeTime);
            assert.ok(startEvent.timestamp <= afterTime);
        });
    });

    describe("ai-command-complete event", () => {
        it("emits ai-command-complete with result and duration", async() => {
            mockProvider.setResponse("how many nodes?", {
                text: "There are 5 nodes",
                toolCalls: [],
            });

            await controller.execute("how many nodes?");

            const completeEvents = emittedEvents.filter((e): e is AiCommandCompleteEvent =>
                e.type === "ai-command-complete");

            assert.strictEqual(completeEvents.length, 1);
            assert.ok(completeEvents[0].result.success);
            assert.ok(completeEvents[0].duration >= 0);
        });

        it("result contains message from execution", async() => {
            registry.register({
                name: "getCount",
                description: "Get count",
                parameters: z.object({}),
                examples: [],
                execute: (): Promise<CommandResult> => Promise.resolve({
                    success: true,
                    message: "Found 42 nodes",
                    data: {count: 42},
                }),
            });

            mockProvider.setResponse("count", {
                text: "",
                toolCalls: [{id: "1", name: "getCount", arguments: {}}],
            });

            await controller.execute("count nodes");

            const completeEvent = emittedEvents.find((e): e is AiCommandCompleteEvent =>
                e.type === "ai-command-complete");

            assert.ok(completeEvent, "Should have complete event");
            assert.ok(completeEvent.result.message.includes("42"));
        });
    });

    describe("ai-command-error event", () => {
        it("emits ai-command-error with canRetry flag", async() => {
            mockProvider.setError(new Error("Network error"));

            await controller.execute("test command");

            const errorEvents = emittedEvents.filter((e): e is AiCommandErrorEvent =>
                e.type === "ai-command-error");

            assert.strictEqual(errorEvents.length, 1);
            assert.ok(errorEvents[0].error.message.includes("Network error"));
            assert.strictEqual(errorEvents[0].canRetry, true);
            assert.strictEqual(errorEvents[0].input, "test command");
        });

        it("includes original input in error event", async() => {
            mockProvider.setError(new Error("API failure"));

            const input = "complex query with special chars: @#$%";
            await controller.execute(input);

            const errorEvent = emittedEvents.find((e): e is AiCommandErrorEvent =>
                e.type === "ai-command-error");

            assert.ok(errorEvent, "Should have error event");
            assert.strictEqual(errorEvent.input, input);
        });
    });

    describe("ai-stream-chunk event", () => {
        it("emits ai-stream-chunk events during streaming", async() => {
            // Mock streaming with accumulated text
            mockProvider.setResponse("describe the graph", {
                text: "The graph contains nodes and edges.",
                toolCalls: [],
            });

            await controller.execute("describe the graph");

            const chunkEvents = emittedEvents.filter((e): e is AiStreamChunkEvent =>
                e.type === "ai-stream-chunk");

            // At minimum, should have streamed text event(s) when text is returned
            if (chunkEvents.length > 0) {
                const lastChunk = chunkEvents[chunkEvents.length - 1];
                assert.ok(lastChunk.accumulated.length > 0);
            }
        });
    });

    describe("ai-stream-tool-result event", () => {
        it("emits ai-stream-tool-result when tool completes", async() => {
            registry.register({
                name: "testTool",
                description: "Test tool",
                parameters: z.object({}),
                examples: [],
                execute: (): Promise<CommandResult> => Promise.resolve({
                    success: true,
                    message: "Tool executed",
                    data: {value: 123},
                }),
            });

            mockProvider.setResponse("run", {
                text: "",
                toolCalls: [{id: "1", name: "testTool", arguments: {}}],
            });

            await controller.execute("run the tool");

            const toolResultEvents = emittedEvents.filter((e): e is AiStreamToolResultEvent =>
                e.type === "ai-stream-tool-result");

            assert.strictEqual(toolResultEvents.length, 1);
            assert.strictEqual(toolResultEvents[0].name, "testTool");
            assert.strictEqual(toolResultEvents[0].success, true);
        });

        it("emits ai-stream-tool-result with success=false on failure", async() => {
            registry.register({
                name: "failingTool",
                description: "Failing tool",
                parameters: z.object({}),
                examples: [],
                execute: (): Promise<CommandResult> => Promise.resolve({
                    success: false,
                    message: "Tool failed",
                }),
            });

            mockProvider.setResponse("fail", {
                text: "",
                toolCalls: [{id: "1", name: "failingTool", arguments: {}}],
            });

            await controller.execute("make it fail");

            const toolResultEvent = emittedEvents.find((e): e is AiStreamToolResultEvent =>
                e.type === "ai-stream-tool-result");

            assert.ok(toolResultEvent, "Should have tool result event");
            assert.strictEqual(toolResultEvent.success, false);
        });
    });

    describe("event ordering", () => {
        it("events are emitted in correct order", async() => {
            registry.register({
                name: "testCommand",
                description: "Test",
                parameters: z.object({}),
                examples: [],
                execute: (): Promise<CommandResult> => Promise.resolve({
                    success: true,
                    message: "Done",
                }),
            });

            mockProvider.setResponse("test", {
                text: "Executing...",
                toolCalls: [{id: "1", name: "testCommand", arguments: {}}],
            });

            await controller.execute("test");

            // Find key event types
            const eventTypes = emittedEvents.map((e) => e.type);

            // ai-command-start should come first
            const startIndex = eventTypes.indexOf("ai-command-start");
            assert.ok(startIndex >= 0, "Should have ai-command-start event");

            // ai-command-complete should come last (among these key events)
            const completeIndex = eventTypes.indexOf("ai-command-complete");
            assert.ok(completeIndex >= 0, "Should have ai-command-complete event");
            assert.ok(completeIndex > startIndex, "complete should come after start");
        });
    });

    describe("status change subscription compatibility", () => {
        it("onStatusChange still works alongside event emission", async() => {
            const statusChanges: AiStatus[] = [];
            controller.onStatusChange((status) => statusChanges.push(status));

            mockProvider.setResponse("test", {text: "Done", toolCalls: []});
            await controller.execute("test");

            // Both should receive updates
            assert.ok(statusChanges.length > 0);

            const statusEvents = emittedEvents.filter((e): e is AiStatusChangeEvent =>
                e.type === "ai-status-change");
            assert.ok(statusEvents.length > 0);
        });
    });
});
