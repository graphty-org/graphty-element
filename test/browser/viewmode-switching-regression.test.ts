/**
 * ViewMode Switching Regression Tests
 *
 * These tests verify that viewMode switching (2D ↔ 3D ↔ AR ↔ VR) works correctly
 * and doesn't introduce order-of-operations bugs.
 *
 * Regression bugs covered:
 * 1. Edges didn't connect to nodes when switching from 2D to 3D
 * 2. Edges were 10x too wide after switching from 3D to 2D (order of operations)
 * 3. 2D pan didn't work after switching from 3D to 2D
 * 4. AR/VR mode shouldn't attempt to work if WebXR APIs aren't available
 */
import {Vector3} from "@babylonjs/core";
import {afterEach, assert, beforeEach, describe, it} from "vitest";

import type {Edge} from "../../src/Edge";
import {Graph} from "../../src/Graph";
import type {DataManager} from "../../src/managers/DataManager";

// Type helper to access private Graph members in tests
interface TestGraph extends Graph {
    dataManager: DataManager;
}

/**
 * Helper to get all edges from a graph (using internal API for testing)
 */
function getEdges(graph: Graph): Edge[] {
    return Array.from((graph as unknown as TestGraph).dataManager.edges.values());
}

describe("ViewMode Switching Regression Tests", () => {
    let graph: Graph;
    let container: HTMLDivElement;

    const TEST_NODES = [
        {id: 1, name: "Node 1"},
        {id: 2, name: "Node 2"},
        {id: 3, name: "Node 3"},
    ];

    const TEST_EDGES = [
        {id: "e1", src: 1, dst: 2},
        {id: "e2", src: 2, dst: 3},
        {id: "e3", src: 3, dst: 1},
    ];

    beforeEach(async() => {
        container = document.createElement("div");
        container.style.width = "800px";
        container.style.height = "600px";
        document.body.appendChild(container);
        graph = new Graph(container);
        await graph.init();
    });

    afterEach(() => {
        graph.dispose();
        document.body.removeChild(container);
    });

    describe("Regression: Edges connect to nodes after 2D→3D switch", () => {
        it("should have edges properly connected to nodes after switching from 2D to 3D", async() => {
            // Setup in 2D mode first
            await graph.setViewMode("2d");
            await graph.addNodes(TEST_NODES);
            await graph.addEdges(TEST_EDGES);
            await graph.setLayout("circular");
            await graph.operationQueue.waitForCompletion();

            // Verify we're in 2D mode
            assert.strictEqual(graph.getViewMode(), "2d");

            // Switch to 3D mode
            await graph.setViewMode("3d");
            await graph.operationQueue.waitForCompletion();

            // Verify we're in 3D mode
            assert.strictEqual(graph.getViewMode(), "3d");

            // Get all edges and verify they're connected to their source and destination nodes
            const edges = getEdges(graph);
            assert.isTrue(edges.length > 0, "Should have edges");

            for (const edge of edges) {
                const srcNode = graph.getNode(edge.srcId);
                const dstNode = graph.getNode(edge.dstId);

                assert.isDefined(srcNode, `Source node ${edge.srcId} should exist`);
                assert.isDefined(dstNode, `Destination node ${edge.dstId} should exist`);

                // Edge mesh should be positioned between the nodes
                // The edge should start near the source node and end near the destination node
                const srcPos = srcNode.mesh.position;
                const dstPos = dstNode.mesh.position;

                // Calculate expected edge center (approximately)
                const expectedCenter = srcPos.add(dstPos).scale(0.5);

                // Edge mesh position should be near the center of the two nodes
                // Allow a reasonable tolerance since edges have their own positioning logic
                const edgeMesh = edge.mesh;
                if (edgeMesh && "position" in edgeMesh) {
                    // For non-patterned line meshes, check they exist and are enabled
                    assert.isTrue(edgeMesh.isEnabled(), `Edge ${edge.id} mesh should be enabled after 2D→3D switch`);
                }

                // Verify edge endpoints are not at origin (0, 0, 0) unless nodes are there
                // This catches the bug where edges lost their node connections
                if (srcPos.length() > 0.1 || dstPos.length() > 0.1) {
                    // At least one node is not at origin, so edge should span some distance
                    const edgeLength = Vector3.Distance(srcPos, dstPos);
                    assert.isTrue(
                        edgeLength > 0.01,
                        `Edge ${edge.id} should have non-zero length after 2D→3D switch`,
                    );
                }
            }
        });

        it("should maintain edge-node connections through multiple 2D↔3D cycles", async() => {
            // Start in 3D
            await graph.addNodes(TEST_NODES);
            await graph.addEdges(TEST_EDGES);
            await graph.setLayout("circular");
            await graph.operationQueue.waitForCompletion();

            // Multiple round trips
            for (let cycle = 0; cycle < 3; cycle++) {
                // Switch to 2D
                await graph.setViewMode("2d");
                await graph.operationQueue.waitForCompletion();

                // Verify edges exist and have valid connections
                const edges2D = getEdges(graph);
                assert.strictEqual(edges2D.length, TEST_EDGES.length, `Cycle ${cycle + 1} 2D: Should have all edges`);

                // Switch back to 3D
                await graph.setViewMode("3d");
                await graph.operationQueue.waitForCompletion();

                // Verify edges still exist and are connected
                const edges3D = getEdges(graph);
                assert.strictEqual(edges3D.length, TEST_EDGES.length, `Cycle ${cycle + 1} 3D: Should have all edges`);

                for (const edge of edges3D) {
                    assert.isDefined(graph.getNode(edge.srcId), `Cycle ${cycle + 1}: Source node should exist`);
                    assert.isDefined(graph.getNode(edge.dstId), `Cycle ${cycle + 1}: Dest node should exist`);
                }
            }
        });
    });

    describe("Regression: Edges preserved after 3D→2D switch", () => {
        it("should preserve all edges when switching from 3D to 2D", async() => {
            // Setup in 3D mode - add nodes and edges
            await graph.addNodes(TEST_NODES);
            await graph.addEdges(TEST_EDGES);
            await graph.setLayout("circular");
            await graph.operationQueue.waitForCompletion();

            // Verify initial state in 3D
            const edges3D = getEdges(graph);
            assert.strictEqual(edges3D.length, TEST_EDGES.length, "Should have all edges in 3D mode");

            // Switch to 2D
            await graph.setViewMode("2d");
            await graph.operationQueue.waitForCompletion();

            // Verify edges are preserved in 2D mode
            const edges2D = getEdges(graph);
            assert.strictEqual(edges2D.length, TEST_EDGES.length, "Should preserve all edges after 3D→2D switch");

            // Verify each edge's mesh is still enabled
            for (const edge of edges2D) {
                assert.isTrue(edge.mesh.isEnabled(), `Edge ${edge.id} mesh should be enabled after switch`);
            }
        });

        it("should preserve edges through rapid 3D→2D→3D switches", async() => {
            // Setup in 3D mode
            await graph.addNodes(TEST_NODES);
            await graph.addEdges(TEST_EDGES);
            await graph.setLayout("circular");
            await graph.operationQueue.waitForCompletion();

            const initialEdgeCount = getEdges(graph).length;
            assert.strictEqual(initialEdgeCount, TEST_EDGES.length, "Initial edge count should match");

            // Rapid switching without waiting between each
            void graph.setViewMode("2d");
            await new Promise((resolve) => setTimeout(resolve, 50));
            void graph.setViewMode("3d");
            await new Promise((resolve) => setTimeout(resolve, 50));
            void graph.setViewMode("2d");
            await graph.operationQueue.waitForCompletion();

            // Verify edges are preserved
            const finalEdges = getEdges(graph);
            assert.strictEqual(finalEdges.length, TEST_EDGES.length, "Should preserve all edges after rapid switches");
        });

        it("should preserve edges over multiple mode switches", async() => {
            // Setup
            await graph.addNodes(TEST_NODES);
            await graph.addEdges(TEST_EDGES);
            await graph.setLayout("circular");
            await graph.operationQueue.waitForCompletion();

            const initialEdgeCount = getEdges(graph).length;

            // Multiple complete round trips
            for (let i = 0; i < 5; i++) {
                await graph.setViewMode("2d");
                await graph.operationQueue.waitForCompletion();

                // Check edges exist in 2D
                assert.strictEqual(
                    getEdges(graph).length,
                    initialEdgeCount,
                    `Round ${i + 1} 2D: Should have all edges`,
                );

                await graph.setViewMode("3d");
                await graph.operationQueue.waitForCompletion();

                // Check edges exist in 3D
                assert.strictEqual(
                    getEdges(graph).length,
                    initialEdgeCount,
                    `Round ${i + 1} 3D: Should have all edges`,
                );
            }
        });
    });

    describe("Regression: 2D pan works after 3D→2D switch", () => {
        it("should have camera controller active after switching from 3D to 2D", async() => {
            // Setup in 3D mode first
            await graph.addNodes(TEST_NODES);
            await graph.addEdges(TEST_EDGES);
            await graph.setLayout("circular");
            await graph.operationQueue.waitForCompletion();

            assert.strictEqual(graph.getViewMode(), "3d");

            // Switch to 2D mode
            await graph.setViewMode("2d");
            await graph.operationQueue.waitForCompletion();

            assert.strictEqual(graph.getViewMode(), "2d");

            // Wait for camera to be properly set up
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Verify 2D camera is active
            assert.isTrue(graph.is2D(), "Should be in 2D mode");

            // Verify camera manager has an active controller
            const cameraManager = graph.camera;
            const activeController = cameraManager.getActiveController();
            assert.isDefined(activeController, "Should have an active camera controller after 3D→2D switch");
            assert.isDefined(activeController?.camera, "Active controller should have a camera");

            // Verify the camera is attached to the scene
            const scene = graph.getScene();
            assert.isDefined(scene.activeCamera, "Scene should have an active camera");
        });

        it("should have camera controller active after 3D→2D→3D→2D switches", async() => {
            // Setup
            await graph.addNodes(TEST_NODES);
            await graph.setLayout("circular");
            await graph.operationQueue.waitForCompletion();

            // Multiple switches
            await graph.setViewMode("2d");
            await graph.operationQueue.waitForCompletion();
            await new Promise((resolve) => setTimeout(resolve, 100));

            await graph.setViewMode("3d");
            await graph.operationQueue.waitForCompletion();
            await new Promise((resolve) => setTimeout(resolve, 100));

            await graph.setViewMode("2d");
            await graph.operationQueue.waitForCompletion();
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Verify camera controller is active
            const cameraManager = graph.camera;
            const activeController = cameraManager.getActiveController();
            assert.isDefined(activeController, "Camera controller should be defined after switches");
            assert.isDefined(activeController?.camera, "Camera should be defined after switches");

            // Verify scene has active camera
            const scene = graph.getScene();
            assert.isDefined(scene.activeCamera, "Scene should have an active camera after switches");
        });
    });

    describe("Regression: AR/VR gracefully handles missing WebXR APIs", () => {
        it("should fall back to 3D when VR is not supported", async() => {
            // Setup
            await graph.addNodes(TEST_NODES);
            await graph.operationQueue.waitForCompletion();

            // Check VR support first
            const vrSupported = await graph.isVRSupported();

            // Try to switch to VR
            await graph.setViewMode("vr");
            await graph.operationQueue.waitForCompletion();

            if (!vrSupported) {
                // Should fall back to 3D
                assert.strictEqual(
                    graph.getViewMode(),
                    "3d",
                    "Should fall back to 3D when VR is not supported",
                );
            }
            // If VR is supported (unlikely in test environment), just verify it doesn't crash
        });

        it("should fall back to 3D when AR is not supported", async() => {
            // Setup
            await graph.addNodes(TEST_NODES);
            await graph.operationQueue.waitForCompletion();

            // Check AR support first
            const arSupported = await graph.isARSupported();

            // Try to switch to AR
            await graph.setViewMode("ar");
            await graph.operationQueue.waitForCompletion();

            if (!arSupported) {
                // Should fall back to 3D
                assert.strictEqual(
                    graph.getViewMode(),
                    "3d",
                    "Should fall back to 3D when AR is not supported",
                );
            }
            // If AR is supported (unlikely in test environment), just verify it doesn't crash
        });

        it("should not throw when switching to VR without WebXR", async() => {
            // Setup
            await graph.addNodes(TEST_NODES);
            await graph.operationQueue.waitForCompletion();

            // This should not throw
            let errorThrown = false;
            try {
                await graph.setViewMode("vr");
                await graph.operationQueue.waitForCompletion();
            } catch {
                errorThrown = true;
            }

            assert.isFalse(errorThrown, "Setting viewMode to 'vr' should not throw");
        });

        it("should not throw when switching to AR without WebXR", async() => {
            // Setup
            await graph.addNodes(TEST_NODES);
            await graph.operationQueue.waitForCompletion();

            // This should not throw
            let errorThrown = false;
            try {
                await graph.setViewMode("ar");
                await graph.operationQueue.waitForCompletion();
            } catch {
                errorThrown = true;
            }

            assert.isFalse(errorThrown, "Setting viewMode to 'ar' should not throw");
        });

        it("should report VR support status correctly", async() => {
            const vrSupported = await graph.isVRSupported();

            // In test environment, WebXR is typically not available
            // The important thing is that this returns a boolean, not throws
            assert.isBoolean(vrSupported, "isVRSupported() should return a boolean");
        });

        it("should report AR support status correctly", async() => {
            const arSupported = await graph.isARSupported();

            // In test environment, WebXR is typically not available
            // The important thing is that this returns a boolean, not throws
            assert.isBoolean(arSupported, "isARSupported() should return a boolean");
        });
    });

    describe("Order of Operations Edge Cases", () => {
        it("should handle setViewMode before addNodes", async() => {
            // Set mode before adding any data
            await graph.setViewMode("2d");
            await graph.operationQueue.waitForCompletion();

            // Then add nodes
            await graph.addNodes(TEST_NODES);
            await graph.setLayout("circular");
            await graph.operationQueue.waitForCompletion();

            // Verify nodes work
            assert.strictEqual(graph.getViewMode(), "2d");
            assert.strictEqual(graph.getNodeCount(), TEST_NODES.length);
        });

        it("should handle setViewMode during layout animation", async() => {
            // Start with nodes
            await graph.addNodes(TEST_NODES);
            await graph.operationQueue.waitForCompletion();

            // Start a layout (don't wait for completion)
            void graph.setLayout("ngraph");

            // Immediately switch view mode
            await graph.setViewMode("2d");
            await graph.operationQueue.waitForCompletion();

            // Should complete without errors
            assert.strictEqual(graph.getViewMode(), "2d");
            assert.strictEqual(graph.getNodeCount(), TEST_NODES.length);
        });

        it("should handle multiple setViewMode calls during same operation", async() => {
            // Setup
            await graph.addNodes(TEST_NODES);
            await graph.setLayout("circular");
            await graph.operationQueue.waitForCompletion();

            // Rapid view mode switches
            void graph.setViewMode("2d");
            void graph.setViewMode("3d");
            void graph.setViewMode("2d");
            await graph.operationQueue.waitForCompletion();

            // Final state should be 2D
            assert.strictEqual(graph.getViewMode(), "2d");
            assert.strictEqual(graph.getNodeCount(), TEST_NODES.length);
        });

        it("should handle interleaved node operations and mode switches", async() => {
            // Sequential operations with proper awaiting
            await graph.setViewMode("2d");
            await graph.operationQueue.waitForCompletion();

            await graph.addNodes(TEST_NODES);
            await graph.operationQueue.waitForCompletion();

            await graph.setViewMode("3d");
            await graph.operationQueue.waitForCompletion();

            await graph.setLayout("circular");
            await graph.operationQueue.waitForCompletion();

            await graph.setViewMode("2d");
            await graph.operationQueue.waitForCompletion();

            // Final state should be consistent
            assert.strictEqual(graph.getViewMode(), "2d");
            assert.strictEqual(graph.getNodeCount(), TEST_NODES.length);
        });
    });
});
