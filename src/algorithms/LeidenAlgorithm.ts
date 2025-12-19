import {leiden} from "@graphty/algorithms";
import {z} from "zod/v4";

import {defineOptions, type OptionsSchema as ZodOptionsSchema, type SuggestedStylesConfig} from "../config";
import {Algorithm} from "./Algorithm";
import type {OptionsSchema} from "./types/OptionSchema";
import {countUniqueCommunities} from "./utils/communityUtils";
import {toAlgorithmGraph} from "./utils/graphConverter";

/**
 * Zod-based options schema for Leiden algorithm
 */
export const leidenOptionsSchema = defineOptions({
    resolution: {
        schema: z.number().min(0.1).max(5.0).default(1.0),
        meta: {
            label: "Resolution",
            description: "Controls community granularity",
            step: 0.1,
        },
    },
    randomSeed: {
        schema: z.number().int().min(0).max(2147483647).default(42),
        meta: {
            label: "Random Seed",
            description: "Seed for reproducible results",
            advanced: true,
        },
    },
    maxIterations: {
        schema: z.number().int().min(1).max(500).default(100),
        meta: {
            label: "Max Iterations",
            description: "Maximum refinement iterations",
            advanced: true,
        },
    },
    threshold: {
        schema: z.number().min(1e-10).max(0.01).default(1e-6),
        meta: {
            label: "Threshold",
            description: "Convergence threshold",
            advanced: true,
        },
    },
});

/**
 * Options for the Leiden community detection algorithm
 */
export interface LeidenOptions extends Record<string, unknown> {
    /** Controls community granularity */
    resolution: number;
    /** Seed for reproducible results */
    randomSeed: number;
    /** Maximum refinement iterations */
    maxIterations: number;
    /** Convergence threshold */
    threshold: number;
}

export class LeidenAlgorithm extends Algorithm<LeidenOptions> {
    static namespace = "graphty";
    static type = "leiden";

    static zodOptionsSchema: ZodOptionsSchema = leidenOptionsSchema;

    static optionsSchema: OptionsSchema = {
        resolution: {
            type: "number",
            default: 1.0,
            label: "Resolution",
            description: "Controls community granularity",
            min: 0.1,
            max: 5.0,
            step: 0.1,
        },
        randomSeed: {
            type: "integer",
            default: 42,
            label: "Random Seed",
            description: "Seed for reproducible results",
            min: 0,
            max: 2147483647,
            advanced: true,
        },
        maxIterations: {
            type: "integer",
            default: 100,
            label: "Max Iterations",
            description: "Maximum refinement iterations",
            min: 1,
            max: 500,
            advanced: true,
        },
        threshold: {
            type: "number",
            default: 1e-6,
            label: "Threshold",
            description: "Convergence threshold",
            min: 1e-10,
            max: 0.01,
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
                        inputs: ["algorithmResults.graphty.leiden.communityId"],
                        output: "style.texture.color",
                        expr: "{ return StyleHelpers.color.categorical.tolMuted(arguments[0] ?? 0) }",
                    },
                },
                metadata: {
                    name: "Leiden - Muted Colors",
                    description: "7 subdued professional community colors",
                },
            },
        ],
        description: "Visualizes communities detected via Leiden algorithm (improved Louvain)",
        category: "grouping",
    });

    // eslint-disable-next-line @typescript-eslint/require-await
    async run(): Promise<void> {
        const g = this.graph;
        const nodes = Array.from(g.getDataManager().nodes.keys());

        if (nodes.length === 0) {
            return;
        }

        // Get options from schema
        const {resolution, maxIterations, threshold} = this.schemaOptions;

        // Convert to @graphty/algorithms Graph format (undirected for community detection)
        const graphData = toAlgorithmGraph(g, {addReverseEdges: false});

        // Run Leiden algorithm - returns {communities: Map<string, number>, modularity, iterations}
        const result = leiden(graphData, {
            resolution,
            maxIterations,
            threshold,
        });

        // Store results on nodes
        for (const nodeId of nodes) {
            const communityId = result.communities.get(String(nodeId)) ?? 0;
            this.addNodeResult(nodeId, "communityId", communityId);
        }

        // Store graph-level results
        this.addGraphResult("modularity", result.modularity);
        this.addGraphResult("communityCount", countUniqueCommunities(result.communities));
        this.addGraphResult("iterations", result.iterations);
    }
}

// Auto-register this algorithm when the module is imported
Algorithm.register(LeidenAlgorithm);
