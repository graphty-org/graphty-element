# Implementation Plan for Interaction Testing

## Overview

This implementation plan provides a phased approach to building a comprehensive interaction testing infrastructure for graphty-element. The testing system will verify user input handling across all supported input methods: mouse, keyboard, touch, and WebXR controllers, ensuring regressions in input direction, speed, and state management are caught early.

## Phase Breakdown

### Phase 1: Test Helpers and Infrastructure Foundation

**Objective**: Create shared test utilities and establish the test directory structure for all interaction tests. This foundational phase enables all subsequent phases to share common utilities.

**Tests to Write First**:
- `test/interactions/helpers/helpers.test.ts`: Verify test helpers work correctly
  ```typescript
  describe("Interaction Test Helpers", () => {
      test("waitForGraphReady resolves when graph is initialized");
      test("getNodeScreenPosition returns valid coordinates");
      test("getCameraState returns position and mode");
      test("setupTestGraph creates graph with specified mode");
      test("dragNode performs complete drag operation");
  });
  ```

**Implementation**:
- `test/interactions/helpers/interaction-helpers.ts`: Core test utilities
  ```typescript
  export async function waitForGraphReady(page: Page): Promise<void>;
  export async function getNodeScreenPosition(page: Page, nodeId: string): Promise<{x: number, y: number} | null>;
  export async function getCameraState(page: Page): Promise<CameraState>;
  export async function setupTestGraph(page: Page, options: TestGraphOptions): Promise<void>;
  export async function dragNode(page: Page, nodeId: string, delta: {dx: number, dy: number}): Promise<void>;
  export async function getSceneScale(page: Page): Promise<number>;
  export async function getSceneRotation(page: Page): Promise<{x: number, y: number, z: number}>;
  export async function getCameraPosition(page: Page): Promise<{x: number, y: number, z: number}>;
  ```

- `test/interactions/helpers/iwer-setup.ts`: WebXR emulation setup for IWER
  ```typescript
  export async function setupIWER(page: Page, device?: string): Promise<void>;
  export async function setupXRScene(page: Page): Promise<void>;
  export function createMockHand(handedness: string): MockHand;
  export function createPinchingHand(handedness: string): MockHand;
  export function createMockController(handedness: string): MockController;
  ```

- `test/interactions/types.ts`: TypeScript types for interaction tests
  ```typescript
  export interface TestGraphOptions {
      mode?: "2d" | "3d" | "xr";
      pinOnDrag?: boolean;
      layout?: string;
      nodes?: NodeData[];
      edges?: EdgeData[];
  }
  export interface CameraState {
      mode: "2d" | "3d";
      position: {x: number, y: number, z: number};
      alpha?: number;  // 3D mode
      beta?: number;   // 3D mode
      radius?: number; // 3D mode
      orthoRange?: number; // 2D mode
  }
  ```

- Create directory structure:
  ```
  test/interactions/
  ├── helpers/
  │   ├── interaction-helpers.ts
  │   ├── iwer-setup.ts
  │   └── helpers.test.ts
  ├── types.ts
  ├── unit/           (Phase 2)
  ├── integration/    (Phase 3)
  ├── xr/             (Phase 4)
  └── edge-cases/     (Phase 5)
  ```

**Dependencies**:
- External: `iwer` npm package (for XR emulation)
- Internal: Existing test infrastructure from `test/helpers/testSetup.ts`

**Verification**:
1. Run: `npm run test:browser -- --filter="Interaction Test Helpers"`
2. Expected output: All helper tests pass, establishing the foundation for interaction testing

---

### Phase 2: Direction Verification Unit Tests

**Objective**: Create unit tests that verify input directions map to expected output directions. These are the most critical tests for catching direction-related regressions (e.g., left stick rotating scene the wrong way).

**Tests to Write First**:
- `test/interactions/unit/2d-direction.test.ts`: 2D camera direction verification
  ```typescript
  describe("2D Input Direction Verification", () => {
      test("W key pans camera UP (positive Y)");
      test("S key pans camera DOWN (negative Y)");
      test("A key pans camera LEFT (negative X)");
      test("D key pans camera RIGHT (positive X)");
      test("mouse drag RIGHT pans camera LEFT (opposite)");
      test("mouse drag UP pans camera DOWN (opposite)");
      test("wheel scroll DOWN zooms OUT");
      test("wheel scroll UP zooms IN");
      test("Q key rotates counter-clockwise");
      test("E key rotates clockwise");
  });
  ```

