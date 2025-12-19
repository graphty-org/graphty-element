# Unified XR (VR/AR) Implementation Plan

## Overview

This unified plan combines the comprehensive XR camera architecture with the critical unified drag system, delivering a complete, production-ready XR experience for graph visualization.

**Key Objectives**:
- ✅ Complete XR camera system (session, UI, camera controller)
- ✅ Unified drag handler solving VR Z-axis issues
- ✅ 10× Z-axis amplification for practical VR manipulation
- ✅ Advanced gestures (two-hand zoom, rotate, pan)
- ✅ Seamless camera switching architecture
- ✅ >80% test coverage with comprehensive automation

**Total Duration**: 12-16 days across 6 phases

**Critical Architectural Decision**: Replace `SixDofDragBehavior` with unified `NodeDragHandler` to solve VR Z-axis amplification issues while maintaining single code path for desktop and XR.

---

## Phase Breakdown

### Phase 1: XR Session Management and UI Foundation (2-3 days)

**Objective**: Establish core XR session lifecycle and UI button system, enabling users to enter/exit XR modes.

**Status**: ⚠️ **PARTIALLY COMPLETE**
- ✅ XRConfig.ts exists with full configuration structure
- ✅ XRSessionManager.ts exists (needs verification)
- ❓ XRUIManager needs creation/verification
- ❓ Integration with Graph.ts needs verification

**Tests to Write First**:

1. **`test/xr/XRSessionManager.test.ts`**: Session lifecycle testing
   ```typescript
   import { describe, test, beforeEach, afterEach } from "vitest";
   import { assert } from "chai";
   import { NullEngine, Scene } from "@babylonjs/core";
   import { XRSessionManager } from "../../src/xr/XRSessionManager";

   describe("XRSessionManager", () => {
     let engine: NullEngine;
     let scene: Scene;
     let manager: XRSessionManager;

     beforeEach(() => {
       engine = new NullEngine();
       scene = new Scene(engine);
       manager = new XRSessionManager(scene, {
         vr: { enabled: true, referenceSpaceType: "local-floor" },
         ar: { enabled: true, referenceSpaceType: "local-floor" }
       });
     });

     afterEach(() => {
       manager.dispose();
       scene.dispose();
       engine.dispose();
     });

     test("should initialize without WebXR support", () => {
       assert.isFalse(manager.isXRSupported());
     });

     test("should handle session state transitions", async () => {
       // Test session initialization, state management
     });

     test("should cleanup resources on dispose", () => {
       manager.dispose();
       // Verify proper cleanup
     });
   });
   ```

2. **`test/ui/XRUIManager.test.ts`**: UI button rendering and behavior
   ```typescript
   describe("XRUIManager", () => {
     test("should render unavailable message when XR not supported", () => {
       const container = document.createElement("div");
       const uiManager = new XRUIManager(container, false, false, {
         enabled: true,
         position: "bottom-left",
         unavailableMessageDuration: 5000
       });

       const message = container.querySelector(".webxr-not-available");
       assert.exists(message);
     });

     test("should render VR and AR buttons when available", () => {
       // Verify button rendering
     });

     test("should position buttons according to config", () => {
       // Test all four position options
     });
   });
   ```

**Implementation**:

1. **Verify/Complete `src/xr/XRSessionManager.ts`**:
   ```typescript
   import { Scene, WebXRDefaultExperience, Camera } from "@babylonjs/core";

   export type XRReferenceSpaceType = "local" | "local-floor" | "bounded-floor" | "unbounded";

   export interface XRSessionConfig {
     vr: {
       enabled: boolean;
       referenceSpaceType: XRReferenceSpaceType;
       optionalFeatures?: string[];
     };
     ar: {
       enabled: boolean;
       referenceSpaceType: XRReferenceSpaceType;
       optionalFeatures?: string[];
     };
   }

   export class XRSessionManager {
     private scene: Scene;
     private config: XRSessionConfig;
     private xrHelper: WebXRDefaultExperience | null = null;
     private activeMode: "immersive-vr" | "immersive-ar" | null = null;

     constructor(scene: Scene, config: XRSessionConfig);

     public isXRSupported(): boolean;
     public async enterVR(previousCamera?: Camera): Promise<void>;
     public async enterAR(previousCamera?: Camera): Promise<void>;
     public async exitXR(): Promise<void>;
     public getXRHelper(): WebXRDefaultExperience | null;
     public getXRCamera(): Camera | null;
     public isInSession(): boolean;
     public dispose(): void;
   }
   ```

2. **Create `src/ui/XRUIManager.ts`**: Button rendering and positioning
   ```typescript
   export interface XRUIConfig {
     enabled: boolean;
     position: "bottom-left" | "bottom-right" | "top-left" | "top-right";
     unavailableMessageDuration: number;
   }

   export class XRUIManager {
     private container: HTMLElement;
     private overlay: HTMLElement | null = null;
     private config: XRUIConfig;
     private onEnterVR?: () => void;
     private onEnterAR?: () => void;

     constructor(
       container: HTMLElement,
       vrAvailable: boolean,
       arAvailable: boolean,
       config: XRUIConfig,
       callbacks?: {
         onEnterVR?: () => void;
         onEnterAR?: () => void;
       }
     );

     private createOverlay(): void;
     private createButton(label: string, mode: "immersive-vr" | "immersive-ar"): HTMLButtonElement;
     private showUnavailableMessage(): void;
     public setSessionActive(active: boolean, mode?: "immersive-vr" | "immersive-ar"): void;
     public dispose(): void;
   }
   ```

