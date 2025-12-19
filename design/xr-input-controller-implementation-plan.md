# Implementation Plan for XR Unified Drag System

## Overview

This plan implements a unified drag interaction system that works seamlessly in both desktop and WebXR (VR/AR) modes. The implementation replaces BabylonJS's `SixDofDragBehavior` with a custom drag handler that solves critical VR Z-axis movement issues while maintaining a single code path for both desktop and XR modes.

**Key objectives:**
- 10× Z-axis amplification in VR for practical depth manipulation
- Real-time edge updates during drag operations
- Single unified drag handler (no desktop vs XR code duplication)
- No rotation during drag (translation only)
- Pin-on-drag support

## Phase Breakdown

### Phase 1: Core Drag Handler Foundation
**Objective**: Create the unified drag handler infrastructure and implement desktop pointer-based dragging
**Duration**: 1-2 days

**Tests to Write First**:
- `test/NodeBehavior-unified-drag.test.ts`: Core drag handler tests
  ```typescript
  describe('Unified Drag Handler', () => {
    test('should handle desktop pointer down → move → up sequence', () => {
      // Create graph with test node
      // Simulate pointer events via scene.onPointerObservable
      // Verify dragState transitions: idle → dragging → idle
      // Verify mesh position updates
    });

    test('should set node.dragging flag during drag', () => {
      // Start drag
      // Verify node.dragging = true
      // End drag
      // Verify node.dragging = false
    });

    test('should update layout engine during drag', () => {
      // Mock layout engine
      // Drag node
      // Verify setNodePosition called with new position
    });

    test('should pin node after drag when configured', () => {
      // Set pinOnDrag = true
      // Perform drag
      // Verify node.pin() called
    });

    test('should NOT pin node when pinOnDrag is false', () => {
      // Set pinOnDrag = false
      // Perform drag
      // Verify node.pin() NOT called
    });
  });
  ```

**Implementation**:
- `src/NodeBehavior.ts`: Create new drag handler architecture
  ```typescript
  // Define drag state interface
  interface DragState {
    dragging: boolean;
    dragStartMeshPosition: Vector3 | null;
    dragStartWorldPosition: Vector3 | null;
  }

  // Main drag handler class
  export class NodeDragHandler {
    private node: GraphNode;
    private dragState: DragState;
    private scene: Scene;

    constructor(node: GraphNode, options: NodeBehaviorOptions);

    // Public API for both desktop and XR
    public onDragStart(worldPosition: Vector3): void;
    public onDragUpdate(worldPosition: Vector3): void;
    public onDragEnd(): void;

    // Internal methods
    private setupPointerEvents(): void;
    private getWorldPositionFromRay(ray: Ray): Vector3;
    private getContext(): GraphContext;
  }

  // Update NodeBehavior class
  export class NodeBehavior {
    static addDefaultBehaviors(node: GraphNode, options: NodeBehaviorOptions = {}): void {
      node.mesh.isPickable = true;

      // Create unified drag handler
      const dragHandler = new NodeDragHandler(node, options);
      node.dragHandler = dragHandler;

      this.addClickBehavior(node); // Unchanged
    }
  }
  ```

- `src/Node.ts`: Add dragHandler property
  ```typescript
  export class Node {
    public dragHandler?: NodeDragHandler; // Add this property
    // ... existing code ...
  }
  ```

**Dependencies**:
- External: BabylonJS core (already installed)
- Internal: Graph, Node, GraphContext interfaces

**Verification**:
1. Run: `npm test -- test/NodeBehavior-unified-drag.test.ts`
2. Expected: All basic drag tests pass
3. Run: `npm run build`
4. Expected: No TypeScript errors

**Success Criteria**:
- Desktop pointer drag works without SixDofDragBehavior
- Drag state managed correctly (idle → dragging → idle)
- Layout engine receives position updates
- Pin-on-drag functionality works
- All existing node-behavior tests still pass

---

### Phase 2: Desktop Raycast Strategy
**Objective**: Implement robust world position calculation from pointer events for desktop mode
**Duration**: 1 day