- `test/interactions/unit/3d-direction.test.ts`: 3D camera direction verification
  ```typescript
  describe("3D Input Direction Verification", () => {
      test("ArrowLeft rotates camera LEFT (increases alpha)");
      test("ArrowRight rotates camera RIGHT (decreases alpha)");
      test("ArrowUp tilts camera UP");
      test("ArrowDown tilts camera DOWN");
      test("W key zooms IN (decreases radius)");
      test("S key zooms OUT (increases radius)");
      test("A key spins camera LEFT (yaw)");
      test("D key spins camera RIGHT (yaw)");
  });
  ```

- `test/interactions/unit/xr-direction.test.ts`: XR input direction verification (CRITICAL)
  ```typescript
  describe("XR Input Direction Verification", () => {
      test("left stick X+ rotates scene RIGHT (CRITICAL)");
      test("left stick X- rotates scene LEFT");
      test("left stick Y+ pitches scene UP");
      test("left stick Y- pitches scene DOWN");
      test("right stick X+ pans scene RIGHT");
      test("right stick X- pans scene LEFT");
      test("right stick Y+ zooms IN");
      test("right stick Y- zooms OUT");
  });
  ```

**Implementation**:
- Tests use existing mock input system and controller test patterns
- Each test initializes a minimal graph, applies input, and verifies the output direction
- XR tests create mock XRInputHandler with fake thumbstick values

**Dependencies**:
- External: None
- Internal: Phase 1 helpers, `MockDeviceInputSystem`, existing camera controller tests

**Verification**:
1. Run: `npm run test:browser -- --filter="Direction Verification"`
2. Expected output: All direction tests pass, confirming input-to-output mappings

---

### Phase 3: Speed, Sensitivity, and Deadzone Tests

**Objective**: Verify that input sensitivity, deadzones, and speed settings work correctly. These tests catch issues where controls feel "too fast" or "too slow" or where small inputs cause unintended movement.

**Tests to Write First**:
- `test/interactions/unit/input-speed.test.ts`: Speed and sensitivity tests
  ```typescript
  describe("Input Speed and Sensitivity", () => {
      test("keyboard pan speed is within expected range");
      test("keyboard zoom speed is within expected range");
      test("mouse drag sensitivity is proportional to movement");
      test("wheel zoom step size is consistent");
      test("XR thumbstick deadzone filters inputs below threshold (0.15)");
      test("XR thumbstick values above deadzone are applied");
      test("keyboard inertia decays at expected rate");
      test("rotation velocity dampens correctly when key released");
  });
  ```

- `test/interactions/unit/deadzone.test.ts`: Deadzone and threshold tests
  ```typescript
  describe("Deadzone and Threshold Behavior", () => {
      test("2D input deadzone prevents drift");
      test("XR deadzone is 0.15 (matches DEADZONE constant)");
      test("deadzone applies per-axis, not radially");
      test("pinch threshold hysteresis (start: 0.7, end: 0.5)");
  });
  ```

**Implementation**:
- `test/interactions/unit/input-speed.test.ts`: Measure distance traveled per unit time
- Use `InputUtils.applyDeadzone` function directly for deadzone tests
- Compare against constants defined in input controllers

**Dependencies**:
- External: None
- Internal: Phase 1 helpers, Phase 2 patterns, `InputUtils.ts`

**Verification**:
1. Run: `npm run test:browser -- --filter="Speed and Sensitivity|Deadzone"`
2. Expected output: All speed/sensitivity tests pass, confirming reasonable control feel

---

### Phase 4: Browser Integration Tests (Mouse, Keyboard, Touch)

**Objective**: Create integration tests using Playwright that test real browser input in a running Storybook instance. These tests verify the full input pipeline from browser events to scene changes.

**Tests to Write First**:
- `test/interactions/integration/mouse-controls.test.ts`: Mouse integration tests
  ```typescript
  describe("Mouse Controls Integration", () => {
      test("drag to pan in 2D mode");
      test("drag to orbit in 3D mode");
      test("wheel to zoom in 2D mode");
      test("wheel to zoom in 3D mode");
      test("click on node selects it");
      test("drag node moves it");
  });
  ```

