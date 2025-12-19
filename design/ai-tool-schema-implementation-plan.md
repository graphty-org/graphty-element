# Implementation Plan for AI Tool Schema Discovery

## Overview

This plan implements a hybrid schema discovery system enabling LLMs to understand graph data schemas for writing accurate JMESPath selectors. The system provides:

1. **Automatic schema extraction** from graph nodes and edges
2. **Schema summary in system prompts** for immediate LLM awareness
3. **`sampleData` tool** for inspecting actual data structures
4. **`describeProperty` tool** for deep-diving into specific properties

## Phase Breakdown

### Phase 1: Schema Type Definitions and Extraction Core

**Objective**: Create the foundational types and core extraction logic for analyzing graph data schemas.

**Tests to Write First**:
- `test/ai/schema/SchemaExtractor.test.ts`: Core extraction tests
  ```typescript
  describe("SchemaExtractor", () => {
    it("extracts string properties from node data");
    it("extracts number properties with min/max range");
    it("extracts boolean properties");
    it("extracts array properties and infers item type");
    it("handles mixed types for same property");
    it("identifies enum-like strings (≤10 unique values)");
    it("handles nested properties");
    it("handles empty graphs gracefully");
    it("handles null/undefined values");
    it("returns correct node and edge counts");
  });
  ```

**Implementation**:
- `src/ai/schema/types.ts`: Schema type definitions
  ```typescript
  interface PropertySummary {
    name: string;
    type: "string" | "number" | "boolean" | "array" | "object" | "mixed";
    nullable: boolean;
    enumValues?: string[];
    range?: { min: number; max: number };
    itemType?: string;
  }

  interface SchemaSummary {
    nodeProperties: PropertySummary[];
    edgeProperties: PropertySummary[];
    nodeCount: number;
    edgeCount: number;
  }
  ```
- `src/ai/schema/SchemaExtractor.ts`: Extraction implementation
- `src/ai/schema/index.ts`: Module exports

**Dependencies**:
- External: None
- Internal: Graph, DataManager interfaces

**Verification**:
1. Run: `npm test -- test/ai/schema/SchemaExtractor.test.ts`
2. Expected: All tests pass, schema extraction returns correct types and values

---

### Phase 2: Schema Formatting and System Prompt Integration

**Objective**: Format extracted schemas into human-readable markdown and integrate with SystemPromptBuilder.

**Tests to Write First**:
- `test/ai/schema/SchemaFormatter.test.ts`: Formatting tests
  ```typescript
  describe("SchemaFormatter", () => {
    it("formats node properties section");
    it("formats edge properties section");
    it("includes enum values for string properties");
    it("includes range for number properties");
    it("handles empty schema gracefully");
    it("limits enum values displayed");
    it("truncates long property names");
  });
  ```
- `test/ai/prompt/SystemPromptBuilder.schema.test.ts`: Integration tests
  ```typescript
  describe("SystemPromptBuilder with schema", () => {
    it("includes schema section when schema is set");
    it("excludes schema section when schema is not set");
    it("formats schema in markdown");
    it("updates schema section when setSchema called again");
  });
  ```

**Implementation**:
- `src/ai/schema/SchemaFormatter.ts`: Format schema as markdown
  ```typescript
  export function formatSchemaForPrompt(schema: SchemaSummary): string;
  ```
- Modify `src/ai/prompt/SystemPromptBuilder.ts`:
  - Add `private schemaSummary?: SchemaSummary`
  - Add `setSchema(schema: SchemaSummary): void`
  - Add `private buildSchemaSection(): string`
  - Update `build()` to include schema section

**Dependencies**:
- External: None
- Internal: Phase 1 types

**Verification**:
1. Run: `npm test -- test/ai/schema`
2. Run: `npm test -- test/ai/prompt/SystemPromptBuilder`
3. Expected: All tests pass, formatted schema appears in system prompt

---

### Phase 3: Schema Lifecycle Integration

**Objective**: Wire schema extraction into AiManager to update on data changes.

**Tests to Write First**:
- `test/ai/AiManager.schema.test.ts`: Lifecycle tests
  ```typescript
  describe("AiManager schema lifecycle", () => {
    it("extracts schema on initialization");
    it("updates schema when nodes added");
    it("updates schema when edges added");
    it("debounces rapid schema updates");
    it("includes schema in generated system prompt");
  });
  ```

**Implementation**:
- Create `src/ai/schema/SchemaManager.ts`:
  ```typescript
  export class SchemaManager {
    private extractor: SchemaExtractor;
    private formatter: SchemaFormatter;
    private cachedSchema?: SchemaSummary;

    constructor(graph: Graph);
    extract(): SchemaSummary;
    getFormattedSchema(): string;
    invalidateCache(): void;
  }
  ```
