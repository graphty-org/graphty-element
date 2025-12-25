import {depthFirstSearch} from "@graphty/algorithms";
import {z} from "zod/v4";

import {defineOptions, type OptionsSchema as ZodOptionsSchema, type SuggestedStylesConfig} from "../config";
import {Algorithm} from "./Algorithm";
import {type OptionsSchema} from "./types/OptionSchema";
import {toAlgorithmGraph} from "./utils/graphConverter";

/**
 * Zod-based options schema for DFS algorithm
 */
export const dfsOptionsSchema = defineOptions({
    source: {
        schema: z.union([z.string(), z.number()]).nullable().default(null),
        meta: {
            label: "Source Node",
            description: "Starting node for DFS traversal (uses first node if not set)",
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
    recursive: {
        schema: z.boolean().default(false),
        meta: {
            label: "Recursive",
            description: "Use recursive implementation instead of iterative (may cause stack overflow on large graphs)",
            advanced: true,
        },
    },
    preOrder: {
        schema: z.boolean().default(true),
        meta: {
            label: "Pre-Order",
            description: "Visit nodes before their children (pre-order) vs after (post-order)",
            advanced: true,
        },
    },
});

/**
 * Options for DFS algorithm
 */
export interface DFSOptions extends Record<string, unknown> {
    /** Starting node for traversal (defaults to first node if not provided) */
    source: number | string | null;
    /** Target node for early termination (optional) */
    targetNode: number | string | null;
    /** Use recursive implementation vs iterative */
    recursive: boolean;
    /** Use pre-order traversal (visit before children) vs post-order */
    preOrder: boolean;
}

/**
 * Depth-First Search (DFS) algorithm for graph traversal
 *
 * Performs a depth-first traversal from a source node, computing discovery time,
 * finish time, and predecessor relationships for each reachable node.
 */
export class DFSAlgorithm extends Algorithm<DFSOptions> {
    static namespace = "graphty";
    static type = "dfs";

    static zodOptionsSchema: ZodOptionsSchema = dfsOptionsSchema;

    /**
     * Options schema for DFS algorithm
     */
    static optionsSchema: OptionsSchema = {
        source: {
            type: "nodeId",
            default: null,
            label: "Source Node",
            description: "Starting node for DFS traversal (uses first node if not set)",
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
        recursive: {
            type: "boolean",
            default: false,
            label: "Recursive",
            description: "Use recursive implementation instead of iterative (may cause stack overflow on large graphs)",
            advanced: true,
        },
        preOrder: {
            type: "boolean",
            default: true,
            label: "Pre-Order",
            description: "Visit nodes before their children (pre-order) vs after (post-order)",
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
        ],
        description: "Visualizes depth-first traversal discovery order from source node",
        category: "hierarchy",
    });

    /**
     * Configure the algorithm with source node
     * @param options - Configuration options
     * @param options.source - The source node to start DFS from
     * @returns This algorithm instance for chaining
     * @deprecated Use constructor options instead. This method is kept for backward compatibility.
     */
    configure(options: {source: number | string}): this {
        this.legacyOptions = options;
        return this;
    }

    /**
     * Executes the DFS algorithm on the graph
     *
     * Computes discovery time, finish time, and predecessor information for all reachable nodes.
     */
    async run(): Promise<void> {
        const g = this.graph;
        const dm = g.getDataManager();
        const nodes = Array.from(dm.nodes.keys());

        if (nodes.length === 0) {
            return;
        }

        // Get source from legacy options, schema options, or use first node as default
        // Legacy configure() takes precedence for backward compatibility
        const source = this.legacyOptions?.source ?? this._schemaOptions.source ?? nodes[0];
        const {targetNode, recursive, preOrder} = this._schemaOptions;

        // Check if source exists
        if (!dm.nodes.has(source)) {
            return;
        }

        // Convert to @graphty/algorithms format (undirected for traversal)
        const graphData = toAlgorithmGraph(g);

        // Run DFS algorithm - returns {visited: Set, order: NodeId[], tree?: Map}
        const result = depthFirstSearch(graphData, source, {
            targetNode: targetNode ?? undefined,
            recursive,
            preOrder,
        });

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
