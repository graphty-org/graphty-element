import {eigenvectorCentrality} from "@graphty/algorithms";
import {z} from "zod/v4";

import {defineOptions, type OptionsSchema as ZodOptionsSchema, type SuggestedStylesConfig} from "../config";
import {Algorithm} from "./Algorithm";
import type {OptionsSchema} from "./types/OptionSchema";
import {toAlgorithmGraph} from "./utils/graphConverter";

/**
 * Zod-based options schema for Eigenvector Centrality algorithm
 */
export const eigenvectorCentralityOptionsSchema = defineOptions({
    maxIterations: {
        schema: z.number().int().min(1).max(1000).default(100),
        meta: {
            label: "Max Iterations",
            description: "Maximum power iterations",
            advanced: true,
        },
    },
    tolerance: {
        schema: z.number().min(1e-10).max(0.01).default(1e-6),
        meta: {
            label: "Tolerance",
            description: "Convergence threshold",
            advanced: true,
        },
    },
    normalized: {
        schema: z.boolean().default(true),
        meta: {
            label: "Normalized",
            description: "Whether to normalize the final scores",
            advanced: true,
        },
    },
    mode: {
        schema: z.enum(["in", "out", "total"]).default("total"),
        meta: {
            label: "Direction Mode",
            description: "Direction mode for directed graphs",
            advanced: true,
        },
    },
    endpoints: {
        schema: z.boolean().default(false),
        meta: {
            label: "Include Endpoints",
            description: "Whether to include endpoints in path calculations",
            advanced: true,
        },
    },
});

/**
 * Options for the Eigenvector Centrality algorithm
 */
export interface EigenvectorCentralityOptions extends Record<string, unknown> {
    /** Maximum power iterations */
    maxIterations: number;
    /** Convergence threshold */
    tolerance: number;
    /** Whether to normalize the final scores */
    normalized: boolean;
    /** Direction mode for directed graphs: "in", "out", or "total" */
    mode: "in" | "out" | "total";
    /** Whether to include endpoints in path calculations */
    endpoints: boolean;
    /** Custom initial vector for power iteration (programmatic only, not in schema) */
    startVector: Map<string, number> | null;
}

/**
 * Eigenvector Centrality Algorithm
 *
 * Measures the influence of a node based on the influence of its neighbors.
 * A node has high eigenvector centrality if it is connected to other nodes
 * that themselves have high eigenvector centrality.
 *
 * Results stored per node:
 * - score: Raw eigenvector centrality value
 * - scorePct: Normalized value in [0, 1] range (for visualization)
 */
export class EigenvectorCentralityAlgorithm extends Algorithm<EigenvectorCentralityOptions> {
    static namespace = "graphty";
    static type = "eigenvector";

    static zodOptionsSchema: ZodOptionsSchema = eigenvectorCentralityOptionsSchema;

    static optionsSchema: OptionsSchema = {
        maxIterations: {
            type: "integer",
            default: 100,
            label: "Max Iterations",
            description: "Maximum power iterations",
            min: 1,
            max: 1000,
            advanced: true,
        },
        tolerance: {
            type: "number",
            default: 1e-6,
            label: "Tolerance",
            description: "Convergence threshold",
            min: 1e-10,
            max: 0.01,
            advanced: true,
        },
        normalized: {
            type: "boolean",
            default: true,
            label: "Normalized",
            description: "Whether to normalize the final scores",
            advanced: true,
        },
        mode: {
            type: "select",
            default: "total",
            label: "Direction Mode",
            description: "Direction mode for directed graphs",
            options: [
                {value: "total", label: "Total (both directions)"},
                {value: "in", label: "In-degree (incoming edges)"},
                {value: "out", label: "Out-degree (outgoing edges)"},
            ],
            advanced: true,
        },
        endpoints: {
            type: "boolean",
            default: false,
            label: "Include Endpoints",
            description: "Whether to include endpoints in path calculations",
            advanced: true,
        },
        // Note: startVector is a Map type - programmatic only, not in schema
    };

    static suggestedStyles = (): SuggestedStylesConfig => ({
        layers: [
            {
                node: {
                    selector: "",
                    style: {
                        enabled: true,
                    },
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.eigenvector.scorePct"],
                        output: "style.texture.color",
                        expr: "{ return StyleHelpers.color.sequential.oranges(arguments[0]) }",
                    },
                },
                metadata: {
                    name: "Eigenvector - Oranges Gradient",
                    description: "Light orange (low) → Dark orange (high) - shows influence",
                },
            },
        ],
        description: "Visualizes node influence through color based on eigenvector centrality",
        category: "node-metric",
    });

    /**
     * Executes the eigenvector centrality algorithm on the graph
     *
     * Computes eigenvector centrality scores for all nodes using power iteration.
     */
    async run(): Promise<void> {
        const g = this.graph;
        const nodes = Array.from(g.getDataManager().nodes.keys());

        if (nodes.length === 0) {
            return;
        }

        // Get options from schema and programmatic options
        const {maxIterations, tolerance, normalized, mode, endpoints} = this.schemaOptions;
        // Map types are programmatic-only (not in schema)
        const startVector = (this._schemaOptions).startVector ?? undefined;

        // Convert to @graphty/algorithms format and run
        const graphData = toAlgorithmGraph(g);
        const results = eigenvectorCentrality(graphData, {
            normalized,
            maxIterations,
            tolerance,
            mode,
            endpoints,
            startVector,
        });

        // Find min/max for min-max normalization
        // This ensures values spread across full 0-1 range for better visual differentiation
        let minScore = Infinity;
        let maxScore = -Infinity;
        for (const score of Object.values(results)) {
            minScore = Math.min(minScore, score);
            maxScore = Math.max(maxScore, score);
        }

        // Store results with min-max normalization
        const range = maxScore - minScore;
        for (const nodeId of nodes) {
            const score = results[String(nodeId)] ?? 0;
            this.addNodeResult(nodeId, "score", score);
            this.addNodeResult(nodeId, "scorePct", range > 0 ? (score - minScore) / range : 0);
        }
    }
}

// Auto-register this algorithm when the module is imported
Algorithm.register(EigenvectorCentralityAlgorithm);
