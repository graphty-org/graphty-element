import type {AdHocData} from "../config/common.js";
import {BaseDataSourceConfig, DataSource, DataSourceChunk} from "./DataSource.js";

// DOT has no additional config currently, so just use the base config
export type DOTDataSourceConfig = BaseDataSourceConfig;

interface DOTNode {
    id: string;
    attributes: Record<string, string | number>;
}

interface DOTEdge {
    src: string;
    dst: string;
    attributes: Record<string, string | number>;
}

export class DOTDataSource extends DataSource {
    static readonly type = "dot";

    private config: DOTDataSourceConfig;

    constructor(config: DOTDataSourceConfig) {
        super(config.errorLimit ?? 100, config.chunkSize);
        this.config = config;
    }

    protected getConfig(): BaseDataSourceConfig {
        return this.config;
    }

    async *sourceFetchData(): AsyncGenerator<DataSourceChunk, void, unknown> {
    // Get DOT content
        const dotContent = await this.getContent();

        // Parse DOT
        const {nodes, edges} = this.parseDOT(dotContent);

        // Use shared chunking helper
        yield* this.chunkData(nodes, edges);
    }

    private parseDOT(content: string): {nodes: AdHocData[], edges: AdHocData[]} {
    // Remove comments
        let cleaned = content.replace(/\/\/.*$/gm, ""); // Single-line comments
        cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, ""); // Multi-line comments

        // Tokenize
        const tokens = this.tokenize(cleaned);

        // Parse structure
        const {nodes: parsedNodes, edges: parsedEdges} = this.parseTokens(tokens);

        // Convert to AdHocData
        const nodes = parsedNodes.map((node) => ({
            id: node.id,
            ... node.attributes,
        })) as unknown as AdHocData[];

        const edges = parsedEdges.map((edge) => ({
            src: edge.src,
            dst: edge.dst,
            ... edge.attributes,
        })) as unknown as AdHocData[];

