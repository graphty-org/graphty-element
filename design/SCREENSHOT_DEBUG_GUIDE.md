# Screenshot Debugging Guide for Graphty Element

This guide demonstrates various approaches to capture screenshots for debugging graphty-element issues.

## Available Methods

### 1. **Vitest Browser Tests** (`screenshot-debug-example.test.ts`)

Uses Playwright integration in Vitest for automated screenshot testing:

```bash
npm run test:browser test/screenshot-debug-example.test.ts
```

Features:
- Captures DOM screenshots using Playwright's `page.screenshot()`
- Uses Babylon.js screenshot tools for 3D scene captures
- Supports visual regression testing
- Can capture animation sequences

### 2. **Interactive HTML Debug Page** (`debug-screenshot-example.html`)

A standalone HTML page for manual debugging:

```bash
npm run dev
# Open http://dev.ato.ms:9000/test/debug-screenshot-example.html
```

Features:
- Interactive buttons to capture different types of screenshots
- Real-time preview of captured images
- Debug overlay with performance metrics
- Animation sequence capture

### 3. **Playwright Automation Script** (`playwright-screenshot-debug.js`)

Node.js script for automated screenshot collection:

```bash
node test/playwright-screenshot-debug.js
```

Features:
- Automated browser control
- Captures multiple states and interactions
- Saves performance metrics
- Generates debug reports

## Screenshot Types

### Canvas Screenshots
Direct capture of the Babylon.js 3D canvas:

```javascript
const canvas = graph.getCanvas();
const dataUrl = canvas.toDataURL('image/png');
```

### Babylon.js Screenshots
High-quality scene captures with precision control:

```javascript
import { CreateScreenshotAsync } from '@babylonjs/core/Misc/screenshotTools';

const screenshot = await CreateScreenshotAsync(
    engine,
    camera,
    { width: 800, height: 600, precision: 2 }, // 2x resolution
    'image/png',
    1.0 // quality
);
```

### DOM Screenshots
Full element capture including HTML overlays:

```javascript
// In Playwright/Vitest
await page.locator('graphty-element').screenshot({
    path: 'screenshot.png'
});
```

## Common Debugging Scenarios

### 1. Capturing Layout Issues
```javascript
// Capture before and after layout change
await graph.getLayoutManager().setLayout('force-directed', options);
// Wait for layout to settle
await new Promise(resolve => setTimeout(resolve, 2000));
// Capture screenshot
```

### 2. Style Application Debugging
```javascript
// Apply test styles
graph.styles = debugStyles;
// Wait for render
await new Promise(resolve => requestAnimationFrame(resolve));
// Capture
```

### 3. Animation Debugging
```javascript
const frames = [];
for (let i = 0; i < 10; i++) {
    await new Promise(resolve => setTimeout(resolve, 100));
    frames.push(await captureScreenshot());
}
```

### 4. Performance Analysis
```javascript
// Add debug overlay with metrics
const metrics = {
    fps: graph.getStatsManager().fps,
    nodes: graph.getDataManager().nodes.size,
    edges: graph.getDataManager().edges.size
};
// Capture with overlay
```

## Server Constraints

When running on `dev.ato.ms`:
- Use ports 9000-9099 only
- Replace `localhost` with `dev.ato.ms` in URLs
- Storybook runs on port 9025

## Directory Structure

Screenshots are saved to:
```
test/
├── debug-screenshots/     # Manual debug captures
├── __screenshots__/       # Vitest test snapshots
└── screenshots/           # General screenshots
```

## Tips

1. **Consistent Sizing**: Always set explicit container dimensions for reproducible screenshots
2. **Wait for Stability**: Use `graph.getLayoutManager().isSettled` to ensure layout is complete
3. **High Resolution**: Use `precision: 2` in Babylon.js screenshots for better quality
4. **Debug Info**: Include timestamps and metrics in filenames or metadata
5. **Automation**: Use the Playwright script for systematic debugging across multiple scenarios

## Example: Quick Debug Session

```javascript
// 1. Create a test instance
const container = document.createElement('div');
container.style.width = '800px';
container.style.height = '600px';
document.body.appendChild(container);

const graph = new Graph(container);
await graph.init();

// 2. Load test data
graph.getDataManager().addNodes([/* test nodes */]);
graph.getDataManager().addEdges([/* test edges */]);

// 3. Apply problematic configuration
await graph.getLayoutManager().setLayout('force-directed', {
    // Configuration that causes issues
});

// 4. Capture screenshot
const { CreateScreenshot } = await import('@babylonjs/core/Misc/screenshotTools');
CreateScreenshot(
    graph.getEngine(),
    graph.getCamera(),
    800,
    (dataUrl) => {
        // Save or display screenshot
        console.log('Screenshot captured:', dataUrl);
    }
);
```

This guide provides multiple approaches to screenshot debugging, from automated testing to manual inspection, suitable for different debugging scenarios.