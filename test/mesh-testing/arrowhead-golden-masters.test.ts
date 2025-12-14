/**
 * Arrowhead Golden Master Tests
 *
 * Tests all 15 arrow types with geometry validation, material properties,
 * and 2D/3D mode variations to achieve 100% coverage of FilledArrowRenderer.ts
 * and arrow-related code in EdgeMesh.ts.
 */

import {assert, describe, test} from "vitest";

import {ArrowMeshFactory} from "./mesh-factory";

describe("Arrowhead Golden Masters", () => {
    // ============================================
    // Section 4.2: Filled Arrow Geometry Tests
    // ============================================
    describe("Filled Arrow Geometry (3D)", () => {
        describe("Triangle Arrows", () => {
            test("normal arrow creates triangle pointing toward target", () => {
                const result = ArrowMeshFactory.create({
                    type: "normal",
                    is2D: false,
                    size: 1,
                    color: "#FF0000",
                });

                assert.isTrue(result.validation.isValid,
                    `Validation failed: ${result.validation.errors.join(", ")}`);
                if (result.mesh) {
                    assert.equal(result.mesh.metadata.arrowType, "normal");
                    assert.isTrue(result.mesh.metadata.isFilled);
                    assert.equal(result.mesh.metadata.geometryPlane, "XZ");
                    assert.equal(result.mesh.metadata.expectedVertexCount, 3);
                }
            });

            test("inverted arrow creates triangle pointing away from target", () => {
                const result = ArrowMeshFactory.create({
                    type: "inverted",
                    is2D: false,
                    size: 1,
                    color: "#FF0000",
                });

                assert.isTrue(result.validation.isValid);
                if (result.mesh) {
                    assert.equal(result.mesh.metadata.arrowType, "inverted");
                    assert.isTrue(result.mesh.metadata.isFilled);
                    assert.equal(result.mesh.metadata.expectedVertexCount, 3);
                }
            });
        });

        describe("Diamond Arrow", () => {
            test("diamond arrow creates 4-vertex rhombus", () => {
                const result = ArrowMeshFactory.create({
                    type: "diamond",
                    is2D: false,
                    size: 1,
                    color: "#00FF00",
                });

                assert.isTrue(result.validation.isValid);
                if (result.mesh) {
                    assert.equal(result.mesh.metadata.arrowType, "diamond");
                    assert.isTrue(result.mesh.metadata.isFilled);
                    assert.equal(result.mesh.metadata.geometryPlane, "XZ");
                    assert.equal(result.mesh.metadata.expectedVertexCount, 4);
                }
            });
        });

        describe("Box Arrow", () => {
            test("box arrow creates 4-vertex rectangle", () => {
                const result = ArrowMeshFactory.create({
                    type: "box",
                    is2D: false,
                    size: 1,
                    color: "#0000FF",
                });

                assert.isTrue(result.validation.isValid);
                if (result.mesh) {
                    assert.equal(result.mesh.metadata.arrowType, "box");
                    assert.isTrue(result.mesh.metadata.isFilled);
                    assert.equal(result.mesh.metadata.geometryPlane, "XZ");
                    assert.equal(result.mesh.metadata.expectedVertexCount, 4);
                }
            });
        });

        describe("Dot Arrow", () => {
            test("dot arrow creates circle with 32+ vertices", () => {
                const result = ArrowMeshFactory.create({
                    type: "dot",
                    is2D: false,
                    size: 1,
                    color: "#FFFF00",
                });

                assert.isTrue(result.validation.isValid);
                if (result.mesh) {
                    assert.equal(result.mesh.metadata.arrowType, "dot");
                    assert.isTrue(result.mesh.metadata.isFilled);
                    assert.equal(result.mesh.metadata.geometryPlane, "XZ");
                    assert.isAtLeast(result.mesh.metadata.expectedVertexCount as number, 32);
                }
            });
        });

        describe("XZ Plane Requirement (CRITICAL)", () => {
            const filledTypes = ArrowMeshFactory.FILLED_ARROWS;

            filledTypes.forEach((arrowType) => {
                test(`${arrowType} uses XZ plane geometry (Y=0)`, () => {
                    const result = ArrowMeshFactory.create({
                        type: arrowType,
                        is2D: false,
                    });

                    assert.isTrue(result.validation.isValid);
                    if (result.mesh) {
                        assert.equal(result.mesh.metadata.geometryPlane, "XZ", `${arrowType} MUST use XZ plane for tangent billboarding to work`);
                    }
                });

                test(`${arrowType} has face normal in ±Y direction`, () => {
                    const result = ArrowMeshFactory.create({
                        type: arrowType,
                        is2D: false,
                    });

                    assert.isTrue(result.validation.isValid);
                    if (result.mesh) {
                        assert.equal(result.mesh.metadata.faceNormal, "Y", `${arrowType} face normal must be in ±Y for camera-facing`);
                    }
                });
            });
        });
    });

    // ============================================
    // Section 4.3: Outline Arrow Geometry Tests
    // ============================================
    describe("Outline Arrow Geometry (3D)", () => {
        describe("Open-Normal (Hollow Triangle)", () => {
            test("open-normal creates V-shape path", () => {
                const result = ArrowMeshFactory.create({
                    type: "open-normal",
                    is2D: false,
                    size: 1,
                    color: "#FF0000",
                });

                assert.isTrue(result.validation.isValid);
                if (result.mesh) {
                    assert.equal(result.mesh.metadata.arrowType, "open-normal");
                    assert.isFalse(result.mesh.metadata.isFilled);
                    assert.equal(result.mesh.metadata.rendererType, "CustomLineRenderer");
                    assert.equal(result.mesh.metadata.pathPoints, 3);
                    assert.isFalse(result.mesh.metadata.isClosed);
                }
            });
        });

        describe("Open-Dot (Circle Outline)", () => {
            test("open-dot creates closed circle path", () => {
                const result = ArrowMeshFactory.create({
                    type: "open-dot",
                    is2D: false,
                    size: 1,
                    color: "#00FF00",
                });

                assert.isTrue(result.validation.isValid);
                if (result.mesh) {
                    assert.equal(result.mesh.metadata.arrowType, "open-dot");
                    assert.isFalse(result.mesh.metadata.isFilled);
                    assert.equal(result.mesh.metadata.rendererType, "CustomLineRenderer");
                    assert.isAtLeast(result.mesh.metadata.pathPoints as number, 32);
                    assert.isTrue(result.mesh.metadata.isClosed);
                }
            });
        });

        describe("Open-Diamond (Diamond Outline)", () => {
            test("open-diamond creates closed diamond path", () => {
                const result = ArrowMeshFactory.create({
                    type: "open-diamond",
                    is2D: false,
                    size: 1,
                    color: "#0000FF",
                });

                assert.isTrue(result.validation.isValid);
                if (result.mesh) {
                    assert.equal(result.mesh.metadata.arrowType, "open-diamond");
                    assert.isFalse(result.mesh.metadata.isFilled);
                    assert.equal(result.mesh.metadata.pathPoints, 5);
                    assert.isTrue(result.mesh.metadata.isClosed);
                }
            });
        });

        describe("Tee (Perpendicular Line)", () => {
            test("tee creates single perpendicular segment", () => {
                const result = ArrowMeshFactory.create({
                    type: "tee",
                    is2D: false,
                    size: 1,
                    color: "#FF00FF",
                });

                assert.isTrue(result.validation.isValid);
                if (result.mesh) {
                    assert.equal(result.mesh.metadata.arrowType, "tee");
                    assert.isFalse(result.mesh.metadata.isFilled);
                    assert.equal(result.mesh.metadata.pathPoints, 2);
                    assert.isFalse(result.mesh.metadata.isClosed);
                }
            });
        });

        describe("Open (Chevron)", () => {
            test("open creates V-shape without base", () => {
                const result = ArrowMeshFactory.create({
                    type: "open",
                    is2D: false,
                    size: 1,
                    color: "#FFFF00",
                });

                assert.isTrue(result.validation.isValid);
                if (result.mesh) {
                    assert.equal(result.mesh.metadata.arrowType, "open");
                    assert.isFalse(result.mesh.metadata.isFilled);
                    assert.equal(result.mesh.metadata.pathPoints, 3);
                    assert.isFalse(result.mesh.metadata.isClosed);
                }
            });
        });

        describe("Half-Open (Asymmetric V)", () => {
            test("half-open creates asymmetric arrow", () => {
                const result = ArrowMeshFactory.create({
                    type: "half-open",
                    is2D: false,
                    size: 1,
                    color: "#00FFFF",
                });

                assert.isTrue(result.validation.isValid);
                if (result.mesh) {
                    assert.equal(result.mesh.metadata.arrowType, "half-open");
                    assert.isFalse(result.mesh.metadata.isFilled);
                }
            });
        });

        describe("Vee (Wide V)", () => {
            test("vee creates wide V-shape", () => {
                const result = ArrowMeshFactory.create({
                    type: "vee",
                    is2D: false,
                    size: 1,
                    color: "#FF8800",
                });

                assert.isTrue(result.validation.isValid);
                if (result.mesh) {
                    assert.equal(result.mesh.metadata.arrowType, "vee");
                    assert.isFalse(result.mesh.metadata.isFilled);
                    assert.equal(result.mesh.metadata.pathPoints, 3);
                }
            });
        });

        describe("Crow (Three-Prong Fork)", () => {
            test("crow creates three-pronged fork", () => {
                const result = ArrowMeshFactory.create({
                    type: "crow",
                    is2D: false,
                    size: 1,
                    color: "#8800FF",
                });

                assert.isTrue(result.validation.isValid);
                if (result.mesh) {
                    assert.equal(result.mesh.metadata.arrowType, "crow");
                    assert.isFalse(result.mesh.metadata.isFilled);
                    assert.isAtLeast(result.mesh.metadata.pathPoints as number, 5);
                }
            });
        });

        describe("Outline Arrows Use CustomLineRenderer", () => {
            const outlineTypes = ArrowMeshFactory.OUTLINE_ARROWS;

            outlineTypes.forEach((arrowType) => {
                test(`${arrowType} uses CustomLineRenderer shader`, () => {
                    const result = ArrowMeshFactory.create({
                        type: arrowType,
                        is2D: false,
                    });

                    assert.isTrue(result.validation.isValid);
                    if (result.mesh && result.material) {
                        assert.equal(result.mesh.metadata.rendererType, "CustomLineRenderer", `${arrowType} should use same shader as lines`);
                        assert.equal(result.material.metadata.shaderName, "customLine");
                    }
                });
            });
        });
    });

    // ============================================
    // Section 4.4: 3D Shader Property Tests
    // ============================================
    describe("3D Arrow Shader Properties", () => {
        describe("Tangent Billboarding Shader (Filled Arrows)", () => {
            test("filled arrows use ShaderMaterial", () => {
                const result = ArrowMeshFactory.create({
                    type: "normal",
                    is2D: false,
                });

                assert.isTrue(result.validation.isValid);
                if (result.material) {
                    assert.equal(result.material.metadata.materialType, "ShaderMaterial");
                    assert.equal(result.material.metadata.shaderName, "filledArrow");
                }
            });

            test("shader has required uniforms", () => {
                const result = ArrowMeshFactory.create({
                    type: "diamond",
                    is2D: false,
                    size: 2,
                    color: "#FF0000",
                    opacity: 0.8,
                });

                assert.isTrue(result.validation.isValid);
                if (result.material) {
                    const uniforms = result.material.metadata.uniforms as Record<string, unknown>;
                    assert.isDefined(uniforms.size);
                    assert.isDefined(uniforms.color);
                    assert.isDefined(uniforms.opacity);
                    assert.equal(uniforms.size, 2);
                    assert.equal(uniforms.opacity, 0.8);
                }
            });

            test("shader has lineDirection attribute for tangent billboarding", () => {
                const result = ArrowMeshFactory.create({
                    type: "box",
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

        describe("CustomLineRenderer Shader (Outline Arrows)", () => {
            test("outline arrows use customLine shader", () => {
                const result = ArrowMeshFactory.create({
                    type: "open-normal",
                    is2D: false,
                });

                assert.isTrue(result.validation.isValid);
                if (result.material) {
                    assert.equal(result.material.metadata.materialType, "ShaderMaterial");
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
    });

    // ============================================
    // Section 4.5: 2D Arrow Tests
    // ============================================
    describe("2D Arrow Properties", () => {
        describe("StandardMaterial Usage", () => {
            const allArrowTypes = ArrowMeshFactory.ARROW_TYPES.filter((t) => t !== "none");

            allArrowTypes.forEach((arrowType) => {
                test(`2D ${arrowType} uses StandardMaterial`, () => {
                    const result = ArrowMeshFactory.create({
                        type: arrowType,
                        is2D: true,
                        color: "#FF0000",
                    });

                    assert.isTrue(result.validation.isValid);
                    if (result.material) {
                        assert.equal(result.material.metadata.materialType, "StandardMaterial");
                    }
                });
            });
        });

        describe("XY Plane Geometry", () => {
            const filledTypes = ArrowMeshFactory.FILLED_ARROWS;

            filledTypes.forEach((arrowType) => {
                test(`2D ${arrowType} uses XY plane with rotation`, () => {
                    const result = ArrowMeshFactory.create({
                        type: arrowType,
                        is2D: true,
                    });

                    assert.isTrue(result.validation.isValid);
                    if (result.mesh) {
                        assert.equal(result.mesh.metadata.geometryPlane, "XY");
                        const rotation = result.mesh.metadata.rotation as {x: number, y: number, z: number};
                        assert.equal(rotation.x, Math.PI / 2);
                    }
                });
            });
        });

        describe("Emissive Color (Unlit)", () => {
            test("2D arrows use emissive color", () => {
                const result = ArrowMeshFactory.create({
                    type: "normal",
                    is2D: true,
                    color: "#00FF00",
                });

                assert.isTrue(result.validation.isValid);
                if (result.material) {
                    assert.isTrue(result.material.metadata.disableLighting);
                    assert.isTrue(result.material.wasMethodCalled("setEmissiveColor"));
                }
            });
        });

        describe("Alpha/Opacity", () => {
            test("2D arrows apply alpha correctly", () => {
                const result = ArrowMeshFactory.create({
                    type: "diamond",
                    is2D: true,
                    opacity: 0.7,
                });

                assert.isTrue(result.validation.isValid);
                if (result.material) {
                    assert.equal(result.material.alpha, 0.7);
                }
            });
        });
    });

    // ============================================
    // Section 4.6: Size and Property Variation Tests
    // ============================================
    describe("Arrow Size Variations", () => {
        const sizes = [0.5, 1, 1.5, 2, 3, 5];
        const testShapes = ["normal", "diamond", "dot", "open-normal", "tee"];

        testShapes.forEach((shape) => {
            describe(`${shape} size variations`, () => {
                sizes.forEach((size) => {
                    test(`creates ${shape} with size ${size}`, () => {
                        const result = ArrowMeshFactory.create({
                            type: shape,
                            size: size,
                        });

                        assert.isTrue(result.validation.isValid);
                        if (result.mesh) {
                            assert.equal(result.mesh.metadata.size, size);

                            if (!ArrowMeshFactory.OUTLINE_ARROWS.includes(shape) && result.material) {
                                const uniforms = result.material.metadata.uniforms as Record<string, unknown>;
                                assert.equal(uniforms.size, size);
                            }
                        }
                    });
                });
            });
        });
    });

    describe("Arrow Color Variations", () => {
        const colors = ["#FF0000", "#00FF00", "#0000FF", "#FFFFFF", "#000000", "#FFFF00"];

        colors.forEach((color) => {
            test(`creates arrow with color ${color}`, () => {
                const result = ArrowMeshFactory.create({
                    type: "normal",
                    color: color,
                });

                assert.isTrue(result.validation.isValid);
                if (result.mesh) {
                    assert.equal(result.mesh.metadata.color, color);
                }
            });
        });
    });

    describe("Arrow Opacity Variations", () => {
        const opacities = [0.0, 0.25, 0.5, 0.75, 1.0];

        opacities.forEach((opacity) => {
            test(`creates arrow with opacity ${opacity}`, () => {
                const result = ArrowMeshFactory.create({
                    type: "diamond",
                    opacity: opacity,
                });

                assert.isTrue(result.validation.isValid);
                if (result.mesh) {
                    assert.equal(result.mesh.visibility, opacity);
                }
            });
        });
    });

    // ============================================
    // Section 4.7: None Type and Error Handling
    // ============================================
    describe("None Type and Error Handling", () => {
        test("'none' type returns null mesh", () => {
            const result = ArrowMeshFactory.create({
                type: "none",
            });

            assert.isTrue(result.validation.isValid);
            assert.isNull(result.mesh);
            assert.isNull(result.material);
        });

        test("missing type defaults to 'normal'", () => {
            const result = ArrowMeshFactory.create({});

            assert.isTrue(result.validation.isValid);
            if (result.mesh) {
                assert.equal(result.mesh.metadata.arrowType, "normal");
            }
        });

        test("invalid type throws error", () => {
            assert.throws(() => {
                ArrowMeshFactory.create({
                    type: "invalid-arrow-type",
                });
            }, /unknown arrow type/i);
        });
    });

    // ============================================
    // Additional Comprehensive Tests
    // ============================================
    describe("All Arrow Types Complete Coverage", () => {
        const allArrowTypes = ArrowMeshFactory.ARROW_TYPES.filter((t) => t !== "none");

        allArrowTypes.forEach((arrowType) => {
            test(`${arrowType} arrow can be created in 3D mode with all properties`, () => {
                const result = ArrowMeshFactory.create({
                    type: arrowType,
                    is2D: false,
                    size: 1.5,
                    width: 0.5,
                    length: 0.3,
                    color: "#FF8800",
                    opacity: 0.8,
                });

                assert.isTrue(result.validation.isValid,
                    `${arrowType} 3D validation failed: ${result.validation.errors.join(", ")}`);
                assert.isNotNull(result.mesh);
                assert.isNotNull(result.material);
                assert.equal(result.mesh.metadata.arrowType, arrowType);
                assert.equal(result.mesh.metadata.size, 1.5);
                assert.equal(result.mesh.metadata.width, 0.5);
                assert.equal(result.mesh.metadata.length, 0.3);
                assert.equal(result.mesh.metadata.color, "#FF8800");
                assert.equal(result.mesh.metadata.opacity, 0.8);
            });

            test(`${arrowType} arrow can be created in 2D mode with all properties`, () => {
                const result = ArrowMeshFactory.create({
                    type: arrowType,
                    is2D: true,
                    size: 2,
                    width: 0.6,
                    length: 0.4,
                    color: "#00FFFF",
                    opacity: 0.9,
                });

                assert.isTrue(result.validation.isValid,
                    `${arrowType} 2D validation failed: ${result.validation.errors.join(", ")}`);
                assert.isNotNull(result.mesh);
                assert.isNotNull(result.material);
                assert.equal(result.mesh.metadata.arrowType, arrowType);
                assert.isTrue(result.mesh.metadata.is2D);
            });
        });
    });

    describe("Filled vs Outline Categorization", () => {
        test("all filled arrows are correctly categorized", () => {
            const expectedFilled = ["normal", "inverted", "diamond", "box", "dot"];
            assert.deepEqual(ArrowMeshFactory.FILLED_ARROWS.slice().sort(), expectedFilled.sort());
        });

        test("all outline arrows are correctly categorized", () => {
            const expectedOutline = ["open-normal", "open-dot", "open-diamond", "tee", "open", "half-open", "vee", "crow"];
            assert.deepEqual(ArrowMeshFactory.OUTLINE_ARROWS.slice().sort(), expectedOutline.sort());
        });

        test("all arrow types are accounted for", () => {
            const allTypes = ArrowMeshFactory.FILLED_ARROWS.concat(
                ArrowMeshFactory.OUTLINE_ARROWS,
                ArrowMeshFactory.SPHERE_ARROWS,
                ["none"],
            );
            const missingTypes = ArrowMeshFactory.ARROW_TYPES.filter((t) => !allTypes.includes(t));
            assert.isEmpty(missingTypes, `Missing arrow types: ${missingTypes.join(", ")}`);
        });
    });

    describe("Sphere-Dot Special Case", () => {
        test("sphere-dot is in SPHERE_ARROWS category", () => {
            assert.include(ArrowMeshFactory.SPHERE_ARROWS, "sphere-dot");
        });

        test("sphere-dot can be created", () => {
            const result = ArrowMeshFactory.create({
                type: "sphere-dot",
                is2D: false,
                size: 1,
                color: "#FF0000",
            });

            assert.isTrue(result.validation.isValid);
            if (result.mesh) {
                assert.equal(result.mesh.metadata.arrowType, "sphere-dot");
            }
        });
    });

    describe("Default Values Verification", () => {
        test("applies all default values when no options provided", () => {
            const result = ArrowMeshFactory.create({});

            assert.isTrue(result.validation.isValid);
            if (result.mesh) {
                assert.equal(result.mesh.metadata.arrowType, "normal");
                assert.equal(result.mesh.metadata.size, 1);
                assert.equal(result.mesh.metadata.width, 0.5);
                assert.equal(result.mesh.metadata.length, 0.3);
                assert.equal(result.mesh.metadata.color, "#FFFFFF");
                assert.equal(result.mesh.metadata.opacity, 1);
                assert.isFalse(result.mesh.metadata.is2D);
            }
        });
    });

    describe("Renderer Type Assignment", () => {
        test("filled 3D arrows use FilledArrowRenderer", () => {
            ArrowMeshFactory.FILLED_ARROWS.forEach((arrowType) => {
                const result = ArrowMeshFactory.create({
                    type: arrowType,
                    is2D: false,
                });

                assert.isTrue(result.validation.isValid);
                if (result.mesh) {
                    assert.equal(result.mesh.metadata.rendererType, "FilledArrowRenderer", `${arrowType} should use FilledArrowRenderer`);
                }
            });
        });

        test("outline 3D arrows use CustomLineRenderer", () => {
            ArrowMeshFactory.OUTLINE_ARROWS.forEach((arrowType) => {
                const result = ArrowMeshFactory.create({
                    type: arrowType,
                    is2D: false,
                });

                assert.isTrue(result.validation.isValid);
                if (result.mesh) {
                    assert.equal(result.mesh.metadata.rendererType, "CustomLineRenderer", `${arrowType} should use CustomLineRenderer`);
                }
            });
        });

        test("2D arrows use FilledArrowRenderer.create2DArrow", () => {
            ArrowMeshFactory.FILLED_ARROWS.forEach((arrowType) => {
                const result = ArrowMeshFactory.create({
                    type: arrowType,
                    is2D: true,
                });

                assert.isTrue(result.validation.isValid);
                if (result.mesh) {
                    assert.equal(result.mesh.metadata.rendererType, "FilledArrowRenderer.create2DArrow", `2D ${arrowType} should use FilledArrowRenderer.create2DArrow`);
                }
            });
        });
    });

    describe("Geometry Type Assignment", () => {
        test("outline arrows have quadStrip geometry type", () => {
            ArrowMeshFactory.OUTLINE_ARROWS.forEach((arrowType) => {
                const result = ArrowMeshFactory.create({
                    type: arrowType,
                    is2D: false,
                });

                assert.isTrue(result.validation.isValid);
                if (result.mesh) {
                    assert.equal(result.mesh.metadata.geometryType, "quadStrip", `${arrowType} should have quadStrip geometry type`);
                }
            });
        });
    });

    describe("Path Points for Outline Arrows", () => {
        const pathExpectations: Record<string, {points: number, closed: boolean}> = {
            "open-normal": {points: 3, closed: false},
            "open-dot": {points: 33, closed: true},
            "open-diamond": {points: 5, closed: true},
            "tee": {points: 2, closed: false},
            "open": {points: 3, closed: false},
            "half-open": {points: 3, closed: false},
            "vee": {points: 3, closed: false},
            "crow": {points: 7, closed: false},
        };

        Object.entries(pathExpectations).forEach(([arrowType, expected]) => {
            test(`${arrowType} has ${expected.points} path points and is ${expected.closed ? "closed" : "open"}`, () => {
                const result = ArrowMeshFactory.create({
                    type: arrowType,
                    is2D: false,
                });

                assert.isTrue(result.validation.isValid);
                if (result.mesh) {
                    assert.equal(result.mesh.metadata.pathPoints, expected.points);
                    assert.equal(result.mesh.metadata.isClosed, expected.closed);
                }
            });
        });
    });

    describe("Vertex Counts for Filled Arrows", () => {
        const vertexExpectations: Record<string, number> = {
            normal: 3,
            inverted: 3,
            diamond: 4,
            box: 4,
            dot: 33,
        };

        Object.entries(vertexExpectations).forEach(([arrowType, expectedCount]) => {
            test(`${arrowType} has ${expectedCount} vertices`, () => {
                const result = ArrowMeshFactory.create({
                    type: arrowType,
                    is2D: false,
                });

                assert.isTrue(result.validation.isValid);
                if (result.mesh) {
                    assert.equal(result.mesh.metadata.expectedVertexCount, expectedCount);
                }
            });
        });
    });
});
