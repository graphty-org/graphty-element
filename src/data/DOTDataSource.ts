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
        // Handle empty content gracefully
        if (content.trim() === "") {
            return {nodes: [], edges: []};
        }

        // Remove comments
        let cleaned = content.replace(/\/\/.*$/gm, ""); // Single-line comments
        cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, ""); // Multi-line comments

        // Tokenize with error handling
        let tokens: string[];
        try {
            tokens = this.tokenize(cleaned);
        } catch (error) {
            const canContinue = this.errorAggregator.addError({
                message: `Failed to tokenize DOT content: ${error instanceof Error ? error.message : String(error)}`,
                category: "parse-error",
            });

            if (!canContinue) {
                throw new Error(`Too many errors (${this.errorAggregator.getErrorCount()}), aborting parse`);
            }

            return {nodes: [], edges: []};
        }

        // Handle empty token list
        if (tokens.length === 0) {
            return {nodes: [], edges: []};
        }

        // Parse structure with error recovery
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
                    // End of quoted string - check if followed by port syntax (:port or :port:compass)
                    // If so, include the port as part of this token
                    if (i + 1 < content.length && content[i + 1] === ":") {
                        // Continue collecting the port suffix
                        let portEnd = i + 2;
                        while (portEnd < content.length &&
                               !/[\s{}[\];,=]/.test(content[portEnd]) &&
                               content[portEnd] !== "\"" &&
                               !(content[portEnd] === "-" && portEnd + 1 < content.length &&
                                 (content[portEnd + 1] === ">" || content[portEnd + 1] === "-"))) {
                            portEnd++;
                        }

                        current += `:${content.substring(i + 2, portEnd)}`;
                        i = portEnd - 1; // -1 because loop will increment
                    }

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
            const statementStartIndex = i;

            try {
                // Handle closing brace
                if (token === "}") {
                    braceDepth--;
                    i++;
                    continue;
                }

                // Check if this is an anonymous subgraph starting an edge statement like {A B} -> C
                // MUST check this BEFORE the generic brace handling
                if (token === "{") {
                    // Look ahead to see if there's an edge operator after the closing brace
                    const closingIndex = this.findMatchingBrace(tokens, i);
                    if (closingIndex !== -1 &&
                        closingIndex + 1 < tokens.length &&
                        (tokens[closingIndex + 1] === "->" || tokens[closingIndex + 1] === "--")) {
                        // This is an edge statement starting with an anonymous subgraph
                        const firstNodes = this.collectSubgraphNodes(tokens, i);
                        const chainNodes = this.collectEdgeChainNodesFromGroups(
                            [firstNodes.nodes],
                            tokens,
                            firstNodes.endIndex,
                        );

                        // Create edges between consecutive nodes in the chain
                        for (let j = 0; j < chainNodes.nodes.length - 1; j++) {
                            const srcNodes = chainNodes.nodes[j];
                            const dstNodes = chainNodes.nodes[j + 1];

                            // Cartesian product: each src connects to each dst
                            for (const src of srcNodes) {
                                for (const dst of dstNodes) {
                                    // Ensure nodes exist
                                    if (!nodes.has(src)) {
                                        nodes.set(src, {id: src, attributes: {}});
                                    }

                                    if (!nodes.has(dst)) {
                                        nodes.set(dst, {id: dst, attributes: {}});
                                    }

                                    edges.push({src, dst, attributes: chainNodes.attributes});
                                }
                            }
                        }

                        i = chainNodes.endIndex;

                        // Skip semicolon if present
                        if (tokens[i] === ";") {
                            i++;
                        }

                        continue;
                    }

                    // Not an edge statement, just a regular subgraph - continue normal processing
                    braceDepth++;
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

                // Handle 'node', 'edge', 'graph' keywords followed by '[' (default attribute statements)
                // These are NOT node declarations - they set default attributes for subsequent elements
                if (/^(node|edge|graph)$/i.test(token) && tokens[i + 1] === "[") {
                    i++; // Skip the keyword
                    i++; // Skip '['
                    // Skip the attributes - we don't apply defaults (just structure parsing)
                    const attrs = this.parseAttributes(tokens, i);
                    i = attrs.index;

                    // Skip optional semicolon
                    if (tokens[i] === ";") {
                        i++;
                    }

                    continue;
                }

                // Check if this is an edge statement (handles chains like a -> b -> c -> d)
                if (i + 2 < tokens.length && (tokens[i + 1] === "->" || tokens[i + 1] === "--")) {
                    // Collect all nodes in the edge chain, handling anonymous subgraphs
                    const chainNodes = this.collectEdgeChainNodes(token, tokens, i + 1);

                    // Create edges between consecutive nodes in the chain
                    for (let j = 0; j < chainNodes.nodes.length - 1; j++) {
                        const srcNodes = chainNodes.nodes[j];
                        const dstNodes = chainNodes.nodes[j + 1];

                        // Cartesian product: each src connects to each dst
                        for (const src of srcNodes) {
                            for (const dst of dstNodes) {
                                // Ensure nodes exist
                                if (!nodes.has(src)) {
                                    nodes.set(src, {id: src, attributes: {}});
                                }

                                if (!nodes.has(dst)) {
                                    nodes.set(dst, {id: dst, attributes: {}});
                                }

                                edges.push({src, dst, attributes: chainNodes.attributes});
                            }
                        }
                    }

                    i = chainNodes.endIndex;

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
            } catch (error) {
                // Error recovery: log error and try to skip to next statement
                const canContinue = this.errorAggregator.addError({
                    message: `Failed to parse DOT statement at token ${statementStartIndex} ("${token}"): ${error instanceof Error ? error.message : String(error)}`,
                    category: "parse-error",
                });

                if (!canContinue) {
                    throw new Error(`Too many errors (${this.errorAggregator.getErrorCount()}), aborting parse`);
                }

                // Skip to the next semicolon or closing brace to recover
                i = this.skipToNextStatement(tokens, i);
            }
        }

        return {
            nodes: Array.from(nodes.values()),
            edges,
        };
    }

    /**
     * Skips tokens until the next statement boundary (semicolon or closing brace).
     * Used for error recovery to continue parsing after a malformed statement.
     */
    private skipToNextStatement(tokens: string[], startIndex: number): number {
        let i = startIndex;
        let braceDepth = 0;

        while (i < tokens.length) {
            const token = tokens[i];

            if (token === "{") {
                braceDepth++;
            } else if (token === "}") {
                if (braceDepth > 0) {
                    braceDepth--;
                } else {
                    // Found a closing brace at the current level - don't consume it
                    return i;
                }
            } else if (token === ";" && braceDepth === 0) {
                // Found semicolon at current level - skip it and return
                return i + 1;
            }

            i++;
        }

        return i;
    }

    /**
     * Finds the index of the matching closing brace for an opening brace at startIndex.
     * Returns -1 if no matching brace is found.
     */
    private findMatchingBrace(tokens: string[], startIndex: number): number {
        if (tokens[startIndex] !== "{") {
            return -1;
        }

        let depth = 0;
        for (let i = startIndex; i < tokens.length; i++) {
            if (tokens[i] === "{") {
                depth++;
            } else if (tokens[i] === "}") {
                depth--;
                if (depth === 0) {
                    return i;
                }
            }
        }

        return -1;
    }

    /**
     * Collects all nodes in an edge chain, handling anonymous subgraphs.
     * For example:
     * - "a -> b -> c" returns [[a], [b], [c]]
     * - "{A B} -> {C D}" returns [[A, B], [C, D]]
     * - "a -> {B C} -> d" returns [[a], [B, C], [d]]
     */
    private collectEdgeChainNodes(
        firstToken: string,
        tokens: string[],
        operatorIndex: number,
    ): {nodes: string[][], attributes: Record<string, string | number>, endIndex: number} {
        // Start with the first token as a single-node group
        const firstGroup = [this.unquoteId(firstToken)];
        return this.collectEdgeChainNodesFromGroups([firstGroup], tokens, operatorIndex);
    }

    /**
     * Continues collecting edge chain nodes from an initial set of groups.
     * Used when the first part of the chain is an anonymous subgraph.
     */
    private collectEdgeChainNodesFromGroups(
        initialGroups: string[][],
        tokens: string[],
        operatorIndex: number,
    ): {nodes: string[][], attributes: Record<string, string | number>, endIndex: number} {
        const nodeGroups: string[][] = [... initialGroups];
        let i = operatorIndex;

        // Parse the edge chain: -> node1 -> node2 -> ...
        while (i < tokens.length && (tokens[i] === "->" || tokens[i] === "--")) {
            i++; // Skip the edge operator

            // Check if next element is an anonymous subgraph
            if (tokens[i] === "{") {
                // Collect nodes from anonymous subgraph
                const subgraphNodes = this.collectSubgraphNodes(tokens, i);
                nodeGroups.push(subgraphNodes.nodes);
                i = subgraphNodes.endIndex;
            } else {
                // Single node
                nodeGroups.push([this.unquoteId(tokens[i])]);
                i++;
            }
        }

        // Parse edge attributes if present
        const attributes: Record<string, string | number> = {};
        if (tokens[i] === "[") {
            i++; // Skip '['
            const attrs = this.parseAttributes(tokens, i);
            Object.assign(attributes, attrs.attributes);
            i = attrs.index;
        }

        return {nodes: nodeGroups, attributes, endIndex: i};
    }

    /**
     * Collects node IDs from an anonymous subgraph like { A B C }
     * Used for edge shorthand like {A B} -> {C D}
     */
    private collectSubgraphNodes(
        tokens: string[],
        startIndex: number,
    ): {nodes: string[], endIndex: number} {
        const nodes: string[] = [];
        let i = startIndex;

        if (tokens[i] !== "{") {
            return {nodes, endIndex: i};
        }

        i++; // Skip '{'
        let braceDepth = 1;

        while (i < tokens.length && braceDepth > 0) {
            const token = tokens[i];

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

            // Skip structural tokens and keywords
            if (token === ";" || token === "," ||
                /^(subgraph|node|edge|graph)$/i.test(token)) {
                i++;
                continue;
            }

            // Skip attribute lists
            if (token === "[") {
                i++;
                const attrs = this.parseAttributes(tokens, i);
                i = attrs.index;
                continue;
            }

            // Skip edge operators and their targets within subgraph
            if (tokens[i + 1] === "->" || tokens[i + 1] === "--") {
                // This is an edge within the subgraph, skip it for now
                // We're only collecting top-level node IDs for the edge shorthand
                i++;
                continue;
            }

            // Skip assignment statements (like label = "foo")
            if (tokens[i + 1] === "=") {
                i += 3; // Skip identifier, =, value
                continue;
            }

            // This should be a node ID
            const nodeId = this.unquoteId(token);
            if (nodeId && !nodes.includes(nodeId)) {
                nodes.push(nodeId);
            }

            i++;
        }

        return {nodes, endIndex: i};
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
        let result = id;
        if (result.startsWith("\"") && result.endsWith("\"")) {
            result = result.slice(1, -1);
        }

        // Strip port syntax: node:port or node:port:compass
        // Port syntax is only meaningful in edge statements, we just need the node ID
        const colonIndex = result.indexOf(":");
        if (colonIndex > 0) {
            result = result.substring(0, colonIndex);
        }

        return result;
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
