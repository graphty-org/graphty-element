import {
    Animation,
    Camera,
    CubicEase,
    EasingFunction,
    type IEasingFunction,
    type Scene,
    Vector3,
} from "@babylonjs/core";

import type {CameraWaypoint} from "./VideoCapture.js";

export type EasingType = "linear" | "easeInOut" | "easeIn" | "easeOut";

export interface CameraPathAnimatorOptions {
    fps: number;
    duration: number;
    easing?: EasingType;
}

/**
 * Converts user waypoints to Babylon.js Animation objects.
 * Works for both 2D (zoom, pan) and 3D (position, target) cameras.
 */
export class CameraPathAnimator {
    private camera: Camera;
    private scene: Scene;
    private fps: number;
    private duration: number;
    private easing: EasingType;
    private animations: Animation[] = [];
    private currentAnimatable: ReturnType<Scene["beginAnimation"]> | null = null;

    constructor(camera: Camera, scene: Scene, options: CameraPathAnimatorOptions) {
        this.camera = camera;
        this.scene = scene;
        this.fps = options.fps;
        this.duration = options.duration;
        this.easing = options.easing ?? "linear";
    }

    /**
     * Convert user waypoints to Babylon.js Animation objects.
     * Works for both 2D (zoom, pan) and 3D (position, target) cameras.
     */
    createCameraAnimations(waypoints: CameraWaypoint[]): Animation[] {
        if (waypoints.length < 2) {
            throw new Error("At least 2 waypoints are required for camera path animation");
        }

        this.animations = [];
        const is2D = this.camera.mode === Camera.ORTHOGRAPHIC_CAMERA;

        if (is2D) {
            // 2D: Animate zoom and pan
            // For 2D cameras, extract zoom/pan from waypoints if available
            // Zoom requires animating all four ortho bounds
            this.animations.push(
                ... this.createOrthoZoomAnimations(waypoints),
                this.createPanXAnimation(waypoints),
                this.createPanYAnimation(waypoints),
            );
        } else {
            // 3D: Animate position and target
            this.animations.push(
                this.createVector3Animation("position", waypoints),
                this.createTargetAnimation(waypoints),
            );
        }

        return this.animations;
    }

    /**
     * Create a Vector3 animation for the specified property.
     */
    private createVector3Animation(property: string, waypoints: CameraWaypoint[]): Animation {
        const animation = new Animation(
            `camera_${property}`,
            property,
            this.fps,
            Animation.ANIMATIONTYPE_VECTOR3,
            Animation.ANIMATIONLOOPMODE_CONSTANT,
        );

        const keys = waypoints.map((wp) => ({
            frame: this.timestampToFrame(wp.duration ?? 0, waypoints, wp),
            value: new Vector3(wp.position.x, wp.position.y, wp.position.z),
        }));

        animation.setKeys(keys);
        this.applyEasing(animation, this.easing);

        return animation;
    }

    /**
     * Create target animation (for 3D cameras).
     */
    private createTargetAnimation(waypoints: CameraWaypoint[]): Animation {
        const animation = new Animation(
            "camera_target",
            "target",
            this.fps,
            Animation.ANIMATIONTYPE_VECTOR3,
            Animation.ANIMATIONLOOPMODE_CONSTANT,
        );

        const keys = waypoints.map((wp) => ({
            frame: this.timestampToFrame(wp.duration ?? 0, waypoints, wp),
            value: new Vector3(wp.target.x, wp.target.y, wp.target.z),
        }));

        animation.setKeys(keys);
        this.applyEasing(animation, this.easing);

        return animation;
    }

