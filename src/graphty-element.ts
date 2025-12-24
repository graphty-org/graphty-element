// WORKAROUND: Import InstancedMesh side-effect first
// See: https://github.com/graphty-org/graphty-element/issues/54
import "@babylonjs/core/Meshes/instancedMesh";

import {LitElement} from "lit";
import {customElement, property} from "lit/decorators.js";
import {set as setDeep} from "lodash";

import type {StyleSchema, ViewMode} from "./config";
import type {PartialXRConfig} from "./config/xr-config-schema";
import {Graph} from "./Graph";
import {GraphtyLogger, LogLevel, parseLoggingURLParams} from "./logging";
import type {ScreenshotOptions, ScreenshotResult} from "./screenshot/types.js";

/**
 * Graphty creates a graph
 */
@customElement("graphty-element")
export class Graphty extends LitElement {
    #graph: Graph;
    #element: Element;
    #resizeObserver: ResizeObserver | null = null;

    constructor() {
        super();

        this.#element = document.createElement("div");
        // Ensure the container div fills the graphty-element
        // position: relative is needed for absolute positioning of XR UI overlay
        this.#element.setAttribute("style", "width: 100%; height: 100%; display: block; position: relative;");
        this.#graph = new Graph(this.#element);
    }

    connectedCallback(): void {
        super.connectedCallback();
        this.renderRoot.appendChild(this.#element);

        // Watch for container size changes and resize the canvas accordingly
        this.#resizeObserver = new ResizeObserver(() => {
            // Resize the Babylon.js engine when the container size changes
            this.#graph.engine.resize();
            // Update camera projection to match new aspect ratio (prevents visual shifts)
            this.#graph.camera.onResize();
        });
        this.#resizeObserver.observe(this);

