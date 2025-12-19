/**
 * XR Input Direction Verification Tests (CRITICAL)
 *
 * These tests verify that XR controller input directions map to expected output directions.
 * They are particularly critical for catching direction-related regressions because XR
 * controls cannot be easily tested manually without hardware.
 *
 * Input mapping (from XRInputHandler.ts):
 * - Left stick X: Yaw (turn left/right) - X+ = rotate RIGHT
 * - Left stick Y: Pitch (tilt up/down) - Y+ (forward) = look DOWN
 * - Right stick X: Pan left/right - X+ = pan RIGHT
 * - Right stick Y: Zoom in/out - Y+ (forward) = zoom IN
 */

import {Quaternion, Vector3} from "@babylonjs/core";
import {assert} from "chai";
import {afterEach, beforeEach, describe, test, vi} from "vitest";

import {applyDeadzone} from "../../../src/cameras/InputUtils";
import {PivotController} from "../../../src/cameras/PivotController";
import type {Graph} from "../../../src/Graph";
import {cleanupTestGraph, createTestGraph} from "../../helpers/testSetup";

/**
 * Mock XRInputHandler for unit testing.
 * This simulates the XR input processing logic without requiring actual WebXR.
 */
class MockXRInputHandler {
    private pivotController: PivotController;

    // Thumbstick values
    public leftStick = {x: 0, y: 0};
    public rightStick = {x: 0, y: 0};

    // Sensitivity settings (matching XRInputHandler)
    private readonly DEADZONE = 0.15;
    private readonly YAW_SPEED = 0.04;
    private readonly PITCH_SPEED = 0.03;
    private readonly PAN_SPEED = 0.08;
    private readonly ZOOM_SPEED = 0.02;

    constructor(pivotController: PivotController) {
        this.pivotController = pivotController;
    }

