# Implementation Plan for Multi-Format Graph Data Loading (Revised)

## Overview

This plan implements multi-format graph data loading by **extending the existing DataSource architecture**. Instead of building a parallel system, we create new DataSource subclasses for each format (GraphML, CSV, GML, GEXF, DOT) that follow the existing pattern established by JsonDataSource.

**Key Simplifications**:
- ✅ Uses existing `DataSource` abstract class (not new BaseParser)
- ✅ Uses existing `DataManager.addDataFromSource()` (not new LoaderCoordinator)
- ✅ Uses existing registry pattern (not new ParserRegistry)
- ✅ Extends existing event system (adds new event types)
- ✅ Simple format detection utility (not complex system)
- ✅ **Each data format includes a Storybook story** for visual testing and documentation

**Estimated Timeline**: 6-8 days (vs 18-26 in original plan)

---

## Existing Architecture (What We're Building On)

### DataSource Pattern (Already Exists)
```typescript
// src/data/DataSource.ts (existing)
export abstract class DataSource {
    static readonly type: string;
    nodeSchema: z4.$ZodObject | null = null;
    edgeSchema: z4.$ZodObject | null = null;

    // AsyncGenerator returns chunks
    abstract sourceFetchData(): AsyncGenerator<DataSourceChunk, void, unknown>;

    // Registry pattern
    static register<T>(cls: T): T;
    static get(type: string, opts: object): DataSource | null;
}

export interface DataSourceChunk {
    nodes: AdHocData[];
    edges: AdHocData[];
}
```

### How It Works Today
```typescript
// User code
await graph.addDataFromSource('json', {
    data: 'https://example.com/graph.json',
    node: { path: 'nodes' },
    edge: { path: 'edges' }
});

// What happens:
// 1. DataManager.addDataFromSource('json', opts)
// 2. Gets JsonDataSource from registry
// 3. Iterates: for await (const chunk of source.getData())
// 4. Calls: addNodes(chunk.nodes), addEdges(chunk.edges)
// 5. Emits: 'data-loaded' event
```

### What We're Adding
```typescript
// New convenience method
await graph.loadFromFile(file); // auto-detects format

// Still works the old way too
await graph.addDataFromSource('graphml', { file: file });

// New DataSource types
await graph.addDataFromSource('graphml', { data: xmlString });
await graph.addDataFromSource('csv', { file: csvFile });
await graph.addDataFromSource('gml', { data: gmlString });
```

---

## Phase Breakdown

### Phase 1: Core Infrastructure & File Loading
**Objective**: Add file loading support and format detection
**Duration**: 1-2 days

#### Tests to Write First

**test/data/format-detection.test.ts**:
```typescript
import { describe, test, expect } from 'vitest';
import { detectFormat } from '../src/data/format-detection.js';

describe('detectFormat', () => {
  test('detects GraphML from extension', () => {
    expect(detectFormat('graph.graphml', '')).toBe('graphml');
  });

  test('detects GraphML from XML namespace', () => {
    const xml = '<?xml version="1.0"?><graphml xmlns="http://graphml.graphdrawing.org/xmlns">';
    expect(detectFormat('', xml)).toBe('graphml');
  });

  test('detects GEXF from namespace', () => {
    const xml = '<gexf xmlns="http://gexf.net/1.3">';
    expect(detectFormat('', xml)).toBe('gexf');
  });

  test('detects CSV from extension', () => {
    expect(detectFormat('edges.csv', '')).toBe('csv');
  });

  test('detects GML from content', () => {
    const gml = 'graph [\n  node [\n    id 1\n  ]\n]';
    expect(detectFormat('', gml)).toBe('gml');
  });

  test('returns null for unknown format', () => {
    expect(detectFormat('unknown.xyz', 'random content')).toBeNull();
  });
});
```

**test/Graph.test.ts** (add to existing file):
```typescript
describe('Graph.loadFromFile', () => {
  test('loads GraphML file with auto-detection', async () => {
    const xml = '<?xml version="1.0"?><graphml xmlns="http://graphml.graphdrawing.org/xmlns"><graph><node id="n1"/></graph></graphml>';
    const file = new File([xml], 'test.graphml', { type: 'application/xml' });

    const graph = new Graph(canvas);
    await graph.loadFromFile(file);

    expect(graph.dataManager.nodes.size).toBe(1);
  });

  test('loads CSV file with auto-detection', async () => {
    const csv = 'source,target\nn1,n2\nn2,n3';
    const file = new File([csv], 'edges.csv', { type: 'text/csv' });

    const graph = new Graph(canvas);
    await graph.loadFromFile(file);

    expect(graph.dataManager.edges.size).toBe(2);
  });

  test('supports explicit format override', async () => {
    const csv = 'source,target\nn1,n2';
    const file = new File([csv], 'data.txt', { type: 'text/plain' });

    const graph = new Graph(canvas);
    await graph.loadFromFile(file, { format: 'csv' });

    expect(graph.dataManager.edges.size).toBe(1);
  });
});
```

#### Implementation

**src/data/format-detection.ts**: Simple utility function
```typescript
export type FormatType =
  | 'json'
  | 'graphml'
  | 'gexf'
  | 'csv'
  | 'gml'
  | 'dot'
  | 'pajek';

export interface FormatInfo {
  name: string;
  extensions: string[];
  mimeTypes: string[];
}

const FORMAT_INFO: Record<FormatType, FormatInfo> = {
  json: {
    name: 'JSON',
    extensions: ['.json'],
    mimeTypes: ['application/json']
  },
  graphml: {
    name: 'GraphML',
    extensions: ['.graphml', '.xml'],
    mimeTypes: ['application/graphml+xml', 'application/xml', 'text/xml']
  },
  gexf: {
    name: 'GEXF',
    extensions: ['.gexf'],
    mimeTypes: ['application/gexf+xml', 'application/xml', 'text/xml']
  },
  csv: {
    name: 'CSV',
    extensions: ['.csv', '.edges', '.edgelist'],
    mimeTypes: ['text/csv', 'text/plain']
  },
  gml: {
    name: 'GML',
    extensions: ['.gml'],
    mimeTypes: ['text/plain']
  },
  dot: {
    name: 'DOT',
    extensions: ['.dot', '.gv'],
    mimeTypes: ['text/vnd.graphviz', 'text/plain']
  },
  pajek: {
    name: 'Pajek NET',
    extensions: ['.net', '.paj'],
    mimeTypes: ['text/plain']
  }
};

/**
 * Detect graph data format from filename and/or content
 * @param filename - File name (can be empty)
 * @param content - File content sample (can be empty)
 * @returns Detected format or null if unknown
 */
export function detectFormat(filename: string, content: string): FormatType | null {
  // 1. Try extension first (fast path)
  if (filename) {
    const ext = filename.toLowerCase().match(/\.[^.]+$/)?.[0];
    if (ext) {
      // Check each format's extensions
      for (const [format, info] of Object.entries(FORMAT_INFO)) {
        if (info.extensions.includes(ext)) {
          // Special case: .xml could be GraphML or GEXF, need content check
          if (ext === '.xml' && content) {
            const xmlFormat = detectXMLFormat(content);
            if (xmlFormat) return xmlFormat;
          }
          return format as FormatType;
        }
      }
    }
  }

  // 2. Inspect content
  if (!content) return null;

  const trimmed = content.trim();

  // XML-based formats
  if (trimmed.startsWith('<?xml') || trimmed.startsWith('<')) {
    return detectXMLFormat(trimmed);
  }

  // JSON
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return 'json';
  }

  // Text-based formats
  if (/graph\s*\[/i.test(trimmed)) return 'gml';
  if (/^\*vertices/i.test(trimmed)) return 'pajek';
  if (/^\s*(strict\s+)?(di)?graph\s+/i.test(trimmed)) return 'dot';

  // CSV (very generic, check last)
  if (/^[\w-]+\s*,\s*[\w-]+/m.test(trimmed)) return 'csv';

  return null;
}

function detectXMLFormat(content: string): FormatType | null {
  if (content.includes('xmlns="http://graphml.graphdrawing.org')) return 'graphml';
  if (content.includes('xmlns="http://gexf.net')) return 'gexf';
  return null;
}

export function getFormatInfo(format: FormatType): FormatInfo {
  return FORMAT_INFO[format];
}
```

**src/events.ts**: Add new event types
```typescript
// Add to existing GraphEvent union type
export type GraphEvent =
  | GraphSettledEvent
  | GraphErrorEvent
  | GraphDataLoadedEvent
  | GraphDataAddedEvent
  | GraphLayoutInitializedEvent
  | GraphGenericEvent
  | DataLoadingProgressEvent    // NEW
  | DataLoadingErrorEvent        // NEW
  | DataLoadingCompleteEvent;    // NEW

// Add new event interfaces
export interface DataLoadingProgressEvent {
  type: 'data-loading-progress';
  format: string;
  bytesProcessed: number;
  totalBytes?: number;
  percentage?: number;
  nodesLoaded: number;
  edgesLoaded: number;
  chunksProcessed: number;
}

export interface DataLoadingErrorEvent {
  type: 'data-loading-error';
  error: Error;
  context: 'detection' | 'validation' | 'parsing';
  format?: string;
  line?: number;
  nodeId?: unknown;
  edgeId?: string;
  canContinue: boolean;
}

export interface DataLoadingCompleteEvent {
  type: 'data-loading-complete';
  format: string;
  nodesLoaded: number;
  edgesLoaded: number;
  duration: number; // milliseconds
  errors: number;
  warnings: number;
  success: boolean;
}
```

**src/managers/EventManager.ts**: Add methods for new events
```typescript
// Add to EventManager class
emitDataLoadingProgress(
  format: string,
  bytesProcessed: number,
  totalBytes: number | undefined,
  nodesLoaded: number,
  edgesLoaded: number,
  chunksProcessed: number
): void {
  const event: DataLoadingProgressEvent = {
    type: 'data-loading-progress',
    format,
    bytesProcessed,
    totalBytes,
    percentage: totalBytes ? (bytesProcessed / totalBytes) * 100 : undefined,
    nodesLoaded,
    edgesLoaded,
    chunksProcessed
  };
  this.graphObservable.notifyObservers(event);
}

emitDataLoadingError(
  error: Error,
  context: DataLoadingErrorEvent['context'],
  format: string | undefined,
  details: {
    line?: number;
    nodeId?: unknown;
    edgeId?: string;
    canContinue: boolean;
  }
): void {
  const event: DataLoadingErrorEvent = {
    type: 'data-loading-error',
    error,
    context,
    format,
    ...details
  };
  this.graphObservable.notifyObservers(event);
}

emitDataLoadingComplete(
  format: string,
  nodesLoaded: number,
  edgesLoaded: number,
  duration: number,
  errors: number,
  warnings: number,
  success: boolean
): void {
  const event: DataLoadingCompleteEvent = {
    type: 'data-loading-complete',
    format,
    nodesLoaded,
    edgesLoaded,
    duration,
    errors,
    warnings,
    success
  };
  this.graphObservable.notifyObservers(event);
}
```

**src/Graph.ts**: Add loadFromFile method
```typescript
import { detectFormat } from './data/format-detection.js';

// Add to Graph class
/**
 * Load graph data from a File object with auto-format detection
 * @param file - File object from file input
 * @param options - Loading options
 */
async loadFromFile(
  file: File,
  options?: {
    format?: string;
    nodeIdPath?: string;
    edgeSrcIdPath?: string;
    edgeDstIdPath?: string;
  }
): Promise<void> {
  // Detect format if not explicitly provided
  let format = options?.format;

  if (!format) {
    // Read first 2KB for format detection
    const sample = await file.slice(0, 2048).text();
    const detected = detectFormat(file.name, sample);

    if (!detected) {
      throw new Error(
        `Could not detect file format from '${file.name}'. ` +
        `Supported formats: JSON, GraphML, GEXF, CSV, GML, DOT, Pajek. ` +
        `Try specifying format explicitly: loadFromFile(file, { format: 'graphml' })`
      );
    }

    format = detected;
  }

  // Read full file content
  const content = await file.text();

  // Load using appropriate DataSource
  await this.addDataFromSource(format, {
    data: content,
    filename: file.name,
    size: file.size,
    ...options
  });
}
```

#### Dependencies
- **External**: None
- **Internal**: None (foundation layer)

#### Verification
1. Run: `npm test -- format-detection`
2. Expected: All format detection tests pass
3. Run: `npm test -- Graph.test.ts`
4. Expected: loadFromFile tests pass
5. Manual: Test with file upload in browser

---

### Phase 2: GraphML DataSource
**Objective**: Implement streaming GraphML parser with attribute support
**Duration**: 2 days
**Deliverables**: GraphMLDataSource class, unit tests, Storybook story

#### Tests to Write First

**test/data/GraphMLDataSource.test.ts**:
```typescript
import { describe, test, expect } from 'vitest';
import { GraphMLDataSource } from '../src/data/GraphMLDataSource.js';

describe('GraphMLDataSource', () => {
  test('parses basic GraphML', async () => {
    const xml = `<?xml version="1.0"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns">
  <graph edgedefault="undirected">
    <node id="n0"/>
    <node id="n1"/>
    <edge source="n0" target="n1"/>
  </graph>
</graphml>`;

    const source = new GraphMLDataSource({ data: xml });
    const chunks = [];

    for await (const chunk of source.getData()) {
      chunks.push(chunk);
    }

    expect(chunks).toHaveLength(1);
    expect(chunks[0].nodes).toHaveLength(2);
    expect(chunks[0].edges).toHaveLength(1);
    expect(chunks[0].nodes[0].id).toBe('n0');
    expect(chunks[0].edges[0].src).toBe('n0');
    expect(chunks[0].edges[0].dst).toBe('n1');
  });

  test('parses key definitions and data elements', async () => {
    const xml = `<?xml version="1.0"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns">
  <key id="d0" for="node" attr.name="color" attr.type="string"/>
  <key id="d1" for="edge" attr.name="weight" attr.type="double"/>
  <graph>
    <node id="n0">
      <data key="d0">red</data>
    </node>
    <node id="n1">
      <data key="d0">blue</data>
    </node>
    <edge source="n0" target="n1">
      <data key="d1">1.5</data>
    </edge>
  </graph>
