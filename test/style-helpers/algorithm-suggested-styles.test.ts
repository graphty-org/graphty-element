/**
 * @fileoverview Tests to ensure all algorithm suggestedStyles use StyleHelpers
 * instead of hardcoded colors for accessibility (colorblind safety).
 */
import {assert, describe, it} from "vitest";

import {AlgorithmStatics} from "../../src/algorithms/Algorithm";
// Import all algorithm modules to trigger auto-registration
import {BFSAlgorithm} from "../../src/algorithms/BFSAlgorithm";
import {BipartiteMatchingAlgorithm} from "../../src/algorithms/BipartiteMatchingAlgorithm";
import {ConnectedComponentsAlgorithm} from "../../src/algorithms/ConnectedComponentsAlgorithm";
import {DegreeAlgorithm} from "../../src/algorithms/DegreeAlgorithm";
import {DFSAlgorithm} from "../../src/algorithms/DFSAlgorithm";
import {DijkstraAlgorithm} from "../../src/algorithms/DijkstraAlgorithm";
import {GirvanNewmanAlgorithm} from "../../src/algorithms/GirvanNewmanAlgorithm";
import {KruskalAlgorithm} from "../../src/algorithms/KruskalAlgorithm";
import {LabelPropagationAlgorithm} from "../../src/algorithms/LabelPropagationAlgorithm";
import {LeidenAlgorithm} from "../../src/algorithms/LeidenAlgorithm";
import {LouvainAlgorithm} from "../../src/algorithms/LouvainAlgorithm";
import {MaxFlowAlgorithm} from "../../src/algorithms/MaxFlowAlgorithm";
import {MinCutAlgorithm} from "../../src/algorithms/MinCutAlgorithm";
import {PageRankAlgorithm} from "../../src/algorithms/PageRankAlgorithm";
import {PrimAlgorithm} from "../../src/algorithms/PrimAlgorithm";
import {StronglyConnectedComponentsAlgorithm} from "../../src/algorithms/StronglyConnectedComponentsAlgorithm";

// All algorithms with their registry keys
const algorithmClasses: [string, AlgorithmStatics][] = [
    ["graphty:bfs", BFSAlgorithm],
    ["graphty:bipartite-matching", BipartiteMatchingAlgorithm],
    ["graphty:connected-components", ConnectedComponentsAlgorithm],
    ["graphty:degree", DegreeAlgorithm],
    ["graphty:dfs", DFSAlgorithm],
    ["graphty:dijkstra", DijkstraAlgorithm],
    ["graphty:girvan-newman", GirvanNewmanAlgorithm],
    ["graphty:kruskal", KruskalAlgorithm],
    ["graphty:label-propagation", LabelPropagationAlgorithm],
    ["graphty:leiden", LeidenAlgorithm],
    ["graphty:louvain", LouvainAlgorithm],
    ["graphty:max-flow", MaxFlowAlgorithm],
    ["graphty:min-cut", MinCutAlgorithm],
    ["graphty:pagerank", PageRankAlgorithm],
    ["graphty:prim", PrimAlgorithm],
    ["graphty:scc", StronglyConnectedComponentsAlgorithm],
];

describe("Algorithm suggestedStyles colorblind safety", () => {
    it("all algorithms with suggested styles use StyleHelpers or no hardcoded colors", () => {
        const hardcodedColorPattern = /#[0-9a-fA-F]{6}/g;
        const offendingAlgorithms: string[] = [];

        for (const [key, AlgorithmClass] of algorithmClasses) {
            if (AlgorithmClass.hasSuggestedStyles()) {
                const styles = AlgorithmClass.getSuggestedStyles();
                if (styles) {
                    const stylesJson = JSON.stringify(styles);

                    // Check for hardcoded colors
                    const matches = stylesJson.match(hardcodedColorPattern);
                    if (matches) {
                        offendingAlgorithms.push(`${key} (colors: ${matches.join(", ")})`);
                    }
                }
            }
        }

        assert.deepStrictEqual(
            offendingAlgorithms,
            [],
            `Algorithms with hardcoded colors should use StyleHelpers instead:\n${offendingAlgorithms.join("\n")}`,
        );
    });

    it("all algorithms use calculatedStyle or StyleHelpers for colors", () => {
        // List of algorithms that should use calculatedStyle for colors
        const algorithmsWithBinaryHighlighting = [
            "graphty:dijkstra",
            "graphty:kruskal",
            "graphty:prim",
            "graphty:min-cut",
            "graphty:max-flow",
            "graphty:bipartite-matching",
        ];

        for (const algorithmKey of algorithmsWithBinaryHighlighting) {
            const entry = algorithmClasses.find(([key]) => key === algorithmKey);
            assert.ok(entry, `Algorithm ${algorithmKey} should be in the list`);

            const [, AlgorithmClass] = entry;

            // Check that it has suggested styles
            if (AlgorithmClass.hasSuggestedStyles()) {
                const styles = AlgorithmClass.getSuggestedStyles();
                assert.ok(styles, `${algorithmKey} should have suggested styles`);

                // Verify layers exist
                assert.ok(
                    styles.layers.length > 0,
                    `${algorithmKey} should have at least one layer`,
                );
            }
        }
    });
});
