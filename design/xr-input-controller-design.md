# XR Input Controller Design - Unified Drag Implementation

**Status**: Design Phase
**Created**: 2025-11-18
**Author**: AI Assistant with user collaboration

## Executive Summary

This document outlines the design for a unified drag interaction system that works seamlessly in both desktop and WebXR (VR/AR) modes. The design replaces BabylonJS's `SixDofDragBehavior` with a custom implementation that solves critical VR Z-axis movement issues while maintaining a single code path for both desktop and XR modes.

## Problem Statement

### Primary Issues

1. **VR Z-axis drag is too slow**: In WebXR VR mode, pushing/pulling nodes along the Z-axis (depth) requires excessive physical movement. A 1:1 mapping between controller movement and node movement feels unnatural and requires users to move their arms several feet to achieve noticeable depth changes.

2. **BabylonJS SixDofDragBehavior incompatible with VR Z-axis amplification**: Attempts to amplify Z-axis movement while using `SixDofDragBehavior` result in:
   - Exponential position growth (positions escalating to 10^39)
   - Unexpected rotation when positions don't stick
   - Nodes flickering or disappearing
   - Positions snapping back after drag ends

3. **Code duplication risk**: Implementing separate drag handlers for desktop (SixDofDragBehavior) and XR (custom controller) would create maintenance burden.

### User Requirements

- **Real-time UX**: Z-axis repositioning must be visible during drag, not applied after
- **Connected edges update in real-time**: Lines connected to dragged nodes must move with the node during drag
- **10× Z-axis amplification in VR**: Z-axis movement should be amplified by a factor of 10 to make depth manipulation practical
- **Single code path**: Avoid maintaining separate desktop and XR implementations
- **No rotation during drag**: Drag should only translate nodes, not rotate them
- **Pin-on-drag support**: Nodes should optionally pin to fixed positions after drag

## Background Research

### BabylonJS SixDofDragBehavior Limitations

Research into BabylonJS forums and issue trackers revealed:

1. **Z-axis regression in v6.0+**: The Z-axis drag functionality broke in BabylonJS v6.0 and later versions
   - Source: Multiple forum posts from users experiencing same issues
   - Timeline: Issue reported since v6.0 release, partial fix in Feb 2025

2. **zDragFactor non-functional in WebXR**: The `zDragFactor` property that should control Z-axis sensitivity does not work in VR mode
   - This is by design, not a bug
   - The property was designed for desktop 2D pointer input, not 3D VR controllers

3. **BabylonJS team recommendation**: RaananW (BabylonJS team member) recommended using "parenting approach" for VR drag
   - Attach grabbed object as child of controller
   - Move with controller naturally
   - However, this approach has its own complexities with world-space positioning

4. **Fix status**: A fix was implemented in Feb 2025 but remains "subtle" and requires "several seconds of movement to notice"
   - Not sufficient for good UX
   - Still 1:1 mapping, not configurable amplification

### Attempted Solutions (This Session)

We attempted multiple approaches to work with SixDofDragBehavior:

#### Attempt 1: Increase zDragFactor
```typescript
node.meshDragBehavior.zDragFactor = 15.0;
```
**Result**: No effect. User reported "the push / pull along z-axis didn't change at all"
**Root cause**: zDragFactor is non-functional in WebXR VR mode

#### Attempt 2: Custom Z-axis amplification with previousPosition tracking
```typescript
const previousPosition = {...};
const delta = event.position.subtract(previousPosition);
delta.z *= Z_AXIS_AMPLIFICATION;
mesh.position.add(delta);
```
**Result**: Exponential growth. Z-coordinates escalated to 10^39
**Root cause**: Feedback loop - we modified position, SixDofDragBehavior calculated next event from that modified position, we amplified again, creating exponential growth

