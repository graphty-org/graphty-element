# Implementation Plan for Documentation System

## Overview

This plan implements a comprehensive documentation system for graphty-element consisting of:

1. **VitePress documentation site** - User-friendly navigation with guides (viewable locally first)
2. **TypeDoc setup** - Generate API reference from source code
3. **GitHub Pages deployment** - Automated publishing alongside Storybook
4. **README updates** - Streamlined README with badges and links
5. **ESLint JSDoc setup** - Install JSDoc linting with warning level
6. **JSDoc enhancement** - Add comprehensive documentation to public APIs
7. **API parity improvements** - Add missing methods to the Web Component (parallel track)
8. **JSDoc enforcement** - Promote JSDoc rules to errors and fix all lint issues

## Phase Breakdown

### Phase 1: VitePress Documentation Site

**Objective**: Set up VitePress for the documentation site with navigation, search, and placeholder guide pages. Get a working local dev server immediately.

**Tests to Write First**:
- No unit tests - verification through build and manual review

**Implementation**:

1. `package.json` - Add VitePress:
   ```json
   "devDependencies": {
       "vitepress": "^1.x"
   }
   ```

2. `docs/.vitepress/config.ts` - VitePress configuration:
   ```typescript
   import { defineConfig } from 'vitepress';

   export default defineConfig({
       title: 'Graphty',
       description: '3D/2D Graph Visualization Web Component',
       base: '/', // Will be updated for GitHub Pages

       themeConfig: {
           nav: [
               { text: 'Guide', link: '/guide/getting-started' },
               { text: 'API', link: '/api/' },
               { text: 'Examples', link: 'https://graphty-org.github.io/graphty-element/storybook/' }
           ],

           sidebar: {
               '/guide/': [
                   {
                       text: 'Introduction',
                       items: [
                           { text: 'Getting Started', link: '/guide/getting-started' },
                           { text: 'Installation', link: '/guide/installation' },
                       ]
                   },
                   {
                       text: 'Usage',
                       items: [
                           { text: 'Web Component API', link: '/guide/web-component' },
                           { text: 'JavaScript API', link: '/guide/javascript-api' },
                           { text: 'Styling', link: '/guide/styling' },
                           { text: 'Style Helpers & Palettes', link: '/guide/style-helpers' },
                           { text: 'Layouts', link: '/guide/layouts' },
                           { text: 'Algorithms', link: '/guide/algorithms' },
                           { text: 'Data Sources', link: '/guide/data-sources' },
                           { text: 'Events', link: '/guide/events' },
                           { text: 'Camera', link: '/guide/camera' },
                           { text: 'Screenshots & Video', link: '/guide/screenshots' },
                           { text: 'VR/AR', link: '/guide/vr-ar' },
                       ]
                   },
                   {
                       text: 'Extending',
                       items: [
                           { text: 'Custom Layouts', link: '/guide/extending/custom-layouts' },
                           { text: 'Custom Algorithms', link: '/guide/extending/custom-algorithms' },
                           { text: 'Custom Data Sources', link: '/guide/extending/custom-data-sources' },
                       ]
                   }
               ],
               '/api/': [
                   { text: 'Overview', link: '/api/' },
               ]
           },

           socialLinks: [
               { icon: 'github', link: 'https://github.com/graphty-org/graphty-element' }
           ],

           search: {
               provider: 'local'
           },

           editLink: {
               pattern: 'https://github.com/graphty-org/graphty-element/edit/master/docs/:path'
           }
       }
   });
   ```

3. Create guide pages with comprehensive content (see **Guide Page Content Specifications** below)

4. `package.json` - Add scripts:
   ```json
   "scripts": {
       "docs:dev": "vitepress dev docs",
       "docs:build": "vitepress build docs",
       "docs:preview": "vitepress preview docs"
   }
   ```

5. `.gitignore` - Add:
   ```
   docs/.vitepress/cache
   docs/.vitepress/dist
   ```

**Dependencies**:
- External: `vitepress`
- Internal: None

**Verification**:
1. Run: `npm install && npm run docs:dev`
2. Expected: Development server starts, site accessible at localhost:5173
3. Navigate through all sidebar links - all should render (even if placeholder)
4. Search for "Graph" - search should work
5. Run: `npm run docs:build`
6. Expected: Static site built to `docs/.vitepress/dist/`

---

#### Guide Page Content Specifications

Each guide page should include: overview, when to use, code examples, and links to interactive Storybook examples.

##### `docs/index.md` - Landing Page

**Purpose**: First impression, quick orientation, feature highlights

**Content**:
- Hero section with tagline: "3D/2D Graph Visualization Web Component"
- Feature highlights (3D rendering, multiple layouts, extensible, VR/AR support)
- Quick start code snippet (minimal working example)
- Links to Getting Started, API Reference, and Storybook
- Installation one-liner: `npm install @graphty/graphty-element`

**Storybook Links**: [Basic Graph](storybook/?path=/story/graphty--default)

---

##### `docs/guide/getting-started.md`

**Purpose**: Get users from zero to a working graph in 5 minutes

**Content**:
1. **What is Graphty?** - Brief description of the library's purpose
2. **Quick Start** - Minimal HTML example with inline data
   ```html
   <script type="module">
     import '@graphty/graphty-element';
   </script>
   <graphty-element
     node-data='[{"id": "a"}, {"id": "b"}]'
     edge-data='[{"source": "a", "target": "b"}]'>
   </graphty-element>
   ```
3. **Your First Graph** - Step-by-step walkthrough
4. **What's Next** - Links to styling, layouts, algorithms guides

**Storybook Links**: [Default Graph](storybook/?path=/story/graphty--default), [Data Loading](storybook/?path=/story/data--default)

---

##### `docs/guide/installation.md`

**Purpose**: Comprehensive installation options for different environments

**Content**:
1. **npm/yarn Installation**
   ```bash
   npm install @graphty/graphty-element
   ```
2. **CDN Usage** - Using unpkg or jsdelivr
3. **Framework Integration**
   - React: Using web components in React
   - Vue: Using web components in Vue
   - Angular: CUSTOM_ELEMENTS_SCHEMA setup
4. **Peer Dependencies** - Babylon.js, Lit (if applicable)
5. **TypeScript Setup** - Type imports and configuration
6. **Bundle Size Considerations** - Tree shaking, externals

---

##### `docs/guide/web-component.md`

**Purpose**: Complete reference for using `<graphty-element>` declaratively

**Content**:
1. **Overview** - When to use the Web Component vs JavaScript API
2. **Properties/Attributes**:
   | Property | Attribute | Type | Description |
   |----------|-----------|------|-------------|
   | `nodeData` | `node-data` | `Array` | Node data array |
   | `edgeData` | `edge-data` | `Array` | Edge data array |
   | `layout` | `layout` | `string` | Layout algorithm |
   | `styleTemplate` | `style-template` | `string` | Style template name |
   | `viewMode` | `view-mode` | `string` | 2d, 3d, vr, ar |
   | ... | ... | ... | ... |
3. **Attribute vs Property** - When to use each
4. **Data Binding Examples**:
   - Static JSON in attributes
   - Dynamic property binding
   - Reactive frameworks integration
5. **Accessing the Graph Instance** - `element.graph` property

**Storybook Links**: [Graphty Element](storybook/?path=/story/graphty--default), [View Modes](storybook/?path=/story/viewmode--default)

---

##### `docs/guide/javascript-api.md`

**Purpose**: Complete reference for programmatic control via Graph class

**Content**:
1. **Overview** - When to use the JavaScript API
2. **Getting the Graph Instance**:
   ```typescript
   const element = document.querySelector('graphty-element');
   const graph = element.graph; // Direct access to Graph instance
   ```
3. **Core Methods**:
   - **Data Management**: `addNodes()`, `addEdges()`, `removeNodes()`, `updateNodes()`
   - **Selection**: `selectNode()`, `deselectNode()`, `getSelectedNode()`
   - **Layout**: `setLayout()`, `waitForSettled()`
   - **Algorithms**: `runAlgorithm()`, `applySuggestedStyles()`
   - **Camera**: `zoomToFit()`, `getCameraState()`, `setCameraState()`
4. **Async Operations** - Understanding the operation queue
5. **Batch Operations** - Using `batchOperations()` for efficiency
6. **Event Handling** - Using `on()` and `addListener()`

**Code Examples**:
```typescript
// Load data and run algorithm
await graph.addNodes(nodes);
await graph.addEdges(edges);
await graph.waitForSettled();
await graph.runAlgorithm('graphty', 'degree');
graph.applySuggestedStyles('graphty:degree');
graph.zoomToFit();
```

**Storybook Links**: [Data Loading](storybook/?path=/story/data--default), [Selection](storybook/?path=/story/selection--default)

---

##### `docs/guide/styling.md`

**Purpose**: Comprehensive guide to styling nodes, edges, and labels

**Content**:
1. **Overview** - CSS-like layer-based styling system
2. **Style Templates** - Using built-in templates
   ```html
   <graphty-element style-template="dark"></graphty-element>
   ```
3. **Style Layers** - Understanding layer precedence
4. **Selectors** - JMESPath-based selectors for targeting elements
   ```typescript
   {
     selector: "[?category == 'important']",
     styles: { node: { color: "#ff0000", size: 2.0 } }
   }
   ```
5. **Node Styles**:
   - `color`, `size`, `shape`, `opacity`
   - `texture`, `label`
   - Available shapes: sphere, box, cylinder, cone, torus, etc.
6. **Edge Styles**:
   - `line.type`: solid, dash, dot, zigzag, sinewave, etc.
   - `line.width`, `line.color`, `line.opacity`
   - `arrowHead.type`: normal, vee, diamond, sphere, etc.
   - `arrowTail.type`: same options as arrowHead
   - `bezier`: curved edges
7. **Label Styles**:
   - `text`, `fontSize`, `fontColor`
   - `position`, `offset`
8. **Dynamic Styling** - Responding to algorithm results
9. **StyleManager API** - Programmatic style manipulation

**Storybook Links**:
- [Node Styles](storybook/?path=/story/nodestyles--default)
- [Edge Styles](storybook/?path=/story/edgestyles--default)
- [Label Styles](storybook/?path=/story/labelstyles--default)
- [All Node Shapes](storybook/?path=/story/allnodeshapes--default)
- [Bezier Edges](storybook/?path=/story/bezieredges--default)
- [Bidirectional Arrows](storybook/?path=/story/bidirectionalarrows--default)
- [Layered Styles](storybook/?path=/story/layeredstyles--default)

---

##### `docs/guide/style-helpers.md`

**Purpose**: Comprehensive guide to using Style Helpers for data-driven visualization with colorblind-safe palettes

**Content**:
1. **Overview** - What Style Helpers are and why to use them
   - Transform algorithm results into visual properties
   - Research-backed, colorblind-safe color palettes
   - Consistent, professional aesthetic

2. **Color Palettes**:

   **Sequential Palettes** (continuous data: 0 → 1):
   | Palette | Colors | Use Case | Colorblind Safe |
   |---------|--------|----------|-----------------|
   | `viridis` (default) | Purple → Teal → Yellow | General continuous data | ✅ Yes |
   | `plasma` | Purple → Pink → Yellow | High contrast needed | ✅ Yes |
   | `inferno` | Black → Red → Yellow | Emphasis on extremes | ✅ Yes |
   | `blues` | Light → Dark Blue | Professional, subtle | ✅ Yes (single-hue) |
   | `greens` | Light → Dark Green | Growth, positive metrics | ✅ Yes (single-hue) |
   | `oranges` | Light → Dark Orange | Activity, heat | ✅ Yes (single-hue) |

   **Categorical Palettes** (discrete groups):
   | Palette | Colors | Use Case | Colorblind Safe |
   |---------|--------|----------|-----------------|
   | `okabeIto` (default) | 8 colors | Universal safe choice | ✅ Yes (R 4.0 default) |
   | `paulTolVibrant` | 7 colors | High saturation | ✅ Yes |
   | `paulTolMuted` | 9 colors | Softer aesthetic | ✅ Yes |
   | `ibmCarbon` | 5 colors | Enterprise design | ✅ Yes |
   | `pastel` | 8 colors | Lighter appearance | ✅ Yes |

   **Diverging Palettes** (midpoint data: -1 ↔ 0 ↔ +1):
   | Palette | Colors | Use Case | Colorblind Safe |
   |---------|--------|----------|-----------------|
   | `purpleGreen` (default) | Purple ← White → Green | General diverging | ✅ Yes (Paul Tol) |
   | `blueOrange` | Blue ← White → Orange | Alternative | ✅ Yes (ColorBrewer) |
   | `redBlue` | Red ← White → Blue | Temperature only | ⚠️ No (avoid if possible) |

   **Binary Palettes** (boolean: true/false):
   | Palette | Colors | Use Case | Colorblind Safe |
   |---------|--------|----------|-----------------|
   | `blueHighlight` (default) | Blue vs Gray | Selection, highlight | ✅ Yes |
   | `greenSuccess` | Green vs Gray | Success states | ✅ Yes |
   | `orangeWarning` | Orange vs Gray | Warning states | ✅ Yes |

3. **Why These Colors?**
   - **Okabe-Ito**: Designed by Masataka Okabe and Kei Ito (2008) specifically for colorblind accessibility. Adopted as R 4.0 default. Each color distinguishable under all forms of color vision deficiency.
   - **Paul Tol**: Mathematically optimized palettes by Paul Tol (2021) using color science principles. Tested for Deuteranopia, Protanopia, and Tritanopia.
   - **Viridis/Plasma/Inferno**: Developed for matplotlib by Stéfan van der Walt and Nathaniel Smith. Perceptually uniform (equal steps look equal) and colorblind-safe.
   - **ColorBrewer**: Cynthia Brewer's research-backed palettes widely used in cartography and data visualization.

4. **Using Color Helpers**:
   ```typescript
   import { StyleHelpers } from '@graphty/graphty-element';

   // Sequential: map 0-1 value to color
   const color = StyleHelpers.color.sequential.viridis(0.7);

   // Categorical: map category index to color
   const catColor = StyleHelpers.color.categorical.okabeIto(2);

   // Diverging: map -1 to +1 value to color
   const divColor = StyleHelpers.color.diverging.purpleGreen(0.5);

   // Binary: map boolean to color
   const binColor = StyleHelpers.color.binary.blueHighlight(true);
   ```

