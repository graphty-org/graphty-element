import {katzCentrality} from "@graphty/algorithms";

import type {SuggestedStylesConfig} from "../config";
import {Algorithm} from "./Algorithm";
import {toAlgorithmGraph} from "./utils/graphConverter";

/**
 * Katz Centrality Algorithm
 *
 * A generalization of eigenvector centrality that gives each node a base amount
 * of influence regardless of its position in the network. Uses an attenuation
 * factor (alpha) to control how much a node's centrality depends on its neighbors.
 *
 * Results stored per node:
 * - score: Raw Katz centrality value
 * - scorePct: Normalized value in [0, 1] range (for visualization)
 */
export class KatzCentralityAlgorithm extends Algorithm {
    static namespace = "graphty";
    static type = "katz";

    static suggestedStyles = (): SuggestedStylesConfig => ({
        layers: [
            {
                node: {
                    selector: "",
                    style: {
                        enabled: true,
                    },
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.katz.scorePct"],
                        output: "style.texture.color",
                        expr: "{ return StyleHelpers.color.sequential.blues(arguments[0]) }",
                    },
                },
                metadata: {
                    name: "Katz - Blues Gradient",
                    description: "Light blue (low) → Dark blue (high) - shows attenuated influence",
                },
            },
        ],
        description: "Visualizes node centrality through color based on Katz centrality (attenuated paths)",
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
        const results = katzCentrality(graphData, {normalized: true});

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
Algorithm.register(KatzCentralityAlgorithm);
