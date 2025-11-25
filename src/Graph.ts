// Force side-effect imports to not be tree-shaken
import "./data/index"; // register all internal data sources
import "./layout/index"; // register all internal layouts
import "./algorithms/index"; // register all internal algorithms

import {
    AbstractMesh,
    Color4,
    Engine,
    PhotoDome,
    Scene,
    Vector3,
    WebGPUEngine,
    WebXRDefaultExperience,
} from "@babylonjs/core";

import {Algorithm} from "./algorithms/Algorithm";
import {type CameraController, type CameraKey, CameraManager} from "./cameras/CameraManager";
import {
    AdHocData,
    ApplySuggestedStylesOptions,
    FetchEdgesFn,
    FetchNodesFn,
    StyleSchema,
    SuggestedStylesConfig,
} from "./config";
import {
    EventCallbackType,
    EventType,
} from "./events";
import {AlgorithmManager, DataManager, DefaultGraphContext, EventManager, type GraphContext, type GraphContextConfig, InputManager, type InputManagerConfig, LayoutManager, LifecycleManager, type Manager, OperationQueueManager, type RecordedInputEvent, RenderManager, StatsManager, StyleManager, UpdateManager} from "./managers";
import {MeshCache} from "./meshes/MeshCache";
import {Node} from "./Node";
import {Styles} from "./Styles";
import type {QueueableOptions, RunAlgorithmOptions} from "./utils/queue-migration";
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
        // Use cleanup for common operations
        this.cleanup();

        // Dispose all managers through lifecycle manager
        this.lifecycleManager.dispose();
    }

    async runAlgorithmsFromTemplate(): Promise<void> {
        if (this.runAlgorithmsOnLoad && this.styles.config.data.algorithms) {
            await this.algorithmManager.runAlgorithmsFromTemplate(this.styles.config.data.algorithms);

            // Trigger calculated values after algorithms populate data
            for (const node of this.dataManager.nodes.values()) {
                node.changeManager.runAllCalculatedValues();
            }
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

    async runAlgorithm(namespace: string, type: string, options?: RunAlgorithmOptions): Promise<void> {
        if (options?.skipQueue) {
            await this.algorithmManager.runAlgorithm(namespace, type);

            if (options.applySuggestedStyles) {
                this.applySuggestedStyles(`${namespace}:${type}`);
            }

            return;
        }

        await this.operationQueue.queueOperationAsync(
            "algorithm-run",
            async(context) => {
                if (context.signal.aborted) {
                    throw new Error("Operation cancelled");
                }

                await this.algorithmManager.runAlgorithm(namespace, type);
                if (options?.applySuggestedStyles) {
                    this.applySuggestedStyles(`${namespace}:${type}`);
                }
            },
            {
                description: `Running ${namespace}:${type} algorithm`,
                ... options,
            },
        );
    }

    /**
     * Apply suggested styles from an algorithm
     * @param algorithmKey - Algorithm key (e.g., "graphty:degree") or array of keys
     * @param options - Options for applying suggested styles
     * @returns true if any styles were applied, false otherwise
     */
    applySuggestedStyles(
        algorithmKey: string | string[],
        options?: ApplySuggestedStylesOptions,
    ): boolean {
        const keys = Array.isArray(algorithmKey) ? algorithmKey : [algorithmKey];
        let applied = false;

        for (const key of keys) {
            const [namespace, type] = key.split(":");
            const AlgorithmClass = Algorithm.getClass(namespace, type);

            if (!AlgorithmClass || !AlgorithmClass.hasSuggestedStyles()) {
                continue;
            }

            const suggestedStyles = AlgorithmClass.getSuggestedStyles();
            if (suggestedStyles) {
                this.#applyStyleLayers(suggestedStyles, key, options);
                applied = true;
            }
        }

        return applied;
    }

    /**
     * Get suggested styles without applying them
     * @param algorithmKey - Algorithm key (e.g., "graphty:degree")
     * @returns Suggested styles config or null if none exist
     */
    getSuggestedStyles(algorithmKey: string): SuggestedStylesConfig | null {
        const [namespace, type] = algorithmKey.split(":");
        const AlgorithmClass = Algorithm.getClass(namespace, type);
        return AlgorithmClass?.getSuggestedStyles() ?? null;
    }

    /**
     * Private helper to apply style layers from suggested styles
     */
    #applyStyleLayers(
        suggestedStyles: SuggestedStylesConfig,
        algorithmKey: string,
        options?: ApplySuggestedStylesOptions,
    ): void {
        const {layers} = suggestedStyles;
        const {
            position = "append",
            mode = "merge",
            layerPrefix = "",
            enabledStyles,
        } = options ?? {};

        // If mode is replace, remove existing algorithm-sourced layers
        if (mode === "replace") {
            this.styleManager.removeLayersByMetadata((metadata) => {
                const typedMetadata = metadata as {algorithmSource?: string} | undefined;
                return typedMetadata?.algorithmSource === algorithmKey;
            });
        }

        // Filter layers by enabledStyles if provided
        const filteredLayers = enabledStyles ?
            layers.filter((layer) => {
                const name = layer.metadata?.name;
                return name && enabledStyles.includes(name);
            }) :
            layers;

        // Add metadata to track algorithm source
        const enhancedLayers = filteredLayers.map((layer) => ({
            ... layer,
            metadata: {
                ... layer.metadata,
                name: layerPrefix + (layer.metadata?.name ?? ""),
                algorithmSource: algorithmKey,
            },
        }));

        // Apply layers based on position using StyleManager methods
        // This automatically handles cache clearing and event emission
        if (position === "prepend") {
            // Insert at the beginning by inserting in reverse order
            for (let i = enhancedLayers.length - 1; i >= 0; i--) {
                this.styleManager.insertLayer(0, enhancedLayers[i]);
            }
        } else if (position === "append") {
            // Add to the end
            for (const layer of enhancedLayers) {
                this.styleManager.addLayer(layer);
            }
        } else if (typeof position === "number") {
            // Insert at specific position
            for (let i = 0; i < enhancedLayers.length; i++) {
                this.styleManager.insertLayer(position + i, enhancedLayers[i]);
            }
        }
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
                    const styleId = this.styles.getStyleForNode(node.data, node.algorithmResults);
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
                        const styleId = this.styles.getStyleForNode(node.data, node.algorithmResults);
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
