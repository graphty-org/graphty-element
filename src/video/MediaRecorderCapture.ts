import {VIDEO_CONSTANTS} from "../screenshot/constants.js";
import {ScreenshotError, ScreenshotErrorCode} from "../screenshot/ScreenshotError.js";
import type {AnimationOptions, AnimationResult} from "./VideoCapture.js";

/**
 * Error thrown when animation capture is cancelled
 */
export class AnimationCancelledError extends Error {
    constructor() {
        super("Animation capture cancelled");
        this.name = "AnimationCancelledError";
    }
}

/**
 * Configuration options for MediaRecorderCapture
 */
export interface MediaRecorderCaptureConfig {
    /**
     * Enable debug logging for codec detection and capture process.
     * @default false
     */
    debug?: boolean;
}

/**
 * MediaRecorder wrapper with codec detection, Safari support, and cancellation handling.
 *
 * This class handles the complexities of video capture using the browser's MediaRecorder API:
 * - Automatic codec detection (VP9 > VP8 > MP4/H.264)
 * - Safari/iOS compatibility with MP4 fallback
 * - Cancellation with proper race condition handling
 *
 * ## Cancellation Race Condition Handling
 *
 * The cancellation flow is designed to handle race conditions between:
 * - The `cancel()` method being called
 * - The `onstop` event firing from `MediaRecorder.stop()`
 * - The duration timeout completing
 *
 * The flow ensures:
 * 1. `isCancelled` flag is set BEFORE calling `recorder.stop()`
 * 2. The `onstop` handler checks `isCancelled` before resolving
 * 3. The reject callback is called synchronously after stopping
 * 4. References are cleared after rejection to prevent double-handling
 *
 * This guarantees that a cancelled capture will always reject with
 * AnimationCancelledError, never accidentally resolve with partial data.
 */
export class MediaRecorderCapture {
    /** The active MediaRecorder instance, null when not recording */
    private activeRecorder: MediaRecorder | null = null;
    /** Flag to track cancellation state - set BEFORE stopping recorder */
    private isCancelled = false;
    /** Stored reject callback for cancellation - cleared after use */
    private cancelReject: ((error: Error) => void) | null = null;
    /** Debug logging enabled */
    private debug: boolean;

    constructor(config: MediaRecorderCaptureConfig = {}) {
        this.debug = config.debug ?? false;
    }

    /**
     * Log a debug message if debug mode is enabled
     */
    private log(message: string): void {
        if (this.debug) {
            // eslint-disable-next-line no-console
            console.log(message);
        }
    }
    /**
     * Detects browser and returns best supported codec
     *
     * Browser Support:
     * - Chrome/Edge/Firefox: WebM (VP9 preferred, VP8 fallback)
     * - Safari/iOS: MP4 (H.264)
     *
     * Format priority:
     * 1. WebM VP9 (best quality, smallest size)
     * 2. WebM VP8 (good quality, good compatibility)
     * 3. MP4 H.264 (Safari, universal fallback)
     */
    private getSupportedCodec(requestedFormat?: "webm" | "mp4" | "auto"): string {
        // Debug: Log codec support detection
        this.log("[MediaRecorder] Codec Detection:");
        this.log(`  - Requested format: ${requestedFormat ?? "auto"}`);
        this.log(`  - VP9 support: ${MediaRecorder.isTypeSupported("video/webm;codecs=vp9")}`);
        this.log(`  - VP8 support: ${MediaRecorder.isTypeSupported("video/webm;codecs=vp8")}`);
        this.log(`  - MP4 support: ${MediaRecorder.isTypeSupported("video/mp4")}`);
        this.log(`  - WebM (no codec) support: ${MediaRecorder.isTypeSupported("video/webm")}`);

        // If user explicitly requested a format, try that first
        if (requestedFormat === "mp4") {
            if (MediaRecorder.isTypeSupported("video/mp4")) {
                this.log("  → Selected: video/mp4 (user requested)");
                return "video/mp4";
            }

            throw new ScreenshotError("MP4 not supported in this browser", ScreenshotErrorCode.UNSUPPORTED_FORMAT);
        }

        if (requestedFormat === "webm") {
            if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
                this.log("  → Selected: video/webm;codecs=vp9 (user requested WebM)");
                return "video/webm;codecs=vp9";
            }

            if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8")) {
                this.log("  → Selected: video/webm;codecs=vp8 (user requested WebM)");
                return "video/webm;codecs=vp8";
            }

