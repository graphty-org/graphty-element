import {NullEngine, Quaternion, Scene, Vector3} from "@babylonjs/core";
import {assert} from "chai";
import {afterEach, beforeEach, describe, test, vi} from "vitest";

import {PivotController} from "../../src/cameras/PivotController";
import {applyDeadzone, XRInputHandler} from "../../src/cameras/XRInputHandler";

describe("XRInputHandler utility functions", () => {
    describe("applyDeadzone", () => {
        test("should return 0 for values within deadzone", () => {
            assert.equal(applyDeadzone(0.0), 0);
            assert.equal(applyDeadzone(0.1), 0);
            assert.equal(applyDeadzone(-0.1), 0);
            assert.equal(applyDeadzone(0.14), 0);
        });

        test("should remap values outside deadzone to 0-1 range with quadratic curve", () => {
            // At threshold (0.15), should return 0
            assert.approximately(applyDeadzone(0.15), 0, 0.0001);
            // At max (1.0), should return 1
            assert.approximately(applyDeadzone(1.0), 1.0, 0.0001);
            // At midpoint between threshold and max
            // magnitude = (0.575 - 0.15) / (1 - 0.15) = 0.5, then squared = 0.25
            const midpoint = 0.15 + ((1 - 0.15) / 2); // 0.575
            assert.approximately(applyDeadzone(midpoint), 0.25, 0.0001);
        });

        test("should preserve sign for negative values", () => {
            assert.isBelow(applyDeadzone(-0.5), 0);
            assert.approximately(applyDeadzone(-1.0), -1.0, 0.0001);
        });

        test("should respect custom threshold", () => {
            // With threshold of 0.3, value of 0.2 should be in deadzone
            assert.equal(applyDeadzone(0.2, 0.3), 0);
            // With threshold of 0.1, value of 0.2 should be outside deadzone
            assert.isAbove(applyDeadzone(0.2, 0.1), 0);
        });
    });

    // applyCurve is now integrated into applyDeadzone - tested above
    // The quadratic curve is applied automatically as part of the deadzone remapping
});

