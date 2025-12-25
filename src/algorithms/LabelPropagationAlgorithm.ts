import {labelPropagation} from "@graphty/algorithms";
import {z} from "zod/v4";

import {defineOptions, type OptionsSchema as ZodOptionsSchema, type SuggestedStylesConfig} from "../config";
import {Algorithm} from "./Algorithm";
import type {OptionsSchema} from "./types/OptionSchema";
import {countUniqueCommunities} from "./utils/communityUtils";
import {toAlgorithmGraph} from "./utils/graphConverter";

/**
 * Zod-based options schema for Label Propagation algorithm
 */
export const labelPropagationOptionsSchema = defineOptions({
    maxIterations: {
        schema: z.number().int().min(1).max(500).default(100),
        meta: {
            label: "Max Iterations",
            description: "Maximum label propagation rounds",
        },
    },
    randomSeed: {
        schema: z.number().int().min(0).max(2147483647).default(42),
        meta: {
            label: "Random Seed",
            description: "Seed for reproducible tie-breaking",
            advanced: true,
        },
    },
});

/**
 * Options for the Label Propagation community detection algorithm
 */
export interface LabelPropagationOptions extends Record<string, unknown> {
    /** Maximum label propagation rounds */
    maxIterations: number;
    /** Seed for reproducible tie-breaking */
    randomSeed: number;
}

/**
 *
 */
export class LabelPropagationAlgorithm extends Algorithm<LabelPropagationOptions> {
    static namespace = "graphty";
    static type = "label-propagation";

    static zodOptionsSchema: ZodOptionsSchema = labelPropagationOptionsSchema;

    static optionsSchema: OptionsSchema = {
        maxIterations: {
            type: "integer",
            default: 100,
            label: "Max Iterations",
            description: "Maximum label propagation rounds",
            min: 1,
            max: 500,
        },
        randomSeed: {
            type: "integer",
            default: 42,
            label: "Random Seed",
            description: "Seed for reproducible tie-breaking",
            min: 0,
            max: 2147483647,
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
                        inputs: ["algorithmResults.graphty.label-propagation.communityId"],
                        output: "style.texture.color",
                        expr: "{ return StyleHelpers.color.categorical.pastel(arguments[0] ?? 0) }",
                    },
                },
                metadata: {
                    name: "Label Propagation - Pastel Colors",
                    description: "8 soft pastel community colors",
                },
            },
        ],
        description: "Visualizes communities detected via fast label propagation",
        category: "grouping",
    });

    /**
     * Executes the label propagation algorithm on the graph
     *
     * Detects communities by propagating labels through the network.
     */
    async run(): Promise<void> {
        const g = this.graph;
        const nodes = Array.from(g.getDataManager().nodes.keys());

        if (nodes.length === 0) {
            return;
        }

        // Get options from schema
        const {maxIterations, randomSeed} = this.schemaOptions;

        // Convert to @graphty/algorithms Graph format (undirected for community detection)
        const graphData = toAlgorithmGraph(g, {addReverseEdges: false});

        // Run Label Propagation algorithm - accepts Graph directly in new version
        const result = labelPropagation(graphData, {
            maxIterations,
            randomSeed,
        });

        // Store results on nodes
        for (const nodeId of nodes) {
            const communityId = result.communities.get(String(nodeId)) ?? 0;
            this.addNodeResult(nodeId, "communityId", communityId);
        }

        // Store graph-level results
        this.addGraphResult("communityCount", countUniqueCommunities(result.communities));
        this.addGraphResult("converged", result.converged);
        this.addGraphResult("iterations", result.iterations);
    }
}

// Auto-register this algorithm when the module is imported
Algorithm.register(LabelPropagationAlgorithm);
