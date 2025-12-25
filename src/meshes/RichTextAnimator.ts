import {Color3, Mesh, Scene, StandardMaterial, Vector3} from "@babylonjs/core";

export type AnimationType = "none" | "pulse" | "bounce" | "shake" | "glow" | "fill";

export interface AnimationOptions {
    animation: AnimationType;
    animationSpeed: number;
}

/**
 * Handles animations for rich text labels (pulse, bounce, shake, glow, fill)
 */
export class RichTextAnimator {
    private animationTime = 0;
    private originalPosition: Vector3 | null = null;
    private originalScale: Vector3 | null = null;
    private sceneCallback: (() => void) | null = null;
    private lastFillUpdate = 0;

    /**
     * Creates a new rich text animator
     * @param scene - Babylon.js scene
     * @param options - Animation configuration options
     */
    constructor(
        private readonly scene: Scene,
        private readonly options: AnimationOptions,
    ) {}

    /**
     * Sets up animation for a mesh
     * @param mesh - The mesh to animate
     * @param material - The mesh material (for glow animation)
     * @param progressCallback - Optional callback for progress-based animations
     */
    setupAnimation(
        mesh: Mesh,
        material: StandardMaterial | null,
        progressCallback?: (value: number) => void,
    ): void {
        if (this.options.animation === "none") {
            return;
        }

        this.originalPosition = mesh.position.clone();
        this.originalScale = mesh.scaling.clone();

        this.sceneCallback = () => {
            this.animationTime += 0.016 * this.options.animationSpeed;
            this.updateAnimation(mesh, material, progressCallback);
        };

        this.scene.registerBeforeRender(this.sceneCallback);
    }

    private updateAnimation(
        mesh: Mesh,
        material: StandardMaterial | null,
        progressCallback?: (value: number) => void,
    ): void {
        switch (this.options.animation) {
            case "pulse":
                this.animatePulse(mesh);
                break;
            case "bounce":
                this.animateBounce(mesh);
                break;
            case "shake":
                this.animateShake(mesh);
                break;
            case "glow":
                this.animateGlow(material);
                break;
            case "fill":
                this.animateFill(progressCallback);
                break;
            default:
                break;
        }
    }

    private animatePulse(mesh: Mesh): void {
        const scale = 1 + (Math.sin(this.animationTime * 3) * 0.1);
        mesh.scaling.x = scale;
        mesh.scaling.y = scale;
    }

    private animateBounce(mesh: Mesh): void {
        if (this.originalPosition) {
            const bounce = Math.abs(Math.sin(this.animationTime * 2)) * 0.3;
            mesh.position.y = this.originalPosition.y + bounce;
        }
    }

    private animateShake(mesh: Mesh): void {
        if (this.originalPosition) {
            const shakeX = Math.sin(this.animationTime * 20) * 0.02;
            const shakeY = Math.cos(this.animationTime * 25) * 0.02;
            mesh.position.x = this.originalPosition.x + shakeX;
            mesh.position.y = this.originalPosition.y + shakeY;
        }
    }

    private animateGlow(material: StandardMaterial | null): void {
        if (material) {
            // Ensure minimum speed of 1.5 for glow animation
            const effectiveSpeed = Math.max(1.5, this.options.animationSpeed);
            const glowTime = this.animationTime * (effectiveSpeed / this.options.animationSpeed);
            // Animate between 0.3 and 1.0 for more visible effect
            const glow = 0.65 + (Math.sin(glowTime * 2) * 0.35);
            material.emissiveColor = new Color3(glow, glow, glow);
        }
    }

    private animateFill(progressCallback?: (value: number) => void): void {
        if (progressCallback) {
            // Throttle updates to 30 FPS (every ~33ms)
            const currentTime = performance.now();
            if (currentTime - this.lastFillUpdate < 33) {
                return;
            }

            this.lastFillUpdate = currentTime;

            // Use a slower sawtooth wave for better performance
            const progressValue = (this.animationTime % 4) / 4;
            progressCallback(progressValue);
        }
    }

    /**
     * Updates the original position reference for animations
     * @param position - New original position
     */
    updateOriginalPosition(position: Vector3): void {
        this.originalPosition = position.clone();
    }

    /**
     * Disposes the animator and cleans up scene callbacks
     */
    dispose(): void {
        if (this.sceneCallback) {
            this.scene.unregisterBeforeRender(this.sceneCallback);
            this.sceneCallback = null;
        }
    }
}
