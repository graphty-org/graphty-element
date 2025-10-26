import {LitElement} from "lit";
import {customElement, property} from "lit/decorators.js";
import {set as setDeep} from "lodash";

import type {StyleSchema} from "./config";
import {Graph} from "./Graph";

/**
 * Graphty creates a graph
 */
@customElement("graphty-element")
export class Graphty extends LitElement {
    #graph: Graph;
    #element: Element;

    constructor() {
        super();

        this.#element = document.createElement("div");
        this.#graph = new Graph(this.#element);
    }

    connectedCallback(): void {
        super.connectedCallback();
        this.renderRoot.appendChild(this.#element);
    }

    // update(changedProperties: Map<string, unknown>) {
    //     super.update(changedProperties);
    //     // console.log(`update: ${[... changedProperties.keys()].join(", ")}`);
    // }

    firstUpdated(changedProperties: Map<string, unknown>): void {
        super.firstUpdated(changedProperties);
        // console.log(`firstUpdated: ${[... changedProperties.keys()].join(", ")}`);

        this.asyncFirstUpdated(changedProperties)
            .catch((e: unknown) => {
                throw e;
            });
    }

    async asyncFirstUpdated(_changedProperties: Map<string, unknown>): Promise<void> {
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
        this.#graph.shutdown();
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

        // Forward to Graph method (which queues operation)
        if (value) {
            const sourceOpts = this.#dataSourceConfig ?? {};
            void this.#graph.addDataFromSource(value, sourceOpts);
        }

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
        this.requestUpdate("dataSourceConfig", oldValue);
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

    /**
     * Get the underlying Graph instance for debugging purposes
     */
    get graph(): Graph {
        return this.#graph;
    }
}
