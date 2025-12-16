import {NullEngine, Scene, Vector3} from "@babylonjs/core";
import {assert, beforeEach, describe, test} from "vitest";

import {OrbitCameraController, OrbitConfig} from "../../src/cameras/OrbitCameraController";

/**
 * Regression tests for OrbitCameraController.zoomToBoundingBox().
 *
 * These tests ensure that:
 * 1. zoomToBoundingBox properly accounts for Z depth in 3D scenes
 * 2. All 8 corners of a 3D bounding box project within the viewport
 * 3. The fix doesn't negatively affect 2D scenes (Z=0)
 *
 * Bug history:
 * - Original implementation only used X and Y dimensions to calculate camera distance
 * - This caused elements at different Z depths to be cut off due to perspective distortion
 * - Elements closer to the camera (negative Z relative to center) appeared larger and
 *   could extend beyond the viewport bounds
 */
describe("OrbitCameraController.zoomToBoundingBox Regression Tests", () => {
    let scene: Scene;
    let canvas: HTMLCanvasElement;
    let controller: OrbitCameraController;
    const defaultConfig: OrbitConfig = {
        trackballRotationSpeed: 0.01,
        keyboardRotationSpeed: 0.05,
        keyboardZoomSpeed: 5,
        keyboardYawSpeed: 0.05,
        pinchZoomSensitivity: 0.01,
        twistYawSensitivity: 0.01,
        minZoomDistance: 1,
        maxZoomDistance: 10000,
        inertiaDamping: 0.9,
    };

    beforeEach(() => {
        const engine = new NullEngine();
        scene = new Scene(engine);
        canvas = document.createElement("canvas");
        canvas.width = 800;
        canvas.height = 600;
        controller = new OrbitCameraController(canvas, scene, defaultConfig);
    });

    describe("2D scenes (Z=0)", () => {
        test("zoomToBoundingBox centers camera at bounding box center for 2D scene", () => {
            const min = new Vector3(-10, -5, 0);
            const max = new Vector3(10, 5, 0);

            controller.zoomToBoundingBox(min, max);

            // Pivot should be at center
            const expectedCenter = new Vector3(0, 0, 0);
            assert.approximately(controller.pivot.position.x, expectedCenter.x, 0.001);
            assert.approximately(controller.pivot.position.y, expectedCenter.y, 0.001);
            assert.approximately(controller.pivot.position.z, expectedCenter.z, 0.001);
        });

        test("camera distance is positive for 2D scene", () => {
            const min = new Vector3(-10, -5, 0);
            const max = new Vector3(10, 5, 0);

            controller.zoomToBoundingBox(min, max);

            assert.isAbove(controller.cameraDistance, 0, "Camera distance should be positive");
        });

        test("wider 2D scenes require more distance than narrower ones", () => {
            const smallMin = new Vector3(-5, -5, 0);
            const smallMax = new Vector3(5, 5, 0);

            controller.zoomToBoundingBox(smallMin, smallMax);
            const smallDistance = controller.cameraDistance;

            const largeMin = new Vector3(-50, -50, 0);
            const largeMax = new Vector3(50, 50, 0);

            controller.zoomToBoundingBox(largeMin, largeMax);
            const largeDistance = controller.cameraDistance;

            assert.isAbove(largeDistance, smallDistance, "Larger scene should require more distance");
        });
    });

    describe("3D scenes with Z depth", () => {
        test("zoomToBoundingBox accounts for Z depth in 3D scenes", () => {
            // Scene with significant Z spread (like ThreeDAllArrows story)
            const min = new Vector3(-1200, -800, -600);
            const max = new Vector3(1600, 400, 600);

            controller.zoomToBoundingBox(min, max);

            // Camera distance should be calculated to fit all corners
            assert.isAbove(controller.cameraDistance, 0, "Camera distance should be positive");
        });

        test("3D scene with Z depth requires more distance than equivalent 2D scene", () => {
            // 2D scene (no Z spread)
            const min2D = new Vector3(-1200, -800, 0);
            const max2D = new Vector3(1600, 400, 0);

            controller.zoomToBoundingBox(min2D, max2D);
            const distance2D = controller.cameraDistance;

            // Reset controller
            controller = new OrbitCameraController(canvas, scene, defaultConfig);

            // 3D scene with same X/Y but with Z spread
            const min3D = new Vector3(-1200, -800, -600);
            const max3D = new Vector3(1600, 400, 600);

            controller.zoomToBoundingBox(min3D, max3D);
            const distance3D = controller.cameraDistance;

            // 3D scene should require more distance due to perspective projection
            // Elements at negative Z (closer to camera) need extra distance to fit
            assert.isAbove(distance3D, distance2D, "3D scene with Z depth should require more camera distance");
        });

        test("pivot is centered in 3D bounding box", () => {
            const min = new Vector3(-100, -50, -200);
            const max = new Vector3(100, 50, 200);

            controller.zoomToBoundingBox(min, max);

            const expectedCenter = new Vector3(0, 0, 0);
            assert.approximately(controller.pivot.position.x, expectedCenter.x, 0.001);
            assert.approximately(controller.pivot.position.y, expectedCenter.y, 0.001);
            assert.approximately(controller.pivot.position.z, expectedCenter.z, 0.001);
        });

        test("larger Z spread requires more camera distance", () => {
            // Scene with small Z spread
            const minSmallZ = new Vector3(-100, -100, -50);
            const maxSmallZ = new Vector3(100, 100, 50);

            controller.zoomToBoundingBox(minSmallZ, maxSmallZ);
            const distanceSmallZ = controller.cameraDistance;

            // Reset controller
            controller = new OrbitCameraController(canvas, scene, defaultConfig);

            // Scene with large Z spread (same X/Y dimensions)
            const minLargeZ = new Vector3(-100, -100, -500);
            const maxLargeZ = new Vector3(100, 100, 500);

            controller.zoomToBoundingBox(minLargeZ, maxLargeZ);
            const distanceLargeZ = controller.cameraDistance;

            // Larger Z spread should require more distance because
            // elements closer to camera (negative Z relative to center) appear larger
            assert.isAbove(distanceLargeZ, distanceSmallZ, "Scene with larger Z spread should require more camera distance");
        });
    });

    describe("corner projection validation", () => {
        test("all corners of 3D bounding box should project within viewport after zoom", () => {
            const min = new Vector3(-100, -100, -100);
            const max = new Vector3(100, 100, 100);

            controller.zoomToBoundingBox(min, max);

            // Get camera FOV
            const fov = controller.camera.fov || 0.8;
            const halfFovY = fov / 2;
            const aspectRatio = 800 / 600; // canvas dimensions
            const halfFovX = Math.atan(Math.tan(halfFovY) * aspectRatio);

            const center = min.add(max).scale(0.5);
            const halfSize = max.subtract(min).scale(0.5);

            // Check all 8 corners
            const corners = [
                new Vector3(-1, -1, -1),
                new Vector3(-1, -1, 1),
                new Vector3(-1, 1, -1),
                new Vector3(-1, 1, 1),
                new Vector3(1, -1, -1),
                new Vector3(1, -1, 1),
                new Vector3(1, 1, -1),
                new Vector3(1, 1, 1),
            ];

            for (const corner of corners) {
                const worldPos = new Vector3(
                    center.x + (corner.x * halfSize.x),
                    center.y + (corner.y * halfSize.y),
                    center.z + (corner.z * halfSize.z),
                );

                // Position relative to pivot (which is at center)
                const relativePos = worldPos.subtract(controller.pivot.position);

                // Distance from camera to this point
                // Camera is at (0, 0, -cameraDistance) relative to pivot
                const depth = controller.cameraDistance - relativePos.z;

                // Check that the corner projects within the FOV
                // |x| / depth < tan(halfFovX)
                // |y| / depth < tan(halfFovY)
                const projectedX = Math.abs(relativePos.x) / depth;
                const projectedY = Math.abs(relativePos.y) / depth;

                const maxProjectedX = Math.tan(halfFovX);
                const maxProjectedY = Math.tan(halfFovY);

                // Allow 5% padding (matching the implementation)
                const paddingFactor = 1.05;
                assert.isBelow(projectedX, maxProjectedX * paddingFactor, `Corner ${corner.toString()} X projection should be within FOV`);
                assert.isBelow(projectedY, maxProjectedY * paddingFactor, `Corner ${corner.toString()} Y projection should be within FOV`);
            }
        });
    });

    describe("edge cases", () => {
        test("handles zero-depth bounding box (2D plane)", () => {
            const min = new Vector3(-100, -100, 0);
            const max = new Vector3(100, 100, 0);

            controller.zoomToBoundingBox(min, max);

            assert.isAbove(controller.cameraDistance, 0);
            assert.isFinite(controller.cameraDistance);
        });

        test("handles thin bounding box in Z", () => {
            const min = new Vector3(-100, -100, -1);
            const max = new Vector3(100, 100, 1);

            controller.zoomToBoundingBox(min, max);

            assert.isAbove(controller.cameraDistance, 0);
            assert.isFinite(controller.cameraDistance);
        });

        test("handles very deep bounding box in Z", () => {
            const min = new Vector3(-10, -10, -1000);
            const max = new Vector3(10, 10, 1000);

            controller.zoomToBoundingBox(min, max);

            assert.isAbove(controller.cameraDistance, 0);
            assert.isFinite(controller.cameraDistance);
        });

        test("respects maxZoomDistance config", () => {
            const customConfig: OrbitConfig = {
                ... defaultConfig,
                maxZoomDistance: 100,
            };
            const customController = new OrbitCameraController(canvas, scene, customConfig);

            // Very large scene that would normally require more than 100 distance
            const min = new Vector3(-10000, -10000, -10000);
            const max = new Vector3(10000, 10000, 10000);

            customController.zoomToBoundingBox(min, max);

            assert.isAtMost(customController.cameraDistance, 100, "Camera distance should be clamped to maxZoomDistance");
        });

        test("respects minZoomDistance config", () => {
            const customConfig: OrbitConfig = {
                ... defaultConfig,
                minZoomDistance: 50,
            };
            const customController = new OrbitCameraController(canvas, scene, customConfig);

            // Very small scene that would normally require less than 50 distance
            const min = new Vector3(-1, -1, 0);
            const max = new Vector3(1, 1, 0);

            customController.zoomToBoundingBox(min, max);

            assert.isAtLeast(customController.cameraDistance, 50, "Camera distance should be clamped to minZoomDistance");
        });
    });

    describe("ThreeDAllArrows story regression", () => {
        test("camera distance handles the exact scenario from ThreeDAllArrows story", () => {
            // These are the actual scaled positions from the ThreeDAllArrows story
            // (node positions * scalingFactor of 100)
            // Row 1 (front): y=400, z=600
            // Row 4 (back/vee): y=-800, z=-600
            // X spans from -1200 to 1600

            const min = new Vector3(-1200, -800, -600);
            const max = new Vector3(1600, 400, 600);

            controller.zoomToBoundingBox(min, max);

            // The key assertion: camera should be far enough to see the vee row
            // which is at y=-800, z=-600 (closer to camera, so appears lower)
            const fov = controller.camera.fov || 0.8;
            const halfFovY = fov / 2;

            // The vee row corner: y=-800 relative to center (y=-200), z=-600 relative to center (z=0)
            // So relative position is y=-600, z=-600
            const veeRelativeY = -800 - (-200); // = -600
            const veeRelativeZ = -600 - 0; // = -600

            // Depth from camera to vee row
            const depth = controller.cameraDistance - veeRelativeZ;

            // Check that vee row projects within vertical FOV
            const projectedY = Math.abs(veeRelativeY) / depth;
            const maxProjectedY = Math.tan(halfFovY);

            // Allow for 5% padding
            assert.isBelow(projectedY, maxProjectedY * 1.05, "Vee row should project within vertical FOV (this was the original bug)");
        });
    });
});
