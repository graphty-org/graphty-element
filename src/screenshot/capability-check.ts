import {BROWSER_LIMITS, calculateDimensions} from "./dimensions.js";
import type {ScreenshotOptions} from "./types.js";

export interface CapabilityCheck {
    supported: boolean;
    reason?: string;
    warnings?: string[];
    estimatedMemoryMB: number;
}

export async function canCaptureScreenshot(
    canvas: HTMLCanvasElement,
    options: ScreenshotOptions,
): Promise<CapabilityCheck> {
    let dims;

    try {
        dims = calculateDimensions(canvas, options);
    } catch (error) {
        // If dimension calculation fails, it's not supported
        return {
            supported: false,
            reason: error instanceof Error ? error.message : "Invalid dimensions",
            estimatedMemoryMB: 0,
        };
    }

    const pixels = dims.width * dims.height;
    const memoryMB = (pixels * 4) / (1024 * 1024);

    const warnings: string[] = [];

    // Check format support
    if (options.format === "webp" && !(await supportsWebP())) {
        return {
            supported: false,
            reason: "WebP format not supported in this browser",
            estimatedMemoryMB: memoryMB,
        };
    }

    // Warnings
    if (pixels >= BROWSER_LIMITS.WARN_PIXELS) {
        warnings.push(
            `Large screenshot (${(pixels / 1e6).toFixed(1)}MP) may fail on some devices`,
        );
    }

    if (memoryMB > 100) {
        warnings.push(
            `High memory usage (~${memoryMB.toFixed(0)}MB) - may cause performance issues`,
        );
    }

    return {
        supported: true,
        warnings: warnings.length > 0 ? warnings : undefined,
        estimatedMemoryMB: memoryMB,
    };
}

async function supportsWebP(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;

        canvas.toBlob(
            (blob) => {
                resolve(blob !== null && blob.type === "image/webp");
            },
            "image/webp",
        );
    });
}
