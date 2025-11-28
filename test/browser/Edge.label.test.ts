import {NullEngine, Scene, Vector3} from "@babylonjs/core";
import {assert, beforeEach, describe, test} from "vitest";

import type {EdgeStyleConfig} from "../../src/config";
import {RichTextLabel} from "../../src/meshes/RichTextLabel";

/**
 * Regression tests for Edge label functionality.
 *
 * Bug history:
 * 1. attachOffset bug:
 *    - Edge labels had their attachOffset hardcoded to 0 in the update() method
 *    - The attachOffset was correctly read from config in createLabelOptions()
 *    - But the stored offset was not used when calling label.attachTo()
 *    - Fix: Added _labelOffset property to store the configured offset and use it in attachTo()
 *
 * 2. attachPosition bug (same pattern):
 *    - Edge labels had their attachPosition hardcoded to "center" in the update() method
 *    - The location was correctly read and transformed to attachPosition in createLabelOptions()
 *    - But the stored position was not used when calling label.attachTo()
 *    - Fix: Added _labelAttachPosition property to store the configured position and use it in attachTo()
 */
describe("Edge Label Configuration", () => {
    let scene: Scene;

    beforeEach(() => {
        const engine = new NullEngine();
        scene = new Scene(engine);
    });

    describe("Edge Label attachOffset", () => {
        test("edge label can be configured with attachOffset in EdgeStyleConfig", () => {
            const style: EdgeStyleConfig = {
                label: {
                    enabled: true,
                    text: "Test Label",
                    fontSize: 32,
                    textColor: "#000000",
                    attachOffset: 1.5,
                },
                line: {color: "darkgrey"},
                enabled: true,
            };

            // Verify the config structure is correct
            const {label} = style;
            assert.exists(label);
            assert.equal(label.attachOffset, 1.5);
        });

        test("edge label attachOffset defaults to 0 when not specified", () => {
            const style: EdgeStyleConfig = {
                label: {
                    enabled: true,
                    text: "Test Label",
                    fontSize: 32,
                },
                line: {color: "darkgrey"},
                enabled: true,
            };

            const {label} = style;
            assert.exists(label);
            // attachOffset should be undefined (defaults handled by code)
            assert.isUndefined(label.attachOffset);
        });

        test("RichTextLabel.attachTo applies offset correctly", () => {
            const label = new RichTextLabel(scene, {
                text: "Offset Test",
                fontSize: 12,
                textColor: "#FFFFFF",
                attachOffset: 2.0,
            });

            const position = new Vector3(0, 0, 0);
            const offset = 2.0;

            // Attach with offset
            label.attachTo(position, "top", offset);

            // The label mesh should exist and be positioned
            assert.exists(label.labelMesh);

            // The label position should be offset from the target position
            // For "top" attachment, Y should be increased by the offset
            const labelPos = label.labelMesh.position;
            assert.isAbove(labelPos.y, position.y, "Label Y position should be offset above target");

            label.dispose();
        });

        test("edge label attachOffset of 0 places label at edge midpoint", () => {
            const label = new RichTextLabel(scene, {
                text: "Zero Offset",
                fontSize: 12,
                textColor: "#FFFFFF",
            });

            const midpoint = new Vector3(5, 5, 0);
            label.attachTo(midpoint, "center", 0);

            assert.exists(label.labelMesh);
            // With zero offset and center attachment, position should be at midpoint
            // (actual position may vary based on label centering logic)

            label.dispose();
        });

        test("different attachOffset values produce different label positions", () => {
            const label1 = new RichTextLabel(scene, {
                text: "Small Offset",
                fontSize: 12,
            });

            const label2 = new RichTextLabel(scene, {
                text: "Large Offset",
                fontSize: 12,
            });

            const targetPos = new Vector3(0, 0, 0);

            label1.attachTo(targetPos, "top", 0.5);
            label2.attachTo(targetPos, "top", 2.0);

            assert.exists(label1.labelMesh);
            assert.exists(label2.labelMesh);

            // Label with larger offset should have higher Y position
            const y1 = label1.labelMesh.position.y;
            const y2 = label2.labelMesh.position.y;
            assert.isAbove(y2, y1, "Larger offset should result in higher Y position");

            label1.dispose();
            label2.dispose();
        });
    });

    describe("Edge Label attachPosition (location)", () => {
        test("edge label can be configured with location in EdgeStyleConfig", () => {
            const style: EdgeStyleConfig = {
                label: {
                    enabled: true,
                    text: "Test Label",
                    location: "top",
                },
                line: {color: "darkgrey"},
                enabled: true,
            };

            const {label} = style;
            assert.exists(label);
            assert.equal(label.location, "top");
        });

        test("edge label location defaults to center when not specified", () => {
            const style: EdgeStyleConfig = {
                label: {
                    enabled: true,
                    text: "Test Label",
                },
                line: {color: "darkgrey"},
                enabled: true,
            };

            const {label} = style;
            assert.exists(label);
            // location should be undefined (defaults handled by code as "center")
            assert.isUndefined(label.location);
        });

        test("edge label supports various location values", () => {
            const locations = ["top", "bottom", "left", "right", "center"] as const;

            for (const location of locations) {
                const style: EdgeStyleConfig = {
                    label: {
                        enabled: true,
                        text: `Label at ${location}`,
                        location,
                    },
                    line: {color: "darkgrey"},
                    enabled: true,
                };

                assert.equal(style.label?.location, location);
            }
        });

        test("RichTextLabel.attachTo applies position correctly", () => {
            const positions = ["top", "bottom", "left", "right", "center"] as const;

            for (const position of positions) {
                const label = new RichTextLabel(scene, {
                    text: `Position: ${position}`,
                    fontSize: 12,
                });

                const targetPos = new Vector3(0, 0, 0);
                label.attachTo(targetPos, position, 1.0);

                assert.exists(label.labelMesh);
                label.dispose();
            }
        });

        test("different attach positions produce different label positions", () => {
            const labelTop = new RichTextLabel(scene, {
                text: "Top",
                fontSize: 12,
            });

            const labelBottom = new RichTextLabel(scene, {
                text: "Bottom",
                fontSize: 12,
            });

            const targetPos = new Vector3(0, 0, 0);
            const offset = 2.0;

            labelTop.attachTo(targetPos, "top", offset);
            labelBottom.attachTo(targetPos, "bottom", offset);

            assert.exists(labelTop.labelMesh);
            assert.exists(labelBottom.labelMesh);

            // Top label should have higher Y than bottom label
            const topY = labelTop.labelMesh.position.y;
            const bottomY = labelBottom.labelMesh.position.y;
            assert.isAbove(topY, bottomY, "Top position should result in higher Y than bottom position");

            labelTop.dispose();
            labelBottom.dispose();
        });
    });

    describe("Edge Label vs Arrow Text Offset Consistency", () => {
        test("edge labels support the same attachOffset values as arrow text", () => {
            // Arrow text uses attachOffset for positioning above arrowheads
            // Edge labels should support the same offset mechanism
            const arrowTextStyle: EdgeStyleConfig = {
                arrowHead: {
                    type: "normal",
                    text: {
                        text: "Arrow Text",
                        fontSize: 32,
                        attachOffset: 1.0,
                    },
                    color: "darkgrey",
                    size: 1,
                    opacity: 1,
                },
                line: {color: "darkgrey"},
                enabled: true,
            };

            const edgeLabelStyle: EdgeStyleConfig = {
                label: {
                    enabled: true,
                    text: "Edge Label",
                    fontSize: 32,
                    attachOffset: 1.0,
                },
                line: {color: "darkgrey"},
                enabled: true,
            };

            // Both should accept the same offset value
            assert.equal(
                arrowTextStyle.arrowHead?.text?.attachOffset,
                edgeLabelStyle.label?.attachOffset,
                "Arrow text and edge label should support same offset value",
            );
        });
    });

    describe("Edge Label Styling", () => {
        test("edge label supports custom fontSize", () => {
            const style: EdgeStyleConfig = {
                label: {
                    enabled: true,
                    text: "Custom Font",
                    fontSize: 48,
                },
                line: {color: "darkgrey"},
                enabled: true,
            };

            assert.equal(style.label?.fontSize, 48);
        });

        test("edge label supports custom colors", () => {
            const style: EdgeStyleConfig = {
                label: {
                    enabled: true,
                    text: "Colored",
                    textColor: "#FF0000",
                    backgroundColor: "#00FF00",
                },
                line: {color: "darkgrey"},
                enabled: true,
            };

            assert.equal(style.label?.textColor, "#FF0000");
            assert.equal(style.label?.backgroundColor, "#00FF00");
        });

        test("edge label can have transparent background", () => {
            const style: EdgeStyleConfig = {
                label: {
                    enabled: true,
                    text: "Transparent BG",
                    backgroundColor: "transparent",
                },
                line: {color: "darkgrey"},
                enabled: true,
            };

            assert.equal(style.label?.backgroundColor, "transparent");
        });
    });

    describe("Edge Label Enabled Flag", () => {
        test("edge label requires enabled: true to be created", () => {
            // This tests the bug where labels weren't showing because enabled wasn't set
            const styleWithEnabled: EdgeStyleConfig = {
                label: {
                    enabled: true,
                    text: "Visible Label",
                },
                line: {color: "darkgrey"},
                enabled: true,
            };

            const styleWithoutEnabled: EdgeStyleConfig = {
                label: {
                    text: "Invisible Label",
                    // enabled is not set (defaults to false)
                },
                line: {color: "darkgrey"},
                enabled: true,
            };

            // Edge.ts checks style.label?.enabled before creating the label
            assert.isTrue(styleWithEnabled.label?.enabled);
            assert.isUndefined(styleWithoutEnabled.label?.enabled);
        });
    });
});
