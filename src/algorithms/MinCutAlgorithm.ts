/**
 * @fileoverview Minimum Cut Algorithm wrapper
 *
 * This algorithm finds the minimum cut that separates a source from a sink
 * or the global minimum cut of a graph. Uses the max-flow min-cut theorem.
 */

import {minSTCut, stoerWagner} from "@graphty/algorithms";

import {SuggestedStylesConfig} from "../config";
import {Algorithm} from "./Algorithm";

interface MinCutOptions {
    source?: string;
    sink?: string;
    useGlobalMinCut?: boolean;
}

export class MinCutAlgorithm extends Algorithm {
    static namespace = "graphty";
    static type = "min-cut";
    private options: MinCutOptions | null = null;

    static suggestedStyles = (): SuggestedStylesConfig => ({
        layers: [
            {
                edge: {
                    selector: "algorithmResults.graphty.\"min-cut\".inCut == `true`",
                    style: {
                        enabled: true,
                        line: {
                            color: "#e67e22", // Orange for cut edges
                            width: 5,
                        },
                    },
                },
                metadata: {
                    name: "Min Cut - Cut Edges",
                    description: "Highlights edges in the minimum cut (orange)",
                },
            },
            {
                edge: {
                    selector: "algorithmResults.graphty.\"min-cut\".inCut == `false`",
                    style: {
                        enabled: true,
                        line: {
                            color: "#95a5a6", // Gray for non-cut edges
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
                    selector: "algorithmResults.graphty.\"min-cut\".partition == `1`",
                    style: {
                        enabled: true,
                        texture: {
                            color: "#3498db", // Blue for partition 1
                        },
                    },
                },
                metadata: {
                    name: "Min Cut - Partition 1",
                    description: "Colors nodes in partition 1 (blue)",
                },
            },
            {
                node: {
                    selector: "algorithmResults.graphty.\"min-cut\".partition == `2`",
                    style: {
                        enabled: true,
                        texture: {
                            color: "#e74c3c", // Red for partition 2
                        },
                    },
                },
                metadata: {
                    name: "Min Cut - Partition 2",
                    description: "Colors nodes in partition 2 (red)",
                },
            },
        ],
        description: "Visualizes minimum cut edges and the resulting graph partition",
        category: "path",
    });

    configure(options: MinCutOptions): this {
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

        // Build weighted graph from edges
        const weightedGraph = new Map<string, Map<string, number>>();

        // Initialize nodes
        for (const node of nodes) {
            weightedGraph.set(String(node.id), new Map());
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

            const srcNeighbors = weightedGraph.get(srcId);
            if (srcNeighbors) {
                srcNeighbors.set(dstId, weight);
            }

            // Add reverse edge for undirected graph
            const dstNeighbors = weightedGraph.get(dstId);
            if (dstNeighbors) {
                dstNeighbors.set(srcId, weight);
            }
        }

        // Determine which algorithm to use
        let partition1: Set<string>;
        let partition2: Set<string>;
        let cutEdges: {from: string, to: string, weight: number}[];
        let cutValue: number;

        if (this.options?.useGlobalMinCut || (!this.options?.source && !this.options?.sink)) {
            // Use Stoer-Wagner for global minimum cut
            const result = stoerWagner(weightedGraph);
            ({partition1, partition2, cutEdges, cutValue} = result);
        } else {
            // Use min s-t cut via max flow
            const source = this.options.source ?? String(Array.from(g.getDataManager().nodes.keys())[0]);
            const sink = this.options.sink ?? String(Array.from(g.getDataManager().nodes.keys()).pop());

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
