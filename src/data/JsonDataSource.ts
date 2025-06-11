import * as z4 from "zod/v4/core";
import {DataSource, DataSourceChunk} from "./DataSource";
// import {JSONParser} from "@streamparser/json";
import type {PartiallyOptional} from "../config";
import {z} from "zod/v4";
import jmespath from "jmespath";

const JsonNodeConfig = z.strictObject({
    path: z.string().default("nodes"),
    schema: z.custom<z4.$ZodObject>(),
}).prefault({});

const JsonEdgeConfig = z.strictObject({
    path: z.string().default("edges"),
    schema: z.custom<z4.$ZodObject>(),
}).prefault({});

export const JsonDataSourceConfig = z.object({
    data: z.string(),
    node: JsonNodeConfig,
    edge: JsonEdgeConfig,
});

export type JsonDataSourceConfigType = z.infer<typeof JsonDataSourceConfig>
export type JsonDataSourceConfigOpts = PartiallyOptional<JsonDataSourceConfigType, "node" | "edge">

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

    async *sourceFetchData(): AsyncGenerator<DataSourceChunk, void, unknown> {
        const response = await fetch(this.url);
        if (!response.body) {
            throw new Error("JSON response had no body");
        }

        const data = await response.json();

        const nodes = jmespath.search(data, this.opts.node.path);
        if (!Array.isArray(nodes)) {
            throw new TypeError(`JsonDataProvider expected 'nodes' to be an array of objects, got ${nodes}`);
        }

        const edges = jmespath.search(data, this.opts.edge.path);
        if (!Array.isArray(edges)) {
            throw new TypeError(`JsonDataProvider expected 'edges' to be an array of objects, got ${edges}`);
        }

        yield {nodes, edges};
    }
}
