# Professional Color Palettes Specification

## Research Summary

Based on analysis of industry-leading visualization tools and scientific standards:

- **Tableau 2025**: AI-generated palettes, max 8 colors per viz, 7-10% of men are colorblind
- **ColorBrewer2**: Gold standard for cartography/scientific viz, colorblind-tested
- **D3.js**: Uses ColorBrewer + perceptually uniform scales
- **Matplotlib**: Viridis/Plasma/Inferno - perceptually uniform, colorblind-safe
- **Okabe-Ito**: Default in R 4.0+, 8 vivid colorblind-safe colors
- **Paul Tol**: Scientific visualization, mathematically optimized for colorblindness
- **IBM Carbon**: Modern enterprise design system, P3 gamut
- **Tailwind v4**: OKLCH color space, wide gamut (P3) colors
- **Cloudscape (AWS)**: 5 hues for data viz, max 8 series

### Key Principles
1. **Accessibility First**: All palettes must be colorblind-safe (especially deuteranopia/protanopia)
2. **Perceptual Uniformity**: Sequential scales should have consistent perceptual steps
3. **Maximum 8 Colors**: For categorical data to maintain distinguishability
4. **WCAG 2.1 Compliance**: 3:1 contrast ratio for meaningful graphics
5. **Avoid Red-Green**: Most common colorblindness (~8% of males)
6. **Blue is Universal**: Safest hue for all viewers
7. **Consistent Theme**: Default palette should have cohesive aesthetic across all types

---

## Default Theme: "Graphty Modern"

**Design Philosophy**:
- Professional, clean, modern aesthetic
- Based on Okabe-Ito (categorical) + Viridis family (sequential)
- Optimized for both light and dark backgrounds
- Maximum accessibility without sacrificing beauty
- Consistent blue-purple-teal core across all palette types

---

## 1. Sequential Palettes (Continuous Metrics 0-1)

### 1.1 Default: "Viridis" (Perceptually Uniform)

**Use**: General continuous metrics (degree, PageRank, betweenness)

```typescript
export const sequential_viridis = {
  name: "Viridis",
  description: "Perceptually uniform, colorblind-safe, default for continuous data",
  colors: [
    "#440154", // 0.0 - deep purple
    "#414487", // 0.1
    "#2a788e", // 0.2
    "#22a884", // 0.3
    "#42be71", // 0.4
    "#7ad151", // 0.5
    "#bddf26", // 0.6
    "#f0e542", // 0.7
    "#fde724", // 0.8 - bright yellow
  ],
  interpolate: (t: number) => string, // Linear interpolation between colors
};
```

**Properties**:
- ✅ Colorblind-safe (all types)
- ✅ Perceptually uniform
- ✅ Print-friendly (maintains contrast in grayscale)
- ✅ Good on light/dark backgrounds
- Range: Purple (low) → Yellow (high)

---

### 1.2 Alternative: "Plasma"

**Use**: When viridis feels too yellow/green-heavy

```typescript
export const sequential_plasma = {
  name: "Plasma",
  description: "Warm alternative to viridis, blue→pink→yellow",
  colors: [
    "#0d0887", // Deep blue
    "#5302a3",
    "#8b0aa5",
    "#b83289",
    "#db5c68",
    "#f48849",
    "#febd2a",
    "#f0f921", // Bright yellow
  ],
};
```

**Properties**:
- ✅ Colorblind-safe
- ✅ Perceptually uniform
- Range: Blue (low) → Pink → Yellow (high)

---

### 1.3 Alternative: "Inferno"

**Use**: For dark, dramatic visualizations

```typescript
export const sequential_inferno = {
  name: "Inferno",
  description: "Dark→warm progression, black→red→yellow",
  colors: [
    "#000004", // Near black
    "#1b0c41",
    "#4a0c6b",
    "#781c6d",
    "#a52c60",
    "#cf4446",
    "#ed6925",
    "#fb9b06",
    "#f7d13d", // Bright yellow
  ],
};
```

**Properties**:
- ✅ Colorblind-safe
- ✅ Perceptually uniform
- Range: Black (low) → Red → Yellow (high)

---

### 1.4 Single-Hue: "Blues"

**Use**: When single-hue progression is preferred (cooler aesthetic)