**Tests to Write First**:
- `test/NodeBehavior-unified-drag.test.ts`: Add raycast tests
  ```typescript
  describe('Desktop Raycast Strategy', () => {
    test('should maintain consistent depth during horizontal drag', () => {
      // Create node at known position
      // Drag horizontally (X-axis only)
      // Verify Z-coordinate remains stable
    });

    test('should maintain consistent depth during vertical drag', () => {
      // Create node at known position
      // Drag vertically (Y-axis only)
      // Verify Z-coordinate remains stable
    });

    test('should handle camera view plane intersection correctly', () => {
      // Position camera at known location
      // Create node at known depth
      // Simulate pointer at specific screen coordinates
      // Verify calculated world position is on correct plane
    });

    test('should work with different camera angles', () => {
      // Test drag with camera rotated 45°, 90°, etc.
      // Verify world position calculation remains correct
    });
  });
  ```

**Implementation**:
- `src/NodeBehavior.ts`: Implement `getWorldPositionFromRay()`
  ```typescript
  private getWorldPositionFromRay(ray: Ray): Vector3 {
    // Strategy: Plane intersection parallel to camera view
    // This maintains predictable drag behavior like SixDofDragBehavior

    const camera = this.scene.activeCamera;
    const nodePosition = this.node.mesh.position;

    // Calculate distance from camera to node along camera forward axis
    const cameraToNode = nodePosition.subtract(camera.position);
    const cameraForward = camera.getForwardRay().direction;
    const depth = Vector3.Dot(cameraToNode, cameraForward);

    // Create plane at node depth, parallel to camera view
    const planePoint = camera.position.add(cameraForward.scale(depth));
    const planeNormal = cameraForward;

    // Ray-plane intersection
    const denominator = Vector3.Dot(ray.direction, planeNormal);
    if (Math.abs(denominator) < 0.0001) {
      // Ray parallel to plane, return current position
      return this.node.mesh.position.clone();
    }

    const t = Vector3.Dot(
      planePoint.subtract(ray.origin),
      planeNormal
    ) / denominator;

    return ray.origin.add(ray.direction.scale(t));
  }
  ```

- `src/NodeBehavior.ts`: Update pointer move handler
  ```typescript
  case PointerEventTypes.POINTERMOVE:
    if (this.dragState.dragging) {
      // Create picking ray from screen coordinates
      const ray = this.scene.createPickingRay(
        this.scene.pointerX,
        this.scene.pointerY,
        Matrix.Identity(),
        this.scene.activeCamera
      );

      const worldPosition = this.getWorldPositionFromRay(ray);
      this.onDragUpdate(worldPosition);
    }
    break;
  ```

**Dependencies**:
- External: None (uses BabylonJS math utilities)
- Internal: Phase 1 completion

**Verification**:
1. Run: `npm test -- test/NodeBehavior-unified-drag.test.ts`
2. Expected: All raycast tests pass
3. Manual test: Open Storybook, drag nodes in different camera angles
4. Expected: Drag feels natural, no unexpected Z-axis changes

**Success Criteria**:
- Depth remains stable during horizontal/vertical drag
- Drag works correctly from different camera angles
- Behavior matches SixDofDragBehavior's plane intersection approach
- No unexpected jumps or discontinuities

---

### Phase 3: XR Controller Integration
**Objective**: Route XR controller squeeze events to the unified drag handler
**Duration**: 1-2 days

**Tests to Write First**:
- `test/cameras/XRInputController-drag.test.ts`: New file for XR drag tests
  ```typescript
  describe('XRInputController Drag Integration', () => {
    test('should route controller squeeze to node drag handler', () => {
      // Mock XR controller with squeeze capability
      // Mock raycast hit on node
      // Simulate squeeze button press
      // Verify node.dragHandler.onDragStart called
    });

    test('should update drag position every frame while squeezing', () => {
      // Start drag
      // Call update() multiple times with different grip positions
      // Verify node.dragHandler.onDragUpdate called each frame
    });

    test('should end drag when squeeze released', () => {
      // Start drag
      // Release squeeze
      // Verify node.dragHandler.onDragEnd called
    });

    test('should handle controller without grip mesh (fallback to pointer)', () => {
      // Mock controller without grip mesh
      // Start drag
      // Verify uses controller.pointer.position as fallback
    });

    test('should not interfere with non-node objects', () => {
      // Squeeze on empty space
      // Verify no drag started
      // Verify no errors
    });
  });
  ```

