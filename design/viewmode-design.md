# View Mode Design

## Overview

This document describes the design for a unified `viewMode` API that controls how the graph is rendered and viewed. This replaces the existing `layout2d` / `graph.twoD` properties with a more flexible system that supports 2D, 3D, AR, and VR viewing modes.

## Key Insight: Separation of Concerns

There are two independent concepts:

1. **Layout Dimension** - The number of dimensions used for node position calculation (2D or 3D). This is controlled by layout algorithm parameters (e.g., `ndim: 2` or `ndim: 3`).

2. **View Mode** - How the graph is rendered and displayed to the user. This controls the camera type, input handling, and rendering approach.

These should be independently configurable because:
- A 2D layout can be viewed in 3D space (flat plane in 3D)
- A 3D layout can be viewed in AR/VR
- Layout dimension is a property of the data/algorithm
- View mode is a property of the presentation/UI

## Proposed API

### View Mode Property

```typescript
type ViewMode = "2d" | "3d" | "ar" | "vr";

// Property API
element.viewMode = "2d";
element.viewMode = "3d";
element.viewMode = "ar";
element.viewMode = "vr";

// Read current mode
const mode: ViewMode = element.viewMode;

// Attribute API
<graphty-element view-mode="2d"></graphty-element>
<graphty-element view-mode="3d"></graphty-element>
```

### Layout Dimension (Separate Concern)

Layout dimension is controlled through layout configuration, not view mode:

```typescript
// Via layout options
element.layout = "d3";
element.layoutConfig = { ndim: 2 };  // 2D layout
element.layoutConfig = { ndim: 3 };  // 3D layout

// Via style template
{
  graph: {
    layout: "d3",
    layoutOptions: {
      ndim: 2
    }
  }
}
```

## View Mode Specifications

### 2D Mode (`viewMode: "2d"`)

| Aspect | Behavior |
|--------|----------|
| Camera | Orthographic, fixed top-down or front view |
| Input | Pan (drag), Zoom (scroll/pinch) |
| Z-Coordinates | Flattened to 0 for rendering |
| Node Rendering | Circles/sprites facing camera |
| Edge Rendering | 2D lines/curves |
| Use Case | Traditional graph visualization, diagrams |

### 3D Mode (`viewMode: "3d"`)

| Aspect | Behavior |
|--------|----------|
| Camera | Perspective, orbit controls |
| Input | Orbit (drag), Pan (shift+drag), Zoom (scroll/pinch) |
| Z-Coordinates | Full 3D positioning |
| Node Rendering | 3D spheres/meshes |
| Edge Rendering | 3D tubes/lines |
| Use Case | Exploring complex 3D graph structures |

### AR Mode (`viewMode: "ar"`)

| Aspect | Behavior |
|--------|----------|
| Camera | Device AR camera with WebXR tracking |
| Input | Controller triggers, thumbstick navigation, tap to select |
| Z-Coordinates | Full 3D in world space |
| Node Rendering | 3D meshes anchored in real world |
| Edge Rendering | 3D tubes/lines |
| Reference Space | `local-floor` (default) |
| Hand Tracking | Disabled (controller gestures only to avoid visual artifacts) |
| Use Case | Overlaying graphs on real-world environments |

### VR Mode (`viewMode: "vr"`)

| Aspect | Behavior |
|--------|----------|
| Camera | VR headset with WebXR head tracking |
| Input | VR controllers, hand tracking, thumbstick navigation |
| Z-Coordinates | Full 3D in VR space |
| Node Rendering | 3D meshes at human scale |
| Edge Rendering | 3D tubes/lines |
| Reference Space | `local-floor` (default) |
| Hand Tracking | Enabled with rigged hand meshes (purple hands) |
| Use Case | Immersive graph exploration |

## WebXR Integration

The VR and AR modes leverage the existing WebXR implementation built on Babylon.js's WebXR Default Experience.

### Architecture Overview

The WebXR system consists of four main layers:

