# Implementation Plan for Code Review Fixes (11/27/2025)

## Overview

This plan addresses the findings from the code review document, implementing fixes for:
- High priority: Hardcoded colors (→ StyleHelpers), DegreeAlgorithm bug, NaN division
- Medium priority: Louvain/Leiden code duplication, adjacency list utilities, test mock typing, graph-level results consistency
- Low priority: Extra semicolon, palettes index export

The implementation is organized into 4 phases, each delivering independently testable improvements.

---

## Phase Breakdown

### Phase 1: Algorithm Correctness Fixes

**Objective**: Fix algorithmic correctness issues (DegreeAlgorithm in/out swap, NaN division) that could cause incorrect visualization results.

**Duration**: 1 day

**Tests to Write First**:

- `test/algorithms/degree-algorithm.test.ts`: Test in/out degree correctness
  ```typescript
  describe("DegreeAlgorithm", () => {
    it("correctly calculates in-degree for destination nodes", async () => {
      // Graph: A -> B, A -> C (A has outDegree=2, B/C have inDegree=1)
      const graph = createMockGraph({
        nodes: ["A", "B", "C"],
        edges: [{ src: "A", dst: "B" }, { src: "A", dst: "C" }]
      });

      const alg = new DegreeAlgorithm(graph);
      await alg.run();

      // Source node A should have outDegree=2, inDegree=0
      assert.equal(graph.nodes.get("A").algorithmResults.graphty.degree.outDegree, 2);
      assert.equal(graph.nodes.get("A").algorithmResults.graphty.degree.inDegree, 0);

      // Destination nodes B/C should have inDegree=1, outDegree=0
      assert.equal(graph.nodes.get("B").algorithmResults.graphty.degree.inDegree, 1);
      assert.equal(graph.nodes.get("B").algorithmResults.graphty.degree.outDegree, 0);
    });

    it("handles empty graph without NaN", async () => {
      const graph = createMockGraph({ nodes: ["A"], edges: [] });
      const alg = new DegreeAlgorithm(graph);
      await alg.run();

      // Should return 0, not NaN
      const result = graph.nodes.get("A").algorithmResults.graphty.degree;
      assert.equal(result.degreePct, 0);
      assert.equal(Number.isNaN(result.degreePct), false);
    });

    it("stores graph-level results", async () => {
      const graph = createMockGraph({...});
      const alg = new DegreeAlgorithm(graph);
      await alg.run();

      // Graph-level results should be present
      assert.equal(graph.algorithmResults.graphty.degree.maxDegree, expectedMax);
    });
  });
  ```

**Implementation**:

- `src/algorithms/DegreeAlgorithm.ts`: Fix in/out degree swap and NaN division
  ```typescript
  // Line 47-52: Fix the swap
  for (const e of g.getDataManager().edges.values()) {
      incrementMap(outDegreeMap, e.srcId);  // Correct: source has outgoing edge
      incrementMap(inDegreeMap, e.dstId);   // Correct: destination has incoming edge
      incrementMap(degreeMap, e.srcId);
      incrementMap(degreeMap, e.dstId);
  }

  // Lines 54-56: Fix NaN with safe max
  const maxInDegree = Math.max(0, ...inDegreeMap.values());
  const maxOutDegree = Math.max(0, ...outDegreeMap.values());
  const maxDegree = Math.max(0, ...degreeMap.values());

  // Lines 65-67: Safe division
  this.addNodeResult(n.id, "inDegreePct", maxInDegree > 0 ? inDegree / maxInDegree : 0);
  this.addNodeResult(n.id, "outDegreePct", maxOutDegree > 0 ? outDegree / maxOutDegree : 0);
  this.addNodeResult(n.id, "degreePct", maxDegree > 0 ? degree / maxDegree : 0);

  // Add graph-level results (new)
  this.addGraphResult("maxInDegree", maxInDegree);
  this.addGraphResult("maxOutDegree", maxOutDegree);
  this.addGraphResult("maxDegree", maxDegree);
  ```

- `src/algorithms/DegreeAlgorithm.ts`: Remove extra semicolon (line 40)

**Dependencies**:
- External: None
- Internal: None

**Verification**:
1. Run: `npm run test:default -- --filter="DegreeAlgorithm"`
2. Expected: All tests pass, no NaN values, in/out degrees correctly assigned
3. Run: `npm run lint` - should pass without new errors

---

### Phase 2: Replace Hardcoded Colors with StyleHelpers