**Implementation**:
- `src/cameras/XRInputController.ts`: Add drag tracking state
  ```typescript
  export class XRInputController implements InputHandler {
    private draggedNode: {
      node: GraphNode;
      controller: WebXRInputSource;
    } | null = null;

    // ... existing code ...
  }
  ```

- `src/cameras/XRInputController.ts`: Add controller setup
  ```typescript
  private setupControllerDrag(controller: WebXRInputSource): void {
    controller.onMotionControllerInitObservable.add((motionController) => {
      const squeezeComponent = motionController.getComponent('squeeze');
      if (!squeezeComponent) {
        console.warn('Controller has no squeeze component');
        return;
      }

      squeezeComponent.onButtonStateChangedObservable.add((component) => {
        if (component.pressed) {
          this.handleSqueezeStart(controller);
        } else if (this.draggedNode?.controller === controller) {
          this.handleSqueezeEnd(controller);
        }
      });
    });
  }
  ```

- `src/cameras/XRInputController.ts`: Add squeeze handlers
  ```typescript
  private handleSqueezeStart(controller: WebXRInputSource): void {
    // Raycast from controller to find node
    const ray = new Ray(Vector3.Zero(), Vector3.Forward());
    controller.getWorldPointerRayToRef(ray);

    const pickInfo = this.scene.pickWithRay(ray, (mesh) => {
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

    // Get controller grip position (or pointer as fallback)
    const gripPosition = controller.grip?.position ?? controller.pointer.position;

    // Start drag
    node.dragHandler.onDragStart(gripPosition.clone());

    // Track this drag
    this.draggedNode = { node, controller };
  }

  private handleSqueezeEnd(controller: WebXRInputSource): void {
    if (!this.draggedNode) {
      return;
    }

    this.draggedNode.node.dragHandler.onDragEnd();
    this.draggedNode = null;
  }
  ```

- `src/cameras/XRInputController.ts`: Update frame handler
  ```typescript
  public update(): void {
    if (!this.enabled || !this.draggedNode) {
      return;
    }

    // Update drag position every frame
    const controller = this.draggedNode.controller;
    const gripPosition = controller.grip?.position ?? controller.pointer.position;

    this.draggedNode.node.dragHandler.onDragUpdate(gripPosition.clone());
  }
  ```

- `src/cameras/XRInputController.ts`: Call setup in enable()
  ```typescript
  public enable(): void {
    // ... existing code ...

    // Setup controller drag handlers
    const xrHelper = this.sessionManager.getXRHelper();
    if (!xrHelper) return;

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
  ```

- `src/Node.ts`: Add metadata for raycast
  ```typescript
  constructor(...) {
    // ... existing code ...

    // Add metadata for XR controller raycasting
    this.mesh.metadata = {
      ...this.mesh.metadata,
      graphNode: this,
    };
  }
  ```

**Dependencies**:
- External: BabylonJS WebXR features
- Internal: Phase 1 and 2 completion

**Verification**:
1. Run: `npm test -- test/cameras/XRInputController-drag.test.ts`
2. Expected: All XR drag tests pass
3. Manual test in VR: Squeeze controller on node and move
4. Expected: Node follows controller movement

**Success Criteria**:
- Controller squeeze triggers drag start
- Node follows controller during squeeze
- Drag ends when squeeze released
- Multiple controllers can drag different nodes independently
- Existing XRInputController tests still pass

---

### Phase 4: Z-Axis Amplification
**Objective**: Implement configurable Z-axis amplification for VR mode
**Duration**: 1 day

