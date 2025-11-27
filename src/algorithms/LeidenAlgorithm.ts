import {SuggestedStylesConfig} from "../config";
import {Algorithm} from "./Algorithm";

interface CommunityResult {
    communities: (number | string)[][];
    modularity: number;
    iterations: number;
}

export class LeidenAlgorithm extends Algorithm {
    static namespace = "graphty";
    static type = "leiden";

    static suggestedStyles = (): SuggestedStylesConfig => ({
        layers: [
            {
                node: {
                    selector: "",
                    style: {
                        enabled: true,
                    },
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.leiden.communityId"],
                        output: "style.texture.color",
                        expr: "{ return StyleHelpers.color.categorical.tolMuted(arguments[0]) }",
                    },
                },
                metadata: {
                    name: "Leiden - Muted Colors",
                    description: "7 subdued professional community colors",
                },
            },
        ],
        description: "Visualizes communities detected via Leiden algorithm (improved Louvain)",
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

        // Run Leiden algorithm
        const result = this.leiden(nodes);

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
     * Leiden community detection implementation
     * An improvement over Louvain that guarantees connected communities
     */
    private leiden(nodes: (number | string)[]): CommunityResult {
        const maxIterations = 100;
        const tolerance = 1e-6;
        const resolution = 1.0;

        // Initialize: each node in its own community
        const communities = new Map<number | string, number>();
        for (let i = 0; i < nodes.length; i++) {
            communities.set(nodes[i], i);
        }

        let modularity = this.calculateModularity(communities, resolution);
        let iteration = 0;
        let improved = true;

        while (iteration < maxIterations && improved) {
            // Phase 1: Local moving (like Louvain)
            improved = this.localMovingPhase(communities, resolution);

            // Phase 2: Refinement phase (unique to Leiden)
            // This ensures communities remain connected
            this.refinementPhase(communities);

            if (improved) {
                const newModularity = this.calculateModularity(communities, resolution);

                // Check for convergence
                if (newModularity - modularity < tolerance) {
                    break;
                }

                modularity = newModularity;
                iteration++;
            }
        }

        return {
            communities: this.extractCommunities(communities),
            modularity: this.calculateModularity(communities, resolution),
            iterations: iteration,
        };
    }

    /**
     * Phase 1: Local optimization - move nodes to neighboring communities
     */
    private localMovingPhase(
        communities: Map<number | string, number>,
        resolution: number,
    ): boolean {
        let globalImprovement = false;
        let localImprovement = true;

        while (localImprovement) {
            localImprovement = false;

            for (const nodeId of this.graph.getDataManager().nodes.keys()) {
                const currentCommunity = communities.get(nodeId);

                if (currentCommunity === undefined) {
                    continue;
                }

                // Calculate current modularity contribution
                const currentModularity = this.nodeModularityContribution(
                    nodeId,
                    currentCommunity,
                    communities,
                    resolution,
                );

                let bestCommunity = currentCommunity;
                let bestModularity = currentModularity;

                // Try moving to neighboring communities
                const neighborCommunities = this.getNeighborCommunities(nodeId, communities);

                for (const neighborCommunity of neighborCommunities) {
                    if (neighborCommunity === currentCommunity) {
                        continue;
                    }

                    const newModularity = this.nodeModularityContribution(
                        nodeId,
                        neighborCommunity,
                        communities,
                        resolution,
                    );

                    if (newModularity > bestModularity) {
                        bestModularity = newModularity;
                        bestCommunity = neighborCommunity;
                    }
                }

                // Move node if improvement found
                if (bestCommunity !== currentCommunity) {
                    communities.set(nodeId, bestCommunity);
                    localImprovement = true;
                    globalImprovement = true;
                }
            }
        }

        return globalImprovement;
    }

    /**
     * Phase 2: Refinement - ensure communities are well-connected
     * This is the key difference from Louvain
     */
    private refinementPhase(
        communities: Map<number | string, number>,
    ): void {
        // Get all unique communities
        const uniqueCommunities = new Set(communities.values());

        for (const communityId of uniqueCommunities) {
            // Get nodes in this community
            const communityNodes: (number | string)[] = [];
            for (const [nodeId, comm] of communities) {
                if (comm === communityId) {
                    communityNodes.push(nodeId);
                }
            }

            if (communityNodes.length <= 1) {
                continue;
            }

            // Check if the community is well-connected
            // If not, try to refine by checking subcommunities
            const subcommunities = this.findSubcommunities(communityNodes);

            // If we found disconnected subcommunities, split them
            if (subcommunities.length > 1) {
                // Assign new community IDs to subcommunities
                let nextCommunityId = Math.max(... communities.values()) + 1;

                for (let i = 1; i < subcommunities.length; i++) {
                    for (const nodeId of subcommunities[i]) {
                        communities.set(nodeId, nextCommunityId);
                    }

                    nextCommunityId++;
                }
            }
        }
    }

    /**
     * Find subcommunities within a set of nodes (connected components)
     */
    private findSubcommunities(
        nodes: (number | string)[],
    ): (number | string)[][] {
        const nodeSet = new Set(nodes.map((n) => String(n)));
        const visited = new Set<string>();
        const components: (number | string)[][] = [];

        const {edges} = this.graph.getDataManager();

        for (const node of nodes) {
            const nodeStr = String(node);

            if (visited.has(nodeStr)) {
                continue;
            }

            // BFS to find connected component within the community
            const component: (number | string)[] = [];
            const queue = [node];

            while (queue.length > 0) {
                const current = queue.shift();
                if (current === undefined) {
                    break;
                }

                const currentStr = String(current);

                if (visited.has(currentStr)) {
                    continue;
                }

                visited.add(currentStr);
                component.push(current);

                // Find neighbors that are also in the community
                for (const edge of edges.values()) {
                    let neighbor: number | string | null = null;

                    if (String(edge.srcId) === currentStr) {
                        neighbor = edge.dstId;
                    } else if (String(edge.dstId) === currentStr) {
                        neighbor = edge.srcId;
                    }

                    if (neighbor !== null) {
                        const neighborStr = String(neighbor);

                        if (nodeSet.has(neighborStr) && !visited.has(neighborStr)) {
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
     * Calculate modularity contribution of a node to a specific community
     */
    private nodeModularityContribution(
        nodeId: number | string,
        community: number,
        communities: Map<number | string, number>,
        resolution: number,
    ): number {
        const totalEdgeWeight = this.getTotalEdgeWeight();
        if (totalEdgeWeight === 0) {
            return 0;
        }

        let internalLinks = 0;
        let nodeDegree = 0;
        let communityDegree = 0;

        // Calculate node's connections to the community
        const {edges} = this.graph.getDataManager();

        for (const edge of edges.values()) {
            if (edge.srcId === nodeId) {
                const weight = 1; // Unweighted for now
                nodeDegree += weight;

                if (communities.get(edge.dstId) === community) {
                    internalLinks += weight;
                }
            }

            if (edge.dstId === nodeId) {
                const weight = 1;
                nodeDegree += weight;

                if (communities.get(edge.srcId) === community) {
                    internalLinks += weight;
                }
            }
        }

        // Calculate total degree of the community (excluding the node if it's currently in it)
        for (const [otherNodeId, otherCommunity] of communities) {
            if (otherCommunity === community && otherNodeId !== nodeId) {
                communityDegree += this.getNodeDegree(otherNodeId);
            }
        }

        // Modularity formula
        const modularityIncrease =
            (internalLinks - ((resolution * nodeDegree * communityDegree) / (2 * totalEdgeWeight))) /
            totalEdgeWeight;

        return modularityIncrease;
    }

    /**
     * Get communities of neighboring nodes
     */
    private getNeighborCommunities(
        nodeId: number | string,
        communities: Map<number | string, number>,
    ): Set<number> {
        const neighborCommunities = new Set<number>();
        const {edges} = this.graph.getDataManager();

        for (const edge of edges.values()) {
            if (edge.srcId === nodeId) {
                const community = communities.get(edge.dstId);
                if (community !== undefined) {
                    neighborCommunities.add(community);
                }
            }

            if (edge.dstId === nodeId) {
                const community = communities.get(edge.srcId);
                if (community !== undefined) {
                    neighborCommunities.add(community);
                }
            }
        }

        return neighborCommunities;
    }

    /**
     * Calculate total modularity of the current community assignment
     */
    private calculateModularity(
        communities: Map<number | string, number>,
        resolution: number,
    ): number {
        const totalEdgeWeight = this.getTotalEdgeWeight();
        if (totalEdgeWeight === 0) {
            return 0;
        }

        let modularity = 0;
        const countedEdges = new Set<string>();

        // Calculate modularity: Q = (1/2m) * Σ[A_ij - γ(k_i * k_j)/(2m)] * δ(c_i, c_j)
        const nodes = Array.from(this.graph.getDataManager().nodes.keys());
        for (const nodeI of nodes) {
            for (const nodeJ of nodes) {
                // Skip if already counted this pair (undirected graph)
                const nodeIStr = String(nodeI);
                const nodeJStr = String(nodeJ);
                const edgeKey =
                    nodeIStr <= nodeJStr ? `${nodeIStr}-${nodeJStr}` : `${nodeJStr}-${nodeIStr}`;
                if (countedEdges.has(edgeKey)) {
                    continue;
                }

                countedEdges.add(edgeKey);

                if (communities.get(nodeI) === communities.get(nodeJ)) {
                    let edgeWeight = 0;

                    // Check for edges in both directions
                    const {edges} = this.graph.getDataManager();

                    for (const edge of edges.values()) {
                        if (
                            (edge.srcId === nodeI && edge.dstId === nodeJ) ||
                            (edge.srcId === nodeJ && edge.dstId === nodeI)
                        ) {
                            edgeWeight += 1; // Unweighted for now
                        }
                    }

                    const degreeI = this.getNodeDegree(nodeI);
                    const degreeJ = this.getNodeDegree(nodeJ);

                    modularity +=
                        edgeWeight - ((resolution * degreeI * degreeJ) / (2 * totalEdgeWeight));
                }
            }
        }

        return modularity / (2 * totalEdgeWeight);
    }

    /**
     * Extract final community structure
     */
    private extractCommunities(
        communities: Map<number | string, number>,
    ): (number | string)[][] {
        const communityMap = new Map<number, (number | string)[]>();

        for (const [nodeId, community] of communities) {
            if (!communityMap.has(community)) {
                communityMap.set(community, []);
            }

            const communityNodes = communityMap.get(community);
            if (communityNodes) {
                communityNodes.push(nodeId);
            }
        }

        return Array.from(communityMap.values());
    }

    /**
     * Calculate total edge weight in the graph
     */
    private getTotalEdgeWeight(): number {
        const {edges} = this.graph.getDataManager();
        return edges.size;
    }

    /**
     * Get the total degree for a node
     */
    private getNodeDegree(nodeId: number | string): number {
        let degree = 0;
        const {edges} = this.graph.getDataManager();

        for (const edge of edges.values()) {
            if (edge.srcId === nodeId || edge.dstId === nodeId) {
                degree += 1; // Unweighted for now
            }
        }

        return degree;
    }
}

// Auto-register this algorithm when the module is imported
Algorithm.register(LeidenAlgorithm);
