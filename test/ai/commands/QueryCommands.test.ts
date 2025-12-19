/**
 * QueryCommands Tests - Tests for graph query commands.
 * @module test/ai/commands/QueryCommands.test
 */

import {assert, beforeEach, describe, it} from "vitest";

import {queryGraph} from "../../../src/ai/commands/QueryCommands";
import type {CommandContext} from "../../../src/ai/commands/types";
import type {Graph} from "../../../src/Graph";
import {createMockContext, createTestGraph} from "../../helpers/test-graph";

describe("QueryCommands", () => {
    let graph: Graph;
    let context: CommandContext;

    beforeEach(() => {
        graph = createTestGraph({nodes: 25, edges: 40});
        context = createMockContext(graph);
    });

    describe("queryGraph", () => {
        it("returns node count", async() => {
            const result = await queryGraph.execute(graph, {query: "nodeCount"}, context);
            assert.strictEqual(result.success, true);
            assert.strictEqual((result.data as {nodeCount: number}).nodeCount, 25);
        });

        it("returns edge count", async() => {
            const result = await queryGraph.execute(graph, {query: "edgeCount"}, context);
            assert.strictEqual(result.success, true);
            assert.strictEqual((result.data as {edgeCount: number}).edgeCount, 40);
        });

        it("returns current layout", async() => {
            const result = await queryGraph.execute(graph, {query: "currentLayout"}, context);
            assert.strictEqual(result.success, true);
            const data = result.data as {layout: string};
            assert.ok(typeof data.layout === "string");
        });

        it("returns all stats when query is 'all' or 'summary'", async() => {
            const result = await queryGraph.execute(graph, {query: "all"}, context);
            assert.strictEqual(result.success, true);
            const data = result.data as {nodeCount: number, edgeCount: number, layout: string};
            assert.strictEqual(data.nodeCount, 25);
            assert.strictEqual(data.edgeCount, 40);
            assert.ok(typeof data.layout === "string");
        });

        it("handles invalid query gracefully", async() => {
            const result = await queryGraph.execute(graph, {query: "invalidQuery"}, context);
            // Should either succeed with partial data or fail with helpful message
            assert.ok(result.message.length > 0);
        });
    });

    describe("queryGraph metadata", () => {
        it("has correct name", () => {
            assert.strictEqual(queryGraph.name, "queryGraph");
        });

        it("has description", () => {
            assert.ok(queryGraph.description.length > 0);
        });

        it("has parameters schema", () => {
            assert.ok(queryGraph.parameters);
        });

        it("has examples", () => {
            assert.ok(Array.isArray(queryGraph.examples));
            assert.ok(queryGraph.examples.length > 0);
        });
    });
});
