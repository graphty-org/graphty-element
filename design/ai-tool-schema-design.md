# AI Tool Schema Discovery Design

## Overview

This document describes the design for enabling LLMs to discover and understand the schema of graph data, allowing them to write meaningful selectors and queries against nodes and edges.

## Motivation

### The Problem

Our AI tools include commands like `findNodes`, `findAndStyleNodes`, and `findAndStyleEdges` that accept JMESPath selectors to match graph elements. For example:

```typescript
findAndStyleNodes({
    selector: "data.type == 'server'",
    style: { color: "#ff0000" }
})
```

However, the LLM has no way of knowing:
1. What properties exist in `node.data` or `edge.data`
2. What values those properties can have
3. The structure/schema of the loaded dataset

The examples currently in our tool definitions (like `data.type == 'server'`) are **aspirational** - they demonstrate syntax but assume knowledge the LLM cannot possess without explicit discovery mechanisms.

### User Impact

Without schema discovery, users asking natural language questions like:
- "Highlight all the database nodes"
- "Show me connections with high latency"
- "Color nodes by their category"

...will result in the LLM either:
1. Guessing property names (likely incorrect)
2. Asking the user for property names (poor UX)
3. Failing to execute the request

### Goal

Enable LLMs to autonomously discover graph data schemas so they can write accurate selectors without user intervention.

---

## Options Considered

### Option 1: `describeSchema` Tool

A single tool that analyzes all nodes/edges and returns a comprehensive schema summary.

**Implementation:**
- Iterate through all nodes, collect unique property keys from `node.data`
- For each property, determine the type (string, number, boolean, array)
- Collect unique values (for strings) or min/max ranges (for numbers)
- Return a structured summary

**Example Output:**
```json
{
  "nodeProperties": {
    "type": { "type": "string", "values": ["server", "database", "client"], "count": 3 },
    "name": { "type": "string", "sampleValues": ["web-01", "db-master"], "uniqueCount": 47 },
    "cpu": { "type": "number", "min": 0.1, "max": 0.98, "avg": 0.45 }
  },
  "edgeProperties": {
    "weight": { "type": "number", "min": 0.1, "max": 1.0 },
    "relationship": { "type": "string", "values": ["connects", "depends_on"] }
  }
}
```

**Pros:**
- Comprehensive single-call solution
- Gives full picture of available data

**Cons:**
- Could be slow for large graphs
- Output might be verbose, consuming LLM context window
- All-or-nothing approach wastes tokens when LLM only needs specific info

---

### Option 2: `sampleNodes` / `sampleEdges` Tools

Return a small number of actual nodes/edges so the LLM can see real data structures.

**Implementation:**
- Return 3-5 random (or representative) nodes with their full `data` objects
- Optionally use stratified sampling to show variety

**Example Output:**
```json
{
  "samples": [
    { "id": "node-1", "data": { "type": "server", "name": "web-01", "cpu": 0.45 } },
    { "id": "node-7", "data": { "type": "database", "name": "db-master", "cpu": 0.82 } }
  ]
}
```

**Pros:**
- Simple to implement
- Shows real data; LLM can infer schema naturally
- Minimal output size

**Cons:**
- Small sample might miss some properties
- Doesn't show value distributions or ranges
- LLM must infer schema from examples (may miss edge cases)

---

### Option 3: Schema in System Prompt

Include dataset metadata in the system prompt when AI is initialized.

**Implementation:**
- When data is loaded, extract schema information
- Pass it to `SystemPromptBuilder` to include in the prompt
- LLM always has this context available

**Example System Prompt Addition:**
```
## Current Dataset Schema

Nodes have the following properties:
- type (string): "server", "database", "client"
- name (string): human-readable identifier
- cpu (number): CPU usage 0-1

Edges have the following properties:
- weight (number): connection strength 0-1
```

**Pros:**
- Always available without tool calls
- Fast - no runtime computation needed
- Naturally integrates with existing prompt system

**Cons:**
- Uses context window space permanently
- Needs to be updated when data changes
- Requires coordination between data loading and AI initialization
- Static once set; can't reflect dynamic data changes

---

### Option 4: Dynamic Examples

Generate tool examples based on actual data at runtime.

**Implementation:**
- When commands are registered or system prompt is built, inspect current data
- Replace generic examples with real ones from the dataset

**Example Transformation:**
```typescript
// Static example (current)
{input: "Find all server nodes", params: {selector: "data.type == 'server'"}}

// Dynamic example (generated from actual data)
{input: "Find all router nodes", params: {selector: "data.category == 'router'"}}
```

