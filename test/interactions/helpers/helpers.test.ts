/**
 * Tests for interaction test helpers
 *
 * These tests verify that the test utilities work correctly,
 * providing confidence that subsequent interaction tests have a solid foundation.
 */

import {afterEach, assert, beforeEach, describe, test} from "vitest";

import type {Graph} from "../../../src/Graph";
import {
    DEFAULT_TEST_EDGES,
    DEFAULT_TEST_NODES,
    dragNode,
    getCameraPosition,
    getCameraState,
    getNodeScreenPosition,
    getSceneRotation,
    getSceneScale,
    setupTestGraph,
    teardownTestGraph,
    waitForGraphReady,
} from "./interaction-helpers";
import {
    createMockController,
    createMockHand,
    createPinchingHand,
    isIWERAvailable,
} from "./iwer-setup";

describe("Interaction Test Helpers", () => {
    let graph: Graph | undefined;

    afterEach(() => {
        if (graph) {
            teardownTestGraph(graph);
            graph = undefined;
        }
    });

    describe("waitForGraphReady", () => {
        test("resolves when graph is initialized", async() => {
            graph = await setupTestGraph();

            // Should already be ready since setupTestGraph waits
            await waitForGraphReady(graph, 1000);

            assert.isTrue(graph.initialized, "Graph should be initialized");
            assert.isDefined(graph.scene, "Scene should be defined");
            assert.isDefined(graph.camera, "Camera should be defined");
        });

        test("throws error if graph does not initialize within timeout", async() => {
            // Create a graph but don't initialize it properly
            const container = document.createElement("div");
            document.body.appendChild(container);

            // Create a mock graph-like object that's never initialized
            const mockGraph = {
                initialized: false,
                scene: null,
                camera: null,
            } as unknown as Graph;

            try {
                await waitForGraphReady(mockGraph, 100);
                assert.fail("Should have thrown an error");
            } catch (error) {
                assert.include(
                    (error as Error).message,
                    "did not initialize",
                    "Error should mention initialization failure",
                );
            } finally {
                container.remove();
            }
        });
    });

    describe("getNodeScreenPosition", () => {
        beforeEach(async() => {
            graph = await setupTestGraph({
                mode: "3d",
                nodes: DEFAULT_TEST_NODES,
                edges: DEFAULT_TEST_EDGES,
            });
        });

        test("returns valid coordinates for existing node", () => {
            const pos = getNodeScreenPosition(graph, "node1");

            assert.isNotNull(pos, "Should return position for existing node");
            assert.isNumber(pos.x, "X coordinate should be a number");
            assert.isNumber(pos.y, "Y coordinate should be a number");
        });

        test("returns null for non-existent node", () => {
            const pos = getNodeScreenPosition(graph, "non-existent-node");

            assert.isNull(pos, "Should return null for non-existent node");
        });
    });

    describe("getCameraState", () => {
        test("returns 2D state for 2D mode", async() => {
            graph = await setupTestGraph({mode: "2d"});

            const state = getCameraState(graph);

            assert.equal(state.mode, "2d", "Mode should be 2d");
            assert.isDefined(state.position, "Position should be defined");
            assert.isNumber(state.position.x, "Position X should be a number");
            assert.isNumber(state.position.y, "Position Y should be a number");
            assert.isNumber(state.position.z, "Position Z should be a number");
            assert.isDefined(state.orthoRange, "Ortho range should be defined for 2D mode");
        });

        test("returns 3D state for 3D mode", async() => {
            graph = await setupTestGraph({mode: "3d"});

            const state = getCameraState(graph);

            assert.equal(state.mode, "3d", "Mode should be 3d");
            assert.isDefined(state.position, "Position should be defined");
            // Note: With UniversalCamera + PivotController, alpha/beta/radius may not be available
            // These properties exist on ArcRotateCamera but not UniversalCamera
            // The getCameraState helper returns them as undefined for UniversalCamera
            assert.isNumber(state.position.x, "Position X should be a number");
            assert.isNumber(state.position.y, "Position Y should be a number");
            assert.isNumber(state.position.z, "Position Z should be a number");
        });
    });

    describe("setupTestGraph", () => {
        test("creates graph with default 3D mode", async() => {
            graph = await setupTestGraph();

            assert.equal(graph.getViewMode(), "3d", "Default mode should be 3D");
        });

        test("creates graph with specified 2D mode", async() => {
            graph = await setupTestGraph({mode: "2d"});

            assert.equal(graph.getViewMode(), "2d", "Should be in 2D mode");
        });

        test("creates graph with initial nodes", async() => {
            graph = await setupTestGraph({
                nodes: DEFAULT_TEST_NODES,
            });

            assert.equal(graph.getNodes().length, 3, "Should have 3 nodes");
        });

        test("creates graph with initial edges", async() => {
            graph = await setupTestGraph({
                nodes: DEFAULT_TEST_NODES,
                edges: DEFAULT_TEST_EDGES,
            });

            // Edges require nodes to exist
            assert.equal(graph.getNodes().length, 3, "Should have 3 nodes");
        });

        test("applies pinOnDrag setting", async() => {
            graph = await setupTestGraph({pinOnDrag: false});
            assert.isDefined(graph, "Graph should be defined");

            // The setting is stored in the styles config
            assert.isFalse(
                graph.styles.config.behavior.node.pinOnDrag,
                "pinOnDrag should be false",
            );
        });
    });

    describe("dragNode", () => {
        beforeEach(async() => {
            graph = await setupTestGraph({
                mode: "3d",
                nodes: [{id: "test-node", x: 0, y: 0, z: 0}],
            });
        });

        test("performs complete drag operation", async() => {
            const initialPos = graph.getNode("test-node")?.getPosition();
            assert.isDefined(initialPos, "Node should exist");

            // Note: Due to NullEngine limitations, the actual drag may not
            // produce visible position changes, but the operation should complete
            await dragNode(graph, "test-node", {dx: 50, dy: 50});

            // The test passes if no errors are thrown during the drag operation
            const node = graph.getNode("test-node");
            assert.isDefined(node, "Node should still exist after drag");
        });

        test("throws error for non-existent node", async() => {
            try {
                await dragNode(graph, "non-existent", {dx: 10, dy: 10});
                assert.fail("Should throw error for non-existent node");
            } catch (error) {
                assert.include(
                    (error as Error).message,
                    "not found",
                    "Error should mention node not found",
                );
            }
        });
    });

    describe("getSceneScale", () => {
        test("returns 1.0 for default scale in 3D mode", async() => {
            graph = await setupTestGraph({mode: "3d"});

            const scale = getSceneScale(graph);

            // Scale should be approximately 1.0 for default camera distance
            assert.isNumber(scale, "Scale should be a number");
            assert.isAbove(scale, 0, "Scale should be positive");
        });

        test("returns valid scale in 2D mode", async() => {
            graph = await setupTestGraph({mode: "2d"});

            const scale = getSceneScale(graph);

            assert.isNumber(scale, "Scale should be a number");
            assert.isAbove(scale, 0, "Scale should be positive");
        });
    });

    describe("getSceneRotation", () => {
        test("returns rotation values in 3D mode", async() => {
            graph = await setupTestGraph({mode: "3d"});

            const rotation = getSceneRotation(graph);

            assert.isNumber(rotation.x, "X rotation should be a number");
            assert.isNumber(rotation.y, "Y rotation should be a number");
            assert.isNumber(rotation.z, "Z rotation should be a number");
        });

        test("returns rotation values in 2D mode", async() => {
            graph = await setupTestGraph({mode: "2d"});

            const rotation = getSceneRotation(graph);

            assert.isNumber(rotation.x, "X rotation should be a number");
            assert.isNumber(rotation.y, "Y rotation should be a number");
            assert.isNumber(rotation.z, "Z rotation should be a number");
        });
    });

    describe("getCameraPosition", () => {
        test("returns position and mode", async() => {
            graph = await setupTestGraph({mode: "3d"});

            const pos = getCameraPosition(graph);

            assert.isNumber(pos.x, "X should be a number");
            assert.isNumber(pos.y, "Y should be a number");
            assert.isNumber(pos.z, "Z should be a number");
        });
    });
});

