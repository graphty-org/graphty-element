import {Quaternion, Ray, type Scene, Vector3, type WebXRDefaultExperience, type WebXRInputSource} from "@babylonjs/core";

import type {NodeDragHandler} from "../NodeBehavior";
import {applyDeadzone} from "./InputUtils";
import type {PivotController} from "./PivotController";

// Re-export applyDeadzone for backwards compatibility
export {applyDeadzone} from "./InputUtils";

/**
 * Internal state for tracking hand position and pinch gesture.
 */
interface HandState {
    position: Vector3;
    rotation: Quaternion;
    isPinching: boolean;
    pinchStrength: number;
}

/**
 * Controller entry for gesture tracking.
 */
interface ControllerEntry {
    controller: WebXRInputSource;
    handedness: string;
}

/**
 * XRInputHandler processes XR controller and hand tracking input.
 *
 * It handles:
 * - Thumbstick input for rotation, zoom, and panning
 * - Two-hand gestures for zoom and rotation
 *
 * Input mapping (matches demo):
 * - Left stick X: Yaw (turn left/right)
 * - Left stick Y: Pitch (tilt up/down)
 * - Right stick X: Pan left/right
 * - Right stick Y: Zoom in/out
 *
 * Input is applied to a PivotController which manages scene transformation.
 */
export class XRInputHandler {
    private pivotController: PivotController;
    private xr: WebXRDefaultExperience;
    private enabled = false;

    // Controller state - track by uniqueId to handle controller switching
    private setupControllers = new Map<string, boolean>();
    private controllerCleanup = new Map<string, () => void>();

    // Gesture controllers - track controllers for trigger-based gestures
    private gestureControllers = new Map<string, ControllerEntry>();

    // Thumbstick values - updated every frame
    private leftStick = {x: 0, y: 0};
    private rightStick = {x: 0, y: 0};

    // Hand tracking state for two-hand gestures
    private leftHand: HandState | null = null;
    private rightHand: HandState | null = null;
    private previousDistance: number | null = null;
    private previousDirection: Vector3 | null = null;

    // Track previous pinch state for hysteresis
    private wasPinching: Record<string, boolean> = {left: false, right: false};

    // Hand tracking feature reference
    private handTrackingFeature: unknown = null;

    // Sensitivity settings (matching demo)
    private readonly DEADZONE = 0.15;
    private readonly YAW_SPEED = 0.04;
    private readonly PITCH_SPEED = 0.03;
    private readonly PAN_SPEED = 0.08;
    private readonly ZOOM_SPEED = 0.02;
    private readonly GESTURE_ZOOM_SENSITIVITY = 2.0;
    private readonly PINCH_START = 0.7;
    private readonly PINCH_END = 0.5;

    // Input switch delay tracking
    private lastControllerRemovedTime = 0;
    private readonly INPUT_SWITCH_DELAY_MS = 100;

    // Node drag state - for XR node interaction
    private isDraggingNode = false;
    private draggedNodeHandler: NodeDragHandler | null = null;
    private dragHand: "left" | "right" | null = null;
    private lastDragHandPosition: Vector3 | null = null; // Previous frame position for delta calculation

    // Velocity-based gain (PRISM technique from VR research)
    // Raw hand deltas are tiny (~0.3mm/frame at 72fps), need significant amplification
    // User feedback: 5× was too slow - "full arm only moves 3 units"
    // Target: full arm movement (0.6m) should move node ~15-20 units
    private readonly VELOCITY_SLOW_THRESHOLD = 0.005; // meters/second - below this = precision mode
    private readonly VELOCITY_FAST_THRESHOLD = 0.03; // meters/second - above this = speed mode
    private readonly AMP_SLOW = 5.0; // Precision zone: usable but controlled
    private readonly AMP_MEDIUM = 10.0; // Natural zone: comfortable movement
    private readonly AMP_FAST = 20.0; // Speed zone: fast repositioning
    private lastDragTime = 0; // For velocity calculation

    // Smoothing to reduce jitter from hand tracking noise
    private readonly SMOOTHING_FACTOR = 0.7; // 0 = no smoothing, 1 = max smoothing
    private smoothedDelta: Vector3 | null = null;

