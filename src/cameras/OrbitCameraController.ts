import {Axis, Camera, Color4, Scalar, Scene, Space, TransformNode, UniversalCamera, Vector3} from "@babylonjs/core";

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
    public pivot: TransformNode;
    public camera: UniversalCamera;
    public cameraDistance: number;
    private canvas: Element;
    public config: OrbitConfig;

    constructor(canvas: Element, scene: Scene, config: OrbitConfig) {
        this.canvas = canvas;
        this.config = config;

        this.scene = scene;
        this.scene.clearColor = new Color4(0, 0, 0, 1);
        this.pivot = new TransformNode("pivot", this.scene);
        this.cameraDistance = 10;

        this.camera = new UniversalCamera("camera", new Vector3(0, 0, -this.cameraDistance), this.scene);
        this.camera.parent = this.pivot;
        this.camera.lockedTarget = this.pivot;
        this.camera.inputs.clear();
        this.scene.activeCamera = this.camera;
        this.camera.attachControl(canvas, true);
    }

    public rotate(dx: number, dy: number): void {
        this.pivot.rotate(Axis.Y, -dx * this.config.trackballRotationSpeed, Space.LOCAL);
        this.pivot.rotate(Axis.X, -dy * this.config.trackballRotationSpeed, Space.LOCAL);
    }

    public spin(dz: number): void {
        this.pivot.rotate(Axis.Z, dz, Space.LOCAL);
    }

    public zoom(delta: number): void {
        this.cameraDistance = Scalar.Clamp(this.cameraDistance + delta, this.config.minZoomDistance, this.config.maxZoomDistance);
    }

    public updateCameraPosition(): void {
        this.camera.position.copyFrom(Vector3.Forward().scale(-this.cameraDistance));
    }

    public zoomToBoundingBox(min: Vector3, max: Vector3): void {
        const center = min.add(max).scale(0.5);
        const size = max.subtract(min);

        this.pivot.position.copyFrom(center);

        // Get camera's field of view
        // UniversalCamera uses fovMode and either fov (for FOVMODE_VERTICAL_FIXED)
        // or horizontalFov (for FOVMODE_HORIZONTAL_FIXED)
        // Default FOV for Babylon cameras is typically around 0.8 radians (~45.8 degrees)
        let fov = 0.8; // default
        if (this.camera.fovMode === Camera.FOVMODE_VERTICAL_FIXED) {
            fov = this.camera.fov;
        } else if (this.camera.fovMode === Camera.FOVMODE_HORIZONTAL_FIXED && this.camera.fov) {
            // Convert horizontal FOV to vertical FOV using aspect ratio
            const aspectRatio = this.scene.getEngine().getAspectRatio(this.camera);
            fov = 2 * Math.atan(Math.tan(this.camera.fov / 2) / aspectRatio);
        }

        // Get viewport aspect ratio
        const engine = this.scene.getEngine();
        const aspectRatio = engine.getAspectRatio(this.camera);

        // We need to consider all three dimensions since the camera can be rotated
        const halfExtentX = size.x / 2;
        const halfExtentY = size.y / 2;
        const halfExtentZ = size.z / 2;

        // For a perspective camera:
        // - Vertical FOV is fixed
        // - Horizontal FOV = 2 * atan(tan(verticalFOV/2) * aspectRatio)
        const halfFovY = fov / 2;
        const halfFovX = Math.atan(Math.tan(halfFovY) * aspectRatio);

        // Calculate required distance for each axis pair
        // We need to ensure the bounding box fits when viewed from any angle
        const distances = [
            // XY plane (most common view)
            halfExtentX / Math.tan(halfFovX),
            halfExtentY / Math.tan(halfFovY),
            // XZ plane
            halfExtentX / Math.tan(halfFovX),
            halfExtentZ / Math.tan(halfFovY),
            // YZ plane
            halfExtentY / Math.tan(halfFovX),
            halfExtentZ / Math.tan(halfFovY),
        ];

        // Use the maximum distance to ensure content fits from any viewing angle
        // Add small padding factor of 1.1 for visual comfort
        const paddingFactor = 1.1;
        const targetDistance = Math.max(... distances) * paddingFactor;

        this.cameraDistance = Scalar.Clamp(targetDistance, this.config.minZoomDistance, this.config.maxZoomDistance);

        // Apply the new camera position immediately
        this.updateCameraPosition();
    }
}
