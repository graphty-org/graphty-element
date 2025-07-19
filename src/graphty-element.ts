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

    // connectedCallback() {
    //     super.connectedCallback();
    //     this.renderRoot.appendChild(this.#element);
    // }

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

    async asyncFirstUpdated(changedProperties: Map<string, unknown>): Promise<void> {
        // Forward internal graph events as DOM events
        this.#graph.addListener("graph-settled", (event) => {
            this.dispatchEvent(new CustomEvent("graph-settled", {
                detail: event,
                bubbles: true,
                composed: true,
            }));
        });
        // Set runAlgorithmsOnLoad BEFORE setting style template
        if (changedProperties.has("runAlgorithmsOnLoad") && this.runAlgorithmsOnLoad !== undefined) {
            this.#graph.runAlgorithmsOnLoad = true;
        }

        // Set style template after runAlgorithmsOnLoad so algorithms can run
        if (changedProperties.has("styleTemplate") && this.styleTemplate) {
            await this.#graph.setStyleTemplate(this.styleTemplate);
        }

        if (changedProperties.has("layout2d") && this.layout2d !== undefined) {
            setDeep(this.#graph.styles.config, "graph.twoD", this.layout2d);
        }

        // Always ensure a layout is set - use provided layout or default to "ngraph"
        if (changedProperties.has("layout")) {
            const layoutType = this.layout ?? "ngraph";
            const layoutConfig = this.layoutConfig ?? {};
            await this.#graph.setLayout(layoutType, layoutConfig);
        }

        if (changedProperties.has("nodeIdPath") && this.nodeIdPath) {
            setDeep(this.#graph.styles.config, "data.knownFields.nodeIdPath", this.nodeIdPath);
        }

        if (changedProperties.has("edgeSrcIdPath") && this.edgeSrcIdPath) {
            setDeep(this.#graph.styles.config, "data.knownFields.edgeSrcIdPath", this.edgeSrcIdPath);
        }

        if (changedProperties.has("edgeDstIdPath") && this.edgeDstIdPath) {
            setDeep(this.#graph.styles.config, "data.knownFields.edgeDstIdPath", this.edgeDstIdPath);
        }

        // Load data BEFORE initialization (original working order)
        if (changedProperties.has("nodeData") && Array.isArray(this.nodeData)) {
            this.#graph.addNodes(this.nodeData);
        }

        if (changedProperties.has("edgeData") && Array.isArray(this.edgeData)) {
            this.#graph.addEdges(this.edgeData);
        }

        // Initialize the graph AFTER loading data
        await this.#graph.init();

        // Wait for first render frame to ensure graph is visible
        await new Promise((resolve) => requestAnimationFrame(() => {
            requestAnimationFrame(resolve);
        }));

        if (changedProperties.has("dataSource") && this.dataSource) {
            const sourceOpts = this.dataSourceConfig ?? {};
            await this.#graph.addDataFromSource(this.dataSource, sourceOpts);
        }

        // Run algorithms after all data has been loaded
        await this.#graph.runAlgorithmsFromTemplate();

        this.#graph.engine.resize();
    }

    render(): Element {
        return this.#element;
    }

    disconnectedCallback(): void {
        this.#graph.shutdown();
    }

    /**
     * An array of objects describing the node data.
     * The path to the unique ID for the node is `.id` unless
     * otherwise specified in `known-properties`.
     */
    @property({attribute: "node-data"})
    nodeData?: Record<string, unknown>[];

    /**
     * An array of objects describing the edge data.
     * The path to the source node ID and destination node ID are `src` and
     * `dst` (respectively) unless otherwise specified in `known-properties`.
     */
    @property({attribute: "edge-data"})
    edgeData?: Record<string, unknown>[];

    /**
     * The type of data source (e.g. "json"). See documentation for
     * data sources for more information.
     */
    @property({attribute: "data-source"})
    dataSource?: string;

    /**
     * The configuration for the data source. See documentation for
     * data sources for more information.
     */
    @property({attribute: "data-source-config"})
    dataSourceConfig?: Record<string, unknown>;

    /**
     * A jmespath string that can be used to select the unique node identifier
     * for each node. Defaults to "id", as in `{id: 42}` is the identifier of
     * the node.
     */
    @property({attribute: "node-id-path"})
    nodeIdPath?: string;

    /**
     * Similar to the nodeIdPath property / node-id-path attribute, this is a
     * jmespath that describes where to find the source node identifier for this edge.
     * Defaults to "src", as in `{src: 42, dst: 31337}`
     */
    @property({attribute: "edge-src-id-path"})
    edgeSrcIdPath?: string;

    /**
     * Similar to the nodeIdPath property / node-id-path attribute, this is a
     * jmespath that describes where to find the desination node identifier for this edge.
     * Defaults to "dst", as in `{src: 42, dst: 31337}`
     */
    @property({attribute: "edge-dst-id-path"})
    edgeDstIdPath?: string;

    /**
     * Specifies which type of layout to use. See the layout documentation for
     * more information.
     */
    @property()
    layout?: string;

    /**
     * Specifies which type of layout to use. See the layout documentation for
     * more information.
     */
    @property({attribute: "layout-config"})
    layoutConfig?: Record<string, unknown>;

    /**
     * Specifies that the layout should be rendered in two dimensions (as
     * opposed to 3D)
     */
    @property({attribute: "layout-2d"})
    layout2d?: boolean;

    /**
     * Specifies that the layout should be rendered in two dimensions (as
     * opposed to 3D)
     */
    @property({attribute: "style-template"})
    styleTemplate?: StyleSchema;

    /**
     * Whether or not to run all algorithims in a style template when the
     * template is loaded
     */
    @property({attribute: "run-algorithms-on-load"})
    runAlgorithmsOnLoad?: boolean;
}
