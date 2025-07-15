import {NullEngine, Scene} from "@babylonjs/core";

import {Graph} from "../../src/Graph";

/**
 * Creates a test graph instance with NullEngine
 * This provides a real Graph instance without needing to render
 */
export async function createTestGraph(): Promise<Graph> {
    // Create a container element
    const container = document.createElement("div");
    container.id = "test-graph-container";
    document.body.appendChild(container);

    // Create graph instance
    const graph = new Graph(container);

    // Override engine creation to use NullEngine
    const graphWithEngine = graph as Graph & {createEngine: () => unknown, engine: unknown};
    const originalCreateEngine = graphWithEngine.createEngine;
    graphWithEngine.createEngine = function() {
        this.engine = new NullEngine();
        return this.engine;
    };

    // Initialize
    await graph.init();

    // Restore original method
    graphWithEngine.createEngine = originalCreateEngine;

    return graph;
}

/**
 * Creates a minimal test scene with NullEngine
 */
export function createTestScene(): Scene {
    const engine = new NullEngine();
    return new Scene(engine);
}

/**
 * Cleans up test graph instance
 */
export function cleanupTestGraph(graph: Graph): void {
    graph.shutdown();
    const container = document.getElementById("test-graph-container");
    if (container) {
        container.remove();
    }
}
