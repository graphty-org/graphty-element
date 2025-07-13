import "./data"; // register all internal data sources
import "./layout"; // register all internal layouts
import "./algorithms"; // register all internal algorithms

import {
    Color4,
    Engine,
    HemisphericLight,
    Logger,
    Observable,
    PhotoDome,
    Scene,
    Vector3,
    WebGPUEngine,
    WebXRDefaultExperience,
} from "@babylonjs/core";
import jmespath from "jmespath";

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
import {DataSource} from "./data/DataSource";
import {Edge, EdgeMap} from "./Edge";
import {
    EdgeEvent,
    EventCallbackType,
    EventType,
    GraphEvent,
    NodeEvent,
} from "./events";
import {LayoutEngine} from "./layout/LayoutEngine";
import {MeshCache} from "./meshes/MeshCache";
import {Node, NodeIdType} from "./Node";
import {Stats} from "./Stats";
import {Styles} from "./Styles";
// import {createXrButton} from "./xr-button";

export class Graph {
    stats: Stats;
    styles: Styles;
    nodes = new Map<string | number, Node>();
    edges = new Map<string | number, Edge>();
    // babylon
    element: Element;
    canvas: HTMLCanvasElement;
    engine: WebGPUEngine | Engine;
    scene: Scene;
    camera: CameraManager;
    skybox?: string;
    xrHelper: WebXRDefaultExperience | null = null;
    meshCache: MeshCache;
    edgeCache: EdgeMap = new EdgeMap();
    nodeCache = new Map<NodeIdType, Node>();
    needRays = true; // TODO: currently always true
    // graph engine
    layoutEngine?: LayoutEngine;
    running = false;
    pinOnDrag?: boolean;
    // graph
    fetchNodes?: FetchNodesFn;
    fetchEdges?: FetchEdgesFn;
    initialized = false;
    runAlgorithmsOnLoad = false;
    private resizeHandler = (): void => {
        this.engine.resize();
    };
    // observeables
    graphObservable = new Observable<GraphEvent>();
    nodeObservable = new Observable<NodeEvent>();
    edgeObservable = new Observable<EdgeEvent>();

    constructor(element: Element | string) {
        this.meshCache = new MeshCache();

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

        // setup babylonjs
        Logger.LogLevels = Logger.ErrorLogLevel;
        // this.engine = new WebGPUEngine(this.canvas);
        this.engine = new Engine(this.canvas, true); // Generate the BABYLON 3D engine
        this.scene = new Scene(this.engine);

        // setup camera
        this.camera = new CameraManager(this.scene);
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

        new HemisphericLight("light", new Vector3(1, 1, 0));

        // Set default background color
        const DEFAULT_BACKGROUND = "#F5F5F5"; // whitesmoke
        this.scene.clearColor = Color4.FromHexString(DEFAULT_BACKGROUND);

        // setup default layout - but don't wait for it
        // The layout will be properly configured when needed
        this.setLayout("ngraph")
            .catch((e: unknown) => {
                console.error("ERROR setting default layout:", e);
            });

        // setup stats
        this.stats = new Stats(this);
    }

    shutdown(): void {
        // Stop render loop first
        this.engine.stopRenderLoop();

        // Clean up event listeners
        window.removeEventListener("resize", this.resizeHandler);

        // Clean up observables
        this.graphObservable.clear();
        this.nodeObservable.clear();
        this.edgeObservable.clear();

        // Stop and dispose engine
        this.engine.dispose();
    }

    async runAlgorithmsFromTemplate(): Promise<void> {
        if (this.runAlgorithmsOnLoad && this.styles.config.data.algorithms) {
            for (const algName of this.styles.config.data.algorithms) {
                const [namespace, type] = algName.split(":");
                await this.runAlgorithm(namespace, type);
            }
        }
    }

