import {assert} from "chai";
import {afterEach, beforeEach, describe, test} from "vitest";

import type {AdHocData} from "../../../src/config/index.js";
import {Graph} from "../../../src/Graph.js";

describe("Camera Presets - 2D", () => {
    let graph: Graph;
    let container: HTMLElement;

    beforeEach(async() => {
        // Create a container element
        container = document.createElement("div");
        container.id = "test-container-2d";
        container.style.width = "800px";
        container.style.height = "600px";
        document.body.appendChild(container);

        // Create graph instance with 2D mode
        graph = new Graph(container);

        // Initialize
        await graph.init();

        // Switch to 2D mode and use fixed layout (using full template like working 2D tests)
        await graph.setStyleTemplate({
            graphtyTemplate: true,
            majorVersion: "1",
            graph: {
                twoD: true,
                viewMode: "2d",
                background: {backgroundType: "color", color: "#f0f0f0"},
                addDefaultStyle: true,
                startingCameraDistance: 30,
                layout: "fixed",
            },
            layers: [],
            data: {
                knownFields: {
                    nodeIdPath: "id",
                    nodeWeightPath: null,
                    nodeTimePath: null,
                    edgeSrcIdPath: "src",
                    edgeDstIdPath: "dst",
                    edgeWeightPath: null,
                    edgeTimePath: null,
                },
            },
            behavior: {
                layout: {
                    type: "fixed",
                    preSteps: 0,
                    stepMultiplier: 1,
                    minDelta: 0.001,
                    zoomStepInterval: 5,
                },
                node: {
                    pinOnDrag: true,
                },
            },
        });

        // Wait for camera to be activated
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Wait for all operations to settle
        await graph.waitForSettled();
    });

    afterEach(() => {
        graph.dispose();
        document.body.removeChild(container);
    });

    test("fitToGraph preset calculates 2D zoom based on node bounds", async() => {
    // Set up graph with known bounds
        await graph.addNode({id: "n1", position: {x: 0, y: 0, z: 0}} as unknown as AdHocData);
        await graph.addNode({id: "n2", position: {x: 200, y: 150, z: 0}} as unknown as AdHocData);
        await graph.addNode({id: "n3", position: {x: -100, y: -75, z: 0}} as unknown as AdHocData);
        await graph.waitForSettled();

        const presetState = graph.resolveCameraPreset("fitToGraph");

        assert.equal(presetState.type, "orthographic");
        assert.ok(typeof presetState.zoom === "number");
        assert.ok(presetState.pan);

        // Pan should be at center of bounding box
        const expectedCenter = {x: 50, y: 37.5}; // Center of [-100, 200] x [-75, 150]
        assert.approximately(presetState.pan.x, expectedCenter.x, 1);
        assert.approximately(presetState.pan.y, expectedCenter.y, 1);

        // Zoom should fit all nodes with padding
        assert.ok(presetState.zoom > 0);
    });

    test("topView preset provides standard 2D view", async() => {
    // Add some nodes to establish bounds
        await graph.addNode({id: "n1", position: {x: 0, y: 0, z: 0}} as unknown as AdHocData);
        await graph.addNode({id: "n2", position: {x: 100, y: 100, z: 0}} as unknown as AdHocData);
        await graph.waitForSettled();

        const presetState = graph.resolveCameraPreset("topView");

        assert.equal(presetState.type, "orthographic");
        assert.equal(presetState.zoom, 1.0); // Default 2D zoom
        assert.ok(presetState.pan);
    });

    test("3D-only presets throw error when used with 2D camera - sideView", () => {
        try {
            graph.resolveCameraPreset("sideView");
            assert.fail("Should have thrown an error");
        } catch (error) {
            assert.ok(error instanceof Error);
            assert.equal(error.name, "ScreenshotError");
            assert.ok(error.message.includes("only available for 3D cameras"));
        }
    });

    test("3D-only presets throw error when used with 2D camera - frontView", () => {
        try {
            graph.resolveCameraPreset("frontView");
            assert.fail("Should have thrown an error");
        } catch (error) {
            assert.ok(error instanceof Error);
            assert.equal(error.name, "ScreenshotError");
            assert.ok(error.message.includes("only available for 3D cameras"));
        }
    });

    test("3D-only presets throw error when used with 2D camera - isometric", () => {
        try {
            graph.resolveCameraPreset("isometric");
            assert.fail("Should have thrown an error");
        } catch (error) {
            assert.ok(error instanceof Error);
            assert.equal(error.name, "ScreenshotError");
            assert.ok(error.message.includes("only available for 3D cameras"));
        }
    });
});
