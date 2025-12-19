/**
 * E2E Graph Setup Helper - Shared setup for end-to-end AI command tests.
 * @module test/helpers/e2e-graph-setup
 */

import {Graph} from "../../src/Graph";

/**
 * Node data for setting up test graphs.
 */
export interface TestNodeData {
    id: string;
    [key: string]: unknown;
}

/**
 * Edge data for setting up test graphs.
 */
export interface TestEdgeData {
    src: string;
    dst: string;
    [key: string]: unknown;
}

/**
 * Options for creating an E2E test graph.
 */
export interface E2EGraphOptions {
    /** Nodes to add to the graph */
    nodes?: TestNodeData[];
    /** Edges to add to the graph */
    edges?: TestEdgeData[];
    /** Whether to enable AI control (default: true) */
    enableAi?: boolean;
    /** Container width in pixels (default: 800) */
    width?: number;
    /** Container height in pixels (default: 600) */
    height?: number;
}

/**
 * Result of creating an E2E test graph.
 */
export interface E2EGraphResult {
    /** The container DOM element */
    element: HTMLElement;
    /** The Graph instance */
    graph: Graph;
}

/**
 * Container element for e2e tests.
 */
let container: HTMLElement | null = null;

/**
 * Create a real Graph instance for E2E testing.
 * This creates an actual graph with full Babylon.js rendering.
 *
 * @param options - Configuration options for the test graph
 * @returns The element and graph instance
 *
 * @example
 * ```typescript
 * const {element, graph} = await createE2EGraph({
 *   nodes: [{id: "A"}, {id: "B"}],
 *   edges: [{src: "A", dst: "B"}],
 *   enableAi: true,
 * });
 *
 * // Use the graph for testing
 * const result = await graph.aiCommand("count nodes");
 *
 * // Clean up when done
 * cleanupE2EGraph();
 * ```
 */
export async function createE2EGraph(options: E2EGraphOptions = {}): Promise<E2EGraphResult> {
    const {
        nodes = [],
        edges = [],
        enableAi = true,
        width = 800,
        height = 600,
    } = options;

    // Clean up any previous test container
    if (container) {
        container.remove();
    }

    // Create a container element
    container = document.createElement("div");
    container.id = "test-container-e2e-ai";
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
    document.body.appendChild(container);

    // Create graph instance
    const graph = new Graph(container);

    // Initialize the graph
    await graph.init();

    // Set up a basic style template
    await graph.setStyleTemplate({
        graphtyTemplate: true,
        majorVersion: "1",
        graph: {
            twoD: false,
            background: {backgroundType: "color", color: "#F5F5F5"},
            addDefaultStyle: true,
            startingCameraDistance: 100,
            layout: "ngraph",
        },
        layers: [],
        data: {
            knownFields: {
                nodeIdPath: "id",
                nodeWeightPath: null,
                nodeTimePath: null,
                edgeSrcIdPath: "src",
                edgeDstIdPath: "dst",
                edgeWeightPath: null,
                edgeTimePath: null,
            },
        },
        behavior: {
            layout: {
                type: "ngraph",
                preSteps: 0,
                stepMultiplier: 1,
                minDelta: 0.001,
                zoomStepInterval: 5,
            },
            node: {
                pinOnDrag: true,
            },
        },
    });

    // Add nodes if provided
    if (nodes.length > 0) {
        await graph.addNodes(nodes);
    }

    // Add edges if provided
    if (edges.length > 0) {
        await graph.addEdges(edges);
    }

    // Enable AI control if requested
    if (enableAi) {
        await graph.enableAiControl({provider: "mock"});
    }

    return {element: container, graph};
}

/**
 * Clean up E2E test graph by removing elements from the DOM.
 * Call this in afterEach to ensure clean test state.
 */
export function cleanupE2EGraph(): void {
    if (container) {
        container.remove();
        container = null;
    }
}

/**
 * Default test nodes for quick setup.
 */
export const DEFAULT_TEST_NODES: TestNodeData[] = [
    {id: "A", label: "Node A", type: "server"},
    {id: "B", label: "Node B", type: "client"},
    {id: "C", label: "Node C", type: "server"},
    {id: "D", label: "Node D", type: "client"},
    {id: "E", label: "Node E", type: "router"},
];

/**
 * Default test edges for quick setup.
 */
export const DEFAULT_TEST_EDGES: TestEdgeData[] = [
    {src: "A", dst: "B"},
    {src: "A", dst: "C"},
    {src: "B", dst: "D"},
    {src: "C", dst: "E"},
    {src: "D", dst: "E"},
];

/**
 * Create an E2E graph with default test data.
 * Convenience function for common test scenarios.
 *
 * @returns The element and graph instance with default test data
 */
export async function createDefaultE2EGraph(): Promise<E2EGraphResult> {
    return createE2EGraph({
        nodes: DEFAULT_TEST_NODES,
        edges: DEFAULT_TEST_EDGES,
        enableAi: true,
    });
}
