/**
 * Schema Commands Module - Commands for exploring graph data schemas.
 * @module ai/commands/SchemaCommands
 */

import {z} from "zod";

import type {Graph} from "../../Graph";
import {
    analyzeDominantType,
    calculateStatistics,
    collectPropertyValues,
    generateHistogram,
    getAvailableProperties,
    getNestedProperty,
    truncateObjectStrings,
} from "../schema/utils";
import type {CommandResult, GraphCommand} from "./types";

/**
 * Target type for sampling - nodes, edges, or both.
 */
const SampleTargetSchema = z.enum(["nodes", "edges", "both"]).optional()
    .describe("What to sample: 'nodes', 'edges', or 'both' (default)");

/**
 * Sample node representation returned by sampleData.
 */
interface SampleNode {
    id: string;
    data: Record<string, unknown>;
}

/**
 * Sample edge representation returned by sampleData.
 */
interface SampleEdge {
    id: string;
    source: string;
    target: string;
    data: Record<string, unknown>;
}

/**
 * Default number of samples to return.
 */
const DEFAULT_SAMPLE_COUNT = 3;

/**
 * Maximum number of samples that can be requested.
 */
const MAX_SAMPLE_COUNT = 10;

/**
 * Maximum length for truncated string values.
 */
const MAX_STRING_LENGTH = 100;

/**
 * Perform random sampling from an array.
 * @param items - Array of items to sample from
 * @param count - Number of items to sample
 * @returns Array of randomly sampled items
 */
function randomSample<T>(items: T[], count: number): T[] {
    if (items.length <= count) {
        return [... items];
    }

    // Fisher-Yates shuffle for first `count` items
    const result = [... items];
    for (let i = 0; i < count; i++) {
        const j = i + Math.floor(Math.random() * (result.length - i));
        [result[i], result[j]] = [result[j], result[i]];
    }

    return result.slice(0, count);
}

/**
 * Perform stratified sampling based on a property value.
 * @param items - Array of items to sample from
 * @param count - Total number of items to sample
 * @param getStratumKey - Function to extract the stratum key from an item
 * @returns Array of stratified sampled items
 */
function stratifiedSample<T>(
    items: T[],
    count: number,
    getStratumKey: (item: T) => string | undefined,
): T[] {
    if (items.length <= count) {
        return [... items];
    }

    // Group items by stratum
    const strata = new Map<string, T[]>();
    const unkeyed: T[] = [];

    for (const item of items) {
        const key = getStratumKey(item);
        if (key === undefined) {
            unkeyed.push(item);
        } else {
            const stratum = strata.get(key) ?? [];
            stratum.push(item);
            strata.set(key, stratum);
        }
    }

    // Calculate samples per stratum
    const stratumCount = strata.size + (unkeyed.length > 0 ? 1 : 0);
    if (stratumCount === 0) {
        return randomSample(items, count);
    }

    const samplesPerStratum = Math.max(1, Math.floor(count / stratumCount));
    const result: T[] = [];

    // Sample from each stratum
    for (const stratumItems of strata.values()) {
        const sampled = randomSample(stratumItems, samplesPerStratum);
        result.push(... sampled);
    }

    // Sample from unkeyed items
    if (unkeyed.length > 0) {
        const sampled = randomSample(unkeyed, samplesPerStratum);
        result.push(... sampled);
    }

    // If we haven't filled count yet, sample more randomly
    if (result.length < count) {
        const remaining = items.filter((item) => !result.includes(item));
        const additional = randomSample(remaining, count - result.length);
        result.push(... additional);
    }

    return result.slice(0, count);
}

/**
 * Command to get sample data from the graph.
 * Returns sample nodes and/or edges for LLMs to inspect actual data structures.
 */
