/**
 * AlgorithmCommands - Commands for running and listing graph algorithms.
 * @module ai/commands/AlgorithmCommands
 */

import {z} from "zod";

import {Algorithm} from "../../algorithms/Algorithm";
import type {Graph} from "../../Graph";
import type {CommandResult, GraphCommand} from "./types";

/**
 * Schema for runAlgorithm parameters.
 */
const runAlgorithmParamsSchema = z.object({
    namespace: z.string().describe("The namespace of the algorithm (e.g., 'graphty')"),
    type: z.string().describe("The type of algorithm to run (e.g., 'degree', 'pagerank')"),
});

/**
 * Schema for listAlgorithms parameters.
 */
const listAlgorithmsParamsSchema = z.object({
    namespace: z.string().optional().describe("Optional namespace to filter algorithms by"),
});

/**
 * Run a graph algorithm.
 */
export const runAlgorithm: GraphCommand = {
    name: "runAlgorithm",
    description: "Run a graph algorithm to analyze the graph structure. Available algorithms include degree centrality, pagerank, and others that compute metrics for nodes and edges.",
    parameters: runAlgorithmParamsSchema,
    examples: [
        {
            input: "Calculate the degree of each node",
            params: {namespace: "graphty", type: "degree"},
        },
        {
            input: "Run pagerank algorithm",
            params: {namespace: "graphty", type: "pagerank"},
        },
        {
            input: "Compute centrality metrics",
            params: {namespace: "graphty", type: "degree"},
        },
    ],

    async execute(
        graph: Graph,
        params: Record<string, unknown>,
    ): Promise<CommandResult> {
        const parsed = runAlgorithmParamsSchema.safeParse(params);
        if (!parsed.success) {
            return {
                success: false,
                message: `Invalid parameters: ${parsed.error.message}`,
            };
        }

        const {namespace, type} = parsed.data;

        try {
            // Check if algorithm exists
            const alg = Algorithm.get(graph, namespace, type);
            if (!alg) {
                const available = Algorithm.getRegisteredAlgorithms(namespace);
                const errorMessage = available.length > 0 ?
                    `Available in namespace '${namespace}': ${available.map((a) => a.split(":")[1]).join(", ")}` :
                    `No algorithms found in namespace '${namespace}'. Use listAlgorithms to see available options.`;
                return {
                    success: false,
                    message: `Algorithm not found: ${namespace}:${type}. ${errorMessage}`,
                };
            }

            // Run the algorithm
            await graph.runAlgorithm(namespace, type);

            return {
                success: true,
                message: `Successfully ran ${namespace}:${type} algorithm. Results are now available in node data.`,
                data: {
                    namespace,
                    type,
                    nodeCount: graph.getNodeCount(),
                },
            };
        } catch (error) {
            return {
                success: false,
                message: `Failed to run algorithm ${namespace}:${type}: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    },
};

/**
 * List available graph algorithms.
 */
export const listAlgorithms: GraphCommand = {
    name: "listAlgorithms",
    description: "List all available graph algorithms that can be run on the graph. Optionally filter by namespace.",
    parameters: listAlgorithmsParamsSchema,
    examples: [
        {
            input: "What algorithms are available?",
            params: {},
        },
        {
            input: "List graphty algorithms",
            params: {namespace: "graphty"},
        },
        {
            input: "Show me the available analysis tools",
            params: {},
        },
    ],

    // eslint-disable-next-line @typescript-eslint/require-await
    async execute(
        _graph: Graph,
        params: Record<string, unknown>,
    ): Promise<CommandResult> {
        const parsed = listAlgorithmsParamsSchema.safeParse(params);
        if (!parsed.success) {
            return {
                success: false,
                message: `Invalid parameters: ${parsed.error.message}`,
            };
        }

        const {namespace} = parsed.data;

        try {
            const algorithms = Algorithm.getRegisteredAlgorithms(namespace);

            if (algorithms.length === 0) {
                const noAlgMessage = namespace ?
                    `No algorithms found in namespace '${namespace}'.` :
                    "No algorithms are currently registered.";
                return {
                    success: true,
                    message: noAlgMessage,
                    data: {
                        algorithms: [],
                        count: 0,
                    },
                };
            }

            const message = namespace ?
                `Found ${algorithms.length} algorithm(s) in namespace '${namespace}': ${algorithms.join(", ")}` :
                `Found ${algorithms.length} available algorithm(s): ${algorithms.join(", ")}`;

            return {
                success: true,
                message,
                data: {
                    algorithms,
                    count: algorithms.length,
                },
            };
        } catch (error) {
            return {
                success: false,
                message: `Failed to list algorithms: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    },
};
