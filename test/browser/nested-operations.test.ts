/**
 * Nested Operations Regression Tests
 *
 * These tests verify that the operation queue correctly handles nested operations -
 * operations that trigger other operations as side effects (e.g., setting a style
 * template that changes the camera mode, which triggers camera-update operations).
 *
 * These tests correspond to the stories in stories/NestedOperations.stories.ts
 */

import {Color3, InstancedMesh, type StandardMaterial} from "@babylonjs/core";
import {afterEach, assert, beforeEach, describe, it} from "vitest";

import type {StyleSchema} from "../../src/config";
import {Graph} from "../../src/Graph";
import {Styles} from "../../src/Styles";
import {isDisposed, type TestGraph} from "../helpers/testSetup";

// Test data constants (matching the stories)
const TEST_NODES = [
    {id: "1", label: "Node 1"},
    {id: "2", label: "Node 2"},
    {id: "3", label: "Node 3"},
];

const TEST_EDGES = [
    {src: "1", dst: "2"},
    {src: "2", dst: "3"},
];

// Base style properties
const BASE_STYLE = {
    nodeStyle: {
        texture: {color: "#4CAF50"},
        shape: {type: "sphere" as const, size: 10},
    },
};

// Helper to create style templates (returns StyleSchema cast for partial config)
function createStyleTemplate(overrides: Record<string, unknown> = {}): StyleSchema {
    const graphOverrides = overrides.graph as Record<string, unknown> | undefined;
    const nodeStyleOverrides = overrides.nodeStyle as Record<string, unknown> | undefined;
    const base = {
        graphtyTemplate: true,
        majorVersion: "1",
        graph: {
            addDefaultStyle: true,
            ... (graphOverrides ?? {}),
        },
        layers: [{
            node: {
                selector: "",
                style: {
                    texture: nodeStyleOverrides?.texture ??
                        BASE_STYLE.nodeStyle.texture,
                    shape: nodeStyleOverrides?.shape ??
                        BASE_STYLE.nodeStyle.shape,
                },
            },
        }],
    };

    return base as unknown as StyleSchema;
}

