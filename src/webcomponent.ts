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
    }

    async firstUpdated(changedProperties: Map<string, unknown>) {
        super.firstUpdated(changedProperties);

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
     * The type of data provider (e.g. "json"). See documentation for
     * data providers for more information.
     */
    @property({attribute: "data-provider"})
    dataProvider?: string;

    /**
     * The configuration for the data provider. See documentation for
     * data providers for more information.
     */
    @property({attribute: "data-provider-config"})
    dataProviderConfig?: { [x: string]: unknown; };
}
