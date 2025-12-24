# Getting Started

Get from zero to a working graph visualization in 5 minutes.

## What is Graphty?

Graphty is a Web Component library for creating interactive 3D and 2D graph visualizations. Built with [Lit](https://lit.dev/) and [Babylon.js](https://www.babylonjs.com/), it provides:

- High-performance 3D rendering with WebGL/WebGPU
- Multiple layout algorithms (force-directed, hierarchical, circular, etc.)
- Rich styling system with CSS-like selectors
- Graph algorithms (centrality, community detection, shortest path, etc.)
- VR/AR support via WebXR
- Extensible plugin architecture

## Quick Start

The fastest way to see Graphty in action:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My First Graph</title>
  <style>
    graphty-element {
      width: 800px;
      height: 600px;
      display: block;
    }
  </style>
</head>
<body>
  <script type="module">
    import '@graphty/graphty-element';
  </script>

  <graphty-element
    node-data='[{"id": "a"}, {"id": "b"}]'
    edge-data='[{"source": "a", "target": "b"}]'>
  </graphty-element>
</body>
</html>
```

## Your First Graph

Let's build a simple social network visualization step by step.

### Step 1: Set Up the Component

First, include the Graphty element and give it dimensions:

```html
<graphty-element style="width: 100%; height: 500px; display: block;">
</graphty-element>
```

### Step 2: Add Nodes

Define the people in your network:

```html
<graphty-element
  node-data='[
    {"id": "alice", "name": "Alice"},
    {"id": "bob", "name": "Bob"},
    {"id": "charlie", "name": "Charlie"}
  ]'>
</graphty-element>
```

### Step 3: Add Edges

Connect them with relationships:

```html
<graphty-element
  node-data='[
    {"id": "alice", "name": "Alice"},
    {"id": "bob", "name": "Bob"},
    {"id": "charlie", "name": "Charlie"}
  ]'
  edge-data='[
    {"source": "alice", "target": "bob"},
    {"source": "bob", "target": "charlie"},
    {"source": "charlie", "target": "alice"}
  ]'>
</graphty-element>
```

### Step 4: Choose a Layout

Select how nodes are positioned:

```html
<graphty-element
  layout="ngraph"
  node-data='[...]'
  edge-data='[...]'>
</graphty-element>
```

Available layouts include:
- `ngraph` - Force-directed (default, works in 2D and 3D)
- `d3-force` - D3's force simulation (2D)
- `circular` - Nodes in a circle
- `hierarchical` - Tree-like structure
- `grid` - Regular grid pattern

### Step 5: Apply Styling

Use a style template for a polished look:

```html
<graphty-element
  layout="ngraph"
  style-template="dark"
  node-data='[...]'
  edge-data='[...]'>
</graphty-element>
```

## Interactive Examples

See these concepts in action:

- [Default Graph](https://graphty-org.github.io/graphty-element/storybook/?path=/story/graphty--default) - Basic graph visualization
- [Data Loading](https://graphty-org.github.io/graphty-element/storybook/?path=/story/data--default) - Loading data from various sources

## What's Next?

Now that you have a basic graph working, explore:

- [Installation](./installation) - Detailed installation options for different environments
- [Styling](./styling) - Customize colors, shapes, and labels
- [Layouts](./layouts) - Configure layout algorithms
- [Algorithms](./algorithms) - Run graph algorithms and visualize results