#### Attempt 3: Track basePosition to avoid feedback
```typescript
const basePosition = mesh.position.clone(); // At drag start
const delta = event.position.subtract(basePosition);
delta.z *= Z_AXIS_AMPLIFICATION;
mesh.position = basePosition.add(delta);
```
**Result**: Nodes rotated instead of translating
**Root cause**: SixDofDragBehavior and manual position control fighting over mesh transform

#### Attempt 4: Disable rotation, track first event position
```typescript
meshDragBehavior.rotateDraggedObject = false;
const dragStartMeshPosition = mesh.position.clone();
const firstEventPosition = event.position.clone(); // First event
const delta = event.position.subtract(firstEventPosition);
delta.z *= Z_AXIS_AMPLIFICATION;
mesh.position = dragStartMeshPosition.add(delta);
```
**Result**: With position setting enabled - rotation artifacts. With position setting disabled - positions don't persist (snap back after drag ends)
**Root cause**: SixDofDragBehavior is fundamentally incompatible with external position manipulation

### Key Insight

**SixDofDragBehavior and manual position control are mutually exclusive.** When both systems try to control the mesh transform, conflicts arise. We must choose one approach, not try to combine them.

## Design Decision: Unified Custom Drag Handler

### Rationale

We will **completely replace SixDofDragBehavior** with a custom drag handler that:

1. **Works in both desktop and XR modes** (single code path)
2. **Directly controls mesh positions** (no conflicts)
3. **Supports configurable Z-axis amplification** (works in both modes)
4. **Real-time edge updates** (edges watch mesh.position)
5. **Simpler architecture** (no mode-switching logic)

### Why Not Keep SixDofDragBehavior for Desktop?

While SixDofDragBehavior works fine in desktop mode, maintaining two separate systems would:
- Complicate the codebase
- Create potential bugs at mode boundaries
- Require duplicate testing
- Make future enhancements harder

Benefits of unified approach:
- Z-axis amplification could be useful in desktop 3D navigation too
- Single set of tests
- Consistent behavior across all modes
- Easier to understand and maintain

## Architecture

### Component Responsibilities

```
┌─────────────────────────────────────────────────────────────┐
│                      NodeBehavior.ts                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Custom Drag Handler (Unified)                 │  │
│  │  - Pointer events (desktop/mobile)                    │  │
│  │  - XR controller events (VR/AR)                       │  │
│  │  - Z-axis amplification (both modes)                  │  │
│  │  - Real-time position updates                         │  │
│  │  - Pin-on-drag logic                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ delegates XR events to
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  XRInputController.ts                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  - Detects XR controller squeeze/trigger events       │  │
│  │  - Routes events to NodeBehavior drag handler         │  │
│  │  - Provides controller world positions                │  │
│  │  - Enables hand tracking features                     │  │
│  │  - Enables near interaction features                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ updates automatically
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Edge.ts                               │
│  - Watches node.mesh.position                               │
│  - Updates line geometry automatically                      │
│  - Real-time updates during drag                            │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

#### Desktop Mode Drag

```
1. User clicks node mesh
   → Babylon pointer down event
   → NodeBehavior.onDragStart(pointerInfo)

2. User moves mouse
   → Babylon pointer move event
   → Ray cast to get world position
   → NodeBehavior.onDragUpdate(worldPosition)
   → Calculate delta from drag start
   → Apply Z-axis amplification
   → Update mesh.position
   → Edges auto-update (watch mesh.position)

3. User releases mouse
   → Babylon pointer up event
   → NodeBehavior.onDragEnd()
   → Pin node if configured
   → Update layout engine
```

#### XR Mode Drag

```
1. User squeezes controller on node mesh
   → WebXR squeeze event
   → XRInputController detects squeeze + raycast hit
   → XRInputController calls NodeBehavior.onDragStart(controller.grip.position)

2. User moves controller (every frame)
   → XRInputController.update() in render loop
   → Get controller.grip.position
   → XRInputController calls NodeBehavior.onDragUpdate(controller.grip.position)
   → Calculate delta from drag start
   → Apply Z-axis amplification (10×)
   → Update mesh.position
   → Edges auto-update (watch mesh.position)

