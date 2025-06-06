import {customElement, property} from "lit/decorators.js";
import {LitElement} from "lit";
import {Graph} from "./Graph";

/**
 * Graphty creates a graph
 */
@customElement("graphty-core")
export class Graphty extends LitElement {
    #graph: Graph;
    #element: Element;

    constructor() {
        super();

        this.#element = document.createElement("div");
        this.#graph = new Graph(this.#element);

        this.#graph.addNodes([
            {id: 0},
            {id: 1},
            {id: 2},
            {id: 3},
            {id: 4},
            {id: 5},
        ]);

        this.#graph.addEdges([
            {src: 0, dst: 1},
            {src: 0, dst: 2},
            {src: 2, dst: 3},
            {src: 3, dst: 0},
            {src: 3, dst: 4},
            {src: 3, dst: 5},
        ]);

        // TODO: use lit Task instead
        this.#graph.init()
            .then(() => {
                this.#graph.engine.resize(true);
            })
            .catch((e) => {
                throw e;
            });
    }

    connectedCallback() {
        super.connectedCallback();
        this.renderRoot.appendChild(this.#element);
    }

    render() {
        return this.#element;
    }

    // override createRenderRoot() {
    //     return this;
    // }

    disconnectedCallback() {
        this.#graph?.shutdown();
    }

    /**
     * This is my thing description
     * @default false
     */
    @property()
    thing: boolean = true;

    @property()
    thing3: number = 42;
}