**Objective**: Replace all hardcoded hex colors in algorithm `suggestedStyles` with StyleHelpers or palette constants for colorblind safety.

**Duration**: 1-2 days

**Tests to Write First**:

- `test/style-helpers/algorithm-suggested-styles.test.ts`: Validate all algorithms use StyleHelpers
  ```typescript
  import {Algorithm} from "../../src/algorithms/Algorithm";

  describe("Algorithm suggestedStyles", () => {
    it("all algorithms with binary highlighting use StyleHelpers", () => {
      // Get all registered algorithms
      const algorithms = Algorithm.getRegistry();

      const hardcodedColorPattern = /#[0-9a-fA-F]{6}/g;
      const offendingAlgorithms: string[] = [];

      for (const [name, AlgorithmClass] of algorithms) {
        if (AlgorithmClass.suggestedStyles) {
          const styles = AlgorithmClass.suggestedStyles();
          const stylesJson = JSON.stringify(styles);

          // Check for hardcoded colors
          if (hardcodedColorPattern.test(stylesJson)) {
            offendingAlgorithms.push(name);
          }
        }
      }

      assert.deepEqual(offendingAlgorithms, [],
        `Algorithms with hardcoded colors: ${offendingAlgorithms.join(", ")}`);
    });

    it("all algorithms use calculatedStyle or palette imports for colors", () => {
      // Verify patterns used are correct
      // ...
    });
  });
  ```

**Implementation**:

Algorithms to update with their new patterns:

1. `src/algorithms/DijkstraAlgorithm.ts` (lines 27-28, 46-47, 52-53):
   ```typescript
   static suggestedStyles = (): SuggestedStylesConfig => ({
       layers: [
           {
               edge: {
                   selector: "algorithmResults.graphty.dijkstra.isInPath == `true`",
                   style: { enabled: true },
                   calculatedStyle: {
                       inputs: ["algorithmResults.graphty.dijkstra.isInPath"],
                       output: "style.line.color",
                       expr: "{ return StyleHelpers.color.binary.blueHighlight(arguments[0]) }",
                   },
               },
               // ... width remains static
           },
           {
               node: {
                   selector: "algorithmResults.graphty.dijkstra.isInPath == `true`",
                   style: { enabled: true },
                   calculatedStyle: {
                       inputs: ["algorithmResults.graphty.dijkstra.isInPath"],
                       output: "style.texture.color",
                       expr: "{ return StyleHelpers.color.binary.blueHighlight(arguments[0]) }",
                   },
               },
               // glow effect also uses calculatedStyle
           },
       ],
   });
   ```

2. `src/algorithms/KruskalAlgorithm.ts` (lines 27, 44):
   ```typescript
   // Use greenSuccess for MST edges (success/highlighted)
   calculatedStyle: {
       inputs: ["algorithmResults.graphty.kruskal.inMST"],
       output: "style.line.color",
       expr: "{ return StyleHelpers.color.binary.greenSuccess(arguments[0]) }",
   },
   ```

3. `src/algorithms/PrimAlgorithm.ts` (lines 36, 53):
   - Same pattern as Kruskal (MST algorithm)

4. `src/algorithms/MinCutAlgorithm.ts` (lines 32, 50, 65, 80):
   ```typescript
   // Cut edges: use orangeWarning
   // Partitions: use categorical colors from a two-color palette
   calculatedStyle: {
       inputs: ["algorithmResults.graphty.\"min-cut\".partition"],
       output: "style.texture.color",
       expr: "{ return StyleHelpers.color.categorical.okabeIto(Number(arguments[0]) - 1) }",
   },
   ```

5. `src/algorithms/MaxFlowAlgorithm.ts` (lines 60, 65, 79, 84):
   ```typescript
   // Source node: greenSuccess(true)
   // Sink node: use orangeWarning(true) or a different binary helper
   calculatedStyle: {
       inputs: ["algorithmResults.graphty.\"max-flow\".isSource"],
       output: "style.texture.color",
       expr: "{ return StyleHelpers.color.binary.greenSuccess(arguments[0]) }",
   },
   ```

6. `src/algorithms/BipartiteMatchingAlgorithm.ts` (lines 28, 44, 60, 75):
   ```typescript
   // Matched edges: use blueHighlight or custom purple from palette
   // Partitions: use categorical okabeIto for left/right
   ```

**New Addition - Palette Index Export**:

- `src/config/palettes/index.ts` (new file):
  ```typescript
  export * from "./binary";
  export * from "./sequential";
  export * from "./categorical";
  export * from "./diverging";
  ```

