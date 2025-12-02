# AI Tool System State Discovery Design

## Overview

This document describes the design for enabling LLMs to discover and understand the current system state of the graph visualization, including styles, camera, layout, selection, and algorithm state.

## Motivation

### The Problem

Our AI tools can modify graph state (add styles, change camera, run algorithms), but the LLM has limited visibility into:

1. **What styles exist** - Which layers are applied, in what order, with what selectors
2. **Current view state** - Camera position, 2D/3D mode, zoom level
3. **Selection state** - Which nodes/edges are currently selected
4. **Algorithm history** - Which algorithms have run and what data they added

This creates several problems:

1. **Blind modifications:** LLM adds styles without knowing what's already applied
2. **Redundant operations:** LLM changes to 3D mode when already in 3D
3. **Missing context:** User says "remove that red highlighting" but LLM doesn't know which layer to remove
4. **Broken workflows:** LLM tries to style by `degree` without first running the degree algorithm

### Current State

The `queryGraph` tool provides basic information:
- Node count
- Edge count
- Current layout type
- 2D/3D mode

But it doesn't expose:
- Style layers (names, order, selectors, styles)
- Camera position/target details
- Selection state
- Algorithm run history
- Layout settling state

### Goal

Enable LLMs to query comprehensive system state so they can:
- Make informed decisions about modifications
- Avoid redundant operations
- Reference existing state in responses
- Debug visual issues ("why is this node red?")

---

## State Categories

### 1. Style State

Information about the styling system:

| Property | Description | Use Case |
|----------|-------------|----------|
| Layer count | Number of style layers | Understanding style complexity |
| Layer order | List of layers from lowest to highest priority | Understanding style precedence |
| Layer metadata | Name, source (AI vs user), timestamp | Identifying layers for removal |
| Layer selectors | What each layer targets | Understanding what's styled |
| Layer styles | What styles are applied | Debugging appearance |
| Computed style | Final merged style for a specific node/edge | Debugging "why does X look like Y?" |

### 2. View State

Information about the camera and display:

| Property | Description | Use Case |
|----------|-------------|----------|
| Camera position | X, Y, Z coordinates | Understanding current viewpoint |
| Camera target | What camera is looking at | Understanding focus |
| 2D/3D mode | Current dimension mode | Avoiding redundant switches |
| Zoom level | Current zoom/distance | Context for "zoom in/out" |
| Active preset | If a preset is active | Understanding view context |
| Viewport size | Canvas dimensions | Screenshot planning |

### 3. Layout State

Information about the layout system:

| Property | Description | Use Case |
|----------|-------------|----------|
| Layout type | Current algorithm (ngraph, circular, etc.) | Avoiding redundant changes |
| Layout options | Options passed to layout | Understanding configuration |
| Settled state | Whether layout animation is complete | Timing operations |
| Available layouts | What layouts are registered | Suggesting alternatives |

### 4. Selection State

Information about user selection:

| Property | Description | Use Case |
|----------|-------------|----------|
| Selected nodes | List of selected node IDs | Operating on selection |
| Selected edges | List of selected edge IDs | Operating on selection |
| Selection count | Number of selected items | Quick check |
| Hover target | Currently hovered item | Context for interactions |

### 5. Algorithm State

Information about algorithm execution:

| Property | Description | Use Case |
|----------|-------------|----------|
| Algorithms run | List of algorithms that have been executed | Knowing available data |
| Data properties added | What properties algorithms added to nodes/edges | Enabling styling by algorithm results |
| Available algorithms | What algorithms are registered | Suggesting options |

---

## Design Decision: Tool Structure

### Options Considered

**Option A: Expand `queryGraph`**

Add more query types to existing tool.

```typescript
queryGraph({ query: "styles" })
queryGraph({ query: "camera" })
queryGraph({ query: "selection" })
```

*Pros:* Single tool, familiar pattern
*Cons:* Bloated; output varies wildly; hard to document

**Option B: Dedicated State Tools**

Separate tool for each state category.

```typescript
describeStyles()
describeViewState()
describeSelection()
describeAlgorithmState()
```

*Pros:* Focused outputs; clear purpose; LLM calls only what needed
*Cons:* More tools to maintain

**Option C: Single `describeState` Tool**

One tool with category parameter.

```typescript
describeState({ category: "styles" })
describeState({ category: "view" })
describeState({ category: "all" })
```

*Pros:* Single entry point; flexible
*Cons:* Complex output schema; similar problems to Option A