**Pros:**
- Examples are always relevant
- Teaches by showing real patterns
- Doesn't require new tools

**Cons:**
- More complex to implement
- Examples might not cover all use cases
- Limited to a few examples; can't show full schema

---

### Option 5: Hybrid Approach (Chosen)

Combine multiple strategies for optimal coverage and efficiency.

**Components:**
1. **System prompt** includes high-level schema summary (property names and types)
2. **`sampleData` tool** available for LLM to inspect actual nodes/edges when needed
3. **`describeProperty` tool** for deep-diving into a specific property's values

**Pros:**
- Immediate baseline knowledge (system prompt)
- Ability to explore when uncertain (tools)
- Efficient context usage (only fetches details when needed)
- Handles both simple and complex discovery needs

**Cons:**
- More components to implement and maintain
- Requires coordination between components

---

## Chosen Solution: Hybrid Approach

The hybrid approach provides the best balance of:
- **Immediate availability:** Schema summary in system prompt
- **Depth on demand:** Tools for detailed exploration
- **Context efficiency:** Only detailed info when needed

---

## Detailed Design

### Component 1: Schema Summary in System Prompt

#### Overview

When the AI system is initialized or when data changes, generate a concise schema summary and inject it into the system prompt.

#### Schema Extraction

Create a new utility module `src/ai/schema/SchemaExtractor.ts`:

```typescript
interface PropertySummary {
    name: string;
    type: "string" | "number" | "boolean" | "array" | "object" | "mixed";
    nullable: boolean;
    // For strings with few unique values
    enumValues?: string[];
    // For numbers
    range?: { min: number; max: number };
    // For arrays
    itemType?: string;
}

interface SchemaSummary {
    nodeProperties: PropertySummary[];
    edgeProperties: PropertySummary[];
    nodeCount: number;
    edgeCount: number;
}
```

#### Extraction Logic

```typescript
function extractSchema(graph: Graph): SchemaSummary {
    // 1. Iterate all nodes, collect property keys and sample values
    // 2. Infer types from values (handle mixed types)
    // 3. For string properties with ≤10 unique values, include as enumValues
    // 4. For number properties, track min/max
    // 5. Repeat for edges
    // 6. Return structured summary
}
```

#### Integration with SystemPromptBuilder

Modify `SystemPromptBuilder` to accept schema information:

```typescript
class SystemPromptBuilder {
    private schemaSummary?: SchemaSummary;

    setSchema(schema: SchemaSummary): void {
        this.schemaSummary = schema;
    }

    build(): string {
        let prompt = this.basePrompt;

        if (this.schemaSummary) {
            prompt += this.formatSchemaSection(this.schemaSummary);
        }

        return prompt;
    }

    private formatSchemaSection(schema: SchemaSummary): string {
        // Format as human-readable markdown section
    }
}
```

#### Schema Update Lifecycle

Schema should be updated when:
1. Initial data load completes
2. Nodes/edges are added or removed (debounced)
3. Node/edge data properties change

Hook into `DataManager` events:

```typescript
// In AiManager or AiController
dataManager.on("dataLoaded", () => this.updateSchema());
dataManager.on("nodesChanged", debounce(() => this.updateSchema(), 1000));
```

#### Output Format

The schema section in the system prompt should be concise but informative:

```markdown
## Graph Data Schema

**Graph Size:** 150 nodes, 230 edges

**Node Properties:**
- `type` (string): "server", "database", "client", "gateway"
- `name` (string): unique identifier
- `cpu` (number): 0.02 - 0.98
- `memory` (number): 1024 - 65536
- `active` (boolean)
- `tags` (array of strings)
- `region` (string): "us-east", "us-west", "eu-central"

**Edge Properties:**
- `weight` (number): 0.1 - 1.0
- `latency` (number): 1 - 500
- `relationship` (string): "connects", "depends_on", "replicates"
```

---

### Component 2: `sampleData` Tool

#### Overview

A tool that returns sample nodes and/or edges so the LLM can see actual data structures.

#### Command Definition

File: `src/ai/commands/SchemaCommands.ts`