    // Drag threshold - must move this far from pick point before node actually moves
    // Set high enough that natural hand tremor during a "click" doesn't trigger drag
    // Testing showed 2cm was too low - clicks naturally move 4-6cm
    private readonly DRAG_THRESHOLD = 0.08; // 8cm - requires intentional movement to drag
    private dragStartHandPosition: Vector3 | null = null; // Position when drag started
    private dragThresholdExceeded = false; // True once user moves far enough to start actual drag

    // Debug
    private frameCount = 0;
    private scene: Scene; // Reference to scene for onBeforeRenderObservable and picking

    constructor(pivotController: PivotController, xr: WebXRDefaultExperience) {
        this.pivotController = pivotController;
        this.xr = xr;
        this.scene = xr.baseExperience.sessionManager.scene;
        // Debug: XRInputHandler created
    }

    /**
     * Enable input handling.
     * Subscribes to controller add/remove events.
     */
    enable(): void {
        if (this.enabled) {
            return;
        }

        this.enabled = true;
        // Debug: XRInputHandler enabled with PIVOT approach

        // Try to get hand tracking feature
        this.enableHandTracking();

        // Subscribe to controller events
        this.xr.input.onControllerAddedObservable.add((controller) => {
            const now = performance.now();
            const timeSinceRemoval = now - this.lastControllerRemovedTime;

            if (timeSinceRemoval < this.INPUT_SWITCH_DELAY_MS && this.lastControllerRemovedTime > 0) {
                // Delay setup to prevent race conditions during controller switching
                const remainingDelay = this.INPUT_SWITCH_DELAY_MS - timeSinceRemoval;

                setTimeout(() => {
                    this.setupController(controller);
                    this.addGestureController(controller);
                }, remainingDelay);
            } else {
                this.setupController(controller);
                this.addGestureController(controller);
            }
        });

        this.xr.input.onControllerRemovedObservable.add((controller) => {
            this.cleanupController(controller);
            this.removeGestureController(controller);
        });

        // Process existing controllers
        this.xr.input.controllers.forEach((controller) => {
            this.setupController(controller);
            this.addGestureController(controller);
        });
    }

    /**
     * Enable hand tracking feature if available.
     */
    private enableHandTracking(): void {
        try {
            const {featuresManager} = this.xr.baseExperience;
            // Try to get already enabled feature first
            this.handTrackingFeature = featuresManager.getEnabledFeature("xr-hand-tracking");
        } catch {
            this.handTrackingFeature = null;
        }
    }

    /**
     * Add controller to gesture tracking.
     */
    private addGestureController(controller: WebXRInputSource): void {
        const {uniqueId} = controller;
        const {handedness} = controller.inputSource;

        if (handedness === "left" || handedness === "right") {
            this.gestureControllers.set(uniqueId, {
                controller,
                handedness,
            });
        }
    }

    /**
     * Remove controller from gesture tracking.
     */
    private removeGestureController(controller: WebXRInputSource): void {
        const {uniqueId} = controller;
        if (this.gestureControllers.has(uniqueId)) {
            this.gestureControllers.delete(uniqueId);
        }
    }

    /**
     * Disable input handling.
     * Clears controller and hand state.
     */
    disable(): void {
        if (!this.enabled) {
            return;
        }

        this.enabled = false;

        // Cleanup all controllers
        this.setupControllers.forEach((_value, uniqueId) => {
            const cleanup = this.controllerCleanup.get(uniqueId);
            if (cleanup) {
                cleanup();
            }
        });

        this.setupControllers.clear();
        this.controllerCleanup.clear();
        this.gestureControllers.clear();
        this.leftStick = {x: 0, y: 0};
        this.rightStick = {x: 0, y: 0};
        this.leftHand = null;
        this.rightHand = null;
        this.wasPinching = {left: false, right: false};
        this.handTrackingFeature = null;
        this.resetGestureState();
    }

