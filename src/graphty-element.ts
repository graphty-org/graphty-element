// WORKAROUND: Import InstancedMesh side-effect first
// See: https://github.com/graphty-org/graphty-element/issues/54
import "@babylonjs/core/Meshes/instancedMesh";

import {LitElement} from "lit";
import {customElement, property} from "lit/decorators.js";
import {set as setDeep} from "lodash";

import type {StyleSchema} from "./config";
import {Graph} from "./Graph";
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
        this.#element.setAttribute("style", "width: 100%; height: 100%; display: block;");
        this.#graph = new Graph(this.#element);
    }

    connectedCallback(): void {
        super.connectedCallback();
        this.renderRoot.appendChild(this.#element);

        // Watch for container size changes and resize the canvas accordingly
        this.#resizeObserver = new ResizeObserver(() => {
            // Resize the Babylon.js engine when the container size changes
            this.#graph.engine.resize();
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
        // Forward internal graph events as DOM events
        this.#graph.addListener("graph-settled", (event) => {
            this.dispatchEvent(new CustomEvent("graph-settled", {
                detail: event,
                bubbles: true,
                composed: true,
            }));
        });

        this.#graph.addListener("skybox-loaded", (event) => {
            this.dispatchEvent(new CustomEvent("skybox-loaded", {
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
    #layout2d?: boolean;
    #styleTemplate?: StyleSchema;
    #runAlgorithmsOnLoad?: boolean;

    /**
     * An array of objects describing the node data.
     * The path to the unique ID for the node is `.id` unless
     * otherwise specified in `known-properties`.
     *
     * @remarks
     * **Important**: Setting this property REPLACES all existing nodes with the new data.
     * To add nodes incrementally without replacing existing ones, use the
     * `graph.addNodes()` method instead.
     *
     * @example
     * ```typescript
     * // Replace all nodes (this is what the property setter does)
     * element.nodeData = [{id: "1"}, {id: "2"}];
     *
     * // Add nodes incrementally (use the API method)
     * await element.graph.addNodes([{id: "3"}, {id: "4"}]);
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
     * An array of objects describing the edge data.
     * The path to the source node ID and destination node ID are `src` and
     * `dst` (respectively) unless otherwise specified in `known-properties`.
     *
     * @remarks
     * **Important**: Setting this property REPLACES all existing edges with the new data.
     * To add edges incrementally without replacing existing ones, use the
     * `graph.addEdges()` method instead.
     *
     * @example
     * ```typescript
     * // Replace all edges (this is what the property setter does)
     * element.edgeData = [{src: "1", dst: "2"}];
     *
     * // Add edges incrementally (use the API method)
     * await element.graph.addEdges([{source: "2", target: "3"}], "source", "target");
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
     * Specifies which type of layout to use. See the layout documentation for
     * more information.
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
     * Specifies that the layout should be rendered in two dimensions (as
     * opposed to 3D)
     */
    @property({attribute: "layout-2d"})
    get layout2d(): boolean | undefined {
        return this.#layout2d;
    }
    set layout2d(value: boolean | undefined) {
        const oldValue = this.#layout2d;
        this.#layout2d = value;

        if (value !== undefined) {
            setDeep(this.#graph.styles.config, "graph.twoD", value);
        }

        this.requestUpdate("layout2d", oldValue);
    }

    /**
     * Specifies that the layout should be rendered in two dimensions (as
     * opposed to 3D)
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
}

// Type alias for easier importing
export type GraphtyElement = Graphty;
