import {dijkstra, dijkstraPath} from "@graphty/algorithms";

import type {SuggestedStylesConfig} from "../config";
import {Algorithm} from "./Algorithm";
import {toAlgorithmGraph} from "./utils/graphConverter";

interface DijkstraOptions {
    source: number | string;
    target?: number | string;
}

export class DijkstraAlgorithm extends Algorithm {
    static namespace = "graphty";
    static type = "dijkstra";
    private options: DijkstraOptions | null = null;

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
     */
    configure(options: DijkstraOptions): this {
        this.options = options;
        return this;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async run(): Promise<void> {
        const g = this.graph;
        const nodes = Array.from(g.getDataManager().nodes.keys());
        const n = nodes.length;

        if (n === 0) {
            return;
        }

        // Get source and target from options or use defaults (first and last nodes)
        const source = this.options?.source ?? nodes[0];
        const target = this.options?.target ?? nodes[nodes.length - 1];

        // Convert to @graphty/algorithms format (undirected for path finding)
        const graphData = toAlgorithmGraph(g);

        // Run Dijkstra to get path from source to target
        const pathResult = dijkstraPath(graphData, source, target);
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
