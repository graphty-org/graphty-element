import {NullEngine, type Quaternion, Scene, Vector3} from "@babylonjs/core";
import {assert} from "chai";
import {afterEach, beforeEach, describe, test} from "vitest";

import {PivotController} from "../../src/cameras/PivotController";

/**
 * Helper to safely get rotationQuaternion for testing.
 * Throws assertion error if quaternion is null.
 */
function getRotation(controller: PivotController): Quaternion {
    const rot = controller.pivot.rotationQuaternion;
    if (rot === null) {
        throw new Error("rotationQuaternion should be defined");
    }

    return rot;
}

describe("PivotController", () => {
    let engine: NullEngine;
    let scene: Scene;
    let controller: PivotController;

    beforeEach(() => {
        engine = new NullEngine();
        scene = new Scene(engine);
        controller = new PivotController(scene);
    });

    afterEach(() => {
        scene.dispose();
        engine.dispose();
    });

    describe("constructor", () => {
        test("should create pivot TransformNode at origin", () => {
            assert.isDefined(controller.pivot);
            assert.equal(controller.pivot.name, "xrPivot");
            assert.approximately(controller.pivot.position.x, 0, 0.0001);
            assert.approximately(controller.pivot.position.y, 0, 0.0001);
            assert.approximately(controller.pivot.position.z, 0, 0.0001);
        });

        test("should initialize with identity rotation", () => {
            const rot = getRotation(controller);
            assert.isDefined(rot);
            // Identity quaternion is (0, 0, 0, 1)
            assert.approximately(rot.x, 0, 0.0001);
            assert.approximately(rot.y, 0, 0.0001);
            assert.approximately(rot.z, 0, 0.0001);
            assert.approximately(rot.w, 1, 0.0001);
        });
    });

    describe("rotate", () => {
        test("should apply yaw rotation around Y-axis", () => {
            const yawDelta = Math.PI / 4; // 45 degrees
            controller.rotate(yawDelta, 0);

            const rot = getRotation(controller);
            // After Y rotation of 45 degrees, the quaternion should have non-zero y component
            assert.isAbove(Math.abs(rot.y), 0.1);
        });

        test("should apply pitch rotation around X-axis", () => {
            const pitchDelta = Math.PI / 4; // 45 degrees
            controller.rotate(0, pitchDelta);

            const rot = getRotation(controller);
            // After X rotation of 45 degrees, the quaternion should have non-zero x component
            assert.isAbove(Math.abs(rot.x), 0.1);
        });

        test("should ignore very small rotation values", () => {
            const originalRot = getRotation(controller).clone();

            controller.rotate(0.00001, 0.00001);

            const rot = getRotation(controller);
            assert.approximately(rot.x, originalRot.x, 0.0001);
            assert.approximately(rot.y, originalRot.y, 0.0001);
            assert.approximately(rot.z, originalRot.z, 0.0001);
            assert.approximately(rot.w, originalRot.w, 0.0001);
        });

        test("should apply combined yaw and pitch rotation", () => {
            const yawDelta = Math.PI / 4;
            const pitchDelta = Math.PI / 6;
            controller.rotate(yawDelta, pitchDelta);

            const rot = getRotation(controller);
            // Both x and y components should be affected
            assert.isAbove(Math.abs(rot.x), 0.05);
            assert.isAbove(Math.abs(rot.y), 0.1);
        });
    });

    describe("rotateAroundAxis", () => {
        test("should rotate around arbitrary axis", () => {
            const axis = new Vector3(1, 1, 0).normalize();
            const angle = Math.PI / 4;

            controller.rotateAroundAxis(axis, angle);

            const rot = getRotation(controller);
            // Should no longer be identity
            assert.isAbove(Math.abs(1 - rot.w), 0.01);
        });

        test("should ignore very small angles", () => {
            const originalRot = getRotation(controller).clone();
            const axis = new Vector3(1, 0, 0);

            controller.rotateAroundAxis(axis, 0.00001);

            const rot = getRotation(controller);
            assert.approximately(rot.w, originalRot.w, 0.0001);
        });

        test("should ignore zero-length axis", () => {
            const originalRot = getRotation(controller).clone();
            const axis = new Vector3(0, 0, 0);

            controller.rotateAroundAxis(axis, Math.PI / 4);

            const rot = getRotation(controller);
            assert.approximately(rot.w, originalRot.w, 0.0001);
        });
    });

    describe("spin", () => {
        test("should rotate around Z-axis", () => {
            const delta = Math.PI / 4; // 45 degrees
            controller.spin(delta);

            const rot = getRotation(controller);
            // After Z rotation, the quaternion should have non-zero z component
            assert.isAbove(Math.abs(rot.z), 0.1);
        });

        test("should ignore very small spin values", () => {
            const originalRot = getRotation(controller).clone();

            controller.spin(0.00001);

            const rot = getRotation(controller);
            assert.approximately(rot.z, originalRot.z, 0.0001);
        });
    });

    describe("zoom", () => {
        test("should scale pivot when zooming out", () => {
            controller.zoom(1.02); // Zoom out slightly

            assert.isAbove(controller.pivot.scaling.x, 1.0);
            assert.approximately(controller.pivot.scaling.x, controller.pivot.scaling.y, 0.0001);
            assert.approximately(controller.pivot.scaling.x, controller.pivot.scaling.z, 0.0001);
        });

        test("should scale pivot when zooming in", () => {
            controller.zoom(0.98); // Zoom in slightly

            assert.isBelow(controller.pivot.scaling.x, 1.0);
        });

        test("should clamp factor to maximum 1.05", () => {
            controller.zoom(2.0); // Extreme zoom factor

            // Should be clamped to 1.05
            assert.approximately(controller.pivot.scaling.x, 1.05, 0.0001);
        });

        test("should clamp factor to minimum 0.95", () => {
            controller.zoom(0.1); // Extreme zoom factor

            // Should be clamped to 0.95
            assert.approximately(controller.pivot.scaling.x, 0.95, 0.0001);
        });

        test("should not exceed maximum scale of 10", () => {
            // Apply multiple zoom outs to reach limit
            for (let i = 0; i < 100; i++) {
                controller.zoom(1.05);
            }

            assert.isAtMost(controller.pivot.scaling.x, 10);
        });

        test("should not go below minimum scale of 0.1", () => {
            // Apply multiple zoom ins to reach limit
            for (let i = 0; i < 100; i++) {
                controller.zoom(0.95);
            }

            assert.isAtLeast(controller.pivot.scaling.x, 0.1);
        });
    });

    describe("pan", () => {
        test("should translate pivot by delta vector", () => {
            const delta = new Vector3(1, 2, 3);
            controller.pan(delta);

            assert.approximately(controller.pivot.position.x, 1, 0.0001);
            assert.approximately(controller.pivot.position.y, 2, 0.0001);
            assert.approximately(controller.pivot.position.z, 3, 0.0001);
        });

        test("should accumulate pan translations", () => {
            controller.pan(new Vector3(1, 0, 0));
            controller.pan(new Vector3(0, 1, 0));

            assert.approximately(controller.pivot.position.x, 1, 0.0001);
            assert.approximately(controller.pivot.position.y, 1, 0.0001);
            assert.approximately(controller.pivot.position.z, 0, 0.0001);
        });

        test("should ignore very small pan values", () => {
            const originalPos = controller.pivot.position.clone();
            const tinyDelta = new Vector3(0.00001, 0.00001, 0.00001);

            controller.pan(tinyDelta);

            assert.approximately(controller.pivot.position.x, originalPos.x, 0.0001);
            assert.approximately(controller.pivot.position.y, originalPos.y, 0.0001);
            assert.approximately(controller.pivot.position.z, originalPos.z, 0.0001);
        });
    });

    describe("reset", () => {
        test("should reset position to origin", () => {
            controller.pan(new Vector3(5, 10, 15));
            controller.reset();

            assert.approximately(controller.pivot.position.x, 0, 0.0001);
            assert.approximately(controller.pivot.position.y, 0, 0.0001);
            assert.approximately(controller.pivot.position.z, 0, 0.0001);
        });

        test("should reset rotation to identity", () => {
            controller.rotate(Math.PI / 2, Math.PI / 4);
            controller.reset();

            const rot = getRotation(controller);
            assert.approximately(rot.x, 0, 0.0001);
            assert.approximately(rot.y, 0, 0.0001);
            assert.approximately(rot.z, 0, 0.0001);
            assert.approximately(rot.w, 1, 0.0001);
        });

        test("should reset scale to 1.0", () => {
            controller.zoom(1.05);
            controller.zoom(1.05);
            controller.reset();

            assert.approximately(controller.pivot.scaling.x, 1.0, 0.0001);
            assert.approximately(controller.pivot.scaling.y, 1.0, 0.0001);
            assert.approximately(controller.pivot.scaling.z, 1.0, 0.0001);
        });

        test("should reset all properties at once", () => {
            // Apply all transformations
            controller.pan(new Vector3(1, 2, 3));
            controller.rotate(Math.PI / 4, Math.PI / 6);
            controller.spin(Math.PI / 8);
            controller.zoom(1.05);

            // Reset everything
            controller.reset();

            // Verify all are back to initial state
            assert.approximately(controller.pivot.position.x, 0, 0.0001);
            assert.approximately(controller.pivot.position.y, 0, 0.0001);
            assert.approximately(controller.pivot.position.z, 0, 0.0001);

            const rot = getRotation(controller);
            assert.approximately(rot.x, 0, 0.0001);
            assert.approximately(rot.y, 0, 0.0001);
            assert.approximately(rot.z, 0, 0.0001);
            assert.approximately(rot.w, 1, 0.0001);

            assert.approximately(controller.pivot.scaling.x, 1.0, 0.0001);
        });
    });
});
