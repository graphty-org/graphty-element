# Implementation Plan for Screen Capture Feature

## Overview

This plan implements screenshot and video capture capabilities for graphty-element, enabling users to export visualizations as images (PNG/JPEG/WebP) and videos (WebM). The implementation supports both 2D orthographic and 3D perspective cameras, integrates with the existing OperationQueueManager, and provides flexible camera positioning APIs.

## Testing Strategy

### Uniform Testing Approach Across All Phases

**Core Principle**: Mock BabylonJS APIs to test our logic without requiring actual WebGL rendering. Trust BabylonJS's well-tested rendering engine, focus on testing our wrapper code.

#### Pattern for All Phases:

```typescript
// 1. UNIT TESTS: Mock BabylonJS/Browser APIs
vi.mock('@babylonjs/core', () => ({
  CreateScreenshotAsync: vi.fn().mockResolvedValue(
    'data:image/png;base64,iVBORw0KGgo...'  // Fake PNG
  ),
  Engine: MockEngine,
  Scene: MockScene,
}));

// 2. TEST OUR LOGIC: Dimensions, formats, errors, destinations
test('captureScreenshot calculates dimensions correctly', async () => {
  const result = await graph.captureScreenshot({ multiplier: 2 });

  // Test OUR dimension calculation logic
  assert.equal(result.metadata.width, canvas.width * 2);
  assert.equal(result.metadata.height, canvas.height * 2);
});

// 3. E2E SMOKE TEST: One Storybook test verifies integration
test('E2E: screenshot actually works in browser', async () => {
  await page.goto('http://localhost:9025/?path=/story/screenshot--basic');
  await page.click('button:has-text("Download PNG")');

  // Verify blob was created
  const result = await page.evaluate(() => lastScreenshotResult);
  assert.ok(result.blob instanceof Blob);
});
```

### What We Test vs. What We Trust:

**✅ We Test (Our Code)**:
- Dimension calculations and validation
- Format selection logic
- Clipboard error handling (permission denied, not supported, etc.)
- Download triggering
- Option parsing and precedence rules
- Camera state management
- Preset resolution
- Error code mapping

**🔧 We Trust (BabylonJS/Browser)**:
- `CreateScreenshotAsync` produces valid PNG data
- `MediaRecorder` produces valid WebM video
- Babylon.js `Animation` interpolates correctly
- Canvas rendering is accurate

### Video Testing (Phases 7-8)

Same pattern as screenshots:

```typescript
// Mock MediaRecorder or Babylon VideoRecorder
vi.mock('@babylonjs/core', () => ({
  VideoRecorder: class MockVideoRecorder {
    startRecording = vi.fn();
    stopRecording = vi.fn().mockResolvedValue(new Blob([], { type: 'video/webm' }));
  }
}));

// Test our logic: frame counting, progress events, path animation
test('video capture tracks frame count correctly', async () => {
  const result = await graph.captureAnimation({
    duration: 1000,
    fps: 30
  });

  assert.equal(result.metadata.framesCaptured, 30);
});
```

### Benefits of This Approach:
- ✅ Fast tests (no actual rendering)
- ✅ Reliable (no GPU/driver issues)
- ✅ Focus on our code quality
- ✅ Easy to test error conditions
- ✅ One E2E test catches integration bugs

---

## Key Implementation Principle: User-Verifiable Functionality at Each Phase

**IMPORTANT**: Each phase exposes working APIs on `<graphty-element>` immediately, allowing users to trigger screenshots/videos and view results. This differs from a typical "implement everything, then expose APIs" approach. Instead:

- **Phase 1**: `captureScreenshot()` API exposed → Users can download screenshots
- **Phase 2-3**: Screenshot features expand → Users can test new options immediately
- **Phase 4**: Camera APIs exposed → Users can control camera position
- **Phase 5**: Camera presets available → Users can use built-in presets
- **Phase 6**: Combined features → Users can screenshot from specific camera angles
- **Phase 7**: Video API exposed → Users can capture videos
- **Phase 8**: Animated camera videos → Users can create camera tours
- **Phase 9**: Documentation and polish → Everything is production-ready

Each phase includes:
- **Unit tests** (with mocked dependencies, written first)
- **Storybook stories** with interactive buttons
- **Manual verification** steps for user testing
- **Browser console examples** for quick experimentation

## Phase Breakdown

### Phase 1: Core Screenshot Infrastructure (2-3 days)

**Objective**: Implement basic screenshot capture with format selection, resolution control, and destination handling (blob/download/clipboard).

**Duration**: 2-3 days

**Testing Approach**: Mock `CreateScreenshotAsync`, test our dimension/clipboard/format logic.

**Tests to Write First**:

- `test/browser/screenshot/screenshot-core.test.ts`: Core screenshot functionality with mocks
  ```typescript
  import { vi } from 'vitest';
  import * as BABYLON from '@babylonjs/core';

  // Mock CreateScreenshotAsync to return fake PNG
  vi.spyOn(BABYLON, 'CreateScreenshotAsync').mockResolvedValue(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
  );

  // Test: Basic screenshot capture returns ScreenshotResult
  test('captureScreenshot returns valid ScreenshotResult with blob', async () => {
    const result = await graph.captureScreenshot();

    assert.ok(result.blob instanceof Blob);
    assert.ok(result.metadata.width > 0);
    assert.ok(result.metadata.height > 0);
    assert.ok(result.metadata.byteSize > 0);
  });

  // Test: Format selection works correctly
  test('captureScreenshot supports PNG, JPEG, WebP formats', async () => {
    const png = await graph.captureScreenshot({ format: 'png' });
    assert.equal(png.metadata.format, 'png');

    const jpeg = await graph.captureScreenshot({ format: 'jpeg' });
    assert.equal(jpeg.metadata.format, 'jpeg');

    const webp = await graph.captureScreenshot({ format: 'webp' });
    assert.equal(webp.metadata.format, 'webp');
  });

  // REMOVED: Don't test preserveDrawingBuffer validation
  // Trust that CreateScreenshotAsync handles this internally
  ```

- `test/browser/screenshot/screenshot-destinations.test.ts`: Destination handling
  ```typescript
  // Test: Multiple destinations work simultaneously
  test('handles multiple destinations (blob + download + clipboard)', async () => {
    const result = await graph.captureScreenshot({
      destination: { blob: true, download: true, clipboard: true }
    });

    assert.ok(result.blob instanceof Blob);
    assert.ok(typeof result.downloaded === 'boolean');
    assert.ok(['success', 'not-supported', 'permission-denied', 'not-secure-context', 'failed']
      .includes(result.clipboardStatus));
  });

  // Test: Clipboard error handling
  test('handles clipboard permission denied gracefully', async () => {
    // Mock clipboard to simulate permission denial
    const mockClipboard = {
      write: vi.fn().mockRejectedValue(new Error('Permission denied'))
    };
    vi.stubGlobal('navigator', { clipboard: mockClipboard });

    const result = await graph.captureScreenshot({
      destination: { clipboard: true }
    });

    assert.equal(result.clipboardStatus, 'permission-denied');
    assert.ok(result.clipboardError instanceof Error);
  });
  ```

- **E2E Smoke Test** (one test to verify integration):
  ```typescript
  // test/e2e/screenshot-smoke.test.ts
  test('E2E: screenshot actually works in Storybook', async () => {
    const page = await browser.newPage();
    await page.goto('http://localhost:9025/?path=/story/screenshot--basic-capture');

    // Click screenshot button
    await page.click('button:has-text("Download PNG Screenshot")');

    // Verify blob was created (check console logs or events)
    const logs = await page.evaluate(() => {
      return window.lastScreenshotResult?.blob instanceof Blob;
    });

    assert.ok(logs);
  });
  ```

**Implementation**:

- `src/screenshot/ScreenshotCapture.ts`: Core screenshot logic
  ```typescript
  export interface ScreenshotOptions {
    format?: 'png' | 'jpeg' | 'webp';
    quality?: number;
    multiplier?: number;
    width?: number;
    height?: number;
    strictAspectRatio?: boolean;
    transparentBackground?: boolean;
    enhanceQuality?: boolean;
    destination?: {
      blob?: boolean;
      download?: boolean;
      clipboard?: boolean;
    };
    downloadFilename?: string;
    preset?: 'print' | 'web-share' | 'thumbnail' | 'documentation';
    camera?: CameraState | { preset: string };
    timing?: {
      waitForSettle?: boolean;
      waitForOperations?: boolean;
    };
  }

  export interface ScreenshotResult {
    blob: Blob;
    downloaded: boolean;
    clipboardStatus: 'success' | 'not-supported' | 'permission-denied' |
                     'not-secure-context' | 'failed';
    clipboardError?: Error;
    errors?: ScreenshotError[];
    metadata: {
      width: number;
      height: number;
      format: string;
      byteSize: number;
      captureTime: number;
    };
  }
  ```

- `src/screenshot/ScreenshotError.ts`: Comprehensive error handling
  ```typescript
  export enum ScreenshotErrorCode {
    ENGINE_NOT_CONFIGURED = 'ENGINE_NOT_CONFIGURED',
    SCREENSHOT_CAPTURE_FAILED = 'SCREENSHOT_CAPTURE_FAILED',
    DIMENSION_TOO_LARGE = 'DIMENSION_TOO_LARGE',
    INVALID_DIMENSIONS = 'INVALID_DIMENSIONS',
    ASPECT_RATIO_MISMATCH = 'ASPECT_RATIO_MISMATCH',
    OUT_OF_MEMORY = 'OUT_OF_MEMORY',
    CANVAS_ALLOCATION_FAILED = 'CANVAS_ALLOCATION_FAILED',
    UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
    WEBP_NOT_SUPPORTED = 'WEBP_NOT_SUPPORTED',
    TRANSPARENT_REQUIRES_PNG = 'TRANSPARENT_REQUIRES_PNG',
    // ... clipboard, camera, timing, capture codes
  }

  export class ScreenshotError extends Error {
    constructor(
      message: string,
      public code: ScreenshotErrorCode,
      public details?: unknown
    ) {
      super(message);
      this.name = 'ScreenshotError';
      Object.setPrototypeOf(this, ScreenshotError.prototype);
    }
  }
  ```

- `src/screenshot/dimensions.ts`: Dimension calculation and validation
  ```typescript
  const BROWSER_LIMITS = {
    MAX_DIMENSION: 16384,
    MAX_PIXELS: 33_177_600,  // 8K
    WARN_PIXELS: 8_294_400,  // 4K
  };

  export function calculateDimensions(
    canvas: HTMLCanvasElement,
    options: ScreenshotOptions
  ): { width: number; height: number };

  export function validateDimensions(width: number, height: number): void;
  ```

- `src/screenshot/clipboard.ts`: Clipboard API wrapper
  ```typescript
  export async function copyToClipboard(blob: Blob): Promise<{
    status: ClipboardStatus;
    error?: Error;
  }>;
  ```

- `src/graph/Graph.ts`: Add captureScreenshot method
  ```typescript
  async captureScreenshot(options?: ScreenshotOptions): Promise<ScreenshotResult> {
    const screenshotCapture = new ScreenshotCapture(this.engine, this.scene, this.canvas);
    return screenshotCapture.captureScreenshot(options);
  }
  ```

- **`src/graphty-element.ts`: Expose captureScreenshot on public API (PHASE 1)**
  ```typescript
  @customElement('graphty-element')
  export class GraphtyElement extends LitElement {
    // ... existing code

    /**
     * Capture a screenshot of the current graph visualization.
     * Available from Phase 1 onwards.
     */
    async captureScreenshot(options?: ScreenshotOptions): Promise<ScreenshotResult> {
      return this.#graph.captureScreenshot(options);
    }
  }
  ```

- **`stories/Screenshot.stories.ts`: Manual testing story**
  ```typescript
  export const BasicCapture: Story = {
    name: 'Phase 1: Basic Screenshot',
    render: () => html`
      <graphty-element id="graph" .nodeData=${nodeData} .edgeData=${edgeData}></graphty-element>
      <div style="margin-top: 20px;">
        <button @click=${async () => {
          const el = document.querySelector('#graph');
          if (!(el instanceof Graphty)) return;

          const result = await el.captureScreenshot({
            destination: { download: true }
          });
          console.log('Screenshot captured:', result.metadata);
          window.lastScreenshotResult = result; // For E2E testing
        }}>
          📸 Download PNG Screenshot
        </button>

        <button @click=${async () => {
          const el = document.querySelector('#graph');
          if (!(el instanceof Graphty)) return;

          const result = await el.captureScreenshot({
            format: 'jpeg',
            destination: { download: true }
          });
          console.log('JPEG captured:', result.metadata);
        }}>
          📸 Download JPEG Screenshot
        </button>

        <button @click=${async () => {
          const el = document.querySelector('#graph');
          if (!(el instanceof Graphty)) return;

          const result = await el.captureScreenshot({
            destination: { clipboard: true }
          });
          if (result.clipboardStatus === 'success') {
            alert('Screenshot copied to clipboard!');
          } else {
            alert('Clipboard copy failed: ' + result.clipboardStatus);
          }
        }}>
          📋 Copy to Clipboard
        </button>
      </div>
    `
  };
  ```

**Dependencies**:
- External: None (uses Babylon.js CreateScreenshotAsync and browser clipboard API)
- Internal: Graph.ts

**Verification**:
1. Run: `npm test -- screenshot-core screenshot-destinations`
   - Expected: All unit tests pass with mocked `CreateScreenshotAsync`
2. Run: `npm run storybook`
   - Navigate to "Screenshot → Phase 1: Basic Screenshot"
   - Click "Download PNG Screenshot" → Verify PNG file downloads and opens correctly
   - Click "Download JPEG Screenshot" → Verify JPEG file downloads with smaller size
   - Click "Copy to Clipboard" → Paste into image editor, verify image appears
   - Open browser console, verify metadata logs show correct dimensions/format
3. **User Verification**: At the end of Phase 1, users can trigger screenshots via Storybook or browser console:
   ```javascript
   const el = document.querySelector('graphty-element');
   const result = await el.captureScreenshot({ destination: { download: true } });
   console.log(result.metadata);
   ```

---

### Phase 2: Advanced Screenshot Options (2-3 days)

**Objective**: Implement resolution control (multiplier vs explicit dimensions), transparent background, format validation, anti-aliasing enhancement, and screenshot presets.

**Duration**: 2-3 days

**Testing Approach**: Mock `CreateScreenshotAsync`, test dimension calculation logic, aspect ratio validation, and format validation.

**Tests to Write First**:

