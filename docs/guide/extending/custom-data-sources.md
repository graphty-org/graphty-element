# Custom Data Sources

Guide to creating custom data source handlers.

## Overview

Graphty's data source system is extensible. Create custom data sources to load graphs from APIs, databases, or specialized file formats.

## DataSource Interface

All data sources extend the abstract `DataSource` class:

```typescript
abstract class DataSource {
  static type: string;

  abstract load(config: object): AsyncGenerator<GraphData>;
}

interface GraphData {
  nodes: NodeData[];
  edges: EdgeData[];
}
```

## Creating a Custom Data Source

### Basic Example

```typescript
import { DataSource, GraphData, NodeData, EdgeData } from '@graphty/graphty-element';

class MyDataSource extends DataSource {
  static type = 'my-api';

  async *load(config: { url: string }): AsyncGenerator<GraphData> {
    const response = await fetch(config.url);
    const data = await response.json();

    yield {
      nodes: data.nodes,
      edges: data.edges
    };
  }
}

// Register the data source
DataSource.register(MyDataSource);
```

### Using Your Data Source

```typescript
await graph.loadFromDataSource('my-api', {
  url: 'https://api.example.com/graph'
});
```

## Complete Example: REST API

```typescript
import { DataSource, GraphData, NodeData, EdgeData } from '@graphty/graphty-element';

interface ApiConfig {
  baseUrl: string;
  apiKey?: string;
  graphId: string;
}

class RestApiDataSource extends DataSource {
  static type = 'rest-api';

  async *load(config: ApiConfig): AsyncGenerator<GraphData> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }

    // Fetch nodes
    const nodesResponse = await fetch(
      `${config.baseUrl}/graphs/${config.graphId}/nodes`,
      { headers }
    );
    const nodesData = await nodesResponse.json();

    // Fetch edges
    const edgesResponse = await fetch(
      `${config.baseUrl}/graphs/${config.graphId}/edges`,
      { headers }
    );
    const edgesData = await edgesResponse.json();

    // Transform to Graphty format
    const nodes: NodeData[] = nodesData.map((n: any) => ({
      id: n.nodeId,
      label: n.name,
      ...n.attributes
    }));

    const edges: EdgeData[] = edgesData.map((e: any) => ({
      source: e.fromNode,
      target: e.toNode,
      weight: e.weight
    }));

    yield { nodes, edges };
  }
}

DataSource.register(RestApiDataSource);
```

Usage:

```typescript
await graph.loadFromDataSource('rest-api', {
  baseUrl: 'https://api.example.com',
  apiKey: 'your-api-key',
  graphId: 'graph-123'
});
```

## Chunked Loading

For large datasets, yield data in chunks:

```typescript
class PaginatedDataSource extends DataSource {
  static type = 'paginated';

  async *load(config: { url: string; pageSize: number }): AsyncGenerator<GraphData> {
    let page = 0;
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(
        `${config.url}?page=${page}&size=${config.pageSize}`
      );
      const data = await response.json();

      yield {
        nodes: data.nodes,
        edges: data.edges
      };

      hasMore = data.hasNextPage;
      page++;
    }
  }
}

DataSource.register(PaginatedDataSource);
```

This progressively loads the graph, with the UI updating after each chunk.

## Streaming Data Source

For real-time data streams:

```typescript
class WebSocketDataSource extends DataSource {
  static type = 'websocket';

  async *load(config: { wsUrl: string }): AsyncGenerator<GraphData> {
    const ws = new WebSocket(config.wsUrl);

    // Create a queue for incoming data
    const queue: GraphData[] = [];
    let resolve: (() => void) | null = null;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      queue.push({
        nodes: data.nodes || [],
        edges: data.edges || []
      });
      if (resolve) {
        resolve();
        resolve = null;
      }
    };

    // Wait for initial connection
    await new Promise<void>((r) => { ws.onopen = () => r(); });

    // Yield data as it arrives
    try {
      while (ws.readyState === WebSocket.OPEN) {
        if (queue.length > 0) {
          yield queue.shift()!;
        } else {
          await new Promise<void>((r) => { resolve = r; });
        }
      }
    } finally {
      ws.close();
    }
  }
}

DataSource.register(WebSocketDataSource);
```

