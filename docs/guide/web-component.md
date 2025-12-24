# Web Component API

Complete reference for using `<graphty-element>` declaratively via HTML attributes and properties.

## Overview

The `<graphty-element>` Web Component provides a declarative way to add graph visualizations to your page using HTML attributes and element properties.

**When to use the Web Component API:**
- Declarative HTML-based configuration
- Framework integration (React, Vue, Angular, Svelte)
- Simple graphs configured via attributes
- Reactive property binding

**When to use the [JavaScript API](./javascript-api) instead:**
- Programmatic graph manipulation (add/remove nodes dynamically)
- Running graph algorithms
- Camera control and animation
- Advanced styling with style layers
- Screenshot and video capture

## Properties and Attributes

All configuration is done through HTML attributes or their corresponding JavaScript properties:

| Property | Attribute | Type | Default | Description |
|----------|-----------|------|---------|-------------|
| `nodeData` | `node-data` | `Array<object>` | `[]` | Array of node objects |
| `edgeData` | `edge-data` | `Array<object>` | `[]` | Array of edge objects |
| `layout` | `layout` | `string` | `'ngraph'` | Layout algorithm name |
| `layoutConfig` | `layout-config` | `object` | `{}` | Layout algorithm options |
| `styleTemplate` | `style-template` | `string` | `undefined` | Built-in style template |
| `viewMode` | `view-mode` | `'2d' \| '3d' \| 'vr' \| 'ar'` | `'3d'` | Rendering mode |
| `dataSource` | `data-source` | `string` | `undefined` | Data source type |
| `dataSourceConfig` | `data-source-config` | `object` | `{}` | Data source configuration |
| `nodeIdPath` | `node-id-path` | `string` | `'id'` | Path to node ID in data |
| `edgeSrcIdPath` | `edge-src-id-path` | `string` | `'source'` | Path to source ID in edge data |
| `edgeDstIdPath` | `edge-dst-id-path` | `string` | `'target'` | Path to target ID in edge data |
| `debug` | `debug` | `boolean` | `false` | Enable debug overlay |

## Basic Usage

### Minimal Example

```html
<graphty-element
  node-data='[{"id": "a"}, {"id": "b"}, {"id": "c"}]'
  edge-data='[{"source": "a", "target": "b"}, {"source": "b", "target": "c"}]'>
</graphty-element>
```

### With Layout and Styling

```html
<graphty-element
  layout="circular"
  style-template="dark"
  node-data='[{"id": "a"}, {"id": "b"}, {"id": "c"}]'
  edge-data='[{"source": "a", "target": "b"}, {"source": "b", "target": "c"}]'>
</graphty-element>
```

## Data Format

### Node Data

Each node object must have an `id` property. Additional properties are available for styling:

```html
<graphty-element node-data='[
  {"id": "node1", "label": "First Node", "category": "type-a"},
  {"id": "node2", "label": "Second Node", "category": "type-b"},
  {"id": "node3", "label": "Third Node", "size": 2.0}
]'></graphty-element>
```

Common node properties:
- `id` (required) - Unique identifier
- `label` - Display text
- `category` / `type` / `group` - For style selectors
- `size` - Node size multiplier
- `color` - Node color (hex or named)

### Edge Data

Each edge object must have `source` and `target` properties referencing node IDs:

```html
<graphty-element edge-data='[
  {"source": "node1", "target": "node2"},
  {"source": "node2", "target": "node3", "weight": 1.5},
  {"source": "node3", "target": "node1", "label": "connects"}
]'></graphty-element>
```

Common edge properties:
- `source` (required) - Source node ID
- `target` (required) - Target node ID
- `weight` - Edge weight for layouts
- `label` - Display text
- `type` / `category` - For style selectors

## Attribute vs Property

### Attributes (HTML strings)

Set via HTML markup or `setAttribute()`. Always strings, require JSON serialization for objects:

```html
<graphty-element
  layout="ngraph"
  node-data='[{"id": "a"}, {"id": "b"}]'>
</graphty-element>
```

```javascript
element.setAttribute('node-data', JSON.stringify(nodes));
element.setAttribute('layout', 'circular');
```

### Properties (JavaScript values)

Set via JavaScript. Typed values, no JSON serialization needed:

```javascript
const element = document.querySelector('graphty-element');

element.nodeData = [{id: 'a'}, {id: 'b'}];
element.edgeData = [{source: 'a', target: 'b'}];
element.layout = 'circular';
element.viewMode = '2d';
```

**Properties are preferred** when working with JavaScript as they:
- Avoid JSON serialization overhead
- Preserve object types
- Enable reactive updates

## Layout Algorithms

Set the layout algorithm via the `layout` attribute:

