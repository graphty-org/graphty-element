# Implementation Plan for XR (VR/AR) Camera and Controls

## Overview

This implementation plan transforms the existing monolithic XR implementation (`src/xr-button.ts`) into a clean, modular architecture that follows the established `CameraController` and `InputHandler` patterns. The implementation will enable users to experience graph visualizations in immersive VR and AR environments using Meta Quest, Apple Vision Pro, and Android XR devices.

**Key Objectives**:
- Refactor XR code to match existing camera architecture patterns
- Support VR and AR modes with configurable UI
- Enable interactions (select, drag, zoom, pan, rotate) via controllers and hand tracking
- Maintain backward compatibility and stateless design principles
- Achieve >80% test coverage with comprehensive automated testing

**Total Estimated Duration**: 9-15 days across 6 phases

---

## Phase Breakdown

### Phase 1: XR Session Management and UI Foundation (2-3 days)

**Objective**: Establish core XR session lifecycle and UI button system, enabling users to enter/exit XR modes.

**Duration**: 2-3 days

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
       // Mock navigator.xr as undefined
       assert.isFalse(manager.isXRSupported());
     });

     test("should handle VR session initialization (mocked)", async () => {
       // Mock WebXR availability
       // Verify session state transitions
     });

     test("should handle AR session initialization (mocked)", async () => {
       // Test AR-specific initialization
     });

     test("should cleanup resources on session end", async () => {
       // Verify proper disposal
     });

     test("should transfer camera position in AR mode", async () => {
       // Test camera position transfer logic
     });
   });
   ```

2. **`test/ui/XRUIManager.test.ts`**: UI button rendering and behavior
   ```typescript
   import { describe, test, beforeEach, afterEach } from "vitest";
   import { assert } from "chai";
   import { XRUIManager } from "../../src/ui/XRUIManager";

   describe("XRUIManager", () => {
     let container: HTMLElement;
     let uiManager: XRUIManager;

     beforeEach(() => {
       container = document.createElement("div");
       document.body.appendChild(container);
     });

     afterEach(() => {
       uiManager?.dispose();
       container.remove();
     });

     test("should render unavailable message when XR not supported", () => {
       uiManager = new XRUIManager(container, false, false, {
         enabled: true,
         position: "bottom-left",
         unavailableMessageDuration: 5000
       });

       const message = container.querySelector(".webxr-not-available");
       assert.exists(message);
       assert.include(message?.textContent, "NOT AVAILABLE");
     });

     test("should render VR and AR buttons when available", () => {
       uiManager = new XRUIManager(container, true, true, {
         enabled: true,
         position: "bottom-left"
       });

       const vrButton = container.querySelector("[data-xr-mode='immersive-vr']");
       const arButton = container.querySelector("[data-xr-mode='immersive-ar']");
       assert.exists(vrButton);
       assert.exists(arButton);
     });

     test("should position buttons according to config", () => {
       uiManager = new XRUIManager(container, true, true, {
         enabled: true,
         position: "top-right"
       });

       const overlay = container.querySelector(".xr-button-overlay");
       const styles = window.getComputedStyle(overlay as Element);
       assert.include(styles.cssText, "top");
       assert.include(styles.cssText, "right");
     });

     test("should remove unavailable message after timeout", async () => {
       // Test message auto-removal after 5 seconds
     });
   });
   ```

3. **`test/visual/xr-ui.spec.ts`**: Visual regression tests for UI
   ```typescript
   import { test, expect } from "vitest";
   import { page } from "@vitest/browser/context";

   test("XR buttons render in bottom-left corner", async () => {
     await page.goto("http://dev.ato.ms:9025/iframe.html?id=xr-ui--default");
     await page.waitForSelector(".xr-button-overlay");

     const screenshot = await page.screenshot();
     expect(screenshot).toMatchSnapshot("xr-buttons-bottom-left.png");
   });

   test("unavailable message displays correctly", async () => {
     await page.goto("http://dev.ato.ms:9025/iframe.html?id=xr-ui--unavailable");

     const message = page.locator(".webxr-not-available");
     await expect(message).toBeVisible();

     const screenshot = await page.screenshot();
     expect(screenshot).toMatchSnapshot("xr-unavailable.png");
   });
   ```

**Implementation**:

1. **`src/xr/XRSessionManager.ts`**: Core session lifecycle management
   ```typescript
   import { Scene, WebXRDefaultExperience, Camera } from "@babylonjs/core";

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

     constructor(scene: Scene, config: XRSessionConfig) {
       this.scene = scene;
       this.config = config;
     }

     public isXRSupported(): boolean {
       return !!navigator.xr;
     }

     public async enterVR(previousCamera?: Camera): Promise<void> {
       // Initialize WebXR with VR mode
       // Transfer camera position if needed
       // Set activeMode
     }

     public async enterAR(previousCamera?: Camera): Promise<void> {
       // Initialize WebXR with AR mode
       // Always transfer camera position for AR
       // Set activeMode
     }

     public async exitXR(): Promise<void> {
       // Cleanup XR session
       // Reset activeMode
     }

     public getXRCamera(): Camera | null {
       return this.xrHelper?.baseExperience.camera ?? null;
     }

     public dispose(): void {
       // Cleanup all XR resources
     }
   }
   ```

2. **`src/ui/XRUIManager.ts`**: Button rendering and positioning
   ```typescript
   export interface XRUIConfig {
     enabled: boolean;
     position: "bottom-left" | "bottom-right" | "top-left" | "top-right";
     customStyles?: string;
     unavailableMessageDuration: number;
   }

   export class XRUIManager {
     private container: HTMLElement;
     private overlay: HTMLElement | null = null;
     private config: XRUIConfig;

     constructor(
       container: HTMLElement,
       vrAvailable: boolean,
       arAvailable: boolean,
       config: XRUIConfig
     ) {
       this.container = container;
       this.config = config;

       if (!config.enabled) return;

       this.createOverlay();

       if (!vrAvailable && !arAvailable) {
         this.showUnavailableMessage();
       } else {
         if (vrAvailable) this.createButton("VR", "immersive-vr");
         if (arAvailable) this.createButton("AR", "immersive-ar");
       }
     }

     private createOverlay(): void {
       // Create positioned overlay container
     }

     private createButton(label: string, mode: XRSessionMode): HTMLButtonElement {
       // Create styled button element
       // Extract and refactor from xr-button.ts
     }

     private showUnavailableMessage(): void {
       // Show message with auto-removal timeout
     }

     public dispose(): void {
       this.overlay?.remove();
     }
   }
   ```

3. **`stories/XR/SessionLifecycle.stories.ts`**: Interactive Storybook story
   ```typescript
   import type { Meta, StoryObj } from "@storybook/web-components";
   import { html } from "lit";
   import "../../src/graphty-element";

   const meta: Meta = {
     title: "XR/Session Lifecycle",
     component: "graphty-element",
   };

   export default meta;

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
             ui: { enabled: true, position: "bottom-left" }
           }
         }}
       ></graphty-element>
     `,
   };

   export const ARSession: StoryObj = {
     render: () => html`
       <!-- Similar but highlights AR mode -->
     `,
   };

   export const XRUnavailable: StoryObj = {
     render: () => html`
       <!-- Shows unavailable message (for non-XR browsers) -->
     `,
   };
   ```