    private setupController(controller: WebXRInputSource): void {
        const {handedness} = controller.inputSource;
        const {uniqueId} = controller;

        // Skip if already setup THIS specific controller
        if (this.setupControllers.has(uniqueId)) {
            return;
        }

        // Check if this is a hand (detected as controller but no real controller capabilities)
        const {inputSource} = controller;
        const hasHandProfile = inputSource.profiles.some(
            (p) => p.includes("hand") || p.includes("generic-trigger-touchpad"),
        );
        if (hasHandProfile) {
            return;
        }

        const setupThumbstick = (motionController: unknown): void => {
            if (this.setupControllers.has(uniqueId)) {
                return;
            }

            const mc = motionController as {
                getComponentIds: () => string[];
                getComponent: (id: string) => {
                    axes: {x: number, y: number};
                    onAxisValueChangedObservable: {add: (callback: (axes: {x: number, y: number}) => void) => unknown, remove: (observer: unknown) => void};
                    _disposed?: boolean;
                } | null;
            };

            const thumbstick = mc.getComponent("xr-standard-thumbstick");
            if (!thumbstick) {
                return;
            }

            this.setupControllers.set(uniqueId, true);

            const isLeftHand = handedness === "left";
            let isCleanedUp = false;

            // Axis change observer
            const axisCallback = (axes: {x: number, y: number}): void => {
                if (isCleanedUp) {
                    return;
                }

                const {x} = axes;
                const {y} = axes;

                if (isLeftHand) {
                    this.leftStick.x = x;
                    this.leftStick.y = y;
                } else {
                    this.rightStick.x = x;
                    this.rightStick.y = y;
                }
            };
            const axisObserver = thumbstick.onAxisValueChangedObservable.add(axisCallback);

            // Frame-by-frame polling as backup
            const scene = this.scene as {onBeforeRenderObservable: {add: (callback: () => void) => unknown, remove: (observer: unknown) => void}};
            let pollObserverRef: unknown = null;

            const pollThumbstick = (): void => {
                if (isCleanedUp || !this.enabled) {
                    return;
                }

                if (!this.setupControllers.has(uniqueId)) {
                    // Controller was removed
                    if (pollObserverRef) {
                        scene.onBeforeRenderObservable.remove(pollObserverRef);
                        pollObserverRef = null;
                    }

                    return;
                }

                if (thumbstick._disposed) {
                    if (pollObserverRef) {
                        scene.onBeforeRenderObservable.remove(pollObserverRef);
                        pollObserverRef = null;
                    }

                    return;
                }

                const currentX = thumbstick.axes.x;
                const currentY = thumbstick.axes.y;
                if (isLeftHand) {
                    this.leftStick.x = currentX;
                    this.leftStick.y = currentY;
                } else {
                    this.rightStick.x = currentX;
                    this.rightStick.y = currentY;
                }
            };

            pollObserverRef = scene.onBeforeRenderObservable.add(pollThumbstick);

            // Store cleanup function
            this.controllerCleanup.set(uniqueId, () => {
                isCleanedUp = true;

                if (axisObserver) {
                    try {
                        thumbstick.onAxisValueChangedObservable.remove(axisObserver);
                    } catch {
                        // Ignore errors during cleanup
                    }
                }

                if (pollObserverRef) {
                    try {
                        scene.onBeforeRenderObservable.remove(pollObserverRef);
                    } catch {
                        // Ignore errors during cleanup
                    }
                }
            });
        };

        const mc = controller as unknown as {
            motionController?: unknown;
            onMotionControllerInitObservable: {add: (callback: (mc: unknown) => void) => void};
        };

        if (mc.motionController) {
            setupThumbstick(mc.motionController);
        } else {
            mc.onMotionControllerInitObservable.add((motionController) => {
                setupThumbstick(motionController);
            });

            // Polling fallback
            let attempts = 0;
            const poll = setInterval(() => {
                attempts++;
                if (this.setupControllers.has(uniqueId) || attempts > 20) {
                    clearInterval(poll);
                    return;
                }

                if (mc.motionController) {
                    setupThumbstick(mc.motionController);
                    clearInterval(poll);
                }
            }, 100);
        }
    }

    private cleanupController(controller: WebXRInputSource): void {
        const {uniqueId} = controller;
        const {handedness} = controller.inputSource;

        const cleanup = this.controllerCleanup.get(uniqueId);
        if (cleanup) {
            cleanup();
            this.controllerCleanup.delete(uniqueId);
        }

        this.setupControllers.delete(uniqueId);

        // Clear stick values for the removed controller
        if (handedness === "left") {
            this.leftStick = {x: 0, y: 0};
        } else if (handedness === "right") {
            this.rightStick = {x: 0, y: 0};
        }

        // Record removal time for delay mechanism
        this.lastControllerRemovedTime = performance.now();
    }

    /**
     * Process input each frame.
     * Call this from render loop.
     */
    update(): void {
        if (!this.enabled) {
            return;
        }

        this.frameCount++;

        // Always process thumbsticks (they don't conflict with node dragging)
        this.processThumbsticks();

        // Update hand states before processing interactions
        this.updateHandStates();

        // Process node interaction first (single-hand picking/dragging)
        // This must happen before gesture processing
        this.processNodeInteraction();

        // Only process gestures if NOT dragging a node
        // Two-hand gestures are for view manipulation, not while dragging nodes
        if (!this.isDraggingNode) {
            this.processHandGesturesInternal();
        }
    }

