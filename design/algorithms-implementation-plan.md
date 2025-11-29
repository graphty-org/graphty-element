# Implementation Plan for Algorithm Wrappers

## Overview

This plan details the implementation of wrapper classes in `graphty-element` for all algorithms available in the `@graphty/algorithms` package. Each wrapper integrates pure algorithm functions with the visualization system, storing results on graph elements and providing suggested styles for visualization.

**Current State:**
- Phase 1 complete: Degree, PageRank, Louvain, Dijkstra (4 algorithms)
- Remaining: ~23 algorithms across 7 categories

**Goals:**
- Complete wrapper implementations for all algorithms
- Ensure each algorithm has suggested styles for visualization
- Maintain consistent patterns across algorithm types
- Full test coverage with unit and visual tests

---

## Phase Breakdown

### Phase 1: Infrastructure Foundation

**Objective**: Complete the edge and graph result storage infrastructure required for edge-centric algorithms (MST, shortest path, flow).

**Tests to Write First**:
- `test/algorithm-edge-results.test.ts`: Test edge result storage
  ```typescript
  describe("Algorithm Edge Results", () => {
    it("stores edge results via addEdgeResult", async () => {
      const fakeGraph = await mockGraphWithEdges();
      const algo = new TestEdgeAlgorithm(fakeGraph);
      await algo.run();

      for (const edge of fakeGraph.edges.values()) {
        assert.property(edge.algorithmResults, "test-namespace");
        assert.property(edge.algorithmResults["test-namespace"], "test-algo");
      }
    });

    it("retrieves edge results via Algorithm.results", async () => {
      const fakeGraph = await mockGraphWithEdges();
      const algo = new TestEdgeAlgorithm(fakeGraph);
      await algo.run();

      const results = algo.results;
      assert.property(results, "edge");
    });
  });
  ```

- `test/algorithm-graph-results.test.ts`: Test graph-level result storage
  ```typescript
  describe("Algorithm Graph Results", () => {
    it("stores graph-level results via addGraphResult", async () => {
      const fakeGraph = await mockGraph();
      const algo = new TestGraphAlgorithm(fakeGraph);
      await algo.run();

      const results = algo.results;
      assert.property(results, "graph");
      assert.property(results.graph, "test-namespace");
    });
  });
  ```

**Implementation**:
- `src/algorithms/Algorithm.ts`: Complete edge and graph result methods
  ```typescript
  // Key additions to Algorithm class:

  addEdgeResult(edge: Edge, resultName: string, result: unknown): void {
    const p = this.#createPath(resultName);
    // Initialize algorithmResults on edge if needed
    if (!edge.algorithmResults) {
      edge.algorithmResults = {};
    }
    deepSet(edge, p, result);
  }

  addGraphResult(resultName: string, result: unknown): void {
    const p = ["algorithmResults", this.namespace, this.type, resultName];
    const dm = this.graph.getDataManager();
    if (!dm.graphResults) {
      dm.graphResults = {};
    }
    deepSet(dm.graphResults, p.slice(1), result);
  }

  get results(): AdHocData {
    const algorithmResults = {} as AdHocData;

    // Node results
    for (const n of this.graph.getDataManager().nodes.values()) {
      deepSet(algorithmResults, `node.${n.id}`, n.algorithmResults);
    }

    // Edge results
    for (const e of this.graph.getDataManager().edges.values()) {
      const edgeKey = `${e.srcId}:${e.dstId}`;
      deepSet(algorithmResults, `edge.${edgeKey}`, e.algorithmResults);
    }

    // Graph results
    const dm = this.graph.getDataManager();
    if (dm.graphResults) {
      algorithmResults.graph = dm.graphResults;
    }

    return algorithmResults;
  }
  ```

- `src/Edge.ts`: Add algorithmResults property (if not present)
  ```typescript
  // Add to Edge interface/class:
  algorithmResults?: AdHocData;
  ```

- `src/data/DataManager.ts`: Add graphResults storage
  ```typescript
  // Add to DataManager:
  graphResults?: AdHocData;
  ```

**Dependencies**:
- External: None (uses existing lodash `set`)
- Internal: Edge.ts, DataManager.ts modifications

**Verification**:
1. Run: `npm run test:default -- test/algorithm-edge-results.test.ts test/algorithm-graph-results.test.ts`
2. Expected: All tests pass, edge and graph results stored correctly

---

### Phase 2: Centrality Algorithms

**Objective**: Implement remaining centrality algorithms (Betweenness, Closeness, Eigenvector, HITS, Katz). All follow the same pattern: continuous node scores with size/color visualization.

**Tests to Write First**:
- `test/betweenness-algorithm.test.ts`:
  ```typescript
  describe("BetweennessCentralityAlgorithm", () => {
    describe("Algorithm Registration", () => {
      it("should be registered with namespace 'graphty' and type 'betweenness'", () => {
        const BetweennessClass = Algorithm.getClass("graphty", "betweenness");
        assert.ok(BetweennessClass);
        assert.strictEqual(BetweennessClass.namespace, "graphty");
        assert.strictEqual(BetweennessClass.type, "betweenness");
      });
    });

    describe("Algorithm Execution", () => {
      it("calculates betweenness scores for all nodes", async () => {
        const fakeGraph = await mockGraph({dataPath: "./helpers/data4.json"});
        const algo = new BetweennessCentralityAlgorithm(fakeGraph);
        await algo.run();

        for (const node of fakeGraph.nodes.values()) {
          assert.property(node.algorithmResults, "graphty");
          assert.property(node.algorithmResults.graphty, "betweenness");
          assert.property(node.algorithmResults.graphty.betweenness, "score");
          assert.property(node.algorithmResults.graphty.betweenness, "scorePct");

          assert.isNumber(node.algorithmResults.graphty.betweenness.score);
          assert.isAtLeast(node.algorithmResults.graphty.betweenness.scorePct, 0);
          assert.isAtMost(node.algorithmResults.graphty.betweenness.scorePct, 1);
        }
      });
    });

    describe("Suggested Styles", () => {
      it("has suggested styles defined", () => {
        assert.isTrue(BetweennessCentralityAlgorithm.hasSuggestedStyles());
      });

      it("returns correct category", () => {
        const styles = BetweennessCentralityAlgorithm.getSuggestedStyles();
        assert.strictEqual(styles?.category, "node-metric");
      });

      it("uses StyleHelpers for color mapping", () => {
        const styles = BetweennessCentralityAlgorithm.getSuggestedStyles();
        const layer = styles?.layers[0];
        assert.ok(layer?.node?.calculatedStyle?.expr.includes("StyleHelpers"));
      });
    });
  });
  ```

