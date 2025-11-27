import {assert, describe, it} from "vitest";

import {Algorithm} from "../../../src/algorithms/Algorithm";
import {EigenvectorCentralityAlgorithm} from "../../../src/algorithms/EigenvectorCentralityAlgorithm";
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

describe("EigenvectorCentralityAlgorithm", () => {
    describe("Algorithm Registration", () => {
        it("should be registered with namespace 'graphty' and type 'eigenvector'", () => {
            const EigenvectorClass = Algorithm.getClass("graphty", "eigenvector");
            assert.ok(EigenvectorClass);
            assert.strictEqual(EigenvectorClass.namespace, "graphty");
            assert.strictEqual(EigenvectorClass.type, "eigenvector");
        });
    });

    describe("Algorithm Execution", () => {
        it("exists", async() => {
            new EigenvectorCentralityAlgorithm(await mockGraph());
        });

        it("calculates eigenvector scores for all nodes", async() => {
            const fakeGraph = await mockGraph({dataPath: "../../../test/helpers/data4.json"});
            const algo = new EigenvectorCentralityAlgorithm(fakeGraph);
            await algo.run();

            for (const node of fakeGraph.nodes.values()) {
                assert.property(node.algorithmResults, "graphty");
                assert.property(node.algorithmResults.graphty, "eigenvector");
                assert.property(node.algorithmResults.graphty.eigenvector, "score");
                assert.property(node.algorithmResults.graphty.eigenvector, "scorePct");

                assert.isNumber(node.algorithmResults.graphty.eigenvector.score);
                assert.isAtLeast(node.algorithmResults.graphty.eigenvector.scorePct, 0);
                assert.isAtMost(node.algorithmResults.graphty.eigenvector.scorePct, 1);
            }
        });

        it("handles empty graph", async() => {
            const emptyGraph = await mockGraph();
            const algo = new EigenvectorCentralityAlgorithm(emptyGraph);
            await algo.run();
            // Should not throw
        });

        it("influential nodes have higher eigenvector centrality", async() => {
            const fakeGraph = await mockGraph({dataPath: "../../../test/helpers/data4.json"});
            const algo = new EigenvectorCentralityAlgorithm(fakeGraph);
            await algo.run();

            // Nodes connected to well-connected nodes should have high eigenvector centrality
            const valjean = fakeGraph.nodes.get("Valjean");
            assert.ok(valjean);
            // Eigenvector scores vary but influential nodes should score well
            assert.isAtLeast(valjean.algorithmResults.graphty.eigenvector.scorePct as number, 0.3);
        });
    });

    describe("Suggested Styles", () => {
        it("has suggested styles defined", () => {
            assert.isTrue(EigenvectorCentralityAlgorithm.hasSuggestedStyles());
        });

        it("returns correct category", () => {
            const styles = EigenvectorCentralityAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.strictEqual(styles.category, "node-metric");
        });

        it("uses StyleHelpers for color mapping with oranges palette", () => {
            const styles = EigenvectorCentralityAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            const layer = styles.layers[0];
            assert.ok(layer);
            assert.ok(layer.node?.calculatedStyle?.expr.includes("StyleHelpers"));
            assert.ok(layer.node?.calculatedStyle?.expr.includes("oranges"));
        });

        it("has layers with correct structure", () => {
            const styles = EigenvectorCentralityAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.property(styles, "layers");
            assert.isArray(styles.layers);
            assert.isAtLeast(styles.layers.length, 1);

            const layer = styles.layers[0];
            assert.ok(layer.node);
            assert.property(layer.node, "calculatedStyle");
            assert.ok(layer.node.calculatedStyle?.inputs.some((input) =>
                input.includes("algorithmResults.graphty.eigenvector"),
            ));
        });
    });
});
