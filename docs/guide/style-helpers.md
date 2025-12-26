# Style Helpers & Palettes

Comprehensive guide to using Style Helpers for data-driven visualization with colorblind-safe palettes.

## Overview

Style Helpers transform algorithm results into visual properties. They provide:

- Research-backed, colorblind-safe color palettes
- Consistent, professional aesthetic
- Easy mapping from data values to visual properties

## Color Palettes

### Sequential Palettes (Continuous Data: 0 → 1)

For continuous data like centrality scores or normalized values:

| Palette | Colors | Use Case | Colorblind Safe |
|---------|--------|----------|-----------------|
| `viridis` (default) | Purple → Teal → Yellow | General continuous data | ✅ Yes |
| `plasma` | Purple → Pink → Yellow | High contrast needed | ✅ Yes |
| `inferno` | Black → Red → Yellow | Emphasis on extremes | ✅ Yes |
| `blues` | Light → Dark Blue | Professional, subtle | ✅ Yes |
| `greens` | Light → Dark Green | Growth, positive metrics | ✅ Yes |
| `oranges` | Light → Dark Orange | Activity, heat | ✅ Yes |

```typescript
import { StyleHelpers } from '@graphty/graphty-element';

// Map 0-1 value to color
const color = StyleHelpers.color.sequential.viridis(0.7);
const blueColor = StyleHelpers.color.sequential.blues(0.5);
```

### Categorical Palettes (Discrete Groups)

For distinct categories like communities or types:

| Palette | Colors | Use Case | Colorblind Safe |
|---------|--------|----------|-----------------|
| `okabeIto` (default) | 8 colors | Universal safe choice | ✅ Yes |
| `paulTolVibrant` | 7 colors | High saturation | ✅ Yes |
| `paulTolMuted` | 9 colors | Softer aesthetic | ✅ Yes |
| `ibmCarbon` | 5 colors | Enterprise design | ✅ Yes |
| `pastel` | 8 colors | Lighter appearance | ✅ Yes |

```typescript
// Map category index to color
const color = StyleHelpers.color.categorical.okabeIto(2);
const vibrantColor = StyleHelpers.color.categorical.paulTolVibrant(0);
```

### Diverging Palettes (Midpoint Data: -1 ↔ 0 ↔ +1)

For data with a meaningful center point:

| Palette | Colors | Use Case | Colorblind Safe |
|---------|--------|----------|-----------------|
| `purpleGreen` (default) | Purple ← White → Green | General diverging | ✅ Yes |
| `blueOrange` | Blue ← White → Orange | Alternative | ✅ Yes |
| `redBlue` | Red ← White → Blue | Temperature only | ⚠️ No |

```typescript
// Map -1 to +1 value to color
const color = StyleHelpers.color.diverging.purpleGreen(0.5);
const negative = StyleHelpers.color.diverging.purpleGreen(-0.8);
```

### Binary Palettes (Boolean: true/false)

For binary states like selected/unselected:

| Palette | Colors | Use Case | Colorblind Safe |
|---------|--------|----------|-----------------|
| `blueHighlight` (default) | Blue vs Gray | Selection, highlight | ✅ Yes |
| `greenSuccess` | Green vs Gray | Success states | ✅ Yes |
| `orangeWarning` | Orange vs Gray | Warning states | ✅ Yes |

```typescript
// Map boolean to color
const color = StyleHelpers.color.binary.blueHighlight(true);
const inactiveColor = StyleHelpers.color.binary.blueHighlight(false);
```

## Why These Colors?

### Okabe-Ito Palette

Designed by Masataka Okabe and Kei Ito (2008) specifically for colorblind accessibility. Adopted as the R 4.0 default. Each color is distinguishable under all forms of color vision deficiency.

### Paul Tol Palettes

Mathematically optimized palettes by Paul Tol (2021) using color science principles. Tested for Deuteranopia, Protanopia, and Tritanopia.

### Viridis/Plasma/Inferno

