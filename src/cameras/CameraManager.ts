// CameraManager.ts
import {Camera, Scene, Vector3} from "@babylonjs/core";

export interface CameraController {
    camera: Camera;
    zoomToBoundingBox(min: Vector3, max: Vector3): void;
}

export interface InputHandler {
    enable(): void;
    disable(): void;
    update(): void;
}

export type CameraKey = "orbit" | "2d" | "xr";

export class CameraManager {
    private scene: Scene;
    private activeCameraController: CameraController | null = null;
    private activeInputHandler: InputHandler | null = null;
    private controllers = new Map<CameraKey, CameraController>();
    private inputs = new Map<CameraKey, InputHandler>();

    constructor(scene: Scene) {
        this.scene = scene;
    }

    public registerCamera(key: CameraKey, controller: CameraController, inputHandler: InputHandler): void {
        this.controllers.set(key, controller);
        this.inputs.set(key, inputHandler);
    }

    public activateCamera(key: CameraKey): void {
        const controller = this.controllers.get(key);
        const inputHandler = this.inputs.get(key);

        if (!controller || !inputHandler) {
            console.warn(`Camera or input for key '${key}' not registered.`);
            return;
        }

        // Detach previous inputs & camera
        this.activeInputHandler?.disable();
        this.activeCameraController?.camera.detachControl();

        // Activate new camera & inputs
        this.scene.activeCamera = controller.camera;
        controller.camera.attachControl(this.scene.getEngine().getRenderingCanvas(), true);
        inputHandler.enable();

        this.activeCameraController = controller;
        this.activeInputHandler = inputHandler;
    }

    public zoomToBoundingBox(min: Vector3, max: Vector3): void {
        if (this.activeCameraController) {
            this.activeCameraController.zoomToBoundingBox(min, max);
        }
    }

    public update(): void {
        this.activeInputHandler?.update();
    }

    public getActiveController(): CameraController | null {
        return this.activeCameraController;
    }

    /**
     * Temporarily disable the active input handler (e.g., during node dragging)
     */
    public temporarilyDisableInput(): void {
        if (this.activeInputHandler) {
            this.activeInputHandler.disable();
        }
    }

    /**
     * Re-enable the active input handler after temporary disable
     */
    public temporarilyEnableInput(): void {
        if (this.activeInputHandler) {
            this.activeInputHandler.enable();
        }
    }

    public dispose(): void {
        // Disable active input handler
        this.activeInputHandler?.disable();

        // Detach active camera
        this.activeCameraController?.camera.detachControl();

        // Clear references
        this.activeCameraController = null;
        this.activeInputHandler = null;
        this.controllers.clear();
        this.inputs.clear();
    }
}
