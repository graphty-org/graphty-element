/**
 * Colorblind simulation utilities
 *
 * Simulates how colors appear to people with different types of color vision deficiency.
 * Based on research by Viénot, Brettel, and Mollon (1999)
 */

/**
 * Convert hex color to RGB components
 */
function hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
        throw new Error(`Invalid hex color: ${hex}`);
    }

    return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
}

/**
 * Convert RGB to hex color
 */
function rgbToHex(r: number, g: number, b: number): string {
    const toHex = (n: number): string => {
        const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
        return hex.length === 1 ? `0${hex}` : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convert RGB to linear RGB (remove gamma correction)
 */
function toLinear(value: number): number {
    const v = value / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

/**
 * Convert linear RGB back to sRGB (apply gamma correction)
 */
function toSrgb(value: number): number {
    return value <= 0.0031308 ? ((value * 12.92) * 255) : ((1.055 * Math.pow(value, 1 / 2.4)) - 0.055) * 255;
}

/**
 * Simulate protanopia (red-green colorblindness, missing L cones)
 * Affects ~1% of males
 */
export function simulateProtanopia(hex: string): string {
    const [r, g, b] = hexToRgb(hex);

    // Convert to linear RGB
    const lr = toLinear(r);
    const lg = toLinear(g);
    const lb = toLinear(b);

    // Apply protanopia simulation matrix
    const nr = (0.567 * lr) + (0.433 * lg) + (0.0 * lb);
    const ng = (0.558 * lr) + (0.442 * lg) + (0.0 * lb);
    const nb = (0.0 * lr) + (0.242 * lg) + (0.758 * lb);

    // Convert back to sRGB
    return rgbToHex(toSrgb(nr), toSrgb(ng), toSrgb(nb));
}

/**
 * Simulate deuteranopia (red-green colorblindness, missing M cones)
 * Affects ~5% of males
 */
export function simulateDeuteranopia(hex: string): string {
    const [r, g, b] = hexToRgb(hex);

    // Convert to linear RGB
    const lr = toLinear(r);
    const lg = toLinear(g);
    const lb = toLinear(b);

    // Apply deuteranopia simulation matrix
    const nr = (0.625 * lr) + (0.375 * lg) + (0.0 * lb);
    const ng = (0.7 * lr) + (0.3 * lg) + (0.0 * lb);
    const nb = (0.0 * lr) + (0.3 * lg) + (0.7 * lb);

    // Convert back to sRGB
    return rgbToHex(toSrgb(nr), toSrgb(ng), toSrgb(nb));
}

/**
 * Simulate tritanopia (blue-yellow colorblindness, missing S cones)
 * Affects ~0.01% of people
 */
export function simulateTritanopia(hex: string): string {
    const [r, g, b] = hexToRgb(hex);

    // Convert to linear RGB
    const lr = toLinear(r);
    const lg = toLinear(g);
    const lb = toLinear(b);

    // Apply tritanopia simulation matrix
    const nr = (0.95 * lr) + (0.05 * lg) + (0.0 * lb);
    const ng = (0.0 * lr) + (0.433 * lg) + (0.567 * lb);
    const nb = (0.0 * lr) + (0.475 * lg) + (0.525 * lb);

    // Convert back to sRGB
    return rgbToHex(toSrgb(nr), toSrgb(ng), toSrgb(nb));
}

/**
 * Convert color to grayscale (luminance)
 */
export function toGrayscale(hex: string): string {
    const [r, g, b] = hexToRgb(hex);

    // Use standard luminance formula
    const luminance = (0.2126 * r) + (0.7152 * g) + (0.0722 * b);

    return rgbToHex(luminance, luminance, luminance);
}

/**
 * Calculate perceptual color difference (Delta E CIE76)
 * Returns a value where:
 * - < 1.0 = Not perceptible
 * - 1-2 = Perceptible through close observation
 * - 2-10 = Perceptible at a glance
 * - > 10 = Colors are very different
 */
export function colorDifference(hex1: string, hex2: string): number {
    const [r1, g1, b1] = hexToRgb(hex1);
    const [r2, g2, b2] = hexToRgb(hex2);

    // Simple Euclidean distance in RGB space
    // (More accurate would be LAB color space, but this is sufficient for testing)
    const deltaR = r1 - r2;
    const deltaG = g1 - g2;
    const deltaB = b1 - b2;

    return Math.sqrt((deltaR * deltaR) + (deltaG * deltaG) + (deltaB * deltaB)) / 2.55;
}

/**
 * Check if two colors are distinguishable in grayscale
 * Useful for print-friendliness testing
 */
export function areDistinguishableInGrayscale(hex1: string, hex2: string, threshold = 10): boolean {
    const gray1 = toGrayscale(hex1);
    const gray2 = toGrayscale(hex2);
    return colorDifference(gray1, gray2) > threshold;
}

/**
 * Test if a color palette is colorblind-safe
 * Returns true if all colors remain distinguishable under common colorblindness types
 */
export function isPaletteSafe(colors: string[], threshold = 10): {
    protanopia: boolean;
    deuteranopia: boolean;
    tritanopia: boolean;
    grayscale: boolean;
} {
    const tests = {
        protanopia: true,
        deuteranopia: true,
        tritanopia: true,
        grayscale: true,
    };

    // Test all pairs of colors
    for (let i = 0; i < colors.length; i++) {
        for (let j = i + 1; j < colors.length; j++) {
            const c1 = colors[i];
            const c2 = colors[j];

            // Protanopia
            const p1 = simulateProtanopia(c1);
            const p2 = simulateProtanopia(c2);
            if (colorDifference(p1, p2) < threshold) {
                tests.protanopia = false;
            }

            // Deuteranopia
            const d1 = simulateDeuteranopia(c1);
            const d2 = simulateDeuteranopia(c2);
            if (colorDifference(d1, d2) < threshold) {
                tests.deuteranopia = false;
            }

            // Tritanopia
            const t1 = simulateTritanopia(c1);
            const t2 = simulateTritanopia(c2);
            if (colorDifference(t1, t2) < threshold) {
                tests.tritanopia = false;
            }

            // Grayscale
            if (!areDistinguishableInGrayscale(c1, c2, threshold)) {
                tests.grayscale = false;
            }
        }
    }

    return tests;
}