5. **Size Helpers**:
   ```typescript
   // Linear scaling
   const size = StyleHelpers.size.linear(value, { min: 0.5, max: 3.0 });

   // Logarithmic (for power-law data)
   const logSize = StyleHelpers.size.log(value, { min: 0.5, max: 3.0 });

   // Discrete bins
   const binSize = StyleHelpers.size.bins(value, [0.5, 1.0, 1.5, 2.0, 3.0]);
   ```

6. **Opacity Helpers**:
   ```typescript
   // Linear opacity
   const opacity = StyleHelpers.opacity.linear(value);

   // Threshold (below = 0, above = 1)
   const threshOpacity = StyleHelpers.opacity.threshold(value, 0.5);
   ```

7. **Label Helpers**:
   ```typescript
   // Format as percentage
   const label = StyleHelpers.label.percentage(0.847); // "84.7%"

   // Format with rank
   const rankLabel = StyleHelpers.label.rankLabel(node, 'degree'); // "#3"

   // Top N only
   const topLabel = StyleHelpers.label.topN(node, 'pagerank', 10);
   ```

8. **Edge Width Helpers**:
   ```typescript
   const width = StyleHelpers.edgeWidth.linear(weight, { min: 0.5, max: 3.0 });
   ```

9. **Combined Helpers** (multi-dimensional):
   ```typescript
   // Color AND size from same value
   const { color, size } = StyleHelpers.combined.colorAndSize(value);

   // Full spectrum: color, size, opacity, label
   const styles = StyleHelpers.combined.fullSpectrum(value);
   ```

10. **Animation Helpers**:
    ```typescript
    // Easing functions
    const eased = StyleHelpers.animation.easeOutCubic(t);

    // Pulse effect
    const pulse = StyleHelpers.animation.pulse(t, { frequency: 2 });
    ```

11. **Accessibility Features**:
    ```typescript
    import { colorblindSimulation } from '@graphty/graphty-element';

    // Simulate how colors appear to colorblind users
    const deuteranopia = colorblindSimulation.simulateDeuteranopia('#ff0000');
    const protanopia = colorblindSimulation.simulateProtanopia('#ff0000');

    // Check if a palette is safe
    const isSafe = colorblindSimulation.isPaletteSafe(myColors);
    ```

12. **Using with Algorithms**:
    ```typescript
    // Run algorithm and apply style helper
    await graph.runAlgorithm('graphty', 'degree');

    styleManager.addLayer({
      selector: '*',
      styles: {
        node: {
          color: (node) => StyleHelpers.color.sequential.viridis(
            node.algorithmResults['graphty:degree'] / maxDegree
          ),
          size: (node) => StyleHelpers.size.log(
            node.algorithmResults['graphty:degree'],
            { min: 0.5, max: 2.5 }
          )
        }
      }
    });
    ```

13. **Colorblind Safety Guidelines**:
    - **DO**: Use default palettes (all tested for accessibility)
    - **DO**: Use Okabe-Ito for categorical data (8 distinct colors)
    - **DO**: Use single-hue palettes (blues, greens) for sequential data
    - **DON'T**: Use red-green to indicate opposite meanings
    - **DON'T**: Use more than 7-9 categorical colors
    - **TEST**: Use the colorblind simulation tools to verify

**Storybook Links**:
- [Palette Picker](storybook/?path=/story/algorithms-palettepicker--default)
- [Centrality with Colors](storybook/?path=/story/algorithms-centrality--degree)
- [Community Detection](storybook/?path=/story/algorithms-community--louvain)

**Design References**:
- See `design/color-palettes-specification.md` for complete scientific rationale
- See `design/style-helpers.md` for implementation details

---

##### `docs/guide/layouts.md`

**Purpose**: Guide to available layout algorithms and configuration

**Content**:
1. **Overview** - What layouts do and when to use each
2. **Available Layouts**:
   | Layout | Type | Best For | Dimensions |
   |--------|------|----------|------------|
   | `ngraph` | Force-directed | General graphs | 2D/3D |
   | `d3-force` | Force-directed | Web-standard | 2D |
   | `circular` | Geometric | Cycles, small graphs | 2D/3D |
   | `grid` | Geometric | Regular structures | 2D/3D |
   | `hierarchical` | Layered | Trees, DAGs | 2D/3D |
   | `random` | Random | Testing, initial state | 2D/3D |
   | `fixed` | Manual | Pre-computed positions | 2D/3D |
3. **Layout Configuration**:
   ```typescript
   graph.setLayout('ngraph', {
     springLength: 100,
     springCoefficient: 0.0008,
     gravity: -1.2,
     dimensions: 3
   });
   ```
4. **Layout Transitions** - Animating between layouts
5. **Waiting for Settled** - Using `waitForSettled()`
6. **Custom Layouts** - Link to extending guide

**Storybook Links**:
- [3D Layouts](storybook/?path=/story/layout--default)
- [2D Layouts](storybook/?path=/story/layout2d--default)

---

##### `docs/guide/algorithms.md`

**Purpose**: Guide to running graph algorithms and using results

**Content**:
1. **Overview** - What algorithms are available and what they compute
2. **Running Algorithms**:
   ```typescript
   await graph.runAlgorithm('graphty', 'degree');
   ```
3. **Algorithm Categories**:
   - **Centrality**: degree, betweenness, closeness, pagerank, eigenvector
   - **Community**: louvain, label-propagation, modularity
   - **Components**: connected-components, strongly-connected
   - **Traversal**: bfs, dfs
   - **Shortest Path**: dijkstra, bellman-ford, a-star
   - **Spanning Tree**: prim, kruskal
   - **Flow**: max-flow, min-cut
4. **Accessing Results**:
   ```typescript
   const node = graph.getNode('nodeId');
   const degree = node.algorithmResults['graphty:degree'];
   ```
5. **Suggested Styles** - Visualizing algorithm results:
   ```typescript
   graph.applySuggestedStyles('graphty:degree');
   ```
6. **Style Selectors with Algorithm Results**:
   ```typescript
   {
     selector: "[?algorithmResults.'graphty:degree' > `10`]",
     styles: { node: { color: "#ff0000" } }
   }
   ```
7. **Custom Algorithms** - Link to extending guide

**Storybook Links**:
- [Centrality Algorithms](storybook/?path=/story/algorithms-centrality--degree)
- [Community Detection](storybook/?path=/story/algorithms-community--louvain)
- [Components](storybook/?path=/story/algorithms-component--connected)
- [Shortest Path](storybook/?path=/story/algorithms-shortestpath--dijkstra)
- [Traversal](storybook/?path=/story/algorithms-traversal--bfs)
- [Spanning Tree](storybook/?path=/story/algorithms-spanningtree--prim)
- [Combined Algorithms](storybook/?path=/story/algorithms-combined--default)

---

##### `docs/guide/data-sources.md`

**Purpose**: Guide to loading data from various sources and formats

**Content**:
1. **Overview** - Data source architecture and supported formats
2. **Inline Data** - Using nodeData/edgeData properties
3. **Loading from URL**:
   ```typescript
   await graph.loadFromUrl('https://example.com/graph.json');
   ```
4. **Loading from File** - File upload integration:
   ```typescript
   const file = input.files[0];
   await graph.loadFromFile(file);
   ```
5. **Supported Formats**:
   | Format | Extension | Description |
   |--------|-----------|-------------|
   | JSON | .json | Native format with nodes/edges arrays |
   | GraphML | .graphml | XML-based graph format |
   | GEXF | .gexf | Gephi exchange format |
   | GML | .gml | Graph Modeling Language |
   | DOT | .dot | Graphviz format |
   | CSV | .csv | Comma-separated adjacency |
   | Pajek | .net | Pajek network format |
6. **Custom ID Paths**:
   ```typescript
   graph.loadFromUrl(url, {
     nodeIdPath: 'nodeId',
     edgeSrcIdPath: 'from',
     edgeDstIdPath: 'to'
   });
   ```
7. **Incremental Loading** - Adding data without replacing
8. **Custom Data Sources** - Link to extending guide

**Storybook Links**: [Data Loading](storybook/?path=/story/data--default)

---

##### `docs/guide/events.md`

**Purpose**: Guide to subscribing to graph events

**Content**:
1. **Overview** - Event-driven architecture
2. **Available Events**:
   | Event | Trigger | Event Data |
   |-------|---------|------------|
   | `graph-settled` | Layout finished | `{settled: boolean}` |
   | `data-loaded` | Initial data loaded | `{nodeCount, edgeCount}` |
   | `data-added` | Incremental data added | `{nodes, edges}` |
   | `selection-changed` | Node selected/deselected | `{node, previousNode}` |
   | `camera-state-changed` | Camera moved | `{state}` |
   | `style-changed` | Styles updated | `{layers}` |
   | `node-click` | User clicked node | `{node, event}` |
   | `node-hover` | Mouse entered node | `{node}` |
   | `edge-click` | User clicked edge | `{edge, event}` |
   | `error` | Error occurred | `{error, context}` |
3. **JavaScript API** - Using `on()`:
   ```typescript
   graph.on('graph-settled', () => {
     console.log('Layout complete!');
     graph.zoomToFit();
   });

   graph.on('node-click', ({node}) => {
     console.log('Clicked:', node.id);
     graph.selectNode(node.id);
   });
   ```
4. **DOM Events** - Using `addEventListener`:
   ```javascript
   element.addEventListener('graph-settled', (e) => {
     console.log('Settled!', e.detail);
   });
   ```
5. **Event Timing** - Understanding async operations
6. **Removing Listeners** - Cleanup patterns

**Storybook Links**: [Selection Events](storybook/?path=/story/selection--default)

---

##### `docs/guide/camera.md`

**Purpose**: Guide to camera control and animation

**Content**:
1. **Overview** - 3D camera concepts (position, target, up vector)
2. **Camera State**:
   ```typescript
   const state = graph.getCameraState();
   // { position: {x, y, z}, target: {x, y, z}, up: {x, y, z} }
   ```
3. **Setting Camera**:
   ```typescript
   graph.setCameraPosition({x: 0, y: 0, z: 100});
   graph.setCameraTarget({x: 0, y: 0, z: 0});
   graph.zoomToFit();
   ```
4. **Camera Presets** - Saving and loading views:
   ```typescript
   graph.saveCameraPreset('overview');
   graph.loadCameraPreset('overview', {animate: true});
   ```
5. **Camera Animation**:
   ```typescript
   graph.setCameraState(newState, {
     animate: true,
     duration: 1000,
     easing: 'easeInOutQuad'
   });
   ```
6. **2D vs 3D Camera** - Mode-specific behavior
7. **Coordinate Transforms**:
   ```typescript
   const screenPos = graph.worldToScreen({x: 0, y: 0, z: 0});
   const worldPos = graph.screenToWorld({x: 500, y: 300});
   ```

**Storybook Links**:
- [Camera Controls](storybook/?path=/story/camera--default)
- [Camera Animation](storybook/?path=/story/cameraanimation--default)

---

##### `docs/guide/vr-ar.md`

**Purpose**: Guide to VR and AR immersive experiences

**Content**:
1. **Overview** - WebXR support and requirements
2. **Checking Support**:
   ```typescript
   const vrSupported = await graph.isVRSupported();
   const arSupported = await graph.isARSupported();
   ```
3. **Entering VR Mode**:
   ```typescript
   graph.setViewMode('vr');
   // or via attribute
   <graphty-element view-mode="vr"></graphty-element>
   ```
4. **Entering AR Mode**:
   ```typescript
   graph.setViewMode('ar');
   ```
5. **XR Configuration**:
   ```typescript
   graph.setXRConfig({
     referenceSpace: 'local-floor',
     sessionMode: 'immersive-vr'
   });
   ```
6. **Exiting XR**:
   ```typescript
   await graph.exitXR();
   ```
7. **Browser Compatibility** - Chrome, Edge, Quest Browser requirements
8. **Interaction in VR/AR** - Controller support

**Storybook Links**: [XR Examples](storybook/?path=/story/xr-example--default)

---

##### `docs/guide/screenshots.md`

**Purpose**: Guide to capturing images and video

**Content**:
1. **Overview** - Capture capabilities
2. **Taking Screenshots**:
   ```typescript
   const dataUrl = await graph.captureScreenshot({
     width: 1920,
     height: 1080,
     format: 'png'
   });
   ```
3. **Screenshot Options**:
   - `width`, `height` - Output dimensions
   - `format` - 'png' or 'jpeg'
   - `quality` - JPEG quality (0-1)
   - `transparent` - Transparent background
4. **Checking Capabilities**:
   ```typescript
   const canCapture = graph.canCaptureScreenshot();
   ```
5. **Recording Video/Animation**:
   ```typescript
   const blob = await graph.captureAnimation({
     duration: 5000,
     fps: 30,
     format: 'webm'
   });
   ```
6. **Animation Capture Controls**:
   ```typescript
   graph.isAnimationCapturing(); // Check if recording
   graph.cancelAnimationCapture(); // Stop recording
   ```
7. **Download Helpers** - Saving to file

**Storybook Links**:
- [Screenshots](storybook/?path=/story/screenshot--default)
- [Video Capture](storybook/?path=/story/video--default)

---

##### `docs/guide/extending/custom-layouts.md`

**Purpose**: Guide to creating custom layout algorithms

**Content**:
1. **Overview** - Layout architecture and interfaces
2. **LayoutEngine Interface**:
   ```typescript
   abstract class LayoutEngine {
     abstract initialize(nodes: Node[], edges: Edge[]): void;
     abstract step(): boolean; // Returns true when settled
     abstract getPosition(nodeId: string): Vector3;
   }
   ```
3. **Creating a Custom Layout**:
   ```typescript
   class MyLayout extends LayoutEngine {
     static type = 'my-layout';
     // ... implementation
   }
   LayoutEngine.register(MyLayout);
   ```
4. **Layout Configuration** - Options schema
5. **2D vs 3D Layouts** - Dimension considerations
6. **Performance Tips** - Optimization strategies

---

##### `docs/guide/extending/custom-algorithms.md`

**Purpose**: Guide to creating custom graph algorithms

