/**
 * Schema Module - AI schema discovery functionality.
 * @module ai/schema
 */

export {SchemaExtractor} from "./SchemaExtractor";
export {formatSchemaForPrompt} from "./SchemaFormatter";
export {SchemaManager} from "./SchemaManager";
export type {
    PropertySummary,
    PropertyType,
    SchemaExtractorOptions,
    SchemaSummary,
} from "./types";
