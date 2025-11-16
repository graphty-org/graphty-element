# Screen Capture Design

## Overview

This document outlines the design for screenshot and video capture capabilities in graphty-element. The feature enables users to export visualizations as images (PNG/JPEG/WebP) and videos (WebM) with full control over quality, resolution, camera positioning, and animation.

## Goals

1. Enable high-quality screenshot capture from the WebGL/WebGPU rendered canvas
2. Provide flexible camera positioning API for consistent viewpoints
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

### 1. Unified Screenshot API
Instead of separate `captureScreenshot()` and `copyScreenshotToClipboard()` methods, we use a single API with a `destination` option that supports multiple outputs (blob, download, clipboard) simultaneously.

**Benefits:**
- Simpler API surface (one method vs two)
- Eliminates parameter duplication
- Enables multi-destination capture (e.g., download AND clipboard)

### 2. OperationQueueManager Integration
All screenshot and animated camera operations integrate with the OperationQueueManager to prevent race conditions and ensure consistent state.

**Benefits:**
- Prevents concurrent operations from interfering
- Screenshots always capture complete/settled state
- Predictable operation sequencing
- Configurable timing behavior (wait for settle, wait for operations)

### 3. Built-in Camera Presets
Common camera positions (fitToGraph, topView, etc.) are built-in presets that auto-calculate based on current graph state, rather than requiring manual implementation.

**Benefits:**
- Makes common use cases trivial (e.g., "fit entire graph in view")
- Eliminates duplicate "zoom to fit" features
- Works consistently across screenshots, camera API, and videos
- User-defined presets remain supported for custom views

### 4. Flexible Timing Control
Screenshot operations provide explicit control over timing behavior through `timing` options (waitForSettle, waitForOperations).

**Benefits:**
- Default behavior is safe (waits for everything)
- Power users can optimize for speed when immediate capture is needed
- Clear semantics for different use cases

---

## Phase 1: Core Screenshot API

### Features

#### 1. Screenshot Capture

**Basic Usage:**
```typescript
// Simple capture
const blob = await graph.captureScreenshot();

// With options
const blob = await graph.captureScreenshot({
  // Format & Quality
  format: 'png',              // 'png' | 'jpeg' | 'webp'
  quality: 0.95,              // 0-1, for jpeg/webp

  // Resolution
  multiplier: 2,              // Resolution multiplier (1x, 2x, 4x, etc.)
  width: 1920,                // Optional: explicit width (overrides multiplier)
  height: 1080,               // Optional: explicit height (overrides multiplier)

  // Visual Options
  transparentBackground: true, // Replace background with transparency
  enhanceQuality: true,       // Temporarily boost anti-aliasing

  // Destination (can specify multiple)
  destination: {
    blob: true,               // Return blob (default: true)
    download: true,           // Auto-trigger download
    clipboard: true,          // Copy to clipboard
  },
  downloadFilename: 'graph.png', // Filename for download (if download: true)

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
- Returns `Promise<Blob | void>`
  - Returns Blob if `destination.blob` is true (default)
  - Returns void if only copying to clipboard or downloading
- Triggers browser download if `destination.download` is true
- Copies to clipboard if `destination.clipboard` is true
- Fires `screenshot-captured` event with blob data
- Fires `screenshot-copied` event if copied to clipboard

**Implementation Details:**
- Use Babylon.js `CreateScreenshotAsync` or `ScreenshotTools`
- For transparent background, temporarily swap scene background
- For multiplier, render to larger canvas then capture
- For enhanced quality, temporarily increase anti-aliasing samples
- For clipboard destination, use `navigator.clipboard.write()` with ClipboardItem
- **Queue screenshot operation via OperationQueueManager** (see integration section below)
- If `timing.waitForSettle` is true, wait for layout to report settled state
- If `timing.waitForOperations` is true, wait for queue to be empty before capturing
- If camera override is specified, temporarily apply camera state, capture, then restore
- Restore original scene/camera state after capture

#### 2. Transparent Background

When `transparentBackground: true`:
- Temporarily set scene background to transparent
- Ensure alpha channel is preserved in output
- Works with PNG and WebP (JPEG doesn't support transparency)

#### 3. Resolution Multiplier

`multiplier` option provides high-DPI/print quality:
- `1x`: Current canvas size (default)
- `2x`: Double resolution (Retina displays)
- `4x`: 4x resolution (high-quality prints)
- Higher values possible but may hit memory limits

Implementation approach:
- Create temporary larger canvas
- Render scene at higher resolution
- Capture and downscale if needed
- More reliable than `width/height` for maintaining aspect ratio

#### 4. Anti-aliasing Enhancement

When `enhanceQuality: true`:
- Temporarily increase MSAA samples (e.g., from 4 to 16)
- Capture screenshot with enhanced quality
- Restore original settings
- Results in smoother edges and better visual quality

#### 5. Metadata Embedding

Embed graph information in PNG metadata (tEXt chunks):
```typescript
{
  embedMetadata: true,  // Default: false
  metadata: {
    'graphty:version': '1.0.0',
    'graphty:nodeCount': '150',
    'graphty:edgeCount': '200',
    'graphty:layout': 'force-directed',
    // ... custom metadata
  }
}
```

**Implementation:**
- Use PNG tEXt chunk specification
- Only works with PNG format
- Metadata readable by standard tools (exiftool, etc.)

---

## Phase 1: Camera Positioning API

### Overview

Provides programmatic control over camera position, target, and orientation. Essential for:
- Taking screenshots from consistent viewpoints
- Creating camera presets
- Animating camera movement
- Building navigation systems

### API Design

#### Get Camera State

```typescript
interface CameraState {
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  alpha?: number;  // ArcRotateCamera: horizontal rotation
  beta?: number;   // ArcRotateCamera: vertical rotation
  radius?: number; // ArcRotateCamera: distance from target
  fov?: number;    // Field of view
  type: 'arcRotate' | 'free' | 'universal';
}

