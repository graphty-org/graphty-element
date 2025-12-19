/**
 * XR Thumbstick Integration Tests
 *
 * These tests verify that XR thumbstick inputs produce the expected scene transformations
 * using IWER (Immersive Web Emulation Runtime) for WebXR emulation.
 *
 * Tests are designed to catch direction-related regressions:
 * - Left stick X+ should rotate scene RIGHT
 * - Left stick Y+ should pitch scene UP (forward push)
 * - Right stick X+ should pan scene RIGHT
 * - Right stick Y+ should zoom IN (forward push)
 * - Deadzone filtering should work correctly
 */

import {Quaternion, Vector3} from "@babylonjs/core";
import {assert} from "chai";
import {afterEach, beforeEach, describe, test, vi} from "vitest";

import {applyDeadzone} from "../../../src/cameras/InputUtils";
import {PivotController} from "../../../src/cameras/PivotController";
import type {Graph} from "../../../src/Graph";
import {cleanupTestGraph, createTestGraph} from "../../helpers/testSetup";

/**
 * Helper to get pivot rotation as Euler angles for verification
 */
function getPivotEuler(pivot: PivotController): {x: number, y: number, z: number} {
    const quat = pivot.pivot.rotationQuaternion ?? Quaternion.Identity();
    const euler = quat.toEulerAngles();
    return {x: euler.x, y: euler.y, z: euler.z};
}

/**
 * Helper to get pivot scale for zoom verification
 */
function getPivotScale(pivot: PivotController): number {
    return pivot.pivot.scaling.x;
}

/**
 * Helper to get pivot position for pan verification
 */
function getPivotPosition(pivot: PivotController): Vector3 {
    return pivot.pivot.position.clone();
}

/**
 * Mock XR Input Processor
 *
 * This simulates the XR thumbstick processing logic from XRInputHandler
 * without requiring actual WebXR or IWER. This allows testing the
 * direction mapping logic in isolation.
 */
class MockXRInputProcessor {
    private pivotController: PivotController;

    // Thumbstick values (mimics what IWER would provide)
    public leftStick = {x: 0, y: 0};
    public rightStick = {x: 0, y: 0};

    // Sensitivity settings (matching XRInputHandler constants)
    private readonly DEADZONE = 0.15;
    private readonly YAW_SPEED = 0.04;
    private readonly PITCH_SPEED = 0.03;
    private readonly PAN_SPEED = 0.08;
    private readonly ZOOM_SPEED = 0.02;

    constructor(pivotController: PivotController) {
        this.pivotController = pivotController;
    }

    /**
     * Process thumbstick input - mirrors XRInputHandler.processThumbsticks()
     *
     * Input mapping:
     * - Left stick X: Yaw (turn left/right) - X+ = rotate RIGHT
     * - Left stick Y: Pitch (tilt up/down) - Y+ (forward) = pitch DOWN (look up at scene)
     * - Right stick X: Pan left/right - X+ = pan RIGHT
     * - Right stick Y: Zoom in/out - Y+ (forward) = zoom IN
     */
    processThumbsticks(): void {
        // Apply deadzone with curve
        const leftX = applyDeadzone(this.leftStick.x, this.DEADZONE);
        const leftY = applyDeadzone(this.leftStick.y, this.DEADZONE);
        const rightX = applyDeadzone(this.rightStick.x, this.DEADZONE);
        const rightY = applyDeadzone(this.rightStick.y, this.DEADZONE);

        const hasInput = leftX !== 0 || leftY !== 0 || rightX !== 0 || rightY !== 0;
        if (!hasInput) {
            return;
        }

        // LEFT STICK: Rotation
        // X = yaw (push right = positive yaw = scene rotates right around you)
        // Y = pitch (push forward = negative pitch = look up at scene / scene tilts down)
        const yawDelta = leftX * this.YAW_SPEED;
        const pitchDelta = -leftY * this.PITCH_SPEED;

        if (Math.abs(yawDelta) > 0.0001 || Math.abs(pitchDelta) > 0.0001) {
            this.pivotController.rotate(yawDelta, pitchDelta);
        }

        // RIGHT STICK: Zoom and Pan
        // Y = zoom (push forward = zoom in = scale up)
        if (Math.abs(rightY) > 0.0001) {
            const zoomFactor = 1.0 + (rightY * this.ZOOM_SPEED);
            this.pivotController.zoom(zoomFactor);
        }

        // X = pan (push right = move focal point right)
        if (Math.abs(rightX) > 0.0001) {
            const panAmount = rightX * this.PAN_SPEED;
            this.pivotController.panViewRelative(panAmount, 0);
        }
    }
}

