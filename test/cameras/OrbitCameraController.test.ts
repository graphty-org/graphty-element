import {NullEngine, Scene, Vector3} from "@babylonjs/core";
import {assert} from "chai";
import {afterEach, beforeEach, describe, test, vi} from "vitest";

import {OrbitCameraController, type OrbitConfig} from "../../src/cameras/OrbitCameraController";

/**
 * Mock canvas element for NullEngine testing.
 * This is a minimal mock that provides the required properties.
 */
function createMockCanvas(): Element {
    return {
        addEventListener: () => {
            // Mock for NullEngine testing
        },
        removeEventListener: () => {
            // Mock for NullEngine testing
        },
        style: {},
        getAttribute: () => null,
        setAttribute: () => {
            // Mock for NullEngine testing
        },
        getBoundingClientRect: () => ({top: 0, left: 0, width: 800, height: 600}),
        focus: () => {
            // Mock for NullEngine testing
        },
    } as unknown as Element;
}

/**
 * Default configuration for tests
 */
function getDefaultConfig(): OrbitConfig {
    return {
        trackballRotationSpeed: 0.01,
        keyboardRotationSpeed: 0.02,
        keyboardZoomSpeed: 0.5,
        keyboardYawSpeed: 0.03,
        pinchZoomSensitivity: 0.01,
        twistYawSensitivity: 1.0,
        minZoomDistance: 1,
        maxZoomDistance: 100,
        inertiaDamping: 0.95,
    };
}

