# API Reference

Graphty provides two distinct APIs for different use cases.

## Choose Your API

<div class="api-cards">

### [Web Component API](/api/web-component)

**Declarative configuration via HTML attributes and element properties.**

Use this API when you want:
- HTML-based configuration
- Framework integration (React, Vue, Angular, Svelte)
- Reactive property binding
- Simple graphs configured via attributes

```html
<graphty-element
  layout="ngraph"
  view-mode="3d"
  node-data='[{"id": "a"}, {"id": "b"}]'
  edge-data='[{"source": "a", "target": "b"}]'>
</graphty-element>
```

[View Web Component API →](/api/web-component)

---

### [JavaScript API](/api/javascript)

**Programmatic control via the `Graph` class.**

Use this API when you need:
- Dynamic data manipulation (add/remove nodes at runtime)
- Algorithm execution and result handling
- Camera control and animation
- Custom style layers
- Screenshot and video capture

```typescript
const graph = element.graph;

await graph.addNodes([{ id: 'a' }, { id: 'b' }]);
await graph.runAlgorithm('graphty', 'degree');
graph.zoomToFit();
```

[View JavaScript API →](/api/javascript)

</div>

## Quick Comparison

| Feature | Web Component | JavaScript API |
|---------|---------------|----------------|
| Set initial data | ✅ `node-data` attribute | ✅ `addNodes()` method |
| Add data dynamically | ❌ Replaces all data | ✅ Appends to existing |
| Set layout | ✅ `layout` attribute | ✅ `setLayout()` method |
| Run algorithms | ❌ | ✅ `runAlgorithm()` |
| Camera control | ✅ Limited via methods | ✅ Full control |
| Custom styles | ✅ `style-template` | ✅ `addStyleLayer()` |
| Event handling | ✅ `addEventListener()` | ✅ `graph.on()` |
| Screenshot/Video | ✅ Via element methods | ✅ Via graph methods |

## Configuration Types

### GraphtyConfig

Main configuration object:

```typescript
interface GraphtyConfig {
  layout?: string;
  layoutOptions?: object;
  styleTemplate?: string;
  viewMode?: '2d' | '3d' | 'vr' | 'ar';
  debug?: boolean;
}
```

### StyleSchema

Style configuration:

```typescript
interface StyleSchema {
  layers: StyleLayer[];
}

interface StyleLayer {
  selector: string;
  priority?: number;
  styles: {
    node?: NodeStyle;
    edge?: EdgeStyle;
    label?: LabelStyle;
  };
}
```

### NodeStyle

Node appearance options:

```typescript
interface NodeStyle {
  color?: string | ((node: Node) => string);
  size?: number | ((node: Node) => number);
  shape?: string;
  opacity?: number;
  texture?: string;
}
```

### EdgeStyle

Edge appearance options:

```typescript
interface EdgeStyle {
  line?: {
    type?: string;
    width?: number;
    color?: string;
    opacity?: number;
    bezier?: boolean;
  };
  arrowHead?: {
    type?: string;
    size?: number;
    color?: string;
  };
  arrowTail?: {
    type?: string;
    size?: number;
    color?: string;
  };
}
```

### LabelStyle

Label appearance options:

```typescript
interface LabelStyle {
  text?: string | ((element: Node | Edge) => string);
  fontSize?: number;
  fontColor?: string;
  position?: string;
  offset?: Vector3;
}
```

## Generated TypeDoc Reference

For complete type definitions auto-generated from TypeScript source:

**Web Component**
- [Graphty Class](/api/generated/graphty-element/classes/Graphty.md)

**JavaScript API**
- [Graph Class](/api/generated/Graph/classes/Graph.md)
- [Node Class](/api/generated/Node/classes/Node.md)
- [Edge Class](/api/generated/Edge/classes/Edge.md)

**Configuration Types**
- [Config Module](/api/generated/config/)
- [Managers Module](/api/generated/managers/)

**Extension Base Classes**
- [LayoutEngine](/api/generated/layout/LayoutEngine/classes/LayoutEngine.md)
- [Algorithm](/api/generated/algorithms/Algorithm/classes/Algorithm.md)
- [DataSource](/api/generated/data/DataSource/classes/DataSource.md)

## Related Guides

- [Getting Started](/guide/getting-started) - Quick introduction
- [Web Component Guide](/guide/web-component) - Usage patterns for declarative API
- [JavaScript API Guide](/guide/javascript-api) - Usage patterns for programmatic API
