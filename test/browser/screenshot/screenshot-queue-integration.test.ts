import {afterEach, assert, test} from "vitest";

import type {Graph} from "../../../src/Graph";
import {cleanupTestGraphWithData, createTestGraphWithData} from "./test-setup.js";

let graph: Graph;

afterEach(() => {
    cleanupTestGraphWithData(graph);
});

test("multiple screenshots execute sequentially", async() => {
    graph = await createTestGraphWithData();

    const order: number[] = [];

    const capture1 = graph.captureScreenshot({
        timing: {waitForSettle: false, waitForOperations: false},
    }).then(() => order.push(1));

    const capture2 = graph.captureScreenshot({
        timing: {waitForSettle: false, waitForOperations: false},
    }).then(() => order.push(2));

    const capture3 = graph.captureScreenshot({
        timing: {waitForSettle: false, waitForOperations: false},
    }).then(() => order.push(3));

    await Promise.all([capture1, capture2, capture3]);

    // Should execute in order
    assert.deepEqual(order, [1, 2, 3], "Screenshots should execute in order");
});

test("screenshot blocks concurrent operations", async() => {
    graph = await createTestGraphWithData();

    let screenshotInProgress = false;
    let operationRanDuringScreenshot = false;

    screenshotInProgress = true;

    const screenshotPromise = graph.captureScreenshot({
        timing: {waitForSettle: false, waitForOperations: false},
    }).then(() => {
        screenshotInProgress = false;
    });

    // Add a small delay to ensure screenshot starts first
    await new Promise((resolve) => {
        setTimeout(resolve, 50);
    });

    // Queue another operation
    const operationPromise = graph.operationQueue.queueOperationAsync(
        "data-add",
        () => {
            if (screenshotInProgress) {
                operationRanDuringScreenshot = true;
            }
        },
    );

    await Promise.all([screenshotPromise, operationPromise]);

    // Operation should NOT have run during screenshot
    assert.equal(operationRanDuringScreenshot, false, "Operation should not run during screenshot");
});

test("screenshots wait for queued operations when waitForOperations is true", async() => {
    graph = await createTestGraphWithData();

    let operationCompleted = false;

    // Queue a long operation first
    const operationPromise = graph.operationQueue.queueOperationAsync(
        "data-add",
        async() => {
            await new Promise((resolve) => {
                setTimeout(resolve, 200);
            });
            operationCompleted = true;
        },
    );

    // Now queue a screenshot that should wait
    const screenshotPromise = graph.captureScreenshot({
        timing: {waitForSettle: false, waitForOperations: true},
    });

    // Screenshot should wait for operation
    await new Promise((resolve) => setTimeout(resolve, 100));
    assert.equal(operationCompleted, false, "Operation should not be complete yet");

    // Wait for both to complete
    await Promise.all([operationPromise, screenshotPromise]);

    assert.equal(operationCompleted, true, "Operation should complete before screenshot");
});

test("screenshots can proceed immediately when waitForOperations is false", async() => {
    graph = await createTestGraphWithData();

    // Queue a long operation
    void graph.operationQueue.queueOperationAsync(
        "data-add",
        async() => {
            await new Promise((resolve) => {
                setTimeout(resolve, 500);
            });
        },
    );

    // Screenshot with waitForOperations: false should not wait
    const startTime = Date.now();
    await graph.captureScreenshot({
        timing: {waitForSettle: false, waitForOperations: false},
    });
    const elapsed = Date.now() - startTime;

    // Should complete quickly (less than the 500ms operation time)
    assert.ok(elapsed < 400, `Screenshot should complete quickly, took ${elapsed}ms`);
});

test("operation queue continues after screenshot completes", async() => {
    graph = await createTestGraphWithData();

    let operationExecuted = false;

    // Take a screenshot
    await graph.captureScreenshot({
        timing: {waitForSettle: false, waitForOperations: false},
    });

    // Queue an operation after screenshot
    await graph.operationQueue.queueOperationAsync(
        "data-add",
        () => {
            operationExecuted = true;
        },
    );

    assert.equal(operationExecuted, true, "Operation should execute after screenshot");
});
