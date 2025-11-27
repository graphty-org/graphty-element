import {afterEach, assert, beforeEach, describe, it, vi} from "vitest";

import {Graph} from "../../src/Graph";
import {UpdateManager} from "../../src/managers/UpdateManager";
import {cleanupTestGraph, createTestGraph} from "../helpers/testSetup";

describe("UpdateManager", () => {
    let graph: Graph;
    let updateManager: UpdateManager;

    beforeEach(async() => {
        graph = await createTestGraph();

        // Add test data
        await graph.addNodes([
            {id: "1"},
            {id: "2"},
            {id: "3"},
        ]);
        await graph.addEdges([
            {src: "1", dst: "2"},
            {src: "2", dst: "3"},
        ]);

        // Set fixed layout
        await graph.setLayout("fixed");

        const graphAny = graph as unknown as Record<string, unknown>;
        updateManager = graphAny.updateManager as UpdateManager;
    });

    afterEach(() => {
        cleanupTestGraph(graph);
    });

    describe("initialization", () => {
        it("should initialize without errors", async() => {
            await updateManager.init();
            assert.isNotNull(updateManager);
        });

        it("should dispose without errors", () => {
            updateManager.dispose();
            assert.isNotNull(updateManager);
        });
    });

    describe("update loop", () => {
        it("should increment frame count on update", () => {
            const initialFrameCount = updateManager.getRenderFrameCount();
            updateManager.update();
            assert.equal(updateManager.getRenderFrameCount(), initialFrameCount + 1);
        });

        it("should call update multiple times via renderFixedFrames", () => {
            const initialFrameCount = updateManager.getRenderFrameCount();
            updateManager.renderFixedFrames(5);
            assert.equal(updateManager.getRenderFrameCount(), initialFrameCount + 5);
        });
    });

    describe("edge rendering regression test", () => {
        it("should update edges even when layout is not running", () => {
            // This is a regression test for the bug where edges weren't rendered
            // when layout wasn't running (e.g., fixed layout, settled layout)

            const layoutManager = graph.getLayoutManager();

            // Spy on edge update method
            const edgeSpy = vi.fn();
            for (const edge of layoutManager.edges) {
                vi.spyOn(edge, "update").mockImplementation(edgeSpy);
            }

            // Ensure layout is not running (simulates fixed layout or settled state)
            layoutManager.running = false;

            // Call update - this should STILL update edges
            updateManager.update();

            // Verify edges were updated even though layout wasn't running
            assert.isTrue(
                edgeSpy.mock.calls.length > 0,
                "Edges should be updated even when layout is not running",
            );
        });

        it("should update nodes even when layout is not running", () => {
            const layoutManager = graph.getLayoutManager();

            // Spy on node update method
            const nodeSpy = vi.fn();
            for (const node of layoutManager.nodes) {
                vi.spyOn(node, "update").mockImplementation(nodeSpy);
            }

            // Ensure layout is not running
            layoutManager.running = false;

            // Call update
            updateManager.update();

            // Verify nodes were updated
            assert.isTrue(
                nodeSpy.mock.calls.length > 0,
                "Nodes should be updated even when layout is not running",
            );
        });

        it("should always update camera regardless of layout state", () => {
            const {camera} = graph;
            const cameraSpy = vi.spyOn(camera, "update");

            const layoutManager = graph.getLayoutManager();
            layoutManager.running = false;

            updateManager.update();

            assert.isTrue(
                cameraSpy.mock.calls.length > 0,
                "Camera should always be updated",
            );
        });
    });

    describe("zoom to fit", () => {
        it("should enable zoom to fit", () => {
            updateManager.enableZoomToFit();
            assert.isFalse(updateManager.zoomToFitCompleted);
        });

        it("should complete zoom to fit after sufficient frames", () => {
            updateManager.enableZoomToFit();

            // Render enough frames for zoom to complete
            updateManager.renderFixedFrames(20);

            // Should have zoomed by now
            assert.isTrue(updateManager.zoomToFitCompleted);
        });
    });

    describe("configuration", () => {
        it("should update configuration", () => {
            updateManager.updateConfig({
                layoutStepMultiplier: 5,
                autoZoomToFit: false,
            });

            // Configuration is private, but we can verify it doesn't throw
            assert.isNotNull(updateManager);
        });
    });
});
