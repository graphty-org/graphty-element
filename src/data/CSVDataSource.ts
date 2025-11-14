import Papa from "papaparse";

import {AdHocData} from "../config";
import {type CSVVariant, type CSVVariantInfo, detectCSVVariant} from "./csv-variant-detection.js";
import {DataSource, DataSourceChunk} from "./DataSource.js";

export interface CSVDataSourceConfig {
    data?: string;
    file?: File;
    url?: string;
    delimiter?: string;
    variant?: CSVVariant; // Allow explicit variant override
    sourceColumn?: string;
    targetColumn?: string;
    idColumn?: string;
    chunkSize?: number;
    errorLimit?: number;
    // For paired files
    nodeFile?: File;
    edgeFile?: File;
    nodeURL?: string;
    edgeURL?: string;
}

export class CSVDataSource extends DataSource {
    static readonly type = "csv";

    private config: CSVDataSourceConfig;
    private chunkSize: number;
    private errorLimit: number;
    private errors: {message: string, row?: number}[] = [];

    constructor(config: CSVDataSourceConfig) {
        super();
        this.config = {
            delimiter: ",",
            chunkSize: 1000,
            errorLimit: 100,
            ... config,
        };
        this.chunkSize = this.config.chunkSize ?? 1000;
        this.errorLimit = this.config.errorLimit ?? 100;
    }

    async *sourceFetchData(): AsyncGenerator<DataSourceChunk, void, unknown> {
        // Handle paired files first
        if (
            this.config.nodeFile ||
            this.config.edgeFile ||
            this.config.nodeURL ||
            this.config.edgeURL
        ) {
            yield* this.parsePairedFiles();
            return;
        }

        // Get CSV content
        const csvContent = await this.getContent();

        // Parse headers to detect variant
        const previewResult = Papa.parse(csvContent, {
            header: true,
            preview: 1,
            delimiter: this.config.delimiter,
            dynamicTyping: true,
            transformHeader: (header) => header.trim(),
        });

        const headers = previewResult.meta.fields ?? [];

        // Detect or use explicit variant
        let variantInfo: CSVVariantInfo;
        if (this.config.variant) {
            // User specified a variant - get defaults for that variant type
            const variantDefaults: Record<string, Partial<CSVVariantInfo>> = {
                "neo4j": {
                    hasHeaders: false,
                    labelColumn: ":LABEL",
                    typeColumn: ":TYPE",
                },
                "adjacency-list": {hasHeaders: false},
                "node-list": {hasHeaders: true},
                "edge-list": {
                    hasHeaders: true,
                    sourceColumn: "source",
                    targetColumn: "target",
                },
                "gephi": {
                    hasHeaders: true,
                    sourceColumn: "Source",
                    targetColumn: "Target",
                    typeColumn: "Type",
                    labelColumn: "Label",
                },
                "cytoscape": {
                    hasHeaders: true,
                    sourceColumn: "source",
                    targetColumn: "target",
                    interactionColumn: "interaction",
                },
                "generic": {hasHeaders: true},
            };

            const defaults = variantDefaults[this.config.variant] ?? {hasHeaders: true};
            variantInfo = {
                variant: this.config.variant,
                hasHeaders: defaults.hasHeaders ?? true,
                delimiter: this.config.delimiter ?? ",",
                // Use user config or variant defaults
                sourceColumn: this.config.sourceColumn ?? defaults.sourceColumn,
                targetColumn: this.config.targetColumn ?? defaults.targetColumn,
                idColumn: this.config.idColumn ?? defaults.idColumn,
                labelColumn: defaults.labelColumn,
                typeColumn: defaults.typeColumn,
                interactionColumn: defaults.interactionColumn,
            };
        } else {
            // Auto-detect variant
            variantInfo = {
                ... detectCSVVariant(headers),
                // Preserve user-specified delimiter if provided
                delimiter: this.config.delimiter ?? detectCSVVariant(headers).delimiter,
            };
        }

        // Parse full file
        // Neo4j format has multiple header rows, so we parse without headers
        const useHeaders = variantInfo.variant === "neo4j" ? false : variantInfo.hasHeaders;
        const fullParse = Papa.parse(csvContent, {
            header: useHeaders,
            delimiter: variantInfo.delimiter,
            dynamicTyping: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim(),
        });

        if (fullParse.errors.length > 0) {
            // Collect parsing errors but continue if possible
            for (const error of fullParse.errors) {
                this.addError(`CSV parsing error: ${error.message}`, error.row);

                if (this.errors.length >= this.errorLimit) {
                    throw new Error(
                        `Too many CSV parsing errors (${this.errors.length}), aborting`,
                    );
                }
            }
        }

        // Route to appropriate parser based on variant
        console.log("CSV: Routing to parser for variant:", variantInfo.variant, "hasHeaders:", variantInfo.hasHeaders, "rows:", fullParse.data.length);
        switch (variantInfo.variant) {
            case "neo4j":
                yield* this.parseNeo4jFormat(
                    fullParse.data as string[][],
                );
                break;
            case "gephi":
                yield* this.parseGephiFormat(
                    fullParse.data as Record<string, unknown>[],
                    variantInfo,
                );
                break;
            case "cytoscape":
                yield* this.parseCytoscapeFormat(
                    fullParse.data as Record<string, unknown>[],
                    variantInfo,
                );
                break;
            case "adjacency-list":
                console.log("CSV: Parsing adjacency list, first row:", fullParse.data[0]);
                yield* this.parseAdjacencyList(
                    fullParse.data as string[][],
                );
                break;
            case "node-list":
                yield* this.parseNodeList(fullParse.data as Record<string, unknown>[]);
                break;
            case "edge-list":
            case "generic":
            default:
                yield* this.parseEdgeList(fullParse.data as Record<string, unknown>[]);
                break;
        }
    }

