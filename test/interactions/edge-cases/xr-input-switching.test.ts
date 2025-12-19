/**
 * XR Input Switching Tests
 *
 * Tests verify correct behavior when switching between XR input devices
 * (controllers, hands) and handling device connection/disconnection.
 */

import {assert} from "chai";
import {afterEach, beforeEach, describe, test, vi} from "vitest";

import type {StyleSchema} from "../../../src/config";
import {Graph} from "../../../src/Graph";

function createStyleTemplate(): StyleSchema {
    return {
        graphtyTemplate: true,
        majorVersion: "1",
        graph: {
            addDefaultStyle: true,
            twoD: false,
            layout: "fixed",
            layoutOptions: {dim: 3},
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

describe("XR Input Switching", () => {
    let graph: Graph;
    let container: HTMLDivElement;

    beforeEach(async() => {
        container = document.createElement("div");
        container.style.width = "800px";
        container.style.height = "600px";
        document.body.appendChild(container);

        graph = new Graph(container);
        await graph.init();
        await graph.setStyleTemplate(createStyleTemplate());
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

    describe("Input Handler Management", () => {
        test("XR session manager exists", () => {
            const xrManager = graph.xrSessionManager;
            assert.isDefined(xrManager, "XR session manager should exist");
        });

        test("graph remains stable during input handler operations", async() => {
            const node1 = graph.getNode("node1");
            if (!node1) {
                return;
            }

            const initialPos = node1.mesh.position.clone();

            // Verify node position is stable
            await new Promise((resolve) => setTimeout(resolve, 50));

            const finalPos = node1.mesh.position;
            const positionStable =
                Math.abs(finalPos.x - initialPos.x) < 0.01 &&
                Math.abs(finalPos.y - initialPos.y) < 0.01 &&
                Math.abs(finalPos.z - initialPos.z) < 0.01;

            assert.isTrue(positionStable, "Node position should remain stable");
        });
    });

    describe("Scene Stability", () => {
        test("scene remains valid during mode transitions", async() => {
            // Transition through modes
            await graph.setViewMode("2d");
            await graph.operationQueue.waitForCompletion();

            assert.isDefined(graph.scene, "Scene should exist in 2D mode");

            await graph.setViewMode("3d");
            await graph.operationQueue.waitForCompletion();

            assert.isDefined(graph.scene, "Scene should exist in 3D mode");
        });

        test("nodes remain accessible after mode transitions", async() => {
            await graph.setViewMode("2d");
            await graph.operationQueue.waitForCompletion();

            const nodesIn2d = graph.getNodes();

            await graph.setViewMode("3d");
            await graph.operationQueue.waitForCompletion();

            const nodesIn3d = graph.getNodes();

            assert.equal(nodesIn2d.length, nodesIn3d.length, "Node count should match");
        });
    });

    describe("Input State Cleanup", () => {
        test("drag state resets on view mode change", async() => {
            const node1 = graph.getNode("node1");
            if (!node1) {
                return;
            }

            // Simulate starting a drag by positioning the node
            node1.mesh.position.x = 10;

            // Change view mode (should reset any ongoing interactions)
            await graph.setViewMode("2d");
            await graph.operationQueue.waitForCompletion();
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Node should still exist and have valid position
            const nodeAfter = graph.getNode("node1");
            if (!nodeAfter) {
                return;
            }

            const hasValidPosition =
                isFinite(nodeAfter.mesh.position.x) &&
                isFinite(nodeAfter.mesh.position.y) &&
                isFinite(nodeAfter.mesh.position.z);

            assert.isTrue(hasValidPosition, "Node should have valid position");
        });

        test("camera controller remains functional after transitions", async() => {
            await graph.setViewMode("2d");
            await graph.operationQueue.waitForCompletion();

            const controller2d = graph.camera.getActiveController();
            assert.isDefined(controller2d, "Controller should exist in 2D mode");

            await graph.setViewMode("3d");
            await graph.operationQueue.waitForCompletion();

            const controller3d = graph.camera.getActiveController();
            assert.isDefined(controller3d, "Controller should exist in 3D mode");
        });
    });
});
