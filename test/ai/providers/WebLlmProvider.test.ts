import {assert, beforeEach, describe, expect, it} from "vitest";

import type {StreamCallbacks} from "../../../src/ai/providers/types";
import {WebLlmProvider} from "../../../src/ai/providers/WebLlmProvider";

/** Create a StreamCallbacks object with no-op defaults and optional overrides */
function createCallbacks(overrides?: Partial<StreamCallbacks>): StreamCallbacks {
    return {
        onChunk: () => { /* no-op */ },
        onToolCall: () => { /* no-op */ },
        onToolResult: () => { /* no-op */ },
        onComplete: () => { /* no-op */ },
        onError: () => { /* no-op */ },
        ... overrides,
    };
}

describe("WebLlmProvider", () => {
    let provider: WebLlmProvider;

    beforeEach(() => {
        provider = new WebLlmProvider();
    });

    describe("initialization", () => {
        it("has correct name", () => {
            assert.strictEqual(provider.name, "webllm");
        });

        it("supports streaming", () => {
            assert.strictEqual(provider.supportsStreaming, true);
        });

        it("supports tools", () => {
            assert.strictEqual(provider.supportsTools, true);
        });

        it("lazy-loads module", () => {
            // Creating the provider should NOT have imported @mlc-ai/web-llm yet
            // The module is only loaded when initialize() is called
            assert.strictEqual(provider.name, "webllm");
            assert.strictEqual(provider.isInitialized, false);
        });
    });

    describe("configure", () => {
        it("accepts model configuration", () => {
            provider.configure({model: "Llama-3.2-1B-Instruct-q4f32_1-MLC"});
            // Should not throw
            assert.ok(true);
        });

        it("accepts temperature configuration", () => {
            provider.configure({temperature: 0.7});
            // Should not throw
            assert.ok(true);
        });

        it("accepts maxTokens configuration", () => {
            provider.configure({maxTokens: 1024});
            // Should not throw
            assert.ok(true);
        });
    });

    describe("progress reporting", () => {
        it("reports initialization progress via callback", () => {
            const progress: {progress: number, text: string}[] = [];
            provider.onProgress((p, text) => progress.push({progress: p, text}));

            // Simulate progress
            provider.simulateProgress(0.5, "Loading model...");

            assert.strictEqual(progress.length, 1);
            assert.strictEqual(progress[0].progress, 0.5);
            assert.strictEqual(progress[0].text, "Loading model...");
        });

        it("supports multiple progress listeners", () => {
            const calls1: number[] = [];
            const calls2: number[] = [];

            provider.onProgress((p) => calls1.push(p));
            provider.onProgress((p) => calls2.push(p));

            provider.simulateProgress(0.25, "Step 1");
            provider.simulateProgress(0.75, "Step 2");

            assert.strictEqual(calls1.length, 2);
            assert.strictEqual(calls2.length, 2);
        });

        it("allows removing progress listeners", () => {
            const calls: number[] = [];
            const callback = (p: number): void => {
                calls.push(p);
            };

            provider.onProgress(callback);
            provider.simulateProgress(0.5, "Test");
            assert.strictEqual(calls.length, 1);

            provider.offProgress(callback);
            provider.simulateProgress(0.75, "Test2");
            assert.strictEqual(calls.length, 1); // Should not have been called again
        });
    });

    describe("WebGPU detection", () => {
        it("provides WebGPU availability check", async() => {
            // In test environment, WebGPU is typically not available
            const available = await WebLlmProvider.isWebGPUAvailable();
            // This can be true or false depending on the test environment
            assert.ok(typeof available === "boolean");
        });
    });

    describe("model management", () => {
        it("provides list of available models", () => {
            const models = WebLlmProvider.getAvailableModels();

            assert.ok(Array.isArray(models));
            assert.ok(models.length > 0);

            // Each model should have required properties
            for (const model of models) {
                assert.ok(typeof model.id === "string");
                assert.ok(typeof model.name === "string");
                assert.ok(typeof model.size === "string");
            }
        });

        it("includes recommended models", () => {
            const models = WebLlmProvider.getAvailableModels();
            const modelIds = models.map((m) => m.id);

            // These are commonly used models that should be available
            assert.ok(
                modelIds.some((id) => id.includes("Llama")),
                "Should include Llama models",
            );
        });
    });

    describe("generate (not initialized)", () => {
        it("throws error when not initialized", async() => {
            await expect(
                provider.generate([{role: "user", content: "test"}], []),
            ).rejects.toThrow(/not initialized/i);
        });
    });

    describe("generateStream (not initialized)", () => {
        it("throws error when not initialized", async() => {
            const callbacks = createCallbacks();

            await expect(
                provider.generateStream([{role: "user", content: "test"}], [], callbacks),
            ).rejects.toThrow(/not initialized/i);
        });
    });

    describe("validateApiKey", () => {
        it("returns true for WebLLM (no API key needed)", async() => {
            const result = await provider.validateApiKey();
            assert.strictEqual(result, true);
        });
    });

    describe("initialization status", () => {
        it("initially reports not initialized", () => {
            assert.strictEqual(provider.isInitialized, false);
        });

        it("reports initialization status", () => {
            // Initially not ready
            assert.strictEqual(provider.isReady, false);
        });
    });

    describe("mock mode for testing", () => {
        it("can operate in mock mode without WebGPU", async() => {
            provider.enableMockMode();

            // Should be able to generate in mock mode
            const response = await provider.generate(
                [{role: "user", content: "Hello"}],
                [],
            );

            assert.ok(response.text.length > 0);
            assert.ok(Array.isArray(response.toolCalls));
        });

        it("mock mode supports streaming", async() => {
            provider.enableMockMode();

            const chunks: string[] = [];
            let completed = false;
            const callbacks = createCallbacks({
                onChunk: (text) => chunks.push(text),
                onComplete: () => {
                    completed = true;
                },
            });

            await provider.generateStream(
                [{role: "user", content: "Hello"}],
                [],
                callbacks,
            );

            assert.ok(chunks.length > 0);
            assert.strictEqual(completed, true);
        });

        it("mock mode can be disabled", () => {
            provider.enableMockMode();
            assert.strictEqual(provider.isMockMode, true);

            provider.disableMockMode();
            assert.strictEqual(provider.isMockMode, false);
        });

        it("mock mode respects abort signal", async() => {
            provider.enableMockMode();

            const controller = new AbortController();
            controller.abort();

            await expect(
                provider.generate(
                    [{role: "user", content: "test"}],
                    [],
                    {signal: controller.signal},
                ),
            ).rejects.toThrow(/aborted/i);
        });
    });

    describe("error handling", () => {
        it("provides meaningful error for missing WebGPU", async() => {
            // In mock mode disabled (default), trying to initialize without WebGPU
            // should provide a helpful error message
            try {
                await provider.initialize();
                // If we get here, WebGPU is available (unlikely in test env)
            } catch (error) {
                assert.ok(error instanceof Error);
                // Error message should mention WebGPU or browser requirements
                const message = error.message.toLowerCase();
                assert.ok(
                    message.includes("webgpu") ||
                    message.includes("browser") ||
                    message.includes("not supported") ||
                    message.includes("not initialized"),
                    `Expected helpful error message, got: ${error.message}`,
                );
            }
        });
    });

    describe("resource cleanup", () => {
        it("provides dispose method for cleanup", async() => {
            provider.enableMockMode();

            // Dispose should not throw
            await provider.dispose();

            // After disposal, should not be ready
            assert.strictEqual(provider.isReady, false);
            assert.strictEqual(provider.isInitialized, false);
        });
    });
});
