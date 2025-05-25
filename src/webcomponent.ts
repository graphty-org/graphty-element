/**
 * Graphty creates a graph
 */
export class Graphty extends HTMLElement {
    connectedCallback() {
        this.innerHTML = "<p>Placeholder: Graphty goes here.</p>";
    }

    /**
     * This is my thing description
     * @default false
     */
    get thing(): boolean {
        return true;
    }

    set thing(_v: boolean) {}
}

window.customElements.define("graphty-core", Graphty);