- Similar test files for: `closeness-algorithm.test.ts`, `eigenvector-algorithm.test.ts`, `hits-algorithm.test.ts`, `katz-algorithm.test.ts`

**Implementation**:

1. `src/algorithms/BetweennessCentralityAlgorithm.ts`:
   ```typescript
   import {betweennessCentrality} from "@graphty/algorithms";
   import {SuggestedStylesConfig} from "../config";
   import {Algorithm} from "./Algorithm";

   export class BetweennessCentralityAlgorithm extends Algorithm {
     static namespace = "graphty";
     static type = "betweenness";

     static suggestedStyles = (): SuggestedStylesConfig => ({
       layers: [
         {
           node: {
             selector: "",
             style: { enabled: true },
             calculatedStyle: {
               inputs: ["algorithmResults.graphty.betweenness.scorePct"],
               output: "style.texture.color",
               expr: "{ return StyleHelpers.color.sequential.plasma(arguments[0]) }",
             },
           },
           metadata: {
             name: "Betweenness - Plasma Gradient",
             description: "Blue (low) → Pink → Yellow (high)",
           },
         },
       ],
       description: "Visualizes bridge nodes through color based on betweenness centrality",
       category: "node-metric",
     });

     async run(): Promise<void> {
       const g = this.graph;
       const nodes = Array.from(g.getDataManager().nodes.keys());

       if (nodes.length === 0) return;

       // Convert to @graphty/algorithms format and run
       const graphData = this.buildGraphData();
       const results = betweennessCentrality(graphData);

       // Find max for normalization
       let maxScore = 0;
       for (const score of results.values()) {
         maxScore = Math.max(maxScore, score);
       }

       // Store results
       for (const nodeId of nodes) {
         const score = results.get(nodeId) ?? 0;
         this.addNodeResult(nodeId, "score", score);
         this.addNodeResult(nodeId, "scorePct", maxScore > 0 ? score / maxScore : 0);
       }
     }

     private buildGraphData() {
       // Convert graphty-element graph to @graphty/algorithms format
       // ... implementation
     }
   }

   Algorithm.register(BetweennessCentralityAlgorithm);
   ```

2. Similar implementations for:
   - `ClosenessCentralityAlgorithm.ts` - uses `StyleHelpers.color.sequential.greens`
   - `EigenvectorCentralityAlgorithm.ts` - uses `StyleHelpers.color.sequential.oranges`
   - `HITSAlgorithm.ts` - stores `hubScore`, `authorityScore` with size/color combo
   - `KatzCentralityAlgorithm.ts` - uses `StyleHelpers.color.sequential.blues`

3. `src/algorithms/index.ts`: Export all new algorithms

**Common Utility - Graph Data Converter**:
Create `src/algorithms/utils/graphConverter.ts`:
```typescript
import {Graph as AlgoGraph} from "@graphty/algorithms";
import {Graph} from "../../Graph";

export function toAlgorithmGraph(g: Graph): AlgoGraph {
  const graph = new AlgoGraph();

  for (const node of g.getDataManager().nodes.values()) {
    graph.addNode(node.id);
  }

  for (const edge of g.getDataManager().edges.values()) {
    graph.addEdge(edge.srcId, edge.dstId, edge.value ?? 1);
  }

  return graph;
}
```

**Dependencies**:
- External: `@graphty/algorithms` (betweenness, closeness, eigenvector, hits, katz)
- Internal: Phase 1 infrastructure complete

**Verification**:
1. Run: `npm run test:default -- test/*centrality*.test.ts test/betweenness*.test.ts test/closeness*.test.ts test/eigenvector*.test.ts test/hits*.test.ts test/katz*.test.ts`
2. Run: `npm run lint`
3. Expected: All centrality algorithms pass tests, lint clean

---

### Phase 3: Community Detection Algorithms

**Objective**: Implement remaining community algorithms (Girvan-Newman, Leiden, Label Propagation). All use categorical color mapping.

**Tests to Write First**:
- `test/girvan-newman-algorithm.test.ts`:
  ```typescript
  describe("GirvanNewmanAlgorithm", () => {
    describe("Algorithm Execution", () => {
      it("assigns community IDs to all nodes", async () => {
        const fakeGraph = await mockGraph({dataPath: "./helpers/data4.json"});
        const algo = new GirvanNewmanAlgorithm(fakeGraph);
        await algo.run();

        const communityIds = new Set<number>();
        for (const node of fakeGraph.nodes.values()) {
          assert.property(node.algorithmResults.graphty.girvanNewman, "communityId");
          communityIds.add(node.algorithmResults.graphty.girvanNewman.communityId);
        }

        // Should have multiple communities
        assert.isAtLeast(communityIds.size, 1);
      });
    });

    describe("Suggested Styles", () => {
      it("uses categorical color palette", () => {
        const styles = GirvanNewmanAlgorithm.getSuggestedStyles();
        assert.strictEqual(styles?.category, "grouping");

        const layer = styles?.layers[0];
        assert.ok(layer?.node?.calculatedStyle?.expr.includes("categorical"));
      });
    });
  });
  ```

- Similar tests for: `leiden-algorithm.test.ts`, `label-propagation-algorithm.test.ts`

**Implementation**:

1. `src/algorithms/GirvanNewmanAlgorithm.ts`:
   ```typescript
   import {girvanNewman} from "@graphty/algorithms";
   import {SuggestedStylesConfig} from "../config";
   import {Algorithm} from "./Algorithm";

   export class GirvanNewmanAlgorithm extends Algorithm {
     static namespace = "graphty";
     static type = "girvan-newman";

     static suggestedStyles = (): SuggestedStylesConfig => ({
       layers: [
         {
           node: {
             selector: "",
             style: { enabled: true },
             calculatedStyle: {
               inputs: ["algorithmResults.graphty.girvan-newman.communityId"],
               output: "style.texture.color",
               expr: "{ return StyleHelpers.color.categorical.tolVibrant(arguments[0]) }",
             },
           },
           metadata: {
             name: "Girvan-Newman - Vibrant Colors",
             description: "7 high-saturation community colors",
           },
         },
       ],
       description: "Visualizes communities detected via edge betweenness removal",
       category: "grouping",
     });

     async run(): Promise<void> {
       const g = this.graph;
       const graphData = this.buildGraphData();
       const result = girvanNewman(graphData);

       // Store community assignments
       for (let i = 0; i < result.communities.length; i++) {
         for (const nodeId of result.communities[i]) {
           this.addNodeResult(nodeId, "communityId", i);
         }
       }

       // Store graph-level results
       this.addGraphResult("modularity", result.modularity);
       this.addGraphResult("communityCount", result.communities.length);
     }
   }

   Algorithm.register(GirvanNewmanAlgorithm);
   ```