describe("XRInputHandler", () => {
    let engine: NullEngine;
    let scene: Scene;
    let pivotController: PivotController;

    // Mock XR experience
    interface MockObservable<T> {
        add: ReturnType<typeof vi.fn>;
        handlers: ((item: T) => void)[];
    }

    interface MockInputSource {
        uniqueId: string;
        inputSource: {
            handedness: "left" | "right";
            profiles: string[];
        };
        motionController: {
            getComponent: ReturnType<typeof vi.fn>;
            getComponentIds: ReturnType<typeof vi.fn>;
        } | null;
        onMotionControllerInitObservable: {
            add: ReturnType<typeof vi.fn>;
        };
        grip?: {
            position: import("@babylonjs/core").Vector3;
            rotationQuaternion: import("@babylonjs/core").Quaternion | null;
            forward: import("@babylonjs/core").Vector3;
        };
        pointer?: {
            position: import("@babylonjs/core").Vector3;
            forward: import("@babylonjs/core").Vector3;
        };
    }

    let mockXRExperience: {
        input: {
            onControllerAddedObservable: MockObservable<MockInputSource>;
            onControllerRemovedObservable: MockObservable<MockInputSource>;
            controllers: MockInputSource[];
        };
        baseExperience: {
            featuresManager: {
                getEnabledFeature: ReturnType<typeof vi.fn>;
            };
            sessionManager: {
                scene: Scene;
            };
        };
    };
    let handler: XRInputHandler;

    beforeEach(() => {
        engine = new NullEngine();
        scene = new Scene(engine);
        pivotController = new PivotController(scene);

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
                featuresManager: {
                    getEnabledFeature: vi.fn().mockReturnValue(null),
                },
                sessionManager: {
                    scene,
                },
            },
        };

        // Create handler with type assertion for mock
        handler = new XRInputHandler(
            pivotController,
            mockXRExperience as unknown as import("@babylonjs/core").WebXRDefaultExperience,
        );
    });

    afterEach(() => {
        scene.dispose();
        engine.dispose();
    });

    describe("constructor", () => {
        test("should store pivot controller reference", () => {
            assert.equal(handler.getPivotController(), pivotController);
        });

        test("should not be enabled by default", () => {
            assert.isFalse(handler.isEnabled());
        });
    });

    describe("enable/disable", () => {
        test("should enable and set enabled flag", () => {
            handler.enable();
            assert.isTrue(handler.isEnabled());
        });

        test("should subscribe to controller observables on enable", () => {
            handler.enable();
            assert.isTrue(mockXRExperience.input.onControllerAddedObservable.add.mock.calls.length > 0);
            assert.isTrue(mockXRExperience.input.onControllerRemovedObservable.add.mock.calls.length > 0);
        });

        test("should not double-enable", () => {
            handler.enable();
            handler.enable();
            // Should only subscribe once
            assert.equal(mockXRExperience.input.onControllerAddedObservable.add.mock.calls.length, 1);
        });

        test("should disable and clear state", () => {
            handler.enable();
            handler.disable();
            assert.isFalse(handler.isEnabled());
        });

        test("should not fail when disabling without enable", () => {
            assert.doesNotThrow(() => {
                handler.disable();
            });
        });
    });

    describe("update", () => {
        test("should not process input when disabled", () => {
            // Create a spy on the pivot controller
            const rotateSpy = vi.spyOn(pivotController, "rotate");

            handler.update();

            assert.equal(rotateSpy.mock.calls.length, 0);
        });

        test("should call update without errors when enabled", () => {
            handler.enable();
            assert.doesNotThrow(() => {
                handler.update();
            });
        });
    });

    // Helper to create mock controller
    function createMockController(
        handedness: "left" | "right",
        motionControllerData?: {axes: {x: number, y: number}} | null,
    ): MockInputSource {
        const uniqueId = `controller-${handedness}-${Date.now()}`;
        const position = new Vector3(0, 0, 0);

        return {
            uniqueId,
            inputSource: {
                handedness,
                profiles: ["oculus-touch-v3"], // Standard controller profile
            },
            motionController: motionControllerData ? {
                getComponent: vi.fn().mockReturnValue({
                    axes: motionControllerData.axes,
                    onAxisValueChangedObservable: {
                        add: vi.fn(),
                        remove: vi.fn(),
                    },
                    _disposed: false,
                }),
                getComponentIds: vi.fn().mockReturnValue(["xr-standard-thumbstick"]),
            } : null,
            onMotionControllerInitObservable: {
                add: vi.fn(),
            },
            grip: {
                position,
                rotationQuaternion: Quaternion.Identity(),
                forward: Vector3.Forward(),
            },
            pointer: {
                position,
                forward: Vector3.Forward(),
            },
        };
    }

    describe("controller handling", () => {
        test("should track left controller when added", () => {
            handler.enable();

            const mockLeftController = createMockController("left");

            // Simulate controller added
            mockXRExperience.input.onControllerAddedObservable.handlers.forEach((h) => {
                h(mockLeftController);
            },
            );

            // No direct way to verify internal state, but enable/update shouldn't fail
            assert.doesNotThrow(() => {
                handler.update();
            });
        });

        test("should track right controller when added", () => {
            handler.enable();

            const mockRightController = createMockController("right");

            // Simulate controller added
            mockXRExperience.input.onControllerAddedObservable.handlers.forEach((h) => {
                h(mockRightController);
            },
            );

            assert.doesNotThrow(() => {
                handler.update();
            });
        });

        test("should handle controller removed", () => {
            handler.enable();

            const mockLeftController = createMockController("left");

            // Add then remove controller
            mockXRExperience.input.onControllerAddedObservable.handlers.forEach((h) => {
                h(mockLeftController);
            },
            );
            mockXRExperience.input.onControllerRemovedObservable.handlers.forEach((h) => {
                h(mockLeftController);
            },
            );

            assert.doesNotThrow(() => {
                handler.update();
            });
        });
    });

    describe("thumbstick input processing", () => {
        test("should apply rotation from left thumbstick X", () => {
            handler.enable();

            const rotateSpy = vi.spyOn(pivotController, "rotate");

            // Create controller with motionController already set (immediate path)
            const mockLeftController = createMockController("left", {axes: {x: 0.8, y: 0}});

            mockXRExperience.input.onControllerAddedObservable.handlers.forEach((h) => {
                h(mockLeftController);
            },
            );

            // Manually trigger onBeforeRenderObservable to run the polling callback
            // This is how the XRInputHandler gets thumbstick values each frame
            scene.onBeforeRenderObservable.notifyObservers(scene);

            handler.update();

            assert.isAbove(rotateSpy.mock.calls.length, 0);
            // Left stick X applies yaw: yawDelta = leftX * YAW_SPEED
            // 0.8 after deadzone and curve gets processed, then multiplied by 0.04
            const yawArg = rotateSpy.mock.calls[0][0];
            assert.isAbove(yawArg, 0); // Positive X on left stick = positive yaw
        });

        test("should apply pan from right thumbstick", () => {
            handler.enable();

            const panViewRelativeSpy = vi.spyOn(pivotController, "panViewRelative");

            // Create controller with motionController already set
            const mockRightController = createMockController("right", {axes: {x: 0.5, y: 0.5}});

            mockXRExperience.input.onControllerAddedObservable.handlers.forEach((h) => {
                h(mockRightController);
            },
            );

            // Manually trigger onBeforeRenderObservable to run the polling callback
            scene.onBeforeRenderObservable.notifyObservers(scene);

            handler.update();

            // Right stick X applies pan, right stick Y applies zoom
            assert.isAbove(panViewRelativeSpy.mock.calls.length, 0);
        });

        test("should ignore thumbstick values within deadzone", () => {
            handler.enable();

            const rotateSpy = vi.spyOn(pivotController, "rotate");
            const panViewRelativeSpy = vi.spyOn(pivotController, "panViewRelative");

            // Create controller with values within deadzone (0.1 < 0.15 threshold)
            const mockLeftController = createMockController("left", {axes: {x: 0.1, y: 0.1}});

            mockXRExperience.input.onControllerAddedObservable.handlers.forEach((h) => {
                h(mockLeftController);
            },
            );

            // Manually trigger onBeforeRenderObservable to run the polling callback
            scene.onBeforeRenderObservable.notifyObservers(scene);

            handler.update();

            assert.equal(rotateSpy.mock.calls.length, 0);
            assert.equal(panViewRelativeSpy.mock.calls.length, 0);
        });
    });

    describe("hand gesture processing", () => {
        test("should not process gestures without hand tracking", () => {
            handler.enable();

            const zoomSpy = vi.spyOn(pivotController, "zoom");
            mockXRExperience.baseExperience.featuresManager.getEnabledFeature.mockReturnValue(null);

            handler.update();

            assert.equal(zoomSpy.mock.calls.length, 0);
        });

        test("should process two-hand pinch zoom", () => {
            const zoomSpy = vi.spyOn(pivotController, "zoom");

            // Create mock hand objects BEFORE enable() is called
            // The source uses getHandByHandedness() which needs to return a hand object
            // Hand object needs getJointMesh() for wrist, thumb-tip, and index-finger-tip
            // Pinch detection uses distance between thumb-tip and index-finger-tip
            // PINCH_THRESHOLD = 0.04 (4cm) for pinch start

            const leftWristPos = new Vector3(0, 0, 0);
            let rightWristPos = new Vector3(0.5, 0, 0);

            const leftHand = {
                getJointMesh: vi.fn().mockImplementation((joint: string) => {
                    if (joint === "wrist") {
                        return {position: leftWristPos, rotationQuaternion: Quaternion.Identity()};
                    }

                    if (joint === "index-finger-tip") {
                        return {position: new Vector3(0, 0.02, 0)};
                    }

                    if (joint === "thumb-tip") {
                        // Distance < 0.04 = pinching
                        return {position: new Vector3(0, 0.04, 0)};
                    }

                    return null;
                }),
            };

            const rightHand = {
                getJointMesh: vi.fn().mockImplementation((joint: string) => {
                    if (joint === "wrist") {
                        return {position: rightWristPos, rotationQuaternion: Quaternion.Identity()};
                    }

                    if (joint === "index-finger-tip") {
                        return {position: new Vector3(0.5, 0.02, 0)};
                    }

                    if (joint === "thumb-tip") {
                        // Distance < 0.04 = pinching
                        return {position: new Vector3(0.5, 0.04, 0)};
                    }

                    return null;
                }),
            };

            // Create mock hand tracking with getHandByHandedness method
            const mockHandTracking = {
                getHandByHandedness: vi.fn().mockImplementation((handedness: string) => {
                    if (handedness === "left") {
                        return leftHand;
                    }

                    if (handedness === "right") {
                        return rightHand;
                    }

                    return null;
                }),
            };

            // IMPORTANT: Set up the mock BEFORE enable() is called
            // because enable() calls enableHandTracking() which caches the feature
            mockXRExperience.baseExperience.featuresManager.getEnabledFeature.mockReturnValue(mockHandTracking);

            handler.enable();

            // First update establishes baseline - both hands start pinching
            handler.update();
            // Second update - hands are still pinching but now have previous state to compare
            handler.update();

            // Move hands apart for zoom while maintaining pinch
            rightWristPos = new Vector3(0.7, 0, 0);
            rightHand.getJointMesh.mockImplementation((joint: string) => {
                if (joint === "wrist") {
                    return {position: rightWristPos, rotationQuaternion: Quaternion.Identity()};
                }

                if (joint === "index-finger-tip") {
                    return {position: new Vector3(0.7, 0.02, 0)};
                }

                if (joint === "thumb-tip") {
                    return {position: new Vector3(0.7, 0.04, 0)};
                }

                return null;
            });

            // Third update should detect zoom due to distance change
            handler.update();

            assert.isAbove(zoomSpy.mock.calls.length, 0);
        });
    });
});
