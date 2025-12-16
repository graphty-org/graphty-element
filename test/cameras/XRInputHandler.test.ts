import {NullEngine, Scene} from "@babylonjs/core";
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

        test("should remap values outside deadzone with quadratic curve", () => {
            // At threshold (0.15), should return 0
            assert.approximately(applyDeadzone(0.15), 0, 0.0001);
            // At max (1.0), should return 1
            assert.approximately(applyDeadzone(1.0), 1.0, 0.0001);
            // At midpoint between threshold and max
            // magnitude = (0.575 - 0.15) / (1 - 0.15) = 0.5
            // With quadratic curve: 0.5^2 = 0.25
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

        test("should apply quadratic curve for smooth acceleration", () => {
            // The function applies quadratic curve internally
            // For value 0.7 with threshold 0.15:
            // magnitude = (0.7 - 0.15) / (1 - 0.15) = 0.647
            // result = 0.647^2 = ~0.42
            const result = applyDeadzone(0.7, 0.15);
            const expectedMagnitude = (0.7 - 0.15) / (1 - 0.15);
            const expectedResult = expectedMagnitude * expectedMagnitude;
            assert.approximately(result, expectedResult, 0.0001);
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

    interface MockComponent {
        axes: {x: number, y: number};
        onAxisValueChangedObservable: {
            add: ReturnType<typeof vi.fn>;
            remove: ReturnType<typeof vi.fn>;
        };
    }

    interface MockMotionController {
        getComponentIds: ReturnType<typeof vi.fn>;
        getComponent: ReturnType<typeof vi.fn>;
        getComponentOfType: ReturnType<typeof vi.fn>;
    }

    interface MockInputSource {
        inputSource: {handedness: "left" | "right"};
        motionController: MockMotionController | null;
        uniqueId?: string;
    }

    function createMockMotionController(axes: {x: number, y: number} = {x: 0, y: 0}): MockMotionController {
        const mockComponent: MockComponent = {
            axes,
            onAxisValueChangedObservable: {
                add: vi.fn(),
                remove: vi.fn(),
            },
        };
        return {
            getComponentIds: vi.fn().mockReturnValue(["xr-standard-thumbstick"]),
            getComponent: vi.fn().mockReturnValue(mockComponent),
            getComponentOfType: vi.fn().mockReturnValue(mockComponent),
        };
    }

    let mockXRExperience: {
        input: {
            onControllerAddedObservable: MockObservable<MockInputSource>;
            onControllerRemovedObservable: MockObservable<MockInputSource>;
            controllers: MockInputSource[];
        };
        baseExperience: {
            sessionManager: {
                scene: Scene;
            };
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
                controllers: [],
            },
            baseExperience: {
                sessionManager: {
                    scene,
                },
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
                motionController: createMockMotionController(),
                uniqueId: "left-1",
            };

            // Simulate controller added
            mockXRExperience.input.onControllerAddedObservable.handlers.forEach((h) => {
                h(mockLeftController);
            });

            // No direct way to verify internal state, but enable/update shouldn't fail
            assert.doesNotThrow(() => {
                handler.update();
            });
        });

        test("should track right controller when added", () => {
            handler.enable();

            const mockRightController: MockInputSource = {
                inputSource: {handedness: "right"},
                motionController: createMockMotionController(),
                uniqueId: "right-1",
            };

            // Simulate controller added
            mockXRExperience.input.onControllerAddedObservable.handlers.forEach((h) => {
                h(mockRightController);
            });

            assert.doesNotThrow(() => {
                handler.update();
            });
        });

        test("should handle controller removed", () => {
            handler.enable();

            const mockLeftController: MockInputSource = {
                inputSource: {handedness: "left"},
                motionController: createMockMotionController(),
                uniqueId: "left-2",
            };

            // Add then remove controller
            mockXRExperience.input.onControllerAddedObservable.handlers.forEach((h) => {
                h(mockLeftController);
            });
            mockXRExperience.input.onControllerRemovedObservable.handlers.forEach((h) => {
                h(mockLeftController);
            });

            assert.doesNotThrow(() => {
                handler.update();
            });
        });
    });

    describe("thumbstick input processing", () => {
        test("should register axis callback when controller added", () => {
            handler.enable();

            const mockLeftController: MockInputSource = {
                inputSource: {handedness: "left"},
                motionController: createMockMotionController({x: 0.8, y: 0}),
                uniqueId: "left-controller-1",
            };

            mockXRExperience.input.onControllerAddedObservable.handlers.forEach((h) => {
                h(mockLeftController);
            });

            // Verify that the axis callback was registered
            const {motionController} = mockLeftController;
            assert.isDefined(motionController);
            const {onAxisValueChangedObservable} = motionController.getComponent();
            assert.isAbove(onAxisValueChangedObservable.add.mock.calls.length, 0);
        });

        test("should handle controller with motion controller", () => {
            handler.enable();

            const mockRightController: MockInputSource = {
                inputSource: {handedness: "right"},
                motionController: createMockMotionController({x: 0.5, y: 0.5}),
                uniqueId: "right-controller-1",
            };

            // Should not throw when adding controller
            assert.doesNotThrow(() => {
                mockXRExperience.input.onControllerAddedObservable.handlers.forEach((h) => {
                    h(mockRightController);
                });
            });
        });

        test("should handle controller removal", () => {
            handler.enable();

            const mockLeftController: MockInputSource = {
                inputSource: {handedness: "left"},
                motionController: createMockMotionController({x: 0, y: 0}),
                uniqueId: "left-controller-3",
            };

            // Add controller
            mockXRExperience.input.onControllerAddedObservable.handlers.forEach((h) => {
                h(mockLeftController);
            });

            // Should not throw when removing controller
            assert.doesNotThrow(() => {
                mockXRExperience.input.onControllerRemovedObservable.handlers.forEach((h) => {
                    h(mockLeftController);
                });
            });

            // Update should also not throw after removal
            assert.doesNotThrow(() => {
                handler.update();
            });
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

        test("should attempt to enable hand tracking on enable", () => {
            handler.enable();

            // Should have queried for hand tracking feature
            assert.isAbove(mockXRExperience.baseExperience.featuresManager.getEnabledFeature.mock.calls.length, 0);
        });
    });
});