- `test/browser/screenshot/screenshot-resolution.test.ts`: Resolution control and validation
  ```typescript
  import { vi } from 'vitest';
  import * as BABYLON from '@babylonjs/core';

  // Mock CreateScreenshotAsync
  vi.spyOn(BABYLON, 'CreateScreenshotAsync').mockResolvedValue(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
  );

  // Test: Multiplier takes precedence over default
  test('multiplier increases resolution correctly', async () => {
    const canvas = createMockCanvas(800, 600);
    const result = await graph.captureScreenshot({ multiplier: 2 });

    assert.equal(result.metadata.width, 1600);
    assert.equal(result.metadata.height, 1200);
  });

  // Test: Explicit width/height override multiplier
  test('explicit dimensions override multiplier', async () => {
    const result = await graph.captureScreenshot({
      multiplier: 2,  // Should be ignored
      width: 1920,
      height: 1080
    });

    assert.equal(result.metadata.width, 1920);
    assert.equal(result.metadata.height, 1080);
  });

  // Test: Only width specified maintains aspect ratio
  test('width-only maintains aspect ratio', async () => {
    const canvas = createMockCanvas(800, 600);  // 4:3 aspect
    const result = await graph.captureScreenshot({ width: 1600 });

    assert.equal(result.metadata.width, 1600);
    assert.equal(result.metadata.height, 1200);  // Maintains 4:3
  });

  // Test: Only height specified maintains aspect ratio
  test('height-only maintains aspect ratio', async () => {
    const canvas = createMockCanvas(800, 600);  // 4:3 aspect
    const result = await graph.captureScreenshot({ height: 1200 });

    assert.equal(result.metadata.width, 1600);  // Maintains 4:3
    assert.equal(result.metadata.height, 1200);
  });

  // Test: Strict aspect ratio validation
  test('strictAspectRatio throws when aspect mismatch', async () => {
    const canvas = createMockCanvas(800, 600);  // 4:3 aspect

    await assert.rejects(
      () => graph.captureScreenshot({
        width: 1920,   // 16:9 aspect
        height: 1080,
        strictAspectRatio: true
      }),
      {
        name: 'ScreenshotError',
        code: 'ASPECT_RATIO_MISMATCH'
      }
    );
  });

  // Test: Dimension validation - too large
  test('dimensions exceeding browser limit throw error', async () => {
    await assert.rejects(
      () => graph.captureScreenshot({
        width: 20000,  // Exceeds 16384 limit
        height: 20000
      }),
      {
        name: 'ScreenshotError',
        code: 'DIMENSION_TOO_LARGE'
      }
    );
  });

  // Test: Large dimensions produce warning
  test('large dimensions produce console warning', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn');

    await graph.captureScreenshot({
      width: 3840,  // 4K
      height: 2160
    });

    assert.ok(consoleWarnSpy.called);
    assert.match(consoleWarnSpy.calls[0].args[0], /Large screenshot/);
  });
  ```

- `test/browser/screenshot/screenshot-transparency.test.ts`: Transparent background handling
  ```typescript
  // Test: Transparent background disables all layers
  test('transparentBackground disables clearColor, skybox, environment', async () => {
    const scene = graph.getScene();
    const originalClearColor = scene.clearColor.clone();
    const originalSkybox = scene.skybox?.isEnabled();

    await graph.captureScreenshot({ transparentBackground: true });

    // During capture, should have disabled all backgrounds
    // (Cannot test directly in mock, but implementation should save/restore state)

    // After capture, state should be restored
    assert.deepEqual(scene.clearColor, originalClearColor);
    assert.equal(scene.skybox?.isEnabled(), originalSkybox);
  });

  // Test: Transparent + JPEG throws error
  test('transparent background with JPEG format throws error', async () => {
    await assert.rejects(
      () => graph.captureScreenshot({
        transparentBackground: true,
        format: 'jpeg'
      }),
      {
        name: 'ScreenshotError',
        code: 'TRANSPARENT_REQUIRES_PNG'
      }
    );
  });

  // Test: Transparent background works with PNG
  test('transparent background works with PNG', async () => {
    const result = await graph.captureScreenshot({
      transparentBackground: true,
      format: 'png'
    });

    assert.equal(result.metadata.format, 'png');
    assert.ok(result.blob instanceof Blob);
  });

  // Test: Transparent background works with WebP
  test('transparent background works with WebP', async () => {
    const result = await graph.captureScreenshot({
      transparentBackground: true,
      format: 'webp'
    });

    assert.equal(result.metadata.format, 'webp');
    assert.ok(result.blob instanceof Blob);
  });
  ```

- `test/browser/screenshot/screenshot-presets.test.ts`: Screenshot preset handling
  ```typescript
  // Test: 'print' preset configuration
  test('print preset applies correct options', async () => {
    const result = await graph.captureScreenshot({ preset: 'print' });

    // Should use 4x multiplier and PNG format
    assert.equal(result.metadata.format, 'png');
    // Width should be 4x original (actual values depend on canvas size)
  });

  // Test: 'web-share' preset
  test('web-share preset copies to clipboard', async () => {
    const result = await graph.captureScreenshot({ preset: 'web-share' });

    assert.equal(result.metadata.format, 'png');
    // Should have attempted clipboard copy
    assert.ok(['success', 'permission-denied', 'not-supported', 'not-secure-context', 'failed']
      .includes(result.clipboardStatus));
  });

  // Test: 'thumbnail' preset
  test('thumbnail preset uses small dimensions and JPEG', async () => {
    const result = await graph.captureScreenshot({ preset: 'thumbnail' });

    assert.equal(result.metadata.format, 'jpeg');
    assert.equal(result.metadata.width, 400);
    assert.equal(result.metadata.height, 300);
  });

  // Test: 'documentation' preset
  test('documentation preset uses transparent PNG', async () => {
    const result = await graph.captureScreenshot({ preset: 'documentation' });

    assert.equal(result.metadata.format, 'png');
    assert.ok(result.downloaded);
  });

  // Test: Preset options can be overridden
  test('preset options can be overridden', async () => {
    const result = await graph.captureScreenshot({
      preset: 'print',
      width: 7680  // Override to 8K
    });

    assert.equal(result.metadata.format, 'png');
    assert.equal(result.metadata.width, 7680);
  });
  ```

- `test/browser/screenshot/screenshot-quality.test.ts`: Anti-aliasing enhancement
  ```typescript
  // Test: enhanceQuality triggers quality boost events
  test('enhanceQuality fires screenshot-enhancing event', async () => {
    let enhancingFired = false;
    let readyFired = false;

    graph.addEventListener('screenshot-enhancing', () => {
      enhancingFired = true;
    });

    graph.addEventListener('screenshot-ready', (e) => {
      readyFired = true;
      assert.ok(typeof e.detail.enhancementTime === 'number');
    });

    await graph.captureScreenshot({ enhanceQuality: true });

    assert.ok(enhancingFired);
    assert.ok(readyFired);
  });
  ```

- **E2E Smoke Test**:
  ```typescript
  // test/e2e/screenshot-advanced.test.ts
  test('E2E: advanced screenshot options work in Storybook', async () => {
    const page = await browser.newPage();
    await page.goto('http://localhost:9025/?path=/story/screenshot--advanced-options');

    // Test multiplier
    await page.click('button:has-text("2x Resolution")');
    const result2x = await page.evaluate(() => window.lastScreenshotResult);
    assert.ok(result2x.metadata.width > 800);

    // Test transparent background
    await page.click('button:has-text("Transparent PNG")');
    const resultTransparent = await page.evaluate(() => window.lastScreenshotResult);
    assert.equal(resultTransparent.metadata.format, 'png');

    // Test preset
    await page.click('button:has-text("Print Quality")');
    const resultPrint = await page.evaluate(() => window.lastScreenshotResult);
    assert.equal(resultPrint.metadata.format, 'png');
  });
  ```

**Implementation**:

- `src/screenshot/dimensions.ts`: Dimension calculation and validation
  ```typescript
  const BROWSER_LIMITS = {
    MAX_DIMENSION: 16384,
    MAX_PIXELS: 33_177_600,  // 8K
    WARN_PIXELS: 8_294_400,  // 4K
  };

  export function calculateDimensions(
    canvas: HTMLCanvasElement,
    options: ScreenshotOptions
  ): { width: number; height: number } {
    const canvasAspect = canvas.width / canvas.height;

    // Explicit width and height
    if (options.width && options.height) {
      const requestedAspect = options.width / options.height;
      if (options.strictAspectRatio && Math.abs(requestedAspect - canvasAspect) > 0.01) {
        throw new ScreenshotError(
          `Requested ${options.width}×${options.height} doesn't match canvas aspect ratio`,
          ScreenshotErrorCode.ASPECT_RATIO_MISMATCH
        );
      }
      return { width: options.width, height: options.height };
    }

    // Only width: maintain aspect ratio
    if (options.width) {
      return {
        width: options.width,
        height: Math.round(options.width / canvasAspect)
      };
    }

    // Only height: maintain aspect ratio
    if (options.height) {
      return {
        width: Math.round(options.height * canvasAspect),
        height: options.height
      };
    }

    // Multiplier (default: 1x)
    const mult = options.multiplier ?? 1;
    return {
      width: Math.round(canvas.width * mult),
      height: Math.round(canvas.height * mult)
    };
  }

  export function validateDimensions(width: number, height: number): void {
    // Hard limits
    if (width > BROWSER_LIMITS.MAX_DIMENSION || height > BROWSER_LIMITS.MAX_DIMENSION) {
      throw new ScreenshotError(
        `Dimension ${width}×${height} exceeds browser canvas limit (${BROWSER_LIMITS.MAX_DIMENSION}px)`,
        ScreenshotErrorCode.DIMENSION_TOO_LARGE
      );
    }

    const pixels = width * height;
    if (pixels > BROWSER_LIMITS.MAX_PIXELS) {
      throw new ScreenshotError(
        `Resolution ${width}×${height} (${(pixels/1e6).toFixed(1)}MP) exceeds recommended maximum`,
        ScreenshotErrorCode.RESOLUTION_TOO_HIGH
      );
    }

    // Warnings (non-fatal)
    if (pixels > BROWSER_LIMITS.WARN_PIXELS) {
      console.warn(
        `Large screenshot ${width}×${height} (${(pixels/1e6).toFixed(1)}MP) may fail on devices with limited memory`
      );
    }
  }
  ```

- `src/screenshot/transparency.ts`: Transparent background handling
  ```typescript
  interface BackgroundState {
    clearColor: Color4;
    skyboxEnabled: boolean;
    environmentTexture: BaseTexture | null;
    imageProcessingEnabled: boolean;
  }

  export async function enableTransparentBackground(
    scene: Scene,
    skybox: Mesh | null
  ): Promise<BackgroundState> {
    const original: BackgroundState = {
      clearColor: scene.clearColor.clone(),
      skyboxEnabled: skybox?.isEnabled() ?? false,
      environmentTexture: scene.environmentTexture,
      imageProcessingEnabled: scene.imageProcessingConfiguration.isEnabled
    };

    // Disable ALL background layers
    scene.clearColor = new Color4(0, 0, 0, 0);

    if (skybox) {
      skybox.setEnabled(false);
    }

    scene.environmentTexture = null;
    scene.imageProcessingConfiguration.vignetteEnabled = false;

    // Wait for render to apply changes
    await waitForRender(scene);

    return original;
  }

  export function restoreBackground(
    scene: Scene,
    skybox: Mesh | null,
    state: BackgroundState
  ): void {
    scene.clearColor = state.clearColor;
    if (skybox) {
      skybox.setEnabled(state.skyboxEnabled);
    }
    scene.environmentTexture = state.environmentTexture;
    scene.imageProcessingConfiguration.isEnabled = state.imageProcessingEnabled;
  }
  ```

- `src/screenshot/presets.ts`: Screenshot preset definitions
  ```typescript
  export const SCREENSHOT_PRESETS: Record<string, Partial<ScreenshotOptions>> = {
    'print': {
      format: 'png',
      multiplier: 4,
      enhanceQuality: true,
      camera: { preset: 'fitToGraph' }
    },

    'web-share': {
      format: 'png',
      multiplier: 2,
      destination: { clipboard: true },
      camera: { preset: 'fitToGraph' }
    },

    'thumbnail': {
      format: 'jpeg',
      width: 400,
      height: 300,
      quality: 0.85
    },

    'documentation': {
      format: 'png',
      multiplier: 2,
      transparentBackground: true,
      destination: { download: true }
    }
  };

  export function resolvePreset(
    preset: string,
    overrides?: Partial<ScreenshotOptions>
  ): ScreenshotOptions {
    const presetConfig = SCREENSHOT_PRESETS[preset];
    if (!presetConfig) {
      throw new ScreenshotError(
        `Unknown screenshot preset: ${preset}`,
        ScreenshotErrorCode.PRESET_NOT_FOUND
      );
    }

    // Merge preset with overrides
    return {
      ...presetConfig,
      ...overrides
    };
  }
  ```

- Update `src/screenshot/ScreenshotCapture.ts`: Add validation and transparency
  ```typescript
  async captureScreenshot(options?: ScreenshotOptions): Promise<ScreenshotResult> {
    // Resolve preset if specified
    let finalOptions = options;
    if (options?.preset) {
      finalOptions = resolvePreset(options.preset, options);
    }

    // Validate format + transparency combination
    if (finalOptions?.transparentBackground && finalOptions?.format === 'jpeg') {
      throw new ScreenshotError(
        'Transparent background requires PNG or WebP format',
        ScreenshotErrorCode.TRANSPARENT_REQUIRES_PNG
      );
    }

    // Calculate dimensions
    const dims = calculateDimensions(this.canvas, finalOptions ?? {});

    // Validate dimensions
    validateDimensions(dims.width, dims.height);

    // Handle transparent background
    let backgroundState: BackgroundState | undefined;
    if (finalOptions?.transparentBackground) {
      backgroundState = await enableTransparentBackground(
        this.scene,
        this.skybox
      );
    }

    try {
      // Capture screenshot with Babylon.js
      const dataUrl = await CreateScreenshotAsync(
        this.engine,
        this.camera,
        { width: dims.width, height: dims.height },
        finalOptions?.format ?? 'png',
        finalOptions?.quality
      );

      // Convert to blob
      const blob = await dataUrlToBlob(dataUrl);

      // Build result
      const result: ScreenshotResult = {
        blob,
        downloaded: false,
        clipboardStatus: 'success',
        metadata: {
          width: dims.width,
          height: dims.height,
          format: finalOptions?.format ?? 'png',
          byteSize: blob.size,
          captureTime: Date.now() - startTime
        }
      };

      // ... handle destinations ...

      return result;
    } finally {
      // Restore background state
      if (backgroundState) {
        restoreBackground(this.scene, this.skybox, backgroundState);
      }
    }
  }
  ```

- **`stories/Screenshot.stories.ts`: Add advanced options story**
  ```typescript
  export const AdvancedOptions: Story = {
    name: 'Phase 2: Advanced Options',
    render: () => html`
      <graphty-element id="graph" .nodeData=${nodeData} .edgeData=${edgeData}></graphty-element>
      <div style="margin-top: 20px;">
        <button @click=${async () => {
          const el = document.querySelector('#graph');
          if (!(el instanceof Graphty)) return;

          const result = await el.captureScreenshot({
            multiplier: 2,
            destination: { download: true },
            downloadFilename: 'graph-2x.png'
          });
          console.log('2x screenshot:', result.metadata);
          window.lastScreenshotResult = result;
        }}>
          📸 2x Resolution
        </button>

        <button @click=${async () => {
          const el = document.querySelector('#graph');
          if (!(el instanceof Graphty)) return;

          const result = await el.captureScreenshot({
            transparentBackground: true,
            format: 'png',
            destination: { download: true },
            downloadFilename: 'graph-transparent.png'
          });
          console.log('Transparent PNG:', result.metadata);
          window.lastScreenshotResult = result;
        }}>
          📸 Transparent PNG
        </button>

        <button @click=${async () => {
          const el = document.querySelector('#graph');
          if (!(el instanceof Graphty)) return;

          const result = await el.captureScreenshot({
            preset: 'print',
            downloadFilename: 'graph-print.png'
          });
          console.log('Print quality:', result.metadata);
          window.lastScreenshotResult = result;
        }}>
          📸 Print Quality
        </button>

        <button @click=${async () => {
          const el = document.querySelector('#graph');
          if (!(el instanceof Graphty)) return;

          const result = await el.captureScreenshot({
            preset: 'thumbnail',
            downloadFilename: 'graph-thumb.jpg'
          });
          console.log('Thumbnail:', result.metadata);
          window.lastScreenshotResult = result;
        }}>
          📸 Thumbnail (400×300)
        </button>
      </div>
    `
  };
  ```

**Dependencies**:
- External: None
- Internal: Phase 1 (Core Screenshot Infrastructure)

**Verification**:
1. Run: `npm test -- screenshot-resolution screenshot-transparency screenshot-presets screenshot-quality`
   - Expected: All unit tests pass with mocked `CreateScreenshotAsync`
2. Run: `npm run storybook`
   - Navigate to "Screenshot → Phase 2: Advanced Options"
   - Click "2x Resolution" → Verify downloaded file is 2x canvas size
   - Click "Transparent PNG" → Open in image editor, verify background is transparent (no skybox/environment visible)
   - Click "Print Quality" → Verify high-resolution PNG downloads (4x canvas size)
   - Click "Thumbnail (400×300)" → Verify small JPEG downloads with correct dimensions
   - Test aspect ratio validation by setting `strictAspectRatio: true` with mismatched dimensions
3. **User Verification**: At the end of Phase 2, users can control resolution and transparency:
   ```javascript
   const el = document.querySelector('graphty-element');

   // 2x resolution
   const result = await el.captureScreenshot({ multiplier: 2 });

   // Transparent background
   const transparent = await el.captureScreenshot({
     transparentBackground: true,
     format: 'png'
   });

   // Use preset
   const print = await el.captureScreenshot({ preset: 'print' });
   ```

---

### Phase 3: Timing Control & Operation Queue Integration (2-3 days)

**Objective**: Integrate screenshot operations with OperationQueueManager, implement layout settling detection, and add camera override capability for screenshots.

**Duration**: 2-3 days

**Testing Approach**: Mock layout engines and queue behavior, test timing logic and camera state management.

**Tests to Write First**:

- `test/browser/screenshot/screenshot-timing.test.ts`: Timing control logic
  ```typescript
  import { vi } from 'vitest';

  // Mock layout engine
  class MockLayoutEngine {
    #settled = false;

    isSettled(): boolean {
      return this.#settled;
    }

    setSettled(settled: boolean): void {
      this.#settled = settled;
    }
  }

  // Test: waitForSettle waits for layout
  test('waitForSettle waits for layout to settle', async () => {
    const layoutEngine = new MockLayoutEngine();
    graph.setLayoutEngine(layoutEngine);

    layoutEngine.setSettled(false);

    let captured = false;
    const capturePromise = graph.captureScreenshot({
      timing: { waitForSettle: true }
    }).then(() => {
      captured = true;
    });

    // Should not capture immediately
    await new Promise(resolve => setTimeout(resolve, 100));
    assert.equal(captured, false);

    // Settle layout
    layoutEngine.setSettled(true);
    graph.dispatchEvent('layout-updated');

    // Now should capture
    await capturePromise;
    assert.equal(captured, true);
  });

  // Test: waitForSettle timeout
  test('waitForSettle times out if layout never settles', async () => {
    const layoutEngine = new MockLayoutEngine();
    graph.setLayoutEngine(layoutEngine);

    layoutEngine.setSettled(false);

    await assert.rejects(
      () => graph.captureScreenshot({
        timing: { waitForSettle: true }
      }),
      {
        name: 'ScreenshotError',
        code: 'LAYOUT_SETTLE_TIMEOUT'
      }
    );
  });

  // Test: waitForOperations waits for queue
  test('waitForOperations waits for pending operations', async () => {
    // Queue a long operation
    const longOperation = graph.operationQueue.enqueue(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    let captured = false;
    const capturePromise = graph.captureScreenshot({
      timing: { waitForOperations: true }
    }).then(() => {
      captured = true;
    });

    // Should not capture immediately
    await new Promise(resolve => setTimeout(resolve, 50));
    assert.equal(captured, false);

    // Wait for operation to complete
    await longOperation;

    // Now should capture
    await capturePromise;
    assert.equal(captured, true);
  });

  // Test: Can skip waiting with timing options
  test('can skip waiting with timing.waitForSettle: false', async () => {
    const layoutEngine = new MockLayoutEngine();
    graph.setLayoutEngine(layoutEngine);
    layoutEngine.setSettled(false);

    // Should capture immediately without waiting
    const result = await graph.captureScreenshot({
      timing: {
        waitForSettle: false,
        waitForOperations: false
      }
    });

    assert.ok(result.blob instanceof Blob);
  });
  ```

- `test/browser/screenshot/screenshot-camera-override.test.ts`: Camera override logic
  ```typescript
  // Test: Camera override applies and restores
  test('camera override temporarily changes camera', async () => {
    const originalState = graph.getCameraState();

    const result = await graph.captureScreenshot({
      camera: {
        position: { x: 100, y: 100, z: 100 },
        target: { x: 0, y: 0, z: 0 }
      }
    });

    // After capture, camera should be restored
    const restoredState = graph.getCameraState();
    assert.deepEqual(restoredState, originalState);
  });

  // Test: Camera preset resolves after settling
  test('camera preset resolves after layout settles', async () => {
    const layoutEngine = new MockLayoutEngine();
    graph.setLayoutEngine(layoutEngine);

    layoutEngine.setSettled(false);

    // Start capture with preset
    const capturePromise = graph.captureScreenshot({
      camera: { preset: 'fitToGraph' },
      timing: { waitForSettle: true }
    });

    // Change graph (simulate nodes moving)
    graph.addNode({ id: 'new-node', x: 1000, y: 1000, z: 1000 });

    // Settle layout (preset should calculate based on final state)
    layoutEngine.setSettled(true);
    graph.dispatchEvent('layout-updated');

    const result = await capturePromise;

    // Preset should have calculated based on final node positions
    // (Cannot test exact camera position in unit test, but timing is verified)
    assert.ok(result.blob instanceof Blob);
  });
  ```

- `test/browser/screenshot/screenshot-queue-integration.test.ts`: Operation queue behavior
  ```typescript
  // Test: Screenshots are queued
  test('multiple screenshots execute sequentially', async () => {
    const order: number[] = [];

    const capture1 = graph.captureScreenshot().then(() => order.push(1));
    const capture2 = graph.captureScreenshot().then(() => order.push(2));
    const capture3 = graph.captureScreenshot().then(() => order.push(3));

    await Promise.all([capture1, capture2, capture3]);

    // Should execute in order
    assert.deepEqual(order, [1, 2, 3]);
  });

  // Test: Screenshot blocks other operations
  test('screenshot blocks concurrent operations', async () => {
    let screenshotInProgress = false;
    let operationRanDuringScreenshot = false;

    const screenshotPromise = graph.captureScreenshot({
      // Simulate slow screenshot
      enhanceQuality: true
    }).then(() => {
      screenshotInProgress = false;
    });

    screenshotInProgress = true;

    // Queue another operation
    const operationPromise = graph.operationQueue.enqueue(async () => {
      if (screenshotInProgress) {
        operationRanDuringScreenshot = true;
      }
    });

    await Promise.all([screenshotPromise, operationPromise]);

    // Operation should NOT have run during screenshot
    assert.equal(operationRanDuringScreenshot, false);
  });
  ```

- **E2E Smoke Test**:
  ```typescript
  // test/e2e/screenshot-timing.test.ts
  test('E2E: timing control works in Storybook', async () => {
    const page = await browser.newPage();
    await page.goto('http://localhost:9025/?path=/story/screenshot--timing-control');

    // Start layout animation
    await page.click('button:has-text("Start Force Layout")');

    // Capture with waitForSettle
    await page.click('button:has-text("Capture After Settled")');

    // Should wait for layout to settle before capturing
    const result = await page.evaluate(() => window.lastScreenshotResult);
    assert.ok(result?.blob instanceof Blob);
    assert.ok(result?.metadata.captureTime > 0);
  });
  ```

**Implementation**:

- `src/screenshot/ScreenshotCapture.ts`: Add operation queue integration
  ```typescript
  async captureScreenshot(options?: ScreenshotOptions): Promise<ScreenshotResult> {
    const timing = {
      waitForSettle: true,
      waitForOperations: true,
      ...options?.timing
    };

    return this.operationQueue.enqueue(async () => {
      // 1. Wait for layout to settle if requested
      if (timing.waitForSettle && this.layoutEngine) {
        await this.waitForLayoutSettle();
      }

      // 2. THEN resolve camera preset (now graph is in final state)
      let cameraState: CameraState | undefined;
      let originalCameraState: CameraState | undefined;

      if (options?.camera) {
        originalCameraState = this.getCameraState();

        // Resolve preset to actual camera state AFTER waiting
        cameraState = 'preset' in options.camera
          ? this.resolveCameraPreset(options.camera.preset)
          : options.camera;

        this.applyCameraStateImmediate(cameraState);
        await this.waitForRender();
      }

      try {
        // 3. Perform the actual capture
        const result = await this.doScreenshotCapture(options);

        return result;
      } finally {
        // Restore camera if it was overridden
        if (originalCameraState) {
          this.applyCameraStateImmediate(originalCameraState);
        }
      }
    });
  }

  private async waitForLayoutSettle(): Promise<void> {
    if (!this.layoutEngine) {
      return;
    }

    if (this.layoutEngine.isSettled()) {
      return;
    }

    // Wait for layout to settle (with timeout)
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        cleanup();
        reject(new ScreenshotError(
          'Layout did not settle within timeout',
          ScreenshotErrorCode.LAYOUT_SETTLE_TIMEOUT
        ));
      }, 30000); // 30 second timeout

      const handler = () => {
        if (this.layoutEngine?.isSettled()) {
          cleanup();
          resolve();
        }
      };

      const cleanup = () => {
        clearTimeout(timeout);
        this.removeEventListener('layout-updated', handler);
      };

      this.addEventListener('layout-updated', handler);
    });
  }

  private async waitForRender(): Promise<void> {
    return new Promise(resolve => {
      this.scene.onAfterRenderObservable.addOnce(() => resolve());
    });
  }

  private applyCameraStateImmediate(state: CameraState): void {
    // Apply camera state without animation
    if (state.position) {
      this.camera.position.copyFrom(state.position);
    }
    if (state.target) {
      this.camera.setTarget(state.target);
    }
    // ... apply other camera properties
  }
  ```

- **`stories/Screenshot.stories.ts`: Add timing control story**
  ```typescript
  export const TimingControl: Story = {
    name: 'Phase 3: Timing Control',
    render: () => html`
      <graphty-element id="graph" .nodeData=${nodeData} .edgeData=${edgeData}></graphty-element>
      <div style="margin-top: 20px;">
        <button @click=${() => {
          const el = document.querySelector('#graph');
          if (!(el instanceof Graphty)) return;
          el.setLayout('ngraph');  // Start physics simulation
        }}>
          🎬 Start Force Layout
        </button>

        <button @click=${async () => {
          const el = document.querySelector('#graph');
          if (!(el instanceof Graphty)) return;

          const result = await el.captureScreenshot({
            timing: { waitForSettle: true },  // Wait for layout
            destination: { download: true },
            downloadFilename: 'graph-settled.png'
          });
          console.log('Captured after settling:', result.metadata);
          window.lastScreenshotResult = result;
        }}>
          📸 Capture After Settled
        </button>

        <button @click=${async () => {
          const el = document.querySelector('#graph');
          if (!(el instanceof Graphty)) return;

          const result = await el.captureScreenshot({
            timing: {
              waitForSettle: false,
              waitForOperations: false
            },
            destination: { download: true },
            downloadFilename: 'graph-immediate.png'
          });
          console.log('Captured immediately:', result.metadata);
          window.lastScreenshotResult = result;
        }}>
          📸 Capture Immediately
        </button>

        <button @click=${async () => {
          const el = document.querySelector('#graph');
          if (!(el instanceof Graphty)) return;

          const result = await el.captureScreenshot({
            camera: {
              position: { x: 50, y: 50, z: 50 },
              target: { x: 0, y: 0, z: 0 }
            },
            destination: { download: true },
            downloadFilename: 'graph-custom-camera.png'
          });
          console.log('Captured with camera override:', result.metadata);
          window.lastScreenshotResult = result;
        }}>
          📸 Custom Camera Position
        </button>
      </div>
    `
  };
  ```

**Dependencies**:
- External: None
- Internal: Phase 1, Phase 2, OperationQueueManager

**Verification**:
1. Run: `npm test -- screenshot-timing screenshot-camera-override screenshot-queue-integration`
   - Expected: All unit tests pass
2. Run: `npm run storybook`
   - Navigate to "Screenshot → Phase 3: Timing Control"
   - Click "Start Force Layout" to begin physics simulation
   - Click "Capture After Settled" → Wait should occur, then download settled graph
   - Click "Capture Immediately" → Should download current state immediately (may be mid-animation)
   - Click "Custom Camera Position" → Should download from specified camera angle, then restore original camera
   - Verify camera returns to original position after override screenshot
3. **User Verification**: At the end of Phase 3, users can control timing:
   ```javascript
   const el = document.querySelector('graphty-element');

   // Wait for layout to settle
   const settled = await el.captureScreenshot({
     timing: { waitForSettle: true }
   });

   // Capture immediately
   const immediate = await el.captureScreenshot({
     timing: { waitForSettle: false, waitForOperations: false }
   });

   // Override camera for screenshot
   const customView = await el.captureScreenshot({
     camera: { position: { x: 100, y: 100, z: 100 } }
   });
   ```

---

### Phase 4: Camera State API (2D & 3D) (3-4 days)

**Objective**: Implement `getCameraState()` and `setCameraState()` APIs with support for both 2D orthographic and 3D perspective cameras, including animated transitions.

**Duration**: 3-4 days

**Testing Approach**: Mock Babylon.js camera classes, test camera state serialization/deserialization and animation logic for both 2D and 3D modes.

**Tests to Write First**:

- `test/browser/camera/camera-state-3d.test.ts`: 3D camera state management
  ```typescript
  import { vi } from 'vitest';

  // Test: getCameraState returns correct 3D state
  test('getCameraState returns 3D ArcRotateCamera state', () => {
    const camera = new ArcRotateCamera('camera', 0, 0, 10, new Vector3(0, 0, 0), scene);
    camera.position.set(10, 10, 10);
    camera.setTarget(new Vector3(0, 0, 0));
    camera.fov = Math.PI / 4;

    graph.setCamera(camera);
    const state = graph.getCameraState();

    assert.equal(state.type, 'arcRotate');
    assert.deepEqual(state.position, { x: 10, y: 10, z: 10 });
    assert.deepEqual(state.target, { x: 0, y: 0, z: 0 });
    assert.ok(typeof state.fov === 'number');

    // 2D properties should not be present
    assert.equal(state.zoom, undefined);
    assert.equal(state.pan, undefined);
  });

  // Test: setCameraState applies 3D state
  test('setCameraState applies 3D state correctly', () => {
    const camera = new ArcRotateCamera('camera', 0, 0, 10, new Vector3(0, 0, 0), scene);
    graph.setCamera(camera);

    graph.setCameraState({
      type: 'arcRotate',
      position: { x: 20, y: 20, z: 20 },
      target: { x: 5, y: 5, z: 5 }
    });

    const newState = graph.getCameraState();
    assert.deepEqual(newState.position, { x: 20, y: 20, z: 20 });
    assert.deepEqual(newState.target, { x: 5, y: 5, z: 5 });
  });

  // Test: Animated 3D camera transition
  test('setCameraState animates 3D camera smoothly', async () => {
    const camera = new ArcRotateCamera('camera', 0, 0, 10, new Vector3(0, 0, 0), scene);
    graph.setCamera(camera);

    const startPos = { x: 0, y: 0, z: 10 };
    const endPos = { x: 10, y: 10, z: 10 };

    await graph.setCameraState({
      type: 'arcRotate',
      position: endPos,
      target: { x: 0, y: 0, z: 0 }
    }, { animate: true, duration: 500 });

    const finalState = graph.getCameraState();
    assert.deepEqual(finalState.position, endPos);
  });

  // Test: ArcRotateCamera alpha/beta/radius properties
  test('setCameraState supports alpha/beta/radius for ArcRotateCamera', () => {
    const camera = new ArcRotateCamera('camera', 0, 0, 10, new Vector3(0, 0, 0), scene);
    graph.setCamera(camera);

    graph.setCameraState({
      type: 'arcRotate',
      alpha: Math.PI / 4,
      beta: Math.PI / 3,
      radius: 15
    });

    const state = graph.getCameraState();
    assert.closeTo(state.alpha!, Math.PI / 4, 0.01);
    assert.closeTo(state.beta!, Math.PI / 3, 0.01);
    assert.closeTo(state.radius!, 15, 0.01);
  });
  ```

- `test/browser/camera/camera-state-2d.test.ts`: 2D camera state management
  ```typescript
  // Test: getCameraState returns correct 2D state
  test('getCameraState returns 2D OrthographicCamera state', () => {
    const camera = new OrthographicCamera('camera', -10, 10, 10, -10, 0.1, 100, scene);
    camera.position.set(0, 0, 10);
    graph.setCamera(camera);
    graph.setCameraZoom(2.0);
    graph.setCameraPan({ x: 50, y: 100 });

    const state = graph.getCameraState();

    assert.equal(state.type, 'orthographic');
    assert.equal(state.zoom, 2.0);
    assert.deepEqual(state.pan, { x: 50, y: 100 });

    // 3D properties should not be present
    assert.equal(state.position, undefined);
    assert.equal(state.target, undefined);
  });

  // Test: setCameraState applies 2D state
  test('setCameraState applies 2D state correctly', () => {
    const camera = new OrthographicCamera('camera', -10, 10, 10, -10, 0.1, 100, scene);
    graph.setCamera(camera);

    graph.setCameraState({
      type: 'orthographic',
      zoom: 3.0,
      pan: { x: 200, y: 150 }
    });

    const newState = graph.getCameraState();
    assert.equal(newState.zoom, 3.0);
    assert.deepEqual(newState.pan, { x: 200, y: 150 });
  });

  // Test: Animated 2D camera zoom
  test('setCameraZoom animates smoothly', async () => {
    const camera = new OrthographicCamera('camera', -10, 10, 10, -10, 0.1, 100, scene);
    graph.setCamera(camera);
    graph.setCameraZoom(1.0);

    await graph.setCameraZoom(5.0, { animate: true, duration: 500 });

    const state = graph.getCameraState();
    assert.equal(state.zoom, 5.0);
  });

  // Test: Animated 2D camera pan
  test('setCameraPan animates smoothly', async () => {
    const camera = new OrthographicCamera('camera', -10, 10, 10, -10, 0.1, 100, scene);
    graph.setCamera(camera);
    graph.setCameraPan({ x: 0, y: 0 });

    await graph.setCameraPan({ x: 500, y: 300 }, { animate: true, duration: 500 });

    const state = graph.getCameraState();
    assert.deepEqual(state.pan, { x: 500, y: 300 });
  });
  ```

- `test/browser/camera/camera-convenience-methods.test.ts`: Convenience methods
  ```typescript
  // Test: 3D convenience methods
  test('setCameraPosition sets 3D position', () => {
    const camera = new ArcRotateCamera('camera', 0, 0, 10, new Vector3(0, 0, 0), scene);
    graph.setCamera(camera);

    graph.setCameraPosition({ x: 15, y: 15, z: 15 });

    const state = graph.getCameraState();
    assert.deepEqual(state.position, { x: 15, y: 15, z: 15 });
  });

  test('setCameraTarget sets 3D target', () => {
    const camera = new ArcRotateCamera('camera', 0, 0, 10, new Vector3(0, 0, 0), scene);
    graph.setCamera(camera);

    graph.setCameraTarget({ x: 10, y: 10, z: 10 });

    const state = graph.getCameraState();
    assert.deepEqual(state.target, { x: 10, y: 10, z: 10 });
  });

  // Test: 2D convenience methods
  test('setCameraZoom sets 2D zoom', () => {
    const camera = new OrthographicCamera('camera', -10, 10, 10, -10, 0.1, 100, scene);
    graph.setCamera(camera);

    graph.setCameraZoom(4.0);

    const state = graph.getCameraState();
    assert.equal(state.zoom, 4.0);
  });

  test('setCameraPan sets 2D pan', () => {
    const camera = new OrthographicCamera('camera', -10, 10, 10, -10, 0.1, 100, scene);
    graph.setCamera(camera);

    graph.setCameraPan({ x: 300, y: 200 });

    const state = graph.getCameraState();
    assert.deepEqual(state.pan, { x: 300, y: 200 });
  });

  // Test: resetCamera works for both 2D and 3D
  test('resetCamera resets 3D camera to default', () => {
    const camera = new ArcRotateCamera('camera', 0, 0, 10, new Vector3(0, 0, 0), scene);
    graph.setCamera(camera);

    graph.setCameraPosition({ x: 100, y: 100, z: 100 });
    graph.resetCamera();

    const state = graph.getCameraState();
    // Should reset to default position
    assert.ok(state.position);
  });

  test('resetCamera resets 2D camera to default', () => {
    const camera = new OrthographicCamera('camera', -10, 10, 10, -10, 0.1, 100, scene);
    graph.setCamera(camera);

    graph.setCameraZoom(10.0);
    graph.setCameraPan({ x: 500, y: 500 });
    graph.resetCamera();

    const state = graph.getCameraState();
    assert.equal(state.zoom, 1.0);  // Default zoom
    assert.deepEqual(state.pan, { x: 0, y: 0 });  // Default pan
  });
  ```

- `test/browser/camera/camera-events.test.ts`: Camera events
  ```typescript
  // Test: camera-state-changed event fires
  test('camera-state-changed event fires when state changes', async () => {
    const camera = new ArcRotateCamera('camera', 0, 0, 10, new Vector3(0, 0, 0), scene);
    graph.setCamera(camera);

    let eventFired = false;
    let eventDetail: any;

    graph.addEventListener('camera-state-changed', (e: CustomEvent) => {
      eventFired = true;
      eventDetail = e.detail;
    });

    graph.setCameraState({
      type: 'arcRotate',
      position: { x: 20, y: 20, z: 20 }
    });

    assert.ok(eventFired);
    assert.deepEqual(eventDetail.state.position, { x: 20, y: 20, z: 20 });
  });

  // Test: camera-animating event fires during animation
  test('camera-animating event fires during animation', async () => {
    const camera = new ArcRotateCamera('camera', 0, 0, 10, new Vector3(0, 0, 0), scene);
    graph.setCamera(camera);

    const progressValues: number[] = [];

    graph.addEventListener('camera-animating', (e: CustomEvent) => {
      progressValues.push(e.detail.progress);
    });

    await graph.setCameraState({
      type: 'arcRotate',
      position: { x: 50, y: 50, z: 50 }
    }, { animate: true, duration: 500 });

    // Should have received progress updates
    assert.ok(progressValues.length > 0);
    assert.ok(progressValues.some(p => p > 0 && p < 1));
  });
  ```

- **E2E Smoke Test**:
  ```typescript
  // test/e2e/camera-state.test.ts
  test('E2E: camera state API works in Storybook', async () => {
    const page = await browser.newPage();
    await page.goto('http://localhost:9025/?path=/story/camera--camera-state');

    // Test 3D camera
    await page.click('button:has-text("Set 3D Position")');
    const state3D = await page.evaluate(() => {
      const el = document.querySelector('graphty-element');
      return el.getCameraState();
    });
    assert.equal(state3D.type, 'arcRotate');
    assert.ok(state3D.position);

    // Test 2D camera
    await page.click('button:has-text("Switch to 2D")');
    await page.click('button:has-text("Zoom In")');
    const state2D = await page.evaluate(() => {
      const el = document.querySelector('graphty-element');
      return el.getCameraState();
    });
    assert.equal(state2D.type, 'orthographic');
    assert.ok(state2D.zoom > 1);
  });
  ```

**Implementation**:

- `src/camera/CameraStateManager.ts`: Unified camera state management
  ```typescript
  export interface CameraState {
    type: 'arcRotate' | 'free' | 'universal' | 'orthographic';

    // 3D Camera Properties
    position?: { x: number; y: number; z: number };
    target?: { x: number; y: number; z: number };
    alpha?: number;
    beta?: number;
    radius?: number;
    fov?: number;

    // 2D Camera Properties
    zoom?: number;
    pan?: { x: number; y: number };
    rotation?: number;

    // Orthographic frustum (advanced)
    orthoLeft?: number;
    orthoRight?: number;
    orthoTop?: number;
    orthoBottom?: number;
  }

  export class CameraStateManager {
    getCameraState(camera: Camera): CameraState {
      if (camera instanceof ArcRotateCamera) {
        return {
          type: 'arcRotate',
          position: {
            x: camera.position.x,
            y: camera.position.y,
            z: camera.position.z
          },
          target: {
            x: camera.target.x,
            y: camera.target.y,
            z: camera.target.z
          },
          alpha: camera.alpha,
          beta: camera.beta,
          radius: camera.radius,
          fov: camera.fov
        };
      } else if (camera instanceof OrthographicCamera) {
        return {
          type: 'orthographic',
          zoom: this.getOrthoZoom(camera),
          pan: this.getOrthoPan(camera),
          orthoLeft: camera.orthoLeft,
          orthoRight: camera.orthoRight,
          orthoTop: camera.orthoTop,
          orthoBottom: camera.orthoBottom
        };
      }
      // ... handle other camera types

      throw new ScreenshotError(
        `Unsupported camera type: ${camera.getClassName()}`,
        ScreenshotErrorCode.CAMERA_TYPE_NOT_SUPPORTED
      );
    }

    async setCameraState(
      camera: Camera,
      scene: Scene,
      state: Partial<CameraState>,
      options?: CameraAnimationOptions
    ): Promise<void> {
      if (!options?.animate) {
        this.applyCameraStateImmediate(camera, state);
        return;
      }

      // Animated transition
      if (camera instanceof ArcRotateCamera && state.position && state.target) {
        await this.animateArcRotateCamera(camera, scene, state, options);
      } else if (camera instanceof OrthographicCamera) {
        await this.animateOrthographicCamera(camera, scene, state, options);
      }
    }

    private applyCameraStateImmediate(camera: Camera, state: Partial<CameraState>): void {
      if (camera instanceof ArcRotateCamera) {
        if (state.position) {
          camera.position.copyFrom(new Vector3(state.position.x, state.position.y, state.position.z));
        }
        if (state.target) {
          camera.setTarget(new Vector3(state.target.x, state.target.y, state.target.z));
        }
        if (state.alpha !== undefined) camera.alpha = state.alpha;
        if (state.beta !== undefined) camera.beta = state.beta;
        if (state.radius !== undefined) camera.radius = state.radius;
        if (state.fov !== undefined) camera.fov = state.fov;
      } else if (camera instanceof OrthographicCamera) {
        if (state.zoom !== undefined) {
          this.setOrthoZoom(camera, state.zoom);
        }
        if (state.pan) {
          this.setOrthoPan(camera, state.pan);
        }
      }
    }

    private async animateArcRotateCamera(
      camera: ArcRotateCamera,
      scene: Scene,
      state: Partial<CameraState>,
      options: CameraAnimationOptions
    ): Promise<void> {
      const animations: Animation[] = [];
      const fps = 60;
      const frameCount = (options.duration ?? 1000) / (1000 / fps);

      if (state.position) {
        const posAnim = new Animation(
          'camera_position',
          'position',
          fps,
          Animation.ANIMATIONTYPE_VECTOR3
        );
        posAnim.setKeys([
          { frame: 0, value: camera.position.clone() },
          { frame: frameCount, value: new Vector3(state.position.x, state.position.y, state.position.z) }
        ]);
        this.applyEasing(posAnim, options.easing ?? 'easeInOut');
        animations.push(posAnim);
      }

      if (state.target) {
        const targetAnim = new Animation(
          'camera_target',
          'target',
          fps,
          Animation.ANIMATIONTYPE_VECTOR3
        );
        targetAnim.setKeys([
          { frame: 0, value: camera.target.clone() },
          { frame: frameCount, value: new Vector3(state.target.x, state.target.y, state.target.z) }
        ]);
        this.applyEasing(targetAnim, options.easing ?? 'easeInOut');
        animations.push(targetAnim);
      }

      camera.animations = animations;

      return new Promise(resolve => {
        scene.beginAnimation(camera, 0, frameCount, false, 1.0, () => resolve());
      });
    }

    private async animateOrthographicCamera(
      camera: OrthographicCamera,
      scene: Scene,
      state: Partial<CameraState>,
      options: CameraAnimationOptions
    ): Promise<void> {
      // Similar to 3D but animate zoom and pan properties
      // Implementation details...
    }

    private applyEasing(animation: Animation, easing: string): void {
      let easingFunction: IEasingFunction | null = null;

      switch (easing) {
        case 'easeInOut':
          easingFunction = new CubicEase();
          easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
          break;
        case 'easeIn':
          easingFunction = new CubicEase();
          easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEIN);
          break;
        case 'easeOut':
          easingFunction = new CubicEase();
          easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);
          break;
        case 'linear':
        default:
          return;  // No easing
      }

      if (easingFunction) {
        animation.setEasingFunction(easingFunction);
      }
    }
  }
  ```

- `src/graph/Graph.ts`: Add camera state methods
  ```typescript
  getCameraState(): CameraState {
    return this.cameraStateManager.getCameraState(this.camera);
  }

  async setCameraState(
    state: Partial<CameraState> | { preset: string },
    options?: CameraAnimationOptions
  ): Promise<void> {
    // Immediate updates don't need queueing
    if (!options?.animate) {
      const cameraState = 'preset' in state
        ? this.resolveCameraPreset(state.preset)
        : state;
      this.cameraStateManager.applyCameraStateImmediate(this.camera, cameraState);
      this.dispatchEvent('camera-state-changed', { state: cameraState });
      return;
    }

    // Animated transitions must be queued
    return this.operationQueue.enqueue(async () => {
      const cameraState = 'preset' in state
        ? this.resolveCameraPreset(state.preset)
        : state;

      await this.cameraStateManager.setCameraState(
        this.camera,
        this.scene,
        cameraState,
        options
      );

      this.dispatchEvent('camera-state-changed', { state: cameraState });
    });
  }

  // 3D convenience methods
  setCameraPosition(position: { x: number; y: number; z: number }, options?: CameraAnimationOptions): Promise<void> {
    return this.setCameraState({ position }, options);
  }

  setCameraTarget(target: { x: number; y: number; z: number }, options?: CameraAnimationOptions): Promise<void> {
    return this.setCameraState({ target }, options);
  }

  // 2D convenience methods
  setCameraZoom(zoom: number, options?: CameraAnimationOptions): Promise<void> {
    return this.setCameraState({ zoom }, options);
  }

  setCameraPan(pan: { x: number; y: number }, options?: CameraAnimationOptions): Promise<void> {
    return this.setCameraState({ pan }, options);
  }

  // Universal
  async resetCamera(options?: CameraAnimationOptions): Promise<void> {
    const defaultState = this.getDefaultCameraState();
    return this.setCameraState(defaultState, options);
  }
  ```

- **Update `src/graphty-element.ts`: Expose camera APIs (PHASE 4)**
  ```typescript
  @customElement('graphty-element')
  export class GraphtyElement extends LitElement {
    // ... existing code

    /**
     * Get current camera state (supports both 2D and 3D).
     * Available from Phase 4 onwards.
     */
    getCameraState(): CameraState {
      return this.#graph.getCameraState();
    }

    /**
     * Set camera state (supports both 2D and 3D).
     * Available from Phase 4 onwards.
     */
    async setCameraState(
      state: Partial<CameraState> | { preset: string },
      options?: CameraAnimationOptions
    ): Promise<void> {
      return this.#graph.setCameraState(state, options);
    }

    // 3D convenience methods
    async setCameraPosition(
      position: { x: number; y: number; z: number },
      options?: CameraAnimationOptions
    ): Promise<void> {
      return this.#graph.setCameraPosition(position, options);
    }

    async setCameraTarget(
      target: { x: number; y: number; z: number },
      options?: CameraAnimationOptions
    ): Promise<void> {
      return this.#graph.setCameraTarget(target, options);
    }

    // 2D convenience methods
    async setCameraZoom(zoom: number, options?: CameraAnimationOptions): Promise<void> {
      return this.#graph.setCameraZoom(zoom, options);
    }

    async setCameraPan(pan: { x: number; y: number }, options?: CameraAnimationOptions): Promise<void> {
      return this.#graph.setCameraPan(pan, options);
    }

    // Universal
    async resetCamera(options?: CameraAnimationOptions): Promise<void> {
      return this.#graph.resetCamera(options);
    }
  }
  ```

- **`stories/Camera.stories.ts`: Camera state story**
  ```typescript
  export const CameraState: Story = {
    name: 'Phase 4: Camera State API',
    render: () => html`
      <graphty-element id="graph" .nodeData=${nodeData} .edgeData=${edgeData}></graphty-element>
      <div style="margin-top: 20px;">
        <h3>3D Camera Controls</h3>
        <button @click=${() => {
          const el = document.querySelector('#graph');
          if (!(el instanceof Graphty)) return;
          el.setCameraPosition({ x: 50, y: 50, z: 50 }, { animate: true });
        }}>
          📹 Set 3D Position
        </button>

        <button @click=${() => {
          const el = document.querySelector('#graph');
          if (!(el instanceof Graphty)) return;
          el.setCameraTarget({ x: 0, y: 0, z: 0 }, { animate: true });
        }}>
          🎯 Set 3D Target
        </button>

        <button @click=${() => {
          const el = document.querySelector('#graph');
          if (!(el instanceof Graphty)) return;
          const state = el.getCameraState();
          console.log('Current 3D camera state:', state);
        }}>
          📊 Log 3D Camera State
        </button>

        <h3>2D Camera Controls</h3>
        <button @click=${() => {
          const el = document.querySelector('#graph');
          if (!(el instanceof Graphty)) return;
          el.setCameraZoom(3.0, { animate: true, duration: 500 });
        }}>
          🔍 Zoom In (2D)
        </button>

        <button @click=${() => {
          const el = document.querySelector('#graph');
          if (!(el instanceof Graphty)) return;
          el.setCameraPan({ x: 100, y: 50 }, { animate: true, duration: 500 });
        }}>
          ↔️ Pan (2D)
        </button>

        <button @click=${() => {
          const el = document.querySelector('#graph');
          if (!(el instanceof Graphty)) return;
          el.resetCamera({ animate: true });
        }}>
          🔄 Reset Camera
        </button>
      </div>
    `
  };
  ```

**Dependencies**:
- External: Babylon.js Animation system
- Internal: Phase 1, Phase 2, Phase 3

**Verification**:
1. Run: `npm test -- camera-state-3d camera-state-2d camera-convenience-methods camera-events`
   - Expected: All unit tests pass
2. Run: `npm run storybook`
   - Navigate to "Camera → Phase 4: Camera State API"
   - Test 3D controls: Verify smooth animations when setting position/target
   - Test 2D controls: Verify zoom and pan animations work correctly
   - Click "Log 3D Camera State" → Verify correct state object in console
   - Test "Reset Camera" → Verify camera returns to default position
3. **User Verification**: At the end of Phase 4, users can control camera programmatically:
   ```javascript
   const el = document.querySelector('graphty-element');

   // 3D: Set camera position
   await el.setCameraPosition({ x: 100, y: 100, z: 100 }, { animate: true });

   // 3D: Get current state
   const state = el.getCameraState();
   console.log(state.position, state.target);

   // 2D: Zoom and pan
   await el.setCameraZoom(2.5, { animate: true });
   await el.setCameraPan({ x: 200, y: 150 }, { animate: true });

   // Reset to default
   await el.resetCamera({ animate: true });
   ```

---

### Phase 5: Camera Presets (2-3 days)

**Objective**: Implement built-in camera presets (fitToGraph, topView, etc.) with auto-adaptation to 2D vs 3D, and add user-defined preset management.

**Duration**: 2-3 days

**Testing Approach**: Mock graph bounding box calculations, test preset resolution logic for both 2D and 3D modes, and test user preset storage.

**Tests to Write First**:

- `test/browser/camera/camera-presets-3d.test.ts`: Built-in 3D presets
  ```typescript
  import { vi } from 'vitest';

  // Test: fitToGraph calculates correct 3D camera position
  test('fitToGraph preset calculates 3D position based on node bounds', () => {
    // Set up graph with known bounds
    graph.addNode({ id: 'n1', x: 0, y: 0, z: 0 });
    graph.addNode({ id: 'n2', x: 100, y: 100, z: 100 });
    graph.addNode({ id: 'n3', x: -50, y: -50, z: -50 });

    const presetState = graph.resolveCameraPreset('fitToGraph');

    assert.equal(presetState.type, 'arcRotate');
    assert.ok(presetState.position);
    assert.ok(presetState.target);

    // Camera should be positioned to see all nodes
    // Target should be at center of bounding box
    const expectedCenter = { x: 25, y: 25, z: 25 };  // Center of [-50, 100]
    assert.closeTo(presetState.target.x, expectedCenter.x, 1);
    assert.closeTo(presetState.target.y, expectedCenter.y, 1);
    assert.closeTo(presetState.target.z, expectedCenter.z, 1);
  });

  // Test: topView preset looks down from above (3D)
  test('topView preset looks down from above in 3D mode', () => {
    const camera = new ArcRotateCamera('camera', 0, 0, 10, new Vector3(0, 0, 0), scene);
    graph.setCamera(camera);

    const presetState = graph.resolveCameraPreset('topView');

    assert.equal(presetState.type, 'arcRotate');
    // Position should be above the graph
    assert.ok(presetState.position.y > presetState.target.y);
    // X and Z should match target (looking straight down)
    assert.closeTo(presetState.position.x, presetState.target.x, 0.1);
    assert.closeTo(presetState.position.z, presetState.target.z, 0.1);
  });

  // Test: sideView preset (3D only)
  test('sideView preset positions camera to the side', () => {
    const camera = new ArcRotateCamera('camera', 0, 0, 10, new Vector3(0, 0, 0), scene);
    graph.setCamera(camera);

    const presetState = graph.resolveCameraPreset('sideView');

    assert.equal(presetState.type, 'arcRotate');
    assert.ok(presetState.position);
    // X should be offset from target
    assert.notEqual(presetState.position.x, presetState.target.x);
  });

  // Test: frontView preset (3D only)
  test('frontView preset positions camera in front', () => {
    const camera = new ArcRotateCamera('camera', 0, 0, 10, new Vector3(0, 0, 0), scene);
    graph.setCamera(camera);

    const presetState = graph.resolveCameraPreset('frontView');

    assert.equal(presetState.type, 'arcRotate');
    assert.ok(presetState.position);
    // Z should be offset from target
    assert.notEqual(presetState.position.z, presetState.target.z);
  });

  // Test: isometric preset (3D only)
  test('isometric preset creates classic 3D isometric angle', () => {
    const camera = new ArcRotateCamera('camera', 0, 0, 10, new Vector3(0, 0, 0), scene);
    graph.setCamera(camera);

    const presetState = graph.resolveCameraPreset('isometric');

    assert.equal(presetState.type, 'arcRotate');
    // Classic isometric: alpha ≈ 45°, beta ≈ 35.264°
    assert.closeTo(presetState.alpha!, Math.PI / 4, 0.1);
    assert.closeTo(presetState.beta!, 0.615, 0.1);  // ≈35.264° in radians
  });

  // Test: 3D-only presets throw error in 2D mode
  test('3D-only presets throw error when used with 2D camera', () => {
    const camera = new OrthographicCamera('camera', -10, 10, 10, -10, 0.1, 100, scene);
    graph.setCamera(camera);

    assert.throws(
      () => graph.resolveCameraPreset('sideView'),
      {
        name: 'ScreenshotError',
        code: 'CAMERA_PRESET_NOT_AVAILABLE_IN_2D'
      }
    );

    assert.throws(
      () => graph.resolveCameraPreset('frontView'),
      {
        name: 'ScreenshotError',
        code: 'CAMERA_PRESET_NOT_AVAILABLE_IN_2D'
      }
    );

    assert.throws(
      () => graph.resolveCameraPreset('isometric'),
      {
        name: 'ScreenshotError',
        code: 'CAMERA_PRESET_NOT_AVAILABLE_IN_2D'
      }
    );
  });
  ```

- `test/browser/camera/camera-presets-2d.test.ts`: Built-in 2D presets
  ```typescript
  // Test: fitToGraph calculates correct 2D zoom and pan
  test('fitToGraph preset calculates 2D zoom based on node bounds', () => {
    const camera = new OrthographicCamera('camera', -10, 10, 10, -10, 0.1, 100, scene);
    graph.setCamera(camera);

    // Set up graph with known bounds
    graph.addNode({ id: 'n1', x: 0, y: 0, z: 0 });
    graph.addNode({ id: 'n2', x: 200, y: 150, z: 0 });
    graph.addNode({ id: 'n3', x: -100, y: -75, z: 0 });

    const presetState = graph.resolveCameraPreset('fitToGraph');

    assert.equal(presetState.type, 'orthographic');
    assert.ok(typeof presetState.zoom === 'number');
    assert.ok(presetState.pan);

    // Pan should be at center of bounding box
    const expectedCenter = { x: 50, y: 37.5 };  // Center of [-100, 200] x [-75, 150]
    assert.closeTo(presetState.pan.x, expectedCenter.x, 1);
    assert.closeTo(presetState.pan.y, expectedCenter.y, 1);

    // Zoom should fit all nodes with padding
    assert.ok(presetState.zoom > 0);
  });

  // Test: topView preset in 2D mode
  test('topView preset provides standard 2D view', () => {
    const camera = new OrthographicCamera('camera', -10, 10, 10, -10, 0.1, 100, scene);
    graph.setCamera(camera);

    const presetState = graph.resolveCameraPreset('topView');

    assert.equal(presetState.type, 'orthographic');
    assert.equal(presetState.zoom, 1.0);  // Default 2D zoom
    assert.ok(presetState.pan);
  });
  ```

- `test/browser/camera/camera-presets-user-defined.test.ts`: User-defined presets
  ```typescript
  // Test: Save and load user-defined preset
  test('saveCameraPreset stores current camera state', () => {
    const camera = new ArcRotateCamera('camera', 0, 0, 10, new Vector3(0, 0, 0), scene);
    graph.setCamera(camera);

    graph.setCameraPosition({ x: 75, y: 75, z: 75 });
    graph.setCameraTarget({ x: 10, y: 10, z: 10 });

    graph.saveCameraPreset('myView');

    const presets = graph.getCameraPresets();
    assert.ok(presets['myView']);
    assert.deepEqual(presets['myView'].position, { x: 75, y: 75, z: 75 });
    assert.deepEqual(presets['myView'].target, { x: 10, y: 10, z: 10 });
  });

  test('loadCameraPreset applies saved camera state', async () => {
    const camera = new ArcRotateCamera('camera', 0, 0, 10, new Vector3(0, 0, 0), scene);
    graph.setCamera(camera);

    graph.setCameraPosition({ x: 100, y: 100, z: 100 });
    graph.saveCameraPreset('customView');

    // Move camera somewhere else
    graph.setCameraPosition({ x: 0, y: 0, z: 10 });

    // Load preset
    await graph.loadCameraPreset('customView', { animate: false });

    const state = graph.getCameraState();
    assert.deepEqual(state.position, { x: 100, y: 100, z: 100 });
  });

  // Test: Cannot overwrite built-in presets
  test('cannot overwrite built-in presets', () => {
    assert.throws(
      () => graph.saveCameraPreset('fitToGraph'),
      {
        name: 'ScreenshotError',
        code: 'CANNOT_OVERWRITE_BUILTIN_PRESET'
      }
    );
  });

  // Test: Export/import presets as JSON
  test('exportCameraPresets returns JSON of user-defined presets', () => {
    const camera = new ArcRotateCamera('camera', 0, 0, 10, new Vector3(0, 0, 0), scene);
    graph.setCamera(camera);

    graph.setCameraPosition({ x: 50, y: 50, z: 50 });
    graph.saveCameraPreset('view1');

    graph.setCameraPosition({ x: 100, y: 100, z: 100 });
    graph.saveCameraPreset('view2');

    const exported = graph.exportCameraPresets();

    assert.ok(exported.view1);
    assert.ok(exported.view2);
    assert.deepEqual(exported.view1.position, { x: 50, y: 50, z: 50 });
    assert.deepEqual(exported.view2.position, { x: 100, y: 100, z: 100 });

    // Built-in presets should NOT be exported
    assert.equal(exported.fitToGraph, undefined);
  });

  test('importCameraPresets loads presets from JSON', () => {
    const presetsJSON = {
      view1: { type: 'arcRotate', position: { x: 30, y: 30, z: 30 }, target: { x: 0, y: 0, z: 0 } },
      view2: { type: 'arcRotate', position: { x: 60, y: 60, z: 60 }, target: { x: 0, y: 0, z: 0 } }
    };

    graph.importCameraPresets(presetsJSON);

    const presets = graph.getCameraPresets();
    assert.ok(presets.view1);
    assert.ok(presets.view2);
    assert.deepEqual(presets.view1.position, { x: 30, y: 30, z: 30 });
  });
  ```

- **E2E Smoke Test**:
  ```typescript
  // test/e2e/camera-presets.test.ts
  test('E2E: camera presets work in Storybook', async () => {
    const page = await browser.newPage();
    await page.goto('http://localhost:9025/?path=/story/camera--camera-presets');

    // Test built-in preset (3D)
    await page.click('button:has-text("Fit to Graph")');
    await page.waitForTimeout(1000);  // Wait for animation

    const stateFit = await page.evaluate(() => {
      const el = document.querySelector('graphty-element');
      return el.getCameraState();
    });
    assert.ok(stateFit.position);
    assert.ok(stateFit.target);

    // Test user-defined preset
    await page.click('button:has-text("Save Custom View")');
    await page.click('button:has-text("Move Camera")');
    await page.click('button:has-text("Load Custom View")');

    const stateCustom = await page.evaluate(() => {
      const el = document.querySelector('graphty-element');
      return el.getCameraState();
    });
    assert.ok(stateCustom.position);
  });
  ```

**Implementation**:

- `src/camera/presets.ts`: Camera preset calculation logic
  ```typescript
  const BUILTIN_PRESETS = ['fitToGraph', 'topView', 'sideView', 'frontView', 'isometric'];

  export function calculateFitToGraph(
    graph: Graph,
    camera: Camera
  ): CameraState {
    const bounds = graph.getNodeBoundingBox();
    const center = { x: bounds.center.x, y: bounds.center.y, z: bounds.center.z };

    if (camera instanceof OrthographicCamera) {
      // 2D: Calculate zoom to fit all nodes with padding
      const size = Math.max(bounds.width, bounds.height);
      const zoom = graph.canvas.width / (size * 1.2); // 20% padding

      return {
        type: 'orthographic',
        zoom,
        pan: { x: center.x, y: center.y }
      };
    } else {
      // 3D: Calculate distance to fit all nodes with padding
      const size = bounds.getSize();
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = (camera as ArcRotateCamera).fov ?? Math.PI / 4;
      const distance = maxDim / Math.tan(fov / 2) * 1.2; // 20% padding

      return {
        type: 'arcRotate',
        position: {
          x: center.x + distance,
          y: center.y + distance,
          z: center.z + distance
        },
        target: center
      };
    }
  }

  export function calculateTopView(
    graph: Graph,
    camera: Camera
  ): CameraState {
    const bounds = graph.getNodeBoundingBox();
    const center = { x: bounds.center.x, y: bounds.center.y, z: bounds.center.z };

    if (camera instanceof OrthographicCamera) {
      // 2D: Standard top-down view (default for 2D)
      return {
        type: 'orthographic',
        zoom: 1.0,
        pan: { x: center.x, y: center.y }
      };
    } else {
      // 3D: Look down from above
      const distance = bounds.getSize().maxDimension * 1.5;
      return {
        type: 'arcRotate',
        position: { x: center.x, y: center.y + distance, z: center.z },
        target: center
      };
    }
  }

  export function calculateSideView(graph: Graph): CameraState {
    const bounds = graph.getNodeBoundingBox();
    const center = { x: bounds.center.x, y: bounds.center.y, z: bounds.center.z };
    const distance = bounds.getSize().maxDimension * 1.5;

    return {
      type: 'arcRotate',
      position: { x: center.x + distance, y: center.y, z: center.z },
      target: center
    };
  }

  export function calculateFrontView(graph: Graph): CameraState {
    const bounds = graph.getNodeBoundingBox();
    const center = { x: bounds.center.x, y: bounds.center.y, z: bounds.center.z };
    const distance = bounds.getSize().maxDimension * 1.5;

    return {
      type: 'arcRotate',
      position: { x: center.x, y: center.y, z: center.z + distance },
      target: center
    };
  }

  export function calculateIsometric(graph: Graph): CameraState {
    const bounds = graph.getNodeBoundingBox();
    const center = { x: bounds.center.x, y: bounds.center.y, z: bounds.center.z };
    const distance = bounds.getSize().maxDimension * 1.5;

    return {
      type: 'arcRotate',
      alpha: Math.PI / 4,        // 45° horizontal
      beta: 0.615,                // ≈35.264° vertical (classic isometric)
      radius: distance,
      target: center
    };
  }
  ```

- `src/graph/Graph.ts`: Add preset management
  ```typescript
  private userCameraPresets = new Map<string, CameraState>();

  resolveCameraPreset(preset: string): CameraState {
    const is2D = this.camera instanceof OrthographicCamera;

    // Check built-in presets first
    switch (preset) {
      case 'fitToGraph':
        return calculateFitToGraph(this, this.camera);

      case 'topView':
        return calculateTopView(this, this.camera);

      case 'sideView':
        if (is2D) {
          throw new ScreenshotError(
            'sideView preset is only available for 3D cameras',
            ScreenshotErrorCode.CAMERA_PRESET_NOT_AVAILABLE_IN_2D
          );
        }
        return calculateSideView(this);

      case 'frontView':
        if (is2D) {
          throw new ScreenshotError(
            'frontView preset is only available for 3D cameras',
            ScreenshotErrorCode.CAMERA_PRESET_NOT_AVAILABLE_IN_2D
          );
        }
        return calculateFrontView(this);

      case 'isometric':
        if (is2D) {
          throw new ScreenshotError(
            'isometric preset is only available for 3D cameras',
            ScreenshotErrorCode.CAMERA_PRESET_NOT_AVAILABLE_IN_2D
          );
        }
        return calculateIsometric(this);

      default:
        // Check user-defined presets
        const userPreset = this.userCameraPresets.get(preset);
        if (!userPreset) {
          throw new ScreenshotError(
            `Unknown camera preset: ${preset}`,
            ScreenshotErrorCode.CAMERA_PRESET_NOT_FOUND
          );
        }
        return userPreset;
    }
  }

  saveCameraPreset(name: string): void {
    if (BUILTIN_PRESETS.includes(name)) {
      throw new ScreenshotError(
        `Cannot overwrite built-in preset: ${name}`,
        ScreenshotErrorCode.CANNOT_OVERWRITE_BUILTIN_PRESET
      );
    }

    const currentState = this.getCameraState();
    this.userCameraPresets.set(name, currentState);
  }

  async loadCameraPreset(name: string, options?: CameraAnimationOptions): Promise<void> {
    return this.setCameraState({ preset: name }, options);
  }

  getCameraPresets(): Record<string, CameraState | { builtin: true }> {
    const presets: Record<string, CameraState | { builtin: true }> = {};

    // Built-in presets (marked as builtin)
    for (const name of BUILTIN_PRESETS) {
      presets[name] = { builtin: true };
    }

    // User-defined presets
    for (const [name, state] of this.userCameraPresets.entries()) {
      presets[name] = state;
    }

    return presets;
  }

  exportCameraPresets(): Record<string, CameraState> {
    const exported: Record<string, CameraState> = {};
    for (const [name, state] of this.userCameraPresets.entries()) {
      exported[name] = state;
    }
    return exported;
  }

  importCameraPresets(presets: Record<string, CameraState>): void {
    for (const [name, state] of Object.entries(presets)) {
      if (BUILTIN_PRESETS.includes(name)) {
        console.warn(`Skipping import of built-in preset: ${name}`);
        continue;
      }
      this.userCameraPresets.set(name, state);
    }
  }
  ```

- **Update `src/graphty-element.ts`: Expose preset APIs (PHASE 5)**
  ```typescript
  /**
   * Save current camera state as a named preset.
   * Available from Phase 5 onwards.
   */
  saveCameraPreset(name: string): void {
    return this.#graph.saveCameraPreset(name);
  }

  /**
   * Load a camera preset (built-in or user-defined).
   * Available from Phase 5 onwards.
   */
  async loadCameraPreset(name: string, options?: CameraAnimationOptions): Promise<void> {
    return this.#graph.loadCameraPreset(name, options);
  }

  /**
   * Get all camera presets (built-in + user-defined).
   * Available from Phase 5 onwards.
   */
  getCameraPresets(): Record<string, CameraState | { builtin: true }> {
    return this.#graph.getCameraPresets();
  }

  /**
   * Export user-defined presets as JSON.
   * Available from Phase 5 onwards.
   */
  exportCameraPresets(): Record<string, CameraState> {
    return this.#graph.exportCameraPresets();
  }

  /**
   * Import user-defined presets from JSON.
   * Available from Phase 5 onwards.
   */
  importCameraPresets(presets: Record<string, CameraState>): void {
    return this.#graph.importCameraPresets(presets);
  }
  ```

- **`stories/Camera.stories.ts`: Add presets story**
  ```typescript
  export const CameraPresets: Story = {
    name: 'Phase 5: Camera Presets',
    render: () => html`
      <graphty-element id="graph" .nodeData=${nodeData} .edgeData=${edgeData}></graphty-element>
      <div style="margin-top: 20px;">
        <h3>Built-in Presets</h3>
        <button @click=${async () => {
          const el = document.querySelector('#graph');
          if (!(el instanceof Graphty)) return;
          await el.setCameraState({ preset: 'fitToGraph' }, { animate: true });
        }}>
          📐 Fit to Graph
        </button>

        <button @click=${async () => {
          const el = document.querySelector('#graph');
          if (!(el instanceof Graphty)) return;
          await el.setCameraState({ preset: 'topView' }, { animate: true });
        }}>
          ⬇️ Top View
        </button>

        <button @click=${async () => {
          const el = document.querySelector('#graph');
          if (!(el instanceof Graphty)) return;
          await el.setCameraState({ preset: 'isometric' }, { animate: true });
        }}>
          📊 Isometric
        </button>

        <h3>User-Defined Presets</h3>
        <button @click=${() => {
          const el = document.querySelector('#graph');
          if (!(el instanceof Graphty)) return;
          el.saveCameraPreset('myCustomView');
          console.log('Saved current camera as "myCustomView"');
        }}>
          💾 Save Custom View
        </button>

        <button @click=${async () => {
          const el = document.querySelector('#graph');
          if (!(el instanceof Graphty)) return;
          await el.setCameraPosition({ x: 200, y: 200, z: 200 });
        }}>
          🚀 Move Camera
        </button>

        <button @click=${async () => {
          const el = document.querySelector('#graph');
          if (!(el instanceof Graphty)) return;
          await el.loadCameraPreset('myCustomView', { animate: true });
        }}>
          📂 Load Custom View
        </button>

        <button @click=${() => {
          const el = document.querySelector('#graph');
          if (!(el instanceof Graphty)) return;
          const presets = el.getCameraPresets();
          console.log('All presets:', presets);
        }}>
          📋 List All Presets
        </button>
      </div>
    `
  };
  ```

**Dependencies**:
- External: None
- Internal: Phase 1, Phase 2, Phase 3, Phase 4

**Verification**:
1. Run: `npm test -- camera-presets-3d camera-presets-2d camera-presets-user-defined`
   - Expected: All unit tests pass
2. Run: `npm run storybook`
   - Navigate to "Camera → Phase 5: Camera Presets"
   - Click "Fit to Graph" → Verify camera animates to show all nodes
   - Click "Top View" → Verify camera looks down from above
   - Click "Isometric" → Verify classic 3D isometric angle
   - Click "Save Custom View" → Move camera → Click "Load Custom View" → Verify camera restores saved position
   - Click "List All Presets" → Verify both built-in and user-defined presets appear in console
3. **User Verification**: At the end of Phase 5, users can use camera presets:
   ```javascript
   const el = document.querySelector('graphty-element');

   // Use built-in preset
   await el.setCameraState({ preset: 'fitToGraph' }, { animate: true });

   // Save custom preset
   el.saveCameraPreset('myView');

   // Load custom preset
   await el.loadCameraPreset('myView', { animate: true });

   // Export/import presets
   const json = el.exportCameraPresets();
   localStorage.setItem('cameraPresets', JSON.stringify(json));

   // Later...
   const saved = JSON.parse(localStorage.getItem('cameraPresets'));
   el.importCameraPresets(saved);
   ```

---

### Phase 6: Error Handling & Polish (2-3 days)

**Objective**: Add comprehensive error codes, dimension validation, engine configuration checks, clipboard error handling, and pre-flight capability checks.

**Duration**: 2-3 days

**Testing Approach**: Test error code coverage, validation logic, and pre-flight checks with mocked dependencies.

**Tests to Write First**:

- `test/browser/screenshot/screenshot-error-codes.test.ts`: Error code coverage
  ```typescript
  import { vi } from 'vitest';

  // Test: ENGINE_NOT_CONFIGURED error
  test('throws ENGINE_NOT_CONFIGURED when preserveDrawingBuffer is false', async () => {
    // Mock engine with preserveDrawingBuffer: false
    const mockEngine = {
      _gl: {
        getContextAttributes: () => ({ preserveDrawingBuffer: false })
      }
    };
    graph.setEngine(mockEngine);

    await assert.rejects(
      () => graph.captureScreenshot(),
      {
        name: 'ScreenshotError',
        code: 'ENGINE_NOT_CONFIGURED',
        message: /preserveDrawingBuffer: true/
      }
    );
  });

  // Test: DIMENSION_TOO_LARGE error
  test('throws DIMENSION_TOO_LARGE when exceeding browser limits', async () => {
    await assert.rejects(
      () => graph.captureScreenshot({ width: 20000, height: 20000 }),
      {
        name: 'ScreenshotError',
        code: 'DIMENSION_TOO_LARGE'
      }
    );
  });

  // Test: ASPECT_RATIO_MISMATCH error
  test('throws ASPECT_RATIO_MISMATCH with strictAspectRatio', async () => {
    const canvas = createMockCanvas(800, 600);  // 4:3
    graph.setCanvas(canvas);

    await assert.rejects(
      () => graph.captureScreenshot({
        width: 1920,  // 16:9
        height: 1080,
        strictAspectRatio: true
      }),
      {
        name: 'ScreenshotError',
        code: 'ASPECT_RATIO_MISMATCH'
      }
    );
  });

  // Test: TRANSPARENT_REQUIRES_PNG error
  test('throws TRANSPARENT_REQUIRES_PNG when using JPEG + transparent', async () => {
    await assert.rejects(
      () => graph.captureScreenshot({
        transparentBackground: true,
        format: 'jpeg'
      }),
      {
        name: 'ScreenshotError',
        code: 'TRANSPARENT_REQUIRES_PNG'
      }
    );
  });

  // Test: WEBP_NOT_SUPPORTED error
  test('throws WEBP_NOT_SUPPORTED when browser lacks WebP', async () => {
    // Mock browser without WebP support
    vi.spyOn(document.createElement('canvas'), 'toBlob')
      .mockImplementation((callback, type) => {
        if (type === 'image/webp') {
          throw new Error('WebP not supported');
        }
      });

    await assert.rejects(
      () => graph.captureScreenshot({ format: 'webp' }),
      {
        name: 'ScreenshotError',
        code: 'WEBP_NOT_SUPPORTED'
      }
    );
  });

  // Test: LAYOUT_SETTLE_TIMEOUT error
  test('throws LAYOUT_SETTLE_TIMEOUT when layout never settles', async () => {
    const layoutEngine = new MockLayoutEngine();
    layoutEngine.setSettled(false);
    graph.setLayoutEngine(layoutEngine);

    await assert.rejects(
      () => graph.captureScreenshot({ timing: { waitForSettle: true } }),
      {
        name: 'ScreenshotError',
        code: 'LAYOUT_SETTLE_TIMEOUT'
      },
      { timeout: 35000 }  // Should timeout after 30s
    );
  }, { timeout: 40000 });

  // Test: CAMERA_PRESET_NOT_FOUND error
  test('throws CAMERA_PRESET_NOT_FOUND for unknown preset', async () => {
    await assert.rejects(
      () => graph.captureScreenshot({ camera: { preset: 'nonexistent' } }),
      {
        name: 'ScreenshotError',
        code: 'CAMERA_PRESET_NOT_FOUND',
        message: /nonexistent/
      }
    );
  });

  // Test: CAMERA_PRESET_NOT_AVAILABLE_IN_2D error
  test('throws CAMERA_PRESET_NOT_AVAILABLE_IN_2D for 3D-only presets', async () => {
    const camera = new OrthographicCamera('camera', -10, 10, 10, -10, 0.1, 100, scene);
    graph.setCamera(camera);

    await assert.rejects(
      () => graph.captureScreenshot({ camera: { preset: 'isometric' } }),
      {
        name: 'ScreenshotError',
        code: 'CAMERA_PRESET_NOT_AVAILABLE_IN_2D'
      }
    );
  });

  // Test: CANNOT_OVERWRITE_BUILTIN_PRESET error
  test('throws CANNOT_OVERWRITE_BUILTIN_PRESET when trying to save over built-in', () => {
    assert.throws(
      () => graph.saveCameraPreset('fitToGraph'),
      {
        name: 'ScreenshotError',
        code: 'CANNOT_OVERWRITE_BUILTIN_PRESET'
      }
    );
  });
  ```

- `test/browser/screenshot/screenshot-capability-check.test.ts`: Pre-flight checks
  ```typescript
  // Test: canCaptureScreenshot checks dimensions
  test('canCaptureScreenshot warns about large dimensions', async () => {
    const check = await graph.canCaptureScreenshot({
      width: 3840,
      height: 2160
    });

    assert.equal(check.supported, true);
    assert.ok(check.warnings);
    assert.ok(check.warnings.some(w => w.includes('Large screenshot')));
  });

  // Test: canCaptureScreenshot rejects excessive dimensions
  test('canCaptureScreenshot rejects excessive dimensions', async () => {
    const check = await graph.canCaptureScreenshot({
      width: 20000,
      height: 20000
    });

    assert.equal(check.supported, false);
    assert.ok(check.reason);
    assert.match(check.reason, /exceeds.*limit/);
  });

  // Test: canCaptureScreenshot checks format support
  test('canCaptureScreenshot checks WebP support', async () => {
    // Mock browser without WebP
    vi.spyOn(document.createElement('canvas'), 'toBlob')
      .mockImplementation((callback, type) => {
        if (type === 'image/webp') {
          throw new Error('WebP not supported');
        }
      });

    const check = await graph.canCaptureScreenshot({ format: 'webp' });

    assert.equal(check.supported, false);
    assert.match(check.reason, /WebP.*not supported/);
  });

  // Test: canCaptureScreenshot estimates memory
  test('canCaptureScreenshot estimates memory usage', async () => {
    const check = await graph.canCaptureScreenshot({
      width: 1920,
      height: 1080
    });

    assert.ok(typeof check.estimatedMemoryMB === 'number');
    assert.ok(check.estimatedMemoryMB > 0);
  });

  // Test: canCaptureScreenshot warns about high memory
  test('canCaptureScreenshot warns about high memory usage', async () => {
    const check = await graph.canCaptureScreenshot({
      width: 7680,  // 8K
      height: 4320
    });

    assert.ok(check.warnings);
    assert.ok(check.warnings.some(w => w.includes('memory')));
  });
  ```

- `test/browser/screenshot/screenshot-clipboard-errors.test.ts`: Clipboard error handling
  ```typescript
  // Test: Clipboard not supported
  test('clipboardStatus is "not-supported" when clipboard API unavailable', async () => {
    vi.stubGlobal('navigator', {});  // No clipboard API

    const result = await graph.captureScreenshot({
      destination: { clipboard: true }
    });

    assert.equal(result.clipboardStatus, 'not-supported');
    assert.ok(result.clipboardError);
    assert.match(result.clipboardError.message, /not supported/);
  });

  // Test: Not secure context
  test('clipboardStatus is "not-secure-context" on HTTP', async () => {
    vi.stubGlobal('isSecureContext', false);

    const result = await graph.captureScreenshot({
      destination: { clipboard: true }
    });

    assert.equal(result.clipboardStatus, 'not-secure-context');
    assert.ok(result.clipboardError);
    assert.match(result.clipboardError.message, /HTTPS/);
  });

  // Test: Permission denied
  test('clipboardStatus is "permission-denied" when user denies', async () => {
    const mockClipboard = {
      write: vi.fn().mockRejectedValue(
        Object.assign(new Error('Permission denied'), { name: 'NotAllowedError' })
      )
    };
    vi.stubGlobal('navigator', { clipboard: mockClipboard });

    const result = await graph.captureScreenshot({
      destination: { clipboard: true }
    });

    assert.equal(result.clipboardStatus, 'permission-denied');
    assert.ok(result.clipboardError);
  });

  // Test: Clipboard events fire correctly
  test('clipboard error events fire with correct status', async () => {
    vi.stubGlobal('navigator', {});  // No clipboard API

    let eventFired = false;
    graph.addEventListener('screenshot-clipboard-not-supported', () => {
      eventFired = true;
    });

    await graph.captureScreenshot({ destination: { clipboard: true } });

    assert.ok(eventFired);
  });
  ```

- **E2E Smoke Test**:
  ```typescript
  // test/e2e/screenshot-errors.test.ts
  test('E2E: error handling works in Storybook', async () => {
    const page = await browser.newPage();
    await page.goto('http://localhost:9025/?path=/story/screenshot--error-handling');

    // Test dimension error
    const dimensionError = await page.evaluate(async () => {
      try {
        const el = document.querySelector('graphty-element');
        await el.captureScreenshot({ width: 20000, height: 20000 });
        return null;
      } catch (err) {
        return { code: err.code, message: err.message };
      }
    });

    assert.equal(dimensionError.code, 'DIMENSION_TOO_LARGE');

    // Test format error
    const formatError = await page.evaluate(async () => {
      try {
        const el = document.querySelector('graphty-element');
        await el.captureScreenshot({
          transparentBackground: true,
          format: 'jpeg'
        });
        return null;
      } catch (err) {
        return { code: err.code, message: err.message };
      }
    });

    assert.equal(formatError.code, 'TRANSPARENT_REQUIRES_PNG');
  });
  ```

**Implementation**:

- `src/screenshot/ScreenshotError.ts`: Comprehensive error codes
  ```typescript
  export enum ScreenshotErrorCode {
    // Engine/Configuration
    ENGINE_NOT_CONFIGURED = 'ENGINE_NOT_CONFIGURED',
    SCREENSHOT_CAPTURE_FAILED = 'SCREENSHOT_CAPTURE_FAILED',

    // Dimensions
    DIMENSION_TOO_LARGE = 'DIMENSION_TOO_LARGE',
    INVALID_DIMENSIONS = 'INVALID_DIMENSIONS',
    ASPECT_RATIO_MISMATCH = 'ASPECT_RATIO_MISMATCH',
    RESOLUTION_TOO_HIGH = 'RESOLUTION_TOO_HIGH',

    // Memory
    OUT_OF_MEMORY = 'OUT_OF_MEMORY',
    CANVAS_ALLOCATION_FAILED = 'CANVAS_ALLOCATION_FAILED',

    // Format
    UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
    WEBP_NOT_SUPPORTED = 'WEBP_NOT_SUPPORTED',
    TRANSPARENT_REQUIRES_PNG = 'TRANSPARENT_REQUIRES_PNG',

    // Clipboard
    CLIPBOARD_NOT_SUPPORTED = 'CLIPBOARD_NOT_SUPPORTED',
    CLIPBOARD_PERMISSION_DENIED = 'CLIPBOARD_PERMISSION_DENIED',
    CLIPBOARD_NOT_SECURE_CONTEXT = 'CLIPBOARD_NOT_SECURE_CONTEXT',
    CLIPBOARD_FAILED = 'CLIPBOARD_FAILED',

    // Camera
    CAMERA_PRESET_NOT_FOUND = 'CAMERA_PRESET_NOT_FOUND',
    CAMERA_PRESET_NOT_AVAILABLE_IN_2D = 'CAMERA_PRESET_NOT_AVAILABLE_IN_2D',
    CAMERA_PRESET_NOT_AVAILABLE_IN_3D = 'CAMERA_PRESET_NOT_AVAILABLE_IN_3D',
    CAMERA_STATE_INVALID = 'CAMERA_STATE_INVALID',
    CAMERA_TYPE_MISMATCH = 'CAMERA_TYPE_MISMATCH',
    CAMERA_TYPE_NOT_SUPPORTED = 'CAMERA_TYPE_NOT_SUPPORTED',
    CANNOT_OVERWRITE_BUILTIN_PRESET = 'CANNOT_OVERWRITE_BUILTIN_PRESET',

    // Timing
    LAYOUT_SETTLE_TIMEOUT = 'LAYOUT_SETTLE_TIMEOUT',
    OPERATION_TIMEOUT = 'OPERATION_TIMEOUT',

    // Capture
    CAPTURE_FAILED = 'CAPTURE_FAILED',
    RENDER_FAILED = 'RENDER_FAILED',

    // Presets
    PRESET_NOT_FOUND = 'PRESET_NOT_FOUND',
  }

  export class ScreenshotError extends Error {
    constructor(
      message: string,
      public code: ScreenshotErrorCode,
      public details?: unknown
    ) {
      super(message);
      this.name = 'ScreenshotError';
      Object.setPrototypeOf(this, ScreenshotError.prototype);
    }
  }
  ```

- `src/screenshot/capability-check.ts`: Pre-flight capability checks
  ```typescript
  export interface CapabilityCheck {
    supported: boolean;
    reason?: string;
    warnings?: string[];
    estimatedMemoryMB: number;
  }

  export async function canCaptureScreenshot(
    canvas: HTMLCanvasElement,
    options: ScreenshotOptions
  ): Promise<CapabilityCheck> {
    const dims = calculateDimensions(canvas, options);
    const pixels = dims.width * dims.height;
    const memoryMB = (pixels * 4) / (1024 * 1024);

    const warnings: string[] = [];

    // Check dimensions
    if (dims.width > BROWSER_LIMITS.MAX_DIMENSION || dims.height > BROWSER_LIMITS.MAX_DIMENSION) {
      return {
        supported: false,
        reason: `Dimension exceeds browser limit (${BROWSER_LIMITS.MAX_DIMENSION}px)`,
        estimatedMemoryMB: memoryMB
      };
    }

    if (pixels > BROWSER_LIMITS.MAX_PIXELS) {
      return {
        supported: false,
        reason: `Resolution ${dims.width}×${dims.height} exceeds recommended maximum`,
        estimatedMemoryMB: memoryMB
      };
    }

    // Check format support
    if (options.format === 'webp' && !supportsWebP()) {
      return {
        supported: false,
        reason: 'WebP format not supported in this browser',
        estimatedMemoryMB: memoryMB
      };
    }

    // Warnings
    if (pixels > BROWSER_LIMITS.WARN_PIXELS) {
      warnings.push(`Very large resolution (${(pixels/1e6).toFixed(1)}MP) may fail on some devices`);
    }

    if (memoryMB > 100) {
      warnings.push(`High memory usage (~${memoryMB.toFixed(0)}MB) - may cause performance issues`);
    }

    return {
      supported: true,
      warnings: warnings.length > 0 ? warnings : undefined,
      estimatedMemoryMB: memoryMB
    };
  }

  function supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  ```

- Update `src/screenshot/ScreenshotCapture.ts`: Add configuration checks
  ```typescript
  async captureScreenshot(options?: ScreenshotOptions): Promise<ScreenshotResult> {
    // Check engine configuration
    if (!this.engine._gl.getContextAttributes().preserveDrawingBuffer) {
      throw new ScreenshotError(
        'Screenshot requires Engine to be created with preserveDrawingBuffer: true',
        ScreenshotErrorCode.ENGINE_NOT_CONFIGURED
      );
    }

    // ... rest of implementation
  }
  ```

- `src/graph/Graph.ts`: Add canCaptureScreenshot method
  ```typescript
  async canCaptureScreenshot(options?: ScreenshotOptions): Promise<CapabilityCheck> {
    return canCaptureScreenshot(this.canvas, options ?? {});
  }
  ```

- **Update `src/graphty-element.ts`: Expose capability check API (PHASE 6)**
  ```typescript
  /**
   * Check if screenshot can be captured with given options.
   * Available from Phase 6 onwards.
   */
  async canCaptureScreenshot(options?: ScreenshotOptions): Promise<CapabilityCheck> {
    return this.#graph.canCaptureScreenshot(options);
  }
  ```

- **`stories/Screenshot.stories.ts`: Add error handling story**
  ```typescript
  export const ErrorHandling: Story = {
    name: 'Phase 6: Error Handling',
    render: () => html`
      <graphty-element id="graph" .nodeData=${nodeData} .edgeData=${edgeData}></graphty-element>
      <div style="margin-top: 20px;">
        <h3>Error Scenarios</h3>
        <button @click=${async () => {
          const el = document.querySelector('#graph');
          if (!(el instanceof Graphty)) return;

          try {
            await el.captureScreenshot({
              width: 20000,
              height: 20000
            });
          } catch (err) {
            console.error('Error:', err.code, err.message);
            alert(`Error: ${err.message}`);
          }
        }}>
          ❌ Try Excessive Dimensions
        </button>

        <button @click=${async () => {
          const el = document.querySelector('#graph');
          if (!(el instanceof Graphty)) return;

          try {
            await el.captureScreenshot({
              transparentBackground: true,
              format: 'jpeg'
            });
          } catch (err) {
            console.error('Error:', err.code, err.message);
            alert(`Error: ${err.message}`);
          }
        }}>
          ❌ Try JPEG + Transparent
        </button>

        <h3>Capability Checks</h3>
        <button @click=${async () => {
          const el = document.querySelector('#graph');
          if (!(el instanceof Graphty)) return;

          const check = await el.canCaptureScreenshot({ multiplier: 4 });
          console.log('Capability check:', check);

          if (!check.supported) {
            alert(`Cannot capture: ${check.reason}`);
          } else if (check.warnings) {
            alert(`Warnings:\n${check.warnings.join('\n')}`);
          } else {
            alert('Screenshot should work fine!');
          }
        }}>
          ✅ Check 4x Capability
        </button>

        <button @click=${async () => {
          const el = document.querySelector('#graph');
          if (!(el instanceof Graphty)) return;

          const check = await el.canCaptureScreenshot({
            width: 7680,
            height: 4320
          });
          console.log('8K capability check:', check);
          alert(`8K: ${check.supported ? 'Supported' : 'Not supported'}\n${check.reason || ''}\nMemory: ${check.estimatedMemoryMB.toFixed(0)}MB`);
        }}>
          ✅ Check 8K Capability
        </button>
      </div>
    `
  };
  ```

**Dependencies**:
- External: None
- Internal: All previous phases

**Verification**:
1. Run: `npm test -- screenshot-error-codes screenshot-capability-check screenshot-clipboard-errors`
   - Expected: All unit tests pass, all error codes covered
2. Run: `npm run storybook`
   - Navigate to "Screenshot → Phase 6: Error Handling"
   - Click "Try Excessive Dimensions" → Verify error alert with clear message
   - Click "Try JPEG + Transparent" → Verify error alert explaining JPEG doesn't support transparency
   - Click "Check 4x Capability" → Verify success or warnings based on device
   - Click "Check 8K Capability" → Verify warnings about memory usage
3. **User Verification**: At the end of Phase 6, users have robust error handling:
   ```javascript
   const el = document.querySelector('graphty-element');

   // Pre-flight check
   const check = await el.canCaptureScreenshot({ multiplier: 4 });
   if (!check.supported) {
     alert(`Cannot capture: ${check.reason}`);
   } else if (check.warnings) {
     console.warn('Warnings:', check.warnings);
   }

   // Comprehensive error handling
   try {
     const result = await el.captureScreenshot({ multiplier: 4 });
   } catch (err) {
     if (err.code === 'ENGINE_NOT_CONFIGURED') {
       console.error('Please create Engine with preserveDrawingBuffer: true');
     } else if (err.code === 'DIMENSION_TOO_LARGE') {
       console.error('Resolution too high, try lower multiplier');
     }
   }
   ```

---

### Phase 7: Video Capture - Stationary Camera (3-4 days)

**Objective**: Implement stationary camera video capture with MediaRecorder API, frame drop detection, and pre-flight estimation.

**Duration**: 3-4 days

**Testing Approach**: Mock `MediaRecorder` or Babylon `VideoRecorder`, test our frame counting/progress/error logic.

**Tests to Write First**:

- `test/browser/video/video-capture-stationary.test.ts`: Basic video capture with mocks
  ```typescript
  import { vi } from 'vitest';

  // Mock MediaRecorder
  class MockMediaRecorder {
    ondataavailable: ((e: BlobEvent) => void) | null = null;
    onstop: (() => void) | null = null;
    state: 'inactive' | 'recording' | 'paused' = 'inactive';

    start() {
      this.state = 'recording';
    }

    stop() {
      this.state = 'inactive';
      // Simulate data available
      this.ondataavailable?.({ data: new Blob([], { type: 'video/webm' }) } as BlobEvent);
      this.onstop?.();
    }

    static isTypeSupported(type: string) {
      return type.includes('webm');
    }
  }

  vi.stubGlobal('MediaRecorder', MockMediaRecorder);

  // Test: Basic video capture works
  test('can capture video with stationary camera', async () => {
    const result = await graph.captureAnimation({
      duration: 2000,
      fps: 30,
      cameraMode: 'stationary'
    });

    assert.ok(result.blob instanceof Blob);
    assert.equal(result.blob.type, 'video/webm');
    assert.equal(result.metadata.fps, 30);
    assert.ok(result.metadata.framesCaptured >= 0);
  });

  // Test: VP9/VP8 codec auto-detection
  test('auto-detects best supported codec', () => {
    const codec = getBestSupportedCodec();

    assert.ok(
      codec.includes('vp9') ||
      codec.includes('vp8')
    );
  });

  // Test: Progress events fire
  test('fires animation-progress events', async () => {
    const progressEvents: number[] = [];

    graph.addEventListener('animation-progress', (e) => {
      progressEvents.push(e.detail.progress);
    });

    await graph.captureAnimation({
      duration: 1000,
      fps: 10,
      cameraMode: 'stationary'
    });

    assert.ok(progressEvents.length > 0);
    assert.ok(progressEvents[progressEvents.length - 1] >= 90);
  });
  ```

- `test/browser/video/video-frame-drops.test.ts`: Frame drop detection
  ```typescript
  // Test: Frame drop detection logic
  test('calculates frame drop rate correctly', () => {
    const result = {
      framesCaptured: 90,
      expectedFrames: 100
    };

    const dropRate = calculateDropRate(result);
    assert.equal(dropRate, 10); // 10% drop rate
  });

  // Test: Pre-flight estimation logic
  test('estimateAnimationCapture analyzes settings', async () => {
    const estimate = await estimateAnimationCapture({
      width: 3840,
      height: 2160,
      fps: 60,
      duration: 5000
    });

    assert.ok(typeof estimate.likelyToDropFrames === 'boolean');
    assert.ok(estimate.totalFrames === 300); // 60fps * 5s
  });
  ```

- **E2E Smoke Test**:
  ```typescript
  // test/e2e/video-smoke.test.ts
  test('E2E: video capture actually works in Storybook', async () => {
    const page = await browser.newPage();
    await page.goto('http://localhost:9025/?path=/story/video--stationary-camera');

    await page.click('button:has-text("Capture 5s Video")');

    // Wait for completion (5 seconds + processing)
    await page.waitForTimeout(7000);

    const result = await page.evaluate(() => window.lastVideoResult);
    assert.ok(result?.blob instanceof Blob);
    assert.ok(result?.metadata.framesCaptured > 0);
  });
  ```

**Implementation**:

- `src/video/VideoCapture.ts`: Core video capture logic
  ```typescript
  export interface AnimationOptions {
    duration: number;
    fps?: number;
    format?: 'webm' | 'mp4' | 'auto'; // 'auto' detects best format for browser
    videoBitrate?: number;
    width?: number;
    height?: number;
    transparentBackground?: boolean;
    captureMode?: 'realtime' | 'manual';
    cameraMode: 'stationary' | 'animated';
    camera?: CameraState | { preset: string };
    cameraPath?: CameraWaypoint[];
    easing?: 'linear' | 'easeInOut' | 'easeIn' | 'easeOut';
    download?: boolean;
    downloadFilename?: string;
  }

  export interface AnimationResult {
    blob: Blob;
    metadata: {
      duration: number;
      fps: number;
      width: number;
      height: number;
      framesCaptured: number;
      framesDropped: number;
      dropRate: number;
    };
  }
  ```

- `src/video/MediaRecorderCapture.ts`: MediaRecorder wrapper with Safari support
  ```typescript
  export class MediaRecorderCapture {
    /**
     * Detects browser and returns best supported codec
     *
     * Browser Support:
     * - Chrome/Edge/Firefox: WebM (VP9 preferred, VP8 fallback)
     * - Safari/iOS: MP4 (H.264)
     *
     * Format priority:
     * 1. WebM VP9 (best quality, smallest size)
     * 2. WebM VP8 (good quality, good compatibility)
     * 3. MP4 H.264 (Safari, universal fallback)
     */
    private getSupportedCodec(requestedFormat?: 'webm' | 'mp4' | 'auto'): string {
      // If user explicitly requested a format, try that first
      if (requestedFormat === 'mp4') {
        if (MediaRecorder.isTypeSupported('video/mp4')) {
          return 'video/mp4';
        }
        throw new ScreenshotError('MP4 not supported in this browser', 'UNSUPPORTED_FORMAT');
      }

      if (requestedFormat === 'webm') {
        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
          return 'video/webm;codecs=vp9';
        }
        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
          return 'video/webm;codecs=vp8';
        }
        throw new ScreenshotError('WebM not supported in this browser', 'UNSUPPORTED_FORMAT');
      }

      // Auto-detect best format (default)
      // Try WebM first (better compression, open format)
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        return 'video/webm;codecs=vp9';
      }
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
        return 'video/webm;codecs=vp8';
      }

      // Fall back to MP4 for Safari
      if (MediaRecorder.isTypeSupported('video/mp4')) {
        return 'video/mp4';
      }

      // Try without codec specification (browser will choose)
      if (MediaRecorder.isTypeSupported('video/webm')) {
        return 'video/webm';
      }

      throw new ScreenshotError(
        'No supported video formats found. Browser may not support MediaRecorder API.',
        'UNSUPPORTED_FORMAT'
      );
    }

    async captureRealtime(
      canvas: HTMLCanvasElement,
      options: AnimationOptions
    ): Promise<AnimationResult> {
      const codec = this.getSupportedCodec(options.format);
      // ... use codec for MediaRecorder
    }
  }
  ```

- `src/video/estimation.ts`: Pre-flight estimation
  ```typescript
  export async function estimateAnimationCapture(
    options: AnimationOptions
  ): Promise<CaptureEstimate> {
    const totalFrames = (options.duration / 1000) * (options.fps ?? 30);
    const pixelCount = (options.width ?? 1920) * (options.height ?? 1080);

    // Predict likely frame drop rate based on resolution and fps
    const likelyToDropFrames = pixelCount > 2073600 && options.fps > 30;

    return {
      totalFrames,
      likelyToDropFrames,
      recommendedFps: likelyToDropFrames ? 30 : options.fps,
      recommendedResolution: likelyToDropFrames ? '1920x1080' : undefined
    };
  }
  ```

- **Update `src/graphty-element.ts`: Expose video APIs (PHASE 7)**
  ```typescript
  async captureAnimation(options: AnimationOptions): Promise<AnimationResult> {
    return this.#graph.captureAnimation(options);
  }

  cancelAnimationCapture(): void {
    return this.#graph.cancelAnimationCapture();
  }

  async estimateAnimationCapture(options: AnimationOptions): Promise<CaptureEstimate> {
    return this.#graph.estimateAnimationCapture(options);
  }
  ```

- **`stories/Video.stories.ts`: Manual testing story**
  ```typescript
  export const StationaryCamera: Story = {
    name: 'Phase 7: Video - Stationary Camera',
    render: () => html`
      <graphty-element id="graph" .nodeData=${nodeData} .edgeData=${edgeData}></graphty-element>
      <div>
        <button @click=${async () => {
          const el = document.querySelector('#graph');
          if (!(el instanceof Graphty)) return;

          el.setLayout('ngraph');
          const result = await el.captureAnimation({
            duration: 5000,
            fps: 30,
            cameraMode: 'stationary',
            download: true,
            downloadFilename: 'layout-settling.webm'
          });
          console.log('Video captured:', result.metadata);
          console.log('Frames dropped:', result.metadata.framesDropped);
          window.lastVideoResult = result; // For E2E testing
        }}>
          🎥 Capture 5s Video (30fps)
        </button>

        <button @click=${async () => {
          const el = document.querySelector('#graph');
          if (!(el instanceof Graphty)) return;

          const estimate = await el.estimateAnimationCapture({
            duration: 5000,
            fps: 60,
            width: 3840,
            height: 2160
          });
          if (estimate.likelyToDropFrames) {
            alert(`Warning: May drop frames\nRecommended: ${estimate.recommendedResolution} @ ${estimate.recommendedFps}fps`);
          } else {
            alert('Settings should work fine!');
          }
        }}>
          📊 Estimate 4K @ 60fps
        </button>
      </div>
    `
  };
  ```

**Dependencies**:
- External: Browser MediaRecorder API
- Internal: Graph

**Verification**:
1. Run: `npm test -- video-capture-stationary video-frame-drops`
   - Expected: All unit tests pass with mocked MediaRecorder
2. Run: `npm run storybook`
   - Navigate to "Video → Phase 7: Video - Stationary Camera"
   - Test all buttons, verify videos download and play correctly
3. **User Verification**:
   ```javascript
   const el = document.querySelector('graphty-element');

   // Capture video
   const result = await el.captureAnimation({
     duration: 5000,
     fps: 30,
     cameraMode: 'stationary',
     download: true
   });

   console.log('Frames dropped:', result.metadata.framesDropped);
   ```

---

### Phase 8: Video Capture - Animated Camera (3-4 days)

**Testing Approach**: Mock Babylon.js `Animation` class, test waypoint conversion and frame interpolation logic.

*[Similar testing pattern: mock dependencies, test our logic, one E2E smoke test]*

---

## Common Utilities Needed

- **`src/screenshot/dimensions.ts`**: Resolution calculation, aspect ratio validation, browser limit checks
- **`src/screenshot/clipboard.ts`**: Clipboard API wrapper with comprehensive error handling
- **`src/screenshot/presets.ts`**: Screenshot preset definitions
- **`src/camera/presets.ts`**: Camera preset calculation logic (2D and 3D)
- **`src/camera/CameraStateManager.ts`**: Unified camera state management for 2D and 3D
- **`src/video/MediaRecorderCapture.ts`**: MediaRecorder API wrapper with codec detection
- **`src/video/CameraPathAnimator.ts`**: Waypoint to Babylon.js Animation converter
- **`src/video/estimation.ts`**: Pre-flight performance estimation
- **`src/screenshot/ScreenshotError.ts`**: Centralized error handling with error codes

## Testing Infrastructure

### Vitest Configuration for Mocking

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom', // Or 'happy-dom'
    setupFiles: ['./test/setup.ts'],
  }
});
```