3. **`stories/XR/SessionLifecycle.stories.ts`**: Interactive demos
   ```typescript
   import type { Meta, StoryObj } from "@storybook/web-components";
   import { html } from "lit";
   import "../../src/graphty-element";

   export default {
     title: "XR/Session Lifecycle",
     component: "graphty-element",
   } as Meta;

   export const BasicVRSession: StoryObj = {
     render: () => html`
       <graphty-element
         .data=${{
           nodes: [
             { id: "1", label: "Node 1" },
             { id: "2", label: "Node 2" },
             { id: "3", label: "Node 3" }
           ],
           edges: [
             { source: "1", target: "2" },
             { source: "2", target: "3" }
           ]
         }}
         .config=${{
           camera: { type: "orbit" },
           xr: {
             enabled: true,
             ui: { enabled: true, position: "bottom-right" }
           }
         }}
       ></graphty-element>
     `,
   };
   ```

**Dependencies**:
- External: BabylonJS WebXR (already installed)
- Internal: XRConfig.ts (exists)

**Verification**:
1. Run: `npm test -- xr/XRSessionManager`
2. Run: `npm test -- ui/XRUIManager`
3. Run: `npm run storybook`
4. Navigate to "XR/Session Lifecycle"
5. Click VR button → Should attempt to enter VR
6. See "NOT AVAILABLE" message on non-XR browsers

**Success Criteria**:
- [x] XRSessionManager handles session lifecycle
- [x] UI buttons render in correct position
- [x] Unavailable message shows when appropriate
- [x] Button clicks trigger session attempts
- [x] All Phase 1 tests pass

---

### Phase 2: Unified Drag System Foundation (2-3 days)

**Objective**: Replace `SixDofDragBehavior` with unified `NodeDragHandler` that works for both desktop and XR, solving VR Z-axis amplification issues.

**Status**: ❌ **NOT STARTED** (Currently using broken workarounds in SixDofDragBehavior)

**Critical**: This phase **must** be completed before XR controller integration. The current approach of hacking SixDofDragBehavior is unsustainable.

**Tests to Write First**:

1. **`test/NodeBehavior-unified-drag.test.ts`**: Core drag handler tests
   ```typescript
   import { describe, test, beforeEach } from "vitest";
   import { assert } from "chai";
   import { NodeDragHandler } from "../src/NodeBehavior";

   describe("Unified Drag Handler", () => {
     test("should handle desktop pointer down → move → up sequence", () => {
       // Create graph with test node
       // Simulate pointer events via scene.onPointerObservable
       // Verify dragState transitions: idle → dragging → idle
       // Verify mesh position updates
     });

     test("should set node.dragging flag during drag", () => {
       // Start drag
       // Verify node.dragging = true
       // End drag
       // Verify node.dragging = false
     });

     test("should update layout engine during drag", () => {
       // Mock layout engine
       // Drag node
       // Verify setNodePosition called with new position
     });

     test("should pin node after drag when configured", () => {
       // Set pinOnDrag = true
       // Perform drag
       // Verify node.pin() called
     });

     test("should NOT pin node when pinOnDrag is false", () => {
       // Set pinOnDrag = false
       // Perform drag
       // Verify node.pin() NOT called
     });

     test("should maintain consistent depth during horizontal drag", () => {
       // Desktop raycast strategy test
       // Drag horizontally (X-axis only)
       // Verify Z-coordinate remains stable
     });

     test("should maintain consistent depth during vertical drag", () => {
       // Drag vertically (Y-axis only)
       // Verify Z-coordinate remains stable
     });
   });
   ```

**Implementation**:

1. **`src/NodeBehavior.ts`**: Create unified drag handler
   ```typescript
   import { Scene, Vector3, Ray, Matrix, PointerEventTypes, PointerInfo } from "@babylonjs/core";
   import type { GraphNode } from "./Node";
   import type { GraphContext } from "./managers/GraphContext";

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
     private pointerObserver: Observer<PointerInfo> | null = null;

     constructor(node: GraphNode, options: NodeBehaviorOptions = {}) {
       this.node = node;
       this.scene = node.mesh.getScene();
       this.dragState = {
         dragging: false,
         dragStartMeshPosition: null,
         dragStartWorldPosition: null,
       };

       // Setup pointer event listeners
       this.setupPointerEvents();
     }

     // Public API for both desktop and XR
     public onDragStart(worldPosition: Vector3): void {
       this.dragState.dragging = true;
       this.dragState.dragStartMeshPosition = this.node.mesh.position.clone();
       this.dragState.dragStartWorldPosition = worldPosition.clone();
       this.node.dragging = true;

       // Make sure graph is running
       const context = this.getContext();
       context.setRunning(true);
     }

     public onDragUpdate(worldPosition: Vector3): void {
       if (!this.dragState.dragging) {
         return;
       }

       // Calculate delta from drag start
       const delta = worldPosition.subtract(this.dragState.dragStartWorldPosition!);

       // Calculate new position (NO Z-axis amplification here - that's in Phase 3)
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

     public onDragEnd(): void {
       if (!this.dragState.dragging) {
         return;
       }

       // Make sure graph is running
       const context = this.getContext();
       context.setRunning(true);

       // Pin after dragging if configured
       if (this.node.pinOnDrag) {
         this.node.pin();
       }

       // Reset drag state
       this.node.dragging = false;
       this.dragState.dragging = false;
       this.dragState.dragStartMeshPosition = null;
       this.dragState.dragStartWorldPosition = null;
     }

     // Internal methods
     private setupPointerEvents(): void {
       this.pointerObserver = this.scene.onPointerObservable.add((pointerInfo) => {
         switch (pointerInfo.type) {
           case PointerEventTypes.POINTERDOWN:
             if (pointerInfo.pickInfo?.pickedMesh === this.node.mesh) {
               // Get world position from pointer
               const ray = this.scene.createPickingRay(
                 this.scene.pointerX,
                 this.scene.pointerY,
                 Matrix.Identity(),
                 this.scene.activeCamera
               );
               const worldPosition = this.getWorldPositionFromRay(ray);
               this.onDragStart(worldPosition);
             }
             break;

           case PointerEventTypes.POINTERMOVE:
             if (this.dragState.dragging) {
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

           case PointerEventTypes.POINTERUP:
             if (this.dragState.dragging) {
               this.onDragEnd();
             }
             break;
         }
       });
     }

     private getWorldPositionFromRay(ray: Ray): Vector3 {
       // Strategy: Plane intersection parallel to camera view
       // This maintains predictable drag behavior
       const camera = this.scene.activeCamera;
       if (!camera) {
         return this.node.mesh.position.clone();
       }

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

     private getContext(): GraphContext {
       return this.node.mesh.metadata.context as GraphContext;
     }

     public dispose(): void {
       if (this.pointerObserver) {
         this.scene.onPointerObservable.remove(this.pointerObserver);
         this.pointerObserver = null;
       }
     }
   }

   // Update NodeBehavior class
   export class NodeBehavior {
     static addDefaultBehaviors(node: GraphNode, options: NodeBehaviorOptions = {}): void {
       node.mesh.isPickable = true;

       // Set pinOnDrag config
       node.pinOnDrag = options.pinOnDrag ?? true;

       // Create unified drag handler (replaces SixDofDragBehavior)
       const dragHandler = new NodeDragHandler(node, options);
       node.dragHandler = dragHandler;

       this.addClickBehavior(node); // Unchanged
     }
   }
   ```

