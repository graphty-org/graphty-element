import {PointerEventTypes, Vector3} from "@babylonjs/core";
import {afterEach, assert, beforeEach, describe, test, vi} from "vitest";

import {TwoDCameraController} from "../../src/cameras/TwoDCameraController";
import {InputController} from "../../src/cameras/TwoDInputController";
import {Graph} from "../../src/Graph";
import {cleanupTestGraph, createTestGraph} from "../helpers/testSetup";

describe("2D Camera Controls", () => {
    let graph: Graph;
    let cameraController: TwoDCameraController;
    let inputController: InputController;

    beforeEach(async() => {
        // Create test graph
        graph = await createTestGraph();

        // Switch to 2D mode using proper template format
        await graph.setStyleTemplate({
            graphtyTemplate: true,
            majorVersion: "1",
            graph: {
                twoD: true,
                background: {backgroundType: "color", color: "#f0f0f0"},
                addDefaultStyle: true,
            },
        });

        // Wait for camera to be activated
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Get the camera controller
        const cameraManager = graph.camera;
        cameraController = cameraManager.activeCameraController as TwoDCameraController;
        assert.isDefined(cameraController, "Camera controller should be defined after switching to 2D mode");

        // Access the input controller through camera manager
        inputController = cameraManager.activeInputHandler as InputController;
        assert.isDefined(inputController, "Input controller should be defined");
    });

    afterEach(() => {
        cleanupTestGraph(graph);
    });

    test("mouse pan updates camera position", () => {
        const initialPos = new Vector3(
            cameraController.camera.position.x,
            cameraController.camera.position.y,
            cameraController.camera.position.z,
        );

        // Simulate mouse pan via scene observables
        const scene = graph.getScene();

        // Pointer down
        scene.onPointerObservable.notifyObservers({
            type: PointerEventTypes.POINTERDOWN,
            event: {
                clientX: 100,
                clientY: 100,
                buttons: 1,
                button: 0,
            } as PointerEvent,
        } as any);

        // Pointer move (drag)
        scene.onPointerObservable.notifyObservers({
            type: PointerEventTypes.POINTERMOVE,
            event: {
                clientX: 200,
                clientY: 150,
                buttons: 1,
                button: 0,
            } as PointerEvent,
        } as any);

        // Pointer up
        scene.onPointerObservable.notifyObservers({
            type: PointerEventTypes.POINTERUP,
            event: {
                clientX: 200,
                clientY: 150,
                buttons: 0,
                button: 0,
            } as PointerEvent,
        } as any);

        // Camera position should have changed
        assert.notEqual(cameraController.camera.position.x, initialPos.x);
        assert.notEqual(cameraController.camera.position.y, initialPos.y);
    });

    test("keyboard WASD controls update velocity", () => {
        const {canvas} = graph;

        // Reset velocity before each test
        cameraController.velocity = {x: 0, y: 0, zoom: 0, rotate: 0};

        // Test W key (up)
        canvas.dispatchEvent(new KeyboardEvent("keydown", {key: "w"}));
        inputController.applyKeyboardInertia();

        assert.isTrue(cameraController.velocity.y > 0, "W key should increase Y velocity");

        // Reset and test S key (down)
        cameraController.velocity = {x: 0, y: 0, zoom: 0, rotate: 0};
        canvas.dispatchEvent(new KeyboardEvent("keyup", {key: "w"}));
        canvas.dispatchEvent(new KeyboardEvent("keydown", {key: "s"}));
        inputController.applyKeyboardInertia();

        assert.isTrue(cameraController.velocity.y < 0, "S key should decrease Y velocity");

        // Reset and test A key (left)
        cameraController.velocity = {x: 0, y: 0, zoom: 0, rotate: 0};
        canvas.dispatchEvent(new KeyboardEvent("keyup", {key: "s"}));
        canvas.dispatchEvent(new KeyboardEvent("keydown", {key: "a"}));
        inputController.applyKeyboardInertia();

        assert.isTrue(cameraController.velocity.x < 0, "A key should decrease X velocity");

        // Reset and test D key (right)
        cameraController.velocity = {x: 0, y: 0, zoom: 0, rotate: 0};
        canvas.dispatchEvent(new KeyboardEvent("keyup", {key: "a"}));
        canvas.dispatchEvent(new KeyboardEvent("keydown", {key: "d"}));
        inputController.applyKeyboardInertia();

        assert.isTrue(cameraController.velocity.x > 0, "D key should increase X velocity");
    });

    test("keyboard arrow keys work like WASD", () => {
        const {canvas} = graph;

        // Reset velocity before each test
        cameraController.velocity = {x: 0, y: 0, zoom: 0, rotate: 0};

        // Test Arrow Up (like W)
        canvas.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowUp"}));
        inputController.applyKeyboardInertia();

        assert.isTrue(cameraController.velocity.y > 0, "Arrow Up should increase Y velocity");

        // Reset and test Arrow Down (like S)
        cameraController.velocity = {x: 0, y: 0, zoom: 0, rotate: 0};
        canvas.dispatchEvent(new KeyboardEvent("keyup", {key: "ArrowUp"}));
        canvas.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowDown"}));
        inputController.applyKeyboardInertia();

        assert.isTrue(cameraController.velocity.y < 0, "Arrow Down should decrease Y velocity");

        // Reset and test Arrow Left (like A)
        cameraController.velocity = {x: 0, y: 0, zoom: 0, rotate: 0};
        canvas.dispatchEvent(new KeyboardEvent("keyup", {key: "ArrowDown"}));
        canvas.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowLeft"}));
        inputController.applyKeyboardInertia();

        assert.isTrue(cameraController.velocity.x < 0, "Arrow Left should decrease X velocity");

        // Reset and test Arrow Right (like D)
        cameraController.velocity = {x: 0, y: 0, zoom: 0, rotate: 0};
        canvas.dispatchEvent(new KeyboardEvent("keyup", {key: "ArrowLeft"}));
        canvas.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowRight"}));
        inputController.applyKeyboardInertia();

        assert.isTrue(cameraController.velocity.x > 0, "Arrow Right should increase X velocity");
    });

    test("keyboard zoom controls update zoom velocity", () => {
        const {canvas} = graph;

        // Reset velocity before each test
        cameraController.velocity = {x: 0, y: 0, zoom: 0, rotate: 0};

        // Test + key (zoom in)
        canvas.dispatchEvent(new KeyboardEvent("keydown", {key: "+"}));
        inputController.applyKeyboardInertia();

        assert.isTrue(cameraController.velocity.zoom < 0, "+ key should decrease zoom velocity (zoom in)");

        // Reset and test = key (alternative zoom in)
        cameraController.velocity = {x: 0, y: 0, zoom: 0, rotate: 0};
        canvas.dispatchEvent(new KeyboardEvent("keyup", {key: "+"}));
        canvas.dispatchEvent(new KeyboardEvent("keydown", {key: "="}));
        inputController.applyKeyboardInertia();

        assert.isTrue(cameraController.velocity.zoom < 0, "= key should decrease zoom velocity (zoom in)");

        // Reset and test - key (zoom out)
        cameraController.velocity = {x: 0, y: 0, zoom: 0, rotate: 0};
        canvas.dispatchEvent(new KeyboardEvent("keyup", {key: "="}));
        canvas.dispatchEvent(new KeyboardEvent("keydown", {key: "-"}));
        inputController.applyKeyboardInertia();

        assert.isTrue(cameraController.velocity.zoom > 0, "- key should increase zoom velocity (zoom out)");
    });

    test("keyboard rotation controls Q/E update rotate velocity", () => {
        const {canvas} = graph;

        // Reset velocity before each test
        cameraController.velocity = {x: 0, y: 0, zoom: 0, rotate: 0};

        // Test Q key (rotate counter-clockwise)
        canvas.dispatchEvent(new KeyboardEvent("keydown", {key: "q"}));
        inputController.applyKeyboardInertia();

        assert.isTrue(cameraController.velocity.rotate > 0, "Q key should increase rotate velocity");

        // Reset and test E key (rotate clockwise)
        cameraController.velocity = {x: 0, y: 0, zoom: 0, rotate: 0};
        canvas.dispatchEvent(new KeyboardEvent("keyup", {key: "q"}));
        canvas.dispatchEvent(new KeyboardEvent("keydown", {key: "e"}));
        inputController.applyKeyboardInertia();

        assert.isTrue(cameraController.velocity.rotate < 0, "E key should decrease rotate velocity");
    });

    test("mouse wheel zooms camera", () => {
        const scene = graph.getScene();
        const initialOrthoTop = cameraController.camera.orthoTop;
        const initialOrthoBottom = cameraController.camera.orthoBottom;
        const initialZoom = (initialOrthoTop ?? 1) - (initialOrthoBottom ?? -1);

        // Simulate wheel zoom in (negative deltaY)
        scene.onPrePointerObservable.notifyObservers({
            type: PointerEventTypes.POINTERWHEEL,
            event: {
                deltaY: -100,
                preventDefault: vi.fn(),
            } as unknown as WheelEvent,
        } as any, PointerEventTypes.POINTERWHEEL);

        const newZoom = (cameraController.camera.orthoTop ?? 1) - (cameraController.camera.orthoBottom ?? -1);
        assert.isTrue(newZoom < initialZoom, "Negative wheel delta should zoom in (decrease ortho range)");
    });

    test("canvas gains focus on pointer down", () => {
        const {canvas} = graph;
        const scene = graph.getScene();

        // Mock focus method
        const focusSpy = vi.spyOn(canvas, "focus").mockImplementation(() => {});

        // Simulate pointer down
        scene.onPointerObservable.notifyObservers({
            type: PointerEventTypes.POINTERDOWN,
            event: {
                clientX: 100,
                clientY: 100,
                buttons: 1,
                button: 0,
            } as PointerEvent,
        } as any);

        // Canvas should have been focused
        assert.equal(focusSpy.mock.calls.length, 1);
    });

    test("canvas is made focusable with tabindex", () => {
        const {canvas} = graph;

        // Canvas should have tabindex attribute for keyboard focus
        assert.equal(canvas.getAttribute("tabindex"), "0");
    });

    test("input controller can be enabled and disabled", () => {
        assert.isTrue(inputController.enabled, "Input controller should start enabled");

        inputController.disable();
        assert.isFalse(inputController.enabled, "Input controller should be disabled");

        inputController.enable();
        assert.isTrue(inputController.enabled, "Input controller should be re-enabled");
    });

    test("keyboard input has no effect when disabled", () => {
        const {canvas} = graph;

        // Disable input controller
        inputController.disable();

        // Try keyboard input
        canvas.dispatchEvent(new KeyboardEvent("keydown", {key: "w"}));
        inputController.applyKeyboardInertia();

        // Velocity should remain zero
        assert.equal(cameraController.velocity.y, 0, "Keyboard input should have no effect when disabled");
    });

    test("velocity components start at zero", () => {
        assert.equal(cameraController.velocity.x, 0);
        assert.equal(cameraController.velocity.y, 0);
        assert.equal(cameraController.velocity.zoom, 0);
        assert.equal(cameraController.velocity.rotate, 0);
    });
});