4. **Integration in `src/graph/Graph.ts`**:
   ```typescript
   // In Graph class constructor or initialization
   import { XRSessionManager } from "../xr/XRSessionManager";
   import { XRUIManager } from "../ui/XRUIManager";

   private xrSessionManager: XRSessionManager | null = null;
   private xrUIManager: XRUIManager | null = null;

   private initializeXR(): void {
     const xrConfig = this.config.xr; // From config

     this.xrSessionManager = new XRSessionManager(this.scene, {
       vr: xrConfig.vr,
       ar: xrConfig.ar
     });

     const vrAvailable = this.xrSessionManager.isXRSupported() && xrConfig.vr.enabled;
     const arAvailable = this.xrSessionManager.isXRSupported() && xrConfig.ar.enabled;

     this.xrUIManager = new XRUIManager(
       this.canvasContainer,
       vrAvailable,
       arAvailable,
       xrConfig.ui
     );

     // Wire up button click handlers (done in XRUIManager or here)
   }
   ```

**Dependencies**:
- **External**: None (uses existing BabylonJS)
- **Internal**: Refactored code from `src/xr-button.ts`

**Verification**:
1. Run: `npm run storybook`
2. Navigate to "XR/Session Lifecycle" story
3. Expected: See VR/AR buttons in bottom-left corner (or "NOT AVAILABLE" message)
4. Click VR button: Enter VR mode (if device supports it, or use browser XR emulator)
5. Exit XR: Return to normal view
6. Run: `npm test -- xr`
7. Expected: All XR session and UI tests pass

**📝 Documentation Notes for Phase 1**:

> **IMPORTANT**: When updating documentation, include the following XR button styling customization information:

**XR Button Styling** follows web component best practices using CSS Custom Properties and `::part()` selectors:

1. **CSS Custom Properties** (14 available variables):
   - Button base: `--xr-button-font-family`, `--xr-button-font-size`, `--xr-button-font-weight`, `--xr-button-color`, `--xr-button-border-width`, `--xr-button-border-color`, `--xr-button-padding`, `--xr-button-margin-left`, `--xr-button-border-radius`
   - Available state: `--xr-available-bg` (default: black), `--xr-available-box-shadow`
   - Unavailable state: `--xr-unavailable-bg` (default: grey), `--xr-unavailable-box-shadow`
   - Presenting state: `--xr-presenting-bg` (default: red), `--xr-presenting-prefix` (default: "EXIT ")
   - Overlay: `--xr-overlay-gap`, `--xr-overlay-z-index`, `--xr-overlay-offset-vertical`, `--xr-overlay-offset-horizontal`

2. **::part() Selectors** (5 available parts):
   - `xr-overlay` - The button container overlay
   - `xr-button` - All XR buttons (common styles)
   - `xr-vr-button` - VR button specifically
   - `xr-ar-button` - AR button specifically
   - `xr-unavailable-message` - The "VR / AR NOT AVAILABLE" message

3. **Example Usage**:
   ```css
   /* Method 1: CSS Custom Properties (Recommended) */
   graphty-element {
     --xr-button-color: gold;
     --xr-button-border-color: gold;
     --xr-available-bg: purple;
   }

   /* Method 2: ::part() Selectors (Advanced) */
   graphty-element::part(xr-vr-button) {
     background: linear-gradient(45deg, purple, blue);
   }
   ```

4. **Default Styling**: Buttons use the original black background, white text, white border design. No inline styles are used - all styling is done via CSS classes and custom properties.

---

### Phase 2: XR Input System and Basic Interactions (2-3 days)

**Objective**: Enable users to select and drag nodes/edges using XR controllers or hand tracking, **leveraging existing `NodeBehavior.ts` functionality** to avoid code duplication.

**Duration**: 2-3 days

**Critical Architectural Decision**:

The existing `NodeBehavior.ts` provides:
- `SixDofDragBehavior` for 6-DOF node dragging
- Drag state management (`node.dragging`, `node.pinOnDrag`)
- Layout engine integration (`setNodePosition`)
- `ActionManager`-based click behaviors (double-click expansion)

**Strategy**: Test if `SixDofDragBehavior` works with XR inputs (it should, since BabylonJS WebXR emits pointer events). If it works, keep existing behaviors and only add XR-specific enhancements (multi-hand gestures, hand tracking). If it doesn't work, create XR-specific behavior that **reuses the same logic** from `NodeBehavior.ts`.

**Tests to Write First**:

1. **`test/NodeBehavior-xr-compatibility.test.ts`**: Verify existing behaviors work in XR
   ```typescript
   import { describe, test, beforeEach, afterEach } from "vitest";
   import { assert } from "chai";
   import { NullEngine, Scene, MeshBuilder, Vector3 } from "@babylonjs/core";
   import { NodeBehavior } from "../src/NodeBehavior";
   import { Node as GraphNode } from "../src/Node";

   describe("NodeBehavior XR Compatibility", () => {
     let engine: NullEngine;
     let scene: Scene;
     let node: GraphNode;

     beforeEach(() => {
       engine = new NullEngine();
       scene = new Scene(engine);
       // Create mock graph node
       node = createMockNode(scene);
     });

     afterEach(() => {
       scene.dispose();
       engine.dispose();
     });

     test("SixDofDragBehavior should be attachable in XR context", () => {
       NodeBehavior.addDefaultBehaviors(node);

       assert.exists(node.meshDragBehavior);
       assert.isTrue(node.mesh.isPickable);
     });

     test("drag behavior should set node.dragging flag", () => {
       NodeBehavior.addDefaultBehaviors(node);

       // Simulate drag start
       node.meshDragBehavior!.onDragStartObservable.notifyObservers({});
       assert.isTrue(node.dragging);

       // Simulate drag end
       node.meshDragBehavior!.onDragEndObservable.notifyObservers({});
       assert.isFalse(node.dragging);
     });

     test("pinOnDrag should be configurable", () => {
       NodeBehavior.addDefaultBehaviors(node, { pinOnDrag: false });
       assert.isFalse(node.pinOnDrag);

       NodeBehavior.addDefaultBehaviors(node, { pinOnDrag: true });
       assert.isTrue(node.pinOnDrag);
     });

     test("ActionManager should handle XR pointer events", () => {
       NodeBehavior.addDefaultBehaviors(node);

       assert.exists(node.mesh.actionManager);
       const actions = node.mesh.actionManager.actions;
       assert.isAbove(actions.length, 0);
       // Verify OnDoublePickTrigger is registered
     });
   });
   ```

2. **`test/cameras/XRInputController.test.ts`**: XR-specific input handling
   ```typescript
   import { describe, test, beforeEach, afterEach } from "vitest";
   import { assert } from "chai";
   import { NullEngine, Scene } from "@babylonjs/core";
   import { XRInputController } from "../../src/cameras/XRInputController";

   describe("XRInputController", () => {
     let engine: NullEngine;
     let scene: Scene;
     let inputController: XRInputController;

     beforeEach(() => {
       engine = new NullEngine();
       scene = new Scene(engine);
       // Create mock XR session manager
       inputController = new XRInputController(scene, mockXRSessionManager, {
         handTracking: true,
         controllers: true,
         nearInteraction: true,
         physics: false
       });
     });

     afterEach(() => {
       inputController.dispose();
       scene.dispose();
       engine.dispose();
     });

     test("should implement InputHandler interface", () => {
       assert.isFunction(inputController.enable);
       assert.isFunction(inputController.disable);
       assert.isFunction(inputController.update);
     });

     test("should NOT duplicate NodeBehavior drag logic", () => {
       // Verify XRInputController doesn't reimplement drag state
       // It should rely on SixDofDragBehavior or trigger it
       assert.notExists((inputController as any).handleDragState);
     });

     test("should track input sources on enable", () => {
       inputController.enable();
       // Verify input observables are subscribed
     });

     test("should enable hand tracking feature", () => {
       inputController.enable();
       // Verify BabylonJS hand tracking feature enabled
     });

     test("should work with existing node behaviors", () => {
       // Create node with NodeBehavior
       const node = createMockNodeWithBehaviors(scene);

       // XR input should trigger existing SixDofDragBehavior
       // Not create a parallel drag system
     });
   });
   ```

