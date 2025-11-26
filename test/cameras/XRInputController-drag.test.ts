import {NullEngine, Scene} from "@babylonjs/core";
import {assert} from "chai";
import {afterEach, beforeEach, describe, test, vi} from "vitest";

import {XRInputController} from "../../src/cameras/XRInputController";
import type {XRSessionManager} from "../../src/xr/XRSessionManager";

describe("XRInputController Drag Integration", () => {
    let engine: NullEngine;
    let scene: Scene;
    let controller: XRInputController;
    let mockSessionManager: XRSessionManager;

    beforeEach(() => {
        engine = new NullEngine();
        scene = new Scene(engine);

        // Create a mock XR session manager
        mockSessionManager = {
            getXRHelper: vi.fn().mockReturnValue(null),
        } as unknown as XRSessionManager;

        controller = new XRInputController(
            scene,
            mockSessionManager,
            {
                handTracking: true,
                controllers: true,
                nearInteraction: true,
                physics: false,
                zAxisAmplification: 10.0,
                enableZAmplificationInDesktop: false,
            },
        );
    });

    afterEach(() => {
        controller.dispose();
        scene.dispose();
        engine.dispose();
    });

    test("should initialize without XR helper", () => {
        // When XR session is not active, getXRHelper returns null
        // Controller should handle this gracefully
        assert.exists(controller, "Controller should be created");

        // Enable should not throw when XR is not available
        assert.doesNotThrow(() => {
            controller.enable();
        }, "Enable should not throw without XR helper");
    });

    test("should call update without errors when no drag active", () => {
        controller.enable();

        // Update should not throw when no drag is active
        assert.doesNotThrow(() => {
            controller.update();
        }, "Update should not throw");
    });

    test("should handle enable/disable lifecycle", () => {
        // Enable
        controller.enable();

        // Disable
        controller.disable();

        // Re-enable should work
        assert.doesNotThrow(() => {
            controller.enable();
        }, "Re-enable should work");
    });

    test("should dispose cleanly", () => {
        controller.enable();

        assert.doesNotThrow(() => {
            controller.dispose();
        }, "Dispose should not throw");
    });

    // NOTE: Full XR controller testing requires WebXR API mocks or browser tests
    // These basic tests verify the controller can be instantiated and doesn't crash
    // Integration tests with actual XR hardware/emulator will be in browser tests
});
