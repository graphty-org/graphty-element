import {afterEach, beforeEach, describe, test, vi} from "vitest";
import {assert} from "chai";
import {NullEngine, Scene, Vector3} from "@babylonjs/core";

import {XRCameraController} from "../../src/cameras/XRCameraController";
import {XRSessionManager} from "../../src/xr/XRSessionManager";

describe("XRCameraController", () => {
    let engine: NullEngine;
    let scene: Scene;
    let sessionManager: XRSessionManager;
    let controller: XRCameraController;

    beforeEach(() => {
        engine = new NullEngine();
        scene = new Scene(engine);

        // Create session manager with default config
        sessionManager = new XRSessionManager(scene, {
            vr: {enabled: true, referenceSpaceType: "local-floor"},
            ar: {enabled: true, referenceSpaceType: "local-floor"},
        });
    });

    afterEach(() => {
        if (controller) {
            controller.dispose();
        }
        scene.dispose();
        engine.dispose();
    });

    test("should implement CameraController interface", () => {
        controller = new XRCameraController(sessionManager);

        // Verify interface methods exist
        assert.isFunction(controller.zoomToBoundingBox);
        assert.isFunction(controller.dispose);
        // Verify camera property exists as a getter (don't call it as it will throw without session)
        const descriptor = Object.getOwnPropertyDescriptor(
            Object.getPrototypeOf(controller),
            "camera",
        );
        assert.exists(descriptor, "camera property should exist");
        assert.exists(descriptor?.get, "camera should be a getter");
    });

    test("should throw error when accessing camera without active session", () => {
        controller = new XRCameraController(sessionManager);

        assert.throws(() => {
            const cam = controller.camera;
            assert.isDefined(cam); // This should never execute
        }, /XR session not active/);
    });

    test("should return camera when session is active", () => {
        // Create a camera to use as mock
        const {UniversalCamera} = require("@babylonjs/core");
        const mockCamera = new UniversalCamera("mock-xr-camera", scene);

        // Mock the session manager to simulate active XR session
        vi.spyOn(sessionManager, "getXRCamera").mockReturnValue(mockCamera);

        controller = new XRCameraController(sessionManager);

        const camera = controller.camera;
        assert.exists(camera);
        assert.equal(camera, mockCamera);

        mockCamera.dispose();
    });

    test("should implement zoomToBoundingBox with warning", () => {
        controller = new XRCameraController(sessionManager);

        const consoleWarnSpy = vi.spyOn(console, "warn");

        const min = new Vector3(-1, -1, -1);
        const max = new Vector3(1, 1, 1);

        // Should not throw
        controller.zoomToBoundingBox(min, max);

        // Should log warning about unimplemented feature
        assert.isTrue(consoleWarnSpy.mock.calls.length > 0, "console.warn should have been called");
        assert.include(
            consoleWarnSpy.mock.calls[0][0],
            "zoomToBoundingBox in XR mode",
        );

        consoleWarnSpy.mockRestore();
    });

    test("should not throw on dispose", () => {
        controller = new XRCameraController(sessionManager);

        // Should not throw
        assert.doesNotThrow(() => {
            controller.dispose();
        });
    });

    test("should handle multiple dispose calls gracefully", () => {
        controller = new XRCameraController(sessionManager);

        controller.dispose();
        // Second dispose should not throw
        assert.doesNotThrow(() => {
            controller.dispose();
        });
    });
});