```html
<graphty-element layout="ngraph"></graphty-element>
<graphty-element layout="circular"></graphty-element>
<graphty-element layout="hierarchical"></graphty-element>
<graphty-element layout="grid"></graphty-element>
<graphty-element layout="random"></graphty-element>
```

Available layouts:
- `ngraph` - Force-directed (default, 2D/3D)
- `d3-force` - D3's force simulation (2D)
- `circular` - Nodes arranged in a circle
- `hierarchical` - Tree-like structure
- `grid` - Regular grid pattern
- `random` - Random positions

Configure layout options:

```html
<graphty-element
  layout="ngraph"
  layout-config='{"springLength": 100, "gravity": -1.2}'>
</graphty-element>
```

```javascript
element.layoutConfig = {
  springLength: 100,
  springCoefficient: 0.0008,
  gravity: -1.2
};
```

## Style Templates

Apply built-in style templates:

```html
<graphty-element style-template="dark"></graphty-element>
<graphty-element style-template="light"></graphty-element>
```

## View Modes

Switch between rendering modes:

```html
<graphty-element view-mode="3d"></graphty-element>
<graphty-element view-mode="2d"></graphty-element>
```

```javascript
element.viewMode = '3d';
element.viewMode = '2d';
```

For VR/AR modes, see the [VR/AR Guide](./vr-ar).

## CSS Styling

The component **must have dimensions** to render. Set via CSS:

```css
graphty-element {
  display: block;
  width: 100%;
  height: 500px;
}
```

Or inline styles:

```html
<graphty-element style="display: block; width: 800px; height: 600px;">
</graphty-element>
```

## Events

Listen to graph events via standard DOM event handling:

```javascript
const element = document.querySelector('graphty-element');

element.addEventListener('graph-settled', (e) => {
  console.log('Layout complete');
});

element.addEventListener('node-click', (e) => {
  console.log('Clicked node:', e.detail.node.id);
});

element.addEventListener('data-loaded', (e) => {
  console.log(`Loaded ${e.detail.nodeCount} nodes`);
});
```

Common events:
- `graph-settled` - Layout has stabilized
- `data-loaded` - Data loading complete
- `node-click` - Node was clicked
- `node-hover` - Mouse entered a node
- `selection-changed` - Selected node changed

See [Events](./events) for the complete event reference.

## Framework Integration

### React

```tsx
function GraphComponent({ nodes, edges, layout = 'ngraph' }) {
  return (
    <graphty-element
      node-data={JSON.stringify(nodes)}
      edge-data={JSON.stringify(edges)}
      layout={layout}
      style={{ width: '100%', height: '500px', display: 'block' }}
    />
  );
}
```

### Vue

```vue
<template>
  <graphty-element
    :node-data="JSON.stringify(nodes)"
    :edge-data="JSON.stringify(edges)"
    :layout="layout"
    style="display: block; width: 100%; height: 500px;"
  />
</template>
```

### Angular

```typescript
@Component({
  template: `
    <graphty-element
      [attr.node-data]="nodesJson"
      [attr.edge-data]="edgesJson"
      [attr.layout]="layout">
    </graphty-element>
  `
})
export class GraphComponent {
  nodes = [{id: 'a'}, {id: 'b'}];
  edges = [{source: 'a', target: 'b'}];
  layout = 'ngraph';

  get nodesJson() { return JSON.stringify(this.nodes); }
  get edgesJson() { return JSON.stringify(this.edges); }
}
```

### Svelte

```svelte
<script>
  export let nodes = [];
  export let edges = [];
  export let layout = 'ngraph';
</script>

<graphty-element
  node-data={JSON.stringify(nodes)}
  edge-data={JSON.stringify(edges)}
  {layout}
  style="display: block; width: 100%; height: 500px;"
/>
```

## Data Sources

Load data from external sources:

```html
<!-- Load from URL -->
<graphty-element
  data-source="url"
  data-source-config='{"url": "https://example.com/graph.json"}'>
</graphty-element>
```

```javascript
element.dataSource = 'url';
element.dataSourceConfig = { url: 'https://example.com/graph.json' };
```

See [Data Sources](./data-sources) for available data source types.

## Need More Control?

The Web Component API covers declarative configuration. For programmatic operations like:

- Adding/removing nodes dynamically
- Running graph algorithms
- Camera control and animation
- Custom style layers
- Screenshot capture

See the **[JavaScript API Guide](./javascript-api)** which provides full programmatic access via the `Graph` class.

## Interactive Examples

- [Default Graph](https://graphty-org.github.io/graphty-element/storybook/?path=/story/graphty--default) - Basic configuration
- [View Modes](https://graphty-org.github.io/graphty-element/storybook/?path=/story/viewmode--default) - 2D/3D switching
- [Layouts](https://graphty-org.github.io/graphty-element/storybook/?path=/story/layout-3d--circular) - Different layout algorithms
