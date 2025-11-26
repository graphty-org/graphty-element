import type {CameraState} from "../screenshot/types.js";

// Re-export AnimationCancelledError for consumers
export {AnimationCancelledError} from "./MediaRecorderCapture.js";

export interface CameraWaypoint {
    position: {x: number, y: number, z: number};
    target: {x: number, y: number, z: number};
    duration?: number; // Time to reach this waypoint from previous (ms)
}

export interface AnimationOptions {
    duration: number;
    fps?: number;
    format?: "webm" | "mp4" | "auto"; // 'auto' detects best format for browser
    videoBitrate?: number;
    width?: number;
    height?: number;
    transparentBackground?: boolean;
    captureMode?: "realtime" | "manual";
    cameraMode: "stationary" | "animated";
    camera?: CameraState | {preset: string};
    cameraPath?: CameraWaypoint[];
    easing?: "linear" | "easeInOut" | "easeIn" | "easeOut";
    download?: boolean;
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
 */
export function calculateDropRate(framesCaptured: number, expectedFrames: number): number {
    if (expectedFrames === 0) {
        return 0;
    }

    const dropped = expectedFrames - framesCaptured;
    return Math.round((dropped / expectedFrames) * 100);
}
