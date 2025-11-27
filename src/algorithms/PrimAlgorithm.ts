/**
 * @fileoverview Prim's Minimum Spanning Tree Algorithm wrapper
 *
 * This algorithm finds the minimum spanning tree of an undirected graph
 * using Prim's algorithm. It marks edges that are part of the MST
 * and stores graph-level results (total weight, edge count).
 *
 * Unlike Kruskal's which processes edges globally, Prim's grows the tree
 * from a starting node, which can be optionally configured.
 */

import {primMST} from "@graphty/algorithms";

import {SuggestedStylesConfig} from "../config";
import {Algorithm} from "./Algorithm";
import {toAlgorithmGraph} from "./utils/graphConverter";

interface PrimOptions {
    /** Optional starting node for the algorithm */
    startNode?: number | string;
}

export class PrimAlgorithm extends Algorithm {
    static namespace = "graphty";
    static type = "prim";
    private options: PrimOptions | null = null;

    static suggestedStyles = (): SuggestedStylesConfig => ({
        layers: [
            {
                edge: {
                    selector: "algorithmResults.graphty.prim.inMST == `true`",
                    style: {
                        enabled: true,
                        line: {
                            color: "#27ae60", // Green for MST edges
                            width: 4,
                        },
                    },
                },
                metadata: {
                    name: "Prim - MST Edges",
                    description: "Highlights minimum spanning tree edges in green",
                },
            },
            {
                edge: {
                    selector: "algorithmResults.graphty.prim.inMST == `false`",
                    style: {
                        enabled: true,
                        line: {
                            color: "#95a5a6", // Gray for non-MST edges
                            width: 1,
                            opacity: 0.3,
                        },
                    },
                },
                metadata: {
                    name: "Prim - Non-MST Edges",
                    description: "Dims edges not in minimum spanning tree",
                },
            },
        ],
        description: "Visualizes minimum spanning tree computed via Prim's algorithm",
        category: "path",
    });

    /**
     * Configure the algorithm with an optional start node
     */
    configure(options: PrimOptions): this {
        this.options = options;
        return this;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async run(): Promise<void> {
        const g = this.graph;
        const edges = Array.from(g.getDataManager().edges.values());

        if (edges.length === 0) {
            return;
        }

        // Convert to @graphty/algorithms format and run Prim's algorithm
        // Note: Prim's algorithm requires a truly undirected graph (not a directed graph with reverse edges)
        const graphData = toAlgorithmGraph(g, {directed: false, addReverseEdges: false});
        const mstResult = primMST(graphData, this.options?.startNode);

        // Create set of MST edge keys for fast lookup
        // Store both directions since the graph is undirected
        const mstEdgeKeys = new Set<string>();
        for (const edge of mstResult.edges) {
            mstEdgeKeys.add(`${String(edge.source)}:${String(edge.target)}`);
            mstEdgeKeys.add(`${String(edge.target)}:${String(edge.source)}`);
        }

        // Mark each edge as in MST or not
        for (const edge of edges) {
            const edgeKey = `${edge.srcId}:${edge.dstId}`;
            const inMST = mstEdgeKeys.has(edgeKey);
            this.addEdgeResult(edge, "inMST", inMST);
        }

        // Store graph-level results
        this.addGraphResult("totalWeight", mstResult.totalWeight);
        this.addGraphResult("edgeCount", mstResult.edges.length);
    }
}

// Auto-register this algorithm when the module is imported
Algorithm.register(PrimAlgorithm);