</graphml>`;

    const source = new GraphMLDataSource({ data: xml });
    const chunks = [];

    for await (const chunk of source.getData()) {
      chunks.push(chunk);
    }

    expect(chunks[0].nodes[0].color).toBe('red');
    expect(chunks[0].nodes[1].color).toBe('blue');
    expect(chunks[0].edges[0].weight).toBe(1.5);
  });

  test('yields nodes in chunks for large graphs', async () => {
    // Create GraphML with 5000 nodes
    let xml = `<?xml version="1.0"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns">
  <graph>`;

    for (let i = 0; i < 5000; i++) {
      xml += `<node id="n${i}"/>`;
    }
    xml += `</graph></graphml>`;

    const source = new GraphMLDataSource({ data: xml });
    const chunks = [];

    for await (const chunk of source.getData()) {
      chunks.push(chunk);
    }

    // Should yield multiple chunks (default chunk size is 1000)
    expect(chunks.length).toBeGreaterThan(1);

    // Total nodes should be 5000
    const totalNodes = chunks.reduce((sum, c) => sum + c.nodes.length, 0);
    expect(totalNodes).toBe(5000);
  });

  test('handles parsing errors gracefully', async () => {
    const xml = `<?xml version="1.0"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns">
  <graph>
    <node id="n0"/>
    <node id="n1"/>
    <edge source="n0" target="n999"/>
    <edge source="n1" target="n2"/>
  </graph>
</graphml>`;

    const source = new GraphMLDataSource({ data: xml });
    const chunks = [];

    // Should not throw, should collect errors
    for await (const chunk of source.getData()) {
      chunks.push(chunk);
    }

    expect(chunks[0].nodes).toHaveLength(2);
    // Edges with invalid targets should be skipped or reported
  });
});
```

#### Implementation

Install dependency:
```bash
npm install fast-xml-parser
```

**src/data/GraphMLDataSource.ts**:
```typescript
import { DataSource, DataSourceChunk } from './DataSource.js';
import { XMLParser } from 'fast-xml-parser';
import { AdHocData } from '../config.js';

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
  for: 'node' | 'edge' | 'graph';
}

export class GraphMLDataSource extends DataSource {
  static readonly type = 'graphml';

  private config: GraphMLDataSourceConfig;
  private chunkSize: number;
  private errorLimit: number;
  private errors: Array<{ message: string; line?: number }> = [];
  private warnings: Array<{ message: string; line?: number }> = [];

  constructor(config: GraphMLDataSourceConfig) {
    super();
    this.config = config;
    this.chunkSize = config.chunkSize || 1000;
    this.errorLimit = config.errorLimit || 100;
  }

  async *sourceFetchData(): AsyncGenerator<DataSourceChunk, void, unknown> {
    // Get XML content
    const xmlContent = await this.getContent();

    // Parse XML
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseAttributeValue: false, // Keep as strings, we'll parse by type
      trimValues: true
    });

    let parsed;
    try {
      parsed = parser.parse(xmlContent);
    } catch (error) {
      throw new Error(`Failed to parse GraphML XML: ${error instanceof Error ? error.message : String(error)}`);
    }

    const graphml = parsed.graphml;
    if (!graphml) {
      throw new Error('Invalid GraphML: missing <graphml> root element');
    }

    // Parse key definitions
    const keys = this.parseKeyDefinitions(graphml.key);

    // Get graph element
    const graph = graphml.graph;
    if (!graph) {
      throw new Error('Invalid GraphML: missing <graph> element');
    }

    // Parse and yield nodes in chunks
    const nodes = this.parseNodes(graph.node, keys);
    const edges = this.parseEdges(graph.edge, keys);

    // Yield in chunks
    for (let i = 0; i < nodes.length; i += this.chunkSize) {
      const nodeChunk = nodes.slice(i, i + this.chunkSize);
      const edgeChunk = i === 0 ? edges : []; // Yield all edges with first chunk

      yield { nodes: nodeChunk, edges: edgeChunk };
    }

    // If no nodes, still yield edges
    if (nodes.length === 0 && edges.length > 0) {
      yield { nodes: [], edges };
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

    throw new Error('GraphMLDataSource requires data, file, or url');
  }

  private parseKeyDefinitions(keyData: any): Map<string, GraphMLKey> {
    const keys = new Map<string, GraphMLKey>();

    if (!keyData) return keys;

    const keyArray = Array.isArray(keyData) ? keyData : [keyData];

    for (const key of keyArray) {
      const id = key['@_id'];
      const name = key['@_attr.name'] || key['@_name'] || id;
      const type = key['@_attr.type'] || key['@_type'] || 'string';
      const forElement = key['@_for'] || 'node';

      keys.set(id, { name, type, for: forElement as 'node' | 'edge' | 'graph' });
    }

    return keys;
  }

  private parseNodes(nodeData: any, keys: Map<string, GraphMLKey>): AdHocData[] {
    if (!nodeData) return [];

    const nodeArray = Array.isArray(nodeData) ? nodeData : [nodeData];
    const nodes: AdHocData[] = [];

    for (const node of nodeArray) {
      try {
        const id = node['@_id'];
        if (!id) {
          this.addError('Node missing id attribute');
          continue;
        }

        const nodeData: AdHocData = { id };

        // Parse data elements
        if (node.data) {
          const dataElements = Array.isArray(node.data) ? node.data : [node.data];

          for (const data of dataElements) {
            const keyId = data['@_key'];
            const value = data['#text'] || data;

            const keyDef = keys.get(keyId);
            if (keyDef && keyDef.for === 'node') {
              nodeData[keyDef.name] = this.parseValue(value, keyDef.type);
            }
          }
        }

        nodes.push(nodeData);
      } catch (error) {
        this.addError(`Failed to parse node: ${error instanceof Error ? error.message : String(error)}`);

        if (this.errors.length >= this.errorLimit) {
          throw new Error(`Too many errors (${this.errors.length}), aborting parse`);
        }
      }
    }

    return nodes;
  }

  private parseEdges(edgeData: any, keys: Map<string, GraphMLKey>): AdHocData[] {
    if (!edgeData) return [];

    const edgeArray = Array.isArray(edgeData) ? edgeData : [edgeData];
    const edges: AdHocData[] = [];

    for (const edge of edgeArray) {
      try {
        const src = edge['@_source'];
        const dst = edge['@_target'];

        if (!src || !dst) {
          this.addError('Edge missing source or target attribute');
          continue;
        }

        const edgeData: AdHocData = { src, dst };

        // Parse data elements
        if (edge.data) {
          const dataElements = Array.isArray(edge.data) ? edge.data : [edge.data];

          for (const data of dataElements) {
            const keyId = data['@_key'];
            const value = data['#text'] || data;

            const keyDef = keys.get(keyId);
            if (keyDef && keyDef.for === 'edge') {
              edgeData[keyDef.name] = this.parseValue(value, keyDef.type);
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

    return edges;
  }

  private parseValue(value: string, type: string): any {
    switch (type) {
      case 'int':
      case 'long':
        return parseInt(value, 10);
      case 'float':
      case 'double':
        return parseFloat(value);
      case 'boolean':
        return value === 'true' || value === '1';
      default:
        return value;
    }
  }

  private addError(message: string, line?: number): void {
    this.errors.push({ message, line });

    // Emit error event through event manager
    // Note: We don't have direct access to eventManager here
    // DataManager will handle error reporting
  }

  private addWarning(message: string, line?: number): void {
    this.warnings.push({ message, line });
  }
}
```

**src/data/index.ts**: Register GraphMLDataSource
```typescript
import {DataSource} from "./DataSource";
import {JsonDataSource} from "./JsonDataSource";
import {GraphMLDataSource} from "./GraphMLDataSource"; // ADD

DataSource.register(JsonDataSource);
DataSource.register(GraphMLDataSource); // ADD
```

**src/managers/DataManager.ts**: Enhance error reporting
```typescript
// Modify existing addDataFromSource to emit progress and errors
async addDataFromSource(type: string, opts: object = {}): Promise<void> {
  const startTime = Date.now();
  let nodesLoaded = 0;
  let edgesLoaded = 0;
  let chunksProcessed = 0;
  const allErrors: Error[] = [];

  try {
    const source = DataSource.get(type, opts);
    if (!source) {
      throw new TypeError(`No data source named: ${type}`);
    }

    // Get file size for progress tracking (if available)
    const fileSize = (opts as any).size;

    try {
      for await (const chunk of source.getData()) {
        this.addNodes(chunk.nodes);
        this.addEdges(chunk.edges);

        nodesLoaded += chunk.nodes.length;
        edgesLoaded += chunk.edges.length;
        chunksProcessed++;

        // Emit progress event
        if (this.graphContext) {
          this.eventManager.emitDataLoadingProgress(
            type,
            chunksProcessed * 64 * 1024, // Approximate bytes (chunk size)
            fileSize,
            nodesLoaded,
            edgesLoaded,
            chunksProcessed
          );
        }
      }

      // Emit completion event
      if (this.graphContext) {
        const duration = Date.now() - startTime;
        this.eventManager.emitDataLoadingComplete(
          type,
          nodesLoaded,
          edgesLoaded,
          duration,
          allErrors.length,
          0, // warnings
          true
        );
      }

      // Keep existing data-loaded event for backward compatibility
      if (this.graphContext) {
        this.eventManager.emitGraphDataLoaded(this.graphContext, chunksProcessed, type);
      }
    } catch (error) {
      // Emit error event
      if (this.graphContext) {
        this.eventManager.emitDataLoadingError(
          error instanceof Error ? error : new Error(String(error)),
          'parsing',
          type,
          { canContinue: false }
        );

        // Keep existing error event for backward compatibility
        this.eventManager.emitGraphError(
          this.graphContext,
          error instanceof Error ? error : new Error(String(error)),
          "data-loading",
          {chunksLoaded: chunksProcessed, dataSourceType: type},
        );
      }

      throw new Error(`Failed to load data from source '${type}' after ${chunksProcessed} chunks: ${error instanceof Error ? error.message : String(error)}`);
    }
  } catch (error) {
    // Re-throw if already a processed error
    if (error instanceof Error && error.message.includes("Failed to load data")) {
      throw error;
    }

    // Otherwise wrap and throw
    throw new Error(`Error initializing data source '${type}': ${error instanceof Error ? error.message : String(error)}`);
  }
}
```

**stories/Data.stories.ts**: Add GraphML story
```typescript
// Add to existing Data.stories.ts file
export const GraphML: Story = {
    args: {
        dataSource: "graphml",
        dataSourceConfig: {
            url: "https://raw.githubusercontent.com/chengw07/NetWalk/master/data/karate.GraphML",
        },
        layout: "ngraph",
        layoutConfig: {
            seed: 42,
        },
        styleTemplate: StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            behavior: {
                layout: {
                    preSteps: 500,
                },
            },
        }),
    },
};
```

#### Dependencies
- **External**: `fast-xml-parser`
- **Internal**: Phase 1

#### Verification
1. Run: `npm test -- GraphMLDataSource`
2. Test with: Karate Club GraphML (34 nodes)
3. Test with: Game of Thrones GraphML (~100 nodes)
4. Verify: Attributes parsed correctly
5. Verify: Events emitted during loading
6. **Verify: Storybook story renders correctly at http://dev.ato.ms:9035/?path=/story/data--graph-ml**

---

### Phase 3: CSV DataSource
**Objective**: Implement CSV/edge list parser with multiple format support
**Duration**: 1-2 days
**Deliverables**: CSVDataSource class, unit tests, Storybook story

#### Tests to Write First

**test/data/CSVDataSource.test.ts**:
```typescript
import { describe, test, expect } from 'vitest';
import { CSVDataSource } from '../src/data/CSVDataSource.js';

describe('CSVDataSource', () => {
  test('parses simple edge list', async () => {
    const csv = `source,target
n1,n2
n2,n3
n1,n3`;

    const source = new CSVDataSource({ data: csv });
    const chunks = [];

    for await (const chunk of source.getData()) {
      chunks.push(chunk);
    }

    expect(chunks[0].edges).toHaveLength(3);
    expect(chunks[0].edges[0].src).toBe('n1');
    expect(chunks[0].edges[0].dst).toBe('n2');
  });

  test('parses weighted edges', async () => {
    const csv = `source,target,weight
n1,n2,1.5
n2,n3,2.0
n1,n3,0.8`;

    const source = new CSVDataSource({ data: csv });
    const chunks = [];

    for await (const chunk of source.getData()) {
      chunks.push(chunk);
    }

    expect(chunks[0].edges[0].weight).toBe(1.5);
    expect(chunks[0].edges[1].weight).toBe(2.0);
  });

  test('parses edges with additional attributes', async () => {
    const csv = `source,target,type,color
n1,n2,friend,#ff0000
n2,n3,colleague,#00ff00`;

    const source = new CSVDataSource({ data: csv });
    const chunks = [];

    for await (const chunk of source.getData()) {
      chunks.push(chunk);
    }

    expect(chunks[0].edges[0].type).toBe('friend');
    expect(chunks[0].edges[0].color).toBe('#ff0000');
  });

  test('handles different delimiters', async () => {
    const tsv = `source\ttarget\tweight
n1\tn2\t1.0
n2\tn3\t2.0`;

    const source = new CSVDataSource({
      data: tsv,
      delimiter: '\t'
    });
    const chunks = [];

    for await (const chunk of source.getData()) {
      chunks.push(chunk);
    }

    expect(chunks[0].edges).toHaveLength(2);
  });

  test('yields in chunks for large files', async () => {
    let csv = 'source,target\n';
    for (let i = 0; i < 5000; i++) {
      csv += `n${i},n${i + 1}\n`;
    }

    const source = new CSVDataSource({ data: csv });
    const chunks = [];

    for await (const chunk of source.getData()) {
      chunks.push(chunk);
    }

    // Should have multiple chunks
    expect(chunks.length).toBeGreaterThan(1);

    // Total edges should be 5000
    const totalEdges = chunks.reduce((sum, c) => sum + c.edges.length, 0);
    expect(totalEdges).toBe(5000);
  });
});
```

#### Implementation

Install dependency:
```bash
npm install papaparse
npm install --save-dev @types/papaparse
```

**src/data/CSVDataSource.ts**:
```typescript
import { DataSource, DataSourceChunk } from './DataSource.js';
import Papa from 'papaparse';
import { AdHocData } from '../config.js';

export interface CSVDataSourceConfig {
  data?: string;
  file?: File;
  url?: string;
  delimiter?: string;
  sourceColumn?: string;
  targetColumn?: string;
  chunkSize?: number;
  errorLimit?: number;
}

export class CSVDataSource extends DataSource {
  static readonly type = 'csv';

  private config: CSVDataSourceConfig;
  private chunkSize: number;
  private errorLimit: number;
  private errors: Array<{ message: string; row?: number }> = [];

  constructor(config: CSVDataSourceConfig) {
    super();
    this.config = {
      delimiter: ',',
      sourceColumn: 'source',
      targetColumn: 'target',
      chunkSize: 1000,
      errorLimit: 100,
      ...config
    };
    this.chunkSize = this.config.chunkSize!;
    this.errorLimit = this.config.errorLimit!;
  }