3. User releases squeeze
   → WebXR squeeze end event
   → XRInputController calls NodeBehavior.onDragEnd()
   → Pin node if configured
   → Update layout engine
```

### Key Design Patterns

1. **Event Delegation**: XRInputController routes XR controller events to the same drag handler that processes desktop pointer events

2. **World-Space Calculations**: All drag calculations happen in world space, not screen space or controller-local space

3. **Observable Pattern**: Edges observe mesh.position changes automatically via Babylon's observable system

4. **State Machine**: Drag handler maintains state: `idle` → `dragging` → `idle`

## Implementation Details

### NodeBehavior.ts Changes

#### Remove SixDofDragBehavior

**Current code to remove**:
```typescript
node.meshDragBehavior = new SixDofDragBehavior();
node.meshDragBehavior.rotateDraggedObject = false;
node.meshDragBehavior.zDragFactor = 15.0;
node.mesh.addBehavior(node.meshDragBehavior);
// ... all the observable subscriptions
```

#### Add Custom Drag Handler

**New implementation**:

```typescript
interface DragState {
    dragging: boolean;
    dragStartMeshPosition: Vector3 | null;
    dragStartWorldPosition: Vector3 | null;
    currentWorldPosition: Vector3 | null;
}

class NodeDragHandler {
    private node: GraphNode;
    private dragState: DragState = {
        dragging: false,
        dragStartMeshPosition: null,
        dragStartWorldPosition: null,
        currentWorldPosition: null,
    };

    // Configuration
    private readonly Z_AXIS_AMPLIFICATION = 10.0;
    private readonly ENABLE_Z_AMPLIFICATION_IN_XR = true;
    private readonly ENABLE_Z_AMPLIFICATION_IN_DESKTOP = false; // Could be configurable

    // XR detection
    private isXRMode(): boolean {
        const context = this.getContext();
        return context.getXRSessionManager()?.isInSession() ?? false;
    }

    constructor(node: GraphNode, options: NodeBehaviorOptions) {
        this.node = node;
        this.setupPointerEvents(); // Desktop/mobile
        // XR events will be routed from XRInputController
    }

    private setupPointerEvents(): void {
        const scene = this.node.mesh.getScene();

        scene.onPointerObservable.add((pointerInfo) => {
            if (pointerInfo.pickInfo?.pickedMesh !== this.node.mesh) {
                return; // Not this node
            }

            switch (pointerInfo.type) {
                case PointerEventTypes.POINTERDOWN:
                    this.onDragStart(pointerInfo.pickInfo.pickedPoint);
                    break;

                case PointerEventTypes.POINTERMOVE:
                    if (this.dragState.dragging) {
                        // Raycast to get current world position
                        const ray = scene.createPickingRay(
                            scene.pointerX,
                            scene.pointerY,
                            Matrix.Identity(),
                            this.node.mesh.getScene().activeCamera
                        );

                        // Cast ray and get world position
                        // Option 1: Plane intersection (parallel to camera view plane)
                        // Option 2: Depth-locked raycast (maintain initial depth)
                        const worldPosition = this.getWorldPositionFromRay(ray);
                        this.onDragUpdate(worldPosition);
                    }
                    break;

                case PointerEventTypes.POINTERUP:
                    if (this.dragState.dragging) {
                        this.onDragEnd();
                    }
                    break;
            }
        });
    }

    public onDragStart(worldPosition: Vector3): void {
        // Start dragging
        this.dragState.dragging = true;
        this.dragState.dragStartMeshPosition = this.node.mesh.position.clone();
        this.dragState.dragStartWorldPosition = worldPosition.clone();

        // Set node.dragging flag (for layout engine)
        this.node.dragging = true;

        // Ensure graph is running
        const context = this.getContext();
        context.setRunning(true);

        console.log(`[DRAG START] Node ${this.node.id}`, {
            meshPosition: this.node.mesh.position,
            worldPosition,
            mode: this.isXRMode() ? 'XR' : 'Desktop',
        });
    }