3. **`test/integration/xr-node-behaviors.spec.ts`**: Integration test with IWER
   ```typescript
   import { test, expect } from "vitest";
   import { chromium } from "playwright";

   test("SixDofDragBehavior works with XR controller input", async () => {
     const browser = await chromium.launch();
     const page = await browser.newPage();

     // Load IWER emulator
     await page.addScriptTag({
       url: "https://unpkg.com/iwer/build/iwer.min.js",
     });

     // Setup Meta Quest 3 emulation
     await page.evaluate(() => {
       const xrDevice = new (window as any).IWER.XRDevice(
         (window as any).IWER.metaQuest3
       );
       xrDevice.installRuntime();
       xrDevice.stereoEnabled = true;
     });

     // Navigate to story
     await page.goto("http://dev.ato.ms:9025/iframe.html?id=xr-interactions--node-behavior-test");

     // Enter VR mode
     await page.click("[data-xr-mode='immersive-vr']");
     await page.waitForTimeout(1000);

     // Get initial node position
     const initialPos = await page.evaluate(() => {
       const graph = (window as any).__graph;
       const node = graph.getNodes()[0];
       return { x: node.mesh.position.x, y: node.mesh.position.y, z: node.mesh.position.z };
     });

     // Simulate XR controller drag (using IWER)
     await page.evaluate(() => {
       // IWER API to simulate controller squeeze and movement
       // This should trigger the existing SixDofDragBehavior
     });

     // Verify node position changed AND node.dragging flag was set
     const result = await page.evaluate(() => {
       const graph = (window as any).__graph;
       const node = graph.getNodes()[0];
       return {
         positionChanged: node.mesh.position.x !== initialPos.x,
         dragFlagWasSet: node.__dragWasTriggered, // Test hook
         pinOnDrag: node.pinOnDrag,
       };
     });

     expect(result.positionChanged).toBe(true);
     expect(result.dragFlagWasSet).toBe(true);
     expect(result.pinOnDrag).toBe(true); // Default behavior

     await browser.close();
   });

   test("ActionManager double-click works in XR", async () => {
     // Test that existing ActionManager behaviors (double-click expansion)
     // work with XR pointer events
   });
   ```

**Implementation**:

1. **FIRST: Investigate if `SixDofDragBehavior` works with XR**

   Before implementing custom XR drag logic, test if the existing `SixDofDragBehavior` from `NodeBehavior.ts` already works with XR pointer events. BabylonJS WebXR should emit pointer events that trigger existing behaviors.

   **Test procedure**:
   - Create a simple XR story with nodes that have `NodeBehavior.addDefaultBehaviors()` called
   - Enter VR mode with IWER or real headset
   - Try to drag a node with controller squeeze
   - Check if `node.dragging` flag is set and position updates

   **Expected outcome**: `SixDofDragBehavior` should work automatically with XR inputs since BabylonJS handles pointer abstraction.

2. **`src/cameras/XRInputController.ts`**: Minimal XR input coordinator (NOT a reimplementation)
   ```typescript
   import { Scene, WebXRInputSource, Observer, WebXRDefaultExperience } from "@babylonjs/core";
   import type { XRSessionManager } from "../xr/XRSessionManager";
   import type { InputHandler } from "./CameraManager";

   export interface XRInputConfig {
     handTracking: boolean;
     controllers: boolean;
     nearInteraction: boolean;
     physics: boolean;
   }

   /**
    * XRInputController coordinates XR input sources and enables XR-specific features.
    *
    * IMPORTANT: This does NOT reimplement node dragging or selection.
    * NodeBehavior.ts (SixDofDragBehavior and ActionManager) handles those.
    *
    * This controller only:
    * 1. Enables hand tracking and controller features
    * 2. Adds XR-specific enhancements (future: multi-hand gestures)
    * 3. Ensures existing NodeBehavior works in XR mode
    */
   export class XRInputController implements InputHandler {
     private scene: Scene;
     private sessionManager: XRSessionManager;
     private config: XRInputConfig;
     private inputSources = new Map<string, WebXRInputSource>();
     private observers: Observer<any>[] = [];

     constructor(
       scene: Scene,
       sessionManager: XRSessionManager,
       config: XRInputConfig
     ) {
       this.scene = scene;
       this.sessionManager = sessionManager;
       this.config = config;
     }

     public enable(): void {
       // Subscribe to WebXR input observables
       const xrHelper = this.sessionManager.getXRHelper();
       if (!xrHelper) return;

       // Track input sources (for debugging and future features)
       const controllerObserver = xrHelper.input.onControllerAddedObservable.add(
         this.handleInputSourceAdded.bind(this)
       );
       this.observers.push(controllerObserver);

       const removeObserver = xrHelper.input.onControllerRemovedObservable.add(
         this.handleInputSourceRemoved.bind(this)
       );
       this.observers.push(removeObserver);

       // Enable hand tracking if configured
       if (this.config.handTracking) {
         this.enableHandTracking(xrHelper);
       }

       // Enable near interaction if configured
       if (this.config.nearInteraction) {
         this.enableNearInteraction(xrHelper);
       }

       // NOTE: We do NOT set up custom drag handlers here.
       // The existing SixDofDragBehavior on nodes handles dragging.
       // XR controllers emit pointer events that trigger it automatically.
     }

     public disable(): void {
       // Unsubscribe from observables
       this.observers.forEach(obs => obs.remove());
       this.observers = [];
       this.inputSources.clear();
     }

     public update(): void {
       // Called every frame
       // Reserved for future multi-hand gesture detection
       // NOT used for basic drag/selection (NodeBehavior handles that)
     }

     private handleInputSourceAdded(inputSource: WebXRInputSource): void {
       this.inputSources.set(inputSource.uniqueId, inputSource);

       console.log(`XR input source added: ${inputSource.handedness} ${inputSource.hand ? 'hand' : 'controller'}`);

       // Future: Add visual indicators for hands/controllers
       // Future: Setup multi-hand gesture detection
     }

     private handleInputSourceRemoved(inputSource: WebXRInputSource): void {
       this.inputSources.delete(inputSource.uniqueId);
       console.log(`XR input source removed: ${inputSource.handedness}`);
     }

     private enableHandTracking(xrHelper: WebXRDefaultExperience): void {
       // Enable BabylonJS hand tracking feature
       if (xrHelper.featuresManager.getEnabledFeature("hand-tracking")) {
         return; // Already enabled
       }

       const handTracking = xrHelper.featuresManager.enableFeature(
         WebXRFeatureName.HAND_TRACKING,
         "latest",
         {
           xrInput: xrHelper.input,
           jointMeshes: {
             enablePhysics: this.config.physics,
           },
         }
       );

       if (handTracking) {
         console.log("Hand tracking enabled");
       }
     }

     private enableNearInteraction(xrHelper: WebXRDefaultExperience): void {
       // Enable near interaction (touching nodes with hands)
       const nearInteraction = xrHelper.featuresManager.enableFeature(
         WebXRFeatureName.NEAR_INTERACTION,
         "latest",
         {
           xrInput: xrHelper.input,
           // Near interaction works with existing SixDofDragBehavior
           // No custom handlers needed
         }
       );

       if (nearInteraction) {
         console.log("Near interaction enabled");
       }
     }

     public dispose(): void {
       this.disable();
     }
   }
   ```

