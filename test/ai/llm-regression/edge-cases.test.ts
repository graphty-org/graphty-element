/**
 * Edge Cases LLM Regression Tests
 * @module test/ai/llm-regression/edge-cases
 *
 * Tests that verify LLM behavior for edge cases including:
 * - Ambiguous prompts that could map to multiple tools
 * - Complex prompts that may require multiple actions
 * - No-op prompts that should return text only
 * - Invalid prompts about non-existent features
 *
 * These tests validate graceful handling of challenging inputs
 * and ensure reasonable tool selection for unclear requests.
 */

import {afterEach, assert, beforeEach, describe, it} from "vitest";

import {skipIfNoApiKey} from "../../helpers/llm-regression-env";
import {LlmRegressionTestHarness} from "../../helpers/llm-regression-harness";
import {serverNetworkFixture} from "./fixtures/test-graph-fixtures";

describe.skipIf(skipIfNoApiKey())("Edge Cases LLM Regression", () => {
    let harness: LlmRegressionTestHarness;

    beforeEach(async() => {
        harness = await LlmRegressionTestHarness.create({
            graphData: serverNetworkFixture,
        });
    });

    afterEach(() => {
        harness.dispose();
    });

    describe("ambiguous prompts", () => {
        it("handles 'change the view' with reasonable tool choice", async() => {
            const result = await harness.testPrompt("change the view");

            // This is ambiguous - could be camera, layout, or dimension
            // We accept any of these reasonable interpretations
            if (result.toolWasCalled) {
                const validTools = [
                    "setCameraPosition",
                    "setLayout",
                    "setDimension",
                    "zoomToNodes",
                ];
                assert.ok(
                    result.toolName && validTools.includes(result.toolName),
                    `Expected one of ${validTools.join(", ")} but got '${result.toolName}'`,
                );
            }

            // Also acceptable: LLM asks for clarification via text response
            // In that case, toolWasCalled would be false and llmText would have content
            assert.ok(
                result.toolWasCalled || (result.llmText !== null && result.llmText.length > 0),
                "Expected either a tool call or a text response asking for clarification",
            );
        });

        it("handles 'make it pretty' with style-related tool", async() => {
            const result = await harness.testPrompt("make it pretty");

            // This is subjective - expect a styling-related tool
            if (result.toolWasCalled) {
                const styleTools = [
                    "findAndStyleNodes",
                    "findAndStyleEdges",
                    "setLayout",
                ];
                assert.ok(
                    result.toolName && styleTools.includes(result.toolName),
                    `Expected a style-related tool but got '${result.toolName}'`,
                );
            }

            // LLM might also just respond with text if it needs clarification
            assert.ok(
                result.toolWasCalled || (result.llmText !== null && result.llmText.length > 0),
                "Expected either a tool call or a text response",
            );
        });

        it("handles 'analyze the graph' with query or algorithm tool", async() => {
            const result = await harness.testPrompt("analyze the graph");

            // Could be interpreted as querying info or running an algorithm
            if (result.toolWasCalled) {
                const analysisTools = [
                    "queryGraph",
                    "runAlgorithm",
                    "sampleData",
                    "describeProperty",
                    "listAlgorithms",
                ];
                assert.ok(
                    result.toolName && analysisTools.includes(result.toolName),
                    `Expected an analysis-related tool but got '${result.toolName}'`,
                );
            }

            assert.ok(
                result.toolWasCalled || (result.llmText !== null && result.llmText.length > 0),
                "Expected either a tool call or a text response",
            );
        });
    });

    describe("complex prompts", () => {
        it("handles 'show me server nodes and make them blue'", async() => {
            const result = await harness.testPrompt("show me server nodes and make them blue");

            // This has two parts: finding and styling
            // LLM might call findAndStyleNodes (combines both) or findNodes first
            assert.ok(result.toolWasCalled, "Expected a tool to be called");
            const validTools = ["findAndStyleNodes", "findNodes"];
            assert.ok(
                result.toolName && validTools.includes(result.toolName),
                `Expected findAndStyleNodes or findNodes but got '${result.toolName}'`,
            );

            // If findAndStyleNodes, verify it has both selector and style
            if (result.toolName === "findAndStyleNodes") {
                assert.ok(result.toolParams, "Expected tool parameters");
                const selector = result.toolParams.selector as string | undefined;
                const style = result.toolParams.style as Record<string, unknown> | undefined;

                // Should reference 'server' in selector
                if (selector) {
                    assert.ok(
                        selector.toLowerCase().includes("server"),
                        `Expected selector to reference 'server' but got '${selector}'`,
                    );
                }

                // Should have color in style
                if (style) {
                    assert.ok(
                        style.color !== undefined,
                        "Expected style to include color property",
                    );
                }
            }
        });

        it("handles 'highlight nodes with high weight connections'", async() => {
            const result = await harness.testPrompt("highlight nodes with high weight connections");

            // This requires understanding edge weights and applying styles
            // Could be findAndStyleNodes, findAndStyleEdges, or a query first
            assert.ok(result.toolWasCalled, "Expected a tool to be called");
            const validTools = [
                "findAndStyleNodes",
                "findAndStyleEdges",
                "findNodes",
                "runAlgorithm",
            ];
            assert.ok(
                result.toolName && validTools.includes(result.toolName),
                `Expected a relevant tool but got '${result.toolName}'`,
            );
        });
    });

    describe("no-op prompts", () => {
        it("returns text response for 'hello'", async() => {
            const result = await harness.testPrompt("hello");

            // A greeting should not trigger any graph tool
            // LLM should respond with text
            assert.ok(result.llmText, "Expected a text response");
            assert.ok(result.llmText.length > 0, "Expected non-empty text response");

            // It's acceptable if a tool was called, but typically greetings get text responses
            // We're just verifying it doesn't crash and produces some output
        });

        it("returns text response for 'what can you do?'", async() => {
            const result = await harness.testPrompt("what can you do?");

            // Should explain capabilities, not call a tool
            assert.ok(result.llmText, "Expected a text response");
            assert.ok(result.llmText.length > 0, "Expected non-empty text response");
        });

        it("returns text response for 'thanks!'", async() => {
            const result = await harness.testPrompt("thanks!");

            // A simple acknowledgment should get text response
            assert.ok(result.llmText, "Expected a text response");
        });
    });

    describe("invalid prompts", () => {
        it("handles gracefully when asked about non-existent features", async() => {
            const result = await harness.testPrompt(
                "Enable the quantum entanglement mode for nodes",
            );

            // This feature doesn't exist - should handle gracefully
            // Either explain it's not available or try closest match
            assert.ok(
                result.llmText !== null || result.toolWasCalled,
                "Expected some response (text or tool attempt)",
            );

            // Should not throw an error
            assert.ok(result.error === undefined, "Expected no error to be thrown");
        });

        it("handles empty-ish prompts gracefully", async() => {
            const result = await harness.testPrompt("...");

            // A minimal/unclear prompt should still get a response
            assert.ok(
                result.llmText !== null || result.toolWasCalled,
                "Expected some response",
            );
            assert.ok(result.error === undefined, "Expected no error");
        });

        it("handles prompts with only special characters", async() => {
            const result = await harness.testPrompt("??? !!! ###");

            // Should handle gracefully without crashing
            assert.ok(
                result.llmText !== null || result.toolWasCalled || result.error === undefined,
                "Expected graceful handling",
            );
        });
    });

    describe("command result validation", () => {
        it("provides informative response for ambiguous prompts", async() => {
            const result = await harness.testPrompt("do something interesting");

            // Should either take action or provide guidance
            assert.ok(
                result.llmText && result.llmText.length > 5,
                "Expected informative response",
            );
        });

        it("measures latency for complex prompts", async() => {
            const result = await harness.testPrompt(
                "find database nodes, make them green, and also tell me how many edges there are",
            );

            assert.ok(result.latencyMs > 0, "Expected positive latency");
            assert.ok(result.latencyMs < 60000, "Expected latency under 60 seconds");
        });
    });
});
