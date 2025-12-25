/**
 * @file Kruskal's Minimum Spanning Tree Algorithm wrapper
 *
 * This algorithm finds the minimum spanning tree of an undirected graph
 * using Kruskal's algorithm. It marks edges that are part of the MST
 * and stores graph-level results (total weight, edge count).
 */

import {kruskalMST} from "@graphty/algorithms";

import {SuggestedStylesConfig} from "../config";
import {Algorithm} from "./Algorithm";
import {toAlgorithmGraph} from "./utils/graphConverter";

/**
 *
 */
export class KruskalAlgorithm extends Algorithm {
    static namespace = "graphty";
    static type = "kruskal";

    static suggestedStyles = (): SuggestedStylesConfig => ({
        layers: [
            {
                edge: {
                    selector: "",
                    style: {enabled: true},
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.kruskal.inMST"],
                        output: "style.line.color",
                        expr: "{ return StyleHelpers.color.binary.greenSuccess(arguments[0]) }",
                    },
                },
                metadata: {
                    name: "Kruskal - MST Edges",
                    description: "Highlights minimum spanning tree edges (green) - colorblind-safe",
                },
            },
            {
                edge: {
                    selector: "algorithmResults.graphty.kruskal.inMST == `false`",
                    style: {
                        enabled: true,
                        line: {
                            opacity: 0.3,
                        },
                    },
                },
                metadata: {
                    name: "Kruskal - Non-MST Edges",
                    description: "Dims edges not in minimum spanning tree",
                },
            },
        ],
        description: "Visualizes minimum spanning tree computed via Kruskal's algorithm",
        category: "path",
    });

    /**
     * Executes Kruskal's algorithm on the graph
     *
     * Computes the minimum spanning tree by processing edges in order of weight.
     */
    async run(): Promise<void> {
        const g = this.graph;
        const edges = Array.from(g.getDataManager().edges.values());

        if (edges.length === 0) {
            return;
        }

        // Convert to @graphty/algorithms format and run Kruskal's algorithm
        // Note: Kruskal's algorithm requires a truly undirected graph (not a directed graph with reverse edges)
        const graphData = toAlgorithmGraph(g, {directed: false, addReverseEdges: false});
        const mstResult = kruskalMST(graphData);

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
Algorithm.register(KruskalAlgorithm);