1. **XRSessionManager** - Handles WebXR session lifecycle (enter/exit VR/AR)
2. **XRPivotCameraController** - Manages camera transformation via pivot
3. **XRInputHandler** - Processes controllers, hand tracking, and gestures
4. **XRUIManager** - Renders VR/AR entry buttons

### XR Configuration

WebXR behavior is configured via the `xr` property in the style template:

```typescript
{
  graph: {
    viewMode: "3d",  // Initial mode (VR/AR entered via UI or API)
  },
  xr: {
    enabled: true,
    ui: {
      enabled: true,
      position: "bottom-right",        // Button placement
      showAvailabilityWarning: false,  // Show "NOT AVAILABLE" message
      unavailableMessageDuration: 5000 // Duration in ms (0 = permanent)
    },
    vr: {
      enabled: true,
      referenceSpaceType: "local-floor",
      optionalFeatures: []
    },
    ar: {
      enabled: true,
      referenceSpaceType: "local-floor",
      optionalFeatures: ["hit-test"]
    },
    input: {
      handTracking: true,      // Enable hand tracking in VR
      controllers: true,       // Enable controller input
      nearInteraction: true,   // Enable near interaction
      physics: false,          // Physics for hand joints
      zAxisAmplification: 10.0 // Movement amplification for dragging
    },
    teleportation: {
      enabled: false,
      easeTime: 200
    }
  }
}
```

### XR Input System

#### Thumbstick Controls
| Stick | Axis | Action |
|-------|------|--------|
| Left | X | Yaw rotation |
| Left | Y | Pitch rotation |
| Right | X | Pan left/right |
| Right | Y | Zoom in/out |

- Deadzone: 0.15 with quadratic acceleration curve
- Sensitivity constants: YAW_SPEED=0.04, PITCH_SPEED=0.03, PAN_SPEED=0.08, ZOOM_SPEED=0.02

#### Hand Tracking (VR only)
- **Pinch Detection**: Thumb + index finger distance < 4cm (start), > 6cm (release)
- **Controller Triggers**: Alternative to hand tracking pinch
- **Priority**: Controller trigger > Hand tracking

#### Two-Hand Gestures
- **Pinch Zoom**: Distance between pinch points controls zoom
- **Twist Rotation**: Relative rotation between hands controls scene rotation
- Both hands must be pinching to enable gestures
- Gestures automatically disabled during single-hand node dragging

