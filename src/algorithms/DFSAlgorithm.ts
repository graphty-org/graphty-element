import type {SuggestedStylesConfig} from "../config";
import {Algorithm} from "./Algorithm";

interface DFSOptions {
    source: number | string;
}

export class DFSAlgorithm extends Algorithm {
    static namespace = "graphty";
    static type = "dfs";
    private options: DFSOptions | null = null;

    static suggestedStyles = (): SuggestedStylesConfig => ({
        layers: [
            {
                node: {
                    selector: "",
                    style: {enabled: true},
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.dfs.discoveryTimePct"],
                        output: "style.texture.color",
                        expr: "{ return StyleHelpers.color.sequential.inferno(arguments[0] ?? 0) }",
                    },
                },
                metadata: {
                    name: "DFS - Discovery Time Colors",
                    description: "Colors nodes by DFS discovery time (inferno gradient: black to yellow)",
                },
            },
            {
                node: {
                    selector: "",
                    style: {enabled: true},
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.dfs.discoveryTimePct"],
                        output: "style.shape.size",
                        expr: "{ return StyleHelpers.size.linear(1 - (arguments[0] ?? 0), 1, 3) }",
                    },
                },
                metadata: {
                    name: "DFS - Discovery Time Size",
                    description: "Larger nodes are discovered earlier",
                },
            },
        ],
        description: "Visualizes depth-first traversal discovery order from source node",
        category: "hierarchy",
    });

    /**
     * Configure the algorithm with source node
     */
    configure(options: DFSOptions): this {
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

        // Get source from options or use first node as default
        const source = this.options?.source ?? nodes[0];

        // Build adjacency list for DFS traversal
        const adjacency = this.buildAdjacencyList();

        // Check if source exists
        if (!dm.nodes.has(source)) {
            return;
        }

        // Track discovery and finish times
        const discoveryTimes = new Map<string | number, number>();
        const finishTimes = new Map<string | number, number>();
        const visited = new Set<string | number>();
        let time = 0;

        // Iterative DFS implementation to track discovery and finish times
        // Using a stack-based approach to avoid recursion depth issues
        interface StackEntry {
            node: string | number;
            phase: "discover" | "finish";
            neighborIndex: number;
        }

        const stack: StackEntry[] = [{node: source, phase: "discover", neighborIndex: 0}];

        while (stack.length > 0) {
            const entry = stack[stack.length - 1];

            if (entry.phase === "discover" && !visited.has(entry.node)) {
                // Discovery phase
                visited.add(entry.node);
                discoveryTimes.set(entry.node, time);
                time++;
                entry.phase = "finish";
            }

            // Process neighbors
            const neighbors = adjacency.get(entry.node) ?? [];
            let foundUnvisited = false;

            while (entry.neighborIndex < neighbors.length) {
                const neighbor = neighbors[entry.neighborIndex];
                entry.neighborIndex++;

                if (!visited.has(neighbor)) {
                    // Push neighbor for exploration
                    stack.push({node: neighbor, phase: "discover", neighborIndex: 0});
                    foundUnvisited = true;
                    break;
                }
            }

            // If no unvisited neighbors, finish this node
            if (!foundUnvisited) {
                stack.pop();
                if (!finishTimes.has(entry.node)) {
                    finishTimes.set(entry.node, time);
                    time++;
                }
            }
        }

        // Find max time for normalization
        const maxTime = time - 1;

        // Store results on nodes
        for (const nodeId of nodes) {
            const discoveryTime = discoveryTimes.get(nodeId);
            const finishTime = finishTimes.get(nodeId);
            const isVisited = visited.has(nodeId);

            this.addNodeResult(nodeId, "visited", isVisited);

            if (discoveryTime !== undefined) {
                this.addNodeResult(nodeId, "discoveryTime", discoveryTime);
                // Normalize discovery time to percentage
                const discoveryTimePct = maxTime > 0 ? discoveryTime / maxTime : 0;
                this.addNodeResult(nodeId, "discoveryTimePct", discoveryTimePct);
            }

            if (finishTime !== undefined) {
                this.addNodeResult(nodeId, "finishTime", finishTime);
            }
        }

        // Store graph-level results
        this.addGraphResult("maxTime", maxTime);
        this.addGraphResult("visitedCount", visited.size);
    }

    /**
     * Build adjacency list from graph edges
     */
    private buildAdjacencyList(): Map<string | number, (string | number)[]> {
        const adjacency = new Map<string | number, (string | number)[]>();
        const dm = this.graph.getDataManager();

        // Initialize empty arrays for all nodes
        for (const nodeId of dm.nodes.keys()) {
            adjacency.set(nodeId, []);
        }

        // Add edges (treating as undirected)
        for (const edge of dm.edges.values()) {
            // Add both directions for undirected traversal
            const srcNeighbors = adjacency.get(edge.srcId);
            if (srcNeighbors) {
                srcNeighbors.push(edge.dstId);
            }

            const dstNeighbors = adjacency.get(edge.dstId);
            if (dstNeighbors) {
                dstNeighbors.push(edge.srcId);
            }
        }

        return adjacency;
    }
}

// Auto-register this algorithm when the module is imported
Algorithm.register(DFSAlgorithm);