3. **`stories/XR/Interactions.stories.ts`**: Test existing NodeBehavior in XR
   ```typescript
   import type { Meta, StoryObj } from "@storybook/web-components";
   import { html } from "lit";

   export default {
     title: "XR/Interactions",
     component: "graphty-element",
   } as Meta;

   export const NodeBehaviorInXR: StoryObj = {
     render: () => html`
       <graphty-element
         .data=${{
           nodes: Array.from({ length: 10 }, (_, i) => ({
             id: `${i}`,
             label: `Node ${i}`,
           })),
           edges: Array.from({ length: 5 }, (_, i) => ({
             source: `${i}`,
             target: `${i + 1}`,
           }))
         }}
         .config=${{
           layout: { type: "random", dimensions: 3 },
           xr: {
             enabled: true,
             input: {
               handTracking: true,
               controllers: true,
               nearInteraction: true
             }
           }
         }}
       ></graphty-element>
       <div style="position: absolute; top: 10px; left: 10px; color: white; background: rgba(0,0,0,0.7); padding: 10px;">
         <h3>Testing NodeBehavior in XR:</h3>
         <ul>
           <li>Enter VR mode</li>
           <li><strong>Drag test:</strong> Squeeze controller and move to drag node</li>
           <li>Node should pin after dragging (pinOnDrag default)</li>
           <li><strong>Click test:</strong> Point and trigger to select</li>
           <li><strong>Double-click test:</strong> Double trigger to expand node (if fetchNodes configured)</li>
         </ul>
         <p><strong>Expected:</strong> All existing NodeBehavior features work in XR without modifications</p>
       </div>
     `,
   };

   export const HandTrackingInteraction: StoryObj = {
     render: () => html`
       <graphty-element .data=${...} .config=${{ xr: { input: { handTracking: true } } }}></graphty-element>
       <div style="...">
         <h3>Hand Tracking Test:</h3>
         <ul>
           <li>Use hand tracking mode (no controllers)</li>
           <li>Pinch to select nodes</li>
           <li>Near interaction: Touch nodes with hands</li>
         </ul>
       </div>
     `,
   };
   ```

4. **Integration in Graph.ts**:
   ```typescript
   // Add XRInputController to Graph initialization
   import { XRInputController } from "../cameras/XRInputController";

   private xrInputController: XRInputController | null = null;

   private initializeXR(): void {
     // ... existing session manager setup ...

     this.xrInputController = new XRInputController(
       this.scene,
       this.xrSessionManager,
       this.config.xr.input
     );

     // Enable when entering XR mode
     // Disable when exiting XR mode
   }

   // IMPORTANT: NodeBehavior.addDefaultBehaviors() should already be called
   // when nodes are created (this is existing functionality)
   // No changes needed to make it work with XR!
   ```