2. `src/algorithms/LeidenAlgorithm.ts` - uses `StyleHelpers.color.categorical.tolMuted`
3. `src/algorithms/LabelPropagationAlgorithm.ts` - uses `StyleHelpers.color.categorical.pastel`

**Dependencies**:
- External: `@graphty/algorithms` (girvanNewman, leiden, labelPropagation)
- Internal: Phase 1 for graph-level results

**Verification**:
1. Run: `npm run test:default -- test/girvan-newman*.test.ts test/leiden*.test.ts test/label-propagation*.test.ts`
2. Expected: All community algorithms assign communities correctly

---

### Phase 4: Shortest Path Algorithms

**Objective**: Implement Bellman-Ford and Floyd-Warshall. These require edge result storage and handle special cases (negative cycles, all-pairs distances).

**Tests to Write First**:
- `test/bellman-ford-algorithm.test.ts`:
  ```typescript
  describe("BellmanFordAlgorithm", () => {
    describe("Algorithm Execution", () => {
      it("calculates distances from source to all nodes", async () => {
        const fakeGraph = await mockGraph({dataPath: "./helpers/data4.json"});
        const algo = new BellmanFordAlgorithm(fakeGraph);
        algo.configure({ source: "Valjean" });
        await algo.run();

        for (const node of fakeGraph.nodes.values()) {
          assert.property(node.algorithmResults.graphty["bellman-ford"], "distance");
        }
      });

      it("marks nodes in shortest path", async () => {
        const fakeGraph = await mockGraph({dataPath: "./helpers/data4.json"});
        const algo = new BellmanFordAlgorithm(fakeGraph);
        algo.configure({ source: "Valjean", target: "Cosette" });
        await algo.run();

        let pathNodeCount = 0;
        for (const node of fakeGraph.nodes.values()) {
          if (node.algorithmResults.graphty["bellman-ford"].isInPath) {
            pathNodeCount++;
          }
        }
        assert.isAtLeast(pathNodeCount, 2); // At least source and target
      });

      it("detects negative cycles", async () => {
        const graphWithNegCycle = await mockGraphWithNegativeCycle();
        const algo = new BellmanFordAlgorithm(graphWithNegCycle);
        algo.configure({ source: "A" });
        await algo.run();

        const results = algo.results;
        assert.isTrue(results.graph?.graphty?.["bellman-ford"]?.hasNegativeCycle);
      });
    });

    describe("Suggested Styles", () => {
      it("highlights path edges and nodes", () => {
        const styles = BellmanFordAlgorithm.getSuggestedStyles();
        assert.strictEqual(styles?.category, "path");

        // Should have both edge and node layers
        const hasEdgeLayer = styles?.layers.some(l => l.edge);
        const hasNodeLayer = styles?.layers.some(l => l.node);
        assert.isTrue(hasEdgeLayer);
        assert.isTrue(hasNodeLayer);
      });
    });
  });
  ```

- `test/floyd-warshall-algorithm.test.ts`:
  ```typescript
  describe("FloydWarshallAlgorithm", () => {
    it("computes all-pairs shortest paths", async () => {
      const fakeGraph = await mockGraph({dataPath: "./helpers/data4.json"});
      const algo = new FloydWarshallAlgorithm(fakeGraph);
      await algo.run();

      const results = algo.results;
      assert.property(results, "graph");
      assert.property(results.graph?.graphty?.["floyd-warshall"], "distances");
    });

    it("stores distance matrix on graph", async () => {
      const smallGraph = await mockGraph({dataPath: "./helpers/data1.json"});
      const algo = new FloydWarshallAlgorithm(smallGraph);
      await algo.run();

      // Distance matrix should be accessible
      const distances = algo.results.graph?.graphty?.["floyd-warshall"]?.distances;
      assert.ok(distances);
    });
  });
  ```

**Implementation**:

1. `src/algorithms/BellmanFordAlgorithm.ts`:
   ```typescript
   import {bellmanFord, hasNegativeCycle} from "@graphty/algorithms";
   import {SuggestedStylesConfig} from "../config";
   import {Algorithm} from "./Algorithm";

   interface BellmanFordOptions {
     source: number | string;
     target?: number | string;
   }

   export class BellmanFordAlgorithm extends Algorithm {
     static namespace = "graphty";
     static type = "bellman-ford";
     private options: BellmanFordOptions | null = null;

     static suggestedStyles = (): SuggestedStylesConfig => ({
       layers: [
         {
           edge: {
             selector: "algorithmResults.graphty.bellman-ford.isInPath == `true`",
             style: {
               enabled: true,
               line: { color: "#3498db", width: 4 },
             },
           },
           metadata: {
             name: "Bellman-Ford - Path Edges",
             description: "Highlights shortest path edges in blue",
           },
         },
         {
           node: {
             selector: "algorithmResults.graphty.bellman-ford.isInPath == `true`",
             style: {
               enabled: true,
               texture: { color: "#3498db" },
               effect: { glow: { color: "#3498db", strength: 1.5 } },
             },
           },
           metadata: {
             name: "Bellman-Ford - Path Nodes",
             description: "Highlights path nodes with glow",
           },
         },
         {
           node: {
             selector: "",
             style: { enabled: true },
             calculatedStyle: {
               inputs: ["algorithmResults.graphty.bellman-ford.distancePct"],
               output: "style.opacity",
               expr: "{ return StyleHelpers.opacity.linear(1 - arguments[0]) }",
             },
           },
           metadata: {
             name: "Bellman-Ford - Distance Fade",
             description: "Fade nodes by distance from source",
           },
         },
       ],
       description: "Visualizes shortest paths with support for negative weights",
       category: "path",
     });

     configure(options: BellmanFordOptions): this {
       this.options = options;
       return this;
     }

     async run(): Promise<void> {
       // Implementation using @graphty/algorithms bellmanFord
     }
   }

   Algorithm.register(BellmanFordAlgorithm);
   ```

2. `src/algorithms/FloydWarshallAlgorithm.ts`:
   ```typescript
   // Stores all-pairs distances on graph
   // Suggested style: edge color by normalized distance (heatmap)
   ```

**Dependencies**:
- External: `@graphty/algorithms` (bellmanFord, floydWarshall)
- Internal: Phase 1 edge/graph results

**Verification**:
1. Run: `npm run test:default -- test/bellman-ford*.test.ts test/floyd-warshall*.test.ts`
2. Expected: Path algorithms compute distances and mark paths correctly

**Note**: Floyd-Warshall can be slow on large graphs. Consider adding a size check and warning.

---