  async *sourceFetchData(): AsyncGenerator<DataSourceChunk, void, unknown> {
    // Get CSV content
    const csvContent = await this.getContent();

    // Parse CSV
    const parseResult = Papa.parse(csvContent, {
      header: true,
      delimiter: this.config.delimiter,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim()
    });

    if (parseResult.errors.length > 0) {
      // Collect parsing errors but continue if possible
      for (const error of parseResult.errors) {
        this.addError(`CSV parsing error: ${error.message}`, error.row);

        if (this.errors.length >= this.errorLimit) {
          throw new Error(`Too many CSV parsing errors (${this.errors.length}), aborting`);
        }
      }
    }

    const rows = parseResult.data as Record<string, any>[];

    // Detect if this is an edge list or node list
    const hasSourceTarget = rows[0] &&
      (this.config.sourceColumn! in rows[0]) &&
      (this.config.targetColumn! in rows[0]);

    if (hasSourceTarget) {
      // This is an edge list
      yield* this.parseEdgeList(rows);
    } else {
      // This might be a node list or other format
      yield* this.parseNodeList(rows);
    }
  }

  private async *parseEdgeList(rows: Record<string, any>[]): AsyncGenerator<DataSourceChunk, void, unknown> {
    const edges: AdHocData[] = [];

    for (let i = 0; i < rows.length; i++) {
      try {
        const row = rows[i];
        const src = row[this.config.sourceColumn!];
        const dst = row[this.config.targetColumn!];

        if (!src || !dst) {
          this.addError(`Row ${i + 1}: Missing source or target`, i);
          continue;
        }

        // Create edge with all row data
        const edge: AdHocData = {
          src: String(src),
          dst: String(dst),
          ...row
        };

        edges.push(edge);

        // Yield chunk when full
        if (edges.length >= this.chunkSize) {
          yield { nodes: [], edges: edges.splice(0, this.chunkSize) };
        }
      } catch (error) {
        this.addError(
          `Failed to parse row ${i + 1}: ${error instanceof Error ? error.message : String(error)}`,
          i
        );

        if (this.errors.length >= this.errorLimit) {
          throw new Error(`Too many errors (${this.errors.length}), aborting parse`);
        }
      }
    }

    // Yield remaining edges
    if (edges.length > 0) {
      yield { nodes: [], edges };
    }
  }

  private async *parseNodeList(rows: Record<string, any>[]): AsyncGenerator<DataSourceChunk, void, unknown> {
    const nodes: AdHocData[] = [];

    // Assume first column is ID if 'id' or 'Id' column exists
    const hasId = rows[0] && ('id' in rows[0] || 'Id' in rows[0] || 'ID' in rows[0]);

    for (let i = 0; i < rows.length; i++) {
      try {
        const row = rows[i];

        // Try to find ID
        const id = row.id || row.Id || row.ID || String(i);

        const node: AdHocData = {
          id,
          ...row
        };

        nodes.push(node);

        // Yield chunk when full
        if (nodes.length >= this.chunkSize) {
          yield { nodes: nodes.splice(0, this.chunkSize), edges: [] };
        }
      } catch (error) {
        this.addError(
          `Failed to parse row ${i + 1}: ${error instanceof Error ? error.message : String(error)}`,
          i
        );

        if (this.errors.length >= this.errorLimit) {
          throw new Error(`Too many errors (${this.errors.length}), aborting parse`);
        }
      }
    }

    // Yield remaining nodes
    if (nodes.length > 0) {
      yield { nodes, edges: [] };
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
        throw new Error(`Failed to fetch CSV from ${this.config.url}: ${response.status}`);
      }
      return await response.text();
    }

    throw new Error('CSVDataSource requires data, file, or url');
  }

  private addError(message: string, row?: number): void {
    this.errors.push({ message, row });
  }
}
```

**src/data/index.ts**: Register CSVDataSource
```typescript
import {DataSource} from "./DataSource";
import {JsonDataSource} from "./JsonDataSource";
import {GraphMLDataSource} from "./GraphMLDataSource";
import {CSVDataSource} from "./CSVDataSource"; // ADD

DataSource.register(JsonDataSource);
DataSource.register(GraphMLDataSource);
DataSource.register(CSVDataSource); // ADD
```

**stories/Data.stories.ts**: Add CSV story
```typescript
// Add to existing Data.stories.ts file
export const CSV: Story = {
    args: {
        dataSource: "csv",
        dataSourceConfig: {
            url: "https://raw.githubusercontent.com/graphty-org/graphty-element/master/test/helpers/edges.csv",
        },
        layout: "ngraph",
        layoutConfig: {
            seed: 42,
        },
        styleTemplate: StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            behavior: {
                layout: {
                    preSteps: 500,
                },
            },
        }),
    },
};
```

#### Dependencies
- **External**: `papaparse`, `@types/papaparse`
- **Internal**: Phase 1

#### Verification
1. Run: `npm test -- CSVDataSource`
2. Test with: Simple edge list CSV
3. Test with: Weighted edges CSV
4. Verify: Streaming works for large files
5. **Verify: Storybook story renders correctly at http://dev.ato.ms:9035/?path=/story/data--csv**

---

### Phase 4: Additional Format DataSources
**Objective**: Add GML, GEXF, and DOT parsers
**Duration**: 2-3 days
**Deliverables**: GMLDataSource, GEXFDataSource, DOTDataSource classes, unit tests for each, Storybook stories for each

#### Implementation

**src/data/GMLDataSource.ts**: Custom parser (simple format)
**src/data/GEXFDataSource.ts**: Using fast-xml-parser (similar to GraphML)
**src/data/DOTDataSource.ts**: Custom parser or use library

Each follows the same pattern:
1. Extend DataSource
2. Implement sourceFetchData() as AsyncGenerator
3. Parse format-specific structure
4. Yield chunks of {nodes, edges}
5. Handle errors gracefully
6. Register in src/data/index.ts
7. **Add Storybook story to stories/Data.stories.ts**

See implementation code in appendix (similar structure to GraphML and CSV).

**stories/Data.stories.ts**: Add stories for each format
```typescript
// Add to existing Data.stories.ts file

export const GML: Story = {
    args: {
        dataSource: "gml",
        dataSourceConfig: {
            url: "https://raw.githubusercontent.com/example/repo/master/data/sample.gml",
        },
        layout: "ngraph",
        layoutConfig: { seed: 42 },
        styleTemplate: StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            behavior: { layout: { preSteps: 500 } },
        }),
    },
};

export const GEXF: Story = {
    args: {
        dataSource: "gexf",
        dataSourceConfig: {
            url: "https://raw.githubusercontent.com/gephi/gephi/master/modules/DesktopImport/test/unit/data/example.gexf",
        },
        layout: "ngraph",
        layoutConfig: { seed: 42 },
        styleTemplate: StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            behavior: { layout: { preSteps: 500 } },
        }),
    },
};

export const DOT: Story = {
    args: {
        dataSource: "dot",
        dataSourceConfig: {
            url: "https://raw.githubusercontent.com/example/repo/master/data/sample.dot",
        },
        layout: "ngraph",
        layoutConfig: { seed: 42 },
        styleTemplate: StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            behavior: { layout: { preSteps: 500 } },
        }),
    },
};
```

#### Dependencies
- **External**: `fast-xml-parser` (GEXF already installed)
- **Internal**: Phases 1-3

#### Verification
1. Run tests for each format
2. Test with sample files from repositories
3. Verify all formats integrate with loadFromFile()
4. **Verify: Each Storybook story renders correctly:**
   - http://dev.ato.ms:9035/?path=/story/data--gml
   - http://dev.ato.ms:9035/?path=/story/data--gexf
   - http://dev.ato.ms:9035/?path=/story/data--dot

---

## Common Utilities

### Error Collection Pattern
Each DataSource collects errors internally:
```typescript
private errors: Array<{ message: string; line?: number }> = [];
private errorLimit: number;

private addError(message: string, line?: number): void {
  this.errors.push({ message, line });

  if (this.errors.length >= this.errorLimit) {
    throw new Error(`Too many errors (${this.errors.length}), aborting`);
  }
}
```

### Chunking Pattern
All DataSources yield in chunks:
```typescript
const buffer: AdHocData[] = [];

// ... parse items ...
buffer.push(item);

// Yield when buffer full
if (buffer.length >= this.chunkSize) {
  yield {
    nodes: buffer.splice(0, this.chunkSize),
    edges: []
  };
}

// Yield remaining at end
if (buffer.length > 0) {
  yield { nodes: buffer, edges: [] };
}
```

### Storybook Story Pattern
Every data format must have a story in `stories/Data.stories.ts`:
```typescript
export const FormatName: Story = {
    args: {
        dataSource: "format-name",  // DataSource type
        dataSourceConfig: {
            url: "https://...",      // Public URL to sample file
        },
        layout: "ngraph",            // Use deterministic layout
        layoutConfig: {
            seed: 42,                // Consistent seed for visual tests
        },
        styleTemplate: StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            behavior: {
                layout: {
                    preSteps: 500,   // Adjust based on data size
                },
            },
        }),
    },
};
```

**Requirements**:
- Use **absolute URLs** to sample data (for Chromatic compatibility)
- Use **ngraph layout with seed: 42** for determinism
- Adjust **preSteps** based on graph size (500 for small graphs, 8000+ for large)
- Story name should match format (e.g., `GraphML`, `CSV`, `GEXF`)

---

## Testing Strategy

### Unit Tests (Each DataSource)
- Parse valid files
- Handle parsing errors
- Yield in chunks
- Parse attributes correctly
- Handle edge cases

### Integration Tests (Graph.loadFromFile)
- Auto-detect format
- Load and render graph
- Event emission
- Error recovery

### Storybook Stories (Visual/Manual Testing)
- **Required for each format**: GraphML, CSV, GML, GEXF, DOT
- Load real data from public URLs
- Verify graph renders correctly
- Test with various graph sizes
- Ensure deterministic layouts (for Chromatic visual testing)

### Real-World Files
Test with actual files from:
- SNAP datasets
- Network Repository
- Gephi sample files
- Melanie Walsh's collection

---

## Documentation Updates Needed

### 1. API Documentation
**File**: `README.md`

Add section:
```markdown
### Loading Graph Data from Files

#### loadFromFile(file, options?)

Load graph data from a File object with automatic format detection.

**Parameters**:
- `file: File` - File object from file input
- `options?: object` - Optional configuration
  - `format?: string` - Override auto-detection ('json', 'graphml', 'csv', etc.)
  - `nodeIdPath?: string` - Custom node ID path (JMESPath)
  - `edgeSrcIdPath?: string` - Custom edge source path
  - `edgeDstIdPath?: string` - Custom edge target path

**Example**:
```typescript
// HTML file input
<input type="file" id="graphFile" accept=".json,.graphml,.csv,.gml,.gexf" />

// JavaScript
const input = document.getElementById('graphFile');
input.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  await graph.loadFromFile(file);
});
```

**Supported Formats**:
- JSON (D3.js, Cytoscape, generic)
- GraphML (.graphml, .xml)
- GEXF (.gexf)
- CSV edge lists (.csv)
- GML (.gml)
- DOT (.dot, .gv)
- Pajek NET (.net)

#### Events

Listen for loading progress and errors:

```typescript
graph.addEventListener('data-loading-progress', (event) => {
  console.log(`${event.percentage}% loaded`);
  console.log(`${event.nodesLoaded} nodes, ${event.edgesLoaded} edges`);
});

graph.addEventListener('data-loading-error', (event) => {
  console.warn('Parse error:', event.error.message);
  if (event.line) {
    console.warn(`  at line ${event.line}`);
  }
});

graph.addEventListener('data-loading-complete', (event) => {
  console.log(`Loaded ${event.nodesLoaded} nodes in ${event.duration}ms`);
  if (event.errors > 0) {
    console.warn(`  with ${event.errors} errors`);
  }
});
```
```

### 2. Storybook Stories
**File**: Create `stories/DataLoading.stories.ts`

```typescript
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../src/graphty-element.js';

const meta: Meta = {
  title: 'Features/Data Loading',
  component: 'graphty-element',
};

export default meta;
type Story = StoryObj;

