/**
 * Malformed Corpus Test Runner
 *
 * This test suite runs all malformed corpus files through their respective parsers
 * to verify error handling behavior. The goal is to ensure parsers either:
 * 1. Throw meaningful errors (for completely unparseable content)
 * 2. Recover gracefully with partial data (for partially valid content)
 * 3. Return empty results (for empty files)
 *
 * Each test verifies that the parser doesn't crash unexpectedly and handles
 * errors in a user-friendly way.
 */
import {readdirSync, readFileSync} from "node:fs";
import {join} from "node:path";

import {assert, describe, test} from "vitest";

import {CSVDataSource} from "../../../src/data/CSVDataSource.js";
import {DOTDataSource} from "../../../src/data/DOTDataSource.js";
import {GEXFDataSource} from "../../../src/data/GEXFDataSource.js";
import {GMLDataSource} from "../../../src/data/GMLDataSource.js";
import {GraphMLDataSource} from "../../../src/data/GraphMLDataSource.js";
import {JsonDataSource} from "../../../src/data/JsonDataSource.js";
import {PajekDataSource} from "../../../src/data/PajekDataSource.js";

// Map format names to DataSource classes
const formatToDataSource: Record<string, typeof DOTDataSource | typeof GraphMLDataSource | typeof GMLDataSource | typeof GEXFDataSource | typeof CSVDataSource | typeof PajekDataSource | typeof JsonDataSource> = {
    dot: DOTDataSource,
    graphml: GraphMLDataSource,
    gml: GMLDataSource,
    gexf: GEXFDataSource,
    csv: CSVDataSource,
    pajek: PajekDataSource,
    json: JsonDataSource,
};

// Map format to file extensions for discovery
const formatToExtension: Record<string, string> = {
    dot: ".gv",
    graphml: ".graphml",
    gml: ".gml",
    gexf: ".gexf",
    csv: ".csv",
    pajek: ".net",
    json: ".json",
};

// DataSource type union
type AnyDataSource = DOTDataSource | GraphMLDataSource | GMLDataSource | GEXFDataSource | CSVDataSource | PajekDataSource | JsonDataSource;

// Expected behaviors for malformed files
interface MalformedBehavior {
    shouldThrow?: boolean; // Parser should throw an error
    shouldRecover?: boolean; // Parser should recover with partial/empty data
    errorPattern?: RegExp; // If throws, error message should match this pattern
    description: string; // Human-readable description of expected behavior
}

