import {afterEach, assert, beforeEach, describe, it} from "vitest";

import type {AdHocData} from "../../src/config";
import type {Graph} from "../../src/Graph";
import type {DataManager} from "../../src/managers/DataManager";
import {cleanupTestGraph, createTestGraph} from "../helpers/testSetup";

describe("DataManager", () => {
    let graph: Graph;
    let dataManager: DataManager;

    beforeEach(async() => {
        graph = await createTestGraph();
        dataManager = graph.getDataManager();
    });

    afterEach(() => {
        cleanupTestGraph(graph);
    });

    describe("initialization", () => {
        it("should initialize without errors", () => {
            // Graph is already initialized in beforeEach
            assert.isNotNull(dataManager);
        });

        it("should dispose without errors", () => {
            // This will be called during graph cleanup
            assert.doesNotThrow(() => {
                cleanupTestGraph(graph);
            });
        });
    });

    describe("node management", () => {
        it("should add a single node", () => {
            const nodeData = {
                id: "node1",
                label: "Test Node",
            } as unknown as AdHocData;

            dataManager.addNode(nodeData);

            const node = dataManager.getNode("node1");
            assert.isDefined(node);
            assert.equal(node.id, "node1");
        });

        it("should add multiple nodes", () => {
            const nodesData = [
                {id: "node1", label: "Node 1"},
                {id: "node2", label: "Node 2"},
                {id: "node3", label: "Node 3"},
            ] as unknown as AdHocData[];

            dataManager.addNodes(nodesData);

            assert.equal(dataManager.nodes.size, 3);
            assert.isDefined(dataManager.getNode("node1"));
            assert.isDefined(dataManager.getNode("node2"));
            assert.isDefined(dataManager.getNode("node3"));
        });

        it("should handle node with custom id path", () => {
            const nodeData = {
                customId: "node1",
                label: "Test Node",
            } as unknown as AdHocData;

            dataManager.addNode(nodeData, "customId");

            const node = dataManager.getNode("node1");
            assert.isDefined(node);
            assert.equal(node.id, "node1");
        });

        it("should not update existing node (current behavior)", () => {
            const nodeData = {
                id: "node1",
                label: "Original Label",
            } as unknown as AdHocData;

            dataManager.addNode(nodeData);

            const updatedData = {
                id: "node1",
                label: "Updated Label",
            } as unknown as AdHocData;

            // Adding a node with the same ID is currently skipped
            dataManager.addNode(updatedData);

            const node = dataManager.getNode("node1");
            assert.isDefined(node);
            // The original label should remain unchanged
            assert.equal(node.data.label, "Original Label");
        });

        it("should remove a node", () => {
            dataManager.addNode({id: "node1", __brand: "AdHocData"} as AdHocData);

            const removed = dataManager.removeNode("node1");

            assert.isTrue(removed);
            assert.isUndefined(dataManager.getNode("node1"));
            assert.equal(dataManager.nodes.size, 0);
        });

        it("should return false when removing non-existent node", () => {
            const removed = dataManager.removeNode("non-existent");
            assert.isFalse(removed);
        });

        it("should get all nodes", () => {
            dataManager.addNodes([
                {id: "node1"},
                {id: "node2"},
                {id: "node3"},
            ] as unknown as AdHocData[]);

            const nodes = Array.from(dataManager.nodes.values());
            assert.equal(nodes.length, 3);
        });
    });

    describe("edge management", () => {
        beforeEach(() => {
            // Add nodes that edges will connect
            dataManager.addNode({id: "node1", __brand: "AdHocData"} as AdHocData);
            dataManager.addNode({id: "node2", __brand: "AdHocData"} as AdHocData);
            dataManager.addNode({id: "node3", __brand: "AdHocData"} as AdHocData);
        });

        it("should add a single edge", () => {
            const edgeData = {
                id: "edge1",
                src: "node1",
                dst: "node2",
            } as unknown as AdHocData;

            dataManager.addEdge(edgeData);

            const edge = dataManager.getEdge("node1:node2");
            assert.isDefined(edge);
            assert.equal(edge.id, "node1:node2");
            assert.equal(edge.srcId, "node1");
            assert.equal(edge.dstId, "node2");
        });

        it("should add multiple edges", () => {
            const edgesData = [
                {id: "edge1", src: "node1", dst: "node2"},
                {id: "edge2", src: "node2", dst: "node3"},
                {id: "edge3", src: "node3", dst: "node1"},
            ] as unknown as AdHocData[];

            dataManager.addEdges(edgesData);

            assert.equal(dataManager.edges.size, 3);
            assert.isDefined(dataManager.getEdge("node1:node2"));
            assert.isDefined(dataManager.getEdge("node2:node3"));
            assert.isDefined(dataManager.getEdge("node3:node1"));
        });

        it("should auto-generate edge id if not provided", () => {
            const edgeData = {
                src: "node1",
                dst: "node2",
            } as unknown as AdHocData;

            dataManager.addEdge(edgeData);

            const edge = dataManager.getEdge("node1:node2");
            assert.isDefined(edge);
            assert.equal(edge.id, "node1:node2");
        });

        it("should handle edge with custom source/target paths", () => {
            const edgeData = {
                id: "edge1",
                from: "node1",
                to: "node2",
            } as unknown as AdHocData;

            dataManager.addEdge(edgeData, "from", "to");

            const edge = dataManager.getEdge("node1:node2");
            assert.isDefined(edge);
            assert.equal(edge.srcId, "node1");
            assert.equal(edge.dstId, "node2");
        });

        it("should defer edge creation if source node doesn't exist", () => {
            const edgeData = {
                id: "edge1",
                src: "non-existent",
                dst: "node2",
            } as unknown as AdHocData;

            // Should not throw - edge is deferred until nodes exist
            dataManager.addEdge(edgeData);

            // Edge should not be created yet
            const edge = dataManager.getEdge("non-existent:node2");
            assert.isUndefined(edge);
        });

        it("should defer edge creation if target node doesn't exist", () => {
            const edgeData = {
                id: "edge1",
                src: "node1",
                dst: "non-existent",
            } as unknown as AdHocData;

            // Should not throw - edge is deferred until nodes exist
            dataManager.addEdge(edgeData);

            // Edge should not be created yet
            const edge = dataManager.getEdge("node1:non-existent");
            assert.isUndefined(edge);
        });

        it("should remove an edge", () => {
            dataManager.addEdge({
                id: "edge1",
                src: "node1",
                dst: "node2",
            } as unknown as AdHocData);

            const removed = dataManager.removeEdge("node1:node2");

            assert.isTrue(removed);
            assert.isUndefined(dataManager.getEdge("node1:node2"));
            assert.equal(dataManager.edges.size, 0);
        });

        it("should return false when removing non-existent edge", () => {
            const removed = dataManager.removeEdge("non:existent");
            assert.isFalse(removed);
        });

        it("should not remove edges when node is removed (current behavior)", () => {
            dataManager.addEdges([
                {id: "edge1", src: "node1", dst: "node2"},
                {id: "edge2", src: "node1", dst: "node3"},
                {id: "edge3", src: "node2", dst: "node3"},
            ] as unknown as AdHocData[]);

            dataManager.removeNode("node1");

            // TODO: Currently removeNode doesn't remove connected edges
            // This is a known limitation (see TODO in DataManager.removeNode)
            assert.isDefined(dataManager.getEdge("node1:node2"));
            assert.isDefined(dataManager.getEdge("node1:node3"));
            assert.isDefined(dataManager.getEdge("node2:node3"));
            assert.equal(dataManager.edges.size, 3);
        });
    });

    describe("cache management", () => {
        it("should use node cache for existing nodes", () => {
            const nodeData = {id: "node1", label: "Test"} as unknown as AdHocData;

            dataManager.addNode(nodeData);
            const node1 = dataManager.getNode("node1");

            // Add same node again
            dataManager.addNode(nodeData);
            const node2 = dataManager.getNode("node1");

            // Should return the same instance
            assert.strictEqual(node1, node2);
        });

        it("should use edge cache for existing edges", () => {
            dataManager.addNode({id: "node1", __brand: "AdHocData"} as AdHocData);
            dataManager.addNode({id: "node2", __brand: "AdHocData"} as AdHocData);

            const edgeData = {src: "node1", dst: "node2"} as unknown as AdHocData;

            dataManager.addEdge(edgeData);
            const edge1 = dataManager.getEdge("node1:node2");

            // Try to add same edge again
            dataManager.addEdge(edgeData);
            const edge2 = dataManager.getEdge("node1:node2");

            // Should return the same instance
            assert.strictEqual(edge1, edge2);
        });
    });

    describe("statistics", () => {
        it("should return correct node count", () => {
            assert.equal(dataManager.nodes.size, 0);

            dataManager.addNodes([
                {id: "node1"},
                {id: "node2"},
                {id: "node3"},
            ] as unknown as AdHocData[]);

            assert.equal(dataManager.nodes.size, 3);

            dataManager.removeNode("node2");
            assert.equal(dataManager.nodes.size, 2);
        });

        it("should return correct edge count", () => {
            dataManager.addNodes([
                {id: "node1"},
                {id: "node2"},
                {id: "node3"},
            ] as unknown as AdHocData[]);

            assert.equal(dataManager.edges.size, 0);

            dataManager.addEdges([
                {id: "edge1", src: "node1", dst: "node2"},
                {id: "edge2", src: "node2", dst: "node3"},
            ] as unknown as AdHocData[]);

            assert.equal(dataManager.edges.size, 2);

            dataManager.removeEdge("node1:node2");
            assert.equal(dataManager.edges.size, 1);
        });
    });

    describe("layout engine integration", () => {
        it("should work with layout engine", async() => {
            // Set a layout
            await graph.setLayout("ngraph", {});

            // Add nodes and edges
            dataManager.addNodes([
                {id: "node1"},
                {id: "node2"},
            ] as unknown as AdHocData[]);

            dataManager.addEdge({
                src: "node1",
                dst: "node2",
            } as unknown as AdHocData);

            // Layout engine should have the nodes and edges
            const layoutManager = graph.getLayoutManager();
            assert.equal(Array.from(layoutManager.nodes).length, 2);
            assert.equal(Array.from(layoutManager.edges).length, 1);
        });
    });
});
