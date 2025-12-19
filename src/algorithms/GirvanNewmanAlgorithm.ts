import {girvanNewman} from "@graphty/algorithms";
import {z} from "zod/v4";

import {defineOptions, type OptionsSchema as ZodOptionsSchema, type SuggestedStylesConfig} from "../config";
import {Algorithm} from "./Algorithm";
import type {OptionsSchema} from "./types/OptionSchema";
import {toAlgorithmGraph} from "./utils/graphConverter";

/**
 * Zod-based options schema for Girvan-Newman algorithm
 */
export const girvanNewmanOptionsSchema = defineOptions({
    maxCommunities: {
        schema: z.number().int().min(0).max(100).default(0),
        meta: {
            label: "Max Communities",
            description: "Stop when this many communities reached (0 = find optimal)",
        },
    },
    minCommunitySize: {
        schema: z.number().int().min(1).max(100).default(1),
        meta: {
            label: "Min Community Size",
            description: "Minimum nodes per community",
            advanced: true,
        },
    },
    maxIterations: {
        schema: z.number().int().min(1).max(10000).default(1000),
        meta: {
            label: "Max Iterations",
            description: "Maximum edge removal iterations before stopping",
            advanced: true,
        },
    },
});

/**
 * Options for the Girvan-Newman community detection algorithm
 */
export interface GirvanNewmanOptions extends Record<string, unknown> {
    /** Stop when this many communities reached (0 = find optimal) */
    maxCommunities: number;
    /** Minimum nodes per community */
    minCommunitySize: number;
    /** Maximum edge removal iterations before stopping */
    maxIterations: number;
}

export class GirvanNewmanAlgorithm extends Algorithm<GirvanNewmanOptions> {
    static namespace = "graphty";
    static type = "girvan-newman";

    static zodOptionsSchema: ZodOptionsSchema = girvanNewmanOptionsSchema;

    static optionsSchema: OptionsSchema = {
        maxCommunities: {
            type: "integer",
            default: 0,
            label: "Max Communities",
            description: "Stop when this many communities reached (0 = find optimal)",
            min: 0,
            max: 100,
        },
        minCommunitySize: {
            type: "integer",
            default: 1,
            label: "Min Community Size",
            description: "Minimum nodes per community",
            min: 1,
            max: 100,
            advanced: true,
        },
        maxIterations: {
            type: "integer",
            default: 1000,
            label: "Max Iterations",
            description: "Maximum edge removal iterations before stopping",
            min: 1,
            max: 10000,
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
                        inputs: ["algorithmResults.graphty.girvan-newman.communityId"],
                        output: "style.texture.color",
                        expr: "{ return StyleHelpers.color.categorical.tolVibrant(arguments[0] ?? 0) }",
                    },
                },
                metadata: {
                    name: "Girvan-Newman - Vibrant Colors",
                    description: "7 high-saturation community colors",
                },
            },
        ],
        description: "Visualizes communities detected via edge betweenness removal",
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
        const {maxCommunities, minCommunitySize, maxIterations} = this.schemaOptions;

        // Convert to @graphty/algorithms format (truly undirected for community detection)
        // addReverseEdges: false creates an undirected graph required by girvanNewman
        const graphData = toAlgorithmGraph(g, {addReverseEdges: false});

        // Run Girvan-Newman algorithm - returns CommunityResult[] (dendrogram)
        // Pass maxCommunities only if > 0 (0 means find optimal)
        const results = girvanNewman(graphData, {
            maxCommunities: maxCommunities > 0 ? maxCommunities : undefined,
            minCommunitySize,
            maxIterations,
        });

        // Handle empty results (e.g., graph with no edges)
        if (results.length === 0) {
            // Assign each node to its own community
            for (let i = 0; i < nodes.length; i++) {
                this.addNodeResult(nodes[i], "communityId", i);
            }
            this.addGraphResult("modularity", 0);
            this.addGraphResult("communityCount", nodes.length);
            return;
        }

        // Find the result with highest modularity
        let bestResult = results[0];
        for (const result of results) {
            if (result.modularity > bestResult.modularity) {
                bestResult = result;
            }
        }

        // Store community assignments for each node
        const communityMap = new Map<number | string, number>();
        for (let i = 0; i < bestResult.communities.length; i++) {
            for (const nodeId of bestResult.communities[i]) {
                communityMap.set(nodeId, i);
            }
        }

        // Store results on nodes
        for (const nodeId of nodes) {
            const communityId = communityMap.get(nodeId) ?? 0;
            this.addNodeResult(nodeId, "communityId", communityId);
        }

        // Store graph-level results
        this.addGraphResult("modularity", bestResult.modularity);
        this.addGraphResult("communityCount", bestResult.communities.length);
    }
}

// Auto-register this algorithm when the module is imported
Algorithm.register(GirvanNewmanAlgorithm);
