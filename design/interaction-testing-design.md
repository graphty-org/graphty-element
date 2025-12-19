# Interaction Testing Plan for Graphty Element

## Executive Summary

This document outlines a comprehensive interaction testing strategy for graphty-element. The goal is to catch regressions in user input handling across all supported input methods: mouse, keyboard, touch, and WebXR controllers.

### Key Scenarios We Must Catch

| Scenario | Input Type | What Could Go Wrong |
|----------|------------|---------------------|
| Controller joystick direction | XR | Left input rotates scene right instead of left |
| Touch controls in 2D | Touch | Pinch/pan gestures stop working |
| Keyboard speed | Keyboard | WASD controls too fast or too slow |
| XR gestures | XR | Zoom/pan/rotate with two-hand gestures breaks |
| Hand tracking | XR | Pinch gestures don't trigger node drag |
| Mouse controls | Mouse | Click-and-drag stops working |

## Current Input Implementation Architecture

### File Structure

```
src/
├── cameras/
│   ├── CameraManager.ts           # Orchestrates camera controllers
│   ├── TwoDCameraController.ts    # 2D orthographic camera
│   ├── TwoDInputController.ts     # 2D mouse/keyboard/touch input (Hammer.js)
│   ├── OrbitCameraController.ts   # 3D orbit camera
│   ├── OrbitInputController.ts    # 3D mouse/keyboard input
│   ├── PivotController.ts         # Scene pivot for XR manipulation
│   ├── XRPivotCameraController.ts # XR camera controller
│   ├── XRInputHandler.ts          # XR thumbstick/trigger/hand input
│   └── InputUtils.ts              # Shared utilities (deadzone, etc.)
├── xr/
│   └── XRSessionManager.ts        # WebXR session lifecycle
├── input/
│   ├── types.ts                   # Input event types
│   ├── babylon-input-system.ts    # Real browser input
│   └── mock-device-input-system.ts # Mock input for testing
├── managers/
│   └── InputManager.ts            # Centralized input management
└── NodeBehavior.ts                # Node drag behavior
```

### Input Flow

```
Browser Events / WebXR API
         ↓
    Babylon.js Input System
         ↓
┌────────┴────────┐
│   2D Mode       │   3D Mode       │   XR Mode
├─────────────────┼─────────────────┼─────────────────┤
│ TwoDInput-      │ OrbitInput-     │ XRInputHandler  │
│ Controller      │ Controller      │                 │
│ (Hammer.js)     │                 │ (Babylon WebXR) │
├─────────────────┼─────────────────┼─────────────────┤
│ TwoDCamera-     │ OrbitCamera-    │ XRPivotCamera-  │
│ Controller      │ Controller      │ Controller      │
└─────────────────┴─────────────────┴─────────────────┘
         ↓                 ↓                 ↓
              Scene/Camera State Changes
```

## Test Categories

### 1. Mouse Controls

**Files**: `TwoDInputController.ts`, `OrbitInputController.ts`

| Action | 2D Mode | 3D Mode |
|--------|---------|---------|
| Left drag | Pan camera | Orbit camera |
| Wheel | Zoom in/out | Zoom in/out |
| Click node | Select | Select |
| Drag node | Move node (SixDofDragBehavior) | Move node |

**Regression Tests**:
- Verify left-drag in 2D pans camera (not rotates)
- Verify left-drag in 3D orbits camera
- Verify wheel zoom direction is consistent
- Verify node drag works in both modes

### 2. Keyboard Controls

**Files**: `TwoDInputController.ts`, `OrbitInputController.ts`

| Key | 2D Mode | 3D Mode |
|-----|---------|---------|
| W/↑ | Pan up | Zoom in |
| S/↓ | Pan down | Zoom out |
| A/← | Pan left | Rotate left |
| D/→ | Pan right | Rotate right |
| Q | Rotate CCW | - |
| E | Rotate CW | - |
| +/= | Zoom in | - |
| -/_ | Zoom out | - |

**Regression Tests**:
- Verify each key produces expected movement direction
- Verify velocity/inertia feels reasonable (not too fast/slow)
- Verify keyboard only works when canvas is focused

### 3. Touch Controls

**Files**: `TwoDInputController.ts` (uses Hammer.js)

| Gesture | 2D Mode | 3D Mode |
|---------|---------|---------|
| Single finger | Pan | Pan |
| Pinch | Zoom | Zoom |
| Two-finger rotate | Rotate view | Yaw |

**Regression Tests**:
- Verify single-finger pan works
- Verify pinch zoom direction is correct (spread = zoom in)
- Verify two-finger rotation works
- Test on actual touch device or via CDP touch simulation

### 4. WebXR Controls

**Files**: `XRInputHandler.ts`, `XRSessionManager.ts`, `XRPivotCameraController.ts`

#### 4.1 Thumbstick Controls

| Stick | Axis | Action |
|-------|------|--------|
| Left | X | Yaw (rotate scene left/right) |
| Left | Y | Pitch (tilt scene up/down) |
| Right | X | Pan left/right |
| Right | Y | Zoom in/out |

**Regression Tests**:
- **CRITICAL**: Left stick X positive (push right) → scene rotates right (not left!)
- Left stick Y forward → pitch up
- Right stick Y forward → zoom in
- Right stick X right → pan right
- Deadzone filtering works correctly

#### 4.2 Controller Trigger Gestures

| Gesture | Action |
|---------|--------|
| Single trigger (point at node) | Pick and drag node |
| Both triggers (pinch both hands) | Two-hand zoom/rotate |

**Regression Tests**:
- Single-hand trigger picks nodes correctly
- Node follows controller movement during drag
- Two-hand pinch-apart zooms out
- Two-hand rotation rotates scene

#### 4.3 Hand Tracking Gestures

| Gesture | Action |
|---------|--------|
| Single-hand pinch | Pick and drag node |
| Two-hand pinch | Zoom and rotate scene |

**Regression Tests**:
- Pinch detection threshold works (start: 4cm, release: 6cm)
- Node drag follows hand position
- Two-hand gestures work with hysteresis

### 5. Node Interactions

**Files**: `NodeBehavior.ts`, `NodeDragHandler`

| Action | Behavior |
|--------|----------|
| Drag node | Moves node, pins to location |
| Double-click | Expands node (if fetchNodes provided) |