- `test/interactions/integration/keyboard-controls.test.ts`: Keyboard integration tests
  ```typescript
  describe("Keyboard Controls Integration", () => {
      test("WASD controls work in 2D mode");
      test("WASD controls work in 3D mode");
      test("arrow keys work in 2D mode");
      test("arrow keys work in 3D mode");
      test("keyboard only responds when canvas focused");
      test("keyboard input stops when canvas loses focus");
  });
  ```

- `test/interactions/integration/touch-controls.test.ts`: Touch integration tests via CDP
  ```typescript
  describe("Touch Controls Integration", () => {
      test("single finger pan in 2D mode");
      test("pinch to zoom in 2D mode");
      test("pinch to zoom in 3D mode");
      test("two-finger rotate in 2D mode");
      test("touch input via CDP simulation");
  });
  ```

**Implementation**:
- Tests navigate to Storybook stories and interact with the canvas
- Use `page.evaluate()` to read graph state before/after interactions
- Touch tests use CDP (Chrome DevTools Protocol) for touch simulation
- Each test file has corresponding story for visual verification

**Dependencies**:
- External: Playwright (already installed), CDP for touch
- Internal: Phase 1 helpers, running Storybook instance

**Verification**:
1. Ensure Storybook is running: `npm run storybook`
2. Run: `npm run test:interactions:browser`
3. Expected output: All browser integration tests pass in headed or headless mode

---

### Phase 5: WebXR Tests with IWER

**Objective**: Test WebXR interactions using IWER (Immersive Web Emulation Runtime) to emulate VR controllers and hand tracking without physical hardware.

**Tests to Write First**:
- `test/interactions/xr/xr-thumbstick.test.ts`: XR thumbstick integration
  ```typescript
  describe("XR Thumbstick Controls", () => {
      test("left stick X+ rotates scene RIGHT");
      test("left stick Y+ pitches scene UP");
      test("right stick X+ pans scene RIGHT");
      test("right stick Y+ zooms IN");
      test("deadzone filtering works in XR");
  });
  ```

- `test/interactions/xr/xr-gestures.test.ts`: XR gesture tests
  ```typescript
  describe("XR Controller Gestures", () => {
      test("single trigger picks node");
      test("node follows controller during drag");
      test("two-hand pinch zooms scene");
      test("two-hand rotation rotates scene");
  });
  ```

- `test/interactions/xr/xr-hand-tracking.test.ts`: Hand tracking tests
  ```typescript
  describe("XR Hand Tracking", () => {
      test("pinch gesture triggers node drag");
      test("pinch threshold hysteresis works");
      test("two-hand gestures work with hands");
  });
  ```

**Implementation**:
- `test/interactions/helpers/iwer-setup.ts` provides IWER initialization
- Tests inject IWER before page load, configure virtual device
- Controller state is manipulated via `window.xrDevice` API
- Tests enter XR mode programmatically and verify pivot/scale changes

**Dependencies**:
- External: `iwer` npm package (add to devDependencies)
- Internal: Phase 1 helpers, XRInputHandler implementation

**Verification**:
1. Run: `npm run test:interactions:xr`
2. Expected output: All XR tests pass using emulated WebXR environment

---

### Phase 6: Edge Cases and State Transitions

**Objective**: Test complex interactions, state transitions, and edge cases that are easy to break during refactoring. These tests catch issues like stuck drag states, corrupted camera positions after mode switching, and interrupted gestures.

**Tests to Write First**:
- `test/interactions/edge-cases/node-drag-drop.test.ts`: Node drag behavior
  ```typescript
  describe("Node Drag and Drop", () => {
      test("edges move with node while dragging");
      test("dragging node does NOT rotate camera in 3D mode (CRITICAL)");
      test("dragging node does NOT pan camera in 2D mode");
      test("node beyond scene bounds handled gracefully");
  });
  ```

- `test/interactions/edge-cases/pin-on-drag.test.ts`: Pin behavior
  ```typescript
  describe("pinOnDrag Behavior", () => {
      test("pinOnDrag=true pins node after drag");
      test("pinOnDrag=false does NOT pin node");
      test("pinned node stays at position during layout");
  });
  ```

- `test/interactions/edge-cases/view-mode-transitions.test.ts`: Mode switching
  ```typescript
  describe("View Mode Transitions", () => {
      test("2D → 3D cleans up 2D input state");
      test("3D → 2D cleans up orbit state");
      test("3D → XR → 3D preserves camera position");
      test("rapid mode switching does not corrupt state");
  });
  ```