```typescript
export const sequential_blues = {
  name: "Blues",
  description: "Single-hue progression, light blue→dark blue",
  colors: [
    "#f7fbff", // Very light blue
    "#deebf7",
    "#c6dbef",
    "#9ecae1",
    "#6baed6",
    "#4292c6",
    "#2171b5",
    "#08519c",
    "#08306b", // Deep blue
  ],
};
```

**Properties**:
- ✅ Colorblind-safe (blue is universally safe)
- ✅ Print-friendly
- Range: Light Blue (low) → Dark Blue (high)

---

### 1.5 Single-Hue: "Greens"

**Use**: Growth, increase, positive metrics

```typescript
export const sequential_greens = {
  name: "Greens",
  description: "Single-hue progression, light green→dark green",
  colors: [
    "#f7fcf5",
    "#e5f5e0",
    "#c7e9c0",
    "#a1d99b",
    "#74c476",
    "#41ab5d",
    "#238b45",
    "#006d2c",
    "#00441b",
  ],
};
```

---

### 1.6 Single-Hue: "Oranges"

**Use**: Heat, activity, energy metrics

```typescript
export const sequential_oranges = {
  name: "Oranges",
  description: "Single-hue progression, light orange→dark orange",
  colors: [
    "#fff5eb",
    "#fee6ce",
    "#fdd0a2",
    "#fdae6b",
    "#fd8d3c",
    "#f16913",
    "#d94801",
    "#a63603",
    "#7f2704",
  ],
};
```

---

### 1.7 Cool-to-Hot: "Turbo"

**Use**: When traditional blue→red is needed (temperature, heat maps)

```typescript
export const sequential_turbo = {
  name: "Turbo",
  description: "Google's improved rainbow, blue→green→yellow→red",
  colors: [
    "#23171b", // Dark blue
    "#1c3faa",
    "#0a88f5",
    "#11cfee",
    "#22ffb4",
    "#6fff5e",
    "#c1ff0b",
    "#ffcc00",
    "#ff6600",
    "#cc0000", // Red
  ],
};
```

**Properties**:
- ⚠️ Not colorblind-safe (contains red-green)
- ✅ Perceptually uniform
- Use only when temperature/heat metaphor is critical

---

## 2. Diverging Palettes (Data with Meaningful Midpoint)

### 2.1 Default: "Purple-Green" (Paul Tol)

**Use**: Above/below average, positive/negative, increase/decrease

```typescript
export const diverging_purple_green = {
  name: "Purple-Green",
  description: "Paul Tol's purple-green diverging, colorblind-safe",
  colors: [
    "#762a83", // Purple (negative/low)
    "#9970ab",
    "#c2a5cf",
    "#e7d4e8",
    "#f7f7f7", // White (neutral/midpoint)
    "#d9f0d3",
    "#a6dba0",
    "#5aae61",
    "#1b7837", // Green (positive/high)
  ],
  midpoint: 0.5,
};
```

**Properties**:
- ✅ Colorblind-safe
- ✅ No red-green
- Range: Purple (low) ← White (neutral) → Green (high)

---

### 2.2 Alternative: "Blue-Orange" (ColorBrewer)

**Use**: Temperature, partisan data, contrasting categories

```typescript
export const diverging_blue_orange = {
  name: "Blue-Orange",
  description: "Cool vs warm, high contrast",
  colors: [
    "#2166ac", // Deep blue
    "#4393c3",
    "#92c5de",
    "#d1e5f0",
    "#f7f7f7", // White
    "#fddbc7",
    "#f4a582",
    "#d6604d",
    "#b2182b", // Red-orange
  ],
};
```

**Properties**:
- ✅ Colorblind-safe
- ✅ High contrast
- Range: Blue (low) ← White → Orange (high)

---

### 2.3 Alternative: "Red-Blue" (For Temperature Only)

**Use**: Temperature data where red=hot, blue=cold is intuitive

```typescript
export const diverging_red_blue = {
  name: "Red-Blue",
  description: "Temperature metaphor, use sparingly",
  colors: [
    "#67001f", // Deep red
    "#b2182b",
    "#d6604d",
    "#f4a582",
    "#fddbc7",
    "#f7f7f7", // White
    "#d1e5f0",
    "#92c5de",
    "#4393c3",
    "#2166ac", // Deep blue
  ],
};
```

**Properties**:
- ⚠️ Not colorblind-safe (red-green vision issues)
- Use ONLY when temperature metaphor is critical
- Provide colorblind-safe alternative

---

## 3. Categorical Palettes (Discrete Groups/Communities)

