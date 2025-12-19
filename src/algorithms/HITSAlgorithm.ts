import {hits} from "@graphty/algorithms";
import {z} from "zod/v4";

import {defineOptions, type OptionsSchema as ZodOptionsSchema, type SuggestedStylesConfig} from "../config";
import {Algorithm} from "./Algorithm";
import type {OptionsSchema} from "./types/OptionSchema";
import {toAlgorithmGraph} from "./utils/graphConverter";

/**
 * Zod-based options schema for HITS algorithm
 */
export const hitsOptionsSchema = defineOptions({
    maxIterations: {
        schema: z.number().int().min(1).max(1000).default(100),
        meta: {
            label: "Max Iterations",
            description: "Maximum iterations for hub/authority computation",
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
            description: "Whether to normalize the final hub/authority scores",
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
 * Options for the HITS algorithm
 */
export interface HITSOptions extends Record<string, unknown> {
    /** Maximum iterations for hub/authority computation */
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
 * HITS (Hyperlink-Induced Topic Search) Algorithm
 *
 * Identifies hub and authority scores for nodes in a graph:
 * - Authorities: nodes with valuable information (pointed to by hubs)
 * - Hubs: nodes that point to many authorities
 *
 * Results stored per node:
 * - hubScore: Raw hub score
 * - hubScorePct: Normalized hub score in [0, 1] range
 * - authorityScore: Raw authority score
 * - authorityScorePct: Normalized authority score in [0, 1] range
 * - combinedScore: Average of hub and authority scores
 * - combinedScorePct: Normalized combined score in [0, 1] range
 */
export class HITSAlgorithm extends Algorithm<HITSOptions> {
    static namespace = "graphty";
    static type = "hits";

    static zodOptionsSchema: ZodOptionsSchema = hitsOptionsSchema;

    static optionsSchema: OptionsSchema = {
        maxIterations: {
            type: "integer",
            default: 100,
            label: "Max Iterations",
            description: "Maximum iterations for hub/authority computation",
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
            description: "Whether to normalize the final hub/authority scores",
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
                        inputs: ["algorithmResults.graphty.hits.combinedScorePct"],
                        output: "style.texture.color",
                        expr: "{ return StyleHelpers.color.sequential.viridis(arguments[0]) }",
                    },
                },
                metadata: {
                    name: "HITS - Combined Score Color",
                    description: "Viridis gradient based on combined hub/authority importance",
                },
            },
            {
                node: {
                    selector: "",
                    style: {
                        enabled: true,
                    },
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.hits.combinedScorePct"],
                        output: "style.shape.size",
                        expr: "{ return StyleHelpers.size.linear(arguments[0], 1, 4) }",
                    },
                },
                metadata: {
                    name: "HITS - Combined Score Size",
                    description: "Size 1-4 based on combined hub/authority importance",
                },
            },
        ],
        description: "Visualizes hub and authority nodes through combined color and size",
        category: "node-metric",
    });

    // eslint-disable-next-line @typescript-eslint/require-await
    async run(): Promise<void> {
        const g = this.graph;
        const nodes = Array.from(g.getDataManager().nodes.keys());

        if (nodes.length === 0) {
            return;
        }

        // Get options from schema
        const {maxIterations, tolerance, normalized, mode, endpoints} = this.schemaOptions;

        // Convert to @graphty/algorithms format and run
        // HITS works best on directed graphs, but we'll run it anyway
        const graphData = toAlgorithmGraph(g, {directed: true});
        const results = hits(graphData, {
            maxIterations,
            tolerance,
            normalized,
            mode,
            endpoints,
        });

        // Find min/max for min-max normalization
        // This ensures values spread across full 0-1 range for better visual differentiation
        let minHubScore = Infinity;
        let maxHubScore = -Infinity;
        let minAuthorityScore = Infinity;
        let maxAuthorityScore = -Infinity;

        for (const hubScore of Object.values(results.hubs)) {
            minHubScore = Math.min(minHubScore, hubScore);
            maxHubScore = Math.max(maxHubScore, hubScore);
        }
        for (const authorityScore of Object.values(results.authorities)) {
            minAuthorityScore = Math.min(minAuthorityScore, authorityScore);
            maxAuthorityScore = Math.max(maxAuthorityScore, authorityScore);
        }

        // Calculate combined scores and find their range
        const combinedScores = new Map<string | number, number>();
        let minCombinedScore = Infinity;
        let maxCombinedScore = -Infinity;

        for (const nodeId of nodes) {
            const hubScore: number = results.hubs[String(nodeId)] ?? 0;
            const authorityScore: number = results.authorities[String(nodeId)] ?? 0;
            const combinedScore = (hubScore + authorityScore) / 2;

            combinedScores.set(nodeId, combinedScore);
            minCombinedScore = Math.min(minCombinedScore, combinedScore);
            maxCombinedScore = Math.max(maxCombinedScore, combinedScore);
        }

        // Store results with min-max normalization
        const hubRange = maxHubScore - minHubScore;
        const authorityRange = maxAuthorityScore - minAuthorityScore;
        const combinedRange = maxCombinedScore - minCombinedScore;

        for (const nodeId of nodes) {
            const hubScore: number = results.hubs[String(nodeId)] ?? 0;
            const authorityScore: number = results.authorities[String(nodeId)] ?? 0;
            const combinedScore = combinedScores.get(nodeId) ?? 0;

            this.addNodeResult(nodeId, "hubScore", hubScore);
            this.addNodeResult(nodeId, "authorityScore", authorityScore);
            this.addNodeResult(nodeId, "combinedScore", combinedScore);

            this.addNodeResult(nodeId, "hubScorePct", hubRange > 0 ? (hubScore - minHubScore) / hubRange : 0);
            this.addNodeResult(nodeId, "authorityScorePct", authorityRange > 0 ? (authorityScore - minAuthorityScore) / authorityRange : 0);
            this.addNodeResult(nodeId, "combinedScorePct", combinedRange > 0 ? (combinedScore - minCombinedScore) / combinedRange : 0);
        }
    }
}

// Auto-register this algorithm when the module is imported
Algorithm.register(HITSAlgorithm);