- Modify `src/ai/AiManager.ts`:
  - Add `private schemaManager: SchemaManager`
  - Update `init()` to create SchemaManager and extract initial schema
  - Add data change event listeners (debounced)
  - Update `dispose()` to cleanup listeners
- Modify `src/ai/AiController.ts`:
  - Update system prompt building to include schema

**Dependencies**:
- External: `lodash-es` (for debounce) or implement simple debounce
- Internal: Phase 1 & 2 modules, DataManager events

**Verification**:
1. Run: `npm test -- test/ai/AiManager.schema.test.ts`
2. Expected: Schema updates automatically on data changes

---

### Phase 4: `sampleData` Command

**Objective**: Implement the sampleData tool for LLMs to inspect actual graph data.

**Tests to Write First**:
- `test/ai/commands/SchemaCommands.sampleData.test.ts`:
  ```typescript
  describe("sampleData command", () => {
    it("returns specified number of node samples");
    it("returns specified number of edge samples");
    it("returns both nodes and edges by default");
    it("respects count parameter");
    it("handles count larger than available items");
    it("includes node ID and data in samples");
    it("includes edge ID, source, target, and data");
    it("performs stratified sampling when stratifyBy specified");
    it("truncates long string values in output");
    it("has correct command metadata (name, description, examples)");
  });
  ```

**Implementation**:
- `src/ai/commands/SchemaCommands.ts`:
  ```typescript
  export const sampleData: GraphCommand = {
    name: "sampleData",
    description: "Get sample nodes and/or edges...",
    parameters: z.object({
      target: z.enum(["nodes", "edges", "both"]).optional(),
      count: z.number().min(1).max(10).optional(),
      stratifyBy: z.string().optional(),
    }),
    examples: [...],
    execute(graph, params): Promise<CommandResult> { ... }
  };
  ```
- Implement sampling strategies:
  - Random sampling (default)
  - Stratified sampling (group by property value)

**Dependencies**:
- External: None
- Internal: Graph, DataManager, CommandResult types

**Verification**:
1. Run: `npm test -- test/ai/commands/SchemaCommands.sampleData.test.ts`
2. Expected: All sampling scenarios work correctly

---

### Phase 5: `describeProperty` Command

**Objective**: Implement the describeProperty tool for detailed property analysis.

**Tests to Write First**:
- `test/ai/commands/SchemaCommands.describeProperty.test.ts`:
  ```typescript
  describe("describeProperty command", () => {
    // String properties
    it("returns value distribution for string properties");
    it("includes percentages for string values");
    it("respects limit parameter for unique values");

    // Number properties
    it("returns min/max/avg for number properties");
    it("includes histogram for number properties");
    it("handles integer and float numbers");

    // Boolean properties
    it("returns true/false counts for boolean properties");
    it("includes percentages for boolean values");

    // Array properties
    it("returns unique values for array items");
    it("includes array length statistics");

    // Edge cases
    it("handles nested property paths");
    it("returns not found for missing properties");
    it("suggests available properties when not found");
    it("handles mixed type properties");
    it("handles null values in property analysis");

    // Metadata
    it("has correct command metadata");
  });
  ```

**Implementation**:
- Add to `src/ai/commands/SchemaCommands.ts`:
  ```typescript
  export const describeProperty: GraphCommand = {
    name: "describeProperty",
    description: "Get detailed information about a property...",
    parameters: z.object({
      property: z.string(),
      target: z.enum(["nodes", "edges"]).optional(),
      limit: z.number().min(1).max(50).optional(),
    }),
    examples: [...],
    execute(graph, params): Promise<CommandResult> { ... }
  };
  ```
- Helper utilities:
  - `getNestedProperty(obj, path)` - Safe nested property access
  - `generateHistogram(values, binCount)` - Numeric histogram
  - `calculateStatistics(values)` - min, max, avg, median, stdDev

**Dependencies**:
- External: None (could use simple-statistics npm package for advanced stats)
- Internal: Graph, DataManager, CommandResult types

**Verification**:
1. Run: `npm test -- test/ai/commands/SchemaCommands.describeProperty.test.ts`
2. Expected: All property types analyzed correctly

---

### Phase 6: Command Registration and End-to-End Testing

**Objective**: Register new commands and validate full integration.

**Tests to Write First**:
- `test/ai/commands/SchemaCommands.integration.test.ts`:
  ```typescript
  describe("SchemaCommands integration", () => {
    it("sampleData is registered in AiManager");
    it("describeProperty is registered in AiManager");
    it("commands appear in tool definitions");
    it("commands execute through AiController");
  });
  ```
- `test/browser/ai/schema-discovery-e2e.test.ts`:
  ```typescript
  describe("Schema discovery end-to-end", () => {
    it("schema appears in system prompt for real graph");
    it("sampleData returns real node data");
    it("describeProperty analyzes real properties");
    it("LLM can use schema info to write selectors");
  });
  ```

