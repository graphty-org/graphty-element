import {z} from "zod/v4";
import * as z4 from "zod/v4/core";

import {AdHocData} from "../config";
import {ErrorAggregator} from "./ErrorAggregator.js";

// Base configuration interface
export interface BaseDataSourceConfig {
    data?: string;
    file?: File;
    url?: string;
    chunkSize?: number;
    errorLimit?: number;
}

type DataSourceClass = new (opts: object) => DataSource;
const dataSourceRegistry = new Map<string, DataSourceClass>();
export interface DataSourceChunk {
    nodes: AdHocData[];
    edges: AdHocData[];
}

/**
 * Base class for all data source implementations that load graph data from various formats.
 * Provides common functionality for validation, chunking, error handling, and data fetching.
 */
export abstract class DataSource {
    static readonly type: string;
    static readonly DEFAULT_CHUNK_SIZE = 1000;

    edgeSchema: z4.$ZodObject | null = null;
    nodeSchema: z4.$ZodObject | null = null;
    protected errorAggregator: ErrorAggregator;
    protected chunkSize: number;

    /**
     * Creates a new DataSource instance.
     * @param errorLimit - Maximum number of errors before stopping data processing
     * @param chunkSize - Number of nodes to process per chunk
     */
    constructor(errorLimit = 100, chunkSize = DataSource.DEFAULT_CHUNK_SIZE) {
        this.errorAggregator = new ErrorAggregator(errorLimit);
        this.chunkSize = chunkSize;
    }

    // abstract init(): Promise<void>;
    abstract sourceFetchData(): AsyncGenerator<DataSourceChunk, void, unknown>;

    /**
     * Subclasses must implement this to expose their config
     * Used by getContent() and other shared methods
     */
    protected abstract getConfig(): BaseDataSourceConfig;

    /**
     * Standardized error message templates
     * @returns Object containing error message template functions
     */
    protected get errorMessages(): {
        missingInput: () => string;
        fetchFailed: (url: string, attempts: number, error: string) => string;
        parseFailed: (error: string) => string;
        invalidFormat: (reason: string) => string;
        extractionFailed: (path: string, error: string) => string;
    } {
        return {
            missingInput: () =>
                `${this.type}DataSource requires data, file, or url`,

            fetchFailed: (url: string, attempts: number, error: string) =>
                `Failed to fetch ${this.type} from ${url} after ${attempts} attempts: ${error}`,

            parseFailed: (error: string) =>
                `Failed to parse ${this.type}: ${error}`,

            invalidFormat: (reason: string) =>
                `Invalid ${this.type} format: ${reason}`,

            extractionFailed: (path: string, error: string) =>
                `Failed to extract data using path '${path}': ${error}`,
        };
    }

