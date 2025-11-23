// Force side-effect imports to not be tree-shaken
import "./data/index"; // register all internal data sources
import "./layout/index"; // register all internal layouts
import "./algorithms/index"; // register all internal algorithms

import {
    AbstractMesh,
    Animation,
    Color4,
    CubicEase,
    EasingFunction,
    Engine,
    PhotoDome,
    Scene,
    Vector3,
    WebGPUEngine,
    WebXRDefaultExperience,
} from "@babylonjs/core";

import {type CameraController, type CameraKey, CameraManager} from "./cameras/CameraManager";
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
import {AlgorithmManager, DataManager, DefaultGraphContext, EventManager, type GraphContext, type GraphContextConfig, InputManager, type InputManagerConfig, LayoutManager, LifecycleManager, type Manager, OperationQueueManager, type RecordedInputEvent, RenderManager, StatsManager, StyleManager, UpdateManager} from "./managers";
import {MeshCache} from "./meshes/MeshCache";
import {Node} from "./Node";
import {ScreenshotCapture} from "./screenshot/ScreenshotCapture.js";
import type {ScreenshotOptions, ScreenshotResult} from "./screenshot/types.js";
import {Styles} from "./Styles";
import type {QueueableOptions} from "./utils/queue-migration";
// import {createXrButton} from "./xr-button";

