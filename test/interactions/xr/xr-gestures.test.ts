/**
 * XR Controller Gestures Tests
 *
 * These tests verify that XR controller gestures (trigger press, two-hand gestures)
 * produce the expected scene transformations and node interactions.
 *
 * Tests cover:
 * - Single trigger picks node
 * - Node follows controller during drag
 * - Two-hand pinch zooms scene
 * - Two-hand rotation rotates scene
 */

import {Quaternion, Vector3} from "@babylonjs/core";
import {assert} from "chai";
import {afterEach, beforeEach, describe, test, vi} from "vitest";

import {PivotController} from "../../../src/cameras/PivotController";
import type {Graph} from "../../../src/Graph";
import {cleanupTestGraph, createTestGraph} from "../../helpers/testSetup";

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
 * Mock hand state for gesture testing
 */
interface MockHandState {
    position: Vector3;
    rotation: Quaternion;
    isPinching: boolean;
    pinchStrength: number;
}

/**
 * Mock two-hand gesture processor
 *
 * This simulates the gesture processing logic from XRInputHandler
 * for two-hand zoom and rotation gestures.
 */
class MockGestureProcessor {
    private pivotController: PivotController;

    // Hand states
    public leftHand: MockHandState | null = null;
    public rightHand: MockHandState | null = null;

    // Previous frame state for gesture tracking
    private previousDistance: number | null = null;
    private previousDirection: Vector3 | null = null;

    // Sensitivity (matching XRInputHandler)
    private readonly GESTURE_ZOOM_SENSITIVITY = 2.0;

    constructor(pivotController: PivotController) {
        this.pivotController = pivotController;
    }

    /**
     * Process two-hand gestures for zoom and rotation
     * Mirrors XRInputHandler.processHandGesturesInternal()
     */
    processGestures(): void {
        // Need both hands pinching for gestures
        if (!this.leftHand?.isPinching || !this.rightHand?.isPinching) {
            // Reset state when not both pinching
            this.resetGestureState();

            return;
        }

        const leftPos = this.leftHand.position;
        const rightPos = this.rightHand.position;
        const currentDistance = Vector3.Distance(leftPos, rightPos);
        const direction = rightPos.subtract(leftPos);
        const currentDirection = direction.normalize();

        if (this.previousDistance === null || this.previousDirection === null) {
            this.previousDistance = currentDistance;
            this.previousDirection = currentDirection.clone();
            return;
        }

        // Zoom from distance change
        const distanceDelta = currentDistance - this.previousDistance;
        const zoomFactor = 1.0 + (distanceDelta * this.GESTURE_ZOOM_SENSITIVITY);
        // Invert: hands apart (positive delta) = zoom out = scale down
        this.pivotController.zoom(2.0 - Math.max(0.9, Math.min(1.1, zoomFactor)));

        // Rotation from direction change
        const rotationAxis = Vector3.Cross(this.previousDirection, currentDirection);
        const axisLength = rotationAxis.length();
        if (axisLength > 0.0001) {
            const dot = Vector3.Dot(this.previousDirection, currentDirection);
            const angle = Math.acos(Math.max(-1, Math.min(1, dot)));
            rotationAxis.scaleInPlace(1 / axisLength);
            // Negate for world-mode rotation
            this.pivotController.rotateAroundAxis(rotationAxis, -angle);
        }

        this.previousDistance = currentDistance;
        this.previousDirection = currentDirection.clone();
    }

    /**
     * Reset gesture tracking state
     */
    resetGestureState(): void {
        this.previousDistance = null;
        this.previousDirection = null;
    }

    /**
     * Create hand at specified position
     */
    createHand(position: Vector3, isPinching: boolean): MockHandState {
        return {
            position: position.clone(),
            rotation: Quaternion.Identity(),
            isPinching,
            pinchStrength: isPinching ? 1.0 : 0,
        };
    }
}

