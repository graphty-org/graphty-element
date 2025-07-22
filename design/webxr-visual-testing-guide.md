# WebXR Visual Regression Testing Guide

Yes, you can absolutely test WebXR visual rendering to ensure consistency! This guide covers multiple approaches to implement comprehensive WebXR visual regression testing.

## Table of Contents
1. [Overview](#overview)
2. [Testing Approaches](#testing-approaches)
3. [IWER Setup (Babylon.js Approach)](#iwer-setup-babylonjs-approach)
4. [Alternative Testing Methods](#alternative-testing-methods)
5. [Stereo Rendering Capture](#stereo-rendering-capture)
6. [Implementation Examples](#implementation-examples)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## Overview

WebXR visual testing presents unique challenges:
- **Stereo Rendering**: Two eyes require separate image captures
- **Device Simulation**: Need to emulate various XR devices
- **Viewport Differences**: VR uses different viewports than desktop
- **Tracking Simulation**: Head/controller movement affects rendering
- **Performance Considerations**: Frame rates and timing matter

## Testing Approaches

### 1. **Emulator-Based Testing (Recommended)**
Uses libraries like IWER to simulate WebXR devices in a browser environment.

**Pros:**
- Most realistic WebXR API simulation
- Supports multiple device types
- Works in CI/CD environments
- No physical hardware required

**Cons:**
- Dependent on emulator quality
- May not catch device-specific issues

### 2. **Mock-Based Testing**
Creates custom WebXR API mocks for controlled testing.

**Pros:**
- Complete control over test scenarios
- Deterministic behavior
- Fast execution
- Easy to set up edge cases

**Cons:**
- Less realistic than emulator
- Requires maintaining mock implementations

### 3. **Hybrid Approach**
Combines emulator for basic testing with physical device validation.

**Pros:**
- Best of both worlds
- Catches real-world issues
- Comprehensive coverage

**Cons:**
- More complex setup
- Requires physical hardware for final validation

## IWER Setup (Babylon.js Approach)

### Installation and Configuration

```typescript
// In your Playwright test
await page.addScriptTag({
    url: "https://unpkg.com/iwer/build/iwer.min.js",
});

// Configure device emulation
await page.evaluate(() => {
    // Available devices: metaQuest2, metaQuest3, metaQuestPro, vive, etc.
    const xrDevice = new (window as any).IWER.XRDevice((window as any).IWER.metaQuest3);
    xrDevice.installRuntime();
    xrDevice.stereoEnabled = true;
    
    // Optional: Configure device properties
    xrDevice.ipd = 0.064; // Interpupillary distance in meters
    xrDevice.fovy = Math.PI / 2; // Field of view
    
    // Set initial pose
    xrDevice.pose = {
        position: [0, 1.6, 0], // Standing height
        orientation: [0, 0, 0, 1] // Identity quaternion
    };
});
```

### Device Configuration Options

```typescript
// Meta Quest 3 Configuration
const quest3Config = {
    name: "Meta Quest 3",
    stereoEnabled: true,
    ipd: 0.064,
    displayRefreshRate: 120,
    supportedFeatures: [
        "viewer",
        "local",
        "local-floor",
        "bounded-floor",
        "unbounded"
    ]
};

// Configure controllers
xrDevice.controllers = [
    {
        handedness: "left",
        profiles: ["oculus-touch-v3", "generic-trigger-touchpad"],
        pose: { position: [-0.3, 1.4, -0.3], orientation: [0, 0, 0, 1] }
    },
    {
        handedness: "right", 
        profiles: ["oculus-touch-v3", "generic-trigger-touchpad"],
        pose: { position: [0.3, 1.4, -0.3], orientation: [0, 0, 0, 1] }
    }
];
```

## Alternative Testing Methods

### 1. Custom WebXR Mock

```typescript
// webxr-mock.ts
class WebXRMock {
    static install() {
        // Mock XRSystem
        (navigator as any).xr = {
            isSessionSupported: jest.fn().mockResolvedValue(true),
            requestSession: jest.fn().mockImplementation(this.createMockSession)
        };
    }
    
    static createMockSession(mode: string) {
        return Promise.resolve({
            mode,
            environmentBlendMode: "opaque",
            inputSources: [],
            renderState: {
                baseLayer: null,
                depthFar: 1000,
                depthNear: 0.1,
                inlineVerticalFieldOfView: null
            },
            
            // Mock session methods
            requestReferenceSpace: jest.fn().mockResolvedValue({
                // Mock reference space
            }),
            
            requestAnimationFrame: jest.fn((callback) => {
                // Mock XR frame
                const frame = {
                    session: this,
                    getViewerPose: jest.fn().mockReturnValue({
                        transform: {
                            position: { x: 0, y: 1.6, z: 0 },
                            orientation: { x: 0, y: 0, z: 0, w: 1 }
                        },
                        views: [
                            {
                                eye: "left",
                                projectionMatrix: new Float32Array(16),
                                transform: {
                                    position: { x: -0.032, y: 1.6, z: 0 },
                                    orientation: { x: 0, y: 0, z: 0, w: 1 }
                                }
                            },
                            {
                                eye: "right",
                                projectionMatrix: new Float32Array(16),
                                transform: {
                                    position: { x: 0.032, y: 1.6, z: 0 },
                                    orientation: { x: 0, y: 0, z: 0, w: 1 }
                                }
                            }
                        ]
                    })
                };
                
                setTimeout(() => callback(0, frame), 16); // 60 FPS
                return 1;
            }),
            
            end: jest.fn().mockResolvedValue(undefined)
        });
    }
}
```

### 2. WebXR Polyfill Approach

```typescript
// Using webxr-polyfill for testing
import WebXRPolyfill from "webxr-polyfill";

// In test setup
const polyfill = new WebXRPolyfill();

// Configure for testing
await page.evaluate(() => {
    // Force polyfill usage for consistent testing
    (window as any).XRSystem = (window as any).WebXRPolyfill.XRSystem;
});
```

## Stereo Rendering Capture

### Capturing Both Eyes

```typescript
// Method 1: Separate eye captures
async function captureStereoPair(page: Page) {
    // Enter VR mode
    await page.evaluate(() => {
        document.querySelector('.vr-button')?.click();
    });
    
    // Wait for VR session to start
    await page.waitForFunction(() => window.vrSession?.mode === "immersive-vr");
    
    // Capture left eye
    await page.evaluate(() => {
        window.engine.setViewport(window.leftEyeViewport);
    });
    const leftEye = await page.screenshot({
        clip: { x: 0, y: 0, width: 1920, height: 1080 }
    });
    
    // Capture right eye
    await page.evaluate(() => {
        window.engine.setViewport(window.rightEyeViewport);
    });
    const rightEye = await page.screenshot({
        clip: { x: 1920, y: 0, width: 1920, height: 1080 }
    });
    
    return { leftEye, rightEye };
}

// Method 2: Side-by-side capture
async function captureSideBySide(page: Page) {
    // Configure stereo rendering to render side-by-side
    await page.evaluate(() => {
        window.engine.setSize(3840, 1080); // Double width for stereo
    });
    
    return await page.screenshot({
        clip: { x: 0, y: 0, width: 3840, height: 1080 }
    });
}
```

### Canvas-Based Capture

```typescript
// Capture directly from WebGL canvas
async function captureWebGLCanvas(page: Page) {
    return await page.evaluate(() => {
        const canvas = document.querySelector('#xr-canvas') as HTMLCanvasElement;
        return canvas.toDataURL('image/png');
    });
}

// Capture with custom render target
async function captureRenderTarget(page: Page) {
    return await page.evaluate(() => {
        // Create render target for capture
        const renderTarget = new BABYLON.RenderTargetTexture(
            "capture", 
            { width: 2048, height: 1024 }, 
            scene
        );
        
        // Render both eyes to target
        renderTarget.renderList = scene.meshes;
        scene.render();
        
        // Get image data
        return renderTarget.readPixels();
    });
}
```

## Implementation Examples

### 1. Basic WebXR Visual Test

```typescript
// webxr-visual.test.ts
import { test, expect } from "@playwright/test";

test.describe("WebXR Visual Regression", () => {
    test.beforeEach(async ({ page }) => {
        // Setup IWER
        await page.addScriptTag({
            url: "https://unpkg.com/iwer/build/iwer.min.js",
        });
        
        await page.evaluate(() => {
            const xrDevice = new (window as any).IWER.XRDevice((window as any).IWER.metaQuest3);
            xrDevice.installRuntime();
            xrDevice.stereoEnabled = true;
        });
        
        // Navigate to test page
        await page.goto("/webxr-test.html");
        await page.waitForSelector("#xr-canvas");
    });
    
    test("VR scene renders correctly", async ({ page }) => {
        // Initialize WebXR scene
        await page.evaluate(async () => {
            await window.initWebXRScene();
        });
        
        // Enter VR mode
        await page.click(".vr-button");
        await page.waitForFunction(() => window.xrSession?.mode === "immersive-vr");
        
        // Wait for scene to stabilize
        await page.waitForTimeout(1000);
        
        // Capture stereo rendering
        const screenshot = await page.screenshot({
            fullPage: false,
            clip: { x: 0, y: 0, width: 2048, height: 1024 }
        });
        
        // Compare with reference
        expect(screenshot).toMatchSnapshot("vr-scene-stereo.png", {
            threshold: 0.05 // 5% difference allowed
        });
    });
});
```

### 2. Multi-Device Testing

```typescript
// webxr-devices.test.ts
const devices = [
    { name: "Quest3", config: "metaQuest3" },
    { name: "Quest2", config: "metaQuest2" },
    { name: "QuestPro", config: "metaQuestPro" },
    { name: "Vive", config: "vive" }
];

devices.forEach(({ name, config }) => {
    test(`VR rendering on ${name}`, async ({ page }) => {
        // Configure specific device
        await page.evaluate((deviceConfig) => {
            const xrDevice = new (window as any).IWER.XRDevice(
                (window as any).IWER[deviceConfig]
            );
            xrDevice.installRuntime();
            xrDevice.stereoEnabled = true;
        }, config);
        
        // Run test scenario
        await runWebXRTest(page);
        
        // Device-specific screenshot
        await expect(page).toHaveScreenshot(`vr-${name.toLowerCase()}.png`);
    });
});
```

### 3. Animation and Interaction Testing

```typescript
test("VR controller interactions", async ({ page }) => {
    // Setup scene with interactive objects
    await page.evaluate(() => {
        window.setupInteractiveScene();
    });
    
    // Simulate controller movement
    await page.evaluate(() => {
        const device = (window as any).IWER.currentDevice;
        
        // Move right controller to object
        device.controllers[1].pose = {
            position: [0.5, 1.4, -0.5],
            orientation: [0, 0, 0, 1]
        };
        
        // Trigger controller button
        device.controllers[1].buttons[0].pressed = true;
    });
    
    // Wait for interaction animation
    await page.waitForTimeout(500);
    
    // Capture result
    await expect(page).toHaveScreenshot("vr-interaction-result.png");
});

test("VR head tracking", async ({ page }) => {
    // Test different head positions
    const poses = [
        { position: [0, 1.6, 0], name: "center" },
        { position: [0.5, 1.6, 0], name: "right" },
        { position: [-0.5, 1.6, 0], name: "left" },
        { position: [0, 1.8, 0], name: "up" }
    ];
    
    for (const pose of poses) {
        await page.evaluate((poseData) => {
            const device = (window as any).IWER.currentDevice;
            device.pose = {
                position: poseData.position,
                orientation: [0, 0, 0, 1]
            };
        }, pose);
        
        await page.waitForTimeout(100); // Let render settle
        
        await expect(page).toHaveScreenshot(`vr-head-${pose.name}.png`);
    }
});
```

## Best Practices

### 1. **Consistent Test Environment**

```typescript
// Setup consistent rendering environment
await page.evaluate(() => {
    // Disable WebXR optimizations that might affect testing
    window.engine.enableOfflineSupport = false;
    window.engine.disablePerformanceMonitorInBackground = true;
    
    // Use fixed viewport
    window.engine.setSize(2048, 1024);
    
    // Disable adaptive quality
    window.engine.adaptToDeviceRatio = false;
});
```

### 2. **Timing and Synchronization**

```typescript
// Wait for WebXR session to be fully ready
async function waitForXRReady(page: Page) {
    await page.waitForFunction(() => {
        return window.xrSession && 
               window.xrSession.renderState && 
               window.xrReferenceSpace &&
               window.scene.activeCamera;
    });
    
    // Additional render frames to ensure stability
    await page.evaluate(() => {
        return new Promise(resolve => {
            let frames = 0;
            function renderFrame() {
                window.scene.render();
                frames++;
                if (frames >= 5) {
                    resolve(undefined);
                } else {
                    requestAnimationFrame(renderFrame);
                }
            }
            renderFrame();
        });
    });
}
```

### 3. **Error Handling**

```typescript
// Check for WebXR-specific errors
async function checkWebXRErrors(page: Page) {
    const errors = await page.evaluate(() => {
        const errors = [];
        
        // Check WebGL errors
        const gl = window.engine._gl;
        const glError = gl.getError();
        if (glError !== gl.NO_ERROR) {
            errors.push(`WebGL Error: ${glError}`);
        }
        
        // Check WebXR session state
        if (window.xrSession?.ended) {
            errors.push("WebXR session ended unexpectedly");
        }
        
        // Check console errors
        if (window.xrErrors && window.xrErrors.length > 0) {
            errors.push(...window.xrErrors);
        }
        
        return errors;
    });
    
    if (errors.length > 0) {
        throw new Error(`WebXR errors detected: ${errors.join(", ")}`);
    }
}
```

### 4. **Performance Monitoring**

```typescript
// Monitor frame rate and performance
async function checkWebXRPerformance(page: Page) {
    const metrics = await page.evaluate(() => {
        return new Promise(resolve => {
            const startTime = performance.now();
            let frameCount = 0;
            
            function measureFrames() {
                frameCount++;
                if (frameCount >= 60) { // Measure 60 frames
                    const endTime = performance.now();
                    const fps = 60000 / (endTime - startTime);
                    resolve({ fps, frameTime: (endTime - startTime) / 60 });
                } else {
                    requestAnimationFrame(measureFrames);
                }
            }
            
            requestAnimationFrame(measureFrames);
        });
    });
    
    expect(metrics.fps).toBeGreaterThan(80); // Minimum FPS for VR
    expect(metrics.frameTime).toBeLessThan(11); // Max 11ms per frame for 90fps
}
```

## Troubleshooting

### Common Issues

1. **IWER Not Loading**
```typescript
// Ensure IWER is fully loaded
await page.waitForFunction(() => typeof (window as any).IWER !== 'undefined');
```

2. **Stereo Rendering Not Working**
```typescript
// Verify stereo configuration
await page.evaluate(() => {
    const device = (window as any).IWER.currentDevice;
    console.log("Stereo enabled:", device.stereoEnabled);
    console.log("IPD:", device.ipd);
});
```

3. **Screenshots Not Capturing VR Content**
```typescript
// Use canvas capture instead of page screenshot
const vrImage = await page.evaluate(() => {
    const canvas = document.querySelector('#renderCanvas') as HTMLCanvasElement;
    return canvas.toDataURL();
});
```

4. **Inconsistent Timing**
```typescript
// Use frame-based waiting instead of time-based
await page.evaluate(() => {
    return new Promise(resolve => {
        let frameCount = 0;
        function waitFrames() {
            if (frameCount++ >= 10) {
                resolve(undefined);
            } else {
                requestAnimationFrame(waitFrames);
            }
        }
        waitFrames();
    });
});
```

### Debug Utilities

```typescript
// Debug WebXR state
async function debugWebXRState(page: Page) {
    const state = await page.evaluate(() => {
        return {
            hasXR: !!navigator.xr,
            hasIWER: !!(window as any).IWER,
            session: window.xrSession?.mode,
            referenceSpace: !!window.xrReferenceSpace,
            frameRate: window.xrSession?.frameRate,
            renderState: {
                baseLayer: !!window.xrSession?.renderState?.baseLayer,
                inlineVerticalFieldOfView: window.xrSession?.renderState?.inlineVerticalFieldOfView
            }
        };
    });
    
    console.log("WebXR Debug State:", JSON.stringify(state, null, 2));
}
```

## Conclusion

WebXR visual regression testing is definitely achievable with the right approach:

1. **Use IWER** for realistic device emulation
2. **Capture stereo rendering** appropriately
3. **Implement proper timing** and synchronization
4. **Monitor performance** and errors
5. **Test multiple devices** and scenarios

The key is to establish a consistent, reproducible testing environment that accurately represents the WebXR experience while being reliable enough for CI/CD integration.