    private *parseEdgeList(rows: Record<string, unknown>[]): Generator<DataSourceChunk, void, unknown> {
        const edges: unknown[] = [];
        const nodeIds = new Set<string>();
        // Default to lowercase column names for generic edge lists
        const sourceCol = this.config.sourceColumn ?? "source";
        const targetCol = this.config.targetColumn ?? "target";

        for (let i = 0; i < rows.length; i++) {
            try {
                const row = rows[i];
                const src = row[sourceCol];
                const dst = row[targetCol];

                if (src === null || src === undefined || dst === null || dst === undefined) {
                    this.addError(`Row ${i + 1}: Missing source or target`, i);
                    continue;
                }

                // Convert to strings safely
                let srcStr: string;
                if (typeof src === "string") {
                    srcStr = src;
                } else if (typeof src === "number") {
                    srcStr = src.toString();
                } else {
                    srcStr = JSON.stringify(src);
                }

                let dstStr: string;
                if (typeof dst === "string") {
                    dstStr = dst;
                } else if (typeof dst === "number") {
                    dstStr = dst.toString();
                } else {
                    dstStr = JSON.stringify(dst);
                }

                // Track unique node IDs
                nodeIds.add(srcStr);
                nodeIds.add(dstStr);

                // Create edge with all row data
                const edge: Record<string, unknown> = {
                    src: srcStr,
                    dst: dstStr,
                    ... row,
                };

                edges.push(edge);

                // Yield chunk when full
                if (edges.length >= this.chunkSize) {
                    yield {nodes: [] as AdHocData[], edges: edges.splice(0, this.chunkSize) as AdHocData[]};
                }
            } catch (error) {
                this.addError(
                    `Failed to parse row ${i + 1}: ${error instanceof Error ? error.message : String(error)}`,
                    i,
                );

                if (this.errors.length >= this.errorLimit) {
                    throw new Error(`Too many errors (${this.errors.length}), aborting parse`);
                }
            }
        }

        // Create nodes from unique IDs and yield final chunk
        const nodes: unknown[] = Array.from(nodeIds).map((id) => ({id}));

        // Always yield final chunk to ensure nodes are included
        // (edges may have been yielded in earlier chunks, but nodes are collected at the end)
        yield {nodes: nodes as AdHocData[], edges: edges as AdHocData[]};
    }

