# JavaScript API

Complete reference for programmatic control via the `Graph` class.

## Overview

The JavaScript API provides full programmatic control over graph visualizations through the `Graph` class. This is separate from the [Web Component API](./web-component), which provides declarative configuration via HTML attributes.

**Use the JavaScript API when you need:**
- Dynamic data manipulation (add/remove nodes at runtime)
- Algorithm execution and result handling
- Camera control and animation
- Custom style layers
- Screenshot and video capture
- Event-driven interactions

**Use the [Web Component API](./web-component) instead for:**
- Declarative HTML configuration
- Framework property binding
- Simple static graphs

## Accessing the Graph Instance

The `Graph` class is accessed via the `.graph` property on the `<graphty-element>`:

```typescript
const element = document.querySelector('graphty-element');
const graph = element.graph;
```

For TypeScript with proper typing:

```typescript
import type { Graph, Graphty } from '@graphty/graphty-element';

const element = document.querySelector('graphty-element') as Graphty;
const graph: Graph = element.graph;
```

::: tip
The Web Component handles initialization. Access `.graph` after the element is connected to the DOM, or use the `graph-ready` event.
:::

## Core Methods

### Data Management

**Adding Nodes:**

```typescript
// Add single node
await graph.addNode({ id: 'node1', label: 'First' });

// Add multiple nodes
await graph.addNodes([
  { id: 'node1', label: 'First' },
  { id: 'node2', label: 'Second' }
]);
```

**Adding Edges:**

```typescript
// Add single edge
await graph.addEdge({ source: 'node1', target: 'node2' });

// Add multiple edges
await graph.addEdges([
  { source: 'node1', target: 'node2', weight: 1.5 },
  { source: 'node2', target: 'node3' }
]);
```

**Removing Elements:**

```typescript
// Remove nodes (edges are removed automatically)
await graph.removeNodes(['node1']);
await graph.removeNodes(['node1', 'node2']);
```

**Bulk Data Loading:**

```typescript
// Load nodes and edges in one call
graph.setData({
  nodes: [
    { id: 'node1', label: 'First' },
    { id: 'node2', label: 'Second' }
  ],
  edges: [
    { source: 'node1', target: 'node2' }
  ]
});
```

**Updating Data:**

```typescript
// Update node properties
await graph.updateNodes([{ id: 'node1', label: 'Updated Label' }]);

// Update multiple nodes
await graph.updateNodes([
  { id: 'node1', label: 'Updated 1' },
  { id: 'node2', label: 'Updated 2' }
]);
```

**Accessing Data:**

```typescript
// Get a single node by ID
const node = graph.getNode('node1');

// Get all nodes
const allNodes = graph.getNodes();

// Get a single edge
const edge = graph.getEdge('node1', 'node2');

// Get all edges
const allEdges = graph.getEdges();

// Get counts
const nodeCount = graph.getNodeCount();
const edgeCount = graph.getEdgeCount();
```

### Selection

```typescript
// Select a node
graph.selectNode('node1');

// Deselect
graph.deselectNode();

// Get currently selected node
const selected = graph.getSelectedNode();
if (selected) {
  console.log('Selected:', selected.id);
}
```

### Layout Control

```typescript
// Set layout algorithm
graph.setLayout('ngraph');

// With options
graph.setLayout('ngraph', {
  springLength: 100,
  springCoefficient: 0.0008,
  gravity: -1.2,
  dimensions: 3
});

// Wait for layout to finish
await graph.waitForSettled();
```

### Algorithms

```typescript
// Run an algorithm
await graph.runAlgorithm('graphty', 'degree');

// Apply visualization from algorithm results
graph.applySuggestedStyles('graphty:degree');

// Access results on individual nodes
const node = graph.getNode('node1');
const degree = node.algorithmResults['graphty:degree'];
```

### Camera Control

```typescript
// Fit all nodes in view
graph.zoomToFit();

// Get current camera state
const state = graph.getCameraState();
// { position: {x, y, z}, target: {x, y, z}, up: {x, y, z} }

// Set camera position
graph.setCameraPosition({ x: 0, y: 0, z: 100 });
graph.setCameraTarget({ x: 0, y: 0, z: 0 });

// Animate camera
graph.setCameraState(newState, {
  animate: true,
  duration: 1000
});
```

### Managers

Access internal managers for advanced control:

```typescript
// Data management
const dataManager = graph.getDataManager();

// Layout control
const layoutManager = graph.getLayoutManager();

// Style management
const styleManager = graph.getStyleManager();

// Event handling
const eventManager = graph.getEventManager();

// Selection state
const selectionManager = graph.getSelectionManager();

// Performance statistics
const statsManager = graph.getStatsManager();
```

