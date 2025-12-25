import type {AdHocData} from "../config/common.js";
import {BaseDataSourceConfig, DataSource, DataSourceChunk} from "./DataSource.js";

// GML has no additional config currently, so just use the base config
export type GMLDataSourceConfig = BaseDataSourceConfig;

interface GMLValue {
    [key: string]: string | number | GMLValue | GMLValue[] | (string | number)[];
}

/**
 * Data source for loading graph data from GML (Graph Modeling Language) files.
 * Supports hierarchical graph structures with typed attributes.
 */
export class GMLDataSource extends DataSource {
    static readonly type = "gml";

    private config: GMLDataSourceConfig;

    /**
     * Creates a new GMLDataSource instance.
     * @param config - Configuration options for GML parsing and data loading
     */
    constructor(config: GMLDataSourceConfig) {
        super(config.errorLimit ?? 100, config.chunkSize);
        this.config = config;
    }

    protected getConfig(): BaseDataSourceConfig {
        return this.config;
    }

    /**
     * Fetches and parses GML format data into graph chunks.
     * @yields DataSourceChunk objects containing parsed nodes and edges
     */
    async *sourceFetchData(): AsyncGenerator<DataSourceChunk, void, unknown> {
    // Get GML content
        const gmlContent = await this.getContent();

        // Parse GML
        const graph = this.parseGML(gmlContent);

        if (!graph) {
            return;
        }

        // Extract nodes and edges
        const nodes = this.extractNodes(graph);
        const edges = this.extractEdges(graph);

        // Use shared chunking helper
        yield* this.chunkData(nodes, edges);
    }

    private parseGML(content: string): GMLValue | null {
    // Simple GML parser
    // GML format: key [ ... ] or key value
        const tokens = this.tokenize(content);
        const result = this.parseValue(tokens);

        if (result && typeof result === "object" && "graph" in result) {
            return result.graph as GMLValue;
        }

        throw new Error("Invalid GML: missing graph element");
    }

    private tokenize(content: string): string[] {
        const tokens: string[] = [];
        let current = "";
        let inString = false;
        let inComment = false;

        // eslint-disable-next-line @typescript-eslint/prefer-for-of -- Need index for look-ahead and manual increment
        for (let i = 0; i < content.length; i++) {
            const char = content[i];
            // const nextChar = content[i + 1]; // Unused

            // Handle comments
            if (!inString && char === "#") {
                inComment = true;
                continue;
            }

            if (inComment) {
                if (char === "\n") {
                    inComment = false;
                }

                continue;
            }

            // Handle strings
            if (char === "\"") {
                if (inString) {
                    tokens.push(current);
                    current = "";
                    inString = false;
                } else {
                    inString = true;
                }

                continue;
            }

            if (inString) {
                current += char;
                continue;
            }

            // Handle structural characters
            if (char === "[" || char === "]") {
                if (current.trim()) {
                    tokens.push(current.trim());
                    current = "";
                }

                tokens.push(char);
                continue;
            }

            // Handle whitespace
            if (/\s/.test(char)) {
                if (current.trim()) {
                    tokens.push(current.trim());
                    current = "";
                }

                continue;
            }

            current += char;
        }

        if (current.trim()) {
            tokens.push(current.trim());
        }

        return tokens;
    }

