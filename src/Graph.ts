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
    PointerEventTypes,
    Quaternion,
    Scene,
    Vector3,
    WebGPUEngine,
    WebXRDefaultExperience,
} from "@babylonjs/core";

import {VoiceInputAdapter} from "./ai/input/VoiceInputAdapter";
import {ApiKeyManager} from "./ai/keys";
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
    defaultXRConfig,
    FetchEdgesFn,
    FetchNodesFn,
    StyleSchema,
    SuggestedStylesConfig,
    type ViewMode,
    type XRConfig,
} from "./config";
import {type PartialXRConfig, xrConfigSchema} from "./config/xr-config-schema";
import {Edge} from "./Edge";
import {
    EventCallbackType,
    EventType,
} from "./events";
import {AlgorithmManager, DataManager, DefaultGraphContext, EventManager, type GraphContext, type GraphContextConfig, InputManager, type InputManagerConfig, LayoutManager, LifecycleManager, type Manager, OperationQueueManager, type RecordedInputEvent, RenderManager, SelectionManager, StatsManager, StyleManager, UpdateManager} from "./managers";
import {MeshCache} from "./meshes/MeshCache";
import {PatternedLineMesh} from "./meshes/PatternedLineMesh";
import {Node, type NodeIdType} from "./Node";
import {ScreenshotCapture} from "./screenshot/ScreenshotCapture.js";
import {ScreenshotError, ScreenshotErrorCode} from "./screenshot/ScreenshotError.js";
import type {ScreenshotOptions, ScreenshotResult} from "./screenshot/types.js";
import {Styles} from "./Styles";
import {XRUIManager} from "./ui/XRUIManager";
import type {QueueableOptions, RunAlgorithmOptions} from "./utils/queue-migration";
import {XRSessionManager} from "./xr/XRSessionManager";
// import {createXrButton} from "./xr-button";

/**
 * Main orchestrator class for graph visualization and interaction.
 * Integrates Babylon.js scene management, coordinates nodes, edges, layouts, and styling.
 */
export class Graph implements GraphContext {
    styles: Styles;
    // babylon
    element: Element;
    canvas: HTMLCanvasElement;
    engine: WebGPUEngine | Engine;
    scene: Scene;
    camera: CameraManager;
    private initialCameraState?: import("./screenshot/types.js").CameraState;
    private initialCameraStateCaptured = false;
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
    private selectionManager: SelectionManager;
    operationQueue: OperationQueueManager;

    // XR managers
    private xrSessionManager: XRSessionManager | null = null;
    private xrUIManager: XRUIManager | null = null;

    // GraphContext implementation
    private graphContext: DefaultGraphContext;

    // Active video capture for cancellation support
    private activeCapture: import("./video/MediaRecorderCapture.js").MediaRecorderCapture | null = null;

    // Storage for Z positions when switching from 3D to 2D mode
    private savedZPositions = new Map<NodeIdType, number>();

    /**
     * Creates a new Graph instance and initializes the rendering engine and managers.
     * @param element - DOM element or element ID to attach the graph canvas to
     * @param useMockInput - Whether to use mock input for testing (defaults to false)
     */
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

        // Initialize SelectionManager
        this.selectionManager = new SelectionManager(this.eventManager);
        this.selectionManager.setDataManager(this.dataManager);
        this.selectionManager.setStyleManager(this.styleManager);