    public onDragUpdate(worldPosition: Vector3): void {
        if (!this.dragState.dragging) {
            return;
        }

        // Calculate delta from drag start
        const delta = worldPosition.subtract(this.dragState.dragStartWorldPosition);

        // Apply Z-axis amplification if in XR mode
        if (this.isXRMode() && this.ENABLE_Z_AMPLIFICATION_IN_XR) {
            delta.z *= this.Z_AXIS_AMPLIFICATION;
        } else if (!this.isXRMode() && this.ENABLE_Z_AMPLIFICATION_IN_DESKTOP) {
            delta.z *= this.Z_AXIS_AMPLIFICATION;
        }

        // Calculate new position
        const newPosition = this.dragState.dragStartMeshPosition.add(delta);

        // Update mesh position (triggers edge updates automatically)
        this.node.mesh.position.copyFrom(newPosition);

        // Update layout engine
        const context = this.getContext();
        context.getLayoutManager().layoutEngine?.setNodePosition(this.node, {
            x: newPosition.x,
            y: newPosition.y,
            z: newPosition.z,
        });

        this.dragState.currentWorldPosition = worldPosition;
    }

    public onDragEnd(): void {
        if (!this.dragState.dragging) {
            return;
        }

        console.log(`[DRAG END] Node ${this.node.id}`, {
            finalPosition: this.node.mesh.position,
            mode: this.isXRMode() ? 'XR' : 'Desktop',
        });

        // Pin if configured
        if (this.node.pinOnDrag) {
            this.node.pin();
        }

        // Clear dragging state
        this.node.dragging = false;
        this.dragState.dragging = false;
        this.dragState.dragStartMeshPosition = null;
        this.dragState.dragStartWorldPosition = null;
        this.dragState.currentWorldPosition = null;

        // Ensure graph is running
        const context = this.getContext();
        context.setRunning(true);
    }

    private getWorldPositionFromRay(ray: Ray): Vector3 {
        // Strategy: Maintain depth from camera to preserve Z-axis control

        // Option 1: Plane intersection (simpler, used by SixDofDragBehavior)
        // Create plane parallel to camera view at current node depth

        const camera = this.node.mesh.getScene().activeCamera;
        const nodePosition = this.node.mesh.position;

        // Calculate distance from camera to node
        const cameraToNode = nodePosition.subtract(camera.position);
        const depth = Vector3.Dot(cameraToNode, camera.getForwardRay().direction);

        // Intersect ray with plane at that depth
        const planePoint = camera.position.add(
            camera.getForwardRay().direction.scale(depth)
        );
        const planeNormal = camera.getForwardRay().direction;

        // Ray-plane intersection
        const t = Vector3.Dot(planePoint.subtract(ray.origin), planeNormal) /
                  Vector3.Dot(ray.direction, planeNormal);

        return ray.origin.add(ray.direction.scale(t));
    }

    private getContext(): GraphContext {
        return this.node.parentGraph;
    }
}
```

#### Refactor addDefaultBehaviors

```typescript
export class NodeBehavior {
    static addDefaultBehaviors(node: GraphNode, options: NodeBehaviorOptions = {}): void {
        node.mesh.isPickable = true;

        // Create drag handler (works in both desktop and XR)
        const dragHandler = new NodeDragHandler(node, options);
        node.dragHandler = dragHandler; // Store reference for XR controller access

        this.addClickBehavior(node); // Double-click expansion, unchanged
    }
}
```

### XRInputController.ts Changes

#### Route Controller Events to Drag Handler

```typescript
export class XRInputController implements InputHandler {
    private draggedNode: {
        node: GraphNode;
        controller: WebXRInputSource;
    } | null = null;

