# Interaction Testing Plan for Graphty Element

## Executive Summary

This document outlines a comprehensive interaction testing strategy for graphty-element, a Canvas-based 3D/2D graph visualization Web Component built with Babylon.js. After analyzing multiple frameworks and approaches, **I recommend adopting Babylon.js's two-tier testing strategy** using:

1. **Unit-level testing** with a mock device input system for fast, isolated interaction tests
2. **Integration-level testing** with Playwright for real browser interaction validation

This approach provides the best balance of test speed, reliability, and coverage for Canvas-based applications.

## Table of Contents

1. [Framework Evaluation](#framework-evaluation)
2. [Recommended Approach](#recommended-approach)
3. [Implementation Plan](#implementation-plan)
4. [Test Scenarios](#test-scenarios)
5. [Technical Architecture](#technical-architecture)
6. [Headless Server Considerations](#headless-server-considerations)
7. [Timeline and Phases](#timeline-and-phases)

## Framework Evaluation

### Comparison of Testing Frameworks

| Framework | Canvas Support | Touch Gestures | Performance | Browser Support | Learning Curve |
|-----------|---------------|----------------|-------------|-----------------|----------------|
| **Playwright + CDP** | Excellent | Good (via CDP) | Fast (4.5s avg) | All major | Medium |
| Cypress | Limited | Basic only | Slower (9.4s avg) | Chrome/Firefox/Edge | Easy |
| Puppeteer | Good | Good (via CDP) | Fast (4.8s avg) | Chrome only | Medium |
| TestCafe | Basic | Limited | Medium | All major | Easy |
| Custom Mock System | Excellent | Excellent | Fastest (<1s) | N/A (unit tests) | High |

### Framework Strengths and Use Cases

#### **Playwright (Recommended for Integration Tests)**
**Pros:**
- Best performance among browser automation tools
- Chrome DevTools Protocol (CDP) access for touch gestures
- Multi-browser support (critical for Canvas rendering differences)
- Active development and growing adoption
- Excellent debugging tools (trace viewer, video recording)

**Cons:**
- Touch events require CDP workarounds
- Steeper learning curve than Cypress
- CDP features only work with Chromium

**Best for:** Integration tests, visual regression, cross-browser validation

#### **Mock Device System (Recommended for Unit Tests)**
**Pros:**
- Fastest test execution (no browser overhead)
- Complete control over input simulation
- Can test edge cases easily
- No flakiness from browser timing
- Works in any environment

**Cons:**
- Requires initial development effort
- Won't catch browser-specific issues
- No visual validation

**Best for:** Core interaction logic, gesture detection, input handling

#### **Cypress (Not Recommended)**
**Pros:**
- Easier to learn and use
- Good documentation
- Built-in test runner UI

**Cons:**
- Limited Canvas support (coordinate clicking only)
- No multi-touch support
- Slower performance
- No CDP access

**Best for:** Simple click interactions only

### Examples from Other Canvas-Based Projects

1. **Babylon.js**: Two-tier approach with TestDeviceInputSystem + Playwright
2. **Three.js**: Jest with mock canvas + manual testing
3. **Pixi.js**: Custom "floss" framework + visual regression with canvas-visual-bugs-testbed
4. **Konva.js**: Mocha + browser-based test runner
5. **MapboxGL**: Unit tests with mock canvas + Playwright for integration

## Recommended Approach

### Two-Tier Testing Strategy

Based on extensive research and Babylon.js's proven approach, I recommend:

#### **Tier 1: Unit Tests with Mock Device System**
- Create a `MockDeviceInputSystem` similar to Babylon.js's approach
- Test interaction logic without browser overhead
- Cover all input combinations and edge cases
- Run in milliseconds, not seconds

#### **Tier 2: Integration Tests with Playwright**
- Validate real browser behavior
- Test visual feedback and rendering
- Cross-browser validation
- Touch gestures via CDP

### Why This Approach?

1. **Speed**: Unit tests run in <100ms, integration tests only for critical paths
2. **Reliability**: Mock system eliminates browser flakiness
3. **Coverage**: Can test complex multi-touch scenarios easily
4. **Debugging**: Headless server compatible with clear test isolation
5. **Proven**: Successfully used by Babylon.js for years

## Implementation Plan

### Phase 1: Mock Device System (Week 1-2)

#### 1.1 Create Core Infrastructure

```typescript
// src/test/mock-device-input-system.ts
export interface MockDeviceInputSystem {
  // Device management
  connectDevice(deviceType: DeviceType, slot: number): void;
  disconnectDevice(deviceType: DeviceType, slot: number): void;
  
  // Input simulation
  simulateMouseMove(x: number, y: number): void;
  simulateMouseDown(button: MouseButton): void;
  simulateMouseUp(button: MouseButton): void;
  simulateMouseWheel(deltaY: number): void;
  
  // Touch simulation
  simulateTouchStart(touches: TouchPoint[]): void;
  simulateTouchMove(touches: TouchPoint[]): void;
  simulateTouchEnd(touchIds: number[]): void;
  
  // Keyboard simulation
  simulateKeyDown(key: string, modifiers?: KeyModifiers): void;
  simulateKeyUp(key: string): void;
  
  // State queries
  getPointerPosition(): { x: number; y: number };
  isPointerDown(button: MouseButton): boolean;
  getActiveTouches(): TouchPoint[];
}
```

#### 1.2 Integration with Graph Class

```typescript
// Modify Graph class to accept input system
export class Graph {
  constructor(config: GraphConfig, inputSystem?: IInputSystem) {
    this.inputSystem = inputSystem || new BabylonInputSystem();
  }
}
```

### Phase 2: Unit Test Implementation (Week 2-3)

#### 2.1 Node Dragging Tests

```typescript
// test/interactions/node-drag.test.ts
import { test, expect } from 'vitest';
import { Graph } from '../../src/graph/graph';
import { MockDeviceInputSystem } from '../mock-device-input-system';

test('respects pinOnDrag setting', async () => {
  const mockInput = new MockDeviceInputSystem();
  const graph = new Graph({ pinOnDrag: true }, mockInput);
  
  // Add test node
  const nodeId = 'test-node';
  graph.addNode({ id: nodeId, x: 0, y: 0, z: 0 });
  
  // Simulate drag
  mockInput.simulateMouseMove(0, 0);
  mockInput.simulateMouseDown('left');
  mockInput.simulateMouseMove(100, 100);
  mockInput.simulateMouseUp('left');
  
  // Verify node is pinned
  const node = graph.getNode(nodeId);
  expect(node.isPinned).toBe(true);
  expect(node.position).toEqual({ x: 100, y: 100, z: 0 });
});
```

#### 2.2 Camera Control Tests

```typescript
// test/interactions/camera-controls.test.ts
test('2D camera pan with mouse', async () => {
  const mockInput = new MockDeviceInputSystem();
  const graph = new Graph({ cameraType: '2d' }, mockInput);
  
  const initialPosition = graph.camera.position.clone();
  
  // Simulate pan
  mockInput.simulateMouseMove(100, 100);
  mockInput.simulateMouseDown('right'); // Right-click pan
  mockInput.simulateMouseMove(200, 200);
  mockInput.simulateMouseUp('right');
  
  expect(graph.camera.position).not.toEqual(initialPosition);
});

test('3D camera zoom with wheel', async () => {
  const mockInput = new MockDeviceInputSystem();
  const graph = new Graph({ cameraType: '3d' }, mockInput);
  
  const initialRadius = graph.camera.radius;
  
  // Simulate zoom
  mockInput.simulateMouseWheel(-100); // Zoom in
  
  expect(graph.camera.radius).toBeLessThan(initialRadius);
});
```

#### 2.3 Touch Gesture Tests

```typescript
// test/interactions/touch-gestures.test.ts
test('pinch to zoom gesture', async () => {
  const mockInput = new MockDeviceInputSystem();
  const graph = new Graph({ cameraType: '3d' }, mockInput);
  
  const initialRadius = graph.camera.radius;
  
  // Simulate pinch
  mockInput.simulateTouchStart([
    { id: 0, x: 100, y: 100 },
    { id: 1, x: 200, y: 200 }
  ]);
  
  mockInput.simulateTouchMove([
    { id: 0, x: 50, y: 50 },   // Fingers moving closer
    { id: 1, x: 250, y: 250 }
  ]);
  
  mockInput.simulateTouchEnd([0, 1]);
  
  expect(graph.camera.radius).toBeGreaterThan(initialRadius); // Zoomed out
});
```

### Phase 3: Playwright Integration Tests (Week 3-4)

#### 3.1 Test Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './test/integration',
  projects: [
    {
      name: 'interaction',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--use-gl=swiftshader'] // Consistent rendering
        }
      }
    },
    {
      name: 'touch',
      use: {
        ...devices['iPhone 13'],
        hasTouch: true
      }
    }
  ],
  use: {
    baseURL: 'http://dev.ato.ms:9025', // Your Storybook server
    trace: 'on-first-retry',
    video: 'on-first-retry'
  }
});
```

#### 3.2 Integration Test Helpers

```typescript
// test/integration/helpers.ts
export async function setupGraphTest(page: Page, story: string) {
  await page.goto(`/?path=/story/${story}`);
  await page.waitForSelector('graphty-element');
  
  // Wait for graph to initialize
  await page.evaluate(() => {
    return new Promise(resolve => {
      const element = document.querySelector('graphty-element');
      if (element.graph) {
        resolve(true);
      } else {
        element.addEventListener('graph-ready', () => resolve(true));
      }
    });
  });
}

export async function simulatePinchGesture(page: Page, startDistance: number, endDistance: number) {
  const cdpSession = await page.context().newCDPSession(page);
  const centerX = 400, centerY = 300;
  
  // Calculate touch points
  const startOffset = startDistance / 2;
  const endOffset = endDistance / 2;
  
  // Start touches
  await cdpSession.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [
      { x: centerX - startOffset, y: centerY },
      { x: centerX + startOffset, y: centerY }
    ]
  });
  
  // Move touches
  await cdpSession.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [
      { x: centerX - endOffset, y: centerY },
      { x: centerX + endOffset, y: centerY }
    ]
  });
  
  // End touches
  await cdpSession.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: []
  });
}
```

#### 3.3 Real Browser Tests

```typescript
// test/integration/node-drag.test.ts
test('node dragging with visual feedback', async ({ page }) => {
  await setupGraphTest(page, 'interactions--draggable-nodes');
  
  // Get canvas bounds
  const canvas = page.locator('canvas');
  const bounds = await canvas.boundingBox();
  
  // Find node position (you'll need to expose this via the element API)
  const nodePosition = await page.evaluate(() => {
    const element = document.querySelector('graphty-element');
    const node = element.graph.getNode('node1');
    return element.graph.worldToScreen(node.position);
  });
  
  // Drag node
  await page.mouse.move(bounds.x + nodePosition.x, bounds.y + nodePosition.y);
  await page.mouse.down();
  await page.mouse.move(bounds.x + nodePosition.x + 100, bounds.y + nodePosition.y + 100, { steps: 10 });
  await page.mouse.up();
  
  // Verify node moved
  const newPosition = await page.evaluate(() => {
    const element = document.querySelector('graphty-element');
    const node = element.graph.getNode('node1');
    return node.position;
  });
  
  expect(newPosition.x).not.toBe(nodePosition.x);
});
```

## Test Scenarios

### Priority 1: Core Interactions

1. **Node Dragging**
   - Single node drag with pinOnDrag setting
   - Multi-node selection and drag
   - Drag constraints and boundaries
   - Drag performance with 1000+ nodes

2. **Camera Controls - 2D**
   - Pan with mouse (right-click/middle-click)
   - Pan with touch (single finger)
   - Zoom with wheel
   - Zoom with pinch gesture
   - Keyboard navigation (arrow keys)

3. **Camera Controls - 3D**
   - Orbit with mouse (left-click drag)
   - Pan with mouse (right-click drag)
   - Zoom with wheel
   - Multi-touch orbit and zoom
   - Reset camera position

### Priority 2: Advanced Interactions

1. **Selection**
   - Click to select node/edge
   - Box selection (drag to select)
   - Multi-select with Ctrl/Cmd
   - Deselect on background click

2. **Hover Effects**
   - Node hover highlighting
   - Edge hover highlighting
   - Tooltip display on hover
   - Performance with many hoverable elements

3. **Context Menus**
   - Right-click on node
   - Right-click on edge
   - Right-click on background
   - Touch long-press for context menu

### Priority 3: Future Features

1. **Click to Expand**
   - Expand/collapse node clusters
   - Animated transitions
   - State persistence

2. **WebXR Support**
   - Controller ray casting
   - Hand tracking gestures
   - Spatial UI interactions

## Technical Architecture

### Input System Interface

```typescript
// src/graph/input/input-system.interface.ts
export interface IInputSystem {
  // Observable events
  onPointerMove: Observable<PointerInfo>;
  onPointerDown: Observable<PointerInfo>;
  onPointerUp: Observable<PointerInfo>;
  onPointerWheel: Observable<WheelInfo>;
  
