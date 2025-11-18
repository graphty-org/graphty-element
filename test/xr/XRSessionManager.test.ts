import {NullEngine, Scene} from "@babylonjs/core";
import {assert} from "chai";
import {afterEach, beforeEach, describe, test} from "vitest";

import {XRSessionManager} from "../../src/xr/XRSessionManager";

describe("XRSessionManager", () => {
    let engine: NullEngine;
    let scene: Scene;
    let manager: XRSessionManager;

    beforeEach(() => {
        engine = new NullEngine();
        scene = new Scene(engine);
        manager = new XRSessionManager(scene, {
            vr: {enabled: true, referenceSpaceType: "local-floor"},
            ar: {enabled: true, referenceSpaceType: "local-floor"},
        });
    });

    afterEach(() => {
        manager.dispose();
        scene.dispose();
        engine.dispose();
    });

    test("should initialize without WebXR support", () => {
    // In NullEngine environment, navigator.xr is undefined
        assert.isFalse(manager.isXRSupported());
    });

    test("should return null XR camera when no session active", () => {
        const camera = manager.getXRCamera();
        assert.isNull(camera);
    });

    test("should handle disposal without active session", () => {
    // Should not throw
        manager.dispose();
        assert.isNull(manager.getXRCamera());
    });

    test("should store configuration correctly", () => {
        const config = {
            vr: {enabled: false, referenceSpaceType: "local" as const},
            ar: {enabled: true, referenceSpaceType: "unbounded" as const},
        };
        const customManager = new XRSessionManager(scene, config);

        // Manager should be created without errors
        assert.exists(customManager);
        customManager.dispose();
    });

    test("should return null on getXRHelper when no session", () => {
        const helper = manager.getXRHelper();
        assert.isNull(helper);
    });

    test("should return null on getActiveMode when no session", () => {
        const mode = manager.getActiveMode();
        assert.isNull(mode);
    });
});
