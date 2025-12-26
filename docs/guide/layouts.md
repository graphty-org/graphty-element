# Layouts

Guide to available layout algorithms and configuration.

## Overview

Layout algorithms determine how nodes are positioned in the visualization. Choose the right layout based on your graph's structure and what you want to communicate.

## Available Layouts

| Layout | Type | Best For | Dimensions |
|--------|------|----------|------------|
| `ngraph` | Force-directed | General graphs | 2D/3D |
| `d3-force` | Force-directed | Web-standard | 2D |
| `circular` | Geometric | Cycles, small graphs | 2D/3D |
| `grid` | Geometric | Regular structures | 2D/3D |
| `hierarchical` | Layered | Trees, DAGs | 2D/3D |
| `random` | Random | Testing, initial state | 2D/3D |
| `fixed` | Manual | Pre-computed positions | 2D/3D |

## Setting a Layout

### Via HTML Attribute

```html
<graphty-element layout="ngraph"></graphty-element>
<graphty-element layout="circular"></graphty-element>
```

### Via JavaScript

```typescript
// Simple layout change
graph.setLayout('circular');

// With configuration options
graph.setLayout('ngraph', {
  springLength: 100,
  springCoefficient: 0.0008,
  gravity: -1.2,
  dimensions: 3
});
```

## Layout Descriptions

### ngraph (Force-Directed)

The default layout. Uses physics simulation where:
- Edges act like springs pulling connected nodes together
- Nodes repel each other to prevent overlap
- Works well for most general graphs

```typescript
graph.setLayout('ngraph', {
  springLength: 100,        // Ideal edge length
  springCoefficient: 0.0008, // Spring stiffness
  gravity: -1.2,            // Global attraction/repulsion
  dimensions: 3,            // 2 or 3
  dragCoefficient: 0.02,    // Damping
  theta: 0.8                // Barnes-Hut approximation
});
```

### d3-force (Force-Directed)

D3's force simulation. Industry-standard for web visualizations:

```typescript
graph.setLayout('d3-force', {
  strength: -30,           // Node repulsion
  distance: 50,            // Link distance
  iterations: 300          // Simulation steps
});
```

### circular

Arranges nodes in a circle. Good for:
- Small graphs
- Cycle detection
- Ring topologies

```typescript
graph.setLayout('circular', {
  radius: 100,            // Circle radius
  startAngle: 0,          // Starting angle (radians)
  endAngle: Math.PI * 2   // Ending angle
});
```

### grid

Arranges nodes in a regular grid:

```typescript
graph.setLayout('grid', {
  columns: 5,             // Number of columns
  spacing: 10             // Space between nodes
});
```

### hierarchical

Tree-like layout for directed graphs:

```typescript
graph.setLayout('hierarchical', {
  direction: 'TB',        // TB, BT, LR, RL
  levelSeparation: 100,   // Vertical spacing
  nodeSeparation: 50      // Horizontal spacing
});
```

### random

Random positions. Useful for:
- Testing
- Initial state before force layout
- Deliberate chaos visualization

```typescript
graph.setLayout('random', {
  seed: 42,               // For reproducible layouts
  dimensions: 3
});
```

### fixed

Use pre-computed positions from node data:

```typescript
// Node data includes positions
const nodes = [
  { id: 'a', x: 0, y: 0, z: 0 },
  { id: 'b', x: 100, y: 0, z: 0 },
  { id: 'c', x: 50, y: 100, z: 0 }
];

await graph.addNodes(nodes);
graph.setLayout('fixed');
```

## Layout Transitions

Animate between layouts for smooth visual transitions:

```typescript
// Current layout
graph.setLayout('random');
await graph.waitForSettled();

// Transition to new layout
graph.setLayout('circular', {}, {
  animate: true,
  duration: 1000
});
```

## Waiting for Settled

Force-directed layouts converge over time. Wait for stabilization:

```typescript
graph.setLayout('ngraph');

// Wait for physics to settle
await graph.waitForSettled();

// Now safe to zoom to fit
graph.zoomToFit();
```

You can also listen to the event:

```typescript
graph.on('graph-settled', () => {
  console.log('Layout complete');
  graph.zoomToFit();
});
```

## 2D vs 3D

Most layouts support both dimensions:

```typescript
// 3D layout (default)
graph.setLayout('ngraph', { dimensions: 3 });

// 2D layout
graph.setLayout('ngraph', { dimensions: 2 });
```

For 2D layouts, also set the view mode:

```html
<graphty-element layout="d3-force" view-mode="2d"></graphty-element>
```

## Performance Tips

1. **Large graphs**: Use Barnes-Hut approximation (ngraph with default theta)
2. **Initial state**: Start with random layout, then switch to force-directed
3. **Fixed data**: Pre-compute positions and use `fixed` layout
4. **Incremental updates**: Add nodes in batches, not one at a time

## Custom Layouts

Create your own layout algorithms. See [Custom Layouts](./extending/custom-layouts) for details.

## Interactive Examples

- [3D Layouts](https://graphty-org.github.io/graphty-element/storybook/?path=/story/layout-3d--circular)
- [2D Layouts](https://graphty-org.github.io/graphty-element/storybook/?path=/story/layout-2d--circular)