const state = graph.getCameraState();
```

Returns current camera state as serializable JSON object.

#### Set Camera State

```typescript
graph.setCameraState(state: Partial<CameraState> | { preset: string }, options?: {
  animate?: boolean;      // Smoothly transition (default: false)
  duration?: number;      // Animation duration in ms (default: 1000)
  easing?: 'linear' | 'easeInOut' | 'easeIn' | 'easeOut';
});

// Examples:

// Explicit position
graph.setCameraState({
  position: { x: 10, y: 10, z: 10 },
  target: { x: 0, y: 0, z: 0 }
}, { animate: true, duration: 500 });

// Built-in preset
graph.setCameraState({
  preset: 'fitToGraph'  // Auto-calculates optimal view
}, { animate: true });

// User-defined preset
graph.setCameraState({
  preset: 'myCustomView'
}, { animate: true });
```

**Behavior:**
- Partial updates allowed (e.g., only change position)
- If `animate: true`, smoothly transition to new state using OperationQueueManager
- Fires `camera-state-changed` event when complete
- Compatible with different camera types (ArcRotate, Free, etc.)
- **Camera animations are queued via OperationQueueManager** (see integration section below)

#### Convenience Methods

```typescript
// Set just position
graph.setCameraPosition(
  { x: 10, y: 10, z: 10 },
  { animate: true }
);

// Set just target
graph.setCameraTarget(
  { x: 0, y: 0, z: 0 },
  { animate: true }
);

// Reset to default view
graph.resetCamera({ animate: true });
```

#### Camera Presets

**Built-in Presets:**

The following presets are available by default and auto-calculate based on current graph state:

```typescript
// Fit entire graph in view with padding
graph.setCameraState({ preset: 'fitToGraph' }, { animate: true });

// Standard orthogonal views
graph.setCameraState({ preset: 'topView' }, { animate: true });
graph.setCameraState({ preset: 'sideView' }, { animate: true });
graph.setCameraState({ preset: 'frontView' }, { animate: true });

// Isometric view
graph.setCameraState({ preset: 'isometric' }, { animate: true });
```

**Built-in Preset Implementations:**

```typescript
// 'fitToGraph' - Calculates optimal camera to fit all nodes
function calculateFitToGraph(graph: Graph): CameraState {
  const bounds = graph.getNodeBoundingBox();
  const center = bounds.getCenter();
  const size = bounds.getSize();
  const maxDim = Math.max(size.x, size.y, size.z);
  const distance = maxDim / Math.tan(camera.fov / 2) * 1.2; // 20% padding

  return {
    position: { x: center.x + distance, y: center.y + distance, z: center.z + distance },
    target: center,
    type: 'arcRotate'
  };
}

// 'topView' - Look down from above
// 'sideView' - Look from the side
// 'frontView' - Look from the front
// 'isometric' - Classic 3D isometric angle
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

