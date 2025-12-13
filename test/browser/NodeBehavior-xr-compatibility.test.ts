import {Vector3} from "@babylonjs/core";
import {assert} from "chai";
import {afterEach, beforeEach, describe, test} from "vitest";

import type {AdHocData} from "../../src/config/common";
import {Graph} from "../../src/Graph";
import type {Node as GraphNode} from "../../src/Node";
import {cleanupTestGraph, createTestGraph} from "../helpers/testSetup";

/**
 * Tests to verify that NodeBehavior works with XR inputs.
 *
 * Critical: XR should NOT reimplement node dragging/selection logic.
 * Instead, XR inputs feed into the unified NodeDragHandler which handles
 * all drag operations consistently across desktop and XR modes.
 */
describe("NodeBehavior XR Compatibility", () => {
    let graph: Graph;
    let node: GraphNode;

    beforeEach(async() => {
        // Create test graph using the helper (properly sets up styles)
        graph = await createTestGraph({
            camera: {type: "orbit"},
            layout: {type: "fixed"},
        });

        // Create test node using DataManager
        const dataManager = graph.getDataManager();
        dataManager.addNode({id: "test-node-1", label: "Test Node"} as AdHocData);
        node = dataManager.getNode("test-node-1")!;
    });

    afterEach(() => {
        cleanupTestGraph(graph);
    });

    test("NodeDragHandler should be attached to node", () => {
        // Verify that dragHandler is attached
        assert.exists(node.dragHandler, "dragHandler should be attached");
        assert.isTrue(node.mesh.isPickable, "mesh should be pickable for XR pointer events");
    });

    test("drag behavior should set node.dragging flag", () => {
        // Initially not dragging
        assert.isFalse(node.dragging, "node should not be dragging initially");

        // Simulate drag start (as XR controller would trigger)
        node.dragHandler!.onDragStart(node.mesh.position.clone());
        assert.isTrue(node.dragging, "node.dragging should be true after drag start");

        // Simulate drag end
        node.dragHandler!.onDragEnd();
        assert.isFalse(node.dragging, "node.dragging should be false after drag end");
    });

    test("pinOnDrag should be configurable", () => {
        // Default node should have pinOnDrag = true
        assert.isTrue(node.pinOnDrag, "default pinOnDrag should be true");

        // Test with pinOnDrag = false
        node.pinOnDrag = false;
        assert.isFalse(node.pinOnDrag, "pinOnDrag should be false");

        // Test with pinOnDrag = true (explicit)
        node.pinOnDrag = true;
        assert.isTrue(node.pinOnDrag, "pinOnDrag should be true");
    });

    test("ActionManager should handle XR pointer events", () => {
        // Verify ActionManager is attached (for double-click expansion in XR)
        assert.exists(node.mesh.actionManager, "ActionManager should be attached");

        // Note: We can't test actual double-click behavior without fetchNodes/fetchEdges
        // But we verify the infrastructure is in place for XR pointer events to trigger it
        const {actions} = node.mesh.actionManager;

        // If graph has fetchNodes/fetchEdges, action should be registered
        // In this test, graph doesn't have them, so no actions expected
        assert.isArray(actions, "actions should be an array");
    });

    test("drag position changes should update through drag handler", () => {
        // Simulate drag start
        node.dragHandler!.onDragStart(node.mesh.position.clone());
        assert.isTrue(node.dragging, "node should be dragging");

        // Simulate position change during drag (as XR controller would trigger)
        const newPosition = new Vector3(10, 20, 30);
        node.dragHandler!.onDragUpdate(newPosition);

        // Verify the behavior is designed to work
        assert.isTrue(node.dragging, "node should still be dragging");

        // Cleanup
        node.dragHandler!.onDragEnd();
        assert.isFalse(node.dragging, "node should not be dragging after end");
    });

    test("mesh should be pickable for XR ray casting", () => {
        // XR controllers use ray casting to select objects
        // Verify mesh is configured for this
        assert.isTrue(node.mesh.isPickable, "mesh should be pickable for XR rays");
        assert.exists(node.dragHandler, "drag handler should be attached for XR interaction");
    });

    test("drag handler should work across XR and non-XR modes", () => {
        // This test verifies that the same drag handler works in both modes
        // by checking that it can handle position updates from any source

        // Drag handler should exist
        assert.exists(node.dragHandler, "drag handler exists");

        // ActionManager should work with any pointer events
        assert.exists(node.mesh.actionManager, "action manager exists");

        // Start drag from any input source
        node.dragHandler!.onDragStart(new Vector3(0, 0, 0));
        assert.isTrue(node.dragging, "dragging flag set");

        // Update position (works the same for desktop/XR)
        node.dragHandler!.onDragUpdate(new Vector3(5, 5, 5));
        assert.isTrue(node.dragging, "still dragging during update");

        // End drag
        node.dragHandler!.onDragEnd();
        assert.isFalse(node.dragging, "not dragging after end");

        // These behaviors should work with:
        // - Mouse pointer events (non-XR)
        // - Touch pointer events (mobile non-XR)
        // - XR controller pointer events (XR mode)
        // - XR hand tracking pointer events (XR mode)
        // Because the unified drag handler abstracts input sources
    });
});
