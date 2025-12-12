/**
 * Query Commands Module - Commands for querying graph structure and data.
 * @module ai/commands/QueryCommands
 */

import {z} from "zod";

import type {Graph} from "../../Graph";
import {SchemaExtractor} from "../schema/SchemaExtractor";
import type {CommandResult, GraphCommand} from "./types";

/**
 * Query types supported by the queryGraph command.
 */
const QueryTypeSchema = z.enum([
    "nodeCount",
    "edgeCount",
    "currentLayout",
    "all",
    "summary",
]).describe("Type of information to query about the graph");

/**
 * Command to query graph information.
 * Returns statistics and metadata about the current graph state.
 */
export const queryGraph: GraphCommand = {
    name: "queryGraph",
    description: "Query information about the graph structure, including node count, edge count, current layout, and overall statistics.",
    parameters: z.object({
        query: QueryTypeSchema,
    }),
    examples: [
        {input: "How many nodes are there?", params: {query: "nodeCount"}},
        {input: "How many edges?", params: {query: "edgeCount"}},
        {input: "What layout is being used?", params: {query: "currentLayout"}},
        {input: "Show me the graph summary", params: {query: "summary"}},
        {input: "Give me all the graph stats", params: {query: "all"}},
    ],

    execute(
        graph: Graph,
        params: Record<string, unknown>,
    ): Promise<CommandResult> {
        const {query} = params as {query: z.infer<typeof QueryTypeSchema>};

        try {
            switch (query) {
                case "nodeCount": {
                    const nodeCount = graph.getNodeCount();
                    return Promise.resolve({
                        success: true,
                        message: `The graph has ${nodeCount} node${nodeCount !== 1 ? "s" : ""}.`,
                        data: {nodeCount},
                    });
                }

                case "edgeCount": {
                    const edgeCount = graph.getEdgeCount();
                    return Promise.resolve({
                        success: true,
                        message: `The graph has ${edgeCount} edge${edgeCount !== 1 ? "s" : ""}.`,
                        data: {edgeCount},
                    });
                }

                case "currentLayout": {
                    const layoutManager = graph.getLayoutManager();
                    const layout = layoutManager.layoutEngine?.type ?? "unknown";
                    return Promise.resolve({
                        success: true,
                        message: `The current layout is "${layout}".`,
                        data: {layout},
                    });
                }

                case "all":
                case "summary": {
                    const nodeCount = graph.getNodeCount();
                    const edgeCount = graph.getEdgeCount();
                    const layoutManager = graph.getLayoutManager();
                    const layout = layoutManager.layoutEngine?.type ?? "unknown";
                    const is2D = graph.is2D();

                    return Promise.resolve({
                        success: true,
                        message: `Graph Summary:
- Nodes: ${nodeCount}
- Edges: ${edgeCount}
- Layout: ${layout}
- Mode: ${is2D ? "2D" : "3D"}`,
                        data: {
                            nodeCount,
                            edgeCount,
                            layout,
                            is2D,
                        },
                    });
                }

                default: {
                    // Handle unknown query type
                    const nodeCount = graph.getNodeCount();
                    const edgeCount = graph.getEdgeCount();
                    return Promise.resolve({
                        success: true,
                        message: `Unknown query type "${String(query)}". The graph has ${nodeCount} nodes and ${edgeCount} edges.`,
                        data: {nodeCount, edgeCount},
                    });
                }
            }
        } catch (error) {
            return Promise.resolve({
                success: false,
                message: `Failed to query graph: ${(error as Error).message}`,
            });
        }
    },
};

/**
 * Command to find nodes matching criteria.
 * Searches nodes by data properties using simple selectors.
 */
