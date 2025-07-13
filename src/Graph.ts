import "./data"; // register all internal data sources
import "./layout"; // register all internal layouts
import "./algorithms"; // register all internal algorithms

import {
    Color4,
    Engine,
    Observable,
    PhotoDome,
    Scene,
    Vector3,
    WebGPUEngine,
    WebXRDefaultExperience,
} from "@babylonjs/core";

import {Algorithm} from "./algorithms/Algorithm";
import {CameraManager} from "./cameras/CameraManager";
import {OrbitCameraController} from "./cameras/OrbitCameraController";
import {OrbitInputController} from "./cameras/OrbitInputController";
import {TwoDCameraController} from "./cameras/TwoDCameraController";
import {InputController} from "./cameras/TwoDInputController";
import {
    AdHocData,
    FetchEdgesFn,
    FetchNodesFn,
    StyleSchema,
} from "./config";
import {Edge, EdgeMap} from "./Edge";
import {
    EdgeEvent,
    EventCallbackType,
    EventType,
    GraphEvent,
    NodeEvent,
} from "./events";
import {LayoutEngine} from "./layout/LayoutEngine";
import {DataManager, EventManager, LayoutManager, LifecycleManager, type Manager, RenderManager} from "./managers";
import {MeshCache} from "./meshes/MeshCache";
import {Node, NodeIdType} from "./Node";
import {Stats} from "./Stats";
import {Styles} from "./Styles";
// import {createXrButton} from "./xr-button";

export class Graph {
    stats: Stats;
    styles: Styles;
    // babylon
    element: Element;
    canvas: HTMLCanvasElement;
    engine: WebGPUEngine | Engine;
    scene: Scene;
    camera: CameraManager;
    skybox?: string;
    xrHelper: WebXRDefaultExperience | null = null;
    needRays = true; // TODO: currently always true
    // graph engine - delegate to LayoutManager
    pinOnDrag?: boolean;
    // camera control
    private hasZoomedToFit = false;
    private needsZoomToFit = true;
    // graph
    fetchNodes?: FetchNodesFn;
    fetchEdges?: FetchEdgesFn;
    initialized = false;
    runAlgorithmsOnLoad = false;
    private resizeHandler = (): void => {
        this.engine.resize();
    };
    // observeables - kept for backward compatibility but delegate to EventManager
    graphObservable = new Observable<GraphEvent>();
    nodeObservable = new Observable<NodeEvent>();
    edgeObservable = new Observable<EdgeEvent>();

    // Managers
    private eventManager: EventManager;
    private renderManager: RenderManager;
    private lifecycleManager: LifecycleManager;
    private dataManager: DataManager;
    private layoutManager: LayoutManager;