        // Set up background click handler for deselection
        this.setupBackgroundClickHandler();

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
            xr: defaultXRConfig,
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
            ["selection", this.selectionManager],
        ]);
        this.lifecycleManager = new LifecycleManager(
            managers,
            this.eventManager,
            ["event", "queue", "style", "stats", "render", "data", "layout", "update", "algorithm", "input", "selection"],
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

        // Listen for style-changed events to reapply styles to existing nodes/edges
        // This is specifically for AI commands that add style layers via StyleManager.addLayer()
        // Note: We use styleManager.getStyles() to get the current styles, not this.styles,
        // because this.styles may not be updated yet when the event fires
        this.eventManager.addListener("style-changed", () => {
            // Skip if the graph isn't fully initialized yet
            if (!this.initialized) {
                return;
            }

            // Get the current styles from StyleManager
            const currentStyles = this.styleManager.getStyles();

            // Recompute and apply styles to all existing nodes and edges
            for (const n of this.dataManager.nodes.values()) {
                const styleId = currentStyles.getStyleForNode(n.data);
                n.changeManager.loadCalculatedValues(currentStyles.getCalculatedStylesForNode(n.data));
                n.updateStyle(styleId);
            }

            for (const e of this.dataManager.edges.values()) {
                const styleId = currentStyles.getStyleForEdge(e.data);
                e.updateStyle(styleId);
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

    /**
     * Shuts down the graph, stopping animations and disposing all resources.
     */
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

    /**
     * Executes all algorithms specified in the style template configuration.
     */
    async runAlgorithmsFromTemplate(): Promise<void> {
        if (this.runAlgorithmsOnLoad && this.styles.config.data.algorithms) {
            await this.algorithmManager.runAlgorithmsFromTemplate(this.styles.config.data.algorithms);

            // Trigger calculated values after algorithms populate data
            for (const node of this.dataManager.nodes.values()) {
                node.changeManager.runAllCalculatedValues();
            }
        }
    }

    /**
     * Initializes the graph instance, setting up managers, styles, and rendering pipeline.
     */
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

            // Add the selection style layer (after managers are initialized)
            this.styleManager.addLayer(this.selectionManager.getSelectionStyleLayer());

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

            // Initialize XR (VR/AR) if enabled
            await this.initializeXR();

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
                // Only process settlement events if there are nodes - an empty graph
                // has nothing to settle, so we shouldn't emit events or log
                if (this.dataManager.nodes.size > 0) {
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

                        // Capture initial camera state after first settlement for resetCamera()
                        // Use setTimeout to allow zoom-to-fit to complete first
                        if (!this.initialCameraStateCaptured) {
                            this.initialCameraStateCaptured = true;
                            setTimeout(() => {
                                this.initialCameraState = this.getCameraState();
                            }, 100);
                        }
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
                }
            });
        });

        // End frame profiling (correlates operations with inter-frame time)
        this.statsManager.endFrameProfiling();
    }

    /**
     * Sets the style template for the graph, applying visual and behavioral configurations.
     * @param t - Style schema containing configuration for graph appearance and behavior
     * @param options - Optional queueing options for batch processing
     * @returns The updated Styles instance
     */
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
        // eslint-disable-next-line @typescript-eslint/no-deprecated -- Supporting backward compatibility
        const previousTwoD = this.styles.config.graph.twoD;

        // CRITICAL: Determine the target 2D mode FIRST from the template, BEFORE loading styles
        // This allows us to set up camera and metadata before any mesh operations triggered by style loading
        const templateGraph = t.graph as Record<string, unknown> | undefined;
        const viewModeExplicitlySet = templateGraph !== undefined && "viewMode" in templateGraph;
        const twoDExplicitlySet = templateGraph !== undefined && "twoD" in templateGraph;

        // Calculate target twoD and viewMode from template (before styles are loaded)
        let targetTwoD: boolean;
        let targetViewMode: ViewMode;

        if (viewModeExplicitlySet) {
            targetViewMode = (templateGraph.viewMode as ViewMode | undefined) ?? "3d";
            targetTwoD = targetViewMode === "2d";
        } else if (twoDExplicitlySet) {
            targetTwoD = (templateGraph.twoD as boolean | undefined) ?? false;
            targetViewMode = targetTwoD ? "2d" : "3d";
            if (targetTwoD !== previousTwoD) {
                console.warn(
                    "[Graph] graph.twoD is deprecated. Use graph.viewMode instead. " +
                    "twoD: true → viewMode: \"2d\", twoD: false → viewMode: \"3d\"",
                );
            }
        } else {
            // No explicit mode in template, use schema defaults (3D mode)
            // This ensures templates are idempotent - applying the same template
            // always produces the same result regardless of previous state
            targetTwoD = false;
            targetViewMode = "3d";
        }

        // CRITICAL: Set up metadata and camera FIRST, before loading styles
        // This ensures any mesh operations triggered by style loading see correct state
        this.scene.metadata = this.scene.metadata ?? {};
        this.scene.metadata.viewMode = targetViewMode;
        this.scene.metadata.twoD = targetTwoD;

        // Activate appropriate camera (must happen before style loading)
        const cameraType = targetTwoD ? "2d" : "orbit";
        this.camera.activateCamera(cameraType);

        // Now load the styles (this may trigger "style-changed" event and mesh operations)
        this.styleManager.loadStylesFromObject(t);
        this.styles = this.styleManager.getStyles();

        // Synchronize styles config with our calculated values
        // eslint-disable-next-line @typescript-eslint/no-deprecated -- Supporting backward compatibility
        this.styles.config.graph.twoD = targetTwoD;
        this.styles.config.graph.viewMode = targetViewMode;

        // Use these as current values for subsequent logic
        const currentTwoD = targetTwoD;

        // Clear mesh cache if switching between 2D and 3D modes
        // This must happen AFTER metadata and camera are set up
        const modeSwitching = previousTwoD !== currentTwoD;
        if (modeSwitching) {
            this.dataManager.meshCache.clear();

            // Save Z positions BEFORE any updates that might change them
            // (updateStyles calls node.update() which applies layout positions)
            if (currentTwoD && !previousTwoD) {
                // Switching from 3D to 2D: save current Z positions
                for (const node of this.getNodes()) {
                    this.savedZPositions.set(node.id, node.mesh.position.z);
                }
            }
        }

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
        // eslint-disable-next-line @typescript-eslint/no-deprecated -- Supporting backward compatibility
        await this.layoutManager.updateLayoutDimension(this.styles.config.graph.twoD);

        // Apply layout from template if specified
        await this.layoutManager.applyTemplateLayout(
            this.styles.config.graph.layout,
            this.styles.config.graph.layoutOptions,
        );

        // Don't run algorithms here - they should run after data is loaded

        return this.styles;
    }

    /**
     * Adds graph data from a registered data source.
     * @param type - Type/name of the registered data source
     * @param opts - Options to pass to the data source
     * @returns Promise that resolves when data is loaded
     */
    async addDataFromSource(type: string, opts: object = {}): Promise<void> {
        return this.dataManager.addDataFromSource(type, opts);
    }

    /**
     * Load graph data from a File object with auto-format detection
     * @param file - File object from file input
     * @param options - Loading options
     * @param options.format - Explicit format override (e.g., "graphml", "json")
     * @param options.nodeIdPath - JMESPath for node ID extraction
     * @param options.edgeSrcIdPath - JMESPath for edge source ID extraction
     * @param options.edgeDstIdPath - JMESPath for edge destination ID extraction
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
     * @remarks
     * This method attempts to detect the format from the URL extension first.
     * If the extension is not recognized (e.g., `.txt`), it fetches the content
     * and uses content-based detection. The content is then passed directly to
     * the data source to avoid a double-fetch.
     * @param url - URL to fetch graph data from
     * @param options - Loading options
     * @param options.format - Explicit format override (e.g., "graphml", "json")
     * @param options.nodeIdPath - JMESPath for node ID extraction
     * @param options.edgeSrcIdPath - JMESPath for edge source ID extraction
     * @param options.edgeDstIdPath - JMESPath for edge destination ID extraction
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

        // Merge graph config with explicit options (explicit options take precedence)
        const mergedOptions = {
            nodeIdPath: options?.nodeIdPath ?? this.styles.config.data.knownFields.nodeIdPath,
            edgeSrcIdPath: options?.edgeSrcIdPath ?? this.styles.config.data.knownFields.edgeSrcIdPath,
            edgeDstIdPath: options?.edgeDstIdPath ?? this.styles.config.data.knownFields.edgeDstIdPath,
        };

        // If we already fetched content for detection, pass it as data to avoid double-fetch
        // Otherwise pass URL and let DataSource handle the fetch
        if (fetchedContent !== undefined) {
            await this.addDataFromSource(format, {
                data: fetchedContent,
                ... mergedOptions,
            });
        } else {
            await this.addDataFromSource(format, {
                url,
                ... mergedOptions,
            });
        }
    }

    /**
     * Add a single node to the graph.
     * @param node - Node data object to add
     * @param idPath - Key to use for node ID (default: "id")
     * @param options - Queue options for operation ordering
     */
    async addNode(node: AdHocData, idPath?: string, options?: QueueableOptions): Promise<void> {
        await this.addNodes([node], idPath, options);
    }

    /**
     * Add nodes to the graph incrementally.
     * @remarks
     * This method ADDS nodes to the existing graph without removing existing nodes.
     * For complete replacement, use the `nodeData` property on the web component instead.
     *
     * Nodes are added to the current layout and will animate into position if
     * a force-directed layout is active.
     * @param nodes - Array of node data objects to add
     * @param idPath - Key to use for node IDs (default: "id")
     * @param options - Queue options for operation ordering
     * @returns Promise that resolves when nodes are added
     * @since 1.0.0
     * @see {@link addEdges} for adding edges
     * @see {@link https://graphty-org.github.io/graphty-element/storybook/?path=/story/data--default | Data Loading Examples}
     * @example
     * ```typescript
     * // Add nodes with default ID field
     * await graph.addNodes([
     *   { id: 'node-1', label: 'First Node', category: 'A' },
     *   { id: 'node-2', label: 'Second Node', category: 'B' }
     * ]);
     *
     * // Add nodes with custom ID field
     * await graph.addNodes(
     *   [{ nodeId: 'n1', name: 'Node One' }],
     *   'nodeId'
     * );
     *
     * // Wait for layout to settle after adding
     * await graph.addNodes(newNodes);
     * await graph.waitForSettled();
     * graph.zoomToFit();
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

    /**
     * Add a single edge to the graph.
     * @param edge - Edge data object to add
     * @param srcIdPath - Key to use for edge source ID (default: "source")
     * @param dstIdPath - Key to use for edge destination ID (default: "target")
     * @param options - Queue options for operation ordering
     */
    async addEdge(edge: AdHocData, srcIdPath?: string, dstIdPath?: string, options?: QueueableOptions): Promise<void> {
        await this.addEdges([edge], srcIdPath, dstIdPath, options);
    }

    /**
     * Add edges to the graph incrementally.
     * @remarks
     * This method ADDS edges to the existing graph without removing existing edges.
     * Source and target nodes should exist before adding edges, otherwise the edges
     * will reference non-existent nodes.
     *
     * Edges connect nodes and can optionally store additional data accessible
     * via `edge.data`.
     * @param edges - Array of edge data objects to add
     * @param srcIdPath - Path to source node ID in edge data (default: "source")
     * @param dstIdPath - Path to target node ID in edge data (default: "target")
     * @param options - Queue options for operation ordering
     * @returns Promise that resolves when edges are added
     * @since 1.0.0
     * @see {@link addNodes} for adding nodes first
     * @see {@link https://graphty-org.github.io/graphty-element/storybook/?path=/story/data--default | Data Loading Examples}
     * @example
     * ```typescript
     * // Add edges with default source/target fields
     * await graph.addEdges([
     *   { source: 'node-1', target: 'node-2', weight: 1.5 },
     *   { source: 'node-2', target: 'node-3', weight: 2.0 }
     * ]);
     *
     * // Add edges with custom field names
     * await graph.addEdges(
     *   [{ from: 'a', to: 'b', label: 'connects' }],
     *   'from',
     *   'to'
     * );
     *
     * // Add nodes and edges together
     * await graph.addNodes([{id: 'a'}, {id: 'b'}]);
     * await graph.addEdges([{source: 'a', target: 'b'}]);
     * ```
     */
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

    /**
     * Set the layout algorithm and configuration.
     * @remarks
     * Available layouts:
     * - `ngraph`: Force-directed (3D optimized, recommended for general use)
     * - `d3-force`: Force-directed (2D, web standard)
     * - `circular`: Nodes arranged in a circle
     * - `grid`: Nodes arranged in a grid
     * - `hierarchical`: Tree/DAG layout
     * - `random`: Random positions (useful for testing)
     * - `fixed`: Use pre-defined positions from node data
     *
     * Layout changes are queued and execute in order. The layout will
     * animate nodes from their current positions to new positions.
     * @param type - Layout algorithm name
     * @param opts - Layout-specific configuration options
     * @param options - Options for operation queue behavior
     * @returns Promise that resolves when layout is initialized
     * @since 1.0.0
     * @see {@link waitForSettled} to wait for layout completion
     * @see {@link https://graphty-org.github.io/graphty-element/storybook/?path=/story/layout--default | 3D Layout Examples}
     * @see {@link https://graphty-org.github.io/graphty-element/storybook/?path=/story/layout2d--default | 2D Layout Examples}
     * @example
     * ```typescript
     * // Use force-directed layout with custom settings
     * await graph.setLayout('ngraph', {
     *   springLength: 100,
     *   springCoefficient: 0.0008,
     *   gravity: -1.2,
     *   dimensions: 3
     * });
     *
     * // Wait for layout to settle then zoom to fit
     * await graph.waitForSettled();
     * graph.zoomToFit();
     *
     * // Switch to circular layout
     * await graph.setLayout('circular', { radius: 5 });
     * ```
     */
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

    /**
     * Run a graph algorithm and store results on nodes/edges.
     * @remarks
     * Algorithms are identified by namespace and type (e.g., `graphty:degree`).
     * Results are stored on each node's `algorithmResults` property and can be
     * accessed in style selectors.
     *
     * Available algorithms by category:
     * - **Centrality**: degree, betweenness, closeness, pagerank, eigenvector
     * - **Community**: louvain, label-propagation, leiden
     * - **Components**: connected-components, strongly-connected
     * - **Traversal**: bfs, dfs
     * - **Shortest Path**: dijkstra, bellman-ford
     * - **Spanning Tree**: prim, kruskal
     * - **Flow**: max-flow, min-cut
     * @param namespace - Algorithm namespace (e.g., "graphty")
     * @param type - Algorithm type (e.g., "degree", "pagerank")
     * @param options - Algorithm options and queue settings
     * @returns Promise that resolves when algorithm completes
     * @since 1.0.0
     * @see {@link applySuggestedStyles} to visualize results
     * @see {@link https://graphty-org.github.io/graphty-element/storybook/?path=/story/algorithms-centrality--degree | Centrality Examples}
     * @see {@link https://graphty-org.github.io/graphty-element/storybook/?path=/story/algorithms-community--louvain | Community Detection}
     * @example
     * ```typescript
     * // Run degree centrality
     * await graph.runAlgorithm('graphty', 'degree');
     *
     * // Access results
     * const node = graph.getNode('node-1');
     * console.log('Degree:', node.algorithmResults['graphty:degree']);
     *
     * // Run with auto-styling
     * await graph.runAlgorithm('graphty', 'pagerank', {
     *   algorithmOptions: { damping: 0.85 },
     *   applySuggestedStyles: true
     * });
     *
     * // Use results in style selectors
     * styleManager.addLayer({
     *   selector: "[?algorithmResults.'graphty:degree' > `10`]",
     *   styles: { node: { color: '#ff0000', size: 2.0 } }
     * });
     * ```
     */
    async runAlgorithm(namespace: string, type: string, options?: RunAlgorithmOptions): Promise<void> {
        if (options?.skipQueue) {
            await this.algorithmManager.runAlgorithm(namespace, type, options.algorithmOptions);

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

                await this.algorithmManager.runAlgorithm(namespace, type, options?.algorithmOptions);
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
     * @param suggestedStyles - Configuration containing style layers to apply
     * @param algorithmKey - Unique identifier for the algorithm providing these styles
     * @param options - Options controlling how styles are applied
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

    /**
     * Remove nodes from the graph by their IDs.
     * @param nodeIds - Array of node IDs to remove
     * @param options - Queue options for operation ordering
     */
    async removeNodes(nodeIds: (string | number)[], options?: QueueableOptions): Promise<void> {
        const removeNodeWithSelectionCheck = (id: string | number): void => {
            // Check if the node being removed is selected
            const node = this.dataManager.getNode(id);
            if (node) {
                this.selectionManager.onNodeRemoved(node);
            }

            this.dataManager.removeNode(id);
        };

        if (options?.skipQueue) {
            nodeIds.forEach((id) => {
                removeNodeWithSelectionCheck(id);
            });
            return;
        }

        await this.operationQueue.queueOperationAsync(
            "data-remove",
            (context) => {
                if (context.signal.aborted) {
                    throw new Error("Operation cancelled");
                }

                nodeIds.forEach((id) => {
                    removeNodeWithSelectionCheck(id);
                });
            },
            {
                description: `Removing ${nodeIds.length} nodes`,
                ... options,
            },
        );
    }

    /**
     * Update node data for existing nodes in the graph.
     * @param updates - Array of update objects containing node ID and properties to update
     * @param options - Queue options for operation ordering
     */
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

    /**
     * Set the active camera mode (e.g., "arcRotate", "universal").
     * @param mode - Camera mode key to activate
     * @param options - Queue options for operation ordering
     */
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

    /**
     * Update rendering settings for the graph visualization.
     * @param settings - Object containing rendering configuration options
     * @param options - Queue options for operation ordering
     */
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
     * @param fn - Function containing operations to batch
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

    /**
     * Get the total number of nodes in the graph.
     * @returns The number of nodes
     */
    getNodeCount(): number {
        return this.dataManager.nodes.size;
    }

    /**
     * Get the total number of edges in the graph.
     * @returns The number of edges
     */
    getEdgeCount(): number {
        return this.dataManager.edges.size;
    }

    /**
     * Alias for addEventListener
     * @param type - Event type to listen for
     * @param cb - Callback function to execute when event fires
     */
    on(type: EventType, cb: EventCallbackType): void {
        this.addListener(type, cb);
    }

    /**
     * Add an event listener for graph events.
     * @param type - Event type to listen for
     * @param cb - Callback function to execute when event fires
     */
    addListener(type: EventType, cb: EventCallbackType): void {
        // Delegate to EventManager
        this.eventManager.addListener(type, cb);
    }

    /**
     * Get the total number of registered event listeners.
     * Useful for debugging and testing to ensure listeners are properly cleaned up.
     * @returns The number of registered listeners
     */
    listenerCount(): number {
        return this.eventManager.listenerCount();
    }

    /**
     * Zoom the camera to fit all nodes in view.
     * @remarks
     * This operation executes immediately and does not go through the
     * operation queue. It may race with queued camera updates.
     *
     * For better coordination, consider using batchOperations.
     * @since 1.0.0
     * @see {@link waitForSettled} to wait for layout before zooming
     * @see {@link setCameraState} for manual camera control
     * @example
     * ```typescript
     * // Zoom to fit after data loads
     * await graph.addNodes(nodes);
     * await graph.waitForSettled();
     * graph.zoomToFit();
     *
     * // Zoom to fit within batch operations
     * await graph.batchOperations(async () => {
     *     await graph.setStyleTemplate({graph: {twoD: true}});
     *     graph.zoomToFit(); // Will execute after style change
     * });
     * ```
     */
    zoomToFit(): void {
        this.updateManager.enableZoomToFit();
    }

    // GraphContext implementation methods

    /**
     * Get the Styles instance for the graph.
     * @returns The Styles instance
     */
    getStyles(): Styles {
        return this.styles;
    }

    /**
     * Get the StyleManager instance.
     * @returns The StyleManager instance
     */
    getStyleManager(): StyleManager {
        return this.styleManager;
    }

    /**
     * Get the DataManager instance.
     * @returns The DataManager instance
     */
    getDataManager(): DataManager {
        return this.dataManager;
    }

    /**
     * Get the LayoutManager instance.
     * @returns The LayoutManager instance
     */
    getLayoutManager(): LayoutManager {
        return this.layoutManager;
    }

    /**
     * Get the UpdateManager instance.
     * @returns The UpdateManager instance
     */
    getUpdateManager(): UpdateManager {
        return this.updateManager;
    }

    /**
     * Get the MeshCache instance used for mesh instancing.
     * @returns The MeshCache instance
     */
    getMeshCache(): MeshCache {
        return this.dataManager.meshCache;
    }

    /**
     * Get the Babylon.js Scene instance.
     * @returns The Scene instance
     */
    getScene(): Scene {
        return this.scene;
    }

    /**
     * Get the StatsManager instance for performance metrics.
     * @returns The StatsManager instance
     */
    getStatsManager(): StatsManager {
        return this.statsManager;
    }

    /**
     * Get the SelectionManager instance for handling node selection.
     * @returns The SelectionManager instance
     */
    getSelectionManager(): SelectionManager {
        return this.selectionManager;
    }

    /**
     * Get the EventManager instance for event handling.
     * @returns The EventManager instance
     */
    getEventManager(): EventManager {
        return this.eventManager;
    }

    // ============================================================================
    // SELECTION API
    // ============================================================================

    /**
     * Get the currently selected node.
     * @returns The selected node, or null if nothing is selected.
     */
    getSelectedNode(): Node | null {
        return this.selectionManager.getSelectedNode();
    }

    /**
     * Select a node by its ID.
     * @remarks
     * Selection triggers a `selection-changed` event and applies selection styles
     * (defined in the style template). Only one node can be selected at a time;
     * calling this method will deselect any previously selected node.
     *
     * Selection is often used to:
     * - Show a details panel with node information
     * - Highlight the node and its connections
     * - Enable context-specific actions
     * @param nodeId - The ID of the node to select
     * @returns True if the node was found and selected, false if not found
     * @since 1.0.0
     * @see {@link deselectNode} to clear selection
     * @see {@link getSelectedNode} to get current selection
     * @see {@link https://graphty-org.github.io/graphty-element/storybook/?path=/story/selection--default | Selection Examples}
     * @example
     * ```typescript
     * // Select a node and show its details
     * if (graph.selectNode('node-123')) {
     *   const node = graph.getSelectedNode();
     *   console.log('Selected:', node.data);
     *   showDetailsPanel(node);
     * }
     *
     * // Handle click events for selection
     * graph.on('node-click', ({ node }) => {
     *   graph.selectNode(node.id);
     * });
     * ```
     */
    selectNode(nodeId: string | number): boolean {
        return this.selectionManager.selectById(nodeId);
    }

    /**
     * Deselect the currently selected node.
     * @remarks
     * Clears the current selection and triggers a `selection-changed` event.
     * If no node is selected, this is a no-op.
     * @since 1.0.0
     * @see {@link selectNode} to select a node
     * @see {@link getSelectedNode} to check current selection
     * @example
     * ```typescript
     * // Clear selection programmatically
     * graph.selectNode("node-123");
     * graph.deselectNode();
     * console.log(graph.getSelectedNode()); // null
     *
     * // Clear selection on escape key
     * document.addEventListener('keydown', (e) => {
     *   if (e.key === 'Escape') {
     *     graph.deselectNode();
     *   }
     * });
     * ```
     */
    deselectNode(): void {
        this.selectionManager.deselect();
    }

    /**
     * Check if a specific node is currently selected.
     * @param nodeId - The ID of the node to check.
     * @returns True if the node is selected, false otherwise.
     */
    isNodeSelected(nodeId: string | number): boolean {
        const selectedNode = this.selectionManager.getSelectedNode();
        return selectedNode !== null && selectedNode.id === nodeId;
    }

    /**
     * Set up a scene pointer observer to handle background clicks for deselection.
     * When the user clicks on an area with no node, the current selection is cleared.
     */
    private setupBackgroundClickHandler(): void {
        // Track click state to distinguish from drags
        let clickStartTime = 0;
        let clickStartPos = {x: 0, y: 0};
        const CLICK_MAX_DURATION_MS = 300;
        const CLICK_MAX_MOVEMENT_PX = 5;

        this.scene.onPrePointerObservable.add((pointerInfo) => {
            // Skip in XR mode - XR has its own input handling
            const xrHelper = this.scene.metadata?.xrHelper;
            if (xrHelper?.baseExperience?.state === 2) { // WebXRState.IN_XR
                return;
            }

            if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
                clickStartTime = Date.now();
                clickStartPos = {
                    x: this.scene.pointerX,
                    y: this.scene.pointerY,
                };
            } else if (pointerInfo.type === PointerEventTypes.POINTERUP) {
                // Check if this was a click (short duration, minimal movement)
                const duration = Date.now() - clickStartTime;
                const dx = this.scene.pointerX - clickStartPos.x;
                const dy = this.scene.pointerY - clickStartPos.y;
                const distance = Math.sqrt((dx * dx) + (dy * dy));

                if (duration < CLICK_MAX_DURATION_MS && distance < CLICK_MAX_MOVEMENT_PX) {
                    // This was a click - check if we hit anything
                    const pickResult = this.scene.pick(this.scene.pointerX, this.scene.pointerY);

                    // If we didn't hit anything or hit something without a nodeId, deselect
                    if (!pickResult.hit || !pickResult.pickedMesh?.metadata?.nodeId) {
                        this.selectionManager.deselect();
                    }
                }
            }
        });
    }

    /**
     * Check if the graph is in 2D mode (deprecated - use getViewMode instead).
     * @returns True if in 2D mode, false otherwise
     * @deprecated Use getViewMode() === "2d" instead
     */
    is2D(): boolean {
        // eslint-disable-next-line @typescript-eslint/no-deprecated -- Supporting backward compatibility
        return this.styles.config.graph.twoD;
    }

    /**
     * Get the current view mode.
     * Returns the viewMode from config (always set due to default value).
     * @returns The current view mode ("2d", "3d", "ar", or "vr")
     */
    getViewMode(): ViewMode {
        return this.styles.config.graph.viewMode;
    }

    /**
     * Set the view mode.
     * This controls the camera type, input handling, and rendering approach.
     * @param mode - The view mode to set: "2d", "3d", "ar", or "vr"
     * @param options - Optional queueing options
     * @returns Promise that resolves when view mode is set
     * @example
     * ```typescript
     * // Switch to 2D orthographic view
     * await graph.setViewMode("2d");
     *
     * // Switch to VR mode
     * await graph.setViewMode("vr");
     * ```
     */
    async setViewMode(mode: ViewMode, options?: QueueableOptions): Promise<void> {
        return this.operationQueue.queueOperationAsync(
            "camera-update",
            async(context) => {
                if (context.signal.aborted) {
                    throw new Error("Operation cancelled");
                }

                await this._setViewModeInternal(mode);
            },
            {
                description: `Setting view mode to ${mode}`,
                ... options,
            },
        );
    }

    /**
     * Internal method for setting view mode - bypasses queue
     * Used by operations that are already queued
     * @param mode - The view mode to set
     */
    private async _setViewModeInternal(mode: ViewMode): Promise<void> {
        const previousMode = this.getViewMode();

        // Skip if no change
        if (previousMode === mode) {
            return;
        }

        // Update the config
        this.styles.config.graph.viewMode = mode;

        // Sync twoD for backward compatibility
        const isTwoD = mode === "2d";
        // eslint-disable-next-line @typescript-eslint/no-deprecated -- Supporting backward compatibility
        const previousTwoD = this.styles.config.graph.twoD;
        // eslint-disable-next-line @typescript-eslint/no-deprecated -- Supporting backward compatibility
        this.styles.config.graph.twoD = isTwoD;

        // Handle mode switching
        const modeSwitchingBetween2D3D = previousTwoD !== isTwoD;

        if (modeSwitchingBetween2D3D) {
            // Clear mesh cache if switching between 2D and 3D modes
            this.dataManager.meshCache.clear();

            // Update scene metadata for 2D mode detection
            this.scene.metadata = this.scene.metadata ?? {};
            this.scene.metadata.twoD = isTwoD;
            this.scene.metadata.viewMode = mode;

            // Activate camera BEFORE mesh recreation so that is2DMode() checks
            // in EdgeMesh.create() work correctly (camera.mode must be ORTHOGRAPHIC for 2D)
            const cameraType: CameraKey = isTwoD ? "2d" : "orbit";
            this.camera.activateCamera(cameraType);

            // Reset flag so initial camera state gets re-captured after layout settles
            this.initialCameraStateCaptured = false;

            // Force all nodes to recreate their meshes (they were disposed when cache was cleared)
            // updateStyle() will detect the disposed mesh and create a new one
            for (const node of this.getNodes()) {
                node.updateStyle(node.styleId);
            }

            // Force all edges to recreate their meshes
            // Note: Edge meshes from Simple2DLineRenderer are NOT tracked by MeshCache,
            // so we must explicitly dispose them before calling updateStyle()
            for (const edge of this.dataManager.edges.values()) {
                // Dispose edge mesh if not already disposed (handles non-cached meshes like Simple2DLineRenderer)
                if (edge.mesh instanceof PatternedLineMesh) {
                    edge.mesh.dispose();
                } else if (!edge.mesh.isDisposed()) {
                    edge.mesh.dispose();
                }

                // Dispose arrow meshes too
                if (edge.arrowMesh && !edge.arrowMesh.isDisposed()) {
                    edge.arrowMesh.dispose();
                }

                if (edge.arrowTailMesh && !edge.arrowTailMesh.isDisposed()) {
                    edge.arrowTailMesh.dispose();
                }

                edge.updateStyle(edge.styleId);
            }

            // Save Z positions before any layout changes (3D→2D only)
            // We save here to capture the true 3D positions before layout is recreated
            if (isTwoD && !previousTwoD) {
                // Switching from 3D to 2D: save current Z positions
                for (const node of this.getNodes()) {
                    this.savedZPositions.set(node.id, node.mesh.position.z);
                }
            }
        }

        // Update scene metadata for any mode change
        this.scene.metadata = this.scene.metadata ?? {};
        this.scene.metadata.viewMode = mode;

        // Handle XR modes (ar/vr)
        if (mode === "ar" || mode === "vr") {
            // For AR/VR, we need to initialize XR session
            if (!this.xrSessionManager) {
                // XR not available
                console.warn(`[Graph] Cannot switch to ${mode} mode: XR session manager not initialized`);
                // Fall back to 3D mode
                this.styles.config.graph.viewMode = "3d";
                this.scene.metadata.viewMode = "3d";
                return;
            }

            try {
                // Enter XR mode
                await this.enterXR(mode === "vr" ? "immersive-vr" : "immersive-ar");
            } catch (error) {
                console.warn(`[Graph] Failed to enter ${mode} mode:`, error);
                // Fall back to 3D mode
                this.styles.config.graph.viewMode = "3d";
                this.scene.metadata.viewMode = "3d";
            }
        } else if (previousMode === "ar" || previousMode === "vr") {
            // Exiting XR mode - return to 3D or 2D
            try {
                await this.exitXR();
            } catch (error) {
                console.warn("[Graph] Failed to exit XR mode:", error);
            }
        }

        // Activate appropriate camera based on mode
        if (mode !== "ar" && mode !== "vr") {
            // For 2D/3D, activate the appropriate camera
            const cameraType: CameraKey = mode === "2d" ? "2d" : "orbit";
            this.camera.activateCamera(cameraType);
        }

        // Update layout dimension if needed
        await this.layoutManager.updateLayoutDimension(isTwoD);

        // After mode switch, force a full update cycle to ensure:
        // 1. Nodes get their positions from the new layout engine
        // 2. Edges are transformed to connect to the new node positions
        // This is necessary because updateLayoutDimension() may have created a new layout engine
        // with different positions, but node/edge meshes haven't been updated yet.
        if (modeSwitchingBetween2D3D) {
            // Step the layout to ensure positions are computed
            this.layoutManager.step();

            // Update all nodes with positions from the new layout
            for (const node of this.getNodes()) {
                node.update();
            }

            // Update rays and all edges to connect to the updated node positions
            Edge.updateRays(this);
            for (const edge of this.dataManager.edges.values()) {
                edge.update();
            }

            // Handle Z-coordinate flattening/restoration AFTER layout positions are applied
            // This ensures we override the layout engine's Z values with our saved/flattened values
            if (isTwoD) {
                // 3D→2D: flatten Z to 0 (positions were saved earlier)
                for (const node of this.getNodes()) {
                    node.mesh.position.z = 0;
                }
            } else {
                // 2D→3D: restore saved Z positions
                for (const node of this.getNodes()) {
                    const savedZ = this.savedZPositions.get(node.id);
                    if (savedZ !== undefined) {
                        node.mesh.position.z = savedZ;
                    }
                }
                this.savedZPositions.clear();
            }
        }

        // Request zoom to fit when mode changes
        this.updateManager.enableZoomToFit();
    }

    /**
     * Check if ray updates are needed for edge arrows.
     * @returns True if rays need updating
     */
    needsRayUpdate(): boolean {
        return this.needRays;
    }

    /**
     * Get the current graph context configuration.
     * @returns The graph context configuration
     */
    getConfig(): GraphContextConfig {
        return {
            pinOnDrag: this.pinOnDrag,
            enableDetailedProfiling: this.enableDetailedProfiling,
            xr: this.graphContext.getConfig().xr,
        };
    }

    /**
     * Check if the layout engine is currently running.
     * @returns True if layout is running
     */
    isRunning(): boolean {
        return this.layoutManager.running;
    }

    /**
     * Set whether the layout engine should run.
     * @param running - True to start the layout, false to stop it
     */
    setRunning(running: boolean): void {
        this.layoutManager.running = running;
    }

    /**
     * Get the current XR configuration.
     * @returns The XR configuration if set
     */
    getXRConfig(): XRConfig | undefined {
        return this.graphContext.getConfig().xr;
    }

    /**
     * Set XR configuration.
     * Merges with defaults and updates the graph context.
     * @param config - Partial XR configuration to apply
     */
    setXRConfig(config: PartialXRConfig): void {
        // Parse through zod schema to apply defaults
        const fullConfig = xrConfigSchema.parse(config);
        this.graphContext.updateConfig({xr: fullConfig});
    }

    /**
     * Get the XR session manager instance.
     * @returns The XR session manager if XR is initialized
     */
    getXRSessionManager(): XRSessionManager | undefined {
        return this.xrSessionManager ?? undefined;
    }

    /**
     * Check if VR mode is supported on this device/browser.
     * Returns true if WebXR is available and VR sessions are supported.
     * @returns Promise resolving to true if VR is supported
     * @example
     * ```typescript
     * const vrSupported = await graph.isVRSupported();
     * if (!vrSupported) {
     *   console.log("VR not available on this device");
     * }
     * ```
     */
    async isVRSupported(): Promise<boolean> {
        if (!this.xrSessionManager) {
            return false;
        }

        return this.xrSessionManager.isVRSupported();
    }

    /**
     * Check if AR mode is supported on this device/browser.
     * Returns true if WebXR is available and AR sessions are supported.
     * @returns Promise resolving to true if AR is supported
     * @example
     * ```typescript
     * const arSupported = await graph.isARSupported();
     * if (!arSupported) {
     *   console.log("AR not available on this device");
     * }
     * ```
     */
    async isARSupported(): Promise<boolean> {
        if (!this.xrSessionManager) {
            return false;
        }

        return this.xrSessionManager.isARSupported();
    }

    // Input manager access
    /**
     * Get the input manager
     * @returns The input manager instance
     */
    get input(): InputManager {
        return this.inputManager;
    }

    /**
     * Enable or disable input
     * @param enabled - True to enable input, false to disable
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
     * @returns Array of recorded input events
     */
    stopInputRecording(): RecordedInputEvent[] {
        return this.inputManager.stopRecording();
    }

    /**
     * Convert 3D world coordinates to 2D screen coordinates.
     * @param worldPos - World position to convert
     * @param worldPos.x - X coordinate in world space
     * @param worldPos.y - Y coordinate in world space
     * @param worldPos.z - Z coordinate in world space
     * @returns Screen coordinates {x, y}
     */
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

    /**
     * Convert 2D screen coordinates to 3D world coordinates via raycasting.
     * @param screenPos - Screen position to convert
     * @param screenPos.x - X coordinate in screen space
     * @param screenPos.y - Y coordinate in screen space
     * @returns World coordinates {x, y, z} or null if no intersection
     */
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

    /**
     * Get the active camera controller.
     * @returns The active camera controller or null if none active
     */
    getCameraController(): CameraController | null {
        return this.camera.getActiveController();
    }

    /**
     * Get the Babylon.js mesh for a node by its ID.
     * @param nodeId - ID of the node
     * @returns The node's mesh or null if not found
     */
    getNodeMesh(nodeId: string): AbstractMesh | null {
        const node = this.dataManager.nodes.get(nodeId);
        return node?.mesh ?? null;
    }

    /**
     * Wait for the graph operations to complete and layout to stabilize.
     * @remarks
     * This method waits for all queued operations (data loading, layout changes,
     * algorithm execution) to complete. Use this before taking screenshots,
     * exporting data, or performing actions that require the graph to be stable.
     *
     * The method returns when:
     * - All queued operations have completed
     * - The operation queue is empty
     * @returns Promise that resolves when all operations are complete
     * @since 1.0.0
     * @see {@link zoomToFit} to zoom after settling
     * @see {@link captureScreenshot} for capturing stable views
     * @example
     * ```typescript
     * // Wait for layout to settle before zooming
     * await graph.addNodes(nodes);
     * await graph.addEdges(edges);
     * await graph.waitForSettled();
     * graph.zoomToFit();
     *
     * // Wait before taking a screenshot
     * await graph.setLayout('circular');
     * await graph.waitForSettled();
     * const screenshot = await graph.captureScreenshot();
     *
     * // Chain operations with settle
     * await graph.runAlgorithm('graphty', 'pagerank');
     * await graph.waitForSettled();
     * console.log('Algorithm complete, results available');
     * ```
     */
    async waitForSettled(): Promise<void> {
        // Wait for operation queue to complete all operations
        await this.operationQueue.waitForCompletion();
    }

    /**
     * Capture a screenshot of the current graph visualization.
     * @param options - Screenshot options (format, resolution, destinations, etc.)
     * @returns Promise resolving to ScreenshotResult with blob and metadata
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
     * @param options - Screenshot options to validate
     * @returns Promise<CapabilityCheck> - Result indicating whether screenshot is supported
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
     * @param options - Animation capture options
     * @returns Promise resolving to AnimationResult with blob and metadata
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
     * @param options - Animation configuration options
     * @param capture - Media recorder capture instance
     * @param onProgress - Progress callback function
     * @returns Promise resolving to animation result with video blob
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
     * @param result - Animation result containing the video blob
     * @param options - Animation options including download settings
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
     * @returns true if a capture was cancelled, false if no capture was in progress
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
     * @returns True if currently capturing an animation
     */
    isAnimationCapturing(): boolean {
        return this.activeCapture?.isCapturing() ?? false;
    }

    /**
     * Estimate performance and potential issues for animation capture
     * @param options - Animation options to estimate
     * @returns Promise resolving to CaptureEstimate
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
     * @returns Camera state including position, target, and rotation
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
                pivot: {
                    position: Vector3;
                    rotation: Vector3;
                    rotationQuaternion: Quaternion | null;
                    computeWorldMatrix: (force: boolean) => void;
                };
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
            // PivotController uses rotationQuaternion, so convert to Euler for storage
            if (orbitController.pivot.rotationQuaternion) {
                const euler = orbitController.pivot.rotationQuaternion.toEulerAngles();
                state.pivotRotation = {
                    x: euler.x,
                    y: euler.y,
                    z: euler.z,
                };
            } else {
                state.pivotRotation = {
                    x: orbitController.pivot.rotation.x,
                    y: orbitController.pivot.rotation.y,
                    z: orbitController.pivot.rotation.z,
                };
            }

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
     * @param state - Camera state or preset name to apply
     * @param options - Optional animation configuration
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
     * @param state - Camera state to apply
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
                pivot: {
                    position: Vector3;
                    rotation: Vector3;
                    rotationQuaternion: Quaternion | null;
                    computeWorldMatrix: (force: boolean) => void;
                };
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
            // Must use rotationQuaternion because PivotController initializes with quaternion
            // In Babylon.js, when rotationQuaternion is set (not null), it takes precedence over Euler rotation
            if (state.pivotRotation) {
                // Convert Euler angles to quaternion
                const quat = Quaternion.RotationYawPitchRoll(
                    state.pivotRotation.y, // yaw
                    state.pivotRotation.x, // pitch
                    state.pivotRotation.z, // roll
                );
                orbitController.pivot.rotationQuaternion = quat;
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

                // Convert Euler angles to quaternion
                const quat = Quaternion.RotationYawPitchRoll(yaw, pitch, 0);
                orbitController.pivot.rotationQuaternion = quat;
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
     * @param animation - Babylon.js animation to apply easing to
     * @param easing - Easing function name (linear, easeIn, easeOut, easeInOut)
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
     * @param orbitController - Orbit camera controller instance
     * @param orbitController.cameraDistance - Current camera distance from pivot
     * @param orbitController.updateCameraPosition - Function to update camera position
     * @param targetDistance - Target camera distance to animate to
     * @param frameCount - Number of frames for the animation
     * @param fps - Frames per second for the animation
     * @param easing - Optional easing function name
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
     * @param targetState - Target camera state to animate to
     * @param options - Animation configuration options
     * @param signal - Optional abort signal to cancel animation
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
     * @param targetState - Target camera state to animate to
     * @param options - Animation configuration options
     * @param signal - Optional abort signal to cancel animation
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
     * @param position - Camera position coordinates
     * @param position.x - X coordinate
     * @param position.y - Y coordinate
     * @param position.z - Z coordinate
     * @param options - Optional animation configuration
     * @returns Promise that resolves when camera position is set
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
     * @param target - Camera target coordinates
     * @param target.x - X coordinate
     * @param target.y - Y coordinate
     * @param target.z - Z coordinate
     * @param options - Optional animation configuration
     * @returns Promise that resolves when camera target is set
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
     * @param zoom - Zoom level (1.0 = default, >1 = zoomed in, <1 = zoomed out)
     * @param options - Optional animation configuration
     * @returns Promise that resolves when zoom is set
     */
    async setCameraZoom(
        zoom: number,
        options?: import("./screenshot/types.js").CameraAnimationOptions,
    ): Promise<void> {
        return this.setCameraState({zoom}, options);
    }

    /**
     * Set camera pan (2D)
     * @param pan - Pan offset coordinates
     * @param pan.x - X offset
     * @param pan.y - Y offset
     * @param options - Optional animation configuration
     * @returns Promise that resolves when pan is set
     */
    async setCameraPan(
        pan: {x: number, y: number},
        options?: import("./screenshot/types.js").CameraAnimationOptions,
    ): Promise<void> {
        return this.setCameraState({pan}, options);
    }

    /**
     * Reset camera to default state
     * @param options - Optional animation configuration
     * @returns Promise that resolves when camera is reset
     */
    async resetCamera(options?: import("./screenshot/types.js").CameraAnimationOptions): Promise<void> {
        // Get default camera state from current controller
        const defaultState = this.getDefaultCameraState();
        return this.setCameraState(defaultState, options);
    }

    /**
     * Get default camera state for current camera type
     * Lazily captures the initial state on first use, or returns captured state
     * @returns The default camera state
     */
    private getDefaultCameraState(): import("./screenshot/types.js").CameraState {
        // If we haven't captured initial state yet, capture it now
        // This happens on the first call to resetCamera()
        this.initialCameraState ??= this.getCameraState();

        return this.initialCameraState;
    }

    /**
     * Resolve a camera preset (built-in or user-defined) to a CameraState
     * @param preset - Name of the preset to resolve
     * @returns The resolved camera state
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
     * @param name - Name for the camera preset
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
     * @param name - Name of the preset to load
     * @param options - Optional animation configuration
     * @returns Promise that resolves when camera state is applied
     */
    async loadCameraPreset(name: string, options?: import("./screenshot/types.js").CameraAnimationOptions): Promise<void> {
        return this.setCameraState({preset: name} as {preset: string}, options);
    }

    /**
     * Get all camera presets (built-in + user-defined)
     * @returns Object mapping preset names to camera states or builtin marker
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
     * @returns Object mapping preset names to camera states
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
     * @param presets - Object mapping preset names to camera states
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
     * @param data - Graph data object
     * @param data.nodes - Array of node data objects
     * @param data.edges - Array of edge data objects
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
     * @param nodeId - ID of the node to retrieve
     * @returns The node instance or undefined if not found
     */
    getNode(nodeId: string | number): Node | undefined {
        return this.dataManager.getNode(nodeId);
    }

    /**
     * Get all nodes
     * @returns Array of all node instances
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

    // ===========================================
    // AI Control Methods (Phase 3)
    // ===========================================

    // AI Manager instance (lazy-initialized)
    private aiManager: import("./ai/AiManager").AiManager | null = null;

    /**
     * Enable AI-powered natural language control of the graph.
     * @param config - AI configuration including provider and optional API key
     * @returns Promise resolving when AI is ready
     * @example
     * ```typescript
     * // Enable with mock provider (for testing)
     * await graph.enableAiControl({ provider: 'mock' });
     *
     * // Enable with OpenAI
     * await graph.enableAiControl({
     *   provider: 'openai',
     *   apiKey: 'sk-...'
     * });
     *
     * // Now you can send commands
     * const result = await graph.aiCommand('Show me the graph summary');
     * ```
     */
    async enableAiControl(config: import("./ai/AiManager").AiManagerConfig): Promise<void> {
        // Dynamically import to avoid loading AI code when not needed
        const {AiManager} = await import("./ai/AiManager");

        // Create and initialize AI manager
        this.aiManager = new AiManager();
        this.aiManager.init(this, config);
    }

    /**
     * Disable AI control and clean up resources.
     * @example
     * ```typescript
     * graph.disableAiControl();
     * // AI commands will no longer work
     * ```
     */
    disableAiControl(): void {
        if (this.aiManager) {
            this.aiManager.dispose();
            this.aiManager = null;
        }
    }

    /**
     * Send a natural language command to the AI controller.
     * @param input - Natural language command (e.g., "switch to circular layout")
     * @returns Promise resolving to command result
     * @example
     * ```typescript
     * // Query graph info
     * const result = await graph.aiCommand('How many nodes are there?');
     * console.log(result.message);
     *
     * // Change layout
     * await graph.aiCommand('Use circular layout');
     *
     * // Switch dimension
     * await graph.aiCommand('Show in 2D');
     * ```
     */
    async aiCommand(
        input: string,
    ): Promise<import("./ai/AiController").ExecutionResult> {
        if (!this.aiManager) {
            return {
                success: false,
                message: "AI control is not enabled. Call enableAiControl() first.",
            };
        }

        return this.aiManager.execute(input);
    }

    /**
     * Get the current AI status synchronously.
     * @returns Current AI status or null if AI is not enabled
     * @example
     * ```typescript
     * const status = graph.getAiStatus();
     * if (status?.state === 'executing') {
     *   console.log('AI is processing a command...');
     * }
     * ```
     */
    getAiStatus(): import("./ai/AiStatus").AiStatus | null {
        return this.aiManager?.getStatus() ?? null;
    }

    /**
     * Subscribe to AI status changes.
     * @param callback - Function called when status changes
     * @returns Unsubscribe function
     * @example
     * ```typescript
     * const unsubscribe = graph.onAiStatusChange((status) => {
     *   console.log('AI state:', status.state);
     *   if (status.streamedText) {
     *     console.log('Response:', status.streamedText);
     *   }
     * });
     *
     * // Later: stop listening
     * unsubscribe();
     * ```
     */
    onAiStatusChange(callback: import("./ai/AiStatus").StatusChangeCallback): () => void {
        if (!this.aiManager) {
            // Return no-op unsubscribe if AI not enabled
            return (): void => undefined;
        }

        return this.aiManager.onStatusChange(callback);
    }

    /**
     * Cancel any in-progress AI command.
     * @example
     * ```typescript
     * // Start a long-running command
     * const promise = graph.aiCommand('complex query');
     *
     * // Cancel it
     * graph.cancelAiCommand();
     * ```
     */
    cancelAiCommand(): void {
        this.aiManager?.cancel();
    }

    /**
     * Get the AI manager for advanced configuration.
     * Returns null if AI is not enabled.
     * @returns The AI manager or null
     * @example
     * ```typescript
     * const manager = graph.getAiManager();
     * if (manager) {
     *   // Register custom command
     *   manager.registerCommand(myCustomCommand);
     * }
     * ```
     */
    getAiManager(): import("./ai/AiManager").AiManager | null {
        return this.aiManager;
    }

    /**
     * Check if AI control is currently enabled.
     * @returns True if AI is enabled
     */
    isAiEnabled(): boolean {
        return this.aiManager !== null;
    }

    /**
     * Retry the last AI command.
     * Useful for retrying after transient errors.
     * @returns Promise resolving to command result
     * @throws Error if AI not enabled or no previous command
     * @example
     * ```typescript
     * // After a failed command
     * try {
     *   const result = await graph.retryLastAiCommand();
     *   console.log('Retry succeeded:', result);
     * } catch (error) {
     *   console.error('Retry failed:', error);
     * }
     * ```
     */
    retryLastAiCommand(): Promise<import("./ai/AiController").ExecutionResult> {
        if (!this.aiManager) {
            return Promise.reject(new Error("AI not enabled. Call enableAiControl() first."));
        }

        return this.aiManager.retry();
    }

    /**
     * Get the API key manager for configuring keys before enabling AI.
     * Returns null if AI has never been enabled.
     * @returns The API key manager or null
     * @example
     * ```typescript
     * const keyManager = graph.getApiKeyManager();
     * if (keyManager) {
     *   const providers = keyManager.getConfiguredProviders();
     *   console.log('Configured providers:', providers);
     * }
     * ```
     */
    getApiKeyManager(): ApiKeyManager | null {
        return this.aiManager?.getApiKeyManager() ?? null;
    }

    /**
     * Create a standalone ApiKeyManager for key management without enabling AI.
     * Useful for settings UIs that configure keys before AI activation.
     * @returns A new ApiKeyManager instance
     * @example
     * ```typescript
     * // In a settings UI component
     * const keyManager = Graph.createApiKeyManager();
     * keyManager.enablePersistence({
     *   encryptionKey: userSecret,
     *   storage: 'localStorage',
     * });
     * keyManager.setKey('openai', apiKey);
     * ```
     */
    static createApiKeyManager(): ApiKeyManager {
        return new ApiKeyManager();
    }

    // ===========================================
    // Voice Input Methods (Phase 6)
    // ===========================================

    // Voice input adapter instance (lazy-initialized)
    private voiceAdapter: VoiceInputAdapter | null = null;

    /**
     * Get the voice input adapter.
     * Creates the adapter on first use.
     * @returns The voice input adapter
     * @example
     * ```typescript
     * const adapter = graph.getVoiceAdapter();
     * if (adapter.isSupported) {
     *   adapter.start({ continuous: true });
     * }
     * ```
     */
    getVoiceAdapter(): VoiceInputAdapter {
        this.voiceAdapter ??= new VoiceInputAdapter();

        return this.voiceAdapter;
    }

    /**
     * Start voice input and execute commands.
     * @param options - Voice input options
     * @param options.continuous - Whether to continuously listen for input
     * @param options.interimResults - Whether to return interim transcription results
     * @param options.language - BCP 47 language tag (e.g., "en-US", "fr-FR")
     * @param options.onTranscript - Callback for transcription events
     * @param options.onStart - Callback when voice input starts
     * @returns True if voice input started successfully
     * @example
     * ```typescript
     * graph.startVoiceInput({
     *   continuous: true,
     *   interimResults: true,
     *   onTranscript: (text, isFinal) => {
     *     console.log('Transcript:', text, isFinal ? '(final)' : '(interim)');
     *     if (isFinal) {
     *       graph.aiCommand(text);
     *     }
     *   },
     * });
     * ```
     */
    startVoiceInput(options?: {
        continuous?: boolean;
        interimResults?: boolean;
        language?: string;
        onTranscript?: (text: string, isFinal: boolean) => void;
        onStart?: (started: boolean, error?: string) => void;
    }): boolean {
        const adapter = this.getVoiceAdapter();

        if (!adapter.isSupported) {
            console.warn("Voice input is not supported in this browser");
            return false;
        }

        // Register transcript callback if provided
        if (options?.onTranscript) {
            adapter.onInput(options.onTranscript);
        }

        // Register start callback if provided
        if (options?.onStart) {
            adapter.onStart(options.onStart);
        }

        // Start listening
        adapter.start({
            continuous: options?.continuous ?? false,
            interimResults: options?.interimResults ?? true,
            language: options?.language ?? "en-US",
        });

        // Return true because permission is being requested
        // Actual start/failure will be notified via onStart callback
        return true;
    }

    /**
     * Stop voice input.
     * @example
     * ```typescript
     * graph.stopVoiceInput();
     * ```
     */
    stopVoiceInput(): void {
        this.voiceAdapter?.stop();
    }

    /**
     * Check if voice input is currently active.
     * @returns True if voice input is active
     */
    isVoiceActive(): boolean {
        return this.voiceAdapter?.isActive ?? false;
    }

    // ===========================================
    // XR (VR/AR) Methods
    // ===========================================

    /**
     * Initialize XR (VR/AR) system
     * Creates session manager and UI buttons based on configuration
     */
    private async initializeXR(): Promise<void> {
        const xrConfig = this.graphContext.getConfig().xr;
        if (!xrConfig?.enabled) {
            return;
        }

        // Create XR session manager
        this.xrSessionManager = new XRSessionManager(this.scene, {
            vr: xrConfig.vr,
            ar: xrConfig.ar,
        });

        // Determine which modes are available by actually checking device support
        const vrAvailable = xrConfig.vr.enabled && await this.xrSessionManager.isVRSupported();
        const arAvailable = xrConfig.ar.enabled && await this.xrSessionManager.isARSupported();

        // Create XR UI manager
        this.xrUIManager = new XRUIManager(
            this.element as HTMLElement,
            vrAvailable,
            arAvailable,
            xrConfig.ui,
        );

        // Wire up button click handlers
        this.xrUIManager.onEnterXR = (mode) => {
            void (async() => {
                try {
                    await this.enterXR(mode);
                } catch (error) {
                    console.error("Failed to enter XR mode:", error);

                    // Show user-friendly alert on error
                    const errorMsg = error instanceof Error ? error.message : String(error);
                    alert(`XR Session Failed:\n${errorMsg}\n\nCheck console for details.`);

                    // Emit error event
                    this.eventManager.emitGraphError(
                        this,
                        error instanceof Error ? error : new Error(String(error)),
                        "xr",
                        {mode},
                    );
                }
            })();
        };
    }

    /**
     * Enter XR mode (VR or AR)
     * @param mode - The XR mode to enter ('immersive-vr' or 'immersive-ar')
     */
    public async enterXR(mode: "immersive-vr" | "immersive-ar"): Promise<void> {
        if (!this.xrSessionManager) {
            throw new Error("XR is not initialized");
        }

        const previousCamera = this.camera.getActiveController()?.camera;

        if (mode === "immersive-vr") {
            await this.xrSessionManager.enterVR(previousCamera ?? undefined);
        } else {
            await this.xrSessionManager.enterAR(previousCamera ?? undefined);
        }

        // Phase 3: Set up XR camera controller and input handler
        const xrHelper = this.xrSessionManager.getXRHelper();
        if (!xrHelper) {
            throw new Error("XR helper not available after session creation");
        }

        // Store XR helper in scene metadata for isXRMode() detection
        this.scene.metadata = this.scene.metadata ?? {};
        this.scene.metadata.xrHelper = xrHelper;

        // Create XR pivot camera controller (handles input via pivot-based system)
        const {XRPivotCameraController} = await import("./cameras/XRPivotCameraController");
        const xrCameraController = new XRPivotCameraController(this.scene, xrHelper);

        // Note: XRPivotCameraController automatically enables input when XR state changes
        // We just need to call update() every frame for input processing

        // Hook into render loop to update XR input
        const xrUpdateObserver = this.scene.onBeforeRenderObservable.add(() => {
            xrCameraController.update();
        });

        // Store for cleanup
        this.scene.metadata.xrCameraController = xrCameraController;
        this.scene.metadata.xrUpdateObserver = xrUpdateObserver;
    }

    /**
     * Exit XR mode and return to previous camera
     */
    public async exitXR(): Promise<void> {
        if (!this.xrSessionManager) {
            return;
        }

        // Clean up XR camera controller
        if (this.scene.metadata?.xrCameraController) {
            this.scene.metadata.xrCameraController.dispose();
            this.scene.metadata.xrCameraController = null;
        }

        // Remove render loop observer
        if (this.scene.metadata?.xrUpdateObserver) {
            this.scene.onBeforeRenderObservable.remove(this.scene.metadata.xrUpdateObserver);
            this.scene.metadata.xrUpdateObserver = null;
        }

        // Clear XR helper from metadata
        if (this.scene.metadata?.xrHelper) {
            this.scene.metadata.xrHelper = null;
        }

        await this.xrSessionManager.exitXR();
    }

    /**
     * Dispose all graph resources including voice, AI, XR, and Babylon.js components.
     */
    dispose(): void {
        // Clean up voice adapter if created
        this.voiceAdapter?.dispose();
        this.voiceAdapter = null;

        // Clean up AI manager if enabled
        this.disableAiControl();

        // Clean up XR resources
        this.xrUIManager?.dispose();
        this.xrSessionManager?.dispose();
        this.shutdown();
    }
}