**Regression Tests**:
- Drag updates node position
- `pinOnDrag` setting works
- Physics pauses during drag
- Double-click expansion works

## Testing Infrastructure

### Existing Test Files

```
test/browser/
├── 2d-camera-controls.test.ts    # ✅ Mouse/keyboard 2D tests
├── 3d-camera-controls.test.ts    # ✅ Mouse/keyboard 3D tests
├── input-manager.test.ts         # ✅ InputManager tests
├── input-system.test.ts          # ✅ Input system tests
└── camera/                       # Camera state/animation tests

test/xr/
└── XRSessionManager.test.ts      # Basic XR manager tests (no WebXR)
```

### Mock Input System

The `MockDeviceInputSystem` (`src/input/mock-device-input-system.ts`) provides:

```typescript
// Simulate mouse events
mockInput.simulateMouseMove(x, y);
mockInput.simulateMouseDown(MouseButton.Left);
mockInput.simulateMouseUp(MouseButton.Left);
mockInput.simulateWheel(deltaY, deltaX);

// Simulate touch events
mockInput.simulateTouchStart([{id: 1, x: 100, y: 100}]);
mockInput.simulateTouchMove([{id: 1, x: 150, y: 150}]);
mockInput.simulateTouchEnd([1]);

// Simulate keyboard events
mockInput.simulateKeyDown('w', {ctrlKey: false});
mockInput.simulateKeyUp('w');
```

## Implementation Plan

### Phase 1: Unit Tests for Input Controllers

Test input handling logic in isolation without rendering.

#### 1.1 Direction Verification Tests

```typescript
// test/unit/input-direction.test.ts
describe("Input Direction Verification", () => {
    describe("2D Camera Controls", () => {
        test("W key pans camera UP (positive Y)", () => {
            const initialY = cameraController.camera.position.y;
            simulateKeyHold('w', 100); // Hold for 100ms
            assert.isTrue(cameraController.camera.position.y > initialY);
        });

        test("mouse drag RIGHT pans camera RIGHT", () => {
            const initialX = cameraController.camera.position.x;
            simulateMouseDrag({from: {x: 100, y: 100}, to: {x: 200, y: 100}});
            // Camera pans opposite to drag direction in screen space
            assert.isTrue(cameraController.camera.position.x < initialX);
        });
    });

    describe("3D Camera Controls", () => {
        test("left arrow rotates camera LEFT (positive alpha)", () => {
            const initialAlpha = cameraController.camera.alpha;
            simulateKeyHold('ArrowLeft', 100);
            assert.isTrue(cameraController.camera.alpha > initialAlpha);
        });
    });

    describe("XR Controls", () => {
        test("left stick X positive rotates scene RIGHT", () => {
            const initialYaw = pivotController.pivot.rotationQuaternion.toEulerAngles().y;
            xrInputHandler.leftStick = {x: 1.0, y: 0}; // Push right
            xrInputHandler.update();
            const newYaw = pivotController.pivot.rotationQuaternion.toEulerAngles().y;
            // Positive X should increase yaw (rotate right when looking down Y axis)
            assert.isTrue(newYaw > initialYaw);
        });
    });
});
```

#### 1.2 Speed/Sensitivity Tests

```typescript
// test/unit/input-speed.test.ts
describe("Input Speed and Sensitivity", () => {
    test("keyboard pan speed is within expected range", () => {
        const startPos = cameraController.camera.position.clone();

        // Simulate 1 second of W key held
        for (let i = 0; i < 60; i++) {
            inputController.keyState['w'] = true;
            inputController.update();
        }

        const distance = Vector3.Distance(startPos, cameraController.camera.position);

        // Expect movement between 5-20 units per second (adjust based on your config)
        assert.isTrue(distance > 5, "Movement too slow");
        assert.isTrue(distance < 20, "Movement too fast");
    });

    test("XR thumbstick deadzone filters small movements", () => {
        xrInputHandler.leftStick = {x: 0.1, y: 0.1}; // Below deadzone (0.15)
        const initialRotation = pivotController.pivot.rotationQuaternion.clone();
        xrInputHandler.update();

        // Should not have changed
        assert.isTrue(
            initialRotation.equals(pivotController.pivot.rotationQuaternion),
            "Deadzone should filter small inputs"
        );
    });
});
```

### Phase 2: Integration Tests with Playwright

Test real browser input in headed/headless mode.

#### 2.1 Mouse Control Integration

```typescript
// test/integration/mouse-controls.test.ts
import {test, expect} from "@playwright/test";

test.describe("Mouse Controls Integration", () => {
    test("drag to pan in 2D mode", async ({page}) => {
        await page.goto("http://dev.ato.ms:9025/?path=/story/viewmode--2d-view");
        await page.waitForSelector("graphty-element");

        // Get initial camera position
        const initialPos = await page.evaluate(() => {
            const graph = document.querySelector("graphty-element").graph;
            return {
                x: graph.camera.activeCameraController.camera.position.x,
                y: graph.camera.activeCameraController.camera.position.y,
            };
        });

        // Perform drag
        const canvas = page.locator("canvas");
        await canvas.dragTo(canvas, {
            sourcePosition: {x: 300, y: 300},
            targetPosition: {x: 400, y: 300}, // Drag right
        });

        // Verify camera moved
        const finalPos = await page.evaluate(() => {
            const graph = document.querySelector("graphty-element").graph;
            return {
                x: graph.camera.activeCameraController.camera.position.x,
                y: graph.camera.activeCameraController.camera.position.y,
            };
        });

        // Dragging right should pan camera left (scene moves right relative to camera)
        expect(finalPos.x).toBeLessThan(initialPos.x);
    });
});
```

#### 2.2 Touch Control Integration (via CDP)

```typescript
// test/integration/touch-controls.test.ts
test("pinch to zoom in 2D mode", async ({page}) => {
    await page.goto("http://dev.ato.ms:9025/?path=/story/viewmode--2d-view");

    const client = await page.context().newCDPSession(page);

    const initialZoom = await page.evaluate(() => {
        const cam = document.querySelector("graphty-element").graph.camera.camera;
        return cam.orthoTop - cam.orthoBottom;
    });

    // Simulate pinch-out (spread fingers)
    await client.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [
            {x: 350, y: 300, id: 0},
            {x: 450, y: 300, id: 1},
        ],
    });

    await client.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [
            {x: 300, y: 300, id: 0},  // Spread apart
            {x: 500, y: 300, id: 1},
        ],
    });

    await client.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
    });

    await page.waitForTimeout(100);

    const finalZoom = await page.evaluate(() => {
        const cam = document.querySelector("graphty-element").graph.camera.camera;
        return cam.orthoTop - cam.orthoBottom;
    });

    // Spreading fingers = zoom in = smaller ortho range
    expect(finalZoom).toBeLessThan(initialZoom);
});
```

