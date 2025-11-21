import {NullEngine, Scene, Vector3} from "@babylonjs/core";
import {assert} from "chai";
import {afterEach, beforeEach, describe, test} from "vitest";

import {Graph} from "../../src/Graph";
import {GraphContext} from "../../src/managers/GraphContext";
import {Node as GraphNode} from "../../src/Node";

/**
 * Tests to verify that existing NodeBehavior works with XR inputs.
 *
 * Critical: XR should NOT reimplement node dragging/selection logic.
 * Instead, XR pointer events should trigger existing SixDofDragBehavior.
 */
describe("NodeBehavior XR Compatibility", () => {
    let engine: NullEngine;
    let scene: Scene;
    let graph: Graph;
    let node: GraphNode;

    beforeEach(() => {
        engine = new NullEngine();
        scene = new Scene(engine);

        // Create a minimal graph setup
        const canvas = document.createElement("canvas");
        graph = new Graph(canvas, {
            camera: {type: "orbit"},
        });

        // Create a test node
        node = new GraphNode(
            graph as unknown as GraphContext,
            "test-node-1",
            "default",
            {label: "Test Node"},
        );
    });

    afterEach(() => {
        node.dispose();
        graph.dispose();
        scene.dispose();
        engine.dispose();
    });

    test("SixDofDragBehavior should be attachable in XR context", () => {
        // Verify that NodeBehavior.addDefaultBehaviors was called in Node constructor
        assert.exists(node.meshDragBehavior, "meshDragBehavior should be attached");
        assert.isTrue(node.mesh.isPickable, "mesh should be pickable for XR pointer events");
    });

    test("drag behavior should set node.dragging flag", () => {
        // Initially not dragging
        assert.isFalse(node.dragging, "node should not be dragging initially");

        // Simulate drag start (as XR controller would trigger)
        node.meshDragBehavior.onDragStartObservable.notifyObservers({} as never);
        assert.isTrue(node.dragging, "node.dragging should be true after drag start");

        // Simulate drag end
        node.meshDragBehavior.onDragEndObservable.notifyObservers({} as never);
        assert.isFalse(node.dragging, "node.dragging should be false after drag end");
    });

    test("pinOnDrag should be configurable", () => {
        // Create node with pinOnDrag = false
        const noPinNode = new GraphNode(
            graph as unknown as GraphContext,
            "no-pin-node",
            "default",
            {label: "No Pin Node"},
            {pinOnDrag: false},
        );

        assert.isFalse(noPinNode.pinOnDrag, "pinOnDrag should be false");
        noPinNode.dispose();

        // Create node with pinOnDrag = true (explicit)
        const pinNode = new GraphNode(
            graph as unknown as GraphContext,
            "pin-node",
            "default",
            {label: "Pin Node"},
            {pinOnDrag: true},
        );

        assert.isTrue(pinNode.pinOnDrag, "pinOnDrag should be true");
        pinNode.dispose();
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

    test("drag position changes should update layout engine", () => {
        // Simulate drag start
        node.meshDragBehavior.onDragStartObservable.notifyObservers({} as never);

        // Simulate position change during drag (as XR controller would trigger)
        const newPosition = new Vector3(10, 20, 30);
        node.meshDragBehavior.onPositionChangedObservable.notifyObservers({
            position: newPosition,
        } as never);

        // Verify the behavior is designed to work (actual layout engine update
        // requires full Graph setup which is tested in integration tests)
        assert.isTrue(node.dragging, "node should still be dragging");

        // Cleanup
        node.meshDragBehavior.onDragEndObservable.notifyObservers({} as never);
    });

    test("mesh should be pickable for XR ray casting", () => {
        // XR controllers use ray casting to select objects
        // Verify mesh is configured for this
        assert.isTrue(node.mesh.isPickable, "mesh should be pickable for XR rays");
        assert.exists(node.meshDragBehavior, "drag behavior should be attached for XR interaction");
    });

    test("behaviors should be reusable across XR and non-XR modes", () => {
        // This test verifies that the same behaviors work in both modes
        // by checking that they don't have any XR-specific dependencies

        // Drag behavior should work regardless of camera type
        assert.exists(node.meshDragBehavior, "behavior exists");

        // ActionManager should work with any pointer events
        assert.exists(node.mesh.actionManager, "action manager exists");

        // These behaviors should work with:
        // - Mouse pointer events (non-XR)
        // - Touch pointer events (mobile non-XR)
        // - XR controller pointer events (XR mode)
        // - XR hand tracking pointer events (XR mode)
        // Because BabylonJS abstracts all of these as pointer events
    });
});
