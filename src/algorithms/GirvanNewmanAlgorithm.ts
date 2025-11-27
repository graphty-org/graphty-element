import {girvanNewman} from "@graphty/algorithms";

import type {SuggestedStylesConfig} from "../config";
import {Algorithm} from "./Algorithm";
import {toAlgorithmGraph} from "./utils/graphConverter";

export class GirvanNewmanAlgorithm extends Algorithm {
    static namespace = "graphty";
    static type = "girvan-newman";

    static suggestedStyles = (): SuggestedStylesConfig => ({
        layers: [
            {
                node: {
                    selector: "",
                    style: {
                        enabled: true,
                    },
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.girvan-newman.communityId"],
                        output: "style.texture.color",
                        expr: "{ return StyleHelpers.color.categorical.tolVibrant(arguments[0] ?? 0) }",
                    },
                },
                metadata: {
                    name: "Girvan-Newman - Vibrant Colors",
                    description: "7 high-saturation community colors",
                },
            },
        ],
        description: "Visualizes communities detected via edge betweenness removal",
        category: "grouping",
    });

    // eslint-disable-next-line @typescript-eslint/require-await
    async run(): Promise<void> {
        const g = this.graph;
        const nodes = Array.from(g.getDataManager().nodes.keys());

        if (nodes.length === 0) {
            return;
        }

        // Convert to @graphty/algorithms format (truly undirected for community detection)
        // addReverseEdges: false creates an undirected graph required by girvanNewman
        const graphData = toAlgorithmGraph(g, {addReverseEdges: false});

        // Run Girvan-Newman algorithm - returns CommunityResult[] (dendrogram)
        const results = girvanNewman(graphData);

        // Handle empty results (e.g., graph with no edges)
        if (results.length === 0) {
            // Assign each node to its own community
            for (let i = 0; i < nodes.length; i++) {
                this.addNodeResult(nodes[i], "communityId", i);
            }
            this.addGraphResult("modularity", 0);
            this.addGraphResult("communityCount", nodes.length);
            return;
        }

        // Find the result with highest modularity
        let bestResult = results[0];
        for (const result of results) {
            if (result.modularity > bestResult.modularity) {
                bestResult = result;
            }
        }

        // Store community assignments for each node
        const communityMap = new Map<number | string, number>();
        for (let i = 0; i < bestResult.communities.length; i++) {
            for (const nodeId of bestResult.communities[i]) {
                communityMap.set(nodeId, i);
            }
        }

        // Store results on nodes
        for (const nodeId of nodes) {
            const communityId = communityMap.get(nodeId) ?? 0;
            this.addNodeResult(nodeId, "communityId", communityId);
        }

        // Store graph-level results
        this.addGraphResult("modularity", bestResult.modularity);
        this.addGraphResult("communityCount", bestResult.communities.length);
    }
}

// Auto-register this algorithm when the module is imported
Algorithm.register(GirvanNewmanAlgorithm);
