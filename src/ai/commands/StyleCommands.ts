/**
 * Style Commands Module - Commands for styling graph nodes and edges.
 * @module ai/commands/StyleCommands
 */

import jmespath from "jmespath";
import {z} from "zod";

import {EdgeStyle, NodeStyle} from "../../config";
import type {Graph} from "../../Graph";
import type {CommandResult, GraphCommand} from "./types";

/**
 * Schema for node style properties that can be applied via AI commands.
 * Uses simplified property names that map to the internal NodeStyle structure.
 */
const NodeStyleParamsSchema = z.object({
    color: z.string().optional().describe("Color for the node (e.g., '#ff0000', 'red')"),
    size: z.number().positive().optional().describe("Size of the node (default is 1)"),
    shape: z.string().optional().describe("Shape type (e.g., 'sphere', 'box', 'cylinder')"),
    glowColor: z.string().optional().describe("Glow effect color"),
    glowStrength: z.number().positive().optional().describe("Glow effect strength"),
    outlineColor: z.string().optional().describe("Outline color"),
    outlineWidth: z.number().positive().optional().describe("Outline width"),
    enabled: z.boolean().optional().describe("Whether the node is visible"),
}).describe("Style properties for nodes");

/**
 * Schema for edge style properties that can be applied via AI commands.
 * Uses simplified property names that map to the internal EdgeStyle structure.
 */
const EdgeStyleParamsSchema = z.object({
    color: z.string().optional().describe("Color for the edge line (e.g., '#00ff00', 'green')"),
    width: z.number().positive().optional().describe("Width of the edge line"),
    lineType: z.string().optional().describe("Line pattern (e.g., 'solid', 'dash', 'dot')"),
    arrowColor: z.string().optional().describe("Color for the arrow head"),
    arrowSize: z.number().positive().optional().describe("Size of the arrow head"),
    enabled: z.boolean().optional().describe("Whether the edge is visible"),
}).describe("Style properties for edges");

/**
 * Convert simplified node style params to internal NodeStyleConfig structure.
 * Parses through the NodeStyle schema to ensure proper color transformation
 * (e.g., CSS color names like "red" are converted to hex "#FF0000").
 */
function convertNodeStyle(params: z.infer<typeof NodeStyleParamsSchema>): {enabled: boolean} & Record<string, unknown> {
    // Build a raw style object
    const rawStyle: Record<string, unknown> = {
        enabled: params.enabled ?? true,
    };

    // Shape properties
    if (params.size !== undefined || params.shape !== undefined) {
        rawStyle.shape = {};
        if (params.size !== undefined) {
            (rawStyle.shape as Record<string, unknown>).size = params.size;
        }

        if (params.shape !== undefined) {
            (rawStyle.shape as Record<string, unknown>).type = params.shape;
        }
    }

    // Texture properties
    if (params.color !== undefined) {
        rawStyle.texture = {color: params.color};
    }

    // Effect properties
    if (params.glowColor !== undefined || params.glowStrength !== undefined ||
        params.outlineColor !== undefined || params.outlineWidth !== undefined) {
        rawStyle.effect = {};
        if (params.glowColor !== undefined || params.glowStrength !== undefined) {
            (rawStyle.effect as Record<string, unknown>).glow = {};
            if (params.glowColor !== undefined) {
                ((rawStyle.effect as Record<string, unknown>).glow as Record<string, unknown>).color = params.glowColor;
            }

            if (params.glowStrength !== undefined) {
                ((rawStyle.effect as Record<string, unknown>).glow as Record<string, unknown>).strength = params.glowStrength;
            }
        }

        if (params.outlineColor !== undefined || params.outlineWidth !== undefined) {
            (rawStyle.effect as Record<string, unknown>).outline = {};
            if (params.outlineColor !== undefined) {
                ((rawStyle.effect as Record<string, unknown>).outline as Record<string, unknown>).color = params.outlineColor;
            }

            if (params.outlineWidth !== undefined) {
                ((rawStyle.effect as Record<string, unknown>).outline as Record<string, unknown>).width = params.outlineWidth;
            }
        }
    }

    // Parse through NodeStyle schema to apply transforms (e.g., color name → hex)
    const parsedStyle = NodeStyle.parse(rawStyle);

    return parsedStyle as {enabled: boolean} & Record<string, unknown>;
}