2. **`src/Node.ts`**: Add dragHandler property
   ```typescript
   export class Node {
     public dragHandler?: NodeDragHandler; // Add this property
     // Remove: meshDragBehavior!: SixDofDragBehavior;
     // ... existing code ...
   }
   ```

**Dependencies**:
- External: BabylonJS core (already installed)
- Internal: Graph, Node, GraphContext interfaces

**Verification**:
1. Run: `npm test -- NodeBehavior-unified-drag`
2. Expected: All drag tests pass
3. Manual test: Open Storybook, drag nodes with mouse
4. Expected: Drag feels same as before (no regression)
5. Run: `npm run build`
6. Expected: No TypeScript errors

**Success Criteria**:
- [ ] Desktop pointer drag works without SixDofDragBehavior
- [ ] Drag state managed correctly (idle → dragging → idle)
- [ ] Layout engine receives position updates
- [ ] Pin-on-drag functionality works
- [ ] Depth remains stable during horizontal/vertical drag
- [ ] All existing node-behavior tests still pass
- [ ] **No SixDofDragBehavior code remains**

---

### Phase 3: XR Controller Integration with Z-Axis Amplification (2-3 days)

**Objective**: Route XR controller squeeze events to unified drag handler and implement configurable Z-axis amplification for VR.

**Status**: ⚠️ **PARTIALLY COMPLETE**
- ✅ XRInputController.ts exists but needs refactoring
- ❌ Controller squeeze → drag routing not implemented
- ❌ Z-axis amplification configuration not in XRConfig

**Tests to Write First**:

1. **`test/cameras/XRInputController-drag.test.ts`**: XR drag integration
   ```typescript
   describe("XRInputController Drag Integration", () => {
     test("should route controller squeeze to node drag handler", () => {
       // Mock XR controller with squeeze capability
       // Mock raycast hit on node
       // Simulate squeeze button press
       // Verify node.dragHandler.onDragStart called
     });

     test("should update drag position every frame while squeezing", () => {
       // Start drag
       // Call update() multiple times with different grip positions
       // Verify node.dragHandler.onDragUpdate called each frame
     });

     test("should end drag when squeeze released", () => {
       // Start drag
       // Release squeeze
       // Verify node.dragHandler.onDragEnd called
     });

     test("should handle controller without grip mesh", () => {
       // Mock controller without grip mesh
       // Start drag
       // Verify uses controller.pointer.position as fallback
     });
   });
   ```

2. **`test/NodeBehavior-z-axis-amplification.test.ts`**: Z-axis amplification tests
   ```typescript
   describe("Z-Axis Amplification", () => {
     test("should apply 10× Z-axis amplification in XR mode", () => {
       // Mock XR session active
       // Set config: zAxisAmplification = 10.0
       // Start drag at z=0
       // Move controller by deltaZ = 0.1
       // Verify mesh.position.z increased by 1.0 (10× amplification)
     });

     test("should NOT apply Z-axis amplification in desktop mode by default", () => {
       // Mock desktop mode (no XR session)
       // Start drag at z=0
       // Move by deltaZ = 0.1
       // Verify mesh.position.z increased by 0.1 (no amplification)
     });

     test("should apply Z-axis amplification in desktop when configured", () => {
       // Mock desktop mode
       // Set config: enableZAmplificationInDesktop = true
       // Set config: zAxisAmplification = 5.0
       // Verify Z-axis amplified by 5× in desktop
     });

     test("should NOT amplify X and Y axes", () => {
       // Mock XR mode with Z amplification enabled
       // Drag with deltaX=0.1, deltaY=0.1, deltaZ=0.1
       // Verify deltaX and deltaY are NOT amplified
       // Verify only deltaZ is amplified
     });
   });
   ```

**Implementation**:

1. **Update `src/config/XRConfig.ts`**: Add Z-axis amplification config
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
   };
   ```

2. **Update `src/NodeBehavior.ts`**: Add amplification to drag handler
   ```typescript
   export class NodeDragHandler {
     private readonly Z_AXIS_AMPLIFICATION: number;
     private readonly ENABLE_Z_AMPLIFICATION_IN_DESKTOP: boolean;

     constructor(node: GraphNode, options: NodeBehaviorOptions) {
       this.node = node;

       // Read config from graph context
       const context = this.getContext();
       const xrConfig = context.getXRConfig?.();

       this.Z_AXIS_AMPLIFICATION = xrConfig?.input.zAxisAmplification ?? 10.0;
       this.ENABLE_Z_AMPLIFICATION_IN_DESKTOP =
         xrConfig?.input.enableZAmplificationInDesktop ?? false;

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

3. **Update `src/cameras/XRInputController.ts`**: Add drag tracking
   ```typescript
   export class XRInputController implements InputHandler {
     private draggedNode: {
       node: GraphNode;
       controller: WebXRInputSource;
     } | null = null;

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

     private setupControllerDrag(controller: WebXRInputSource): void {
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

     public update(): void {
       if (!this.enabled || !this.draggedNode) {
         return;
       }

       // Update drag position every frame
       const controller = this.draggedNode.controller;
       const gripPosition = controller.grip?.position ?? controller.pointer.position;

       this.draggedNode.node.dragHandler.onDragUpdate(gripPosition.clone());
     }
   }
   ```

4. **Update `src/Node.ts`**: Add metadata for raycast
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

5. **`stories/XR/Interactions.stories.ts`**: Test drag in XR
   ```typescript
   export const DragInVR: StoryObj = {
     render: () => html`
       <graphty-element
         .data=${{
           nodes: [
             { id: "1", label: "Drag Me" },
             { id: "2", label: "Connected" }
           ],
           edges: [{ source: "1", target: "2" }]
         }}
         .config=${{
           layout: { type: "force", dimensions: 3 },
           xr: {
             enabled: true,
             input: {
               zAxisAmplification: 10.0
             }
           }
         }}
       ></graphty-element>
       <div style="position: absolute; top: 10px; left: 10px; color: white; background: rgba(0,0,0,0.7); padding: 10px;">
         <h3>VR Drag Test:</h3>
         <ul>
           <li>Enter VR mode</li>
           <li>Squeeze controller on node to grab</li>
           <li>Move controller to drag (10× Z-axis amplification)</li>
           <li>Release squeeze to drop</li>
           <li>Node should pin after drag</li>
         </ul>
       </div>
     `,
   };
   ```

**Dependencies**:
- External: None
- Internal: Phase 1 (XRSessionManager), Phase 2 (NodeDragHandler)

**Verification**:
1. Run: `npm test -- XRInputController-drag`
2. Run: `npm test -- NodeBehavior-z-axis-amplification`
3. Manual test in VR emulator or device:
   - Squeeze on node → drag starts
   - Move controller → node follows with amplified Z
   - Release → node pins
4. Run: `npm run build`

**Success Criteria**:
- [ ] Controller squeeze triggers drag start
- [ ] Node follows controller during squeeze
- [ ] Z-axis amplified 10× in VR by default
- [ ] No Z-axis amplification in desktop by default
- [ ] Configuration options work correctly
- [ ] X and Y axes NOT amplified
- [ ] Drag ends when squeeze released
- [ ] All tests pass

---

### Phase 4: Camera Architecture Integration (1-2 days)

**Objective**: Integrate XR into the existing `CameraManager` system, enabling seamless camera switching.

**Status**: ⚠️ **PARTIALLY COMPLETE**
- ✅ CameraManager.ts modified (need to verify changes)
- ❌ XRCameraController not created
- ❌ Camera switching integration incomplete

**Tests to Write First**:

1. **`test/cameras/XRCameraController.test.ts`**: CameraController interface compliance
   ```typescript
   describe("XRCameraController", () => {
     test("should implement CameraController interface", () => {
       const controller = new XRCameraController(mockSessionManager);
       assert.exists(controller.camera);
       assert.isFunction(controller.zoomToBoundingBox);
     });

     test("should return WebXRCamera from session manager", () => {
       const camera = controller.camera;
       assert.exists(camera);
     });

     test("should transfer position from previous camera", () => {
       const previousPos = new Vector3(5, 5, 5);
       controller.transferPositionFrom(previousPos);
       // Verify XR camera positioned correctly
     });
   });
   ```

2. **`test/integration/camera-switching.spec.ts`**: Camera switching flows
   ```typescript
   test("can switch from Orbit to XR and back", async () => {
     await page.goto("http://dev.ato.ms:9025/iframe.html?id=xr-camera-switching--orbit-to-xr");

     // Start with Orbit camera
     let activeCamera = await page.evaluate(() => {
       return (window as any).__graph.cameraManager.getActiveController().camera.name;
     });
     expect(activeCamera).toContain("orbit");

     // Switch to XR
     await page.click("[data-xr-mode='immersive-vr']");
     await page.waitForTimeout(500);

     activeCamera = await page.evaluate(() => {
       return (window as any).__graph.cameraManager.getActiveController().camera.name;
     });
     expect(activeCamera).toContain("xr");

     // Exit XR
     await page.click("[data-xr-exit]");
     await page.waitForTimeout(500);

     activeCamera = await page.evaluate(() => {
       return (window as any).__graph.cameraManager.getActiveController().camera.name;
     });
     expect(activeCamera).toContain("orbit");
   });
   ```

**Implementation**:

1. **Create `src/cameras/XRCameraController.ts`**: Wrapper for WebXRCamera
   ```typescript
   import { Camera, Vector3 } from "@babylonjs/core";
   import type { CameraController } from "./CameraManager";
   import type { XRSessionManager } from "../xr/XRSessionManager";

   export class XRCameraController implements CameraController {
     private sessionManager: XRSessionManager;

     constructor(sessionManager: XRSessionManager) {
       this.sessionManager = sessionManager;
     }

     public get camera(): Camera {
       const xrCamera = this.sessionManager.getXRCamera();
       if (!xrCamera) {
         throw new Error("XRCameraController: XR session not active");
       }
       return xrCamera;
     }

     public zoomToBoundingBox(min: Vector3, max: Vector3): void {
       // In XR, we can't move the camera directly (user controls it)
       // Future: Implement teleportation or root transform adjustment
       console.warn("zoomToBoundingBox in XR mode: Feature not yet implemented");
     }

     public transferPositionFrom(previousCamera: Camera): void {
       // Transfer camera position from non-XR to XR
       // This is used when entering AR mode
       const xrCamera = this.camera;
       xrCamera.position.copyFrom(previousCamera.position);
       xrCamera.rotation.copyFrom(previousCamera.rotation);
     }

     public dispose(): void {
       // No direct disposal needed (managed by XRSessionManager)
     }
   }
   ```

2. **Update `src/cameras/CameraManager.ts`**: Add XR camera type
   ```typescript
   // Modify CameraKey type
   export type CameraKey = "orbit" | "2d" | "xr";

   // CameraManager class remains unchanged (uses existing registration pattern)
   ```

3. **Update `src/graph/Graph.ts`**: Integrate with CameraManager
   ```typescript
   import { XRCameraController } from "../cameras/XRCameraController";
   import { XRInputController } from "../cameras/XRInputController";

   private xrSessionManager: XRSessionManager | null = null;
   private xrUIManager: XRUIManager | null = null;
   private xrCameraController: XRCameraController | null = null;
   private xrInputController: XRInputController | null = null;
   private previousCameraKey: CameraKey = "orbit";

   private initializeXR(): void {
     const xrConfig = this.config.xr;

     // Create XR session manager
     this.xrSessionManager = new XRSessionManager(this.scene, {
       vr: xrConfig.vr,
       ar: xrConfig.ar
     });

     // Create XR camera and input controllers
     this.xrCameraController = new XRCameraController(this.xrSessionManager);
     this.xrInputController = new XRInputController(
       this.scene,
       this.xrSessionManager,
       xrConfig.input
     );

     // Register with CameraManager
     this.cameraManager.registerCamera("xr", this.xrCameraController, this.xrInputController);

     // Create UI manager
     const vrAvailable = this.xrSessionManager.isXRSupported() && xrConfig.vr.enabled;
     const arAvailable = this.xrSessionManager.isXRSupported() && xrConfig.ar.enabled;

     this.xrUIManager = new XRUIManager(
       this.canvasContainer,
       vrAvailable,
       arAvailable,
       xrConfig.ui,
       {
         onEnterVR: () => this.enterXR("immersive-vr"),
         onEnterAR: () => this.enterXR("immersive-ar"),
       }
     );
   }

   public async enterXR(mode: "immersive-vr" | "immersive-ar"): Promise<void> {
     // Store current camera for restoration
     this.previousCameraKey = this.cameraManager.getActiveKey();
     const previousCamera = this.cameraManager.getActiveController()?.camera;

     // Enter XR session
     if (mode === "immersive-vr") {
       await this.xrSessionManager.enterVR(previousCamera);
     } else {
       await this.xrSessionManager.enterAR(previousCamera);
     }

     // Activate XR camera
     this.cameraManager.activateCamera("xr");

     // Update UI button state
     this.xrUIManager?.setSessionActive(true, mode);
   }

   public async exitXR(): Promise<void> {
     // Exit XR session
     await this.xrSessionManager.exitXR();

     // Restore previous camera
     this.cameraManager.activateCamera(this.previousCameraKey);

     // Update UI button state
     this.xrUIManager?.setSessionActive(false);
   }
   ```

4. **Add GraphContext methods**:
   ```typescript
   export interface GraphContext {
     // ... existing methods ...
     getXRConfig?(): XRConfig | undefined;
     getXRSessionManager?(): XRSessionManager | undefined;
   }

   export class Graph implements GraphContext {
     // ... existing code ...

     public getXRConfig(): XRConfig | undefined {
       return this.config.xr;
     }

     public getXRSessionManager(): XRSessionManager | undefined {
       return this.xrSessionManager ?? undefined;
     }
   }
   ```

**Dependencies**:
- External: None
- Internal: Phase 1 (XRSessionManager, XRUIManager), Phase 2-3 (drag system)

**Verification**:
1. Run: `npm test -- cameras/XRCameraController`
2. Run: `npm test -- camera-switching`
3. Manual test: Switch from Orbit → VR → Orbit
4. Manual test: Switch from 2D → AR → 2D
5. Verify camera position preserved

**Success Criteria**:
- [ ] XRCameraController implements CameraController interface
- [ ] Camera switching works seamlessly
- [ ] Previous camera restored on XR exit
- [ ] Position transfer works for AR mode
- [ ] All camera switching tests pass

---

### Phase 5: Advanced Gestures and Configuration (2-3 days)

**Objective**: Enable zoom, pan, and rotate operations using advanced XR gestures. Expose full configuration via Zod schema.

**Status**: ❌ **NOT STARTED**

**Tests to Write First**:

1. **`test/cameras/XRGestureDetector.test.ts`**: Gesture detection logic
   ```typescript
   describe("XRGestureDetector", () => {
     test("should detect two-hand pinch zoom", () => {
       const detector = new XRGestureDetector();
       const leftHand = { position: new Vector3(0, 0, 0), pinching: true };
       const rightHand = { position: new Vector3(1, 0, 0), pinching: true };

       detector.updateHands(leftHand, rightHand);

       // Move hands closer together
       leftHand.position.x = 0.2;
       rightHand.position.x = 0.8;
       detector.updateHands(leftHand, rightHand);

       const gesture = detector.getCurrentGesture();
       assert.equal(gesture.type, "zoom");
       assert.isAbove(gesture.zoomDelta, 0); // Zoom in
     });

     test("should detect two-hand twist rotation", () => {
       // Test rotation detection
     });

     test("should handle thumbstick pan input", () => {
       const thumbstickX = 0.5;
       const thumbstickY = 0.5;

       const panDelta = detector.calculatePanFromThumbstick(thumbstickX, thumbstickY);
       assert.isAbove(panDelta.x, 0);
       assert.isAbove(panDelta.y, 0);
     });
   });
   ```

2. **`test/config/xr-config.test.ts`**: Configuration validation
   ```typescript
   describe("XR Configuration Schema", () => {
     test("should accept valid minimal config", () => {
       const config = { enabled: true };
       const result = xrConfigSchema.safeParse(config);
       assert.isTrue(result.success);
     });

     test("should apply defaults for missing fields", () => {
       const config = { enabled: true };
       const parsed = xrConfigSchema.parse(config);

       assert.equal(parsed.ui.position, "bottom-right");
       assert.equal(parsed.input.zAxisAmplification, 10.0);
     });

     test("should validate zAxisAmplification range", () => {
       const config = { input: { zAxisAmplification: -5 } };
       const result = xrConfigSchema.safeParse(config);
       assert.isFalse(result.success); // Negative amplification invalid
     });
   });
   ```

**Implementation**:

1. **Create `src/cameras/XRGestureDetector.ts`**: Gesture recognition
   ```typescript
   import { Vector3, Quaternion } from "@babylonjs/core";

   export interface HandState {
     position: Vector3;
     rotation: Quaternion;
     pinching: boolean;
     pinchStrength: number;
   }

   export interface GestureResult {
     type: "none" | "zoom" | "rotate" | "pan";
     zoomDelta?: number;
     rotationAxis?: Vector3;
     rotationAngle?: number;
     panDelta?: Vector3;
   }

   export class XRGestureDetector {
     private previousLeftHand: HandState | null = null;
     private previousRightHand: HandState | null = null;
     private previousDistance: number | null = null;
     private previousAngle: number | null = null;

     public updateHands(
       leftHand: HandState | null,
       rightHand: HandState | null
     ): void {
       this.previousLeftHand = leftHand;
       this.previousRightHand = rightHand;

       if (leftHand && rightHand) {
         const distance = Vector3.Distance(leftHand.position, rightHand.position);
         this.previousDistance = distance;

         const direction = rightHand.position.subtract(leftHand.position);
         const angle = Math.atan2(direction.y, direction.x);
         this.previousAngle = angle;
       }
     }

     public getCurrentGesture(): GestureResult {
       const left = this.previousLeftHand;
       const right = this.previousRightHand;

       if (!left || !right || !left.pinching || !right.pinching) {
         return { type: "none" };
       }

       // Detect pinch zoom
       const currentDistance = Vector3.Distance(left.position, right.position);
       if (this.previousDistance !== null) {
         const distanceDelta = currentDistance - this.previousDistance;
         if (Math.abs(distanceDelta) > 0.01) {
           return {
             type: "zoom",
             zoomDelta: distanceDelta > 0 ? 1.1 : 0.9,
           };
         }
       }

       // Detect twist rotation
       const direction = right.position.subtract(left.position);
       const currentAngle = Math.atan2(direction.y, direction.x);
       if (this.previousAngle !== null) {
         const angleDelta = currentAngle - this.previousAngle;
         if (Math.abs(angleDelta) > 0.05) {
           return {
             type: "rotate",
             rotationAxis: Vector3.Up(),
             rotationAngle: angleDelta,
           };
         }
       }

       return { type: "none" };
     }

     public calculatePanFromThumbstick(x: number, y: number): Vector3 {
       const sensitivity = 0.1;
       return new Vector3(x * sensitivity, y * sensitivity, 0);
     }
   }
   ```

2. **Update `src/cameras/XRInputController.ts`**: Integrate gestures
   ```typescript
   import { XRGestureDetector } from "./XRGestureDetector";
   import { Space } from "@babylonjs/core";

   export class XRInputController implements InputHandler {
     private gestureDetector: XRGestureDetector;

     constructor(/* ... */) {
       // ... existing initialization ...
       this.gestureDetector = new XRGestureDetector();
     }

     public update(): void {
       if (!this.enabled) {
         return;
       }

       // Update drag if active
       if (this.draggedNode) {
         const controller = this.draggedNode.controller;
         const gripPosition = controller.grip?.position ?? controller.pointer.position;
         this.draggedNode.node.dragHandler.onDragUpdate(gripPosition.clone());
         return; // Don't process gestures while dragging
       }

       // Update hand states
       const leftHand = this.getHandState("left");
       const rightHand = this.getHandState("right");
       this.gestureDetector.updateHands(leftHand, rightHand);

       // Process current gesture
       const gesture = this.gestureDetector.getCurrentGesture();
       switch (gesture.type) {
         case "zoom":
           this.handleZoom(gesture.zoomDelta!);
           break;
         case "rotate":
           this.handleRotate(gesture.rotationAxis!, gesture.rotationAngle!);
           break;
       }

       // Process thumbstick input from controllers
       this.processThumbstickInput();
     }

     private handleZoom(scaleFactor: number): void {
       // Scale the graph's root transform
       const graph = this.scene.getTransformNodeByName("graph-root");
       if (graph) {
         graph.scaling.scaleInPlace(scaleFactor);
       }
     }

     private handleRotate(axis: Vector3, angle: number): void {
       const graph = this.scene.getTransformNodeByName("graph-root");
       if (graph) {
         graph.rotate(axis, angle, Space.WORLD);
       }
     }

     private handlePan(delta: Vector3): void {
       const graph = this.scene.getTransformNodeByName("graph-root");
       if (graph) {
         graph.position.addInPlace(delta);
       }
     }

     private processThumbstickInput(): void {
       this.inputSources.forEach(inputSource => {
         const controller = inputSource.motionController;
         if (!controller) return;

         const thumbstick = controller.getComponent("xr-standard-thumbstick");
         if (thumbstick?.axes) {
           const [x, y] = thumbstick.axes.getValue();
           const panDelta = this.gestureDetector.calculatePanFromThumbstick(x, y);
           this.handlePan(panDelta);
         }
       });
     }

     private getHandState(handedness: "left" | "right"): HandState | null {
       // Get hand state from XR input sources
       // Return null if no hand tracked
       return null; // Implementation depends on BabylonJS hand tracking API
     }
   }
   ```

3. **Create `src/config/xr-config-schema.ts`**: Zod schema
   ```typescript
   import { z } from "zod";

   export const xrConfigSchema = z.object({
     enabled: z.boolean().default(true),

     ui: z.object({
       enabled: z.boolean().default(true),
       position: z.enum(["bottom-left", "bottom-right", "top-left", "top-right"])
         .default("bottom-right"),
       unavailableMessageDuration: z.number().positive().default(5000),
     }).default({}),

     vr: z.object({
       enabled: z.boolean().default(true),
       referenceSpaceType: z.enum([
         "local", "local-floor", "bounded-floor", "unbounded"
       ]).default("local-floor"),
       optionalFeatures: z.array(z.string()).default([]),
     }).default({}),

     ar: z.object({
       enabled: z.boolean().default(true),
       referenceSpaceType: z.enum([
         "local", "local-floor", "bounded-floor", "unbounded"
       ]).default("local-floor"),
       optionalFeatures: z.array(z.string()).default(["hit-test"]),
     }).default({}),

     input: z.object({
       handTracking: z.boolean().default(true),
       controllers: z.boolean().default(true),
       nearInteraction: z.boolean().default(true),
       physics: z.boolean().default(false),
       zAxisAmplification: z.number().positive().default(10.0),
       enableZAmplificationInDesktop: z.boolean().default(false),
     }).default({}),

     teleportation: z.object({
       enabled: z.boolean().default(false),
       easeTime: z.number().positive().default(200),
     }).default({}),
   }).default({});

   export type XRConfig = z.infer<typeof xrConfigSchema>;
   ```

4. **`stories/XR/AdvancedGestures.stories.ts`**: Gesture demos
   ```typescript
   export const TwoHandGestures: StoryObj = {
     render: () => html`
       <graphty-element
         .data=${largeGraphData}
         .config=${{
           layout: { type: "force", dimensions: 3 },
           xr: {
             enabled: true,
             input: {
               handTracking: true,
               controllers: true,
               zAxisAmplification: 10.0
             }
           }
         }}
       ></graphty-element>
       <div style="position: absolute; top: 10px; left: 10px; color: white; background: rgba(0,0,0,0.7); padding: 10px;">
         <h3>Advanced Gestures:</h3>
         <ul>
           <li><strong>Two-Hand Pinch:</strong> Zoom in/out</li>
           <li><strong>Two-Hand Twist:</strong> Rotate graph</li>
           <li><strong>Thumbstick:</strong> Pan around</li>
           <li><strong>Squeeze:</strong> Drag nodes (10× Z-axis)</li>
         </ul>
       </div>
     `,
   };
   ```

**Dependencies**:
- External: Zod (already in project)
- Internal: All previous phases

**Verification**:
1. Run: `npm test -- XRGestureDetector`
2. Run: `npm test -- xr-config`
3. Manual test in VR: Two-hand gestures work
4. Manual test: Configuration validation works

**Success Criteria**:
- [ ] Two-hand pinch zoom works
- [ ] Two-hand twist rotation works
- [ ] Thumbstick pan works
- [ ] Configuration schema validates correctly
- [ ] All gesture tests pass

---

### Phase 6: Testing, Documentation, and Production Readiness (3-4 days)

**Objective**: Achieve production quality through comprehensive testing, documentation, and performance optimization.

**Status**: ❌ **NOT STARTED**

**Tests to Complete**:

1. **Comprehensive unit test coverage** (`>80%`):
   - Complete all unit tests from previous phases
   - Add edge case tests
   - Memory leak tests

2. **`test/integration/xr-full-flow.spec.ts`**: End-to-end XR flows
   ```typescript
   test("complete VR session lifecycle with interactions", async () => {
     const browser = await chromium.launch();
     const page = await browser.newPage();

     // Setup IWER
     await setupIWER(page, "metaQuest3");

     // Navigate to full-featured story
     await page.goto("http://dev.ato.ms:9025/iframe.html?id=xr-full-flow--complete");

     // Enter VR
     await page.click("[data-xr-mode='immersive-vr']");
     await page.waitForTimeout(1000);

     // Perform all interactions:
     // - Select node
     // - Drag node (verify 10× Z-axis)
     // - Zoom with two hands
     // - Rotate with twist
     // - Pan with thumbstick

     // Exit VR
     await page.click("[data-xr-exit]");

     // Verify graph state preserved
     const nodePositions = await page.evaluate(() => {
       return (window as any).__graph.getNodePositions();
     });
     expect(nodePositions).toBeDefined();

     await browser.close();
   });
   ```

3. **`test/performance/xr-performance.spec.ts`**: Performance benchmarks
   ```typescript
   test("maintains 90 FPS in VR mode with 100 nodes", async () => {
     await page.goto("http://dev.ato.ms:9025/iframe.html?id=xr-performance--medium-graph");

     await page.click("[data-xr-mode='immersive-vr']");
     await page.waitForTimeout(2000);

     const fps = await page.evaluate(() => {
       return (window as any).__graph.statsManager.getAverageFPS();
     });

     expect(fps).toBeGreaterThan(90);
   });
   ```

**Documentation**:

1. **Update `CLAUDE.md`**: Complete XR documentation
   - Basic usage examples
   - Full configuration reference
   - Programmatic control API
   - XR events
   - Testing with IWER
   - Device compatibility
   - Troubleshooting guide

2. **JSDoc comments** in all XR classes

3. **Storybook documentation pages**:
   - "XR/Getting Started"
   - "XR/Configuration Guide"
   - "XR/Interactions Reference"
   - "XR/Testing Guide"

**Performance Optimization**:

1. Frame rate monitoring
2. Mesh instancing verification
3. Memory management
4. Mobile XR optimizations

**Dependencies**:
- External: IWER for testing
- Internal: All previous phases complete

**Verification**:
1. Run: `npm run test:all` (>80% coverage)
2. Run: `npm run lint` (no errors)
3. Run: `npm run build` (clean build)
4. Run: `npm run storybook` (all stories work)
5. Manual testing on Meta Quest

**Success Criteria**:
- [ ] Test coverage >80%
- [ ] All visual regression tests pass
- [ ] Documentation complete
- [ ] Performance meets targets (90 FPS VR)
- [ ] Manual testing successful on real device
- [ ] `npm run ready:commit` passes

---

## Common Utilities and Helpers

### Key Utilities Created

1. **`src/xr/XRSessionManager.ts`**: Session lifecycle management
2. **`src/ui/XRUIManager.ts`**: UI button rendering
3. **`src/cameras/XRGestureDetector.ts`**: Gesture recognition
4. **`src/cameras/XRCameraController.ts`**: Camera controller wrapper
5. **`src/cameras/XRInputController.ts`**: Input coordination
6. **`src/NodeBehavior.ts` (NodeDragHandler)**: Unified drag system

### External Libraries

1. **BabylonJS WebXR Features** (already included) - All WebXR functionality
2. **IWER** (Meta's XR emulator) - Automated XR testing
   ```bash
   npm install iwer --save-dev
   ```

---

## Risk Mitigation Strategies

### Risk: Performance Issues on Mobile XR
**Mitigation**: Profile early on Quest, monitor FPS, document limits

### Risk: Apple Vision Pro AR Not Supported
**Mitigation**: Detect AR support, show only VR button on Vision Pro

### Risk: Hand Tracking Reliability
**Mitigation**: Support both hands and controllers, optional hand tracking

### Risk: Testing Coverage Limitations
**Mitigation**: Use IWER for CI/CD, comprehensive unit tests, manual protocol

### Risk: Breaking Changes to Existing Code
**Mitigation**: Follow existing patterns, isolate XR code, extensive integration tests

---

## Success Metrics

**Phase Completion Criteria**:
- ✅ Each phase delivers working, user-testable functionality
- ✅ All tests pass for completed phases
- ✅ No regressions in existing features

**Final Success Criteria**:
- [ ] All 6 phases complete
- [ ] Test coverage >80%
- [ ] All visual regression tests pass
- [ ] Documentation complete
- [ ] Performance benchmarks met (90 FPS VR)
- [ ] Manual testing on Meta Quest successful
- [ ] No breaking changes
- [ ] `npm run ready:commit` passes

---

## Timeline Summary

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| **Phase 1** | 2-3 days | XR session lifecycle and UI buttons |
| **Phase 2** | 2-3 days | Unified drag system (desktop + XR) |
| **Phase 3** | 2-3 days | XR controller integration + Z-axis amplification |
| **Phase 4** | 1-2 days | Camera architecture integration |
| **Phase 5** | 2-3 days | Advanced gestures and configuration |
| **Phase 6** | 3-4 days | Testing, docs, production readiness |
| **Total** | **12-16 days** | Production-ready XR feature |

---

## Post-Implementation: Future Enhancements

### Short-term (Next 3-6 months)
- Teleportation system for large graph navigation
- XR-specific UI overlays
- Comfort options (snap turning, vignetting)
- Hit-test support for AR placement

### Medium-term (6-12 months)
- Multi-user collaborative XR sessions
- XR-optimized graph layouts
- Level of Detail (LOD) for large graphs
- Passthrough mode mixing

### Long-term (12+ months)
- Spatial audio for navigation
- XR recording/replay
- AI-assisted XR navigation
- Cross-platform XR multiplayer

---

## Conclusion

This unified implementation plan delivers a complete XR experience that:

✅ Solves VR Z-axis amplification issues with unified drag handler
✅ Follows established architectural patterns (CameraController, InputHandler)
✅ Delivers incrementally across 6 well-tested phases
✅ Achieves >80% test coverage
✅ Maintains backward compatibility
✅ Supports all major XR platforms
✅ Provides flexible configuration
✅ Enables future enhancements

**Critical Decision**: Replace `SixDofDragBehavior` with `NodeDragHandler` to solve the Z-axis amplification problem while creating a cleaner, more maintainable architecture.

Each phase builds on the previous, with clear verification steps and user-testable deliverables.

---

**Document Version**: 1.0
**Created**: 2025-11-18
**Status**: Ready for Implementation
**Next Phase**: Phase 2 (Unified Drag System)