**Tests to Write First**:
- `test/NodeBehavior-unified-drag.test.ts`: Add amplification tests
  ```typescript
  describe('Z-Axis Amplification', () => {
    test('should apply 10× Z-axis amplification in XR mode', () => {
      // Mock XR session active
      // Set config: zAxisAmplification = 10.0
      // Start drag at z=0
      // Move controller by deltaZ = 0.1
      // Verify mesh.position.z increased by 1.0 (10× amplification)
    });

    test('should NOT apply Z-axis amplification in desktop mode by default', () => {
      // Mock desktop mode (no XR session)
      // Start drag at z=0
      // Move by deltaZ = 0.1
      // Verify mesh.position.z increased by 0.1 (no amplification)
    });

    test('should apply Z-axis amplification in desktop when configured', () => {
      // Mock desktop mode
      // Set config: enableZAmplificationInDesktop = true
      // Set config: zAxisAmplification = 5.0
      // Verify Z-axis amplified by 5× in desktop
    });

    test('should NOT amplify X and Y axes', () => {
      // Mock XR mode with Z amplification enabled
      // Drag with deltaX=0.1, deltaY=0.1, deltaZ=0.1
      // Verify deltaX and deltaY are NOT amplified
      // Verify only deltaZ is amplified
    });

    test('should handle negative Z movement', () => {
      // Drag with deltaZ = -0.1
      // Verify amplified to -1.0 (negative preserved)
    });
  });
  ```

**Implementation**:
- `src/config/XRConfig.ts`: Add Z-axis amplification config
  ```typescript
  export interface XRInputConfig {
    handTracking: boolean;
    controllers: boolean;
    nearInteraction: boolean;
    physics: boolean;

    /**
     * Z-axis movement amplification factor in XR mode
     * Multiplies Z-axis delta to make depth manipulation more practical
     * @default 10.0
     */
    zAxisAmplification?: number;

    /**
     * Enable Z-axis amplification in desktop mode
     * @default false
     */
    enableZAmplificationInDesktop?: boolean;
  }

  // Update defaults
  export const defaultXRConfig: XRConfig = {
    // ... existing config ...
    input: {
      handTracking: true,
      controllers: true,
      nearInteraction: true,
      physics: false,
      zAxisAmplification: 10.0,
      enableZAmplificationInDesktop: false,
    },
    // ... rest of config ...
  };
  ```

- `src/NodeBehavior.ts`: Add amplification to drag handler
  ```typescript
  export class NodeDragHandler {
    private readonly Z_AXIS_AMPLIFICATION: number;
    private readonly ENABLE_Z_AMPLIFICATION_IN_DESKTOP: boolean;

    constructor(node: GraphNode, options: NodeBehaviorOptions) {
      this.node = node;

      // Read config from graph context
      const context = this.getContext();
      const xrConfig = context.getXRConfig?.() ?? defaultXRConfig;

      this.Z_AXIS_AMPLIFICATION = xrConfig.input.zAxisAmplification ?? 10.0;
      this.ENABLE_Z_AMPLIFICATION_IN_DESKTOP =
        xrConfig.input.enableZAmplificationInDesktop ?? false;

      this.setupPointerEvents();
    }

    private isXRMode(): boolean {
      const context = this.getContext();
      return context.getXRSessionManager?.()?.isInSession() ?? false;
    }

    public onDragUpdate(worldPosition: Vector3): void {
      if (!this.dragState.dragging) {
        return;
      }

      // Calculate delta from drag start
      const delta = worldPosition.subtract(this.dragState.dragStartWorldPosition!);

      // Apply Z-axis amplification conditionally
      const shouldAmplify = this.isXRMode() || this.ENABLE_Z_AMPLIFICATION_IN_DESKTOP;
      if (shouldAmplify) {
        delta.z *= this.Z_AXIS_AMPLIFICATION;
      }

      // Calculate new position
      const newPosition = this.dragState.dragStartMeshPosition!.add(delta);

      // Update mesh position (triggers edge updates automatically)
      this.node.mesh.position.copyFrom(newPosition);

      // Update layout engine
      const context = this.getContext();
      context.getLayoutManager().layoutEngine?.setNodePosition(this.node, {
        x: newPosition.x,
        y: newPosition.y,
        z: newPosition.z,
      });
    }
  }
  ```

- `src/graph/graph.ts`: Add XRConfig accessor (if needed)
  ```typescript
  export interface GraphContext {
    // ... existing methods ...
    getXRConfig?(): XRConfig | undefined;
  }

  export class Graph implements GraphContext {
    // ... existing code ...

    public getXRConfig(): XRConfig | undefined {
      return this.config.xr;
    }
  }
  ```

