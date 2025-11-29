/**
 * Opacity helpers for de-emphasizing less important elements
 */

/**
 * Linear fade from [0,1] to [minOpacity, maxOpacity]
 * Default range: [0.1, 1.0]
 *
 * @param value - Normalized value (0-1)
 * @param minOpacity - Minimum opacity (default: 0.1)
 * @param maxOpacity - Maximum opacity (default: 1.0)
 * @returns Opacity value (0-1)
 *
 * @example
 * linear(0.0)   // 0.1
 * linear(0.5)   // 0.55
 * linear(1.0)   // 1.0
 */
export function linear(value: number, minOpacity = 0.1, maxOpacity = 1.0): number {
    // Clamp value to [0, 1]
    const clampedValue = Math.max(0, Math.min(1, value));
    return minOpacity + (clampedValue * (maxOpacity - minOpacity));
}

/**
 * Threshold-based opacity: opaque above threshold, faded below
 * Default: 0.5 threshold, 0.3 below, 1.0 above
 *
 * @param value - Normalized value (0-1)
 * @param thresholdValue - Threshold to compare against (default: 0.5)
 * @param belowOpacity - Opacity for values below threshold (default: 0.3)
 * @param aboveOpacity - Opacity for values at or above threshold (default: 1.0)
 * @returns Opacity value (0-1)
 *
 * @example
 * threshold(0.3)              // 0.3 (below 0.5)
 * threshold(0.6)              // 1.0 (above 0.5)
 * threshold(0.2, 0.3, 0.2, 1) // 0.2 (below 0.3)
 */
export function threshold(
    value: number,
    thresholdValue = 0.5,
    belowOpacity = 0.3,
    aboveOpacity = 1.0,
): number {
    return value < thresholdValue ? belowOpacity : aboveOpacity;
}

/**
 * Binary opacity: visible or invisible
 * Default: 1.0 visible, 0.0 hidden
 *
 * @param isVisible - Whether element is visible
 * @param visibleOpacity - Opacity when visible (default: 1.0)
 * @param hiddenOpacity - Opacity when hidden (default: 0.0)
 * @returns Opacity value (0-1)
 *
 * @example
 * binary(true)   // 1.0
 * binary(false)  // 0.0
 */
export function binary(
    isVisible: boolean,
    visibleOpacity = 1.0,
    hiddenOpacity = 0.0,
): number {
    return isVisible ? visibleOpacity : hiddenOpacity;
}

/**
 * Inverse linear fade: high values = transparent (for backgrounds)
 * Default range: [0.1, 1.0] (same as linear, but inverted)
 *
 * @param value - Normalized value (0-1)
 * @param minOpacity - Minimum opacity (default: 0.1)
 * @param maxOpacity - Maximum opacity (default: 1.0)
 * @returns Opacity value (0-1)
 *
 * @example
 * inverse(0.0)   // 1.0 (fully opaque for low values)
 * inverse(0.5)   // 0.55
 * inverse(1.0)   // 0.1 (nearly transparent for high values)
 */
export function inverse(value: number, minOpacity = 0.1, maxOpacity = 1.0): number {
    // Clamp value to [0, 1]
    const clampedValue = Math.max(0, Math.min(1, value));
    // Invert: 1 - value
    return minOpacity + ((1 - clampedValue) * (maxOpacity - minOpacity));
}
