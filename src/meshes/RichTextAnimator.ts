import {Color3, Mesh, Scene, StandardMaterial, Vector3} from "@babylonjs/core";

export type AnimationType = "none" | "pulse" | "bounce" | "shake" | "glow" | "fill";

export interface AnimationOptions {
    animation: AnimationType;
    animationSpeed: number;
}

export class RichTextAnimator {
    private animationTime = 0;
    private originalPosition: Vector3 | null = null;
    private originalScale: Vector3 | null = null;
    private sceneCallback: (() => void) | null = null;

    constructor(
        private readonly scene: Scene,
        private readonly options: AnimationOptions,
    ) {}

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
            const glow = 0.8 + (Math.sin(this.animationTime * 2) * 0.2);
            material.emissiveColor = new Color3(glow, glow, glow);
        }
    }

    private animateFill(progressCallback?: (value: number) => void): void {
        if (progressCallback) {
            const progressValue = (Math.sin(this.animationTime) + 1) / 2;
            progressCallback(progressValue);
        }
    }

    updateOriginalPosition(position: Vector3): void {
        this.originalPosition = position.clone();
    }

    dispose(): void {
        if (this.sceneCallback) {
            this.scene.unregisterBeforeRender(this.sceneCallback);
            this.sceneCallback = null;
        }
    }
}
