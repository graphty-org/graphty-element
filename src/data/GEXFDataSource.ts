import {XMLParser} from "fast-xml-parser";

import type {AdHocData} from "../config/common.js";
import {DataSource, DataSourceChunk} from "./DataSource.js";

export interface GEXFDataSourceConfig {
    data?: string;
    file?: File;
    url?: string;
    chunkSize?: number;
    errorLimit?: number;
}

interface GEXFAttribute {
    id: string;
    title: string;
    type: string;
}

export class GEXFDataSource extends DataSource {
    static readonly type = "gexf";

    private config: GEXFDataSourceConfig;
    private chunkSize: number;
    private errorLimit: number;
    private errors: {message: string, line?: number}[] = [];
    private warnings: {message: string, line?: number}[] = [];

    constructor(config: GEXFDataSourceConfig) {
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
            isArray: (name) => {
                // These elements should always be treated as arrays
                return ["node", "edge", "attribute", "attvalue"].includes(name);
            },
        });

        let parsed;
        try {
            parsed = parser.parse(xmlContent);
        } catch (error) {
            throw new Error(`Failed to parse GEXF XML: ${error instanceof Error ? error.message : String(error)}`);
        }

        const {gexf} = parsed;
        if (!gexf) {
            throw new Error("Invalid GEXF: missing <gexf> root element");
        }

        // Get graph element
        const {graph} = gexf;
        if (!graph) {
            throw new Error("Invalid GEXF: missing <graph> element");
        }

        // Parse attribute definitions
        const nodeAttributes = this.parseAttributeDefinitions(graph.attributes, "node");
        const edgeAttributes = this.parseAttributeDefinitions(graph.attributes, "edge");

        // Parse and yield nodes in chunks
        const nodes = this.parseNodes(graph.nodes?.node, nodeAttributes);
        const edges = this.parseEdges(graph.edges?.edge, edgeAttributes);

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
                throw new Error(`Failed to fetch GEXF from ${this.config.url}: ${response.status}`);
            }

            return await response.text();
        }

        throw new Error("GEXFDataSource requires data, file, or url");
    }

    private parseAttributeDefinitions(
        attributesData: unknown,
        forClass: "node" | "edge",
    ): Map<string, GEXFAttribute> {
        const attributes = new Map<string, GEXFAttribute>();

        if (!attributesData) {
            return attributes;
        }

        // Handle single or multiple <attributes> elements
        const attrGroups = Array.isArray(attributesData) ? attributesData : [attributesData];

        for (const group of attrGroups) {
            const groupClass = (group as {"@_class"?: string})["@_class"];
            if (groupClass !== forClass) {
                continue;
            }

            const attrList = (group as {attribute?: unknown[]}).attribute;
            if (!attrList) {
                continue;
            }

            const attrArray = Array.isArray(attrList) ? attrList : [attrList];

            for (const attr of attrArray) {
                const attrObj = attr as {
                    "@_id": string;
                    "@_title": string;
                    "@_type": string;
                };
                const id = attrObj["@_id"];
                const title = attrObj["@_title"] || id;
                const type = attrObj["@_type"] || "string";

                attributes.set(id, {id, title, type});
            }
        }

        return attributes;
    }

    private parseNodes(
        nodeData: unknown,
        attributes: Map<string, GEXFAttribute>,
    ): AdHocData[] {
        if (!nodeData) {
            return [] as AdHocData[];
        }

        const nodeArray = Array.isArray(nodeData) ? nodeData : [nodeData];
        const nodes: Record<string, unknown>[] = [];

        for (const node of nodeArray) {
            try {
                const nodeObj = node as {
                    "@_id": string;
                    "@_label"?: string;
                    "attvalues"?: {attvalue?: unknown[]};
                    "viz:position"?: {
                        "@_x"?: string;
                        "@_y"?: string;
                        "@_z"?: string;
                    };
                    "viz:color"?: {
                        "@_r"?: string;
                        "@_g"?: string;
                        "@_b"?: string;
                        "@_a"?: string;
                    };
                    "viz:size"?: {
                        "@_value"?: string;
                    };
                };

                const id = nodeObj["@_id"];
                if (!id) {
                    this.addError("Node missing id attribute");
                    continue;
                }

                const nodeData: Record<string, unknown> = {id};

                // Add label if present
                if (nodeObj["@_label"]) {
                    nodeData.label = nodeObj["@_label"];
                }

                // Parse attribute values
                if (nodeObj.attvalues?.attvalue) {
                    const attvalues = Array.isArray(nodeObj.attvalues.attvalue) ?
                        nodeObj.attvalues.attvalue :
                        [nodeObj.attvalues.attvalue];

                    for (const attvalue of attvalues) {
                        const attObj = attvalue as {"@_for": string, "@_value": string};
                        const attrId = attObj["@_for"];
                        const value = attObj["@_value"];

                        const attrDef = attributes.get(attrId);
                        if (attrDef) {
                            nodeData[attrDef.title] = this.parseValue(value, attrDef.type);
                        }
                    }
                }

                // Parse viz namespace elements
                if (nodeObj["viz:position"]) {
                    const pos = nodeObj["viz:position"];
                    nodeData.position = {
                        x: pos["@_x"] ? parseFloat(pos["@_x"]) : 0,
                        y: pos["@_y"] ? parseFloat(pos["@_y"]) : 0,
                        z: pos["@_z"] ? parseFloat(pos["@_z"]) : 0,
                    };
                }

                if (nodeObj["viz:color"]) {
                    const color = nodeObj["viz:color"];
                    nodeData.color = {
                        r: color["@_r"] ? parseInt(color["@_r"], 10) : 0,
                        g: color["@_g"] ? parseInt(color["@_g"], 10) : 0,
                        b: color["@_b"] ? parseInt(color["@_b"], 10) : 0,
                        a: color["@_a"] ? parseFloat(color["@_a"]) : 1.0,
                    };
                }

                if (nodeObj["viz:size"]) {
                    const size = nodeObj["viz:size"];
                    nodeData.size = size["@_value"] ? parseFloat(size["@_value"]) : 1.0;
                }

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

    private parseEdges(
        edgeData: unknown,
        attributes: Map<string, GEXFAttribute>,
    ): AdHocData[] {
        if (!edgeData) {
            return [] as AdHocData[];
        }

        const edgeArray = Array.isArray(edgeData) ? edgeData : [edgeData];
        const edges: Record<string, unknown>[] = [];

        for (const edge of edgeArray) {
            try {
                const edgeObj = edge as {
                    "@_id"?: string;
                    "@_source": string;
                    "@_target": string;
                    "@_weight"?: string;
                    "@_type"?: string;
                    "@_label"?: string;
                    "attvalues"?: {attvalue?: unknown[]};
                };

                const src = edgeObj["@_source"];
                const dst = edgeObj["@_target"];

                if (!src || !dst) {
                    this.addError("Edge missing source or target attribute");
                    continue;
                }

                const edgeData: Record<string, unknown> = {src, dst};

                // Add optional attributes
                if (edgeObj["@_id"]) {
                    edgeData.id = edgeObj["@_id"];
                }

                if (edgeObj["@_label"]) {
                    edgeData.label = edgeObj["@_label"];
                }

                if (edgeObj["@_weight"]) {
                    edgeData.weight = parseFloat(edgeObj["@_weight"]);
                }

                if (edgeObj["@_type"]) {
                    edgeData.type = edgeObj["@_type"];
                }

                // Parse attribute values
                if (edgeObj.attvalues?.attvalue) {
                    const attvalues = Array.isArray(edgeObj.attvalues.attvalue) ?
                        edgeObj.attvalues.attvalue :
                        [edgeObj.attvalues.attvalue];

                    for (const attvalue of attvalues) {
                        const attObj = attvalue as {"@_for": string, "@_value": string};
                        const attrId = attObj["@_for"];
                        const value = attObj["@_value"];

                        const attrDef = attributes.get(attrId);
                        if (attrDef) {
                            edgeData[attrDef.title] = this.parseValue(value, attrDef.type);
                        }
                    }
                }

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

    private parseValue(value: string, type: string): string | number | boolean {
        switch (type) {
            case "integer":
            case "long":
                return parseInt(value, 10);
            case "float":
            case "double":
                return parseFloat(value);
            case "boolean":
                return value === "true" || value === "1";
            default:
                return value;
        }
    }

    private addError(message: string, line?: number): void {
        this.errors.push({message, line});
    }

    private addWarning(message: string, line?: number): void {
        this.warnings.push({message, line});
    }
}
