// TwoDInputController.ts
import {type Observer, PointerEventTypes, type PointerInfo, type PointerInfoPre} from "@babylonjs/core";
import Hammer from "hammerjs";

import {TwoDCameraController, TwoDCameraControlsConfigType} from "./TwoDCameraController";

interface GestureSession {
    panX: number;
    panY: number;
    panStartX: number;
    panStartY: number;
    ortho: {
        left: number;
        right: number;
        top: number;
        bottom: number;
    };
    scale: number;
    rotation: number;
    startRotDeg: number;
}

export class InputController {
    private keyState: Record<string, boolean> = {};
    private gestureSession: GestureSession | null = null;
    private hammer: HammerManager | null = null;
    private enabled = false;

    // Store observable subscriptions for cleanup
    private pointerObserverHandle: Observer<PointerInfo> | null = null;
    private prePointerObserverHandle: Observer<PointerInfoPre> | null = null;

    private pointerDownHandler = (): void => {
        this.cam.canvas.focus();
    };

    private keyDownHandler = (e: KeyboardEvent): void => {
        this.keyState[e.key] = true;
    };

    private keyUpHandler = (e: KeyboardEvent): void => {
        this.keyState[e.key] = false;
    };

    constructor(
        private cam: TwoDCameraController,
        private canvas: HTMLCanvasElement,
        private config: TwoDCameraControlsConfigType,
    ) {
        this.canvas.setAttribute("tabindex", "0"); // Make focusable
        this.setupMouse();
        this.setupTouch();
    }

    private setupMouse(): void {
        let isPanning = false;
        let lastX = 0;
        let lastY = 0;

        this.pointerObserverHandle = this.cam.scene.onPointerObservable.add((pi) => {
            const e = pi.event as PointerEvent;

            switch (pi.type) {
                case PointerEventTypes.POINTERDOWN:
                    isPanning = true;
                    lastX = e.clientX;
                    lastY = e.clientY;
                    this.pointerDownHandler();
                    break;

                case PointerEventTypes.POINTERUP:
                    isPanning = false;
                    break;

                case PointerEventTypes.POINTERMOVE:
                    if (isPanning && e.buttons === 1) {
                        const orthoRight = this.cam.camera.orthoRight ?? 1;
                        const orthoLeft = this.cam.camera.orthoLeft ?? 1;
                        const orthoTop = this.cam.camera.orthoTop ?? 1;
                        const orthoBottom = this.cam.camera.orthoBottom ?? 1;
                        const scaleX = (orthoRight - orthoLeft) / this.cam.engine.getRenderWidth();
                        const scaleY = (orthoTop - orthoBottom) / this.cam.engine.getRenderHeight();

                        const dx = e.clientX - lastX;
                        const dy = e.clientY - lastY;

                        this.cam.pan(-dx * scaleX * this.config.mousePanScale, dy * scaleY * this.config.mousePanScale);

                        lastX = e.clientX;
                        lastY = e.clientY;
                    }

                    break;

                default:
                    break;
            }
        });

        this.prePointerObserverHandle = this.cam.scene.onPrePointerObservable.add((pi) => {
            const e = pi.event as WheelEvent;
            if (pi.type === PointerEventTypes.POINTERWHEEL) {
                const delta = e.deltaY > 0 ? this.config.mouseWheelZoomSpeed : 1 / this.config.mouseWheelZoomSpeed;
                this.cam.zoom(delta);
                e.preventDefault();
            }
        }, PointerEventTypes.POINTERWHEEL);
    }

