/**
 * Position-based regression tests for arrowhead placement
 *
 * This test suite verifies that arrowheads are positioned correctly at the
 * destination node's surface for edges at various angles in both 2D and 3D modes.
 *
 * Key constants:
 * - DEFAULT_NODE_SIZE = 1
 * - ICOSPHERE_RADIUS_MULTIPLIER = 0.75 (node radius = 0.75)
 * - DEFAULT_ARROW_LENGTH = 0.5
 * - For "normal" arrows (positionOffset=0), tip is exactly at node surface
 */
import {Vector3} from "@babylonjs/core";
import {afterEach, assert, describe, test} from "vitest";

import {Graph} from "../../src/Graph";
import {arrowConfig, asData, styleTemplate, type TestGraph} from "../helpers/testSetup";

// Constants matching mesh calculations
const NODE_RADIUS = 0.75; // DEFAULT_NODE_SIZE * ICOSPHERE_RADIUS_MULTIPLIER
const ARROW_LENGTH = 0.5; // DEFAULT_ARROW_LENGTH
const POSITION_TOLERANCE = 0.1; // Allow some tolerance for floating point and ray intersection

/**
 * Calculate expected arrow position given source and destination nodes
 *
 * The arrow mesh is positioned so that the LINE ends at the arrow's back edge.
 * The surface point is at the node surface, and the arrow (length 0.5) is placed
 * such that the line can end at the back of the arrow.
 *
 * Arrow position = surfacePoint - direction * arrowLength
 * (This accounts for the arrow's geometry - the arrow mesh origin is at its back edge
 * or center depending on geometry, and the line ends at the arrow's back)
 */
function calculateExpectedArrowPosition(
    srcPos: Vector3,
    dstPos: Vector3,
): Vector3 {
    const direction = dstPos.subtract(srcPos).normalize();
    // Surface point at destination node
    const surfacePoint = dstPos.subtract(direction.scale(NODE_RADIUS));
    // Arrow is positioned back from surface by arrow length
    // (The actual calculation involves ray intersection which may differ slightly)
    return surfacePoint.subtract(direction.scale(ARROW_LENGTH));
}

/**
 * Wait for graph to fully render and update edges
 *
 * In browser tests, the Babylon.js render loop doesn't run automatically like in a real browser.
 * We need to manually update node positions from the layout engine and then update edges.
 */
async function waitForRender(graph: Graph): Promise<void> {
    await graph.operationQueue.waitForCompletion();

    // Access private members via TestGraph type for testing
    const testGraph = graph as unknown as TestGraph;

    // Manually update node mesh positions from layout engine
    // (In a real browser, this happens in the render loop via UpdateManager)
    for (const node of testGraph.dataManager.nodes.values()) {
        const pos = testGraph.layoutManager.layoutEngine?.getNodePosition(node);
        if (pos) {
            node.mesh.position.x = pos.x;
            node.mesh.position.y = pos.y;
            node.mesh.position.z = pos.z ?? 0;
        }
    }

    // Manually update edges (which calculates arrow positions)
    for (const edge of testGraph.dataManager.edges.values()) {
        edge.update();
    }

    // Small wait to ensure updates are processed
    await new Promise((resolve) => {
        setTimeout(resolve, 50);
    });
}