    public enable(): void {
        // ... existing code ...

        // Setup controller squeeze handlers
        const xrHelper = this.sessionManager.getXRHelper();
        if (!xrHelper) return;

        // Subscribe to squeeze events (grab)
        xrHelper.input.controllers.forEach(controller => {
            this.setupControllerDrag(controller);
        });

        // Watch for new controllers
        const controllerObserver = xrHelper.input.onControllerAddedObservable.add(
            (controller) => {
                this.setupControllerDrag(controller);
            }
        );
        this.observers.push(controllerObserver);
    }

    private setupControllerDrag(controller: WebXRInputSource): void {
        // Squeeze start = grab
        controller.onMotionControllerInitObservable.add((motionController) => {
            const squeezeComponent = motionController.getComponent('squeeze');
            if (!squeezeComponent) return;

            squeezeComponent.onButtonStateChangedObservable.add((component) => {
                if (component.pressed) {
                    this.handleSqueezeStart(controller);
                } else if (this.draggedNode?.controller === controller) {
                    this.handleSqueezeEnd(controller);
                }
            });
        });
    }

    private handleSqueezeStart(controller: WebXRInputSource): void {
        // Raycast from controller to find picked node
        const ray = controller.getWorldPointerRayToRef(new Ray());
        const pickInfo = this.scene.pickWithRay(ray, (mesh) => {
            // Check if mesh belongs to a graph node
            return mesh.metadata?.graphNode !== undefined;
        });

        if (!pickInfo?.hit || !pickInfo.pickedMesh) {
            return;
        }

        const node = pickInfo.pickedMesh.metadata.graphNode as GraphNode;
        if (!node.dragHandler) {
            console.warn('Node has no drag handler');
            return;
        }

        // Start drag using controller grip position
        const gripPosition = controller.grip?.position ?? controller.pointer.position;
        node.dragHandler.onDragStart(gripPosition);

        // Track this drag
        this.draggedNode = { node, controller };
    }

    private handleSqueezeEnd(controller: WebXRInputSource): void {
        if (!this.draggedNode) {
            return;
        }

        // End drag
        this.draggedNode.node.dragHandler.onDragEnd();
        this.draggedNode = null;
    }

    public update(): void {
        if (!this.enabled || !this.draggedNode) {
            return;
        }

        // Update drag position every frame
        const controller = this.draggedNode.controller;
        const gripPosition = controller.grip?.position ?? controller.pointer.position;

        this.draggedNode.node.dragHandler.onDragUpdate(gripPosition);
    }
}
```

### Node.ts Changes

Add dragHandler reference:

```typescript
export class Node {
    public dragHandler?: NodeDragHandler; // Add this property

    // ... existing code ...
}
```

### GraphContext.ts Changes

Add method to access XRSessionManager:

```typescript
export interface GraphContext {
    // ... existing methods ...
    getXRSessionManager(): XRSessionManager | undefined;
}
```

## Configuration

### XRConfig.ts - Z-axis Amplification

Add configuration option:

```typescript
export interface XRInputConfig {
    handTracking: boolean;
    controllers: boolean;
    nearInteraction: boolean;
    physics: boolean;