### Phase 5: Traversal Algorithms

**Objective**: Implement BFS and DFS traversal algorithms with level/order-based visualization.

**Tests to Write First**:
- `test/bfs-algorithm.test.ts`:
  ```typescript
  describe("BFSAlgorithm", () => {
    describe("Algorithm Execution", () => {
      it("assigns levels to all reachable nodes", async () => {
        const fakeGraph = await mockGraph({dataPath: "./helpers/data4.json"});
        const algo = new BFSAlgorithm(fakeGraph);
        algo.configure({ source: "Valjean" });
        await algo.run();

        // Source should be level 0
        const sourceNode = fakeGraph.nodes.get("Valjean");
        assert.strictEqual(sourceNode?.algorithmResults.graphty.bfs.level, 0);

        // Other nodes should have levels >= 0
        for (const node of fakeGraph.nodes.values()) {
          const level = node.algorithmResults?.graphty?.bfs?.level;
          if (level !== undefined) {
            assert.isAtLeast(level, 0);
          }
        }
      });

      it("records visit order", async () => {
        const fakeGraph = await mockGraph({dataPath: "./helpers/data4.json"});
        const algo = new BFSAlgorithm(fakeGraph);
        algo.configure({ source: "Valjean" });
        await algo.run();

        const visitOrders = new Set<number>();
        for (const node of fakeGraph.nodes.values()) {
          const order = node.algorithmResults?.graphty?.bfs?.visitOrder;
          if (order !== undefined) {
            visitOrders.add(order);
          }
        }

        // Visit orders should be unique
        assert.strictEqual(visitOrders.size, fakeGraph.nodes.size);
      });
    });

    describe("Suggested Styles", () => {
      it("colors by level with rainbow gradient", () => {
        const styles = BFSAlgorithm.getSuggestedStyles();
        const layer = styles?.layers[0];
        assert.ok(layer?.node?.calculatedStyle?.inputs.includes(
          "algorithmResults.graphty.bfs.levelPct"
        ));
      });
    });
  });
  ```

- `test/dfs-algorithm.test.ts`: Similar structure with discovery/finish times

**Implementation**:

1. `src/algorithms/BFSAlgorithm.ts`:
   ```typescript
   import {breadthFirstSearch} from "@graphty/algorithms";
   import {SuggestedStylesConfig} from "../config";
   import {Algorithm} from "./Algorithm";

   export class BFSAlgorithm extends Algorithm {
     static namespace = "graphty";
     static type = "bfs";
     private source: number | string | null = null;

     static suggestedStyles = (): SuggestedStylesConfig => ({
       layers: [
         {
           node: {
             selector: "",
             style: { enabled: true },
             calculatedStyle: {
               inputs: ["algorithmResults.graphty.bfs.levelPct"],
               output: "style.texture.color",
               expr: "{ return StyleHelpers.color.sequential.viridis(arguments[0]) }",
             },
           },
           metadata: {
             name: "BFS - Level Colors",
             description: "Colors nodes by BFS level from source",
           },
         },
         {
           node: {
             selector: "",
             style: { enabled: true },
             calculatedStyle: {
               inputs: ["algorithmResults.graphty.bfs.levelPct"],
               output: "style.shape.size",
               expr: "{ return StyleHelpers.size.linear(1 - arguments[0], 1, 3) }",
             },
           },
           metadata: {
             name: "BFS - Level Size",
             description: "Larger nodes closer to source",
           },
         },
       ],
       description: "Visualizes breadth-first traversal levels from source node",
       category: "hierarchy",
     });

     configure(options: { source: number | string }): this {
       this.source = options.source;
       return this;
     }

     async run(): Promise<void> {
       // Implementation
     }
   }

   Algorithm.register(BFSAlgorithm);
   ```

2. `src/algorithms/DFSAlgorithm.ts`:
   ```typescript
   // Similar structure
   // Stores: discoveryTime, finishTime, visited
   // Style: Color by discovery time
   ```

**Dependencies**:
- External: `@graphty/algorithms` (breadthFirstSearch, depthFirstSearch)
- Internal: None beyond base Algorithm

**Verification**:
1. Run: `npm run test:default -- test/bfs*.test.ts test/dfs*.test.ts`
2. Expected: Traversals assign correct levels and times

---

### Phase 6: Connected Components

**Objective**: Implement connected and strongly connected component detection with categorical coloring.

**Tests to Write First**:
- `test/connected-components-algorithm.test.ts`:
  ```typescript
  describe("ConnectedComponentsAlgorithm", () => {
    describe("Algorithm Execution", () => {
      it("assigns component IDs to all nodes", async () => {
        const fakeGraph = await mockGraph({dataPath: "./helpers/data4.json"});
        const algo = new ConnectedComponentsAlgorithm(fakeGraph);
        await algo.run();

        for (const node of fakeGraph.nodes.values()) {
          assert.property(node.algorithmResults.graphty["connected-components"], "componentId");
          assert.isNumber(node.algorithmResults.graphty["connected-components"].componentId);
        }
      });

      it("stores component count on graph", async () => {
        const fakeGraph = await mockGraph({dataPath: "./helpers/data4.json"});
        const algo = new ConnectedComponentsAlgorithm(fakeGraph);
        await algo.run();

        const results = algo.results;
        assert.property(results.graph?.graphty?.["connected-components"], "componentCount");
      });

      it("detects disconnected components", async () => {
        const disconnectedGraph = await mockDisconnectedGraph();
        const algo = new ConnectedComponentsAlgorithm(disconnectedGraph);
        await algo.run();

        const componentIds = new Set<number>();
        for (const node of disconnectedGraph.nodes.values()) {
          componentIds.add(node.algorithmResults.graphty["connected-components"].componentId);
        }

        assert.isAtLeast(componentIds.size, 2);
      });
    });

    describe("Suggested Styles", () => {
      it("uses categorical colors for components", () => {
        const styles = ConnectedComponentsAlgorithm.getSuggestedStyles();
        assert.strictEqual(styles?.category, "grouping");
      });
    });
  });
  ```

- `test/scc-algorithm.test.ts`: For strongly connected components

**Implementation**:

1. `src/algorithms/ConnectedComponentsAlgorithm.ts`:
   ```typescript
   import {connectedComponents} from "@graphty/algorithms";
   import {SuggestedStylesConfig} from "../config";
   import {Algorithm} from "./Algorithm";

   export class ConnectedComponentsAlgorithm extends Algorithm {
     static namespace = "graphty";
     static type = "connected-components";

     static suggestedStyles = (): SuggestedStylesConfig => ({
       layers: [
         {
           node: {
             selector: "",
             style: { enabled: true },
             calculatedStyle: {
               inputs: ["algorithmResults.graphty.connected-components.componentId"],
               output: "style.texture.color",
               expr: "{ return StyleHelpers.color.categorical.carbon(arguments[0]) }",
             },
           },
           metadata: {
             name: "Components - Carbon Colors",
             description: "5 IBM design system colors for components",
           },
         },
       ],
       description: "Visualizes connected components with distinct colors",
       category: "grouping",
     });

     async run(): Promise<void> {
       const graphData = this.buildGraphData();
       const components = connectedComponents(graphData);

       for (let i = 0; i < components.length; i++) {
         for (const nodeId of components[i]) {
           this.addNodeResult(nodeId, "componentId", i);
         }
       }

       this.addGraphResult("componentCount", components.length);
     }
   }

   Algorithm.register(ConnectedComponentsAlgorithm);
   ```

2. `src/algorithms/StronglyConnectedComponentsAlgorithm.ts`:
   ```typescript
   // Uses stronglyConnectedComponents from @graphty/algorithms
   // Same categorical style pattern
   ```

**Dependencies**:
- External: `@graphty/algorithms` (connectedComponents, stronglyConnectedComponents)
- Internal: Phase 1 graph results

**Verification**:
1. Run: `npm run test:default -- test/connected-components*.test.ts test/scc*.test.ts`
2. Expected: Components correctly identified and colored

---

### Phase 7: Minimum Spanning Tree

**Objective**: Implement Kruskal's and Prim's MST algorithms with edge highlighting.

**Tests to Write First**:
- `test/kruskal-algorithm.test.ts`:
  ```typescript
  describe("KruskalAlgorithm", () => {
    describe("Algorithm Execution", () => {
      it("marks MST edges", async () => {
        const fakeGraph = await mockGraph({dataPath: "./helpers/data4.json"});
        const algo = new KruskalAlgorithm(fakeGraph);
        await algo.run();

        let mstEdgeCount = 0;
        for (const edge of fakeGraph.edges.values()) {
          if (edge.algorithmResults?.graphty?.kruskal?.inMST) {
            mstEdgeCount++;
          }
        }

        // MST has n-1 edges for connected graph with n nodes
        const nodeCount = fakeGraph.nodes.size;
        assert.strictEqual(mstEdgeCount, nodeCount - 1);
      });

      it("calculates total MST weight", async () => {
        const fakeGraph = await mockGraph({dataPath: "./helpers/data4.json"});
        const algo = new KruskalAlgorithm(fakeGraph);
        await algo.run();

        const results = algo.results;
        assert.property(results.graph?.graphty?.kruskal, "totalWeight");
        assert.isNumber(results.graph?.graphty?.kruskal?.totalWeight);
      });
    });

    describe("Suggested Styles", () => {
      it("highlights MST edges in green", () => {
        const styles = KruskalAlgorithm.getSuggestedStyles();
        const edgeLayer = styles?.layers.find(l => l.edge);

        assert.ok(edgeLayer?.edge?.style?.line?.color);
      });
    });
  });
  ```

- Similar test for `prim-algorithm.test.ts`

**Implementation**:

1. `src/algorithms/KruskalAlgorithm.ts`:
   ```typescript
   import {kruskalMST} from "@graphty/algorithms";
   import {SuggestedStylesConfig} from "../config";
   import {Algorithm} from "./Algorithm";

   export class KruskalAlgorithm extends Algorithm {
     static namespace = "graphty";
     static type = "kruskal";

     static suggestedStyles = (): SuggestedStylesConfig => ({
       layers: [
         {
           edge: {
             selector: "algorithmResults.graphty.kruskal.inMST == `true`",
             style: {
               enabled: true,
               line: { color: "#27ae60", width: 4 },
             },
           },
           metadata: {
             name: "Kruskal - MST Edges",
             description: "Highlights minimum spanning tree edges in green",
           },
         },
         {
           edge: {
             selector: "algorithmResults.graphty.kruskal.inMST == `false`",
             style: {
               enabled: true,
               line: { color: "#95a5a6", width: 1 },
               opacity: 0.3,
             },
           },
           metadata: {
             name: "Kruskal - Non-MST Edges",
             description: "Dims edges not in MST",
           },
         },
       ],
       description: "Visualizes minimum spanning tree computed via Kruskal's algorithm",
       category: "path",
     });

     async run(): Promise<void> {
       const graphData = this.buildGraphData();
       const mstResult = kruskalMST(graphData);

       // Create set of MST edge keys for fast lookup
       const mstEdgeKeys = new Set<string>();
       for (const edge of mstResult.edges) {
         mstEdgeKeys.add(`${edge.source}:${edge.target}`);
         mstEdgeKeys.add(`${edge.target}:${edge.source}`);
       }

       // Mark edges
       for (const edge of this.graph.getDataManager().edges.values()) {
         const edgeKey = `${edge.srcId}:${edge.dstId}`;
         const inMST = mstEdgeKeys.has(edgeKey);
         this.addEdgeResult(edge, "inMST", inMST);
       }

       this.addGraphResult("totalWeight", mstResult.totalWeight);
       this.addGraphResult("edgeCount", mstResult.edges.length);
     }
   }

   Algorithm.register(KruskalAlgorithm);
   ```

2. `src/algorithms/PrimAlgorithm.ts`: Same pattern using `primMST`

**Dependencies**:
- External: `@graphty/algorithms` (kruskalMST, primMST)
- Internal: Phase 1 edge/graph results

**Verification**:
1. Run: `npm run test:default -- test/kruskal*.test.ts test/prim*.test.ts`
2. Expected: MST edges correctly identified (n-1 edges for connected graph)

---

### Phase 8: Advanced Algorithms

**Objective**: Implement matching and flow algorithms. These are more specialized and may have different use cases.

**Tests to Write First**:
- `test/bipartite-matching-algorithm.test.ts`:
  ```typescript
  describe("BipartiteMatchingAlgorithm", () => {
    describe("Algorithm Execution", () => {
      it("marks matched edges", async () => {
        const bipartiteGraph = await mockBipartiteGraph();
        const algo = new BipartiteMatchingAlgorithm(bipartiteGraph);
        await algo.run();

        let matchedEdgeCount = 0;
        for (const edge of bipartiteGraph.edges.values()) {
          if (edge.algorithmResults?.graphty?.["bipartite-matching"]?.inMatching) {
            matchedEdgeCount++;
          }
        }

        assert.isAtLeast(matchedEdgeCount, 1);
      });

      it("stores matching size on graph", async () => {
        const bipartiteGraph = await mockBipartiteGraph();
        const algo = new BipartiteMatchingAlgorithm(bipartiteGraph);
        await algo.run();

        const results = algo.results;
        assert.property(results.graph?.graphty?.["bipartite-matching"], "matchingSize");
      });
    });
  });
  ```

