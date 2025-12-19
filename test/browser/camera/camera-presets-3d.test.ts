import {assert} from "chai";
import {afterEach, beforeEach, describe, test} from "vitest";

import type {AdHocData} from "../../../src/config/index.js";
import {Graph} from "../../../src/Graph.js";

describe("Camera Presets - 3D", () => {
    let graph: Graph;
    let container: HTMLElement;

    beforeEach(async() => {
        // Create a container element
        container = document.createElement("div");
        container.id = "test-container";
        container.style.width = "800px";
        container.style.height = "600px";
        document.body.appendChild(container);

        // Create graph instance - engine creation handled automatically
        graph = new Graph(container);

        // Initialize
        await graph.init();

        // Use fixed layout so positions from data are used directly (using full template)
        await graph.setStyleTemplate({
            graphtyTemplate: true,
            majorVersion: "1",
            graph: {
                twoD: false,
                viewMode: "3d",
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
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Wait for all operations to settle
        await graph.waitForSettled();
    });

    afterEach(() => {
        graph.dispose();
        document.body.removeChild(container);
    });

    test("fitToGraph preset calculates 3D position based on node bounds", async() => {
    // Set up graph with known bounds
        await graph.addNode({id: "n1", position: {x: 0, y: 0, z: 0}} as unknown as AdHocData);
        await graph.addNode({id: "n2", position: {x: 100, y: 100, z: 100}} as unknown as AdHocData);
        await graph.addNode({id: "n3", position: {x: -50, y: -50, z: -50}} as unknown as AdHocData);
        await graph.waitForSettled();

        const presetState = graph.resolveCameraPreset("fitToGraph");

        assert.equal(presetState.type, "arcRotate");
        assert.ok(presetState.position);
        assert.ok(presetState.target);

        // Camera should be positioned to see all nodes
        // Target should be at center of bounding box
        const expectedCenter = {x: 25, y: 25, z: 25}; // Center of [-50, 100]
        assert.approximately(presetState.target.x, expectedCenter.x, 1);
        assert.approximately(presetState.target.y, expectedCenter.y, 1);
        assert.approximately(presetState.target.z, expectedCenter.z, 1);
    });

    test("topView preset looks down from above in 3D mode", async() => {
    // Add some nodes to establish bounds
        await graph.addNode({id: "n1", position: {x: 0, y: 0, z: 0}} as unknown as AdHocData);
        await graph.addNode({id: "n2", position: {x: 100, y: 100, z: 100}} as unknown as AdHocData);
        await graph.waitForSettled();

        const presetState = graph.resolveCameraPreset("topView");

        assert.equal(presetState.type, "arcRotate");
        assert.ok(presetState.position);
        assert.ok(presetState.target);

        // Position should be above the target
        assert.ok(presetState.position.y > presetState.target.y);
        // X and Z should match target (looking straight down)
        assert.approximately(presetState.position.x, presetState.target.x, 0.1);
        assert.approximately(presetState.position.z, presetState.target.z, 0.1);
    });

    test("sideView preset positions camera to the side", async() => {
    // Add some nodes to establish bounds
        await graph.addNode({id: "n1", position: {x: 0, y: 0, z: 0}} as unknown as AdHocData);
        await graph.addNode({id: "n2", position: {x: 100, y: 100, z: 100}} as unknown as AdHocData);
        await graph.waitForSettled();

        const presetState = graph.resolveCameraPreset("sideView");

        assert.equal(presetState.type, "arcRotate");
        assert.ok(presetState.position);
        assert.ok(presetState.target);

        // X should be offset from target
        assert.notEqual(presetState.position.x, presetState.target.x);
    });

    test("frontView preset positions camera in front", async() => {
    // Add some nodes to establish bounds
        await graph.addNode({id: "n1", position: {x: 0, y: 0, z: 0}} as unknown as AdHocData);
        await graph.addNode({id: "n2", position: {x: 100, y: 100, z: 100}} as unknown as AdHocData);
        await graph.waitForSettled();

        const presetState = graph.resolveCameraPreset("frontView");

        assert.equal(presetState.type, "arcRotate");
        assert.ok(presetState.position);
        assert.ok(presetState.target);

        // Z should be offset from target
        assert.notEqual(presetState.position.z, presetState.target.z);
    });

    test("isometric preset creates classic 3D isometric angle", async() => {
    // Add some nodes to establish bounds
        await graph.addNode({id: "n1", position: {x: 0, y: 0, z: 0}} as unknown as AdHocData);
        await graph.addNode({id: "n2", position: {x: 100, y: 100, z: 100}} as unknown as AdHocData);
        await graph.waitForSettled();

        const presetState = graph.resolveCameraPreset("isometric");

        assert.equal(presetState.type, "arcRotate");
        assert.ok(presetState.alpha !== undefined);
        assert.ok(presetState.beta !== undefined);

        // Classic isometric: alpha ≈ 45°, beta ≈ 35.264°
        assert.approximately(presetState.alpha, Math.PI / 4, 0.1);
        assert.approximately(presetState.beta, 0.615, 0.1); // ≈35.264° in radians
    });
});
