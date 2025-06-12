import {
    ArcRotateCamera,
    Camera,
    Engine,
    FlyCamera,
    HemisphericLight,
    Observable,
    PhotoDome,
    Scene,
    Vector3,
    WebXRDefaultExperience,
} from "@babylonjs/core";

import {
    EdgeEvent,
    EventCallbackType,
    EventType,
    GraphEvent,
    NodeEvent,
} from "./events";

import {
    FetchEdgesFn,
    FetchNodesFn,
    GraphConfig,
    GraphOptsType,
    getConfig,
} from "./config";

import {createXrButton} from "./xr-button";
import {D3GraphEngine} from "./layout/D3GraphLayoutEngine";
import {Edge, EdgeMap} from "./Edge";
import {LayoutEngine} from "./layout/LayoutEngine";
import {MeshCache} from "./MeshCache";
import {NGraphEngine} from "./layout/NGraphLayoutEngine";
import {Node, NodeIdType} from "./Node";
import {Stats} from "./Stats";
import {Styles} from "./Styles";
import jmespath from "jmespath";
import {DataSource} from "./data/DataSource";
import {JsonDataSource} from "./data/JsonDataSource";
import {SpiralLayout} from "./layout/SpiralLayoutEngine";
import {CircularLayout} from "./layout/CircularLayoutEngine";
import {ShellLayout} from "./layout/ShellLayoutEngine";
import {RandomLayout} from "./layout/RandomLayoutEngine";
import {SpringLayout} from "./layout/SpringLayoutEngine";
import {PlanarLayout} from "./layout/PlanarLayoutEngine";
import {KamadaKawaiLayout} from "./layout/KamadaKawaiLayoutEngine";
import {ForceAtlas2Layout} from "./layout/ForceAtlas2LayoutEngine";

DataSource.register(JsonDataSource);
LayoutEngine.register(D3GraphEngine);
LayoutEngine.register(NGraphEngine);
LayoutEngine.register(SpiralLayout);
LayoutEngine.register(CircularLayout);
LayoutEngine.register(ShellLayout);
LayoutEngine.register(RandomLayout);
LayoutEngine.register(SpringLayout);
LayoutEngine.register(PlanarLayout);
LayoutEngine.register(KamadaKawaiLayout);
LayoutEngine.register(ForceAtlas2Layout);

export class Graph {
    config: GraphConfig;
    stats: Stats;
    styles: Styles;
    nodes: Array<Node> = [];
    edges: Array<Edge> = [];
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
    nodeCache: Map<NodeIdType, Node> = new Map();
    // graph engine
    layoutEngine!: LayoutEngine;
    running = false;
    pinOnDrag?: boolean;
    // graph
    fetchNodes?: FetchNodesFn;
    fetchEdges?: FetchEdgesFn;
    initialized = false;
    // observeables
    graphObservable: Observable<GraphEvent> = new Observable();
    nodeObservable: Observable<NodeEvent> = new Observable();
    edgeObservable: Observable<EdgeEvent> = new Observable();
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
        this.styles = new Styles({addDefaultStyle: true, knownFields: this.config.knownFields});
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
        this.engine = new Engine(this.canvas, true); // Generate the BABYLON 3D engine
        this.scene = new Scene(this.engine);

        // setup camera
        if (this.config.layout.dimensions === 3) {
            this.camera = new ArcRotateCamera(
                "camera",
                -Math.PI / 2,
                Math.PI / 2.5,
                this.config.style.startingCameraDistance,
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
            window.addEventListener("keydown", (e) => {
                this.keys[e.inputIndex] = true;
                e.preventDefault();
            });

            window.addEventListener("keyup", (e) => {
                this.keys[e.inputIndex] = false;
                e.preventDefault();
            });
        }

        this.camera.attachControl(this.canvas, true);
        new HemisphericLight("light", new Vector3(1, 1, 0));

        // setup PhotoDome Skybox
        if (this.config.style.skybox && this.config.style.skybox.length) {
            new PhotoDome(
                "testdome",
                this.config.style.skybox,
                {
                    resolution: 32,
                    size: 1000,
                },
                this.scene,
            );
        }

        // setup default layout
        this.setLayout(this.config.layout.type, {});

        // setup stats
        this.stats = new Stats(this);
    }

    shutdown() {
        this.engine.dispose();
    }

