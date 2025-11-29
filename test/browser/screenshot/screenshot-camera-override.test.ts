import {afterEach, assert, test} from "vitest";

import type {Graph} from "../../../src/Graph";
import {cleanupTestGraphWithData, createTestGraphWithData} from "./test-setup.js";

let graph: Graph;

afterEach(() => {
    cleanupTestGraphWithData(graph);
});

test("camera override temporarily changes camera", async() => {
    graph = await createTestGraphWithData();

    // Get original camera state
    const originalState = graph.getCameraState();

    // Capture with camera override
    const result = await graph.captureScreenshot({
        camera: {
            position: {x: 100, y: 100, z: 100},
            target: {x: 0, y: 0, z: 0},
        },
        timing: {
            waitForSettle: false,
            waitForOperations: false,
        },
    });

    // After capture, camera should be restored
    const restoredState = graph.getCameraState();

    assert.ok(result.blob instanceof Blob, "Should return a blob");
    assert.deepEqual(
        restoredState.position,
        originalState.position,
        "Camera position should be restored",
    );
    assert.deepEqual(
        restoredState.target,
        originalState.target,
        "Camera target should be restored",
    );
});

test("camera override works without affecting subsequent captures", async() => {
    graph = await createTestGraphWithData();

    // First capture with override
    await graph.captureScreenshot({
        camera: {
            position: {x: 50, y: 50, z: 50},
            target: {x: 0, y: 0, z: 0},
        },
        timing: {
            waitForSettle: false,
            waitForOperations: false,
        },
    });

    // Second capture should use current camera (not the override)
    const stateBefore = graph.getCameraState();
    await graph.captureScreenshot({
        timing: {
            waitForSettle: false,
            waitForOperations: false,
        },
    });
    const stateAfter = graph.getCameraState();

    assert.deepEqual(stateAfter, stateBefore, "Camera should remain unchanged after normal capture");
});

test("camera preset resolves correctly", async() => {
    graph = await createTestGraphWithData();

    // Capture with camera preset
    const result = await graph.captureScreenshot({
        camera: {preset: "fitToGraph"},
        timing: {
            waitForSettle: false,
            waitForOperations: false,
        },
    });

    assert.ok(result.blob instanceof Blob, "Should return a blob with preset");
});

test("camera override is restored even if capture throws error", async() => {
    graph = await createTestGraphWithData();

    const originalState = graph.getCameraState();

    // Try to capture with invalid options that might cause an error
    try {
        await graph.captureScreenshot({
            camera: {
                position: {x: 200, y: 200, z: 200},
                target: {x: 0, y: 0, z: 0},
            },
            // Force a very large resolution to potentially cause an error
            width: 50000,
            height: 50000,
            timing: {
                waitForSettle: false,
                waitForOperations: false,
            },
        });
    } catch {
        // Error expected, ignore it
    }

    // Camera should still be restored
    const restoredState = graph.getCameraState();
    assert.deepEqual(
        restoredState.position,
        originalState.position,
        "Camera position should be restored even after error",
    );
    assert.deepEqual(
        restoredState.target,
        originalState.target,
        "Camera target should be restored even after error",
    );
});
