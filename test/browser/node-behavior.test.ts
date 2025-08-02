/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
import {ActionManager, Vector3} from "@babylonjs/core";
import {afterEach, assert, beforeEach, describe, test, vi} from "vitest";

import type {AdHocData} from "../../src/config/common";
import {Graph} from "../../src/Graph";
import {cleanupTestGraph, createTestGraph} from "../helpers/testSetup";

describe("Node Behavior Tests", () => {
    let graph: Graph;

    beforeEach(async() => {
        // Create test graph using the helper
        graph = await createTestGraph();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        cleanupTestGraph(graph);
    });

    test("drag behavior with pinOnDrag enabled", () => {
        // Add a node using DataManager
        const dataManager = graph.getDataManager();
        dataManager.addNode({id: "test-node", label: "Test Node"} as AdHocData);

        const node = dataManager.getNode("test-node");
        assert.isDefined(node);

        // Check that default behaviors were applied
        assert.isDefined(node.meshDragBehavior);
        assert.equal(node.pinOnDrag, true); // Default is true
        assert.equal(node.mesh.isPickable, true);

        // Mock the pin method
        const pinSpy = vi.spyOn(node, "pin").mockImplementation(() => undefined);

        // Simulate drag start
        node.meshDragBehavior.onDragStartObservable.notifyObservers({});
        assert.equal(node.dragging, true);

        // Simulate drag end
        node.meshDragBehavior.onDragEndObservable.notifyObservers({});
        assert.equal(node.dragging, false);

        // Node should call pin() method when pinOnDrag is true
        assert.equal(pinSpy.mock.calls.length, 1);
    });

    test("drag behavior observables work correctly", () => {
        // Add a node using DataManager
        const dataManager = graph.getDataManager();
        dataManager.addNode({id: "test-node-2", label: "Test Node 2"} as AdHocData);

        const node = dataManager.getNode("test-node-2");
        assert.isDefined(node);
        assert.isDefined(node.meshDragBehavior);

        // Mock graph methods to avoid errors
        const setRunningSpy = vi.spyOn(graph, "setRunning").mockImplementation(() => undefined);
        const pinSpy = vi.spyOn(node, "pin").mockImplementation(() => undefined);

        // Test drag start
        node.meshDragBehavior.onDragStartObservable.notifyObservers({});
        assert.equal(node.dragging, true);
        assert.isTrue(setRunningSpy.mock.calls.some((call) => call[0]));

        // Test drag end
        node.meshDragBehavior.onDragEndObservable.notifyObservers({});
        assert.equal(node.dragging, false);

        // Node should call pin() method by default
        assert.equal(pinSpy.mock.calls.length, 1);
    });

    test("position changed during drag updates layout engine", () => {
        // Add a node using DataManager
        const dataManager = graph.getDataManager();
        dataManager.addNode({id: "test-node-3", label: "Test Node 3"} as AdHocData);

        const node = dataManager.getNode("test-node-3");
        assert.isDefined(node);

        // Mock layout manager
        const layoutManager = graph.getLayoutManager();
        vi.spyOn(layoutManager, "layoutEngine", "get").mockReturnValue({
            setNodePosition: vi.fn(),
        } as any);
        const mockLayoutEngine = layoutManager.layoutEngine;
        const mockSetNodePosition = vi.spyOn(mockLayoutEngine, "setNodePosition");

        // Start dragging
        node.meshDragBehavior.onDragStartObservable.notifyObservers({});

        // Simulate position change while dragging
        const newPosition = new Vector3(10, 20, 30);
        node.meshDragBehavior.onPositionChangedObservable.notifyObservers({
            position: newPosition,
        } as any);

        // Should update layout engine position
        assert.equal(mockSetNodePosition.mock.calls.length, 1);
        assert.equal(mockSetNodePosition.mock.calls[0][0], node);
        assert.equal(mockSetNodePosition.mock.calls[0][1], newPosition);
    });

    test("position changed when not dragging does not update layout engine", () => {
        // Add a node using DataManager
        const dataManager = graph.getDataManager();
        dataManager.addNode({id: "test-node-4", label: "Test Node 4"} as AdHocData);

        const node = dataManager.getNode("test-node-4");
        assert.isDefined(node);

        // Mock layout manager
        const layoutManager = graph.getLayoutManager();
        vi.spyOn(layoutManager, "layoutEngine", "get").mockReturnValue({
            setNodePosition: vi.fn(),
        } as any);
        const mockLayoutEngine = layoutManager.layoutEngine;
        const mockSetNodePosition = vi.spyOn(mockLayoutEngine, "setNodePosition");

        // Simulate position change without dragging (node.dragging should be false)
        const newPosition = new Vector3(10, 20, 30);
        node.meshDragBehavior.onPositionChangedObservable.notifyObservers({
            position: newPosition,
        } as any);

        // Should NOT update layout engine position
        assert.equal(mockSetNodePosition.mock.calls.length, 0);
    });

    test("double-click expansion triggers fetch when fetchNodes/fetchEdges exist", () => {
        const fetchNodes = vi.fn().mockReturnValue([
            {id: "node2", data: {}},
            {id: "node3", data: {}},
        ]);
        const fetchEdges = vi.fn().mockReturnValue(new Set([
            {src: "test-node-5", dst: "node2"},
            {src: "test-node-5", dst: "node3"},
        ]));

        // Add fetch functions to graph
        (graph as {fetchNodes?: typeof fetchNodes, fetchEdges?: typeof fetchEdges}).fetchNodes = fetchNodes;
        (graph as {fetchNodes?: typeof fetchNodes, fetchEdges?: typeof fetchEdges}).fetchEdges = fetchEdges;

        // Add a node using DataManager
        const dataManager = graph.getDataManager();
        dataManager.addNode({id: "test-node-5", label: "Test Node 5"} as AdHocData);

        const node = dataManager.getNode("test-node-5");
        assert.isDefined(node);

        // Mock dataManager methods
        const addNodesSpy = vi.spyOn(dataManager, "addNodes").mockImplementation(() => undefined);
        const addEdgesSpy = vi.spyOn(dataManager, "addEdges").mockImplementation(() => undefined);

        assert.isDefined(node.mesh.actionManager);

        // Find the double-click action
        const {actions} = (node.mesh.actionManager ?? {actions: []});
        const doubleClickAction = actions.find(
            (action) => action.trigger === ActionManager.OnDoublePickTrigger,
        );

        assert.isDefined(doubleClickAction);

        // Trigger the double-click action
        // ExecuteCodeAction stores the function in the execute property
        if ("execute" in doubleClickAction) {
            (doubleClickAction as {execute?: () => void}).execute?.();
        } else {
            // Try accessing the function property directly
            (doubleClickAction as {_executionCallback?: () => void})._executionCallback?.();
        }

        // Verify fetch functions were called
        assert.equal(fetchEdges.mock.calls.length, 1);
        assert.equal(fetchEdges.mock.calls[0][0], node);
        assert.equal(fetchEdges.mock.calls[0][1], graph);

        // Verify nodes were fetched (excluding the current node)
        assert.equal(fetchNodes.mock.calls.length, 1);
        const nodeIds = fetchNodes.mock.calls[0][0];
        assert.equal(nodeIds.size, 2);
        assert.isTrue(nodeIds.has("node2"));
        assert.isTrue(nodeIds.has("node3"));
        assert.isFalse(nodeIds.has("test-node-5")); // Should exclude current node

        // Verify data manager methods were called
        assert.equal(addNodesSpy.mock.calls.length, 1);
        assert.equal(addEdgesSpy.mock.calls.length, 1);
    });

    test("double-click expansion does nothing when fetchNodes/fetchEdges don't exist", () => {
        // Add a node using DataManager (no fetch functions on graph)
        const dataManager = graph.getDataManager();
        dataManager.addNode({id: "test-node-6", label: "Test Node 6"} as AdHocData);

        const node = dataManager.getNode("test-node-6");
        assert.isDefined(node);

        // No double-click action should be registered when fetch functions don't exist
        const actions = node.mesh.actionManager?.actions ?? [];
        const doubleClickAction = actions.find(
            (action) => action.trigger === ActionManager.OnDoublePickTrigger,
        );

        assert.isUndefined(doubleClickAction);
    });

    test("mesh is made pickable", () => {
        // Add a node using DataManager
        const dataManager = graph.getDataManager();
        dataManager.addNode({id: "test-node-7", label: "Test Node 7"} as AdHocData);

        const node = dataManager.getNode("test-node-7");
        assert.isDefined(node);

        // NodeBehavior should have made the mesh pickable
        assert.equal(node.mesh.isPickable, true);
    });
});
