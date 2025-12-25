import {Camera, Color4, Scalar, Scene, type TransformNode, UniversalCamera, Vector3} from "@babylonjs/core";

import {PivotController} from "./PivotController";

export interface OrbitConfig {
    trackballRotationSpeed: number;
    keyboardRotationSpeed: number;
    keyboardZoomSpeed: number;
    keyboardYawSpeed: number;
    pinchZoomSensitivity: number;
    twistYawSensitivity: number;
    minZoomDistance: number;
    maxZoomDistance: number;
    inertiaDamping: number;
}

/**
 * Controls a 3D orbit camera with pivot-based rotation and distance-based zoom.
 * Provides trackball-style rotation and keyboard/touch controls.
 */
export class OrbitCameraController {
    public scene: Scene;
    public camera: UniversalCamera;
    public cameraDistance: number;
    public config: OrbitConfig;

    private pivotController: PivotController;
    private canvasElement: Element;

    /**
     * Expose pivot TransformNode for compatibility with existing code.
     * This is the underlying pivot from PivotController.
     * @returns The pivot TransformNode used for rotation
     */
    public get pivot(): TransformNode {
        return this.pivotController.pivot;
    }

    /**
     * Creates a new OrbitCameraController instance.
     * @param canvas - The canvas element to attach the camera to
     * @param scene - The Babylon.js scene
     * @param config - Configuration options for the orbit camera
     */
    constructor(canvas: Element, scene: Scene, config: OrbitConfig) {
        this.canvasElement = canvas;
        this.config = config;

        this.scene = scene;
        this.scene.clearColor = new Color4(0, 0, 0, 1);

        // Use shared PivotController instead of raw TransformNode
        this.pivotController = new PivotController(scene);

        this.cameraDistance = 10;

        this.camera = new UniversalCamera("camera", new Vector3(0, 0, -this.cameraDistance), this.scene);
        this.camera.inputs.clear();
        this.scene.activeCamera = this.camera;
        this.camera.attachControl(canvas, true);

        // Force initial update after camera is properly set up
        this.updateCameraPosition();
    }

    /**
     * Rotate the scene by dx (yaw) and dy (pitch) amounts.
     * Delegates to PivotController for consistent rotation behavior.
     * @param dx - Horizontal rotation delta in pixels
     * @param dy - Vertical rotation delta in pixels
     */
    public rotate(dx: number, dy: number): void {
        // Delegate to PivotController
        // Note: negative values because mouse movement is inverted from rotation direction
        this.pivotController.rotate(
            -dx * this.config.trackballRotationSpeed,
            -dy * this.config.trackballRotationSpeed,
        );
        this.updateCameraPosition();
    }

    /**
     * Spin the scene around the Z-axis (roll).
     * Delegates to PivotController for consistent rotation behavior.
     * @param dz - Rotation delta around Z-axis in radians
     */
    public spin(dz: number): void {
        this.pivotController.spin(dz);
        this.updateCameraPosition();
    }

    /**
     * Zoom by adjusting camera distance.
     * Note: This uses camera-distance based zoom (not scale-based like XR).
     * This feels more natural for desktop interaction.
     * @param delta - Distance delta to adjust camera by
     */
    public zoom(delta: number): void {
        this.cameraDistance = Scalar.Clamp(
            this.cameraDistance + delta,
            this.config.minZoomDistance,
            this.config.maxZoomDistance,
        );
    }

    /**
     * Update camera position relative to the pivot.
     * Parents camera to pivot and positions at negative Z distance.
     */
    public updateCameraPosition(): void {
        // Parent the camera to the pivot for proper transformation
        this.camera.parent = this.pivot;

        // Set local position relative to pivot
        this.camera.position.set(0, 0, -this.cameraDistance);

        // Reset camera rotation - when parented, the camera inherits the pivot's rotation
        this.camera.rotation.set(0, 0, 0);
    }

