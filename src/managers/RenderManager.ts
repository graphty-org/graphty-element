import {
    Color4,
    Engine,
    HemisphericLight,
    Logger,
    Scene,
    Vector3,
    WebGPUEngine,
} from "@babylonjs/core";

import {CameraManager} from "../cameras/CameraManager";
import type {EventManager} from "./EventManager";
import type {Manager} from "./interfaces";

/**
 * Configuration options for RenderManager
 */
export interface RenderManagerConfig {
    useWebGPU?: boolean;
    backgroundColor?: string;
}

/**
 * Manages Babylon.js scene, engine, and render loop
 */
export class RenderManager implements Manager {
    engine: Engine | WebGPUEngine;
    scene: Scene;
    camera: CameraManager;

    private renderLoopActive = false;
    private updateCallback?: () => void;
    private resizeHandler: () => void;

    constructor(
        private canvas: HTMLCanvasElement,
        private eventManager: EventManager,
        private config: RenderManagerConfig = {},
    ) {
        // Set Babylon.js log level
        Logger.LogLevels = Logger.ErrorLogLevel;

        // Create engine
        if (this.config.useWebGPU) {
            this.engine = new WebGPUEngine(this.canvas);
        } else {
            this.engine = new Engine(this.canvas, true);
        }

        // Create scene
        this.scene = new Scene(this.engine);

        // Setup resize handler
        this.resizeHandler = (): void => {
            this.engine.resize();
        };

        // Initialize camera manager
        this.camera = new CameraManager(this.scene);

        // Setup lighting
        new HemisphericLight("light", new Vector3(1, 1, 0));

        // Set background color
        const backgroundColor = this.config.backgroundColor || "#F5F5F5"; // whitesmoke
        this.scene.clearColor = Color4.FromHexString(backgroundColor);
    }

    async init(): Promise<void> {
        try {
            // Initialize WebGPU engine if used
            if (this.engine instanceof WebGPUEngine) {
                await this.engine.initAsync();
            }

            // Wait for scene to be ready
            await this.scene.whenReadyAsync();

            // Start listening for resize events
            window.addEventListener("resize", this.resizeHandler);

            // Emit success event
            this.eventManager.emitGraphEvent("render-initialized", {
                engine: this.engine,
                scene: this.scene,
            });
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            this.eventManager.emitGraphError(
                null,
                err,
                "init",
                {component: "RenderManager"},
            );
            throw new Error(`Failed to initialize RenderManager: ${err.message}`);
        }
    }

    dispose(): void {
        // Stop render loop
        this.stopRenderLoop();

        // Remove resize listener
        window.removeEventListener("resize", this.resizeHandler);

        // Dispose camera system
        this.camera.dispose();

        // Dispose scene and engine
        this.scene.dispose();
        this.engine.dispose();
    }

    /**
     * Start the render loop with the provided update callback
     */
    startRenderLoop(updateCallback: () => void): void {
        if (this.renderLoopActive) {
            return;
        }

        this.updateCallback = updateCallback;
        this.renderLoopActive = true;

        this.engine.runRenderLoop(() => {
            try {
                // Call update callback
                if (this.updateCallback) {
                    this.updateCallback();
                }

                // Update camera
                this.camera.update();

                // Render scene
                this.scene.render();
            } catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                this.eventManager.emitGraphError(
                    null,
                    err,
                    "other",
                    {component: "RenderManager", phase: "render-loop"},
                );

                // Don't stop render loop on error, but log it
                console.error("Error in render loop:", error);
            }
        });
    }

    /**
     * Stop the render loop
     */
    stopRenderLoop(): void {
        if (!this.renderLoopActive) {
            return;
        }

        this.renderLoopActive = false;
        this.engine.stopRenderLoop();
        this.updateCallback = undefined;
    }

    /**
     * Update the background color
     */
    setBackgroundColor(color: string): void {
        try {
            this.scene.clearColor = Color4.FromHexString(color);
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            this.eventManager.emitGraphError(
                null,
                err,
                "other",
                {component: "RenderManager", operation: "setBackgroundColor", color},
            );
        }
    }

    /**
     * Get current render statistics
     */
    getRenderStats(): {
        fps: number;
        activeMeshes: number;
    } {
        return {
            fps: this.engine.getFps(),
            activeMeshes: this.scene.getActiveMeshes().length,
        };
    }
}