    // New config
    zAxisAmplification?: number; // Default: 10.0 in XR, 1.0 in desktop
    enableZAmplificationInDesktop?: boolean; // Default: false
}
```

## Testing Strategy

### Unit Tests

#### test/NodeBehavior-unified-drag.test.ts (new file)

```typescript
describe('Unified Drag Handler', () => {
    test('should handle desktop drag with pointer events', () => {
        // Test pointer down → move → up sequence
        // Verify position updates
        // Verify layout engine updates
    });

    test('should apply Z-axis amplification in XR mode', () => {
        // Mock XR session active
        // Simulate drag with Z movement
        // Verify Z-axis is amplified 10×
    });

    test('should NOT apply Z-axis amplification in desktop mode by default', () => {
        // Mock desktop mode
        // Simulate drag with Z movement
        // Verify Z-axis is NOT amplified
    });

    test('should pin node after drag when configured', () => {
        // Set pinOnDrag = true
        // Drag node
        // Verify node.pin() called
    });

    test('should update layout engine during drag', () => {
        // Mock layout engine
        // Drag node
        // Verify setNodePosition called with new position
    });

    test('should set node.dragging flag during drag', () => {
        // Start drag
        // Verify node.dragging = true
        // End drag
        // Verify node.dragging = false
    });
});
```

#### test/cameras/XRInputController-drag.test.ts (new file)

```typescript
describe('XRInputController Drag Integration', () => {
    test('should route controller squeeze to node drag handler', () => {
        // Mock XR controller
        // Simulate squeeze on node
        // Verify dragHandler.onDragStart called
    });

    test('should update drag position every frame while squeezing', () => {
        // Start drag
        // Call update() multiple times
        // Verify dragHandler.onDragUpdate called each frame
    });

    test('should end drag when squeeze released', () => {
        // Start drag
        // Release squeeze
        // Verify dragHandler.onDragEnd called
    });

    test('should handle multiple controllers independently', () => {
        // Two controllers
        // Each grabs different node
        // Verify both drags work independently
    });
});
```

### Integration Tests

#### test/integration/drag-edges-realtime.test.ts (new file)

```typescript
describe('Real-time Edge Updates During Drag', () => {
    test('edges should update position during node drag', async () => {
        // Create graph with connected nodes
        // Start dragging node
        // Verify connected edges update positions in real-time
        // End drag
        // Verify edges at final positions
    });
});
```

### Visual Tests (Storybook)

Update existing stories:

```typescript
// stories/XR/Interactions.stories.ts
export const UnifiedDragDesktop: Story = {
    args: {
        // Test desktop drag with unified handler
    }
};

