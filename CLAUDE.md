# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Graphty is a Web Component library for 3D/2D graph visualization built with:

- **TypeScript** (ES2022, strict mode)
- **Lit** (Web Components framework)
- **Babylon.js** (3D rendering engine)
- **Vite** (build tool)

The main component `<graphty-element>` provides interactive graph visualizations with multiple layout algorithms and rich styling options.

## Essential Commands

### Development

```bash
npm install          # Install dependencies (also runs playwright install)
npm run dev         # Start Vite dev server
npm run storybook   # Start Storybook on port 9025
```

### Testing

```bash
npm test            # Run default Vitest tests
npm run test:visual # Run visual tests (sequential execution, ~5s per test)
npm run test:storybook # Run Storybook tests to see if functionality work
npm run test:all    # Run all tests (default + Storybook + Chromatic tests)
npm run coverage    # Run all tests with coverage
```

### Linting & Code Quality

```bash
npm run lint        # Run ESLint
npm run lint -- --fix # Run ESLint, fix auto-fixable errors
npm run lint:pkg    # Run knip (check unused dependencies/exports)
npm run lint:all    # Run both ESLint and knip
```

### Building

```bash
npm run build       # TypeScript + Vite build
npm run preview     # Preview production build
```

### Pre-commit Workflow

```bash
npm run ready:commit # Run lint, build, and test:all to prepare for commit
```

When preparing code for commit, you can ask Claude to "run ready:commit and fix
all errors" or "make it ready:commit". Claude will repeatedly run this command
and fix any lint, build, or test errors until everything passes. After
successfully completing, generate a commit comment for all current changes.

**IMPORTANT**: Never run `git commit` commands. The user will handle all git commits themselves.

## Architecture Overview

### Core Components

1. **graphty-element.ts** - Main Web Component entry point

   - Manages lifecycle and property bindings
   - Initializes Graph instance with configuration

2. **Graph.ts** - Central orchestrator

   - Integrates Babylon.js scene management
   - Coordinates nodes, edges, layouts, and styling
   - Manages render loop and performance tracking

3. **Node.ts / Edge.ts** - Graph elements

   - Node: 3D meshes with shapes, textures, drag behavior
   - Edge: GreasedLine rendering with arrow heads
   - Both use ChangeManager for reactive updates

4. **Layout System** - Plugin architecture

   - Abstract LayoutEngine base class
   - Registry pattern for dynamic layout registration
   - Implementations: Force-directed (D3/NGraph), Circular, Random, etc.

5. **Styling System** (Styles.ts)

   - CSS-like layer-based styling
   - JMESPath selectors for targeting elements
   - Cached computed styles for performance

6. **Data Sources** - Plugin system for data ingestion
   - Abstract DataSource with async generator pattern
   - Zod schema validation
   - Supports chunked loading for large graphs

### Key Design Patterns

- **Registry Pattern**: Used for layouts, data sources, and algorithms
- **Observable Pattern**: Event handling via graphObservable, nodeObservable, edgeObservable
- **Factory Pattern**: Node/Edge mesh creation
- **Plugin Architecture**: All major systems are extensible

### Performance Optimizations

- Mesh instancing via MeshCache
- Lazy ray updates for edge arrows
- Style caching
- Chunked data loading
- Render loop optimization with settled state detection

## Development Notes

- ESLint auto-fixes on save (VSCode configured)
- Commitizen enforces conventional commits
- Husky runs pre-commit hooks
- TypeScript strict mode is enabled
- Babylon.js is externalized in the build

### TypeScript Best Practices

- **NEVER** disable `@typescript-eslint/no-explicit-any` unless absolutely necessary
- When you encounter type issues, prefer:
  1. Creating proper type definitions
  2. Using type assertions with specific types (e.g., `as SpecificType`)
  3. Using generics or type parameters
  4. Creating type mappings or lookup types
- Only use `any` as a last resort when:
  - Interfacing with untyped third-party libraries
  - Dynamic property access that can't be properly typed
  - And even then, try to limit its scope as much as possible
- **DO NOT** use ESLint disable comments unless absolutely necessary

## Linting and Configuration Notes

- Try not to update eslint.config.js unless absolutely necessary
- **The config interface in src/config should be a stable interface. Try not to remove or change config settings. Adding settings is fine if absolutely necessary to support a new feature.**

## Testing Approach

The project uses Vitest with two test projects:

- **default**: General unit/integration tests
- **storybook**: Storybook-specific tests

Tests run in the browser using Playwright. Coverage reports are generated in the `coverage/` directory.

When you write unit tests with vitest, prefer `assert` over `expect`.

## Architectural Insights

- **graphty-element wrapper principle**: 
  - graphty-element is a light wrapper around Graph
  - All logic and functionality should be in Graph.ts

## Core Architectural Principles

