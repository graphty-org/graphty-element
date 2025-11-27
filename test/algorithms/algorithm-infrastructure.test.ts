import {assert, describe, it} from "vitest";

import {Algorithm} from "../../src/algorithms/Algorithm";
import {AdHocData} from "../../src/config";
import {Graph} from "../../src/Graph";

interface MockGraphOpts {
    dataPath?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function mockGraph(opts: MockGraphOpts = {}): Promise<any> {
    const nodes = new Map<string | number, AdHocData>();
    const edges = new Map<string | number, AdHocData>();
    let graphResults: AdHocData | undefined;

    if (typeof opts.dataPath === "string") {
        const imp = await import(opts.dataPath);
        for (const n of imp.nodes) {
            nodes.set(n.id, n);
        }
        for (const e of imp.edges) {
            edges.set(`${e.srcId}:${e.dstId}`, e);
        }
    }

    const fakeGraph = {
        nodes,
        edges,
        getDataManager() {
            return {
                nodes,
                edges,
                get graphResults() {
                    return graphResults;
                },
                set graphResults(val: AdHocData | undefined) {
                    graphResults = val;
                },
            };
        },
    };

    return fakeGraph;
}

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
            const fakeGraph = await mockGraph({dataPath: "../../test/helpers/data4.json"}) as Graph;
            const algo = new TestEdgeAlgorithm(fakeGraph);
            await algo.run();

            for (const edge of fakeGraph.getDataManager().edges.values()) {
                assert.property(edge, "algorithmResults");
                assert.property(edge.algorithmResults, "test-namespace");
                assert.property(edge.algorithmResults["test-namespace"], "test-edge-algo");
                assert.strictEqual(edge.algorithmResults["test-namespace"]["test-edge-algo"].testScore, 0.5);
                assert.strictEqual(edge.algorithmResults["test-namespace"]["test-edge-algo"].inTree, true);
            }
        });

        it("retrieves edge results via Algorithm.results", async() => {
            const fakeGraph = await mockGraph({dataPath: "../../test/helpers/data4.json"}) as Graph;
            const algo = new TestEdgeAlgorithm(fakeGraph);
            await algo.run();

            const {results} = algo;
            assert.property(results, "edge");

            // Check that edge results are included
            const edgeResults = results.edge as Record<string, AdHocData>;
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
            const fakeGraph = await mockGraph({dataPath: "../../test/helpers/data4.json"}) as Graph;
            const algo = new TestGraphAlgorithm(fakeGraph);
            await algo.run();

            const dm = fakeGraph.getDataManager();
            assert.property(dm, "graphResults");
            assert.property(dm.graphResults, "test-namespace");
            assert.property(dm.graphResults["test-namespace"], "test-graph-algo");
            assert.strictEqual(dm.graphResults["test-namespace"]["test-graph-algo"].totalWeight, 42);
            assert.strictEqual(dm.graphResults["test-namespace"]["test-graph-algo"].componentCount, 3);
        });

        it("retrieves graph results via Algorithm.results", async() => {
            const fakeGraph = await mockGraph({dataPath: "../../test/helpers/data4.json"}) as Graph;
            const algo = new TestGraphAlgorithm(fakeGraph);
            await algo.run();

            const {results} = algo;
            assert.property(results, "graph");

            // Check structure
            const graphResults = results.graph as Record<string, Record<string, AdHocData>>;
            assert.property(graphResults, "test-namespace");
            assert.property(graphResults["test-namespace"], "test-graph-algo");
            assert.strictEqual(graphResults["test-namespace"]["test-graph-algo"].totalWeight, 42);
        });
    });

    describe("Combined Results", () => {
        it("retrieves all result types (node, edge, graph) via results getter", async() => {
            const fakeGraph = await mockGraph({dataPath: "../../test/helpers/data4.json"}) as Graph;
            const algo = new TestCombinedAlgorithm(fakeGraph);
            await algo.run();

            const {results} = algo;

            // Should have all three result types
            assert.property(results, "node");
            assert.property(results, "edge");
            assert.property(results, "graph");

            // Node results
            const nodeResults = results.node as Record<string, AdHocData>;
            const nodeKeys = Object.keys(nodeResults);
            assert.isAtLeast(nodeKeys.length, 1, "Should have node results");

            // Edge results
            const edgeResults = results.edge as Record<string, AdHocData>;
            const edgeKeys = Object.keys(edgeResults);
            assert.isAtLeast(edgeKeys.length, 1, "Should have edge results");

            // Graph results
            const graphResults = results.graph as Record<string, Record<string, AdHocData>>;
            assert.property(graphResults, "test-namespace");
            assert.strictEqual(
                graphResults["test-namespace"]["test-combined-algo"].totalNodes,
                fakeGraph.getDataManager().nodes.size,
            );
        });
    });

    describe("Edge Cases", () => {
        it("handles empty graph for edge results", async() => {
            const emptyGraph = await mockGraph() as Graph;
            const algo = new TestEdgeAlgorithm(emptyGraph);
            await algo.run();

            const {results} = algo;
            // edge property should exist but be empty or undefined
            if (results.edge) {
                const edgeResults = results.edge as Record<string, AdHocData>;
                assert.strictEqual(Object.keys(edgeResults).length, 0);
            }
        });

        it("handles empty graph for graph results", async() => {
            const emptyGraph = await mockGraph() as Graph;
            const algo = new TestGraphAlgorithm(emptyGraph);
            await algo.run();

            const {results} = algo;
            assert.property(results, "graph");
            const graphResults = results.graph as Record<string, Record<string, AdHocData>>;
            assert.property(graphResults, "test-namespace");
        });

        it("multiple algorithms can store results without conflicts", async() => {
            const fakeGraph = await mockGraph({dataPath: "../../test/helpers/data4.json"}) as Graph;

            // Run both algorithms
            const edgeAlgo = new TestEdgeAlgorithm(fakeGraph);
            const graphAlgo = new TestGraphAlgorithm(fakeGraph);
            await edgeAlgo.run();
            await graphAlgo.run();

            // Check that both sets of results exist
            const dm = fakeGraph.getDataManager();
            assert.property(dm.graphResults, "test-namespace");
            assert.property(dm.graphResults["test-namespace"], "test-graph-algo");

            // Check edge results are still there
            for (const edge of dm.edges.values()) {
                assert.property(edge.algorithmResults["test-namespace"], "test-edge-algo");
            }
        });
    });
});