    /**
     * Process thumbstick input from controllers.
     * Left stick: X = yaw, Y = pitch
     * Right stick: X = pan, Y = zoom
     */
    private processThumbsticks(): void {
        // Get raw stick values
        const rawLeftX = this.leftStick.x;
        const rawLeftY = this.leftStick.y;
        const rawRightX = this.rightStick.x;
        const rawRightY = this.rightStick.y;

        // Apply deadzone with curve
        const leftX = applyDeadzone(rawLeftX, this.DEADZONE);
        const leftY = applyDeadzone(rawLeftY, this.DEADZONE);
        const rightX = applyDeadzone(rawRightX, this.DEADZONE);
        const rightY = applyDeadzone(rawRightY, this.DEADZONE);

        const hasInput = leftX !== 0 || leftY !== 0 || rightX !== 0 || rightY !== 0;
        if (!hasInput) {
            return;
        }

        // LEFT STICK: Rotation (matching demo behavior)
        // X = yaw (push right = positive yaw = scene rotates right around you)
        // Y = pitch (push forward = negative pitch = look up)
        const yawDelta = leftX * this.YAW_SPEED;
        const pitchDelta = -leftY * this.PITCH_SPEED;

        if (Math.abs(yawDelta) > 0.0001 || Math.abs(pitchDelta) > 0.0001) {
            this.pivotController.rotate(yawDelta, pitchDelta);
        }

        // RIGHT STICK: Zoom and Pan
        // Y = zoom (push forward = zoom in = scale up)
        if (Math.abs(rightY) > 0.0001) {
            const zoomFactor = 1.0 + (rightY * this.ZOOM_SPEED);
            this.pivotController.zoom(zoomFactor);
        }

        // X = pan (push right = move focal point right)
        if (Math.abs(rightX) > 0.0001) {
            const panAmount = rightX * this.PAN_SPEED;
            this.pivotController.panViewRelative(panAmount, 0);
        }
    }

    /**
     * Process two-hand gesture input for zoom and rotation.
     * Requires both hands to be pinching.
     * Note: updateHandStates() is now called in update() before this method.
     */
    private processHandGesturesInternal(): void {
        // Need both hands pinching for gestures
        if (!this.leftHand?.isPinching || !this.rightHand?.isPinching) {
            return;
        }

        const leftPos = this.leftHand.position;
        const rightPos = this.rightHand.position;
        const currentDistance = Vector3.Distance(leftPos, rightPos);
        const direction = rightPos.subtract(leftPos);
        const currentDirection = direction.normalize();

        if (this.previousDistance === null || this.previousDirection === null) {
            this.previousDistance = currentDistance;
            this.previousDirection = currentDirection.clone();
            return;
        }

        // Zoom from distance change
        const distanceDelta = currentDistance - this.previousDistance;
        const zoomFactor = 1.0 + (distanceDelta * this.GESTURE_ZOOM_SENSITIVITY);
        // Invert: hands apart (positive delta) = zoom out = scale down
        this.pivotController.zoom(2.0 - Math.max(0.9, Math.min(1.1, zoomFactor)));

        // Rotation from direction change
        const rotationAxis = Vector3.Cross(this.previousDirection, currentDirection);
        const axisLength = rotationAxis.length();
        if (axisLength > 0.0001) {
            const dot = Vector3.Dot(this.previousDirection, currentDirection);
            const angle = Math.acos(Math.max(-1, Math.min(1, dot)));
            rotationAxis.scaleInPlace(1 / axisLength);
            // Negate for world-mode rotation
            this.pivotController.rotateAroundAxis(rotationAxis, -angle);
        }

        this.previousDistance = currentDistance;
        this.previousDirection = currentDirection.clone();
    }

    /**
     * Update hand states from controllers (trigger) or hand tracking.
     */
    private updateHandStates(): void {
        // Get hand state for both hands using priority: controller trigger > hand tracking
        this.leftHand = this.getHandState("left");
        this.rightHand = this.getHandState("right");
    }

