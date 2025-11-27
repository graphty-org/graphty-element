# StyleHelpers Framework Design

## Executive Summary

This document defines a comprehensive framework for **StyleHelpers** - reusable utility functions that map algorithm results to visual styles. Based on analysis of 27+ planned algorithms and the complete style system, we identify the need for helpers across 6 major categories to support all visualization patterns.

---

## 1. Algorithm Result Types Analysis

### 1.1 Continuous Node Metrics (Normalized 0-1 or Raw Values)

**Algorithms**:
- Centrality: Degree, PageRank, Betweenness, Closeness, Eigenvector, HITS, Katz
- Examples: `degreePct`, `rankPct`, `betweennessPct`

**Characteristics**:
- Continuous numeric values
- Usually normalized to [0, 1] range
- Represent relative importance/centrality
- Can be highly skewed (power-law distributions)

**Visualization Needs**:
- Color gradients (sequential, diverging)
- Size scaling (linear, logarithmic, exponential)
- Opacity/transparency
- Glow intensity

---

### 1.2 Categorical Node Data (Discrete Groups)

**Algorithms**:
- Community Detection: Louvain, Girvan-Newman, Leiden, Label Propagation
- Components: Connected Components, Strongly Connected Components
- Examples: `communityId`, `componentId`, `sccId`

**Characteristics**:
- Integer IDs (0, 1, 2, ...)
- Unknown count at design time
- Need distinct visual separation
- Can have 2-50+ categories

**Visualization Needs**:
- Categorical color palettes (8-20 colors)
- Shape variation (for small category counts)
- Pattern fills (stripes, dots for accessibility)
- Labels with category names

---

### 1.3 Node Sequences/Levels (Ordered Integers)

**Algorithms**:
- Traversal: BFS, DFS
- Hierarchies: Level-based layouts
- Examples: `level`, `visitOrder`, `discoveryTime`

**Characteristics**:
- Sequential integers (0, 1, 2, ...)
- Represents order or hierarchy level
- Small to medium range (typically 2-20 levels)

**Visualization Needs**:
- Sequential color gradients (rainbow, spectral)
- Step-based sizing
- Layered transparency
- Animated reveal (by sequence)

---

### 1.4 Edge Boolean Flags

**Algorithms**:
- Shortest Paths: Dijkstra, Bellman-Ford (`inPath`)
- MST: Kruskal, Prim (`inMST`)
- Matching: Maximum Matching (`inMatching`)

**Characteristics**:
- Boolean true/false
- Highlights subset of edges
- Rest of graph shown dimmed/muted

**Visualization Needs**:
- Binary color (highlight vs muted)
- Width differentiation
- Glow effects for emphasis
- Animation (pulse, flow)

---

### 1.5 Edge Continuous Metrics

**Algorithms**:
- Flow: Max Flow, Min Cost Flow (`flow`)
- Distances: Floyd-Warshall (all-pairs distances)
- Weights: Various weighted algorithms

**Characteristics**:
- Continuous numeric values on edges
- Range varies (0-capacity, distances, weights)
- Can represent intensity, cost, or flow

**Visualization Needs**:
- Color gradients (heatmap style)
- Width scaling (thicker = more flow)
- Opacity (fainter = less important)
- Animated flow direction

---

### 1.6 Graph-Level Results

**Algorithms**:
- Various: `modularity`, `componentCount`, `maxFlow`, `hasNegativeCycle`

**Characteristics**:
- Single values for entire graph
- Used for summary/metrics display
- Not directly visualized on nodes/edges

**Visualization Needs**:
- Text overlays
- Dashboard widgets
- Conditional styling (e.g., highlight if cycle detected)

---

## 2. Style Properties Analysis

### 2.1 Node Visual Properties