- `test/max-flow-algorithm.test.ts`:
  ```typescript
  describe("MaxFlowAlgorithm", () => {
    describe("Algorithm Execution", () => {
      it("calculates flow on each edge", async () => {
        const flowGraph = await mockFlowGraph();
        const algo = new MaxFlowAlgorithm(flowGraph);
        algo.configure({ source: "S", sink: "T" });
        await algo.run();

        for (const edge of flowGraph.edges.values()) {
          assert.property(edge.algorithmResults?.graphty?.["max-flow"], "flow");
        }
      });

      it("stores max flow value on graph", async () => {
        const flowGraph = await mockFlowGraph();
        const algo = new MaxFlowAlgorithm(flowGraph);
        algo.configure({ source: "S", sink: "T" });
        await algo.run();

        const results = algo.results;
        assert.property(results.graph?.graphty?.["max-flow"], "maxFlow");
      });
    });

    describe("Suggested Styles", () => {
      it("uses edge width for flow amount", () => {
        const styles = MaxFlowAlgorithm.getSuggestedStyles();
        const edgeLayer = styles?.layers.find(l => l.edge?.calculatedStyle);

        assert.ok(edgeLayer?.edge?.calculatedStyle?.output.includes("width"));
      });
    });
  });
  ```

**Implementation**:

1. `src/algorithms/BipartiteMatchingAlgorithm.ts`:
   ```typescript
   import {maximumBipartiteMatching} from "@graphty/algorithms";
   import {SuggestedStylesConfig} from "../config";
   import {Algorithm} from "./Algorithm";

   export class BipartiteMatchingAlgorithm extends Algorithm {
     static namespace = "graphty";
     static type = "bipartite-matching";

     static suggestedStyles = (): SuggestedStylesConfig => ({
       layers: [
         {
           edge: {
             selector: "algorithmResults.graphty.bipartite-matching.inMatching == `true`",
             style: {
               enabled: true,
               line: { color: "#9b59b6", width: 4 },
             },
           },
           metadata: {
             name: "Matching - Matched Edges",
             description: "Highlights edges in maximum matching",
           },
         },
       ],
       description: "Visualizes maximum bipartite matching",
       category: "path",
     });

     async run(): Promise<void> {
       // Implementation
     }
   }

   Algorithm.register(BipartiteMatchingAlgorithm);
   ```

2. `src/algorithms/MaxFlowAlgorithm.ts`:
   ```typescript
   import {fordFulkerson} from "@graphty/algorithms";
   import {SuggestedStylesConfig} from "../config";
   import {Algorithm} from "./Algorithm";

   export class MaxFlowAlgorithm extends Algorithm {
     static namespace = "graphty";
     static type = "max-flow";

     static suggestedStyles = (): SuggestedStylesConfig => ({
       layers: [
         {
           edge: {
             selector: "",
             style: { enabled: true },
             calculatedStyle: {
               inputs: ["algorithmResults.graphty.max-flow.flowPct"],
               output: "style.line.width",
               expr: "{ return StyleHelpers.edgeWidth.linear(arguments[0], 1, 8) }",
             },
           },
           metadata: {
             name: "Max Flow - Edge Width",
             description: "Edge width proportional to flow",
           },
         },
         {
           edge: {
             selector: "",
             style: { enabled: true },
             calculatedStyle: {
               inputs: ["algorithmResults.graphty.max-flow.flowPct"],
               output: "style.line.color",
               expr: "{ return StyleHelpers.color.sequential.blues(arguments[0]) }",
             },
           },
           metadata: {
             name: "Max Flow - Edge Color",
             description: "Edge color intensity by flow",
           },
         },
       ],
       description: "Visualizes network flow with edge width and color",
       category: "edge-metric",
     });

     configure(options: { source: number | string; sink: number | string }): this {
       // Store options
       return this;
     }

     async run(): Promise<void> {
       // Implementation using fordFulkerson
     }
   }

   Algorithm.register(MaxFlowAlgorithm);
   ```

3. `src/algorithms/MinCutAlgorithm.ts`: Based on min-cut algorithm

**Dependencies**:
- External: `@graphty/algorithms` (maximumBipartiteMatching, fordFulkerson, minCut)
- Internal: All previous phases

**Verification**:
1. Run: `npm run test:default -- test/bipartite-matching*.test.ts test/max-flow*.test.ts`
2. Expected: Matching and flow computed correctly

---

## Storybook Stories

### Overview

All algorithms will be showcased in a single consolidated story file: `stories/Algorithms.stories.ts`. This provides a centralized location to demonstrate and visually test each algorithm's suggested styles.

### Story File Structure

**File**: `stories/Algorithms.stories.ts`

