import {Observer, Quaternion, Ray, Scene, Space, Vector3, type WebXRDefaultExperience, WebXRFeatureName, type WebXRInputSource} from "@babylonjs/core";

import type {Node as GraphNode} from "../Node";
import type {XRInputConfig} from "../config/XRConfig";
import type {XRSessionManager} from "../xr/XRSessionManager";
import type {InputHandler} from "./CameraManager";
import {XRGestureDetector, type HandState} from "./XRGestureDetector";

/**
 * XRInputController coordinates XR input sources and enables XR-specific features.
 *
 * IMPORTANT: This does NOT reimplement node dragging or selection.
 * NodeBehavior.ts (SixDofDragBehavior and ActionManager) handles those.
 *
 * This controller only:
 * 1. Enables hand tracking and controller features
 * 2. Tracks input sources for monitoring
 * 3. Ensures existing NodeBehavior works in XR mode
 *
 * Node dragging, pinning, and selection work automatically because:
 * - BabylonJS WebXR emits pointer events
 * - Existing SixDofDragBehavior responds to pointer events
 * - XR controller squeeze/trigger = pointer events
 * - Hand pinch/touch = pointer events
 */
export class XRInputController implements InputHandler {
    private scene: Scene;
    private sessionManager: XRSessionManager;
    private config: XRInputConfig;
    private inputSources = new Map<string, WebXRInputSource>();
    private observers: Observer<WebXRInputSource>[] = [];
    private enabled = false;
    private draggedNode: {
        node: GraphNode;
        controller: WebXRInputSource;
    } | null = null;
    private gestureDetector: XRGestureDetector;

    constructor(
        scene: Scene,
        sessionManager: XRSessionManager,
        config: XRInputConfig,
    ) {
        this.scene = scene;
        this.sessionManager = sessionManager;
        this.config = config;
        this.gestureDetector = new XRGestureDetector();
    }

