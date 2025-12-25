/**
 * SchemaExtractor - Extracts schema information from graph data.
 *
 * Uses @jsonhero/schema-infer for type detection, format detection, and number ranges.
 * Adds enum detection using Capital One's DataProfiler algorithm.
 * @module ai/schema/SchemaExtractor
 */

import {inferSchema} from "@jsonhero/schema-infer";

import type {Graph} from "../../Graph";
import type {PropertySummary, PropertyType, SchemaExtractorOptions, SchemaSummary} from "./types";

/**
 * Internal type for schema-infer's InferredSchema.
 * We define this locally to avoid importing internal types.
 */
interface InferredSchema {
    type: "unknown" | "any" | "boolean" | "int" | "float" | "string" | "array" | "object" | "nullable";
    range?: {min: number, max: number};
    format?: {name: string};
    items?: InferredSchema;
    schema?: InferredSchema;
    schemas?: Set<InferredSchema>;
    properties?: {
        required: Record<string, InferredSchema>;
        optional: Record<string, InferredSchema>;
    };
}

/**
 * Interface for the SchemaInferrer instance returned by schema-infer.
 * The second parameter type from the library.
 */
interface SchemaInferrerLike {
    inferredSchema: InferredSchema;
    infer(value: unknown, inference?: SchemaInferrerLike): void;
    toSnapshot(): InferredSchema;
}

/**
 * Default configuration options using Capital One's proven thresholds.
 */
const DEFAULT_OPTIONS: Required<SchemaExtractorOptions> = {
    maxSampleSize: 1000,
    maxDepth: 3,
    enumMaxAbsoluteUnique: 10,
    enumMaxUniqueRatio: 0.2,
    enumMaxStringLength: 64,
    enumMinSampleSize: 25,
};

/**
 * Tracks string values for enum detection using Capital One's algorithm.
 */
class EnumTracker {
    private values = new Map<string, string[]>();
    private options: Required<SchemaExtractorOptions>;

    constructor(options: Required<SchemaExtractorOptions>) {
        this.options = options;
    }

    /**
     * Track a string value for a given property path.
     * @param path - Property path
     * @param value - String value to track
     */
    trackValue(path: string, value: string): void {
        if (!this.values.has(path)) {
            this.values.set(path, []);
        }

        const values = this.values.get(path);

        if (values) {
            values.push(value);
        }
    }

    /**
     * Recursively track string values from an object.
     * @param obj - Object to track values from
     * @param prefix - Property path prefix
     * @param depth - Current recursion depth
     */
    trackObject(obj: Record<string, unknown>, prefix = "", depth = 0): void {
        if (depth >= this.options.maxDepth) {
            return;
        }

        for (const [key, value] of Object.entries(obj)) {
            // Skip 'id' at the top level
            if (prefix === "" && key === "id") {
                continue;
            }

            const path = prefix ? `${prefix}.${key}` : key;

            if (typeof value === "string") {
                this.trackValue(path, value);
            } else if (value !== null && typeof value === "object" && !Array.isArray(value)) {
                this.trackObject(value as Record<string, unknown>, path, depth + 1);
            }
        }
    }

    /**
     * Analyze if a property is likely an enum using Capital One's dual-threshold algorithm.
     *
     * A field is considered categorical if:
     * 1. It has <= enumMaxAbsoluteUnique unique values (default: 10), OR
     * 2. Its unique ratio <= enumMaxUniqueRatio (default: 20%)
     *
     * AND all values are <= enumMaxStringLength characters (default: 64)
     * @param path - Property path to analyze
     * @returns Enum analysis result with isEnum flag and optional values
     */
    getEnumAnalysis(path: string): {isEnum: boolean, values?: string[]} {
        const values = this.values.get(path);

        if (!values || values.length < this.options.enumMinSampleSize) {
            return {isEnum: false};
        }

        const unique = [... new Set(values)];
        const uniqueRatio = unique.length / values.length;

        // Capital One's dual-threshold approach
        const passesCardinalityCheck =
            unique.length <= this.options.enumMaxAbsoluteUnique ||
            uniqueRatio <= this.options.enumMaxUniqueRatio;

        // Our addition: enum values should be short identifiers, not paragraphs
        const allValuesShort = unique.every((v) => v.length <= this.options.enumMaxStringLength);

        if (passesCardinalityCheck && allValuesShort) {
            return {isEnum: true, values: unique.sort()};
        }

        return {isEnum: false};
    }
}

