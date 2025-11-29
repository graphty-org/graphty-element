# StyleHelpers Implementation Guide

**Last Updated**: 2025-01-22
**Status**: Design Complete, Ready for Phase 1 Implementation

---

## Overview

StyleHelpers provide reusable utility functions that map algorithm results to visual styles. This system enables consistent, professional, accessible visualizations across all 27+ planned algorithms.

**Related Documents**:
- **[Color Palettes Specification](./color-palettes-specification.md)** - Research-backed color system (Okabe-Ito, Viridis, Paul Tol)
- **[StyleHelpers Framework](./style-helpers-framework.md)** - Detailed analysis of algorithm result types and visual mappings
- **[Algorithm Suggested Styles](./algorithm-suggested-styles.md)** - Original design for suggested styles feature

---

## Design Principles

1. **Accessibility First**: All defaults colorblind-safe (Okabe-Ito, Viridis, Paul Tol)
2. **Professional Aesthetic**: Consistent "Graphty Modern" theme (purple→blue→teal→yellow)
3. **Scientifically Validated**: Industry standards (Tableau, matplotlib, ColorBrewer, D3)
4. **User Choice**: Multiple options while maintaining cohesion
5. **Performance**: Helpers evaluated <1ms per element

---

## Architecture

```
src/
├── config/
│   ├── StyleHelpers.ts         # Main export barrel
│   └── palettes/
│       ├── sequential.ts       # Viridis, Plasma, Inferno, etc.
│       ├── categorical.ts      # Okabe-Ito, Paul Tol, etc.
│       ├── diverging.ts        # Purple-Green, Blue-Orange
│       └── binary.ts           # Blue Highlight, Green Success
├── utils/
│   └── styleHelpers/
│       ├── color/              # Color interpolation
│       ├── size/               # Scaling functions
│       ├── opacity/            # Transparency mapping
│       ├── label/              # Text formatting
│       ├── edgeWidth/          # Width mapping
│       └── combined/           # Multi-dimensional
```

---

## Color Helpers

> **See [Color Palettes Specification](./color-palettes-specification.md)** for complete details, research, and accessibility testing.

### Sequential Gradients (Continuous 0-1 → Color)

**Use for**: Centrality metrics, importance scores, continuous data

```typescript
export namespace Sequential {
  /**
   * Default: Viridis (Purple → Yellow)
   * ✅ Perceptually uniform ✅ Colorblind-safe ✅ Print-friendly
   * Research: matplotlib standard, scientific visualization
   */
  viridis(value: number): string;

  /**
   * Alternative: Plasma (Blue → Pink → Yellow)
   * ✅ Perceptually uniform ✅ Colorblind-safe
   */
  plasma(value: number): string;

  /**
   * Alternative: Inferno (Black → Red → Yellow)
   * ✅ Perceptually uniform ✅ Colorblind-safe
   * Use for: Dark, dramatic visualizations
   */
  inferno(value: number): string;

  /**
   * Single-hue: Blues (Light Blue → Dark Blue)
   * ✅ Colorblind-safe (blue is universal)
   * Use for: Cooler aesthetic, single metric
   */
  blues(value: number): string;

  /**
   * Single-hue: Greens (Light Green → Dark Green)
   * Use for: Growth, positive metrics
   */
  greens(value: number): string;

  /**
   * Single-hue: Oranges (Light Orange → Dark Orange)
   * Use for: Heat, activity, energy
   */
  oranges(value: number): string;
}
```

**Implementation Example** (DegreeAlgorithm):
```typescript
static suggestedStyles = (): SuggestedStylesConfig => ({
  layers: [{
    node: {
      calculatedStyle: {
        inputs: ["algorithmResults.graphty.degree.degreePct"],
        output: "style.texture.color",
        expr: `{ return StyleHelpers.color.sequential.viridis(arguments[0]) }`,
      },
    },
    metadata: {
      name: "Degree - Viridis Gradient",
      description: "Purple (low) → Yellow (high) - colorblind-safe",
    },
  }],
});
```

**Color Values** (Viridis default):
```
0.0 → #440154 (deep purple)
0.2 → #2a788e (teal)
0.5 → #7ad151 (green)
0.8 → #fde724 (bright yellow)
```

---

### Categorical Palettes (Discrete Groups → Color)

**Use for**: Communities, clusters, components, categories

