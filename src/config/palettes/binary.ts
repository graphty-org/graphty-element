/**
 * Binary color palettes for highlighted vs normal states
 * All colors are colorblind-safe
 */

/**
 * Blue Highlight - universal safe hue
 * ✅ Blue is universally safe ✅ 4.5:1 contrast (WCAG AAA)
 * Uses Okabe-Ito blue for highlighted state
 */
export const BLUE_HIGHLIGHT = {
    highlighted: "#0072B2", // Okabe-Ito blue
    muted: "#CCCCCC", // light gray
} as const;

/**
 * Green Success - for correct/successful states
 * Uses Okabe-Ito green
 */
export const GREEN_SUCCESS = {
    highlighted: "#009E73", // Okabe-Ito bluish green
    muted: "#999999", // medium gray
} as const;

/**
 * Orange Warning - for attention/warning states
 * Uses Okabe-Ito orange
 */
export const ORANGE_WARNING = {
    highlighted: "#E69F00", // Okabe-Ito orange
    muted: "#CCCCCC", // light gray
} as const;
