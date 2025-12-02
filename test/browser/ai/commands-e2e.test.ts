/**
 * AI Commands End-to-End Tests
 *
 * Tests all AI commands against a real Graph instance with Babylon.js rendering.
 * These tests catch integration issues that unit tests with mocks cannot detect.
 *
 * @module test/browser/ai/commands-e2e
 */

import {afterEach, assert, beforeEach, describe, it} from "vitest";

import type {MockLlmProvider} from "../../../src/ai/providers/MockLlmProvider";
import type {Graph} from "../../../src/Graph";
import {
    cleanupE2EGraph,
    createE2EGraph,
    DEFAULT_TEST_EDGES,
    DEFAULT_TEST_NODES,
} from "../../helpers/e2e-graph-setup";

/**
 * Type for data returned by queryGraph command.
 */
interface QueryData {
    nodeCount?: number;
    edgeCount?: number;
    layout?: string;
    is2D?: boolean;
}

/**
 * Type for data returned by findNodes command.
 */
interface FindNodesData {
    count: number;
    nodeIds: string[];
}

describe("AI Commands End-to-End", () => {
    let graph: Graph;

    beforeEach(async() => {
        // Create a real graphty-element with test data
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

        const provider = aiManager.getProvider() as MockLlmProvider;

        return provider;
    }

    describe("queryGraph command", () => {
        it("returns correct node count from real graph", async() => {
            const provider = getProvider();

            provider.setResponse("count nodes", {
                text: "",
                toolCalls: [{id: "1", name: "queryGraph", arguments: {query: "nodeCount"}}],
            });

            const result = await graph.aiCommand("count nodes");

            assert.strictEqual(result.success, true);
            assert.strictEqual((result.data as QueryData).nodeCount, 5);
        });

        it("returns correct edge count from real graph", async() => {
            const provider = getProvider();

            provider.setResponse("count edges", {
                text: "",
                toolCalls: [{id: "1", name: "queryGraph", arguments: {query: "edgeCount"}}],
            });

            const result = await graph.aiCommand("count edges");

            assert.strictEqual(result.success, true);
            assert.strictEqual((result.data as QueryData).edgeCount, 5);
        });

        it("returns graph summary with all statistics", async() => {
            const provider = getProvider();

            provider.setResponse("summary", {
                text: "",
                toolCalls: [{id: "1", name: "queryGraph", arguments: {query: "summary"}}],
            });

            const result = await graph.aiCommand("summary");

            assert.strictEqual(result.success, true);
            const data = result.data as QueryData;
            assert.ok(data.nodeCount !== undefined);
            assert.ok(data.edgeCount !== undefined);
        });

        it("returns current layout information", async() => {
            const provider = getProvider();

            provider.setResponse("layout", {
                text: "",
                toolCalls: [{id: "1", name: "queryGraph", arguments: {query: "currentLayout"}}],
            });

            const result = await graph.aiCommand("what layout");

            assert.strictEqual(result.success, true);
            assert.ok((result.data as QueryData).layout !== undefined);
        });
    });

    describe("setLayout command", () => {
        it("changes to circular layout", async() => {
            const provider = getProvider();

            provider.setResponse("circular", {
                text: "",
                toolCalls: [{id: "1", name: "setLayout", arguments: {type: "circular"}}],
            });

            const result = await graph.aiCommand("circular");

            assert.strictEqual(result.success, true);

            // Verify layout actually changed
            const layoutManager = graph.getLayoutManager();
            assert.strictEqual(layoutManager.layoutEngine?.type, "circular");
        });

        it("changes to force-directed layout", async() => {
            const provider = getProvider();

            provider.setResponse("force", {
                text: "",
                toolCalls: [{id: "1", name: "setLayout", arguments: {type: "ngraph"}}],
            });

            const result = await graph.aiCommand("force");

            assert.strictEqual(result.success, true);
            const layoutManager = graph.getLayoutManager();
            assert.strictEqual(layoutManager.layoutEngine?.type, "ngraph");
        });

        it("rejects invalid layout type with helpful error", async() => {
            const provider = getProvider();

            provider.setResponse("invalid", {
                text: "",
                toolCalls: [{id: "1", name: "setLayout", arguments: {type: "nonexistent"}}],
            });

            const result = await graph.aiCommand("invalid");

            assert.strictEqual(result.success, false);
            assert.ok(
                result.message.includes("Invalid layout") ||
                result.message.includes("not found") ||
                result.message.includes("unknown") ||
                result.message.toLowerCase().includes("layout"),
            );
        });

        it("changes to spiral layout", async() => {
            const provider = getProvider();

            provider.setResponse("spiral", {
                text: "",
                toolCalls: [{id: "1", name: "setLayout", arguments: {type: "spiral"}}],
            });

            const result = await graph.aiCommand("spiral");

            assert.strictEqual(result.success, true);
            const layoutManager = graph.getLayoutManager();
            assert.strictEqual(layoutManager.layoutEngine?.type, "spiral");
        });

        it("changes to shell layout", async() => {
            const provider = getProvider();

            provider.setResponse("shell", {
                text: "",
                toolCalls: [{id: "1", name: "setLayout", arguments: {type: "shell"}}],
            });

            const result = await graph.aiCommand("shell");

            assert.strictEqual(result.success, true);
            const layoutManager = graph.getLayoutManager();
            assert.strictEqual(layoutManager.layoutEngine?.type, "shell");
        });

        it("changes to random layout", async() => {
            const provider = getProvider();

            provider.setResponse("random", {
                text: "",
                toolCalls: [{id: "1", name: "setLayout", arguments: {type: "random"}}],
            });

            const result = await graph.aiCommand("random");

            assert.strictEqual(result.success, true);
            const layoutManager = graph.getLayoutManager();
            assert.strictEqual(layoutManager.layoutEngine?.type, "random");
        });
    });

    describe("setDimension command", () => {
        it("switches to 2D mode", async() => {
            const provider = getProvider();

            // Ensure we start in 3D
            assert.strictEqual(graph.is2D(), false);

            provider.setResponse("2d", {
                text: "",
                toolCalls: [{id: "1", name: "setDimension", arguments: {dimension: "2d"}}],
            });

            const result = await graph.aiCommand("2d");

            assert.strictEqual(result.success, true);
            assert.strictEqual(graph.is2D(), true);
        });

        it("switches to 3D mode", async() => {
            const provider = getProvider();

            // First switch to 2D
            provider.setResponse("2d", {
                text: "",
                toolCalls: [{id: "1", name: "setDimension", arguments: {dimension: "2d"}}],
            });
            await graph.aiCommand("2d");
            assert.strictEqual(graph.is2D(), true);

            // Now switch back to 3D
            provider.setResponse("3d", {
                text: "",
                toolCalls: [{id: "1", name: "setDimension", arguments: {dimension: "3d"}}],
            });

            const result = await graph.aiCommand("3d");

            assert.strictEqual(result.success, true);
            assert.strictEqual(graph.is2D(), false);
        });

        it("handles 2d string dimension parameter", async() => {
            const provider = getProvider();

            provider.setResponse("flat", {
                text: "",
                toolCalls: [{id: "1", name: "setDimension", arguments: {dimension: "2d"}}],
            });

            const result = await graph.aiCommand("flat");

            assert.strictEqual(result.success, true);
            assert.strictEqual(graph.is2D(), true);
        });

        it("handles 3d string dimension parameter", async() => {
            const provider = getProvider();

            // First switch to 2D
            provider.setResponse("2d", {
                text: "",
                toolCalls: [{id: "1", name: "setDimension", arguments: {dimension: "2d"}}],
            });
            await graph.aiCommand("2d");

            provider.setResponse("3d", {
                text: "",
                toolCalls: [{id: "1", name: "setDimension", arguments: {dimension: "3d"}}],
            });

            const result = await graph.aiCommand("3d");

            assert.strictEqual(result.success, true);
            assert.strictEqual(graph.is2D(), false);
        });
    });

    describe("setImmersiveMode command", () => {
        it("gracefully handles VR when WebXR not available", async() => {
            const provider = getProvider();

            provider.setResponse("vr", {
                text: "",
                toolCalls: [{id: "1", name: "setImmersiveMode", arguments: {mode: "vr"}}],
            });

            const result = await graph.aiCommand("vr");

            // Should fail gracefully since WebXR is not available in test environment
            assert.ok(
                result.message.includes("VR") ||
                result.message.includes("WebXR") ||
                result.message.includes("not") ||
                result.message.toLowerCase().includes("support"),
            );
        });

        it("gracefully handles AR when WebXR not available", async() => {
            const provider = getProvider();

            provider.setResponse("ar", {
                text: "",
                toolCalls: [{id: "1", name: "setImmersiveMode", arguments: {mode: "ar"}}],
            });

            const result = await graph.aiCommand("ar");

            // Should fail gracefully since WebXR is not available in test environment
            assert.ok(
                result.message.includes("AR") ||
                result.message.includes("WebXR") ||
                result.message.includes("not") ||
                result.message.toLowerCase().includes("support"),
            );
        });

        it("handles exit immersive mode", async() => {
            const provider = getProvider();

            provider.setResponse("exit", {
                text: "",
                toolCalls: [{id: "1", name: "setImmersiveMode", arguments: {mode: "exit"}}],
            });

            const result = await graph.aiCommand("exit");

            assert.strictEqual(result.success, true);
            assert.ok(
                result.message.includes("exit") ||
                result.message.includes("Exit") ||
                result.message.includes("normal") ||
                result.message.includes("returned"),
            );
        });
    });

    describe("multiple commands in sequence", () => {
        it("executes layout then dimension change", async() => {
            const provider = getProvider();

            // Change layout
            provider.setResponse("circular", {
                text: "",
                toolCalls: [{id: "1", name: "setLayout", arguments: {type: "circular"}}],
            });
            const layoutResult = await graph.aiCommand("circular");
            assert.strictEqual(layoutResult.success, true);

            // Change dimension
            provider.setResponse("2d", {
                text: "",
                toolCalls: [{id: "1", name: "setDimension", arguments: {dimension: "2d"}}],
            });
            const dimResult = await graph.aiCommand("2d");
            assert.strictEqual(dimResult.success, true);

            // Verify dimension changed
            assert.strictEqual(graph.is2D(), true);
            // Note: dimension change may reset layout to default, which is expected behavior
        });

        it("query works after layout change", async() => {
            const provider = getProvider();

            // Change layout
            provider.setResponse("spiral", {
                text: "",
                toolCalls: [{id: "1", name: "setLayout", arguments: {type: "spiral"}}],
            });
            await graph.aiCommand("spiral");

            // Query should still work
            provider.setResponse("count", {
                text: "",
                toolCalls: [{id: "1", name: "queryGraph", arguments: {query: "nodeCount"}}],
            });
            const result = await graph.aiCommand("count");

            assert.strictEqual(result.success, true);
            assert.strictEqual((result.data as QueryData).nodeCount, 5);
        });

        it("executes dimension then layout change", async() => {
            const provider = getProvider();

            // Change dimension first
            provider.setResponse("2d", {
                text: "",
                toolCalls: [{id: "1", name: "setDimension", arguments: {dimension: "2d"}}],
            });
            await graph.aiCommand("2d");

            // Then change layout
            provider.setResponse("shell", {
                text: "",
                toolCalls: [{id: "1", name: "setLayout", arguments: {type: "shell"}}],
            });
            await graph.aiCommand("shell");

            // Verify both changes took effect
            assert.strictEqual(graph.is2D(), true);
            const layoutManager = graph.getLayoutManager();
            assert.strictEqual(layoutManager.layoutEngine?.type, "shell");
        });
    });

    describe("error handling", () => {
        it("handles command execution errors gracefully", async() => {
            const provider = getProvider();

            // Try to call a non-existent command
            provider.setResponse("bad", {
                text: "",
                toolCalls: [{id: "1", name: "nonExistentCommand", arguments: {}}],
            });

            const result = await graph.aiCommand("bad");

            assert.strictEqual(result.success, false);
            assert.ok(
                result.message.toLowerCase().includes("unknown") ||
                result.message.toLowerCase().includes("not found"),
            );
        });

        it("recovers after error and can execute new commands", async() => {
            const provider = getProvider();

            // First, cause an error
            provider.setResponse("bad", {
                text: "",
                toolCalls: [{id: "1", name: "nonExistentCommand", arguments: {}}],
            });
            await graph.aiCommand("bad");

            // Now execute a valid command
            provider.setResponse("circular", {
                text: "",
                toolCalls: [{id: "1", name: "setLayout", arguments: {type: "circular"}}],
            });
            const result = await graph.aiCommand("circular");

            assert.strictEqual(result.success, true);
        });

        it("handles AI not enabled gracefully", async() => {
            // Create a graph without AI enabled
            cleanupE2EGraph();
            const noAiResult = await createE2EGraph({
                nodes: [{id: "A"}],
                edges: [],
                enableAi: false,
            });

            const result = await noAiResult.graph.aiCommand("count nodes");

            assert.strictEqual(result.success, false);
            assert.ok(
                result.message.toLowerCase().includes("not enabled") ||
                result.message.toLowerCase().includes("enableaicontrol"),
            );
        });
    });

    describe("findNodes command", () => {
        it("finds all nodes with empty selector", async() => {
            const provider = getProvider();

            provider.setResponse("find all", {
                text: "",
                toolCalls: [{id: "1", name: "findNodes", arguments: {selector: ""}}],
            });

            const result = await graph.aiCommand("find all nodes");

            assert.strictEqual(result.success, true);
            assert.strictEqual((result.data as FindNodesData).count, 5);
        });

        it("finds nodes with type selector", async() => {
            const provider = getProvider();

            provider.setResponse("find servers", {
                text: "",
                toolCalls: [{id: "1", name: "findNodes", arguments: {selector: "data.type == 'server'"}}],
            });

            const result = await graph.aiCommand("find servers");

            assert.strictEqual(result.success, true);
            // We have 2 server nodes (A and C)
            assert.strictEqual((result.data as FindNodesData).count, 2);
        });

        it("limits results when specified", async() => {
            const provider = getProvider();

            provider.setResponse("find first", {
                text: "",
                toolCalls: [{id: "1", name: "findNodes", arguments: {selector: "", limit: 2}}],
            });

            const result = await graph.aiCommand("find first 2");

            assert.strictEqual(result.success, true);
            assert.strictEqual((result.data as FindNodesData).count, 2);
        });
    });

    describe("findAndStyleNodes command", () => {
        it("styles all nodes with empty selector", async() => {
            const provider = getProvider();

            provider.setResponse("make red", {
                text: "",
                toolCalls: [{id: "1", name: "findAndStyleNodes", arguments: {
                    selector: "",
                    style: {color: "#ff0000"},
                    layerName: "red-nodes",
                }}],
            });

            const result = await graph.aiCommand("make all nodes red");

            assert.strictEqual(result.success, true);
        });

        it("styles nodes matching selector", async() => {
            const provider = getProvider();

            // Use a selector that matches the E2E data structure
            provider.setResponse("highlight servers", {
                text: "",
                toolCalls: [{id: "1", name: "findAndStyleNodes", arguments: {
                    selector: "type == 'server'",
                    style: {color: "#0000ff", glowColor: "#0000ff", glowStrength: 1},
                    layerName: "server-highlight",
                }}],
            });

            const result = await graph.aiCommand("highlight servers in blue");

            assert.strictEqual(result.success, true);
        });

        it("applies size style to nodes", async() => {
            const provider = getProvider();

            provider.setResponse("bigger", {
                text: "",
                toolCalls: [{id: "1", name: "findAndStyleNodes", arguments: {
                    selector: "",
                    style: {size: 2},
                    layerName: "big-nodes",
                }}],
            });

            const result = await graph.aiCommand("make nodes bigger");

            assert.strictEqual(result.success, true);
        });

        it("handles non-matching selector gracefully", async() => {
            const provider = getProvider();

            provider.setResponse("no match", {
                text: "",
                toolCalls: [{id: "1", name: "findAndStyleNodes", arguments: {
                    selector: "type == 'nonexistent'",
                    style: {color: "#ff0000"},
                }}],
            });

            const result = await graph.aiCommand("style nonexistent nodes");

            assert.strictEqual(result.success, true);
        });
    });

    describe("findAndStyleEdges command", () => {
        it("styles all edges with empty selector", async() => {
            const provider = getProvider();

            provider.setResponse("green edges", {
                text: "",
                toolCalls: [{id: "1", name: "findAndStyleEdges", arguments: {
                    selector: "",
                    style: {color: "#00ff00"},
                    layerName: "green-edges",
                }}],
            });

            const result = await graph.aiCommand("make all edges green");

            assert.strictEqual(result.success, true);
        });

        it("applies width style to edges", async() => {
            const provider = getProvider();

            provider.setResponse("thick edges", {
                text: "",
                toolCalls: [{id: "1", name: "findAndStyleEdges", arguments: {
                    selector: "",
                    style: {width: 3},
                    layerName: "thick-edges",
                }}],
            });

            const result = await graph.aiCommand("make edges thicker");

            assert.strictEqual(result.success, true);
        });
    });

    describe("clearStyles command", () => {
        it("clears specific style layer by name", async() => {
            const provider = getProvider();

            // First add a style
            provider.setResponse("add red", {
                text: "",
                toolCalls: [{id: "1", name: "findAndStyleNodes", arguments: {
                    selector: "",
                    style: {color: "#ff0000"},
                    layerName: "red-nodes",
                }}],
            });
            const addResult = await graph.aiCommand("make red");
            assert.strictEqual(addResult.success, true);

            // Now clear it
            provider.setResponse("clear red", {
                text: "",
                toolCalls: [{id: "1", name: "clearStyles", arguments: {
                    layerName: "red-nodes",
                }}],
            });

            const result = await graph.aiCommand("clear red styling");

            assert.strictEqual(result.success, true);
        });

        it("clears all AI-added styles", async() => {
            const provider = getProvider();

            // Add a style
            provider.setResponse("add red", {
                text: "",
                toolCalls: [{id: "1", name: "findAndStyleNodes", arguments: {
                    selector: "",
                    style: {color: "#ff0000"},
                    layerName: "ai-red-nodes",
                }}],
            });
            const addResult = await graph.aiCommand("make red");
            assert.strictEqual(addResult.success, true);

            // Clear all
            provider.setResponse("clear all", {
                text: "",
                toolCalls: [{id: "1", name: "clearStyles", arguments: {}}],
            });

            const result = await graph.aiCommand("clear all styling");

            assert.strictEqual(result.success, true);
        });
    });

    describe("setCameraPosition command", () => {
        it("applies topView preset", async() => {
            const provider = getProvider();

            provider.setResponse("top view", {
                text: "",
                toolCalls: [{id: "1", name: "setCameraPosition", arguments: {
                    preset: "topView",
                    animate: false,
                }}],
            });

            const result = await graph.aiCommand("show from top");

            assert.strictEqual(result.success, true);
        });

        it("applies sideView preset", async() => {
            const provider = getProvider();

            provider.setResponse("side view", {
                text: "",
                toolCalls: [{id: "1", name: "setCameraPosition", arguments: {
                    preset: "sideView",
                    animate: false,
                }}],
            });

            const result = await graph.aiCommand("view from side");

            assert.strictEqual(result.success, true);
        });

        it("applies frontView preset", async() => {
            const provider = getProvider();

            provider.setResponse("front view", {
                text: "",
                toolCalls: [{id: "1", name: "setCameraPosition", arguments: {
                    preset: "frontView",
                    animate: false,
                }}],
            });

            const result = await graph.aiCommand("view from front");

            assert.strictEqual(result.success, true);
        });

        it("applies isometric preset", async() => {
            const provider = getProvider();

            provider.setResponse("isometric", {
                text: "",
                toolCalls: [{id: "1", name: "setCameraPosition", arguments: {
                    preset: "isometric",
                    animate: false,
                }}],
            });

            const result = await graph.aiCommand("isometric view");

            assert.strictEqual(result.success, true);
        });

        it("applies fitToGraph preset", async() => {
            const provider = getProvider();

            provider.setResponse("fit", {
                text: "",
                toolCalls: [{id: "1", name: "setCameraPosition", arguments: {
                    preset: "fitToGraph",
                    animate: false,
                }}],
            });

            const result = await graph.aiCommand("fit all in view");

            assert.strictEqual(result.success, true);
        });

        it("sets camera to custom position", async() => {
            const provider = getProvider();

            provider.setResponse("custom pos", {
                text: "",
                toolCalls: [{id: "1", name: "setCameraPosition", arguments: {
                    position: {x: 10, y: 20, z: 30},
                    target: {x: 0, y: 0, z: 0},
                    animate: false,
                }}],
            });

            const result = await graph.aiCommand("move camera to 10,20,30");

            assert.strictEqual(result.success, true);
        });

        it("handles animation option", async() => {
            const provider = getProvider();

            provider.setResponse("animated", {
                text: "",
                toolCalls: [{id: "1", name: "setCameraPosition", arguments: {
                    preset: "topView",
                    animate: true,
                }}],
            });

            const result = await graph.aiCommand("smoothly show from top");

            assert.strictEqual(result.success, true);
        });

        it("handles invalid preset gracefully", async() => {
            const provider = getProvider();

            provider.setResponse("bad preset", {
                text: "",
                toolCalls: [{id: "1", name: "setCameraPosition", arguments: {
                    preset: "invalidPreset123",
                }}],
            });

            const result = await graph.aiCommand("bad camera preset");

            // Command execution happens - result depends on how Graph handles unknown preset
            // The key is that this doesn't crash
            assert.ok(typeof result.message === "string");
        });

        it("handles missing parameters gracefully", async() => {
            const provider = getProvider();

            provider.setResponse("no params", {
                text: "",
                toolCalls: [{id: "1", name: "setCameraPosition", arguments: {}}],
            });

            const result = await graph.aiCommand("move camera");

            // Command executes without crashing - behavior depends on validation
            assert.ok(typeof result.message === "string");
        });
    });

    describe("zoomToNodes command", () => {
        it("zooms to fit all nodes", async() => {
            const provider = getProvider();

            provider.setResponse("zoom all", {
                text: "",
                toolCalls: [{id: "1", name: "zoomToNodes", arguments: {
                    selector: "",
                    animate: false,
                }}],
            });

            const result = await graph.aiCommand("zoom to fit all");

            assert.strictEqual(result.success, true);
        });

        it("zooms to nodes matching selector", async() => {
            const provider = getProvider();

            // Note: E2E data has type at top level, so selector is "type == 'server'"
            // But the command expects "data.type" - this tests how the system handles selectors
            provider.setResponse("zoom servers", {
                text: "",
                toolCalls: [{id: "1", name: "zoomToNodes", arguments: {
                    selector: "type == 'server'",
                    animate: false,
                }}],
            });

            const result = await graph.aiCommand("zoom to servers");

            // Command should succeed - selector matching may vary
            assert.strictEqual(result.success, true);
        });

        it("handles animation option", async() => {
            const provider = getProvider();

            provider.setResponse("smooth zoom", {
                text: "",
                toolCalls: [{id: "1", name: "zoomToNodes", arguments: {
                    selector: "",
                    animate: true,
                }}],
            });

            const result = await graph.aiCommand("smoothly zoom to fit");

            assert.strictEqual(result.success, true);
        });

        it("handles non-matching selector gracefully", async() => {
            const provider = getProvider();

            provider.setResponse("zoom none", {
                text: "",
                toolCalls: [{id: "1", name: "zoomToNodes", arguments: {
                    selector: "type == 'nonexistent'",
                }}],
            });

            const result = await graph.aiCommand("zoom to nonexistent");

            // Should succeed even with no matching nodes (zooms to fitToGraph)
            assert.strictEqual(result.success, true);
        });
    });

    describe("style and camera commands in sequence", () => {
        it("styles nodes then changes camera view", async() => {
            const provider = getProvider();

            // Style nodes
            provider.setResponse("style", {
                text: "",
                toolCalls: [{id: "1", name: "findAndStyleNodes", arguments: {
                    selector: "",
                    style: {color: "#ff0000"},
                    layerName: "red-nodes",
                }}],
            });
            const styleResult = await graph.aiCommand("make red");
            assert.strictEqual(styleResult.success, true);

            // Change camera
            provider.setResponse("camera", {
                text: "",
                toolCalls: [{id: "1", name: "setCameraPosition", arguments: {
                    preset: "topView",
                    animate: false,
                }}],
            });
            const cameraResult = await graph.aiCommand("top view");
            assert.strictEqual(cameraResult.success, true);

            // Both commands should succeed - style persistence depends on implementation
        });

        it("zooms to styled nodes", async() => {
            const provider = getProvider();

            // Style nodes (using empty selector for all nodes)
            provider.setResponse("style servers", {
                text: "",
                toolCalls: [{id: "1", name: "findAndStyleNodes", arguments: {
                    selector: "",
                    style: {color: "#0000ff"},
                    layerName: "server-style",
                }}],
            });
            await graph.aiCommand("highlight servers");

            // Zoom to all nodes
            provider.setResponse("zoom servers", {
                text: "",
                toolCalls: [{id: "1", name: "zoomToNodes", arguments: {
                    selector: "",
                    animate: false,
                }}],
            });
            const result = await graph.aiCommand("zoom to servers");

            assert.strictEqual(result.success, true);
        });

        it("clears styles then reapplies new ones", async() => {
            const provider = getProvider();

            // Add red style
            provider.setResponse("red", {
                text: "",
                toolCalls: [{id: "1", name: "findAndStyleNodes", arguments: {
                    selector: "",
                    style: {color: "#ff0000"},
                    layerName: "ai-color",
                }}],
            });
            const redResult = await graph.aiCommand("red");
            assert.strictEqual(redResult.success, true);

            // Clear all
            provider.setResponse("clear", {
                text: "",
                toolCalls: [{id: "1", name: "clearStyles", arguments: {}}],
            });
            const clearResult = await graph.aiCommand("clear");
            assert.strictEqual(clearResult.success, true);

            // Add blue style
            provider.setResponse("blue", {
                text: "",
                toolCalls: [{id: "1", name: "findAndStyleNodes", arguments: {
                    selector: "",
                    style: {color: "#0000ff"},
                    layerName: "ai-blue",
                }}],
            });
            const result = await graph.aiCommand("blue");

            assert.strictEqual(result.success, true);
        });
    });
});
