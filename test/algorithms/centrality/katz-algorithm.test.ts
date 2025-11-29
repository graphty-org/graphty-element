import {assert, describe, it} from "vitest";

import {Algorithm} from "../../../src/algorithms/Algorithm";
import {KatzCentralityAlgorithm} from "../../../src/algorithms/KatzCentralityAlgorithm";
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

describe("KatzCentralityAlgorithm", () => {
    describe("Algorithm Registration", () => {
        it("should be registered with namespace 'graphty' and type 'katz'", () => {
            const KatzClass = Algorithm.getClass("graphty", "katz");
            assert.ok(KatzClass);
            assert.strictEqual(KatzClass.namespace, "graphty");
            assert.strictEqual(KatzClass.type, "katz");
        });
    });

    describe("Algorithm Execution", () => {
        it("exists", async() => {
            new KatzCentralityAlgorithm(await mockGraph());
        });

        it("calculates katz scores for all nodes", async() => {
            const fakeGraph = await mockGraph({dataPath: "../../../test/helpers/data4.json"});
            const algo = new KatzCentralityAlgorithm(fakeGraph);
            await algo.run();

            for (const node of fakeGraph.nodes.values()) {
                assert.property(node.algorithmResults, "graphty");
                assert.property(node.algorithmResults.graphty, "katz");
                assert.property(node.algorithmResults.graphty.katz, "score");
                assert.property(node.algorithmResults.graphty.katz, "scorePct");

                assert.isNumber(node.algorithmResults.graphty.katz.score);
                assert.isAtLeast(node.algorithmResults.graphty.katz.scorePct, 0);
                assert.isAtMost(node.algorithmResults.graphty.katz.scorePct, 1);
            }
        });

        it("handles empty graph", async() => {
            const emptyGraph = await mockGraph();
            const algo = new KatzCentralityAlgorithm(emptyGraph);
            await algo.run();
            // Should not throw
        });

        it("well-connected nodes have higher katz centrality", async() => {
            const fakeGraph = await mockGraph({dataPath: "../../../test/helpers/data4.json"});
            const algo = new KatzCentralityAlgorithm(fakeGraph);
            await algo.run();

            // Valjean should have high katz centrality
            const valjean = fakeGraph.nodes.get("Valjean");
            assert.ok(valjean);
            assert.isAtLeast(valjean.algorithmResults.graphty.katz.scorePct as number, 0.3);
        });
    });

    describe("Suggested Styles", () => {
        it("has suggested styles defined", () => {
            assert.isTrue(KatzCentralityAlgorithm.hasSuggestedStyles());
        });

        it("returns correct category", () => {
            const styles = KatzCentralityAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.strictEqual(styles.category, "node-metric");
        });

        it("uses StyleHelpers for color mapping with blues palette", () => {
            const styles = KatzCentralityAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            const layer = styles.layers[0];
            assert.ok(layer);
            assert.ok(layer.node?.calculatedStyle?.expr.includes("StyleHelpers"));
            assert.ok(layer.node?.calculatedStyle?.expr.includes("blues"));
        });

        it("has layers with correct structure", () => {
            const styles = KatzCentralityAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.property(styles, "layers");
            assert.isArray(styles.layers);
            assert.isAtLeast(styles.layers.length, 1);

            const layer = styles.layers[0];
            assert.ok(layer.node);
            assert.property(layer.node, "calculatedStyle");
            assert.ok(layer.node.calculatedStyle?.inputs.some((input) =>
                input.includes("algorithmResults.graphty.katz"),
            ));
        });
    });
});