### Screenshot Operation Queueing

```typescript
class Graph {
  async captureScreenshot(options: ScreenshotOptions): Promise<Blob | void> {
    const timing = {
      waitForSettle: true,
      waitForOperations: true,
      ...options.timing
    };

    return this.operationQueue.enqueue(async () => {
      // Wait for layout to settle if requested
      if (timing.waitForSettle) {
        await this.waitForLayoutSettle();
      }

      // Apply camera override temporarily if specified
      let originalCameraState: CameraState | undefined;
      if (options.camera) {
        originalCameraState = this.getCameraState();

        // Resolve preset to actual camera state
        const cameraState = options.camera.preset
          ? this.resolveCameraPreset(options.camera.preset)
          : options.camera;

        this.applyCameraStateImmediate(cameraState);
        await this.waitForRender(); // Wait for one frame
      }

      try {
        // Perform the actual capture
        const blob = await this.doScreenshotCapture(options);

        // Handle destinations
        if (options.destination?.download) {
          this.downloadBlob(blob, options.downloadFilename);
        }
        if (options.destination?.clipboard) {
          await this.copyBlobToClipboard(blob);
          this.dispatchEvent('screenshot-copied', { blob });
        }

        this.dispatchEvent('screenshot-captured', { blob });

        return options.destination?.blob !== false ? blob : undefined;
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
    // Check built-in presets first
    switch (preset) {
      case 'fitToGraph':
        return this.calculateFitToGraph();
      case 'topView':
        return this.calculateTopView();
      case 'sideView':
        return this.calculateSideView();
      case 'frontView':
        return this.calculateFrontView();
      case 'isometric':
        return this.calculateIsometric();
      default:
        // Check user-defined presets
        const userPreset = this.cameraPresets.get(preset);
        if (!userPreset) {
          throw new Error(`Unknown camera preset: ${preset}`);
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
        reject(new Error('Layout did not settle within timeout'));
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

---

## Phase 2: Video/Animation Capture

### Overview

Capture animated sequences as WebM video. Two primary modes:
1. **Stationary Camera**: Watch layout/simulation unfold
2. **Animated Camera**: Move camera through waypoints

### API Design

#### Basic Video Capture

```typescript
const blob = await graph.captureAnimation({
  // Duration & Quality
  duration: 5000,              // Total duration in ms
  fps: 30,                     // Frames per second
  format: 'webm',              // 'webm' only (Phase 2)
  videoBitrate: 2500000,       // Bits per second (optional)

  // Canvas Settings
  width: 1920,                 // Video resolution
  height: 1080,
  transparentBackground: false, // WebM supports alpha

  // Camera Mode (choose one)
  cameraMode: 'stationary',    // 'stationary' | 'animated'

  // Download
  download: true,
  downloadFilename: 'graph-animation.webm'
});
```

**Return Value:**
- Returns `Promise<Blob>` containing video data
- Fires progress events during capture
- Fires `animation-captured` event when complete

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
- Use MediaRecorder API for WebM encoding
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
- Linear interpolation between waypoints by default
- `easing` option applies to all segments
- Timestamps define when camera reaches each waypoint
- Position and target interpolated independently

**Use Cases:**
- Cinematic graph tours
- Multi-angle presentations
- Marketing materials
- Interactive graph exploration recordings

**Implementation:**
- Calculate camera position for each frame based on timestamps
- Use Babylon.js Animation system or manual interpolation
- Capture frame after camera update
- Graph can be static or animating during camera movement

#### Progress Tracking

```typescript
graph.addEventListener('animation-progress', (event) => {
  console.log(`${event.detail.progress}% complete`);
  console.log(`Frame ${event.detail.frame} of ${event.detail.totalFrames}`);
});

