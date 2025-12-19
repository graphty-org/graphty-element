# Interaction Testing Infrastructure

This directory contains comprehensive tests for user input handling across all supported input methods: mouse, keyboard, touch, and WebXR controllers.

## Test Categories

### Unit Tests (`unit/`)

Unit tests verify input-to-output direction mappings and speed/sensitivity settings using NullEngine (headless Babylon.js).

| File | Description |
|------|-------------|
| `2d-direction.test.ts` | Verifies 2D camera controls (pan, zoom, rotate) respond correctly to inputs |
| `3d-direction.test.ts` | Verifies 3D camera controls (orbit, zoom, tilt) respond correctly to inputs |
| `xr-direction.test.ts` | Verifies XR thumbstick mappings for rotation, pan, and zoom |
| `input-speed.test.ts` | Tests speed, sensitivity, and inertia behavior |
| `deadzone.test.ts` | Tests deadzone filtering and threshold behavior |

### Integration Tests (`integration/`)

Integration tests use Playwright to test real browser input against a running Storybook instance.

| File | Description |
|------|-------------|
| `mouse-controls.test.ts` | Mouse drag, wheel zoom, node selection |
| `keyboard-controls.test.ts` | WASD and arrow key controls, focus handling |
| `touch-controls.test.ts` | Touch pan, pinch zoom, two-finger rotate via CDP |

### XR Tests (`xr/`)

WebXR tests use IWER (Immersive Web Emulation Runtime) to emulate VR controllers and hand tracking.

| File | Description |
|------|-------------|
| `xr-thumbstick.test.ts` | Thumbstick rotation, pan, zoom |
| `xr-gestures.test.ts` | Controller trigger, node drag, two-hand gestures |
| `xr-hand-tracking.test.ts` | Pinch gestures, hand tracking |

### Edge Cases (`edge-cases/`)

Tests for complex scenarios, state transitions, and edge cases.

| File | Description |
|------|-------------|
| `node-drag-drop.test.ts` | Node drag behavior, camera isolation during drag |
| `pin-on-drag.test.ts` | pinOnDrag configuration behavior |
| `view-mode-transitions.test.ts` | 2D/3D/XR mode switching |
| `xr-input-switching.test.ts` | Controller/hand input method changes |
| `input-sequences.test.ts` | Input method combinations and rapid switching |
| `xr-local-space.test.ts` | XR coordinate system relative to user view |

## Running Tests

### All Interaction Tests

```bash
npm run test:interactions
```

### By Category

```bash
# Unit tests only
npm run test:interactions:unit

# Browser integration tests
npm run test:interactions:browser

# XR emulation tests
npm run test:interactions:xr

# Edge case tests
npm run test:interactions:edge-cases
```

### Running Individual Test Files

```bash
# Run a specific test file
npx vitest run --project=interactions test/interactions/unit/2d-direction.test.ts

# Run tests matching a pattern
npx vitest run --project=interactions --filter="Direction"
```

### Watch Mode

```bash
npx vitest --project=interactions
```

## Prerequisites

### For Integration Tests

Integration tests require Storybook to be running:

```bash
# Start Storybook in a separate terminal
npm run storybook

# Then run integration tests
npm run test:interactions:browser
```

### For XR Tests

XR tests use IWER which is already installed as a dev dependency. No additional setup required.

## Debugging Failing Tests

### Common Issues

1. **Storybook not running**: Integration tests will fail with connection errors. Start Storybook first.

2. **Timeout errors**: May indicate the graph never settled. Check if layout is working correctly.

3. **Direction test failures**: Usually indicates a regression in input handling. Check the input controller code.

4. **XR test failures**: May indicate IWER API changes or WebXR implementation issues.

### Debugging XR Tests

```bash
# Run XR tests with verbose output
npx vitest run --project=interactions test/interactions/xr/ --reporter=verbose

# Run in headed mode to see what's happening
npx vitest run --project=interactions test/interactions/xr/ --browser.headless=false
```

### Adding Debug Output

In test files, you can add console.log statements:

```typescript
test("debug example", async () => {
    const state = await page.evaluate(() => {
        const graph = document.querySelector("graphty-element")?.graph;
        return {
            viewMode: graph?.viewMode,
            camera: graph?.getCameraManager()?.getActiveController()?.camera?.position,
        };
    });
    console.log("Graph state:", state);
});
```

