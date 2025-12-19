/* eslint-disable no-console -- XR debugging requires console logging for development */
import type {Camera, Scene, WebXRDefaultExperience} from "@babylonjs/core";

export type XRReferenceSpaceType =
  | "local"
  | "local-floor"
  | "bounded-floor"
  | "unbounded";

export interface XRSessionConfig {
    vr: {
        enabled: boolean;
        referenceSpaceType: XRReferenceSpaceType;
        optionalFeatures?: string[];
    };
    ar: {
        enabled: boolean;
        referenceSpaceType: XRReferenceSpaceType;
        optionalFeatures?: string[];
    };
}

/**
 * Manages WebXR session lifecycle for VR and AR modes.
 * Handles session initialization, camera management, and cleanup.
 */
export class XRSessionManager {
    private scene: Scene;
    private config: XRSessionConfig;
    private xrHelper: WebXRDefaultExperience | null = null;
    private activeMode: "immersive-vr" | "immersive-ar" | null = null;

    constructor(scene: Scene, config: XRSessionConfig) {
        this.scene = scene;
        this.config = config;
        console.log("🎮 [XRSessionManager] Created with config:", config);
    }

    /**
   * Check if WebXR is supported in the current browser
   */
    public isXRSupported(): boolean {
        const hasNavigator = typeof navigator !== "undefined";
        const hasXR = hasNavigator && !!navigator.xr;
        const hasWindow = typeof window !== "undefined";
        const isSecureContext = hasWindow && window.isSecureContext;

        console.log("[XR Detection]", {
            hasNavigator,
            hasXR,
            isSecureContext,
            userAgent: hasNavigator ? navigator.userAgent : "N/A",
        });

        return hasXR;
    }

    /**
   * Check if VR sessions are supported on this device
   */
    public async isVRSupported(): Promise<boolean> {
        if (!this.isXRSupported()) {
            return false;
        }

        try {
            // navigator.xr is guaranteed to exist after isXRSupported() check
            const {xr} = navigator;
            if (!xr) {
                return false;
            }

            return await xr.isSessionSupported("immersive-vr");
        } catch (error) {
            console.warn("Failed to check VR support:", error);
            return false;
        }
    }

    /**
   * Check if AR sessions are supported on this device
   */
    public async isARSupported(): Promise<boolean> {
        if (!this.isXRSupported()) {
            return false;
        }

        try {
            // navigator.xr is guaranteed to exist after isXRSupported() check
            const {xr} = navigator;
            if (!xr) {
                return false;
            }

            return await xr.isSessionSupported("immersive-ar");
        } catch (error) {
            console.warn("Failed to check AR support:", error);
            return false;
        }
    }

    /**
   * Enter VR mode and optionally transfer camera position
   */
    public async enterVR(previousCamera?: Camera): Promise<void> {
        if (!this.isXRSupported()) {
            throw new Error("WebXR is not supported in this browser");
        }

        if (this.activeMode) {
            throw new Error("An XR session is already active");
        }

        try {
            console.log("🎮 [XRSessionManager] Creating VR XR experience...");

            // Import WebXR module dynamically
            const {WebXRDefaultExperience, WebXRFeatureName} = await import("@babylonjs/core");

            this.xrHelper = await WebXRDefaultExperience.CreateAsync(this.scene, {
                floorMeshes: [],
                optionalFeatures: true,
                disableTeleportation: true, // Match demo
            });

            console.log("🎮 [XRSessionManager] XR experience created, enabling hand tracking with hand meshes...");

            // Enable hand tracking with default rigged hand meshes (purple hands)
            // Using simple config that matches the working demo
            try {
                const handTracking = this.xrHelper.baseExperience.featuresManager.enableFeature(
                    WebXRFeatureName.HAND_TRACKING,
                    "latest",
                    {
                        xrInput: this.xrHelper.input,
                        jointMeshes: {enablePhysics: false},
                    },
                );
                console.log("🤲 [XRSessionManager] Hand tracking enabled:", handTracking);
            } catch (handError) {
                console.error("🤲 [XRSessionManager] Failed to enable hand tracking:", handError);
            }

            // Actually enter the VR session
            console.log("🎮 [XRSessionManager] Entering VR session...");
            const enterResult = await this.xrHelper.baseExperience.enterXRAsync("immersive-vr", "local-floor");
            console.log("🎮 [XRSessionManager] Entered VR session:", enterResult);

            // Log available features
            const enabledFeatures = this.xrHelper.baseExperience.featuresManager.getEnabledFeatures();
            console.log("🎮 [XRSessionManager] Enabled XR features:", enabledFeatures);

            // If previous camera provided and not VR-specific, optionally transfer position
            if (previousCamera) {
                const xrCamera = this.getXRCamera();
                if (xrCamera) {
                    xrCamera.position.copyFrom(previousCamera.position);
                    console.log("🎮 [XRSessionManager] Transferred camera position from previous camera");
                }
            }

            this.activeMode = "immersive-vr";
        } catch (error) {
            console.error("🎮 [XRSessionManager] Failed to enter VR:", error);
            this.xrHelper = null;
            this.activeMode = null;
            throw new Error(`Failed to enter VR mode: ${error}`);
        }
    }