```typescript
import type {Meta, StoryObj} from "@storybook/web-components-vite";
import {Graphty} from "../src/graphty-element";
import {eventWaitingDecorator, templateCreator} from "./helpers";

const meta: Meta = {
    title: "Algorithms",
    component: "graphty-element",
    decorators: [eventWaitingDecorator],
    parameters: {
        controls: {exclude: /^(#|_)/},
        chromatic: {
            delay: 500,
        },
    },
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/cat-social-network-2.json",
        },
        layout: "ngraph",
        layoutConfig: {
            seed: 42,
        },
    },
};
export default meta;

type Story = StoryObj<Graphty>;

// Helper function for algorithm stories
const createAlgorithmStory = (algorithmId: string): Story => ({
    args: {
        styleTemplate: templateCreator({
            algorithms: [algorithmId],
        }),
        runAlgorithmsOnLoad: true,
    },
    play: async ({canvasElement}) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const element = canvasElement.querySelector("graphty-element") as Graphty;
        if (!element) return;

        element.graph.applySuggestedStyles(algorithmId);
        element.graph.getDataManager().applyStylesToExistingNodes();
        element.graph.getDataManager().applyStylesToExistingEdges();
    },
});

// ============================================
// CENTRALITY ALGORITHMS
// ============================================

/** Degree centrality - colors nodes by connection count */
export const Degree: Story = createAlgorithmStory("graphty:degree");

/** PageRank - sizes nodes by importance */
export const PageRank: Story = createAlgorithmStory("graphty:pagerank");

/** Betweenness centrality - colors bridge nodes */
export const Betweenness: Story = createAlgorithmStory("graphty:betweenness");

/** Closeness centrality - colors by average distance to others */
export const Closeness: Story = createAlgorithmStory("graphty:closeness");

/** Eigenvector centrality - colors by influence */
export const Eigenvector: Story = createAlgorithmStory("graphty:eigenvector");

/** HITS - hub and authority scores */
export const HITS: Story = createAlgorithmStory("graphty:hits");

/** Katz centrality - colors by attenuated paths */
export const Katz: Story = createAlgorithmStory("graphty:katz");

// ============================================
// COMMUNITY DETECTION ALGORITHMS
// ============================================

/** Louvain - categorical colors by detected community */
export const Louvain: Story = createAlgorithmStory("graphty:louvain");

/** Girvan-Newman - community detection via edge removal */
export const GirvanNewman: Story = createAlgorithmStory("graphty:girvan-newman");

/** Leiden - improved community detection */
export const Leiden: Story = createAlgorithmStory("graphty:leiden");

/** Label Propagation - fast community detection */
export const LabelPropagation: Story = createAlgorithmStory("graphty:label-propagation");

// ============================================
// SHORTEST PATH ALGORITHMS
// ============================================

/** Dijkstra - highlights shortest path */
export const Dijkstra: Story = createAlgorithmStory("graphty:dijkstra");

/** Bellman-Ford - shortest path with negative weights */
export const BellmanFord: Story = createAlgorithmStory("graphty:bellman-ford");

/** Floyd-Warshall - all-pairs shortest paths */
export const FloydWarshall: Story = createAlgorithmStory("graphty:floyd-warshall");

// ============================================
// TRAVERSAL ALGORITHMS
// ============================================

/** BFS - colors nodes by level from source */
export const BFS: Story = createAlgorithmStory("graphty:bfs");

/** DFS - colors nodes by discovery time */
export const DFS: Story = createAlgorithmStory("graphty:dfs");

// ============================================
// COMPONENT ALGORITHMS
// ============================================

/** Connected Components - categorical colors by component */
export const ConnectedComponents: Story = createAlgorithmStory("graphty:connected-components");

/** Strongly Connected Components - for directed graphs */
export const SCC: Story = createAlgorithmStory("graphty:scc");

// ============================================
// MINIMUM SPANNING TREE ALGORITHMS
// ============================================

/** Kruskal's MST - highlights MST edges in green */
export const Kruskal: Story = createAlgorithmStory("graphty:kruskal");

/** Prim's MST - highlights MST edges in green */
export const Prim: Story = createAlgorithmStory("graphty:prim");

// ============================================
// ADVANCED ALGORITHMS
// ============================================

/** Bipartite Matching - highlights matched edges */
export const BipartiteMatching: Story = createAlgorithmStory("graphty:bipartite-matching");

/** Max Flow - edge width by flow amount */
export const MaxFlow: Story = createAlgorithmStory("graphty:max-flow");

/** Min Cut - highlights cut edges */
export const MinCut: Story = createAlgorithmStory("graphty:min-cut");
```

### Story Requirements Per Phase

Each phase must include story entries in the `Algorithms.stories.ts` file:

| Phase | Stories to Add |
|-------|----------------|
| Phase 2 | Betweenness, Closeness, Eigenvector, HITS, Katz |
| Phase 3 | GirvanNewman, Leiden, LabelPropagation |
| Phase 4 | BellmanFord, FloydWarshall |
| Phase 5 | BFS, DFS |
| Phase 6 | ConnectedComponents, SCC |
| Phase 7 | Kruskal, Prim |
| Phase 8 | BipartiteMatching, MaxFlow, MinCut |

### Story Verification

After adding stories, verify with:
```bash
npm run storybook  # Visual inspection on port 9025
npm run test:storybook  # Automated story tests
```

### Special Story Configurations

Some algorithms require special configuration (source/target nodes). These should have custom story implementations:

```typescript
/** Dijkstra with custom source/target */
export const DijkstraCustomPath: Story = {
    args: {
        styleTemplate: templateCreator({
            algorithms: ["graphty:dijkstra"],
            algorithmConfig: {
                "graphty:dijkstra": {
                    source: "Whiskers",
                    target: "Shadow",
                },
            },
        }),
        runAlgorithmsOnLoad: true,
    },
    play: async ({canvasElement}) => {
        // ... standard play function
    },
};

/** BFS from specific source */
export const BFSFromSource: Story = {
    args: {
        styleTemplate: templateCreator({
            algorithms: ["graphty:bfs"],
            algorithmConfig: {
                "graphty:bfs": {
                    source: "Whiskers",
                },
            },
        }),
        runAlgorithmsOnLoad: true,
    },
    // ...
};
```

---

## Common Utilities Needed

### Graph Data Converter
- **File**: `src/algorithms/utils/graphConverter.ts`
- **Purpose**: Convert graphty-element Graph to @graphty/algorithms Graph format
- **Used by**: All algorithm implementations

### Mock Graph Helper
- **File**: `test/helpers/mockGraph.ts`
- **Purpose**: Create mock graph objects for testing without full Graph instantiation
- **Used by**: All algorithm test files

### Test Data Files
- **Existing**: `test/helpers/data1.json` through `data5.json`
- **New needed**:
  - `test/helpers/bipartite-graph.json`: For matching tests
  - `test/helpers/flow-network.json`: For flow tests
  - `test/helpers/negative-cycle-graph.json`: For Bellman-Ford tests
  - `test/helpers/disconnected-graph.json`: For component tests

---

## External Libraries Assessment

| Task | Library | Reason |
|------|---------|--------|
| All algorithms | `@graphty/algorithms` | Already in use, comprehensive implementation |
| Deep object setting | `lodash/set` | Already in use for result storage |
| JMESPath queries | `@metrichor/jmespath` | Already in use for selectors |

No additional external libraries needed - the project already has all required dependencies.

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| **Performance on large graphs** | Add size warnings for O(n³) algorithms (Floyd-Warshall). Consider lazy evaluation for all-pairs results. |
| **@graphty/algorithms API changes** | Pin version in package.json. Create adapter layer in graphConverter.ts. |
| **Edge result storage conflicts** | Use consistent namespace/type prefixing. Clear documentation on result paths. |
| **Test data edge cases** | Include tests for: empty graphs, single node, disconnected components, self-loops. |
| **Categorical color exhaustion** | Document behavior when community count exceeds palette size (colors cycle). |
| **Negative weights handling** | Validate algorithm choice in run() methods. Throw clear errors for invalid inputs. |

---

## Test Data Requirements

Create the following test helper files:

