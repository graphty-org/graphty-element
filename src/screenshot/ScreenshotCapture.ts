import {
    CreateScreenshotAsync,
    DefaultRenderingPipeline,
    type Engine,
    FxaaPostProcess,
    type Mesh,
    type Scene,
    type WebGPUEngine,
} from "@babylonjs/core";

import type {Graph} from "../Graph.js";
import {copyToClipboard} from "./clipboard.js";
import {SCREENSHOT_CONSTANTS} from "./constants.js";
import {calculateDimensions} from "./dimensions.js";
import {resolvePreset} from "./presets.js";
import {ScreenshotError, ScreenshotErrorCode} from "./ScreenshotError.js";
import {enableTransparentBackground, restoreBackground} from "./transparency.js";
import type {ClipboardStatus, QualityEnhancementOptions, ScreenshotOptions, ScreenshotResult} from "./types.js";

/**
 * Handles screenshot capture for graph visualizations using Babylon.js rendering engine.
 * Supports quality enhancement, transparent backgrounds, format conversion, and multiple output destinations.
 */
export class ScreenshotCapture {
    /**
     * Common mesh names used for skybox/PhotoDome meshes.
     * PhotoDome creates "testdome" by default; other common names are also included.
     */
    private readonly skyboxMeshNames = ["testdome", "skybox", "skyBox", "Skybox"];

    /**
     * Creates a new ScreenshotCapture instance
     * @param engine - The Babylon.js rendering engine
     * @param scene - The Babylon.js scene to capture
     * @param canvas - The HTML canvas element being rendered to
     * @param graph - The graph instance for accessing layout and camera state
     */
    constructor(
        private engine: Engine | WebGPUEngine,
        private scene: Scene,
        private canvas: HTMLCanvasElement,
        private graph: Graph,
    ) {}

    /**
     * Find the skybox mesh in the scene.
     * Searches for common skybox mesh names and patterns.
     * @returns The skybox mesh if found, null otherwise
     */
    private findSkyboxMesh(): Mesh | null {
        // Check common skybox mesh names
        for (const name of this.skyboxMeshNames) {
            const mesh = this.scene.getMeshByName(name) as Mesh | null;
            if (mesh) {
                return mesh;
            }
        }

        // Fallback: look for PhotoDome or common skybox patterns
        const fallbackMesh = this.scene.meshes.find((m) =>
            m.name.toLowerCase().includes("dome") ||
            m.name.toLowerCase().includes("skybox"),
        ) as Mesh | null;

        return fallbackMesh ?? null;
    }

    /**
     * Captures a screenshot of the current scene with the specified options.
     * Handles timing, camera state, quality enhancement, and output destinations.
     * @param options - Screenshot configuration options
     * @returns Screenshot result with blob, metadata, and destination status
     */
    async captureScreenshot(options: ScreenshotOptions = {}): Promise<ScreenshotResult> {
        // Check if we should wait for other operations (default: true)
        const waitForOperations = options.timing?.waitForOperations ?? true;

        if (waitForOperations) {
            // Enqueue the screenshot operation to ensure sequential execution
            // Store the result in a variable and return it after the queue completes
            let result: ScreenshotResult | null = null;

            await this.graph.operationQueue.queueOperationAsync(
                "render-update",
                async() => {
                    result = await this.doScreenshotCapture(options);
                },
                {description: "capture screenshot"},
            );

            // Result will always be set by the queued operation
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return result!;
        }

        // Execute immediately without waiting for other operations
        return this.doScreenshotCapture(options);
    }

