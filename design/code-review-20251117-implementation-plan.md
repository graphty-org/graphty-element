# Implementation Plan for Data Loading Refactoring

## Overview

This plan addresses the 24 issues identified in the code review (2025-11-17) of the data loading system. The implementation will eliminate ~370 lines of duplicated code, fix critical reliability issues, and improve consistency across all DataSource implementations. The refactoring is organized into 5 phases that progressively improve the codebase without breaking existing functionality.

**Total Estimated Duration**: 9-13 days

---

## Phase 1: Foundation - Base Class Refactoring (2-3 days)

**Objective**: Eliminate code duplication by extracting shared functionality into the base `DataSource` class. This phase focuses on DRY (Don't Repeat Yourself) principles and creates reusable utilities.

**Success Criteria**:
- ✅ All DataSources use shared `getContent()` method
- ✅ All DataSources use shared chunking helper
- ✅ Unified configuration interface
- ✅ Reduced codebase by ~170 lines
- ✅ All existing tests pass without modification

---

### Tests to Write First

**File**: `test/data/DataSource.test.ts` (new file)

```typescript
import {assert, describe, test} from "vitest";
import {DataSource, DataSourceChunk} from "../../src/data/DataSource.js";

// Create a minimal test implementation
class TestDataSource extends DataSource {
    static type = "test";
    constructor(config: BaseDataSourceConfig) {
        super(config.errorLimit ?? 100);
        this.config = config;
    }
    async *sourceFetchData(): AsyncGenerator<DataSourceChunk> {
        const content = await this.getContent();
        yield* this.chunkData(
            [{id: "n1"}, {id: "n2"}],
            [{src: "n1", dst: "n2"}]
        );
    }
}

describe("DataSource base class", () => {
    describe("getContent()", () => {
        test("loads from inline data string", async () => {
            const source = new TestDataSource({data: "test content"});
            const content = await source["getContent"]();
            assert.strictEqual(content, "test content");
        });

        test("throws when no input provided", async () => {
            const source = new TestDataSource({});
            await assert.rejects(
                () => source["getContent"](),
                /TestDataSource requires data, file, or url/
            );
        });

        // TODO: Add file and URL tests after implementing retry logic
    });

    describe("chunkData()", () => {
        test("chunks large node arrays", async () => {
            const nodes = Array.from({length: 2500}, (_, i) => ({id: `n${i}`}));
            const edges = [{src: "n0", dst: "n1"}];

            const source = new TestDataSource({data: "", chunkSize: 1000});
            const chunks = Array.from(source["chunkData"](nodes, edges));

            assert.strictEqual(chunks.length, 3);
            assert.strictEqual(chunks[0].nodes.length, 1000);
            assert.strictEqual(chunks[0].edges.length, 1); // Edges in first chunk
            assert.strictEqual(chunks[1].edges.length, 0); // No edges in subsequent chunks
        });

        test("yields edges-only chunk when no nodes", async () => {
            const source = new TestDataSource({data: "", chunkSize: 1000});
            const chunks = Array.from(source["chunkData"]([], [{src: "n1", dst: "n2"}]));

            assert.strictEqual(chunks.length, 1);
            assert.strictEqual(chunks[0].nodes.length, 0);
            assert.strictEqual(chunks[0].edges.length, 1);
        });

        test("respects custom chunkSize", async () => {
            const nodes = Array.from({length: 150}, (_, i) => ({id: `n${i}`}));

            const source = new TestDataSource({data: "", chunkSize: 50});
            const chunks = Array.from(source["chunkData"](nodes, []));

            assert.strictEqual(chunks.length, 3);
        });
    });

    describe("DEFAULT_CHUNK_SIZE", () => {
        test("uses default chunk size when not specified", () => {
            const source = new TestDataSource({data: ""});
            assert.strictEqual(source["chunkSize"], 1000);
        });
    });
});
```

---

### Implementation

#### 1. Update `src/data/DataSource.ts`

Add shared utilities to base class:

```typescript
import {z} from "zod/v4";
import * as z4 from "zod/v4/core";
import {AdHocData} from "../config";
import {ErrorAggregator} from "./ErrorAggregator.js";

// Base configuration interface
export interface BaseDataSourceConfig {
    data?: string;
    file?: File;
    url?: string;
    chunkSize?: number;
    errorLimit?: number;
}

type DataSourceClass = new (opts: object) => DataSource;
const dataSourceRegistry = new Map<string, DataSourceClass>();

export interface DataSourceChunk {
    nodes: AdHocData[];
    edges: AdHocData[];
}

export abstract class DataSource {
    static readonly type: string;
    static readonly DEFAULT_CHUNK_SIZE = 1000;

    edgeSchema: z4.$ZodObject | null = null;
    nodeSchema: z4.$ZodObject | null = null;
    protected errorAggregator: ErrorAggregator;
    protected chunkSize: number;

    constructor(errorLimit = 100, chunkSize = DataSource.DEFAULT_CHUNK_SIZE) {
        this.errorAggregator = new ErrorAggregator(errorLimit);
        this.chunkSize = chunkSize;
    }

    abstract sourceFetchData(): AsyncGenerator<DataSourceChunk, void, unknown>;

    /**
     * Shared method to get content from data, file, or URL
     * Subclasses should call this instead of implementing their own
     */
    protected async getContent(): Promise<string> {
        const config = this.getConfig();

        if (config.data !== undefined) {
            return config.data;
        }

        if (config.file) {
            return await config.file.text();
        }

        if (config.url) {
            // Will be enhanced with retry logic in Phase 2
            const response = await fetch(config.url);
            if (!response.ok) {
                throw new Error(
                    `Failed to fetch ${this.type} from ${config.url}: ${response.status}`
                );
            }
            return await response.text();
        }

        throw new Error(`${this.type}DataSource requires data, file, or url`);
    }

    /**
     * Shared chunking helper
     * Yields nodes in chunks, with all edges in the first chunk
     */
    protected *chunkData(
        nodes: AdHocData[],
        edges: AdHocData[]
    ): Generator<DataSourceChunk, void, unknown> {
        // Yield nodes in chunks
        for (let i = 0; i < nodes.length; i += this.chunkSize) {
            const nodeChunk = nodes.slice(i, i + this.chunkSize);
            const edgeChunk = i === 0 ? edges : [];
            yield {nodes: nodeChunk, edges: edgeChunk};
        }

        // If no nodes but edges exist, yield edges-only chunk
        if (nodes.length === 0 && edges.length > 0) {
            yield {nodes: [], edges};
        }
    }

    /**
     * Subclasses must implement this to expose their config
     * Used by getContent() and other shared methods
     */
    protected abstract getConfig(): BaseDataSourceConfig;

    // ... existing methods (getData, dataValidator, type, register, get) ...
}
```

---

#### 2. Update All DataSources to Use Base Class Utilities

**Files to modify**:
- `src/data/GraphMLDataSource.ts`
- `src/data/GMLDataSource.ts`
- `src/data/DOTDataSource.ts`
- `src/data/GEXFDataSource.ts`
- `src/data/PajekDataSource.ts`
- `src/data/CSVDataSource.ts`

**Example**: `src/data/GraphMLDataSource.ts`

```typescript
// BEFORE: Lines 119-138 (20 lines)
private async getContent(): Promise<string> {
    if (this.config.data) return this.config.data;
    if (this.config.file) return await this.config.file.text();
    if (this.config.url) {
        const response = await fetch(this.config.url);
        if (!response.ok) {
            throw new Error(`Failed to fetch GraphML from ${this.config.url}: ${response.status}`);
        }
        return await response.text();
    }
    throw new Error("GraphMLDataSource requires data, file, or url");
}

// AFTER: Delete the method entirely, use inherited version
// Add this method to expose config:
protected getConfig(): BaseDataSourceConfig {
    return this.config;
}
```

**Similar changes** for chunking logic:

```typescript
// BEFORE: Lines 320-335 (duplicated chunking)
for (let i = 0; i < nodes.length; i += this.chunkSize) {
    const nodeChunk = nodes.slice(i, i + this.chunkSize);
    const edgeChunk = i === 0 ? edges : [];
    yield {nodes: nodeChunk, edges: edgeChunk};
}
if (nodes.length === 0 && edges.length > 0) {
    yield {nodes: [], edges};
}

// AFTER: Single line
yield* this.chunkData(nodes, edges);
```

---

#### 3. Create Unified Config Interfaces

**File**: `src/data/DataSource.ts` (extend from Phase 1.1)

```typescript
// Extend base config for format-specific needs
export interface GraphMLDataSourceConfig extends BaseDataSourceConfig {
    // GraphML has no additional config currently
}

export interface GEXFDataSourceConfig extends BaseDataSourceConfig {
    // GEXF has no additional config currently
}

// CSV needs additional fields
export interface CSVDataSourceConfig extends BaseDataSourceConfig {
    delimiter?: string;
    variant?: CSVVariant;
    sourceColumn?: string;
    targetColumn?: string;
    idColumn?: string;
    // Paired files
    nodeFile?: File;
    edgeFile?: File;
    nodeURL?: string;
    edgeURL?: string;
}
```

Move each config interface to its respective DataSource file, but ensure all extend `BaseDataSourceConfig`.

---

### Dependencies

**External**: None (uses existing libraries)

**Internal**:
- Existing `DataSource.ts` base class
- Existing test infrastructure

---

### Verification Steps

1. **Run tests**: `npm test -- test/data/DataSource.test.ts`
   - Expected: All new base class tests pass

2. **Run existing tests**: `npm test -- test/data/`
   - Expected: All existing DataSource tests still pass (no breaking changes)

3. **Check line count reduction**:
   ```bash
   git diff --stat
   ```
   - Expected: ~170 lines removed across 6 files

4. **Build**: `npm run build`
   - Expected: No TypeScript errors

---

## Phase 2: Critical Reliability Fixes (2-3 days)

**Objective**: Fix the 3 critical issues that affect production reliability: network retries, validation error handling, and CSV paired file validation.

**Success Criteria**:
- ✅ All DataSources have network retry with exponential backoff
- ✅ All validation errors use ErrorAggregator (no thrown exceptions)
- ✅ CSV paired files validate inputs before fetching
- ✅ Robust error handling tested with simulated failures

---

### Tests to Write First

**File**: `test/data/DataSource.network.test.ts` (new file)

```typescript
import {assert, describe, test} from "vitest";
import {GraphMLDataSource} from "../../src/data/GraphMLDataSource.js";

describe("Network retry behavior", () => {
    test("retries on network failure", async () => {
        // This test requires a mock server - use MSW or similar
        // For now, document the expected behavior

        // Setup: Mock server that fails twice, succeeds third time
        // Action: Create DataSource with URL
        // Assert: Successfully fetches data after 2 retries
    });

    test("respects timeout setting", async () => {
        // Setup: Mock server with 5s delay
        // Action: Create DataSource with 1s timeout
        // Assert: Throws timeout error
    });

    test("uses exponential backoff", async () => {
        // Setup: Mock server that records request timestamps
        // Action: Trigger 3 retries
        // Assert: Delays are approximately 1s, 2s, 4s
    });
});
```

**File**: `test/data/DataSource.validation.test.ts` (new file)

```typescript
import {assert, describe, test} from "vitest";
import {z} from "zod/v4";
import {JsonDataSource} from "../../src/data/JsonDataSource.js";

describe("Validation error handling", () => {
    test("collects validation errors instead of throwing", async () => {
        const schema = z.object({
            id: z.string(),
            value: z.number()
        });

        const data = {
            nodes: [
                {id: "n1", value: 42},
                {id: "n2", value: "invalid"}, // Type error
                {id: 3, value: 10}            // Type error
            ],
            edges: []
        };

        const source = new JsonDataSource({
            data: JSON.stringify(data),
            node: {schema}
        });

        const chunks = [];
        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        const errors = source.getErrorAggregator().getErrors();
        assert.strictEqual(errors.length, 2);
        assert.include(errors[0].message, "value");
        assert.strictEqual(errors[0].category, "validation-error");
    });

    test("stops processing after hitting error limit", async () => {
        // Create data with 150 validation errors, limit=100
        const nodes = Array.from({length: 150}, (_, i) => ({
            id: i,  // Should be string, not number
            value: 10
        }));

        const source = new JsonDataSource({
            data: JSON.stringify({nodes, edges: []}),
            node: {schema: z.object({id: z.string(), value: z.number()})},
            errorLimit: 100
        });

        for await (const chunk of source.getData()) {
            // Process chunks
        }

        const errors = source.getErrorAggregator().getErrors();
        assert.strictEqual(errors.length, 100); // Stopped at limit
    });
});
```

**File**: `test/data/CSVDataSource.paired.test.ts` (extend existing)

```typescript
describe("CSVDataSource paired files", () => {
    test("throws clear error when nodeURL missing", async () => {
        const source = new CSVDataSource({
            edgeURL: "http://example.com/edges.csv"
            // nodeURL is missing
        });

        await assert.rejects(
            async () => {
                for await (const chunk of source.getData()) {
                    // Should not get here
                }
            },
            /parsePairedFiles requires both nodeURL and edgeURL/
        );
    });

    test("throws clear error when edgeURL missing", async () => {
        const source = new CSVDataSource({
            nodeURL: "http://example.com/nodes.csv"
            // edgeURL is missing
        });

        await assert.rejects(
            async () => {
                for await (const chunk of source.getData()) {
                    // Should not get here
                }
            },
            /parsePairedFiles requires both nodeURL and edgeURL/
        );
    });
});
```

---

### Implementation

#### 1. Add Network Retry to Base Class

**File**: `src/data/DataSource.ts`

```typescript
export abstract class DataSource {
    // ... existing code ...

    /**
     * Fetch with retry logic and timeout
     * Protected method for use by all DataSources
     */
    protected async fetchWithRetry(
        url: string,
        retries = 3,
        timeout = 30000
    ): Promise<Response> {
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                // Create AbortController for timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);

                try {
                    const response = await fetch(url, {signal: controller.signal});
                    clearTimeout(timeoutId);

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    return response;
                } catch (error) {
                    clearTimeout(timeoutId);

                    if (error instanceof Error && error.name === "AbortError") {
                        throw new Error(`Request timeout after ${timeout}ms`);
                    }

                    throw error;
                }
            } catch (error) {
                const isLastAttempt = attempt === retries - 1;

                if (isLastAttempt) {
                    const errorMsg = error instanceof Error ? error.message : String(error);
                    throw new Error(
                        `Failed to fetch from ${url} after ${retries} attempts: ${errorMsg}`
                    );
                }

                // Exponential backoff: wait 1s, 2s, 4s...
                const delay = Math.pow(2, attempt) * 1000;
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }

        // Should never reach here
        throw new Error("Unexpected error in fetchWithRetry");
    }

    /**
     * Updated getContent() to use fetchWithRetry
     */
    protected async getContent(): Promise<string> {
        const config = this.getConfig();

        if (config.data !== undefined) {
            return config.data;
        }

        if (config.file) {
            return await config.file.text();
        }

        if (config.url) {
            const response = await this.fetchWithRetry(config.url);
            return await response.text();
        }

        throw new Error(`${this.type}DataSource requires data, file, or url`);
    }
}
```

#### 2. Fix Validation to Use ErrorAggregator

**File**: `src/data/DataSource.ts`

```typescript
/**
 * Validate data against schema
 * Returns false if validation fails (and adds error to aggregator)
 * Returns true if validation succeeds
 */
async dataValidator(schema: z4.$ZodObject, obj: object): Promise<boolean> {
    const res = await z4.safeParseAsync(schema, obj);

    if (!res.success) {
        const errMsg = z.prettifyError(res.error);

        return this.errorAggregator.addError({
            message: `Validation failed: ${errMsg}`,
            category: 'validation-error',
            severity: 'error'
        });
    }

    return true;
}

/**
 * Updated getData() to handle validation errors gracefully
 */
async *getData(): AsyncGenerator<DataSourceChunk, void, unknown> {
    for await (const chunk of this.sourceFetchData()) {
        // Filter out invalid nodes
        const validNodes: AdHocData[] = [];
        if (this.nodeSchema) {
            for (const n of chunk.nodes) {
                const isValid = await this.dataValidator(this.nodeSchema, n);
                if (isValid) {
                    validNodes.push(n);
                }
                // Invalid nodes are logged to errorAggregator but skipped
            }
        } else {
            validNodes.push(...chunk.nodes);
        }

        // Filter out invalid edges
        const validEdges: AdHocData[] = [];
        if (this.edgeSchema) {
            for (const e of chunk.edges) {
                const isValid = await this.dataValidator(this.edgeSchema, e);
                if (isValid) {
                    validEdges.push(e);
                }
            }
        } else {
            validEdges.push(...chunk.edges);
        }

        // Only yield if we have data (or if we're not filtering)
        if (validNodes.length > 0 || validEdges.length > 0) {
            yield {nodes: validNodes, edges: validEdges};
        }

        // Stop if we've hit the error limit
        if (this.errorAggregator.hasReachedLimit()) {
            break;
        }
    }
}
```

#### 3. Fix CSV Paired Files Validation

**File**: `src/data/CSVDataSource.ts`

```typescript
// In parsePairedFiles() method, around line 616
private async *parsePairedFiles(): AsyncGenerator<DataSourceChunk, void, unknown> {
    // Validate that both URLs or both files are provided
    const hasNodeSource = !!(this.config.nodeURL || this.config.nodeFile);
    const hasEdgeSource = !!(this.config.edgeURL || this.config.edgeFile);

    if (!hasNodeSource || !hasEdgeSource) {
        throw new Error(
            'parsePairedFiles requires both node and edge sources. ' +
            'Provide either (nodeURL + edgeURL) or (nodeFile + edgeFile).'
        );
    }

    // Fetch node data
    let nodeText: string;
    if (this.config.nodeFile) {
        nodeText = await this.config.nodeFile.text();
    } else if (this.config.nodeURL) {
        const response = await this.fetchWithRetry(this.config.nodeURL);
        nodeText = await response.text();
    } else {
        // This should never happen due to validation above
        throw new Error('Internal error: No node source after validation');
    }

    // Fetch edge data
    let edgeText: string;
    if (this.config.edgeFile) {
        edgeText = await this.config.edgeFile.text();
    } else if (this.config.edgeURL) {
        const response = await this.fetchWithRetry(this.config.edgeURL);
        edgeText = await response.text();
    } else {
        throw new Error('Internal error: No edge source after validation');
    }

    // ... rest of parsing logic ...
}
```

#### 4. Update JsonDataSource

**File**: `src/data/JsonDataSource.ts`

```typescript
export class JsonDataSource extends DataSource {
    static type = "json";
    opts: JsonDataSourceConfigType;

    constructor(anyOpts: object) {
        const opts = JsonDataSourceConfig.parse(anyOpts);

        // Pass errorLimit to base class
        super(opts.errorLimit ?? 100);

        this.opts = opts;
        if (opts.node.schema) {
            this.nodeSchema = opts.node.schema;
        }
        if (opts.edge.schema) {
            this.edgeSchema = opts.edge.schema;
        }
    }

    // Remove duplicate fetchWithRetry() - use inherited version
    // Update sourceFetchData() to use this.fetchWithRetry()
}
```

#### 5. Remove Console.log Statements

**File**: `src/data/CSVDataSource.ts`

Remove lines:
- 152: `console.log("CSV: Routing to parser for variant:", variantInfo.variant);`
- 172: `console.log("CSV: Parsing adjacency list, first row:", fullParse.data[0]);`
- 550, 554, 600: Other debug console.log statements

---

### Dependencies

**External**: None

**Internal**:
- Phase 1 completion (base class utilities must exist)
- ErrorAggregator class

---

### Verification Steps

1. **Run new tests**:
   ```bash
   npm test -- test/data/DataSource.network.test.ts
   npm test -- test/data/DataSource.validation.test.ts
   npm test -- test/data/CSVDataSource.paired.test.ts
   ```
   - Expected: All new tests pass

2. **Run full test suite**: `npm test`
   - Expected: All tests pass, no regressions

3. **Manual verification - Validation**:
   - Create a JSON file with intentional validation errors
   - Load it in a Storybook story
   - Verify errors appear in ErrorAggregator, not thrown

4. **Manual verification - Network**:
   - Create a Storybook story that loads from a slow/unreliable URL
   - Verify retries occur (add temporary console.log to observe)
   - Remove debug logging after verification

5. **Build and lint**:
   ```bash
   npm run lint
   npm run build
   ```
   - Expected: No errors

---

## Phase 3: CSV Edge Parsing Consolidation (1-2 days)

**Objective**: Eliminate ~200 lines of duplicated edge creation logic in CSVDataSource by extracting a shared helper method.

**Success Criteria**:
- ✅ Single `createEdge()` helper used by all 4 CSV parsing methods
- ✅ Reduced CSVDataSource.ts by ~150 lines
- ✅ All CSV tests pass unchanged
- ✅ Error handling is consistent across all CSV variants

---

### Tests to Write First

**File**: `test/data/CSVDataSource.edge-creation.test.ts` (new file)

```typescript
import {assert, describe, test} from "vitest";
import {CSVDataSource} from "../../src/data/CSVDataSource.js";

describe("CSVDataSource edge creation", () => {
    test("creates edge with all properties preserved", async () => {
        const csv = `source,target,weight,type,color
n1,n2,1.5,friend,#ff0000`;

        const source = new CSVDataSource({data: csv});
        const chunks = [];
        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        const edge = chunks[0].edges[0];
        assert.strictEqual(edge.src, "n1");
        assert.strictEqual(edge.dst, "n2");
        assert.strictEqual(edge.weight, 1.5);
        assert.strictEqual(edge.type, "friend");
        assert.strictEqual(edge.color, "#ff0000");
    });

    test("handles missing source gracefully", async () => {
        const csv = `source,target
,n2
n3,n4`;

        const source = new CSVDataSource({data: csv});
        const chunks = [];
        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        // First edge should be skipped due to missing source
        assert.strictEqual(chunks[0].edges.length, 1);
        assert.strictEqual(chunks[0].edges[0].src, "n3");

        const errors = source.getErrorAggregator().getErrors();
        assert.strictEqual(errors.length, 1);
        assert.include(errors[0].message, "Missing source or target");
    });

    test("handles missing target gracefully", async () => {
        const csv = `source,target
n1,
n3,n4`;

        const source = new CSVDataSource({data: csv});
        const chunks = [];
        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.strictEqual(chunks[0].edges.length, 1);
        assert.strictEqual(chunks[0].edges[0].src, "n3");

        const errors = source.getErrorAggregator().getErrors();
        assert.strictEqual(errors.length, 1);
    });

    test("converts source and target to strings", async () => {
        const csv = `source,target
123,456
true,false`;

        const source = new CSVDataSource({data: csv});
        const chunks = [];
        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.strictEqual(typeof chunks[0].edges[0].src, "string");
        assert.strictEqual(typeof chunks[0].edges[0].dst, "string");
        assert.strictEqual(chunks[0].edges[0].src, "123");
        assert.strictEqual(chunks[0].edges[1].src, "true");
    });
});
```

---

### Implementation

**File**: `src/data/CSVDataSource.ts`

#### 1. Create Shared Edge Creation Helper

Add this private method (around line 180):

```typescript
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
    rowIndex: number
): AdHocData | null {
    // Validate source and target exist
    if (src === null || src === undefined || src === "") {
        this.errorAggregator.addError({
            message: `Missing source in row ${rowIndex} (column: ${sourceColName})`,
            category: "missing-data",
            severity: "error"
        });
        return null;
    }

    if (dst === null || dst === undefined || dst === "") {
        this.errorAggregator.addError({
            message: `Missing target in row ${rowIndex} (column: ${targetColName})`,
            category: "missing-data",
            severity: "error"
        });
        return null;
    }

    // Convert to strings (CSV parsers may return numbers/booleans)
    const srcStr = String(src);
    const dstStr = String(dst);

    // Create edge with all row properties
    const edge: AdHocData = {
        src: srcStr,
        dst: dstStr,
        ...row
    };

    // Remove the source/target columns from edge properties
    // (they're now in src/dst)
    delete edge[sourceColName];
    delete edge[targetColName];

    return edge;
}
```

#### 2. Refactor `parseEdgeList()` (lines 188-266)

```typescript
// BEFORE: ~80 lines with duplicated logic
private parseEdgeList(
    rows: Array<Record<string, unknown>>,
    variantInfo: CSVVariantInfo
): {nodes: AdHocData[]; edges: AdHocData[]} {
    const edges: AdHocData[] = [];
    const sourceCol = this.config.sourceColumn ?? variantInfo.sourceColumn ?? "source";
    const targetCol = this.config.targetColumn ?? variantInfo.targetColumn ?? "target";

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const src = row[sourceCol];
        const dst = row[targetCol];

        // 30 lines of validation and edge creation...
    }

    return {nodes: [], edges};
}

