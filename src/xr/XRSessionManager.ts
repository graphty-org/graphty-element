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
    }

    /**
   * Check if WebXR is supported in the current browser
   */
    public isXRSupported(): boolean {
        const hasNavigator = typeof navigator !== "undefined";
        const hasXR = hasNavigator && !!navigator.xr;
        const isSecureContext = hasNavigator && window.isSecureContext;

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
            return await navigator.xr!.isSessionSupported("immersive-vr");
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
            return await navigator.xr!.isSessionSupported("immersive-ar");
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
            // Import WebXR module dynamically
            const {WebXRDefaultExperience} = await import("@babylonjs/core");

            this.xrHelper = await WebXRDefaultExperience.CreateAsync(this.scene, {
                floorMeshes: [],
                optionalFeatures: true,
            });

            // Actually enter the VR session
            const enterResult = await this.xrHelper.baseExperience.enterXRAsync("immersive-vr", "local-floor");
            console.log("[XR] Entered VR session:", enterResult);

            // If previous camera provided and not VR-specific, optionally transfer position
            if (previousCamera) {
                const xrCamera = this.getXRCamera();
                if (xrCamera) {
                    xrCamera.position.copyFrom(previousCamera.position);
                }
            }

            this.activeMode = "immersive-vr";
        } catch (error) {
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
            // Import WebXR module dynamically
            const {WebXRDefaultExperience} = await import("@babylonjs/core");

            this.xrHelper = await WebXRDefaultExperience.CreateAsync(this.scene, {
                floorMeshes: [],
                optionalFeatures: true,
                uiOptions: {
                    sessionMode: "immersive-ar",
                },
            });

            // Actually enter the AR session
            const enterResult = await this.xrHelper.baseExperience.enterXRAsync("immersive-ar", "local-floor");
            console.log("[XR] Entered AR session:", enterResult);

            // Always transfer camera position for AR mode
            if (previousCamera) {
                const xrCamera = this.getXRCamera();
                if (xrCamera) {
                    xrCamera.position.copyFrom(previousCamera.position);
                }
            }

            this.activeMode = "immersive-ar";
        } catch (error) {
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
