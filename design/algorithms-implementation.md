# Algorithm Implementations Strategy

## Overview

This document outlines the strategy for implementing wrapper classes in `graphty-element` for all algorithms available in the `@graphty/algorithms` package. These wrappers integrate the pure algorithm functions with the visualization system, storing results on graph elements and providing suggested styles for visualization.

## Current State

### Implemented
- **DegreeAlgorithm** (`src/algorithms/DegreeAlgorithm.ts`) - Only existing implementation
  - Calculates degree, inDegree, outDegree and normalized percentages
  - Stores results on nodes via `addNodeResult()`

### Available in @graphty/algorithms
The `@graphty/algorithms` package contains **~27 algorithm implementations** across 8 categories:

1. **Centrality** (7 algorithms): degree, betweenness, closeness, eigenvector, HITS, Katz, PageRank
2. **Community Detection** (4 algorithms): girvan-newman, label-propagation, leiden, louvain
3. **Shortest Path** (3 algorithms): bellman-ford, dijkstra, floyd-warshall
4. **Traversal** (3 algorithms): BFS, DFS, and variants
5. **Components** (2 algorithms): connected components, strongly connected components
6. **MST** (2 algorithms): Kruskal, Prim
7. **Matching** (2+ algorithms): maximum matching, etc.
8. **Flow** (2+ algorithms): max flow, min cost flow, etc.

### Gap Analysis
- **27 algorithms** need wrapper implementations
- 4 will be implemented during Phase 1 of suggested styles feature
- **23 algorithms** remain for Phase 2 implementation

## Implementation Requirements

Each algorithm wrapper must:

### 1. Core Implementation
```typescript
export class AlgorithmNameAlgorithm extends Algorithm {
  static namespace = "graphty";  // or package-specific namespace
  static type = "algorithm-name";

  async run(): Promise<void> {
    // 1. Extract graph data in format expected by @graphty/algorithms
    // 2. Call the algorithm function from @graphty/algorithms
    // 3. Process results and store on appropriate elements
    // 4. Handle any errors gracefully
  }
}
```

### 2. Result Storage
- Use `addNodeResult(nodeId, resultName, value)` for node-level results
- Use `addEdgeResult(edge, resultName, value)` for edge-level results (TODO: needs implementation)
- Use `addGraphResult(graph, resultName, value)` for graph-level results (TODO: needs implementation)
- Store both raw values and normalized/percentage values where applicable
- Follow naming convention: `<metric>` for raw, `<metric>Pct` for normalized [0,1]

### 3. Suggested Styles
- Implement static `suggestedStyles(): SuggestedStylesConfig` method
- Provide visually meaningful default visualization
- Use appropriate style pattern for algorithm type:
  - **Continuous metrics**: Size/color gradients
  - **Categorical data**: Discrete color mapping
  - **Paths/routes**: Edge highlighting + glow effects
  - **Hierarchies**: Level-based coloring
  - **Rankings**: Size scaling with color intensity

### 4. Registration
- Algorithm automatically registered via `@Algorithm.register()` decorator or manual registration
- Accessible via `Algorithm.get(graph, namespace, type)`

### 5. Testing
- Unit tests for algorithm execution
- Tests for result storage on correct elements
- Tests for suggested styles generation
- Storybook story demonstrating visualization

### 6. Documentation
- JSDoc comments explaining algorithm purpose
- Link to algorithm documentation in `@graphty/algorithms`
- Example usage in comments
- Describe suggested style behavior

## Implementation Strategy

### Phased Approach

#### Phase 1: Foundation (Completed during Suggested Styles feature)
**Algorithms**: Degree, PageRank, Louvain, Dijkstra
**Duration**: 4-5 days (included in suggested styles timeline)
**Goal**: Validate the pattern with representative algorithms

#### Phase 2: Systematic Implementation
**Algorithms**: Remaining 23 algorithms
**Duration**: 5-7 days
**Goal**: Complete coverage of all algorithm types

### Phase 2 Implementation Batches

#### Batch 1: Remaining Centrality Algorithms (1.5-2 days)
Implement wrappers for centrality metrics (all produce continuous node scores):

1. **BetweennessCentralityAlgorithm**
   - Wraps: `betweennessCentrality()` from `@graphty/algorithms`
   - Results: `betweenness`, `betweennessPct` per node
   - Suggested Style: Node size + blue-purple gradient

2. **ClosenessCentralityAlgorithm**
   - Wraps: `closenessCentrality()`
   - Results: `closeness`, `closenessPct` per node
   - Suggested Style: Node size + green-yellow gradient

3. **EigenvectorCentralityAlgorithm**
   - Wraps: `eigenvectorCentrality()`
   - Results: `eigenvector`, `eigenvectorPct` per node
   - Suggested Style: Node size + orange-red gradient

