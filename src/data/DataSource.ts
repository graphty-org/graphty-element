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

export abstract class DataSource {
    static readonly type: string;
    static readonly DEFAULT_CHUNK_SIZE = 1000;

    edgeSchema: z4.$ZodObject | null = null;
    nodeSchema: z4.$ZodObject | null = null;
    protected errorAggregator: ErrorAggregator;
    protected chunkSize: number;

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
     */
    getErrorAggregator(): ErrorAggregator {
        return this.errorAggregator;
    }

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

    get type(): string {
        return (this.constructor as typeof DataSource).type;
    }

    static register<T extends DataSourceClass>(cls: T): T {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const t: string = (cls as any).type;
        dataSourceRegistry.set(t, cls);
        return cls;
    }

    static get(type: string, opts: object = {}): DataSource | null {
        const SourceClass = dataSourceRegistry.get(type);
        if (SourceClass) {
            return new SourceClass(opts);
        }

        return null;
    }
}
