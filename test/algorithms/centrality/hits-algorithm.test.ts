import {assert, describe, it} from "vitest";

import {Algorithm} from "../../../src/algorithms/Algorithm";
import {HITSAlgorithm} from "../../../src/algorithms/HITSAlgorithm";
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

describe("HITSAlgorithm", () => {
    describe("Algorithm Registration", () => {
        it("should be registered with namespace 'graphty' and type 'hits'", () => {
            const HITSClass = Algorithm.getClass("graphty", "hits");
            assert.ok(HITSClass);
            assert.strictEqual(HITSClass.namespace, "graphty");
            assert.strictEqual(HITSClass.type, "hits");
        });
    });

    describe("Algorithm Execution", () => {
        it("exists", async() => {
            new HITSAlgorithm(await mockGraph());
        });

        it("calculates hub and authority scores for all nodes", async() => {
            const fakeGraph = await mockGraph({dataPath: "../../../test/helpers/data4.json"});
            const algo = new HITSAlgorithm(fakeGraph);
            await algo.run();

            for (const node of fakeGraph.nodes.values()) {
                assert.property(node.algorithmResults, "graphty");
                assert.property(node.algorithmResults.graphty, "hits");
                assert.property(node.algorithmResults.graphty.hits, "hubScore");
                assert.property(node.algorithmResults.graphty.hits, "authorityScore");
                assert.property(node.algorithmResults.graphty.hits, "hubScorePct");
                assert.property(node.algorithmResults.graphty.hits, "authorityScorePct");

                assert.isNumber(node.algorithmResults.graphty.hits.hubScore);
                assert.isNumber(node.algorithmResults.graphty.hits.authorityScore);
                assert.isAtLeast(node.algorithmResults.graphty.hits.hubScorePct, 0);
                assert.isAtMost(node.algorithmResults.graphty.hits.hubScorePct, 1);
                assert.isAtLeast(node.algorithmResults.graphty.hits.authorityScorePct, 0);
                assert.isAtMost(node.algorithmResults.graphty.hits.authorityScorePct, 1);
            }
        });

        it("handles empty graph", async() => {
            const emptyGraph = await mockGraph();
            const algo = new HITSAlgorithm(emptyGraph);
            await algo.run();
            // Should not throw
        });

        it("computes combined score for visualization", async() => {
            const fakeGraph = await mockGraph({dataPath: "../../../test/helpers/data4.json"});
            const algo = new HITSAlgorithm(fakeGraph);
            await algo.run();

            for (const node of fakeGraph.nodes.values()) {
                assert.property(node.algorithmResults.graphty.hits, "combinedScore");
                assert.property(node.algorithmResults.graphty.hits, "combinedScorePct");
                assert.isNumber(node.algorithmResults.graphty.hits.combinedScore);
                assert.isAtLeast(node.algorithmResults.graphty.hits.combinedScorePct, 0);
                assert.isAtMost(node.algorithmResults.graphty.hits.combinedScorePct, 1);
            }
        });
    });

    describe("Suggested Styles", () => {
        it("has suggested styles defined", () => {
            assert.isTrue(HITSAlgorithm.hasSuggestedStyles());
        });

        it("returns correct category", () => {
            const styles = HITSAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.strictEqual(styles.category, "node-metric");
        });

        it("uses StyleHelpers for visualization", () => {
            const styles = HITSAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            const hasStyleHelper = styles.layers.some((layer) =>
                layer.node?.calculatedStyle?.expr.includes("StyleHelpers"),
            );
            assert.isTrue(hasStyleHelper);
        });

        it("has multiple layers for hub/authority visualization", () => {
            const styles = HITSAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.property(styles, "layers");
            assert.isArray(styles.layers);
            assert.isAtLeast(styles.layers.length, 1);
        });

        it("references HITS algorithm results", () => {
            const styles = HITSAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const hasHITSInput = styles.layers.some((layer) =>
                layer.node?.calculatedStyle?.inputs.some((input) =>
                    input.includes("algorithmResults.graphty.hits"),
                ),
            );
            assert.isTrue(hasHITSInput);
        });
    });
});
