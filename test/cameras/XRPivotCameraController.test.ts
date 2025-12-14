import {NullEngine, Scene, TransformNode, Vector3, WebXRState} from "@babylonjs/core";
import {assert} from "chai";
import {afterEach, beforeEach, describe, test, vi} from "vitest";

import {XRPivotCameraController} from "../../src/cameras/XRPivotCameraController";

describe("XRPivotCameraController", () => {
    let engine: NullEngine;
    let scene: Scene;
    let controller: XRPivotCameraController | undefined;

    // Mock XR experience
    interface MockStateObservable {
        add: ReturnType<typeof vi.fn>;
        handlers: ((state: WebXRState) => void)[];
    }

    interface MockInputObservable<T> {
        add: ReturnType<typeof vi.fn>;
        handlers: ((item: T) => void)[];
    }

    let mockCamera: TransformNode;
    let mockXRExperience: {
        input: {
            onControllerAddedObservable: MockInputObservable<unknown>;
            onControllerRemovedObservable: MockInputObservable<unknown>;
            controllers: unknown[];
        };
        baseExperience: {
            onStateChangedObservable: MockStateObservable;
            onInitialXRPoseSetObservable: {
                add: ReturnType<typeof vi.fn>;
            };
            camera: TransformNode;
            featuresManager: {
                getEnabledFeature: ReturnType<typeof vi.fn>;
            };
            sessionManager: {
                scene: Scene;
            };
        };
    };

    beforeEach(() => {
        engine = new NullEngine();
        scene = new Scene(engine);

        // Create mock camera
        mockCamera = new TransformNode("mockXRCamera", scene);

        // Create mock XR experience
        mockXRExperience = {
            input: {
                onControllerAddedObservable: {
                    add: vi.fn((handler) => {
                        mockXRExperience.input.onControllerAddedObservable.handlers.push(handler);
                    }),
                    handlers: [],
                },
                onControllerRemovedObservable: {
                    add: vi.fn((handler) => {
                        mockXRExperience.input.onControllerRemovedObservable.handlers.push(handler);
                    }),
                    handlers: [],
                },
                controllers: [],
            },
            baseExperience: {
                onStateChangedObservable: {
                    add: vi.fn((handler) => {
                        mockXRExperience.baseExperience.onStateChangedObservable.handlers.push(handler);
                    }),
                    handlers: [],
                },
                onInitialXRPoseSetObservable: {
                    add: vi.fn(),
                },
                camera: mockCamera,
                featuresManager: {
                    getEnabledFeature: vi.fn().mockReturnValue(null),
                },
                sessionManager: {
                    scene,
                },
            },
        };
    });

    afterEach(() => {
        controller?.dispose();
        mockCamera.dispose();
        scene.dispose();
        engine.dispose();
    });

    describe("constructor", () => {
        test("should create pivot controller", () => {
            controller = new XRPivotCameraController(
                scene,
                mockXRExperience as unknown as import("@babylonjs/core").WebXRDefaultExperience,
            );

            assert.isDefined(controller.pivot);
            assert.equal(controller.pivot.name, "xrPivot");
        });

        test("should subscribe to XR state changes", () => {
            controller = new XRPivotCameraController(
                scene,
                mockXRExperience as unknown as import("@babylonjs/core").WebXRDefaultExperience,
            );

            assert.isAbove(mockXRExperience.baseExperience.onStateChangedObservable.add.mock.calls.length, 0);
        });
    });

    describe("XR state transitions", () => {
        test("should parent camera to pivot when entering XR", () => {
            controller = new XRPivotCameraController(
                scene,
                mockXRExperience as unknown as import("@babylonjs/core").WebXRDefaultExperience,
            );

            // Simulate entering XR
            mockXRExperience.baseExperience.onStateChangedObservable.handlers.forEach((h) => {
                h(WebXRState.IN_XR);
            });

            assert.equal(mockCamera.parent, controller.pivot);
        });

        test("should enable input handler when entering XR", () => {
            controller = new XRPivotCameraController(
                scene,
                mockXRExperience as unknown as import("@babylonjs/core").WebXRDefaultExperience,
            );

            const inputHandler = controller.getInputHandler();
            assert.isFalse(inputHandler.isEnabled());

            // Simulate entering XR
            mockXRExperience.baseExperience.onStateChangedObservable.handlers.forEach((h) => {
                h(WebXRState.IN_XR);
            });

            assert.isTrue(inputHandler.isEnabled());
        });

        test("should unparent camera when exiting XR", () => {
            controller = new XRPivotCameraController(
                scene,
                mockXRExperience as unknown as import("@babylonjs/core").WebXRDefaultExperience,
            );

            // Enter XR first
            mockXRExperience.baseExperience.onStateChangedObservable.handlers.forEach((h) => {
                h(WebXRState.IN_XR);
            });
            assert.equal(mockCamera.parent, controller.pivot);

            // Exit XR
            mockXRExperience.baseExperience.onStateChangedObservable.handlers.forEach((h) => {
                h(WebXRState.NOT_IN_XR);
            });

            assert.isNull(mockCamera.parent);
        });

        test("should disable input handler when exiting XR", () => {
            controller = new XRPivotCameraController(
                scene,
                mockXRExperience as unknown as import("@babylonjs/core").WebXRDefaultExperience,
            );

            // Enter XR
            mockXRExperience.baseExperience.onStateChangedObservable.handlers.forEach((h) => {
                h(WebXRState.IN_XR);
            });
            const inputHandler = controller.getInputHandler();
            assert.isTrue(inputHandler.isEnabled());

            // Exit XR
            mockXRExperience.baseExperience.onStateChangedObservable.handlers.forEach((h) => {
                h(WebXRState.NOT_IN_XR);
            });

            assert.isFalse(inputHandler.isEnabled());
        });
    });

    describe("update", () => {
        test("should call update without errors", () => {
            controller = new XRPivotCameraController(
                scene,
                mockXRExperience as unknown as import("@babylonjs/core").WebXRDefaultExperience,
            );

            assert.doesNotThrow(() => {
                controller?.update();
            });
        });

        test("should update input handler", () => {
            controller = new XRPivotCameraController(
                scene,
                mockXRExperience as unknown as import("@babylonjs/core").WebXRDefaultExperience,
            );

            // Enter XR to enable input
            mockXRExperience.baseExperience.onStateChangedObservable.handlers.forEach((h) => {
                h(WebXRState.IN_XR);
            });

            // Should not throw
            assert.doesNotThrow(() => {
                controller?.update();
            });
        });
    });

    describe("pivot access", () => {
        test("should expose pivot TransformNode", () => {
            controller = new XRPivotCameraController(
                scene,
                mockXRExperience as unknown as import("@babylonjs/core").WebXRDefaultExperience,
            );

            const {pivot} = controller;
            assert.isDefined(pivot);
            assert.instanceOf(pivot, TransformNode);
        });

        test("should expose PivotController", () => {
            controller = new XRPivotCameraController(
                scene,
                mockXRExperience as unknown as import("@babylonjs/core").WebXRDefaultExperience,
            );

            const pivotController = controller.getPivotController();
            assert.isDefined(pivotController);
            assert.equal(pivotController.pivot, controller.pivot);
        });
    });

    describe("reset", () => {
        test("should reset pivot to initial state", () => {
            controller = new XRPivotCameraController(
                scene,
                mockXRExperience as unknown as import("@babylonjs/core").WebXRDefaultExperience,
            );

            // Modify pivot state
            const pivotController = controller.getPivotController();
            pivotController.pan(new Vector3(5, 5, 5));
            pivotController.rotate(Math.PI / 4, Math.PI / 4);

            // Reset
            controller.reset();

            // Verify reset to initial state
            const {pivot} = controller;
            assert.approximately(pivot.position.x, 0, 0.0001);
            assert.approximately(pivot.position.y, 0, 0.0001);
            assert.approximately(pivot.position.z, 0, 0.0001);
            assert.isDefined(pivot.rotationQuaternion);
            assert.approximately(pivot.rotationQuaternion?.w ?? 0, 1, 0.0001);
        });
    });

    describe("dispose", () => {
        test("should not throw on dispose", () => {
            controller = new XRPivotCameraController(
                scene,
                mockXRExperience as unknown as import("@babylonjs/core").WebXRDefaultExperience,
            );

            assert.doesNotThrow(() => {
                controller?.dispose();
            });
        });

        test("should disable input handler on dispose", () => {
            controller = new XRPivotCameraController(
                scene,
                mockXRExperience as unknown as import("@babylonjs/core").WebXRDefaultExperience,
            );

            // Enter XR to enable input
            mockXRExperience.baseExperience.onStateChangedObservable.handlers.forEach((h) => {
                h(WebXRState.IN_XR);
            });
            const inputHandler = controller.getInputHandler();
            assert.isTrue(inputHandler.isEnabled());

            controller.dispose();

            assert.isFalse(inputHandler.isEnabled());
        });

        test("should dispose pivot", () => {
            controller = new XRPivotCameraController(
                scene,
                mockXRExperience as unknown as import("@babylonjs/core").WebXRDefaultExperience,
            );

            const {pivot} = controller;
            controller.dispose();

            // After dispose, pivot should be disposed
            assert.isTrue(pivot.isDisposed());
        });

        test("should handle multiple dispose calls", () => {
            controller = new XRPivotCameraController(
                scene,
                mockXRExperience as unknown as import("@babylonjs/core").WebXRDefaultExperience,
            );

            controller.dispose();
            // Second dispose should not throw
            assert.doesNotThrow(() => {
                controller?.dispose();
            });
        });
    });
});