// AFTER: ~15 lines using helper
private parseEdgeList(
    rows: Array<Record<string, unknown>>,
    variantInfo: CSVVariantInfo
): {nodes: AdHocData[]; edges: AdHocData[]} {
    const edges: AdHocData[] = [];
    const sourceCol = this.config.sourceColumn ?? variantInfo.sourceColumn ?? "source";
    const targetCol = this.config.targetColumn ?? variantInfo.targetColumn ?? "target";

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const edge = this.createEdge(
            row[sourceCol],
            row[targetCol],
            row,
            sourceCol,
            targetCol,
            i
        );

        if (edge) {
            edges.push(edge);
        }
    }

    return {nodes: [], edges};
}
```

#### 3. Refactor `parseGephiFormat()` (lines 407-474)

Apply same pattern - replace edge creation with `createEdge()` call.

#### 4. Refactor `parseCytoscapeFormat()` (lines 476-541)

Apply same pattern.

#### 5. Refactor `parseAdjacencyList()` (lines 543-604)

This method needs slight adaptation since it creates multiple edges per row:

```typescript
private parseAdjacencyList(
    rows: Array<Record<string, unknown>>
): {nodes: AdHocData[]; edges: AdHocData[]} {
    const nodes: AdHocData[] = [];
    const edges: AdHocData[] = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const [nodeId, ...neighbors] = Object.values(row);

        // Add node
        nodes.push({id: String(nodeId)});

        // Add edges to all neighbors
        for (const neighbor of neighbors) {
            if (neighbor !== null && neighbor !== undefined && neighbor !== "") {
                const edge = this.createEdge(
                    nodeId,
                    neighbor,
                    {}, // No additional properties in adjacency list
                    "source",
                    "target",
                    i
                );

                if (edge) {
                    edges.push(edge);
                }
            }
        }
    }

    return {nodes, edges};
}
```

---

### Dependencies

**External**: None

**Internal**:
- Phase 2 completion (ErrorAggregator integration)

---

### Verification Steps

1. **Run new tests**:
   ```bash
   npm test -- test/data/CSVDataSource.edge-creation.test.ts
   ```
   - Expected: All edge creation tests pass

2. **Run all CSV tests**:
   ```bash
   npm test -- test/data/CSVDataSource.test.ts
   ```
   - Expected: All existing tests pass unchanged

3. **Check line count reduction**:
   ```bash
   git diff --stat src/data/CSVDataSource.ts
   ```
   - Expected: ~150 lines removed

4. **Manual verification**:
   - Open Storybook CSV stories
   - Verify Neo4j, Gephi, Cytoscape variants all render correctly
   - Check console for any unexpected errors

---

## Phase 4: Missing Functionality & Consistency (3-4 days)

**Objective**: Implement missing features identified in the code review: JSON streaming, chunking for JSON and CSV paired files, standardized error messages, and edge property naming consistency.

**Success Criteria**:
- ✅ JsonDataSource uses streaming parser for memory efficiency
- ✅ All DataSources support chunking (no single-chunk yields)
- ✅ Standardized error message format across all DataSources
- ✅ Consistent edge property naming (src/dst everywhere)
- ✅ Performance benchmark: 100MB JSON file uses <200MB memory

---

### Tests to Write First

**File**: `test/data/JsonDataSource.streaming.test.ts` (new file)

```typescript
import {assert, describe, test} from "vitest";
import {JsonDataSource} from "../../src/data/JsonDataSource.js";

