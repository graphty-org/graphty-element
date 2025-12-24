# Data Sources

Guide to loading data from various sources and formats.

## Overview

Graphty supports multiple data formats and loading methods. Data can be provided inline, loaded from URLs, or read from files.

## Inline Data

The simplest way to provide data via HTML attributes:

```html
<graphty-element
  node-data='[{"id": "a"}, {"id": "b"}]'
  edge-data='[{"source": "a", "target": "b"}]'>
</graphty-element>
```

Or via JavaScript properties:

```typescript
element.nodeData = [{ id: 'a' }, { id: 'b' }];
element.edgeData = [{ source: 'a', target: 'b' }];
```

## Loading from URL

Load graph data from a remote JSON file:

```typescript
await graph.loadFromUrl('https://example.com/graph.json');
```

The JSON file should contain `nodes` and `edges` arrays:

```json
{
  "nodes": [
    { "id": "node1", "label": "First" },
    { "id": "node2", "label": "Second" }
  ],
  "edges": [
    { "source": "node1", "target": "node2" }
  ]
}
```

## Loading from File

Load from a user-uploaded file:

```typescript
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  await graph.loadFromFile(file);
});
```

## Supported Formats

| Format | Extension | Description |
|--------|-----------|-------------|
| JSON | `.json` | Native format with nodes/edges arrays |
| GraphML | `.graphml` | XML-based graph format |
| GEXF | `.gexf` | Gephi exchange format |
| GML | `.gml` | Graph Modeling Language |
| DOT | `.dot` | Graphviz format |
| CSV | `.csv` | Comma-separated adjacency |
| Pajek | `.net` | Pajek network format |

### JSON Format (Native)

```json
{
  "nodes": [
    { "id": "a", "label": "Node A", "category": "type1" },
    { "id": "b", "label": "Node B", "category": "type2" }
  ],
  "edges": [
    { "source": "a", "target": "b", "weight": 1.5 }
  ]
}
```

### GraphML Format

```xml
<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns">
  <graph id="G" edgedefault="directed">
    <node id="n0"/>
    <node id="n1"/>
    <edge source="n0" target="n1"/>
  </graph>
</graphml>
```

### CSV Format

Simple edge list:

```csv
source,target,weight
a,b,1.0
b,c,2.0
c,a,1.5
```

## Custom ID Paths

When your data uses different property names:

```typescript
// Data uses 'nodeId', 'from', and 'to' instead of 'id', 'source', 'target'
await graph.loadFromUrl('https://example.com/data.json', {
  nodeIdPath: 'nodeId',
  edgeSrcIdPath: 'from',
  edgeDstIdPath: 'to'
});
```

Example data:

```json
{
  "nodes": [
    { "nodeId": "a", "name": "First" },
    { "nodeId": "b", "name": "Second" }
  ],
  "edges": [
    { "from": "a", "to": "b" }
  ]
}
```

## Incremental Loading

Add data without replacing existing nodes:

```typescript
// Initial load
await graph.addNodes([{ id: 'a' }]);
await graph.addEdges([]);

// Later, add more data
await graph.addNodes([{ id: 'b' }, { id: 'c' }]);
await graph.addEdges([
  { source: 'a', target: 'b' },
  { source: 'b', target: 'c' }
]);
```

## Clearing Data

Remove all nodes and edges:

```typescript
await graph.clear();
```

## Data Validation

Graphty validates data using Zod schemas. Invalid data will throw descriptive errors:

```typescript
try {
  await graph.addNodes([{ /* missing id */ }]);
} catch (error) {
  console.error('Invalid node data:', error.message);
}
```

## Node Data Structure

Nodes require an `id` property. All other properties are optional:

```typescript
interface NodeData {
  id: string | number;      // Required, unique identifier
  label?: string;           // Display label
  category?: string;        // For styling/grouping
  x?: number;               // Position (for fixed layout)
  y?: number;
  z?: number;
  [key: string]: any;       // Any additional properties
}
```

## Edge Data Structure

Edges require `source` and `target` properties:

```typescript
interface EdgeData {
  source: string | number;  // Source node ID
  target: string | number;  // Target node ID
  id?: string;              // Optional unique identifier
  weight?: number;          // Edge weight
  label?: string;           // Display label
  [key: string]: any;       // Any additional properties
}
```

## Large Dataset Tips

1. **Batch loading**: Load nodes before edges
2. **Progressive loading**: Load in chunks for very large graphs
3. **Simplify data**: Only include properties you need
4. **Pre-compute positions**: Use fixed layout for huge graphs

```typescript
// Load in batches
const BATCH_SIZE = 1000;
for (let i = 0; i < nodes.length; i += BATCH_SIZE) {
  await graph.addNodes(nodes.slice(i, i + BATCH_SIZE));
}
```

## Custom Data Sources

Create your own data source handlers. See [Custom Data Sources](./extending/custom-data-sources) for details.

## Interactive Examples

- [Data Loading](https://graphty-org.github.io/graphty-element/storybook/?path=/story/data--default)
