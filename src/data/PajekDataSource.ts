import type {AdHocData} from "../config/common.js";
import {BaseDataSourceConfig, DataSource, DataSourceChunk} from "./DataSource.js";

// Pajek has no additional config currently, so just use the base config
export type PajekDataSourceConfig = BaseDataSourceConfig;

interface ParsedVertex {
    id: string;
    label?: string;
    x?: number;
    y?: number;
    z?: number;
}

interface ParsedEdge {
    src: string;
    dst: string;
    weight?: number;
    directed: boolean;
}

/**
 * Data source for loading graph data from Pajek NET format files.
 * Supports vertices, edges (arcs), and undirected edges with coordinates and weights.
 */
export class PajekDataSource extends DataSource {
    static readonly type = "pajek";

    private config: PajekDataSourceConfig;

    /**
     * Creates a new PajekDataSource instance.
     * @param config - Configuration options for Pajek parsing and data loading
     */
    constructor(config: PajekDataSourceConfig) {
        super(config.errorLimit ?? 100, config.chunkSize);
        this.config = config;
    }

    protected getConfig(): BaseDataSourceConfig {
        return this.config;
    }

    /**
     * Fetches and parses Pajek NET format data into graph chunks.
     * @yields DataSourceChunk objects containing parsed nodes and edges
     */
    async *sourceFetchData(): AsyncGenerator<DataSourceChunk, void, unknown> {
        // Get Pajek content
        const content = await this.getContent();

        // Parse Pajek NET format
        const {vertices, edges} = this.parsePajek(content);

        // Convert to AdHocData
        const nodes = vertices.map((v) => this.vertexToNode(v));
        const edgeData = edges.map((e) => this.edgeToEdgeData(e));

        // Use shared chunking helper
        yield* this.chunkData(nodes, edgeData);
    }

    private parsePajek(content: string): {vertices: ParsedVertex[], edges: ParsedEdge[]} {
        const lines = content.split("\n").map((line) => line.trim());
        const vertices: ParsedVertex[] = [];
        const edges: ParsedEdge[] = [];

        let section: "none" | "vertices" | "arcs" | "edges" = "none";

        for (let lineNum = 0; lineNum < lines.length; lineNum++) {
            const line = lines[lineNum];

            // Skip blank lines
            if (!line) {
                continue;
            }

            // Check for section headers
            if (line.toLowerCase().startsWith("*vertices")) {
                section = "vertices";
                continue;
            }

            if (line.toLowerCase().startsWith("*arcs")) {
                section = "arcs";
                continue;
            }

            if (line.toLowerCase().startsWith("*edges")) {
                section = "edges";
                continue;
            }

            // Process line based on current section
            if (section === "vertices") {
                const vertex = this.parseVertexLine(line, lineNum);
                if (vertex) {
                    vertices.push(vertex);
                }
            } else if (section === "arcs") {
                const edge = this.parseEdgeLine(line, lineNum, true);
                if (edge) {
                    edges.push(edge);
                }
            } else if (section === "edges") {
                const edge = this.parseEdgeLine(line, lineNum, false);
                if (edge) {
                    edges.push(edge);
                }
            }
        }

        return {vertices, edges};
    }

