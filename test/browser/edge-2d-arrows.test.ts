import {StandardMaterial} from "@babylonjs/core";
import {assert, beforeEach, describe, test} from "vitest";

import {Graph} from "../../src/Graph";

describe("Edge 2D Arrows Integration", () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.append(container);
    });

    test("Arrow head uses 2D material in 2D mode with diamond type", async() => {
        const graph = new Graph(container);

        // Set 2D mode via style template
        await graph.setStyleTemplate({
            graphtyTemplate: true,
            majorVersion: "1",
            graph: {
                twoD: true,
                addDefaultStyle: true,
            },
            layers: [
                {
                    edge: {
                        selector: "",
                        style: {
                            line: {
                                color: "#666666",
                                width: 0.05,
                            },
                            arrowHead: {
                                type: "diamond",
                                color: "#ff0000",
                            },
                        },
                    },
                },
            ],
        });

        // Wait for style template operation to complete
        await graph.operationQueue.waitForCompletion();

        // Add nodes
        await graph.addNode({id: "node1", x: 0, y: 0, z: 0});
        await graph.addNode({id: "node2", x: 1, y: 0, z: 0});

        // Add edge with source and target path parameters
        await graph.addEdge({id: "edge1", source: "node1", target: "node2"}, "source", "target");

        // Wait for all operations to complete
        await graph.operationQueue.waitForCompletion();

        // Wait for graph to settle
        await new Promise((resolve) => {
            setTimeout(resolve, 100);
        });

        // Get the edge from dataManager
        const edge = graph.dataManager.edges.get("node1:node2");
        assert(edge, "Edge should exist in dataManager");

        // Verify arrow head exists
        assert(edge.arrowMesh, "Arrow head should exist");

        // Verify arrow head uses StandardMaterial
        assert(
            edge.arrowMesh.material instanceof StandardMaterial,
            "Arrow head should use StandardMaterial in 2D mode",
        );

        // Verify arrow head is marked as 2D
        assert.strictEqual(edge.arrowMesh.metadata?.is2D, true, "Arrow head should be marked as 2D");

        // Verify rotation to XY plane
        assert.strictEqual(edge.arrowMesh.rotation.x, Math.PI / 2, "Arrow head should be rotated to XY plane");

        // Cleanup
        graph.dispose();
    });

    test("Arrow head uses 2D material in 2D mode with normal type", async() => {
        const graph = new Graph(container);

        await graph.setStyleTemplate({
            graphtyTemplate: true,
            majorVersion: "1",
            graph: {
                twoD: true,
                addDefaultStyle: true,
            },
            layers: [
                {
                    edge: {
                        selector: "",
                        style: {
                            arrowHead: {
                                type: "normal",
                            },
                        },
                    },
                },
            ],
        });

        await graph.operationQueue.waitForCompletion();

        await graph.addNode({id: "node1", x: 0, y: 0, z: 0});
        await graph.addNode({id: "node2", x: 1, y: 0, z: 0});
        await graph.addEdge({id: "edge1", source: "node1", target: "node2"}, "source", "target");

        await graph.operationQueue.waitForCompletion();

        await new Promise((resolve) => {
            setTimeout(resolve, 100);
        });

        const edge = graph.dataManager.edges.get("node1:node2");
        assert(edge, "Edge should exist");
        assert(edge.arrowMesh, "Arrow head should exist");
        assert(
            edge.arrowMesh.material instanceof StandardMaterial,
            "Normal arrow should use StandardMaterial in 2D mode",
        );
        assert.strictEqual(edge.arrowMesh.metadata?.is2D, true, "Arrow should be marked as 2D");

        graph.dispose();
    });

    test("Arrow head uses 2D material in 2D mode with box type", async() => {
        const graph = new Graph(container);

        await graph.setStyleTemplate({
            graphtyTemplate: true,
            majorVersion: "1",
            graph: {
                twoD: true,
                addDefaultStyle: true,
            },
            layers: [
                {
                    edge: {
                        selector: "",
                        style: {
                            arrowHead: {
                                type: "box",
                            },
                        },
                    },
                },
            ],
        });

        await graph.operationQueue.waitForCompletion();

        await graph.addNode({id: "node1", x: 0, y: 0, z: 0});
        await graph.addNode({id: "node2", x: 1, y: 0, z: 0});
        await graph.addEdge({id: "edge1", source: "node1", target: "node2"}, "source", "target");

        await graph.operationQueue.waitForCompletion();

        await new Promise((resolve) => {
            setTimeout(resolve, 100);
        });

        const edge = graph.dataManager.edges.get("node1:node2");
        assert(edge, "Edge should exist");
        assert(edge.arrowMesh, "Arrow head should exist");
        assert(
            edge.arrowMesh.material instanceof StandardMaterial,
            "Box arrow should use StandardMaterial in 2D mode",
        );
        assert.strictEqual(edge.arrowMesh.metadata?.is2D, true, "Arrow should be marked as 2D");

        graph.dispose();
    });

    test("Arrow head uses 2D material in 2D mode with dot type", async() => {
        const graph = new Graph(container);

        await graph.setStyleTemplate({
            graphtyTemplate: true,
            majorVersion: "1",
            graph: {
                twoD: true,
                addDefaultStyle: true,
            },
            layers: [
                {
                    edge: {
                        selector: "",
                        style: {
                            arrowHead: {
                                type: "dot",
                            },
                        },
                    },
                },
            ],
        });

        await graph.operationQueue.waitForCompletion();

        await graph.addNode({id: "node1", x: 0, y: 0, z: 0});
        await graph.addNode({id: "node2", x: 1, y: 0, z: 0});
        await graph.addEdge({id: "edge1", source: "node1", target: "node2"}, "source", "target");

        await graph.operationQueue.waitForCompletion();

        await new Promise((resolve) => {
            setTimeout(resolve, 100);
        });

        const edge = graph.dataManager.edges.get("node1:node2");
        assert(edge, "Edge should exist");
        assert(edge.arrowMesh, "Arrow head should exist");
        assert(
            edge.arrowMesh.material instanceof StandardMaterial,
            "Dot arrow should use StandardMaterial in 2D mode",
        );
        assert.strictEqual(edge.arrowMesh.metadata?.is2D, true, "Arrow should be marked as 2D");

        graph.dispose();
    });

    test("Arrow head uses 2D material in 2D mode with vee type", async() => {
        const graph = new Graph(container);

        await graph.setStyleTemplate({
            graphtyTemplate: true,
            majorVersion: "1",
            graph: {
                twoD: true,
                addDefaultStyle: true,
            },
            layers: [
                {
                    edge: {
                        selector: "",
                        style: {
                            arrowHead: {
                                type: "vee",
                            },
                        },
                    },
                },
            ],
        });

        await graph.operationQueue.waitForCompletion();

        await graph.addNode({id: "node1", x: 0, y: 0, z: 0});
        await graph.addNode({id: "node2", x: 1, y: 0, z: 0});
        await graph.addEdge({id: "edge1", source: "node1", target: "node2"}, "source", "target");

        await graph.operationQueue.waitForCompletion();

        await new Promise((resolve) => {
            setTimeout(resolve, 100);
        });

        const edge = graph.dataManager.edges.get("node1:node2");
        assert(edge, "Edge should exist");
        assert(edge.arrowMesh, "Arrow head should exist");
        assert(
            edge.arrowMesh.material instanceof StandardMaterial,
            "Vee arrow should use StandardMaterial in 2D mode",
        );
        assert.strictEqual(edge.arrowMesh.metadata?.is2D, true, "Arrow should be marked as 2D");

        graph.dispose();
    });

    test("Arrow head uses 2D material in 2D mode with tee type", async() => {
        const graph = new Graph(container);

        await graph.setStyleTemplate({
            graphtyTemplate: true,
            majorVersion: "1",
            graph: {
                twoD: true,
                addDefaultStyle: true,
            },
            layers: [
                {
                    edge: {
                        selector: "",
                        style: {
                            arrowHead: {
                                type: "tee",
                            },
                        },
                    },
                },
            ],
        });

        await graph.operationQueue.waitForCompletion();

        await graph.addNode({id: "node1", x: 0, y: 0, z: 0});
        await graph.addNode({id: "node2", x: 1, y: 0, z: 0});
        await graph.addEdge({id: "edge1", source: "node1", target: "node2"}, "source", "target");

        await graph.operationQueue.waitForCompletion();

        await new Promise((resolve) => {
            setTimeout(resolve, 100);
        });

        const edge = graph.dataManager.edges.get("node1:node2");
        assert(edge, "Edge should exist");
        assert(edge.arrowMesh, "Arrow head should exist");
        assert(
            edge.arrowMesh.material instanceof StandardMaterial,
            "Tee arrow should use StandardMaterial in 2D mode",
        );
        assert.strictEqual(edge.arrowMesh.metadata?.is2D, true, "Arrow should be marked as 2D");

        graph.dispose();
    });

    test("Arrow head uses 3D shader in 3D mode", async() => {
        const graph = new Graph(container);

        await graph.setStyleTemplate({
            graphtyTemplate: true,
            majorVersion: "1",
            graph: {
                twoD: false,
                addDefaultStyle: true,
            },
            layers: [
                {
                    edge: {
                        selector: "",
                        style: {
                            arrowHead: {
                                type: "diamond",
                            },
                        },
                    },
                },
            ],
        });

        await graph.operationQueue.waitForCompletion();

        await graph.addNode({id: "node1", x: 0, y: 0, z: 0});
        await graph.addNode({id: "node2", x: 1, y: 0, z: 0});
        await graph.addEdge({id: "edge1", source: "node1", target: "node2"}, "source", "target");

        await graph.operationQueue.waitForCompletion();

        await new Promise((resolve) => {
            setTimeout(resolve, 100);
        });

        const edge = graph.dataManager.edges.get("node1:node2");
        assert(edge, "Edge should exist");
        assert(edge.arrowMesh, "Arrow head should exist");

        // Verify arrow head does NOT use StandardMaterial in 3D mode
        assert(
            !(edge.arrowMesh.material instanceof StandardMaterial),
            "Arrow head should NOT use StandardMaterial in 3D mode",
        );

        // Verify arrow head is NOT marked as 2D
        assert(!edge.arrowMesh.metadata?.is2D, "Arrow head should NOT be marked as 2D in 3D mode");

        graph.dispose();
    });
});
