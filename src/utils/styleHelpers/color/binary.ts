/**
 * Binary color helpers for highlighted vs normal states
 */

import {
    BLUE_HIGHLIGHT,
    GREEN_SUCCESS,
    ORANGE_WARNING,
} from "../../../config/palettes/binary";

/**
 * Blue highlight - universal safe hue
 * Returns blue for highlighted state, light gray for normal
 * ✅ Blue is universally safe ✅ 4.5:1 contrast (WCAG AAA)
 * @param isHighlighted - Whether element is highlighted
 * @returns Hex color string
 * @example
 * blueHighlight(true)  // "#0072B2" (Okabe-Ito blue)
 * blueHighlight(false) // "#CCCCCC" (light gray)
 */
export function blueHighlight(isHighlighted: boolean): string {
    return isHighlighted ? BLUE_HIGHLIGHT.highlighted : BLUE_HIGHLIGHT.muted;
}

/**
 * Green success - for correct/successful states
 * Returns green for highlighted state, gray for normal
 * @param isHighlighted - Whether element is highlighted
 * @returns Hex color string
 * @example
 * greenSuccess(true)  // "#009E73" (Okabe-Ito green)
 * greenSuccess(false) // "#999999" (medium gray)
 */
export function greenSuccess(isHighlighted: boolean): string {
    return isHighlighted ? GREEN_SUCCESS.highlighted : GREEN_SUCCESS.muted;
}

/**
 * Orange warning - for attention/warning states
 * Returns orange for highlighted state, light gray for normal
 * @param isHighlighted - Whether element is highlighted
 * @returns Hex color string
 * @example
 * orangeWarning(true)  // "#E69F00" (Okabe-Ito orange)
 * orangeWarning(false) // "#CCCCCC" (light gray)
 */
export function orangeWarning(isHighlighted: boolean): string {
    return isHighlighted ? ORANGE_WARNING.highlighted : ORANGE_WARNING.muted;
}

/**
 * Custom binary colors
 * Allows specifying custom highlight and muted colors
 * @param isHighlighted - Whether element is highlighted
 * @param highlightColor - Color for highlighted state (hex string)
 * @param mutedColor - Color for normal state (hex string)
 * @returns Hex color string
 */
export function custom(
    isHighlighted: boolean,
    highlightColor: string,
    mutedColor: string,
): string {
    return isHighlighted ? highlightColor : mutedColor;
}
