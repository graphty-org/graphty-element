export type ClipboardStatus =
  | "success"
  | "not-supported"
  | "permission-denied"
  | "not-secure-context"
  | "failed";

/**
 * Options for quality enhancement during screenshot capture.
 */
export interface QualityEnhancementOptions {
    /**
     * Supersampling factor - renders at this multiple of the target resolution
     * then downscales for smoother edges. Higher values = better quality but slower.
     * @default 2
     */
    supersampleFactor?: number;

    /**
     * MSAA (Multi-Sample Anti-Aliasing) sample count.
     * Values: 1 (off), 2, 4, 8, 16 (hardware dependent).
     * Combined with supersampling for even better results.
     * @default 4
     */
    msaaSamples?: number;

    /**
     * Enable FXAA as a final pass after other AA methods.
     * Generally not needed when using supersampling, but can help smooth
     * any remaining jaggies.
     * @default false
     */
    fxaa?: boolean;
}

export interface ScreenshotOptions {
    format?: "png" | "jpeg" | "webp";
    quality?: number;
    multiplier?: number;
    width?: number;
    height?: number;
    strictAspectRatio?: boolean;
    transparentBackground?: boolean;
    /**
     * Enable quality enhancement for the screenshot.
     * Can be a boolean (true = default settings) or an object with specific settings.
     *
     * Quality enhancement uses supersampling (rendering at higher resolution then downscaling)
     * which provides the highest quality anti-aliasing for screenshots.
     *
     * @example
     * // Use default settings (2x supersampling)
     * enhanceQuality: true
     *
     * @example
     * // Custom settings
     * enhanceQuality: {
     *   supersampleFactor: 4,  // 4x supersampling (very high quality, slower)
     *   msaaSamples: 4,        // Also add MSAA
     * }
     */
    enhanceQuality?: boolean | QualityEnhancementOptions;
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
        /** Time spent on quality enhancement (FXAA), only present if enhanceQuality was true */
        enhancementTime?: number;
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
