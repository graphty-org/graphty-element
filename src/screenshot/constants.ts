/**
 * Screenshot and video capture constants.
 *
 * These constants define default values and limits for the capture system.
 * Browser limits are also available in dimensions.ts for dimension-specific validation.
 */
export const SCREENSHOT_CONSTANTS = {
    /**
     * Maximum time to wait for layout to settle before screenshot capture (ms).
     * If the layout doesn't settle within this time, a timeout error is thrown.
     */
    LAYOUT_SETTLE_TIMEOUT_MS: 30_000,

    /**
     * Default JPEG/WebP quality when converting formats.
     * Range: 0.0 to 1.0, where 1.0 is highest quality.
     */
    DEFAULT_JPEG_QUALITY: 0.92,

    /**
     * Default PNG quality (always maximum for lossless format).
     */
    DEFAULT_PNG_QUALITY: 1.0,
} as const;

/**
 * Video capture constants.
 */
export const VIDEO_CONSTANTS = {
    /**
     * Default video bitrate in bits per second (5 Mbps).
     * Higher values = better quality but larger file size.
     */
    DEFAULT_VIDEO_BITRATE: 5_000_000,

    /**
     * Default frames per second for video capture.
     */
    DEFAULT_FPS: 30,

    /**
     * Progress update interval in milliseconds.
     * How often to report progress during video capture.
     */
    PROGRESS_INTERVAL_MS: 100,
} as const;
