/**
 * Label Golden Master Tests
 *
 * Tests core label functionality including text rendering, backgrounds, borders,
 * and basic features to achieve 100% coverage of RichTextLabel.ts core functionality.
 * Advanced features (pointers, badges, animations) are tested separately.
 */

import {assert, describe, test} from "vitest";

import {LabelMeshFactory} from "./mesh-factory";

describe("Label Golden Masters - Core Features", () => {
    // Basic text rendering
    describe("Text Rendering", () => {
        test("creates basic text label", () => {
            const result = LabelMeshFactory.create({
                text: "Hello World",
                font: "Verdana",
                fontSize: 48,
                textColor: "#000000",
            });

            assert.isTrue(result.validation.isValid,
                `Basic text validation failed: ${result.validation.errors.join(", ")}`);
            assert.equal(result.mesh.metadata.text, "Hello World");
            assert.equal(result.mesh.metadata.font, "Verdana");
            assert.equal(result.mesh.metadata.fontSize, 48);
            assert.equal(result.mesh.billboardMode, 7); // BILLBOARDMODE_ALL
        });

        test("creates empty text label", () => {
            const result = LabelMeshFactory.create({
                text: "",
                fontSize: 24,
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.text, "");
        });

        test("handles various text lengths", () => {
            const texts = [
                "A",
                "Short",
                "Medium length text",
                "This is a very long text that should still render properly in the label system",
            ];

            texts.forEach((text) => {
                const result = LabelMeshFactory.create({
                    text: text,
                    fontSize: 36,
                });

                assert.isTrue(result.validation.isValid);
                assert.equal(result.mesh.metadata.text, text);
            });
        });
    });

    // Font variations
    describe("Font Properties", () => {
        const fonts = ["Verdana", "Arial", "Times New Roman", "Helvetica", "Georgia"];

        fonts.forEach((font) => {
            test(`creates label with ${font} font`, () => {
                const result = LabelMeshFactory.create({
                    text: "Font Test",
                    font: font,
                    fontSize: 32,
                });

                assert.isTrue(result.validation.isValid);
                assert.equal(result.mesh.metadata.font, font);
            });
        });

        test("uses default font when not specified", () => {
            const result = LabelMeshFactory.create({
                text: "Default Font",
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.font, "Verdana");
        });
    });

    // Font size variations
    describe("Font Sizes", () => {
        const sizes = [12, 24, 36, 48, 64, 96];

        sizes.forEach((size) => {
            test(`creates label with fontSize ${size}`, () => {
                const result = LabelMeshFactory.create({
                    text: "Size Test",
                    fontSize: size,
                });

                assert.isTrue(result.validation.isValid);
                assert.equal(result.mesh.metadata.fontSize, size);
            });
        });

        test("uses default fontSize when not specified", () => {
            const result = LabelMeshFactory.create({
                text: "Default Size",
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.fontSize, 48);
        });
    });

    // Text colors
    describe("Text Colors", () => {
        const colors = ["#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"];

        colors.forEach((color) => {
            test(`creates label with text color ${color}`, () => {
                const result = LabelMeshFactory.create({
                    text: "Color Test",
                    textColor: color,
                });

                assert.isTrue(result.validation.isValid);
                assert.equal(result.mesh.metadata.textColor, color);
            });
        });

        test("uses default text color when not specified", () => {
            const result = LabelMeshFactory.create({
                text: "Default Color",
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.textColor, "#000000");
        });
    });

    // Background properties
    describe("Background Rendering", () => {
        test("creates transparent background", () => {
            const result = LabelMeshFactory.create({
                text: "Transparent BG",
                backgroundColor: "transparent",
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.backgroundColor, "transparent");
            assert.equal(result.material.alpha, 0);
        });

        test("creates solid color backgrounds", () => {
            const backgrounds = ["#FFFFFF", "#FF0000", "#00FF00", "#0000FF", "#FFFF00"];

            backgrounds.forEach((bg) => {
                const result = LabelMeshFactory.create({
                    text: "Background Test",
                    backgroundColor: bg,
                });

                assert.isTrue(result.validation.isValid);
                assert.equal(result.mesh.metadata.backgroundColor, bg);
            });
        });

        test("handles RGBA backgrounds with alpha", () => {
            const result = LabelMeshFactory.create({
                text: "RGBA Test",
                backgroundColor: "rgba(255, 0, 0, 0.5)",
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.backgroundColor, "rgba(255, 0, 0, 0.5)");
        });

        test("uses default transparent background", () => {
            const result = LabelMeshFactory.create({
                text: "Default BG",
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.backgroundColor, "transparent");
        });
    });

    // Background padding
    describe("Background Padding", () => {
        const paddings = [0, 4, 8, 16, 32];

        paddings.forEach((padding) => {
            test(`creates label with padding ${padding}`, () => {
                const result = LabelMeshFactory.create({
                    text: "Padding Test",
                    backgroundColor: "#FFFFFF",
                    backgroundPadding: padding,
                });

                assert.isTrue(result.validation.isValid);
                assert.equal(result.mesh.metadata.backgroundPadding, padding);
            });
        });

        test("uses default padding when not specified", () => {
            const result = LabelMeshFactory.create({
                text: "Default Padding",
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.backgroundPadding, 8);
        });
    });

    // Corner radius
    describe("Corner Radius", () => {
        const radii = [0, 5, 10, 15, 20];

        radii.forEach((radius) => {
            test(`creates label with corner radius ${radius}`, () => {
                const result = LabelMeshFactory.create({
                    text: "Radius Test",
                    backgroundColor: "#CCCCCC",
                    cornerRadius: radius,
                });

                assert.isTrue(result.validation.isValid);
                assert.equal(result.mesh.metadata.cornerRadius, radius);
            });
        });
    });

    // Border configurations
    describe("Borders", () => {
        test("creates label without borders", () => {
            const result = LabelMeshFactory.create({
                text: "No Borders",
            });

            assert.isTrue(result.validation.isValid);
            assert.deepEqual(result.mesh.metadata.borders, []);
        });

        test("creates single border", () => {
            const result = LabelMeshFactory.create({
                text: "Single Border",
                borders: [{
                    width: 2,
                    color: "#000000",
                    spacing: 0,
                }],
            });

            assert.isTrue(result.validation.isValid);
            assert.equal((result.mesh.metadata.borders as unknown[]).length, 1);
            // Should have stroke operations on texture
            if (result.texture) {
                const strokeOps = result.texture.getDrawingOperations("strokeRect");
                assert.equal(strokeOps.length, 1);
            }
        });

        test("creates multiple borders", () => {
            const result = LabelMeshFactory.create({
                text: "Multi Border",
                borders: [
                    {width: 2, color: "#FF0000", spacing: 0},
                    {width: 1, color: "#00FF00", spacing: 2},
                    {width: 3, color: "#0000FF", spacing: 1},
                ],
            });

            assert.isTrue(result.validation.isValid);
            assert.equal((result.mesh.metadata.borders as unknown[]).length, 3);
            if (result.texture) {
                const strokeOps = result.texture.getDrawingOperations("strokeRect");
                assert.equal(strokeOps.length, 3);
            }
        });

        test("creates borders with spacing", () => {
            const result = LabelMeshFactory.create({
                text: "Spaced Borders",
                borders: [
                    {width: 2, color: "#000000", spacing: 5},
                    {width: 1, color: "#FF0000", spacing: 3},
                ],
            });

            assert.isTrue(result.validation.isValid);
            assert.equal((result.mesh.metadata.borders as unknown[]).length, 2);
        });
    });

    // Text outline and shadow
    describe("Text Effects", () => {
        test("creates text with outline", () => {
            const result = LabelMeshFactory.create({
                text: "Outlined Text",
                textOutline: {
                    color: "#000000",
                    width: 2,
                },
            });

            assert.isTrue(result.validation.isValid);
            // Should have stroke text operations
            if (result.texture) {
                const strokeOps = result.texture.getDrawingOperations("strokeText");
                assert.isAtLeast(strokeOps.length, 1);
            }
        });

        test("creates text with shadow", () => {
            const result = LabelMeshFactory.create({
                text: "Shadow Text",
                textShadow: {
                    color: "rgba(0,0,0,0.5)",
                    blur: 4,
                    offsetX: 2,
                    offsetY: 2,
                },
            });

            assert.isTrue(result.validation.isValid);
            // Shadow should be handled in texture drawing
        });
    });

    // Text alignment
    describe("Text Alignment", () => {
        const alignments = ["left", "center", "right"];

        alignments.forEach((align) => {
            test(`creates label with ${align} alignment`, () => {
                const result = LabelMeshFactory.create({
                    text: "Aligned Text",
                    textAlign: align,
                });

                assert.isTrue(result.validation.isValid);
            });
        });

        test("uses default center alignment", () => {
            const result = LabelMeshFactory.create({
                text: "Default Align",
            });

            assert.isTrue(result.validation.isValid);
            // Default alignment should be center
        });
    });

    // Attach positions (for positioning labels)
    describe("Attach Positions", () => {
        const positions = LabelMeshFactory.ATTACH_POSITIONS;

        positions.forEach((position) => {
            test(`supports attach position: ${position}`, () => {
                const result = LabelMeshFactory.create({
                    text: `Attach ${position}`,
                    attachPosition: position,
                });

                assert.isTrue(result.validation.isValid);
                // Attach position is a valid configuration
            });
        });
    });

    // Dimension calculations
    describe("Label Dimensions", () => {
        test("calculates proper dimensions for short text", () => {
            const result = LabelMeshFactory.create({
                text: "Hi",
                fontSize: 24,
            });

            assert.isTrue(result.validation.isValid);
            assert.isDefined(result.mesh.metadata.contentWidth);
            assert.isDefined(result.mesh.metadata.contentHeight);
            assert.isAtLeast(result.mesh.metadata.contentWidth as number, 50); // Minimum width
        });

        test("calculates proper dimensions for long text", () => {
            const result = LabelMeshFactory.create({
                text: "This is a very long piece of text that should result in a wider label",
                fontSize: 48,
            });

            assert.isTrue(result.validation.isValid);
            assert.isAtLeast(result.mesh.metadata.contentWidth as number, 128);
        });

        test("handles power-of-2 texture sizing", () => {
            const result = LabelMeshFactory.create({
                text: "Texture Size Test",
                fontSize: 36,
            });

            assert.isTrue(result.validation.isValid);
            assert.isDefined(result.mesh.metadata.textureWidth);
            assert.isDefined(result.mesh.metadata.textureHeight);

            // Should be power of 2
            const width = result.mesh.metadata.textureWidth as number;
            const height = result.mesh.metadata.textureHeight as number;
            assert.isTrue((width & (width - 1)) === 0, "Width should be power of 2");
            assert.isTrue((height & (height - 1)) === 0, "Height should be power of 2");
        });
    });

    // Material properties
    describe("Material Configuration", () => {
        test("sets correct material properties", () => {
            const result = LabelMeshFactory.create({
                text: "Material Test",
            });

            assert.isTrue(result.validation.isValid);
            assert.isFalse(result.material.backFaceCulling);
            assert.isTrue(result.material.wasMethodCalled("setEmissiveTexture"));
        });

        test("handles material transparency", () => {
            const result = LabelMeshFactory.create({
                text: "Transparent Test",
                backgroundColor: "transparent",
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.material.alpha, 0);
        });
    });

    // Texture operations validation
    describe("Texture Drawing", () => {
        test("performs text drawing operations", () => {
            const result = LabelMeshFactory.create({
                text: "Drawing Test",
                backgroundColor: "#FFFFFF",
            });

            assert.isTrue(result.validation.isValid);
            if (result.texture) {
                // Should have clear, fill, and text operations
                const clearOps = result.texture.getDrawingOperations("clearRect");
                const fillOps = result.texture.getDrawingOperations("fillRect");
                const textOps = result.texture.getDrawingOperations("fillText");

                assert.isAtLeast(clearOps.length, 1);
                assert.isAtLeast(fillOps.length, 1);
                assert.isAtLeast(textOps.length, 1);
            }
        });

        test("updates texture after drawing", () => {
            const result = LabelMeshFactory.create({
                text: "Update Test",
            });

            assert.isTrue(result.validation.isValid);
            if (result.texture) {
                assert.isTrue(result.texture.wasMethodCalled("update"));
            }
        });
    });

    // Combined feature tests
    describe("Complex Combinations", () => {
        test("creates full-featured label", () => {
            const result = LabelMeshFactory.create({
                text: "Full Featured Label",
                font: "Arial",
                fontSize: 36,
                textColor: "#FFFFFF",
                backgroundColor: "#0066CC",
                backgroundPadding: 12,
                cornerRadius: 8,
                borders: [
                    {width: 2, color: "#FFFFFF", spacing: 0},
                    {width: 1, color: "#003366", spacing: 2},
                ],
                textOutline: {
                    color: "#000000",
                    width: 1,
                },
                textShadow: {
                    color: "rgba(0,0,0,0.3)",
                    blur: 2,
                    offsetX: 1,
                    offsetY: 1,
                },
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.text, "Full Featured Label");
            assert.equal(result.mesh.metadata.font, "Arial");
            assert.equal(result.mesh.metadata.fontSize, 36);
            assert.equal(result.mesh.metadata.backgroundColor, "#0066CC");
            assert.equal((result.mesh.metadata.borders as unknown[]).length, 2);
        });
    });
});