```typescript
export const sampleData: GraphCommand = {
    name: "sampleData",
    description: "Get sample nodes and/or edges from the graph to inspect their data structure. Useful for understanding what properties are available before writing selectors.",
    parameters: z.object({
        target: z.enum(["nodes", "edges", "both"]).optional()
            .describe("What to sample (default: 'both')"),
        count: z.number().min(1).max(10).optional()
            .describe("Number of samples to return (default: 3)"),
        stratifyBy: z.string().optional()
            .describe("Property to stratify samples by (e.g., 'type' to get one of each type)"),
    }),
    examples: [
        { input: "Show me some example nodes", params: { target: "nodes" } },
        { input: "What does the data look like?", params: { target: "both", count: 3 } },
        { input: "Show one node of each type", params: { target: "nodes", stratifyBy: "type" } },
    ],

    execute(graph: Graph, params: Record<string, unknown>): Promise<CommandResult> {
        // Implementation
    }
};
```

#### Sampling Strategies

1. **Random sampling (default):**
   - Select `count` random nodes/edges
   - Simple and fast

2. **Stratified sampling (when `stratifyBy` specified):**
   - Group items by the specified property
   - Select one from each group (up to `count`)
   - Ensures variety in samples

3. **Representative sampling (future enhancement):**
   - Select items that together cover all observed properties
   - More complex but ensures completeness

#### Output Format

```json
{
    "success": true,
    "message": "Sampled 3 nodes and 3 edges.",
    "data": {
        "nodes": [
            {
                "id": "node-1",
                "data": {
                    "type": "server",
                    "name": "web-01",
                    "cpu": 0.45,
                    "active": true,
                    "tags": ["production", "critical"]
                }
            },
            // ... more nodes
        ],
        "edges": [
            {
                "id": "edge-1",
                "source": "node-1",
                "target": "node-5",
                "data": {
                    "weight": 0.8,
                    "latency": 45,
                    "relationship": "connects"
                }
            },
            // ... more edges
        ]
    }
}
```

#### Implementation Notes

- Limit output size to avoid overwhelming the LLM context
- Truncate very long string values (e.g., > 100 chars)
- For nodes with many properties, consider showing all properties but truncating values
- Include source/target IDs for edges to show graph structure

---

### Component 3: `describeProperty` Tool

#### Overview

A tool for deep-diving into a specific property to understand its values in detail.

#### Command Definition

```typescript
export const describeProperty: GraphCommand = {
    name: "describeProperty",
    description: "Get detailed information about a specific property in node or edge data. Returns type, value distribution, and statistics. Useful for understanding what values to use in selectors.",
    parameters: z.object({
        property: z.string()
            .describe("Property name to inspect (e.g., 'type', 'weight', 'metadata.category')"),
        target: z.enum(["nodes", "edges"]).optional()
            .describe("Whether to inspect nodes or edges (default: 'nodes')"),
        limit: z.number().min(1).max(50).optional()
            .describe("Max unique values to return for string properties (default: 20)"),
    }),
    examples: [
        { input: "What values does the 'type' property have?", params: { property: "type" } },
        { input: "Describe the weight property on edges", params: { property: "weight", target: "edges" } },
        { input: "What categories exist?", params: { property: "category", limit: 10 } },
    ],

    execute(graph: Graph, params: Record<string, unknown>): Promise<CommandResult> {
        // Implementation
    }
};
```

#### Output Formats by Type

**String property:**
```json
{
    "success": true,
    "message": "Property 'type' is a string with 4 unique values.",
    "data": {
        "property": "type",
        "target": "nodes",
        "dataType": "string",
        "totalCount": 150,
        "presentCount": 150,
        "nullCount": 0,
        "uniqueCount": 4,
        "values": [
            { "value": "server", "count": 45, "percentage": 30.0 },
            { "value": "database", "count": 30, "percentage": 20.0 },
            { "value": "client", "count": 50, "percentage": 33.3 },
            { "value": "gateway", "count": 25, "percentage": 16.7 }
        ]
    }
}
```

**Number property:**
```json
{
    "success": true,
    "message": "Property 'cpu' is a number ranging from 0.02 to 0.98.",
    "data": {
        "property": "cpu",
        "target": "nodes",
        "dataType": "number",
        "totalCount": 150,
        "presentCount": 147,
        "nullCount": 3,
        "min": 0.02,
        "max": 0.98,
        "avg": 0.47,
        "median": 0.45,
        "stdDev": 0.23,
        "histogram": [
            { "range": "0.00-0.20", "count": 15, "percentage": 10.2 },
            { "range": "0.20-0.40", "count": 35, "percentage": 23.8 },
            { "range": "0.40-0.60", "count": 52, "percentage": 35.4 },
            { "range": "0.60-0.80", "count": 30, "percentage": 20.4 },
            { "range": "0.80-1.00", "count": 15, "percentage": 10.2 }
        ]
    }
}
```