```typescript
// From NodeStyle schema
{
  shape: {
    size: number,              // ⭐ Continuous metrics
    type: NodeShapes[30+],     // ⭐ Categorical (small groups)
  },
  texture: {
    color: string | gradient,  // ⭐ Continuous/Categorical
    image: URL,                // Static decoration
    icon: string,              // Categorical indicators
  },
  effect: {
    glow: {
      color: string,           // Highlight effect
      strength: number,        // ⭐ Continuous metrics
    },
    outline: {
      color: string,           // Highlight effect
      width: number,           // ⭐ Continuous metrics
    },
    wireframe: boolean,        // Binary flags
    flatShaded: boolean,       // Binary flags
  },
  label: RichText,             // ⭐ Dynamic text with metrics
  tooltip: RichText,           // ⭐ Detailed info display
}
```

---

### 2.2 Edge Visual Properties

```typescript
// From EdgeStyle schema
{
  line: {
    type: LineType[9],         // Pattern variation
    width: number,             // ⭐ Continuous metrics (flow)
    color: string,             // ⭐ Continuous/Categorical
    opacity: number,           // ⭐ Continuous metrics
    animationSpeed: number,    // Dynamic effects
    bezier: boolean,           // Curve vs straight
  },
  arrowHead/arrowTail: {
    type: ArrowType[20+],      // Direction indicators
    size: number,              // ⭐ Continuous scaling
    color: string,             // Color coding
    opacity: number,           // Fade effects
    text: RichText,            // Edge labels
  },
  label: RichText,             // ⭐ Dynamic text with metrics
  tooltip: RichText,           // ⭐ Detailed info display
}
```

---

## 3. StyleHelpers Framework

### 3.1 Color Helpers

#### Sequential Gradients (Continuous Metrics → Color)

```typescript
/**
 * Maps continuous values [0,1] to sequential color gradients
 * Use for: Centrality metrics, importance scores, levels
 */
export const SequentialGradients = {
  /**
   * Cool to hot (blue → yellow → red)
   * Good for: Generic continuous metrics
   */
  coolToHot: (value: number) => string,

  /**
   * Single-hue progression (light → dark)
   * Good for: Single metric visualization
   */
  blues: (value: number) => string,
  greens: (value: number) => string,
  reds: (value: number) => string,
  purples: (value: number) => string,
  oranges: (value: number) => string,

  /**
   * Rainbow/Spectral (violet → blue → green → yellow → red)
   * Good for: Level-based, sequential data
   */
  rainbow: (value: number) => string,
  spectral: (value: number) => string,

  /**
   * Perceptually uniform (viridis, plasma, inferno)
   * Good for: Scientific visualization, accessibility
   */
  viridis: (value: number) => string,
  plasma: (value: number) => string,
  inferno: (value: number) => string,
};

/**
 * Usage in suggested styles:
 */
expr: `{ return StyleHelpers.color.sequential.coolToHot(arguments[0]) }`
```

---

#### Diverging Gradients (Continuous with Midpoint → Color)

```typescript
/**
 * Maps values with meaningful midpoint (0.5) to diverging colors
 * Use for: Positive/negative values, above/below average
 */
export const DivergingGradients = {
  /**
   * Red-White-Blue (negative → neutral → positive)
   */
  redWhiteBlue: (value: number, midpoint: number = 0.5) => string,

  /**
   * Brown-White-Green (decrease → neutral → increase)
   */
  brownWhiteGreen: (value: number, midpoint: number = 0.5) => string,

  /**
   * Purple-White-Orange
   */
  purpleWhiteOrange: (value: number, midpoint: number = 0.5) => string,
};

/**
 * Usage:
 */
expr: `{
  const avgDegree = 0.5; // Assume calculated elsewhere
  return StyleHelpers.color.diverging.redWhiteBlue(arguments[0], avgDegree);
}`
```

---

#### Categorical Palettes (Discrete Groups → Color)

