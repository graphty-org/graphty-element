# Feature Design: Algorithm Suggested Styles

## Overview

- **User Value**: Algorithms automatically provide visually meaningful default styles, reducing the need for manual style configuration and making algorithm results immediately visible and interpretable.
- **Technical Value**: Creates a standardized pattern for algorithm visualization, improves discoverability of algorithm capabilities, and provides best-practice examples for custom styling.

## Requirements

The algorithms feature currently runs algorithms on graphs and stores results in `algorithmResults.<namespace>.<type>.<resultName>` on nodes, edges, or the graph. Users can manually create `calculatedStyle` configurations to visualize these results by specifying:
- `inputs`: Paths to algorithm results (e.g., `["algorithmResults.graphty.degree.degreePct"]`)
- `output`: Style property path (e.g., `"style.shape.size"`)
- `expr`: JavaScript expression to compute the style value

**Goal**: Design a feature where algorithms can optionally provide suggested/default styles that:
1. Automatically visualize algorithm results without manual configuration
2. Account for different algorithm types (centrality, community, pathfinding, clustering, etc.)
3. Handle different element types (nodes, edges, paths, graph-level)
4. Use selectors (JMESPath) when needed to target specific elements
5. Provide sensible, visually distinct defaults that highlight the algorithm's findings

## Proposed Solution

### User Interface/API

#### 1. Algorithm Metadata Enhancement
Each algorithm can optionally provide a `suggestedStyles` static property that returns style layer configurations:

```typescript
class DegreeAlgorithm extends Algorithm {
  static namespace = "graphty";
  static type = "degree";

  static suggestedStyles(): SuggestedStylesConfig {
    return {
      layers: [
        {
          node: {
            selector: "",  // Apply to all nodes
            calculatedStyle: {
              inputs: ["algorithmResults.graphty.degree.degreePct"],
              output: "style.shape.size",
              expr: "{ return 1 + arguments[0] * 4 }"  // Scale: 1-5
            }
          },
          metadata: {
            name: "Degree Algorithm - Node Size",
            description: "Scales node size by degree centrality"
          }
        }
      ],
      description: "Visualizes node importance through size based on connection count"
    };
  }
}
```

#### 2. Graph API Enhancement
Add methods to apply suggested styles:

```typescript
// Automatically apply suggested styles after running an algorithm
graph.runAlgorithm("graphty:degree", { applySuggestedStyles: true });

// Manually apply suggested styles from a specific algorithm
graph.applySuggestedStyles("graphty:degree");

// Get suggested styles without applying (for preview/inspection)
const styles = graph.getSuggestedStyles("graphty:degree");

// Apply multiple algorithm styles with priority ordering
graph.applySuggestedStyles(["graphty:degree", "graphty:pagerank"]);
```

#### 3. Configuration Options
Allow users to control style application behavior:

```typescript
interface ApplySuggestedStylesOptions {
  // Where to insert the style layers
  position?: "prepend" | "append" | number;

  // Whether to replace existing layers or merge
  mode?: "replace" | "merge";

  // Prefix for layer names to avoid conflicts
  layerPrefix?: string;

  // Enable/disable specific suggested styles by name
  enabledStyles?: string[];
}
```

### Technical Architecture

#### Components

**1. New Type Definitions** (`src/config/SuggestedStyles.ts`):
```typescript
export interface SuggestedStyleLayer {
  node?: AppliedNodeStyleConfig;
  edge?: AppliedEdgeStyleConfig;
  metadata?: {
    name: string;
    description?: string;
    priority?: number;  // For ordering when multiple algorithms suggest styles
  };
}

export interface SuggestedStylesConfig {
  layers: SuggestedStyleLayer[];
  description?: string;
  // Categorize the visualization strategy
  category?: "node-metric" | "edge-metric" | "grouping" | "path" | "hierarchy";
}

// Helper type for algorithm implementations
export type SuggestedStylesProvider = () => SuggestedStylesConfig;
```

**2. Algorithm Base Class Enhancement** (`src/algorithms/Algorithm.ts`):
```typescript
export abstract class Algorithm {
  static type: string;
  static namespace: string;

  // Optional: Algorithms can provide suggested styles
  static suggestedStyles?: SuggestedStylesProvider;

  // Helper method to check if algorithm has suggested styles
  static hasSuggestedStyles(): boolean {
    return !!this.suggestedStyles;
  }

  // Get suggested styles for this algorithm
  static getSuggestedStyles(): SuggestedStylesConfig | null {
    return this.suggestedStyles ? this.suggestedStyles() : null;
  }

  // ... existing methods
}
```

