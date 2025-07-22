# Babylon.js Playwright Testing Setup Guide

This comprehensive guide documents how Babylon.js uses Playwright for testing, including configuration, test patterns, and error detection mechanisms. Use this guide to replicate a similar testing infrastructure in your project.

## Table of Contents
1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Playwright Configuration](#playwright-configuration)
4. [Test Utilities Architecture](#test-utilities-architecture)
5. [Error Detection Mechanisms](#error-detection-mechanisms)
6. [Test Types and Patterns](#test-types-and-patterns)
7. [Interaction Testing](#interaction-testing)
8. [Visual Regression Testing](#visual-regression-testing)
9. [Performance Testing](#performance-testing)
10. [Package.json Scripts](#packagejson-scripts)
11. [Implementation Guide](#implementation-guide)

## Overview

Babylon.js uses Playwright for comprehensive testing across multiple rendering engines (WebGL1, WebGL2, WebGPU) with support for:
- Visual regression testing
- Performance benchmarking
- User interaction testing
- Cross-browser testing via BrowserStack
- Audio system testing
- WebXR/VR testing
- Tool/editor testing

## Project Structure

```
packages/tools/tests/
├── playwright/
│   ├── test/
│   │   ├── visualization/           # Visual regression test configs
│   │   │   ├── config.json         # Test case definitions
│   │   │   └── ReferenceImages/    # Expected screenshots
│   │   ├── performance/            # Performance test configs
│   │   └── interactions/           # Interaction test configs
│   ├── visualizationPlaywright.utils.ts  # Core test utilities
│   ├── visualization.*.test.ts    # Visual regression tests
│   ├── interaction.test.ts        # UI interaction tests
│   ├── performance.test.ts        # Performance tests
│   └── *.tools.test.ts           # Editor/tool tests
├── playwright.config.ts           # Main Playwright configuration
└── global-setup.ts               # BrowserStack setup

packages/dev/core/test/unit/
├── DeviceInput/                   # Core input system tests
│   ├── babylon.inputManager.test.ts      # InputManager unit tests
│   ├── babylon.deviceInput.test.ts       # Device input system tests
│   ├── babylon.webDeviceInputSystem.test.ts  # Web device input tests
│   └── testDeviceInputSystem.ts          # Mock device input system
├── Cameras/                       # Camera interaction tests
│   ├── babylon.arcRotateCameraInputs.test.ts  # Arc rotate camera tests
│   ├── babylon.freeCameraInputs.test.ts       # Free camera tests
│   └── babylon.cameraInputsManager.test.ts    # Camera input manager tests
```

## Playwright Configuration

### Main Configuration (`playwright.config.ts`)

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    // Test directory
    testDir: "./test",
    
    // Parallel execution
    fullyParallel: true,
    
    // Retry configuration
    retries: process.env.CI ? 2 : 1,
    
    // Worker configuration
    workers: process.env.CIWORKERS ? parseInt(process.env.CIWORKERS) : undefined,
    
    // Reporter configuration
    reporter: process.env.CI ? [
        ["line"],
        ["junit", { outputFile: "junit.xml" }],
        ["html", { outputFolder: "playwright-report" }]
    ] : "html",
    
    // Shared test settings
    use: {
        trace: "on-first-retry",
        video: "on-first-retry"
    },
    
    // Test projects for different engines/features
    projects: [
        {
            name: "webgl2",
            use: {
                ...devices["Desktop Chrome"],
                launchOptions: {
                    args: ["--use-angle=default", "--ignore-gpu-blacklist", "--ignore-gpu-blocklist"]
                }
            }
        },
        {
            name: "webgpu",
            use: {
                ...devices["Desktop Chrome"],
                launchOptions: {
                    args: ["--enable-unsafe-webgpu", "--use-angle=default"]
                }
            }
        },
        {
            name: "interaction",
            use: { ...devices["Desktop Chrome"] }
        },
        {
            name: "performance",
            use: { ...devices["Desktop Chrome"] }
        }
    ],
    
    // Snapshot configuration for visual regression
    snapshotPathTemplate: "{testDir}/{testFileDir}/ReferenceImages/{arg}{ext}"
});
```

## Test Utilities Architecture

### Core Utilities (`visualizationPlaywright.utils.ts`)

The main utility file provides a comprehensive testing framework:

```typescript
// Main function for running visualization tests
export const evaluatePlaywrightVisTests = async (
    engineType: "webgl2" | "webgl1" | "webgpu",
    configContext: string,
    useRightHandedSystem: boolean = false,
    logToConsole: boolean = false,
    logToFile: boolean = false,
    assertionEnabled: boolean = true,
    evalSuiteFn?: (page: Page, env: TestEnvironment) => void,
    configPath?: string,
    excludeRegex?: RegExp
) => {
    // Implementation details...
};

// Initialize Babylon.js engine
export const evaluateInitEngineForVisualization = async (
    page: Page,
    engineType: "webgl2" | "webgl1" | "webgpu",
    baseUrl: string,
    useRightHandedSystem: boolean = false,
    options?: any
) => {
    // Creates appropriate engine based on type
    // Configures engine options
    // Returns engine instance
};

// Load and prepare scenes
export const evaluatePrepareScene = async (
    page: Page,
    baseUrl: string,
    playgroundId?: string,
    globalCode?: string,
    createScene?: string,
    scriptToRun?: string,
    specificRoot?: string,
    sceneMetadata?: any,
    replaceUrl?: boolean
) => {
    // Loads scenes from various sources
    // Handles playground IDs, scripts, and files
    // Returns prepared scene
};

// Render scenes for testing
export const evaluateRenderSceneForVisualization = async (
    page: Page,
    renderCount: number = 1,
    shortDelay: boolean = false,
    waitTime: number = 0
) => {
    // Manages render loop
    // Handles timing and delays
    // Captures rendering errors
};

// Check for WebGL errors
export const evaluateIsGLError = async (page: Page) => {
    return await page.evaluate(() => {
        const gl = window.engine._gl;
        const error = gl.getError();
        return error !== gl.NO_ERROR;
    });
};
```

### Test Configuration Interface

```typescript
interface TestCase {
    title: string;
    playgroundId?: string;
    scriptToRun?: string;
    sceneFilename?: string;
    referenceImage?: string;
    renderCount?: number;
    replace?: boolean;
    excludedEngines?: string[];
    errorRatio?: number;
    threshold?: number;
}
```

## Error Detection Mechanisms

### 1. WebGL Error Detection
```typescript
// Check for GL errors after rendering
const hasGLError = await evaluateIsGLError(page);
if (hasGLError) {
    throw new Error("WebGL error detected during rendering");
}
```

### 2. Console Error Monitoring
```typescript
// Capture console errors
page.on("console", (msg) => {
    if (msg.type() === "error") {
        errors.push(msg.text());
    }
});
```

### 3. Visual Regression Thresholds
```typescript
// Configure screenshot comparison
await expect(page).toHaveScreenshot(referenceImage, {
    threshold: testCase.threshold || 0.035,  // 3.5% color change
    maxDiffPixelRatio: testCase.errorRatio || 0.011  // 1.1% pixels
});
```

### 4. Test Success Tracking
```typescript
// Global success flag
await page.evaluate(() => {
    window.testSuccessful = true;
});

// Verify at end of test
const success = await page.evaluate(() => window.testSuccessful);
expect(success).toBe(true);
```

### 5. Exception Handling
```typescript
try {
    await evaluateRenderSceneForVisualization(page, renderCount);
} catch (error) {
    console.error("Rendering failed:", error);
    throw error;
}
```

## Test Types and Patterns

### 1. Visual Regression Tests

```typescript
// Simple configuration-driven approach
evaluatePlaywrightVisTests("webgl2", "config", false, false, true, false);

// With custom test logic
evaluatePlaywrightVisTests(
    "webgl2",
    "config",
    false,
    false,
    true,
    true,
    (page, env) => {
        test.beforeEach(async () => {
            await evaluateInitEngineForVisualization(page, env.engineType, env.baseUrl);
        });
        
        test("custom visual test", async () => {
            await evaluatePrepareScene(page, env.baseUrl, "#ABCDEF");
            await evaluateRenderSceneForVisualization(page, 5);
            await expect(page).toHaveScreenshot("custom-test.png");
        });
    }
);
```

### 2. Interaction Tests

```typescript
test.describe("User Interactions", () => {
    let page: Page;
    
    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        await page.goto(baseUrl + "/empty.html");
        await page.waitForSelector("#babylon-canvas");
    });
    
    test("mouse interactions", async () => {
        // Initialize scene
        await page.evaluate(() => {
            const canvas = document.getElementById("babylon-canvas");
            const engine = new BABYLON.Engine(canvas);
            const scene = new BABYLON.Scene(engine);
            // Setup scene...
        });
        
        // Perform interactions
        await page.mouse.move(400, 300);
        await page.mouse.down({ button: "left" });
        await page.mouse.move(500, 400, { steps: 10 });
        await page.mouse.up({ button: "left" });
        
        // Verify results
        const result = await page.evaluate(() => {
            return window.scene.activeCamera.position;
        });
        expect(result).toBeDefined();
    });
});
```

### 3. Performance Tests

```typescript
test("performance regression", async ({ page }) => {
    const createScene = `
        function createScene() {
            // Scene setup code
            return scene;
        }
    `;
    
    // Test stable version
    const stableTime = await checkPerformanceOfScene(
        page, baseUrl, "stable", createScene, 5, 100
    );
    
    // Test development version
    const devTime = await checkPerformanceOfScene(
        page, baseUrl, "dev", createScene, 5, 100
    );
    
    // Compare performance (allow 5% regression)
    expect(devTime / stableTime).toBeLessThanOrEqual(1.05);
});
```

## Interaction Testing

Babylon.js implements comprehensive interaction testing using a two-tier approach that combines unit-level device simulation with integration-level browser automation.

### Two-Tier Testing Architecture

#### 1. Unit Tests with Mock Device System

The core interaction testing uses `TestDeviceInputSystem` to simulate all input devices without browser dependencies:

```typescript
// testDeviceInputSystem.ts - Mock device input system
export class TestDeviceInputSystem implements ITestDeviceInputSystem {
    // Simulate device connection
    connectDevice(deviceType: DeviceType, deviceSlot: number, numberOfInputs: number): void;
    
    // Simulate input changes
    changeInput(deviceType: DeviceType, deviceSlot: number, inputIndex: number, 
                currentState: number, createEvent?: boolean): void;
    
    // Poll current input state
    pollInput(deviceType: DeviceType, deviceSlot: number, inputIndex: number): number;
}
```

#### 2. Integration Tests with Playwright

Real browser interaction testing using Playwright's mouse and touch simulation:

```typescript
// Real browser mouse simulation
await page.mouse.move(x + width/2, y + height/2, { steps: 10 });
await page.mouse.down({ button: "left" });
await page.mouse.up({ button: "left" });
```

### Mouse Interaction Testing

#### Unit Level Mouse Tests

```typescript
// babylon.inputManager.test.ts
test("callbacks can pick and fire", () => {
    let downCt = 0, upCt = 0, moveCt = 0;
    
    const downFn = (evt: IPointerEvent, pickInfo: PickingInfo) => {
        if (pickInfo.hit) downHitCt++;
        downCt++;
    };
    
    scene.onPointerDown = downFn;
    scene.onPointerMove = moveFn;
    scene.onPointerUp = upFn;
    
    // Simulate mouse movement and clicks
    deviceInputSystem.changeInput(DeviceType.Mouse, 0, PointerInput.Horizontal, 128, false);
    deviceInputSystem.changeInput(DeviceType.Mouse, 0, PointerInput.Vertical, 128, false);
    deviceInputSystem.changeInput(DeviceType.Mouse, 0, PointerInput.Move, 1);
    deviceInputSystem.changeInput(DeviceType.Mouse, 0, PointerInput.LeftClick, 1);
    deviceInputSystem.changeInput(DeviceType.Mouse, 0, PointerInput.LeftClick, 0);
    
    expect(downCt).toBe(expected);
    expect(upCt).toBe(expected);
    expect(moveCt).toBe(expected);
});
```

#### Integration Level Mouse Tests

```typescript
// interaction.test.ts
test("can process InputManager pointer events", async () => {
    await page.evaluate(evaluatePrepareScene, {
        sceneMetadata: { playgroundId: "#YQUTAY#12" },
        globalConfig: getGlobalConfig(),
    });
    
    const element = page.locator("#babylon-canvas");
    const result = await element.boundingBox();
    
    // Test all mouse buttons
    await page.mouse.move(result.x + result.width / 2, result.y + result.height / 2, { steps: 10 });
    await page.mouse.down({ button: "left" });
    await page.mouse.up({ button: "left" });
    await page.mouse.down({ button: "right" });
    await page.mouse.up({ button: "right" });
    await page.mouse.down({ button: "middle" });
    await page.mouse.up({ button: "middle" });
    
    // Test double-click
    await page.evaluate(() => {
        BABYLON.Scene.DoubleClickDelay = 500;
    });
    await page.mouse.click(result.x + result.width / 2, result.y + result.height / 2);
    await page.mouse.click(result.x + result.width / 2, result.y + result.height / 2);
    
    const testStatus = await page.evaluate(() => window.testSuccessful);
    expect(testStatus).toBe(true);
});
```

### Touch Interaction Testing

#### Multi-Touch Support

```typescript
test("Does not fire POINTERTAP events during multi-touch gesture", () => {
    let tapCt = 0;
    
    scene?.onPointerObservable.add(() => {
        tapCt++;
    }, PointerEventTypes.POINTERTAP);
    
    // Connect multiple touch devices
    deviceInputSystem.connectDevice(DeviceType.Touch, 0, TestDeviceInputSystem.MAX_POINTER_INPUTS);
    deviceInputSystem.connectDevice(DeviceType.Touch, 1, TestDeviceInputSystem.MAX_POINTER_INPUTS);
    
    // Single tap - should fire
    deviceInputSystem.changeInput(DeviceType.Touch, 0, PointerInput.LeftClick, 1);
    deviceInputSystem.changeInput(DeviceType.Touch, 0, PointerInput.LeftClick, 0);
    
    // Multi-touch gesture - should NOT fire tap events
    deviceInputSystem.changeInput(DeviceType.Touch, 0, PointerInput.LeftClick, 1);
    deviceInputSystem.changeInput(DeviceType.Touch, 1, PointerInput.LeftClick, 1);
    deviceInputSystem.changeInput(DeviceType.Touch, 0, PointerInput.LeftClick, 0);
    deviceInputSystem.changeInput(DeviceType.Touch, 1, PointerInput.LeftClick, 0);
    
    expect(tapCt).toBe(1); // Only single tap counted
});
```

#### Pinch Gesture Testing

```typescript
test("pinch gesture detection", () => {
    // Setup two-finger touch
    deviceInputSystem.connectDevice(DeviceType.Touch, 0, TestDeviceInputSystem.MAX_POINTER_INPUTS);
    deviceInputSystem.connectDevice(DeviceType.Touch, 1, TestDeviceInputSystem.MAX_POINTER_INPUTS);
    
    // Start pinch gesture
    deviceInputSystem.changeInput(DeviceType.Touch, 0, PointerInput.LeftClick, 1);
    deviceInputSystem.changeInput(DeviceType.Touch, 1, PointerInput.LeftClick, 1);
    
    // Move fingers apart (zoom out)
    deviceInputSystem.changeInput(DeviceType.Touch, 0, PointerInput.Horizontal, 0, false);
    deviceInputSystem.changeInput(DeviceType.Touch, 0, PointerInput.Vertical, 0, false);
    deviceInputSystem.changeInput(DeviceType.Touch, 0, PointerInput.Move, 1);
    
    deviceInputSystem.changeInput(DeviceType.Touch, 1, PointerInput.Horizontal, 127, false);
    deviceInputSystem.changeInput(DeviceType.Touch, 1, PointerInput.Vertical, 127, false);
    deviceInputSystem.changeInput(DeviceType.Touch, 1, PointerInput.Move, 1);
    
    // End gesture
    deviceInputSystem.changeInput(DeviceType.Touch, 0, PointerInput.LeftClick, 0);
    deviceInputSystem.changeInput(DeviceType.Touch, 1, PointerInput.LeftClick, 0);
});
```

### Advanced Interaction Features

#### Pointer Capture Testing

```typescript
test("check pointer capture", async () => {
    await page.evaluate(evaluatePrepareScene, {
        sceneMetadata: { playgroundId: "#5NMCCT#2" },
        globalConfig: getGlobalConfig(),
    });
    
    const element = page.locator("#babylon-canvas");
    const result = await element.boundingBox();
    
    // Test pointer capture during drag
    await page.mouse.move(result.x + result.width / 2, result.y + result.height / 2);
    await page.mouse.down();
    await page.mouse.move(result.x + result.width / 2 + 200, result.y + result.height / 2, { steps: 10 });
    await page.mouse.up();
    
    const testStatus = await page.evaluate(() => window.testSuccessful);
    expect(testStatus).toBe(true);
});
```

#### Meta Key Testing

```typescript
test("check meta key allowing keyup", async () => {
    const element = page.locator("#babylon-canvas");
    const result = await element.boundingBox();
    
    await page.mouse.move(result.x + result.width / 2, result.y + result.height / 2);
    await page.mouse.click(result.x + result.width / 2, result.y + result.height / 2);
    
    // Test meta key combinations
    await page.keyboard.down("Meta");
    await page.keyboard.press("c");
    await page.keyboard.up("Meta");
    
    const testStatus = await page.evaluate(() => window.testSuccessful);
    expect(testStatus).toBe(true);
});
```

### Camera Control Testing

#### Arc Rotate Camera

```typescript
// babylon.arcRotateCameraInputs.test.ts
test("arc rotate camera mouse controls", () => {
    const camera = new ArcRotateCamera("camera", 0, 0, 10, Vector3.Zero(), scene);
    camera.attachControl();
    
    // Test rotation
    deviceInputSystem.changeInput(DeviceType.Mouse, 0, PointerInput.LeftClick, 1);
    deviceInputSystem.changeInput(DeviceType.Mouse, 0, PointerInput.Horizontal, 64, false);
    deviceInputSystem.changeInput(DeviceType.Mouse, 0, PointerInput.Move, 1);
    
    expect(camera.alpha).not.toBe(0); // Camera should have rotated
});
```

#### Free Camera with Pointer Lock

```typescript
test("stops movement when pointerlock is released", () => {
    const camera = new FreeCamera("camera", new Vector3(0, 0, -10), scene);
    camera.attachControl();
    
    // Enable pointer lock
    Object.defineProperty(document, "pointerLockElement", {
        value: canvas,
        writable: true,
    });
    engine.isPointerLock = true;
    
    // Test camera movement with pointer lock
    deviceInputSystem.changeInput(DeviceType.Mouse, 0, PointerInput.Move, 1);
    const offsetWithLock = camera.cameraRotation.x;
    
    // Disable pointer lock
    Object.defineProperty(document, "pointerLockElement", {
        value: undefined,
        writable: true,
    });
    
    // Movement should stop
    deviceInputSystem.changeInput(DeviceType.Mouse, 0, PointerInput.Move, 1);
    expect(camera.cameraRotation.x).toBe(offsetWithLock);
});
```

### Key Features Tested

#### 1. Lazy Picking Optimization

```typescript
test("onPointerObservable can pick only when necessary", () => {
    const pickSpy = jest.spyOn(scene, "pick");
    
    scene.onPointerObservable.add((eventData) => {
        // Only generate pick info when actually needed
        const pickInfo = eventData.pickInfo;
        expect(pickSpy).toHaveBeenCalledTimes(expectedCalls);
    });
    
    // Perform interactions
    deviceInputSystem.changeInput(DeviceType.Mouse, 0, PointerInput.Move, 1);
    
    // Verify picking optimization
    expect(pickSpy).toHaveBeenCalledTimes(minimumRequired);
});
```

#### 2. Utility Layer Isolation

```typescript
test("Doesn't let TAPs pass through utility layer", () => {
    let tapCt = 0;
    
    const utilityLayer = new UtilityLayerRenderer(scene);
    const ground = MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);
    const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 2 }, utilityLayer.utilityLayerScene);
    
    scene.onPointerObservable.add((eventData) => {
        if (eventData.pickInfo?.pickedMesh === ground) {
            tapCt++;
        }
    }, PointerEventTypes.POINTERTAP);
    
    // Tap on sphere - should NOT hit ground
    // Tap on ground - should hit ground
    expect(tapCt).toBe(1); // Only ground tap counted
});
```

#### 3. Double-Click Detection

```typescript
test("onPointerObservable returns correct PointerEventTypes", () => {
    let tapCt = 0, dblTapCt = 0;
    
    scene.onPointerObservable.add((eventData) => {
        switch (eventData.type) {
            case PointerEventTypes.POINTERTAP:
                tapCt++;
                break;
            case PointerEventTypes.POINTERDOUBLETAP:
                dblTapCt++;
                break;
        }
    });
    
    // Perform double-click
    deviceInputSystem.changeInput(DeviceType.Mouse, 0, PointerInput.LeftClick, 1);
    deviceInputSystem.changeInput(DeviceType.Mouse, 0, PointerInput.LeftClick, 0);
    deviceInputSystem.changeInput(DeviceType.Mouse, 0, PointerInput.LeftClick, 1);
    deviceInputSystem.changeInput(DeviceType.Mouse, 0, PointerInput.LeftClick, 0);
    
    expect(tapCt).toBe(expectedTaps);
    expect(dblTapCt).toBe(expectedDoubleTaps);
});
```

### Testing Best Practices

#### 1. Device State Management

```typescript
beforeEach(() => {
    // Connect required devices
    deviceInputSystem = TestDeviceInputSystem.ConvertToITestDISRef(engine._deviceSourceManager._deviceInputSystem);
    deviceInputSystem.connectDevice(DeviceType.Mouse, 0, TestDeviceInputSystem.MAX_POINTER_INPUTS);
    deviceInputSystem.connectDevice(DeviceType.Touch, 0, TestDeviceInputSystem.MAX_POINTER_INPUTS);
});

afterEach(() => {
    // Clean up camera controls
    camera?.detachControl();
    scene?.dispose();
    engine?.dispose();
});
```

#### 2. Input State Reset

```typescript
test("can reset touch inputs on detachControl", () => {
    camera.attachControl();
    
    // Perform touch interaction
    deviceInputSystem.changeInput(DeviceType.Touch, 1, PointerInput.LeftClick, 1);
    deviceInputSystem.changeInput(DeviceType.Touch, 1, PointerInput.Move, 1);
    
    // Detach controls should reset input state
    camera.detachControl();
    
    // Verify state is reset
    camera.attachControl();
    // Test that previous touch state doesn't interfere
});
```

#### 3. Timing and Synchronization

```typescript
// Use fake timers for consistent timing tests
jest.useFakeTimers();

test("double-click timing", async () => {
    const DoubleClickDelay = 300;
    
    // First click
    deviceInputSystem.changeInput(DeviceType.Mouse, 0, PointerInput.LeftClick, 1);
    deviceInputSystem.changeInput(DeviceType.Mouse, 0, PointerInput.LeftClick, 0);
    
    // Advance time
    jest.advanceTimersByTime(DoubleClickDelay / 2);
    
    // Second click (within double-click window)
    deviceInputSystem.changeInput(DeviceType.Mouse, 0, PointerInput.LeftClick, 1);
    deviceInputSystem.changeInput(DeviceType.Mouse, 0, PointerInput.LeftClick, 0);
    
    expect(dblTapCt).toBe(1);
});
```

The interaction testing in Babylon.js demonstrates a sophisticated approach that covers:
- **Low-level device simulation** for unit testing
- **Real browser interaction** for integration testing
- **Multi-touch gesture detection**
- **Camera control validation**
- **Performance optimizations** (lazy picking)
- **Cross-platform compatibility**
- **Edge case handling** (pointer lock, utility layers)

This comprehensive approach ensures reliable interaction behavior across different devices and input methods.

## Visual Regression Testing

### Configuration Format (`config.json`)

```json
{
    "root": "https://cdn.babylonjs.com",
    "tests": [
        {
            "title": "Basic Scene",
            "playgroundId": "#ABC123",
            "referenceImage": "basic-scene.png",
            "renderCount": 5,
            "errorRatio": 0.02,
            "threshold": 0.04
        },
        {
            "title": "Complex Materials",
            "scriptToRun": "path/to/script.js",
            "referenceImage": "complex-materials.png",
            "excludedEngines": ["webgl1"],
            "replace": true
        }
    ]
}
```

### Screenshot Management

1. **Reference Images**: Stored in `test/visualization/ReferenceImages/`
2. **Naming Convention**: Match test title with `.png` extension
3. **Update Process**: Use `--update-snapshots` flag to update references

```bash
# Update all snapshots
npm run test:visualization -- --update-snapshots

# Update specific test snapshots
npm run test:visualization -- --update-snapshots -g "Basic Scene"
```

## Performance Testing

### Performance Test Structure

```typescript
async function checkPerformanceOfScene(
    page: Page,
    baseUrl: string,
    version: "stable" | "dev",
    createSceneScript: string,
    passes: number,
    frames: number
): Promise<number> {
    // Load appropriate version
    await page.goto(`${baseUrl}/${version}/empty.html`);
    
    // Initialize engine and scene
    await page.evaluate(createSceneScript);
    
    // Measure performance
    const times = [];
    for (let i = 0; i < passes; i++) {
        const startTime = await page.evaluate(() => performance.now());
        
        // Render frames
        for (let j = 0; j < frames; j++) {
            await page.evaluate(() => {
                window.scene.render();
            });
        }
        
        const endTime = await page.evaluate(() => performance.now());
        times.push(endTime - startTime);
    }
    
    // Return average time
    return times.reduce((a, b) => a + b) / times.length;
}
```

## Package.json Scripts

```json
{
    "scripts": {
        "test": "npm run test:unit && npm run test:visualization",
        "test:unit": "jest",
        "test:visualization": "playwright test",
        "test:visualization:ui": "playwright test --ui",
        "test:visualization:webgl2": "playwright test --project=webgl2",
        "test:visualization:webgpu": "playwright test --project=webgpu",
        "test:performance": "playwright test --project=performance",
        "test:interactions": "playwright test --project=interaction",
        "test:audioV2": "playwright test --project=audioV2",
        "test:browserstack": "BROWSERSTACK=true playwright test"
    }
}
```

## Implementation Guide

### Step 1: Install Dependencies

```bash
npm install --save-dev @playwright/test playwright
```

### Step 2: Create Configuration Structure

```
your-project/
├── playwright.config.ts
├── tests/
│   ├── utils/
│   │   └── test-helpers.ts
│   ├── visual/
│   │   ├── config.json
│   │   └── reference-images/
│   ├── performance/
│   └── interaction/
```

### Step 3: Implement Core Utilities

Create a utilities file with essential functions:
- Engine initialization
- Scene preparation
- Rendering management
- Error detection
- Screenshot comparison

### Step 4: Set Up Test Projects

Configure different test projects in `playwright.config.ts`:
- Different rendering engines
- Browser configurations
- Test-specific settings

### Step 5: Create Test Templates

#### Visual Regression Template
```typescript
import { evaluatePlaywrightVisTests } from "./utils/test-helpers";

evaluatePlaywrightVisTests("webgl2", "config", false, false, true, true);
```

#### Interaction Test Template
```typescript
import { test, expect } from "@playwright/test";

test.describe("Feature Tests", () => {
    test("interaction test", async ({ page }) => {
        // Test implementation
    });
});
```

### Step 6: Configure Error Detection

1. **WebGL Errors**: Check GL error state after rendering
2. **Console Monitoring**: Capture and analyze console output
3. **Visual Thresholds**: Set appropriate comparison thresholds
4. **Performance Metrics**: Define acceptable performance ranges

### Step 7: Set Up CI/CD Integration

```yaml
# Example GitHub Actions workflow
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:visualization
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## Best Practices

1. **Modular Test Structure**: Organize tests by feature/engine type
2. **Configuration-Driven Tests**: Use JSON configs for maintainability
3. **Reusable Utilities**: Create shared helper functions
4. **Comprehensive Error Detection**: Implement multiple error checking mechanisms
5. **Performance Monitoring**: Track performance regressions
6. **Visual Regression Thresholds**: Fine-tune thresholds based on your needs
7. **Parallel Execution**: Leverage Playwright's parallel capabilities
8. **Cross-Browser Testing**: Test across multiple browsers/platforms

## Advanced Features

### BrowserStack Integration

```typescript
// global-setup.ts
import { BrowserStackLocal } from "browserstack-local";

export default async function globalSetup() {
    if (process.env.BROWSERSTACK) {
        const local = new BrowserStackLocal();
        await new Promise((resolve, reject) => {
            local.start({ key: process.env.BROWSERSTACK_ACCESS_KEY }, (err) => {
                if (err) reject(err);
                else resolve(void 0);
            });
        });
        process.env.BROWSERSTACK_LOCAL_IDENTIFIER = local.localIdentifier;
    }
}
```

### Custom Test Reporters

```typescript
// custom-reporter.ts
class CustomReporter {
    onTestEnd(test, result) {
        if (result.status === "failed" && test.title.includes("visual")) {
            // Handle visual test failures
            console.log(`Visual test failed: ${test.title}`);
            // Generate diff images, upload to storage, etc.
        }
    }
}
```

## Troubleshooting

### Common Issues and Solutions

1. **Flaky Visual Tests**
   - Increase render count before capture
   - Add delays for animations to complete
   - Use more lenient thresholds

2. **WebGL Context Loss**
   - Implement context restoration handling
   - Add retry logic for context-dependent tests

3. **Performance Variations**
   - Run multiple passes and average results
   - Use dedicated performance testing machines
   - Disable background processes

4. **Cross-Browser Differences**
   - Use browser-specific thresholds
   - Handle vendor-specific WebGL extensions
   - Test feature availability before use

## Conclusion

This guide provides a comprehensive overview of Babylon.js's Playwright testing infrastructure. The key to successful implementation is:

1. Start with basic visual regression tests
2. Gradually add interaction and performance tests
3. Fine-tune error detection and thresholds
4. Maintain good test organization and documentation
5. Continuously monitor and improve test reliability

The modular, configuration-driven approach used by Babylon.js makes it easy to maintain and scale tests as your project grows.