**Content**:
1. **Overview** - Algorithm architecture
2. **Algorithm Interface**:
   ```typescript
   abstract class Algorithm {
     static namespace = 'my-namespace';
     static type = 'my-algorithm';
     abstract run(graph: Graph, options?: object): AlgorithmResult;
   }
   ```
3. **Creating a Custom Algorithm**:
   ```typescript
   class MyAlgorithm extends Algorithm {
     static namespace = 'custom';
     static type = 'my-algo';

     run(graph, options) {
       // Compute results
       return { nodeResults: new Map(), suggestedStyles: {...} };
     }
   }
   Algorithm.register(MyAlgorithm);
   ```
4. **Suggested Styles** - Providing visualization
5. **Using @graphty/algorithms** - Leveraging the algorithms package

---

##### `docs/guide/extending/custom-data-sources.md`

**Purpose**: Guide to creating custom data source handlers

**Content**:
1. **Overview** - Data source architecture
2. **DataSource Interface**:
   ```typescript
   abstract class DataSource {
     static type = 'my-source';
     abstract load(config: object): AsyncGenerator<GraphData>;
   }
   ```
3. **Creating a Custom Data Source**:
   ```typescript
   class MyDataSource extends DataSource {
     static type = 'my-api';

     async *load(config) {
       const response = await fetch(config.url);
       const data = await response.json();
       yield { nodes: data.nodes, edges: data.edges };
     }
   }
   DataSource.register(MyDataSource);
   ```
4. **Chunked Loading** - Progressive data loading
5. **Schema Validation** - Using Zod schemas

---

##### `docs/api/index.md` - API Overview

**Purpose**: Entry point for auto-generated TypeDoc reference

**Content**:
1. **API Reference Overview**
2. **Core Classes**:
   - `Graphty` - Web Component class
   - `Graph` - Core orchestrator
   - `Node` - Node instance
   - `Edge` - Edge instance
   - `Styles` - Style configuration
3. **Manager Classes**:
   - `StyleManager`, `DataManager`, `LayoutManager`, etc.
4. **Extension Base Classes**:
   - `LayoutEngine`, `Algorithm`, `DataSource`
5. **Configuration Types**:
   - `GraphtyConfig`, `StyleSchema`, `LayoutConfig`, etc.
6. **Navigation to Generated Docs**

---

### Phase 2: TypeDoc Setup

**Objective**: Install TypeDoc with markdown plugin, configure for VitePress compatibility, generate API reference from existing JSDoc.

**Tests to Write First**:
- No unit tests - verification is through successful build

**Implementation**:

1. `package.json` - Add dependencies:
   ```json
   "devDependencies": {
       "typedoc": "^0.26.x",
       "typedoc-plugin-markdown": "^4.x"
   }
   ```

2. `typedoc.json` - Create configuration:
   ```json
   {
       "$schema": "https://typedoc.org/schema.json",
       "entryPoints": ["./src/index.ts"],
       "entryPointStrategy": "expand",
       "out": "./docs/api",
       "plugin": ["typedoc-plugin-markdown"],
       "outputFileStrategy": "members",
       "flattenOutputFiles": false,
       "readme": "none",
       "excludePrivate": true,
       "excludeProtected": true,
       "excludeInternal": true,
       "excludeExternals": true,
       "hideGenerator": true,
       "navigation": {
           "includeCategories": true,
           "includeGroups": true
       },
       "categorizeByGroup": true,
       "sort": ["alphabetical"],
       "kindSortOrder": [
           "Class",
           "Interface",
           "TypeAlias",
           "Function",
           "Variable"
       ]
   }
   ```

3. `package.json` - Update scripts:
   ```json
   "scripts": {
       "docs:api": "typedoc",
       "docs:api:watch": "typedoc --watch",
       "docs:dev": "vitepress dev docs",
       "docs:build": "npm run docs:api && vitepress build docs",
       "docs:preview": "vitepress preview docs"
   }
   ```

4. `docs/.vitepress/config.ts` - Update API sidebar to include generated files

5. `src/index.ts` - Review exports to ensure public API is properly exposed

**Dependencies**:
- External: `typedoc`, `typedoc-plugin-markdown`
- Internal: Phase 1 (VitePress set up)

**Verification**:
1. Run: `npm install && npm run docs:api`
2. Expected: `docs/api/` directory populated with markdown files
3. Verify: Files exist for `Graph`, `Graphty`, `Node`, `Edge`, `Styles`
4. Run: `npm run docs:dev`
5. Expected: API docs visible in sidebar and navigable
6. Verify: Existing JSDoc `@example` blocks appear in generated docs

---

### Phase 3: GitHub Pages Deployment

**Objective**: Modify CI/CD pipeline to build and deploy documentation alongside Storybook.

**Tests to Write First**:
- No unit tests - verification through CI and deployed site

**Implementation**:

1. `.github/workflows/ci.yml` - Modify to include docs:

   ```yaml
   # Add to build-test job steps:
   - name: Build Documentation
     if: github.ref == 'refs/heads/master'
     run: npm run docs:build

   - name: Upload Documentation artifacts
     if: github.ref == 'refs/heads/master'
     uses: actions/upload-artifact@v4
     with:
       name: docs-dist
       path: docs/.vitepress/dist/
       retention-days: 1

   # Replace storybook job with combined deployment:
   deploy-pages:
     name: Deploy to GitHub Pages
     needs: build-test
     if: github.ref == 'refs/heads/master'
     runs-on: ubuntu-latest

     permissions:
       contents: read
       pages: write
       id-token: write

     environment:
       name: github-pages
       url: ${{ steps.deployment.outputs.page_url }}

     steps:
       - name: Download Documentation artifacts
         uses: actions/download-artifact@v4
         with:
           name: docs-dist
           path: ./public

       - name: Download Storybook artifacts
         uses: actions/download-artifact@v4
         with:
           name: storybook-static
           path: ./public/storybook

       - name: Setup Pages
         uses: actions/configure-pages@v4

       - name: Upload to GitHub Pages
         uses: actions/upload-pages-artifact@v3
         with:
           path: ./public

       - name: Deploy to GitHub Pages
         id: deployment
         uses: actions/deploy-pages@v4
   ```

2. `docs/.vitepress/config.ts` - Update base path if needed:
   ```typescript
   // If deploying to a subdomain (e.g., docs.graphty.dev):
   base: '/',
   // If deploying to a path (e.g., github.io/graphty-element/docs):
   // base: '/graphty-element/',
   ```

3. Add Storybook link in VitePress nav to point to `/storybook/`

**Dependencies**:
- Internal: Phase 2 (TypeDoc + VitePress build successfully)

**Verification**:
1. Push to a branch and create PR
2. Expected: CI workflow runs, docs:build step passes
3. After merge to master:
4. Expected: Documentation deployed to GitHub Pages
5. Verify: Main docs site accessible
6. Verify: Storybook accessible at `/storybook/`
7. Verify: Links between docs and Storybook work

---

### Phase 4: README.md Updates

**Objective**: Update README.md with badges, streamline content, add links to documentation site.

**Tests to Write First**:
- No unit tests needed

**Implementation**:

1. `README.md` - Update with badges and links:
   ```markdown
   # @graphty/graphty-element

   [![npm version](https://img.shields.io/npm/v/@graphty/graphty-element.svg)](https://www.npmjs.com/package/@graphty/graphty-element)
   [![CI/CD](https://github.com/graphty-org/graphty-element/actions/workflows/ci.yml/badge.svg)](https://github.com/graphty-org/graphty-element/actions/workflows/ci.yml)
   [![Coverage Status](https://coveralls.io/repos/github/graphty-org/graphty-element/badge.svg?branch=master)](https://coveralls.io/github/graphty-org/graphty-element?branch=master)
   [![Documentation](https://img.shields.io/badge/docs-vitepress-blue)](https://graphty-org.github.io/graphty-element/)
   [![Storybook](https://img.shields.io/badge/storybook-examples-ff4785)](https://graphty-org.github.io/graphty-element/storybook/)

   A Web Component for 3D/2D graph visualization built with Lit and Babylon.js.

   ## Quick Start

   [Keep brief installation and basic usage example]

   ## Documentation

   - [Getting Started Guide](https://graphty-org.github.io/graphty-element/guide/getting-started)
   - [API Reference](https://graphty-org.github.io/graphty-element/api/)
   - [Interactive Examples (Storybook)](https://graphty-org.github.io/graphty-element/storybook/)

   ## Features

   [Brief feature list with links to docs]

   ## License

   MIT
   ```

2. Move detailed content from README to docs site

**Dependencies**:
- Internal: Phase 3 (Docs deployed so links work)

**Verification**:
1. Review README.md - should be concise
2. All badge links should resolve correctly
3. Documentation links should work after deployment

---

### Phase 5: ESLint JSDoc Setup

**Objective**: Install and configure eslint-plugin-jsdoc with TypeScript-aware rules. Start with warning level to avoid breaking CI, then incrementally fix issues.

**Tests to Write First**:
- No new test files needed - ESLint errors will be caught by existing `npm run lint`

**Implementation**:

1. `package.json` - Add dependency:
   ```json
   "eslint-plugin-jsdoc": "^50.x"
   ```

2. `eslint.config.js` - Add JSDoc plugin configuration:
   ```typescript
   import jsdoc from "eslint-plugin-jsdoc";

   // Add to config array:
   jsdoc.configs['flat/recommended-typescript-error'],
   {
       plugins: {
           jsdoc,
       },
       rules: {
           // Start with warnings to not break CI
           "jsdoc/require-description": "warn",
           "jsdoc/require-param-description": "warn",
           "jsdoc/require-returns-description": "warn",
           "jsdoc/no-types": "error", // TypeScript handles types
           "jsdoc/check-tag-names": ["warn", {
               definedTags: ["since", "internal"]
           }],
           // Disable require-jsdoc for now - too many existing gaps
           "jsdoc/require-jsdoc": "off",
       },
   },
   // Disable JSDoc requirements for test files
   {
       files: ["**/*.test.ts", "test/**/*.ts"],
       rules: {
           "jsdoc/require-jsdoc": "off",
           "jsdoc/require-description": "off",
       },
   },
   ```

**Dependencies**:
- External: `eslint-plugin-jsdoc`
- Internal: Phase 4 (basic documentation system working)