    async init(): Promise<void> {
        if (this.initialized) {
            return;
        }

        await this.scene.whenReadyAsync();

        // Register a render loop to repeatedly render the scene
        this.engine.runRenderLoop(() => {
            this.update();
            this.scene.render();
        });

        // this.xrHelper = await createXrButton(this.scene, this.camera);

        // Watch for browser/canvas resize events
        window.addEventListener("resize", this.resizeHandler);

        this.initialized = true;

        // For layouts that settle immediately, start animations after a short delay
        setTimeout(() => {
            if (this.layoutEngine?.isSettled && !this.running) {
                for (const node of this.nodes.values()) {
                    node.label?.startAnimation();
                }
            }
        }, 100);
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
            this.layoutEngine?.step();
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
        if (this.layoutEngine) {
            for (const n of this.layoutEngine.nodes) {
                n.update();
                updateBoundingBox(n);
            }
        }

        this.stats.nodeUpdate.endMonitoring();

        // update edges
        this.stats.edgeUpdate.beginMonitoring();
        Edge.updateRays(this);
        if (this.layoutEngine) {
            for (const e of this.layoutEngine.edges) {
                e.update();
            }
        }

        this.stats.edgeUpdate.endMonitoring();

        // Simply pass the bounding box to the camera - let it handle the fitting
        const min = boundingBoxMin ?? new Vector3(-20, -20, -20);
        const max = boundingBoxMax ?? new Vector3(20, 20, 20);
        this.camera.zoomToBoundingBox(min, max);

        // check to see if we are done
        if (this.layoutEngine?.isSettled) {
            this.graphObservable.notifyObservers({type: "graph-settled", graph: this});
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

        // style nodes
        for (const n of this.nodes.values()) {
            const styleId = this.styles.getStyleForNode(n.data);
            n.changeManager.loadCalculatedValues(this.styles.getCalculatedStylesForNode(n.data));
            n.updateStyle(styleId);
        }

        // style edges
        for (const e of this.edges.values()) {
            const styleId = this.styles.getStyleForEdge(e.data);
            e.updateStyle(styleId);
        }

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

        // Update layout dimension if it supports it and twoD mode changed
        // Check if layoutEngine is initialized
        try {
            if (this.layoutEngine) {
                const currentDimension = this.styles.config.graph.twoD ? 2 : 3;
                const currentDimensionOpts = LayoutEngine.getOptionsForDimensionByType(this.layoutEngine.type, currentDimension);

                // Only recreate if the layout supports dimension configuration
                if (currentDimensionOpts && Object.keys(currentDimensionOpts).length > 0) {
                    // Check if we need to recreate the layout
                    // This is a bit tricky since we don't know what property name is used for dimensions
                    // The safest approach is to always recreate when switching between 2D/3D modes
                    const layoutType = this.layoutEngine.type;
                    const layoutOpts = this.layoutEngine.config ? {... this.layoutEngine.config} : {};

                    // Remove any dimension-related options that might conflict
                    // We'll let getOptionsForDimensionByType add the correct ones
                    const previousDimensionOpts2D = LayoutEngine.getOptionsForDimensionByType(layoutType, 2);
                    const previousDimensionOpts3D = LayoutEngine.getOptionsForDimensionByType(layoutType, 3);
                    const allDimensionKeys = new Set([
                        ... Object.keys(previousDimensionOpts2D ?? {}),
                        ... Object.keys(previousDimensionOpts3D ?? {}),
                    ]);

                    allDimensionKeys.forEach((key) => {
                        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                        delete (layoutOpts as Record<string, unknown>)[key];
                    });

                    await this.setLayout(layoutType, layoutOpts);
                }
            }
        } catch {
            // Layout engine not yet initialized - will be set with correct dimension when initialized
        }

        // Apply layout from template if specified
        if (this.styles.config.graph.layout) {
            const layoutType = this.styles.config.graph.layout;
            const layoutOptions = this.styles.config.graph.layoutOptions ?? {};

            // Only set layout if it's different from current layout or if no layout is set
            if (!this.layoutEngine || this.layoutEngine.type !== layoutType) {
                await this.setLayout(layoutType, layoutOptions);
            }
        }

        // Don't run algorithms here - they should run after data is loaded

        // TODO: stats end

        // TODO: emit event

        return this.styles;
    }

    async addDataFromSource(type: string, opts: object = {}): Promise<void> {
        this.stats.loadTime.beginMonitoring();

        const source = DataSource.get(type, opts);
        if (!source) {
            throw new TypeError(`No data source named: ${type}`);
        }

        for await (const chunk of source.getData()) {
            this.addNodes(chunk.nodes);
            this.addEdges(chunk.edges);
        }

        this.stats.loadTime.endMonitoring();

        // TODO: emit event
    }

    addNode(node: AdHocData, idPath?: string): void {
        this.addNodes([node], idPath);
    }

    addNodes(nodes: Record<string | number, unknown>[], idPath?: string): void {
        // create path to node ids
        const query = idPath ?? this.styles.config.data.knownFields.nodeIdPath;

        // create nodes
        for (const node of nodes) {
            const nodeId = jmespath.search(node, query) as NodeIdType;

            if (this.nodeCache.get(nodeId)) {
                continue;
            }

            const styleId = this.styles.getStyleForNode(node as AdHocData);
            const n = new Node(this, nodeId, styleId, node as AdHocData, {
                pinOnDrag: this.pinOnDrag,
            });
            this.nodeCache.set(nodeId, n);
            this.nodes.set(nodeId, n);

            // Add to layout engine if it exists
            if (this.layoutEngine) {
                this.layoutEngine.addNode(n);
            }
        }

        this.running = true;
    }

    addEdge(edge: AdHocData, srcIdPath?: string, dstIdPath?: string): void {
        this.addEdges([edge], srcIdPath, dstIdPath);
    }

    addEdges(edges: Record<string | number, unknown>[], srcIdPath?: string, dstIdPath?: string): void {
        // get paths
        const srcQuery = srcIdPath ?? this.styles.config.data.knownFields.edgeSrcIdPath;
        const dstQuery = dstIdPath ?? this.styles.config.data.knownFields.edgeDstIdPath;

        // create edges
        for (const edge of edges) {
            const srcNodeId = jmespath.search(edge, srcQuery) as NodeIdType;
            const dstNodeId = jmespath.search(edge, dstQuery) as NodeIdType;

            if (this.edgeCache.get(srcNodeId, dstNodeId)) {
                continue;
            }

            const style = this.styles.getStyleForEdge(edge as AdHocData);
            const opts = {};
            const e = new Edge(this, srcNodeId, dstNodeId, style, edge as AdHocData, opts);
            this.edgeCache.set(srcNodeId, dstNodeId, e); // TODO: replace with normal map and "e.id"
            this.edges.set(e.id, e);

            // Add to layout engine if it exists
            if (this.layoutEngine) {
                this.layoutEngine.addEdge(e);
            }
        }

        this.running = true;
    }

    async setLayout(type: string, opts: object = {}): Promise<void> {
        // Auto-sync layout dimension with graph's 2D/3D mode if not explicitly set
        const layoutOpts = {... opts};

        // Get dimension-specific options from the layout if not already provided
        const dimension = this.styles.config.graph.twoD ? 2 : 3;
        const dimensionOpts = LayoutEngine.getOptionsForDimensionByType(type, dimension);

        if (dimensionOpts) {
            // Merge dimension options, but don't override user-provided options
            Object.keys(dimensionOpts).forEach((key) => {
                if (!(key in layoutOpts)) {
                    (layoutOpts as Record<string, unknown>)[key] = (dimensionOpts as Record<string, unknown>)[key];
                }
            });
        }

        const engine = LayoutEngine.get(type, layoutOpts);
        if (!engine) {
            throw new TypeError(`No layout named: ${type}`);
        }

        engine.addNodes([... this.nodes.values()]);
        engine.addEdges([... this.edges.values()]);

        this.layoutEngine = engine;
        await engine.init();

        // run layout presteps
        for (let i = 0; i < this.styles.config.behavior.layout.preSteps; i++) {
            this.layoutEngine.step();
        }

        this.running = true;
    }

    async runAlgorithm(namespace: string, type: string): Promise<void> {
        const alg = Algorithm.get(this, namespace, type);
        if (!alg) {
            throw new Error(`algorithm not found: ${namespace}:${type}`);
        }

        await alg.run(this);
    }

    addListener(type: EventType, cb: EventCallbackType): void {
        switch (type) {
            case "graph-settled":
                this.graphObservable.add((e) => {
                    cb(e);
                });
                break;
            default:
                throw new TypeError(`Unknown listener type in addListener: ${type}`);
        }
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