    constructor(element: Element | string) {
        // Initialize EventManager first as other components depend on it
        this.eventManager = new EventManager();

        // Setup backward compatibility for observables
        this.setupObservableCompatibility();

        // configure graph
        this.styles = Styles.default();

        // get the element that we are going to use for placing our canvas
        if (typeof (element) === "string") {
            const e: Element | null = document.getElementById(element);
            if (!e) {
                throw new Error(`getElementById() could not find element '${element}'`);
            }

            this.element = e;
        } else if (element instanceof Element) {
            this.element = element;
        } else {
            throw new TypeError("Graph constructor requires 'element' argument that is either a string specifying the ID of the HTML element or an Element");
        }

        this.element.innerHTML = "";

        // get a canvas element for rendering
        this.canvas = document.createElement("canvas");
        this.canvas.setAttribute("id", `babylonForceGraphRenderCanvas${Date.now()}`);
        this.canvas.setAttribute("touch-action", "none");
        this.canvas.setAttribute("autofocus", "true");
        this.canvas.setAttribute("tabindex", "0");
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        this.canvas.style.touchAction = "none";
        this.element.appendChild(this.canvas);

        // Initialize RenderManager
        this.renderManager = new RenderManager(this.canvas, this.eventManager);

        // Get references from RenderManager for backward compatibility
        this.engine = this.renderManager.engine;
        this.scene = this.renderManager.scene;
        this.camera = this.renderManager.camera;

        // setup stats - needs to be after scene is created
        this.stats = new Stats(this);

        // Setup cameras
        this.setupCameras();

        // Initialize DataManager
        this.dataManager = new DataManager(this.eventManager, this.styles, this.stats);
        this.dataManager.setParentGraph(this);

        // Initialize LayoutManager
        this.layoutManager = new LayoutManager(this.eventManager, this.dataManager, this.styles);
        this.layoutManager.setParentGraph(this);

        // Setup lifecycle manager
        const managers = new Map<string, Manager>([
            ["event", this.eventManager],
            ["render", this.renderManager],
            ["data", this.dataManager],
            ["layout", this.layoutManager],
        ]);
        this.lifecycleManager = new LifecycleManager(
            managers,
            this.eventManager,
            ["event", "render", "data", "layout"],
        );

        // setup default layout - but don't wait for it
        // The layout will be properly configured when needed
        this.setLayout("ngraph")
            .catch((e: unknown) => {
                console.error("ERROR setting default layout:", e);
                // Emit error event for default layout failure
                this.eventManager.emitGraphError(
                    this,
                    e instanceof Error ? e : new Error(String(e)),
                    "layout",
                    {layoutType: "ngraph", isDefault: true},
                );
            });
    }

    // Getters for backward compatibility - delegate to DataManager
    get nodes(): Map<string | number, Node> {
        return this.dataManager.nodes;
    }

    get edges(): Map<string | number, Edge> {
        return this.dataManager.edges;
    }

    get nodeCache(): Map<NodeIdType, Node> {
        return this.dataManager.nodeCache;
    }

    get edgeCache(): EdgeMap {
        return this.dataManager.edgeCache;
    }

    get meshCache(): MeshCache {
        return this.dataManager.meshCache;
    }

    // Layout properties - delegate to LayoutManager
    get layoutEngine(): LayoutEngine | undefined {
        return this.layoutManager.layoutEngine;
    }

    get layoutRunning(): boolean {
        return this.layoutManager.running;
    }

    // Update running getter and setter to delegate to LayoutManager for layout state
    get running(): boolean {
        return this.layoutManager.running;
    }

    set running(value: boolean) {
        this.layoutManager.running = value;
    }

    /**
     * Setup backward compatibility for observables
     * Delegates to EventManager while maintaining the old API
     */
    private setupObservableCompatibility(): void {
        // Forward graph observable notifications to EventManager
        this.graphObservable.add(() => {
            // EventManager will handle the event distribution
            // This maintains backward compatibility
        });

        // Forward node observable notifications to EventManager
        this.nodeObservable.add(() => {
            // EventManager will handle the event distribution
        });

        // Forward edge observable notifications to EventManager
        this.edgeObservable.add(() => {
            // EventManager will handle the event distribution
        });
    }