describe("Arrowhead Position Tests - 2D Mode", () => {
    let container: HTMLElement | undefined;
    let graph: Graph | undefined;

    afterEach(() => {
        if (graph) {
            graph.dispose();
        }

        if (container?.parentNode) {
            container.remove();
        }
    });

    /**
     * Helper to create a 2D graph with specified nodes and edges
     */
    async function create2DGraph(
        nodes: {id: string, x: number, y: number}[],
        edges: {source: string, target: string}[],
    ): Promise<Graph> {
        container = document.createElement("div");
        container.style.width = "800px";
        container.style.height = "600px";
        document.body.append(container);

        graph = new Graph(container);

        await graph.setStyleTemplate(styleTemplate({
            twoD: true,
            addDefaultStyle: true,
            layers: [
                {
                    edge: {
                        selector: "",
                        style: {
                            enabled: true,
                            arrowHead: arrowConfig({type: "normal"}),
                        },
                    },
                },
            ],
        }));

        await graph.operationQueue.waitForCompletion();

        // Set up fixed layout so nodes register with LayoutManager
        await graph.setLayout("fixed", {dim: 2});
        await graph.operationQueue.waitForCompletion();

        // Add nodes with position object for FixedLayout to read
        // FixedLayout reads from node.data.position.{x,y,z}
        for (const node of nodes) {
            await graph.addNode(asData({
                id: node.id,
                position: {x: node.x, y: node.y, z: 0},
            }));
        }

        // Add edges
        for (const edge of edges) {
            await graph.addEdge(
                asData({id: `${edge.source}:${edge.target}`, source: edge.source, target: edge.target}),
                "source",
                "target",
            );
        }

        await waitForRender(graph);
        return graph;
    }

    test("horizontal edge (0°) - arrow at correct position", async() => {
        await create2DGraph(
            [
                {id: "A", x: 0, y: 0},
                {id: "B", x: 3, y: 0},
            ],
            [{source: "A", target: "B"}],
        );

        const edge = (graph as unknown as TestGraph).dataManager.edges.get("A:B");
        assert(edge, "Edge should exist");
        assert(edge.arrowMesh, "Arrow mesh should exist");

        const srcPos = new Vector3(0, 0, 0);
        const dstPos = new Vector3(3, 0, 0);
        const expectedPos = calculateExpectedArrowPosition(srcPos, dstPos);
        const actualPos = edge.arrowMesh.position;

        const distance = Vector3.Distance(expectedPos, actualPos);
        assert(
            distance < POSITION_TOLERANCE,
            `Horizontal edge: Arrow position differs by ${distance.toFixed(4)} from expected. ` +
            `Expected: (${expectedPos.x.toFixed(3)}, ${expectedPos.y.toFixed(3)}, ${expectedPos.z.toFixed(3)}), ` +
            `Actual: (${actualPos.x.toFixed(3)}, ${actualPos.y.toFixed(3)}, ${actualPos.z.toFixed(3)})`,
        );
    });

    test("vertical edge (90°) - arrow at correct position", async() => {
        await create2DGraph(
            [
                {id: "A", x: 0, y: 0},
                {id: "B", x: 0, y: 3},
            ],
            [{source: "A", target: "B"}],
        );

        const edge = (graph as unknown as TestGraph).dataManager.edges.get("A:B");
        assert(edge, "Edge should exist");
        assert(edge.arrowMesh, "Arrow mesh should exist");

        const srcPos = new Vector3(0, 0, 0);
        const dstPos = new Vector3(0, 3, 0);
        const expectedPos = calculateExpectedArrowPosition(srcPos, dstPos);
        const actualPos = edge.arrowMesh.position;

        const distance = Vector3.Distance(expectedPos, actualPos);
        assert(
            distance < POSITION_TOLERANCE,
            `Vertical edge: Arrow position differs by ${distance.toFixed(4)} from expected. ` +
            `Expected: (${expectedPos.x.toFixed(3)}, ${expectedPos.y.toFixed(3)}, ${expectedPos.z.toFixed(3)}), ` +
            `Actual: (${actualPos.x.toFixed(3)}, ${actualPos.y.toFixed(3)}, ${actualPos.z.toFixed(3)})`,
        );
    });

    test("diagonal edge (45°) - arrow at correct position", async() => {
        await create2DGraph(
            [
                {id: "A", x: 0, y: 0},
                {id: "B", x: 3, y: 3},
            ],
            [{source: "A", target: "B"}],
        );

        const edge = (graph as unknown as TestGraph).dataManager.edges.get("A:B");
        assert(edge, "Edge should exist");
        assert(edge.arrowMesh, "Arrow mesh should exist");

        const srcPos = new Vector3(0, 0, 0);
        const dstPos = new Vector3(3, 3, 0);
        const expectedPos = calculateExpectedArrowPosition(srcPos, dstPos);
        const actualPos = edge.arrowMesh.position;

        const distance = Vector3.Distance(expectedPos, actualPos);
        assert(
            distance < POSITION_TOLERANCE,
            `Diagonal edge (45°): Arrow position differs by ${distance.toFixed(4)} from expected. ` +
            `Expected: (${expectedPos.x.toFixed(3)}, ${expectedPos.y.toFixed(3)}, ${expectedPos.z.toFixed(3)}), ` +
            `Actual: (${actualPos.x.toFixed(3)}, ${actualPos.y.toFixed(3)}, ${actualPos.z.toFixed(3)})`,
        );
    });

    test("reverse horizontal edge (180°) - arrow at correct position", async() => {
        await create2DGraph(
            [
                {id: "A", x: 3, y: 0},
                {id: "B", x: 0, y: 0},
            ],
            [{source: "A", target: "B"}],
        );

        const edge = (graph as unknown as TestGraph).dataManager.edges.get("A:B");
        assert(edge, "Edge should exist");
        assert(edge.arrowMesh, "Arrow mesh should exist");

        const srcPos = new Vector3(3, 0, 0);
        const dstPos = new Vector3(0, 0, 0);
        const expectedPos = calculateExpectedArrowPosition(srcPos, dstPos);
        const actualPos = edge.arrowMesh.position;

        const distance = Vector3.Distance(expectedPos, actualPos);
        assert(
            distance < POSITION_TOLERANCE,
            `Reverse horizontal edge: Arrow position differs by ${distance.toFixed(4)} from expected. ` +
            `Expected: (${expectedPos.x.toFixed(3)}, ${expectedPos.y.toFixed(3)}, ${expectedPos.z.toFixed(3)}), ` +
            `Actual: (${actualPos.x.toFixed(3)}, ${actualPos.y.toFixed(3)}, ${actualPos.z.toFixed(3)})`,
        );
    });

    test("downward diagonal edge (-45°) - arrow at correct position", async() => {
        await create2DGraph(
            [
                {id: "A", x: 0, y: 3},
                {id: "B", x: 3, y: 0},
            ],
            [{source: "A", target: "B"}],
        );

        const edge = (graph as unknown as TestGraph).dataManager.edges.get("A:B");
        assert(edge, "Edge should exist");
        assert(edge.arrowMesh, "Arrow mesh should exist");

        const srcPos = new Vector3(0, 3, 0);
        const dstPos = new Vector3(3, 0, 0);
        const expectedPos = calculateExpectedArrowPosition(srcPos, dstPos);
        const actualPos = edge.arrowMesh.position;

        const distance = Vector3.Distance(expectedPos, actualPos);
        assert(
            distance < POSITION_TOLERANCE,
            `Downward diagonal edge: Arrow position differs by ${distance.toFixed(4)} from expected. ` +
            `Expected: (${expectedPos.x.toFixed(3)}, ${expectedPos.y.toFixed(3)}, ${expectedPos.z.toFixed(3)}), ` +
            `Actual: (${actualPos.x.toFixed(3)}, ${actualPos.y.toFixed(3)}, ${actualPos.z.toFixed(3)})`,
        );
    });

    test("pentagon graph - all arrows at correct positions", async() => {
        // Create pentagon vertices
        const pentagonNodes = [
            {id: "A", x: 0, y: 3}, // top
            {id: "B", x: 2.85, y: 0.93}, // top-right
            {id: "C", x: 1.76, y: -2.43}, // bottom-right
            {id: "D", x: -1.76, y: -2.43}, // bottom-left
            {id: "E", x: -2.85, y: 0.93}, // top-left
        ];

        const pentagonEdges = [
            {source: "A", target: "B"},
            {source: "B", target: "C"},
            {source: "C", target: "D"},
            {source: "D", target: "E"},
            {source: "E", target: "A"},
        ];

        await create2DGraph(pentagonNodes, pentagonEdges);

        // Verify each edge's arrow position
        for (const edgeDef of pentagonEdges) {
            const edgeId = `${edgeDef.source}:${edgeDef.target}`;
            const edge = (graph as unknown as TestGraph).dataManager.edges.get(edgeId);
            assert(edge, `Edge ${edgeId} should exist`);
            assert(edge.arrowMesh, `Edge ${edgeId} should have arrow mesh`);

            const srcNode = pentagonNodes.find((n) => n.id === edgeDef.source);
            const dstNode = pentagonNodes.find((n) => n.id === edgeDef.target);
            assert(srcNode, `Source node ${edgeDef.source} should exist`);
            assert(dstNode, `Target node ${edgeDef.target} should exist`);

            const srcPos = new Vector3(srcNode.x, srcNode.y, 0);
            const dstPos = new Vector3(dstNode.x, dstNode.y, 0);
            const expectedPos = calculateExpectedArrowPosition(srcPos, dstPos);
            const actualPos = edge.arrowMesh.position;

            const distance = Vector3.Distance(expectedPos, actualPos);
            assert(
                distance < POSITION_TOLERANCE,
                `Pentagon edge ${edgeId}: Arrow position differs by ${distance.toFixed(4)} from expected. ` +
                `Expected: (${expectedPos.x.toFixed(3)}, ${expectedPos.y.toFixed(3)}, ${expectedPos.z.toFixed(3)}), ` +
                `Actual: (${actualPos.x.toFixed(3)}, ${actualPos.y.toFixed(3)}, ${actualPos.z.toFixed(3)})`,
            );
        }
    });

    test("all arrows in XY plane (Z=0 for 2D)", async() => {
        const nodes = [
            {id: "A", x: 0, y: 0},
            {id: "B", x: 3, y: 0},
            {id: "C", x: 0, y: 3},
            {id: "D", x: 3, y: 3},
        ];

        const edges = [
            {source: "A", target: "B"},
            {source: "A", target: "C"},
            {source: "A", target: "D"},
            {source: "B", target: "D"},
        ];

        await create2DGraph(nodes, edges);

        const zTolerance = 0.001;
        for (const edgeDef of edges) {
            const edgeId = `${edgeDef.source}:${edgeDef.target}`;
            const edge = (graph as unknown as TestGraph).dataManager.edges.get(edgeId);
            assert(edge, `Edge ${edgeId} should exist`);
            assert(edge.arrowMesh, `Edge ${edgeId} should have arrow mesh`);

            assert(
                Math.abs(edge.arrowMesh.position.z) < zTolerance,
                `Edge ${edgeId}: Arrow Z position should be 0 in 2D mode, got ${edge.arrowMesh.position.z.toFixed(6)}`,
            );
        }
    });
});