### 3.1 Default: "Okabe-Ito" (8 colors)

**Use**: Communities, clusters, components (up to 8 categories)

```typescript
export const categorical_okabe_ito = {
  name: "Okabe-Ito",
  description: "Gold standard for colorblind-safe categorical data (R default)",
  colors: [
    "#E69F00", // Orange
    "#56B4E9", // Sky Blue
    "#009E73", // Bluish Green
    "#F0E442", // Yellow
    "#0072B2", // Blue
    "#D55E00", // Vermillion
    "#CC79A7", // Reddish Purple
    "#999999", // Gray
  ],
  // Note: Black (#000000) sometimes included as 9th but conflicts with background
};
```

**Properties**:
- ✅ Colorblind-safe (all types)
- ✅ Vivid, nameable colors
- ✅ Default in R 4.0+
- ✅ Works on light/dark backgrounds
- Maximum 8 categories (Tableau recommendation)

---

### 3.2 Alternative: "Paul Tol Vibrant" (7 colors)

**Use**: When 7 colors are sufficient, more saturated look

```typescript
export const categorical_tol_vibrant = {
  name: "Paul Tol Vibrant",
  description: "Designed for TensorBoard, high saturation",
  colors: [
    "#0077BB", // Blue
    "#33BBEE", // Cyan
    "#009988", // Teal
    "#EE7733", // Orange
    "#CC3311", // Red
    "#EE3377", // Magenta
    "#BBBBBB", // Gray
  ],
};
```

**Properties**:
- ✅ Colorblind-safe
- ✅ High contrast
- Maximum 7 categories

---

### 3.3 Alternative: "Paul Tol Muted" (9 colors)

**Use**: When softer, more muted colors are preferred

```typescript
export const categorical_tol_muted = {
  name: "Paul Tol Muted",
  description: "Softer alternative, more colors but less vibrant",
  colors: [
    "#332288", // Indigo
    "#88CCEE", // Cyan
    "#44AA99", // Teal
    "#117733", // Green
    "#999933", // Olive
    "#DDCC77", // Sand
    "#CC6677", // Rose
    "#882255", // Wine
    "#AA4499", // Purple
  ],
};
```

**Properties**:
- ✅ Colorblind-safe
- ✅ More categories (9)
- ⚠️ Lower saturation (harder to distinguish on some displays)

---

### 3.4 Alternative: "IBM Carbon" (5 primary + 3 extended)

**Use**: Modern enterprise aesthetic, matches IBM design system

```typescript
export const categorical_carbon = {
  name: "IBM Carbon",
  description: "Modern enterprise design system palette",
  primary: [
    "#6929C4", // Purple (primary)
    "#1192E8", // Blue
    "#005D5D", // Teal
    "#9F1853", // Magenta
    "#FA4D56", // Red
  ],
  extended: [
    "#570408", // Dark red
    "#198038", // Green
    "#002D9C", // Navy
  ],
};
```

**Properties**:
- ✅ Modern, enterprise aesthetic
- ✅ P3 gamut support
- ⚠️ Includes red (use primary 5 for maximum accessibility)

---

### 3.5 Alternative: "Tableau Classic 10"

**Use**: When compatibility with Tableau visualizations is desired

```typescript
export const categorical_tableau10 = {
  name: "Tableau 10",
  description: "Tableau's classic 10-color palette",
  colors: [
    "#4E79A7", // Blue
    "#F28E2B", // Orange
    "#E15759", // Red
    "#76B7B2", // Teal
    "#59A14F", // Green
    "#EDC948", // Yellow
    "#B07AA1", // Purple
    "#FF9DA7", // Pink
    "#9C755F", // Brown
    "#BAB0AC", // Gray
  ],
};
```

**Properties**:
- ⚠️ Not fully colorblind-safe (red-green present)
- ✅ Industry standard (Tableau)
- Use Okabe-Ito for better accessibility

---

### 3.6 Pastel Variant: "Soft Categorical"

**Use**: Aesthetic preference, less aggressive look

```typescript
export const categorical_pastel = {
  name: "Soft Categorical",
  description: "Pastel version of Okabe-Ito colors",
  colors: [
    "#FFD699", // Light orange
    "#A8D8F0", // Light sky blue
    "#66C9B2", // Light teal
    "#FFF099", // Light yellow
    "#669DD6", // Light blue
    "#FF9980", // Light vermillion
    "#EBB8D2", // Light purple
    "#CCCCCC", // Light gray
  ],
};
```

