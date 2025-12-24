# JavaScript API Reference

Complete API reference for the `Graph` class.

## Overview

The `Graph` class is the core orchestrator for programmatic graph manipulation. Access it via the `.graph` property on the Web Component:

```typescript
const element = document.querySelector('graphty-element');
const graph = element.graph;
```

::: tip
For usage patterns and examples, see the [JavaScript API Guide](/guide/javascript-api).
:::

## Core Methods

### Data Management

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `addNodes(nodes)` | `NodeData[]` | `Promise<void>` | Add nodes to the graph |
| `addEdges(edges)` | `EdgeData[]` | `Promise<void>` | Add edges to the graph |
| `removeNodes(ids)` | `string[]` | `Promise<void>` | Remove nodes by ID |
| `updateNodes(updates)` | `NodeUpdate[]` | `Promise<void>` | Update node properties |
| `getNode(id)` | `string` | `Node \| undefined` | Get node by ID |
| `getNodes()` | - | `Node[]` | Get all nodes |
| `getEdges()` | - | `Edge[]` | Get all edges |
| `clear()` | - | `Promise<void>` | Remove all data |

### Selection

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `selectNode(id)` | `string` | `void` | Select a node |
| `deselectNode()` | - | `void` | Clear selection |
| `getSelectedNode()` | - | `Node \| null` | Get selected node |

### Layout

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `setLayout(type, options?)` | `string`, `object` | `void` | Set layout algorithm |
| `waitForSettled()` | - | `Promise<void>` | Wait for layout to stabilize |
| `isSettled()` | - | `boolean` | Check if layout is stable |

### Algorithms

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `runAlgorithm(namespace, type)` | `string`, `string` | `Promise<AlgorithmResult>` | Run an algorithm |
| `applySuggestedStyles(id)` | `string` | `void` | Apply algorithm visualization |

### Camera Control

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `zoomToFit()` | - | `void` | Fit all nodes in view |
| `getCameraState()` | - | `CameraState` | Get camera state |
| `setCameraState(state, options?)` | `CameraState`, `CameraAnimationOptions` | `Promise<void>` | Set camera state |
| `setCameraPosition(pos)` | `{x, y, z}` | `void` | Set camera position |
| `setCameraTarget(target)` | `{x, y, z}` | `void` | Set camera target |

### Styling

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `addStyleLayer(layer)` | `StyleLayer` | `void` | Add a style layer |
| `removeStyleLayer(id)` | `string` | `void` | Remove a style layer |
| `clearStyleLayers()` | - | `void` | Remove all style layers |

### Events

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `on(event, handler)` | `string`, `Function` | `void` | Subscribe to events |
| `off(event, handler)` | `string`, `Function` | `void` | Unsubscribe from events |

### Batch Operations

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `batchOperations(fn)` | `async Function` | `Promise<void>` | Batch multiple operations |

## Manager Classes

The Graph class exposes manager instances for advanced control:

### StyleManager

```typescript
graph.styleManager.addLayer({ selector: '*', styles: { node: { color: '#ff0000' } } });
graph.styleManager.removeLayer(layerId);
graph.styleManager.clearLayers();
```

### DataManager

```typescript
await graph.dataManager.loadFromUrl(url);
await graph.dataManager.addNodes(nodes);
await graph.dataManager.clear();
```

### LayoutManager

```typescript
graph.layoutManager.setLayout('ngraph', options);
await graph.layoutManager.waitForSettled();
```

### AlgorithmManager

```typescript
await graph.algorithmManager.run('graphty', 'degree');
graph.algorithmManager.applySuggestedStyles('graphty:degree');
```

## Data Types

### NodeData

```typescript
interface NodeData {
  id: string;
  label?: string;
  [key: string]: unknown;
}
```

### EdgeData

```typescript
interface EdgeData {
  source: string;
  target: string;
  weight?: number;
  [key: string]: unknown;
}
```

### CameraState

```typescript
interface CameraState {
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  up: { x: number; y: number; z: number };
}
```

### StyleLayer

```typescript
interface StyleLayer {
  id?: string;
  selector: string;
  priority?: number;
  styles: {
    node?: NodeStyle;
    edge?: EdgeStyle;
    label?: LabelStyle;
  };
}
```

## Generated Reference

For complete type definitions and detailed API documentation:

- [Graph Class](/api/generated/Graph/classes/Graph.md) - Full TypeDoc reference
- [Node Class](/api/generated/Node/classes/Node.md) - Node type reference
- [Edge Class](/api/generated/Edge/classes/Edge.md) - Edge type reference
- [Managers](/api/generated/managers/) - Manager class references

## Extension Classes

For creating custom extensions:

- [LayoutEngine](/api/generated/layout/LayoutEngine/classes/LayoutEngine.md) - Custom layout base class
- [Algorithm](/api/generated/algorithms/Algorithm/classes/Algorithm.md) - Custom algorithm base class
- [DataSource](/api/generated/data/DataSource/classes/DataSource.md) - Custom data source base class

## Related

- [JavaScript API Guide](/guide/javascript-api) - Usage patterns and examples
- [Web Component API Reference](/api/web-component) - Declarative Web Component API
