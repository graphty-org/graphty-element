/**
 * @fileoverview Utility functions for building graph data structures from graphty-element Graph
 */

/**
 * Minimal edge data interface required by graph utilities
 */
export interface MinimalEdge {
    srcId: string | number;
    dstId: string | number;
    data?: Record<string, unknown>;
    [key: string]: unknown;
}

/**
 * Minimal interface for graph-like objects
 * This allows the utilities to work with both real Graph instances and mock graphs in tests
 */
export interface GraphLike {
    getDataManager: () => {
        nodes: Map<string | number, unknown>;
        edges: Map<string | number, MinimalEdge>;
    };
}

/**
 * Options for building adjacency lists
 */
export interface AdjacencyOptions {
    /** Whether to treat the graph as directed (default: false for undirected) */
    directed?: boolean;
    /** Weight attribute name on edges (default: "value") */
    weightAttribute?: string;
}

/**
 * Build an unweighted adjacency list from graph edges.
 *
 * Returns a Map where keys are node IDs (as strings) and values are Sets of neighbor node IDs.
 * For undirected graphs, both directions are added automatically.
 *
 * @param graph - The graphty-element Graph instance
 * @param options - Configuration options
 * @returns Map of node ID to Set of neighbor IDs
 *
 * @example
 * ```typescript
 * // Undirected graph
 * const adj = buildAdjacencyList(graph);
 * adj.get("A")?.has("B"); // true if A-B edge exists
 *
 * // Directed graph
 * const directedAdj = buildAdjacencyList(graph, { directed: true });
 * ```
 */
export function buildAdjacencyList(
    graph: GraphLike,
    options: AdjacencyOptions = {},
): Map<string, Set<string>> {
    const {directed = false} = options;
    const adjacency = new Map<string, Set<string>>();
    const {nodes, edges} = graph.getDataManager();

    // Initialize all nodes with empty sets
    for (const nodeId of nodes.keys()) {
        adjacency.set(String(nodeId), new Set());
    }

    // Add edges
    for (const edge of edges.values()) {
        const src = String(edge.srcId);
        const dst = String(edge.dstId);

        adjacency.get(src)?.add(dst);

        if (!directed) {
            adjacency.get(dst)?.add(src);
        }
    }

    return adjacency;
}

/**
 * Build a weighted adjacency list from graph edges.
 *
 * Returns a Map where keys are node IDs (as strings) and values are Maps of neighbor ID to edge weight.
 * For undirected graphs, both directions are added automatically with the same weight.
 *
 * @param graph - The graphty-element Graph instance
 * @param options - Configuration options
 * @returns Map of node ID to Map of neighbor ID to weight
 *
 * @example
 * ```typescript
 * // Get weighted adjacency (weights from 'value' attribute)
 * const adj = buildWeightedAdjacencyList(graph);
 * const weight = adj.get("A")?.get("B"); // edge weight from A to B
 *
 * // Use custom weight attribute
 * const adj = buildWeightedAdjacencyList(graph, { weightAttribute: "weight" });
 * ```
 */
export function buildWeightedAdjacencyList(
    graph: GraphLike,
    options: AdjacencyOptions = {},
): Map<string, Map<string, number>> {
    const {directed = false, weightAttribute = "value"} = options;
    const adjacency = new Map<string, Map<string, number>>();
    const {nodes, edges} = graph.getDataManager();

    // Initialize all nodes with empty maps
    for (const nodeId of nodes.keys()) {
        adjacency.set(String(nodeId), new Map());
    }

    // Add edges with weights
    for (const edge of edges.values()) {
        const src = String(edge.srcId);
        const dst = String(edge.dstId);

        // Get weight from edge data or edge object directly
        const edgeData = edge.data;
        let rawWeight = edgeData?.[weightAttribute];

        if (rawWeight === undefined) {
            rawWeight = edge[weightAttribute];
        }

        const weight: number = typeof rawWeight === "number" ? rawWeight : 1;

        adjacency.get(src)?.set(dst, weight);

        if (!directed) {
            adjacency.get(dst)?.set(src, weight);
        }
    }

    return adjacency;
}