**Properties**:
- ✅ Colorblind-safe (derived from Okabe-Ito)
- ✅ Softer aesthetic
- ⚠️ Lower contrast (may be harder to distinguish)

---

## 4. Binary/Highlight Palettes (Boolean Flags)

### 4.1 Default: "Blue Highlight"

**Use**: Path highlighting, MST edges, selected elements

```typescript
export const binary_blue_highlight = {
  name: "Blue Highlight",
  description: "Blue highlight for selected, gray for unselected",
  highlight: "#0072B2", // Okabe-Ito blue
  muted: "#CCCCCC",     // Light gray
  contrast: 4.5,        // WCAG AAA
};
```

---

### 4.2 Alternative: "Green Success"

**Use**: Correct answers, successful paths, positive results

```typescript
export const binary_green_success = {
  name: "Green Success",
  description: "Green for success, gray for neutral",
  highlight: "#009E73", // Okabe-Ito green
  muted: "#999999",     // Medium gray
};
```

---

### 4.3 Alternative: "Orange Warning"

**Use**: Warnings, important elements, attention needed

```typescript
export const binary_orange_warning = {
  name: "Orange Warning",
  description: "Orange for warning, gray for neutral",
  highlight: "#E69F00", // Okabe-Ito orange
  muted: "#CCCCCC",
};
```

---

## 5. Edge Width & Opacity Patterns

### Default Mappings

```typescript
export const edgeWidthMapping = {
  min: 0.5,  // Thinnest edge (low flow/weight)
  max: 5.0,  // Thickest edge (high flow/weight)
  default: 1.0,
};

export const opacityMapping = {
  hidden: 0.1,      // Nearly invisible (unimportant)
  muted: 0.3,       // De-emphasized
  normal: 0.7,      // Standard
  highlighted: 1.0, // Full opacity
};
```

---

## 6. Implementation: StyleHelpers API

### 6.1 Sequential Gradients

```typescript
export const SequentialGradients = {
  // Default
  viridis: (value: number) => interpolateViridis(value),

  // Alternatives
  plasma: (value: number) => interpolatePlasma(value),
  inferno: (value: number) => interpolateInferno(value),

  // Single-hue
  blues: (value: number) => interpolateBlues(value),
  greens: (value: number) => interpolateGreens(value),
  oranges: (value: number) => interpolateOranges(value),

  // Cool-to-hot (use sparingly)
  turbo: (value: number) => interpolateTurbo(value),
};
```

---

### 6.2 Diverging Gradients

```typescript
export const DivergingGradients = {
  // Default
  purpleGreen: (value: number, midpoint: number = 0.5) =>
    interpolatePurpleGreen(value, midpoint),

  // Alternatives
  blueOrange: (value: number, midpoint: number = 0.5) =>
    interpolateBlueOrange(value, midpoint),

  // Temperature only
  redBlue: (value: number, midpoint: number = 0.5) =>
    interpolateRedBlue(value, midpoint),
};
```

---

### 6.3 Categorical Palettes

```typescript
export const CategoricalPalettes = {
  // Default (recommended)
  okabeIto: (categoryId: number) =>
    OKABE_ITO_COLORS[categoryId % 8],

  // Alternatives
  tolVibrant: (categoryId: number) =>
    TOL_VIBRANT_COLORS[categoryId % 7],

  tolMuted: (categoryId: number) =>
    TOL_MUTED_COLORS[categoryId % 9],

  carbon: (categoryId: number) =>
    CARBON_COLORS[categoryId % 5],

  tableau10: (categoryId: number) =>
    TABLEAU10_COLORS[categoryId % 10],

  // Aesthetic variants
  pastel: (categoryId: number) =>
    PASTEL_COLORS[categoryId % 8],
};
```

---

### 6.4 Binary Highlights

```typescript
export const BinaryHighlights = {
  // Default
  blueHighlight: (isHighlighted: boolean) =>
    isHighlighted ? "#0072B2" : "#CCCCCC",

  // Alternatives
  greenSuccess: (isHighlighted: boolean) =>
    isHighlighted ? "#009E73" : "#999999",

  orangeWarning: (isHighlighted: boolean) =>
    isHighlighted ? "#E69F00" : "#CCCCCC",

  // Custom
  custom: (isHighlighted: boolean, highlightColor: string, mutedColor: string) =>
    isHighlighted ? highlightColor : mutedColor,
};
```

