// Force side-effect imports to not be tree-shaken
import "./data/index"; // register all internal data sources
import "./layout/index"; // register all internal layouts
import "./algorithms/index"; // register all internal algorithms

import {
    AbstractMesh,
    Animation,
    Camera,
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

import {Algorithm} from "./algorithms/Algorithm";
import {
    BUILTIN_PRESETS,
    calculateFitToGraph,
    calculateFrontView,
    calculateIsometric,
    calculateSideView,
    calculateTopView,
} from "./camera/presets.js";
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
import {Node, type NodeIdType} from "./Node";
import {ScreenshotCapture} from "./screenshot/ScreenshotCapture.js";
import {ScreenshotError, ScreenshotErrorCode} from "./screenshot/ScreenshotError.js";
import type {ScreenshotOptions, ScreenshotResult} from "./screenshot/types.js";
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
    private initialCameraState?: import("./screenshot/types.js").CameraState;
    private userCameraPresets = new Map<string, import("./screenshot/types.js").CameraState>();
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
    /** Event manager for adding/removing event listeners */
    readonly eventManager: EventManager;
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

    // Active video capture for cancellation support
    private activeCapture: import("./video/MediaRecorderCapture.js").MediaRecorderCapture | null = null;

    // Storage for Z positions when switching from 3D to 2D mode
    private savedZPositions = new Map<NodeIdType, number>();

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
        const modeSwitching = previousTwoD !== currentTwoD;
        if (modeSwitching) {
            this.dataManager.meshCache.clear();

            // Update scene metadata for 2D mode detection
            this.scene.metadata = this.scene.metadata ?? {};
            this.scene.metadata.twoD = currentTwoD;

            // Save Z positions BEFORE any updates that might change them
            // (updateStyles calls node.update() which applies layout positions)
            if (currentTwoD && !previousTwoD) {
                // Switching from 3D to 2D: save current Z positions
                for (const node of this.getNodes()) {
                    this.savedZPositions.set(node.id, node.mesh.position.z);
                }
            }
        }

        // Always activate appropriate camera when styles are loaded
        // This ensures camera is set up correctly even on initial load
        const cameraType = currentTwoD ? "2d" : "orbit";
        this.camera.activateCamera(cameraType);

        // Update DataManager with new styles - this will apply styles to existing nodes/edges
        // IMPORTANT: DataManager needs to be updated after this.styles is set because
        // Node.updateStyle() calls this.parentGraph.styles
        this.dataManager.updateStyles(this.styles);

        // Update LayoutManager with new styles reference
        this.layoutManager.updateStyles(this.styles);

        // Handle Z-coordinate flattening/restoration AFTER style updates
        // (style updates call node.update() which applies layout positions including Z)
        if (modeSwitching) {
            const nodes = this.getNodes();
            if (currentTwoD && !previousTwoD) {
                // Switching from 3D to 2D: flatten Z positions to 0
                for (const node of nodes) {
                    node.mesh.position.z = 0;
                }
            } else if (!currentTwoD && previousTwoD) {
                // Switching from 2D to 3D: restore saved Z positions (or leave at 0)
                for (const node of nodes) {
                    const savedZ = this.savedZPositions.get(node.id);
                    if (savedZ !== undefined) {
                        node.mesh.position.z = savedZ;
                    }
                    // If no saved Z, leave at current position (0)
                }
                // Clear saved positions after restoration
                this.savedZPositions.clear();
            }
        }

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

    /**
     * Load graph data from a File object with auto-format detection
     * @param file - File object from file input
     * @param options - Loading options
     */
    async loadFromFile(
        file: File,
        options?: {
            format?: string;
            nodeIdPath?: string;
            edgeSrcIdPath?: string;
            edgeDstIdPath?: string;
        },
    ): Promise<void> {
        const {detectFormat} = await import("./data/format-detection.js");

        // Detect format if not explicitly provided
        let format = options?.format;

        if (!format) {
            // Read first 2KB for format detection
            const sample = await file.slice(0, 2048).text();
            const detected = detectFormat(file.name, sample);

            if (!detected) {
                throw new Error(
                    `Could not detect file format from '${file.name}'. ` +
                    "Supported formats: JSON, GraphML, GEXF, CSV, GML, DOT, Pajek. " +
                    "Try specifying format explicitly: loadFromFile(file, { format: \"graphml\" })",
                );
            }

            format = detected;
        }

        // Read full file content
        const content = await file.text();

        // Load using appropriate DataSource
        await this.addDataFromSource(format, {
            data: content,
            filename: file.name,
            size: file.size,
            ... options,
        });
    }

    /**
     * Load graph data from a URL with auto-format detection
     *
     * @remarks
     * This method attempts to detect the format from the URL extension first.
     * If the extension is not recognized (e.g., `.txt`), it fetches the content
     * and uses content-based detection. The content is then passed directly to
     * the data source to avoid a double-fetch.
     *
     * @param url - URL to fetch graph data from
     * @param options - Loading options
     *
     * @example
     * ```typescript
     * // Auto-detect format from extension
     * await graph.loadFromUrl("https://example.com/data.graphml");
     *
     * // Auto-detect from content when extension doesn't match
     * await graph.loadFromUrl("https://example.com/data.txt");
     *
     * // Explicitly specify format
     * await graph.loadFromUrl("https://example.com/data.txt", { format: "graphml" });
     * ```
     */
    async loadFromUrl(
        url: string,
        options?: {
            format?: string;
            nodeIdPath?: string;
            edgeSrcIdPath?: string;
            edgeDstIdPath?: string;
        },
    ): Promise<void> {
        const {detectFormat} = await import("./data/format-detection.js");

        let format = options?.format;
        let fetchedContent: string | undefined;

        if (!format) {
            // First try extension-based detection (no fetch needed)
            const detectedFromExtension = detectFormat(url, "");

            if (detectedFromExtension) {
                format = detectedFromExtension;
            } else {
                // Extension didn't match - fetch content for detection
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(
                        `Failed to fetch URL '${url}': ${response.status} ${response.statusText}`,
                    );
                }

                fetchedContent = await response.text();

                const sample = fetchedContent.slice(0, 2048);
                const detectedFromContent = detectFormat(url, sample);

                if (!detectedFromContent) {
                    throw new Error(
                        `Could not detect file format from '${url}'. ` +
                        "Supported formats: JSON, GraphML, GEXF, CSV, GML, DOT, Pajek. " +
                        "Try specifying format explicitly: loadFromUrl(url, { format: \"graphml\" })",
                    );
                }

                format = detectedFromContent;
            }
        }

        // If we already fetched content for detection, pass it as data to avoid double-fetch
        // Otherwise pass URL and let DataSource handle the fetch
        if (fetchedContent !== undefined) {
            await this.addDataFromSource(format, {
                data: fetchedContent,
                ... options,
            });
        } else {
            await this.addDataFromSource(format, {
                url,
                ... options,
            });
        }
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
     * Get the total number of registered event listeners.
     * Useful for debugging and testing to ensure listeners are properly cleaned up.
     *
     * @returns The number of registered listeners
     */
    listenerCount(): number {
        return this.eventManager.listenerCount();
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
     * Check if screenshot can be captured with given options.
     *
     * @param options - Screenshot options to validate
     * @returns Promise<CapabilityCheck> - Result indicating whether screenshot is supported
     *
     * @example
     * ```typescript
     * // Check if 4x multiplier is supported
     * const check = await graph.canCaptureScreenshot({ multiplier: 4 });
     * if (!check.supported) {
     *   console.error('Cannot capture:', check.reason);
     * } else if (check.warnings) {
     *   console.warn('Warnings:', check.warnings);
     * }
     *
     * // Check 8K resolution
     * const check8k = await graph.canCaptureScreenshot({
     *   width: 7680,
     *   height: 4320
     * });
     * console.log(`Memory: ${check8k.estimatedMemoryMB.toFixed(0)}MB`);
     * ```
     */
    async canCaptureScreenshot(options?: ScreenshotOptions): Promise<import("./screenshot/capability-check.js").CapabilityCheck> {
        const {canCaptureScreenshot} = await import("./screenshot/capability-check.js");
        return canCaptureScreenshot(this.canvas, options ?? {});
    }

    /**
     * Capture an animation as a video (stationary or animated camera)
     *
     * @param options - Animation capture options
     * @returns Promise resolving to AnimationResult with blob and metadata
     *
     * @example
     * ```typescript
     * // Basic 5-second video at 30fps
     * const result = await graph.captureAnimation({
     *   duration: 5000,
     *   fps: 30,
     *   cameraMode: 'stationary'
     * });
     *
     * // High-quality 60fps video with download
     * const result = await graph.captureAnimation({
     *   duration: 10000,
     *   fps: 60,
     *   cameraMode: 'stationary',
     *   download: true,
     *   downloadFilename: 'graph-video.webm'
     * });
     *
     * // Animated camera path (camera tour)
     * const result = await graph.captureAnimation({
     *   duration: 5000,
     *   fps: 30,
     *   cameraMode: 'animated',
     *   cameraPath: [
     *     { position: { x: 10, y: 10, z: 10 }, target: { x: 0, y: 0, z: 0 } },
     *     { position: { x: 0, y: 20, z: 0 }, target: { x: 0, y: 0, z: 0 }, duration: 2500 },
     *     { position: { x: -10, y: 10, z: 10 }, target: { x: 0, y: 0, z: 0 }, duration: 2500 }
     *   ],
     *   easing: 'easeInOut',
     *   download: true
     * });
     * ```
     */
    async captureAnimation(options: import("./video/VideoCapture.js").AnimationOptions): Promise<import("./video/VideoCapture.js").AnimationResult> {
        const {MediaRecorderCapture} = await import("./video/MediaRecorderCapture.js");

        const capture = new MediaRecorderCapture();

        // Store reference for cancellation
        this.activeCapture = capture;

        // Set up progress event handler
        const onProgress = (progress: number): void => {
            this.eventManager.emitGraphEvent("animation-progress", {progress});
        };

        try {
            // Handle animated camera mode
            if (options.cameraMode === "animated") {
                return await this.captureAnimatedCameraVideo(options, capture, onProgress);
            }

            // Capture stationary video
            const result = await capture.captureRealtime(
                this.canvas,
                options,
                onProgress,
            );

            // Handle download if requested
            this.handleVideoDownload(result, options);

            return result;
        } finally {
            // Clear reference when done
            this.activeCapture = null;
        }
    }

    /**
     * Capture video with animated camera path
     */
    private async captureAnimatedCameraVideo(
        options: import("./video/VideoCapture.js").AnimationOptions,
        capture: import("./video/MediaRecorderCapture.js").MediaRecorderCapture,
        onProgress: (progress: number) => void,
    ): Promise<import("./video/VideoCapture.js").AnimationResult> {
        const {CameraPathAnimator} = await import("./video/CameraPathAnimator.js");

        // Validate cameraPath is provided
        if (!options.cameraPath || options.cameraPath.length < 2) {
            throw new Error("Animated camera mode requires at least 2 waypoints in cameraPath");
        }

        const camera = this.scene.activeCamera;
        if (!camera) {
            throw new Error("No active camera available for animated capture");
        }

        const fps = options.fps ?? 30;

        // Create camera path animator
        const animator = new CameraPathAnimator(camera, this.scene, {
            fps,
            duration: options.duration,
            easing: options.easing,
        });

        // Create animations from waypoints
        animator.createCameraAnimations(options.cameraPath);

        // Start recording and animation simultaneously
        const recordingPromise = capture.captureRealtime(
            this.canvas,
            options,
            onProgress,
        );

        // Start camera animation (will run concurrently with recording)
        const animationPromise = animator.startRealtimeAnimation();

        // Wait for both to complete
        // Recording duration is controlled by options.duration
        // Animation should complete around the same time
        const [result] = await Promise.all([recordingPromise, animationPromise]);

        // Handle download if requested
        this.handleVideoDownload(result, options);

        return result;
    }

    /**
     * Handle video download if requested
     */
    private handleVideoDownload(
        result: import("./video/VideoCapture.js").AnimationResult,
        options: import("./video/VideoCapture.js").AnimationOptions,
    ): void {
        if (options.download) {
            let filename = options.downloadFilename ?? `animation-${Date.now()}.webm`;

            // Auto-fix extension based on actual format when using auto-detect
            if (!options.format || options.format === "auto") {
                const correctExtension = result.metadata.format;
                // Replace any existing video extension with the correct one
                filename = filename.replace(/\.(webm|mp4)$/i, `.${correctExtension}`);
                // If no extension exists, add the correct one
                if (!/\.(webm|mp4)$/i.exec(filename)) {
                    filename += `.${correctExtension}`;
                }
            }

            const url = URL.createObjectURL(result.blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        }
    }

    /**
     * Cancel ongoing animation capture
     *
     * @returns true if a capture was cancelled, false if no capture was in progress
     *
     * @example
     * ```typescript
     * // Start a capture
     * const capturePromise = graph.captureAnimation({
     *   duration: 10000,
     *   fps: 30,
     *   cameraMode: 'stationary'
     * });
     *
     * // Cancel it after 2 seconds
     * setTimeout(() => {
     *   const wasCancelled = graph.cancelAnimationCapture();
     *   console.log('Cancelled:', wasCancelled);
     * }, 2000);
     *
     * // The promise will reject with AnimationCancelledError
     * try {
     *   await capturePromise;
     * } catch (error) {
     *   if (error.name === 'AnimationCancelledError') {
     *     console.log('Capture was cancelled');
     *   }
     * }
     * ```
     */
    cancelAnimationCapture(): boolean {
        if (!this.activeCapture) {
            return false;
        }

        const cancelled = this.activeCapture.cancel();

        // Emit cancellation event
        if (cancelled) {
            this.eventManager.emitGraphEvent("animation-cancelled", {});
        }

        return cancelled;
    }

    /**
     * Check if an animation capture is currently in progress
     */
    isAnimationCapturing(): boolean {
        return this.activeCapture?.isCapturing() ?? false;
    }

    /**
     * Estimate performance and potential issues for animation capture
     *
     * @param options - Animation options to estimate
     * @returns Promise resolving to CaptureEstimate
     *
     * @example
     * ```typescript
     * const estimate = await graph.estimateAnimationCapture({
     *   duration: 5000,
     *   fps: 60,
     *   width: 3840,
     *   height: 2160
     * });
     *
     * if (estimate.likelyToDropFrames) {
     *   console.warn(`May drop frames. Recommended: ${estimate.recommendedFps}fps`);
     * }
     * ```
     */
    async estimateAnimationCapture(options: Pick<import("./video/VideoCapture.js").AnimationOptions, "duration" | "fps" | "width" | "height">): Promise<import("./video/estimation.js").CaptureEstimate> {
        const {estimateAnimationCapture} = await import("./video/estimation.js");
        return estimateAnimationCapture(options);
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
                description: options.description ?? `Animating camera to ${resolvedState.position ? "position" : "state"}`,
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

            await new Promise<void>((resolve) => {
                let settled = false;

                const safeSettle = (): void => {
                    if (!settled) {
                        settled = true;
                        resolve();
                    }
                };

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

                            safeSettle();
                        };

                        void finalize();
                    },
                );

                // Handle cancellation via AbortSignal - just resolve (don't reject)
                // to avoid unhandled promise rejections during cleanup
                if (signal) {
                    signal.addEventListener("abort", () => {
                        // Stop the animation
                        this.scene.stopAnimation(orbitController.pivot);
                        // Resolve instead of reject to prevent unhandled rejection during cleanup
                        // The operation queue will handle the abort signal separately
                        safeSettle();
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

        await new Promise<void>((resolve) => {
            let settled = false;
            let observer: ReturnType<typeof this.scene.onBeforeRenderObservable.add> | null = null;

            const safeSettle = (): void => {
                if (!settled) {
                    settled = true;
                    // Cleanup observer
                    if (observer) {
                        this.scene.onBeforeRenderObservable.remove(observer);
                    }

                    resolve();
                }
            };

            // Create observer to update controller
            observer = this.scene.onBeforeRenderObservable.add(() => {
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

                    safeSettle();
                },
            );

            // Handle cancellation via AbortSignal - just resolve (don't reject)
            // to avoid unhandled promise rejections during cleanup
            if (signal) {
                signal.addEventListener("abort", () => {
                    // Stop the animation
                    animatable.stop();
                    // Resolve instead of reject to prevent unhandled rejection during cleanup
                    // The operation queue will handle the abort signal separately
                    safeSettle();
                }, {once: true});
            }
        });
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
     * Resolve a camera preset (built-in or user-defined) to a CameraState
     */
    resolveCameraPreset(preset: string): import("./screenshot/types.js").CameraState {
        const camera = this.scene.activeCamera;
        if (!camera) {
            throw new Error("No active camera");
        }

        const is2D = camera.mode === Camera.ORTHOGRAPHIC_CAMERA;

        // Check built-in presets first
        switch (preset) {
            case "fitToGraph":
                return calculateFitToGraph(this, camera);

            case "topView":
                return calculateTopView(this, camera);

            case "sideView":
                if (is2D) {
                    throw new ScreenshotError(
                        "sideView preset is only available for 3D cameras",
                        ScreenshotErrorCode.CAMERA_PRESET_NOT_AVAILABLE_IN_2D,
                    );
                }

                return calculateSideView(this);

            case "frontView":
                if (is2D) {
                    throw new ScreenshotError(
                        "frontView preset is only available for 3D cameras",
                        ScreenshotErrorCode.CAMERA_PRESET_NOT_AVAILABLE_IN_2D,
                    );
                }

                return calculateFrontView(this);

            case "isometric":
                if (is2D) {
                    throw new ScreenshotError(
                        "isometric preset is only available for 3D cameras",
                        ScreenshotErrorCode.CAMERA_PRESET_NOT_AVAILABLE_IN_2D,
                    );
                }

                return calculateIsometric(this);

            default: {
                // Check user-defined presets
                const userPreset = this.userCameraPresets.get(preset);
                if (!userPreset) {
                    throw new ScreenshotError(
                        `Unknown camera preset: ${preset}`,
                        ScreenshotErrorCode.CAMERA_PRESET_NOT_FOUND,
                    );
                }

                return userPreset;
            }
        }
    }

    /**
     * Save current camera state as a named preset
     */
    saveCameraPreset(name: string): void {
        if (BUILTIN_PRESETS.includes(name as typeof BUILTIN_PRESETS[number])) {
            throw new ScreenshotError(
                `Cannot overwrite built-in preset: ${name}`,
                ScreenshotErrorCode.CANNOT_OVERWRITE_BUILTIN_PRESET,
            );
        }

        const currentState = this.getCameraState();
        this.userCameraPresets.set(name, currentState);
    }

    /**
     * Load a camera preset (built-in or user-defined)
     */
    async loadCameraPreset(name: string, options?: import("./screenshot/types.js").CameraAnimationOptions): Promise<void> {
        return this.setCameraState({preset: name} as {preset: string}, options);
    }

    /**
     * Get all camera presets (built-in + user-defined)
     */
    getCameraPresets(): Record<string, import("./screenshot/types.js").CameraState | {builtin: true}> {
        const presets: Record<string, import("./screenshot/types.js").CameraState | {builtin: true}> = {};

        // Built-in presets (marked as builtin)
        for (const name of BUILTIN_PRESETS) {
            presets[name] = {builtin: true};
        }

        // User-defined presets
        for (const [name, state] of this.userCameraPresets.entries()) {
            presets[name] = state;
        }

        return presets;
    }

    /**
     * Export user-defined presets as JSON
     */
    exportCameraPresets(): Record<string, import("./screenshot/types.js").CameraState> {
        const exported: Record<string, import("./screenshot/types.js").CameraState> = {};
        for (const [name, state] of this.userCameraPresets.entries()) {
            exported[name] = state;
        }
        return exported;
    }

    /**
     * Import user-defined presets from JSON
     */
    importCameraPresets(presets: Record<string, import("./screenshot/types.js").CameraState>): void {
        for (const [name, state] of Object.entries(presets)) {
            if (BUILTIN_PRESETS.includes(name as typeof BUILTIN_PRESETS[number])) {
                console.warn(`Skipping import of built-in preset: ${name}`);
                continue;
            }

            this.userCameraPresets.set(name, state);
        }
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
