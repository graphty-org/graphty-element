/**
 * Query Commands LLM Regression Tests
 * @module test/ai/llm-regression/query-commands
 *
 * Tests that verify LLMs correctly call query commands (queryGraph, findNodes,
 * sampleData, describeProperty) in response to natural language prompts.
 *
 * These tests run against real LLM APIs and verify correct tool selection
 * and parameter extraction.
 */

import {afterEach, assert, beforeEach, describe, it} from "vitest";

import {skipIfNoApiKey} from "../../helpers/llm-regression-env";
import {LlmRegressionTestHarness} from "../../helpers/llm-regression-harness";
import {serverNetworkFixture} from "./fixtures/test-graph-fixtures";

describe.skipIf(skipIfNoApiKey())("Query Commands LLM Regression", () => {
    let harness: LlmRegressionTestHarness;

    beforeEach(async() => {
        harness = await LlmRegressionTestHarness.create({
            graphData: serverNetworkFixture,
        });
    });

    afterEach(() => {
        harness.dispose();
    });

    describe("queryGraph", () => {
        it("calls queryGraph for 'How many nodes are there?'", async() => {
            const result = await harness.testPrompt("How many nodes are there?");

            assert.ok(result.toolWasCalled, "Expected a tool to be called");
            assert.strictEqual(result.toolName, "queryGraph");
            assert.ok(result.toolParams, "Expected tool parameters");
            // Accept various query types that would give node count
            const query = result.toolParams.query as string;
            assert.ok(
                query === "nodeCount" || query === "summary" || query === "all",
                `Expected query to be 'nodeCount', 'summary', or 'all' but got '${query}'`,
            );
        });

        it("calls queryGraph for 'How many edges exist?'", async() => {
            const result = await harness.testPrompt("How many edges exist?");

            assert.ok(result.toolWasCalled, "Expected a tool to be called");
            assert.strictEqual(result.toolName, "queryGraph");
            assert.ok(result.toolParams, "Expected tool parameters");
            const query = result.toolParams.query as string;
            assert.ok(
                query === "edgeCount" || query === "summary" || query === "all",
                `Expected query to be 'edgeCount', 'summary', or 'all' but got '${query}'`,
            );
        });

        it("calls queryGraph for 'What layout is being used?'", async() => {
            const result = await harness.testPrompt("What layout is being used?");

            assert.ok(result.toolWasCalled, "Expected a tool to be called");
            assert.strictEqual(result.toolName, "queryGraph");
            assert.ok(result.toolParams, "Expected tool parameters");
            const query = result.toolParams.query as string;
            assert.ok(
                query === "currentLayout" || query === "summary" || query === "all",
                `Expected query to be 'currentLayout', 'summary', or 'all' but got '${query}'`,
            );
        });

        it("calls queryGraph for 'Give me a summary of the graph'", async() => {
            const result = await harness.testPrompt("Give me a summary of the graph");

            assert.ok(result.toolWasCalled, "Expected a tool to be called");
            assert.strictEqual(result.toolName, "queryGraph");
            assert.ok(result.toolParams, "Expected tool parameters");
            const query = result.toolParams.query as string;
            assert.ok(
                query === "summary" || query === "all",
                `Expected query to be 'summary' or 'all' but got '${query}'`,
            );
        });
    });

    describe("findNodes", () => {
        it("calls findNodes for 'Find all server nodes'", async() => {
            const result = await harness.testPrompt("Find all server nodes");

            assert.ok(result.toolWasCalled, "Expected a tool to be called");
            assert.strictEqual(result.toolName, "findNodes");
            assert.ok(result.toolParams, "Expected tool parameters");
            // Verify selector targets server type
            const selector = result.toolParams.selector as string;
            assert.ok(
                selector.includes("server"),
                `Expected selector to include 'server' but got '${selector}'`,
            );
        });

        it("calls findNodes for 'Show nodes with type database'", async() => {
            const result = await harness.testPrompt("Show nodes with type database");

            assert.ok(result.toolWasCalled, "Expected a tool to be called");
            assert.strictEqual(result.toolName, "findNodes");
            assert.ok(result.toolParams, "Expected tool parameters");
            // Verify selector targets database type
            const selector = result.toolParams.selector as string;
            assert.ok(
                selector.includes("database"),
                `Expected selector to include 'database' but got '${selector}'`,
            );
        });
    });

    describe("sampleData", () => {
        it("calls sampleData for 'Show me some example nodes'", async() => {
            const result = await harness.testPrompt("Show me some example nodes");

            assert.ok(result.toolWasCalled, "Expected a tool to be called");
            assert.strictEqual(result.toolName, "sampleData");
            assert.ok(result.toolParams, "Expected tool parameters");
            // Target should be 'nodes' or 'both'
            const target = result.toolParams.target as string | undefined;
            if (target) {
                assert.ok(
                    target === "nodes" || target === "both",
                    `Expected target to be 'nodes' or 'both' but got '${target}'`,
                );
            }
        });

        it("calls sampleData for 'Show 5 sample edges'", async() => {
            const result = await harness.testPrompt("Show 5 sample edges");

            assert.ok(result.toolWasCalled, "Expected a tool to be called");
            assert.strictEqual(result.toolName, "sampleData");
            assert.ok(result.toolParams, "Expected tool parameters");
            // Target should be 'edges' or 'both'
            const target = result.toolParams.target as string | undefined;
            if (target) {
                assert.ok(
                    target === "edges" || target === "both",
                    `Expected target to be 'edges' or 'both' but got '${target}'`,
                );
            }

            // Check count if provided (should be around 5)
            const count = result.toolParams.count as number | undefined;
            if (count !== undefined) {
                assert.ok(
                    count >= 3 && count <= 7,
                    `Expected count to be around 5 but got ${count}`,
                );
            }
        });
    });

    describe("describeProperty", () => {
        it("calls describeProperty for 'What values does type have?'", async() => {
            const result = await harness.testPrompt("What values does the type property have?");

            assert.ok(result.toolWasCalled, "Expected a tool to be called");
            assert.strictEqual(result.toolName, "describeProperty");
            assert.ok(result.toolParams, "Expected tool parameters");
            // Property should be 'type' or include 'type'
            const property = result.toolParams.property as string;
            assert.ok(
                property === "type" || property.includes("type"),
                `Expected property to be or include 'type' but got '${property}'`,
            );
        });

        it("calls describeProperty for 'Analyze the weight property on edges'", async() => {
            const result = await harness.testPrompt("Analyze the weight property on edges");

            assert.ok(result.toolWasCalled, "Expected a tool to be called");
            assert.strictEqual(result.toolName, "describeProperty");
            assert.ok(result.toolParams, "Expected tool parameters");
            // Property should be 'weight'
            const property = result.toolParams.property as string;
            assert.ok(
                property === "weight" || property.includes("weight"),
                `Expected property to be or include 'weight' but got '${property}'`,
            );
            // Target should be 'edges'
            const target = result.toolParams.target as string | undefined;
            if (target) {
                assert.strictEqual(target, "edges");
            }
        });
    });

    describe("command result validation", () => {
        it("returns successful command result for queryGraph", async() => {
            const result = await harness.testPrompt("How many nodes are there?");

            assert.ok(result.commandResult, "Expected command result");
            assert.strictEqual(result.commandResult.success, true);
            assert.ok(result.commandResult.message, "Expected result message");
            // Verify the message contains node count information
            assert.ok(
                result.commandResult.message.includes("node") ||
                result.commandResult.message.includes("Node"),
                "Expected message to mention nodes",
            );
        });

        it("returns successful command result for findNodes", async() => {
            const result = await harness.testPrompt("Find all server nodes");

            assert.ok(result.commandResult, "Expected command result");
            assert.strictEqual(result.commandResult.success, true);
            assert.ok(result.commandResult.message, "Expected result message");
        });

        it("tracks latency for each prompt", async() => {
            const result = await harness.testPrompt("How many edges exist?");

            assert.ok(result.latencyMs > 0, "Expected positive latency");
            assert.ok(result.latencyMs < 60000, "Expected latency under 60 seconds");
        });

        it("captures token usage when available", async() => {
            const result = await harness.testPrompt("Give me a summary of the graph");

            // Token usage may not always be available depending on provider configuration
            if (result.tokenUsage) {
                assert.ok(result.tokenUsage.prompt > 0, "Expected positive prompt tokens");
                assert.ok(result.tokenUsage.completion >= 0, "Expected non-negative completion tokens");
            }
        });
    });
});
