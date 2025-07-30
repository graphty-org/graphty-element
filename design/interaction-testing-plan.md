# Interaction Testing Plan for Graphty Element

## Executive Summary

This document outlines a comprehensive interaction testing strategy for graphty-element, based on the actual input handling implementations found in the codebase. After analyzing the existing code, we will test the following implemented features:

1. **Node interactions** via Babylon.js behaviors (dragging, double-click expansion)
2. **2D camera controls** (mouse pan/zoom, keyboard WASD/arrows/+−/QE, touch gestures)
3. **3D camera controls** (mouse orbit, keyboard arrows/WS/AD, touch pinch/rotate)
4. **Canvas focus management** and input system architecture

## Existing Input Implementations

### 1. Node Interactions (`src/NodeBehavior.ts`)
- **Drag Behavior**: 
  - Uses `SixDofDragBehavior` for 3D dragging
  - `pinOnDrag` option (default: true)
  - Drag start/end observable events
  - Position synchronization with layout engine
- **Double-click Expansion**:
  - Uses `ActionManager.OnDoublePickTrigger`
  - Fetches and displays connected nodes (if fetchNodes/fetchEdges provided)

### 2. 2D Camera Controls
**Files**: `src/cameras/TwoDInputController.ts`, `src/cameras/TwoDCameraController.ts`
- **Mouse**:
  - Left button drag: Pan camera
  - Wheel: Zoom (configurable speed)
- **Keyboard** (velocity-based with inertia):
  - `W`/`ArrowUp`: Pan up
  - `S`/`ArrowDown`: Pan down
  - `A`/`ArrowLeft`: Pan left
  - `D`/`ArrowRight`: Pan right
  - `+`/`=`: Zoom in
  - `-`/`_`: Zoom out
  - `Q`: Rotate counter-clockwise
  - `E`: Rotate clockwise
- **Touch** (via Hammer.js):
  - Single finger: Pan
  - Pinch: Zoom
  - Two-finger rotate: Rotate view

### 3. 3D Camera Controls  
**Files**: `src/cameras/OrbitInputController.ts`, `src/cameras/OrbitCameraController.ts`
- **Mouse**:
  - Left button drag: Orbit camera
  - Pointer down focuses canvas
- **Keyboard** (with inertia damping):
  - `ArrowLeft`/`ArrowRight`: Rotate horizontally
  - `ArrowUp`/`ArrowDown`: Rotate vertically
  - `W`: Zoom in
  - `S`: Zoom out
  - `A`: Yaw left
  - `D`: Yaw right
- **Touch** (via Hammer.js):
  - Pinch: Zoom
  - Two-finger rotate: Yaw

### 4. Input System Architecture
**Files**: `src/graph/input/babylon-input-system.ts`, `src/graph/input/input-system.interface.ts`
- Observable-based event system
- Pointer, wheel, keyboard, touch event handling
- Device type detection (mouse vs touch)
- Already includes mock system (`src/test/mock-device-input-system.ts`)

### 5. Canvas Configuration (`src/Graph.ts`)
- `touch-action: none` - Prevents default touch behaviors
- `tabindex="0"` - Makes canvas focusable
- `autofocus="true"` - Auto-focuses for keyboard input

### 6. XR/VR Support (`src/xr-button.ts`)
- WebXR integration with VR/AR buttons
- Teleportation disabled for graph interaction

## Test Scenarios (Based on Actual Features)

### Priority 1: Node Interactions

1. **Node Dragging (SixDofDragBehavior)**
   - Test drag start/end events fire correctly
   - Verify `pinOnDrag` setting works
   - Test position updates during drag
   - Verify physics pauses during drag
   - Test with multiple nodes (performance)

2. **Node Double-Click Expansion**
   - Test double-click triggers expansion
   - Verify fetchNodes/fetchEdges are called
   - Test new nodes/edges are added to graph
   - Verify expansion only works when fetch functions exist

### Priority 2: 2D Camera Controls

1. **Mouse Controls**
   - Left drag pans camera
   - Wheel zooms in/out
   - Test pan scale configuration
   - Test zoom speed configuration

2. **Keyboard Controls**
   - WASD/Arrow keys pan camera with velocity
   - +/- keys zoom
   - Q/E keys rotate view
   - Test acceleration and inertia
   - Verify keyboard state tracking

3. **Touch Gestures**
   - Single finger pan
   - Pinch to zoom
   - Two-finger rotation
   - Test gesture recognition via Hammer.js

### Priority 3: 3D Camera Controls

1. **Mouse Controls**
   - Left drag orbits camera
   - Test orbit sensitivity
   - Verify canvas gets focus on pointer down

