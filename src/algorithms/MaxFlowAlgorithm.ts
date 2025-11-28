/**
 * @fileoverview Max Flow Algorithm wrapper
 *
 * This algorithm finds the maximum flow from a source to a sink
 * in a flow network using the Ford-Fulkerson method.
 */

import {fordFulkerson} from "@graphty/algorithms";

import {SuggestedStylesConfig} from "../config";
import {Algorithm} from "./Algorithm";

interface MaxFlowOptions {
    source: string;
    sink: string;
}

export class MaxFlowAlgorithm extends Algorithm {
    static namespace = "graphty";
    static type = "max-flow";
    private options: MaxFlowOptions | null = null;

    static suggestedStyles = (): SuggestedStylesConfig => ({
        layers: [
            {
                edge: {
                    selector: "",
                    style: {enabled: true},
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.max-flow.flowPct"],
                        output: "style.line.width",
                        expr: "{ return StyleHelpers.edgeWidth.linear(arguments[0], 1, 8) }",
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

    configure(options: MaxFlowOptions): this {
        this.options = options;
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

        // Get source and sink from options or use first and last node
        let source: string;
        let sink: string;

        if (this.options?.source && this.options.sink) {
            ({source, sink} = this.options);
        } else {
            // Default to first and last nodes if not configured
            const nodeIds = Array.from(g.getDataManager().nodes.keys());
            source = String(nodeIds[0]);
            sink = String(nodeIds[nodeIds.length - 1]);
        }

        // Build capacity graph from edges
        // Ford-Fulkerson expects Map<string, Map<string, number>>
        const capacityGraph = new Map<string, Map<string, number>>();

        // Initialize nodes
        for (const node of nodes) {
            capacityGraph.set(String(node.id), new Map());
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

            const srcNeighbors = capacityGraph.get(srcId);
            if (srcNeighbors) {
                srcNeighbors.set(dstId, capacity);
            }
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
            const capacity = capacityGraph.get(srcId)?.get(dstId) ?? 1;
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
