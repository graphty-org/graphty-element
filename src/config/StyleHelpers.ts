/**
 * @file StyleHelpers - Reusable utility functions for mapping algorithm results to visual styles
 *
 * Provides research-backed, colorblind-safe, accessible visualization helpers:
 * - Color palettes (sequential, categorical, diverging, binary)
 * - Size scaling (linear, log, exponential)
 * - Opacity mapping (linear, threshold, binary)
 * - Label formatting (percentage, fixed, compact, etc.)
 * - Edge width scaling for flow visualization
 * - Combined multi-dimensional helpers
 * - Animation easing functions
 *
 * All color defaults are colorblind-safe (Okabe-Ito, Viridis, Paul Tol)
 *
 * ## Quick Reference
 *
 * ### For Continuous Data (0-1 values)
 * - Color: `StyleHelpers.color.sequential.viridis(value)` - purple to yellow
 * - Size: `StyleHelpers.size.linear(value, minSize, maxSize)` - linear scale
 * - Opacity: `StyleHelpers.opacity.linear(value)` - fade in/out
 *
 * ### For Categorical Data (community IDs, clusters)
 * - Color: `StyleHelpers.color.categorical.okabeIto(categoryId)` - 8 distinct colors
 *
 * ### For Binary States (in path, selected, etc.)
 * - Color: `StyleHelpers.color.binary.blueHighlight(isHighlighted)` - blue vs gray
 * - Opacity: `StyleHelpers.opacity.binary(isVisible)` - show/hide
 *
 * ### For Diverging Data (above/below average)
 * - Color: `StyleHelpers.color.diverging.purpleGreen(value, midpoint)` - purple ← white → green
 *
 * ## Usage in calculatedStyle
 *
 * ```typescript
 * calculatedStyle: {
 *   inputs: ["algorithmResults.graphty.degree.degreePct"],
 *   output: "style.texture.color",
 *   expr: "StyleHelpers.color.sequential.viridis(arguments[0])"
 * }
 * ```
 *
 * ## Available Palettes
 *
 * ### Sequential (Continuous Data)
 * - `viridis` - Purple → Yellow (default, colorblind-safe)
 * - `plasma` - Blue → Pink → Yellow
 * - `inferno` - Black → Red → Yellow
 * - `blues` - Light Blue → Dark Blue
 * - `greens` - Light Green → Dark Green
 * - `oranges` - Light Orange → Dark Orange
 *
 * ### Categorical (Discrete Groups)
 * - `okabeIto` - 8 colors, universally accessible (default)
 * - `tolVibrant` - 7 colors, high saturation
 * - `tolMuted` - 9 colors, softer aesthetic
 * - `carbon` - 5 colors, IBM design system
 * - `pastel` - 8 colors, lighter version
 *
 * ### Diverging (Midpoint Data)
 * - `purpleGreen` - Colorblind-safe (default)
 * - `blueOrange` - High contrast
 * - `redBlue` - Temperature metaphor (use sparingly)
 *
 * ### Binary (True/False States)
 * - `blueHighlight` - Blue vs Gray (default)
 * - `greenSuccess` - Green vs Gray
 * - `orangeWarning` - Orange vs Gray
 * - `custom(highlight, normal)` - Custom colors
 * @example
 * // Sequential gradient for continuous data
 * StyleHelpers.color.sequential.viridis(0.75) // → "#6ece58"
 * @example
 * // Categorical colors for communities
 * StyleHelpers.color.categorical.okabeIto(2) // → "#009E73"
 * @example
 * // Linear size scaling
 * StyleHelpers.size.linear(0.5, 1, 5) // → 3
 * @example
 * // Threshold opacity (focus on important nodes)
 * StyleHelpers.opacity.threshold(0.3, 0.5, 0.2, 1.0) // → 0.2 (below threshold)
 * @example
 * // Combined color and size
 * const result = StyleHelpers.combined.colorAndSize(0.8);
 * // → { color: "#6ece58", size: 4.2 }
 * @module StyleHelpers
 */

import * as animation from "../utils/styleHelpers/animation";
import * as binary from "../utils/styleHelpers/color/binary";
import * as categorical from "../utils/styleHelpers/color/categorical";
import * as diverging from "../utils/styleHelpers/color/diverging";
import * as sequential from "../utils/styleHelpers/color/sequential";
import * as combined from "../utils/styleHelpers/combined";
import * as edgeWidth from "../utils/styleHelpers/edgeWidth";
import * as label from "../utils/styleHelpers/label";
import * as opacity from "../utils/styleHelpers/opacity";
import * as size from "../utils/styleHelpers/size";

