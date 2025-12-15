# Shared Pivot Camera Architecture Design

## Overview

This document describes a unified camera architecture that shares a single pivot-based approach across all camera types (Orbit 3D, 2D, and WebXR). By leveraging BabylonJS v8's support for parenting the XR camera to a TransformNode, we can eliminate redundant code and ensure consistent behavior across all viewing modes.

## Problem Statement

### Current State

The graphty-element codebase currently has **two separate approaches** for camera manipulation:

1. **3D Orbit Camera**: Uses a `TransformNode` pivot with the camera parented to it
2. **XR Camera**: Uses `XRReferenceSpace.getOffsetReferenceSpace()` to manipulate the virtual world

This leads to:
- Duplicate implementations of zoom, rotate, and pan logic
- Different behavior between 3D and XR modes
- More code to maintain and test
- Harder to reason about camera transformations

### Goal

Unify camera manipulation under a single **pivot-based architecture** where:
- All cameras (Orbit, 2D, XR) are parented to a shared pivot `TransformNode`
- Zoom, rotate, and pan operations transform the pivot
- Camera-specific code is minimized to input handling only

## Research Findings

### BabylonJS v8 XR Camera Parenting

In BabylonJS v8, the `WebXRCamera` fully supports parenting to a `TransformNode`. From the source code (`node_modules/@babylonjs/core/XR/webXRCamera.js`):

```javascript
// Line 262 in _updateFromXRSession()
currentRig.parent = this.parent;
```

This means:
1. When you set `xrCamera.parent = pivotNode`, the rig cameras (left/right eye) automatically inherit this parent
2. The XR frame pose is applied relative to the parent's transform
3. Transforming the parent affects the entire XR view

### Hand Tracking Fix

A previous bug caused hand tracking models to not follow the parent offset when the XR camera was parented to a TransformNode. This was fixed in **PR #16969** (confirmed by BabylonJS team member DocEdub). Both controllers and hand tracking now work correctly with parented XR cameras.

### Sources