```typescript
export namespace Categorical {
  /**
   * Default: Okabe-Ito (8 colors)
   * ✅ Colorblind-safe (all types) ✅ R 4.0+ default
   * Research: Okabe & Ito (2008), universally accepted standard
   * Maximum 8 categories (Tableau recommendation)
   */
  okabeIto(categoryId: number): string;

  /**
   * Alternative: Paul Tol Vibrant (7 colors)
   * ✅ Colorblind-safe ✅ High saturation
   * Research: Paul Tol SRON/EPS/TN/09-002
   */
  tolVibrant(categoryId: number): string;

  /**
   * Alternative: Paul Tol Muted (9 colors)
   * ✅ Colorblind-safe ✅ Softer aesthetic
   */
  tolMuted(categoryId: number): string;

  /**
   * Alternative: IBM Carbon (5 colors)
   * Modern enterprise design system
   */
  carbon(categoryId: number): string;

  /**
   * Aesthetic variant: Pastel (8 colors)
   * ✅ Colorblind-safe (derived from Okabe-Ito)
   * ⚠️ Lower contrast
   */
  pastel(categoryId: number): string;
}
```

**Implementation Example** (LouvainAlgorithm):
```typescript
static suggestedStyles = (): SuggestedStylesConfig => ({
  layers: [{
    node: {
      calculatedStyle: {
        inputs: ["algorithmResults.graphty.louvain.communityId"],
        output: "style.texture.color",
        expr: `{ return StyleHelpers.color.categorical.okabeIto(arguments[0]) }`,
      },
    },
    metadata: {
      name: "Louvain - Okabe-Ito Colors",
      description: "8 vivid colorblind-safe community colors",
    },
  }],
});
```

**Color Values** (Okabe-Ito default):
```
0 → #E69F00 (Orange)
1 → #56B4E9 (Sky Blue)
2 → #009E73 (Bluish Green)
3 → #F0E442 (Yellow)
4 → #0072B2 (Blue)
5 → #D55E00 (Vermillion)
6 → #CC79A7 (Reddish Purple)
7 → #999999 (Gray)
```

---

### Diverging Gradients (Midpoint-Based → Color)

**Use for**: Above/below average, positive/negative, increase/decrease

```typescript
export namespace Diverging {
  /**
   * Default: Purple-Green (Paul Tol)
   * ✅ Colorblind-safe ✅ No red-green
   * Research: Paul Tol optimized for all colorblindness types
   */
  purpleGreen(value: number, midpoint?: number): string;

  /**
   * Alternative: Blue-Orange (ColorBrewer)
   * ✅ Colorblind-safe ✅ High contrast
   */
  blueOrange(value: number, midpoint?: number): string;

  /**
   * Temperature only: Red-Blue
   * ⚠️ Not colorblind-safe (contains red-green issue)
   * Use ONLY when temperature metaphor is critical
   */
  redBlue(value: number, midpoint?: number): string;
}
```

**Implementation Example** (hypothetical clustering quality):
```typescript
static suggestedStyles = (): SuggestedStylesConfig => ({
  layers: [{
    node: {
      calculatedStyle: {
        inputs: ["algorithmResults.graphty.clustering.deviationFromAvg"],
        output: "style.texture.color",
        // midpoint = 0.5 (average)
        expr: `{ return StyleHelpers.color.diverging.purpleGreen(arguments[0], 0.5) }`,
      },
    },
    metadata: {
      name: "Clustering - Deviation",
      description: "Purple (below avg) ← White → Green (above avg)",
    },
  }],
});
```

**Color Values** (Purple-Green default):
```
0.0 → #762a83 (purple - low)
0.5 → #f7f7f7 (white - midpoint)
1.0 → #1b7837 (green - high)
```

---

### Binary Highlights (Boolean → Color)

**Use for**: Path highlighting, MST edges, selected elements

```typescript
export namespace Binary {
  /**
   * Default: Blue Highlight
   * ✅ Blue is universal safe hue
   * ✅ 4.5:1 contrast (WCAG AAA)
   */
  blueHighlight(isHighlighted: boolean): string;

  /**
   * Alternative: Green Success
   * Use for: Correct answers, successful paths
   */
  greenSuccess(isHighlighted: boolean): string;

  /**
   * Alternative: Orange Warning
   * Use for: Warnings, attention needed
   */
  orangeWarning(isHighlighted: boolean): string;

  /**
   * Custom colors
   */
  custom(isHighlighted: boolean, highlightColor: string, mutedColor: string): string;
}
```