2. **Keyboard Controls**
   - Arrow keys rotate with inertia
   - W/S zoom in/out
   - A/D yaw left/right
   - Test rotation velocity and damping

3. **Touch Gestures**
   - Pinch zoom with configurable sensitivity
   - Two-finger rotate for yaw
   - Test multi-touch state management

### Priority 4: Input System Integration

1. **Focus Management**
   - Canvas gains focus on interaction
   - Keyboard input only works when focused
   - Test tabindex functionality

2. **Input System Architecture**
   - BabylonInputSystem correctly converts events
   - Observable pattern works for all event types
   - Device type detection (mouse vs touch)
   - Mock system matches real system behavior

## Implementation Approach

### Use Existing Infrastructure

The project already has:
1. `MockDeviceInputSystem` implementation
2. `IInputSystem` interface
3. `BabylonInputSystem` for real input
4. Observable-based event system

### Testing Strategy

#### Unit Tests with MockDeviceInputSystem
- Test input handling logic in isolation
- Verify camera controllers respond correctly
- Test node behavior state changes
- No browser required, runs fast

#### Integration Tests with Playwright
- Test real browser input
- Verify Hammer.js touch gestures work
- Cross-browser validation
- Visual feedback verification

## Implementation Plan

### Phase 1: Unit Tests for Existing Features (Week 1)

#### 1.1 Node Behavior Tests
```typescript
// test/unit/node-behavior.test.ts
test('node dragging with pinOnDrag', async () => {
  const graph = new Graph(container, mockInput);
  const node = graph.addNode({ id: 'test-node', position: { x: 0, y: 0, z: 0 } });
  
  // Simulate drag via SixDofDragBehavior events
  node.meshDragBehavior.onDragStartObservable.notifyObservers({});
  node.meshDragBehavior.onPositionChangedObservable.notifyObservers({ 
    position: new Vector3(10, 10, 0) 
  });
  node.meshDragBehavior.onDragEndObservable.notifyObservers({});
  
  expect(node.dragging).toBe(false);
  expect(node.isPinned()).toBe(true);
});

test('double-click node expansion', async () => {
  const fetchNodes = jest.fn();
  const fetchEdges = jest.fn();
  const graph = new Graph(container, mockInput, { fetchNodes, fetchEdges });
  
  const node = graph.addNode({ id: 'test-node' });
  
  // Trigger double-click action
  node.mesh.actionManager._processTrigger(
    ActionManager.OnDoublePickTrigger,
    ActionEvent.CreateNew(node.mesh)
  );
  
  expect(fetchEdges).toHaveBeenCalledWith(node, graph);
  expect(fetchNodes).toHaveBeenCalled();
});
```

#### 1.2 2D Camera Controller Tests
```typescript
// test/unit/2d-camera-controls.test.ts
test('2D camera pan with mouse', async () => {
  const controller = new TwoDCameraController(scene, canvas, config);
  const inputController = new TwoDInputController(controller, canvas, config);
  
  const initialPos = controller.camera.position.clone();
  
  // Simulate mouse pan
  scene.onPointerObservable.notifyObservers({
    type: PointerEventTypes.POINTERDOWN,
    event: { clientX: 100, clientY: 100, buttons: 1 }
  });
  
  scene.onPointerObservable.notifyObservers({
    type: PointerEventTypes.POINTERMOVE,
    event: { clientX: 200, clientY: 200, buttons: 1 }
  });
  
  scene.onPointerObservable.notifyObservers({
    type: PointerEventTypes.POINTERUP
  });
  
  expect(controller.camera.position).not.toEqual(initialPos);
});

test('2D camera keyboard controls', async () => {
  const controller = new TwoDCameraController(scene, canvas, config);
  const inputController = new TwoDInputController(controller, canvas, config);
  
  // Simulate W key press
  inputController.keyState['w'] = true;
  inputController.applyKeyboardInertia();
  
  expect(controller.velocity.y).toBeGreaterThan(0);
});
```

#### 1.3 3D Camera Controller Tests
```typescript
// test/unit/3d-camera-controls.test.ts  
test('3D camera orbit with mouse', async () => {
  const controller = new OrbitCameraController(scene, canvas, config);
  const inputController = new OrbitInputController(canvas, controller);
  
  const initialAlpha = controller.camera.alpha;
  
  // Simulate mouse orbit
  inputController.pointerDownHandler({ clientX: 100, clientY: 100, button: 0 });
  inputController.pointerMoveHandler({ clientX: 200, clientY: 200 });
  inputController.pointerUpHandler();
  
  expect(controller.camera.alpha).not.toBe(initialAlpha);
});
```

### Phase 2: Integration Tests (Week 2)

