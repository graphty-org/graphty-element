import {ScreenshotError, ScreenshotErrorCode} from "./ScreenshotError.js";
import type {ScreenshotOptions} from "./types.js";

export const SCREENSHOT_PRESETS: Record<string, Partial<ScreenshotOptions>> = {
    "print": {
        format: "png",
        multiplier: 4,
        enhanceQuality: true,
        destination: {download: true},
    },

    "web-share": {
        format: "png",
        multiplier: 2,
        destination: {clipboard: true},
    },

    "thumbnail": {
        format: "jpeg",
        width: 400,
        height: 300,
        quality: 0.85,
    },

    "documentation": {
        format: "png",
        multiplier: 2,
        transparentBackground: true,
        destination: {download: true},
    },
};

/**
 * Resolves a screenshot preset and merges it with user-provided overrides.
 * Overrides take precedence over preset values.
 * @param preset - The name of the preset to resolve
 * @param overrides - Optional user-provided options to override preset values
 * @returns The merged screenshot options
 */
export function resolvePreset(
    preset: string,
    overrides?: Partial<ScreenshotOptions>,
): ScreenshotOptions {
    const presetConfig = SCREENSHOT_PRESETS[preset] as Partial<ScreenshotOptions> | undefined;
    if (!presetConfig) {
        throw new ScreenshotError(
            `Unknown screenshot preset: ${preset}`,
            ScreenshotErrorCode.PRESET_NOT_FOUND,
        );
    }

    // Merge preset with overrides (overrides take precedence)
    return {
        ... presetConfig,
        ... overrides,
        // Deep merge destination object if both exist
        destination: presetConfig.destination || overrides?.destination ?
            {
                ... presetConfig.destination,
                ... overrides?.destination,
            } :
            undefined,
    };
}
