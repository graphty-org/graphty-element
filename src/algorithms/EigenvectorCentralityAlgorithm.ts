import {eigenvectorCentrality} from "@graphty/algorithms";

import type {SuggestedStylesConfig} from "../config";
import {Algorithm} from "./Algorithm";
import {toAlgorithmGraph} from "./utils/graphConverter";

/**
 * Eigenvector Centrality Algorithm
 *
 * Measures the influence of a node based on the influence of its neighbors.
 * A node has high eigenvector centrality if it is connected to other nodes
 * that themselves have high eigenvector centrality.
 *
 * Results stored per node:
 * - score: Raw eigenvector centrality value
 * - scorePct: Normalized value in [0, 1] range (for visualization)
 */
export class EigenvectorCentralityAlgorithm extends Algorithm {
    static namespace = "graphty";
    static type = "eigenvector";

    static suggestedStyles = (): SuggestedStylesConfig => ({
        layers: [
            {
                node: {
                    selector: "",
                    style: {
                        enabled: true,
                    },
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.eigenvector.scorePct"],
                        output: "style.texture.color",
                        expr: "{ return StyleHelpers.color.sequential.oranges(arguments[0]) }",
                    },
                },
                metadata: {
                    name: "Eigenvector - Oranges Gradient",
                    description: "Light orange (low) → Dark orange (high) - shows influence",
                },
            },
        ],
        description: "Visualizes node influence through color based on eigenvector centrality",
        category: "node-metric",
    });

    // eslint-disable-next-line @typescript-eslint/require-await
    async run(): Promise<void> {
        const g = this.graph;
        const nodes = Array.from(g.getDataManager().nodes.keys());

        if (nodes.length === 0) {
            return;
        }

        // Convert to @graphty/algorithms format and run
        const graphData = toAlgorithmGraph(g);
        const results = eigenvectorCentrality(graphData, {normalized: true});

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
Algorithm.register(EigenvectorCentralityAlgorithm);
