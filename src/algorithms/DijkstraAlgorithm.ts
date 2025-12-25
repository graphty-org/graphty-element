import {dijkstra, dijkstraPath} from "@graphty/algorithms";
import {z} from "zod/v4";

import {defineOptions, type OptionsSchema as ZodOptionsSchema, type SuggestedStylesConfig} from "../config";
import {Algorithm} from "./Algorithm";
import {type OptionsSchema} from "./types/OptionSchema";
import {toAlgorithmGraph} from "./utils/graphConverter";

/**
 * Zod-based options schema for Dijkstra algorithm
 */
export const dijkstraOptionsSchema = defineOptions({
    source: {
        schema: z.union([z.string(), z.number()]).nullable().default(null),
        meta: {
            label: "Source Node",
            description: "Starting node for shortest path (uses first node if not set)",
        },
    },
    target: {
        schema: z.union([z.string(), z.number()]).nullable().default(null),
        meta: {
            label: "Target Node",
            description: "Destination node for shortest path (uses last node if not set)",
        },
    },
    bidirectional: {
        schema: z.boolean().default(true),
        meta: {
            label: "Bidirectional Search",
            description: "Use bidirectional search optimization for faster point-to-point queries",
            advanced: true,
        },
    },
});

/**
 * Options for Dijkstra algorithm
 */
export interface DijkstraOptions extends Record<string, unknown> {
    /** Starting node for shortest path (defaults to first node if not provided) */
    source: number | string | null;
    /** Destination node for shortest path (defaults to last node if not provided) */
    target: number | string | null;
    /** Use bidirectional search optimization for point-to-point queries */
    bidirectional: boolean;
}

/**
 * Dijkstra's algorithm for finding shortest paths
 *
 * Computes shortest paths from a source node to all other nodes using
 * non-negative edge weights. Supports bidirectional search optimization.
 */
export class DijkstraAlgorithm extends Algorithm<DijkstraOptions> {
    static namespace = "graphty";
    static type = "dijkstra";

    static zodOptionsSchema: ZodOptionsSchema = dijkstraOptionsSchema;

    /**
     * Options schema for Dijkstra algorithm
     */
    static optionsSchema: OptionsSchema = {
        source: {
            type: "nodeId",
            default: null,
            label: "Source Node",
            description: "Starting node for shortest path (uses first node if not set)",
            required: false,
        },
        target: {
            type: "nodeId",
            default: null,
            label: "Target Node",
            description: "Destination node for shortest path (uses last node if not set)",
            required: false,
        },
        bidirectional: {
            type: "boolean",
            default: true,
            label: "Bidirectional Search",
            description: "Use bidirectional search optimization for faster point-to-point queries",
            advanced: true,
        },
    };

    /**
     * Legacy options set via configure() for backward compatibility
     */
    private legacyOptions: {source: number | string, target?: number | string} | null = null;

    static suggestedStyles = (): SuggestedStylesConfig => ({
        layers: [
            {
                edge: {
                    selector: "",
                    style: {enabled: true},
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.dijkstra.isInPath"],
                        output: "style.line.color",
                        expr: "{ return StyleHelpers.color.binary.blueHighlight(arguments[0]) }",
                    },
                },
                metadata: {
                    name: "Dijkstra - Path Edges",
                    description: "Highlights edges that are part of the shortest path (blue) - colorblind-safe",
                },
            },
            {
                node: {
                    selector: "",
                    style: {enabled: true},
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.dijkstra.isInPath"],
                        output: "style.texture.color",
                        expr: "{ return StyleHelpers.color.binary.blueHighlight(arguments[0]) }",
                    },
                },
                metadata: {
                    name: "Dijkstra - Path Nodes",
                    description: "Highlights nodes that are part of the shortest path (blue) - colorblind-safe",
                },
            },
        ],
        description: "Visualizes shortest path by highlighting path edges and nodes",
        category: "path",
    });

    /**
     * Configure the algorithm with source and optional target nodes
     * @param options - Configuration options
     * @param options.source - The source node for shortest path computation
     * @param options.target - The target node (optional)
     * @returns This algorithm instance for chaining
     * @deprecated Use constructor options instead. This method is kept for backward compatibility.
     */
    configure(options: {source: number | string, target?: number | string}): this {
        this.legacyOptions = options;
        return this;
    }

    /**
     * Executes Dijkstra's algorithm on the graph
     *
     * Computes shortest path distances and highlights the path from source to target.
     */
    async run(): Promise<void> {
        const g = this.graph;
        const nodes = Array.from(g.getDataManager().nodes.keys());
        const n = nodes.length;

        if (n === 0) {
            return;
        }

        // Get source and target from legacy options, schema options, or use defaults
        // Legacy configure() takes precedence for backward compatibility
        const source = this.legacyOptions?.source ?? this._schemaOptions.source ?? nodes[0];
        const target = this.legacyOptions?.target ?? this._schemaOptions.target ?? nodes[nodes.length - 1];
        const {bidirectional} = this._schemaOptions;

        // Convert to @graphty/algorithms format (undirected for path finding)
        const graphData = toAlgorithmGraph(g);

        // Run Dijkstra to get path from source to target
        const pathResult = dijkstraPath(graphData, source, target, {bidirectional});
        const path = pathResult?.path ?? [];

        // Run Dijkstra once from source to get all distances
        const allDistances = dijkstra(graphData, source);

        // Store path information on nodes
        const pathNodeSet = new Set(path);
        for (const nodeId of nodes) {
            const isInPath = pathNodeSet.has(nodeId);
            this.addNodeResult(nodeId, "isInPath", isInPath);

            // Get distance from the single Dijkstra run
            const nodeResult = allDistances.get(nodeId);
            const distance = nodeResult?.distance ?? Infinity;
            this.addNodeResult(nodeId, "distance", distance);
        }

        // Store path information on edges
        const pathEdges = this.getPathEdges(path);
        for (const edge of g.getDataManager().edges.values()) {
            const edgeKey = `${edge.srcId}:${edge.dstId}`;
            const reverseEdgeKey = `${edge.dstId}:${edge.srcId}`;
            const isInPath = pathEdges.has(edgeKey) || pathEdges.has(reverseEdgeKey);
            this.addEdgeResult(edge, "isInPath", isInPath);
        }
    }

    /**
     * Get set of edge keys that are part of the path
     * @param path - Array of node IDs representing the path
     * @returns Set of edge keys in "srcId:dstId" format
     */
    private getPathEdges(path: (number | string)[]): Set<string> {
        const edges = new Set<string>();

        for (let i = 0; i < path.length - 1; i++) {
            edges.add(`${path[i]}:${path[i + 1]}`);
        }

        return edges;
    }
}

// Auto-register this algorithm when the module is imported
Algorithm.register(DijkstraAlgorithm);