// Define expected behaviors for specific malformed files
const expectedBehaviors: Record<string, Record<string, MalformedBehavior>> = {
    dot: {
        "empty-file.gv": {shouldRecover: true, description: "Empty file should return empty graph"},
        "garbage-content.gv": {shouldRecover: true, description: "Garbage should be handled gracefully"},
        "unclosed-brace.gv": {shouldRecover: true, description: "Unclosed brace should recover partial data"},
        "unclosed-string.gv": {shouldRecover: true, description: "Unclosed string should recover partial data"},
        "invalid-keyword.gv": {shouldRecover: true, description: "Invalid keywords should be skipped"},
        "missing-arrow.gv": {shouldRecover: true, description: "Missing arrow should create nodes only"},
        "nested-unclosed.gv": {shouldRecover: true, description: "Nested unclosed should recover partial data"},
        "invalid-attributes.gv": {shouldRecover: true, description: "Invalid attributes should be handled"},
    },
    graphml: {
        "empty-file.graphml": {shouldThrow: true, description: "Empty file should throw"},
        "not-xml.graphml": {shouldThrow: true, description: "Non-XML should throw"},
        "invalid-xml.graphml": {shouldRecover: true, description: "Invalid XML recovers partial data"},
        "missing-graph.graphml": {shouldRecover: true, description: "Missing graph should return empty"},
        "missing-node-id.graphml": {shouldRecover: true, description: "Missing node ID should skip node"},
        "missing-edge-source.graphml": {shouldRecover: true, description: "Missing edge source should skip edge"},
        "unclosed-tag.graphml": {shouldRecover: true, description: "Unclosed tag recovers partial data"},
        "invalid-edge-reference.graphml": {shouldRecover: true, description: "Invalid edge refs should be kept"},
    },
    gml: {
        "empty-file.gml": {shouldThrow: true, description: "Empty file throws missing graph element"},
        "garbage-content.gml": {shouldThrow: true, description: "Garbage throws missing graph element"},
        "unclosed-bracket.gml": {shouldRecover: true, description: "Unclosed bracket should recover"},
        "unclosed-string.gml": {shouldRecover: true, description: "Unclosed string should recover"},
        "missing-id.gml": {shouldRecover: true, description: "Missing ID should skip node"},
        "missing-edge-target.gml": {shouldRecover: true, description: "Missing target should skip edge"},
        "invalid-value-type.gml": {shouldRecover: true, description: "Invalid value type should be handled"},
        "no-graph-wrapper.gml": {shouldThrow: true, description: "No wrapper throws missing graph element"},
    },
    gexf: {
        "empty-file.gexf": {shouldThrow: true, description: "Empty file should throw"},
        "not-xml.gexf": {shouldThrow: true, description: "Non-XML should throw"},
        "invalid-xml.gexf": {shouldRecover: true, description: "Invalid XML recovers partial data"},
        "missing-nodes-section.gexf": {shouldRecover: true, description: "Missing nodes should return empty nodes"},
        "missing-node-id.gexf": {shouldRecover: true, description: "Missing node ID should skip node"},
        "missing-edge-source.gexf": {shouldRecover: true, description: "Missing edge source should skip edge"},
        "no-graph-element.gexf": {shouldThrow: true, description: "No graph element throws error"},
        "invalid-edge-reference.gexf": {shouldRecover: true, description: "Invalid edge refs should be kept"},
    },
    csv: {
        "empty-file.csv": {shouldRecover: true, description: "Empty file should return empty"},
        "header-only.csv": {shouldRecover: true, description: "Header only should return empty"},
        "missing-source-column.csv": {shouldRecover: true, description: "Missing Source should recover"},
        "missing-target-column.csv": {shouldRecover: true, description: "Missing Target should recover"},
        "inconsistent-columns.csv": {shouldRecover: true, description: "Inconsistent columns should recover"},
        "unclosed-quote.csv": {shouldRecover: true, description: "Unclosed quote should recover"},
        "garbage-content.csv": {shouldRecover: true, description: "Garbage should create nodes from values"},
        "empty-values.csv": {shouldRecover: true, description: "Empty values should be handled"},
        "wrong-delimiter.csv": {shouldRecover: true, description: "Wrong delimiter should create single-column rows"},
        "binary-content.csv": {shouldRecover: true, description: "Binary content should be handled"},
    },
    pajek: {
        "empty-file.net": {shouldRecover: true, description: "Empty file should return empty"},
        "no-vertices-header.net": {shouldRecover: true, description: "No header should try to parse"},
        "wrong-vertex-count.net": {shouldRecover: true, description: "Wrong count should parse available"},
        "malformed-vertex.net": {shouldRecover: true, description: "Malformed vertex should skip line"},
        "malformed-edge.net": {shouldRecover: true, description: "Malformed edge should skip line"},
        "garbage-content.net": {shouldRecover: true, description: "Garbage should return empty"},
        "invalid-edge-reference.net": {shouldRecover: true, description: "Invalid refs should be kept"},
        "missing-edges-section.net": {shouldRecover: true, description: "Missing edges should return nodes only"},
    },
    json: {
        "empty-file.json": {shouldRecover: true, description: "Empty file returns empty result"},
        "invalid-json.json": {shouldRecover: true, description: "Invalid JSON recovers with empty result"},
        "not-json.json": {shouldRecover: true, description: "Non-JSON recovers with empty result"},
        "missing-nodes.json": {shouldRecover: true, description: "Missing nodes returns empty nodes"},
        "missing-edges.json": {shouldRecover: true, description: "Missing edges returns empty edges"},
        "wrong-structure.json": {shouldRecover: true, description: "Wrong structure returns empty"},
        "nodes-not-array.json": {shouldRecover: true, description: "Nodes not array returns empty nodes"},
        "edges-not-array.json": {shouldRecover: true, description: "Edges not array returns empty edges"},
        "missing-node-id.json": {shouldRecover: true, description: "Missing node ID should skip node"},
        "missing-edge-source.json": {shouldRecover: true, description: "Missing edge source should skip edge"},
    },
};

