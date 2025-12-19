/**
 * 3D Input Direction Verification Tests
 *
 * These tests verify that input directions map to expected output directions
 * in 3D camera mode. They are critical for catching direction-related regressions.
 */

import {assert} from "chai";
import {afterEach, beforeEach, describe, test, vi} from "vitest";

import type {OrbitCameraController} from "../../../src/cameras/OrbitCameraController";
import type {OrbitInputController} from "../../../src/cameras/OrbitInputController";
import type {Graph} from "../../../src/Graph";
import {
    setupTestGraph,
    teardownTestGraph,
} from "../helpers/interaction-helpers";

/**
 * Helper to get the 3D camera controller and input controller from a graph
 */
function get3DControllers(graph: Graph): {
    cameraController: OrbitCameraController;
    inputController: OrbitInputController;
} {
    const controller = graph.camera.getActiveController() as OrbitCameraController;
    // Access input controller via the camera manager's internal inputs map
    const {inputs} = graph.camera as unknown as {
        inputs: Map<string, OrbitInputController>;
    };
    const maybeInput = inputs.get("orbit");
    if (!maybeInput) {
        throw new Error("3D (orbit) input controller not found");
    }

    return {cameraController: controller, inputController: maybeInput};
}

/**
 * Helper to simulate keyboard key state
 */
function setKeyState(inputController: OrbitInputController, key: string, pressed: boolean): void {
    // Access private keysDown via type assertion
    // Note: Keys are stored in lowercase in OrbitInputController
    const controller = inputController as unknown as {
        keysDown: Record<string, boolean>;
    };
    controller.keysDown[key.toLowerCase()] = pressed;
}

/**
 * Helper to run multiple update frames
 */
function runUpdateFrames(inputController: OrbitInputController, frames: number): void {
    for (let i = 0; i < frames; i++) {
        inputController.update();
    }
}

/**
 * Helper to get pivot rotation (yaw/pitch) from the orbit camera controller
 */
function getPivotRotation(cameraController: OrbitCameraController): {yaw: number, pitch: number, roll: number} {
    const {pivot} = cameraController;
    if (!pivot.rotationQuaternion) {
        return {yaw: pivot.rotation.y, pitch: pivot.rotation.x, roll: pivot.rotation.z};
    }

    // Convert quaternion to Euler angles
    const euler = pivot.rotationQuaternion.toEulerAngles();
    return {
        yaw: euler.y,
        pitch: euler.x,
        roll: euler.z,
    };
}