    private *parseNodeList(
        rows: Record<string, unknown>[],
    ): Generator<DataSourceChunk, void, unknown> {
        const nodes: unknown[] = [];

        for (let i = 0; i < rows.length; i++) {
            try {
                const row = rows[i];

                // Try to find ID
                const id = row.id ?? row.Id ?? row.ID ?? String(i);

                const node: Record<string, unknown> = {
                    id,
                    ... row,
                };

                nodes.push(node);

                // Yield chunk when full
                if (nodes.length >= this.chunkSize) {
                    yield {
                        nodes: nodes.splice(0, this.chunkSize) as AdHocData[],
                        edges: [] as AdHocData[],
                    };
                }
            } catch (error) {
                this.addError(
                    `Failed to parse row ${i + 1}: ${error instanceof Error ? error.message : String(error)}`,
                    i,
                );

                if (this.errors.length >= this.errorLimit) {
                    throw new Error(
                        `Too many errors (${this.errors.length}), aborting parse`,
                    );
                }
            }
        }

        // Yield remaining nodes
        if (nodes.length > 0) {
            yield {nodes: nodes as AdHocData[], edges: [] as AdHocData[]};
        }
    }

    private *parseNeo4jFormat(
        rows: string[][],
    ): Generator<DataSourceChunk, void, unknown> {
        // Neo4j format has multiple sections with headers
        // Format: header row, data rows, header row, data rows, etc.
        const nodes: unknown[] = [];
        const edges: unknown[] = [];

        let currentHeaders: string[] = [];
        let isNodeSection = false;
        let isEdgeSection = false;

        for (const row of rows) {
            if (row.length === 0) {
                continue;
            }

            // Check if this is a header row by looking for Neo4j special columns
            const hasIdColumn = row.some((col) => typeof col === "string" && col.endsWith(":ID"));
            const hasStartEnd = row.some((col) => col === ":START_ID" || col === ":END_ID");

            if (hasIdColumn || hasStartEnd) {
                // This is a header row
                currentHeaders = row.map((h) => String(h).trim());
                isNodeSection = hasIdColumn && !hasStartEnd;
                isEdgeSection = hasStartEnd;
                continue;
            }

            // Process data row based on current section
            if (isNodeSection) {
                const node: Record<string, unknown> = {};
                for (let i = 0; i < Math.min(row.length, currentHeaders.length); i++) {
                    const header = currentHeaders[i];
                    const value = row[i];

                    if (header.endsWith(":ID")) {
                        node.id = value;
                    } else if (header === ":LABEL") {
                        node.label = value;
                    } else if (!header.startsWith(":")) {
                        node[header] = value;
                    }
                }

                if (node.id) {
                    nodes.push(node);
                }
            } else if (isEdgeSection) {
                const edge: Record<string, unknown> = {};
                for (let i = 0; i < Math.min(row.length, currentHeaders.length); i++) {
                    const header = currentHeaders[i];
                    const value = row[i];

                    if (header === ":START_ID") {
                        edge.src = value;
                    } else if (header === ":END_ID") {
                        edge.dst = value;
                    } else if (header === ":TYPE") {
                        edge.type = value;
                    } else if (!header.startsWith(":")) {
                        edge[header] = value;
                    }
                }

                if (edge.src && edge.dst) {
                    edges.push(edge);
                }
            }

            // Yield in chunks
            if (nodes.length >= this.chunkSize) {
                yield {
                    nodes: nodes.splice(0, this.chunkSize) as AdHocData[],
                    edges: [],
                };
            }

            if (edges.length >= this.chunkSize) {
                yield {
                    nodes: [],
                    edges: edges.splice(0, this.chunkSize) as AdHocData[],
                };
            }
        }

        // Yield remaining
        if (nodes.length > 0 || edges.length > 0) {
            yield {nodes: nodes as AdHocData[], edges: edges as AdHocData[]};
        }
    }