- `test/interactions/edge-cases/xr-input-switching.test.ts`: XR input method changes
  ```typescript
  describe("XR Input Method Switching", () => {
      test("controllers → hands preserves scene state");
      test("hands → controllers ends drag cleanly");
      test("controller disconnect mid-drag releases node (CRITICAL)");
  });
  ```

- `test/interactions/edge-cases/input-sequences.test.ts`: Input combinations
  ```typescript
  describe("Input Sequence Combinations", () => {
      test("keyboard → mouse → keyboard maintains keyboard");
      test("mouse → touch → mouse works correctly");
      test("touch interrupted by mouse cleans up");
      test("rapid key switching does not accumulate velocity");
  });
  ```

- `test/interactions/edge-cases/xr-local-space.test.ts`: XR coordinate systems
  ```typescript
  describe("XR Input Local Space", () => {
      test("thumbstick pan is relative to user view (CRITICAL)");
      test("rotation is relative to user up vector");
      test("node drag moves relative to pivot rotation");
  });
  ```

**Implementation**:
- Tests setup specific scenarios and verify state transitions
- Use timeouts strategically to ensure async operations complete
- XR tests with IWER manipulate head pose and controller positions

**Dependencies**:
- External: None
- Internal: All previous phases, IWER setup from Phase 5

**Verification**:
1. Run: `npm run test:interactions:edge-cases`
2. Expected output: All edge case tests pass, confirming robust state management

---

### Phase 7: CI Integration and npm Scripts

**Objective**: Add npm scripts for running interaction tests, configure CI pipeline, and document testing procedures.

**Tests to Write First**:
- No new tests; this phase configures execution

**Implementation**:
- Update `package.json` with new scripts:
  ```json
  {
    "scripts": {
      "test:interactions": "vitest run --project=interactions",
      "test:interactions:unit": "vitest run --project=interactions --filter='unit/'",
      "test:interactions:browser": "vitest run --project=interactions --filter='integration/'",
      "test:interactions:xr": "vitest run --project=interactions --filter='xr/'",
      "test:interactions:edge-cases": "vitest run --project=interactions --filter='edge-cases/'"
    }
  }
  ```

- Update `vitest.config.ts` with interactions project:
  ```typescript
  {
    test: {
      name: "interactions",
      include: ["test/interactions/**/*.test.ts"],
      exclude: ["test/interactions/helpers/**"],
      browser: {
        enabled: true,
        headless: true,
        provider: "playwright",
        instances: [{browser: "chromium"}],
      },
    },
  }
  ```

- Create `test/interactions/README.md` documenting:
  - Test categories and what they cover
  - How to run tests locally
  - How to debug failing XR tests
  - Manual testing procedures for edge cases

**Dependencies**:
- External: None
- Internal: All previous phases

**Verification**:
1. Run: `npm run test:interactions`
2. Expected output: All interaction tests run and pass in CI-compatible headless mode

---

## Common Utilities Needed

- **waitForGraphReady**: Wait for graph initialization before testing
- **getNodeScreenPosition**: Convert 3D node position to screen coordinates for mouse interaction
- **getCameraState**: Snapshot camera position, rotation, zoom for comparison
- **setupTestGraph**: Configure graph with specific options (mode, nodes, layout)
- **dragNode**: Perform a complete drag operation on a node
- **setupIWER**: Initialize IWER for XR testing
- **createMockController**: Create mock XR controller for IWER

## External Libraries Assessment