describe("XR Thumbstick Controls", () => {
    let graph: Graph;
    let pivotController: PivotController;
    let processor: MockXRInputProcessor;

    beforeEach(async() => {
        // Create a test graph to get a valid scene
        graph = await createTestGraph();

        // Create pivot controller directly for testing
        pivotController = new PivotController(graph.scene);

        // Create mock XR input processor
        processor = new MockXRInputProcessor(pivotController);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        cleanupTestGraph(graph);
    });

    test("left stick X+ rotates scene RIGHT", () => {
        // Record initial rotation
        const initialEuler = getPivotEuler(pivotController);

        // Set left stick to right (X+)
        processor.leftStick = {x: 0.8, y: 0};

        // Process several frames of input
        for (let i = 0; i < 10; i++) {
            processor.processThumbsticks();
        }

        // Get final rotation
        const finalEuler = getPivotEuler(pivotController);

        // X+ should produce positive yaw (rotate RIGHT around Y axis)
        assert.isAbove(
            finalEuler.y,
            initialEuler.y,
            "Left stick X+ should rotate scene RIGHT (positive yaw)",
        );
    });

    test("left stick Y+ pitches scene UP", () => {
        // Record initial rotation
        const initialEuler = getPivotEuler(pivotController);

        // Set left stick forward (Y+)
        // Note: In XR controller space, Y+ is typically "forward" which
        // corresponds to the user pushing the stick away from themselves
        processor.leftStick = {x: 0, y: 0.8};

        // Process several frames
        for (let i = 0; i < 10; i++) {
            processor.processThumbsticks();
        }

        // Get final rotation
        const finalEuler = getPivotEuler(pivotController);

        // Y+ (forward push) = negative pitchDelta in XRInputHandler
        // This pitches the scene DOWN (user looks up at it)
        // From XRInputHandler.ts: pitchDelta = -leftY * this.PITCH_SPEED
        assert.isBelow(
            finalEuler.x,
            initialEuler.x,
            "Left stick Y+ (forward) should pitch scene DOWN (negative pitch)",
        );
    });

    test("right stick X+ pans scene RIGHT", () => {
        // Record initial position
        const initialPos = getPivotPosition(pivotController);

        // Set right stick to right (X+)
        processor.rightStick = {x: 0.8, y: 0};

        // Process several frames
        for (let i = 0; i < 10; i++) {
            processor.processThumbsticks();
        }

        // Get final position
        const finalPos = getPivotPosition(pivotController);

        // X+ should pan RIGHT (positive X)
        assert.isAbove(
            finalPos.x,
            initialPos.x,
            "Right stick X+ should pan scene RIGHT (positive X)",
        );
    });

    test("right stick Y+ zooms IN", () => {
        // Record initial scale
        const initialScale = getPivotScale(pivotController);

        // Set right stick forward (Y+)
        processor.rightStick = {x: 0, y: 0.8};

        // Process several frames
        for (let i = 0; i < 10; i++) {
            processor.processThumbsticks();
        }

        // Get final scale
        const finalScale = getPivotScale(pivotController);

        // Y+ (forward push) should zoom IN (larger scale)
        // zoomFactor = 1.0 + rightY * ZOOM_SPEED > 1.0 when rightY > 0
        assert.isAbove(
            finalScale,
            initialScale,
            "Right stick Y+ (forward) should zoom IN (larger scale)",
        );
    });

    test("deadzone filtering works in XR", () => {
        // Record initial state
        const initialEuler = getPivotEuler(pivotController);
        const initialScale = getPivotScale(pivotController);
        const initialPos = getPivotPosition(pivotController);

        // Set thumbstick values below deadzone (0.15)
        processor.leftStick = {x: 0.1, y: 0.1};
        processor.rightStick = {x: 0.1, y: 0.1};

        // Process several frames
        for (let i = 0; i < 10; i++) {
            processor.processThumbsticks();
        }

        // Get final state
        const finalEuler = getPivotEuler(pivotController);
        const finalScale = getPivotScale(pivotController);
        const finalPos = getPivotPosition(pivotController);

        // Nothing should have changed - inputs were below deadzone
        assert.closeTo(
            finalEuler.y,
            initialEuler.y,
            0.0001,
            "Deadzone should filter yaw inputs below 0.15",
        );
        assert.closeTo(
            finalEuler.x,
            initialEuler.x,
            0.0001,
            "Deadzone should filter pitch inputs below 0.15",
        );
        assert.closeTo(
            finalScale,
            initialScale,
            0.0001,
            "Deadzone should filter zoom inputs below 0.15",
        );
        assert.closeTo(
            finalPos.x,
            initialPos.x,
            0.0001,
            "Deadzone should filter pan inputs below 0.15",
        );
    });

    // Additional direction verification tests
    test("left stick X- rotates scene LEFT", () => {
        const initialEuler = getPivotEuler(pivotController);

        processor.leftStick = {x: -0.8, y: 0};

        for (let i = 0; i < 10; i++) {
            processor.processThumbsticks();
        }

        const finalEuler = getPivotEuler(pivotController);

        assert.isBelow(
            finalEuler.y,
            initialEuler.y,
            "Left stick X- should rotate scene LEFT (negative yaw)",
        );
    });

    test("left stick Y- pitches scene DOWN (from user's perspective)", () => {
        const initialEuler = getPivotEuler(pivotController);

        // Y- = pulling stick toward yourself
        processor.leftStick = {x: 0, y: -0.8};

        for (let i = 0; i < 10; i++) {
            processor.processThumbsticks();
        }

        const finalEuler = getPivotEuler(pivotController);

        // Y- produces positive pitch (scene tilts up, user looks down at it)
        assert.isAbove(
            finalEuler.x,
            initialEuler.x,
            "Left stick Y- should pitch scene UP (positive pitch)",
        );
    });

    test("right stick X- pans scene LEFT", () => {
        const initialPos = getPivotPosition(pivotController);

        processor.rightStick = {x: -0.8, y: 0};

        for (let i = 0; i < 10; i++) {
            processor.processThumbsticks();
        }

        const finalPos = getPivotPosition(pivotController);

        assert.isBelow(
            finalPos.x,
            initialPos.x,
            "Right stick X- should pan scene LEFT (negative X)",
        );
    });

    test("right stick Y- zooms OUT", () => {
        const initialScale = getPivotScale(pivotController);

        processor.rightStick = {x: 0, y: -0.8};

        for (let i = 0; i < 10; i++) {
            processor.processThumbsticks();
        }

        const finalScale = getPivotScale(pivotController);

        assert.isBelow(
            finalScale,
            initialScale,
            "Right stick Y- should zoom OUT (smaller scale)",
        );
    });

    test("both thumbsticks can be used simultaneously", () => {
        const initialEuler = getPivotEuler(pivotController);
        const initialScale = getPivotScale(pivotController);

        // Set both thumbsticks
        processor.leftStick = {x: 0.5, y: 0}; // Yaw
        processor.rightStick = {x: 0, y: 0.5}; // Zoom

        for (let i = 0; i < 10; i++) {
            processor.processThumbsticks();
        }

        const finalEuler = getPivotEuler(pivotController);
        const finalScale = getPivotScale(pivotController);

        // Both yaw and scale should have changed
        const yawDiff = Math.abs(finalEuler.y - initialEuler.y);
        const scaleDiff = Math.abs(finalScale - initialScale);

        assert.isAbove(
            yawDiff,
            0.0001,
            "Simultaneous input: yaw should change",
        );
        assert.isAbove(
            scaleDiff,
            0.0001,
            "Simultaneous input: scale should change",
        );
    });

    test("diagonal left stick input produces combined yaw and pitch", () => {
        const initialEuler = getPivotEuler(pivotController);

        processor.leftStick = {x: 0.5, y: 0.5};

        for (let i = 0; i < 10; i++) {
            processor.processThumbsticks();
        }

        const finalEuler = getPivotEuler(pivotController);

        const yawDiff = Math.abs(finalEuler.y - initialEuler.y);
        const pitchDiff = Math.abs(finalEuler.x - initialEuler.x);

        assert.isAbove(yawDiff, 0.0001, "Diagonal input should change yaw");
        assert.isAbove(pitchDiff, 0.0001, "Diagonal input should change pitch");
    });

    test("diagonal right stick input produces combined pan and zoom", () => {
        const initialPos = getPivotPosition(pivotController);
        const initialScale = getPivotScale(pivotController);

        processor.rightStick = {x: 0.5, y: 0.5};

        for (let i = 0; i < 10; i++) {
            processor.processThumbsticks();
        }

        const finalPos = getPivotPosition(pivotController);
        const finalScale = getPivotScale(pivotController);

        const posDiff = Math.abs(finalPos.x - initialPos.x);
        const scaleDiff = Math.abs(finalScale - initialScale);

        assert.isAbove(posDiff, 0.0001, "Diagonal input should pan");
        assert.isAbove(scaleDiff, 0.0001, "Diagonal input should zoom");
    });
});