export const findNodes: GraphCommand = {
    name: "findNodes",
    description: "Find nodes in the graph that match specific criteria. Returns matching node IDs and counts. Note: selectors search within node data directly, so use 'type' not 'data.type'.",
    parameters: z.object({
        selector: z.string().describe("Simple selector to match nodes (e.g., 'type == \"server\"'). Search is performed on node data directly, so use property names like 'type' not 'data.type'."),
        limit: z.number().optional().describe("Maximum number of results to return"),
    }),
    examples: [
        {input: "Find all server nodes", params: {selector: "type == 'server'"}},
        {input: "Find nodes with high degree", params: {selector: "degree > 5"}},
        {input: "Get first 10 nodes", params: {selector: "", limit: 10}},
    ],

    execute(
        graph: Graph,
        params: Record<string, unknown>,
    ): Promise<CommandResult> {
        const {selector, limit} = params as {selector: string, limit?: number};

        try {
            const dataManager = graph.getDataManager();
            const nodes = Array.from(dataManager.nodes.values());
            let matchingNodes: typeof nodes;

            if (!selector || selector === "" || selector === "*") {
                // No selector - return all nodes
                matchingNodes = nodes;
            } else {
                // Simple selector matching
                // Support basic patterns like "type == 'server'" (searches within node.data)
                matchingNodes = nodes.filter((node) => {
                    try {
                        // Parse simple equality expressions like "type == 'server'"
                        const equalMatch = /^(\w+)\s*==\s*['"](.+)['"]$/.exec(selector);
                        if (equalMatch) {
                            const [, key, value] = equalMatch;
                            return node.data[key] === value;
                        }

                        // Parse simple comparison expressions like "degree > 5"
                        const compMatch = /^(\w+)\s*(>|<|>=|<=)\s*(\d+)$/.exec(selector);
                        if (compMatch) {
                            const [, key, op, valueStr] = compMatch;
                            const nodeValue = Number(node.data[key]);
                            const compareValue = Number(valueStr);

                            switch (op) {
                                case ">": return nodeValue > compareValue;
                                case "<": return nodeValue < compareValue;
                                case ">=": return nodeValue >= compareValue;
                                case "<=": return nodeValue <= compareValue;
                                default: return false;
                            }
                        }

                        // If no pattern matches, return false
                        return false;
                    } catch {
                        return false;
                    }
                });
            }

            // Apply limit
            if (limit !== undefined && limit > 0) {
                matchingNodes = matchingNodes.slice(0, limit);
            }

            const nodeIds = matchingNodes.map((n) => String(n.id));

            return Promise.resolve({
                success: true,
                message: `Found ${nodeIds.length} matching node${nodeIds.length !== 1 ? "s" : ""}.`,
                data: {
                    count: nodeIds.length,
                    nodeIds,
                },
                affectedNodes: nodeIds,
            });
        } catch (error) {
            return Promise.resolve({
                success: false,
                message: `Failed to find nodes: ${(error as Error).message}`,
            });
        }
    },
};

/**
 * Schema query types supported by the getSchema command.
 */
const SchemaQueryTypeSchema = z.enum([
    "nodeTypes",
    "edgeTypes",
    "nodeProperties",
    "edgeProperties",
    "all",
]).describe("Type of schema information to retrieve");

/**
 * Command to get schema information about the graph data.
 * Returns information about node types, edge types, and available properties.
 */
export const getSchema: GraphCommand = {
    name: "getSchema",
    description: "Get schema information about the graph data including node types, edge types, and available properties. Use this to discover what types of nodes exist or what properties are available for filtering.",
    parameters: z.object({
        query: SchemaQueryTypeSchema,
    }),
    examples: [
        {input: "What types of nodes are there?", params: {query: "nodeTypes"}},
        {input: "What node types exist in the graph?", params: {query: "nodeTypes"}},
        {input: "What properties do nodes have?", params: {query: "nodeProperties"}},
        {input: "What edge properties are available?", params: {query: "edgeProperties"}},
        {input: "Show me the data schema", params: {query: "all"}},
    ],

    execute(
        graph: Graph,
        params: Record<string, unknown>,
    ): Promise<CommandResult> {
        const {query} = params as {query: z.infer<typeof SchemaQueryTypeSchema>};

        try {
            const extractor = new SchemaExtractor(graph);
            const schema = extractor.extract();
            const dataManager = graph.getDataManager();

            // Helper to collect unique values for a property when enum detection fails
            // (e.g., sample size too small for statistical detection)
            const collectUniqueValues = (
                items: Iterable<{data?: Record<string, unknown>}>,
                propertyName: string,
                maxUnique = 20,
            ): string[] => {
                const values = new Set<string>();
                for (const item of items) {
                    const value = item.data?.[propertyName];
                    if (typeof value === "string") {
                        values.add(value);
                        if (values.size > maxUnique) {
                            return []; // Too many unique values
                        }
                    }
                }
                return Array.from(values).sort();
            };

            switch (query) {
                case "nodeTypes": {
                    // Find the 'type' property in node properties and get its enum values
                    const typeProperty = schema.nodeProperties.find((p) => p.name === "type");
                    let types = typeProperty?.enumValues ?? [];

                    // Fallback: if no enum values detected (small sample), collect manually
                    if (types.length === 0) {
                        types = collectUniqueValues(dataManager.nodes.values(), "type");
                    }

                    if (types.length === 0) {
                        return Promise.resolve({
                            success: true,
                            message: "No distinct node types found. Nodes may not have a 'type' property, or there are too many unique values to categorize.",
                            data: {nodeTypes: []},
                        });
                    }

                    return Promise.resolve({
                        success: true,
                        message: `Found ${types.length} node type${types.length !== 1 ? "s" : ""}: ${types.join(", ")}`,
                        data: {nodeTypes: types},
                    });
                }

                case "edgeTypes": {
                    // Find the 'type' property in edge properties and get its enum values
                    const typeProperty = schema.edgeProperties.find((p) => p.name === "type");
                    let types = typeProperty?.enumValues ?? [];

                    // Fallback: if no enum values detected (small sample), collect manually
                    if (types.length === 0) {
                        types = collectUniqueValues(dataManager.edges.values(), "type");
                    }

                    if (types.length === 0) {
                        return Promise.resolve({
                            success: true,
                            message: "No distinct edge types found. Edges may not have a 'type' property, or there are too many unique values to categorize.",
                            data: {edgeTypes: []},
                        });
                    }

                    return Promise.resolve({
                        success: true,
                        message: `Found ${types.length} edge type${types.length !== 1 ? "s" : ""}: ${types.join(", ")}`,
                        data: {edgeTypes: types},
                    });
                }

                case "nodeProperties": {
                    const props = schema.nodeProperties.map((p) => {
                        let desc = `${p.name}: ${p.type}`;
                        if (p.enumValues && p.enumValues.length > 0) {
                            desc += ` (values: ${p.enumValues.join(", ")})`;
                        }
                        if (p.range) {
                            desc += ` (range: ${p.range.min}-${p.range.max})`;
                        }
                        return desc;
                    });

                    return Promise.resolve({
                        success: true,
                        message: `Node properties:\n${props.map((p) => `- ${p}`).join("\n")}`,
                        data: {nodeProperties: schema.nodeProperties},
                    });
                }

                case "edgeProperties": {
                    const props = schema.edgeProperties.map((p) => {
                        let desc = `${p.name}: ${p.type}`;
                        if (p.enumValues && p.enumValues.length > 0) {
                            desc += ` (values: ${p.enumValues.join(", ")})`;
                        }
                        if (p.range) {
                            desc += ` (range: ${p.range.min}-${p.range.max})`;
                        }
                        return desc;
                    });

                    if (props.length === 0) {
                        return Promise.resolve({
                            success: true,
                            message: "No edge properties found.",
                            data: {edgeProperties: []},
                        });
                    }

                    return Promise.resolve({
                        success: true,
                        message: `Edge properties:\n${props.map((p) => `- ${p}`).join("\n")}`,
                        data: {edgeProperties: schema.edgeProperties},
                    });
                }

                case "all": {
                    // Get node types (with fallback for small samples)
                    const nodeTypeProperty = schema.nodeProperties.find((p) => p.name === "type");
                    let nodeTypes = nodeTypeProperty?.enumValues ?? [];
                    if (nodeTypes.length === 0) {
                        nodeTypes = collectUniqueValues(dataManager.nodes.values(), "type");
                    }

                    // Get edge types (with fallback for small samples)
                    const edgeTypeProperty = schema.edgeProperties.find((p) => p.name === "type");
                    let edgeTypes = edgeTypeProperty?.enumValues ?? [];
                    if (edgeTypes.length === 0) {
                        edgeTypes = collectUniqueValues(dataManager.edges.values(), "type");
                    }

                    // Format properties
                    const nodeProps = schema.nodeProperties.map((p) => p.name);
                    const edgeProps = schema.edgeProperties.map((p) => p.name);

                    let message = `Graph Schema Summary:
- ${schema.nodeCount} nodes with ${schema.nodeProperties.length} properties
- ${schema.edgeCount} edges with ${schema.edgeProperties.length} properties`;

                    if (nodeTypes.length > 0) {
                        message += `\n\nNode types: ${nodeTypes.join(", ")}`;
                    }

                    if (edgeTypes.length > 0) {
                        message += `\n\nEdge types: ${edgeTypes.join(", ")}`;
                    }

                    if (nodeProps.length > 0) {
                        message += `\n\nNode properties: ${nodeProps.join(", ")}`;
                    }

                    if (edgeProps.length > 0) {
                        message += `\n\nEdge properties: ${edgeProps.join(", ")}`;
                    }

                    return Promise.resolve({
                        success: true,
                        message,
                        data: {
                            nodeCount: schema.nodeCount,
                            edgeCount: schema.edgeCount,
                            nodeTypes,
                            edgeTypes,
                            nodeProperties: schema.nodeProperties,
                            edgeProperties: schema.edgeProperties,
                        },
                    });
                }

                default: {
                    return Promise.resolve({
                        success: false,
                        message: `Unknown schema query type: ${String(query)}`,
                    });
                }
            }
        } catch (error) {
            return Promise.resolve({
                success: false,
                message: `Failed to get schema: ${(error as Error).message}`,
            });
        }
    },
};
