/**
 * Combined multi-dimensional helpers
 *
 * These helpers combine multiple visual dimensions (color + size, opacity + width, etc.)
 * to create rich, multi-dimensional visualizations.
 */

import * as categorical from "../color/categorical";
import * as diverging from "../color/diverging";
import * as sequential from "../color/sequential";
import * as edgeWidth from "../edgeWidth";
import * as opacity from "../opacity";
import * as size from "../size";

/**
 * Combined style result for nodes
 */
export interface NodeStyle {
    color?: string;
    size?: number;
    opacity?: number;
}

/**
 * Combined style result for edges
 */
export interface EdgeStyle {
    color?: string;
    width?: number;
    opacity?: number;
}

/**
 * Combine color and size based on the same metric
 * Higher values = brighter color + larger size
 *
 * @param value - Normalized value (0-1)
 * @param colorPalette - Color palette function (default: viridis)
 * @param minSize - Minimum size (default: 1)
 * @param maxSize - Maximum size (default: 5)
 * @returns Combined node style
 *
 * @example
 * // PageRank: high rank = bright yellow + large
 * colorAndSize(0.9) // { color: "#fde724", size: 4.6 }
 * colorAndSize(0.1) // { color: "#482677", size: 1.4 }
 */
export function colorAndSize(
    value: number,
    colorPalette: (v: number) => string = sequential.viridis,
    minSize = 1,
    maxSize = 5,
): NodeStyle {
    return {
        color: colorPalette(value),
        size: size.linear(value, minSize, maxSize),
    };
}

/**
 * Combine color and opacity - useful for layered visualizations
 * Higher values = brighter color + more opaque
 *
 * @param value - Normalized value (0-1)
 * @param colorPalette - Color palette function (default: viridis)
 * @param minOpacity - Minimum opacity (default: 0.1)
 * @param maxOpacity - Maximum opacity (default: 1.0)
 * @returns Combined node style
 *
 * @example
 * colorAndOpacity(0.8) // { color: "#b5de2b", opacity: 0.82 }
 */
export function colorAndOpacity(
    value: number,
    colorPalette: (v: number) => string = sequential.viridis,
    minOpacity = 0.1,
    maxOpacity = 1.0,
): NodeStyle {
    return {
        color: colorPalette(value),
        opacity: opacity.linear(value, minOpacity, maxOpacity),
    };
}

/**
 * Size and opacity without color change
 * Useful when color represents categories but size shows importance
 *
 * @param value - Normalized value (0-1)
 * @param minSize - Minimum size (default: 1)
 * @param maxSize - Maximum size (default: 5)
 * @param minOpacity - Minimum opacity (default: 0.3)
 * @param maxOpacity - Maximum opacity (default: 1.0)
 * @returns Combined node style
 *
 * @example
 * // Community nodes: same color, different importance
 * sizeAndOpacity(0.9) // { size: 4.6, opacity: 0.97 }
 */
export function sizeAndOpacity(
    value: number,
    minSize = 1,
    maxSize = 5,
    minOpacity = 0.3,
    maxOpacity = 1.0,
): NodeStyle {
    return {
        size: size.linear(value, minSize, maxSize),
        opacity: opacity.linear(value, minOpacity, maxOpacity),
    };
}

/**
 * All three dimensions: color, size, and opacity
 * Maximum expressiveness for showing importance
 *
 * @param value - Normalized value (0-1)
 * @param colorPalette - Color palette function (default: viridis)
 * @param minSize - Minimum size (default: 1)
 * @param maxSize - Maximum size (default: 5)
 * @param minOpacity - Minimum opacity (default: 0.2)
 * @param maxOpacity - Maximum opacity (default: 1.0)
 * @returns Combined node style
 *
 * @example
 * // Maximum emphasis on high-importance nodes
 * fullSpectrum(0.95) // { color: "#fde724", size: 4.8, opacity: 0.98 }
 * fullSpectrum(0.05) // { color: "#440154", size: 1.2, opacity: 0.24 }
 */