4. **HITSAlgorithm**
   - Wraps: `hits()`
   - Results: `hubScore`, `hubScorePct`, `authorityScore`, `authorityScorePct` per node
   - Suggested Style: Size by hub score, color by authority score

5. **KatzCentralityAlgorithm**
   - Wraps: `katzCentrality()`
   - Results: `katz`, `katzPct` per node
   - Suggested Style: Node size + cyan-blue gradient

**Common Pattern**: All centrality algorithms follow same structure
- Store raw score and normalized percentage
- Node size scaled by normalized score
- Color gradient unique to each algorithm
- Can reuse centrality base template

---

#### Batch 2: Remaining Community Detection (1 day)
Implement wrappers for community algorithms (all produce categorical groupings):

1. **GirvanNewmanAlgorithm**
   - Wraps: `girvanNewman()`
   - Results: `communityId`, `modularity` per node, `iterations` on graph
   - Suggested Style: Categorical color mapping (8-color palette)

2. **LeidenAlgorithm**
   - Wraps: `leiden()`
   - Results: `communityId`, `modularity` per node
   - Suggested Style: Categorical color mapping

3. **LabelPropagationAlgorithm**
   - Wraps: `labelPropagation()` or `labelPropagationAsync()`
   - Results: `communityId` per node
   - Suggested Style: Categorical color mapping

**Common Pattern**: All community algorithms similar
- Store community ID per node
- Use categorical color palette
- Can reuse community detection template

---

#### Batch 3: Remaining Shortest Path (0.5-1 day)
Implement wrappers for path algorithms:

1. **BellmanFordAlgorithm**
   - Wraps: `bellmanFord()`
   - Results: `distance`, `inPath` per node, `hasNegativeCycle` on graph
   - Suggested Style: Path highlighting + distance-based coloring

2. **FloydWarshallAlgorithm**
   - Wraps: `floydWarshall()`
   - Results: All-pairs distances matrix on graph
   - Suggested Style: Distance-based edge coloring (heatmap)

**Note**: These require edge result storage which may need implementation

---

#### Batch 4: Traversal Algorithms (1 day)
Implement wrappers for graph traversal:

1. **BFSAlgorithm**
   - Wraps: `bfs()`
   - Results: `level`, `visited`, `visitOrder` per node
   - Suggested Style: Color by level (rainbow gradient)

2. **DFSAlgorithm**
   - Wraps: `dfs()`
   - Results: `discoveryTime`, `finishTime`, `visited` per node
   - Suggested Style: Color by discovery time

3. **BFSVariantsAlgorithm** (if needed)
   - Wraps: Various BFS variants
   - Results: Variant-specific
   - Suggested Style: Level-based coloring

---

#### Batch 5: Connected Components (0.5 day)
Implement component detection:

1. **ConnectedComponentsAlgorithm**
   - Wraps: Component detection functions
   - Results: `componentId` per node, `componentCount` on graph
   - Suggested Style: Categorical color by component

2. **StronglyConnectedComponentsAlgorithm** (if available)
   - Wraps: SCC functions
   - Results: `sccId` per node
   - Suggested Style: Categorical color by SCC

---

#### Batch 6: Minimum Spanning Tree (0.5-1 day)
Implement MST algorithms:

1. **KruskalAlgorithm**
   - Wraps: Kruskal's algorithm
   - Results: `inMST` per edge, `totalWeight` on graph
   - Suggested Style: Highlight MST edges in green

2. **PrimAlgorithm**
   - Wraps: Prim's algorithm
   - Results: `inMST` per edge, `totalWeight` on graph
   - Suggested Style: Highlight MST edges in green

**Note**: Requires edge result storage

---

#### Batch 7: Advanced Algorithms (1-2 days)
Implement remaining specialized algorithms:

1. **MaximumMatchingAlgorithm**
   - Wraps: Maximum matching algorithms
   - Results: `inMatching` per edge
   - Suggested Style: Highlight matched edges

2. **MaxFlowAlgorithm** (if available)
   - Wraps: Max flow algorithms
   - Results: `flow` per edge, `maxFlow` on graph
   - Suggested Style: Edge width by flow amount

3. **Other specialized algorithms** as available in package

---

## Implementation Checklist Template

For each algorithm, complete:

```markdown
### [Algorithm Name]

- [ ] Create `src/algorithms/[AlgorithmName]Algorithm.ts`
- [ ] Implement `run()` method
  - [ ] Convert graph to @graphty/algorithms format
  - [ ] Call algorithm function
  - [ ] Store results on appropriate elements
  - [ ] Handle errors
- [ ] Implement `static suggestedStyles()` method
  - [ ] Design appropriate visualization
  - [ ] Return SuggestedStylesConfig
- [ ] Register algorithm with `@Algorithm.register()` or manual registration
- [ ] Create `stories/algorithms/[AlgorithmName].stories.ts`
  - [ ] Story showing algorithm execution
  - [ ] Story showing suggested styles
- [ ] Write unit tests in `test/algorithms/[algorithm-name].test.ts`
  - [ ] Test algorithm execution
  - [ ] Test result storage
  - [ ] Test suggested styles
- [ ] Add JSDoc documentation
- [ ] Update algorithm index exports
```

