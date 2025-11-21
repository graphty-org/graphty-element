/**
 * XR (VR/AR) Configuration
 *
 * This configuration controls the behavior of WebXR features in graphty-element.
 */

import type {XRReferenceSpaceType} from "../xr/XRSessionManager";

/**
 * UI configuration for XR buttons
 */
export interface XRUIConfig {
    /**
   * Enable or disable the XR UI buttons
   * @default true
   */
    enabled: boolean;

    /**
   * Position of the XR buttons on screen
   * @default "bottom-left"
   */
    position: "bottom-left" | "bottom-right" | "top-left" | "top-right";

    /**
   * Duration in milliseconds to show "not available" message
   * Set to 0 to keep message visible permanently
   * @default 5000
   */
    unavailableMessageDuration: number;
}

/**
 * Configuration for VR or AR mode
 */
export interface XRModeConfig {
    /**
   * Enable this XR mode
   * @default true
   */
    enabled: boolean;

    /**
   * Reference space type for WebXR session
   * @default "local-floor"
   */
    referenceSpaceType: XRReferenceSpaceType;

    /**
   * Optional WebXR features to request
   * @example ["hand-tracking", "hit-test"]
   * @default []
   */
    optionalFeatures?: string[];
}

/**
 * Configuration for XR input handling
 */
export interface XRInputConfig {
    /**
   * Enable hand tracking
   * @default true
   */
    handTracking: boolean;

    /**
   * Enable controller input
   * @default true
   */
    controllers: boolean;

    /**
   * Enable near interaction (touching objects with hands)
   * @default true
   */
    nearInteraction: boolean;

    /**
   * Enable physics for hand joints
   * @default false
   */
    physics: boolean;

    /**
   * Z-axis movement amplification factor in XR mode
   * Multiplies Z-axis delta to make depth manipulation more practical
   * @default 10.0
   */
    zAxisAmplification?: number;

    /**
   * Enable Z-axis amplification in desktop mode
   * @default false
   */
    enableZAmplificationInDesktop?: boolean;
}

/**
 * Configuration for XR teleportation
 */
export interface XRTeleportationConfig {
    /**
   * Enable teleportation feature
   * @default false
   */
    enabled: boolean;

    /**
   * Duration of teleportation animation in milliseconds
   * @default 200
   */
    easeTime: number;
}

/**
 * Complete XR configuration
 */
export interface XRConfig {
    /**
   * Enable XR features globally
   * @default true
   */
    enabled: boolean;

    /**
   * UI button configuration
   */
    ui: XRUIConfig;

    /**
   * VR mode configuration
   */
    vr: XRModeConfig;

    /**
   * AR mode configuration
   */
    ar: XRModeConfig;

    /**
   * Input handling configuration
   */
    input: XRInputConfig;

    /**
   * Teleportation configuration
   */
    teleportation: XRTeleportationConfig;
}

/**
 * Default XR configuration
 */
export const defaultXRConfig: XRConfig = {
    enabled: true,
    ui: {
        enabled: true,
        position: "bottom-right",
        unavailableMessageDuration: 5000,
    },
    vr: {
        enabled: true,
        referenceSpaceType: "local-floor",
        optionalFeatures: [],
    },
    ar: {
        enabled: true,
        referenceSpaceType: "local-floor",
        optionalFeatures: ["hit-test"],
    },
    input: {
        handTracking: true,
        controllers: true,
        nearInteraction: true,
        physics: false,
        zAxisAmplification: 10.0,
        enableZAmplificationInDesktop: false,
    },
    teleportation: {
        enabled: false,
        easeTime: 200,
    },
};