export const StyleHelpers = {
    /**
     * Color helpers for all visualization types
     */
    color: {
        /**
         * Sequential gradients for continuous data (0-1 → Color)
         * Use for: Centrality metrics, importance scores, continuous data
         */
        sequential: {
            viridis: sequential.viridis,
            plasma: sequential.plasma,
            inferno: sequential.inferno,
            blues: sequential.blues,
            greens: sequential.greens,
            oranges: sequential.oranges,
        },
        /**
         * Categorical palettes for discrete groups (Category ID → Color)
         * Use for: Communities, clusters, components, categories
         */
        categorical: {
            okabeIto: categorical.okabeIto,
            tolVibrant: categorical.tolVibrant,
            tolMuted: categorical.tolMuted,
            carbon: categorical.carbon,
            pastel: categorical.pastel,
        },
        /**
         * Diverging gradients for data with meaningful midpoints
         * Use for: Above/below average, positive/negative, increase/decrease
         */
        diverging: {
            purpleGreen: diverging.purpleGreen,
            blueOrange: diverging.blueOrange,
            redBlue: diverging.redBlue,
        },
        /**
         * Binary highlights for true/false states (Boolean → Color)
         * Use for: Path highlighting, MST edges, selected elements
         */
        binary: {
            blueHighlight: binary.blueHighlight,
            greenSuccess: binary.greenSuccess,
            orangeWarning: binary.orangeWarning,
            custom: binary.custom,
        },
    },

    /**
     * Size helpers for scaling nodes/edges
     * Use for: Importance, centrality, flow visualization
     */
    size: {
        linear: size.linear,
        linearClipped: size.linearClipped,
        log: size.log,
        logSafe: size.logSafe,
        exp: size.exp,
        square: size.square,
        cubic: size.cubic,
        bins: size.bins,
        smallMediumLarge: size.smallMediumLarge,
        fiveTiers: size.fiveTiers,
    },

    /**
     * Opacity helpers for de-emphasizing elements
     * Use for: Layered effects, importance filtering
     */
    opacity: {
        linear: opacity.linear,
        threshold: opacity.threshold,
        binary: opacity.binary,
        inverse: opacity.inverse,
    },

    /**
     * Label helpers for formatting metric values
     * Use for: Displaying algorithm results as text
     */
    label: {
        percentage: label.percentage,
        fixed: label.fixed,
        scientific: label.scientific,
        compact: label.compact,
        integer: label.integer,
        substitute: label.substitute,
        rankLabel: label.rankLabel,
        scoreLabel: label.scoreLabel,
        communityLabel: label.communityLabel,
        levelLabel: label.levelLabel,
        ifAbove: label.ifAbove,
        topN: label.topN,
        conditional: label.conditional,
    },

    /**
     * Edge width helpers for flow visualization
     * Use for: Weighted graphs, flow networks
     */
    edgeWidth: {
        linear: edgeWidth.linear,
        log: edgeWidth.log,
        binary: edgeWidth.binary,
        stepped: edgeWidth.stepped,
    },

    /**
     * Combined multi-dimensional helpers
     * Use for: Rich visualizations combining color, size, and opacity
     */
    combined: {
        colorAndSize: combined.colorAndSize,
        colorAndOpacity: combined.colorAndOpacity,
        sizeAndOpacity: combined.sizeAndOpacity,
        fullSpectrum: combined.fullSpectrum,
        categoryAndImportance: combined.categoryAndImportance,
        divergingWithSize: combined.divergingWithSize,
        edgeFlow: combined.edgeFlow,
        edgeFlowFull: combined.edgeFlowFull,
    },

    /**
     * Animation helpers for smooth transitions
     * Use for: Animated visualizations and transitions
     */
    animation: {
        // Easing functions
        linear: animation.linear,
        easeIn: animation.easeIn,
        easeOut: animation.easeOut,
        easeInOut: animation.easeInOut,
        easeInCubic: animation.easeInCubic,
        easeOutCubic: animation.easeOutCubic,
        easeInOutCubic: animation.easeInOutCubic,
        easeOutElastic: animation.easeOutElastic,
        easeOutBounce: animation.easeOutBounce,

        // Interpolation
        interpolate: animation.interpolate,
        stepped: animation.stepped,

        // Oscillations
        pulse: animation.pulse,
        wave: animation.wave,

        // Timing
        delayedStart: animation.delayedStart,
        stagger: animation.stagger,
        spring: animation.spring,
    },
};

// Export type for use in other modules
export type StyleHelpersType = typeof StyleHelpers;
