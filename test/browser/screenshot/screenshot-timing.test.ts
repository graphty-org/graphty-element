import {afterEach, assert, test} from "vitest";

import type {Edge} from "../../../src/Edge";
import type {Graph} from "../../../src/Graph";
import {type EdgePosition, LayoutEngine, type Position} from "../../../src/layout/LayoutEngine";
import type {Node} from "../../../src/Node";
import {cleanupTestGraphWithData, createTestGraphWithData} from "./test-setup.js";

let graph: Graph;

afterEach(() => {
    cleanupTestGraphWithData(graph);
});

// Mock layout engine for testing
class MockLayoutEngine extends LayoutEngine {
    static type = "mock";
    static maxDimensions = 3;
    private _settled = false;
    private _nodes: Node[] = [];
    private _edges: Edge[] = [];

    async init(): Promise<void> {
        return Promise.resolve();
    }

    addNode(n: Node): void {
        this._nodes.push(n);
    }

    addEdge(e: Edge): void {
        this._edges.push(e);
    }

    getNodePosition(): Position {
        return {x: 0, y: 0, z: 0};
    }

    setNodePosition(): void {
        // No-op
    }

    getEdgePosition(): EdgePosition {
        return {
            src: {x: 0, y: 0, z: 0},
            dst: {x: 10, y: 10, z: 10},
        };
    }

    step(): void {
        // No-op
    }

    pin(): void {
        // No-op
    }

    unpin(): void {
        // No-op
    }

    get nodes(): Iterable<Node> {
        return this._nodes;
    }

    get edges(): Iterable<Edge> {
        return this._edges;
    }

    get isSettled(): boolean {
        return this._settled;
    }

    setSettled(settled: boolean): void {
        this._settled = settled;
    }
}

// Register mock layout engine
LayoutEngine.register(MockLayoutEngine);

test("waitForSettle waits for layout to settle", async() => {
    graph = await createTestGraphWithData();

    // Set up mock layout engine
    const layoutManager = graph.getLayoutManager();
    await layoutManager.setLayout("mock");

    const layoutEngine = layoutManager.layoutEngine as MockLayoutEngine;
    assert.ok(layoutEngine, "Layout engine should be set");
    layoutEngine.setSettled(false);

    let captured = false;
    const capturePromise = graph.captureScreenshot({
        timing: {waitForSettle: true},
    }).then(() => {
        captured = true;
    });

    // Should not capture immediately
    await new Promise((resolve) => setTimeout(resolve, 100));
    assert.equal(captured, false, "Should not capture before settling");

    // Settle layout
    layoutEngine.setSettled(true);
    // Access private eventManager for testing purposes
    (graph as unknown as {eventManager: {emitGraphEvent: (type: string, data: Record<string, unknown>) => void}}).eventManager.emitGraphEvent("graph-settled", {graph});

    // Now should capture
    await capturePromise;
    assert.equal(captured, true, "Should capture after settling");
});

test("waitForSettle times out if layout never settles", {timeout: 35000}, async() => {
    graph = await createTestGraphWithData();

    // Set up mock layout engine
    const layoutManager = graph.getLayoutManager();
    await layoutManager.setLayout("mock");

    const layoutEngine = layoutManager.layoutEngine as MockLayoutEngine;
    assert.ok(layoutEngine, "Layout engine should be set");
    layoutEngine.setSettled(false);

    // Set a short timeout for testing
    try {
        await graph.captureScreenshot({
            timing: {waitForSettle: true},
        });
        assert.fail("Should have thrown timeout error");
    } catch (error) {
        assert.ok(error instanceof Error, "Should throw an error");
        assert.match(error.message, /settle|timeout/i, "Error message should mention settling or timeout");
    }
});

test("waitForOperations waits for pending operations", async() => {
    graph = await createTestGraphWithData();

    // Queue a long operation
    let operationComplete = false;
    const longOperation = graph.operationQueue.queueOperationAsync(
        "data-add",
        async() => {
            await new Promise((resolve) => setTimeout(resolve, 200));
            operationComplete = true;
        },
    );

    let captured = false;
    const capturePromise = graph.captureScreenshot({
        timing: {waitForOperations: true, waitForSettle: false},
    }).then(() => {
        captured = true;
    });

    // Should not capture immediately
    await new Promise((resolve) => setTimeout(resolve, 50));
    assert.equal(captured, false, "Should not capture before operations complete");

    // Wait for operation to complete
    await longOperation;
    assert.equal(operationComplete, true, "Long operation should complete");

    // Now should capture
    await capturePromise;
    assert.equal(captured, true, "Should capture after operations complete");
});

test("can skip waiting with timing.waitForSettle: false", async() => {
    graph = await createTestGraphWithData();

    // Set up mock layout engine
    const layoutManager = graph.getLayoutManager();
    await layoutManager.setLayout("mock");

    const layoutEngine = layoutManager.layoutEngine as MockLayoutEngine;
    assert.ok(layoutEngine, "Layout engine should be set");
    layoutEngine.setSettled(false);

    // Should capture immediately without waiting
    const result = await graph.captureScreenshot({
        timing: {
            waitForSettle: false,
            waitForOperations: false,
        },
    });

    assert.ok(result.blob instanceof Blob, "Should return a blob");
});

test("can skip waiting for operations with timing.waitForOperations: false", async() => {
    graph = await createTestGraphWithData();

    // Queue a long operation
    void graph.operationQueue.queueOperationAsync(
        "data-add",
        async() => {
            await new Promise((resolve) => setTimeout(resolve, 500));
        },
    );

    // Should capture immediately without waiting for operations
    const startTime = Date.now();
    const result = await graph.captureScreenshot({
        timing: {
            waitForSettle: false,
            waitForOperations: false,
        },
    });
    const endTime = Date.now();

    assert.ok(result.blob instanceof Blob, "Should return a blob");
    assert.ok(endTime - startTime < 400, "Should capture quickly without waiting");
});
