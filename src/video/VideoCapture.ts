import type {CameraState} from "../screenshot/types.js";

// Re-export AnimationCancelledError for consumers
export {AnimationCancelledError} from "./MediaRecorderCapture.js";

export interface CameraWaypoint {
    position: {x: number, y: number, z: number};
    target: {x: number, y: number, z: number};
    /** Time to reach this waypoint from the previous one (ms) */
    duration?: number;
}

/**
 * Options for capturing animation/video from the graph.
 *
 * Video capture uses the browser's MediaRecorder API for hardware-accelerated
 * real-time capture. This provides excellent performance but operates in real-time,
 * meaning the video is captured as the animation plays. Frame timing depends on
 * system performance; on slower systems, some frames may be dropped.
 *
 * For guaranteed frame-perfect capture (e.g., for production video rendering),
 * consider using external screen recording software or frame-by-frame export
 * with a third-party video encoding library like ffmpeg.
 * @see design/screen-capture-design-review.md for technical details on capture modes
 * @see src/screenshot/constants.ts for default values (VIDEO_CONSTANTS)
 */
export interface AnimationOptions {
    /** Total duration of the video capture in milliseconds */
    duration: number;
    /**
     * Target frames per second.
     * @default 30 (VIDEO_CONSTANTS.DEFAULT_FPS)
     */
    fps?: number;
    /** Video format: 'webm', 'mp4', or 'auto' to detect best format for browser */
    format?: "webm" | "mp4" | "auto";
    /**
     * Video bitrate in bits per second.
     * Higher values = better quality but larger file size.
     * @default 5000000 (VIDEO_CONSTANTS.DEFAULT_VIDEO_BITRATE - 5 Mbps)
     */
    videoBitrate?: number;
    /** Output width in pixels (default: canvas width) */
    width?: number;
    /** Output height in pixels (default: canvas height) */
    height?: number;
    /** Whether to capture with transparent background */
    transparentBackground?: boolean;
    /** Camera behavior during capture: 'stationary' or 'animated' */
    cameraMode: "stationary" | "animated";
    /** Camera position/state or preset name for stationary mode */
    camera?: CameraState | {preset: string};
    /** Waypoints for camera animation path (animated mode) */
    cameraPath?: CameraWaypoint[];
    /** Easing function for camera animations (default: 'easeInOut') */
    easing?: "linear" | "easeInOut" | "easeIn" | "easeOut";
    /** Whether to automatically download the video after capture */
    download?: boolean;
    /** Filename for downloaded video (default: 'graphty-animation.{format}') */
    downloadFilename?: string;
}

export interface AnimationResult {
    blob: Blob;
    metadata: {
        duration: number;
        fps: number;
        format: string; // Actual format used (e.g., "webm", "mp4")
        width: number;
        height: number;
        framesCaptured: number;
        framesDropped: number;
        dropRate: number;
    };
}

/**
 * Calculate frame drop rate as a percentage
 * @param framesCaptured - Number of frames successfully captured
 * @param expectedFrames - Total number of frames expected
 * @returns Drop rate as a percentage (0-100)
 */
export function calculateDropRate(framesCaptured: number, expectedFrames: number): number {
    if (expectedFrames === 0) {
        return 0;
    }

    const dropped = expectedFrames - framesCaptured;
    return Math.round((dropped / expectedFrames) * 100);
}
