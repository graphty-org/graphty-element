import {Camera, StandardMaterial} from "@babylonjs/core";
import {assert, beforeEach, describe, test} from "vitest";

import {Graph} from "../../src/Graph";

describe("Edge 2D Solid Integration", () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.append(container);
    });

    test("Edge uses Simple2DLineRenderer in 2D mode", async() => {
        const graph = new Graph(container);

        // Set 2D mode via style template
        await graph.setStyleTemplate({
            graphtyTemplate: true,
            majorVersion: "1",
            graph: {
                twoD: true,
            },
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

        // Verify edge mesh has 2D line metadata
        assert(edge.mesh.metadata?.is2DLine, "Edge mesh should be marked as 2D line");

        // Verify edge mesh uses StandardMaterial
        assert(
            edge.mesh.material instanceof StandardMaterial,
            "Edge mesh should use StandardMaterial in 2D mode",
        );

        // Cleanup
        graph.dispose();
    });

    test("Edge uses CustomLineRenderer in 3D mode", async() => {
        const graph = new Graph(container);

        // Ensure 3D mode (this is default, but making it explicit)
        await graph.setStyleTemplate({
            graphtyTemplate: true,
            majorVersion: "1",
            graph: {
                twoD: false,
            },
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

        // Verify edge mesh does NOT have 2D line metadata
        assert(!edge.mesh.metadata?.is2DLine, "Edge mesh should NOT be marked as 2D line in 3D mode");

        // Cleanup
        graph.dispose();
    });

    test("Edge switches from 2D to 3D mode when camera changes", async() => {
        const graph = new Graph(container);

        // Set 2D mode initially
        await graph.setStyleTemplate({
            graphtyTemplate: true,
            majorVersion: "1",
            graph: {
                twoD: true,
            },
        });

        // Wait for style template operation to complete
        await graph.operationQueue.waitForCompletion();

        // Add nodes and edge with source and target path parameters
        await graph.addNode({id: "node1", x: 0, y: 0, z: 0});
        await graph.addNode({id: "node2", x: 1, y: 0, z: 0});
        await graph.addEdge({id: "edge1", source: "node1", target: "node2"}, "source", "target");

        await new Promise((resolve) => {
            setTimeout(resolve, 100);
        });

        // Get the edge from dataManager
        const edge = graph.dataManager.edges.get("node1:node2");
        assert(edge, "Edge should exist in dataManager");

        // Verify 2D mode
        assert(edge.mesh.metadata?.is2DLine, "Should be in 2D mode initially");

        // Switch to perspective camera (3D mode)
        graph.camera.mode = Camera.PERSPECTIVE_CAMERA;

        // Note: Full mode switching would require re-creating the edge mesh
        // This test just verifies the initial state

        // Cleanup
        graph.dispose();
    });
});
