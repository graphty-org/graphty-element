/**
 * Mock Graph with Custom Data for testing.
 * @module test/helpers/mock-graph-custom-data
 */

import type {Graph} from "../../src/Graph";
import type {DataManager} from "../../src/managers";

/**
 * Options for creating a mock graph with custom data.
 */
export interface MockGraphCustomDataOptions {
    /** Number of nodes to create */
    nodeCount?: number;
    /** Number of edges to create */
    edgeCount?: number;
    /** Custom node data generator function */
    nodeDataGenerator?: (index: number) => Record<string, unknown>;
    /** Custom edge data generator function */
    edgeDataGenerator?: (index: number, srcId: string, dstId: string) => Record<string, unknown>;
}

/**
 * Mock node data structure.
 */
interface MockNodeData {
    id: string;
    data: Record<string, unknown>;
}

/**
 * Mock edge data structure.
 */
interface MockEdgeData {
    id: string;
    srcId: string;
    dstId: string;
    data: Record<string, unknown>;
}

/**
 * Create a mock graph with custom data for testing.
 * This allows tests to specify exactly what data properties nodes and edges have.
 *
 * @param options - Configuration options
 * @returns A mock graph for testing
 */
export function createMockGraphWithCustomData(options: MockGraphCustomDataOptions = {}): Graph {
    const {
        nodeCount = 10,
        edgeCount = 15,
        nodeDataGenerator = () => ({}),
        edgeDataGenerator = () => ({}),
    } = options;

    // Create mock nodes with custom data
    const mockNodes = new Map<string, MockNodeData>();
    for (let i = 0; i < nodeCount; i++) {
        const id = `node-${i}`;
        const customData = nodeDataGenerator(i);
        mockNodes.set(id, {
            id,
            data: {
                id,
                ... customData,
            },
        });
    }

    // Create mock edges with custom data
    const mockEdges = new Map<string, MockEdgeData>();
    const nodeIds = Array.from(mockNodes.keys());
    for (let i = 0; i < edgeCount && nodeIds.length > 1; i++) {
        const id = `edge-${i}`;
        const srcIdx = i % nodeIds.length;
        const dstIdx = (i + 1) % nodeIds.length;
        const srcId = nodeIds[srcIdx];
        const dstId = nodeIds[dstIdx];
        const customData = edgeDataGenerator(i, srcId, dstId);
        mockEdges.set(id, {
            id,
            srcId,
            dstId,
            data: {
                id,
                ... customData,
            },
        });
    }

    // Create mock data manager
    const mockDataManager = {
        nodes: mockNodes,
        edges: mockEdges,
        getNode: (id: string | number) => mockNodes.get(String(id)),
        getEdge: (id: string) => mockEdges.get(id),
    } as unknown as DataManager;

    // Create minimal mock graph with data access
    const mockGraph = {
        getNodeCount: () => mockNodes.size,
        getEdgeCount: () => mockEdges.size,
        getDataManager: () => mockDataManager,
        // Other methods return minimal mocks
        getLayoutManager: () => ({
            layoutEngine: {type: "ngraph"},
            running: false,
            isSettled: true,
        }),
        getStyles: () => ({
            config: {
                graph: {twoD: false, layout: "ngraph"},
            },
            layers: [],
        }),
        is2D: () => false,
    } as unknown as Graph;

    return mockGraph;
}
