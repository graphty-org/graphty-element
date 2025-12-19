/**
 * Algorithm Commands LLM Regression Tests
 * @module test/ai/llm-regression/algorithm-commands
 *
 * Tests that verify LLMs correctly call algorithm commands (listAlgorithms, runAlgorithm)
 * in response to natural language prompts.
 *
 * These tests run against real LLM APIs and verify correct tool selection
 * and parameter extraction for graph algorithm operations.
 */

import {afterEach, assert, beforeEach, describe, it} from "vitest";

import {skipIfNoApiKey} from "../../helpers/llm-regression-env";
import {LlmRegressionTestHarness} from "../../helpers/llm-regression-harness";
import {serverNetworkFixture} from "./fixtures/test-graph-fixtures";

/**
 * Valid algorithm types that the LLM might suggest.
 * Maps common algorithm names to their recognized variants.
 */
const ALGORITHM_SYNONYMS: Record<string, string[]> = {
    "degree": ["degree", "degree-centrality", "degreecentrality"],
    "pagerank": ["pagerank", "page-rank", "page_rank"],
    "connected-components": ["connected-components", "connectedcomponents", "components", "connected"],
    "betweenness": ["betweenness", "betweenness-centrality", "betweennesscentrality"],
    "closeness": ["closeness", "closeness-centrality", "closenesscentrality"],
};

/**
 * Check if an algorithm type matches any of the expected synonyms.
 *
 * @param actual - The actual algorithm type from the LLM
 * @param expected - The base expected algorithm type
 * @returns True if the algorithm matches expected or its synonyms
 */
function isValidAlgorithmType(actual: unknown, expected: string): boolean {
    if (typeof actual !== "string") {
        return false;
    }

    const normalizedActual = actual.toLowerCase().trim().replace(/[_-]/g, "");
    const normalizedExpected = expected.toLowerCase().trim().replace(/[_-]/g, "");

    // Direct match
    if (normalizedActual === normalizedExpected) {
        return true;
    }

    // Check synonyms for expected algorithm
    const synonyms = ALGORITHM_SYNONYMS[normalizedExpected] as string[] | undefined;
    if (synonyms?.some((s) => normalizedActual.includes(s.replace(/[_-]/g, "")))) {
        return true;
    }

    // Also check if actual matches any synonym (case-insensitive)
    for (const [, syns] of Object.entries(ALGORITHM_SYNONYMS)) {
        if (syns.some((s) => s.replace(/[_-]/g, "") === normalizedActual)) {
            // Found a match - check if it belongs to expected
            const expectedSynonyms = ALGORITHM_SYNONYMS[normalizedExpected] as string[] | undefined;
            if (expectedSynonyms?.some((es) => es.replace(/[_-]/g, "") === normalizedActual)) {
                return true;
            }
        }
    }

    return false;
}

describe.skipIf(skipIfNoApiKey())("Algorithm Commands LLM Regression", () => {
    let harness: LlmRegressionTestHarness;

    beforeEach(async() => {
        harness = await LlmRegressionTestHarness.create({
            graphData: serverNetworkFixture,
        });
    });

    afterEach(() => {
        harness.dispose();
    });

    describe("listAlgorithms", () => {
        it("calls listAlgorithms for 'What algorithms are available?'", async() => {
            const result = await harness.testPrompt("What algorithms are available?");

            assert.ok(result.toolWasCalled, "Expected a tool to be called");
            assert.strictEqual(result.toolName, "listAlgorithms");
            // listAlgorithms may or may not have parameters (namespace is optional)
            // The command should work with an empty params object
        });

        it("calls listAlgorithms for 'List graphty algorithms'", async() => {
            const result = await harness.testPrompt("List graphty algorithms");

            assert.ok(result.toolWasCalled, "Expected a tool to be called");
            assert.strictEqual(result.toolName, "listAlgorithms");
            assert.ok(result.toolParams, "Expected tool parameters");

            // The LLM should recognize 'graphty' as a namespace
            // It might pass namespace: "graphty" or leave it empty
            // Both are acceptable as the command handles both cases
        });
    });

    describe("runAlgorithm", () => {
        it("calls runAlgorithm for 'Calculate the degree of each node'", async() => {
            const result = await harness.testPrompt("Calculate the degree of each node");

            assert.ok(result.toolWasCalled, "Expected a tool to be called");
            assert.strictEqual(result.toolName, "runAlgorithm");
            assert.ok(result.toolParams, "Expected tool parameters");

            // Verify algorithm type is degree (or a synonym)
            assert.ok(
                isValidAlgorithmType(result.toolParams.type, "degree"),
                `Expected algorithm type 'degree' but got '${String(result.toolParams.type)}'`,
            );

            // Namespace should typically be 'graphty'
            if (result.toolParams.namespace) {
                assert.ok(
                    typeof result.toolParams.namespace === "string",
                    "Namespace should be a string",
                );
            }
        });

        it("calls runAlgorithm for 'Run pagerank'", async() => {
            const result = await harness.testPrompt("Run pagerank");

            assert.ok(result.toolWasCalled, "Expected a tool to be called");
            assert.strictEqual(result.toolName, "runAlgorithm");
            assert.ok(result.toolParams, "Expected tool parameters");

            // Verify algorithm type is pagerank
            assert.ok(
                isValidAlgorithmType(result.toolParams.type, "pagerank"),
                `Expected algorithm type 'pagerank' but got '${String(result.toolParams.type)}'`,
            );
        });

        it("calls runAlgorithm for 'Run connected components algorithm'", async() => {
            const result = await harness.testPrompt("Run the connected components algorithm on this graph");

            assert.ok(result.toolWasCalled, "Expected a tool to be called");
            assert.strictEqual(result.toolName, "runAlgorithm");
            assert.ok(result.toolParams, "Expected tool parameters");

            // Verify algorithm type is connected-components or similar
            assert.ok(
                isValidAlgorithmType(result.toolParams.type, "connected-components"),
                `Expected algorithm type related to 'connected-components' but got '${String(result.toolParams.type)}'`,
            );
        });
    });

    describe("command result validation", () => {
        it("returns command result for listAlgorithms", async() => {
            const result = await harness.testPrompt("Show me all available graph analysis algorithms");

            assert.ok(result.toolWasCalled, "Expected listAlgorithms to be called");
            assert.strictEqual(result.toolName, "listAlgorithms");

            // Command result should exist
            assert.ok(result.commandResult, "Expected command result");
            assert.ok(result.commandResult.message, "Expected result message");
        });

        it("returns command result for runAlgorithm", async() => {
            const result = await harness.testPrompt("Analyze the graph using degree centrality");

            assert.ok(result.toolWasCalled, "Expected runAlgorithm to be called");
            assert.strictEqual(result.toolName, "runAlgorithm");

            // Command result should exist
            assert.ok(result.commandResult, "Expected command result");
            assert.ok(result.commandResult.message, "Expected result message");
        });

        it("tracks latency for algorithm commands", async() => {
            const result = await harness.testPrompt("What graph algorithms can I use?");

            assert.ok(result.latencyMs > 0, "Expected positive latency");
            assert.ok(result.latencyMs < 60000, "Expected latency under 60 seconds");
        });

        it("captures token usage for algorithm commands", async() => {
            const result = await harness.testPrompt("Run the degree algorithm on the graph");

            // Token usage may not always be available depending on provider configuration
            if (result.tokenUsage) {
                assert.ok(result.tokenUsage.prompt > 0, "Expected positive prompt tokens");
                assert.ok(result.tokenUsage.completion >= 0, "Expected non-negative completion tokens");
            }
        });
    });
});
