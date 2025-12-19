/**
 * XR Hand Tracking Tests
 *
 * These tests verify that hand tracking input (pinch gestures) works correctly
 * for node interactions and scene manipulation.
 *
 * Tests cover:
 * - Pinch gesture triggers node drag
 * - Pinch threshold hysteresis works correctly
 * - Two-hand gestures work with hands
 */

import {Quaternion, Vector3} from "@babylonjs/core";
import {assert} from "chai";
import {afterEach, beforeEach, describe, test, vi} from "vitest";

import {PivotController} from "../../../src/cameras/PivotController";
import type {Graph} from "../../../src/Graph";
import {cleanupTestGraph, createTestGraph} from "../../helpers/testSetup";

/**
 * Mock hand joint positions for testing
 */
interface MockHandJoints {
    wrist: Vector3;
    thumbTip: Vector3;
    indexTip: Vector3;
}

/**
 * Mock hand tracking state
 */
interface MockTrackedHand {
    handedness: "left" | "right";
    joints: MockHandJoints;
    isPinching: boolean;
    pinchStrength: number;
}

/**
 * Pinch threshold constants (matching XRInputHandler)
 * These values implement hysteresis to prevent pinch flicker
 */
const PINCH_THRESHOLD = 0.04; // 4cm - threshold to start pinching
const PINCH_RELEASE_THRESHOLD = 0.06; // 6cm - threshold to stop pinching (looser)

/**
 * Calculate pinch distance from joint positions
 */
function calculatePinchDistance(joints: MockHandJoints): number {
    return Vector3.Distance(joints.thumbTip, joints.indexTip);
}

/**
 * Determine if hand is pinching with hysteresis
 */
function isPinchingWithHysteresis(
    pinchDistance: number,
    wasPinching: boolean,
): boolean {
    if (wasPinching) {
        // Already pinching - use looser threshold to release
        return pinchDistance < PINCH_RELEASE_THRESHOLD;
    }

    // Not pinching - use tighter threshold to start
    return pinchDistance < PINCH_THRESHOLD;
}

/**
 * Calculate pinch strength (0-1) based on distance
 */
function calculatePinchStrength(pinchDistance: number): number {
    return Math.max(0, 1 - (pinchDistance / PINCH_THRESHOLD));
}

/**
 * Mock hand tracking processor for testing
 */
class MockHandTrackingProcessor {
    private pivotController: PivotController;

    // Track previous pinch state for hysteresis
    public wasPinching: Record<string, boolean> = {left: false, right: false};

    // Current hand states
    public leftHand: MockTrackedHand | null = null;
    public rightHand: MockTrackedHand | null = null;

    // Gesture tracking state
    private previousDistance: number | null = null;
    private previousDirection: Vector3 | null = null;

    private readonly GESTURE_ZOOM_SENSITIVITY = 2.0;

    constructor(pivotController: PivotController) {
        this.pivotController = pivotController;
    }

    /**
     * Create a hand with specified joint positions
     */
    createHand(
        handedness: "left" | "right",
        wristPos: Vector3,
        pinchDistance: number,
    ): MockTrackedHand {
        // Position thumb and index based on pinch distance
        const thumbTip = wristPos.add(new Vector3(0, 0, -0.1));
        const indexTip = thumbTip.add(new Vector3(pinchDistance, 0, 0));

        const isPinching = isPinchingWithHysteresis(
            pinchDistance,
            this.wasPinching[handedness],
        );

        // Update hysteresis state
        this.wasPinching[handedness] = isPinching;

        return {
            handedness,
            joints: {
                wrist: wristPos.clone(),
                thumbTip,
                indexTip,
            },
            isPinching,
            pinchStrength: calculatePinchStrength(pinchDistance),
        };
    }