### Chosen Approach: Hybrid

- **`describeStyles`** - Dedicated tool (complex output, frequently needed)
- **`describeSelection`** - Dedicated tool (simple, distinct use case)
- **Expand `queryGraph`** - Add `"view"` and `"layout"` query types (simple outputs)
- **Expand `listAlgorithms`** - Add run history to response

This balances tool count with output clarity.

---

## Detailed Design

### Component 1: `describeStyles` Tool

#### Overview

Returns comprehensive information about the current style state.

#### Command Definition

File: `src/ai/commands/StateCommands.ts`

```typescript
export const describeStyles: GraphCommand = {
    name: "describeStyles",
    description: "Get information about the current style layers applied to the graph. Shows layer order (later layers override earlier ones), selectors, and what styles each layer applies. Useful for understanding why nodes/edges look a certain way or identifying layers to modify/remove.",
    parameters: z.object({
        verbose: z.boolean().optional()
            .describe("Include full style details for each layer (default: false, shows summary)"),
        layerName: z.string().optional()
            .describe("Get details for a specific layer by name"),
        computeFor: z.string().optional()
            .describe("Compute the final merged style for a specific node or edge ID"),
    }),
    examples: [
        { input: "What styles are applied?", params: {} },
        { input: "Show me all style details", params: { verbose: true } },
        { input: "What style layers affect the servers?", params: { layerName: "servers" } },
        { input: "Why is node-5 red?", params: { computeFor: "node-5" } },
    ],

    execute(graph: Graph, params: Record<string, unknown>): Promise<CommandResult> {
        // Implementation
    }
};
```

#### Output Format: Summary (default)

```json
{
    "success": true,
    "message": "Found 4 style layers.",
    "data": {
        "layerCount": 4,
        "layers": [
            {
                "index": 0,
                "name": "default",
                "source": "system",
                "nodeSelector": "",
                "edgeSelector": "",
                "summary": "Base styles for all nodes and edges"
            },
            {
                "index": 1,
                "name": "user-theme",
                "source": "user",
                "nodeSelector": "",
                "edgeSelector": "",
                "summary": "Node color: #3498db, Edge color: #95a5a6"
            },
            {
                "index": 2,
                "name": "ai-node-style-1701234567890",
                "source": "ai",
                "nodeSelector": "type == 'server'",
                "edgeSelector": null,
                "summary": "Node color: #ff0000, glow enabled"
            },
            {
                "index": 3,
                "name": "ai-edge-style-1701234568000",
                "source": "ai",
                "nodeSelector": null,
                "edgeSelector": "weight > 0.7",
                "summary": "Edge color: #00ff00, width: 3"
            }
        ],
        "aiLayerCount": 2,
        "aiLayerNames": ["ai-node-style-1701234567890", "ai-edge-style-1701234568000"]
    }
}
```

#### Output Format: Verbose

```json
{
    "success": true,
    "message": "Found 4 style layers (verbose).",
    "data": {
        "layerCount": 4,
        "layers": [
            {
                "index": 0,
                "name": "default",
                "source": "system",
                "metadata": { "name": "default", "builtin": true },
                "node": {
                    "selector": "",
                    "style": {
                        "enabled": true,
                        "shape": { "type": "sphere", "size": 1 },
                        "texture": { "color": "#FFFFFF" }
                    }
                },
                "edge": {
                    "selector": "",
                    "style": {
                        "enabled": true,
                        "line": { "color": "#888888", "width": 0.5 }
                    }
                }
            }
            // ... more layers with full details
        ]
    }
}
```

#### Output Format: Computed Style for Specific Element

When `computeFor` is provided:

```json
{
    "success": true,
    "message": "Computed style for node 'node-5'.",
    "data": {
        "elementId": "node-5",
        "elementType": "node",
        "computedStyle": {
            "enabled": true,
            "shape": { "type": "sphere", "size": 1.5 },
            "texture": { "color": "#FF0000" },
            "effect": { "glow": { "color": "#FF0000", "strength": 1 } }
        },
        "contributingLayers": [
            { "index": 0, "name": "default", "contributed": ["shape.type", "enabled"] },
            { "index": 2, "name": "ai-node-style-1701234567890", "contributed": ["texture.color", "shape.size", "effect.glow"] }
        ]
    }
}
```

#### Implementation Notes

**Layer source detection:**
```typescript
function getLayerSource(layer: StyleLayer): "system" | "user" | "ai" {
    const name = layer.metadata?.name;
    if (name?.startsWith("ai-")) return "ai";
    if (layer.metadata?.builtin) return "system";
    return "user";
}
```