    /**
     * Fetch with retry logic and timeout
     * Protected method for use by all DataSources
     * @param url - URL to fetch from
     * @param retries - Number of retry attempts on failure
     * @param timeout - Timeout in milliseconds for each attempt
     * @returns Promise resolving to the fetch Response
     */
    protected async fetchWithRetry(
        url: string,
        retries = 3,
        timeout = 30000,
    ): Promise<Response> {
        // Data URLs don't need retries or timeouts
        if (url.startsWith("data:")) {
            return await fetch(url);
        }

        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                // Create AbortController for timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => {
                    controller.abort();
                }, timeout);

                try {
                    const response = await fetch(url, {signal: controller.signal});
                    clearTimeout(timeoutId);

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    return response;
                } catch (error) {
                    clearTimeout(timeoutId);

                    if (error instanceof Error && error.name === "AbortError") {
                        throw new Error(`Request timeout after ${timeout}ms`);
                    }

                    throw error;
                }
            } catch (error) {
                const isLastAttempt = attempt === retries - 1;

                if (isLastAttempt) {
                    const errorMsg = error instanceof Error ? error.message : String(error);
                    throw new Error(
                        `Failed to fetch from ${url} after ${retries} attempts: ${errorMsg}`,
                    );
                }

                // Exponential backoff: wait 1s, 2s, 4s...
                const delay = Math.pow(2, attempt) * 1000;
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }

        // Should never reach here
        throw new Error("Unexpected error in fetchWithRetry");
    }

    /**
     * Shared method to get content from data, file, or URL
     * Subclasses should call this instead of implementing their own
     * @returns Promise resolving to the content string
     */
    protected async getContent(): Promise<string> {
        const config = this.getConfig();

        if (config.data !== undefined) {
            return config.data;
        }

        if (config.file) {
            return await config.file.text();
        }

        if (config.url) {
            const response = await this.fetchWithRetry(config.url);
            return await response.text();
        }

        throw new Error(this.errorMessages.missingInput());
    }

    /**
     * Shared chunking helper
     * Yields nodes in chunks, with all edges in the first chunk
     * @param nodes - Array of node data objects
     * @param edges - Array of edge data objects
     * @yields DataSourceChunk objects containing chunked nodes and edges
     */
    protected *chunkData(
        nodes: AdHocData[],
        edges: AdHocData[],
    ): Generator<DataSourceChunk, void, unknown> {
        // Yield nodes in chunks
        for (let i = 0; i < nodes.length; i += this.chunkSize) {
            const nodeChunk = nodes.slice(i, i + this.chunkSize);
            const edgeChunk = i === 0 ? edges : [];
            yield {nodes: nodeChunk, edges: edgeChunk};
        }

        // If no nodes but edges exist, yield edges-only chunk
        if (nodes.length === 0 && edges.length > 0) {
            yield {nodes: [], edges};
        }
    }

    /**
     * Get the error aggregator for this data source
     * @returns The ErrorAggregator instance tracking validation errors
     */
    getErrorAggregator(): ErrorAggregator {
        return this.errorAggregator;
    }

    /**
     * Fetches, validates, and yields graph data in chunks.
     * Filters out invalid nodes and edges based on schema validation.
     * @yields DataSourceChunk objects containing validated nodes and edges
     */
    async *getData(): AsyncGenerator<DataSourceChunk, void, unknown> {
        for await (const chunk of this.sourceFetchData()) {
            // Filter out invalid nodes
            const validNodes: AdHocData[] = [];
            if (this.nodeSchema) {
                for (const n of chunk.nodes) {
                    const isValid = await this.dataValidator(this.nodeSchema, n);
                    if (isValid) {
                        validNodes.push(n);
                    }
                    // Invalid nodes are logged to errorAggregator but skipped
                }
            } else {
                validNodes.push(... chunk.nodes);
            }

            // Filter out invalid edges
            const validEdges: AdHocData[] = [];
            if (this.edgeSchema) {
                for (const e of chunk.edges) {
                    const isValid = await this.dataValidator(this.edgeSchema, e);
                    if (isValid) {
                        validEdges.push(e);
                    }
                }
            } else {
                validEdges.push(... chunk.edges);
            }

            // Only yield if we have data (or if we're not filtering)
            if (validNodes.length > 0 || validEdges.length > 0) {
                yield {nodes: validNodes, edges: validEdges};
            }

            // Stop if we've hit the error limit
            if (this.errorAggregator.hasReachedLimit()) {
                break;
            }
        }
    }

    /**
     * Validate data against schema
     * Returns false if validation fails (and adds error to aggregator)
     * Returns true if validation succeeds
     * @param schema - Zod schema to validate against
     * @param obj - Data object to validate
     * @returns Promise resolving to true if validation succeeds, false otherwise
     */
    async dataValidator(schema: z4.$ZodObject, obj: object): Promise<boolean> {
        const res = await z4.safeParseAsync(schema, obj);

        if (!res.success) {
            const errMsg = z.prettifyError(res.error);

            this.errorAggregator.addError({
                message: `Validation failed: ${errMsg}`,
                category: "validation-error",
            });

            return false; // Validation failed
        }

        return true; // Validation passed
    }

    /**
     * Gets the type identifier for this data source instance.
     * @returns The type string identifier
     */
    get type(): string {
        return (this.constructor as typeof DataSource).type;
    }

    /**
     * Registers a data source class with the registry.
     * @param cls - The data source class to register
     * @returns The registered class for chaining
     */
    static register<T extends DataSourceClass>(cls: T): T {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const t: string = (cls as any).type;
        dataSourceRegistry.set(t, cls);
        return cls;
    }

    /**
     * Creates a data source instance by type name.
     * @param type - The registered type identifier
     * @param opts - Configuration options for the data source
     * @returns A new data source instance or null if type not found
     */
    static get(type: string, opts: object = {}): DataSource | null {
        const SourceClass = dataSourceRegistry.get(type);
        if (SourceClass) {
            return new SourceClass(opts);
        }

        return null;
    }

    /**
     * Get all registered data source types.
     * @returns Array of registered data source type names
     * @since 1.5.0
     * @example
     * ```typescript
     * const types = DataSource.getRegisteredTypes();
     * console.log('Available data sources:', types);
     * // ['csv', 'gexf', 'gml', 'graphml', 'json', 'pajek']
     * ```
     */
    static getRegisteredTypes(): string[] {
        return Array.from(dataSourceRegistry.keys()).sort();
    }
}