export const sampleData: GraphCommand = {
    name: "sampleData",
    description: "Get sample nodes and/or edges from the graph to inspect actual data structures. Useful for understanding what properties exist and what values they contain before writing selectors.",
    parameters: z.object({
        target: SampleTargetSchema,
        count: z.number().min(1).max(MAX_SAMPLE_COUNT).optional()
            .describe(`Number of samples to return per type (1-${MAX_SAMPLE_COUNT}, default ${DEFAULT_SAMPLE_COUNT})`),
        stratifyBy: z.string().optional()
            .describe("Property path to stratify sampling by (e.g., 'data.type' to sample from each type)"),
    }),
    examples: [
        {input: "Show me some example nodes", params: {target: "nodes"}},
        {input: "Show me 5 sample edges", params: {target: "edges", count: 5}},
        {input: "Get sample data from the graph", params: {}},
        {input: "Show me node samples from each type", params: {target: "nodes", count: 6, stratifyBy: "data.type"}},
    ],

    execute(
        graph: Graph,
        params: Record<string, unknown>,
    ): Promise<CommandResult> {
        const {
            target = "both",
            count = DEFAULT_SAMPLE_COUNT,
            stratifyBy,
        } = params as {
            target?: "nodes" | "edges" | "both";
            count?: number;
            stratifyBy?: string;
        };

        try {
            const dataManager = graph.getDataManager();
            const result: {nodes?: SampleNode[], edges?: SampleEdge[]} = {};

            // Sample nodes
            if (target === "nodes" || target === "both") {
                const nodes = Array.from(dataManager.nodes.values());
                let sampledNodes: typeof nodes;

                if (stratifyBy) {
                    sampledNodes = stratifiedSample(
                        nodes,
                        count,
                        (node) => {
                            const value = getNestedProperty(node.data, stratifyBy);
                            return typeof value === "string" ? value : undefined;
                        },
                    );
                } else {
                    sampledNodes = randomSample(nodes, count);
                }

                result.nodes = sampledNodes.map((node) => ({
                    id: String(node.id),
                    data: truncateObjectStrings(node.data, MAX_STRING_LENGTH),
                }));
            }

            // Sample edges
            if (target === "edges" || target === "both") {
                const edges = Array.from(dataManager.edges.values());
                let sampledEdges: typeof edges;

                if (stratifyBy) {
                    sampledEdges = stratifiedSample(
                        edges,
                        count,
                        (edge) => {
                            const value = getNestedProperty(edge.data, stratifyBy);
                            return typeof value === "string" ? value : undefined;
                        },
                    );
                } else {
                    sampledEdges = randomSample(edges, count);
                }

                result.edges = sampledEdges.map((edge) => ({
                    id: String(edge.id),
                    source: String(edge.srcId),
                    target: String(edge.dstId),
                    data: truncateObjectStrings(edge.data, MAX_STRING_LENGTH),
                }));
            }

            // Build message
            const parts: string[] = [];
            if (result.nodes) {
                parts.push(`${result.nodes.length} node sample${result.nodes.length !== 1 ? "s" : ""}`);
            }

            if (result.edges) {
                parts.push(`${result.edges.length} edge sample${result.edges.length !== 1 ? "s" : ""}`);
            }

            return Promise.resolve({
                success: true,
                message: `Returned ${parts.join(" and ")}.`,
                data: result,
            });
        } catch (error) {
            return Promise.resolve({
                success: false,
                message: `Failed to sample data: ${(error as Error).message}`,
            });
        }
    },
};

/**
 * Default limit for unique values displayed.
 */
const DEFAULT_VALUE_LIMIT = 20;

/**
 * Maximum limit for unique values.
 */
const MAX_VALUE_LIMIT = 50;

/**
 * Number of histogram bins to create.
 */
const HISTOGRAM_BINS = 5;

/**
 * Result interface for string property analysis.
 */
interface StringPropertyResult {
    property: string;
    target: "nodes" | "edges";
    type: "string";
    totalCount: number;
    nullCount: number;
    uniqueCount: number;
    distribution: Record<string, {count: number, percentage: number}>;
    truncated: boolean;
}

/**
 * Result interface for number property analysis.
 */
interface NumberPropertyResult {
    property: string;
    target: "nodes" | "edges";
    type: "number";
    totalCount: number;
    nullCount: number;
    statistics: {min: number, max: number, avg: number, median: number};
    histogram: {range: string, count: number}[];
}

