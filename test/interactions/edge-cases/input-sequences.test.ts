/**
 * Input Sequence Tests
 *
 * Tests verify correct behavior for complex input sequences
 * and transitions between different input methods.
 */

import {PointerEventTypes, type PointerInfo} from "@babylonjs/core";
import {assert} from "chai";
import {afterEach, beforeEach, describe, test, vi} from "vitest";

import type {StyleSchema} from "../../../src/config";
import {Graph} from "../../../src/Graph";

function createStyleTemplate(): StyleSchema {
    return {
        graphtyTemplate: true,
        majorVersion: "1",
        graph: {
            addDefaultStyle: true,
            twoD: false,
            layout: "fixed",
            layoutOptions: {dim: 3},
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
            layout: {type: "fixed", preSteps: 0, stepMultiplier: 1, minDelta: 0.001, zoomStepInterval: 5},
            node: {pinOnDrag: true},
        },
    } as unknown as StyleSchema;
}

const TEST_NODES = [{id: "node1", x: 0, y: 0, z: 0}, {id: "node2", x: 5, y: 0, z: 0}];
const TEST_EDGES = [{src: "node1", dst: "node2"}];

describe("Input Sequences", () => {
    let graph: Graph;
    let container: HTMLDivElement;

    beforeEach(async() => {
        container = document.createElement("div");
        container.style.width = "800px";
        container.style.height = "600px";
        document.body.appendChild(container);

        graph = new Graph(container);
        await graph.init();
        await graph.setStyleTemplate(createStyleTemplate());
        await graph.addNodes(TEST_NODES);
        await graph.addEdges(TEST_EDGES);
        await graph.operationQueue.waitForCompletion();
        await new Promise((resolve) => setTimeout(resolve, 100));
    });

    afterEach(() => {
        vi.restoreAllMocks();
        graph.dispose();
        document.body.removeChild(container);
    });

    describe("Pointer Event Sequences", () => {
        test("down-move-up sequence maintains state", () => {
            const node1 = graph.getNode("node1");
            if (!node1) {
                return;
            }

            const {scene} = graph;

            // Pointer down
            scene.onPointerObservable.notifyObservers({
                type: PointerEventTypes.POINTERDOWN,
                event: {clientX: 400, clientY: 300, buttons: 1, button: 0} as PointerEvent,
                pickInfo: {hit: true, pickedMesh: node1.mesh},
            } as unknown as PointerInfo);

            // Pointer move
            scene.onPointerObservable.notifyObservers({
                type: PointerEventTypes.POINTERMOVE,
                event: {clientX: 450, clientY: 350, buttons: 1, button: 0} as PointerEvent,
            } as unknown as PointerInfo);

            // Pointer up
            scene.onPointerObservable.notifyObservers({
                type: PointerEventTypes.POINTERUP,
                event: {clientX: 450, clientY: 350, buttons: 0, button: 0} as PointerEvent,
            } as unknown as PointerInfo);

            // Node should still be valid
            assert.isDefined(graph.getNode("node1"), "Node should exist after sequence");
        });

        test("interrupted sequence cleans up state", () => {
            const node1 = graph.getNode("node1");
            if (!node1) {
                return;
            }

            const {scene} = graph;

            // Start drag
            scene.onPointerObservable.notifyObservers({
                type: PointerEventTypes.POINTERDOWN,
                event: {clientX: 400, clientY: 300, buttons: 1, button: 0} as PointerEvent,
                pickInfo: {hit: true, pickedMesh: node1.mesh},
            } as unknown as PointerInfo);

            // Move without completing
            scene.onPointerObservable.notifyObservers({
                type: PointerEventTypes.POINTERMOVE,
                event: {clientX: 450, clientY: 350, buttons: 1, button: 0} as PointerEvent,
            } as unknown as PointerInfo);

            // Simulate losing focus (pointer up with no buttons)
            scene.onPointerObservable.notifyObservers({
                type: PointerEventTypes.POINTERUP,
                event: {clientX: 0, clientY: 0, buttons: 0, button: 0} as PointerEvent,
            } as unknown as PointerInfo);

            // Graph should remain in valid state
            assert.isDefined(graph.scene, "Scene should exist");
            assert.isDefined(graph.getNode("node1"), "Node should exist");
        });

        test("multiple sequential drags work correctly", () => {
            const node1 = graph.getNode("node1");
            if (!node1) {
                return;
            }

            const {scene} = graph;

            // First drag sequence
            scene.onPointerObservable.notifyObservers({
                type: PointerEventTypes.POINTERDOWN,
                event: {clientX: 400, clientY: 300, buttons: 1, button: 0} as PointerEvent,
                pickInfo: {hit: true, pickedMesh: node1.mesh},
            } as unknown as PointerInfo);

            scene.onPointerObservable.notifyObservers({
                type: PointerEventTypes.POINTERUP,
                event: {clientX: 400, clientY: 300, buttons: 0, button: 0} as PointerEvent,
            } as unknown as PointerInfo);

            // Second drag sequence
            scene.onPointerObservable.notifyObservers({
                type: PointerEventTypes.POINTERDOWN,
                event: {clientX: 400, clientY: 300, buttons: 1, button: 0} as PointerEvent,
                pickInfo: {hit: true, pickedMesh: node1.mesh},
            } as unknown as PointerInfo);

            scene.onPointerObservable.notifyObservers({
                type: PointerEventTypes.POINTERUP,
                event: {clientX: 400, clientY: 300, buttons: 0, button: 0} as PointerEvent,
            } as unknown as PointerInfo);

            // Third drag sequence
            scene.onPointerObservable.notifyObservers({
                type: PointerEventTypes.POINTERDOWN,
                event: {clientX: 400, clientY: 300, buttons: 1, button: 0} as PointerEvent,
                pickInfo: {hit: true, pickedMesh: node1.mesh},
            } as unknown as PointerInfo);

            scene.onPointerObservable.notifyObservers({
                type: PointerEventTypes.POINTERUP,
                event: {clientX: 400, clientY: 300, buttons: 0, button: 0} as PointerEvent,
            } as unknown as PointerInfo);

            assert.isDefined(graph.getNode("node1"), "Node should exist after multiple sequences");
        });
    });

    describe("State Transitions", () => {
        test("view mode change interrupts drag cleanly", async() => {
            const node1 = graph.getNode("node1");
            if (!node1) {
                return;
            }

            const {scene} = graph;

            // Start drag
            scene.onPointerObservable.notifyObservers({
                type: PointerEventTypes.POINTERDOWN,
                event: {clientX: 400, clientY: 300, buttons: 1, button: 0} as PointerEvent,
                pickInfo: {hit: true, pickedMesh: node1.mesh},
            } as unknown as PointerInfo);

            // Change view mode mid-drag
            await graph.setViewMode("2d");
            await graph.operationQueue.waitForCompletion();
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Graph should be in valid 2D state
            assert.equal(graph.getViewMode(), "2d", "Should be in 2D mode");
            assert.equal(graph.getNodes().length, 2, "Nodes should still exist");
        });

        test("adding nodes during drag does not corrupt state", async() => {
            const node1 = graph.getNode("node1");
            if (!node1) {
                return;
            }

            const {scene} = graph;

            // Start drag
            scene.onPointerObservable.notifyObservers({
                type: PointerEventTypes.POINTERDOWN,
                event: {clientX: 400, clientY: 300, buttons: 1, button: 0} as PointerEvent,
                pickInfo: {hit: true, pickedMesh: node1.mesh},
            } as unknown as PointerInfo);

            // Add new node mid-drag
            await graph.addNodes([{id: "node3", x: 10, y: 10, z: 0}]);
            await graph.operationQueue.waitForCompletion();

            // End drag
            scene.onPointerObservable.notifyObservers({
                type: PointerEventTypes.POINTERUP,
                event: {clientX: 400, clientY: 300, buttons: 0, button: 0} as PointerEvent,
            } as unknown as PointerInfo);

            assert.equal(graph.getNodes().length, 3, "Should have 3 nodes");
            assert.isDefined(graph.getNode("node3"), "New node should exist");
        });

        test("graph state remains valid during interaction", async() => {
            const node1 = graph.getNode("node1");
            if (!node1) {
                return;
            }

            // Verify initial state
            assert.equal(graph.getNodes().length, 2, "Should have 2 nodes");

            // Manipulate node position
            node1.mesh.position.x = 100;
            await graph.operationQueue.waitForCompletion();

            assert.isDefined(graph.getNode("node1"), "Node1 should still exist");
            assert.isDefined(graph.getNode("node2"), "Node2 should still exist");
        });
    });

    describe("Camera Interaction Sequences", () => {
        test("camera position remains valid after interactions", () => {
            const {scene} = graph;

            // Multiple pointer events on empty space (camera interaction)
            scene.onPointerObservable.notifyObservers({
                type: PointerEventTypes.POINTERDOWN,
                event: {clientX: 100, clientY: 100, buttons: 1, button: 0} as PointerEvent,
                pickInfo: {hit: false},
            } as unknown as PointerInfo);

            scene.onPointerObservable.notifyObservers({
                type: PointerEventTypes.POINTERMOVE,
                event: {clientX: 200, clientY: 200, buttons: 1, button: 0} as PointerEvent,
            } as unknown as PointerInfo);

            scene.onPointerObservable.notifyObservers({
                type: PointerEventTypes.POINTERUP,
                event: {clientX: 200, clientY: 200, buttons: 0, button: 0} as PointerEvent,
            } as unknown as PointerInfo);

            const controller = graph.camera.getActiveController();
            if (controller) {
                const pos = controller.camera.position;
                assert.isTrue(isFinite(pos.x), "Camera X should be finite");
                assert.isTrue(isFinite(pos.y), "Camera Y should be finite");
                assert.isTrue(isFinite(pos.z), "Camera Z should be finite");
            }
        });
    });
});