**Verification**:
1. Run: `npm install && npm run lint`
2. Expected: No errors (warnings acceptable), lint passes
3. Run: `npm run build && npm test`
4. Expected: Build and tests pass (JSDoc changes don't break functionality)

---

### Phase 6: JSDoc Enhancement for Core APIs

**Objective**: Add comprehensive JSDoc documentation to all public APIs. Each method/property should include: description, purpose, parameters, return values, usage examples, `@since` tags, and links to relevant Storybook stories.

**Tests to Write First**:
- `test/documentation/jsdoc-coverage.test.ts`: Verify JSDoc exists on public methods
  ```typescript
  import {assert, describe, it} from "vitest";
  import * as fs from "fs";

  describe("JSDoc Coverage", () => {
      it("Graph.ts public methods have JSDoc with examples", () => {
          const content = fs.readFileSync("src/Graph.ts", "utf8");
          const publicMethods = [
              "addNodes", "addEdges", "setLayout", "runAlgorithm",
              "selectNode", "deselectNode", "zoomToFit", "waitForSettled",
          ];

          for (const method of publicMethods) {
              const regex = new RegExp(`/\\*\\*[^*]*@example[^*]*\\*/\\s*(async\\s+)?${method}\\s*\\(`);
              assert.match(content, regex, `${method} should have JSDoc with @example`);
          }
      });

      it("graphty-element.ts properties have JSDoc", () => {
          const content = fs.readFileSync("src/graphty-element.ts", "utf8");
          assert.include(content, "@example", "Should have @example blocks");
          assert.include(content, "@since", "Should have @since tags");
      });
  });
  ```

---

#### 6.1 JSDoc Documentation Standards

Every public API must include:

1. **Description**: What the API does and when to use it
2. **@param tags**: For each parameter with type and description
3. **@returns tag**: Return type and description
4. **@example block**: Working code example
5. **@since tag**: Version when introduced (use `1.0.0` for existing, `1.5.0` for new)
6. **@see tag**: Link to related APIs or Storybook stories
7. **@remarks**: Additional context, edge cases, or important notes

**Template**:
```typescript
/**
 * Brief one-line description of what this does.
 *
 * @remarks
 * Additional context about when to use this, edge cases, or
 * important behavior notes.
 *
 * @param paramName - Description of the parameter
 * @returns Description of what is returned
 * @since 1.0.0
 *
 * @see {@link RelatedMethod} for related functionality
 * @see {@link https://graphty-org.github.io/graphty-element/storybook/?path=/story/example--story | Storybook Example}
 *
 * @example
 * ```typescript
 * // Description of what this example demonstrates
 * const result = await graph.methodName(param);
 * console.log(result);
 * ```
 */
```

---

#### 6.2 API Documentation by Category

##### A. Data Management APIs (`Graph.ts`)

| Method | Description | Example Use Case | Storybook Link |
|--------|-------------|------------------|----------------|
| `addNodes(nodes, idPath?, opts?)` | Add nodes incrementally to the graph. Does not replace existing nodes. | Dynamically loading data from API | [Data](storybook/?path=/story/data--default) |
| `addEdges(edges, src?, dst?, opts?)` | Add edges incrementally. Source/target nodes should exist. | Building graph from stream | [Data](storybook/?path=/story/data--default) |
| `removeNodes(nodeIds, opts?)` | Remove nodes and their connected edges | Filtering graph by criteria | |
| `updateNodes(updates, opts?)` | Update data properties on existing nodes | Real-time data updates | |
| `loadFromUrl(url, opts?)` | Load graph data from URL with auto-format detection | Loading external datasets | |
| `loadFromFile(file, opts?)` | Load graph data from File object | User file uploads | |
| `getNode(nodeId)` | Get a node by its ID | Accessing node data | |
| `getNodes()` | Get all nodes in the graph | Iterating over graph | |
| `getNodeCount()` | Get the number of nodes | Statistics, validation | |
| `getEdgeCount()` | Get the number of edges | Statistics, validation | |

**Example JSDoc for `addNodes`**:
```typescript
/**
 * Add nodes incrementally to the graph.
 *
 * @remarks
 * This method ADDS nodes to the existing graph without removing existing nodes.
 * For complete replacement, use the `nodeData` property instead.
 *
 * Nodes are added to the current layout and will animate into position if
 * a force-directed layout is active.
 *
 * @param nodes - Array of node data objects to add
 * @param idPath - Key to use for node IDs (default: "id")
 * @param options - Queue options for operation ordering
 * @returns Promise that resolves when nodes are added
 * @since 1.0.0
 *
 * @see {@link addEdges} for adding edges
 * @see {@link removeNodes} for removing nodes
 * @see {@link https://graphty-org.github.io/graphty-element/storybook/?path=/story/data--default | Data Loading Examples}
 *
 * @example
 * ```typescript
 * // Add nodes with default ID field
 * await graph.addNodes([
 *   { id: 'node-1', label: 'First Node', category: 'A' },
 *   { id: 'node-2', label: 'Second Node', category: 'B' }
 * ]);
 *
 * // Add nodes with custom ID field
 * await graph.addNodes(
 *   [{ nodeId: 'n1', name: 'Node One' }],
 *   'nodeId'
 * );
 *
 * // Wait for layout to settle after adding
 * await graph.addNodes(newNodes);
 * await graph.waitForSettled();
 * graph.zoomToFit();
 * ```
 */
```

---

##### B. Selection APIs (`Graph.ts`)

| Method | Description | Example Use Case | Storybook Link |
|--------|-------------|------------------|----------------|
| `selectNode(nodeId)` | Select a node by ID, deselecting any current selection | User interaction, highlighting | [Selection](storybook/?path=/story/selection--default) |
| `deselectNode()` | Clear the current selection | Resetting UI state | [Selection](storybook/?path=/story/selection--default) |
| `getSelectedNode()` | Get the currently selected node | Showing details panel | [Selection](storybook/?path=/story/selection--default) |
| `isNodeSelected(nodeId)` | Check if a specific node is selected | Conditional styling | |

**Example JSDoc for `selectNode`**:
```typescript
/**
 * Select a node by its ID.
 *
 * @remarks
 * Selection triggers a `selection-changed` event and applies selection styles
 * (defined in the style template). Only one node can be selected at a time;
 * calling this method will deselect any previously selected node.
 *
 * Selection is often used to:
 * - Show a details panel with node information
 * - Highlight the node and its connections
 * - Enable context-specific actions
 *
 * @param nodeId - The ID of the node to select
 * @returns True if the node was found and selected, false if not found
 * @since 1.0.0
 *
 * @see {@link deselectNode} to clear selection
 * @see {@link getSelectedNode} to get current selection
 * @see {@link https://graphty-org.github.io/graphty-element/storybook/?path=/story/selection--default | Selection Examples}
 *
 * @example
 * ```typescript
 * // Select a node and show its details
 * if (graph.selectNode('node-123')) {
 *   const node = graph.getSelectedNode();
 *   console.log('Selected:', node.data);
 *   showDetailsPanel(node);
 * }
 *
 * // Handle click events for selection
 * graph.on('node-click', ({ node }) => {
 *   graph.selectNode(node.id);
 * });
 * ```
 */
```

---

##### C. Layout APIs (`Graph.ts`)

| Method | Description | Example Use Case | Storybook Link |
|--------|-------------|------------------|----------------|
| `setLayout(type, opts?, queueOpts?)` | Set the layout algorithm and configuration | Switching visualizations | [Layout 3D](storybook/?path=/story/layout--default), [Layout 2D](storybook/?path=/story/layout2d--default) |
| `waitForSettled()` | Wait for the layout to stabilize | Ensuring positions before export | |

**Example JSDoc for `setLayout`**:
```typescript
/**
 * Set the layout algorithm and configuration.
 *
 * @remarks
 * Available layouts:
 * - `ngraph`: Force-directed (3D optimized, recommended for general use)
 * - `d3-force`: Force-directed (2D, web standard)
 * - `circular`: Nodes arranged in a circle
 * - `grid`: Nodes arranged in a grid
 * - `hierarchical`: Tree/DAG layout
 * - `random`: Random positions (useful for testing)
 * - `fixed`: Use pre-defined positions from node data
 *
 * Layout changes are queued and execute in order. The layout will
 * animate nodes from their current positions to new positions.
 *
 * @param type - Layout algorithm name
 * @param options - Layout-specific configuration options
 * @param queueOptions - Options for operation queue behavior
 * @returns Promise that resolves when layout is initialized
 * @since 1.0.0
 *
 * @see {@link waitForSettled} to wait for layout completion
 * @see {@link https://graphty-org.github.io/graphty-element/storybook/?path=/story/layout--default | 3D Layout Examples}
 * @see {@link https://graphty-org.github.io/graphty-element/storybook/?path=/story/layout2d--default | 2D Layout Examples}
 *
 * @example
 * ```typescript
 * // Use force-directed layout with custom settings
 * await graph.setLayout('ngraph', {
 *   springLength: 100,
 *   springCoefficient: 0.0008,
 *   gravity: -1.2,
 *   dimensions: 3
 * });
 *
 * // Wait for layout to settle then zoom to fit
 * await graph.waitForSettled();
 * graph.zoomToFit();
 * ```
 */
```

---

##### D. Algorithm APIs (`Graph.ts`)

| Method | Description | Example Use Case | Storybook Link |
|--------|-------------|------------------|----------------|
| `runAlgorithm(ns, type, opts?)` | Run a graph algorithm | Analytics, clustering | [Centrality](storybook/?path=/story/algorithms-centrality--degree), [Community](storybook/?path=/story/algorithms-community--louvain) |
| `applySuggestedStyles(key, opts?)` | Apply visual styles suggested by an algorithm | Visualizing results | [Combined](storybook/?path=/story/algorithms-combined--default) |
| `getSuggestedStyles(key)` | Get suggested styles without applying | Previewing/customizing | |

**Example JSDoc for `runAlgorithm`**:
```typescript
/**
 * Run a graph algorithm and store results on nodes/edges.
 *
 * @remarks
 * Algorithms are identified by namespace and type (e.g., `graphty:degree`).
 * Results are stored on each node's `algorithmResults` property and can be
 * accessed in style selectors.
 *
 * Available algorithms by category:
 * - **Centrality**: degree, betweenness, closeness, pagerank, eigenvector
 * - **Community**: louvain, label-propagation
 * - **Components**: connected-components, strongly-connected
 * - **Traversal**: bfs, dfs
 * - **Shortest Path**: dijkstra, bellman-ford, a-star
 * - **Spanning Tree**: prim, kruskal
 * - **Flow**: max-flow, min-cut
 *
 * @param namespace - Algorithm namespace (e.g., "graphty")
 * @param type - Algorithm type (e.g., "degree", "pagerank")
 * @param options - Algorithm options and queue settings
 * @returns Promise that resolves when algorithm completes
 * @since 1.0.0
 *
 * @see {@link applySuggestedStyles} to visualize results
 * @see {@link https://graphty-org.github.io/graphty-element/storybook/?path=/story/algorithms-centrality--degree | Centrality Examples}
 * @see {@link https://graphty-org.github.io/graphty-element/storybook/?path=/story/algorithms-community--louvain | Community Detection}
 *
 * @example
 * ```typescript
 * // Run degree centrality
 * await graph.runAlgorithm('graphty', 'degree');
 *
 * // Access results
 * const node = graph.getNode('node-1');
 * console.log('Degree:', node.algorithmResults['graphty:degree']);
 *
 * // Run with auto-styling
 * await graph.runAlgorithm('graphty', 'pagerank', {
 *   algorithmOptions: { damping: 0.85 },
 *   applySuggestedStyles: true
 * });
 *
 * // Use results in style selectors
 * styleManager.addLayer({
 *   selector: "[?algorithmResults.'graphty:degree' > `10`]",
 *   styles: { node: { color: '#ff0000', size: 2.0 } }
 * });
 * ```
 */
```

---

##### E. Camera APIs (`Graph.ts`)

| Method | Description | Example Use Case | Storybook Link |
|--------|-------------|------------------|----------------|
| `getCameraState()` | Get current camera position, target, up vector | Saving view state | [Camera](storybook/?path=/story/camera--default) |
| `setCameraState(state, opts?)` | Set camera state with optional animation | Restoring saved view | [Camera Animation](storybook/?path=/story/cameraanimation--default) |
| `setCameraPosition(pos, opts?)` | Set camera position only | Moving viewpoint | |
| `setCameraTarget(target, opts?)` | Set camera look-at target | Focusing on node | |
| `zoomToFit()` | Zoom camera to show all nodes | After loading data | |
| `saveCameraPreset(name)` | Save current view as named preset | View bookmarks | |
| `loadCameraPreset(name, opts?)` | Load a saved camera preset | Switching views | |

---

##### F. Event APIs (`Graph.ts`)

| Method | Description | Example Use Case | Storybook Link |
|--------|-------------|------------------|----------------|
| `on(type, callback)` | Subscribe to graph events | Responding to changes | [Selection](storybook/?path=/story/selection--default) |
| `addListener(type, callback)` | Alias for `on()` | Event-driven apps | |
| `listenerCount()` | Get number of registered listeners | Debugging | |

**Example JSDoc for `on`**:
```typescript
/**
 * Subscribe to graph events.
 *
 * @remarks
 * Available events:
 * - `graph-settled`: Layout has stabilized
 * - `data-loaded`: Initial data has been loaded
 * - `data-added`: Incremental data was added
 * - `selection-changed`: Node selection changed
 * - `camera-state-changed`: Camera position changed
 * - `style-changed`: Styles were updated
 * - `node-click`: User clicked a node
 * - `node-hover`: Mouse entered a node
 * - `edge-click`: User clicked an edge
 * - `error`: An error occurred
 *
 * @param type - Event type to listen for
 * @param callback - Function to call when event occurs
 * @since 1.0.0
 *
 * @see {@link https://graphty-org.github.io/graphty-element/storybook/?path=/story/selection--default | Event Examples}
 *
 * @example
 * ```typescript
 * // Wait for layout to settle
 * graph.on('graph-settled', () => {
 *   console.log('Layout complete!');
 *   graph.zoomToFit();
 * });
 *
 * // Handle node clicks
 * graph.on('node-click', ({ node, event }) => {
 *   console.log('Clicked:', node.id, node.data);
 *   graph.selectNode(node.id);
 * });
 *
 * // Handle errors
 * graph.on('error', ({ error, context }) => {
 *   console.error('Graph error:', error, 'Context:', context);
 * });
 * ```
 */
```

---

##### G. Style APIs (`Graph.ts` and `StyleManager`)

| Method | Description | Example Use Case | Storybook Link |
|--------|-------------|------------------|----------------|
| `setStyleTemplate(template, opts?)` | Apply a style template | Theme switching | [Graph Styles](storybook/?path=/story/graphstyles--default) |
| `getStyleManager()` | Get the StyleManager instance | Advanced styling | [Layered Styles](storybook/?path=/story/layeredstyles--default) |
| `StyleManager.addLayer(layer)` | Add a style layer | Custom styling | |
| `StyleManager.insertLayer(layer, index)` | Insert layer at position | Style precedence | |
| `StyleManager.removeLayersByMetadata(key, value)` | Remove layers by metadata | Cleaning up styles | |

---

##### H. Screenshot/Video APIs (`Graph.ts`)

| Method | Description | Example Use Case | Storybook Link |
|--------|-------------|------------------|----------------|
| `captureScreenshot(opts?)` | Capture current view as image | Exporting, sharing | [Screenshot](storybook/?path=/story/screenshot--default) |
| `canCaptureScreenshot(opts?)` | Check if capture is possible | Feature detection | |
| `captureAnimation(opts?)` | Record video of graph | Presentations | [Video](storybook/?path=/story/video--default) |
| `isAnimationCapturing()` | Check if recording is active | UI state | |
| `cancelAnimationCapture()` | Stop recording | User cancel | |

---

##### I. XR APIs (`Graph.ts`)

| Method | Description | Example Use Case | Storybook Link |
|--------|-------------|------------------|----------------|
| `isVRSupported()` | Check VR headset availability | Feature detection | [XR](storybook/?path=/story/xr-example--default) |
| `isARSupported()` | Check AR availability | Feature detection | |
| `setXRConfig(config)` | Configure XR settings | Session setup | |
| `exitXR()` | Exit VR/AR session | Return to desktop | |

---

##### J. Utility APIs (`Graph.ts`)

| Method | Description | Example Use Case | Storybook Link |
|--------|-------------|------------------|----------------|
| `batchOperations(fn)` | Execute multiple operations in optimal order | Complex updates | |
| `worldToScreen(worldPos)` | Convert 3D coords to screen pixels | Overlay positioning | |
| `screenToWorld(screenPos)` | Convert screen pixels to 3D coords | Mouse picking | |
| `shutdown()` | Clean up and dispose resources | Component unmount | |
| `isRunning()` | Check if graph is active | State management | |

---

##### K. Style Helpers API (`StyleHelpers`)

The `StyleHelpers` object provides data-to-visual mapping utilities. Each function needs JSDoc documenting:
- What type of data it transforms (0-1, categories, boolean, etc.)
- Color output format
- Colorblind safety status
- Scientific source for the palette

| Category | Functions | Description | Storybook Link |
|----------|-----------|-------------|----------------|
| `color.sequential` | `viridis`, `plasma`, `inferno`, `blues`, `greens`, `oranges` | Map 0-1 → color | [Palette Picker](storybook/?path=/story/algorithms-palettepicker--default) |
| `color.categorical` | `okabeIto`, `paulTolVibrant`, `paulTolMuted`, `ibmCarbon`, `pastel` | Map index → color | |
| `color.diverging` | `purpleGreen`, `blueOrange`, `redBlue` | Map -1 to +1 → color | |
| `color.binary` | `blueHighlight`, `greenSuccess`, `orangeWarning` | Map boolean → color | |
| `size` | `linear`, `log`, `exp`, `bins`, `smallMediumLarge`, etc. | Map value → size | |
| `opacity` | `linear`, `threshold`, `binary`, `inverse` | Map value → opacity | |
| `label` | `percentage`, `fixed`, `rankLabel`, `topN`, etc. | Format labels | |
| `edgeWidth` | `linear`, `log`, `binary`, `stepped` | Map value → edge width | |
| `combined` | `colorAndSize`, `fullSpectrum`, etc. | Multi-dimensional mapping | |
| `animation` | `easeIn`, `easeOut`, `pulse`, `spring`, etc. | Animation timing | |

**Example JSDoc for `viridis`**:
```typescript
/**
 * Map a 0-1 value to a color using the Viridis palette.
 *
 * @remarks
 * Viridis is the default sequential palette, developed by Stéfan van der Walt
 * and Nathaniel Smith for matplotlib. It is:
 * - **Perceptually uniform**: Equal value steps produce equal visual steps
 * - **Colorblind safe**: Distinguishable under Deuteranopia, Protanopia, and Tritanopia
 * - **Print safe**: Works in grayscale
 *
 * The gradient runs from deep purple (0.0) through teal (0.5) to bright yellow (1.0).
 *
 * @param value - A number from 0 to 1 (clamped if outside range)
 * @returns A hex color string (e.g., "#440154" for 0.0, "#FDE725" for 1.0)
 * @since 1.0.0
 *
 * @see {@link plasma} for higher contrast alternative
 * @see {@link blues} for single-hue alternative
 * @see {@link https://graphty-org.github.io/graphty-element/storybook/?path=/story/algorithms-palettepicker--default | Palette Examples}
 *
 * @example
 * ```typescript
 * import { StyleHelpers } from '@graphty/graphty-element';
 *
 * // Use in a style layer
 * styleManager.addLayer({
 *   selector: '*',
 *   styles: {
 *     node: {
 *       color: (node) => {
 *         const normalized = node.algorithmResults['graphty:degree'] / maxDegree;
 *         return StyleHelpers.color.sequential.viridis(normalized);
 *       }
 *     }
 *   }
 * });
 * ```
 */
```

**Example JSDoc for `okabeIto`**:
```typescript
/**
 * Map a category index to a color using the Okabe-Ito palette.
 *
 * @remarks
 * The Okabe-Ito palette was designed by Masataka Okabe and Kei Ito (2008)
 * specifically for colorblind accessibility. It is:
 * - **Universal**: Distinguishable under all forms of color vision deficiency
 * - **Adopted as R 4.0 default**: Widely recognized standard
 * - **8 distinct colors**: Optimal for categorical data (avoid >9 categories)
 *
 * Colors:
 * 0: #E69F00 (Orange)
 * 1: #56B4E9 (Sky Blue)
 * 2: #009E73 (Bluish Green)
 * 3: #F0E442 (Yellow)
 * 4: #0072B2 (Blue)
 * 5: #D55E00 (Vermillion)
 * 6: #CC79A7 (Reddish Purple)
 * 7: #999999 (Gray)
 *
 * @param index - Category index (wraps if > 7)
 * @returns A hex color string
 * @since 1.0.0
 *
 * @see {@link paulTolVibrant} for higher saturation
 * @see {@link https://graphty-org.github.io/graphty-element/storybook/?path=/story/algorithms-community--louvain | Community Detection Example}
 *
 * @example
 * ```typescript
 * // Color nodes by community
 * styleManager.addLayer({
 *   selector: '*',
 *   styles: {
 *     node: {
 *       color: (node) => StyleHelpers.color.categorical.okabeIto(
 *         node.algorithmResults['graphty:louvain']
 *       )
 *     }
 *   }
 * });
 * ```
 */
```

---

##### L. Colorblind Simulation API (`colorblindSimulation`)

**NOTE**: The colorblind simulation utilities exist in `src/utils/styleHelpers/accessibility/colorblindSimulation.ts` but are **not currently exported** from the main package. This needs to be added to `index.ts`:

```typescript
// Add to index.ts exports
export {
    simulateProtanopia,
    simulateDeuteranopia,
    simulateTritanopia,
    toGrayscale,
    colorDifference,
    isPaletteSafe,
    areDistinguishableInGrayscale,
} from "./src/utils/styleHelpers/accessibility/colorblindSimulation";
```

| Function | Description | Use Case |
|----------|-------------|----------|
| `simulateDeuteranopia(color)` | Simulate red-green (M cones, ~5% males) | Accessibility testing |
| `simulateProtanopia(color)` | Simulate red-green (L cones, ~1% males) | Accessibility testing |
| `simulateTritanopia(color)` | Simulate blue-yellow (S cones, ~0.01%) | Accessibility testing |
| `toGrayscale(color)` | Convert to grayscale | Print testing |
| `colorDifference(c1, c2)` | Calculate perceptual distance | Palette validation |
| `isPaletteSafe(colors)` | Test if palette is colorblind safe | Custom palette validation |
| `areDistinguishableInGrayscale(c1, c2)` | Check grayscale distinguishability | Print testing |

**Example JSDoc for `isPaletteSafe`**:
```typescript
/**
 * Test if a color palette is safe for colorblind users.
 *
 * @remarks
 * This function checks if all colors in a palette remain distinguishable
 * under Deuteranopia, Protanopia, and Tritanopia simulations. It uses
 * perceptual color difference (deltaE) to ensure minimum contrast.
 *
 * A palette is considered safe if all pairs of colors have a deltaE ≥ 10
 * under all three simulations.
 *
 * @param colors - Array of hex color strings to test
 * @param threshold - Minimum deltaE for distinguishability (default: 10)
 * @returns Object with `safe` boolean and `issues` array of problem pairs
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * import { colorblindSimulation } from '@graphty/graphty-element';
 *
 * const myPalette = ['#ff0000', '#00ff00', '#0000ff'];
 * const result = colorblindSimulation.isPaletteSafe(myPalette);
 *
 * if (!result.safe) {
 *   console.warn('Palette has accessibility issues:', result.issues);
 *   // Consider using StyleHelpers.color.categorical.okabeIto instead
 * }
 * ```
 */
```

---

#### 6.3 Web Component Properties (`graphty-element.ts`)

Each property needs JSDoc with:
- Description of what it controls
- Valid values and defaults
- Example in HTML attribute form and JS property form

| Property | Attribute | Description | Default | Storybook Link |
|----------|-----------|-------------|---------|----------------|
| `nodeData` | `node-data` | Array of node data objects | `[]` | [Graphty](storybook/?path=/story/graphty--default) |
| `edgeData` | `edge-data` | Array of edge data objects | `[]` | [Graphty](storybook/?path=/story/graphty--default) |
| `layout` | `layout` | Layout algorithm name | `'ngraph'` | [Layout](storybook/?path=/story/layout--default) |
| `layoutConfig` | `layout-config` | Layout-specific options | `{}` | |
| `styleTemplate` | `style-template` | Style template name | `'default'` | [Graph Styles](storybook/?path=/story/graphstyles--default) |
| `viewMode` | `view-mode` | Rendering mode: 2d, 3d, vr, ar | `'3d'` | [View Mode](storybook/?path=/story/viewmode--default) |
| `nodeIdPath` | `node-id-path` | Path to node ID in data | `'id'` | |
| `edgeSrcIdPath` | `edge-src-id-path` | Path to source ID in edge data | `'source'` | |
| `edgeDstIdPath` | `edge-dst-id-path` | Path to target ID in edge data | `'target'` | |
| `dataSource` | `data-source` | Data source type | `undefined` | [Data](storybook/?path=/story/data--default) |
| `dataSourceConfig` | `data-source-config` | Data source configuration | `{}` | |
| `runAlgorithmsOnLoad` | `run-algorithms-on-load` | Run algorithms after data loads | `true` | |
| `enableDetailedProfiling` | `enable-detailed-profiling` | Enable performance profiling | `false` | [Performance](storybook/?path=/story/performancetest--default) |

**Example JSDoc for `nodeData` property**:
```typescript
/**
 * Array of node data objects to visualize.
 *
 * @remarks
 * Setting this property replaces all existing nodes. For incremental
 * updates, use the `addNodes()` method instead.
 *
 * Each node object should have an ID field (default: "id"). Additional
 * properties can be used in style selectors and accessed via `node.data`.
 *
 * @defaultValue `[]`
 * @since 1.0.0
 *
 * @see {@link edgeData} for edge data
 * @see {@link addNodes} for incremental loading
 * @see {@link https://graphty-org.github.io/graphty-element/storybook/?path=/story/graphty--default | Basic Examples}
 *
 * @example HTML attribute (JSON string)
 * ```html
 * <graphty-element
 *   node-data='[{"id": "1", "label": "Node 1"}, {"id": "2", "label": "Node 2"}]'>
 * </graphty-element>
 * ```
 *
 * @example JavaScript property
 * ```typescript
 * const element = document.querySelector('graphty-element');
 * element.nodeData = [
 *   { id: 'a', label: 'Node A', category: 'primary' },
 *   { id: 'b', label: 'Node B', category: 'secondary' }
 * ];
 * ```
 */
```

---

#### 6.4 Manager Classes Documentation

Each manager class needs class-level and method-level documentation.

##### StyleManager (`src/managers/StyleManager.ts`)

```typescript
/**
 * Manages the layer-based styling system for graph visualization.
 *
 * @remarks
 * The StyleManager implements a CSS-like cascade where styles are defined
 * in layers. Later layers override earlier ones. Each layer can target
 * specific nodes/edges using JMESPath selectors.
 *
 * Style layers are evaluated in order, with later layers taking precedence.
 * This allows for:
 * - Base styles (template defaults)
 * - Data-driven styles (based on node properties)
 * - Algorithm-driven styles (based on algorithm results)
 * - Selection/highlight styles
 *
 * @see {@link https://graphty-org.github.io/graphty-element/storybook/?path=/story/layeredstyles--default | Layered Styles Example}
 *
 * @example
 * ```typescript
 * const styleManager = graph.getStyleManager();
 *
 * // Add a layer that highlights high-degree nodes
 * styleManager.addLayer({
 *   metadata: { source: 'analytics' },
 *   selector: "[?algorithmResults.'graphty:degree' > `5`]",
 *   styles: {
 *     node: { color: '#ff6600', size: 1.5 }
 *   }
 * });
 *
 * // Remove all analytics-generated layers
 * styleManager.removeLayersByMetadata('source', 'analytics');
 * ```
 */
```

---

#### 6.5 Configuration Types Documentation

Each configuration type/interface needs documentation.

```typescript
/**
 * Configuration options for the graphty-element component.
 *
 * @remarks
 * This configuration is passed to the Graph constructor and controls
 * the initial behavior of the graph visualization.
 *
 * @example
 * ```typescript
 * const config: GraphtyConfig = {
 *   layout: 'ngraph',
 *   layoutConfig: { dimensions: 3 },
 *   styleTemplate: 'dark',
 *   runAlgorithmsOnLoad: true
 * };
 * ```
 */
interface GraphtyConfig {
  /**
   * Layout algorithm to use.
   * @defaultValue 'ngraph'
   */
  layout?: LayoutType;

  /**
   * Layout-specific configuration options.
   * @see LayoutConfig for available options per layout type
   */
  layoutConfig?: LayoutConfig;

  // ... etc
}
```

---

**Implementation Order**:

1. **Week 1**: Core `Graph.ts` methods (data, selection, layout)
2. **Week 2**: Algorithm, camera, event APIs
3. **Week 3**: Web component properties, screenshot/XR APIs
4. **Week 4**: Manager classes and configuration types

**Dependencies**:
- Internal: Phase 5 (ESLint JSDoc plugin installed)

**Verification**:
1. Run: `npm run lint`
2. Expected: JSDoc warnings significantly reduced
3. Run: `npm test -- test/documentation/jsdoc-coverage.test.ts`
4. Expected: All coverage checks pass
5. Run: `npm run docs:api && npm run docs:dev`
6. Expected: API docs show examples, @see links to Storybook
7. Verify: Each method links to at least one Storybook story where applicable

---

### Phase 7: API Parity Improvements (Parallel Track)

**Objective**: Achieve full API parity between `Graphty` (Web Component) and `Graph` (JS API), ensure consistent event handling, and provide complete extension APIs.

---

#### 7.1 Complete Feature Inventory

The following features exist in graphty-element and need corresponding APIs:

| Feature Category | Description |
|------------------|-------------|
| **Data Management** | Load, add, remove, update nodes and edges |
| **Layout** | Set layout algorithm, configure options |
| **Styling** | Apply style templates, add style layers |
| **Selection** | Select/deselect nodes, get selection state |
| **Camera** | Position, zoom, pan, presets, animation |
| **View Mode** | 2D/3D/VR/AR switching |
| **Algorithms** | Run algorithms, apply suggested styles |
| **Screenshots** | Capture images and video |
| **Events** | Subscribe to graph lifecycle events |
| **XR** | VR/AR configuration and session management |
| **AI Control** | Voice/text AI commands (Phase 7) |
| **Extensions** | Register custom layouts, algorithms, data sources |
| **Performance** | Profiling, statistics, batch operations |
| **Coordinate Transform** | World-to-screen, screen-to-world |

---

#### 7.2 Complete API Parity Analysis

##### A. Data Management APIs

| API | Graph.ts | Graphty | Gap | Action |
|-----|----------|---------|-----|--------|
| **Properties** |
| `nodeData` (replace all) | ❌ | ✅ property | Semantic | Document difference |
| `edgeData` (replace all) | ❌ | ✅ property | Semantic | Document difference |
| `dataSource` | ❌ | ✅ property | ✅ | None |
| `dataSourceConfig` | ❌ | ✅ property | ✅ | None |
| `nodeIdPath` | ❌ | ✅ property | ✅ | None |
| `edgeSrcIdPath` | ❌ | ✅ property | ✅ | None |
| `edgeDstIdPath` | ❌ | ✅ property | ✅ | None |
| **Methods** |
| `addNode(node, idPath, opts)` | ✅ | ❌ | Missing | **Add** |
| `addNodes(nodes, idPath, opts)` | ✅ | ❌ | Missing | **Add** |
| `addEdge(edge, src, dst, opts)` | ✅ | ❌ | Missing | **Add** |
| `addEdges(edges, src, dst, opts)` | ✅ | ❌ | Missing | **Add** |
| `removeNodes(nodeIds, opts)` | ✅ | ❌ | Missing | **Add** |
| `updateNodes(updates, opts)` | ✅ | ❌ | Missing | **Add** |
| `addDataFromSource(type, opts)` | ✅ | ❌ | Missing | **Add** |
| `loadFromUrl(url, opts)` | ✅ | ❌ | Missing | **Add** |
| `loadFromFile(file, opts)` | ✅ | ❌ | Missing | **Add** |
| `getNode(nodeId)` | ✅ | ❌ | Missing | **Add** |
| `getNodes()` | ✅ | ❌ | Missing | **Add** |
| `getNodeCount()` | ✅ | ❌ | Missing | **Add** |
| `getEdgeCount()` | ✅ | ❌ | Missing | **Add** |

##### B. Layout APIs

| API | Graph.ts | Graphty | Gap | Action |
|-----|----------|---------|-----|--------|
| `layout` (set type) | via `setLayout()` | ✅ property | ✅ | None |
| `layoutConfig` | via `setLayout()` | ✅ property | ✅ | None |
| `setLayout(type, opts, queueOpts)` | ✅ | ❌ | Missing | **Add** |

##### C. Style APIs

| API | Graph.ts | Graphty | Gap | Action |
|-----|----------|---------|-----|--------|
| `styleTemplate` | via `setStyleTemplate()` | ✅ property | ✅ | None |
| `setStyleTemplate(template, opts)` | ✅ | ❌ | Missing | **Add** |
| `styles` (readonly) | ✅ property | ❌ | Missing | **Add** |
| `getStyleManager()` | ✅ | ❌ | Missing | **Add** |
| `applySuggestedStyles(key, opts)` | ✅ | ❌ | Missing | **Add** |
| `getSuggestedStyles(key)` | ✅ | ❌ | Missing | **Add** |

##### D. Selection APIs

| API | Graph.ts | Graphty | Gap | Action |
|-----|----------|---------|-----|--------|
| `selectNode(nodeId)` | ✅ | ❌ | Missing | **Add** |
| `deselectNode()` | ✅ | ❌ | Missing | **Add** |
| `getSelectedNode()` | ✅ | ❌ | Missing | **Add** |
| `isNodeSelected(nodeId)` | ✅ | ❌ | Missing | **Add** |

##### E. Camera APIs

| API | Graph.ts | Graphty | Gap | Action |
|-----|----------|---------|-----|--------|
| `getCameraState()` | ✅ | ✅ | ✅ | None |
| `setCameraState(state, opts)` | ✅ | ✅ | ✅ | None |
| `setCameraPosition(pos, opts)` | ✅ | ✅ | ✅ | None |
| `setCameraTarget(target, opts)` | ✅ | ✅ | ✅ | None |
| `setCameraZoom(zoom, opts)` | ✅ | ✅ | ✅ | None |
| `setCameraPan(pan, opts)` | ✅ | ✅ | ✅ | None |
| `resetCamera(opts)` | ✅ | ✅ | ✅ | None |
| `saveCameraPreset(name)` | ✅ | ✅ | ✅ | None |
| `loadCameraPreset(name, opts)` | ✅ | ✅ | ✅ | None |
| `getCameraPresets()` | ✅ | ✅ | ✅ | None |
| `exportCameraPresets()` | ✅ | ✅ | ✅ | None |
| `importCameraPresets(presets)` | ✅ | ✅ | ✅ | None |
| `zoomToFit()` | ✅ | ❌ | Missing | **Add** |
| `resolveCameraPreset(preset)` | ✅ | ❌ | Missing | **Add** |
| `getCameraController()` | ✅ | ❌ | Missing | Consider |

##### F. View Mode APIs

| API | Graph.ts | Graphty | Gap | Action |
|-----|----------|---------|-----|--------|
| `viewMode` | via `setViewMode()` | ✅ property | ✅ | None |
| `getViewMode()` | ✅ | ✅ | ✅ | None |
| `setViewMode(mode, opts)` | ✅ | ✅ | ✅ | None |
| `is2D()` | ✅ | ❌ | Missing | **Add** |
| `isVRSupported()` | ✅ | ✅ | ✅ | None |
| `isARSupported()` | ✅ | ✅ | ✅ | None |

##### G. Algorithm APIs

| API | Graph.ts | Graphty | Gap | Action |
|-----|----------|---------|-----|--------|
| `runAlgorithm(ns, type, opts)` | ✅ | ❌ | Missing | **Add** |
| `runAlgorithmsFromTemplate()` | ✅ | ❌ | Internal | None |
| `runAlgorithmsOnLoad` | ✅ property | ✅ property | ✅ | None |

##### H. Screenshot/Video APIs

| API | Graph.ts | Graphty | Gap | Action |
|-----|----------|---------|-----|--------|
| `captureScreenshot(opts)` | ✅ | ✅ | ✅ | None |
| `canCaptureScreenshot(opts)` | ✅ | ✅ | ✅ | None |
| `captureAnimation(opts)` | ✅ | ✅ | ✅ | None |
| `cancelAnimationCapture()` | ✅ | ✅ | ✅ | None |
| `isAnimationCapturing()` | ✅ | ✅ | ✅ | None |
| `estimateAnimationCapture(opts)` | ✅ | ✅ | ✅ | None |

##### I. Event APIs

| API | Graph.ts | Graphty | Gap | Action |
|-----|----------|---------|-----|--------|
| `on(type, callback)` | ✅ | ❌ | Missing | **Add** |
| `addListener(type, callback)` | ✅ | ❌ | Missing | **Add** |
| `listenerCount()` | ✅ | ❌ | Missing | **Add** |
| `eventManager` | ✅ property | ❌ | Missing | **Add** |
| DOM events via `addEventListener` | ❌ | ✅ | ✅ | None |

##### J. XR APIs

| API | Graph.ts | Graphty | Gap | Action |
|-----|----------|---------|-----|--------|
| `xr` | via `setXRConfig()` | ✅ property | ✅ | None |
| `setXRConfig(config)` | ✅ | ❌ | Missing | **Add** |
| `getXRConfig()` | ✅ | ❌ | Missing | **Add** |
| `exitXR()` | ✅ | ❌ | Missing | **Add** |
| `getXRSessionManager()` | ✅ | ❌ | Consider | Low priority |

##### K. Utility APIs

| API | Graph.ts | Graphty | Gap | Action |
|-----|----------|---------|-----|--------|
| `waitForSettled()` | ✅ | ❌ | Missing | **Add** |
| `batchOperations(fn)` | ✅ | ❌ | Missing | **Add** |
| `init()` | ✅ | Internal | N/A | None |
| `shutdown()` | ✅ | ❌ | Missing | **Add** |
| `isRunning()` | ✅ | ❌ | Missing | **Add** |
| `setRunning(running)` | ✅ | ❌ | Consider | Low priority |

##### L. Coordinate Transform APIs

| API | Graph.ts | Graphty | Gap | Action |
|-----|----------|---------|-----|--------|
| `worldToScreen(worldPos)` | ✅ | ❌ | Missing | **Add** |
| `screenToWorld(screenPos)` | ✅ | ❌ | Missing | **Add** |
| `getNodeMesh(nodeId)` | ✅ | ❌ | Consider | Low priority |

##### M. Manager Access APIs

| API | Graph.ts | Graphty | Gap | Action |
|-----|----------|---------|-----|--------|
| `graph` (underlying Graph) | N/A | ✅ property | ✅ | None |
| `getStyleManager()` | ✅ | ❌ | Missing | **Add** |
| `getDataManager()` | ✅ | ❌ | Consider | Low priority |
| `getLayoutManager()` | ✅ | ❌ | Consider | Low priority |
| `getStatsManager()` | ✅ | ❌ | Consider | Low priority |
| `getSelectionManager()` | ✅ | ❌ | Consider | Low priority |

##### N. Input APIs

| API | Graph.ts | Graphty | Gap | Action |
|-----|----------|---------|-----|--------|
| `setInputEnabled(enabled)` | ✅ | ❌ | Missing | **Add** |
| `startInputRecording()` | ✅ | ❌ | Consider | Low priority |
| `stopInputRecording()` | ✅ | ❌ | Consider | Low priority |

##### O. Performance/Debug APIs

| API | Graph.ts | Graphty | Gap | Action |
|-----|----------|---------|-----|--------|
| `enableDetailedProfiling` | ✅ property | ✅ property | ✅ | None |

---

#### 7.3 Event Consistency Analysis

##### Current Event Types (from events.ts)

| Event Type | Emitted | DOM Forwarded | Use Case |
|------------|---------|---------------|----------|
| `graph-settled` | ✅ | ✅ | Layout finished |
| `error` | ✅ | ✅ | Error occurred |
| `data-loaded` | ✅ | ✅ | Initial data loaded |
| `data-added` | ✅ | ✅ | Incremental data added |
| `layout-initialized` | ✅ | ✅ | Layout engine ready |
| `camera-state-changed` | ✅ | ✅ | Camera moved |
| `selection-changed` | ✅ | ✅ | Selection changed |
| `style-changed` | ✅ | ✅ | Styles updated |
| `node-update-after` | ✅ | ✅ | Node updated |
| `edge-update-after` | ✅ | ✅ | Edge updated |
| `operation-queue-active` | ✅ | ✅ | Queue processing |
| `operation-queue-idle` | ✅ | ✅ | Queue empty |

##### Missing Events (Recommended)

| Event Type | Trigger | Data | Priority |
|------------|---------|------|----------|
| `node-click` | User clicks node | `{node, event}` | High |
| `node-hover` | Mouse enters node | `{node, event}` | High |
| `node-drag-start` | Drag begins | `{node, position}` | Medium |
| `node-drag-end` | Drag ends | `{node, position}` | Medium |
| `edge-click` | User clicks edge | `{edge, event}` | Medium |
| `zoom-changed` | Zoom level changed | `{zoom, previous}` | Low |
| `layout-progress` | Layout iteration | `{progress, settled}` | Low |

---

#### 7.4 Extension API Consistency

| Extension Type | Registration | Retrieval | Discovery | Status |
|----------------|--------------|-----------|-----------|--------|
| **Layouts** | `LayoutEngine.register(cls)` | `LayoutEngine.get(type)` | `LayoutEngine.getRegisteredTypes()` | ✅ |
| **Algorithms** | `Algorithm.register(cls)` | `Algorithm.get(graph, ns, type)` | ❌ Missing | **Add discovery** |
| **DataSources** | `DataSource.register(cls)` | `DataSource.get(type)` | ❌ Missing | **Add discovery** |

**Recommendation**: Add `Algorithm.getRegisteredTypes()` and `DataSource.getRegisteredTypes()` for consistency.

---

#### 7.5 Summary of Required Changes

##### High Priority (Core Parity) - 28 methods

| Category | Methods to Add |
|----------|----------------|
| **Data** (13) | `addNode`, `addNodes`, `addEdge`, `addEdges`, `removeNodes`, `updateNodes`, `addDataFromSource`, `loadFromUrl`, `loadFromFile`, `getNode`, `getNodes`, `getNodeCount`, `getEdgeCount` |
| **Selection** (4) | `selectNode`, `deselectNode`, `getSelectedNode`, `isNodeSelected` |
| **Algorithm** (3) | `runAlgorithm`, `applySuggestedStyles`, `getSuggestedStyles` |
| **Style** (2) | `setStyleTemplate`, `getStyleManager` |
| **Layout** (1) | `setLayout` |
| **Utility** (5) | `zoomToFit`, `waitForSettled`, `batchOperations`, `on`/`addListener`, `listenerCount` |

##### Medium Priority - 10 methods

| Category | Methods to Add |
|----------|----------------|
| **View** (1) | `is2D` |
| **XR** (3) | `setXRConfig`, `getXRConfig`, `exitXR` |
| **Camera** (1) | `resolveCameraPreset` |
| **Input** (1) | `setInputEnabled` |
| **Lifecycle** (2) | `shutdown`, `isRunning` |
| **Coordinate** (2) | `worldToScreen`, `screenToWorld` |

##### Low Priority (Advanced) - 8 methods

| Category | Methods to Add |
|----------|----------------|
| **Managers** (5) | `getDataManager`, `getLayoutManager`, `getStatsManager`, `getSelectionManager`, `eventManager` (property) |
| **Camera** (1) | `getCameraController` |
| **Mesh** (1) | `getNodeMesh` |
| **Input** (2) | `startInputRecording`, `stopInputRecording` |

##### Extension API Additions

| Addition | Description |
|----------|-------------|
| `Algorithm.getRegisteredTypes()` | List registered algorithms |
| `DataSource.getRegisteredTypes()` | List registered data sources |

##### New Events to Add

| Event | Priority |
|-------|----------|
| `node-click` | High |
| `node-hover` | High |
| `node-drag-start` | Medium |
| `node-drag-end` | Medium |
| `edge-click` | Medium |

---

#### 7.6 App Developer Needs Analysis

For building an application with graphty-element, developers need:

| Need | Current Status | Gap |
|------|----------------|-----|
| Load data from API | `dataSource`/`dataSourceConfig` or `loadFromUrl()` | `loadFromUrl` missing on element |
| Add/remove nodes dynamically | `nodeData` replaces all | `addNodes`/`removeNodes` missing |
| Respond to user clicks | DOM events forwarded | `node-click` event missing |
| Highlight selected node | Selection works internally | `selectNode()` missing on element |
| Run analytics | `runAlgorithm()` on Graph | Missing on element |
| Save/restore view | Camera presets work | ✅ |
| Export image | `captureScreenshot()` | ✅ |
| Coordinate overlays | `worldToScreen()` on Graph | Missing on element |
| Disable interaction | `setInputEnabled()` on Graph | Missing on element |
| Wait for ready | `waitForSettled()` on Graph | Missing on element |

---

**Total Methods to Add: 28 (High Priority) + 10 (Medium) + 8 (Low) = 46 methods**

---

#### 7.7 Implementation Plan

Phase 7 is divided into sub-phases for incremental delivery:

##### Phase 7a: High Priority Methods (28 methods)

**Test File**: `test/graphty-element/api-parity.test.ts`

```typescript
import {assert, describe, it} from "vitest";
import {Graphty} from "../../src/graphty-element";

describe("Graphty API Parity", () => {
    describe("Data Methods", () => {
        it("has data manipulation methods", () => {
            assert.isFunction(Graphty.prototype.addNode);
            assert.isFunction(Graphty.prototype.addNodes);
            assert.isFunction(Graphty.prototype.addEdge);
            assert.isFunction(Graphty.prototype.addEdges);
            assert.isFunction(Graphty.prototype.removeNodes);
            assert.isFunction(Graphty.prototype.updateNodes);
            assert.isFunction(Graphty.prototype.getNode);
            assert.isFunction(Graphty.prototype.getNodes);
            assert.isFunction(Graphty.prototype.getNodeCount);
            assert.isFunction(Graphty.prototype.getEdgeCount);
        });

        it("has data loading methods", () => {
            assert.isFunction(Graphty.prototype.addDataFromSource);
            assert.isFunction(Graphty.prototype.loadFromUrl);
            assert.isFunction(Graphty.prototype.loadFromFile);
        });
    });

    describe("Selection Methods", () => {
        it("has selection methods", () => {
            assert.isFunction(Graphty.prototype.selectNode);
            assert.isFunction(Graphty.prototype.deselectNode);
            assert.isFunction(Graphty.prototype.getSelectedNode);
            assert.isFunction(Graphty.prototype.isNodeSelected);
        });
    });

    describe("Algorithm Methods", () => {
        it("has algorithm methods", () => {
            assert.isFunction(Graphty.prototype.runAlgorithm);
            assert.isFunction(Graphty.prototype.applySuggestedStyles);
            assert.isFunction(Graphty.prototype.getSuggestedStyles);
        });
    });

    describe("Style Methods", () => {
        it("has style methods", () => {
            assert.isFunction(Graphty.prototype.setStyleTemplate);
            assert.isFunction(Graphty.prototype.getStyleManager);
        });
    });

    describe("Layout Methods", () => {
        it("has layout methods", () => {
            assert.isFunction(Graphty.prototype.setLayout);
        });
    });

    describe("Utility Methods", () => {
        it("has utility methods", () => {
            assert.isFunction(Graphty.prototype.zoomToFit);
            assert.isFunction(Graphty.prototype.waitForSettled);
            assert.isFunction(Graphty.prototype.batchOperations);
        });
    });

    describe("Event Methods", () => {
        it("has event methods", () => {
            assert.isFunction(Graphty.prototype.on);
            assert.isFunction(Graphty.prototype.addListener);
            assert.isFunction(Graphty.prototype.listenerCount);
        });
    });
});
```

**Methods to Implement** (all delegate to `this.#graph`):

| Category | Method | Signature | Delegation |
|----------|--------|-----------|------------|
| **Data** | `addNode` | `(node, idPath?, opts?) => Promise<void>` | `this.#graph.addNode(...)` |
| | `addNodes` | `(nodes, idPath?, opts?) => Promise<void>` | `this.#graph.addNodes(...)` |
| | `addEdge` | `(edge, src?, dst?, opts?) => Promise<void>` | `this.#graph.addEdge(...)` |
| | `addEdges` | `(edges, src?, dst?, opts?) => Promise<void>` | `this.#graph.addEdges(...)` |
| | `removeNodes` | `(nodeIds, opts?) => Promise<void>` | `this.#graph.removeNodes(...)` |
| | `updateNodes` | `(updates, opts?) => Promise<void>` | `this.#graph.updateNodes(...)` |
| | `addDataFromSource` | `(type, opts?) => Promise<void>` | `this.#graph.addDataFromSource(...)` |
| | `loadFromUrl` | `(url, opts?) => Promise<void>` | `this.#graph.loadFromUrl(...)` |
| | `loadFromFile` | `(file, opts?) => Promise<void>` | `this.#graph.loadFromFile(...)` |
| | `getNode` | `(nodeId) => Node \| undefined` | `this.#graph.getNode(...)` |
| | `getNodes` | `() => Node[]` | `this.#graph.getNodes()` |
| | `getNodeCount` | `() => number` | `this.#graph.getNodeCount()` |
| | `getEdgeCount` | `() => number` | `this.#graph.getEdgeCount()` |
| **Selection** | `selectNode` | `(nodeId) => boolean` | `this.#graph.selectNode(...)` |
| | `deselectNode` | `() => void` | `this.#graph.deselectNode()` |
| | `getSelectedNode` | `() => Node \| null` | `this.#graph.getSelectedNode()` |
| | `isNodeSelected` | `(nodeId) => boolean` | `this.#graph.isNodeSelected(...)` |
| **Algorithm** | `runAlgorithm` | `(ns, type, opts?) => Promise<void>` | `this.#graph.runAlgorithm(...)` |
| | `applySuggestedStyles` | `(key, opts?) => boolean` | `this.#graph.applySuggestedStyles(...)` |
| | `getSuggestedStyles` | `(key) => SuggestedStylesConfig \| null` | `this.#graph.getSuggestedStyles(...)` |
| **Style** | `setStyleTemplate` | `(template, opts?) => Promise<Styles>` | `this.#graph.setStyleTemplate(...)` |
| | `getStyleManager` | `() => StyleManager` | `this.#graph.getStyleManager()` |
| **Layout** | `setLayout` | `(type, opts?, queueOpts?) => Promise<void>` | `this.#graph.setLayout(...)` |
| **Utility** | `zoomToFit` | `() => void` | `this.#graph.zoomToFit()` |
| | `waitForSettled` | `() => Promise<void>` | `this.#graph.waitForSettled()` |
| | `batchOperations` | `(fn) => Promise<void>` | `this.#graph.batchOperations(...)` |
| **Events** | `on` | `(type, cb) => void` | `this.#graph.on(...)` |
| | `addListener` | `(type, cb) => void` | `this.#graph.addListener(...)` |
| | `listenerCount` | `() => number` | `this.#graph.listenerCount()` |

##### Phase 7b: Medium Priority Methods (10 methods)

| Category | Method | Signature |
|----------|--------|-----------|
| **View** | `is2D` | `() => boolean` |
| **XR** | `setXRConfig` | `(config) => void` |
| | `getXRConfig` | `() => XRConfig \| undefined` |
| | `exitXR` | `() => Promise<void>` |
| **Camera** | `resolveCameraPreset` | `(preset) => CameraState` |
| **Input** | `setInputEnabled` | `(enabled) => void` |
| **Lifecycle** | `shutdown` | `() => void` |
| | `isRunning` | `() => boolean` |
| **Coordinate** | `worldToScreen` | `(worldPos) => {x, y}` |
| | `screenToWorld` | `(screenPos) => {x, y, z} \| null` |

##### Phase 7c: New Events (5 events)

**Implementation Location**: `src/events.ts` and `src/Node.ts`

| Event | Trigger Location | Event Data Interface |
|-------|------------------|---------------------|
| `node-click` | `Node.ts` mesh click handler | `{node: Node, data: AdHocData, event: PointerEvent}` |
| `node-hover` | `Node.ts` pointer enter | `{node: Node, data: AdHocData}` |
| `node-drag-start` | `Node.ts` drag behavior | `{node: Node, position: Vector3}` |
| `node-drag-end` | `Node.ts` drag behavior | `{node: Node, position: Vector3}` |
| `edge-click` | `Edge.ts` mesh click handler | `{edge: Edge, data: AdHocData, event: PointerEvent}` |

##### Phase 7d: Extension API Consistency (2 static methods)

| Class | Method to Add | Implementation |
|-------|---------------|----------------|
| `Algorithm` | `getRegisteredTypes()` | Return `Array.from(registry.keys())` |
| `DataSource` | `getRegisteredTypes()` | Return `Array.from(registry.keys())` |

---

#### 7.8 Implementation Pattern

All web component methods follow this delegation pattern:

```typescript
/**
 * [Description of method]
 *
 * @param paramName - Description
 * @returns Description
 * @since 1.5.0
 *
 * @example
 * ```typescript
 * // Example usage
 * ```
 */
methodName(param: ParamType): ReturnType {
    return this.#graph.methodName(param);
}
```

#### 7.9 Required Imports for graphty-element.ts

```typescript
import type {Node} from "./Node";
import type {Edge} from "./Edge";
import type {StyleManager} from "./managers/StyleManager";
import type {Styles} from "./Styles";
import type {QueueableOptions, RunAlgorithmOptions} from "./utils/queue-migration";
import type {ApplySuggestedStylesOptions, SuggestedStylesConfig, StyleSchema} from "./config";
```

---

**Dependencies**:
- Internal: None (can be done in parallel with Phases 1-6)

**Verification**:
1. Run: `npm test -- test/graphty-element/api-parity.test.ts`
2. Expected: All method existence tests pass
3. Run: `npm run build`
4. Expected: No TypeScript errors
5. Run: `npm run docs:api`
6. Expected: TypeDoc generates docs for all 46 new methods
7. Run: `npm run lint`
8. Expected: No new lint errors

---

### Phase 8: JSDoc Enforcement (Final)

**Objective**: Promote all JSDoc rules from warnings to errors and fix all remaining lint issues. This ensures documentation quality is enforced in CI and prevents documentation regressions.

**Prerequisites**: Phase 6 must be complete (all public APIs documented)

**Tests to Write First**:
- No new test files needed - ESLint errors will be caught by existing `npm run lint`

**Implementation**:

1. `eslint.config.js` - Update JSDoc plugin configuration to use error level:
   ```typescript
   // Change from jsdoc.configs["flat/recommended-typescript"] to error variant
   jsdoc.configs["flat/recommended-typescript-error"],

   // Update custom rules from 'warn' to 'error':
   {
       plugins: {
           jsdoc,
       },
       rules: {
           // Promote to errors for CI enforcement
           "jsdoc/require-description": "error",
           "jsdoc/require-param-description": "error",
           "jsdoc/require-returns-description": "error",
           "jsdoc/no-types": "error", // TypeScript handles types
           "jsdoc/check-tag-names": ["error", {
               definedTags: ["since", "internal"],
           }],
           // Enable require-jsdoc for public APIs
           "jsdoc/require-jsdoc": ["error", {
               publicOnly: true,
               require: {
                   FunctionDeclaration: true,
                   MethodDefinition: true,
                   ClassDeclaration: true,
               },
           }],
       },
   },
   ```

2. Fix all remaining JSDoc lint errors across the codebase:
   - Add missing `@param` descriptions
   - Add missing `@returns` descriptions
   - Add missing method descriptions
   - Fix tag formatting issues (tag-lines, check-alignment)
   - Add `@internal` tag to private/internal APIs that should be excluded

3. Run lint and fix iteratively:
   ```bash
   npm run lint 2>&1 | head -100  # Review errors
   npm run lint -- --fix          # Auto-fix what's possible
   # Manually fix remaining issues
   ```

**Files Likely Requiring Updates**:
- `src/Graph.ts` - Main API surface
- `src/graphty-element.ts` - Web Component API
- `src/Edge.ts`, `src/Node.ts` - Graph element classes
- `src/ai/**/*.ts` - AI-related classes
- `src/managers/**/*.ts` - Manager classes
- `src/utils/**/*.ts` - Utility functions

**Dependencies**:
- Internal: Phase 6 (all public APIs should already be documented)
- External: None

**Verification**:
1. Run: `npm run lint`
2. Expected: 0 errors, 0 warnings (clean lint output)
3. Run: `npm run build`
4. Expected: Build succeeds
5. Run: `npm test`
6. Expected: All tests pass
7. Run: `npm run docs:api`
8. Expected: TypeDoc generates complete documentation

**Notes**:
- The `publicOnly: true` option ensures only exported/public APIs require JSDoc
- Internal helper functions can use `@internal` tag to be excluded from requirements
- Test files remain exempt from JSDoc requirements

---

## Appendix: Implementation Code Examples

This appendix provides copy-paste ready implementations with JSDoc documentation for each method category. These expand on the method signatures in Section 7.7.

### A.1 Selection API (4 methods)

```typescript
// ============================================================================
// SELECTION API
// ============================================================================

/**
 * Select a node by its ID.
 * If another node is currently selected, it will be deselected first.
 *
 * @param nodeId - The ID of the node to select
 * @returns True if the node was found and selected, false if not found
 * @since 1.5.0
 *
 * @example
 * ```typescript
 * const element = document.querySelector('graphty-element');
 * element.selectNode('node-123');
 * console.log(element.getSelectedNode()?.id); // 'node-123'
 * ```
 */
selectNode(nodeId: string | number): boolean {
    return this.#graph.selectNode(nodeId);
}

/**
 * Deselect the currently selected node.
 * If no node is selected, this is a no-op.
 *
 * @since 1.5.0
 *
 * @example
 * ```typescript
 * element.selectNode('node-123');
 * element.deselectNode();
 * console.log(element.getSelectedNode()); // null
 * ```
 */
deselectNode(): void {
    this.#graph.deselectNode();
}

/**
 * Get the currently selected node.
 *
 * @returns The selected Node instance, or null if nothing is selected
 * @since 1.5.0
 *
 * @example
 * ```typescript
 * const selected = element.getSelectedNode();
 * if (selected) {
 *     console.log(`Selected: ${selected.id}`, selected.data);
 * }
 * ```
 */
getSelectedNode(): import("./Node").Node | null {
    return this.#graph.getSelectedNode();
}

/**
 * Check if a specific node is currently selected.
 *
 * @param nodeId - The ID of the node to check
 * @returns True if the node is selected, false otherwise
 * @since 1.5.0
 *
 * @example
 * ```typescript
 * if (element.isNodeSelected('node-123')) {
 *     console.log('Node 123 is selected');
 * }
 * ```
 */
isNodeSelected(nodeId: string | number): boolean {
    return this.#graph.isNodeSelected(nodeId);
}
```

### A.2 Utility Methods (4 methods)

```typescript
// ============================================================================
// UTILITY METHODS
// ============================================================================

/**
 * Zoom the camera to fit all nodes in view.
 *
 * @remarks
 * This operation executes immediately and triggers a camera animation
 * to frame all visible nodes.
 *
 * @since 1.5.0
 *
 * @example
 * ```typescript
 * // After loading data, zoom to see everything
 * element.nodeData = largeDataset;
 * await element.waitForSettled();
 * element.zoomToFit();
 * ```
 */
zoomToFit(): void {
    this.#graph.zoomToFit();
}

/**
 * Wait for the graph layout to settle.
 *
 * @remarks
 * Force-directed layouts like ngraph take time to stabilize.
 * This method returns a Promise that resolves when the layout
 * algorithm reports it has settled (node positions are stable).
 *
 * @returns Promise that resolves when layout is settled
 * @since 1.5.0
 *
 * @example
 * ```typescript
 * element.nodeData = myNodes;
 * element.edgeData = myEdges;
 * await element.waitForSettled();
 * console.log('Layout complete!');
 * element.zoomToFit();
 * ```
 */
async waitForSettled(): Promise<void> {
    return this.#graph.waitForSettled();
}

/**
 * Get the number of nodes currently in the graph.
 *
 * @returns The node count
 * @since 1.5.0
 *
 * @example
 * ```typescript
 * console.log(`Graph has ${element.getNodeCount()} nodes`);
 * ```
 */
getNodeCount(): number {
    return this.#graph.getNodeCount();
}

/**
 * Get the number of edges currently in the graph.
 *
 * @returns The edge count
 * @since 1.5.0
 *
 * @example
 * ```typescript
 * console.log(`Graph has ${element.getEdgeCount()} edges`);
 * ```
 */
getEdgeCount(): number {
    return this.#graph.getEdgeCount();
}
```

### A.3 Algorithm Methods (3 methods)

```typescript
// ============================================================================
// ALGORITHM METHODS
// ============================================================================

/**
 * Run a graph algorithm on the current graph data.
 *
 * @remarks
 * Algorithms are identified by namespace and type (e.g., "graphty:degree").
 * Results are stored on node/edge `algorithmResults` property and can be
 * used in style selectors.
 *
 * @param namespace - Algorithm namespace (e.g., "graphty", "centrality")
 * @param type - Algorithm type (e.g., "degree", "betweenness", "pagerank")
 * @param options - Optional algorithm configuration
 * @returns Promise that resolves when algorithm completes
 * @since 1.5.0
 *
 * @example
 * ```typescript
 * // Run degree centrality algorithm
 * await element.runAlgorithm('graphty', 'degree');
 *
 * // Run with options and apply suggested styles
 * await element.runAlgorithm('graphty', 'pagerank', {
 *     algorithmOptions: { damping: 0.85 },
 *     applySuggestedStyles: true
 * });
 * ```
 */
async runAlgorithm(
    namespace: string,
    type: string,
    options?: import("./utils/queue-migration").RunAlgorithmOptions
): Promise<void> {
    return this.#graph.runAlgorithm(namespace, type, options);
}

/**
 * Apply suggested styles from an algorithm.
 *
 * @remarks
 * Many algorithms provide suggested style layers that visualize their
 * results (e.g., node size based on degree centrality). This method
 * adds those style layers to the graph.
 *
 * @param algorithmKey - Algorithm key (e.g., "graphty:degree") or array of keys
 * @param options - Options for how to apply the styles
 * @returns True if any styles were applied, false otherwise
 * @since 1.5.0
 *
 * @example
 * ```typescript
 * // Run algorithm then apply its suggested styles
 * await element.runAlgorithm('graphty', 'degree');
 * element.applySuggestedStyles('graphty:degree');
 *
 * // Apply multiple algorithm styles
 * element.applySuggestedStyles(['graphty:degree', 'graphty:betweenness']);
 * ```
 */
applySuggestedStyles(
    algorithmKey: string | string[],
    options?: import("./config").ApplySuggestedStylesOptions
): boolean {
    return this.#graph.applySuggestedStyles(algorithmKey, options);
}

/**
 * Get suggested styles for an algorithm without applying them.
 *
 * @remarks
 * Useful for previewing or customizing algorithm styles before applying.
 *
 * @param algorithmKey - Algorithm key (e.g., "graphty:degree")
 * @returns Suggested styles configuration, or null if none exist
 * @since 1.5.0
 *
 * @example
 * ```typescript
 * const styles = element.getSuggestedStyles('graphty:degree');
 * if (styles) {
 *     console.log('Available style layers:', styles.layers.length);
 * }
 * ```
 */
getSuggestedStyles(
    algorithmKey: string
): import("./config").SuggestedStylesConfig | null {
    return this.#graph.getSuggestedStyles(algorithmKey);
}
```

### A.4 Batch Operations (1 method)

```typescript
// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Execute multiple operations as a batch.
 *
 * @remarks
 * Operations within a batch are queued and executed in dependency order.
 * This is more efficient than individual calls and ensures proper
 * sequencing (e.g., style template before data, layout before algorithms).
 *
 * @param fn - Function containing operations to batch
 * @returns Promise that resolves when all batched operations complete
 * @since 1.5.0
 *
 * @example
 * ```typescript
 * await element.batchOperations(async () => {
 *     element.styleTemplate = myStyleTemplate;
 *     element.nodeData = myNodes;
 *     element.edgeData = myEdges;
 *     element.layout = 'ngraph';
 *     await element.runAlgorithm('graphty', 'degree');
 * });
 * // All operations complete in correct order
 * ```
 */
async batchOperations(fn: () => Promise<void> | void): Promise<void> {
    return this.#graph.batchOperations(fn);
}
```

### A.5 Data Loading Methods (6 methods)

```typescript
// ============================================================================
// DATA LOADING METHODS
// ============================================================================

/**
 * Load graph data from a URL with auto-format detection.
 *
 * @remarks
 * Supported formats: JSON, GraphML, GEXF, CSV, GML, DOT, Pajek.
 * Format is auto-detected from file extension or content.
 *
 * @param url - URL to fetch graph data from
 * @param options - Loading options including format override and field paths
 * @returns Promise that resolves when data is loaded
 * @since 1.5.0
 *
 * @example
 * ```typescript
 * // Auto-detect format from extension
 * await element.loadFromUrl('https://example.com/graph.graphml');
 *
 * // Specify format explicitly
 * await element.loadFromUrl('https://example.com/data.txt', {
 *     format: 'graphml'
 * });
 *
 * // Custom field paths for JSON data
 * await element.loadFromUrl('https://api.example.com/network.json', {
 *     nodeIdPath: 'nodeId',
 *     edgeSrcIdPath: 'source',
 *     edgeDstIdPath: 'target'
 * });
 * ```
 */
async loadFromUrl(
    url: string,
    options?: {
        format?: string;
        nodeIdPath?: string;
        edgeSrcIdPath?: string;
        edgeDstIdPath?: string;
    }
): Promise<void> {
    return this.#graph.loadFromUrl(url, options);
}

/**
 * Load graph data from a File object with auto-format detection.
 *
 * @remarks
 * Useful for file upload inputs. Format is auto-detected from
 * filename extension and file content.
 *
 * @param file - File object from file input
 * @param options - Loading options
 * @returns Promise that resolves when data is loaded
 * @since 1.5.0
 *
 * @example
 * ```typescript
 * const input = document.querySelector('input[type="file"]');
 * input.addEventListener('change', async (e) => {
 *     const file = e.target.files[0];
 *     await element.loadFromFile(file);
 * });
 * ```
 */
async loadFromFile(
    file: File,
    options?: {
        format?: string;
        nodeIdPath?: string;
        edgeSrcIdPath?: string;
        edgeDstIdPath?: string;
    }
): Promise<void> {
    return this.#graph.loadFromFile(file, options);
}

/**
 * Add nodes to the graph incrementally.
 *
 * @remarks
 * This method ADDS nodes to the existing graph. It does not replace
 * existing nodes. For replacement, use the `nodeData` property.
 *
 * @param nodes - Array of node data objects to add
 * @param idPath - Key to use for node IDs (default: "id")
 * @param options - Queue options
 * @returns Promise that resolves when nodes are added
 * @since 1.5.0
 *
 * @example
 * ```typescript
 * // Add nodes incrementally
 * await element.addNodes([{id: '1', label: 'Node 1'}]);
 * await element.addNodes([{id: '2', label: 'Node 2'}]);
 * // Graph now has 2 nodes
 *
 * // Custom ID field
 * await element.addNodes([{nodeId: 'n1'}], 'nodeId');
 * ```
 */
async addNodes(
    nodes: Record<string | number, unknown>[],
    idPath?: string,
    options?: import("./utils/queue-migration").QueueableOptions
): Promise<void> {
    return this.#graph.addNodes(nodes, idPath, options);
}

/**
 * Add edges to the graph incrementally.
 *
 * @remarks
 * This method ADDS edges to the existing graph. Source and destination
 * nodes should already exist.
 *
 * @param edges - Array of edge data objects to add
 * @param srcIdPath - Key for source node ID (default: "source")
 * @param dstIdPath - Key for destination node ID (default: "target")
 * @param options - Queue options
 * @returns Promise that resolves when edges are added
 * @since 1.5.0
 *
 * @example
 * ```typescript
 * await element.addEdges([
 *     {source: '1', target: '2'},
 *     {source: '2', target: '3'}
 * ]);
 *
 * // Custom field names
 * await element.addEdges([{from: 'a', to: 'b'}], 'from', 'to');
 * ```
 */
async addEdges(
    edges: Record<string | number, unknown>[],
    srcIdPath?: string,
    dstIdPath?: string,
    options?: import("./utils/queue-migration").QueueableOptions
): Promise<void> {
    return this.#graph.addEdges(edges, srcIdPath, dstIdPath, options);
}

/**
 * Remove nodes from the graph by their IDs.
 *
 * @remarks
 * Also removes any edges connected to the removed nodes.
 * If a removed node was selected, the selection is cleared.
 *
 * @param nodeIds - Array of node IDs to remove
 * @param options - Queue options
 * @returns Promise that resolves when nodes are removed
 * @since 1.5.0
 *
 * @example
 * ```typescript
 * await element.removeNodes(['node-1', 'node-2']);
 * console.log(`Remaining nodes: ${element.getNodeCount()}`);
 * ```
 */
async removeNodes(
    nodeIds: (string | number)[],
    options?: import("./utils/queue-migration").QueueableOptions
): Promise<void> {
    return this.#graph.removeNodes(nodeIds, options);
}

/**
 * Update data properties on existing nodes.
 *
 * @remarks
 * Updates are merged with existing node data. Styles are
 * automatically recomputed after updates.
 *
 * @param updates - Array of update objects, each must include `id`
 * @param options - Queue options
 * @returns Promise that resolves when updates are applied
 * @since 1.5.0
 *
 * @example
 * ```typescript
 * await element.updateNodes([
 *     {id: 'node-1', label: 'Updated Label', size: 2.0},
 *     {id: 'node-2', category: 'important'}
 * ]);
 * ```
 */
async updateNodes(
    updates: {id: string | number; [key: string]: unknown}[],
    options?: import("./utils/queue-migration").QueueableOptions
): Promise<void> {
    return this.#graph.updateNodes(updates, options);
}
```

---

**Required Import Additions**:

Add to the top of `src/graphty-element.ts`:
```typescript
import type {Node} from "./Node";
import type {QueueableOptions, RunAlgorithmOptions} from "./utils/queue-migration";
import type {ApplySuggestedStylesOptions, SuggestedStylesConfig} from "./config";
```

---

**Dependencies**:
- Internal: None (can be done in parallel with other phases)

**Verification**:
1. Run: `npm test -- test/graphty-element/api-parity.test.ts`
2. Expected: All 16 methods exist on Graphty prototype
3. Run: `npm run build`
4. Expected: Build succeeds with no TypeScript errors
5. Run: `npm run docs:api`
6. Expected: TypeDoc generates documentation for all new methods
7. Manual: Test each method category in Storybook

---

## Common Utilities Needed

1. **JSDoc template snippets** - Standard JSDoc comment templates for consistency
2. **VitePress sidebar generator** - Script to auto-generate sidebar from TypeDoc output (optional enhancement)

## External Libraries Assessment

| Task | Library | Reason |
|------|---------|--------|
| JSDoc linting | `eslint-plugin-jsdoc` | Mature, TypeScript-aware, well-maintained |
| API doc generation | `typedoc` + `typedoc-plugin-markdown` | De facto standard for TypeScript projects |
| Documentation site | `vitepress` | Vite ecosystem alignment, fast, modern |

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| TypeDoc fails on complex types | Use `@internal` tag, test output early, simplify complex types if needed |
| VitePress/Storybook deployment conflict | Deploy to same domain with Storybook at `/storybook/` path |
| Documentation becomes stale | Auto-generation from source, CI builds on every merge |
| JSDoc enforcement breaks CI | Phase 5 uses `warn` level, Phase 8 upgrades to `error` after documentation is complete |
| Phase dependencies block progress | Phases 1-6 are sequential, but Phase 7 can run in parallel |

## Pre-requisite: Missing Exports

Before Phase 6 (JSDoc Enhancement), ensure the following APIs are exported from `index.ts`:

### Colorblind Simulation Utilities

Currently implemented in `src/utils/styleHelpers/accessibility/colorblindSimulation.ts` but not exported.

**Add to `index.ts`:**
```typescript
// =============================================================================
// Accessibility - Colorblind Simulation
// =============================================================================
export {
    areDistinguishableInGrayscale,
    colorDifference,
    isPaletteSafe,
    simulateDeuteranopia,
    simulateProtanopia,
    simulateTritanopia,
    toGrayscale,
} from "./src/utils/styleHelpers/accessibility/colorblindSimulation";
```

**Verification**:
```typescript
import { isPaletteSafe, simulateDeuteranopia } from '@graphty/graphty-element';
// Should work after export is added
```

---

## Summary

| Phase | Description | Dependencies | Key Deliverable |
|-------|-------------|--------------|-----------------|
| 1 | VitePress Setup | None | Working docs site with `npm run docs:dev` |
| 2 | TypeDoc Setup | Phase 1 | Auto-generated API reference |
| 3 | GitHub Pages Deploy | Phase 2 | Live documentation site |
| 4 | README Updates | Phase 3 | Streamlined README with badges |
| 5 | ESLint JSDoc Setup | Phase 4 | JSDoc linting enabled (warnings) |
| 6 | JSDoc Enhancement | Phase 5 | Comprehensive API documentation |
| 7 | API Parity | None | Web component feature parity |
| 8 | JSDoc Enforcement | Phase 6 | JSDoc errors enforced in CI |

**Critical Path**: Phases 1 → 2 → 3 → 4 → 5 → 6 → 8

**Parallel Track**: Phase 7 can start anytime and merge when complete

**Pre-requisite**: Export colorblind simulation utilities before Phase 6

**Note**: By starting with VitePress (Phase 1), you get immediate visual feedback with `npm run docs:dev`. ESLint JSDoc enforcement starts with warnings in Phase 5 to avoid breaking CI, and is promoted to errors in Phase 8 after all documentation is complete.
