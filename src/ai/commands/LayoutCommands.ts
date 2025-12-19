/**
 * Layout Commands Module - Commands for changing graph layout and dimension.
 * @module ai/commands/LayoutCommands
 */

import {z} from "zod";

import type {StyleSchema} from "../../config";
import type {Graph} from "../../Graph";
import type {CommandResult, GraphCommand} from "./types";

/**
 * Common layout types that can be used.
 * Available layouts: circular, ngraph, random, d3, spiral, shell, spring, planar,
 * kamada-kawai, forceatlas2, arf, spectral, bfs, bipartite, multipartite, fixed
 */
const LayoutTypeSchema = z.string().describe(
    "Layout algorithm type (e.g., 'circular', 'ngraph', 'random', 'spiral', 'd3')",
);

/**
 * Dimension schema - accepts string formats only.
 * Note: Google's API requires all enum values to be strings, so we only
 * accept "2d" and "3d" strings. Numeric values (2 or 3) are not supported
 * to maintain compatibility with Google's API.
 */
const DimensionSchema = z.enum(["2d", "3d"]).describe("Dimension mode: '2d' or '3d'");

/**
 * Command to change the graph layout algorithm.
 */
export const setLayout: GraphCommand = {
    name: "setLayout",
    description: "Change the graph layout algorithm. Common layouts include 'circular' (nodes in a circle), 'ngraph' (force-directed physics), 'random', 'spiral', 'shell', 'd3' (D3 force simulation), 'spring', 'planar', 'spectral', and 'forceatlas2'.",
    parameters: z.object({
        type: LayoutTypeSchema,
        options: z.record(z.unknown()).optional().describe("Additional layout-specific options"),
    }),
    examples: [
        {input: "Use circular layout", params: {type: "circular"}},
        {input: "Switch to force-directed layout", params: {type: "ngraph"}},
        {input: "Arrange nodes randomly", params: {type: "random"}},
        {input: "Spiral layout", params: {type: "spiral"}},
        {input: "Use D3 force layout", params: {type: "d3"}},
        {input: "Shell layout", params: {type: "shell"}},
    ],

    async execute(
        graph: Graph,
        params: Record<string, unknown>,
    ): Promise<CommandResult> {
        const {type, options = {}} = params as {type: string, options?: object};

        try {
            // Check if layout type is valid by attempting to set it
            await graph.setLayout(type, options);

            return {
                success: true,
                message: `Layout changed to "${type}". The graph is now being rearranged.`,
                data: {layoutType: type},
            };
        } catch (error) {
            const errorMessage = (error as Error).message;

            // Provide helpful error messages for common issues
            if (errorMessage.includes("not found") || errorMessage.includes("unknown") || errorMessage.includes("invalid")) {
                return {
                    success: false,
                    message: `Invalid layout type "${type}". Try 'circular', 'ngraph', 'random', 'spiral', 'shell', or 'd3'.`,
                };
            }

            return {
                success: false,
                message: `Failed to set layout to "${type}": ${errorMessage}`,
            };
        }
    },
};

/**
 * Command to change graph dimension (2D/3D).
 */
export const setDimension: GraphCommand = {
    name: "setDimension",
    description: "Switch between 2D and 3D graph visualization modes. In 2D mode, nodes are arranged on a flat plane. In 3D mode, nodes can be positioned in three-dimensional space.",
    parameters: z.object({
        dimension: DimensionSchema,
    }),
    examples: [
        {input: "Switch to 2D view", params: {dimension: "2d"}},
        {input: "Show in 3D", params: {dimension: "3d"}},
        {input: "Make it flat", params: {dimension: "2d"}},
        {input: "Enable 3D mode", params: {dimension: "3d"}},
    ],

    async execute(
        graph: Graph,
        params: Record<string, unknown>,
    ): Promise<CommandResult> {
        const {dimension} = params as {dimension: "2d" | "3d"};

        try {
            // Convert dimension string to boolean
            const is2D = dimension === "2d";
            const dimensionLabel = is2D ? "2D" : "3D";

            // Get current config and build a complete StyleSchema with only twoD changed
            const currentConfig = graph.styles.config;
            const styleTemplate: StyleSchema = {
                graphtyTemplate: true,
                majorVersion: "1",
                graph: {
                    addDefaultStyle: currentConfig.graph.addDefaultStyle,
                    background: currentConfig.graph.background,
                    startingCameraDistance: currentConfig.graph.startingCameraDistance,
                    twoD: is2D,
                    layout: currentConfig.graph.layout,
                    layoutOptions: currentConfig.graph.layoutOptions,
                },
                layers: [],
                data: currentConfig.data,
                behavior: currentConfig.behavior,
            };

            await graph.setStyleTemplate(styleTemplate);

            return {
                success: true,
                message: `Switched to ${dimensionLabel} mode. The graph will now be displayed ${is2D ? "on a flat plane" : "in three-dimensional space"}.`,
                data: {dimension: dimensionLabel, is2D},
            };
        } catch (error) {
            return {
                success: false,
                message: `Failed to change dimension: ${(error as Error).message}`,
            };
        }
    },
};
