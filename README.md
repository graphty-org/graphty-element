# Graphty

[![CI/CD](https://github.com/graphty-org/graphty-element/actions/workflows/ci.yml/badge.svg)](https://github.com/graphty-org/graphty-element/actions/workflows/ci.yml)
<a href="https://graphty-org.github.io/graphty-element" target="_blank"><img
src="https://raw.githubusercontent.com/storybooks/brand/master/badge/badge-storybook.svg"></a>
[![Coverage
Status](https://coveralls.io/repos/github/graphty-org/graphty-element/badge.svg?branch=master)](https://coveralls.io/github/graphty-org/graphty-element?branch=master)

> **[View Live Examples in Storybook →](https://graphty-org.github.io/graphty-element)**

A high-performance Web Component library for interactive 3D and 2D graph visualization, built with TypeScript, Lit, and Babylon.js.

## Overview

Graphty provides a powerful `<graphty-element>` Web Component that renders network graphs with rich styling options, multiple layout algorithms, and interactive features. It's designed for visualizing complex relationships in data, from small networks to large-scale graphs with thousands of nodes and edges.

### Key Features

- **3D and 2D Rendering**: Full 3D graph visualization with camera controls, or simplified 2D mode
- **Multiple Layout Algorithms**: Force-directed, circular, hierarchical, and more
- **Rich Styling System**: CSS-like styling with layers, selectors, and dynamic properties
- **Interactive**: Node dragging, hover effects, selection, and custom behaviors
- **Extensible**: Plugin architecture for custom layouts, algorithms, and data sources
- **Performance Optimized**: Mesh instancing, lazy updates, and chunked data loading
- **TypeScript First**: Full type safety and excellent IDE support

## Installation

```bash
npm install graphty-element
```

## Quick Start

### Using the Web Component

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import 'graphty-element';
  </script>
</head>
<body>
  <graphty-element
    width="800"
    height="600"
    graph='{"nodes": [{"id": "1"}, {"id": "2"}], "edges": [{"source": "1", "target": "2"}]}'
  ></graphty-element>
</body>
</html>
```

### Using with JavaScript

```javascript
import 'graphty-element';

const graphElement = document.createElement('graphty-element');
graphElement.width = 800;
graphElement.height = 600;
graphElement.graph = {
  nodes: [
    { id: '1', label: 'Node 1' },
    { id: '2', label: 'Node 2' },
    { id: '3', label: 'Node 3' }
  ],
  edges: [
    { source: '1', target: '2' },
    { source: '2', target: '3' }
  ]
};
document.body.appendChild(graphElement);
```

### Using the Graph Class Directly

For more control, you can use the Graph class directly:

```javascript
import { Graph } from 'graphty-element';

const canvas = document.getElementById('myCanvas');
const graph = new Graph(canvas, {
  width: 800,
  height: 600,
  layout: 'force-directed',
  styles: [
    {
      selector: 'node',
      style: {
        color: '#4A90E2',
        size: 20,
        shape: 'sphere'
      }
    }
  ]
});

graph.setGraph({
  nodes: [/* ... */],
  edges: [/* ... */]
});
```

## Configuration

### Layout Options

Graphty supports multiple layout algorithms:

- **`force-directed`** (default): Physics-based layout that simulates forces between nodes
  - Engine options: `d3` (default) or `ngraph`
  - Configurable parameters: `strength`, `distance`, `iterations`
- **`circular`**: Arranges nodes in a circle
- **`random`**: Random positioning
- **`hierarchical`**: Tree-like layout for directed graphs
- **`preset`**: Use predetermined node positions

```javascript
graphElement.layout = 'force-directed';
graphElement.layoutSettings = {
  engine: 'd3',
  strength: -30,
  distance: 100
};
```

### Algorithms

Built-in graph algorithms:

- **Shortest Path**: Find shortest path between nodes
- **Connected Components**: Identify graph components
- **Degree Centrality**: Calculate node importance
- **Community Detection**: Find node clusters

```javascript
const algorithms = graphElement.getGraphInstance().getAlgorithms();
const path = algorithms.shortestPath('node1', 'node2');
```

### Styling

Graphty uses a CSS-like styling system with layers and selectors:

```javascript
graphElement.styles = [
  {
    selector: 'node',
    style: {
      color: '#4A90E2',
      size: 20,
      shape: 'sphere',
      opacity: 0.8
    }
  },
  {
    selector: 'node[group="important"]',
    style: {
      color: '#E74C3C',
      size: 30,
      shape: 'box'
    }
  },
  {
    selector: 'edge',
    style: {
      color: '#95A5A6',
      width: 2,
      opacity: 0.6
    }
  }
];
```

#### Available Node Properties
- `color`: Hex color or CSS color name
- `size`: Number (diameter in pixels)
- `shape`: `sphere`, `box`, `cylinder`, `cone`, `torus`
- `opacity`: 0-1
- `label`: Text label
- `icon`: URL or emoji
- `visible`: Boolean

#### Available Edge Properties
- `color`: Hex color or CSS color name
- `width`: Line thickness
- `opacity`: 0-1
- `style`: `solid`, `dashed`, `dotted`
- `arrow`: Boolean or `{ size: number }`
- `visible`: Boolean

### Camera and Controls

```javascript
// Switch between 3D and 2D modes
graphElement.dimensions = '2D'; // or '3D'

// Camera controls
const graph = graphElement.getGraphInstance();
graph.focusNode('nodeId');
graph.fitToView();
graph.resetCamera();
```

### Events

```javascript
graphElement.addEventListener('node-click', (event) => {
  console.log('Clicked node:', event.detail.node);
});

graphElement.addEventListener('node-hover', (event) => {
  console.log('Hovering over:', event.detail.node);
});

graphElement.addEventListener('layout-complete', () => {
  console.log('Layout calculation finished');
});
```

## API Reference

### graphty-element Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `graph` | `GraphData` | `{}` | Graph data with nodes and edges |
| `width` | `number` | `800` | Canvas width in pixels |
| `height` | `number` | `600` | Canvas height in pixels |
| `layout` | `string` | `'force-directed'` | Layout algorithm name |
| `layoutSettings` | `object` | `{}` | Layout-specific settings |
| `styles` | `StyleLayer[]` | `[]` | Styling rules |
| `dimensions` | `'2D' \| '3D'` | `'3D'` | Rendering mode |
| `enablePicking` | `boolean` | `true` | Enable mouse interactions |

### Graph Class Methods

| Method | Description |
|--------|-------------|
| `setGraph(data)` | Load new graph data |
| `updateGraph(data)` | Merge with existing graph |
| `addNode(node)` | Add a single node |
| `addEdge(edge)` | Add a single edge |
| `removeNode(id)` | Remove a node |
| `removeEdge(id)` | Remove an edge |
| `focusNode(id)` | Center camera on node |
| `fitToView()` | Fit all nodes in view |
| `getAlgorithms()` | Get algorithm utilities |
| `dispose()` | Clean up resources |

## Advanced Usage

### Custom Layouts

Register custom layout algorithms:

```javascript
import { LayoutEngine, registerLayout } from 'graphty-element';

class MyCustomLayout extends LayoutEngine {
  async calculate(nodes, edges) {
    // Your layout logic here
    return { nodes: updatedNodes };
  }
}

registerLayout('my-layout', MyCustomLayout);
```

### Data Sources

Load data from external sources:

```javascript
import { DataSource, registerDataSource } from 'graphty-element';

class MyDataSource extends DataSource {
  async *generate() {
    yield { nodes: [...], edges: [...] };
  }
}

registerDataSource('my-source', MyDataSource);

// Use it
graphElement.dataSource = 'my-source';
graphElement.dataSourceSettings = { /* ... */ };
```

## Examples

For more examples and interactive demos, visit our [Storybook documentation](https://graphty-org.github.io/graphty-element).

## Browser Support

Graphty works in all modern browsers that support Web Components:
- Chrome/Edge 88+
- Firefox 78+
- Safari 14+

## License

MIT

Inspired by [three-forcegraph](https://github.com/vasturiano/three-forcegraph).
