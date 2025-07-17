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
npm install @graphty/graphty-element
```

### Peer Dependencies

This library requires the following peer dependencies:

```bash
npm install @babylonjs/core lit
```

**Important**: Both dependencies must be installed for the library to work. The package will not function without them.

### Package Details

- **Package name**: `@graphty/graphty-element`
- **Main entry**: ES module that auto-registers the `<graphty-element>` custom element
- **Exports**: 
  - Default: Auto-registers the web component when imported
  - Named exports: `Graph`, `LayoutRegistry`, `DataSourceRegistry`, `LayoutEngine`, `DataSource`
- **TypeScript**: Full TypeScript support with included type definitions
- **Module format**: ES modules (ESM) and UMD
- **Side effects**: Importing the package registers the custom element globally

## Quick Start

### Minimal Complete Example

```bash
# Create a new project
mkdir my-graph-app && cd my-graph-app
npm init -y

# Install graphty and its peer dependencies
npm install @graphty/graphty-element @babylonjs/core lit

# If using TypeScript
npm install --save-dev typescript
```

Create `index.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; }
    graphty-element { width: 100vw; height: 100vh; display: block; }
  </style>
</head>
<body>
  <graphty-element id="graph"></graphty-element>
  <script type="module" src="./index.js"></script>
</body>
</html>
```

Create `index.js`:
```javascript
import '@graphty/graphty-element';

const graph = document.getElementById('graph');
graph.nodeData = [
  { id: 1, label: 'Node 1' },
  { id: 2, label: 'Node 2' },
  { id: 3, label: 'Node 3' }
];
graph.edgeData = [
  { src: 1, dst: 2 },
  { src: 2, dst: 3 },
  { src: 3, dst: 1 }
];
```

### Using in an npm-based Project

```javascript
// Import the library - this will register the custom element
import '@graphty/graphty-element';

// Now you can use <graphty-element> in your HTML
const graph = document.createElement('graphty-element');
graph.layout = 'ngraph';
graph.nodeData = [
  { id: 1, label: 'Node 1' },
  { id: 2, label: 'Node 2' },
  { id: 3, label: 'Node 3' }
];
graph.edgeData = [
  { src: 1, dst: 2 },
  { src: 2, dst: 3 }
];
document.body.appendChild(graph);
```

### Using in HTML (CDN)

For simple HTML usage without a build system, load the dependencies from CDN:

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Load dependencies first -->
  <script src="https://cdn.babylonjs.com/babylon.js"></script>
  <script type="module">
    import * as lit from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
    window.lit = lit;
  </script>
  
  <!-- Then load graphty -->
  <script type="module">
    import 'https://unpkg.com/@graphty/graphty-element@latest/dist/graphty.js';
  </script>
</head>
<body>
  <graphty-element
    layout="ngraph"
    node-data='[{"id": 1}, {"id": 2}, {"id": 3}]'
    edge-data='[{"src": 1, "dst": 2}, {"src": 2, "dst": 3}]'
    style="width: 100%; height: 600px;"
  ></graphty-element>
</body>
</html>
```

### Using with TypeScript

```typescript
import '@graphty/graphty-element';
import type { Graphty } from '@graphty/graphty-element';

// Get type-safe access to the element
const graph = document.querySelector<Graphty>('graphty-element');
if (graph) {
  graph.layout = 'circular';
  graph.nodeData = [
    { id: 1, label: 'Node 1', color: '#ff0000' },
    { id: 2, label: 'Node 2', color: '#00ff00' },
    { id: 3, label: 'Node 3', color: '#0000ff' }
  ];
}
```

### Using the Graph Class Directly

For more control, you can use the Graph class directly:

```javascript
import { Graph } from '@graphty/graphty-element';

// Create a container element
const container = document.getElementById('graph-container');
const graph = new Graph(container);

// Configure the graph
await graph.setLayout('ngraph');
await graph.setStyleTemplate({
  version: "1",
  layers: [
    {
      id: "base",
      selectors: [
        {
          selector: "node",
          style: {
            color: "#4A90E2",
            size: 20,
            shape: "sphere"
          }
        }
      ]
    }
  ]
});

// Add data
graph.addNodes([
  { id: 1, label: 'Node 1' },
  { id: 2, label: 'Node 2' },
  { id: 3, label: 'Node 3' }
]);
graph.addEdges([
  { src: 1, dst: 2 },
  { src: 2, dst: 3 }
]);

// Initialize the graph
await graph.init();
```

