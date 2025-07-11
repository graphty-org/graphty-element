// OrbitInputController.ts
import Hammer from "hammerjs";

import {OrbitCameraController, OrbitConfig} from "./OrbitCameraController";

export class OrbitInputController {
    private canvas: HTMLCanvasElement;
    private controller: OrbitCameraController;
    private isPointerDown = false;
    private lastX = 0;
    private lastY = 0;
    private isMultiTouch = false;
    private rotationVelocityX = 0;
    private rotationVelocityY = 0;
    private keysDown: Record<string, boolean> = {};
    private config: OrbitConfig;
    private hammer: HammerManager | null = null;
    private enabled = false;

    // Store handlers for attach/detach
    private pointerDownHandler = (evt: PointerEvent): void => {
        if (evt.button === 0 && !this.isMultiTouch) {
            this.isPointerDown = true;
            this.lastX = evt.clientX;
            this.lastY = evt.clientY;
            this.canvas.focus(); // Ensure canvas gets focus for keyboard
        }
    };

    private pointerUpHandler = (): void => {
        this.isPointerDown = false;
    };

    private pointerMoveHandler = (evt: PointerEvent): void => {
        if (!this.isPointerDown || this.isMultiTouch) {
            return;
        }

        const dx = evt.clientX - this.lastX;
        const dy = evt.clientY - this.lastY;
        this.lastX = evt.clientX;
        this.lastY = evt.clientY;
        this.controller.rotate(dx, dy);
    };

    private keyDownHandler = (evt: KeyboardEvent): void => {
        console.log("orbit keydown handler");
        this.keysDown[evt.key.toLowerCase()] = true;
    };

    private keyUpHandler = (evt: KeyboardEvent): void => {
        this.keysDown[evt.key.toLowerCase()] = false;
    };

    constructor(canvas: HTMLCanvasElement, controller: OrbitCameraController) {
        this.canvas = canvas;
        this.controller = controller;
        this.config = controller.config;

        // Ensure canvas is focusable
        this.canvas.setAttribute("tabindex", "0");

        this.attachMouseTouch();
    }

    private attachMouseTouch(): void {
        this.hammer = new Hammer.Manager(this.canvas);
        this.hammer.add(new Hammer.Pinch());
        this.hammer.add(new Hammer.Rotate());

        let lastRotation = 0;
        let lastScale = 1;

        this.hammer.on("pinchstart rotatestart", (ev: HammerInput) => {
            this.isMultiTouch = true;
            lastRotation = ev.rotation || 0;
            lastScale = ev.scale || 1;
        });

        this.hammer.on("pinchend rotateend", () => {
            this.isMultiTouch = false;
        });

        this.hammer.on("pinchmove rotatemove", (ev: HammerInput) => {
            const scaleDelta = ev.scale - lastScale;
            this.controller.zoom(-scaleDelta * this.config.pinchZoomSensitivity);
            lastScale = ev.scale;

            const rotationDelta = (ev.rotation - lastRotation) * (Math.PI / 180) * this.config.twistYawSensitivity;
            this.controller.spin(rotationDelta);
            lastRotation = ev.rotation;
        });
    }

    public enable(): void {
        if (this.enabled) {
            return;
        }

        this.enabled = true;

        this.canvas.addEventListener("pointerdown", this.pointerDownHandler);
        this.canvas.addEventListener("pointerup", this.pointerUpHandler);
        this.canvas.addEventListener("pointermove", this.pointerMoveHandler);

        this.canvas.addEventListener("keydown", this.keyDownHandler);
        this.canvas.addEventListener("keyup", this.keyUpHandler);

        this.canvas.focus();

        if (!this.hammer) {
            this.attachMouseTouch();
        }
    }

    public disable(): void {
        if (!this.enabled) {
            return;
        }

        this.enabled = false;

        this.canvas.removeEventListener("pointerdown", this.pointerDownHandler);
        this.canvas.removeEventListener("pointerup", this.pointerUpHandler);
        this.canvas.removeEventListener("pointermove", this.pointerMoveHandler);

        this.canvas.removeEventListener("keydown", this.keyDownHandler);
        this.canvas.removeEventListener("keyup", this.keyUpHandler);

        if (this.hammer) {
            this.hammer.destroy();
            this.hammer = null;
        }
    }

    public update(): void {
        if (!this.enabled) {
            return;
        }

        const keys = this.keysDown;
        const cam = this.controller;

        if (keys.arrowleft) {
            this.rotationVelocityY += this.config.keyboardRotationSpeed;
        }

        if (keys.arrowright) {
            this.rotationVelocityY -= this.config.keyboardRotationSpeed;
        }

        if (keys.arrowup) {
            this.rotationVelocityX += this.config.keyboardRotationSpeed;
        }

        if (keys.arrowdown) {
            this.rotationVelocityX -= this.config.keyboardRotationSpeed;
        }

        if (keys.w) {
            cam.zoom(-this.config.keyboardZoomSpeed);
        }

        if (keys.s) {
            cam.zoom(this.config.keyboardZoomSpeed);
        }

        if (keys.a) {
            cam.spin(this.config.keyboardYawSpeed);
        }

        if (keys.d) {
            cam.spin(-this.config.keyboardYawSpeed);
        }

        if (Math.abs(this.rotationVelocityX) > 0.00001) {
            cam.rotate(0, -this.rotationVelocityX / this.config.trackballRotationSpeed);
            this.rotationVelocityX *= this.config.inertiaDamping;
        }

        if (Math.abs(this.rotationVelocityY) > 0.00001) {
            cam.rotate(-this.rotationVelocityY / this.config.trackballRotationSpeed, 0);
            this.rotationVelocityY *= this.config.inertiaDamping;
        }

        cam.updateCameraPosition();
    }
}
