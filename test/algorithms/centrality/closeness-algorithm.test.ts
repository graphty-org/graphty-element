import {assert, describe, it} from "vitest";

import {Algorithm} from "../../../src/algorithms/Algorithm";
import {ClosenessCentralityAlgorithm} from "../../../src/algorithms/ClosenessCentralityAlgorithm";
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

describe("ClosenessCentralityAlgorithm", () => {
    describe("Algorithm Registration", () => {
        it("should be registered with namespace 'graphty' and type 'closeness'", () => {
            const ClosenessClass = Algorithm.getClass("graphty", "closeness");
            assert.ok(ClosenessClass);
            assert.strictEqual(ClosenessClass.namespace, "graphty");
            assert.strictEqual(ClosenessClass.type, "closeness");
        });
    });

    describe("Algorithm Execution", () => {
        it("exists", async() => {
            new ClosenessCentralityAlgorithm(await mockGraph());
        });

        it("calculates closeness scores for all nodes", async() => {
            const fakeGraph = await mockGraph({dataPath: "../../../test/helpers/data4.json"});
            const algo = new ClosenessCentralityAlgorithm(fakeGraph);
            await algo.run();

            for (const node of fakeGraph.nodes.values()) {
                assert.property(node.algorithmResults, "graphty");
                assert.property(node.algorithmResults.graphty, "closeness");
                assert.property(node.algorithmResults.graphty.closeness, "score");
                assert.property(node.algorithmResults.graphty.closeness, "scorePct");

                assert.isNumber(node.algorithmResults.graphty.closeness.score);
                assert.isAtLeast(node.algorithmResults.graphty.closeness.scorePct, 0);
                assert.isAtMost(node.algorithmResults.graphty.closeness.scorePct, 1);
            }
        });

        it("handles empty graph", async() => {
            const emptyGraph = await mockGraph();
            const algo = new ClosenessCentralityAlgorithm(emptyGraph);
            await algo.run();
            // Should not throw
        });

        it("central nodes have higher closeness", async() => {
            const fakeGraph = await mockGraph({dataPath: "../../../test/helpers/data4.json"});
            const algo = new ClosenessCentralityAlgorithm(fakeGraph);
            await algo.run();

            // Valjean should have high closeness as a central character
            const valjean = fakeGraph.nodes.get("Valjean");
            assert.ok(valjean);
            // Closeness scores vary but central nodes should be in upper half
            assert.isAtLeast(valjean.algorithmResults.graphty.closeness.scorePct as number, 0.3);
        });
    });

    describe("Suggested Styles", () => {
        it("has suggested styles defined", () => {
            assert.isTrue(ClosenessCentralityAlgorithm.hasSuggestedStyles());
        });

        it("returns correct category", () => {
            const styles = ClosenessCentralityAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.strictEqual(styles.category, "node-metric");
        });

        it("uses StyleHelpers for color mapping with greens palette", () => {
            const styles = ClosenessCentralityAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            const layer = styles.layers[0];
            assert.ok(layer);
            assert.ok(layer.node?.calculatedStyle?.expr.includes("StyleHelpers"));
            assert.ok(layer.node?.calculatedStyle?.expr.includes("greens"));
        });

        it("has layers with correct structure", () => {
            const styles = ClosenessCentralityAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.property(styles, "layers");
            assert.isArray(styles.layers);
            assert.isAtLeast(styles.layers.length, 1);

            const layer = styles.layers[0];
            assert.ok(layer.node);
            assert.property(layer.node, "calculatedStyle");
            assert.ok(layer.node.calculatedStyle?.inputs.some((input) =>
                input.includes("algorithmResults.graphty.closeness"),
            ));
        });
    });
});