        // Parse URL parameters
        this.parseURLParams();
    }

    private parseURLParams(): void {
        const urlParams = new URLSearchParams(window.location.search);

        // Check for profiling parameter
        if (urlParams.get("profiling") === "true") {
            this.enableDetailedProfiling = true;
        }

        // Parse logging params
        const loggingParams = parseLoggingURLParams();
        if (loggingParams?.enabled) {
            void GraphtyLogger.configure({
                enabled: true,
                modules: loggingParams.modules,
                level: loggingParams.level ?? LogLevel.INFO,
                format: {timestamp: true, module: true, colors: true},
            });
        }
    }

    // update(changedProperties: Map<string, unknown>) {
    //     super.update(changedProperties);
    //     // console.log(`update: ${[... changedProperties.keys()].join(", ")}`);
    // }

    firstUpdated(changedProperties: Map<string, unknown>): void {
        super.firstUpdated(changedProperties);
        // console.log(`firstUpdated: ${[... changedProperties.keys()].join(", ")}`);

        this.asyncFirstUpdated()
            .catch((e: unknown) => {
                throw e;
            });
    }

    async asyncFirstUpdated(): Promise<void> {
        // Forward ALL internal graph events as DOM CustomEvents
        // This allows external code (e.g., React) to listen for any graph event
        // using standard DOM addEventListener (e.g., "style-changed", "graph-settled", etc.)
        this.#graph.eventManager.onGraphEvent.add((event) => {
            this.dispatchEvent(new CustomEvent(event.type, {
                detail: event,
                bubbles: true,
                composed: true,
            }));
        });

        // Note: Property setters now forward to Graph methods automatically,
        // so we don't need to check changedProperties here. The setters have
        // already been called by the time we reach this lifecycle method.

        // Initialize the graph (only needs to happen once)
        await this.#graph.init();

        // Wait for first render frame to ensure graph is visible
        await new Promise((resolve) => requestAnimationFrame(() => {
            requestAnimationFrame(resolve);
        }));

        this.#graph.engine.resize();
    }

    render(): Element {
        return this.#element;
    }

    disconnectedCallback(): void {
        // Disconnect the resize observer
        if (this.#resizeObserver) {
            this.#resizeObserver.disconnect();
            this.#resizeObserver = null;
        }

        this.#graph.shutdown();
        super.disconnectedCallback();
    }

    // Private backing fields for reactive properties
    #nodeData?: Record<string, unknown>[];
    #edgeData?: Record<string, unknown>[];
    #dataSource?: string;
    #dataSourceConfig?: Record<string, unknown>;
    #nodeIdPath?: string;
    #edgeSrcIdPath?: string;
    #edgeDstIdPath?: string;
    #layout?: string;
    #layoutConfig?: Record<string, unknown>;
    #viewMode?: ViewMode;
    #styleTemplate?: StyleSchema;
    #runAlgorithmsOnLoad?: boolean;
    #xr?: PartialXRConfig;

    /**
     * Array of node data objects to visualize.
     *
     * @remarks
     * Setting this property replaces all existing nodes. For incremental
     * updates, use the `graph.addNodes()` method instead.
     *
     * Each node object should have an ID field (default: "id"). Additional
     * properties can be used in style selectors and accessed via `node.data`.
     *
     * @defaultValue `[]`
     * @since 1.0.0
     *
     * @see {@link edgeData} for edge data
     * @see {@link https://graphty-org.github.io/graphty-element/storybook/?path=/story/graphty--default | Basic Examples}
     *
     * @example HTML attribute (JSON string)
     * ```html
     * <graphty-element
     *   node-data='[{"id": "1", "label": "Node 1"}, {"id": "2", "label": "Node 2"}]'>
     * </graphty-element>
     * ```
     *
     * @example JavaScript property
     * ```typescript
     * const element = document.querySelector('graphty-element');
     * element.nodeData = [
     *   { id: 'a', label: 'Node A', category: 'primary' },
     *   { id: 'b', label: 'Node B', category: 'secondary' }
     * ];
     * ```
     */
    @property({attribute: "node-data"})
    get nodeData(): Record<string, unknown>[] | undefined {
        return this.#nodeData;
    }
    set nodeData(value: Record<string, unknown>[] | undefined) {
        const oldValue = this.#nodeData;
        this.#nodeData = value;

        // Forward to Graph method (which queues operation)
        if (value && Array.isArray(value)) {
            void this.#graph.addNodes(value);
        }

        this.requestUpdate("nodeData", oldValue);
    }

    /**
     * Array of edge data objects defining connections between nodes.
     *
     * @remarks
     * Setting this property replaces all existing edges. For incremental
     * updates, use the `graph.addEdges()` method instead.
     *
     * Each edge object should have source and target fields (default: "source", "target").
     * Additional properties can be used for styling (e.g., weight, label).
     *
     * @defaultValue `[]`
     * @since 1.0.0
     *
     * @see {@link nodeData} for node data
     * @see {@link edgeSrcIdPath} to customize source field
     * @see {@link edgeDstIdPath} to customize target field
     *
     * @example HTML attribute
     * ```html
     * <graphty-element
     *   edge-data='[{"source": "1", "target": "2"}, {"source": "2", "target": "3"}]'>
     * </graphty-element>
     * ```
     *
     * @example JavaScript property
     * ```typescript
     * element.edgeData = [
     *   { source: 'a', target: 'b', weight: 1.5 },
     *   { source: 'b', target: 'c', weight: 2.0 }
     * ];
     * ```
     */
    @property({attribute: "edge-data"})
    get edgeData(): Record<string, unknown>[] | undefined {
        return this.#edgeData;
    }
    set edgeData(value: Record<string, unknown>[] | undefined) {
        const oldValue = this.#edgeData;
        this.#edgeData = value;

        // Forward to Graph method (which queues operation)
        if (value && Array.isArray(value)) {
            void this.#graph.addEdges(value);
        }

        this.requestUpdate("edgeData", oldValue);
    }

    /**
     * The type of data source (e.g. "json"). See documentation for
     * data sources for more information.
     */
    @property({attribute: "data-source"})
    get dataSource(): string | undefined {
        return this.#dataSource;
    }
    set dataSource(value: string | undefined) {
        const oldValue = this.#dataSource;
        this.#dataSource = value;

        // Try to initialize data source if both dataSource and dataSourceConfig are set
        this.#tryInitializeDataSource();

        this.requestUpdate("dataSource", oldValue);
    }

    /**
     * The configuration for the data source. See documentation for
     * data sources for more information.
     */
    @property({attribute: "data-source-config"})
    get dataSourceConfig(): Record<string, unknown> | undefined {
        return this.#dataSourceConfig;
    }
    set dataSourceConfig(value: Record<string, unknown> | undefined) {
        const oldValue = this.#dataSourceConfig;
        this.#dataSourceConfig = value;

        // Try to initialize data source if both dataSource and dataSourceConfig are set
        this.#tryInitializeDataSource();

        this.requestUpdate("dataSourceConfig", oldValue);
    }

    /**
     * Helper method to initialize data source only when both properties are set
     */
    #dataSourceInitialized = false;
    #tryInitializeDataSource(): void {
        // Only initialize once, and only if both dataSource and dataSourceConfig are set
        if (!this.#dataSourceInitialized && this.#dataSource && this.#dataSourceConfig) {
            this.#dataSourceInitialized = true;
            void this.#graph.addDataFromSource(this.#dataSource, this.#dataSourceConfig);
        }
    }

    /**
     * A jmespath string that can be used to select the unique node identifier
     * for each node. Defaults to "id", as in `{id: 42}` is the identifier of
     * the node.
     */
    @property({attribute: "node-id-path"})
    get nodeIdPath(): string | undefined {
        return this.#nodeIdPath;
    }
    set nodeIdPath(value: string | undefined) {
        const oldValue = this.#nodeIdPath;
        this.#nodeIdPath = value;

        if (value) {
            setDeep(this.#graph.styles.config, "data.knownFields.nodeIdPath", value);
        }

        this.requestUpdate("nodeIdPath", oldValue);
    }

    /**
     * Similar to the nodeIdPath property / node-id-path attribute, this is a
     * jmespath that describes where to find the source node identifier for this edge.
     * Defaults to "src", as in `{src: 42, dst: 31337}`
     */
    @property({attribute: "edge-src-id-path"})
    get edgeSrcIdPath(): string | undefined {
        return this.#edgeSrcIdPath;
    }
    set edgeSrcIdPath(value: string | undefined) {
        const oldValue = this.#edgeSrcIdPath;
        this.#edgeSrcIdPath = value;

        if (value) {
            setDeep(this.#graph.styles.config, "data.knownFields.edgeSrcIdPath", value);
        }

        this.requestUpdate("edgeSrcIdPath", oldValue);
    }

    /**
     * Similar to the nodeIdPath property / node-id-path attribute, this is a
     * jmespath that describes where to find the desination node identifier for this edge.
     * Defaults to "dst", as in `{src: 42, dst: 31337}`
     */
    @property({attribute: "edge-dst-id-path"})
    get edgeDstIdPath(): string | undefined {
        return this.#edgeDstIdPath;
    }
    set edgeDstIdPath(value: string | undefined) {
        const oldValue = this.#edgeDstIdPath;
        this.#edgeDstIdPath = value;

        if (value) {
            setDeep(this.#graph.styles.config, "data.knownFields.edgeDstIdPath", value);
        }

        this.requestUpdate("edgeDstIdPath", oldValue);
    }

    /**
     * Layout algorithm to use for positioning nodes.
     *
     * @remarks
     * Available layouts:
     * - `ngraph`: Force-directed (3D optimized, recommended)
     * - `d3-force`: Force-directed (2D)
     * - `circular`: Nodes arranged in a circle
     * - `grid`: Nodes arranged in a grid
     * - `hierarchical`: Tree/DAG layout
     * - `random`: Random positions
     * - `fixed`: Pre-defined positions from node data
     *
     * @defaultValue `'ngraph'`
     * @since 1.0.0
     *
     * @see {@link layoutConfig} for layout-specific options
     * @see {@link https://graphty-org.github.io/graphty-element/storybook/?path=/story/layout--default | Layout Examples}
     *
     * @example
     * ```typescript
     * // Set force-directed layout
     * element.layout = 'ngraph';
     *
     * // Set circular layout with config
     * element.layout = 'circular';
     * element.layoutConfig = { radius: 5 };
     * ```
     */
    @property()
    get layout(): string | undefined {
        return this.#layout;
    }
    set layout(value: string | undefined) {
        const oldValue = this.#layout;
        this.#layout = value;

        // Forward to Graph method (which queues operation)
        if (value) {
            const templateLayoutOptions = this.#graph.styles.config.graph.layoutOptions ?? {};
            const mergedConfig = {... templateLayoutOptions, ... (this.#layoutConfig ?? {})};
            void this.#graph.setLayout(value, mergedConfig);
        }

        this.requestUpdate("layout", oldValue);
    }

    /**
     * Specifies which type of layout to use. See the layout documentation for
     * more information.
     */
    @property({attribute: "layout-config"})
    get layoutConfig(): Record<string, unknown> | undefined {
        return this.#layoutConfig;
    }
    set layoutConfig(value: Record<string, unknown> | undefined) {
        const oldValue = this.#layoutConfig;
        this.#layoutConfig = value;

        // If layout is already set, update it with new config
        if (this.#layout) {
            const templateLayoutOptions = this.#graph.styles.config.graph.layoutOptions ?? {};
            const mergedConfig = {... templateLayoutOptions, ... (value ?? {})};
            void this.#graph.setLayout(this.#layout, mergedConfig);
        }

        this.requestUpdate("layoutConfig", oldValue);
    }

    /**
     * View mode controls how the graph is rendered and displayed.
     *
     * @remarks
     * - `"2d"`: Orthographic camera, fixed top-down view
     * - `"3d"`: Perspective camera with orbit controls (default)
     * - `"ar"`: Augmented reality mode using WebXR
     * - `"vr"`: Virtual reality mode using WebXR
     *
     * VR and AR modes require WebXR support in the browser.
     *
     * @defaultValue `'3d'`
     * @since 1.0.0
     *
     * @see {@link https://graphty-org.github.io/graphty-element/storybook/?path=/story/viewmode--default | View Mode Examples}
     *
     * @example
     * ```typescript
     * element.viewMode = "2d";  // Switch to 2D orthographic view
     * element.viewMode = "3d";  // Switch to 3D perspective view
     * element.viewMode = "vr";  // Enter VR mode (requires WebXR support)
     * ```
     */
    @property({attribute: "view-mode"})
    get viewMode(): ViewMode | undefined {
        return this.#viewMode;
    }
    set viewMode(value: ViewMode | undefined) {
        const oldValue = this.#viewMode;
        this.#viewMode = value;

        // Forward to Graph method (which handles all mode switching logic)
        if (value !== undefined) {
            void this.#graph.setViewMode(value);
        }

        this.requestUpdate("viewMode", oldValue);
    }

    /**
     * @deprecated Use viewMode instead. layout2d: true is equivalent to viewMode: "2d"
     * Specifies that the layout should be rendered in two dimensions (as
     * opposed to 3D)
     */
    @property({attribute: "layout-2d"})
    get layout2d(): boolean | undefined {
        // Return true if viewMode is "2d", false if "3d", undefined otherwise
        if (this.#viewMode === "2d") {
            return true;
        }

        if (this.#viewMode === "3d") {
            return false;
        }

        return undefined;
    }
    set layout2d(value: boolean | undefined) {
        console.warn(
            "[graphty-element] layout2d is deprecated. Use viewMode instead. " +
            "layout2d: true → viewMode: \"2d\", layout2d: false → viewMode: \"3d\"",
        );

        if (value !== undefined) {
            // Convert boolean to viewMode
            this.viewMode = value ? "2d" : "3d";
        }
    }

    /**
     * Style template configuration for the graph visualization.
     *
     * @remarks
     * Style templates define the visual appearance of nodes, edges, and the graph
     * background. They can include colors, sizes, shapes, labels, and selection styles.
     *
     * Templates can be:
     * - A string name (e.g., "default", "dark")
     * - A partial configuration object to override defaults
     * - A complete StyleSchema configuration
     *
     * @defaultValue `'default'`
     * @since 1.0.0
     *
     * @see {@link https://graphty-org.github.io/graphty-element/storybook/?path=/story/graphstyles--default | Style Examples}
     *
     * @example
     * ```typescript
     * // Apply dark theme
     * element.styleTemplate = 'dark';
     *
     * // Custom node colors
     * element.styleTemplate = {
     *   node: { color: '#ff6600', size: 1.5 },
     *   edge: { color: '#cccccc' }
     * };
     * ```
     */
    @property({attribute: "style-template"})
    get styleTemplate(): StyleSchema | undefined {
        return this.#styleTemplate;
    }
    set styleTemplate(value: StyleSchema | undefined) {
        const oldValue = this.#styleTemplate;
        this.#styleTemplate = value;

        // Forward to Graph method (which queues operation)
        if (value) {
            void this.#graph.setStyleTemplate(value);
        }

        this.requestUpdate("styleTemplate", oldValue);
    }

    /**
     * Whether or not to run all algorithims in a style template when the
     * template is loaded
     */
    @property({attribute: "run-algorithms-on-load"})
    get runAlgorithmsOnLoad(): boolean | undefined {
        return this.#runAlgorithmsOnLoad;
    }
    set runAlgorithmsOnLoad(value: boolean | undefined) {
        const oldValue = this.#runAlgorithmsOnLoad;
        this.#runAlgorithmsOnLoad = value;

        if (value !== undefined) {
            this.#graph.runAlgorithmsOnLoad = value;
        }

        this.requestUpdate("runAlgorithmsOnLoad", oldValue);
    }

    #enableDetailedProfiling?: boolean;

    /**
     * Enable detailed performance profiling.
     * When enabled, hierarchical timing and advanced statistics will be collected.
     * Access profiling data via graph.getStatsManager().getSnapshot() or
     * graph.getStatsManager().reportDetailed().
     */
    @property({attribute: "enable-detailed-profiling", type: Boolean})
    get enableDetailedProfiling(): boolean | undefined {
        return this.#enableDetailedProfiling;
    }
    set enableDetailedProfiling(value: boolean | undefined) {
        const oldValue = this.#enableDetailedProfiling;
        this.#enableDetailedProfiling = value;

        if (value !== undefined) {
            this.#graph.enableDetailedProfiling = value;
        }

        this.requestUpdate("enableDetailedProfiling", oldValue);
    }

    /**
     * XR (VR/AR) configuration.
     * Controls XR UI buttons, VR/AR mode settings, and input handling.
     *
     * @example
     * ```typescript
     * element.xr = {
     *   enabled: true,
     *   ui: {
     *     enabled: true,
     *     position: 'bottom-right',
     *     showAvailabilityWarning: true  // Show warning if XR unavailable
     *   },
     *   input: {
     *     handTracking: true,
     *     controllers: true
     *   }
     * };
     * ```
     */
    @property({attribute: false})
    get xr(): PartialXRConfig | undefined {
        return this.#xr;
    }
    set xr(value: PartialXRConfig | undefined) {
        const oldValue = this.#xr;
        this.#xr = value;

        // Forward to Graph method
        if (value !== undefined) {
            this.#graph.setXRConfig(value);
        }

        this.requestUpdate("xr", oldValue);
    }

    /**
     * Capture a screenshot of the current graph visualization.
     *
     * @param options - Screenshot options (format, resolution, destinations, etc.)
     * @returns Promise resolving to ScreenshotResult with blob and metadata
     *
     * @example
     * ```typescript
     * const el = document.querySelector('graphty-element');
     *
     * // Basic PNG screenshot
     * const result = await el.captureScreenshot();
     *
     * // High-res JPEG with download
     * const result = await el.captureScreenshot({
     *   format: 'jpeg',
     *   multiplier: 2,
     *   destination: { download: true }
     * });
     *
     * // Copy to clipboard
     * const result = await el.captureScreenshot({
     *   destination: { clipboard: true }
     * });
     * ```
     */
    async captureScreenshot(options?: ScreenshotOptions): Promise<ScreenshotResult> {
        return this.#graph.captureScreenshot(options);
    }

    /**
     * Phase 6: Capability Check API
     * Check if screenshot can be captured with given options.
     * Available from Phase 6 onwards.
     *
     * @param options - Screenshot options to validate
     * @returns Promise<CapabilityCheck> - Result indicating whether screenshot is supported
     *
     * @example
     * ```typescript
     * const el = document.querySelector('graphty-element');
     *
     * // Check if 4x multiplier is supported
     * const check = await el.canCaptureScreenshot({ multiplier: 4 });
     * if (!check.supported) {
     *   alert(`Cannot capture: ${check.reason}`);
     * } else if (check.warnings) {
     *   console.warn('Warnings:', check.warnings);
     * }
     * ```
     */
    async canCaptureScreenshot(options?: ScreenshotOptions): Promise<import("./screenshot/capability-check.js").CapabilityCheck> {
        return this.#graph.canCaptureScreenshot(options);
    }

    /**
     * Phase 7: Video Capture API
     * Capture an animation as a video (stationary or animated camera)
     * Available from Phase 7 onwards.
     *
     * @param options - Animation capture options
     * @returns Promise<AnimationResult> - Result with video blob and metadata
     *
     * @example
     * ```typescript
     * const el = document.querySelector('graphty-element');
     *
     * // Basic 5-second video
     * const result = await el.captureAnimation({
     *   duration: 5000,
     *   fps: 30,
     *   cameraMode: 'stationary'
     * });
     *
     * // With download
     * const result = await el.captureAnimation({
     *   duration: 10000,
     *   fps: 60,
     *   cameraMode: 'stationary',
     *   download: true,
     *   downloadFilename: 'my-video.webm'
     * });
     * ```
     */
    async captureAnimation(options: import("./video/VideoCapture.js").AnimationOptions): Promise<import("./video/VideoCapture.js").AnimationResult> {
        return this.#graph.captureAnimation(options);
    }

    /**
     * Phase 7: Cancel Animation Capture
     * Cancel an ongoing animation capture
     * Available from Phase 7 onwards.
     *
     * @returns true if a capture was cancelled, false if no capture was in progress
     *
     * @example
     * ```typescript
     * const el = document.querySelector("graphty-element");
     *
     * // Start a 10-second capture
     * const capturePromise = el.captureAnimation({
     *   duration: 10000,
     *   fps: 30,
     *   cameraMode: 'stationary'
     * });
     *
     * // Cancel after 2 seconds
     * setTimeout(() => {
     *   const wasCancelled = el.cancelAnimationCapture();
     *   console.log('Cancelled:', wasCancelled);
     * }, 2000);
     *
     * // Handle the cancellation
     * try {
     *   await capturePromise;
     * } catch (error) {
     *   if (error.name === 'AnimationCancelledError') {
     *     console.log('Capture was cancelled by user');
     *   }
     * }
     * ```
     */
    cancelAnimationCapture(): boolean {
        return this.#graph.cancelAnimationCapture();
    }

    /**
     * Phase 7: Check if animation capture is in progress
     * Available from Phase 7 onwards.
     *
     * @returns true if a capture is currently running
     */
    isAnimationCapturing(): boolean {
        return this.#graph.isAnimationCapturing();
    }

    /**
     * Phase 7: Animation Capture Estimation
     * Estimate performance and potential issues for animation capture
     * Available from Phase 7 onwards.
     *
     * @param options - Animation options to estimate
     * @returns Promise<CaptureEstimate> - Estimation result
     *
     * @example
     * ```typescript
     * const el = document.querySelector("graphty-element");
     *
     * const estimate = await el.estimateAnimationCapture({
     *   duration: 5000,
     *   fps: 60,
     *   width: 3840,
     *   height: 2160
     * });
     *
     * if (estimate.likelyToDropFrames) {
     *   console.warn(`May drop frames. Try ${estimate.recommendedFps}fps instead.`);
     * }
     * ```
     */
    async estimateAnimationCapture(options: Pick<import("./video/VideoCapture.js").AnimationOptions, "duration" | "fps" | "width" | "height">): Promise<import("./video/estimation.js").CaptureEstimate> {
        return this.#graph.estimateAnimationCapture(options);
    }

    /**
     * View Mode API
     */

    /**
     * Get the current view mode.
     * @returns The current view mode ("2d", "3d", "ar", or "vr")
     *
     * @example
     * ```typescript
     * const mode = element.getViewMode();
     * console.log(`Current mode: ${mode}`); // "3d"
     * ```
     */
    getViewMode(): ViewMode {
        return this.#graph.getViewMode();
    }

    /**
     * Set the view mode.
     * Changes the rendering dimension and camera system.
     *
     * @param mode - The view mode to set ("2d", "3d", "ar", or "vr")
     * @returns Promise that resolves when the mode switch is complete
     *
     * @example
     * ```typescript
     * // Switch to 2D orthographic view
     * await element.setViewMode("2d");
     *
     * // Switch to VR mode
     * await element.setViewMode("vr");
     * ```
     */
    async setViewMode(mode: ViewMode): Promise<void> {
        return this.#graph.setViewMode(mode);
    }

    /**
     * Check if VR mode is supported on this device/browser.
     * Returns true if WebXR is available and VR sessions are supported.
     *
     * Use this to conditionally show/hide VR controls or display
     * appropriate messaging to users.
     *
     * @returns Promise resolving to true if VR is supported
     *
     * @example
     * ```typescript
     * const vrButton = document.querySelector('#vr-button');
     * const vrSupported = await element.isVRSupported();
     * if (!vrSupported) {
     *   vrButton.disabled = true;
     *   vrButton.title = "VR not available on this device";
     * }
     * ```
     */
    async isVRSupported(): Promise<boolean> {
        return this.#graph.isVRSupported();
    }

    /**
     * Check if AR mode is supported on this device/browser.
     * Returns true if WebXR is available and AR sessions are supported.
     *
     * Use this to conditionally show/hide AR controls or display
     * appropriate messaging to users.
     *
     * @returns Promise resolving to true if AR is supported
     *
     * @example
     * ```typescript
     * const arButton = document.querySelector('#ar-button');
     * const arSupported = await element.isARSupported();
     * if (!arSupported) {
     *   arButton.disabled = true;
     *   arButton.title = "AR not available on this device";
     * }
     * ```
     */
    async isARSupported(): Promise<boolean> {
        return this.#graph.isARSupported();
    }

    /**
     * Phase 4: Camera State API
     */

    /**
     * Get current camera state (supports both 2D and 3D)
     * @returns Current camera state including position, target, zoom, etc.
     */
    getCameraState(): import("./screenshot/types.js").CameraState {
        return this.#graph.getCameraState();
    }

    /**
     * Set camera state (supports both 2D and 3D)
     * @param state - Camera state to apply or preset name
     * @param options - Animation options
     * @returns Promise that resolves when the camera state is applied (or animation completes)
     */
    async setCameraState(
        state: import("./screenshot/types.js").CameraState | {preset: string},
        options?: import("./screenshot/types.js").CameraAnimationOptions,
    ): Promise<void> {
        return this.#graph.setCameraState(state, options);
    }

    /**
     * Set camera position (3D)
     * @param position - Target position {x, y, z}
     * @param options - Animation options
     * @returns Promise that resolves when the position is applied (or animation completes)
     */
    async setCameraPosition(
        position: {x: number, y: number, z: number},
        options?: import("./screenshot/types.js").CameraAnimationOptions,
    ): Promise<void> {
        return this.#graph.setCameraPosition(position, options);
    }

    /**
     * Set camera target (3D)
     * @param target - Target point to look at {x, y, z}
     * @param options - Animation options
     * @returns Promise that resolves when the target is applied (or animation completes)
     */
    async setCameraTarget(
        target: {x: number, y: number, z: number},
        options?: import("./screenshot/types.js").CameraAnimationOptions,
    ): Promise<void> {
        return this.#graph.setCameraTarget(target, options);
    }

    /**
     * Set camera zoom (2D)
     * @param zoom - Zoom level
     * @param options - Animation options
     * @returns Promise that resolves when the zoom is applied (or animation completes)
     */
    async setCameraZoom(
        zoom: number,
        options?: import("./screenshot/types.js").CameraAnimationOptions,
    ): Promise<void> {
        return this.#graph.setCameraZoom(zoom, options);
    }

    /**
     * Set camera pan (2D)
     * @param pan - Pan position {x, y}
     * @param options - Animation options
     * @returns Promise that resolves when the pan is applied (or animation completes)
     */
    async setCameraPan(
        pan: {x: number, y: number},
        options?: import("./screenshot/types.js").CameraAnimationOptions,
    ): Promise<void> {
        return this.#graph.setCameraPan(pan, options);
    }

    /**
     * Reset camera to default position
     * @param options - Animation options
     * @returns Promise that resolves when the reset is applied (or animation completes)
     */
    async resetCamera(options?: import("./screenshot/types.js").CameraAnimationOptions): Promise<void> {
        return this.#graph.resetCamera(options);
    }

    /**
     * Save current camera state as a named preset
     * Available from Phase 5 onwards
     * @param name - Name for the preset
     */
    saveCameraPreset(name: string): void {
        this.#graph.saveCameraPreset(name);
    }

    /**
     * Load a camera preset (built-in or user-defined)
     * Available from Phase 5 onwards
     * @param name - Name of the preset to load
     * @param options - Animation options
     */
    async loadCameraPreset(name: string, options?: import("./screenshot/types.js").CameraAnimationOptions): Promise<void> {
        return this.#graph.loadCameraPreset(name, options);
    }

    /**
     * Get all camera presets (built-in + user-defined)
     * Available from Phase 5 onwards
     * @returns Record of preset names to their state (built-in presets are marked)
     */
    getCameraPresets(): Record<string, import("./screenshot/types.js").CameraState | {builtin: true}> {
        return this.#graph.getCameraPresets();
    }

    /**
     * Export user-defined presets as JSON
     * Available from Phase 5 onwards
     * @returns Record of user-defined preset names to their state
     */
    exportCameraPresets(): Record<string, import("./screenshot/types.js").CameraState> {
        return this.#graph.exportCameraPresets();
    }

    /**
     * Import user-defined presets from JSON
     * Available from Phase 5 onwards
     * @param presets - Record of preset names to their state
     */
    importCameraPresets(presets: Record<string, import("./screenshot/types.js").CameraState>): void {
        this.#graph.importCameraPresets(presets);
    }

    /**
     * Get the underlying Graph instance for debugging purposes
     */
    get graph(): Graph {
        return this.#graph;
    }

    // ============================================================================
    // Phase 7a: High Priority Methods - Data Management
    // ============================================================================

    /**
     * Add a single node to the graph.
     *
     * @param node - Node data object to add
     * @param idPath - Key to use for node ID (default: "id")
     * @param options - Queue options for operation ordering
     * @returns Promise that resolves when node is added
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * await element.addNode({ id: 'node-1', label: 'First Node' });
     * ```
     */
    async addNode(
        node: import("./config").AdHocData,
        idPath?: string,
        options?: import("./utils/queue-migration").QueueableOptions,
    ): Promise<void> {
        return this.#graph.addNode(node, idPath, options);
    }

    /**
     * Add multiple nodes to the graph.
     *
     * @param nodes - Array of node data objects to add
     * @param idPath - Key to use for node IDs (default: "id")
     * @param options - Queue options for operation ordering
     * @returns Promise that resolves when nodes are added
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * await element.addNodes([
     *   { id: 'a', label: 'Node A' },
     *   { id: 'b', label: 'Node B' }
     * ]);
     * ```
     */
    async addNodes(
        nodes: import("./config").AdHocData[],
        idPath?: string,
        options?: import("./utils/queue-migration").QueueableOptions,
    ): Promise<void> {
        return this.#graph.addNodes(nodes, idPath, options);
    }

    /**
     * Add a single edge to the graph.
     *
     * @param edge - Edge data object to add
     * @param srcIdPath - Path to source node ID (default: "source")
     * @param dstIdPath - Path to target node ID (default: "target")
     * @param options - Queue options for operation ordering
     * @returns Promise that resolves when edge is added
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * await element.addEdge({ source: 'a', target: 'b', weight: 1.5 });
     * ```
     */
    async addEdge(
        edge: import("./config").AdHocData,
        srcIdPath?: string,
        dstIdPath?: string,
        options?: import("./utils/queue-migration").QueueableOptions,
    ): Promise<void> {
        return this.#graph.addEdge(edge, srcIdPath, dstIdPath, options);
    }

    /**
     * Add multiple edges to the graph.
     *
     * @param edges - Array of edge data objects to add
     * @param srcIdPath - Path to source node ID (default: "source")
     * @param dstIdPath - Path to target node ID (default: "target")
     * @param options - Queue options for operation ordering
     * @returns Promise that resolves when edges are added
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * await element.addEdges([
     *   { source: 'a', target: 'b' },
     *   { source: 'b', target: 'c' }
     * ]);
     * ```
     */
    async addEdges(
        edges: import("./config").AdHocData[],
        srcIdPath?: string,
        dstIdPath?: string,
        options?: import("./utils/queue-migration").QueueableOptions,
    ): Promise<void> {
        return this.#graph.addEdges(edges, srcIdPath, dstIdPath, options);
    }

    /**
     * Remove nodes from the graph.
     *
     * @param nodeIds - Array of node IDs to remove
     * @param options - Queue options for operation ordering
     * @returns Promise that resolves when nodes are removed
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * await element.removeNodes(['node-1', 'node-2']);
     * ```
     */
    async removeNodes(
        nodeIds: (string | number)[],
        options?: import("./utils/queue-migration").QueueableOptions,
    ): Promise<void> {
        return this.#graph.removeNodes(nodeIds, options);
    }

    /**
     * Update node data.
     *
     * @param updates - Array of update objects with id and properties to update
     * @param options - Queue options for operation ordering
     * @returns Promise that resolves when nodes are updated
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * await element.updateNodes([
     *   { id: 'node-1', label: 'Updated Label' }
     * ]);
     * ```
     */
    async updateNodes(
        updates: {id: string | number, [key: string]: unknown}[],
        options?: import("./utils/queue-migration").QueueableOptions,
    ): Promise<void> {
        return this.#graph.updateNodes(updates, options);
    }

    /**
     * Add data from a data source.
     *
     * @param type - Data source type (e.g., "json", "csv", "graphml")
     * @param opts - Data source configuration options
     * @returns Promise that resolves when data is loaded
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * await element.addDataFromSource('json', { url: 'https://example.com/data.json' });
     * ```
     */
    async addDataFromSource(type: string, opts?: object): Promise<void> {
        return this.#graph.addDataFromSource(type, opts ?? {});
    }

    /**
     * Load graph data from a URL.
     *
     * @param url - URL to fetch graph data from
     * @param options - Loading options
     * @returns Promise that resolves when data is loaded
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * await element.loadFromUrl('https://example.com/graph.json');
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
        return this.#graph.loadFromUrl(url, options);
    }

    /**
     * Load graph data from a File object.
     *
     * @param file - File object from file input
     * @param options - Loading options
     * @returns Promise that resolves when data is loaded
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * const input = document.querySelector('input[type="file"]');
     * const file = input.files[0];
     * await element.loadFromFile(file);
     * ```
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
        return this.#graph.loadFromFile(file, options);
    }

    /**
     * Get a node by its ID.
     *
     * @param nodeId - The ID of the node to get
     * @returns The node, or undefined if not found
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * const node = element.getNode('node-1');
     * if (node) {
     *   console.log('Node data:', node.data);
     * }
     * ```
     */
    getNode(nodeId: string | number): import("./Node").Node | undefined {
        return this.#graph.getNode(nodeId);
    }

    /**
     * Get all nodes in the graph.
     *
     * @returns Array of all nodes
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * const nodes = element.getNodes();
     * console.log('Total nodes:', nodes.length);
     * ```
     */
    getNodes(): import("./Node").Node[] {
        return this.#graph.getNodes();
    }

    /**
     * Get the number of nodes in the graph.
     *
     * @returns Number of nodes
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * console.log('Node count:', element.getNodeCount());
     * ```
     */
    getNodeCount(): number {
        return this.#graph.getNodeCount();
    }

    /**
     * Get the number of edges in the graph.
     *
     * @returns Number of edges
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * console.log('Edge count:', element.getEdgeCount());
     * ```
     */
    getEdgeCount(): number {
        return this.#graph.getEdgeCount();
    }

    // ============================================================================
    // Phase 7a: High Priority Methods - Selection
    // ============================================================================

    /**
     * Select a node by its ID.
     *
     * @param nodeId - The ID of the node to select
     * @returns True if the node was found and selected, false otherwise
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * if (element.selectNode('node-1')) {
     *   console.log('Node selected');
     * }
     * ```
     */
    selectNode(nodeId: string | number): boolean {
        return this.#graph.selectNode(nodeId);
    }

    /**
     * Deselect the currently selected node.
     *
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * element.deselectNode();
     * ```
     */
    deselectNode(): void {
        this.#graph.deselectNode();
    }

    /**
     * Get the currently selected node.
     *
     * @returns The selected node, or null if no node is selected
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * const selected = element.getSelectedNode();
     * if (selected) {
     *   console.log('Selected node:', selected.id);
     * }
     * ```
     */
    getSelectedNode(): import("./Node").Node | null {
        return this.#graph.getSelectedNode();
    }

    /**
     * Check if a specific node is selected.
     *
     * @param nodeId - The ID of the node to check
     * @returns True if the node is selected, false otherwise
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * if (element.isNodeSelected('node-1')) {
     *   console.log('Node 1 is selected');
     * }
     * ```
     */
    isNodeSelected(nodeId: string | number): boolean {
        return this.#graph.isNodeSelected(nodeId);
    }

    // ============================================================================
    // Phase 7a: High Priority Methods - Algorithm
    // ============================================================================

    /**
     * Run a graph algorithm.
     *
     * @param namespace - Algorithm namespace (e.g., "graphty")
     * @param type - Algorithm type (e.g., "degree", "pagerank")
     * @param options - Algorithm options
     * @returns Promise that resolves when algorithm completes
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * await element.runAlgorithm('graphty', 'degree');
     * await element.runAlgorithm('graphty', 'pagerank', { applySuggestedStyles: true });
     * ```
     */
    async runAlgorithm(
        namespace: string,
        type: string,
        options?: import("./utils/queue-migration").RunAlgorithmOptions,
    ): Promise<void> {
        return this.#graph.runAlgorithm(namespace, type, options);
    }

    /**
     * Apply suggested styles from an algorithm.
     *
     * @param algorithmKey - Algorithm key (e.g., "graphty:degree")
     * @param options - Options for applying styles
     * @returns True if styles were applied, false otherwise
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * await element.runAlgorithm('graphty', 'degree');
     * element.applySuggestedStyles('graphty:degree');
     * ```
     */
    applySuggestedStyles(
        algorithmKey: string | string[],
        options?: import("./config").ApplySuggestedStylesOptions,
    ): boolean {
        return this.#graph.applySuggestedStyles(algorithmKey, options);
    }

    /**
     * Get suggested styles for an algorithm without applying them.
     *
     * @param algorithmKey - Algorithm key (e.g., "graphty:degree")
     * @returns Suggested styles config, or null if none exist
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * const styles = element.getSuggestedStyles('graphty:degree');
     * if (styles) {
     *   console.log('Available style layers:', styles.layers.length);
     * }
     * ```
     */
    getSuggestedStyles(algorithmKey: string): import("./config").SuggestedStylesConfig | null {
        return this.#graph.getSuggestedStyles(algorithmKey);
    }

    // ============================================================================
    // Phase 7a: High Priority Methods - Style
    // ============================================================================

    /**
     * Set the style template.
     *
     * @param template - Style template configuration
     * @param options - Queue options
     * @returns Promise that resolves with the applied styles
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * await element.setStyleTemplate({
     *   node: { color: '#ff6600', size: 1.5 }
     * });
     * ```
     */
    async setStyleTemplate(
        template: StyleSchema,
        options?: import("./utils/queue-migration").QueueableOptions,
    ): Promise<import("./Styles").Styles> {
        return this.#graph.setStyleTemplate(template, options);
    }

    /**
     * Get the style manager for advanced style manipulation.
     *
     * @returns The style manager instance
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * const styleManager = element.getStyleManager();
     * styleManager.addLayer({
     *   selector: '[?type == "important"]',
     *   styles: { node: { color: '#ff0000' } }
     * });
     * ```
     */
    getStyleManager(): import("./managers/StyleManager").StyleManager {
        return this.#graph.getStyleManager();
    }

    // ============================================================================
    // Phase 7a: High Priority Methods - Layout
    // ============================================================================

    /**
     * Set the layout algorithm.
     *
     * @param type - Layout algorithm name
     * @param opts - Layout-specific options
     * @param options - Queue options
     * @returns Promise that resolves when layout is initialized
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * await element.setLayout('circular', { radius: 5 });
     * await element.setLayout('ngraph', { springLength: 100 });
     * ```
     */
    async setLayout(
        type: string,
        opts?: object,
        options?: import("./utils/queue-migration").QueueableOptions,
    ): Promise<void> {
        return this.#graph.setLayout(type, opts ?? {}, options);
    }

    // ============================================================================
    // Phase 7a: High Priority Methods - Utility
    // ============================================================================

    /**
     * Zoom the camera to fit all nodes in view.
     *
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * await element.waitForSettled();
     * element.zoomToFit();
     * ```
     */
    zoomToFit(): void {
        this.#graph.zoomToFit();
    }

    /**
     * Wait for all operations to complete and layout to stabilize.
     *
     * @returns Promise that resolves when all operations are complete
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * await element.addNodes(nodes);
     * await element.waitForSettled();
     * console.log('Graph is ready');
     * ```
     */
    async waitForSettled(): Promise<void> {
        return this.#graph.waitForSettled();
    }

    /**
     * Execute multiple operations as a batch.
     *
     * @param fn - Function containing batch operations
     * @returns Promise that resolves when batch completes
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * await element.batchOperations(async () => {
     *   await element.addNodes(nodes);
     *   await element.addEdges(edges);
     *   await element.setLayout('circular');
     * });
     * ```
     */
    async batchOperations(fn: () => Promise<void> | void): Promise<void> {
        return this.#graph.batchOperations(fn);
    }

    // ============================================================================
    // Phase 7a: High Priority Methods - Events
    // ============================================================================

    /**
     * Subscribe to graph events.
     *
     * @param type - Event type to listen for
     * @param callback - Callback function
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * element.on('graph-settled', () => {
     *   console.log('Graph layout has settled');
     * });
     * ```
     */
    on(
        type: import("./events").EventType,
        callback: import("./events").EventCallbackType,
    ): void {
        this.#graph.on(type, callback);
    }

    /**
     * Subscribe to graph events (alias for on).
     *
     * @param type - Event type to listen for
     * @param callback - Callback function
     * @since 1.5.0
     */
    addListener(
        type: import("./events").EventType,
        callback: import("./events").EventCallbackType,
    ): void {
        this.#graph.addListener(type, callback);
    }

    /**
     * Get the total number of registered event listeners.
     *
     * @returns Number of registered listeners
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * console.log('Active listeners:', element.listenerCount());
     * ```
     */
    listenerCount(): number {
        return this.#graph.listenerCount();
    }

    // ============================================================================
    // Phase 7b: Medium Priority Methods - View
    // ============================================================================

    /**
     * Check if the graph is in 2D mode.
     *
     * @returns True if in 2D mode, false otherwise
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * if (element.is2D()) {
     *   console.log('Graph is in 2D mode');
     * }
     * ```
     */
    is2D(): boolean {
        return this.#graph.is2D();
    }

    // ============================================================================
    // Phase 7b: Medium Priority Methods - XR
    // ============================================================================

    /**
     * Set XR (VR/AR) configuration.
     *
     * @param config - XR configuration
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * element.setXRConfig({
     *   enabled: true,
     *   ui: { enabled: true, position: 'bottom-right' }
     * });
     * ```
     */
    setXRConfig(config: PartialXRConfig): void {
        this.#graph.setXRConfig(config);
    }

    /**
     * Get the current XR configuration.
     *
     * @returns The current XR configuration, or undefined if not set
     * @since 1.5.0
     */
    getXRConfig(): import("./config/XRConfig").XRConfig | undefined {
        return this.#graph.getXRConfig();
    }

    /**
     * Exit XR (VR/AR) mode.
     *
     * @returns Promise that resolves when XR session ends
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * await element.exitXR();
     * ```
     */
    async exitXR(): Promise<void> {
        return this.#graph.exitXR();
    }

    // ============================================================================
    // Phase 7b: Medium Priority Methods - Camera
    // ============================================================================

    /**
     * Resolve a camera preset to a CameraState.
     *
     * @param preset - Preset name (e.g., "fitToGraph", "topView")
     * @returns The resolved camera state
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * const state = element.resolveCameraPreset('topView');
     * await element.setCameraState(state, { animate: true });
     * ```
     */
    resolveCameraPreset(preset: string): import("./screenshot/types.js").CameraState {
        return this.#graph.resolveCameraPreset(preset);
    }

    // ============================================================================
    // Phase 7b: Medium Priority Methods - Input
    // ============================================================================

    /**
     * Enable or disable user input.
     *
     * @param enabled - Whether input should be enabled
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * element.setInputEnabled(false); // Disable interaction
     * ```
     */
    setInputEnabled(enabled: boolean): void {
        this.#graph.setInputEnabled(enabled);
    }

    // ============================================================================
    // Phase 7b: Medium Priority Methods - Lifecycle
    // ============================================================================

    /**
     * Shut down the graph and release resources.
     *
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * element.shutdown();
     * ```
     */
    shutdown(): void {
        this.#graph.shutdown();
    }

    /**
     * Check if the graph is running.
     *
     * @returns True if the graph is running, false otherwise
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * if (element.isRunning()) {
     *   console.log('Graph is active');
     * }
     * ```
     */
    isRunning(): boolean {
        return this.#graph.isRunning();
    }

    // ============================================================================
    // Phase 7b: Medium Priority Methods - Coordinate Transform
    // ============================================================================

    /**
     * Convert world coordinates to screen coordinates.
     *
     * @param worldPos - Position in world space
     * @returns Position in screen space
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * const node = element.getNode('node-1');
     * const screenPos = element.worldToScreen({
     *   x: node.mesh.position.x,
     *   y: node.mesh.position.y,
     *   z: node.mesh.position.z
     * });
     * // Position a tooltip at screenPos
     * ```
     */
    worldToScreen(worldPos: {x: number, y: number, z: number}): {x: number, y: number} {
        return this.#graph.worldToScreen(worldPos);
    }

    /**
     * Convert screen coordinates to world coordinates.
     *
     * @param screenPos - Position in screen space
     * @returns Position in world space, or null if not found
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * const worldPos = element.screenToWorld({ x: 100, y: 200 });
     * if (worldPos) {
     *   console.log('World position:', worldPos);
     * }
     * ```
     */
    screenToWorld(screenPos: {x: number, y: number}): {x: number, y: number, z: number} | null {
        return this.#graph.screenToWorld(screenPos);
    }

    // ============================================================================
    // Additional Data Methods
    // ============================================================================

    /**
     * Set graph data (both nodes and edges) at once.
     *
     * @param data - Object containing nodes and edges arrays
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * element.setData({
     *   nodes: [{ id: 'a' }, { id: 'b' }],
     *   edges: [{ source: 'a', target: 'b' }]
     * });
     * ```
     */
    setData(data: {nodes: Record<string, unknown>[], edges: Record<string, unknown>[]}): void {
        this.#graph.setData(data);
    }

    // ============================================================================
    // Manager Accessors
    // ============================================================================

    /**
     * Get the Styles object for direct style access.
     *
     * @returns The Styles object
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * const styles = element.getStyles();
     * console.log('Background color:', styles.config.graph.background.color);
     * ```
     */
    getStyles(): import("./Styles").Styles {
        return this.#graph.getStyles();
    }

    /**
     * Get the DataManager for advanced data operations.
     *
     * @returns The DataManager instance
     * @since 1.5.0
     */
    getDataManager(): import("./managers/DataManager").DataManager {
        return this.#graph.getDataManager();
    }

    /**
     * Get the LayoutManager for advanced layout operations.
     *
     * @returns The LayoutManager instance
     * @since 1.5.0
     */
    getLayoutManager(): import("./managers/LayoutManager").LayoutManager {
        return this.#graph.getLayoutManager();
    }

    /**
     * Get the UpdateManager for update scheduling.
     *
     * @returns The UpdateManager instance
     * @since 1.5.0
     */
    getUpdateManager(): import("./managers/UpdateManager").UpdateManager {
        return this.#graph.getUpdateManager();
    }

    /**
     * Get the StatsManager for performance statistics.
     *
     * @returns The StatsManager instance
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * const stats = element.getStatsManager();
     * console.log('FPS:', stats.getSnapshot().fps);
     * ```
     */
    getStatsManager(): import("./managers/StatsManager").StatsManager {
        return this.#graph.getStatsManager();
    }

    /**
     * Get the SelectionManager for selection operations.
     *
     * @returns The SelectionManager instance
     * @since 1.5.0
     */
    getSelectionManager(): import("./managers/SelectionManager").SelectionManager {
        return this.#graph.getSelectionManager();
    }

    /**
     * Get the EventManager for event operations.
     *
     * @returns The EventManager instance
     * @since 1.5.0
     */
    getEventManager(): import("./managers/EventManager").EventManager {
        return this.#graph.getEventManager();
    }

    /**
     * Get the Babylon.js Scene for advanced rendering operations.
     *
     * @returns The Babylon.js Scene
     * @since 1.5.0
     */
    getScene(): import("@babylonjs/core").Scene {
        return this.#graph.getScene();
    }

    /**
     * Get the MeshCache for mesh management.
     *
     * @returns The MeshCache instance
     * @since 1.5.0
     */
    getMeshCache(): import("./meshes/MeshCache").MeshCache {
        return this.#graph.getMeshCache();
    }

    // ============================================================================
    // Camera and Rendering
    // ============================================================================

    /**
     * Set the camera mode.
     *
     * @param mode - Camera mode key
     * @param options - Queue options
     * @returns Promise that resolves when camera mode is set
     * @since 1.5.0
     */
    async setCameraMode(
        mode: import("./cameras/CameraManager").CameraKey,
        options?: import("./utils/queue-migration").QueueableOptions,
    ): Promise<void> {
        return this.#graph.setCameraMode(mode, options);
    }

    /**
     * Get the current camera controller.
     *
     * @returns The camera controller, or null if not available
     * @since 1.5.0
     */
    getCameraController(): import("./cameras/CameraManager").CameraController | null {
        return this.#graph.getCameraController();
    }

    /**
     * Set render settings for advanced rendering control.
     *
     * @param settings - Render settings object
     * @param options - Queue options
     * @returns Promise that resolves when settings are applied
     * @since 1.5.0
     */
    async setRenderSettings(
        settings: Record<string, unknown>,
        options?: import("./utils/queue-migration").QueueableOptions,
    ): Promise<void> {
        return this.#graph.setRenderSettings(settings, options);
    }

    /**
     * Get a node's mesh by its ID.
     *
     * @param nodeId - The ID of the node
     * @returns The node's mesh, or null if not found
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * const mesh = element.getNodeMesh('node-1');
     * if (mesh) {
     *   console.log('Node position:', mesh.position);
     * }
     * ```
     */
    getNodeMesh(nodeId: string): import("@babylonjs/core").AbstractMesh | null {
        return this.#graph.getNodeMesh(nodeId);
    }

    /**
     * Get the XR session manager.
     *
     * @returns The XR session manager, or undefined if not initialized
     * @since 1.5.0
     */
    getXRSessionManager(): import("./xr/XRSessionManager").XRSessionManager | undefined {
        return this.#graph.getXRSessionManager();
    }

    // ============================================================================
    // AI Control Methods
    // ============================================================================

    /**
     * Enable AI control for the graph.
     *
     * @param config - AI manager configuration
     * @returns Promise that resolves when AI is enabled
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * await element.enableAiControl({
     *   provider: { type: 'openai', apiKey: 'your-api-key' }
     * });
     * ```
     */
    async enableAiControl(config: import("./ai/AiManager").AiManagerConfig): Promise<void> {
        return this.#graph.enableAiControl(config);
    }

    /**
     * Disable AI control for the graph.
     *
     * @since 1.5.0
     */
    disableAiControl(): void {
        this.#graph.disableAiControl();
    }

    /**
     * Send a command to the AI assistant.
     *
     * @param message - The command message
     * @returns Promise with the execution result
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * const result = await element.aiCommand('Show me the most connected nodes');
     * console.log('AI response:', result.message);
     * ```
     */
    async aiCommand(message: string): Promise<import("./ai/AiController").ExecutionResult> {
        return this.#graph.aiCommand(message);
    }

    /**
     * Get the current AI status.
     *
     * @returns The AI status, or null if AI is not enabled
     * @since 1.5.0
     */
    getAiStatus(): import("./ai/AiStatus").AiStatus | null {
        return this.#graph.getAiStatus();
    }

    /**
     * Subscribe to AI status changes.
     *
     * @param callback - Callback function for status changes
     * @returns Unsubscribe function
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * const unsubscribe = element.onAiStatusChange((status) => {
     *   console.log('AI state:', status.state);
     * });
     * // Later: unsubscribe();
     * ```
     */
    onAiStatusChange(callback: import("./ai/AiStatus").StatusChangeCallback): () => void {
        return this.#graph.onAiStatusChange(callback);
    }

    /**
     * Cancel the current AI command.
     *
     * @since 1.5.0
     */
    cancelAiCommand(): void {
        this.#graph.cancelAiCommand();
    }

    /**
     * Get the AI manager.
     *
     * @returns The AI manager, or null if not enabled
     * @since 1.5.0
     */
    getAiManager(): import("./ai/AiManager").AiManager | null {
        return this.#graph.getAiManager();
    }

    /**
     * Check if AI control is enabled.
     *
     * @returns True if AI is enabled
     * @since 1.5.0
     */
    isAiEnabled(): boolean {
        return this.#graph.isAiEnabled();
    }

    /**
     * Retry the last AI command that failed.
     *
     * @returns Promise with the execution result
     * @since 1.5.0
     */
    async retryLastAiCommand(): Promise<import("./ai/AiController").ExecutionResult> {
        return this.#graph.retryLastAiCommand();
    }

    /**
     * Get the API key manager.
     *
     * @returns The API key manager, or null if not created
     * @since 1.5.0
     */
    getApiKeyManager(): import("./ai/keys/ApiKeyManager").ApiKeyManager | null {
        return this.#graph.getApiKeyManager();
    }

    /**
     * Create an API key manager for persistent key storage.
     * This is a static method - the manager is not tied to any specific graph instance.
     *
     * @returns The created API key manager
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * const keyManager = Graphty.createApiKeyManager();
     * await keyManager.setKey('openai', 'your-api-key');
     * ```
     */
    static createApiKeyManager(): import("./ai/keys/ApiKeyManager").ApiKeyManager {
        return Graph.createApiKeyManager();
    }

    /**
     * Get the voice input adapter.
     *
     * @returns The voice input adapter
     * @since 1.5.0
     */
    getVoiceAdapter(): import("./ai/input/VoiceInputAdapter").VoiceInputAdapter {
        return this.#graph.getVoiceAdapter();
    }

    /**
     * Start voice input for AI commands.
     *
     * @param options - Voice input options
     * @returns True if voice input started successfully
     * @since 1.5.0
     *
     * @example
     * ```typescript
     * const started = element.startVoiceInput({
     *   onTranscript: (text, isFinal) => {
     *     if (isFinal) element.aiCommand(text);
     *   },
     *   onStart: (started) => console.log('Voice started:', started)
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
        return this.#graph.startVoiceInput(options);
    }

    /**
     * Stop voice input.
     *
     * @since 1.5.0
     */
    stopVoiceInput(): void {
        this.#graph.stopVoiceInput();
    }

    /**
     * Check if voice input is active.
     *
     * @returns True if voice input is active
     * @since 1.5.0
     */
    isVoiceActive(): boolean {
        return this.#graph.isVoiceActive();
    }
}

// Type alias for easier importing
export type GraphtyElement = Graphty;