  // Touch events
  onTouchStart: Observable<TouchInfo>;
  onTouchMove: Observable<TouchInfo>;
  onTouchEnd: Observable<TouchInfo>;
  
  // Keyboard events
  onKeyDown: Observable<KeyboardInfo>;
  onKeyUp: Observable<KeyboardInfo>;
  
  // Utility methods
  getPointerPosition(): Vector2;
  isPointerLocked(): boolean;
}
```

### Test Data Management

```typescript
// test/fixtures/interaction-scenarios.ts
export const InteractionScenarios = {
  smallGraph: {
    nodes: 10,
    edges: 15,
    layout: 'force'
  },
  largeGraph: {
    nodes: 1000,
    edges: 2000,
    layout: 'circular'
  },
  clusteredGraph: {
    nodes: 100,
    edges: 150,
    clusters: 5,
    layout: 'hierarchical'
  }
};
```

## Headless Server Considerations

### Development Workflow

1. **Local HTTP Server for Testing**
   ```bash
   # Run on port 9050 (within allowed range)
   npm run test:server -- --port 9050
   ```

2. **Remote Browser Connection**
   - Access tests at `http://dev.ato.ms:9050`
   - Use browser DevTools for debugging
   - Playwright trace viewer for test replay

3. **CI/CD Integration**
   ```yaml
   # .github/workflows/interaction-tests.yml
   - name: Run interaction tests
     run: |
       npm run test:interaction:unit  # Fast unit tests
       npm run test:interaction:integration -- --headed=false
   ```