#### Node Interaction in XR
- Ray-casting from controller/hand position
- Single-hand pinch: Start/update/end node drag
- 10x movement amplification by default for practical depth manipulation
- Movement delta transformed to scene space (relative to user's view)

### Pivot-Based Camera System

Both OrbitCamera (3D mode) and XRPivotCameraController use a shared `PivotController`:

```typescript
// PivotController operations
pivot.rotate(yawDelta, pitchDelta)     // Local X/Y rotation
pivot.rotateAroundAxis(axis, angle)    // Arbitrary axis (two-hand gestures)
pivot.spin(delta)                      // Z-axis roll
pivot.zoom(factor)                     // Uniform scaling (0.95-1.05 clamped)
pivot.pan(delta)                       // Direct translation
pivot.panViewRelative(right, forward)  // View-relative translation
pivot.reset()                          // Reset to initial state
```

In XR mode:
- XR camera is automatically parented to pivot
- Hand meshes also parented to pivot for proper transformation
- Scene objects transform with pivot (rotate, zoom, pan)

### XR UI Buttons

The XRUIManager creates VR/AR entry buttons with:

**CSS Custom Properties for Styling:**
```css
--xr-button-font-family
--xr-button-font-size
--xr-button-color
--xr-button-border-color
--xr-available-bg
--xr-presenting-bg
--xr-overlay-z-index
--xr-overlay-gap
--xr-overlay-offset-vertical
--xr-overlay-offset-horizontal
```

**Part Selectors:**
```css
::part(xr-overlay)
::part(xr-button)
::part(xr-vr-button)
::part(xr-ar-button)
::part(xr-unavailable-message)
```

## Implementation Details

### What Changes When View Mode Changes

When `viewMode` is set, the following should occur:

1. **Camera Activation**
   - Switch to the appropriate camera controller
   - Each mode registers its camera: `"2d"`, `"3d"`, `"ar"`, `"vr"`

2. **Input Controller Activation**
   - Switch to appropriate input handling
   - 2D: Pan/zoom controller
   - 3D: Orbit controller (PivotController)
   - AR: XRInputHandler with controller gestures only
   - VR: XRInputHandler with hand tracking + controller gestures

3. **Scene Metadata Update**
   - Set `scene.metadata.viewMode = mode`
   - Used by renderers to adjust behavior

4. **Z-Coordinate Handling**
   - 2D mode: Save current Z positions, flatten to 0
   - Switching away from 2D: Restore saved Z positions

5. **Mesh Cache Clear**
   - Different modes may render edges/nodes differently
   - Clear cache to force rebuild

6. **Zoom to Fit**
   - Reframe the view for the new camera type

### XR Session Lifecycle

```typescript
// When entering VR/AR mode
element.viewMode = "vr";  // or "ar"
  ├─ Check WebXR availability
  ├─ Save current 3D camera
  ├─ Create XRSessionManager if not exists
  ├─ Call enterVR() or enterAR()
  │   ├─ Create WebXRDefaultExperience
  │   ├─ Enable hand tracking (VR only)
  │   ├─ Enter XR session ("immersive-vr" or "immersive-ar")
  │   └─ Transfer camera position
  ├─ Create XRPivotCameraController
  │   ├─ Create PivotController
  │   ├─ Parent XR camera to pivot
  │   ├─ Parent hand meshes to pivot
  │   └─ Create XRInputHandler
  └─ Register render loop observer

// When exiting XR mode
exitXR()
  ├─ Clean up XRPivotCameraController
  ├─ Remove render loop observer
  ├─ Call XRSessionManager.exitXR()
  │   ├─ Exit XR session
  │   └─ Dispose XR helper
  └─ Restore previous 3D camera
  └─ Set viewMode = "3d"
```

### Scene Metadata for XR

```typescript
scene.metadata.xrHelper              // WebXRDefaultExperience
scene.metadata.xrCameraController    // XRPivotCameraController
scene.metadata.xrUpdateObserver      // Render loop observer

// XR mode detection
isXRMode(): boolean {
  return scene.metadata?.xrHelper?.baseExperience?.state === 2; // WebXRState.IN_XR
}
```

### Camera Registration

```typescript
// During initialization
this.camera.registerCamera("2d", twoDCamera, twoDInput);
this.camera.registerCamera("3d", orbitCamera, orbitInput);
this.camera.registerCamera("ar", arCamera, arInput);
this.camera.registerCamera("vr", vrCamera, vrInput);

// When viewMode changes
this.camera.activateCamera(viewMode);
```

### Style Template Integration

View mode can be specified in style templates:

```typescript
{
  graph: {
    viewMode: "2d",      // Sets initial view mode
    layout: "d3",
    layoutOptions: {
      ndim: 2            // Layout dimension (independent)
    }
  }
}
```

Setting `element.viewMode` directly always works and can override template settings.

## Migration from layout2d / twoD

### Deprecation Strategy

1. **Phase 1: Add viewMode API**
   - Add `viewMode` property with full functionality
   - Keep `layout2d` as deprecated alias:
     - `layout2d = true` → `viewMode = "2d"`
     - `layout2d = false` → `viewMode = "3d"`
   - Keep `graph.twoD` in style templates as deprecated alias

2. **Phase 2: Warn on deprecated usage**
   - Log deprecation warnings when `layout2d` or `graph.twoD` are used
   - Update documentation to use `viewMode`

3. **Phase 3: Remove deprecated properties**
   - Remove `layout2d` property
   - Remove `graph.twoD` from style schema
   - Breaking change in major version

### Code Changes Required

1. **graphty-element.ts**
   - Add `viewMode` property with getter/setter
   - Deprecate `layout2d` property (alias to viewMode)

2. **Graph.ts**
   - Add `setViewMode(mode: ViewMode)` method
   - Move mode-switching logic from `_setStyleTemplateInternal` to `setViewMode`
   - Call `setViewMode` from style template processing when `graph.viewMode` is set
   - Integrate XR session management for "ar"/"vr" modes

3. **GraphStyle.ts (config schema)**
   - Add `viewMode: z.enum(["2d", "3d", "ar", "vr"]).default("3d")`
   - Deprecate `twoD` field

4. **RenderManager.ts**
   - Ensure all camera types are registered
   - AR/VR cameras registered when WebXR is available

5. **LayoutManager.ts**
   - Remove automatic dimension sync based on `twoD`
   - Layout dimension comes solely from `layoutOptions.ndim`

## Edge Cases and Error Handling

### Unavailable View Modes

AR and VR modes require hardware/browser support. When unavailable:

```typescript
element.viewMode = "vr"; // VR not available

// Option A: Throw error
throw new Error("VR mode not available: WebXR not supported");

// Option B: Fall back with warning
console.warn("VR mode not available, falling back to 3d");
element.viewMode = "3d";

// Option C: Emit event
element.dispatchEvent(new CustomEvent("viewmodeerror", {
  detail: { requested: "vr", reason: "WebXR not supported" }
}));
```

**Recommendation:** Option B (fallback with warning) for best UX, with Option C event for programmatic handling.

### Mode Availability Check

```typescript
// Check if mode is available before switching
if (element.isViewModeAvailable("vr")) {
  element.viewMode = "vr";
} else {
  showVRNotAvailableMessage();
}

// Or get list of available modes
const available: ViewMode[] = element.availableViewModes;
// ["2d", "3d"] - AR/VR not available
// ["2d", "3d", "ar", "vr"] - all available

// Detailed availability (uses existing XRSessionManager methods)
const vrSupported: Promise<boolean> = element.isVRSupported();
const arSupported: Promise<boolean> = element.isARSupported();
```

### XR-Specific Error Handling

```typescript
// Errors during XR session entry
try {
  await element.enterXR("immersive-vr");
} catch (error) {
  // Possible errors:
  // - "WebXR is not supported in this browser"
  // - "An XR session is already active"
  // - "Failed to enter VR mode: <detail>"
}
```

### Graceful Degradation

| Scenario | Behavior |
|----------|----------|
| WebXR not supported | Show "NOT AVAILABLE" message, disable XR buttons |
| VR not available | Show "VR NOT AVAILABLE", AR may still work |
| Hand tracking fails | Fall back to controller trigger gestures |
| Controller not ready | Wait up to 2 seconds with retry (20 attempts × 100ms) |

## Events

```typescript
// Fired when view mode changes
element.addEventListener("viewmodechange", (e: CustomEvent) => {
  console.log(`Changed from ${e.detail.previousMode} to ${e.detail.currentMode}`);
});

// Fired when requested mode is unavailable
element.addEventListener("viewmodeerror", (e: CustomEvent) => {
  console.log(`Could not switch to ${e.detail.requested}: ${e.detail.reason}`);
});

// XR-specific events (from WebXR)
xrHelper.baseExperience.onStateChangedObservable.add((state) => {
  // WebXRState: NOT_IN_XR, ENTERING_XR, IN_XR, EXITING_XR
});
```

## Examples

### Basic Usage

```html
<!-- 2D orthographic view -->
<graphty-element view-mode="2d"></graphty-element>

<!-- 3D perspective view (default) -->
<graphty-element view-mode="3d"></graphty-element>
```

### Programmatic Switching

```typescript
const graph = document.querySelector('graphty-element');

// Toggle between 2D and 3D
toggleButton.addEventListener('click', () => {
  graph.viewMode = graph.viewMode === "2d" ? "3d" : "2d";
});

// Enter VR mode
vrButton.addEventListener('click', async () => {
  if (await graph.isVRSupported()) {
    graph.viewMode = "vr";
  } else {
    alert("VR not available");
  }
});

// Enter AR mode
arButton.addEventListener('click', async () => {
  if (await graph.isARSupported()) {
    graph.viewMode = "ar";
  } else {
    alert("AR not available");
  }
});
```

### 2D Layout in 3D View

```typescript
// Calculate positions in 2D, but view in 3D space
element.viewMode = "3d";
element.layout = "d3";
element.layoutConfig = { ndim: 2 }; // Flat layout, 3D camera
```

### Style Template with View Mode and XR Config

```typescript
element.styleTemplate = {
  graph: {
    viewMode: "3d",
    layout: "ngraph",
    layoutOptions: {
      ndim: 3
    }
  },
  xr: {
    enabled: true,
    ui: {
      enabled: true,
      position: "bottom-right",
      showAvailabilityWarning: true
    },
    vr: {
      enabled: true,
      referenceSpaceType: "local-floor"
    },
    ar: {
      enabled: true,
      referenceSpaceType: "local-floor",
      optionalFeatures: ["hit-test"]
    },
    input: {
      handTracking: true,
      controllers: true,
      nearInteraction: true,
      physics: false,
      zAxisAmplification: 10.0
    }
  },
  layers: [...]
};
```

### Custom XR Button Styling

```css
graphty-element::part(xr-overlay) {
  --xr-button-font-family: 'Roboto', sans-serif;
  --xr-button-color: white;
  --xr-available-bg: rgba(0, 120, 255, 0.8);
  --xr-presenting-bg: rgba(255, 100, 0, 0.9);
}

graphty-element::part(xr-vr-button) {
  border-radius: 50%;
}
```

## Summary

| Property | Controls | Values |
|----------|----------|--------|
| `viewMode` | Camera, input, rendering | `"2d"`, `"3d"`, `"ar"`, `"vr"` |
| `layoutConfig.ndim` | Layout algorithm dimensions | `2`, `3` |

These are independent:
- `viewMode: "3d"` + `ndim: 2` = 2D layout viewed in 3D space
- `viewMode: "2d"` + `ndim: 3` = 3D layout flattened to 2D view
- `viewMode: "vr"` + `ndim: 3` = Full 3D layout in VR
- `viewMode: "ar"` + `ndim: 3` = Full 3D layout overlaid on real world

## Key File References

| File | Purpose |
|------|---------|
| `src/xr/XRSessionManager.ts` | WebXR session initialization and lifecycle |
| `src/cameras/XRPivotCameraController.ts` | XR camera lifecycle and input coordination |
| `src/cameras/XRInputHandler.ts` | Thumbstick, hand tracking, gesture processing |
| `src/cameras/PivotController.ts` | Shared pivot-based transformation system |
| `src/ui/XRUIManager.ts` | VR/AR button creation and styling |
| `src/config/XRConfig.ts` | Configuration schemas and defaults |
| `src/NodeBehavior.ts` | Unified node dragging (desktop and XR) |

## Implementation Task Checklist

### Phase 1: Core Implementation

Core types, properties, methods, camera integration, and layout decoupling. After completing this phase, run `npm run ready:commit` to verify everything works.

#### Types and Schema

- [ ] Add `ViewMode` type definition (`"2d" | "3d" | "ar" | "vr"`) to `src/config/types.ts` or appropriate location
- [ ] Update `GraphStyle.ts` schema:
  - [ ] Add `viewMode: z.enum(["2d", "3d", "ar", "vr"]).default("3d")`
  - [ ] Mark `twoD` field as deprecated (keep for backward compatibility)
- [ ] Update `XRConfig.ts` if needed to align with new schema structure

#### Properties and Methods

- [ ] Add `viewMode` property to `graphty-element.ts`:
  - [ ] Getter that returns current view mode
  - [ ] Setter that calls `Graph.setViewMode()`
  - [ ] Attribute binding (`view-mode` attribute)
- [ ] Add `layout2d` deprecation alias in `graphty-element.ts`:
  - [ ] Getter: return `viewMode === "2d"`
  - [ ] Setter: set `viewMode` to `"2d"` or `"3d"`
  - [ ] Log deprecation warning on use
- [ ] Add `setViewMode(mode: ViewMode)` method to `Graph.ts`:
  - [ ] Camera activation based on mode
  - [ ] Input controller switching
  - [ ] Scene metadata update (`scene.metadata.viewMode`)
  - [ ] Z-coordinate handling (save/restore/flatten for 2D)
  - [ ] Mesh cache clear
  - [ ] Zoom to fit

#### Camera System Integration

- [ ] Update `RenderManager.ts` or camera system:
  - [ ] Register all camera types: `"2d"`, `"3d"`, `"ar"`, `"vr"`
  - [ ] Implement `activateCamera(viewMode)` method
- [ ] Ensure `OrbitCamera` is registered for `"3d"` mode
- [ ] Ensure 2D camera (orthographic) is registered for `"2d"` mode
- [ ] Wire XR cameras for `"ar"` and `"vr"` modes (may already exist)

#### XR Mode Integration

- [ ] Integrate XR session management with `setViewMode()`:
  - [ ] When `viewMode = "vr"`: call `enterVR()` flow
  - [ ] When `viewMode = "ar"`: call `enterAR()` flow
  - [ ] When exiting XR: set `viewMode = "3d"`
- [ ] Handle XR session exit (headset removed, etc.) updating `viewMode`
- [ ] Ensure XR buttons in `XRUIManager` update `viewMode` property

#### Layout System Decoupling

- [ ] Update `LayoutManager.ts`:
  - [ ] Remove automatic dimension sync based on `twoD`
  - [ ] Layout dimension comes solely from `layoutOptions.ndim`
- [ ] Update style template processing:
  - [ ] Handle `graph.viewMode` setting
  - [ ] Handle deprecated `graph.twoD` with warning

---

### Phase 2: Polish, Testing, and Documentation

Availability checks, error handling, events, tests, and documentation. Complete after Phase 1 is working.

#### Availability Checks and Error Handling

- [ ] Add `isViewModeAvailable(mode: ViewMode): boolean` method
- [ ] Add `availableViewModes: ViewMode[]` getter
- [ ] Implement graceful fallback when requested mode unavailable:
  - [ ] Log warning
  - [ ] Fall back to `"3d"`
  - [ ] Dispatch `viewmodeerror` event
- [ ] Expose existing `isVRSupported()` and `isARSupported()` on element

#### Events

- [ ] Add `viewmodechange` event:
  - [ ] Detail: `{ previousMode: ViewMode, currentMode: ViewMode }`
  - [ ] Fired after successful mode change
- [ ] Add `viewmodeerror` event:
  - [ ] Detail: `{ requested: ViewMode, reason: string }`
  - [ ] Fired when mode change fails

#### Testing

- [ ] Unit tests for `ViewMode` type and schema validation
- [ ] Unit tests for `setViewMode()` method
- [ ] Unit tests for `layout2d` deprecation alias
- [ ] Unit tests for availability checks
- [ ] Unit tests for events
- [ ] Integration tests for 2D ↔ 3D switching
- [ ] Integration tests for XR mode entry/exit (if testable)

#### Storybook and Documentation

- [ ] Update existing stories to use `viewMode` instead of `layout2d`
- [ ] Add story demonstrating view mode switching
- [ ] Add story for XR configuration options
- [ ] Update any JSDoc/TSDoc comments
- [ ] Update README or documentation if applicable

#### Deprecation Warnings

- [ ] Add console warnings when `layout2d` property is used
- [ ] Add console warnings when `graph.twoD` is used in style templates
- [ ] Document migration path in deprecation messages

---

### Future (Major Version Breaking Changes)

- [ ] Remove `layout2d` property
- [ ] Remove `graph.twoD` from style schema
- [ ] Update all internal references
