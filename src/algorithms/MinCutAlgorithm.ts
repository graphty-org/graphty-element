/**
 * @fileoverview Minimum Cut Algorithm wrapper
 *
 * This algorithm finds the minimum cut that separates a source from a sink
 * or the global minimum cut of a graph. Uses the max-flow min-cut theorem.
 */

import {Graph as AlgorithmGraph, kargerMinCut, minSTCut, stoerWagner} from "@graphty/algorithms";
import {z} from "zod/v4";

import {defineOptions, type OptionsSchema as ZodOptionsSchema, type SuggestedStylesConfig} from "../config";
import {Algorithm} from "./Algorithm";
import {type OptionsSchema} from "./types/OptionSchema";

/**
 * Zod-based options schema for Min Cut algorithm
 */
export const minCutOptionsSchema = defineOptions({
    source: {
        schema: z.union([z.string(), z.number()]).nullable().default(null),
        meta: {
            label: "Source Node",
            description: "Source node for s-t cut (uses global min cut if not set)",
        },
    },
    sink: {
        schema: z.union([z.string(), z.number()]).nullable().default(null),
        meta: {
            label: "Sink Node",
            description: "Sink node for s-t cut (uses global min cut if not set)",
        },
    },
    useGlobalMinCut: {
        schema: z.boolean().default(false),
        meta: {
            label: "Use Global Min Cut",
            description: "Use global minimum cut algorithm instead of s-t cut",
        },
    },
    useKarger: {
        schema: z.boolean().default(false),
        meta: {
            label: "Use Karger Algorithm",
            description: "Use Karger's randomized algorithm instead of Stoer-Wagner for global min cut",
            advanced: true,
        },
    },
    kargerIterations: {
        schema: z.number().int().min(1).max(10000).default(100),
        meta: {
            label: "Karger Iterations",
            description: "Number of iterations for Karger's algorithm (higher = better accuracy but slower)",
            advanced: true,
        },
    },
});

/**
 * Options for Min Cut algorithm
 */
export interface MinCutOptions extends Record<string, unknown> {
    /** Source node for s-t cut (optional - uses global min cut if not provided) */
    source: string | number | null;
    /** Sink node for s-t cut (optional - uses global min cut if not provided) */
    sink: string | number | null;
    /** Whether to use Stoer-Wagner global minimum cut instead of s-t cut */
    useGlobalMinCut: boolean;
    /** Whether to use Karger's randomized algorithm instead of Stoer-Wagner for global min cut */
    useKarger: boolean;
    /** Number of iterations for Karger's algorithm (higher = better accuracy) */
    kargerIterations: number;
}

export class MinCutAlgorithm extends Algorithm<MinCutOptions> {
    static namespace = "graphty";
    static type = "min-cut";

    static zodOptionsSchema: ZodOptionsSchema = minCutOptionsSchema;

    /**
     * Options schema for Min Cut algorithm
     */
    static optionsSchema: OptionsSchema = {
        source: {
            type: "nodeId",
            default: null,
            label: "Source Node",
            description: "Source node for s-t cut (uses global min cut if not set)",
            required: false,
        },
        sink: {
            type: "nodeId",
            default: null,
            label: "Sink Node",
            description: "Sink node for s-t cut (uses global min cut if not set)",
            required: false,
        },
        useGlobalMinCut: {
            type: "boolean",
            default: false,
            label: "Use Global Min Cut",
            description: "Use global minimum cut algorithm instead of s-t cut",
            required: false,
        },
        useKarger: {
            type: "boolean",
            default: false,
            label: "Use Karger Algorithm",
            description: "Use Karger's randomized algorithm instead of Stoer-Wagner for global min cut",
            advanced: true,
        },
        kargerIterations: {
            type: "integer",
            default: 100,
            label: "Karger Iterations",
            description: "Number of iterations for Karger's algorithm (higher = better accuracy but slower)",
            min: 1,
            max: 10000,
            advanced: true,
        },
    };

    /**
     * Legacy options set via configure() for backward compatibility
     */
    private legacyOptions: {source?: string, sink?: string, useGlobalMinCut?: boolean} | null = null;

