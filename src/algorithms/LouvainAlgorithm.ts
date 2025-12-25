import {louvain} from "@graphty/algorithms";
import {z} from "zod/v4";

import {defineOptions, type OptionsSchema as ZodOptionsSchema, type SuggestedStylesConfig} from "../config";
import {Algorithm} from "./Algorithm";
import type {OptionsSchema} from "./types/OptionSchema";
import {toAlgorithmGraph} from "./utils/graphConverter";

/**
 * Zod-based options schema for Louvain algorithm
 */
export const louvainOptionsSchema = defineOptions({
    resolution: {
        schema: z.number().min(0.1).max(5.0).default(1.0),
        meta: {
            label: "Resolution",
            description: "Higher = more communities, lower = fewer larger communities",
            step: 0.1,
        },
    },
    maxIterations: {
        schema: z.number().int().min(1).max(500).default(100),
        meta: {
            label: "Max Iterations",
            description: "Maximum optimization iterations",
            advanced: true,
        },
    },
    tolerance: {
        schema: z.number().min(1e-10).max(0.01).default(1e-6),
        meta: {
            label: "Tolerance",
            description: "Minimum modularity improvement to continue",
            advanced: true,
        },
    },
    useOptimized: {
        schema: z.boolean().default(true),
        meta: {
            label: "Use Optimized",
            description: "Use optimized implementation for better performance on large graphs",
            advanced: true,
        },
    },
});

/**
 * Options for the Louvain community detection algorithm
 */
export interface LouvainOptions extends Record<string, unknown> {
    /** Higher = more communities, lower = fewer larger communities */
    resolution: number;
    /** Maximum optimization iterations */
    maxIterations: number;
    /** Minimum modularity improvement to continue */
    tolerance: number;
    /** Use optimized implementation for better performance on large graphs */
    useOptimized: boolean;
}

/**
 *
 */
export class LouvainAlgorithm extends Algorithm<LouvainOptions> {
    static namespace = "graphty";
    static type = "louvain";

    static zodOptionsSchema: ZodOptionsSchema = louvainOptionsSchema;

    static optionsSchema: OptionsSchema = {
        resolution: {
            type: "number",
            default: 1.0,
            label: "Resolution",
            description: "Higher = more communities, lower = fewer larger communities",
            min: 0.1,
            max: 5.0,
            step: 0.1,
        },
        maxIterations: {
            type: "integer",
            default: 100,
            label: "Max Iterations",
            description: "Maximum optimization iterations",
            min: 1,
            max: 500,
            advanced: true,
        },
        tolerance: {
            type: "number",
            default: 1e-6,
            label: "Tolerance",
            description: "Minimum modularity improvement to continue",
            min: 1e-10,
            max: 0.01,
            advanced: true,
        },
        useOptimized: {
            type: "boolean",
            default: true,
            label: "Use Optimized",
            description: "Use optimized implementation for better performance on large graphs",
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
                        inputs: ["algorithmResults.graphty.louvain.communityId"],
                        output: "style.texture.color",
                        expr: "{ return StyleHelpers.color.categorical.okabeIto(arguments[0] ?? 0) }",
                    },
                },
                metadata: {
                    name: "Louvain - Okabe-Ito Colors",
                    description: "8 vivid colorblind-safe community colors",
                },
            },
        ],
        description: "Visualizes graph communities through distinct colors",
        category: "grouping",
    });

    /**
     * Executes the Louvain algorithm on the graph
     *
     * Detects communities by optimizing modularity in a hierarchical manner.
     */
    async run(): Promise<void> {
        const g = this.graph;
        const nodes = Array.from(g.getDataManager().nodes.keys());

        if (nodes.length === 0) {
            return;
        }

        // Get options from schema
        const {resolution, maxIterations, tolerance, useOptimized} = this.schemaOptions;

        // Convert to @graphty/algorithms format (truly undirected for community detection)
        // addReverseEdges: false creates an undirected graph required by louvain
        const graphData = toAlgorithmGraph(g, {addReverseEdges: false});

        // Run Louvain algorithm
        const result = louvain(graphData, {
            resolution,
            maxIterations,
            tolerance,
            useOptimized,
        });

        // Store community assignments for each node
        const communityMap = new Map<number | string, number>();
        for (let i = 0; i < result.communities.length; i++) {
            for (const nodeId of result.communities[i]) {
                communityMap.set(nodeId, i);
            }
        }

        // Store results on nodes
        for (const nodeId of nodes) {
            const communityId = communityMap.get(nodeId) ?? 0;
            this.addNodeResult(nodeId, "communityId", communityId);
        }
    }
}

// Auto-register this algorithm when the module is imported
Algorithm.register(LouvainAlgorithm);
