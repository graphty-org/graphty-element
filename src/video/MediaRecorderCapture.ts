import {ScreenshotError, ScreenshotErrorCode} from "../screenshot/ScreenshotError.js";
import type {AnimationOptions, AnimationResult} from "./VideoCapture.js";

/**
 * MediaRecorder wrapper with codec detection and Safari support
 */
export class MediaRecorderCapture {
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
        // eslint-disable-next-line no-console
        console.log("[MediaRecorder] Codec Detection:");
        // eslint-disable-next-line no-console
        console.log("  - Requested format:", requestedFormat ?? "auto");
        // eslint-disable-next-line no-console
        console.log("  - VP9 support:", MediaRecorder.isTypeSupported("video/webm;codecs=vp9"));
        // eslint-disable-next-line no-console
        console.log("  - VP8 support:", MediaRecorder.isTypeSupported("video/webm;codecs=vp8"));
        // eslint-disable-next-line no-console
        console.log("  - MP4 support:", MediaRecorder.isTypeSupported("video/mp4"));
        // eslint-disable-next-line no-console
        console.log("  - WebM (no codec) support:", MediaRecorder.isTypeSupported("video/webm"));

        // If user explicitly requested a format, try that first
        if (requestedFormat === "mp4") {
            if (MediaRecorder.isTypeSupported("video/mp4")) {
                // eslint-disable-next-line no-console
                console.log("  → Selected: video/mp4 (user requested)");
                return "video/mp4";
            }

            throw new ScreenshotError("MP4 not supported in this browser", ScreenshotErrorCode.UNSUPPORTED_FORMAT);
        }

        if (requestedFormat === "webm") {
            if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
                // eslint-disable-next-line no-console
                console.log("  → Selected: video/webm;codecs=vp9 (user requested WebM)");
                return "video/webm;codecs=vp9";
            }

            if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8")) {
                // eslint-disable-next-line no-console
                console.log("  → Selected: video/webm;codecs=vp8 (user requested WebM)");
                return "video/webm;codecs=vp8";
            }

            throw new ScreenshotError("WebM not supported in this browser", ScreenshotErrorCode.UNSUPPORTED_FORMAT);
        }

        // Auto-detect best format (default)
        // Try WebM first (better compression, open format)
        if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
            // eslint-disable-next-line no-console
            console.log("  → Selected: video/webm;codecs=vp9 (auto - best quality)");
            return "video/webm;codecs=vp9";
        }

        if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8")) {
            // eslint-disable-next-line no-console
            console.log("  → Selected: video/webm;codecs=vp8 (auto - fallback)");
            return "video/webm;codecs=vp8";
        }

        // Fall back to MP4 for Safari
        if (MediaRecorder.isTypeSupported("video/mp4")) {
            // eslint-disable-next-line no-console
            console.log("  → Selected: video/mp4 (auto - Safari fallback)");
            return "video/mp4";
        }

        // Try without codec specification (browser will choose)
        if (MediaRecorder.isTypeSupported("video/webm")) {
            // eslint-disable-next-line no-console
            console.log("  → Selected: video/webm (auto - no codec specified)");
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
        const codec = this.getSupportedCodec(options.format);
        const fps = options.fps ?? 30;
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

        // Collect chunks
        const chunks: Blob[] = [];

        return new Promise<AnimationResult>((resolve, reject) => {
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks, {type: recorder.mimeType});
                const expectedFrames = Math.floor((options.duration / 1000) * fps);

                // Determine format from MIME type
                // Safari/iOS sometimes returns empty blob.type, so we fall back to requested codec
                const actualMimeType = blob.type || codec; // Use requested codec if blob.type is empty
                const mimeType = actualMimeType.toLowerCase();
                const format = (mimeType.includes("mp4") || mimeType.includes("mpeg") || mimeType.includes("quicktime")) ?
                    "mp4" :
                    "webm";

                // Debug logging for format detection (TODO: Remove after iOS testing is complete)
                // eslint-disable-next-line no-console
                console.log(`[MediaRecorder] Codec requested: ${codec}, Blob MIME type: "${blob.type}", Detected format: ${format}`);

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
                const errorMsg = e instanceof ErrorEvent ? e.message : "Unknown error";
                reject(new ScreenshotError(`MediaRecorder error: ${errorMsg}`, ScreenshotErrorCode.VIDEO_CAPTURE_FAILED));
            };

            // Start recording
            recorder.start();

            // Track progress
            const startTime = Date.now();
            const progressInterval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(100, (elapsed / options.duration) * 100);
                onProgress?.(progress);

                if (elapsed >= options.duration) {
                    clearInterval(progressInterval);
                }
            }, 100);

            // Stop after duration
            setTimeout(() => {
                clearInterval(progressInterval);
                recorder.stop();
                onProgress?.(100);
            }, options.duration);
        });
    }

    /**
     * Get the MIME type that will be used for the given options
     */
    getMimeType(format?: "webm" | "mp4" | "auto"): string {
        return this.getSupportedCodec(format);
    }
}