**Implementation Example** (DijkstraAlgorithm):
```typescript
static suggestedStyles = (): SuggestedStylesConfig => ({
  layers: [
    {
      edge: {
        calculatedStyle: {
          inputs: ["algorithmResults.graphty.dijkstra.inPath"],
          output: "style.line.color",
          expr: `{ return StyleHelpers.color.binary.blueHighlight(arguments[0]) }`,
        },
      },
      metadata: {
        name: "Shortest Path - Edge Colors",
        description: "Blue highlight for path, gray for others",
      },
    },
    {
      edge: {
        calculatedStyle: {
          inputs: ["algorithmResults.graphty.dijkstra.inPath"],
          output: "style.line.width",
          expr: `{ return arguments[0] ? 3 : 1 }`,
        },
      },
    },
  ],
});
```

**Color Values**:
```
blueHighlight: true  → #0072B2 (Okabe-Ito blue)
blueHighlight: false → #CCCCCC (light gray)

greenSuccess:  true  → #009E73 (Okabe-Ito green)
greenSuccess:  false → #999999 (medium gray)

orangeWarning: true  → #E69F00 (Okabe-Ito orange)
orangeWarning: false → #CCCCCC (light gray)
```

---

## Size Helpers

**Use for**: Scaling nodes/edges by importance, centrality, flow

### Linear Scaling

```typescript
export namespace Size {
  /**
   * Linear mapping [0,1] → [minSize, maxSize]
   * Default: [1, 5] range
   */
  linear(value: number, minSize?: number, maxSize?: number): number;

  /**
   * Linear with clipping (prevent extreme sizes)
   */
  linearClipped(
    value: number,
    minSize?: number,
    maxSize?: number,
    clipMin?: number,
    clipMax?: number
  ): number;
}
```

**Implementation Example** (PageRankAlgorithm):
```typescript
static suggestedStyles = (): SuggestedStylesConfig => ({
  layers: [{
    node: {
      calculatedStyle: {
        inputs: ["algorithmResults.graphty.pagerank.rankPct"],
        output: "style.shape.size",
        expr: `{ return StyleHelpers.size.linear(arguments[0], 1, 5) }`,
      },
    },
    metadata: {
      name: "PageRank - Node Size",
      description: "Size 1-5 based on PageRank importance",
    },
  }],
});
```

---

### Logarithmic Scaling

**Use for**: Highly skewed distributions (power-law networks)

```typescript
export namespace Size {
  /**
   * Logarithmic scaling for power-law distributions
   * Prevents extreme size differences
   */
  log(value: number, minSize?: number, maxSize?: number, base?: number): number;

  /**
   * Log with offset for zero values
   */
  logSafe(value: number, minSize?: number, maxSize?: number, epsilon?: number): number;
}
```

**Use when**: Degree distribution is power-law (few hubs, many low-degree nodes)

---

### Exponential Scaling

**Use for**: Emphasizing top-ranked nodes dramatically

```typescript
export namespace Size {
  /**
   * Exponential scaling [0,1] → [minSize, maxSize]
   * Makes high values dramatically larger
   */
  exp(value: number, minSize?: number, maxSize?: number, exponent?: number): number;

  /**
   * Common presets
   */
  square(value: number, minSize?: number, maxSize?: number): number; // exponent = 2
  cubic(value: number, minSize?: number, maxSize?: number): number;  // exponent = 3
}
```

---

### Binned/Stepped Scaling

**Use for**: Categorical size tiers (small, medium, large)

```typescript
export namespace Size {
  /**
   * Maps continuous [0,1] to discrete size bins
   */
  bins(value: number, sizes: number[]): number;

  /**
   * Common presets
   */
  small_medium_large(value: number): number; // → [1, 2.5, 4]
  five_tiers(value: number): number;         // → [1, 2, 3, 4, 5]
}
```

---

## Opacity Helpers

**Use for**: De-emphasizing less important elements, layered effects