- **Stateless Design**:
  - The Graph is stateless, APIs may be called in any order and are expected to operate the same regardless of the order they are called in

## Design Philosophy

- **Modularity and Extensibility**:
  - This code is intended to be modular and extensible
  - Features like cameras, meshes, layouts, and algorithms are intended to be extendible by users

## Development Best Practices

- Always create unit tests when you write new core functionality
- **Algorithm Registration**: All algorithm classes must auto-register at the end of their module file to ensure they work correctly in both production and test environments:
  ```typescript
  export class MyAlgorithm extends Algorithm {
      static namespace = "my-namespace";
      static type = "my-type";
      // ... implementation
  }

  // Auto-register this algorithm when the module is imported
  Algorithm.register(MyAlgorithm);
  ```
  This pattern ensures algorithms are automatically available when imported, preventing test isolation issues.

## Common Pitfalls

**Manager Pattern**: This codebase uses Manager classes to handle operations with side effects (caching, events, validation). Always use manager methods instead of directly manipulating managed data structures:
- ✅ `styleManager.addLayer(layer)` - correct: uses manager method
- ❌ `graph.styles.layers.push(layer)` - wrong: bypasses cache invalidation and event emission
- Applies to: StyleManager, DataManager, LayoutManager, AlgorithmManager, etc.

## Debugging with Screenshots

When debugging rendering issues, use these approaches to capture screenshots:

### 1. Playwright in Vitest Tests (Automated)
```typescript
import { test, expect } from "vitest";
import { page } from "@vitest/browser/context";

test("debug graph rendering", async () => {
  // Navigate to your component
  await page.goto("http://dev.ato.ms:9025"); // Storybook
  
  // Take screenshot
  await page.locator("graphty-element").screenshot({ 
    path: "debug-graph.png" 
  });
});
```

### 2. Babylon.js Built-in Tools (Canvas capture)
```typescript
import { CreateScreenshotAsync } from "@babylonjs/core";

// Inside your graph component
const screenshot = await CreateScreenshotAsync(
  this.engine, 
  this.camera, 
  { width: 1920, height: 1080 }
);
// screenshot is base64 data URL
```

### 3. Quick Node.js Script (Most flexible)
```javascript
// test/debug-screenshot.js
import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("http://dev.ato.ms:9025"); // Your Storybook

// Capture specific story
await page.locator('graphty-element').screenshot({ 
  path: 'debug.png' 
});

await browser.close();
```

Run with: `node test/debug-screenshot.js`

### 4. Interactive HTML Debug Page
```html
<!-- test/debug.html -->
<script type="module">
  import "../dist/graphty-element.js";
  
  document.querySelector('button').onclick = () => {
    const canvas = document.querySelector('canvas');
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      window.open(url); // Opens screenshot in new tab
    });
  };
</script>
```

### 5. Multi-Angle 3D Scene Capture (Recommended for 3D Debugging)
```bash
# Capture screenshots from multiple camera angles for debugging
npx tsx test/helpers/capture-3d-debug-screenshots.ts <story-id> [--axes]

# Examples:
npx tsx test/helpers/capture-3d-debug-screenshots.ts styles-edge--default
npx tsx test/helpers/capture-3d-debug-screenshots.ts styles-edge--default --axes
```

This script (`test/helpers/capture-3d-debug-screenshots.ts`):
- Captures 5 screenshots from different camera angles:
  - `start`: Initial camera position as configured in the story
  - `left`: Looking at origin from the left side
  - `top`: Looking down at origin from above
  - `top-left-1`: Halfway between top and left (closer to top)
  - `top-left-2`: Halfway between top and left (closer to left)
- Optional `--axes` flag enables BabylonJS AxesViewer (Red=X, Green=Y, Blue=Z)
- All screenshots saved in `tmp/` directory with timestamp
- Filenames include angle and timestamp: `screenshot-{angle}-{timestamp}.png`

**Usage recommendations:**
- **For CI/automated testing**: Use Playwright in Vitest
- **For runtime debugging**: Use Babylon.js screenshot tools
- **For quick manual checks**: Create a simple HTML page or Node script
- **For complex 3D debugging**: Use multi-angle capture script with Nanobanana MCP analysis

## Visual Test Notes

Visual tests run with sequential execution (`--workers=1`) to avoid resource contention issues. The generated test files are correct - the key is running them sequentially rather than in parallel. This is now the default behavior in all `npm run test:visual*` scripts.

Common warnings during visual tests:
- "Graph did not settle within 10 frames" - Normal for physics-based layouts (ngraph)
- "Failed to preload layout-3d--*" - Expected preload timeouts, tests will still pass

## Development Guidelines

- **URL Requirements**:
  - All URLs accessed by stories (e.g. data URLs) must be fully qualified, non-local URLs so that they work in Chromatic
  - When loading data in storybook stories, make sure to use absolute urls since relative urls will break chromatic

