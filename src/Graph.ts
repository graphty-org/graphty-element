import "./data"; // register all internal data sources
import "./layout"; // register all internal layouts
import "./algorithms"; // register all internal algorithms

import {
    Color4,
    Engine,
    PhotoDome,
    Scene,
    WebGPUEngine,
    WebXRDefaultExperience,
} from "@babylonjs/core";

import {CameraManager} from "./cameras/CameraManager";
import {
    AdHocData,
    FetchEdgesFn,
    FetchNodesFn,
    StyleSchema,
} from "./config";
import {
    EventCallbackType,
    EventType,
} from "./events";
import {AlgorithmManager, DataManager, DefaultGraphContext, EventManager, type GraphContext, type GraphContextConfig, LayoutManager, LifecycleManager, type Manager, RenderManager, StatsManager, StyleManager, UpdateManager} from "./managers";
import {MeshCache} from "./meshes/MeshCache";
import {Styles} from "./Styles";
// import {createXrButton} from "./xr-button";

export class Graph implements GraphContext {
    styles: Styles;
    // babylon
    element: Element;
    canvas: HTMLCanvasElement;
    engine: WebGPUEngine | Engine;
    scene: Scene;
    camera: CameraManager;
    skybox?: string;
    xrHelper: WebXRDefaultExperience | null = null;
    needRays = true;
    // graph engine - delegate to LayoutManager
    pinOnDrag?: boolean;
    // graph
    fetchNodes?: FetchNodesFn;
    fetchEdges?: FetchEdgesFn;
    initialized = false;
    runAlgorithmsOnLoad = false;
    private resizeHandler = (): void => {
        this.engine.resize();
    };

    // Managers
    private eventManager: EventManager;
    private renderManager: RenderManager;
    private lifecycleManager: LifecycleManager;
    private dataManager: DataManager;
    private layoutManager: LayoutManager;
    private styleManager: StyleManager;
    private statsManager: StatsManager;
    private updateManager: UpdateManager;
    private algorithmManager: AlgorithmManager;

    // GraphContext implementation
    private graphContext: DefaultGraphContext;

    constructor(element: Element | string) {
        // Initialize EventManager first as other components depend on it
        this.eventManager = new EventManager();

        // Initialize StyleManager
        this.styleManager = new StyleManager(this.eventManager);
        this.styles = this.styleManager.getStyles();

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

        // Initialize StatsManager
        this.statsManager = new StatsManager(this.eventManager);
        this.statsManager.initializeBabylonInstrumentation(this.scene, this.engine);

        // Initialize DataManager
        this.dataManager = new DataManager(this.eventManager, this.styles);

        // Initialize LayoutManager
        this.layoutManager = new LayoutManager(this.eventManager, this.dataManager, this.styles);

        // Initialize UpdateManager
        this.updateManager = new UpdateManager(
            this.eventManager,
            this.statsManager,
            this.layoutManager,
            this.dataManager,
            this.styleManager,
            this.camera,
            this, // GraphContext
            {
                layoutStepMultiplier: this.styles.config.behavior.layout.stepMultiplier,
                autoZoomToFit: true,
            },
        );

        // Initialize AlgorithmManager
        this.algorithmManager = new AlgorithmManager(this.eventManager, this);

        // Initialize GraphContext
        const contextConfig: GraphContextConfig = {
            pinOnDrag: this.pinOnDrag,
        };
        this.graphContext = new DefaultGraphContext(
            this.styleManager,
            this.dataManager,
            this.layoutManager,
            this.dataManager.meshCache,
            this.scene,
            this.statsManager,
            contextConfig,
            this.needRays,
        );

        // Set GraphContext on managers
        this.dataManager.setGraphContext(this);
        this.layoutManager.setGraphContext(this);

        // Setup lifecycle manager
        const managers = new Map<string, Manager>([
            ["event", this.eventManager],
            ["style", this.styleManager],
            ["stats", this.statsManager],
            ["render", this.renderManager],
            ["data", this.dataManager],
            ["layout", this.layoutManager],
            ["update", this.updateManager],
            ["algorithm", this.algorithmManager],
        ]);
        this.lifecycleManager = new LifecycleManager(
            managers,
            this.eventManager,
            ["event", "style", "stats", "render", "data", "layout", "update", "algorithm"],
        );

        // Listen for data-added events to manage running state
        this.eventManager.addListener("data-added", (event) => {
            if (event.type === "data-added") {
                if (event.shouldStartLayout) {
                    this.layoutManager.running = true;
                }

                if (event.shouldZoomToFit) {
                    this.updateManager.enableZoomToFit();
                }
            }
        });

        // Listen for layout-initialized events to handle zoom to fit
        this.eventManager.addListener("layout-initialized", (event) => {
            if (event.type === "layout-initialized") {
                if (event.shouldZoomToFit) {
                    this.updateManager.enableZoomToFit();
                }
            }
        });

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

        // Dispose all managers through lifecycle manager
        this.lifecycleManager.dispose();
    }