    /**
   * Enter AR mode and transfer camera position
   */
    public async enterAR(previousCamera?: Camera): Promise<void> {
        if (!this.isXRSupported()) {
            throw new Error("WebXR is not supported in this browser");
        }

        if (this.activeMode) {
            throw new Error("An XR session is already active");
        }

        try {
            console.log("🎮 [XRSessionManager] Creating AR XR experience...");

            // Import WebXR module dynamically
            const {WebXRDefaultExperience} = await import("@babylonjs/core");

            // For AR, we explicitly DON'T request hand-tracking as an optional feature
            // This prevents dots/spheres from appearing in AR mode
            // Controller triggers still work for gestures without the hand tracking feature
            this.xrHelper = await WebXRDefaultExperience.CreateAsync(this.scene, {
                floorMeshes: [],
                // Don't request all optional features - this prevents hand-tracking from being enabled
                optionalFeatures: false,
                disableTeleportation: true,
                uiOptions: {
                    sessionMode: "immersive-ar",
                },
            });

            console.log("🎮 [XRSessionManager] AR mode: Created without hand tracking (controller gestures still work)");

            // Actually enter the AR session
            console.log("🎮 [XRSessionManager] Entering AR session...");
            const enterResult = await this.xrHelper.baseExperience.enterXRAsync("immersive-ar", "local-floor");
            console.log("🎮 [XRSessionManager] Entered AR session:", enterResult);

            // Log available features
            const enabledFeatures = this.xrHelper.baseExperience.featuresManager.getEnabledFeatures();
            console.log("🎮 [XRSessionManager] Enabled XR features:", enabledFeatures);

            // Always transfer camera position for AR mode
            if (previousCamera) {
                const xrCamera = this.getXRCamera();
                if (xrCamera) {
                    xrCamera.position.copyFrom(previousCamera.position);
                    console.log("🎮 [XRSessionManager] Transferred camera position from previous camera");
                }
            }

            this.activeMode = "immersive-ar";
        } catch (error) {
            console.error("🎮 [XRSessionManager] Failed to enter AR:", error);
            this.xrHelper = null;
            this.activeMode = null;
            throw new Error(`Failed to enter AR mode: ${error}`);
        }
    }

    /**
   * Exit the current XR session
   */
    public async exitXR(): Promise<void> {
        if (!this.activeMode || !this.xrHelper) {
            return; // No active session to exit
        }

        try {
            await this.xrHelper.baseExperience.exitXRAsync();
            this.xrHelper.dispose();
            this.xrHelper = null;
            this.activeMode = null;
        } catch (error) {
            // Clean up even if exit fails
            this.xrHelper = null;
            this.activeMode = null;
            throw new Error(`Failed to exit XR mode: ${error}`);
        }
    }

    /**
   * Get the active XR camera
   */
    public getXRCamera(): Camera | null {
        return this.xrHelper?.baseExperience.camera ?? null;
    }

    /**
   * Get the WebXR helper instance
   */
    public getXRHelper(): WebXRDefaultExperience | null {
        return this.xrHelper;
    }

    /**
   * Get the currently active XR mode
   */
    public getActiveMode(): "immersive-vr" | "immersive-ar" | null {
        return this.activeMode;
    }

    /**
   * Cleanup all XR resources
   */
    public dispose(): void {
        if (this.xrHelper) {
            this.xrHelper.dispose();
            this.xrHelper = null;
        }

        this.activeMode = null;
    }
}