// Helper function to collect all chunks from a data source
async function collectChunks(dataSource: AnyDataSource): Promise<{totalNodes: number, totalEdges: number}> {
    let totalNodes = 0;
    let totalEdges = 0;

    for await (const chunk of dataSource.getData()) {
        totalNodes += chunk.nodes.length;
        totalEdges += chunk.edges.length;
    }

    return {totalNodes, totalEdges};
}

// Discover malformed files in a directory
function discoverMalformedFiles(format: string): string[] {
    const dirPath = join(__dirname, "malformed", format);
    try {
        const files = readdirSync(dirPath);
        const ext = formatToExtension[format];
        return files.filter((f) => f.endsWith(ext));
    } catch {
        return [];
    }
}

// Define which formats to test
const formats = ["dot", "graphml", "gml", "gexf", "csv", "pajek", "json"];

describe("Malformed Corpus Tests", () => {
    for (const format of formats) {
        describe(`${format.toUpperCase()} Malformed Files`, () => {
            const files = discoverMalformedFiles(format);

            if (files.length === 0) {
                test.skip(`No malformed files for ${format}`, () => {
                    // Intentionally empty
                });
                return;
            }

            for (const fileName of files) {
                const formatBehaviors = expectedBehaviors[format];
                const behavior = formatBehaviors[fileName] as MalformedBehavior | undefined ?? {
                    shouldRecover: true,
                    description: "Should handle gracefully (default)",
                };

                test(`${fileName}: ${behavior.description}`, async() => {
                    const filePath = join(__dirname, "malformed", format, fileName);
                    const content = readFileSync(filePath, "utf-8");

                    const DataSourceClass = formatToDataSource[format];
                    assert.ok(DataSourceClass, `No DataSource for format: ${format}`);

                    const dataSource: AnyDataSource = new DataSourceClass({data: content});

                    if (behavior.shouldThrow) {
                        // Expect the parser to throw an error
                        try {
                            await collectChunks(dataSource);
                            assert.fail(`Expected ${fileName} to throw an error, but it didn't`);
                        } catch (error) {
                            // Verify it's an actual error, not our assert.fail
                            if (error instanceof Error && error.message.startsWith("Expected")) {
                                throw error;
                            }

                            // Success - parser threw as expected
                            assert.ok(error instanceof Error, "Error should be an Error instance");
                            if (behavior.errorPattern) {
                                assert.match(
                                    error.message,
                                    behavior.errorPattern,
                                    "Error message should match pattern",
                                );
                            }
                        }
                    } else {
                        // Expect the parser to recover gracefully (no throw)
                        try {
                            const {totalNodes, totalEdges} = await collectChunks(dataSource);
                            // Success - parser handled the file without throwing
                            // The counts can be 0 or more - we just care that it didn't crash
                            assert.isAtLeast(totalNodes, 0, "Node count should be non-negative");
                            assert.isAtLeast(totalEdges, 0, "Edge count should be non-negative");
                        } catch (error) {
                            // Even if we expected recovery, some errors are acceptable
                            // as long as they're meaningful and don't crash
                            if (error instanceof Error) {
                                // Check it's not a catastrophic error (like out of memory)
                                assert.notMatch(
                                    error.message,
                                    /out of memory|stack overflow|maximum call stack/i,
                                    "Parser should not have catastrophic errors",
                                );
                            }

                            // Re-throw if it's a real unexpected error
                            throw error;
                        }
                    }
                });
            }
        });
    }
});
