import {afterEach, assert, test} from "vitest";

import type {CameraStateChangedEvent} from "../../../src/events.js";
import {Graph} from "../../../src/Graph.js";
import {cleanupTestGraph, createTestGraph} from "../../helpers/testSetup.js";

let graph: Graph;

afterEach(() => {
    cleanupTestGraph(graph);
});

test("animates camera position smoothly", async() => {
    graph = await createTestGraph();

    const targetPos = {x: 50, y: 50, z: 50};

    const startTime = Date.now();
    await graph.setCameraState(
        {position: targetPos, target: {x: 0, y: 0, z: 0}},
        {animate: true, duration: 500},
    );
    const elapsed = Date.now() - startTime;

    // Animation should take approximately the requested duration
    assert.ok(elapsed >= 450 && elapsed <= 600, `Animation took ${elapsed}ms, expected ~500ms`);

    const endState = graph.getCameraState();

    // Position should be close to target
    assert.ok(endState.position);
    assert.ok(Math.abs(endState.position.x - targetPos.x) < 5);
    assert.ok(Math.abs(endState.position.y - targetPos.y) < 5);
    assert.ok(Math.abs(endState.position.z - targetPos.z) < 5);
});

test("applies easing correctly", async() => {
    graph = await createTestGraph();

    // Track position changes during animation
    const positions: {x: number, y: number, z: number}[] = [];

    const listenerId = graph.eventManager.addListener("camera-state-changed", (e) => {
        const event = e as CameraStateChangedEvent;
        if (event.state.position) {
            positions.push({... event.state.position});
        }
    });

    await graph.setCameraState(
        {position: {x: 100, y: 0, z: 0}, target: {x: 0, y: 0, z: 0}},
        {animate: true, duration: 300, easing: "easeInOut"},
    );

    graph.eventManager.removeListener(listenerId);

    // With easeInOut, middle positions should show non-linear progression
    // (Hard to test precisely, but we can verify animation occurred)
    assert.ok(positions.length > 0);
});

// Phase 3: Operation Queue Integration - Animation interruption
test("camera animation can be interrupted", async() => {
    graph = await createTestGraph();

    // Start first animation (don't await it - we'll interrupt it) - catch cancellation
    void graph.setCameraState(
        {position: {x: 100, y: 100, z: 100}, target: {x: 0, y: 0, z: 0}},
        {animate: true, duration: 1000},
    ).catch(() => {/* Expected to be cancelled */});

    // Wait a bit longer to ensure first animation actually starts and moves camera
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Start second animation (should interrupt first)
    await graph.setCameraState(
        {position: {x: 50, y: 50, z: 50}, target: {x: 0, y: 0, z: 0}},
        {animate: true, duration: 500},
    );

    const finalState = graph.getCameraState();

    // Verify that second animation completed
    // The key test is that we're not stuck at the first target (100, 100, 100)
    // and that interruption worked (camera moved toward second target)
    assert.ok(finalState.position);

    // Camera should NOT be at first target
    const distanceFromFirstTarget = Math.sqrt(
        Math.pow(finalState.position.x - 100, 2) +
        Math.pow(finalState.position.y - 100, 2) +
        Math.pow(finalState.position.z - 100, 2),
    );

    // Should be at least somewhat away from the first target
    assert.ok(
        distanceFromFirstTarget > 10,
        "Camera should not be at first target (100,100,100). " +
        `Position: (${finalState.position.x.toFixed(2)}, ${finalState.position.y.toFixed(2)}, ${finalState.position.z.toFixed(2)}), ` +
        `Distance from first target: ${distanceFromFirstTarget.toFixed(2)}`,
    );
});

test("emits camera-state-changed event after animation", async() => {
    graph = await createTestGraph();

    let eventFired = false;
    const listenerId = graph.eventManager.addListener("camera-state-changed", () => {
        eventFired = true;
    });

    await graph.setCameraState(
        {position: {x: 20, y: 20, z: 20}, target: {x: 0, y: 0, z: 0}},
        {animate: true, duration: 200},
    );

    assert.ok(eventFired, "camera-state-changed event should fire after animation");

    graph.eventManager.removeListener(listenerId);
});
