# Events

Guide to subscribing to graph events.

## Overview

Graphty uses an event-driven architecture. Subscribe to events for user interactions, data changes, and state updates.

## Available Events

| Event | Trigger | Event Data |
|-------|---------|------------|
| `graph-settled` | Layout finished | `{ settled: boolean }` |
| `data-loaded` | Initial data loaded | `{ nodeCount, edgeCount }` |
| `data-added` | Incremental data added | `{ nodes, edges }` |
| `selection-changed` | Node selected/deselected | `{ node, previousNode }` |
| `camera-state-changed` | Camera moved | `{ state }` |
| `style-changed` | Styles updated | `{ layers }` |
| `node-click` | User clicked node | `{ node, event }` |
| `node-hover` | Mouse entered node | `{ node }` |
| `edge-click` | User clicked edge | `{ edge, event }` |
| `error` | Error occurred | `{ error, context }` |

## JavaScript API

Subscribe using the `on()` method on the Graph instance:

```typescript
const graph = element.graph;

// Layout complete
graph.on('graph-settled', () => {
  console.log('Layout complete!');
  graph.zoomToFit();
});

// Node clicked
graph.on('node-click', ({ node }) => {
  console.log('Clicked:', node.id);
  graph.selectNode(node.id);
});

// Node hover
graph.on('node-hover', ({ node }) => {
  console.log('Hovering:', node.id);
});

// Selection changed
graph.on('selection-changed', ({ node, previousNode }) => {
  if (node) {
    console.log('Selected:', node.id);
  } else {
    console.log('Deselected');
  }
});

// Data loaded
graph.on('data-loaded', ({ nodeCount, edgeCount }) => {
  console.log(`Loaded ${nodeCount} nodes, ${edgeCount} edges`);
});

// Error handling
graph.on('error', ({ error, context }) => {
  console.error('Graph error:', error, 'in', context);
});
```

## DOM Events

Listen via standard `addEventListener` on the Web Component:

```javascript
const element = document.querySelector('graphty-element');

element.addEventListener('graph-settled', (e) => {
  console.log('Settled!', e.detail);
});

element.addEventListener('node-click', (e) => {
  console.log('Clicked node:', e.detail.node);
});

element.addEventListener('selection-changed', (e) => {
  const { node, previousNode } = e.detail;
  console.log('Selection:', node?.id, 'Previous:', previousNode?.id);
});
```

## Event Timing

Some events fire asynchronously. Understand the order:

```typescript
// Data loading sequence
graph.on('data-loaded', () => console.log('1. Data loaded'));
graph.on('graph-settled', () => console.log('2. Layout settled'));

// When you add data
await graph.addNodes(nodes);      // 'data-loaded' or 'data-added' fires
await graph.addEdges(edges);
await graph.waitForSettled();     // 'graph-settled' fires
```

## Removing Listeners

Clean up event listeners when done:

```typescript
// JavaScript API
const handler = () => console.log('Settled');
graph.on('graph-settled', handler);

// Later, remove it
graph.off('graph-settled', handler);
```

```javascript
// DOM API
const handler = (e) => console.log('Settled', e.detail);
element.addEventListener('graph-settled', handler);

// Later, remove it
element.removeEventListener('graph-settled', handler);
```

## Common Patterns

### Zoom After Layout

```typescript
graph.on('graph-settled', () => {
  graph.zoomToFit();
});
```

### Show Node Details

```typescript
graph.on('node-click', ({ node }) => {
  showDetailsPanel(node);
  graph.selectNode(node.id);
});

graph.on('selection-changed', ({ node }) => {
  if (!node) {
    hideDetailsPanel();
  }
});
```

### Loading Indicator

```typescript
let isLoading = false;

graph.on('data-added', () => {
  isLoading = true;
  showLoadingSpinner();
});

graph.on('graph-settled', () => {
  if (isLoading) {
    isLoading = false;
    hideLoadingSpinner();
  }
});
```

### Error Handling

```typescript
graph.on('error', ({ error, context }) => {
  if (context === 'data-loading') {
    showError('Failed to load data');
  } else if (context === 'algorithm') {
    showError('Algorithm failed');
  } else {
    showError('An error occurred');
  }
  console.error(error);
});
```

### Camera Tracking

```typescript
graph.on('camera-state-changed', ({ state }) => {
  // Save camera state for later restoration
  localStorage.setItem('camera-state', JSON.stringify(state));
});

// Restore on load
const savedState = localStorage.getItem('camera-state');
if (savedState) {
  graph.setCameraState(JSON.parse(savedState));
}
```

## React Integration

```tsx
import { useEffect, useRef } from 'react';
import '@graphty/graphty-element';

function GraphComponent({ onNodeClick }) {
  const graphRef = useRef(null);

  useEffect(() => {
    const element = graphRef.current;
    if (!element) return;

    const graph = element.graph;

    const handleClick = ({ node }) => {
      onNodeClick(node);
    };

    graph.on('node-click', handleClick);

    return () => {
      graph.off('node-click', handleClick);
    };
  }, [onNodeClick]);

  return <graphty-element ref={graphRef} />;
}
```

## Vue Integration

```vue
<script setup>
import '@graphty/graphty-element';
import { ref, onMounted, onUnmounted } from 'vue';

const graphRef = ref(null);
const emit = defineEmits(['nodeClick']);

let cleanup = null;

onMounted(() => {
  const graph = graphRef.value.graph;

  const handler = ({ node }) => emit('nodeClick', node);
  graph.on('node-click', handler);

  cleanup = () => graph.off('node-click', handler);
});

onUnmounted(() => {
  if (cleanup) cleanup();
});
</script>

<template>
  <graphty-element ref="graphRef" />
</template>
```

## Interactive Examples

- [Selection Events](https://graphty-org.github.io/graphty-element/storybook/?path=/story/selection--default)