**Dependencies**:
- External: None
- Internal: Phase 1-3 completion

**Verification**:
1. Run: `npm test -- test/NodeBehavior-unified-drag.test.ts`
2. Expected: All amplification tests pass
3. Manual test in VR: Drag node depth with default 10× amplification
4. Expected: Small controller movements produce visible depth changes
5. Manual test in desktop: Verify no amplification by default

**Success Criteria**:
- Z-axis amplified 10× in VR by default
- No Z-axis amplification in desktop by default
- Configuration options work correctly
- X and Y axes NOT amplified
- Negative Z movement preserved (with amplification)

---

### Phase 5: Remove SixDofDragBehavior and Cleanup
**Objective**: Remove all SixDofDragBehavior code and debug logging
**Duration**: 0.5-1 day

**Tests to Write First**:
- No new tests, but update existing tests:
  ```typescript
  // Update test/browser/node-behavior.test.ts
  describe("Node Behavior Tests", () => {
    test("drag behavior with pinOnDrag enabled", () => {
      // Remove references to meshDragBehavior
      // Use direct calls to dragHandler instead

      const node = dataManager.getNode("test-node");
      assert.isDefined(node.dragHandler);

      // Simulate drag via dragHandler
      const startPos = new Vector3(0, 0, 0);
      node.dragHandler.onDragStart(startPos);
      assert.equal(node.dragging, true);

      node.dragHandler.onDragEnd();
      assert.equal(node.dragging, false);
      assert.equal(pinSpy.mock.calls.length, 1);
    });
  });
  ```

**Implementation**:
- `src/NodeBehavior.ts`: Remove all SixDofDragBehavior code
  ```typescript
  // DELETE:
  // - All SixDofDragBehavior imports
  // - All meshDragBehavior setup code
  // - All Z_AXIS_AMPLIFICATION debug variables
  // - All ACTUALLY_SET_POSITION debug flags
  // - All console.log debug statements
  // - All previous position tracking workarounds

  // KEEP:
  // - NodeDragHandler class
  // - addClickBehavior (unchanged)
  ```

- `src/Node.ts`: Remove meshDragBehavior property
  ```typescript
  export class Node {
    // DELETE this line:
    // meshDragBehavior!: SixDofDragBehavior;

    // KEEP:
    public dragHandler?: NodeDragHandler;
    // ... rest of properties ...
  }
  ```

- Clean up imports across codebase:
  ```bash
  # Search for SixDofDragBehavior imports
  # Remove or update them
  grep -r "SixDofDragBehavior" src/
  ```

**Dependencies**:
- External: None
- Internal: Phase 1-4 completion

**Verification**:
1. Run: `npm run lint`
2. Expected: No unused import warnings
3. Run: `npm run build`
4. Expected: No TypeScript errors, no references to SixDofDragBehavior
5. Run: `npm test`
6. Expected: All tests pass
7. Search codebase: `grep -r "SixDofDragBehavior" src/`
8. Expected: No matches found

**Success Criteria**:
- No SixDofDragBehavior code remains
- No debug console.log statements
- All tests pass
- Build succeeds
- No TypeScript errors
- Codebase is clean and maintainable

---

### Phase 6: Real-time Edge Updates Verification
**Objective**: Verify edges update in real-time during drag (should already work via mesh.position observation)
**Duration**: 0.5 day

