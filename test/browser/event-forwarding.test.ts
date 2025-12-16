/**
 * Regression tests for event forwarding from Graph to graphty-element DOM events.
 *
 * The graphty-element web component forwards internal Graph events as DOM CustomEvents,
 * allowing external code (e.g., React) to listen for graph events using standard
 * DOM addEventListener. This test suite validates that this event forwarding works correctly.
 */
import "../../src/graphty-element";

import {assert, describe, test, vi} from "vitest";

import type {Graphty} from "../../index.js";

/**
 * Helper to create a graphty-element and wait for it to initialize
 */
async function createGraphtyElement(): Promise<{element: Graphty, container: HTMLDivElement}> {
    const container = document.createElement("div");
    container.style.width = "400px";
    container.style.height = "300px";
    document.body.appendChild(container);

    const graphtyElement = document.createElement("graphty-element") as Graphty;
    graphtyElement.style.width = "100%";
    graphtyElement.style.height = "100%";
    graphtyElement.style.display = "block";
    container.appendChild(graphtyElement);

    // Wait for element to be connected and asyncFirstUpdated to complete
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {element: graphtyElement, container};
}

/**
 * Helper to clean up a graphty-element
 */
function cleanup(element: HTMLElement): void {
    const container = element.parentElement;
    if (container) {
        document.body.removeChild(container);
    }
}