---

## 7. Usage Examples in Algorithms

### Example 1: Degree Algorithm (Sequential)

```typescript
export class DegreeAlgorithm extends Algorithm {
  static suggestedStyles = (): SuggestedStylesConfig => ({
    layers: [{
      node: {
        calculatedStyle: {
          inputs: ["algorithmResults.graphty.degree.degreePct"],
          output: "style.texture.color",
          // Use default viridis gradient
          expr: `{ return StyleHelpers.color.sequential.viridis(arguments[0]) }`,
        },
      },
      metadata: {
        name: "Degree - Viridis Gradient",
        description: "Purple (low degree) → Yellow (high degree)",
      },
    }],
    category: "node-metric",
  });
}
```

---

### Example 2: Louvain Algorithm (Categorical)

```typescript
export class LouvainAlgorithm extends Algorithm {
  static suggestedStyles = (): SuggestedStylesConfig => ({
    layers: [{
      node: {
        calculatedStyle: {
          inputs: ["algorithmResults.graphty.louvain.communityId"],
          output: "style.texture.color",
          // Use default Okabe-Ito palette
          expr: `{ return StyleHelpers.color.categorical.okabeIto(arguments[0]) }`,
        },
      },
      metadata: {
        name: "Louvain - Okabe-Ito Colors",
        description: "Colorblind-safe community colors",
      },
    }],
    category: "grouping",
  });
}
```

---

### Example 3: Dijkstra Algorithm (Binary Highlight)

```typescript
export class DijkstraAlgorithm extends Algorithm {
  static suggestedStyles = (): SuggestedStylesConfig => ({
    layers: [
      {
        edge: {
          calculatedStyle: {
            inputs: ["algorithmResults.graphty.dijkstra.inPath"],
            output: "style.line.color",
            // Highlight path in blue, mute others
            expr: `{ return StyleHelpers.color.binary.blueHighlight(arguments[0]) }`,
          },
        },
      },
      {
        edge: {
          calculatedStyle: {
            inputs: ["algorithmResults.graphty.dijkstra.inPath"],
            output: "style.line.width",
            // Path edges 3x wider
            expr: `{ return arguments[0] ? 3 : 1 }`,
          },
        },
      },
    ],
    category: "path",
  });
}
```

---

## 8. Accessibility Testing Checklist

For every palette:

- [ ] Test with **Deuteranopia** simulator (red-green, ~5% of males)
- [ ] Test with **Protanopia** simulator (red-green, ~1% of males)
- [ ] Test with **Tritanopia** simulator (blue-yellow, ~0.01%)
- [ ] Verify **3:1 contrast ratio** against background (WCAG 2.1 Level A)
- [ ] Verify **4.5:1 contrast ratio** for text (WCAG 2.1 Level AA)
- [ ] Test in **grayscale** (print-friendly)
- [ ] Test on **mobile displays** (smaller gamut)
- [ ] Test with **dark mode** background

**Tools**:
- Color Oracle (free, cross-platform)
- Coblis Color Blindness Simulator
- WebAIM Contrast Checker
- Chrome DevTools Rendering → Emulate vision deficiencies

---

## 9. Design System: Consistent Theme Across Palette Types

### "Graphty Modern" Default Theme Summary

| Palette Type | Default | Core Colors | Philosophy |
|--------------|---------|-------------|------------|
| **Sequential** | Viridis | Purple → Yellow | Perceptually uniform, scientific standard |
| **Diverging** | Purple-Green | Purple ← White → Green | No red-green, Paul Tol optimized |
| **Categorical** | Okabe-Ito | 8 vivid colors | R default, maximum accessibility |
| **Binary** | Blue Highlight | Blue vs Gray | Safe universal hue |

**Consistent Core Hues**:
- **Purple**: Primary (low values, negative)
- **Blue**: Secondary (neutral, highlights)
- **Teal/Green**: Tertiary (mid-high values, positive)
- **Yellow/Orange**: Accent (high values, warnings)

**Why This Works**:
- Purple-blue-green-yellow progression is consistent across sequential and diverging
- Okabe-Ito includes these same hues (blue, green, yellow)
- Blue is the universal safe highlight color
- No red-green conflicts anywhere in default theme
- Professional aesthetic (purple/blue) with natural metaphors (green=growth, yellow=peak)