describe("Arrowhead Position Tests - 3D Mode", () => {
    let container: HTMLElement | undefined;
    let graph: Graph | undefined;

    afterEach(() => {
        if (graph) {
            graph.dispose();
        }

        if (container?.parentNode) {
            container.remove();
        }
    });

    /**
     * Helper to create a 3D graph with specified nodes and edges
     */
    async function create3DGraph(
        nodes: {id: string, x: number, y: number, z: number}[],
        edges: {source: string, target: string}[],
    ): Promise<Graph> {
        container = document.createElement("div");
        container.style.width = "800px";
        container.style.height = "600px";
        document.body.append(container);

        graph = new Graph(container);

        await graph.setStyleTemplate(styleTemplate({
            twoD: false,
            addDefaultStyle: true,
            layers: [
                {
                    edge: {
                        selector: "",
                        style: {
                            enabled: true,
                            arrowHead: arrowConfig({type: "normal"}),
                        },
                    },
                },
            ],
        }));

        await graph.operationQueue.waitForCompletion();

        // Set up fixed layout so nodes register with LayoutManager
        await graph.setLayout("fixed", {dim: 3});
        await graph.operationQueue.waitForCompletion();

        // Add nodes with position object for FixedLayout to read
        for (const node of nodes) {
            await graph.addNode(asData({
                id: node.id,
                position: {x: node.x, y: node.y, z: node.z},
            }));
        }

        // Add edges
        for (const edge of edges) {
            await graph.addEdge(
                asData({id: `${edge.source}:${edge.target}`, source: edge.source, target: edge.target}),
                "source",
                "target",
            );
        }

        await waitForRender(graph);
        return graph;
    }

    test("edge along X axis - arrow at correct position", async() => {
        await create3DGraph(
            [
                {id: "A", x: 0, y: 0, z: 0},
                {id: "B", x: 3, y: 0, z: 0},
            ],
            [{source: "A", target: "B"}],
        );

        const edge = (graph as unknown as TestGraph).dataManager.edges.get("A:B");
        assert(edge, "Edge should exist");
        assert(edge.arrowMesh, "Arrow mesh should exist");

        const srcPos = new Vector3(0, 0, 0);
        const dstPos = new Vector3(3, 0, 0);
        const expectedPos = calculateExpectedArrowPosition(srcPos, dstPos);
        const actualPos = edge.arrowMesh.position;

        const distance = Vector3.Distance(expectedPos, actualPos);
        assert(
            distance < POSITION_TOLERANCE,
            `X-axis edge: Arrow position differs by ${distance.toFixed(4)} from expected. ` +
            `Expected: (${expectedPos.x.toFixed(3)}, ${expectedPos.y.toFixed(3)}, ${expectedPos.z.toFixed(3)}), ` +
            `Actual: (${actualPos.x.toFixed(3)}, ${actualPos.y.toFixed(3)}, ${actualPos.z.toFixed(3)})`,
        );
    });

    test("edge along Y axis - arrow at correct position", async() => {
        await create3DGraph(
            [
                {id: "A", x: 0, y: 0, z: 0},
                {id: "B", x: 0, y: 3, z: 0},
            ],
            [{source: "A", target: "B"}],
        );

        const edge = (graph as unknown as TestGraph).dataManager.edges.get("A:B");
        assert(edge, "Edge should exist");
        assert(edge.arrowMesh, "Arrow mesh should exist");

        const srcPos = new Vector3(0, 0, 0);
        const dstPos = new Vector3(0, 3, 0);
        const expectedPos = calculateExpectedArrowPosition(srcPos, dstPos);
        const actualPos = edge.arrowMesh.position;

        const distance = Vector3.Distance(expectedPos, actualPos);
        assert(
            distance < POSITION_TOLERANCE,
            `Y-axis edge: Arrow position differs by ${distance.toFixed(4)} from expected. ` +
            `Expected: (${expectedPos.x.toFixed(3)}, ${expectedPos.y.toFixed(3)}, ${expectedPos.z.toFixed(3)}), ` +
            `Actual: (${actualPos.x.toFixed(3)}, ${actualPos.y.toFixed(3)}, ${actualPos.z.toFixed(3)})`,
        );
    });

    test("edge along Z axis - arrow at correct position", async() => {
        await create3DGraph(
            [
                {id: "A", x: 0, y: 0, z: 0},
                {id: "B", x: 0, y: 0, z: 3},
            ],
            [{source: "A", target: "B"}],
        );

        const edge = (graph as unknown as TestGraph).dataManager.edges.get("A:B");
        assert(edge, "Edge should exist");
        assert(edge.arrowMesh, "Arrow mesh should exist");

        const srcPos = new Vector3(0, 0, 0);
        const dstPos = new Vector3(0, 0, 3);
        const expectedPos = calculateExpectedArrowPosition(srcPos, dstPos);
        const actualPos = edge.arrowMesh.position;

        const distance = Vector3.Distance(expectedPos, actualPos);
        assert(
            distance < POSITION_TOLERANCE,
            `Z-axis edge: Arrow position differs by ${distance.toFixed(4)} from expected. ` +
            `Expected: (${expectedPos.x.toFixed(3)}, ${expectedPos.y.toFixed(3)}, ${expectedPos.z.toFixed(3)}), ` +
            `Actual: (${actualPos.x.toFixed(3)}, ${actualPos.y.toFixed(3)}, ${actualPos.z.toFixed(3)})`,
        );
    });

    test("3D diagonal edge - arrow at correct position", async() => {
        await create3DGraph(
            [
                {id: "A", x: 0, y: 0, z: 0},
                {id: "B", x: 2, y: 2, z: 2},
            ],
            [{source: "A", target: "B"}],
        );

        const edge = (graph as unknown as TestGraph).dataManager.edges.get("A:B");
        assert(edge, "Edge should exist");
        assert(edge.arrowMesh, "Arrow mesh should exist");

        const srcPos = new Vector3(0, 0, 0);
        const dstPos = new Vector3(2, 2, 2);
        const expectedPos = calculateExpectedArrowPosition(srcPos, dstPos);
        const actualPos = edge.arrowMesh.position;

        const distance = Vector3.Distance(expectedPos, actualPos);
        assert(
            distance < POSITION_TOLERANCE,
            `3D diagonal edge: Arrow position differs by ${distance.toFixed(4)} from expected. ` +
            `Expected: (${expectedPos.x.toFixed(3)}, ${expectedPos.y.toFixed(3)}, ${expectedPos.z.toFixed(3)}), ` +
            `Actual: (${actualPos.x.toFixed(3)}, ${actualPos.y.toFixed(3)}, ${actualPos.z.toFixed(3)})`,
        );
    });

    test("tetrahedron graph - all arrows at correct positions", async() => {
        // Create tetrahedron vertices
        const tetraNodes = [
            {id: "A", x: 1, y: 1, z: 1},
            {id: "B", x: 1, y: -1, z: -1},
            {id: "C", x: -1, y: 1, z: -1},
            {id: "D", x: -1, y: -1, z: 1},
        ];

        // All edges of tetrahedron
        const tetraEdges = [
            {source: "A", target: "B"},
            {source: "A", target: "C"},
            {source: "A", target: "D"},
            {source: "B", target: "C"},
            {source: "B", target: "D"},
            {source: "C", target: "D"},
        ];

        await create3DGraph(tetraNodes, tetraEdges);

        // Verify each edge's arrow position
        for (const edgeDef of tetraEdges) {
            const edgeId = `${edgeDef.source}:${edgeDef.target}`;
            const edge = (graph as unknown as TestGraph).dataManager.edges.get(edgeId);
            assert(edge, `Edge ${edgeId} should exist`);
            assert(edge.arrowMesh, `Edge ${edgeId} should have arrow mesh`);

            const srcNode = tetraNodes.find((n) => n.id === edgeDef.source);
            const dstNode = tetraNodes.find((n) => n.id === edgeDef.target);
            assert(srcNode, `Source node ${edgeDef.source} should exist`);
            assert(dstNode, `Target node ${edgeDef.target} should exist`);

            const srcPos = new Vector3(srcNode.x, srcNode.y, srcNode.z);
            const dstPos = new Vector3(dstNode.x, dstNode.y, dstNode.z);
            const expectedPos = calculateExpectedArrowPosition(srcPos, dstPos);
            const actualPos = edge.arrowMesh.position;

            const distance = Vector3.Distance(expectedPos, actualPos);
            assert(
                distance < POSITION_TOLERANCE,
                `Tetrahedron edge ${edgeId}: Arrow position differs by ${distance.toFixed(4)} from expected. ` +
                `Expected: (${expectedPos.x.toFixed(3)}, ${expectedPos.y.toFixed(3)}, ${expectedPos.z.toFixed(3)}), ` +
                `Actual: (${actualPos.x.toFixed(3)}, ${actualPos.y.toFixed(3)}, ${actualPos.z.toFixed(3)})`,
            );
        }
    });

    test("negative coordinate edges - arrows at correct positions", async() => {
        await create3DGraph(
            [
                {id: "A", x: -2, y: -2, z: -2},
                {id: "B", x: 2, y: 2, z: 2},
                {id: "C", x: -2, y: 2, z: 0},
            ],
            [
                {source: "A", target: "B"},
                {source: "A", target: "C"},
                {source: "B", target: "C"},
            ],
        );

        const testCases = [
            {src: "A", dst: "B", srcPos: new Vector3(-2, -2, -2), dstPos: new Vector3(2, 2, 2)},
            {src: "A", dst: "C", srcPos: new Vector3(-2, -2, -2), dstPos: new Vector3(-2, 2, 0)},
            {src: "B", dst: "C", srcPos: new Vector3(2, 2, 2), dstPos: new Vector3(-2, 2, 0)},
        ];

        for (const tc of testCases) {
            const edgeId = `${tc.src}:${tc.dst}`;
            const edge = (graph as unknown as TestGraph).dataManager.edges.get(edgeId);
            assert(edge, `Edge ${edgeId} should exist`);
            assert(edge.arrowMesh, `Edge ${edgeId} should have arrow mesh`);

            const expectedPos = calculateExpectedArrowPosition(tc.srcPos, tc.dstPos);
            const actualPos = edge.arrowMesh.position;

            const distance = Vector3.Distance(expectedPos, actualPos);
            assert(
                distance < POSITION_TOLERANCE,
                `Edge ${edgeId}: Arrow position differs by ${distance.toFixed(4)} from expected. ` +
                `Expected: (${expectedPos.x.toFixed(3)}, ${expectedPos.y.toFixed(3)}, ${expectedPos.z.toFixed(3)}), ` +
                `Actual: (${actualPos.x.toFixed(3)}, ${actualPos.y.toFixed(3)}, ${actualPos.z.toFixed(3)})`,
            );
        }
    });

    test("cube graph with all face diagonals - arrows at correct positions", async() => {
        // Cube vertices
        const cubeNodes = [
            {id: "A", x: 0, y: 0, z: 0},
            {id: "B", x: 2, y: 0, z: 0},
            {id: "C", x: 2, y: 2, z: 0},
            {id: "D", x: 0, y: 2, z: 0},
            {id: "E", x: 0, y: 0, z: 2},
            {id: "F", x: 2, y: 0, z: 2},
            {id: "G", x: 2, y: 2, z: 2},
            {id: "H", x: 0, y: 2, z: 2},
        ];

        // Cube edges (12 edges)
        const cubeEdges = [
            // Bottom face
            {source: "A", target: "B"},
            {source: "B", target: "C"},
            {source: "C", target: "D"},
            {source: "D", target: "A"},
            // Top face
            {source: "E", target: "F"},
            {source: "F", target: "G"},
            {source: "G", target: "H"},
            {source: "H", target: "E"},
            // Vertical edges
            {source: "A", target: "E"},
            {source: "B", target: "F"},
            {source: "C", target: "G"},
            {source: "D", target: "H"},
        ];

        await create3DGraph(cubeNodes, cubeEdges);

        // Verify each edge's arrow position
        for (const edgeDef of cubeEdges) {
            const edgeId = `${edgeDef.source}:${edgeDef.target}`;
            const edge = (graph as unknown as TestGraph).dataManager.edges.get(edgeId);
            assert(edge, `Edge ${edgeId} should exist`);
            assert(edge.arrowMesh, `Edge ${edgeId} should have arrow mesh`);

            const srcNode = cubeNodes.find((n) => n.id === edgeDef.source);
            const dstNode = cubeNodes.find((n) => n.id === edgeDef.target);
            assert(srcNode, `Source node ${edgeDef.source} should exist`);
            assert(dstNode, `Target node ${edgeDef.target} should exist`);

            const srcPos = new Vector3(srcNode.x, srcNode.y, srcNode.z);
            const dstPos = new Vector3(dstNode.x, dstNode.y, dstNode.z);
            const expectedPos = calculateExpectedArrowPosition(srcPos, dstPos);
            const actualPos = edge.arrowMesh.position;

            const distance = Vector3.Distance(expectedPos, actualPos);
            assert(
                distance < POSITION_TOLERANCE,
                `Cube edge ${edgeId}: Arrow position differs by ${distance.toFixed(4)} from expected. ` +
                `Expected: (${expectedPos.x.toFixed(3)}, ${expectedPos.y.toFixed(3)}, ${expectedPos.z.toFixed(3)}), ` +
                `Actual: (${actualPos.x.toFixed(3)}, ${actualPos.y.toFixed(3)}, ${actualPos.z.toFixed(3)})`,
            );
        }
    });
});

