import {katzCentrality} from "@graphty/algorithms";
import {z} from "zod/v4";

import {defineOptions, type OptionsSchema as ZodOptionsSchema, type SuggestedStylesConfig} from "../config";
import {Algorithm} from "./Algorithm";
import type {OptionsSchema} from "./types/OptionSchema";
import {toAlgorithmGraph} from "./utils/graphConverter";

/**
 * Zod-based options schema for Katz Centrality algorithm
 */
export const katzCentralityOptionsSchema = defineOptions({
    alpha: {
        schema: z.number().min(0.01).max(0.5).default(0.1),
        meta: {
            label: "Alpha (Attenuation)",
            description: "Attenuation factor - must be less than 1/λmax",
            step: 0.01,
        },
    },
    beta: {
        schema: z.number().min(0).max(10).default(1.0),
        meta: {
            label: "Beta (Base Weight)",
            description: "Base centrality added to each node",
            step: 0.1,
            advanced: true,
        },
    },
    maxIterations: {
        schema: z.number().int().min(1).max(1000).default(100),
        meta: {
            label: "Max Iterations",
            description: "Maximum iterations",
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
 * Options for the Katz Centrality algorithm
 */
export interface KatzCentralityOptions extends Record<string, unknown> {
    /** Attenuation factor - must be less than 1/λmax */
    alpha: number;
    /** Base centrality added to each node */
    beta: number;
    /** Maximum iterations */
    maxIterations: number;
    /** Convergence threshold */
    tolerance: number;
    /** Whether to normalize the final scores */
    normalized: boolean;
    /** Direction mode for directed graphs: "in", "out", or "total" */
    mode: "in" | "out" | "total";
    /** Whether to include endpoints in path calculations */
    endpoints: boolean;
}

/**
 * Katz Centrality Algorithm
 *
 * A generalization of eigenvector centrality that gives each node a base amount
 * of influence regardless of its position in the network. Uses an attenuation
 * factor (alpha) to control how much a node's centrality depends on its neighbors.
 *
 * Results stored per node:
 * - score: Raw Katz centrality value
 * - scorePct: Normalized value in [0, 1] range (for visualization)
 */
export class KatzCentralityAlgorithm extends Algorithm<KatzCentralityOptions> {
    static namespace = "graphty";
    static type = "katz";

    static zodOptionsSchema: ZodOptionsSchema = katzCentralityOptionsSchema;

    static optionsSchema: OptionsSchema = {
        alpha: {
            type: "number",
            default: 0.1,
            label: "Alpha (Attenuation)",
            description: "Attenuation factor - must be less than 1/λmax",
            min: 0.01,
            max: 0.5,
            step: 0.01,
        },
        beta: {
            type: "number",
            default: 1.0,
            label: "Beta (Base Weight)",
            description: "Base centrality added to each node",
            min: 0,
            max: 10,
            step: 0.1,
            advanced: true,
        },
        maxIterations: {
            type: "integer",
            default: 100,
            label: "Max Iterations",
            description: "Maximum iterations",
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
                        inputs: ["algorithmResults.graphty.katz.scorePct"],
                        output: "style.texture.color",
                        expr: "{ return StyleHelpers.color.sequential.blues(arguments[0]) }",
                    },
                },
                metadata: {
                    name: "Katz - Blues Gradient",
                    description: "Light blue (low) → Dark blue (high) - shows attenuated influence",
                },
            },
        ],
        description: "Visualizes node centrality through color based on Katz centrality (attenuated paths)",
        category: "node-metric",
    });

    /**
     * Executes the Katz centrality algorithm on the graph
     *
     * Computes Katz centrality scores for all nodes using matrix iteration.
     */
    async run(): Promise<void> {
        const g = this.graph;
        const nodes = Array.from(g.getDataManager().nodes.keys());

        if (nodes.length === 0) {
            return;
        }

        // Get options from schema
        const {alpha, beta, maxIterations, tolerance, normalized, mode, endpoints} = this.schemaOptions;

        // Convert to @graphty/algorithms format and run
        const graphData = toAlgorithmGraph(g);
        const results = katzCentrality(graphData, {
            normalized,
            alpha,
            beta,
            maxIterations,
            tolerance,
            mode,
            endpoints,
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
Algorithm.register(KatzCentralityAlgorithm);