describe("Event Forwarding Regression Tests", () => {
    describe("graph-settled event", () => {
        test("graph-settled event is forwarded as DOM CustomEvent", async() => {
            const {element: graphtyElement} = await createGraphtyElement();
            const settledCallback = vi.fn();

            // Listen for the event on the DOM element
            graphtyElement.addEventListener("graph-settled", settledCallback);

            // Trigger internal graph event via EventManager
            graphtyElement.graph.eventManager.emitGraphSettled(graphtyElement.graph);

            // Event should be forwarded synchronously
            assert.equal(settledCallback.mock.calls.length, 1);

            // Verify event structure
            const event = settledCallback.mock.calls[0][0] as CustomEvent<Record<string, unknown>>;
            assert.instanceOf(event, CustomEvent);
            assert.equal(event.type, "graph-settled");
            assert.isTrue(event.bubbles);
            assert.isTrue(event.composed);
            assert.equal(event.detail.type, "graph-settled");
            assert.equal(event.detail.graph, graphtyElement.graph);

            cleanup(graphtyElement);
        });

        test("graph-settled event bubbles through DOM", async() => {
            const {element: graphtyElement, container} = await createGraphtyElement();
            const containerCallback = vi.fn();

            // Listen on the parent container (bubbling)
            container.addEventListener("graph-settled", containerCallback);

            graphtyElement.graph.eventManager.emitGraphSettled(graphtyElement.graph);

            assert.equal(containerCallback.mock.calls.length, 1);

            cleanup(graphtyElement);
        });
    });

    describe("data-added event", () => {
        test("data-added event is forwarded when nodes are added", async() => {
            const {element: graphtyElement} = await createGraphtyElement();
            const dataAddedCallback = vi.fn();

            graphtyElement.addEventListener("data-added", dataAddedCallback);

            // Add nodes which should trigger data-added event
            await graphtyElement.graph.addNodes([{id: "1"}, {id: "2"}]);

            // Wait for async operations
            await new Promise((resolve) => setTimeout(resolve, 100));

            // data-added should have been emitted
            assert.isTrue(dataAddedCallback.mock.calls.length >= 1);

            const event = dataAddedCallback.mock.calls[0][0] as CustomEvent;
            assert.equal(event.type, "data-added");
            assert.equal(event.detail.dataType, "nodes");
            assert.equal(event.detail.count, 2);

            cleanup(graphtyElement);
        });

        test("data-added event is forwarded when edges are added", async() => {
            const {element: graphtyElement} = await createGraphtyElement();
            const dataAddedCallback = vi.fn();

            // First add nodes
            await graphtyElement.graph.addNodes([{id: "a"}, {id: "b"}, {id: "c"}]);
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Now listen for edge additions
            graphtyElement.addEventListener("data-added", dataAddedCallback);

            // Add edges
            await graphtyElement.graph.addEdges([
                {src: "a", dst: "b"},
                {src: "b", dst: "c"},
            ]);

            await new Promise((resolve) => setTimeout(resolve, 100));

            // Should have received data-added for edges
            const edgeEvent = dataAddedCallback.mock.calls.find(
                (call) => (call[0] as CustomEvent).detail.dataType === "edges",
            ) as [CustomEvent] | undefined;
            assert.isDefined(edgeEvent);
            // Type assertion safe because assert.isDefined will throw if undefined
            assert.equal((edgeEvent)[0].detail.count, 2);

            cleanup(graphtyElement);
        });
    });

    describe("error event", () => {
        test("error event is forwarded as DOM CustomEvent", async() => {
            const {element: graphtyElement} = await createGraphtyElement();
            const errorCallback = vi.fn();

            graphtyElement.addEventListener("error", errorCallback);

            const testError = new Error("Test error message");
            graphtyElement.graph.eventManager.emitGraphError(
                graphtyElement.graph,
                testError,
                "other",
                {customDetail: "value"},
            );

            assert.equal(errorCallback.mock.calls.length, 1);

            const event = errorCallback.mock.calls[0][0] as CustomEvent;
            assert.equal(event.type, "error");
            assert.equal(event.detail.error, testError);
            assert.equal(event.detail.context, "other");
            assert.deepEqual(event.detail.details, {customDetail: "value"});

            cleanup(graphtyElement);
        });
    });

    describe("layout-initialized event", () => {
        test("layout-initialized event is forwarded", async() => {
            const {element: graphtyElement} = await createGraphtyElement();
            const layoutCallback = vi.fn();

            graphtyElement.addEventListener("layout-initialized", layoutCallback);

            graphtyElement.graph.eventManager.emitLayoutInitialized("force", true);

            assert.equal(layoutCallback.mock.calls.length, 1);

            const event = layoutCallback.mock.calls[0][0] as CustomEvent;
            assert.equal(event.detail.layoutType, "force");
            assert.equal(event.detail.shouldZoomToFit, true);

            cleanup(graphtyElement);
        });
    });

    describe("data-loaded event", () => {
        test("data-loaded event is forwarded", async() => {
            const {element: graphtyElement} = await createGraphtyElement();
            const loadedCallback = vi.fn();

            graphtyElement.addEventListener("data-loaded", loadedCallback);

            graphtyElement.graph.eventManager.emitGraphDataLoaded(
                graphtyElement.graph,
                3, // chunksLoaded
                "json", // dataSourceType
            );

            assert.equal(loadedCallback.mock.calls.length, 1);

            const event = loadedCallback.mock.calls[0][0] as CustomEvent;
            assert.equal(event.detail.details.chunksLoaded, 3);
            assert.equal(event.detail.details.dataSourceType, "json");

            cleanup(graphtyElement);
        });
    });

    describe("data loading progress events", () => {
        test("data-loading-progress event is forwarded", async() => {
            const {element: graphtyElement} = await createGraphtyElement();
            const progressCallback = vi.fn();

            graphtyElement.addEventListener("data-loading-progress", progressCallback);

            graphtyElement.graph.eventManager.emitDataLoadingProgress(
                "csv",
                1024,
                2048,
                10,
                5,
                2,
            );

            assert.equal(progressCallback.mock.calls.length, 1);

            const event = progressCallback.mock.calls[0][0] as CustomEvent;
            assert.equal(event.detail.format, "csv");
            assert.equal(event.detail.bytesProcessed, 1024);
            assert.equal(event.detail.totalBytes, 2048);
            assert.equal(event.detail.nodesLoaded, 10);
            assert.equal(event.detail.edgesLoaded, 5);

            cleanup(graphtyElement);
        });

        test("data-loading-complete event is forwarded", async() => {
            const {element: graphtyElement} = await createGraphtyElement();
            const completeCallback = vi.fn();

            graphtyElement.addEventListener("data-loading-complete", completeCallback);

            graphtyElement.graph.eventManager.emitDataLoadingComplete(
                "json",
                100, // nodesLoaded
                50, // edgesLoaded
                1500, // duration
                0, // errors
                0, // warnings
                true, // success
            );

            assert.equal(completeCallback.mock.calls.length, 1);

            const event = completeCallback.mock.calls[0][0] as CustomEvent;
            assert.equal(event.detail.format, "json");
            assert.equal(event.detail.nodesLoaded, 100);
            assert.equal(event.detail.edgesLoaded, 50);
            assert.equal(event.detail.success, true);

            cleanup(graphtyElement);
        });

        test("data-loading-error event is forwarded", async() => {
            const {element: graphtyElement} = await createGraphtyElement();
            const errorCallback = vi.fn();

            graphtyElement.addEventListener("data-loading-error", errorCallback);

            const testError = new Error("Parse error");
            graphtyElement.graph.eventManager.emitDataLoadingError(
                testError,
                "parsing",
                "csv",
                {line: 42, canContinue: false},
            );

            assert.equal(errorCallback.mock.calls.length, 1);

            const event = errorCallback.mock.calls[0][0] as CustomEvent;
            assert.equal(event.detail.error, testError);
            assert.equal(event.detail.context, "parsing");
            assert.equal(event.detail.line, 42);
            assert.equal(event.detail.canContinue, false);

            cleanup(graphtyElement);
        });
    });

    describe("operation queue events", () => {
        test("operation-queue-active event is forwarded", async() => {
            const {element: graphtyElement} = await createGraphtyElement();
            const activeCallback = vi.fn();

            graphtyElement.addEventListener("operation-queue-active", activeCallback);

            graphtyElement.graph.eventManager.emitGraphEvent("operation-queue-active", {});

            assert.equal(activeCallback.mock.calls.length, 1);

            cleanup(graphtyElement);
        });

        test("operation-queue-idle event is forwarded", async() => {
            const {element: graphtyElement} = await createGraphtyElement();
            const idleCallback = vi.fn();

            graphtyElement.addEventListener("operation-queue-idle", idleCallback);

            graphtyElement.graph.eventManager.emitGraphEvent("operation-queue-idle", {});

            assert.equal(idleCallback.mock.calls.length, 1);

            cleanup(graphtyElement);
        });
    });

    describe("multiple event listeners", () => {
        test("multiple listeners receive the same event", async() => {
            const {element: graphtyElement} = await createGraphtyElement();
            const callback1 = vi.fn();
            const callback2 = vi.fn();
            const callback3 = vi.fn();

            graphtyElement.addEventListener("graph-settled", callback1);
            graphtyElement.addEventListener("graph-settled", callback2);
            graphtyElement.addEventListener("graph-settled", callback3);

            graphtyElement.graph.eventManager.emitGraphSettled(graphtyElement.graph);

            assert.equal(callback1.mock.calls.length, 1);
            assert.equal(callback2.mock.calls.length, 1);
            assert.equal(callback3.mock.calls.length, 1);

            cleanup(graphtyElement);
        });

        test("removeEventListener stops event delivery", async() => {
            const {element: graphtyElement} = await createGraphtyElement();
            const callback = vi.fn();

            graphtyElement.addEventListener("graph-settled", callback);
            graphtyElement.graph.eventManager.emitGraphSettled(graphtyElement.graph);

            assert.equal(callback.mock.calls.length, 1);

            // Remove listener
            graphtyElement.removeEventListener("graph-settled", callback);
            graphtyElement.graph.eventManager.emitGraphSettled(graphtyElement.graph);

            // Should still be 1, not 2
            assert.equal(callback.mock.calls.length, 1);

            cleanup(graphtyElement);
        });
    });

    describe("event detail contains original event data", () => {
        test("event detail preserves all original event properties", async() => {
            const {element: graphtyElement} = await createGraphtyElement();
            const callback = vi.fn();

            graphtyElement.addEventListener("data-added", callback);

            graphtyElement.graph.eventManager.emitDataAdded(
                "nodes",
                42,
                true,
                false,
            );

            const event = callback.mock.calls[0][0] as CustomEvent;

            // Verify all properties are preserved in detail
            assert.equal(event.detail.type, "data-added");
            assert.equal(event.detail.dataType, "nodes");
            assert.equal(event.detail.count, 42);
            assert.equal(event.detail.shouldStartLayout, true);
            assert.equal(event.detail.shouldZoomToFit, false);

            cleanup(graphtyElement);
        });
    });

    describe("composed events cross shadow DOM boundary", () => {
        test("events are composed and can be caught outside shadow DOM", async() => {
            const {element: graphtyElement} = await createGraphtyElement();
            const documentCallback = vi.fn();

            // Listen on document (outside shadow DOM)
            document.addEventListener("graph-settled", documentCallback);

            graphtyElement.graph.eventManager.emitGraphSettled(graphtyElement.graph);

            assert.equal(documentCallback.mock.calls.length, 1);

            // Clean up document listener
            document.removeEventListener("graph-settled", documentCallback);
            cleanup(graphtyElement);
        });
    });

    describe("real-world integration scenarios", () => {
        test("events fire during full graph lifecycle", async() => {
            const {element: graphtyElement} = await createGraphtyElement();

            const dataAddedEvents: CustomEvent[] = [];
            const settledEvents: CustomEvent[] = [];

            graphtyElement.addEventListener("data-added", (e) => {
                dataAddedEvents.push(e as CustomEvent);
            });
            graphtyElement.addEventListener("graph-settled", (e) => {
                settledEvents.push(e as CustomEvent);
            });

            // Add nodes and edges
            await graphtyElement.graph.addNodes([
                {id: "node1"},
                {id: "node2"},
                {id: "node3"},
            ]);

            await graphtyElement.graph.addEdges([
                {src: "node1", dst: "node2"},
                {src: "node2", dst: "node3"},
            ]);

            // Wait for operations to complete
            await new Promise((resolve) => setTimeout(resolve, 300));

            // Should have received data-added events for both nodes and edges
            assert.isTrue(dataAddedEvents.length >= 2, "Should receive data-added events");

            const nodeEvents = dataAddedEvents.filter((e) => e.detail.dataType === "nodes");
            const edgeEvents = dataAddedEvents.filter((e) => e.detail.dataType === "edges");

            assert.isTrue(nodeEvents.length >= 1, "Should have at least one node data-added event");
            assert.isTrue(edgeEvents.length >= 1, "Should have at least one edge data-added event");

            cleanup(graphtyElement);
        });
    });
});