    private setupTouch(): void {
        this.hammer = new Hammer.Manager(this.canvas);
        const pan = new Hammer.Pan({threshold: 0, pointers: 0});
        const pinch = new Hammer.Pinch();
        const rotate = new Hammer.Rotate();

        this.hammer.add([pan, pinch, rotate]);
        this.hammer.get("pinch").recognizeWith(this.hammer.get("rotate"));
        this.hammer.get("pan").requireFailure(this.hammer.get("pinch"));

        this.hammer.on("panstart pinchstart rotatestart", (ev) => {
            this.gestureSession = {
                panX: ev.center.x,
                panY: ev.center.y,
                panStartX: this.cam.camera.position.x,
                panStartY: this.cam.camera.position.y,
                ortho: {
                    left: this.cam.camera.orthoLeft ?? 1,
                    right: this.cam.camera.orthoRight ?? 1,
                    top: this.cam.camera.orthoTop ?? 1,
                    bottom: this.cam.camera.orthoBottom ?? 1,
                },
                scale: ev.scale || 1,
                rotation: this.cam.parent.rotation.z,
                startRotDeg: ev.rotation || 0,
            };
        });

        this.hammer.on("panmove pinchmove rotatemove", (ev) => {
            if (!this.gestureSession) {
                return;
            }

            const orthoRight = this.cam.camera.orthoRight ?? 1;
            const orthoLeft = this.cam.camera.orthoLeft ?? 1;
            const orthoTop = this.cam.camera.orthoTop ?? 1;
            const orthoBottom = this.cam.camera.orthoBottom ?? 1;
            const scaleX = (orthoRight - orthoLeft) / this.cam.engine.getRenderWidth();
            const scaleY = (orthoTop - orthoBottom) / this.cam.engine.getRenderHeight();

            const dx = ev.center.x - this.gestureSession.panX;
            const dy = ev.center.y - this.gestureSession.panY;

            this.cam.camera.position.x = this.gestureSession.panStartX - (dx * scaleX * this.config.touchPanScale);
            this.cam.camera.position.y = this.gestureSession.panStartY + (dy * scaleY * this.config.touchPanScale);

            const pinch = (ev.scale || 1) / this.gestureSession.scale;
            this.cam.camera.orthoLeft = this.gestureSession.ortho.left / pinch;
            this.cam.camera.orthoRight = this.gestureSession.ortho.right / pinch;
            this.cam.camera.orthoTop = this.gestureSession.ortho.top / pinch;
            this.cam.camera.orthoBottom = this.gestureSession.ortho.bottom / pinch;

            const rotRad = (-(ev.rotation - this.gestureSession.startRotDeg) * Math.PI) / 180;
            this.cam.parent.rotation.z = this.gestureSession.rotation + rotRad;
        });

        this.hammer.on("panend pinchend rotateend", () => {
            this.gestureSession = null;
        });
    }

    public enable(): void {
        if (this.enabled) {
            return;
        }

        this.enabled = true;

        this.canvas.addEventListener("keydown", this.keyDownHandler);
        this.canvas.addEventListener("keyup", this.keyUpHandler);
    }

    public disable(): void {
        if (!this.enabled) {
            return;
        }

        this.enabled = false;

        this.canvas.removeEventListener("keydown", this.keyDownHandler);
        this.canvas.removeEventListener("keyup", this.keyUpHandler);

        // Remove scene observable subscriptions
        if (this.pointerObserverHandle !== null) {
            this.cam.scene.onPointerObservable.remove(this.pointerObserverHandle);
            this.pointerObserverHandle = null;
        }

        if (this.prePointerObserverHandle !== null) {
            this.cam.scene.onPrePointerObservable.remove(this.prePointerObserverHandle);
            this.prePointerObserverHandle = null;
        }

        // Destroy Hammer.js instance
        if (this.hammer) {
            this.hammer.destroy();
            this.hammer = null;
        }

        // Clear gesture session
        this.gestureSession = null;
    }

    public applyKeyboardInertia(): void {
        if (!this.enabled) {
            return;
        }

        const v = this.cam.velocity;
        const c = this.config;

        if (this.keyState.w || this.keyState.ArrowUp) {
            v.y += c.panAcceleration;
        }

        if (this.keyState.s || this.keyState.ArrowDown) {
            v.y -= c.panAcceleration;
        }

        if (this.keyState.a || this.keyState.ArrowLeft) {
            v.x -= c.panAcceleration;
        }

        if (this.keyState.d || this.keyState.ArrowRight) {
            v.x += c.panAcceleration;
        }

        if (this.keyState["+"] || this.keyState["="]) {
            v.zoom -= c.zoomFactorPerFrame;
        }

        if (this.keyState["-"] || this.keyState._) {
            v.zoom += c.zoomFactorPerFrame;
        }

        if (this.keyState.q) {
            v.rotate += c.rotateSpeedPerFrame;
        }

        if (this.keyState.e) {
            v.rotate -= c.rotateSpeedPerFrame;
        }
    }

    public update(): void {
        this.applyKeyboardInertia();
        this.cam.applyInertia();
    }
}
