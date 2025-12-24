# Custom Algorithms

Guide to creating custom graph algorithms.

## Overview

Graphty's algorithm system is extensible. Create custom algorithms to compute metrics, detect patterns, or analyze graph structure.

## Algorithm Interface

All algorithms extend the abstract `Algorithm` class:

```typescript
abstract class Algorithm {
  static namespace: string;
  static type: string;

  abstract run(graph: Graph, options?: object): AlgorithmResult;
}

interface AlgorithmResult {
  nodeResults: Map<string, any>;
  edgeResults?: Map<string, any>;
  suggestedStyles?: StyleSchema;
}
```

## Creating a Custom Algorithm

### Basic Example

```typescript
import { Algorithm, Graph, AlgorithmResult } from '@graphty/graphty-element';

class MyAlgorithm extends Algorithm {
  static namespace = 'custom';
  static type = 'my-algo';

  run(graph: Graph, options?: object): AlgorithmResult {
    const nodeResults = new Map<string, any>();

    // Compute something for each node
    for (const node of graph.getNodes()) {
      const value = this.computeValue(node, graph);
      nodeResults.set(node.id, value);
    }

    return { nodeResults };
  }

  private computeValue(node: Node, graph: Graph): number {
    // Your algorithm logic here
    return 42;
  }
}

// Register the algorithm
Algorithm.register(MyAlgorithm);
```

### Using Your Algorithm

```typescript
await graph.runAlgorithm('custom', 'my-algo');

// Access results
const node = graph.getNode('node1');
const result = node.algorithmResults['custom:my-algo'];
```

## Complete Example: In-Degree/Out-Degree

```typescript
import { Algorithm, Graph, AlgorithmResult, Node } from '@graphty/graphty-element';

class InOutDegreeAlgorithm extends Algorithm {
  static namespace = 'custom';
  static type = 'in-out-degree';

  run(graph: Graph, options?: object): AlgorithmResult {
    const nodeResults = new Map<string, { in: number; out: number }>();

    // Initialize counts
    for (const node of graph.getNodes()) {
      nodeResults.set(node.id, { in: 0, out: 0 });
    }

    // Count edges
    for (const edge of graph.getEdges()) {
      const sourceId = edge.source as string;
      const targetId = edge.target as string;

      // Increment out-degree for source
      const sourceResult = nodeResults.get(sourceId);
      if (sourceResult) {
        sourceResult.out++;
      }

      // Increment in-degree for target
      const targetResult = nodeResults.get(targetId);
      if (targetResult) {
        targetResult.in++;
      }
    }

    return {
      nodeResults,
      suggestedStyles: this.getSuggestedStyles(nodeResults)
    };
  }

  private getSuggestedStyles(
    results: Map<string, { in: number; out: number }>
  ): StyleSchema {
    // Find max for normalization
    let maxTotal = 0;
    for (const { in: inDeg, out: outDeg } of results.values()) {
      maxTotal = Math.max(maxTotal, inDeg + outDeg);
    }

    return {
      layers: [{
        selector: '*',
        styles: {
          node: {
            size: (node: Node) => {
              const result = node.algorithmResults['custom:in-out-degree'];
              if (!result) return 1;
              const total = result.in + result.out;
              return 0.5 + (total / maxTotal) * 2;
            }
          }
        }
      }]
    };
  }
}

Algorithm.register(InOutDegreeAlgorithm);
```

## Algorithm with Options

Accept configuration options:

```typescript
interface ClusteringOptions {
  threshold: number;
  maxIterations: number;
}

class ClusteringAlgorithm extends Algorithm {
  static namespace = 'custom';
  static type = 'clustering';

  run(graph: Graph, options: Partial<ClusteringOptions> = {}): AlgorithmResult {
    const config: ClusteringOptions = {
      threshold: 0.5,
      maxIterations: 100,
      ...options
    };

    const nodeResults = new Map<string, number>();

    // Use config in algorithm
    let iterations = 0;
    while (iterations < config.maxIterations) {
      // Clustering logic...
      iterations++;
    }

    return { nodeResults };
  }
}

Algorithm.register(ClusteringAlgorithm);
```

Usage:

```typescript
await graph.runAlgorithm('custom', 'clustering', {
  threshold: 0.7,
  maxIterations: 50
});
```

## Suggested Styles

Provide visualization suggestions with your algorithm:

