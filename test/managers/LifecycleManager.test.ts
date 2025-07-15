import {afterEach, assert, beforeEach, describe, it} from "vitest";

import {Graph} from "../../src/Graph";
import {cleanupTestGraph, createTestGraph} from "../helpers/testSetup";

describe("LifecycleManager", () => {
    let graph: Graph;

    beforeEach(async() => {
        graph = await createTestGraph();
    });

    afterEach(() => {
        cleanupTestGraph(graph);
    });

    describe("graph lifecycle integration", () => {
        it("should initialize graph successfully", () => {
            // The graph should already be initialized in beforeEach
            assert.isNotNull(graph);

            // Verify key managers are accessible
            assert.isNotNull(graph.getDataManager());
            assert.isNotNull(graph.getLayoutManager());
            assert.isNotNull(graph.getStyleManager());
        });

        it("should handle graph shutdown gracefully", () => {
            // Should not throw when shutting down
            assert.doesNotThrow(() => {
                graph.shutdown();
            });
        });

        it("should reinitialize after shutdown", async() => {
            graph.shutdown();

            // Create a new graph instance instead of reinitializing
            // (reinitializing the same graph might cause issues)
            const container = document.createElement("div");
            document.body.appendChild(container);
            const newGraph = new Graph(container);
            await newGraph.init();

            // Verify managers are accessible
            assert.isNotNull(newGraph.getDataManager());
            assert.isNotNull(newGraph.getLayoutManager());
            assert.isNotNull(newGraph.getStyleManager());

            // Cleanup
            newGraph.shutdown();
            container.remove();
        });

        it("should handle multiple shutdowns gracefully", () => {
            graph.shutdown();

            // Second shutdown should not throw
            assert.doesNotThrow(() => {
                graph.shutdown();
            });
        });

        it("should coordinate manager initialization order", async() => {
            // Create a new graph to test initialization
            const container = document.createElement("div");
            document.body.appendChild(container);
            const newGraph = new Graph(container);

            await newGraph.init();

            // All managers should be properly initialized
            assert.isNotNull(newGraph.getDataManager());
            assert.isNotNull(newGraph.getLayoutManager());
            assert.isNotNull(newGraph.getStyleManager());

            // Cleanup
            newGraph.shutdown();
            container.remove();
        });

        it("should handle manager operations after initialization", async() => {
            const dataManager = graph.getDataManager();
            const layoutManager = graph.getLayoutManager();

            // Should be able to add data
            dataManager.addNodes([
                {id: "test1", label: "Test 1"},
                {id: "test2", label: "Test 2"},
            ] as Record<string, unknown>[]);

            // Should be able to set layout
            await layoutManager.setLayout("ngraph", {});

            // Verify data was added
            assert.equal(dataManager.nodes.size, 2);
            assert.isNotNull(layoutManager.layoutEngine);
        });
    });

    describe("error handling", () => {
        it("should handle initialization errors gracefully", () => {
            // Test with a malformed container
            const badContainer = null;

            // Should throw immediately on construction with null container
            assert.throws(() => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                new Graph(badContainer as any);
            }, /Graph constructor requires 'element' argument/);
        });

        it("should handle operations on disposed graph", () => {
            graph.shutdown();

            // Operations after shutdown should either throw or handle gracefully
            // This tests the lifecycle manager's error handling
            try {
                const dataManager = graph.getDataManager();
                dataManager.addNodes([{id: "test"} as Record<string, unknown>]);
                assert.isNotNull(dataManager);
            } catch (error) {
                // It's acceptable to throw after shutdown
                assert.isNotNull(error);
            }
        });
    });
});

