/**
 * Color interpolation utilities
 */

/**
 * Parse a hex color string to RGB components
 * @param hex - Hex color string (e.g., "#440154")
 * @returns RGB object with r, g, b values (0-255)
 */
export function hexToRgb(hex: string): {r: number, g: number, b: number} {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
        throw new Error(`Invalid hex color: ${hex}`);
    }

    return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    };
}

/**
 * Convert RGB components to hex color string
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @returns Hex color string (e.g., "#440154")
 */
export function rgbToHex(r: number, g: number, b: number): string {
    const toHex = (value: number): string => {
        const hex = Math.round(Math.max(0, Math.min(255, value))).toString(16);
        return hex.length === 1 ? `0${hex}` : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Linearly interpolate between two colors
 * @param color1 - First color (hex string)
 * @param color2 - Second color (hex string)
 * @param t - Interpolation factor (0-1), where 0 = color1, 1 = color2
 * @returns Interpolated color (hex string)
 */
export function interpolateColor(color1: string, color2: string, t: number): string {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    const r = rgb1.r + ((rgb2.r - rgb1.r) * t);
    const g = rgb1.g + ((rgb2.g - rgb1.g) * t);
    const b = rgb1.b + ((rgb2.b - rgb1.b) * t);

    return rgbToHex(r, g, b);
}

/**
 * Interpolate a value within a color palette
 * @param value - Value to map (0-1)
 * @param colors - Array of hex color strings
 * @returns Interpolated color (hex string)
 */
export function interpolatePalette(value: number, colors: readonly string[]): string {
    // Clamp value to [0, 1]
    const clampedValue = Math.max(0, Math.min(1, value));

    // Handle edge cases
    if (clampedValue === 0) {
        return colors[0];
    }

    if (clampedValue === 1) {
        return colors[colors.length - 1];
    }

    // Find the two colors to interpolate between
    const scaledValue = clampedValue * (colors.length - 1);
    const index1 = Math.floor(scaledValue);
    const index2 = Math.min(index1 + 1, colors.length - 1);
    const t = scaledValue - index1;

    return interpolateColor(colors[index1], colors[index2], t);
}
