import {
    ActionManager,
    ExecuteCodeAction,
    Matrix,
    type Observer,
    PointerEventTypes,
    type PointerInfoPre,
    Ray,
    Scene,
    Vector3,
} from "@babylonjs/core";

import type {Graph} from "./Graph";
import type {GraphContext} from "./managers/GraphContext";
import type {Node as GraphNode, NodeIdType} from "./Node";

interface NodeBehaviorOptions {
    pinOnDrag?: boolean;
}

// Define drag state interface
interface DragState {
    dragging: boolean;
    dragStartMeshPosition: Vector3 | null;
    dragStartWorldPosition: Vector3 | null;
    dragPlaneNormal: Vector3 | null;
}

// Click detection state
interface ClickState {
    pointerDownTime: number;
    pointerDownPosition: {x: number, y: number};
    hasMoved: boolean;
}

// Click detection thresholds
const CLICK_MAX_DURATION_MS = 300; // Maximum time for a click (vs long press/drag)
const CLICK_MAX_MOVEMENT_PX = 5; // Maximum pixels of movement for a click

/**
 * Main drag handler class - unified for both desktop and XR
 */
export class NodeDragHandler {
    private node: GraphNode;
    private dragState: DragState;
    private clickState: ClickState | null = null;
    private scene: Scene;
    private pointerObserver: Observer<PointerInfoPre> | null = null;
    private readonly zAxisAmplification: number;
    private readonly enableZAmplificationInDesktop: boolean;

    constructor(node: GraphNode) {
        this.node = node;
        this.scene = node.mesh.getScene();
        this.dragState = {
            dragging: false,
            dragStartMeshPosition: null,
            dragStartWorldPosition: null,
            dragPlaneNormal: null,
        };

        // Read config from graph context
        const context = this.getContext();
        const xrConfig = context.getConfig().xr;

        this.zAxisAmplification = xrConfig?.input.zAxisAmplification ?? 10.0;
        this.enableZAmplificationInDesktop = xrConfig?.input.enableZAmplificationInDesktop ?? false;

        // Setup pointer event listeners
        this.setupPointerEvents();
    }

    // Public API for both desktop and XR
    public onDragStart(worldPosition: Vector3): void {
        console.log("🔍 [Drag] Drag Start:", {
            nodeId: this.node.id,
            isXRMode: this.isXRMode(),
        });

        this.dragState.dragging = true;
        this.dragState.dragStartMeshPosition = this.node.mesh.position.clone();
        this.dragState.dragStartWorldPosition = worldPosition.clone();
        this.node.dragging = true;

        // Capture the drag plane orientation at drag start
        // This prevents the plane from rotating with camera during drag
        const camera = this.scene.activeCamera;
        if (camera) {
            this.dragState.dragPlaneNormal = camera.getForwardRay().direction.clone();

            // Disable camera input handler during node drag
            // This prevents OrbitInputController from rotating camera while dragging nodes
            const cameraManager = this.scene.metadata?.cameraManager;
            if (cameraManager) {
                console.log("📷 Disabling camera input during node drag");
                cameraManager.temporarilyDisableInput();
            }
        }

        // Make sure graph is running
        const context = this.getContext();
        context.setRunning(true);
    }