```typescript
export namespace Opacity {
  /**
   * Linear fade [0,1] → [minOpacity, maxOpacity]
   * Default: [0.1, 1.0]
   */
  linear(value: number, minOpacity?: number, maxOpacity?: number): number;

  /**
   * Threshold: opaque above, faded below
   */
  threshold(
    value: number,
    threshold?: number,
    belowOpacity?: number,
    aboveOpacity?: number
  ): number;

  /**
   * Binary: visible/invisible
   */
  binary(isVisible: boolean, visibleOpacity?: number, hiddenOpacity?: number): number;

  /**
   * Inverse: high values = transparent (for backgrounds)
   */
  inverse(value: number, minOpacity?: number, maxOpacity?: number): number;
}
```

**Implementation Example** (de-emphasize low-degree nodes):
```typescript
calculatedStyle: {
  inputs: ["algorithmResults.graphty.degree.degreePct"],
  output: "style.texture.opacity",
  // Nodes below 0.3 are 30% opacity, above are 100%
  expr: `{ return StyleHelpers.opacity.threshold(arguments[0], 0.3, 0.3, 1.0) }`,
}
```

---

## Label Helpers

**Use for**: Formatting metric values for display

### Numeric Formatting

```typescript
export namespace Label {
  /**
   * Percentage: 0.75 → "75%"
   */
  percentage(value: number, decimals?: number): string;

  /**
   * Fixed decimals: 0.123456 → "0.12"
   */
  fixed(value: number, decimals?: number): string;

  /**
   * Scientific notation: 123456 → "1.23e5"
   */
  scientific(value: number, decimals?: number): string;

  /**
   * Compact: 1000000 → "1.0M"
   */
  compact(value: number): string; // K, M, B suffixes

  /**
   * Integer: 0.75 → "1"
   */
  integer(value: number): string;
}
```

**Implementation Example**:
```typescript
label: {
  enabled: true,
  textPath: "algorithmResults.graphty.pagerank.rankPct",
  text: `{
    const pct = StyleHelpers.label.percentage(value);
    return "PageRank: " + pct;
  }`,
}
// Result: "PageRank: 85%" displayed on node
```

---

### Text Templates

```typescript
export namespace Label {
  /**
   * Template substitution
   */
  substitute(template: string, values: Record<string, unknown>): string;

  /**
   * Common presets
   */
  rankLabel(rank: number): string;                    // "Rank: 5"
  scoreLabel(score: number, label: string): string;   // "PageRank: 0.85"
  communityLabel(id: number): string;                 // "Community 3"
  levelLabel(level: number): string;                  // "Level 2"
}
```

---

### Conditional Display

**Use for**: Decluttering (only show important labels)

```typescript
export namespace Label {
  /**
   * Only show if value above threshold
   */
  ifAbove(
    value: number,
    threshold: number,
    formatter: (v: number) => string
  ): string | null;

  /**
   * Only show for top N values
   */
  topN(
    value: number,
    rank: number,
    n: number,
    formatter: (v: number) => string
  ): string | null;

  /**
   * Conditional text
   */
  conditional(condition: boolean, trueText: string, falseText: string): string;
}
```

**Example** (only show labels for nodes above 50%):
```typescript
label: {
  enabled: true,
  text: `{
    return StyleHelpers.label.ifAbove(
      value,
      0.5,
      (v) => StyleHelpers.label.percentage(v)
    ) || '';
  }`,
}
```

---

## Edge Width Helpers

**Use for**: Flow visualization, weighted graphs

```typescript
export namespace EdgeWidth {
  /**
   * Linear scaling [0,1] → [minWidth, maxWidth]
   * Default: [0.5, 5]
   */
  linear(value: number, minWidth?: number, maxWidth?: number): number;

  /**
   * Logarithmic (for highly varied flows)
   */
  log(value: number, minWidth?: number, maxWidth?: number): number;

  /**
   * Binary (highlight vs normal)
   */
  binary(isHighlighted: boolean, highlightWidth?: number, normalWidth?: number): number;

  /**
   * Stepped (discrete width levels)
   */
  stepped(value: number, widths: number[]): number;
}
```

**Implementation Example** (MaxFlowAlgorithm):
```typescript
static suggestedStyles = (): SuggestedStylesConfig => ({
  layers: [{
    edge: {
      calculatedStyle: {
        inputs: ["algorithmResults.graphty.maxflow.flowPct"],
        output: "style.line.width",
        expr: `{ return StyleHelpers.edgeWidth.linear(arguments[0], 0.5, 5) }`,
      },
    },
    metadata: {
      name: "Max Flow - Edge Width",
      description: "Thicker edges = more flow (0.5-5)",
    },
  }],
});
```