### Test Setup File

```typescript
// test/setup.ts
import { vi } from 'vitest';
import * as BABYLON from '@babylonjs/core';

// Mock CreateScreenshotAsync globally
vi.spyOn(BABYLON, 'CreateScreenshotAsync').mockImplementation(async () => {
  // Return a minimal valid PNG data URL
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
});

// Mock MediaRecorder
class MockMediaRecorder {
  // ... (implementation shown in Phase 7)
}
vi.stubGlobal('MediaRecorder', MockMediaRecorder);
```

### Test Helper Utilities

```typescript
// test/helpers/screenshot-helpers.ts
export function createMockGraph() {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  return new Graph(canvas);
}

export function createFakePngBlob() {
  const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  const binary = atob(base64);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: 'image/png' });
}
```

## External Libraries Assessment

- **Browser APIs**: All core features use native browser APIs (canvas.toBlob, navigator.clipboard, MediaRecorder)
- **Babylon.js**: Already a dependency, provides CreateScreenshotAsync and Animation system
- **No additional dependencies required** for Phase 1-8
- **Test Dependencies**: Vitest for mocking (already in project)
- **Future considerations (Phase 3 in design doc)**:
  - PNG metadata: Consider `png-metadata-ts` (~50KB) if metadata embedding needed
  - GIF export: Consider `gif.js` if GIF format needed
  - MP4 export: Consider `ffmpeg.wasm` for broader format support (large dependency ~10MB)

## Risk Mitigation

- **Test reliability**: Mocking eliminates GPU/driver/browser rendering variability
- **MediaRecorder frame drops**: Provide pre-flight estimation, clear warnings, manual mode alternative
- **Browser compatibility**: Auto-detect codec support (VP9 → VP8 fallback), clear error messages for unsupported features
- **Clipboard permissions**: Comprehensive error handling with specific status codes, graceful degradation
- **Memory limits**: Dimension validation prevents exceeding browser canvas limits, warnings for large resolutions
- **Timing issues**: Integration with OperationQueueManager ensures consistent state
- **Performance**: Document enhanceQuality cost prominently, recommend multiplier alternative

## Success Criteria

- ✅ Plan addresses all requirements from design document
- ✅ Each phase delivers testable, user-verifiable functionality
- ✅ Phases build incrementally without breaking existing features
- ✅ **Uniform testing strategy across all phases (mock → unit test → E2E smoke test)**
- ✅ Tests are fast and reliable (no GPU dependencies)
- ✅ Error handling is comprehensive with actionable error codes
- ✅ Both 2D and 3D camera modes are fully supported
- ✅ Public API is complete and well-documented
- ✅ Browser compatibility is validated and documented