            throw new ScreenshotError("WebM not supported in this browser", ScreenshotErrorCode.UNSUPPORTED_FORMAT);
        }

        // Auto-detect best format (default)
        // Try WebM first (better compression, open format)
        if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
            this.log("  → Selected: video/webm;codecs=vp9 (auto - best quality)");
            return "video/webm;codecs=vp9";
        }

        if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8")) {
            this.log("  → Selected: video/webm;codecs=vp8 (auto - fallback)");
            return "video/webm;codecs=vp8";
        }

        // Fall back to MP4 for Safari
        if (MediaRecorder.isTypeSupported("video/mp4")) {
            this.log("  → Selected: video/mp4 (auto - Safari fallback)");
            return "video/mp4";
        }

        // Try without codec specification (browser will choose)
        if (MediaRecorder.isTypeSupported("video/webm")) {
            this.log("  → Selected: video/webm (auto - no codec specified)");
            return "video/webm";
        }

        throw new ScreenshotError(
            "No supported video formats found. Browser may not support MediaRecorder API.",
            ScreenshotErrorCode.UNSUPPORTED_FORMAT,
        );
    }

    /**
     * Captures video in realtime using MediaRecorder
     */
    async captureRealtime(
        canvas: HTMLCanvasElement,
        options: AnimationOptions,
        onProgress?: (progress: number) => void,
    ): Promise<AnimationResult> {
        // Reset cancellation state for new capture
        this.isCancelled = false;
        this.cancelReject = null;

        const codec = this.getSupportedCodec(options.format);
        const fps = options.fps ?? VIDEO_CONSTANTS.DEFAULT_FPS;
        const width = options.width ?? canvas.width;
        const height = options.height ?? canvas.height;

        // Get canvas stream
        const stream = canvas.captureStream(fps);

        // Create MediaRecorder
        const recorderOptions: MediaRecorderOptions = {
            mimeType: codec,
        };

        if (options.videoBitrate) {
            recorderOptions.videoBitsPerSecond = options.videoBitrate;
        }

        const recorder = new MediaRecorder(stream, recorderOptions);
        this.activeRecorder = recorder;

        // Collect chunks
        const chunks: Blob[] = [];

        return new Promise<AnimationResult>((resolve, reject) => {
            // Store reject for cancellation
            this.cancelReject = reject;

            // Check if already cancelled before starting
            if (this.isCancelled) {
                this.activeRecorder = null;
                this.cancelReject = null;
                reject(new AnimationCancelledError());
                return;
            }

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            recorder.onstop = () => {
                this.activeRecorder = null;
                this.cancelReject = null;

                // If cancelled, don't resolve - the rejection has already happened
                if (this.isCancelled) {
                    return;
                }

                const blob = new Blob(chunks, {type: recorder.mimeType});
                const expectedFrames = Math.floor((options.duration / 1000) * fps);

                // Determine format from MIME type
                // Safari/iOS sometimes returns empty blob.type, so we fall back to requested codec
                const actualMimeType = blob.type || codec; // Use requested codec if blob.type is empty
                const mimeType = actualMimeType.toLowerCase();
                const format = (mimeType.includes("mp4") || mimeType.includes("mpeg") || mimeType.includes("quicktime")) ?
                    "mp4" :
                    "webm";

                // Debug logging for format detection
                this.log(`[MediaRecorder] Codec requested: ${codec}, Blob MIME type: "${blob.type}", Detected format: ${format}`);

                // We can't accurately count frames with MediaRecorder in realtime mode
                // So we assume all frames were captured unless we detect issues
                const framesCaptured = expectedFrames;
                const framesDropped = 0;

                resolve({
                    blob,
                    metadata: {
                        duration: options.duration,
                        fps,
                        format,
                        width,
                        height,
                        framesCaptured,
                        framesDropped,
                        dropRate: 0,
                    },
                });
            };

            recorder.onerror = (e: Event) => {
                this.activeRecorder = null;
                this.cancelReject = null;
                const errorMsg = e instanceof ErrorEvent ? e.message : "Unknown error";
                reject(new ScreenshotError(`MediaRecorder error: ${errorMsg}`, ScreenshotErrorCode.VIDEO_CAPTURE_FAILED));
            };

            // Start recording
            recorder.start();

            // Track progress
            const startTime = Date.now();
            const progressInterval = setInterval(() => {
                // Stop progress tracking if cancelled
                if (this.isCancelled) {
                    clearInterval(progressInterval);
                    return;
                }

                const elapsed = Date.now() - startTime;
                const progress = Math.min(100, (elapsed / options.duration) * 100);
                onProgress?.(progress);

                if (elapsed >= options.duration) {
                    clearInterval(progressInterval);
                }
            }, VIDEO_CONSTANTS.PROGRESS_INTERVAL_MS);

            // Stop after duration
            setTimeout(() => {
                clearInterval(progressInterval);
                // Only stop if not already cancelled
                if (!this.isCancelled && recorder.state !== "inactive") {
                    recorder.stop();
                    onProgress?.(100);
                }
            }, options.duration);
        });
    }

    /**
     * Cancel an ongoing capture.
     *
     * The cancellation flow is carefully ordered to avoid race conditions:
     * 1. Set `isCancelled` flag first (prevents onstop from resolving)
     * 2. Stop the recorder (may trigger onstop asynchronously)
     * 3. Reject the promise synchronously (guarantees cancellation error)
     * 4. Clear state (prevents double-handling)
     *
     * @returns true if a capture was cancelled, false if no capture was in progress
     */
    cancel(): boolean {
        if (!this.activeRecorder) {
            return false;
        }

        // Step 1: Set flag BEFORE stopping - onstop handler checks this
        this.isCancelled = true;

        // Step 2: Stop the recorder (may trigger onstop asynchronously)
        if (this.activeRecorder.state !== "inactive") {
            this.activeRecorder.stop();
        }

        // Step 3: Reject synchronously - this happens before onstop can check isCancelled
        if (this.cancelReject) {
            this.cancelReject(new AnimationCancelledError());
            this.cancelReject = null;
        }

        // Step 4: Clear state to prevent any further handling
        this.activeRecorder = null;
        return true;
    }

    /**
     * Check if a capture is currently in progress
     */
    isCapturing(): boolean {
        return this.activeRecorder !== null && this.activeRecorder.state === "recording";
    }

    /**
     * Get the MIME type that will be used for the given options
     */
    getMimeType(format?: "webm" | "mp4" | "auto"): string {
        return this.getSupportedCodec(format);
    }
}