export const FileUpload: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <input
        type="file"
        id="fileInput"
        accept=".json,.graphml,.csv,.gml,.gexf"
        style="padding: 0.5rem;"
      />
      <div id="status" style="padding: 0.5rem; background: #f0f0f0;"></div>
      <graphty-element
        id="graph"
        style="width: 800px; height: 600px; border: 1px solid #ccc;"
      ></graphty-element>
    </div>

    <script type="module">
      const input = document.getElementById('fileInput');
      const graph = document.getElementById('graph');
      const status = document.getElementById('status');

      input.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        status.textContent = 'Loading...';

        graph.addEventListener('data-loading-progress', (e) => {
          status.textContent = \`Loading: \${e.percentage?.toFixed(1)}% (\${e.nodesLoaded} nodes)\`;
        });

        graph.addEventListener('data-loading-complete', (e) => {
          status.textContent = \`Loaded \${e.nodesLoaded} nodes and \${e.edgesLoaded} edges in \${e.duration}ms\`;
        });

        graph.addEventListener('data-loading-error', (e) => {
          status.textContent = \`Error: \${e.error.message}\`;
        });

        try {
          await graph.loadFromFile(file);
        } catch (error) {
          status.textContent = \`Failed: \${error.message}\`;
        }
      });
    </script>
  `,
};

export const GraphMLExample: Story = {
  render: () => html`
    <graphty-element
      style="width: 800px; height: 600px;"
      data-source="graphml"
      .dataSourceConfig=${{
        url: 'https://raw.githubusercontent.com/gephi/gephi/master/modules/DesktopImport/test/unit/data/karate.graphml'
      }}
    ></graphty-element>
  `,
};
```

### 3. Type Definitions
**File**: Update relevant .d.ts files if needed

---

## External Libraries

| Library | Purpose | Size | License | Phase |
|---------|---------|------|---------|-------|
| `fast-xml-parser` | GraphML, GEXF, XGMML, BioPAX, SBML parsing | ~50KB | MIT | 2, 4, 8, 9 |
| `papaparse` | CSV parsing (all variants) | ~35KB | MIT | 3, 5 |
| `xlsx` (SheetJS) | Excel/XLSX parsing | ~500KB | Apache-2.0 | 8 |
| `n3` | RDF/Turtle/N-Triples parsing | ~150KB | MIT | 9 |

**Total Base (Phases 1-4)**: ~85KB (minified)
**Total with All Formats (Phases 1-9)**: ~735KB (minified)

**Note**: Libraries are only loaded if the corresponding DataSource is registered and used, so applications can tree-shake unused formats.

---

### Phase 5: CSV Variants & Enhanced Detection
**Objective**: Support multiple CSV formats with smart variant detection
**Duration**: 2-3 days
**Deliverables**: Enhanced CSVDataSource, variant detection, unit tests, Storybook stories for each variant

#### Background

The current CSVDataSource supports basic edge lists and node lists, but doesn't handle:
- Neo4j CSV import format (special header syntax)
- Gephi CSV format (specific column names)
- Cytoscape CSV format (interaction column)
- Adjacency list format
- Paired node+edge files

#### CSV Variant Detection Strategy

**src/data/csv-variant-detection.ts**:
```typescript
export type CSVVariant =
  | 'neo4j'
  | 'gephi'
  | 'cytoscape'
  | 'adjacency-list'
  | 'edge-list'
  | 'node-list'
  | 'generic';

export interface CSVVariantInfo {
  variant: CSVVariant;
  hasHeaders: boolean;
  delimiter: string;
  sourceColumn?: string;
  targetColumn?: string;
  idColumn?: string;
  labelColumn?: string;
  typeColumn?: string;
  interactionColumn?: string;
}

/**
 * Detect CSV variant from headers and sample data
 */
export function detectCSVVariant(
  headers: string[],
  firstRow: Record<string, any>
): CSVVariantInfo {
  // Check Neo4j format: :ID, :LABEL, :TYPE, :START_ID, :END_ID
  if (headers.some(h => /:(ID|LABEL|TYPE|START_ID|END_ID)/.test(h))) {
    return {
      variant: 'neo4j',
      hasHeaders: true,
      delimiter: ',',
      sourceColumn: ':START_ID',
      targetColumn: ':END_ID',
      idColumn: headers.find(h => h.endsWith(':ID')),
      labelColumn: ':LABEL',
      typeColumn: ':TYPE'
    };
  }

  // Check Gephi format: Source, Target, Type (case-sensitive)
  if (headers.includes('Source') && headers.includes('Target')) {
    return {
      variant: 'gephi',
      hasHeaders: true,
      delimiter: ',',
      sourceColumn: 'Source',
      targetColumn: 'Target',
      typeColumn: 'Type',
      labelColumn: 'Label'
    };
  }

  // Check Cytoscape format: interaction column
  if (headers.includes('interaction')) {
    return {
      variant: 'cytoscape',
      hasHeaders: true,
      delimiter: ',',
      sourceColumn: 'source',
      targetColumn: 'target',
      interactionColumn: 'interaction'
    };
  }

  // Check adjacency list: first column is node, rest are neighbors
  // No standard headers, detect by structure
  if (!headers.includes('source') && !headers.includes('target')) {
    return {
      variant: 'adjacency-list',
      hasHeaders: false,
      delimiter: headers.length > 10 ? ' ' : ','
    };
  }

  // Standard edge list
  if (headers.includes('source') || headers.includes('src')) {
    return {
      variant: 'edge-list',
      hasHeaders: true,
      delimiter: ',',
      sourceColumn: headers.includes('source') ? 'source' : 'src',
      targetColumn: headers.includes('target') ? 'target' : 'dst'
    };
  }

  // Node list
  if (headers.includes('id') || headers.includes('Id')) {
    return {
      variant: 'node-list',
      hasHeaders: true,
      delimiter: ',',
      idColumn: headers.includes('id') ? 'id' : 'Id'
    };
  }

  return {
    variant: 'generic',
    hasHeaders: true,
    delimiter: ','
  };
}
```

#### Enhanced CSVDataSource Implementation

**src/data/CSVDataSource.ts** (update existing):
```typescript
import { DataSource, DataSourceChunk } from './DataSource.js';
import Papa from 'papaparse';
import { AdHocData } from '../config.js';
import { detectCSVVariant, CSVVariant } from './csv-variant-detection.js';

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
  static readonly type = 'csv';

  private config: CSVDataSourceConfig;
  private variant: CSVVariant | null = null;

  async *sourceFetchData(): AsyncGenerator<DataSourceChunk, void, unknown> {
    // Handle paired files first
    if (this.config.nodeFile || this.config.edgeFile ||
        this.config.nodeURL || this.config.edgeURL) {
      yield* this.parsePairedFiles();
      return;
    }

    const csvContent = await this.getContent();

    // Parse headers to detect variant
    const parseResult = Papa.parse(csvContent, {
      header: true,
      preview: 1,
      delimiter: this.config.delimiter,
      dynamicTyping: true
    });

    const headers = parseResult.meta.fields || [];
    const firstRow = parseResult.data[0] as Record<string, any>;

    // Detect or use explicit variant
    const variantInfo = this.config.variant
      ? { variant: this.config.variant, hasHeaders: true, delimiter: this.config.delimiter || ',' }
      : detectCSVVariant(headers, firstRow);

    this.variant = variantInfo.variant;

    // Parse full file
    const fullParse = Papa.parse(csvContent, {
      header: variantInfo.hasHeaders,
      delimiter: variantInfo.delimiter,
      dynamicTyping: true,
      skipEmptyLines: true
    });

    // Route to appropriate parser based on variant
    switch (variantInfo.variant) {
      case 'neo4j':
        yield* this.parseNeo4jFormat(fullParse.data as Record<string, any>[], variantInfo);
        break;
      case 'gephi':
        yield* this.parseGephiFormat(fullParse.data as Record<string, any>[], variantInfo);
        break;
      case 'cytoscape':
        yield* this.parseCytoscapeFormat(fullParse.data as Record<string, any>[], variantInfo);
        break;
      case 'adjacency-list':
        yield* this.parseAdjacencyList(fullParse.data as string[][], variantInfo);
        break;
      case 'edge-list':
      case 'generic':
      default:
        yield* this.parseEdgeList(fullParse.data as Record<string, any>[], variantInfo);
        break;
    }
  }

  private async *parseNeo4jFormat(
    rows: Record<string, any>[],
    info: CSVVariantInfo
  ): AsyncGenerator<DataSourceChunk, void, unknown> {
    // Neo4j uses :ID suffix for node IDs
    const idColumn = Object.keys(rows[0]).find(k => k.endsWith(':ID'));
    const labelColumn = ':LABEL';

    const nodes: AdHocData[] = [];
    const edges: AdHocData[] = [];

    for (const row of rows) {
      if (idColumn && idColumn in row) {
        // This is a node row
        const node: AdHocData = { id: row[idColumn] };

        // Add label if present
        if (labelColumn in row) {
          node.label = row[labelColumn];
        }

        // Add all other properties (excluding special columns)
        for (const [key, value] of Object.entries(row)) {
          if (!key.startsWith(':') && key !== idColumn) {
            node[key] = value;
          }
        }

        nodes.push(node);
      } else if (':START_ID' in row && ':END_ID' in row) {
        // This is an edge row
        const edge: AdHocData = {
          src: row[':START_ID'],
          dst: row[':END_ID']
        };

        if (':TYPE' in row) {
          edge.type = row[':TYPE'];
        }

        // Add all other properties
        for (const [key, value] of Object.entries(row)) {
          if (!key.startsWith(':')) {
            edge[key] = value;
          }
        }

        edges.push(edge);
      }

      // Yield in chunks
      if (nodes.length >= this.chunkSize) {
        yield { nodes: nodes.splice(0, this.chunkSize), edges: [] };
      }
      if (edges.length >= this.chunkSize) {
        yield { nodes: [], edges: edges.splice(0, this.chunkSize) };
      }
    }

    // Yield remaining
    if (nodes.length > 0 || edges.length > 0) {
      yield { nodes, edges };
    }
  }

  private async *parseGephiFormat(
    rows: Record<string, any>[],
    info: CSVVariantInfo
  ): AsyncGenerator<DataSourceChunk, void, unknown> {
    // Gephi uses capitalized column names: Source, Target, Type, Id, Label, Weight
    yield* this.parseEdgeList(rows, {
      ...info,
      sourceColumn: 'Source',
      targetColumn: 'Target'
    });
  }

  private async *parseCytoscapeFormat(
    rows: Record<string, any>[],
    info: CSVVariantInfo
  ): AsyncGenerator<DataSourceChunk, void, unknown> {
    // Cytoscape has an 'interaction' column for edge type
    const edges: AdHocData[] = [];

    for (const row of rows) {
      const edge: AdHocData = {
        src: row[info.sourceColumn || 'source'],
        dst: row[info.targetColumn || 'target'],
        interaction: row.interaction,
        ...row
      };

      edges.push(edge);

      if (edges.length >= this.chunkSize) {
        yield { nodes: [], edges: edges.splice(0, this.chunkSize) };
      }
    }

    if (edges.length > 0) {
      yield { nodes: [], edges };
    }
  }

  private async *parseAdjacencyList(
    rows: string[][],
    info: CSVVariantInfo
  ): AsyncGenerator<DataSourceChunk, void, unknown> {
    // Format: each row is [node, neighbor1, neighbor2, ...]
    // Can optionally have weights: node neighbor1:weight1 neighbor2:weight2
    const edges: AdHocData[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 2) continue;

      const sourceNode = String(row[0]);

      // Process neighbors
      for (let j = 1; j < row.length; j++) {
        const neighbor = String(row[j]);

        // Check for weight notation: neighbor:weight
        let targetNode = neighbor;
        let weight: number | undefined;

        if (neighbor.includes(':')) {
          const parts = neighbor.split(':');
          targetNode = parts[0];
          weight = parseFloat(parts[1]);
        }

        const edge: AdHocData = {
          src: sourceNode,
          dst: targetNode
        };

        if (weight !== undefined) {
          edge.weight = weight;
        }

        edges.push(edge);

        if (edges.length >= this.chunkSize) {
          yield { nodes: [], edges: edges.splice(0, this.chunkSize) };
        }
      }
    }

    if (edges.length > 0) {
      yield { nodes: [], edges };
    }
  }

  private async *parsePairedFiles(): AsyncGenerator<DataSourceChunk, void, unknown> {
    // Load and parse node file
    let nodes: AdHocData[] = [];
    if (this.config.nodeFile || this.config.nodeURL) {
      const nodeContent = this.config.nodeFile
        ? await this.config.nodeFile.text()
        : await (await fetch(this.config.nodeURL!)).text();

      const nodeParse = Papa.parse(nodeContent, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      });

      nodes = (nodeParse.data as Record<string, any>[]).map(row => ({
        id: row.id || row.Id || row.ID,
        ...row
      }));
    }

    // Load and parse edge file
    let edges: AdHocData[] = [];
    if (this.config.edgeFile || this.config.edgeURL) {
      const edgeContent = this.config.edgeFile
        ? await this.config.edgeFile.text()
        : await (await fetch(this.config.edgeURL!)).text();

      const edgeParse = Papa.parse(edgeContent, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      });

      edges = (edgeParse.data as Record<string, any>[]).map(row => ({
        src: row.source || row.Source || row.src,
        dst: row.target || row.Target || row.dst,
        ...row
      }));
    }

    // Yield all nodes first, then edges
    for (let i = 0; i < nodes.length; i += this.chunkSize) {
      yield {
        nodes: nodes.slice(i, i + this.chunkSize),
        edges: []
      };
    }

    for (let i = 0; i < edges.length; i += this.chunkSize) {
      yield {
        nodes: [],
        edges: edges.slice(i, i + this.chunkSize)
      };
    }
  }

  // Keep existing methods: getContent, addError, etc.
}
```

#### Tests

**test/data/CSVDataSource.variants.test.ts**:
```typescript
import { describe, test, assert } from 'vitest';
import { CSVDataSource } from '../../src/data/CSVDataSource.js';

describe('CSVDataSource - Variants', () => {
  test('parses Neo4j node format', async () => {
    const csv = `personId:ID,name,:LABEL
1,John,Person
2,Jane,Person`;

    const source = new CSVDataSource({ data: csv });
    const chunks = [];

    for await (const chunk of source.getData()) {
      chunks.push(chunk);
    }

    assert.strictEqual(chunks[0].nodes.length, 2);
    assert.strictEqual(chunks[0].nodes[0].id, '1');
    assert.strictEqual(chunks[0].nodes[0].name, 'John');
    assert.strictEqual(chunks[0].nodes[0].label, 'Person');
  });

  test('parses Neo4j relationship format', async () => {
    const csv = `:START_ID,:END_ID,:TYPE
1,2,KNOWS
2,3,FOLLOWS`;

    const source = new CSVDataSource({ data: csv });
    const chunks = [];

    for await (const chunk of source.getData()) {
      chunks.push(chunk);
    }

    assert.strictEqual(chunks[0].edges.length, 2);
    assert.strictEqual(chunks[0].edges[0].src, '1');
    assert.strictEqual(chunks[0].edges[0].dst, '2');
    assert.strictEqual(chunks[0].edges[0].type, 'KNOWS');
  });

  test('parses Gephi format', async () => {
    const csv = `Source,Target,Type,Weight
node1,node2,Directed,1.5
node2,node3,Directed,2.0`;

    const source = new CSVDataSource({ data: csv });
    const chunks = [];

    for await (const chunk of source.getData()) {
      chunks.push(chunk);
    }

    assert.strictEqual(chunks[0].edges.length, 2);
    assert.strictEqual(chunks[0].edges[0].src, 'node1');
    assert.strictEqual(chunks[0].edges[0].Type, 'Directed');
  });

  test('parses Cytoscape format with interaction column', async () => {
    const csv = `source,target,interaction
ProteinA,ProteinB,pp
ProteinB,DrugX,pd`;

    const source = new CSVDataSource({ data: csv });
    const chunks = [];

    for await (const chunk of source.getData()) {
      chunks.push(chunk);
    }

    assert.strictEqual(chunks[0].edges.length, 2);
    assert.strictEqual(chunks[0].edges[0].interaction, 'pp');
    assert.strictEqual(chunks[0].edges[1].interaction, 'pd');
  });

  test('parses adjacency list format', async () => {
    const csv = `node1 node2 node3
node2 node1 node4
node3 node1
node4 node2`;

    const source = new CSVDataSource({
      data: csv,
      variant: 'adjacency-list'
    });
    const chunks = [];

    for await (const chunk of source.getData()) {
      chunks.push(chunk);
    }

    const allEdges = chunks.flatMap(c => c.edges);
    assert.isTrue(allEdges.length >= 5);
    assert.isTrue(allEdges.some(e => e.src === 'node1' && e.dst === 'node2'));
  });

  test('parses adjacency list with weights', async () => {
    const csv = `node1 node2:1.5 node3:2.0
node2 node4:0.8`;

    const source = new CSVDataSource({
      data: csv,
      variant: 'adjacency-list'
    });
    const chunks = [];

    for await (const chunk of source.getData()) {
      chunks.push(chunk);
    }

    const allEdges = chunks.flatMap(c => c.edges);
    const edge1 = allEdges.find(e => e.src === 'node1' && e.dst === 'node2');
    assert.strictEqual(edge1?.weight, 1.5);
  });

  test('handles paired node and edge files', async () => {
    const nodeCSV = `id,label,type
n1,Node 1,A
n2,Node 2,B`;

    const edgeCSV = `source,target,weight
n1,n2,1.5`;

    const nodeFile = new File([nodeCSV], 'nodes.csv', { type: 'text/csv' });
    const edgeFile = new File([edgeCSV], 'edges.csv', { type: 'text/csv' });

    const source = new CSVDataSource({
      nodeFile,
      edgeFile
    });
    const chunks = [];

    for await (const chunk of source.getData()) {
      chunks.push(chunk);
    }

    const allNodes = chunks.flatMap(c => c.nodes);
    const allEdges = chunks.flatMap(c => c.edges);

    assert.strictEqual(allNodes.length, 2);
    assert.strictEqual(allEdges.length, 1);
    assert.strictEqual(allNodes[0].label, 'Node 1');
  });
});
```

#### Storybook Stories

**stories/Data.stories.ts** (add to existing):
```typescript
export const CSV_Neo4j_Nodes: Story = {
  args: {
    dataSource: "csv",
    dataSourceConfig: {
      data: `personId:ID,name,age:int,:LABEL
1,Alice,30,Person
2,Bob,25,Person
3,Charlie,35,Person`,
    },
  },
};