    static suggestedStyles = (): SuggestedStylesConfig => ({
        layers: [
            {
                edge: {
                    selector: "",
                    style: {
                        enabled: true,
                        line: {
                            width: 5,
                        },
                    },
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.\"min-cut\".inCut"],
                        output: "style.line.color",
                        expr: "{ return StyleHelpers.color.binary.orangeWarning(arguments[0]) }",
                    },
                },
                metadata: {
                    name: "Min Cut - Cut Edges",
                    description: "Highlights edges in the minimum cut (orange) - colorblind-safe",
                },
            },
            {
                edge: {
                    selector: "algorithmResults.graphty.\"min-cut\".inCut == `false`",
                    style: {
                        enabled: true,
                        line: {
                            width: 1,
                            opacity: 0.4,
                        },
                    },
                },
                metadata: {
                    name: "Min Cut - Non-Cut Edges",
                    description: "Dims edges not in the minimum cut",
                },
            },
            {
                node: {
                    selector: "",
                    style: {
                        enabled: true,
                    },
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.\"min-cut\".partition"],
                        output: "style.texture.color",
                        expr: "{ return StyleHelpers.color.categorical.okabeIto(Number(arguments[0] ?? 1) - 1) }",
                    },
                },
                metadata: {
                    name: "Min Cut - Partition Colors",
                    description: "Colors nodes by partition - colorblind-safe",
                },
            },
        ],
        description: "Visualizes minimum cut edges and the resulting graph partition",
        category: "path",
    });

    /**
     * Configure the algorithm with source, sink, and useGlobalMinCut options
     *
     * @deprecated Use constructor options instead. This method is kept for backward compatibility.
     */
    configure(options: {source?: string, sink?: string, useGlobalMinCut?: boolean}): this {
        this.legacyOptions = options;
        return this;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async run(): Promise<void> {
        const g = this.graph;
        const edges = Array.from(g.getDataManager().edges.values());
        const nodes = Array.from(g.getDataManager().nodes.values());

        if (edges.length === 0 || nodes.length === 0) {
            return;
        }

        // Build weighted graph from edges - Map format for stoerWagner/kargerMinCut
        const weightedGraphMap = new Map<string, Map<string, number>>();
        // Also build AlgorithmGraph for minSTCut (which requires Graph type)
        const weightedGraph = new AlgorithmGraph({directed: false});

        // Initialize nodes
        for (const node of nodes) {
            weightedGraphMap.set(String(node.id), new Map());
            weightedGraph.addNode(String(node.id));
        }

        // Add edges with weights
        for (const edge of edges) {
            const srcId = String(edge.srcId);
            const dstId = String(edge.dstId);

            // Get weight from edge data
            const edgeData = edge.data as Record<string, unknown> | undefined;
            const edgeObject = edge as unknown as Record<string, unknown>;
            const rawWeight = edgeData?.value ?? edgeObject.value ?? 1;
            const weight: number = typeof rawWeight === "number" ? rawWeight : 1;

            // Add to Map (for stoerWagner/kargerMinCut)
            const srcNeighbors = weightedGraphMap.get(srcId);
            if (srcNeighbors) {
                srcNeighbors.set(dstId, weight);
            }

            // Add reverse edge for undirected graph (Map)
            const dstNeighbors = weightedGraphMap.get(dstId);
            if (dstNeighbors) {
                dstNeighbors.set(srcId, weight);
            }

            // Add to AlgorithmGraph (for minSTCut)
            weightedGraph.addEdge(srcId, dstId, weight);
        }

        // Get options from legacy or schema options
        // Legacy configure() takes precedence for backward compatibility
        const useGlobalMinCut = this.legacyOptions?.useGlobalMinCut ?? this._schemaOptions.useGlobalMinCut;
        const sourceOption = this.legacyOptions?.source ?? this._schemaOptions.source;
        const sinkOption = this.legacyOptions?.sink ?? this._schemaOptions.sink;
        const {useKarger, kargerIterations} = this._schemaOptions;

        // Determine which algorithm to use
        let partition1: Set<string>;
        let partition2: Set<string>;
        let cutEdges: {from: string, to: string, weight: number}[];
        let cutValue: number;

        if (useGlobalMinCut || (sourceOption === null && sinkOption === null)) {
            // Use global minimum cut algorithm
            if (useKarger) {
                // Use Karger's randomized algorithm (accepts Map)
                const result = kargerMinCut(weightedGraphMap, kargerIterations);
                ({partition1, partition2, cutEdges, cutValue} = result);
            } else {
                // Use Stoer-Wagner for global minimum cut (accepts Map)
                const result = stoerWagner(weightedGraphMap);
                ({partition1, partition2, cutEdges, cutValue} = result);
            }
        } else {
            // Use min s-t cut via max flow (requires AlgorithmGraph)
            const source = sourceOption !== null ? String(sourceOption) : String(Array.from(g.getDataManager().nodes.keys())[0]);
            const sink = sinkOption !== null ? String(sinkOption) : String(Array.from(g.getDataManager().nodes.keys()).pop());

            const result = minSTCut(weightedGraph, source, sink);
            ({partition1, partition2, cutEdges, cutValue} = result);
        }

        // Create set of cut edge keys for fast lookup
        const cutEdgeKeys = new Set<string>();
        for (const edge of cutEdges) {
            cutEdgeKeys.add(`${edge.from}:${edge.to}`);
            cutEdgeKeys.add(`${edge.to}:${edge.from}`);
        }

        // Store edge results
        for (const edge of edges) {
            const edgeKey = `${edge.srcId}:${edge.dstId}`;
            const inCut = cutEdgeKeys.has(edgeKey);

            // Find weight if in cut
            let weight = 0;
            if (inCut) {
                const cutEdge = cutEdges.find(
                    (ce) =>
                        (ce.from === String(edge.srcId) && ce.to === String(edge.dstId)) ||
                        (ce.to === String(edge.srcId) && ce.from === String(edge.dstId)),
                );
                weight = cutEdge?.weight ?? 0;
            }

            this.addEdgeResult(edge, "inCut", inCut);
            this.addEdgeResult(edge, "cutWeight", weight);
        }

        // Store node results
        for (const node of nodes) {
            const nodeId = String(node.id);
            const isInPartition1 = partition1.has(nodeId);
            const partition = isInPartition1 ? "1" : "2";

            this.addNodeResult(node.id, "partition", partition);
            this.addNodeResult(node.id, "isInPartition1", isInPartition1);
            this.addNodeResult(node.id, "isInPartition2", partition2.has(nodeId));
        }

        // Store graph-level results
        this.addGraphResult("cutValue", cutValue);
        this.addGraphResult("cutEdgeCount", cutEdges.length);
        this.addGraphResult("partition1Size", partition1.size);
        this.addGraphResult("partition2Size", partition2.size);
        this.addGraphResult("partition1", Array.from(partition1));
        this.addGraphResult("partition2", Array.from(partition2));
    }
}

// Auto-register this algorithm when the module is imported
Algorithm.register(MinCutAlgorithm);