    public enable(): void {
        console.log('🔍 [XR] XRInputController.enable() called', {
            alreadyEnabled: this.enabled,
        });

        if (this.enabled) {
            return; // Already enabled
        }

        this.enabled = true;

        // Subscribe to WebXR input observables
        const xrHelper = this.sessionManager.getXRHelper();

        console.log('🔍 [XR] Checking for XR Helper:', {
            xrHelperExists: !!xrHelper,
            xrHelper: xrHelper ? {
                hasBaseExperience: !!xrHelper.baseExperience,
                hasInput: !!xrHelper.input,
                state: xrHelper.baseExperience?.state,
            } : null,
        });

        if (!xrHelper) {
            // XR session not active yet - this is OK
            // Will be called again when session starts
            console.log('🔍 [XR] No XR helper available yet - session not started');
            return;
        }

        // Track input sources (for debugging and future features)
        const controllerObserver = xrHelper.input.onControllerAddedObservable.add(
            this.handleInputSourceAdded.bind(this),
        );
        this.observers.push(controllerObserver);

        const removeObserver = xrHelper.input.onControllerRemovedObservable.add(
            this.handleInputSourceRemoved.bind(this),
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

        // Setup controller drag handlers for all existing controllers
        console.log('🔍 [XR] Existing controllers:', {
            count: xrHelper.input.controllers.length,
            controllers: xrHelper.input.controllers.map(c => ({
                uniqueId: c.uniqueId,
                hasGrip: !!c.grip,
                hasPointer: !!c.pointer,
            })),
        });

        xrHelper.input.controllers.forEach((controller) => {
            this.setupControllerDrag(controller);
        });

        // Setup drag handlers for any new controllers that are added
        const dragObserver = xrHelper.input.onControllerAddedObservable.add((controller) => {
            console.log('🔍 [XR] New controller added:', {
                uniqueId: controller.uniqueId,
                hasGrip: !!controller.grip,
                hasPointer: !!controller.pointer,
            });
            this.setupControllerDrag(controller);
        });
        this.observers.push(dragObserver);
    }

    public disable(): void {
        if (!this.enabled) {
            return;
        }

        this.enabled = false;

        // Unsubscribe from observables
        this.observers.forEach((obs) => {
            obs.remove();
        });
        this.observers = [];
        this.inputSources.clear();
    }

    public update(): void {
        // Called every frame
        if (!this.enabled) {
            return;
        }

        // Update drag position if a node is being dragged
        if (this.draggedNode) {
            const controller = this.draggedNode.controller;
            const gripPosition = controller.grip?.position ?? controller.pointer.position;
            this.draggedNode.node.dragHandler?.onDragUpdate(gripPosition.clone());
            return; // Don't process gestures while dragging
        }

        // TODO(Phase 5): Re-enable gesture processing after fixing:
        // 1. Create graph-root transform node in scene
        // 2. Fix handedness check (should be inputSource.handedness, not grip.metadata.handedness)
        // 3. Fix thumbstick API usage
        // 4. Implement proper hand pinch detection

        // Process hand gestures for zoom, rotate, pan (DISABLED - needs graph-root node)
        // this.processGestures();

        // Process thumbstick input for pan (DISABLED - needs graph-root node)
        // this.processThumbstickInput();
    }

    private handleInputSourceAdded(inputSource: WebXRInputSource): void {
        this.inputSources.set(inputSource.uniqueId, inputSource);

        // Future: Add visual indicators for hands/controllers
        // Future: Setup multi-hand gesture detection
    }

    private handleInputSourceRemoved(inputSource: WebXRInputSource): void {
        this.inputSources.delete(inputSource.uniqueId);
    }

    private enableHandTracking(xrHelper: WebXRDefaultExperience): void {
        try {
            xrHelper.baseExperience.featuresManager.enableFeature(
                WebXRFeatureName.HAND_TRACKING,
                "latest",
                {
                    xrInput: xrHelper.input,
                    jointMeshes: {
                        enablePhysics: this.config.physics,
                    },
                } as {xrInput: unknown, jointMeshes: {enablePhysics: boolean}},
            );
        } catch (error) {
            // Hand tracking not supported on this device - that's OK
            console.warn("Hand tracking not available:", error);
        }
    }

    private enableNearInteraction(xrHelper: WebXRDefaultExperience): void {
        try {
            xrHelper.baseExperience.featuresManager.enableFeature(
                WebXRFeatureName.NEAR_INTERACTION,
                "latest",
                {
                    xrInput: xrHelper.input,
                } as {xrInput: unknown},
            );
        } catch (error) {
            // Near interaction not supported - that's OK
            console.warn("Near interaction not available:", error);
        }
    }

    private setupControllerDrag(controller: WebXRInputSource): void {
        console.log('🔍 [XR] setupControllerDrag called for controller:', {
            uniqueId: controller.uniqueId,
            hasMotionController: !!controller.motionController,
        });

        controller.onMotionControllerInitObservable.add((motionController) => {
            const componentIds = Object.keys(motionController.components);
            console.log('🔍 [XR] Motion controller initialized:', {
                controllerId: controller.uniqueId,
                components: componentIds,
            });

            // Try to get squeeze component first (preferred for grab)
            const squeezeComponent = motionController.getComponent("squeeze");
            // Also try trigger as fallback (Meta Quest uses trigger for primary interaction)
            const triggerComponent = motionController.getComponent("xr-standard-trigger");

            console.log('🔍 [XR] Controller components:', {
                hasSqueezeComponent: !!squeezeComponent,
                hasTriggerComponent: !!triggerComponent,
                squeezeId: squeezeComponent?.id,
                triggerId: triggerComponent?.id,
            });

            // Use squeeze if available, otherwise fall back to trigger
            const grabComponent = squeezeComponent ?? triggerComponent;

            if (!grabComponent) {
                console.warn('🔍 [XR] No grab component (squeeze or trigger) found on controller');
                return;
            }

            const componentType = squeezeComponent ? 'squeeze' : 'trigger';
            console.log(`🔍 [XR] Using ${componentType} for grab interaction`);

            grabComponent.onButtonStateChangedObservable.add((component) => {
                // CRITICAL: Log which controller is sending events
                const eventControllerId = controller.uniqueId;
                const dragControllerIdId = this.draggedNode?.controller.uniqueId;

                console.log(`🔍 [XR] ${componentType} button state changed:`, {
                    pressed: component.pressed,
                    value: component.value,
                    currentlyDragging: !!this.draggedNode,
                    eventControllerId,                      // Which controller sent this event
                    dragControllerId: dragControllerIdId,   // Which controller owns the drag
                    controllersMatch: eventControllerId === dragControllerIdId,
                });

                if (component.pressed) {
                    // Only start drag if not already dragging
                    // The button state observable fires on EVERY analog value change,
                    // not just on initial press, so we must guard against repeated calls
                    if (!this.draggedNode) {
                        console.log(`🔍 [XR] Starting drag with controller: ${eventControllerId}`);
                        this.handleSqueezeStart(controller);
                    } else {
                        console.log(`🔍 [XR] BLOCKED: Drag already in progress by controller: ${dragControllerIdId}`);
                    }
                } else {
                    console.log(`🔍 [XR] Button released by controller: ${eventControllerId}`);

                    if (this.draggedNode?.controller === controller) {
                        console.log(`🔍 [XR] Controller matches, calling handleSqueezeEnd()`);
                        this.handleSqueezeEnd();
                    } else if (this.draggedNode) {
                        console.log(`🔍 [XR] ⚠️ MISMATCH: Drag owned by ${dragControllerIdId}, but release from ${eventControllerId}`);
                    }
                }
            });

            console.log(`🔍 [XR] ${componentType} handler registered for controller:`, controller.uniqueId);
        });
    }

    private handleSqueezeStart(controller: WebXRInputSource): void {
        console.log('🔍 [XR] handleSqueezeStart called for controller:', controller.uniqueId);

        // Raycast from controller to find node
        const ray = new Ray(Vector3.Zero(), Vector3.Forward());
        controller.getWorldPointerRayToRef(ray);

        // Simplified: Just do the filtered raycast without verbose logging
        const pickInfo = this.scene.pickWithRay(ray, (mesh) => {
            return mesh.metadata?.graphNode !== undefined;
        });

        console.log('🔍 [XR] Raycast result:', {
            hit: pickInfo?.hit,
            pickedMeshName: pickInfo?.pickedMesh?.name,
            graphNodeId: pickInfo?.pickedMesh?.metadata?.graphNode?.id,
            distance: pickInfo?.distance,
        });

        if (!pickInfo?.hit || !pickInfo.pickedMesh) {
            console.log('🔍 [XR] No mesh picked by controller raycast');
            return;
        }

        const node = pickInfo.pickedMesh.metadata.graphNode as GraphNode;

        console.log('🔍 [XR] Found node:', {
            nodeId: node.id,
            hasDragHandler: !!node.dragHandler,
        });

        if (!node.dragHandler) {
            console.warn('🔍 [XR] Node has no drag handler');
            return;
        }

        // Get controller grip position (or pointer as fallback)
        const gripPosition = controller.grip?.position ?? controller.pointer.position;

        console.log('🔍 [XR] Starting drag with grip position:', gripPosition.asArray());

        // Start drag
        node.dragHandler.onDragStart(gripPosition.clone());

        // Track this drag
        this.draggedNode = {node, controller};

        console.log('🔍 [XR] Drag initiated successfully');
    }

    private handleSqueezeEnd(): void {
        if (!this.draggedNode) {
            return;
        }

        this.draggedNode.node.dragHandler?.onDragEnd();
        this.draggedNode = null;
    }

    public dispose(): void {
        this.disable();
    }

    /**
     * Process hand gestures for zoom and rotation
     * Requires hand tracking to be enabled
     */
    private processGestures(): void {
        // Get hand states from input sources
        const leftHand = this.getHandState("left");
        const rightHand = this.getHandState("right");

        // Update gesture detector
        this.gestureDetector.updateHands(leftHand, rightHand);

        // Get current gesture
        const gesture = this.gestureDetector.getCurrentGesture();

        switch (gesture.type) {
            case "zoom":
                this.handleZoom(gesture.zoomDelta!);
                break;
            case "rotate":
                this.handleRotate(gesture.rotationAxis!, gesture.rotationAngle!);
                break;
            case "none":
                // No gesture detected
                break;
        }
    }

    /**
     * Get hand state from input sources
     * Returns null if hand not tracked
     */
    private getHandState(handedness: "left" | "right"): HandState | null {
        // TODO(Phase 5): Implement proper hand state detection
        // This requires:
        // 1. Finding the correct property on WebXRInputSource for handedness
        // 2. Implementing hand pinch detection using WebXR Hand Tracking API
        // 3. Creating a graph-root transform node to apply gestures to
        //
        // For now, always return null to disable gesture detection
        return null;
    }

    /**
     * Apply zoom to graph root transform
     */
    private handleZoom(scaleFactor: number): void {
        const graphRoot = this.scene.getTransformNodeByName("graph-root");
        if (graphRoot) {
            graphRoot.scaling.scaleInPlace(scaleFactor);
        }
    }

    /**
     * Apply rotation to graph root transform
     */
    private handleRotate(axis: Vector3, angle: number): void {
        const graphRoot = this.scene.getTransformNodeByName("graph-root");
        if (graphRoot) {
            graphRoot.rotate(axis, angle, Space.WORLD);
        }
    }

    /**
     * Apply pan/translation to graph root transform
     */
    private handlePan(delta: Vector3): void {
        const graphRoot = this.scene.getTransformNodeByName("graph-root");
        if (graphRoot) {
            graphRoot.position.addInPlace(delta);
        }
    }

    /**
     * Process thumbstick input from controllers for pan
     */
    private processThumbstickInput(): void {
        this.inputSources.forEach((inputSource) => {
            const controller = inputSource.motionController;
            if (!controller) {
                return;
            }

            const thumbstick = controller.getComponent("xr-standard-thumbstick");
            if (thumbstick?.axes) {
                const x = thumbstick.axes.x;
                const y = thumbstick.axes.y;

                // Only apply pan if thumbstick moved significantly
                if (Math.abs(x) > 0.1 || Math.abs(y) > 0.1) {
                    const panDelta = this.gestureDetector.calculatePanFromThumbstick(x, y);
                    this.handlePan(panDelta);
                }
            }
        });
    }
}
