import {Axis, Color4, Scalar, Scene, Space, TransformNode, UniversalCamera, Vector3} from "@babylonjs/core";

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
}