**3. Graph API Enhancement** (`src/Graph.ts`):
```typescript
export class Graph {
  // ... existing properties

  /**
   * Apply suggested styles from an algorithm
   */
  applySuggestedStyles(
    algorithmKey: string | string[],
    options?: ApplySuggestedStylesOptions
  ): boolean {
    const keys = Array.isArray(algorithmKey) ? algorithmKey : [algorithmKey];
    let applied = false;

    for (const key of keys) {
      const [namespace, type] = key.split(":");
      const AlgorithmClass = Algorithm.getClass(namespace, type);

      if (!AlgorithmClass || !AlgorithmClass.hasSuggestedStyles()) {
        continue;
      }

      const suggestedStyles = AlgorithmClass.getSuggestedStyles();
      if (suggestedStyles) {
        this.#applyStyleLayers(suggestedStyles, options);
        applied = true;
      }
    }

    return applied;
  }

  /**
   * Get suggested styles without applying them
   */
  getSuggestedStyles(algorithmKey: string): SuggestedStylesConfig | null {
    const [namespace, type] = algorithmKey.split(":");
    const AlgorithmClass = Algorithm.getClass(namespace, type);
    return AlgorithmClass?.getSuggestedStyles() ?? null;
  }

  /**
   * Run algorithm with optional auto-application of suggested styles
   */
  async runAlgorithm(
    algorithmKey: string,
    options?: { applySuggestedStyles?: boolean }
  ): Promise<void> {
    // ... existing algorithm run logic

    if (options?.applySuggestedStyles) {
      this.applySuggestedStyles(algorithmKey);
    }
  }

  // ... existing methods
}
```

**4. Style Application Helpers**:
```typescript
// Helper functions for common style patterns
export const StyleHelpers = {
  // Linear scale: maps [0,1] to [min, max]
  linearScale: (min: number, max: number) =>
    `{ return ${min} + arguments[0] * ${max - min} }`,

  // Color gradient: maps [0,1] to color gradient
  colorGradient: (startColor: string, endColor: string) =>
    `{ /* color interpolation */ }`,

  // Categorical colors: assigns colors to discrete values
  categoricalColors: (colorMap: Record<string, string>) =>
    `{ /* category color lookup */ }`,

  // Threshold-based styling
  threshold: (thresholds: number[], values: unknown[]) =>
    `{ /* threshold logic */ }`,
};
```

#### Data Model

**Algorithm Result Structure** (already exists):
```typescript
// Node results stored at:
// node.algorithmResults.<namespace>.<type>.<resultName>

// Example for degree algorithm:
node.algorithmResults.graphty.degree = {
  degree: 5,
  degreePct: 0.833,  // Normalized to [0,1]
  inDegree: 3,
  inDegreePct: 0.75,
  outDegree: 2,
  outDegreePct: 0.667
}
```

**Style Layer Structure** (already exists, extended):
```typescript
// Layers added to graph.styles.layers
{
  node: {
    selector: "",  // JMESPath selector
    calculatedStyle: {
      inputs: ["algorithmResults.graphty.degree.degreePct"],
      output: "style.shape.size",
      expr: "{ return 1 + arguments[0] * 4 }"
    }
  },
  metadata: {
    name: "Degree Algorithm - Node Size",
    description: "...",
    algorithmSource: "graphty:degree"  // NEW: Track which algorithm created this layer
  }
}
```

#### Integration Points

1. **Algorithm Registration**: No changes needed, suggested styles are static metadata
2. **Style System**: Uses existing layer and calculatedStyle infrastructure
3. **Graph Lifecycle**: Integrates with existing `runAlgorithm` flow
4. **Storybook**: New stories showing auto-styled algorithm results

### Implementation Approach

We will implement this feature using an **iterative, phased approach** to validate the design incrementally and minimize risk. This allows for early feedback and course correction.

#### Phase 1: Core Infrastructure + DegreeAlgorithm (1-2 days)
**Goal**: Get the basic plumbing working with one algorithm

**Tasks**:
1. Create `src/config/SuggestedStyles.ts` type definitions
   - `SuggestedStyleLayer` interface
   - `SuggestedStylesConfig` interface
   - `SuggestedStylesProvider` type
2. Enhance `src/algorithms/Algorithm.ts` base class
   - Add optional static `suggestedStyles` property
   - Add `hasSuggestedStyles()` static method
   - Add `getSuggestedStyles()` static method
