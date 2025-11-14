import {XMLParser} from "fast-xml-parser";

import type {AdHocData} from "../config/common.js";
import {DataSource, DataSourceChunk} from "./DataSource.js";

export interface GraphMLDataSourceConfig {
    data?: string;
    file?: File;
    url?: string;
    chunkSize?: number;
    errorLimit?: number;
}

interface GraphMLKey {
    name: string;
    type: string;
    for: "node" | "edge" | "graph";
}

export class GraphMLDataSource extends DataSource {
    static readonly type = "graphml";

    private config: GraphMLDataSourceConfig;
    private chunkSize: number;
    private errorLimit: number;
    private errors: {message: string, line?: number}[] = [];
    private warnings: {message: string, line?: number}[] = [];

    constructor(config: GraphMLDataSourceConfig) {
        super();
        this.config = config;
        this.chunkSize = config.chunkSize ?? 1000;
        this.errorLimit = config.errorLimit ?? 100;
    }

    async *sourceFetchData(): AsyncGenerator<DataSourceChunk, void, unknown> {
        // Get XML content
        const xmlContent = await this.getContent();

        // Parse XML
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_",
            parseAttributeValue: false, // Keep as strings, we'll parse by type
            trimValues: true,
        });

        let parsed;
        try {
            parsed = parser.parse(xmlContent);
        } catch (error) {
            throw new Error(`Failed to parse GraphML XML: ${error instanceof Error ? error.message : String(error)}`);
        }

        const {graphml} = parsed;
        if (!graphml) {
            throw new Error("Invalid GraphML: missing <graphml> root element");
        }

        // Parse key definitions
        const keys = this.parseKeyDefinitions(graphml.key);

        // Get graph element
        const {graph} = graphml;
        if (!graph) {
            // Empty graphml file - return empty data
            return;
        }

        // Parse and yield nodes in chunks
        const nodes = this.parseNodes(graph.node, keys);
        const edges = this.parseEdges(graph.edge, keys);

        // Yield in chunks
        for (let i = 0; i < nodes.length; i += this.chunkSize) {
            const nodeChunk = nodes.slice(i, i + this.chunkSize) as AdHocData[];
            const edgeChunk = (i === 0 ? edges : []) as AdHocData[]; // Yield all edges with first chunk

            yield {nodes: nodeChunk, edges: edgeChunk};
        }

        // If no nodes, still yield edges
        if (nodes.length === 0 && edges.length > 0) {
            yield {nodes: [] as AdHocData[], edges: edges as AdHocData[]};
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
                throw new Error(`Failed to fetch GraphML from ${this.config.url}: ${response.status}`);
            }

            return await response.text();
        }

        throw new Error("GraphMLDataSource requires data, file, or url");
    }

    private parseKeyDefinitions(keyData: unknown): Map<string, GraphMLKey> {
        const keys = new Map<string, GraphMLKey>();

        if (!keyData) {
            return keys;
        }

        const keyArray = Array.isArray(keyData) ? keyData : [keyData];

        for (const key of keyArray) {
            const id = key["@_id"];
            const name = key["@_attr.name"] ?? key["@_name"] ?? id;
            const type = key["@_attr.type"] ?? key["@_type"] ?? "string";
            const forElement = key["@_for"] ?? "node";

            keys.set(id, {name, type, for: forElement as "node" | "edge" | "graph"});
        }

        return keys;
    }

    private parseNodes(nodeData: unknown, keys: Map<string, GraphMLKey>): unknown[] {
        if (!nodeData) {
            return [];
        }

        const nodeArray = Array.isArray(nodeData) ? nodeData : [nodeData];
        const nodes: unknown[] = [];

        for (const node of nodeArray) {
            try {
                const id = node["@_id"];
                if (!id) {
                    this.addError("Node missing id attribute");
                    continue;
                }

                const parsedNode: Record<string, unknown> = {id};

                // Parse data elements
                if (node.data) {
                    const dataElements = Array.isArray(node.data) ? node.data : [node.data];

                    for (const data of dataElements) {
                        const keyId = data["@_key"];
                        const value = data["#text"] ?? data;

                        const keyDef = keys.get(keyId);
                        if (keyDef && keyDef.for === "node") {
                            parsedNode[keyDef.name] = this.parseValue(value, keyDef.type);
                        }
                    }
                }

                nodes.push(parsedNode);
            } catch (error) {
                this.addError(`Failed to parse node: ${error instanceof Error ? error.message : String(error)}`);

                if (this.errors.length >= this.errorLimit) {
                    throw new Error(`Too many errors (${this.errors.length}), aborting parse`);
                }
            }
        }

        return nodes;
    }

    private parseEdges(edgeData: unknown, keys: Map<string, GraphMLKey>): unknown[] {
        if (!edgeData) {
            return [];
        }

        const edgeArray = Array.isArray(edgeData) ? edgeData : [edgeData];
        const edges: unknown[] = [];

        for (const edge of edgeArray) {
            try {
                const src = edge["@_source"];
                const dst = edge["@_target"];

                if (!src || !dst) {
                    this.addError("Edge missing source or target attribute");
                    continue;
                }

                const parsedEdge: Record<string, unknown> = {src, dst};

                // Parse data elements
                if (edge.data) {
                    const dataElements = Array.isArray(edge.data) ? edge.data : [edge.data];

                    for (const data of dataElements) {
                        const keyId = data["@_key"];
                        const value = data["#text"] ?? data;

                        const keyDef = keys.get(keyId);
                        if (keyDef && keyDef.for === "edge") {
                            parsedEdge[keyDef.name] = this.parseValue(value, keyDef.type);
                        }
                    }
                }

                edges.push(parsedEdge);
            } catch (error) {
                this.addError(`Failed to parse edge: ${error instanceof Error ? error.message : String(error)}`);

                if (this.errors.length >= this.errorLimit) {
                    throw new Error(`Too many errors (${this.errors.length}), aborting parse`);
                }
            }
        }

        return edges;
    }

    private parseValue(value: string | object, type: string): unknown {
        // Handle case where value is an object (like #text wrapper)
        const stringValue = typeof value === "string" ? value : JSON.stringify(value);

        switch (type) {
            case "int":
            case "long":
                return Number.parseInt(stringValue, 10);
            case "float":
            case "double":
                return Number.parseFloat(stringValue);
            case "boolean":
                return stringValue.toLowerCase() === "true" || stringValue === "1";
            default:
                return stringValue;
        }
    }

    private addError(message: string, line?: number): void {
        this.errors.push({message, line});

        // Emit error event through event manager
        // Note: We don't have direct access to eventManager here
        // DataManager will handle error reporting
    }

    private addWarning(message: string, line?: number): void {
        this.warnings.push({message, line});
    }
}