export const UnifiedDragXR: Story = {
    args: {
        // Test XR drag with Z-axis amplification
        xr: {
            enabled: true,
            input: {
                zAxisAmplification: 10.0,
            }
        }
    }
};
```

## Migration Path

### Phase 1: Implement Core Drag Handler (NodeBehavior.ts)

1. Create `NodeDragHandler` class
2. Implement `onDragStart`, `onDragUpdate`, `onDragEnd`
3. Setup pointer event listeners for desktop mode
4. Add unit tests
5. Test in desktop Storybook stories

**Success criteria**: Desktop drag works with custom handler, replacing SixDofDragBehavior

### Phase 2: Integrate XR Controller Events (XRInputController.ts)

1. Add controller squeeze detection
2. Route squeeze events to NodeDragHandler
3. Implement frame-by-frame position updates in `update()`
4. Add XR mode detection
5. Add unit tests

**Success criteria**: XR controller drag works, routes to same handler as desktop

### Phase 3: Z-axis Amplification

1. Add configuration to XRConfig
2. Implement Z-axis amplification in `onDragUpdate`
3. Add XR mode conditional (amplify in XR, not in desktop by default)
4. Add tests for amplification
5. Test in XR Storybook stories

**Success criteria**: Z-axis movement amplified 10× in VR, edges update in real-time

### Phase 4: Remove SixDofDragBehavior

1. Remove all SixDofDragBehavior code from NodeBehavior.ts
2. Remove all debug logging added during investigation
3. Update all tests that reference SixDofDragBehavior
4. Update documentation

**Success criteria**: Clean codebase, all tests pass, unified drag works in all modes

### Phase 5: Polish and Optimization

1. Fine-tune Z-axis amplification factor based on user testing
2. Add optional desktop Z-axis amplification config
3. Performance testing with large graphs
4. Add visual feedback for drag state (optional)

**Success criteria**: Production-ready, good UX in both desktop and VR

## Open Questions

### 1. Desktop Raycast Strategy

**Question**: What's the best raycast strategy for desktop drag to maintain depth control?

**Options**:
- **A**: Plane intersection parallel to camera (used by SixDofDragBehavior)
  - Pros: Simple, predictable
  - Cons: Depth changes as you move mouse up/down

- **B**: Depth-locked raycast (maintain initial camera-to-node distance)
  - Pros: More intuitive for 3D, maintains depth
  - Cons: More complex math

- **C**: Hybrid: X/Y from plane intersection, Z from scroll wheel or keyboard
  - Pros: Explicit Z control
  - Cons: Requires additional input

**Recommendation**: Start with option A (plane intersection) for consistency with SixDofDragBehavior. Can be made configurable later.

### 2. Z-axis Amplification in Desktop

**Question**: Should Z-axis amplification be available in desktop mode?

**Options**:
- **A**: XR-only (default disabled in desktop)
  - Pros: Simpler, matches current behavior
  - Cons: Desktop users miss out on easier 3D navigation

- **B**: Configurable per-mode
  - Pros: Flexibility, users can enable if desired
  - Cons: More config surface area

- **C**: Auto-detect based on camera type (orbit vs VR)
  - Pros: Smart defaults
  - Cons: Coupling to camera system

**Recommendation**: Option B (configurable), default to disabled in desktop for backward compatibility, enabled in XR.

### 3. Multiple Controller Support

**Question**: Should we support simultaneous two-controller drag (e.g., scale, rotate)?

**Options**:
- **A**: Single controller only (initial implementation)
  - Pros: Simpler, covers 90% of use cases
  - Cons: No two-hand gestures

- **B**: Support two-hand gestures (scale, rotate)
  - Pros: More powerful, better VR UX
  - Cons: Complex, requires gesture detection

**Recommendation**: Option A for initial implementation. Option B as future enhancement.

### 4. Hand Tracking vs Controller

**Question**: Should hand pinch gestures work the same as controller squeeze?

**Options**:
- **A**: Treat hand pinch identically to controller squeeze
  - Pros: Consistent UX
  - Cons: May not leverage hand tracking strengths

- **B**: Separate gesture system for hands
  - Pros: Can optimize for hand interactions
  - Cons: More code paths

**Recommendation**: Option A for consistency with unified approach.

## Performance Considerations

### Desktop Mode

- **Raycast per frame during drag**: Should be negligible (single ray)
- **Pointer event overhead**: Same as SixDofDragBehavior, no regression
- **Edge updates**: Already optimized with lazy ray updates

### XR Mode

- **Controller position every frame**: Already tracked by WebXR, no overhead
- **Grip position access**: Direct property access, extremely fast
- **Z-axis amplification calculation**: Trivial (single multiplication)

### Large Graphs

- **Connected edges**: Only edges connected to dragged node update, not entire graph
- **Layout engine**: Only single node position update per frame
- **Mesh instancing**: Unchanged, drag doesn't affect instancing

## Success Metrics

1. **Functional**:
   - Desktop drag works (pointer events)
   - XR controller drag works (squeeze events)
   - Z-axis amplified 10× in VR
   - Edges update in real-time during drag
   - Pin-on-drag works

2. **Performance**:
   - No frame rate regression vs SixDofDragBehavior
   - Drag feels responsive (< 16ms per frame update)

3. **Code Quality**:
   - Single drag handler implementation (no duplication)
   - All tests pass
   - No SixDofDragBehavior dependencies remain

4. **User Experience**:
   - VR users can manipulate depth naturally (10× amplification)
   - Desktop users experience no regression
   - Dragging feels smooth and responsive
   - Visual feedback (edges) updates in real-time

## References

### BabylonJS Forum Posts

- Z-axis drag regression in v6.0+: [Forum thread link if available]
- RaananW parenting recommendation: [Forum thread link if available]
- zDragFactor non-functional in WebXR: [Documentation link]

### Related Code

- `src/NodeBehavior.ts` - Current drag implementation with SixDofDragBehavior
- `src/cameras/XRInputController.ts` - Phase 2 XR input setup
- `src/Node.ts` - Node class with mesh and drag state
- `src/Edge.ts` - Edge updates based on mesh positions

### BabylonJS API Documentation

- SixDofDragBehavior: https://doc.babylonjs.com/typedoc/classes/BABYLON.SixDofDragBehavior
- WebXR Input Sources: https://doc.babylonjs.com/features/featuresDeepDive/webXR/webXRInputControllerSupport
- Pointer Events: https://doc.babylonjs.com/features/featuresDeepDive/events/observables

## Appendix: Debugging Session Logs

### Exponential Growth Example (Attempt 2)

```
[POSITION CHANGE] Node test-node-1: z: 2.453
[POSITION CHANGE] Node test-node-1: z: 60.132
[POSITION CHANGE] Node test-node-1: z: 1,503.3
[POSITION CHANGE] Node test-node-1: z: 37,583
[POSITION CHANGE] Node test-node-1: z: 939,582
[POSITION CHANGE] Node test-node-1: z: 2.349e7
[POSITION CHANGE] Node test-node-1: z: 5.873e8
[POSITION CHANGE] Node test-node-1: z: 1.468e10
[POSITION CHANGE] Node test-node-1: z: 3.671e11
[POSITION CHANGE] Node test-node-1: z: 9.177e12
[POSITION CHANGE] Node test-node-1: z: 2.294e14
[POSITION CHANGE] Node test-node-1: z: 5.735e15
[POSITION CHANGE] Node test-node-1: z: 1.434e17
[POSITION CHANGE] Node test-node-1: z: 3.584e18
[POSITION CHANGE] Node test-node-1: z: 8.961e19
[POSITION CHANGE] Node test-node-1: z: 2.240e21
[POSITION CHANGE] Node test-node-1: z: 5.601e22
[POSITION CHANGE] Node test-node-1: z: 1.400e24
[POSITION CHANGE] Node test-node-1: z: 3.501e25
[POSITION CHANGE] Node test-node-1: z: 8.752e26
[POSITION CHANGE] Node test-node-1: z: 2.188e28
[POSITION CHANGE] Node test-node-1: z: 5.470e29
[POSITION CHANGE] Node test-node-1: z: 1.367e31
[POSITION CHANGE] Node test-node-1: z: 3.419e32
[POSITION CHANGE] Node test-node-1: z: 8.547e33
[POSITION CHANGE] Node test-node-1: z: 2.137e35
[POSITION CHANGE] Node test-node-1: z: 5.342e36
[POSITION CHANGE] Node test-node-1: z: 1.335e38
[POSITION CHANGE] Node test-node-1: z: 3.339e39
```

This demonstrates the feedback loop when modifying event positions that SixDofDragBehavior also reads.

### Position Skip Test (Attempt 4)

With `ACTUALLY_SET_POSITION = false`:

```
[DRAG START] Node test-node-1: meshPosition: {x: 0, y: 0, z: 0}
[POSITION CHANGE] Node test-node-1: eventPosition: {x: 0.1, y: 0.2, z: 0.05}
[TRANSLATION] deltas: {x: 0.1, y: 0.2, z: 0.05}, amplifiedDeltaZ: 0.5
[POSITION SKIP] NOT setting position (testing if this causes rotation)
[POSITION CHANGE] Node test-node-1: eventPosition: {x: 0.2, y: 0.4, z: 0.1}
[TRANSLATION] deltas: {x: 0.2, y: 0.4, z: 0.1}, amplifiedDeltaZ: 1.0
[POSITION SKIP] NOT setting position (testing if this causes rotation)
[DRAG END] Node test-node-1: finalPosition: {x: 0.2, y: 0.4, z: 0.1}
```

After drag end, position snapped back to SixDofDragBehavior's calculated position (not amplified), proving positions don't persist when we don't set them.

---

**Document Version**: 1.0
**Last Updated**: 2025-11-18
**Next Review**: After Phase 1 implementation