export class Graph implements GraphContext {
    styles: Styles;
    // babylon
    element: Element;
    canvas: HTMLCanvasElement;
    engine: WebGPUEngine | Engine;
    scene: Scene;
    camera: CameraManager;
    private initialCameraState?: import("./screenshot/types.js").CameraState;
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
    enableDetailedProfiling?: boolean;
    private wasSettled = false; // Track previous settlement state
    private resizeHandler = (): void => {
        this.engine.resize();
        // If we've already zoomed to fit, re-zoom after resize to ensure content still fits
        // if (this.updateManager.zoomToFitCompleted) {
        //     this.updateManager.enableZoomToFit();
        // }
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
    private inputManager: InputManager;
    operationQueue: OperationQueueManager;

    // GraphContext implementation
    private graphContext: DefaultGraphContext;

    constructor(element: Element | string, useMockInput = false) {
        // Initialize EventManager first as other components depend on it
        this.eventManager = new EventManager();

        // Initialize OperationQueueManager
        this.operationQueue = new OperationQueueManager(this.eventManager, {
            concurrency: 1, // Sequential execution
            autoStart: true,
        });

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
        this.canvas.setAttribute("id", `graphty-canvas-${Date.now()}`);
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

        // Register layout-update trigger to handle positioning nodes when data is added
        this.operationQueue.registerTrigger("data-add", () => ({
            category: "layout-update",
            execute: async() => {
                // Get all nodes for positioning
                const nodes = Array.from(this.dataManager.nodes.values());
                if (nodes.length > 0 && this.layoutManager.layoutEngine) {
                    await this.layoutManager.updatePositions(nodes);
                }
            },
            description: "Update layout positions after data add",
        }));

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

        // Initialize InputManager
        const inputConfig: InputManagerConfig = {
            useMockInput: useMockInput,
            touchEnabled: true,
            keyboardEnabled: true,
            pointerLockEnabled: false,
            recordInput: false,
        };
        this.inputManager = new InputManager(
            {
                scene: this.scene,
                engine: this.engine,
                canvas: this.canvas,
                eventManager: this.eventManager,
            },
            inputConfig,
        );

        // Initialize GraphContext
        const contextConfig: GraphContextConfig = {
            pinOnDrag: this.pinOnDrag,
            enableDetailedProfiling: this.enableDetailedProfiling,
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
            ["queue", this.operationQueue],
            ["style", this.styleManager],
            ["stats", this.statsManager],
            ["render", this.renderManager],
            ["data", this.dataManager],
            ["layout", this.layoutManager],
            ["update", this.updateManager],
            ["algorithm", this.algorithmManager],
            ["input", this.inputManager],
        ]);
        this.lifecycleManager = new LifecycleManager(
            managers,
            this.eventManager,
            ["event", "queue", "style", "stats", "render", "data", "layout", "update", "algorithm", "input"],
        );

        // Queue default layout early so user-specified layouts can obsolete it
        // This is queued now (in constructor) rather than in init() to ensure
        // it's the FIRST layout operation queued, allowing user operations to cancel it
        void this.setLayout("ngraph")
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

        // Note: Algorithm running is handled in the data-added event listener below
        // rather than through operation queue triggers, because data sources bypass
        // the operation queue when adding data

        // Listen for data-added events to manage running state
        this.eventManager.addListener("data-added", (event) => {
            if (event.type === "data-added") {
                if (event.shouldStartLayout) {
                    this.layoutManager.running = true;
                    // Start tracking layout session performance
                    this.statsManager.startLayoutSession();
                }

                if (event.shouldZoomToFit) {
                    this.updateManager.enableZoomToFit();
                }

                // Run algorithms if runAlgorithmsOnLoad is true
                // Queue algorithms instead of running them directly
                const {algorithms} = this.styles.config.data;
                if (this.runAlgorithmsOnLoad && algorithms && algorithms.length > 0) {
                    // Parse and queue each algorithm through the public API
                    for (const algName of algorithms) {
                        const trimmedName = algName.trim();
                        const [namespace, type] = trimmedName.split(":");

                        if (namespace && type) {
                            // Queue through public API which handles queueing
                            void this.runAlgorithm(namespace.trim(), type.trim())
                                .catch((error: unknown) => {
                                    console.error(`[Graph] Error running algorithm ${trimmedName}:`, error);
                                });
                        }
                    }
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

        // Default layout is now queued in constructor to ensure proper obsolescence ordering
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
        // Stop any running camera animations
        try {
            const controller = this.camera.getActiveController();
            if (controller && "pivot" in controller) {
                this.scene.stopAnimation((controller as {pivot: unknown}).pivot);
            }
            // Note: 2D animations use direct animation on dummy objects
            // and will be cleaned up when the scene is disposed
        } catch {
            // Ignore errors during animation cleanup
        }

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
            // Enable profiling if configured (needs to be done after statsManager is created but before use)
            if (this.enableDetailedProfiling) {
                this.statsManager.enableProfiling();
                // Reset measurements to only capture data from this point forward
                this.statsManager.resetMeasurements();
            }

            // Mark style-init as completed since styles are initialized in constructor
            // This satisfies cross-batch dependencies for operations like data-add
            this.operationQueue.markCategoryCompleted("style-init");

            // Initialize all managers through lifecycle manager
            await this.lifecycleManager.init();

            // Apply default background color if no styleTemplate was explicitly set
            // This ensures stories without styleTemplate get the correct background
            if (this.styles.config.graph.background.backgroundType === "color") {
                const backgroundColor = this.styles.config.graph.background.color ?? "#F5F5F5";
                this.scene.clearColor = Color4.FromHexString(backgroundColor);
            }

            // Start the graph system (render loop, etc.)
            this.lifecycleManager.startGraph(() => {
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
        // Start frame profiling (tracks operations for blocking detection)
        this.statsManager.startFrameProfiling();

        this.statsManager.measure("Graph.update", () => {
            this.statsManager.measure("Graph.updateManager", () => {
                this.updateManager.update();
            });

            this.statsManager.measure("Graph.settlementCheck", () => {
                // Check if layout has settled
                if (this.layoutManager.isSettled && this.layoutManager.running) {
                    this.eventManager.emitGraphSettled(this);
                    this.layoutManager.running = false;

                    // Start label animations after layout has settled
                    for (const node of this.dataManager.nodes.values()) {
                        node.label?.startAnimation();
                    }

                    // Force a final zoom to fit after layout has truly settled
                    this.updateManager.enableZoomToFit();
                }

                // Report performance when transitioning from unsettled to settled
                if (this.layoutManager.isSettled && !this.wasSettled) {
                    this.wasSettled = true;
                    // End layout session tracking
                    this.statsManager.endLayoutSession();
                    const snapshot = this.statsManager.getSnapshot();
                    // eslint-disable-next-line no-console
                    console.log(`🎯 Layout settled! (${snapshot.cpu.find((m) => m.label === "Graph.update")?.count ?? 0} update calls)`);
                    this.statsManager.reportDetailed();
                    // Reset measurements after reporting so next settlement shows fresh data
                    this.statsManager.resetMeasurements();
                } else if (!this.layoutManager.isSettled && this.wasSettled) {
                    // Reset when layout becomes unsettled (so we can report next settlement)
                    this.wasSettled = false;
                    // Restart layout session tracking
                    this.statsManager.startLayoutSession();
                    // eslint-disable-next-line no-console
                    console.log("🔄 Layout became unsettled, will report on next settlement");
                }
            });
        });

        // End frame profiling (correlates operations with inter-frame time)
        this.statsManager.endFrameProfiling();
    }

    async setStyleTemplate(t: StyleSchema, options?: QueueableOptions): Promise<Styles> {
        // Future enhancement: if t is a URL, fetch URL

        // Skip queue if requested
        if (options?.skipQueue) {
            return this._setStyleTemplateInternal(t);
        }

        // Clear completed status for style-init since we're explicitly re-initializing styles
        // This ensures dependency ordering works correctly in batch mode
        this.operationQueue.clearCategoryCompleted("style-init");

        // Queue the operation using queueOperationAsync to properly handle batch mode
        return this.operationQueue.queueOperationAsync(
            "style-init",
            async(context) => {
                if (context.signal.aborted) {
                    throw new Error("Operation cancelled");
                }

                await this._setStyleTemplateInternal(t);
            },
            {
                description: "Setting style template",
                ... options,
            },
        ).then(() => this.styles);
    }

    private async _setStyleTemplateInternal(t: StyleSchema): Promise<Styles> {
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

        // Update LayoutManager with new styles reference
        this.layoutManager.updateStyles(this.styles);

        // setup PhotoDome Skybox
        if (this.styles.config.graph.background.backgroundType === "skybox" &&
                typeof this.styles.config.graph.background.data === "string") {
            const skyboxUrl = this.styles.config.graph.background.data;
            const photoDome = new PhotoDome(
                "testdome",
                skyboxUrl,
                {
                    resolution: 32,
                    size: 500,
                },
                this.scene,
            );
                // Emit event when skybox texture is loaded
            photoDome.texture.onLoadObservable.addOnce(() => {
                this.eventManager.emitGraphEvent("skybox-loaded", {
                    graph: this,
                    url: skyboxUrl,
                });
            });
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

    async addNode(node: AdHocData, idPath?: string, options?: QueueableOptions): Promise<void> {
        await this.addNodes([node], idPath, options);
    }

    /**
     * Add nodes to the graph incrementally.
     *
     * @remarks
     * This method ADDS nodes to the existing graph. It does not replace
     * existing nodes. If you want to replace all nodes, use the
     * `nodeData` property on the web component instead.
     *
     * @param nodes - Array of node data to add
     * @param idPath - Key to use for node IDs (default: "id")
     * @param options - Queue options
     *
     * @example
     * ```typescript
     * // Add nodes incrementally
     * await graph.addNodes([{id: "1"}, {id: "2"}]);
     * await graph.addNodes([{id: "3"}, {id: "4"}]);
     * // Graph now has 4 nodes
     * ```
     */
    async addNodes(nodes: Record<string | number, unknown>[], idPath?: string, options?: QueueableOptions): Promise<void> {
        if (options?.skipQueue) {
            this.dataManager.addNodes(nodes, idPath);
            return;
        }

        await this.operationQueue.queueOperationAsync(
            "data-add",
            (context) => {
                if (context.signal.aborted) {
                    throw new Error("Operation cancelled");
                }

                this.dataManager.addNodes(nodes, idPath);
            },
            {
                description: `Adding ${nodes.length} nodes`,
                ... options,
            },
        );
    }

    async addEdge(edge: AdHocData, srcIdPath?: string, dstIdPath?: string, options?: QueueableOptions): Promise<void> {
        await this.addEdges([edge], srcIdPath, dstIdPath, options);
    }

    async addEdges(edges: Record<string | number, unknown>[], srcIdPath?: string, dstIdPath?: string, options?: QueueableOptions): Promise<void> {
        if (options?.skipQueue) {
            this.dataManager.addEdges(edges, srcIdPath, dstIdPath);
            return;
        }

        await this.operationQueue.queueOperationAsync(
            "data-add",
            (context) => {
                if (context.signal.aborted) {
                    throw new Error("Operation cancelled");
                }

                this.dataManager.addEdges(edges, srcIdPath, dstIdPath);
            },
            {
                description: `Adding ${edges.length} edges`,
                ... options,
            },
        );
    }

    async setLayout(type: string, opts: object = {}, options?: QueueableOptions): Promise<void> {
        if (options?.skipQueue) {
            await this.layoutManager.setLayout(type, opts);
            return;
        }

        await this.operationQueue.queueOperationAsync(
            "layout-set",
            async(context) => {
                if (context.signal.aborted) {
                    throw new Error("Operation cancelled");
                }

                await this.layoutManager.setLayout(type, opts);
            },
            {
                description: `Setting layout to ${type}`,
                ... options,
            },
        );
    }

    async runAlgorithm(namespace: string, type: string, options?: QueueableOptions): Promise<void> {
        if (options?.skipQueue) {
            await this.algorithmManager.runAlgorithm(namespace, type);
            return;
        }

        await this.operationQueue.queueOperationAsync(
            "algorithm-run",
            async(context) => {
                if (context.signal.aborted) {
                    throw new Error("Operation cancelled");
                }

                await this.algorithmManager.runAlgorithm(namespace, type);
            },
            {
                description: `Running ${namespace}:${type} algorithm`,
                ... options,
            },
        );
    }

    async removeNodes(nodeIds: (string | number)[], options?: QueueableOptions): Promise<void> {
        if (options?.skipQueue) {
            nodeIds.forEach((id) => this.dataManager.removeNode(id));
            return;
        }

        await this.operationQueue.queueOperationAsync(
            "data-remove",
            (context) => {
                if (context.signal.aborted) {
                    throw new Error("Operation cancelled");
                }

                nodeIds.forEach((id) => this.dataManager.removeNode(id));
            },
            {
                description: `Removing ${nodeIds.length} nodes`,
                ... options,
            },
        );
    }

    async updateNodes(updates: {id: string | number, [key: string]: unknown}[], options?: QueueableOptions): Promise<void> {
        if (options?.skipQueue) {
            updates.forEach((update) => {
                const node = this.dataManager.getNode(update.id);
                if (node) {
                    Object.assign(node.data, update);
                    // Recompute style after data update
                    const styleId = this.styles.getStyleForNode(node.data);
                    node.updateStyle(styleId);
                }
            });
            return;
        }

        await this.operationQueue.queueOperationAsync(
            "data-update",
            (context) => {
                if (context.signal.aborted) {
                    throw new Error("Operation cancelled");
                }

                updates.forEach((update) => {
                    const node = this.dataManager.getNode(update.id);
                    if (node) {
                        Object.assign(node.data, update);
                        // Recompute style after data update
                        const styleId = this.styles.getStyleForNode(node.data);
                        node.updateStyle(styleId);
                    }
                });
            },
            {
                description: `Updating ${updates.length} nodes`,
                ... options,
            },
        );
    }

    async setCameraMode(mode: CameraKey, options?: QueueableOptions): Promise<void> {
        if (options?.skipQueue) {
            this.camera.activateCamera(mode);
            return;
        }

        await this.operationQueue.queueOperationAsync(
            "camera-update",
            (context) => {
                if (context.signal.aborted) {
                    throw new Error("Operation cancelled");
                }

                this.camera.activateCamera(mode);
            },
            {
                description: `Setting camera mode to ${mode}`,
                ... options,
            },
        );
    }

    async setRenderSettings(settings: Record<string, unknown>, options?: QueueableOptions): Promise<void> {
        if (options?.skipQueue) {
            // Apply render settings directly
            // TODO: Add render settings support when available
            return;
        }

        await this.operationQueue.queueOperationAsync(
            "render-update",
            (context) => {
                if (context.signal.aborted) {
                    throw new Error("Operation cancelled");
                }

                // TODO: Add render settings support when available
            },
            {
                description: "Updating render settings",
                ... options,
            },
        );
    }

    /**
     * Execute multiple operations as a batch
     * Operations will be queued and executed in dependency order
     */
    async batchOperations(fn: () => Promise<void> | void): Promise<void> {
        this.operationQueue.enterBatchMode();

        try {
            await fn();
        } catch (error) {
            await this.operationQueue.exitBatchMode();
            throw error;
        }

        // Exit batch mode and wait for all operations to complete
        await this.operationQueue.exitBatchMode();
    }

    getNodeCount(): number {
        return this.dataManager.nodes.size;
    }

    getEdgeCount(): number {
        return this.dataManager.edges.size;
    }

    /**
     * Alias for addEventListener
     */
    on(type: EventType, cb: EventCallbackType): void {
        this.addListener(type, cb);
    }

    addListener(type: EventType, cb: EventCallbackType): void {
        // Delegate to EventManager
        this.eventManager.addListener(type, cb);
    }

    /**
     * Zoom the camera to fit all nodes in view.
     *
     * @remarks
     * This operation executes immediately and does not go through the
     * operation queue. It may race with queued camera updates.
     *
     * For better coordination, consider using:
     * ```typescript
     * await graph.batchOperations(async () => {
     *     await graph.setStyleTemplate({graph: {twoD: true}});
     *     graph.zoomToFit(); // Will execute after camera update
     * });
     * ```
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

    getUpdateManager(): UpdateManager {
        return this.updateManager;
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
            enableDetailedProfiling: this.enableDetailedProfiling,
        };
    }

    isRunning(): boolean {
        return this.layoutManager.running;
    }

    setRunning(running: boolean): void {
        this.layoutManager.running = running;
    }

    // Input manager access
    /**
     * Get the input manager
     */
    get input(): InputManager {
        return this.inputManager;
    }

    /**
     * Enable or disable input
     */
    setInputEnabled(enabled: boolean): void {
        this.inputManager.setEnabled(enabled);
    }

    /**
     * Start recording input for testing/automation
     */
    startInputRecording(): void {
        this.inputManager.startRecording();
    }

    /**
     * Stop recording and get recorded events
     */
    stopInputRecording(): RecordedInputEvent[] {
        return this.inputManager.stopRecording();
    }

    worldToScreen(worldPos: {x: number, y: number, z: number}): {x: number, y: number} {
        const engine = this.scene.getEngine();
        const viewport = this.scene.activeCamera?.viewport;
        const view = this.scene.getViewMatrix();
        const projection = this.scene.getProjectionMatrix();

        if (!viewport) {
            return {x: 0, y: 0};
        }

        // Create transformation matrix manually
        const viewProjection = view.multiply(projection);
        const worldVec = new Vector3(worldPos.x, worldPos.y, worldPos.z);

        // Transform to clip space
        const clipSpace = Vector3.TransformCoordinates(worldVec, viewProjection);

        // Convert to screen space
        const screenX = (clipSpace.x + 1) * 0.5 * engine.getRenderWidth();
        const screenY = (1 - clipSpace.y) * 0.5 * engine.getRenderHeight();

        return {x: screenX, y: screenY};
    }

    screenToWorld(screenPos: {x: number, y: number}): {x: number, y: number, z: number} | null {
        const pickInfo = this.scene.pick(screenPos.x, screenPos.y);
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (pickInfo?.pickedPoint) {
            return {
                x: pickInfo.pickedPoint.x,
                y: pickInfo.pickedPoint.y,
                z: pickInfo.pickedPoint.z,
            };
        }

        return null;
    }

    getCameraController(): CameraController | null {
        return this.camera.getActiveController();
    }

    getNodeMesh(nodeId: string): AbstractMesh | null {
        const node = this.dataManager.nodes.get(nodeId);
        return node?.mesh ?? null;
    }

    /**
     * Async method to wait for graph operations to settle
     * Waits for operation queue to drain
     */
    async waitForSettled(): Promise<void> {
        // Wait for operation queue to complete all operations
        await this.operationQueue.waitForCompletion();
    }

    /**
     * Capture a screenshot of the current graph visualization.
     *
     * @param options - Screenshot options (format, resolution, destinations, etc.)
     * @returns Promise resolving to ScreenshotResult with blob and metadata
     *
     * @example
     * ```typescript
     * // Basic PNG screenshot
     * const result = await graph.captureScreenshot();
     *
     * // High-res JPEG with download
     * const result = await graph.captureScreenshot({
     *   format: 'jpeg',
     *   multiplier: 2,
     *   destination: { download: true }
     * });
     *
     * // Copy to clipboard
     * const result = await graph.captureScreenshot({
     *   destination: { clipboard: true }
     * });
     * ```
     */
    async captureScreenshot(options?: ScreenshotOptions): Promise<ScreenshotResult> {
        const screenshotCapture = new ScreenshotCapture(
            this.engine,
            this.scene,
            this.canvas,
            this,
        );
        return screenshotCapture.captureScreenshot(options);
    }

    /**
     * Get the current camera state
     */
    getCameraState(): import("./screenshot/types.js").CameraState {
        const camera = this.scene.activeCamera;
        if (!camera) {
            return {};
        }

        const state: import("./screenshot/types.js").CameraState = {};

        // Get the active camera controller (OrbitCameraController or TwoDCameraController)
        const controller = this.camera.getActiveController();

        if (controller && "pivot" in controller && "cameraDistance" in controller) {
            // OrbitCameraController - get world position and pivot position
            const orbitController = controller as unknown as {
                pivot: {position: Vector3, rotation: Vector3, computeWorldMatrix: (force: boolean) => void};
                cameraDistance: number;
                camera: {position: Vector3, parent: unknown, computeWorldMatrix: (force: boolean) => void};
            };

            // Get camera's world position
            // Compute world matrix first
            orbitController.pivot.computeWorldMatrix(true);
            orbitController.camera.computeWorldMatrix(true);

            // Extract world position from world matrix
            const worldMatrix = camera.getWorldMatrix();
            const worldPosition = Vector3.TransformCoordinates(Vector3.Zero(), worldMatrix);
            state.position = {
                x: worldPosition.x,
                y: worldPosition.y,
                z: worldPosition.z,
            };

            // Pivot position is the "target" (what camera looks at)
            state.target = {
                x: orbitController.pivot.position.x,
                y: orbitController.pivot.position.y,
                z: orbitController.pivot.position.z,
            };

            // Store pivot rotation and distance for restoration
            state.pivotRotation = {
                x: orbitController.pivot.rotation.x,
                y: orbitController.pivot.rotation.y,
                z: orbitController.pivot.rotation.z,
            };
            state.cameraDistance = orbitController.cameraDistance;
        } else if (controller && "velocity" in controller) {
            // TwoDCameraController - get zoom and pan
            const twoDController = controller as unknown as {
                camera: {
                    position: Vector3;
                    orthoLeft: number | null;
                    orthoRight: number | null;
                    orthoTop: number | null;
                    orthoBottom: number | null;
                };
                config: {
                    initialOrthoSize: number;
                };
            };

            // Calculate current zoom from ortho bounds
            const currentSize = (twoDController.camera.orthoRight ?? 1) - (twoDController.camera.orthoLeft ?? -1);
            const halfSize = currentSize / 2;
            const initialSize = twoDController.config.initialOrthoSize;
            state.zoom = initialSize / halfSize;

            // Get pan from camera position
            state.pan = {
                x: twoDController.camera.position.x,
                y: twoDController.camera.position.y,
            };
        } else if ("position" in camera) {
            // Fallback for other camera types
            state.position = {
                x: camera.position.x,
                y: camera.position.y,
                z: camera.position.z,
            };

            // Check if camera has a target (ArcRotateCamera)
            if ("target" in camera && camera.target instanceof Vector3) {
                state.target = {
                    x: camera.target.x,
                    y: camera.target.y,
                    z: camera.target.z,
                };
            }
        }

        return state;
    }

    /**
     * Set the camera state (Phase 4: with animation support)
     */
    async setCameraState(
        state: import("./screenshot/types.js").CameraState | {preset: string},
        options?: import("./screenshot/types.js").CameraAnimationOptions,
    ): Promise<void> {
        const camera = this.scene.activeCamera;
        if (!camera) {
            return;
        }

        // Resolve preset if needed
        const resolvedState = "preset" in state ?
            this.resolveCameraPreset(state.preset) :
            state;

        // For immediate (non-animated) updates or skipQueue, apply directly
        if (!options || !options.animate || options.skipQueue) {
            this.applyCameraStateImmediate(resolvedState);
            // Emit event
            this.eventManager.emitGraphEvent("camera-state-changed", {state: resolvedState});

            return;
        }

        // Queue animated camera transitions through operation queue
        await this.operationQueue.queueOperationAsync(
            "camera-update",
            async(context) => {
                if (context.signal.aborted) {
                    throw new Error("Operation cancelled");
                }

                // Animated transitions
                const controller = this.camera.getActiveController();

                try {
                    if (controller && "pivot" in controller && "cameraDistance" in controller) {
                        // OrbitCameraController (3D)
                        await this.animateOrbitCamera(resolvedState, options, context.signal);
                    } else if (controller && "velocity" in controller && typeof (controller as {velocity?: unknown}).velocity === "object") {
                        // TwoDCameraController (2D) - has velocity object
                        await this.animate2DCamera(resolvedState, options, context.signal);
                    } else {
                        // Unknown controller, apply immediately
                        this.applyCameraStateImmediate(resolvedState);
                        this.eventManager.emitGraphEvent("camera-state-changed", {state: resolvedState});
                    }
                } catch (error) {
                    // Check if error is due to cancellation
                    if (error instanceof Error && error.message === "Operation cancelled") {
                        throw error; // Re-throw cancellation
                    }

                    console.error("Camera animation failed:", error);
                    // Fallback to immediate
                    this.applyCameraStateImmediate(resolvedState);
                    this.eventManager.emitGraphEvent("camera-state-changed", {state: resolvedState});
                }
            },
            {
                description: (options && options.description) || `Animating camera to ${resolvedState.position ? "position" : "state"}`,
            },
        );
    }

    /**
     * Apply camera state immediately without animation
     */
    private applyCameraStateImmediate(state: import("./screenshot/types.js").CameraState): void {
        const camera = this.scene.activeCamera;
        if (!camera) {
            return;
        }

        // Get the active camera controller
        const controller = this.camera.getActiveController();

        if (controller && "pivot" in controller && "cameraDistance" in controller) {
            // OrbitCameraController - work with pivot system
            const orbitController = controller as unknown as {
                pivot: {position: Vector3, rotation: Vector3, computeWorldMatrix: (force: boolean) => void};
                cameraDistance: number;
                updateCameraPosition: () => void;
            };

            // Set pivot position (target)
            if (state.target) {
                orbitController.pivot.position.set(
                    state.target.x,
                    state.target.y,
                    state.target.z,
                );
            }

            // Set pivot rotation if provided (for exact state restoration)
            if (state.pivotRotation) {
                orbitController.pivot.rotation.set(
                    state.pivotRotation.x,
                    state.pivotRotation.y,
                    state.pivotRotation.z,
                );
            } else if (state.position && state.target) {
                // Calculate pivot rotation from position and target
                // Camera should look from position towards target
                const direction = new Vector3(
                    state.position.x - state.target.x,
                    state.position.y - state.target.y,
                    state.position.z - state.target.z,
                );
                const distance = direction.length();

                // Calculate rotation angles to orient pivot so camera looks at target
                // Add π to yaw because OrbitController's camera points in the opposite direction
                const yaw = Math.atan2(direction.x, direction.z) + Math.PI;
                const pitch = Math.asin(direction.y / distance);

                orbitController.pivot.rotation.set(pitch, yaw, 0);
            }

            // Set camera distance if provided
            if (state.cameraDistance !== undefined) {
                orbitController.cameraDistance = state.cameraDistance;
            } else if (state.position && state.target) {
                // Calculate distance from position to target
                const dx = state.position.x - state.target.x;
                const dy = state.position.y - state.target.y;
                const dz = state.position.z - state.target.z;
                orbitController.cameraDistance = Math.sqrt((dx * dx) + (dy * dy) + (dz * dz));
            }

            // Update the pivot's world matrix and camera position
            orbitController.pivot.computeWorldMatrix(true);
            orbitController.updateCameraPosition();
        } else if (controller && "velocity" in controller) {
            // TwoDCameraController - handle zoom and pan
            const twoDController = controller as unknown as {
                camera: {
                    position: Vector3;
                    orthoLeft: number | null;
                    orthoRight: number | null;
                    orthoTop: number | null;
                    orthoBottom: number | null;
                };
                config: {
                    initialOrthoSize: number;
                };
                updateOrtho: (size: number) => void;
            };

            // Set zoom (ortho bounds)
            if (state.zoom !== undefined) {
                const initialSize = twoDController.config.initialOrthoSize;
                const targetSize = initialSize / state.zoom;
                twoDController.updateOrtho(targetSize); // Reuse controller method
            }

            // Set pan (camera position)
            if (state.pan) {
                // Reuse controller's pan method for consistency
                const dx = state.pan.x - twoDController.camera.position.x;
                const dy = state.pan.y - twoDController.camera.position.y;

                // Use controller's pan method (adds delta)
                const panMethod = twoDController as unknown as {pan: (dx: number, dy: number) => void};
                panMethod.pan(dx, dy);
            }
        } else {
            // Fallback for other camera types
            if (state.position && "position" in camera) {
                camera.position.set(state.position.x, state.position.y, state.position.z);
            }

            if (state.target && "setTarget" in camera && typeof camera.setTarget === "function") {
                camera.setTarget(new Vector3(state.target.x, state.target.y, state.target.z));
            }
        }
    }

    /**
     * Apply easing function to animation
     */
    private applyEasing(animation: Animation, easing?: string): void {
        if (!easing || easing === "linear") {
            return; // No easing
        }

        let easingFunction: CubicEase;

        switch (easing) {
            case "easeInOut":
                easingFunction = new CubicEase();
                easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
                break;
            case "easeIn":
                easingFunction = new CubicEase();
                easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEIN);
                break;
            case "easeOut":
                easingFunction = new CubicEase();
                easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);
                break;
            default:
                return; // Unknown easing, use linear
        }

        animation.setEasingFunction(easingFunction);
    }

    /**
     * Animate camera distance using dummy object pattern
     * Required because cameraDistance is not a scene node property
     */
    private async animateCameraDistance(
        orbitController: {
            cameraDistance: number;
            updateCameraPosition: () => void;
        },
        targetDistance: number,
        frameCount: number,
        fps: number,
        easing?: string,
    ): Promise<void> {
        // Create dummy object to animate
        const dummy = {value: orbitController.cameraDistance};

        const distAnim = new Animation(
            "camera_distance",
            "value",
            fps,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CONSTANT,
        );

        distAnim.setKeys([
            {frame: 0, value: orbitController.cameraDistance},
            {frame: frameCount, value: targetDistance},
        ]);

        this.applyEasing(distAnim, easing);

        return new Promise((resolve) => {
            // Create observer to update controller during animation
            const observer = this.scene.onBeforeRenderObservable.add(() => {
                orbitController.cameraDistance = dummy.value;
                orbitController.updateCameraPosition();
            });

            // Animate the dummy object
            this.scene.beginDirectAnimation(
                dummy,
                [distAnim],
                0,
                frameCount,
                false,
                1.0,
                () => {
                    // Cleanup observer
                    this.scene.onBeforeRenderObservable.remove(observer);

                    // Ensure final value
                    orbitController.cameraDistance = targetDistance;
                    orbitController.updateCameraPosition();

                    resolve();
                },
            );
        });
    }

    /**
     * Animate OrbitCameraController to target state
     * Handles pivot-based camera system with custom distance animation
     */
    private async animateOrbitCamera(
        targetState: import("./screenshot/types.js").CameraState,
        options: import("./screenshot/types.js").CameraAnimationOptions,
        signal?: AbortSignal,
    ): Promise<void> {
        const controller = this.camera.getActiveController();

        // Type guard - ensure we have OrbitCameraController
        if (!controller || !("pivot" in controller) || !("cameraDistance" in controller)) {
            // Fallback to immediate if controller doesn't match
            this.applyCameraStateImmediate(targetState);
            return;
        }

        const orbitController = controller as unknown as {
            pivot: {
                position: Vector3;
                rotation: Vector3;
                animations?: Animation[];
                computeWorldMatrix: (force: boolean) => void;
            };
            cameraDistance: number;
            updateCameraPosition: () => void;
        };

        const fps = 60;
        const duration = options.duration ?? 1000;
        const frameCount = Math.floor(duration / (1000 / fps));
        const animations: Animation[] = [];

        // Animation 1: Pivot Position (target)
        if (targetState.target) {
            const posAnim = new Animation(
                "pivot_position",
                "position",
                fps,
                Animation.ANIMATIONTYPE_VECTOR3,
                Animation.ANIMATIONLOOPMODE_CONSTANT,
            );

            posAnim.setKeys([
                {
                    frame: 0,
                    value: orbitController.pivot.position.clone(),
                },
                {
                    frame: frameCount,
                    value: new Vector3(
                        targetState.target.x,
                        targetState.target.y,
                        targetState.target.z,
                    ),
                },
            ]);

            this.applyEasing(posAnim, options.easing);
            animations.push(posAnim);
        }

        // Animation 2: Pivot Rotation (view direction)
        if (targetState.pivotRotation) {
            const rotAnim = new Animation(
                "pivot_rotation",
                "rotation",
                fps,
                Animation.ANIMATIONTYPE_VECTOR3,
                Animation.ANIMATIONLOOPMODE_CONSTANT,
            );

            rotAnim.setKeys([
                {
                    frame: 0,
                    value: orbitController.pivot.rotation.clone(),
                },
                {
                    frame: frameCount,
                    value: new Vector3(
                        targetState.pivotRotation.x,
                        targetState.pivotRotation.y,
                        targetState.pivotRotation.z,
                    ),
                },
            ]);

            this.applyEasing(rotAnim, options.easing);
            animations.push(rotAnim);
        } else if (targetState.position && targetState.target) {
            // Calculate pivot rotation from position and target
            const direction = new Vector3(
                targetState.position.x - targetState.target.x,
                targetState.position.y - targetState.target.y,
                targetState.position.z - targetState.target.z,
            );
            const distance = direction.length();
            const yaw = Math.atan2(direction.x, direction.z) + Math.PI;
            const pitch = Math.asin(direction.y / distance);

            const rotAnim = new Animation(
                "pivot_rotation",
                "rotation",
                fps,
                Animation.ANIMATIONTYPE_VECTOR3,
                Animation.ANIMATIONLOOPMODE_CONSTANT,
            );

            rotAnim.setKeys([
                {
                    frame: 0,
                    value: orbitController.pivot.rotation.clone(),
                },
                {
                    frame: frameCount,
                    value: new Vector3(pitch, yaw, 0),
                },
            ]);

            this.applyEasing(rotAnim, options.easing);
            animations.push(rotAnim);
        }

        // Animation 3: Camera Distance (custom property)
        let distanceAnimation: Promise<void> | undefined;
        if (targetState.cameraDistance !== undefined) {
            distanceAnimation = this.animateCameraDistance(
                orbitController,
                targetState.cameraDistance,
                frameCount,
                fps,
                options.easing,
            );
        } else if (targetState.position && targetState.target) {
            // Calculate distance from position to target
            const dx = targetState.position.x - targetState.target.x;
            const dy = targetState.position.y - targetState.target.y;
            const dz = targetState.position.z - targetState.target.z;
            const calculatedDistance = Math.sqrt((dx * dx) + (dy * dy) + (dz * dz));
            distanceAnimation = this.animateCameraDistance(
                orbitController,
                calculatedDistance,
                frameCount,
                fps,
                options.easing,
            );
        }

        // Apply animations to pivot
        if (animations.length > 0) {
            orbitController.pivot.animations = animations;

            await new Promise<void>((resolve, reject) => {
                this.scene.beginAnimation(
                    orbitController.pivot,
                    0,
                    frameCount,
                    false,
                    1.0,
                    () => {
                        // Wait for distance animation to complete
                        const finalize = async(): Promise<void> => {
                            if (distanceAnimation) {
                                await distanceAnimation;
                            }

                            // Ensure final state is applied exactly
                            if (targetState.target) {
                                orbitController.pivot.position.set(
                                    targetState.target.x,
                                    targetState.target.y,
                                    targetState.target.z,
                                );
                            }

                            if (targetState.pivotRotation) {
                                orbitController.pivot.rotation.set(
                                    targetState.pivotRotation.x,
                                    targetState.pivotRotation.y,
                                    targetState.pivotRotation.z,
                                );
                            } else if (targetState.position && targetState.target) {
                                const direction = new Vector3(
                                    targetState.position.x - targetState.target.x,
                                    targetState.position.y - targetState.target.y,
                                    targetState.position.z - targetState.target.z,
                                );
                                const distance = direction.length();
                                const yaw = Math.atan2(direction.x, direction.z) + Math.PI;
                                const pitch = Math.asin(direction.y / distance);
                                orbitController.pivot.rotation.set(pitch, yaw, 0);
                            }

                            orbitController.pivot.computeWorldMatrix(true);
                            orbitController.updateCameraPosition();

                            // Emit completion event
                            this.eventManager.emitGraphEvent("camera-state-changed", {
                                state: targetState,
                            });

                            resolve();
                        };

                        void finalize();
                    },
                );

                // Handle cancellation via AbortSignal
                if (signal) {
                    signal.addEventListener("abort", () => {
                        // Stop the animation
                        this.scene.stopAnimation(orbitController.pivot);
                        // Also stop distance animation if running
                        // (distance animation handles its own cleanup)
                        reject(new Error("Operation cancelled"));
                    }, {once: true});
                }
            });
        } else if (distanceAnimation) {
            // Only distance animation
            await distanceAnimation;
            this.eventManager.emitGraphEvent("camera-state-changed", {
                state: targetState,
            });
        }
    }

    /**
     * Animate 2D camera (zoom and pan)
     */
    private async animate2DCamera(
        targetState: import("./screenshot/types.js").CameraState,
        options: import("./screenshot/types.js").CameraAnimationOptions,
        signal?: AbortSignal,
    ): Promise<void> {
        const controller = this.camera.getActiveController();

        // Type guard for 2D controller
        if (!controller || !("velocity" in controller)) {
            this.applyCameraStateImmediate(targetState);
            return;
        }

        const twoDController = controller as unknown as {
            camera: {
                position: Vector3;
                orthoLeft: number | null;
                orthoRight: number | null;
                orthoTop: number | null;
                orthoBottom: number | null;
            };
            config: {
                initialOrthoSize: number;
            };
        };

        const fps = 60;
        const duration = options.duration ?? 1000;
        const frameCount = Math.floor(duration / (1000 / fps));

        // Create dummy object to animate camera properties
        const dummy = {
            posX: twoDController.camera.position.x,
            posY: twoDController.camera.position.y,
            orthoLeft: twoDController.camera.orthoLeft ?? -1,
            orthoRight: twoDController.camera.orthoRight ?? 1,
            orthoTop: twoDController.camera.orthoTop ?? 1,
            orthoBottom: twoDController.camera.orthoBottom ?? -1,
        };

        const animations: Animation[] = [];

        // Animate zoom (ortho bounds)
        if (targetState.zoom !== undefined) {
            // Calculate target ortho bounds based on zoom factor
            // Zoom is absolute: 1.0 = initial size, 2.0 = half size (zoomed in), 0.5 = double size (zoomed out)
            const initialSize = twoDController.config.initialOrthoSize;
            const targetSize = initialSize / targetState.zoom;

            const orthoLeftAnim = new Animation(
                "ortho_left",
                "orthoLeft",
                fps,
                Animation.ANIMATIONTYPE_FLOAT,
                Animation.ANIMATIONLOOPMODE_CONSTANT,
            );
            orthoLeftAnim.setKeys([
                {frame: 0, value: dummy.orthoLeft},
                {frame: frameCount, value: -targetSize},
            ]);
            this.applyEasing(orthoLeftAnim, options.easing);
            animations.push(orthoLeftAnim);

            const orthoRightAnim = new Animation(
                "ortho_right",
                "orthoRight",
                fps,
                Animation.ANIMATIONTYPE_FLOAT,
                Animation.ANIMATIONLOOPMODE_CONSTANT,
            );
            orthoRightAnim.setKeys([
                {frame: 0, value: dummy.orthoRight},
                {frame: frameCount, value: targetSize},
            ]);
            this.applyEasing(orthoRightAnim, options.easing);
            animations.push(orthoRightAnim);

            // Calculate aspect ratio to maintain proportions
            const aspect = (dummy.orthoTop - dummy.orthoBottom) / (dummy.orthoRight - dummy.orthoLeft);
            const orthoTopAnim = new Animation(
                "ortho_top",
                "orthoTop",
                fps,
                Animation.ANIMATIONTYPE_FLOAT,
                Animation.ANIMATIONLOOPMODE_CONSTANT,
            );
            orthoTopAnim.setKeys([
                {frame: 0, value: dummy.orthoTop},
                {frame: frameCount, value: targetSize * aspect},
            ]);
            this.applyEasing(orthoTopAnim, options.easing);
            animations.push(orthoTopAnim);

            const orthoBottomAnim = new Animation(
                "ortho_bottom",
                "orthoBottom",
                fps,
                Animation.ANIMATIONTYPE_FLOAT,
                Animation.ANIMATIONLOOPMODE_CONSTANT,
            );
            orthoBottomAnim.setKeys([
                {frame: 0, value: dummy.orthoBottom},
                {frame: frameCount, value: -targetSize * aspect},
            ]);
            this.applyEasing(orthoBottomAnim, options.easing);
            animations.push(orthoBottomAnim);
        }

        // Animate pan (camera position)
        if (targetState.pan?.x !== undefined) {
            const panXAnim = new Animation(
                "camera_pan_x",
                "posX",
                fps,
                Animation.ANIMATIONTYPE_FLOAT,
                Animation.ANIMATIONLOOPMODE_CONSTANT,
            );

            panXAnim.setKeys([
                {frame: 0, value: twoDController.camera.position.x},
                {frame: frameCount, value: targetState.pan.x},
            ]);

            this.applyEasing(panXAnim, options.easing);
            animations.push(panXAnim);
        }

        if (targetState.pan?.y !== undefined) {
            const panYAnim = new Animation(
                "camera_pan_y",
                "posY",
                fps,
                Animation.ANIMATIONTYPE_FLOAT,
                Animation.ANIMATIONLOOPMODE_CONSTANT,
            );

            panYAnim.setKeys([
                {frame: 0, value: twoDController.camera.position.y},
                {frame: frameCount, value: targetState.pan.y},
            ]);

            this.applyEasing(panYAnim, options.easing);
            animations.push(panYAnim);
        }

        if (animations.length === 0) {
            return;
        }

        await new Promise<void>((resolve, reject) => {
            // Create observer to update controller
            const observer = this.scene.onBeforeRenderObservable.add(() => {
                twoDController.camera.position.x = dummy.posX;
                twoDController.camera.position.y = dummy.posY;
                twoDController.camera.orthoLeft = dummy.orthoLeft;
                twoDController.camera.orthoRight = dummy.orthoRight;
                twoDController.camera.orthoTop = dummy.orthoTop;
                twoDController.camera.orthoBottom = dummy.orthoBottom;
            });

            // Animate dummy object
            const animatable = this.scene.beginDirectAnimation(
                dummy,
                animations,
                0,
                frameCount,
                false,
                1.0,
                () => {
                    // Cleanup
                    this.scene.onBeforeRenderObservable.remove(observer);

                    // Apply final values exactly from dummy (already calculated during animation)
                    if (targetState.pan) {
                        twoDController.camera.position.x = dummy.posX;
                        twoDController.camera.position.y = dummy.posY;
                    }

                    if (targetState.zoom !== undefined) {
                        twoDController.camera.orthoLeft = dummy.orthoLeft;
                        twoDController.camera.orthoRight = dummy.orthoRight;
                        twoDController.camera.orthoTop = dummy.orthoTop;
                        twoDController.camera.orthoBottom = dummy.orthoBottom;
                    }

                    this.eventManager.emitGraphEvent("camera-state-changed", {
                        state: targetState,
                    });

                    resolve();
                },
            );

            // Handle cancellation via AbortSignal
            if (signal) {
                signal.addEventListener("abort", () => {
                    // Stop the animation
                    animatable.stop();
                    // Cleanup observer
                    this.scene.onBeforeRenderObservable.remove(observer);
                    reject(new Error("Operation cancelled"));
                }, {once: true});
            }
        });
    }

    /**
     * Resolve a camera preset to a camera state
     */
    resolveCameraPreset(preset: string): import("./screenshot/types.js").CameraState {
        // For Phase 3, we only need basic fitToGraph support
        // Full preset implementation will come in Phase 5
        if (preset === "fitToGraph") {
            // Return a simple state that positions camera to see all nodes
            return {
                position: {x: 50, y: 50, z: 50},
                target: {x: 0, y: 0, z: 0},
            };
        }

        // Return current state for unknown presets
        return this.getCameraState();
    }

    /**
     * Phase 4 Convenience Methods
     */

    /**
     * Set camera position (3D)
     */
    async setCameraPosition(
        position: {x: number, y: number, z: number},
        options?: import("./screenshot/types.js").CameraAnimationOptions,
    ): Promise<void> {
        // Get current state to preserve target only
        // Don't copy pivotRotation/cameraDistance - let them be recalculated
        const currentState = this.getCameraState();
        return this.setCameraState({position, target: currentState.target}, options);
    }

    /**
     * Set camera target (3D)
     */
    async setCameraTarget(
        target: {x: number, y: number, z: number},
        options?: import("./screenshot/types.js").CameraAnimationOptions,
    ): Promise<void> {
        // Get current state to preserve position only
        // Don't copy pivotRotation/cameraDistance - let them be recalculated
        const currentState = this.getCameraState();
        return this.setCameraState({position: currentState.position, target}, options);
    }

    /**
     * Set camera zoom (2D)
     */
    async setCameraZoom(
        zoom: number,
        options?: import("./screenshot/types.js").CameraAnimationOptions,
    ): Promise<void> {
        return this.setCameraState({zoom}, options);
    }

    /**
     * Set camera pan (2D)
     */
    async setCameraPan(
        pan: {x: number, y: number},
        options?: import("./screenshot/types.js").CameraAnimationOptions,
    ): Promise<void> {
        return this.setCameraState({pan}, options);
    }

    /**
     * Reset camera to default state
     */
    async resetCamera(options?: import("./screenshot/types.js").CameraAnimationOptions): Promise<void> {
        // Get default camera state from current controller
        const defaultState = this.getDefaultCameraState();
        return this.setCameraState(defaultState, options);
    }

    /**
     * Get default camera state for current camera type
     * Lazily captures the initial state on first use, or returns captured state
     */
    private getDefaultCameraState(): import("./screenshot/types.js").CameraState {
        // If we haven't captured initial state yet, capture it now
        // This happens on the first call to resetCamera()
        this.initialCameraState ??= this.getCameraState();

        return this.initialCameraState;
    }

    /**
     * Set graph data (delegates to data manager)
     */
    setData(data: {nodes: Record<string, unknown>[], edges: Record<string, unknown>[]}): void {
        // Add nodes
        for (const nodeData of data.nodes) {
            this.addNode(nodeData as AdHocData)
                .catch((e: unknown) => {
                    console.error("Error adding node:", e);
                });
        }

        // Add edges
        for (const edgeData of data.edges) {
            this.addEdge(edgeData as AdHocData)
                .catch((e: unknown) => {
                    console.error("Error adding edge:", e);
                });
        }
    }

    /**
     * Get a specific node
     */
    getNode(nodeId: string | number): Node | undefined {
        return this.dataManager.getNode(nodeId);
    }

    /**
     * Get all nodes
     */
    getNodes(): Node[] {
        return Array.from(this.dataManager.nodes.values());
    }

    /**
     * Render method (public for testing)
     */
    render(): void {
        this.scene.render();
    }

    dispose(): void {
        this.shutdown();
    }
}
