import {breadthFirstSearch} from "@graphty/algorithms";
import {z} from "zod/v4";

import {defineOptions, type OptionsSchema as ZodOptionsSchema, type SuggestedStylesConfig} from "../config";
import type {Graph} from "../Graph";
import {Algorithm} from "./Algorithm";
import {type OptionsSchema} from "./types/OptionSchema";
import {toAlgorithmGraph} from "./utils/graphConverter";

/**
 * Zod-based options schema for BFS algorithm
 */
export const bfsOptionsSchema = defineOptions({
    source: {
        schema: z.union([z.string(), z.number()]).nullable().default(null),
        meta: {
            label: "Source Node",
            description: "Starting node for BFS traversal (uses first node if not set)",
        },
    },
    targetNode: {
        schema: z.union([z.string(), z.number()]).nullable().default(null),
        meta: {
            label: "Target Node",
            description: "Target node for early termination (optional - searches all nodes if not set)",
            advanced: true,
        },
    },
});

/**
 * Options for BFS algorithm
 */
export interface BFSOptions extends Record<string, unknown> {
    /** Starting node for traversal (defaults to first node if not provided) */
    source: number | string | null;
    /** Target node for early termination (optional) */
    targetNode: number | string | null;
}

export class BFSAlgorithm extends Algorithm<BFSOptions> {
    static namespace = "graphty";
    static type = "bfs";

    static zodOptionsSchema: ZodOptionsSchema = bfsOptionsSchema;

    /**
     * Options schema for BFS algorithm
     */
    static optionsSchema: OptionsSchema = {
        source: {
            type: "nodeId",
            default: null,
            label: "Source Node",
            description: "Starting node for BFS traversal (uses first node if not set)",
            required: false,
        },
        targetNode: {
            type: "nodeId",
            default: null,
            label: "Target Node",
            description: "Target node for early termination (optional - searches all nodes if not set)",
            required: false,
            advanced: true,
        },
    };

    /**
     * Legacy options set via configure() for backward compatibility
     */
    private legacyOptions: {source: number | string} | null = null;

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
        ],
        description: "Visualizes breadth-first traversal levels from source node",
        category: "hierarchy",
    });

    /**
     * Configure the algorithm with source node
     *
     * @deprecated Use constructor options instead. This method is kept for backward compatibility.
     */
    configure(options: {source: number | string}): this {
        this.legacyOptions = options;
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

        // Get source from legacy options, schema options, or use first node as default
        // Legacy configure() takes precedence for backward compatibility
        const source = this.legacyOptions?.source ?? this._schemaOptions.source ?? nodes[0];
        const targetNode = this._schemaOptions.targetNode ?? undefined;

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
        let foundTarget = false;

        // Use visitCallback to track levels
        breadthFirstSearch(graphData, source, {
            targetNode,
            visitCallback: (node, level) => {
                levels.set(node, level);
                visitOrders.set(node, visitOrder);
                visitOrder++;
                if (level > maxLevel) {
                    maxLevel = level;
                }

                if (targetNode !== undefined && node === targetNode) {
                    foundTarget = true;
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
        if (targetNode !== undefined) {
            this.addGraphResult("targetFound", foundTarget);
        }
    }
}

// Auto-register this algorithm when the module is imported
Algorithm.register(BFSAlgorithm);