**Style summary generation:**
```typescript
function summarizeStyle(nodeStyle?: NodeStyleConfig, edgeStyle?: EdgeStyleConfig): string {
    const parts: string[] = [];
    if (nodeStyle?.texture?.color) parts.push(`Node color: ${nodeStyle.texture.color}`);
    if (nodeStyle?.shape?.size && nodeStyle.shape.size !== 1) parts.push(`Node size: ${nodeStyle.shape.size}`);
    if (nodeStyle?.effect?.glow) parts.push("glow enabled");
    if (edgeStyle?.line?.color) parts.push(`Edge color: ${edgeStyle.line.color}`);
    if (edgeStyle?.line?.width) parts.push(`Edge width: ${edgeStyle.line.width}`);
    return parts.join(", ") || "No visible style changes";
}
```

---

### Component 2: `describeSelection` Tool

#### Overview

Returns information about currently selected nodes and edges.

#### Command Definition

```typescript
export const describeSelection: GraphCommand = {
    name: "describeSelection",
    description: "Get information about currently selected nodes and edges. Useful for operating on user's selection or understanding context.",
    parameters: z.object({
        includeData: z.boolean().optional()
            .describe("Include data properties for selected items (default: false)"),
    }),
    examples: [
        { input: "What's selected?", params: {} },
        { input: "Show me the selected nodes with their data", params: { includeData: true } },
        { input: "Are any nodes selected?", params: {} },
    ],

    execute(graph: Graph, params: Record<string, unknown>): Promise<CommandResult> {
        // Implementation
    }
};
```

#### Output Format: Basic

```json
{
    "success": true,
    "message": "3 nodes and 1 edge selected.",
    "data": {
        "hasSelection": true,
        "nodeCount": 3,
        "edgeCount": 1,
        "nodeIds": ["node-1", "node-5", "node-12"],
        "edgeIds": ["edge-7"]
    }
}
```

#### Output Format: With Data

```json
{
    "success": true,
    "message": "3 nodes and 1 edge selected.",
    "data": {
        "hasSelection": true,
        "nodes": [
            { "id": "node-1", "data": { "type": "server", "name": "web-01" } },
            { "id": "node-5", "data": { "type": "server", "name": "web-02" } },
            { "id": "node-12", "data": { "type": "database", "name": "db-01" } }
        ],
        "edges": [
            { "id": "edge-7", "source": "node-1", "target": "node-12", "data": { "latency": 45 } }
        ]
    }
}
```

#### Output Format: No Selection

```json
{
    "success": true,
    "message": "Nothing is currently selected.",
    "data": {
        "hasSelection": false,
        "nodeCount": 0,
        "edgeCount": 0,
        "nodeIds": [],
        "edgeIds": []
    }
}
```

---

### Component 3: Expand `queryGraph` with View and Layout Queries

#### New Query Types

Add to existing `QueryTypeSchema`:

```typescript
const QueryTypeSchema = z.enum([
    "nodeCount",
    "edgeCount",
    "currentLayout",
    "all",
    "summary",
    // New query types:
    "view",
    "layout",
]).describe("Type of information to query about the graph");
```

#### View Query Output

```json
{
    "success": true,
    "message": "Current view state.",
    "data": {
        "mode": "3D",
        "camera": {
            "position": { "x": 15.2, "y": 10.5, "z": 25.0 },
            "target": { "x": 0, "y": 0, "z": 0 },
            "distance": 30.5,
            "activePreset": null
        },
        "viewport": {
            "width": 1920,
            "height": 1080
        },
        "immersiveMode": "none"
    }
}
```

#### Layout Query Output

```json
{
    "success": true,
    "message": "Current layout: ngraph (settled).",
    "data": {
        "type": "ngraph",
        "options": {
            "springLength": 30,
            "springCoefficient": 0.0008,
            "gravity": -1.2
        },
        "settled": true,
        "settledFrames": 150,
        "availableLayouts": ["circular", "ngraph", "random", "d3", "spiral", "shell", "fixed"]
    }
}
```

---

### Component 4: Expand `listAlgorithms` with Run History

#### Modified Output

Add execution history to the response:

```json
{
    "success": true,
    "message": "Found 5 available algorithm(s). 2 have been run.",
    "data": {
        "algorithms": ["graphty:degree", "graphty:pagerank", "graphty:betweenness", "graphty:clustering", "graphty:components"],
        "count": 5,
        "history": [
            {
                "algorithm": "graphty:degree",
                "runAt": "2024-01-15T10:30:00Z",
                "addedProperties": {
                    "nodes": ["degree", "inDegree", "outDegree"],
                    "edges": []
                }
            },
            {
                "algorithm": "graphty:pagerank",
                "runAt": "2024-01-15T10:31:00Z",
                "addedProperties": {
                    "nodes": ["pagerank"],
                    "edges": []
                }
            }
        ],
        "availableDataProperties": {
            "nodes": ["degree", "inDegree", "outDegree", "pagerank"],
            "edges": []
        }
    }
}
```

#### Implementation Notes

Track algorithm runs in `AlgorithmManager` or `AiManager`:

```typescript
interface AlgorithmRun {
    namespace: string;
    type: string;
    runAt: Date;
    addedProperties: {
        nodes: string[];
        edges: string[];
    };
}

class AlgorithmTracker {
    private runs: AlgorithmRun[] = [];

    recordRun(namespace: string, type: string, addedProperties: { nodes: string[], edges: string[] }): void {
        this.runs.push({
            namespace,
            type,
            runAt: new Date(),
            addedProperties,
        });
    }

    getHistory(): AlgorithmRun[] {
        return [...this.runs];
    }

    getAvailableDataProperties(): { nodes: string[], edges: string[] } {
        const nodes = new Set<string>();
        const edges = new Set<string>();
        for (const run of this.runs) {
            run.addedProperties.nodes.forEach(p => nodes.add(p));
            run.addedProperties.edges.forEach(p => edges.add(p));
        }
        return { nodes: [...nodes], edges: [...edges] };
    }
}
```

---

## Usage Examples

### Example 1: Removing a Specific Style

**User:** "Remove the red highlighting"

**LLM:** Calls `describeStyles({})`

**Result shows:**
```json
{
    "layers": [
        { "index": 2, "name": "highlight-servers", "source": "ai", "summary": "Node color: #ff0000" }
    ]
}
```

**LLM:** Calls `clearStyles({ layerName: "highlight-servers" })`

**Response:** "I've removed the red highlighting from the server nodes."

---

### Example 2: Understanding Visual Appearance

**User:** "Why is node-5 glowing?"

**LLM:** Calls `describeStyles({ computeFor: "node-5" })`

**Result shows:**
```json
{
    "computedStyle": {
        "effect": { "glow": { "color": "#00ff00", "strength": 2 } }
    },
    "contributingLayers": [
        { "name": "critical-alerts", "contributed": ["effect.glow"] }
    ]
}
```

**Response:** "Node-5 is glowing because of the 'critical-alerts' style layer, which adds a green glow effect to certain nodes."

---

### Example 3: Operating on Selection

**User:** "Make the selected nodes bigger"

**LLM:** Calls `describeSelection({})`

**Result shows:**
```json
{
    "hasSelection": true,
    "nodeCount": 5,
    "nodeIds": ["n1", "n2", "n3", "n4", "n5"]
}
```

**LLM:** Creates a style layer targeting those specific nodes by ID, or uses a selector if they share a property.

---

### Example 4: Avoiding Redundant Operations

**User:** "Switch to 3D mode"

**LLM:** Calls `queryGraph({ query: "view" })`

**Result shows:**
```json
{
    "mode": "3D"
}
```

**Response:** "The graph is already in 3D mode. Would you like me to adjust the camera angle instead?"

---

### Example 5: Styling by Algorithm Results

**User:** "Color nodes by their importance"

**LLM:** Calls `listAlgorithms({})`

**Result shows:**
```json
{
    "history": [],
    "availableDataProperties": { "nodes": [], "edges": [] }
}
```

**LLM:** "I'll need to calculate importance first. Let me run the PageRank algorithm."

Calls `runAlgorithm({ namespace: "graphty", type: "pagerank" })`

Then calls `describeProperty({ property: "pagerank" })` to understand the value range.

Then applies gradient coloring based on pagerank values.

---

## File Structure

```
src/ai/
├── commands/
│   ├── StateCommands.ts        # describeStyles, describeSelection
│   ├── QueryCommands.ts        # Modified: add view, layout queries
│   ├── AlgorithmCommands.ts    # Modified: add run history
│   └── index.ts                # Export new commands
├── state/
│   ├── index.ts
│   ├── AlgorithmTracker.ts     # Track algorithm execution history
│   └── types.ts                # State-related type definitions
```

