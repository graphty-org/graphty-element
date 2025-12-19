/**
 * WebXR emulation setup using IWER (Immersive Web Emulation Runtime)
 *
 * This module provides utilities for testing WebXR interactions without
 * physical VR hardware by emulating XR devices, controllers, and hand tracking.
 *
 * Note: IWER must be installed as a dev dependency:
 * npm install --save-dev iwer
 */

import type {Graph} from "../../../src/Graph";
import type {MockController, MockHand, Vector3D} from "../types";

/**
 * XR device configuration for IWER
 */
export interface XRDeviceConfig {
    /** Device name (e.g., "Meta Quest 3") */
    name?: string;
    /** Whether to enable hand tracking */
    handTracking?: boolean;
    /** Whether to enable controller input */
    controllers?: boolean;
}

/**
 * IWER device reference stored on window for test manipulation
 */
interface IWERWindow extends Window {
    xrDevice?: {
        primaryController?: MockXRController;
        secondaryController?: MockXRController;
        leftHand?: MockXRHand;
        rightHand?: MockXRHand;
        installRuntime: () => void;
    };
}

/**
 * Mock XR controller for IWER
 */
interface MockXRController {
    position: {x: number, y: number, z: number, set: (x: number, y: number, z: number) => void};
    rotation: {x: number, y: number, z: number, w: number};
    thumbstick: {x: number, y: number};
    trigger: {value: number, pressed: boolean};
    grip: {value: number, pressed: boolean};
}

/**
 * Mock XR hand for IWER
 */
interface MockXRHand {
    joints: Record<string, {position: {x: number, y: number, z: number, set: (x: number, y: number, z: number) => void}}>;
}

/**
 * Set up IWER for WebXR emulation.
 * This should be called before navigating to a page that uses WebXR.
 *
 * @param config - Device configuration options
 * @returns Cleanup function to tear down IWER
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Config will be used in future
export async function setupIWER(_config?: XRDeviceConfig): Promise<() => void> {
    // Dynamic import to avoid issues when iwer is not installed
    let XRDevice: unknown;
    let metaQuestTouchPlus: unknown;

    try {
        // Use string template to prevent Vite static analysis from failing on missing module
        const moduleName = "iwer";
        const iwer = await import(/* @vite-ignore */ moduleName);
        ({XRDevice, metaQuestTouchPlus} = iwer);
    } catch {
        console.warn("IWER not installed. XR emulation will not be available.");
        console.warn("Install with: npm install --save-dev iwer");
        return () => {
            // No-op cleanup
        };
    }

    // Create virtual XR device
    const xrDevice = new (XRDevice as new (config: unknown) => IWERWindow["xrDevice"])(
        metaQuestTouchPlus,
    );

    if (xrDevice) {
        xrDevice.installRuntime();

        // Store reference for test manipulation
        (window as IWERWindow).xrDevice = xrDevice;
    }

    // Return cleanup function
    return () => {
        delete (window as IWERWindow).xrDevice;
    };
}

/**
 * Set up an XR scene for testing.
 * This initializes the XR session manager if not already done.
 *
 * @param graph - The graph instance
 */
export async function setupXRScene(graph: Graph): Promise<void> {
    // Ensure graph is initialized
    if (!graph.initialized) {
        throw new Error("Graph must be initialized before setting up XR scene");
    }

    // The graph should automatically set up XR if configured
    // This helper is primarily for ensuring the scene is ready
    await new Promise((resolve) => setTimeout(resolve, 100));
}

/**
 * Create a mock hand configuration for testing.
 * Returns a hand in a neutral, relaxed position.
 *
 * @param handedness - "left" or "right"
 * @returns Mock hand configuration
 */
export function createMockHand(handedness: "left" | "right"): MockHand {
    // Standard WebXR hand joint names
    const jointNames = [
        "wrist",
        "thumb-metacarpal",
        "thumb-phalanx-proximal",
        "thumb-phalanx-distal",
        "thumb-tip",
        "index-finger-metacarpal",
        "index-finger-phalanx-proximal",
        "index-finger-phalanx-intermediate",
        "index-finger-phalanx-distal",
        "index-finger-tip",
        "middle-finger-metacarpal",
        "middle-finger-phalanx-proximal",
        "middle-finger-phalanx-intermediate",
        "middle-finger-phalanx-distal",
        "middle-finger-tip",
        "ring-finger-metacarpal",
        "ring-finger-phalanx-proximal",
        "ring-finger-phalanx-intermediate",
        "ring-finger-phalanx-distal",
        "ring-finger-tip",
        "pinky-finger-metacarpal",
        "pinky-finger-phalanx-proximal",
        "pinky-finger-phalanx-intermediate",
        "pinky-finger-phalanx-distal",
        "pinky-finger-tip",
    ];

    const joints = new Map<string, Vector3D>();
    const xOffset = handedness === "left" ? -0.2 : 0.2;

    for (const name of jointNames) {
        // Default position at roughly head height, offset to the side
        joints.set(name, {x: xOffset, y: 1.5, z: -0.3});
    }

    return {
        handedness,
        joints,
        pinchStrength: 0,
    };
}

/**
 * Create a mock hand in a pinching pose.
 * Thumb and index finger tips are brought close together.
 *
 * @param handedness - "left" or "right"
 * @returns Mock hand in pinching configuration
 */
