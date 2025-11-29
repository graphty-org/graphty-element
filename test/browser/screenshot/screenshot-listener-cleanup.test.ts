import {afterEach, assert, test} from "vitest";

import type {Graph} from "../../../src/Graph";
import {cleanupTestGraphWithData, createTestGraphWithData} from "./test-setup.js";

let graph: Graph;

afterEach(() => {
    cleanupTestGraphWithData(graph);
});

test("multiple screenshots can be captured without listener accumulation", async() => {
    graph = await createTestGraphWithData();

    // Get initial listener count (Graph registers some internal listeners)
    const initialListenerCount = graph.listenerCount();

    // Capture multiple screenshots in succession
    // If listeners accumulated, this would eventually fail or cause memory issues
    for (let i = 0; i < 5; i++) {
        const result = await graph.captureScreenshot({
            timing: {waitForSettle: true},
        });
        assert.ok(result.blob instanceof Blob, `Screenshot ${i + 1} should produce a blob`);
    }

    // Listener count should be the same after all screenshots complete
    const finalListenerCount = graph.listenerCount();
    assert.equal(finalListenerCount, initialListenerCount, "Listener count should not increase after screenshots");
});

test("screenshot capture completes even when layout is already settled", async() => {
    graph = await createTestGraphWithData();

    // Wait for layout to settle before taking screenshot
    await new Promise((resolve) => setTimeout(resolve, 500));

    const result = await graph.captureScreenshot({
        timing: {waitForSettle: true},
    });

    assert.ok(result.blob instanceof Blob, "Screenshot should be captured when already settled");
    assert.ok(result.metadata.captureTime >= 0, "Capture time should be recorded");
});

test("screenshot with waitForSettle=false skips layout settling", async() => {
    graph = await createTestGraphWithData();

    const result = await graph.captureScreenshot({
        timing: {waitForSettle: false},
    });

    assert.ok(result.blob instanceof Blob, "Screenshot should be captured without waiting");
});