3. Enhance `src/Graph.ts` with new methods
   - Implement `applySuggestedStyles(algorithmKey, options)`
   - Implement `getSuggestedStyles(algorithmKey)`
   - Enhance `runAlgorithm()` to accept `applySuggestedStyles` option
   - Add private `#applyStyleLayers()` helper method
4. Add suggested styles to existing `DegreeAlgorithm`
   - Create `static suggestedStyles()` method
   - Return layers for node size based on `degreePct`
5. Create Storybook story demonstrating auto-styling
6. Write unit tests for infrastructure

**Deliverable**: DegreeAlgorithm auto-styles nodes by size
**Decision Point**: Does the API feel right? Are there implementation issues?

---

#### Phase 2: PageRank - Validate Continuous Metrics (0.5-1 day)
**Goal**: Confirm the pattern works for other centrality algorithms

**Tasks**:
1. Create `src/algorithms/PageRankAlgorithm.ts`
   - Implement wrapper around `@graphty/algorithms` pageRank
   - Store results using `addNodeResult()`
   - Add suggested styles (node size + color gradient)
2. Register algorithm in Algorithm registry
3. Add Storybook story showing PageRank visualization
4. Test that multiple algorithms can coexist
5. Write unit tests

**Deliverable**: PageRank visualization with distinct color scheme
**Decision Point**: Does the API handle multiple algorithms well? 

---

#### Phase 3: Louvain - Validate Categorical Data (1 day)
**Goal**: Validate the API handles discrete/categorical data (not just continuous scores)

**Tasks**:
1. Create `src/algorithms/LouvainAlgorithm.ts`
   - Implement wrapper around `@graphty/algorithms` louvain
   - Store community assignments using `addNodeResult()`
   - Add suggested styles with categorical color mapping
2. Implement helper in `StyleHelpers` for categorical colors
3. Add Storybook story showing community detection
4. Test community grouping visualization
5. Write unit tests

**Deliverable**: Communities visualized with distinct colors per group
**Decision Point**: Does categorical styling work smoothly? Do color helpers work well?

---

#### Phase 4: Dijkstra - Validate Edge/Path Highlighting (1 day)
**Goal**: Validate edge styling and path visualization with selectors

**Tasks**:
1. Create `src/algorithms/DijkstraAlgorithm.ts`
   - Implement wrapper around `@graphty/algorithms` dijkstra
   - Store path information on nodes and edges using `addNodeResult()` and `addEdgeResult()`
   - Add suggested styles for highlighting path edges and nodes
2. Test JMESPath selectors for edge filtering
3. Add Storybook story showing highlighted shortest path
4. Write unit tests for edge styling

**Deliverable**: Shortest path highlighted in distinct color with glow effect
**Decision Point**: Do edge styles and selectors work correctly? Is path visualization clear?

---

#### Phase 5: Style Helpers + Documentation (0.5-1 day)
**Goal**: Polish and document the feature

**Tasks**:
1. Implement `src/utils/StyleHelpers.ts` utility functions
   - `linearScale(min, max)` - maps [0,1] to range
   - `colorGradient(startColor, endColor)` - HSL interpolation
   - `categoricalColors(colorMap)` - discrete color mapping
   - `threshold(thresholds, values)` - threshold-based styling
2. Create comprehensive tests for all 4 algorithms
3. Add API documentation with examples
4. Create Storybook story comparing all 4 algorithms side-by-side
5. Document suggested styles authoring guide

**Deliverable**: Feature complete with 4 working algorithms demonstrating all major patterns
**Decision Point**: Is the feature ready for production use?

## Acceptance Criteria

- [ ] Algorithms can optionally provide `suggestedStyles` static property
- [ ] Graph API supports `applySuggestedStyles()`, `getSuggestedStyles()`, and enhanced `runAlgorithm()`
- [ ] At least 5 algorithm types have suggested styles implemented
- [ ] Suggested styles work correctly for node metrics, edge metrics, and grouping
- [ ] Style layers maintain proper priority ordering
- [ ] Users can preview suggested styles before applying
- [ ] Existing manual styles are not broken
- [ ] Full test coverage for suggested styles infrastructure
- [ ] Storybook examples demonstrate auto-styled algorithms
- [ ] Documentation explains how to create custom suggested styles

## Technical Considerations

### Performance
- **Impact**: Minimal - suggested styles are static metadata, only computed once per algorithm
- **Mitigation**: Cache computed style layers; use lazy evaluation

### Security
- **Considerations**: Calculated styles use `Function()` constructor for `expr` evaluation
- **Measures**: Already handled by existing CalculatedValue system; no new security concerns

### Compatibility
- **Backward Compatibility**: Fully backward compatible - suggested styles are opt-in
- **Migration**: Existing manual styles continue to work; users can gradually adopt suggested styles

