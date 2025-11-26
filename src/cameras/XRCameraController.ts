import type {Camera} from "@babylonjs/core";

import type {XRSessionManager} from "../xr/XRSessionManager";
import type {CameraController} from "./CameraManager";

/**
 * XRCameraController wraps the WebXR camera and implements the CameraController interface
 * for seamless integration with the CameraManager system.
 *
 * This enables switching between desktop cameras (Orbit, 2D) and XR cameras.
 */
export class XRCameraController implements CameraController {
    private sessionManager: XRSessionManager;

    constructor(sessionManager: XRSessionManager) {
        this.sessionManager = sessionManager;
    }

    /**
     * Get the active XR camera
     * @throws Error if XR session is not active
     */
    public get camera(): Camera {
        const xrCamera = this.sessionManager.getXRCamera();

        if (!xrCamera) {
            throw new Error("XRCameraController: XR session not active");
        }

        return xrCamera;
    }

    /**
     * Zoom to bounding box is not supported in XR mode
     * In XR, the user controls the camera directly through head/device movement
     *
     * Future: Could implement teleportation or root transform adjustment
     */
    public zoomToBoundingBox(): void {
        console.warn(
            "zoomToBoundingBox in XR mode: Feature not yet implemented. " +
            "In XR, users control camera position through physical movement.",
        );
    }

    /**
     * Cleanup resources
     * Note: XR camera is managed by XRSessionManager, so no direct disposal needed
     */
    public dispose(): void {
        // No direct disposal needed - XRSessionManager handles XR resource cleanup
    }
}