describe("OrbitCameraController", () => {
    let engine: NullEngine;
    let scene: Scene;
    let canvas: Element;
    let controller: OrbitCameraController;
    let config: OrbitConfig;

    beforeEach(() => {
        engine = new NullEngine();
        scene = new Scene(engine);
        canvas = createMockCanvas();
        config = getDefaultConfig();
        controller = new OrbitCameraController(canvas, scene, config);
    });

    afterEach(() => {
        scene.dispose();
        engine.dispose();
    });

    describe("constructor", () => {
        test("should create camera at initial distance", () => {
            assert.isDefined(controller.camera);
            assert.equal(controller.cameraDistance, 10);
        });

        test("should create pivot TransformNode", () => {
            assert.isDefined(controller.pivot);
            // The pivot should exist in the scene
            assert.isTrue(controller.pivot.getScene() === scene);
        });

        test("should set camera as active camera", () => {
            assert.equal(scene.activeCamera, controller.camera);
        });

        test("should parent camera to pivot", () => {
            assert.equal(controller.camera.parent, controller.pivot);
        });

        test("should store config reference", () => {
            assert.equal(controller.config, config);
        });
    });

    describe("rotate", () => {
        test("should delegate rotation to PivotController", () => {
            // The pivotController is private but we can test its effect through the pivot
            const initialRotation = controller.pivot.rotationQuaternion;
            assert.isNotNull(initialRotation, "Initial rotation should exist");

            const initialClone = initialRotation.clone();

            controller.rotate(10, 5); // dx=10, dy=5

            // After rotation, the pivot should have a different rotation
            const finalRotation = controller.pivot.rotationQuaternion;
            assert.isNotNull(finalRotation);

            // Quaternion should have changed
            const hasChanged =
                Math.abs(initialClone.x - finalRotation.x) > 0.001 ||
                Math.abs(initialClone.y - finalRotation.y) > 0.001;
            assert.isTrue(hasChanged, "Rotation should have changed the pivot quaternion");
        });

        test("should apply trackballRotationSpeed to rotation", () => {
            // With trackballRotationSpeed = 0.01, a dx of 100 should give yaw = -1 radian
            const dx = 100;

            controller.rotate(dx, 0);

            // The pivot should be rotated by -dx * speed around Y axis
            const rot = controller.pivot.rotationQuaternion;
            assert.isNotNull(rot, "Rotation quaternion should exist");
            // For a pure Y rotation of angle theta, quat.y = sin(theta/2)
            // Expected yaw = -100 * 0.01 = -1 radian
            // sin(-0.5) ≈ -0.479
            assert.isAbove(Math.abs(rot.y), 0.1, "Y component should reflect rotation");
        });

        test("should update camera position after rotation", () => {
            const updateSpy = vi.spyOn(controller, "updateCameraPosition");

            controller.rotate(10, 5);

            assert.isTrue(updateSpy.mock.calls.length >= 1, "updateCameraPosition should be called");
        });
    });

    describe("spin", () => {
        test("should delegate spin to PivotController", () => {
            const initialRotation = controller.pivot.rotationQuaternion;
            assert.isNotNull(initialRotation, "Initial rotation should exist");

            const initialClone = initialRotation.clone();

            controller.spin(Math.PI / 4); // 45 degrees

            const finalRotation = controller.pivot.rotationQuaternion;
            assert.isNotNull(finalRotation);

            // Z rotation should have changed
            assert.isAbove(Math.abs(finalRotation.z - initialClone.z), 0.1);
        });

        test("should update camera position after spin", () => {
            const updateSpy = vi.spyOn(controller, "updateCameraPosition");

            controller.spin(0.1);

            assert.isTrue(updateSpy.mock.calls.length >= 1, "updateCameraPosition should be called");
        });
    });

    describe("zoom", () => {
        test("should adjust camera distance", () => {
            const initial = controller.cameraDistance;

            controller.zoom(5); // Zoom out by 5

            assert.equal(controller.cameraDistance, initial + 5);
        });

        test("should clamp to minimum zoom distance", () => {
            controller.zoom(-100); // Try to zoom in past minimum

            assert.equal(controller.cameraDistance, config.minZoomDistance);
        });

        test("should clamp to maximum zoom distance", () => {
            controller.zoom(200); // Try to zoom out past maximum

            assert.equal(controller.cameraDistance, config.maxZoomDistance);
        });

        test("should use camera distance (not scale-based zoom)", () => {
            // Verify that zoom uses camera distance, not pivot scaling
            const initialScale = controller.pivot.scaling.clone();

            controller.zoom(5);

            // Pivot scale should remain unchanged (this is different from XR's scale-based zoom)
            assert.approximately(controller.pivot.scaling.x, initialScale.x, 0.0001);
            assert.approximately(controller.pivot.scaling.y, initialScale.y, 0.0001);
            assert.approximately(controller.pivot.scaling.z, initialScale.z, 0.0001);
        });
    });

    describe("updateCameraPosition", () => {
        test("should parent camera to pivot", () => {
            controller.updateCameraPosition();

            assert.equal(controller.camera.parent, controller.pivot);
        });

        test("should position camera at negative z distance", () => {
            controller.cameraDistance = 15;
            controller.updateCameraPosition();

            assert.approximately(controller.camera.position.z, -15, 0.0001);
            assert.approximately(controller.camera.position.x, 0, 0.0001);
            assert.approximately(controller.camera.position.y, 0, 0.0001);
        });

        test("should reset camera rotation to zero", () => {
            controller.updateCameraPosition();

            assert.approximately(controller.camera.rotation.x, 0, 0.0001);
            assert.approximately(controller.camera.rotation.y, 0, 0.0001);
            assert.approximately(controller.camera.rotation.z, 0, 0.0001);
        });
    });

    describe("zoomToBoundingBox", () => {
        test("should position pivot at center of bounding box", () => {
            const min = new Vector3(-5, -5, -5);
            const max = new Vector3(5, 5, 5);

            controller.zoomToBoundingBox(min, max);

            // Center should be (0, 0, 0)
            assert.approximately(controller.pivot.position.x, 0, 0.0001);
            assert.approximately(controller.pivot.position.y, 0, 0.0001);
            assert.approximately(controller.pivot.position.z, 0, 0.0001);
        });

        test("should position pivot at offset center", () => {
            const min = new Vector3(0, 0, 0);
            const max = new Vector3(10, 10, 10);

            controller.zoomToBoundingBox(min, max);

            // Center should be (5, 5, 5)
            assert.approximately(controller.pivot.position.x, 5, 0.0001);
            assert.approximately(controller.pivot.position.y, 5, 0.0001);
            assert.approximately(controller.pivot.position.z, 5, 0.0001);
        });

        test("should adjust camera distance based on bounding box size", () => {
            const initialDistance = controller.cameraDistance;
            const min = new Vector3(-50, -50, -50);
            const max = new Vector3(50, 50, 50);

            controller.zoomToBoundingBox(min, max);

            // For a large bounding box, camera should be further away
            assert.isAbove(controller.cameraDistance, initialDistance);
        });

        test("should clamp camera distance to configured limits", () => {
            // Very large bounding box
            const min = new Vector3(-1000, -1000, -1000);
            const max = new Vector3(1000, 1000, 1000);

            controller.zoomToBoundingBox(min, max);

            assert.isAtMost(controller.cameraDistance, config.maxZoomDistance);
        });
    });

    describe("PivotController integration", () => {
        test("pivot should use quaternion for rotation", () => {
            // After refactor, pivot uses PivotController which uses quaternion
            assert.isNotNull(controller.pivot.rotationQuaternion);
        });

        test("multiple rotations should accumulate", () => {
            controller.rotate(50, 0); // First rotation
            const afterFirst = controller.pivot.rotationQuaternion?.y ?? 0;

            controller.rotate(50, 0); // Second rotation
            const afterSecond = controller.pivot.rotationQuaternion?.y ?? 0;

            // Second rotation should have accumulated
            assert.isAbove(Math.abs(afterSecond), Math.abs(afterFirst));
        });

        test("rotation and spin should combine correctly", () => {
            controller.rotate(50, 25); // Yaw and pitch
            controller.spin(0.5); // Roll

            const rot = controller.pivot.rotationQuaternion;
            assert.isNotNull(rot, "Rotation quaternion should exist");

            // All three components should be affected
            assert.isAbove(Math.abs(rot.x), 0.01, "X should be affected by pitch");
            assert.isAbove(Math.abs(rot.y), 0.1, "Y should be affected by yaw");
            assert.isAbove(Math.abs(rot.z), 0.1, "Z should be affected by spin");
        });
    });
});
