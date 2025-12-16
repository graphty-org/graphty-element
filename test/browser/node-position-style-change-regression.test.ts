/**
 * Regression test for node position preservation during style changes.
 *
 * Bug: When styles were applied to nodes after the layout had settled,
 * nodes would jump to the origin (0, 0, 0) because:
 * 1. updateStyle() disposed the old mesh and created a new one at origin
 * 2. UpdateManager skips updateNodes() when layout is not running
 * 3. The position was never restored
 *
 * Fix: Node.updateStyle() now saves and restores mesh position.
 *
 * @see src/Node.ts - updateStyle() method
 */

import {afterEach, assert, beforeEach, describe, it} from "vitest";

import {Graph} from "../../src/Graph";
import type {TestGraph} from "../helpers/testSetup";

// Test data
const TEST_NODES = [
    {id: "node1", label: "Node 1", type: "server"},
    {id: "node2", label: "Node 2", type: "database"},
    {id: "node3", label: "Node 3", type: "server"},
];

const TEST_EDGES = [
    {src: "node1", dst: "node2"},
    {src: "node2", dst: "node3"},
];

// Helper to wait for a delay
function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("Node position preservation during style changes (regression)", () => {
    let container: HTMLElement;
    let graph: Graph;

    beforeEach(async() => {
        container = document.createElement("div");
        container.style.width = "800px";
        container.style.height = "600px";
        document.body.appendChild(container);
        graph = new Graph(container);
        await graph.init();
    });

    afterEach(() => {
        graph.dispose();
        container.remove();
    });

    /**
     * Wait for the layout engine to settle.
     * Polls the layout manager's isSettled property until it returns true.
     */
    async function waitForLayoutSettle(maxWaitMs = 5000): Promise<void> {
        const {layoutManager} = graph as unknown as TestGraph;
        const startTime = Date.now();

        while (Date.now() - startTime < maxWaitMs) {
            if (layoutManager.isSettled) {
                // Give one more frame for mesh positions to sync
                await delay(16);
                return;
            }

            await delay(16); // Poll every frame (~60fps)
        }

        // Timeout is acceptable for force-directed layouts that may never fully settle
    }

    /**
     * Get positions for all nodes
     */
    function getNodePositions(): Map<string, {x: number, y: number, z: number}> {
        const positions = new Map<string, {x: number, y: number, z: number}>();
        const {dataManager} = graph as unknown as TestGraph;

        for (const [id, node] of dataManager.nodes) {
            positions.set(String(id), {
                x: node.mesh.position.x,
                y: node.mesh.position.y,
                z: node.mesh.position.z,
            });
        }

        return positions;
    }

    /**
     * Verify that at least some nodes have non-zero positions
     */
    function verifyNonZeroPositions(positions: Map<string, {x: number, y: number, z: number}>): void {
        let hasNonZero = false;
        for (const pos of positions.values()) {
            if (Math.abs(pos.x) > 0.001 || Math.abs(pos.y) > 0.001 || Math.abs(pos.z) > 0.001) {
                hasNonZero = true;
                break;
            }
        }

        assert.isTrue(
            hasNonZero,
            "At least some nodes should have non-zero positions after layout settles",
        );
    }

    /**
     * Verify positions match within tolerance
     */
    function verifyPositionsMatch(
        before: Map<string, {x: number, y: number, z: number}>,
        after: Map<string, {x: number, y: number, z: number}>,
        tolerance = 0.001,
    ): void {
        for (const [id, posBefore] of before) {
            const posAfter = after.get(id);
            assert.isDefined(posAfter, `Should have position for node ${id}`);

            // posAfter is guaranteed to be defined after the assert above
            const pos = posAfter as {x: number, y: number, z: number};
            assert.approximately(
                pos.x,
                posBefore.x,
                tolerance,
                `Node ${id} x position should be preserved`,
            );
            assert.approximately(
                pos.y,
                posBefore.y,
                tolerance,
                `Node ${id} y position should be preserved`,
            );
            assert.approximately(
                pos.z,
                posBefore.z,
                tolerance,
                `Node ${id} z position should be preserved`,
            );
        }
    }

    it("should preserve node positions when styles are applied after layout settles", async() => {
        // Add test nodes and edges
        await graph.addNodes(TEST_NODES);
        await graph.addEdges(TEST_EDGES);

        // Wait for layout to settle
        await waitForLayoutSettle();

        // Record positions before style change
        const positionsBefore = getNodePositions();

        // Verify we have non-zero positions (layout has actually positioned nodes)
        verifyNonZeroPositions(positionsBefore);

        // Apply style change via StyleManager (simulates what AI commands do)
        const styleManager = graph.getStyleManager();
        styleManager.addLayer({
            node: {
                selector: "type == 'server'",
                style: {
                    enabled: true,
                    texture: {color: "#FF0000"},
                },
            },
            metadata: {
                name: "test-style-layer",
            },
        });

        // Give a frame for any potential updates
        await delay(16);

        // Verify positions are preserved
        const positionsAfter = getNodePositions();
        verifyPositionsMatch(positionsBefore, positionsAfter);
    });

    it("should preserve node positions when clearing styles after layout settles", async() => {
        // Add test nodes
        await graph.addNodes([
            {id: "node1", label: "Node 1"},
            {id: "node2", label: "Node 2"},
        ]);

        await graph.addEdges([
            {src: "node1", dst: "node2"},
        ]);

        // Wait for layout to settle
        await waitForLayoutSettle();

        // Apply initial style
        const styleManager = graph.getStyleManager();
        styleManager.addLayer({
            node: {
                selector: "",
                style: {
                    enabled: true,
                    texture: {color: "#00FF00"},
                },
            },
            metadata: {
                name: "test-layer",
            },
        });

        // Wait a frame
        await delay(16);

        // Record positions
        const positionsBefore = getNodePositions();

        // Clear styles (which triggers another style update)
        styleManager.removeLayersByMetadata((metadata) => {
            const meta = metadata as {name?: string} | null;
            return meta?.name === "test-layer";
        });

        // Wait a frame
        await delay(16);

        // Verify positions are preserved
        const positionsAfter = getNodePositions();
        verifyPositionsMatch(positionsBefore, positionsAfter);
    });

    it("should preserve positions for multiple consecutive style changes", async() => {
        // Add test nodes
        await graph.addNodes([
            {id: "a", label: "A"},
            {id: "b", label: "B"},
            {id: "c", label: "C"},
        ]);

        await graph.addEdges([
            {src: "a", dst: "b"},
            {src: "b", dst: "c"},
        ]);

        // Wait for layout to settle
        await waitForLayoutSettle();

        // Record original positions
        const originalPositions = getNodePositions();

        const styleManager = graph.getStyleManager();

        // Apply multiple style changes in quick succession
        for (let i = 0; i < 5; i++) {
            styleManager.addLayer({
                node: {
                    selector: "",
                    style: {
                        enabled: true,
                        texture: {color: `#${(i * 50).toString(16).padStart(2, "0")}0000`},
                    },
                },
                metadata: {
                    name: `test-layer-${i}`,
                },
            });

            // Small delay between changes
            await delay(10);
        }

        // Wait for all updates to complete
        await delay(32);

        // Verify positions are still preserved
        const finalPositions = getNodePositions();
        verifyPositionsMatch(originalPositions, finalPositions);
    });

    it("should preserve positions when changing node shape", async() => {
        // This is a more aggressive test - shape changes always recreate meshes
        await graph.addNodes([
            {id: "node1", label: "Node 1"},
            {id: "node2", label: "Node 2"},
        ]);

        await graph.addEdges([
            {src: "node1", dst: "node2"},
        ]);

        // Wait for layout to settle
        await waitForLayoutSettle();

        // Record positions
        const positionsBefore = getNodePositions();
        verifyNonZeroPositions(positionsBefore);

        // Change shape (this forces mesh recreation)
        const styleManager = graph.getStyleManager();
        styleManager.addLayer({
            node: {
                selector: "",
                style: {
                    enabled: true,
                    shape: {type: "box", size: 1},
                },
            },
            metadata: {
                name: "shape-change",
            },
        });

        // Wait for mesh recreation
        await delay(32);

        // Verify positions are preserved even after mesh recreation
        const positionsAfter = getNodePositions();
        verifyPositionsMatch(positionsBefore, positionsAfter);
    });
});
