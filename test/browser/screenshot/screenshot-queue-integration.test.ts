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

test("concurrent screenshot and operations complete successfully", async() => {
    graph = await createTestGraphWithData();

    let operationCompleted = false;
    let screenshotCompleted = false;

    // Queue screenshot (use waitForOperations: true to put it in queue)
    const screenshotPromise = graph.captureScreenshot({
        timing: {waitForSettle: false, waitForOperations: true},
    }).then((result) => {
        screenshotCompleted = true;
        return result;
    });

    // Queue another operation (use style-apply to avoid layout triggers)
    const operationPromise = graph.operationQueue.queueOperationAsync(
        "style-apply",
        () => {
            operationCompleted = true;
        },
    );

    await Promise.all([screenshotPromise, operationPromise]);

    // Both should complete successfully regardless of order
    assert.equal(operationCompleted, true, "Operation should complete");
    assert.equal(screenshotCompleted, true, "Screenshot should complete");
});

test("screenshots wait for queued operations when waitForOperations is true", async() => {
    graph = await createTestGraphWithData();

    let operationCompleted = false;

    // Queue a long operation first (use style-apply to avoid triggering layout-update)
    const operationPromise = graph.operationQueue.queueOperationAsync(
        "style-apply",
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

    // Queue a long operation (use style-apply to avoid triggering layout-update)
    void graph.operationQueue.queueOperationAsync(
        "style-apply",
        async() => {
            await new Promise((resolve) => {
                setTimeout(resolve, 1000);
            });
        },
    );

    // Screenshot with waitForOperations: false should not wait
    const startTime = Date.now();
    await graph.captureScreenshot({
        timing: {waitForSettle: false, waitForOperations: false},
    });
    const elapsed = Date.now() - startTime;

    // Should complete much faster than the 1000ms operation time (allow 800ms for CI variability)
    assert.ok(elapsed < 800, `Screenshot should complete quickly, took ${elapsed}ms`);
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
