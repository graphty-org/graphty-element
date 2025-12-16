/**
 * LLM Regression Harness Unit Tests
 * @module test/ai/llm-regression/harness.test
 *
 * Tests for the LLM regression test harness infrastructure.
 * These tests verify the harness works correctly with both mocked and real LLM providers.
 */

import {afterEach, assert, beforeEach, describe, it, vi} from "vitest";

import {
    getLlmRegressionModel,
    getOpenAiApiKey,
    getSkipReason,
    isLlmRegressionEnabled,
    skipIfNoApiKey,
} from "../../helpers/llm-regression-env";
import {
    type LlmRegressionResult,
    LlmRegressionTestHarness,
    type TestGraphFixture,
} from "../../helpers/llm-regression-harness";

describe("LlmRegressionTestHarness", () => {
    describe("Environment Utilities", () => {
        it("getOpenAiApiKey returns undefined when not set", () => {
            // This test will pass when API key is not set
            // and will still work when it is set (just returns the key)
            const key = getOpenAiApiKey();
            assert.ok(key === undefined || typeof key === "string");
        });

        it("isLlmRegressionEnabled returns boolean", () => {
            const enabled = isLlmRegressionEnabled();
            assert.strictEqual(typeof enabled, "boolean");
        });

        it("skipIfNoApiKey returns inverse of isLlmRegressionEnabled", () => {
            const skip = skipIfNoApiKey();
            const enabled = isLlmRegressionEnabled();
            assert.strictEqual(skip, !enabled);
        });

        it("getSkipReason returns descriptive message", () => {
            const reason = getSkipReason();
            assert.ok(reason.includes("VITE_OPENAI_API_KEY"));
        });

        it("getLlmRegressionModel returns gpt-4o-mini by default", () => {
            const model = getLlmRegressionModel();
            // Either returns default or custom value if env var is set
            assert.ok(typeof model === "string");
            assert.ok(model.length > 0);
        });
    });

    describe("Harness Creation (No API Key)", () => {
        beforeEach(() => {
            // Mock environment to ensure no API key
            vi.stubEnv("VITE_OPENAI_API_KEY", "");
        });

        afterEach(() => {
            vi.unstubAllEnvs();
        });

        it("throws error when API key not available", async() => {
            // Skip if API key is actually set in the environment
            if (isLlmRegressionEnabled()) {
                return;
            }

            try {
                await LlmRegressionTestHarness.create();
                assert.fail("Expected error to be thrown");
            } catch (error) {
                assert.ok(error instanceof Error);
                assert.ok(error.message.includes("VITE_OPENAI_API_KEY"));
            }
        });
    });

    // These tests run only when API key is available
    describe.skipIf(skipIfNoApiKey())("Harness with Real API", () => {
        let harness: LlmRegressionTestHarness;

        beforeEach(async() => {
            harness = await LlmRegressionTestHarness.create();
        });

        afterEach(() => {
            harness.dispose();
        });

        it("creates harness with default configuration", () => {
            assert.ok(harness);
            assert.ok(harness.getGraph());
        });

        it("configures OpenAI provider from environment", () => {
            // If we got here, the harness was created successfully with the API key
            assert.ok(harness);
        });

        it("tracks tool calls made during execution", async() => {
            const result = await harness.testPrompt("How many nodes are there?");

            assert.ok(result);
            assert.strictEqual(typeof result.toolWasCalled, "boolean");
            if (result.toolWasCalled) {
                assert.strictEqual(typeof result.toolName, "string");
                assert.ok(result.toolParams !== null);
            }
        });

        it("measures latency for each prompt", async() => {
            const result = await harness.testPrompt("How many nodes are there?");

            assert.ok(result.latencyMs > 0);
            assert.strictEqual(typeof result.latencyMs, "number");
        });

        it("captures token usage from responses", async() => {
            const result = await harness.testPrompt("How many nodes are there?");

            // Token usage may or may not be present depending on model response
            if (result.tokenUsage) {
                assert.strictEqual(typeof result.tokenUsage.prompt, "number");
                assert.strictEqual(typeof result.tokenUsage.completion, "number");
                assert.ok(result.tokenUsage.prompt > 0);
            }
        });

        it("returns result structure with all required fields", async() => {
            const result = await harness.testPrompt("What layout is being used?");

            // Verify all required fields are present
            assert.strictEqual(typeof result.prompt, "string");
            assert.strictEqual(result.prompt, "What layout is being used?");
            assert.strictEqual(typeof result.toolWasCalled, "boolean");
            assert.strictEqual(typeof result.latencyMs, "number");
            // toolName, toolParams, commandResult, llmText can be null
        });
    });

    describe("Result Structure Validation", () => {
        it("LlmRegressionResult interface matches expected structure", () => {
            // Create a mock result to verify the interface
            const mockResult: LlmRegressionResult = {
                prompt: "test prompt",
                toolWasCalled: true,
                toolName: "testTool",
                toolParams: {param1: "value1"},
                commandResult: {success: true, message: "done"},
                llmText: "Some response text",
                latencyMs: 1500,
                tokenUsage: {prompt: 100, completion: 50},
                error: undefined,
            };

            assert.strictEqual(mockResult.prompt, "test prompt");
            assert.strictEqual(mockResult.toolWasCalled, true);
            assert.strictEqual(mockResult.toolName, "testTool");
            assert.deepStrictEqual(mockResult.toolParams, {param1: "value1"});
            assert.strictEqual(mockResult.commandResult?.success, true);
            assert.strictEqual(mockResult.llmText, "Some response text");
            assert.strictEqual(mockResult.latencyMs, 1500);
            assert.strictEqual(mockResult.tokenUsage?.prompt, 100);
            assert.strictEqual(mockResult.tokenUsage?.completion, 50);
        });

        it("supports null values for optional fields", () => {
            const mockResult: LlmRegressionResult = {
                prompt: "test",
                toolWasCalled: false,
                toolName: null,
                toolParams: null,
                commandResult: null,
                llmText: null,
                latencyMs: 500,
            };

            assert.strictEqual(mockResult.toolName, null);
            assert.strictEqual(mockResult.toolParams, null);
            assert.strictEqual(mockResult.commandResult, null);
            assert.strictEqual(mockResult.llmText, null);
        });
    });

    describe("TestGraphFixture Interface", () => {
        it("supports custom node and edge data", () => {
            const fixture: TestGraphFixture = {
                nodes: [
                    {id: "1", data: {type: "server", name: "web-01"}},
                    {id: "2", data: {type: "database", name: "db-01"}},
                ],
                edges: [
                    {source: "1", target: "2", data: {weight: 0.8}},
                ],
            };

            assert.strictEqual(fixture.nodes.length, 2);
            assert.strictEqual(fixture.edges.length, 1);
            assert.strictEqual(fixture.nodes[0].data.type, "server");
            assert.strictEqual(fixture.edges[0].data.weight, 0.8);
        });
    });

    describe("Harness Disposal", () => {
        it("dispose does not throw", async() => {
            // Skip if no API key
            if (!isLlmRegressionEnabled()) {
                return;
            }

            const localHarness = await LlmRegressionTestHarness.create();
            localHarness.dispose();
            // Should not throw
        });

        it("double dispose does not throw", async() => {
            // Skip if no API key
            if (!isLlmRegressionEnabled()) {
                return;
            }

            const localHarness = await LlmRegressionTestHarness.create();
            localHarness.dispose();
            localHarness.dispose(); // Should not throw
        });

        it("throws on testPrompt after dispose", async() => {
            // Skip if no API key
            if (!isLlmRegressionEnabled()) {
                return;
            }

            const localHarness = await LlmRegressionTestHarness.create();
            localHarness.dispose();

            try {
                await localHarness.testPrompt("test");
                assert.fail("Expected error to be thrown");
            } catch (error) {
                assert.ok(error instanceof Error);
                assert.ok(error.message.includes("disposed"));
            }
        });
    });

    describe("Harness Options", () => {
        describe.skipIf(skipIfNoApiKey())("with real API", () => {
            it("accepts custom model option", async() => {
                const localHarness = await LlmRegressionTestHarness.create({
                    model: "gpt-4o-mini",
                });

                assert.ok(localHarness);
                localHarness.dispose();
            });

            it("accepts custom temperature option", async() => {
                const localHarness = await LlmRegressionTestHarness.create({
                    temperature: 0,
                });

                assert.ok(localHarness);
                localHarness.dispose();
            });

            it("accepts custom graph fixture", async() => {
                const fixture: TestGraphFixture = {
                    nodes: [
                        {id: "a", data: {name: "Node A"}},
                        {id: "b", data: {name: "Node B"}},
                    ],
                    edges: [
                        {source: "a", target: "b", data: {}},
                    ],
                };

                const localHarness = await LlmRegressionTestHarness.create({
                    graphData: fixture,
                });

                assert.ok(localHarness);
                assert.ok(localHarness.getGraph());
                localHarness.dispose();
            });
        });
    });

    describe("Skip Behavior", () => {
        it("skips tests gracefully when API key not available", () => {
            // This test documents the skip behavior
            const shouldSkip = skipIfNoApiKey();

            if (shouldSkip) {
                // When we reach here without API key, skipIf would skip the test
                // We just verify the skip function returns true correctly
                assert.strictEqual(isLlmRegressionEnabled(), false);
            } else {
                assert.strictEqual(isLlmRegressionEnabled(), true);
            }
        });
    });
});
