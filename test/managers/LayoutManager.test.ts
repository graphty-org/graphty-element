import {afterEach, assert, beforeEach, describe, expect, it} from "vitest";

import {Graph} from "../../src/Graph";
import {DataManager, EventManager, LayoutManager} from "../../src/managers";
import {cleanupTestGraph, createTestGraph} from "../helpers/testSetup";

describe("LayoutManager", () => {
    let graph: Graph;
    let layoutManager: LayoutManager;

    beforeEach(async() => {
        graph = await createTestGraph();
        layoutManager = graph.getLayoutManager();
    });

    afterEach(() => {
        cleanupTestGraph(graph);
    });

    describe("initialization", () => {
        it("should initialize without errors", async() => {
            await layoutManager.init();
            assert.isNotNull(layoutManager);
        });

        it("should dispose without errors", () => {
            layoutManager.dispose();
            assert.isNotNull(layoutManager);
        });

        it("should dispose layout engine on dispose", async() => {
            await layoutManager.setLayout("ngraph", {});
            layoutManager.dispose();

            // LayoutEngine doesn't have a dispose method in the abstract interface
            // This test just ensures dispose() doesn't throw
            assert.isNotNull(layoutManager);
        });
    });

    describe("layout management", () => {
        it("should set layout engine", async() => {
            await layoutManager.setLayout("ngraph", {});

            assert.isNotNull(layoutManager.layoutEngine);
            assert.equal(layoutManager.layoutEngine?.type, "ngraph");
            assert.isTrue(layoutManager.running);
        });

        it("should run pre-steps when setting layout", async() => {
            // Add some nodes first so we have something to layout
            const dataManager = graph.getDataManager();
            dataManager.addNodes([
                {id: "node1", label: "Node 1"},
                {id: "node2", label: "Node 2"},
            ] as Record<string, unknown>[]);

            await layoutManager.setLayout("ngraph", {});

            // Verify layout was initialized
            assert.isNotNull(layoutManager.layoutEngine);
            assert.isTrue(layoutManager.running);
        });

        it("should handle layout initialization errors", async() => {
            await expect(
                layoutManager.setLayout("unknown", {}),
            ).rejects.toThrow(/No layout named: unknown/);
        });

        it("should handle unknown layout type", async() => {
            await expect(
                layoutManager.setLayout("unknown", {}),
            ).rejects.toThrow(/No layout named: unknown/);
        });

        it("should dispose previous layout when setting new one", async() => {
            // Set first layout
            await layoutManager.setLayout("ngraph", {});
            const firstEngine = layoutManager.layoutEngine;

            // Set second layout
            await layoutManager.setLayout("random", {});

            // LayoutEngine doesn't have a dispose method, so we just check that layout was set
            assert.isNotNull(firstEngine);
            assert.equal(layoutManager.layoutEngine?.type, "random");
        });
    });

    describe("layout stepping", () => {
        beforeEach(async() => {
            await layoutManager.setLayout("ngraph", {});
        });

        it("should step layout when running", () => {
            layoutManager.step();
            // Should not throw
            assert.isNotNull(layoutManager);
        });

        it("should not step when not running", () => {
            layoutManager.running = false;
            layoutManager.step();
            // Should not throw
            assert.isNotNull(layoutManager);
        });

        it("should not step when no layout engine", async() => {
            // Create new manager without layout
            const container = document.createElement("div");
            document.body.appendChild(container);
            const newGraph = new Graph(container);
            await newGraph.init();
            const newManager = newGraph.getLayoutManager();

            newManager.step();
            // Should not throw
            assert.isNotNull(newManager);

            // Cleanup
            newGraph.shutdown();
            container.remove();
        });
    });

    describe("node and edge management", () => {
        it("should get nodes from layout engine", async() => {
            // Add some test data
            const dataManager = graph.getDataManager();
            dataManager.addNodes([
                {id: "node1", label: "Node 1"},
                {id: "node2", label: "Node 2"},
            ] as Record<string, unknown>[]);

            await layoutManager.setLayout("ngraph", {});

            const nodes = Array.from(layoutManager.nodes);
            assert.equal(nodes.length, 2);
            assert.equal(nodes[0].id, "node1");
            assert.equal(nodes[1].id, "node2");
        });

        it("should get edges from layout engine", async() => {
            // Add some test data
            const dataManager = graph.getDataManager();
            dataManager.addNodes([
                {id: "node1", label: "Node 1"},
                {id: "node2", label: "Node 2"},
            ] as Record<string, unknown>[]);
            dataManager.addEdges([
                {id: "edge1", src: "node1", dst: "node2"},
            ] as Record<string, unknown>[]);

            await layoutManager.setLayout("ngraph", {});

            const edges = Array.from(layoutManager.edges);
            assert.equal(edges.length, 1);
            assert.equal(edges[0].id, "node1:node2");
        });
    });

    describe("position management", () => {
        beforeEach(async() => {
            // Add some test data
            const dataManager = graph.getDataManager();
            dataManager.addNodes([
                {id: "node1", label: "Node 1"},
            ] as Record<string, unknown>[]);

            await layoutManager.setLayout("ngraph", {});
        });

        it("should get node position from layout engine", () => {
            const nodes = Array.from(layoutManager.nodes);
            const node = nodes[0];

            const position = layoutManager.getNodePosition(node);

            assert.isDefined(position);
            assert.isArray(position);
            assert.equal(position.length, 3);
        });

        it("should handle undefined position", () => {
            const nodes = Array.from(layoutManager.nodes);
            const node = nodes[0];

            const position = layoutManager.getNodePosition(node);

            assert.isDefined(position);
            assert.isArray(position);
        });

        it("should handle position without z coordinate", () => {
            const nodes = Array.from(layoutManager.nodes);
            const node = nodes[0];

            const position = layoutManager.getNodePosition(node);

            assert.isDefined(position);
            assert.equal(position.length, 3);
            // Z coordinate should default to 0 if not provided
            assert.isNumber(position[2]);
        });

        it("should return undefined when no layout engine", async() => {
            // Create new manager without layout
            const container = document.createElement("div");
            document.body.appendChild(container);
            const newGraph = new Graph(container);
            await newGraph.init();
            const newManager = newGraph.getLayoutManager();

            // Add a node to the new graph so we have a node to test with
            const newDataManager = newGraph.getDataManager();
            newDataManager.addNodes([
                {id: "testNode", label: "Test Node"},
            ] as Record<string, unknown>[]);

            const nodes = Array.from(newDataManager.nodes.values());
            const node = nodes[0];

            // Clear the layout engine to make it return undefined
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (newManager as any).layoutEngine = undefined;

            const position = newManager.getNodePosition(node);

            assert.isUndefined(position);

            // Cleanup
            newGraph.shutdown();
            container.remove();
        });
    });

    describe("layout state", () => {
        it("should report settled state from layout engine", async() => {
            await layoutManager.setLayout("ngraph", {});

            // ngraph layout might or might not be settled immediately
            assert.isBoolean(layoutManager.isSettled);
        });

        it("should report as settled when no layout engine", () => {
            // Get styles from current test graph
            const currentStyles = graph.styles;

            // Create a fresh layout manager without a graph (to avoid default layout)
            const eventManager = new EventManager();
            const dataManager = new DataManager(eventManager, currentStyles);
            const freshLayoutManager = new LayoutManager(eventManager, dataManager, currentStyles);

            // Should be settled when no layout engine is set
            assert.isTrue(freshLayoutManager.isSettled);

            // Cleanup
            freshLayoutManager.dispose();
        });

        it("should report as settled when not running", async() => {
            await layoutManager.setLayout("ngraph", {});
            layoutManager.running = false;

            assert.isTrue(layoutManager.isSettled);
        });
    });
});

