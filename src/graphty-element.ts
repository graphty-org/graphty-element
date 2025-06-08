import {customElement, property} from "lit/decorators.js";
import {LitElement} from "lit";
import {Graph, GraphOptsType} from "../index.ts";

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
        const opts: GraphOptsType = {};

        this.#graph = new Graph(this.#element, opts);
    }

    connectedCallback() {
        super.connectedCallback();
        this.renderRoot.appendChild(this.#element);
    }

    update(changedProperties: Map<string, unknown>) {
        super.update(changedProperties);
        // console.log(`update: ${[... changedProperties.keys()].join(", ")}`);
    }

    async firstUpdated(changedProperties: Map<string, unknown>) {
        super.firstUpdated(changedProperties);
        // console.log(`firstUpdated: ${[... changedProperties.keys()].join(", ")}`);

        if (changedProperties.has("nodeIdPath") && this.nodeIdPath) {
            this.#graph.config.knownFields.nodeIdPath = this.nodeIdPath;
        }

        if (changedProperties.has("edgeSrcIdPath") && this.edgeSrcIdPath) {
            this.#graph.config.knownFields.edgeSrcIdPath = this.edgeSrcIdPath;
        }

        if (changedProperties.has("edgeDstIdPath") && this.edgeDstIdPath) {
            this.#graph.config.knownFields.edgeDstIdPath = this.edgeDstIdPath;
        }

        if (changedProperties.has("nodeData")) {
            const data = this.nodeData;
            if (Array.isArray(data)) {
                this.#graph.addNodes(data);
            }
        }

        if (changedProperties.has("edgeData")) {
            const data = this.edgeData;
            if (Array.isArray(data)) {
                this.#graph.addEdges(data);
            }
        }

        if (changedProperties.has("dataSource")) {
            const source = this.dataSource;
            const sourceOpts = this.dataSourceConfig || {};
            if (source) {
                await this.#graph.addDataFromSource(source, sourceOpts);
            }
        }

        await this.#graph.init();
        this.#graph.engine.resize();
    }

    render() {
        return this.#element;
    }

    disconnectedCallback() {
        this.#graph?.shutdown();
    }

    /**
     * An array of objects describing the node data.
     * The path to the unique ID for the node is `.id` unless
     * otherwise specified in `known-properties`.
     */
    @property({attribute: "node-data"})
    nodeData?: { [x: string]: unknown; }[];

    /**
     * An array of objects describing the edge data.
     * The path to the source node ID and destination node ID are `src` and
     * `dst` (respectively) unless otherwise specified in `known-properties`.
     */
    @property({attribute: "edge-data"})
    edgeData?: { [x: string]: unknown; }[];

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
    dataSourceConfig?: { [x: string]: unknown; };

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
    @property({attribute: "edge-src-id-path"})
    edgeDstIdPath?: string;
}