#### 2.1 Real Browser Node Dragging
```typescript
// test/integration/node-drag.test.ts
test('drag node in real browser', async ({ page }) => {
  await page.goto('/?path=/story/interactions--draggable-nodes');
  
  // Wait for graph
  await page.waitForSelector('graphty-element');
  await page.waitForFunction(() => {
    const el = document.querySelector('graphty-element');
    return el?.graph?.initialized;
  });
  
  // Get node position
  const nodePos = await page.evaluate(() => {
    const graph = document.querySelector('graphty-element').graph;
    const node = graph.dataManager.nodes.get('node1');
    return graph.worldToScreen(node.mesh.position);
  });
  
  // Drag node
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  
  await page.mouse.move(box.x + nodePos.x, box.y + nodePos.y);
  await page.mouse.down();
  await page.mouse.move(box.x + nodePos.x + 100, box.y + nodePos.y + 100, { steps: 10 });
  await page.mouse.up();
  
  // Verify node moved and is pinned
  const result = await page.evaluate(() => {
    const graph = document.querySelector('graphty-element').graph;
    const node = graph.dataManager.nodes.get('node1');
    return {
      position: node.mesh.position,
      isPinned: !node.meshDragBehavior.enabled
    };
  });
  
  expect(result.isPinned).toBe(true);
});
```

#### 2.2 Touch Gesture Tests
```typescript
// test/integration/touch-gestures.test.ts
test('pinch to zoom in 2D mode', async ({ page, context }) => {
  // Use mobile viewport
  await context.setViewportSize({ width: 375, height: 812 });
  
  await page.goto('/?path=/story/camera--2d-touch-controls');
  
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  
  // Get initial zoom
  const initialZoom = await page.evaluate(() => {
    const graph = document.querySelector('graphty-element').graph;
    const cam = graph.cameraManager.camera;
    return cam.orthoTop - cam.orthoBottom;
  });
  
  // Simulate pinch via CDP
  const client = await page.context().newCDPSession(page);
  
  // Start touches
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [
      { x: centerX - 50, y: centerY, id: 0 },
      { x: centerX + 50, y: centerY, id: 1 }
    ]
  });
  
  // Pinch out
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [
      { x: centerX - 100, y: centerY, id: 0 },
      { x: centerX + 100, y: centerY, id: 1 }
    ]
  });
  
  // End touches
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: []
  });
  
  // Verify zoom changed
  const finalZoom = await page.evaluate(() => {
    const graph = document.querySelector('graphty-element').graph;
    const cam = graph.cameraManager.camera;
    return cam.orthoTop - cam.orthoBottom;
  });
  
  expect(finalZoom).toBeLessThan(initialZoom); // Zoomed in
});
```

## Test Data and Helpers

```typescript
// test/helpers/graph-helpers.ts
export async function waitForGraph(page: Page) {
  await page.waitForFunction(() => {
    const element = document.querySelector('graphty-element');
    return element?.graph?.initialized && element?.graph?.scene?.isReady();
  });
}

export async function getNodeScreenPosition(page: Page, nodeId: string) {
  return page.evaluate((id) => {
    const graph = document.querySelector('graphty-element').graph;
    const node = graph.dataManager.nodes.get(id);
    if (!node) return null;
    
    const worldPos = node.mesh.position;
    return graph.worldToScreen(worldPos);
  }, nodeId);
}

export async function getCameraState(page: Page) {
  return page.evaluate(() => {
    const graph = document.querySelector('graphty-element').graph;
    const cam = graph.cameraManager.camera;
    
    if (cam.orthoTop !== undefined) {
      // 2D camera
      return {
        type: '2d',
        position: { x: cam.position.x, y: cam.position.y },
        zoom: cam.orthoTop - cam.orthoBottom,
        rotation: cam.parent.rotation.z
      };
    } else {
      // 3D camera
      return {
        type: '3d',
        alpha: cam.alpha,
        beta: cam.beta,
        radius: cam.radius,
        target: { x: cam.target.x, y: cam.target.y, z: cam.target.z }
      };
    }
  });
}
```

## Success Metrics

1. **Coverage**: Test all implemented input methods
2. **Reliability**: No flaky tests due to proper wait conditions
3. **Performance**: Unit tests < 100ms each, integration < 2s each
4. **Maintainability**: Tests reflect actual implementation, not hypothetical features

## Future Enhancements for Camera Control Testing

### Current Limitation
The existing camera control tests verify internal state changes (position, velocity) but cannot visually confirm camera movement because tests run on empty scenes. Without visible content, it's impossible to visually verify that:
- The camera moved in the correct direction
- The movement amount is appropriate
- The visual result matches expectations

### Potential Enhancement Options

