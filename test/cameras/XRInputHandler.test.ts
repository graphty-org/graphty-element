import {NullEngine, Scene, Vector3} from "@babylonjs/core";
import {assert} from "chai";
import {afterEach, beforeEach, describe, test, vi} from "vitest";

import {PivotController} from "../../src/cameras/PivotController";
import {applyCurve, applyDeadzone, XRInputHandler} from "../../src/cameras/XRInputHandler";

describe("XRInputHandler utility functions", () => {
    describe("applyDeadzone", () => {
        test("should return 0 for values within deadzone", () => {
            assert.equal(applyDeadzone(0.0), 0);
            assert.equal(applyDeadzone(0.1), 0);
            assert.equal(applyDeadzone(-0.1), 0);
            assert.equal(applyDeadzone(0.14), 0);
        });

        test("should remap values outside deadzone to 0-1 range", () => {
            // At threshold (0.15), should return 0
            assert.approximately(applyDeadzone(0.15), 0, 0.0001);
            // At max (1.0), should return 1
            assert.approximately(applyDeadzone(1.0), 1.0, 0.0001);
            // At midpoint between threshold and max
            const midpoint = 0.15 + ((1 - 0.15) / 2); // 0.575
            assert.approximately(applyDeadzone(midpoint), 0.5, 0.0001);
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

    describe("applyCurve", () => {
        test("should return 0 for 0 input", () => {
            assert.equal(applyCurve(0), 0);
        });

        test("should return 1 for 1 input", () => {
            assert.equal(applyCurve(1), 1);
        });

        test("should return -1 for -1 input", () => {
            assert.equal(applyCurve(-1), -1);
        });

        test("should apply quadratic response curve", () => {
            // For value of 0.5, result should be 0.25 (0.5^2)
            assert.approximately(applyCurve(0.5), 0.25, 0.0001);
            // For value of 0.7, result should be 0.49 (0.7^2)
            assert.approximately(applyCurve(0.7), 0.49, 0.0001);
        });

        test("should preserve sign for negative values", () => {
            assert.approximately(applyCurve(-0.5), -0.25, 0.0001);
        });
    });
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
        inputSource: {handedness: "left" | "right"};
        motionController: {
            getComponentOfType: ReturnType<typeof vi.fn>;
        } | null;
    }

    let mockXRExperience: {
        input: {
            onControllerAddedObservable: MockObservable<MockInputSource>;
            onControllerRemovedObservable: MockObservable<MockInputSource>;
        };
        baseExperience: {
            featuresManager: {
                getEnabledFeature: ReturnType<typeof vi.fn>;
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
            },
            baseExperience: {
                featuresManager: {
                    getEnabledFeature: vi.fn().mockReturnValue(null),
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

    describe("controller handling", () => {
        test("should track left controller when added", () => {
            handler.enable();

            const mockLeftController: MockInputSource = {
                inputSource: {handedness: "left"},
                motionController: null,
            };

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

            const mockRightController: MockInputSource = {
                inputSource: {handedness: "right"},
                motionController: null,
            };

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

            const mockLeftController: MockInputSource = {
                inputSource: {handedness: "left"},
                motionController: null,
            };

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

            const mockLeftController: MockInputSource = {
                inputSource: {handedness: "left"},
                motionController: {
                    getComponentOfType: vi.fn().mockReturnValue({
                        axes: {x: 0.8, y: 0},
                    }),
                },
            };

            mockXRExperience.input.onControllerAddedObservable.handlers.forEach((h) => {
                h(mockLeftController);
            },
            );

            handler.update();

            assert.isAbove(rotateSpy.mock.calls.length, 0);
            // Rotation should be negative (due to -applyCurve)
            const yawArg = rotateSpy.mock.calls[0][0];
            assert.isBelow(yawArg, 0);
        });

        test("should apply pan from right thumbstick", () => {
            handler.enable();

            const panSpy = vi.spyOn(pivotController, "pan");

            const mockRightController: MockInputSource = {
                inputSource: {handedness: "right"},
                motionController: {
                    getComponentOfType: vi.fn().mockReturnValue({
                        axes: {x: 0.5, y: 0.5},
                    }),
                },
            };

            mockXRExperience.input.onControllerAddedObservable.handlers.forEach((h) => {
                h(mockRightController);
            },
            );

            handler.update();

            assert.isAbove(panSpy.mock.calls.length, 0);
        });

        test("should ignore thumbstick values within deadzone", () => {
            handler.enable();

            const rotateSpy = vi.spyOn(pivotController, "rotate");
            const panSpy = vi.spyOn(pivotController, "pan");

            const mockLeftController: MockInputSource = {
                inputSource: {handedness: "left"},
                motionController: {
                    getComponentOfType: vi.fn().mockReturnValue({
                        axes: {x: 0.1, y: 0.1}, // Within deadzone
                    }),
                },
            };

            mockXRExperience.input.onControllerAddedObservable.handlers.forEach((h) => {
                h(mockLeftController);
            },
            );

            handler.update();

            assert.equal(rotateSpy.mock.calls.length, 0);
            assert.equal(panSpy.mock.calls.length, 0);
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
            handler.enable();

            const zoomSpy = vi.spyOn(pivotController, "zoom");

            // Create mock hand tracking with two pinching hands
            // Pinch threshold: pinchStrength = 1 - (distance / 0.05)
            // PINCH_START = 0.7, so distance needs to be < 0.015 for pinchStrength > 0.7
            const mockHandTracking = {
                leftHand: {
                    getJointMesh: vi.fn().mockImplementation((joint: string) => {
                        if (joint === "index-finger-tip") {
                            return {position: new Vector3(0, 0, 0)};
                        }

                        if (joint === "thumb-tip") {
                            // Distance 0.01 gives pinchStrength = 1 - 0.01/0.05 = 0.8 > 0.7
                            return {position: new Vector3(0.01, 0, 0)};
                        }

                        return null;
                    }),
                },
                rightHand: {
                    getJointMesh: vi.fn().mockImplementation((joint: string) => {
                        if (joint === "index-finger-tip") {
                            return {position: new Vector3(0.5, 0, 0)};
                        }

                        if (joint === "thumb-tip") {
                            // Distance 0.01 gives pinchStrength = 1 - 0.01/0.05 = 0.8 > 0.7
                            return {position: new Vector3(0.51, 0, 0)};
                        }

                        return null;
                    }),
                },
            };

            mockXRExperience.baseExperience.featuresManager.getEnabledFeature.mockReturnValue(mockHandTracking);

            // First update establishes baseline - both hands start pinching
            handler.update();
            // Second update - hands are still pinching but now have previous state to compare
            handler.update();

            // Move hands apart for zoom while maintaining pinch
            mockHandTracking.rightHand.getJointMesh.mockImplementation((joint: string) => {
                if (joint === "index-finger-tip") {
                    return {position: new Vector3(0.7, 0, 0)}; // Moved apart
                }

                if (joint === "thumb-tip") {
                    return {position: new Vector3(0.71, 0, 0)}; // Still pinching
                }

                return null;
            });

            // Third update should detect zoom due to distance change
            handler.update();

            assert.isAbove(zoomSpy.mock.calls.length, 0);
        });
    });
});
