import {betweennessCentrality} from "@graphty/algorithms";

import type {SuggestedStylesConfig} from "../config";
import {Algorithm} from "./Algorithm";
import {toAlgorithmGraph} from "./utils/graphConverter";

/**
 * Betweenness Centrality Algorithm
 *
 * Measures the extent to which a node lies on paths between other nodes.
 * Nodes with high betweenness centrality are important "bridge" nodes that
 * connect different parts of the graph.
 *
 * Results stored per node:
 * - score: Raw betweenness centrality value
 * - scorePct: Normalized value in [0, 1] range (for visualization)
 */
export class BetweennessCentralityAlgorithm extends Algorithm {
    static namespace = "graphty";
    static type = "betweenness";

    static suggestedStyles = (): SuggestedStylesConfig => ({
        layers: [
            {
                node: {
                    selector: "",
                    style: {
                        enabled: true,
                    },
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.betweenness.scorePct"],
                        output: "style.texture.color",
                        expr: "{ return StyleHelpers.color.sequential.plasma(arguments[0]) }",
                    },
                },
                metadata: {
                    name: "Betweenness - Plasma Gradient",
                    description: "Blue (low) → Pink → Yellow (high) - highlights bridge nodes",
                },
            },
        ],
        description: "Visualizes bridge nodes through color based on betweenness centrality",
        category: "node-metric",
    });

    /**
     * Executes the betweenness centrality algorithm on the graph
     *
     * Computes betweenness centrality scores for all nodes and stores normalized values.
     */
    async run(): Promise<void> {
        const g = this.graph;
        const nodes = Array.from(g.getDataManager().nodes.keys());

        if (nodes.length === 0) {
            return;
        }

        // Convert to @graphty/algorithms format and run
        const graphData = toAlgorithmGraph(g);
        const results = betweennessCentrality(graphData);

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
Algorithm.register(BetweennessCentralityAlgorithm);
