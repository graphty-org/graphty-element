/**
 * SchemaCommands sampleData Tests - Tests for the sampleData command.
 * @module test/ai/commands/SchemaCommands.sampleData.test
 */

import {assert, beforeEach, describe, it} from "vitest";

import {sampleData} from "../../../src/ai/commands/SchemaCommands";
import type {CommandContext} from "../../../src/ai/commands/types";
import type {Graph} from "../../../src/Graph";
import {createMockContext, createTestGraph} from "../../helpers/test-graph";

describe("sampleData command", () => {
    let graph: Graph;
    let context: CommandContext;

    beforeEach(() => {
        graph = createTestGraph({nodes: 25, edges: 40});
        context = createMockContext(graph);
    });

    describe("basic functionality", () => {
        it("returns specified number of node samples", async() => {
            const result = await sampleData.execute(graph, {target: "nodes", count: 3}, context);
            assert.strictEqual(result.success, true);
            const data = result.data as {nodes: unknown[]};
            assert.ok(Array.isArray(data.nodes));
            assert.strictEqual(data.nodes.length, 3);
        });

        it("returns specified number of edge samples", async() => {
            const result = await sampleData.execute(graph, {target: "edges", count: 5}, context);
            assert.strictEqual(result.success, true);
            const data = result.data as {edges: unknown[]};
            assert.ok(Array.isArray(data.edges));
            assert.strictEqual(data.edges.length, 5);
        });

        it("returns both nodes and edges by default", async() => {
            const result = await sampleData.execute(graph, {}, context);
            assert.strictEqual(result.success, true);
            const data = result.data as {nodes: unknown[], edges: unknown[]};
            assert.ok(Array.isArray(data.nodes));
            assert.ok(Array.isArray(data.edges));
        });

        it("respects count parameter", async() => {
            const result = await sampleData.execute(graph, {count: 2}, context);
            assert.strictEqual(result.success, true);
            const data = result.data as {nodes: unknown[], edges: unknown[]};
            assert.strictEqual(data.nodes.length, 2);
            assert.strictEqual(data.edges.length, 2);
        });

        it("handles count larger than available items", async() => {
            // Graph has 25 nodes
            const result = await sampleData.execute(graph, {target: "nodes", count: 50}, context);
            assert.strictEqual(result.success, true);
            const data = result.data as {nodes: unknown[]};
            // Should return all available nodes, not 50
            assert.strictEqual(data.nodes.length, 25);
        });
    });

    describe("node samples", () => {
        it("includes node ID and data in samples", async() => {
            const result = await sampleData.execute(graph, {target: "nodes", count: 1}, context);
            assert.strictEqual(result.success, true);
            const data = result.data as {nodes: {id: string, data: Record<string, unknown>}[]};
            assert.strictEqual(data.nodes.length, 1);
            const node = data.nodes[0];
            assert.ok(typeof node.id === "string");
            assert.ok(typeof node.data === "object");
        });
    });

    describe("edge samples", () => {
        it("includes edge ID, source, target, and data", async() => {
            const result = await sampleData.execute(graph, {target: "edges", count: 1}, context);
            assert.strictEqual(result.success, true);
            const data = result.data as {edges: {id: string, source: string, target: string, data: Record<string, unknown>}[]};
            assert.strictEqual(data.edges.length, 1);
            const edge = data.edges[0];
            assert.ok(typeof edge.id === "string");
            assert.ok(typeof edge.source === "string");
            assert.ok(typeof edge.target === "string");
            assert.ok(typeof edge.data === "object");
        });
    });

    describe("stratified sampling", () => {
        it("performs stratified sampling when stratifyBy specified", async() => {
            const result = await sampleData.execute(graph, {target: "nodes", count: 6, stratifyBy: "data.type"}, context);
            assert.strictEqual(result.success, true);
            const data = result.data as {nodes: {id: string, data: Record<string, unknown>}[]};
            // Graph has 3 node types (server, client, router) with roughly equal distribution
            // Stratified sampling should try to get samples from each type
            assert.ok(data.nodes.length > 0);
            assert.ok(data.nodes.length <= 6);
        });

        it("handles stratifyBy on non-existent property gracefully", async() => {
            const result = await sampleData.execute(graph, {target: "nodes", count: 3, stratifyBy: "nonexistent.prop"}, context);
            // Should still succeed, just without proper stratification
            assert.strictEqual(result.success, true);
            const data = result.data as {nodes: unknown[]};
            assert.ok(data.nodes.length > 0);
        });
    });

    describe("value truncation", () => {
        it("truncates long string values in output", async() => {
            // Create a graph with long string values
            const graphWithLongStrings = createTestGraph({nodes: 5, edges: 5});
            const dataManager = graphWithLongStrings.getDataManager();

            // Add a node with a very long string value
            const nodes = Array.from(dataManager.nodes.values());
            if (nodes[0]) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (nodes[0].data as any).longDescription = "x".repeat(500);
            }

            const result = await sampleData.execute(graphWithLongStrings, {target: "nodes", count: 5}, context);
            assert.strictEqual(result.success, true);

            // Verify the result message doesn't contain the full 500-char string
            // The truncation should happen in the data representation
            const data = result.data as {nodes: {data: Record<string, unknown>}[]};
            const nodeWithLong = data.nodes.find((n) => n.data.longDescription);
            if (nodeWithLong) {
                const desc = nodeWithLong.data.longDescription as string;
                assert.ok(desc.length <= 103, "Long string should be truncated (100 chars + '...')");
            }
        });
    });

    describe("command metadata", () => {
        it("has correct command metadata (name, description, examples)", () => {
            assert.strictEqual(sampleData.name, "sampleData");
            assert.ok(sampleData.description.length > 0);
            assert.ok(Array.isArray(sampleData.examples));
            assert.ok(sampleData.examples.length > 0);

            // Verify examples have correct structure
            for (const example of sampleData.examples) {
                assert.ok(typeof example.input === "string");
                assert.ok(typeof example.params === "object");
            }
        });

        it("has parameters schema", () => {
            assert.ok(sampleData.parameters);
        });
    });

    describe("edge cases", () => {
        it("handles empty graph", async() => {
            const emptyGraph = createTestGraph({nodes: 0, edges: 0});
            const result = await sampleData.execute(emptyGraph, {}, context);
            assert.strictEqual(result.success, true);
            const data = result.data as {nodes: unknown[], edges: unknown[]};
            assert.strictEqual(data.nodes.length, 0);
            assert.strictEqual(data.edges.length, 0);
        });

        it("uses default count when not specified", async() => {
            const result = await sampleData.execute(graph, {target: "nodes"}, context);
            assert.strictEqual(result.success, true);
            const data = result.data as {nodes: unknown[]};
            // Default count should be 3
            assert.strictEqual(data.nodes.length, 3);
        });

        it("handles target 'both' explicitly", async() => {
            const result = await sampleData.execute(graph, {target: "both", count: 2}, context);
            assert.strictEqual(result.success, true);
            const data = result.data as {nodes: unknown[], edges: unknown[]};
            assert.strictEqual(data.nodes.length, 2);
            assert.strictEqual(data.edges.length, 2);
        });
    });
});