### Phase 3: WebXR Testing with IWER

Use [IWER (Immersive Web Emulation Runtime)](https://github.com/meta-quest/immersive-web-emulator) to test XR interactions without physical hardware.

#### 3.1 IWER Setup

```typescript
// test/helpers/iwer-setup.ts
export async function setupIWER(page: Page, device = "metaQuest3") {
    // Inject IWER
    await page.addScriptTag({
        url: "https://unpkg.com/iwer/build/iwer.min.js",
    });

    // Configure device
    await page.evaluate((deviceName) => {
        const xrDevice = new (window as any).IWER.XRDevice(
            (window as any).IWER[deviceName]
        );
        xrDevice.installRuntime();
        xrDevice.stereoEnabled = true;

        // Configure controllers
        xrDevice.controllers = [
            {
                handedness: "left",
                profiles: ["oculus-touch-v3"],
                pose: {position: [-0.3, 1.4, -0.3], orientation: [0, 0, 0, 1]},
            },
            {
                handedness: "right",
                profiles: ["oculus-touch-v3"],
                pose: {position: [0.3, 1.4, -0.3], orientation: [0, 0, 0, 1]},
            },
        ];

        // Set initial head pose
        xrDevice.pose = {
            position: [0, 1.6, 0],
            orientation: [0, 0, 0, 1],
        };

        (window as any).xrDevice = xrDevice;
    }, device);
}
```

#### 3.2 XR Thumbstick Tests

```typescript
// test/integration/xr-thumbstick.test.ts
test.describe("XR Thumbstick Controls", () => {
    test.beforeEach(async ({page}) => {
        await setupIWER(page);
        await page.goto("http://dev.ato.ms:9025/?path=/story/viewmode--xr-view");

        // Enter VR
        await page.evaluate(async () => {
            const graph = document.querySelector("graphty-element").graph;
            await graph.camera.enterVR();
        });

        await page.waitForTimeout(500); // Wait for XR session
    });

    test("left stick X positive rotates scene RIGHT", async ({page}) => {
        const initialYaw = await page.evaluate(() => {
            const pivot = document.querySelector("graphty-element").graph
                .camera.xrPivotController.pivot;
            return pivot.rotationQuaternion.toEulerAngles().y;
        });

        // Simulate thumbstick input via IWER
        await page.evaluate(() => {
            const device = (window as any).xrDevice;
            // Set left controller thumbstick to right
            device.controllers[0].axes = {x: 1.0, y: 0};
        });

        // Wait for input to process
        await page.waitForTimeout(200);

        const finalYaw = await page.evaluate(() => {
            const pivot = document.querySelector("graphty-element").graph
                .camera.xrPivotController.pivot;
            return pivot.rotationQuaternion.toEulerAngles().y;
        });

        // Positive X should increase yaw (rotate right)
        expect(finalYaw).toBeGreaterThan(initialYaw);
    });

    test("right stick Y forward zooms IN", async ({page}) => {
        const initialScale = await page.evaluate(() => {
            const pivot = document.querySelector("graphty-element").graph
                .camera.xrPivotController.pivot;
            return pivot.scaling.x;
        });

        await page.evaluate(() => {
            const device = (window as any).xrDevice;
            device.controllers[1].axes = {x: 0, y: 1.0}; // Push forward
        });

        await page.waitForTimeout(200);

        const finalScale = await page.evaluate(() => {
            const pivot = document.querySelector("graphty-element").graph
                .camera.xrPivotController.pivot;
            return pivot.scaling.x;
        });

        // Zoom in = larger scale
        expect(finalScale).toBeGreaterThan(initialScale);
    });
});
```

#### 3.3 XR Controller Gesture Tests

```typescript
// test/integration/xr-gestures.test.ts
test.describe("XR Controller Gestures", () => {
    test("single trigger picks and drags node", async ({page}) => {
        await setupIWER(page);
        await setupXRScene(page);

        // Position controller to point at node
        await page.evaluate(() => {
            const device = (window as any).xrDevice;
            device.controllers[1].pose = {
                position: [0, 1.5, -0.5], // Close to scene
                orientation: [0, 0, 0, 1],
            };
        });

        // Get initial node position
        const initialNodePos = await page.evaluate(() => {
            const node = document.querySelector("graphty-element").graph
                .dataManager.nodes.get("node1");
            return {x: node.mesh.position.x, y: node.mesh.position.y};
        });

        // Press trigger
        await page.evaluate(() => {
            const device = (window as any).xrDevice;
            device.controllers[1].buttons[0] = {pressed: true, value: 1.0};
        });

        await page.waitForTimeout(100);

        // Move controller
        await page.evaluate(() => {
            const device = (window as any).xrDevice;
            device.controllers[1].pose.position = [0.5, 1.5, -0.5]; // Move right
        });

        await page.waitForTimeout(100);

        // Release trigger
        await page.evaluate(() => {
            const device = (window as any).xrDevice;
            device.controllers[1].buttons[0] = {pressed: false, value: 0};
        });

        // Verify node moved
        const finalNodePos = await page.evaluate(() => {
            const node = document.querySelector("graphty-element").graph
                .dataManager.nodes.get("node1");
            return {x: node.mesh.position.x, y: node.mesh.position.y};
        });

        expect(finalNodePos.x).not.toEqual(initialNodePos.x);
    });

    test("two-hand pinch zooms scene", async ({page}) => {
        await setupIWER(page);
        await setupXRScene(page);

        const initialScale = await getSceneScale(page);

        // Both controllers at same position, both triggers pressed
        await page.evaluate(() => {
            const device = (window as any).xrDevice;
            device.controllers[0].pose.position = [-0.2, 1.5, -0.3];
            device.controllers[1].pose.position = [0.2, 1.5, -0.3];
            device.controllers[0].buttons[0] = {pressed: true, value: 1.0};
            device.controllers[1].buttons[0] = {pressed: true, value: 1.0};
        });

        await page.waitForTimeout(100);

        // Move hands apart (zoom out)
        await page.evaluate(() => {
            const device = (window as any).xrDevice;
            device.controllers[0].pose.position = [-0.4, 1.5, -0.3];
            device.controllers[1].pose.position = [0.4, 1.5, -0.3];
        });

        await page.waitForTimeout(200);

        const finalScale = await getSceneScale(page);

        // Moving hands apart = zoom out = smaller scale
        expect(finalScale).toBeLessThan(initialScale);
    });
});
```

#### 3.4 Hand Tracking Tests

```typescript
// test/integration/xr-hand-tracking.test.ts
test.describe("XR Hand Tracking", () => {
    test("pinch gesture triggers node drag", async ({page}) => {
        await setupIWER(page, "metaQuest3");
        await setupXRScene(page);

        // Enable hand tracking in IWER
        await page.evaluate(() => {
            const device = (window as any).xrDevice;
            device.hands = {
                left: {
                    joints: {
                        wrist: {position: [-0.2, 1.4, -0.3]},
                        "thumb-tip": {position: [-0.18, 1.42, -0.28]},
                        "index-finger-tip": {position: [-0.18, 1.42, -0.28]}, // Same pos = pinch
                    },
                },
                right: null,
            };
        });

        await page.waitForTimeout(200);

        // Verify pinch was detected
        const isPinching = await page.evaluate(() => {
            const handler = document.querySelector("graphty-element").graph
                .camera.xrInputHandler;
            return handler.leftHand?.isPinching;
        });

        expect(isPinching).toBe(true);
    });
});
```

### Phase 4: Visual Regression Tests

Capture screenshots to detect visual regressions in input feedback.

```typescript
// test/visual/input-feedback.test.ts
test.describe("Input Visual Feedback", () => {
    test("node highlights on hover", async ({page}) => {
        await page.goto("http://dev.ato.ms:9025/?path=/story/interactions--node-hover");
        await page.waitForSelector("graphty-element");

        // Move mouse over node
        const nodePos = await getNodeScreenPosition(page, "node1");
        await page.mouse.move(nodePos.x, nodePos.y);

        await page.waitForTimeout(100);

        await expect(page).toHaveScreenshot("node-hover.png", {
            maxDiffPixels: 100,
        });
    });

    test("node drag feedback", async ({page}) => {
        await page.goto("http://dev.ato.ms:9025/?path=/story/interactions--node-drag");

        const nodePos = await getNodeScreenPosition(page, "node1");

        await page.mouse.move(nodePos.x, nodePos.y);
        await page.mouse.down();
        await page.mouse.move(nodePos.x + 50, nodePos.y + 50);

        await expect(page).toHaveScreenshot("node-dragging.png");
    });
});
```

## Test Matrix

### Input Method Coverage

| Feature | Unit Test | Integration | XR (IWER) | Visual |
|---------|-----------|-------------|-----------|--------|
| Mouse pan (2D) | ✅ | ✅ | - | ✅ |
| Mouse orbit (3D) | ✅ | ✅ | - | ✅ |
| Mouse wheel zoom | ✅ | ✅ | - | - |
| Keyboard WASD | ✅ | ✅ | - | - |
| Keyboard arrows | ✅ | ✅ | - | - |
| Touch pan | ✅ | ✅ (CDP) | - | - |
| Touch pinch | ✅ | ✅ (CDP) | - | - |
| Touch rotate | ✅ | ✅ (CDP) | - | - |
| XR thumbstick | ✅ | - | ✅ | - |
| XR trigger pick | ✅ | - | ✅ | - |
| XR two-hand gesture | ✅ | - | ✅ | - |
| XR hand tracking | ✅ | - | ✅ | - |
| Node drag | ✅ | ✅ | ✅ | ✅ |
| Node double-click | ✅ | ✅ | - | - |

### Edge Case and State Transition Coverage

| Feature | Integration | XR (IWER) | Priority |
|---------|-------------|-----------|----------|
| Edges move with dragged node | ✅ | ✅ | HIGH |
| Node drag doesn't rotate camera | ✅ | - | **CRITICAL** |
| pinOnDrag=true pins node | ✅ | ✅ | HIGH |
| pinOnDrag=false doesn't pin | ✅ | ✅ | HIGH |
| Node beyond bounds handled | ✅ | - | MEDIUM |
| 2D → 3D mode transition | ✅ | - | HIGH |
| 3D → 2D mode transition | ✅ | - | HIGH |
| 3D → XR → 3D camera preserved | - | ✅ | HIGH |
| Rapid mode switching | ✅ | - | MEDIUM |
| Controllers → hands transition | - | ✅ | HIGH |
| Hands → controllers transition | - | ✅ | HIGH |
| Controller disconnect mid-drag | - | ✅ | **CRITICAL** |
| Keyboard → mouse → keyboard | ✅ | - | HIGH |
| Mouse → touch → mouse | ✅ | - | HIGH |
| Touch interrupted by mouse | ✅ | - | HIGH |
| Rapid key switching | ✅ | - | MEDIUM |
| XR pan relative to local view | - | ✅ | **CRITICAL** |
| XR rotation relative to user up | - | ✅ | HIGH |
| XR node drag relative to pivot | - | ✅ | HIGH |

### Direction Verification Tests (Critical)

These tests verify that input directions map to expected output directions:

| Input | Expected Output | Test Priority |
|-------|-----------------|---------------|
| Mouse drag right | Camera pans left | HIGH |
| W key | Camera/scene moves up | HIGH |
| Wheel scroll down | Zoom out | HIGH |
| Left stick X+ (right) | Scene rotates right | **CRITICAL** |
| Left stick Y+ (forward) | Scene pitches up | HIGH |
| Right stick Y+ (forward) | Zoom in | HIGH |
| Pinch spread | Zoom in | HIGH |
| Two-finger rotate CW | Scene rotates CW | MEDIUM |
| XR pan when rotated 90° | Moves in user's local direction | **CRITICAL** |

## Test Helpers

### Common Utilities

```typescript
// test/helpers/interaction-helpers.ts
export async function waitForGraphReady(page: Page) {
    await page.waitForFunction(() => {
        const graph = document.querySelector("graphty-element")?.graph;
        return graph?.initialized && graph?.scene?.isReady();
    });
}

export async function getNodeScreenPosition(page: Page, nodeId: string) {
    return page.evaluate((id) => {
        const graph = document.querySelector("graphty-element").graph;
        const node = graph.dataManager.nodes.get(id);
        if (!node) return null;
        return graph.worldToScreen(node.mesh.position);
    }, nodeId);
}

export async function getCameraState(page: Page) {
    return page.evaluate(() => {
        const graph = document.querySelector("graphty-element").graph;
        const cam = graph.camera;
        return {
            mode: graph.styleManager.is2D ? "2d" : "3d",
            position: cam.camera.position,
            // ... other state
        };
    });
}

export async function getSceneScale(page: Page) {
    return page.evaluate(() => {
        const pivot = document.querySelector("graphty-element").graph
            .camera.xrPivotController?.pivot;
        return pivot?.scaling.x ?? 1;
    });
}
```

## CI/CD Integration

### Test Commands

```bash
# Run all interaction tests
npm run test:interactions

# Run only unit tests (fast, no browser)
npm run test:interactions:unit

# Run browser integration tests
npm run test:interactions:browser

# Run XR tests with IWER (requires headed browser or virtual display)
npm run test:interactions:xr

# Run visual regression tests
npm run test:interactions:visual
```

### Vitest Configuration

```typescript
// vitest.config.ts - add interaction test project
{
    test: {
        name: "interactions",
        include: ["test/interactions/**/*.test.ts"],
        browser: {
            enabled: true,
            headless: true, // Set false for XR debugging
            provider: "playwright",
            instances: [{
                browser: "chromium",
                launchOptions: {
                    args: ["--use-gl=swiftshader"], // Software rendering for CI
                },
            }],
        },
    },
}
```

## Phase 5: Edge Case and State Transition Tests

These tests verify complex interactions, state transitions, and edge cases that are easy to break during refactoring.

### 5.1 Node Drag and Drop Behavior

```typescript
// test/interactions/node-drag-drop.test.ts
test.describe("Node Drag and Drop", () => {
    test("edges move with node while dragging", async ({page}) => {
        await setupTestGraph(page, {
            nodes: [{id: "a", x: 0, y: 0}, {id: "b", x: 10, y: 0}],
            edges: [{src: "a", dst: "b"}],
        });

        // Get initial edge endpoint positions
        const initialEdge = await page.evaluate(() => {
            const graph = document.querySelector("graphty-element").graph;
            const edge = graph.dataManager.edges.values().next().value;
            return {
                startX: edge.startPoint.x,
                startY: edge.startPoint.y,
                endX: edge.endPoint.x,
                endY: edge.endPoint.y,
            };
        });

        // Start dragging node "a"
        const nodePos = await getNodeScreenPosition(page, "a");
        await page.mouse.move(nodePos.x, nodePos.y);
        await page.mouse.down();
        await page.mouse.move(nodePos.x + 100, nodePos.y + 50, {steps: 5});

        // Check edge moved WITH the node (don't release mouse yet)
        const duringDragEdge = await page.evaluate(() => {
            const graph = document.querySelector("graphty-element").graph;
            const edge = graph.dataManager.edges.values().next().value;
            return {
                startX: edge.startPoint.x,
                startY: edge.startPoint.y,
            };
        });

        // Edge start point should have moved (it connects to node "a")
        expect(duringDragEdge.startX).not.toBeCloseTo(initialEdge.startX, 1);

        await page.mouse.up();
    });

    test("dragging node does NOT rotate camera in 3D mode", async ({page}) => {
        await setupTestGraph(page, {mode: "3d"});

        // Get initial camera orientation
        const initialCamera = await page.evaluate(() => {
            const cam = document.querySelector("graphty-element").graph.camera.camera;
            return {alpha: cam.alpha, beta: cam.beta};
        });

        // Drag a node
        const nodePos = await getNodeScreenPosition(page, "node1");
        await page.mouse.move(nodePos.x, nodePos.y);
        await page.mouse.down();
        await page.mouse.move(nodePos.x + 100, nodePos.y + 100, {steps: 10});
        await page.mouse.up();

        // Camera orientation should NOT have changed
        const finalCamera = await page.evaluate(() => {
            const cam = document.querySelector("graphty-element").graph.camera.camera;
            return {alpha: cam.alpha, beta: cam.beta};
        });

        expect(finalCamera.alpha).toBeCloseTo(initialCamera.alpha, 5);
        expect(finalCamera.beta).toBeCloseTo(initialCamera.beta, 5);
    });

    test("dragging node does NOT pan camera in 2D mode", async ({page}) => {
        await setupTestGraph(page, {mode: "2d"});

        const initialCamera = await page.evaluate(() => {
            const cam = document.querySelector("graphty-element").graph.camera.camera;
            return {x: cam.position.x, y: cam.position.y};
        });

        // Drag a node
        const nodePos = await getNodeScreenPosition(page, "node1");
        await page.mouse.move(nodePos.x, nodePos.y);
        await page.mouse.down();
        await page.mouse.move(nodePos.x + 100, nodePos.y + 100, {steps: 10});
        await page.mouse.up();

        const finalCamera = await page.evaluate(() => {
            const cam = document.querySelector("graphty-element").graph.camera.camera;
            return {x: cam.position.x, y: cam.position.y};
        });

        expect(finalCamera.x).toBeCloseTo(initialCamera.x, 5);
        expect(finalCamera.y).toBeCloseTo(initialCamera.y, 5);
    });

    test("node beyond scene bounds is handled gracefully", async ({page}) => {
        await setupTestGraph(page);

        // Drag node FAR outside normal bounds
        const nodePos = await getNodeScreenPosition(page, "node1");
        await page.mouse.move(nodePos.x, nodePos.y);
        await page.mouse.down();
        await page.mouse.move(nodePos.x + 2000, nodePos.y + 2000, {steps: 20});
        await page.mouse.up();

        // Node should still exist and have finite position
        const nodeState = await page.evaluate(() => {
            const node = document.querySelector("graphty-element").graph
                .dataManager.nodes.get("node1");
            return {
                exists: !!node,
                positionFinite: isFinite(node.mesh.position.x) &&
                                isFinite(node.mesh.position.y) &&
                                isFinite(node.mesh.position.z),
            };
        });

        expect(nodeState.exists).toBe(true);
        expect(nodeState.positionFinite).toBe(true);
    });
});
```

### 5.2 pinOnDrag Behavior

```typescript
// test/interactions/pin-on-drag.test.ts
test.describe("pinOnDrag Behavior", () => {
    test("pinOnDrag=true pins node after drag", async ({page}) => {
        await setupTestGraph(page, {pinOnDrag: true});

        // Verify node is NOT pinned initially
        const initialPinned = await page.evaluate(() => {
            const node = document.querySelector("graphty-element").graph
                .dataManager.nodes.get("node1");
            return node.isPinned;
        });
        expect(initialPinned).toBe(false);

        // Drag node
        await dragNode(page, "node1", {dx: 50, dy: 50});

        // Verify node IS pinned after drag
        const afterDragPinned = await page.evaluate(() => {
            const node = document.querySelector("graphty-element").graph
                .dataManager.nodes.get("node1");
            return node.isPinned;
        });
        expect(afterDragPinned).toBe(true);
    });

    test("pinOnDrag=false does NOT pin node after drag", async ({page}) => {
        await setupTestGraph(page, {pinOnDrag: false});

        // Drag node
        await dragNode(page, "node1", {dx: 50, dy: 50});

        // Verify node is NOT pinned
        const afterDragPinned = await page.evaluate(() => {
            const node = document.querySelector("graphty-element").graph
                .dataManager.nodes.get("node1");
            return node.isPinned;
        });
        expect(afterDragPinned).toBe(false);
    });

    test("pinned node stays at position during layout settling", async ({page}) => {
        await setupTestGraph(page, {pinOnDrag: true, layout: "ngraph"});

        // Drag node to specific position
        await dragNode(page, "node1", {dx: 100, dy: 100});

        const positionAfterDrag = await page.evaluate(() => {
            const node = document.querySelector("graphty-element").graph
                .dataManager.nodes.get("node1");
            return {x: node.mesh.position.x, y: node.mesh.position.y};
        });

        // Wait for layout to run several iterations
        await page.waitForTimeout(500);

        const positionAfterLayout = await page.evaluate(() => {
            const node = document.querySelector("graphty-element").graph
                .dataManager.nodes.get("node1");
            return {x: node.mesh.position.x, y: node.mesh.position.y};
        });

        // Position should NOT have changed (node is pinned)
        expect(positionAfterLayout.x).toBeCloseTo(positionAfterDrag.x, 3);
        expect(positionAfterLayout.y).toBeCloseTo(positionAfterDrag.y, 3);
    });
});
```

### 5.3 View Mode Transitions

```typescript
// test/interactions/view-mode-transitions.test.ts
test.describe("View Mode Transitions", () => {
    test("2D → 3D transition cleans up 2D input state", async ({page}) => {
        await setupTestGraph(page, {mode: "2d"});

        // Hold keyboard key
        await page.keyboard.down("w");

        // Switch to 3D
        await page.evaluate(() => {
            const graph = document.querySelector("graphty-element").graph;
            graph.setViewMode("3d");
        });

        await page.waitForTimeout(100);
        await page.keyboard.up("w");

        // Verify no stuck velocity in 2D controller
        const has2DVelocity = await page.evaluate(() => {
            const graph = document.querySelector("graphty-element").graph;
            // 2D controller should be disabled, no residual velocity
            return graph.camera.activeCameraController?.velocity?.length() > 0.01;
        });

        expect(has2DVelocity).toBe(false);
    });

    test("3D → 2D transition cleans up orbit state", async ({page}) => {
        await setupTestGraph(page, {mode: "3d"});

        // Start orbit drag
        const canvas = page.locator("canvas");
        await canvas.click({position: {x: 300, y: 300}});
        await page.mouse.down();
        await page.mouse.move(350, 350);

        // Switch to 2D while dragging
        await page.evaluate(() => {
            const graph = document.querySelector("graphty-element").graph;
            graph.setViewMode("2d");
        });

        await page.mouse.up();
        await page.waitForTimeout(100);

        // Verify no stuck drag state
        const isPointerDown = await page.evaluate(() => {
            const graph = document.querySelector("graphty-element").graph;
            const handler = graph.camera.activeInputHandler;
            return handler?.isPointerDown ?? false;
        });

        expect(isPointerDown).toBe(false);
    });

    test("camera maintains approximate position 3D → XR → 3D", async ({page}) => {
        await setupIWER(page);
        await setupTestGraph(page, {mode: "3d"});

        // Set specific camera position in 3D
        await page.evaluate(() => {
            const cam = document.querySelector("graphty-element").graph.camera.camera;
            cam.alpha = 1.5;
            cam.beta = 1.2;
            cam.radius = 20;
        });

        const initial3DCamera = await page.evaluate(() => {
            const cam = document.querySelector("graphty-element").graph.camera.camera;
            return {alpha: cam.alpha, beta: cam.beta, radius: cam.radius};
        });

        // Enter XR
        await page.evaluate(async () => {
            const graph = document.querySelector("graphty-element").graph;
            await graph.camera.enterVR();
        });
        await page.waitForTimeout(500);

        // Exit XR
        await page.evaluate(async () => {
            const graph = document.querySelector("graphty-element").graph;
            await graph.camera.exitVR();
        });
        await page.waitForTimeout(500);

        // Camera should return to approximate previous position
        const final3DCamera = await page.evaluate(() => {
            const cam = document.querySelector("graphty-element").graph.camera.camera;
            return {alpha: cam.alpha, beta: cam.beta, radius: cam.radius};
        });

        // Allow some tolerance for rounding
        expect(final3DCamera.alpha).toBeCloseTo(initial3DCamera.alpha, 1);
        expect(final3DCamera.beta).toBeCloseTo(initial3DCamera.beta, 1);
        expect(final3DCamera.radius).toBeCloseTo(initial3DCamera.radius, 0);
    });

    test("rapid mode switching does not corrupt state", async ({page}) => {
        await setupTestGraph(page, {mode: "2d"});

        // Rapidly switch modes
        for (let i = 0; i < 5; i++) {
            await page.evaluate(() => {
                const graph = document.querySelector("graphty-element").graph;
                graph.setViewMode("3d");
            });
            await page.waitForTimeout(50);

            await page.evaluate(() => {
                const graph = document.querySelector("graphty-element").graph;
                graph.setViewMode("2d");
            });
            await page.waitForTimeout(50);
        }

        // Verify graph is still functional
        const isHealthy = await page.evaluate(() => {
            const graph = document.querySelector("graphty-element").graph;
            return (
                graph.initialized &&
                graph.camera.activeCameraController !== null &&
                graph.camera.activeInputHandler !== null
            );
        });

        expect(isHealthy).toBe(true);
    });
});
```

### 5.4 XR Controller/Hand Switching

```typescript
// test/interactions/xr-input-switching.test.ts
test.describe("XR Input Method Switching", () => {
    test("controllers → hands transition preserves scene state", async ({page}) => {
        await setupIWER(page);
        await setupXRScene(page);

        // Use controllers to rotate scene
        await page.evaluate(() => {
            const device = window.xrDevice;
            device.controllers[0].axes = {x: 0.5, y: 0}; // Rotate
        });
        await page.waitForTimeout(200);

        const rotationAfterController = await getSceneRotation(page);

        // Switch to hands (remove controllers)
        await page.evaluate(() => {
            const device = window.xrDevice;
            device.controllers = []; // Remove controllers
            device.hands = {
                left: createMockHand("left"),
                right: createMockHand("right"),
            };
        });

        // Wait for controller removal delay (100ms in code)
        await page.waitForTimeout(150);

        // Scene rotation should be preserved
        const rotationAfterSwitch = await getSceneRotation(page);
        expect(rotationAfterSwitch.y).toBeCloseTo(rotationAfterController.y, 3);
    });

    test("hands → controllers transition during pinch ends drag cleanly", async ({page}) => {
        await setupIWER(page);
        await setupXRScene(page);

        // Start pinch with hand
        await page.evaluate(() => {
            const device = window.xrDevice;
            device.controllers = [];
            device.hands = {
                left: null,
                right: createPinchingHand("right"), // Pinching
            };
        });
        await page.waitForTimeout(100);

        // Verify dragging started
        const isDraggingBefore = await page.evaluate(() => {
            return document.querySelector("graphty-element").graph
                .camera.xrInputHandler?.isDragging() ?? false;
        });

        // Switch to controllers mid-pinch
        await page.evaluate(() => {
            const device = window.xrDevice;
            device.hands = {left: null, right: null};
            device.controllers = [
                createMockController("left"),
                createMockController("right"),
            ];
        });

        await page.waitForTimeout(150);

        // Drag should have ended cleanly
        const isDraggingAfter = await page.evaluate(() => {
            return document.querySelector("graphty-element").graph
                .camera.xrInputHandler?.isDragging() ?? false;
        });

        expect(isDraggingAfter).toBe(false);
    });

    test("controller disconnect mid-drag releases node", async ({page}) => {
        await setupIWER(page);
        await setupXRScene(page);

        // Start drag with controller trigger
        await page.evaluate(() => {
            const device = window.xrDevice;
            device.controllers[1].buttons[0] = {pressed: true, value: 1.0};
        });
        await page.waitForTimeout(100);

        // Disconnect controller
        await page.evaluate(() => {
            const device = window.xrDevice;
            device.controllers[1] = null;
        });
        await page.waitForTimeout(150);

        // Verify drag ended
        const isDragging = await page.evaluate(() => {
            return document.querySelector("graphty-element").graph
                .camera.xrInputHandler?.isDragging() ?? false;
        });

        expect(isDragging).toBe(false);
    });
});
```

### 5.5 Input Sequence Combinations

```typescript
// test/interactions/input-sequences.test.ts
test.describe("Input Sequence Combinations", () => {
    test("keyboard → mouse → keyboard maintains keyboard velocity", async ({page}) => {
        await setupTestGraph(page, {mode: "2d"});

        // Start keyboard panning
        await page.keyboard.down("w");
        await page.waitForTimeout(100);

        // Get velocity during keyboard
        const velocityDuringKey = await page.evaluate(() => {
            const controller = document.querySelector("graphty-element").graph
                .camera.activeCameraController;
            return controller.velocity?.y ?? 0;
        });

        // Do a quick mouse drag (should not interfere with keyboard)
        await page.mouse.move(300, 300);
        await page.mouse.down();
        await page.mouse.move(350, 350);
        await page.mouse.up();

        // Keyboard should still be active
        const velocityAfterMouse = await page.evaluate(() => {
            const controller = document.querySelector("graphty-element").graph
                .camera.activeCameraController;
            return controller.velocity?.y ?? 0;
        });

        await page.keyboard.up("w");

        // Velocity should have continued (key was still held)
        expect(Math.abs(velocityAfterMouse)).toBeGreaterThan(0);
    });

    test("mouse → touch → mouse does not corrupt pointer state", async ({page}) => {
        await setupTestGraph(page, {mode: "2d"});
        const client = await page.context().newCDPSession(page);

        // Mouse pan
        await page.mouse.move(300, 300);
        await page.mouse.down();
        await page.mouse.move(350, 350);
        await page.mouse.up();

        // Touch pan
        await client.send("Input.dispatchTouchEvent", {
            type: "touchStart",
            touchPoints: [{x: 300, y: 300, id: 0}],
        });
        await client.send("Input.dispatchTouchEvent", {
            type: "touchMove",
            touchPoints: [{x: 350, y: 350, id: 0}],
        });
        await client.send("Input.dispatchTouchEvent", {
            type: "touchEnd",
            touchPoints: [],
        });

        // Mouse should still work
        const initialPos = await getCameraPosition(page);

        await page.mouse.move(300, 300);
        await page.mouse.down();
        await page.mouse.move(400, 400);
        await page.mouse.up();

        const finalPos = await getCameraPosition(page);

        // Camera should have moved
        expect(finalPos.x).not.toBeCloseTo(initialPos.x, 1);
    });

    test("touch interrupted by mouse does not leave touch state stuck", async ({page}) => {
        await setupTestGraph(page, {mode: "2d"});
        const client = await page.context().newCDPSession(page);

        // Start touch
        await client.send("Input.dispatchTouchEvent", {
            type: "touchStart",
            touchPoints: [{x: 300, y: 300, id: 0}],
        });

        // Mouse click interrupts
        await page.mouse.click(400, 400);

        // Touch end (finger lifts)
        await client.send("Input.dispatchTouchEvent", {
            type: "touchEnd",
            touchPoints: [],
        });

        // Verify no stuck gesture state
        const gestureState = await page.evaluate(() => {
            const handler = document.querySelector("graphty-element").graph
                .camera.activeInputHandler;
            return {
                gestureSession: handler.gestureSession ?? null,
                isPanning: handler.isPanning ?? false,
            };
        });

        expect(gestureState.gestureSession).toBeNull();
    });

    test("rapid keyboard key switching does not accumulate velocity", async ({page}) => {
        await setupTestGraph(page, {mode: "2d"});

        // Rapidly press different keys
        for (let i = 0; i < 10; i++) {
            await page.keyboard.down("w");
            await page.waitForTimeout(20);
            await page.keyboard.up("w");
            await page.keyboard.down("s");
            await page.waitForTimeout(20);
            await page.keyboard.up("s");
        }

        await page.waitForTimeout(100);

        // Velocity should be near zero (all keys released)
        const velocity = await page.evaluate(() => {
            const controller = document.querySelector("graphty-element").graph
                .camera.activeCameraController;
            return Math.abs(controller.velocity?.y ?? 0);
        });

        expect(velocity).toBeLessThan(0.1);
    });
});
```

### 5.6 XR Local vs World Space

```typescript
// test/interactions/xr-local-space.test.ts
test.describe("XR Input Local Space", () => {
    test("thumbstick pan is relative to user view, not world", async ({page}) => {
        await setupIWER(page);
        await setupXRScene(page);

        // Rotate user's head 90 degrees to the right
        await page.evaluate(() => {
            const device = window.xrDevice;
            // Quaternion for 90 degree Y rotation
            device.pose.orientation = [0, 0.707, 0, 0.707];
        });
        await page.waitForTimeout(100);

        // Get initial scene position
        const initialPos = await page.evaluate(() => {
            const pivot = document.querySelector("graphty-element").graph
                .camera.xrPivotController.pivot;
            return {x: pivot.position.x, z: pivot.position.z};
        });

        // Push right stick to "right" (user's local right)
        await page.evaluate(() => {
            const device = window.xrDevice;
            device.controllers[1].axes = {x: 1.0, y: 0}; // Pan right
        });
        await page.waitForTimeout(200);

        const finalPos = await page.evaluate(() => {
            const pivot = document.querySelector("graphty-element").graph
                .camera.xrPivotController.pivot;
            return {x: pivot.position.x, z: pivot.position.z};
        });

        // Since user is rotated 90 degrees, their "right" is world "forward" (negative Z)
        // So pan should affect Z axis, not X axis
        const deltaX = Math.abs(finalPos.x - initialPos.x);
        const deltaZ = Math.abs(finalPos.z - initialPos.z);

        // Movement should primarily be in Z, not X
        expect(deltaZ).toBeGreaterThan(deltaX);
    });

    test("thumbstick rotation is relative to user up vector", async ({page}) => {
        await setupIWER(page);
        await setupXRScene(page);

        // User tilts head 45 degrees
        await page.evaluate(() => {
            const device = window.xrDevice;
            // Quaternion for 45 degree X rotation (tilted forward)
            device.pose.orientation = [0.383, 0, 0, 0.924];
        });
        await page.waitForTimeout(100);

        const initialRotation = await getSceneRotation(page);

        // Rotate with left stick
        await page.evaluate(() => {
            const device = window.xrDevice;
            device.controllers[0].axes = {x: 1.0, y: 0}; // Yaw right
        });
        await page.waitForTimeout(200);

        const finalRotation = await getSceneRotation(page);

        // Rotation should be around user's up vector (world Y when standing)
        // Primary change should be in Y rotation
        const deltaY = Math.abs(finalRotation.y - initialRotation.y);
        expect(deltaY).toBeGreaterThan(0.01);
    });

    test("node drag in XR moves relative to pivot rotation", async ({page}) => {
        await setupIWER(page);
        await setupXRScene(page);

        // Rotate the pivot/scene 90 degrees
        await page.evaluate(() => {
            const pivot = document.querySelector("graphty-element").graph
                .camera.xrPivotController.pivot;
            pivot.rotationQuaternion = new BABYLON.Quaternion(0, 0.707, 0, 0.707);
        });
        await page.waitForTimeout(100);

        // Get node's initial position
        const initialNodePos = await page.evaluate(() => {
            const node = document.querySelector("graphty-element").graph
                .dataManager.nodes.get("node1");
            return {x: node.mesh.position.x, z: node.mesh.position.z};
        });

        // Move controller "right" in XR space (user's right)
        await page.evaluate(() => {
            const device = window.xrDevice;
            // Start drag
            device.controllers[1].buttons[0] = {pressed: true, value: 1.0};
        });
        await page.waitForTimeout(50);

        await page.evaluate(() => {
            const device = window.xrDevice;
            // Move controller to the right
            device.controllers[1].pose.position = [0.5, 1.5, -0.3]; // +X in XR space
        });
        await page.waitForTimeout(100);

        const finalNodePos = await page.evaluate(() => {
            const node = document.querySelector("graphty-element").graph
                .dataManager.nodes.get("node1");
            return {x: node.mesh.position.x, z: node.mesh.position.z};
        });

        // Because pivot is rotated 90 degrees, user's "right" (+X in XR)
        // maps to scene's +Z direction
        // So node should have moved in Z, not X
        const deltaX = Math.abs(finalNodePos.x - initialNodePos.x);
        const deltaZ = Math.abs(finalNodePos.z - initialNodePos.z);

        expect(deltaZ).toBeGreaterThan(deltaX * 0.5); // Z change should dominate
    });
});
```

## Success Metrics

1. **Coverage**: All input methods have at least direction verification tests
2. **Reliability**: <1% flaky test rate
3. **Speed**: Unit tests <5s, integration <60s, XR tests <120s
4. **Regressions Caught**: Direction bugs, speed changes, broken gestures

## Next Steps

1. [ ] Create `test/interactions/` directory structure
2. [ ] Implement direction verification unit tests for each input type
3. [ ] Add speed/sensitivity tests with configurable thresholds
4. [ ] Set up IWER for XR testing in CI
5. [ ] Create visual regression baselines for input feedback
6. [ ] Add test commands to package.json
7. [ ] Document manual testing procedures for edge cases