    async init() {
        if (this.initialized) {
            return;
        }

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

    // Update camera position and zoom
    #updateCamera() {
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

    #updateOrthographicSize() {
        const rect = this.engine.getRenderingCanvasClientRect();
        const aspect = rect!.height / rect!.width;
        const size = this.orthoSize / this.zoomLevel;
        this.camera.orthoLeft = -size;
        this.camera.orthoRight = size;
        this.camera.orthoTop = size * aspect;
        this.camera.orthoBottom = -size * aspect;
    };

    update() {
        this.#updateCamera();
        this.#updateOrthographicSize();

        if (!this.layoutEngine || !this.running) {
            return;
        }

        // update graph engine
        this.stats.step();
        this.stats.graphStep.beginMonitoring();
        for (let i = 0; i < this.config.layout.stepMultiplier; i++) {
            this.layoutEngine.step();
        }
        this.stats.graphStep.endMonitoring();

        // update nodes
        this.stats.nodeUpdate.beginMonitoring();
        for (const n of this.layoutEngine.nodes) {
            n.update();
        }
        this.stats.nodeUpdate.endMonitoring();

        // update edges
        this.stats.edgeUpdate.beginMonitoring();
        Edge.updateRays(this);
        for (const e of this.layoutEngine.edges) {
            e.update();
        }
        this.stats.edgeUpdate.endMonitoring();

        // check to see if we are done
        if (this.layoutEngine.isSettled) {
            this.graphObservable.notifyObservers({type: "graph-settled", graph: this});
            this.running = false;
        }
    }

    async addDataFromSource(type: string, opts: object = {}) {
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
    }

    addNode(node: object, idPath?: string) {
        return this.addNodes([node], idPath);
    }

    addNodes(nodes: Array<object>, idPath?: string) {
        // create path to node ids
        const query = idPath || this.config.knownFields.nodeIdPath;

        // update styles
        this.styles.addNodes(nodes);

        // create nodes
        for (const node of nodes) {
            const metadata = node;
            const nodeId = jmespath.search(node, query);

            if (this.nodeCache.get(nodeId)) {
                continue;
            }

            const style = this.styles.getStyleForNode(nodeId);
            const n = new Node(this, nodeId, style, {
                pinOnDrag: this.pinOnDrag,
                metadata,
            });
            this.nodeCache.set(nodeId, n);
        }

        this.running = true;
    }

    addEdge(edge: object, srcIdPath?: string, dstIdPath?: string) {
        this.addEdges([edge], srcIdPath, dstIdPath);
    }

    addEdges(edges: Array<object>, srcIdPath?: string, dstIdPath?: string) {
        // get paths
        const srcQuery = srcIdPath || this.config.knownFields.edgeSrcIdPath;
        const dstQuery = dstIdPath || this.config.knownFields.edgeDstIdPath;

        // update styles
        this.styles.addEdges(edges);

        // create nodes
        for (const edge of edges) {
            const metadata = edge;
            const srcNodeId = jmespath.search(edge, srcQuery);
            const dstNodeId = jmespath.search(edge, dstQuery);

            if (this.edgeCache.get(srcNodeId, dstNodeId)) {
                continue;
            }

            const style = this.styles.getStyleForEdge(srcNodeId, dstNodeId);
            const e = new Edge(this, srcNodeId, dstNodeId, style, {
                metadata,
            });
            this.edgeCache.set(srcNodeId, dstNodeId, e);
        }

        this.running = true;
    }

    async setLayout(type: string, opts: object = {}) {
        const engine = LayoutEngine.get(type, opts);
        if (!engine) {
            throw new TypeError(`No layout named: ${type}`);
        }

        engine.addNodes(this.nodes);
        engine.addEdges(this.edges);

        this.layoutEngine = engine;
        await engine.init();

        // run layout presteps
        for (let i = 0; i < this.config.layout.preSteps; i++) {
            this.layoutEngine.step();
        }

        this.running = true;
    }

    addListener(type: EventType, cb: EventCallbackType): void {
        switch (type) {
        case "graph-settled":
            this.graphObservable.add((e) => {
                if (e.type === type) {
                    cb(e);
                }
            });
            break;
        default:
            throw new TypeError(`Unknown listener type in addListener: ${type}`);
        }
    }
}