export const CSV_Neo4j_Edges: Story = {
  args: {
    dataSource: "csv",
    dataSourceConfig: {
      data: `:START_ID,:END_ID,:TYPE,since:int
1,2,KNOWS,2020
2,3,FOLLOWS,2021
1,3,KNOWS,2019`,
    },
  },
};

export const CSV_Gephi: Story = {
  args: {
    dataSource: "csv",
    dataSourceConfig: {
      data: `Source,Target,Type,Weight,Label
server1,client1,Directed,1.5,Connection
client1,database1,Directed,2.0,Query
server1,database1,Directed,0.8,Direct`,
    },
  },
};

export const CSV_AdjacencyList: Story = {
  args: {
    dataSource: "csv",
    dataSourceConfig: {
      variant: "adjacency-list",
      data: `A B C D
B A E
C A D
D A C
E B`,
    },
  },
};
```

#### Dependencies
- **External**: None (existing papaparse)
- **Internal**: Phase 3 (CSV DataSource)

#### Verification
1. Run: `npm test -- CSVDataSource.variants`
2. Test each variant with real-world files
3. Verify all Storybook stories render
4. Test paired file loading

---

### Phase 6: JSON Variants & Smart Detection
**Objective**: Support all major JSON format variants with automatic detection
**Duration**: 2-3 days
**Deliverables**: Enhanced JsonDataSource, variant detection, unit tests, Storybook stories

#### Background

Current JsonDataSource uses JMESPath for flexible querying, but doesn't automatically detect and optimize for specific formats:
- Sigma.js/Graphology (uses `key` instead of `id`)
- Vis.js (uses `from`/`to` instead of `source`/`target`)
- NetworkX adjacency format
- G6 (AntV) format
- JSON Graph Format (JGF) formal spec
- 3d-force-graph format

#### JSON Variant Detection Strategy

**src/data/json-variant-detection.ts**:
```typescript
export type JSONVariant =
  | 'd3'           // D3.js node-link format
  | 'cytoscape'    // Cytoscape.js format
  | 'sigma'        // Sigma.js/Graphology format
  | 'vis'          // Vis.js format
  | 'networkx'     // NetworkX node-link
  | 'g6'           // AntV G6 format
  | 'jgf'          // JSON Graph Format
  | '3d-force'     // 3d-force-graph format
  | 'generic';     // Generic/unknown

export interface JSONVariantInfo {
  variant: JSONVariant;
  nodePath: string;
  edgePath: string;
  nodeIdField: string;
  edgeSourceField: string;
  edgeTargetField: string;
  hasPositions: boolean;
  positionFields?: { x: string; y: string; z?: string };
}

/**
 * Detect JSON variant from structure
 */
export function detectJSONVariant(data: any): JSONVariantInfo {
  // Cytoscape.js: has elements.nodes and elements.edges
  if (data.elements && data.elements.nodes && data.elements.edges) {
    const sampleNode = data.elements.nodes[0];
    return {
      variant: 'cytoscape',
      nodePath: 'elements.nodes',
      edgePath: 'elements.edges',
      nodeIdField: 'data.id',
      edgeSourceField: 'data.source',
      edgeTargetField: 'data.target',
      hasPositions: sampleNode?.position !== undefined,
      positionFields: { x: 'position.x', y: 'position.y' }
    };
  }

  // Sigma.js/Graphology: uses 'key' instead of 'id', has 'attributes'
  if (data.nodes && data.nodes[0] && 'key' in data.nodes[0]) {
    return {
      variant: 'sigma',
      nodePath: 'nodes',
      edgePath: 'edges',
      nodeIdField: 'key',
      edgeSourceField: 'source',
      edgeTargetField: 'target',
      hasPositions: data.nodes[0].attributes?.x !== undefined,
      positionFields: { x: 'attributes.x', y: 'attributes.y', z: 'attributes.z' }
    };
  }

  // Vis.js: uses 'from' and 'to' instead of 'source' and 'target'
  if (data.nodes && data.edges && data.edges[0] && 'from' in data.edges[0]) {
    return {
      variant: 'vis',
      nodePath: 'nodes',
      edgePath: 'edges',
      nodeIdField: 'id',
      edgeSourceField: 'from',
      edgeTargetField: 'to',
      hasPositions: data.nodes[0]?.x !== undefined,
      positionFields: { x: 'x', y: 'y' }
    };
  }

  // JSON Graph Format (JGF): has graph.nodes and graph.edges
  if (data.graph && data.graph.nodes && data.graph.edges) {
    return {
      variant: 'jgf',
      nodePath: 'graph.nodes',
      edgePath: 'graph.edges',
      nodeIdField: 'id',
      edgeSourceField: 'source',
      edgeTargetField: 'target',
      hasPositions: data.graph.nodes[0]?.metadata?.x !== undefined,
      positionFields: { x: 'metadata.x', y: 'metadata.y' }
    };
  }

  // NetworkX: has 'directed', 'multigraph', 'graph' metadata
  if (data.directed !== undefined && data.multigraph !== undefined) {
    const usesLinks = 'links' in data;
    return {
      variant: 'networkx',
      nodePath: 'nodes',
      edgePath: usesLinks ? 'links' : 'edges',
      nodeIdField: 'id',
      edgeSourceField: 'source',
      edgeTargetField: 'target',
      hasPositions: false
    };
  }

  // G6 (AntV): nodes often have x, y directly
  if (data.nodes && data.nodes[0] &&
      'x' in data.nodes[0] && 'y' in data.nodes[0]) {
    return {
      variant: 'g6',
      nodePath: 'nodes',
      edgePath: 'edges',
      nodeIdField: 'id',
      edgeSourceField: 'source',
      edgeTargetField: 'target',
      hasPositions: true,
      positionFields: { x: 'x', y: 'y', z: 'z' }
    };
  }

  // 3d-force-graph: uses 'links', often has 'val' for node size
  if (data.nodes && data.links && data.nodes[0] && 'val' in data.nodes[0]) {
    return {
      variant: '3d-force',
      nodePath: 'nodes',
      edgePath: 'links',
      nodeIdField: 'id',
      edgeSourceField: 'source',
      edgeTargetField: 'target',
      hasPositions: data.nodes[0]?.x !== undefined,
      positionFields: { x: 'x', y: 'y', z: 'z' }
    };
  }

  // D3.js default: has nodes and links
  if (data.nodes && data.links) {
    return {
      variant: 'd3',
      nodePath: 'nodes',
      edgePath: 'links',
      nodeIdField: 'id',
      edgeSourceField: 'source',
      edgeTargetField: 'target',
      hasPositions: data.nodes[0]?.x !== undefined,
      positionFields: { x: 'x', y: 'y', z: 'z' }
    };
  }

  // Default/generic: has nodes and edges
  return {
    variant: 'generic',
    nodePath: 'nodes',
    edgePath: 'edges',
    nodeIdField: 'id',
    edgeSourceField: 'source',
    edgeTargetField: 'target',
    hasPositions: false
  };
}
```

#### Enhanced JsonDataSource

**src/data/JsonDataSource.ts** (update existing):
```typescript
import jmespath from "jmespath";
import { z } from "zod/v4";
import * as z4 from "zod/v4/core";
import type { PartiallyOptional } from "../config/common";
import { DataSource, DataSourceChunk } from "./DataSource";
import { detectJSONVariant, JSONVariant } from "./json-variant-detection.js";

const JsonNodeConfig = z.strictObject({
  path: z.string().default("nodes"),
  schema: z.custom<z4.$ZodObject>().or(z.null()).default(null),
}).prefault({});

const JsonEdgeConfig = z.strictObject({
  path: z.string().default("edges"),
  schema: z.custom<z4.$ZodObject>().or(z.null()).default(null),
}).prefault({});

export const JsonDataSourceConfig = z.object({
  data: z.string(),
  node: JsonNodeConfig,
  edge: JsonEdgeConfig,
  variant: z.enum(['d3', 'cytoscape', 'sigma', 'vis', 'networkx', 'g6', 'jgf', '3d-force', 'generic']).optional(),
  autoDetect: z.boolean().default(true),
});

export type JsonDataSourceConfigType = z.infer<typeof JsonDataSourceConfig>;
export type JsonDataSourceConfigOpts = PartiallyOptional<JsonDataSourceConfigType, "node" | "edge">;

export class JsonDataSource extends DataSource {
  static type = "json";
  url: string;
  opts: JsonDataSourceConfigType;
  private detectedVariant: JSONVariant | null = null;

  constructor(anyOpts: object) {
    super();

    const opts = JsonDataSourceConfig.parse(anyOpts);
    this.opts = opts;

    if (opts.node.schema) {
      this.nodeSchema = opts.node.schema;
    }

    if (opts.edge.schema) {
      this.edgeSchema = opts.edge.schema;
    }

    this.url = opts.data;
  }