    async runAlgorithmsFromTemplate(): Promise<void> {
        if (this.runAlgorithmsOnLoad && this.styles.config.data.algorithms) {
            await this.algorithmManager.runAlgorithmsFromTemplate(this.styles.config.data.algorithms);
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
            if (this.styles.config.graph.background.backgroundType === "color") {
                const backgroundColor = this.styles.config.graph.background.color ?? "#F5F5F5";
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
                if (this.layoutManager.isSettled && !this.layoutManager.running) {
                    for (const node of this.dataManager.nodes.values()) {
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

    /**
     * Update method - kept for backward compatibility
     * All update logic is now handled by UpdateManager
     */
    update(): void {
        this.updateManager.update();

        // Check if layout has settled
        if (this.layoutManager.isSettled && this.layoutManager.running) {
            this.eventManager.emitGraphSettled(this);
            this.layoutManager.running = false;

            // Start label animations after layout has settled
            for (const node of this.dataManager.nodes.values()) {
                node.label?.startAnimation();
            }
        }
    }

    async setStyleTemplate(t: StyleSchema): Promise<Styles> {
        // TODO: if t is a URL, fetch URL

        const previousTwoD = this.styles.config.graph.twoD;

        // Use StyleManager to load the new styles
        this.styleManager.loadStylesFromObject(t);
        this.styles = this.styleManager.getStyles();

        const currentTwoD = this.styles.config.graph.twoD;

        // Clear mesh cache if switching between 2D and 3D modes
        if (previousTwoD !== currentTwoD) {
            this.dataManager.meshCache.clear();
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
            this.updateManager.enableZoomToFit();
        }

        // Update layout dimension if it supports it and twoD mode changed
        await this.layoutManager.updateLayoutDimension(this.styles.config.graph.twoD);

        // Apply layout from template if specified
        await this.layoutManager.applyTemplateLayout(
            this.styles.config.graph.layout,
            this.styles.config.graph.layoutOptions,
        );

        // Don't run algorithms here - they should run after data is loaded

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
        await this.algorithmManager.runAlgorithm(namespace, type);
    }

    addListener(type: EventType, cb: EventCallbackType): void {
        // Delegate to EventManager
        this.eventManager.addListener(type, cb);
    }

    /**
     * Manually trigger zoom to fit the content
     */
    zoomToFit(): void {
        this.updateManager.enableZoomToFit();
    }

    // GraphContext implementation methods

    getStyles(): Styles {
        return this.styles;
    }

    getStyleManager(): StyleManager {
        return this.styleManager;
    }

    getDataManager(): DataManager {
        return this.dataManager;
    }

    getLayoutManager(): LayoutManager {
        return this.layoutManager;
    }

    getMeshCache(): MeshCache {
        return this.dataManager.meshCache;
    }

    getScene(): Scene {
        return this.scene;
    }

    getStatsManager(): StatsManager {
        return this.statsManager;
    }

    is2D(): boolean {
        return this.styles.config.graph.twoD;
    }

    needsRayUpdate(): boolean {
        return this.needRays;
    }

    getConfig(): GraphContextConfig {
        return {
            pinOnDrag: this.pinOnDrag,
        };
    }

    isRunning(): boolean {
        return this.layoutManager.running;
    }

    setRunning(running: boolean): void {
        this.layoutManager.running = running;
    }
}
