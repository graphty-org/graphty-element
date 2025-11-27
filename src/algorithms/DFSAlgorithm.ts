import {depthFirstSearch} from "@graphty/algorithms";

import type {SuggestedStylesConfig} from "../config";
import {Algorithm} from "./Algorithm";
import {toAlgorithmGraph} from "./utils/graphConverter";

interface DFSOptions {
    source: number | string;
}

export class DFSAlgorithm extends Algorithm {
    static namespace = "graphty";
    static type = "dfs";
    private options: DFSOptions | null = null;

    static suggestedStyles = (): SuggestedStylesConfig => ({
        layers: [
            {
                node: {
                    selector: "",
                    style: {enabled: true},
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.dfs.discoveryTimePct"],
                        output: "style.texture.color",
                        expr: "{ return StyleHelpers.color.sequential.inferno(arguments[0] ?? 0) }",
                    },
                },
                metadata: {
                    name: "DFS - Discovery Time Colors",
                    description: "Colors nodes by DFS discovery time (inferno gradient: black to yellow)",
                },
            },
            {
                node: {
                    selector: "",
                    style: {enabled: true},
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.dfs.discoveryTimePct"],
                        output: "style.shape.size",
                        expr: "{ return StyleHelpers.size.linear(1 - (arguments[0] ?? 0), 1, 3) }",
                    },
                },
                metadata: {
                    name: "DFS - Discovery Time Size",
                    description: "Larger nodes are discovered earlier",
                },
            },
        ],
        description: "Visualizes depth-first traversal discovery order from source node",
        category: "hierarchy",
    });

    /**
     * Configure the algorithm with source node
     */
    configure(options: DFSOptions): this {
        this.options = options;
        return this;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async run(): Promise<void> {
        const g = this.graph;
        const dm = g.getDataManager();
        const nodes = Array.from(dm.nodes.keys());

        if (nodes.length === 0) {
            return;
        }

        // Get source from options or use first node as default
        const source = this.options?.source ?? nodes[0];

        // Check if source exists
        if (!dm.nodes.has(source)) {
            return;
        }

        // Convert to @graphty/algorithms format (undirected for traversal)
        const graphData = toAlgorithmGraph(g);

        // Run DFS algorithm - returns {visited: Set, order: NodeId[], tree?: Map}
        const result = depthFirstSearch(graphData, source);

        // Build discovery time map from order array (index = discovery time)
        const discoveryTimeMap = new Map<number | string, number>();
        for (let i = 0; i < result.order.length; i++) {
            discoveryTimeMap.set(result.order[i], i);
        }

        // Max discovery time for normalization
        const maxTime = result.order.length > 0 ? result.order.length - 1 : 0;

        // Store results on nodes
        for (const nodeId of nodes) {
            const discoveryTime = discoveryTimeMap.get(nodeId);
            const isVisited = result.visited.has(nodeId);

            this.addNodeResult(nodeId, "visited", isVisited);

            if (discoveryTime !== undefined) {
                this.addNodeResult(nodeId, "discoveryTime", discoveryTime);
                // Normalize discovery time to percentage
                const discoveryTimePct = maxTime > 0 ? discoveryTime / maxTime : 0;
                this.addNodeResult(nodeId, "discoveryTimePct", discoveryTimePct);
            }
        }

        // Store graph-level results
        this.addGraphResult("maxTime", maxTime);
        this.addGraphResult("visitedCount", result.visited.size);
    }
}

// Auto-register this algorithm when the module is imported
Algorithm.register(DFSAlgorithm);