  async *sourceFetchData(): AsyncGenerator<DataSourceChunk, void, unknown> {
    let response: Response;
    let data: unknown;

    try {
      response = await this.fetchWithRetry(this.url);
    } catch (error) {
      throw new Error(`Failed to fetch data from ${this.url}: ${error instanceof Error ? error.message : String(error)}`);
    }

    try {
      data = await response.json();
    } catch (error) {
      throw new Error(`Failed to parse JSON from ${this.url}: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Auto-detect variant if enabled and not explicitly set
    if (this.opts.autoDetect && !this.opts.variant) {
      const variantInfo = detectJSONVariant(data);
      this.detectedVariant = variantInfo.variant;

      // Override paths based on detected variant
      if (!this.opts.node.path || this.opts.node.path === 'nodes') {
        this.opts.node.path = variantInfo.nodePath;
      }
      if (!this.opts.edge.path || this.opts.edge.path === 'edges') {
        this.opts.edge.path = variantInfo.edgePath;
      }

      // Set up field mappings for variant-specific parsing
      this.configureVariant(variantInfo);
    }

    // Extract nodes using JMESPath
    let nodes: unknown[];
    try {
      nodes = jmespath.search(data, this.opts.node.path) as unknown[];
      if (!Array.isArray(nodes)) {
        throw new Error(`Node path '${this.opts.node.path}' did not return an array`);
      }
    } catch (error) {
      throw new Error(`Failed to extract nodes from path '${this.opts.node.path}': ${error instanceof Error ? error.message : String(error)}`);
    }

    // Extract edges using JMESPath
    let edges: unknown[];
    try {
      edges = jmespath.search(data, this.opts.edge.path) as unknown[];
      if (!Array.isArray(edges)) {
        edges = [];
      }
    } catch (error) {
      edges = [];
    }

    // Transform based on variant
    const transformedNodes = this.transformNodes(nodes);
    const transformedEdges = this.transformEdges(edges);

    // Yield in single chunk (could be enhanced for chunking)
    yield { nodes: transformedNodes, edges: transformedEdges };
  }

  private variantConfig: {
    nodeIdField: string;
    edgeSourceField: string;
    edgeTargetField: string;
  } = {
    nodeIdField: 'id',
    edgeSourceField: 'source',
    edgeTargetField: 'target'
  };

  private configureVariant(info: JSONVariantInfo): void {
    this.variantConfig = {
      nodeIdField: info.nodeIdField,
      edgeSourceField: info.edgeSourceField,
      edgeTargetField: info.edgeTargetField
    };
  }

  private transformNodes(nodes: unknown[]): any[] {
    return nodes.map((node: any) => {
      // Handle nested ID field (e.g., data.id for Cytoscape)
      const id = this.extractField(node, this.variantConfig.nodeIdField);

      // For Cytoscape format, flatten data and position
      if (this.detectedVariant === 'cytoscape' && node.data) {
        return {
          ...node.data,
          id,
          ...(node.position && { position: node.position }),
          ...(node.style && { style: node.style })
        };
      }

      // For Sigma/Graphology, flatten attributes
      if (this.detectedVariant === 'sigma' && node.attributes) {
        return {
          ...node.attributes,
          id
        };
      }

      // Default: use node as-is with normalized id
      return {
        ...node,
        id
      };
    });
  }

  private transformEdges(edges: unknown[]): any[] {
    return edges.map((edge: any) => {
      const src = this.extractField(edge, this.variantConfig.edgeSourceField);
      const dst = this.extractField(edge, this.variantConfig.edgeTargetField);

      // For Cytoscape format, flatten data
      if (this.detectedVariant === 'cytoscape' && edge.data) {
        return {
          ...edge.data,
          src,
          dst
        };
      }

      // Default: use edge as-is with normalized src/dst
      return {
        ...edge,
        src,
        dst
      };
    });
  }

  private extractField(obj: any, path: string): any {
    // Handle nested paths like 'data.id'
    const parts = path.split('.');
    let value = obj;
    for (const part of parts) {
      value = value?.[part];
    }
    return value;
  }

  // Keep existing fetchWithRetry method...
}
```

#### Tests

**test/data/JsonDataSource.variants.test.ts**:
```typescript
import { describe, test, assert } from 'vitest';
import { JsonDataSource } from '../../src/data/JsonDataSource.js';
import { detectJSONVariant } from '../../src/data/json-variant-detection.js';

describe('JSON Variant Detection', () => {
  test('detects Cytoscape.js format', () => {
    const data = {
      elements: {
        nodes: [
          { data: { id: 'n1', label: 'Node 1' } },
          { data: { id: 'n2', label: 'Node 2' } }
        ],
        edges: [
          { data: { id: 'e1', source: 'n1', target: 'n2' } }
        ]
      }
    };

    const info = detectJSONVariant(data);
    assert.strictEqual(info.variant, 'cytoscape');
    assert.strictEqual(info.nodePath, 'elements.nodes');
    assert.strictEqual(info.nodeIdField, 'data.id');
  });

  test('detects Sigma.js/Graphology format', () => {
    const data = {
      nodes: [
        { key: 'n1', attributes: { label: 'Node 1', x: 0, y: 0 } }
      ],
      edges: [
        { key: 'e1', source: 'n1', target: 'n2' }
      ]
    };

    const info = detectJSONVariant(data);
    assert.strictEqual(info.variant, 'sigma');
    assert.strictEqual(info.nodeIdField, 'key');
  });

  test('detects Vis.js format', () => {
    const data = {
      nodes: [
        { id: 1, label: 'Node 1' }
      ],
      edges: [
        { from: 1, to: 2, label: 'Edge' }
      ]
    };

    const info = detectJSONVariant(data);
    assert.strictEqual(info.variant, 'vis');
    assert.strictEqual(info.edgeSourceField, 'from');
    assert.strictEqual(info.edgeTargetField, 'to');
  });

  test('detects NetworkX format', () => {
    const data = {
      directed: false,
      multigraph: false,
      graph: {},
      nodes: [{ id: 'n1' }],
      links: [{ source: 'n1', target: 'n2' }]
    };

    const info = detectJSONVariant(data);
    assert.strictEqual(info.variant, 'networkx');
    assert.strictEqual(info.edgePath, 'links');
  });

  test('detects JSON Graph Format (JGF)', () => {
    const data = {
      graph: {
        directed: true,
        nodes: [{ id: 'n1', label: 'Node 1' }],
        edges: [{ source: 'n1', target: 'n2' }]
      }
    };

    const info = detectJSONVariant(data);
    assert.strictEqual(info.variant, 'jgf');
    assert.strictEqual(info.nodePath, 'graph.nodes');
  });

  test('detects 3d-force-graph format', () => {
    const data = {
      nodes: [
        { id: 'n1', name: 'Node 1', val: 1 }
      ],
      links: [
        { source: 'n1', target: 'n2', value: 1 }
      ]
    };

    const info = detectJSONVariant(data);
    assert.strictEqual(info.variant, '3d-force');
    assert.strictEqual(info.edgePath, 'links');
  });
});

describe('JsonDataSource - Variants', () => {
  test('parses Cytoscape.js format automatically', async () => {
    const data = JSON.stringify({
      elements: {
        nodes: [
          { data: { id: 'n1', label: 'Node 1' }, position: { x: 100, y: 200 } },
          { data: { id: 'n2', label: 'Node 2' } }
        ],
        edges: [
          { data: { id: 'e1', source: 'n1', target: 'n2', weight: 1.5 } }
        ]
      }
    });

    // Mock fetch to return this data
    global.fetch = async () => ({
      ok: true,
      json: async () => JSON.parse(data)
    }) as Response;

    const source = new JsonDataSource({
      data: 'mock://cytoscape.json'
    });

    const chunks = [];
    for await (const chunk of source.getData()) {
      chunks.push(chunk);
    }

    assert.strictEqual(chunks[0].nodes.length, 2);
    assert.strictEqual(chunks[0].nodes[0].id, 'n1');
    assert.strictEqual(chunks[0].nodes[0].label, 'Node 1');
    assert.deepStrictEqual(chunks[0].nodes[0].position, { x: 100, y: 200 });
  });

  test('parses Sigma.js format automatically', async () => {
    const data = JSON.stringify({
      nodes: [
        { key: 'n1', attributes: { label: 'Node 1', x: 0, y: 0, color: '#f00' } }
      ],
      edges: [
        { key: 'e1', source: 'n1', target: 'n2', attributes: { weight: 1 } }
      ]
    });

    global.fetch = async () => ({
      ok: true,
      json: async () => JSON.parse(data)
    }) as Response;

    const source = new JsonDataSource({
      data: 'mock://sigma.json'
    });

    const chunks = [];
    for await (const chunk of source.getData()) {
      chunks.push(chunk);
    }

    assert.strictEqual(chunks[0].nodes[0].id, 'n1');
    assert.strictEqual(chunks[0].nodes[0].label, 'Node 1');
    assert.strictEqual(chunks[0].nodes[0].color, '#f00');
  });

  test('parses Vis.js format automatically', async () => {
    const data = JSON.stringify({
      nodes: [
        { id: 1, label: 'Node 1', group: 'A' }
      ],
      edges: [
        { from: 1, to: 2, label: 'Edge 1-2' }
      ]
    });

    global.fetch = async () => ({
      ok: true,
      json: async () => JSON.parse(data)
    }) as Response;

    const source = new JsonDataSource({
      data: 'mock://vis.json'
    });

    const chunks = [];
    for await (const chunk of source.getData()) {
      chunks.push(chunk);
    }

    assert.strictEqual(chunks[0].edges[0].src, 1);
    assert.strictEqual(chunks[0].edges[0].dst, 2);
  });
});
```

#### Storybook Stories

**stories/Data.stories.ts** (add):
```typescript
export const JSON_Cytoscape: Story = {
  args: {
    dataSource: "json",
    dataSourceConfig: {
      data: "data:application/json," + encodeURIComponent(JSON.stringify({
        elements: {
          nodes: [
            { data: { id: 'server', label: 'Server', type: 'backend' }, position: { x: 100, y: 200 } },
            { data: { id: 'client', label: 'Client', type: 'frontend' } },
            { data: { id: 'db', label: 'Database', type: 'storage' } }
          ],
          edges: [
            { data: { source: 'server', target: 'client', label: 'HTTP' } },
            { data: { source: 'server', target: 'db', label: 'SQL' } }
          ]
        }
      }))
    },
  },
};

export const JSON_Sigma: Story = {
  args: {
    dataSource: "json",
    dataSourceConfig: {
      data: "data:application/json," + encodeURIComponent(JSON.stringify({
        nodes: [
          { key: 'n1', attributes: { label: 'Node 1', x: 0, y: 0, size: 10, color: '#f00' } },
          { key: 'n2', attributes: { label: 'Node 2', x: 100, y: 100, size: 15, color: '#0f0' } },
          { key: 'n3', attributes: { label: 'Node 3', x: 50, y: 150, size: 12, color: '#00f' } }
        ],
        edges: [
          { key: 'e1', source: 'n1', target: 'n2', attributes: { weight: 1, color: '#ccc' } },
          { key: 'e2', source: 'n2', target: 'n3', attributes: { weight: 2 } }
        ]
      }))
    },
  },
};

export const JSON_Vis: Story = {
  args: {
    dataSource: "json",
    dataSourceConfig: {
      data: "data:application/json," + encodeURIComponent(JSON.stringify({
        nodes: [
          { id: 1, label: 'Node 1', group: 'A' },
          { id: 2, label: 'Node 2', group: 'B' },
          { id: 3, label: 'Node 3', group: 'A' }
        ],
        edges: [
          { from: 1, to: 2, label: 'Edge 1-2' },
          { from: 2, to: 3, label: 'Edge 2-3' }
        ]
      }))
    },
  },
};

export const JSON_NetworkX: Story = {
  args: {
    dataSource: "json",
    dataSourceConfig: {
      data: "data:application/json," + encodeURIComponent(JSON.stringify({
        directed: false,
        multigraph: false,
        graph: { name: 'Example Graph' },
        nodes: [
          { id: 'n1', data: 'Node 1' },
          { id: 'n2', data: 'Node 2' }
        ],
        links: [
          { source: 'n1', target: 'n2', weight: 1.5 }
        ]
      }))
    },
  },
};
```

#### Dependencies
- **External**: None (existing jmespath)
- **Internal**: Phase 1

#### Verification
1. Run: `npm test -- JsonDataSource.variants`
2. Test with real files from each format
3. Verify all Storybook stories render
4. Test auto-detection accuracy

---

### Phase 7: Pajek NET Parser
**Objective**: Complete Pajek NET implementation (detection exists, need parser)
**Duration**: 1-2 days
**Deliverables**: PajekDataSource class, unit tests, Storybook story

#### Implementation

**src/data/PajekDataSource.ts**:
```typescript
import { DataSource, DataSourceChunk } from './DataSource.js';
import { AdHocData } from '../config.js';

export interface PajekDataSourceConfig {
  data?: string;
  file?: File;
  url?: string;
  chunkSize?: number;
  errorLimit?: number;
}

interface PajekVertex {
  id: number;
  label: string;
  x?: number;
  y?: number;
  z?: number;
  shape?: string;
  color?: string;
  [key: string]: any;
}

export class PajekDataSource extends DataSource {
  static readonly type = 'pajek';

  private config: PajekDataSourceConfig;
  private chunkSize: number;
  private errorLimit: number;
  private errors: Array<{ message: string; line?: number }> = [];

  constructor(config: PajekDataSourceConfig) {
    super();
    this.config = config;
    this.chunkSize = config.chunkSize || 1000;
    this.errorLimit = config.errorLimit || 100;
  }

  async *sourceFetchData(): AsyncGenerator<DataSourceChunk, void, unknown> {
    const content = await this.getContent();
    const lines = content.split('\n').map(l => l.trim());

    let currentSection: 'vertices' | 'arcs' | 'edges' | 'matrix' | null = null;
    let vertexCount = 0;
    const vertices: PajekVertex[] = [];
    const edges: AdHocData[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip empty lines and comments
      if (!line || line.startsWith('%')) continue;

      // Detect sections
      if (/^\*vertices/i.test(line)) {
        currentSection = 'vertices';
        const match = line.match(/\*vertices\s+(\d+)/i);
        if (match) {
          vertexCount = parseInt(match[1], 10);
        }
        continue;
      }

      if (/^\*arcs/i.test(line)) {
        currentSection = 'arcs';
        continue;
      }

      if (/^\*edges/i.test(line)) {
        currentSection = 'edges';
        continue;
      }

      if (/^\*matrix/i.test(line)) {
        currentSection = 'matrix';
        continue;
      }

      // Parse based on current section
      try {
        switch (currentSection) {
          case 'vertices':
            vertices.push(this.parseVertex(line));
            break;

          case 'arcs':
            // Arcs are directed edges
            const arc = this.parseEdge(line, true);
            if (arc) edges.push(arc);
            break;

          case 'edges':
            // Edges are undirected
            const edge = this.parseEdge(line, false);
            if (edge) edges.push(edge);
            break;

          case 'matrix':
            // TODO: Parse adjacency matrix
            // For now, skip matrix section
            break;
        }
      } catch (error) {
        this.addError(
          `Failed to parse line ${i + 1}: ${error instanceof Error ? error.message : String(error)}`,
          i + 1
        );
      }
    }

    // Convert vertices to nodes
    const nodes: AdHocData[] = vertices.map(v => ({
      id: String(v.id),
      label: v.label,
      ...(v.x !== undefined && { x: v.x }),
      ...(v.y !== undefined && { y: v.y }),
      ...(v.z !== undefined && { z: v.z }),
      ...(v.shape && { shape: v.shape }),
      ...(v.color && { color: v.color })
    }));

    // Yield in chunks
    for (let i = 0; i < nodes.length; i += this.chunkSize) {
      const nodeChunk = nodes.slice(i, i + this.chunkSize);
      const edgeChunk = i === 0 ? edges : [];
      yield { nodes: nodeChunk, edges: edgeChunk };
    }

    if (nodes.length === 0 && edges.length > 0) {
      yield { nodes: [], edges };
    }
  }

  private parseVertex(line: string): PajekVertex {
    // Format: id "label" x y z shape x_fact y_fact color [attributes]
    // Minimal: id "label"
    const match = line.match(/^(\d+)\s+"([^"]+)"(?:\s+([\d.]+)\s+([\d.]+)(?:\s+([\d.]+))?)?/);

    if (!match) {
      throw new Error(`Invalid vertex format: ${line}`);
    }

    const vertex: PajekVertex = {
      id: parseInt(match[1], 10),
      label: match[2]
    };

    if (match[3]) vertex.x = parseFloat(match[3]);
    if (match[4]) vertex.y = parseFloat(match[4]);
    if (match[5]) vertex.z = parseFloat(match[5]);

    return vertex;
  }

  private parseEdge(line: string, directed: boolean): AdHocData | null {
    // Format: source target weight [label]
    const parts = line.split(/\s+/);

    if (parts.length < 2) return null;

    const edge: AdHocData = {
      src: parts[0],
      dst: parts[1],
      directed
    };

    if (parts.length >= 3) {
      const weight = parseFloat(parts[2]);
      if (!isNaN(weight)) {
        edge.weight = weight;
      }
    }

    return edge;
  }

  private async getContent(): Promise<string> {
    if (this.config.data) return this.config.data;
    if (this.config.file) return await this.config.file.text();

    if (this.config.url) {
      const response = await fetch(this.config.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch from ${this.config.url}: ${response.status}`);
      }
      return await response.text();
    }

    throw new Error('PajekDataSource requires data, file, or url');
  }

  private addError(message: string, line?: number): void {
    this.errors.push({ message, line });
    if (this.errors.length >= this.errorLimit) {
      throw new Error(`Too many errors (${this.errors.length}), aborting`);
    }
  }
}
```

**src/data/index.ts** (add registration):
```typescript
import { PajekDataSource } from "./PajekDataSource";

DataSource.register(PajekDataSource);
```

#### Tests

**test/data/PajekDataSource.test.ts**:
```typescript
import { describe, test, assert } from 'vitest';
import { PajekDataSource } from '../../src/data/PajekDataSource.js';

describe('PajekDataSource', () => {
  test('parses basic Pajek NET format', async () => {
    const net = `*Vertices 3
1 "Node 1" 0.5 0.5 0.5
2 "Node 2" 0.3 0.7 0.5
3 "Node 3" 0.8 0.4 0.5

*Arcs
1 2 1.0
2 3 2.5

*Edges
1 3 0.8`;

    const source = new PajekDataSource({ data: net });
    const chunks = [];

    for await (const chunk of source.getData()) {
      chunks.push(chunk);
    }

    assert.strictEqual(chunks[0].nodes.length, 3);
    assert.strictEqual(chunks[0].nodes[0].label, 'Node 1');
    assert.strictEqual(chunks[0].nodes[0].x, 0.5);

    assert.strictEqual(chunks[0].edges.length, 3);
    assert.strictEqual(chunks[0].edges[0].src, '1');
    assert.strictEqual(chunks[0].edges[0].dst, '2');
    assert.strictEqual(chunks[0].edges[0].directed, true);
    assert.strictEqual(chunks[0].edges[2].directed, false);
  });
});
```

#### Storybook Story

**stories/Data.stories.ts** (add):
```typescript
export const PajekNET: Story = {
  args: {
    dataSource: "pajek",
    dataSourceConfig: {
      data: `*Vertices 5
1 "Server" 0.5 0.5 0.5
2 "Client 1" 0.3 0.7 0.5
3 "Client 2" 0.7 0.7 0.5
4 "Database" 0.5 0.3 0.5
5 "Cache" 0.5 0.9 0.5

*Arcs
1 2 1.5
1 3 1.5
1 4 2.0
1 5 1.0

*Edges
2 3 0.5
4 5 0.8`,
    },
  },
};
```

#### Dependencies
- **External**: None
- **Internal**: Phase 1

#### Verification
1. Run: `npm test -- PajekDataSource`
2. Test with real Pajek files
3. Verify Storybook story renders

---

### Phase 8: Tier 3 Medium Priority Formats
**Objective**: Implement UCINET DL, Excel/XLSX, GraphSON, XGMML, SIF
**Duration**: 4-5 days
**Deliverables**: 5 new DataSource classes, tests for each, Storybook stories for each

#### Sub-Phase 8a: UCINET DL (1 day)

**Library**: None (custom parser)

**src/data/UCINETDataSource.ts**:
```typescript
import { DataSource, DataSourceChunk } from './DataSource.js';
import { AdHocData } from '../config.js';