    /**
     * Setup camera configurations
     */
    private setupCameras(): void {
        const orbitCamera = new OrbitCameraController(this.canvas, this.scene, {
            trackballRotationSpeed: 0.005,
            keyboardRotationSpeed: 0.03,
            keyboardZoomSpeed: 0.2,
            keyboardYawSpeed: 0.02,
            pinchZoomSensitivity: 10,
            twistYawSensitivity: 1.5,
            minZoomDistance: 2,
            maxZoomDistance: 500,
            inertiaDamping: 0.9,
        });
        const orbitInput = new OrbitInputController(this.canvas, orbitCamera);
        this.camera.registerCamera("orbit", orbitCamera, orbitInput);

        const twoDCamera = new TwoDCameraController(this.scene, this.engine, this.canvas, {
            panAcceleration: 0.02,
            panDamping: 0.85,
            zoomFactorPerFrame: 0.02,
            zoomDamping: 0.85,
            zoomMin: 0.1,
            zoomMax: 500,
            rotateSpeedPerFrame: 0.02,
            rotateDamping: 0.85,
            rotateMin: null,
            rotateMax: null,
            mousePanScale: 1.0,
            mouseWheelZoomSpeed: 1.1,
            touchPanScale: 1.0,
            touchPinchMin: 0.1,
            touchPinchMax: 100,
            initialOrthoSize: 5,
            rotationEnabled: true,
            inertiaEnabled: true,
        });
        const twoDInput = new InputController(twoDCamera, this.canvas, {
            panAcceleration: 0.02,
            panDamping: 0.85,
            zoomFactorPerFrame: 0.02,
            zoomDamping: 0.85,
            zoomMin: 0.1,
            zoomMax: 100,
            rotateSpeedPerFrame: 0.02,
            rotateDamping: 0.85,
            rotateMin: null,
            rotateMax: null,
            mousePanScale: 1.0,
            mouseWheelZoomSpeed: 1.1,
            touchPanScale: 1.0,
            touchPinchMin: 0.1,
            touchPinchMax: 100,
            initialOrthoSize: 5,
            rotationEnabled: true,
            inertiaEnabled: true,
        });
        this.camera.registerCamera("2d", twoDCamera, twoDInput);
        this.camera.activateCamera("orbit");
    }

    private cleanup(): void {
        // Stop render loop if it's running
        try {
            this.engine.stopRenderLoop();
        } catch {
            // Ignore errors during cleanup
        }

        // Clean up event listeners
        window.removeEventListener("resize", this.resizeHandler);

        // Mark as not initialized
        this.initialized = false;
    }

    shutdown(): void {
        // Use cleanup for common operations
        this.cleanup();

        // Clean up observables (for backward compatibility)
        this.graphObservable.clear();
        this.nodeObservable.clear();
        this.edgeObservable.clear();

        // Dispose all managers through lifecycle manager
        this.lifecycleManager.dispose();
    }

    async runAlgorithmsFromTemplate(): Promise<void> {
        if (this.runAlgorithmsOnLoad && this.styles.config.data.algorithms) {
            const errors: Error[] = [];

            for (const algName of this.styles.config.data.algorithms) {
                try {
                    const [namespace, type] = algName.split(":");
                    if (!namespace || !type) {
                        throw new Error(`Invalid algorithm name format: '${algName}'. Expected 'namespace:type'`);
                    }

                    await this.runAlgorithm(namespace, type);
                } catch (error) {
                    // Collect errors but continue with other algorithms
                    errors.push(error instanceof Error ? error : new Error(String(error)));
                }
            }

            // If any algorithms failed, emit a single error event with all failures
            if (errors.length > 0) {
                this.eventManager.emitGraphError(
                    this,
                    new Error(`Failed to run ${errors.length} algorithm(s) from template`),
                    "algorithm",
                    {
                        errors: errors.map((e) => e.message),
                        totalAlgorithms: this.styles.config.data.algorithms.length,
                        failedAlgorithms: errors.length,
                    },
                );
            }
        }
    }