```typescript
/**
 * Maps categorical IDs to distinct colors
 * Use for: Communities, components, clusters
 */
export const CategoricalPalettes = {
  /**
   * 8-color palette (vibrant, high contrast)
   * Good for: Standard community detection
   */
  standard8: (categoryId: number) => string,
  // Colors: ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#95a5a6']

  /**
   * 12-color palette (extended)
   * Good for: More detailed community structures
   */
  standard12: (categoryId: number) => string,

  /**
   * 20-color palette (maximum distinction)
   * Good for: Large numbers of communities
   */
  standard20: (categoryId: number) => string,

  /**
   * Pastel palette (softer colors)
   * Good for: Aesthetic preference, backgrounds
   */
  pastel8: (categoryId: number) => string,

  /**
   * Dark palette (deep colors)
   * Good for: Light backgrounds
   */
  dark8: (categoryId: number) => string,

  /**
   * Colorblind-safe palette (Okabe-Ito colors)
   * Good for: Accessibility
   */
  colorblindSafe: (categoryId: number) => string,
};

/**
 * Usage:
 */
expr: `{ return StyleHelpers.color.categorical.standard8(arguments[0]) }`
```

---

#### Binary Highlight Colors (Boolean → Color)

```typescript
/**
 * Maps boolean flags to highlight/muted colors
 * Use for: Path highlighting, MST edges, matching
 */
export const BinaryColors = {
  /**
   * Green highlight, gray muted
   */
  greenGray: (isHighlighted: boolean) => string,

  /**
   * Blue highlight, light gray muted
   */
  blueLightGray: (isHighlighted: boolean) => string,

  /**
   * Gold highlight, dark gray muted
   */
  goldDarkGray: (isHighlighted: boolean) => string,

  /**
   * Custom colors
   */
  custom: (isHighlighted: boolean, highlightColor: string, mutedColor: string) => string,
};

/**
 * Usage:
 */
expr: `{ return StyleHelpers.color.binary.greenGray(arguments[0]) }`
```

---

### 3.2 Size Helpers

#### Linear Scaling (Value → Size)

```typescript
/**
 * Maps continuous values to size range
 * Use for: Node importance, centrality metrics
 */
export const LinearScaling = {
  /**
   * Linear mapping from [0,1] to [minSize, maxSize]
   */
  linear: (value: number, minSize: number = 1, maxSize: number = 5) => number,

  /**
   * Linear with clipping (prevent too small/large)
   */
  linearClipped: (value: number, minSize: number = 0.5, maxSize: number = 10, clipMin: number = 0.1, clipMax: number = 15) => number,
};

/**
 * Usage:
 */
expr: `{ return StyleHelpers.size.linear(arguments[0], 1, 5) }`
// Maps degreePct [0,1] to size [1,5]
```

---

#### Logarithmic Scaling (Skewed Values → Size)

```typescript
/**
 * Logarithmic scaling for power-law distributions
 * Use for: Highly skewed metrics (e.g., degree in scale-free networks)
 */
export const LogarithmicScaling = {
  /**
   * Log scale to prevent extreme size differences
   */
  log: (value: number, minSize: number = 1, maxSize: number = 5, base: number = Math.E) => number,

  /**
   * Log with offset for zero values
   */
  logSafe: (value: number, minSize: number = 1, maxSize: number = 5, epsilon: number = 1e-10) => number,
};

/**
 * Usage:
 */
expr: `{ return StyleHelpers.size.log(arguments[0], 1, 5) }`
```

---

#### Exponential Scaling (Emphasize High Values)

```typescript
/**
 * Exponential scaling to emphasize high values
 * Use for: Making top-ranked nodes dramatically larger
 */
export const ExponentialScaling = {
  /**
   * Exponential mapping
   */
  exp: (value: number, minSize: number = 1, maxSize: number = 5, exponent: number = 2) => number,

  /**
   * Square/cubic scaling (common exponents)
   */
  square: (value: number, minSize: number = 1, maxSize: number = 5) => number,
  cubic: (value: number, minSize: number = 1, maxSize: number = 5) => number,
};

/**
 * Usage:
 */
expr: `{ return StyleHelpers.size.exp(arguments[0], 1, 10, 2) }`
```

---

#### Step/Binned Scaling (Categorical Sizes)

