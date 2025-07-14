import {beforeEach, describe, it, vi, expect} from "vitest";
import {assert} from "chai";
import {EventManager} from "../../src/managers/EventManager";
import type {Graph} from "../../src/Graph";
import type {Node} from "../../src/Node";
import type {Edge} from "../../src/Edge";

describe("EventManager", () => {
    let eventManager: EventManager;

    beforeEach(() => {
        eventManager = new EventManager();
    });

    describe("initialization", () => {
        it("should initialize without errors", async () => {
            await eventManager.init();
            assert.isNotNull(eventManager);
        });

        it("should dispose without errors", () => {
            eventManager.dispose();
            assert.isNotNull(eventManager);
        });
    });

    describe("event listeners", () => {
        it("should add and trigger graph settled event listeners", () => {
            const callback = vi.fn();
            const listenerId = eventManager.addListener("graph-settled", callback);
            
            const mockGraph = {} as Graph;
            eventManager.emitGraphSettled(mockGraph);
            
            assert.equal(callback.mock.calls.length, 1);
            assert.deepEqual(callback.mock.calls[0][0], {
                type: "graph-settled",
                graph: mockGraph
            });
            
            // Clean up
            eventManager.removeListener(listenerId);
        });

        it("should handle multiple listeners for same event", () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();
            
            const id1 = eventManager.addListener("graph-settled", callback1);
            const id2 = eventManager.addListener("graph-settled", callback2);
            
            const mockGraph = {} as Graph;
            eventManager.emitGraphSettled(mockGraph);
            
            assert.equal(callback1.mock.calls.length, 1);
            assert.equal(callback2.mock.calls.length, 1);
            
            // Clean up
            eventManager.removeListener(id1);
            eventManager.removeListener(id2);
        });

        it("should remove listeners", () => {
            const callback = vi.fn();
            const listenerId = eventManager.addListener("graph-settled", callback);
            
            // Remove the listener
            const removed = eventManager.removeListener(listenerId);
            assert.isTrue(removed);
            
            const mockGraph = {} as Graph;
            eventManager.emitGraphSettled(mockGraph);
            
            assert.equal(callback.mock.calls.length, 0);
        });

        it("should return false when removing non-existent listener", () => {
            const fakeId = Symbol("fake");
            const removed = eventManager.removeListener(fakeId);
            assert.isFalse(removed);
        });
    });

    describe("graph events", () => {
        it("should emit graph error events", () => {
            const callback = vi.fn();
            const listenerId = eventManager.addListener("error", callback);
            
            const mockGraph = {} as Graph;
            const error = new Error("Test error");
            const details = {source: "test"};
            
            eventManager.emitGraphError(mockGraph, error, "test", details);
            
            assert.equal(callback.mock.calls.length, 1);
            const emittedEvent = callback.mock.calls[0][0];
            assert.equal(emittedEvent.type, "error");
            assert.equal(emittedEvent.error, error);
            assert.equal(emittedEvent.context, "test");
            assert.deepEqual(emittedEvent.details, details);
            
            eventManager.removeListener(listenerId);
        });

        it("should emit data-added events", () => {
            const callback = vi.fn();
            const listenerId = eventManager.addListener("data-added", callback);
            
            eventManager.emitDataAdded("nodes", 10, true, true);
            
            assert.equal(callback.mock.calls.length, 1);
            const emittedEvent = callback.mock.calls[0][0];
            assert.equal(emittedEvent.type, "data-added");
            assert.equal(emittedEvent.dataType, "nodes");
            assert.equal(emittedEvent.count, 10);
            assert.equal(emittedEvent.shouldStartLayout, true);
            assert.equal(emittedEvent.shouldZoomToFit, true);
            
            eventManager.removeListener(listenerId);
        });

        it("should emit layout-initialized events", () => {
            const callback = vi.fn();
            const listenerId = eventManager.addListener("layout-initialized", callback);
            
            eventManager.emitLayoutInitialized("force", true);
            
            assert.equal(callback.mock.calls.length, 1);
            const emittedEvent = callback.mock.calls[0][0];
            assert.equal(emittedEvent.type, "layout-initialized");
            assert.equal(emittedEvent.layoutType, "force");
            assert.equal(emittedEvent.shouldZoomToFit, true);
            
            eventManager.removeListener(listenerId);
        });

        it("should emit data-loaded events", () => {
            const callback = vi.fn();
            const listenerId = eventManager.addListener("data-loaded", callback);
            
            const mockGraph = {} as Graph;
            eventManager.emitGraphDataLoaded(mockGraph, 5, "json");
            
            assert.equal(callback.mock.calls.length, 1);
            const emittedEvent = callback.mock.calls[0][0];
            assert.equal(emittedEvent.type, "data-loaded");
            assert.equal(emittedEvent.graph, mockGraph);
            assert.equal(emittedEvent.details.chunksLoaded, 5);
            assert.equal(emittedEvent.details.dataSourceType, "json");
            
            eventManager.removeListener(listenerId);
        });

        it("should emit custom graph events", () => {
            const callback = vi.fn();
            // Custom events go through graph observable
            const observer = eventManager.graphObservables.add(callback);
            
            const detail = {customData: "test"};
            eventManager.emitGraphEvent("custom-event", detail);
            
            assert.equal(callback.mock.calls.length, 1);
            const emittedEvent = callback.mock.calls[0][0];
            assert.equal(emittedEvent.type, "custom-event");
            assert.equal(emittedEvent.customData, "test");
            
            eventManager.graphObservables.remove(observer);
        });
    });

    describe("node events", () => {
        it("should emit node events", () => {
            const callback = vi.fn();
            const listenerId = eventManager.addListener("node-add-before", callback);
            
            const mockNode = {id: "test-node"} as Node;
            eventManager.emitNodeEvent("node-add-before", {node: mockNode});
            
            assert.equal(callback.mock.calls.length, 1);
            const emittedEvent = callback.mock.calls[0][0];
            assert.equal(emittedEvent.type, "node-add-before");
            assert.equal(emittedEvent.node, mockNode);
            
            eventManager.removeListener(listenerId);
        });

        it("should emit node update events", () => {
            const callback = vi.fn();
            const listenerId = eventManager.addListener("node-update-after", callback);
            
            const mockNode = {id: "test-node"} as Node;
            eventManager.emitNodeEvent("node-update-after", {node: mockNode});
            
            assert.equal(callback.mock.calls.length, 1);
            assert.equal(callback.mock.calls[0][0].type, "node-update-after");
            
            eventManager.removeListener(listenerId);
        });
    });

    describe("edge events", () => {
        it("should emit edge events", () => {
            const callback = vi.fn();
            const listenerId = eventManager.addListener("edge-add-before", callback);
            
            const mockEdge = {id: "test-edge"} as Edge;
            eventManager.emitEdgeEvent("edge-add-before", {edge: mockEdge});
            
            assert.equal(callback.mock.calls.length, 1);
            const emittedEvent = callback.mock.calls[0][0];
            assert.equal(emittedEvent.type, "edge-add-before");
            assert.equal(emittedEvent.edge, mockEdge);
            
            eventManager.removeListener(listenerId);
        });

        it("should emit edge update events", () => {
            const callback = vi.fn();
            const listenerId = eventManager.addListener("edge-update-after", callback);
            
            const mockEdge = {id: "test-edge"} as Edge;
            eventManager.emitEdgeEvent("edge-update-after", {edge: mockEdge});
            
            assert.equal(callback.mock.calls.length, 1);
            assert.equal(callback.mock.calls[0][0].type, "edge-update-after");
            
            eventManager.removeListener(listenerId);
        });
    });

    describe("event filtering", () => {
        it("should only trigger callbacks for specific event types", () => {
            const settledCallback = vi.fn();
            const errorCallback = vi.fn();
            
            const id1 = eventManager.addListener("graph-settled", settledCallback);
            const id2 = eventManager.addListener("error", errorCallback);
            
            const mockGraph = {} as Graph;
            eventManager.emitGraphSettled(mockGraph);
            
            assert.equal(settledCallback.mock.calls.length, 1);
            assert.equal(errorCallback.mock.calls.length, 0);
            
            eventManager.removeListener(id1);
            eventManager.removeListener(id2);
        });

        it("should filter node events by type", () => {
            const addCallback = vi.fn();
            const updateCallback = vi.fn();
            
            const id1 = eventManager.addListener("node-add-before", addCallback);
            const id2 = eventManager.addListener("node-update-after", updateCallback);
            
            const mockNode = {id: "test"} as Node;
            eventManager.emitNodeEvent("node-add-before", {node: mockNode});
            
            assert.equal(addCallback.mock.calls.length, 1);
            assert.equal(updateCallback.mock.calls.length, 0);
            
            eventManager.removeListener(id1);
            eventManager.removeListener(id2);
        });
    });

    describe("once listeners", () => {
        it("should fire once and auto-remove", () => {
            const callback = vi.fn();
            eventManager.once("graph-settled", callback);
            
            const mockGraph = {} as Graph;
            eventManager.emitGraphSettled(mockGraph);
            eventManager.emitGraphSettled(mockGraph);
            
            assert.equal(callback.mock.calls.length, 1);
        });
    });

    describe("waitFor", () => {
        it("should wait for specific event", async () => {
            const promise = eventManager.waitFor("graph-settled", 1000);
            
            const mockGraph = {} as Graph;
            setTimeout(() => {
                eventManager.emitGraphSettled(mockGraph);
            }, 10);
            
            const event = await promise;
            assert.equal(event.type, "graph-settled");
        });

        it("should timeout when event doesn't occur", async () => {
            const promise = eventManager.waitFor("graph-settled", 100);
            
            await expect(promise).rejects.toThrow(/Timeout waiting for event/);
        });
    });

    describe("error handling with retry", () => {
        it("should retry failed operations", async () => {
            let attempts = 0;
            const operation = vi.fn().mockImplementation(async () => {
                attempts++;
                if (attempts < 2) {
                    throw new Error("Operation failed");
                }
                return "success";
            });
            
            const mockGraph = {} as Graph;
            const result = await eventManager.withRetry(
                operation,
                "test",
                mockGraph,
                {testDetail: "value"}
            );
            
            assert.equal(result, "success");
            assert.equal(operation.mock.calls.length, 2);
        });

        it("should emit error events for each retry", async () => {
            const errorCallback = vi.fn();
            const listenerId = eventManager.addListener("error", errorCallback);
            
            const operation = vi.fn().mockRejectedValue(new Error("Always fails"));
            const mockGraph = {} as Graph;
            
            await expect(
                eventManager.withRetry(operation, "test", mockGraph)
            ).rejects.toThrow(/Always fails/);
            
            // Should emit error for each retry attempt (default 3)
            assert.equal(errorCallback.mock.calls.length, 3);
            
            // Check error details include attempt info
            const lastError = errorCallback.mock.calls[2][0];
            assert.equal(lastError.details.attempt, 3);
            assert.equal(lastError.details.maxAttempts, 3);
            
            eventManager.removeListener(listenerId);
        });
    });

    describe("observables access", () => {
        it("should provide access to graph observable", () => {
            const observable = eventManager.graphObservables;
            assert.isDefined(observable);
            
            const callback = vi.fn();
            const observer = observable.add(callback);
            
            eventManager.emitGraphSettled({} as Graph);
            assert.equal(callback.mock.calls.length, 1);
            
            observable.remove(observer);
        });

        it("should provide access to node observable", () => {
            const observable = eventManager.nodeObservables;
            assert.isDefined(observable);
            
            const callback = vi.fn();
            const observer = observable.add(callback);
            
            eventManager.emitNodeEvent("node-add-before", {node: {} as Node});
            assert.equal(callback.mock.calls.length, 1);
            
            observable.remove(observer);
        });

        it("should provide access to edge observable", () => {
            const observable = eventManager.edgeObservables;
            assert.isDefined(observable);
            
            const callback = vi.fn();
            const observer = observable.add(callback);
            
            eventManager.emitEdgeEvent("edge-add-before", {edge: {} as Edge});
            assert.equal(callback.mock.calls.length, 1);
            
            observable.remove(observer);
        });
    });

    describe("cleanup", () => {
        it("should clear all observers on dispose", () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();
            const callback3 = vi.fn();
            
            eventManager.addListener("graph-settled", callback1);
            eventManager.addListener("node-add-before", callback2);
            eventManager.addListener("edge-add-before", callback3);
            
            eventManager.dispose();
            
            // Try to emit events - callbacks should not fire
            eventManager.emitGraphSettled({} as Graph);
            eventManager.emitNodeEvent("node-add-before", {node: {} as Node});
            eventManager.emitEdgeEvent("edge-add-before", {edge: {} as Edge});
            
            assert.equal(callback1.mock.calls.length, 0);
            assert.equal(callback2.mock.calls.length, 0);
            assert.equal(callback3.mock.calls.length, 0);
        });
    });
});