5. **Fallback Plan (if `SixDofDragBehavior` doesn't work with XR)**:

   If testing reveals that `SixDofDragBehavior` doesn't respond to XR pointer events, we'll need to create `XRNodeBehavior`:

   ```typescript
   // src/XRNodeBehavior.ts (ONLY if needed)
   import { NodeBehavior } from "./NodeBehavior";
   import type { Node as GraphNode } from "./Node";

   export class XRNodeBehavior {
     /**
      * Add XR-compatible behaviors to nodes
      * Reuses logic from NodeBehavior but with XR-specific triggers
      */
     static addXRBehaviors(node: GraphNode, options = {}): void {
       // Use same drag state management as NodeBehavior
       node.pinOnDrag = options.pinOnDrag ?? true;

       // Setup XR-specific drag handling that calls same logic
       // as NodeBehavior's SixDofDragBehavior observables
     }
   }
   ```

   This fallback ensures we don't duplicate logic even if we need XR-specific event handling.

**Dependencies**:
- **External**: None (uses BabylonJS WebXR features)
- **Internal**: Phase 1 (XRSessionManager), **existing `NodeBehavior.ts`**
- **Testing**: IWER library (`npm install iwer --save-dev`)

**Verification**:
1. Run: `npm run storybook`
2. Navigate to "XR/Interactions" → "NodeBehavior in XR"
3. Enter VR mode (click VR button or use browser XR emulator)
4. **Test drag**: Point controller at node, squeeze, and move
   - Expected: Node drags smoothly (same as non-XR)
   - Expected: Node is pinned after release (default behavior)
   - Expected: Layout engine receives position updates
5. **Test selection**: Point and pull trigger
   - Expected: Visual feedback (if implemented)
6. **Test double-click**: Double-trigger on node
   - Expected: Expansion behavior works (if fetchNodes configured)
7. **Test hand tracking**: Switch to hands (if device supports)
   - Expected: Pinch and near interaction work
8. Run: `npm test -- NodeBehavior-xr-compatibility`
   - Expected: All compatibility tests pass
9. Run: `npm test -- xr-node-behaviors`
   - Expected: Integration tests pass with IWER
10. **Critical verification**: Check that `node.dragging` flag is set during drag
    - This confirms we're using the same code path as non-XR

---

### Phase 3: Camera Architecture Integration (1-2 days)

**Objective**: Integrate XR into the existing `CameraManager` system, enabling seamless camera switching.

**Duration**: 1-2 days

**Tests to Write First**:

1. **`test/cameras/XRCameraController.test.ts`**: CameraController interface compliance
   ```typescript
   import { describe, test, beforeEach, afterEach } from "vitest";
   import { assert } from "chai";
   import { NullEngine, Scene, Vector3 } from "@babylonjs/core";
   import { XRCameraController } from "../../src/cameras/XRCameraController";

   describe("XRCameraController", () => {
     let engine: NullEngine;
     let scene: Scene;
     let controller: XRCameraController;

     beforeEach(() => {
       engine = new NullEngine();
       scene = new Scene(engine);
       // Mock XRSessionManager with XR camera
       controller = new XRCameraController(mockSessionManager);
     });

     afterEach(() => {
       controller.dispose();
       scene.dispose();
       engine.dispose();
     });

     test("should implement CameraController interface", () => {
       assert.exists(controller.camera);
       assert.isFunction(controller.zoomToBoundingBox);
     });

     test("should return WebXRCamera from session manager", () => {
       const camera = controller.camera;
       assert.exists(camera);
       // Verify it's the XR camera
     });

     test("should zoom to bounding box in XR space", () => {
       const min = new Vector3(-10, -10, -10);
       const max = new Vector3(10, 10, 10);

       controller.zoomToBoundingBox(min, max);

       // Verify camera position adjusted
       // XR camera position should encompass bounding box
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
   import { test, expect } from "vitest";
   import { page } from "@vitest/browser/context";

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

   test("camera position preserved when switching", async () => {
     // Test position continuity across switches
   });
   ```

**Implementation**:

1. **`src/cameras/XRCameraController.ts`**: Wrapper for WebXRCamera
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
       // Calculate bounding box center and size
       const center = min.add(max).scale(0.5);
       const size = max.subtract(min);
       const maxDimension = Math.max(size.x, size.y, size.z);

       // In XR, we can't move the camera directly (user controls it)
       // Instead, move the graph's root transform node
       // Or teleport the user's reference space

       // For now: Store target position and suggest teleportation
       // Future: Implement smooth teleportation
       console.warn("zoomToBoundingBox in XR mode: Feature not yet implemented");
       // TODO: Implement teleportation or root transform adjustment
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

   private initializeXR(): void {
     // ... existing XRSessionManager and XRUIManager setup ...

     // Create XR camera and input controllers
     const xrCameraController = new XRCameraController(this.xrSessionManager);
     const xrInputController = new XRInputController(
       this.scene,
       this.xrSessionManager,
       this.config.xr.input
     );

     // Register with CameraManager
     this.cameraManager.registerCamera("xr", xrCameraController, xrInputController);

     // Wire up UI button clicks to activate XR camera
     // When VR/AR button clicked:
     //   1. Enter XR session (XRSessionManager)
     //   2. Activate XR camera (CameraManager)
     // When XR exited:
     //   1. Exit XR session
     //   2. Restore previous camera
   }

   public async enterXR(mode: "immersive-vr" | "immersive-ar"): Promise<void> {
     const previousCamera = this.cameraManager.getActiveController()?.camera;

     if (mode === "immersive-vr") {
       await this.xrSessionManager.enterVR();
     } else {
       await this.xrSessionManager.enterAR(previousCamera);
     }

     this.cameraManager.activateCamera("xr");
   }

   public async exitXR(): Promise<void> {
     await this.xrSessionManager.exitXR();
     // Restore previous camera (stored before entering XR)
     this.cameraManager.activateCamera(this.previousCameraKey);
   }
   ```

4. **`stories/XR/CameraSwitching.stories.ts`**: Demo camera switching
   ```typescript
   export const OrbitToXRToOrbit: StoryObj = {
     render: () => html`
       <graphty-element .data=${...} .config=${{ camera: { type: "orbit" } }}></graphty-element>
       <div style="position: absolute; top: 10px; right: 10px;">
         <button onclick="switchTo('2d')">2D Camera</button>
         <button onclick="switchTo('orbit')">Orbit Camera</button>
         <button onclick="switchTo('xr')">XR Camera (via button)</button>
       </div>
     `,
   };
   ```

**Dependencies**:
- **External**: None
- **Internal**: Phase 1 (XRSessionManager), Phase 2 (XRInputController)

**Verification**:
1. Run: `npm run storybook`
2. Navigate to "XR/Camera Switching" story
3. Start with Orbit camera → Rotate graph
4. Click VR button → Smoothly transitions to XR mode
5. Exit XR → Returns to Orbit camera (same orientation)
6. Switch to 2D camera → Click VR button → XR works from 2D too
7. Call `graph.cameraManager.activateCamera('xr')` programmatically → Works
8. Call `graph.zoomToBoundingBox(min, max)` while in XR → No errors
9. Run: `npm test -- camera-switching`
10. Expected: All camera switching tests pass

---

### Phase 4: Configuration System and Polish (1-2 days)

**Objective**: Expose full XR configuration via Zod schema and polish the UI/UX.

**Duration**: 1-2 days

**Tests to Write First**:

1. **`test/config/xr-config.test.ts`**: Configuration validation
   ```typescript
   import { describe, test } from "vitest";
   import { assert } from "chai";
   import { xrConfigSchema } from "../../src/config/xr-config";

   describe("XR Configuration Schema", () => {
     test("should accept valid minimal config", () => {
       const config = { enabled: true };
       const result = xrConfigSchema.safeParse(config);
       assert.isTrue(result.success);
     });

     test("should apply defaults for missing fields", () => {
       const config = { enabled: true };
       const parsed = xrConfigSchema.parse(config);

       assert.equal(parsed.ui.position, "bottom-left");
       assert.equal(parsed.ui.unavailableMessageDuration, 5000);
       assert.isTrue(parsed.vr.enabled);
       assert.isTrue(parsed.ar.enabled);
     });

     test("should validate button position enum", () => {
       const config = { ui: { position: "invalid" } };
       const result = xrConfigSchema.safeParse(config);
       assert.isFalse(result.success);
     });

     test("should accept custom styles", () => {
       const config = {
         ui: { customStyles: ".webxr-button { background: red; }" }
       };
       const parsed = xrConfigSchema.parse(config);
       assert.exists(parsed.ui.customStyles);
     });

     test("should validate optional features array", () => {
       const config = {
         vr: { optionalFeatures: ["hand-tracking", "hit-test"] }
       };
       const parsed = xrConfigSchema.parse(config);
       assert.lengthOf(parsed.vr.optionalFeatures, 2);
     });
   });
   ```

2. **`test/visual/xr-config-variants.spec.ts`**: Visual tests for config options
   ```typescript
   import { test, expect } from "vitest";
   import { page } from "@vitest/browser/context";

   test("buttons render in top-right corner", async () => {
     await page.goto("http://dev.ato.ms:9025/iframe.html?id=xr-config--top-right");
     const screenshot = await page.screenshot();
     expect(screenshot).toMatchSnapshot("xr-buttons-top-right.png");
   });

   test("custom button styles applied", async () => {
     await page.goto("http://dev.ato.ms:9025/iframe.html?id=xr-config--custom-styles");

     const button = page.locator(".webxr-button");
     const bgColor = await button.evaluate(el =>
       window.getComputedStyle(el).backgroundColor
     );
     expect(bgColor).toBe("rgb(255, 0, 0)"); // Red background
   });

   test("VR only mode (no AR button)", async () => {
     await page.goto("http://dev.ato.ms:9025/iframe.html?id=xr-config--vr-only");

     const vrButton = page.locator("[data-xr-mode='immersive-vr']");
     const arButton = page.locator("[data-xr-mode='immersive-ar']");

     await expect(vrButton).toBeVisible();
     await expect(arButton).not.toBeVisible();
   });
   ```

**Implementation**:

1. **`src/config/xr-config.ts`**: Zod schema definition
   ```typescript
   import { z } from "zod";

   export const xrConfigSchema = z.object({
     enabled: z.boolean().default(true),

     ui: z.object({
       enabled: z.boolean().default(true),
       position: z.enum(["bottom-left", "bottom-right", "top-left", "top-right"])
         .default("bottom-left"),
       customStyles: z.string().optional(),
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
     }).default({}),

     teleportation: z.object({
       enabled: z.boolean().default(false),
       easeTime: z.number().positive().default(200),
     }).default({}),
   }).default({});

   export type XRConfig = z.infer<typeof xrConfigSchema>;
   ```

2. **Update `src/config/index.ts`**: Add XR config to main schema
   ```typescript
   import { xrConfigSchema } from "./xr-config";

   export const configSchema = z.object({
     // ... existing config fields ...
     xr: xrConfigSchema,
   });
   ```

3. **Update `src/ui/XRUIManager.ts`**: Apply custom styles
   ```typescript
   constructor(/* ... */, config: XRUIConfig) {
     // ... existing logic ...

     if (config.customStyles) {
       this.applyCustomStyles(config.customStyles);
     }
   }

   private applyCustomStyles(css: string): void {
     const styleElement = document.createElement("style");
     styleElement.textContent = css;
     document.head.appendChild(styleElement);
   }
   ```

4. **`stories/XR/Configuration.stories.ts`**: Configuration variants
   ```typescript
   export const TopRightPosition: StoryObj = {
     render: () => html`
       <graphty-element
         .config=${{
           xr: { ui: { position: "top-right" } }
         }}
       ></graphty-element>
     `,
   };

   export const CustomStyles: StoryObj = {
     render: () => html`
       <graphty-element
         .config=${{
           xr: {
             ui: {
               customStyles: `
                 .webxr-button {
                   background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
                   border-radius: 20px;
                   font-weight: bold;
                 }
               `
             }
           }
         }}
       ></graphty-element>
     `,
   };

   export const VROnly: StoryObj = {
     render: () => html`
       <graphty-element
         .config=${{
           xr: {
             vr: { enabled: true },
             ar: { enabled: false }
           }
         }}
       ></graphty-element>
     `,
   };

   export const DisabledXR: StoryObj = {
     render: () => html`
       <graphty-element
         .config=${{
           xr: { enabled: false }
         }}
       ></graphty-element>
     `,
   };
   ```

**Dependencies**:
- **External**: Zod (already in project)
- **Internal**: All previous phases

**Verification**:
1. Run: `npm run storybook`
2. Navigate through "XR/Configuration" stories:
   - Top Right Position: Buttons in top-right corner
   - Custom Styles: Red gradient buttons
   - VR Only: Only VR button visible
   - Disabled XR: No buttons at all
3. Test invalid config: Should fail validation with helpful error
4. Run: `npm test -- xr-config`
5. Expected: All configuration tests pass
6. Run: `npm run lint`
7. Expected: No linting errors

---

### Phase 5: Advanced Gestures and Multi-Hand Interactions (1-2 days)

**Objective**: Enable zoom, pan, and rotate operations using advanced XR gestures.

**Duration**: 1-2 days

**Tests to Write First**:

1. **`test/cameras/xr-gestures.test.ts`**: Gesture detection logic
   ```typescript
   import { describe, test, beforeEach } from "vitest";
   import { assert } from "chai";
   import { Vector3 } from "@babylonjs/core";
   import { XRGestureDetector } from "../../src/cameras/XRGestureDetector";

   describe("XRGestureDetector", () => {
     let detector: XRGestureDetector;

     beforeEach(() => {
       detector = new XRGestureDetector();
     });

     test("should detect two-hand pinch zoom", () => {
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
       const leftHand = { position: new Vector3(-0.5, 0, 0), pinching: true };
       const rightHand = { position: new Vector3(0.5, 0, 0), pinching: true };

       detector.updateHands(leftHand, rightHand);

       // Rotate hands (left up, right down)
       leftHand.position.y = 0.5;
       rightHand.position.y = -0.5;
       detector.updateHands(leftHand, rightHand);

       const gesture = detector.getCurrentGesture();
       assert.equal(gesture.type, "rotate");
       assert.exists(gesture.rotationAxis);
     });

     test("should not detect gestures with single hand", () => {
       const leftHand = { position: new Vector3(0, 0, 0), pinching: true };
       detector.updateHands(leftHand, null);

       const gesture = detector.getCurrentGesture();
       assert.equal(gesture.type, "none");
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

2. **`test/integration/xr-gestures.spec.ts`**: Gesture integration with IWER
   ```typescript
   import { test, expect } from "vitest";
   import { chromium } from "playwright";

   test("two-hand pinch zooms graph", async () => {
     // Setup IWER with hand tracking
     // Simulate two hands pinching and moving apart
     // Verify graph scale increased
   });

   test("thumbstick pans camera", async () => {
     // Setup IWER with controller
     // Simulate thumbstick movement
     // Verify camera/graph position changed
   });
   ```

**Implementation**:

1. **`src/cameras/XRGestureDetector.ts`**: Gesture recognition utility
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

         // Calculate angle between hands for twist detection
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
             zoomDelta: distanceDelta > 0 ? 1.1 : 0.9, // Scale factor
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
       // Map thumbstick input to world-space pan
       const sensitivity = 0.1;
       return new Vector3(x * sensitivity, y * sensitivity, 0);
     }
   }
   ```

2. **Update `src/cameras/XRInputController.ts`**: Integrate gestures
   ```typescript
   import { XRGestureDetector } from "./XRGestureDetector";

   export class XRInputController implements InputHandler {
     private gestureDetector: XRGestureDetector;
     // ... existing fields ...

     constructor(/* ... */) {
       // ... existing initialization ...
       this.gestureDetector = new XRGestureDetector();
     }

     public update(): void {
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
         case "pan":
           this.handlePan(gesture.panDelta!);
           break;
       }

       // Process thumbstick input from controllers
       this.processThumbstickInput();
     }

     private handleZoom(scaleFactor: number): void {
       // Scale the graph's root transform or adjust camera distance
       const graph = this.scene.getTransformNodeByName("graph-root");
       if (graph) {
         graph.scaling.scaleInPlace(scaleFactor);
       }
     }

     private handleRotate(axis: Vector3, angle: number): void {
       // Rotate graph or adjust camera orbit
       const graph = this.scene.getTransformNodeByName("graph-root");
       if (graph) {
         graph.rotate(axis, angle, Space.WORLD);
       }
     }

     private handlePan(delta: Vector3): void {
       // Pan graph or camera
       const graph = this.scene.getTransformNodeByName("graph-root");
       if (graph) {
         graph.position.addInPlace(delta);
       }
     }

     private processThumbstickInput(): void {
       // Get thumbstick axes from each controller
       this.inputSources.forEach(inputSource => {
         const controller = inputSource.motionController;
         if (!controller) return;

         const thumbstick = controller.getComponent("xr-standard-thumbstick");
         if (thumbstick && thumbstick.axes) {
           const [x, y] = thumbstick.axes.getValue();
           const panDelta = this.gestureDetector.calculatePanFromThumbstick(x, y);
           this.handlePan(panDelta);
         }
       });
     }
   }
   ```

3. **`stories/XR/AdvancedGestures.stories.ts`**: Gesture demo
   ```typescript
   export const ZoomPanRotate: StoryObj = {
     render: () => html`
       <graphty-element
         .data=${largeGraphData}
         .config=${{
           layout: { type: "force", dimensions: 3 },
           xr: {
             enabled: true,
             input: {
               handTracking: true,
               controllers: true
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
         </ul>
       </div>
     `,
   };
   ```

**Dependencies**:
- **External**: None
- **Internal**: All previous phases

**Verification**:
1. Run: `npm run storybook`
2. Navigate to "XR/Advanced Gestures" story
3. Enter VR mode with hand tracking enabled
4. Pinch with both hands → Move hands apart → Graph zooms in
5. Pinch with both hands → Move hands together → Graph zooms out
6. Pinch and twist hands → Graph rotates
7. Use controller thumbstick → Graph pans
8. Switch from hands to controllers → All gestures still work
9. Run: `npm test -- xr-gestures`
10. Expected: All gesture tests pass

---

### Phase 6: Testing, Documentation, and Production Readiness (2-3 days)

**Objective**: Achieve production quality through comprehensive testing, documentation, and performance optimization.

**Duration**: 2-3 days

**Tests to Write/Complete**:

1. **Comprehensive unit test coverage** (`>80%`):
   - Complete all unit tests from previous phases
   - Add edge case tests:
     - XR session failure scenarios
     - Invalid configuration handling
     - Multi-device compatibility edge cases
     - Memory leak tests

2. **`test/integration/xr-full-flow.spec.ts`**: End-to-end XR flows
   ```typescript
   import { test, expect } from "vitest";
   import { chromium } from "playwright";

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

     // Perform all interactions
     // - Select node
     // - Drag node
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

   test("AR session with hit-test placement", async () => {
     // Test AR-specific features
   });

   test("error handling: XR fails to initialize", async () => {
     // Mock XR failure
     // Verify graceful degradation
     // Verify error message displayed
   });
   ```

3. **`test/performance/xr-performance.spec.ts`**: Performance benchmarks
   ```typescript
   import { test, expect } from "vitest";
   import { page } from "@vitest/browser/context";

   test("maintains 90 FPS in VR mode with 100 nodes", async () => {
     await page.goto("http://dev.ato.ms:9025/iframe.html?id=xr-performance--medium-graph");

     // Enter VR mode
     await page.click("[data-xr-mode='immersive-vr']");
     await page.waitForTimeout(2000);

     // Measure frame rate
     const fps = await page.evaluate(() => {
       return (window as any).__graph.statsManager.getAverageFPS();
     });

     expect(fps).toBeGreaterThan(90);
   });

   test("no memory leaks after multiple XR sessions", async () => {
     // Enter/exit XR 10 times
     // Measure memory usage
     // Verify no significant growth
   });
   ```

4. **Visual regression tests** (Chromatic/Playwright):
   - All UI button positions
   - Custom styling variants
   - Unavailable message states
   - Session active/inactive states

**Documentation**:

1. **Update `CLAUDE.md`**:
   ```markdown
   ## XR Camera Usage

   ### Basic Usage

   Enable XR mode in your graph visualization:

   ```typescript
   const graph = new Graph(canvas, {
     xr: {
       enabled: true, // VR/AR buttons appear automatically
     }
   });
   ```

   ### Configuration

   Full XR configuration options:

   ```typescript
   {
     xr: {
       enabled: true,
       ui: {
         enabled: true,
         position: "bottom-left", // or "bottom-right", "top-left", "top-right"
         customStyles: ".webxr-button { background: blue; }",
         unavailableMessageDuration: 5000 // milliseconds
       },
       vr: {
         enabled: true,
         referenceSpaceType: "local-floor",
         optionalFeatures: ["hand-tracking"]
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
         physics: false
       }
     }
   }
   ```

   ### Programmatic Control

   ```typescript
   // Enter VR mode programmatically
   await graph.enterXR("immersive-vr");

   // Enter AR mode
   await graph.enterXR("immersive-ar");

   // Exit XR
   await graph.exitXR();

   // Switch camera to XR
   graph.cameraManager.activateCamera("xr");
   ```

   ### XR Events

   Listen to XR lifecycle events:

   ```typescript
   graph.on("xr-session-started", (mode) => {
     console.log(`XR session started: ${mode}`);
   });

   graph.on("xr-session-ended", () => {
     console.log("XR session ended");
   });

   graph.on("xr-input-added", (inputSource) => {
     console.log("Input source added:", inputSource.handedness);
   });
   ```

   ### Testing XR Features

   Use IWER for automated XR testing:

   ```bash
   npm install iwer --save-dev
   ```

   ```typescript
   // In your Playwright test
   await page.addScriptTag({
     url: "https://unpkg.com/iwer/build/iwer.min.js",
   });
   await page.evaluate(() => {
     const xrDevice = new IWER.XRDevice(IWER.metaQuest3);
     xrDevice.installRuntime();
   });
   ```

   ### Device Compatibility

   - **Meta Quest 2/3**: Full support (VR + hand tracking + controllers)
   - **Apple Vision Pro**: VR support (AR coming in future visionOS)
   - **Android XR**: Full support (emerging platform)
   - **PC VR** (Valve Index, HTC Vive): Full support via SteamVR

   ### Troubleshooting

   - **"VR / AR NOT AVAILABLE"**: Browser doesn't support WebXR or HTTPS required
   - **Low FPS in XR**: Reduce graph complexity or enable LOD (future feature)
   - **Hand tracking not working**: Ensure device supports it and feature is enabled in config
   ```

2. **JSDoc comments** in all XR classes:
   - XRSessionManager
   - XRUIManager
   - XRCameraController
   - XRInputController
   - XRGestureDetector

3. **Storybook documentation pages**:
   - "XR/Getting Started"
   - "XR/Configuration Guide"
   - "XR/Interactions Reference"
   - "XR/Testing Guide"

**Performance Optimization**:

1. **Frame rate monitoring**:
   ```typescript
   // In XRInputController.update()
   if (this.statsManager.getAverageFPS() < 60) {
     console.warn("XR performance degradation detected");
     // Consider reducing graph complexity
   }
   ```

2. **Mesh instancing verification**:
   - Ensure MeshCache is used for all node/edge meshes
   - Profile draw calls in XR mode

3. **Memory management**:
   - Proper disposal of XR resources
   - Remove event listeners on session end
   - Clear gesture detector state

4. **Mobile XR optimizations**:
   - Test on actual Meta Quest device
   - Profile memory usage
   - Optimize for Quest's mobile GPU

**Accessibility & UX Polish**:

1. **Visual feedback**:
   - Highlight nodes on ray hover
   - Show selection indicators
   - Hand/controller visibility indicators

2. **Error handling**:
   - Clear error messages
   - Fallback when XR fails
   - Graceful degradation

3. **Comfort options** (future enhancement, document as TODO):
   - Teleportation
   - Snap turning
   - Vignetting during movement

**Dependencies**:
- **External**: IWER for testing (`npm install iwer --save-dev`)
- **Internal**: All previous phases complete

**Verification**:
1. Run: `npm run test:all`
   - Expected: All tests pass with >80% coverage
2. Run: `npm run lint`
   - Expected: No linting errors
3. Run: `npm run build`
   - Expected: Clean build, no warnings
4. Run: `npm run storybook`
   - Review all XR stories → All functional
   - Check documentation pages → Clear and complete
5. Manual testing on Meta Quest (if available):
   - Enter VR mode → Smooth experience
   - Select/drag nodes → Responsive
   - Two-hand gestures → Works correctly
   - Exit VR → Clean return to normal mode
6. Run: `npm run ready:commit`
   - Expected: All checks pass

---

## Common Utilities and Helpers

### Utilities Created During Implementation

1. **`src/xr/XRSessionManager.ts`**: Session lifecycle management
   - Used by: XRCameraController, XRInputController, Graph
   - Purpose: Centralize WebXR session handling

2. **`src/ui/XRUIManager.ts`**: UI button rendering and positioning
   - Used by: Graph
   - Purpose: Separate UI concerns from core XR logic

3. **`src/cameras/XRGestureDetector.ts`**: Gesture recognition
   - Used by: XRInputController
   - Purpose: Reusable gesture detection logic

4. **Integration with existing `NodeBehavior.ts`** (NO new utility created)
   - **Critical decision**: XR does NOT reimplement node interaction logic
   - **Strategy**: Leverage existing `SixDofDragBehavior` and `ActionManager` from `NodeBehavior.ts`
   - **Rationale**: BabylonJS WebXR emits pointer events that work with existing behaviors
   - **Benefits**:
     - Zero code duplication
     - Consistent behavior between non-XR and XR modes
     - Automatic support for `pinOnDrag`, layout engine updates, and expansion
     - Single maintenance path for all node interactions
   - **Fallback**: If `SixDofDragBehavior` doesn't work with XR, create `XRNodeBehavior` that **reuses the same logic** (not a reimplementation)
   - **Implementation note**: `XRInputController` only enables XR features (hand tracking, near interaction), it does NOT handle node dragging/selection

5. **`test/helpers/setup-iwer.ts`**: IWER test setup helper
   ```typescript
   export async function setupIWER(
     page: Page,
     device: "metaQuest3" | "metaQuest2" | "appleVisionPro" = "metaQuest3"
   ): Promise<void> {
     await page.addScriptTag({
       url: "https://unpkg.com/iwer/build/iwer.min.js",
     });
     await page.evaluate((deviceName) => {
       const xrDevice = new (window as any).IWER.XRDevice(
         (window as any).IWER[deviceName]
       );
       xrDevice.installRuntime();
       xrDevice.stereoEnabled = true;
     }, device);
   }
   ```
   - Used by: All XR integration tests
   - Purpose: DRY test setup

5. **`test/helpers/xr-test-utils.ts`**: XR testing utilities
   ```typescript
   export function createMockXRSessionManager(scene: Scene): XRSessionManager {
     // Mock implementation for unit tests
   }

   export function createMockInputSource(
     handedness: "left" | "right",
     type: "hand" | "controller"
   ): WebXRInputSource {
     // Mock input source for testing
   }
   ```

### External Libraries Assessment

1. **BabylonJS WebXR Features** (already included):
   - ✅ Use for: All WebXR functionality
   - Reason: Official, well-maintained, handles device abstraction
   - No additional libraries needed

2. **IWER** (Meta's XR emulator):
   - ✅ Use for: Automated XR testing
   - Reason: Official emulator, works in CI/CD
   - Install: `npm install iwer --save-dev`

3. **WebXR Test API** (optional):
   - ⚠️ Consider for: Advanced spec compliance testing
   - Reason: Useful for edge case testing
   - Decision: Defer to future if needed

4. **Handy.js**, **Three.js XR**, etc.:
   - ❌ Do NOT use
   - Reason: We use BabylonJS, not Three.js

### Code Reuse Opportunities

1. **MOST IMPORTANT: Reuse existing `NodeBehavior.ts` for all node interactions**:
   - **NO reimplementation of drag logic** - use existing `SixDofDragBehavior`
   - **NO reimplementation of click logic** - use existing `ActionManager`
   - **NO reimplementation of state management** - use existing `node.dragging`, `node.pinOnDrag`
   - **Benefits**: Zero duplication, consistent behavior, single maintenance path
   - **Testing focus**: Verify existing behaviors work with XR pointer events (Phase 2)

2. **Refactor from `src/xr-button.ts`**:
   - Button rendering logic → XRUIManager
   - Session initialization → XRSessionManager
   - Camera position transfer → XRCameraController
   - Delete `src/xr-button.ts` after refactoring complete

3. **Shared with Orbit/2D cameras**:
   - `CameraController` interface implementation
   - `InputHandler` interface implementation
   - Camera registration pattern with CameraManager

4. **Shared gesture logic**:
   - Could be extended to non-XR touch gestures (future)
   - XRGestureDetector could be generalized

---

## Risk Mitigation Strategies

### Risk: Performance Issues on Mobile XR

**Probability**: Medium | **Impact**: High

**Mitigation**:
- Profile early on actual Quest device (Phase 6)
- Monitor FPS continuously during XR sessions
- Document performance expectations and graph size limits
- Future: Implement LOD system for large graphs
- Test with realistic graph sizes (100-1000 nodes)

**Fallback**:
- Display warning if FPS < 60
- Suggest reducing graph complexity
- Provide performance tuning guide in docs

### Risk: Apple Vision Pro AR Not Supported

**Probability**: High (current visionOS limitation) | **Impact**: Medium

**Mitigation**:
- Detect AR support before showing AR button
- On Vision Pro: Only show VR button or disabled AR button with tooltip
- Document limitation clearly in CLAUDE.md
- Monitor visionOS updates for AR support

**Fallback**:
- VR mode works perfectly on Vision Pro
- Users understand AR coming in future visionOS

### Risk: Hand Tracking Reliability

**Probability**: Medium | **Impact**: Medium

**Mitigation**:
- Support both hands and controllers (seamless switching)
- Make hand tracking optional (enabled by default)
- Tune interaction hitboxes for hand imprecision
- Provide clear visual feedback for hand state
- Document that controllers recommended for precision

**Fallback**:
- Users can always fall back to controllers
- Config option to disable hand tracking entirely

### Risk: Testing Coverage Limitations

**Probability**: Medium | **Impact**: Medium

**Mitigation**:
- Use IWER for automated testing in CI/CD
- Comprehensive unit tests with mocked WebXR APIs
- Manual testing protocol on real devices (documented)
- Playwright tests for all UI interactions
- Beta period with community feedback

**Fallback**:
- Manual testing on critical paths
- Community-driven multi-device testing
- Issue tracking for device-specific bugs

### Risk: Breaking Changes to Existing Code

**Probability**: Low | **Impact**: High

**Mitigation**:
- Follow existing patterns strictly (CameraController, InputHandler)
- Keep XR code isolated (no changes to core Graph logic)
- Extensive integration tests for camera switching
- Add XR config as optional (defaults to enabled)
- No modifications to existing camera implementations
- Code review before merging

**Fallback**:
- Feature flag to disable XR entirely
- Rollback capability if issues detected

### Risk: Configuration Complexity

**Probability**: Low | **Impact**: Low

**Mitigation**:
- Provide sensible defaults (zero-config should work)
- Document common use cases prominently
- Keep simple case simple: just enable XR
- Advanced options clearly documented
- Zod validation provides helpful error messages

**Fallback**:
- Minimal config example in every doc section
- "Quick Start" guide with copy-paste config

---

## Success Metrics

**Phase Completion Criteria**:
- ✅ Each phase must deliver working, user-testable functionality
- ✅ All tests pass for completed phases
- ✅ No regressions in existing features
- ✅ Storybook stories demonstrate new features

**Final Success Criteria**:
- [ ] All acceptance criteria met (48 items from design doc)
- [ ] Test coverage >80% for XR components
- [ ] All visual regression tests pass
- [ ] Documentation complete and reviewed
- [ ] Performance benchmarks meet targets (90 FPS in VR)
- [ ] Manual testing on Meta Quest successful
- [ ] No breaking changes to existing code
- [ ] `npm run ready:commit` passes cleanly

**User Acceptance**:
- [ ] Users can enter VR/AR with single button click
- [ ] Interactions feel natural and responsive
- [ ] Camera switching is seamless
- [ ] Configuration is intuitive
- [ ] Error messages are clear and helpful
- [ ] Performance is acceptable on target devices

---

## Timeline Summary

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| **Phase 1** | 2-3 days | XR session lifecycle and UI buttons |
| **Phase 2** | 2-3 days | Input handling and basic interactions |
| **Phase 3** | 1-2 days | Camera architecture integration |
| **Phase 4** | 1-2 days | Configuration system and polish |
| **Phase 5** | 1-2 days | Advanced gestures and multi-hand |
| **Phase 6** | 2-3 days | Testing, docs, production readiness |
| **Total** | **9-15 days** | Production-ready XR camera feature |

**Assumptions**:
- One developer working full-time
- Access to Meta Quest device for testing (Phase 6)
- No major blockers or scope changes
- Familiarity with BabylonJS WebXR APIs

**Parallelization Opportunities**:
- Documentation can be written in parallel with implementation
- Visual tests can be created alongside Storybook stories
- Performance profiling can happen during Phase 5-6

---

## Post-Implementation: Future Enhancements

These are explicitly **out of scope** for initial implementation but documented for future work:

### Short-term (Next 3-6 months)
- Teleportation system for large graph navigation
- XR-specific UI overlays (stats, menus in 3D space)
- Comfort options (snap turning, vignetting)
- Hit-test support for AR object placement

### Medium-term (6-12 months)
- Multi-user collaborative XR sessions
- XR-optimized graph layouts (spatial algorithms)
- Level of Detail (LOD) for large graphs in XR
- Passthrough mode mixing (on capable devices)

### Long-term (12+ months)
- Spatial audio for navigation cues
- XR recording/replay for presentations
- AI-assisted XR navigation
- Cross-platform XR multiplayer
- AR cloud anchoring (persistent AR graphs)

---

## Conclusion

This implementation plan transforms the XR feature from a monolithic script into a clean, modular system that:

✅ Follows established architectural patterns (CameraController, InputHandler)
✅ **Reuses existing `NodeBehavior.ts` - NO code duplication for interactions**
✅ Delivers user value incrementally across 6 phases
✅ Achieves comprehensive test coverage (>80%)
✅ Maintains backward compatibility
✅ Supports all major XR platforms (Quest, Vision Pro, Android XR)
✅ Provides flexible configuration via Zod schema
✅ Enables future enhancements (multi-hand gestures, teleportation, etc.)

**Key Architectural Decisions**:

1. **NodeBehavior Integration**: XR leverages existing `SixDofDragBehavior` and `ActionManager` instead of reimplementing node interactions. This ensures:
   - Zero code duplication
   - Consistent behavior between non-XR and XR modes
   - Single maintenance path
   - Automatic support for all existing features (pinOnDrag, layout updates, double-click expansion)

2. **Minimal XRInputController**: The XR input controller only enables XR-specific features (hand tracking, near interaction) and does NOT handle basic interactions. This keeps XR code focused and minimal.

3. **Phased Testing Strategy**: Each phase includes tests that verify existing functionality works in XR, not just new XR-specific features.

Each phase builds on the previous, with clear verification steps and user-testable deliverables. The phased approach reduces risk, enables early feedback, and ensures a production-quality implementation.