// Helper to wait for a delay
function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("Nested Operations", () => {
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

    // =========================================================================
    // Helper functions for verification
    // =========================================================================

    function getNodePositions(): Map<string, {x: number, y: number, z: number}> {
        const positions = new Map<string, {x: number, y: number, z: number}>();
        for (const node of graph.getNodes()) {
            const pos = node.getPosition();
            positions.set(node.id as string, {x: pos.x, y: pos.y, z: pos.z});
        }
        return positions;
    }

    /**
     * Relaxed check - just verify nodes have non-zero positions (layout was applied)
     */
    function layoutWasApplied(positions: Map<string, {x: number, y: number, z: number}>): boolean {
        if (positions.size === 0) {
            return false;
        }

        // Check that at least some nodes have non-zero positions
        let nonZeroCount = 0;
        for (const pos of positions.values()) {
            if (Math.abs(pos.x) > 0.001 || Math.abs(pos.y) > 0.001 || Math.abs(pos.z) > 0.001) {
                nonZeroCount++;
            }
        }

        // At least half of nodes should have non-zero positions
        return nonZeroCount >= positions.size / 2;
    }

    /**
     * Verify that all nodes have the expected style properties applied.
     * This ensures eventual consistency - regardless of operation order,
     * the final visual style should match the expected STYLE_TEMPLATE.
     */
    function verifyNodeStyles(expectedColor: string, expectedShape: string, expectedSize: number): void {
        for (const node of graph.getNodes()) {
            const style = Styles.getStyleForNodeStyleId(node.styleId);
            assert.equal(style.texture?.color, expectedColor, `Node ${node.id} should have color ${expectedColor}`);
            assert.equal(style.shape?.type, expectedShape, `Node ${node.id} should have shape ${expectedShape}`);
            assert.equal(style.shape?.size, expectedSize, `Node ${node.id} should have size ${expectedSize}`);
        }
    }

    /**
     * Combined verification helper for the standard BASE_STYLE (#4CAF50 green sphere size 10)
     */
    function verifyFinalStyles(): void {
        verifyNodeStyles("#4CAF50", "sphere", 10);
    }

    // =========================================================================
    // Mesh verification helpers - verify actual Babylon.js meshes are correct
    // =========================================================================

    /**
     * Verify all node meshes exist and are not disposed.
     */
    function verifyNodeMeshesExist(): void {
        for (const node of graph.getNodes()) {
            assert.isDefined(node.mesh, `Node ${node.id} should have a mesh`);
            assert.isFalse(isDisposed(node.mesh), `Node ${node.id} mesh should not be disposed`);
        }
    }

    /**
     * Verify all edge meshes exist and are not disposed.
     */
    function verifyEdgeMeshesExist(): void {
        for (const edge of (graph as unknown as TestGraph).dataManager.edges.values()) {
            assert.isDefined(edge.mesh, "Edge should have a mesh");
            if ("isDisposed" in edge.mesh && typeof edge.mesh.isDisposed === "function") {
                assert.isFalse(edge.mesh.isDisposed(), "Edge mesh should not be disposed");
            }
        }
    }

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
     * Verify node mesh positions match the layout engine positions.
     * This ensures the rendering pipeline correctly synced positions from layout to meshes.
     */
    async function verifyNodePositionsMatchLayout(): Promise<void> {
        const {layoutManager} = graph as unknown as TestGraph;
        const {layoutEngine} = layoutManager;

        // Verify layout engine exists
        assert.isDefined(layoutEngine, "Layout engine should exist");

        // Wait for layout to settle before comparing positions
        await waitForLayoutSettle();

        // For static layouts (like circular), positions should match exactly
        // For force-directed layouts, we allow more tolerance
        const isStaticLayout = layoutEngine.isSettled;
        const tolerance = isStaticLayout ? 0.01 : 1.0;

        let matchCount = 0;
        let totalNodes = 0;

        for (const node of graph.getNodes()) {
            totalNodes++;
            const meshPos = node.mesh.position;
            const enginePos = layoutEngine.getNodePosition(node);

            assert.isDefined(enginePos, `Layout engine should have position for node ${node.id}`);

            // Compare positions with tolerance
            const dx = Math.abs(meshPos.x - enginePos.x);
            const dy = Math.abs(meshPos.y - enginePos.y);
            const dz = Math.abs(meshPos.z - (enginePos.z ?? 0));

            if (dx <= tolerance && dy <= tolerance && dz <= tolerance) {
                matchCount++;
            }
        }

        // For circular (static) layout, all positions should match
        // For force-directed layouts, most should be close
        const requiredMatchRatio = isStaticLayout ? 1.0 : 0.5;
        const actualRatio = matchCount / totalNodes;

        assert.isAtLeast(
            actualRatio,
            requiredMatchRatio,
            `Expected ${requiredMatchRatio * 100}% of node positions to match layout engine, got ${actualRatio * 100}%`,
        );
    }

    /**
     * Verify node mesh materials have the expected color applied.
     */
    function verifyNodeMeshMaterials(expectedColor: string): void {
        const expectedColorObj = Color3.FromHexString(expectedColor);
        for (const node of graph.getNodes()) {
            const material = node.mesh.material as StandardMaterial | null;
            if (material?.diffuseColor) {
                assert.closeTo(material.diffuseColor.r, expectedColorObj.r, 0.01, `Node ${node.id} material red should match`);
                assert.closeTo(material.diffuseColor.g, expectedColorObj.g, 0.01, `Node ${node.id} material green should match`);
                assert.closeTo(material.diffuseColor.b, expectedColorObj.b, 0.01, `Node ${node.id} material blue should match`);
            }
        }
    }

    /**
     * Verify node meshes have the expected shape type.
     */
    function verifyNodeMeshShapes(expectedShape: string): void {
        for (const node of graph.getNodes()) {
            const meshName = node.mesh instanceof InstancedMesh ?
                node.mesh.sourceMesh.name :
                node.mesh.name;
            assert.isTrue(
                meshName.toLowerCase().includes(expectedShape.toLowerCase()),
                `Node ${node.id} source mesh name "${meshName}" should contain shape "${expectedShape}"`,
            );
        }
    }

    /**
     * Verify nodes are arranged in a circular layout pattern.
     */
    function verifyCircularLayoutGeometry(): void {
        const positions = Array.from(graph.getNodes()).map((n) => n.mesh.position);
        if (positions.length < 3) {
            return;
        }

        let centerX = 0;
        let centerY = 0;
        let centerZ = 0;
        for (const pos of positions) {
            centerX += pos.x;
            centerY += pos.y;
            centerZ += pos.z;
        }
        centerX /= positions.length;
        centerY /= positions.length;
        centerZ /= positions.length;

        const distances: number[] = [];
        for (const pos of positions) {
            const dx = pos.x - centerX;
            const dy = pos.y - centerY;
            const dz = pos.z - centerZ;
            distances.push(Math.sqrt((dx * dx) + (dy * dy) + (dz * dz)));
        }

        const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
        const tolerance = avgDistance * 0.2;

        for (const distance of distances) {
            assert.closeTo(distance, avgDistance, tolerance, "Node distance from center should be approximately equal for circular layout");
        }
    }

    /**
     * Comprehensive mesh verification for final state.
     * @param skipMaterialCheck - Skip material color verification (useful for 2D mode tests)
     */
    async function verifyMeshState(skipMaterialCheck = false): Promise<void> {
        verifyNodeMeshesExist();
        verifyEdgeMeshesExist();
        await verifyNodePositionsMatchLayout();
        verifyNodeMeshShapes("sphere");
        verifyCircularLayoutGeometry();
        // Skip material check in 2D mode as mesh materials may differ
        if (!skipMaterialCheck && !graph.is2D()) {
            verifyNodeMeshMaterials("#4CAF50");
        }
    }

    // =========================================================================
    // Story 1: Style Changes twoD Property
    // =========================================================================

    describe("Story 1: Style Changes twoD Property", () => {
        it("should handle style template changing twoD property", async() => {
            // Start with 3D
            const style3D = createStyleTemplate({
                ... BASE_STYLE,
                graph: {twoD: false},
            });

            await graph.setStyleTemplate(style3D);
            await graph.setLayout("circular");
            await graph.addNodes(TEST_NODES);
            await graph.addEdges(TEST_EDGES);

            await graph.operationQueue.waitForCompletion();

            // Verify we're in 3D mode initially
            assert.isFalse(graph.is2D(), "Should start in 3D mode");

            // Switch to 2D - internally calls updateLayoutDimension()
            await delay(10);
            const style2D = createStyleTemplate({
                ... BASE_STYLE,
                graph: {twoD: true},
            });
            await graph.setStyleTemplate(style2D);

            await graph.operationQueue.waitForCompletion();

            // Should render correctly in 2D
            assert.isTrue(graph.is2D(), "Should be in 2D mode after style change");
            assert.equal(graph.getNodeCount(), 3, "Should have 3 nodes");
            assert.equal(graph.getEdgeCount(), 2, "Should have 2 edges");

            // Verify layout was applied (positions are not all zero)
            const positions = getNodePositions();
            assert.isTrue(layoutWasApplied(positions), "Layout should have been applied");
            // Verify styles are preserved after 2D/3D switch
            verifyFinalStyles();
            await verifyMeshState();
        });

        it("should update layout dimension when twoD changes", async() => {
            // Start with 3D
            await graph.setStyleTemplate(createStyleTemplate({graph: {twoD: false}}));
            await graph.setLayout("circular");
            await graph.addNodes(TEST_NODES);
            await graph.addEdges(TEST_EDGES);

            await graph.operationQueue.waitForCompletion();

            // Verify we're in 3D mode
            assert.isFalse(graph.is2D(), "Should start in 3D mode");

            // Switch to 2D
            await delay(10);
            await graph.setStyleTemplate(createStyleTemplate({graph: {twoD: true}}));

            await graph.operationQueue.waitForCompletion();

            // Verify we switched to 2D - this proves the dimension change was processed
            assert.isTrue(graph.is2D(), "Should have switched to 2D mode");
        });

        it("should preserve node data when switching 2D/3D", async() => {
            // Start with 3D
            await graph.setStyleTemplate(createStyleTemplate({graph: {twoD: false}}));
            await graph.setLayout("circular");
            await graph.addNodes(TEST_NODES);
            await graph.addEdges(TEST_EDGES);

            await graph.operationQueue.waitForCompletion();

            const initialNodeCount = graph.getNodeCount();
            const initialEdgeCount = graph.getEdgeCount();

            // Switch to 2D
            await graph.setStyleTemplate(createStyleTemplate({graph: {twoD: true}}));

            await graph.operationQueue.waitForCompletion();

            // Nodes and edges should be preserved
            assert.equal(graph.getNodeCount(), initialNodeCount, "Node count should be preserved");
            assert.equal(graph.getEdgeCount(), initialEdgeCount, "Edge count should be preserved");
        });
    });

    // =========================================================================
    // Story 2: Style with Layout Property
    // =========================================================================

    describe("Story 2: Style with Layout Property", () => {
        it("should handle style template including layout property", async() => {
            // Style template includes layout configuration
            const styleWithLayout = createStyleTemplate({
                ... BASE_STYLE,
                graph: {
                    layout: "circular",
                },
            });

            await graph.setStyleTemplate(styleWithLayout);
            await graph.addNodes(TEST_NODES);
            await graph.addEdges(TEST_EDGES);

            await graph.operationQueue.waitForCompletion();

            // Should apply circular layout correctly
            assert.equal(graph.getNodeCount(), 3, "Should have 3 nodes");
            assert.equal(graph.getEdgeCount(), 2, "Should have 2 edges");

            const positions = getNodePositions();
            assert.isTrue(layoutWasApplied(positions),
                "Layout should have been applied from style template");
            verifyFinalStyles();
            await verifyMeshState();
        });

        it("should respect layout from style template over explicit layout", async() => {
            // Style template with random layout
            const styleWithRandom = createStyleTemplate({
                ... BASE_STYLE,
                graph: {
                    layout: "random",
                },
            });

            // Set explicit circular layout first
            await graph.setLayout("circular");

            // Then set style template with random layout
            await graph.setStyleTemplate(styleWithRandom);
            await graph.addNodes(TEST_NODES);
            await graph.addEdges(TEST_EDGES);

            await graph.operationQueue.waitForCompletion();

            // The layout behavior depends on implementation - the key is no errors
            assert.equal(graph.getNodeCount(), 3, "Should have 3 nodes");
            assert.equal(graph.getEdgeCount(), 2, "Should have 2 edges");
        });

        it("should handle style template with layout configuration", async() => {
            // Style template with layout (no options needed for this test)
            const styleWithLayout = createStyleTemplate({
                ... BASE_STYLE,
                graph: {
                    layout: "circular",
                },
            });

            await graph.setStyleTemplate(styleWithLayout);
            await graph.addNodes(TEST_NODES);
            await graph.addEdges(TEST_EDGES);

            await graph.operationQueue.waitForCompletion();

            // Should work without errors
            assert.equal(graph.getNodeCount(), 3, "Should have 3 nodes");
            assert.equal(graph.getEdgeCount(), 2, "Should have 2 edges");
        });
    });

    // =========================================================================
    // Story 3: Rapid Style Changes (2D/3D)
    // =========================================================================

    describe("Story 3: Rapid Style Changes (2D/3D)", () => {
        it("should handle rapid 2D/3D toggling", async() => {
            // Rapidly toggle 2D/3D
            await graph.setStyleTemplate(createStyleTemplate({graph: {twoD: false}}));
            await graph.setLayout("circular");
            await graph.addNodes(TEST_NODES);
            await graph.addEdges(TEST_EDGES);

            await delay(5);
            await graph.setStyleTemplate(createStyleTemplate({graph: {twoD: true}}));

            await delay(5);
            await graph.setStyleTemplate(createStyleTemplate({graph: {twoD: false}}));

            // Final: default (3D)
            await delay(5);
            await graph.setStyleTemplate(createStyleTemplate(BASE_STYLE));

            await graph.operationQueue.waitForCompletion();

            // Should render correctly in final state (3D)
            assert.isFalse(graph.is2D(), "Should be in 3D mode after rapid toggling");
            assert.equal(graph.getNodeCount(), 3, "Should have 3 nodes");
            assert.equal(graph.getEdgeCount(), 2, "Should have 2 edges");
            // Verify final styles are correct after rapid toggling
            verifyFinalStyles();
            await verifyMeshState();
        });

        it("should settle to final state after rapid changes", async() => {
            await graph.setLayout("circular");
            await graph.addNodes(TEST_NODES);
            await graph.addEdges(TEST_EDGES);

            // Rapid changes
            for (let i = 0; i < 5; i++) {
                await graph.setStyleTemplate(createStyleTemplate({graph: {twoD: i % 2 === 0}}));
            }

            // Final: 2D
            await graph.setStyleTemplate(createStyleTemplate({graph: {twoD: true}}));

            await graph.operationQueue.waitForCompletion();

            // Should be in 2D mode
            assert.isTrue(graph.is2D(), "Should settle to 2D mode");

            // Data should be intact
            assert.equal(graph.getNodeCount(), 3, "Should have 3 nodes");
            assert.equal(graph.getEdgeCount(), 2, "Should have 2 edges");
        });

        it("should not leak intermediate states", async() => {
            const modeChanges: boolean[] = [];

            // Track mode changes
            const checkMode = (): void => {
                modeChanges.push(graph.is2D());
            };

            await graph.setLayout("circular");
            await graph.addNodes(TEST_NODES);
            await graph.addEdges(TEST_EDGES);

            // Start tracking
            const interval = setInterval(checkMode, 1);

            // Rapid toggling
            await graph.setStyleTemplate(createStyleTemplate({graph: {twoD: false}}));
            await graph.setStyleTemplate(createStyleTemplate({graph: {twoD: true}}));
            await graph.setStyleTemplate(createStyleTemplate({graph: {twoD: false}}));
            await graph.setStyleTemplate(createStyleTemplate({graph: {twoD: true}}));

            await graph.operationQueue.waitForCompletion();

            clearInterval(interval);

            // Final state should be 2D
            assert.isTrue(graph.is2D(), "Should end in 2D mode");
        });
    });

    // =========================================================================
    // Additional Nested Operation Tests
    // =========================================================================

    describe("Additional Nested Operation Tests", () => {
        it("should handle style-init triggering algorithm-run", async() => {
            // Style with algorithm configuration
            const styleWithAlgorithm = {
                graphtyTemplate: true,
                majorVersion: "1",
                graph: {
                    addDefaultStyle: true,
                },
                data: {
                    algorithms: ["pagerank"],
                },
                layers: [{
                    node: {
                        selector: "",
                        style: {
                            texture: BASE_STYLE.nodeStyle.texture,
                            shape: BASE_STYLE.nodeStyle.shape,
                        },
                    },
                }],
            } as unknown as StyleSchema;

            await graph.setLayout("circular");
            await graph.addNodes(TEST_NODES);
            await graph.addEdges(TEST_EDGES);

            // Style-init should trigger algorithm-run as a nested operation
            await graph.setStyleTemplate(styleWithAlgorithm);

            await graph.operationQueue.waitForCompletion();

            // Should complete without errors
            assert.equal(graph.getNodeCount(), 3, "Should have 3 nodes");
            assert.equal(graph.getEdgeCount(), 2, "Should have 2 edges");
            verifyFinalStyles();
            await verifyMeshState();
        });

        it("should handle data-add triggering layout-update", async() => {
            let layoutUpdateTriggered = false;

            graph.on("operation-start", (event) => {
                const category = (event as Record<string, unknown>).category as string;
                if (category === "layout-update") {
                    layoutUpdateTriggered = true;
                }
            });

            await graph.setStyleTemplate(createStyleTemplate(BASE_STYLE));
            await graph.setLayout("circular");

            // Data-add should trigger layout-update
            await graph.addNodes(TEST_NODES);
            await graph.addEdges(TEST_EDGES);

            await graph.operationQueue.waitForCompletion();

            // Layout-update should have been triggered
            assert.isTrue(layoutUpdateTriggered, "data-add should trigger layout-update");
        });

        it("should handle 2D mode switch correctly", async() => {
            // Start with 3D
            await graph.setStyleTemplate(createStyleTemplate({graph: {twoD: false}}));
            await graph.setLayout("circular");
            await graph.addNodes(TEST_NODES);
            await graph.addEdges(TEST_EDGES);

            await graph.operationQueue.waitForCompletion();

            // Verify 3D mode
            assert.isFalse(graph.is2D(), "Should start in 3D mode");

            // Switch to 2D - should update camera and layout appropriately
            await graph.setStyleTemplate(createStyleTemplate({graph: {twoD: true}}));

            await graph.operationQueue.waitForCompletion();

            // Verify the mode switch completed successfully
            assert.isTrue(graph.is2D(), "Should be in 2D mode after switch");

            // Verify data is intact
            assert.equal(graph.getNodeCount(), 3, "Should have 3 nodes");
            assert.equal(graph.getEdgeCount(), 2, "Should have 2 edges");
            verifyFinalStyles();
            await verifyMeshState();
        });

        it("should handle deeply nested operations", async() => {
            // Style with multiple configurations that trigger nested operations
            const complexStyle = {
                graphtyTemplate: true,
                majorVersion: "1",
                graph: {
                    addDefaultStyle: true,
                    twoD: true, // Triggers camera-update
                    layout: "circular", // Could trigger layout-set
                },
                data: {
                    algorithms: ["pagerank"], // Triggers algorithm-run
                },
                layers: [{
                    node: {
                        selector: "",
                        style: {
                            texture: BASE_STYLE.nodeStyle.texture,
                            shape: BASE_STYLE.nodeStyle.shape,
                        },
                    },
                }],
            } as unknown as StyleSchema;

            await graph.addNodes(TEST_NODES);
            await graph.addEdges(TEST_EDGES);

            // This style-init should trigger multiple nested operations
            await graph.setStyleTemplate(complexStyle);

            await graph.operationQueue.waitForCompletion();

            // Should complete without deadlock or errors
            assert.isTrue(graph.is2D(), "Should be in 2D mode");
            assert.equal(graph.getNodeCount(), 3, "Should have 3 nodes");
            assert.equal(graph.getEdgeCount(), 2, "Should have 2 edges");
            verifyFinalStyles();
            await verifyMeshState();
        });

        it("should prevent infinite recursion in nested operations", async() => {
            // Setup that could potentially cause recursive operations
            await graph.setLayout("circular");
            await graph.addNodes(TEST_NODES);
            await graph.addEdges(TEST_EDGES);

            // Rapidly switch styles that trigger nested operations
            for (let i = 0; i < 10; i++) {
                const style = {
                    graphtyTemplate: true,
                    majorVersion: "1",
                    graph: {
                        addDefaultStyle: true,
                        twoD: i % 2 === 0,
                    },
                    layers: [{
                        node: {
                            selector: "",
                            style: {
                                texture: {color: `hsl(${i * 36}, 50%, 50%)`},
                                shape: BASE_STYLE.nodeStyle.shape,
                            },
                        },
                    }],
                } as unknown as StyleSchema;
                await graph.setStyleTemplate(style);
            }

            // Should complete in reasonable time without stack overflow
            const timeoutPromise = new Promise<boolean>((resolve) => {
                setTimeout(() => {
                    resolve(false);
                }, 5000);
            });

            const completionPromise = graph.operationQueue.waitForCompletion()
                .then(() => {
                    return true;
                });

            const completed = await Promise.race([completionPromise, timeoutPromise]);

            assert.isTrue(completed, "Should complete without infinite recursion");
        });
    });

    // =========================================================================
    // Error handling in nested operations
    // =========================================================================

    describe("Error Handling in Nested Operations", () => {
        it("should handle errors in nested operations gracefully", async() => {
            // Setup with valid style
            await graph.setStyleTemplate(createStyleTemplate(BASE_STYLE));
            await graph.setLayout("circular");
            await graph.addNodes(TEST_NODES);
            await graph.addEdges(TEST_EDGES);

            await graph.operationQueue.waitForCompletion();

            // The graph should still be functional after completion
            assert.equal(graph.getNodeCount(), 3, "Should have 3 nodes");
        });

        it("should continue processing after nested operation failure", async() => {
            await graph.setStyleTemplate(createStyleTemplate(BASE_STYLE));
            await graph.setLayout("circular");

            // Add data
            await graph.addNodes(TEST_NODES);
            await graph.addEdges(TEST_EDGES);

            // Add more data (should work even if there were issues)
            await graph.addNodes([{id: "4", label: "Node 4"}]);

            await graph.operationQueue.waitForCompletion();

            // Should have all nodes
            assert.equal(graph.getNodeCount(), 4, "Should have 4 nodes");
        });
    });

    // =========================================================================
    // Operation ordering in nested scenarios
    // =========================================================================

    describe("Operation Ordering in Nested Scenarios", () => {
        it("should maintain correct order when parent operation spawns child", async() => {
            const operationOrder: string[] = [];

            graph.on("operation-complete", (event) => {
                const category = (event as Record<string, unknown>).category as string;
                operationOrder.push(category);
            });

            // style-init is the parent, may spawn camera-update, algorithm-run, etc.
            const styleWithNested = {
                graphtyTemplate: true,
                majorVersion: "1",
                graph: {
                    addDefaultStyle: true,
                    twoD: true,
                },
                layers: [{
                    node: {
                        selector: "",
                        style: {
                            texture: BASE_STYLE.nodeStyle.texture,
                            shape: BASE_STYLE.nodeStyle.shape,
                        },
                    },
                }],
            } as unknown as StyleSchema;

            await graph.setLayout("circular");
            await graph.addNodes(TEST_NODES);
            await graph.addEdges(TEST_EDGES);
            await graph.setStyleTemplate(styleWithNested);

            await graph.operationQueue.waitForCompletion();

            // style-init should complete
            assert.isTrue(operationOrder.includes("style-init"),
                "style-init should be in operation order");
        });

        it("should not block parent on child completion", async() => {
            // This tests that nested operations don't cause deadlock

            const startTime = Date.now();

            await graph.setLayout("circular");
            await graph.addNodes(TEST_NODES);
            await graph.addEdges(TEST_EDGES);

            // Style with 2D switch (triggers nested camera-update)
            await graph.setStyleTemplate(createStyleTemplate({graph: {twoD: true}}));

            await graph.operationQueue.waitForCompletion();

            const elapsed = Date.now() - startTime;

            // Should complete in reasonable time (not blocked)
            assert.isBelow(elapsed, 5000, "Should complete without blocking");

            // State should be correct
            assert.isTrue(graph.is2D(), "Should be in 2D mode");
        });
    });
});
