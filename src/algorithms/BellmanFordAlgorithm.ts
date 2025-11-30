import {bellmanFord} from "@graphty/algorithms";

import type {SuggestedStylesConfig} from "../config";
import type {Graph} from "../Graph";
import {Algorithm} from "./Algorithm";
import {toAlgorithmGraph} from "./utils/graphConverter";

interface BellmanFordOptions {
    source: number | string;
    target?: number | string;
}

export class BellmanFordAlgorithm extends Algorithm {
    static namespace = "graphty";
    static type = "bellman-ford";
    private options: BellmanFordOptions | null = null;

    static suggestedStyles = (): SuggestedStylesConfig => ({
        layers: [
            {
                edge: {
                    selector: "",
                    style: {enabled: true},
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.bellman-ford.isInPath"],
                        output: "style.line.color",
                        expr: "{ return StyleHelpers.color.binary.blueHighlight(arguments[0]) }",
                    },
                },
                metadata: {
                    name: "Bellman-Ford - Path Edges",
                    description: "Highlights shortest path edges (blue) - colorblind-safe",
                },
            },
            {
                node: {
                    selector: "",
                    style: {enabled: true},
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.bellman-ford.isInPath"],
                        output: "style.texture.color",
                        expr: "{ return StyleHelpers.color.binary.blueHighlight(arguments[0]) }",
                    },
                },
                metadata: {
                    name: "Bellman-Ford - Path Nodes",
                    description: "Highlights path nodes (blue) - colorblind-safe",
                },
            },
            {
                node: {
                    selector: "",
                    style: {enabled: true},
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.bellman-ford.distancePct"],
                        output: "style.opacity",
                        expr: "{ return StyleHelpers.opacity.linear(1 - (arguments[0] ?? 0)) }",
                    },
                },
                metadata: {
                    name: "Bellman-Ford - Distance Fade",
                    description: "Fades nodes by distance from source (closer = more visible)",
                },
            },
        ],
        description: "Visualizes shortest paths with support for negative edge weights",
        category: "path",
    });

    /**
     * Configure the algorithm with source and optional target nodes
     */
    configure(options: BellmanFordOptions): this {
        this.options = options;
        return this;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async run(): Promise<void> {
        const g = this.graph;
        const dm = g.getDataManager();
        const nodes = Array.from(dm.nodes.keys());
        const n = nodes.length;

        if (n === 0) {
            return;
        }

        // Get source and target from options or use defaults (first and last nodes)
        const source = this.options?.source ?? nodes[0];
        const target = this.options?.target ?? nodes[nodes.length - 1];

        // Convert to @graphty/algorithms format
        // Note: Using directed=false (default) so converter adds reverse edges for undirected path finding
        const graphData = toAlgorithmGraph(g as unknown as Graph, {directed: false});

        // Run Bellman-Ford algorithm
        const result = bellmanFord(graphData, source);

        // Store negative cycle information at graph level
        this.addGraphResult("hasNegativeCycle", result.hasNegativeCycle);
        if (result.negativeCycleNodes.length > 0) {
            this.addGraphResult("negativeCycleNodes", result.negativeCycleNodes);
        }

        // Find max distance for normalization (excluding Infinity)
        let maxDistance = 0;
        for (const dist of result.distances.values()) {
            if (isFinite(dist) && dist > maxDistance) {
                maxDistance = dist;
            }
        }

        // Store distance results on nodes
        for (const nodeId of nodes) {
            const distance = result.distances.get(nodeId) ?? Infinity;
            this.addNodeResult(nodeId, "distance", distance);

            // Normalize distance to percentage
            const distancePct = maxDistance > 0 && isFinite(distance) ? distance / maxDistance : 0;
            this.addNodeResult(nodeId, "distancePct", distancePct);
        }

        // Mark the path from source to target
        {
            const path = this.reconstructPath(result.predecessors, source, target);
            const pathNodeSet = new Set(path);

            // Mark nodes in path
            for (const nodeId of nodes) {
                const isInPath = pathNodeSet.has(nodeId);
                this.addNodeResult(nodeId, "isInPath", isInPath);
            }

            // Mark edges in path
            const pathEdges = this.getPathEdges(path);
            for (const edge of dm.edges.values()) {
                const edgeKey = `${edge.srcId}:${edge.dstId}`;
                const reverseEdgeKey = `${edge.dstId}:${edge.srcId}`;
                const isInPath = pathEdges.has(edgeKey) || pathEdges.has(reverseEdgeKey);
                this.addEdgeResult(edge, "isInPath", isInPath);
            }
        }
    }

    /**
     * Reconstruct the shortest path from predecessors
     */
    private reconstructPath(
        predecessors: Map<string | number, string | number | null>,
        source: string | number,
        target: string | number,
    ): (string | number)[] {
        const path: (string | number)[] = [];
        let current: string | number | null = target;

        while (current !== null) {
            path.unshift(current);
            if (current === source) {
                break;
            }

            current = predecessors.get(current) ?? null;
        }

        // If path doesn't start with source, no valid path exists
        if (path.length === 0 || path[0] !== source) {
            return [];
        }

        return path;
    }

    /**
     * Get set of edge keys that are part of the path
     */
    private getPathEdges(path: (string | number)[]): Set<string> {
        const edges = new Set<string>();

        for (let i = 0; i < path.length - 1; i++) {
            edges.add(`${path[i]}:${path[i + 1]}`);
        }

        return edges;
    }
}

// Auto-register this algorithm when the module is imported
Algorithm.register(BellmanFordAlgorithm);