export function createPinchingHand(handedness: "left" | "right"): MockHand {
    const hand = createMockHand(handedness);
    const xOffset = handedness === "left" ? -0.2 : 0.2;

    // Position thumb and index tip close together (2cm apart = pinching)
    hand.joints.set("thumb-tip", {x: xOffset, y: 1.5, z: -0.3});
    hand.joints.set("index-finger-tip", {x: xOffset + 0.02, y: 1.5, z: -0.3});
    hand.pinchStrength = 0.9;

    return hand;
}

/**
 * Create a mock controller configuration for testing.
 * Returns a controller in a neutral position pointing forward.
 *
 * @param handedness - "left" or "right"
 * @returns Mock controller configuration
 */
export function createMockController(handedness: "left" | "right"): MockController {
    const xOffset = handedness === "left" ? -0.3 : 0.3;

    return {
        handedness,
        position: {x: xOffset, y: 1.0, z: -0.3},
        rotation: {x: 0, y: 0, z: 0},
        thumbstick: {x: 0, y: 0},
        trigger: {value: 0, pressed: false},
        grip: {value: 0, pressed: false},
    };
}

/**
 * Set thumbstick values on a mock controller via IWER.
 *
 * @param hand - "left" or "right"
 * @param x - X axis value (-1 to 1)
 * @param y - Y axis value (-1 to 1)
 */
export function setThumbstick(hand: "left" | "right", x: number, y: number): void {
    const {xrDevice} = (window as IWERWindow);
    if (!xrDevice) {
        throw new Error("IWER not initialized. Call setupIWER() first.");
    }

    const controller = hand === "left" ?
        xrDevice.primaryController :
        xrDevice.secondaryController;

    if (controller) {
        controller.thumbstick.x = x;
        controller.thumbstick.y = y;
    }
}

/**
 * Press the trigger button on a mock controller.
 *
 * @param hand - "left" or "right"
 */
export function pressTrigger(hand: "left" | "right"): void {
    const {xrDevice} = (window as IWERWindow);
    if (!xrDevice) {
        throw new Error("IWER not initialized. Call setupIWER() first.");
    }

    const controller = hand === "left" ?
        xrDevice.primaryController :
        xrDevice.secondaryController;

    if (controller) {
        controller.trigger.value = 1.0;
        controller.trigger.pressed = true;
    }
}

/**
 * Release the trigger button on a mock controller.
 *
 * @param hand - "left" or "right"
 */
export function releaseTrigger(hand: "left" | "right"): void {
    const {xrDevice} = (window as IWERWindow);
    if (!xrDevice) {
        throw new Error("IWER not initialized. Call setupIWER() first.");
    }

    const controller = hand === "left" ?
        xrDevice.primaryController :
        xrDevice.secondaryController;

    if (controller) {
        controller.trigger.value = 0;
        controller.trigger.pressed = false;
    }
}

/**
 * Press the grip button on a mock controller.
 *
 * @param hand - "left" or "right"
 */
export function pressGrip(hand: "left" | "right"): void {
    const {xrDevice} = (window as IWERWindow);
    if (!xrDevice) {
        throw new Error("IWER not initialized. Call setupIWER() first.");
    }

    const controller = hand === "left" ?
        xrDevice.primaryController :
        xrDevice.secondaryController;

    if (controller) {
        controller.grip.value = 1.0;
        controller.grip.pressed = true;
    }
}

/**
 * Release the grip button on a mock controller.
 *
 * @param hand - "left" or "right"
 */
export function releaseGrip(hand: "left" | "right"): void {
    const {xrDevice} = (window as IWERWindow);
    if (!xrDevice) {
        throw new Error("IWER not initialized. Call setupIWER() first.");
    }

    const controller = hand === "left" ?
        xrDevice.primaryController :
        xrDevice.secondaryController;

    if (controller) {
        controller.grip.value = 0;
        controller.grip.pressed = false;
    }
}

/**
 * Set the position of a mock controller.
 *
 * @param hand - "left" or "right"
 * @param position - World position (x, y, z)
 */
export function setControllerPosition(hand: "left" | "right", position: Vector3D): void {
    const {xrDevice} = (window as IWERWindow);
    if (!xrDevice) {
        throw new Error("IWER not initialized. Call setupIWER() first.");
    }

    const controller = hand === "left" ?
        xrDevice.primaryController :
        xrDevice.secondaryController;

    if (controller) {
        controller.position.set(position.x, position.y, position.z);
    }
}

/**
 * Set a hand to a pinching state via IWER.
 *
 * @param hand - "left" or "right"
 * @param isPinching - Whether the hand should be pinching
 */
export function setHandPinch(hand: "left" | "right", isPinching: boolean): void {
    const {xrDevice} = (window as IWERWindow);
    if (!xrDevice) {
        throw new Error("IWER not initialized. Call setupIWER() first.");
    }

    const handInput = hand === "left" ?
        xrDevice.leftHand :
        xrDevice.rightHand;

    if (handInput) {
        const thumbTip = handInput.joints["thumb-tip"];
        const indexTip = handInput.joints["index-finger-tip"];
        if (isPinching) {
            // Move thumb-tip and index-tip close together (2cm apart)
            thumbTip.position.set(0, 0, 0);
            indexTip.position.set(0.02, 0, 0);
        } else {
            // Move them apart (8cm)
            thumbTip.position.set(0, 0, 0);
            indexTip.position.set(0.08, 0, 0);
        }
    }
}

/**
 * Check if IWER is available in the current environment.
 *
 * @returns true if IWER can be imported
 */
export async function isIWERAvailable(): Promise<boolean> {
    try {
        // Use string template to prevent Vite static analysis from failing on missing module
        const moduleName = "iwer";
        await import(/* @vite-ignore */ moduleName);
        return true;
    } catch {
        return false;
    }
}
