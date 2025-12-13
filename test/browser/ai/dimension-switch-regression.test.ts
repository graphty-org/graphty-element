/**
 * Dimension Switch Regression Test
 *
 * Regression test for the bug where nodes disappear when switching between
 * 2D and 3D modes via the setDimension AI command.
 *
 * Root cause: When meshCache.clear() was called during dimension switch,
 * node meshes were disposed. However, Node.update() only called updateStyle()
 * if there were style changes pending, so disposed meshes were never recreated.
 *
 * Fix: Added a check in Node.update() to recreate disposed meshes.
 *
 * @module test/browser/ai/dimension-switch-regression
 */

import {afterEach, assert, beforeEach, describe, it} from "vitest";

import type {MockLlmProvider} from "../../../src/ai/providers/MockLlmProvider";
import type {Graph} from "../../../src/Graph";
import type {Node} from "../../../src/Node";
import {
    cleanupE2EGraph,
    createE2EGraph,
    DEFAULT_TEST_EDGES,
    DEFAULT_TEST_NODES,
} from "../../helpers/e2e-graph-setup";

describe("Dimension Switch Regression Test", () => {
    let graph: Graph;

    beforeEach(async() => {
        // Create a real graphty-element with test data (starts in 3D mode)
        const result = await createE2EGraph({
            nodes: DEFAULT_TEST_NODES,
            edges: DEFAULT_TEST_EDGES,
            enableAi: true,
        });
        ({graph} = result);
    });

    afterEach(() => {
        cleanupE2EGraph();
    });

    /**
     * Get the mock provider from the graph's AI manager.
     */
    function getProvider(): MockLlmProvider {
        const aiManager = graph.getAiManager();
        if (!aiManager) {
            throw new Error("AI Manager not initialized");
        }

        return aiManager.getProvider() as MockLlmProvider;
    }

    /**
     * Get all nodes from the graph's data manager.
     */
    function getAllNodes(): Node[] {
        const dataManager = graph.getDataManager();

        return Array.from(dataManager.nodes.values());
    }

    /**
     * Check if all node meshes are valid (not disposed).
     */
    function areAllNodeMeshesValid(): boolean {
        const nodes = getAllNodes();
        for (const node of nodes) {
            if (node.mesh.isDisposed()) {
                return false;
            }
        }

        return true;
    }

    /**
     * Count how many node meshes are disposed.
     */
    function countDisposedMeshes(): number {
        const nodes = getAllNodes();
        let count = 0;
        for (const node of nodes) {
            if (node.mesh.isDisposed()) {
                count++;
            }
        }

        return count;
    }

    describe("regression: nodes remain visible after dimension switch", () => {
        it("all node meshes should be valid before any dimension switch", () => {
            const nodes = getAllNodes();
            assert.strictEqual(nodes.length, 5, "Should have 5 nodes");
            assert.strictEqual(areAllNodeMeshesValid(), true, "All node meshes should be valid initially");
        });

        it("node meshes should remain valid after switching from 3D to 2D", async() => {
            // Verify initial state (3D mode, all meshes valid)
            assert.strictEqual(graph.is2D(), false, "Should start in 3D mode");
            assert.strictEqual(areAllNodeMeshesValid(), true, "All meshes should be valid in 3D mode");

            // Set up mock response for dimension switch
            const provider = getProvider();
            provider.setResponse("switch to 2D", {
                text: "",
                toolCalls: [{id: "1", name: "setDimension", arguments: {dimension: "2d"}}],
            });

            // Execute dimension switch via AI command
            const result = await graph.aiCommand("switch to 2D");

            // Verify command succeeded
            assert.strictEqual(result.success, true, `setDimension should succeed: ${result.message}`);
            assert.strictEqual(graph.is2D(), true, "Should now be in 2D mode");

            // CRITICAL: Verify all node meshes are still valid (not disposed)
            // This is the regression test - before the fix, meshes would be disposed
            const disposedCount = countDisposedMeshes();
            assert.strictEqual(
                disposedCount,
                0,
                `No node meshes should be disposed after 2D switch, but ${disposedCount} were disposed`,
            );
            assert.strictEqual(
                areAllNodeMeshesValid(),
                true,
                "All node meshes should remain valid after switching to 2D",
            );
        });

        it("node meshes should remain valid after switching from 2D to 3D", async() => {
            // First switch to 2D
            const provider = getProvider();
            provider.setResponse("switch to 2D", {
                text: "",
                toolCalls: [{id: "1", name: "setDimension", arguments: {dimension: "2d"}}],
            });

            await graph.aiCommand("switch to 2D");
            assert.strictEqual(graph.is2D(), true, "Should be in 2D mode");
            assert.strictEqual(areAllNodeMeshesValid(), true, "All meshes should be valid after 2D switch");

            // Now switch back to 3D
            provider.setResponse("switch to 3D", {
                text: "",
                toolCalls: [{id: "1", name: "setDimension", arguments: {dimension: "3d"}}],
            });

            const result = await graph.aiCommand("switch to 3D");

            // Verify command succeeded
            assert.strictEqual(result.success, true, `setDimension should succeed: ${result.message}`);
            assert.strictEqual(graph.is2D(), false, "Should now be in 3D mode");

            // Verify all node meshes are still valid
            const disposedCount = countDisposedMeshes();
            assert.strictEqual(
                disposedCount,
                0,
                `No node meshes should be disposed after 3D switch, but ${disposedCount} were disposed`,
            );
            assert.strictEqual(
                areAllNodeMeshesValid(),
                true,
                "All node meshes should remain valid after switching to 3D",
            );
        });

        it("node meshes should remain valid after multiple dimension switches", async() => {
            const provider = getProvider();

            // Perform multiple switches
            const switches = ["2d", "3d", "2d", "3d", "2d"];
            for (const dimension of switches) {
                provider.setResponse(`switch to ${dimension}`, {
                    text: "",
                    toolCalls: [{id: "1", name: "setDimension", arguments: {dimension}}],
                });

                const result = await graph.aiCommand(`switch to ${dimension}`);
                assert.strictEqual(result.success, true, `Switch to ${dimension} should succeed`);

                // Verify meshes are valid after each switch
                const disposedCount = countDisposedMeshes();
                assert.strictEqual(
                    disposedCount,
                    0,
                    `No meshes should be disposed after switching to ${dimension}, but ${disposedCount} were disposed`,
                );
            }
        });
    });

    describe("edge meshes remain valid after dimension switch", () => {
        it("edge meshes should remain valid after switching to 2D", async() => {
            const dataManager = graph.getDataManager();
            const edges = Array.from(dataManager.edges.values());

            // Verify initial state
            assert.strictEqual(edges.length, 5, "Should have 5 edges");

            // Switch to 2D
            const provider = getProvider();
            provider.setResponse("switch to 2D", {
                text: "",
                toolCalls: [{id: "1", name: "setDimension", arguments: {dimension: "2d"}}],
            });

            await graph.aiCommand("switch to 2D");

            // Verify edge meshes are still valid
            let disposedEdges = 0;
            for (const edge of edges) {
                // Edge mesh might be PatternedLineMesh which doesn't have isDisposed
                // Check if it's a regular AbstractMesh first
                if ("isDisposed" in edge.mesh && typeof edge.mesh.isDisposed === "function") {
                    if (edge.mesh.isDisposed()) {
                        disposedEdges++;
                    }
                }
            }

            assert.strictEqual(
                disposedEdges,
                0,
                `No edge meshes should be disposed, but ${disposedEdges} were disposed`,
            );
        });
    });
});