/**
 * Count and percentage tuple for distribution.
 */
interface CountPercentage {
    count: number;
    percentage: number;
}

/**
 * Result interface for boolean property analysis.
 */
interface BooleanPropertyResult {
    property: string;
    target: "nodes" | "edges";
    type: "boolean";
    totalCount: number;
    nullCount: number;
    distribution: {
        true: CountPercentage;
        false: CountPercentage;
    };
}

/**
 * Result interface for array property analysis.
 */
interface ArrayPropertyResult {
    property: string;
    target: "nodes" | "edges";
    type: "array";
    totalCount: number;
    nullCount: number;
    itemType: string;
    uniqueItems: string[];
    uniqueItemCount: number;
    lengthStatistics: {min: number, max: number, avg: number};
    truncated: boolean;
}

/**
 * Result interface for mixed type property analysis.
 */
interface MixedPropertyResult {
    property: string;
    target: "nodes" | "edges";
    type: "mixed";
    totalCount: number;
    nullCount: number;
    typeCounts: Record<string, number>;
}

/**
 * Analyze string property values.
 * @param property - Name of the property
 * @param target - Whether analyzing nodes or edges
 * @param values - Array of property values
 * @param nullCount - Count of null values
 * @param limit - Maximum number of unique values to include
 * @returns Analysis result for string property
 */
function analyzeStringProperty(
    property: string,
    target: "nodes" | "edges",
    values: unknown[],
    nullCount: number,
    limit: number,
): StringPropertyResult {
    const stringValues = values.filter((v): v is string => typeof v === "string");
    const valueCounts = new Map<string, number>();

    for (const value of stringValues) {
        valueCounts.set(value, (valueCounts.get(value) ?? 0) + 1);
    }

    // Sort by count descending
    const sortedEntries = Array.from(valueCounts.entries())
        .sort((a, b) => b[1] - a[1]);

    const truncated = sortedEntries.length > limit;
    const limitedEntries = sortedEntries.slice(0, limit);

    const distribution: Record<string, {count: number, percentage: number}> = {};
    for (const [value, count] of limitedEntries) {
        distribution[value] = {
            count,
            percentage: (count / stringValues.length) * 100,
        };
    }

    return {
        property,
        target,
        type: "string",
        totalCount: stringValues.length + nullCount,
        nullCount,
        uniqueCount: valueCounts.size,
        distribution,
        truncated,
    };
}

/**
 * Analyze number property values.
 * @param property - Name of the property
 * @param target - Whether analyzing nodes or edges
 * @param values - Array of property values
 * @param nullCount - Count of null values
 * @returns Analysis result for number property
 */
function analyzeNumberProperty(
    property: string,
    target: "nodes" | "edges",
    values: unknown[],
    nullCount: number,
): NumberPropertyResult {
    const numericValues = values.filter((v): v is number => typeof v === "number");
    const stats = calculateStatistics(numericValues);
    const histogram = generateHistogram(numericValues, HISTOGRAM_BINS);

    return {
        property,
        target,
        type: "number",
        totalCount: numericValues.length + nullCount,
        nullCount,
        statistics: {
            min: stats.min,
            max: stats.max,
            avg: stats.avg,
            median: stats.median,
        },
        histogram: histogram.map((bin) => ({
            range: bin.range,
            count: bin.count,
        })),
    };
}

/**
 * Analyze boolean property values.
 * @param property - Name of the property
 * @param target - Whether analyzing nodes or edges
 * @param values - Array of property values
 * @param nullCount - Count of null values
 * @returns Analysis result for boolean property
 */
function analyzeBooleanProperty(
    property: string,
    target: "nodes" | "edges",
    values: unknown[],
    nullCount: number,
): BooleanPropertyResult {
    const booleanValues = values.filter((v): v is boolean => typeof v === "boolean");
    const trueCount = booleanValues.filter((v) => v).length;
    const falseCount = booleanValues.length - trueCount;

    return {
        property,
        target,
        type: "boolean",
        totalCount: booleanValues.length + nullCount,
        nullCount,
        distribution: {
            true: {
                count: trueCount,
                percentage: booleanValues.length > 0 ? (trueCount / booleanValues.length) * 100 : 0,
            },
            false: {
                count: falseCount,
                percentage: booleanValues.length > 0 ? (falseCount / booleanValues.length) * 100 : 0,
            },
        },
    };
}

