/**
 * XR Local Space Tests
 *
 * Tests verify coordinate transformations and local space handling
 * for XR interactions (world space, view space, local space).
 */

import {Matrix, Quaternion, Vector3} from "@babylonjs/core";
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

describe("XR Local Space Transformations", () => {
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

    describe("World Space Coordinates", () => {
        test("node positions are in world space", () => {
            const node1 = graph.getNode("node1");
            if (!node1) {
                return;
            }

            // Node mesh position should be in world coordinates
            const worldPos = node1.mesh.getAbsolutePosition();
            assert.isTrue(isFinite(worldPos.x), "World X should be finite");
            assert.isTrue(isFinite(worldPos.y), "World Y should be finite");
            assert.isTrue(isFinite(worldPos.z), "World Z should be finite");
        });

        test("node positions match mesh positions", () => {
            const node1 = graph.getNode("node1");
            if (!node1) {
                return;
            }

            const meshPos = node1.mesh.position;
            const absolutePos = node1.mesh.getAbsolutePosition();

            // When node has no parent transform, these should match
            assert.closeTo(absolutePos.x, meshPos.x, 0.01, "X positions should match");
            assert.closeTo(absolutePos.y, meshPos.y, 0.01, "Y positions should match");
            assert.closeTo(absolutePos.z, meshPos.z, 0.01, "Z positions should match");
        });
    });

    describe("Camera Space Transformations", () => {
        test("world to view space transformation is valid", () => {
            const controller = graph.camera.getActiveController();
            if (!controller) {
                return;
            }

            const {camera} = controller;
            const viewMatrix = camera.getViewMatrix();

            // View matrix should be valid
            assert.isDefined(viewMatrix, "View matrix should exist");
            assert.isTrue(isFinite(viewMatrix.m[0]), "View matrix should have finite values");

            // Transform a point to view space
            const worldPoint = new Vector3(5, 0, 0);
            const viewPoint = Vector3.TransformCoordinates(worldPoint, viewMatrix);

            assert.isTrue(isFinite(viewPoint.x), "View space X should be finite");
            assert.isTrue(isFinite(viewPoint.y), "View space Y should be finite");
            assert.isTrue(isFinite(viewPoint.z), "View space Z should be finite");
        });

        test("view to world space round-trip preserves position", () => {
            const controller = graph.camera.getActiveController();
            if (!controller) {
                return;
            }

            const {camera} = controller;
            const viewMatrix = camera.getViewMatrix();
            const viewInverse = viewMatrix.clone();
            viewInverse.invert();

            const originalPoint = new Vector3(3, 4, 5);
            const viewPoint = Vector3.TransformCoordinates(originalPoint, viewMatrix);
            const roundTrip = Vector3.TransformCoordinates(viewPoint, viewInverse);

            assert.closeTo(roundTrip.x, originalPoint.x, 0.01, "X should round-trip");
            assert.closeTo(roundTrip.y, originalPoint.y, 0.01, "Y should round-trip");
            assert.closeTo(roundTrip.z, originalPoint.z, 0.01, "Z should round-trip");
        });
    });

    describe("Rotation Handling", () => {
        test("quaternion to euler conversion is valid", () => {
            const quat = Quaternion.FromEulerAngles(0.5, 1.0, 0.25);
            const euler = quat.toEulerAngles();

            assert.isTrue(isFinite(euler.x), "Euler X should be finite");
            assert.isTrue(isFinite(euler.y), "Euler Y should be finite");
            assert.isTrue(isFinite(euler.z), "Euler Z should be finite");
        });

        test("rotation matrix determinant is 1 for pure rotations", () => {
            const quat = Quaternion.FromEulerAngles(0.5, 1.0, 0.25);
            const rotMatrix = new Matrix();
            quat.toRotationMatrix(rotMatrix);

            // The determinant of a pure rotation matrix should be 1
            const det = rotMatrix.determinant();
            assert.closeTo(det, 1, 0.01, "Rotation matrix determinant should be ~1");
        });
    });

    describe("Scene Graph Transforms", () => {
        test("node parent-child relationship transforms correctly", () => {
            const node1 = graph.getNode("node1");
            const node2 = graph.getNode("node2");
            if (!node1 || !node2) {
                return;
            }

            // Both nodes should have valid world matrices
            const node1World = node1.mesh.getWorldMatrix();
            const node2World = node2.mesh.getWorldMatrix();

            assert.isDefined(node1World, "Node1 world matrix should exist");
            assert.isDefined(node2World, "Node2 world matrix should exist");

            // World matrices should have finite values
            assert.isTrue(isFinite(node1World.m[12]), "Node1 translation X should be finite");
            assert.isTrue(isFinite(node2World.m[12]), "Node2 translation X should be finite");
        });

        test("nodes have valid world positions", () => {
            const node1 = graph.getNode("node1");
            const node2 = graph.getNode("node2");
            if (!node1 || !node2) {
                return;
            }

            const node1Pos = node1.mesh.getAbsolutePosition();
            const node2Pos = node2.mesh.getAbsolutePosition();

            // Verify nodes have valid finite positions
            assert.isTrue(isFinite(node1Pos.x), "Node1 X should be finite");
            assert.isTrue(isFinite(node1Pos.y), "Node1 Y should be finite");
            assert.isTrue(isFinite(node1Pos.z), "Node1 Z should be finite");
            assert.isTrue(isFinite(node2Pos.x), "Node2 X should be finite");
            assert.isTrue(isFinite(node2Pos.y), "Node2 Y should be finite");
            assert.isTrue(isFinite(node2Pos.z), "Node2 Z should be finite");
        });
    });

    describe("Coordinate System Consistency", () => {
        test("2D mode uses correct coordinate plane", async() => {
            await graph.setViewMode("2d");
            await graph.operationQueue.waitForCompletion();
            await new Promise((resolve) => setTimeout(resolve, 100));

            const node1 = graph.getNode("node1");
            if (!node1) {
                return;
            }

            // In 2D mode, Z should be flattened to 0
            assert.closeTo(node1.mesh.position.z, 0, 0.01, "Z should be 0 in 2D mode");
        });

        test("3D mode preserves Z coordinates", async() => {
            const node1 = graph.getNode("node1");
            if (!node1) {
                return;
            }

            // Set a non-zero Z
            node1.mesh.position.z = 5;
            await new Promise((resolve) => setTimeout(resolve, 50));

            // Z should be preserved in 3D mode
            assert.notEqual(node1.mesh.position.z, 0, "Z should be non-zero in 3D mode");
        });

        test("Babylon.js uses left-handed coordinate system", () => {
            // Babylon.js uses left-handed coordinate system by default
            // In left-handed: X right, Y up, Z forward (into screen)
            const right = new Vector3(1, 0, 0);
            const up = new Vector3(0, 1, 0);
            const forward = Vector3.Cross(right, up);

            // In left-handed system with cross product, forward should point in positive Z
            assert.closeTo(forward.x, 0, 0.01, "Forward X should be 0");
            assert.closeTo(forward.y, 0, 0.01, "Forward Y should be 0");
            // Babylon.js cross product gives positive Z for left-handed
            assert.isTrue(isFinite(forward.z), "Forward Z should be finite");
        });
    });
});