/**
 * Extracts schema information from graph node and edge data.
 *
 * Combines @jsonhero/schema-infer for type/format detection with
 * Capital One's enum detection algorithm.
 */
export class SchemaExtractor {
    private graph: Graph;
    private options: Required<SchemaExtractorOptions>;

    /**
     * Creates a new SchemaExtractor instance.
     * @param graph - The graph to extract schema from
     * @param options - Optional extraction options
     */
    constructor(graph: Graph, options: SchemaExtractorOptions = {}) {
        this.graph = graph;
        this.options = {... DEFAULT_OPTIONS, ... options};
    }

    /**
     * Extract schema from the graph.
     * @returns SchemaSummary with node and edge property information
     */
    extract(): SchemaSummary {
        const dataManager = this.graph.getDataManager();

        // Get counts
        const nodeCount = this.graph.getNodeCount();
        const edgeCount = this.graph.getEdgeCount();

        // Extract node data
        const nodeData = Array.from(dataManager.nodes.values()).map(
            (n) => (n as {data?: Record<string, unknown>}).data,
        ).filter((d): d is Record<string, unknown> => d !== undefined);

        // Extract edge data
        const edgeData = Array.from(dataManager.edges.values()).map(
            (e) => (e as {data?: Record<string, unknown>}).data,
        ).filter((d): d is Record<string, unknown> => d !== undefined);

        return {
            nodeProperties: this.extractFromCollection(nodeData),
            edgeProperties: this.extractFromCollection(edgeData),
            nodeCount,
            edgeCount,
        };
    }

    /**
     * Extract schema from a collection of data objects.
     * @param items - Array of data objects to extract schema from
     * @returns Array of property summaries
     */
    private extractFromCollection(items: Record<string, unknown>[]): PropertySummary[] {
        if (items.length === 0) {
            return [];
        }

        // Sample if too large
        const samples =
            items.length <= this.options.maxSampleSize ?
                items :
                this.sampleEvenly(items, this.options.maxSampleSize);

        // Track 1: Use schema-infer for types, ranges, formats
        // Process first item to initialize the inferrer, then continue with rest
        const [firstItem, ... restItems] = samples;
        let schemaInferrer = inferSchema(firstItem) as unknown as SchemaInferrerLike;

        for (const item of restItems) {
            schemaInferrer = inferSchema(item, schemaInferrer as Parameters<typeof inferSchema>[1]) as unknown as SchemaInferrerLike;
        }

        const inferredSchema = schemaInferrer.toSnapshot();

        // Track 2: Use EnumTracker for enum detection
        const enumTracker = new EnumTracker(this.options);

        for (const item of samples) {
            enumTracker.trackObject(item, "", 0);
        }

        // Merge results
        return this.mergeResults(inferredSchema, enumTracker);
    }

    /**
     * Merge schema-infer results with enum detection results.
     * @param schema - Inferred schema from schema-infer
     * @param enumTracker - Enum tracker with detected categorical values
     * @returns Array of merged property summaries
     */
    private mergeResults(
        schema: InferredSchema,
        enumTracker: EnumTracker,
    ): PropertySummary[] {
        const properties: PropertySummary[] = [];

        if (schema.type === "object" && schema.properties) {
            // Process required properties
            for (const [name, propSchema] of Object.entries(schema.properties.required)) {
                this.extractProperties(name, propSchema, enumTracker, "", false, properties);
            }

            // Process optional properties
            for (const [name, propSchema] of Object.entries(schema.properties.optional)) {
                this.extractProperties(name, propSchema, enumTracker, "", true, properties);
            }
        }

        return properties.sort((a, b) => a.name.localeCompare(b.name));
    }

