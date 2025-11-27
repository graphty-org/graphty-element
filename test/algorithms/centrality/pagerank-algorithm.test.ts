import {assert, describe, it} from "vitest";

import {PageRankAlgorithm} from "../../../src/algorithms/PageRankAlgorithm";
import {AdHocData} from "../../../src/config";

interface MockGraphOpts {
    dataPath?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function mockGraph(opts: MockGraphOpts = {}): Promise<any> {
    const nodes = new Map<string | number, AdHocData>();
    const edges = new Map<string | number, AdHocData>();

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
            };
        },
    };

    return fakeGraph;
}

describe("PageRankAlgorithm", () => {
    it("exists", async() => {
        new PageRankAlgorithm(await mockGraph());
    });

    it("calculates pagerank scores", async() => {
        const fakeGraph = await mockGraph({dataPath: "../../../test/helpers/data4.json"});
        const pr = new PageRankAlgorithm(fakeGraph);

        await pr.run();

        // Check that all nodes have pagerank results
        for (const node of fakeGraph.nodes.values()) {
            assert.property(node.algorithmResults, "graphty");
            assert.property(node.algorithmResults.graphty, "pagerank");
            assert.property(node.algorithmResults.graphty.pagerank, "rank");
            assert.property(node.algorithmResults.graphty.pagerank, "rankPct");

            // Verify rank is a number and in valid range
            assert.isNumber(node.algorithmResults.graphty.pagerank.rank);
            assert.isAtLeast(node.algorithmResults.graphty.pagerank.rank, 0);

            // Verify rankPct is normalized [0,1]
            assert.isNumber(node.algorithmResults.graphty.pagerank.rankPct);
            assert.isAtLeast(node.algorithmResults.graphty.pagerank.rankPct, 0);
            assert.isAtMost(node.algorithmResults.graphty.pagerank.rankPct, 1);
        }

        // Sum of all ranks should be approximately 1.0
        let totalRank = 0;
        for (const node of fakeGraph.nodes.values()) {
            totalRank += node.algorithmResults.graphty.pagerank.rank as number;
        }
        assert.approximately(totalRank, 1.0, 0.0001);
    });

    it("has suggested styles", () => {
        assert.isTrue(PageRankAlgorithm.hasSuggestedStyles());

        const styles = PageRankAlgorithm.getSuggestedStyles();
        assert.ok(styles);
        assert.property(styles, "layers");
        assert.isArray(styles.layers);
        assert.isAtLeast(styles.layers.length, 1);
    });

    it("suggested styles target pagerank results", () => {
        const styles = PageRankAlgorithm.getSuggestedStyles();
        assert.ok(styles);

        // Check that at least one layer uses pagerank data
        const hasPageRankInput = styles.layers.some((layer) => {
            if (layer.node?.calculatedStyle) {
                return layer.node.calculatedStyle.inputs.some((input) =>
                    input.includes("algorithmResults.graphty.pagerank"),
                );
            }

            return false;
        });

        assert.isTrue(hasPageRankInput, "Suggested styles should reference pagerank results");
    });

    it("suggested styles use size", () => {
        const styles = PageRankAlgorithm.getSuggestedStyles();

        assert.ok(styles);

        // Filter and map to get outputs
        const outputs: string[] = [];
        for (const layer of styles.layers) {
            if (layer.node?.calculatedStyle) {
                outputs.push(layer.node.calculatedStyle.output);
            }
        }

        // Should have size output
        assert.isTrue(
            outputs.some((output) => output.includes("size")),
            "Should have size styling",
        );

        // PageRank focuses on size, leaving color for Degree algorithm
        assert.strictEqual(outputs.length, 1, "Should have exactly one style layer");
    });
});