    /**
     * Get hand state from controller trigger OR hand tracking.
     * Priority: Controller trigger first (squeeze triggers), then hand tracking.
     */
    private getHandState(handedness: "left" | "right"): HandState | null {
        // PATH 1: Try controller trigger first
        // Find controller by handedness
        let controllerEntry: ControllerEntry | null = null;
        for (const entry of this.gestureControllers.values()) {
            if (entry.handedness === handedness) {
                controllerEntry = entry;
                break;
            }
        }

        if (controllerEntry) {
            const {controller} = controllerEntry;
            const {grip} = controller;
            const mc = controller as unknown as {motionController?: {getComponent: (id: string) => {pressed?: boolean, value?: number} | null}};

            // Check if grip and motion controller are valid
            if (grip && mc.motionController) {
                try {
                    const gripPos = grip.position;
                    // Verify position is valid (not disposed)
                    if (isFinite(gripPos.x) && isFinite(gripPos.y) && isFinite(gripPos.z)) {
                        const trigger = mc.motionController.getComponent("xr-standard-trigger");
                        if (trigger) {
                            // Use trigger.pressed OR value > 0.5 for pinching
                            const triggerValue = trigger.value ?? 0;
                            const isPinching = trigger.pressed === true || triggerValue > 0.5;

                            if (isPinching) {
                                // Log when trigger state changes
                                if (!this.wasPinching[handedness]) {
                                    // eslint-disable-next-line no-console
                                    console.log(`🎮 TRIGGER_PRESS ${handedness} (val=${triggerValue.toFixed(2)})`);
                                }

                                this.wasPinching[handedness] = true;

                                return {
                                    position: gripPos.clone(),
                                    rotation: grip.rotationQuaternion?.clone() ?? Quaternion.Identity(),
                                    isPinching: true,
                                    pinchStrength: triggerValue,
                                };
                            } else if (this.wasPinching[handedness]) {
                                // eslint-disable-next-line no-console
                                console.log(`🎮 TRIGGER_RELEASE ${handedness} (val=${triggerValue.toFixed(2)})`);
                                this.wasPinching[handedness] = false;
                                this.resetGestureState();
                            }
                        }
                    }
                } catch {
                    // Controller is likely disposed, fall through to hand tracking
                }
            }
        }

        // PATH 2: Try hand tracking
        if (this.handTrackingFeature) {
            try {
                const htFeature = this.handTrackingFeature as {
                    getHandByHandedness?: (h: string) => {
                        getJointMesh: (joint: string) => {position: Vector3, rotationQuaternion?: Quaternion} | null;
                    } | null;
                };

                const hand = htFeature.getHandByHandedness?.(handedness);
                if (hand) {
                    const wrist = hand.getJointMesh("wrist");
                    const thumbTip = hand.getJointMesh("thumb-tip");
                    const indexTip = hand.getJointMesh("index-finger-tip");

                    if (wrist && thumbTip && indexTip) {
                        // Verify positions are valid (not NaN from disposed objects)
                        if (!isFinite(wrist.position.x) || !isFinite(thumbTip.position.x)) {
                            return null;
                        }

                        const pinchDist = Vector3.Distance(thumbTip.position, indexTip.position);
                        const PINCH_THRESHOLD = 0.04; // 4cm
                        const PINCH_RELEASE_THRESHOLD = 0.06; // 6cm (looser for release)

                        // Hysteresis: different thresholds for start vs stop
                        const wasP = this.wasPinching[handedness];
                        const isP = wasP ?
                            pinchDist < PINCH_RELEASE_THRESHOLD : // Already pinching - use looser threshold
                            pinchDist < PINCH_THRESHOLD; // Not pinching - use tighter threshold

                        if (isP !== wasP) {
                            // eslint-disable-next-line no-console
                            console.log(`🤲 PINCH_${isP ? "START" : "END"} ${handedness} (dist=${pinchDist.toFixed(3)})`);
                            if (!isP) {
                                this.resetGestureState();
                            }
                        }

                        this.wasPinching[handedness] = isP;

                        if (isP) {
                            return {
                                position: wrist.position.clone(),
                                rotation: wrist.rotationQuaternion?.clone() ?? Quaternion.Identity(),
                                isPinching: true,
                                pinchStrength: Math.max(0, 1 - (pinchDist / PINCH_THRESHOLD)),
                            };
                        }
                    }
                }
            } catch {
                // Hand tracking access error - ignore
            }
        }

        return null;
    }

