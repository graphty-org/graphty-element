import jmespath from "jmespath";
import {z} from "zod/v4";
import * as z4 from "zod/v4/core";

// import {JSONParser} from "@streamparser/json";
import type {PartiallyOptional} from "../config/common";
import {DataSource, DataSourceChunk} from "./DataSource";

const JsonNodeConfig = z.strictObject({
    path: z.string().default("nodes"),
    schema: z.custom<z4.$ZodObject>().or(z.null()).default(null),
}).prefault({});

const JsonEdgeConfig = z.strictObject({
    path: z.string().default("edges"),
    schema: z.custom<z4.$ZodObject>().or(z.null()).default(null),
}).prefault({});

export const JsonDataSourceConfig = z.object({
    data: z.string(),
    node: JsonNodeConfig,
    edge: JsonEdgeConfig,
});

export type JsonDataSourceConfigType = z.infer<typeof JsonDataSourceConfig>;
export type JsonDataSourceConfigOpts = PartiallyOptional<JsonDataSourceConfigType, "node" | "edge">;

// @DataSource.register
export class JsonDataSource extends DataSource {
    static type = "json";
    url: string;
    opts: JsonDataSourceConfigType;

    constructor(anyOpts: object) {
        super();

        const opts = JsonDataSourceConfig.parse(anyOpts);
        this.opts = opts;
        if (opts.node.schema) {
            this.nodeSchema = opts.node.schema;
        }

        if (opts.edge.schema) {
            this.edgeSchema = opts.edge.schema;
        }

        this.url = opts.data;
    }

    private async fetchWithRetry(url: string, retries = 3, timeout = 30000): Promise<Response> {
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                // Create an AbortController for timeout
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
                    throw new Error(`Failed to fetch data after ${retries} attempts: ${error instanceof Error ? error.message : String(error)}`);
                }

                // Exponential backoff: wait 1s, 2s, 4s...
                const delay = Math.pow(2, attempt) * 1000;
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }

        // This should never be reached due to the throw in the last attempt
        throw new Error("Unexpected error in fetchWithRetry");
    }

    async *sourceFetchData(): AsyncGenerator<DataSourceChunk, void, unknown> {
        let response: Response;
        let data: unknown;

        try {
            response = await this.fetchWithRetry(this.url);
        } catch (error) {
            throw new Error(`Failed to fetch data from ${this.url}: ${error instanceof Error ? error.message : String(error)}`);
        }

        if (!response.body) {
            throw new Error("JSON response had no body");
        }

        try {
            data = await response.json();
        } catch (error) {
            throw new Error(`Failed to parse JSON response: ${error instanceof Error ? error.message : String(error)}`);
        }

        let nodes: unknown;
        let edges: unknown;

        try {
            nodes = jmespath.search(data, this.opts.node.path);
        } catch (error) {
            throw new Error(`Failed to extract nodes using path '${this.opts.node.path}': ${error instanceof Error ? error.message : String(error)}`);
        }

        if (!Array.isArray(nodes)) {
            throw new TypeError(`JsonDataProvider expected 'nodes' at path '${this.opts.node.path}' to be an array of objects, got ${typeof nodes}`);
        }

        try {
            edges = jmespath.search(data, this.opts.edge.path);
        } catch (error) {
            throw new Error(`Failed to extract edges using path '${this.opts.edge.path}': ${error instanceof Error ? error.message : String(error)}`);
        }

        if (!Array.isArray(edges)) {
            throw new TypeError(`JsonDataProvider expected 'edges' at path '${this.opts.edge.path}' to be an array of objects, got ${typeof edges}`);
        }

        yield {nodes, edges};
    }
}
