/**
 * Mouse Controls Integration Tests
 *
 * These tests verify mouse interactions in a real browser environment
 * by creating Graph instances directly and simulating mouse events.
 */

import {PointerEventTypes, type PointerInfo, type PointerInfoPre} from "@babylonjs/core";
import {assert} from "chai";
import {afterEach, beforeEach, describe, test, vi} from "vitest";

import type {StyleSchema} from "../../../src/config";
import {Graph} from "../../../src/Graph";

/**
 * Create a minimal style template for testing
 */
function createStyleTemplate(twoD: boolean): StyleSchema {
    return {
        graphtyTemplate: true,
        majorVersion: "1",
        graph: {
            addDefaultStyle: true,
            twoD,
            layout: "circular",
            layoutOptions: {
                dim: twoD ? 2 : 3,
            },
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
                type: "circular",
                preSteps: 0,
                stepMultiplier: 1,
                minDelta: 0.001,
                zoomStepInterval: 5,
            },
            node: {
                pinOnDrag: true,
            },
        },
    } as unknown as StyleSchema;
}

const TEST_NODES = [
    {id: 1},
    {id: 2},
    {id: 3},
];

const TEST_EDGES = [
    {src: 1, dst: 2},
    {src: 2, dst: 3},
];

describe("Mouse Controls Integration", () => {
    let graph: Graph;
    let container: HTMLDivElement;

    describe("2D Mode", () => {
        beforeEach(async() => {
            container = document.createElement("div");
            container.style.width = "800px";
            container.style.height = "600px";
            document.body.appendChild(container);

            graph = new Graph(container);
            await graph.init();

            // Set up 2D mode
            await graph.setStyleTemplate(createStyleTemplate(true));
            await graph.addNodes(TEST_NODES);
            await graph.addEdges(TEST_EDGES);
            await graph.operationQueue.waitForCompletion();

            // Wait for rendering to stabilize
            await new Promise((resolve) => setTimeout(resolve, 100));
        });

        afterEach(() => {
            graph.dispose();
            document.body.removeChild(container);
        });

        test("drag to pan in 2D mode", () => {
            // Get the camera controller
            const cameraController = graph.camera.getActiveController();
            assert.isDefined(cameraController, "Camera controller should be defined");

            // Access the 2D camera controller directly to spy on pan method
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const cameraManager = graph.camera as any;
            const twoDController = cameraManager.activeCameraController;
            assert.isDefined(twoDController, "2D camera controller should be defined");

            // Spy on the pan method to verify it's being called
            const panSpy = vi.spyOn(twoDController, "pan");

            const {scene} = graph;

            // Simulate mouse pan via scene observables
            // Pointer down at position 100, 100
            scene.onPointerObservable.notifyObservers({
                type: PointerEventTypes.POINTERDOWN,
                event: {
                    clientX: 100,
                    clientY: 100,
                    buttons: 1,
                    button: 0,
                } as PointerEvent,
            } as unknown as PointerInfo);

            // Pointer move to position 200, 150 (drag right and down)
            scene.onPointerObservable.notifyObservers({
                type: PointerEventTypes.POINTERMOVE,
                event: {
                    clientX: 200,
                    clientY: 150,
                    buttons: 1,
                    button: 0,
                } as PointerEvent,
            } as unknown as PointerInfo);

            // Pointer up
            scene.onPointerObservable.notifyObservers({
                type: PointerEventTypes.POINTERUP,
                event: {
                    clientX: 200,
                    clientY: 150,
                    buttons: 0,
                    button: 0,
                } as PointerEvent,
            } as unknown as PointerInfo);

            // Pan method should have been called during the drag
            assert.isAbove(panSpy.mock.calls.length, 0, "pan() should be called during mouse drag");
        });

        test("wheel to zoom in 2D mode", () => {
            // Get the camera controller
            const cameraController = graph.camera.getActiveController();
            assert.isDefined(cameraController, "Camera controller should be defined");

            const {camera} = cameraController;
            const initialOrthoTop = camera.orthoTop ?? 10;
            const initialOrthoBottom = camera.orthoBottom ?? -10;
            const initialRange = initialOrthoTop - initialOrthoBottom;

            const {scene} = graph;

            // Simulate wheel zoom in (negative deltaY)
            scene.onPrePointerObservable.notifyObservers({
                type: PointerEventTypes.POINTERWHEEL,
                event: {
                    deltaY: -100,
                    preventDefault: vi.fn(),
                } as unknown as WheelEvent,
            } as unknown as PointerInfoPre, PointerEventTypes.POINTERWHEEL);

            const newOrthoTop = camera.orthoTop ?? 10;
            const newOrthoBottom = camera.orthoBottom ?? -10;
            const newRange = newOrthoTop - newOrthoBottom;

            // Zoom in should decrease ortho range
            assert.isBelow(newRange, initialRange, "Wheel up should zoom in (decrease ortho range)");
        });

        test("wheel down to zoom out in 2D mode", () => {
            // Get the camera controller
            const cameraController = graph.camera.getActiveController();
            assert.isDefined(cameraController, "Camera controller should be defined");

            const {camera} = cameraController;
            const initialOrthoTop = camera.orthoTop ?? 10;
            const initialOrthoBottom = camera.orthoBottom ?? -10;
            const initialRange = initialOrthoTop - initialOrthoBottom;

            const {scene} = graph;

            // Simulate wheel zoom out (positive deltaY)
            scene.onPrePointerObservable.notifyObservers({
                type: PointerEventTypes.POINTERWHEEL,
                event: {
                    deltaY: 100,
                    preventDefault: vi.fn(),
                } as unknown as WheelEvent,
            } as unknown as PointerInfoPre, PointerEventTypes.POINTERWHEEL);

            const newOrthoTop = camera.orthoTop ?? 10;
            const newOrthoBottom = camera.orthoBottom ?? -10;
            const newRange = newOrthoTop - newOrthoBottom;

            // Zoom out should increase ortho range
            assert.isAbove(newRange, initialRange, "Wheel down should zoom out (increase ortho range)");
        });
    });

    describe("3D Mode", () => {
        beforeEach(async() => {
            container = document.createElement("div");
            container.style.width = "800px";
            container.style.height = "600px";
            document.body.appendChild(container);

            graph = new Graph(container);
            await graph.init();

            // Set up 3D mode
            await graph.setStyleTemplate(createStyleTemplate(false));
            await graph.addNodes(TEST_NODES);
            await graph.addEdges(TEST_EDGES);
            await graph.operationQueue.waitForCompletion();

            // Wait for rendering to stabilize
            await new Promise((resolve) => setTimeout(resolve, 100));
        });

        afterEach(() => {
            graph.dispose();
            document.body.removeChild(container);
        });

        test("drag to orbit in 3D mode", () => {
            // Get the camera controller - 3D mode uses OrbitCameraController
            const cameraController = graph.camera.getActiveController();
            assert.isDefined(cameraController, "Camera controller should be defined");

            // Access the orbit controller and input controller
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const cameraManager = graph.camera as any;
            const orbitController = cameraManager.activeCameraController;
            const inputController = cameraManager.activeInputHandler;

            assert.isDefined(orbitController, "Orbit camera controller should be defined");
            assert.isDefined(inputController, "Input controller should be defined");

            // Spy on the rotate method to verify it's called during drag
            const rotateSpy = vi.spyOn(orbitController, "rotate");

            const {canvas} = graph;

            // 3D mode uses direct canvas events
            canvas.dispatchEvent(new PointerEvent("pointerdown", {
                clientX: 100,
                clientY: 100,
                button: 0,
                bubbles: true,
            }));

            canvas.dispatchEvent(new PointerEvent("pointermove", {
                clientX: 200,
                clientY: 150,
                bubbles: true,
            }));

            canvas.dispatchEvent(new PointerEvent("pointerup", {
                bubbles: true,
            }));

            // Verify rotate was called with the movement delta
            assert.isAbove(rotateSpy.mock.calls.length, 0, "rotate() should be called during drag");
            const [dx, dy] = rotateSpy.mock.calls[0];
            assert.equal(dx, 100, "dx should be the difference in clientX (200 - 100)");
            assert.equal(dy, 50, "dy should be the difference in clientY (150 - 100)");
        });

        test("keyboard W to zoom in 3D mode", () => {
            // Get the camera controller - 3D mode uses OrbitCameraController
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const cameraManager = graph.camera as any;
            const orbitController = cameraManager.activeCameraController;
            const inputController = cameraManager.activeInputHandler;

            assert.isDefined(orbitController, "Orbit camera controller should be defined");
            assert.isDefined(inputController, "Input controller should be defined");

            const initialDistance = orbitController.cameraDistance;

            const {canvas} = graph;

            // 3D mode uses W key for zoom in (decrease distance)
            canvas.dispatchEvent(new KeyboardEvent("keydown", {key: "w", bubbles: true}));
            inputController.update();

            assert.isBelow(
                orbitController.cameraDistance,
                initialDistance,
                "W key should zoom in (decrease camera distance)",
            );

            canvas.dispatchEvent(new KeyboardEvent("keyup", {key: "w", bubbles: true}));
        });

        test("keyboard S to zoom out in 3D mode", () => {
            // Get the camera controller - 3D mode uses OrbitCameraController
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const cameraManager = graph.camera as any;
            const orbitController = cameraManager.activeCameraController;
            const inputController = cameraManager.activeInputHandler;

            assert.isDefined(orbitController, "Orbit camera controller should be defined");
            assert.isDefined(inputController, "Input controller should be defined");

            const initialDistance = orbitController.cameraDistance;

            const {canvas} = graph;

            // 3D mode uses S key for zoom out (increase distance)
            canvas.dispatchEvent(new KeyboardEvent("keydown", {key: "s", bubbles: true}));
            inputController.update();

            assert.isAbove(
                orbitController.cameraDistance,
                initialDistance,
                "S key should zoom out (increase camera distance)",
            );

            canvas.dispatchEvent(new KeyboardEvent("keyup", {key: "s", bubbles: true}));
        });
    });

    describe("Node Interaction", () => {
        beforeEach(async() => {
            container = document.createElement("div");
            container.style.width = "800px";
            container.style.height = "600px";
            document.body.appendChild(container);

            graph = new Graph(container);
            await graph.init();

            // Set up 3D mode
            await graph.setStyleTemplate(createStyleTemplate(false));
            await graph.addNodes(TEST_NODES);
            await graph.addEdges(TEST_EDGES);
            await graph.operationQueue.waitForCompletion();

            // Wait for rendering to stabilize
            await new Promise((resolve) => setTimeout(resolve, 100));
        });

        afterEach(() => {
            graph.dispose();
            document.body.removeChild(container);
        });

        test("canvas has tabindex for keyboard focus", () => {
            const {canvas} = graph;
            // Canvas should have tabindex attribute for keyboard focus
            assert.equal(canvas.getAttribute("tabindex"), "0", "Canvas should have tabindex='0' for focus");
        });

        test("pointer down triggers canvas focus", () => {
            const {canvas} = graph;

            // Mock focus method
            const focusSpy = vi.spyOn(canvas, "focus").mockImplementation(() => undefined);

            // 3D mode uses direct canvas events for pointer handling
            canvas.dispatchEvent(new PointerEvent("pointerdown", {
                clientX: 400,
                clientY: 300,
                button: 0,
                bubbles: true,
            }));

            // Canvas should have been focused
            assert.isAbove(focusSpy.mock.calls.length, 0, "Canvas should be focused on pointer down");
        });
    });
});
