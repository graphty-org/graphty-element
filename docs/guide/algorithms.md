# Algorithms

Guide to running graph algorithms and using results for visualization.

## Overview

Graphty includes a comprehensive set of graph algorithms for analysis. Run algorithms to compute metrics like centrality, detect communities, find shortest paths, and more. Results can be visualized using the styling system.

## Running Algorithms

```typescript
// Run an algorithm
await graph.runAlgorithm('graphty', 'degree');

// namespace: 'graphty' (built-in algorithms)
// type: algorithm name
```

## Algorithm Categories

### Centrality Algorithms

Measure node importance:

| Algorithm | Description |
|-----------|-------------|
| `degree` | Number of connections |
| `betweenness` | How often a node is on shortest paths |
| `closeness` | Average distance to all other nodes |
| `pagerank` | Influence based on incoming links |
| `eigenvector` | Influence from well-connected neighbors |

```typescript
await graph.runAlgorithm('graphty', 'degree');
await graph.runAlgorithm('graphty', 'pagerank');
await graph.runAlgorithm('graphty', 'betweenness');
```

### Community Detection

Find clusters of related nodes:

| Algorithm | Description |
|-----------|-------------|
| `louvain` | Fast community detection |
| `label-propagation` | Iterative community assignment |
| `modularity` | Optimize modularity score |

```typescript
await graph.runAlgorithm('graphty', 'louvain');
```

### Component Analysis

Find connected subgraphs:

| Algorithm | Description |
|-----------|-------------|
| `connected-components` | Find all connected components |
| `strongly-connected` | Strong connectivity (directed graphs) |

```typescript
await graph.runAlgorithm('graphty', 'connected-components');
```

### Traversal Algorithms

Explore the graph systematically:

| Algorithm | Description |
|-----------|-------------|
| `bfs` | Breadth-first search |
| `dfs` | Depth-first search |

```typescript
await graph.runAlgorithm('graphty', 'bfs', { startNode: 'node1' });
```

### Shortest Path

Find optimal paths between nodes:

| Algorithm | Description |
|-----------|-------------|
| `dijkstra` | Shortest path (weighted) |
| `bellman-ford` | Handles negative weights |
| `a-star` | Heuristic-based pathfinding |

```typescript
await graph.runAlgorithm('graphty', 'dijkstra', {
  source: 'node1',
  target: 'node5'
});
```

### Spanning Tree

Find minimum spanning trees:

| Algorithm | Description |
|-----------|-------------|
| `prim` | Prim's algorithm |
| `kruskal` | Kruskal's algorithm |

```typescript
await graph.runAlgorithm('graphty', 'prim');
```

### Flow Algorithms

Network flow analysis:

| Algorithm | Description |
|-----------|-------------|
| `max-flow` | Maximum flow between nodes |
| `min-cut` | Minimum edge cut |

```typescript
await graph.runAlgorithm('graphty', 'max-flow', {
  source: 'source',
  sink: 'sink'
});
```

## Accessing Results

Algorithm results are stored on nodes:

```typescript
// Run algorithm
await graph.runAlgorithm('graphty', 'degree');

// Access results on individual nodes
const node = graph.getNode('node1');
const degree = node.algorithmResults['graphty:degree'];

// Access all nodes with results
const nodes = graph.getNodes();
for (const node of nodes) {
  console.log(`${node.id}: ${node.algorithmResults['graphty:degree']}`);
}
```

## Suggested Styles

Many algorithms provide suggested visualizations:

```typescript
// Run algorithm
await graph.runAlgorithm('graphty', 'degree');

// Apply the algorithm's suggested visualization
graph.applySuggestedStyles('graphty:degree');
```

This automatically maps algorithm results to visual properties like color and size.

## Custom Styling with Algorithm Results

Use algorithm results in style selectors:

```typescript
// Highlight high-degree nodes
graph.styleManager.addLayer({
  selector: "[?algorithmResults.'graphty:degree' > `10`]",
  styles: {
    node: { color: '#e74c3c', size: 2.0 }
  }
});

// Dynamic styling based on results
graph.styleManager.addLayer({
  selector: '*',
  styles: {
    node: {
      size: (node) => {
        const degree = node.algorithmResults['graphty:degree'] || 0;
        return 0.5 + (degree * 0.1);
      }
    }
  }
});
```

## Combining with Style Helpers

Use style helpers for polished visualizations:

```typescript
import { StyleHelpers } from '@graphty/graphty-element';

await graph.runAlgorithm('graphty', 'pagerank');

// Find max value for normalization
const maxRank = Math.max(
  ...graph.getNodes().map(n => n.algorithmResults['graphty:pagerank'] || 0)
);

graph.styleManager.addLayer({
  selector: '*',
  styles: {
    node: {
      color: (node) => {
        const rank = node.algorithmResults['graphty:pagerank'] || 0;
        return StyleHelpers.color.sequential.viridis(rank / maxRank);
      }
    }
  }
});
```

## Multiple Algorithms

Run multiple algorithms and combine results:

```typescript
// Run multiple algorithms
await graph.runAlgorithm('graphty', 'degree');
await graph.runAlgorithm('graphty', 'louvain');

// Style by community with size by degree
graph.styleManager.addLayer({
  selector: '*',
  styles: {
    node: {
      color: (node) => {
        const community = node.algorithmResults['graphty:louvain'];
        return StyleHelpers.color.categorical.okabeIto(community);
      },
      size: (node) => {
        const degree = node.algorithmResults['graphty:degree'] || 0;
        return 0.5 + (degree * 0.1);
      }
    }
  }
});
```

## Custom Algorithms

Create your own algorithms. See [Custom Algorithms](./extending/custom-algorithms) for details.

## Interactive Examples

- [Centrality Algorithms](https://graphty-org.github.io/graphty-element/storybook/?path=/story/algorithms-centrality--degree)
- [Community Detection](https://graphty-org.github.io/graphty-element/storybook/?path=/story/algorithms-community--louvain)
- [Components](https://graphty-org.github.io/graphty-element/storybook/?path=/story/algorithms-component--connected)
- [Shortest Path](https://graphty-org.github.io/graphty-element/storybook/?path=/story/algorithms-shortestpath--dijkstra)
- [Traversal](https://graphty-org.github.io/graphty-element/storybook/?path=/story/algorithms-traversal--bfs)
- [Spanning Tree](https://graphty-org.github.io/graphty-element/storybook/?path=/story/algorithms-spanningtree--prim)
- [Combined Algorithms](https://graphty-org.github.io/graphty-element/storybook/?path=/story/algorithms-combined--default)
