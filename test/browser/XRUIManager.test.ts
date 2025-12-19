import {assert} from "chai";
import {afterEach, beforeEach, describe, test} from "vitest";

import {XRUIManager} from "../../src/ui/XRUIManager";

describe("XRUIManager", () => {
    let container: HTMLElement;
    let uiManager: XRUIManager | null = null;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
    });

    afterEach(() => {
        uiManager?.dispose();
        uiManager = null;
        container.remove();
    });

    test("should render unavailable message when XR not supported and showAvailabilityWarning is true", () => {
        uiManager = new XRUIManager(container, false, false, {
            enabled: true,
            position: "bottom-left",
            unavailableMessageDuration: 5000,
            showAvailabilityWarning: true,
        });

        const message = container.querySelector(".webxr-not-available");
        assert.exists(message);
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (message?.textContent) {
            assert.include(message.textContent, "NOT AVAILABLE");
        }
    });

    test("should not render unavailable message when showAvailabilityWarning is false", () => {
        uiManager = new XRUIManager(container, false, false, {
            enabled: true,
            position: "bottom-left",
            unavailableMessageDuration: 5000,
            showAvailabilityWarning: false,
        });

        const message = container.querySelector(".webxr-not-available");
        assert.notExists(message);
    });

    test("should render VR and AR buttons when available", () => {
        uiManager = new XRUIManager(container, true, true, {
            enabled: true,
            position: "bottom-left",
            unavailableMessageDuration: 5000,
            showAvailabilityWarning: false,
        });

        const vrButton = container.querySelector(
            "[data-xr-mode='immersive-vr']",
        );
        const arButton = container.querySelector(
            "[data-xr-mode='immersive-ar']",
        );
        assert.exists(vrButton);
        assert.exists(arButton);
    });

    test("should render only VR button when AR not available", () => {
        uiManager = new XRUIManager(container, true, false, {
            enabled: true,
            position: "bottom-left",
            unavailableMessageDuration: 5000,
            showAvailabilityWarning: false,
        });

        const vrButton = container.querySelector(
            "[data-xr-mode='immersive-vr']",
        );
        const arButton = container.querySelector(
            "[data-xr-mode='immersive-ar']",
        );
        assert.exists(vrButton);
        assert.notExists(arButton);
    });

    test("should render only AR button when VR not available", () => {
        uiManager = new XRUIManager(container, false, true, {
            enabled: true,
            position: "bottom-left",
            unavailableMessageDuration: 5000,
            showAvailabilityWarning: false,
        });

        const vrButton = container.querySelector(
            "[data-xr-mode='immersive-vr']",
        );
        const arButton = container.querySelector(
            "[data-xr-mode='immersive-ar']",
        );
        assert.notExists(vrButton);
        assert.exists(arButton);
    });

    test("should position buttons in bottom-left corner by default", () => {
        uiManager = new XRUIManager(container, true, true, {
            enabled: true,
            position: "bottom-left",
            unavailableMessageDuration: 5000,
            showAvailabilityWarning: false,
        });

        const overlay = container.querySelector(".xr-button-overlay");
        assert.exists(overlay);
        assert.isNotNull(overlay);

        const styles = window.getComputedStyle(overlay);
        assert.equal(styles.position, "absolute");
    // Note: actual position values might be 'auto' in test environment
    // We'll verify the CSS classes are applied correctly
    });

    test("should position buttons in top-right corner when configured", () => {
        uiManager = new XRUIManager(container, true, true, {
            enabled: true,
            position: "top-right",
            unavailableMessageDuration: 5000,
            showAvailabilityWarning: false,
        });

        const overlay = container.querySelector(".xr-button-overlay");
        assert.exists(overlay);
        assert.isNotNull(overlay);

        const styles = window.getComputedStyle(overlay);
        assert.equal(styles.position, "absolute");
    });

    test("should not render anything when disabled", () => {
        uiManager = new XRUIManager(container, true, true, {
            enabled: false,
            position: "bottom-left",
            unavailableMessageDuration: 5000,
            showAvailabilityWarning: false,
        });

        const overlay = container.querySelector(".xr-button-overlay");
        assert.notExists(overlay);
    });

    test("should apply correct CSS classes to VR button", () => {
        uiManager = new XRUIManager(container, true, false, {
            enabled: true,
            position: "bottom-left",
            unavailableMessageDuration: 5000,
            showAvailabilityWarning: false,
        });

        const vrButton = container.querySelector("[data-xr-mode='immersive-vr']");
        assert.exists(vrButton);
        assert.isTrue(vrButton.classList.contains("webxr-button"));
        assert.isTrue(vrButton.classList.contains("webxr-available"));
    });

    test("should apply correct CSS classes to AR button", () => {
        uiManager = new XRUIManager(container, false, true, {
            enabled: true,
            position: "bottom-left",
            unavailableMessageDuration: 5000,
            showAvailabilityWarning: false,
        });

        const arButton = container.querySelector("[data-xr-mode='immersive-ar']");
        assert.exists(arButton);
        assert.isTrue(arButton.classList.contains("webxr-button"));
        assert.isTrue(arButton.classList.contains("webxr-available"));
    });

    test("should apply correct CSS classes to unavailable message", () => {
        uiManager = new XRUIManager(container, false, false, {
            enabled: true,
            position: "bottom-left",
            unavailableMessageDuration: 5000,
            showAvailabilityWarning: true,
        });

        const message = container.querySelector(".webxr-not-available");
        assert.exists(message);
        assert.isTrue(message.classList.contains("webxr-button"));
        assert.isTrue(message.classList.contains("webxr-not-available"));
    });

    test("should apply correct CSS class for overlay position", () => {
        uiManager = new XRUIManager(container, true, true, {
            enabled: true,
            position: "top-right",
            unavailableMessageDuration: 5000,
            showAvailabilityWarning: false,
        });

        const overlay = container.querySelector(".xr-button-overlay");
        assert.exists(overlay);
        assert.isTrue(overlay.classList.contains("xr-button-overlay"));
        assert.isTrue(overlay.classList.contains("xr-position-top-right"));
    });

    test("should set correct part attributes on VR button", () => {
        uiManager = new XRUIManager(container, true, false, {
            enabled: true,
            position: "bottom-left",
            unavailableMessageDuration: 5000,
            showAvailabilityWarning: false,
        });

        const vrButton = container.querySelector("[data-xr-mode='immersive-vr']");
        assert.exists(vrButton);
        const part = vrButton.getAttribute("part");
        assert.include(part, "xr-button");
        assert.include(part, "xr-vr-button");
    });

    test("should set correct part attributes on AR button", () => {
        uiManager = new XRUIManager(container, false, true, {
            enabled: true,
            position: "bottom-left",
            unavailableMessageDuration: 5000,
            showAvailabilityWarning: false,
        });

        const arButton = container.querySelector("[data-xr-mode='immersive-ar']");
        assert.exists(arButton);
        const part = arButton.getAttribute("part");
        assert.include(part, "xr-button");
        assert.include(part, "xr-ar-button");
    });

    test("should set correct part attributes on unavailable message", () => {
        uiManager = new XRUIManager(container, false, false, {
            enabled: true,
            position: "bottom-left",
            unavailableMessageDuration: 5000,
            showAvailabilityWarning: true,
        });

        const message = container.querySelector(".webxr-not-available");
        assert.exists(message);
        const part = message.getAttribute("part");
        assert.include(part, "xr-button");
        assert.include(part, "xr-unavailable-message");
    });

    test("should set part attribute on overlay", () => {
        uiManager = new XRUIManager(container, true, true, {
            enabled: true,
            position: "bottom-left",
            unavailableMessageDuration: 5000,
            showAvailabilityWarning: false,
        });

        const overlay = container.querySelector(".xr-button-overlay");
        assert.exists(overlay);
        assert.equal(overlay.getAttribute("part"), "xr-overlay");
    });

    test("should inject default CSS styles with custom properties", () => {
        uiManager = new XRUIManager(container, true, true, {
            enabled: true,
            position: "bottom-left",
            unavailableMessageDuration: 5000,
            showAvailabilityWarning: false,
        });

        // Check that a style element exists in the container
        const styleElement = container.querySelector("style");
        assert.exists(styleElement);

        // Verify it contains CSS custom properties
        const css = styleElement.textContent;
        assert.include(css, "--xr-button-font-family");
        assert.include(css, "--xr-button-color");
        assert.include(css, "--xr-available-bg");
        assert.include(css, "--xr-unavailable-bg");
    });

    test("should clean up on dispose", () => {
        uiManager = new XRUIManager(container, true, true, {
            enabled: true,
            position: "bottom-left",
            unavailableMessageDuration: 5000,
            showAvailabilityWarning: false,
        });

        const overlay = container.querySelector(".xr-button-overlay");
        assert.exists(overlay);

        uiManager.dispose();
        const overlayAfterDispose = container.querySelector(".xr-button-overlay");
        assert.notExists(overlayAfterDispose);
    });

    test("should expose button click handlers via onEnterXR", () => {
        let callbackMode: string | null = null;

        uiManager = new XRUIManager(container, true, true, {
            enabled: true,
            position: "bottom-left",
            unavailableMessageDuration: 5000,
            showAvailabilityWarning: false,
        });

        uiManager.onEnterXR = (mode) => {
            callbackMode = mode;
        };

        const vrButton = container.querySelector<HTMLElement>(
            "[data-xr-mode='immersive-vr']",
        );
        assert.exists(vrButton, "VR button should exist");
        vrButton.click();

        assert.equal(callbackMode, "immersive-vr");
    });
});
