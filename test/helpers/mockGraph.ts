/**
 * Shared mock graph factory for algorithm tests
 *
 * This module provides a centralized, typed mock graph implementation for testing
 * algorithms. Algorithms expect a Graph type but only use getDataManager(), so we
 * provide a minimal mock that satisfies this interface.
 *
 * The return type is Graph to satisfy algorithm constructors, but internally it's
 * a simplified mock object.
 */
import type {Graph} from "../../src/Graph";

/**
 * Options for creating a mock graph
 */
/**
 * A node data object with id and optional extra properties
 */
interface NodeData {
    id: string | number;
    [key: string]: unknown;
}

/**
 * An edge data object with source and destination ids and optional extra properties
 */
interface EdgeData {
    srcId: string | number;
    dstId: string | number;
    [key: string]: unknown;
}

/**
 * Options for creating a mock graph
 */
export interface MockGraphOpts {
    /** Array of node objects with id and optional properties */
    nodes?: NodeData[];
    /** Array of edge objects with srcId, dstId, and optional properties */
    edges?: EdgeData[];
    /** Path to a JSON data file to import nodes/edges from */
    dataPath?: string;
}

/**
 * Internal mock node type for algorithm results storage
 */
interface MockNode {
    id: string | number;
    algorithmResults?: Record<string, Record<string, Record<string, unknown>>>;
    [key: string]: unknown;
}

/**
 * Internal mock edge type for algorithm results storage
 */
interface MockEdge {
    srcId: string | number;
    dstId: string | number;
    algorithmResults?: Record<string, Record<string, Record<string, unknown>>>;
    [key: string]: unknown;
}

/**
 * Type for graph-level algorithm results
 */
type GraphResults = Record<string, Record<string, Record<string, unknown>>>;

/**
 * Creates a mock graph for algorithm testing
 *
 * This function creates a mock graph object that satisfies the Graph interface
 * as used by algorithms. Algorithms only use getDataManager() to access nodes
 * and edges, so this mock provides a minimal implementation.
 *
 * @param opts - Configuration options for the mock graph
 * @returns A mock graph that can be passed to algorithm constructors
 *
 * @example
 * ```typescript
 * // Create empty mock graph
 * const graph = await createMockGraph();
 *
 * // Create mock graph with inline data
 * const graph = await createMockGraph({
 *   nodes: [{id: "A"}, {id: "B"}],
 *   edges: [{srcId: "A", dstId: "B"}]
 * });
 *
 * // Create mock graph from JSON file (path relative to mockGraph.ts)
 * const graph = await createMockGraph({
 *   dataPath: "./data4.json"
 * });
 *
 * // Use with an algorithm
 * const algo = new DegreeAlgorithm(graph);
 * await algo.run();
 *
 * // Access results through the mock
 * const dm = graph.getDataManager();
 * const nodeA = dm.nodes.get("A");
 * console.log(nodeA.algorithmResults.graphty.degree.inDegree);
 * ```
 */
export async function createMockGraph(opts: MockGraphOpts = {}): Promise<Graph> {
    const nodes = new Map<string | number, MockNode>();
    const edges = new Map<string | number, MockEdge>();
    let graphResults: GraphResults | undefined;

    // Add inline nodes
    if (opts.nodes) {
        for (const n of opts.nodes) {
            nodes.set(n.id, n as MockNode);
        }
    }

    // Add inline edges
    if (opts.edges) {
        for (const e of opts.edges) {
            edges.set(`${e.srcId}:${e.dstId}`, e as MockEdge);
        }
    }

    // Import nodes and edges from data file
    if (typeof opts.dataPath === "string") {
        const imp = await import(opts.dataPath) as {
            nodes: NodeData[];
            edges: EdgeData[];
        };
        for (const n of imp.nodes) {
            nodes.set(n.id, n as MockNode);
        }
        for (const e of imp.edges) {
            edges.set(`${e.srcId}:${e.dstId}`, e as MockEdge);
        }
    }

    // Create mock graph with data manager
    // Using a type assertion because we're creating a minimal mock that only
    // implements the parts of Graph that algorithms actually use (getDataManager)
    const mockGraph = {
        nodes,
        edges,
        getDataManager() {
            return {
                nodes,
                edges,
                get graphResults() {
                    return graphResults;
                },
                set graphResults(val: GraphResults | undefined) {
                    graphResults = val;
                },
            };
        },
    };

    // Cast to Graph - algorithms only use getDataManager() which we implement
    return mockGraph as unknown as Graph;
}

/**
 * Helper to access graph-level algorithm results safely
 *
 * @param graph - The graph (as returned by createMockGraph)
 * @param namespace - The algorithm namespace (e.g., "graphty")
 * @param algorithm - The algorithm type (e.g., "degree", "pagerank")
 * @param resultKey - The specific result key
 * @returns The result value (any type, may be undefined)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getGraphResult(graph: Graph, namespace: string, algorithm: string, resultKey: string): any {
    // Access the mock's internal graphResults through getDataManager()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dm = graph.getDataManager() as any;
    return dm.graphResults?.[namespace]?.[algorithm]?.[resultKey];
}

/**
 * Helper to get a node from the mock graph and access its algorithm results
 *
 * @param graph - The graph (as returned by createMockGraph)
 * @param nodeId - The node ID to look up
 * @returns The node object with algorithmResults (any type)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getMockNode(graph: Graph, nodeId: string | number): any {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dm = graph.getDataManager() as any;
    return dm.nodes.get(nodeId);
}

/**
 * Helper to get node algorithm result directly
 *
 * @param graph - The graph
 * @param nodeId - The node ID
 * @param namespace - Algorithm namespace
 * @param algorithm - Algorithm type
 * @param resultKey - Result key
 * @returns The result value (any type, may be undefined)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getNodeResult(graph: Graph, nodeId: string | number, namespace: string, algorithm: string, resultKey: string): any {
    const node = getMockNode(graph, nodeId);
    return node?.algorithmResults?.[namespace]?.[algorithm]?.[resultKey];
}

/**
 * Helper to get edge algorithm result directly
 *
 * @param graph - The graph
 * @param srcId - Source node ID
 * @param dstId - Destination node ID
 * @param namespace - Algorithm namespace
 * @param algorithm - Algorithm type
 * @param resultKey - Result key
 * @returns The result value (any type, may be undefined)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getEdgeResult(graph: Graph, srcId: string | number, dstId: string | number, namespace: string, algorithm: string, resultKey: string): any {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dm = graph.getDataManager() as any;
    const edge = dm.edges.get(`${srcId}:${dstId}`);
    return edge?.algorithmResults?.[namespace]?.[algorithm]?.[resultKey];
}