**Boolean property:**
```json
{
    "success": true,
    "message": "Property 'active' is a boolean, 80% true.",
    "data": {
        "property": "active",
        "target": "nodes",
        "dataType": "boolean",
        "totalCount": 150,
        "presentCount": 148,
        "nullCount": 2,
        "trueCount": 120,
        "falseCount": 28,
        "truePercentage": 81.1,
        "falsePercentage": 18.9
    }
}
```

**Array property:**
```json
{
    "success": true,
    "message": "Property 'tags' is an array with 12 unique values across 142 nodes.",
    "data": {
        "property": "tags",
        "target": "nodes",
        "dataType": "array",
        "itemType": "string",
        "totalCount": 150,
        "presentCount": 142,
        "nullCount": 8,
        "avgLength": 2.3,
        "minLength": 0,
        "maxLength": 5,
        "uniqueValues": 12,
        "valueCounts": [
            { "value": "production", "count": 80, "percentage": 56.3 },
            { "value": "monitored", "count": 65, "percentage": 45.8 },
            { "value": "critical", "count": 25, "percentage": 17.6 }
            // ... more values
        ]
    }
}
```

**Property not found:**
```json
{
    "success": true,
    "message": "Property 'foo' was not found on any nodes.",
    "data": {
        "property": "foo",
        "target": "nodes",
        "exists": false,
        "suggestion": "Available properties: type, name, cpu, memory, active, tags, region"
    }
}
```

#### Implementation Notes

**Nested property access:**
- Support dot notation: `"metadata.category"`, `"metrics.cpu.current"`
- Use a helper function to safely access nested properties

**Performance considerations:**
- For large graphs (>10k nodes), consider sampling instead of full iteration
- Cache results for repeated queries (invalidate on data change)
- Histogram bin count should be configurable or adaptive

**Edge cases to handle:**
- Property exists on some nodes but not others
- Mixed types (same property is string on some nodes, number on others)
- Very long string values (truncate in output)
- Deeply nested objects (limit depth)

---

### Component 4: Integration & Lifecycle

#### File Structure

```
src/ai/
├── schema/
│   ├── index.ts
│   ├── SchemaExtractor.ts      # Extract schema from graph
│   ├── SchemaFormatter.ts      # Format schema for system prompt
│   └── types.ts                # Schema type definitions
├── commands/
│   ├── SchemaCommands.ts       # sampleData, describeProperty
│   └── index.ts                # Export new commands
└── prompt/
    └── SystemPromptBuilder.ts  # Modified to include schema
```

#### Registration

In `AiController` or `AiManager`, register the new commands:

```typescript
// Register schema discovery commands
commandRegistry.register(sampleData);
commandRegistry.register(describeProperty);
```

#### Schema Lifecycle

```typescript
class AiManager {
    private schemaExtractor: SchemaExtractor;
    private promptBuilder: SystemPromptBuilder;

    constructor(graph: Graph) {
        this.schemaExtractor = new SchemaExtractor(graph);
        this.setupSchemaUpdates();
    }

    private setupSchemaUpdates(): void {
        const dataManager = this.graph.getDataManager();

        // Update schema on initial load
        dataManager.on("dataLoaded", () => this.refreshSchema());

        // Debounced update on changes
        const debouncedRefresh = debounce(() => this.refreshSchema(), 1000);
        dataManager.on("nodeAdded", debouncedRefresh);
        dataManager.on("nodeRemoved", debouncedRefresh);
        dataManager.on("edgeAdded", debouncedRefresh);
        dataManager.on("edgeRemoved", debouncedRefresh);
    }

    private refreshSchema(): void {
        const schema = this.schemaExtractor.extract();
        this.promptBuilder.setSchema(schema);

        // If there's an active conversation, the schema change will
        // be reflected in the next message's system prompt
    }
}
```

#### Event Integration

The schema tools need access to the graph's data. Ensure commands receive the graph instance:

```typescript
// In CommandRegistry.execute()
const result = await command.execute(this.graph, params);
```

---

## Usage Examples

### Example 1: LLM Discovers Schema Automatically

**User:** "Highlight all the important nodes"

**LLM thinks:** "I need to find nodes that are 'important'. Let me check what properties exist."

**System prompt already contains:**
```
Node Properties:
- `priority` (string): "low", "medium", "high", "critical"
- `type` (string): "server", "database"
```

**LLM response:** Calls `findAndStyleNodes({selector: "priority == 'critical'", style: {color: "#ff0000", glowColor: "#ff0000"}})`

---