```typescript
/**
 * Discrete size bins for categorical appearance
 * Use for: Level-based sizing, ranking tiers
 */
export const BinnedScaling = {
  /**
   * Maps continuous value to discrete size bins
   */
  bins: (value: number, sizes: number[]) => number,

  /**
   * Common presets
   */
  small_medium_large: (value: number) => number, // Maps to [1, 2.5, 4]
  five_tiers: (value: number) => number,         // Maps to [1, 2, 3, 4, 5]
};

/**
 * Usage:
 */
expr: `{ return StyleHelpers.size.bins(arguments[0], [1, 2, 3, 4, 5]) }`
```

---

### 3.3 Opacity Helpers

```typescript
/**
 * Maps values to opacity for layered effects
 * Use for: De-emphasizing less important elements
 */
export const OpacityHelpers = {
  /**
   * Linear fade
   */
  linear: (value: number, minOpacity: number = 0.1, maxOpacity: number = 1.0) => number,

  /**
   * Threshold: fully opaque above threshold, faded below
   */
  threshold: (value: number, threshold: number = 0.5, belowOpacity: number = 0.2, aboveOpacity: number = 1.0) => number,

  /**
   * Binary: visible/invisible
   */
  binary: (isVisible: boolean, visibleOpacity: number = 1.0, hiddenOpacity: number = 0.1) => number,

  /**
   * Inverse: high values = transparent (for backgrounds)
   */
  inverse: (value: number, minOpacity: number = 0.1, maxOpacity: number = 1.0) => number,
};

/**
 * Usage:
 */
expr: `{ return StyleHelpers.opacity.threshold(arguments[0], 0.5, 0.2, 1.0) }`
```

---

### 3.4 Label Helpers

#### Numeric Formatting

```typescript
/**
 * Formats numeric values for display
 * Use for: Node/edge labels showing metric values
 */
export const NumericFormatting = {
  /**
   * Percentage (0.75 → "75%")
   */
  percentage: (value: number, decimals: number = 0) => string,

  /**
   * Fixed decimals (0.123456 → "0.12")
   */
  fixed: (value: number, decimals: number = 2) => string,

  /**
   * Scientific notation (123456 → "1.23e5")
   */
  scientific: (value: number, decimals: number = 2) => string,

  /**
   * Shortened large numbers (1000000 → "1.0M")
   */
  compact: (value: number) => string, // K, M, B suffixes

  /**
   * Integer rounding
   */
  integer: (value: number) => string,
};

/**
 * Usage:
 */
// In label text:
expr: `{ return StyleHelpers.label.percentage(arguments[0]) }`
// Result: "75%" displayed on node
```

---

#### Text Templates

```typescript
/**
 * Template strings with value substitution
 * Use for: Contextual labels (e.g., "Rank: 5")
 */
export const TextTemplates = {
  /**
   * Simple substitution
   */
  substitute: (template: string, values: Record<string, unknown>) => string,

  /**
   * Common presets
   */
  rankLabel: (rank: number) => string,                    // "Rank: 5"
  scoreLabel: (score: number, label: string) => string,   // "PageRank: 0.85"
  communityLabel: (id: number) => string,                 // "Community 3"
  levelLabel: (level: number) => string,                  // "Level 2"
};

/**
 * Usage:
 */
expr: `{ return StyleHelpers.label.rankLabel(arguments[0]) }`
```

---

#### Conditional Display

```typescript
/**
 * Show/hide labels based on conditions
 * Use for: Decluttering (only show top-N, or above threshold)
 */
export const ConditionalDisplay = {
  /**
   * Only show if value above threshold
   */
  ifAbove: (value: number, threshold: number, formatter: (v: number) => string) => string | null,

  /**
   * Only show for top N values (requires context)
   */
  topN: (value: number, rank: number, n: number, formatter: (v: number) => string) => string | null,

  /**
   * Show different text based on value
   */
  conditional: (value: boolean, trueText: string, falseText: string) => string,
};

/**
 * Usage:
 */
expr: `{
  return StyleHelpers.label.ifAbove(
    arguments[0],
    0.5,
    (v) => StyleHelpers.label.percentage(v)
  ) || '';
}`
```