    /**
     * Performs the actual screenshot capture logic.
     * Handles timing options, camera overrides, quality enhancement, format conversion,
     * and destinations (blob, download, clipboard). Ensures proper cleanup of temporary
     * state (camera position, quality enhancement, transparent background) even on failure.
     * @param options - Screenshot configuration options
     * @returns Promise resolving to the ScreenshotResult
     * @internal
     */
    private async doScreenshotCapture(options: ScreenshotOptions): Promise<ScreenshotResult> {
        const startTime = Date.now();

        // Check engine configuration
        const gl = (this.engine as Engine)._gl;

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (gl && !gl.getContextAttributes()?.preserveDrawingBuffer) {
            throw new ScreenshotError(
                "Screenshot requires Engine to be created with preserveDrawingBuffer: true",
                ScreenshotErrorCode.ENGINE_NOT_CONFIGURED,
            );
        }

        // Get timing options with defaults
        const timing = {
            waitForSettle: true,
            waitForOperations: true,
            ... options.timing,
        };

        // 1. Wait for pending operations if requested
        if (timing.waitForOperations) {
            await this.waitForOperations();
        }

        // 2. Wait for layout to settle if requested
        if (timing.waitForSettle) {
            await this.waitForLayoutSettle();
        }

        // 3. Handle camera override
        let originalCameraState;
        let zoomToFitWasEnabled = false;
        if (options.camera) {
            originalCameraState = this.graph.getCameraState();

            // Temporarily disable zoom-to-fit to prevent camera from being reset
            const updateManager = this.graph.getUpdateManager();
            zoomToFitWasEnabled = updateManager.isZoomToFitEnabled();
            if (zoomToFitWasEnabled) {
                updateManager.disableZoomToFit();
            }

            // Resolve preset or use provided state
            const cameraState = "preset" in options.camera ?
                this.graph.resolveCameraPreset(options.camera.preset) :
                options.camera;

            await this.graph.setCameraState(cameraState);
            await this.waitForRender();
        }

        try {
            // Resolve preset if specified
            let finalOptions = options;
            if (options.preset) {
                finalOptions = resolvePreset(options.preset, options);
            }

            // Calculate dimensions
            const dimensions = calculateDimensions(this.canvas, finalOptions);

            // Determine format and quality
            const format = finalOptions.format ?? "png";
            const quality = finalOptions.quality ?? (format === "jpeg" ?
                SCREENSHOT_CONSTANTS.DEFAULT_JPEG_QUALITY :
                SCREENSHOT_CONSTANTS.DEFAULT_PNG_QUALITY);

            // Validate format-specific options
            if (finalOptions.transparentBackground && format !== "png" && format !== "webp") {
                throw new ScreenshotError(
                    "Transparent background requires PNG or WebP format",
                    ScreenshotErrorCode.TRANSPARENT_REQUIRES_PNG,
                );
            }

            // Handle transparent background
            let backgroundState;
            if (finalOptions.transparentBackground) {
                const skyboxMesh = this.findSkyboxMesh();
                backgroundState = enableTransparentBackground(this.scene, skyboxMesh);
            }

            // Handle quality enhancement (supersampling + optional MSAA/FXAA)
            let enhancementState: EnhancementState | null = null;
            let enhancementStartTime: number | undefined;
            if (finalOptions.enhanceQuality) {
                enhancementStartTime = Date.now();
                this.graph.eventManager.emitGraphEvent("screenshot-enhancing", {});

                // Normalize enhanceQuality to options object
                const enhancementOptions: QualityEnhancementOptions =
                    typeof finalOptions.enhanceQuality === "boolean" ?
                        {} : // Use defaults
                        finalOptions.enhanceQuality;

                enhancementState = this.enableQualityEnhancement(enhancementOptions, dimensions);
                // Wait for renders with the enhancement applied
                await this.waitForRender();
                await this.waitForRender(); // Extra frame for pipeline to stabilize
            }

            try {
                // Handle destinations
                const destinations = finalOptions.destination ?? {blob: true};
                let clipboardStatus: ClipboardStatus = "success";
                let clipboardError: Error | undefined;

                // Determine capture dimensions (may be supersampled)
                const captureWidth = enhancementState?.supersampledWidth ?? dimensions.width;
                const captureHeight = enhancementState?.supersampledHeight ?? dimensions.height;

                // Start capturing the blob (this promise will be shared)
                const blobPromise = this.captureBlob(
                    format,
                    quality,
                    captureWidth,
                    captureHeight,
                    enhancementState?.supersampleFactor,
                    dimensions.width,
                    dimensions.height,
                );

                // If clipboard is requested, start clipboard write immediately (before blob is ready)
                // This preserves the user gesture context
                let clipboardPromise: Promise<{status: ClipboardStatus, error?: Error}> | undefined;
                if (destinations.clipboard) {
                    clipboardPromise = copyToClipboard(blobPromise);
                }

                // Wait for the blob to be ready
                const blob = await blobPromise;

                // Handle download
                let downloaded = false;
                if (destinations.download) {
                    try {
                        this.downloadBlob(
                            blob,
                            finalOptions.downloadFilename ?? `graph-${Date.now()}.${format}`,
                        );
                        downloaded = true;
                    } catch {
                        // Download failed, but we continue
                        downloaded = false;
                    }
                }

                // Wait for clipboard operation to complete
                if (clipboardPromise) {
                    const result = await clipboardPromise;
                    clipboardStatus = result.status;
                    clipboardError = result.error;
                }

                const captureTime = Date.now() - startTime;
                const enhancementTime = enhancementStartTime ? Date.now() - enhancementStartTime : undefined;

                // Emit screenshot-ready event with enhancement info
                if (finalOptions.enhanceQuality) {
                    this.graph.eventManager.emitGraphEvent("screenshot-ready", {enhancementTime});
                }

                return {
                    blob,
                    downloaded,
                    clipboardStatus,
                    clipboardError,
                    metadata: {
                        width: dimensions.width,
                        height: dimensions.height,
                        format,
                        byteSize: blob.size,
                        captureTime,
                        enhancementTime,
                    },
                };
            } finally {
                // Restore background state if it was modified
                if (backgroundState) {
                    const skyboxMesh = this.findSkyboxMesh();
                    restoreBackground(this.scene, skyboxMesh, backgroundState);
                }

                // Remove quality enhancement if it was added
                if (enhancementState) {
                    this.disableQualityEnhancement(enhancementState);
                }
            }
        } finally {
            // Restore camera if it was overridden
            if (originalCameraState) {
                await this.graph.setCameraState(originalCameraState);

                // Restore zoom-to-fit state
                if (zoomToFitWasEnabled) {
                    this.graph.getUpdateManager().enableZoomToFit();
                }
            }
        }
    }

