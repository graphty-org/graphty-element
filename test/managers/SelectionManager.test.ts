import {assert, beforeEach, afterEach, describe, it, vi} from "vitest";

import type {AdHocData} from "../../src/config";
import {Graph} from "../../src/Graph";
import {EventManager} from "../../src/managers/EventManager";
import {SelectionManager} from "../../src/managers/SelectionManager";
import type {Node} from "../../src/Node";
import {cleanupTestGraph, createTestGraph} from "../helpers/testSetup";

/**
 * Create a mock node for testing.
 * The mock node has the minimum required properties for selection testing.
 */
function createMockNode(id: string): Node {
    return {
        id,
        data: {} as AdHocData,
        algorithmResults: {} as AdHocData,
        updateStyle: vi.fn(),
    } as unknown as Node;
}

describe("SelectionManager", () => {
    let eventManager: EventManager;
    let selectionManager: SelectionManager;

    beforeEach(() => {
        eventManager = new EventManager();
        selectionManager = new SelectionManager(eventManager);
    });

    afterEach(() => {
        selectionManager.dispose();
        eventManager.dispose();
    });

    describe("initialization", () => {
        it("should initialize without errors", async() => {
            await selectionManager.init();
            assert.isNotNull(selectionManager);
        });

        it("should dispose without errors", () => {
            selectionManager.dispose();
            assert.isNotNull(selectionManager);
        });
    });

    describe("initial state", () => {
        it("getSelectedNode() returns null when nothing is selected", () => {
            const selected = selectionManager.getSelectedNode();
            assert.isNull(selected);
        });

        it("isSelected() returns false for any node when nothing is selected", () => {
            const mockNode = createMockNode("test-node");
            const isSelected = selectionManager.isSelected(mockNode);
            assert.isFalse(isSelected);
        });
    });

    describe("selection operations", () => {
        let mockNode: Node;

        beforeEach(() => {
            mockNode = createMockNode("test-node");
        });

        it("select() sets the node as selected", () => {
            selectionManager.select(mockNode);
            const selected = selectionManager.getSelectedNode();
            assert.strictEqual(selected, mockNode);
        });

        it("select() returns the selected node via getSelectedNode()", () => {
            selectionManager.select(mockNode);
            assert.strictEqual(selectionManager.getSelectedNode(), mockNode);
        });

        it("isSelected() returns true for the selected node", () => {
            selectionManager.select(mockNode);
            assert.isTrue(selectionManager.isSelected(mockNode));
        });

        it("isSelected() returns false for a different node", () => {
            const otherNode = createMockNode("other-node");
            selectionManager.select(mockNode);
            assert.isFalse(selectionManager.isSelected(otherNode));
        });

        it("select() emits selection-changed event with correct previous/current", () => {
            const callback = vi.fn();
            eventManager.addListener("selection-changed", callback);

            selectionManager.select(mockNode);

            assert.equal(callback.mock.calls.length, 1);
            const event = callback.mock.calls[0][0];
            assert.equal(event.type, "selection-changed");
            assert.isNull(event.previousNode);
            assert.strictEqual(event.currentNode, mockNode);
            assert.isNull(event.previousNodeId);
            assert.equal(event.currentNodeId, "test-node");
        });

        it("select() sets _selected to true in node data", () => {
            selectionManager.select(mockNode);
            assert.isTrue(mockNode.data._selected);
        });
    });

    describe("deselection operations", () => {
        let mockNode: Node;

        beforeEach(() => {
            mockNode = createMockNode("test-node");
        });

        it("deselect() clears the selected node", () => {
            selectionManager.select(mockNode);
            selectionManager.deselect();
            assert.isNull(selectionManager.getSelectedNode());
        });

        it("getSelectedNode() returns null after deselect()", () => {
            selectionManager.select(mockNode);
            selectionManager.deselect();
            assert.isNull(selectionManager.getSelectedNode());
        });

        it("deselect() emits selection-changed event", () => {
            selectionManager.select(mockNode);

            const callback = vi.fn();
            eventManager.addListener("selection-changed", callback);

            selectionManager.deselect();

            assert.equal(callback.mock.calls.length, 1);
            const event = callback.mock.calls[0][0];
            assert.equal(event.type, "selection-changed");
            assert.strictEqual(event.previousNode, mockNode);
            assert.isNull(event.currentNode);
            assert.equal(event.previousNodeId, "test-node");
            assert.isNull(event.currentNodeId);
        });

        it("deselect() when nothing selected is a no-op", () => {
            const callback = vi.fn();
            eventManager.addListener("selection-changed", callback);

            selectionManager.deselect();

            // No event should be emitted
            assert.equal(callback.mock.calls.length, 0);
        });

        it("deselect() sets _selected to false in previously selected node data", () => {
            selectionManager.select(mockNode);
            assert.isTrue(mockNode.data._selected);

            selectionManager.deselect();
            assert.isFalse(mockNode.data._selected);
        });
    });

    describe("re-selection operations", () => {
        let node1: Node;
        let node2: Node;

        beforeEach(() => {
            node1 = createMockNode("node-1");
            node2 = createMockNode("node-2");
        });

        it("selecting a different node deselects the previous one", () => {
            selectionManager.select(node1);
            assert.isTrue(selectionManager.isSelected(node1));

            selectionManager.select(node2);
            assert.isFalse(selectionManager.isSelected(node1));
            assert.isTrue(selectionManager.isSelected(node2));
        });

        it("selecting a different node sets _selected correctly on both nodes", () => {
            selectionManager.select(node1);
            assert.isTrue(node1.data._selected);

            selectionManager.select(node2);
            assert.isFalse(node1.data._selected);
            assert.isTrue(node2.data._selected);
        });

        it("selecting the same node is a no-op (no event)", () => {
            selectionManager.select(node1);

            const callback = vi.fn();
            eventManager.addListener("selection-changed", callback);

            // Select the same node again
            selectionManager.select(node1);

            // No event should be emitted
            assert.equal(callback.mock.calls.length, 0);
        });

        it("selection-changed event has correct previous/current on re-selection", () => {
            selectionManager.select(node1);

            const callback = vi.fn();
            eventManager.addListener("selection-changed", callback);

            selectionManager.select(node2);

            assert.equal(callback.mock.calls.length, 1);
            const event = callback.mock.calls[0][0];
            assert.strictEqual(event.previousNode, node1);
            assert.strictEqual(event.currentNode, node2);
            assert.equal(event.previousNodeId, "node-1");
            assert.equal(event.currentNodeId, "node-2");
        });
    });

    describe("style layer", () => {
        it("getSelectionStyleLayer() returns the selection style layer", () => {
            const layer = selectionManager.getSelectionStyleLayer();
            assert.isNotNull(layer);
            assert.isDefined(layer.metadata);
            assert.isTrue((layer.metadata as {isSelectionLayer: boolean}).isSelectionLayer);
        });

        it("selection layer has correct node selector", () => {
            const layer = selectionManager.getSelectionStyleLayer();
            assert.isDefined(layer.node);
            assert.equal(layer.node?.selector, "_selected == `true`");
        });

        it("selection layer has outline effect by default", () => {
            const layer = selectionManager.getSelectionStyleLayer();
            assert.isDefined(layer.node?.style?.effect);
            assert.isDefined(layer.node?.style?.effect?.outline);
            assert.equal(layer.node?.style?.effect?.outline?.color, "#FFFF00");
        });
    });

    describe("selectById", () => {
        let graph: Graph;

        beforeEach(async() => {
            graph = await createTestGraph();
            // Create a new SelectionManager connected to the graph's data manager
            selectionManager.setDataManager(graph.getDataManager());
        });

        afterEach(() => {
            cleanupTestGraph(graph);
        });

        it("selectById() selects a node by its ID", async() => {
            // Add a node to the graph
            await graph.addNode({id: "test-node-1"} as AdHocData);

            // Select by ID
            const result = selectionManager.selectById("test-node-1");

            assert.isTrue(result);
            const selected = selectionManager.getSelectedNode();
            assert.isNotNull(selected);
            assert.equal(selected?.id, "test-node-1");
        });

        it("selectById() returns false for non-existent node", () => {
            const result = selectionManager.selectById("non-existent");
            assert.isFalse(result);
            assert.isNull(selectionManager.getSelectedNode());
        });
    });
});

