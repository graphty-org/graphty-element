/**
 * Property-Based Random Tests
 *
 * Uses fast-check to generate random property combinations and validate that
 * all mesh creation scenarios work correctly. These tests complement the golden
 * masters by exploring the parameter space more thoroughly.
 */

import fc from "fast-check";
import {assert, describe, test} from "vitest";

import {EdgeMeshFactory, LabelMeshFactory, NodeMeshFactory} from "./mesh-factory";

describe("Property-Based Tests", () => {
    // Node property-based tests
    describe("Node Properties", () => {
        test("all node shapes work with random sizes and colors", () => {
            fc.assert(fc.property(
                fc.constantFrom(... NodeMeshFactory.SHAPES), // Random shape
                fc.float({min: Math.fround(0.1), max: Math.fround(10)}).filter((x) => !Number.isNaN(x)), // Random size
                fc.integer({min: 0, max: 0xFFFFFF}).map((n) => n.toString(16).padStart(6, "0")), // Random hex color
                fc.boolean(), // Random 2D mode
                fc.boolean(), // Random wireframe
                fc.option(fc.float({min: 0, max: 1}).filter((x) => !Number.isNaN(x))), // Random opacity
                (shape, size, colorHex, is2D, wireframe, opacity) => {
                    const color = `#${colorHex}`;

                    const result = NodeMeshFactory.create({
                        shape,
                        size,
                        color,
                        is2D,
                        wireframe,
                        opacity,
                    });

                    // Should always create valid mesh
                    assert.isTrue(result.validation.isValid,
                        `Failed for shape:${shape}, size:${size}, color:${color}, 2D:${is2D}, wireframe:${wireframe}, opacity:${opacity}\nErrors: ${result.validation.errors.join(", ")}`);

                    // Basic validations
                    assert.equal(result.mesh.metadata.shapeType, shape);
                    assert.approximately(result.mesh.scaling.x, size, 0.001);
                    assert.equal(result.material.wireframe, wireframe);

                    if (opacity !== null) {
                        assert.approximately(result.mesh.visibility, opacity, 0.001);
                    }

                    if (is2D) {
                        assert.isTrue(result.material.metadata.disableLighting);
                    }
                },
            ), {numRuns: 50});
        });

        test("color object format works with random values", () => {
            fc.assert(fc.property(
                fc.constantFrom(... NodeMeshFactory.SHAPES),
                fc.integer({min: 0, max: 0xFFFFFF}).map((n) => n.toString(16).padStart(6, "0")),
                fc.float({min: 0, max: 1}).filter((x) => !Number.isNaN(x)),
                (shape, colorHex, opacity) => {
                    const colorObj = {
                        colorType: "solid",
                        value: `#${colorHex}`,
                        opacity,
                    };

                    const result = NodeMeshFactory.create({
                        shape,
                        color: colorObj,
                    });

                    assert.isTrue(result.validation.isValid);
                    assert.equal(result.mesh.metadata.shapeType, shape);
                },
            ), {numRuns: 30});
        });

        test("all polyhedron shapes work with various sizes", () => {
            const polyhedrons = [
                "tetrahedron",
                "octahedron",
                "dodecahedron",
                "icosahedron",
                "rhombicuboctahedron",
                "triangular-prism",
                "pentagonal-prism",
                "hexagonal-prism",
                "square-pyramid",
                "pentagonal-pyramid",
            ];

            fc.assert(fc.property(
                fc.constantFrom(... polyhedrons),
                fc.float({min: 0.5, max: 5}).filter((x) => !Number.isNaN(x)),
                (shape, size) => {
                    const result = NodeMeshFactory.create({
                        shape,
                        size,
                    });

                    assert.isTrue(result.validation.isValid);
                    assert.equal(result.mesh.metadata.shapeType, shape);
                    assert.approximately(result.mesh.scaling.x, size, 0.001);
                },
            ), {numRuns: 25});
        });
    });

    // Edge property-based tests
    describe("Edge Properties", () => {
        test("all line types work with random widths and colors", () => {
            fc.assert(fc.property(
                fc.constantFrom(... EdgeMeshFactory.LINE_TYPES),
                fc.float({min: Math.fround(0.1), max: Math.fround(10)}).filter((x) => !Number.isNaN(x)),
                fc.integer({min: 0, max: 0xFFFFFF}).map((n) => n.toString(16).padStart(6, "0")),
                fc.option(fc.float({min: Math.fround(0.1), max: Math.fround(5)}).filter((x) => !Number.isNaN(x))), // Optional animation speed
                (lineType, width, colorHex, animationSpeed) => {
                    const color = `#${colorHex}`;

                    const result = EdgeMeshFactory.create({
                        type: lineType,
                        width,
                        color,
                        animationSpeed,
                    });

                    assert.isTrue(result.validation.isValid,
                        `Failed for type:${lineType}, width:${width}, color:${color}, speed:${animationSpeed}\nErrors: ${result.validation.errors.join(", ")}`);

                    assert.equal(result.mesh.metadata.lineType, lineType);
                    assert.equal(result.mesh.metadata.lineWidth, width);
                    assert.equal(result.mesh.metadata.lineColor, color);

                    if (animationSpeed !== null) {
                        assert.isTrue(result.mesh.metadata.animated);
                        assert.equal(result.mesh.metadata.animationSpeed, animationSpeed);
                    } else {
                        assert.isFalse(result.mesh.metadata.animated);
                    }
                },
            ), {numRuns: 40});
        });

        test("random arrow configurations work correctly", () => {
            fc.assert(fc.property(
                fc.constantFrom(... EdgeMeshFactory.ARROW_TYPES),
                fc.constantFrom(... EdgeMeshFactory.ARROW_TYPES),
                fc.float({min: Math.fround(0.5), max: Math.fround(3)}).filter((x) => !Number.isNaN(x)),
                fc.float({min: Math.fround(0.5), max: Math.fround(3)}).filter((x) => !Number.isNaN(x)),
                fc.integer({min: 0, max: 0xFFFFFF}).map((n) => n.toString(16).padStart(6, "0")),
                fc.integer({min: 0, max: 0xFFFFFF}).map((n) => n.toString(16).padStart(6, "0")),
                (sourceType, targetType, sourceSize, targetSize, sourceColorHex, targetColorHex) => {
                    const result = EdgeMeshFactory.create({
                        type: "solid",
                        width: 2,
                        color: "#000000",
                        arrow: {
                            source: {
                                type: sourceType,
                                size: sourceSize,
                                color: `#${sourceColorHex}`,
                            },
                            target: {
                                type: targetType,
                                size: targetSize,
                                color: `#${targetColorHex}`,
                            },
                        },
                    });

                    assert.isTrue(result.validation.isValid);
                    assert.isDefined(result.mesh.metadata.sourceArrow);
                    assert.isDefined(result.mesh.metadata.targetArrow);
                    assert.equal((result.mesh.metadata.sourceArrow as {type: string}).type, sourceType);
                    assert.equal((result.mesh.metadata.targetArrow as {type: string}).type, targetType);
                },
            ), {numRuns: 30});
        });

        test("animated lines with dash patterns work", () => {
            const dashTypes = ["dash", "dash-dot", "dots", "equal-dash"];

            fc.assert(fc.property(
                fc.constantFrom(... dashTypes),
                fc.float({min: 1, max: 5}).filter((x) => !Number.isNaN(x)),
                fc.float({min: Math.fround(0.5), max: Math.fround(3)}).filter((x) => !Number.isNaN(x)),
                (dashType, width, animationSpeed) => {
                    const result = EdgeMeshFactory.create({
                        type: dashType,
                        width,
                        color: "#FF0000",
                        animationSpeed,
                    });

                    assert.isTrue(result.validation.isValid);
                    assert.equal(result.mesh.metadata.lineType, dashType);
                    assert.isTrue(result.mesh.metadata.animated);
                    assert.equal(result.mesh.metadata.animationSpeed, animationSpeed);
                },
            ), {numRuns: 20});
        });
    });

    // Label property-based tests
    describe("Label Properties", () => {
        test("random text with various fonts and sizes works", () => {
            const fonts = ["Verdana", "Arial", "Times New Roman", "Helvetica", "Georgia"];

            fc.assert(fc.property(
                fc.string({minLength: 1, maxLength: 100}),
                fc.constantFrom(... fonts),
                fc.integer({min: 8, max: 96}),
                fc.integer({min: 0, max: 0xFFFFFF}).map((n) => n.toString(16).padStart(6, "0")),
                (text, font, fontSize, colorHex) => {
                    // Filter out problematic characters that might cause issues
                    const cleanText = text.replace(/[^\x20-\x7E]/g, " ").trim() || "Test";
                    const textColor = `#${colorHex}`;

                    const result = LabelMeshFactory.create({
                        text: cleanText,
                        font,
                        fontSize,
                        textColor,
                    });

                    assert.isTrue(result.validation.isValid,
                        `Failed for text:"${cleanText}", font:${font}, size:${fontSize}, color:${textColor}\nErrors: ${result.validation.errors.join(", ")}`);

                    assert.equal(result.mesh.metadata.text, cleanText);
                    assert.equal(result.mesh.metadata.font, font);
                    assert.equal(result.mesh.metadata.fontSize, fontSize);
                    assert.equal(result.mesh.metadata.textColor, textColor);
                },
            ), {numRuns: 35});
        });

        test("random background configurations work", () => {
            fc.assert(fc.property(
                fc.integer({min: 0, max: 0xFFFFFF}).map((n) => n.toString(16).padStart(6, "0")),
                fc.integer({min: 0, max: 50}),
                fc.integer({min: 0, max: 30}),
                (colorHex, padding, radius) => {
                    const backgroundColor = `#${colorHex}`;

                    const result = LabelMeshFactory.create({
                        text: "Background Test",
                        backgroundColor,
                        backgroundPadding: padding,
                        cornerRadius: radius,
                    });

                    assert.isTrue(result.validation.isValid);
                    assert.equal(result.mesh.metadata.backgroundColor, backgroundColor);
                    assert.equal(result.mesh.metadata.backgroundPadding, padding);
                    assert.equal(result.mesh.metadata.cornerRadius, radius);
                },
            ), {numRuns: 25});
        });

        test("random border configurations work", () => {
            fc.assert(fc.property(
                fc.array(
                    fc.record({
                        width: fc.integer({min: 1, max: 10}),
                        color: fc.integer({min: 0, max: 0xFFFFFF}).map((n) => `#${n.toString(16).padStart(6, "0")}`),
                        spacing: fc.integer({min: 0, max: 5}),
                    }),
                    {minLength: 1, maxLength: 5},
                ),
                (borders) => {
                    const result = LabelMeshFactory.create({
                        text: "Border Test",
                        backgroundColor: "#FFFFFF",
                        borders,
                    });

                    assert.isTrue(result.validation.isValid);
                    assert.equal((result.mesh.metadata.borders as unknown[]).length, borders.length);

                    if (result.texture) {
                        const strokeOps = result.texture.getDrawingOperations("strokeRect");
                        assert.equal(strokeOps.length, borders.length);
                    }
                },
            ), {numRuns: 20});
        });

        test("random pointer configurations work", () => {
            const directions = ["top", "bottom", "left", "right"];

            fc.assert(fc.property(
                fc.constantFrom(... directions),
                fc.integer({min: 10, max: 60}),
                fc.integer({min: 5, max: 40}),
                fc.boolean(),
                (direction, width, height, curve) => {
                    const result = LabelMeshFactory.create({
                        text: "Pointer Test",
                        backgroundColor: "#DDDDDD",
                        pointer: {
                            direction,
                            width,
                            height,
                            curve,
                        },
                    });

                    assert.isTrue(result.validation.isValid);
                    assert.isTrue(result.mesh.metadata.hasPointer);
                    assert.equal(result.mesh.metadata.pointerDirection, direction);
                    assert.equal(result.mesh.metadata.pointerWidth, width);
                    assert.equal(result.mesh.metadata.pointerHeight, height);
                    assert.equal(result.mesh.metadata.pointerCurve, curve);
                },
            ), {numRuns: 25});
        });

        test("random badge configurations work", () => {
            fc.assert(fc.property(
                fc.constantFrom(... LabelMeshFactory.BADGE_TYPES),
                fc.option(fc.integer({min: 1, max: 999})),
                fc.option(fc.float({min: 0, max: 1}).filter((x) => !Number.isNaN(x))),
                fc.option(fc.constantFrom(["star", "heart", "warning", "info", "check"])),
                (badgeType, count, progress, icon) => {
                    const badgeConfig: Record<string, unknown> = {type: badgeType};

                    if (badgeType === "count" || badgeType === "notification") {
                        badgeConfig.count = count ?? 1;
                    }

                    if (badgeType === "progress") {
                        badgeConfig.progress = progress ?? 0.5;
                    }

                    if (badgeType === "icon") {
                        badgeConfig.icon = icon ?? "star";
                    }

                    const result = LabelMeshFactory.create({
                        text: "Badge Test",
                        badge: badgeConfig,
                    });

                    assert.isTrue(result.validation.isValid);
                    assert.isTrue(result.mesh.metadata.hasBadge);
                    assert.equal(result.mesh.metadata.badgeType, badgeType);
                },
            ), {numRuns: 30});
        });

        test("complex label combinations work", () => {
            fc.assert(fc.property(
                fc.string({minLength: 5, maxLength: 50}),
                fc.integer({min: 0, max: 0xFFFFFF}).map((n) => n.toString(16).padStart(6, "0")),
                fc.integer({min: 0, max: 0xFFFFFF}).map((n) => n.toString(16).padStart(6, "0")),
                fc.integer({min: 16, max: 64}),
                fc.integer({min: 4, max: 20}),
                fc.boolean(),
                fc.boolean(),
                fc.boolean(),
                (text, textColorHex, bgColorHex, fontSize, padding, hasPointer, hasBadge, hasAnimation) => {
                    const cleanText = text.replace(/[^\x20-\x7E]/g, " ").trim() || "Test";
                    const textColor = `#${textColorHex}`;
                    const backgroundColor = `#${bgColorHex}`;

                    const config: Record<string, unknown> = {
                        text: cleanText,
                        textColor,
                        backgroundColor,
                        fontSize,
                        backgroundPadding: padding,
                    };

                    if (hasPointer) {
                        config.pointer = {
                            direction: "bottom",
                            width: 20,
                            height: 15,
                        };
                    }

                    if (hasBadge) {
                        config.badge = {
                            type: "notification",
                            count: 5,
                        };
                    }

                    if (hasAnimation) {
                        config.animation = {
                            type: "fade",
                            speed: 1,
                        };
                    }

                    const result = LabelMeshFactory.create(config);

                    assert.isTrue(result.validation.isValid,
                        `Complex label failed: ${result.validation.errors.join(", ")}`);

                    assert.equal(result.mesh.metadata.text, cleanText);
                    assert.equal(result.mesh.metadata.hasPointer, hasPointer);
                    assert.equal(result.mesh.metadata.hasBadge, hasBadge);
                    assert.equal(result.mesh.metadata.hasAnimation, hasAnimation);
                },
            ), {numRuns: 25});
        });
    });

    // Cross-mesh validation tests
    describe("Cross-Mesh Validation", () => {
        test("all mesh types handle default values consistently", () => {
            fc.assert(fc.property(
                fc.constantFrom("node", "edge", "label"),
                (meshType) => {
                    let result;

                    switch (meshType) {
                        case "node":
                            result = NodeMeshFactory.create({});
                            assert.equal(result.mesh.metadata.shapeType, "sphere"); // Default shape
                            break;
                        case "edge":
                            result = EdgeMeshFactory.create({});
                            assert.equal(result.mesh.metadata.lineType, "solid"); // Default type
                            assert.equal(result.mesh.metadata.lineWidth, 1); // Default width
                            break;
                        case "label":
                            result = LabelMeshFactory.create({});
                            assert.equal(result.mesh.metadata.text, ""); // Default text
                            assert.equal(result.mesh.metadata.font, "Verdana"); // Default font
                            break;
                        default:
                            throw new Error(`Unknown mesh type: ${meshType}`);
                    }

                    assert.isTrue(result.validation.isValid);
                    assert.isNotNull(result.mesh);
                    assert.isNotNull(result.material);
                },
            ), {numRuns: 15});
        });

        test("material properties are consistently applied", () => {
            fc.assert(fc.property(
                fc.integer({min: 0, max: 0xFFFFFF}).map((n) => n.toString(16).padStart(6, "0")),
                fc.boolean(),
                (colorHex, wireframe) => {
                    const color = `#${colorHex}`;

                    // Test node material
                    const nodeResult = NodeMeshFactory.create({
                        shape: "sphere",
                        color,
                        wireframe,
                    });

                    assert.isTrue(nodeResult.validation.isValid);
                    assert.equal(nodeResult.material.wireframe, wireframe);

                    // Test edge material
                    const edgeResult = EdgeMeshFactory.create({
                        type: "solid",
                        color,
                        width: 2,
                    });

                    assert.isTrue(edgeResult.validation.isValid);
                    assert.equal(edgeResult.mesh.metadata.lineColor, color);

                    // Test label material
                    const labelResult = LabelMeshFactory.create({
                        text: "Material Test",
                        textColor: color,
                    });

                    assert.isTrue(labelResult.validation.isValid);
                    assert.equal(labelResult.mesh.metadata.textColor, color);
                },
            ), {numRuns: 20});
        });
    });

    // Stress testing with extreme values
    describe("Stress Tests", () => {
        test("handles extreme size values", () => {
            fc.assert(fc.property(
                fc.float({min: Math.fround(0.001), max: Math.fround(100)}).filter((x) => !Number.isNaN(x)),
                (extremeSize) => {
                    const nodeResult = NodeMeshFactory.create({
                        shape: "sphere",
                        size: extremeSize,
                    });

                    assert.isTrue(nodeResult.validation.isValid);
                    assert.approximately(nodeResult.mesh.scaling.x, extremeSize, 0.001);
                },
            ), {numRuns: 10});
        });

        test("handles very long text content", () => {
            fc.assert(fc.property(
                fc.string({minLength: 100, maxLength: 1000}),
                (longText) => {
                    const cleanText = longText.replace(/[^\x20-\x7E]/g, " ").trim() || "Test";

                    const result = LabelMeshFactory.create({
                        text: cleanText,
                        fontSize: 24,
                    });

                    assert.isTrue(result.validation.isValid);
                    assert.equal(result.mesh.metadata.text, cleanText);
                    // Should handle long text without errors
                    assert.isDefined(result.mesh.metadata.contentWidth);
                    assert.isDefined(result.mesh.metadata.contentHeight);
                },
            ), {numRuns: 10});
        });
    });
});