/**
 * Analyze array property values.
 * @param property - Name of the property
 * @param target - Whether analyzing nodes or edges
 * @param values - Array of property values
 * @param nullCount - Count of null values
 * @param limit - Maximum number of samples to include
 * @returns Analysis result for array property
 */
function analyzeArrayProperty(
    property: string,
    target: "nodes" | "edges",
    values: unknown[],
    nullCount: number,
    limit: number,
): ArrayPropertyResult {
    const arrayValues = values.filter((v): v is unknown[] => Array.isArray(v));

    // Collect unique items and determine item type
    const allItems: unknown[] = [];
    const lengths: number[] = [];

    for (const arr of arrayValues) {
        lengths.push(arr.length);
        allItems.push(... arr);
    }

    // Determine item type
    const itemType = analyzeDominantType(allItems);

    // Collect unique string representations
    const uniqueSet = new Set<string>();
    for (const item of allItems) {
        if (typeof item === "string") {
            uniqueSet.add(item);
        } else if (typeof item === "number" || typeof item === "boolean") {
            uniqueSet.add(String(item));
        } else if (item !== null && item !== undefined) {
            uniqueSet.add(JSON.stringify(item));
        }
    }

    const uniqueItems = Array.from(uniqueSet);
    const truncated = uniqueItems.length > limit;

    // Calculate length statistics
    const lengthStats = calculateStatistics(lengths);

    return {
        property,
        target,
        type: "array",
        totalCount: arrayValues.length + nullCount,
        nullCount,
        itemType,
        uniqueItems: uniqueItems.slice(0, limit),
        uniqueItemCount: uniqueItems.length,
        lengthStatistics: {
            min: lengthStats.min,
            max: lengthStats.max,
            avg: lengthStats.avg,
        },
        truncated,
    };
}

/**
 * Analyze mixed type property values.
 * @param property - Name of the property
 * @param target - Whether analyzing nodes or edges
 * @param values - Array of property values
 * @param nullCount - Count of null values
 * @returns Analysis result for mixed type property
 */
function analyzeMixedProperty(
    property: string,
    target: "nodes" | "edges",
    values: unknown[],
    nullCount: number,
): MixedPropertyResult {
    const typeCounts: Record<string, number> = {};

    for (const value of values) {
        const type = typeof value;
        if (Array.isArray(value)) {
            typeCounts.array = (typeCounts.array || 0) + 1;
        } else if (type === "object" && value !== null) {
            typeCounts.object = (typeCounts.object || 0) + 1;
        } else if (type === "string" || type === "number" || type === "boolean") {
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        }
    }

    return {
        property,
        target,
        type: "mixed",
        totalCount: values.length + nullCount,
        nullCount,
        typeCounts,
    };
}

/**
 * Command to describe a specific property in detail.
 * Provides statistics, distributions, and value information for analysis.
 */