### Debugging Strategies

1. **Visual Debugging**
   ```typescript
   // Save screenshots during test failures
   test.afterEach(async ({ page }, testInfo) => {
     if (testInfo.status !== 'passed') {
       await page.screenshot({ 
         path: `test-results/${testInfo.title}-failure.png` 
       });
     }
   });
   ```

2. **Trace Recording**
   ```typescript
   // Enable traces for debugging
   await page.context().tracing.start({ 
     screenshots: true, 
     snapshots: true 
   });
   ```

3. **Remote Debugging**
   ```bash
   # Start Playwright with remote debugging
   PWDEBUG=1 npm run test:interaction
   ```

## Timeline and Phases

### Phase 1: Foundation (Weeks 1-2)
- [ ] Implement MockDeviceInputSystem
- [ ] Create input system interface
- [ ] Integrate with Graph class
- [ ] Set up test infrastructure

### Phase 2: Unit Tests (Weeks 2-3)
- [ ] Node dragging tests
- [ ] 2D camera control tests
- [ ] 3D camera control tests
- [ ] Touch gesture tests
- [ ] Keyboard navigation tests

### Phase 3: Integration Tests (Weeks 3-4)
- [ ] Playwright configuration
- [ ] CDP touch gesture helpers
- [ ] Visual regression tests
- [ ] Cross-browser validation
- [ ] Performance benchmarks

### Phase 4: Advanced Features (Week 5+)
- [ ] Selection system tests
- [ ] Hover interaction tests
- [ ] Context menu tests
- [ ] Expand/collapse tests
- [ ] WebXR preparation

## Success Metrics

1. **Test Coverage**: >80% of interaction code paths
2. **Test Speed**: Unit tests < 5s total, integration < 30s
3. **Reliability**: <1% flaky test rate
4. **Browser Coverage**: Chrome, Firefox, Safari, Edge
5. **Device Coverage**: Desktop, tablet, mobile touch

## Conclusion

The recommended two-tier approach combining a mock device system for unit tests with Playwright for integration tests provides the optimal balance of speed, reliability, and coverage for testing Canvas-based interactions in graphty-element. This approach is proven by Babylon.js and addresses all the specific requirements including headless server constraints and complex touch gesture testing.

The phased implementation plan allows for incremental progress while maintaining a working test suite throughout development. The architecture is extensible for future features like WebXR support and provides excellent debugging capabilities for the headless server environment.