| Task | Library | Reason |
|------|---------|--------|
| XR Emulation | [iwer](https://github.com/meta-quest/immersive-web-emulator) | Industry-standard XR emulation from Meta, supports Quest controllers and hand tracking |
| Touch Simulation | CDP (built into Playwright) | Native touch event simulation without additional dependencies |
| Browser Automation | Playwright (already installed) | Already used for visual tests, provides robust browser control |

## Risk Mitigation

| Potential Risk | Mitigation Strategy |
|----------------|---------------------|
| IWER API changes | Pin IWER version, document workarounds |
| Flaky XR tests | Add retry logic, increase timeouts for XR session start |
| Touch test inconsistency | Use CDP directly instead of synthetic events |
| Storybook not running | Add check in test setup, clear error message |
| Direction test false positives | Use clear thresholds, verify in both directions |
| Test interference | Run interaction tests with `fileParallelism: false` |
| WebXR not available in CI | IWER provides mock WebXR API that works in any browser |

## Success Metrics

1. **Coverage**: All 6 input methods tested (mouse, keyboard, touch, XR thumbstick, XR trigger, hand tracking)
2. **Direction Tests**: 100% of direction mappings verified
3. **Reliability**: <1% flaky test rate
4. **Speed**: Unit tests <10s, browser <60s, XR <120s
5. **Regressions Caught**: Direction bugs, speed changes, state corruption, mode transition issues

---

## HOW TO: Implementation Patterns

This section provides detailed implementation guidance for each test category.

### HOW TO: Unit Tests with NullEngine

Unit tests create a real `Graph` instance using `NullEngine` (headless Babylon.js). This allows testing input controllers without rendering.

**Pattern: Create Test Graph**
```typescript
import {afterEach, beforeEach, describe, test, vi} from "vitest";
import {assert} from "chai";
import {Vector3} from "@babylonjs/core";

import {Graph} from "../../src/Graph";
import {createTestGraph, cleanupTestGraph} from "../helpers/testSetup";

describe("2D Input Direction Verification", () => {
    let graph: Graph;

    beforeEach(async () => {
        graph = await createTestGraph();
        // Configure for 2D mode
        graph.setViewMode("2d");
    });

    afterEach(() => {
        vi.restoreAllMocks();
        cleanupTestGraph(graph);
    });

    test("W key pans camera UP (positive Y)", () => {
        // Get the 2D camera controller
        const cameraManager = graph.getCameraManager();
        const controller = cameraManager.getTwoDController();

        // Record initial position
        const initialY = controller.camera.position.y;

        // Simulate W key press via input controller
        const inputController = controller.inputController;
        // Access private keyState (see "Accessing Private State" section)
        (inputController as any).keyState["w"] = true;

        // Run several update frames
        for (let i = 0; i < 10; i++) {
            inputController.update();
        }

        // Verify camera moved UP (positive Y direction)
        const finalY = controller.camera.position.y;
        assert.isAbove(finalY, initialY, "W key should pan camera UP (positive Y)");
    });
});
```

**Pattern: Test XR Input Handler Directly**
```typescript
import {Quaternion, Vector3} from "@babylonjs/core";
import {XRInputHandler} from "../../src/cameras/XRInputHandler";

describe("XR Input Direction Verification", () => {
    let handler: XRInputHandler;
    let mockPivotController: MockPivotController;

    beforeEach(() => {
        // Create mock pivot controller to capture calls
        mockPivotController = {
            rotate: vi.fn(),
            zoom: vi.fn(),
            panViewRelative: vi.fn(),
            pivot: { rotationQuaternion: Quaternion.Identity() },
        };

        // Create handler with mocked dependencies
        // Note: XRInputHandler requires WebXRDefaultExperience,
        // so we may need to mock that or test via integration
    });

    test("left stick X+ rotates scene RIGHT", () => {
        // Set thumbstick values directly
        (handler as any).leftStick = { x: 0.8, y: 0 };
        (handler as any).rightStick = { x: 0, y: 0 };

        // Process one frame
        (handler as any).processThumbsticks();

        // Verify rotate was called with positive yaw (RIGHT)
        assert.isTrue(mockPivotController.rotate.called);
        const [yaw, pitch] = mockPivotController.rotate.firstCall.args;
        assert.isAbove(yaw, 0, "X+ should produce positive yaw (rotate RIGHT)");
    });
});
```

### HOW TO: Accessing Private State

The codebase uses private members that tests need to access. Use these patterns:

**Pattern 1: Type Assertion (preferred for simple cases)**
```typescript
// Access private property
const keyState = (inputController as any).keyState;
keyState["w"] = true;

// Access private method
(handler as any).processThumbsticks();
```

**Pattern 2: Test Interface (for frequently accessed internals)**
```typescript
// In test/helpers/testSetup.ts
export interface TestableInputController extends InputController {
    keyState: Record<string, boolean>;
    gestureSession: GestureSession | null;
}

// In test
const testController = inputController as unknown as TestableInputController;
testController.keyState["w"] = true;
```

**Pattern 3: Expose via Graph for Testing**
```typescript
// Access camera manager internals
const cameraManager = graph.getCameraManager();

// Get controller (public method that returns the controller)
const twoDController = cameraManager.getTwoDController();

// Access input controller via the camera controller
const inputController = twoDController.inputController; // May need (twoDController as any)
```

### HOW TO: Integration Tests with Playwright

Integration tests run against a real browser with Storybook. They use Playwright's `page` object from vitest-browser.

**Pattern: Navigate to Story and Interact**
```typescript
import {test} from "vitest";
import {page} from "@vitest/browser/context";
import {assert} from "chai";

describe("Mouse Controls Integration", () => {
    const STORYBOOK_URL = "http://dev.ato.ms:9025";

    test("drag to pan in 2D mode", async () => {
        // Navigate to 2D story
        await page.goto(`${STORYBOOK_URL}/iframe.html?id=layout-2d--default`);

        // Wait for graph to be ready
        await waitForGraphReady(page);

        // Get initial camera position
        const initialPos = await page.evaluate(() => {
            const graph = document.querySelector("graphty-element")?.graph;
            const cam = graph?.getCameraManager().getTwoDController().camera;
            return { x: cam?.position.x, y: cam?.position.y };
        });

        // Perform drag
        const canvas = page.locator("canvas");
        await canvas.dragTo(canvas, {
            sourcePosition: { x: 200, y: 200 },
            targetPosition: { x: 300, y: 200 }, // Drag RIGHT
        });

        // Wait for physics to settle
        await waitForSettle(page);

        // Get final position
        const finalPos = await page.evaluate(() => {
            const graph = document.querySelector("graphty-element")?.graph;
            const cam = graph?.getCameraManager().getTwoDController().camera;
            return { x: cam?.position.x, y: cam?.position.y };
        });

        // Dragging RIGHT should pan camera LEFT (opposite direction)
        assert.isBelow(finalPos.x, initialPos.x, "Drag RIGHT should pan camera LEFT");
    });
});
```

**Pattern: Wait for Graph Ready**
```typescript
async function waitForGraphReady(page: Page, timeout = 5000): Promise<void> {
    await page.waitForFunction(() => {
        const el = document.querySelector("graphty-element");
        if (!el) return false;
        const graph = (el as any).graph;
        return graph && graph.isInitialized && graph.isInitialized();
    }, { timeout });
}
```

**Pattern: Wait for Physics to Settle**
```typescript
async function waitForSettle(page: Page, frames = 10): Promise<void> {
    await page.evaluate(async (frameCount) => {
        return new Promise<void>((resolve) => {
            let count = 0;
            const tick = () => {
                count++;
                if (count >= frameCount) {
                    resolve();
                } else {
                    requestAnimationFrame(tick);
                }
            };
            requestAnimationFrame(tick);
        });
    }, frames);
}
```

### HOW TO: Touch Simulation via CDP

Playwright provides CDP access for low-level touch simulation. This is more reliable than synthetic events.

**Pattern: Single Touch Pan**
```typescript
async function simulateTouchPan(
    page: Page,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    steps = 10
): Promise<void> {
    const client = await page.context().newCDPSession(page);

    // Touch start
    await client.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: startX, y: startY, id: 0 }],
    });

    // Touch move in steps
    for (let i = 1; i <= steps; i++) {
        const x = startX + ((endX - startX) * i) / steps;
        const y = startY + ((endY - startY) * i) / steps;
        await client.send("Input.dispatchTouchEvent", {
            type: "touchMove",
            touchPoints: [{ x, y, id: 0 }],
        });
        await page.waitForTimeout(16); // ~60fps
    }

    // Touch end
    await client.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
    });
}
```

**Pattern: Pinch Gesture**
```typescript
async function simulatePinch(
    page: Page,
    centerX: number,
    centerY: number,
    startDistance: number,
    endDistance: number,
    steps = 10
): Promise<void> {
    const client = await page.context().newCDPSession(page);

    // Calculate finger positions
    const getFingerPositions = (distance: number) => ({
        finger1: { x: centerX - distance / 2, y: centerY, id: 0 },
        finger2: { x: centerX + distance / 2, y: centerY, id: 1 },
    });

    const start = getFingerPositions(startDistance);

    // Touch start with two fingers
    await client.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [start.finger1, start.finger2],
    });

    // Move fingers apart/together
    for (let i = 1; i <= steps; i++) {
        const distance = startDistance + ((endDistance - startDistance) * i) / steps;
        const pos = getFingerPositions(distance);
        await client.send("Input.dispatchTouchEvent", {
            type: "touchMove",
            touchPoints: [pos.finger1, pos.finger2],
        });
        await page.waitForTimeout(16);
    }

    // Touch end
    await client.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
    });
}
```

**Pattern: Two-Finger Rotate**
```typescript
async function simulateTwoFingerRotate(
    page: Page,
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number, // radians
    endAngle: number,
    steps = 10
): Promise<void> {
    const client = await page.context().newCDPSession(page);

    const getFingerPositions = (angle: number) => ({
        finger1: {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
            id: 0,
        },
        finger2: {
            x: centerX + radius * Math.cos(angle + Math.PI),
            y: centerY + radius * Math.sin(angle + Math.PI),
            id: 1,
        },
    });

    const start = getFingerPositions(startAngle);

    await client.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [start.finger1, start.finger2],
    });

    for (let i = 1; i <= steps; i++) {
        const angle = startAngle + ((endAngle - startAngle) * i) / steps;
        const pos = getFingerPositions(angle);
        await client.send("Input.dispatchTouchEvent", {
            type: "touchMove",
            touchPoints: [pos.finger1, pos.finger2],
        });
        await page.waitForTimeout(16);
    }

    await client.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
    });
}
```

### HOW TO: WebXR Tests with IWER

IWER (Immersive Web Emulation Runtime) provides a complete WebXR mock. Install it first:

```bash
npm install --save-dev iwer
```

**Pattern: Setup IWER Before Page Load**
```typescript
import {XRDevice, metaQuestTouchPlus} from "iwer";

async function setupIWER(page: Page): Promise<void> {
    // Inject IWER before any page scripts run
    await page.addInitScript(() => {
        // IWER must be loaded synchronously before WebXR is accessed
        // This is typically done via a script tag or bundled
    });

    // Alternative: Use page.evaluate to set up after load
    await page.evaluate(async () => {
        const {XRDevice, metaQuestTouchPlus} = await import("iwer");

        // Create virtual XR device
        const xrDevice = new XRDevice(metaQuestTouchPlus);
        xrDevice.installRuntime();

        // Store reference for test manipulation
        (window as any).xrDevice = xrDevice;
    });
}
```

**Pattern: Set Thumbstick Values**
```typescript
async function setThumbstick(
    page: Page,
    hand: "left" | "right",
    x: number,
    y: number
): Promise<void> {
    await page.evaluate(({ hand, x, y }) => {
        const xrDevice = (window as any).xrDevice;
        if (!xrDevice) throw new Error("IWER not initialized");

        // Get the controller for specified hand
        const controller = hand === "left"
            ? xrDevice.primaryController
            : xrDevice.secondaryController;

        // Set thumbstick axes
        controller.thumbstick.x = x;
        controller.thumbstick.y = y;
    }, { hand, x, y });
}
```

**Pattern: Simulate Controller Trigger**
```typescript
async function pressTrigger(page: Page, hand: "left" | "right"): Promise<void> {
    await page.evaluate(({ hand }) => {
        const xrDevice = (window as any).xrDevice;
        const controller = hand === "left"
            ? xrDevice.primaryController
            : xrDevice.secondaryController;

        controller.trigger.value = 1.0;
        controller.trigger.pressed = true;
    }, { hand });
}

async function releaseTrigger(page: Page, hand: "left" | "right"): Promise<void> {
    await page.evaluate(({ hand }) => {
        const xrDevice = (window as any).xrDevice;
        const controller = hand === "left"
            ? xrDevice.primaryController
            : xrDevice.secondaryController;

        controller.trigger.value = 0;
        controller.trigger.pressed = false;
    }, { hand });
}
```

**Pattern: Set Controller Position**
```typescript
async function setControllerPosition(
    page: Page,
    hand: "left" | "right",
    position: { x: number; y: number; z: number }
): Promise<void> {
    await page.evaluate(({ hand, position }) => {
        const xrDevice = (window as any).xrDevice;
        const controller = hand === "left"
            ? xrDevice.primaryController
            : xrDevice.secondaryController;

        controller.position.set(position.x, position.y, position.z);
    }, { hand, position });
}
```

**Pattern: Enter XR Session Programmatically**
```typescript
async function enterXRSession(page: Page): Promise<void> {
    await page.evaluate(async () => {
        const graph = document.querySelector("graphty-element")?.graph;
        if (!graph) throw new Error("Graph not found");

        // Use the graph's XR entry method
        await graph.enterXR("immersive-vr");
    });

    // Wait for XR session to start
    await page.waitForFunction(() => {
        const graph = document.querySelector("graphty-element")?.graph;
        return graph?.getXRSessionManager()?.getActiveMode() === "vr";
    }, { timeout: 5000 });
}
```

**Pattern: Complete XR Thumbstick Test**
```typescript
test("left stick X+ rotates scene RIGHT", async () => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=xr--default`);
    await waitForGraphReady(page);
    await setupIWER(page);
    await enterXRSession(page);

    // Get initial pivot rotation
    const initialYaw = await page.evaluate(() => {
        const graph = document.querySelector("graphty-element")?.graph;
        const pivot = graph?.getPivotController()?.pivot;
        return pivot?.rotationQuaternion?.toEulerAngles().y ?? 0;
    });

    // Push left stick to the right
    await setThumbstick(page, "left", 0.8, 0);

    // Wait for several frames of input processing
    await waitForSettle(page, 30);

    // Get final pivot rotation
    const finalYaw = await page.evaluate(() => {
        const graph = document.querySelector("graphty-element")?.graph;
        const pivot = graph?.getPivotController()?.pivot;
        return pivot?.rotationQuaternion?.toEulerAngles().y ?? 0;
    });

    // X+ should rotate scene RIGHT (positive yaw change)
    assert.isAbove(finalYaw, initialYaw, "Left stick X+ should rotate scene RIGHT");
});
```

### HOW TO: Mock Hand Tracking

IWER supports hand tracking emulation. Here's how to set up hand joint positions:

**Pattern: Set Hand Pinch State**
```typescript
async function setHandPinch(
    page: Page,
    hand: "left" | "right",
    isPinching: boolean
): Promise<void> {
    await page.evaluate(({ hand, isPinching }) => {
        const xrDevice = (window as any).xrDevice;
        const handInput = hand === "left"
            ? xrDevice.leftHand
            : xrDevice.rightHand;

        if (isPinching) {
            // Move thumb-tip and index-tip close together
            handInput.joints["thumb-tip"].position.set(0, 0, 0);
            handInput.joints["index-finger-tip"].position.set(0.02, 0, 0); // 2cm apart
        } else {
            // Move them apart
            handInput.joints["thumb-tip"].position.set(0, 0, 0);
            handInput.joints["index-finger-tip"].position.set(0.08, 0, 0); // 8cm apart
        }
    }, { hand, isPinching });
}
```

### HOW TO: Verify Direction Changes

Direction tests need clear assertions. Use these patterns:

**Pattern: Assert Direction Change**
```typescript
function assertMovedInDirection(
    initial: number,
    final: number,
    direction: "positive" | "negative",
    message: string
): void {
    const delta = final - initial;
    const threshold = 0.001; // Minimum detectable change

    if (direction === "positive") {
        assert.isAbove(delta, threshold, message);
    } else {
        assert.isBelow(delta, -threshold, message);
    }
}