describe("SelectionManager integration with Graph", () => {
    let graph: Graph;

    beforeEach(async() => {
        graph = await createTestGraph();
    });

    afterEach(() => {
        cleanupTestGraph(graph);
    });

    it("node removal while selected deselects the node", async() => {
        // Add a node
        await graph.addNode({id: "node-to-remove"} as AdHocData);

        // Select it
        graph.selectNode("node-to-remove");
        assert.isNotNull(graph.getSelectedNode());

        // Remove the node
        await graph.removeNodes(["node-to-remove"]);

        // Selection should be cleared
        assert.isNull(graph.getSelectedNode());
    });

    it("selection persists across style template changes", async() => {
        // Add nodes
        await graph.addNode({id: "persistent-node"} as AdHocData);

        // Select a node
        graph.selectNode("persistent-node");
        assert.isNotNull(graph.getSelectedNode());

        // Change style template
        await graph.setStyleTemplate({
            graphtyTemplate: true,
            majorVersion: "1",
            graph: {
                addDefaultStyle: true,
                background: {backgroundType: "color", color: "#000000"},
            },
            layers: [],
        });

        // Selection should still be present
        assert.isNotNull(graph.getSelectedNode());
        assert.equal(graph.getSelectedNode()?.id, "persistent-node");
    });
});