    /**
     * Reset gesture tracking state.
     * Called when hands stop pinching or tracking is lost.
     */
    private resetGestureState(): void {
        this.previousDistance = null;
        this.previousDirection = null;
    }

    /**
     * Check if input handling is enabled.
     */
    isEnabled(): boolean {
        return this.enabled;
    }

    /**
     * Get reference to pivot controller (for testing).
     */
    getPivotController(): PivotController {
        return this.pivotController;
    }

    // ========================================================================
    // XR NODE INTERACTION
    // Handles picking and dragging nodes using XR controllers
    // ========================================================================

    /**
     * Process single-hand node interaction.
     * Called when only one hand is pinching (not both).
     * If the controller is pointing at a node, start/continue dragging it.
     */
    private processNodeInteraction(): void {
        const leftPinching = this.leftHand?.isPinching ?? false;
        const rightPinching = this.rightHand?.isPinching ?? false;

        // If both hands are pinching, don't do node interaction (gestures take over)
        if (leftPinching && rightPinching) {
            // If we were dragging a node, end the drag since user wants to gesture
            if (this.isDraggingNode) {
                this.endNodeDrag();
            }

            return;
        }

        // If we're currently dragging, update the drag
        if (this.isDraggingNode && this.draggedNodeHandler && this.dragHand) {
            const handState = this.dragHand === "left" ? this.leftHand : this.rightHand;

            if (handState?.isPinching) {
                // Continue dragging - update position based on controller movement
                this.updateNodeDrag(handState.position);
            } else {
                // Hand released, end drag
                this.endNodeDrag();
            }

            return;
        }

        // Not currently dragging - check if we should start
        if (leftPinching && !rightPinching && this.leftHand) {
            this.tryStartNodeDrag("left", this.leftHand.position);
        } else if (rightPinching && !leftPinching && this.rightHand) {
            this.tryStartNodeDrag("right", this.rightHand.position);
        }
    }

    /**
     * Try to start dragging a node if the controller is pointing at one.
     */
    private tryStartNodeDrag(handedness: "left" | "right", handPosition: Vector3): void {
        // Find the controller for this hand
        let controller: WebXRInputSource | null = null;
        for (const entry of this.gestureControllers.values()) {
            if (entry.handedness === handedness) {
                ({controller} = entry);
                break;
            }
        }

        if (!controller) {
            return;
        }

        // Get the controller's pointer ray using Babylon.js's proper method
        // This gives us the actual ray the WebXR system uses for interaction
        const ray = new Ray(Vector3.Zero(), Vector3.Forward(), 100);

        // Try to get the world pointer ray from the controller
        const controllerWithRay = controller as unknown as {
            getWorldPointerRayToRef?: (ray: Ray) => void;
        };

        if (controllerWithRay.getWorldPointerRayToRef) {
            controllerWithRay.getWorldPointerRayToRef(ray);
        } else {
            // Fallback: Use pointer node (always available) or grip node
            const pointerNode = controller.grip ?? controller.pointer;
            ray.origin = pointerNode.position.clone();
            ray.direction = pointerNode.forward.clone();
        }

        // Pick meshes in the scene
        const pickInfo = this.scene.pickWithRay(ray, (mesh) => {
            // Only pick node meshes (they have dragHandler in metadata or on the node)
            return mesh.isPickable && mesh.isEnabled();
        });

        if (!pickInfo?.hit || !pickInfo.pickedMesh) {
            return;
        }

        // Try to find the NodeDragHandler for this mesh
        const dragHandler = this.findDragHandlerForMesh(pickInfo.pickedMesh);
        if (!dragHandler) {
            return;
        }

        // Get the node's current position for debugging
        const node = dragHandler.getNode();
        const nodeMeshPosition = node.mesh.position;
        const {pickedPoint} = pickInfo;

        // DEBUG: Log drag start with all relevant positions
        // eslint-disable-next-line no-console
        console.log(`🎯 DRAG_START ${handedness}`, {
            handPos: `(${handPosition.x.toFixed(3)}, ${handPosition.y.toFixed(3)}, ${handPosition.z.toFixed(3)})`,
            nodePos: `(${nodeMeshPosition.x.toFixed(3)}, ${nodeMeshPosition.y.toFixed(3)}, ${nodeMeshPosition.z.toFixed(3)})`,
            pickPt: pickedPoint ? `(${pickedPoint.x.toFixed(3)}, ${pickedPoint.y.toFixed(3)}, ${pickedPoint.z.toFixed(3)})` : "null",
        });

        this.isDraggingNode = true;
        this.draggedNodeHandler = dragHandler;
        this.dragHand = handedness;
        this.lastDragHandPosition = handPosition.clone(); // Store for delta calculation
        this.dragStartHandPosition = handPosition.clone(); // Store initial position for threshold check
        this.dragThresholdExceeded = false; // Reset threshold flag
        this.lastDragTime = performance.now(); // Initialize time for velocity calculation

        // DON'T call onDragStart yet - wait until threshold is exceeded
        // This prevents the node from "twitching" from hand tremor
    }