**Dependencies**:
- External: None
- Internal: Phase 1 and 2 (algorithms should be correct before changing visuals)

**Verification**:
1. Run: `npm run test:default` - all tests pass
2. Run: `npm run lint` - no new errors
3. Visual verification: Run Storybook, verify algorithm stories still render correctly
4. Run: `npm run test:storybook` - Storybook tests pass

---

### Phase 3: Extract Shared Utilities

**Objective**: Reduce code duplication by extracting common patterns into shared utilities (adjacency list builder, community detection base methods).

**Duration**: 1-2 days

**Tests to Write First**:

- `test/algorithms/utils/graph-utils.test.ts`: Test shared utilities
  ```typescript
  describe("graph utilities", () => {
    describe("buildAdjacencyList", () => {
      it("builds undirected adjacency list", () => {
        const graph = createMockGraph({
          nodes: ["A", "B", "C"],
          edges: [{ src: "A", dst: "B" }]
        });

        const adj = buildAdjacencyList(graph, { directed: false });

        assert.isTrue(adj.get("A")?.has("B"));
        assert.isTrue(adj.get("B")?.has("A")); // Undirected
      });

      it("builds directed adjacency list", () => {
        const graph = createMockGraph({
          nodes: ["A", "B"],
          edges: [{ src: "A", dst: "B" }]
        });

        const adj = buildAdjacencyList(graph, { directed: true });

        assert.isTrue(adj.get("A")?.has("B"));
        assert.isFalse(adj.get("B")?.has("A")); // Directed
      });

      it("includes edge weights when available", () => {
        const graph = createMockGraph({
          nodes: ["A", "B"],
          edges: [{ src: "A", dst: "B", weight: 5 }]
        });

        const adj = buildAdjacencyList(graph, { includeWeights: true });

        assert.equal(adj.get("A")?.get("B"), 5);
      });
    });
  });
  ```

- `test/algorithms/utils/community-utils.test.ts`: Test community detection utilities
  ```typescript
  describe("community utilities", () => {
    describe("calculateModularity", () => {
      it("returns 0 for empty graph", () => {
        const graph = createMockGraph({ nodes: [], edges: [] });
        const communities = new Map();

        assert.equal(calculateModularity(graph, communities, 1.0), 0);
      });

      it("calculates correct modularity for simple graph", () => {
        // Test with known modularity value
      });
    });

    describe("getNodeDegree", () => {
      it("counts both incoming and outgoing edges", () => {
        // ...
      });
    });
  });
  ```

**Implementation**:

- `src/algorithms/utils/graphUtils.ts` (new file):
  ```typescript
  import type {Graph} from "../../graph/Graph";

  export interface AdjacencyOptions {
      directed?: boolean;
      includeWeights?: boolean;
  }

  /**
   * Build an adjacency list from graph edges
   * @param graph - The graph to build adjacency from
   * @param options - Configuration options
   * @returns Map of node ID to Set of neighbor IDs (or Map if weights included)
   */
  export function buildAdjacencyList(
      graph: Graph,
      options: AdjacencyOptions = {}
  ): Map<string, Set<string>> {
      const { directed = false } = options;
      const adjacency = new Map<string, Set<string>>();
      const { nodes, edges } = graph.getDataManager();

      // Initialize all nodes
      for (const nodeId of nodes.keys()) {
          adjacency.set(String(nodeId), new Set());
      }

      // Add edges
      for (const edge of edges.values()) {
          const src = String(edge.srcId);
          const dst = String(edge.dstId);

          adjacency.get(src)?.add(dst);

          if (!directed) {
              adjacency.get(dst)?.add(src);
          }
      }

      return adjacency;
  }

  export function buildWeightedAdjacencyList(
      graph: Graph,
      options: AdjacencyOptions = {}
  ): Map<string, Map<string, number>> {
      // Similar but with weights
  }
  ```

