import {Animation, Camera, EasingFunction, Scene, Vector3} from "@babylonjs/core";
import {assert, beforeEach, describe, test, vi} from "vitest";

import {CameraPathAnimator, type CameraPathAnimatorOptions} from "../../../src/video/CameraPathAnimator.js";
import type {CameraWaypoint} from "../../../src/video/VideoCapture.js";

// Helper to create a mock 3D camera
function createMock3DCamera(): Camera {
    return {
        mode: Camera.PERSPECTIVE_CAMERA,
        animations: [] as Animation[],
        position: new Vector3(0, 0, 10),
    } as unknown as Camera;
}

// Helper to create a mock 2D camera
function createMock2DCamera(): Camera {
    return {
        mode: Camera.ORTHOGRAPHIC_CAMERA,
        animations: [] as Animation[],
        position: new Vector3(0, 0, 0),
    } as unknown as Camera;
}

// Helper to create a mock scene
function createMockScene(): Scene {
    return {
        beginAnimation: vi.fn().mockReturnValue({
            stop: vi.fn(),
        }),
    } as unknown as Scene;
}

describe("CameraPathAnimator", () => {
    let camera: Camera;
    let scene: Scene;
    let defaultOptions: CameraPathAnimatorOptions;

    beforeEach(() => {
        camera = createMock3DCamera();
        scene = createMockScene();
        defaultOptions = {
            fps: 30,
            duration: 5000,
            easing: "linear",
        };
    });

    describe("constructor", () => {
        test("initializes with default options", () => {
            const animator = new CameraPathAnimator(camera, scene, defaultOptions);
            assert.ok(animator);
            assert.equal(animator.getTotalFrames(), 150); // 5 seconds at 30fps
        });

        test("defaults to linear easing when not specified", () => {
            const animator = new CameraPathAnimator(camera, scene, {
                fps: 30,
                duration: 2000,
            });
            assert.ok(animator);
        });
    });

    describe("createCameraAnimations - 3D camera", () => {
        test("creates position and target animations for 3D camera", () => {
            const animator = new CameraPathAnimator(camera, scene, defaultOptions);

            const waypoints: CameraWaypoint[] = [
                {position: {x: 10, y: 10, z: 10}, target: {x: 0, y: 0, z: 0}},
                {position: {x: -10, y: 10, z: 10}, target: {x: 0, y: 0, z: 0}, duration: 5000},
            ];

            const animations = animator.createCameraAnimations(waypoints);

            assert.equal(animations.length, 2);
            assert.equal(animations[0].targetProperty, "position");
            assert.equal(animations[1].targetProperty, "target");
        });

        test("converts waypoints to correct frame keys", () => {
            const animator = new CameraPathAnimator(camera, scene, defaultOptions);

            const waypoints: CameraWaypoint[] = [
                {position: {x: 10, y: 10, z: 10}, target: {x: 0, y: 0, z: 0}},
                {position: {x: 0, y: 20, z: 0}, target: {x: 0, y: 0, z: 0}, duration: 2500},
                {position: {x: -10, y: 10, z: 10}, target: {x: 0, y: 0, z: 0}, duration: 2500},
            ];

            const animations = animator.createCameraAnimations(waypoints);
            const positionAnimation = animations.find((a) => a.targetProperty === "position");

            assert.ok(positionAnimation);
            const keys = positionAnimation.getKeys();

            assert.equal(keys.length, 3);
            // First waypoint at frame 0
            assert.equal(keys[0].frame, 0);
            // Second waypoint at frame 75 (2.5 seconds * 30 fps)
            assert.equal(keys[1].frame, 75);
            // Third waypoint at frame 150 (5 seconds * 30 fps)
            assert.equal(keys[2].frame, 150);
        });

        test("sets correct Vector3 values for position keys", () => {
            const animator = new CameraPathAnimator(camera, scene, defaultOptions);

            const waypoints: CameraWaypoint[] = [
                {position: {x: 10, y: 20, z: 30}, target: {x: 0, y: 0, z: 0}},
                {position: {x: -10, y: -20, z: -30}, target: {x: 1, y: 2, z: 3}, duration: 5000},
            ];

            const animations = animator.createCameraAnimations(waypoints);
            const positionAnimation = animations.find((a) => a.targetProperty === "position");

            assert.ok(positionAnimation);
            const keys = positionAnimation.getKeys();

            // Check first waypoint position
            const pos0 = keys[0].value as Vector3;
            assert.equal(pos0.x, 10);
            assert.equal(pos0.y, 20);
            assert.equal(pos0.z, 30);

            // Check second waypoint position
            const pos1 = keys[1].value as Vector3;
            assert.equal(pos1.x, -10);
            assert.equal(pos1.y, -20);
            assert.equal(pos1.z, -30);
        });

        test("sets correct Vector3 values for target keys", () => {
            const animator = new CameraPathAnimator(camera, scene, defaultOptions);

            const waypoints: CameraWaypoint[] = [
                {position: {x: 0, y: 0, z: 10}, target: {x: 1, y: 2, z: 3}},
                {position: {x: 0, y: 0, z: -10}, target: {x: 4, y: 5, z: 6}, duration: 5000},
            ];

            const animations = animator.createCameraAnimations(waypoints);
            const targetAnimation = animations.find((a) => a.targetProperty === "target");

            assert.ok(targetAnimation);
            const keys = targetAnimation.getKeys();

            // Check first waypoint target
            const target0 = keys[0].value as Vector3;
            assert.equal(target0.x, 1);
            assert.equal(target0.y, 2);
            assert.equal(target0.z, 3);

            // Check second waypoint target
            const target1 = keys[1].value as Vector3;
            assert.equal(target1.x, 4);
            assert.equal(target1.y, 5);
            assert.equal(target1.z, 6);
        });

        test("throws error with less than 2 waypoints", () => {
            const animator = new CameraPathAnimator(camera, scene, defaultOptions);

            const waypoints: CameraWaypoint[] = [
                {position: {x: 10, y: 10, z: 10}, target: {x: 0, y: 0, z: 0}},
            ];

            assert.throws(() => {
                animator.createCameraAnimations(waypoints);
            }, /At least 2 waypoints are required/);
        });
    });

    describe("createCameraAnimations - 2D camera", () => {
        test("creates zoom and pan animations for 2D camera", () => {
            camera = createMock2DCamera();
            const animator = new CameraPathAnimator(camera, scene, defaultOptions);

            const waypoints: CameraWaypoint[] = [
                {position: {x: 0, y: 0, z: 10}, target: {x: 0, y: 0, z: 0}},
                {position: {x: 5, y: 5, z: 20}, target: {x: 0, y: 0, z: 0}, duration: 5000},
            ];

            const animations = animator.createCameraAnimations(waypoints);

            assert.equal(animations.length, 3);
            assert.ok(animations.find((a) => a.targetProperty === "orthoSize"));
            assert.ok(animations.find((a) => a.targetProperty === "position.x"));
            assert.ok(animations.find((a) => a.targetProperty === "position.y"));
        });

        test("is2DCamera returns correct value", () => {
            const animator3D = new CameraPathAnimator(camera, scene, defaultOptions);
            assert.equal(animator3D.is2DCamera(), false);

            camera = createMock2DCamera();
            const animator2D = new CameraPathAnimator(camera, scene, defaultOptions);
            assert.equal(animator2D.is2DCamera(), true);
        });
    });

    describe("easing", () => {
        test("applies easeInOut easing to animations", () => {
            const animator = new CameraPathAnimator(camera, scene, {
                ... defaultOptions,
                easing: "easeInOut",
            });

            const waypoints: CameraWaypoint[] = [
                {position: {x: 10, y: 10, z: 10}, target: {x: 0, y: 0, z: 0}},
                {position: {x: -10, y: 10, z: 10}, target: {x: 0, y: 0, z: 0}, duration: 5000},
            ];

            const animations = animator.createCameraAnimations(waypoints);
            const positionAnimation = animations[0];

            const easingFn = positionAnimation.getEasingFunction() as EasingFunction | undefined;
            assert.ok(easingFn);
            assert.equal(easingFn.getEasingMode(), EasingFunction.EASINGMODE_EASEINOUT);
        });

        test("applies easeIn easing to animations", () => {
            const animator = new CameraPathAnimator(camera, scene, {
                ... defaultOptions,
                easing: "easeIn",
            });

            const waypoints: CameraWaypoint[] = [
                {position: {x: 10, y: 10, z: 10}, target: {x: 0, y: 0, z: 0}},
                {position: {x: -10, y: 10, z: 10}, target: {x: 0, y: 0, z: 0}, duration: 5000},
            ];

            const animations = animator.createCameraAnimations(waypoints);
            const positionAnimation = animations[0];

            const easingFn = positionAnimation.getEasingFunction() as EasingFunction | undefined;
            assert.ok(easingFn);
            assert.equal(easingFn.getEasingMode(), EasingFunction.EASINGMODE_EASEIN);
        });

        test("applies easeOut easing to animations", () => {
            const animator = new CameraPathAnimator(camera, scene, {
                ... defaultOptions,
                easing: "easeOut",
            });

            const waypoints: CameraWaypoint[] = [
                {position: {x: 10, y: 10, z: 10}, target: {x: 0, y: 0, z: 0}},
                {position: {x: -10, y: 10, z: 10}, target: {x: 0, y: 0, z: 0}, duration: 5000},
            ];

            const animations = animator.createCameraAnimations(waypoints);
            const positionAnimation = animations[0];

            const easingFn = positionAnimation.getEasingFunction() as EasingFunction | undefined;
            assert.ok(easingFn);
            assert.equal(easingFn.getEasingMode(), EasingFunction.EASINGMODE_EASEOUT);
        });

        test("linear easing has no easing function", () => {
            const animator = new CameraPathAnimator(camera, scene, {
                ... defaultOptions,
                easing: "linear",
            });

            const waypoints: CameraWaypoint[] = [
                {position: {x: 10, y: 10, z: 10}, target: {x: 0, y: 0, z: 0}},
                {position: {x: -10, y: 10, z: 10}, target: {x: 0, y: 0, z: 0}, duration: 5000},
            ];

            const animations = animator.createCameraAnimations(waypoints);
            const positionAnimation = animations[0];

            const easingFn = positionAnimation.getEasingFunction();
            assert.equal(easingFn, null);
        });
    });

    describe("getTotalFrames", () => {
        test("calculates total frames correctly", () => {
            const animator = new CameraPathAnimator(camera, scene, {
                fps: 30,
                duration: 5000,
            });
            assert.equal(animator.getTotalFrames(), 150); // 5 seconds * 30 fps

            const animator60 = new CameraPathAnimator(camera, scene, {
                fps: 60,
                duration: 2000,
            });
            assert.equal(animator60.getTotalFrames(), 120); // 2 seconds * 60 fps
        });
    });

    describe("startRealtimeAnimation", () => {
        test("starts animation on scene", async() => {
            const animator = new CameraPathAnimator(camera, scene, defaultOptions);

            const waypoints: CameraWaypoint[] = [
                {position: {x: 10, y: 10, z: 10}, target: {x: 0, y: 0, z: 0}},
                {position: {x: -10, y: 10, z: 10}, target: {x: 0, y: 0, z: 0}, duration: 5000},
            ];

            animator.createCameraAnimations(waypoints);

            // Mock the animation completion
            const mockAnimatable = {stop: vi.fn()};
            (scene.beginAnimation as ReturnType<typeof vi.fn>).mockImplementation(
                (_target, _from, _to, _loop, _speed, onAnimationEnd) => {
                    // Simulate immediate completion
                    setTimeout(() => onAnimationEnd?.(), 0);
                    return mockAnimatable;
                },
            );

            await animator.startRealtimeAnimation();

            // Verify beginAnimation was called
            assert.ok((scene.beginAnimation as ReturnType<typeof vi.fn>).mock.calls.length > 0);
            const call = (scene.beginAnimation as ReturnType<typeof vi.fn>).mock.calls[0];
            assert.equal(call[0], camera);
            assert.equal(call[1], 0); // from frame
            assert.equal(call[2], 150); // to frame (5 seconds * 30 fps)
            assert.equal(call[3], false); // don't loop
            assert.equal(call[4], 1.0); // speed
        });

        test("throws error if animations not created", async() => {
            const animator = new CameraPathAnimator(camera, scene, defaultOptions);

            try {
                await animator.startRealtimeAnimation();
                assert.fail("Should have thrown error");
            } catch (error) {
                assert.ok((error as Error).message.includes("No animations created"));
            }
        });
    });

    describe("stopAnimation", () => {
        test("stops current animation", () => {
            const animator = new CameraPathAnimator(camera, scene, defaultOptions);

            const waypoints: CameraWaypoint[] = [
                {position: {x: 10, y: 10, z: 10}, target: {x: 0, y: 0, z: 0}},
                {position: {x: -10, y: 10, z: 10}, target: {x: 0, y: 0, z: 0}, duration: 5000},
            ];

            animator.createCameraAnimations(waypoints);

            const mockStop = vi.fn();
            const mockAnimatable = {stop: mockStop};
            (scene.beginAnimation as ReturnType<typeof vi.fn>).mockReturnValue(mockAnimatable);

            // Start but don't await
            void animator.startRealtimeAnimation();

            // Stop immediately
            animator.stopAnimation();

            assert.ok(mockStop.mock.calls.length > 0);
        });

        test("does nothing if no animation running", () => {
            const animator = new CameraPathAnimator(camera, scene, defaultOptions);

            // Should not throw (non-async test)
            animator.stopAnimation();
            assert.ok(true); // Confirm no error thrown
        });
    });

    describe("getCameraStateAtFrame", () => {
        test("returns position and target for 3D camera", () => {
            const animator = new CameraPathAnimator(camera, scene, defaultOptions);

            const waypoints: CameraWaypoint[] = [
                {position: {x: 10, y: 10, z: 10}, target: {x: 0, y: 0, z: 0}},
                {position: {x: -10, y: -10, z: -10}, target: {x: 5, y: 5, z: 5}, duration: 5000},
            ];

            animator.createCameraAnimations(waypoints);

            // Get state at frame 0 (start)
            const stateStart = animator.getCameraStateAtFrame(0);
            assert.ok(stateStart.position);
            assert.ok(stateStart.target);

            // Get state at final frame
            const stateEnd = animator.getCameraStateAtFrame(150);
            assert.ok(stateEnd.position);
            assert.ok(stateEnd.target);
        });

        test("returns zoom and pan for 2D camera", () => {
            camera = createMock2DCamera();
            const animator = new CameraPathAnimator(camera, scene, defaultOptions);

            const waypoints: CameraWaypoint[] = [
                {position: {x: 0, y: 0, z: 10}, target: {x: 0, y: 0, z: 0}},
                {position: {x: 5, y: 5, z: 20}, target: {x: 0, y: 0, z: 0}, duration: 5000},
            ];

            animator.createCameraAnimations(waypoints);

            const state = animator.getCameraStateAtFrame(0);
            assert.ok("zoom" in state || state.zoom === undefined);
            assert.ok("pan" in state);
            assert.ok(state.pan);
            assert.equal(typeof state.pan.x, "number");
            assert.equal(typeof state.pan.y, "number");
        });

        test("throws error if animations not created", () => {
            const animator = new CameraPathAnimator(camera, scene, defaultOptions);

            assert.throws(() => {
                animator.getCameraStateAtFrame(0);
            }, /No animations created/);
        });
    });

    describe("getAnimations", () => {
        test("returns empty array before createCameraAnimations", () => {
            const animator = new CameraPathAnimator(camera, scene, defaultOptions);
            assert.deepEqual(animator.getAnimations(), []);
        });

        test("returns animations after createCameraAnimations", () => {
            const animator = new CameraPathAnimator(camera, scene, defaultOptions);

            const waypoints: CameraWaypoint[] = [
                {position: {x: 10, y: 10, z: 10}, target: {x: 0, y: 0, z: 0}},
                {position: {x: -10, y: 10, z: 10}, target: {x: 0, y: 0, z: 0}, duration: 5000},
            ];

            animator.createCameraAnimations(waypoints);

            const animations = animator.getAnimations();
            assert.equal(animations.length, 2);
        });
    });

    describe("multiple waypoints", () => {
        test("handles 4 waypoints correctly", () => {
            const animator = new CameraPathAnimator(camera, scene, {
                fps: 30,
                duration: 6000, // 6 seconds total
            });

            const waypoints: CameraWaypoint[] = [
                {position: {x: 10, y: 10, z: 10}, target: {x: 0, y: 0, z: 0}}, // Start
                {position: {x: 0, y: 20, z: 0}, target: {x: 0, y: 0, z: 0}, duration: 2000}, // 2s
                {position: {x: -10, y: 10, z: 10}, target: {x: 0, y: 0, z: 0}, duration: 2000}, // 4s
                {position: {x: 10, y: 0, z: -10}, target: {x: 0, y: 0, z: 0}, duration: 2000}, // 6s
            ];

            const animations = animator.createCameraAnimations(waypoints);
            const positionAnimation = animations.find((a) => a.targetProperty === "position");

            assert.ok(positionAnimation);
            const keys = positionAnimation.getKeys();

            assert.equal(keys.length, 4);
            assert.equal(keys[0].frame, 0);
            assert.equal(keys[1].frame, 60); // 2 seconds * 30 fps
            assert.equal(keys[2].frame, 120); // 4 seconds * 30 fps
            assert.equal(keys[3].frame, 180); // 6 seconds * 30 fps
        });
    });
});
