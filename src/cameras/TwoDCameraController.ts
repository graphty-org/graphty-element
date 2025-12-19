import {Camera, Engine, FreeCamera, Scene, TransformNode, Vector3, WebGPUEngine} from "@babylonjs/core";

// === Configuration Object ===
export interface TwoDCameraControlsConfigType {
    panAcceleration: number;
    panDamping: number;
    zoomFactorPerFrame: number;
    zoomDamping: number;
    zoomMin: number;
    zoomMax: number;
    rotateSpeedPerFrame: number;
    rotateDamping: number;
    rotateMin: number | null;
    rotateMax: number | null;
    mousePanScale: number;
    mouseWheelZoomSpeed: number;
    touchPanScale: number;
    touchPinchMin: number;
    touchPinchMax: number;
    initialOrthoSize: number;
    rotationEnabled: boolean;
    inertiaEnabled: boolean;
}

// === Camera Controller Class ===
export class TwoDCameraController {
    public camera: FreeCamera;
    public parent: TransformNode;
    public velocity = {x: 0, y: 0, zoom: 0, rotate: 0};

    constructor(
        public scene: Scene,
        public engine: Engine | WebGPUEngine,
        public canvas: HTMLCanvasElement,
        public config: TwoDCameraControlsConfigType,
    ) {
        this.camera = new FreeCamera("orthoCamera", new Vector3(0, 0, -10), scene);
        this.camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
        this.camera.inertia = 0;
        this.camera.inputs.clear();

        this.parent = new TransformNode("parent", scene);
        this.updateOrtho(config.initialOrthoSize);
        this.camera.setTarget(Vector3.Zero());
    }

    public updateOrtho(size: number): void {
        const aspect = this.engine.getRenderHeight() / this.engine.getRenderWidth();
        this.camera.orthoLeft = -size;
        this.camera.orthoRight = size;
        this.camera.orthoTop = size * aspect;
        this.camera.orthoBottom = -size * aspect;
    }

    /**
     * Update the ortho bounds to match current aspect ratio without changing zoom level.
     * This should be called when the canvas resizes to prevent visual shifts.
     * Keeps the horizontal view (orthoLeft/Right) the same and adjusts vertical bounds.
     */
    public updateOrthoAspectRatio(): void {
        const {orthoRight} = this.camera;
        if (orthoRight === null) {
            return;
        }

        const aspect = this.engine.getRenderHeight() / this.engine.getRenderWidth();
        this.camera.orthoTop = orthoRight * aspect;
        this.camera.orthoBottom = -orthoRight * aspect;
    }

    /**
     * Called when the canvas resizes.
     * Updates the ortho bounds to match the new aspect ratio.
     */
    public onResize(): void {
        this.updateOrthoAspectRatio();
    }

    public pan(dx: number, dy: number): void {
        this.camera.position.x += dx;
        this.camera.position.y += dy;
    }

    public zoom(factor: number): void {
        this.camera.orthoLeft = factor * (this.camera.orthoLeft ?? 1);
        this.camera.orthoRight = factor * (this.camera.orthoRight ?? 1);
        this.camera.orthoTop = factor * (this.camera.orthoTop ?? 1);
        this.camera.orthoBottom = factor * (this.camera.orthoBottom ?? 1);
    }

    public rotate(delta: number): void {
        this.parent.rotation.z += delta;
    }

    public applyInertia(): void {
        const v = this.velocity;
        const c = this.config;

        this.camera.position.x += v.x;
        this.camera.position.y += v.y;

        const zoomScale = Math.exp(v.zoom);
        this.camera.orthoLeft = zoomScale * (this.camera.orthoLeft ?? 1);
        this.camera.orthoRight = zoomScale * (this.camera.orthoRight ?? 1);
        this.camera.orthoTop = zoomScale * (this.camera.orthoTop ?? 1);
        this.camera.orthoBottom = zoomScale * (this.camera.orthoBottom ?? 1);

        this.parent.rotation.z += v.rotate;

        v.x *= c.panDamping;
        v.y *= c.panDamping;
        v.zoom *= c.zoomDamping;
        v.rotate *= c.rotateDamping;
    }

    public zoomToBoundingBox(min: Vector3, max: Vector3): void {
        const centerX = (min.x + max.x) / 2;
        const centerY = (min.y + max.y) / 2;

        const sizeX = max.x - min.x;
        const sizeY = max.y - min.y;

        // Calculate aspect ratios
        const viewportAspect = this.engine.getRenderHeight() / this.engine.getRenderWidth();
        const contentAspect = sizeY / sizeX;

        let orthoSize;
        if (contentAspect > viewportAspect) {
            // Content is taller relative to viewport - constrain by height
            orthoSize = sizeY / (2 * viewportAspect);
        } else {
            // Content is wider relative to viewport - constrain by width
            orthoSize = sizeX / 2;
        }

        this.camera.position.x = centerX;
        this.camera.position.y = centerY;
        this.updateOrtho(orthoSize * 1.1); // Small padding for visual comfort
    }
}