- [BabylonJS WebXR Camera Documentation](https://doc.babylonjs.com/features/featuresDeepDive/webXR/webXRCamera)
- [Forum: Hand tracking parenting fix](https://forum.babylonjs.com/t/webxr-hand-tracking-hands-arent-positioned-correctly-when-xrcamera-is-parented-to-a-mesh-transformnode/59881)
- [Forum: XR camera in moving vehicle](https://forum.babylonjs.com/t/how-do-you-update-the-webxr-camera-if-inside-a-moving-elevator-space-ship-car/18501)
- BabylonJS v8 source: `webXRCamera.js` line 262

## Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Unified Camera Architecture                         │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │   CameraManager │
                              │                 │
                              │ • registerCamera│
                              │ • activateCamera│
                              │ • zoomToBBox    │
                              └────────┬────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
          ┌─────────▼─────────┐ ┌──────▼──────┐ ┌─────────▼─────────┐
          │ OrbitCameraCtrl   │ │ 2DCameraCtrl│ │  XRCameraCtrl     │
          │                   │ │             │ │                   │
          │ camera: ArcRotate │ │ camera: Orth│ │ camera: WebXRCam  │
          └─────────┬─────────┘ └──────┬──────┘ └─────────┬─────────┘
                    │                  │                  │
                    └──────────────────┼──────────────────┘
                                       │
                                       ▼
                         ┌─────────────────────────┐
                         │   Shared Pivot Node     │
                         │   (TransformNode)       │
                         │                         │
                         │ • position = focal point│
                         │ • rotation = view orient│
                         │ • scaling = zoom level  │
                         └─────────────────────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
              ┌──────────┐      ┌──────────┐      ┌──────────┐
              │  Orbit   │      │    2D    │      │    XR    │
              │  Camera  │      │  Camera  │      │  Camera  │
              │ (child)  │      │ (child)  │      │ (child)  │
              └──────────┘      └──────────┘      └──────────┘
```

### Component Responsibilities

#### CameraPivotController (New - Base Class)

Manages the shared pivot node and provides common transformation methods:

```typescript
abstract class CameraPivotController {
    protected pivot: TransformNode;
    protected accumulatedYaw: number = 0;

    // Shared transformation methods
    public rotate(yawDelta: number, pitchDelta: number): void;
    public zoom(factor: number): void;
    public pan(delta: Vector3): void;
    public reset(): void;

    // Abstract - camera-specific
    abstract get camera(): Camera;
    abstract zoomToBoundingBox(min: Vector3, max: Vector3): void;
}
```

#### OrbitCameraController (Refactored)

Extends `CameraPivotController`, adds orbit-specific features:

```typescript
class OrbitCameraController extends CameraPivotController {
    private arcRotateCamera: ArcRotateCamera;

    // Uses inherited rotate/zoom/pan from base
    // Adds: distance-based zoom, inertia, auto-rotation
}
```

#### XRCameraController (Refactored)

Extends `CameraPivotController`, integrates with XR session:

```typescript
class XRCameraController extends CameraPivotController {
    private sessionManager: XRSessionManager;

    constructor(sessionManager: XRSessionManager, pivot: TransformNode) {
        super(pivot);
        // Parent XR camera to shared pivot
        sessionManager.getXRCamera().parent = pivot;
    }

    // Uses inherited rotate/zoom/pan from base
    // Adds: XR-specific setup, reference space management
}
```

### Transformation Semantics

#### Rotation

All camera types use **view-relative rotation** to avoid gimbal lock:

```typescript
public rotate(yawDelta: number, pitchDelta: number): void {
    // Track accumulated yaw for view-relative pitch
    this.accumulatedYaw += yawDelta;

    // Calculate view-relative pitch axis
    // This rotates with the accumulated yaw to prevent gimbal lock
    const pitchAxis = new Vector3(
        Math.cos(this.accumulatedYaw),
        0,
        Math.sin(this.accumulatedYaw)
    );

    // Apply yaw around world Y-axis
    this.pivot.rotate(Vector3.Up(), yawDelta, Space.WORLD);

    // Apply pitch around view-relative axis
    this.pivot.rotate(pitchAxis, pitchDelta, Space.WORLD);
}
```

**Why view-relative pitch?**
- Standard Euler angles suffer from gimbal lock at ±90° pitch
- By rotating the pitch axis along with yaw, we maintain full rotation freedom
- The pitch axis is always horizontal, just pointing in different directions

#### Zoom

Zoom is implemented via **pivot scaling** (not camera distance):

```typescript
public zoom(factor: number): void {
    // factor > 1 = zoom out (scene appears smaller)
    // factor < 1 = zoom in (scene appears larger)

    // Clamp to reasonable range
    const clampedFactor = Math.max(0.9, Math.min(1.1, factor));

    // Scale the pivot - affects all children uniformly
    this.pivot.scaling.scaleInPlace(clampedFactor);

    // Optional: Clamp total scale to prevent extreme zoom
    const totalScale = this.pivot.scaling.x;
    if (totalScale < 0.1 || totalScale > 100) {
        this.pivot.scaling.setAll(Math.max(0.1, Math.min(100, totalScale)));
    }
}
```

**Why scaling instead of camera distance?**
- Works identically for all camera types (including orthographic)
- In XR, user's head position is fixed; scaling is the only way to "zoom"
- Avoids near/far plane issues with extreme distances

#### Pan

Pan translates the pivot in world space:

```typescript
public pan(delta: Vector3): void {
    // delta is in world coordinates
    // Positive X = move focal point right
    // Positive Z = move focal point forward

    this.pivot.position.addInPlace(delta);
}
```

For view-relative panning (e.g., from thumbstick input):

```typescript
public panViewRelative(right: number, forward: number): void {
    // Get the pivot's forward and right vectors
    const forward = this.pivot.forward.scale(forward);
    const right = this.pivot.right.scale(right);

    // Combine and apply
    const delta = forward.add(right);
    this.pivot.position.addInPlace(delta);
}
```

### Input Handling

Input handlers remain camera-specific but call shared pivot methods:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Input Flow                                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────────────────┐
│ Mouse/Touch     │────▶│ OrbitInputHdlr  │────▶│                             │
│ Events          │     │                 │     │                             │
└─────────────────┘     │ • onPointerDown │     │                             │
                        │ • onPointerMove │     │                             │
                        │ • onWheel       │     │    CameraPivotController    │
                        └─────────────────┘     │                             │
                                                │    • rotate(yaw, pitch)     │
┌─────────────────┐     ┌─────────────────┐     │    • zoom(factor)           │
│ XR Controllers  │────▶│ XRInputHandler  │────▶│    • pan(delta)             │
│ Hand Tracking   │     │                 │     │                             │
└─────────────────┘     │ • onThumbstick  │     │                             │
                        │ • onPinchGesture│     │                             │
                        │ • onTrigger     │     │                             │
                        └─────────────────┘     └─────────────────────────────┘
```

#### OrbitInputHandler

```typescript
class OrbitInputHandler implements InputHandler {
    constructor(
        private controller: CameraPivotController,
        private canvas: HTMLCanvasElement
    ) {}

    private onPointerMove(event: PointerEvent): void {
        if (this.isDragging) {
            const dx = event.movementX * ROTATION_SENSITIVITY;
            const dy = event.movementY * ROTATION_SENSITIVITY;
            this.controller.rotate(-dx, -dy);
        }
    }

    private onWheel(event: WheelEvent): void {
        const factor = event.deltaY > 0 ? 1.1 : 0.9;
        this.controller.zoom(factor);
    }
}
```

#### XRInputHandler

```typescript
class XRInputHandler implements InputHandler {
    private gestureDetector: XRGestureDetector;

    constructor(
        private controller: CameraPivotController,
        private xrHelper: WebXRDefaultExperience
    ) {
        this.gestureDetector = new XRGestureDetector();
    }

    public update(): void {
        // Process thumbstick input
        this.processThumbsticks();

        // Process hand gestures
        this.processGestures();
    }

    private processThumbsticks(): void {
        const leftX = this.getThumbstickValue("left", "x");
        const rightX = this.getThumbstickValue("right", "x");
        const rightY = this.getThumbstickValue("right", "y");

        // Left X = rotation
        if (Math.abs(leftX) > DEADZONE) {
            const rotationDelta = this.gestureDetector.calculateRotationFromThumbstick(leftX);
            this.controller.rotate(rotationDelta, 0);
        }

        // Right stick = pan
        if (Math.abs(rightX) > DEADZONE || Math.abs(rightY) > DEADZONE) {
            const panDelta = this.gestureDetector.calculatePanFromThumbstick(rightX, rightY);
            this.controller.pan(panDelta);
        }
    }

    private processGestures(): void {
        const gesture = this.gestureDetector.getCurrentGesture();

        if (gesture.type === "transform") {
            // Apply zoom
            if (gesture.zoomDelta) {
                this.controller.zoom(gesture.zoomDelta);
            }

            // Apply rotation around gesture axis
            if (gesture.rotationAxis && gesture.rotationAngle) {
                // For two-hand rotation, we rotate around Y-axis
                // The rotation angle is already calculated by gesture detector
                this.controller.rotate(gesture.rotationAngle, 0);
            }
        }
    }
}
```

## Implementation Plan

### Phase 1: Create Base Class

1. Create `CameraPivotController` base class in `src/cameras/CameraPivotController.ts`
2. Implement shared `rotate()`, `zoom()`, `pan()` methods
3. Add view-relative rotation with gimbal lock prevention
4. Add scale clamping and safety limits

### Phase 2: Refactor OrbitCameraController

1. Make `OrbitCameraController` extend `CameraPivotController`
2. Move pivot creation to base class
3. Use inherited transformation methods
4. Verify existing tests pass

### Phase 3: Refactor XRCameraController

1. Make `XRCameraController` extend `CameraPivotController`
2. Remove `XRReferenceSpace` manipulation code
3. Parent XR camera to shared pivot: `xrCamera.parent = this.pivot`
4. Verify XR behavior matches expectations

### Phase 4: Refactor Input Handlers

1. Update `XRInputController` to call pivot methods instead of reference space methods
2. Ensure gesture detector outputs work with pivot transformation API
3. Test controller and hand tracking inputs

### Phase 5: Testing and Validation

1. Run existing camera tests
2. Add new tests for shared pivot behavior
3. Manual XR testing on Quest 3
4. Verify hand tracking works with parented camera

## File Changes

### New Files

| File | Description |
|------|-------------|
| `src/cameras/CameraPivotController.ts` | Base class with shared pivot logic |

### Modified Files

| File | Changes |
|------|---------|
| `src/cameras/OrbitCameraController.ts` | Extend CameraPivotController, use inherited methods |
| `src/cameras/XRCameraController.ts` | Extend CameraPivotController, parent XR camera to pivot |
| `src/cameras/XRInputController.ts` | Call pivot methods instead of reference space manipulation |
| `src/cameras/CameraManager.ts` | Pass shared pivot to camera controllers |

### Removed Code

| Location | Code to Remove |
|----------|----------------|
| `XRInputController.ts` | `getOffsetReferenceSpace()` calls |
| `XRInputController.ts` | `XRRigidTransform` creation for locomotion |
| `XRInputController.ts` | Reference space rotation logic |

## API Reference

### CameraPivotController

```typescript
abstract class CameraPivotController implements CameraController {
    /**
     * The shared pivot node that all cameras parent to
     */
    protected pivot: TransformNode;

    /**
     * Accumulated yaw for view-relative pitch calculation
     */
    protected accumulatedYaw: number;

    /**
     * Rotate the view around the focal point
     * @param yawDelta - Rotation around Y-axis in radians (positive = right)
     * @param pitchDelta - Rotation around view-relative X-axis in radians (positive = up)
     */
    public rotate(yawDelta: number, pitchDelta: number): void;

    /**
     * Zoom the view
     * @param factor - Zoom factor (>1 = zoom out, <1 = zoom in)
     */
    public zoom(factor: number): void;

    /**
     * Pan the focal point in world space
     * @param delta - Translation vector in world coordinates
     */
    public pan(delta: Vector3): void;

    /**
     * Pan the focal point relative to current view direction
     * @param right - Movement along view's right vector
     * @param forward - Movement along view's forward vector
     */
    public panViewRelative(right: number, forward: number): void;

    /**
     * Reset the pivot to initial state
     */
    public reset(): void;

    /**
     * Get the pivot's current world matrix
     */
    public getWorldMatrix(): Matrix;

    /**
     * The camera instance (implemented by subclasses)
     */
    abstract get camera(): Camera;

    /**
     * Zoom to fit a bounding box (implemented by subclasses)
     */
    abstract zoomToBoundingBox(min: Vector3, max: Vector3): void;
}
```

## Comparison: Before vs After

### Before (Separate Implementations)

```typescript
// OrbitCameraController - uses TransformNode
class OrbitCameraController {
    private pivot: TransformNode;

    rotate(dx: number, dy: number): void {
        this.pivot.rotate(Vector3.Up(), dx, Space.LOCAL);
        // ... pitch logic
    }

    zoom(delta: number): void {
        this.arcRotateCamera.radius += delta;
    }
}

// XRInputController - uses ReferenceSpace
class XRInputController {
    applyRotation(angle: number): void {
        const rotationTransform = new XRRigidTransform(
            { x: 0, y: 0, z: 0, w: 1 },
            quaternionFromAxisAngle(yAxis, angle)
        );
        xrSession.referenceSpace = baseRefSpace.getOffsetReferenceSpace(rotationTransform);
    }

    applyZoom(factor: number): void {
        const scaleTransform = new XRRigidTransform(
            scaledPosition,
            { x: 0, y: 0, z: 0, w: 1 }
        );
        xrSession.referenceSpace = baseRefSpace.getOffsetReferenceSpace(scaleTransform);
    }
}
```

### After (Unified Implementation)

```typescript
// Shared base class
abstract class CameraPivotController {
    protected pivot: TransformNode;

    rotate(yaw: number, pitch: number): void {
        // Same logic for all camera types
        this.pivot.rotate(Vector3.Up(), yaw, Space.WORLD);
        this.pivot.rotate(this.getPitchAxis(), pitch, Space.WORLD);
    }

    zoom(factor: number): void {
        // Same logic for all camera types
        this.pivot.scaling.scaleInPlace(factor);
    }
}

// OrbitCameraController
class OrbitCameraController extends CameraPivotController {
    // Inherits rotate, zoom, pan
    // Only adds orbit-specific features
}

// XRCameraController
class XRCameraController extends CameraPivotController {
    constructor(sessionManager, pivot) {
        super(pivot);
        sessionManager.getXRCamera().parent = pivot; // That's it!
    }
    // Inherits rotate, zoom, pan
    // Only adds XR-specific setup
}
```

## Testing Strategy

### Unit Tests

```typescript
describe("CameraPivotController", () => {
    describe("rotate", () => {
        it("should rotate around Y-axis for yaw", () => {
            controller.rotate(Math.PI / 4, 0);
            // Assert pivot rotation
        });

        it("should use view-relative axis for pitch", () => {
            controller.rotate(Math.PI / 2, 0); // 90° yaw
            controller.rotate(0, Math.PI / 4); // 45° pitch
            // Pitch axis should now be (0, 0, 1) not (1, 0, 0)
        });

        it("should prevent gimbal lock", () => {
            // Rotate to extreme pitch
            controller.rotate(0, Math.PI / 2);
            // Should still be able to yaw
            controller.rotate(Math.PI / 4, 0);
            // Assert yaw was applied
        });
    });

    describe("zoom", () => {
        it("should scale pivot for zoom out", () => {
            controller.zoom(1.5);
            expect(pivot.scaling.x).toBe(1.5);
        });

        it("should clamp extreme zoom values", () => {
            controller.zoom(0.001);
            expect(pivot.scaling.x).toBeGreaterThanOrEqual(0.1);
        });
    });
});
```

### Integration Tests

```typescript
describe("XR Camera with Pivot", () => {
    it("should parent XR camera to pivot", async () => {
        const xrController = new XRCameraController(sessionManager, pivot);
        expect(sessionManager.getXRCamera().parent).toBe(pivot);
    });

    it("should move XR view when pivot rotates", async () => {
        const initialMatrix = xrCamera.getWorldMatrix().clone();
        controller.rotate(Math.PI / 4, 0);
        const newMatrix = xrCamera.getWorldMatrix();
        expect(newMatrix).not.toEqual(initialMatrix);
    });
});
```

### Manual XR Tests

1. **Controller thumbstick rotation**: Left stick X rotates view
2. **Controller thumbstick pan**: Right stick moves focal point
3. **Hand pinch zoom**: Two-hand pinch scales view
4. **Hand twist rotation**: Two-hand twist rotates view
5. **Hand tracking position**: Hands appear in correct position relative to pivot
6. **Transition between cameras**: Switch 3D → XR → 3D maintains orientation

## Migration Notes

### Breaking Changes

None expected. The API remains the same; only the internal implementation changes.

### Deprecations

The following patterns in XRInputController should be deprecated:

```typescript
// DEPRECATED - Do not use reference space manipulation
xrSession.referenceSpace = baseRefSpace.getOffsetReferenceSpace(transform);

// USE INSTEAD - Transform the shared pivot
this.controller.rotate(angle, 0);
this.controller.zoom(factor);
```

### Backwards Compatibility

The `XRGestureDetector` class remains unchanged - it calculates deltas that work with both the old reference space approach and the new pivot approach.

## Performance Considerations

### TransformNode Overhead

Minimal. TransformNode matrix updates are highly optimized in BabylonJS. The overhead of parenting cameras to a pivot is negligible compared to rendering.

### XR Frame Updates

In XR, the camera pose is updated every frame from `XRFrame.getViewerPose()`. With the pivot approach:

1. XR pose is applied to camera position/rotation
2. Camera's world matrix = pivot.worldMatrix × camera.localMatrix
3. This matrix multiplication happens anyway for parented objects

No additional performance cost compared to reference space manipulation.

### Memory

The shared pivot adds one `TransformNode` to the scene graph. This is offset by removing the reference space management code and associated temporary objects (`XRRigidTransform` instances).

## Conclusion

The shared pivot camera architecture provides:

1. **Unified codebase**: One implementation for zoom/rotate/pan across all camera types
2. **Consistent behavior**: Users experience the same camera feel in 3D and XR
3. **Simpler debugging**: Inspect one pivot transform instead of multiple coordinate systems
4. **Future-proof**: Follows BabylonJS's intended pattern for XR camera manipulation
5. **Reduced maintenance**: Less code means fewer bugs and easier updates

The key enabler is BabylonJS v8's full support for parenting the XR camera to a TransformNode, with the hand tracking bug fixed in PR #16969.
