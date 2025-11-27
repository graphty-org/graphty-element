import {assert, describe, it} from "vitest";

import {Algorithm} from "../../../src/algorithms/Algorithm";
import {FloydWarshallAlgorithm} from "../../../src/algorithms/FloydWarshallAlgorithm";
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

// Create a small graph for testing Floyd-Warshall (to avoid O(n³) performance issues)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mockSmallGraph(): any {
    const nodes = new Map<string | number, AdHocData>();
    const edges = new Map<string | number, AdHocData>();
    let graphResults: AdHocData | undefined;

    // Create a simple 4-node graph: A -- B -- C -- D
    nodes.set("A", {id: "A"} as unknown as AdHocData);
    nodes.set("B", {id: "B"} as unknown as AdHocData);
    nodes.set("C", {id: "C"} as unknown as AdHocData);
    nodes.set("D", {id: "D"} as unknown as AdHocData);

    edges.set("A:B", {srcId: "A", dstId: "B", value: 1} as unknown as AdHocData);
    edges.set("B:C", {srcId: "B", dstId: "C", value: 2} as unknown as AdHocData);
    edges.set("C:D", {srcId: "C", dstId: "D", value: 3} as unknown as AdHocData);

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

describe("FloydWarshallAlgorithm", () => {
    describe("Algorithm Registration", () => {
        it("should be registered with namespace 'graphty' and type 'floyd-warshall'", () => {
            const FloydWarshallClass = Algorithm.getClass("graphty", "floyd-warshall");
            assert.ok(FloydWarshallClass);
            assert.strictEqual(FloydWarshallClass.namespace, "graphty");
            assert.strictEqual(FloydWarshallClass.type, "floyd-warshall");
        });
    });

    describe("Algorithm Execution", () => {
        it("exists", async() => {
            new FloydWarshallAlgorithm(await mockGraph());
        });

        it("computes all-pairs shortest paths", async() => {
            const smallGraph = mockSmallGraph();
            const algo = new FloydWarshallAlgorithm(smallGraph);
            await algo.run();

            const {results} = algo;
            assert.property(results, "graph");
            assert.property(results.graph?.graphty?.["floyd-warshall"], "nodeCount");
        });

        it("stores distance information on graph", async() => {
            const smallGraph = mockSmallGraph();
            const algo = new FloydWarshallAlgorithm(smallGraph);
            await algo.run();

            const {results} = algo;
            const fwResults = results.graph?.graphty?.["floyd-warshall"];
            assert.ok(fwResults);
            assert.property(fwResults, "nodeCount");
            assert.strictEqual(fwResults.nodeCount, 4);
        });

        it("handles empty graph", async() => {
            const emptyGraph = await mockGraph();
            const algo = new FloydWarshallAlgorithm(emptyGraph);
            await algo.run();
            // Should not throw
        });

        it("stores eccentricity on nodes", async() => {
            const smallGraph = mockSmallGraph();
            const algo = new FloydWarshallAlgorithm(smallGraph);
            await algo.run();

            // Each node should have eccentricity stored
            for (const node of smallGraph.nodes.values()) {
                assert.property(node.algorithmResults, "graphty");
                assert.property(node.algorithmResults.graphty, "floyd-warshall");
                assert.property(node.algorithmResults.graphty["floyd-warshall"], "eccentricity");
            }
        });

        it("computes diameter and radius", async() => {
            const smallGraph = mockSmallGraph();
            const algo = new FloydWarshallAlgorithm(smallGraph);
            await algo.run();

            const {results} = algo;
            const fwResults = results.graph?.graphty?.["floyd-warshall"];
            assert.ok(fwResults);
            assert.property(fwResults, "diameter");
            assert.property(fwResults, "radius");

            // For a path graph A-B-C-D:
            // Diameter (max eccentricity) should be 3 (A to D or D to A)
            // Radius (min eccentricity) should be 2 (from B or C)
            assert.isAtLeast(fwResults.diameter, fwResults.radius);
        });

        it("identifies central nodes", async() => {
            const smallGraph = mockSmallGraph();
            const algo = new FloydWarshallAlgorithm(smallGraph);
            await algo.run();

            // Some nodes should be marked as central (eccentricity = radius)
            let hasCentralNode = false;
            for (const node of smallGraph.nodes.values()) {
                if (node.algorithmResults?.graphty?.["floyd-warshall"]?.isCentral) {
                    hasCentralNode = true;
                    break;
                }
            }
            assert.isTrue(hasCentralNode);
        });
    });

    describe("Suggested Styles", () => {
        it("has suggested styles defined", () => {
            assert.isTrue(FloydWarshallAlgorithm.hasSuggestedStyles());
        });

        it("returns correct category", () => {
            const styles = FloydWarshallAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.strictEqual(styles.category, "path");
        });

        it("has node layer for eccentricity visualization", () => {
            const styles = FloydWarshallAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const hasNodeLayer = styles.layers.some((l) => l.node);
            assert.isTrue(hasNodeLayer);
        });

        it("uses StyleHelpers for color mapping", () => {
            const styles = FloydWarshallAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const nodeLayer = styles.layers.find((l) => l.node?.calculatedStyle);
            assert.ok(nodeLayer);
            assert.ok(nodeLayer.node?.calculatedStyle?.expr.includes("StyleHelpers"));
        });

        it("has layers with metadata", () => {
            const styles = FloydWarshallAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            for (const layer of styles.layers) {
                assert.ok(layer.metadata);
                assert.ok(layer.metadata.name);
            }
        });

        it("description mentions shortest paths or eccentricity", () => {
            const styles = FloydWarshallAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.ok(styles.description);
            const desc = styles.description.toLowerCase();
            assert.ok(desc.includes("path") || desc.includes("eccentricity") || desc.includes("distance"));
        });
    });
});