---

## Integration Points

### Selection State Access

Need to access selection state from Graph. Check if `SelectionManager` or similar exists:

```typescript
// In describeSelection command
const selectedNodes = graph.getSelectedNodes?.() ?? [];
const selectedEdges = graph.getSelectedEdges?.() ?? [];
```

If selection API doesn't exist, may need to implement or stub it.

### Style Layer Access

Access through `StyleManager`:

```typescript
const styleManager = graph.getStyleManager();
const layers = graph.styles.layers;
```

### Camera State Access

Access through camera system:

```typescript
const camera = graph.getCamera();
const position = camera.position;
const target = camera.target;
```

### Layout State Access

Access through `LayoutManager`:

```typescript
const layoutManager = graph.getLayoutManager();
const layoutType = layoutManager.layoutEngine?.type;
const isSettled = layoutManager.isSettled();
```

---

## Testing Strategy

### Unit Tests

1. **describeStyles tests:**
   - Returns correct layer count and order
   - Correctly identifies layer source (system/user/ai)
   - Summary generation is accurate
   - Verbose mode includes full style details
   - computeFor correctly merges styles
   - Handles empty style state

2. **describeSelection tests:**
   - Returns correct selection state
   - Handles no selection
   - includeData properly includes/excludes data
   - Handles large selections (truncation?)

3. **queryGraph view/layout tests:**
   - Returns correct camera position
   - Returns correct 2D/3D mode
   - Returns correct layout type and options
   - Handles missing optional data

4. **AlgorithmTracker tests:**
   - Records runs correctly
   - Returns history in order
   - Aggregates available properties correctly

### Integration Tests

1. Full workflow: run algorithm → list algorithms shows history → style by result
2. Add style → describe styles shows it → clear style → describe shows removed
3. Select nodes → describe selection → operate on selection

---

## Implementation Checklist

### Phase 1: State Infrastructure
- [ ] Create `src/ai/state/` directory
- [ ] Implement `AlgorithmTracker` class
- [ ] Define state-related TypeScript types
- [ ] Verify access to selection state (implement if needed)

### Phase 2: describeStyles Command
- [ ] Implement `describeStyles` command
- [ ] Add layer source detection logic
- [ ] Add style summary generation
- [ ] Add verbose mode with full details
- [ ] Add computeFor with style merging
- [ ] Write unit tests
- [ ] Register command

### Phase 3: describeSelection Command
- [ ] Implement `describeSelection` command
- [ ] Add includeData option
- [ ] Handle no selection case
- [ ] Write unit tests
- [ ] Register command

### Phase 4: Expand queryGraph
- [ ] Add "view" query type
- [ ] Add "layout" query type
- [ ] Access camera state
- [ ] Access layout settled state
- [ ] Update tests

### Phase 5: Expand listAlgorithms
- [ ] Integrate AlgorithmTracker
- [ ] Record algorithm runs in runAlgorithm
- [ ] Add history and availableDataProperties to output
- [ ] Update tests

### Phase 6: Testing & Documentation
- [ ] Write integration tests
- [ ] Create Storybook stories demonstrating state queries
- [ ] Update command documentation
- [ ] Add examples referencing state discovery

---

## Future Enhancements

1. **Style diff:** Show what changed when a style is added/removed
2. **Style preview:** Preview what a selector would match before applying
3. **Selection operations:** Tools to modify selection (select by property, expand selection)
4. **State snapshots:** Save/restore complete state for undo/redo
5. **State change events:** Notify LLM when state changes (for proactive responses)

---

## Relationship to Schema Discovery

This design complements the [AI Tool Schema Discovery Design](./ai-tool-schema-design.md):

| Schema Discovery | System State Discovery |
|------------------|----------------------|
| What data exists in nodes/edges | What styles/view/selection currently active |
| Static structure of the dataset | Dynamic runtime state |
| Enables writing selectors | Enables understanding current context |
| "What can I query?" | "What is currently happening?" |

Together, these provide complete situational awareness for the LLM:
1. Schema tells the LLM what data is available to work with
2. State tells the LLM what's currently configured/active

---

## References

- [AI Tool Schema Discovery Design](./ai-tool-schema-design.md) - Companion design for data schema discovery
- Existing commands: `src/ai/commands/QueryCommands.ts`, `src/ai/commands/StyleCommands.ts`
- Style system: `src/managers/StyleManager.ts`, `src/Styles.ts`
