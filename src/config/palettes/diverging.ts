/**
 * Diverging color palettes for data with meaningful midpoints
 * All defaults are colorblind-safe
 */

/**
 * Purple-Green diverging palette (Paul Tol)
 * ✅ Colorblind-safe ✅ No red-green
 * Research: Paul Tol SRON/EPS/TN/09-002
 * Use for: Above/below average, positive/negative
 */
export const PURPLE_GREEN_COLORS = [
    "#762a83", // Purple (negative/low)
    "#9970ab",
    "#c2a5cf",
    "#e7d4e8",
    "#f7f7f7", // White (neutral/midpoint)
    "#d9f0d3",
    "#a6dba0",
    "#5aae61",
    "#1b7837", // Green (positive/high)
] as const;

/**
 * Blue-Orange diverging palette (ColorBrewer)
 * ✅ Colorblind-safe ✅ High contrast
 * Use for: Temperature, contrasting categories
 */
export const BLUE_ORANGE_COLORS = [
    "#2166ac", // Deep blue
    "#4393c3",
    "#92c5de",
    "#d1e5f0",
    "#f7f7f7", // White
    "#fddbc7",
    "#f4a582",
    "#d6604d",
    "#b2182b", // Red-orange
] as const;

/**
 * Red-Blue diverging palette
 * ⚠️ Not colorblind-safe (red-green vision issues)
 * Use ONLY when temperature metaphor is critical
 */
export const RED_BLUE_COLORS = [
    "#67001f", // Deep red
    "#b2182b",
    "#d6604d",
    "#f4a582",
    "#fddbc7",
    "#f7f7f7", // White
    "#d1e5f0",
    "#92c5de",
    "#4393c3",
    "#2166ac", // Deep blue
] as const;
