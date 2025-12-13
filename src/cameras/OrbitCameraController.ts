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
     */
    public get pivot(): TransformNode {
        return this.pivotController.pivot;
    }

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
     */
    public spin(dz: number): void {
        this.pivotController.spin(dz);
        this.updateCameraPosition();
    }

    /**
     * Zoom by adjusting camera distance.
     * Note: This uses camera-distance based zoom (not scale-based like XR).
     * This feels more natural for desktop interaction.
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

        // Use box fitting for tighter bounds
        // For a perspective camera looking down the -Z axis at a box centered at origin:
        // To fit width: distance = (width/2) / tan(fovX/2)
        // To fit height: distance = (height/2) / tan(fovY/2)
        const halfWidth = size.x / 2;
        const halfHeight = size.y / 2;

        // Calculate distance needed for box to fit horizontally
        const distanceX = halfWidth / Math.tan(halfFovX);

        // Calculate distance needed for box to fit vertically
        const distanceY = halfHeight / Math.tan(halfFovY);

        // Use the larger distance to ensure box fits in both dimensions
        const minDistance = Math.max(distanceX, distanceY);

        // Apply a reasonable padding factor
        // Since we already include labels in the bounding box, we only need
        // a small padding for visual comfort and edge arrows
        const PADDING_PERCENT = 5; // 5% padding
        const targetDistance = minDistance * (1 + (PADDING_PERCENT / 100));

        // Clamp to configured limits
        this.cameraDistance = Scalar.Clamp(targetDistance, this.config.minZoomDistance, this.config.maxZoomDistance);

        // Apply the new camera position immediately
        this.updateCameraPosition();
    }
}