    /**
     * Waits for any pending operations in the operation queue to complete.
     * Since the screenshot operation is queued, this is handled automatically
     * by the queue - all previous operations complete before this one starts.
     * @returns Promise that resolves when all operations are complete
     * @internal
     */
    private async waitForOperations(): Promise<void> {
        // The operation queue automatically handles waiting for previous operations
        // Since we're already inside a queued operation, we don't need to do anything special
        // All previous operations will have completed before this one starts
        return Promise.resolve();
    }

    /**
     * Waits for the layout engine to settle before capturing a screenshot.
     * If no layout engine is active or it's already settled, returns immediately.
     * Throws ScreenshotError with LAYOUT_SETTLE_TIMEOUT if the layout doesn't settle
     * within the configured timeout (SCREENSHOT_CONSTANTS.LAYOUT_SETTLE_TIMEOUT_MS).
     * @returns Promise that resolves when layout has settled
     * @internal
     */
    private async waitForLayoutSettle(): Promise<void> {
        const layoutManager = this.graph.getLayoutManager();

        if (!layoutManager.layoutEngine) {
            return Promise.resolve();
        }

        if (layoutManager.isSettled) {
            return Promise.resolve();
        }

        // Wait for layout to settle (with timeout)
        return new Promise((resolve, reject) => {
            let completed = false;
            let listenerId: symbol | null = null;

            const cleanup = (): void => {
                clearTimeout(timeout);
                if (listenerId) {
                    this.graph.eventManager.removeListener(listenerId);
                    listenerId = null;
                }
            };

            const timeout = setTimeout(() => {
                if (!completed) {
                    completed = true;
                    cleanup();
                    reject(new ScreenshotError(
                        "Layout did not settle within timeout",
                        ScreenshotErrorCode.LAYOUT_SETTLE_TIMEOUT,
                    ));
                }
            }, SCREENSHOT_CONSTANTS.LAYOUT_SETTLE_TIMEOUT_MS);

            const handler = (): void => {
                if (!completed && layoutManager.isSettled) {
                    completed = true;
                    cleanup();
                    resolve();
                }
            };

            listenerId = this.graph.eventManager.addListener("graph-settled", handler);

            // Check immediately in case it's already settled
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (!completed && layoutManager.isSettled) {
                completed = true;
                cleanup();
                resolve();
            }
        });
    }

    /**
     * Waits for a single render frame to complete.
     * Used to ensure the scene state is fully rendered before capture.
     * @internal
     */
    private async waitForRender(): Promise<void> {
        return new Promise((resolve) => {
            this.scene.onAfterRenderObservable.addOnce(() => {
                resolve();
            });
        });
    }

