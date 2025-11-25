import {SuggestedStylesConfig} from "../config";
import {Algorithm} from "./Algorithm";

interface CommunityResult {
    communities: (number | string)[][];
    modularity: number;
    iterations: number;
}

export class LouvainAlgorithm extends Algorithm {
    static namespace = "graphty";
    static type = "louvain";

    static suggestedStyles = (): SuggestedStylesConfig => ({
        layers: [
            {
                node: {
                    selector: "",
                    style: {
                        enabled: true,
                    },
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.louvain.communityId"],
                        output: "style.texture.color",
                        expr: "{ return StyleHelpers.color.categorical.okabeIto(arguments[0]) }",
                    },
                },
                metadata: {
                    name: "Louvain - Okabe-Ito Colors",
                    description: "8 vivid colorblind-safe community colors",
                },
            },
        ],
        description: "Visualizes graph communities through distinct colors",
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

        // Run Louvain algorithm
        const result = this.louvain(nodes);

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
    }

    /**
     * Louvain community detection implementation
     */
    private louvain(nodes: (number | string)[]): CommunityResult {
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
            improved = this.louvainPhase1(communities, resolution);

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
    private louvainPhase1(
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
Algorithm.register(LouvainAlgorithm);
