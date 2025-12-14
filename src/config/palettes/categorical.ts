/**
 * Categorical color palettes for discrete groups
 * All defaults are colorblind-safe
 */

/**
 * Okabe-Ito palette - R 4.0+ default, universally accessible
 * ✅ Colorblind-safe (all types) ✅ Industry standard
 * Research: Okabe & Ito (2008) "Color Universal Design"
 * Maximum 8 categories (Tableau recommendation)
 */
export const OKABE_ITO_COLORS = [
    "#E69F00", // 0 - Orange
    "#56B4E9", // 1 - Sky Blue
    "#009E73", // 2 - Bluish Green
    "#F0E442", // 3 - Yellow
    "#0072B2", // 4 - Blue
    "#D55E00", // 5 - Vermillion
    "#CC79A7", // 6 - Reddish Purple
    "#999999", // 7 - Gray
] as const;

/**
 * Paul Tol Vibrant palette - high saturation, 7 colors
 * ✅ Colorblind-safe ✅ High contrast
 * Research: Paul Tol SRON/EPS/TN/09-002
 */
export const TOL_VIBRANT_COLORS = [
    "#0077BB", // Blue
    "#33BBEE", // Cyan
    "#009988", // Teal
    "#EE7733", // Orange
    "#CC3311", // Red
    "#EE3377", // Magenta
    "#BBBBBB", // Gray
] as const;

/**
 * Paul Tol Muted palette - softer colors, 9 colors
 * ✅ Colorblind-safe ✅ More categories
 * Research: Paul Tol SRON/EPS/TN/09-002
 */
export const TOL_MUTED_COLORS = [
    "#332288", // Indigo
    "#88CCEE", // Cyan
    "#44AA99", // Teal
    "#117733", // Green
    "#999933", // Olive
    "#DDCC77", // Sand
    "#CC6677", // Rose
    "#882255", // Wine
    "#AA4499", // Purple
] as const;

/**
 * IBM Carbon palette - modern enterprise design
 * Modern enterprise aesthetic
 * Research: IBM Carbon Design System
 */
export const CARBON_COLORS = [
    "#6929C4", // Purple (primary)
    "#1192E8", // Blue
    "#005D5D", // Teal
    "#9F1853", // Magenta
    "#FA4D56", // Red
] as const;

/**
 * Pastel variant - softer version of Okabe-Ito
 * ✅ Colorblind-safe (derived from Okabe-Ito)
 * ⚠️ Lower contrast
 */
export const PASTEL_COLORS = [
    "#FFD699", // Light orange
    "#A8D8F0", // Light sky blue
    "#66C9B2", // Light teal
    "#FFF099", // Light yellow
    "#669DD6", // Light blue
    "#FF9980", // Light vermillion
    "#EBB8D2", // Light purple
    "#CCCCCC", // Light gray
] as const;
