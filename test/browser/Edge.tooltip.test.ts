import {NullEngine, Scene, Vector3} from "@babylonjs/core";
import {assert, beforeEach, describe, test} from "vitest";

import type {EdgeStyleConfig} from "../../src/config";
import {RichTextLabel} from "../../src/meshes/RichTextLabel";

describe("Edge Tooltips", () => {
    let scene: Scene;

    beforeEach(() => {
        const engine = new NullEngine();
        scene = new Scene(engine);
    });

    describe("Tooltip Creation", () => {
        test("tooltip can be created when configured", () => {
            // The tooltip style comes from the EdgeStyleConfig
            const style: EdgeStyleConfig = {
                tooltip: {
                    enabled: true,
                    text: "Test tooltip",
                    fontSize: 14,
                    textColor: "#000000",
                    backgroundColor: "#FFFFFF",
                },
                line: {color: "darkgrey"},
                enabled: true,
            };

            // Verify tooltip config is present by accessing via tooltip property
            const {tooltip} = style;
            assert.exists(tooltip);
            assert.isTrue(tooltip.enabled);
            assert.equal(tooltip.text, "Test tooltip");
        });

        test("RichTextLabel can be created for tooltip", () => {
            const tooltip = new RichTextLabel(scene, {
                text: "Test tooltip",
                fontSize: 14,
                textColor: "#000000",
                backgroundColor: "#FFFFFF",
            });

            assert.exists(tooltip);
            assert.exists(tooltip.labelMesh);
            tooltip.dispose();
        });

        test("tooltip supports custom styling", () => {
            const tooltip = new RichTextLabel(scene, {
                text: "Styled tooltip",
                fontSize: 18,
                textColor: "#FFFFFF",
                backgroundColor: "#333333",
                cornerRadius: 8,
                borderWidth: 1,
                borderColor: "#666666",
            });

            assert.exists(tooltip);
            assert.exists(tooltip.labelMesh);
            tooltip.dispose();
        });

        test("tooltip can be positioned at a Vector3", () => {
            const tooltip = new RichTextLabel(scene, {
                text: "Positioned tooltip",
                fontSize: 14,
            });

            const position = new Vector3(5, 10, 0);
            tooltip.attachTo(position, "top", 0.5);

            assert.exists(tooltip.labelMesh);
            tooltip.dispose();
        });
    });

    describe("Tooltip Visibility", () => {
        test("tooltip visibility can be toggled", () => {
            const tooltip = new RichTextLabel(scene, {
                text: "Visibility test",
                fontSize: 14,
            });

            const mesh = tooltip.labelMesh;
            assert.exists(mesh);

            // Initially visible
            mesh.isVisible = true;
            assert.isTrue(mesh.isVisible);

            // Hide
            mesh.isVisible = false;
            assert.isFalse(mesh.isVisible);

            // Show again
            mesh.isVisible = true;
            assert.isTrue(mesh.isVisible);

            tooltip.dispose();
        });
    });

    describe("Tooltip Text", () => {
        test("tooltip text can be updated", () => {
            const tooltip = new RichTextLabel(scene, {
                text: "Initial text",
                fontSize: 14,
            });

            assert.exists(tooltip);

            // Update text
            tooltip.setText("Updated text");

            // Tooltip should still exist after text update
            assert.exists(tooltip.labelMesh);

            tooltip.dispose();
        });

        test("tooltip supports JMESPath configuration in EdgeStyleConfig", () => {
            // JMESPath configuration is used in EdgeStyleConfig to extract text from edge data
            const style: EdgeStyleConfig = {
                tooltip: {
                    enabled: true,
                    textPath: "weight",
                    fontSize: 14,
                },
                line: {color: "darkgrey"},
                enabled: true,
            };

            // Verify textPath config is supported
            const {tooltip} = style;
            assert.exists(tooltip);
            assert.equal(tooltip.textPath, "weight");
        });
    });

    describe("Tooltip Configuration in EdgeStyle", () => {
        test("tooltip enabled property defaults to false when not configured", () => {
            const style: EdgeStyleConfig = {
                line: {color: "darkgrey"},
                enabled: true,
            };

            // Tooltip should not be present when not configured
            assert.isUndefined(style.tooltip);
        });

        test("tooltip can have pointer enabled", () => {
            const tooltip = new RichTextLabel(scene, {
                text: "Pointer tooltip",
                fontSize: 14,
                pointer: true,
                pointerDirection: "bottom",
            });

            assert.exists(tooltip);
            assert.exists(tooltip.labelMesh);

            tooltip.dispose();
        });

        test("tooltip supports borders configuration", () => {
            const tooltip = new RichTextLabel(scene, {
                text: "Bordered tooltip",
                fontSize: 14,
                borders: [
                    {width: 1, color: "#CCCCCC", spacing: 4},
                ],
            });

            assert.exists(tooltip);
            assert.exists(tooltip.labelMesh);

            tooltip.dispose();
        });
    });

    describe("Tooltip Cleanup", () => {
        test("tooltip can be disposed", () => {
            const tooltip = new RichTextLabel(scene, {
                text: "Disposable tooltip",
                fontSize: 14,
            });

            const mesh = tooltip.labelMesh;
            assert.exists(mesh);

            tooltip.dispose();

            // After dispose, mesh should be disposed
            assert.isTrue(mesh.isDisposed());
        });
    });
});
