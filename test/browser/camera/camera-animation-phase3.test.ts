import {afterEach, assert, test} from "vitest";

import type {CameraStateChangedEvent} from "../../../src/events.js";
import {Graph} from "../../../src/Graph.js";
import {cleanupTestGraph, createTestGraph} from "../../helpers/testSetup.js";

let graph: Graph;

afterEach(() => {
    cleanupTestGraph(graph);
});

/**
 * Phase 3: Operation Queue Integration Tests
 * These tests verify:
 * 1. Rapid successive animations (obsolescence)
 * 2. Disposal during animation
 * 3. Queue integration behavior
 */

test("rapid successive camera animations - last one wins", async() => {
    graph = await createTestGraph();

    // Fire off multiple animations rapidly - catch cancellations
    void graph.setCameraState(
        {position: {x: 100, y: 0, z: 0}, target: {x: 0, y: 0, z: 0}},
        {animate: true, duration: 500},
    ).catch(() => {/* Expected to be cancelled */});

    void graph.setCameraState(
        {position: {x: 0, y: 100, z: 0}, target: {x: 0, y: 0, z: 0}},
        {animate: true, duration: 500},
    ).catch(() => {/* Expected to be cancelled */});

    void graph.setCameraState(
        {position: {x: 0, y: 0, z: 100}, target: {x: 0, y: 0, z: 0}},
        {animate: true, duration: 500},
    ).catch(() => {/* Expected to be cancelled */});

    // Final animation should win
    await graph.setCameraState(
        {position: {x: 50, y: 50, z: 50}, target: {x: 0, y: 0, z: 0}},
        {animate: true, duration: 500},
    );

    const finalState = graph.getCameraState();

    // Should be at the last target position
    if (!finalState.position) {
        throw new Error("finalState.position is undefined");
    }

    assert.ok(
        Math.abs(finalState.position.x - 50) < 10,
        `Position X is ${finalState.position.x}, expected ~50`,
    );
    assert.ok(
        Math.abs(finalState.position.y - 50) < 10,
        `Position Y is ${finalState.position.y}, expected ~50`,
    );
    assert.ok(
        Math.abs(finalState.position.z - 50) < 10,
        `Position Z is ${finalState.position.z}, expected ~50`,
    );
});

test("disposal during animation does not throw", async() => {
    graph = await createTestGraph();

    // Start a long animation - catch cancellation
    void graph.setCameraState(
        {position: {x: 100, y: 100, z: 100}, target: {x: 0, y: 0, z: 0}},
        {animate: true, duration: 2000},
    ).catch(() => {/* Expected to be cancelled on disposal */});

    // Wait a bit to ensure animation is running
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Dispose the graph while animation is running
    // Should not throw any errors
    assert.doesNotThrow(() => {
        graph.dispose();
    });
});

test("skipQueue option bypasses operation queue", async() => {
    graph = await createTestGraph();

    // Start a long animation in the queue
    void graph.setCameraState(
        {position: {x: 100, y: 100, z: 100}, target: {x: 0, y: 0, z: 0}},
        {animate: true, duration: 1000},
    );

    // Wait a bit
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Use skipQueue to set camera immediately (should not wait for queue)
    const startTime = Date.now();
    await graph.setCameraState(
        {position: {x: 25, y: 25, z: 25}, target: {x: 0, y: 0, z: 0}},
        {skipQueue: true},
    );
    const elapsed = Date.now() - startTime;

    // Should complete almost immediately (< 50ms), not wait for animation
    assert.ok(elapsed < 50, `skipQueue took ${elapsed}ms, expected <50ms`);

    const state = graph.getCameraState();
    if (!state.position) {
        throw new Error("state.position is undefined");
    }

    assert.ok(Math.abs(state.position.x - 25) < 5);
});

test("operation queue allows sequential animations", async() => {
    graph = await createTestGraph();

    const positions: {x: number, y: number, z: number}[] = [];

    // Track when each animation completes
    const listenerId = graph.eventManager.addListener("camera-state-changed", (e) => {
        const event = e as CameraStateChangedEvent;
        if (event.state.position) {
            positions.push({... event.state.position});
        }
    });

    // Queue two animations - because of obsolescence, first will be cancelled by second
    const promise1 = graph.setCameraState(
        {position: {x: 50, y: 0, z: 0}, target: {x: 0, y: 0, z: 0}},
        {animate: true, duration: 300},
    ).catch(() => {/* Expected to be cancelled */});

    const promise2 = graph.setCameraState(
        {position: {x: 0, y: 50, z: 0}, target: {x: 0, y: 0, z: 0}},
        {animate: true, duration: 300},
    );

    // Wait for both to complete (first will be cancelled, second will succeed)
    await Promise.all([promise1, promise2]);

    graph.eventManager.removeListener(listenerId);

    // Because of obsolescence, only the second animation should complete
    // (first gets cancelled by second)
    const finalState = graph.getCameraState();
    if (!finalState.position) {
        throw new Error("finalState.position is undefined");
    }

    // Should be at second target (y=50)
    assert.ok(
        Math.abs(finalState.position.y - 50) < 10,
        `Final Y is ${finalState.position.y}, expected ~50`,
    );
});

test("camera animation with custom description", async() => {
    graph = await createTestGraph();

    // Just verify that custom description doesn't break anything
    await graph.setCameraState(
        {position: {x: 30, y: 30, z: 30}, target: {x: 0, y: 0, z: 0}},
        {animate: true, duration: 200, description: "Custom camera move"},
    );

    const state = graph.getCameraState();
    if (!state.position) {
        throw new Error("state.position is undefined");
    }

    assert.ok(Math.abs(state.position.x - 30) < 10);
});

test("multiple rapid interruptions complete gracefully", async() => {
    graph = await createTestGraph();

    // Start many animations in quick succession - catch cancellations
    for (let i = 0; i < 5; i++) {
        void graph.setCameraState(
            {position: {x: i * 20, y: i * 20, z: i * 20}, target: {x: 0, y: 0, z: 0}},
            {animate: true, duration: 300},
        ).catch(() => {/* Expected to be cancelled */});
    }

    // Final animation
    await graph.setCameraState(
        {position: {x: 100, y: 100, z: 100}, target: {x: 0, y: 0, z: 0}},
        {animate: true, duration: 300},
    );

    // Should complete at final position
    const state = graph.getCameraState();
    if (!state.position) {
        throw new Error("state.position is undefined");
    }

    assert.ok(
        Math.abs(state.position.x - 100) < 10,
        `Final position X is ${state.position.x}, expected ~100`,
    );
});
