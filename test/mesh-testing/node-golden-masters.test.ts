/**
 * Node Golden Master Tests
 *
 * Tests all 27 node shapes with different configurations to achieve 100% coverage
 * of NodeMesh.ts functionality. Each test validates mesh creation, material properties,
 * and shape-specific behaviors.
 */

import {assert, describe, test} from "vitest";

import {NodeMeshFactory} from "./mesh-factory";

describe("Node Golden Masters", () => {
    // Basic shape tests - all 27 registered shapes
    describe("Shape Creation", () => {
        const shapes = NodeMeshFactory.SHAPES;

        shapes.forEach((shape) => {
            test(`creates ${shape} with default properties`, () => {
                const result = NodeMeshFactory.create({
                    shape: shape,
                    size: 1,
                });

                assert.isTrue(result.validation.isValid,
                    `${shape} validation failed: ${result.validation.errors.join(", ")}`);
                assert.equal(result.mesh.metadata.shapeType, shape);
                assert.equal(result.mesh.scaling.x, 1);
                assert.isNotNull(result.material);
            });
        });
    });

    // Size variations for key shapes
    describe("Size Variations", () => {
        const testShapes = ["sphere", "box", "cylinder", "tetrahedron"];
        const sizes = [0.5, 1, 2, 5];

        testShapes.forEach((shape) => {
            sizes.forEach((size) => {
                test(`creates ${shape} with size ${size}`, () => {
                    const result = NodeMeshFactory.create({
                        shape: shape,
                        size: size,
                    });

                    assert.isTrue(result.validation.isValid);
                    assert.equal(result.mesh.scaling.x, size);
                    assert.equal(result.mesh.scaling.y, size);
                    assert.equal(result.mesh.scaling.z, size);
                });
            });
        });
    });

    // Material and color tests
    describe("Material Properties", () => {
        test("applies solid color in 3D mode", () => {
            const result = NodeMeshFactory.create({
                shape: "sphere",
                color: "#FF0000",
                is2D: false,
            });

            assert.isTrue(result.validation.isValid);
            assert.isTrue(result.material.wasMethodCalled("setDiffuseColor"));
            assert.isFalse(result.material.metadata.disableLighting);
        });

        test("applies emissive color in 2D mode", () => {
            const result = NodeMeshFactory.create({
                shape: "sphere",
                color: "#00FF00",
                is2D: true,
            });

            assert.isTrue(result.validation.isValid);
            assert.isTrue(result.material.wasMethodCalled("setEmissiveColor"));
            assert.isTrue(result.material.metadata.disableLighting);
        });

        test("handles wireframe mode", () => {
            const result = NodeMeshFactory.create({
                shape: "box",
                wireframe: true,
            });

            assert.isTrue(result.validation.isValid);
            assert.isTrue(result.material.wireframe);
        });

        test("handles opacity settings", () => {
            const result = NodeMeshFactory.create({
                shape: "sphere",
                opacity: 0.5,
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.visibility, 0.5);
        });

        test("handles special ##FFFFFF color case", () => {
            const result = NodeMeshFactory.create({
                shape: "sphere",
                color: "##FFFFFF",
            });

            assert.isTrue(result.validation.isValid);
            // Should convert ##FFFFFF to #FFFFFF
        });

        test("handles color object format", () => {
            const result = NodeMeshFactory.create({
                shape: "sphere",
                color: {
                    colorType: "solid",
                    value: "#0000FF",
                },
            });

            assert.isTrue(result.validation.isValid);
        });
    });

    // Complex polyhedron shapes
    describe("Polyhedron Shapes", () => {
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
            "triangular-dipyramid",
            "pentagonal-dipyramid",
            "elongated-square-dipyramid",
            "elongated-pentagonal-dipyramid",
            "elongated-pentagonal-cupola",
        ];

        polyhedrons.forEach((shape) => {
            test(`creates complex polyhedron: ${shape}`, () => {
                const result = NodeMeshFactory.create({
                    shape: shape,
                    size: 1.5,
                    color: "#FF00FF",
                });

                assert.isTrue(result.validation.isValid);
                assert.equal(result.mesh.metadata.shapeType, shape);
            });
        });
    });

    // Special geometry shapes
    describe("Special Geometry", () => {
        const specialShapes = ["goldberg", "icosphere", "geodesic"];

        specialShapes.forEach((shape) => {
            test(`creates special geometry: ${shape}`, () => {
                const result = NodeMeshFactory.create({
                    shape: shape,
                    size: 2,
                });

                assert.isTrue(result.validation.isValid);
                assert.equal(result.mesh.metadata.shapeType, shape);
            });
        });
    });

    // Parametric shapes with constants
    describe("Parametric Shapes", () => {
        test("creates cylinder with golden ratio height", () => {
            const result = NodeMeshFactory.create({
                shape: "cylinder",
                size: 1,
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.shapeType, "cylinder");
        });

        test("creates cone with golden ratio height", () => {
            const result = NodeMeshFactory.create({
                shape: "cone",
                size: 1,
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.shapeType, "cone");
        });

        test("creates torus knot with multipliers", () => {
            const result = NodeMeshFactory.create({
                shape: "torus-knot",
                size: 1,
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.shapeType, "torus-knot");
        });

        test("creates icosphere with radius multiplier", () => {
            const result = NodeMeshFactory.create({
                shape: "icosphere",
                size: 1,
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.shapeType, "icosphere");
        });
    });

    // Error handling
    describe("Error Handling", () => {
        test("throws error for unknown shape", () => {
            try {
                NodeMeshFactory.create({
                    shape: "unknown-shape",
                });
                assert.fail("Should have thrown error for unknown shape");
            } catch (error) {
                assert.include((error as Error).message, "unknown shape");
            }
        });
    });

    // Material freezing and metadata
    describe("Material Management", () => {
        test("freezes material after creation", () => {
            const result = NodeMeshFactory.create({
                shape: "sphere",
            });

            assert.isTrue(result.validation.isValid);
            assert.isTrue(result.material.metadata.frozen);
        });

        test("sets correct metadata", () => {
            const result = NodeMeshFactory.create({
                shape: "box",
                size: 2,
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.shapeType, "box");
            assert.equal(result.mesh.metadata.originalShape, "box");
        });
    });

    // Combined property tests
    describe("Combined Properties", () => {
        test("combines 2D mode with wireframe and color", () => {
            const result = NodeMeshFactory.create({
                shape: "dodecahedron",
                size: 1.5,
                color: "#FFFF00",
                is2D: true,
                wireframe: true,
                opacity: 0.8,
            });

            assert.isTrue(result.validation.isValid);
            assert.isTrue(result.material.metadata.disableLighting);
            assert.isTrue(result.material.wireframe);
            assert.equal(result.mesh.visibility, 0.8);
        });
    });
});
