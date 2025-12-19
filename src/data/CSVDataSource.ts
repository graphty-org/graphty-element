import Papa from "papaparse";

import {AdHocData} from "../config";
import {type CSVVariant, type CSVVariantInfo, detectCSVVariant} from "./csv-variant-detection.js";
import {BaseDataSourceConfig, DataSource, DataSourceChunk} from "./DataSource.js";

export interface CSVDataSourceConfig extends BaseDataSourceConfig {
    delimiter?: string;
    variant?: CSVVariant; // Allow explicit variant override
    sourceColumn?: string;
    targetColumn?: string;
    idColumn?: string;
    // For paired files
    nodeFile?: File;
    edgeFile?: File;
    nodeURL?: string;
    edgeURL?: string;
}

export class CSVDataSource extends DataSource {
    static readonly type = "csv";

    private config: CSVDataSourceConfig;

    constructor(config: CSVDataSourceConfig) {
        super(config.errorLimit ?? 100, config.chunkSize);
        this.config = {
            delimiter: ",",
            chunkSize: 1000,
            errorLimit: 100,
            ... config,
        };
    }

    protected getConfig(): BaseDataSourceConfig {
        return this.config;
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
                const canContinue = this.errorAggregator.addError({
                    message: `CSV parsing error: ${error.message}`,
                    line: error.row,
                    category: "parse-error",
                });

                if (!canContinue) {
                    throw new Error(
                        `Too many CSV parsing errors (${this.errorAggregator.getErrorCount()}), aborting`,
                    );
                }
            }
        }

        // Route to appropriate parser based on variant
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

    /**
     * Create an edge from CSV row data
     * Returns null if source or target is missing (and logs error)
     *
     * @param src Source node ID (will be converted to string)
     * @param dst Target node ID (will be converted to string)
     * @param row Full row data for additional properties
     * @param sourceColName Name of source column (for error messages)
     * @param targetColName Name of target column (for error messages)
     * @param rowIndex Row index (for error messages)
     */
    private createEdge(
        src: unknown,
        dst: unknown,
        row: Record<string, unknown>,
        sourceColName: string,
        targetColName: string,
        rowIndex: number,
    ): AdHocData | null {
        // Validate source and target exist
        if (src === null || src === undefined || src === "") {
            this.errorAggregator.addError({
                message: `Missing source in row ${rowIndex} (column: ${sourceColName})`,
                line: rowIndex,
                category: "missing-data",
                field: "source",
            });
            return null;
        }

        if (dst === null || dst === undefined || dst === "") {
            this.errorAggregator.addError({
                message: `Missing target in row ${rowIndex} (column: ${targetColName})`,
                line: rowIndex,
                category: "missing-data",
                field: "target",
            });
            return null;
        }

        // Convert to strings (CSV parsers may return numbers/booleans)
        const srcStr = typeof src === "string" || typeof src === "number" ? String(src) : JSON.stringify(src);
        const dstStr = typeof dst === "string" || typeof dst === "number" ? String(dst) : JSON.stringify(dst);

        // Create edge with all row properties except source/target columns
        // (they're now in src/dst)
        const edge: Record<string, unknown> = {
            src: srcStr,
            dst: dstStr,
        };

        // Copy all other properties from row except source/target columns
        for (const key in row) {
            if (key !== sourceColName && key !== targetColName) {
                edge[key] = row[key];
            }
        }

        return edge as AdHocData;
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
                const edge = this.createEdge(
                    row[sourceCol],
                    row[targetCol],
                    row,
                    sourceCol,
                    targetCol,
                    i + 1,
                );

                if (edge) {
                    // Track unique node IDs
                    nodeIds.add(edge.src as string);
                    nodeIds.add(edge.dst as string);

                    edges.push(edge);

                    // Yield chunk when full
                    if (edges.length >= this.chunkSize) {
                        yield {nodes: [] as AdHocData[], edges: edges.splice(0, this.chunkSize) as AdHocData[]};
                    }
                }
            } catch (error) {
                const canContinue = this.errorAggregator.addError({
                    message: `Failed to parse row ${i + 1}: ${error instanceof Error ? error.message : String(error)}`,
                    line: i,
                    category: "parse-error",
                });

                if (!canContinue) {
                    throw new Error(`Too many errors (${this.errorAggregator.getErrorCount()}), aborting parse`);
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
                const canContinue = this.errorAggregator.addError({
                    message: `Failed to parse row ${i + 1}: ${error instanceof Error ? error.message : String(error)}`,
                    line: i,
                    category: "parse-error",
                });

                if (!canContinue) {
                    throw new Error(
                        `Too many errors (${this.errorAggregator.getErrorCount()}), aborting parse`,
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
                currentHeaders = row.map((h) => h.trim());
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
        const edges: unknown[] = [];
        const nodeIds = new Set<string>();
        const sourceCol = info.sourceColumn ?? "Source";
        const targetCol = info.targetColumn ?? "Target";

        for (let i = 0; i < rows.length; i++) {
            try {
                const row = rows[i];
                const edge = this.createEdge(
                    row[sourceCol],
                    row[targetCol],
                    row,
                    sourceCol,
                    targetCol,
                    i + 1,
                );

                if (edge) {
                    // Track unique node IDs
                    nodeIds.add(edge.src as string);
                    nodeIds.add(edge.dst as string);

                    edges.push(edge);

                    // Yield chunk when full
                    if (edges.length >= this.chunkSize) {
                        yield {
                            nodes: [] as AdHocData[],
                            edges: edges.splice(0, this.chunkSize) as AdHocData[],
                        };
                    }
                }
            } catch (error) {
                const canContinue = this.errorAggregator.addError({
                    message: `Failed to parse row ${i + 1}: ${error instanceof Error ? error.message : String(error)}`,
                    line: i,
                    category: "parse-error",
                });

                if (!canContinue) {
                    throw new Error(
                        `Too many errors (${this.errorAggregator.getErrorCount()}), aborting parse`,
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
        const sourceCol = info.sourceColumn ?? "source";
        const targetCol = info.targetColumn ?? "target";

        for (let i = 0; i < rows.length; i++) {
            try {
                const row = rows[i];
                const edge = this.createEdge(
                    row[sourceCol],
                    row[targetCol],
                    row,
                    sourceCol,
                    targetCol,
                    i + 1,
                );

                if (edge) {
                    // Track unique node IDs
                    nodeIds.add(edge.src as string);
                    nodeIds.add(edge.dst as string);

                    edges.push(edge);

                    if (edges.length >= this.chunkSize) {
                        yield {
                            nodes: [] as AdHocData[],
                            edges: edges.splice(0, this.chunkSize) as AdHocData[],
                        };
                    }
                }
            } catch (error) {
                const canContinue = this.errorAggregator.addError({
                    message: `Failed to parse row ${i + 1}: ${error instanceof Error ? error.message : String(error)}`,
                    line: i,
                    category: "parse-error",
                });

                if (!canContinue) {
                    throw new Error(
                        `Too many errors (${this.errorAggregator.getErrorCount()}), aborting parse`,
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

        for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
            const row = rows[rowIndex];
            if (row.length < 2) {
                continue;
            }

            const sourceNode = row[0];
            nodeIds.add(sourceNode);

            // Process neighbors
            for (let j = 1; j < row.length; j++) {
                const neighbor = row[j];
                if (!neighbor) {
                    continue;
                }

                // Check for weight notation: neighbor:weight
                let targetNode = neighbor;
                const rowData: Record<string, unknown> = {};

                if (neighbor.includes(":")) {
                    const parts = neighbor.split(":");
                    targetNode = parts[0];
                    const weight = parseFloat(parts[1]);
                    if (!isNaN(weight)) {
                        rowData.weight = weight;
                    }
                }

                const edge = this.createEdge(
                    sourceNode,
                    targetNode,
                    rowData,
                    "source",
                    "target",
                    rowIndex + 1,
                );

                if (edge) {
                    nodeIds.add(edge.src as string);
                    nodeIds.add(edge.dst as string);

                    edges.push(edge);

                    if (edges.length >= this.chunkSize) {
                        yield {
                            nodes: [] as AdHocData[],
                            edges: edges.splice(0, this.chunkSize) as AdHocData[],
                        };
                    }
                }
            }
        }

        // Create nodes for all unique node IDs
        const nodes = Array.from(nodeIds).map((id) => ({id}));
        yield {nodes: nodes as unknown as AdHocData[], edges: edges as AdHocData[]};
    }

    private async *parsePairedFiles(): AsyncGenerator<
        DataSourceChunk,
        void,
        unknown
    > {
        // Validate that both URLs or both files are provided
        const hasNodeSource = !!(this.config.nodeURL ?? this.config.nodeFile);
        const hasEdgeSource = !!(this.config.edgeURL ?? this.config.edgeFile);

        if (!hasNodeSource || !hasEdgeSource) {
            throw new Error(
                "parsePairedFiles requires both node and edge sources. " +
                "Provide either (nodeURL + edgeURL) or (nodeFile + edgeFile).",
            );
        }

        // Load and parse node file
        const nodes: unknown[] = [];
        if (this.config.nodeFile ?? this.config.nodeURL) {
            const nodeContent = this.config.nodeFile ?
                await this.config.nodeFile.text() :
                await (await this.fetchWithRetry(this.config.nodeURL ?? "")).text();

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
                await (await this.fetchWithRetry(this.config.edgeURL ?? "")).text();

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

        // Yield data in chunks using inherited helper
        yield* this.chunkData(nodes as AdHocData[], edges as AdHocData[]);
    }
}