    /**
     * Zoom the camera to fit a bounding box in view.
     * Positions the pivot at the center and adjusts camera distance.
     * @param min - The minimum corner of the bounding box
     * @param max - The maximum corner of the bounding box
     */
    public zoomToBoundingBox(min: Vector3, max: Vector3): void {
        const center = min.add(max).scale(0.5);
        const size = max.subtract(min);

        // Position pivot at center of bounding box
        this.pivot.position.copyFrom(center);
        this.pivot.computeWorldMatrix(true);

        // Get canvas dimensions
        const engine = this.scene.getEngine();
        engine.resize(); // Ensure we have current dimensions
        const canvasWidth = engine.getRenderWidth();
        const canvasHeight = engine.getRenderHeight();
        const aspectRatio = canvasWidth / canvasHeight;

        // Get camera FOV (vertical)
        let verticalFov = 0.8; // default ~45.8 degrees
        if (this.camera.fovMode === Camera.FOVMODE_VERTICAL_FIXED) {
            verticalFov = this.camera.fov;
        } else if (this.camera.fovMode === Camera.FOVMODE_HORIZONTAL_FIXED && this.camera.fov) {
            // Convert horizontal to vertical
            verticalFov = 2 * Math.atan(Math.tan(this.camera.fov / 2) / aspectRatio);
        }

        // Calculate horizontal FOV from vertical FOV and aspect ratio
        const halfFovY = verticalFov / 2;
        const halfFovX = Math.atan(Math.tan(halfFovY) * aspectRatio);

        // For 3D scenes, we need to account for perspective projection.
        // Objects at different Z depths will project differently on screen.
        // The camera is positioned at (0, 0, -distance) relative to pivot,
        // so objects closer to the camera (negative Z relative to center) appear larger.
        //
        // To properly fit all 8 corners of the bounding box, we need to find
        // the minimum distance that ensures all corners project within the viewport.
        //
        // For a point at (x, y, z) relative to center, when viewed from distance d:
        // - The point is at depth (d - z) from the camera
        // - It projects to screen_x = x * focal / (d - z)
        // - It projects to screen_y = y * focal / (d - z)
        //
        // To fit within FOV: |screen_x| < tan(fovX/2) * (d - z), etc.
        // Rearranging: d > z + |x| / tan(fovX/2)  and  d > z + |y| / tan(fovY/2)

        const halfWidth = size.x / 2;
        const halfHeight = size.y / 2;
        const halfDepth = size.z / 2;

        // Check all 8 corners of the bounding box
        // Each corner has coordinates relative to center: (±halfWidth, ±halfHeight, ±halfDepth)
        // We need to find the minimum distance that fits all corners
        let maxRequiredDistance = 0;

        for (const sx of [-1, 1]) {
            for (const sy of [-1, 1]) {
                for (const sz of [-1, 1]) {
                    const x = sx * halfWidth;
                    const y = sy * halfHeight;
                    const z = sz * halfDepth;

                    // Distance needed to fit this corner horizontally
                    // d > z + |x| / tan(fovX/2)
                    const distanceForX = z + (Math.abs(x) / Math.tan(halfFovX));

                    // Distance needed to fit this corner vertically
                    // d > z + |y| / tan(fovY/2)
                    const distanceForY = z + (Math.abs(y) / Math.tan(halfFovY));

                    maxRequiredDistance = Math.max(maxRequiredDistance, distanceForX, distanceForY);
                }
            }
        }

        // Apply a reasonable padding factor
        // Since we already include labels in the bounding box, we only need
        // a small padding for visual comfort and edge arrows
        const PADDING_PERCENT = 5; // 5% padding
        const targetDistance = maxRequiredDistance * (1 + (PADDING_PERCENT / 100));

        // Clamp to configured limits
        this.cameraDistance = Scalar.Clamp(targetDistance, this.config.minZoomDistance, this.config.maxZoomDistance);

        // Apply the new camera position immediately
        this.updateCameraPosition();
    }
}
