// CameraManager.ts
import {Camera, Scene} from "@babylonjs/core";

export interface CameraController {
    camera: Camera;
    update(): void;
}

export interface InputHandler {
    enable(): void;
    disable(): void;
}

export type CameraKey = "orbit" | "2d";

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

    public update(): void {
        this.activeCameraController?.update();
    }
}