    private *parseGephiFormat(
        rows: Record<string, unknown>[],
        info: CSVVariantInfo,
    ): Generator<DataSourceChunk, void, unknown> {
        // Gephi uses capitalized column names: Source, Target, Type, Id, Label, Weight
        // Just use the standard edge list parser with Gephi-specific column names
        const edges: unknown[] = [];
        const nodeIds = new Set<string>();

        for (let i = 0; i < rows.length; i++) {
            try {
                const row = rows[i];
                const src = row[info.sourceColumn ?? "Source"];
                const dst = row[info.targetColumn ?? "Target"];

                if (src === null || src === undefined || dst === null || dst === undefined) {
                    this.addError(`Row ${i + 1}: Missing source or target`, i);
                    continue;
                }

                // Convert to strings safely
                const srcStr = typeof src === "string" || typeof src === "number" ? String(src) : JSON.stringify(src);
                const dstStr = typeof dst === "string" || typeof dst === "number" ? String(dst) : JSON.stringify(dst);

                // Track unique node IDs
                nodeIds.add(srcStr);
                nodeIds.add(dstStr);

                // Create edge with all row data
                const edge: Record<string, unknown> = {
                    src: srcStr,
                    dst: dstStr,
                    ... row,
                };

                edges.push(edge);

                // Yield chunk when full
                if (edges.length >= this.chunkSize) {
                    yield {
                        nodes: [] as AdHocData[],
                        edges: edges.splice(0, this.chunkSize) as AdHocData[],
                    };
                }
            } catch (error) {
                this.addError(
                    `Failed to parse row ${i + 1}: ${error instanceof Error ? error.message : String(error)}`,
                    i,
                );

                if (this.errors.length >= this.errorLimit) {
                    throw new Error(
                        `Too many errors (${this.errors.length}), aborting parse`,
                    );
                }
            }
        }

        // Create nodes from unique IDs and yield final chunk
        const nodes: unknown[] = Array.from(nodeIds).map((id) => ({id}));
        yield {nodes: nodes as AdHocData[], edges: edges as AdHocData[]};
    }

    private *parseCytoscapeFormat(
        rows: Record<string, unknown>[],
        info: CSVVariantInfo,
    ): Generator<DataSourceChunk, void, unknown> {
        // Cytoscape has an 'interaction' column for edge type
        const edges: unknown[] = [];
        const nodeIds = new Set<string>();

        for (let i = 0; i < rows.length; i++) {
            try {
                const row = rows[i];
                const src = row[info.sourceColumn ?? "source"];
                const dst = row[info.targetColumn ?? "target"];

                if (src === null || src === undefined || dst === null || dst === undefined) {
                    this.addError(`Row ${i + 1}: Missing source or target`, i);
                    continue;
                }

                const srcStr = typeof src === "string" || typeof src === "number" ? String(src) : JSON.stringify(src);
                const dstStr = typeof dst === "string" || typeof dst === "number" ? String(dst) : JSON.stringify(dst);

                nodeIds.add(srcStr);
                nodeIds.add(dstStr);

                const edge: Record<string, unknown> = {
                    src: srcStr,
                    dst: dstStr,
                    ... row,
                };

                if (info.interactionColumn && info.interactionColumn in row) {
                    edge.interaction = row[info.interactionColumn];
                }

                edges.push(edge);

                if (edges.length >= this.chunkSize) {
                    yield {
                        nodes: [] as AdHocData[],
                        edges: edges.splice(0, this.chunkSize) as AdHocData[],
                    };
                }
            } catch (error) {
                this.addError(
                    `Failed to parse row ${i + 1}: ${error instanceof Error ? error.message : String(error)}`,
                    i,
                );

                if (this.errors.length >= this.errorLimit) {
                    throw new Error(
                        `Too many errors (${this.errors.length}), aborting parse`,
                    );
                }
            }
        }

        const nodes: unknown[] = Array.from(nodeIds).map((id) => ({id}));
        yield {nodes: nodes as AdHocData[], edges: edges as AdHocData[]};
    }

