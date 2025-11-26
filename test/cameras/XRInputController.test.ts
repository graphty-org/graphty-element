import {NullEngine, Scene} from "@babylonjs/core";
import {assert} from "chai";
import {afterEach, beforeEach, describe, test} from "vitest";

import {XRInputController} from "../../src/cameras/XRInputController";
import type {XRInputConfig} from "../../src/config/XRConfig";
import {XRSessionManager} from "../../src/xr/XRSessionManager";

/**
 * Tests for XRInputController - XR-specific input handling
 *
 * IMPORTANT: XRInputController should NOT reimplement NodeBehavior drag logic.
 * It should only enable XR-specific features (hand tracking, near interaction).
 */
describe("XRInputController", () => {
    let engine: NullEngine;
    let scene: Scene;
    let sessionManager: XRSessionManager;
    let inputController: XRInputController;

    beforeEach(() => {
        engine = new NullEngine();
        scene = new Scene(engine);

        // Create mock XR session manager
        sessionManager = new XRSessionManager(scene, {
            vr: {enabled: true, referenceSpaceType: "local-floor"},
            ar: {enabled: true, referenceSpaceType: "local-floor"},
        });
    });

    afterEach(() => {
        inputController.dispose();
        sessionManager.dispose();
        scene.dispose();
        engine.dispose();
    });

    test("should implement InputHandler interface", () => {
        const config: XRInputConfig = {
            handTracking: true,
            controllers: true,
            nearInteraction: true,
            physics: false,
        };

        inputController = new XRInputController(scene, sessionManager, config);

        assert.isFunction(inputController.enable, "enable() should exist");
        assert.isFunction(inputController.disable, "disable() should exist");
        assert.isFunction(inputController.update, "update() should exist");
        assert.isFunction(inputController.dispose, "dispose() should exist");
    });

    test("should NOT duplicate NodeBehavior drag logic", () => {
        const config: XRInputConfig = {
            handTracking: true,
            controllers: true,
            nearInteraction: true,
            physics: false,
        };

        inputController = new XRInputController(scene, sessionManager, config);

        // Verify XRInputController doesn't reimplement drag state management
        // It should rely on SixDofDragBehavior or trigger it via pointer events
        assert.notExists((inputController as {handleDragState?: unknown}).handleDragState, "should not have drag state handler");
        assert.notExists((inputController as {onDragStart?: unknown}).onDragStart, "should not have drag start handler");
        assert.notExists((inputController as {onDragEnd?: unknown}).onDragEnd, "should not have drag end handler");
        assert.notExists((inputController as {draggedNode?: unknown}).draggedNode, "should not track dragged nodes");
    });

    test("should accept XR input configuration", () => {
        const config: XRInputConfig = {
            handTracking: true,
            controllers: true,
            nearInteraction: false,
            physics: true,
        };

        inputController = new XRInputController(scene, sessionManager, config);

        // Controller should be created without errors
        assert.exists(inputController, "controller should be created");
    });

    test("should handle missing XR session gracefully on enable", () => {
        const config: XRInputConfig = {
            handTracking: true,
            controllers: true,
            nearInteraction: true,
            physics: false,
        };

        inputController = new XRInputController(scene, sessionManager, config);

        // Enable should not throw even if XR session not active
        assert.doesNotThrow(() => {
            inputController.enable();
        }, "enable() should handle missing XR session");
    });

    test("should be able to disable after enabling", () => {
        const config: XRInputConfig = {
            handTracking: true,
            controllers: true,
            nearInteraction: true,
            physics: false,
        };

        inputController = new XRInputController(scene, sessionManager, config);

        inputController.enable();
        assert.doesNotThrow(() => {
            inputController.disable();
        }, "disable() should work after enable()");
    });

    test("should support multiple enable/disable cycles", () => {
        const config: XRInputConfig = {
            handTracking: true,
            controllers: true,
            nearInteraction: true,
            physics: false,
        };

        inputController = new XRInputController(scene, sessionManager, config);

        // Multiple cycles should work
        inputController.enable();
        inputController.disable();
        inputController.enable();
        inputController.disable();

        assert.isTrue(true, "multiple enable/disable cycles should work");
    });

    test("update() should be callable every frame", () => {
        const config: XRInputConfig = {
            handTracking: true,
            controllers: true,
            nearInteraction: true,
            physics: false,
        };

        inputController = new XRInputController(scene, sessionManager, config);
        inputController.enable();

        // Should be safe to call update many times
        assert.doesNotThrow(() => {
            for (let i = 0; i < 100; i++) {
                inputController.update();
            }
        }, "update() should be safe to call repeatedly");
    });

    test("dispose() should cleanup resources", () => {
        const config: XRInputConfig = {
            handTracking: true,
            controllers: true,
            nearInteraction: true,
            physics: false,
        };

        inputController = new XRInputController(scene, sessionManager, config);
        inputController.enable();

        assert.doesNotThrow(() => {
            inputController.dispose();
        }, "dispose() should not throw");

        // After dispose, methods should be safe to call (no-op)
        assert.doesNotThrow(() => {
            inputController.disable();
            inputController.update();
        }, "methods should be safe after dispose");
    });

    test("should work with all config options disabled", () => {
        const config: XRInputConfig = {
            handTracking: false,
            controllers: false,
            nearInteraction: false,
            physics: false,
        };

        inputController = new XRInputController(scene, sessionManager, config);
        inputController.enable();

        assert.doesNotThrow(() => {
            inputController.update();
        }, "should work with all options disabled");
    });

    test("should work with only hand tracking enabled", () => {
        const config: XRInputConfig = {
            handTracking: true,
            controllers: false,
            nearInteraction: false,
            physics: false,
        };

        inputController = new XRInputController(scene, sessionManager, config);
        inputController.enable();

        assert.doesNotThrow(() => {
            inputController.update();
        }, "should work with only hand tracking");
    });

    test("should work with only controllers enabled", () => {
        const config: XRInputConfig = {
            handTracking: false,
            controllers: true,
            nearInteraction: false,
            physics: false,
        };

        inputController = new XRInputController(scene, sessionManager, config);
        inputController.enable();

        assert.doesNotThrow(() => {
            inputController.update();
        }, "should work with only controllers");
    });

    test("should support physics-enabled hand joints", () => {
        const config: XRInputConfig = {
            handTracking: true,
            controllers: false,
            nearInteraction: false,
            physics: true,
        };

        inputController = new XRInputController(scene, sessionManager, config);
        inputController.enable();

        assert.doesNotThrow(() => {
            inputController.update();
        }, "should support physics on hand joints");
    });
});