### Testing
- **Unit Tests**: Test suggested styles generation and application logic
- **Integration Tests**: Test algorithm execution with auto-applied styles
- **Visual Tests**: Storybook visual regression tests for each algorithm's suggested styles
- **Edge Cases**: Test invalid style paths

## Risks and Mitigation

**Risk**: Algorithm result schema changes could break suggested styles
- **Mitigation**: Version suggested styles alongside algorithms; validate paths at runtime; provide fallbacks

**Risk**: Different algorithm types need very different visualization approaches
- **Mitigation**: Categorize suggested styles by type (node-metric, grouping, path, etc.); provide category-specific helpers

**Risk**: Hard-coded color/size values may not work for all graph sizes
- **Mitigation**: Use relative scales; provide configuration options; document how to override

## Algorithm-Specific Suggested Styles

### 1. Centrality Algorithms (degree, pagerank, betweenness, closeness, eigenvector)
**Output**: Numeric scores per node (typically normalized 0-1)

**Suggested Style**:
```typescript
{
  layers: [{
    node: {
      selector: "",
      calculatedStyle: {
        inputs: ["algorithmResults.<namespace>.<type>.<metric>Pct"],
        output: "style.shape.size",
        expr: "{ return 1 + arguments[0] * 4 }"  // Size 1-5
      }
    }
  }, {
    node: {
      selector: "",
      calculatedStyle: {
        inputs: ["algorithmResults.<namespace>.<type>.<metric>Pct"],
        output: "style.texture.color",
        expr: "{ return `hsl(${200 + arguments[0] * 60}, 70%, 50%)` }"  // Blue to cyan gradient
      }
    }
  }]
}
```

### 2. Community Detection (louvain, leiden, label-propagation)
**Output**: Community ID per node

**Suggested Style**:
```typescript
{
  layers: [{
    node: {
      selector: "",
      calculatedStyle: {
        inputs: ["algorithmResults.<namespace>.<type>.communityId"],
        output: "style.texture.color",
        expr: `{
          const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#95a5a6'];
          return colors[arguments[0] % colors.length];
        }`
      }
    }
  }]
}
```

### 3. Shortest Path (dijkstra, bellman-ford, astar)
**Output**: Path arrays, distances

**Suggested Style**:
```typescript
{
  layers: [{
    edge: {
      selector: "algorithmResults.<namespace>.<type>.isInPath == `true`",
      style: {
        line: {
          color: "#e74c3c",
          width: 3
        }
      }
    }
  }, {
    node: {
      selector: "algorithmResults.<namespace>.<type>.isInPath == `true`",
      style: {
        shape: { size: 2 },
        texture: { color: "#e74c3c" },
        effect: {
          glow: {
            color: "#e74c3c",
            strength: 2
          }
        }
      }
    }
  }]
}
```

### 4. Traversal (BFS, DFS)
**Output**: Visit order, depth/level

**Suggested Style**:
```typescript
{
  layers: [{
    node: {
      selector: "",
      calculatedStyle: {
        inputs: ["algorithmResults.<namespace>.<type>.level"],
        output: "style.texture.color",
        expr: `{
          const level = arguments[0];
          return \`hsl(\${level * 30}, 70%, 50%)\`;
        }`
      }
    }
  }]
}
```

## Future Enhancements

1. **Interactive Style Preview**: UI to preview and customize suggested styles before applying
2. **Style Templates**: Reusable style templates for common patterns
3. **Multi-Algorithm Composition**: Smart merging of styles from multiple algorithms
4. **Animation Support**: Animated visualizations for iterative algorithms
5. **Export Suggested Styles**: Generate style configurations from suggested styles
6. **Algorithm Result Inspection**: UI to browse algorithm results and their visualizations
7. **Smart Defaults**: Analyze graph properties to auto-select best visualization approach
8. **Style Recommendations**: Suggest complementary styles based on applied algorithms

## Implementation Estimate

- **Phase 1** (Core Infrastructure + DegreeAlgorithm): 1-2 days
- **Phase 2** (PageRankAlgorithm): 0.5-1 day
- **Phase 3** (LouvainAlgorithm): 1 day
- **Phase 4** (DijkstraAlgorithm): 1 day
- **Phase 5** (Style Helpers + Documentation): 0.5-1 day

**Total Implementation Time**: 4-5 days

---

## Next Steps

1. Review and approve design
2. Create implementation tasks for Phase 1
3. Begin Phase 1 development
4. Iterate through phases, validating at each decision point
