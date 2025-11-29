import {assert, describe, it} from "vitest";

import {Algorithm} from "../../../src/algorithms/Algorithm";
import {BFSAlgorithm} from "../../../src/algorithms/BFSAlgorithm";
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

describe("BFSAlgorithm", () => {
    describe("Algorithm Registration", () => {
        it("should be registered with namespace 'graphty' and type 'bfs'", () => {
            const BFSClass = Algorithm.getClass("graphty", "bfs");
            assert.ok(BFSClass);
            assert.strictEqual(BFSClass.namespace, "graphty");
            assert.strictEqual(BFSClass.type, "bfs");
        });
    });

    describe("Algorithm Execution", () => {
        it("exists", async() => {
            new BFSAlgorithm(await mockGraph());
        });

        it("assigns level 0 to source node", async() => {
            const fakeGraph = await mockGraph({dataPath: "../../../test/helpers/data4.json"});
            const algo = new BFSAlgorithm(fakeGraph);
            algo.configure({source: "Valjean"});
            await algo.run();

            const sourceNode = fakeGraph.nodes.get("Valjean");
            assert.ok(sourceNode);
            assert.strictEqual(sourceNode.algorithmResults.graphty.bfs.level, 0);
        });

        it("assigns levels to all reachable nodes", async() => {
            const fakeGraph = await mockGraph({dataPath: "../../../test/helpers/data4.json"});
            const algo = new BFSAlgorithm(fakeGraph);
            algo.configure({source: "Valjean"});
            await algo.run();

            // All nodes should have levels >= 0
            for (const node of fakeGraph.nodes.values()) {
                const level = node.algorithmResults?.graphty?.bfs?.level;
                if (level !== undefined) {
                    assert.isAtLeast(level, 0);
                }
            }
        });

        it("assigns normalized levelPct between 0 and 1", async() => {
            const fakeGraph = await mockGraph({dataPath: "../../../test/helpers/data4.json"});
            const algo = new BFSAlgorithm(fakeGraph);
            algo.configure({source: "Valjean"});
            await algo.run();

            for (const node of fakeGraph.nodes.values()) {
                const levelPct = node.algorithmResults?.graphty?.bfs?.levelPct;
                if (levelPct !== undefined) {
                    assert.isAtLeast(levelPct, 0);
                    assert.isAtMost(levelPct, 1);
                }
            }
        });

        it("records visit order for all reachable nodes", async() => {
            const fakeGraph = await mockGraph({dataPath: "../../../test/helpers/data4.json"});
            const algo = new BFSAlgorithm(fakeGraph);
            algo.configure({source: "Valjean"});
            await algo.run();

            const visitOrders = new Set<number>();
            for (const node of fakeGraph.nodes.values()) {
                const order = node.algorithmResults?.graphty?.bfs?.visitOrder;
                if (order !== undefined) {
                    visitOrders.add(order);
                }
            }

            // Visit orders should be unique (no duplicates)
            // Get count of nodes with visit orders
            let nodeWithOrderCount = 0;
            for (const node of fakeGraph.nodes.values()) {
                if (node.algorithmResults?.graphty?.bfs?.visitOrder !== undefined) {
                    nodeWithOrderCount++;
                }
            }
            assert.strictEqual(visitOrders.size, nodeWithOrderCount);
        });

        it("stores maxLevel at graph level", async() => {
            const fakeGraph = await mockGraph({dataPath: "../../../test/helpers/data4.json"});
            const algo = new BFSAlgorithm(fakeGraph);
            algo.configure({source: "Valjean"});
            await algo.run();

            const {results} = algo;
            assert.ok(results.graph?.graphty?.bfs?.maxLevel !== undefined);
            assert.isAtLeast(results.graph.graphty.bfs.maxLevel, 0);
        });

        it("stores visitedCount at graph level", async() => {
            const fakeGraph = await mockGraph({dataPath: "../../../test/helpers/data4.json"});
            const algo = new BFSAlgorithm(fakeGraph);
            algo.configure({source: "Valjean"});
            await algo.run();

            const {results} = algo;
            assert.ok(results.graph?.graphty?.bfs?.visitedCount !== undefined);
            assert.isAtLeast(results.graph.graphty.bfs.visitedCount, 1);
        });

        it("handles empty graph", async() => {
            const emptyGraph = await mockGraph();
            const algo = new BFSAlgorithm(emptyGraph);
            algo.configure({source: "A"});
            await algo.run();
            // Should not throw
        });

        it("uses first node as default source when not configured", async() => {
            const fakeGraph = await mockGraph({dataPath: "../../../test/helpers/data4.json"});
            const algo = new BFSAlgorithm(fakeGraph);
            // Don't call configure - let it use default source
            await algo.run();

            // Check that at least some nodes have levels assigned
            let hasLevels = false;
            for (const node of fakeGraph.nodes.values()) {
                if (node.algorithmResults?.graphty?.bfs?.level !== undefined) {
                    hasLevels = true;
                    break;
                }
            }
            assert.isTrue(hasLevels);
        });
    });

    describe("Suggested Styles", () => {
        it("has suggested styles defined", () => {
            assert.isTrue(BFSAlgorithm.hasSuggestedStyles());
        });

        it("returns correct category", () => {
            const styles = BFSAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.strictEqual(styles.category, "hierarchy");
        });

        it("has node layers for level visualization", () => {
            const styles = BFSAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const hasNodeLayer = styles.layers.some((l) => l.node);
            assert.isTrue(hasNodeLayer);
        });

        it("has layers with metadata", () => {
            const styles = BFSAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            for (const layer of styles.layers) {
                assert.ok(layer.metadata);
                assert.ok(layer.metadata.name);
            }
        });

        it("uses calculatedStyle for level-based coloring", () => {
            const styles = BFSAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const colorLayer = styles.layers.find((l) =>
                l.node?.calculatedStyle?.output.includes("color"),
            );
            assert.ok(colorLayer);
            assert.ok(colorLayer.node);
            assert.ok(colorLayer.node.calculatedStyle);
            assert.ok(colorLayer.node.calculatedStyle.inputs.includes("algorithmResults.graphty.bfs.levelPct"));
        });

        it("uses StyleHelpers for color mapping", () => {
            const styles = BFSAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const hasStyleHelpersLayer = styles.layers.some((l) =>
                l.node?.calculatedStyle?.expr.includes("StyleHelpers"),
            );
            assert.ok(hasStyleHelpersLayer);
        });

        it("description mentions BFS or level traversal", () => {
            const styles = BFSAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.ok(styles.description);
            const descLower = styles.description.toLowerCase();
            assert.ok(descLower.includes("bfs") || descLower.includes("breadth") || descLower.includes("level"));
        });
    });

    describe("Algorithm Metadata", () => {
        it("has correct namespace and type", () => {
            assert.strictEqual(BFSAlgorithm.namespace, "graphty");
            assert.strictEqual(BFSAlgorithm.type, "bfs");
        });

        it("is retrievable via Algorithm.getClass", () => {
            const AlgClass = Algorithm.getClass("graphty", "bfs");
            assert.strictEqual(AlgClass, BFSAlgorithm);
        });

        it("suggested styles are retrievable via static method", () => {
            const styles = BFSAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.ok(styles.layers);
        });
    });

    describe("JMESPath Selectors", () => {
        it("calculatedStyle inputs use correct algorithm result path", () => {
            const styles = BFSAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            for (const layer of styles.layers) {
                if (layer.node?.calculatedStyle) {
                    for (const input of layer.node.calculatedStyle.inputs) {
                        assert.ok(
                            input.includes("algorithmResults.graphty.bfs"),
                            `Input path should reference bfs algorithm results: ${input}`,
                        );
                    }
                }
            }
        });
    });
});
