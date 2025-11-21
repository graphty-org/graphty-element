import {
    NullEngine,
    type PickingInfo,
    PointerEventTypes,
    PointerInfo,
    Scene,
    Vector3,
} from "@babylonjs/core";
import {assert} from "chai";
import {afterEach, beforeEach, describe, test} from "vitest";

import {Graph} from "../../src/Graph";
import type {GraphContext} from "../../src/managers/GraphContext";
import {Node} from "../../src/Node";
import {NodeBehavior} from "../../src/NodeBehavior";

describe("Unified Drag Handler", () => {
    let engine: NullEngine;
    let scene: Scene;
    let graph: Graph;
    let node: Node;

    beforeEach(() => {
        engine = new NullEngine();
        scene = new Scene(engine);

        // Create minimal graph instance
        const canvas = document.createElement("canvas");
        graph = new Graph(canvas, {
            camera: {type: "orbit"},
            layout: {type: "fixed"},
        });

        // Create test node
        node = new Node(graph as unknown as GraphContext, "test-node", "default", {label: "Test Node"});
    });

    afterEach(() => {
        node?.mesh.dispose();
        graph?.dispose();
        scene.dispose();
        engine.dispose();
    });

    test("should handle desktop pointer down → move → up sequence", () => {
        // Verify drag handler exists
        assert.exists(node.dragHandler, "Node should have dragHandler");

        const startPosition = node.mesh.position.clone();

        // Simulate pointer down
        const pickInfo: PickingInfo = {
            hit: true,
            pickedMesh: node.mesh,
            pickedPoint: startPosition,
            distance: 0,
            faceId: 0,
            subMeshId: 0,
            bu: 0,
            bv: 0,
            ray: null,
            originMesh: node.mesh,
            pickedSprite: null,
        };

        const pointerDownInfo: PointerInfo = {
            type: PointerEventTypes.POINTERDOWN,
            event: new PointerEvent("pointerdown"),
            pickInfo,
        };

        // Trigger pointer down
        scene.onPointerObservable.notifyObservers(pointerDownInfo);

        // Verify drag started
        assert.isTrue(node.dragging, "node.dragging should be true after pointer down");

        // Simulate pointer move
        const newPosition = startPosition.add(new Vector3(1, 1, 0));
        const movePickInfo: PickingInfo = {
            ... pickInfo,
            pickedPoint: newPosition,
        };

        const pointerMoveInfo: PointerInfo = {
            type: PointerEventTypes.POINTERMOVE,
            event: new PointerEvent("pointermove"),
            pickInfo: movePickInfo,
        };

        // Mock scene pointer position
        scene.pointerX = 100;
        scene.pointerY = 100;

        scene.onPointerObservable.notifyObservers(pointerMoveInfo);

        // Verify position updated (allowing for some tolerance)
        const currentPosition = node.mesh.position;
        assert.notDeepEqual(
            currentPosition,
            startPosition,
            "Mesh position should have changed",
        );

        // Simulate pointer up
        const pointerUpInfo: PointerInfo = {
            type: PointerEventTypes.POINTERUP,
            event: new PointerEvent("pointerup"),
            pickInfo: movePickInfo,
        };

        scene.onPointerObservable.notifyObservers(pointerUpInfo);

        // Verify drag ended
        assert.isFalse(node.dragging, "node.dragging should be false after pointer up");
    });

    test("should set node.dragging flag during drag", () => {
        assert.isFalse(node.dragging, "node.dragging should start as false");

        const pickInfo: PickingInfo = {
            hit: true,
            pickedMesh: node.mesh,
            pickedPoint: node.mesh.position,
            distance: 0,
            faceId: 0,
            subMeshId: 0,
            bu: 0,
            bv: 0,
            ray: null,
            originMesh: node.mesh,
            pickedSprite: null,
        };

        // Start drag
        const pointerDownInfo: PointerInfo = {
            type: PointerEventTypes.POINTERDOWN,
            event: new PointerEvent("pointerdown"),
            pickInfo,
        };
        scene.onPointerObservable.notifyObservers(pointerDownInfo);

        assert.isTrue(node.dragging, "node.dragging should be true during drag");

        // End drag
        const pointerUpInfo: PointerInfo = {
            type: PointerEventTypes.POINTERUP,
            event: new PointerEvent("pointerup"),
            pickInfo,
        };
        scene.onPointerObservable.notifyObservers(pointerUpInfo);

        assert.isFalse(node.dragging, "node.dragging should be false after drag");
    });

    test("should update layout engine during drag", () => {
        const {layoutEngine} = graph.getLayoutManager();
        assert.exists(layoutEngine, "Layout engine should exist");

        let setPositionCalled = false;
        let lastSetPosition: {x: number, y: number, z: number} | null = null;

        // Mock setNodePosition
        const originalSetNodePosition = layoutEngine?.setNodePosition.bind(layoutEngine);
        if (layoutEngine) {
            layoutEngine.setNodePosition = (n: Node, pos: {x: number, y: number, z: number}) => {
                setPositionCalled = true;
                lastSetPosition = pos;
                originalSetNodePosition?.(n, pos);
            };
        }

        const pickInfo: PickingInfo = {
            hit: true,
            pickedMesh: node.mesh,
            pickedPoint: node.mesh.position,
            distance: 0,
            faceId: 0,
            subMeshId: 0,
            bu: 0,
            bv: 0,
            ray: null,
            originMesh: node.mesh,
            pickedSprite: null,
        };

        // Start drag
        scene.onPointerObservable.notifyObservers({
            type: PointerEventTypes.POINTERDOWN,
            event: new PointerEvent("pointerdown"),
            pickInfo,
        });

        // Move
        scene.pointerX = 150;
        scene.pointerY = 150;
        scene.onPointerObservable.notifyObservers({
            type: PointerEventTypes.POINTERMOVE,
            event: new PointerEvent("pointermove"),
            pickInfo: {
                ... pickInfo,
                pickedPoint: node.mesh.position.add(new Vector3(2, 2, 0)),
            },
        });

        assert.isTrue(setPositionCalled, "setNodePosition should be called during drag");
        assert.exists(lastSetPosition, "Position should be set");
    });

    test("should pin node after drag when configured", () => {
        // Set pinOnDrag = true (should be default)
        node.pinOnDrag = true;

        let pinCalled = false;
        const originalPin = node.pin.bind(node);
        node.pin = () => {
            pinCalled = true;
            originalPin();
        };

        const pickInfo: PickingInfo = {
            hit: true,
            pickedMesh: node.mesh,
            pickedPoint: node.mesh.position,
            distance: 0,
            faceId: 0,
            subMeshId: 0,
            bu: 0,
            bv: 0,
            ray: null,
            originMesh: node.mesh,
            pickedSprite: null,
        };

        // Perform drag
        scene.onPointerObservable.notifyObservers({
            type: PointerEventTypes.POINTERDOWN,
            event: new PointerEvent("pointerdown"),
            pickInfo,
        });

        scene.onPointerObservable.notifyObservers({
            type: PointerEventTypes.POINTERUP,
            event: new PointerEvent("pointerup"),
            pickInfo,
        });

        assert.isTrue(pinCalled, "node.pin() should be called when pinOnDrag is true");
    });

    test("should NOT pin node when pinOnDrag is false", () => {
        // Set pinOnDrag = false
        node.pinOnDrag = false;

        let pinCalled = false;
        const originalPin = node.pin.bind(node);
        node.pin = () => {
            pinCalled = true;
            originalPin();
        };

        const pickInfo: PickingInfo = {
            hit: true,
            pickedMesh: node.mesh,
            pickedPoint: node.mesh.position,
            distance: 0,
            faceId: 0,
            subMeshId: 0,
            bu: 0,
            bv: 0,
            ray: null,
            originMesh: node.mesh,
            pickedSprite: null,
        };

        // Perform drag
        scene.onPointerObservable.notifyObservers({
            type: PointerEventTypes.POINTERDOWN,
            event: new PointerEvent("pointerdown"),
            pickInfo,
        });

        scene.onPointerObservable.notifyObservers({
            type: PointerEventTypes.POINTERUP,
            event: new PointerEvent("pointerup"),
            pickInfo,
        });

        assert.isFalse(pinCalled, "node.pin() should NOT be called when pinOnDrag is false");
    });

    test("should maintain consistent depth during horizontal drag", () => {
        const startPosition = node.mesh.position.clone();
        const startZ = startPosition.z;

        const pickInfo: PickingInfo = {
            hit: true,
            pickedMesh: node.mesh,
            pickedPoint: startPosition,
            distance: 0,
            faceId: 0,
            subMeshId: 0,
            bu: 0,
            bv: 0,
            ray: null,
            originMesh: node.mesh,
            pickedSprite: null,
        };

        // Start drag
        scene.onPointerObservable.notifyObservers({
            type: PointerEventTypes.POINTERDOWN,
            event: new PointerEvent("pointerdown"),
            pickInfo,
        });

        // Drag horizontally (X-axis only)
        scene.pointerX = 200;
        scene.pointerY = 100;
        scene.onPointerObservable.notifyObservers({
            type: PointerEventTypes.POINTERMOVE,
            event: new PointerEvent("pointermove"),
            pickInfo: {
                ... pickInfo,
                pickedPoint: new Vector3(startPosition.x + 5, startPosition.y, startPosition.z),
            },
        });

        // Verify Z-coordinate remains stable (within tolerance)
        const currentZ = node.mesh.position.z;
        const zDifference = Math.abs(currentZ - startZ);
        assert.isBelow(
            zDifference,
            0.1,
            `Z-coordinate should remain stable during horizontal drag (difference: ${zDifference})`,
        );
    });

    test("should maintain consistent depth during vertical drag", () => {
        const startPosition = node.mesh.position.clone();
        const startZ = startPosition.z;

        const pickInfo: PickingInfo = {
            hit: true,
            pickedMesh: node.mesh,
            pickedPoint: startPosition,
            distance: 0,
            faceId: 0,
            subMeshId: 0,
            bu: 0,
            bv: 0,
            ray: null,
            originMesh: node.mesh,
            pickedSprite: null,
        };

        // Start drag
        scene.onPointerObservable.notifyObservers({
            type: PointerEventTypes.POINTERDOWN,
            event: new PointerEvent("pointerdown"),
            pickInfo,
        });

        // Drag vertically (Y-axis only)
        scene.pointerX = 100;
        scene.pointerY = 200;
        scene.onPointerObservable.notifyObservers({
            type: PointerEventTypes.POINTERMOVE,
            event: new PointerEvent("pointermove"),
            pickInfo: {
                ... pickInfo,
                pickedPoint: new Vector3(startPosition.x, startPosition.y + 5, startPosition.z),
            },
        });

        // Verify Z-coordinate remains stable (within tolerance)
        const currentZ = node.mesh.position.z;
        const zDifference = Math.abs(currentZ - startZ);
        assert.isBelow(
            zDifference,
            0.1,
            `Z-coordinate should remain stable during vertical drag (difference: ${zDifference})`,
        );
    });

    test("should dispose cleanly", () => {
        assert.exists(node.dragHandler, "Drag handler should exist before disposal");

        // Dispose drag handler
        node.dragHandler?.dispose();

        // Verify no errors occur when disposing
        assert.doesNotThrow(() => {
            node.dragHandler?.dispose();
        }, "Disposing should not throw errors");
    });
});