## Testing Strategy

### Unit Tests
For each algorithm:
- Test that algorithm executes without errors on various graph types
- Verify results are stored on correct elements
- Validate result values match expected outputs
- Test edge cases (empty graphs, single nodes, disconnected components)
- Test suggested styles generation

### Integration Tests
- Test multiple algorithms running on same graph
- Verify algorithm results don't interfere with each other
- Test suggested styles from multiple algorithms applied together

### Visual Tests
- Storybook stories for each algorithm showing visualization
- Visual regression tests to catch rendering issues
- Performance tests for large graphs

### Test Data
Reuse existing test datasets:
- `cat-social-network-2.json` - Small test graph
- Create larger test graphs for performance testing
- Use graphs with specific properties (cyclic, acyclic, weighted, etc.)

## Edge and Graph Result Storage

**Current Limitation**: `addEdgeResult()` and `addGraphResult()` are not fully implemented in `Algorithm.ts`.

### Required Implementation
Before implementing edge-heavy algorithms (shortest path, MST, flow), complete:

1. **Implement `addEdgeResult()` in `Algorithm.ts`**
   ```typescript
   addEdgeResult(edge: Edge, resultName: string, result: unknown): void {
     const p = this.#createPath(resultName);
     deepSet(edge, p, result);
   }
   ```

2. **Implement `addGraphResult()` in `Algorithm.ts`**
   ```typescript
   addGraphResult(resultName: string, result: unknown): void {
     const p = this.#createPath(resultName);
     const graphResults = this.graph.getDataManager().graphResults ?? {};
     deepSet(graphResults, p, result);
     this.graph.getDataManager().graphResults = graphResults;
   }
   ```

3. **Update `Edge.ts` to support `algorithmResults`**
   - Add `algorithmResults` property to Edge class
   - Ensure proper initialization and typing

4. **Update Graph data manager for graph-level results**
   - Add storage for graph-level algorithm results
   - Make accessible to styling system

**Priority**: Implement before Batch 3 (Shortest Path algorithms)

## Success Criteria

- [ ] All 27 algorithms from `@graphty/algorithms` have wrapper implementations
- [ ] Each algorithm properly stores results on appropriate graph elements
- [ ] Each algorithm provides meaningful suggested styles
- [ ] All algorithms have unit tests with >80% coverage
- [ ] All algorithms have Storybook stories demonstrating visualization
- [ ] Documentation exists for each algorithm
- [ ] No performance regressions on existing functionality
- [ ] Edge and graph result storage fully implemented and tested

## Timeline Estimate

| Phase | Duration | Algorithms |
|-------|----------|------------|
| **Phase 1** (Suggested Styles) | 4-5 days | 4 algorithms (Degree, PageRank, Louvain, Dijkstra) |
| **Batch 1** (Centrality) | 1.5-2 days | 5 algorithms |
| **Batch 2** (Community) | 1 day | 3 algorithms |
| **Batch 3** (Shortest Path) | 0.5-1 day | 2 algorithms |
| **Batch 4** (Traversal) | 1 day | 2-3 algorithms |
| **Batch 5** (Components) | 0.5 day | 2 algorithms |
| **Batch 6** (MST) | 0.5-1 day | 2 algorithms |
| **Batch 7** (Advanced) | 1-2 days | 3-5 algorithms |
| **Edge/Graph Storage** | 0.5-1 day | Infrastructure |
| **Buffer** | 1 day | Testing, fixes, documentation |

**Total Phase 2**: 7-10 days
**Total Project** (Phase 1 + Phase 2): 11-15 days

## Implementation Order Rationale

1. **Start with Centrality**: Simple pattern, all similar, builds confidence
2. **Community Detection**: Introduces categorical styling pattern
3. **Shortest Path**: Requires edge storage, validates edge styling
4. **Traversal**: Simple level-based visualization
5. **Components**: Similar to community detection
6. **MST**: Uses edge storage from shortest path work
7. **Advanced**: Most complex, done last with full infrastructure

## Next Steps

1. Complete Phase 1 (Suggested Styles feature with 4 algorithms)
2. Review and validate the established pattern
3. Implement edge/graph result storage if needed
4. Proceed with Batch 1 (Centrality algorithms)
5. Continue systematically through remaining batches
6. Conduct comprehensive testing
7. Update documentation and examples

## Notes

- Algorithms can be implemented in parallel by multiple developers
- Each batch is independently testable
- Can adjust priorities based on user demand for specific algorithms
- Some algorithms may need special handling for weighted/directed graphs
- Consider performance optimization for algorithms on large graphs (>1000 nodes)