    /**
     * Captures the current scene as a Blob image.
     * Handles supersampling if enabled, capturing at higher resolution and downscaling.
     * @param format - Image format ('png', 'jpeg', or 'webp')
     * @param quality - Image quality (0.0 to 1.0)
     * @param captureWidth - Width to capture (may be supersampled)
     * @param captureHeight - Height to capture (may be supersampled)
     * @param supersampleFactor - Optional supersampling factor for downscaling
     * @param targetWidth - Final output width (if downscaling)
     * @param targetHeight - Final output height (if downscaling)
     * @returns Promise resolving to the captured image Blob
     * @internal
     */
    private async captureBlob(
        format: string,
        quality: number,
        captureWidth: number,
        captureHeight: number,
        supersampleFactor?: number,
        targetWidth?: number,
        targetHeight?: number,
    ): Promise<Blob> {
        try {
            // Map our format names to MIME types
            let mimeType: string;
            if (format === "png") {
                mimeType = "image/png";
            } else if (format === "jpeg") {
                mimeType = "image/jpeg";
            } else {
                mimeType = "image/webp";
            }

            // Use Babylon.js CreateScreenshotAsync
            if (!this.scene.activeCamera) {
                throw new ScreenshotError(
                    "No active camera in scene",
                    ScreenshotErrorCode.SCREENSHOT_CAPTURE_FAILED,
                );
            }

            const dataUrl = await CreateScreenshotAsync(this.engine, this.scene.activeCamera, {
                width: captureWidth,
                height: captureHeight,
                precision: quality,
            });

            // Convert data URL to blob
            let blob = await this.dataUrlToBlob(dataUrl, mimeType, quality);

            // If supersampling was used, downscale to target size
            if (supersampleFactor && supersampleFactor > 1 && targetWidth && targetHeight) {
                blob = await this.downscaleBlob(blob, targetWidth, targetHeight, mimeType, quality);
            }

            return blob;
        } catch (error) {
            throw new ScreenshotError(
                "Screenshot capture failed",
                ScreenshotErrorCode.SCREENSHOT_CAPTURE_FAILED,
                error,
            );
        }
    }

    /**
     * Converts a data URL to a Blob, optionally converting the image format.
     * Since Babylon.js CreateScreenshotAsync always returns PNG, this method
     * handles conversion to JPEG or WebP formats as needed.
     * @param dataUrl - The data URL from CreateScreenshotAsync
     * @param mimeType - Target MIME type for the output
     * @param quality - Image quality for lossy formats (0.0 to 1.0)
     * @returns Promise resolving to the image Blob
     * @internal
     */
    private async dataUrlToBlob(dataUrl: string, mimeType: string, quality: number): Promise<Blob> {
        const response = await fetch(dataUrl);
        const arrayBuffer = await response.arrayBuffer();

        // If we need a different format, convert it
        // For now, CreateScreenshotAsync always returns PNG, so we need to convert
        if (mimeType !== "image/png") {
            return this.convertBlobFormat(new Blob([arrayBuffer], {type: "image/png"}), mimeType, quality);
        }

        return new Blob([arrayBuffer], {type: mimeType});
    }

    /**
     * Converts a Blob from one image format to another using canvas rendering.
     * Loads the blob into an Image, draws it to a canvas, and exports in the target format.
     * @param blob - Source image Blob
     * @param targetMimeType - Target MIME type (e.g., 'image/jpeg')
     * @param quality - Image quality for lossy formats (0.0 to 1.0)
     * @returns Promise resolving to the converted Blob
     * @internal
     */
    private async convertBlobFormat(blob: Blob, targetMimeType: string, quality: number): Promise<Blob> {
        // Create an image element to load the blob
        const img = new Image();
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
            throw new ScreenshotError(
                "Failed to get 2D context for format conversion",
                ScreenshotErrorCode.CANVAS_ALLOCATION_FAILED,
            );
        }

        const imgUrl = URL.createObjectURL(blob);