---

### 3.5 Edge Width Helpers

```typescript
/**
 * Maps edge metrics to line width
 * Use for: Flow visualization, weighted graphs
 */
export const EdgeWidthHelpers = {
  /**
   * Linear scaling
   */
  linear: (value: number, minWidth: number = 0.5, maxWidth: number = 5) => number,

  /**
   * Logarithmic (for highly varied flows)
   */
  log: (value: number, minWidth: number = 0.5, maxWidth: number = 5) => number,

  /**
   * Binary (highlight vs normal)
   */
  binary: (isHighlighted: boolean, highlightWidth: number = 3, normalWidth: number = 1) => number,

  /**
   * Stepped (discrete width levels)
   */
  stepped: (value: number, widths: number[]) => number,
};

/**
 * Usage:
 */
expr: `{ return StyleHelpers.edgeWidth.linear(arguments[0], 0.5, 5) }`
```

---

### 3.6 Combined Multi-Dimensional Helpers

```typescript
/**
 * Combines multiple visual channels for richer encodings
 * Use for: Encoding 2+ metrics simultaneously
 */
export const CombinedHelpers = {
  /**
   * Size + Color encoding (2 metrics)
   * Example: Node size by degree, color by betweenness
   */
  sizeAndColor: (
    sizeValue: number,
    colorValue: number,
    sizeRange: [number, number],
    colorGradient: (v: number) => string
  ) => { size: number; color: string },

  /**
   * Color + Opacity encoding
   * Example: Community color + importance opacity
   */
  colorAndOpacity: (
    categoryId: number,
    opacity: number,
    palette: (id: number) => string
  ) => { color: string; opacity: number },

  /**
   * Size + Glow encoding
   * Example: Size by PageRank, glow by betweenness
   */
  sizeAndGlow: (
    sizeValue: number,
    glowValue: number,
    sizeRange: [number, number],
    glowStrength: [number, number]
  ) => { size: number; glow: { strength: number; color: string } },
};

/**
 * Usage:
 */
// Would need multi-layer or multi-input calculatedStyle support
```

---

### 3.7 Animation Helpers

```typescript
/**
 * Animation pattern generators for dynamic effects
 * Use for: Highlighting, flow visualization, temporal data
 */
export const AnimationHelpers = {
  /**
   * Pulse effect parameters
   */
  pulse: (intensity: number) => { animationSpeed: number; pattern: string },

  /**
   * Flow direction animation
   */
  flow: (flowValue: number, direction: 'forward' | 'backward') => { animationSpeed: number },

  /**
   * Sequential reveal (for traversal algorithms)
   */
  sequentialReveal: (order: number, totalSteps: number) => { delay: number; duration: number },
};
```

---

## 4. Implementation Architecture

### 4.1 Module Structure

```
src/
├── config/
│   └── StyleHelpers.ts         # Main export barrel
├── utils/
│   └── styleHelpers/
│       ├── color/
│       │   ├── sequential.ts   # Sequential gradients
│       │   ├── diverging.ts    # Diverging gradients
│       │   ├── categorical.ts  # Categorical palettes
│       │   └── binary.ts       # Binary highlights
│       ├── size/
│       │   ├── linear.ts
│       │   ├── logarithmic.ts
│       │   ├── exponential.ts
│       │   └── binned.ts
│       ├── opacity/
│       │   └── index.ts
│       ├── label/
│       │   ├── formatting.ts
│       │   ├── templates.ts
│       │   └── conditional.ts
│       ├── edgeWidth/
│       │   └── index.ts
│       ├── combined/
│       │   └── index.ts
│       └── animation/
│           └── index.ts
└── algorithms/
    ├── DegreeAlgorithm.ts      # Uses StyleHelpers
    ├── PageRankAlgorithm.ts    # Uses StyleHelpers
    └── LouvainAlgorithm.ts     # Uses StyleHelpers
```

---

### 4.2 Usage in Algorithm Suggested Styles

