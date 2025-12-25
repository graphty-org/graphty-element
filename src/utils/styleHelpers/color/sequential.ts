/**
 * Sequential color helpers for continuous data (0-1 → Color)
 */

import {
    BLUES_COLORS,
    GREENS_COLORS,
    INFERNO_COLORS,
    ORANGES_COLORS,
    PLASMA_COLORS,
    VIRIDIS_COLORS,
} from "../../../config/palettes/sequential";
import {interpolatePalette} from "./interpolation";

/**
 * Viridis gradient - matplotlib default, perceptually uniform
 * Maps continuous values [0,1] to colors from deep purple to bright yellow
 * ✅ Colorblind-safe ✅ Print-friendly ✅ Perceptually uniform
 * @param value - Continuous value (0-1)
 * @returns Hex color string
 * @example
 * viridis(0.0) // "#440154" (deep purple)
 * viridis(0.5) // "#1f9e89" (teal)
 * viridis(1.0) // "#fde724" (bright yellow)
 */
export function viridis(value: number): string {
    return interpolatePalette(value, VIRIDIS_COLORS);
}

/**
 * Plasma gradient - warm alternative to viridis
 * Maps continuous values [0,1] to colors from deep blue to bright yellow
 * ✅ Colorblind-safe ✅ Perceptually uniform
 * @param value - Continuous value (0-1)
 * @returns Hex color string
 * @example
 * plasma(0.0) // "#0d0887" (deep blue)
 * plasma(0.5) // "#db5c68" (pink-red)
 * plasma(1.0) // "#f0f921" (bright yellow)
 */
export function plasma(value: number): string {
    return interpolatePalette(value, PLASMA_COLORS);
}

/**
 * Inferno gradient - dark, dramatic progression
 * Maps continuous values [0,1] to colors from near black to bright yellow
 * ✅ Colorblind-safe ✅ Perceptually uniform
 * @param value - Continuous value (0-1)
 * @returns Hex color string
 * @example
 * inferno(0.0) // "#000004" (near black)
 * inferno(0.5) // "#a52c60" (red)
 * inferno(1.0) // "#f7d13d" (bright yellow)
 */
export function inferno(value: number): string {
    return interpolatePalette(value, INFERNO_COLORS);
}

/**
 * Blues gradient - single-hue progression
 * Maps continuous values [0,1] to colors from very light blue to deep blue
 * ✅ Colorblind-safe (blue is universally safe) ✅ Print-friendly
 * @param value - Continuous value (0-1)
 * @returns Hex color string
 * @example
 * blues(0.0) // "#f7fbff" (very light blue)
 * blues(0.5) // "#6baed6" (medium blue)
 * blues(1.0) // "#08306b" (deep blue)
 */
export function blues(value: number): string {
    return interpolatePalette(value, BLUES_COLORS);
}

/**
 * Greens gradient - single-hue progression
 * Maps continuous values [0,1] to colors from very light green to dark green
 * Use for: Growth, positive metrics
 * @param value - Continuous value (0-1)
 * @returns Hex color string
 * @example
 * greens(0.0) // "#f7fcf5" (very light green)
 * greens(0.5) // "#74c476" (medium green)
 * greens(1.0) // "#00441b" (dark green)
 */
export function greens(value: number): string {
    return interpolatePalette(value, GREENS_COLORS);
}

/**
 * Oranges gradient - single-hue progression
 * Maps continuous values [0,1] to colors from very light orange to dark orange
 * Use for: Heat, activity, energy
 * @param value - Continuous value (0-1)
 * @returns Hex color string
 * @example
 * oranges(0.0) // "#fff5eb" (very light orange)
 * oranges(0.5) // "#fd8d3c" (medium orange)
 * oranges(1.0) // "#7f2704" (dark orange)
 */
export function oranges(value: number): string {
    return interpolatePalette(value, ORANGES_COLORS);
}
