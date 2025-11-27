import {pageRank} from "@graphty/algorithms";

import type {SuggestedStylesConfig} from "../config";
import {Algorithm} from "./Algorithm";
import {toAlgorithmGraph} from "./utils/graphConverter";

export class PageRankAlgorithm extends Algorithm {
    static namespace = "graphty";
    static type = "pagerank";

    static suggestedStyles = (): SuggestedStylesConfig => ({
        layers: [
            {
                node: {
                    selector: "",
                    style: {
                        enabled: true,
                    },
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.pagerank.rankPct"],
                        output: "style.shape.size",
                        expr: "{ return StyleHelpers.size.linear(arguments[0], 1, 5) }",
                    },
                },
                metadata: {
                    name: "PageRank - Node Size",
                    description: "Size 1-5 based on PageRank importance",
                },
            },
        ],
        description: "Visualizes node importance through size based on PageRank algorithm",
        category: "node-metric",
    });

    // eslint-disable-next-line @typescript-eslint/require-await
    async run(): Promise<void> {
        const g = this.graph;
        const nodes = Array.from(g.getDataManager().nodes.keys());

        if (nodes.length === 0) {
            return;
        }

        // Convert to @graphty/algorithms format - PageRank requires directed graph
        const graphData = toAlgorithmGraph(g, {directed: true, addReverseEdges: false});

        // Run PageRank algorithm
        const result = pageRank(graphData, {
            dampingFactor: 0.85,
            maxIterations: 100,
            tolerance: 1e-6,
        });

        // Find max rank for normalization
        let maxRank = 0;
        for (const rank of Object.values(result.ranks)) {
            maxRank = Math.max(maxRank, rank);
        }

        // Store results
        for (const nodeId of nodes) {
            const rank = result.ranks[String(nodeId)] ?? 0;
            this.addNodeResult(nodeId, "rank", rank);
            this.addNodeResult(nodeId, "rankPct", maxRank > 0 ? rank / maxRank : 0);
        }

        // Store graph-level results
        this.addGraphResult("iterations", result.iterations);
        this.addGraphResult("converged", result.converged);
        this.addGraphResult("dampingFactor", 0.85);
        this.addGraphResult("maxRank", maxRank);
    }
}

// Auto-register this algorithm when the module is imported
Algorithm.register(PageRankAlgorithm);
