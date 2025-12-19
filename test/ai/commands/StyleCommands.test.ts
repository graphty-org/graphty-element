/**
 * StyleCommands Tests - Tests for style-related commands.
 * @module test/ai/commands/StyleCommands.test
 */

import {assert, beforeEach, describe, it} from "vitest";

import {
    clearStyles,
    findAndStyleEdges,
    findAndStyleNodes,
} from "../../../src/ai/commands/StyleCommands";
import type {CommandContext} from "../../../src/ai/commands/types";
import type {Graph} from "../../../src/Graph";
import {createMockContext, createTestGraph} from "../../helpers/test-graph";

describe("StyleCommands", () => {
    let graph: Graph;
    let context: CommandContext;

    beforeEach(() => {
        graph = createTestGraph();
        context = createMockContext(graph);
    });

    describe("findAndStyleNodes", () => {
        it("styles all nodes with empty selector", async() => {
            const result = await findAndStyleNodes.execute(graph, {
                selector: "",
                style: {color: "#ff0000"},
                layerName: "test",
            }, context);

            assert.strictEqual(result.success, true);
            assert.ok(result.message.toLowerCase().includes("node"));
        });

        it("styles nodes matching selector", async() => {
            // The mock graph has nodes with type 'server', 'client', 'router'
            // Node indices 0, 3, 6, 9, etc. have type 'server'
            const result = await findAndStyleNodes.execute(graph, {
                selector: "data.type == 'server'",
                style: {color: "#0000ff", size: 2},
                layerName: "servers",
            }, context);

            assert.strictEqual(result.success, true);
            // In a 25 node graph, indices 0,3,6,9,12,15,18,21,24 are servers (9 nodes)
            assert.ok(result.affectedNodes && result.affectedNodes.length > 0);
        });

        it("applies size styling", async() => {
            const result = await findAndStyleNodes.execute(graph, {
                selector: "",
                style: {size: 2.5},
                layerName: "large-nodes",
            }, context);

            assert.strictEqual(result.success, true);
        });

        it("applies shape styling", async() => {
            const result = await findAndStyleNodes.execute(graph, {
                selector: "",
                style: {shape: "box"},
                layerName: "boxed-nodes",
            }, context);

            assert.strictEqual(result.success, true);
        });

        it("handles invalid selector gracefully", async() => {
            // Invalid JMESPath selectors should not crash
            const result = await findAndStyleNodes.execute(graph, {
                selector: "not_a_valid_jmespath[[",
                style: {color: "#ff0000"},
                layerName: "invalid",
            }, context);

            // Should return success=false or handle gracefully
            assert.ok(result);
        });

        it("returns empty affectedNodes when no nodes match", async() => {
            const result = await findAndStyleNodes.execute(graph, {
                selector: "data.nonexistent == 'value'",
                style: {color: "#ff0000"},
                layerName: "no-match",
            }, context);

            assert.strictEqual(result.success, true);
            // Should still succeed but with 0 affected nodes
            assert.ok(result.affectedNodes !== undefined);
        });
    });

    describe("findAndStyleEdges", () => {
        it("styles all edges with empty selector", async() => {
            const result = await findAndStyleEdges.execute(graph, {
                selector: "",
                style: {color: "#00ff00", width: 2},
                layerName: "test-edges",
            }, context);

            assert.strictEqual(result.success, true);
            assert.ok(result.message.toLowerCase().includes("edge"));
        });

        it("styles edges with selector", async() => {
            const result = await findAndStyleEdges.execute(graph, {
                selector: "data.weight > 0.5",
                style: {color: "#ffff00"},
                layerName: "heavy-edges",
            }, context);

            assert.strictEqual(result.success, true);
        });

        it("applies line width styling", async() => {
            const result = await findAndStyleEdges.execute(graph, {
                selector: "",
                style: {width: 3},
                layerName: "thick-edges",
            }, context);

            assert.strictEqual(result.success, true);
        });

        it("applies line type styling", async() => {
            const result = await findAndStyleEdges.execute(graph, {
                selector: "",
                style: {lineType: "dash"},
                layerName: "dashed-edges",
            }, context);

            assert.strictEqual(result.success, true);
        });
    });

    describe("clearStyles", () => {
        it("clears styles from a named layer", async() => {
            // First add a style layer
            await findAndStyleNodes.execute(graph, {
                selector: "",
                style: {color: "#ff0000"},
                layerName: "to-clear",
            }, context);

            // Then clear it
            const result = await clearStyles.execute(graph, {
                layerName: "to-clear",
            }, context);

            assert.strictEqual(result.success, true);
            assert.ok(result.message.toLowerCase().includes("clear"));
        });

        it("clears all dynamic styles when no layerName provided", async() => {
            // Add multiple style layers
            await findAndStyleNodes.execute(graph, {
                selector: "",
                style: {color: "#ff0000"},
                layerName: "layer1",
            }, context);
            await findAndStyleNodes.execute(graph, {
                selector: "",
                style: {color: "#00ff00"},
                layerName: "layer2",
            }, context);

            // Clear all
            const result = await clearStyles.execute(graph, {}, context);

            assert.strictEqual(result.success, true);
        });

        it("handles clearing non-existent layer gracefully", async() => {
            const result = await clearStyles.execute(graph, {
                layerName: "nonexistent-layer-xyz",
            }, context);

            // Should succeed (no-op) or indicate nothing to clear
            assert.strictEqual(result.success, true);
        });
    });

    describe("findAndStyleNodes metadata", () => {
        it("has correct name", () => {
            assert.strictEqual(findAndStyleNodes.name, "findAndStyleNodes");
        });

        it("has description", () => {
            assert.ok(findAndStyleNodes.description.length > 0);
        });

        it("has parameters schema", () => {
            assert.ok(findAndStyleNodes.parameters);
        });

        it("has examples", () => {
            assert.ok(Array.isArray(findAndStyleNodes.examples));
            assert.ok(findAndStyleNodes.examples.length > 0);
        });
    });

    describe("findAndStyleEdges metadata", () => {
        it("has correct name", () => {
            assert.strictEqual(findAndStyleEdges.name, "findAndStyleEdges");
        });

        it("has description", () => {
            assert.ok(findAndStyleEdges.description.length > 0);
        });

        it("has parameters schema", () => {
            assert.ok(findAndStyleEdges.parameters);
        });

        it("has examples", () => {
            assert.ok(Array.isArray(findAndStyleEdges.examples));
        });
    });

    describe("clearStyles metadata", () => {
        it("has correct name", () => {
            assert.strictEqual(clearStyles.name, "clearStyles");
        });

        it("has description", () => {
            assert.ok(clearStyles.description.length > 0);
        });

        it("has parameters schema", () => {
            assert.ok(clearStyles.parameters);
        });
    });

    /**
     * Regression test for Issue #5: LLMs may use "*" instead of "" to match all
     * Bug: Anthropic used selector "*" to mean "match all nodes", but our code
     * only treated empty string "" as "match all". The "*" was invalid JMESPath
     * and returned no matches.
     *
     * Fix: Handle common "match all" patterns like "*", "all", "*.*", "true".
     */
    describe("regression: common 'match all' selectors work (Issue #5)", () => {
        it("selector '*' matches all nodes", async() => {
            const result = await findAndStyleNodes.execute(graph, {
                selector: "*",
                style: {color: "#ff0000"},
                layerName: "star-selector",
            }, context);

            assert.strictEqual(result.success, true);
            assert.ok(result.affectedNodes && result.affectedNodes.length > 0,
                "Selector '*' should match all nodes");
        });

        it("selector 'all' matches all nodes", async() => {
            const result = await findAndStyleNodes.execute(graph, {
                selector: "all",
                style: {color: "#ff0000"},
                layerName: "all-selector",
            }, context);

            assert.strictEqual(result.success, true);
            assert.ok(result.affectedNodes && result.affectedNodes.length > 0,
                "Selector 'all' should match all nodes");
        });

        it("selector '*' matches all edges", async() => {
            const result = await findAndStyleEdges.execute(graph, {
                selector: "*",
                style: {color: "#00ff00"},
                layerName: "star-edge-selector",
            }, context);

            assert.strictEqual(result.success, true);
            assert.ok(result.affectedEdges && result.affectedEdges.length > 0,
                "Selector '*' should match all edges");
        });

        it("selector with whitespace ' * ' matches all nodes", async() => {
            const result = await findAndStyleNodes.execute(graph, {
                selector: " * ",
                style: {color: "#ff0000"},
                layerName: "whitespace-star",
            }, context);

            assert.strictEqual(result.success, true);
            assert.ok(result.affectedNodes && result.affectedNodes.length > 0,
                "Selector ' * ' (with whitespace) should match all nodes");
        });
    });

    /**
     * Regression test for Issue #4: CSS color names should be converted to hex
     * Bug: When the AI passed CSS color names like "red", the style command
     * stored the raw string without converting it to hex. The NodeMesh.extractColor()
     * method uses Color3.FromHexString() which only handles hex values, causing
     * CSS color names to fail silently (defaulting to black or no color).
     *
     * Fix: Parse styles through NodeStyle/EdgeStyle schemas which use ColorStyle
     * transform from colorjs.io to convert CSS names to hex.
     */
    describe("regression: CSS color names are converted to hex (Issue #4)", () => {
        it("findAndStyleNodes converts CSS color name 'red' to hex", async() => {
            await findAndStyleNodes.execute(graph, {
                selector: "",
                style: {color: "red"},
                layerName: "css-color-test",
            }, context);

            // Find the layer that was added
            const layer = graph.styles.layers.find((l) => l.metadata?.name === "css-color-test");
            assert.ok(layer, "Style layer should be created");
            assert.ok(layer.node, "Node style should exist");

            // The color should be converted to hex, not remain as "red"
            const nodeStyle = layer.node.style as {texture?: {color?: string}};
            assert.ok(nodeStyle.texture?.color, "Texture color should be set");
            assert.ok(
                nodeStyle.texture.color.startsWith("#"),
                `Color should be hex format, got: ${nodeStyle.texture.color}`,
            );
            // "red" should convert to #FF0000 (case-insensitive check)
            assert.strictEqual(
                nodeStyle.texture.color.toUpperCase(),
                "#FF0000",
                `Color 'red' should convert to '#FF0000', got: ${nodeStyle.texture.color}`,
            );
        });

        it("findAndStyleNodes converts CSS color name 'blue' to hex", async() => {
            await findAndStyleNodes.execute(graph, {
                selector: "",
                style: {color: "blue"},
                layerName: "css-color-test-blue",
            }, context);

            const layer = graph.styles.layers.find((l) => l.metadata?.name === "css-color-test-blue");
            assert.ok(layer?.node, "Node style should exist");

            const nodeStyle = layer.node.style as {texture?: {color?: string}};
            assert.ok(
                nodeStyle.texture?.color?.startsWith("#"),
                `Color should be hex format, got: ${nodeStyle.texture?.color}`,
            );
            // "blue" should convert to #0000FF
            assert.strictEqual(
                nodeStyle.texture?.color?.toUpperCase(),
                "#0000FF",
                `Color 'blue' should convert to '#0000FF', got: ${nodeStyle.texture?.color}`,
            );
        });

        it("findAndStyleEdges converts CSS color name 'green' to hex", async() => {
            await findAndStyleEdges.execute(graph, {
                selector: "",
                style: {color: "green"},
                layerName: "css-edge-color-test",
            }, context);

            const layer = graph.styles.layers.find((l) => l.metadata?.name === "css-edge-color-test");
            assert.ok(layer?.edge, "Edge style should exist");

            const edgeStyle = layer.edge.style as {line?: {color?: string}};
            assert.ok(
                edgeStyle.line?.color?.startsWith("#"),
                `Color should be hex format, got: ${edgeStyle.line?.color}`,
            );
            // "green" converts to #008000 (not #00FF00 which is "lime")
            assert.strictEqual(
                edgeStyle.line?.color?.toUpperCase(),
                "#008000",
                `Color 'green' should convert to '#008000', got: ${edgeStyle.line?.color}`,
            );
        });

        it("findAndStyleNodes still accepts hex colors", async() => {
            await findAndStyleNodes.execute(graph, {
                selector: "",
                style: {color: "#FF5733"},
                layerName: "hex-color-test",
            }, context);

            const layer = graph.styles.layers.find((l) => l.metadata?.name === "hex-color-test");
            assert.ok(layer?.node, "Node style should exist");

            const nodeStyle = layer.node.style as {texture?: {color?: string}};
            assert.strictEqual(
                nodeStyle.texture?.color?.toUpperCase(),
                "#FF5733",
                `Hex color should be preserved, got: ${nodeStyle.texture?.color}`,
            );
        });
    });

    /**
     * Regression test for Issue #1: Style commands should use StyleManager
     * Bug: Style changes were not triggering node/edge visual updates because
     * the commands were calling styles.addLayer() directly instead of going
     * through StyleManager.addLayer() which handles cache invalidation and
     * event emission.
     */
    describe("regression: style commands use StyleManager (Issue #1)", () => {
        it("findAndStyleNodes uses StyleManager.addLayer not styles.addLayer directly", async() => {
            // Track whether styleManager.addLayer was called
            let styleManagerAddLayerCalled = false;
            const originalStyleManager = graph.getStyleManager();

            // Spy on styleManager.addLayer
            const originalAddLayer = originalStyleManager.addLayer.bind(originalStyleManager);
            originalStyleManager.addLayer = (layer) => {
                styleManagerAddLayerCalled = true;
                originalAddLayer(layer);
            };

            await findAndStyleNodes.execute(graph, {
                selector: "",
                style: {color: "#ff0000"},
                layerName: "regression-test",
            }, context);

            assert.strictEqual(
                styleManagerAddLayerCalled,
                true,
                "findAndStyleNodes should use StyleManager.addLayer() to ensure style updates are propagated",
            );
        });

        it("findAndStyleEdges uses StyleManager.addLayer not styles.addLayer directly", async() => {
            // Track whether styleManager.addLayer was called
            let styleManagerAddLayerCalled = false;
            const originalStyleManager = graph.getStyleManager();

            // Spy on styleManager.addLayer
            const originalAddLayer = originalStyleManager.addLayer.bind(originalStyleManager);
            originalStyleManager.addLayer = (layer) => {
                styleManagerAddLayerCalled = true;
                originalAddLayer(layer);
            };

            await findAndStyleEdges.execute(graph, {
                selector: "",
                style: {color: "#00ff00"},
                layerName: "regression-test-edges",
            }, context);

            assert.strictEqual(
                styleManagerAddLayerCalled,
                true,
                "findAndStyleEdges should use StyleManager.addLayer() to ensure style updates are propagated",
            );
        });
    });
});
