import {assert, describe, it} from "vitest";

import {Algorithm} from "../../../src/algorithms/Algorithm";
import {BetweennessCentralityAlgorithm} from "../../../src/algorithms/BetweennessCentralityAlgorithm";
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

describe("BetweennessCentralityAlgorithm", () => {
    describe("Algorithm Registration", () => {
        it("should be registered with namespace 'graphty' and type 'betweenness'", () => {
            const BetweennessClass = Algorithm.getClass("graphty", "betweenness");
            assert.ok(BetweennessClass);
            assert.strictEqual(BetweennessClass.namespace, "graphty");
            assert.strictEqual(BetweennessClass.type, "betweenness");
        });
    });

    describe("Algorithm Execution", () => {
        it("exists", async() => {
            new BetweennessCentralityAlgorithm(await mockGraph());
        });

        it("calculates betweenness scores for all nodes", async() => {
            const fakeGraph = await mockGraph({dataPath: "../../../test/helpers/data4.json"});
            const algo = new BetweennessCentralityAlgorithm(fakeGraph);
            await algo.run();

            for (const node of fakeGraph.nodes.values()) {
                assert.property(node.algorithmResults, "graphty");
                assert.property(node.algorithmResults.graphty, "betweenness");
                assert.property(node.algorithmResults.graphty.betweenness, "score");
                assert.property(node.algorithmResults.graphty.betweenness, "scorePct");

                assert.isNumber(node.algorithmResults.graphty.betweenness.score);
                assert.isAtLeast(node.algorithmResults.graphty.betweenness.scorePct, 0);
                assert.isAtMost(node.algorithmResults.graphty.betweenness.scorePct, 1);
            }
        });

        it("handles empty graph", async() => {
            const emptyGraph = await mockGraph();
            const algo = new BetweennessCentralityAlgorithm(emptyGraph);
            await algo.run();
            // Should not throw
        });

        it("identifies bridge nodes with higher scores", async() => {
            const fakeGraph = await mockGraph({dataPath: "../../../test/helpers/data4.json"});
            const algo = new BetweennessCentralityAlgorithm(fakeGraph);
            await algo.run();

            // Valjean should have high betweenness as a central character
            const valjean = fakeGraph.nodes.get("Valjean");
            assert.ok(valjean);
            assert.isAtLeast(valjean.algorithmResults.graphty.betweenness.scorePct as number, 0.5);
        });
    });

    describe("Suggested Styles", () => {
        it("has suggested styles defined", () => {
            assert.isTrue(BetweennessCentralityAlgorithm.hasSuggestedStyles());
        });

        it("returns correct category", () => {
            const styles = BetweennessCentralityAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.strictEqual(styles.category, "node-metric");
        });

        it("uses StyleHelpers for color mapping", () => {
            const styles = BetweennessCentralityAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            const layer = styles.layers[0];
            assert.ok(layer);
            assert.ok(layer.node?.calculatedStyle?.expr.includes("StyleHelpers"));
            assert.ok(layer.node?.calculatedStyle?.expr.includes("plasma"));
        });

        it("has layers with correct structure", () => {
            const styles = BetweennessCentralityAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.property(styles, "layers");
            assert.isArray(styles.layers);
            assert.isAtLeast(styles.layers.length, 1);

            const layer = styles.layers[0];
            assert.ok(layer.node);
            assert.property(layer.node, "calculatedStyle");
            assert.ok(layer.node.calculatedStyle?.inputs.some((input) =>
                input.includes("algorithmResults.graphty.betweenness"),
            ));
        });
    });
});