    private parseValue(tokens: string[]): GMLValue | string | number | null {
        if (tokens.length === 0) {
            return null;
        }

        const result: GMLValue = {};
        let i = 0;

        while (i < tokens.length) {
            const key = tokens[i];

            if (key === "]") {
                break;
            }

            if (key === "[") {
                i++;
                continue;
            }

            // Look ahead for value
            if (i + 1 < tokens.length) {
                const next = tokens[i + 1];

                if (next === "[") {
                    // Complex value
                    i += 2; // Skip key and '['
                    // const nested: GMLValue[] = []; // Unused
                    let depth = 1;
                    const start = i;

                    // Find matching ']'
                    while (i < tokens.length && depth > 0) {
                        if (tokens[i] === "[") {
                            depth++;
                        }

                        if (tokens[i] === "]") {
                            depth--;
                        }

                        if (depth > 0) {
                            i++;
                        }
                    }

                    // Parse nested content
                    const nestedTokens = tokens.slice(start, i);
                    const nestedValue = this.parseValue(nestedTokens);

                    // Handle multiple values with same key (like multiple nodes)
                    if (key in result) {
                        if (Array.isArray(result[key])) {
                            (result[key] as GMLValue[]).push(nestedValue as GMLValue);
                        } else {
                            result[key] = [result[key] as GMLValue, nestedValue as GMLValue];
                        }
                    } else {
                        result[key] = nestedValue as GMLValue;
                    }

                    i++; // Skip ']'
                } else if (next !== "]") {
                    // Simple value
                    const value = this.parseSimpleValue(next);

                    // Handle multiple values with same key
                    if (key in result) {
                        if (Array.isArray(result[key])) {
                            (result[key] as (string | number)[]).push(value);
                        } else {
                            result[key] = [result[key] as string | number, value];
                        }
                    } else {
                        result[key] = value;
                    }

                    i += 2; // Skip key and value
                } else {
                    i++;
                }
            } else {
                i++;
            }
        }

        return result;
    }

    private parseSimpleValue(value: string): string | number {
    // Try to parse as number
        if (/^-?\d+$/.test(value)) {
            return parseInt(value, 10);
        }

        if (/^-?\d+\.\d+$/.test(value)) {
            return parseFloat(value);
        }

        return value;
    }

    private extractNodes(graph: GMLValue): AdHocData[] {
        const nodes: Record<string, unknown>[] = [];

        if (!graph.node) {
            return [] as AdHocData[];
        }

        const nodeArray = Array.isArray(graph.node) ? graph.node : [graph.node];

        for (const node of nodeArray) {
            try {
                if (typeof node !== "object" || !("id" in node)) {
                    this.errorAggregator.addError({
                        message: "Node missing id attribute",
                        category: "missing-value",
                        field: "id",
                    });
                    continue;
                }

                const nodeData: Record<string, unknown> = {... node};
                nodes.push(nodeData);
            } catch (error) {
                const canContinue = this.errorAggregator.addError({
                    message: `Failed to parse node: ${error instanceof Error ? error.message : String(error)}`,
                    category: "parse-error",
                });

                if (!canContinue) {
                    throw new Error(`Too many errors (${this.errorAggregator.getErrorCount()}), aborting parse`);
                }
            }
        }

        return nodes as AdHocData[];
    }

    private extractEdges(graph: GMLValue): AdHocData[] {
        const edges: Record<string, unknown>[] = [];

        if (!graph.edge) {
            return [] as AdHocData[];
        }

        const edgeArray = Array.isArray(graph.edge) ? graph.edge : [graph.edge];

        for (const edge of edgeArray) {
            try {
                if (typeof edge !== "object" || !("source" in edge) || !("target" in edge)) {
                    this.errorAggregator.addError({
                        message: "Edge missing source or target attribute",
                        category: "missing-value",
                        field: typeof edge === "object" && !("source" in edge) ? "source" : "target",
                    });
                    continue;
                }

                const edgeData: Record<string, unknown> = {
                    src: edge.source,
                    dst: edge.target,
                    ... edge,
                };

                // Remove redundant source/target fields
                delete edgeData.source;
                delete edgeData.target;

                edges.push(edgeData);
            } catch (error) {
                const canContinue = this.errorAggregator.addError({
                    message: `Failed to parse edge: ${error instanceof Error ? error.message : String(error)}`,
                    category: "parse-error",
                });

                if (!canContinue) {
                    throw new Error(`Too many errors (${this.errorAggregator.getErrorCount()}), aborting parse`);
                }
            }
        }

        return edges as AdHocData[];
    }
}