export const describeProperty: GraphCommand = {
    name: "describeProperty",
    description: "Get detailed information about a specific property in node or edge data. Returns value distributions for strings, statistics for numbers, counts for booleans, and unique items for arrays.",
    parameters: z.object({
        property: z.string()
            .describe("Property path to analyze (e.g., 'type', 'data.category', 'weight')"),
        target: z.enum(["nodes", "edges"]).optional()
            .describe("Whether to analyze node or edge properties (default: 'nodes')"),
        limit: z.number().min(1).max(MAX_VALUE_LIMIT).optional()
            .describe(`Maximum number of unique values to show (1-${MAX_VALUE_LIMIT}, default ${DEFAULT_VALUE_LIMIT})`),
    }),
    examples: [
        {input: "Describe the type property on nodes", params: {property: "type", target: "nodes"}},
        {input: "What values does the weight property have on edges?", params: {property: "weight", target: "edges"}},
        {input: "Show me the distribution of data.category", params: {property: "data.category"}},
        {input: "Analyze the tags property", params: {property: "tags", limit: 10}},
    ],

    execute(
        graph: Graph,
        params: Record<string, unknown>,
    ): Promise<CommandResult> {
        const {
            property,
            target = "nodes",
            limit = DEFAULT_VALUE_LIMIT,
        } = params as {
            property: string;
            target?: "nodes" | "edges";
            limit?: number;
        };

        try {
            const dataManager = graph.getDataManager();
            const items = target === "nodes" ?
                Array.from(dataManager.nodes.values()) :
                Array.from(dataManager.edges.values());

            // Check if items exist
            if (items.length === 0) {
                return Promise.resolve({
                    success: false,
                    message: `No ${target} found in the graph.`,
                });
            }

            // Collect values for the property
            const {values, nullCount} = collectPropertyValues(items, property);

            // If all values are null/undefined, the property doesn't exist
            if (values.length === 0 && nullCount === items.length) {
                // Get available properties to suggest
                const availableProperties = getAvailableProperties(items);
                return Promise.resolve({
                    success: false,
                    message: `Property "${property}" not found on ${target}. Available properties: ${availableProperties.slice(0, 10).join(", ")}${availableProperties.length > 10 ? "..." : ""}`,
                    data: {
                        availableProperties: availableProperties.slice(0, 20),
                    },
                });
            }

            // Determine the dominant type
            const dominantType = analyzeDominantType(values);

            // Analyze based on type
            let result:
                | StringPropertyResult
                | NumberPropertyResult
                | BooleanPropertyResult
                | ArrayPropertyResult
                | MixedPropertyResult;

            switch (dominantType) {
                case "string":
                    result = analyzeStringProperty(property, target, values, nullCount, limit);
                    break;
                case "number":
                    result = analyzeNumberProperty(property, target, values, nullCount);
                    break;
                case "boolean":
                    result = analyzeBooleanProperty(property, target, values, nullCount);
                    break;
                case "array":
                    result = analyzeArrayProperty(property, target, values, nullCount, limit);
                    break;
                case "mixed":
                    result = analyzeMixedProperty(property, target, values, nullCount);
                    break;
                default:
                    return Promise.resolve({
                        success: false,
                        message: `Could not analyze property "${property}" - no valid values found.`,
                    });
            }

            // Build message based on type
            let message: string;
            switch (dominantType) {
                case "string": {
                    const strResult = result as StringPropertyResult;
                    message = `Property "${property}" is a string with ${strResult.uniqueCount} unique value${strResult.uniqueCount !== 1 ? "s" : ""}.`;
                    break;
                }

                case "number": {
                    const numResult = result as NumberPropertyResult;
                    message = `Property "${property}" is a number (min: ${numResult.statistics.min.toFixed(2)}, max: ${numResult.statistics.max.toFixed(2)}, avg: ${numResult.statistics.avg.toFixed(2)}).`;
                    break;
                }

                case "boolean": {
                    const boolResult = result as BooleanPropertyResult;
                    message = `Property "${property}" is a boolean (true: ${boolResult.distribution.true.percentage.toFixed(1)}%, false: ${boolResult.distribution.false.percentage.toFixed(1)}%).`;
                    break;
                }

                case "array": {
                    const arrResult = result as ArrayPropertyResult;
                    message = `Property "${property}" is an array of ${arrResult.itemType} values with ${arrResult.uniqueItemCount} unique item${arrResult.uniqueItemCount !== 1 ? "s" : ""}.`;
                    break;
                }

                case "mixed": {
                    const mixResult = result as MixedPropertyResult;
                    const types = Object.keys(mixResult.typeCounts).join(", ");
                    message = `Property "${property}" has mixed types: ${types}.`;
                    break;
                }

                default:
                    message = `Property "${property}" analyzed successfully.`;
            }

            return Promise.resolve({
                success: true,
                message,
                data: result,
            });
        } catch (error) {
            return Promise.resolve({
                success: false,
                message: `Failed to describe property: ${(error as Error).message}`,
            });
        }
    },
};
