import type {Scene} from "@babylonjs/core";
import {assert} from "chai";
import {beforeEach, describe, it, vi} from "vitest";

import type {AdHocData} from "../../src/config";
import {DataManager} from "../../src/managers/DataManager";
import type {EventManager} from "../../src/managers/EventManager";
import type {GraphContext} from "../../src/managers/GraphContext";
import type {LayoutManager} from "../../src/managers/LayoutManager";
import type {Styles} from "../../src/Styles";

describe("DataManager", () => {
    let dataManager: DataManager;
    let mockEventManager: EventManager;
    let mockLayoutManager: LayoutManager;
    let mockGraphContext: GraphContext;
    let mockStyles: Styles;
    let mockScene: Scene;

    beforeEach(() => {
        // Create mocks
        mockEventManager = {
            emitNodeAdded: vi.fn(),
            emitNodeRemoved: vi.fn(),
            emitEdgeAdded: vi.fn(),
            emitEdgeRemoved: vi.fn(),
            emitDataAdded: vi.fn(),
            emitGraphError: vi.fn(),
        } as EventManager;

        mockLayoutManager = {
            layoutEngine: {
                addNode: vi.fn(),
                addEdge: vi.fn(),
                removeNode: vi.fn(),
                removeEdge: vi.fn(),
            },
            nodes: [],
            edges: [],
        } as LayoutManager;

        mockGraphContext = {
            getLayoutManager: () => mockLayoutManager,
            getEventManager: () => mockEventManager,
            getStyles: () => mockStyles,
            getScene: () => mockScene,
        } as GraphContext;

        mockStyles = {
            nodeDefaults: {},
            edgeDefaults: {},
        } as Styles;

        mockScene = {
            registerBeforeRender: vi.fn(),
            unregisterBeforeRender: vi.fn(),
        } as Scene;

        dataManager = new DataManager(
            mockEventManager,
            mockLayoutManager,
            mockGraphContext,
            mockStyles,
        );
    });

    describe("initialization", () => {
        it("should initialize without errors", async() => {
            await dataManager.init();
            assert.isNotNull(dataManager);
        });

        it("should dispose without errors", () => {
            dataManager.dispose();
            assert.isNotNull(dataManager);
        });
    });

    describe("node management", () => {
        it("should add a single node", () => {
            const nodeData: AdHocData = {
                id: "node1",
                label: "Test Node",
            };

            dataManager.addNode(nodeData);

            const node = dataManager.getNode("node1");
            assert.isDefined(node);
            assert.equal(node?.id, "node1");
            assert.isTrue(mockEventManager.emitNodeAdded.calledOnce);
            assert.isTrue(mockLayoutManager.layoutEngine.addNode.calledOnce);
        });

        it("should add multiple nodes", () => {
            const nodesData: AdHocData[] = [
                {id: "node1", label: "Node 1"},
                {id: "node2", label: "Node 2"},
                {id: "node3", label: "Node 3"},
            ];

            dataManager.addNodes(nodesData);

            assert.equal(dataManager.getNodeCount(), 3);
            assert.equal(mockEventManager.emitNodeAdded.callCount, 3);
            assert.equal(mockLayoutManager.layoutEngine.addNode.callCount, 3);
            assert.isTrue(mockEventManager.emitDataAdded.calledOnce);
        });

        it("should handle node with custom id path", () => {
            const nodeData = {
                customId: "custom-node-1",
                label: "Custom Node",
            };

            dataManager.addNode(nodeData, "customId");

            const node = dataManager.getNode("custom-node-1");
            assert.isDefined(node);
            assert.equal(node?.id, "custom-node-1");
        });

        it("should update existing node", () => {
            const nodeData = {id: "node1", label: "Original"};
            dataManager.addNode(nodeData);

            const updatedData = {id: "node1", label: "Updated"};
            dataManager.addNode(updatedData);

            const node = dataManager.getNode("node1");
            assert.equal(dataManager.getNodeCount(), 1);
            // Should only emit one added event (first time)
            assert.equal(mockEventManager.emitNodeAdded.callCount, 1);
        });

        it("should remove a node", () => {
            const nodeData = {id: "node1", label: "Test Node"};
            dataManager.addNode(nodeData);

            const removed = dataManager.removeNode("node1");

            assert.isTrue(removed);
            assert.isUndefined(dataManager.getNode("node1"));
            assert.equal(dataManager.getNodeCount(), 0);
            assert.isTrue(mockEventManager.emitNodeRemoved.calledOnce);
            assert.isTrue(mockLayoutManager.layoutEngine.removeNode.calledOnce);
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
            ]);

            const nodes = dataManager.getNodes();
            assert.equal(nodes.size, 3);
            assert.isTrue(nodes.has("node1"));
            assert.isTrue(nodes.has("node2"));
            assert.isTrue(nodes.has("node3"));
        });
    });

    describe("edge management", () => {
        beforeEach(() => {
            // Add nodes for edge testing
            dataManager.addNodes([
                {id: "node1"},
                {id: "node2"},
                {id: "node3"},
            ]);
        });

        it("should add a single edge", () => {
            const edgeData = {
                id: "edge1",
                source: "node1",
                target: "node2",
            };

            dataManager.addEdge(edgeData);

            const edge = dataManager.getEdge("edge1");
            assert.isDefined(edge);
            assert.equal(edge?.id, "edge1");
            assert.equal(edge?.srcId, "node1");
            assert.equal(edge?.dstId, "node2");
            assert.isTrue(mockEventManager.emitEdgeAdded.calledOnce);
            assert.isTrue(mockLayoutManager.layoutEngine.addEdge.calledOnce);
        });

        it("should add multiple edges", () => {
            const edgesData = [
                {id: "edge1", source: "node1", target: "node2"},
                {id: "edge2", source: "node2", target: "node3"},
                {id: "edge3", source: "node3", target: "node1"},
            ];

            dataManager.addEdges(edgesData);

            assert.equal(dataManager.getEdgeCount(), 3);
            assert.equal(mockEventManager.emitEdgeAdded.callCount, 3);
            assert.equal(mockLayoutManager.layoutEngine.addEdge.callCount, 3);
            assert.isTrue(mockEventManager.emitDataAdded.calledOnce);
        });

        it("should auto-generate edge id if not provided", () => {
            const edgeData = {
                source: "node1",
                target: "node2",
            };

            dataManager.addEdge(edgeData);

            const edges = Array.from(dataManager.getEdges().values());
            assert.equal(edges.length, 1);
            assert.isDefined(edges[0].id);
        });

        it("should handle edge with custom source/target paths", () => {
            const edgeData = {
                id: "edge1",
                from: "node1",
                to: "node2",
            };

            dataManager.addEdge(edgeData, "from", "to");

            const edge = dataManager.getEdge("edge1");
            assert.isDefined(edge);
            assert.equal(edge?.srcId, "node1");
            assert.equal(edge?.dstId, "node2");
        });

        it("should skip edge if source node doesn't exist", () => {
            const edgeData = {
                id: "edge1",
                source: "non-existent",
                target: "node2",
            };

            dataManager.addEdge(edgeData);

            assert.isUndefined(dataManager.getEdge("edge1"));
            assert.equal(dataManager.getEdgeCount(), 0);
        });

        it("should skip edge if target node doesn't exist", () => {
            const edgeData = {
                id: "edge1",
                source: "node1",
                target: "non-existent",
            };

            dataManager.addEdge(edgeData);

            assert.isUndefined(dataManager.getEdge("edge1"));
            assert.equal(dataManager.getEdgeCount(), 0);
        });

        it("should remove an edge", () => {
            dataManager.addEdge({
                id: "edge1",
                source: "node1",
                target: "node2",
            });

            const removed = dataManager.removeEdge("edge1");

            assert.isTrue(removed);
            assert.isUndefined(dataManager.getEdge("edge1"));
            assert.equal(dataManager.getEdgeCount(), 0);
            assert.isTrue(mockEventManager.emitEdgeRemoved.calledOnce);
            assert.isTrue(mockLayoutManager.layoutEngine.removeEdge.calledOnce);
        });

        it("should return false when removing non-existent edge", () => {
            const removed = dataManager.removeEdge("non-existent");
            assert.isFalse(removed);
        });

        it("should remove edges when source node is removed", () => {
            dataManager.addEdges([
                {id: "edge1", source: "node1", target: "node2"},
                {id: "edge2", source: "node1", target: "node3"},
                {id: "edge3", source: "node2", target: "node3"},
            ]);

            dataManager.removeNode("node1");

            assert.isUndefined(dataManager.getEdge("edge1"));
            assert.isUndefined(dataManager.getEdge("edge2"));
            assert.isDefined(dataManager.getEdge("edge3"));
            assert.equal(dataManager.getEdgeCount(), 1);
        });

        it("should remove edges when target node is removed", () => {
            dataManager.addEdges([
                {id: "edge1", source: "node1", target: "node2"},
                {id: "edge2", source: "node3", target: "node2"},
                {id: "edge3", source: "node1", target: "node3"},
            ]);

            dataManager.removeNode("node2");

            assert.isUndefined(dataManager.getEdge("edge1"));
            assert.isUndefined(dataManager.getEdge("edge2"));
            assert.isDefined(dataManager.getEdge("edge3"));
            assert.equal(dataManager.getEdgeCount(), 1);
        });
    });

    describe("data source loading", () => {
        it("should load data from a data source", async() => {
            const mockDataSource = {
                init: vi.fn().mockResolvedValue(undefined),
                fetchNodes: vi.fn().mockImplementation(async function* () {
                    yield [{id: "node1"}, {id: "node2"}];
                    yield [{id: "node3"}];
                }),
                fetchEdges: vi.fn().mockImplementation(async function* () {
                    yield [{id: "edge1", source: "node1", target: "node2"}];
                    yield [{id: "edge2", source: "node2", target: "node3"}];
                }),
            };

            await dataManager.loadDataSource(mockDataSource as any);

            assert.equal(dataManager.getNodeCount(), 3);
            assert.equal(dataManager.getEdgeCount(), 2);
            assert.isTrue(mockDataSource.init.calledOnce);
            assert.isTrue(mockDataSource.fetchNodes.calledOnce);
            assert.isTrue(mockDataSource.fetchEdges.calledOnce);
        });

        it("should handle data source errors", async() => {
            const error = new Error("Data source error");
            const mockDataSource = {
                init: vi.fn().mockRejectedValue(error),
                fetchNodes: vi.fn(),
                fetchEdges: vi.fn(),
            };

            await dataManager.loadDataSource(mockDataSource as any);

            assert.isTrue(mockEventManager.emitGraphError.calledOnce);
            assert.equal(mockEventManager.emitGraphError.args[0][1], error);
        });
    });

    describe("cache management", () => {
        it("should use node cache for existing nodes", () => {
            const nodeData = {id: "node1", label: "Test Node"};

            // First add
            dataManager.addNode(nodeData);
            const node1 = dataManager.getNode("node1");

            // Second add (should use cache)
            dataManager.addNode(nodeData);
            const node2 = dataManager.getNode("node1");

            assert.strictEqual(node1, node2); // Same instance
        });

        it("should use edge cache for existing edges", () => {
            dataManager.addNodes([
                {id: "node1"},
                {id: "node2"},
            ]);

            const edgeData = {id: "edge1", source: "node1", target: "node2"};

            // First add
            dataManager.addEdge(edgeData);
            const edge1 = dataManager.getEdge("edge1");

            // Second add (should use cache)
            dataManager.addEdge(edgeData);
            const edge2 = dataManager.getEdge("edge1");

            assert.strictEqual(edge1, edge2); // Same instance
        });
    });

    describe("statistics", () => {
        it("should return correct node count", () => {
            assert.equal(dataManager.getNodeCount(), 0);

            dataManager.addNodes([
                {id: "node1"},
                {id: "node2"},
                {id: "node3"},
            ]);

            assert.equal(dataManager.getNodeCount(), 3);

            dataManager.removeNode("node2");
            assert.equal(dataManager.getNodeCount(), 2);
        });

        it("should return correct edge count", () => {
            dataManager.addNodes([
                {id: "node1"},
                {id: "node2"},
                {id: "node3"},
            ]);

            assert.equal(dataManager.getEdgeCount(), 0);

            dataManager.addEdges([
                {id: "edge1", source: "node1", target: "node2"},
                {id: "edge2", source: "node2", target: "node3"},
            ]);

            assert.equal(dataManager.getEdgeCount(), 2);

            dataManager.removeEdge("edge1");
            assert.equal(dataManager.getEdgeCount(), 1);
        });
    });

    describe("layout engine integration", () => {
        it("should set layout engine", () => {
            const mockLayoutEngine = {
                addNode: vi.fn(),
                addEdge: vi.fn(),
            } as EventManager;

            dataManager.setLayoutEngine(mockLayoutEngine);

            // Add a node to test if new engine is used
            dataManager.addNode({id: "test"});

            assert.isTrue(mockLayoutEngine.addNode.calledOnce);
        });

        it("should handle null layout engine", () => {
            dataManager.setLayoutEngine(null);

            // Should not throw when adding nodes/edges
            assert.doesNotThrow(() => {
                dataManager.addNode({id: "test"});
            });
        });
    });
});