---

## Making Helpers Available in calculatedStyle Context

**Challenge**: `calculatedStyle.expr` runs in isolated context without imports.

**Solution**: Inject StyleHelpers into evaluation context

```typescript
// In StyleManager or expression evaluator
const evalContext = {
  arguments: inputValues,
  StyleHelpers: StyleHelpers, // ⭐ Inject all helpers
};

const fn = new Function('StyleHelpers', 'arguments', `return (${expr})`);
const result = fn(StyleHelpers, inputValues);
```

This allows expressions to access helpers:
```typescript
expr: `{ return StyleHelpers.color.sequential.viridis(arguments[0]) }`
```

---

## Complete API Reference

```typescript
export const StyleHelpers = {
  color: {
    sequential: {
      viridis, plasma, inferno,
      blues, greens, oranges
    },
    diverging: {
      purpleGreen, blueOrange, redBlue
    },
    categorical: {
      okabeIto, tolVibrant, tolMuted,
      carbon, pastel
    },
    binary: {
      blueHighlight, greenSuccess, orangeWarning, custom
    },
  },
  size: {
    linear, linearClipped,
    log, logSafe,
    exp, square, cubic,
    bins, small_medium_large, five_tiers
  },
  opacity: {
    linear, threshold, binary, inverse
  },
  label: {
    percentage, fixed, scientific, compact, integer,
    substitute, rankLabel, scoreLabel, communityLabel, levelLabel,
    ifAbove, topN, conditional
  },
  edgeWidth: {
    linear, log, binary, stepped
  },
};
```

---

## Implementation Phases

### Phase 1: Core Essentials (1-2 days)

**Priority 1 - Ship with existing algorithms**:
1. ✅ `color.sequential.viridis`
2. ✅ `color.categorical.okabeIto`
3. ✅ `color.binary.blueHighlight`
4. ✅ `size.linear`
5. ✅ `opacity.threshold`
6. ✅ `label.percentage`

**Deliverable**:
- StyleHelpers module structure created
- Priority 1 helpers implemented with color palette integration
- DegreeAlgorithm, PageRankAlgorithm, LouvainAlgorithm updated to use helpers
- Unit tests for each helper
- Helpers available in calculatedStyle context

**Success Criteria**:
- All 3 algorithms use StyleHelpers with new color palettes
- Tests pass
- Visual tests show correct Okabe-Ito and Viridis rendering

---

### Phase 2: Extended Options (2-3 days)

**Priority 2 - User choices**:
1. Sequential alternatives: plasma, inferno, blues, greens, oranges
2. Categorical alternatives: tolVibrant, tolMuted, carbon, pastel
3. Diverging palettes: purpleGreen, blueOrange
4. Binary alternatives: greenSuccess, orangeWarning
5. Size alternatives: log, exp, bins
6. Label helpers: fixed, compact, templates
7. Edge width helpers

**Deliverable**:
- 3-6 options per helper category
- Storybook visual catalog showing all palettes
- Documentation with visual examples

---

### Phase 3: Advanced & Polish (2-3 days)

**Priority 3 - Advanced features**:
1. Combined multi-dimensional helpers
2. Animation helpers
3. Conditional label helpers
4. Performance optimization
5. Accessibility testing suite
6. Interactive palette picker

**Deliverable**:
- Complete StyleHelpers system
- Comprehensive documentation
- Accessibility audit passed
- Performance benchmarked

---

## Testing Strategy

### Unit Tests

```typescript
// test/utils/styleHelpers/color/sequential.test.ts
describe("Sequential.viridis", () => {
  it("returns deep purple (#440154) for value 0", () => {
    assert.strictEqual(StyleHelpers.color.sequential.viridis(0), "#440154");
  });

  it("returns bright yellow (#fde724) for value 1", () => {
    assert.strictEqual(StyleHelpers.color.sequential.viridis(1), "#fde724");
  });

  it("interpolates smoothly", () => {
    const c1 = StyleHelpers.color.sequential.viridis(0.25);
    const c2 = StyleHelpers.color.sequential.viridis(0.75);
    assert.notStrictEqual(c1, c2);
  });
});
```

---

### Visual Tests (Storybook)

