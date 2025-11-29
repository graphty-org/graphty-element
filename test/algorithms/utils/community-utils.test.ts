import {assert, describe, it} from "vitest";

import {
    countUniqueCommunities,
    extractCommunities,
    getNodeDegree,
    getTotalEdgeWeight,
} from "../../../src/algorithms/utils/communityUtils";
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

describe("community utilities", () => {
    describe("extractCommunities", () => {
        it("converts community map to array of arrays", () => {
            const communities = new Map<string | number, number>([
                ["A", 0],
                ["B", 0],
                ["C", 1],
                ["D", 1],
                ["E", 2],
            ]);

            const result = extractCommunities(communities);

            assert.strictEqual(result.length, 3);

            // Find community 0
            const comm0 = result.find((c) => c.includes("A"));
            assert.ok(comm0);
            assert.strictEqual(comm0.length, 2);
            assert.isTrue(comm0.includes("A"));
            assert.isTrue(comm0.includes("B"));

            // Find community 1
            const comm1 = result.find((c) => c.includes("C"));
            assert.ok(comm1);
            assert.strictEqual(comm1.length, 2);
            assert.isTrue(comm1.includes("C"));
            assert.isTrue(comm1.includes("D"));

            // Find community 2
            const comm2 = result.find((c) => c.includes("E"));
            assert.ok(comm2);
            assert.strictEqual(comm2.length, 1);
            assert.isTrue(comm2.includes("E"));
        });

        it("handles empty map", () => {
            const communities = new Map<string | number, number>();
            const result = extractCommunities(communities);

            assert.strictEqual(result.length, 0);
        });

        it("handles single node", () => {
            const communities = new Map<string | number, number>([["A", 0]]);

            const result = extractCommunities(communities);

            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].length, 1);
            assert.isTrue(result[0].includes("A"));
        });

        it("handles non-contiguous community IDs", () => {
            const communities = new Map<string | number, number>([
                ["A", 0],
                ["B", 5],
                ["C", 10],
            ]);

            const result = extractCommunities(communities);

            assert.strictEqual(result.length, 3);
        });

        it("handles numeric node IDs", () => {
            const communities = new Map<string | number, number>([
                [1, 0],
                [2, 0],
                [3, 1],
            ]);

            const result = extractCommunities(communities);

            assert.strictEqual(result.length, 2);
            const comm0 = result.find((c) => c.includes(1));
            assert.ok(comm0);
            assert.isTrue(comm0.includes(2));
        });
    });

    describe("getTotalEdgeWeight", () => {
        it("calculates total edge weight", () => {
            const graph = createMockGraph({
                nodes: [{id: "A"}, {id: "B"}, {id: "C"}],
                edges: [
                    {srcId: "A", dstId: "B", value: 2},
                    {srcId: "B", dstId: "C", value: 3},
                ],
            });

            const total = getTotalEdgeWeight(graph);

            assert.strictEqual(total, 5);
        });

        it("uses default weight of 1 when not specified", () => {
            const graph = createMockGraph({
                nodes: [{id: "A"}, {id: "B"}, {id: "C"}],
                edges: [
                    {srcId: "A", dstId: "B"},
                    {srcId: "B", dstId: "C"},
                ],
            });

            const total = getTotalEdgeWeight(graph);

            assert.strictEqual(total, 2);
        });

        it("returns 0 for empty graph", () => {
            const graph = createMockGraph({
                nodes: [],
                edges: [],
            });

            const total = getTotalEdgeWeight(graph);

            assert.strictEqual(total, 0);
        });

        it("uses custom weight attribute", () => {
            const graph = createMockGraph({
                nodes: [{id: "A"}, {id: "B"}],
                edges: [{srcId: "A", dstId: "B", weight: 10}],
            });

            const total = getTotalEdgeWeight(graph, {weightAttribute: "weight"});

            assert.strictEqual(total, 10);
        });
    });

    describe("getNodeDegree", () => {
        it("counts outgoing edges", () => {
            const graph = createMockGraph({
                nodes: [{id: "A"}, {id: "B"}, {id: "C"}],
                edges: [
                    {srcId: "A", dstId: "B"},
                    {srcId: "A", dstId: "C"},
                ],
            });

            const degree = getNodeDegree(graph, "A");

            // Undirected by default: A has 2 edges (A-B, A-C)
            assert.strictEqual(degree, 2);
        });

        it("counts incoming edges in undirected mode", () => {
            const graph = createMockGraph({
                nodes: [{id: "A"}, {id: "B"}, {id: "C"}],
                edges: [
                    {srcId: "A", dstId: "B"},
                    {srcId: "C", dstId: "B"},
                ],
            });

            const degree = getNodeDegree(graph, "B");

            // Undirected: B is involved in 2 edges (A-B, C-B)
            assert.strictEqual(degree, 2);
        });

        it("returns 0 for isolated node", () => {
            const graph = createMockGraph({
                nodes: [{id: "A"}, {id: "isolated"}],
                edges: [],
            });

            const degree = getNodeDegree(graph, "isolated");

            assert.strictEqual(degree, 0);
        });

        it("returns 0 for non-existent node", () => {
            const graph = createMockGraph({
                nodes: [{id: "A"}],
                edges: [],
            });

            const degree = getNodeDegree(graph, "nonexistent");

            assert.strictEqual(degree, 0);
        });

        it("counts only outgoing edges in directed mode", () => {
            const graph = createMockGraph({
                nodes: [{id: "A"}, {id: "B"}, {id: "C"}],
                edges: [
                    {srcId: "A", dstId: "B"},
                    {srcId: "C", dstId: "A"},
                ],
            });

            const degree = getNodeDegree(graph, "A", {directed: true, countType: "out"});

            // Directed out: A has 1 outgoing edge (A->B)
            assert.strictEqual(degree, 1);
        });

        it("counts only incoming edges in directed mode", () => {
            const graph = createMockGraph({
                nodes: [{id: "A"}, {id: "B"}, {id: "C"}],
                edges: [
                    {srcId: "A", dstId: "B"},
                    {srcId: "C", dstId: "B"},
                ],
            });

            const degree = getNodeDegree(graph, "B", {directed: true, countType: "in"});

            // Directed in: B has 2 incoming edges (A->B, C->B)
            assert.strictEqual(degree, 2);
        });
    });

    describe("countUniqueCommunities", () => {
        it("counts unique community IDs", () => {
            const communities = new Map<string | number, number>([
                ["A", 0],
                ["B", 0],
                ["C", 1],
                ["D", 2],
            ]);

            const count = countUniqueCommunities(communities);

            assert.strictEqual(count, 3);
        });

        it("returns 0 for empty map", () => {
            const communities = new Map<string | number, number>();
            const count = countUniqueCommunities(communities);

            assert.strictEqual(count, 0);
        });

        it("returns 1 for single community", () => {
            const communities = new Map<string | number, number>([
                ["A", 0],
                ["B", 0],
                ["C", 0],
            ]);

            const count = countUniqueCommunities(communities);

            assert.strictEqual(count, 1);
        });
    });
});
