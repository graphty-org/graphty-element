import type {AdHocData} from "../../../src/config/common";
import {Graph} from "../../../src/Graph";

export async function createTestGraphWithData(): Promise<Graph> {
    // Create a container element
    const container = document.createElement("div");
    container.id = "test-graph-container-screenshot";
    container.style.width = "800px";
    container.style.height = "600px";
    document.body.appendChild(container);

    // Create graph instance - engine creation handled automatically
    const graph = new Graph(container);

    // Initialize
    await graph.init();

    // Add some test data
    const dataManager = graph.getDataManager();
    dataManager.addNode({id: "1", label: "Node 1"} as unknown as AdHocData);
    dataManager.addNode({id: "2", label: "Node 2"} as unknown as AdHocData);
    dataManager.addNode({id: "3", label: "Node 3"} as unknown as AdHocData);
    dataManager.addEdge({src: "1", dst: "2"} as unknown as AdHocData);
    dataManager.addEdge({src: "2", dst: "3"} as unknown as AdHocData);

    // Set fixed layout so layout is immediately settled
    // This prevents waitForLayoutSettle from timing out
    await graph.setLayout("fixed");

    // Wait for initial render
    await new Promise((resolve) => setTimeout(resolve, 100));

    return graph;
}

export function cleanupTestGraphWithData(graph: Graph): void {
    graph.shutdown();
    const container = document.getElementById("test-graph-container-screenshot");
    if (container) {
        container.remove();
    }
}
