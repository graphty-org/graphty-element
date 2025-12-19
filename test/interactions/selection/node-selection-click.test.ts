/**
 * Node selection interaction tests for 2D and 3D modes.
 *
 * These tests verify that clicking on nodes selects them correctly,
 * and clicking on the background deselects the current selection.
 */
/* eslint-disable @typescript-eslint/no-unnecessary-condition -- Chai assertions don't narrow types */
import {afterEach, assert, beforeEach, describe, it, vi} from "vitest";

import type {Graph} from "../../../src/Graph";
import {
    clickOnBackground,
    clickOnNode,
    DEFAULT_TEST_EDGES,
    DEFAULT_TEST_NODES,
    setupTestGraph,
    teardownTestGraph,
    waitForGraphReady,
} from "../helpers/interaction-helpers";

describe("Node Selection - Click Interactions", () => {
    let graph: Graph;

    afterEach(() => {
        // graph is assigned in beforeEach so will always be defined
        teardownTestGraph(graph);
    });

    describe("3D mode", () => {
        beforeEach(async() => {
            graph = await setupTestGraph({
                mode: "3d",
                layout: "fixed",
                nodes: DEFAULT_TEST_NODES,
                edges: DEFAULT_TEST_EDGES,
            });
            await waitForGraphReady(graph);
        });

        it("clicking on a node selects it", async() => {
            // Initially no node is selected
            assert.isNull(graph.getSelectedNode());

            // Click on node1
            const clicked = await clickOnNode(graph, "node1");
            assert.isTrue(clicked, "Should be able to click on node");

            // Node should be selected
            const selected = graph.getSelectedNode();
            assert.isNotNull(selected);
            assert.equal(selected?.id, "node1");
        });

        it("clicking on a different node changes selection", async() => {
            // Select node1
            await clickOnNode(graph, "node1");
            const firstSelected = graph.getSelectedNode();
            assert.isNotNull(firstSelected);
            assert.equal(firstSelected?.id, "node1");

            // Click on node2
            await clickOnNode(graph, "node2");

            // Selection should change to node2
            const selected = graph.getSelectedNode();
            assert.isNotNull(selected);
            assert.equal(selected?.id, "node2");
        });

        it("clicking on background deselects the current node", async() => {
            // Select a node first
            await clickOnNode(graph, "node1");
            assert.isNotNull(graph.getSelectedNode());

            // Click on background
            await clickOnBackground(graph);

            // Node should be deselected
            assert.isNull(graph.getSelectedNode());
        });

        it("selection-changed event fires on click selection", async() => {
            const callback = vi.fn();
            graph.eventManager.addListener("selection-changed", callback);

            // Click on a node
            await clickOnNode(graph, "node1");

            assert.isTrue(callback.mock.calls.length >= 1, "selection-changed event should fire");

            const event = callback.mock.calls[0][0];
            assert.equal(event.type, "selection-changed");
            assert.isNull(event.previousNode);
            assert.isNotNull(event.currentNode);
            assert.equal(event.currentNode?.id, "node1");
        });

        it("selected node has _selected property set to true", async() => {
            // Click to select
            await clickOnNode(graph, "node1");

            const node = graph.getNode("node1");
            assert.isNotNull(node);
            assert.isTrue(node?.data._selected);
        });

        it("deselected node has _selected property set to false", async() => {
            // Select then deselect
            await clickOnNode(graph, "node1");
            await clickOnBackground(graph);

            const node = graph.getNode("node1");
            assert.isNotNull(node);
            assert.isFalse(node?.data._selected);
        });
    });

    describe("2D mode", () => {
        beforeEach(async() => {
            graph = await setupTestGraph({
                mode: "2d",
                layout: "fixed",
                nodes: DEFAULT_TEST_NODES,
                edges: DEFAULT_TEST_EDGES,
            });
            await waitForGraphReady(graph);
        });

        it("clicking on a node selects it", async() => {
            // Initially no node is selected
            assert.isNull(graph.getSelectedNode());

            // Click on node1
            const clicked = await clickOnNode(graph, "node1");
            assert.isTrue(clicked, "Should be able to click on node");

            // Node should be selected
            const selected = graph.getSelectedNode();
            assert.isNotNull(selected);
            assert.equal(selected?.id, "node1");
        });

        it("clicking on a different node changes selection", async() => {
            // Select node1
            await clickOnNode(graph, "node1");
            const firstSelected = graph.getSelectedNode();
            assert.isNotNull(firstSelected);
            assert.equal(firstSelected?.id, "node1");

            // Click on node2
            await clickOnNode(graph, "node2");

            // Selection should change to node2
            const selected = graph.getSelectedNode();
            assert.isNotNull(selected);
            assert.equal(selected?.id, "node2");
        });

        it("clicking on background deselects the current node", async() => {
            // Select a node first
            await clickOnNode(graph, "node1");
            assert.isNotNull(graph.getSelectedNode());

            // Click on background
            await clickOnBackground(graph);

            // Node should be deselected
            assert.isNull(graph.getSelectedNode());
        });
    });

    describe("drag vs click differentiation", () => {
        beforeEach(async() => {
            graph = await setupTestGraph({
                mode: "3d",
                layout: "fixed",
                nodes: DEFAULT_TEST_NODES,
                edges: DEFAULT_TEST_EDGES,
            });
            await waitForGraphReady(graph);
        });

        it("quick click without movement selects node", async() => {
            // A quick click (pointer down then up with no movement) should select
            const clicked = await clickOnNode(graph, "node1");
            assert.isTrue(clicked);
            const selected = graph.getSelectedNode();
            assert.isNotNull(selected);
            assert.equal(selected?.id, "node1");
        });

        // Note: The "drag does not select" test is more complex and depends on
        // the implementation. We'll add it after the click detection is implemented.
    });

    describe("position stability on selection", () => {
        /**
         * Helper to capture all node positions
         */
        function getAllNodePositions(g: Graph): Map<string, {x: number, y: number, z: number}> {
            const positions = new Map<string, {x: number, y: number, z: number}>();
            for (const node of g.getNodes()) {
                positions.set(String(node.id), {
                    x: node.mesh.position.x,
                    y: node.mesh.position.y,
                    z: node.mesh.position.z,
                });
            }
            return positions;
        }

        /**
         * Helper to verify positions haven't changed
         */
        function assertPositionsUnchanged(
            before: Map<string, {x: number, y: number, z: number}>,
            after: Map<string, {x: number, y: number, z: number}>,
            tolerance = 0.001,
        ): void {
            assert.equal(before.size, after.size, "Node count should not change");

            for (const [nodeId, beforePos] of before) {
                const afterPos = after.get(nodeId);
                assert.isDefined(afterPos, `Node ${nodeId} should still exist`);
                // afterPos is guaranteed to exist after assert.isDefined
                const dx = Math.abs(beforePos.x - (afterPos?.x ?? 0));
                const dy = Math.abs(beforePos.y - (afterPos?.y ?? 0));
                const dz = Math.abs(beforePos.z - (afterPos?.z ?? 0));

                assert.isBelow(
                    dx,
                    tolerance,
                    `Node ${nodeId} X position changed by ${dx}`,
                );
                assert.isBelow(
                    dy,
                    tolerance,
                    `Node ${nodeId} Y position changed by ${dy}`,
                );
                assert.isBelow(
                    dz,
                    tolerance,
                    `Node ${nodeId} Z position changed by ${dz}`,
                );
            }
        }

        describe("2D mode position stability", () => {
            beforeEach(async() => {
                graph = await setupTestGraph({
                    mode: "2d",
                    layout: "fixed",
                    nodes: DEFAULT_TEST_NODES,
                    edges: DEFAULT_TEST_EDGES,
                });
                await waitForGraphReady(graph);
            });

            it("selecting a node does not change any node positions", async() => {
                // Capture positions before selection
                const positionsBefore = getAllNodePositions(graph);

                // Select a node
                await clickOnNode(graph, "node1");

                // Verify selection worked
                const selected = graph.getSelectedNode();
                assert.isNotNull(selected);
                assert.equal(selected?.id, "node1");

                // Capture positions after selection
                const positionsAfter = getAllNodePositions(graph);

                // Verify no positions changed
                assertPositionsUnchanged(positionsBefore, positionsAfter);
            });

            it("clicking on background does not change any node positions", async() => {
                // Capture positions before click
                const positionsBefore = getAllNodePositions(graph);

                // Click on background
                await clickOnBackground(graph);

                // Capture positions after click
                const positionsAfter = getAllNodePositions(graph);

                // Verify no positions changed
                assertPositionsUnchanged(positionsBefore, positionsAfter);
            });

            it("selecting then deselecting does not change any node positions", async() => {
                // Capture initial positions
                const positionsBefore = getAllNodePositions(graph);

                // Select a node
                await clickOnNode(graph, "node1");
                assert.isNotNull(graph.getSelectedNode());

                // Deselect by clicking background
                await clickOnBackground(graph);
                assert.isNull(graph.getSelectedNode());

                // Capture final positions
                const positionsAfter = getAllNodePositions(graph);

                // Verify no positions changed
                assertPositionsUnchanged(positionsBefore, positionsAfter);
            });

            it("camera position does not change when selecting a node", async() => {
                // Capture camera state before
                const camera = graph.scene.activeCamera;
                assert.isNotNull(camera, "Active camera should exist");
                // camera is guaranteed to exist after assertion
                const cameraBefore = {
                    x: camera?.position.x ?? 0,
                    y: camera?.position.y ?? 0,
                    z: camera?.position.z ?? 0,
                };

                // Select a node
                await clickOnNode(graph, "node1");

                // Capture camera state after
                const cameraAfter = {
                    x: camera?.position.x ?? 0,
                    y: camera?.position.y ?? 0,
                    z: camera?.position.z ?? 0,
                };

                // Verify camera didn't move
                assert.approximately(cameraAfter.x, cameraBefore.x, 0.001, "Camera X should not change");
                assert.approximately(cameraAfter.y, cameraBefore.y, 0.001, "Camera Y should not change");
                assert.approximately(cameraAfter.z, cameraBefore.z, 0.001, "Camera Z should not change");
            });
        });

        describe("3D mode position stability", () => {
            beforeEach(async() => {
                graph = await setupTestGraph({
                    mode: "3d",
                    layout: "fixed",
                    nodes: DEFAULT_TEST_NODES,
                    edges: DEFAULT_TEST_EDGES,
                });
                await waitForGraphReady(graph);
            });

            it("selecting a node does not change any node positions", async() => {
                // Capture positions before selection
                const positionsBefore = getAllNodePositions(graph);

                // Select a node
                await clickOnNode(graph, "node1");

                // Verify selection worked
                const selected = graph.getSelectedNode();
                assert.isNotNull(selected);
                assert.equal(selected?.id, "node1");

                // Capture positions after selection
                const positionsAfter = getAllNodePositions(graph);

                // Verify no positions changed
                assertPositionsUnchanged(positionsBefore, positionsAfter);
            });

            it("clicking on background does not change any node positions", async() => {
                // Capture positions before click
                const positionsBefore = getAllNodePositions(graph);

                // Click on background
                await clickOnBackground(graph);

                // Capture positions after click
                const positionsAfter = getAllNodePositions(graph);

                // Verify no positions changed
                assertPositionsUnchanged(positionsBefore, positionsAfter);
            });
        });
    });
});
