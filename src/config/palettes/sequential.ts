/**
 * Sequential color palettes for continuous data (0-1 → Color)
 * Research-backed, colorblind-safe, perceptually uniform
 */

/**
 * Viridis palette - matplotlib default, perceptually uniform
 * Purple → Green → Yellow
 * ✅ Colorblind-safe ✅ Print-friendly ✅ Perceptually uniform
 * Research: Smith & van der Walt (2015) "A Better Default Colormap for Matplotlib"
 */
export const VIRIDIS_COLORS = [
    "#440154", // 0.0 - deep purple
    "#482878", // 0.1
    "#3e4989", // 0.2
    "#31688e", // 0.3
    "#26828e", // 0.4
    "#1f9e89", // 0.5
    "#35b779", // 0.6
    "#6ece58", // 0.7
    "#b5de2b", // 0.8
    "#fde724", // 0.9 - 1.0 bright yellow
] as const;

/**
 * Plasma palette - warm alternative to viridis
 * Blue → Pink → Yellow
 * ✅ Colorblind-safe ✅ Perceptually uniform
 * Research: matplotlib scientific visualization
 */
export const PLASMA_COLORS = [
    "#0d0887", // Deep blue
    "#5302a3",
    "#8b0aa5",
    "#b83289",
    "#db5c68",
    "#f48849",
    "#febd2a",
    "#f0f921", // Bright yellow
] as const;

/**
 * Inferno palette - dark, dramatic progression
 * Black → Red → Yellow
 * ✅ Colorblind-safe ✅ Perceptually uniform
 * Research: matplotlib scientific visualization
 */
export const INFERNO_COLORS = [
    "#000004", // Near black
    "#1b0c41",
    "#4a0c6b",
    "#781c6d",
    "#a52c60",
    "#cf4446",
    "#ed6925",
    "#fb9b06",
    "#f7d13d", // Bright yellow
] as const;

/**
 * Blues palette - single-hue progression
 * Light Blue → Dark Blue
 * ✅ Colorblind-safe (blue is universally safe) ✅ Print-friendly
 * Research: ColorBrewer
 */
export const BLUES_COLORS = [
    "#f7fbff", // Very light blue
    "#deebf7",
    "#c6dbef",
    "#9ecae1",
    "#6baed6",
    "#4292c6",
    "#2171b5",
    "#08519c",
    "#08306b", // Deep blue
] as const;

/**
 * Greens palette - single-hue progression
 * Light Green → Dark Green
 * Use for: Growth, positive metrics
 * Research: ColorBrewer
 */
export const GREENS_COLORS = [
    "#f7fcf5",
    "#e5f5e0",
    "#c7e9c0",
    "#a1d99b",
    "#74c476",
    "#41ab5d",
    "#238b45",
    "#006d2c",
    "#00441b",
] as const;

/**
 * Oranges palette - single-hue progression
 * Light Orange → Dark Orange
 * Use for: Heat, activity, energy
 * Research: ColorBrewer
 */
export const ORANGES_COLORS = [
    "#fff5eb",
    "#fee6ce",
    "#fdd0a2",
    "#fdae6b",
    "#fd8d3c",
    "#f16913",
    "#d94801",
    "#a63603",
    "#7f2704",
] as const;
