import {assert, describe, it} from "vitest";

import {Algorithm} from "../../../src/algorithms/Algorithm";
import {DFSAlgorithm} from "../../../src/algorithms/DFSAlgorithm";
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

describe("DFSAlgorithm", () => {
    describe("Algorithm Registration", () => {
        it("should be registered with namespace 'graphty' and type 'dfs'", () => {
            const DFSClass = Algorithm.getClass("graphty", "dfs");
            assert.ok(DFSClass);
            assert.strictEqual(DFSClass.namespace, "graphty");
            assert.strictEqual(DFSClass.type, "dfs");
        });
    });

    describe("Algorithm Execution", () => {
        it("exists", async() => {
            new DFSAlgorithm(await mockGraph());
        });

        it("assigns discoveryTime to source node starting at 0", async() => {
            const fakeGraph = await mockGraph({dataPath: "../../../test/helpers/data4.json"});
            const algo = new DFSAlgorithm(fakeGraph);
            algo.configure({source: "Valjean"});
            await algo.run();

            const sourceNode = fakeGraph.nodes.get("Valjean");
            assert.ok(sourceNode);
            assert.strictEqual(sourceNode.algorithmResults.graphty.dfs.discoveryTime, 0);
        });

        it("assigns discoveryTime to all reachable nodes", async() => {
            const fakeGraph = await mockGraph({dataPath: "../../../test/helpers/data4.json"});
            const algo = new DFSAlgorithm(fakeGraph);
            algo.configure({source: "Valjean"});
            await algo.run();

            // All visited nodes should have discoveryTime >= 0
            for (const node of fakeGraph.nodes.values()) {
                const discoveryTime = node.algorithmResults?.graphty?.dfs?.discoveryTime;
                if (discoveryTime !== undefined) {
                    assert.isAtLeast(discoveryTime, 0);
                }
            }
        });

        it("assigns finishTime to all reachable nodes", async() => {
            const fakeGraph = await mockGraph({dataPath: "../../../test/helpers/data4.json"});
            const algo = new DFSAlgorithm(fakeGraph);
            algo.configure({source: "Valjean"});
            await algo.run();

            for (const node of fakeGraph.nodes.values()) {
                const finishTime = node.algorithmResults?.graphty?.dfs?.finishTime;
                if (finishTime !== undefined) {
                    assert.isAtLeast(finishTime, 0);
                }
            }
        });

        it("ensures finishTime > discoveryTime for each node", async() => {
            const fakeGraph = await mockGraph({dataPath: "../../../test/helpers/data4.json"});
            const algo = new DFSAlgorithm(fakeGraph);
            algo.configure({source: "Valjean"});
            await algo.run();

            for (const node of fakeGraph.nodes.values()) {
                const discoveryTime = node.algorithmResults?.graphty?.dfs?.discoveryTime;
                const finishTime = node.algorithmResults?.graphty?.dfs?.finishTime;
                if (discoveryTime !== undefined && finishTime !== undefined) {
                    assert.isAbove(finishTime, discoveryTime);
                }
            }
        });

        it("assigns normalized discoveryTimePct between 0 and 1", async() => {
            const fakeGraph = await mockGraph({dataPath: "../../../test/helpers/data4.json"});
            const algo = new DFSAlgorithm(fakeGraph);
            algo.configure({source: "Valjean"});
            await algo.run();

            for (const node of fakeGraph.nodes.values()) {
                const discoveryTimePct = node.algorithmResults?.graphty?.dfs?.discoveryTimePct;
                if (discoveryTimePct !== undefined) {
                    assert.isAtLeast(discoveryTimePct, 0);
                    assert.isAtMost(discoveryTimePct, 1);
                }
            }
        });

        it("marks all reachable nodes as visited", async() => {
            const fakeGraph = await mockGraph({dataPath: "../../../test/helpers/data4.json"});
            const algo = new DFSAlgorithm(fakeGraph);
            algo.configure({source: "Valjean"});
            await algo.run();

            let visitedCount = 0;
            for (const node of fakeGraph.nodes.values()) {
                if (node.algorithmResults?.graphty?.dfs?.visited === true) {
                    visitedCount++;
                }
            }
            assert.isAtLeast(visitedCount, 1);
        });

        it("stores maxTime at graph level", async() => {
            const fakeGraph = await mockGraph({dataPath: "../../../test/helpers/data4.json"});
            const algo = new DFSAlgorithm(fakeGraph);
            algo.configure({source: "Valjean"});
            await algo.run();

            const {results} = algo;
            assert.ok(results.graph?.graphty?.dfs?.maxTime !== undefined);
            assert.isAtLeast(results.graph.graphty.dfs.maxTime, 0);
        });

        it("stores visitedCount at graph level", async() => {
            const fakeGraph = await mockGraph({dataPath: "../../../test/helpers/data4.json"});
            const algo = new DFSAlgorithm(fakeGraph);
            algo.configure({source: "Valjean"});
            await algo.run();

            const {results} = algo;
            assert.ok(results.graph?.graphty?.dfs?.visitedCount !== undefined);
            assert.isAtLeast(results.graph.graphty.dfs.visitedCount, 1);
        });

        it("handles empty graph", async() => {
            const emptyGraph = await mockGraph();
            const algo = new DFSAlgorithm(emptyGraph);
            algo.configure({source: "A"});
            await algo.run();
            // Should not throw
        });

        it("uses first node as default source when not configured", async() => {
            const fakeGraph = await mockGraph({dataPath: "../../../test/helpers/data4.json"});
            const algo = new DFSAlgorithm(fakeGraph);
            // Don't call configure - let it use default source
            await algo.run();

            // Check that at least some nodes have discovery times assigned
            let hasTimes = false;
            for (const node of fakeGraph.nodes.values()) {
                if (node.algorithmResults?.graphty?.dfs?.discoveryTime !== undefined) {
                    hasTimes = true;
                    break;
                }
            }
            assert.isTrue(hasTimes);
        });
    });

    describe("Suggested Styles", () => {
        it("has suggested styles defined", () => {
            assert.isTrue(DFSAlgorithm.hasSuggestedStyles());
        });

        it("returns correct category", () => {
            const styles = DFSAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.strictEqual(styles.category, "hierarchy");
        });

        it("has node layers for discovery time visualization", () => {
            const styles = DFSAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const hasNodeLayer = styles.layers.some((l) => l.node);
            assert.isTrue(hasNodeLayer);
        });

        it("has layers with metadata", () => {
            const styles = DFSAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            for (const layer of styles.layers) {
                assert.ok(layer.metadata);
                assert.ok(layer.metadata.name);
            }
        });

        it("uses calculatedStyle for discovery time-based coloring", () => {
            const styles = DFSAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const colorLayer = styles.layers.find((l) =>
                l.node?.calculatedStyle?.output.includes("color"),
            );
            assert.ok(colorLayer);
            assert.ok(colorLayer.node);
            assert.ok(colorLayer.node.calculatedStyle);
            assert.ok(colorLayer.node.calculatedStyle.inputs.includes("algorithmResults.graphty.dfs.discoveryTimePct"));
        });

        it("uses StyleHelpers for color mapping", () => {
            const styles = DFSAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const hasStyleHelpersLayer = styles.layers.some((l) =>
                l.node?.calculatedStyle?.expr.includes("StyleHelpers"),
            );
            assert.ok(hasStyleHelpersLayer);
        });

        it("description mentions DFS or depth traversal", () => {
            const styles = DFSAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.ok(styles.description);
            const descLower = styles.description.toLowerCase();
            assert.ok(descLower.includes("dfs") || descLower.includes("depth") || descLower.includes("discovery"));
        });
    });

    describe("Algorithm Metadata", () => {
        it("has correct namespace and type", () => {
            assert.strictEqual(DFSAlgorithm.namespace, "graphty");
            assert.strictEqual(DFSAlgorithm.type, "dfs");
        });

        it("is retrievable via Algorithm.getClass", () => {
            const AlgClass = Algorithm.getClass("graphty", "dfs");
            assert.strictEqual(AlgClass, DFSAlgorithm);
        });

        it("suggested styles are retrievable via static method", () => {
            const styles = DFSAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.ok(styles.layers);
        });
    });

    describe("JMESPath Selectors", () => {
        it("calculatedStyle inputs use correct algorithm result path", () => {
            const styles = DFSAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            for (const layer of styles.layers) {
                if (layer.node?.calculatedStyle) {
                    for (const input of layer.node.calculatedStyle.inputs) {
                        assert.ok(
                            input.includes("algorithmResults.graphty.dfs"),
                            `Input path should reference dfs algorithm results: ${input}`,
                        );
                    }
                }
            }
        });
    });
});