    /**
     * Recursively extract properties, handling nested objects with dot notation.
     * @param name - Property name
     * @param schema - Inferred schema for the property
     * @param enumTracker - Enum tracker for categorical detection
     * @param prefix - Path prefix for nested properties
     * @param isOptional - Whether the property is optional
     * @param properties - Array to accumulate property summaries
     * @param depth - Current recursion depth
     */
    private extractProperties(
        name: string,
        schema: InferredSchema,
        enumTracker: EnumTracker,
        prefix: string,
        isOptional: boolean,
        properties: PropertySummary[],
        depth = 0,
    ): void {
        const fullName = prefix ? `${prefix}.${name}` : name;

        // Skip 'id' property at top level
        if (prefix === "" && name === "id") {
            return;
        }

        // Respect depth limit
        if (depth >= this.options.maxDepth) {
            return;
        }

        // Handle nullable wrapper
        let nullable = isOptional;
        let innerSchema = schema;

        if (schema.type === "nullable" && schema.schema) {
            nullable = true;
            innerSchema = schema.schema;
        }

        // For objects with properties, recurse into nested properties
        if (innerSchema.type === "object" && innerSchema.properties) {
            // Extract nested required properties
            for (const [nestedName, nestedSchema] of Object.entries(innerSchema.properties.required)) {
                this.extractProperties(nestedName, nestedSchema, enumTracker, fullName, false, properties, depth + 1);
            }

            // Extract nested optional properties
            for (const [nestedName, nestedSchema] of Object.entries(innerSchema.properties.optional)) {
                this.extractProperties(nestedName, nestedSchema, enumTracker, fullName, true, properties, depth + 1);
            }

            return; // Don't add the parent object as a property
        }

        // Create property summary for non-object types
        const summary = this.schemaToSummary(fullName, innerSchema, enumTracker, nullable);

        if (summary) {
            properties.push(summary);
        }
    }

    /**
     * Convert an InferredSchema to a PropertySummary.
     * @param fullName - Full property path
     * @param schema - Inferred schema to convert
     * @param enumTracker - Enum tracker for categorical detection
     * @param nullable - Whether the property can be null
     * @returns Property summary or null if not convertible
     */
    private schemaToSummary(
        fullName: string,
        schema: InferredSchema,
        enumTracker: EnumTracker,
        nullable: boolean,
    ): PropertySummary | null {
        const summary: PropertySummary = {
            name: fullName,
            type: this.inferredTypeToPropertyType(schema),
            nullable,
        };

        // Add type-specific details
        switch (schema.type) {
            case "string": {
                // Add format if detected (uuid, email, uri, datetime, etc.)
                if (schema.format?.name) {
                    summary.format = schema.format.name;
                }

                // Check for enum using Capital One's algorithm
                const enumAnalysis = enumTracker.getEnumAnalysis(fullName);

                if (enumAnalysis.isEnum && enumAnalysis.values) {
                    summary.enumValues = enumAnalysis.values;
                }

                break;
            }

            case "int":
            case "float": {
                if (schema.range) {
                    summary.range = schema.range;
                }

                break;
            }

            case "array": {
                if (schema.items) {
                    summary.itemType = this.inferredTypeToPropertyType(schema.items);
                }

                break;
            }

            default:
                break;
        }

        return summary;
    }

    /**
     * Convert schema-infer type to our PropertyType.
     * @param schema - Inferred schema to convert type from
     * @returns Corresponding PropertyType
     */
    private inferredTypeToPropertyType(schema: InferredSchema): PropertyType {
        switch (schema.type) {
            case "string":
                return "string";
            case "int":
                return "integer";
            case "float":
                return "number";
            case "boolean":
                return "boolean";
            case "array":
                return "array";
            case "object":
                return "object";
            case "any":
                return "mixed";
            case "nullable":
                return schema.schema ? this.inferredTypeToPropertyType(schema.schema) : "unknown";
            default:
                return "unknown";
        }
    }

    /**
     * Get evenly distributed samples from an array.
     * @param items - Array to sample from
     * @param maxSize - Maximum number of samples
     * @returns Array of evenly distributed samples
     */
    private sampleEvenly<T>(items: T[], maxSize: number): T[] {
        const result: T[] = [];
        const step = items.length / maxSize;

        for (let i = 0; i < maxSize; i++) {
            const index = Math.floor(i * step);

            result.push(items[index]);
        }

        return result;
    }
}
