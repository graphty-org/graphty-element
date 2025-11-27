import {SuggestedStylesConfig} from "../config";
import {Algorithm} from "./Algorithm";

interface CommunityResult {
    communities: (number | string)[][];
    modularity: number;
}

export class GirvanNewmanAlgorithm extends Algorithm {
    static namespace = "graphty";
    static type = "girvan-newman";

    static suggestedStyles = (): SuggestedStylesConfig => ({
        layers: [
            {
                node: {
                    selector: "",
                    style: {
                        enabled: true,
                    },
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.girvan-newman.communityId"],
                        output: "style.texture.color",
                        expr: "{ return StyleHelpers.color.categorical.tolVibrant(arguments[0]) }",
                    },
                },
                metadata: {
                    name: "Girvan-Newman - Vibrant Colors",
                    description: "7 high-saturation community colors",
                },
            },
        ],
        description: "Visualizes communities detected via edge betweenness removal",
        category: "grouping",
    });

    // eslint-disable-next-line @typescript-eslint/require-await
    async run(): Promise<void> {
        const g = this.graph;
        const nodes = Array.from(g.getDataManager().nodes.keys());
        const n = nodes.length;

        if (n === 0) {
            return;
        }

        // Run Girvan-Newman algorithm
        const result = this.girvanNewman(nodes);

        // Store community assignments for each node
        const communityMap = new Map<number | string, number>();
        for (let i = 0; i < result.communities.length; i++) {
            for (const nodeId of result.communities[i]) {
                communityMap.set(nodeId, i);
            }
        }

        // Store results on nodes
        for (const nodeId of nodes) {
            const communityId = communityMap.get(nodeId) ?? 0;
            this.addNodeResult(nodeId, "communityId", communityId);
        }

        // Store graph-level results
        this.addGraphResult("modularity", result.modularity);
        this.addGraphResult("communityCount", result.communities.length);
    }

    /**
     * Girvan-Newman community detection implementation
     * Iteratively removes edges with highest betweenness centrality
     */
    private girvanNewman(nodes: (number | string)[]): CommunityResult {
        // Build adjacency representation from the current graph edges
        const adjacency = this.buildAdjacency();

        // Track best modularity and its community structure
        let bestModularity = -Infinity;
        let bestCommunities: (number | string)[][] = [nodes.slice()];

        // Get initial modularity
        const initialCommunities = this.findConnectedComponents(adjacency, nodes);
        bestModularity = this.calculateModularity(initialCommunities, adjacency, nodes);
        bestCommunities = initialCommunities;

        // Clone adjacency for modification
        const workingAdjacency = this.cloneAdjacency(adjacency);

        // Continue until we've removed enough edges or no edges remain
        const maxIterations = this.countEdges(workingAdjacency);

        for (let i = 0; i < maxIterations; i++) {
            // Calculate edge betweenness
            const edgeBetweenness = this.calculateEdgeBetweenness(workingAdjacency, nodes);

            if (edgeBetweenness.size === 0) {
                break;
            }

            // Find edge with highest betweenness
            let maxBetweenness = -1;
            let edgeToRemove: [string, string] | null = null;

            for (const [edgeKey, betweenness] of edgeBetweenness) {
                if (betweenness > maxBetweenness) {
                    maxBetweenness = betweenness;
                    edgeToRemove = this.parseEdgeKey(edgeKey);
                }
            }

            if (!edgeToRemove) {
                break;
            }

            // Remove the edge
            this.removeEdge(workingAdjacency, edgeToRemove[0], edgeToRemove[1]);

            // Find connected components
            const currentCommunities = this.findConnectedComponents(workingAdjacency, nodes);

            // Calculate modularity
            const modularity = this.calculateModularity(currentCommunities, adjacency, nodes);

            if (modularity > bestModularity) {
                bestModularity = modularity;
                bestCommunities = currentCommunities;
            }
        }

        return {
            communities: bestCommunities,
            modularity: bestModularity,
        };
    }

    /**
     * Build adjacency list from graph edges
     */
    private buildAdjacency(): Map<string, Set<string>> {
        const adjacency = new Map<string, Set<string>>();
        const {edges, nodes} = this.graph.getDataManager();

        // Initialize all nodes
        for (const nodeId of nodes.keys()) {
            adjacency.set(String(nodeId), new Set());
        }

        // Add edges (undirected)
        for (const edge of edges.values()) {
            const src = String(edge.srcId);
            const dst = String(edge.dstId);

            if (!adjacency.has(src)) {
                adjacency.set(src, new Set());
            }

            if (!adjacency.has(dst)) {
                adjacency.set(dst, new Set());
            }

            const srcSet = adjacency.get(src);
            const dstSet = adjacency.get(dst);
            if (srcSet) {
                srcSet.add(dst);
            }

            if (dstSet) {
                dstSet.add(src);
            }
        }

        return adjacency;
    }

    /**
     * Clone adjacency for modification
     */
    private cloneAdjacency(adjacency: Map<string, Set<string>>): Map<string, Set<string>> {
        const clone = new Map<string, Set<string>>();

        for (const [node, neighbors] of adjacency) {
            clone.set(node, new Set(neighbors));
        }

        return clone;
    }

    /**
     * Count edges in adjacency (divide by 2 for undirected)
     */
    private countEdges(adjacency: Map<string, Set<string>>): number {
        let count = 0;

        for (const neighbors of adjacency.values()) {
            count += neighbors.size;
        }

        return count / 2;
    }

    /**
     * Calculate edge betweenness centrality using BFS
     */
    private calculateEdgeBetweenness(
        adjacency: Map<string, Set<string>>,
        nodes: (number | string)[],
    ): Map<string, number> {
        const betweenness = new Map<string, number>();

        for (const source of nodes) {
            const sourceStr = String(source);
            const sourceNeighbors = adjacency.get(sourceStr);

            if (!sourceNeighbors || sourceNeighbors.size === 0) {
                continue;
            }

            // BFS to find shortest paths
            const queue: string[] = [sourceStr];
            const dist = new Map<string, number>();
            const sigma = new Map<string, number>(); // Number of shortest paths
            const pred = new Map<string, string[]>(); // Predecessors

            dist.set(sourceStr, 0);
            sigma.set(sourceStr, 1);

            const stack: string[] = [];

            while (queue.length > 0) {
                const v = queue.shift();
                if (v === undefined) {
                    break;
                }

                stack.push(v);

                const neighbors = adjacency.get(v);
                if (!neighbors) {
                    continue;
                }

                const vDist = dist.get(v) ?? 0;
                const vSigma = sigma.get(v) ?? 0;

                for (const w of neighbors) {
                    // First visit
                    if (!dist.has(w)) {
                        dist.set(w, vDist + 1);
                        queue.push(w);
                    }

                    // Shortest path to w via v
                    if (dist.get(w) === vDist + 1) {
                        sigma.set(w, (sigma.get(w) ?? 0) + vSigma);

                        if (!pred.has(w)) {
                            pred.set(w, []);
                        }

                        const predW = pred.get(w);
                        if (predW) {
                            predW.push(v);
                        }
                    }
                }
            }

            // Accumulate betweenness
            const delta = new Map<string, number>();

            while (stack.length > 0) {
                const w = stack.pop();
                if (w === undefined) {
                    break;
                }

                const predecessors = pred.get(w);

                if (predecessors) {
                    const wSigma = sigma.get(w) ?? 1;
                    const wDelta = delta.get(w) ?? 0;

                    for (const v of predecessors) {
                        const vSigma = sigma.get(v) ?? 1;
                        const contribution = (vSigma / wSigma) * (1 + wDelta);
                        delta.set(v, (delta.get(v) ?? 0) + contribution);

                        // Add to edge betweenness
                        const edgeKey = this.makeEdgeKey(v, w);
                        betweenness.set(edgeKey, (betweenness.get(edgeKey) ?? 0) + contribution);
                    }
                }
            }
        }

        return betweenness;
    }

    /**
     * Create canonical edge key
     */
    private makeEdgeKey(a: string, b: string): string {
        return a < b ? `${a}|${b}` : `${b}|${a}`;
    }

    /**
     * Parse edge key back to node IDs
     */
    private parseEdgeKey(key: string): [string, string] {
        const parts = key.split("|");
        return [parts[0], parts[1]];
    }

    /**
     * Remove an edge from adjacency
     */
    private removeEdge(adjacency: Map<string, Set<string>>, a: string, b: string): void {
        adjacency.get(a)?.delete(b);
        adjacency.get(b)?.delete(a);
    }

    /**
     * Find connected components in the graph
     */
    private findConnectedComponents(
        adjacency: Map<string, Set<string>>,
        nodes: (number | string)[],
    ): (number | string)[][] {
        const visited = new Set<string>();
        const components: (number | string)[][] = [];

        for (const node of nodes) {
            const nodeStr = String(node);

            if (visited.has(nodeStr)) {
                continue;
            }

            const component: (number | string)[] = [];
            const queue = [nodeStr];

            while (queue.length > 0) {
                const current = queue.shift();
                if (current === undefined) {
                    break;
                }

                if (visited.has(current)) {
                    continue;
                }

                visited.add(current);

                // Find original node (could be string or number)
                const originalNode = nodes.find((n) => String(n) === current);
                if (originalNode !== undefined) {
                    component.push(originalNode);
                }

                const neighbors = adjacency.get(current);

                if (neighbors) {
                    for (const neighbor of neighbors) {
                        if (!visited.has(neighbor)) {
                            queue.push(neighbor);
                        }
                    }
                }
            }

            if (component.length > 0) {
                components.push(component);
            }
        }

        return components;
    }

    /**
     * Calculate modularity of a community partition
     */
    private calculateModularity(
        communities: (number | string)[][],
        originalAdjacency: Map<string, Set<string>>,
        nodes: (number | string)[],
    ): number {
        const m = this.countEdges(originalAdjacency);
        if (m === 0) {
            return 0;
        }

        // Create community membership map
        const communityOf = new Map<string, number>();

        for (let i = 0; i < communities.length; i++) {
            for (const node of communities[i]) {
                communityOf.set(String(node), i);
            }
        }

        let modularity = 0;

        for (const nodeI of nodes) {
            for (const nodeJ of nodes) {
                const iStr = String(nodeI);
                const jStr = String(nodeJ);

                // Only count if in same community
                if (communityOf.get(iStr) !== communityOf.get(jStr)) {
                    continue;
                }

                // Check if edge exists
                const hasEdge = originalAdjacency.get(iStr)?.has(jStr) ? 1 : 0;

                // Get degrees
                const ki = originalAdjacency.get(iStr)?.size ?? 0;
                const kj = originalAdjacency.get(jStr)?.size ?? 0;

                modularity += hasEdge - ((ki * kj) / (2 * m));
            }
        }

        return modularity / (2 * m);
    }
}

// Auto-register this algorithm when the module is imported
Algorithm.register(GirvanNewmanAlgorithm);