## Configuration

## Component Properties

### graphty-element Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `node-data` | `Array` | `[]` | Array of node objects |
| `edge-data` | `Array` | `[]` | Array of edge objects |
| `layout` | `string` | `'ngraph'` | Layout algorithm name |
| `layout-config` | `object` | `{}` | Layout-specific configuration |
| `layout-2d` | `boolean` | `false` | Enable 2D rendering mode |
| `style-template` | `object` | - | Style configuration object |
| `data-source` | `string` | - | Data source type (e.g., 'json') |
| `data-source-config` | `object` | - | Data source configuration |
| `node-id-path` | `string` | `'id'` | JMESPath to node ID field |
| `edge-src-id-path` | `string` | `'src'` | JMESPath to edge source field |
| `edge-dst-id-path` | `string` | `'dst'` | JMESPath to edge destination field |

### Layout Options

Graphty supports multiple layout algorithms:

- **`ngraph`** (default): High-performance force-directed layout
- **`d3-force`**: D3.js force-directed layout
- **`circular`**: Arranges nodes in a circle
- **`random`**: Random positioning
- **`spiral`**: Spiral arrangement
- **`spectral`**: Eigenvector-based layout
- **`kamada-kawai`**: Force-directed with ideal edge lengths

```javascript
graphElement.layout = 'ngraph';
graphElement.layoutConfig = {
  timeStep: 0.1,
  gravity: -1.2,
  theta: 0.8,
  dragCoefficient: 0.02
};
```

### Algorithms

Built-in graph algorithms:

- **Degree**: Calculate node degree (in/out connections)

```javascript
// Run degree algorithm
await graph.runAlgorithm('builtin', 'degree');
```

### Styling

Graphty uses a CSS-like styling system with layers and selectors:

```javascript
graphElement.styleTemplate = {
  version: "1",
  layers: [
    {
      id: "base",
      selectors: [
        {
          selector: "node",
          style: {
            color: "#4A90E2",
            size: 20,
            shape: "sphere",
            opacity: 0.8
          }
        },
        {
          selector: "node[group='important']",
          style: {
            color: "#E74C3C",
            size: 30,
            shape: "box"
          }
        },
        {
          selector: "edge",
          style: {
            color: "#95A5A6",
            width: 2,
            opacity: 0.6
          }
        }
      ]
    }
  ]
};
```

#### Available Node Properties
- `color`: Hex color or CSS color name
- `size`: Number (diameter in pixels)
- `shape`: `sphere`, `box`, `cylinder`, `disc`, `torus`, `polygon`
- `opacity`: 0-1
- `label`: Text label with rich text support
- `texture`: URL to texture image
- `visible`: Boolean

#### Available Edge Properties
- `color`: Hex color or CSS color name
- `width`: Line thickness
- `opacity`: 0-1
- `dashed`: Boolean for dashed lines
- `arrows`: Boolean or arrow configuration
- `visible`: Boolean

### Camera and Controls

```javascript
// Switch between 3D and 2D modes
graphElement.setAttribute('layout-2d', 'true');

// Camera controls with the Graph class
graph.zoomToFit();
```

### Events

```javascript
// Add event listeners via the Graph class
graph.addListener('node-clicked', (event) => {
  console.log('Clicked node:', event.nodeId);
});

graph.addListener('node-hovered', (event) => {
  console.log('Hovering over:', event.nodeId);
});

graph.addListener('graph-settled', () => {
  console.log('Layout calculation finished');
});
```

## API Reference

### Graph Class Methods