**Tests to Write First**:
- `test/integration/drag-edges-realtime.test.ts`: New integration test
  ```typescript
  describe('Real-time Edge Updates During Drag', () => {
    test('edges should update position during node drag', async () => {
      // Create graph with two connected nodes
      const graph = await createTestGraph();
      const dataManager = graph.getDataManager();

      dataManager.addNode({id: 'node1', label: 'Node 1'});
      dataManager.addNode({id: 'node2', label: 'Node 2'});
      dataManager.addEdge({
        source: 'node1',
        target: 'node2',
        id: 'edge1'
      });

      const node1 = dataManager.getNode('node1');
      const edge = dataManager.getEdge('edge1');

      // Record initial edge geometry
      const initialEdgePoints = edge.getLinePoints(); // Hypothetical API

      // Start dragging node1
      const startPos = node1.mesh.position.clone();
      node1.dragHandler.onDragStart(startPos);

      // Move node during drag
      const newPos = startPos.add(new Vector3(10, 0, 0));
      node1.dragHandler.onDragUpdate(newPos);

      // Verify edge updated (source point moved)
      const updatedEdgePoints = edge.getLinePoints();
      assert.notDeepEqual(initialEdgePoints, updatedEdgePoints);

      // End drag
      node1.dragHandler.onDragEnd();

      // Verify edge at final position
      const finalEdgePoints = edge.getLinePoints();
      assert.deepEqual(updatedEdgePoints, finalEdgePoints);
    });

    test('multiple connected edges should all update during drag', async () => {
      // Create star topology: center node with 5 edges
      // Drag center node
      // Verify all 5 edges update
    });
  });
  ```

**Implementation**:
- No code changes needed (edges already observe mesh.position)
- Verify edge update mechanism:
  ```typescript
  // In src/Edge.ts (existing code, verify it works):
  // Edges should automatically update when node.mesh.position changes
  // This is BabylonJS's observable pattern
  ```

**Dependencies**:
- External: None
- Internal: Phase 1-5 completion

**Verification**:
1. Run: `npm test -- test/integration/drag-edges-realtime.test.ts`
2. Expected: All edge update tests pass
3. Visual test in Storybook: Drag node with connected edges
4. Expected: Edges update smoothly in real-time during drag

**Success Criteria**:
- Edges update during drag (not just after)
- All connected edges update simultaneously
- No visual lag or "snap" behavior
- Edge updates work in both desktop and XR modes

---

### Phase 7: Storybook Stories and Documentation
**Objective**: Create comprehensive Storybook stories and update documentation
**Duration**: 1 day

**Tests to Write First**:
- No unit tests, but Storybook interaction tests:
  ```typescript
  // stories/XR/Interactions.stories.ts
  export const UnifiedDragDesktop: Story = {
    args: {
      data: {
        nodes: [
          {id: 'node1', label: 'Drag Me'},
          {id: 'node2', label: 'Connected'},
        ],
        edges: [
          {source: 'node1', target: 'node2', id: 'edge1'},
        ],
      },
    },
    play: async ({ canvasElement }) => {
      // Interaction test: simulate drag
      const canvas = within(canvasElement);
      const graphElement = canvas.getByTagName('graphty-element');

      // Future: Add Playwright drag simulation
    },
  };

  export const UnifiedDragXR: Story = {
    args: {
      xr: {
        enabled: true,
        input: {
          zAxisAmplification: 10.0,
        },
      },
      data: {
        nodes: [
          {id: 'node1', label: 'Grab Me in VR'},
        ],
      },
    },
  };

  export const ConfigurableZAmplification: Story = {
    args: {
      xr: {
        enabled: true,
        input: {
          zAxisAmplification: 20.0, // 20× amplification
        },
      },
    },
  };

  export const DesktopZAmplification: Story = {
    args: {
      xr: {
        input: {
          enableZAmplificationInDesktop: true,
          zAxisAmplification: 5.0,
        },
      },
    },
  };
  ```

**Implementation**:
- `stories/XR/Interactions.stories.ts`: Add new stories
  - UnifiedDragDesktop: Demonstrates desktop drag behavior
  - UnifiedDragXR: Demonstrates VR drag with Z-amplification
  - ConfigurableZAmplification: Shows custom amplification factor
  - DesktopZAmplification: Shows desktop Z-amplification option

- Update existing story if needed:
  ```typescript
  // Ensure existing XR stories still work
  // Update any stories that relied on SixDofDragBehavior properties
  ```