```typescript
import {StyleHelpers} from "../config/StyleHelpers";

export class DegreeAlgorithm extends Algorithm {
  static suggestedStyles = (): SuggestedStylesConfig => ({
    layers: [
      {
        node: {
          calculatedStyle: {
            inputs: ["algorithmResults.graphty.degree.degreePct"],
            output: "style.texture.color",
            // Use StyleHelpers instead of inline code!
            expr: `{ return StyleHelpers.color.sequential.coolToHot(arguments[0]) }`,
          },
        },
        metadata: {
          name: "Degree - Color Gradient",
          description: "Colors nodes from blue (low degree) to red (high degree)",
        },
      },
      {
        node: {
          calculatedStyle: {
            inputs: ["algorithmResults.graphty.degree.degreePct"],
            output: "style.shape.size",
            // Size scaling helper
            expr: `{ return StyleHelpers.size.linear(arguments[0], 1, 5) }`,
          },
        },
        metadata: {
          name: "Degree - Size Scaling",
          description: "Scales node size by degree (1-5)",
        },
      },
    ],
    description: "Visualizes node degree with color and size",
    category: "node-metric",
  });
}
```

---

### 4.3 Making Helpers Available in CalculatedStyle Context

**Challenge**: `calculatedStyle.expr` is evaluated in isolated context, doesn't have access to imports.

**Solution Options**:

#### Option A: Global Injection
Inject `StyleHelpers` into the evaluation context when running calculatedStyle expressions:

```typescript
// In StyleManager or wherever expressions are evaluated
const evalContext = {
  arguments: inputValues,
  StyleHelpers: StyleHelpers, // ⭐ Inject helpers
};

const result = new Function('return (' + expr + ')').call(evalContext);
```

#### Option B: Pre-expanded Expressions
Keep helpers as pure functions but expand them during suggested styles application:

```typescript
// Algorithm provides:
expr: "{ return StyleHelpers.color.sequential.coolToHot(arguments[0]) }"

// System expands to:
expr: "{ /* inlined coolToHot implementation */ }"
```

#### Option C: Helper Registry
Register helpers by name in a global registry:

```typescript
// System maintains:
window.__graphtyStyleHelpers = { /* all helpers */ };

// Expressions access via:
expr: "{ return __graphtyStyleHelpers.color.sequential.coolToHot(arguments[0]) }"
```

**Recommendation**: **Option A** - Clean, simple, maintains helper organization.

---

### 4.4 TypeScript Types

```typescript
// Color helpers
export namespace ColorHelpers {
  export namespace Sequential {
    export function coolToHot(value: number): string;
    export function blues(value: number): string;
    // ... etc
  }

  export namespace Diverging {
    export function redWhiteBlue(value: number, midpoint?: number): string;
    // ... etc
  }

  export namespace Categorical {
    export function standard8(categoryId: number): string;
    // ... etc
  }

  export namespace Binary {
    export function greenGray(isHighlighted: boolean): string;
    // ... etc
  }
}

// Size helpers
export namespace SizeHelpers {
  export function linear(value: number, minSize?: number, maxSize?: number): number;
  export function log(value: number, minSize?: number, maxSize?: number, base?: number): number;
  export function exp(value: number, minSize?: number, maxSize?: number, exponent?: number): number;
  // ... etc
}

// Main export
export const StyleHelpers = {
  color: ColorHelpers,
  size: SizeHelpers,
  opacity: OpacityHelpers,
  label: LabelHelpers,
  edgeWidth: EdgeWidthHelpers,
  combined: CombinedHelpers,
  animation: AnimationHelpers,
};
```

---

## 5. Testing Strategy

### 5.1 Unit Tests for Each Helper

