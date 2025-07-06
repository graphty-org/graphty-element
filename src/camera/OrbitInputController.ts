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

  constructor(canvas: HTMLCanvasElement, controller: OrbitCameraController) {
      this.canvas = canvas;
      this.controller = controller;
      this.config = controller.config;

      this.attachMouseTouch();
      this.attachKeyboard();
  }

  private attachMouseTouch(): void {
      this.canvas.addEventListener("pointerdown", (evt: PointerEvent) => {
          if (evt.button === 0 && !this.isMultiTouch) {
              this.isPointerDown = true;
              this.lastX = evt.clientX;
              this.lastY = evt.clientY;
          }
      });

      this.canvas.addEventListener("pointerup", () => {
          this.isPointerDown = false;
      });

      this.canvas.addEventListener("pointermove", (evt: PointerEvent) => {
          if (!this.isPointerDown || this.isMultiTouch) {
              return;
          }

          const dx = evt.clientX - this.lastX;
          const dy = evt.clientY - this.lastY;
          this.lastX = evt.clientX;
          this.lastY = evt.clientY;
          this.controller.rotate(dx, dy);
      });

      const hammer = new Hammer.Manager(this.canvas);
      hammer.add(new Hammer.Pinch());
      hammer.add(new Hammer.Rotate());

      let lastRotation = 0;
      let lastScale = 1;

      hammer.on("pinchstart rotatestart", () => {
          this.isMultiTouch = true;
          lastRotation = 0;
          lastScale = 1;
      });

      hammer.on("pinchend rotateend", () => {
          this.isMultiTouch = false;
      });

      hammer.on("pinchmove rotatemove", (ev: HammerInput) => {
          const scaleDelta = ev.scale - lastScale;
          this.controller.zoom(-scaleDelta * this.config.pinchZoomSensitivity);
          lastScale = ev.scale;

          const rotationDelta = (ev.rotation - lastRotation) * (Math.PI / 180) * this.config.twistYawSensitivity;
          this.controller.spin(rotationDelta);
          lastRotation = ev.rotation;
      });
  }

  private attachKeyboard(): void {
      window.addEventListener("keydown", (evt: KeyboardEvent) => {
          this.keysDown[evt.key.toLowerCase()] = true;
      });
      window.addEventListener("keyup", (evt: KeyboardEvent) => {
          this.keysDown[evt.key.toLowerCase()] = false;
      });
  }

  public update(): void {
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