---

## 10. Implementation Priority

### Phase 1 (Week 1): Core Defaults
1. ✅ Sequential: Viridis
2. ✅ Categorical: Okabe-Ito
3. ✅ Binary: Blue Highlight
4. ✅ Size: Linear scaling
5. ✅ Opacity: Threshold

**Deliverable**: All existing algorithms use new StyleHelpers

---

### Phase 2 (Week 2): Extended Options
1. Sequential alternatives: Plasma, Inferno, Blues, Greens, Oranges
2. Categorical alternatives: Paul Tol Vibrant, Paul Tol Muted, IBM Carbon
3. Diverging palettes: Purple-Green, Blue-Orange
4. Binary alternatives: Green Success, Orange Warning

**Deliverable**: Users can choose from 3-5 options per category

---

### Phase 3 (Week 3): Polish & Documentation
1. Accessibility testing suite
2. Storybook visual catalog
3. Interactive palette picker
4. Documentation with visual examples
5. Performance optimization

**Deliverable**: Production-ready system with docs

---

## 11. Future Enhancements

### Custom Palette API

```typescript
// Allow users to define custom palettes
StyleHelpers.color.registerCustomPalette("myBrand", {
  type: "categorical",
  colors: ["#FF0000", "#00FF00", "#0000FF"],
  colorblindSafe: false, // System warns if not safe
});

// Use custom palette
expr: `{ return StyleHelpers.color.categorical.myBrand(arguments[0]) }`
```

---

### Automatic Palette Selection

```typescript
// System auto-selects palette based on data characteristics
StyleHelpers.color.auto({
  dataType: "categorical",
  categoryCount: 5,
  preferColorblindSafe: true,
  aesthetic: "vibrant", // or "muted", "pastel"
});
// Returns: Okabe-Ito (first 5 colors)
```

---

### Theme Presets

```typescript
// Predefined themes for different use cases
StyleHelpers.setTheme("scientific"); // Viridis + Paul Tol
StyleHelpers.setTheme("enterprise"); // Carbon + Blue highlight
StyleHelpers.setTheme("accessible"); // Maximum colorblind safety
StyleHelpers.setTheme("vibrant");    // High saturation
StyleHelpers.setTheme("muted");      // Low saturation
```

---

## 12. References

1. **Okabe, M., & Ito, K. (2008)**. Color Universal Design. *How to make figures and presentations that are friendly to Colorblind people*.

2. **Tol, P. (2021)**. Colour Schemes. *SRON Technical Note SRON/EPS/TN/09-002*.

3. **Nuñez, J.R., Anderton, C.R., & Renslow, R.S. (2018)**. Optimizing colormaps with consideration for color vision deficiency. *PLOS ONE*, 13(7).

4. **Smith, N.J., & van der Walt, S. (2015)**. A Better Default Colormap for Matplotlib. *SciPy 2015*.

5. **Harrower, M., & Brewer, C.A. (2003)**. ColorBrewer.org: An Online Tool for Selecting Color Schemes for Maps. *The Cartographic Journal*, 40(1).

6. **Tableau Software (2025)**. Color Palettes and Effects Documentation.

7. **IBM Carbon Design System (2024)**. Data Visualization Color Guidelines.

8. **D3.js (2024)**. d3-scale-chromatic Documentation.

9. **Tailwind Labs (2024)**. Tailwind CSS v4 Color System (OKLCH).

10. **W3C (2018)**. Web Content Accessibility Guidelines (WCAG) 2.1.

---

## Conclusion

This specification provides a cohesive, modern, accessible color system based on industry best practices:

- **Default theme ("Graphty Modern")** uses scientifically validated palettes (Viridis, Okabe-Ito)
- **Maximum accessibility** - all defaults are colorblind-safe
- **Professional aesthetic** - consistent purple-blue-teal-yellow core across all palette types
- **User choice** - 3-5 alternative palettes per category
- **Future-proof** - extensible API for custom palettes

**Success Metrics**:
- ✅ 100% of defaults pass colorblind simulation
- ✅ 3:1 contrast ratio (WCAG 2.1 Level A)
- ✅ Consistent aesthetic across sequential, diverging, and categorical palettes
- ✅ Compatible with light and dark backgrounds
- ✅ Print-friendly (maintains contrast in grayscale)

This system prioritizes **accessibility and professionalism** without sacrificing beauty or modern aesthetics.