```typescript
// test/utils/styleHelpers/color/sequential.test.ts
describe("Sequential Color Gradients", () => {
  describe("coolToHot", () => {
    it("returns blue for value 0", () => {
      assert.strictEqual(StyleHelpers.color.sequential.coolToHot(0), "#0000FF");
    });

    it("returns red for value 1", () => {
      assert.strictEqual(StyleHelpers.color.sequential.coolToHot(1), "#FF0000");
    });

    it("returns yellow for value 0.5", () => {
      assert.strictEqual(StyleHelpers.color.sequential.coolToHot(0.5), "#FFFF00");
    });

    it("interpolates smoothly between colors", () => {
      const color1 = StyleHelpers.color.sequential.coolToHot(0.25);
      const color2 = StyleHelpers.color.sequential.coolToHot(0.75);
      assert.notStrictEqual(color1, color2);
    });
  });
});
```

---

### 5.2 Visual Tests (Storybook)

```typescript
// stories/StyleHelpers.stories.ts
export const ColorGradients: Story = {
  render: () => {
    // Render a row of nodes with values 0, 0.1, 0.2, ... 1.0
    // Each using StyleHelpers.color.sequential.coolToHot()
    // Visual verification of gradient smoothness
  },
};

export const SizeScaling: Story = {
  render: () => {
    // Render nodes with different size scaling functions
    // Compare linear vs log vs exponential
  },
};

export const CategoricalPalettes: Story = {
  render: () => {
    // Render 8-20 nodes each with different category ID
    // Show all palette options side-by-side
  },
};
```

---

### 5.3 Integration Tests with Algorithms

```typescript
// test/algorithms/degree-with-helpers.test.ts
describe("DegreeAlgorithm with StyleHelpers", () => {
  it("suggested styles use StyleHelpers", () => {
    const styles = DegreeAlgorithm.getSuggestedStyles();
    const expr = styles.layers[0].node.calculatedStyle.expr;
    assert.ok(expr.includes("StyleHelpers"));
  });

  it("color helper produces valid colors", () => {
    // Mock evaluation context with StyleHelpers
    // Run expression with test values
    // Verify output is valid hex color
  });
});
```

---

## 6. Documentation and Examples

### 6.1 Helper Reference Docs

Create comprehensive docs showing:
- All available helpers
- Parameters and return types
- Visual examples for each
- When to use which helper
- Accessibility considerations

### 6.2 Algorithm Examples

For each algorithm type, show:
- Recommended helper combinations
- Example code
- Visual preview

**Example**:

```markdown
## Centrality Algorithms (Degree, PageRank, Betweenness)

**Recommended Helpers**:
- Color: `StyleHelpers.color.sequential.coolToHot`
- Size: `StyleHelpers.size.linear` or `StyleHelpers.size.log`

**Example**:
```typescript
static suggestedStyles = (): SuggestedStylesConfig => ({
  layers: [{
    node: {
      calculatedStyle: {
        inputs: ["algorithmResults.graphty.degree.degreePct"],
        output: "style.texture.color",
        expr: "{ return StyleHelpers.color.sequential.coolToHot(arguments[0]) }",
      },
    },
  }],
});
```

**Preview**: [Visual showing gradient]
```

---

## 7. Implementation Recommendations

### 7.1 Phase 1: Core Infrastructure (1-2 days)

**Priority 1 - Essential Helpers**:
1. ✅ `color.sequential.coolToHot` - Most common gradient
2. ✅ `color.categorical.standard8` - Community detection
3. ✅ `size.linear` - Basic size scaling
4. ✅ `opacity.threshold` - Highlighting
5. ✅ `label.percentage` - Metric display

**Implementation**:
- Create module structure
- Implement Priority 1 helpers
- Add to evaluation context (Option A)
- Write unit tests
- Update DegreeAlgorithm, PageRankAlgorithm, LouvainAlgorithm to use helpers

**Success Criteria**:
- All 3 existing algorithms use StyleHelpers
- Tests pass
- Visual tests show correct rendering

---

### 7.2 Phase 2: Expanded Palette (2-3 days)

**Priority 2 - Common Variations**:
1. All sequential gradients (blues, greens, reds, etc.)
2. All categorical palettes (12-color, 20-color, pastel, colorblind-safe)
3. Logarithmic and exponential size scaling
4. Edge width helpers
5. Text template helpers
6. Binary color helpers

