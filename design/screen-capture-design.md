# Screen Capture Design

## Overview

This document outlines the design for screenshot and video capture capabilities in graphty-element. The feature enables users to export visualizations as images (PNG/JPEG/WebP) and videos (WebM) with full control over quality, resolution, camera positioning, and animation.

## Goals

1. Enable high-quality screenshot capture from the WebGL/WebGPU rendered canvas
2. Provide flexible camera positioning API for consistent viewpoints in both 2D and 3D modes
3. Support video capture with both stationary and animated camera modes
4. Offer multiple export formats and quality options
5. Maintain simplicity - let API callers handle batching, naming, and element visibility

## Non-Goals

- Managing filenames (caller's responsibility)
- Batch capture APIs (caller can loop)
- Element show/hide toggles (use existing style layers)
- Event hooks (will fire events instead)
- SVG export (fundamentally incompatible with 3D rendering)

## Key Design Decisions

### 1. Unified Screenshot API with Consistent Return Type
Instead of separate `captureScreenshot()` and `copyScreenshotToClipboard()` methods, we use a single API with a `destination` option that supports multiple outputs (blob, download, clipboard) simultaneously. The method always returns a consistent `ScreenshotResult` object.

**Benefits:**
- Simpler API surface (one method vs two)
- Eliminates parameter duplication
- Enables multi-destination capture (e.g., download AND clipboard)
- Consistent TypeScript types
- Partial failure handling (e.g., screenshot succeeds but clipboard fails)

### 2. OperationQueueManager Integration
All screenshot and animated camera operations integrate with the OperationQueueManager to prevent race conditions and ensure consistent state.

**Benefits:**
- Prevents concurrent operations from interfering
- Screenshots always capture complete/settled state
- Predictable operation sequencing
- Configurable timing behavior (wait for settle, wait for operations)
- Camera animations and screenshots naturally coordinate through the queue

### 3. Built-in Camera Presets for 2D and 3D
Common camera positions (fitToGraph, topView, etc.) are built-in presets that auto-calculate based on current graph state **after** waiting for operations to complete, rather than requiring manual implementation. Presets automatically adapt to the current camera mode (2D orthographic or 3D perspective).

**Benefits:**
- Makes common use cases trivial (e.g., "fit entire graph in view")
- Eliminates duplicate "zoom to fit" features
- Works consistently across 2D and 3D rendering modes
- Works consistently across screenshots, camera API, and videos
- User-defined presets remain supported for custom views
- Presets calculated at the right time (after layout settles)

### 4. Flexible Timing Control
Screenshot operations provide explicit control over timing behavior through `timing` options (waitForSettle, waitForOperations).

**Benefits:**
- Default behavior is safe (waits for everything)
- Power users can optimize for speed when immediate capture is needed
- Clear semantics for different use cases

---

## Prerequisites

### Babylon.js Engine Configuration

**CRITICAL:** Screenshots require the Babylon.js Engine to be configured with `preserveDrawingBuffer: true`.

```typescript
const engine = new Engine(canvas, antialiasing, {
  preserveDrawingBuffer: true,  // REQUIRED for screenshots
  stencil: true                  // Also recommended
});
```

Without this configuration, screenshots will be blank or black. The implementation will check for this requirement at runtime and throw a clear error if not configured.

---

## Phase 1: Core Screenshot API

### Features

#### 1. Screenshot Capture

**Basic Usage:**
```typescript
// Simple capture
const result = await graph.captureScreenshot();

// With options
const result = await graph.captureScreenshot({
  // Format & Quality
  format: 'png',              // 'png' | 'jpeg' | 'webp'
  quality: 0.95,              // 0-1, for jpeg/webp (defaults: 0.92 jpeg, 0.80 webp)

  // Resolution (multiplier takes precedence, explicit dims override)
  multiplier: 2,              // Resolution multiplier (1x, 2x, 4x, etc.)
  width: 1920,                // Optional: explicit width (overrides multiplier)
  height: 1080,               // Optional: explicit height (overrides multiplier)
  strictAspectRatio: false,   // If true, error when width+height don't match canvas ratio

  // Visual Options
  transparentBackground: true, // Replace ALL background layers with transparency
  enhanceQuality: true,       // Temporarily boost anti-aliasing (slow, use sparingly)

  // Destination (can specify multiple)
  destination: {
    blob: true,               // Include blob in result (default: true)
    download: true,           // Auto-trigger download
    clipboard: true,          // Copy to clipboard (may fail due to permissions)
  },
  downloadFilename: 'graph.png', // Filename for download (if download: true)

  // Screenshot Preset (convenience bundles)
  preset: 'print',            // 'print' | 'web-share' | 'thumbnail' | 'documentation'

  // Camera Override
  camera: {                   // Optional: override camera for this screenshot
    preset: 'fitToGraph',     // Use built-in preset, OR
    position: { x: 10, y: 10, z: 10 },
    target: { x: 0, y: 0, z: 0 }
  },

  // Operation Timing
  timing: {
    waitForSettle: true,      // Wait for layout to settle (default: true)
    waitForOperations: true,  // Wait for pending operations (default: true)
  }
});
```

**Return Value:**
```typescript
interface ScreenshotResult {
  /** The captured screenshot blob (always present) */
  blob: Blob;

  /** Whether download was triggered successfully */
  downloaded: boolean;

  /** Clipboard copy status */
  clipboardStatus: 'success' | 'not-supported' | 'permission-denied' | 'not-secure-context' | 'failed';

  /** Clipboard error if copy failed */
  clipboardError?: Error;

  /** Partial failure errors (non-fatal) */
  errors?: ScreenshotError[];

  /** Metadata about the capture */
  metadata: {
    width: number;
    height: number;
    format: string;
    byteSize: number;
    captureTime: number; // milliseconds
  };
}
```

**Events:**
```typescript
// Always fires after capture
element.addEventListener('screenshot-captured', (event) => {
  console.log(event.detail.result); // ScreenshotResult
});

// Clipboard-specific events
element.addEventListener('screenshot-clipboard-success', handler);
element.addEventListener('screenshot-clipboard-permission-denied', handler);
element.addEventListener('screenshot-clipboard-not-supported', handler);
element.addEventListener('screenshot-clipboard-failed', handler);
```

**Implementation Details:**
- Use Babylon.js `CreateScreenshotAsync` (uses canvas.toBlob internally for best performance)
- Check engine `preserveDrawingBuffer` configuration, throw error if not set
- For transparent background, disable ALL background layers (clearColor, skybox, environment, etc.)
- For multiplier/explicit dimensions, follow precedence rules (see Resolution section)
- For enhanced quality, temporarily increase anti-aliasing samples (document performance cost)
- For clipboard destination, use `navigator.clipboard.write()` with comprehensive error handling
- **Queue screenshot operation via OperationQueueManager** (see integration section below)
- If `timing.waitForSettle` is true, wait for layout to report settled state
- If `timing.waitForOperations` is true, wait for queue to be empty before capturing
- **Built-in camera presets are resolved AFTER waiting**, ensuring they calculate based on settled state
- If camera override is specified, temporarily apply camera state, capture, then restore
- Restore original scene/camera state after capture

#### 2. Screenshot Presets

Common screenshot configurations as convenient presets:

```typescript
const SCREENSHOT_PRESETS = {
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

// Usage
await graph.captureScreenshot({ preset: 'print' });

// Override specific options
await graph.captureScreenshot({
  preset: 'print',
  width: 7680  // 8K override
});
```

#### 3. Transparent Background

When `transparentBackground: true`:

**Comprehensive Background Handling:**
```typescript
// Disable ALL background layers
interface BackgroundState {
  clearColor: Color4;
  skyboxEnabled: boolean;
  environmentTexture: BaseTexture | null;
  imageProcessingEnabled: boolean;
  // ... other relevant state
}

async function enableTransparentBackground(): Promise<BackgroundState> {
  const original = {
    clearColor: this.scene.clearColor.clone(),
    skyboxEnabled: this.skybox?.isEnabled() ?? false,
    environmentTexture: this.scene.environmentTexture,
    imageProcessingEnabled: this.scene.imageProcessingConfiguration.isEnabled
  };

  // Disable ALL background layers
  this.scene.clearColor = new Color4(0, 0, 0, 0);

  if (this.skybox) {
    this.skybox.setEnabled(false);
  }

  this.scene.environmentTexture = null;
  this.scene.imageProcessingConfiguration.vignetteEnabled = false;

  await this.waitForRender(); // Apply changes

  return original;
}

function restoreBackground(state: BackgroundState): void {
  // Restore all layers
  this.scene.clearColor = state.clearColor;
  if (this.skybox) {
    this.skybox.setEnabled(state.skyboxEnabled);
  }
  this.scene.environmentTexture = state.environmentTexture;
  this.scene.imageProcessingConfiguration.isEnabled = state.imageProcessingEnabled;
}
```

**Format Requirements:**
- Ensure alpha channel is preserved in output
- Works with PNG and WebP
- **Error if used with JPEG** (doesn't support transparency)

```typescript
if (options.transparentBackground && options.format === 'jpeg') {
  throw new ScreenshotError(
    'Transparent background requires PNG or WebP format',
    'TRANSPARENT_REQUIRES_PNG'
  );
}
```

#### 4. Resolution Control

**Precedence Rules:**

```typescript
/**
 * Resolution multiplier relative to current canvas size.
 * IGNORED if explicit width or height is provided.
 *
 * @example
 * multiplier: 2  // 2x current canvas resolution (Retina)
 * multiplier: 4  // 4x resolution (print quality)
 */
multiplier?: number;

/**
 * Explicit output width in pixels.
 * - If only width provided: height calculated to maintain aspect ratio
 * - If both width and height: uses explicit dimensions (may alter ratio)
 * - Takes precedence over multiplier
 */
width?: number;

/**
 * Explicit output height in pixels.
 * - If only height provided: width calculated to maintain aspect ratio
 * - If both width and height: uses explicit dimensions (may alter ratio)
 * - Takes precedence over multiplier
 */
height?: number;

/**
 * If true, throw error when explicit width+height don't match canvas aspect ratio.
 * Default: false (allow aspect ratio changes)
 */
strictAspectRatio?: boolean;
```

**Implementation:**
```typescript
function calculateDimensions(canvas, options): { width, height } {
  const canvasAspect = canvas.width / canvas.height;

  // Explicit dimensions
  if (options.width && options.height) {
    const requestedAspect = options.width / options.height;
    if (options.strictAspectRatio && Math.abs(requestedAspect - canvasAspect) > 0.01) {
      throw new ScreenshotError(
        `Requested ${options.width}×${options.height} doesn't match canvas aspect ratio`,
        'ASPECT_RATIO_MISMATCH'
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
```

**Sanity Checks:**
```typescript
const BROWSER_LIMITS = {
  MAX_DIMENSION: 16384,     // Conservative browser canvas limit
  MAX_PIXELS: 33_177_600,   // 8K resolution (7680×4320)
  WARN_PIXELS: 8_294_400,   // 4K resolution (3840×2160)
};

function validateDimensions(width: number, height: number): void {
  // Hard limits
  if (width > BROWSER_LIMITS.MAX_DIMENSION || height > BROWSER_LIMITS.MAX_DIMENSION) {
    throw new ScreenshotError(
      `Dimension ${width}×${height} exceeds browser canvas limit (${BROWSER_LIMITS.MAX_DIMENSION}px)`,
      'DIMENSION_TOO_LARGE'
    );
  }

  const pixels = width * height;
  if (pixels > BROWSER_LIMITS.MAX_PIXELS) {
    throw new ScreenshotError(
      `Resolution ${width}×${height} (${(pixels/1e6).toFixed(1)}MP) exceeds recommended maximum`,
      'RESOLUTION_TOO_HIGH'
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

#### 5. Anti-aliasing Enhancement

When `enhanceQuality: true`:

```typescript
/**
 * Temporarily boost anti-aliasing for higher quality screenshot.
 *
 * WARNING: This requires recreating render targets and may take
 * 100-1000ms depending on scene complexity. Use sparingly.
 *
 * Alternative: Use `multiplier: 2` for similar quality improvement
 * with better performance (recommended).
 */
enhanceQuality?: boolean;
```

**Implementation:**
- Temporarily increase MSAA samples (e.g., from 4 to 16)
- Capture screenshot with enhanced quality
- Restore original settings
- Results in smoother edges and better visual quality
- **Document performance cost prominently**

**Events:**
```typescript
graph.addEventListener('screenshot-enhancing', (event) => {
  console.log('Recreating render targets with higher anti-aliasing...');
});

graph.addEventListener('screenshot-ready', (event) => {
  console.log(`Quality enhancement took ${event.detail.enhancementTime}ms`);
});
```

#### 6. Clipboard Error Handling

Comprehensive clipboard error handling:

```typescript
async function copyToClipboard(blob: Blob): Promise<ClipboardStatus> {
  // Check if clipboard API is available
  if (!navigator.clipboard || !navigator.clipboard.write) {
    return {
      status: 'not-supported',
      error: new Error('Clipboard API not supported in this browser')
    };
  }

  // Check for secure context (HTTPS)
  if (!window.isSecureContext) {
    return {
      status: 'not-secure-context',
      error: new Error('Clipboard API requires HTTPS')
    };
  }

  try {
    const item = new ClipboardItem({ [blob.type]: blob });
    await navigator.clipboard.write([item]);
    return { status: 'success' };
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      return {
        status: 'permission-denied',
        error: err
      };
    }
    return {
      status: 'failed',
      error: err
    };
  }
}
```

---

## Phase 1: Camera Positioning API

### Overview

Provides programmatic control over camera position, target, and orientation for both **2D orthographic** and **3D perspective** cameras. Essential for:
- Taking screenshots from consistent viewpoints
- Creating camera presets
- Animating camera movement
- Building navigation systems
- Supporting both 2D graph layouts and 3D visualizations

### API Design

#### Get Camera State

```typescript
interface CameraState {
  // Camera type (determines which properties are used)
  type: 'arcRotate' | 'free' | 'universal' | 'orthographic';

  // 3D Camera Properties (used when type is arcRotate/free/universal)
  position?: { x: number; y: number; z: number };  // 3D position
  target?: { x: number; y: number; z: number };    // 3D look-at target
  alpha?: number;   // ArcRotateCamera: horizontal rotation
  beta?: number;    // ArcRotateCamera: vertical rotation
  radius?: number;  // ArcRotateCamera: distance from target
  fov?: number;     // Perspective field of view (degrees)

  // 2D Camera Properties (used when type is orthographic)
  zoom?: number;    // Orthographic zoom level (1 = default, >1 = zoomed in)
  pan?: { x: number; y: number };  // 2D pan position (world coordinates)
  rotation?: number;  // Optional: 2D rotation angle in radians

  // Orthographic frustum (advanced, usually auto-calculated from zoom)
  orthoLeft?: number;
  orthoRight?: number;
  orthoTop?: number;
  orthoBottom?: number;
}

const state = graph.getCameraState();
```

Returns current camera state as serializable JSON object. The returned object will only contain properties relevant to the current camera type.

#### Set Camera State

```typescript
graph.setCameraState(state: Partial<CameraState> | { preset: string }, options?: {
  animate?: boolean;      // Smoothly transition (default: false)
  duration?: number;      // Animation duration in ms (default: 1000)
  easing?: 'linear' | 'easeInOut' | 'easeIn' | 'easeOut';
});

// Examples:

// 3D: Explicit position
graph.setCameraState({
  type: 'arcRotate',
  position: { x: 10, y: 10, z: 10 },
  target: { x: 0, y: 0, z: 0 }
}, { animate: true, duration: 500 });

// 2D: Explicit pan and zoom
graph.setCameraState({
  type: 'orthographic',
  zoom: 2.0,  // 2x zoom
  pan: { x: 100, y: 50 }  // Center on world coords (100, 50)
}, { animate: true, duration: 500 });

// Built-in preset (auto-adapts to current camera mode)
graph.setCameraState({
  preset: 'fitToGraph'  // Works for both 2D and 3D
}, { animate: true });

// User-defined preset
graph.setCameraState({
  preset: 'myCustomView'
}, { animate: true });
```

**Behavior:**
- Partial updates allowed (e.g., only change position or zoom)
- If `animate: true`, smoothly transition to new state using OperationQueueManager
- Fires `camera-state-changed` event when complete
- Compatible with all camera types (2D orthographic and 3D perspective)
- **Camera animations are queued via OperationQueueManager** (see integration section below)
- **Built-in presets automatically adapt** to current camera mode (2D vs 3D)
- **Built-in presets calculated at invocation time** based on current graph state

#### Convenience Methods

```typescript
// 3D: Set just position
graph.setCameraPosition(
  { x: 10, y: 10, z: 10 },
  { animate: true }
);

// 3D: Set just target
graph.setCameraTarget(
  { x: 0, y: 0, z: 0 },
  { animate: true }
);

// 2D: Set zoom level
graph.setCameraZoom(2.0, { animate: true });

// 2D: Set pan position
graph.setCameraPan({ x: 100, y: 50 }, { animate: true });

// Reset to default view (works for both 2D and 3D)
graph.resetCamera({ animate: true });
```

#### Camera Presets

**Built-in Presets:**

The following presets are available by default and **automatically adapt** to the current camera mode (2D or 3D). They auto-calculate based on current graph state:

```typescript
// Fit entire graph in view with padding (works for both 2D and 3D)
graph.setCameraState({ preset: 'fitToGraph' }, { animate: true });

// Top-down view (2D: standard view, 3D: look down from above)
graph.setCameraState({ preset: 'topView' }, { animate: true });

// 3D only: Side and front views
graph.setCameraState({ preset: 'sideView' }, { animate: true });
graph.setCameraState({ preset: 'frontView' }, { animate: true });

// 3D only: Isometric view
graph.setCameraState({ preset: 'isometric' }, { animate: true });
```

**Built-in Preset Implementations:**

```typescript
// 'fitToGraph' - Calculates optimal camera to fit all nodes
function calculateFitToGraph(graph: Graph): CameraState {
  const bounds = graph.getNodeBoundingBox();
  const center = { x: bounds.center.x, y: bounds.center.y, z: bounds.center.z };

  if (this.camera.mode === '2d') {
    // 2D: Calculate zoom to fit all nodes with padding
    const size = Math.max(bounds.width, bounds.height);
    const zoom = this.canvas.width / (size * 1.2); // 20% padding

    return {
      type: 'orthographic',
      zoom,
      pan: { x: center.x, y: center.y }
    };
  } else {
    // 3D: Calculate distance to fit all nodes with padding
    const size = bounds.getSize();
    const maxDim = Math.max(size.x, size.y, size.z);
    const distance = maxDim / Math.tan(camera.fov / 2) * 1.2; // 20% padding

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

// 'topView' - Top-down view
function calculateTopView(graph: Graph): CameraState {
  const bounds = graph.getNodeBoundingBox();
  const center = { x: bounds.center.x, y: bounds.center.y };

  if (this.camera.mode === '2d') {
    // 2D: Standard top-down view (default for 2D)
    return {
      type: 'orthographic',
      zoom: 1.0,
      pan: center
    };
  } else {
    // 3D: Look down from above
    const distance = bounds.getSize().maxDimension * 1.5;
    return {
      type: 'arcRotate',
      position: { x: center.x, y: center.y + distance, z: bounds.center.z },
      target: { x: center.x, y: center.y, z: bounds.center.z }
    };
  }
}

// 'sideView' - 3D only: Look from the side
// 'frontView' - 3D only: Look from the front
// 'isometric' - 3D only: Classic 3D isometric angle (45° horizontal, 35.264° vertical)
```

**User-defined Presets:**

```typescript
// Save current camera as named preset
graph.saveCameraPreset('myCustomView');

// Restore user-defined preset
graph.loadCameraPreset('myCustomView', { animate: true });

// Get all presets (built-in + user-defined)
const presets = graph.getCameraPresets();
// Returns: {
//   'fitToGraph': { builtin: true },
//   'topView': { builtin: true },
//   'myCustomView': CameraState,
//   ...
// }

// Export/import user-defined presets as JSON
const json = graph.exportCameraPresets();
graph.importCameraPresets(json);
```

### Events

```typescript
// Fired when camera state changes (manually or programmatically)
graph.addEventListener('camera-state-changed', (event) => {
  console.log(event.detail.state); // New CameraState
});

// Fired during camera animation (for progress tracking)
graph.addEventListener('camera-animating', (event) => {
  console.log(event.detail.progress); // 0-1
});
```

---

## OperationQueueManager Integration

### Overview

Screenshot and camera operations must integrate with the existing OperationQueueManager to prevent race conditions and ensure consistent behavior. This is critical because:

1. **Screenshots during layout settling** - Should wait for physics to stabilize
2. **Camera animations** - Block other operations during transition
3. **Concurrent operations** - Prevent multiple screenshots or camera moves simultaneously
4. **Data updates** - Ensure graph state is complete before capture
5. **Built-in preset timing** - Calculate presets based on settled state, not intermediate states

### Screenshot Operation Queueing

```typescript
class Graph {
  async captureScreenshot(options: ScreenshotOptions): Promise<ScreenshotResult> {
    const timing = {
      waitForSettle: true,
      waitForOperations: true,
      ...options.timing
    };

    return this.operationQueue.enqueue(async () => {
      // 1. Wait for layout to settle if requested
      if (timing.waitForSettle) {
        await this.waitForLayoutSettle();
      }

      // 2. THEN resolve camera preset (now graph is in final state)
      let cameraState: CameraState | undefined;
      let originalCameraState: CameraState | undefined;

      if (options.camera) {
        originalCameraState = this.getCameraState();

        // Resolve preset to actual camera state AFTER waiting
        cameraState = options.camera.preset
          ? this.resolveCameraPreset(options.camera.preset)
          : options.camera;

        this.applyCameraStateImmediate(cameraState);
        await this.waitForRender(); // Wait for one frame
      }

      try {
        // 3. Perform the actual capture
        const blob = await this.doScreenshotCapture(options);

        // 4. Handle destinations
        const result: ScreenshotResult = {
          blob,
          downloaded: false,
          clipboardStatus: 'success',
          metadata: {
            width: /* ... */,
            height: /* ... */,
            format: options.format,
            byteSize: blob.size,
            captureTime: /* ... */
          }
        };

        if (options.destination?.download) {
          this.downloadBlob(blob, options.downloadFilename);
          result.downloaded = true;
        }

        if (options.destination?.clipboard) {
          const clipboardResult = await this.copyBlobToClipboard(blob);
          result.clipboardStatus = clipboardResult.status;
          result.clipboardError = clipboardResult.error;

          if (clipboardResult.status === 'success') {
            this.dispatchEvent('screenshot-clipboard-success', { blob });
          } else {
            this.dispatchEvent(`screenshot-clipboard-${clipboardResult.status}`, {
              blob,
              error: clipboardResult.error
            });
          }
        }

        this.dispatchEvent('screenshot-captured', { result });

        return result;
      } finally {
        // Restore camera if it was overridden
        if (originalCameraState) {
          this.applyCameraStateImmediate(originalCameraState);
        }
      }
    });
  }
}
```

### Camera Animation Queueing

```typescript
class Graph {
  async setCameraState(
    state: Partial<CameraState> | { preset: string },
    options?: CameraAnimationOptions
  ): Promise<void> {
    // Immediate updates don't need queueing
    if (!options?.animate) {
      const cameraState = 'preset' in state
        ? this.resolveCameraPreset(state.preset)
        : state;
      this.applyCameraStateImmediate(cameraState);
      this.dispatchEvent('camera-state-changed', { state: cameraState });
      return;
    }

    // Animated transitions must be queued
    return this.operationQueue.enqueue(async () => {
      const cameraState = 'preset' in state
        ? this.resolveCameraPreset(state.preset)
        : state;

      await this.animateCameraTo(cameraState, {
        duration: options.duration ?? 1000,
        easing: options.easing ?? 'easeInOut'
      });

      this.dispatchEvent('camera-state-changed', { state: cameraState });
    });
  }

  private resolveCameraPreset(preset: string): CameraState {
    // Detect if using 2D or 3D camera
    const is2D = this.camera.mode === '2d' || this.camera instanceof OrthographicCamera;

    // Check built-in presets first (auto-adapt to 2D vs 3D)
    switch (preset) {
      case 'fitToGraph':
        return is2D ? this.calculateFitToGraph2D() : this.calculateFitToGraph3D();
      case 'topView':
        return is2D ? this.calculateTopView2D() : this.calculateTopView3D();
      case 'sideView':
        if (is2D) {
          throw new ScreenshotError(
            'sideView preset is only available for 3D cameras',
            'CAMERA_PRESET_NOT_AVAILABLE_IN_2D'
          );
        }
        return this.calculateSideView3D();
      case 'frontView':
        if (is2D) {
          throw new ScreenshotError(
            'frontView preset is only available for 3D cameras',
            'CAMERA_PRESET_NOT_AVAILABLE_IN_2D'
          );
        }
        return this.calculateFrontView3D();
      case 'isometric':
        if (is2D) {
          throw new ScreenshotError(
            'isometric preset is only available for 3D cameras',
            'CAMERA_PRESET_NOT_AVAILABLE_IN_2D'
          );
        }
        return this.calculateIsometric3D();
      default:
        // Check user-defined presets
        const userPreset = this.cameraPresets.get(preset);
        if (!userPreset) {
          throw new ScreenshotError(
            `Unknown camera preset: ${preset}`,
            'CAMERA_PRESET_NOT_FOUND'
          );
        }
        return userPreset;
    }
  }
}
```

### Timing Control Examples

```typescript
// Capture immediately without waiting
await graph.captureScreenshot({
  timing: {
    waitForSettle: false,
    waitForOperations: false
  }
});

// Wait for layout but not other operations
await graph.captureScreenshot({
  timing: {
    waitForSettle: true,
    waitForOperations: false
  }
});

// Wait for everything (default, safest)
await graph.captureScreenshot({
  timing: {
    waitForSettle: true,
    waitForOperations: true
  }
});
```

### Layout Settling Detection

```typescript
class Graph {
  private async waitForLayoutSettle(): Promise<void> {
    if (!this.layoutEngine) {
      return; // No layout running
    }

    // Check if layout reports settled state
    if (this.layoutEngine.isSettled()) {
      return;
    }

    // Wait for layout to settle (with timeout)
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        cleanup();
        reject(new ScreenshotError(
          'Layout did not settle within timeout',
          'LAYOUT_SETTLE_TIMEOUT'
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
}
```

### Integration Benefits

1. **Prevents race conditions** - No concurrent screenshots or conflicting camera moves
2. **Consistent state** - Screenshots always capture a complete, settled graph by default
3. **Proper sequencing** - Operations execute in predictable FIFO order
4. **Resource management** - Only one operation modifies scene at a time
5. **User control** - Timing options provide flexibility when immediate capture is needed
6. **Correct preset timing** - Built-in presets calculate based on final settled state

---

## Error Handling

### Error Code Taxonomy

```typescript
enum ScreenshotErrorCode {
  // Engine/Configuration
  ENGINE_NOT_CONFIGURED = 'ENGINE_NOT_CONFIGURED',
  PRESERVING_BUFFER_REQUIRED = 'PRESERVING_BUFFER_REQUIRED',

  // Dimensions
  DIMENSION_TOO_LARGE = 'DIMENSION_TOO_LARGE',
  INVALID_DIMENSIONS = 'INVALID_DIMENSIONS',
  ASPECT_RATIO_MISMATCH = 'ASPECT_RATIO_MISMATCH',

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

  // Timing
  LAYOUT_SETTLE_TIMEOUT = 'LAYOUT_SETTLE_TIMEOUT',
  OPERATION_TIMEOUT = 'OPERATION_TIMEOUT',

  // Capture
  CAPTURE_FAILED = 'CAPTURE_FAILED',
  RENDER_FAILED = 'RENDER_FAILED',
}

class ScreenshotError extends Error {
  constructor(
    message: string,
    public code: ScreenshotErrorCode,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ScreenshotError';
  }
}
```

### Error Handling Examples

```typescript
try {
  const result = await graph.captureScreenshot(options);
} catch (err) {
  if (err instanceof ScreenshotError) {
    switch (err.code) {
      case 'ENGINE_NOT_CONFIGURED':
        console.error('Please create Engine with preserveDrawingBuffer: true');
        break;

      case 'DIMENSION_TOO_LARGE':
        console.error('Resolution too high for browser:', err.message);
        break;

      case 'OUT_OF_MEMORY':
        console.error('Not enough memory for screenshot:', err.message);
        break;

      case 'LAYOUT_SETTLE_TIMEOUT':
        console.warn('Layout did not settle, capturing anyway');
        // Could retry with waitForSettle: false
        break;

      default:
        console.error('Screenshot failed:', err.message);
    }
  }
}

// Partial failures (non-fatal)
const result = await graph.captureScreenshot({
  destination: { download: true, clipboard: true }
});

if (result.clipboardStatus !== 'success') {
  console.warn('Could not copy to clipboard:', result.clipboardStatus);
  if (result.clipboardStatus === 'permission-denied') {
    showPermissionPrompt();
  }
}
```

---

## Phase 2: Video/Animation Capture

### Overview

Capture animated sequences as WebM video. Two primary modes:
1. **Stationary Camera**: Watch layout/simulation unfold
2. **Animated Camera**: Move camera through waypoints

**IMPORTANT: MediaRecorder Limitations**
- MediaRecorder operates in **real-time** based on wall clock
- If encoding can't keep up with requested FPS, **frames are dropped**
- Cannot "slow down" capture to avoid drops
- For guaranteed frame capture, use manual capture mode

### API Design

#### Basic Video Capture

```typescript
const blob = await graph.captureAnimation({
  // Duration & Quality
  duration: 5000,              // Total duration in ms
  fps: 30,                     // Frames per second (default: 30, max recommended: 30)
  format: 'webm',              // 'webm' only (Phase 2)
  videoBitrate: 2500000,       // Bits per second (optional)

  // Canvas Settings
  width: 1920,                 // Video resolution (default: 1920, max recommended: 1920)
  height: 1080,                // (default: 1080)
  transparentBackground: false, // WebM supports alpha

  // Capture Mode
  captureMode: 'realtime',     // 'realtime' | 'manual' (default: 'realtime')

  // Camera Mode (choose one)
  cameraMode: 'stationary',    // 'stationary' | 'animated'

  // Download
  download: true,
  downloadFilename: 'graph-animation.webm'
});
```

**Capture Modes:**

```typescript
/**
 * 'realtime' (default):
 *   - Uses MediaRecorder API
 *   - Fast, hardware-accelerated
 *   - May drop frames if system can't keep up
 *   - Good for: Demos, previews, reasonable resolutions (<= 1080p @ 30fps)
 *
 * 'manual':
 *   - Captures each frame individually
 *   - Encode offline with library (e.g., ffmpeg.wasm)
 *   - Slower, but guarantees all frames
 *   - Good for: High-quality exports, complex scenes, guaranteed quality
 */
captureMode: 'realtime' | 'manual'
```

**Return Value:**
```typescript
interface AnimationResult {
  blob: Blob;
  metadata: {
    duration: number;
    fps: number;
    width: number;
    height: number;
    framesCaptured: number;
    framesDropped: number;      // > 0 indicates quality degradation
    dropRate: number;            // Percentage of frames dropped
  };
}
```

**Events:**
```typescript
// Progress tracking
graph.addEventListener('animation-progress', (event) => {
  console.log(`${event.detail.progress}% complete`);
  console.log(`Frame ${event.detail.frame} of ${event.detail.totalFrames}`);
});

// Frame drops (realtime mode only)
graph.addEventListener('animation-frame-dropped', (event) => {
  console.warn(`Frame ${event.detail.frameNumber} dropped`);
  console.log(`Total dropped: ${event.detail.totalDropped}/${event.detail.totalFrames}`);
});

// Completion
graph.addEventListener('animation-captured', (event) => {
  console.log('Video ready:', event.detail.result);
  if (event.detail.result.metadata.framesDropped > 0) {
    console.warn(
      `Video quality degraded: ${event.detail.result.metadata.framesDropped} frames dropped`
    );
  }
});
```

#### Pre-flight Estimation

Check if requested capture is likely to succeed:

```typescript
const estimate = await graph.estimateAnimationCapture({
  width: 1920,
  height: 1080,
  fps: 60
});

if (estimate.likelyToDropFrames) {
  console.warn(`Warning: ${estimate.expectedDropRate}% frame drop rate predicted`);
  console.log(`Recommendation: Use ${estimate.recommendedResolution} or ${estimate.recommendedFps} fps`);
}

// Proceed with adjusted settings
await graph.captureAnimation({
  ...estimate.recommendedSettings
});
```

#### Mode 1: Stationary Camera

Capture graph evolution with fixed camera:

```typescript
await graph.captureAnimation({
  duration: 5000,
  fps: 30,
  cameraMode: 'stationary',
  camera: {                    // Optional: specific viewpoint
    position: { x: 10, y: 10, z: 10 },
    target: { x: 0, y: 0, z: 0 }
  }
});
```

**Use Cases:**
- Physics-based layout settling
- Graph data updates/transitions
- Algorithm visualizations
- Time-series data evolution

**Implementation:**
- Capture frames at regular intervals (1000/fps ms)
- Use MediaRecorder API for WebM encoding (realtime mode)
- Scene continues normal updates between frames
- Camera remains fixed throughout

#### Mode 2: Animated Camera Path

Move camera through waypoints:

```typescript
await graph.captureAnimation({
  duration: 5000,
  fps: 30,
  cameraMode: 'animated',
  cameraPath: [
    {
      position: { x: 10, y: 10, z: 10 },
      target: { x: 0, y: 0, z: 0 },
      timestamp: 0        // Start position
    },
    {
      position: { x: 0, y: 20, z: 0 },
      target: { x: 0, y: 0, z: 0 },
      timestamp: 2500     // Midpoint
    },
    {
      position: { x: -10, y: 10, z: 10 },
      target: { x: 0, y: 0, z: 0 },
      timestamp: 5000     // End position
    }
  ],
  easing: 'easeInOut'    // Interpolation between waypoints
});
```

**Waypoint Interpolation:**
- User provides intuitive waypoint API with timestamps
- Waypoints converted to Babylon.js Animation objects internally
- `easing` option applies to all animation segments
- Timestamps define when camera reaches each waypoint
- Position and target interpolated independently
- **Implementation uses Babylon.js animation system** for smooth, optimized interpolation

**Use Cases:**
- Cinematic graph tours
- Multi-angle presentations
- Marketing materials
- Interactive graph exploration recordings

**Implementation Strategy:**
- **Hybrid approach:** Waypoint API + Babylon.js animations
- Convert user waypoints to Babylon.js Animation keys
- Apply user-selected easing to animations
- **Realtime mode:** Let Babylon.js animate in render loop
- **Manual mode:** Query animation state at specific frame numbers
- Works for both 2D (zoom, pan) and 3D (position, target) cameras
- Graph can be static or animating during camera movement

#### Cancellation

```typescript
// Start capture
const capturePromise = graph.captureAnimation({ ... });

// Cancel during capture
graph.cancelAnimationCapture();

// Promise rejects with CancellationError
try {
  await capturePromise;
} catch (err) {
  if (err.name === 'CancellationError') {
    console.log('Capture cancelled');
  }
}
```

### Implementation Notes

#### MediaRecorder API (WebM) - Realtime Mode

```typescript
const stream = canvas.captureStream(fps);
const recorder = new MediaRecorder(stream, {
  mimeType: 'video/webm;codecs=vp9',  // Auto-detect VP9/VP8
  videoBitsPerSecond: 2500000
});

const chunks: Blob[] = [];
recorder.ondataavailable = (e) => chunks.push(e.data);
recorder.onstop = () => {
  const blob = new Blob(chunks, { type: 'video/webm' });
  // Return or download blob
};

recorder.start();
// Capture for duration...
recorder.stop();
```

**Codec Auto-detection:**
```typescript
function getSupportedCodec(): string {
  // Try VP9 first (best quality/compression)
  if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
    return 'video/webm;codecs=vp9';
  }
  // Fall back to VP8
  if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
    return 'video/webm;codecs=vp8';
  }
  throw new Error('WebM video capture not supported in this browser');
}
```

**Advantages:**
- Native browser API, no dependencies
- Hardware acceleration available
- Good compression (VP9 codec)
- Supports transparency (alpha channel)

**Limitations:**
- WebM only (MP4 requires polyfill/library)
- Browser support varies (good in Chrome/Firefox, limited Safari)
- **Real-time encoding** - drops frames if browser can't keep up
- Cannot capture faster than playback

#### Camera Animation Implementation (Babylon.js)

**Hybrid Approach: Waypoint API + Babylon.js Animations**

User-facing API uses waypoints, but implementation leverages Babylon.js's robust animation system:

```typescript
class CameraPathAnimator {
  /**
   * Convert user waypoints to Babylon.js Animation objects
   * Works for both 2D (zoom, pan) and 3D (position, target) cameras
   */
  createCameraAnimations(
    waypoints: CameraWaypoint[],
    fps: number,
    easing: string
  ): Animation[] {
    const animations: Animation[] = [];
    const is2D = this.camera.mode === '2d';

    if (is2D) {
      // 2D: Animate zoom and pan
      animations.push(
        this.createAnimation('zoom', waypoints, fps, easing, Animation.ANIMATIONTYPE_FLOAT),
        this.createAnimation('pan.x', waypoints, fps, easing, Animation.ANIMATIONTYPE_FLOAT),
        this.createAnimation('pan.y', waypoints, fps, easing, Animation.ANIMATIONTYPE_FLOAT)
      );
    } else {
      // 3D: Animate position and target
      animations.push(
        this.createAnimation('position', waypoints, fps, easing, Animation.ANIMATIONTYPE_VECTOR3),
        this.createAnimation('target', waypoints, fps, easing, Animation.ANIMATIONTYPE_VECTOR3)
      );
    }

    return animations;
  }

  private createAnimation(
    property: string,
    waypoints: CameraWaypoint[],
    fps: number,
    easing: string,
    type: number
  ): Animation {
    const animation = new Animation(
      `camera_${property}`,
      property,
      fps,
      type,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    // Convert waypoints to animation keys
    const keys = waypoints.map(wp => ({
      frame: this.timestampToFrame(wp.timestamp, fps),
      value: this.getPropertyValue(wp, property)
    }));

    animation.setKeys(keys);
    this.applyEasing(animation, easing);

    return animation;
  }

  private applyEasing(animation: Animation, easing: string): void {
    const easingFunction = this.getEasingFunction(easing);
    if (easingFunction) {
      animation.setEasingFunction(easingFunction);
    }
  }

  private getEasingFunction(easing: string): IEasingFunction | null {
    switch (easing) {
      case 'linear':
        return null; // No easing
      case 'easeInOut':
        return new CubicEase();
      case 'easeIn':
        const easeIn = new CubicEase();
        easeIn.setEasingMode(EasingFunction.EASINGMODE_EASEIN);
        return easeIn;
      case 'easeOut':
        const easeOut = new CubicEase();
        easeOut.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);
        return easeOut;
      default:
        return null;
    }
  }

  /**
   * Realtime mode: Start Babylon.js animation
   * Animation runs naturally in the render loop
   */
  async startRealtimeAnimation(animations: Animation[]): Promise<void> {
    this.camera.animations = animations;
    const totalFrames = this.durationToFrames(this.duration, this.fps);

    return new Promise((resolve) => {
      const animatable = this.scene.beginAnimation(
        this.camera,
        0,
        totalFrames,
        false, // Don't loop
        1.0,   // Speed
        () => resolve() // onAnimationEnd
      );

      this.currentAnimatable = animatable;
    });
  }

  /**
   * Manual mode: Query animation at specific frames
   * For guaranteed quality, capture each frame individually
   */
  getCameraStateAtFrame(animations: Animation[], frame: number): CameraState {
    const is2D = this.camera.mode === '2d';

    if (is2D) {
      return {
        type: 'orthographic',
        zoom: this.evaluateAnimation(animations, 'zoom', frame),
        pan: {
          x: this.evaluateAnimation(animations, 'pan.x', frame),
          y: this.evaluateAnimation(animations, 'pan.y', frame)
        }
      };
    } else {
      return {
        type: 'arcRotate',
        position: this.evaluateAnimation(animations, 'position', frame),
        target: this.evaluateAnimation(animations, 'target', frame)
      };
    }
  }

  private evaluateAnimation(animations: Animation[], propertyName: string, frame: number): any {
    const animation = animations.find(a => a.targetProperty === propertyName);
    if (!animation) return undefined;

    // Babylon.js Animation.evaluate() returns interpolated value at frame
    return animation.evaluate(frame);
  }

  /**
   * Manual capture implementation
   */
  async captureManualMode(animations: Animation[]): Promise<Blob> {
    const frames: Blob[] = [];
    const totalFrames = this.durationToFrames(this.duration, this.fps);

    for (let frame = 0; frame < totalFrames; frame++) {
      // Get exact camera state at this frame
      const cameraState = this.getCameraStateAtFrame(animations, frame);

      // Apply camera state
      this.applyCameraStateImmediate(cameraState);

      // Wait for render
      await this.waitForRender();

      // Capture frame
      const blob = await this.captureCurrentFrame();
      frames.push(blob);

      // Emit progress
      this.dispatchEvent('animation-progress', {
        frame,
        totalFrames,
        progress: (frame / totalFrames) * 100
      });
    }

    // Encode frames to video (e.g., using ffmpeg.wasm)
    return this.encodeFramesToVideo(frames);
  }

  private timestampToFrame(timestamp: number, fps: number): number {
    return Math.round((timestamp / 1000) * fps);
  }

  private durationToFrames(duration: number, fps: number): number {
    return Math.round((duration / 1000) * fps);
  }
}
```

**Why This Approach:**
- ✅ **Clean user API** - Waypoints are intuitive and simple
- ✅ **Babylon.js handles interpolation** - Battle-tested, smooth, optimized
- ✅ **Works for both capture modes:**
  - Realtime: Babylon animates naturally
  - Manual: Query animation for exact frame state
- ✅ **Supports 2D and 3D** - Same pattern, different properties
- ✅ **Less code to maintain** - Leverage Babylon's animation system
- ✅ **Rich easing options** - Built-in easing functions
- ✅ **Exact frame control** - Animation.evaluate() gives precise values

---

## Phase 3: Future Considerations

### Advanced Features

1. **PNG Metadata Embedding**
   - Embed graph information in PNG metadata (tEXt chunks)
   - Requires external library (png-metadata-ts, png-chunk-text)
   - Adds ~50KB to bundle size
   - Binary PNG manipulation complexity
   - May slow down screenshot capture

```typescript
// Phase 3 API (if implemented)
{
  embedMetadata: true,  // Requires optional library
  metadata: {
    'graphty:version': '1.0.0',
    'graphty:nodeCount': '150',
    'graphty:edgeCount': '200',
    'graphty:layout': 'force-directed',
  }
}
```

2. **GIF Export**
   - Requires library (gif.js, gifshot)
   - Larger file sizes than WebM
   - Universal compatibility
   - No audio support

3. **Bezier Camera Paths**
   - Smooth curved camera movement using Babylon.js bezier interpolation
   - Control points for path shape
   - More cinematic results than linear waypoints
   - Builds naturally on existing Babylon.js Animation approach
   - Would use Animation.setKeys() with bezier tangents

4. **Advanced Animation Curves**
   - Custom easing functions beyond built-in options
   - Per-waypoint easing control (different easing per segment)
   - Babylon.js animation curves and spline support
   - Could leverage Animation class's full capabilities
   - IAnimationKey with inTangent/outTangent for smooth curves

5. **MP4 Export**
   - Requires transcoding (ffmpeg.wasm)
   - Better compatibility than WebM
   - Larger dependencies

6. **Audio Track Support**
   - Background music for videos
   - Voiceover narration
   - MediaRecorder supports audio streams

---

## Public API Surface

### On `<graphty-element>` Component

```typescript
// Screenshot (unified API with destination options)
await element.captureScreenshot(options): Promise<ScreenshotResult>;

// Camera (supports both 2D and 3D)
const state = element.getCameraState();
element.setCameraState(state, options);  // Supports both presets and explicit state

// 3D Camera convenience methods
element.setCameraPosition(position, options);  // 3D only
element.setCameraTarget(target, options);      // 3D only

// 2D Camera convenience methods
element.setCameraZoom(zoom, options);          // 2D only
element.setCameraPan(pan, options);            // 2D only

// Universal
element.resetCamera(options);                  // Works for both 2D and 3D

// Camera Presets
// Built-in: 'fitToGraph', 'topView' (auto-adapt to 2D/3D)
//           'sideView', 'frontView', 'isometric' (3D only)
element.saveCameraPreset(name);         // Save user-defined presets
element.loadCameraPreset(name, options); // Load user-defined or built-in presets
element.getCameraPresets();              // Get all presets

// Video (Phase 2)
await element.captureAnimation(options): Promise<AnimationResult>;
element.cancelAnimationCapture();
await element.estimateAnimationCapture(options): Promise<CaptureEstimate>;
```

### On `Graph` Class

Same methods available on Graph instance:
```typescript
const graph = new Graph(/* ... */);
await graph.captureScreenshot(options);
// ... etc
```

### Events

```typescript
// Screenshot events
element.addEventListener('screenshot-captured', handler);  // Always fires
element.addEventListener('screenshot-clipboard-success', handler);
element.addEventListener('screenshot-clipboard-permission-denied', handler);
element.addEventListener('screenshot-clipboard-not-supported', handler);
element.addEventListener('screenshot-clipboard-failed', handler);
element.addEventListener('screenshot-enhancing', handler);  // Quality boost started
element.addEventListener('screenshot-ready', handler);      // Quality boost complete

// Camera events
element.addEventListener('camera-state-changed', handler);
element.addEventListener('camera-animating', handler);

// Video events
element.addEventListener('animation-progress', handler);
element.addEventListener('animation-frame-dropped', handler);
element.addEventListener('animation-captured', handler);
element.addEventListener('animation-cancelled', handler);
```

---

## Implementation Strategy

### Phase 1A: Screenshot Core (Week 1)

1. Implement basic screenshot capture on Graph class
   - Format selection (PNG/JPEG/WebP)
   - Quality control
   - Resolution multiplier with dimension precedence
   - **Return ScreenshotResult object**
   - **Integrate with OperationQueueManager**
   - **Engine configuration check (preserveDrawingBuffer)**

2. Add destination options
   - Unified API with blob/download/clipboard destinations
   - Trigger browser download with filename parameter
   - **Comprehensive clipboard error handling**

3. Add transparent background support
   - **Disable ALL background layers** (clearColor, skybox, environment, etc.)
   - Preserve alpha channel
   - **Error on JPEG + transparent combination**

4. **Add dimension validation**
   - Sanity checks for browser limits
   - Memory warnings
   - Aspect ratio validation (optional strict mode)

5. **Add screenshot presets**
   - print, web-share, thumbnail, documentation

6. Expose on `<graphty-element>` public API

7. **Add comprehensive error handling**
   - Error codes enum
   - ScreenshotError class
   - Partial failure handling

8. Add events (screenshot-captured, clipboard-*, etc.)

9. Write unit tests

### Phase 1B: Advanced Screenshot & Timing (Week 2)

1. Add timing control options
   - waitForSettle integration with layout engines
   - waitForOperations integration with queue
   - **Ensure built-in presets calculate AFTER settling**

2. Add camera position override
   - Temporarily set camera for screenshot
   - Support both explicit position and presets
   - **Resolve presets after waiting for settle**
   - Restore after capture

3. Add anti-aliasing enhancement
   - Boost MSAA samples during capture
   - **Document performance cost prominently**
   - Add enhancement events

4. Write integration tests

### Phase 1C: Camera API (Week 2-3)

1. Implement getCameraState()
   - **Support both 2D (OrthographicCamera) and 3D (ArcRotateCamera/Free/Universal)**
   - Return only relevant properties for current camera type
   - Serialize to JSON

2. Implement setCameraState()
   - Partial updates
   - **Support 2D properties: zoom, pan, rotation**
   - **Support 3D properties: position, target, alpha, beta, radius, fov**
   - Animation support using Babylon.js animations (both 2D and 3D)
   - **Integrate animated transitions with OperationQueueManager**
   - Support both explicit state and preset names

3. Implement built-in camera presets
   - **Auto-detect 2D vs 3D camera mode**
   - fitToGraph (auto-calculate from bounding box, works for both 2D and 3D)
   - topView (adapts to 2D or 3D)
   - sideView, frontView, isometric (3D only, error on 2D)
   - Preset resolution logic with mode detection

4. Implement user-defined camera presets
   - Save/load named presets (preserve camera type)
   - Export/import as JSON
   - Don't overwrite built-in presets

5. Add convenience methods
   - **2D: setCameraZoom, setCameraPan**
   - **3D: setCameraPosition, setCameraTarget**
   - resetCamera (works for both)

6. Add camera events

7. Write tests (test both 2D and 3D modes)

### Phase 2: Video Capture (Week 4-5)

1. Implement stationary camera video capture
   - MediaRecorder API setup with VP9/VP8 auto-detection
   - Frame capture timing
   - **Frame drop detection and reporting**
   - Progress events

2. **Add pre-flight estimation**
   - Predict likely frame drop rate
   - Recommend settings adjustments

3. **Add capture modes**
   - Realtime mode (MediaRecorder)
   - Manual mode (frame-by-frame with offline encoding)

4. **Implement animated camera path (Hybrid approach)**
   - User-facing waypoint API for intuitive path definition
   - **Convert waypoints to Babylon.js Animation objects**
   - **Support both 2D (zoom, pan) and 3D (position, target) animations**
   - Apply easing via Babylon.js easing functions (CubicEase, etc.)
   - **Realtime mode:** Use scene.beginAnimation() for smooth playback
   - **Manual mode:** Use Animation.evaluate() for exact frame states
   - Leverage Babylon's interpolation instead of manual calculations

5. Add cancellation support
   - Stop Babylon.js animatable if running
   - Abort frame capture loop

6. Write integration tests with actual video playback
   - Test waypoint conversion to animations
   - Verify easing functions work correctly
   - Test both 2D and 3D camera animations

7. Performance testing and optimization

---

## Testing Strategy

### Unit Tests

- Screenshot options validation
- **Dimension validation and limits**
- **Error code coverage (including 2D/3D camera errors)**
- **Camera state serialization/deserialization (2D and 3D)**
- **2D camera state: zoom, pan, rotation**
- **3D camera state: position, target, alpha, beta, radius, fov**
- **Waypoint to Babylon.js Animation conversion**
- **Animation.evaluate() returns correct values at frame boundaries**
- **Easing function application via Babylon.js**
- **Clipboard error handling**
- **Resolution precedence rules**

### Integration Tests

- Capture screenshot and verify blob type/size
- **ScreenshotResult object structure**
- **Engine configuration check**
- Transparent background actually transparent (all layers disabled)
- **Format validation (e.g., JPEG + transparent = error)**
- **Camera state get/set round-trip (test both 2D and 3D)**
- **Built-in presets calculate correctly for both 2D and 3D modes**
- **Built-in presets auto-adapt to current camera mode**
- **3D-only presets error when used with 2D cameras**
- **2D camera convenience methods (setCameraZoom, setCameraPan)**
- **3D camera convenience methods (setCameraPosition, setCameraTarget)**
- Video capture produces valid WebM
- **Frame drop detection works**

### Visual Tests (Playwright)

- Compare screenshots pixel-by-pixel
- Verify multiplier increases resolution
- Verify transparent background (alpha channel, no skybox/environment)
- **Verify camera position override works (2D and 3D)**
- **Verify 2D camera preset screenshots match expected views**
- **Verify 3D camera preset screenshots match expected views**
- **Verify presets calculate after settling (2D and 3D)**
- Verify video playback (basic sanity)

### Manual Testing

- Download functionality works
- Clipboard copy works (permissions, errors)
- **Camera animation smooth (2D zoom/pan and 3D rotation/movement)**
- Video quality acceptable
- Multiple formats produce valid files
- **Screenshot presets work as expected**
- **2D camera controls feel natural**
- **3D camera controls feel natural**

---

## Browser Compatibility

### Screenshot Features
- **PNG/JPEG/WebP**: All modern browsers
- **Clipboard API**: Chrome 76+, Firefox 87+, Safari 13.1+ (may require permissions)
- **Transparent background**: All (PNG/WebP support)

### Video Features
- **MediaRecorder (WebM)**: Chrome 47+, Firefox 25+, Safari 14.1+
- **VP9 codec**: Chrome 48+, Firefox 28+, Safari 14.1+ (limited)
- **VP8 codec**: Chrome 47+, Firefox 25+, Safari 14.1+
- **Alpha channel**: Chrome 96+, Firefox limited

### Fallbacks
- Provide polyfill detection
- Graceful degradation for unsupported features
- **Clear error messages with error codes**

---

## Performance Considerations

### Screenshot
- High multipliers (4x+) may cause memory issues
- **Dimension validation prevents exceeding browser limits**
- **enhanceQuality adds 100-1000ms** - use sparingly
- Consider using `multiplier: 2` instead of enhanceQuality for better performance

### Video Capture
- **Real-time encoding limited by browser performance**
- **Large resolutions WILL drop frames** in realtime mode
- **Recommended limits: 1920×1080 @ 30fps**
- **Use manual mode for guaranteed quality** (slower but no drops)
- **Pre-flight estimation helps avoid issues**
- Consider limiting max resolution (1920×1080 default)

### Memory Management
- Clean up temporary canvases immediately
- Revoke blob URLs after use
- Release MediaRecorder resources
- **Dimension sanity checks prevent out-of-memory crashes**

---

## Security Considerations

### Screenshot
- Respect CORS for textures/images
- **User gesture may be required for clipboard API**
- **HTTPS required for clipboard API**
- Downloaded files are user-initiated
- **Engine must be configured correctly (preserveDrawingBuffer)**

### Video
- MediaRecorder requires user gesture in some browsers
- Large video files may exceed memory limits
- Rate limiting for abuse prevention
- **Frame drop detection prevents quality issues**

---

## Examples

### Example 1: High-Quality Screenshot for Print

```typescript
// Capture 4K screenshot with enhanced quality
const result = await graph.captureScreenshot({
  preset: 'print',            // Auto-sets format, multiplier, enhanceQuality
  width: 3840,                // Override to 8K
  height: 2160,
  downloadFilename: 'social-network-4k.png'
});

console.log(`Captured ${result.metadata.width}×${result.metadata.height} in ${result.metadata.captureTime}ms`);
```

### Example 2: Consistent Documentation Screenshots

```typescript
// Use built-in preset for consistent overview
const result = await graph.captureScreenshot({
  preset: 'documentation',
  camera: { preset: 'fitToGraph' },  // Calculated AFTER layout settles
  downloadFilename: 'doc-overview.png'
});

// Save custom camera positions as presets
graph.saveCameraPreset('detail-view');

// Later: capture with user-defined preset
await graph.captureScreenshot({
  preset: 'documentation',
  camera: { preset: 'detail-view' },
  downloadFilename: 'doc-detail.png'
});
```

### Example 3: Quick Share to Clipboard

```typescript
// Copy screenshot to clipboard for pasting in Slack/email
const result = await graph.captureScreenshot({
  preset: 'web-share'  // Auto-sets multiplier: 2, clipboard: true
});

if (result.clipboardStatus === 'success') {
  showToast('Screenshot copied! Paste anywhere to share.');
} else if (result.clipboardStatus === 'permission-denied') {
  showToast('Please allow clipboard access to enable sharing');
} else {
  console.error('Clipboard copy failed:', result.clipboardError);
}
```

### Example 4: Layout Animation Video

```typescript
// Estimate first
const estimate = await graph.estimateAnimationCapture({
  duration: 10000,
  fps: 30,
  width: 1920,
  height: 1080
});

if (estimate.likelyToDropFrames) {
  console.warn(`May drop ${estimate.expectedDropRate}% of frames`);
  // Use recommended settings or manual mode
}

// Record force-directed layout settling
const result = await graph.captureAnimation({
  duration: 10000,  // 10 seconds
  fps: 30,
  captureMode: 'realtime',
  cameraMode: 'stationary',
  camera: {
    preset: 'fitToGraph'  // Auto-positions camera
  },
  downloadFilename: 'force-layout-settling.webm'
});

if (result.metadata.framesDropped > 0) {
  console.warn(`${result.metadata.framesDropped} frames dropped (${result.metadata.dropRate}%)`);
}
```

### Example 5: Cinematic Graph Tour

```typescript
// Create 360° rotation around graph
const waypoints = [];
const numWaypoints = 8;
const radius = 20;
const duration = 8000;

for (let i = 0; i <= numWaypoints; i++) {
  const angle = (i / numWaypoints) * Math.PI * 2;
  waypoints.push({
    position: {
      x: Math.cos(angle) * radius,
      y: 10,
      z: Math.sin(angle) * radius
    },
    target: { x: 0, y: 0, z: 0 },
    timestamp: (i / numWaypoints) * duration
  });
}

await graph.captureAnimation({
  duration,
  fps: 30,
  captureMode: 'manual',  // Guarantee all frames
  cameraMode: 'animated',
  cameraPath: waypoints,
  easing: 'linear',
  width: 1920,
  height: 1080,
  downloadFilename: 'graph-tour-360.webm'
});
```

### Example 6: 2D Camera Positioning and Screenshots

```typescript
// 2D: Set specific zoom and pan
graph.setCameraState({
  type: 'orthographic',
  zoom: 2.5,
  pan: { x: 150, y: 200 }
}, { animate: true });

// 2D: Capture screenshot with fitToGraph preset
const result = await graph.captureScreenshot({
  camera: { preset: 'fitToGraph' },  // Auto-adapts to 2D mode
  destination: { download: true },
  downloadFilename: '2d-graph-overview.png'
});

// 2D: Animate zoom in
graph.setCameraZoom(3.0, { animate: true, duration: 1000 });

// 2D: Pan to specific node coordinates
const nodePos = graph.getNode('node123').position;
graph.setCameraPan(
  { x: nodePos.x, y: nodePos.y },
  { animate: true, duration: 500 }
);
```

### Example 7: 3D Camera Positioning and Screenshots

```typescript
// 3D: Explicit camera position
graph.setCameraState({
  type: 'arcRotate',
  position: { x: 100, y: 150, z: 100 },
  target: { x: 0, y: 0, z: 0 }
}, { animate: true });

// 3D: Capture from isometric angle
const result = await graph.captureScreenshot({
  camera: { preset: 'isometric' },
  multiplier: 2,
  destination: { download: true },
  downloadFilename: '3d-isometric-view.png'
});

// 3D: Use ArcRotate camera properties
graph.setCameraState({
  type: 'arcRotate',
  alpha: Math.PI / 4,   // 45° horizontal
  beta: Math.PI / 3,    // 60° vertical
  radius: 200
}, { animate: true });
```

### Example 8: Error Handling (Including Camera Type Errors)

```typescript
try {
  const result = await graph.captureScreenshot({
    width: 16000,
    height: 16000,
    format: 'jpeg',
    transparentBackground: true,
    camera: { preset: 'isometric' }  // 3D-only preset
  });
} catch (err) {
  if (err instanceof ScreenshotError) {
    switch (err.code) {
      case 'DIMENSION_TOO_LARGE':
        console.error('Resolution exceeds browser limits');
        // Retry with smaller dimensions
        break;

      case 'TRANSPARENT_REQUIRES_PNG':
        console.error('JPEG does not support transparency');
        // Retry with PNG format
        break;

      case 'ENGINE_NOT_CONFIGURED':
        console.error('Engine needs preserveDrawingBuffer: true');
        break;

      case 'CAMERA_PRESET_NOT_AVAILABLE_IN_2D':
        console.error('Cannot use 3D preset with 2D camera');
        // Use 2D-compatible preset instead
        break;

      default:
        console.error('Screenshot failed:', err.message);
    }
  }
}
```

---

## Resolved Design Questions

1. **Camera Presets Storage**: ✅ **No persistence at web component level**
   - Built-in presets (fitToGraph, etc.) are always available
   - User-defined presets managed by application layer via export/import
   - Web component provides the API, application handles storage

2. **Video Format Detection**: ✅ **Yes, auto-detect best supported codec**
   - Try VP9 first (best quality/compression)
   - Fall back to VP8 if VP9 not available
   - Clear error message if neither supported

3. **Frame Drop Handling**: ✅ **Detect and report frame drops, provide manual mode alternative**
   - MediaRecorder operates in real-time and WILL drop frames if encoding can't keep up
   - Detect and report dropped frames via events and result metadata
   - Provide pre-flight estimation to warn users
   - Offer manual capture mode for guaranteed quality (slower but no drops)
   - Recommend conservative limits (1920×1080 @ 30fps)

4. **Maximum Limits**: ✅ **Sanity checks with clear errors**
   - Validate against browser canvas limits (16384px)
   - Warn for large resolutions (> 4K)
   - Error for excessive resolutions (> 8K)
   - Provide clear error codes and recovery guidance

5. **Metadata Standard**: ✅ **Deferred to Phase 3**
   - PNG metadata embedding requires external libraries
   - Adds complexity and dependencies
   - Move to future considerations
   - Application layer can handle metadata via filename conventions or sidecar files

6. **Operation Priorities**: ✅ **Not needed**
   - Simple FIFO queue is sufficient
   - Timing controls (waitForSettle, waitForOperations) provide needed flexibility
   - Simpler API, easier to reason about

7. **Layout Settle Detection**: ✅ **Use layout settled event with timeout**
   - Primary: Listen for layout engine's settled state
   - Fallback: 30-second timeout to prevent infinite waits
   - Timeout value is internal implementation detail (not configurable)

8. **Built-in Preset Timing**: ✅ **Calculate after settling**
   - Built-in presets (fitToGraph, etc.) are resolved AFTER waitForSettle
   - Ensures presets calculate based on final settled positions, not intermediate states
   - Implemented in screenshot operation queueing logic

9. **Return Type**: ✅ **Consistent ScreenshotResult object**
   - Always return structured result object
   - Blob always present
   - Status information for all operations
   - Partial failure handling (e.g., clipboard errors don't fail entire operation)
   - Better TypeScript experience

10. **2D vs 3D Camera Support**: ✅ **Unified API with auto-adaptation**
   - Single CameraState interface supports both 2D and 3D
   - Built-in presets automatically adapt to current camera mode
   - 3D-only presets (sideView, frontView, isometric) error gracefully on 2D cameras
   - Separate convenience methods for 2D (setCameraZoom, setCameraPan) and 3D (setCameraPosition, setCameraTarget)
   - getCameraState() returns only relevant properties for current mode
   - User-defined presets preserve camera type

---

## Success Metrics

### Phase 1
- [ ] Can capture PNG/JPEG/WebP screenshots
- [ ] **Returns consistent ScreenshotResult object**
- [ ] **Engine configuration check works (preserveDrawingBuffer)**
- [ ] **Dimension validation prevents exceeding browser limits**
- [ ] Transparent background works correctly (ALL layers disabled)
- [ ] **Format validation prevents invalid combinations (JPEG + transparent)**
- [ ] Resolution multiplier produces higher quality images
- [ ] **Resolution precedence rules work correctly (explicit dims override multiplier)**
- [ ] **Screenshot presets work (print, web-share, thumbnail, documentation)**
- [ ] Unified destination API supports blob/download/clipboard simultaneously
- [ ] **Comprehensive clipboard error handling works**
- [ ] **Clipboard events fire for all status types**
- [ ] Built-in camera presets work (fitToGraph, topView, sideView, frontView, isometric)
- [ ] **Built-in presets auto-adapt to 2D vs 3D camera modes**
- [ ] **2D camera positioning works (zoom, pan)**
- [ ] **3D camera positioning works (position, target, alpha, beta, radius)**
- [ ] **Built-in presets calculate AFTER settling, not before**
- [ ] **3D-only presets error appropriately when used with 2D cameras**
- [ ] Camera state can be saved and restored (user-defined presets)
- [ ] Camera animation is smooth and queued via OperationQueueManager (both 2D and 3D)
- [ ] Screenshot operations integrate with OperationQueueManager
- [ ] Timing controls work (waitForSettle, waitForOperations)
- [ ] Layout settling detection works with timeout fallback
- [ ] **Error handling with comprehensive error codes**
- [ ] All events fire correctly
- [ ] Public API exposed on `<graphty-element>`
- [ ] Unit tests achieve >90% coverage
- [ ] Integration tests pass in CI

### Phase 2
- [ ] Can capture WebM video with stationary camera
- [ ] Can capture WebM video with animated camera
- [ ] Auto-detection of VP9/VP8 codec works correctly
- [ ] **Frame drop detection works and reports accurately**
- [ ] **Pre-flight estimation warns about likely frame drops**
- [ ] **Both realtime and manual capture modes work**
- [ ] **Clear warnings when requested resolution may drop frames**
- [ ] Video playback works in all supported browsers
- [ ] Progress events fire correctly
- [ ] Cancellation works
- [ ] No memory leaks during long captures
- [ ] Integration tests verify video integrity

---

## Documentation Requirements

1. **API Reference**: Complete TypeScript docs for all methods/options/error codes
2. **User Guide**: Step-by-step tutorials for common use cases
3. **Examples**: Storybook stories demonstrating each feature
4. **Migration Guide**: If any breaking changes
5. **Browser Compatibility Matrix**: Supported features by browser
6. **Troubleshooting**: Common issues and solutions (with error codes)
7. **Prerequisites**: Engine configuration requirements (preserveDrawingBuffer)