// Usage
assertMovedInDirection(
    initialY,
    finalY,
    "positive",
    "W key should pan camera UP (positive Y)"
);
```

**Pattern: Assert Zoom Change**
```typescript
function assertZoomed(
    initialScale: number,
    finalScale: number,
    direction: "in" | "out",
    message: string
): void {
    if (direction === "in") {
        // Zoom in = larger scale OR smaller ortho range OR smaller radius
        assert.isAbove(finalScale, initialScale, message);
    } else {
        assert.isBelow(finalScale, initialScale, message);
    }
}
```

---

## Appendix: Missing Tests Identified

Based on code review, these tests should be added:

### Phase 2 Additions (Touch Direction Tests)

```typescript
// test/interactions/unit/2d-direction.test.ts - ADD:
test("touch pinch spread zooms IN (smaller ortho range)");
test("touch pinch squeeze zooms OUT (larger ortho range)");
test("two-finger rotate CW rotates scene CW");

// test/interactions/unit/3d-direction.test.ts - ADD:
test("touch pinch spread zooms IN (smaller radius)");
test("touch two-finger rotate controls spin (yaw)");

// test/interactions/unit/xr-direction.test.ts - FIX descriptions:
// Code shows: pitchDelta = -leftY * PITCH_SPEED
// So Y+ (forward push) = negative pitch = look DOWN
test("left stick Y+ (forward) pitches scene DOWN");
test("left stick Y- (back) pitches scene UP");
```

### Phase 5 Additions (XR Drag Tests)

```typescript
// test/interactions/xr/xr-gestures.test.ts - ADD:
test("XR node drag applies MOVEMENT_AMPLIFICATION (3.0x)");
test("XR node drag transforms delta through pivot rotation");
```
