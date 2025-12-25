import {ScreenshotError, ScreenshotErrorCode} from "./ScreenshotError.js";
import type {ScreenshotOptions} from "./types.js";

export const BROWSER_LIMITS = {
    MAX_DIMENSION: 16384,
    MAX_PIXELS: 33_177_600, // 8K
    WARN_PIXELS: 8_294_400, // 4K
};

export interface CalculatedDimensions {
    width: number;
    height: number;
}

/**
 * Calculates the output dimensions for a screenshot based on user options and canvas aspect ratio.
 * Supports explicit dimensions (width/height), multiplier-based scaling, and strict aspect ratio validation.
 * @param canvas - The HTML canvas element to capture
 * @param options - Screenshot configuration options
 * @returns The calculated width and height for the screenshot
 */
export function calculateDimensions(
    canvas: HTMLCanvasElement,
    options: ScreenshotOptions,
): CalculatedDimensions {
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const canvasAspect = canvasWidth / canvasHeight;

    // Explicit dimensions take precedence over multiplier
    if (options.width !== undefined || options.height !== undefined) {
        let width: number;
        let height: number;

        // Both dimensions specified
        if (options.width !== undefined && options.height !== undefined) {
            ({width, height} = options as {width: number, height: number});
        } else if (options.width !== undefined) {
            // Only width specified - calculate height to maintain aspect ratio
            ({width} = options);
            height = Math.round(width / canvasAspect);
        } else if (options.height !== undefined) {
            // Only height specified - calculate width to maintain aspect ratio
            ({height} = options);
            width = Math.round(height * canvasAspect);
        } else {
            // This should never happen due to the outer if condition
            throw new ScreenshotError(
                "Internal error: no dimensions specified",
                ScreenshotErrorCode.INVALID_DIMENSIONS,
            );
        }

        // Validate aspect ratio if strictAspectRatio is enabled
        if (options.strictAspectRatio && options.width !== undefined && options.height !== undefined) {
            const requestedAspect = width / height;
            const tolerance = 0.01; // 1% tolerance

            if (Math.abs(canvasAspect - requestedAspect) > tolerance) {
                throw new ScreenshotError(
                    `Aspect ratio mismatch: canvas is ${canvasWidth}x${canvasHeight} (${canvasAspect.toFixed(
                        2,
                    )}), requested ${width}x${height} (${requestedAspect.toFixed(2)})`,
                    ScreenshotErrorCode.ASPECT_RATIO_MISMATCH,
                    {
                        canvasWidth,
                        canvasHeight,
                        requestedWidth: width,
                        requestedHeight: height,
                    },
                );
            }
        }

        validateDimensions(width, height);
        return {width, height};
    }

    // Use multiplier (default: 1)
    const multiplier = options.multiplier ?? 1;
    const width = Math.floor(canvasWidth * multiplier);
    const height = Math.floor(canvasHeight * multiplier);

    validateDimensions(width, height);
    return {width, height};
}

/**
 * Validates screenshot dimensions against browser limits.
 * Checks for positive finite numbers, maximum dimension size, and total pixel count.
 * Throws ScreenshotError if validation fails.
 * @param width - The width in pixels to validate
 * @param height - The height in pixels to validate
 */
export function validateDimensions(width: number, height: number): void {
    // Check for valid positive dimensions
    if (width <= 0 || height <= 0 || !Number.isFinite(width) || !Number.isFinite(height)) {
        throw new ScreenshotError(
            `Invalid dimensions: ${width}x${height}. Dimensions must be positive finite numbers.`,
            ScreenshotErrorCode.INVALID_DIMENSIONS,
            {width, height},
        );
    }

    // Check individual dimension limits
    if (width > BROWSER_LIMITS.MAX_DIMENSION || height > BROWSER_LIMITS.MAX_DIMENSION) {
        throw new ScreenshotError(
            `Dimension ${width}x${height} exceeds browser limit of ${BROWSER_LIMITS.MAX_DIMENSION}px.`,
            ScreenshotErrorCode.DIMENSION_TOO_LARGE,
            {
                width,
                height,
                maxDimension: BROWSER_LIMITS.MAX_DIMENSION,
            },
        );
    }

    // Check total pixel count
    const totalPixels = width * height;
    if (totalPixels > BROWSER_LIMITS.MAX_PIXELS) {
        throw new ScreenshotError(
            `Total pixels too large: ${width}x${height} = ${totalPixels} pixels. Maximum is ${BROWSER_LIMITS.MAX_PIXELS} pixels.`,
            ScreenshotErrorCode.RESOLUTION_TOO_HIGH,
            {
                width,
                height,
                totalPixels,
                maxPixels: BROWSER_LIMITS.MAX_PIXELS,
            },
        );
    }

    // Warning for large screenshots (non-fatal)
    if (totalPixels > BROWSER_LIMITS.WARN_PIXELS) {
        console.warn(
            `Large screenshot ${width}x${height} (${(totalPixels / 1e6).toFixed(1)}MP) may fail on devices with limited memory`,
        );
    }
}