        return new Promise((resolve, reject) => {
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                URL.revokeObjectURL(imgUrl);

                canvas.toBlob(
                    (convertedBlob) => {
                        if (convertedBlob) {
                            resolve(convertedBlob);
                        } else {
                            reject(
                                new ScreenshotError(
                                    "Failed to convert image format",
                                    ScreenshotErrorCode.SCREENSHOT_CAPTURE_FAILED,
                                ),
                            );
                        }
                    },
                    targetMimeType,
                    quality,
                );
            };

            img.onerror = () => {
                URL.revokeObjectURL(imgUrl);
                reject(
                    new ScreenshotError(
                        "Failed to load image for format conversion",
                        ScreenshotErrorCode.SCREENSHOT_CAPTURE_FAILED,
                    ),
                );
            };

            img.src = imgUrl;
        });
    }

    /**
     * Downloads a Blob as a file using a temporary anchor element.
     * Creates an object URL, triggers a click on a download link, then cleans up.
     * @param blob - The Blob to download
     * @param filename - The filename for the downloaded file
     * @internal
     */
    private downloadBlob(blob: Blob, filename: string): void {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Downscales an image Blob to target dimensions using high-quality bilinear filtering.
     * Used when supersampling is enabled to create the final output at the requested resolution.
     * @param blob - Source image Blob (at supersampled resolution)
     * @param targetWidth - Final output width
     * @param targetHeight - Final output height
     * @param mimeType - Output MIME type
     * @param quality - Image quality for lossy formats (0.0 to 1.0)
     * @returns Promise resolving to the downscaled Blob
     * @internal
     */
    private async downscaleBlob(
        blob: Blob,
        targetWidth: number,
        targetHeight: number,
        mimeType: string,
        quality: number,
    ): Promise<Blob> {
        const img = new Image();
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
            throw new ScreenshotError(
                "Failed to get 2D context for downscaling",
                ScreenshotErrorCode.CANVAS_ALLOCATION_FAILED,
            );
        }

        const imgUrl = URL.createObjectURL(blob);

        return new Promise((resolve, reject) => {
            img.onload = () => {
                canvas.width = targetWidth;
                canvas.height = targetHeight;

                // Enable high-quality image scaling
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = "high";

                // Draw the supersampled image scaled down
                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
                URL.revokeObjectURL(imgUrl);

                canvas.toBlob(
                    (downscaledBlob) => {
                        if (downscaledBlob) {
                            resolve(downscaledBlob);
                        } else {
                            reject(
                                new ScreenshotError(
                                    "Failed to downscale image",
                                    ScreenshotErrorCode.SCREENSHOT_CAPTURE_FAILED,
                                ),
                            );
                        }
                    },
                    mimeType,
                    quality,
                );
            };

            img.onerror = () => {
                URL.revokeObjectURL(imgUrl);
                reject(
                    new ScreenshotError(
                        "Failed to load image for downscaling",
                        ScreenshotErrorCode.SCREENSHOT_CAPTURE_FAILED,
                    ),
                );
            };

            img.src = imgUrl;
        });
    }

    /**
     * Enable quality enhancement using supersampling and optional MSAA/FXAA.
     * Returns the enhancement state so it can be removed after capture.
     * @param options - Quality enhancement configuration
     * @param dimensions - Target output dimensions
     * @param dimensions.width - Target width in pixels
     * @param dimensions.height - Target height in pixels
     * @returns Enhancement state object for cleanup
     */
    private enableQualityEnhancement(
        options: QualityEnhancementOptions,
        dimensions: {width: number, height: number},
    ): EnhancementState {
        const camera = this.scene.activeCamera;
        if (!camera) {
            throw new ScreenshotError(
                "No active camera for quality enhancement",
                ScreenshotErrorCode.SCREENSHOT_CAPTURE_FAILED,
            );
        }

        // Default values
        const supersampleFactor = options.supersampleFactor ?? 2;
        const msaaSamples = options.msaaSamples ?? 4;
        const useFxaa = options.fxaa ?? false;

        const state: EnhancementState = {
            supersampleFactor,
            supersampledWidth: dimensions.width * supersampleFactor,
            supersampledHeight: dimensions.height * supersampleFactor,
        };

        // Create DefaultRenderingPipeline for MSAA support
        if (msaaSamples > 1) {
            const pipeline = new DefaultRenderingPipeline(
                "screenshotPipeline",
                false, // hdr - not needed for screenshots
                this.scene,
                [camera],
            );
            pipeline.samples = msaaSamples;
            pipeline.fxaaEnabled = useFxaa;
            state.pipeline = pipeline;
        } else if (useFxaa) {
            // FXAA only, no pipeline needed
            const fxaa = new FxaaPostProcess(
                "screenshotFxaa",
                1.0,
                camera,
            );
            state.fxaaPostProcess = fxaa;
        }

        return state;
    }

    /**
     * Remove quality enhancement after capture and clean up resources
     * @param state - Enhancement state to dispose
     */
    private disableQualityEnhancement(state: EnhancementState): void {
        if (state.pipeline) {
            state.pipeline.dispose();
        }

        if (state.fxaaPostProcess) {
            state.fxaaPostProcess.dispose();
        }
    }
}

/**
 * State for quality enhancement that needs to be cleaned up after capture
 */
interface EnhancementState {
    supersampleFactor: number;
    supersampledWidth: number;
    supersampledHeight: number;
    pipeline?: DefaultRenderingPipeline;
    fxaaPostProcess?: FxaaPostProcess;
}