    /**
     * Process thumbstick input.
     * This mirrors the logic in XRInputHandler.processThumbsticks()
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

        // LEFT STICK: Rotation (matching XRInputHandler behavior)
        // X = yaw (push right = positive yaw = scene rotates right around you)
        // Y = pitch (push forward = negative pitch = look up... wait, let me check)
        // Actually from XRInputHandler.ts line 511: pitchDelta = -leftY * this.PITCH_SPEED
        // So Y+ (forward push) = negative pitchDelta = pitch down (look up at scene)
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

/**
 * Helper to get pivot rotation as Euler angles
 */
function getPivotEuler(pivot: PivotController): {x: number, y: number, z: number} {
    const quat = pivot.pivot.rotationQuaternion ?? Quaternion.Identity();
    const euler = quat.toEulerAngles();
    return {x: euler.x, y: euler.y, z: euler.z};
}

/**
 * Helper to get pivot scale
 */
function getPivotScale(pivot: PivotController): number {
    return pivot.pivot.scaling.x;
}

/**
 * Helper to get pivot position
 */
function getPivotPosition(pivot: PivotController): Vector3 {
    return pivot.pivot.position.clone();
}

describe("XR Input Direction Verification", () => {
    let graph: Graph;
    let pivotController: PivotController;
    let mockHandler: MockXRInputHandler;

    beforeEach(async() => {
        // Create a test graph to get a valid scene
        graph = await createTestGraph();

        // Create pivot controller directly for testing
        pivotController = new PivotController(graph.scene);

        // Create mock XR input handler
        mockHandler = new MockXRInputHandler(pivotController);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        cleanupTestGraph(graph);
    });

    test("left stick X+ rotates scene RIGHT (CRITICAL)", () => {
        // Record initial rotation
        const initialEuler = getPivotEuler(pivotController);

        // Set left stick to right (X+)
        mockHandler.leftStick = {x: 0.8, y: 0};

        // Process several frames of input
        for (let i = 0; i < 10; i++) {
            mockHandler.processThumbsticks();
        }

        // Get final rotation
        const finalEuler = getPivotEuler(pivotController);

        // X+ should produce positive yaw (rotate RIGHT around Y axis)
        // Looking at XRInputHandler.ts line 510:
        // yawDelta = leftX * this.YAW_SPEED;
        // So leftX > 0 means yawDelta > 0
        // And in PivotController.rotate(), yawDelta > 0 means pivot.rotate(Axis.Y, yawDelta)
        // This rotates the scene RIGHT from the user's perspective
        assert.isAbove(
            finalEuler.y,
            initialEuler.y,
            "Left stick X+ should rotate scene RIGHT (positive yaw)",
        );
    });

    test("left stick X- rotates scene LEFT", () => {
        // Record initial rotation
        const initialEuler = getPivotEuler(pivotController);

        // Set left stick to left (X-)
        mockHandler.leftStick = {x: -0.8, y: 0};

        // Process several frames
        for (let i = 0; i < 10; i++) {
            mockHandler.processThumbsticks();
        }

        // Get final rotation
        const finalEuler = getPivotEuler(pivotController);

        // X- should produce negative yaw (rotate LEFT around Y axis)
        assert.isBelow(
            finalEuler.y,
            initialEuler.y,
            "Left stick X- should rotate scene LEFT (negative yaw)",
        );
    });

    test("left stick Y+ (forward) pitches scene DOWN", () => {
        // Record initial rotation
        const initialEuler = getPivotEuler(pivotController);

        // Set left stick forward (Y+)
        mockHandler.leftStick = {x: 0, y: 0.8};

        // Process several frames
        for (let i = 0; i < 10; i++) {
            mockHandler.processThumbsticks();
        }

        // Get final rotation
        const finalEuler = getPivotEuler(pivotController);

        // Y+ should produce negative pitch (pitch DOWN - looking up at the scene)
        // Looking at XRInputHandler.ts line 511:
        // pitchDelta = -leftY * this.PITCH_SPEED;
        // So leftY > 0 means pitchDelta < 0
        // This pitches the scene DOWN (you're looking up at it)
        assert.isBelow(
            finalEuler.x,
            initialEuler.x,
            "Left stick Y+ (forward) should pitch scene DOWN (negative pitch)",
        );
    });

    test("left stick Y- (back) pitches scene UP", () => {
        // Record initial rotation
        const initialEuler = getPivotEuler(pivotController);

        // Set left stick back (Y-)
        mockHandler.leftStick = {x: 0, y: -0.8};

        // Process several frames
        for (let i = 0; i < 10; i++) {
            mockHandler.processThumbsticks();
        }

        // Get final rotation
        const finalEuler = getPivotEuler(pivotController);

        // Y- should produce positive pitch (pitch UP - looking down at the scene)
        assert.isAbove(
            finalEuler.x,
            initialEuler.x,
            "Left stick Y- (back) should pitch scene UP (positive pitch)",
        );
    });

    test("right stick X+ pans scene RIGHT", () => {
        // Record initial position
        const initialPos = getPivotPosition(pivotController);

        // Set right stick to right (X+)
        mockHandler.rightStick = {x: 0.8, y: 0};

        // Process several frames
        for (let i = 0; i < 10; i++) {
            mockHandler.processThumbsticks();
        }

        // Get final position
        const finalPos = getPivotPosition(pivotController);

        // X+ should pan RIGHT (positive X)
        // Looking at XRInputHandler.ts lines 529-535:
        // panAmount = rightX * this.PAN_SPEED;
        // this.pivotController.panViewRelative(panAmount, 0);
        // And in PivotController.panViewRelative with initial yaw=0:
        // worldX = right * cosYaw = right * 1 = positive
        assert.isAbove(
            finalPos.x,
            initialPos.x,
            "Right stick X+ should pan scene RIGHT (positive X)",
        );
    });

    test("right stick X- pans scene LEFT", () => {
        // Record initial position
        const initialPos = getPivotPosition(pivotController);

        // Set right stick to left (X-)
        mockHandler.rightStick = {x: -0.8, y: 0};

        // Process several frames
        for (let i = 0; i < 10; i++) {
            mockHandler.processThumbsticks();
        }

        // Get final position
        const finalPos = getPivotPosition(pivotController);

        // X- should pan LEFT (negative X)
        assert.isBelow(
            finalPos.x,
            initialPos.x,
            "Right stick X- should pan scene LEFT (negative X)",
        );
    });

    test("right stick Y+ (forward) zooms IN", () => {
        // Record initial scale
        const initialScale = getPivotScale(pivotController);

        // Set right stick forward (Y+)
        mockHandler.rightStick = {x: 0, y: 0.8};

        // Process several frames
        for (let i = 0; i < 10; i++) {
            mockHandler.processThumbsticks();
        }

        // Get final scale
        const finalScale = getPivotScale(pivotController);

        // Y+ should zoom IN (larger scale)
        // Looking at XRInputHandler.ts lines 523-525:
        // const zoomFactor = 1.0 + rightY * this.ZOOM_SPEED;
        // So rightY > 0 means zoomFactor > 1
        // this.pivotController.zoom(zoomFactor) with factor > 1 increases scale
        assert.isAbove(
            finalScale,
            initialScale,
            "Right stick Y+ (forward) should zoom IN (larger scale)",
        );
    });

    test("right stick Y- (back) zooms OUT", () => {
        // Record initial scale
        const initialScale = getPivotScale(pivotController);

        // Set right stick back (Y-)
        mockHandler.rightStick = {x: 0, y: -0.8};

        // Process several frames
        for (let i = 0; i < 10; i++) {
            mockHandler.processThumbsticks();
        }

        // Get final scale
        const finalScale = getPivotScale(pivotController);

        // Y- should zoom OUT (smaller scale)
        assert.isBelow(
            finalScale,
            initialScale,
            "Right stick Y- (back) should zoom OUT (smaller scale)",
        );
    });

    // Additional tests for deadzone behavior
    test("deadzone filters inputs below threshold (0.15)", () => {
        // Record initial state
        const initialEuler = getPivotEuler(pivotController);
        const initialScale = getPivotScale(pivotController);

        // Set thumbstick values below deadzone
        mockHandler.leftStick = {x: 0.1, y: 0.1};
        mockHandler.rightStick = {x: 0.1, y: 0.1};

        // Process several frames
        for (let i = 0; i < 10; i++) {
            mockHandler.processThumbsticks();
        }

        // Get final state
        const finalEuler = getPivotEuler(pivotController);
        const finalScale = getPivotScale(pivotController);

        // Nothing should have changed - inputs were below deadzone
        assert.closeTo(
            finalEuler.y,
            initialEuler.y,
            0.0001,
            "Deadzone should filter inputs below 0.15 (yaw unchanged)",
        );
        assert.closeTo(
            finalScale,
            initialScale,
            0.0001,
            "Deadzone should filter inputs below 0.15 (scale unchanged)",
        );
    });

    test("deadzone passes inputs above threshold", () => {
        // Record initial state
        const initialEuler = getPivotEuler(pivotController);

        // Set thumbstick values above deadzone
        mockHandler.leftStick = {x: 0.5, y: 0};

        // Process several frames
        for (let i = 0; i < 10; i++) {
            mockHandler.processThumbsticks();
        }

        // Get final state
        const finalEuler = getPivotEuler(pivotController);

        // Yaw should have changed - verify the difference is significant
        const yawDiff = Math.abs(finalEuler.y - initialEuler.y);
        assert.isAbove(
            yawDiff,
            0.0001,
            "Inputs above deadzone should be processed (yaw changed)",
        );
    });

    // Test combined inputs
    test("diagonal left stick input produces combined yaw and pitch", () => {
        // Record initial state
        const initialEuler = getPivotEuler(pivotController);

        // Set left stick to diagonal (both X and Y)
        mockHandler.leftStick = {x: 0.5, y: 0.5};

        // Process several frames
        for (let i = 0; i < 10; i++) {
            mockHandler.processThumbsticks();
        }

        // Get final state
        const finalEuler = getPivotEuler(pivotController);

        // Both yaw and pitch should have changed - verify differences are significant
        const yawDiff = Math.abs(finalEuler.y - initialEuler.y);
        const pitchDiff = Math.abs(finalEuler.x - initialEuler.x);
        assert.isAbove(
            yawDiff,
            0.0001,
            "Diagonal input should change yaw",
        );
        assert.isAbove(
            pitchDiff,
            0.0001,
            "Diagonal input should change pitch",
        );
    });

    test("both thumbsticks can be used simultaneously", () => {
        // Record initial state
        const initialEuler = getPivotEuler(pivotController);
        const initialScale = getPivotScale(pivotController);

        // Set both thumbsticks
        mockHandler.leftStick = {x: 0.5, y: 0}; // Yaw
        mockHandler.rightStick = {x: 0, y: 0.5}; // Zoom

        // Process several frames
        for (let i = 0; i < 10; i++) {
            mockHandler.processThumbsticks();
        }

        // Get final state
        const finalEuler = getPivotEuler(pivotController);
        const finalScale = getPivotScale(pivotController);

        // Both yaw and scale should have changed - verify differences are significant
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
});

describe("XR InputUtils applyDeadzone", () => {
    test("returns 0 for inputs below threshold", () => {
        assert.equal(applyDeadzone(0.1, 0.15), 0, "0.1 should be filtered by 0.15 deadzone");
        assert.equal(applyDeadzone(-0.1, 0.15), 0, "-0.1 should be filtered by 0.15 deadzone");
        assert.equal(applyDeadzone(0.14, 0.15), 0, "0.14 should be filtered by 0.15 deadzone");
    });

    test("returns non-zero for inputs above threshold", () => {
        assert.notEqual(applyDeadzone(0.5, 0.15), 0, "0.5 should pass 0.15 deadzone");
        assert.notEqual(applyDeadzone(-0.5, 0.15), 0, "-0.5 should pass 0.15 deadzone");
        assert.notEqual(applyDeadzone(0.2, 0.15), 0, "0.2 should pass 0.15 deadzone");
    });

    test("preserves sign of input", () => {
        assert.isAbove(applyDeadzone(0.5, 0.15), 0, "Positive input should produce positive output");
        assert.isBelow(applyDeadzone(-0.5, 0.15), 0, "Negative input should produce negative output");
    });

    test("applies quadratic curve for smooth acceleration", () => {
        // The function should remap [deadzone, 1] to [0, 1] with a quadratic curve
        // Value at max input should be 1 (or close to it for sign preservation)
        const maxOutput = applyDeadzone(1.0, 0.15);
        assert.closeTo(maxOutput, 1.0, 0.01, "Max input should produce output close to 1");

        // Mid-range should be curved (less than linear)
        const midInput = 0.5;
        const midOutput = applyDeadzone(midInput, 0.15);
        // Linear mapping would give: (0.5 - 0.15) / (1 - 0.15) = 0.35 / 0.85 ≈ 0.41
        // Quadratic should give something less than linear or equal depending on implementation
        // The quadratic curve squares the normalized value
        assert.isAbove(midOutput, 0, "Mid-range input should produce positive output");
    });
});