## Custom File Format

Parse a custom file format:

```typescript
class CustomFormatDataSource extends DataSource {
  static type = 'custom-format';

  async *load(config: { content: string }): AsyncGenerator<GraphData> {
    const lines = config.content.split('\n');
    const nodes: NodeData[] = [];
    const edges: EdgeData[] = [];

    let section = 'none';

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed === '[NODES]') {
        section = 'nodes';
        continue;
      }
      if (trimmed === '[EDGES]') {
        section = 'edges';
        continue;
      }
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      if (section === 'nodes') {
        const [id, label] = trimmed.split(':');
        nodes.push({ id, label });
      }

      if (section === 'edges') {
        const [source, target, weight] = trimmed.split(',');
        edges.push({
          source,
          target,
          weight: parseFloat(weight) || 1
        });
      }
    }

    yield { nodes, edges };
  }
}

DataSource.register(CustomFormatDataSource);
```

Example custom format file:

```
# My Graph
[NODES]
a:Node A
b:Node B
c:Node C

[EDGES]
a,b,1.5
b,c,2.0
c,a,0.5
```

## Schema Validation

Use Zod for input validation:

```typescript
import { z } from 'zod';
import { DataSource, GraphData } from '@graphty/graphty-element';

const ConfigSchema = z.object({
  url: z.string().url(),
  timeout: z.number().optional().default(5000),
  retries: z.number().optional().default(3)
});

type Config = z.infer<typeof ConfigSchema>;

class ValidatedDataSource extends DataSource {
  static type = 'validated';

  async *load(config: unknown): AsyncGenerator<GraphData> {
    // Validate config
    const validConfig = ConfigSchema.parse(config);

    // Use validated config
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < validConfig.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          validConfig.timeout
        );

        const response = await fetch(validConfig.url, {
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const data = await response.json();
        yield { nodes: data.nodes, edges: data.edges };
        return;
      } catch (error) {
        lastError = error as Error;
      }
    }

    throw lastError || new Error('Failed to load data');
  }
}

DataSource.register(ValidatedDataSource);
```

## Error Handling

Handle errors gracefully:

```typescript
class RobustDataSource extends DataSource {
  static type = 'robust';

  async *load(config: { urls: string[] }): AsyncGenerator<GraphData> {
    const allNodes: NodeData[] = [];
    const allEdges: EdgeData[] = [];
    const errors: Error[] = [];

    for (const url of config.urls) {
      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
          throw new Error('Invalid data format');
        }

        allNodes.push(...data.nodes);
        allEdges.push(...data.edges);

        // Yield partial results
        yield { nodes: data.nodes, edges: data.edges };

      } catch (error) {
        errors.push(error as Error);
        console.warn(`Failed to load ${url}:`, error);
      }
    }

    if (allNodes.length === 0 && errors.length > 0) {
      throw new AggregateError(errors, 'All data sources failed');
    }
  }
}

DataSource.register(RobustDataSource);
```

## Configuration Types

Export your config type for TypeScript users:

```typescript
// my-data-source.ts
export interface MyDataSourceConfig {
  url: string;
  apiKey?: string;
  options?: {
    includeMetadata?: boolean;
    maxNodes?: number;
  };
}

class MyDataSource extends DataSource {
  static type = 'my-source';

  async *load(config: MyDataSourceConfig): AsyncGenerator<GraphData> {
    // ...
  }
}
```

Usage with type checking:

```typescript
import type { MyDataSourceConfig } from './my-data-source';

const config: MyDataSourceConfig = {
  url: 'https://api.example.com/graph',
  options: { maxNodes: 1000 }
};

await graph.loadFromDataSource('my-source', config);
```
