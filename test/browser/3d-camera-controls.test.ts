import {} from "@babylonjs/core";
import {afterEach, assert, beforeEach, describe, test, vi} from "vitest";

import {OrbitCameraController} from "../../src/cameras/OrbitCameraController";
import {OrbitInputController} from "../../src/cameras/OrbitInputController";
import {Graph} from "../../src/Graph";
import {cleanupTestGraph, createTestGraph} from "../helpers/testSetup";

// Type for accessing private properties in tests

describe("3D Camera Controls", () => {
    let graph: Graph;
    let cameraController: OrbitCameraController;
    let inputController: OrbitInputController;

    beforeEach(async() => {
        // Create test graph
        graph = await createTestGraph();

        // Switch to 3D mode using proper template format
        await graph.setStyleTemplate({
            graphtyTemplate: true,
            majorVersion: "1",
            graph: {
                twoD: false, // 3D mode
                background: {backgroundType: "color", color: "#f0f0f0"},
                addDefaultStyle: true,
                startingCameraDistance: 30,
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

        // Wait for camera to be activated
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Get the camera controller
        const cameraManager = graph.camera;
        cameraController = (cameraManager as unknown as {activeCameraController: OrbitCameraController}).activeCameraController;
        assert.isDefined(cameraController, "Camera controller should be defined after switching to 3D mode");

        // Access the input controller through camera manager
        inputController = (cameraManager as unknown as {activeInputHandler: OrbitInputController}).activeInputHandler;
        assert.isDefined(inputController, "Input controller should be defined");

        // Verify input controller is enabled
        assert.isTrue((inputController as any).enabled, "Input controller should be enabled after camera activation");
    });

    afterEach(() => {
        cleanupTestGraph(graph);
    });

    test("mouse drag orbits camera", () => {
        const {canvas} = graph;
        canvas.focus();

        // Test pointer event registration
        canvas.dispatchEvent(new PointerEvent("pointerdown", {
            clientX: 100, clientY: 100, button: 0, bubbles: true,
        }));

        const {isPointerDown} = (inputController as any);
        assert.isTrue(isPointerDown, "Pointer down should be registered");

        // Spy on the rotate method to verify it's called during drag
        const rotateSpy = vi.spyOn(cameraController, "rotate");

        canvas.dispatchEvent(new PointerEvent("pointermove", {
            clientX: 200, clientY: 150, bubbles: true,
        }));

        // Verify rotate was called with the movement delta
        assert.equal(rotateSpy.mock.calls.length, 1, "rotate() should be called once during pointer move");
        const [dx, dy] = rotateSpy.mock.calls[0];
        assert.equal(dx, 100, "dx should be the difference in clientX (200 - 100)");
        assert.equal(dy, 50, "dy should be the difference in clientY (150 - 100)");

        canvas.dispatchEvent(new PointerEvent("pointerup", {
            bubbles: true,
        }));

        const isPointerDownAfter = (inputController as any).isPointerDown;
        assert.isFalse(isPointerDownAfter, "Pointer down should be cleared after pointer up");
    });

    test("arrow keys rotate with velocity", () => {
        const {canvas} = graph;

        // Test arrow left (increase Y rotation velocity)
        canvas.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowLeft"}));
        inputController.update();

        assert.isTrue(inputController.rotationVelocityY > 0, "Arrow Left should increase Y rotation velocity");

        // Reset and test arrow right (decrease Y rotation velocity)
        (inputController as any).rotationVelocityY = 0;
        canvas.dispatchEvent(new KeyboardEvent("keyup", {key: "ArrowLeft"}));
        canvas.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowRight"}));
        inputController.update();

        assert.isTrue(inputController.rotationVelocityY < 0, "Arrow Right should decrease Y rotation velocity");

        // Reset and test arrow up (increase X rotation velocity)
        (inputController as any).rotationVelocityY = 0;
        (inputController as any).rotationVelocityX = 0;
        canvas.dispatchEvent(new KeyboardEvent("keyup", {key: "ArrowRight"}));
        canvas.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowUp"}));
        inputController.update();

        assert.isTrue(inputController.rotationVelocityX > 0, "Arrow Up should increase X rotation velocity");

        // Reset and test arrow down (decrease X rotation velocity)
        (inputController as any).rotationVelocityX = 0;
        canvas.dispatchEvent(new KeyboardEvent("keyup", {key: "ArrowUp"}));
        canvas.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowDown"}));
        inputController.update();

        assert.isTrue(inputController.rotationVelocityX < 0, "Arrow Down should decrease X rotation velocity");
    });

    test("WASD keys control camera movement", () => {
        const {canvas} = graph;
        const initialDistance = cameraController.cameraDistance;

        // Test W key (zoom in)
        canvas.dispatchEvent(new KeyboardEvent("keydown", {key: "w"}));
        inputController.update();

        assert.isTrue(cameraController.cameraDistance < initialDistance, "W key should zoom in (decrease distance)");

        // Reset and test S key (zoom out)
        cameraController.cameraDistance = initialDistance;
        canvas.dispatchEvent(new KeyboardEvent("keyup", {key: "w"}));
        canvas.dispatchEvent(new KeyboardEvent("keydown", {key: "s"}));
        inputController.update();

        assert.isTrue(cameraController.cameraDistance > initialDistance, "S key should zoom out (increase distance)");
    });

    test("AD keys control yaw (spin)", () => {
        const {canvas} = graph;
        canvas.focus();

        // Test A key registration and spin method call
        canvas.dispatchEvent(new KeyboardEvent("keydown", {key: "a", bubbles: true}));

        const {keysDown} = (inputController as any);
        assert.isTrue(keysDown.a === true, "A key should be registered as down");

        // Spy on the spin method to verify it's called
        const spinSpy = vi.spyOn(cameraController, "spin");
        inputController.update();

        // Verify spin was called with the expected value
        assert.equal(spinSpy.mock.calls.length, 1, "spin() should be called once when A key is pressed");
        assert.equal(spinSpy.mock.calls[0][0], cameraController.config.keyboardYawSpeed, "spin() should be called with keyboardYawSpeed");

        // Test D key
        canvas.dispatchEvent(new KeyboardEvent("keyup", {key: "a", bubbles: true}));
        canvas.dispatchEvent(new KeyboardEvent("keydown", {key: "d", bubbles: true}));

        assert.isTrue(keysDown.d === true, "D key should be registered as down");

        spinSpy.mockClear();
        inputController.update();

        // Verify spin was called with negative value for D key
        assert.equal(spinSpy.mock.calls.length, 1, "spin() should be called once when D key is pressed");
        assert.equal(spinSpy.mock.calls[0][0], -cameraController.config.keyboardYawSpeed, "spin() should be called with negative keyboardYawSpeed for D key");

        canvas.dispatchEvent(new KeyboardEvent("keyup", {key: "d", bubbles: true}));
    });

    test("keyboard controls have inertia damping", () => {
        const {canvas} = graph;

        // Start rotation
        canvas.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowLeft"}));
        inputController.update();

        const initialVelocity = inputController.rotationVelocityY;
        assert.isTrue(initialVelocity > 0, "Should have positive rotation velocity");

        // Stop input but keep updating (inertia should reduce velocity)
        canvas.dispatchEvent(new KeyboardEvent("keyup", {key: "ArrowLeft"}));
        inputController.update();

        const dampedVelocity = inputController.rotationVelocityY;
        assert.isTrue(dampedVelocity < initialVelocity, "Velocity should be damped when key is released");
        assert.isTrue(dampedVelocity > 0, "Some velocity should remain due to inertia");
    });

    test("canvas gains focus on pointer down", () => {
        const {canvas} = graph;

        // Mock focus method
        const focusSpy = vi.spyOn(canvas, "focus").mockImplementation(() => undefined);

        // Simulate pointer down
        canvas.dispatchEvent(new PointerEvent("pointerdown", {
            clientX: 100, clientY: 100, button: 0,
        }));

        // Canvas should have been focused (may be called multiple times due to event handling)
        assert.isTrue(focusSpy.mock.calls.length >= 1, "Canvas focus should be called at least once");
    });

    test("canvas is made focusable with tabindex", () => {
        const {canvas} = graph;

        // Canvas should have tabindex attribute for keyboard focus
        assert.equal(canvas.getAttribute("tabindex"), "0");
    });

    test("input controller can be enabled and disabled", () => {
        assert.isTrue((inputController as any).enabled, "Input controller should start enabled");

        inputController.disable();
        assert.isFalse((inputController as any).enabled, "Input controller should be disabled");

        // Test that keyboard input has no effect when disabled
        const {canvas} = graph;
        canvas.focus();

        canvas.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowLeft", bubbles: true}));
        inputController.update();

        // When disabled, rotationVelocityY should not increase from arrow key
        assert.equal(inputController.rotationVelocityY, 0, "Rotation velocity should remain zero when input is disabled");

        inputController.enable();
        assert.isTrue((inputController as any).enabled, "Input controller should be re-enabled");

        // Should work again when re-enabled
        canvas.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowLeft", bubbles: true}));
        inputController.update();

        assert.isTrue(inputController.rotationVelocityY > 0, "Rotation velocity should increase when input is re-enabled");
    });

    test("multi-touch prevents mouse orbit", () => {
        const {canvas} = graph;
        const initialPivotRotation = {
            x: cameraController.pivot.rotation.x,
            y: cameraController.pivot.rotation.y,
            z: cameraController.pivot.rotation.z,
        };

        // Simulate multi-touch state
        (inputController as any).isMultiTouch = true;

        // Try mouse movement - should not affect camera
        canvas.dispatchEvent(new PointerEvent("pointerdown", {
            clientX: 100, clientY: 100, button: 0,
        }));

        canvas.dispatchEvent(new PointerEvent("pointermove", {
            clientX: 200, clientY: 150,
        }));

        canvas.dispatchEvent(new PointerEvent("pointerup"));

        // Pivot should not have moved due to multi-touch state
        const finalPivotRotation = {
            x: cameraController.pivot.rotation.x,
            y: cameraController.pivot.rotation.y,
            z: cameraController.pivot.rotation.z,
        };

        const rotationUnchanged =
            finalPivotRotation.x === initialPivotRotation.x &&
            finalPivotRotation.y === initialPivotRotation.y &&
            finalPivotRotation.z === initialPivotRotation.z;

        assert.isTrue(rotationUnchanged, "Pivot should not orbit during multi-touch");
    });

    test("rotation velocity properties are accessible", () => {
        // These properties are used internally and should be accessible for testing
        assert.isDefined(inputController.rotationVelocityX, "rotationVelocityX should be accessible");
        assert.isDefined(inputController.rotationVelocityY, "rotationVelocityY should be accessible");

        // Initial values should be zero
        assert.equal(inputController.rotationVelocityX, 0, "Initial X rotation velocity should be zero");
        assert.equal(inputController.rotationVelocityY, 0, "Initial Y rotation velocity should be zero");
    });

    test("camera position updates on rotation", () => {
        const {canvas} = graph;
        canvas.focus();

        // Test that updateCameraPosition is called during the input controller update
        const updateSpy = vi.spyOn(cameraController, "updateCameraPosition");

        // Apply keyboard rotation (ArrowLeft increases rotationVelocityY)
        canvas.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowLeft", bubbles: true}));
        inputController.update();

        // updateCameraPosition should be called during the update cycle
        assert.isTrue(updateSpy.mock.calls.length >= 1, "updateCameraPosition should be called during input controller update");

        // Verify the camera is properly parented to the pivot
        assert.equal(cameraController.camera.parent, cameraController.pivot, "Camera should be parented to the pivot");
    });

    test("update method applies rotation velocity", () => {
        // Ensure input controller is enabled
        assert.isTrue((inputController as any).enabled, "Input controller should be enabled");

        // Manually set rotation velocity (these are private fields accessed for testing)
        (inputController as any).rotationVelocityX = 0.1;
        (inputController as any).rotationVelocityY = 0.1;

        // Spy on the rotate method to verify it's called with the velocity values
        const rotateSpy = vi.spyOn(cameraController, "rotate");

        // Update should apply the velocity
        inputController.update();

        // Verify rotate was called twice (once for X, once for Y velocity)
        assert.equal(rotateSpy.mock.calls.length, 2, "rotate() should be called twice for X and Y velocity");

        // Check the velocity was applied and damped
        const finalVelocityX = (inputController as any).rotationVelocityX;
        const finalVelocityY = (inputController as any).rotationVelocityY;

        assert.isTrue(finalVelocityX < 0.1, "Rotation velocity X should be damped after update");
        assert.isTrue(finalVelocityY < 0.1, "Rotation velocity Y should be damped after update");
        assert.isTrue(finalVelocityX > 0, "Rotation velocity X should still be positive due to inertia");
        assert.isTrue(finalVelocityY > 0, "Rotation velocity Y should still be positive due to inertia");
    });
});