describe("Arrow Position Edge Cases", () => {
    let container: HTMLElement | undefined;
    let graph: Graph | undefined;

    afterEach(() => {
        if (graph) {
            graph.dispose();
        }

        if (container?.parentNode) {
            container.remove();
        }
    });

    async function createGraph(
        twoD: boolean,
        nodes: {id: string, x: number, y: number, z: number}[],
        edges: {source: string, target: string}[],
    ): Promise<Graph> {
        container = document.createElement("div");
        container.style.width = "800px";
        container.style.height = "600px";
        document.body.append(container);

        graph = new Graph(container);

        await graph.setStyleTemplate(styleTemplate({
            twoD,
            addDefaultStyle: true,
            layers: [
                {
                    edge: {
                        selector: "",
                        style: {
                            enabled: true,
                            arrowHead: arrowConfig({type: "normal"}),
                        },
                    },
                },
            ],
        }));

        await graph.operationQueue.waitForCompletion();

        // Set up fixed layout so nodes register with LayoutManager
        await graph.setLayout("fixed", {dim: twoD ? 2 : 3});
        await graph.operationQueue.waitForCompletion();

        // Add nodes with position object for FixedLayout to read
        for (const node of nodes) {
            await graph.addNode(asData({
                id: node.id,
                position: {x: node.x, y: node.y, z: node.z},
            }));
        }

        for (const edge of edges) {
            await graph.addEdge(
                asData({id: `${edge.source}:${edge.target}`, source: edge.source, target: edge.target}),
                "source",
                "target",
            );
        }

        await waitForRender(graph);
        return graph;
    }

    test("very short edge - arrow still positioned correctly", async() => {
        // Edge length just over 2 * node radius (1.5) to ensure nodes don't overlap
        const shortDistance = 2;
        await createGraph(
            false,
            [
                {id: "A", x: 0, y: 0, z: 0},
                {id: "B", x: shortDistance, y: 0, z: 0},
            ],
            [{source: "A", target: "B"}],
        );

        const edge = (graph as unknown as TestGraph).dataManager.edges.get("A:B");
        assert(edge, "Edge should exist");
        assert(edge.arrowMesh, "Arrow mesh should exist");

        const srcPos = new Vector3(0, 0, 0);
        const dstPos = new Vector3(shortDistance, 0, 0);
        const expectedPos = calculateExpectedArrowPosition(srcPos, dstPos);
        const actualPos = edge.arrowMesh.position;

        const distance = Vector3.Distance(expectedPos, actualPos);
        assert(
            distance < POSITION_TOLERANCE,
            `Short edge: Arrow position differs by ${distance.toFixed(4)} from expected. ` +
            `Expected: (${expectedPos.x.toFixed(3)}, ${expectedPos.y.toFixed(3)}, ${expectedPos.z.toFixed(3)}), ` +
            `Actual: (${actualPos.x.toFixed(3)}, ${actualPos.y.toFixed(3)}, ${actualPos.z.toFixed(3)})`,
        );
    });

    test("very long edge - arrow still positioned correctly", async() => {
        const longDistance = 100;
        await createGraph(
            false,
            [
                {id: "A", x: 0, y: 0, z: 0},
                {id: "B", x: longDistance, y: 0, z: 0},
            ],
            [{source: "A", target: "B"}],
        );

        const edge = (graph as unknown as TestGraph).dataManager.edges.get("A:B");
        assert(edge, "Edge should exist");
        assert(edge.arrowMesh, "Arrow mesh should exist");

        const srcPos = new Vector3(0, 0, 0);
        const dstPos = new Vector3(longDistance, 0, 0);
        const expectedPos = calculateExpectedArrowPosition(srcPos, dstPos);
        const actualPos = edge.arrowMesh.position;

        const distance = Vector3.Distance(expectedPos, actualPos);
        assert(
            distance < POSITION_TOLERANCE,
            `Long edge: Arrow position differs by ${distance.toFixed(4)} from expected. ` +
            `Expected: (${expectedPos.x.toFixed(3)}, ${expectedPos.y.toFixed(3)}, ${expectedPos.z.toFixed(3)}), ` +
            `Actual: (${actualPos.x.toFixed(3)}, ${actualPos.y.toFixed(3)}, ${actualPos.z.toFixed(3)})`,
        );
    });

    test("nodes at same X,Y with different Z - arrow correct (3D only)", async() => {
        await createGraph(
            false,
            [
                {id: "A", x: 0, y: 0, z: 0},
                {id: "B", x: 0, y: 0, z: 3},
            ],
            [{source: "A", target: "B"}],
        );

        const edge = (graph as unknown as TestGraph).dataManager.edges.get("A:B");
        assert(edge, "Edge should exist");
        assert(edge.arrowMesh, "Arrow mesh should exist");

        const srcPos = new Vector3(0, 0, 0);
        const dstPos = new Vector3(0, 0, 3);
        const expectedPos = calculateExpectedArrowPosition(srcPos, dstPos);
        const actualPos = edge.arrowMesh.position;

        // For pure Z-axis edges, arrow should be at Z = 3 - NODE_RADIUS
        assert(
            Math.abs(actualPos.z - expectedPos.z) < POSITION_TOLERANCE,
            `Z-only edge: Arrow Z position differs from expected. Expected Z=${expectedPos.z.toFixed(3)}, Actual Z=${actualPos.z.toFixed(3)}`,
        );
    });
});
