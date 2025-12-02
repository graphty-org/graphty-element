/**
 * Query Commands Module - Commands for querying graph structure and data.
 * @module ai/commands/QueryCommands
 */

import {z} from "zod";

import type {Graph} from "../../Graph";
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
 * Searches nodes by data properties using JMESPath-like selectors.
 */
export const findNodes: GraphCommand = {
    name: "findNodes",
    description: "Find nodes in the graph that match specific criteria. Returns matching node IDs and counts.",
    parameters: z.object({
        selector: z.string().describe("JMESPath-like selector to match nodes (e.g., 'data.type == \"server\"')"),
        limit: z.number().optional().describe("Maximum number of results to return"),
    }),
    examples: [
        {input: "Find all server nodes", params: {selector: "data.type == 'server'"}},
        {input: "Find nodes with high degree", params: {selector: "data.degree > 5"}},
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
                // Support basic patterns like "data.type == 'server'"
                matchingNodes = nodes.filter((node) => {
                    try {
                        // Parse simple equality expressions
                        const equalMatch = /^data\.(\w+)\s*==\s*['"](.+)['"]$/.exec(selector);
                        if (equalMatch) {
                            const [, key, value] = equalMatch;
                            return node.data[key] === value;
                        }

                        // Parse simple comparison expressions
                        const compMatch = /^data\.(\w+)\s*(>|<|>=|<=)\s*(\d+)$/.exec(selector);
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
