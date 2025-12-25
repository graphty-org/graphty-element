[@graphty/graphty-element](../../index.md) / [config](../index.md) / StyleHelpers

# Variable: StyleHelpers

> `const` **StyleHelpers**: `object`

Defined in: [src/config/StyleHelpers.ts:99](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/config/StyleHelpers.ts#L99)

## Type Declaration

### animation

> **animation**: `object`

Animation helpers for smooth transitions
Use for: Animated visualizations and transitions

#### animation.delayedStart()

> **delayedStart**: (`progress`, `delay`, `easing`) => `number`

Delayed start - begins after a delay

##### Parameters

###### progress

`number`

Progress (0-1)

###### delay

`number`

Delay before starting (0-1)

###### easing

`EasingFunction` = `linear`

Easing function (default: linear)

##### Returns

`number`

Delayed progress value (0-1)

##### Example

```ts
// Start animation halfway through
delayedStart(0.6, 0.5, easeOut) // → ~0.2 (adjusted for delay)
```

#### animation.easeIn()

> **easeIn**: (`t`) => `number`

Ease-in (quadratic) - slow start, fast end

##### Parameters

###### t

`number`

Time value (0-1)

##### Returns

`number`

Eased value (0-1)

#### animation.easeInCubic()

> **easeInCubic**: (`t`) => `number`

Ease-in (cubic) - very slow start

##### Parameters

###### t

`number`

Time value (0-1)

##### Returns

`number`

Eased value (0-1)

#### animation.easeInOut()

> **easeInOut**: (`t`) => `number`

Ease-in-out (quadratic) - slow start and end

##### Parameters

###### t

`number`

Time value (0-1)

##### Returns

`number`

Eased value (0-1)

#### animation.easeInOutCubic()

> **easeInOutCubic**: (`t`) => `number`

Ease-in-out (cubic) - very slow start and end

##### Parameters

###### t

`number`

Time value (0-1)

##### Returns

`number`

Eased value (0-1)

#### animation.easeOut()

> **easeOut**: (`t`) => `number`

Ease-out (quadratic) - fast start, slow end

##### Parameters

###### t

`number`

Time value (0-1)

##### Returns

`number`

Eased value (0-1)

#### animation.easeOutBounce()

> **easeOutBounce**: (`t`) => `number`

Bounce ease-out - bouncing ball effect

##### Parameters

###### t

`number`

Time value (0-1)

##### Returns

`number`

Eased value (0-1)

#### animation.easeOutCubic()

> **easeOutCubic**: (`t`) => `number`

Ease-out (cubic) - very slow end

##### Parameters

###### t

`number`

Time value (0-1)

##### Returns

`number`

Eased value (0-1)

#### animation.easeOutElastic()

> **easeOutElastic**: (`t`) => `number`

Elastic ease-out - bouncy overshoot effect

##### Parameters

###### t

`number`

Time value (0-1)

##### Returns

`number`

Eased value (may exceed 1.0 temporarily)

#### animation.interpolate()

> **interpolate**: (`from`, `to`, `progress`, `easing`) => `number`

Interpolate between two numeric values with easing

##### Parameters

###### from

`number`

Start value

###### to

`number`

End value

###### progress

`number`

Progress (0-1)

###### easing

`EasingFunction` = `linear`

Easing function (default: linear)

##### Returns

`number`

Interpolated value

##### Example

```ts
// Smooth size transition from 1 to 5
interpolate(1, 5, 0.5, easeInOut) // → 3
```

#### animation.linear()

> **linear**: (`t`) => `number`

Linear easing (no acceleration)

##### Parameters

###### t

`number`

Time value (0-1)

##### Returns

`number`

Eased value (0-1)

#### animation.pulse()

> **pulse**: (`progress`, `frequency`) => `number`

Pulse animation - oscillates between 0 and 1

##### Parameters

###### progress

`number`

Progress (0-1 repeats infinitely)

###### frequency

`number` = `1`

Number of pulses per cycle (default: 1)

##### Returns

`number`

Value oscillating between 0 and 1

##### Example

```ts
// Pulsing opacity (0 → 1 → 0)
pulse(0.5) // → 1.0 (at peak)
pulse(0.0) // → 0.0 (at start)
pulse(1.0) // → 0.0 (at end)
```

#### animation.spring()

> **spring**: (`progress`, `stiffness`, `damping`) => `number`

Spring animation - damped oscillation

##### Parameters

###### progress

`number`

Progress (0-1)

###### stiffness

`number` = `170`

Spring stiffness (default: 170)

###### damping

`number` = `26`

Damping coefficient (default: 26)

##### Returns

`number`

Spring-eased value (may overshoot 1.0)

##### Example

```ts
// Bouncy entrance animation
const size = interpolate(0, 5, spring(progress, 200, 20));
```

#### animation.stagger()

> **stagger**: (`progress`, `elementIndex`, `totalElements`, `staggerDelay`, `easing`) => `number`

Stagger - offset animation for multiple elements

##### Parameters

###### progress

`number`

Global progress (0-1)

###### elementIndex

`number`

Index of this element

###### totalElements

`number`

Total number of elements

###### staggerDelay

`number` = `0.1`

Delay between elements (0-1, default: 0.1)

###### easing

`EasingFunction` = `linear`

Easing function (default: linear)

##### Returns

`number`

Per-element progress (0-1)

##### Example

```ts
// Animate 10 nodes with slight delay between each
for (let i = 0; i < 10; i++) {
  const nodeProgress = stagger(globalTime, i, 10, 0.05);
  node.size = interpolate(1, 5, nodeProgress, easeOut);
}
```

#### animation.stepped()

> **stepped**: \<`T`\>(`values`, `progress`, `easing`) => `T`

Create a stepped animation that cycles through discrete values

##### Type Parameters

###### T

`T`

##### Parameters

###### values

`T`[]

Array of values to cycle through

###### progress

`number`

Progress (0-1)

###### easing

`EasingFunction` = `linear`

Easing function (default: linear)

##### Returns

`T`

Current value from the array

##### Example

```ts
// Cycle through colors
const colors = ["#FF0000", "#00FF00", "#0000FF"];
stepped(colors, 0.33, linear) // → "#00FF00"
```

#### animation.wave()

> **wave**: (`progress`, `frequency`, `amplitude`, `offset`) => `number`

Wave animation - smooth oscillation

##### Parameters

###### progress

`number`

Progress (0-1 repeats infinitely)

###### frequency

`number` = `1`

Number of waves per cycle (default: 1)

###### amplitude

`number` = `1`

Wave amplitude 0-1 (default: 1)

###### offset

`number` = `0.5`

Vertical offset 0-1 (default: 0.5)

##### Returns

`number`

Oscillating value

##### Example

```ts
// Gentle size oscillation between 0.5 and 1.5
const size = 1 + wave(time, 1, 0.5, 0);
```

### color

> **color**: `object`

Color helpers for all visualization types

#### color.binary

> **binary**: `object`

Binary highlights for true/false states (Boolean → Color)
Use for: Path highlighting, MST edges, selected elements

#### color.binary.blueHighlight()

> **blueHighlight**: (`isHighlighted`) => `string` = `binary.blueHighlight`

Blue highlight - universal safe hue
Returns blue for highlighted state, light gray for normal
✅ Blue is universally safe ✅ 4.5:1 contrast (WCAG AAA)

##### Parameters

###### isHighlighted

`boolean`

Whether element is highlighted

##### Returns

`string`

Hex color string

##### Example

```ts
blueHighlight(true)  // "#0072B2" (Okabe-Ito blue)
blueHighlight(false) // "#CCCCCC" (light gray)
```

#### color.binary.custom()

> **custom**: (`isHighlighted`, `highlightColor`, `mutedColor`) => `string` = `binary.custom`

Custom binary colors
Allows specifying custom highlight and muted colors

##### Parameters

###### isHighlighted

`boolean`

Whether element is highlighted

###### highlightColor

`string`

Color for highlighted state (hex string)

###### mutedColor

`string`

Color for normal state (hex string)

##### Returns

`string`

Hex color string

#### color.binary.greenSuccess()

> **greenSuccess**: (`isHighlighted`) => `string` = `binary.greenSuccess`

Green success - for correct/successful states
Returns green for highlighted state, gray for normal

##### Parameters

###### isHighlighted

`boolean`

Whether element is highlighted

##### Returns

`string`

Hex color string

##### Example

```ts
greenSuccess(true)  // "#009E73" (Okabe-Ito green)
greenSuccess(false) // "#999999" (medium gray)
```

#### color.binary.orangeWarning()

> **orangeWarning**: (`isHighlighted`) => `string` = `binary.orangeWarning`

Orange warning - for attention/warning states
Returns orange for highlighted state, light gray for normal

##### Parameters

###### isHighlighted

`boolean`

Whether element is highlighted

##### Returns

`string`

Hex color string

##### Example

```ts
orangeWarning(true)  // "#E69F00" (Okabe-Ito orange)
orangeWarning(false) // "#CCCCCC" (light gray)
```

#### color.categorical

> **categorical**: `object`

Categorical palettes for discrete groups (Category ID → Color)
Use for: Communities, clusters, components, categories

#### color.categorical.carbon()

> **carbon**: (`categoryId`) => `string` = `categorical.carbon`

IBM Carbon palette - modern enterprise design
Maps category IDs to distinct colors (5 colors total)
Modern enterprise aesthetic

##### Parameters

###### categoryId

`number`

Category identifier (0-4 for unique colors)

##### Returns

`string`

Hex color string

##### Example

```ts
carbon(0) // "#6929C4" (Purple)
carbon(1) // "#1192E8" (Blue)
carbon(5) // "#6929C4" (wraps around to Purple)
```

#### color.categorical.okabeIto()

> **okabeIto**: (`categoryId`) => `string` = `categorical.okabeIto`

Okabe-Ito palette - R 4.0+ default, universally accessible
Maps category IDs to distinct colors (8 colors total)
✅ Colorblind-safe (all types) ✅ Industry standard

Cycles through colors if categoryId \> 7

##### Parameters

###### categoryId

`number`

Category identifier (0-7 for unique colors)

##### Returns

`string`

Hex color string

##### Example

```ts
okabeIto(0) // "#E69F00" (Orange)
okabeIto(1) // "#56B4E9" (Sky Blue)
okabeIto(2) // "#009E73" (Bluish Green)
okabeIto(8) // "#E69F00" (wraps around to Orange)
```

#### color.categorical.pastel()

> **pastel**: (`categoryId`) => `string` = `categorical.pastel`

Pastel palette - softer version of Okabe-Ito
Maps category IDs to distinct colors (8 colors total)
✅ Colorblind-safe (derived from Okabe-Ito)
⚠️ Lower contrast

##### Parameters

###### categoryId

`number`

Category identifier (0-7 for unique colors)

##### Returns

`string`

Hex color string

##### Example

```ts
pastel(0) // "#FFD699" (Light orange)
pastel(1) // "#A8D8F0" (Light sky blue)
pastel(8) // "#FFD699" (wraps around to Light orange)
```

#### color.categorical.tolMuted()

> **tolMuted**: (`categoryId`) => `string` = `categorical.tolMuted`

Paul Tol Muted palette - softer colors
Maps category IDs to distinct colors (9 colors total)
✅ Colorblind-safe ✅ More categories

##### Parameters

###### categoryId

`number`

Category identifier (0-8 for unique colors)

##### Returns

`string`

Hex color string

##### Example

```ts
tolMuted(0) // "#332288" (Indigo)
tolMuted(1) // "#88CCEE" (Cyan)
tolMuted(9) // "#332288" (wraps around to Indigo)
```

#### color.categorical.tolVibrant()

> **tolVibrant**: (`categoryId`) => `string` = `categorical.tolVibrant`

Paul Tol Vibrant palette - high saturation colors
Maps category IDs to distinct colors (7 colors total)
✅ Colorblind-safe ✅ High contrast

##### Parameters

###### categoryId

`number`

Category identifier (0-6 for unique colors)

##### Returns

`string`

Hex color string

##### Example

```ts
tolVibrant(0) // "#0077BB" (Blue)
tolVibrant(1) // "#33BBEE" (Cyan)
tolVibrant(7) // "#0077BB" (wraps around to Blue)
```

#### color.diverging

> **diverging**: `object`

Diverging gradients for data with meaningful midpoints
Use for: Above/below average, positive/negative, increase/decrease

#### color.diverging.blueOrange()

> **blueOrange**: (`value`, `midpoint`) => `string` = `diverging.blueOrange`

Blue-Orange diverging gradient (ColorBrewer)
Maps values to colors with blue (low) ← white (midpoint) → orange (high)
✅ Colorblind-safe ✅ High contrast

##### Parameters

###### value

`number`

Value to map (0-1)

###### midpoint

`number` = `0.5`

Midpoint value (default: 0.5)

##### Returns

`string`

Hex color string

##### Example

```ts
blueOrange(0.0) // "#2166ac" (deep blue - low)
blueOrange(0.5) // "#f7f7f7" (white - midpoint)
blueOrange(1.0) // "#b2182b" (red-orange - high)
```

#### color.diverging.purpleGreen()

> **purpleGreen**: (`value`, `midpoint`) => `string` = `diverging.purpleGreen`

Purple-Green diverging gradient (Paul Tol)
Maps values to colors with purple (low) ← white (midpoint) → green (high)
✅ Colorblind-safe ✅ No red-green

##### Parameters

###### value

`number`

Value to map (0-1)

###### midpoint

`number` = `0.5`

Midpoint value (default: 0.5)

##### Returns

`string`

Hex color string

##### Example

```ts
purpleGreen(0.0) // "#762a83" (purple - low)
purpleGreen(0.5) // "#f7f7f7" (white - midpoint)
purpleGreen(1.0) // "#1b7837" (green - high)
purpleGreen(0.3, 0.3) // "#f7f7f7" (white at custom midpoint)
```

#### color.diverging.redBlue()

> **redBlue**: (`value`, `midpoint`) => `string` = `diverging.redBlue`

Red-Blue diverging gradient
Maps values to colors with red (low) ← white (midpoint) → blue (high)
⚠️ Not colorblind-safe (red-green vision issues)
Use ONLY when temperature metaphor is critical

##### Parameters

###### value

`number`

Value to map (0-1)

###### midpoint

`number` = `0.5`

Midpoint value (default: 0.5)

##### Returns

`string`

Hex color string

##### Example

```ts
redBlue(0.0) // "#67001f" (deep red - low)
redBlue(0.5) // "#f7f7f7" (white - midpoint)
redBlue(1.0) // "#2166ac" (deep blue - high)
```

#### color.sequential

> **sequential**: `object`

Sequential gradients for continuous data (0-1 → Color)
Use for: Centrality metrics, importance scores, continuous data

#### color.sequential.blues()

> **blues**: (`value`) => `string` = `sequential.blues`

Blues gradient - single-hue progression
Maps continuous values [0,1] to colors from very light blue to deep blue
✅ Colorblind-safe (blue is universally safe) ✅ Print-friendly

##### Parameters

###### value

`number`

Continuous value (0-1)

##### Returns

`string`

Hex color string

##### Example

```ts
blues(0.0) // "#f7fbff" (very light blue)
blues(0.5) // "#6baed6" (medium blue)
blues(1.0) // "#08306b" (deep blue)
```

#### color.sequential.greens()

> **greens**: (`value`) => `string` = `sequential.greens`

Greens gradient - single-hue progression
Maps continuous values [0,1] to colors from very light green to dark green
Use for: Growth, positive metrics

##### Parameters

###### value

`number`

Continuous value (0-1)

##### Returns

`string`

Hex color string

##### Example

```ts
greens(0.0) // "#f7fcf5" (very light green)
greens(0.5) // "#74c476" (medium green)
greens(1.0) // "#00441b" (dark green)
```

#### color.sequential.inferno()

> **inferno**: (`value`) => `string` = `sequential.inferno`

Inferno gradient - dark, dramatic progression
Maps continuous values [0,1] to colors from near black to bright yellow
✅ Colorblind-safe ✅ Perceptually uniform

##### Parameters

###### value

`number`

Continuous value (0-1)

##### Returns

`string`

Hex color string

##### Example

```ts
inferno(0.0) // "#000004" (near black)
inferno(0.5) // "#a52c60" (red)
inferno(1.0) // "#f7d13d" (bright yellow)
```

#### color.sequential.oranges()

> **oranges**: (`value`) => `string` = `sequential.oranges`

Oranges gradient - single-hue progression
Maps continuous values [0,1] to colors from very light orange to dark orange
Use for: Heat, activity, energy

##### Parameters

###### value

`number`

Continuous value (0-1)

##### Returns

`string`

Hex color string

##### Example

```ts
oranges(0.0) // "#fff5eb" (very light orange)
oranges(0.5) // "#fd8d3c" (medium orange)
oranges(1.0) // "#7f2704" (dark orange)
```

#### color.sequential.plasma()

> **plasma**: (`value`) => `string` = `sequential.plasma`

Plasma gradient - warm alternative to viridis
Maps continuous values [0,1] to colors from deep blue to bright yellow
✅ Colorblind-safe ✅ Perceptually uniform

##### Parameters

###### value

`number`

Continuous value (0-1)

##### Returns

`string`

Hex color string

##### Example

```ts
plasma(0.0) // "#0d0887" (deep blue)
plasma(0.5) // "#db5c68" (pink-red)
plasma(1.0) // "#f0f921" (bright yellow)
```

#### color.sequential.viridis()

> **viridis**: (`value`) => `string` = `sequential.viridis`

Viridis gradient - matplotlib default, perceptually uniform
Maps continuous values [0,1] to colors from deep purple to bright yellow
✅ Colorblind-safe ✅ Print-friendly ✅ Perceptually uniform

##### Parameters

###### value

`number`

Continuous value (0-1)

##### Returns

`string`

Hex color string

##### Example

```ts
viridis(0.0) // "#440154" (deep purple)
viridis(0.5) // "#1f9e89" (teal)
viridis(1.0) // "#fde724" (bright yellow)
```

### combined

> **combined**: `object`

Combined multi-dimensional helpers
Use for: Rich visualizations combining color, size, and opacity

#### combined.categoryAndImportance()

> **categoryAndImportance**: (`categoryId`, `importanceValue`, `categoricalPalette`, `minSize`, `maxSize`) => `NodeStyle`

Category color + importance size
Color shows group, size shows importance within group

##### Parameters

###### categoryId

`number`

Category identifier

###### importanceValue

`number`

Importance value (0-1)

###### categoricalPalette

(`id`) => `string`

Categorical palette function (default: okabeIto)

###### minSize

`number` = `1`

Minimum size (default: 1)

###### maxSize

`number` = `5`

Maximum size (default: 5)

##### Returns

`NodeStyle`

Combined node style

##### Example

```ts
// Community 2, high importance
categoryAndImportance(2, 0.9) // { color: "#009E73", size: 4.6 }
```

#### combined.colorAndOpacity()

> **colorAndOpacity**: (`value`, `colorPalette`, `minOpacity`, `maxOpacity`) => `NodeStyle`

Combine color and opacity - useful for layered visualizations
Higher values = brighter color + more opaque

##### Parameters

###### value

`number`

Normalized value (0-1)

###### colorPalette

(`v`) => `string`

Color palette function (default: viridis)

###### minOpacity

`number` = `0.1`

Minimum opacity (default: 0.1)

###### maxOpacity

`number` = `1.0`

Maximum opacity (default: 1.0)

##### Returns

`NodeStyle`

Combined node style

##### Example

```ts
colorAndOpacity(0.8) // { color: "#b5de2b", opacity: 0.82 }
```

#### combined.colorAndSize()

> **colorAndSize**: (`value`, `colorPalette`, `minSize`, `maxSize`) => `NodeStyle`

Combine color and size based on the same metric
Higher values = brighter color + larger size

##### Parameters

###### value

`number`

Normalized value (0-1)

###### colorPalette

(`v`) => `string`

Color palette function (default: viridis)

###### minSize

`number` = `1`

Minimum size (default: 1)

###### maxSize

`number` = `5`

Maximum size (default: 5)

##### Returns

`NodeStyle`

Combined node style

##### Example

```ts
// PageRank: high rank = bright yellow + large
colorAndSize(0.9) // { color: "#fde724", size: 4.6 }
colorAndSize(0.1) // { color: "#482677", size: 1.4 }
```

#### combined.divergingWithSize()

> **divergingWithSize**: (`value`, `midpoint`, `divergingPalette`, `minSize`, `maxSize`) => `NodeStyle`

Diverging color + size for above/below average with emphasis

##### Parameters

###### value

`number`

Normalized value (0-1)

###### midpoint

`number` = `0.5`

Midpoint value (default: 0.5)

###### divergingPalette

(`v`, `mid?`) => `string`

Diverging palette function (default: purpleGreen)

###### minSize

`number` = `1`

Minimum size (default: 1)

###### maxSize

`number` = `5`

Maximum size (default: 5)

##### Returns

`NodeStyle`

Combined node style

##### Example

```ts
// Above average (green) and large
divergingWithSize(0.8) // { color: "#91cf60", size: 4.2 }
// Below average (purple) and small
divergingWithSize(0.2) // { color: "#9970ab", size: 1.8 }
```

#### combined.edgeFlow()

> **edgeFlow**: (`value`, `colorPalette`, `minWidth`, `maxWidth`) => `EdgeStyle`

Edge color and width for flow visualization

##### Parameters

###### value

`number`

Normalized flow value (0-1)

###### colorPalette

(`v`) => `string`

Color palette function (default: viridis)

###### minWidth

`number` = `0.2`

Minimum width (default: 0.2)

###### maxWidth

`number` = `20`

Maximum width (default: 20)

##### Returns

`EdgeStyle`

Combined edge style

##### Example

```ts
// High flow: bright color + thick edge
edgeFlow(0.9) // { color: "#fde724", width: 18.04 }
```

#### combined.edgeFlowFull()

> **edgeFlowFull**: (`value`, `colorPalette`, `minWidth`, `maxWidth`, `minOpacity`, `maxOpacity`) => `EdgeStyle`

Edge color, width, and opacity for complex flow networks

##### Parameters

###### value

`number`

Normalized flow value (0-1)

###### colorPalette

(`v`) => `string`

Color palette function (default: viridis)

###### minWidth

`number` = `0.5`

Minimum width (default: 0.5)

###### maxWidth

`number` = `5`

Maximum width (default: 5)

###### minOpacity

`number` = `0.1`

Minimum opacity (default: 0.1)

###### maxOpacity

`number` = `1.0`

Maximum opacity (default: 1.0)

##### Returns

`EdgeStyle`

Combined edge style

##### Example

```ts
edgeFlowFull(0.95) // { color: "#fde724", width: 4.775, opacity: 0.955 }
```

#### combined.fullSpectrum()

> **fullSpectrum**: (`value`, `colorPalette`, `minSize`, `maxSize`, `minOpacity`, `maxOpacity`) => `NodeStyle`

All three dimensions: color, size, and opacity
Maximum expressiveness for showing importance

##### Parameters

###### value

`number`

Normalized value (0-1)

###### colorPalette

(`v`) => `string`

Color palette function (default: viridis)

###### minSize

`number` = `1`

Minimum size (default: 1)

###### maxSize

`number` = `5`

Maximum size (default: 5)

###### minOpacity

`number` = `0.2`

Minimum opacity (default: 0.2)

###### maxOpacity

`number` = `1.0`

Maximum opacity (default: 1.0)

##### Returns

`NodeStyle`

Combined node style

##### Example

```ts
// Maximum emphasis on high-importance nodes
fullSpectrum(0.95) // { color: "#fde724", size: 4.8, opacity: 0.98 }
fullSpectrum(0.05) // { color: "#440154", size: 1.2, opacity: 0.24 }
```

#### combined.sizeAndOpacity()

> **sizeAndOpacity**: (`value`, `minSize`, `maxSize`, `minOpacity`, `maxOpacity`) => `NodeStyle`

Size and opacity without color change
Useful when color represents categories but size shows importance

##### Parameters

###### value

`number`

Normalized value (0-1)

###### minSize

`number` = `1`

Minimum size (default: 1)

###### maxSize

`number` = `5`

Maximum size (default: 5)

###### minOpacity

`number` = `0.3`

Minimum opacity (default: 0.3)

###### maxOpacity

`number` = `1.0`

Maximum opacity (default: 1.0)

##### Returns

`NodeStyle`

Combined node style

##### Example

```ts
// Community nodes: same color, different importance
sizeAndOpacity(0.9) // { size: 4.6, opacity: 0.97 }
```

### edgeWidth

> **edgeWidth**: `object`

Edge width helpers for flow visualization
Use for: Weighted graphs, flow networks

#### edgeWidth.binary()

> **binary**: (`isHighlighted`, `highlightWidth`, `normalWidth`) => `number`

Binary: highlight vs normal

##### Parameters

###### isHighlighted

`boolean`

Whether the edge is highlighted

###### highlightWidth

`number` = `3`

Width for highlighted edges (default: 3)

###### normalWidth

`number` = `1`

Width for normal edges (default: 1)

##### Returns

`number`

Width based on highlight state

##### Example

```ts
binary(true)     // 3
binary(false)    // 1
binary(true, 5, 2) // 5
```

#### edgeWidth.linear()

> **linear**: (`value`, `minWidth`, `maxWidth`) => `number`

Linear mapping from [0,1] to [minWidth, maxWidth]
Default range: [0.5, 5]

##### Parameters

###### value

`number`

Normalized value (0-1)

###### minWidth

`number` = `0.5`

Minimum width (default: 0.5)

###### maxWidth

`number` = `5`

Maximum width (default: 5)

##### Returns

`number`

Scaled width

##### Example

```ts
linear(0.0)     // 0.5
linear(0.5)     // 2.75
linear(1.0)     // 5
linear(0.5, 1, 10) // 5.5
```

#### edgeWidth.log()

> **log**: (`value`, `minWidth`, `maxWidth`) => `number`

Logarithmic scaling for highly varied flows

##### Parameters

###### value

`number`

Normalized value (0-1)

###### minWidth

`number` = `0.5`

Minimum width (default: 0.5)

###### maxWidth

`number` = `5`

Maximum width (default: 5)

##### Returns

`number`

Scaled width

##### Example

```ts
log(0.5, 0.5, 5) // Logarithmic scaling
```

#### edgeWidth.stepped()

> **stepped**: (`value`, `widths`) => `number`

Stepped (discrete width levels)

##### Parameters

###### value

`number`

Normalized value (0-1)

###### widths

`number`[]

Array of width values

##### Returns

`number`

Width from the appropriate step

##### Example

```ts
stepped(0.3, [0.5, 1, 2, 3, 5]) // 1
```

### label

> **label**: `object`

Label helpers for formatting metric values
Use for: Displaying algorithm results as text

#### label.communityLabel()

> **communityLabel**: (`id`) => `string`

Format community label

##### Parameters

###### id

`number`

Community ID

##### Returns

`string`

Formatted community label

##### Example

```ts
communityLabel(3) // "Community 3"
```

#### label.compact()

> **compact**: (`value`) => `string`

Format number in compact notation (K, M, B suffixes)

##### Parameters

###### value

`number`

Numeric value

##### Returns

`string`

Formatted string with suffix

##### Example

```ts
compact(1000)      // "1.0K"
compact(1500000)   // "1.5M"
compact(2500000000)// "2.5B"
```

#### label.conditional()

> **conditional**: (`condition`, `trueText`, `falseText`) => `string`

Conditional text

##### Parameters

###### condition

`boolean`

Boolean condition

###### trueText

`string`

Text to return if condition is true

###### falseText

`string`

Text to return if condition is false

##### Returns

`string`

Selected text based on condition

##### Example

```ts
conditional(true, "Yes", "No") // "Yes"
conditional(false, "Yes", "No") // "No"
```

#### label.fixed()

> **fixed**: (`value`, `decimals`) => `string`

Format number with fixed decimal places
Default: 2 decimals

##### Parameters

###### value

`number`

Numeric value

###### decimals

`number` = `2`

Number of decimal places (default: 2)

##### Returns

`string`

Formatted string

##### Example

```ts
fixed(0.123456)     // "0.12"
fixed(0.123456, 3)  // "0.123"
fixed(123.456, 1)   // "123.5"
```

#### label.ifAbove()

> **ifAbove**: (`value`, `threshold`, `formatter`) => `string` \| `null`

Only show if value above threshold

##### Parameters

###### value

`number`

Value to check

###### threshold

`number`

Threshold value

###### formatter

(`v`) => `string`

Function to format the value

##### Returns

`string` \| `null`

Formatted string or null

##### Example

```ts
ifAbove(0.8, 0.5, (v) => v.toFixed(2)) // "0.80"
ifAbove(0.3, 0.5, (v) => v.toFixed(2)) // null
```

#### label.integer()

> **integer**: (`value`) => `string`

Format number as integer (rounds to nearest integer)

##### Parameters

###### value

`number`

Numeric value

##### Returns

`string`

Formatted integer string

##### Example

```ts
integer(0.75)   // "1"
integer(123.4)  // "123"
integer(123.6)  // "124"
```

#### label.levelLabel()

> **levelLabel**: (`level`) => `string`

Format level label

##### Parameters

###### level

`number`

Level value

##### Returns

`string`

Formatted level label

##### Example

```ts
levelLabel(2) // "Level 2"
```

#### label.percentage()

> **percentage**: (`value`, `decimals`) => `string`

Format number as percentage
Default: 0 decimals

##### Parameters

###### value

`number`

Numeric value (0-1 typical)

###### decimals

`number` = `0`

Number of decimal places (default: 0)

##### Returns

`string`

Formatted percentage string

##### Example

```ts
percentage(0.75)      // "75%"
percentage(0.756, 1)  // "75.6%"
percentage(0.756, 2)  // "75.60%"
```

#### label.rankLabel()

> **rankLabel**: (`rank`) => `string`

Format rank label

##### Parameters

###### rank

`number`

Rank value

##### Returns

`string`

Formatted rank label

##### Example

```ts
rankLabel(5) // "Rank: 5"
```

#### label.scientific()

> **scientific**: (`value`, `decimals`) => `string`

Format number in scientific notation
Default: 2 decimals

##### Parameters

###### value

`number`

Numeric value

###### decimals

`number` = `2`

Number of decimal places (default: 2)

##### Returns

`string`

Formatted string

##### Example

```ts
scientific(123456)     // "1.23e+5"
scientific(0.000123)   // "1.23e-4"
```

#### label.scoreLabel()

> **scoreLabel**: (`score`, `label`) => `string`

Format score label

##### Parameters

###### score

`number`

Score value

###### label

`string`

Label text

##### Returns

`string`

Formatted score label

##### Example

```ts
scoreLabel(0.85, "PageRank") // "PageRank: 0.85"
```

#### label.substitute()

> **substitute**: (`template`, `values`) => `string`

Template substitution - replaces \{key\} placeholders with values

##### Parameters

###### template

`string`

Template string with \{key\} placeholders

###### values

`Record`\<`string`, `unknown`\>

Object with key-value pairs

##### Returns

`string`

String with substituted values

##### Example

```ts
substitute("Score: {score}", {score: 0.85}) // "Score: 0.85"
```

#### label.topN()

> **topN**: (`value`, `rank`, `n`, `formatter`) => `string` \| `null`

Only show for top N values

##### Parameters

###### value

`number`

Value to display

###### rank

`number`

Rank (1-based)

###### n

`number`

Number of top items

###### formatter

(`v`) => `string`

Function to format the value

##### Returns

`string` \| `null`

Formatted string or null

##### Example

```ts
topN(0.9, 3, 5, (v) => v.toFixed(2)) // "0.90"
topN(0.5, 6, 5, (v) => v.toFixed(2)) // null
```

### opacity

> **opacity**: `object`

Opacity helpers for de-emphasizing elements
Use for: Layered effects, importance filtering

#### opacity.binary()

> **binary**: (`isVisible`, `visibleOpacity`, `hiddenOpacity`) => `number`

Binary opacity: visible or invisible
Default: 1.0 visible, 0.0 hidden

##### Parameters

###### isVisible

`boolean`

Whether element is visible

###### visibleOpacity

`number` = `1.0`

Opacity when visible (default: 1.0)

###### hiddenOpacity

`number` = `0.0`

Opacity when hidden (default: 0.0)

##### Returns

`number`

Opacity value (0-1)

##### Example

```ts
binary(true)   // 1.0
binary(false)  // 0.0
```

#### opacity.inverse()

> **inverse**: (`value`, `minOpacity`, `maxOpacity`) => `number`

Inverse linear fade: high values = transparent (for backgrounds)
Default range: [0.1, 1.0] (same as linear, but inverted)

##### Parameters

###### value

`number`

Normalized value (0-1)

###### minOpacity

`number` = `0.1`

Minimum opacity (default: 0.1)

###### maxOpacity

`number` = `1.0`

Maximum opacity (default: 1.0)

##### Returns

`number`

Opacity value (0-1)

##### Example

```ts
inverse(0.0)   // 1.0 (fully opaque for low values)
inverse(0.5)   // 0.55
inverse(1.0)   // 0.1 (nearly transparent for high values)
```

#### opacity.linear()

> **linear**: (`value`, `minOpacity`, `maxOpacity`) => `number`

Linear fade from [0,1] to [minOpacity, maxOpacity]
Default range: [0.1, 1.0]

##### Parameters

###### value

`number`

Normalized value (0-1)

###### minOpacity

`number` = `0.1`

Minimum opacity (default: 0.1)

###### maxOpacity

`number` = `1.0`

Maximum opacity (default: 1.0)

##### Returns

`number`

Opacity value (0-1)

##### Example

```ts
linear(0.0)   // 0.1
linear(0.5)   // 0.55
linear(1.0)   // 1.0
```

#### opacity.threshold()

> **threshold**: (`value`, `thresholdValue`, `belowOpacity`, `aboveOpacity`) => `number`

Threshold-based opacity: opaque above threshold, faded below
Default: 0.5 threshold, 0.3 below, 1.0 above

##### Parameters

###### value

`number`

Normalized value (0-1)

###### thresholdValue

`number` = `0.5`

Threshold to compare against (default: 0.5)

###### belowOpacity

`number` = `0.3`

Opacity for values below threshold (default: 0.3)

###### aboveOpacity

`number` = `1.0`

Opacity for values at or above threshold (default: 1.0)

##### Returns

`number`

Opacity value (0-1)

##### Example

```ts
threshold(0.3)              // 0.3 (below 0.5)
threshold(0.6)              // 1.0 (above 0.5)
threshold(0.2, 0.3, 0.2, 1) // 0.2 (below 0.3)
```

### size

> **size**: `object`

Size helpers for scaling nodes/edges
Use for: Importance, centrality, flow visualization

#### size.bins()

> **bins**: (`value`, `sizes`) => `number`

Maps continuous [0,1] to discrete size bins

##### Parameters

###### value

`number`

Normalized value (0-1)

###### sizes

`number`[]

Array of size values

##### Returns

`number`

Size from the appropriate bin

##### Example

```ts
bins(0.3, [1, 2, 3, 4, 5]) // → 2
```

#### size.cubic()

> **cubic**: (`value`, `minSize`, `maxSize`) => `number`

Cubic scaling (exponent = 3)

##### Parameters

###### value

`number`

Normalized value (0-1)

###### minSize

`number` = `1`

Minimum size (default: 1)

###### maxSize

`number` = `5`

Maximum size (default: 5)

##### Returns

`number`

Scaled size

##### Example

```ts
cubic(0.5, 1, 5) // → 1.5
```

#### size.exp()

> **exp**: (`value`, `minSize`, `maxSize`, `exponent`) => `number`

Exponential scaling [0,1] → [minSize, maxSize]
Makes high values dramatically larger

##### Parameters

###### value

`number`

Normalized value (0-1)

###### minSize

`number` = `1`

Minimum size (default: 1)

###### maxSize

`number` = `5`

Maximum size (default: 5)

###### exponent

`number` = `2`

Exponent value (default: 2)

##### Returns

`number`

Scaled size

##### Example

```ts
exp(0.5, 1, 5, 2) // Exponential with power 2
```

#### size.fiveTiers()

> **fiveTiers**: (`value`) => `number`

Five tiers preset (5 bins)

##### Parameters

###### value

`number`

Normalized value (0-1)

##### Returns

`number`

Size: 1, 2, 3, 4, or 5

##### Example

```ts
fiveTiers(0.3) // → 2
```

#### size.linear()

> **linear**: (`value`, `minSize`, `maxSize`) => `number`

Linear mapping from [0,1] to [minSize, maxSize]
Default range: [1, 5]

##### Parameters

###### value

`number`

Normalized value (0-1)

###### minSize

`number` = `1`

Minimum size (default: 1)

###### maxSize

`number` = `5`

Maximum size (default: 5)

##### Returns

`number`

Scaled size

##### Example

```ts
linear(0.0)     // 1
linear(0.5)     // 3
linear(1.0)     // 5
linear(0.5, 2, 10) // 6
```

#### size.linearClipped()

> **linearClipped**: (`value`, `minSize`, `maxSize`, `clipMin`, `clipMax`) => `number`

Linear mapping with value clipping
Prevents extreme sizes by clipping input value before scaling

##### Parameters

###### value

`number`

Normalized value (0-1)

###### minSize

`number` = `1`

Minimum size (default: 1)

###### maxSize

`number` = `5`

Maximum size (default: 5)

###### clipMin

`number` = `0`

Minimum value to clip to (default: 0)

###### clipMax

`number` = `1`

Maximum value to clip to (default: 1)

##### Returns

`number`

Scaled size

##### Example

```ts
linearClipped(0.95, 1, 5, 0.1, 0.9) // Clips 0.95 to 0.9, then scales
```

#### size.log()

> **log**: (`value`, `minSize`, `maxSize`, `base`) => `number`

Logarithmic scaling for power-law distributions
Prevents extreme size differences

##### Parameters

###### value

`number`

Normalized value (0-1)

###### minSize

`number` = `1`

Minimum size (default: 1)

###### maxSize

`number` = `5`

Maximum size (default: 5)

###### base

`number` = `10`

Logarithm base (default: 10)

##### Returns

`number`

Scaled size

##### Example

```ts
log(0.5, 1, 5) // Logarithmic scaling
```

#### size.logSafe()

> **logSafe**: (`value`, `minSize`, `maxSize`, `epsilon`) => `number`

Logarithmic scaling with offset for zero values

##### Parameters

###### value

`number`

Normalized value (0-1)

###### minSize

`number` = `1`

Minimum size (default: 1)

###### maxSize

`number` = `5`

Maximum size (default: 5)

###### epsilon

`number` = `0.0001`

Offset for zero values (default: 0.0001)

##### Returns

`number`

Scaled size

##### Example

```ts
logSafe(0, 1, 5) // Returns minSize safely
```

#### size.smallMediumLarge()

> **smallMediumLarge**: (`value`) => `number`

Small/Medium/Large preset (3 bins)

##### Parameters

###### value

`number`

Normalized value (0-1)

##### Returns

`number`

Size: 1 (small), 2.5 (medium), or 4 (large)

##### Example

```ts
smallMediumLarge(0.2) // → 1 (small)
smallMediumLarge(0.5) // → 2.5 (medium)
smallMediumLarge(0.8) // → 4 (large)
```

#### size.square()

> **square**: (`value`, `minSize`, `maxSize`) => `number`

Square scaling (exponent = 2)

##### Parameters

###### value

`number`

Normalized value (0-1)

###### minSize

`number` = `1`

Minimum size (default: 1)

###### maxSize

`number` = `5`

Maximum size (default: 5)

##### Returns

`number`

Scaled size

##### Example

```ts
square(0.5, 1, 5) // → 2
```
