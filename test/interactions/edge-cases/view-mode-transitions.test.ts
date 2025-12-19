/**
 * View Mode Transition Tests
 *
 * Tests verify switching between view modes correctly cleans up state.
 */

import {assert} from "chai";
import {afterEach, beforeEach, describe, test, vi} from "vitest";

import type {StyleSchema} from "../../../src/config";
import {Graph} from "../../../src/Graph";

function createStyleTemplate(twoD: boolean): StyleSchema {
    return {
        graphtyTemplate: true,
        majorVersion: "1",
        graph: {
            addDefaultStyle: true,
            twoD,
            layout: "fixed",
            layoutOptions: {dim: twoD ? 2 : 3},
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
            layout: {type: "fixed", preSteps: 0, stepMultiplier: 1, minDelta: 0.001, zoomStepInterval: 5},
            node: {pinOnDrag: true},
        },
    } as unknown as StyleSchema;
}

const TEST_NODES = [{id: "node1", x: 0, y: 0, z: 0}, {id: "node2", x: 5, y: 0, z: 0}];
const TEST_EDGES = [{src: "node1", dst: "node2"}];

describe("View Mode Transitions", () => {
    let graph: Graph;
    let container: HTMLDivElement;

    beforeEach(async() => {
        container = document.createElement("div");
        container.style.width = "800px";
        container.style.height = "600px";
        document.body.appendChild(container);

        graph = new Graph(container);
        await graph.init();
        await graph.setStyleTemplate(createStyleTemplate(false));
        await graph.addNodes(TEST_NODES);
        await graph.addEdges(TEST_EDGES);
        await graph.operationQueue.waitForCompletion();
        await new Promise((resolve) => setTimeout(resolve, 100));
    });

    afterEach(() => {
        vi.restoreAllMocks();
        graph.dispose();
        document.body.removeChild(container);
    });

    test("2D -> 3D cleans up 2D input state", async() => {
        await graph.setViewMode("2d");
        await graph.operationQueue.waitForCompletion();
        await new Promise((resolve) => setTimeout(resolve, 100));

        assert.equal(graph.getViewMode(), "2d", "Should be in 2D mode");

        await graph.setViewMode("3d");
        await graph.operationQueue.waitForCompletion();
        await new Promise((resolve) => setTimeout(resolve, 100));

        assert.equal(graph.getViewMode(), "3d", "Should be in 3D mode");

        const activeController = graph.camera.getActiveController();
        assert.isDefined(activeController, "Active controller should be defined");
        assert.equal(graph.getNodes().length, 2, "All nodes should still exist");
    });

    test("3D -> 2D cleans up orbit state", async() => {
        assert.equal(graph.getViewMode(), "3d", "Should start in 3D mode");

        await graph.setViewMode("2d");
        await graph.operationQueue.waitForCompletion();
        await new Promise((resolve) => setTimeout(resolve, 100));

        assert.equal(graph.getViewMode(), "2d", "Should be in 2D mode");

        const activeController = graph.camera.getActiveController();
        assert.isDefined(activeController, "Active controller should be defined");
        if (activeController) {
            assert.isDefined(activeController.camera.orthoTop, "2D camera should have orthoTop");
        }

        assert.equal(graph.getNodes().length, 2, "All nodes should still exist");
    });

    test("rapid mode switching does not corrupt state", async() => {
        assert.equal(graph.getViewMode(), "3d", "Should start in 3D mode");
        assert.equal(graph.getNodes().length, 2, "Should have 2 nodes initially");

        const modes: ("2d" | "3d")[] = ["2d", "3d", "2d", "3d", "2d", "3d"];
        for (const mode of modes) {
            await graph.setViewMode(mode);
            await new Promise((resolve) => setTimeout(resolve, 20));
        }

        await graph.operationQueue.waitForCompletion();
        await new Promise((resolve) => setTimeout(resolve, 200));

        assert.isDefined(graph.scene, "Scene should still exist");
        const activeController = graph.camera.getActiveController();
        assert.isDefined(activeController, "Active controller should exist");
        if (activeController) {
            const cameraPos = activeController.camera.position;
            assert.isTrue(isFinite(cameraPos.x), "Camera X should be finite");
            assert.isTrue(isFinite(cameraPos.y), "Camera Y should be finite");
            assert.isTrue(isFinite(cameraPos.z), "Camera Z should be finite");
        }

        assert.equal(graph.getNodes().length, 2, "All nodes should still exist");
    });

    test("3D -> 2D flattens Z coordinates", async() => {
        assert.equal(graph.getViewMode(), "3d", "Should start in 3D mode");

        const node1 = graph.getNode("node1");
        assert.isDefined(node1, "Node 1 should exist");
        assert.isNotNull(node1);

        node1.mesh.position.z = 5;
        await new Promise((resolve) => setTimeout(resolve, 50));
        assert.notEqual(node1.mesh.position.z, 0, "Node Z should be non-zero before transition");

        await graph.setViewMode("2d");
        await graph.operationQueue.waitForCompletion();
        await new Promise((resolve) => setTimeout(resolve, 100));

        assert.closeTo(node1.mesh.position.z, 0, 0.01, "Node Z should be flattened to 0 in 2D mode");
    });

    test("camera type changes correctly with view mode", async() => {
        assert.equal(graph.getViewMode(), "3d", "Should be in 3D mode");
        let controller = graph.camera.getActiveController();
        assert.isDefined(controller, "Controller should exist in 3D mode");

        await graph.setViewMode("2d");
        await graph.operationQueue.waitForCompletion();
        await new Promise((resolve) => setTimeout(resolve, 100));

        controller = graph.camera.getActiveController();
        if (controller) {
            assert.isDefined(controller.camera.orthoTop, "2D mode should use orthographic camera");
        }

        await graph.setViewMode("3d");
        await graph.operationQueue.waitForCompletion();
        await new Promise((resolve) => setTimeout(resolve, 100));

        controller = graph.camera.getActiveController();
        assert.isDefined(controller, "Controller should exist after switching back to 3D");
    });
});