export interface UCINETDataSourceConfig {
  data?: string;
  file?: File;
  url?: string;
}

type DLFormat = 'edgelist1' | 'nodelist1' | 'fullmatrix' | 'unknown';

export class UCINETDataSource extends DataSource {
  static readonly type = 'ucinet';

  private config: UCINETDataSourceConfig;

  async *sourceFetchData(): AsyncGenerator<DataSourceChunk, void, unknown> {
    const content = await this.getContent();
    const lines = content.split('\n').map(l => l.trim());

    let n = 0;
    let format: DLFormat = 'unknown';
    let labels: string[] = [];
    let inDataSection = false;

    for (const line of lines) {
      if (!line || line.startsWith('*')) continue;

      // Parse header
      if (line.toUpperCase().startsWith('DL')) {
        const nMatch = line.match(/n=(\d+)/i);
        if (nMatch) n = parseInt(nMatch[1], 10);

        const formatMatch = line.match(/format=(\w+)/i);
        if (formatMatch) format = formatMatch[1].toLowerCase() as DLFormat;

        continue;
      }

      if (line.toLowerCase().startsWith('labels:')) {
        continue; // Next line will have labels
      }

      if (line.toLowerCase().startsWith('data:')) {
        inDataSection = true;
        continue;
      }

      // Parse labels
      if (!inDataSection && labels.length === 0) {
        labels = line.split(/[,\s]+/).filter(Boolean);
        continue;
      }

      // Parse data based on format
      if (inDataSection) {
        // Implementation depends on format
        // For now, handle edgelist1
        if (format === 'edgelist1') {
          yield* this.parseEdgeList(lines.slice(lines.indexOf(line)), labels);
          break;
        }
      }
    }
  }

  private async *parseEdgeList(
    dataLines: string[],
    labels: string[]
  ): AsyncGenerator<DataSourceChunk, void, unknown> {
    const edges: AdHocData[] = [];

    for (const line of dataLines) {
      if (!line || line.startsWith('*')) continue;

      const parts = line.split(/\s+/);
      if (parts.length < 3) continue;

      const src = labels[parseInt(parts[0], 10) - 1] || parts[0];
      const dst = labels[parseInt(parts[1], 10) - 1] || parts[1];
      const weight = parseFloat(parts[2]);

      edges.push({ src, dst, weight });
    }

    yield { nodes: [], edges };
  }

  private async getContent(): Promise<string> {
    if (this.config.data) return this.config.data;
    if (this.config.file) return await this.config.file.text();
    if (this.config.url) {
      const response = await fetch(this.config.url);
      return await response.text();
    }
    throw new Error('UCINETDataSource requires data, file, or url');
  }
}
```

**Storybook Story** required

---

#### Sub-Phase 8b: Excel/XLSX (1 day)

**Library**: `xlsx` (SheetJS)

```bash
npm install xlsx
```

**src/data/ExcelDataSource.ts**:
```typescript
import { DataSource, DataSourceChunk } from './DataSource.js';
import * as XLSX from 'xlsx';
import { AdHocData } from '../config.js';

export interface ExcelDataSourceConfig {
  file?: File;
  url?: string;
  nodeSheet?: string; // Sheet name for nodes
  edgeSheet?: string; // Sheet name for edges
  sourceColumn?: string;
  targetColumn?: string;
}

export class ExcelDataSource extends DataSource {
  static readonly type = 'excel';

  private config: ExcelDataSourceConfig;

  async *sourceFetchData(): AsyncGenerator<DataSourceChunk, void, unknown> {
    const content = await this.getContent();
    const workbook = XLSX.read(content, { type: 'array' });

    // Try to find node and edge sheets
    const nodeSheetName = this.config.nodeSheet ||
      workbook.SheetNames.find(n => /node|vertex|vertices/i.test(n)) ||
      'Nodes';

    const edgeSheetName = this.config.edgeSheet ||
      workbook.SheetNames.find(n => /edge|link|relationship/i.test(n)) ||
      'Edges';

    let nodes: AdHocData[] = [];
    let edges: AdHocData[] = [];

    // Parse nodes sheet if exists
    if (workbook.Sheets[nodeSheetName]) {
      const nodeData = XLSX.utils.sheet_to_json(workbook.Sheets[nodeSheetName]);
      nodes = nodeData.map((row: any) => ({
        id: row.id || row.Id || row.ID || row.Vertex,
        ...row
      }));
    }

    // Parse edges sheet if exists
    if (workbook.Sheets[edgeSheetName]) {
      const edgeData = XLSX.utils.sheet_to_json(workbook.Sheets[edgeSheetName]);
      edges = edgeData.map((row: any) => ({
        src: row[this.config.sourceColumn || 'source'] ||
             row.Source || row.src || row['Vertex 1'],
        dst: row[this.config.targetColumn || 'target'] ||
             row.Target || row.dst || row['Vertex 2'],
        ...row
      }));
    }

    // If only one sheet, assume it's edges
    if (workbook.SheetNames.length === 1 && nodes.length === 0) {
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
      edges = data.map((row: any) => ({
        src: row.source || row.Source || row.src,
        dst: row.target || row.Target || row.dst,
        ...row
      }));
    }

    yield { nodes, edges };
  }

  private async getContent(): Promise<ArrayBuffer> {
    if (this.config.file) {
      return await this.config.file.arrayBuffer();
    }

    if (this.config.url) {
      const response = await fetch(this.config.url);
      return await response.arrayBuffer();
    }

    throw new Error('ExcelDataSource requires file or url');
  }
}
```

**Storybook Story** required

---

#### Sub-Phase 8c: GraphSON (1 day)

**Library**: None (JSON-based)

**src/data/GraphSONDataSource.ts**:
```typescript
import { DataSource, DataSourceChunk } from './DataSource.js';
import { AdHocData } from '../config.js';

type GraphSONVersion = '1.0' | '2.0' | '3.0';

export interface GraphSONDataSourceConfig {
  data?: string;
  file?: File;
  url?: string;
  version?: GraphSONVersion;
}

export class GraphSONDataSource extends DataSource {
  static readonly type = 'graphson';

  private config: GraphSONDataSourceConfig;

  async *sourceFetchData(): AsyncGenerator<DataSourceChunk, void, unknown> {
    const content = await this.getContent();
    const data = JSON.parse(content);

    // Detect version
    const version = this.detectVersion(data);

    let nodes: AdHocData[] = [];
    let edges: AdHocData[] = [];

    switch (version) {
      case '3.0':
        ({ nodes, edges } = this.parseV3(data));
        break;
      case '2.0':
        ({ nodes, edges } = this.parseV2(data));
        break;
      case '1.0':
        ({ nodes, edges } = this.parseV1(data));
        break;
    }

    yield { nodes, edges };
  }

  private detectVersion(data: any): GraphSONVersion {
    if (this.config.version) return this.config.version;

    // v3.0 uses @type and @value extensively
    if (data['@type'] === 'g:Graph') return '3.0';

    // v2.0 has vertices with @type
    if (data.vertices && data.vertices[0] && data.vertices[0]['@type']) {
      return '2.0';
    }

    // v1.0 is simpler
    return '1.0';
  }

  private parseV3(data: any): { nodes: AdHocData[]; edges: AdHocData[] } {
    const graph = data['@value'] || data;
    const vertices = graph.vertices || [];
    const edges = graph.edges || [];

    const nodes = vertices.map((v: any) => {
      const value = v['@value'] || v;
      return {
        id: value.id['@value'],
        label: value.label,
        ...this.extractProperties(value.properties, '3.0')
      };
    });

    const edgeData = edges.map((e: any) => {
      const value = e['@value'] || e;
      return {
        src: value.outV['@value'],
        dst: value.inV['@value'],
        label: value.label,
        ...this.extractProperties(value.properties, '3.0')
      };
    });

    return { nodes, edges: edgeData };
  }

  private parseV2(data: any): { nodes: AdHocData[]; edges: AdHocData[] } {
    // Similar to v3 but slightly different structure
    const vertices = data.vertices || [];
    const edges = data.edges || [];

    const nodes = vertices.map((v: any) => ({
      id: v.id,
      label: v.label,
      ...this.extractProperties(v.properties, '2.0')
    }));

    const edgeData = edges.map((e: any) => ({
      src: e.outV,
      dst: e.inV,
      label: e.label,
      ...this.extractProperties(e.properties, '2.0')
    }));

    return { nodes, edges: edgeData };
  }

  private parseV1(data: any): { nodes: AdHocData[]; edges: AdHocData[] } {
    const vertices = data.vertices || [];
    const edges = data.edges || [];

    const nodes = vertices.map((v: any) => ({
      id: v.id,
      label: v.label,
      type: v.type,
      ...v.properties
    }));

    const edgeData = edges.map((e: any) => ({
      src: e.outV,
      dst: e.inV,
      label: e.label,
      type: e.type,
      ...e.properties
    }));

    return { nodes, edges: edgeData };
  }

  private extractProperties(props: any, version: GraphSONVersion): any {
    if (!props) return {};

    if (version === '3.0') {
      // v3 properties are complex with @type/@value
      const result: any = {};
      for (const [key, valueArray] of Object.entries(props)) {
        if (Array.isArray(valueArray) && valueArray[0]) {
          const prop = valueArray[0]['@value'] || valueArray[0];
          result[key] = prop.value?.['@value'] || prop.value || prop;
        }
      }
      return result;
    }

    // v2 and v1 are simpler
    const result: any = {};
    for (const [key, valueArray] of Object.entries(props)) {
      if (Array.isArray(valueArray) && valueArray[0]) {
        result[key] = valueArray[0].value;
      }
    }
    return result;
  }

  private async getContent(): Promise<string> {
    if (this.config.data) return this.config.data;
    if (this.config.file) return await this.config.file.text();
    if (this.config.url) {
      const response = await fetch(this.config.url);
      return await response.text();
    }
    throw new Error('GraphSONDataSource requires data, file, or url');
  }
}
```

**Storybook Story** required

---

#### Sub-Phase 8d: XGMML (Cytoscape) (0.5 days)

**Library**: `fast-xml-parser` (already installed)

**src/data/XGMMLDataSource.ts**:
```typescript
import { DataSource, DataSourceChunk } from './DataSource.js';
import { XMLParser } from 'fast-xml-parser';
import { AdHocData } from '../config.js';

export interface XGMMLDataSourceConfig {
  data?: string;
  file?: File;
  url?: string;
}

export class XGMMLDataSource extends DataSource {
  static readonly type = 'xgmml';

  private config: XGMMLDataSourceConfig;

  async *sourceFetchData(): AsyncGenerator<DataSourceChunk, void, unknown> {
    const xmlContent = await this.getContent();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_'
    });

    const parsed = parser.parse(xmlContent);
    const graph = parsed.graph;

    if (!graph) {
      throw new Error('Invalid XGMML: missing <graph> element');
    }

    const nodes = this.parseNodes(graph.node);
    const edges = this.parseEdges(graph.edge);

    yield { nodes, edges };
  }

  private parseNodes(nodeData: any): AdHocData[] {
    if (!nodeData) return [];

    const nodeArray = Array.isArray(nodeData) ? nodeData : [nodeData];

    return nodeArray.map(node => {
      const id = node['@_id'];
      const label = node['@_label'];

      // Parse attributes
      const attributes: any = { id, label };

      if (node.att) {
        const attArray = Array.isArray(node.att) ? node.att : [node.att];
        for (const att of attArray) {
          const name = att['@_name'];
          const value = att['@_value'];
          attributes[name] = value;
        }
      }

      // Parse graphics
      if (node.graphics) {
        attributes.graphics = {
          type: node.graphics['@_type'],
          fill: node.graphics['@_fill'],
          w: parseFloat(node.graphics['@_w']),
          h: parseFloat(node.graphics['@_h']),
          x: parseFloat(node.graphics['@_x']),
          y: parseFloat(node.graphics['@_y'])
        };
      }

      return attributes;
    });
  }

  private parseEdges(edgeData: any): AdHocData[] {
    if (!edgeData) return [];

    const edgeArray = Array.isArray(edgeData) ? edgeData : [edgeData];

    return edgeArray.map(edge => {
      const src = edge['@_source'];
      const dst = edge['@_target'];
      const label = edge['@_label'];

      const attributes: AdHocData = { src, dst, label };

      if (edge.att) {
        const attArray = Array.isArray(edge.att) ? edge.att : [edge.att];
        for (const att of attArray) {
          const name = att['@_name'];
          const value = att['@_value'];
          attributes[name] = value;
        }
      }

      return attributes;
    });
  }

  private async getContent(): Promise<string> {
    if (this.config.data) return this.config.data;
    if (this.config.file) return await this.config.file.text();
    if (this.config.url) {
      const response = await fetch(this.config.url);
      return await response.text();
    }
    throw new Error('XGMMLDataSource requires data, file, or url');
  }
}
```

**Storybook Story** required

---

#### Sub-Phase 8e: SIF (Simple Interaction Format) (0.5 days)

**Library**: None (tab-delimited text)

**src/data/SIFDataSource.ts**:
```typescript
import { DataSource, DataSourceChunk } from './DataSource.js';
import { AdHocData } from '../config.js';

export interface SIFDataSourceConfig {
  data?: string;
  file?: File;
  url?: string;
}

export class SIFDataSource extends DataSource {
  static readonly type = 'sif';

  private config: SIFDataSourceConfig;

  async *sourceFetchData(): AsyncGenerator<DataSourceChunk, void, unknown> {
    const content = await this.getContent();
    const lines = content.split('\n').map(l => l.trim()).filter(Boolean);

    const edges: AdHocData[] = [];

    for (const line of lines) {
      const parts = line.split(/\s+/);
      if (parts.length < 3) continue;

      const nodeA = parts[0];
      const interactionType = parts[1];

      // Can have multiple targets: nodeA type nodeB nodeC nodeD
      for (let i = 2; i < parts.length; i++) {
        edges.push({
          src: nodeA,
          dst: parts[i],
          interaction: interactionType
        });
      }
    }

    yield { nodes: [], edges };
  }