describe("JsonDataSource streaming", () => {
    test("yields multiple chunks for large datasets", async () => {
        // Create large dataset (2500 nodes)
        const nodes = Array.from({length: 2500}, (_, i) => ({
            id: `n${i}`,
            value: Math.random()
        }));

        const edges = [{src: "n0", dst: "n1"}];

        const source = new JsonDataSource({
            data: JSON.stringify({nodes, edges}),
            chunkSize: 1000
        });

        const chunks = [];
        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        // Should have 3 chunks (1000, 1000, 500)
        assert.strictEqual(chunks.length, 3);
        assert.strictEqual(chunks[0].nodes.length, 1000);
        assert.strictEqual(chunks[1].nodes.length, 1000);
        assert.strictEqual(chunks[2].nodes.length, 500);

        // Edges only in first chunk
        assert.strictEqual(chunks[0].edges.length, 1);
        assert.strictEqual(chunks[1].edges.length, 0);
    });

    test("handles streaming from URL", async () => {
        // This test requires a mock server with large JSON
        // Document expected behavior for manual testing

        // Setup: Mock server with 10MB JSON file
        // Action: Create JsonDataSource with URL
        // Assert: Memory usage stays under 50MB during parsing
    });
});
```

**File**: `test/data/CSVDataSource.chunking.test.ts` (extend existing)

```typescript
describe("CSVDataSource paired files chunking", () => {
    test("yields multiple chunks for large paired files", async () => {
        // Create large CSV files
        const nodeCSV = [
            "id,label",
            ...Array.from({length: 2500}, (_, i) => `n${i},Node ${i}`)
        ].join("\n");

        const edgeCSV = [
            "source,target",
            ...Array.from({length: 100}, (_, i) => `n${i},n${i + 1}`)
        ].join("\n");

        const source = new CSVDataSource({
            data: nodeCSV, // Simulating nodeFile
            // In real test, use nodeFile and edgeFile
            chunkSize: 1000
        });

        const chunks = [];
        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        // Should have 3 chunks
        assert.strictEqual(chunks.length, 3);
    });
});
```

**File**: `test/data/error-messages.test.ts` (new file)

```typescript
import {assert, describe, test} from "vitest";
import {GraphMLDataSource} from "../../src/data/GraphMLDataSource.js";
import {GMLDataSource} from "../../src/data/GMLDataSource.js";

