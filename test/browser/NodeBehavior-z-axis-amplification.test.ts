/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
import {Vector3} from "@babylonjs/core";
import {afterEach, assert, beforeEach, describe, test} from "vitest";

import type {AdHocData} from "../../src/config/common";
import {Graph} from "../../src/Graph";
import {cleanupTestGraph, createTestGraph} from "../helpers/testSetup";

describe("Z-Axis Amplification", () => {
    let graph: Graph;

    beforeEach(async() => {
        // Will be configured in each test
    });

    afterEach(() => {
        if (graph) {
            cleanupTestGraph(graph);
        }
    });

    test("should NOT apply Z-axis amplification in desktop mode by default", async () => {
        // Create graph with default config (no XR session)
        graph = await createTestGraph({
            xr: {
                enabled: true,
                input: {
                    zAxisAmplification: 10.0,
                    enableZAmplificationInDesktop: false, // Explicitly disabled
                },
            },
        });

        // Add a node
        const dataManager = graph.getDataManager();
        dataManager.addNode({id: "1", label: "Node 1"} as AdHocData);

        // Get the node
        const node = dataManager.getNode("1");
        assert.isDefined(node);
        assert.isDefined(node.dragHandler, "Node should have drag handler");

        // Start drag at z=0
        const startPos = new Vector3(0, 0, 0);
        node.dragHandler.onDragStart(startPos);

        // Move by deltaZ = 0.1 (and small deltas for x,y)
        const newPos = new Vector3(0.1, 0.1, 0.1);
        node.dragHandler.onDragUpdate(newPos);

        // Verify Z-axis NOT amplified (should be 0.1, not 1.0)
        assert.approximately(node.mesh.position.z, 0.1, 0.01, "Z should not be amplified in desktop mode");
        assert.approximately(node.mesh.position.x, 0.1, 0.01, "X should move normally");
        assert.approximately(node.mesh.position.y, 0.1, 0.01, "Y should move normally");

        node.dragHandler.onDragEnd();
    });

    test("should apply Z-axis amplification in desktop when configured", async () => {
        // Create graph with desktop Z-amplification enabled
        graph = await createTestGraph({
            xr: {
                enabled: true,
                input: {
                    zAxisAmplification: 5.0,
                    enableZAmplificationInDesktop: true, // Explicitly enabled
                },
            },
        });

        // Add a node
        const dataManager = graph.getDataManager();
        dataManager.addNode({id: "1", label: "Node 1"} as AdHocData);

        // Get the node
        const node = dataManager.getNode("1");
        assert.isDefined(node);
        assert.isDefined(node.dragHandler, "Node should have drag handler");

        // Start drag at z=0
        const startPos = new Vector3(0, 0, 0);
        node.dragHandler.onDragStart(startPos);

        // Move by deltaZ = 0.1 (and small deltas for x,y)
        const newPos = new Vector3(0.1, 0.1, 0.1);
        node.dragHandler.onDragUpdate(newPos);

        // Verify Z-axis IS amplified by 5× (0.1 * 5 = 0.5)
        assert.approximately(node.mesh.position.z, 0.5, 0.01, "Z should be amplified by 5× in desktop mode");
        assert.approximately(node.mesh.position.x, 0.1, 0.01, "X should NOT be amplified");
        assert.approximately(node.mesh.position.y, 0.1, 0.01, "Y should NOT be amplified");

        node.dragHandler.onDragEnd();
    });

    test("should NOT amplify X and Y axes even when Z-amplification enabled", async () => {
        // Create graph with Z-amplification enabled
        graph = await createTestGraph({
            xr: {
                enabled: true,
                input: {
                    zAxisAmplification: 10.0,
                    enableZAmplificationInDesktop: true,
                },
            },
        });

        // Add a node
        const dataManager = graph.getDataManager();
        dataManager.addNode({id: "1", label: "Node 1"} as AdHocData);

        // Get the node
        const node = dataManager.getNode("1");
        assert.isDefined(node);
        assert.isDefined(node.dragHandler, "Node should have drag handler");

        // Start drag at origin
        const startPos = new Vector3(0, 0, 0);
        node.dragHandler.onDragStart(startPos);

        // Move with deltaX=0.2, deltaY=0.3, deltaZ=0.1
        const newPos = new Vector3(0.2, 0.3, 0.1);
        node.dragHandler.onDragUpdate(newPos);

        // Verify only Z is amplified
        assert.approximately(node.mesh.position.x, 0.2, 0.01, "X should NOT be amplified");
        assert.approximately(node.mesh.position.y, 0.3, 0.01, "Y should NOT be amplified");
        assert.approximately(node.mesh.position.z, 1.0, 0.01, "Z should be amplified by 10×");

        node.dragHandler.onDragEnd();
    });

    test("should use default amplification factor of 10.0", async () => {
        // Create graph without specifying zAxisAmplification
        graph = await createTestGraph({
            xr: {
                enabled: true,
                input: {
                    enableZAmplificationInDesktop: true,
                    // zAxisAmplification not specified, should default to 10.0
                },
            },
        });

        // Add a node
        const dataManager = graph.getDataManager();
        dataManager.addNode({id: "1", label: "Node 1"} as AdHocData);

        // Get the node
        const node = dataManager.getNode("1");
        assert.isDefined(node);
        assert.isDefined(node.dragHandler, "Node should have drag handler");

        // Start drag
        const startPos = new Vector3(0, 0, 0);
        node.dragHandler.onDragStart(startPos);

        // Move by deltaZ = 0.1
        const newPos = new Vector3(0, 0, 0.1);
        node.dragHandler.onDragUpdate(newPos);

        // Verify default 10× amplification
        assert.approximately(node.mesh.position.z, 1.0, 0.01, "Z should be amplified by default 10×");

        node.dragHandler.onDragEnd();
    });

    test("should work with custom amplification factors", async () => {
        // Test with amplification factor of 20.0
        graph = await createTestGraph({
            xr: {
                enabled: true,
                input: {
                    zAxisAmplification: 20.0,
                    enableZAmplificationInDesktop: true,
                },
            },
        });

        // Add a node
        const dataManager = graph.getDataManager();
        dataManager.addNode({id: "1", label: "Node 1"} as AdHocData);

        // Get the node
        const node = dataManager.getNode("1");
        assert.isDefined(node);

        // Start drag
        const startPos = new Vector3(0, 0, 0);
        node.dragHandler.onDragStart(startPos);

        // Move by deltaZ = 0.05
        const newPos = new Vector3(0, 0, 0.05);
        node.dragHandler.onDragUpdate(newPos);

        // Verify 20× amplification (0.05 * 20 = 1.0)
        assert.approximately(node.mesh.position.z, 1.0, 0.01, "Z should be amplified by 20×");

        node.dragHandler.onDragEnd();
    });
});
