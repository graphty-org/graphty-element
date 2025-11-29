import {assert, describe, it} from "vitest";

import {PageRankAlgorithm} from "../../../src/algorithms/PageRankAlgorithm";
import {createMockGraph, getGraphResult, getNodeResult} from "../../helpers/mockGraph";

describe("PageRankAlgorithm", () => {
    it("exists", async() => {
        new PageRankAlgorithm(await createMockGraph());
    });

    it("calculates pagerank scores", async() => {
        const graph = await createMockGraph({dataPath: "./data4.json"});
        const pr = new PageRankAlgorithm(graph);

        await pr.run();

        // Check that all nodes have pagerank results
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dm = graph.getDataManager() as any;
        for (const [nodeId] of dm.nodes) {
            const rank = getNodeResult(graph, nodeId, "graphty", "pagerank", "rank");
            const rankPct = getNodeResult(graph, nodeId, "graphty", "pagerank", "rankPct");

            // Verify rank is a number and in valid range
            assert.isNumber(rank);
            assert.isAtLeast(rank, 0);

            // Verify rankPct is normalized [0,1]
            assert.isNumber(rankPct);
            assert.isAtLeast(rankPct, 0);
            assert.isAtMost(rankPct, 1);
        }

        // Sum of all ranks should be approximately 1.0
        let totalRank = 0;
        for (const [nodeId] of dm.nodes) {
            const rank = getNodeResult(graph, nodeId, "graphty", "pagerank", "rank");
            totalRank += rank as number;
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

    it("stores graph-level convergence info", async() => {
        const graph = await createMockGraph({dataPath: "./data4.json"});
        const pr = new PageRankAlgorithm(graph);
        await pr.run();

        // Graph-level results should be present
        const iterations = getGraphResult(graph, "graphty", "pagerank", "iterations");
        const converged = getGraphResult(graph, "graphty", "pagerank", "converged");
        const dampingFactor = getGraphResult(graph, "graphty", "pagerank", "dampingFactor");
        const maxRank = getGraphResult(graph, "graphty", "pagerank", "maxRank");

        assert.isDefined(iterations);
        assert.isDefined(converged);
        assert.isDefined(dampingFactor);
        assert.isDefined(maxRank);

        // Check specific values
        assert.isNumber(iterations);
        assert.isAtLeast(iterations, 1, "Should have at least 1 iteration");

        assert.strictEqual(dampingFactor, 0.85, "Damping factor should be 0.85");

        assert.isNumber(maxRank);
        assert.isAtLeast(maxRank, 0, "Max rank should be non-negative");
    });

    it("handles empty graph gracefully", async() => {
        const graph = await createMockGraph({
            nodes: [],
            edges: [],
        });

        const pr = new PageRankAlgorithm(graph);
        await pr.run();

        // Empty graph should not throw and should not have graph results
        // With empty graph, run() returns early without setting graphResults
        const iterations = getGraphResult(graph, "graphty", "pagerank", "iterations");
        assert.isUndefined(iterations);
    });
});