export function fullSpectrum(
    value: number,
    colorPalette: (v: number) => string = sequential.viridis,
    minSize = 1,
    maxSize = 5,
    minOpacity = 0.2,
    maxOpacity = 1.0,
): NodeStyle {
    return {
        color: colorPalette(value),
        size: size.linear(value, minSize, maxSize),
        opacity: opacity.linear(value, minOpacity, maxOpacity),
    };
}

/**
 * Category color + importance size
 * Color shows group, size shows importance within group
 *
 * @param categoryId - Category identifier
 * @param importanceValue - Importance value (0-1)
 * @param categoricalPalette - Categorical palette function (default: okabeIto)
 * @param minSize - Minimum size (default: 1)
 * @param maxSize - Maximum size (default: 5)
 * @returns Combined node style
 *
 * @example
 * // Community 2, high importance
 * categoryAndImportance(2, 0.9) // { color: "#009E73", size: 4.6 }
 */
export function categoryAndImportance(
    categoryId: number,
    importanceValue: number,
    categoricalPalette: (id: number) => string = categorical.okabeIto,
    minSize = 1,
    maxSize = 5,
): NodeStyle {
    return {
        color: categoricalPalette(categoryId),
        size: size.linear(importanceValue, minSize, maxSize),
    };
}

/**
 * Diverging color + size for above/below average with emphasis
 *
 * @param value - Normalized value (0-1)
 * @param midpoint - Midpoint value (default: 0.5)
 * @param divergingPalette - Diverging palette function (default: purpleGreen)
 * @param minSize - Minimum size (default: 1)
 * @param maxSize - Maximum size (default: 5)
 * @returns Combined node style
 *
 * @example
 * // Above average (green) and large
 * divergingWithSize(0.8) // { color: "#91cf60", size: 4.2 }
 * // Below average (purple) and small
 * divergingWithSize(0.2) // { color: "#9970ab", size: 1.8 }
 */
export function divergingWithSize(
    value: number,
    midpoint = 0.5,
    divergingPalette: (v: number, mid?: number) => string = diverging.purpleGreen,
    minSize = 1,
    maxSize = 5,
): NodeStyle {
    return {
        color: divergingPalette(value, midpoint),
        size: size.linear(value, minSize, maxSize),
    };
}

/**
 * Edge color and width for flow visualization
 *
 * @param value - Normalized flow value (0-1)
 * @param colorPalette - Color palette function (default: viridis)
 * @param minWidth - Minimum width (default: 0.2)
 * @param maxWidth - Maximum width (default: 20)
 * @returns Combined edge style
 *
 * @example
 * // High flow: bright color + thick edge
 * edgeFlow(0.9) // { color: "#fde724", width: 18.04 }
 */
export function edgeFlow(
    value: number,
    colorPalette: (v: number) => string = sequential.viridis,
    minWidth = 0.2,
    maxWidth = 20,
): EdgeStyle {
    return {
        color: colorPalette(value),
        width: edgeWidth.linear(value, minWidth, maxWidth),
    };
}

/**
 * Edge color, width, and opacity for complex flow networks
 *
 * @param value - Normalized flow value (0-1)
 * @param colorPalette - Color palette function (default: viridis)
 * @param minWidth - Minimum width (default: 0.5)
 * @param maxWidth - Maximum width (default: 5)
 * @param minOpacity - Minimum opacity (default: 0.1)
 * @param maxOpacity - Maximum opacity (default: 1.0)
 * @returns Combined edge style
 *
 * @example
 * edgeFlowFull(0.95) // { color: "#fde724", width: 4.775, opacity: 0.955 }
 */
export function edgeFlowFull(
    value: number,
    colorPalette: (v: number) => string = sequential.viridis,
    minWidth = 0.5,
    maxWidth = 5,
    minOpacity = 0.1,
    maxOpacity = 1.0,
): EdgeStyle {
    return {
        color: colorPalette(value),
        width: edgeWidth.linear(value, minWidth, maxWidth),
        opacity: opacity.linear(value, minOpacity, maxOpacity),
    };
}
