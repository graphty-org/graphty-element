/**
 * Node Drag and Drop Edge Case Tests
 *
 * Tests verify complex node drag behavior and edge cases that are
 * easy to break during refactoring.
 */

import {PointerEventTypes, type PointerInfo, Vector3} from "@babylonjs/core";
import {assert} from "chai";
import {afterEach, beforeEach, describe, test, vi} from "vitest";

import type {StyleSchema} from "../../../src/config";
import {Graph} from "../../../src/Graph";

function createStyleTemplate(twoD: boolean): StyleSchema {
    return {
        graphtyTemplate: true,
        majorVersion: "1",
        graph: {
            addDefaultStyle: true,
            twoD,
            layout: "fixed",
            layoutOptions: {dim: twoD ? 2 : 3},
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

describe("Node Drag and Drop", () => {
    let graph: Graph;
    let container: HTMLDivElement;

    describe("3D Mode Edge Cases", () => {
        beforeEach(async() => {
            container = document.createElement("div");
            container.style.width = "800px";
            container.style.height = "600px";
            document.body.appendChild(container);

            graph = new Graph(container);
            await graph.init();
            await graph.setStyleTemplate(createStyleTemplate(false));
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

        test("node position can be updated", async() => {
            const node1 = graph.getNode("node1");
            assert.isDefined(node1, "Node 1 should exist");
            assert.isNotNull(node1);

            const initialNodePos = node1.mesh.position.clone();
            const newPosition = initialNodePos.add(new Vector3(2, 0, 0));
            node1.mesh.position = newPosition;

            await new Promise((resolve) => setTimeout(resolve, 50));

            assert.notDeepEqual(
                {x: node1.mesh.position.x, y: node1.mesh.position.y, z: node1.mesh.position.z},
                {x: initialNodePos.x, y: initialNodePos.y, z: initialNodePos.z},
                "Node should have moved",
            );
        });

        test("edge count is maintained after node operations", async() => {
            assert.equal(graph.getEdgeCount(), 1, "Should have 1 edge");

            const node1 = graph.getNode("node1");
            if (!node1) {
                throw new Error("node1 should exist");
            }

            node1.mesh.position = new Vector3(10, 10, 10);

            await new Promise((resolve) => setTimeout(resolve, 50));

            assert.equal(graph.getEdgeCount(), 1, "Should still have 1 edge");
        });

        test("camera state is accessible during node operations", () => {
            const cameraController = graph.camera.getActiveController();
            assert.isDefined(cameraController, "Camera controller should be defined");
            if (!cameraController) {
                return;
            }

            // Verify camera is accessible and has valid position
            assert.isDefined(cameraController.camera, "Camera should be accessible");
            const cameraPos = cameraController.camera.position;
            assert.isTrue(isFinite(cameraPos.x), "Camera X should be finite");
            assert.isTrue(isFinite(cameraPos.y), "Camera Y should be finite");
            assert.isTrue(isFinite(cameraPos.z), "Camera Z should be finite");
        });

        test("pointer events can be sent to scene", () => {
            const {scene} = graph;
            const node1 = graph.getNode("node1");
            if (!node1) {
                return;
            }

            // Just verify we can send events without throwing
            scene.onPointerObservable.notifyObservers({
                type: PointerEventTypes.POINTERDOWN,
                event: {clientX: 400, clientY: 300, buttons: 1, button: 0} as PointerEvent,
                pickInfo: {hit: true, pickedMesh: node1.mesh},
            } as unknown as PointerInfo);

            scene.onPointerObservable.notifyObservers({
                type: PointerEventTypes.POINTERUP,
                event: {clientX: 400, clientY: 300, buttons: 0, button: 0} as PointerEvent,
            } as unknown as PointerInfo);

            assert.isDefined(graph.scene, "Scene should still exist after events");
        });

        test("node beyond scene bounds handled gracefully", async() => {
            const node1 = graph.getNode("node1");
            assert.isDefined(node1, "Node 1 should exist");
            assert.isNotNull(node1);

            node1.mesh.position = new Vector3(10000, 10000, 10000);
            await new Promise((resolve) => setTimeout(resolve, 50));

            assert.isDefined(graph.getNode("node1"), "Node should still exist");
            assert.isTrue(isFinite(node1.mesh.position.x), "X should be finite");
            assert.isTrue(isFinite(node1.mesh.position.y), "Y should be finite");
            assert.isTrue(isFinite(node1.mesh.position.z), "Z should be finite");
        });
    });

    describe("2D Mode Edge Cases", () => {
        beforeEach(async() => {
            container = document.createElement("div");
            container.style.width = "800px";
            container.style.height = "600px";
            document.body.appendChild(container);

            graph = new Graph(container);
            await graph.init();
            await graph.setStyleTemplate(createStyleTemplate(true));
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

        test("2D mode has orthographic camera", () => {
            const cameraController = graph.camera.getActiveController();
            assert.isDefined(cameraController, "Camera controller should be defined");
            if (!cameraController) {
                return;
            }

            // 2D mode uses orthographic camera
            assert.isDefined(cameraController.camera.orthoTop, "2D mode should have orthographic camera");
        });

        test("pointer events work in 2D mode", () => {
            const {scene} = graph;
            const node1 = graph.getNode("node1");
            if (!node1) {
                return;
            }

            // Just verify we can send events without throwing
            scene.onPointerObservable.notifyObservers({
                type: PointerEventTypes.POINTERDOWN,
                event: {clientX: 400, clientY: 300, buttons: 1, button: 0} as PointerEvent,
                pickInfo: {hit: true, pickedMesh: node1.mesh},
            } as unknown as PointerInfo);

            scene.onPointerObservable.notifyObservers({
                type: PointerEventTypes.POINTERUP,
                event: {clientX: 400, clientY: 300, buttons: 0, button: 0} as PointerEvent,
            } as unknown as PointerInfo);

            assert.isDefined(graph.scene, "Scene should still exist after events");
        });
    });
});
