import {SuggestedStylesConfig} from "../config";
import {Algorithm} from "./Algorithm";

interface DijkstraOptions {
    source: number | string;
    target?: number | string;
}

interface PathResult {
    path: (number | string)[];
    distance: number;
}

export class DijkstraAlgorithm extends Algorithm {
    static namespace = "graphty";
    static type = "dijkstra";
    private options: DijkstraOptions | null = null;

    static suggestedStyles = (): SuggestedStylesConfig => ({
        layers: [
            {
                edge: {
                    selector: "algorithmResults.graphty.dijkstra.isInPath == `true`",
                    style: {
                        enabled: true,
                        line: {
                            color: "#e74c3c",
                            width: 3,
                        },
                    },
                },
                metadata: {
                    name: "Dijkstra - Path Edges",
                    description: "Highlights edges that are part of the shortest path in red",
                },
            },
            {
                node: {
                    selector: "algorithmResults.graphty.dijkstra.isInPath == `true`",
                    style: {
                        enabled: true,
                        shape: {
                            size: 2,
                        },
                        texture: {
                            color: "#e74c3c",
                        },
                        effect: {
                            glow: {
                                color: "#e74c3c",
                                strength: 2,
                            },
                        },
                    },
                },
                metadata: {
                    name: "Dijkstra - Path Nodes",
                    description: "Highlights nodes that are part of the shortest path with red color and glow",
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

        // Run Dijkstra's algorithm
        const result = this.dijkstra(source, target);

        // Store path information on nodes
        const pathNodeSet = new Set(result.path);
        for (const nodeId of nodes) {
            const isInPath = pathNodeSet.has(nodeId);
            this.addNodeResult(nodeId, "isInPath", isInPath);

            // Also store distance from source for each node
            const distanceResult = this.dijkstra(source, nodeId);
            this.addNodeResult(nodeId, "distance", distanceResult.distance);
        }

        // Store path information on edges
        const pathEdges = this.getPathEdges(result.path);
        for (const edge of g.getDataManager().edges.values()) {
            const edgeKey = `${edge.srcId}:${edge.dstId}`;
            const reverseEdgeKey = `${edge.dstId}:${edge.srcId}`;
            const isInPath = pathEdges.has(edgeKey) || pathEdges.has(reverseEdgeKey);
            this.addEdgeResult(edge, "isInPath", isInPath);
        }
    }

    /**
     * Dijkstra's shortest path algorithm implementation
     */
    private dijkstra(source: number | string, target: number | string): PathResult {
        const nodes = Array.from(this.graph.getDataManager().nodes.keys());

        // Initialize distances and predecessors
        const distances = new Map<number | string, number>();
        const predecessors = new Map<number | string, number | string | null>();
        const visited = new Set<number | string>();

        for (const nodeId of nodes) {
            distances.set(nodeId, Infinity);
            predecessors.set(nodeId, null);
        }
        distances.set(source, 0);

        // Build adjacency list
        const adjacency = this.buildAdjacencyList();

        // Process nodes
        while (visited.size < nodes.length) {
            // Find unvisited node with minimum distance
            let minDist = Infinity;
            let minNode: number | string | null = null;

            for (const nodeId of nodes) {
                if (!visited.has(nodeId)) {
                    const dist = distances.get(nodeId) ?? Infinity;
                    if (dist < minDist) {
                        minDist = dist;
                        minNode = nodeId;
                    }
                }
            }

            if (minNode === null || minDist === Infinity) {
                break; // No more reachable nodes
            }

            visited.add(minNode);

            // If we've reached the target, we can stop
            if (minNode === target) {
                break;
            }

            // Update distances to neighbors
            const neighbors = adjacency.get(minNode) ?? [];
            for (const {neighbor, weight} of neighbors) {
                if (!visited.has(neighbor)) {
                    const newDist = (distances.get(minNode) ?? Infinity) + weight;
                    const currentDist = distances.get(neighbor) ?? Infinity;

                    if (newDist < currentDist) {
                        distances.set(neighbor, newDist);
                        predecessors.set(neighbor, minNode);
                    }
                }
            }
        }

        // Reconstruct path
        const path: (number | string)[] = [];
        let current: number | string | null = target;

        while (current !== null) {
            path.unshift(current);
            current = predecessors.get(current) ?? null;
        }

        // If path doesn't start with source, no path exists
        if (path[0] !== source) {
            return {path: [], distance: Infinity};
        }

        return {
            path,
            distance: distances.get(target) ?? Infinity,
        };
    }

    /**
     * Build adjacency list from graph edges
     */
    private buildAdjacencyList(): Map<number | string, {neighbor: number | string, weight: number}[]> {
        const adjacency = new Map<number | string, {neighbor: number | string, weight: number}[]>();

        // Initialize empty arrays for all nodes
        for (const nodeId of this.graph.getDataManager().nodes.keys()) {
            adjacency.set(nodeId, []);
        }

        // Add edges (treating as undirected for path finding)
        for (const edge of this.graph.getDataManager().edges.values()) {
            const weight = 1; // Unweighted for now

            // Add both directions for undirected graph
            const srcNeighbors = adjacency.get(edge.srcId) ?? [];
            srcNeighbors.push({neighbor: edge.dstId, weight});
            adjacency.set(edge.srcId, srcNeighbors);

            const dstNeighbors = adjacency.get(edge.dstId) ?? [];
            dstNeighbors.push({neighbor: edge.srcId, weight});
            adjacency.set(edge.dstId, dstNeighbors);
        }

        return adjacency;
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