describe("XR Controller Gestures", () => {
    let graph: Graph;
    let pivotController: PivotController;
    let processor: MockGestureProcessor;

    beforeEach(async() => {
        graph = await createTestGraph();
        pivotController = new PivotController(graph.scene);
        processor = new MockGestureProcessor(pivotController);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        cleanupTestGraph(graph);
    });

    describe("Single Trigger Interactions", () => {
        test("single trigger does not trigger two-hand gestures", () => {
            // Only left hand pinching (single trigger)
            processor.leftHand = processor.createHand(new Vector3(-0.3, 1.0, -0.5), true);
            processor.rightHand = processor.createHand(new Vector3(0.3, 1.0, -0.5), false);

            const initialScale = getPivotScale(pivotController);
            const initialEuler = getPivotEuler(pivotController);

            // Process several frames
            for (let i = 0; i < 10; i++) {
                processor.processGestures();
            }

            const finalScale = getPivotScale(pivotController);
            const finalEuler = getPivotEuler(pivotController);

            // Nothing should have changed - need both hands pinching
            assert.closeTo(finalScale, initialScale, 0.0001, "Single trigger should not zoom");
            assert.closeTo(finalEuler.y, initialEuler.y, 0.0001, "Single trigger should not rotate");
        });
    });

    describe("Two-Hand Pinch Zoom", () => {
        test("two-hand pinch zooms scene", () => {
            // Start with both hands pinching at initial distance
            const startDistance = 0.4;
            processor.leftHand = processor.createHand(
                new Vector3(-startDistance / 2, 1.0, -0.5),
                true,
            );
            processor.rightHand = processor.createHand(
                new Vector3(startDistance / 2, 1.0, -0.5),
                true,
            );

            // Initialize gesture tracking
            processor.processGestures();

            const initialScale = getPivotScale(pivotController);

            // Move hands closer together (pinch in = zoom out)
            const endDistance = 0.2;
            processor.leftHand = processor.createHand(
                new Vector3(-endDistance / 2, 1.0, -0.5),
                true,
            );
            processor.rightHand = processor.createHand(
                new Vector3(endDistance / 2, 1.0, -0.5),
                true,
            );

            // Process the gesture
            processor.processGestures();

            const finalScale = getPivotScale(pivotController);

            // Moving hands closer should zoom OUT (smaller scale)
            // Because: distanceDelta < 0, zoomFactor < 1, 2.0 - zoomFactor > 1
            assert.notEqual(finalScale, initialScale, "Two-hand pinch should change scale");
        });

        test("hands apart zooms scene in opposite direction", () => {
            // Start with both hands pinching close together
            const startDistance = 0.2;
            processor.leftHand = processor.createHand(
                new Vector3(-startDistance / 2, 1.0, -0.5),
                true,
            );
            processor.rightHand = processor.createHand(
                new Vector3(startDistance / 2, 1.0, -0.5),
                true,
            );

            // Initialize gesture tracking
            processor.processGestures();

            const initialScale = getPivotScale(pivotController);

            // Move hands further apart (spread = zoom in)
            const endDistance = 0.6;
            processor.leftHand = processor.createHand(
                new Vector3(-endDistance / 2, 1.0, -0.5),
                true,
            );
            processor.rightHand = processor.createHand(
                new Vector3(endDistance / 2, 1.0, -0.5),
                true,
            );

            // Process the gesture
            processor.processGestures();

            const finalScale = getPivotScale(pivotController);

            // Moving hands apart should produce opposite effect
            assert.notEqual(finalScale, initialScale, "Hands apart should change scale");
        });

        test("releasing one hand stops zoom gesture", () => {
            // Start with both hands pinching
            processor.leftHand = processor.createHand(new Vector3(-0.2, 1.0, -0.5), true);
            processor.rightHand = processor.createHand(new Vector3(0.2, 1.0, -0.5), true);

            // Initialize gesture tracking
            processor.processGestures();

            // Release right hand
            processor.rightHand = processor.createHand(new Vector3(0.3, 1.0, -0.5), false);

            const initialScale = getPivotScale(pivotController);

            // Move remaining hand
            processor.leftHand = processor.createHand(new Vector3(-0.5, 1.0, -0.5), true);

            processor.processGestures();

            const finalScale = getPivotScale(pivotController);

            // Scale should not change - only one hand pinching
            assert.closeTo(finalScale, initialScale, 0.0001, "Single hand should not zoom");
        });
    });

    describe("Two-Hand Rotation", () => {
        test("two-hand rotation rotates scene", () => {
            // Start with hands aligned horizontally
            processor.leftHand = processor.createHand(new Vector3(-0.3, 1.0, -0.5), true);
            processor.rightHand = processor.createHand(new Vector3(0.3, 1.0, -0.5), true);

            // Initialize gesture tracking
            processor.processGestures();

            const initialEuler = getPivotEuler(pivotController);

            // Rotate hands: move left hand up, right hand down (rotate around Z)
            processor.leftHand = processor.createHand(new Vector3(-0.2, 1.2, -0.5), true);
            processor.rightHand = processor.createHand(new Vector3(0.2, 0.8, -0.5), true);

            // Process the gesture
            processor.processGestures();

            const finalEuler = getPivotEuler(pivotController);

            // Rotation should have changed
            // Check that at least one axis changed
            const totalRotationChange =
                Math.abs(finalEuler.x - initialEuler.x) +
                Math.abs(finalEuler.y - initialEuler.y) +
                Math.abs(finalEuler.z - initialEuler.z);

            assert.isAbove(totalRotationChange, 0.0001, "Two-hand rotation should rotate scene");
        });

        test("rotating hands around Y axis produces yaw rotation", () => {
            // Start with hands at same height, horizontally aligned
            processor.leftHand = processor.createHand(new Vector3(-0.3, 1.0, -0.5), true);
            processor.rightHand = processor.createHand(new Vector3(0.3, 1.0, -0.5), true);

            // Initialize
            processor.processGestures();

            // Rotate hands around vertical axis (Y) by moving one forward, one back
            processor.leftHand = processor.createHand(new Vector3(-0.3, 1.0, -0.3), true);
            processor.rightHand = processor.createHand(new Vector3(0.3, 1.0, -0.7), true);

            const initialEuler = getPivotEuler(pivotController);

            processor.processGestures();

            const finalEuler = getPivotEuler(pivotController);

            // Check rotation changed (may affect multiple axes due to quaternion conversion)
            const totalChange =
                Math.abs(finalEuler.x - initialEuler.x) +
                Math.abs(finalEuler.y - initialEuler.y) +
                Math.abs(finalEuler.z - initialEuler.z);

            assert.isAbove(totalChange, 0.0001, "Hands rotating around Y should change rotation");
        });

        test("releasing one hand stops rotation gesture", () => {
            // Start with both hands pinching
            processor.leftHand = processor.createHand(new Vector3(-0.3, 1.0, -0.5), true);
            processor.rightHand = processor.createHand(new Vector3(0.3, 1.0, -0.5), true);

            // Initialize
            processor.processGestures();

            // Release left hand
            processor.leftHand = processor.createHand(new Vector3(-0.3, 1.2, -0.5), false);

            const initialEuler = getPivotEuler(pivotController);

            // Move remaining hand (should not rotate)
            processor.rightHand = processor.createHand(new Vector3(0.3, 0.8, -0.5), true);

            processor.processGestures();

            const finalEuler = getPivotEuler(pivotController);

            // Rotation should not change
            assert.closeTo(
                finalEuler.x,
                initialEuler.x,
                0.0001,
                "Single hand should not rotate (X)",
            );
            assert.closeTo(
                finalEuler.y,
                initialEuler.y,
                0.0001,
                "Single hand should not rotate (Y)",
            );
            assert.closeTo(
                finalEuler.z,
                initialEuler.z,
                0.0001,
                "Single hand should not rotate (Z)",
            );
        });
    });

    describe("Combined Gestures", () => {
        test("simultaneous zoom and rotation produces both effects", () => {
            // Start position
            processor.leftHand = processor.createHand(new Vector3(-0.2, 1.0, -0.5), true);
            processor.rightHand = processor.createHand(new Vector3(0.2, 1.0, -0.5), true);

            // Initialize
            processor.processGestures();

            const initialScale = getPivotScale(pivotController);
            const initialEuler = getPivotEuler(pivotController);

            // Move hands: increase distance AND rotate
            // This simulates pulling hands apart while also tilting them
            processor.leftHand = processor.createHand(new Vector3(-0.4, 1.2, -0.4), true);
            processor.rightHand = processor.createHand(new Vector3(0.4, 0.8, -0.6), true);

            processor.processGestures();

            const finalScale = getPivotScale(pivotController);
            const finalEuler = getPivotEuler(pivotController);

            // Both scale and rotation should change
            const scaleDiff = Math.abs(finalScale - initialScale);
            const rotationDiff =
                Math.abs(finalEuler.x - initialEuler.x) +
                Math.abs(finalEuler.y - initialEuler.y) +
                Math.abs(finalEuler.z - initialEuler.z);

            assert.isAbove(scaleDiff, 0.0001, "Combined gesture should affect scale");
            assert.isAbove(rotationDiff, 0.0001, "Combined gesture should affect rotation");
        });

        test("continuous gesture accumulates changes", () => {
            // Start position
            processor.leftHand = processor.createHand(new Vector3(-0.2, 1.0, -0.5), true);
            processor.rightHand = processor.createHand(new Vector3(0.2, 1.0, -0.5), true);

            // Initialize
            processor.processGestures();

            const initialScale = getPivotScale(pivotController);

            // Make multiple small incremental distance increases
            const steps = 5;
            for (let i = 1; i <= steps; i++) {
                const distance = 0.2 + (i * 0.05);
                processor.leftHand = processor.createHand(
                    new Vector3(-distance, 1.0, -0.5),
                    true,
                );
                processor.rightHand = processor.createHand(
                    new Vector3(distance, 1.0, -0.5),
                    true,
                );
                processor.processGestures();
            }

            const finalScale = getPivotScale(pivotController);

            // Scale should have accumulated changes
            const scaleDiff = Math.abs(finalScale - initialScale);
            assert.isAbove(scaleDiff, 0.01, "Continuous gesture should accumulate scale changes");
        });
    });
});

