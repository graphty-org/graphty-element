import {assert, describe, it} from "vitest";

import {buildAdjacencyList, buildWeightedAdjacencyList} from "../../../src/algorithms/utils";
import type {GraphLike, MinimalEdge} from "../../../src/algorithms/utils/graphUtils";

interface MockGraphOpts {
    nodes?: {id: string | number, [key: string]: unknown}[];
    edges?: {srcId: string | number, dstId: string | number, value?: number, [key: string]: unknown}[];
}

function createMockGraph(opts: MockGraphOpts = {}): GraphLike {
    const nodes = new Map<string | number, unknown>();
    const edges = new Map<string | number, MinimalEdge>();

    if (opts.nodes) {
        for (const n of opts.nodes) {
            nodes.set(n.id, n);
        }
    }

    if (opts.edges) {
        for (const e of opts.edges) {
            edges.set(`${e.srcId}:${e.dstId}`, e as MinimalEdge);
        }
    }

    return {
        getDataManager() {
            return {nodes, edges};
        },
    };
}

describe("graph utilities", () => {
    describe("buildAdjacencyList", () => {
        it("builds undirected adjacency list", () => {
            const graph = createMockGraph({
                nodes: [{id: "A"}, {id: "B"}, {id: "C"}],
                edges: [{srcId: "A", dstId: "B"}],
            });

            const adj = buildAdjacencyList(graph, {directed: false});

            assert.isTrue(adj.get("A")?.has("B"), "A should have B as neighbor");
            assert.isTrue(adj.get("B")?.has("A"), "B should have A as neighbor (undirected)");
            assert.isFalse(adj.get("C")?.has("A"), "C should not have A as neighbor");
            assert.isFalse(adj.get("C")?.has("B"), "C should not have B as neighbor");
        });

        it("builds directed adjacency list", () => {
            const graph = createMockGraph({
                nodes: [{id: "A"}, {id: "B"}],
                edges: [{srcId: "A", dstId: "B"}],
            });

            const adj = buildAdjacencyList(graph, {directed: true});

            assert.isTrue(adj.get("A")?.has("B"), "A should have B as neighbor");
            assert.isFalse(adj.get("B")?.has("A"), "B should NOT have A as neighbor (directed)");
        });

        it("handles multiple edges", () => {
            const graph = createMockGraph({
                nodes: [{id: "A"}, {id: "B"}, {id: "C"}],
                edges: [
                    {srcId: "A", dstId: "B"},
                    {srcId: "A", dstId: "C"},
                    {srcId: "B", dstId: "C"},
                ],
            });

            const adj = buildAdjacencyList(graph, {directed: false});

            assert.isTrue(adj.get("A")?.has("B"));
            assert.isTrue(adj.get("A")?.has("C"));
            assert.isTrue(adj.get("B")?.has("A"));
            assert.isTrue(adj.get("B")?.has("C"));
            assert.isTrue(adj.get("C")?.has("A"));
            assert.isTrue(adj.get("C")?.has("B"));
        });

        it("handles empty graph", () => {
            const graph = createMockGraph({
                nodes: [],
                edges: [],
            });

            const adj = buildAdjacencyList(graph);

            assert.strictEqual(adj.size, 0);
        });

        it("handles nodes with no edges", () => {
            const graph = createMockGraph({
                nodes: [{id: "A"}, {id: "B"}, {id: "isolated"}],
                edges: [{srcId: "A", dstId: "B"}],
            });

            const adj = buildAdjacencyList(graph);

            assert.isTrue(adj.has("isolated"));
            assert.strictEqual(adj.get("isolated")?.size, 0);
        });

        it("defaults to undirected when no options provided", () => {
            const graph = createMockGraph({
                nodes: [{id: "A"}, {id: "B"}],
                edges: [{srcId: "A", dstId: "B"}],
            });

            const adj = buildAdjacencyList(graph);

            assert.isTrue(adj.get("A")?.has("B"));
            assert.isTrue(adj.get("B")?.has("A"), "Should be undirected by default");
        });

        it("handles numeric node IDs", () => {
            const graph = createMockGraph({
                nodes: [{id: 1}, {id: 2}, {id: 3}],
                edges: [{srcId: 1, dstId: 2}],
            });

            const adj = buildAdjacencyList(graph);

            // String conversion should work
            assert.isTrue(adj.get("1")?.has("2"));
            assert.isTrue(adj.get("2")?.has("1"));
        });
    });

    describe("buildWeightedAdjacencyList", () => {
        it("includes edge weights", () => {
            const graph = createMockGraph({
                nodes: [{id: "A"}, {id: "B"}],
                edges: [{srcId: "A", dstId: "B", value: 5}],
            });

            const adj = buildWeightedAdjacencyList(graph);

            assert.strictEqual(adj.get("A")?.get("B"), 5);
            assert.strictEqual(adj.get("B")?.get("A"), 5); // undirected by default
        });

        it("uses default weight of 1 when not specified", () => {
            const graph = createMockGraph({
                nodes: [{id: "A"}, {id: "B"}],
                edges: [{srcId: "A", dstId: "B"}],
            });

            const adj = buildWeightedAdjacencyList(graph);

            assert.strictEqual(adj.get("A")?.get("B"), 1);
        });

        it("uses custom weight attribute", () => {
            const graph = createMockGraph({
                nodes: [{id: "A"}, {id: "B"}],
                edges: [{srcId: "A", dstId: "B", weight: 10}],
            });

            const adj = buildWeightedAdjacencyList(graph, {weightAttribute: "weight"});

            assert.strictEqual(adj.get("A")?.get("B"), 10);
        });

        it("builds directed weighted adjacency list", () => {
            const graph = createMockGraph({
                nodes: [{id: "A"}, {id: "B"}],
                edges: [{srcId: "A", dstId: "B", value: 3}],
            });

            const adj = buildWeightedAdjacencyList(graph, {directed: true});

            assert.strictEqual(adj.get("A")?.get("B"), 3);
            assert.isFalse(adj.get("B")?.has("A"), "Should not have reverse edge in directed mode");
        });

        it("handles multiple weighted edges", () => {
            const graph = createMockGraph({
                nodes: [{id: "A"}, {id: "B"}, {id: "C"}],
                edges: [
                    {srcId: "A", dstId: "B", value: 2},
                    {srcId: "A", dstId: "C", value: 4},
                    {srcId: "B", dstId: "C", value: 6},
                ],
            });

            const adj = buildWeightedAdjacencyList(graph);

            assert.strictEqual(adj.get("A")?.get("B"), 2);
            assert.strictEqual(adj.get("A")?.get("C"), 4);
            assert.strictEqual(adj.get("B")?.get("C"), 6);
        });

        it("handles empty graph", () => {
            const graph = createMockGraph({
                nodes: [],
                edges: [],
            });

            const adj = buildWeightedAdjacencyList(graph);

            assert.strictEqual(adj.size, 0);
        });

        it("handles nodes with no edges", () => {
            const graph = createMockGraph({
                nodes: [{id: "A"}, {id: "isolated"}],
                edges: [],
            });

            const adj = buildWeightedAdjacencyList(graph);

            assert.isTrue(adj.has("isolated"));
            assert.strictEqual(adj.get("isolated")?.size, 0);
        });
    });
});
