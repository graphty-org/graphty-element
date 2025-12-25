import {type NodeId, pageRank} from "@graphty/algorithms";
import {z} from "zod/v4";

import {defineOptions, type InferOptions, parseOptions, type SuggestedStylesConfig} from "../config";
import {Graph} from "../Graph";
import {Algorithm} from "./Algorithm";
import type {OptionsSchema} from "./types/OptionSchema";
import {toAlgorithmGraph} from "./utils/graphConverter";

/**
 * Zod-based options schema for PageRank algorithm (NEW unified system)
 *
 * This is the new Zod-based schema that provides both validation and UI metadata.
 * It will eventually replace the legacy optionsSchema.
 */
export const pageRankOptionsSchema = defineOptions({
    dampingFactor: {
        schema: z.number().min(0).max(1).default(0.85),
        meta: {
            label: "Damping Factor",
            description: "Probability of following a link (0.85 is standard for web graphs)",
            step: 0.05,
        },
    },
    maxIterations: {
        schema: z.number().int().min(1).max(1000).default(100),
        meta: {
            label: "Max Iterations",
            description: "Maximum power iterations before stopping",
            advanced: true,
        },
    },
    tolerance: {
        schema: z.number().min(1e-10).max(0.1).default(1e-6),
        meta: {
            label: "Tolerance",
            description: "Convergence threshold for early stopping",
            advanced: true,
        },
    },
    weight: {
        schema: z.string().nullable().default(null),
        meta: {
            label: "Weight Attribute",
            description: "Edge attribute name for weighted PageRank (empty = unweighted)",
            advanced: true,
        },
    },
    useDelta: {
        schema: z.boolean().default(true),
        meta: {
            label: "Use Delta Optimization",
            description: "Use delta-based optimization for faster convergence on large graphs",
            advanced: true,
        },
    },
});

/**
 * Inferred options type from the Zod schema
 */
export type PageRankSchemaOptions = InferOptions<typeof pageRankOptionsSchema>;

/**
 * Options for the PageRank algorithm
 *
 * Extends the schema options with programmatic-only options that can't be
 * represented in the schema (Map types).
 */
export interface PageRankOptions extends PageRankSchemaOptions, Record<string, unknown> {
    /** Initial PageRank values for nodes (programmatic only, not in schema) */
    initialRanks?: Map<NodeId, number> | null;
    /** Personalization vector for Personalized PageRank (programmatic only, not in schema) */
    personalization?: Map<NodeId, number> | null;
}

/**
 * PageRank algorithm for measuring node importance
 *
 * Computes the PageRank score for each node based on the graph's link structure.
 * Supports weighted edges, personalization, and delta optimization.
 */
export class PageRankAlgorithm extends Algorithm<PageRankOptions> {
    static namespace = "graphty";
    static type = "pagerank";

    /**
     * NEW: Zod-based options schema for unified validation and UI metadata
     *
     * This is the new system that uses Zod for validation. Access via:
     * - PageRankAlgorithm.zodOptionsSchema (the schema)
     * - pageRankOptionsSchema (exported from module)
     */
    static zodOptionsSchema = pageRankOptionsSchema;

    /**
     * LEGACY: Old-style options schema for backward compatibility
     * @deprecated Use zodOptionsSchema instead. This will be removed in a future version.
     */
    static optionsSchema: OptionsSchema = {
        dampingFactor: {
            type: "number",
            default: 0.85,
            label: "Damping Factor",
            description: "Probability of following a link (0.85 is standard for web graphs)",
            min: 0,
            max: 1,
            step: 0.05,
        },
        maxIterations: {
            type: "integer",
            default: 100,
            label: "Max Iterations",
            description: "Maximum power iterations before stopping",
            min: 1,
            max: 1000,
            advanced: true,
        },
        tolerance: {
            type: "number",
            default: 1e-6,
            label: "Tolerance",
            description: "Convergence threshold for early stopping",
            min: 1e-10,
            max: 0.1,
            advanced: true,
        },
        weight: {
            type: "string",
            default: null as unknown as string,
            label: "Weight Attribute",
            description: "Edge attribute name for weighted PageRank (empty = unweighted)",
            advanced: true,
        },
        useDelta: {
            type: "boolean",
            default: true,
            label: "Use Delta Optimization",
            description: "Use delta-based optimization for faster convergence on large graphs",
            advanced: true,
        },
        // Note: initialRanks and personalization are Map types - programmatic only, not in schema
    };

    /**
     * Resolved options using the NEW Zod-based validation
     */
    private zodOptions: PageRankSchemaOptions;

    /**
     * Creates a new PageRank algorithm instance
     * @param g - The graph to run the algorithm on
     * @param options - Optional configuration options
     */
    constructor(g: Graph, options?: Partial<PageRankOptions>) {
        super(g, options);
        // Use new Zod-based validation for schema options
        this.zodOptions = parseOptions(pageRankOptionsSchema, options ?? {});
    }

    static suggestedStyles = (): SuggestedStylesConfig => ({
        layers: [
            {
                node: {
                    selector: "",
                    style: {
                        enabled: true,
                    },
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.pagerank.rankPct"],
                        output: "style.shape.size",
                        expr: "{ return StyleHelpers.size.linear(arguments[0], 1, 5) }",
                    },
                },
                metadata: {
                    name: "PageRank - Node Size",
                    description: "Size 1-5 based on PageRank importance",
                },
            },
        ],
        description: "Visualizes node importance through size based on PageRank algorithm",
        category: "node-metric",
    });

    /**
     * Executes the PageRank algorithm on the graph
     *
     * Computes PageRank scores for all nodes using the power iteration method.
     */
    async run(): Promise<void> {
        const g = this.graph;
        const nodes = Array.from(g.getDataManager().nodes.keys());

        if (nodes.length === 0) {
            return;
        }

        // Get options from NEW Zod-based schema (validated at construction)
        const {dampingFactor, maxIterations, tolerance, weight, useDelta} = this.zodOptions;
        // Map types are programmatic-only (not in schema) - accessed from legacy options
        const initialRanks = (this._schemaOptions).initialRanks ?? undefined;
        const personalization = (this._schemaOptions).personalization ?? undefined;

        // Convert to @graphty/algorithms format - PageRank requires directed graph
        const graphData = toAlgorithmGraph(g, {directed: true, addReverseEdges: false});

        // Run PageRank algorithm with all options
        const result = pageRank(graphData, {
            dampingFactor,
            maxIterations,
            tolerance,
            weight: weight ?? undefined,
            useDelta,
            initialRanks,
            personalization,
        });

        // Find max rank for normalization
        let maxRank = 0;
        for (const rank of Object.values(result.ranks)) {
            maxRank = Math.max(maxRank, rank);
        }

        // Store results
        for (const nodeId of nodes) {
            const rank = result.ranks[String(nodeId)] ?? 0;
            this.addNodeResult(nodeId, "rank", rank);
            this.addNodeResult(nodeId, "rankPct", maxRank > 0 ? rank / maxRank : 0);
        }

        // Store graph-level results
        this.addGraphResult("iterations", result.iterations);
        this.addGraphResult("converged", result.converged);
        this.addGraphResult("dampingFactor", dampingFactor);
        this.addGraphResult("maxRank", maxRank);
    }
}

// Auto-register this algorithm when the module is imported
Algorithm.register(PageRankAlgorithm);