    /**
     * Create zoom animations for 2D orthographic cameras.
     * Returns animations for orthoLeft, orthoRight, orthoTop, orthoBottom.
     * Uses the z position from waypoints as a proxy for zoom level (ortho size).
     */
    private createOrthoZoomAnimations(waypoints: CameraWaypoint[]): Animation[] {
        // Get the camera's current aspect ratio to maintain proportions
        const currentLeft = (this.camera as {orthoLeft?: number | null}).orthoLeft ?? -10;
        const currentRight = (this.camera as {orthoRight?: number | null}).orthoRight ?? 10;
        const currentTop = (this.camera as {orthoTop?: number | null}).orthoTop ?? 10;
        const currentBottom = (this.camera as {orthoBottom?: number | null}).orthoBottom ?? -10;

        // Calculate aspect ratio from current ortho bounds
        const currentWidth = currentRight - currentLeft;
        const currentHeight = currentTop - currentBottom;
        const aspectRatio = currentWidth / currentHeight;

        // For 2D, we'll use the z position as a proxy for zoom level
        // Higher z = more zoomed out, lower z = more zoomed in
        // The z value represents the "ortho size" - half the height of the view
        const calculateOrthoKeys = (
            waypoints: CameraWaypoint[],
            property: "left" | "right" | "top" | "bottom",
        ): {frame: number, value: number}[] => {
            return waypoints.map((wp) => {
                const orthoSize = wp.position.z || 10; // Use z as ortho half-height
                const halfHeight = orthoSize;
                const halfWidth = halfHeight * aspectRatio;

                let value: number;
                switch (property) {
                    case "left":
                        value = -halfWidth;
                        break;
                    case "right":
                        value = halfWidth;
                        break;
                    case "top":
                        value = halfHeight;
                        break;
                    case "bottom":
                        value = -halfHeight;
                        break;
                    default:
                        value = 0;
                }

                return {
                    frame: this.timestampToFrame(wp.duration ?? 0, waypoints, wp),
                    value,
                };
            });
        };

        const properties = ["orthoLeft", "orthoRight", "orthoTop", "orthoBottom"] as const;
        const propertyMap = {
            orthoLeft: "left",
            orthoRight: "right",
            orthoTop: "top",
            orthoBottom: "bottom",
        } as const;

        return properties.map((prop) => {
            const animation = new Animation(
                `camera_${prop}`,
                prop,
                this.fps,
                Animation.ANIMATIONTYPE_FLOAT,
                Animation.ANIMATIONLOOPMODE_CONSTANT,
            );

            const keys = calculateOrthoKeys(waypoints, propertyMap[prop]);
            animation.setKeys(keys);
            this.applyEasing(animation, this.easing);

            return animation;
        });
    }

    /**
     * Create pan X animation for 2D cameras.
     */
    private createPanXAnimation(waypoints: CameraWaypoint[]): Animation {
        const animation = new Animation(
            "camera_pan_x",
            "position.x",
            this.fps,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CONSTANT,
        );

        const keys = waypoints.map((wp) => ({
            frame: this.timestampToFrame(wp.duration ?? 0, waypoints, wp),
            value: wp.position.x,
        }));

        animation.setKeys(keys);
        this.applyEasing(animation, this.easing);

        return animation;
    }

    /**
     * Create pan Y animation for 2D cameras.
     */
    private createPanYAnimation(waypoints: CameraWaypoint[]): Animation {
        const animation = new Animation(
            "camera_pan_y",
            "position.y",
            this.fps,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CONSTANT,
        );

        const keys = waypoints.map((wp) => ({
            frame: this.timestampToFrame(wp.duration ?? 0, waypoints, wp),
            value: wp.position.y,
        }));

        animation.setKeys(keys);
        this.applyEasing(animation, this.easing);

        return animation;
    }

    /**
     * Calculate cumulative timestamp for a waypoint.
     * Waypoints have duration (time to reach from previous), so we need to sum them.
     */
    private timestampToFrame(timestamp: number, waypoints: CameraWaypoint[], currentWaypoint: CameraWaypoint): number {
        let cumulativeTime = 0;

        for (const wp of waypoints) {
            if (wp === currentWaypoint) {
                break;
            }

            cumulativeTime += wp.duration ?? 0;
        }

        // Add current waypoint's duration if it's not the first one
        const wpIndex = waypoints.indexOf(currentWaypoint);
        if (wpIndex > 0) {
            cumulativeTime += currentWaypoint.duration ?? 0;
        }

        return Math.round((cumulativeTime / 1000) * this.fps);
    }

    /**
     * Apply easing function to animation.
     */
    private applyEasing(animation: Animation, easing: EasingType): void {
        const easingFunction = this.getEasingFunction(easing);
        if (easingFunction) {
            animation.setEasingFunction(easingFunction);
        }
    }

