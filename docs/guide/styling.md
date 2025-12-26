# Styling

Comprehensive guide to styling nodes, edges, and labels.

## Overview

Graphty uses a CSS-like layer-based styling system. Styles are applied through layers, with later layers overriding earlier ones. JMESPath selectors target specific elements.

## Style Templates

The quickest way to style your graph is with built-in templates:

```html
<graphty-element style-template="dark"></graphty-element>
```

Available templates:
- `dark` - Dark theme with light elements
- `light` - Light theme with dark elements

## Style Layers

Styles are organized in layers with priorities. Higher priority layers override lower ones:

```typescript
// Add a style layer
graph.styleManager.addLayer({
  selector: '*',          // Apply to all elements
  priority: 10,           // Higher = applied later
  styles: {
    node: {
      color: '#3498db',
      size: 1.0
    },
    edge: {
      line: { color: '#ffffff' }
    }
  }
});
```

### Layer Precedence

1. Default styles (priority 0)
2. Template styles (priority 5)
3. Custom layers (your priority)
4. Selection styles (priority 100)

## Selectors

Selectors use JMESPath syntax to target elements:

```typescript
// All elements
{ selector: '*' }

// Specific node by ID
{ selector: "[?id == 'node1']" }

// Nodes with a property value
{ selector: "[?category == 'important']" }

// Numeric comparison
{ selector: "[?weight > `5`]" }

// Multiple conditions (AND)
{ selector: "[?category == 'type-a' && weight > `3`]" }

// Based on algorithm results
{ selector: "[?algorithmResults.'graphty:degree' > `10`]" }
```

## Node Styles

### Available Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `color` | `string` | `'#ffffff'` | Node color (hex or CSS color) |
| `size` | `number` | `1.0` | Size multiplier |
| `shape` | `string` | `'sphere'` | Node shape |
| `opacity` | `number` | `1.0` | Transparency (0-1) |
| `texture` | `string` | `undefined` | Image URL for texture |
| `label` | `object` | `{}` | Label configuration |

### Node Shapes

Available shapes:
- `sphere` (default)
- `box`
- `cylinder`
- `cone`
- `torus`
- `tetrahedron`
- `octahedron`
- `icosahedron`
- `dodecahedron`

```typescript
graph.styleManager.addLayer({
  selector: "[?category == 'server']",
  styles: {
    node: {
      shape: 'box',
      color: '#2ecc71',
      size: 1.5
    }
  }
});
```

### Node Examples

```typescript
// Color by category
graph.styleManager.addLayer({
  selector: "[?category == 'primary']",
  styles: { node: { color: '#e74c3c' } }
});

graph.styleManager.addLayer({
  selector: "[?category == 'secondary']",
  styles: { node: { color: '#3498db' } }
});

// Size by importance
graph.styleManager.addLayer({
  selector: "[?importance == 'high']",
  styles: { node: { size: 2.0 } }
});
```

## Edge Styles

### Line Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `line.type` | `string` | `'solid'` | Line pattern |
| `line.width` | `number` | `0.5` | Line width |
| `line.color` | `string` | `'#ffffff'` | Line color |
| `line.opacity` | `number` | `1.0` | Transparency (0-1) |
| `line.bezier` | `boolean` | `false` | Curved edges |

### Line Types

- `solid` (default)
- `dash`
- `dot`
- `dash-dot`
- `zigzag`
- `sinewave`
- `star`
- `diamond`

### Arrow Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `arrowHead.type` | `string` | `'normal'` | Arrow head style |
| `arrowHead.size` | `number` | `1.0` | Size multiplier |
| `arrowHead.color` | `string` | `undefined` | Color (defaults to line color) |
| `arrowTail.type` | `string` | `'none'` | Arrow tail style |

### Arrow Types

- `none` - No arrow
- `normal` - Standard triangle
- `inverted` - Reversed triangle
- `vee` - Open triangle
- `diamond` - Diamond shape
- `box` - Square
- `dot` - Circle
- `sphere` - 3D sphere
- `tee` - T-shape
- `crow` - Crow's foot (for ER diagrams)
- `half-open` - Partial triangle

### Edge Examples

```typescript
// Dashed edges for weak connections
graph.styleManager.addLayer({
  selector: "[?weight < `0.5`]",
  styles: {
    edge: {
      line: { type: 'dash', opacity: 0.5 }
    }
  }
});

// Bidirectional arrows
graph.styleManager.addLayer({
  selector: "[?bidirectional == `true`]",
  styles: {
    edge: {
      arrowHead: { type: 'normal' },
      arrowTail: { type: 'normal' }
    }
  }
});

// Curved edges
graph.styleManager.addLayer({
  selector: '*',
  styles: {
    edge: {
      line: { bezier: true }
    }
  }
});
```

## Label Styles

### Label Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `text` | `string` | `undefined` | Label text |
| `fontSize` | `number` | `12` | Font size |
| `fontColor` | `string` | `'#ffffff'` | Text color |
| `position` | `string` | `'top'` | Position relative to node |
| `offset` | `object` | `{x:0,y:0,z:0}` | Position offset |

```typescript
graph.styleManager.addLayer({
  selector: '*',
  styles: {
    label: {
      text: (node) => node.label || node.id,
      fontSize: 14,
      fontColor: '#ffffff',
      position: 'top'
    }
  }
});
```

## Dynamic Styling

Use functions to compute styles dynamically:

```typescript
graph.styleManager.addLayer({
  selector: '*',
  styles: {
    node: {
      color: (node) => {
        const degree = node.algorithmResults['graphty:degree'] || 0;
        return degree > 5 ? '#e74c3c' : '#3498db';
      },
      size: (node) => {
        const degree = node.algorithmResults['graphty:degree'] || 0;
        return 0.5 + (degree * 0.1);
      }
    }
  }
});
```

## StyleManager API

```typescript
// Add a layer
const layerId = graph.styleManager.addLayer(layerConfig);

// Remove a layer
graph.styleManager.removeLayer(layerId);

// Clear all custom layers
graph.styleManager.clearLayers();

// Get computed style for a node
const nodeStyle = graph.styleManager.getNodeStyle(node);
const edgeStyle = graph.styleManager.getEdgeStyle(edge);
```

## Interactive Examples

- [Node Styles](https://graphty-org.github.io/graphty-element/storybook/?path=/story/styles-node--default)
- [Edge Styles](https://graphty-org.github.io/graphty-element/storybook/?path=/story/styles-edge--default)
- [Label Styles](https://graphty-org.github.io/graphty-element/storybook/?path=/story/styles-label--default)
- [All Node Shapes](https://graphty-org.github.io/graphty-element/storybook/?path=/story/styles-node--all-node-shapes)
- [Bezier Edges](https://graphty-org.github.io/graphty-element/storybook/?path=/story/styles-edge--bezier)
- [Bidirectional Arrows](https://graphty-org.github.io/graphty-element/storybook/?path=/story/styles-edge--bidirectional)
- [Layered Styles](https://graphty-org.github.io/graphty-element/storybook/?path=/story/styles-layered--two-layer-node-colors)
