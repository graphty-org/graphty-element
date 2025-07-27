/**
 * Edge Golden Master Tests
 *
 * Tests all line types, arrow heads, animations, and edge configurations to achieve
 * 100% coverage of EdgeMesh.ts functionality. Validates GreasedLine creation,
 * arrow head generation, and animation texture handling.
 */

import {assert, describe, test} from "vitest";

import {EdgeMeshFactory} from "./mesh-factory";

describe("Edge Golden Masters", () => {
    // Line type tests - all 7 supported line types
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
                assert.equal(result.mesh.metadata.meshType, "greasedLine");
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

    // Dash patterns
    describe("Dash Patterns", () => {
        const dashTypes = ["dash", "dash-dot", "dots", "equal-dash"];

        dashTypes.forEach((dashType) => {
            test(`creates ${dashType} pattern`, () => {
                const result = EdgeMeshFactory.create({
                    type: dashType,
                    width: 2,
                    color: "#0000FF",
                });

                assert.isTrue(result.validation.isValid);
                assert.equal(result.mesh.metadata.lineType, dashType);
                // Should have dash array metadata for non-solid lines
                if (dashType !== "solid") {
                    assert.isDefined(result.mesh.metadata.dashArray);
                }
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
    });

    // Unit vector points validation
    describe("Geometry Validation", () => {
        test("uses correct unit vector points", () => {
            const result = EdgeMeshFactory.create({
                type: "solid",
                width: 1,
                color: "#000000",
            });

            assert.isTrue(result.validation.isValid);
            // Should use UNIT_VECTOR_POINTS from EdgeMesh
            assert.deepEqual(result.mesh.metadata.points, [0, 0, -0.5, 0, 0, 0.5]);
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
            assert.isTrue(result.mesh.metadata.hasAnimation);
            assert.isTrue(result.mesh.metadata.animationTexture);
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