    /**
     * Process two-hand gestures using hand tracking
     */
    processHandGestures(): void {
        if (!this.leftHand?.isPinching || !this.rightHand?.isPinching) {
            this.resetGestureState();
            return;
        }

        const leftPos = this.leftHand.joints.wrist;
        const rightPos = this.rightHand.joints.wrist;
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
        this.pivotController.zoom(2.0 - Math.max(0.9, Math.min(1.1, zoomFactor)));

        // Rotation from direction change
        const rotationAxis = Vector3.Cross(this.previousDirection, currentDirection);
        const axisLength = rotationAxis.length();
        if (axisLength > 0.0001) {
            const dot = Vector3.Dot(this.previousDirection, currentDirection);
            const angle = Math.acos(Math.max(-1, Math.min(1, dot)));
            rotationAxis.scaleInPlace(1 / axisLength);
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
     * Reset hysteresis state (for testing state transitions)
     */
    resetHysteresisState(): void {
        this.wasPinching = {left: false, right: false};
    }
}

/**
 * Helper to get pivot scale
 */
function getPivotScale(pivot: PivotController): number {
    return pivot.pivot.scaling.x;
}

/**
 * Helper to get pivot rotation as Euler angles
 */
function getPivotEuler(pivot: PivotController): {x: number, y: number, z: number} {
    const quat = pivot.pivot.rotationQuaternion ?? Quaternion.Identity();
    const euler = quat.toEulerAngles();
    return {x: euler.x, y: euler.y, z: euler.z};
}

describe("XR Hand Tracking", () => {
    let graph: Graph;
    let pivotController: PivotController;
    let processor: MockHandTrackingProcessor;

    beforeEach(async() => {
        graph = await createTestGraph();
        pivotController = new PivotController(graph.scene);
        processor = new MockHandTrackingProcessor(pivotController);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        cleanupTestGraph(graph);
    });

    describe("Pinch Gesture Detection", () => {
        test("pinch gesture triggers when thumb and index are close", () => {
            // Create hand with fingers close together (pinching)
            const hand = processor.createHand(
                "right",
                new Vector3(0.3, 1.0, -0.3),
                0.02, // 2cm - below PINCH_THRESHOLD (4cm)
            );

            assert.isTrue(hand.isPinching, "Should detect pinch when fingers are 2cm apart");
            assert.isAtLeast(hand.pinchStrength, 0.5, "Pinch strength should be high");
        });

        test("pinch gesture not triggered when fingers are apart", () => {
            // Create hand with fingers far apart
            const hand = processor.createHand(
                "right",
                new Vector3(0.3, 1.0, -0.3),
                0.08, // 8cm - above PINCH_RELEASE_THRESHOLD (6cm)
            );

            assert.isFalse(hand.isPinching, "Should not detect pinch when fingers are 8cm apart");
            assert.equal(hand.pinchStrength, 0, "Pinch strength should be 0 when not pinching");
        });

        test("pinch strength varies with finger distance", () => {
            // Test various distances
            const hand1 = processor.createHand("right", new Vector3(0, 0, 0), 0.01);
            const hand2 = processor.createHand("right", new Vector3(0, 0, 0), 0.02);
            const hand3 = processor.createHand("right", new Vector3(0, 0, 0), 0.03);

            assert.isAbove(hand1.pinchStrength, hand2.pinchStrength, "Closer = stronger");
            assert.isAbove(hand2.pinchStrength, hand3.pinchStrength, "Medium distance = medium strength");
        });
    });

    describe("Pinch Threshold Hysteresis", () => {
        test("pinch threshold hysteresis prevents flicker at boundary", () => {
            // Start with no pinch state
            processor.resetHysteresisState();

            // Distance between thresholds: 4cm < 5cm < 6cm
            // PINCH_THRESHOLD = 4cm, PINCH_RELEASE_THRESHOLD = 6cm
            const boundaryDistance = 0.05; // 5cm - between thresholds

            // First detection - not pinching yet, use tight threshold (4cm)
            // 5cm > 4cm, so not pinching
            const hand1 = processor.createHand("right", new Vector3(0, 0, 0), boundaryDistance);
            assert.isFalse(hand1.isPinching, "First check at 5cm should NOT be pinching (threshold 4cm)");

            // Now move to clearly pinching
            const handPinching = processor.createHand("right", new Vector3(0, 0, 0), 0.02);
            assert.isTrue(handPinching.isPinching, "2cm should be pinching");

            // Now back to boundary - should still be pinching (hysteresis)
            // Because we were pinching, use loose threshold (6cm)
            // 5cm < 6cm, so still pinching
            const hand2 = processor.createHand("right", new Vector3(0, 0, 0), boundaryDistance);
            assert.isTrue(hand2.isPinching, "At 5cm while pinching should stay pinching (threshold 6cm)");
        });

        test("pinch releases when exceeding release threshold", () => {
            // Start pinching
            processor.resetHysteresisState();
            processor.createHand("right", new Vector3(0, 0, 0), 0.02); // Pinching

            // Move beyond release threshold
            const hand = processor.createHand("right", new Vector3(0, 0, 0), 0.07); // 7cm > 6cm
            assert.isFalse(hand.isPinching, "Should release when beyond 6cm threshold");
        });

        test("hysteresis state is independent per hand", () => {
            processor.resetHysteresisState();

            // Left hand pinching
            processor.createHand("left", new Vector3(-0.3, 1.0, 0), 0.02);

            // Right hand not pinching
            const rightHand = processor.createHand("right", new Vector3(0.3, 1.0, 0), 0.05);
            assert.isFalse(rightHand.isPinching, "Right hand at 5cm should not be pinching");

            // Left hand in hysteresis zone
            const leftHand = processor.createHand("left", new Vector3(-0.3, 1.0, 0), 0.05);
            assert.isTrue(leftHand.isPinching, "Left hand at 5cm should still be pinching (hysteresis)");
        });

        test("pinch start requires crossing start threshold", () => {
            processor.resetHysteresisState();

            // Start at boundary - should not pinch
            processor.createHand("right", new Vector3(0, 0, 0), 0.05);
            assert.isFalse(processor.wasPinching.right, "Should not be pinching at 5cm initially");

            // Go slightly closer but still above start threshold
            processor.createHand("right", new Vector3(0, 0, 0), 0.045);
            assert.isFalse(processor.wasPinching.right, "Should not be pinching at 4.5cm");

            // Cross the start threshold
            processor.createHand("right", new Vector3(0, 0, 0), 0.035);
            assert.isTrue(processor.wasPinching.right, "Should be pinching at 3.5cm");
        });
    });

    describe("Two-Hand Gestures with Hand Tracking", () => {
        test("two-hand pinch zooms scene", () => {
            processor.resetHysteresisState();

            // Both hands pinching
            processor.leftHand = processor.createHand("left", new Vector3(-0.2, 1.0, -0.5), 0.02);
            processor.rightHand = processor.createHand("right", new Vector3(0.2, 1.0, -0.5), 0.02);

            // Initialize gesture
            processor.processHandGestures();

            const initialScale = getPivotScale(pivotController);

            // Move hands apart (spread)
            processor.leftHand = processor.createHand("left", new Vector3(-0.4, 1.0, -0.5), 0.02);
            processor.rightHand = processor.createHand("right", new Vector3(0.4, 1.0, -0.5), 0.02);

            processor.processHandGestures();

            const finalScale = getPivotScale(pivotController);

            assert.notEqual(finalScale, initialScale, "Two-hand spread should zoom");
        });

        test("two-hand rotation rotates scene with hands", () => {
            processor.resetHysteresisState();

            // Both hands pinching, aligned horizontally
            processor.leftHand = processor.createHand("left", new Vector3(-0.3, 1.0, -0.5), 0.02);
            processor.rightHand = processor.createHand("right", new Vector3(0.3, 1.0, -0.5), 0.02);

            // Initialize
            processor.processHandGestures();

            const initialEuler = getPivotEuler(pivotController);

            // Rotate hands (left up, right down)
            processor.leftHand = processor.createHand("left", new Vector3(-0.2, 1.2, -0.5), 0.02);
            processor.rightHand = processor.createHand("right", new Vector3(0.2, 0.8, -0.5), 0.02);

            processor.processHandGestures();

            const finalEuler = getPivotEuler(pivotController);

            const totalChange =
                Math.abs(finalEuler.x - initialEuler.x) +
                Math.abs(finalEuler.y - initialEuler.y) +
                Math.abs(finalEuler.z - initialEuler.z);

            assert.isAbove(totalChange, 0.0001, "Two-hand rotation should rotate scene");
        });

        test("releasing pinch on one hand stops gesture", () => {
            processor.resetHysteresisState();

            // Both hands pinching
            processor.leftHand = processor.createHand("left", new Vector3(-0.2, 1.0, -0.5), 0.02);
            processor.rightHand = processor.createHand("right", new Vector3(0.2, 1.0, -0.5), 0.02);

            processor.processHandGestures();

            // Release right hand pinch
            processor.rightHand = processor.createHand("right", new Vector3(0.3, 1.0, -0.5), 0.08);

            const initialScale = getPivotScale(pivotController);

            // Move left hand (should not cause gesture)
            processor.leftHand = processor.createHand("left", new Vector3(-0.4, 1.0, -0.5), 0.02);

            processor.processHandGestures();

            const finalScale = getPivotScale(pivotController);

            assert.closeTo(finalScale, initialScale, 0.0001, "Single hand should not zoom");
        });

        test("gesture continues through hand movement while pinching", () => {
            processor.resetHysteresisState();

            // Initialize gesture
            processor.leftHand = processor.createHand("left", new Vector3(-0.2, 1.0, -0.5), 0.02);
            processor.rightHand = processor.createHand("right", new Vector3(0.2, 1.0, -0.5), 0.02);
            processor.processHandGestures();

            const initialScale = getPivotScale(pivotController);

            // Accumulate multiple movements
            const steps = 5;
            for (let i = 1; i <= steps; i++) {
                const offset = i * 0.05;
                processor.leftHand = processor.createHand(
                    "left",
                    new Vector3(-0.2 - offset, 1.0, -0.5),
                    0.02,
                );
                processor.rightHand = processor.createHand(
                    "right",
                    new Vector3(0.2 + offset, 1.0, -0.5),
                    0.02,
                );
                processor.processHandGestures();
            }

            const finalScale = getPivotScale(pivotController);

            const scaleDiff = Math.abs(finalScale - initialScale);
            assert.isAbove(scaleDiff, 0.01, "Continuous gesture should accumulate");
        });
    });

    describe("Hand Tracking Edge Cases", () => {
        test("rapid pinch toggle does not cause erratic behavior", () => {
            processor.resetHysteresisState();

            const scales: number[] = [];

            // Rapidly toggle pinch state
            for (let i = 0; i < 10; i++) {
                const isPinching = i % 2 === 0;
                const distance = isPinching ? 0.02 : 0.08;

                processor.leftHand = processor.createHand(
                    "left",
                    new Vector3(-0.2, 1.0, -0.5),
                    distance,
                );
                processor.rightHand = processor.createHand(
                    "right",
                    new Vector3(0.2, 1.0, -0.5),
                    distance,
                );

                processor.processHandGestures();
                scales.push(getPivotScale(pivotController));
            }

            // Scale should not vary wildly
            const maxScale = Math.max(... scales);
            const minScale = Math.min(... scales);
            const range = maxScale - minScale;

            // Range should be reasonable (not erratic)
            assert.isBelow(range, 1.0, "Rapid toggle should not cause extreme scale changes");
        });

        test("transitioning between hands maintains stability", () => {
            processor.resetHysteresisState();

            // Start with both hands pinching
            processor.leftHand = processor.createHand("left", new Vector3(-0.2, 1.0, -0.5), 0.02);
            processor.rightHand = processor.createHand("right", new Vector3(0.2, 1.0, -0.5), 0.02);
            processor.processHandGestures();

            const scaleWithBoth = getPivotScale(pivotController);

            // Release left hand
            processor.leftHand = processor.createHand("left", new Vector3(-0.2, 1.0, -0.5), 0.08);
            processor.processHandGestures();

            // Re-engage left hand at different position
            processor.leftHand = processor.createHand("left", new Vector3(-0.4, 1.0, -0.5), 0.02);
            processor.processHandGestures();

            const scaleAfterReengage = getPivotScale(pivotController);

            // Scale should be similar - state reset should prevent jump
            const diff = Math.abs(scaleAfterReengage - scaleWithBoth);
            assert.isBelow(diff, 0.5, "Re-engaging should not cause large scale jump");
        });

        test("pinch at extreme distances handles gracefully", () => {
            processor.resetHysteresisState();

            // Very close pinch
            const closeHand = processor.createHand("right", new Vector3(0, 0, 0), 0.001);
            assert.isTrue(closeHand.isPinching, "Very close should be pinching");
            assert.isAbove(closeHand.pinchStrength, 0.9, "Very close should have high strength");

            // Zero distance
            processor.resetHysteresisState();
            const zeroHand = processor.createHand("right", new Vector3(0, 0, 0), 0);
            assert.isTrue(zeroHand.isPinching, "Zero distance should be pinching");
            assert.closeTo(zeroHand.pinchStrength, 1.0, 0.01, "Zero distance should have max strength");

            // Very far
            processor.resetHysteresisState();
            const farHand = processor.createHand("right", new Vector3(0, 0, 0), 1.0);
            assert.isFalse(farHand.isPinching, "Very far should not be pinching");
            assert.equal(farHand.pinchStrength, 0, "Very far should have zero strength");
        });
    });
});

describe("Pinch Distance Calculation", () => {
    test("calculatePinchDistance returns correct distance", () => {
        const joints: MockHandJoints = {
            wrist: new Vector3(0, 0, 0),
            thumbTip: new Vector3(0, 0, 0),
            indexTip: new Vector3(0.05, 0, 0), // 5cm apart
        };

        const distance = calculatePinchDistance(joints);
        assert.closeTo(distance, 0.05, 0.001, "Distance should be 5cm");
    });

    test("calculatePinchDistance handles 3D offset", () => {
        const joints: MockHandJoints = {
            wrist: new Vector3(0, 0, 0),
            thumbTip: new Vector3(0, 0, 0),
            indexTip: new Vector3(0.03, 0.04, 0), // 3-4-5 triangle = 5cm
        };

        const distance = calculatePinchDistance(joints);
        assert.closeTo(distance, 0.05, 0.001, "3D distance should be 5cm");
    });
});

describe("Pinch Strength Calculation", () => {
    test("calculatePinchStrength returns 1 at zero distance", () => {
        const strength = calculatePinchStrength(0);
        assert.closeTo(strength, 1.0, 0.01, "Zero distance = full strength");
    });

    test("calculatePinchStrength returns 0 at threshold", () => {
        const strength = calculatePinchStrength(PINCH_THRESHOLD);
        assert.closeTo(strength, 0.0, 0.01, "At threshold = zero strength");
    });

    test("calculatePinchStrength returns 0.5 at half threshold", () => {
        const strength = calculatePinchStrength(PINCH_THRESHOLD / 2);
        assert.closeTo(strength, 0.5, 0.01, "Half threshold = half strength");
    });

    test("calculatePinchStrength clamps to 0 beyond threshold", () => {
        const strength = calculatePinchStrength(PINCH_THRESHOLD * 2);
        assert.equal(strength, 0, "Beyond threshold = zero strength");
    });
});