    /**
     * Update node drag position based on controller movement.
     *
     * Uses delta-based movement from the working demo:
     * 1. Calculate delta from previous frame (not drag start)
     * 2. Transform delta through pivot rotation
     * 3. Apply amplification
     * 4. Add to current node position
     *
     * This approach correctly handles pivot rotation changes during drag.
     */
    // Track drag update count for limiting debug logs
    private dragUpdateCount = 0;

    private updateNodeDrag(currentHandPosition: Vector3): void {
        if (!this.draggedNodeHandler || !this.lastDragHandPosition || !this.dragStartHandPosition) {
            return;
        }

        const now = performance.now();

        // Check if we've exceeded the drag threshold yet
        if (!this.dragThresholdExceeded) {
            const distanceFromStart = Vector3.Distance(currentHandPosition, this.dragStartHandPosition);

            if (distanceFromStart < this.DRAG_THRESHOLD) {
                // Still within threshold - don't move the node yet
                // Update lastDragHandPosition so we track movement for when threshold is exceeded
                this.lastDragHandPosition = currentHandPosition.clone();
                this.lastDragTime = now;
                return;
            }

            // Threshold exceeded! Now we're actually dragging
            this.dragThresholdExceeded = true;
            // eslint-disable-next-line no-console
            console.log(`🎯 DRAG_THRESHOLD_EXCEEDED (dist=${distanceFromStart.toFixed(3)})`);

            // NOW call onDragStart since user has committed to dragging
            const node = this.draggedNodeHandler.getNode();
            this.draggedNodeHandler.onDragStart(node.mesh.position.clone());

            // Reset lastDragHandPosition to current so first delta is from threshold point
            this.lastDragHandPosition = currentHandPosition.clone();
            this.lastDragTime = now;
            return;
        }

        // Calculate delta from previous frame (not drag start)
        const xrDelta = currentHandPosition.subtract(this.lastDragHandPosition);

        // Skip if no significant movement
        const deltaLength = xrDelta.length();
        if (deltaLength < 0.0001) {
            return;
        }

        this.dragUpdateCount++;

        // Calculate velocity for PRISM-style adaptive gain
        const deltaTimeMs = now - this.lastDragTime;
        const deltaTimeSec = Math.max(deltaTimeMs / 1000, 0.001); // Minimum 1ms to avoid division by zero
        const velocity = deltaLength / deltaTimeSec; // meters per second

        // Apply velocity-based amplification (PRISM technique)
        const amplification = this.calculateVelocityBasedGain(velocity);

        // Transform delta through pivot rotation
        const sceneDelta = this.transformDeltaToSceneSpace(xrDelta);

        // Apply velocity-based amplification
        sceneDelta.scaleInPlace(amplification);

        // Apply smoothing to reduce jitter from hand tracking noise
        if (this.smoothedDelta === null) {
            this.smoothedDelta = sceneDelta.clone();
        } else {
            // Exponential moving average: smoothed = smoothed * factor + new * (1 - factor)
            this.smoothedDelta.scaleInPlace(this.SMOOTHING_FACTOR);
            this.smoothedDelta.addInPlace(sceneDelta.scale(1 - this.SMOOTHING_FACTOR));
        }

        // Use smoothed delta for position update
        const finalDelta = this.smoothedDelta.clone();

        // Get current node position and add delta
        const node = this.draggedNodeHandler.getNode();
        const currentNodePos = node.mesh.position.clone();
        const newPosition = currentNodePos.add(finalDelta);

        // DEBUG: Log only first 5 updates to catch initial movement issues
        if (this.dragUpdateCount <= 5) {
            // eslint-disable-next-line no-console
            console.log(`🎯 DRAG_UPDATE #${this.dragUpdateCount}`, {
                delta: `(${xrDelta.x.toFixed(4)}, ${xrDelta.y.toFixed(4)}, ${xrDelta.z.toFixed(4)})`,
                vel: velocity.toFixed(3),
                amp: amplification.toFixed(2),
                newPos: `(${newPosition.x.toFixed(3)}, ${newPosition.y.toFixed(3)}, ${newPosition.z.toFixed(3)})`,
            });
        }

        // Update via drag handler (handles layout engine)
        this.draggedNodeHandler.setPositionDirect(newPosition);

        // Store for next frame
        this.lastDragHandPosition = currentHandPosition.clone();
        this.lastDragTime = now;
    }