describe("3D Input Direction Verification", () => {
    let graph: Graph;

    beforeEach(async() => {
        graph = await setupTestGraph({mode: "3d"});
    });

    afterEach(() => {
        vi.restoreAllMocks();
        teardownTestGraph(graph);
    });

    test("ArrowLeft rotates camera LEFT (increases yaw)", () => {
        const {cameraController, inputController} = get3DControllers(graph);

        // Record initial pivot rotation
        const initialRotation = getPivotRotation(cameraController);

        // Simulate ArrowLeft key press
        setKeyState(inputController, "arrowleft", true);

        // Run several update frames
        runUpdateFrames(inputController, 10);

        // Get final rotation
        const finalRotation = getPivotRotation(cameraController);

        // Looking at OrbitInputController.ts lines 143-144:
        // if (keys.arrowleft) { this.rotationVelocityY += this.config.keyboardRotationSpeed; }
        // Then at lines 180-182:
        // if (Math.abs(this.rotationVelocityY) > 0.00001) {
        //     cam.rotate(-this.rotationVelocityY / this.config.trackballRotationSpeed, 0);
        // So ArrowLeft adds positive velocityY, then rotate is called with -velocityY
        // This causes negative dx to rotate(), which via PivotController should increase yaw (turn left)
        assert.isAbove(
            finalRotation.yaw,
            initialRotation.yaw,
            "ArrowLeft should rotate camera LEFT (increase yaw)",
        );
    });

    test("ArrowRight rotates camera RIGHT (decreases yaw)", () => {
        const {cameraController, inputController} = get3DControllers(graph);

        // Record initial pivot rotation
        const initialRotation = getPivotRotation(cameraController);

        // Simulate ArrowRight key press
        setKeyState(inputController, "arrowright", true);

        // Run several update frames
        runUpdateFrames(inputController, 10);

        // Get final rotation
        const finalRotation = getPivotRotation(cameraController);

        // Looking at OrbitInputController.ts lines 147-148:
        // if (keys.arrowright) { this.rotationVelocityY -= this.config.keyboardRotationSpeed; }
        // Then rotate(-velocityY, 0) = rotate(positive, 0) = positive dx = turn right = decrease yaw
        assert.isBelow(
            finalRotation.yaw,
            initialRotation.yaw,
            "ArrowRight should rotate camera RIGHT (decrease yaw)",
        );
    });

    test("ArrowUp tilts camera UP", () => {
        const {cameraController, inputController} = get3DControllers(graph);

        // Record initial pivot rotation
        const initialRotation = getPivotRotation(cameraController);

        // Simulate ArrowUp key press
        setKeyState(inputController, "arrowup", true);

        // Run several update frames
        runUpdateFrames(inputController, 10);

        // Get final rotation
        const finalRotation = getPivotRotation(cameraController);

        // Looking at OrbitInputController.ts lines 151-152:
        // if (keys.arrowup) { this.rotationVelocityX += this.config.keyboardRotationSpeed; }
        // Then at lines 175-177:
        // cam.rotate(0, -this.rotationVelocityX / this.config.trackballRotationSpeed);
        // So ArrowUp adds positive velocityX, then rotate is called with -velocityX = negative dy
        // Negative dy to OrbitCameraController.rotate means tilt up (looking up)
        // This should result in pitch change
        assert.notEqual(
            finalRotation.pitch,
            initialRotation.pitch,
            "ArrowUp should tilt camera UP (change pitch)",
        );
    });

    test("ArrowDown tilts camera DOWN", () => {
        const {cameraController, inputController} = get3DControllers(graph);

        // Record initial pivot rotation
        const initialRotation = getPivotRotation(cameraController);

        // Simulate ArrowDown key press
        setKeyState(inputController, "arrowdown", true);

        // Run several update frames
        runUpdateFrames(inputController, 10);

        // Get final rotation
        const finalRotation = getPivotRotation(cameraController);

        // Looking at OrbitInputController.ts lines 155-156:
        // if (keys.arrowdown) { this.rotationVelocityX -= this.config.keyboardRotationSpeed; }
        // Then rotate(0, -velocityX) = rotate(0, positive) = positive dy = tilt down
        assert.notEqual(
            finalRotation.pitch,
            initialRotation.pitch,
            "ArrowDown should tilt camera DOWN (change pitch)",
        );
    });

    test("W key zooms IN (decreases camera distance)", () => {
        const {cameraController, inputController} = get3DControllers(graph);

        // Record initial camera distance
        const initialDistance = cameraController.cameraDistance;

        // Simulate W key press
        setKeyState(inputController, "w", true);

        // Run several update frames
        runUpdateFrames(inputController, 10);

        // Get final distance
        const finalDistance = cameraController.cameraDistance;

        // Looking at OrbitInputController.ts lines 159-160:
        // if (keys.w) { cam.zoom(-this.config.keyboardZoomSpeed); }
        // zoom() with negative delta decreases cameraDistance = zoom in
        assert.isBelow(
            finalDistance,
            initialDistance,
            "W key should zoom IN (decrease camera distance)",
        );
    });

    test("S key zooms OUT (increases camera distance)", () => {
        const {cameraController, inputController} = get3DControllers(graph);

        // Record initial camera distance
        const initialDistance = cameraController.cameraDistance;

        // Simulate S key press
        setKeyState(inputController, "s", true);

        // Run several update frames
        runUpdateFrames(inputController, 10);

        // Get final distance
        const finalDistance = cameraController.cameraDistance;

        // Looking at OrbitInputController.ts lines 163-164:
        // if (keys.s) { cam.zoom(this.config.keyboardZoomSpeed); }
        // zoom() with positive delta increases cameraDistance = zoom out
        assert.isAbove(
            finalDistance,
            initialDistance,
            "S key should zoom OUT (increase camera distance)",
        );
    });

    test("A key spins camera LEFT (yaw rotation)", () => {
        const {cameraController, inputController} = get3DControllers(graph);

        // Record initial pivot rotation
        const initialRotation = getPivotRotation(cameraController);

        // Simulate A key press
        setKeyState(inputController, "a", true);

        // Run several update frames
        runUpdateFrames(inputController, 10);

        // Get final rotation
        const finalRotation = getPivotRotation(cameraController);

        // Looking at OrbitInputController.ts lines 167-168:
        // if (keys.a) { cam.spin(this.config.keyboardYawSpeed); }
        // spin() with positive delta spins left (positive roll/z rotation)
        assert.isAbove(
            finalRotation.roll,
            initialRotation.roll,
            "A key should spin camera LEFT (increase roll)",
        );
    });

    test("D key spins camera RIGHT (yaw rotation)", () => {
        const {cameraController, inputController} = get3DControllers(graph);

        // Record initial pivot rotation
        const initialRotation = getPivotRotation(cameraController);

        // Simulate D key press
        setKeyState(inputController, "d", true);

        // Run several update frames
        runUpdateFrames(inputController, 10);

        // Get final rotation
        const finalRotation = getPivotRotation(cameraController);

        // Looking at OrbitInputController.ts lines 171-172:
        // if (keys.d) { cam.spin(-this.config.keyboardYawSpeed); }
        // spin() with negative delta spins right (negative roll/z rotation)
        assert.isBelow(
            finalRotation.roll,
            initialRotation.roll,
            "D key should spin camera RIGHT (decrease roll)",
        );
    });

    test("mouse drag RIGHT rotates camera RIGHT", () => {
        const {cameraController} = get3DControllers(graph);

        // Record initial pivot rotation
        const initialRotation = getPivotRotation(cameraController);

        // Simulate mouse drag to the RIGHT (positive dx)
        // Looking at OrbitInputController.ts line 43:
        // this.controller.rotate(dx, dy);
        // And in OrbitCameraController.ts lines 62-65:
        // this.pivotController.rotate(-dx * trackballRotationSpeed, -dy * trackballRotationSpeed);
        // So dx > 0 means rotate with -dx*speed = negative yaw delta = turn right
        const dx = 50;
        cameraController.rotate(dx, 0);

        // Get final rotation
        const finalRotation = getPivotRotation(cameraController);

        // Drag RIGHT should rotate camera RIGHT (decrease yaw)
        assert.isBelow(
            finalRotation.yaw,
            initialRotation.yaw,
            "Mouse drag RIGHT should rotate camera RIGHT (decrease yaw)",
        );
    });

    test("mouse drag DOWN tilts camera DOWN", () => {
        const {cameraController} = get3DControllers(graph);

        // Record initial pivot rotation
        const initialRotation = getPivotRotation(cameraController);

        // Simulate mouse drag DOWN (positive dy in screen coords)
        const dy = 50;
        cameraController.rotate(0, dy);

        // Get final rotation
        const finalRotation = getPivotRotation(cameraController);

        // Drag DOWN should tilt camera DOWN (looking down)
        assert.notEqual(
            finalRotation.pitch,
            initialRotation.pitch,
            "Mouse drag DOWN should tilt camera DOWN (change pitch)",
        );
    });

    test("pinch spread zooms IN (smaller camera distance)", () => {
        const {cameraController} = get3DControllers(graph);

        // Record initial camera distance
        const initialDistance = cameraController.cameraDistance;

        // Simulate pinch spread (scale increases, which maps to negative zoom delta)
        // Looking at OrbitInputController.ts lines 84-85:
        // const scaleDelta = ev.scale - lastScale;
        // this.controller.zoom(-scaleDelta * this.config.pinchZoomSensitivity);
        // If scale increases by 0.5 (spread), scaleDelta = 0.5, zoom(-0.5 * sensitivity)
        // zoom() with negative delta decreases distance = zoom in
        const scaleDelta = 0.5; // spread
        const pinchSensitivity = 10; // typical sensitivity
        cameraController.zoom(-scaleDelta * pinchSensitivity);

        // Get final distance
        const finalDistance = cameraController.cameraDistance;

        // Pinch spread should zoom IN (decrease distance)
        assert.isBelow(
            finalDistance,
            initialDistance,
            "Pinch spread should zoom IN (decrease camera distance)",
        );
    });

    test("pinch squeeze zooms OUT (larger camera distance)", () => {
        const {cameraController} = get3DControllers(graph);

        // Record initial camera distance
        const initialDistance = cameraController.cameraDistance;

        // Simulate pinch squeeze (scale decreases, which maps to positive zoom delta)
        const scaleDelta = -0.5; // squeeze
        const pinchSensitivity = 10;
        cameraController.zoom(-scaleDelta * pinchSensitivity);

        // Get final distance
        const finalDistance = cameraController.cameraDistance;

        // Pinch squeeze should zoom OUT (increase distance)
        assert.isAbove(
            finalDistance,
            initialDistance,
            "Pinch squeeze should zoom OUT (increase camera distance)",
        );
    });

    test("two-finger rotate clockwise spins camera CW", () => {
        const {cameraController} = get3DControllers(graph);

        // Record initial pivot rotation
        const initialRotation = getPivotRotation(cameraController);

        // Simulate two-finger rotate clockwise (rotation increases)
        // Looking at OrbitInputController.ts lines 88-89:
        // const rotationDelta = (ev.rotation - lastRotation) * (Math.PI / 180) * this.config.twistYawSensitivity;
        // this.controller.spin(rotationDelta);
        // Clockwise rotation = positive rotationDelta
        const rotationDelta = Math.PI / 4; // 45 degrees CW
        cameraController.spin(rotationDelta);

        // Get final rotation
        const finalRotation = getPivotRotation(cameraController);

        // Two-finger CW should spin camera CW (positive roll)
        assert.isAbove(
            finalRotation.roll,
            initialRotation.roll,
            "Two-finger rotate CW should spin camera CW (increase roll)",
        );
    });
});
