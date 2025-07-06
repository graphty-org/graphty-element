// CameraManager.ts
import {Camera, Scene} from "@babylonjs/core";

import {OrbitCameraController} from "./OrbitCameraController";
import {TwoDCameraController} from "./TwoDCameraController";

export type CameraKey = "orbit" | "2d";

export interface CameraController {
    camera: Camera;
    update(): void;
}

export class CameraManager {
    private scene: Scene;
    private activeCameraController: CameraController | null = null;
    private controllers = new Map<CameraKey, CameraController>();

    constructor(scene: Scene) {
        this.scene = scene;
    }

    public registerCamera(key: CameraKey, controller: CameraController): void {
        this.controllers.set(key, controller);
    }

    public activateCamera(key: CameraKey): void {
        const controller = this.controllers.get(key);
        if (!controller) {
            console.warn(`Camera with key '${key}' not registered.`);
            return;
        }

        if (this.activeCameraController) {
            this.activeCameraController.camera.detachControl();
        }

        this.scene.activeCamera = controller.camera;
        controller.camera.attachControl(this.scene.getEngine().getRenderingCanvas(), true);
        this.activeCameraController = controller;
    }

    public update(): void {
        this.activeCameraController?.update();
    }
}