| Method | Description |
|--------|-------------|
| `addNode(node)` | Add a single node |
| `addNodes(nodes)` | Add multiple nodes |
| `addEdge(edge)` | Add a single edge |
| `addEdges(edges)` | Add multiple edges |
| `setLayout(type, config)` | Set layout algorithm |
| `setStyleTemplate(template)` | Set style configuration |
| `addDataFromSource(type, config)` | Load data from source |
| `runAlgorithm(namespace, type)` | Run graph algorithm |
| `zoomToFit()` | Fit all nodes in view |
| `init()` | Initialize the graph |
| `shutdown()` | Clean up resources |

## Advanced Usage

### Custom Layouts

Register custom layout algorithms:

```javascript
import { LayoutEngine, LayoutRegistry } from '@graphty/graphty-element';

class MyCustomLayout extends LayoutEngine {
  async step() {
    // Your layout logic here
    for (const [nodeId, position] of this.nodePositions) {
      // Update positions
    }
  }
}

LayoutRegistry.register('my-layout', MyCustomLayout);
```

### Data Sources

Load data from external sources:

```javascript
import { DataSource, DataSourceRegistry } from '@graphty/graphty-element';

class MyDataSource extends DataSource {
  async *generate() {
    yield { nodes: [...], edges: [...] };
  }
}

DataSourceRegistry.register('my-source', MyDataSource);

// Use it
graphElement.setAttribute('data-source', 'my-source');
graphElement.dataSourceConfig = { /* ... */ };
```

## Examples

### Complete Example with npm

```javascript
import '@graphty/graphty-element';

// Create the element
const graph = document.createElement('graphty-element');
graph.style.width = '100%';
graph.style.height = '600px';

// Configure style
graph.styleTemplate = {
  version: "1",
  layers: [{
    id: "base",
    selectors: [
      {
        selector: "node",
        style: {
          size: 20,
          color: "#007bff",
          label: "{data.label}"
        }
      },
      {
        selector: "edge",
        style: {
          width: 2,
          color: "#cccccc"
        }
      }
    ]
  }]
};

// Set layout
graph.layout = 'ngraph';

// Add data
graph.nodeData = [
  { id: 1, label: 'Node 1' },
  { id: 2, label: 'Node 2' },
  { id: 3, label: 'Node 3' },
  { id: 4, label: 'Node 4' }
];

graph.edgeData = [
  { src: 1, dst: 2 },
  { src: 2, dst: 3 },
  { src: 3, dst: 4 },
  { src: 4, dst: 1 }
];

// Add to page
document.body.appendChild(graph);
```

For more examples and interactive demos, visit our [Storybook documentation](https://graphty-org.github.io/graphty-element).

## Troubleshooting

### Common Issues

#### "Cannot find module '@babylonjs/core'" or "Cannot find module 'lit'"
Make sure you've installed the peer dependencies:
```bash
npm install @babylonjs/core lit
```

#### Bundle Size Considerations
- The library externalizes Babylon.js and Lit to avoid duplication
- Babylon.js core is approximately 3-4MB (1MB gzipped)
- Consider using a CDN for Babylon.js in production if bundle size is a concern

#### TypeScript Types
The package includes TypeScript definitions. If you're using TypeScript, you may need to add these to your `tsconfig.json`:
```json
{
  "compilerOptions": {
    "moduleResolution": "bundler", // or "node"
    "allowSyntheticDefaultImports": true
  }
}
```

### Using with Build Tools

#### Vite
No special configuration needed. Vite will handle the ES modules correctly.

#### Webpack
You may need to configure module resolution for ES modules:
```javascript
module.exports = {
  resolve: {
    extensions: ['.js', '.ts'],
    mainFields: ['module', 'main']
  }
};
```

#### Next.js
For Next.js apps, you may need to transpile the module:
```javascript
// next.config.js
module.exports = {
  transpilePackages: ['@graphty/graphty-element']
};
```

### Canvas Container Requirements
The graph requires a container element with defined dimensions:
```css
.graph-container {
  width: 100%;
  height: 600px; /* Must have explicit height */
  position: relative;
}
```

## Browser Support

Graphty works in all modern browsers that support Web Components:
- Chrome/Edge 88+
- Firefox 78+
- Safari 14+

## License

MIT

Inspired by [three-forcegraph](https://github.com/vasturiano/three-forcegraph).
