/**
 * Size helpers for scaling nodes/edges by importance, centrality, flow
 */

/**
 * Linear mapping from [0,1] to [minSize, maxSize]
 * Default range: [1, 5]
 *
 * @param value - Normalized value (0-1)
 * @param minSize - Minimum size (default: 1)
 * @param maxSize - Maximum size (default: 5)
 * @returns Scaled size
 *
 * @example
 * linear(0.0)     // 1
 * linear(0.5)     // 3
 * linear(1.0)     // 5
 * linear(0.5, 2, 10) // 6
 */
export function linear(value: number, minSize = 1, maxSize = 5): number {
    // Clamp value to [0, 1]
    const clampedValue = Math.max(0, Math.min(1, value));
    return minSize + (clampedValue * (maxSize - minSize));
}

/**
 * Linear mapping with value clipping
 * Prevents extreme sizes by clipping input value before scaling
 *
 * @param value - Normalized value (0-1)
 * @param minSize - Minimum size (default: 1)
 * @param maxSize - Maximum size (default: 5)
 * @param clipMin - Minimum value to clip to (default: 0)
 * @param clipMax - Maximum value to clip to (default: 1)
 * @returns Scaled size
 *
 * @example
 * linearClipped(0.95, 1, 5, 0.1, 0.9) // Clips 0.95 to 0.9, then scales
 */
export function linearClipped(
    value: number,
    minSize = 1,
    maxSize = 5,
    clipMin = 0,
    clipMax = 1,
): number {
    const clippedValue = Math.max(clipMin, Math.min(clipMax, value));
    return linear(clippedValue, minSize, maxSize);
}

/**
 * Logarithmic scaling for power-law distributions
 * Prevents extreme size differences
 *
 * @param value - Normalized value (0-1)
 * @param minSize - Minimum size (default: 1)
 * @param maxSize - Maximum size (default: 5)
 * @param base - Logarithm base (default: 10)
 * @returns Scaled size
 *
 * @example
 * log(0.5, 1, 5) // Logarithmic scaling
 */
export function log(value: number, minSize = 1, maxSize = 5, base = 10): number {
    const clampedValue = Math.max(0, Math.min(1, value));

    // Handle edge cases
    if (clampedValue === 0) {
        return minSize;
    }

    if (clampedValue === 1) {
        return maxSize;
    }

    // Logarithmic mapping
    // Map [0,1] to [minSize, maxSize] using log scale
    const logValue = Math.log(clampedValue) / Math.log(base);
    const logMax = 0; // log(1) = 0
    const logMin = Math.log(Number.EPSILON) / Math.log(base); // log(~0)

    // Normalize to [0,1]
    const normalized = (logValue - logMin) / (logMax - logMin);

    return minSize + (normalized * (maxSize - minSize));
}

/**
 * Logarithmic scaling with offset for zero values
 *
 * @param value - Normalized value (0-1)
 * @param minSize - Minimum size (default: 1)
 * @param maxSize - Maximum size (default: 5)
 * @param epsilon - Offset for zero values (default: 0.0001)
 * @returns Scaled size
 *
 * @example
 * logSafe(0, 1, 5) // Returns minSize safely
 */
export function logSafe(
    value: number,
    minSize = 1,
    maxSize = 5,
    epsilon = 0.0001,
): number {
    const safeValue = Math.max(epsilon, Math.min(1, value));
    return log(safeValue, minSize, maxSize);
}

/**
 * Exponential scaling [0,1] → [minSize, maxSize]
 * Makes high values dramatically larger
 *
 * @param value - Normalized value (0-1)
 * @param minSize - Minimum size (default: 1)
 * @param maxSize - Maximum size (default: 5)
 * @param exponent - Exponent value (default: 2)
 * @returns Scaled size
 *
 * @example
 * exp(0.5, 1, 5, 2) // Exponential with power 2
 */
export function exp(value: number, minSize = 1, maxSize = 5, exponent = 2): number {
    const clampedValue = Math.max(0, Math.min(1, value));
    const scaledValue = clampedValue ** exponent;
    return minSize + (scaledValue * (maxSize - minSize));
}

/**
 * Square scaling (exponent = 2)
 *
 * @param value - Normalized value (0-1)
 * @param minSize - Minimum size (default: 1)
 * @param maxSize - Maximum size (default: 5)
 * @returns Scaled size
 *
 * @example
 * square(0.5, 1, 5) // → 2
 */
export function square(value: number, minSize = 1, maxSize = 5): number {
    return exp(value, minSize, maxSize, 2);
}

/**
 * Cubic scaling (exponent = 3)
 *
 * @param value - Normalized value (0-1)
 * @param minSize - Minimum size (default: 1)
 * @param maxSize - Maximum size (default: 5)
 * @returns Scaled size
 *
 * @example
 * cubic(0.5, 1, 5) // → 1.5
 */
export function cubic(value: number, minSize = 1, maxSize = 5): number {
    return exp(value, minSize, maxSize, 3);
}

/**
 * Maps continuous [0,1] to discrete size bins
 *
 * @param value - Normalized value (0-1)
 * @param sizes - Array of size values
 * @returns Size from the appropriate bin
 *
 * @example
 * bins(0.3, [1, 2, 3, 4, 5]) // → 2
 */
export function bins(value: number, sizes: number[]): number {
    const clampedValue = Math.max(0, Math.min(1, value));

    if (sizes.length === 0) {
        return 1;
    }

    if (sizes.length === 1) {
        return sizes[0];
    }

    // Map value to bin index
    const binIndex = Math.min(Math.floor(clampedValue * sizes.length), sizes.length - 1);
    return sizes[binIndex];
}

/**
 * Small/Medium/Large preset (3 bins)
 *
 * @param value - Normalized value (0-1)
 * @returns Size: 1 (small), 2.5 (medium), or 4 (large)
 *
 * @example
 * smallMediumLarge(0.2) // → 1 (small)
 * smallMediumLarge(0.5) // → 2.5 (medium)
 * smallMediumLarge(0.8) // → 4 (large)
 */
export function smallMediumLarge(value: number): number {
    return bins(value, [1, 2.5, 4]);
}

/**
 * Five tiers preset (5 bins)
 *
 * @param value - Normalized value (0-1)
 * @returns Size: 1, 2, 3, 4, or 5
 *
 * @example
 * fiveTiers(0.3) // → 2
 */
export function fiveTiers(value: number): number {
    return bins(value, [1, 2, 3, 4, 5]);
}
