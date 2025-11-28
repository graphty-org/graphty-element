import jmespath from "jmespath";
import {z} from "zod/v4";
import * as z4 from "zod/v4/core";

// import {JSONParser} from "@streamparser/json";
import type {PartiallyOptional} from "../config/common";
import {BaseDataSourceConfig, DataSource, DataSourceChunk} from "./DataSource";

const JsonNodeConfig = z.strictObject({
    path: z.string().default("nodes"),
    schema: z.custom<z4.$ZodObject>().or(z.null()).default(null),
}).prefault({});

const JsonEdgeConfig = z.strictObject({
    path: z.string().default("edges"),
    schema: z.custom<z4.$ZodObject>().or(z.null()).default(null),
}).prefault({});

export const JsonDataSourceConfig = z.object({
    data: z.string().optional(),
    file: z.instanceof(File).optional(),
    url: z.string().optional(),
    chunkSize: z.number().optional(),
    errorLimit: z.number().optional(),
    node: JsonNodeConfig,
    edge: JsonEdgeConfig,
});

export type JsonDataSourceConfigType = z.infer<typeof JsonDataSourceConfig>;
export type JsonDataSourceConfigOpts = PartiallyOptional<JsonDataSourceConfigType, "node" | "edge">;

export class JsonDataSource extends DataSource {
    static type = "json";
    opts: JsonDataSourceConfigType;

    constructor(anyOpts: object) {
        const opts = JsonDataSourceConfig.parse(anyOpts);

        // Pass errorLimit and chunkSize to base class
        super(opts.errorLimit ?? 100, opts.chunkSize ?? DataSource.DEFAULT_CHUNK_SIZE);

        this.opts = opts;
        if (opts.node.schema) {
            this.nodeSchema = opts.node.schema;
        }

        if (opts.edge.schema) {
            this.edgeSchema = opts.edge.schema;
        }
    }

    protected getConfig(): BaseDataSourceConfig {
        // JsonDataSource has special handling for 'data' field:
        // If data starts with http/https/data:, treat it as URL
        // Otherwise treat it as inline JSON
        const isUrl = (this.opts.data?.startsWith("http://") ?? false) ||
                     (this.opts.data?.startsWith("https://") ?? false) ||
                     (this.opts.data?.startsWith("data:") ?? false);

        return {
            data: isUrl ? undefined : this.opts.data,
            file: this.opts.file,
            url: isUrl ? this.opts.data : this.opts.url,
            chunkSize: this.opts.chunkSize,
            errorLimit: this.opts.errorLimit,
        };
    }

    async *sourceFetchData(): AsyncGenerator<DataSourceChunk, void, unknown> {
        let data: unknown;

        // Get JSON content (could be from data, file, or url)
        const jsonString = await this.getContent();

        // Parse JSON
        try {
            data = JSON.parse(jsonString);
        } catch (error) {
            throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`);
        }

        // Extract nodes using JMESPath
        let nodes: unknown;
        try {
            nodes = jmespath.search(data, this.opts.node.path);
        } catch (error) {
            throw new Error(`Failed to extract nodes using path '${this.opts.node.path}': ${error instanceof Error ? error.message : String(error)}`);
        }

        if (!Array.isArray(nodes)) {
            throw new TypeError(`JsonDataSource expected 'nodes' at path '${this.opts.node.path}' to be an array of objects, got ${typeof nodes}`);
        }

        // Extract edges using JMESPath
        let edges: unknown;
        try {
            edges = jmespath.search(data, this.opts.edge.path);
        } catch (error) {
            throw new Error(`Failed to extract edges using path '${this.opts.edge.path}': ${error instanceof Error ? error.message : String(error)}`);
        }

        if (!Array.isArray(edges)) {
            throw new TypeError(`JsonDataSource expected 'edges' at path '${this.opts.edge.path}' to be an array of objects, got ${typeof edges}`);
        }

        // Yield data in chunks using inherited helper
        yield* this.chunkData(nodes, edges);
    }
}
