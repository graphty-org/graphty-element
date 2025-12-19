/**
 * Schema Test Graph utilities for SchemaExtractor testing.
 * @module test/helpers/schema-test-graph
 */

import type {Graph} from "../../src/Graph";
import type {DataManager} from "../../src/managers";

/**
 * Options for creating a schema test graph.
 */
export interface SchemaTestGraphOptions {
    /** Create an empty graph */
    empty?: boolean;
    /** Create nodes with mixed type values for a property */
    mixedTypes?: boolean;
    /** Create nodes with many unique string values (>10) */
    manyUniqueStrings?: boolean;
    /** Create nodes with null/undefined values */
    nullValues?: boolean;
    /** Number of nodes to create */
    nodeCount?: number;
    /** Number of edges to create */
    edgeCount?: number;
}

/**
 * Mock node data for schema testing.
 */
interface SchemaTestNodeData {
    id: string;
    data: Record<string, unknown>;
    algorithmResults?: Record<string, unknown>;
}

/**
 * Mock edge data for schema testing.
 */
interface SchemaTestEdgeData {
    id: string;
    srcId: string;
    dstId: string;
    data: Record<string, unknown>;
}

/**
 * Create a mock graph with rich data for schema extraction testing.
 *
 * @param options - Configuration options
 * @returns A mock graph for testing
 */
export function createSchemaTestGraph(options: SchemaTestGraphOptions = {}): Graph {
    const {
        empty = false,
        mixedTypes = false,
        manyUniqueStrings = false,
        nullValues = false,
        // When manyUniqueStrings is true, we need more than 10 nodes to exceed the enum threshold
        nodeCount = manyUniqueStrings ? 15 : 10,
        edgeCount = 15,
    } = options;

    // Create mock nodes with various property types
    const mockNodes = new Map<string, SchemaTestNodeData>();
    const mockEdges = new Map<string, SchemaTestEdgeData>();

    if (!empty) {
        const nodeTypes = ["server", "client", "router"];
        const tags = [["web", "production"], ["database", "staging"], ["api", "development"]];

        for (let i = 0; i < nodeCount; i++) {
            const id = `node-${i}`;
            const nodeData: Record<string, unknown> = {
                id,
                label: `Node ${i}`,
                // String property with limited values (enum-like)
                type: nodeTypes[i % nodeTypes.length],
                // Number property
                age: 20 + (i * 3),
                // Boolean property
                active: i % 2 === 0,
                // Array property
                tags: tags[i % tags.length],
                // Nested object property
                metadata: {
                    createdBy: i % 2 === 0 ? "admin" : "user",
                    version: 1 + (i % 5),
                },
            };

            // Add mixed type property if requested
            if (mixedTypes) {
                nodeData.value = i % 2 === 0 ? i * 10 : `value-${i}`;
            }

            // Add many unique strings if requested
            if (manyUniqueStrings) {
                nodeData.uniqueName = `unique-string-value-${i}-${Date.now()}-${Math.random()}`;
            }

            // Add nullable property if requested
            if (nullValues) {
                nodeData.optional = i % 3 === 0 ? null : `optional-${i}`;
            }

            mockNodes.set(id, {
                id,
                data: nodeData,
            });
        }

        // Create edges with properties
        const nodeIds = Array.from(mockNodes.keys());
        const relations = ["connects", "depends", "owns"];

        for (let i = 0; i < edgeCount && nodeIds.length > 1; i++) {
            const id = `edge-${i}`;
            const srcIdx = i % nodeIds.length;
            const dstIdx = (i + 1) % nodeIds.length;

            mockEdges.set(id, {
                id,
                srcId: nodeIds[srcIdx],
                dstId: nodeIds[dstIdx],
                data: {
                    id,
                    weight: Math.random() * 100,
                    relation: relations[i % relations.length],
                    bidirectional: i % 2 === 0,
                },
            });
        }
    }

    // Create mock data manager
    const mockDataManager = {
        nodes: mockNodes,
        edges: mockEdges,
        getNode: (id: string | number) => mockNodes.get(String(id)),
        getEdge: (id: string) => mockEdges.get(id),
    } as unknown as DataManager;

    // Create minimal mock graph
    const mockGraph = {
        getNodeCount: () => mockNodes.size,
        getEdgeCount: () => mockEdges.size,
        getDataManager: () => mockDataManager,
    } as unknown as Graph;

    return mockGraph;
}