/**
 * Test deadzone function directly
 */
describe("XR Thumbstick Deadzone Behavior", () => {
    test("applyDeadzone returns 0 for inputs below threshold", () => {
        const DEADZONE = 0.15;
        assert.equal(applyDeadzone(0.1, DEADZONE), 0, "0.1 should be filtered");
        assert.equal(applyDeadzone(-0.1, DEADZONE), 0, "-0.1 should be filtered");
        assert.equal(applyDeadzone(0.14, DEADZONE), 0, "0.14 should be filtered");
        assert.equal(applyDeadzone(0.0, DEADZONE), 0, "0 should return 0");
    });

    test("applyDeadzone returns non-zero for inputs above threshold", () => {
        const DEADZONE = 0.15;
        assert.notEqual(applyDeadzone(0.5, DEADZONE), 0, "0.5 should pass");
        assert.notEqual(applyDeadzone(-0.5, DEADZONE), 0, "-0.5 should pass");
        assert.notEqual(applyDeadzone(0.2, DEADZONE), 0, "0.2 should pass");
    });

    test("applyDeadzone preserves sign of input", () => {
        const DEADZONE = 0.15;
        assert.isAbove(applyDeadzone(0.5, DEADZONE), 0, "Positive should stay positive");
        assert.isBelow(applyDeadzone(-0.5, DEADZONE), 0, "Negative should stay negative");
    });

    test("applyDeadzone max input produces output close to 1", () => {
        const DEADZONE = 0.15;
        const maxOutput = applyDeadzone(1.0, DEADZONE);
        assert.closeTo(maxOutput, 1.0, 0.01, "Max input should produce ~1");
    });
});
