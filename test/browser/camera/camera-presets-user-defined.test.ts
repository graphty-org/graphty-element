import {assert} from "chai";
import {afterEach, beforeEach, describe, test} from "vitest";

import {Graph} from "../../../src/Graph.js";

describe("Camera Presets - User Defined", () => {
    let graph: Graph;
    let container: HTMLElement;

    beforeEach(async() => {
        // Create a container element
        container = document.createElement("div");
        container.id = "test-container-user";
        container.style.width = "800px";
        container.style.height = "600px";
        document.body.appendChild(container);

        // Create graph instance - engine creation handled automatically
        graph = new Graph(container);

        // Initialize
        await graph.init();
    });

    afterEach(() => {
        graph.dispose();
        document.body.removeChild(container);
    });

    test("saveCameraPreset stores current camera state", async() => {
        await graph.setCameraPosition({x: 75, y: 75, z: 75});
        await graph.setCameraTarget({x: 10, y: 10, z: 10});

        graph.saveCameraPreset("myView");

        const presets = graph.getCameraPresets();
        assert.ok(presets.myView);

        const {myView} = presets;
        assert.ok(typeof myView === "object" && "position" in myView);

        if ("position" in myView && myView.position) {
            assert.approximately(myView.position.x, 75, 0.1);
            assert.approximately(myView.position.y, 75, 0.1);
            assert.approximately(myView.position.z, 75, 0.1);
        }

        if ("target" in myView && myView.target) {
            assert.approximately(myView.target.x, 10, 0.1);
            assert.approximately(myView.target.y, 10, 0.1);
            assert.approximately(myView.target.z, 10, 0.1);
        }
    });

    test("loadCameraPreset applies saved camera state", async() => {
        await graph.setCameraPosition({x: 100, y: 100, z: 100});
        graph.saveCameraPreset("customView");

        // Move camera somewhere else
        await graph.setCameraPosition({x: 0, y: 0, z: 10});

        // Load preset
        await graph.loadCameraPreset("customView", {animate: false});

        const state = graph.getCameraState();
        assert.ok(state.position);
        assert.approximately(state.position.x, 100, 0.1);
        assert.approximately(state.position.y, 100, 0.1);
        assert.approximately(state.position.z, 100, 0.1);
    });

    test("cannot overwrite built-in presets", () => {
        try {
            graph.saveCameraPreset("fitToGraph");
            assert.fail("Should have thrown an error");
        } catch (error) {
            assert.ok(error instanceof Error);
            assert.equal(error.name, "ScreenshotError");
            assert.ok(error.message.includes("Cannot overwrite built-in preset"));
        }
    });

    test("exportCameraPresets returns JSON of user-defined presets", async() => {
        await graph.setCameraPosition({x: 50, y: 50, z: 50});
        graph.saveCameraPreset("view1");

        await graph.setCameraPosition({x: 100, y: 100, z: 100});
        graph.saveCameraPreset("view2");

        const exported = graph.exportCameraPresets();

        assert.ok(exported.view1);
        assert.ok(exported.view2);

        assert.ok(exported.view1.position);
        assert.approximately(exported.view1.position.x, 50, 0.1);
        assert.approximately(exported.view1.position.y, 50, 0.1);
        assert.approximately(exported.view1.position.z, 50, 0.1);

        assert.ok(exported.view2.position);
        assert.approximately(exported.view2.position.x, 100, 0.1);
        assert.approximately(exported.view2.position.y, 100, 0.1);
        assert.approximately(exported.view2.position.z, 100, 0.1);

        // Built-in presets should NOT be exported
        assert.equal(exported.fitToGraph, undefined);
    });

    test("importCameraPresets loads presets from JSON", () => {
        const presetsJSON = {
            view1: {
                type: "arcRotate" as const,
                position: {x: 30, y: 30, z: 30},
                target: {x: 0, y: 0, z: 0},
            },
            view2: {
                type: "arcRotate" as const,
                position: {x: 60, y: 60, z: 60},
                target: {x: 0, y: 0, z: 0},
            },
        };

        graph.importCameraPresets(presetsJSON);

        const presets = graph.getCameraPresets();
        assert.ok(presets.view1);
        assert.ok(presets.view2);

        const {view1} = presets;
        assert.ok(typeof view1 === "object" && "position" in view1);

        if ("position" in view1 && view1.position) {
            assert.equal(view1.position.x, 30);
            assert.equal(view1.position.y, 30);
            assert.equal(view1.position.z, 30);
        }
    });

    test("getCameraPresets returns both built-in and user-defined presets", async() => {
        await graph.setCameraPosition({x: 50, y: 50, z: 50});
        graph.saveCameraPreset("myCustomView");

        const presets = graph.getCameraPresets();

        // Built-in presets should be marked as builtin
        assert.ok(presets.fitToGraph);
        assert.ok(presets.topView);
        assert.ok(presets.sideView);
        assert.ok(presets.frontView);
        assert.ok(presets.isometric);

        // User-defined presets should have full state
        assert.ok(presets.myCustomView);
        const {myCustomView} = presets;
        assert.ok(
            typeof myCustomView === "object" &&
        "position" in myCustomView,
        );
    });

    test("loading unknown preset throws error", async() => {
        try {
            await graph.loadCameraPreset("nonExistentPreset");
            assert.fail("Should have thrown an error");
        } catch (error) {
            assert.ok(error instanceof Error);
            assert.equal(error.name, "ScreenshotError");
            assert.ok(error.message.includes("Unknown camera preset"));
        }
    });
});
