/**
 * SchemaManager - Manages schema extraction, caching, and lifecycle.
 *
 * Provides cached access to graph schema and formatted output for system prompts.
 *
 * @module ai/schema/SchemaManager
 */

import type {Graph} from "../../Graph";
import {SchemaExtractor} from "./SchemaExtractor";
import {formatSchemaForPrompt} from "./SchemaFormatter";
import type {SchemaExtractorOptions, SchemaSummary} from "./types";

/**
 * Manages the lifecycle of schema extraction and caching.
 *
 * Features:
 * - Lazy extraction on first access
 * - Caching of both raw schema and formatted output
 * - Cache invalidation for data change updates
 * - Pass-through options to SchemaExtractor
 */
export class SchemaManager {
    private graph: Graph;
    private options: SchemaExtractorOptions;
    private cachedSchema: SchemaSummary | null = null;
    private cachedFormattedSchema: string | null = null;

    /**
     * Create a new SchemaManager.
     *
     * @param graph - The graph to extract schema from
     * @param options - Options passed through to SchemaExtractor
     */
    constructor(graph: Graph, options: SchemaExtractorOptions = {}) {
        this.graph = graph;
        this.options = options;
    }

    /**
     * Extract schema from the graph.
     *
     * Returns cached schema if available, otherwise extracts fresh.
     *
     * @returns The extracted schema summary
     */
    extract(): SchemaSummary {
        if (this.cachedSchema === null) {
            const extractor = new SchemaExtractor(this.graph, this.options);
            this.cachedSchema = extractor.extract();
        }

        return this.cachedSchema;
    }

    /**
     * Get the cached schema without triggering extraction.
     *
     * @returns The cached schema or null if not yet extracted
     */
    getSchema(): SchemaSummary | null {
        return this.cachedSchema;
    }

    /**
     * Get the schema formatted as markdown for system prompts.
     *
     * Returns cached formatted schema if available.
     *
     * @returns Formatted markdown string
     */
    getFormattedSchema(): string {
        if (this.cachedFormattedSchema === null) {
            const schema = this.extract();
            this.cachedFormattedSchema = formatSchemaForPrompt(schema);
        }

        return this.cachedFormattedSchema;
    }

    /**
     * Invalidate the cached schema.
     *
     * Call this when graph data changes to force re-extraction
     * on the next access.
     */
    invalidateCache(): void {
        this.cachedSchema = null;
        this.cachedFormattedSchema = null;
    }
}
