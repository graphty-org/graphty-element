import {closenessCentrality} from "@graphty/algorithms";

import type {SuggestedStylesConfig} from "../config";
import {Algorithm} from "./Algorithm";
import {toAlgorithmGraph} from "./utils/graphConverter";

/**
 * Closeness Centrality Algorithm
 *
 * Measures how close a node is to all other nodes in the graph.
 * Nodes with high closeness centrality can reach other nodes quickly
 * and are well-positioned for information flow.
 *
 * Results stored per node:
 * - score: Raw closeness centrality value
 * - scorePct: Normalized value in [0, 1] range (for visualization)
 */
export class ClosenessCentralityAlgorithm extends Algorithm {
    static namespace = "graphty";
    static type = "closeness";

    static suggestedStyles = (): SuggestedStylesConfig => ({
        layers: [
            {
                node: {
                    selector: "",
                    style: {
                        enabled: true,
                    },
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.closeness.scorePct"],
                        output: "style.texture.color",
                        expr: "{ return StyleHelpers.color.sequential.greens(arguments[0]) }",
                    },
                },
                metadata: {
                    name: "Closeness - Greens Gradient",
                    description: "Light green (low) → Dark green (high) - shows accessibility",
                },
            },
        ],
        description: "Visualizes node accessibility through color based on closeness centrality",
        category: "node-metric",
    });

    /**
     * Executes the closeness centrality algorithm on the graph
     *
     * Computes closeness centrality scores for all nodes and stores normalized values.
     */
    async run(): Promise<void> {
        const g = this.graph;
        const nodes = Array.from(g.getDataManager().nodes.keys());

        if (nodes.length === 0) {
            return;
        }

        // Convert to @graphty/algorithms format and run
        const graphData = toAlgorithmGraph(g);
        const results = closenessCentrality(graphData);

        // Find min/max for min-max normalization
        // This ensures values spread across full 0-1 range for better visual differentiation
        let minScore = Infinity;
        let maxScore = -Infinity;
        for (const score of Object.values(results)) {
            minScore = Math.min(minScore, score);
            maxScore = Math.max(maxScore, score);
        }

        // Store results with min-max normalization
        const range = maxScore - minScore;
        for (const nodeId of nodes) {
            const score = results[String(nodeId)] ?? 0;
            this.addNodeResult(nodeId, "score", score);
            this.addNodeResult(nodeId, "scorePct", range > 0 ? (score - minScore) / range : 0);
        }
    }
}

// Auto-register this algorithm when the module is imported
Algorithm.register(ClosenessCentralityAlgorithm);
