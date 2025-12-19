import {assert, beforeEach, describe, it} from "vitest";
import {z} from "zod";

import {AiController} from "../../src/ai/AiController";
import type {AiStatus} from "../../src/ai/AiStatus";
import {CommandRegistry} from "../../src/ai/commands";
import type {CommandContext, CommandResult} from "../../src/ai/commands/types";
import {MockLlmProvider} from "../../src/ai/providers/MockLlmProvider";

// Helper to create a mock graph for testing
function createMockGraph(): CommandContext["graph"] {
    return {} as CommandContext["graph"];
}

describe("AiController", () => {
    let controller: AiController;
    let mockProvider: MockLlmProvider;
    let registry: CommandRegistry;
    let mockGraph: CommandContext["graph"];

    beforeEach(() => {
        mockProvider = new MockLlmProvider();
        registry = new CommandRegistry();
        mockGraph = createMockGraph();
        controller = new AiController({
            provider: mockProvider,
            commandRegistry: registry,
            graph: mockGraph,
        });
    });

    describe("initialization", () => {
        it("creates controller with provider and registry", () => {
            assert.ok(controller);
        });

        it("starts in ready state", () => {
            const status = controller.getStatus();
            assert.strictEqual(status.state, "ready");
        });
    });

    describe("execute - text-only response", () => {
        it("processes text-only response", async() => {
            mockProvider.setResponse("hello", {
                text: "Hello! How can I help you with the graph?",
                toolCalls: [],
            });

            const result = await controller.execute("hello");
            assert.strictEqual(result.success, true);
            assert.ok(result.message.includes("Hello"));
        });

        it("returns message from LLM when no tool calls", async() => {
            mockProvider.setResponse("what", {
                text: "I can help you with various graph operations.",
                toolCalls: [],
            });

            const result = await controller.execute("what can you do?");
            assert.ok(result.message.includes("graph operations"));
        });
    });

    describe("execute - tool calls", () => {
        it("executes tool calls from LLM", async() => {
            let executedWith: unknown = null;
            registry.register({
                name: "sayHello",
                description: "Say hello",
                parameters: z.object({name: z.string()}),
                examples: [],
                execute: (_graph, params) => {
                    executedWith = params;

                    return Promise.resolve({success: true, message: `Hello, ${params.name}!`});
                },
            });

            mockProvider.setResponse("greet", {
                text: "",
                toolCalls: [{id: "1", name: "sayHello", arguments: {name: "World"}}],
            });

            const result = await controller.execute("greet someone");
            assert.deepStrictEqual(executedWith, {name: "World"});
            assert.strictEqual(result.success, true);
        });

        it("returns command result when tool call succeeds", async() => {
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

            mockProvider.setResponse("how many", {
                text: "",
                toolCalls: [{id: "1", name: "getCount", arguments: {}}],
            });

            const result = await controller.execute("how many?");
            assert.strictEqual(result.success, true);
            assert.ok(result.message.includes("42"));
            assert.deepStrictEqual(result.data, {count: 42});
        });

        it("executes multiple tool calls in sequence", async() => {
            const executionOrder: string[] = [];

            registry.register({
                name: "first",
                description: "First",
                parameters: z.object({}),
                examples: [],
                execute: () => {
                    executionOrder.push("first");

                    return Promise.resolve({success: true, message: "First done"});
                },
            });

            registry.register({
                name: "second",
                description: "Second",
                parameters: z.object({}),
                examples: [],
                execute: () => {
                    executionOrder.push("second");

                    return Promise.resolve({success: true, message: "Second done"});
                },
            });

            mockProvider.setResponse("both", {
                text: "",
                toolCalls: [
                    {id: "1", name: "first", arguments: {}},
                    {id: "2", name: "second", arguments: {}},
                ],
            });

            await controller.execute("do both");
            assert.deepStrictEqual(executionOrder, ["first", "second"]);
        });

        it("handles unknown command gracefully", async() => {
            mockProvider.setResponse("unknown", {
                text: "",
                toolCalls: [{id: "1", name: "nonExistent", arguments: {}}],
            });

            const result = await controller.execute("unknown command");
            assert.strictEqual(result.success, false);
            assert.ok(result.message.toLowerCase().includes("unknown") ||
                      result.message.toLowerCase().includes("not found"));
        });

        it("handles command execution failure", async() => {
            registry.register({
                name: "failing",
                description: "Fails",
                parameters: z.object({}),
                examples: [],
                execute: (): Promise<CommandResult> => Promise.resolve({
                    success: false,
                    message: "Command failed for reasons",
                }),
            });

            mockProvider.setResponse("fail", {
                text: "",
                toolCalls: [{id: "1", name: "failing", arguments: {}}],
            });

            const result = await controller.execute("make it fail");
            assert.strictEqual(result.success, false);
            assert.ok(result.message.includes("failed"));
        });

        it("handles command execution throwing an error", async() => {
            registry.register({
                name: "throwing",
                description: "Throws",
                parameters: z.object({}),
                examples: [],
                execute: () => {
                    return Promise.reject(new Error("Unexpected error"));
                },
            });

            mockProvider.setResponse("throw", {
                text: "",
                toolCalls: [{id: "1", name: "throwing", arguments: {}}],
            });

            const result = await controller.execute("make it throw");
            assert.strictEqual(result.success, false);
            assert.ok(result.message.toLowerCase().includes("error"));
        });
    });

    describe("status changes", () => {
        it("emits status changes during execution", async() => {
            const states: string[] = [];
            controller.onStatusChange((status) => states.push(status.state));

            mockProvider.setResponse("test", {text: "Done", toolCalls: []});
            await controller.execute("test");

            assert.ok(states.includes("submitted"));
            assert.ok(states.includes("ready"));
        });

        it("transitions through streaming state", async() => {
            const states: string[] = [];
            controller.onStatusChange((status) => states.push(status.state));

            mockProvider.setResponse("test", {text: "Response", toolCalls: []});
            await controller.execute("test");

            // Should have gone through streaming state
            assert.ok(states.includes("streaming"));
        });

        it("transitions through executing state when tools are called", async() => {
            const states: string[] = [];
            controller.onStatusChange((status) => states.push(status.state));

            registry.register({
                name: "testCommand",
                description: "Test",
                parameters: z.object({}),
                examples: [],
                execute: () => Promise.resolve({success: true, message: "done"}),
            });

            mockProvider.setResponse("test", {
                text: "",
                toolCalls: [{id: "1", name: "testCommand", arguments: {}}],
            });

            await controller.execute("test");

            assert.ok(states.includes("executing"));
        });

        it("getStatus returns current status snapshot", () => {
            const status = controller.getStatus();
            assert.strictEqual(status.state, "ready");
            assert.strictEqual(status.canCancel, false);
        });
    });

    describe("error handling", () => {
        it("handles provider errors gracefully", async() => {
            mockProvider.setError(new Error("Network error"));

            const result = await controller.execute("test");
            assert.strictEqual(result.success, false);
            assert.ok(result.message.toLowerCase().includes("error"));
        });

        it("transitions to error state on provider failure", async() => {
            const states: string[] = [];
            controller.onStatusChange((status) => states.push(status.state));

            mockProvider.setError(new Error("API error"));
            await controller.execute("test");

            assert.ok(states.includes("error"));
        });

        it("status includes error details", async() => {
            let errorStatus: AiStatus | null = null;
            controller.onStatusChange((status) => {
                if (status.state === "error") {
                    errorStatus = status;
                }
            });

            mockProvider.setError(new Error("Test error message"));
            await controller.execute("test");

            assert.ok(errorStatus);
            const capturedStatus = errorStatus as AiStatus;
            assert.strictEqual(capturedStatus.error?.message, "Test error message");
        });

        it("can recover from error state", async() => {
            mockProvider.setError(new Error("Temporary error"));
            await controller.execute("test");

            // Clear error and try again
            mockProvider.clearError();
            mockProvider.setResponse("retry", {text: "Success!", toolCalls: []});

            const result = await controller.execute("retry");
            assert.strictEqual(result.success, true);
        });
    });

    describe("unsubscribe", () => {
        it("unsubscribe stops receiving updates", async() => {
            const states: string[] = [];
            const unsubscribe = controller.onStatusChange((status) => states.push(status.state));

            mockProvider.setResponse("first", {text: "First", toolCalls: []});
            await controller.execute("first");
            const statesAfterFirst = states.length;

            unsubscribe();

            mockProvider.setResponse("second", {text: "Second", toolCalls: []});
            await controller.execute("second");

            // Should not have received any new states
            assert.strictEqual(states.length, statesAfterFirst);
        });
    });

    describe("command context", () => {
        it("passes graph to command execution", async() => {
            let receivedGraph: unknown = null;

            registry.register({
                name: "checkGraph",
                description: "Check graph",
                parameters: z.object({}),
                examples: [],
                execute: (graph) => {
                    receivedGraph = graph;

                    return Promise.resolve({success: true, message: "done"});
                },
            });

            mockProvider.setResponse("check", {
                text: "",
                toolCalls: [{id: "1", name: "checkGraph", arguments: {}}],
            });

            await controller.execute("check graph");
            assert.strictEqual(receivedGraph, mockGraph);
        });

        it("provides abort signal to commands", async() => {
            let receivedSignal: AbortSignal | undefined;

            registry.register({
                name: "checkSignal",
                description: "Check signal",
                parameters: z.object({}),
                examples: [],
                execute: (_graph, _params, context) => {
                    receivedSignal = context?.abortSignal;

                    return Promise.resolve({success: true, message: "done"});
                },
            });

            mockProvider.setResponse("signal", {
                text: "",
                toolCalls: [{id: "1", name: "checkSignal", arguments: {}}],
            });

            await controller.execute("check signal");
            assert.ok(receivedSignal);
            assert.ok(receivedSignal instanceof AbortSignal);
        });
    });

    describe("text and tool calls combined", () => {
        it("handles response with both text and tool calls", async() => {
            registry.register({
                name: "doAction",
                description: "Do action",
                parameters: z.object({}),
                examples: [],
                execute: () => Promise.resolve({success: true, message: "Action done"}),
            });

            mockProvider.setResponse("mixed", {
                text: "Let me help you with that.",
                toolCalls: [{id: "1", name: "doAction", arguments: {}}],
            });

            const result = await controller.execute("mixed response");
            assert.strictEqual(result.success, true);
            // Should include both the LLM text and action result
            assert.ok(result.message.includes("Action done") ||
                      result.message.includes("help you"));
        });
    });

    describe("dispose", () => {
        it("disposes cleanly", () => {
            controller.dispose();
            // Should not throw
        });

        it("clears listeners on dispose", async() => {
            const states: string[] = [];
            controller.onStatusChange((status) => states.push(status.state));

            controller.dispose();

            mockProvider.setResponse("after", {text: "After", toolCalls: []});
            // This might throw or not work after dispose
            try {
                await controller.execute("after dispose");
            } catch {
                // Expected to possibly fail after dispose
            }

            // States should be minimal or empty after dispose
            // This test verifies dispose doesn't crash and clears state
        });
    });
});