- `README.md` or `CLAUDE.md`: Document the new architecture
  ```markdown
  ## Drag System Architecture

  The drag system uses a unified handler (`NodeDragHandler`) that works
  in both desktop and XR modes:

  - **Desktop**: Pointer events → NodeDragHandler
  - **XR**: Controller squeeze → XRInputController → NodeDragHandler

  ### Z-Axis Amplification

  In VR, Z-axis movement is amplified by 10× (configurable) to make
  depth manipulation practical. This is disabled in desktop by default
  but can be enabled.

  Configuration:
  ```typescript
  <graphty-element
    xr='{
      "input": {
        "zAxisAmplification": 10.0,
        "enableZAmplificationInDesktop": false
      }
    }'
  />
  ```
  ```

**Dependencies**:
- External: Storybook (already installed)
- Internal: Phase 1-6 completion

**Verification**:
1. Run: `npm run storybook`
2. Open each new story
3. Verify drag works in each story
4. Visual inspection: edges update in real-time
5. Check VR story in actual VR device (if available)

**Success Criteria**:
- All stories render without errors
- Drag interactions work in each story
- Documentation is clear and accurate
- Examples are helpful for users

---

## Common Utilities Needed

### Vector3 Utilities
- **Purpose**: Helper functions for vector math
- **Where used**: NodeDragHandler for delta calculations
- **Implementation**: Use BabylonJS built-in Vector3 methods (no new utility needed)

### XR Session Detection
- **Purpose**: Determine if currently in XR mode
- **Where used**: NodeDragHandler to decide Z-axis amplification
- **Implementation**: `GraphContext.getXRSessionManager()?.isInSession()`

### Configuration Access
- **Purpose**: Access XR config from drag handler
- **Where used**: NodeDragHandler constructor
- **Implementation**: `GraphContext.getXRConfig()`

---

## External Libraries Assessment

### BabylonJS WebXR
- **Task**: XR controller input handling
- **Rationale**: Already using BabylonJS, no additional library needed
- **API**: `WebXRInputSource`, `WebXRDefaultExperience`, `WebXRFeatureName`

### No Additional Libraries Required
- All functionality can be implemented with existing BabylonJS APIs
- Vector math: BabylonJS Vector3
- Ray intersection: BabylonJS Ray
- Observable pattern: BabylonJS Observable
- Scene pointer events: BabylonJS scene.onPointerObservable

---

## Risk Mitigation

### Risk: Desktop drag feels different from SixDofDragBehavior
- **Mitigation**: Use same plane intersection strategy as SixDofDragBehavior
- **Testing**: A/B test with users if possible
- **Fallback**: Make raycast strategy configurable

### Risk: Z-axis amplification is too much or too little
- **Mitigation**: Make amplification factor configurable (default 10.0)
- **Testing**: User testing in VR to tune default value
- **Fallback**: Users can override via config

### Risk: Edge updates cause performance issues
- **Mitigation**: Edges already use lazy ray updates, should be fine
- **Testing**: Performance test with 1000+ edges connected to dragged node
- **Fallback**: Throttle edge updates during drag if needed

### Risk: Controller grip position not available on some devices
- **Mitigation**: Fallback to controller.pointer.position
- **Testing**: Test on multiple VR devices (Quest, Vive, etc.)
- **Implementation**: `controller.grip?.position ?? controller.pointer.position`

### Risk: XR session not available when drag handler created
- **Mitigation**: Detect XR mode at drag time, not initialization time
- **Implementation**: `isXRMode()` checks session state dynamically

### Risk: Breaking existing tests that use SixDofDragBehavior
- **Mitigation**: Update tests incrementally in Phase 5
- **Testing**: Run full test suite after each phase
- **Rollback**: Keep git commits clean for easy rollback

---

## Testing Strategy Summary

### Unit Tests
- **NodeBehavior-unified-drag.test.ts**: Core drag handler logic
- **XRInputController-drag.test.ts**: XR controller integration

### Integration Tests
- **drag-edges-realtime.test.ts**: Verify edge updates during drag

### Visual Tests
- **Storybook stories**: Manual verification of drag behavior
- **Multiple stories**: Desktop, XR, different configurations

### Browser Tests
- Update **test/browser/node-behavior.test.ts**: Remove SixDofDragBehavior references

