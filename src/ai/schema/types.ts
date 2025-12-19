/**
 * Schema Type Definitions for AI schema discovery.
 * @module ai/schema/types
 */

/**
 * Type classification for a property value.
 */
export type PropertyType = "string" | "number" | "integer" | "boolean" | "array" | "object" | "mixed" | "unknown";

/**
 * Summary of a single property discovered in the graph data.
 */
export interface PropertySummary {
    /** The name of the property (uses dot notation for nested properties) */
    name: string;
    /** The detected type of the property */
    type: PropertyType;
    /** Whether the property has null or undefined values */
    nullable: boolean;
    /** For string properties with categorical values, the enumerated values */
    enumValues?: string[];
    /** For string properties, the detected format (uuid, email, uri, datetime, etc.) */
    format?: string;
    /** For number properties, the observed min/max range */
    range?: {min: number, max: number};
    /** For array properties, the type of items in the array */
    itemType?: string;
}

/**
 * Summary of the entire graph schema.
 */
export interface SchemaSummary {
    /** Properties found on node data */
    nodeProperties: PropertySummary[];
    /** Properties found on edge data */
    edgeProperties: PropertySummary[];
    /** Total number of nodes in the graph */
    nodeCount: number;
    /** Total number of edges in the graph */
    edgeCount: number;
}

/**
 * Configuration options for schema extraction.
 */
export interface SchemaExtractorOptions {
    /** Maximum number of nodes/edges to sample for schema extraction (default: 1000) */
    maxSampleSize?: number;
    /** Maximum depth for nested property extraction (default: 3) */
    maxDepth?: number;
    /** Enum detection: max unique values to auto-classify as enum (default: 10, from Capital One) */
    enumMaxAbsoluteUnique?: number;
    /** Enum detection: max unique ratio - 20% means if unique/total <= 0.2, it's an enum (default: 0.2) */
    enumMaxUniqueRatio?: number;
    /** Enum detection: max string length for enum values (default: 64) */
    enumMaxStringLength?: number;
    /** Enum detection: min samples before considering enum detection (default: 25) */
    enumMinSampleSize?: number;
}
