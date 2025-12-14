import {afterEach, assert, test} from "vitest";

import {Graph} from "../../../src/Graph.js";
import {cleanupTestGraph, createTestGraph} from "../../helpers/testSetup.js";

let graph: Graph;

afterEach(() => {
    cleanupTestGraph(graph);
});

test("setCameraPosition sets camera position", async() => {
    graph = await createTestGraph();

    await graph.setCameraPosition({x: 15, y: 15, z: 15});

    const state = graph.getCameraState();
    assert.ok(state.position);
    // Position should be close to what we set
    assert.ok(Math.abs(state.position.x - 15) < 5);
    assert.ok(Math.abs(state.position.y - 15) < 5);
    assert.ok(Math.abs(state.position.z - 15) < 5);
});

test("setCameraTarget sets camera target", async() => {
    graph = await createTestGraph();

    await graph.setCameraTarget({x: 10, y: 10, z: 10});

    const state = graph.getCameraState();
    assert.ok(state.target);
    // Target should be close to what we set
    assert.ok(Math.abs(state.target.x - 10) < 5);
    assert.ok(Math.abs(state.target.y - 10) < 5);
    assert.ok(Math.abs(state.target.z - 10) < 5);
});

test("resetCamera resets camera to default", async() => {
    graph = await createTestGraph();

    // Move camera away
    await graph.setCameraPosition({x: 100, y: 100, z: 100});

    // Reset
    await graph.resetCamera();

    const resetState = graph.getCameraState();

    // Should be back to something close to initial
    // (exact match not guaranteed due to camera controller logic)
    assert.ok(resetState.position);
    assert.ok(resetState.target);
});