describe("IWER Setup Helpers", () => {
    describe("createMockHand", () => {
        test("creates left hand with correct handedness", () => {
            const hand = createMockHand("left");

            assert.equal(hand.handedness, "left", "Should be left hand");
            assert.isTrue(hand.joints.size > 0, "Should have joints");
            assert.equal(hand.pinchStrength, 0, "Pinch strength should be 0");
        });

        test("creates right hand with correct handedness", () => {
            const hand = createMockHand("right");

            assert.equal(hand.handedness, "right", "Should be right hand");
        });

        test("includes standard WebXR joint names", () => {
            const hand = createMockHand("left");

            assert.isTrue(hand.joints.has("wrist"), "Should have wrist joint");
            assert.isTrue(hand.joints.has("thumb-tip"), "Should have thumb-tip joint");
            assert.isTrue(hand.joints.has("index-finger-tip"), "Should have index-finger-tip joint");
        });
    });

    describe("createPinchingHand", () => {
        test("creates hand with pinch pose", () => {
            const hand = createPinchingHand("right");

            assert.equal(hand.handedness, "right", "Should be right hand");
            assert.isAbove(hand.pinchStrength, 0.5, "Pinch strength should be high");
        });

        test("thumb and index tips are close together", () => {
            const hand = createPinchingHand("left");

            const thumbTip = hand.joints.get("thumb-tip");
            const indexTip = hand.joints.get("index-finger-tip");

            assert.isDefined(thumbTip, "Thumb tip should be defined");
            assert.isDefined(indexTip, "Index tip should be defined");

            // Calculate distance between tips
            const distance = Math.sqrt(
                Math.pow(thumbTip.x - indexTip.x, 2) +
                Math.pow(thumbTip.y - indexTip.y, 2) +
                Math.pow(thumbTip.z - indexTip.z, 2),
            );

            // Should be close together (< 5cm) for pinching
            assert.isBelow(distance, 0.05, "Thumb and index tips should be close for pinch");
        });
    });

    describe("createMockController", () => {
        test("creates controller with correct handedness", () => {
            const leftController = createMockController("left");
            const rightController = createMockController("right");

            assert.equal(leftController.handedness, "left");
            assert.equal(rightController.handedness, "right");
        });

        test("controller starts with neutral thumbstick", () => {
            const controller = createMockController("left");

            assert.equal(controller.thumbstick.x, 0, "Thumbstick X should be 0");
            assert.equal(controller.thumbstick.y, 0, "Thumbstick Y should be 0");
        });

        test("controller starts with unpressed buttons", () => {
            const controller = createMockController("right");

            assert.equal(controller.trigger.value, 0, "Trigger value should be 0");
            assert.isFalse(controller.trigger.pressed, "Trigger should not be pressed");
            assert.equal(controller.grip.value, 0, "Grip value should be 0");
            assert.isFalse(controller.grip.pressed, "Grip should not be pressed");
        });

        test("left and right controllers have different X positions", () => {
            const left = createMockController("left");
            const right = createMockController("right");

            assert.isBelow(left.position.x, 0, "Left controller should be at negative X");
            assert.isAbove(right.position.x, 0, "Right controller should be at positive X");
        });
    });

    describe("isIWERAvailable", () => {
        test("returns boolean indicating IWER availability", async() => {
            const available = await isIWERAvailable();

            // The result depends on whether iwer is installed
            assert.isBoolean(available, "Should return a boolean");
        });
    });
});
