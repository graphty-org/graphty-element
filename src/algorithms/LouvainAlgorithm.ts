import {louvain} from "@graphty/algorithms";

import type {SuggestedStylesConfig} from "../config";
import {Algorithm} from "./Algorithm";
import {toAlgorithmGraph} from "./utils/graphConverter";

export class LouvainAlgorithm extends Algorithm {
    static namespace = "graphty";
    static type = "louvain";

    static suggestedStyles = (): SuggestedStylesConfig => ({
        layers: [
            {
                node: {
                    selector: "",
                    style: {
                        enabled: true,
                    },
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.louvain.communityId"],
                        output: "style.texture.color",
                        expr: "{ return StyleHelpers.color.categorical.okabeIto(arguments[0] ?? 0) }",
                    },
                },
                metadata: {
                    name: "Louvain - Okabe-Ito Colors",
                    description: "8 vivid colorblind-safe community colors",
                },
            },
        ],
        description: "Visualizes graph communities through distinct colors",
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
        // addReverseEdges: false creates an undirected graph required by louvain
        const graphData = toAlgorithmGraph(g, {addReverseEdges: false});

        // Run Louvain algorithm
        const result = louvain(graphData, {
            resolution: 1.0,
            maxIterations: 100,
            tolerance: 1e-6,
        });

        // Store community assignments for each node
        const communityMap = new Map<number | string, number>();
        for (let i = 0; i < result.communities.length; i++) {
            for (const nodeId of result.communities[i]) {
                communityMap.set(nodeId, i);
            }
        }

        // Store results on nodes
        for (const nodeId of nodes) {
            const communityId = communityMap.get(nodeId) ?? 0;
            this.addNodeResult(nodeId, "communityId", communityId);
        }
    }
}

// Auto-register this algorithm when the module is imported
Algorithm.register(LouvainAlgorithm);
