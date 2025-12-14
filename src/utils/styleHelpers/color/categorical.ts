/**
 * Categorical color helpers for discrete groups
 */

import {
    CARBON_COLORS,
    OKABE_ITO_COLORS,
    PASTEL_COLORS,
    TOL_MUTED_COLORS,
    TOL_VIBRANT_COLORS,
} from "../../../config/palettes/categorical";

/**
 * Okabe-Ito palette - R 4.0+ default, universally accessible
 * Maps category IDs to distinct colors (8 colors total)
 * ✅ Colorblind-safe (all types) ✅ Industry standard
 *
 * Cycles through colors if categoryId > 7
 *
 * @param categoryId - Category identifier (0-7 for unique colors)
 * @returns Hex color string
 *
 * @example
 * okabeIto(0) // "#E69F00" (Orange)
 * okabeIto(1) // "#56B4E9" (Sky Blue)
 * okabeIto(2) // "#009E73" (Bluish Green)
 * okabeIto(8) // "#E69F00" (wraps around to Orange)
 */
export function okabeIto(categoryId: number): string {
    const index = categoryId % OKABE_ITO_COLORS.length;
    return OKABE_ITO_COLORS[index];
}

/**
 * Paul Tol Vibrant palette - high saturation colors
 * Maps category IDs to distinct colors (7 colors total)
 * ✅ Colorblind-safe ✅ High contrast
 *
 * @param categoryId - Category identifier (0-6 for unique colors)
 * @returns Hex color string
 *
 * @example
 * tolVibrant(0) // "#0077BB" (Blue)
 * tolVibrant(1) // "#33BBEE" (Cyan)
 * tolVibrant(7) // "#0077BB" (wraps around to Blue)
 */
export function tolVibrant(categoryId: number): string {
    const index = categoryId % TOL_VIBRANT_COLORS.length;
    return TOL_VIBRANT_COLORS[index];
}

/**
 * Paul Tol Muted palette - softer colors
 * Maps category IDs to distinct colors (9 colors total)
 * ✅ Colorblind-safe ✅ More categories
 *
 * @param categoryId - Category identifier (0-8 for unique colors)
 * @returns Hex color string
 *
 * @example
 * tolMuted(0) // "#332288" (Indigo)
 * tolMuted(1) // "#88CCEE" (Cyan)
 * tolMuted(9) // "#332288" (wraps around to Indigo)
 */
export function tolMuted(categoryId: number): string {
    const index = categoryId % TOL_MUTED_COLORS.length;
    return TOL_MUTED_COLORS[index];
}

/**
 * IBM Carbon palette - modern enterprise design
 * Maps category IDs to distinct colors (5 colors total)
 * Modern enterprise aesthetic
 *
 * @param categoryId - Category identifier (0-4 for unique colors)
 * @returns Hex color string
 *
 * @example
 * carbon(0) // "#6929C4" (Purple)
 * carbon(1) // "#1192E8" (Blue)
 * carbon(5) // "#6929C4" (wraps around to Purple)
 */
export function carbon(categoryId: number): string {
    const index = categoryId % CARBON_COLORS.length;
    return CARBON_COLORS[index];
}

/**
 * Pastel palette - softer version of Okabe-Ito
 * Maps category IDs to distinct colors (8 colors total)
 * ✅ Colorblind-safe (derived from Okabe-Ito)
 * ⚠️ Lower contrast
 *
 * @param categoryId - Category identifier (0-7 for unique colors)
 * @returns Hex color string
 *
 * @example
 * pastel(0) // "#FFD699" (Light orange)
 * pastel(1) // "#A8D8F0" (Light sky blue)
 * pastel(8) // "#FFD699" (wraps around to Light orange)
 */
export function pastel(categoryId: number): string {
    const index = categoryId % PASTEL_COLORS.length;
    return PASTEL_COLORS[index];
}