    /**
     * Get Babylon.js easing function for the specified easing type.
     */
    private getEasingFunction(easing: EasingType): IEasingFunction | null {
        switch (easing) {
            case "linear":
                return null; // No easing

            case "easeInOut": {
                const easeInOut = new CubicEase();
                easeInOut.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
                return easeInOut;
            }

            case "easeIn": {
                const easeIn = new CubicEase();
                easeIn.setEasingMode(EasingFunction.EASINGMODE_EASEIN);
                return easeIn;
            }

            case "easeOut": {
                const easeOut = new CubicEase();
                easeOut.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);
                return easeOut;
            }

            default:
                return null;
        }
    }

    /**
     * Convert duration in milliseconds to frame count.
     */
    private durationToFrames(durationMs: number): number {
        return Math.round((durationMs / 1000) * this.fps);
    }

    /**
     * Get total number of frames for the animation.
     */
    getTotalFrames(): number {
        return this.durationToFrames(this.duration);
    }

    /**
     * Realtime mode: Start Babylon.js animation.
     * Animation runs naturally in the render loop.
     * Includes timeout fallback in case animation callback doesn't fire
     * (e.g., in test environments or when scene isn't actively rendering).
     */
    async startRealtimeAnimation(): Promise<void> {
        if (this.animations.length === 0) {
            throw new Error("No animations created. Call createCameraAnimations first.");
        }

        this.camera.animations = this.animations;
        const totalFrames = this.getTotalFrames();

        return new Promise((resolve) => {
            let resolved = false;

            // Set up timeout fallback - resolve after duration even if animation callback doesn't fire
            // This is necessary for test environments where the scene might not be actively rendering
            const timeoutId = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    resolve();
                }
            }, this.duration + 100); // Add small buffer for safety

            this.currentAnimatable = this.scene.beginAnimation(
                this.camera,
                0,
                totalFrames,
                false, // Don't loop
                1.0, // Speed
                () => {
                    // Animation completed via callback
                    if (!resolved) {
                        resolved = true;
                        clearTimeout(timeoutId);
                        resolve();
                    }
                },
            );
        });
    }

    /**
     * Stop the current animation.
     */
    stopAnimation(): void {
        if (this.currentAnimatable) {
            this.currentAnimatable.stop();
            this.currentAnimatable = null;
        }
    }

    /**
     * Manual mode: Get camera state at a specific frame.
     * For guaranteed quality, capture each frame individually.
     */
    getCameraStateAtFrame(frame: number): {
        position?: Vector3;
        target?: Vector3;
        zoom?: number;
        pan?: {x: number, y: number};
    } {
        if (this.animations.length === 0) {
            throw new Error("No animations created. Call createCameraAnimations first.");
        }

        const is2D = this.camera.mode === Camera.ORTHOGRAPHIC_CAMERA;

        if (is2D) {
            // Calculate zoom from ortho bounds (use top and bottom for size calculation)
            const orthoTop = this.evaluateFloatAnimation("orthoTop", frame);
            const orthoBottom = this.evaluateFloatAnimation("orthoBottom", frame);
            const zoom = orthoTop !== undefined && orthoBottom !== undefined ?
                (orthoTop - orthoBottom) / 2 :
                undefined;

            return {
                zoom,
                pan: {
                    x: this.evaluateFloatAnimation("position.x", frame) ?? 0,
                    y: this.evaluateFloatAnimation("position.y", frame) ?? 0,
                },
            };
        }

        return {
            position: this.evaluateVector3Animation("position", frame),
            target: this.evaluateVector3Animation("target", frame),
        };
    }

    /**
     * Evaluate float animation at a specific frame.
     */
    private evaluateFloatAnimation(propertyName: string, frame: number): number | undefined {
        const animation = this.animations.find((a) => a.targetProperty === propertyName);
        if (!animation) {
            return undefined;
        }

        return animation.evaluate(frame) as number;
    }

    /**
     * Evaluate Vector3 animation at a specific frame.
     */
    private evaluateVector3Animation(propertyName: string, frame: number): Vector3 | undefined {
        const animation = this.animations.find((a) => a.targetProperty === propertyName);
        if (!animation) {
            return undefined;
        }

        return animation.evaluate(frame) as Vector3;
    }

    /**
     * Get the animations array for external use.
     */
    getAnimations(): Animation[] {
        return this.animations;
    }

    /**
     * Check if this is a 2D camera.
     */
    is2DCamera(): boolean {
        return this.camera.mode === Camera.ORTHOGRAPHIC_CAMERA;
    }
}