**Implementation**:
- Expand each helper category
- Add Storybook visual examples
- Write comprehensive tests
- Create documentation

---

### 7.3 Phase 3: Advanced Features (2-3 days)

**Priority 3 - Advanced**:
1. Diverging gradients
2. Combined multi-dimensional helpers
3. Animation helpers
4. Conditional label helpers
5. Binned/stepped scaling

**Implementation**:
- Implement advanced features
- Add complex examples
- Performance optimization
- Accessibility review

---

### 7.4 Phase 4: Integration and Polish (1-2 days)

1. Refactor all algorithms to use StyleHelpers
2. Create helper selection guide
3. Add helper preview/picker UI (future)
4. Comprehensive documentation
5. Performance benchmarking

---

## 8. Future Enhancements

### 8.1 Dynamic Helper Configuration

Allow users to customize helper behavior:

```typescript
// User can override default palettes
StyleHelpers.color.categorical.setCustomPalette([
  '#FF0000', '#00FF00', '#0000FF', // ...
]);

// Or provide custom mapping
StyleHelpers.color.categorical.custom((id) => myPalette[id]);
```

---

### 8.2 Helper Composition

Combine helpers for complex effects:

```typescript
StyleHelpers.compose([
  StyleHelpers.size.linear,
  StyleHelpers.opacity.threshold,
]) // Returns combined function
```

---

### 8.3 Interactive Helper Picker

Visual UI for selecting and previewing helpers:
- Dropdown showing all color gradients with previews
- Sliders for adjusting size ranges
- Live preview of selected helper on sample graph

---

### 8.4 Accessibility Checker

Validate color contrast, colorblind safety:

```typescript
StyleHelpers.color.checkContrast(color1, color2); // WCAG compliance
StyleHelpers.color.colorblindPreview(palette, type); // Simulate colorblindness
```

---

## 9. API Summary

```typescript
export const StyleHelpers = {
  // Color Helpers
  color: {
    sequential: {
      coolToHot, blues, greens, reds, purples, oranges,
      rainbow, spectral, viridis, plasma, inferno
    },
    diverging: {
      redWhiteBlue, brownWhiteGreen, purpleWhiteOrange
    },
    categorical: {
      standard8, standard12, standard20,
      pastel8, dark8, colorblindSafe
    },
    binary: {
      greenGray, blueLightGray, goldDarkGray, custom
    },
  },

  // Size Helpers
  size: {
    linear, linearClipped, log, logSafe,
    exp, square, cubic, bins,
    small_medium_large, five_tiers
  },

  // Opacity Helpers
  opacity: {
    linear, threshold, binary, inverse
  },

  // Label Helpers
  label: {
    percentage, fixed, scientific, compact, integer,
    substitute, rankLabel, scoreLabel, communityLabel,
    levelLabel, ifAbove, topN, conditional
  },

  // Edge Width Helpers
  edgeWidth: {
    linear, log, binary, stepped
  },

  // Combined Helpers
  combined: {
    sizeAndColor, colorAndOpacity, sizeAndGlow
  },

  // Animation Helpers
  animation: {
    pulse, flow, sequentialReveal
  },
};
```

---

## 10. Success Metrics

- **Coverage**: 100% of algorithm result types have appropriate helpers
- **Usage**: All algorithms use StyleHelpers in suggested styles
- **Performance**: Helper evaluation <1ms per node/edge
- **Accessibility**: All color helpers have colorblind-safe alternatives
- **Documentation**: Complete helper reference with visual examples
- **Testing**: >95% code coverage for all helpers

---

## Conclusion

This StyleHelpers framework provides a comprehensive, reusable system for mapping all algorithm result types to all available visual styles. The phased implementation approach allows for incremental delivery while ensuring the foundation supports all 27+ planned algorithms.

**Next Steps**:
1. Review and approve framework design
2. Begin Phase 1 implementation (1-2 days)
3. Refactor existing algorithms to use helpers
4. Expand to full helper library (Phase 2-3)
5. Create documentation and examples