Developed for matplotlib by Stéfan van der Walt and Nathaniel Smith. Perceptually uniform (equal steps look equal) and colorblind-safe.

### ColorBrewer

Cynthia Brewer's research-backed palettes widely used in cartography and data visualization.

## Size Helpers

Map values to node sizes:

```typescript
// Linear scaling
const size = StyleHelpers.size.linear(value, { min: 0.5, max: 3.0 });

// Logarithmic (for power-law data like degree distribution)
const logSize = StyleHelpers.size.log(value, { min: 0.5, max: 3.0 });

// Discrete bins
const binSize = StyleHelpers.size.bins(value, [0.5, 1.0, 1.5, 2.0, 3.0]);
```

## Opacity Helpers

Map values to transparency:

```typescript
// Linear opacity
const opacity = StyleHelpers.opacity.linear(value);

// Threshold (below = 0, above = 1)
const threshOpacity = StyleHelpers.opacity.threshold(value, 0.5);
```

## Label Helpers

Format values for labels:

```typescript
// Format as percentage
const label = StyleHelpers.label.percentage(0.847); // "84.7%"

// Format with rank
const rankLabel = StyleHelpers.label.rankLabel(node, 'degree'); // "#3"

// Top N only (returns label only for top N nodes)
const topLabel = StyleHelpers.label.topN(node, 'pagerank', 10);
```

## Edge Width Helpers

Map edge weights to width:

```typescript
const width = StyleHelpers.edgeWidth.linear(weight, { min: 0.5, max: 3.0 });
```

## Combined Helpers

Apply multiple visual properties at once:

```typescript
// Color AND size from same value
const { color, size } = StyleHelpers.combined.colorAndSize(value);

// Full spectrum: color, size, opacity, label
const styles = StyleHelpers.combined.fullSpectrum(value);
```

## Animation Helpers

For animated visualizations:

```typescript
// Easing functions
const eased = StyleHelpers.animation.easeOutCubic(t);

// Pulse effect
const pulse = StyleHelpers.animation.pulse(t, { frequency: 2 });
```

## Using with Algorithms

Complete example combining algorithms with style helpers:

```typescript
// Run algorithm
await graph.runAlgorithm('graphty', 'degree');

// Find max degree for normalization
const maxDegree = Math.max(
  ...graph.getNodes().map(n => n.algorithmResults['graphty:degree'] || 0)
);

// Apply style helper
graph.styleManager.addLayer({
  selector: '*',
  styles: {
    node: {
      color: (node) => StyleHelpers.color.sequential.viridis(
        (node.algorithmResults['graphty:degree'] || 0) / maxDegree
      ),
      size: (node) => StyleHelpers.size.log(
        node.algorithmResults['graphty:degree'] || 0,
        { min: 0.5, max: 2.5 }
      )
    }
  }
});
```

## Colorblind Safety Guidelines

### Do

- Use default palettes (all tested for accessibility)
- Use Okabe-Ito for categorical data (8 distinct colors)
- Use single-hue palettes (blues, greens) for sequential data
- Test with colorblind simulation tools

### Don't

- Use red-green to indicate opposite meanings
- Use more than 7-9 categorical colors
- Rely solely on color to convey information

## Accessibility Features

```typescript
import { colorblindSimulation } from '@graphty/graphty-element';

// Simulate how colors appear to colorblind users
const deuteranopia = colorblindSimulation.simulateDeuteranopia('#ff0000');
const protanopia = colorblindSimulation.simulateProtanopia('#ff0000');

// Check if a palette is safe
const isSafe = colorblindSimulation.isPaletteSafe(myColors);
```

## Interactive Examples

- [Palette Picker](https://graphty-org.github.io/graphty-element/storybook/?path=/story/algorithms-palette-picker--palette-picker)
- [Centrality with Colors](https://graphty-org.github.io/graphty-element/storybook/?path=/story/algorithms-centrality--degree-centrality)
- [Community Detection](https://graphty-org.github.io/graphty-element/storybook/?path=/story/algorithms-community--louvain-community-detection)
