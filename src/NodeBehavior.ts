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

/**
 * Main drag handler class - unified for both desktop and XR
 */
export class NodeDragHandler {
    private node: GraphNode;
    private dragState: DragState;
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
        const xrConfig = context.getConfig()?.xr;

        this.zAxisAmplification = xrConfig?.input.zAxisAmplification ?? 10.0;
        this.enableZAmplificationInDesktop = xrConfig?.input.enableZAmplificationInDesktop ?? false;

        // Setup pointer event listeners
        this.setupPointerEvents();
    }

    // Public API for both desktop and XR
    public onDragStart(worldPosition: Vector3): void {
        // 🔍 TEST 4: Drag Start Positions
        console.log('🔍 [TEST 4] Drag Start:', {
            nodeId: this.node.id,
            worldPosition: worldPosition.asArray(),
            meshPosition: this.node.mesh.position.asArray(),
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

            // ⚠️ TEMPORARILY DISABLED: Detach camera controls to prevent camera rotation during node drag
            // Commenting out to isolate Z-axis problem from camera rotation problem
            // const canvas = this.scene.getEngine().getRenderingCanvas();
            // if (canvas) {
            //     console.log('📷 Detaching camera controls', {
            //         cameraType: camera.constructor.name,
            //         hasCanvas: !!canvas,
            //     });
            //     camera.detachControl();
            // }
        }

        // Make sure graph is running
        const context = this.getContext();
        context.setRunning(true);
    }

    public onDragUpdate(worldPosition: Vector3): void {
        if (!this.dragState.dragging || !this.dragState.dragStartWorldPosition || !this.dragState.dragStartMeshPosition) {
            return;
        }

        // 🔍 TEST 1: XR Mode Detection
        console.log('🔍 [TEST 1] XR Mode Detection:', {
            isXRMode: this.isXRMode(),
            sceneMetadata: {
                exists: !!this.scene.metadata,
                xrHelper: {
                    exists: !!this.scene.metadata?.xrHelper,
                    baseExperience: {
                        exists: !!this.scene.metadata?.xrHelper?.baseExperience,
                        state: this.scene.metadata?.xrHelper?.baseExperience?.state,
                    },
                },
            },
            activeCamera: {
                className: this.scene.activeCamera?.getClassName(),
                metadata: this.scene.activeCamera?.metadata,
            },
        });

        // Calculate delta from drag start
        const delta = worldPosition.subtract(this.dragState.dragStartWorldPosition);

        // 🔍 TEST 2: Z-Axis Delta Values
        console.log('🔍 [TEST 2] Delta Calculation:', {
            worldPosition: worldPosition.asArray(),
            dragStartWorldPosition: this.dragState.dragStartWorldPosition.asArray(),
            delta: {
                x: delta.x,
                y: delta.y,
                z: delta.z,
            },
            deltaLength: delta.length(),
        });

        // Apply movement amplification in XR mode
        // In VR, all controller movements are physically constrained (not just Z-axis)
        // so we amplify all axes to make node manipulation practical
        const shouldAmplify = this.isXRMode() || this.enableZAmplificationInDesktop;

        // 🔍 TEST 2: Amplification Config
        console.log('🔍 [TEST 2] Amplification Config:', {
            shouldAmplify,
            zAxisAmplification: this.zAxisAmplification,
            enableZAmplificationInDesktop: this.enableZAmplificationInDesktop,
        });

        if (shouldAmplify) {
            console.log('🔍 [TEST 2] BEFORE amplification - delta:', delta.asArray());
            delta.x *= this.zAxisAmplification;
            delta.y *= this.zAxisAmplification;
            delta.z *= this.zAxisAmplification;
            console.log('🔍 [TEST 2] AFTER amplification - delta:', delta.asArray());
        } else {
            console.log('🔍 [TEST 2] Amplification SKIPPED');
        }

        // Calculate new position
        const newPosition = this.dragState.dragStartMeshPosition.add(delta);

        // 🔍 TEST 2: Position Calculation
        console.log('🔍 [TEST 2] Position Update:', {
            dragStartMeshPosition: this.dragState.dragStartMeshPosition.asArray(),
            newPosition: newPosition.asArray(),
            actualMeshPosition: this.node.mesh.position.asArray(),
        });

        // Update mesh position (triggers edge updates automatically)
        this.node.mesh.position.copyFrom(newPosition);

        // 🔍 TEST 2: Verify Position Was Set
        console.log('🔍 [TEST 2] After copyFrom - mesh.position:',
            this.node.mesh.position.asArray());

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

        console.log('🏁 NodeDragHandler.onDragEnd called', {
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

        // ⚠️ TEMPORARILY DISABLED: Reattach camera controls after node drag
        // Commenting out to isolate Z-axis problem from camera rotation problem
        // const camera = this.scene.activeCamera;
        // if (camera) {
        //     const canvas = this.scene.getEngine().getRenderingCanvas();
        //     if (canvas) {
        //         console.log('📷 Reattaching camera controls');
        //         camera.attachControl(canvas, true);
        //     }
        // }

        // Reset drag state
        this.node.dragging = false;
        this.dragState.dragging = false;
        this.dragState.dragStartMeshPosition = null;
        this.dragState.dragStartWorldPosition = null;
        this.dragState.dragPlaneNormal = null;
    }

    // Internal methods
    private setupPointerEvents(): void {
        // Listen to pointer events for node dragging
        this.pointerObserver = this.scene.onPrePointerObservable.add((pointerInfo) => {
            switch (pointerInfo.type) {
                case PointerEventTypes.POINTERDOWN: {
                    // Check if we clicked on this node
                    const pickInfo = this.scene.pick(
                        this.scene.pointerX,
                        this.scene.pointerY,
                    );

                    console.log('🖱️ POINTERDOWN', {
                        nodeId: this.node.id,
                        pickedMeshName: pickInfo?.pickedMesh?.name,
                        nodeMeshName: this.node.mesh.name,
                        meshesMatch: pickInfo?.pickedMesh === this.node.mesh,
                        hit: pickInfo?.hit,
                    });

                    if (pickInfo?.pickedMesh === this.node.mesh) {
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
                        this.onDragEnd();
                    }

                    break;
                default:
                    // Ignore other pointer events
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

        // Use stored plane normal from drag start if available
        // Otherwise fall back to current camera forward (for initial calculation)
        const cameraForward = camera.getForwardRay().direction;
        const planeNormal = this.dragState.dragPlaneNormal || cameraForward;

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