  private async getContent(): Promise<string> {
    if (this.config.data) return this.config.data;
    if (this.config.file) return await this.config.file.text();
    if (this.config.url) {
      const response = await fetch(this.config.url);
      return await response.text();
    }
    throw new Error('SIFDataSource requires data, file, or url');
  }
}
```

**Storybook Story** required

---

### Phase 9: Tier 4 Specialized Formats
**Objective**: Implement BioPAX, RDF/Turtle, SBML for domain-specific use cases
**Duration**: 3-4 days
**Deliverables**: 3 new DataSource classes, tests, Storybook stories

#### Sub-Phase 9a: RDF/Turtle (2 days)

**Library**: `n3` - N3.js RDF library

```bash
npm install n3
npm install --save-dev @types/n3
```

**src/data/RDFDataSource.ts**:
```typescript
import { DataSource, DataSourceChunk } from './DataSource.js';
import { Parser, Store, DataFactory } from 'n3';
import { AdHocData } from '../config.js';

const { namedNode } = DataFactory;

export interface RDFDataSourceConfig {
  data?: string;
  file?: File;
  url?: string;
  format?: 'turtle' | 'n-triples' | 'n-quads' | 'trig';
  relationPredicate?: string; // URI of predicate to use for edges
}

export class RDFDataSource extends DataSource {
  static readonly type = 'rdf';

  private config: RDFDataSourceConfig;

  async *sourceFetchData(): AsyncGenerator<DataSourceChunk, void, unknown> {
    const content = await this.getContent();
    const format = this.config.format || this.detectFormat(content);

    const parser = new Parser({ format });
    const store = new Store();

    return new Promise((resolve, reject) => {
      parser.parse(content, (error, quad, prefixes) => {
        if (error) {
          reject(error);
          return;
        }

        if (quad) {
          store.addQuad(quad);
        } else {
          // Parsing complete
          const { nodes, edges } = this.extractGraph(store);
          resolve((async function*() {
            yield { nodes, edges };
          })());
        }
      });
    });
  }

  private extractGraph(store: Store): { nodes: AdHocData[]; edges: AdHocData[] } {
    const nodeSet = new Set<string>();
    const edges: AdHocData[] = [];

    // Get all subjects and objects as potential nodes
    for (const quad of store) {
      if (quad.subject.termType === 'NamedNode') {
        nodeSet.add(quad.subject.value);
      }
      if (quad.object.termType === 'NamedNode') {
        nodeSet.add(quad.object.value);
      }

      // If predicate matches relation predicate, create edge
      if (!this.config.relationPredicate ||
          quad.predicate.value === this.config.relationPredicate) {
        if (quad.subject.termType === 'NamedNode' &&
            quad.object.termType === 'NamedNode') {
          edges.push({
            src: quad.subject.value,
            dst: quad.object.value,
            predicate: quad.predicate.value
          });
        }
      }
    }

    const nodes = Array.from(nodeSet).map(uri => ({
      id: uri,
      uri
    }));

    return { nodes, edges };
  }

  private detectFormat(content: string): 'turtle' | 'n-triples' | 'n-quads' {
    if (content.includes('@prefix')) return 'turtle';
    if (content.includes('<http') && content.includes('> .')) return 'n-triples';
    return 'turtle';
  }

  private async getContent(): Promise<string> {
    if (this.config.data) return this.config.data;
    if (this.config.file) return await this.config.file.text();
    if (this.config.url) {
      const response = await fetch(this.config.url);
      return await response.text();
    }
    throw new Error('RDFDataSource requires data, file, or url');
  }
}
```

**Storybook Story** required

---

#### Sub-Phase 9b: BioPAX (1 day)

**Library**: `fast-xml-parser` (already installed) + custom RDF/OWL parsing

**src/data/BioPAXDataSource.ts**:
```typescript
import { DataSource, DataSourceChunk } from './DataSource.js';
import { XMLParser } from 'fast-xml-parser';
import { AdHocData } from '../config.js';

export interface BioPAXDataSourceConfig {
  data?: string;
  file?: File;
  url?: string;
}

export class BioPAXDataSource extends DataSource {
  static readonly type = 'biopax';

  private config: BioPAXDataSourceConfig;

  async *sourceFetchData(): AsyncGenerator<DataSourceChunk, void, unknown> {
    const xmlContent = await this.getContent();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      removeNSPrefix: true // Remove namespace prefixes
    });

    const parsed = parser.parse(xmlContent);
    const rdf = parsed.RDF;

    if (!rdf) {
      throw new Error('Invalid BioPAX: missing RDF root');
    }

    const nodes: AdHocData[] = [];
    const edges: AdHocData[] = [];

    // BioPAX uses complex RDF structure
    // Extract proteins, molecules, complexes as nodes
    for (const [key, value] of Object.entries(rdf)) {
      if (key === 'Protein' || key === 'SmallMolecule' || key === 'Complex') {
        const entities = Array.isArray(value) ? value : [value];
        for (const entity of entities) {
          nodes.push({
            id: entity['@_rdf:ID'] || entity['@_rdf:about'],
            type: key,
            name: entity.displayName || entity.standardName,
            ...entity
          });
        }
      }

      // Extract interactions as edges
      if (key === 'MolecularInteraction' || key === 'BiochemicalReaction') {
        const interactions = Array.isArray(value) ? value : [value];
        for (const interaction of interactions) {
          const participants = interaction.participant;
          if (Array.isArray(participants) && participants.length >= 2) {
            edges.push({
              src: participants[0]['@_rdf:resource'],
              dst: participants[1]['@_rdf:resource'],
              type: key,
              ...interaction
            });
          }
        }
      }
    }

    yield { nodes, edges };
  }

  private async getContent(): Promise<string> {
    if (this.config.data) return this.config.data;
    if (this.config.file) return await this.config.file.text();
    if (this.config.url) {
      const response = await fetch(this.config.url);
      return await response.text();
    }
    throw new Error('BioPAXDataSource requires data, file, or url');
  }
}
```

**Storybook Story** required

---

#### Sub-Phase 9c: SBML (1 day)

**Library**: `fast-xml-parser` (already installed)

**src/data/SBMLDataSource.ts**:
```typescript
import { DataSource, DataSourceChunk } from './DataSource.js';
import { XMLParser } from 'fast-xml-parser';
import { AdHocData } from '../config.js';

export interface SBMLDataSourceConfig {
  data?: string;
  file?: File;
  url?: string;
}

export class SBMLDataSource extends DataSource {
  static readonly type = 'sbml';

  private config: SBMLDataSourceConfig;

  async *sourceFetchData(): AsyncGenerator<DataSourceChunk, void, unknown> {
    const xmlContent = await this.getContent();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_'
    });

    const parsed = parser.parse(xmlContent);
    const sbml = parsed.sbml;

    if (!sbml || !sbml.model) {
      throw new Error('Invalid SBML: missing model element');
    }

    const model = sbml.model;
    const nodes: AdHocData[] = [];
    const edges: AdHocData[] = [];

    // Extract species as nodes
    if (model.listOfSpecies && model.listOfSpecies.species) {
      const species = Array.isArray(model.listOfSpecies.species)
        ? model.listOfSpecies.species
        : [model.listOfSpecies.species];

      for (const spec of species) {
        nodes.push({
          id: spec['@_id'],
          name: spec['@_name'],
          type: 'species',
          compartment: spec['@_compartment'],
          initialConcentration: spec['@_initialConcentration']
        });
      }
    }

    // Extract reactions as edges
    if (model.listOfReactions && model.listOfReactions.reaction) {
      const reactions = Array.isArray(model.listOfReactions.reaction)
        ? model.listOfReactions.reaction
        : [model.listOfReactions.reaction];

      for (const reaction of reactions) {
        // Get reactants (sources)
        const reactants = reaction.listOfReactants?.speciesReference || [];
        const products = reaction.listOfProducts?.speciesReference || [];

        const reactantArray = Array.isArray(reactants) ? reactants : [reactants];
        const productArray = Array.isArray(products) ? products : [products];

        // Create edges from each reactant to each product
        for (const reactant of reactantArray) {
          for (const product of productArray) {
            edges.push({
              src: reactant['@_species'],
              dst: product['@_species'],
              reaction: reaction['@_id'],
              reversible: reaction['@_reversible'] === 'true'
            });
          }
        }
      }
    }

    yield { nodes, edges };
  }

  private async getContent(): Promise<string> {
    if (this.config.data) return this.config.data;
    if (this.config.file) return await this.config.file.text();
    if (this.config.url) {
      const response = await fetch(this.config.url);
      return await response.text();
    }
    throw new Error('SBMLDataSource requires data, file, or url');
  }
}
```

**Storybook Story** required

---

## Future Enhancements (Phase 10+)

### 1. Style Extraction
Extract visual properties from formats:
- GraphML yFiles extensions (positions, colors, shapes)
- GEXF viz namespace (positions, colors, sizes)
- Put in node.metadata for user to reference in style layers

### 2. True Streaming for Very Large Files
Use streaming parsers for 100MB+ files:
- SAX XML parser for GraphML/GEXF
- `@streamparser/json` for large JSON files
- Never load full file in memory

### 3. Format Conversion
Convert between formats:
```typescript
await graph.loadFromFile(graphmlFile);
const json = await graph.exportToFormat('json');
```

### 4. Compressed File Support
Handle .gz, .zip automatically:
```typescript
await graph.loadFromFile(graphmlGzFile); // auto-decompress
```

### 5. Additional Low-Priority Formats
- Matrix Market (sparse matrices)
- GDF (GUESS format)
- VNA (NetDraw)
- CX/CX2 (Cytoscape Exchange)
- TGF (Trivial Graph Format)

---

## Timeline Summary

| Phase | Duration | Deliverable | Status |
|-------|----------|-------------|--------|
| 1: Infrastructure | 1-2 days | Format detection, loadFromFile, events | ✅ **COMPLETE** |
| 2: GraphML | 2 days | GraphML DataSource with attributes + Storybook story | ✅ **COMPLETE** |
| 3: CSV | 1-2 days | CSV edge lists and node lists + Storybook story | ✅ **COMPLETE** |
| 4: GML, GEXF, DOT | 2-3 days | GML, GEXF, DOT parsers + Storybook stories for each | ✅ **COMPLETE** |
| **5: CSV Variants** | **2-3 days** | **Enhanced CSV with Neo4j, Gephi, Cytoscape, adjacency list variants + variant detection + Storybook stories** | 🔲 **NEW** |
| **6: JSON Variants** | **2-3 days** | **Enhanced JSON with Cytoscape.js, Sigma.js, Vis.js, NetworkX, G6, JGF, 3d-force variants + auto-detection + Storybook stories** | 🔲 **NEW** |
| **7: Pajek NET** | **1-2 days** | **Complete Pajek NET parser + tests + Storybook story** | 🔲 **NEW** |
| **8: Tier 3 Formats** | **4-5 days** | **UCINET DL, Excel/XLSX, GraphSON, XGMML, SIF parsers + tests + Storybook stories for each** | 🔲 **NEW** |
| **9: Tier 4 Specialized** | **3-4 days** | **RDF/Turtle, BioPAX, SBML parsers + tests + Storybook stories for each** | 🔲 **NEW** |

**Completed (Phases 1-4): 6-8 days** ✅
**New Work (Phases 5-9): 12-17 days** 🔲

**Total Implementation Time: 18-25 days**

Plus:
- Testing & Polish: +3 days
- Documentation: +2 days

**Grand Total: 23-30 days** (approximately 4.5-6 weeks)

---

## Success Criteria

### Functional
- ✅ Load GraphML, CSV, JSON, GML, GEXF files via loadFromFile()
- ✅ Auto-detect format from extension and content
- ✅ Handle parsing errors gracefully (collect up to 100, continue)
- ✅ Stream large files in chunks (1000 items)
- ✅ Emit progress events during loading
- ✅ Preserve all node/edge attributes

### Performance
- ✅ Parse 10,000 nodes in < 2 seconds
- ✅ Handle files up to 50MB without issues
- ✅ Progress events at reasonable intervals

### Code Quality
- ✅ Tests for each DataSource
- ✅ Integration tests with real files
- ✅ No ESLint/TypeScript errors
- ✅ Documented APIs

### User Experience
- ✅ Simple file upload: `await graph.loadFromFile(file)`
- ✅ No format selection needed (auto-detect)
- ✅ Meaningful error messages
- ✅ Progress indication during load

---

## Breaking Changes Summary

### Approved Breaking Changes

**In Graph class**:
- ✅ Add `loadFromFile(file, options?)` method (new, non-breaking)

**In events.ts**:
- ✅ Add event types: `DataLoadingProgressEvent`, `DataLoadingErrorEvent`, `DataLoadingCompleteEvent` (new, non-breaking)

**In EventManager**:
- ✅ Add methods: `emitDataLoadingProgress()`, `emitDataLoadingError()`, `emitDataLoadingComplete()` (new, non-breaking)

**In DataManager**:
- ✅ Modify `addDataFromSource()` to emit new progress/error events (enhancement, backward compatible - old events still emitted)

### Backward Compatibility Maintained

- ✅ Existing `addDataFromSource()` API still works
- ✅ Existing `data-loaded` and `error` events still emitted
- ✅ JsonDataSource unchanged
- ✅ All existing code continues to work

---

## Risk Mitigation

### Risk: Large File Memory Usage
**Mitigation**:
- Load full file but yield in chunks
- Monitor memory in tests
- Document file size recommendations
- Add true streaming in Phase 5 if needed

### Risk: Format Detection Accuracy
**Mitigation**:
- Test with diverse sample files
- Support explicit format override
- Clear error messages when detection fails
- Document supported formats

### Risk: Parsing Error Handling
**Mitigation**:
- Collect errors up to limit (100 default)
- Continue loading valid data
- Emit error events for user notification
- Provide error summary at completion

---

## Definition of Done (Each Phase)

- ✅ All tests passing
- ✅ No ESLint/TypeScript errors
- ✅ Real-world file tested
- ✅ Events emitted correctly
- ✅ Documentation updated
- ✅ **Storybook story created and verified working** (required for Phases 2-4, each data format must have a story in Data.stories.ts)

---

## Next Steps

1. **Review and approve this revised plan**
2. **Phase 1**: Begin with infrastructure
   - Format detection utility
   - loadFromFile() method
   - Event system extensions
3. **Phase 2**: GraphML DataSource
4. **Phase 3**: CSV DataSource
5. **Phase 4**: Additional formats
6. **Polish**: Testing, docs, examples

**Ready to begin Phase 1 implementation when you give the go-ahead!**