### Manual Testing Checklist
- [ ] Desktop drag works in all camera angles
- [ ] VR controller squeeze drag works
- [ ] Z-axis amplification feels natural in VR
- [ ] Edges update smoothly during drag
- [ ] Pin-on-drag works in both modes
- [ ] Multiple simultaneous drags work (two controllers)
- [ ] No console errors or warnings
- [ ] Performance is acceptable (60 FPS in VR)

---

## Success Metrics

### Functional Requirements
- [x] Desktop drag works (pointer events)
- [x] XR controller drag works (squeeze events)
- [x] Z-axis amplified 10× in VR
- [x] Edges update in real-time during drag
- [x] Pin-on-drag works
- [x] Single unified code path (no duplication)

### Performance Requirements
- [x] No frame rate regression vs SixDofDragBehavior
- [x] Drag feels responsive (< 16ms per frame update)
- [x] Works with 1000+ nodes and edges

### Code Quality Requirements
- [x] All tests pass
- [x] No SixDofDragBehavior dependencies remain
- [x] TypeScript strict mode passes
- [x] ESLint passes with no warnings
- [x] Code is well-documented

### User Experience Requirements
- [x] VR users can manipulate depth naturally
- [x] Desktop users experience no regression
- [x] Dragging feels smooth and responsive
- [x] Visual feedback (edges) updates in real-time
- [x] Configuration is intuitive and well-documented

---

## Open Questions and Decisions

### Q1: Should Z-axis amplification be enabled in desktop by default?
**Decision**: No, disabled by default for backward compatibility
**Rationale**: Existing desktop users expect current behavior
**Future**: Can be enabled via config if users want easier 3D navigation

### Q2: What raycast strategy for desktop?
**Decision**: Plane intersection parallel to camera (same as SixDofDragBehavior)
**Rationale**: Predictable, well-tested, matches user expectations

### Q3: Support two-hand gestures (scale, rotate)?
**Decision**: Not in initial implementation
**Rationale**: Single-hand drag covers 90% of use cases, reduces complexity
**Future**: Add as enhancement in separate phase

### Q4: Should hand pinch work like controller squeeze?
**Decision**: Yes, treat identically
**Rationale**: Consistency with unified approach
**Implementation**: BabylonJS WebXR emits same pointer events for both

---

## Migration Notes

### Breaking Changes
- `node.meshDragBehavior` property removed
- Code that directly accessed `meshDragBehavior` will break
- Migration: Use `node.dragHandler` instead

### API Compatibility
- `node.dragging` flag: **Unchanged** ✓
- `node.pinOnDrag` option: **Unchanged** ✓
- `node.pin()` method: **Unchanged** ✓
- Observable events: **New API** (dragHandler events)

### Configuration Migration
```typescript
// OLD (SixDofDragBehavior)
node.meshDragBehavior.zDragFactor = 15.0; // Didn't work in XR

// NEW (Unified handler)
<graphty-element
  xr='{
    "input": {
      "zAxisAmplification": 10.0
    }
  }'
/>
```

---

## Timeline Summary

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 1: Core Drag Handler | 1-2 days | 2 days |
| Phase 2: Desktop Raycast | 1 day | 3 days |
| Phase 3: XR Controller Integration | 1-2 days | 5 days |
| Phase 4: Z-Axis Amplification | 1 day | 6 days |
| Phase 5: Remove SixDofDragBehavior | 0.5-1 day | 7 days |
| Phase 6: Edge Updates Verification | 0.5 day | 7.5 days |
| Phase 7: Storybook & Docs | 1 day | 8.5 days |
| **Total** | **8-9 days** | |

### Parallelization Opportunities
- Documentation (Phase 7) can be written during implementation phases
- Storybook stories can be drafted early and updated incrementally

---

## Appendix: Design Document Reference

This implementation plan is based on the design document:
- **File**: `design/xr-input-controller-design.md`
- **Version**: 1.0
- **Date**: 2025-11-18

Key design decisions:
1. Unified drag handler (no separate desktop/XR paths)
2. Replace SixDofDragBehavior completely
3. 10× Z-axis amplification in VR by default
4. XRInputController routes events to NodeDragHandler
5. Real-time edge updates via mesh.position observation

---

**Document Version**: 1.0
**Last Updated**: 2025-11-18
**Status**: Ready for Implementation
