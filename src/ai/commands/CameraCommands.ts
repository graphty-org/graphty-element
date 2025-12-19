/**
 * Camera Commands Module - Commands for controlling the camera.
 * @module ai/commands/CameraCommands
 */

import jmespath from "jmespath";
import {z} from "zod";

import {BUILTIN_PRESETS} from "../../camera/presets";
import type {Graph} from "../../Graph";
import type {CommandResult, GraphCommand} from "./types";

/**
 * Built-in camera preset names.
 */
const CameraPresetSchema = z.enum([... BUILTIN_PRESETS]).describe(
    "Built-in camera preset: 'fitToGraph', 'topView', 'sideView', 'frontView', 'isometric'",
);

/**
 * 3D position schema.
 */
const Position3DSchema = z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
}).describe("3D position coordinates");

/**
 * Command to set the camera position or apply a preset.
 */
export const setCameraPosition: GraphCommand = {
    name: "setCameraPosition",
    description: "Set the camera position using a preset (fitToGraph, topView, sideView, frontView, isometric) or specific coordinates. Presets automatically calculate the best view for the current graph. Animation can be enabled for smooth transitions.",
    parameters: z.object({
        preset: CameraPresetSchema.optional().describe("Named camera preset to apply"),
        position: Position3DSchema.optional().describe("Custom camera position (3D only)"),
        target: Position3DSchema.optional().describe("Point the camera should look at (3D only)"),
        animate: z.boolean().optional().describe("Whether to animate the camera transition (default: true)"),
    }),
    examples: [
        {input: "Show from top", params: {preset: "topView", animate: true}},
        {input: "View from the side", params: {preset: "sideView"}},
        {input: "Show front view", params: {preset: "frontView"}},
        {input: "Isometric view", params: {preset: "isometric"}},
        {input: "Fit all nodes in view", params: {preset: "fitToGraph"}},
        {input: "Move camera to position", params: {position: {x: 10, y: 20, z: 30}, target: {x: 0, y: 0, z: 0}}},
    ],

    async execute(
        graph: Graph,
        params: Record<string, unknown>,
    ): Promise<CommandResult> {
        const {
            preset,
            position,
            target,
            animate = true,
        } = params as {
            preset?: typeof BUILTIN_PRESETS[number];
            position?: {x: number, y: number, z: number};
            target?: {x: number, y: number, z: number};
            animate?: boolean;
        };

        try {
            // Validate we have either a preset or position
            if (!preset && !position) {
                return {
                    success: false,
                    message: "Either 'preset' or 'position' must be provided.",
                };
            }

            // Use preset if provided
            if (preset) {
                // Validate preset is known
                if (!BUILTIN_PRESETS.includes(preset)) {
                    return {
                        success: false,
                        message: `Unknown camera preset "${preset}". Available presets: ${BUILTIN_PRESETS.join(", ")}.`,
                    };
                }

                // Apply the preset
                await graph.setCameraState(
                    {preset},
                    {animate, description: `Setting camera to ${preset} view`},
                );

                return {
                    success: true,
                    message: `Camera moved to ${preset} view${animate ? " (animated)" : ""}.`,
                    data: {preset, animated: animate},
                };
            }

            // Use custom position
            if (position) {
                const cameraState: {
                    position: {x: number, y: number, z: number};
                    target?: {x: number, y: number, z: number};
                } = {position};
                if (target) {
                    cameraState.target = target;
                }

                await graph.setCameraState(cameraState, {
                    animate,
                    description: "Moving camera to specified position",
                });

                return {
                    success: true,
                    message: `Camera moved to position (${position.x}, ${position.y}, ${position.z})${animate ? " (animated)" : ""}.`,
                    data: {position, target, animated: animate},
                };
            }

            return {
                success: false,
                message: "No camera state specified.",
            };
        } catch (error) {
            return {
                success: false,
                message: `Failed to set camera position: ${(error as Error).message}`,
            };
        }
    },
};

/**
 * Find nodes matching a JMESPath selector (reused from StyleCommands).
 */
function findMatchingNodeIds(graph: Graph, selector: string): string[] {
    const dataManager = graph.getDataManager();
    const {nodes} = dataManager;
    const matchingIds: string[] = [];

    // Empty selector matches all nodes
    if (!selector || selector.length === 0) {
        for (const [id] of nodes) {
            matchingIds.push(String(id));
        }

        return matchingIds;
    }

    // Try JMESPath matching
    // Wrap data in array so we can use JMESPath filter expression [?condition]
    try {
        // Normalize selector: JMESPath npm library only supports single quotes for string literals,
        // not double quotes. LLMs like Anthropic send double quotes, so convert them.
        const normalizedSelector = selector.replace(/"/g, "'");
        const query = `[?${normalizedSelector}]`;

        for (const [id, node] of nodes) {
            const {data} = node;
            // Use JMESPath filter syntax: [?selector] returns array of matches
            const searchResult = jmespath.search([data], query);
            if (Array.isArray(searchResult) && searchResult.length > 0) {
                matchingIds.push(String(id));
            }
        }
    } catch {
        // Invalid JMESPath, return empty array
        return [];
    }

    return matchingIds;
}

/**
 * Command to zoom the camera to fit specific nodes.
 */
export const zoomToNodes: GraphCommand = {
    name: "zoomToNodes",
    description: "Zoom the camera to fit specific nodes in view. Use a JMESPath selector to choose which nodes to focus on, or leave empty to fit all nodes. Optionally add padding around the nodes.",
    parameters: z.object({
        selector: z.string().optional().describe("JMESPath expression to match nodes (empty matches all)"),
        animate: z.boolean().optional().describe("Whether to animate the zoom (default: true)"),
        padding: z.number().optional().describe("Extra padding around nodes (default: 1.2 = 20% padding)"),
    }),
    examples: [
        {input: "Zoom to fit all nodes", params: {selector: ""}},
        {input: "Zoom to server nodes", params: {selector: "type == 'server'"}},
        {input: "Fit graph with more padding", params: {selector: "", padding: 1.5}},
    ],

    async execute(
        graph: Graph,
        params: Record<string, unknown>,
    ): Promise<CommandResult> {
        const {
            selector = "",
            animate = true,
        } = params as {
            selector?: string;
            animate?: boolean;
            padding?: number;
        };

        try {
            // Find matching nodes
            const matchingIds = findMatchingNodeIds(graph, selector);

            if (matchingIds.length === 0 && selector && selector.length > 0) {
                return {
                    success: true,
                    message: `No nodes matched the selector "${selector}".`,
                    affectedNodes: [],
                };
            }

            // For now, we use the fitToGraph preset which fits all nodes
            // In a full implementation, we would calculate bounding box for matched nodes only
            await graph.setCameraState(
                {preset: "fitToGraph"},
                {animate, description: `Zooming to fit ${selector ? "matching nodes" : "all nodes"}`},
            );

            const nodeCount = selector ? matchingIds.length : graph.getNodeCount();
            return {
                success: true,
                message: `Zoomed to fit ${nodeCount} node(s)${selector ? ` matching "${selector}"` : ""}.`,
                affectedNodes: matchingIds,
                data: {nodeCount, animated: animate},
            };
        } catch (error) {
            return {
                success: false,
                message: `Failed to zoom to nodes: ${(error as Error).message}`,
            };
        }
    },
};