```typescript
class ImportanceAlgorithm extends Algorithm {
  static namespace = 'custom';
  static type = 'importance';

  run(graph: Graph): AlgorithmResult {
    const nodeResults = new Map<string, number>();

    // Calculate importance scores (0-1)
    for (const node of graph.getNodes()) {
      const score = this.calculateImportance(node, graph);
      nodeResults.set(node.id, score);
    }

    return {
      nodeResults,
      suggestedStyles: {
        layers: [{
          selector: '*',
          styles: {
            node: {
              color: (node: Node) => {
                const score = node.algorithmResults['custom:importance'] || 0;
                // Green to red gradient
                const r = Math.floor(255 * score);
                const g = Math.floor(255 * (1 - score));
                return `rgb(${r}, ${g}, 0)`;
              },
              size: (node: Node) => {
                const score = node.algorithmResults['custom:importance'] || 0;
                return 0.5 + score * 2;
              }
            }
          }
        }]
      }
    };
  }
}
```

Apply suggested styles:

```typescript
await graph.runAlgorithm('custom', 'importance');
graph.applySuggestedStyles('custom:importance');
```

## Using @graphty/algorithms

Leverage the algorithms package for complex computations:

```typescript
import { Algorithm, Graph, AlgorithmResult } from '@graphty/graphty-element';
import { shortestPath } from '@graphty/algorithms';

class CentralityFromShortestPaths extends Algorithm {
  static namespace = 'custom';
  static type = 'custom-centrality';

  run(graph: Graph): AlgorithmResult {
    const nodeResults = new Map<string, number>();

    // Convert to format expected by @graphty/algorithms
    const algorithmGraph = this.convertGraph(graph);

    // Use library functions
    for (const node of graph.getNodes()) {
      let totalDistance = 0;
      for (const other of graph.getNodes()) {
        if (node.id !== other.id) {
          const path = shortestPath(algorithmGraph, node.id, other.id);
          totalDistance += path?.length || Infinity;
        }
      }
      // Closeness centrality (inverse of average distance)
      const centrality = (graph.getNodes().length - 1) / totalDistance;
      nodeResults.set(node.id, centrality);
    }

    return { nodeResults };
  }

  private convertGraph(graph: Graph) {
    // Convert to @graphty/algorithms format
    // ...
  }
}

Algorithm.register(CentralityFromShortestPaths);
```

## Edge Results

Return results for edges as well as nodes:

```typescript
class EdgeWeightAnalysis extends Algorithm {
  static namespace = 'custom';
  static type = 'edge-analysis';

  run(graph: Graph): AlgorithmResult {
    const nodeResults = new Map<string, number>();
    const edgeResults = new Map<string, { normalized: number }>();

    // Find weight range
    let minWeight = Infinity;
    let maxWeight = -Infinity;

    for (const edge of graph.getEdges()) {
      const weight = edge.weight || 1;
      minWeight = Math.min(minWeight, weight);
      maxWeight = Math.max(maxWeight, weight);
    }

    // Normalize weights
    const range = maxWeight - minWeight || 1;

    for (const edge of graph.getEdges()) {
      const weight = edge.weight || 1;
      const normalized = (weight - minWeight) / range;
      edgeResults.set(edge.id, { normalized });
    }

    return { nodeResults, edgeResults };
  }
}
```

## Async Algorithms

For long-running algorithms, use async/await:

```typescript
class AsyncAlgorithm extends Algorithm {
  static namespace = 'custom';
  static type = 'async-algo';

  async run(graph: Graph): Promise<AlgorithmResult> {
    const nodeResults = new Map<string, number>();

    // Simulate long computation
    for (const node of graph.getNodes()) {
      await this.heavyComputation(node);
      nodeResults.set(node.id, 1);
    }

    return { nodeResults };
  }

  private async heavyComputation(node: Node): Promise<void> {
    // Expensive operation
    await new Promise(resolve => setTimeout(resolve, 10));
  }
}
```

## Performance Tips

1. **Cache intermediate results**: Store computed values for reuse
2. **Use efficient data structures**: Maps over arrays for lookups
3. **Parallelize when possible**: Web Workers for heavy computation
4. **Early termination**: Stop when result is "good enough"

```typescript
// Use adjacency list for faster neighbor lookups
private buildAdjacencyList(graph: Graph): Map<string, string[]> {
  const adj = new Map<string, string[]>();

  for (const node of graph.getNodes()) {
    adj.set(node.id, []);
  }

  for (const edge of graph.getEdges()) {
    adj.get(edge.source as string)?.push(edge.target as string);
  }

  return adj;
}
```