/**
 * Convert simplified edge style params to internal EdgeStyleConfig structure.
 * Parses through the EdgeStyle schema to ensure proper color transformation
 * (e.g., CSS color names like "green" are converted to hex "#00FF00").
 */
function convertEdgeStyle(params: z.infer<typeof EdgeStyleParamsSchema>): {enabled: boolean} & Record<string, unknown> {
    // Build a raw style object
    const rawStyle: Record<string, unknown> = {
        enabled: params.enabled ?? true,
    };

    // Line properties
    if (params.color !== undefined || params.width !== undefined || params.lineType !== undefined) {
        rawStyle.line = {};
        if (params.color !== undefined) {
            (rawStyle.line as Record<string, unknown>).color = params.color;
        }

        if (params.width !== undefined) {
            (rawStyle.line as Record<string, unknown>).width = params.width;
        }

        if (params.lineType !== undefined) {
            (rawStyle.line as Record<string, unknown>).type = params.lineType;
        }
    }

    // Arrow head properties
    if (params.arrowColor !== undefined || params.arrowSize !== undefined) {
        rawStyle.arrowHead = {};
        if (params.arrowColor !== undefined) {
            (rawStyle.arrowHead as Record<string, unknown>).color = params.arrowColor;
        }

        if (params.arrowSize !== undefined) {
            (rawStyle.arrowHead as Record<string, unknown>).size = params.arrowSize;
        }
    }

    // Parse through EdgeStyle schema to apply transforms (e.g., color name → hex)
    const parsedStyle = EdgeStyle.parse(rawStyle);

    return parsedStyle as {enabled: boolean} & Record<string, unknown>;
}

/**
 * Common selector patterns that should match all items.
 * LLMs may use these instead of empty string to mean "all".
 */
const MATCH_ALL_SELECTORS = new Set(["", "*", "all", "*.*", "true"]);

/**
 * Check if a selector should match all items.
 */
function isMatchAllSelector(selector: string): boolean {
    return !selector || MATCH_ALL_SELECTORS.has(selector.toLowerCase().trim());
}

/**
 * Find nodes matching a JMESPath selector.
 *
 * @param graph - The graph instance
 * @param selector - JMESPath expression for matching nodes
 * @returns Array of matching node IDs
 */