### Screenshot and Video Capture

```typescript
// Take a screenshot
const result = await graph.takeScreenshot({
  width: 1920,
  height: 1080,
  quality: 'high'
});

// Copy to clipboard
await graph.takeScreenshot({ copyToClipboard: true });

// Capture video animation
const video = await graph.captureVideo({
  duration: 5000,
  fps: 30
});
```

### AI Control

Enable AI-powered natural language commands:

```typescript
import type { AiManagerConfig } from '@graphty/graphty-element';

// Enable AI control
await graph.enableAiControl({
  provider: 'anthropic',
  apiKey: 'your-api-key'
});

// Execute natural language commands
const result = await graph.aiCommand('Select the node with the highest degree');

// Check AI status
const status = graph.getAiStatus();

// Listen for status changes
const unsubscribe = graph.onAiStatusChange((status) => {
  console.log('AI status:', status.stage);
});

// Disable AI control
graph.disableAiControl();
```

### Voice Input

Enable voice commands:

```typescript
// Get voice adapter
const voiceAdapter = graph.getVoiceAdapter();

// Start listening
const started = graph.startVoiceInput({
  language: 'en-US',
  continuous: false
});

// Check if active
if (graph.isVoiceActive()) {
  console.log('Listening...');
}

// Stop listening
graph.stopVoiceInput();
```

## Async Operations

Graph operations are queued and executed in order. Use `await` for operations that need to complete before continuing:

```typescript
// These execute in order
await graph.addNodes(nodes);
await graph.addEdges(edges);
await graph.waitForSettled();
graph.zoomToFit();
```

## Batch Operations

For bulk updates, use batch operations to prevent intermediate renders:

```typescript
await graph.batchOperations(async () => {
  await graph.addNodes(manyNodes);
  await graph.addEdges(manyEdges);
  // Layout runs once at the end
});
```

## Event Handling

Subscribe to events using `on()`:

```typescript
// Graph events
graph.on('graph-settled', () => {
  console.log('Layout complete!');
  graph.zoomToFit();
});

// Node events
graph.on('node-click', ({ node }) => {
  console.log('Clicked:', node.id);
  graph.selectNode(node.id);
});

graph.on('node-hover', ({ node }) => {
  console.log('Hovering:', node.id);
});

// Data events
graph.on('data-loaded', ({ nodeCount, edgeCount }) => {
  console.log(`Loaded ${nodeCount} nodes, ${edgeCount} edges`);
});
```

**Removing Listeners:**

```typescript
const handler = () => console.log('Settled');
graph.on('graph-settled', handler);

// Later, remove the listener
graph.off('graph-settled', handler);
```

## Complete Example

```typescript
import '@graphty/graphty-element';
import type { Graph, Graphty } from '@graphty/graphty-element';

async function initGraph() {
  const element = document.querySelector('graphty-element') as Graphty;
  const graph: Graph = element.graph;

  // Load data
  await graph.addNodes([
    { id: 'a', label: 'Node A' },
    { id: 'b', label: 'Node B' },
    { id: 'c', label: 'Node C' }
  ]);

  await graph.addEdges([
    { source: 'a', target: 'b' },
    { source: 'b', target: 'c' },
    { source: 'c', target: 'a' }
  ]);

  // Wait for layout to stabilize
  await graph.waitForSettled();

  // Run algorithm
  await graph.runAlgorithm('graphty', 'degree');
  graph.applySuggestedStyles('graphty:degree');

  // Fit view
  graph.zoomToFit();

  // Set up interaction
  graph.on('node-click', ({ node }) => {
    console.log(`Clicked ${node.id} (degree: ${node.algorithmResults['graphty:degree']})`);
    graph.selectNode(node.id);
  });
}

initGraph();
```

## Related Guides

- [Web Component API](./web-component) - Declarative configuration via HTML attributes
- [Styling](./styling) - Style layers and selectors
- [Algorithms](./algorithms) - Available graph algorithms
- [Camera](./camera) - Camera control and animation
- [Events](./events) - Complete event reference

## Interactive Examples

- [Data Loading](https://graphty-org.github.io/graphty-element/storybook/?path=/story/data--basic) - Data management
- [Selection](https://graphty-org.github.io/graphty-element/storybook/?path=/story/selection--mode-3-d) - Selection handling
- [Algorithms](https://graphty-org.github.io/graphty-element/storybook/?path=/story/algorithms-centrality--degree-centrality) - Algorithm execution
- [Camera](https://graphty-org.github.io/graphty-element/storybook/?path=/story/camera-controls--three-d) - Camera control
