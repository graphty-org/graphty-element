/**
 * Diverging color helpers for data with meaningful midpoints
 */

import {
    BLUE_ORANGE_COLORS,
    PURPLE_GREEN_COLORS,
    RED_BLUE_COLORS,
} from "../../../config/palettes/diverging";
import {interpolatePalette} from "./interpolation";

/**
 * Purple-Green diverging gradient (Paul Tol)
 * Maps values to colors with purple (low) ← white (midpoint) → green (high)
 * ✅ Colorblind-safe ✅ No red-green
 * @param value - Value to map (0-1)
 * @param midpoint - Midpoint value (default: 0.5)
 * @returns Hex color string
 * @example
 * purpleGreen(0.0) // "#762a83" (purple - low)
 * purpleGreen(0.5) // "#f7f7f7" (white - midpoint)
 * purpleGreen(1.0) // "#1b7837" (green - high)
 * purpleGreen(0.3, 0.3) // "#f7f7f7" (white at custom midpoint)
 */
export function purpleGreen(value: number, midpoint = 0.5): string {
    // Normalize value around the midpoint
    // If value is at midpoint, we want to return the middle color
    const normalizedValue = normalizeDivergingValue(value, midpoint);
    return interpolatePalette(normalizedValue, PURPLE_GREEN_COLORS);
}

/**
 * Blue-Orange diverging gradient (ColorBrewer)
 * Maps values to colors with blue (low) ← white (midpoint) → orange (high)
 * ✅ Colorblind-safe ✅ High contrast
 * @param value - Value to map (0-1)
 * @param midpoint - Midpoint value (default: 0.5)
 * @returns Hex color string
 * @example
 * blueOrange(0.0) // "#2166ac" (deep blue - low)
 * blueOrange(0.5) // "#f7f7f7" (white - midpoint)
 * blueOrange(1.0) // "#b2182b" (red-orange - high)
 */
export function blueOrange(value: number, midpoint = 0.5): string {
    const normalizedValue = normalizeDivergingValue(value, midpoint);
    return interpolatePalette(normalizedValue, BLUE_ORANGE_COLORS);
}

/**
 * Red-Blue diverging gradient
 * Maps values to colors with red (low) ← white (midpoint) → blue (high)
 * ⚠️ Not colorblind-safe (red-green vision issues)
 * Use ONLY when temperature metaphor is critical
 * @param value - Value to map (0-1)
 * @param midpoint - Midpoint value (default: 0.5)
 * @returns Hex color string
 * @example
 * redBlue(0.0) // "#67001f" (deep red - low)
 * redBlue(0.5) // "#f7f7f7" (white - midpoint)
 * redBlue(1.0) // "#2166ac" (deep blue - high)
 */
export function redBlue(value: number, midpoint = 0.5): string {
    const normalizedValue = normalizeDivergingValue(value, midpoint);
    return interpolatePalette(normalizedValue, RED_BLUE_COLORS);
}

/**
 * Normalize a value around a custom midpoint
 * Ensures the midpoint maps to 0.5 in the normalized space
 * @param value - Original value (0-1)
 * @param midpoint - Midpoint value (0-1)
 * @returns Normalized value (0-1)
 */
function normalizeDivergingValue(value: number, midpoint: number): number {
    // Clamp value to [0, 1]
    const clampedValue = Math.max(0, Math.min(1, value));
    const clampedMidpoint = Math.max(0, Math.min(1, midpoint));

    if (clampedValue < clampedMidpoint) {
        // Map [0, midpoint] to [0, 0.5]
        if (clampedMidpoint === 0) {
            return 0;
        }

        return (clampedValue / clampedMidpoint) * 0.5;
    }

    // Map [midpoint, 1] to [0.5, 1]
    if (clampedMidpoint === 1) {
        return 1;
    }

    return 0.5 + (((clampedValue - clampedMidpoint) / (1 - clampedMidpoint)) * 0.5);
}