- `src/algorithms/utils/communityUtils.ts` (new file):
  ```typescript
  /**
   * Shared utilities for community detection algorithms (Louvain, Leiden)
   */

  export function calculateModularity(
      graph: Graph,
      communities: Map<number | string, number>,
      resolution: number
  ): number {
      // Extracted from LouvainAlgorithm.calculateModularity
  }

  export function nodeModularityContribution(
      graph: Graph,
      nodeId: number | string,
      community: number,
      communities: Map<number | string, number>,
      resolution: number
  ): number {
      // Extracted from LouvainAlgorithm.nodeModularityContribution
  }

  export function getNeighborCommunities(
      graph: Graph,
      nodeId: number | string,
      communities: Map<number | string, number>
  ): Set<number> {
      // Extracted from LouvainAlgorithm.getNeighborCommunities
  }

  export function extractCommunities(
      communities: Map<number | string, number>
  ): (number | string)[][] {
      // Extracted from LouvainAlgorithm.extractCommunities
  }

  export function getTotalEdgeWeight(graph: Graph): number {
      // Extracted from LouvainAlgorithm.getTotalEdgeWeight
  }

  export function getNodeDegree(graph: Graph, nodeId: number | string): number {
      // Extracted from LouvainAlgorithm.getNodeDegree
  }
  ```

- `src/algorithms/utils/index.ts`: Export all utilities
  ```typescript
  export * from "./graphUtils";
  export * from "./communityUtils";
  export * from "./graphConverter"; // existing
  ```

- Update algorithms to use shared utilities:
  - `src/algorithms/LouvainAlgorithm.ts`: Import and use from communityUtils
  - `src/algorithms/LeidenAlgorithm.ts`: Import and use from communityUtils
  - `src/algorithms/DijkstraAlgorithm.ts`: Use buildWeightedAdjacencyList
  - `src/algorithms/ConnectedComponentsAlgorithm.ts`: Use buildAdjacencyList
  - `src/algorithms/DFSAlgorithm.ts`: Use buildAdjacencyList
  - `src/algorithms/StronglyConnectedComponentsAlgorithm.ts`: Use buildAdjacencyList

**Dependencies**:
- External: None
- Internal: Phases 1-3 (algorithms should be correct before refactoring)

**Verification**:
1. Run: `npm run test:default` - all tests pass (existing + new utility tests)
2. Run: `npm run lint` - no new errors
3. Run: `npm run build` - builds successfully
4. Verify no functional changes by running existing algorithm tests

---

### Phase 4: Test Infrastructure Improvements

**Objective**: Improve test infrastructure with proper typing for mock graphs and add graph-level results to PageRankAlgorithm for consistency.

**Duration**: 1 day

**Tests to Write First**:

- Update `test/algorithms/algorithm.test.ts` with proper typing:
  ```typescript
  import type {NodeData, EdgeData} from "../../src/config";

  interface MockNode extends NodeData {
      algorithmResults?: Record<string, unknown>;
  }

  interface MockEdge extends EdgeData {
      algorithmResults?: Record<string, unknown>;
  }

  interface MockGraph {
      nodes: Map<string | number, MockNode>;
      edges: Map<string | number, MockEdge>;
      algorithmResults?: Record<string, unknown>;
      getDataManager(): {
          nodes: Map<string | number, MockNode>;
          edges: Map<string | number, MockEdge>;
      };
  }

  function createMockGraph(opts: MockGraphOpts = {}): MockGraph {
      // Properly typed mock graph factory
  }
  ```

- `test/algorithms/pagerank-algorithm.test.ts`: Verify graph-level results
  ```typescript
  describe("PageRankAlgorithm", () => {
    it("stores graph-level convergence info", async () => {
      const graph = createMockGraph({...});
      const alg = new PageRankAlgorithm(graph);
      await alg.run();

      assert.isDefined(graph.algorithmResults?.graphty?.pagerank?.iterations);
      assert.isDefined(graph.algorithmResults?.graphty?.pagerank?.converged);
    });
  });
  ```

**Implementation**:

- `test/helpers/mockGraph.ts` (new file):
  ```typescript
  /**
   * Shared mock graph factory for algorithm tests
   */
  import type {NodeData, EdgeData} from "../../src/config";

  export interface MockGraphOpts {
      nodes?: Array<{ id: string | number; [key: string]: unknown }>;
      edges?: Array<{ srcId: string | number; dstId: string | number; [key: string]: unknown }>;
      dataPath?: string;
  }

  export interface MockNode extends NodeData {
      algorithmResults?: Record<string, unknown>;
  }

  export interface MockEdge extends EdgeData {
      algorithmResults?: Record<string, unknown>;
  }

  export interface MockGraph {
      nodes: Map<string | number, MockNode>;
      edges: Map<string | number, MockEdge>;
      algorithmResults?: Record<string, unknown>;
      getDataManager(): {
          nodes: Map<string | number, MockNode>;
          edges: Map<string | number, MockEdge>;
      };
  }

  export async function createMockGraph(opts: MockGraphOpts = {}): Promise<MockGraph> {
      const nodes = new Map<string | number, MockNode>();
      const edges = new Map<string | number, MockEdge>();

      if (opts.nodes) {
          for (const n of opts.nodes) {
              nodes.set(n.id, n as MockNode);
          }
      }

      if (opts.edges) {
          for (const e of opts.edges) {
              edges.set(`${e.srcId}:${e.dstId}`, e as MockEdge);
          }
      }

      if (typeof opts.dataPath === "string") {
          const imp = await import(opts.dataPath);
          for (const n of imp.nodes) {
              nodes.set(n.id, n);
          }
          for (const e of imp.edges) {
              edges.set(`${e.srcId}:${e.dstId}`, e);
          }
      }

      return {
          nodes,
          edges,
          getDataManager() {
              return { nodes, edges };
          },
      };
  }
  ```

