import {breadthFirstSearch} from "@graphty/algorithms";

import type {SuggestedStylesConfig} from "../config";
import type {Graph} from "../Graph";
import {Algorithm} from "./Algorithm";
import {toAlgorithmGraph} from "./utils/graphConverter";

interface BFSOptions {
    source: number | string;
}

export class BFSAlgorithm extends Algorithm {
    static namespace = "graphty";
    static type = "bfs";
    private options: BFSOptions | null = null;

    static suggestedStyles = (): SuggestedStylesConfig => ({
        layers: [
            {
                node: {
                    selector: "",
                    style: {enabled: true},
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.bfs.levelPct"],
                        output: "style.texture.color",
                        expr: "{ return StyleHelpers.color.sequential.viridis(arguments[0] ?? 0) }",
                    },
                },
                metadata: {
                    name: "BFS - Level Colors",
                    description: "Colors nodes by BFS level from source (viridis gradient)",
                },
            },
            {
                node: {
                    selector: "",
                    style: {enabled: true},
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.bfs.levelPct"],
                        output: "style.shape.size",
                        expr: "{ return StyleHelpers.size.linear(1 - (arguments[0] ?? 0), 1, 3) }",
                    },
                },
                metadata: {
                    name: "BFS - Level Size",
                    description: "Larger nodes are closer to source",
                },
            },
        ],
        description: "Visualizes breadth-first traversal levels from source node",
        category: "hierarchy",
    });

    /**
     * Configure the algorithm with source node
     */
    configure(options: BFSOptions): this {
        this.options = options;
        return this;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async run(): Promise<void> {
        const g = this.graph;
        const dm = g.getDataManager();
        const nodes = Array.from(dm.nodes.keys());
        const n = nodes.length;

        if (n === 0) {
            return;
        }

        // Get source from options or use first node as default
        const source = this.options?.source ?? nodes[0];

        // Convert to @graphty/algorithms format
        // Using directed=false so the converter adds reverse edges for undirected traversal
        const graphData = toAlgorithmGraph(g as unknown as Graph, {directed: false});

        // Check if source exists
        if (!graphData.hasNode(source)) {
            // Source not in graph - nothing to do
            return;
        }

        // Track levels and visit order manually since breadthFirstSearch doesn't return them directly
        const levels = new Map<string | number, number>();
        const visitOrders = new Map<string | number, number>();
        let visitOrder = 0;
        let maxLevel = 0;

        // Use visitCallback to track levels
        breadthFirstSearch(graphData, source, {
            visitCallback: (node, level) => {
                levels.set(node, level);
                visitOrders.set(node, visitOrder);
                visitOrder++;
                if (level > maxLevel) {
                    maxLevel = level;
                }
            },
        });

        // Store results on nodes
        for (const nodeId of nodes) {
            const level = levels.get(nodeId);
            const order = visitOrders.get(nodeId);

            if (level !== undefined) {
                this.addNodeResult(nodeId, "level", level);
                // Normalize level to percentage
                const levelPct = maxLevel > 0 ? level / maxLevel : 0;
                this.addNodeResult(nodeId, "levelPct", levelPct);
            }

            if (order !== undefined) {
                this.addNodeResult(nodeId, "visitOrder", order);
            }
        }

        // Store graph-level results
        this.addGraphResult("maxLevel", maxLevel);
        this.addGraphResult("visitedCount", levels.size);
    }
}

// Auto-register this algorithm when the module is imported
Algorithm.register(BFSAlgorithm);