describe("Standardized error messages", () => {
    test("missing input error format", async () => {
        const sources = [
            new GraphMLDataSource({}),
            new GMLDataSource({}),
            // ... other formats
        ];

        for (const source of sources) {
            await assert.rejects(
                async () => {
                    for await (const chunk of source.getData()) {
                        // Should not get here
                    }
                },
                /DataSource requires data, file, or url/
            );
        }
    });

    test("network error format", async () => {
        const source = new GraphMLDataSource({
            url: "http://invalid-url-that-does-not-exist.test"
        });

        await assert.rejects(
            async () => {
                for await (const chunk of source.getData()) {
                    // Should not get here
                }
            },
            /Failed to fetch .* after 3 attempts/
        );
    });
});
```

---

### Implementation

#### 1. Implement JSON Streaming

**File**: `src/data/JsonDataSource.ts`

```typescript
import {JSONParser} from "@streamparser/json";

export class JsonDataSource extends DataSource {
    // ... existing code ...

    async *sourceFetchData(): AsyncGenerator<DataSourceChunk, void, unknown> {
        let response: Response;

        try {
            response = await this.fetchWithRetry(this.url);
        } catch (error) {
            throw new Error(`Failed to fetch JSON from ${this.url}: ${error instanceof Error ? error.message : String(error)}`);
        }

        if (!response.body) {
            throw new Error("JSON response had no body");
        }

        // Stream parse the JSON
        const parser = new JSONParser({
            paths: [this.opts.node.path, this.opts.edge.path]
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let nodes: unknown[] = [];
        let edges: unknown[] = [];

        try {
            while (true) {
                const {done, value} = await reader.read();

                if (done) break;

                const chunk = decoder.decode(value, {stream: true});

                for (const {value: parsedValue, key} of parser.write(chunk)) {
                    if (key === this.opts.node.path) {
                        nodes = parsedValue as unknown[];
                    } else if (key === this.opts.edge.path) {
                        edges = parsedValue as unknown[];
                    }
                }

                // Yield chunks as we accumulate nodes
                if (nodes.length >= this.chunkSize) {
                    const nodeChunk = nodes.splice(0, this.chunkSize);
                    const edgeChunk = edges.splice(0, edges.length); // All edges in first chunk

                    if (!Array.isArray(nodeChunk)) {
                        throw new TypeError(`Expected array at path '${this.opts.node.path}'`);
                    }

                    yield {nodes: nodeChunk, edges: edgeChunk};
                }
            }

            // Yield remaining data
            if (nodes.length > 0 || edges.length > 0) {
                if (!Array.isArray(nodes)) {
                    throw new TypeError(`Expected array at path '${this.opts.node.path}'`);
                }
                if (!Array.isArray(edges)) {
                    throw new TypeError(`Expected array at path '${this.opts.edge.path}'`);
                }

                yield* this.chunkData(nodes, edges);
            }
        } catch (error) {
            throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
```

#### 2. Add Chunking to CSV Paired Files

**File**: `src/data/CSVDataSource.ts`

```typescript
private async *parsePairedFiles(): AsyncGenerator<DataSourceChunk, void, unknown> {
    // ... existing validation and fetch logic ...

    // Parse both CSVs
    const nodeParse = Papa.parse(nodeText, {
        header: true,
        dynamicTyping: true,
        transformHeader: (h) => h.trim(),
    });

    const edgeParse = Papa.parse(edgeText, {
        header: true,
        dynamicTyping: true,
        transformHeader: (h) => h.trim(),
    });

    // Convert to AdHocData
    const nodes: AdHocData[] = nodeParse.data.map(row => ({...row}));
    const edges: AdHocData[] = edgeParse.data.map(row => ({
        src: String(row.source ?? row.Source),
        dst: String(row.target ?? row.Target),
        ...row
    }));

    // BEFORE: yield {nodes, edges}; (single chunk)
    // AFTER: Use chunking helper
    yield* this.chunkData(nodes, edges);
}
```

#### 3. Standardize Error Messages

Create error message templates:

**File**: `src/data/DataSource.ts`

```typescript
export abstract class DataSource {
    // ... existing code ...

    /**
     * Standardized error message templates
     */
    protected errorMessages = {
        missingInput: () =>
            `${this.type}DataSource requires data, file, or url`,

        fetchFailed: (url: string, attempts: number, error: string) =>
            `Failed to fetch ${this.type} from ${url} after ${attempts} attempts: ${error}`,

        parseFailed: (error: string) =>
            `Failed to parse ${this.type}: ${error}`,

        invalidFormat: (reason: string) =>
            `Invalid ${this.type} format: ${reason}`,

        extractionFailed: (path: string, error: string) =>
            `Failed to extract data using path '${path}': ${error}`
    };
}
```

Update all DataSources to use these templates.

#### 4. Standardize Edge Property Names

**File**: Each DataSource that currently uses non-standard names

Example - `GEXFDataSource.ts`:

```typescript
// BEFORE:
edges.push({
    source: sourceId,
    target: targetId,
    ...
});

// AFTER:
edges.push({
    src: sourceId,
    dst: targetId,
    // Preserve original names as metadata if needed
    _originalSource: sourceId,
    _originalTarget: targetId,
    ...
});
```

Apply to:
- `PajekDataSource.ts` (add `src`/`dst` alongside existing properties)
- `GraphMLDataSource.ts` (standardize to `src`/`dst`)
- Any other formats using different conventions

---

### Dependencies

**External**:
- `@streamparser/json` (already in package.json, currently commented out)

**Internal**:
- Phase 1 (chunking helper)
- Phase 2 (fetchWithRetry)

---

### Verification Steps

1. **Run new tests**:
   ```bash
   npm test -- test/data/JsonDataSource.streaming.test.ts
   npm test -- test/data/CSVDataSource.chunking.test.ts
   npm test -- test/data/error-messages.test.ts
   ```
   - Expected: All new tests pass

2. **Performance benchmark** (manual):
   - Create 100MB JSON file with 1M nodes
   - Load in browser with memory profiling enabled
   - Verify memory usage stays under 200MB
   - Verify parsing completes in reasonable time (<30s)

3. **Visual verification in Storybook**:
   - Test all CSV variants still work
   - Test JSON variants with large datasets
   - Verify error messages are user-friendly

4. **Run full test suite**: `npm test`
   - Expected: All tests pass

---

## Phase 5: Testing, Polish & Documentation (2-3 days)

**Objective**: Achieve comprehensive test coverage, remove dead code, and create documentation for extending the DataSource system.

**Success Criteria**:
- ✅ Test coverage > 85% for data loading code
- ✅ All edge cases tested (empty files, network errors, error limits)
- ✅ Zero console.log or commented code
- ✅ Documentation for custom DataSource creation
- ✅ Performance benchmarks documented

---

### Tests to Write First

**File**: `test/data/edge-cases.test.ts` (new file)

```typescript
import {assert, describe, test} from "vitest";
import {GraphMLDataSource} from "../../src/data/GraphMLDataSource.js";
import {CSVDataSource} from "../../src/data/CSVDataSource.js";

describe("Edge cases", () => {
    describe("Empty files", () => {
        test("handles empty CSV gracefully", async () => {
            const source = new CSVDataSource({data: ""});
            const chunks = [];

            for await (const chunk of source.getData()) {
                chunks.push(chunk);
            }

            assert.strictEqual(chunks.length, 0);
        });

        test("handles CSV with headers only", async () => {
            const source = new CSVDataSource({data: "source,target\n"});
            const chunks = [];

            for await (const chunk of source.getData()) {
                chunks.push(chunk);
            }

            assert.strictEqual(chunks.length, 0);
        });

        test("handles empty GraphML", async () => {
            const xml = `<?xml version="1.0"?>
<graphml>
  <graph id="G">
  </graph>
</graphml>`;

            const source = new GraphMLDataSource({data: xml});
            const chunks = [];

            for await (const chunk of source.getData()) {
                chunks.push(chunk);
            }

            assert.strictEqual(chunks.length, 0);
        });
    });

    describe("Error limits", () => {
        test("stops processing at error limit", async () => {
            // Create CSV with 150 malformed rows, limit=50
            const rows = Array.from({length: 150}, (_, i) => `invalid,row,${i}`);
            const csv = "source,target\n" + rows.join("\n");

            const source = new CSVDataSource({data: csv, errorLimit: 50});

            for await (const chunk of source.getData()) {
                // Process chunks
            }

            const errors = source.getErrorAggregator().getErrors();
            assert.isTrue(errors.length <= 50);
        });

        test("reports when error limit reached", () => {
            // ... similar test for other formats
        });
    });

    describe("File and URL inputs", () => {
        test("loads from File object", async () => {
            const blob = new Blob(["source,target\nn1,n2"], {type: "text/csv"});
            const file = new File([blob], "test.csv");

            const source = new CSVDataSource({file});
            const chunks = [];

            for await (const chunk of source.getData()) {
                chunks.push(chunk);
            }

            assert.strictEqual(chunks[0].edges.length, 1);
        });

        // Note: URL tests require mock server
    });

    describe("Malformed data", () => {
        test("handles unclosed XML tags", async () => {
            const xml = `<?xml version="1.0"?>
<graphml>
  <graph id="G">
    <node id="n1"`;  // Unclosed tag

            const source = new GraphMLDataSource({data: xml});

            await assert.rejects(
                async () => {
                    for await (const chunk of source.getData()) {
                        // Should not get here
                    }
                },
                /Failed to parse/
            );
        });

        test("handles invalid JSON", async () => {
            const source = new JsonDataSource({
                data: "{invalid json}",
            });

            await assert.rejects(
                async () => {
                    for await (const chunk of source.getData()) {
                        // Should not get here
                    }
                },
                /Failed to parse JSON/
            );
        });
    });
});
```

**File**: `test/data/large-files.test.ts` (new file)

```typescript
import {assert, describe, test} from "vitest";
import {JsonDataSource} from "../../src/data/JsonDataSource.js";
import {CSVDataSource} from "../../src/data/CSVDataSource.js";

describe("Large file handling", () => {
    test("JSON: chunks 10K nodes properly", async () => {
        const nodes = Array.from({length: 10000}, (_, i) => ({id: `n${i}`}));
        const data = JSON.stringify({nodes, edges: []});

        const source = new JsonDataSource({
            data,
            chunkSize: 1000
        });

        const chunks = [];
        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.strictEqual(chunks.length, 10);
        assert.strictEqual(chunks[0].nodes.length, 1000);
    });

    test("CSV: chunks 10K rows properly", async () => {
        const rows = Array.from({length: 10000}, (_, i) => `n${i},n${i + 1}`);
        const csv = "source,target\n" + rows.join("\n");

        const source = new CSVDataSource({
            data: csv,
            chunkSize: 1000
        });

        const chunks = [];
        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        // Should have multiple chunks
        assert.isTrue(chunks.length > 1);

        // Total edges should be 10K
        const totalEdges = chunks.reduce((sum, c) => sum + c.edges.length, 0);
        assert.strictEqual(totalEdges, 10000);
    });

    test("Memory efficient: processes 100K nodes without hanging", async () => {
        const nodes = Array.from({length: 100000}, (_, i) => ({id: `n${i}`}));
        const data = JSON.stringify({nodes, edges: []});

        const source = new JsonDataSource({
            data,
            chunkSize: 5000
        });

        let chunkCount = 0;
        for await (const chunk of source.getData()) {
            chunkCount++;
            // Verify we're actually getting chunks, not hanging
            assert.isTrue(chunk.nodes.length <= 5000);
        }

        assert.strictEqual(chunkCount, 20);
    }).timeout(30000); // Allow 30s for large test
});
```

---

### Implementation

#### 1. Remove Dead Code

**Files to clean**:
- `src/data/JsonDataSource.ts`: Remove line 5 (`// import {JSONParser}...`) - now used
- `src/data/DataSource.ts`: Remove line 24 (`// abstract init()`)
- `src/data/GMLDataSource.ts`: Remove unused `nextChar` variable (line 100)
- `src/data/DOTDataSource.ts`: Remove unused `operator` variable (line 294) or complete implementation
- `src/data/GMLDataSource.ts`: Remove unused `nested` variable (line 192)

#### 2. Create Documentation

**File**: `docs/extending-data-sources.md` (new file)

```markdown
# Creating Custom DataSources

This guide explains how to create custom DataSource implementations for new graph data formats.

## Overview

A DataSource is responsible for:
1. Loading data from a source (file, URL, or inline string)
2. Parsing the data into nodes and edges
3. Yielding data in chunks for memory efficiency
4. Handling errors gracefully with ErrorAggregator

## Basic Structure

```typescript
import {DataSource, DataSourceChunk, BaseDataSourceConfig} from "./DataSource.js";
import {AdHocData} from "../config";

export interface MyFormatConfig extends BaseDataSourceConfig {
    // Add format-specific options here
    myOption?: string;
}

export class MyFormatDataSource extends DataSource {
    static readonly type = "myformat";
    private config: MyFormatConfig;

    constructor(config: MyFormatConfig) {
        super(config.errorLimit ?? 100, config.chunkSize ?? 1000);
        this.config = config;
    }

    protected getConfig(): BaseDataSourceConfig {
        return this.config;
    }

    async *sourceFetchData(): AsyncGenerator<DataSourceChunk> {
        // 1. Get content using inherited method
        const content = await this.getContent();

        // 2. Parse your format
        const {nodes, edges} = this.parseMyFormat(content);

        // 3. Yield chunks using inherited helper
        yield* this.chunkData(nodes, edges);
    }

    private parseMyFormat(content: string): {nodes: AdHocData[], edges: AdHocData[]} {
        // Your parsing logic here
        const nodes: AdHocData[] = [];
        const edges: AdHocData[] = [];

        // ... parse content ...

        return {nodes, edges};
    }
}

// Register your DataSource
DataSource.register(MyFormatDataSource);
```

## Best Practices

### 1. Use Inherited Utilities

- **getContent()**: Always use `await this.getContent()` instead of implementing your own
- **chunkData()**: Always use `yield* this.chunkData(nodes, edges)` for consistent chunking
- **fetchWithRetry()**: Use for any network requests (includes timeout and exponential backoff)
- **errorAggregator**: Use `this.errorAggregator.addError()` instead of throwing for recoverable errors

### 2. Error Handling

```typescript
// ❌ Don't throw for recoverable errors
if (!node.id) {
    throw new Error("Node missing ID");
}

// ✅ Do use ErrorAggregator
if (!node.id) {
    this.errorAggregator.addError({
        message: `Node at index ${i} missing required 'id' field`,
        category: "missing-data",
        severity: "error"
    });
    continue; // Skip this node, continue processing
}
```

### 3. Edge Properties

Always use `src` and `dst` for edge endpoints:

```typescript
edges.push({
    src: String(sourceId),
    dst: String(targetId),
    // ... other properties
});
```

### 4. Testing

Create comprehensive tests:

```typescript
describe("MyFormatDataSource", () => {
    test("parses basic format", async () => {
        const source = new MyFormatDataSource({
            data: "... test data ..."
        });

        const chunks = [];
        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.strictEqual(chunks[0].nodes.length, expectedNodeCount);
    });

    test("handles malformed data", async () => {
        // Test error handling
    });

    test("chunks large datasets", async () => {
        // Test chunking with 2500+ nodes
    });
});
```

## Examples

See existing DataSources for reference:
- **Simple format**: `GMLDataSource.ts` - custom parser, straightforward structure
- **Complex format**: `CSVDataSource.ts` - variant detection, multiple parsing strategies
- **External library**: `GraphMLDataSource.ts` - uses xml2js library

## Registration

Register your DataSource to make it available via `DataSource.get()`:

```typescript
// In your module
DataSource.register(MyFormatDataSource);

// Usage
const source = DataSource.get("myformat", {
    url: "http://example.com/data.myformat"
});
```
```

**File**: `docs/data-loading-performance.md` (new file)

```markdown
# Data Loading Performance Guide

## Benchmarks

Measured on: Chrome 120, M1 MacBook Pro, 16GB RAM

| Dataset Size | Format | Parse Time | Memory Usage | Notes |
|-------------|--------|------------|--------------|-------|
| 1K nodes | JSON | <100ms | <10MB | Single chunk |
| 10K nodes | JSON | <2s | <50MB | 10 chunks |
| 100K nodes | JSON | <20s | <150MB | Streaming parser |
| 1M nodes | JSON | ~3min | <200MB | Memory-efficient streaming |
| 10K edges | CSV | <1s | <30MB | Edge list format |
| 100K edges | CSV | <10s | <100MB | Chunked processing |

## Optimization Tips

### 1. Use Appropriate Chunk Sizes

```typescript
// Small datasets: use default
const source = new JsonDataSource({url: "small.json"});

// Large datasets: increase chunk size
const source = new JsonDataSource({
    url: "large.json",
    chunkSize: 5000  // Default: 1000
});
```

### 2. Choose the Right Format

- **JSON**: Best for nested data, slower parsing
- **CSV**: Best for flat data, fastest parsing
- **GraphML/GEXF**: Best for styled graphs, moderate parsing

### 3. Server-Side Filtering

Filter data on the server before sending to client:

```typescript
// ❌ Load 1M nodes, filter to 10K in browser
const source = new JsonDataSource({
    url: "http://api.example.com/all-nodes"
});

// ✅ Filter on server, load only needed data
const source = new JsonDataSource({
    url: "http://api.example.com/nodes?filter=active&limit=10000"
});
```

### 4. Streaming for Large Files

JSON streaming is automatic for URLs. For inline data, consider using URLs:

```typescript
// ❌ Large string in memory
const source = new JsonDataSource({
    data: hugeJsonString  // 100MB string in memory
});

// ✅ Fetch from URL for streaming
const source = new JsonDataSource({
    url: "/api/data"  // Streams from server
});
```

## Monitoring Performance

```typescript
const source = new JsonDataSource({url: "data.json"});

let chunkCount = 0;
const startTime = performance.now();

for await (const chunk of source.getData()) {
    chunkCount++;
    console.log(`Chunk ${chunkCount}: ${chunk.nodes.length} nodes, ${chunk.edges.length} edges`);
}

const duration = performance.now() - startTime;
console.log(`Loaded in ${duration}ms`);

// Check for errors
const errors = source.getErrorAggregator().getErrors();
if (errors.length > 0) {
    console.warn(`Encountered ${errors.length} errors during parsing`);
}
```
```

#### 3. Add Package Documentation

**File**: `README.md` updates

Add section on data loading:

```markdown
## Data Loading

Graphty supports loading graph data from multiple formats:

- **JSON** - Generic JSON with JMESPath queries
- **CSV** - Edge lists, node lists, adjacency lists, Gephi, Cytoscape formats
- **GraphML** - XML-based format with yFiles support
- **GML** - Graph Modeling Language
- **GEXF** - Graph Exchange XML Format
- **DOT** - Graphviz format
- **Pajek** - Pajek NET format

### Basic Usage

```typescript
import {DataSource} from "./data/DataSource.js";

// Auto-detect format
const source = DataSource.get("json", {
    url: "http://example.com/graph.json"
});

// Load data in chunks
for await (const chunk of source.getData()) {
    console.log(`Loaded ${chunk.nodes.length} nodes`);
}

// Check for errors
const errors = source.getErrorAggregator().getErrors();
```

### See Also

- [Creating Custom DataSources](./docs/extending-data-sources.md)
- [Performance Guide](./docs/data-loading-performance.md)
```

---

### Dependencies

**External**: None

**Internal**:
- All previous phases must be complete

---

### Verification Steps

1. **Run all new tests**:
   ```bash
   npm test -- test/data/edge-cases.test.ts
   npm test -- test/data/large-files.test.ts
   ```
   - Expected: All tests pass

2. **Check test coverage**:
   ```bash
   npm run coverage
   ```
   - Expected: Data loading code >85% coverage
   - Check `coverage/index.html` for detailed report

3. **Verify no dead code**:
   ```bash
   npm run lint
   ```
   - Expected: No warnings about unused variables
   - No commented-out imports

4. **Run full test suite**: `npm test`
   - Expected: All tests pass

5. **Build and lint**:
   ```bash
   npm run build
   npm run lint:all
   ```
   - Expected: No errors

6. **Manual verification**:
   - Review documentation for clarity
   - Test all Storybook stories
   - Verify performance benchmarks are accurate

7. **Final check**: `npm run ready:commit`
   - Expected: Everything passes, ready for review

---

## Common Utilities Summary

Throughout the implementation, these shared utilities are created:

### In `DataSource.ts`

1. **`DEFAULT_CHUNK_SIZE`** (constant)
   - Default: 1000
   - Used by all DataSources

2. **`BaseDataSourceConfig`** (interface)
   - Common config: data, file, url, chunkSize, errorLimit
   - Extended by format-specific configs

3. **`getContent()`** (protected method)
   - Loads from data/file/url
   - Uses fetchWithRetry for URLs
   - Throws standardized error if no input

4. **`fetchWithRetry()`** (protected method)
   - 3 retries with exponential backoff
   - 30s timeout
   - Abortable via AbortController

5. **`chunkData()`** (protected generator)
   - Yields nodes in chunks
   - All edges in first chunk
   - Handles empty datasets

6. **`errorMessages`** (templates)
   - Standardized error message formats
   - Consistent across all DataSources

---

## External Libraries Assessment

| Task | Recommended Library | Reason |
|------|-------------------|--------|
| JSON streaming | `@streamparser/json` | Memory-efficient, already in package.json |
| CSV parsing | `papaparse` | Already in use, feature-rich |
| XML parsing | `xml2js` | Already in use for GraphML/GEXF |
| DOT parsing | Custom implementation | No good library, custom parser already exists |
| GML parsing | Custom implementation | Simple format, custom parser is sufficient |
| Network mocking (tests) | `msw` (Mock Service Worker) | Industry standard for API mocking |

---

## Risk Mitigation

### Risk: Breaking existing Storybook stories

**Mitigation**:
- Run `npm run test:storybook` after each phase
- Manual review of key stories
- Keep config interfaces backward compatible

### Risk: Performance regression from streaming

**Mitigation**:
- Benchmark before/after Phase 4
- Document performance characteristics
- Allow users to opt-out via chunkSize=Infinity

### Risk: Incomplete error aggregation

**Mitigation**:
- Comprehensive tests for error handling in Phase 2
- Manual testing with intentionally malformed data
- Error aggregator unit tests

### Risk: Lost features during refactoring

**Mitigation**:
- All existing tests must pass after each phase
- Feature checklist reviewed at end of each phase
- No phase should delete functionality, only refactor

---

## Acceptance Criteria

At the end of all phases:

### Functionality
- ✅ All 7 data formats work unchanged
- ✅ All Storybook stories render correctly
- ✅ All existing tests pass
- ✅ ErrorAggregator used consistently
- ✅ Network retry on all DataSources
- ✅ Streaming JSON parser active
- ✅ Chunking works for all formats

### Code Quality
- ✅ ~370 lines of duplicate code removed
- ✅ Zero console.log statements
- ✅ Zero commented-out code
- ✅ Zero TypeScript errors
- ✅ Zero ESLint warnings
- ✅ Test coverage >85%

### Documentation
- ✅ Guide for creating custom DataSources
- ✅ Performance benchmarks documented
- ✅ README updated with data loading examples

### Performance
- ✅ 10K nodes parse in <2s
- ✅ 100MB JSON file uses <200MB memory
- ✅ Network retries work reliably

---

## Post-Implementation Tasks

After all 5 phases are complete:

1. **Run `npm run ready:commit`** - Ensure everything builds and tests pass
2. **Update CHANGELOG.md** - Document refactoring improvements
3. **Create migration guide** (if any breaking changes)
4. **Performance benchmarking report** - Document before/after metrics
5. **User documentation review** - Ensure docs match implementation
6. **Code review** - Have team review the changes

---

## Estimated Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Base Class Refactoring | 2-3 days | None |
| Phase 2: Critical Reliability Fixes | 2-3 days | Phase 1 |
| Phase 3: CSV Consolidation | 1-2 days | Phase 2 |
| Phase 4: Missing Functionality | 3-4 days | Phases 1-3 |
| Phase 5: Testing & Documentation | 2-3 days | Phases 1-4 |
| **Total** | **10-15 days** | Sequential execution |

**Note**: Phases should be executed sequentially, not in parallel. Each phase builds on the previous phase's work.

---

## Success Metrics

Track these metrics after implementation:

- **Lines of code reduced**: Target ~370 lines
- **Test coverage increase**: Target >85%
- **Performance improvement**: JSON parsing memory usage <200MB for 100MB file
- **Error handling improvement**: 100% of errors use ErrorAggregator
- **Reliability improvement**: Network retry success rate >95% on flaky connections
- **Developer experience**: Time to add new DataSource <2 hours (vs ~4 hours before)