## Debugging and Testing Notes

- Do not increase playwright timeout times to try and address timeout issues. The timeout is probably due to another problem

## Edge Styling System

### Overview

The edge styling system supports comprehensive customization of edge appearance in 2D and 3D modes:

- **Line Types**: solid, dash, dot, star, diamond, dash-dot, sinewave, zigzag
- **Arrow Types**: normal, inverted, dot, diamond, box, vee, tee, half-open, crow, open-normal, open-diamond, open-dot, sphere, sphere-dot
- **Bezier Curves**: Smooth curved edges with automatic control point calculation
- **Opacity**: Full transparency control (0.0 - 1.0)

### Key Files

| File | Purpose |
|------|---------|
| `src/Edge.ts` | Edge class - manages edge instances and updates |
| `src/meshes/EdgeMesh.ts` | Edge mesh factory - creates line and arrow meshes |
| `src/meshes/CustomLineRenderer.ts` | Shader-based line rendering |
| `src/meshes/PatternedLineMesh.ts` | Patterned line rendering (dot, dash, etc.) |
| `src/meshes/FilledArrowRenderer.ts` | Filled arrow head rendering |
| `src/constants/meshConstants.ts` | Edge constants (widths, lengths, densities) |

### Edge Configuration

```typescript
// Example edge style configuration
const edgeStyle = {
  line: {
    type: "solid",     // Line pattern
    width: 0.5,        // Line width
    color: "#FFFFFF",  // Line color
    opacity: 1.0,      // Transparency (0-1)
    bezier: false,     // Enable curved edges
  },
  arrowHead: {
    type: "normal",    // Arrow head style
    size: 1.0,         // Size multiplier
    color: "#FF0000",  // Arrow color
    opacity: 1.0,      // Transparency (0-1)
  },
  arrowTail: {
    type: "none",      // Arrow tail style (same options as head)
  },
};
```

### Performance Considerations

- **Mesh Caching**: Solid lines in 3D mode use MeshCache for instancing
- **Bezier Curves**: Each bezier edge has unique geometry (not cached)
- **Patterned Lines**: Created per-edge (PatternedLineMesh)
- **Arrow Heads**: Individual meshes for fast position updates

### Testing Edge Styles

```bash
# Run edge-specific tests
npx vitest run test/edge-cases/EdgeCases.test.ts
npx vitest run test/meshes/BezierCurves.test.ts
npx vitest run test/performance/phase7-benchmarks.test.ts

# Run Storybook for visual inspection
npm run storybook
# Then navigate to: Styles > Edge
```

### Arrow Geometry System

The `ArrowGeometry` interface defines positioning behavior:

```typescript
interface ArrowGeometry {
  positioningMode: "center" | "tip";  // How arrow is positioned
  needsRotation: boolean;              // Whether mesh needs rotation
  positionOffset: number;              // Offset from surface point
  scaleFactor?: number;                // Optional size multiplier
}
```

Use `EdgeMesh.getArrowGeometry(arrowType)` to get metadata for any arrow type.

### Bezier Curve Implementation

Bezier curves use cubic Bezier interpolation with automatic control points:

1. Control points are calculated perpendicular to the edge direction
2. Point density scales with edge length (BEZIER_POINT_DENSITY constant)
3. Self-loops (source === destination) render as circular arcs
4. Short edges (< 0.01 units) are treated as self-loops

## Debugging Tools

### Capturing Layout Positions

When you need to capture the settled positions from a layout engine (useful for creating fixed layout data):

```bash
npx tsx scripts/capture-with-actual-engine.ts
```

This script (`scripts/capture-with-actual-engine.ts`):
- Uses the actual NGraphEngine implementation (not a recreation)
- Runs with the same configuration as stories (seed: 42, dim: 3)
- Captures node positions when the engine reports it has settled
- Outputs to `test/helpers/cat-social-network-2-fixed-positions-actual-engine.json`

Use cases:
- Creating pre-calculated positions for performance testing
- Ensuring consistent layouts across different stories
- Debugging layout settling behavior
- Creating fixed position datasets from force-directed layouts

To use the captured positions:
1. Run the script to generate the positions file
2. Copy the output file to your desired location (e.g., `cp test/helpers/cat-social-network-2-fixed-positions-actual-engine.json test/helpers/my-fixed-positions.json`)
3. Use the fixed layout type in your story/test with the generated data
```
- use ./tmp for any temporary images, screenshots, debugging files, debugging scripts, etc.
- do not create __screenshots__ directories under ./test unless you intend for them to be committed
- check and see if storybook is running on port 9025 before starting storybook on a new port
- do not attempt to use nanobanana confirm whether elements of the scene are correct -- the 3D nature of our scenes makes it difficult to determine the positioning, overlapping, or other aspects of the scene. ask the user to provide the final visual verification of scenes.
