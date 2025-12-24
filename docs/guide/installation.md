# Installation

Comprehensive installation options for different environments and frameworks.

## npm / yarn

The recommended way to install Graphty:

```bash
# npm
npm install @graphty/graphty-element

# yarn
yarn add @graphty/graphty-element

# pnpm
pnpm add @graphty/graphty-element
```

Then import in your JavaScript/TypeScript:

```typescript
import '@graphty/graphty-element';
```

## CDN Usage

For quick prototyping or simple pages, use a CDN:

```html
<!-- unpkg -->
<script type="module" src="https://unpkg.com/@graphty/graphty-element"></script>

<!-- jsDelivr -->
<script type="module" src="https://cdn.jsdelivr.net/npm/@graphty/graphty-element"></script>
```

Then use the component directly:

```html
<graphty-element
  node-data='[{"id": "a"}, {"id": "b"}]'
  edge-data='[{"source": "a", "target": "b"}]'>
</graphty-element>
```

## Framework Integration

### React

Web Components work in React with some considerations:

```tsx
import '@graphty/graphty-element';

function GraphVisualization({ nodes, edges }) {
  return (
    <graphty-element
      node-data={JSON.stringify(nodes)}
      edge-data={JSON.stringify(edges)}
      style={{ width: '100%', height: '500px', display: 'block' }}
    />
  );
}
```

For accessing the Graph instance:

```tsx
import { useRef, useEffect } from 'react';
import '@graphty/graphty-element';

function GraphVisualization() {
  const graphRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = graphRef.current;
    if (element) {
      const graph = (element as any).graph;
      graph.zoomToFit();
    }
  }, []);

  return <graphty-element ref={graphRef} />;
}
```

### Vue

Vue 3 supports Web Components with custom element configuration:

```vue
<script setup>
import '@graphty/graphty-element';
import { ref, onMounted } from 'vue';

const graphRef = ref(null);
const nodes = [{ id: 'a' }, { id: 'b' }];
const edges = [{ source: 'a', target: 'b' }];

onMounted(() => {
  const graph = graphRef.value.graph;
  graph.zoomToFit();
});
</script>

<template>
  <graphty-element
    ref="graphRef"
    :node-data="JSON.stringify(nodes)"
    :edge-data="JSON.stringify(edges)"
    style="width: 100%; height: 500px; display: block;"
  />
</template>
```

In `vite.config.js`, configure Vue to recognize the custom element:

```js
export default {
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'graphty-element'
        }
      }
    })
  ]
}
```

### Angular

Angular requires schema configuration for custom elements:

```typescript
// app.module.ts
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  // ...
})
export class AppModule {}
```

Then in your component:

```typescript
import '@graphty/graphty-element';

@Component({
  template: `
    <graphty-element
      [attr.node-data]="nodesJson"
      [attr.edge-data]="edgesJson"
      style="width: 100%; height: 500px; display: block;">
    </graphty-element>
  `
})
export class GraphComponent {
  nodesJson = JSON.stringify([{ id: 'a' }, { id: 'b' }]);
  edgesJson = JSON.stringify([{ source: 'a', target: 'b' }]);
}
```

## Peer Dependencies

Graphty has peer dependencies on Babylon.js and Lit:

```json
{
  "peerDependencies": {
    "@babylonjs/core": "^8.0.0",
    "lit": "^3.0.0"
  }
}
```

These are typically installed automatically. If you need to install them manually:

```bash
npm install @babylonjs/core lit
```

## TypeScript Setup

Graphty includes TypeScript definitions. Import types as needed:

```typescript
import '@graphty/graphty-element';
import type { Graph, Node, Edge, StyleSchema } from '@graphty/graphty-element';

// Access the Graph instance
const element = document.querySelector('graphty-element');
const graph: Graph = (element as any).graph;
```

## Bundle Size Considerations

Graphty bundles Babylon.js core, which adds to bundle size. For production:

1. **Tree Shaking**: The library supports tree shaking. Only import what you need.

2. **External Babylon.js**: If you're already using Babylon.js, configure your bundler to use the external version:

   ```js
   // vite.config.js
   export default {
     build: {
       rollupOptions: {
         external: ['@babylonjs/core']
       }
     }
   }
   ```

3. **Lazy Loading**: Load Graphty only when needed:

   ```typescript
   // Load on demand
   const loadGraph = async () => {
     await import('@graphty/graphty-element');
     // Now the component is registered
   };
   ```

## Troubleshooting

### Component Not Rendering

Ensure the element has explicit dimensions:

```css
graphty-element {
  display: block;
  width: 800px;
  height: 600px;
}
```

### Module Resolution Errors

If using TypeScript with `moduleResolution: "node"`, you may need to use `"bundler"` or `"node16"`:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler"
  }
}
```

### WebGL Not Available

Graphty requires WebGL. Check browser support:

```typescript
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
if (!gl) {
  console.error('WebGL is not supported');
}
```