    /**
     * Calculate velocity-based gain using PRISM technique.
     * Slow movements → low amplification (precision)
     * Fast movements → higher amplification (speed)
     *
     * This provides intuitive control: fine adjustments when moving slowly,
     * quick repositioning when moving fast.
     */
    private calculateVelocityBasedGain(velocity: number): number {
        if (velocity < this.VELOCITY_SLOW_THRESHOLD) {
            // Precision zone: reduce amplification for fine control
            return this.AMP_SLOW;
        }

        if (velocity > this.VELOCITY_FAST_THRESHOLD) {
            // Speed zone: increase amplification for faster repositioning
            return this.AMP_FAST;
        }

        // Transition zone: linear interpolation between slow and fast
        const t = (velocity - this.VELOCITY_SLOW_THRESHOLD) /
                  (this.VELOCITY_FAST_THRESHOLD - this.VELOCITY_SLOW_THRESHOLD);
        return this.AMP_SLOW + (t * (this.AMP_FAST - this.AMP_SLOW));
    }

    /**
     * Transform a movement delta from XR space to scene space.
     * This accounts for the pivot's rotation so movements feel natural.
     *
     * When the pivot rotates, the user's view rotates with it.
     * The user's "forward" direction in their view corresponds to a rotated direction in world space.
     * So we rotate the XR movement by the pivot's rotation to match the user's perspective.
     */
    private transformDeltaToSceneSpace(delta: Vector3): Vector3 {
        const pivotRotation = this.pivotController.pivot.rotationQuaternion;
        if (!pivotRotation) {
            return delta.clone();
        }

        // Transform the delta by the pivot rotation
        const transformedDelta = delta.clone();
        transformedDelta.rotateByQuaternionToRef(pivotRotation, transformedDelta);
        return transformedDelta;
    }

    /**
     * End the current node drag.
     * If threshold was never exceeded, this was actually a selection (tap), not a drag.
     */
    private endNodeDrag(): void {
        if (this.draggedNodeHandler) {
            if (this.dragThresholdExceeded) {
                // User actually dragged - end the drag normally
                // eslint-disable-next-line no-console
                console.log(`🎯 DRAG_END (${this.dragUpdateCount} updates)`);
                this.draggedNodeHandler.onDragEnd();
            } else {
                // User released before threshold - this is a SELECTION, not a drag
                // eslint-disable-next-line no-console
                console.log("🎯 SELECT (threshold not exceeded)");

                // Select the node using the drag handler's select() method
                this.draggedNodeHandler.select();
            }
        }

        this.isDraggingNode = false;
        this.draggedNodeHandler = null;
        this.dragHand = null;
        this.lastDragHandPosition = null;
        this.dragStartHandPosition = null;
        this.dragThresholdExceeded = false;
        this.dragUpdateCount = 0; // Reset for next drag
        this.lastDragTime = 0; // Reset velocity tracking
        this.smoothedDelta = null; // Reset smoothing for next drag
    }

    /**
     * Find the NodeDragHandler associated with a mesh.
     * Nodes store their dragHandler reference in mesh.metadata.graphNode.
     */
    private findDragHandlerForMesh(mesh: {name: string, metadata?: unknown}): NodeDragHandler | null {
        // Check mesh.metadata.graphNode for node reference
        // Node.ts sets: mesh.metadata = { graphNode: this, ... }
        if (mesh.metadata && typeof mesh.metadata === "object") {
            const metadata = mesh.metadata as {graphNode?: {dragHandler?: NodeDragHandler}};
            if (metadata.graphNode?.dragHandler) {
                return metadata.graphNode.dragHandler;
            }
        }

        return null;
    }

    /**
     * Check if currently dragging a node.
     * Used to suppress gesture processing while dragging.
     */
    isDragging(): boolean {
        return this.isDraggingNode;
    }
}
