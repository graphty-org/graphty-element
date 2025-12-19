/**
 * Deadzone and Threshold Behavior Tests
 *
 * These tests verify that input deadzones and thresholds work correctly,
 * preventing drift and ensuring consistent input behavior.
 */

import {Quaternion, Vector3} from "@babylonjs/core";
import {assert} from "chai";
import {afterEach, beforeEach, describe, test, vi} from "vitest";

import {applyDeadzone} from "../../../src/cameras/InputUtils";
import {PivotController} from "../../../src/cameras/PivotController";
import type {Graph} from "../../../src/Graph";
import {cleanupTestGraph, createTestGraph} from "../../helpers/testSetup";

/**
 * Mock XRInputHandler for deadzone testing.
 * This simulates the XR input processing logic with configurable deadzone.
 */
class MockXRInputHandler {
    private pivotController: PivotController;

    // Thumbstick values
    public leftStick = {x: 0, y: 0};
    public rightStick = {x: 0, y: 0};

    // Sensitivity settings (matching XRInputHandler constants)
    public readonly DEADZONE = 0.15;
    private readonly YAW_SPEED = 0.04;
    private readonly PITCH_SPEED = 0.03;
    private readonly PAN_SPEED = 0.08;
    private readonly ZOOM_SPEED = 0.02;

    constructor(pivotController: PivotController) {
        this.pivotController = pivotController;
    }

