/**
 * @fileoverview Max Flow Algorithm wrapper
 *
 * This algorithm finds the maximum flow from a source to a sink
 * in a flow network using the Ford-Fulkerson method.
 */

import {fordFulkerson, Graph as AlgorithmGraph} from "@graphty/algorithms";
import {z} from "zod/v4";

import {defineOptions, type OptionsSchema as ZodOptionsSchema, type SuggestedStylesConfig} from "../config";
import {Algorithm} from "./Algorithm";
import {type OptionsSchema} from "./types/OptionSchema";

/**
 * Zod-based options schema for Max Flow algorithm
 */
export const maxFlowOptionsSchema = defineOptions({
    source: {
        schema: z.union([z.string(), z.number()]).nullable().default(null),
        meta: {
            label: "Source Node",
            description: "Source node for flow network (uses first node if not set)",
        },
    },
    sink: {
        schema: z.union([z.string(), z.number()]).nullable().default(null),
        meta: {
            label: "Sink Node",
            description: "Sink node for flow network (uses last node if not set)",
        },
    },
});

/**
 * Options for Max Flow algorithm
 */
export interface MaxFlowOptions extends Record<string, unknown> {
    /** Source node for flow network (defaults to first node if not provided) */
    source: string | number | null;
    /** Sink node for flow network (defaults to last node if not provided) */
    sink: string | number | null;
}

export class MaxFlowAlgorithm extends Algorithm<MaxFlowOptions> {
    static namespace = "graphty";
    static type = "max-flow";

    static zodOptionsSchema: ZodOptionsSchema = maxFlowOptionsSchema;

    /**
     * Options schema for Max Flow algorithm
     */
    static optionsSchema: OptionsSchema = {
        source: {
            type: "nodeId",
            default: null,
            label: "Source Node",
            description: "Source node for flow network (uses first node if not set)",
            required: false,
        },
        sink: {
            type: "nodeId",
            default: null,
            label: "Sink Node",
            description: "Sink node for flow network (uses last node if not set)",
            required: false,
        },
    };

    /**
     * Legacy options set via configure() for backward compatibility
     */
    private legacyOptions: {source: string, sink: string} | null = null;