## Test Helpers

### `interaction-helpers.ts`

Core utilities for all interaction tests:

- `waitForGraphReady(page)` - Wait for graph initialization
- `getNodeScreenPosition(page, nodeId)` - Get node's screen coordinates
- `getCameraState(page)` - Snapshot camera position/rotation
- `waitForSettle(page, frames)` - Wait for physics to settle
- `setupTestGraph(page, options)` - Configure graph for testing

### `iwer-setup.ts`

WebXR emulation utilities:

- `setupIWER(page)` - Initialize IWER before page load
- `setThumbstick(page, hand, x, y)` - Set thumbstick values
- `pressTrigger(page, hand)` / `releaseTrigger(page, hand)` - Trigger buttons
- `setControllerPosition(page, hand, position)` - Move virtual controller
- `setHandPinch(page, hand, isPinching)` - Set hand pinch state

### `types.ts`

TypeScript interfaces for test configuration:

- `TestGraphOptions` - Graph setup configuration
- `CameraState` - Camera state snapshot
- `MockController` / `MockHand` - XR input mocks

## Writing New Tests

### Direction Test Pattern

```typescript
test("input X causes direction Y", async () => {
    // 1. Record initial state
    const initial = await getCameraState(page);

    // 2. Apply input
    await applyInput();

    // 3. Wait for effect
    await waitForSettle(page);

    // 4. Verify direction
    const final = await getCameraState(page);
    assert.isAbove(final.position.x, initial.position.x, "Should move in positive X");
});
```

### Integration Test Pattern

```typescript
test("user action causes expected behavior", async () => {
    // 1. Navigate to appropriate story
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=story-id`);
    await waitForGraphReady(page);

    // 2. Perform user action
    const canvas = page.locator("canvas");
    await canvas.click({ position: { x: 200, y: 200 } });

    // 3. Verify result
    const result = await page.evaluate(() => {
        return document.querySelector("graphty-element")?.graph?.someProperty;
    });
    assert.strictEqual(result, expectedValue);
});
```

### XR Test Pattern

```typescript
test("XR input causes expected behavior", async () => {
    // 1. Setup XR environment
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=xr--default`);
    await waitForGraphReady(page);
    await setupIWER(page);
    await enterXRSession(page);

    // 2. Apply XR input
    await setThumbstick(page, "left", 0.8, 0);
    await waitForSettle(page, 30);

    // 3. Verify result
    const pivotRotation = await page.evaluate(() => {
        const graph = document.querySelector("graphty-element")?.graph;
        return graph?.getPivotController()?.pivot?.rotationQuaternion?.toEulerAngles().y;
    });
    assert.isAbove(pivotRotation, 0);
});
```

## Manual Testing Procedures

Some interactions are difficult to test automatically. Here are manual testing procedures:

### Testing Physical VR Hardware

1. Connect Quest headset
2. Open Storybook XR story in Quest Browser
3. Enter VR mode
4. Verify:
   - Left thumbstick rotates/pitches scene
   - Right thumbstick pans/zooms
   - Trigger picks and drags nodes
   - Hand tracking pinch works

### Testing Touch on Mobile

1. Open Storybook on mobile device
2. Navigate to 2D or 3D story
3. Verify:
   - Single finger pan works
   - Pinch zoom works
   - Two-finger rotate works (2D only)

## Architecture

```
test/interactions/
├── helpers/
│   ├── interaction-helpers.ts  # Core test utilities
│   ├── iwer-setup.ts          # XR emulation setup
│   └── helpers.test.ts        # Tests for helpers themselves
├── types.ts                    # TypeScript interfaces
├── unit/                       # Unit tests (NullEngine)
├── integration/                # Browser integration tests
├── xr/                         # XR emulation tests
└── edge-cases/                 # Edge case tests
```

## Related Documentation

- [IWER Documentation](https://github.com/meta-quest/immersive-web-emulator)
- [Playwright Testing](https://playwright.dev/docs/api/class-page)
- [Vitest Browser Mode](https://vitest.dev/guide/browser/)
- [CDP Touch Events](https://chromedevtools.github.io/devtools-protocol/tot/Input/#method-dispatchTouchEvent)
