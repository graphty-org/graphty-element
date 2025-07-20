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
    private canvasElement: Element;
    public config: OrbitConfig;

    constructor(canvas: Element, scene: Scene, config: OrbitConfig) {
        this.canvasElement = canvas;
        this.config = config;

        this.scene = scene;
        this.scene.clearColor = new Color4(0, 0, 0, 1);
        this.pivot = new TransformNode("pivot", this.scene);
        this.cameraDistance = 10;

        this.camera = new UniversalCamera("camera", new Vector3(0, 0, -this.cameraDistance), this.scene);
        this.camera.inputs.clear();
        this.scene.activeCamera = this.camera;
        this.camera.attachControl(canvas, true);

        // Force initial update after camera is properly set up
        this.updateCameraPosition();
    }

    public rotate(dx: number, dy: number): void {
        this.pivot.rotate(Axis.Y, -dx * this.config.trackballRotationSpeed, Space.LOCAL);
        this.pivot.rotate(Axis.X, -dy * this.config.trackballRotationSpeed, Space.LOCAL);
        // Update camera position since it's not parented
        this.updateCameraPosition();
    }

    public spin(dz: number): void {
        this.pivot.rotate(Axis.Z, dz, Space.LOCAL);
        // Update camera position since it's not parented
        this.updateCameraPosition();
    }

    public zoom(delta: number): void {
        this.cameraDistance = Scalar.Clamp(this.cameraDistance + delta, this.config.minZoomDistance, this.config.maxZoomDistance);
    }

    public updateCameraPosition(): void {
        // Parent the camera to the pivot for proper transformation
        this.camera.parent = this.pivot;

        // Set local position relative to pivot
        this.camera.position.set(0, 0, -this.cameraDistance);

        // Reset camera rotation - when parented, the camera inherits the pivot's rotation
        this.camera.rotation.set(0, 0, 0);
    }

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