**Implementation**:
- Update `src/ai/commands/index.ts`: Export new commands
- Update `src/ai/AiManager.ts`: Register schema commands in `registerBuiltinCommands()`
- Update `src/ai/index.ts`: Export schema types and utilities

**Dependencies**:
- External: None
- Internal: All previous phases

**Verification**:
1. Run: `npm test -- test/ai/commands/SchemaCommands`
2. Run: `npm test -- test/browser/ai/schema-discovery`
3. Run: `npm run lint`
4. Run: `npm run build`
5. Expected: All tests pass, build succeeds

---

### Phase 7: Storybook Stories and Documentation

**Objective**: Create visual demonstrations and update documentation.

**Tests to Write First**:
- No new unit tests (visual verification)
- Storybook interaction tests in story files

**Implementation**:
- `stories/ai/SchemaDiscovery.stories.ts`:
  ```typescript
  export default {
    title: 'AI/Schema Discovery',
    component: GraphtyElement,
  };

  export const SchemaInPrompt = { ... };
  export const SampleDataDemo = { ... };
  export const DescribePropertyDemo = { ... };
  ```
- Update tool documentation in existing commands
- Add schema discovery examples to README or docs

**Dependencies**:
- External: Storybook
- Internal: All previous phases

**Verification**:
1. Run: `npm run storybook`
2. Navigate to AI > Schema Discovery stories
3. Verify schema appears in prompt, tools work interactively
4. Run: `npm run test:storybook` (if applicable)

---

## Common Utilities Needed

| Utility | Purpose | Location |
|---------|---------|----------|
| `getNestedProperty(obj, path)` | Safe dot-notation property access | `src/ai/schema/utils.ts` |
| `debounce(fn, ms)` | Debounce rapid calls | Use `lodash-es` or simple implementation |
| `truncateString(str, maxLen)` | Truncate long values for output | `src/ai/schema/utils.ts` |
| `calculateStatistics(values)` | Numeric statistics (min, max, avg) | `src/ai/schema/utils.ts` |
| `generateHistogram(values, bins)` | Create distribution histogram | `src/ai/schema/utils.ts` |

## External Libraries Assessment

| Task | Library | Reason |
|------|---------|--------|
| Debouncing | `lodash-es` (already in deps) or native | Prevent rapid schema recalculation |
| Statistics | None needed | Simple calculations sufficient for MVP |

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Large graph performance | Sample first N nodes/edges instead of full iteration; add configurable limit |
| Context window overflow | Limit enum values shown (max 10); truncate long values; summarize rather than detail |
| Property path errors | Robust try/catch in nested property access; graceful fallback |
| Schema staleness | Debounced updates on data change; cache invalidation on explicit refresh |
| Mixed type confusion | Clearly report "mixed" type; show example values of each type |

## File Structure Summary

```
src/ai/
├── schema/
│   ├── index.ts                 # Module exports
│   ├── types.ts                 # PropertySummary, SchemaSummary interfaces
│   ├── SchemaExtractor.ts       # Extract schema from graph
│   ├── SchemaFormatter.ts       # Format schema as markdown
│   ├── SchemaManager.ts         # Lifecycle management, caching
│   └── utils.ts                 # Shared utilities
├── commands/
│   ├── SchemaCommands.ts        # sampleData, describeProperty
│   └── index.ts                 # (updated exports)
├── prompt/
│   └── SystemPromptBuilder.ts   # (updated with schema support)
├── AiManager.ts                 # (updated with schema lifecycle)
└── index.ts                     # (updated exports)

test/ai/
├── schema/
│   ├── SchemaExtractor.test.ts
│   ├── SchemaFormatter.test.ts
│   └── SchemaManager.test.ts
├── commands/
│   ├── SchemaCommands.sampleData.test.ts
│   ├── SchemaCommands.describeProperty.test.ts
│   └── SchemaCommands.integration.test.ts
├── prompt/
│   └── SystemPromptBuilder.schema.test.ts
└── AiManager.schema.test.ts

test/browser/ai/
└── schema-discovery-e2e.test.ts

stories/ai/
└── SchemaDiscovery.stories.ts
```

## Success Criteria

1. **All tests pass**: Unit, integration, and e2e tests
2. **Build succeeds**: `npm run build` completes without errors
3. **Lint passes**: `npm run lint` reports no issues
4. **Schema in prompt**: System prompt includes data schema when graph has data
5. **Tools functional**: `sampleData` and `describeProperty` return accurate results
6. **Performance acceptable**: Schema extraction completes in <100ms for 1000-node graphs
7. **Documentation complete**: Storybook stories demonstrate functionality
