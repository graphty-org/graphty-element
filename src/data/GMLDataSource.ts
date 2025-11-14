import type {AdHocData} from "../config/common.js";
import {DataSource, DataSourceChunk} from "./DataSource.js";

export interface GMLDataSourceConfig {
    data?: string;
    file?: File;
    url?: string;
    chunkSize?: number;
    errorLimit?: number;
}

interface GMLValue {
    [key: string]: string | number | GMLValue | GMLValue[] | (string | number)[];
}

export class GMLDataSource extends DataSource {
    static readonly type = "gml";

    private config: GMLDataSourceConfig;
    private chunkSize: number;
    private errorLimit: number;
    private errors: {message: string, line?: number}[] = [];
    private warnings: {message: string, line?: number}[] = [];

    constructor(config: GMLDataSourceConfig) {
        super();
        this.config = config;
        this.chunkSize = config.chunkSize ?? 1000;
        this.errorLimit = config.errorLimit ?? 100;
    }

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

        // Yield in chunks
        for (let i = 0; i < nodes.length; i += this.chunkSize) {
            const nodeChunk = nodes.slice(i, i + this.chunkSize);
            const edgeChunk = i === 0 ? edges : []; // Yield all edges with first chunk

            yield {nodes: nodeChunk, edges: edgeChunk};
        }

        // If no nodes, still yield edges
        if (nodes.length === 0 && edges.length > 0) {
            yield {nodes: [], edges};
        }
    }

    private async getContent(): Promise<string> {
        if (this.config.data) {
            return this.config.data;
        }

        if (this.config.file) {
            return await this.config.file.text();
        }

        if (this.config.url) {
            const response = await fetch(this.config.url);
            if (!response.ok) {
                throw new Error(`Failed to fetch GML from ${this.config.url}: ${response.status}`);
            }

            return await response.text();
        }

        throw new Error("GMLDataSource requires data, file, or url");
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
                    this.addError("Node missing id attribute");
                    continue;
                }

                const nodeData: Record<string, unknown> = {... node};
                nodes.push(nodeData);
            } catch (error) {
                this.addError(`Failed to parse node: ${error instanceof Error ? error.message : String(error)}`);

                if (this.errors.length >= this.errorLimit) {
                    throw new Error(`Too many errors (${this.errors.length}), aborting parse`);
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
                    this.addError("Edge missing source or target attribute");
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
                this.addError(`Failed to parse edge: ${error instanceof Error ? error.message : String(error)}`);

                if (this.errors.length >= this.errorLimit) {
                    throw new Error(`Too many errors (${this.errors.length}), aborting parse`);
                }
            }
        }

        return edges as AdHocData[];
    }

    private addError(message: string, line?: number): void {
        this.errors.push({message, line});
    }

    private addWarning(message: string, line?: number): void {
        this.warnings.push({message, line});
    }
}