        return {nodes, edges};
    }

    private tokenize(content: string): string[] {
        const tokens: string[] = [];
        let current = "";
        let inString = false;
        let inHtmlLabel = false;
        let htmlDepth = 0;

        for (let i = 0; i < content.length; i++) {
            const char = content[i];

            // Handle HTML-like labels
            if (!inString && char === "<" && content[i + 1] !== "<") {
                inHtmlLabel = true;
                htmlDepth++;
                current += char;
                continue;
            }

            if (inHtmlLabel && char === ">") {
                current += char;
                htmlDepth--;
                if (htmlDepth === 0) {
                    inHtmlLabel = false;
                }

                continue;
            }

            if (inHtmlLabel) {
                current += char;
                if (char === "<") {
                    htmlDepth++;
                }

                continue;
            }

            // Handle quoted strings
            if (char === "\"" && (i === 0 || content[i - 1] !== "\\")) {
                if (inString) {
                    tokens.push(current);
                    current = "";
                    inString = false;
                } else {
                    if (current.trim()) {
                        tokens.push(current.trim());
                        current = "";
                    }

                    inString = true;
                }

                continue;
            }

            if (inString) {
                // Handle escape sequences
                if (char === "\\" && i + 1 < content.length) {
                    const next = content[i + 1];
                    if (next === "\"" || next === "\\") {
                        current += next;
                        i++;
                        continue;
                    }
                }

                current += char;
                continue;
            }

            // Handle structural characters
            if (["{", "}", "[", "]", ";", ",", "="].includes(char)) {
                if (current.trim()) {
                    tokens.push(current.trim());
                    current = "";
                }

                tokens.push(char);
                continue;
            }

            // Handle edge operators
            if (char === "-") {
                if (i + 1 < content.length) {
                    const next = content[i + 1];
                    if (next === "-" || next === ">") {
                        if (current.trim()) {
                            tokens.push(current.trim());
                            current = "";
                        }

                        tokens.push(char + next);
                        i++;
                        continue;
                    }
                }
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

    private parseTokens(tokens: string[]): {nodes: DOTNode[], edges: DOTEdge[]} {
        const nodes = new Map<string, DOTNode>();
        const edges: DOTEdge[] = [];
        let i = 0;

        // Skip graph type and optional name
        while (i < tokens.length && !(/^(strict|graph|digraph)$/i.exec(tokens[i]))) {
            i++;
        }

        if (/^strict$/i.exec(tokens[i])) {
            i++; // Skip 'strict'
        }

        if (/^(graph|digraph)$/i.exec(tokens[i])) {
            i++; // Skip 'graph' or 'digraph'
        }

        // Skip optional graph name
        if (tokens[i] && tokens[i] !== "{") {
            i++; // Skip graph name
        }

        // Find opening brace
        while (i < tokens.length && tokens[i] !== "{") {
            i++;
        }
        i++; // Skip '{'

        // Parse graph contents (track brace depth for subgraphs)
        let braceDepth = 1;
        while (i < tokens.length && braceDepth > 0) {
            const token = tokens[i];

            // Track brace depth
            if (token === "{") {
                braceDepth++;
                i++;
                continue;
            }

            if (token === "}") {
                braceDepth--;
                i++;
                continue;
            }

            // Skip subgraph keyword (but continue parsing contents normally)
            if (/^subgraph$/i.exec(token)) {
                i++;
                // Skip optional subgraph name
                if (tokens[i] && tokens[i] !== "{" && tokens[i] !== ";") {
                    i++;
                }

                continue;
            }

            // Skip graph/subgraph-level attribute assignments (e.g., label = "value", rankdir = "LR")
            if (i + 2 < tokens.length && tokens[i + 1] === "=") {
                i += 3; // Skip: identifier, "=", value

                // Skip optional semicolon
                if (tokens[i] === ";") {
                    i++;
                }

                continue;
            }

            // Check if this is an edge
            if (i + 2 < tokens.length && (tokens[i + 1] === "->" || tokens[i + 1] === "--")) {
                const src = this.unquoteId(token);
                // const operator = tokens[i + 1]; // Unused - could track directionality
                const dst = this.unquoteId(tokens[i + 2]);

                // Ensure nodes exist
                if (!nodes.has(src)) {
                    nodes.set(src, {id: src, attributes: {}});
                }

                if (!nodes.has(dst)) {
                    nodes.set(dst, {id: dst, attributes: {}});
                }

                // Parse edge attributes
                const attributes: Record<string, string | number> = {};
                i += 3;

                if (tokens[i] === "[") {
                    i++;
                    const attrs = this.parseAttributes(tokens, i);
                    Object.assign(attributes, attrs.attributes);
                    i = attrs.index;
                }

                edges.push({src, dst, attributes});

                // Skip semicolon if present
                if (tokens[i] === ";") {
                    i++;
                }
            } else if (token !== ";") {
                // Check if this is a node
                const nodeId = this.unquoteId(token);
                i++;

                // Parse node attributes
                let attributes: Record<string, string | number> = {};
                if (tokens[i] === "[") {
                    i++;
                    const attrs = this.parseAttributes(tokens, i);
                    ({attributes, index: i} = attrs);
                }

                // Add or update node
                if (nodes.has(nodeId)) {
                    const existingNode = nodes.get(nodeId);
                    if (existingNode) {
                        Object.assign(existingNode.attributes, attributes);
                    }
                } else {
                    nodes.set(nodeId, {id: nodeId, attributes});
                }

                // Skip semicolon if present
                if (tokens[i] === ";") {
                    i++;
                }
            } else {
                // Semicolon
                i++;
            }
        }

        return {
            nodes: Array.from(nodes.values()),
            edges,
        };
    }

    private parseAttributes(
        tokens: string[],
        startIndex: number,
    ): {attributes: Record<string, string | number>, index: number} {
        const attributes: Record<string, string | number> = {};
        let i = startIndex;

        while (i < tokens.length && tokens[i] !== "]") {
            const key = tokens[i];

            if (key === "," || key === ";") {
                i++;
                continue;
            }

            i++;

            // Expect '='
            if (tokens[i] !== "=") {
                i++;
                continue;
            }

            i++; // Skip '='

            // Get value
            const value = tokens[i];
            attributes[key] = this.parseValue(value);

            i++;

            // Skip comma or semicolon
            if (tokens[i] === "," || tokens[i] === ";") {
                i++;
            }
        }

        if (tokens[i] === "]") {
            i++; // Skip ']'
        }

        return {attributes, index: i};
    }

    private unquoteId(id: string): string {
    // Remove quotes if present
        if (id.startsWith("\"") && id.endsWith("\"")) {
            return id.slice(1, -1);
        }

        return id;
    }

    private parseValue(value: string): string | number {
    // Remove quotes if present
        if (value.startsWith("\"") && value.endsWith("\"")) {
            return value.slice(1, -1);
        }

        // Try to parse as number
        if (/^-?\d+$/.test(value)) {
            return parseInt(value, 10);
        }

        if (/^-?\d+\.\d+$/.test(value)) {
            return parseFloat(value);
        }

        return value;
    }
}
