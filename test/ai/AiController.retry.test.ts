/**
 * Tests for AI Controller retry functionality (Phase 7)
 */

import {assert, beforeEach, describe, it} from "vitest";
import {z} from "zod";

import {AiController} from "../../src/ai/AiController";
import {CommandRegistry} from "../../src/ai/commands";
import type {CommandContext, CommandResult} from "../../src/ai/commands/types";
import {MockLlmProvider} from "../../src/ai/providers/MockLlmProvider";

// Helper to create a mock graph for testing
function createMockGraph(): CommandContext["graph"] {
    return {} as CommandContext["graph"];
}

describe("AiController Retry", () => {
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

    describe("getLastInput", () => {
        it("returns null before any command is executed", () => {
            assert.strictEqual(controller.getLastInput(), null);
        });

        it("returns the last input after execution", async() => {
            mockProvider.setResponse("test command", {text: "Done", toolCalls: []});
            await controller.execute("test command");

            assert.strictEqual(controller.getLastInput(), "test command");
        });

        it("updates to latest input after multiple executions", async() => {
            mockProvider.setResponse("first", {text: "First", toolCalls: []});
            await controller.execute("first");

            mockProvider.setResponse("second", {text: "Second", toolCalls: []});
            await controller.execute("second");

            assert.strictEqual(controller.getLastInput(), "second");
        });

        it("stores input even when command fails", async() => {
            mockProvider.setError(new Error("Network error"));
            await controller.execute("failed command");

            assert.strictEqual(controller.getLastInput(), "failed command");
        });
    });

    describe("getLastError", () => {
        it("returns null when no error has occurred", async() => {
            mockProvider.setResponse("success", {text: "Done", toolCalls: []});
            await controller.execute("success");

            assert.strictEqual(controller.getLastError(), null);
        });

        it("returns the error after a failed execution", async() => {
            mockProvider.setError(new Error("Network error"));
            await controller.execute("test");

            const lastError = controller.getLastError();
            assert.ok(lastError);
            assert.ok(lastError.message.includes("Network error"));
        });

        it("clears error on successful execution", async() => {
            // First, cause an error
            mockProvider.setError(new Error("First error"));
            await controller.execute("fail");
            assert.ok(controller.getLastError());

            // Then succeed
            mockProvider.clearError();
            mockProvider.setResponse("success", {text: "Done", toolCalls: []});
            await controller.execute("success");

            assert.strictEqual(controller.getLastError(), null);
        });
    });

    describe("clearLastError", () => {
        it("clears the last error", async() => {
            mockProvider.setError(new Error("Test error"));
            await controller.execute("test");

            assert.ok(controller.getLastError());

            controller.clearLastError();

            assert.strictEqual(controller.getLastError(), null);
        });
    });

    describe("retry scenario", () => {
        it("can retry the last failed command by re-executing", async() => {
            // Register a command
            registry.register({
                name: "styleNodes",
                description: "Style nodes",
                parameters: z.object({color: z.string()}),
                examples: [],
                execute: (): Promise<CommandResult> => Promise.resolve({
                    success: true,
                    message: "Styled nodes",
                }),
            });

            // Set up error first
            mockProvider.setError(new Error("Temporary error"));
            await controller.execute("make nodes red");

            // Verify failure
            assert.ok(controller.getLastError());
            const failedInput = controller.getLastInput();
            assert.strictEqual(failedInput, "make nodes red");

            // Clear error and set success response
            mockProvider.clearError();
            mockProvider.setResponse("make nodes red", {
                text: "Done",
                toolCalls: [{id: "1", name: "styleNodes", arguments: {color: "#ff0000"}}],
            });

            // Retry by re-executing with the stored input
            assert.ok(failedInput, "Should have a failed input");
            const retryResult = await controller.execute(failedInput);

            assert.strictEqual(retryResult.success, true);
            assert.ok(retryResult.message.includes("Styled"));
        });

        it("can retry multiple times until success", async() => {
            let attemptCount = 0;

            mockProvider.setResponse("retry test", {text: "Success", toolCalls: []});

            // Override generate to fail first 2 times
            const originalGenerate = mockProvider.generate.bind(mockProvider);
            mockProvider.generate = async(messages, tools, options) => {
                attemptCount++;
                if (attemptCount < 3) {
                    throw new Error(`Attempt ${attemptCount} failed`);
                }

                return originalGenerate(messages, tools, options);
            };

            // First two attempts fail
            await controller.execute("retry test");
            assert.ok(controller.getLastError());

            const input = controller.getLastInput();
            assert.ok(input, "Should have input from previous attempt");
            await controller.execute(input);
            assert.ok(controller.getLastError());

            // Third attempt succeeds
            const result = await controller.execute(input);
            assert.strictEqual(result.success, true);
            assert.strictEqual(attemptCount, 3);
        });
    });
});
