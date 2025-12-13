import {type Scene, type TransformNode, type WebXRDefaultExperience, WebXRState} from "@babylonjs/core";

import {PivotController} from "./PivotController";
import {XRInputHandler} from "./XRInputHandler";

/**
 * XRPivotCameraController manages XR camera interactions using a pivot-based system.
 *
 * This controller:
 * - Creates a PivotController to manage scene transformation
 * - Parents the XR camera to the pivot when entering XR
 * - Processes input via XRInputHandler for thumbstick and gesture controls
 *
 * The pivot-based approach allows intuitive manipulation:
 * - Rotation rotates the scene around the pivot
 * - Zoom scales the scene uniformly
 * - Pan translates the scene
 */
export class XRPivotCameraController {
    private pivotController: PivotController;
    private inputHandler: XRInputHandler;
    private xr: WebXRDefaultExperience;
    private scene: Scene;
    private frameCount = 0;

    constructor(scene: Scene, xr: WebXRDefaultExperience) {
        this.scene = scene;
        this.xr = xr;
        this.pivotController = new PivotController(scene);
        this.inputHandler = new XRInputHandler(this.pivotController, xr);

        console.log("📷 [XRPivotCameraController] Created");

        this.setupXRListeners();
    }

    /**
     * Setup listeners for XR state changes.
     * When entering XR, parents camera to pivot and enables input.
     * When exiting XR, disables input and unparents camera.
     */
    private setupXRListeners(): void {
        console.log("📷 [XRPivotCameraController] Setting up XR state listeners");

        // Check if we're already in XR (can happen if controller is created after session started)
        const currentState = this.xr.baseExperience.state;
        console.log(`📷 [XRPivotCameraController] Current XR state: ${WebXRState[currentState]}`);

        if (currentState === WebXRState.IN_XR) {
            console.log("📷 [XRPivotCameraController] Already in XR, enabling immediately");
            this.enableXRMode();
        }

        this.xr.baseExperience.onStateChangedObservable.add((state) => {
            const stateName = WebXRState[state];
            console.log(`📷 [XRPivotCameraController] XR state changed: ${stateName}`);

            if (state === WebXRState.IN_XR) {
                this.enableXRMode();
            } else if (state === WebXRState.NOT_IN_XR) {
                this.disableXRMode();
            }
        });

        // Also listen for initial XR pose to log camera position
        this.xr.baseExperience.onInitialXRPoseSetObservable.add((xrCamera) => {
            console.log("📷 [XRPivotCameraController] Initial XR pose set:", {
                cameraName: xrCamera.name,
                position: `(${xrCamera.position.x.toFixed(2)}, ${xrCamera.position.y.toFixed(2)}, ${xrCamera.position.z.toFixed(2)})`,
            });
        });
    }

    /**
     * Enable XR mode - parent camera to pivot and enable input.
     */
    private enableXRMode(): void {
        // Parent XR camera to pivot
        const camera = this.xr.baseExperience.camera;
        camera.parent = this.pivotController.pivot;
        console.log("📷 [XRPivotCameraController] XR camera parented to pivot:", {
            pivotName: this.pivotController.pivot.name,
            cameraName: camera.name,
            cameraParent: camera.parent?.name,
        });

        // Parent hand tracking meshes to the pivot as well
        // This ensures hand meshes move with the camera when pivot transforms
        this.parentHandMeshesToPivot();

        this.inputHandler.enable();
        console.log("📷 [XRPivotCameraController] Input handler enabled");
    }

    /**
     * Parent hand tracking joint meshes to the pivot.
     * This is needed because hand meshes are created in world space,
     * but we need them to move with the camera when the pivot transforms.
     */
    private parentHandMeshesToPivot(): void {
        try {
            const {featuresManager} = this.xr.baseExperience;
            const handTracking = featuresManager.getEnabledFeature("xr-hand-tracking") as unknown;

            if (!handTracking) {
                console.log("📷 [XRPivotCameraController] No hand tracking feature to parent");
                return;
            }

            const htFeature = handTracking as {
                leftHand?: {handMesh?: {parent: unknown}};
                rightHand?: {handMesh?: {parent: unknown}};
            };

            // Parent left hand mesh if exists
            if (htFeature.leftHand?.handMesh) {
                htFeature.leftHand.handMesh.parent = this.pivotController.pivot;
                console.log("📷 [XRPivotCameraController] Left hand mesh parented to pivot");
            }

            // Parent right hand mesh if exists
            if (htFeature.rightHand?.handMesh) {
                htFeature.rightHand.handMesh.parent = this.pivotController.pivot;
                console.log("📷 [XRPivotCameraController] Right hand mesh parented to pivot");
            }

            // Also try to find and parent joint meshes
            // Joint meshes might be named "xr-hand-joint-*"
            const meshes = this.scene.meshes.filter((m) => m.name.includes("hand") || m.name.includes("Hand"));
            if (meshes.length > 0) {
                console.log(`📷 [XRPivotCameraController] Found ${meshes.length} hand-related meshes`);
                for (const mesh of meshes) {
                    if (!mesh.parent) {
                        mesh.parent = this.pivotController.pivot;
                        console.log(`📷 [XRPivotCameraController] Parented mesh: ${mesh.name}`);
                    }
                }
            }
        } catch (error) {
            console.warn("📷 [XRPivotCameraController] Error parenting hand meshes:", error);
        }
    }

    /**
     * Disable XR mode - unparent camera and disable input.
     */
    private disableXRMode(): void {
        console.log("📷 [XRPivotCameraController] Exiting XR, disabling input");
        this.inputHandler.disable();
        this.xr.baseExperience.camera.parent = null;
    }

    /**
     * Update input handling.
     * Call this every frame in the render loop.
     */
    update(): void {
        this.frameCount++;

        // Heartbeat logging every 5 seconds (assuming ~60fps)
        if (this.frameCount % 300 === 0) {
            const camera = this.xr.baseExperience.camera;
            const pivot = this.pivotController.pivot;
            console.log(`💓 [XRPivotCameraController] Heartbeat frame ${this.frameCount}:`, {
                inputEnabled: this.inputHandler.isEnabled(),
                cameraParent: camera?.parent?.name ?? "null",
                pivotPos: `(${pivot.position.x.toFixed(2)}, ${pivot.position.y.toFixed(2)}, ${pivot.position.z.toFixed(2)})`,
                pivotScale: pivot.scaling.x.toFixed(3),
            });
        }

        this.inputHandler.update();
    }

    /**
     * Get the pivot TransformNode.
     * Can be used to parent scene objects that should move with the camera.
     */
    get pivot(): TransformNode {
        return this.pivotController.pivot;
    }

    /**
     * Get the PivotController instance for direct manipulation.
     */
    getPivotController(): PivotController {
        return this.pivotController;
    }

    /**
     * Get the XRInputHandler instance.
     */
    getInputHandler(): XRInputHandler {
        return this.inputHandler;
    }

    /**
     * Reset the pivot to its initial state.
     */
    reset(): void {
        this.pivotController.reset();
    }

    /**
     * Dispose of resources.
     */
    dispose(): void {
        this.inputHandler.disable();
        this.pivotController.pivot.dispose();
    }
}