    async init(): Promise<void> {
        if (this.initialized) {
            return;
        }

        try {
            // Initialize all managers through lifecycle manager
            await this.lifecycleManager.init();

            // Apply default background color if no styleTemplate was explicitly set
            // This ensures stories without styleTemplate get the correct background
            if (this.scene && this.styles.config.graph.background.backgroundType === "color") {
                const backgroundColor = this.styles.config.graph.background.color || "#F5F5F5";
                this.scene.clearColor = Color4.FromHexString(backgroundColor);
            }

            // Start the graph system (render loop, etc.)
            await this.lifecycleManager.startGraph(() => {
                this.update();
            });

            // this.xrHelper = await createXrButton(this.scene, this.camera);

            // Watch for browser/canvas resize events
            window.addEventListener("resize", this.resizeHandler);

            this.initialized = true;

            // For layouts that settle immediately, start animations after a short delay
            setTimeout(() => {
                if (this.layoutManager.isSettled && !this.running) {
                    for (const node of this.nodes.values()) {
                        node.label?.startAnimation();
                    }
                }
            }, 100);
        } catch (error) {
            // Emit error event for user handling
            this.eventManager.emitGraphError(
                this,
                error instanceof Error ? error : new Error(String(error)),
                "init",
                {component: "Graph"},
            );

            // Clean up any partially initialized resources
            this.cleanup();

            // Re-throw with context
            throw new Error(`Failed to initialize graph: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    update(): void {
        this.camera.update();

        if (!this.running) {
            return;
        }

        // update graph engine
        this.stats.step();
        this.stats.graphStep.beginMonitoring();
        for (let i = 0; i < this.styles.config.behavior.layout.stepMultiplier; i++) {
            this.layoutManager.step();
        }
        this.stats.graphStep.endMonitoring();

        // calculate the global bounding box of all nodes
        let boundingBoxMin: Vector3 | undefined;
        let boundingBoxMax: Vector3 | undefined;
        function updateBoundingBox(n: Node): void {
            const pos = n.mesh.getAbsolutePosition();
            const sz = n.size;
            if (!boundingBoxMin || !boundingBoxMax) {
                boundingBoxMin = pos.clone();
                boundingBoxMax = pos.clone();
            }

            setMin(pos, boundingBoxMin, sz, "x");
            setMin(pos, boundingBoxMin, sz, "y");
            setMin(pos, boundingBoxMin, sz, "z");
            setMax(pos, boundingBoxMax, sz, "x");
            setMax(pos, boundingBoxMax, sz, "y");
            setMax(pos, boundingBoxMax, sz, "z");
        }

        // update nodes
        this.stats.nodeUpdate.beginMonitoring();
        for (const n of this.layoutManager.nodes) {
            n.update();
            updateBoundingBox(n);
        }

        this.stats.nodeUpdate.endMonitoring();

        // update edges
        this.stats.edgeUpdate.beginMonitoring();
        Edge.updateRays(this);
        for (const e of this.layoutManager.edges) {
            e.update();
        }

        this.stats.edgeUpdate.endMonitoring();

        // Only zoom to fit when needed, not every frame
        if (this.needsZoomToFit && boundingBoxMin && boundingBoxMax) {
            this.camera.zoomToBoundingBox(boundingBoxMin, boundingBoxMax);
            this.hasZoomedToFit = true;
            this.needsZoomToFit = false;
        }

        // check to see if we are done
        if (this.layoutManager.isSettled) {
            this.eventManager.emitGraphSettled(this);
            this.running = false;

            // Start label animations after layout has settled
            for (const node of this.nodes.values()) {
                node.label?.startAnimation();
            }
        }
    }

    async setStyleTemplate(t: StyleSchema): Promise<Styles> {
        // TODO: stats start

        // TODO: if t is a URL, fetch URL

        const previousTwoD = this.styles.config.graph.twoD;
        this.styles = Styles.fromObject(t);
        const currentTwoD = this.styles.config.graph.twoD;

        // Clear mesh cache if switching between 2D and 3D modes
        if (previousTwoD !== currentTwoD) {
            this.meshCache.clear();
        }

        // Update DataManager with new styles - this will apply styles to existing nodes/edges
        // IMPORTANT: DataManager needs to be updated after this.styles is set because
        // Node.updateStyle() calls this.parentGraph.styles
        this.dataManager.updateStyles(this.styles);

        // setup PhotoDome Skybox
        if (this.styles.config.graph.background.backgroundType === "skybox" &&
                typeof this.styles.config.graph.background.data === "string") {
            new PhotoDome(
                "testdome",
                this.styles.config.graph.background.data,
                {
                    resolution: 32,
                    size: 500,
                },
                this.scene,
            );
        }

        // background color - always set a default
        const DEFAULT_BACKGROUND = "#F5F5F5"; // whitesmoke

        if (this.styles.config.graph.background.backgroundType === "color" &&
            this.styles.config.graph.background.color) {
            this.scene.clearColor = Color4.FromHexString(this.styles.config.graph.background.color);
        } else {
            // Apply default background color when no background is specified
            this.scene.clearColor = Color4.FromHexString(DEFAULT_BACKGROUND);
        }

        // TODO: graph styles - background, etc
        // const mb = new MotionBlurPostProcess("mb", this.scene, 1.0, this.camera);
        // mb.motionStrength = 1;
        // default rendering pipeline?
        // https://doc.babylonjs.com/features/featuresDeepDive/postProcesses/defaultRenderingPipeline/

        // setup camera
        const cameraType = this.styles.config.graph.twoD ? "2d" : "orbit";
        this.camera.activateCamera(cameraType);

        // Request zoom to fit when switching between 2D/3D modes
        if (previousTwoD !== currentTwoD) {
            this.needsZoomToFit = true;
        }

        // Update layout dimension if it supports it and twoD mode changed
        await this.layoutManager.updateLayoutDimension(this.styles.config.graph.twoD);

        // Apply layout from template if specified
        await this.layoutManager.applyTemplateLayout(
            this.styles.config.graph.layout,
            this.styles.config.graph.layoutOptions,
        );

        // Don't run algorithms here - they should run after data is loaded

        // TODO: stats end

        // TODO: emit event

        return this.styles;
    }

    async addDataFromSource(type: string, opts: object = {}): Promise<void> {
        return this.dataManager.addDataFromSource(type, opts);
    }

    addNode(node: AdHocData, idPath?: string): void {
        this.dataManager.addNode(node, idPath);
    }

    addNodes(nodes: Record<string | number, unknown>[], idPath?: string): void {
        this.dataManager.addNodes(nodes, idPath);
    }

    addEdge(edge: AdHocData, srcIdPath?: string, dstIdPath?: string): void {
        this.dataManager.addEdge(edge, srcIdPath, dstIdPath);
    }

    addEdges(edges: Record<string | number, unknown>[], srcIdPath?: string, dstIdPath?: string): void {
        this.dataManager.addEdges(edges, srcIdPath, dstIdPath);
    }

    async setLayout(type: string, opts: object = {}): Promise<void> {
        await this.layoutManager.setLayout(type, opts);
    }

    async runAlgorithm(namespace: string, type: string): Promise<void> {
        try {
            const alg = Algorithm.get(this, namespace, type);
            if (!alg) {
                throw new Error(`algorithm not found: ${namespace}:${type}`);
            }

            try {
                await alg.run(this);
            } catch (error) {
                // Emit error event
                this.eventManager.emitGraphError(
                    this,
                    error instanceof Error ? error : new Error(String(error)),
                    "algorithm",
                    {algorithmNamespace: namespace, algorithmType: type},
                );

                throw new Error(`Algorithm '${namespace}:${type}' failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        } catch (error) {
            // Re-throw if already a processed error
            if (error instanceof Error && error.message.includes("Algorithm") && error.message.includes("failed")) {
                throw error;
            }

            // Otherwise wrap and throw
            throw new Error(`Error running algorithm '${namespace}:${type}': ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    addListener(type: EventType, cb: EventCallbackType): void {
        // Delegate to EventManager
        this.eventManager.addListener(type, cb);
    }

    /**
     * Manually trigger zoom to fit the content
     */
    zoomToFit(): void {
        this.needsZoomToFit = true;
    }
}

function setMin(pos: Vector3, v: Vector3, scale: number, ord: "x" | "y" | "z"): void {
    const adjPos = pos[ord] - scale;
    if (adjPos < v[ord]) {
        v[ord] = adjPos;
    }
}

function setMax(pos: Vector3, v: Vector3, scale: number, ord: "x" | "y" | "z"): void {
    const adjPos = pos[ord] + scale;
    if (adjPos > v[ord]) {
        v[ord] = adjPos;
    }
}
