import jmespath from "jmespath";
import {z} from "zod/v4";
import * as z4 from "zod/v4/core";

// import {JSONParser} from "@streamparser/json";
import type {AdHocData, PartiallyOptional} from "../config/common";
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
    nodeIdPath: z.string().optional(),
    edgeSrcIdPath: z.string().optional(),
    edgeDstIdPath: z.string().optional(),
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

        // Handle empty content gracefully
        if (jsonString.trim() === "") {
            yield* this.chunkData([], []);
            return;
        }

        // Parse JSON
        try {
            data = JSON.parse(jsonString);
        } catch (error) {
            const canContinue = this.errorAggregator.addError({
                message: `Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`,
                category: "parse-error",
            });

            if (!canContinue) {
                throw new Error(`Too many errors (${this.errorAggregator.getErrorCount()}), aborting parse`);
            }

            yield* this.chunkData([], []);
            return;
        }

        // Extract nodes using JMESPath
        let rawNodes: unknown[] = [];
        try {
            const nodes = jmespath.search(data, this.opts.node.path);
            if (Array.isArray(nodes)) {
                rawNodes = nodes;
            } else if (nodes !== null && nodes !== undefined) {
                // Log error but continue with empty nodes
                const canContinue = this.errorAggregator.addError({
                    message: `Expected 'nodes' at path '${this.opts.node.path}' to be an array, got ${typeof nodes}`,
                    category: "validation-error",
                    field: "nodes",
                });

                if (!canContinue) {
                    throw new Error(`Too many errors (${this.errorAggregator.getErrorCount()}), aborting parse`);
                }
            }
            // If nodes is null/undefined, just use empty array
        } catch (error) {
            const canContinue = this.errorAggregator.addError({
                message: `Failed to extract nodes using path '${this.opts.node.path}': ${error instanceof Error ? error.message : String(error)}`,
                category: "parse-error",
                field: "nodes",
            });

            if (!canContinue) {
                throw new Error(`Too many errors (${this.errorAggregator.getErrorCount()}), aborting parse`);
            }
        }

        // Extract edges using JMESPath
        let rawEdges: unknown[] = [];
        try {
            const edges = jmespath.search(data, this.opts.edge.path);
            if (Array.isArray(edges)) {
                rawEdges = edges;
            } else if (edges !== null && edges !== undefined) {
                // Log error but continue with empty edges
                const canContinue = this.errorAggregator.addError({
                    message: `Expected 'edges' at path '${this.opts.edge.path}' to be an array, got ${typeof edges}`,
                    category: "validation-error",
                    field: "edges",
                });

                if (!canContinue) {
                    throw new Error(`Too many errors (${this.errorAggregator.getErrorCount()}), aborting parse`);
                }
            }
            // If edges is null/undefined, just use empty array
        } catch (error) {
            const canContinue = this.errorAggregator.addError({
                message: `Failed to extract edges using path '${this.opts.edge.path}': ${error instanceof Error ? error.message : String(error)}`,
                category: "parse-error",
                field: "edges",
            });

            if (!canContinue) {
                throw new Error(`Too many errors (${this.errorAggregator.getErrorCount()}), aborting parse`);
            }
        }

        // Validate individual nodes and filter out invalid ones
        const validNodes: AdHocData[] = [];
        for (let i = 0; i < rawNodes.length; i++) {
            const node = rawNodes[i];
            if (this.isValidNode(node, i)) {
                validNodes.push(node as AdHocData);
            }
        }

        // Validate individual edges and filter out invalid ones
        const validEdges: AdHocData[] = [];
        for (let i = 0; i < rawEdges.length; i++) {
            const edge = rawEdges[i];
            if (this.isValidEdge(edge, i)) {
                validEdges.push(edge as AdHocData);
            }
        }

        // Yield data in chunks using inherited helper
        yield* this.chunkData(validNodes, validEdges);
    }

    /**
     * Validates a node object and logs errors if invalid.
     * Returns true if the node is valid and should be included.
     */
    private isValidNode(node: unknown, index: number): boolean {
        if (node === null || node === undefined) {
            const canContinue = this.errorAggregator.addError({
                message: `Node at index ${index} is null or undefined`,
                category: "validation-error",
                field: "nodes",
                line: index,
            });

            if (!canContinue) {
                throw new Error(`Too many errors (${this.errorAggregator.getErrorCount()}), aborting parse`);
            }

            return false;
        }

        if (typeof node !== "object") {
            const canContinue = this.errorAggregator.addError({
                message: `Node at index ${index} is not an object (got ${typeof node})`,
                category: "validation-error",
                field: "nodes",
                line: index,
            });

            if (!canContinue) {
                throw new Error(`Too many errors (${this.errorAggregator.getErrorCount()}), aborting parse`);
            }

            return false;
        }

        // Check for id field (common requirement - accept common identifier field names)
        // If a custom nodeIdPath is specified, also accept that field
        const nodeObj = node as Record<string, unknown>;
        const customIdPath = this.opts.nodeIdPath;
        const hasId = "id" in nodeObj || "name" in nodeObj || "key" in nodeObj || "label" in nodeObj ||
                      (customIdPath !== undefined && customIdPath in nodeObj);
        if (!hasId) {
            const expectedFields = customIdPath ?
                `'id', 'name', 'key', 'label', or '${customIdPath}'` :
                "'id', 'name', 'key', or 'label'";
            const canContinue = this.errorAggregator.addError({
                message: `Node at index ${index} is missing identifier field (expected ${expectedFields})`,
                category: "missing-value",
                field: "nodes.id",
                line: index,
            });

            if (!canContinue) {
                throw new Error(`Too many errors (${this.errorAggregator.getErrorCount()}), aborting parse`);
            }

            return false;
        }

        return true;
    }

    /**
     * Validates an edge object and logs errors if invalid.
     * Returns true if the edge is valid and should be included.
     */
    private isValidEdge(edge: unknown, index: number): boolean {
        if (edge === null || edge === undefined) {
            const canContinue = this.errorAggregator.addError({
                message: `Edge at index ${index} is null or undefined`,
                category: "validation-error",
                field: "edges",
                line: index,
            });

            if (!canContinue) {
                throw new Error(`Too many errors (${this.errorAggregator.getErrorCount()}), aborting parse`);
            }

            return false;
        }

        if (typeof edge !== "object") {
            const canContinue = this.errorAggregator.addError({
                message: `Edge at index ${index} is not an object (got ${typeof edge})`,
                category: "validation-error",
                field: "edges",
                line: index,
            });

            if (!canContinue) {
                throw new Error(`Too many errors (${this.errorAggregator.getErrorCount()}), aborting parse`);
            }

            return false;
        }

        // Check for source/target fields (common requirement)
        const edgeObj = edge as Record<string, unknown>;
        const hasSource = "source" in edgeObj || "src" in edgeObj || "from" in edgeObj;
        const hasTarget = "target" in edgeObj || "dst" in edgeObj || "to" in edgeObj;

        if (!hasSource) {
            const canContinue = this.errorAggregator.addError({
                message: `Edge at index ${index} is missing source field (expected 'source', 'src', or 'from')`,
                category: "missing-value",
                field: "edges.source",
                line: index,
            });

            if (!canContinue) {
                throw new Error(`Too many errors (${this.errorAggregator.getErrorCount()}), aborting parse`);
            }

            return false;
        }

        if (!hasTarget) {
            const canContinue = this.errorAggregator.addError({
                message: `Edge at index ${index} is missing target field (expected 'target', 'dst', or 'to')`,
                category: "missing-value",
                field: "edges.target",
                line: index,
            });

            if (!canContinue) {
                throw new Error(`Too many errors (${this.errorAggregator.getErrorCount()}), aborting parse`);
            }

            return false;
        }

        return true;
    }
}