graph.addEventListener('animation-captured', (event) => {
  console.log('Video ready:', event.detail.blob);
});
```

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

#### MediaRecorder API (WebM)

```typescript
const stream = canvas.captureStream(fps);
const recorder = new MediaRecorder(stream, {
  mimeType: 'video/webm;codecs=vp9',
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

**Advantages:**
- Native browser API, no dependencies
- Hardware acceleration available
- Good compression (VP9 codec)
- Supports transparency (alpha channel)

**Limitations:**
- WebM only (MP4 requires polyfill/library)
- Browser support varies (good in Chrome/Firefox, limited Safari)
- Real-time encoding (can't capture faster than playback)

---

## Future Considerations

### Phase 3 Features

1. **GIF Export**
   - Requires library (gif.js, gifshot)
   - Larger file sizes than WebM
   - Universal compatibility
   - No audio support

2. **Bezier Camera Paths**
   - Smooth curved camera movement
   - Control points for path shape
   - More cinematic results

3. **Advanced Animation Curves**
   - Custom easing functions
   - Per-waypoint easing control
   - Babylon.js animation curves integration

4. **MP4 Export**
   - Requires transcoding (ffmpeg.wasm)
   - Better compatibility than WebM
   - Larger dependencies

5. **Audio Track Support**
   - Background music for videos
   - Voiceover narration
   - MediaRecorder supports audio streams

---

## Public API Surface

### On `<graphty-element>` Component

```typescript
// Screenshot (unified API with destination options)
await element.captureScreenshot(options);
// No separate copyScreenshotToClipboard - use destination.clipboard instead

// Camera
const state = element.getCameraState();
element.setCameraState(state, options);  // Supports both presets and explicit state
element.setCameraPosition(position, options);
element.setCameraTarget(target, options);
element.resetCamera(options);

// Camera Presets
// Built-in: 'fitToGraph', 'topView', 'sideView', 'frontView', 'isometric'
element.saveCameraPreset(name);         // Save user-defined presets
element.loadCameraPreset(name, options); // Load user-defined or built-in presets
element.getCameraPresets();              // Get all presets

// Video (Phase 2)
await element.captureAnimation(options);
element.cancelAnimationCapture();
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
element.addEventListener('screenshot-copied', handler);    // Fires if destination.clipboard is true

// Camera events
element.addEventListener('camera-state-changed', handler);
element.addEventListener('camera-animating', handler);

// Video events
element.addEventListener('animation-progress', handler);
element.addEventListener('animation-captured', handler);
element.addEventListener('animation-cancelled', handler);
```

---

## Implementation Strategy

### Phase 1A: Screenshot Core (Week 1)

1. Implement basic screenshot capture on Graph class
   - Format selection (PNG/JPEG/WebP)
   - Quality control
   - Resolution multiplier
   - Return blob
   - **Integrate with OperationQueueManager**

2. Add destination options
   - Unified API with blob/download/clipboard destinations
   - Trigger browser download with filename parameter
   - Copy to clipboard using Clipboard API with permissions handling

3. Add transparent background support
   - Temporarily swap scene background
   - Preserve alpha channel

4. Expose on `<graphty-element>` public API

5. Add events (screenshot-captured, screenshot-copied)

6. Write unit tests

### Phase 1B: Advanced Screenshot & Timing (Week 2)

1. Add timing control options
   - waitForSettle integration with layout engines
   - waitForOperations integration with queue

2. Add camera position override
   - Temporarily set camera for screenshot
   - Support both explicit position and presets
   - Restore after capture

3. Add anti-aliasing enhancement
   - Boost MSAA samples during capture

4. Add metadata embedding
   - PNG tEXt chunks
   - Graph statistics

5. Write integration tests

### Phase 1C: Camera API (Week 2-3)

1. Implement getCameraState()
   - Support ArcRotateCamera primarily
   - Serialize to JSON

2. Implement setCameraState()
   - Partial updates
   - Animation support using Babylon.js animations
   - **Integrate animated transitions with OperationQueueManager**
   - Support both explicit state and preset names

3. Implement built-in camera presets
   - fitToGraph (auto-calculate from bounding box)
   - topView, sideView, frontView
   - isometric
   - Preset resolution logic

4. Implement user-defined camera presets
   - Save/load named presets
   - Export/import as JSON
   - Don't overwrite built-in presets

5. Add convenience methods
   - setCameraPosition, setCameraTarget, resetCamera

6. Add camera events

7. Write tests

### Phase 2: Video Capture (Week 4-5)

1. Implement stationary camera video capture
   - MediaRecorder API setup
   - Frame capture timing
   - Progress events

2. Implement animated camera path
   - Waypoint interpolation
   - Easing functions
   - Camera animation

3. Add cancellation support

4. Write integration tests with actual video playback

5. Performance testing and optimization

---

## Testing Strategy

### Unit Tests

- Screenshot options validation
- Camera state serialization/deserialization
- Waypoint interpolation calculations
- Easing function correctness

### Integration Tests

- Capture screenshot and verify blob type/size
- Transparent background actually transparent
- Camera state get/set round-trip
- Video capture produces valid WebM

### Visual Tests (Playwright)

- Compare screenshots pixel-by-pixel
- Verify multiplier increases resolution
- Verify transparent background (alpha channel)
- Verify camera position override works
- Verify video playback (basic sanity)

### Manual Testing

- Download functionality works
- Clipboard copy works
- Camera animation smooth
- Video quality acceptable
- Multiple formats produce valid files

---

## Browser Compatibility

### Screenshot Features
- **PNG/JPEG/WebP**: All modern browsers
- **Clipboard API**: Chrome 76+, Firefox 87+, Safari 13.1+
- **Transparent background**: All (PNG/WebP support)

### Video Features
- **MediaRecorder (WebM)**: Chrome 47+, Firefox 25+, Safari 14.1+
- **VP9 codec**: Chrome 48+, Firefox 28+, Safari 14.1+ (limited)
- **Alpha channel**: Chrome 96+, Firefox limited

### Fallbacks
- Provide polyfill detection
- Graceful degradation for unsupported features
- Clear error messages

---

## Performance Considerations

### Screenshot
- High multipliers (4x+) may cause memory issues
- Limit maximum resolution based on device capabilities
- Consider async/worker for metadata embedding

### Video Capture
- Real-time encoding limited by browser performance
- Large resolutions may drop frames
- Provide frame drop detection/warning
- Consider limiting max resolution (1920x1080 default)

### Memory Management
- Clean up temporary canvases immediately
- Revoke blob URLs after use
- Release MediaRecorder resources

---

## Security Considerations

### Screenshot
- Respect CORS for textures/images
- User gesture may be required for clipboard API
- Downloaded files are user-initiated

### Video
- MediaRecorder requires user gesture in some browsers
- Large video files may exceed memory limits
- Rate limiting for abuse prevention

---

## Examples

### Example 1: High-Quality Screenshot for Print

```typescript
// Capture 4K screenshot with enhanced quality
const blob = await graph.captureScreenshot({
  width: 3840,
  height: 2160,
  format: 'png',
  enhanceQuality: true,
  transparentBackground: true,
  embedMetadata: true,
  metadata: {
    'graphty:title': 'Social Network Analysis',
    'graphty:nodeCount': graph.getNodeCount().toString(),
  },
  download: true,
  downloadFilename: 'social-network-4k.png'
});
```

### Example 2: Consistent Documentation Screenshots

```typescript
// Use built-in preset for consistent overview
await graph.captureScreenshot({
  camera: { preset: 'fitToGraph' },
  destination: { download: true },
  downloadFilename: 'doc-overview.png'
});

// Save custom camera positions as presets
graph.saveCameraPreset('detail-view');

// Later: capture with user-defined preset
await graph.captureScreenshot({
  camera: { preset: 'detail-view' },
  destination: { download: true },
  downloadFilename: 'doc-detail.png'
});

// No need to wait for animation - screenshot operation handles it
```

### Example 3: Quick Share to Clipboard

```typescript
// Copy screenshot to clipboard for pasting in Slack/email
await graph.captureScreenshot({
  multiplier: 2,  // Retina quality
  transparentBackground: true,
  destination: {
    clipboard: true,
    blob: false  // Don't need to return blob
  }
});
// User can now paste into any application

// Or both download AND copy to clipboard
await graph.captureScreenshot({
  multiplier: 2,
  destination: {
    download: true,
    clipboard: true
  },
  downloadFilename: 'my-graph.png'
});
```

### Example 4: Layout Animation Video

```typescript
// Record force-directed layout settling with optimal camera position
await graph.captureAnimation({
  duration: 10000,  // 10 seconds
  fps: 30,
  format: 'webm',
  cameraMode: 'stationary',
  camera: {
    preset: 'fitToGraph'  // Auto-positions camera to fit entire graph
  },
  download: true,
  downloadFilename: 'force-layout-settling.webm'
});

// Or with explicit position
await graph.captureAnimation({
  duration: 10000,
  fps: 30,
  format: 'webm',
  cameraMode: 'stationary',
  camera: {
    position: { x: 15, y: 15, z: 15 },
    target: { x: 0, y: 0, z: 0 }
  },
  download: true,
  downloadFilename: 'force-layout-settling.webm'
});
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
  fps: 60,
  format: 'webm',
  cameraMode: 'animated',
  cameraPath: waypoints,
  easing: 'linear',  // Constant rotation speed
  width: 1920,
  height: 1080,
  download: true,
  downloadFilename: 'graph-tour-360.webm'
});
```

### Example 6: Timing Control for Different Use Cases

```typescript
// Default: Wait for everything (safest, best quality)
await graph.captureScreenshot({
  destination: { download: true },
  downloadFilename: 'settled-graph.png'
  // timing.waitForSettle defaults to true
  // timing.waitForOperations defaults to true
});

// Fast capture: Don't wait (useful for rapid screenshots)
await graph.captureScreenshot({
  destination: { download: true },
  downloadFilename: 'quick-capture.png',
  timing: {
    waitForSettle: false,
    waitForOperations: false
  }
});

// Wait for layout but not other operations
await graph.captureScreenshot({
  destination: { download: true },
  downloadFilename: 'settled-layout.png',
  timing: {
    waitForSettle: true,
    waitForOperations: false
  }
});
```

### Example 7: Progress Tracking

```typescript
// Show progress UI during capture
const progressEl = document.querySelector('#progress');

graph.addEventListener('animation-progress', (e) => {
  progressEl.textContent = `Capturing: ${e.detail.progress}%`;
  progressEl.style.width = `${e.detail.progress}%`;
});

graph.addEventListener('animation-captured', (e) => {
  progressEl.textContent = 'Complete!';
  console.log('Video blob:', e.detail.blob);
});

await graph.captureAnimation({ duration: 5000, fps: 30 });
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

3. **Frame Drop Handling**: ✅ **Slow down capture to maintain quality**
   - If browser can't encode fast enough, extend total capture time
   - Maintains consistent FPS in output video
   - Better than dropping frames or aborting

4. **Maximum Limits**: ✅ **No hard limits imposed**
   - Let browser/system constraints naturally limit (canvas size, memory)
   - Application layer can impose limits if needed
   - Provide clear errors when limits hit

5. **Metadata Standard**: ✅ **No standard schema enforced**
   - Provide flexible key-value metadata option
   - Application layer decides what to include
   - Document common keys as suggestions (nodeCount, edgeCount, layout, etc.)

6. **Operation Priorities**: ✅ **Not needed**
   - Simple FIFO queue is sufficient
   - Timing controls (waitForSettle, waitForOperations) provide needed flexibility
   - Simpler API, easier to reason about

7. **Layout Settle Detection**: ✅ **Use layout settled event with timeout**
   - Primary: Listen for layout engine's settled state
   - Fallback: 30-second timeout to prevent infinite waits
   - Timeout value is internal implementation detail (not configurable)

---

## Success Metrics

### Phase 1
- [ ] Can capture PNG/JPEG/WebP screenshots
- [ ] Transparent background works correctly
- [ ] Resolution multiplier produces higher quality images
- [ ] Unified destination API supports blob/download/clipboard simultaneously
- [ ] Built-in camera presets work (fitToGraph, topView, sideView, frontView, isometric)
- [ ] Camera state can be saved and restored (user-defined presets)
- [ ] Camera animation is smooth and queued via OperationQueueManager
- [ ] Screenshot operations integrate with OperationQueueManager
- [ ] Timing controls work (waitForSettle, waitForOperations)
- [ ] Layout settling detection works with timeout fallback
- [ ] All events fire correctly (screenshot-captured, screenshot-copied, camera-state-changed)
- [ ] Public API exposed on `<graphty-element>`
- [ ] Unit tests achieve >90% coverage
- [ ] Integration tests pass in CI

### Phase 2
- [ ] Can capture WebM video with stationary camera
- [ ] Can capture WebM video with animated camera
- [ ] Auto-detection of VP9/VP8 codec works correctly
- [ ] Frame drop handling slows down capture to maintain quality
- [ ] Video playback works in all supported browsers
- [ ] Progress events fire correctly
- [ ] Cancellation works
- [ ] No memory leaks during long captures
- [ ] Integration tests verify video integrity

---

## Documentation Requirements

1. **API Reference**: Complete TypeScript docs for all methods/options
2. **User Guide**: Step-by-step tutorials for common use cases
3. **Examples**: Storybook stories demonstrating each feature
4. **Migration Guide**: If any breaking changes
5. **Browser Compatibility Matrix**: Supported features by browser
6. **Performance Guide**: Best practices for high-quality captures
7. **Troubleshooting**: Common issues and solutions