    static suggestedStyles = (): SuggestedStylesConfig => ({
        layers: [
            {
                edge: {
                    selector: "",
                    style: {enabled: true},
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.max-flow.flowPct"],
                        output: "style.line.width",
                        expr: "{ return StyleHelpers.edgeWidth.linear(arguments[0], 8, 16) }",
                    },
                },
                metadata: {
                    name: "Max Flow - Edge Width",
                    description: "Edge width proportional to flow amount",
                },
            },
            {
                edge: {
                    selector: "",
                    style: {enabled: true},
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.max-flow.flowPct"],
                        output: "style.line.color",
                        expr: "{ return StyleHelpers.color.sequential.blues(arguments[0]) }",
                    },
                },
                metadata: {
                    name: "Max Flow - Edge Color",
                    description: "Edge color intensity by flow (light → dark blue)",
                },
            },
            {
                node: {
                    selector: "",
                    style: {
                        enabled: true,
                    },
                    calculatedStyle: {
                        inputs: [
                            "algorithmResults.graphty.max-flow.isSource",
                            "algorithmResults.graphty.max-flow.isSink",
                        ],
                        output: "style.texture.color",
                        // Source = index 0, Sink = index 1, Others = index 2 (using Okabe-Ito colorblind-safe palette)
                        expr: "{ if (arguments[0]) return StyleHelpers.color.categorical.okabeIto(0); if (arguments[1]) return StyleHelpers.color.categorical.okabeIto(1); return StyleHelpers.color.categorical.okabeIto(2); }",
                    },
                },
                metadata: {
                    name: "Max Flow - Source/Sink Nodes",
                    description: "Highlights source and sink nodes using colorblind-safe Okabe-Ito palette",
                },
            },
        ],
        description: "Visualizes network flow with edge width and color proportional to flow",
        category: "edge-metric",
    });

    /**
     * Configure the algorithm with source and sink nodes
     *
     * @deprecated Use constructor options instead. This method is kept for backward compatibility.
     */
    configure(options: {source: string, sink: string}): this {
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

        // Get source and sink from legacy options, schema options, or use defaults
        // Legacy configure() takes precedence for backward compatibility
        const nodeIds = Array.from(g.getDataManager().nodes.keys());
        const source = String(this.legacyOptions?.source ?? this._schemaOptions.source ?? nodeIds[0]);
        const sink = String(this.legacyOptions?.sink ?? this._schemaOptions.sink ?? nodeIds[nodeIds.length - 1]);

        // Build capacity graph from edges using AlgorithmGraph
        const capacityGraph = new AlgorithmGraph({directed: true});

        // Initialize nodes
        for (const node of nodes) {
            capacityGraph.addNode(String(node.id));
        }

        // Track capacities for result calculation
        const capacityMap = new Map<string, Map<string, number>>();
        for (const node of nodes) {
            capacityMap.set(String(node.id), new Map());
        }

        // Add edges with capacities
        for (const edge of edges) {
            const srcId = String(edge.srcId);
            const dstId = String(edge.dstId);

            // Get capacity from edge data
            const edgeData = edge.data as Record<string, unknown> | undefined;
            const edgeObject = edge as unknown as Record<string, unknown>;
            const rawCapacity = edgeData?.capacity ?? edgeData?.value ?? edgeObject.value ?? 1;
            const capacity: number = typeof rawCapacity === "number" ? rawCapacity : 1;

            capacityGraph.addEdge(srcId, dstId, capacity);
            capacityMap.get(srcId)?.set(dstId, capacity);
        }

        // Run Ford-Fulkerson algorithm
        const result = fordFulkerson(capacityGraph, source, sink);

        // Find maximum flow value for normalization
        let maxEdgeFlow = 0;
        for (const neighbors of result.flowGraph.values()) {
            for (const flow of neighbors.values()) {
                maxEdgeFlow = Math.max(maxEdgeFlow, Math.abs(flow));
            }
        }

        // Store edge results
        for (const edge of edges) {
            const srcId = String(edge.srcId);
            const dstId = String(edge.dstId);

            const flow = result.flowGraph.get(srcId)?.get(dstId) ?? 0;
            const flowPct = maxEdgeFlow > 0 ? Math.abs(flow) / maxEdgeFlow : 0;

            // Get capacity for this edge
            const capacity = capacityMap.get(srcId)?.get(dstId) ?? 1;
            const utilization = capacity > 0 ? Math.abs(flow) / capacity : 0;

            this.addEdgeResult(edge, "flow", flow);
            this.addEdgeResult(edge, "flowPct", flowPct);
            this.addEdgeResult(edge, "capacity", capacity);
            this.addEdgeResult(edge, "utilization", utilization);
            this.addEdgeResult(edge, "isSaturated", utilization >= 0.99);
        }

        // Store node results
        for (const node of nodes) {
            const nodeId = String(node.id);
            const isSource = nodeId === source;
            const isSink = nodeId === sink;

            this.addNodeResult(node.id, "isSource", isSource);
            this.addNodeResult(node.id, "isSink", isSink);

            // Calculate net flow for each node
            let inFlow = 0;
            let outFlow = 0;

            for (const [src, neighbors] of result.flowGraph) {
                for (const [dst, flow] of neighbors) {
                    if (dst === nodeId) {
                        inFlow += flow;
                    }

                    if (src === nodeId) {
                        outFlow += flow;
                    }
                }
            }

            this.addNodeResult(node.id, "inFlow", inFlow);
            this.addNodeResult(node.id, "outFlow", outFlow);
            this.addNodeResult(node.id, "netFlow", inFlow - outFlow);
        }

        // Store graph-level results
        this.addGraphResult("maxFlow", result.maxFlow);
        this.addGraphResult("source", source);
        this.addGraphResult("sink", sink);

        // Store min-cut information if available
        if (result.minCut) {
            this.addGraphResult("minCutSourcePartition", Array.from(result.minCut.source));
            this.addGraphResult("minCutSinkPartition", Array.from(result.minCut.sink));
            this.addGraphResult("minCutEdges", result.minCut.edges);
        }
    }
}

// Auto-register this algorithm when the module is imported
Algorithm.register(MaxFlowAlgorithm);