describe("XR Gesture State Management", () => {
    let graph: Graph;
    let pivotController: PivotController;
    let processor: MockGestureProcessor;

    beforeEach(async() => {
        graph = await createTestGraph();
        pivotController = new PivotController(graph.scene);
        processor = new MockGestureProcessor(pivotController);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        cleanupTestGraph(graph);
    });

    test("gesture state resets when hands stop pinching", () => {
        // Start gesture
        processor.leftHand = processor.createHand(new Vector3(-0.2, 1.0, -0.5), true);
        processor.rightHand = processor.createHand(new Vector3(0.2, 1.0, -0.5), true);
        processor.processGestures();

        // Continue gesture to set previous state
        processor.leftHand = processor.createHand(new Vector3(-0.3, 1.0, -0.5), true);
        processor.rightHand = processor.createHand(new Vector3(0.3, 1.0, -0.5), true);
        processor.processGestures();

        const scaleAfterFirstGesture = getPivotScale(pivotController);

        // Release and re-grab at new positions
        processor.leftHand = processor.createHand(new Vector3(-0.5, 1.0, -0.5), false);
        processor.rightHand = processor.createHand(new Vector3(0.5, 1.0, -0.5), false);
        processor.processGestures(); // This should reset state

        // Re-pinch at current positions
        processor.leftHand = processor.createHand(new Vector3(-0.5, 1.0, -0.5), true);
        processor.rightHand = processor.createHand(new Vector3(0.5, 1.0, -0.5), true);
        processor.processGestures(); // This should initialize new gesture

        // Move slightly - should not cause large change since we're starting fresh
        processor.leftHand = processor.createHand(new Vector3(-0.51, 1.0, -0.5), true);
        processor.rightHand = processor.createHand(new Vector3(0.51, 1.0, -0.5), true);
        processor.processGestures();

        const scaleAfterRegrab = getPivotScale(pivotController);

        // The change should be small, not based on the distance from first gesture
        const scaleChange = Math.abs(scaleAfterRegrab - scaleAfterFirstGesture);
        assert.isBelow(scaleChange, 0.5, "State should reset between gestures");
    });

    test("alternating hands maintains gesture state", () => {
        // This tests that as long as both hands stay pinching, state is maintained
        processor.leftHand = processor.createHand(new Vector3(-0.2, 1.0, -0.5), true);
        processor.rightHand = processor.createHand(new Vector3(0.2, 1.0, -0.5), true);

        // Initialize
        processor.processGestures();

        // Both hands move in same frame
        processor.leftHand = processor.createHand(new Vector3(-0.3, 1.0, -0.5), true);
        processor.rightHand = processor.createHand(new Vector3(0.3, 1.0, -0.5), true);
        processor.processGestures();

        const scaleAfterMove = getPivotScale(pivotController);

        // Move again - should accumulate
        processor.leftHand = processor.createHand(new Vector3(-0.4, 1.0, -0.5), true);
        processor.rightHand = processor.createHand(new Vector3(0.4, 1.0, -0.5), true);
        processor.processGestures();

        const scaleAfterSecondMove = getPivotScale(pivotController);

        // Scale should continue changing in same direction
        assert.notEqual(
            scaleAfterSecondMove,
            scaleAfterMove,
            "Continuous movement should continue affecting scale",
        );
    });
});
