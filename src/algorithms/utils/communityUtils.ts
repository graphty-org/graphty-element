/**
 * @file Shared utilities for community detection algorithms
 */

import type {GraphLike} from "./graphUtils";

/**
 * Options for community utilities
 */
export interface CommunityOptions {
    /** Weight attribute name on edges (default: "value") */
    weightAttribute?: string;
}

/**
 * Options for degree calculation
 */
export interface DegreeOptions {
    /** Whether to treat the graph as directed (default: false for undirected) */
    directed?: boolean;
    /** For directed graphs, count "in", "out", or "both" edges (default: "both") */
    countType?: "in" | "out" | "both";
}

/**
 * Convert a community assignment map to an array of arrays.
 *
 * Takes a Map where keys are node IDs and values are community IDs,
 * and returns an array where each element is an array of node IDs in that community.
 * @param communities - Map of node ID to community ID
 * @returns Array of arrays, where each inner array contains node IDs in the same community
 * @example
 * ```typescript
 * const communities = new Map([["A", 0], ["B", 0], ["C", 1]]);
 * const result = extractCommunities(communities);
 * // result: [["A", "B"], ["C"]]
 * ```
 */
export function extractCommunities(
    communities: Map<number | string, number>,
): (number | string)[][] {
    const communityArrays = new Map<number, (number | string)[]>();

    for (const [nodeId, communityId] of communities) {
        let communityArray = communityArrays.get(communityId);

        if (communityArray === undefined) {
            communityArray = [];
            communityArrays.set(communityId, communityArray);
        }

        communityArray.push(nodeId);
    }

    return Array.from(communityArrays.values());
}

/**
 * Get the total weight of all edges in the graph.
 * @param graph - The graphty-element Graph instance
 * @param options - Configuration options
 * @returns Total edge weight
 * @example
 * ```typescript
 * const totalWeight = getTotalEdgeWeight(graph);
 * ```
 */
export function getTotalEdgeWeight(
    graph: GraphLike,
    options: CommunityOptions = {},
): number {
    const {weightAttribute = "value"} = options;
    const {edges} = graph.getDataManager();

    let totalWeight = 0;

    for (const edge of edges.values()) {
        const edgeData = edge.data;
        let rawWeight = edgeData?.[weightAttribute];

        if (rawWeight === undefined) {
            rawWeight = edge[weightAttribute];
        }

        const weight: number = typeof rawWeight === "number" ? rawWeight : 1;
        totalWeight += weight;
    }

    return totalWeight;
}

/**
 * Get the degree of a specific node.
 *
 * In undirected mode (default), counts all edges incident to the node.
 * In directed mode, can count incoming, outgoing, or both edges.
 * @param graph - The graphty-element Graph instance
 * @param nodeId - The ID of the node
 * @param options - Configuration options
 * @returns The degree of the node
 * @example
 * ```typescript
 * // Undirected degree
 * const degree = getNodeDegree(graph, "A");
 *
 * // Directed out-degree
 * const outDegree = getNodeDegree(graph, "A", { directed: true, countType: "out" });
 * ```
 */
export function getNodeDegree(
    graph: GraphLike,
    nodeId: number | string,
    options: DegreeOptions = {},
): number {
    const {directed = false, countType = "both"} = options;
    const {edges} = graph.getDataManager();

    let degree = 0;
    const nodeIdStr = String(nodeId);

    for (const edge of edges.values()) {
        const srcIdStr = String(edge.srcId);
        const dstIdStr = String(edge.dstId);

        if (directed) {
            if (countType === "out" && srcIdStr === nodeIdStr) {
                degree++;
            } else if (countType === "in" && dstIdStr === nodeIdStr) {
                degree++;
            } else if (countType === "both") {
                if (srcIdStr === nodeIdStr || dstIdStr === nodeIdStr) {
                    degree++;
                }
            }
        } else {
            // Undirected: count if node is either source or destination
            if (srcIdStr === nodeIdStr || dstIdStr === nodeIdStr) {
                degree++;
            }
        }
    }

    return degree;
}

/**
 * Count the number of unique communities in a community assignment map.
 * @param communities - Map of node ID to community ID
 * @returns Number of unique communities
 * @example
 * ```typescript
 * const communities = new Map([["A", 0], ["B", 0], ["C", 1]]);
 * const count = countUniqueCommunities(communities);
 * // count: 2
 * ```
 */
export function countUniqueCommunities(
    communities: Map<number | string, number>,
): number {
    const uniqueCommunities = new Set<number>();

    for (const communityId of communities.values()) {
        uniqueCommunities.add(communityId);
    }

    return uniqueCommunities.size;
}
