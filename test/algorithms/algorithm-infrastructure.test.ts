import {assert, describe, it} from "vitest";

import {Algorithm} from "../../src/algorithms/Algorithm";
import {createMockGraph, getGraphResult} from "../helpers/mockGraph";

// Test algorithm that stores edge results
class TestEdgeAlgorithm extends Algorithm {
    static namespace = "test-namespace";
    static type = "test-edge-algo";

    // eslint-disable-next-line @typescript-eslint/require-await
    async run(): Promise<void> {
        for (const edge of this.graph.getDataManager().edges.values()) {
            this.addEdgeResult(edge, "testScore", 0.5);
            this.addEdgeResult(edge, "inTree", true);
        }
    }
}

// Test algorithm that stores graph results
class TestGraphAlgorithm extends Algorithm {
    static namespace = "test-namespace";
    static type = "test-graph-algo";

    // eslint-disable-next-line @typescript-eslint/require-await
    async run(): Promise<void> {
        this.addGraphResult("totalWeight", 42);
        this.addGraphResult("componentCount", 3);
    }
}

// Test algorithm that stores all three types of results
class TestCombinedAlgorithm extends Algorithm {
    static namespace = "test-namespace";
    static type = "test-combined-algo";

    // eslint-disable-next-line @typescript-eslint/require-await
    async run(): Promise<void> {
        // Node results
        for (const nodeId of this.graph.getDataManager().nodes.keys()) {
            this.addNodeResult(nodeId, "score", 0.75);
        }

        // Edge results
        for (const edge of this.graph.getDataManager().edges.values()) {
            this.addEdgeResult(edge, "weight", 1.5);
        }

        // Graph results
        this.addGraphResult("totalNodes", this.graph.getDataManager().nodes.size);
    }
}

// Register test algorithms
Algorithm.register(TestEdgeAlgorithm);
Algorithm.register(TestGraphAlgorithm);
Algorithm.register(TestCombinedAlgorithm);

describe("Algorithm Infrastructure", () => {
    describe("Edge Result Storage", () => {
        it("stores edge results via addEdgeResult", async() => {
            const graph = await createMockGraph({dataPath: "./data4.json"});
            const algo = new TestEdgeAlgorithm(graph);
            await algo.run();

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dm = graph.getDataManager() as any;
            for (const edge of dm.edges.values()) {
                assert.property(edge, "algorithmResults");
                assert.property(edge.algorithmResults, "test-namespace");
                assert.property(edge.algorithmResults["test-namespace"], "test-edge-algo");
                assert.strictEqual(edge.algorithmResults["test-namespace"]["test-edge-algo"].testScore, 0.5);
                assert.strictEqual(edge.algorithmResults["test-namespace"]["test-edge-algo"].inTree, true);
            }
        });

        it("retrieves edge results via Algorithm.results", async() => {
            const graph = await createMockGraph({dataPath: "./data4.json"});
            const algo = new TestEdgeAlgorithm(graph);
            await algo.run();

            const {results} = algo;
            assert.property(results, "edge");

            // Check that edge results are included
            const edgeResults = results.edge as Record<string, Record<string, Record<string, unknown>>>;
            const edgeKeys = Object.keys(edgeResults);
            assert.isAtLeast(edgeKeys.length, 1, "Should have at least one edge result");

            // Check structure of first edge result
            const firstEdgeKey = edgeKeys[0];
            const firstEdgeResult = edgeResults[firstEdgeKey];
            assert.property(firstEdgeResult, "test-namespace");
        });
    });

    describe("Graph Result Storage", () => {
        it("stores graph-level results via addGraphResult", async() => {
            const graph = await createMockGraph({dataPath: "./data4.json"});
            const algo = new TestGraphAlgorithm(graph);
            await algo.run();

            // Check graph-level results
            const totalWeight = getGraphResult(graph, "test-namespace", "test-graph-algo", "totalWeight");
            const componentCount = getGraphResult(graph, "test-namespace", "test-graph-algo", "componentCount");

            assert.strictEqual(totalWeight, 42);
            assert.strictEqual(componentCount, 3);
        });

        it("retrieves graph results via Algorithm.results", async() => {
            const graph = await createMockGraph({dataPath: "./data4.json"});
            const algo = new TestGraphAlgorithm(graph);
            await algo.run();

            const {results} = algo;
            assert.property(results, "graph");

            // Check structure
            const graphResults = results.graph as Record<string, Record<string, Record<string, unknown>>>;
            assert.property(graphResults, "test-namespace");
            assert.property(graphResults["test-namespace"], "test-graph-algo");
            assert.strictEqual(graphResults["test-namespace"]["test-graph-algo"].totalWeight, 42);
        });
    });

    describe("Combined Results", () => {
        it("retrieves all result types (node, edge, graph) via results getter", async() => {
            const graph = await createMockGraph({dataPath: "./data4.json"});
            const algo = new TestCombinedAlgorithm(graph);
            await algo.run();

            const {results} = algo;

            // Should have all three result types
            assert.property(results, "node");
            assert.property(results, "edge");
            assert.property(results, "graph");

            // Node results
            const nodeResults = results.node as Record<string, Record<string, Record<string, unknown>>>;
            const nodeKeys = Object.keys(nodeResults);
            assert.isAtLeast(nodeKeys.length, 1, "Should have node results");

            // Edge results
            const edgeResults = results.edge as Record<string, Record<string, Record<string, unknown>>>;
            const edgeKeys = Object.keys(edgeResults);
            assert.isAtLeast(edgeKeys.length, 1, "Should have edge results");

            // Graph results
            const graphResults = results.graph as Record<string, Record<string, Record<string, unknown>>>;
            assert.property(graphResults, "test-namespace");

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dm = graph.getDataManager() as any;
            assert.strictEqual(
                graphResults["test-namespace"]["test-combined-algo"].totalNodes,
                dm.nodes.size,
            );
        });
    });

    describe("Edge Cases", () => {
        it("handles empty graph for edge results", async() => {
            const emptyGraph = await createMockGraph();
            const algo = new TestEdgeAlgorithm(emptyGraph);
            await algo.run();

            const {results} = algo;
            // edge property should exist but be empty or undefined
            if (results.edge) {
                const edgeResults = results.edge as Record<string, unknown>;
                assert.strictEqual(Object.keys(edgeResults).length, 0);
            }
        });

        it("handles empty graph for graph results", async() => {
            const emptyGraph = await createMockGraph();
            const algo = new TestGraphAlgorithm(emptyGraph);
            await algo.run();

            const {results} = algo;
            assert.property(results, "graph");
            const graphResults = results.graph as Record<string, Record<string, Record<string, unknown>>>;
            assert.property(graphResults, "test-namespace");
        });

        it("multiple algorithms can store results without conflicts", async() => {
            const graph = await createMockGraph({dataPath: "./data4.json"});

            // Run both algorithms
            const edgeAlgo = new TestEdgeAlgorithm(graph);
            const graphAlgo = new TestGraphAlgorithm(graph);
            await edgeAlgo.run();
            await graphAlgo.run();

            // Check that graph results exist
            const totalWeight = getGraphResult(graph, "test-namespace", "test-graph-algo", "totalWeight");
            assert.strictEqual(totalWeight, 42);

            // Check edge results are still there
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dm = graph.getDataManager() as any;
            for (const edge of dm.edges.values()) {
                assert.property(edge.algorithmResults["test-namespace"], "test-edge-algo");
            }
        });
    });
});
