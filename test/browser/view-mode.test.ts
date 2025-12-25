/**
 * ViewMode API Integration Tests
 *
 * Tests for the viewMode property on graphty-element and Graph,
 * including switching between 2D, 3D, and XR modes.
 */
import {afterEach, assert, beforeEach, describe, it} from "vitest";

import type {StyleSchema, ViewMode} from "../../src/config";
import {Graph} from "../../src/Graph";

// Helper to create minimal style templates - uses twoD to test deprecated API compatibility
function createStyleTemplate(overrides: {

    graph?: {viewMode?: ViewMode, twoD?: boolean};
} = {}): StyleSchema {
    return {
        graphtyTemplate: true,
        majorVersion: "1",
        graph: {
            addDefaultStyle: true,
            ... overrides.graph,
        },
        layers: [{
            node: {
                selector: "",
                style: {
                    texture: {
                        color: "#4CAF50",
                    },
                    shape: {
                        type: "sphere" as const,
                        size: 10,
                    },
                },
            },
            edge: {
                selector: "",
                style: {
                    line: {
                        color: "#888888",
                        width: 3,
                    },
                },
            },
        }],
    } as unknown as StyleSchema;
}

describe("ViewMode API", () => {
    let graph: Graph;
    let container: HTMLDivElement;

    const TEST_NODES = [
        {id: 1, name: "Node 1"},
        {id: 2, name: "Node 2"},
        {id: 3, name: "Node 3"},
    ];

    const TEST_EDGES = [
        {id: "e1", source: 1, target: 2},
        {id: "e2", source: 2, target: 3},
    ];

    beforeEach(async() => {
        container = document.createElement("div");
        container.style.width = "400px";
        container.style.height = "400px";
        document.body.appendChild(container);
        graph = new Graph(container);
        await graph.init();
    });

    afterEach(() => {
        graph.dispose();
        document.body.removeChild(container);
    });

    describe("getViewMode()", () => {
        it("should return default view mode '3d'", () => {
            assert.strictEqual(graph.getViewMode(), "3d");
        });

        it("should return '2d' after setting viewMode to '2d'", async() => {
            await graph.setViewMode("2d");
            await graph.operationQueue.waitForCompletion();
            assert.strictEqual(graph.getViewMode(), "2d");
        });

        it("should return '3d' after setting viewMode to '3d'", async() => {
            // First switch to 2d
            await graph.setViewMode("2d");
            await graph.operationQueue.waitForCompletion();

            // Then back to 3d
            await graph.setViewMode("3d");
            await graph.operationQueue.waitForCompletion();
            assert.strictEqual(graph.getViewMode(), "3d");
        });
    });

    describe("setViewMode()", () => {
        it("should switch from 3D to 2D", async() => {
            await graph.addNodes(TEST_NODES);
            await graph.setLayout("circular");
            await graph.operationQueue.waitForCompletion();

            assert.strictEqual(graph.getViewMode(), "3d");
            assert.isFalse(graph.getViewMode() === "2d");

            await graph.setViewMode("2d");
            await graph.operationQueue.waitForCompletion();

            assert.strictEqual(graph.getViewMode(), "2d");
            assert.isTrue(graph.getViewMode() === "2d");
        });

        it("should switch from 2D to 3D", async() => {
            await graph.setViewMode("2d");
            await graph.operationQueue.waitForCompletion();

            await graph.addNodes(TEST_NODES);
            await graph.setLayout("circular");
            await graph.operationQueue.waitForCompletion();

            assert.strictEqual(graph.getViewMode(), "2d");
            assert.isTrue(graph.getViewMode() === "2d");

            await graph.setViewMode("3d");
            await graph.operationQueue.waitForCompletion();

            assert.strictEqual(graph.getViewMode(), "3d");
            assert.isFalse(graph.getViewMode() === "2d");
        });

        it("should not change if setting same mode", async() => {
            const initialMode = graph.getViewMode();
            await graph.setViewMode("3d");
            await graph.operationQueue.waitForCompletion();

            assert.strictEqual(graph.getViewMode(), initialMode);
        });

        it("should sync twoD property when viewMode changes", async() => {
            assert.isFalse(graph.getViewMode() === "2d", "Should start in 3D");

            await graph.setViewMode("2d");
            await graph.operationQueue.waitForCompletion();

            assert.isTrue(graph.getViewMode() === "2d", "is2D() should be true when viewMode is '2d'");
            // eslint-disable-next-line @typescript-eslint/no-deprecated -- Testing backward compatibility
            assert.isTrue(graph.styles.config.graph.twoD, "twoD config should be true");

            await graph.setViewMode("3d");
            await graph.operationQueue.waitForCompletion();

            assert.isFalse(graph.getViewMode() === "2d", "is2D() should be false when viewMode is '3d'");
            // eslint-disable-next-line @typescript-eslint/no-deprecated -- Testing backward compatibility
            assert.isFalse(graph.styles.config.graph.twoD, "twoD config should be false");
        });

        it("should update scene metadata", async() => {
            await graph.setViewMode("2d");
            await graph.operationQueue.waitForCompletion();

            assert.strictEqual(graph.scene.metadata?.viewMode, "2d");
            assert.isTrue(graph.scene.metadata?.twoD);

            await graph.setViewMode("3d");
            await graph.operationQueue.waitForCompletion();

            assert.strictEqual(graph.scene.metadata?.viewMode, "3d");
            assert.isFalse(graph.scene.metadata?.twoD);
        });
    });

    describe("Z-coordinate handling with viewMode", () => {
        it("should flatten Z positions when switching to 2D via setViewMode", async() => {
            // Setup in 3D mode
            await graph.addNodes(TEST_NODES);
            await graph.addEdges(TEST_EDGES);
            await graph.setLayout("circular");
            await graph.operationQueue.waitForCompletion();

            assert.strictEqual(graph.getViewMode(), "3d");

            // Switch to 2D mode using viewMode API
            await graph.setViewMode("2d");
            await graph.operationQueue.waitForCompletion();

            // Verify Z positions are flattened
            assert.strictEqual(graph.getViewMode(), "2d");
            for (const node of graph.getNodes()) {
                assert.closeTo(
                    node.mesh.position.z,
                    0,
                    0.01,
                    `Node ${node.id} Z position should be ~0 in 2D mode`,
                );
            }
        });

        it("should restore Z positions when switching back to 3D via setViewMode", async() => {
            // Setup in 3D mode
            await graph.addNodes(TEST_NODES);
            await graph.addEdges(TEST_EDGES);
            await graph.setLayout("circular");
            await graph.operationQueue.waitForCompletion();

            // Force node positions to be updated from layout engine
            for (const node of graph.getNodes()) {
                node.update();
            }

            // Store original 3D Z positions
            const originalZPositions = new Map<string | number, number>();
            for (const node of graph.getNodes()) {
                originalZPositions.set(node.id, node.mesh.position.z);
            }

            // Switch to 2D mode
            await graph.setViewMode("2d");
            await graph.operationQueue.waitForCompletion();

            // Verify flattened
            for (const node of graph.getNodes()) {
                assert.closeTo(node.mesh.position.z, 0, 0.01, "Should be flattened in 2D");
            }

            // Switch back to 3D mode
            await graph.setViewMode("3d");
            await graph.operationQueue.waitForCompletion();

            // Verify Z positions are restored
            for (const node of graph.getNodes()) {
                const originalZ = originalZPositions.get(node.id);
                assert.isDefined(originalZ, `Should have original Z for node ${node.id}`);
                assert.closeTo(
                    node.mesh.position.z,
                    originalZ,
                    0.01,
                    `Node ${node.id} Z position should be restored`,
                );
            }
        });
    });

    describe("Style template with viewMode", () => {
        it("should set viewMode from style template", async() => {
            const template = createStyleTemplate({graph: {viewMode: "2d"}});
            await graph.setStyleTemplate(template);
            await graph.operationQueue.waitForCompletion();

            assert.strictEqual(graph.getViewMode(), "2d");
            assert.isTrue(graph.getViewMode() === "2d");
        });

        it("should prioritize viewMode over twoD in style template", async() => {
            // If both are set, viewMode should take precedence
            const template = createStyleTemplate({
                graph: {viewMode: "3d", twoD: true},
            });
            await graph.setStyleTemplate(template);
            await graph.operationQueue.waitForCompletion();

            // viewMode should win
            assert.strictEqual(graph.getViewMode(), "3d");
        });

        it("should handle deprecated twoD in style template", async() => {
            // Using only twoD (deprecated)
            const template = createStyleTemplate({graph: {twoD: true}});
            await graph.setStyleTemplate(template);
            await graph.operationQueue.waitForCompletion();

            // Should work but convert to viewMode internally
            assert.strictEqual(graph.getViewMode(), "2d");
            assert.isTrue(graph.getViewMode() === "2d");
        });

        it("should switch modes when style template changes viewMode", async() => {
            // Start in 3D
            const template3D = createStyleTemplate({graph: {viewMode: "3d"}});
            await graph.setStyleTemplate(template3D);
            await graph.operationQueue.waitForCompletion();

            assert.strictEqual(graph.getViewMode(), "3d");

            // Switch to 2D via style template
            const template2D = createStyleTemplate({graph: {viewMode: "2d"}});
            await graph.setStyleTemplate(template2D);
            await graph.operationQueue.waitForCompletion();

            assert.strictEqual(graph.getViewMode(), "2d");
        });
    });

    describe("XR mode fallback", () => {
        // Note: XR modes will fall back to 3D when WebXR is not available
        it("should fall back to 3d when VR is not available", async() => {
            // Try to switch to VR (should fail gracefully)
            await graph.setViewMode("vr");
            await graph.operationQueue.waitForCompletion();

            // Should fall back to 3D since XR is not available in test environment
            assert.strictEqual(graph.getViewMode(), "3d");
        });

        it("should fall back to 3d when AR is not available", async() => {
            // Try to switch to AR (should fail gracefully)
            await graph.setViewMode("ar");
            await graph.operationQueue.waitForCompletion();

            // Should fall back to 3D since XR is not available in test environment
            assert.strictEqual(graph.getViewMode(), "3d");
        });
    });

    describe("Round-trip mode switching", () => {
        it("should handle multiple 2D <-> 3D switches correctly", async() => {
            await graph.addNodes(TEST_NODES);
            await graph.addEdges(TEST_EDGES);
            await graph.setLayout("circular");
            await graph.operationQueue.waitForCompletion();

            // Force node positions to be updated from layout engine
            for (const node of graph.getNodes()) {
                node.update();
            }

            // Store original Z positions
            const originalZPositions = new Map<string | number, number>();
            for (const node of graph.getNodes()) {
                originalZPositions.set(node.id, node.mesh.position.z);
            }

            // Multiple round trips using setViewMode
            for (let i = 0; i < 3; i++) {
                // To 2D
                await graph.setViewMode("2d");
                await graph.operationQueue.waitForCompletion();

                assert.strictEqual(graph.getViewMode(), "2d");
                for (const node of graph.getNodes()) {
                    assert.closeTo(
                        node.mesh.position.z,
                        0,
                        0.01,
                        `Round ${i + 1}: Node ${node.id} should be flattened in 2D`,
                    );
                }

                // Back to 3D
                await graph.setViewMode("3d");
                await graph.operationQueue.waitForCompletion();

                assert.strictEqual(graph.getViewMode(), "3d");
                for (const node of graph.getNodes()) {
                    const originalZ = originalZPositions.get(node.id);
                    if (originalZ === undefined) {
                        assert.fail(`Should have original Z for node ${node.id}`);
                    }

                    assert.closeTo(
                        node.mesh.position.z,
                        originalZ,
                        0.01,
                        `Round ${i + 1}: Node ${node.id} Z should be restored`,
                    );
                }
            }
        });
    });
});
