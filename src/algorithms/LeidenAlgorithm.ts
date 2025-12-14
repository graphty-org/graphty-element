import {leiden} from "@graphty/algorithms";

import type {SuggestedStylesConfig} from "../config";
import {Algorithm} from "./Algorithm";
import {countUniqueCommunities} from "./utils/communityUtils";
import {toAdjacencyMap} from "./utils/graphConverter";

export class LeidenAlgorithm extends Algorithm {
    static namespace = "graphty";
    static type = "leiden";

    static suggestedStyles = (): SuggestedStylesConfig => ({
        layers: [
            {
                node: {
                    selector: "",
                    style: {
                        enabled: true,
                    },
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.leiden.communityId"],
                        output: "style.texture.color",
                        expr: "{ return StyleHelpers.color.categorical.tolMuted(arguments[0] ?? 0) }",
                    },
                },
                metadata: {
                    name: "Leiden - Muted Colors",
                    description: "7 subdued professional community colors",
                },
            },
        ],
        description: "Visualizes communities detected via Leiden algorithm (improved Louvain)",
        category: "grouping",
    });

    // eslint-disable-next-line @typescript-eslint/require-await
    async run(): Promise<void> {
        const g = this.graph;
        const nodes = Array.from(g.getDataManager().nodes.keys());

        if (nodes.length === 0) {
            return;
        }

        // Convert to adjacency map format (required by leiden)
        const graphData = toAdjacencyMap(g);

        // Run Leiden algorithm - returns {communities: Map<string, number>, modularity, iterations}
        const result = leiden(graphData, {
            resolution: 1.0,
            maxIterations: 100,
            threshold: 1e-6,
        });

        // Store results on nodes
        for (const nodeId of nodes) {
            const communityId = result.communities.get(String(nodeId)) ?? 0;
            this.addNodeResult(nodeId, "communityId", communityId);
        }

        // Store graph-level results
        this.addGraphResult("modularity", result.modularity);
        this.addGraphResult("communityCount", countUniqueCommunities(result.communities));
        this.addGraphResult("iterations", result.iterations);
    }
}

// Auto-register this algorithm when the module is imported
Algorithm.register(LeidenAlgorithm);
