import {
    CreateScreenshotAsync,
    type Engine,
    type Mesh,
    type Scene,
    type WebGPUEngine,
} from "@babylonjs/core";

import type {Graph} from "../Graph.js";
import {copyToClipboard} from "./clipboard.js";
import {calculateDimensions} from "./dimensions.js";
import {resolvePreset} from "./presets.js";
import {ScreenshotError, ScreenshotErrorCode} from "./ScreenshotError.js";
import {enableTransparentBackground, restoreBackground} from "./transparency.js";
import type {ClipboardStatus, ScreenshotOptions, ScreenshotResult} from "./types.js";

export class ScreenshotCapture {
    constructor(
        private engine: Engine | WebGPUEngine,
        private scene: Scene,
        private canvas: HTMLCanvasElement,
        private graph: Graph,
    ) {}

    async captureScreenshot(options: ScreenshotOptions = {}): Promise<ScreenshotResult> {
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
            const quality = finalOptions.quality ?? (format === "jpeg" ? 0.92 : 1.0);

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
                // Find skybox mesh in the scene (PhotoDome creates a mesh named "testdome")
                const skyboxMesh = this.scene.getMeshByName("testdome") as Mesh | null;
                backgroundState = enableTransparentBackground(this.scene, skyboxMesh);
            }

            try {
                // Handle destinations
                const destinations = finalOptions.destination ?? {blob: true};
                let clipboardStatus: ClipboardStatus = "success";
                let clipboardError: Error | undefined;

                // Start capturing the blob (this promise will be shared)
                const blobPromise = this.captureBlob(format, quality, dimensions.width, dimensions.height);

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
                    },
                };
            } finally {
                // Restore background state if it was modified
                if (backgroundState) {
                    const skyboxMesh = this.scene.getMeshByName("testdome") as Mesh | null;
                    restoreBackground(this.scene, skyboxMesh, backgroundState);
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

    private async waitForOperations(): Promise<void> {
        // The operation queue automatically handles waiting for previous operations
        // Since we're already inside a queued operation, we don't need to do anything special
        // All previous operations will have completed before this one starts
        return Promise.resolve();
    }

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

            const timeout = setTimeout(() => {
                if (!completed) {
                    completed = true;
                    reject(new ScreenshotError(
                        "Layout did not settle within timeout",
                        ScreenshotErrorCode.LAYOUT_SETTLE_TIMEOUT,
                    ));
                }
            }, 30000); // 30 second timeout

            const handler = (): void => {
                if (!completed && layoutManager.isSettled) {
                    completed = true;
                    clearTimeout(timeout);
                    resolve();
                }
            };

            this.graph.addListener("graph-settled", handler);

            // Check immediately in case it's already settled
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (!completed && layoutManager.isSettled) {
                completed = true;
                clearTimeout(timeout);
                resolve();
            }
        });
    }

    private async waitForRender(): Promise<void> {
        return new Promise((resolve) => {
            this.scene.onAfterRenderObservable.addOnce(() => {
                resolve();
            });
        });
    }

    private async captureBlob(
        format: string,
        quality: number,
        width: number,
        height: number,
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
                width,
                height,
                precision: quality,
            });

            // Convert data URL to blob
            const blob = await this.dataUrlToBlob(dataUrl, mimeType);

            return blob;
        } catch (error) {
            throw new ScreenshotError(
                "Screenshot capture failed",
                ScreenshotErrorCode.SCREENSHOT_CAPTURE_FAILED,
                error,
            );
        }
    }

    private async dataUrlToBlob(dataUrl: string, mimeType: string): Promise<Blob> {
        const response = await fetch(dataUrl);
        const arrayBuffer = await response.arrayBuffer();

        // If we need a different format, convert it
        // For now, CreateScreenshotAsync always returns PNG, so we need to convert
        if (mimeType !== "image/png") {
            return this.convertBlobFormat(new Blob([arrayBuffer], {type: "image/png"}), mimeType);
        }

        return new Blob([arrayBuffer], {type: mimeType});
    }

    private async convertBlobFormat(blob: Blob, targetMimeType: string): Promise<Blob> {
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
                    0.92,
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
}
