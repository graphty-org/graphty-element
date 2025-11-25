/**
 * @fileoverview Suggested Styles API for Algorithm Visualization
 *
 * This module provides the type definitions for the Suggested Styles feature,
 * which allows algorithms to automatically provide visually meaningful default
 * styles that visualize their results without manual configuration.
 *
 * ## Overview
 *
 * When an algorithm is run on a graph, it produces results that are stored on
 * nodes and edges. The Suggested Styles API provides a standardized way for
 * algorithms to define how these results should be visualized.
 *
 * ## Usage
 *
 * ### Applying Suggested Styles
 *
 * ```typescript
 * // After running an algorithm
 * graph.runAlgorithm("graphty:degree");
 *
 * // Apply the algorithm's suggested visualization
 * graph.applySuggestedStyles("graphty:degree");
 *
 * // Or apply multiple algorithms at once
 * graph.applySuggestedStyles(["graphty:degree", "graphty:pagerank"]);
 * ```
 *
 * ### Getting Suggested Styles Without Applying
 *
 * ```typescript
 * // Inspect suggested styles before applying
 * const styles = graph.getSuggestedStyles("graphty:louvain");
 * console.log(styles.description);  // "Visualizes community membership..."
 * console.log(styles.category);     // "grouping"
 * ```
 *
 * ## Creating Custom Suggested Styles
 *
 * Algorithm authors can add suggested styles by implementing a static
 * `suggestedStyles` method on their Algorithm class:
 *
 * ```typescript
 * class MyAlgorithm extends Algorithm {
 *   static namespace = "my-namespace";
 *   static type = "my-algorithm";
 *
 *   static suggestedStyles(): SuggestedStylesConfig {
 *     return {
 *       layers: [{
 *         node: {
 *           selector: "",  // Apply to all nodes
 *           calculatedStyle: {
 *             inputs: ["algorithmResults.my-namespace.my-algorithm.score"],
 *             output: "style.texture.color",
 *             expr: "StyleHelpers.color.sequential.viridis(arguments[0])"
 *           }
 *         },
 *         metadata: {
 *           name: "My Algorithm - Color by Score",
 *           description: "Colors nodes by calculated score"
 *         }
 *       }],
 *       description: "Visualizes algorithm scores using color",
 *       category: "node-metric"
 *     };
 *   }
 * }
 * ```
 *
 * ## Style Categories
 *
 * - `node-metric`: Continuous node metrics (centrality, scores)
 * - `edge-metric`: Edge weights or flow values
 * - `grouping`: Categorical data (communities, clusters)
 * - `path`: Path highlighting (shortest path, MST)
 * - `hierarchy`: Tree/hierarchy visualization
 *
 * @module SuggestedStyles
 */

import type {AppliedEdgeStyleConfig, AppliedNodeStyleConfig} from "./StyleTemplate";

/**
 * Metadata for a suggested style layer
 *
 * @example
 * ```typescript
 * const metadata: SuggestedStyleLayerMetadata = {
 *   name: "Degree - Viridis Gradient",
 *   description: "Colors nodes from purple (low) to yellow (high) based on degree",
 *   priority: 10
 * };
 * ```
 */
export interface SuggestedStyleLayerMetadata {
    /** Human-readable name for this style layer */
    name: string;
    /** Optional description of what this style visualizes */
    description?: string;
    /** Priority for ordering when multiple algorithms suggest styles (higher = applied later) */
    priority?: number;
}

/**
 * A single suggested style layer from an algorithm
 */
export interface SuggestedStyleLayer {
    /** Node style configuration for this layer */
    node?: AppliedNodeStyleConfig;
    /** Edge style configuration for this layer */
    edge?: AppliedEdgeStyleConfig;
    /** Metadata about this style layer */
    metadata?: SuggestedStyleLayerMetadata;
}

/**
 * Complete suggested styles configuration from an algorithm
 */
export interface SuggestedStylesConfig {
    /** Array of style layers to apply */
    layers: SuggestedStyleLayer[];
    /** Overall description of the visualization strategy */
    description?: string;
    /** Category of visualization for grouping/filtering */
    category?: "node-metric" | "edge-metric" | "grouping" | "path" | "hierarchy";
}

/**
 * Type for algorithm static method that provides suggested styles
 */
export type SuggestedStylesProvider = () => SuggestedStylesConfig;

/**
 * Options for applying suggested styles
 */
export interface ApplySuggestedStylesOptions {
    /** Where to insert the style layers */
    position?: "prepend" | "append" | number;
    /** Whether to replace existing layers or merge */
    mode?: "replace" | "merge";
    /** Prefix for layer names to avoid conflicts */
    layerPrefix?: string;
    /** Enable/disable specific suggested styles by name */
    enabledStyles?: string[];
}