function findMatchingNodeIds(graph: Graph, selector: string): string[] {
    const dataManager = graph.getDataManager();
    const {nodes} = dataManager;
    const matchingIds: string[] = [];

    // Handle common "match all" selectors (empty string, "*", "all", etc.)
    if (isMatchAllSelector(selector)) {
        for (const [id] of nodes) {
            matchingIds.push(String(id));
        }

        return matchingIds;
    }

    // Try JMESPath matching
    try {
        for (const [id, node] of nodes) {
            const {data} = node;
            const searchResult = jmespath.search(data, `[${selector}]`);
            if (Array.isArray(searchResult) && typeof searchResult[0] === "boolean" && searchResult[0]) {
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
 * Find edges matching a JMESPath selector.
 *
 * @param graph - The graph instance
 * @param selector - JMESPath expression for matching edges
 * @returns Array of matching edge IDs
 */
function findMatchingEdgeIds(graph: Graph, selector: string): string[] {
    const dataManager = graph.getDataManager();
    const {edges} = dataManager;
    const matchingIds: string[] = [];

    // Handle common "match all" selectors (empty string, "*", "all", etc.)
    if (isMatchAllSelector(selector)) {
        for (const [id] of edges) {
            matchingIds.push(String(id));
        }

        return matchingIds;
    }

    // Try JMESPath matching
    try {
        for (const [id, edge] of edges) {
            const {data} = edge;
            const searchResult = jmespath.search(data, `[${selector}]`);
            if (Array.isArray(searchResult) && typeof searchResult[0] === "boolean" && searchResult[0]) {
                matchingIds.push(String(id));
            }
        }
    } catch {
        // Invalid JMESPath, return empty array
        return [];
    }

    return matchingIds;
}

// Track dynamic style layers added by AI commands
const dynamicLayers = new Map<string, number>();

/**
 * Command to find and style nodes matching a selector.
 */
export const findAndStyleNodes: GraphCommand = {
    name: "findAndStyleNodes",
    description: "Find nodes matching a JMESPath selector and apply styles to them. Use an empty selector to match all nodes. Common selectors: 'data.type == \"server\"', 'data.label contains \"important\"'. Styles include color, size, shape, glow effects, and outlines.",
    parameters: z.object({
        selector: z.string().describe("JMESPath expression to match nodes (empty string matches all)"),
        style: NodeStyleParamsSchema,
        layerName: z.string().optional().describe("Name for this style layer (for later removal)"),
    }),
    examples: [
        {
            input: "Make all nodes red",
            params: {selector: "", style: {color: "#ff0000"}, layerName: "red-nodes"},
        },
        {
            input: "Highlight server nodes in blue",
            params: {selector: "data.type == 'server'", style: {color: "#0000ff", glowColor: "#0000ff", glowStrength: 1}, layerName: "servers"},
        },
        {
            input: "Make nodes larger",
            params: {selector: "", style: {size: 2}, layerName: "large-nodes"},
        },
        {
            input: "Change nodes to boxes",
            params: {selector: "", style: {shape: "box"}, layerName: "box-shapes"},
        },
    ],

    execute(
        graph: Graph,
        params: Record<string, unknown>,
    ): Promise<CommandResult> {
        const {
            selector,
            style: styleParams,
            layerName = `ai-node-style-${Date.now()}`,
        } = params as {
            selector: string;
            style: z.infer<typeof NodeStyleParamsSchema>;
            layerName?: string;
        };

        try {
            // Find matching nodes
            const matchingIds = findMatchingNodeIds(graph, selector);

            if (matchingIds.length === 0 && selector && selector.length > 0) {
                return Promise.resolve({
                    success: true,
                    message: `No nodes matched the selector "${selector}".`,
                    affectedNodes: [],
                });
            }

            // Convert simplified style to internal format
            const nodeStyle = convertNodeStyle(styleParams);

            // Create the style layer
            const styleLayer = {
                node: {
                    selector: selector || "",
                    style: nodeStyle,
                },
                metadata: {
                    name: layerName,
                },
            };

            // Add the layer through StyleManager to ensure proper cache invalidation
            // and event emission for style updates
            const styleManager = graph.getStyleManager();
            styleManager.addLayer(styleLayer);

            // Track the layer for removal (using styles reference for layer access)
            const {styles} = graph;
            dynamicLayers.set(layerName, styles.layers.length - 1);

            const nodeCount = selector ? matchingIds.length : graph.getNodeCount();
            return Promise.resolve({
                success: true,
                message: `Applied style to ${nodeCount} node(s)${selector ? ` matching "${selector}"` : ""}.`,
                affectedNodes: matchingIds,
                data: {layerName, nodeCount},
            });
        } catch (error) {
            return Promise.resolve({
                success: false,
                message: `Failed to style nodes: ${(error as Error).message}`,
            });
        }
    },
};

/**
 * Command to find and style edges matching a selector.
 */
export const findAndStyleEdges: GraphCommand = {
    name: "findAndStyleEdges",
    description: "Find edges matching a JMESPath selector and apply styles to them. Use an empty selector to match all edges. Common selectors: 'data.weight > 0.5', 'data.type == \"dependency\"'. Styles include color, width, and line patterns.",
    parameters: z.object({
        selector: z.string().describe("JMESPath expression to match edges (empty string matches all)"),
        style: EdgeStyleParamsSchema,
        layerName: z.string().optional().describe("Name for this style layer (for later removal)"),
    }),
    examples: [
        {
            input: "Make all edges green",
            params: {selector: "", style: {color: "#00ff00"}, layerName: "green-edges"},
        },
        {
            input: "Highlight heavy edges",
            params: {selector: "data.weight > 0.7", style: {color: "#ff0000", width: 3}, layerName: "heavy-edges"},
        },
        {
            input: "Make edges dashed",
            params: {selector: "", style: {lineType: "dash"}, layerName: "dashed"},
        },
    ],

    execute(
        graph: Graph,
        params: Record<string, unknown>,
    ): Promise<CommandResult> {
        const {
            selector,
            style: styleParams,
            layerName = `ai-edge-style-${Date.now()}`,
        } = params as {
            selector: string;
            style: z.infer<typeof EdgeStyleParamsSchema>;
            layerName?: string;
        };

        try {
            // Find matching edges
            const matchingIds = findMatchingEdgeIds(graph, selector);

            if (matchingIds.length === 0 && selector && selector.length > 0) {
                return Promise.resolve({
                    success: true,
                    message: `No edges matched the selector "${selector}".`,
                    affectedEdges: [],
                });
            }

            // Convert simplified style to internal format
            const edgeStyle = convertEdgeStyle(styleParams);

            // Create the style layer
            const styleLayer = {
                edge: {
                    selector: selector || "",
                    style: edgeStyle,
                },
                metadata: {
                    name: layerName,
                },
            };

            // Add the layer through StyleManager to ensure proper cache invalidation
            // and event emission for style updates
            const styleManager = graph.getStyleManager();
            styleManager.addLayer(styleLayer);

            // Track the layer for removal (using styles reference for layer access)
            const {styles} = graph;
            dynamicLayers.set(layerName, styles.layers.length - 1);

            const edgeCount = selector ? matchingIds.length : graph.getEdgeCount();
            return Promise.resolve({
                success: true,
                message: `Applied style to ${edgeCount} edge(s)${selector ? ` matching "${selector}"` : ""}.`,
                affectedEdges: matchingIds,
                data: {layerName, edgeCount},
            });
        } catch (error) {
            return Promise.resolve({
                success: false,
                message: `Failed to style edges: ${(error as Error).message}`,
            });
        }
    },
};

/**
 * Command to clear styles from a layer or all dynamic layers.
 */
export const clearStyles: GraphCommand = {
    name: "clearStyles",
    description: "Clear styles added by AI commands. Specify a layerName to clear a specific style, or leave empty to clear all AI-added styles.",
    parameters: z.object({
        layerName: z.string().optional().describe("Name of the style layer to clear (clears all if not specified)"),
    }),
    examples: [
        {input: "Clear all styling", params: {}},
        {input: "Remove red node styling", params: {layerName: "red-nodes"}},
    ],

    execute(
        graph: Graph,
        params: Record<string, unknown>,
    ): Promise<CommandResult> {
        const {layerName} = params as {layerName?: string};

        try {
            const styleManager = graph.getStyleManager();

            if (layerName) {
                // Clear specific layer by name
                const layerExists = graph.styles.layers.some(
                    (layer) => layer.metadata?.name === layerName,
                );

                if (layerExists) {
                    styleManager.removeLayersByMetadata(
                        (metadata) => {
                            const metaObj = metadata as {name?: string} | null;
                            return metaObj?.name === layerName;
                        },
                    );
                    dynamicLayers.delete(layerName);
                    return Promise.resolve({
                        success: true,
                        message: `Cleared style layer "${layerName}".`,
                    });
                }

                return Promise.resolve({
                    success: true,
                    message: `Style layer "${layerName}" not found (may already be cleared).`,
                });
            }

            // Count layers to remove before removal
            const layersToRemoveCount = graph.styles.layers.filter((layer) => {
                const name = layer.metadata?.name;
                return ((name?.startsWith("ai-")) ?? false) || (name !== undefined && dynamicLayers.has(name));
            }).length;

            // Clear all dynamic layers (those with ai- prefix in metadata.name)
            styleManager.removeLayersByMetadata((metadata) => {
                const metaObj = metadata as {name?: string} | null;
                const name = metaObj?.name;
                return ((name?.startsWith("ai-")) ?? false) || (name !== undefined && dynamicLayers.has(name));
            });

            dynamicLayers.clear();

            return Promise.resolve({
                success: true,
                message: `Cleared ${layersToRemoveCount} AI-added style layer(s).`,
                data: {clearedCount: layersToRemoveCount},
            });
        } catch (error) {
            return Promise.resolve({
                success: false,
                message: `Failed to clear styles: ${(error as Error).message}`,
            });
        }
    },
};
