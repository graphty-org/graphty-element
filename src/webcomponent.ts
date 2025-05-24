export class Graphty extends HTMLElement {
    /**
     * @attr {boolean} thing - some random thing that I'm trying out
     */
    connectedCallback() {
        this.innerHTML = "<p>Placeholder: Graphty goes here.</p>";
    }

    get thing() {
        return 1;
    }

    set thing(_v) {}
}

window.customElements.define("graphty-core", Graphty);