    public onDragUpdate(worldPosition: Vector3): void {
        if (!this.dragState.dragging || !this.dragState.dragStartWorldPosition || !this.dragState.dragStartMeshPosition) {
            return;
        }

        // Calculate delta from drag start
        const delta = worldPosition.subtract(this.dragState.dragStartWorldPosition);

        // TODO: Add back delta validation with appropriate threshold for XR mode
        // The previous MAX_REASONABLE_DELTA of 5.0 was too small for 10x amplification
        // and was blocking ALL movement in XR

        // Apply movement amplification in XR mode
        // In VR, all controller movements are physically constrained (not just Z-axis)
        // so we amplify all axes to make node manipulation practical
        const shouldAmplify = this.isXRMode() || this.enableZAmplificationInDesktop;

        if (shouldAmplify) {
            delta.x *= this.zAxisAmplification;
            delta.y *= this.zAxisAmplification;
            delta.z *= this.zAxisAmplification;
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
    }

    public onDragEnd(): void {
        if (!this.dragState.dragging) {
            return;
        }

        console.log("🏁 NodeDragHandler.onDragEnd called", {
            nodeId: this.node.id,
            finalPosition: this.node.mesh.position.asArray(),
        });

        // Make sure graph is running
        const context = this.getContext();
        context.setRunning(true);

        // Pin after dragging if configured
        if (this.node.pinOnDrag) {
            this.node.pin();
        }

        // Re-enable camera input handler after node drag
        const cameraManager = this.scene.metadata?.cameraManager;
        if (cameraManager) {
            console.log("📷 Re-enabling camera input after node drag");
            cameraManager.temporarilyEnableInput();
        }

        // Reset drag state
        this.node.dragging = false;
        this.dragState.dragging = false;
        this.dragState.dragStartMeshPosition = null;
        this.dragState.dragStartWorldPosition = null;
        this.dragState.dragPlaneNormal = null;
    }

    /**
     * Set node position directly (for XR mode).
     * XRInputHandler calculates the position with pivot transform and amplification,
     * then calls this method to update the node and layout engine.
     *
     * This bypasses the delta calculation in onDragUpdate() which doesn't account
     * for pivot rotation changes during drag.
     */
    public setPositionDirect(newPosition: Vector3): void {
        if (!this.dragState.dragging) {
            return;
        }

        // Update mesh position
        this.node.mesh.position.copyFrom(newPosition);

        // Update layout engine
        const context = this.getContext();
        context.getLayoutManager().layoutEngine?.setNodePosition(this.node, {
            x: newPosition.x,
            y: newPosition.y,
            z: newPosition.z,
        });
    }

    /**
     * Get the node being dragged.
     * Used by XRInputHandler to access the node's mesh for position calculations.
     */
    public getNode(): GraphNode {
        return this.node;
    }

    // Internal methods
    private setupPointerEvents(): void {
        // Listen to pointer events for node dragging and clicking
        this.pointerObserver = this.scene.onPrePointerObservable.add((pointerInfo) => {
            // Skip desktop pointer handling in XR mode - XRInputHandler handles it
            // This prevents conflicts where XR generates pointer events that the
            // desktop handler would misinterpret with wrong world position calculations
            if (this.isXRMode()) {
                return;
            }

            switch (pointerInfo.type) {
                case PointerEventTypes.POINTERDOWN: {
                    // Check if we clicked on this node
                    const pickInfo = this.scene.pick(
                        this.scene.pointerX,
                        this.scene.pointerY,
                    );

                    // Use nodeId from mesh metadata for comparison
                    // This works with both regular and instanced meshes
                    const pickedNodeId = pickInfo.pickedMesh?.metadata?.nodeId;

                    if (pickedNodeId === this.node.id) {
                        // Initialize click tracking
                        this.clickState = {
                            pointerDownTime: Date.now(),
                            pointerDownPosition: {
                                x: this.scene.pointerX,
                                y: this.scene.pointerY,
                            },
                            hasMoved: false,
                        };

                        // Get world position from pointer
                        const ray = this.scene.createPickingRay(
                            this.scene.pointerX,
                            this.scene.pointerY,
                            Matrix.Identity(),
                            this.scene.activeCamera,
                        );
                        const worldPosition = this.getWorldPositionFromRay(ray);
                        this.onDragStart(worldPosition);
                    }

                    break;
                }

                case PointerEventTypes.POINTERMOVE:
                    if (this.dragState.dragging) {
                        // Track movement for click detection
                        if (this.clickState && !this.clickState.hasMoved) {
                            const dx = this.scene.pointerX - this.clickState.pointerDownPosition.x;
                            const dy = this.scene.pointerY - this.clickState.pointerDownPosition.y;
                            const distance = Math.sqrt((dx * dx) + (dy * dy));
                            if (distance > CLICK_MAX_MOVEMENT_PX) {
                                this.clickState.hasMoved = true;
                            }
                        }

                        const ray = this.scene.createPickingRay(
                            this.scene.pointerX,
                            this.scene.pointerY,
                            Matrix.Identity(),
                            this.scene.activeCamera,
                        );
                        const worldPosition = this.getWorldPositionFromRay(ray);
                        this.onDragUpdate(worldPosition);
                    }

                    break;

                case PointerEventTypes.POINTERUP:
                    if (this.dragState.dragging) {
                        // Check if this was a click (short duration, minimal movement)
                        const wasClick = this.isClick();

                        this.onDragEnd();

                        // If it was a click, select this node
                        if (wasClick) {
                            this.handleClick();
                        }
                    }

                    // Reset click state
                    this.clickState = null;
                    break;
                default:
                    // Ignore other pointer events
                    break;
            }
        });
    }

    /**
     * Check if the current pointer interaction qualifies as a click.
     * A click is defined as a short duration interaction with minimal movement.
     */
    private isClick(): boolean {
        if (!this.clickState) {
            return false;
        }

        const duration = Date.now() - this.clickState.pointerDownTime;
        return duration < CLICK_MAX_DURATION_MS && !this.clickState.hasMoved;
    }

    /**
     * Handle a click on this node - select it.
     */
    private handleClick(): void {
        // Get the selection manager from the graph context
        const context = this.getContext();
        const selectionManager = context.getSelectionManager?.();
        if (selectionManager) {
            selectionManager.select(this.node);
        }
    }

    private getWorldPositionFromRay(ray: Ray): Vector3 {
        // Strategy: Plane intersection parallel to camera view
        // This maintains predictable drag behavior
        const camera = this.scene.activeCamera;
        if (!camera) {
            return this.node.mesh.position.clone();
        }

        const nodePosition = this.node.mesh.position;

        // Use stored plane normal from drag start if available
        // Otherwise fall back to current camera forward (for initial calculation)
        const cameraForward = camera.getForwardRay().direction;
        const planeNormal = this.dragState.dragPlaneNormal ?? cameraForward;

        // Calculate distance from camera to node along plane normal
        const cameraToNode = nodePosition.subtract(camera.position);
        const depth = Vector3.Dot(cameraToNode, planeNormal);

        // Create plane at node depth, with orientation from drag start
        const planePoint = camera.position.add(planeNormal.scale(depth));

        // Ray-plane intersection
        const denominator = Vector3.Dot(ray.direction, planeNormal);
        if (Math.abs(denominator) < 0.0001) {
            // Ray parallel to plane, return current position
            return this.node.mesh.position.clone();
        }

        const t = Vector3.Dot(
            planePoint.subtract(ray.origin),
            planeNormal,
        ) / denominator;

        return ray.origin.add(ray.direction.scale(t));
    }

    private isXRMode(): boolean {
        // Check if we're in an XR session
        // The scene has an xrSession property when XR is active
        const xrHelper = this.scene.metadata?.xrHelper;
        return xrHelper?.baseExperience?.state === 2; // WebXRState.IN_XR
    }

    private getContext(): GraphContext {
        // Check if parentGraph has GraphContext methods
        if ("getStyles" in this.node.parentGraph) {
            return this.node.parentGraph;
        }

        // Otherwise, it's a Graph instance which implements GraphContext
        return this.node.parentGraph;
    }

    public dispose(): void {
        if (this.pointerObserver) {
            this.scene.onPrePointerObservable.remove(this.pointerObserver);
            this.pointerObserver = null;
        }
    }
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class NodeBehavior {
    /**
     * Add default interaction behaviors to a node
     */
    static addDefaultBehaviors(node: GraphNode, options: NodeBehaviorOptions = {}): void {
        node.mesh.isPickable = true;

        // Set pinOnDrag config
        node.pinOnDrag = options.pinOnDrag ?? true;

        // Create unified drag handler (replaces SixDofDragBehavior)
        const dragHandler = new NodeDragHandler(node);
        node.dragHandler = dragHandler;

        this.addClickBehavior(node);
    }

    /**
     * Add click behavior for node expansion
     */
    private static addClickBehavior(node: GraphNode): void {
        // click behavior setup
        const context = this.getContext(node);
        const scene = context.getScene();
        node.mesh.actionManager = node.mesh.actionManager ?? new ActionManager(scene);

        // Available triggers:
        // ActionManager.OnDoublePickTrigger
        // ActionManager.OnRightPickTrigger
        // ActionManager.OnCenterPickTrigger
        // ActionManager.OnLongPressTrigger

        // Only Graph has fetchNodes/fetchEdges, not GraphContext
        // For now, check if parentGraph is the full Graph instance
        const graph = node.parentGraph as Graph & {fetchNodes?: unknown, fetchEdges?: unknown};
        if (graph.fetchNodes && graph.fetchEdges) {
            const {fetchNodes, fetchEdges} = graph;

            node.mesh.actionManager.registerAction(
                new ExecuteCodeAction(
                    {
                        trigger: ActionManager.OnDoublePickTrigger,
                        // trigger: ActionManager.OnLongPressTrigger,
                    },
                    () => {
                        // make sure the graph is running
                        context.setRunning(true);

                        // fetch all edges for current node
                        const edgeSet = fetchEdges(node, graph as unknown as Graph);
                        const edges = Array.from(edgeSet);

                        // create set of unique node ids
                        const nodeIds = new Set<NodeIdType>();
                        edges.forEach((e) => {
                            nodeIds.add(e.src);
                            nodeIds.add(e.dst);
                        });
                        nodeIds.delete(node.id);

                        // fetch all nodes from associated edges
                        const nodes = fetchNodes(nodeIds, graph);

                        // add all the nodes and edges we collected
                        const dataManager = context.getDataManager();
                        dataManager.addNodes([... nodes]);
                        dataManager.addEdges([... edges]);

                        // TODO: fetch and add secondary edges
                    },
                ),
            );
        }
    }

    /**
     * Helper to get GraphContext from a Node
     */
    private static getContext(node: GraphNode): GraphContext {
        // Check if parentGraph has GraphContext methods
        if ("getStyles" in node.parentGraph) {
            return node.parentGraph;
        }

        // Otherwise, it's a Graph instance which implements GraphContext
        return node.parentGraph;
    }
}
