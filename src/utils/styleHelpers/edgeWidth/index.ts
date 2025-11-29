/**
 * Edge width helpers for flow visualization and weighted graphs
 */

/**
 * Linear mapping from [0,1] to [minWidth, maxWidth]
 * Default range: [0.5, 5]
 *
 * @param value - Normalized value (0-1)
 * @param minWidth - Minimum width (default: 0.5)
 * @param maxWidth - Maximum width (default: 5)
 * @returns Scaled width
 *
 * @example
 * linear(0.0)     // 0.5
 * linear(0.5)     // 2.75
 * linear(1.0)     // 5
 * linear(0.5, 1, 10) // 5.5
 */
export function linear(value: number, minWidth = 0.5, maxWidth = 5): number {
    // Clamp value to [0, 1]
    const clampedValue = Math.max(0, Math.min(1, value));
    return minWidth + (clampedValue * (maxWidth - minWidth));
}

/**
 * Logarithmic scaling for highly varied flows
 *
 * @param value - Normalized value (0-1)
 * @param minWidth - Minimum width (default: 0.5)
 * @param maxWidth - Maximum width (default: 5)
 * @returns Scaled width
 *
 * @example
 * log(0.5, 0.5, 5) // Logarithmic scaling
 */
export function log(value: number, minWidth = 0.5, maxWidth = 5): number {
    const clampedValue = Math.max(0, Math.min(1, value));

    // Handle edge cases
    if (clampedValue === 0) {
        return minWidth;
    }

    if (clampedValue === 1) {
        return maxWidth;
    }

    // Logarithmic mapping
    const logValue = Math.log(clampedValue) / Math.log(10);
    const logMax = 0; // log(1) = 0
    const logMin = Math.log(Number.EPSILON) / Math.log(10); // log(~0)

    // Normalize to [0,1]
    const normalized = (logValue - logMin) / (logMax - logMin);

    return minWidth + (normalized * (maxWidth - minWidth));
}

/**
 * Binary: highlight vs normal
 *
 * @param isHighlighted - Whether the edge is highlighted
 * @param highlightWidth - Width for highlighted edges (default: 3)
 * @param normalWidth - Width for normal edges (default: 1)
 * @returns Width based on highlight state
 *
 * @example
 * binary(true)     // 3
 * binary(false)    // 1
 * binary(true, 5, 2) // 5
 */
export function binary(
    isHighlighted: boolean,
    highlightWidth = 3,
    normalWidth = 1,
): number {
    return isHighlighted ? highlightWidth : normalWidth;
}

/**
 * Stepped (discrete width levels)
 *
 * @param value - Normalized value (0-1)
 * @param widths - Array of width values
 * @returns Width from the appropriate step
 *
 * @example
 * stepped(0.3, [0.5, 1, 2, 3, 5]) // 1
 */
export function stepped(value: number, widths: number[]): number {
    const clampedValue = Math.max(0, Math.min(1, value));

    if (widths.length === 0) {
        return 1;
    }

    if (widths.length === 1) {
        return widths[0];
    }

    // Map value to width index
    const widthIndex = Math.min(Math.floor(clampedValue * widths.length), widths.length - 1);
    return widths[widthIndex];
}
