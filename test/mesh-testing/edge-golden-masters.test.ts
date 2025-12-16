/**
 * Edge Golden Master Tests
 *
 * Tests all line types, arrow heads, animations, and edge configurations to achieve
 * 100% coverage of EdgeMesh.ts functionality. Tests CustomLineRenderer (solid lines)
 * and PatternedLineRenderer (instanced patterns) based on the updated architecture.
 */

import {assert, describe, test} from "vitest";

import {ArrowMeshFactory, EdgeMeshFactory} from "./mesh-factory";

describe("Edge Golden Masters", () => {
    // Line type tests - all 9 supported line types
    describe("Line Types", () => {
        const lineTypes = EdgeMeshFactory.LINE_TYPES;

        lineTypes.forEach((lineType) => {
            test(`creates ${lineType} line`, () => {
                const result = EdgeMeshFactory.create({
                    type: lineType,
                    width: 2,
                    color: "#000000",
                });

                assert.isTrue(result.validation.isValid,
                    `${lineType} validation failed: ${result.validation.errors.join(", ")}`);
                assert.equal(result.mesh.metadata.lineType, lineType);

                // Solid lines use CustomLineRenderer, all other patterns use PatternedLineRenderer
                if (lineType === "solid") {
                    assert.equal(result.mesh.metadata.meshType, "customLine");
                    assert.equal(result.mesh.metadata.rendererType, "CustomLineRenderer");
                } else {
                    assert.equal(result.mesh.metadata.meshType, "instancedPattern");
                    assert.equal(result.mesh.metadata.rendererType, "PatternedLineRenderer");
                }
            });
        });
    });

    // Width variations
    describe("Line Width", () => {
        const widths = [0.5, 1, 2, 5, 10];

        widths.forEach((width) => {
            test(`creates line with width ${width}`, () => {
                const result = EdgeMeshFactory.create({
                    type: "solid",
                    width: width,
                    color: "#FF0000",
                });

                assert.isTrue(result.validation.isValid);
                assert.equal(result.mesh.metadata.lineWidth, width);
            });
        });
    });

    // Color variations
    describe("Line Colors", () => {
        const colors = ["#FF0000", "#00FF00", "#0000FF", "#FFFFFF", "#000000", "#FFFF00"];

        colors.forEach((color) => {
            test(`creates line with color ${color}`, () => {
                const result = EdgeMeshFactory.create({
                    type: "solid",
                    width: 1,
                    color: color,
                });

                assert.isTrue(result.validation.isValid);
                assert.equal(result.mesh.metadata.lineColor, color);
            });
        });
    });

    // Opacity variations (Phase 3 spec section 3.3)
    describe("Line Opacity", () => {
        const opacities = [0.0, 0.25, 0.5, 0.75, 1.0];

        opacities.forEach((opacity) => {
            test(`creates line with opacity ${opacity}`, () => {
                const result = EdgeMeshFactory.create({
                    type: "solid",
                    width: 1,
                    color: "#FF0000",
                    opacity: opacity,
                });

                assert.isTrue(result.validation.isValid);
                assert.equal(result.mesh.metadata.lineOpacity, opacity);
            });
        });
    });

    // Bezier curve tests (Phase 3 spec section 3.3)
    describe("Bezier Curves", () => {
        test("creates bezier curve when bezier is true", () => {
            const result = EdgeMeshFactory.create({
                type: "solid",
                width: 1,
                color: "#FF0000",
                bezier: true,
            });

            assert.isTrue(result.validation.isValid);
            assert.isTrue(result.mesh.metadata.bezier);
            assert.isAtLeast(result.mesh.metadata.segmentCount as number, 10);
        });

        test("creates straight line when bezier is false", () => {
            const result = EdgeMeshFactory.create({
                type: "solid",
                width: 1,
                color: "#FF0000",
                bezier: false,
            });

            assert.isTrue(result.validation.isValid);
            assert.isUndefined(result.mesh.metadata.bezier);
        });

        test("bezier works with patterned lines", () => {
            const result = EdgeMeshFactory.create({
                type: "dash",
                width: 2,
                color: "#00FF00",
                bezier: true,
            });

            assert.isTrue(result.validation.isValid);
            assert.isTrue(result.mesh.metadata.bezier);
            assert.equal(result.mesh.metadata.lineType, "dash");
        });
    });

    // Static vs animated lines
    describe("Line Animation", () => {
        test("creates static line (no animation)", () => {
            const result = EdgeMeshFactory.create({
                type: "solid",
                width: 2,
                color: "#FF0000",
            });

            assert.isTrue(result.validation.isValid);
            assert.isFalse(result.mesh.metadata.animated);
            assert.isUndefined(result.mesh.metadata.animationSpeed);
        });

        test("creates animated line with animation speed", () => {
            const result = EdgeMeshFactory.create({
                type: "solid",
                width: 2,
                color: "#FF0000",
                animationSpeed: 1.5,
            });

            assert.isTrue(result.validation.isValid);
            assert.isTrue(result.mesh.metadata.animated);
            assert.equal(result.mesh.metadata.animationSpeed, 1.5);
            assert.isTrue(result.material.metadata.hasAnimationTexture);
        });

        test("creates animated line with various speeds", () => {
            const speeds = [0.5, 1, 2, 5];

            speeds.forEach((speed) => {
                const result = EdgeMeshFactory.create({
                    type: "dash",
                    width: 1,
                    color: "#00FF00",
                    animationSpeed: speed,
                });

                assert.isTrue(result.validation.isValid);
                assert.isTrue(result.mesh.metadata.animated);
                assert.equal(result.mesh.metadata.animationSpeed, speed);
            });
        });
    });

    // Pattern shapes - testing the new architecture
    describe("Pattern Shapes", () => {
        // Patterns that use instanced meshes with specific shapes
        const patternTypes: {type: string, shape: string}[] = [
            {type: "dot", shape: "circle"},
            {type: "star", shape: "star"},
            {type: "box", shape: "square"},
            {type: "dash", shape: "rectangle"},
            {type: "diamond", shape: "diamond"},
            {type: "dash-dot", shape: "alternating"},
        ];

        patternTypes.forEach(({type, shape}) => {
            test(`creates ${type} pattern with ${shape} instances`, () => {
                const result = EdgeMeshFactory.create({
                    type: type,
                    width: 2,
                    color: "#0000FF",
                });

                assert.isTrue(result.validation.isValid);
                assert.equal(result.mesh.metadata.lineType, type);
                // Patterned lines should have patternShape metadata
                assert.equal(result.mesh.metadata.patternShape, shape);
                assert.isTrue(result.mesh.metadata.usesInstancing);
            });
        });

        test("creates special wave patterns", () => {
            const waveTypes = ["sinewave", "zigzag"];

            waveTypes.forEach((waveType) => {
                const result = EdgeMeshFactory.create({
                    type: waveType,
                    width: 1,
                    color: "#FF00FF",
                });

                assert.isTrue(result.validation.isValid);
                assert.equal(result.mesh.metadata.lineType, waveType);
            });
        });
    });

    // Arrow head tests - all 14 arrow types
    describe("Arrow Heads", () => {
        const arrowTypes = EdgeMeshFactory.ARROW_TYPES;

        arrowTypes.forEach((arrowType) => {
            test(`creates source arrow: ${arrowType}`, () => {
                const result = EdgeMeshFactory.create({
                    type: "solid",
                    width: 2,
                    color: "#000000",
                    arrow: {
                        source: {
                            type: arrowType,
                            size: 1,
                            color: "#FF0000",
                        },
                    },
                });

                assert.isTrue(result.validation.isValid);
                assert.isDefined(result.mesh.metadata.sourceArrow);
                assert.equal((result.mesh.metadata.sourceArrow as {type: string}).type, arrowType);
            });

            test(`creates target arrow: ${arrowType}`, () => {
                const result = EdgeMeshFactory.create({
                    type: "solid",
                    width: 2,
                    color: "#000000",
                    arrow: {
                        target: {
                            type: arrowType,
                            size: 1.5,
                            color: "#00FF00",
                        },
                    },
                });

                assert.isTrue(result.validation.isValid);
                assert.isDefined(result.mesh.metadata.targetArrow);
                assert.equal((result.mesh.metadata.targetArrow as {type: string}).type, arrowType);
                assert.equal((result.mesh.metadata.targetArrow as {size: number}).size, 1.5);
            });
        });

        test("creates double-headed arrows", () => {
            const result = EdgeMeshFactory.create({
                type: "solid",
                width: 3,
                color: "#000000",
                arrow: {
                    source: {
                        type: "normal",
                        size: 1,
                        color: "#FF0000",
                    },
                    target: {
                        type: "inverted",
                        size: 1.2,
                        color: "#0000FF",
                    },
                },
            });

            assert.isTrue(result.validation.isValid);
            assert.isDefined(result.mesh.metadata.sourceArrow);
            assert.isDefined(result.mesh.metadata.targetArrow);
            assert.equal((result.mesh.metadata.sourceArrow as {type: string}).type, "normal");
            assert.equal((result.mesh.metadata.targetArrow as {type: string}).type, "inverted");
        });
    });

    // Arrow size variations
    describe("Arrow Sizing", () => {
        const sizes = [0.5, 1, 1.5, 2, 3];

        sizes.forEach((size) => {
            test(`creates arrow with size ${size}`, () => {
                const result = EdgeMeshFactory.create({
                    type: "solid",
                    width: 2,
                    color: "#000000",
                    arrow: {
                        target: {
                            type: "normal",
                            size: size,
                            color: "#FF0000",
                        },
                    },
                });

                assert.isTrue(result.validation.isValid);
                assert.equal((result.mesh.metadata.targetArrow as {size: number}).size, size);
            });
        });
    });

    // Arrow Color Independence (Phase 3 spec section 3.5)
    describe("Arrow Color Independence", () => {
        test("arrow color is independent from line color", () => {
            const result = EdgeMeshFactory.create({
                type: "solid",
                width: 2,
                color: "#0000FF", // Blue line
                arrow: {
                    target: {type: "normal", size: 1, color: "#FF0000"}, // Red arrow
                },
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.lineColor, "#0000FF");
            assert.equal(
                (result.mesh.metadata.targetArrow as {color: string}).color,
                "#FF0000",
            );
        });

        test("multiple arrows can have different colors", () => {
            const result = EdgeMeshFactory.create({
                type: "solid",
                width: 2,
                color: "#000000",
                arrow: {
                    source: {type: "normal", size: 1, color: "#FF0000"},
                    target: {type: "inverted", size: 1, color: "#00FF00"},
                },
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(
                (result.mesh.metadata.sourceArrow as {color: string}).color,
                "#FF0000",
            );
            assert.equal(
                (result.mesh.metadata.targetArrow as {color: string}).color,
                "#00FF00",
            );
        });
    });

    // Arrow Opacity (Phase 3 spec section 3.5)
    describe("Arrow Opacity", () => {
        const opacities = [0.0, 0.5, 1.0];

        opacities.forEach((opacity) => {
            test(`creates arrow with opacity ${opacity}`, () => {
                const result = EdgeMeshFactory.create({
                    type: "solid",
                    width: 2,
                    color: "#000000",
                    arrow: {
                        target: {type: "normal", size: 1, color: "#FF0000", opacity},
                    },
                });

                assert.isTrue(result.validation.isValid);
                assert.equal(
                    (result.mesh.metadata.targetArrow as {opacity: number}).opacity,
                    opacity,
                );
            });
        });
    });

    // 2D vs 3D Mode (Phase 3 spec section 3.6)
    describe("2D vs 3D Mode", () => {
        describe("3D Mode (Default)", () => {
            test("3D filled arrows use FilledArrowRenderer", () => {
                const result = EdgeMeshFactory.create({
                    type: "solid",
                    is2D: false,
                    arrow: {target: {type: "normal", size: 1, color: "#FF0000"}},
                });

                assert.isTrue(result.validation.isValid);
                const arrow = result.mesh.metadata.targetArrow as Record<string, unknown>;
                assert.equal(arrow.rendererType, "FilledArrowRenderer");
                assert.equal(arrow.geometryPlane, "XZ");
            });

            test("3D outline arrows use CustomLineRenderer", () => {
                const result = EdgeMeshFactory.create({
                    type: "solid",
                    is2D: false,
                    arrow: {target: {type: "open-normal", size: 1, color: "#FF0000"}},
                });

                assert.isTrue(result.validation.isValid);
                const arrow = result.mesh.metadata.targetArrow as Record<string, unknown>;
                assert.equal(arrow.rendererType, "CustomLineRenderer");
            });
        });

        describe("2D Mode", () => {
            test("2D arrows use StandardMaterial", () => {
                const result = EdgeMeshFactory.create({
                    type: "solid",
                    is2D: true,
                    arrow: {target: {type: "normal", size: 1, color: "#FF0000"}},
                });

                assert.isTrue(result.validation.isValid);
                const arrow = result.mesh.metadata.targetArrow as Record<string, unknown>;
                assert.equal(arrow.materialType, "StandardMaterial");
                assert.equal(arrow.geometryPlane, "XY");
            });

            test("2D mode affects all arrows", () => {
                const result = EdgeMeshFactory.create({
                    type: "solid",
                    is2D: true,
                    arrow: {
                        source: {type: "diamond", size: 1, color: "#FF0000"},
                        target: {type: "normal", size: 1, color: "#00FF00"},
                    },
                });

                assert.isTrue(result.validation.isValid);
                const sourceArrow = result.mesh.metadata.sourceArrow as Record<string, unknown>;
                const targetArrow = result.mesh.metadata.targetArrow as Record<string, unknown>;
                assert.isTrue(sourceArrow.is2D as boolean);
                assert.isTrue(targetArrow.is2D as boolean);
                assert.equal(sourceArrow.geometryPlane, "XY");
                assert.equal(targetArrow.geometryPlane, "XY");
            });
        });
    });

    // Combined configurations
    describe("Complex Combinations", () => {
        test("animated dashed line with arrows", () => {
            const result = EdgeMeshFactory.create({
                type: "dash-dot",
                width: 2.5,
                color: "#FF8800",
                animationSpeed: 2,
                arrow: {
                    source: {
                        type: "dot",
                        size: 1,
                        color: "#FF0000",
                    },
                    target: {
                        type: "diamond",
                        size: 1.5,
                        color: "#0000FF",
                    },
                },
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.lineType, "dash-dot");
            assert.isTrue(result.mesh.metadata.animated);
            assert.equal(result.mesh.metadata.animationSpeed, 2);
            assert.isDefined(result.mesh.metadata.sourceArrow);
            assert.isDefined(result.mesh.metadata.targetArrow);
        });

        test("thick animated zigzag with special arrows", () => {
            const result = EdgeMeshFactory.create({
                type: "zigzag",
                width: 5,
                color: "#00FFFF",
                animationSpeed: 0.5,
                arrow: {
                    source: {
                        type: "crow",
                        size: 2,
                        color: "#FFFF00",
                    },
                    target: {
                        type: "half-open",
                        size: 1.5,
                        color: "#FF00FF",
                    },
                },
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.lineType, "zigzag");
            assert.equal(result.mesh.metadata.lineWidth, 5);
            assert.isTrue(result.mesh.metadata.animated);
        });

        test("bezier curve with mixed arrow types", () => {
            const result = EdgeMeshFactory.create({
                type: "solid",
                width: 2,
                color: "#00FFFF",
                bezier: true,
                arrow: {
                    source: {type: "tee", size: 1, color: "#FFFF00"},
                    target: {type: "normal", size: 2, color: "#FF00FF"},
                },
            });

            assert.isTrue(result.validation.isValid);
            assert.isTrue(result.mesh.metadata.bezier);
            assert.equal(
                (result.mesh.metadata.sourceArrow as {type: string}).type,
                "tee",
            );
            assert.equal(
                (result.mesh.metadata.targetArrow as {type: string}).type,
                "normal",
            );
        });

        test("animated dashed line with bidirectional arrows and opacity", () => {
            const result = EdgeMeshFactory.create({
                type: "dash-dot",
                width: 2.5,
                color: "#FF8800",
                opacity: 0.8,
                animationSpeed: 2,
                arrow: {
                    source: {type: "dot", size: 1, color: "#FF0000", opacity: 0.9},
                    target: {type: "diamond", size: 1.5, color: "#0000FF", opacity: 1.0},
                },
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.lineType, "dash-dot");
            assert.equal(result.mesh.metadata.lineOpacity, 0.8);
            assert.isTrue(result.mesh.metadata.animated);
            assert.equal(result.mesh.metadata.animationSpeed, 2);
            assert.isDefined(result.mesh.metadata.sourceArrow);
            assert.isDefined(result.mesh.metadata.targetArrow);
        });
    });

    // Geometry validation for new architecture
    describe("Geometry Validation", () => {
        test("uses correct geometry type for solid lines", () => {
            const result = EdgeMeshFactory.create({
                type: "solid",
                width: 1,
                color: "#000000",
            });

            assert.isTrue(result.validation.isValid);
            // CustomLineRenderer uses quad-strip geometry
            assert.equal(result.mesh.metadata.geometryType, "quadStrip");
            assert.equal(result.mesh.metadata.verticesPerSegment, 4);
        });

        test("uses instancing for patterned lines", () => {
            const result = EdgeMeshFactory.create({
                type: "dot",
                width: 1,
                color: "#000000",
            });

            assert.isTrue(result.validation.isValid);
            // PatternedLineRenderer uses instanced meshes
            assert.isTrue(result.mesh.metadata.usesInstancing);
            assert.isDefined(result.mesh.metadata.patternShape);
        });
    });

    // Animation texture validation
    describe("Animation Texture", () => {
        test("creates proper texture for animated lines", () => {
            const result = EdgeMeshFactory.create({
                type: "solid",
                width: 2,
                color: "#FF0000",
                animationSpeed: 1,
            });

            assert.isTrue(result.validation.isValid);
            assert.isTrue(result.mesh.metadata.animated);
            assert.equal(result.mesh.metadata.animationSpeed, 1);
            assert.isTrue(result.material.metadata.hasAnimationTexture);
        });
    });

    // Default value handling
    describe("Default Values", () => {
        test("applies default line type (solid)", () => {
            const result = EdgeMeshFactory.create({
                width: 1,
                color: "#000000",
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.lineType, "solid");
        });

        test("applies default width (1)", () => {
            const result = EdgeMeshFactory.create({
                type: "solid",
                color: "#000000",
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.lineWidth, 1);
        });

        test("applies default color (#000000)", () => {
            const result = EdgeMeshFactory.create({
                type: "solid",
                width: 1,
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.lineColor, "#000000");
        });
    });
});

/**
 * ArrowMeshFactory Golden Masters - Basic tests for arrow mesh creation
 *
 * Tests the ArrowMeshFactory to validate independent arrow mesh creation
 * with all 15 arrow types, geometry validation, and 2D/3D mode support.
 */
describe("ArrowMeshFactory Golden Masters", () => {
    // Test all arrow types can be created
    describe("Arrow Type Creation", () => {
        const arrowTypes = ArrowMeshFactory.ARROW_TYPES.filter((t) => t !== "none");

        arrowTypes.forEach((arrowType) => {
            test(`creates ${arrowType} arrow in 3D mode`, () => {
                const result = ArrowMeshFactory.create({
                    type: arrowType,
                    is2D: false,
                    size: 1,
                    color: "#FF0000",
                });

                assert.isTrue(result.validation.isValid,
                    `${arrowType} validation failed: ${result.validation.errors.join(", ")}`);
                assert.isNotNull(result.mesh);
                assert.isNotNull(result.material);
                assert.equal(result.mesh.metadata.arrowType, arrowType);
            });

            test(`creates ${arrowType} arrow in 2D mode`, () => {
                const result = ArrowMeshFactory.create({
                    type: arrowType,
                    is2D: true,
                    size: 1,
                    color: "#00FF00",
                });

                assert.isTrue(result.validation.isValid,
                    `2D ${arrowType} validation failed: ${result.validation.errors.join(", ")}`);
                assert.isNotNull(result.mesh);
                assert.isNotNull(result.material);
                assert.equal(result.mesh.metadata.arrowType, arrowType);
                assert.isTrue(result.mesh.metadata.is2D);
            });
        });
    });

    // Test "none" type returns null
    describe("None Type Handling", () => {
        test("'none' type returns null mesh and material", () => {
            const result = ArrowMeshFactory.create({
                type: "none",
            });

            assert.isTrue(result.validation.isValid);
            assert.isNull(result.mesh);
            assert.isNull(result.material);
        });
    });

    // Test filled vs outline arrow categorization
    describe("Arrow Categorization", () => {
        describe("Filled Arrows (3D)", () => {
            ArrowMeshFactory.FILLED_ARROWS.forEach((arrowType) => {
                test(`${arrowType} is correctly identified as filled`, () => {
                    const result = ArrowMeshFactory.create({
                        type: arrowType,
                        is2D: false,
                    });

                    assert.isTrue(result.validation.isValid);
                    if (result.mesh) {
                        assert.isTrue(result.mesh.metadata.isFilled);
                        assert.equal(result.mesh.metadata.rendererType, "FilledArrowRenderer");
                        assert.equal(result.mesh.metadata.geometryPlane, "XZ");
                    }
                });
            });
        });

        describe("Outline Arrows (3D)", () => {
            ArrowMeshFactory.OUTLINE_ARROWS.forEach((arrowType) => {
                test(`${arrowType} is correctly identified as outline`, () => {
                    const result = ArrowMeshFactory.create({
                        type: arrowType,
                        is2D: false,
                    });

                    assert.isTrue(result.validation.isValid);
                    if (result.mesh) {
                        assert.isFalse(result.mesh.metadata.isFilled);
                        assert.equal(result.mesh.metadata.rendererType, "CustomLineRenderer");
                    }
                });
            });
        });
    });

    // Test geometry plane requirements
    describe("Geometry Plane Requirements", () => {
        test("3D filled arrows use XZ plane", () => {
            const result = ArrowMeshFactory.create({
                type: "normal",
                is2D: false,
            });

            assert.isTrue(result.validation.isValid);
            if (result.mesh) {
                assert.equal(result.mesh.metadata.geometryPlane, "XZ");
                assert.equal(result.mesh.metadata.faceNormal, "Y");
            }
        });

        test("2D filled arrows use XY plane", () => {
            const result = ArrowMeshFactory.create({
                type: "normal",
                is2D: true,
            });

            assert.isTrue(result.validation.isValid);
            if (result.mesh) {
                assert.equal(result.mesh.metadata.geometryPlane, "XY");
            }
        });
    });

    // Test material type based on mode
    describe("Material Type Validation", () => {
        test("3D arrows use ShaderMaterial", () => {
            const result = ArrowMeshFactory.create({
                type: "diamond",
                is2D: false,
            });

            assert.isTrue(result.validation.isValid);
            if (result.material) {
                assert.equal(result.material.metadata.materialType, "ShaderMaterial");
            }
        });

        test("2D arrows use StandardMaterial", () => {
            const result = ArrowMeshFactory.create({
                type: "diamond",
                is2D: true,
            });

            assert.isTrue(result.validation.isValid);
            if (result.material) {
                assert.equal(result.material.metadata.materialType, "StandardMaterial");
                assert.isTrue(result.material.metadata.disableLighting);
            }
        });
    });

    // Test vertex counts for filled arrows
    describe("Vertex Count Validation", () => {
        test("normal arrow has 3 vertices (triangle)", () => {
            const result = ArrowMeshFactory.create({
                type: "normal",
                is2D: false,
            });

            assert.isTrue(result.validation.isValid);
            if (result.mesh) {
                assert.equal(result.mesh.metadata.expectedVertexCount, 3);
            }
        });

        test("diamond arrow has 4 vertices", () => {
            const result = ArrowMeshFactory.create({
                type: "diamond",
                is2D: false,
            });

            assert.isTrue(result.validation.isValid);
            if (result.mesh) {
                assert.equal(result.mesh.metadata.expectedVertexCount, 4);
            }
        });

        test("dot arrow has 33 vertices (32 segments + center)", () => {
            const result = ArrowMeshFactory.create({
                type: "dot",
                is2D: false,
            });

            assert.isTrue(result.validation.isValid);
            if (result.mesh) {
                assert.equal(result.mesh.metadata.expectedVertexCount, 33);
            }
        });
    });

    // Test outline arrow path information
    describe("Outline Arrow Path Info", () => {
        test("open-normal has V-shape path (3 points, open)", () => {
            const result = ArrowMeshFactory.create({
                type: "open-normal",
                is2D: false,
            });

            assert.isTrue(result.validation.isValid);
            if (result.mesh) {
                assert.equal(result.mesh.metadata.pathPoints, 3);
                assert.isFalse(result.mesh.metadata.isClosed);
            }
        });

        test("open-dot has closed circle path", () => {
            const result = ArrowMeshFactory.create({
                type: "open-dot",
                is2D: false,
            });

            assert.isTrue(result.validation.isValid);
            if (result.mesh) {
                assert.equal(result.mesh.metadata.pathPoints, 33);
                assert.isTrue(result.mesh.metadata.isClosed);
            }
        });

        test("open-diamond has closed diamond path", () => {
            const result = ArrowMeshFactory.create({
                type: "open-diamond",
                is2D: false,
            });

            assert.isTrue(result.validation.isValid);
            if (result.mesh) {
                assert.equal(result.mesh.metadata.pathPoints, 5);
                assert.isTrue(result.mesh.metadata.isClosed);
            }
        });

        test("tee has 2-point perpendicular line", () => {
            const result = ArrowMeshFactory.create({
                type: "tee",
                is2D: false,
            });

            assert.isTrue(result.validation.isValid);
            if (result.mesh) {
                assert.equal(result.mesh.metadata.pathPoints, 2);
                assert.isFalse(result.mesh.metadata.isClosed);
            }
        });
    });

    // Test size variations
    describe("Size Variations", () => {
        const sizes = [0.5, 1, 1.5, 2, 3];

        sizes.forEach((size) => {
            test(`creates arrow with size ${size}`, () => {
                const result = ArrowMeshFactory.create({
                    type: "normal",
                    size: size,
                });

                assert.isTrue(result.validation.isValid);
                if (result.mesh) {
                    assert.equal(result.mesh.metadata.size, size);
                }
            });
        });
    });

    // Test color handling
    describe("Color Handling", () => {
        const colors = ["#FF0000", "#00FF00", "#0000FF", "#FFFFFF", "#000000"];

        colors.forEach((color) => {
            test(`creates arrow with color ${color}`, () => {
                const result = ArrowMeshFactory.create({
                    type: "diamond",
                    color: color,
                });

                assert.isTrue(result.validation.isValid);
                if (result.mesh) {
                    assert.equal(result.mesh.metadata.color, color);
                }
            });
        });
    });

    // Test opacity variations
    describe("Opacity Variations", () => {
        const opacities = [0.0, 0.25, 0.5, 0.75, 1.0];

        opacities.forEach((opacity) => {
            test(`creates arrow with opacity ${opacity}`, () => {
                const result = ArrowMeshFactory.create({
                    type: "normal",
                    opacity: opacity,
                });

                assert.isTrue(result.validation.isValid);
                if (result.mesh) {
                    assert.equal(result.mesh.visibility, opacity);
                }
            });
        });
    });

    // Test default values
    describe("Default Values", () => {
        test("applies default type (normal)", () => {
            const result = ArrowMeshFactory.create({});

            assert.isTrue(result.validation.isValid);
            if (result.mesh) {
                assert.equal(result.mesh.metadata.arrowType, "normal");
            }
        });

        test("applies default size (1)", () => {
            const result = ArrowMeshFactory.create({
                type: "normal",
            });

            assert.isTrue(result.validation.isValid);
            if (result.mesh) {
                assert.equal(result.mesh.metadata.size, 1);
            }
        });

        test("applies default color (#FFFFFF)", () => {
            const result = ArrowMeshFactory.create({
                type: "normal",
            });

            assert.isTrue(result.validation.isValid);
            if (result.mesh) {
                assert.equal(result.mesh.metadata.color, "#FFFFFF");
            }
        });

        test("applies default opacity (1)", () => {
            const result = ArrowMeshFactory.create({
                type: "normal",
            });

            assert.isTrue(result.validation.isValid);
            if (result.mesh) {
                assert.equal(result.mesh.visibility, 1);
            }
        });

        test("applies default is2D (false)", () => {
            const result = ArrowMeshFactory.create({
                type: "normal",
            });

            assert.isTrue(result.validation.isValid);
            if (result.mesh) {
                assert.isFalse(result.mesh.metadata.is2D);
            }
        });
    });

    // Test invalid type handling
    describe("Error Handling", () => {
        test("throws error for invalid arrow type", () => {
            assert.throws(() => {
                ArrowMeshFactory.create({
                    type: "invalid-arrow-type",
                });
            }, /Unknown arrow type/i);
        });
    });

    // Test shader properties for 3D filled arrows
    describe("3D Shader Properties", () => {
        test("filled arrows have correct shader uniforms", () => {
            const result = ArrowMeshFactory.create({
                type: "normal",
                is2D: false,
                size: 2,
                color: "#FF0000",
                opacity: 0.8,
            });

            assert.isTrue(result.validation.isValid);
            if (result.material) {
                assert.equal(result.material.metadata.shaderName, "filledArrow");

                const uniforms = result.material.metadata.uniforms as Record<string, unknown>;
                assert.isDefined(uniforms.size);
                assert.isDefined(uniforms.color);
                assert.isDefined(uniforms.opacity);
                assert.equal(uniforms.size, 2);
                assert.equal(uniforms.opacity, 0.8);
            }
        });

        test("filled arrows have lineDirection attribute for tangent billboarding", () => {
            const result = ArrowMeshFactory.create({
                type: "diamond",
                is2D: false,
            });

            assert.isTrue(result.validation.isValid);
            if (result.material) {
                const attributes = result.material.metadata.attributes as string[];
                assert.include(attributes, "lineDirection");
                assert.equal(result.material.metadata.thinInstanceAttribute, "lineDirection");
            }
        });
    });

    // Test shader properties for outline arrows
    describe("Outline Arrow Shader Properties", () => {
        test("outline arrows use customLine shader", () => {
            const result = ArrowMeshFactory.create({
                type: "open-normal",
                is2D: false,
            });

            assert.isTrue(result.validation.isValid);
            if (result.material) {
                assert.equal(result.material.metadata.shaderName, "customLine");
            }
        });

        test("outline arrows have thin width", () => {
            const result = ArrowMeshFactory.create({
                type: "tee",
                is2D: false,
                width: 1,
            });

            assert.isTrue(result.validation.isValid);
            if (result.material) {
                const uniforms = result.material.metadata.uniforms as Record<string, unknown>;
                // Outline arrows should use thin width (0.3 multiplier)
                assert.isBelow(uniforms.width as number, 1);
            }
        });
    });

    // Test 2D arrow specific properties
    describe("2D Arrow Properties", () => {
        test("2D arrows use emissive color", () => {
            const result = ArrowMeshFactory.create({
                type: "normal",
                is2D: true,
                color: "#00FF00",
            });

            assert.isTrue(result.validation.isValid);
            if (result.material) {
                assert.isTrue(result.material.wasMethodCalled("setEmissiveColor"));
            }
        });

        test("2D arrows have rotation metadata", () => {
            const result = ArrowMeshFactory.create({
                type: "diamond",
                is2D: true,
            });

            assert.isTrue(result.validation.isValid);
            if (result.mesh) {
                const rotation = result.mesh.metadata.rotation as {x: number, y: number, z: number};
                assert.equal(rotation.x, Math.PI / 2);
            }
        });
    });
});
