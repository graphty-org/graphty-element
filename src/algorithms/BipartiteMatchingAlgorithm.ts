/**
 * @fileoverview Bipartite Matching Algorithm wrapper
 *
 * This algorithm finds the maximum matching in a bipartite graph.
 * A matching is a set of edges without common vertices.
 * Maximum matching has the largest possible number of edges.
 */

import {bipartitePartition, maximumBipartiteMatching} from "@graphty/algorithms";

import {SuggestedStylesConfig} from "../config";
import {Algorithm} from "./Algorithm";
import {toAlgorithmGraph} from "./utils/graphConverter";

export class BipartiteMatchingAlgorithm extends Algorithm {
    static namespace = "graphty";
    static type = "bipartite-matching";

    static suggestedStyles = (): SuggestedStylesConfig => ({
        layers: [
            {
                edge: {
                    selector: "",
                    style: {enabled: true},
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.bipartite-matching.inMatching"],
                        output: "style.line.color",
                        expr: "{ return StyleHelpers.color.binary.blueHighlight(arguments[0]) }",
                    },
                },
                metadata: {
                    name: "Matching - Matched Edges",
                    description: "Highlights edges in maximum matching (blue) - colorblind-safe",
                },
            },
            {
                edge: {
                    selector: "algorithmResults.graphty.\"bipartite-matching\".inMatching == `false`",
                    style: {
                        enabled: true,
                        line: {
                            opacity: 0.3,
                        },
                    },
                },
                metadata: {
                    name: "Matching - Non-Matched Edges",
                    description: "Dims edges not in maximum matching",
                },
            },
            {
                node: {
                    selector: "",
                    style: {enabled: true},
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.bipartite-matching.partition"],
                        output: "style.texture.color",
                        expr: "{ return arguments[0] === 'left' ? StyleHelpers.color.categorical.okabeIto(0) : StyleHelpers.color.categorical.okabeIto(1) }",
                    },
                },
                metadata: {
                    name: "Matching - Partition Colors",
                    description: "Colors nodes by partition (left/right) - colorblind-safe",
                },
            },
        ],
        description: "Visualizes maximum bipartite matching with partition coloring",
        category: "path",
    });

    // eslint-disable-next-line @typescript-eslint/require-await
    async run(): Promise<void> {
        const g = this.graph;
        const edges = Array.from(g.getDataManager().edges.values());

        if (edges.length === 0) {
            return;
        }

        // Convert to @graphty/algorithms format
        // Use undirected graph without reverse edges for bipartite matching
        const graphData = toAlgorithmGraph(g, {directed: false, addReverseEdges: false});

        // First check if the graph is bipartite
        const partition = bipartitePartition(graphData);
        if (!partition) {
            // Graph is not bipartite - store error and mark all edges as not in matching
            this.addGraphResult("error", "Graph is not bipartite");
            this.addGraphResult("matchingSize", 0);

            for (const edge of edges) {
                this.addEdgeResult(edge, "inMatching", false);
            }

            return;
        }

        // Run maximum bipartite matching
        const result = maximumBipartiteMatching(graphData, {
            leftNodes: partition.left,
            rightNodes: partition.right,
        });

        // Create set of matched edge keys for fast lookup
        const matchedEdgeKeys = new Set<string>();
        for (const [leftNode, rightNode] of result.matching) {
            matchedEdgeKeys.add(`${String(leftNode)}:${String(rightNode)}`);
            matchedEdgeKeys.add(`${String(rightNode)}:${String(leftNode)}`);
        }

        // Mark each edge as in matching or not
        for (const edge of edges) {
            const edgeKey = `${edge.srcId}:${edge.dstId}`;
            const inMatching = matchedEdgeKeys.has(edgeKey);
            this.addEdgeResult(edge, "inMatching", inMatching);
        }

        // Store node partition information
        for (const nodeId of partition.left) {
            this.addNodeResult(nodeId, "partition", "left");
            this.addNodeResult(nodeId, "isMatched", result.matching.has(nodeId));
        }

        for (const nodeId of partition.right) {
            this.addNodeResult(nodeId, "partition", "right");
            // Check if this node is matched (appears in values of matching map)
            const isMatched = Array.from(result.matching.values()).includes(nodeId);
            this.addNodeResult(nodeId, "isMatched", isMatched);
        }

        // Store graph-level results
        this.addGraphResult("matchingSize", result.size);
        this.addGraphResult("leftPartitionSize", partition.left.size);
        this.addGraphResult("rightPartitionSize", partition.right.size);
    }
}

// Auto-register this algorithm when the module is imported
Algorithm.register(BipartiteMatchingAlgorithm);