```typescript
// stories/StyleHelpers.stories.ts
export const SequentialGradients: Story = {
  render: () => {
    // Show viridis, plasma, inferno side-by-side
    // Render gradient bars with 0, 0.1, 0.2, ... 1.0
  },
};

export const CategoricalPalettes: Story = {
  render: () => {
    // Show Okabe-Ito, Paul Tol variants
    // Render 8 colored circles per palette
  },
};

export const ColorblindSimulation: Story = {
  render: () => {
    // Show normal view + deuteranopia + protanopia + tritanopia
    // Verify all defaults remain distinguishable
  },
};
```

---

### Accessibility Testing

For every palette:
- ✅ Deuteranopia simulator (red-green, ~5% males)
- ✅ Protanopia simulator (red-green, ~1% males)
- ✅ Tritanopia simulator (blue-yellow, ~0.01%)
- ✅ 3:1 contrast ratio (WCAG 2.1 Level A)
- ✅ Grayscale conversion (print-friendly)
- ✅ Dark mode compatibility

**Tools**: Color Oracle, Coblis, WebAIM, Chrome DevTools

---

## Migration Guide: Updating Existing Algorithms

### Before (Inline Code)

```typescript
static suggestedStyles = (): SuggestedStylesConfig => ({
  layers: [{
    node: {
      calculatedStyle: {
        inputs: ["algorithmResults.graphty.degree.degreePct"],
        output: "style.texture.color",
        // ❌ Inline HSL calculation
        expr: "{ return 'hsl(' + (0 + arguments[0] * 60) + ', 70%, 50%)' }",
      },
    },
  }],
});
```

### After (StyleHelpers)

```typescript
static suggestedStyles = (): SuggestedStylesConfig => ({
  layers: [{
    node: {
      calculatedStyle: {
        inputs: ["algorithmResults.graphty.degree.degreePct"],
        output: "style.texture.color",
        // ✅ Research-backed, colorblind-safe palette
        expr: "{ return StyleHelpers.color.sequential.viridis(arguments[0]) }",
      },
    },
    metadata: {
      name: "Degree - Viridis Gradient",
      description: "Purple (low) → Yellow (high) - colorblind-safe",
    },
  }],
});
```

**Benefits**:
- ✅ Colorblind-safe (Viridis tested)
- ✅ Perceptually uniform (accurate interpretation)
- ✅ Professional aesthetic (industry standard)
- ✅ Consistent theme (matches other algorithms)
- ✅ Maintainable (centralized palettes)
- ✅ Documented (metadata explains colors)

---

## Success Metrics

- ✅ **100% colorblind-safe**: All defaults pass simulation tests
- ✅ **Consistent theme**: Purple-blue-teal-yellow across all palette types
- ✅ **Performance**: Helper evaluation <1ms per element
- ✅ **Coverage**: Helpers for all algorithm result types
- ✅ **Accessibility**: WCAG 2.1 Level A compliance (3:1 contrast)
- ✅ **Documentation**: Complete reference with visual examples
- ✅ **Testing**: >95% code coverage

---

## References

1. **[Color Palettes Specification](./color-palettes-specification.md)** - Complete color research and palette definitions
2. **[StyleHelpers Framework](./style-helpers-framework.md)** - Detailed algorithm analysis and mapping strategy
3. **Okabe, M., & Ito, K. (2008)**. Color Universal Design
4. **Tol, P. (2021)**. Colour Schemes (SRON/EPS/TN/09-002)
5. **Nuñez et al. (2018)**. Optimizing colormaps for color vision deficiency (PLOS ONE)
6. **Smith & van der Walt (2015)**. A Better Default Colormap for Matplotlib
7. **Harrower & Brewer (2003)**. ColorBrewer.org (The Cartographic Journal)

---

## Next Steps

1. ✅ **Design Complete**: Color palettes researched and specified
2. ⏭️ **Phase 1 Implementation**: Core helpers (viridis, okabeIto, linear, etc.)
3. ⏭️ **Update Algorithms**: Migrate DegreeAlgorithm, PageRankAlgorithm, LouvainAlgorithm
4. ⏭️ **Testing**: Unit tests + visual tests + accessibility tests
5. ⏭️ **Phase 2**: Extended options and user choices
6. ⏭️ **Phase 3**: Advanced features and polish

**Ready to begin Phase 1 implementation!**
