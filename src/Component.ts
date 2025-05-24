export class Graphty extends HTMLElement {
    connectedCallback() {
        this.innerHTML = "<p>Placeholder: Graphty goes here.</p>";
    }

    get thing() {
        return 1;
    }

    set thing(_v) {}
}

window.customElements.define("graphty-core", Graphty);
