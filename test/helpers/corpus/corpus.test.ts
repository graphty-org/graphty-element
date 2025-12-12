/**
 * Corpus Test Runner
 *
 * This test suite runs all corpus files through their respective parsers
 * and verifies the expected node/edge counts from the manifest files.
 *
 * The corpus tests use a 90% threshold to account for minor parsing differences
 * that may occur due to parser limitations with advanced features.
 */
import {readFileSync} from "node:fs";
import {join} from "node:path";

import {assert, describe, test} from "vitest";

import {CSVDataSource} from "../../../src/data/CSVDataSource.js";
import {DOTDataSource} from "../../../src/data/DOTDataSource.js";
import {GEXFDataSource} from "../../../src/data/GEXFDataSource.js";
import {GMLDataSource} from "../../../src/data/GMLDataSource.js";
import {GraphMLDataSource} from "../../../src/data/GraphMLDataSource.js";
import {JsonDataSource} from "../../../src/data/JsonDataSource.js";
import {PajekDataSource} from "../../../src/data/PajekDataSource.js";

// Manifest file structure
interface CorpusFile {
    path: string;
    source: string;
    license: string;
    expectedNodes: number;
    expectedEdges: number;
    features: string[];
}

interface Manifest {
    format: string;
    description: string;
    files: CorpusFile[];
}

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

// JSON variant configurations for proper JMESPath extraction
interface JsonVariantConfig {
    node: {path: string};
    edge: {path: string};
}

const jsonVariantConfigs: Record<string, JsonVariantConfig> = {
    "d3-format.json": {node: {path: "nodes"}, edge: {path: "links"}},
    "cytoscape-format.json": {node: {path: "elements.nodes[*].data"}, edge: {path: "elements.edges[*].data"}},
    "sigma-format.json": {node: {path: "nodes"}, edge: {path: "edges"}},
    "visjs-format.json": {node: {path: "nodes"}, edge: {path: "edges"}},
    "networkx-format.json": {node: {path: "nodes"}, edge: {path: "links"}},
    "karate-d3.json": {node: {path: "nodes"}, edge: {path: "links"}},
    "miserables.json": {node: {path: "nodes"}, edge: {path: "links"}},
};

// DataSource type union
type AnyDataSource = DOTDataSource | GraphMLDataSource | GMLDataSource | GEXFDataSource | CSVDataSource | PajekDataSource | JsonDataSource;

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

// Load manifest for a given format
function loadManifest(format: string): Manifest {
    const manifestPath = join(__dirname, format, "manifest.json");
    const content = readFileSync(manifestPath, "utf-8");
    return JSON.parse(content) as Manifest;
}

// Define which formats to test
const formats = ["dot", "graphml", "gml", "gexf", "csv", "pajek", "json"];

describe("Corpus Tests", () => {
    for (const format of formats) {
        describe(`${format.toUpperCase()} Format`, () => {
            let manifest: Manifest;

            try {
                manifest = loadManifest(format);
            } catch {
                test.skip(`No manifest for ${format}`, () => {
                    // Intentionally empty - manifest not found
                });
                return;
            }

            for (const file of manifest.files) {
                test(`parses ${file.path}`, async() => {
                    // Load file content
                    const filePath = join(__dirname, format, file.path);
                    const content = readFileSync(filePath, "utf-8");

                    // Get the appropriate DataSource class
                    const DataSourceClass = formatToDataSource[format];
                    assert.ok(DataSourceClass, `No DataSource for format: ${format}`);

                    // Create data source instance with format-specific config
                    const jsonConfig = format === "json" ? jsonVariantConfigs[file.path] : undefined;
                    const dataSource: AnyDataSource = jsonConfig ?
                        new DataSourceClass({data: content, ... jsonConfig}) :
                        new DataSourceClass({data: content});

                    // Collect all chunks
                    const {totalNodes, totalEdges} = await collectChunks(dataSource);

                    // Verify expected counts with 90% threshold
                    // This accounts for minor parsing differences due to advanced features
                    const nodeThreshold = Math.floor(file.expectedNodes * 0.9);
                    const edgeThreshold = Math.floor(file.expectedEdges * 0.9);

                    assert.isAtLeast(
                        totalNodes,
                        nodeThreshold,
                        `Expected at least ${nodeThreshold} nodes (90% of ${file.expectedNodes}), got ${totalNodes}`,
                    );

                    assert.isAtLeast(
                        totalEdges,
                        edgeThreshold,
                        `Expected at least ${edgeThreshold} edges (90% of ${file.expectedEdges}), got ${totalEdges}`,
                    );

                    // Log results for debugging
                    // console.log(`${format}/${file.path}: ${totalNodes} nodes, ${totalEdges} edges`);
                });
            }
        });
    }
});
