import {assert, describe, it} from "vitest";

import {Algorithm} from "../../../src/algorithms/Algorithm";
import {BellmanFordAlgorithm} from "../../../src/algorithms/BellmanFordAlgorithm";
import type {AdHocData} from "../../../src/config";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mockGraphWithNegativeCycle(): any {
    // Create a graph with a negative cycle:
    // A --1--> B --2--> C ---(-4)--> A
    // This creates a negative cycle with total weight: 1 + 2 - 4 = -1
    const nodes = new Map<string | number, AdHocData>();
    const edges = new Map<string | number, AdHocData>();
    let graphResults: AdHocData | undefined;

    nodes.set("A", {id: "A"} as unknown as AdHocData);
    nodes.set("B", {id: "B"} as unknown as AdHocData);
    nodes.set("C", {id: "C"} as unknown as AdHocData);

    edges.set("A:B", {srcId: "A", dstId: "B", value: 1} as unknown as AdHocData);
    edges.set("B:C", {srcId: "B", dstId: "C", value: 2} as unknown as AdHocData);
    edges.set("C:A", {srcId: "C", dstId: "A", value: -4} as unknown as AdHocData);

    return {
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
}

describe("BellmanFordAlgorithm", () => {
    describe("Algorithm Registration", () => {
        it("should be registered with namespace 'graphty' and type 'bellman-ford'", () => {
            const BellmanFordClass = Algorithm.getClass("graphty", "bellman-ford");
            assert.ok(BellmanFordClass);
            assert.strictEqual(BellmanFordClass.namespace, "graphty");
            assert.strictEqual(BellmanFordClass.type, "bellman-ford");
        });
    });

    describe("Algorithm Execution", () => {
        it("exists", async() => {
            new BellmanFordAlgorithm(await mockGraph());
        });

        it("calculates distances from source to all nodes", async() => {
            const fakeGraph = await mockGraph({dataPath: "../../../test/helpers/data4.json"});
            const algo = new BellmanFordAlgorithm(fakeGraph);
            algo.configure({source: "Valjean"});
            await algo.run();

            for (const node of fakeGraph.nodes.values()) {
                assert.property(node.algorithmResults, "graphty");
                assert.property(node.algorithmResults.graphty, "bellman-ford");
                assert.property(node.algorithmResults.graphty["bellman-ford"], "distance");
            }

            // Source should have distance 0
            const sourceNode = fakeGraph.nodes.get("Valjean");
            assert.ok(sourceNode);
            assert.strictEqual(sourceNode.algorithmResults.graphty["bellman-ford"].distance, 0);
        });

        it("marks nodes in shortest path when target is specified", async() => {
            const fakeGraph = await mockGraph({dataPath: "../../../test/helpers/data4.json"});
            const algo = new BellmanFordAlgorithm(fakeGraph);
            algo.configure({source: "Valjean", target: "Cosette"});
            await algo.run();

            let pathNodeCount = 0;
            for (const node of fakeGraph.nodes.values()) {
                if (node.algorithmResults?.graphty?.["bellman-ford"]?.isInPath) {
                    pathNodeCount++;
                }
            }
            assert.isAtLeast(pathNodeCount, 2); // At least source and target
        });

        it("marks edges in shortest path when target is specified", async() => {
            const fakeGraph = await mockGraph({dataPath: "../../../test/helpers/data4.json"});
            const algo = new BellmanFordAlgorithm(fakeGraph);
            algo.configure({source: "Valjean", target: "Cosette"});
            await algo.run();

            let pathEdgeCount = 0;
            for (const edge of fakeGraph.edges.values()) {
                if (edge.algorithmResults?.graphty?.["bellman-ford"]?.isInPath) {
                    pathEdgeCount++;
                }
            }
            // Path should have at least 1 edge (Valjean is directly connected to Cosette)
            assert.isAtLeast(pathEdgeCount, 1);
        });

        it("handles empty graph", async() => {
            const emptyGraph = await mockGraph();
            const algo = new BellmanFordAlgorithm(emptyGraph);
            algo.configure({source: "A"});
            await algo.run();
            // Should not throw
        });

        it("normalizes distances to percentages", async() => {
            const fakeGraph = await mockGraph({dataPath: "../../../test/helpers/data4.json"});
            const algo = new BellmanFordAlgorithm(fakeGraph);
            algo.configure({source: "Valjean"});
            await algo.run();

            for (const node of fakeGraph.nodes.values()) {
                const distPct = node.algorithmResults?.graphty?.["bellman-ford"]?.distancePct;
                if (distPct !== undefined && isFinite(distPct)) {
                    assert.isAtLeast(distPct, 0);
                    assert.isAtMost(distPct, 1);
                }
            }
        });

        it("detects negative cycles", async() => {
            const graphWithNegCycle = mockGraphWithNegativeCycle();
            const algo = new BellmanFordAlgorithm(graphWithNegCycle);
            algo.configure({source: "A"});
            await algo.run();

            const {results} = algo;
            assert.ok(results.graph?.graphty?.["bellman-ford"]?.hasNegativeCycle);
        });
    });

    describe("Suggested Styles", () => {
        it("has suggested styles defined", () => {
            assert.isTrue(BellmanFordAlgorithm.hasSuggestedStyles());
        });

        it("returns correct category", () => {
            const styles = BellmanFordAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.strictEqual(styles.category, "path");
        });

        it("has both edge and node layers", () => {
            const styles = BellmanFordAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const hasEdgeLayer = styles.layers.some((l) => l.edge);
            const hasNodeLayer = styles.layers.some((l) => l.node);
            assert.isTrue(hasEdgeLayer);
            assert.isTrue(hasNodeLayer);
        });

        it("has layers with metadata", () => {
            const styles = BellmanFordAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            for (const layer of styles.layers) {
                assert.ok(layer.metadata);
                assert.ok(layer.metadata.name);
            }
        });

        it("edge layer highlights path edges using calculatedStyle", () => {
            const styles = BellmanFordAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const edgeLayer = styles.layers.find((l) => l.edge?.calculatedStyle?.inputs[0]?.includes("isInPath"));
            assert.ok(edgeLayer);
            assert.ok(edgeLayer.edge);
            assert.ok(edgeLayer.edge.calculatedStyle);
            assert.ok(edgeLayer.edge.calculatedStyle.output.includes("color"));
        });

        it("node layer highlights path nodes using calculatedStyle", () => {
            const styles = BellmanFordAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const nodeLayer = styles.layers.find((l) => l.node?.calculatedStyle?.inputs[0]?.includes("isInPath"));
            assert.ok(nodeLayer);
            assert.ok(nodeLayer.node);
            assert.ok(nodeLayer.node.calculatedStyle);
            assert.ok(nodeLayer.node.calculatedStyle.output.includes("color"));
        });

        it("description mentions path visualization", () => {
            const styles = BellmanFordAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.ok(styles.description);
            assert.ok(styles.description.toLowerCase().includes("path"));
        });
    });
});
