/**
 * @fileoverview Utility for converting graphty-element Graph to @graphty/algorithms Graph format
 */

import {Graph as AlgorithmGraph} from "@graphty/algorithms";

import type {Graph} from "../../Graph";

/**
 * Options for graph conversion
 */
export interface GraphConverterOptions {
    /** Whether to treat the graph as directed (default: false for undirected) */
    directed?: boolean;
    /** Weight attribute name on edges (default: "value") */
    weightAttribute?: string;
    /** Whether to allow parallel edges (default: true to handle real-world datasets) */
    allowParallelEdges?: boolean;
    /**
     * Whether to add reverse edges for bidirectional traversal in undirected mode.
     * When true (default), creates a directed graph internally with edges in both directions.
     * When false, creates a truly undirected graph (required for MST algorithms).
     * Only applies when directed=false.
     */
    addReverseEdges?: boolean;
}

/**
 * Convert a graphty-element Graph to @graphty/algorithms Graph format
 *
 * @param g - The graphty-element Graph instance
 * @param options - Conversion options
 * @returns A new AlgorithmGraph instance
 */
export function toAlgorithmGraph(g: Graph, options: GraphConverterOptions = {}): AlgorithmGraph {
    const {directed = false, weightAttribute = "value", allowParallelEdges = true, addReverseEdges = true} = options;

    // Determine the actual directedness of the created graph:
    // - If directed=true, create a directed graph (no reverse edges needed)
    // - If directed=false and addReverseEdges=true (default), create a directed graph internally
    //   with edges in both directions for algorithms that need bidirectional traversal
    // - If directed=false and addReverseEdges=false, create a truly undirected graph
    //   (required for MST algorithms like kruskal/prim)
    const useDirectedInternally = directed || addReverseEdges;
    const graph = new AlgorithmGraph({directed: useDirectedInternally, allowParallelEdges});

    // Add all nodes
    for (const node of g.getDataManager().nodes.values()) {
        graph.addNode(node.id);
    }

    // Add all edges with weights
    for (const edge of g.getDataManager().edges.values()) {
        // Get weight from edge data (weightAttribute already defaults to "value")
        // edge.data might be undefined in mock graphs used during testing
        // First try edge.data[weightAttribute], then fall back to edge[weightAttribute]
        const edgeData = edge.data as Record<string, unknown> | undefined;
        const edgeObject = edge as unknown as Record<string, unknown>;
        let rawWeight = edgeData?.[weightAttribute];

        if (rawWeight === undefined) {
            rawWeight = edgeObject[weightAttribute];
        }

        const weight: number = typeof rawWeight === "number" ? rawWeight : 1;

        graph.addEdge(edge.srcId, edge.dstId, weight);

        // For undirected graphs with reverse edges enabled, add reverse edge as well
        // This ensures algorithms like bellmanFord work correctly in both directions
        if (!directed && addReverseEdges) {
            graph.addEdge(edge.dstId, edge.srcId, weight);
        }
    }

    return graph;
}

/**
 * Convert a graphty-element Graph to adjacency map format
 * Used by algorithms like labelPropagation and leiden that expect Map<string, Map<string, number>>
 *
 * @param g - The graphty-element Graph instance
 * @param options - Conversion options
 * @returns An adjacency map where outer map keys are node IDs, inner maps are neighbor -> weight
 */
export function toAdjacencyMap(g: Graph, options: GraphConverterOptions = {}): Map<string, Map<string, number>> {
    const {weightAttribute = "value"} = options;

    const adjacencyMap = new Map<string, Map<string, number>>();

    // Initialize all nodes with empty neighbor maps
    for (const node of g.getDataManager().nodes.values()) {
        adjacencyMap.set(String(node.id), new Map<string, number>());
    }

    // Add edges (both directions for undirected graph)
    for (const edge of g.getDataManager().edges.values()) {
        const srcId = String(edge.srcId);
        const dstId = String(edge.dstId);

        // Get weight from edge data
        const edgeData = edge.data as Record<string, unknown> | undefined;
        const edgeObject = edge as unknown as Record<string, unknown>;
        let rawWeight = edgeData?.[weightAttribute];

        if (rawWeight === undefined) {
            rawWeight = edgeObject[weightAttribute];
        }

        const weight: number = typeof rawWeight === "number" ? rawWeight : 1;

        // Add edge in both directions (undirected)
        adjacencyMap.get(srcId)?.set(dstId, weight);
        adjacencyMap.get(dstId)?.set(srcId, weight);
    }

    return adjacencyMap;
}
