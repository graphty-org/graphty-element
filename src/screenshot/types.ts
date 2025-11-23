export type ClipboardStatus =
  | "success"
  | "not-supported"
  | "permission-denied"
  | "not-secure-context"
  | "failed";

export interface ScreenshotOptions {
    format?: "png" | "jpeg" | "webp";
    quality?: number;
    multiplier?: number;
    width?: number;
    height?: number;
    strictAspectRatio?: boolean;
    transparentBackground?: boolean;
    enhanceQuality?: boolean;
    destination?: {
        blob?: boolean;
        download?: boolean;
        clipboard?: boolean;
    };
    downloadFilename?: string;
    preset?: "print" | "web-share" | "thumbnail" | "documentation";
    camera?: CameraState | {preset: string};
    timing?: {
        waitForSettle?: boolean;
        waitForOperations?: boolean;
    };
}

export interface ScreenshotResult {
    blob: Blob;
    downloaded: boolean;
    clipboardStatus: ClipboardStatus;
    clipboardError?: Error;
    errors?: Error[];
    metadata: {
        width: number;
        height: number;
        format: string;
        byteSize: number;
        captureTime: number;
    };
}

// Camera state for screenshots
export interface CameraState {
    type?: "arcRotate" | "free" | "universal" | "orthographic";

    // 3D Camera Properties
    position?: {x: number, y: number, z: number};
    target?: {x: number, y: number, z: number};
    alpha?: number;
    beta?: number;
    radius?: number;
    fov?: number;

    // 2D Camera Properties
    zoom?: number;
    pan?: {x: number, y: number};
    rotation?: number;

    // Orthographic frustum (advanced)
    orthoLeft?: number;
    orthoRight?: number;
    orthoTop?: number;
    orthoBottom?: number;

    // OrbitCameraController-specific fields
    pivotRotation?: {x: number, y: number, z: number};
    cameraDistance?: number;
}

// Camera animation options (extends QueueableOptions for operation queue integration)
export interface CameraAnimationOptions {
    animate?: boolean;
    duration?: number;
    easing?: "linear" | "easeIn" | "easeOut" | "easeInOut";

    // Operation queue options
    skipQueue?: boolean;
    description?: string;
}