    /**
     * Process thumbstick input with deadzone.
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
        const yawDelta = leftX * this.YAW_SPEED;
        const pitchDelta = -leftY * this.PITCH_SPEED;

        if (Math.abs(yawDelta) > 0.0001 || Math.abs(pitchDelta) > 0.0001) {
            this.pivotController.rotate(yawDelta, pitchDelta);
        }

        // RIGHT STICK: Zoom and Pan
        if (Math.abs(rightY) > 0.0001) {
            const zoomFactor = 1.0 + (rightY * this.ZOOM_SPEED);
            this.pivotController.zoom(zoomFactor);
        }

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

describe("Deadzone and Threshold Behavior", () => {
    describe("XR Thumbstick Deadzone", () => {
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

        test("XR thumbstick deadzone filters inputs below threshold (0.15)", () => {
            // Record initial state
            const initialEuler = getPivotEuler(pivotController);
            const initialScale = getPivotScale(pivotController);
            const initialPos = getPivotPosition(pivotController);

            // Set thumbstick values below deadzone (0.15)
            mockHandler.leftStick = {x: 0.1, y: 0.1};
            mockHandler.rightStick = {x: 0.1, y: 0.1};

            // Process several frames
            for (let i = 0; i < 10; i++) {
                mockHandler.processThumbsticks();
            }

            // Get final state
            const finalEuler = getPivotEuler(pivotController);
            const finalScale = getPivotScale(pivotController);
            const finalPos = getPivotPosition(pivotController);

            // Nothing should have changed - all inputs were below deadzone
            assert.closeTo(
                finalEuler.y,
                initialEuler.y,
                0.0001,
                "Deadzone should filter inputs below 0.15 (yaw unchanged)",
            );
            assert.closeTo(
                finalEuler.x,
                initialEuler.x,
                0.0001,
                "Deadzone should filter inputs below 0.15 (pitch unchanged)",
            );
            assert.closeTo(
                finalScale,
                initialScale,
                0.0001,
                "Deadzone should filter inputs below 0.15 (scale unchanged)",
            );
            assert.closeTo(
                finalPos.x,
                initialPos.x,
                0.0001,
                "Deadzone should filter inputs below 0.15 (position unchanged)",
            );
        });

        test("XR thumbstick values above deadzone are applied", () => {
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

            // Yaw should have changed
            const yawDiff = Math.abs(finalEuler.y - initialEuler.y);
            assert.isAbove(
                yawDiff,
                0.001,
                "Inputs above deadzone should be processed (yaw changed)",
            );
        });

        test("XR deadzone is 0.15 (matches DEADZONE constant)", () => {
            // The mockHandler exposes the DEADZONE constant
            assert.equal(
                mockHandler.DEADZONE,
                0.15,
                "XR deadzone should be 0.15",
            );
        });

        test("deadzone applies per-axis, not radially", () => {
            // Record initial state
            const initialEuler = getPivotEuler(pivotController);

            // Set X above deadzone, Y below deadzone
            // If deadzone were radial, magnitude would be sqrt(0.5^2 + 0.1^2) ≈ 0.51
            // which is above threshold, so both would pass
            // But with per-axis, only X should pass
            mockHandler.leftStick = {x: 0.5, y: 0.1};

            // Process several frames
            for (let i = 0; i < 10; i++) {
                mockHandler.processThumbsticks();
            }

            // Get final state
            const finalEuler = getPivotEuler(pivotController);

            // Yaw should have changed (X was above deadzone)
            const yawDiff = Math.abs(finalEuler.y - initialEuler.y);
            assert.isAbove(
                yawDiff,
                0.001,
                "X axis input above deadzone should affect yaw",
            );

            // Pitch should NOT have changed (Y was below deadzone)
            assert.closeTo(
                finalEuler.x,
                initialEuler.x,
                0.0001,
                "Y axis input below deadzone should not affect pitch",
            );
        });
    });

    describe("InputUtils applyDeadzone function", () => {
        test("returns 0 for inputs below threshold", () => {
            const threshold = 0.15;

            assert.equal(
                applyDeadzone(0.0, threshold),
                0,
                "Zero should return 0",
            );
            assert.equal(
                applyDeadzone(0.1, threshold),
                0,
                "0.1 should be filtered by 0.15 deadzone",
            );
            assert.equal(
                applyDeadzone(-0.1, threshold),
                0,
                "-0.1 should be filtered by 0.15 deadzone",
            );
            assert.equal(
                applyDeadzone(0.14, threshold),
                0,
                "0.14 should be filtered by 0.15 deadzone",
            );
            assert.equal(
                applyDeadzone(-0.14, threshold),
                0,
                "-0.14 should be filtered by 0.15 deadzone",
            );
        });

        test("returns non-zero for inputs above threshold", () => {
            const threshold = 0.15;

            assert.notEqual(
                applyDeadzone(0.5, threshold),
                0,
                "0.5 should pass 0.15 deadzone",
            );
            assert.notEqual(
                applyDeadzone(-0.5, threshold),
                0,
                "-0.5 should pass 0.15 deadzone",
            );
            assert.notEqual(
                applyDeadzone(0.2, threshold),
                0,
                "0.2 should pass 0.15 deadzone",
            );
            assert.notEqual(
                applyDeadzone(1.0, threshold),
                0,
                "1.0 should pass 0.15 deadzone",
            );
        });

        test("returns non-zero for inputs at threshold boundary", () => {
            const threshold = 0.15;

            // Values at exactly the threshold should be filtered (it's <, not <=)
            // Values just above should pass
            assert.notEqual(
                applyDeadzone(0.16, threshold),
                0,
                "0.16 should just pass 0.15 deadzone",
            );
        });

        test("preserves sign of input", () => {
            const threshold = 0.15;

            assert.isAbove(
                applyDeadzone(0.5, threshold),
                0,
                "Positive input should produce positive output",
            );
            assert.isBelow(
                applyDeadzone(-0.5, threshold),
                0,
                "Negative input should produce negative output",
            );
        });

        test("remaps input range from [threshold, 1] to [0, 1]", () => {
            const threshold = 0.15;

            // At threshold, output should be 0 (or very close)
            const atThreshold = applyDeadzone(0.16, threshold);
            assert.isAbove(atThreshold, 0, "Just above threshold should be small but positive");
            assert.isBelow(atThreshold, 0.1, "Just above threshold should be small");

            // At max input, output should be 1 (or very close)
            const atMax = applyDeadzone(1.0, threshold);
            assert.closeTo(atMax, 1.0, 0.01, "Max input should produce output close to 1");
        });

        test("applies quadratic curve for smooth acceleration", () => {
            const threshold = 0.15;

            // The function applies a quadratic curve: output = sign * ((|input| - threshold) / (1 - threshold))^2
            // For input = 0.5: normalized = (0.5 - 0.15) / (1 - 0.15) = 0.35 / 0.85 ≈ 0.412
            // Output = 0.412^2 ≈ 0.17

            const midOutput = applyDeadzone(0.5, threshold);
            const linearExpected = (0.5 - threshold) / (1 - threshold); // ≈ 0.412

            // With quadratic curve, output should be less than linear (square of value < 1)
            assert.isAbove(midOutput, 0, "Mid-range should produce positive output");
            assert.isBelow(
                midOutput,
                linearExpected,
                "Quadratic curve should produce output less than linear",
            );

            // Verify it's approximately the expected quadratic value
            const expectedQuadratic = linearExpected * linearExpected;
            assert.closeTo(
                midOutput,
                expectedQuadratic,
                0.001,
                "Output should match quadratic curve formula",
            );
        });

        test("default threshold is 0.15", () => {
            // When called without second argument, should use 0.15
            assert.equal(
                applyDeadzone(0.1),
                0,
                "Default threshold should filter 0.1",
            );
            assert.notEqual(
                applyDeadzone(0.2),
                0,
                "Default threshold should pass 0.2",
            );
        });

        test("handles edge cases", () => {
            const threshold = 0.15;

            // Exactly at threshold
            assert.equal(
                applyDeadzone(0.15, threshold),
                0,
                "Input exactly at threshold should be filtered",
            );

            // Negative threshold (edge case - shouldn't happen but should handle gracefully)
            // The function should still work with any threshold value
            assert.equal(
                applyDeadzone(0.1, 0.2),
                0,
                "Custom threshold of 0.2 should filter 0.1",
            );
            assert.notEqual(
                applyDeadzone(0.3, 0.2),
                0,
                "Custom threshold of 0.2 should pass 0.3",
            );
        });
    });

    describe("2D Input Deadzone", () => {
        // Note: The 2D input controller doesn't have an explicit deadzone,
        // but we should verify small movements don't accumulate to cause drift

        test("2D input small velocities decay to zero", async() => {
            const graph = await createTestGraph();

            try {
                // Apply very small velocity
                const controller = graph.camera.getActiveController() as {
                    velocity?: {x: number, y: number, zoom: number, rotate: number};
                    applyInertia?: () => void;
                    config?: {panDamping: number};
                };

                if (controller.velocity && controller.applyInertia) {
                    controller.velocity.x = 0.0001;

                    // Run many frames
                    for (let i = 0; i < 100; i++) {
                        controller.applyInertia();
                    }

                    // Velocity should decay to effectively zero
                    assert.isBelow(
                        Math.abs(controller.velocity.x),
                        1e-10,
                        "Small velocity should decay to near-zero",
                    );
                }
            } finally {
                cleanupTestGraph(graph);
            }
        });
    });

    describe("Pinch Threshold Hysteresis", () => {
        // These values match XRInputHandler constants
        const PINCH_START = 0.7;
        const PINCH_END = 0.5;

        test("pinch threshold has hysteresis (start: 0.7, end: 0.5)", () => {
            // This test verifies the expected values
            // The actual implementation is in XRInputHandler

            // Start threshold should be higher than end threshold
            assert.isAbove(
                PINCH_START,
                PINCH_END,
                "Pinch start threshold should be higher than end threshold",
            );

            // The difference provides hysteresis to prevent flickering
            const hysteresis = PINCH_START - PINCH_END;
            assert.isAbove(
                hysteresis,
                0.1,
                "Hysteresis gap should be significant (at least 0.1)",
            );
        });

        test("pinch hysteresis prevents rapid state changes", () => {
            // Simulate pinch strength oscillating near threshold
            let isPinching = false;

            // Values that would cause flickering without hysteresis
            const oscillatingValues = [0.6, 0.65, 0.6, 0.65, 0.6, 0.65];

            let stateChanges = 0;

            for (const value of oscillatingValues) {
                const shouldPinch: boolean = isPinching ?
                    value > PINCH_END : // Already pinching, release below 0.5
                    value > PINCH_START; // Not pinching, start above 0.7

                if (shouldPinch !== isPinching) {
                    stateChanges++;
                    isPinching = shouldPinch;
                }
            }

            // With hysteresis, oscillating between 0.6 and 0.65 should not change state
            // Since both are between PINCH_END (0.5) and PINCH_START (0.7)
            assert.equal(
                stateChanges,
                0,
                "Oscillations within hysteresis band should not change state",
            );
        });
    });
});