#### Option 1: Add Reference Objects
Add visible nodes/objects to the scene so camera movement can be visually verified:

```typescript
beforeEach(async() => {
    graph = await createTestGraph();
    
    // Add reference objects at known positions for visual verification
    const dataManager = graph.getDataManager();
    dataManager.addNode({id: "ref1", label: "North", x: 0, y: 10});
    dataManager.addNode({id: "ref2", label: "South", x: 0, y: -10});
    dataManager.addNode({id: "ref3", label: "East", x: 10, y: 0});
    dataManager.addNode({id: "ref4", label: "West", x: -10, y: 0});
    dataManager.addNode({id: "center", label: "Center", x: 0, y: 0});
    
    // Add edges to create a visual grid
    dataManager.addEdge({src: "center", dst: "ref1"});
    dataManager.addEdge({src: "center", dst: "ref2"});
    dataManager.addEdge({src: "center", dst: "ref3"});
    dataManager.addEdge({src: "center", dst: "ref4"});
    
    // Switch to 2D/3D mode...
});
```

#### Option 2: Test View Matrix and Projection
Instead of just testing position values, verify the camera's view matrix and what's actually visible in the viewport:

```typescript
test("camera pan changes view matrix correctly", () => {
    const initialViewMatrix = cameraController.camera.getViewMatrix();
    const initialProjectionMatrix = cameraController.camera.getProjectionMatrix();
    
    // Perform pan operation...
    
    const newViewMatrix = cameraController.camera.getViewMatrix();
    assert.notDeepEqual(initialViewMatrix, newViewMatrix);
    
    // Test specific matrix elements that should change with pan
    // For 2D pan, translation components should change
    assert.notEqual(newViewMatrix.m[12], initialViewMatrix.m[12]); // X translation
    assert.notEqual(newViewMatrix.m[13], initialViewMatrix.m[13]); // Y translation
});

test("objects move correctly in screen space after camera pan", () => {
    // Add node at origin
    const node = dataManager.addNode({id: "test", x: 0, y: 0});
    
    // Get initial screen position
    const initialScreenPos = graph.worldToScreen(node.mesh.position);
    
    // Pan camera right
    // ...pan operation...
    
    // Node should appear to move left on screen
    const newScreenPos = graph.worldToScreen(node.mesh.position);
    assert.isTrue(newScreenPos.x < initialScreenPos.x);
});
```

#### Option 3: Raycast Testing
Use raycasting to verify the camera is pointing at expected locations after movement:

```typescript
test("camera points at correct location after pan", () => {
    // Add nodes at known positions
    const centerNode = dataManager.addNode({id: "center", x: 0, y: 0});
    const targetNode = dataManager.addNode({id: "target", x: 10, y: 0});
    
    // Pan camera to center on target node
    const panDistance = 10;
    // ...perform pan operation...
    
    // Raycast from camera center should hit the target node
    const ray = graph.scene.createPickingRay(
        canvas.width / 2, 
        canvas.height / 2, 
        null, 
        cameraController.camera
    );
    
    const hit = graph.scene.pickWithRay(ray);
    assert.equal(hit?.pickedMesh?.id, targetNode.mesh.id);
});
```

#### Option 4: Visual Regression Testing
Capture screenshots and compare them to ensure camera movements produce expected visual results:

```typescript
test("camera pan produces expected visual result", async () => {
    // Add reference content
    setupReferenceGrid();
    
    // Capture initial state
    const beforeScreenshot = await page.screenshot();
    
    // Pan camera
    await performCameraPan(100, 0); // Pan 100 pixels right
    
    // Capture after state
    const afterScreenshot = await page.screenshot();
    
    // Compare screenshots (using visual regression tool)
    expect(afterScreenshot).toMatchSnapshot('camera-pan-right');
});
```

### Implementation Considerations

1. **Performance**: Adding reference objects increases test setup time but provides better verification
2. **Maintainability**: Visual tests may need updates when rendering changes
3. **Test Purpose**: Consider whether the test goal is to verify input handling (current approach) or visual output (enhancement)
4. **Coverage Balance**: Not all camera tests need visual verification - mix approaches based on test goals

### Recommendation

For now, the current approach of testing internal state is sufficient for verifying input handling logic. These visual verification enhancements should be considered when:
- Implementing visual regression testing
- Debugging camera-related rendering issues  
- Creating integration tests that verify end-to-end behavior
- Building demo/example content that showcases camera controls

## Next Steps

1. Remove hypothetical tests created in Phase 2 that test non-existent features
2. Implement unit tests for actual input handlers
3. Create integration tests for real browser validation
4. Add visual regression tests for input feedback
5. Document any missing features discovered during testing
6. Consider implementing visual verification enhancements for camera tests when needed