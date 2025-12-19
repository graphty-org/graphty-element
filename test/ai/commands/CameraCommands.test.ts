/**
 * CameraCommands Tests - Tests for camera-related commands.
 * @module test/ai/commands/CameraCommands.test
 */

import {assert, beforeEach, describe, it} from "vitest";

import {
    setCameraPosition,
    zoomToNodes,
} from "../../../src/ai/commands/CameraCommands";
import type {CommandContext} from "../../../src/ai/commands/types";
import type {Graph} from "../../../src/Graph";
import {createMockContext, createTestGraph} from "../../helpers/test-graph";

describe("CameraCommands", () => {
    let graph: Graph;
    let context: CommandContext;

    beforeEach(() => {
        graph = createTestGraph();
        context = createMockContext(graph);
    });

    describe("setCameraPosition", () => {
        it("applies camera preset 'top'", async() => {
            const result = await setCameraPosition.execute(graph, {
                preset: "topView",
                animate: true,
            }, context);

            assert.strictEqual(result.success, true);
            assert.ok(result.message.toLowerCase().includes("camera") ||
                      result.message.toLowerCase().includes("top"));
        });

        it("applies camera preset 'fitToGraph'", async() => {
            const result = await setCameraPosition.execute(graph, {
                preset: "fitToGraph",
                animate: true,
            }, context);

            assert.strictEqual(result.success, true);
        });

        it("applies camera preset 'sideView'", async() => {
            const result = await setCameraPosition.execute(graph, {
                preset: "sideView",
                animate: false,
            }, context);

            assert.strictEqual(result.success, true);
        });

        it("applies camera preset 'frontView'", async() => {
            const result = await setCameraPosition.execute(graph, {
                preset: "frontView",
            }, context);

            assert.strictEqual(result.success, true);
        });

        it("applies camera preset 'isometric'", async() => {
            const result = await setCameraPosition.execute(graph, {
                preset: "isometric",
            }, context);

            assert.strictEqual(result.success, true);
        });

        it("sets camera to specific position", async() => {
            const result = await setCameraPosition.execute(graph, {
                position: {x: 10, y: 20, z: 30},
                target: {x: 0, y: 0, z: 0},
            }, context);

            assert.strictEqual(result.success, true);
        });

        it("sets camera position without target", async() => {
            const result = await setCameraPosition.execute(graph, {
                position: {x: 5, y: 10, z: 15},
            }, context);

            assert.strictEqual(result.success, true);
        });

        it("handles animation option", async() => {
            const resultAnimated = await setCameraPosition.execute(graph, {
                preset: "topView",
                animate: true,
            }, context);

            const resultImmediate = await setCameraPosition.execute(graph, {
                preset: "topView",
                animate: false,
            }, context);

            assert.strictEqual(resultAnimated.success, true);
            assert.strictEqual(resultImmediate.success, true);
        });

        it("rejects unknown preset", async() => {
            const result = await setCameraPosition.execute(graph, {
                preset: "unknownPreset123",
            }, context);

            // Should fail or handle gracefully
            assert.ok(!result.success || result.message.toLowerCase().includes("unknown"));
        });
    });

    describe("zoomToNodes", () => {
        it("zooms to fit all nodes with empty selector", async() => {
            const result = await zoomToNodes.execute(graph, {
                selector: "",
            }, context);

            assert.strictEqual(result.success, true);
        });

        it("zooms to fit all nodes when selector is undefined", async() => {
            const result = await zoomToNodes.execute(graph, {}, context);

            assert.strictEqual(result.success, true);
        });

        it("zooms to nodes matching selector", async() => {
            const result = await zoomToNodes.execute(graph, {
                selector: "data.type == 'server'",
            }, context);

            assert.strictEqual(result.success, true);
        });

        it("handles animate option", async() => {
            const result = await zoomToNodes.execute(graph, {
                selector: "",
                animate: true,
            }, context);

            assert.strictEqual(result.success, true);
        });

        it("handles padding option", async() => {
            const result = await zoomToNodes.execute(graph, {
                selector: "",
                padding: 1.5,
            }, context);

            assert.strictEqual(result.success, true);
        });

        it("returns affected nodes in result", async() => {
            const result = await zoomToNodes.execute(graph, {
                selector: "data.type == 'server'",
            }, context);

            assert.strictEqual(result.success, true);
            // Should return info about which nodes were zoomed to
            assert.ok(result.affectedNodes !== undefined || result.data !== undefined);
        });
    });

    describe("setCameraPosition metadata", () => {
        it("has correct name", () => {
            assert.strictEqual(setCameraPosition.name, "setCameraPosition");
        });

        it("has description", () => {
            assert.ok(setCameraPosition.description.length > 0);
        });

        it("has parameters schema", () => {
            assert.ok(setCameraPosition.parameters);
        });

        it("has examples", () => {
            assert.ok(Array.isArray(setCameraPosition.examples));
            assert.ok(setCameraPosition.examples.length > 0);
        });
    });

    describe("zoomToNodes metadata", () => {
        it("has correct name", () => {
            assert.strictEqual(zoomToNodes.name, "zoomToNodes");
        });

        it("has description", () => {
            assert.ok(zoomToNodes.description.length > 0);
        });

        it("has parameters schema", () => {
            assert.ok(zoomToNodes.parameters);
        });

        it("has examples", () => {
            assert.ok(Array.isArray(zoomToNodes.examples));
            assert.ok(zoomToNodes.examples.length > 0);
        });
    });
});