    private parseVertexLine(line: string, lineNum: number): ParsedVertex | null {
        try {
            // Vertex format: id "label" x y z
            // Or: id x y z
            // Or: id "label"
            // Or: id

            // Extract vertex ID (first token)
            const {tokens, quotedIndices} = this.tokenizeLine(line);
            if (tokens.length === 0) {
                return null;
            }

            const id = tokens[0];
            let label: string | undefined;
            let x: number | undefined;
            let y: number | undefined;
            let z: number | undefined;

            // Check if second token is a quoted string (label)
            let coordStartIndex = 1;
            if (tokens.length > 1 && quotedIndices.has(1)) {
                label = tokens[1];
                coordStartIndex = 2;
            }

            // Parse coordinates
            if (tokens.length > coordStartIndex) {
                const xVal = parseFloat(tokens[coordStartIndex]);
                if (!isNaN(xVal)) {
                    x = xVal;
                }
            }

            if (tokens.length > coordStartIndex + 1) {
                const yVal = parseFloat(tokens[coordStartIndex + 1]);
                if (!isNaN(yVal)) {
                    y = yVal;
                }
            }

            if (tokens.length > coordStartIndex + 2) {
                const zVal = parseFloat(tokens[coordStartIndex + 2]);
                if (!isNaN(zVal)) {
                    z = zVal;
                }
            }

            return {id, label, x, y, z};
        } catch (error) {
            const canContinue = this.errorAggregator.addError({
                message: `Failed to parse vertex line ${lineNum + 1}: ${error instanceof Error ? error.message : String(error)}`,
                category: "parse-error",
                line: lineNum + 1,
            });

            if (!canContinue) {
                throw new Error(`Too many errors (${this.errorAggregator.getErrorCount()}), aborting parse`);
            }

            return null;
        }
    }

    private parseEdgeLine(line: string, lineNum: number, directed: boolean): ParsedEdge | null {
        try {
            // Edge format: src dst weight
            // Or: src dst
            const {tokens} = this.tokenizeLine(line);

            if (tokens.length < 2) {
                throw new Error("Edge must have at least source and target");
            }

            const src = tokens[0];
            const dst = tokens[1];
            let weight: number | undefined;

            if (tokens.length > 2) {
                const weightVal = parseFloat(tokens[2]);
                if (!isNaN(weightVal)) {
                    weight = weightVal;
                }
            }

            return {src, dst, weight, directed};
        } catch (error) {
            const canContinue = this.errorAggregator.addError({
                message: `Failed to parse edge line ${lineNum + 1}: ${error instanceof Error ? error.message : String(error)}`,
                category: "parse-error",
                line: lineNum + 1,
            });

            if (!canContinue) {
                throw new Error(`Too many errors (${this.errorAggregator.getErrorCount()}), aborting parse`);
            }

            return null;
        }
    }

    private tokenizeLine(line: string): {tokens: string[], quotedIndices: Set<number>} {
        const tokens: string[] = [];
        const quotedIndices = new Set<number>();
        let current = "";
        let inQuotes = false;

        for (const char of line) {
            if (char === "\"") {
                if (inQuotes) {
                    // End of quoted string
                    quotedIndices.add(tokens.length);
                    tokens.push(current);
                    current = "";
                    inQuotes = false;
                } else {
                    // Start of quoted string
                    if (current.trim()) {
                        tokens.push(current.trim());
                        current = "";
                    }

                    inQuotes = true;
                }

                continue;
            }

            if (inQuotes) {
                current += char;
            } else if (/\s/.test(char)) {
                if (current.trim()) {
                    tokens.push(current.trim());
                    current = "";
                }
            } else {
                current += char;
            }
        }

        if (current.trim()) {
            tokens.push(current.trim());
        }

        return {tokens, quotedIndices};
    }

    private vertexToNode(vertex: ParsedVertex): AdHocData {
        const node: Record<string, unknown> = {
            id: vertex.id,
        };

        if (vertex.label !== undefined) {
            node.label = vertex.label;
        }

        if (vertex.x !== undefined) {
            node.x = vertex.x;
        }

        if (vertex.y !== undefined) {
            node.y = vertex.y;
        }

        if (vertex.z !== undefined) {
            node.z = vertex.z;
        }

        return node as AdHocData;
    }

    private edgeToEdgeData(edge: ParsedEdge): AdHocData {
        const edgeData: Record<string, unknown> = {
            src: edge.src,
            dst: edge.dst,
            directed: edge.directed,
        };

        if (edge.weight !== undefined) {
            edgeData.weight = edge.weight;
        }

        return edgeData as AdHocData;
    }
}
