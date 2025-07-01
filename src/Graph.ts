import "./data"; // register all internal data sources
import "./layout"; // register all internal layouts
import "./algorithms"; // register all internal algorithms

import {
    ArcRotateCamera,
    Camera,
    Color4,
    Engine,
    FlyCamera,
    HemisphericLight,
    Logger,
    Observable,
    PhotoDome,
    Scene,
    Vector3,
    WebXRDefaultExperience,
} from "@babylonjs/core";
import jmespath from "jmespath";

import {Algorithm} from "./algorithms/Algorithm";
import {
    AdHocData,
    FetchEdgesFn,
    FetchNodesFn,
    getConfig,
    GraphConfig,
    GraphOptsType,
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
import {MeshCache} from "./MeshCache";
import {Node, NodeIdType} from "./Node";
import {Stats} from "./Stats";
import {Styles} from "./Styles";
import {createXrButton} from "./xr-button";

export class Graph {
    config: GraphConfig;
    stats: Stats;
    styles: Styles;
    nodes = new Map<string | number, Node>();
    edges = new Map<string | number, Edge>();
    // babylon
    element: Element;
    canvas: HTMLCanvasElement;
    engine: Engine;
    scene: Scene;
    camera: Camera;
    skybox?: string;
    xrHelper: WebXRDefaultExperience | null = null;
    meshCache: MeshCache;
    edgeCache: EdgeMap = new EdgeMap();
    nodeCache = new Map<NodeIdType, Node>();
    needRays = true; // TODO: currently always true
    // graph engine
    layoutEngine!: LayoutEngine;
    running = false;
    pinOnDrag?: boolean;
    // graph
    fetchNodes?: FetchNodesFn;
    fetchEdges?: FetchEdgesFn;
    initialized = false;
    runAlgorithmsOnLoad = false;
    // observeables
    graphObservable = new Observable<GraphEvent>();
    nodeObservable = new Observable<NodeEvent>();
    edgeObservable = new Observable<EdgeEvent>();
    // 2d camera
    orthoSize = 10;
    moveSpeed = 0.5;
    zoomLevel = 1.0;
    minZoom = 0.1;
    maxZoom = 10.0;
    zoomSpeed = 0.1;
    keys: Record<string, boolean> = {};

    constructor(element: Element | string, opts?: GraphOptsType) {
        this.config = getConfig(opts);
        this.meshCache = new MeshCache();

        // configure graph
        this.styles = Styles.default();

        if (this.config.behavior.fetchNodes) {
            this.fetchNodes = this.config.behavior.fetchNodes as FetchNodesFn;
        }

        if (this.config.behavior.fetchEdges) {
            this.fetchEdges = this.config.behavior.fetchEdges as FetchEdgesFn;
        }

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
        this.engine = new Engine(this.canvas, true); // Generate the BABYLON 3D engine
        this.scene = new Scene(this.engine);

        // setup camera
        this.camera = this.createCamera(3);

        new HemisphericLight("light", new Vector3(1, 1, 0));

        // setup default layout
        this.setLayout(this.config.layout.type, {})
            .catch((e: unknown) => {
                throw e;
            });

        // setup stats
        this.stats = new Stats(this);
    }

    shutdown(): void {
        this.engine.dispose();
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

        this.xrHelper = await createXrButton(this.scene, this.camera);

        // Watch for browser/canvas resize events
        window.addEventListener("resize", () => {
            this.engine.resize();
        });

        this.initialized = true;
    }

    createCamera(numDimensions = 3): Camera {
        if (numDimensions !== 2 && numDimensions !== 3) {
            throw new TypeError("number of dimensions can only be 2 or 3");
        }

        // discard old camera
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this.camera) {
            if (this.camera instanceof FlyCamera) {
                window.removeEventListener("keydown", keydownListener.bind(this));
                window.removeEventListener("keyup", keyupListener.bind(this));
            }

            this.camera.dispose();
        }

        if (numDimensions === 3) {
            this.camera = new ArcRotateCamera(
                "camera",
                -Math.PI / 2,
                Math.PI / 2.5,
                this.styles.config.graph.startingCameraDistance,
                new Vector3(0, 0, 0),
            );
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (this.camera as any).lowerBetaLimit;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (this.camera as any).upperBetaLimit;
        } else {
            this.camera = new FlyCamera("FlyCamera", new Vector3(0, 0, -10), this.scene);
            this.camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
            this.camera.orthoLeft = -this.orthoSize;
            this.camera.orthoRight = this.orthoSize;
            this.camera.orthoTop = this.orthoSize;
            this.camera.orthoBottom = -this.orthoSize;

            // Keyboard event listeners
            window.addEventListener("keydown", keydownListener.bind(this));
            window.addEventListener("keyup", keyupListener.bind(this));
        }

        this.camera.attachControl(this.canvas, true);

        return this.camera;
    }

    // Update camera position and zoom
    #updateCamera(): void {
        // Arrow key movement
        if (this.keys[37]) {
            this.camera.position.x -= this.moveSpeed / this.zoomLevel;
        }

        if (this.keys[39]) {
            this.camera.position.x += this.moveSpeed / this.zoomLevel;
        }

        if (this.keys[38]) {
            this.camera.position.y += this.moveSpeed / this.zoomLevel;
        }

        if (this.keys[40]) {
            this.camera.position.y -= this.moveSpeed / this.zoomLevel;
        }

        // Zoom controls (+ and - keys)
        if (this.keys[187]) { // + key
            this.zoomLevel = Math.min(this.zoomLevel + this.zoomSpeed, this.maxZoom);
            this.#updateOrthographicSize();
        }

        if (this.keys[189]) { // - key
            this.zoomLevel = Math.max(this.zoomLevel - this.zoomSpeed, this.minZoom);
            this.#updateOrthographicSize();
        }

        // Always keep camera looking at origin
        // this.camera.setTarget(Vector3.Zero());
    };

    #updateOrthographicSize(): void {
        const rect = this.engine.getRenderingCanvasClientRect();
        if (!rect) {
            throw new TypeError("error getting rendering canvas rectangle");
        }

        const aspect = rect.height / rect.width;
        const size = this.orthoSize / this.zoomLevel;
        this.camera.orthoLeft = -size;
        this.camera.orthoRight = size;
        this.camera.orthoTop = size * aspect;
        this.camera.orthoBottom = -size * aspect;
    };

    update(): void {
        this.#updateCamera();
        this.#updateOrthographicSize();

        if (!this.running) {
            return;
        }

        // update graph engine
        this.stats.step();
        this.stats.graphStep.beginMonitoring();
        for (let i = 0; i < this.config.layout.stepMultiplier; i++) {
            this.layoutEngine.step();
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
                return;
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
        for (const n of this.layoutEngine.nodes) {
            n.update();
            updateBoundingBox(n);
        }
        this.stats.nodeUpdate.endMonitoring();

        // update edges
        this.stats.edgeUpdate.beginMonitoring();
        Edge.updateRays(this);
        for (const e of this.layoutEngine.edges) {
            e.update();
        }
        this.stats.edgeUpdate.endMonitoring();

        // fit camera to scene
        if (this.camera instanceof ArcRotateCamera){
            const min = boundingBoxMin ?? new Vector3(-20, -20, -20);
            const max = boundingBoxMax ?? new Vector3(20, 20, 20);
            const center = min.add(max).scale(0.5);
            const size = max.subtract(min);
            const fieldOfView = this.camera.fov;
            const radius = (Math.max(size.x, size.y, size.z) / 2) / Math.tan(fieldOfView / 2);
            this.camera.upVector = new Vector3(1, 0, 0);
            this.camera.setTarget(center);
            this.camera.alpha = Math.PI / 2;
            this.camera.beta = Math.PI / 2;
            this.camera.radius = radius;
        }

        // check to see if we are done
        if (this.layoutEngine.isSettled) {
            this.graphObservable.notifyObservers({type: "graph-settled", graph: this});
            this.running = false;
        }
    }

    async setStyleTemplate(t: StyleSchema): Promise<Styles> {
        // TODO: stats start

        // TODO: if t is a URL, fetch URL

        this.styles = Styles.fromObject(t);

        for (const n of this.nodes.values()) {
            const styleId = this.styles.getStyleForNode(n.data);
            n.changeManager.loadCalculatedValues(this.styles.getCalculatedStylesForNode(n.data));
            n.updateStyle(styleId);
        }

        for (const e of this.edges.values()) {
            const styleId = this.styles.getStyleForEdge(e.data);
            e.updateStyle(styleId);
        }

        // setup PhotoDome Skybox
        if (this.styles.config.graph.background.backgroundType === "skybox" &&
                typeof this.styles.config.graph.background.data === "string") {
            const dome = new PhotoDome(
                "testdome",
                this.styles.config.graph.background.data,
                {
                    resolution: 32,
                    size: 500,
                },
                this.scene,
            );

            dome.rotation.z = -Math.PI / 2;
            dome.rotation.x = Math.PI;
        }

        if (this.styles.config.graph.background.backgroundType === "color" &&
            this.styles.config.graph.background.color
        ) {
            this.scene.clearColor = Color4.FromHexString(this.styles.config.graph.background.color);
        }

        // TODO: graph styles - background, etc
        // const mb = new MotionBlurPostProcess("mb", this.scene, 1.0, this.camera);
        // mb.motionStrength = 1;
        // default rendering pipeline?
        // https://doc.babylonjs.com/features/featuresDeepDive/postProcesses/defaultRenderingPipeline/

        // run algorithms
        if (this.runAlgorithmsOnLoad && this.styles.config.data?.algorithms) {
            for (const algName of this.styles.config.data.algorithms) {
                const [namespace, type] = algName.split(":");
                await this.runAlgorithm(namespace, type);
            }
        }

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
        const query = idPath ?? this.config.knownFields.nodeIdPath;

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
        }

        this.running = true;
    }

    addEdge(edge: AdHocData, srcIdPath?: string, dstIdPath?: string): void {
        this.addEdges([edge], srcIdPath, dstIdPath);
    }

    addEdges(edges: Record<string | number, unknown>[], srcIdPath?: string, dstIdPath?: string): void {
        // get paths
        const srcQuery = srcIdPath ?? this.config.knownFields.edgeSrcIdPath;
        const dstQuery = dstIdPath ?? this.config.knownFields.edgeDstIdPath;

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
        }

        this.running = true;
    }

    async setLayout(type: string, opts: object = {}): Promise<void> {
        const engine = LayoutEngine.get(type, opts);
        if (!engine) {
            throw new TypeError(`No layout named: ${type}`);
        }

        engine.addNodes([... this.nodes.values()]);
        engine.addEdges([... this.edges.values()]);

        this.layoutEngine = engine;
        await engine.init();

        // run layout presteps
        for (let i = 0; i < this.config.layout.preSteps; i++) {
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

function keydownListener(this: Graph, e: KeyboardEvent): void {
    this.keys[e.inputIndex] = true;
    e.preventDefault();
}

function keyupListener(this: Graph, e: KeyboardEvent): void {
    this.keys[e.inputIndex] = false;
    e.preventDefault();
};

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