### Example 2: LLM Uses sampleData for Unfamiliar Dataset

**User:** "Show me the structure of this data"

**LLM:** Calls `sampleData({target: "both", count: 2})`

**Result:**
```json
{
    "nodes": [
        {"id": "n1", "data": {"category": "router", "bandwidth": 1000, "location": "dc-1"}},
        {"id": "n2", "data": {"category": "switch", "bandwidth": 500, "location": "dc-2"}}
    ],
    "edges": [
        {"id": "e1", "source": "n1", "target": "n2", "data": {"capacity": 800, "type": "fiber"}}
    ]
}
```

**LLM response:** "This graph represents network infrastructure. Nodes are network devices with categories (router, switch), bandwidth, and location. Edges represent connections with capacity and type."

---

### Example 3: LLM Uses describeProperty for Detailed Analysis

**User:** "What are the latency ranges in this network?"

**LLM:** Calls `describeProperty({property: "latency", target: "edges"})`

**Result:**
```json
{
    "property": "latency",
    "dataType": "number",
    "min": 1,
    "max": 487,
    "avg": 45.2,
    "histogram": [
        {"range": "0-100", "count": 180, "percentage": 78.3},
        {"range": "100-200", "count": 35, "percentage": 15.2},
        {"range": "200-500", "count": 15, "percentage": 6.5}
    ]
}
```

**LLM response:** "Latency ranges from 1ms to 487ms, with an average of 45ms. Most connections (78%) have latency under 100ms. There are 15 high-latency connections (200-500ms) that might need attention."

---

## Testing Strategy

### Unit Tests

1. **SchemaExtractor tests:**
   - Extracts correct types for various property values
   - Handles mixed types appropriately
   - Correctly identifies enum-like string properties
   - Handles nested properties
   - Handles empty graphs

2. **sampleData command tests:**
   - Returns correct number of samples
   - Stratified sampling works correctly
   - Handles graphs with fewer items than requested count
   - Output format matches specification

3. **describeProperty command tests:**
   - Correct output for each data type (string, number, boolean, array)
   - Handles missing properties gracefully
   - Nested property access works
   - Histogram generation is correct
   - Percentages sum correctly

### Integration Tests

1. **Schema in system prompt:**
   - Schema section appears in built prompt
   - Schema updates when data changes
   - Schema is formatted readably

2. **End-to-end with LLM:**
   - LLM can use schema info to write correct selectors
   - LLM calls schema tools when needed
   - Tools return usable information

### Storybook Stories

Create stories demonstrating schema discovery:

1. `stories/ai/SchemaDiscovery.stories.ts`:
   - Story showing schema extraction for various datasets
   - Interactive tool calling demonstration

---

## Future Enhancements

1. **Schema caching:** Cache extracted schemas with invalidation on data change
2. **Property relationships:** Detect correlations between properties
3. **Smart suggestions:** Suggest selectors based on common patterns
4. **Schema diff:** Show what changed when data updates
5. **Custom schema annotations:** Allow users to add descriptions to properties

---

## Implementation Checklist

### Phase 1: Core Infrastructure
- [ ] Create `src/ai/schema/` directory structure
- [ ] Implement `SchemaExtractor` class
- [ ] Implement `SchemaFormatter` class
- [ ] Define TypeScript types for schema structures

### Phase 2: System Prompt Integration
- [ ] Modify `SystemPromptBuilder` to accept schema
- [ ] Add schema section formatting
- [ ] Hook schema extraction into data loading lifecycle
- [ ] Add debounced schema refresh on data changes

### Phase 3: sampleData Command
- [ ] Implement `sampleData` command
- [ ] Add random sampling logic
- [ ] Add stratified sampling logic
- [ ] Write unit tests
- [ ] Register command in CommandRegistry

### Phase 4: describeProperty Command
- [ ] Implement `describeProperty` command
- [ ] Add type-specific analysis (string, number, boolean, array)
- [ ] Add nested property support
- [ ] Add histogram generation for numbers
- [ ] Write unit tests
- [ ] Register command in CommandRegistry

### Phase 5: Testing & Documentation
- [ ] Write integration tests
- [ ] Create Storybook stories
- [ ] Update tool documentation
- [ ] Update examples in existing commands to reference schema discovery

---

## References

- [JMESPath Specification](https://jmespath.org/specification.html) - Selector syntax
- [Zod Documentation](https://zod.dev/) - Parameter validation
- Existing commands: `src/ai/commands/QueryCommands.ts`, `src/ai/commands/StyleCommands.ts`
