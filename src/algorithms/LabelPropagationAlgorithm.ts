import {labelPropagation} from "@graphty/algorithms";

import type {SuggestedStylesConfig} from "../config";
import {Algorithm} from "./Algorithm";
import {countUniqueCommunities} from "./utils/communityUtils";
import {toAdjacencyMap} from "./utils/graphConverter";

export class LabelPropagationAlgorithm extends Algorithm {
    static namespace = "graphty";
    static type = "label-propagation";

    static suggestedStyles = (): SuggestedStylesConfig => ({
        layers: [
            {
                node: {
                    selector: "",
                    style: {
                        enabled: true,
                    },
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.label-propagation.communityId"],
                        output: "style.texture.color",
                        expr: "{ return StyleHelpers.color.categorical.pastel(arguments[0] ?? 0) }",
                    },
                },
                metadata: {
                    name: "Label Propagation - Pastel Colors",
                    description: "8 soft pastel community colors",
                },
            },
        ],
        description: "Visualizes communities detected via fast label propagation",
        category: "grouping",
    });

    // eslint-disable-next-line @typescript-eslint/require-await
    async run(): Promise<void> {
        const g = this.graph;
        const nodes = Array.from(g.getDataManager().nodes.keys());

        if (nodes.length === 0) {
            return;
        }

        // Convert to adjacency map format (required by labelPropagation)
        const graphData = toAdjacencyMap(g);

        // Run Label Propagation algorithm - returns {communities: Map<string, number>, iterations, converged}
        const result = labelPropagation(graphData, {
            maxIterations: 100,
        });

        // Store results on nodes
        for (const nodeId of nodes) {
            const communityId = result.communities.get(String(nodeId)) ?? 0;
            this.addNodeResult(nodeId, "communityId", communityId);
        }

        // Store graph-level results
        this.addGraphResult("communityCount", countUniqueCommunities(result.communities));
        this.addGraphResult("converged", result.converged);
        this.addGraphResult("iterations", result.iterations);
    }
}

// Auto-register this algorithm when the module is imported
Algorithm.register(LabelPropagationAlgorithm);