- `src/algorithms/PageRankAlgorithm.ts`: Add graph-level results
  ```typescript
  // After the main loop, add:
  this.addGraphResult("iterations", iteration);
  this.addGraphResult("converged", hasConverged);
  this.addGraphResult("dampingFactor", dampingFactor);
  ```

- Update existing test files to use shared mock:
  - `test/algorithms/algorithm.test.ts`
  - `test/algorithms/algorithm-infrastructure.test.ts`

**Dependencies**:
- External: None
- Internal: None (can run in parallel with Phase 3)

**Verification**:
1. Run: `npm run test:default` - all tests pass with no type errors
2. Run: `npm run lint` - no eslint-disable comments for any in test mocks
3. Run: `npm run build` - builds successfully

---

## Common Utilities Needed

| Utility | Purpose | Used By |
|---------|---------|---------|
| `buildAdjacencyList()` | Build node adjacency from edges | Dijkstra, DFS, BFS, ConnectedComponents, SCC |
| `buildWeightedAdjacencyList()` | Build weighted adjacency | Dijkstra, community algorithms |
| `calculateModularity()` | Compute graph modularity | Louvain, Leiden |
| `nodeModularityContribution()` | Node's modularity contribution | Louvain, Leiden |
| `getNeighborCommunities()` | Find neighbor communities | Louvain, Leiden |
| `extractCommunities()` | Convert community map to arrays | Louvain, Leiden |
| `getTotalEdgeWeight()` | Sum all edge weights | Louvain, Leiden |
| `getNodeDegree()` | Count node degree | Louvain, Leiden, Degree |
| `createMockGraph()` | Type-safe test mock factory | All algorithm tests |

---

## External Libraries Assessment

No external libraries are needed for these fixes. All changes use existing code patterns and the established StyleHelpers/palette system.

---

## Risk Mitigation

| Risk | Mitigation Strategy |
|------|---------------------|
| Breaking existing visualizations | Run visual tests after Phase 2 to verify appearance |
| Performance regression in utility extraction | Benchmark key algorithms before/after Phase 3 |
| Type errors in shared utilities | Write comprehensive tests before implementation |
| Changing algorithm results format | Keep backward compatibility for all result keys |
| Test suite becomes slower | Use efficient mock graph creation, avoid redundant setup |

---

## Implementation Order Summary

```
Phase 1 (Day 1): Algorithm Correctness
  └── Fix DegreeAlgorithm in/out swap
  └── Fix NaN division
  └── Add graph-level results to DegreeAlgorithm

Phase 2 (Day 2-3): Visual Consistency
  └── Replace hardcoded colors in 6 algorithms
  └── Create palettes index export

Phase 3 (Day 4-5): Code Quality
  └── Extract adjacency list utilities
  └── Extract community detection utilities
  └── Refactor algorithms to use utilities

Phase 4 (Day 6): Test Quality
  └── Create typed mock graph factory
  └── Add graph-level results to PageRankAlgorithm
  └── Update all tests to use typed mocks
```

---

## Success Criteria

1. **All tests pass**: `npm run test:default`, `npm run test:storybook`
2. **No lint errors**: `npm run lint` passes
3. **Build succeeds**: `npm run build` completes
4. **No hardcoded colors**: All algorithm `suggestedStyles` use StyleHelpers or palette imports
5. **Algorithm correctness**: DegreeAlgorithm in/out degree matches edge direction
6. **No NaN values**: Empty graphs produce 0, not NaN
7. **Code reuse**: ~200 lines of duplicate code eliminated from Louvain/Leiden
8. **Type safety**: No eslint-disable comments for `any` in test mocks