    private *parseAdjacencyList(
        rows: string[][],
    ): Generator<DataSourceChunk, void, unknown> {
        // Format: each row is [node, neighbor1, neighbor2, ...]
        // Can optionally have weights: node neighbor1:weight1 neighbor2:weight2
        const edges: unknown[] = [];
        const nodeIds = new Set<string>();
        console.log("CSV: parseAdjacencyList called with", rows.length, "rows");

        for (const row of rows) {
            if (row.length < 2) {
                console.log("CSV: Skipping short row:", row);
                continue;
            }

            const sourceNode = String(row[0]);
            nodeIds.add(sourceNode);

            // Process neighbors
            for (let j = 1; j < row.length; j++) {
                const neighbor = String(row[j]);
                if (!neighbor) {
                    continue;
                }

                // Check for weight notation: neighbor:weight
                let targetNode = neighbor;
                let weight: number | undefined;

                if (neighbor.includes(":")) {
                    const parts = neighbor.split(":");
                    targetNode = parts[0];
                    weight = parseFloat(parts[1]);
                }

                nodeIds.add(targetNode);

                const edge: Record<string, unknown> = {
                    src: sourceNode,
                    dst: targetNode,
                };

                if (weight !== undefined && !isNaN(weight)) {
                    edge.weight = weight;
                }

                edges.push(edge);

                if (edges.length >= this.chunkSize) {
                    yield {
                        nodes: [] as AdHocData[],
                        edges: edges.splice(0, this.chunkSize) as AdHocData[],
                    };
                }
            }
        }

        console.log("CSV: parseAdjacencyList yielding", edges.length, "edges and", nodeIds.size, "nodes");
        // Create nodes for all unique node IDs
        const nodes = Array.from(nodeIds).map((id) => ({id}));
        yield {nodes: nodes as unknown as AdHocData[], edges: edges as AdHocData[]};
    }

    private async *parsePairedFiles(): AsyncGenerator<
        DataSourceChunk,
        void,
        unknown
    > {
        // Load and parse node file
        const nodes: unknown[] = [];
        if (this.config.nodeFile ?? this.config.nodeURL) {
            const nodeContent = this.config.nodeFile ?
                await this.config.nodeFile.text() :
                await (await fetch(this.config.nodeURL ?? "")).text();

            const nodeParse = Papa.parse(nodeContent, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                transformHeader: (header) => header.trim(),
            });

            for (const row of nodeParse.data as Record<string, unknown>[]) {
                nodes.push({
                    id: row.id ?? row.Id ?? row.ID,
                    ... row,
                });
            }
        }

        // Load and parse edge file
        const edges: unknown[] = [];
        if (this.config.edgeFile ?? this.config.edgeURL) {
            const edgeContent = this.config.edgeFile ?
                await this.config.edgeFile.text() :
                await (await fetch(this.config.edgeURL ?? "")).text();

            const edgeParse = Papa.parse(edgeContent, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                transformHeader: (header) => header.trim(),
            });

            for (const row of edgeParse.data as Record<string, unknown>[]) {
                edges.push({
                    src: row.source ?? row.src ?? row.Source,
                    dst: row.target ?? row.dst ?? row.Target,
                    ... row,
                });
            }
        }

        // Yield all data
        yield {nodes: nodes as AdHocData[], edges: edges as AdHocData[]};
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
                throw new Error(`Failed to fetch CSV from ${this.config.url}: ${response.status}`);
            }

            return await response.text();
        }

        throw new Error("CSVDataSource requires data, file, or url");
    }

    private addError(message: string, row?: number): void {
        this.errors.push({message, row});
    }
}