```typescript
// test/helpers/mockGraph.ts
export async function mockGraph(opts: MockGraphOpts = {}): Promise<MockGraph> {
  // Implementation for creating test graphs
}

export async function mockGraphWithEdges(): Promise<MockGraph> {
  // Graph with edge results support
}

export async function mockBipartiteGraph(): Promise<MockGraph> {
  // Two-partition graph for matching tests
}

export async function mockFlowGraph(): Promise<MockGraph> {
  // Directed graph with capacity edges
}

export async function mockDisconnectedGraph(): Promise<MockGraph> {
  // Graph with multiple components
}

export async function mockGraphWithNegativeCycle(): Promise<MockGraph> {
  // Graph with negative weight cycle
}
```

---

## Success Criteria

- [ ] All 27 algorithms from `@graphty/algorithms` have wrapper implementations
- [ ] Each algorithm properly stores results on appropriate graph elements
- [ ] Each algorithm provides meaningful suggested styles using StyleHelpers
- [ ] All algorithms have unit tests covering:
  - Registration (namespace/type)
  - Execution (results stored correctly)
  - Suggested styles (correct structure)
  - Edge cases (empty graphs, single nodes)
- [ ] All algorithms have Storybook stories in `stories/Algorithms.stories.ts`
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] `npm run test:default` passes all tests
- [ ] `npm run test:storybook` passes all story tests
- [ ] No performance regressions on existing functionality

---

## Implementation Checklist

### Phase 1: Infrastructure
- [ ] Implement `addEdgeResult()` in Algorithm.ts
- [ ] Implement `addGraphResult()` in Algorithm.ts
- [ ] Update `results` getter for edge/graph results
- [ ] Add `algorithmResults` to Edge type/class
- [ ] Add `graphResults` to DataManager
- [ ] Write and pass infrastructure tests
- [ ] Create `stories/Algorithms.stories.ts` with initial structure
- [ ] Add stories for existing Phase 1 algorithms (Degree, PageRank, Louvain, Dijkstra)

### Phase 2: Centrality (5 algorithms)
- [ ] BetweennessCentralityAlgorithm with suggestedStyles using `sequential.plasma`
- [ ] ClosenessCentralityAlgorithm with suggestedStyles using `sequential.greens`
- [ ] EigenvectorCentralityAlgorithm with suggestedStyles using `sequential.oranges`
- [ ] HITSAlgorithm with suggestedStyles using combined size/color
- [ ] KatzCentralityAlgorithm with suggestedStyles using `sequential.blues`
- [ ] Create graphConverter utility
- [ ] Add stories: Betweenness, Closeness, Eigenvector, HITS, Katz
- [ ] All tests passing

### Phase 3: Community Detection (3 algorithms)
- [ ] GirvanNewmanAlgorithm with suggestedStyles using `categorical.tolVibrant`
- [ ] LeidenAlgorithm with suggestedStyles using `categorical.tolMuted`
- [ ] LabelPropagationAlgorithm with suggestedStyles using `categorical.pastel`
- [ ] Add stories: GirvanNewman, Leiden, LabelPropagation
- [ ] All tests passing

### Phase 4: Shortest Path (2 algorithms)
- [ ] BellmanFordAlgorithm with suggestedStyles using `binary.blueHighlight`
- [ ] FloydWarshallAlgorithm with suggestedStyles using sequential heatmap
- [ ] Negative cycle test data
- [ ] Add stories: BellmanFord, FloydWarshall
- [ ] All tests passing

### Phase 5: Traversal (2 algorithms)
- [ ] BFSAlgorithm with suggestedStyles using `sequential.viridis`
- [ ] DFSAlgorithm with suggestedStyles using `sequential.inferno`
- [ ] Add stories: BFS, DFS (with source configuration)
- [ ] All tests passing

### Phase 6: Components (2 algorithms)
- [ ] ConnectedComponentsAlgorithm with suggestedStyles using `categorical.carbon`
- [ ] StronglyConnectedComponentsAlgorithm with suggestedStyles using `categorical.okabeIto`
- [ ] Disconnected graph test data
- [ ] Add stories: ConnectedComponents, SCC
- [ ] All tests passing

### Phase 7: MST (2 algorithms)
- [ ] KruskalAlgorithm with suggestedStyles using `binary.greenSuccess`
- [ ] PrimAlgorithm with suggestedStyles using `binary.greenSuccess`
- [ ] Add stories: Kruskal, Prim
- [ ] All tests passing

### Phase 8: Advanced (3 algorithms)
- [ ] BipartiteMatchingAlgorithm with suggestedStyles using binary highlight
- [ ] MaxFlowAlgorithm with suggestedStyles using `edgeWidth.linear` + `sequential.blues`
- [ ] MinCutAlgorithm with suggestedStyles using `binary.orangeWarning`
- [ ] Flow/bipartite test data
- [ ] Add stories: BipartiteMatching, MaxFlow, MinCut
- [ ] All tests passing

### Final Verification
- [ ] Update `src/algorithms/index.ts` with all exports
- [ ] Verify all stories render correctly in Storybook
- [ ] Run `npm run ready:commit`
- [ ] All lint, build, test passing
- [ ] `npm run test:storybook` passes
- [ ] Documentation updated

---

## Algorithm Summary Table

| Algorithm | Namespace | Type | Category | Result Location | StyleHelper |
|-----------|-----------|------|----------|-----------------|-------------|
| Betweenness | graphty | betweenness | node-metric | node | sequential.plasma |
| Closeness | graphty | closeness | node-metric | node | sequential.greens |
| Eigenvector | graphty | eigenvector | node-metric | node | sequential.oranges |
| HITS | graphty | hits | node-metric | node | combined |
| Katz | graphty | katz | node-metric | node | sequential.blues |
| Girvan-Newman | graphty | girvan-newman | grouping | node + graph | categorical.tolVibrant |
| Leiden | graphty | leiden | grouping | node | categorical.tolMuted |
| Label Propagation | graphty | label-propagation | grouping | node | categorical.pastel |
| Bellman-Ford | graphty | bellman-ford | path | node + edge + graph | binary.blueHighlight |
| Floyd-Warshall | graphty | floyd-warshall | path | graph | sequential (heatmap) |
| BFS | graphty | bfs | hierarchy | node | sequential.viridis |
| DFS | graphty | dfs | hierarchy | node | sequential.inferno |
| Connected Components | graphty | connected-components | grouping | node + graph | categorical.carbon |
| SCC | graphty | scc | grouping | node + graph | categorical.okabeIto |
| Kruskal | graphty | kruskal | path | edge + graph | binary.greenSuccess |
| Prim | graphty | prim | path | edge + graph | binary.greenSuccess |
| Bipartite Matching | graphty | bipartite-matching | path | edge + graph | binary highlight |
| Max Flow | graphty | max-flow | edge-metric | edge + graph | edgeWidth + blues |
| Min Cut | graphty | min-cut | path | edge + graph | binary.orangeWarning |
