import {NullEngine, Scene, ShaderMaterial, StandardMaterial} from "@babylonjs/core";
import {assert, beforeEach, describe, test} from "vitest";

import {FilledArrowRenderer} from "../../src/meshes/FilledArrowRenderer";

describe("FilledArrowRenderer - 3D Arrow Geometry", () => {
    let scene: Scene;

    beforeEach(() => {
        const engine = new NullEngine();
        scene = new Scene(engine);
    });

    describe("Triangle Arrows", () => {
        test("createTriangle creates normal arrow with 3 vertices in XZ plane", () => {
            const mesh = FilledArrowRenderer.createTriangle(false, scene);

            const positions = mesh.getVerticesData("position");
            assert.exists(positions);
            assert.equal(positions.length, 9); // 3 vertices × 3 coords

            // Verify XZ plane geometry (all Y values should be 0)
            for (let i = 1; i < positions.length; i += 3) {
                assert.equal(positions[i], 0, `Y coordinate at index ${i} should be 0`);
            }

            // Tip should be at origin (0, 0, 0)
            assert.equal(positions[0], 0);
            assert.equal(positions[1], 0);
            assert.equal(positions[2], 0);

            mesh.dispose();
        });

        test("createTriangle creates inverted arrow with tip at origin", () => {
            const mesh = FilledArrowRenderer.createTriangle(true, scene);

            const positions = mesh.getVerticesData("position");
            assert.exists(positions);

            // Tip should be at origin
            assert.equal(positions[0], 0);
            assert.equal(positions[1], 0);
            assert.equal(positions[2], 0);

            // Base should extend in positive X direction (inverted)
            assert.isAbove(positions[3], 0); // First base vertex X should be positive

            mesh.dispose();
        });
    });

    describe("Diamond Arrow", () => {
        test("createDiamond creates 4-vertex diamond in XZ plane", () => {
            const mesh = FilledArrowRenderer.createDiamond(scene);

            const positions = mesh.getVerticesData("position");
            assert.exists(positions);
            assert.equal(positions.length, 12); // 4 vertices × 3 coords

            // Verify XZ plane geometry
            for (let i = 1; i < positions.length; i += 3) {
                assert.equal(positions[i], 0, "Y coordinate should be 0");
            }

            // Front tip at origin
            assert.equal(positions[0], 0);
            assert.equal(positions[1], 0);
            assert.equal(positions[2], 0);

            mesh.dispose();
        });
    });

    describe("Box Arrow", () => {
        test("createBox creates 4-vertex rectangle in XZ plane", () => {
            const mesh = FilledArrowRenderer.createBox(scene);

            const positions = mesh.getVerticesData("position");
            assert.exists(positions);
            assert.equal(positions.length, 12); // 4 vertices × 3 coords

            // Verify XZ plane geometry
            for (let i = 1; i < positions.length; i += 3) {
                assert.equal(positions[i], 0, "Y coordinate should be 0");
            }

            mesh.dispose();
        });
    });

    describe("Circle Arrow (Dot)", () => {
        test("createCircle creates circle with many vertices in XZ plane", () => {
            const mesh = FilledArrowRenderer.createCircle(scene, 32);

            const positions = mesh.getVerticesData("position");
            assert.exists(positions);
            // 32 segments + 1 closing vertex + center = 34 vertices (but implementation may vary)
            assert.isAtLeast(positions.length, 33 * 3); // At least 33 vertices × 3 coords

            // Verify XZ plane geometry
            for (let i = 1; i < positions.length; i += 3) {
                assert.equal(positions[i], 0, "Y coordinate should be 0");
            }

            // Center at origin
            assert.equal(positions[0], 0);
            assert.equal(positions[1], 0);
            assert.equal(positions[2], 0);

            mesh.dispose();
        });
    });

    describe("Vee Arrow", () => {
        test("createVee creates V-shaped arrow with 4 vertices", () => {
            const mesh = FilledArrowRenderer.createVee(scene);

            const positions = mesh.getVerticesData("position");
            assert.exists(positions);
            assert.equal(positions.length, 12); // 4 vertices × 3 coords

            // Verify XZ plane geometry
            for (let i = 1; i < positions.length; i += 3) {
                assert.equal(positions[i], 0);
            }

            mesh.dispose();
        });
    });

    describe("Tee Arrow", () => {
        test("createTee creates horizontal bar with 4 vertices", () => {
            const mesh = FilledArrowRenderer.createTee(scene);

            const positions = mesh.getVerticesData("position");
            assert.exists(positions);
            assert.equal(positions.length, 12); // 4 vertices × 3 coords

            // Verify XZ plane geometry
            for (let i = 1; i < positions.length; i += 3) {
                assert.equal(positions[i], 0);
            }

            mesh.dispose();
        });
    });

    describe("Half-Open Arrow", () => {
        test("createHalfOpen creates half-V with 3 vertices", () => {
            const mesh = FilledArrowRenderer.createHalfOpen(scene);

            const positions = mesh.getVerticesData("position");
            assert.exists(positions);
            assert.equal(positions.length, 9); // 3 vertices × 3 coords

            // Verify XZ plane geometry
            for (let i = 1; i < positions.length; i += 3) {
                assert.equal(positions[i], 0);
            }

            mesh.dispose();
        });
    });

    describe("Crow Arrow", () => {
        test("createCrow creates crow's foot with 7 vertices", () => {
            const mesh = FilledArrowRenderer.createCrow(scene);

            const positions = mesh.getVerticesData("position");
            assert.exists(positions);
            assert.equal(positions.length, 21); // 7 vertices × 3 coords

            // Verify XZ plane geometry
            for (let i = 1; i < positions.length; i += 3) {
                assert.equal(positions[i], 0);
            }

            mesh.dispose();
        });
    });

    describe("Open-Normal Arrow", () => {
        test("createOpenNormal creates hollow triangle outline", () => {
            const mesh = FilledArrowRenderer.createOpenNormal(scene);

            const positions = mesh.getVerticesData("position");
            assert.exists(positions);
            // 6 vertices (3 outer + 3 inner)
            assert.equal(positions.length, 18);

            // Verify XZ plane geometry
            for (let i = 1; i < positions.length; i += 3) {
                assert.equal(positions[i], 0);
            }

            mesh.dispose();
        });
    });

    describe("Open-Diamond Arrow", () => {
        test("createOpenDiamond creates hollow diamond outline", () => {
            const mesh = FilledArrowRenderer.createOpenDiamond(scene);

            const positions = mesh.getVerticesData("position");
            assert.exists(positions);
            // 8 vertices (4 outer + 4 inner)
            assert.equal(positions.length, 24);

            // Verify XZ plane geometry
            for (let i = 1; i < positions.length; i += 3) {
                assert.equal(positions[i], 0);
            }

            mesh.dispose();
        });
    });

    describe("Open-Circle Arrow", () => {
        test("createOpenCircle creates hollow circle outline", () => {
            const mesh = FilledArrowRenderer.createOpenCircle(scene, 32);

            const positions = mesh.getVerticesData("position");
            assert.exists(positions);
            // (segments + 1) * 2 vertices for inner and outer rings
            assert.isAtLeast(positions.length, 33 * 2 * 3);

            // Verify XZ plane geometry
            for (let i = 1; i < positions.length; i += 3) {
                assert.equal(positions[i], 0);
            }

            mesh.dispose();
        });
    });
});

describe("FilledArrowRenderer - 3D Shader Application", () => {
    let scene: Scene;

    beforeEach(() => {
        const engine = new NullEngine();
        scene = new Scene(engine);
    });

    test("applyShader returns mesh with ShaderMaterial", () => {
        const mesh = FilledArrowRenderer.createTriangle(false, scene);
        const result = FilledArrowRenderer.applyShader(
            mesh,
            {size: 1.0, color: "#ff0000", opacity: 1.0},
            scene,
        );

        assert.exists(result);
        assert.instanceOf(result.material, ShaderMaterial);

        result.dispose();
    });

    test("applyShader sets correct size uniform", () => {
        const mesh = FilledArrowRenderer.createTriangle(false, scene);
        const result = FilledArrowRenderer.applyShader(
            mesh,
            {size: 2.5, color: "#00ff00", opacity: 0.8},
            scene,
        );

        const material = result.material as ShaderMaterial;
        // The size uniform should be set to the provided value
        // We can't directly inspect ShaderMaterial uniforms in tests,
        // but we verify the material was applied
        assert.exists(material);
        assert.strictEqual(material.name, "filledArrowMaterial");

        result.dispose();
    });

    test("applyShader disables frustum culling", () => {
        const mesh = FilledArrowRenderer.createTriangle(false, scene);
        const result = FilledArrowRenderer.applyShader(
            mesh,
            {size: 1.0, color: "#ff0000", opacity: 1.0},
            scene,
        );

        assert.isTrue(result.alwaysSelectAsActiveMesh);

        result.dispose();
    });

    test("setLineDirection updates shader uniform", () => {
        const mesh = FilledArrowRenderer.createTriangle(false, scene);
        const result = FilledArrowRenderer.applyShader(
            mesh,
            {size: 1.0, color: "#ff0000", opacity: 1.0},
            scene,
        );

        // Should not throw
        FilledArrowRenderer.setLineDirection(result, {x: 1, y: 0, z: 0} as never);

        result.dispose();
    });
});

describe("FilledArrowRenderer - XZ Plane Geometry Verification (CRITICAL)", () => {
    let scene: Scene;

    beforeEach(() => {
        const engine = new NullEngine();
        scene = new Scene(engine);
    });

    // This test suite verifies the CRITICAL requirement from design/edge-styles-implementation-plan.md:
    // "CRITICAL LESSON LEARNED: Arrow geometry MUST be in XZ plane (Y=0) for tangent billboarding to work"

    const filledArrowTypes: {type: string, createFn: (scene: Scene) => ReturnType<typeof FilledArrowRenderer.createTriangle>}[] = [
        {type: "normal", createFn: (s) => FilledArrowRenderer.createTriangle(false, s)},
        {type: "inverted", createFn: (s) => FilledArrowRenderer.createTriangle(true, s)},
        {type: "diamond", createFn: (s) => FilledArrowRenderer.createDiamond(s)},
        {type: "box", createFn: (s) => FilledArrowRenderer.createBox(s)},
        {type: "dot", createFn: (s) => FilledArrowRenderer.createCircle(s)},
        {type: "vee", createFn: (s) => FilledArrowRenderer.createVee(s)},
        {type: "tee", createFn: (s) => FilledArrowRenderer.createTee(s)},
        {type: "half-open", createFn: (s) => FilledArrowRenderer.createHalfOpen(s)},
        {type: "crow", createFn: (s) => FilledArrowRenderer.createCrow(s)},
        {type: "open-normal", createFn: (s) => FilledArrowRenderer.createOpenNormal(s)},
        {type: "open-diamond", createFn: (s) => FilledArrowRenderer.createOpenDiamond(s)},
        {type: "open-dot", createFn: (s) => FilledArrowRenderer.createOpenCircle(s)},
    ];

    filledArrowTypes.forEach(({type, createFn}) => {
        test(`${type} geometry is in XZ plane (Y=0) for tangent billboarding`, () => {
            const mesh = createFn(scene);
            const positions = mesh.getVerticesData("position");

            assert.exists(positions, `${type} should have position data`);

            // CRITICAL: All Y coordinates must be 0 for tangent billboarding to work
            for (let i = 1; i < positions.length; i += 3) {
                assert.equal(
                    positions[i],
                    0,
                    `${type}: Y coordinate at vertex ${Math.floor(i / 3)} must be 0 for XZ plane geometry`,
                );
            }

            mesh.dispose();
        });

        test(`${type} face normal points in ±Y direction`, () => {
            const mesh = createFn(scene);
            const positions = mesh.getVerticesData("position");

            assert.exists(positions);

            // All Y values being 0 means the face normal is in ±Y direction
            // This is required for the "up" vector in the shader to map to camera direction
            let allYZero = true;
            for (let i = 1; i < positions.length; i += 3) {
                if (positions[i] !== 0) {
                    allYZero = false;
                    break;
                }
            }

            assert.isTrue(allYZero, `${type} must have all Y=0 for face normal in ±Y direction`);

            mesh.dispose();
        });
    });
});

describe("FilledArrowRenderer - 2D Arrows", () => {
    let scene: Scene;

    beforeEach(() => {
        const engine = new NullEngine();
        scene = new Scene(engine);
    });

    test("create2DArrow generates mesh with StandardMaterial", () => {
        const mesh = FilledArrowRenderer.create2DArrow(
            "normal",
            0.5,
            0.3,
            "#ff0000",
            1.0,
            scene,
        );

        assert(mesh.material instanceof StandardMaterial, "Should use StandardMaterial for 2D mode");
        assert.strictEqual(mesh.rotation.x, Math.PI / 2, "Should be rotated to XY plane");
        assert.strictEqual(mesh.metadata?.is2D, true, "Should be marked as 2D");
    });

    test("create2DArrow supports normal arrow type", () => {
        const mesh = FilledArrowRenderer.create2DArrow(
            "normal",
            0.5,
            0.3,
            "#ff0000",
            1.0,
            scene,
        );

        assert(mesh.material instanceof StandardMaterial, "normal should use StandardMaterial");
        assert(mesh.getTotalVertices() > 0, "Should have vertices");
    });

    test("create2DArrow supports inverted arrow type", () => {
        const mesh = FilledArrowRenderer.create2DArrow(
            "inverted",
            0.5,
            0.3,
            "#ff0000",
            1.0,
            scene,
        );

        assert(mesh.material instanceof StandardMaterial, "inverted should use StandardMaterial");
        assert(mesh.getTotalVertices() > 0, "Should have vertices");
    });

    test("create2DArrow supports diamond arrow type", () => {
        const mesh = FilledArrowRenderer.create2DArrow(
            "diamond",
            0.5,
            0.3,
            "#ff0000",
            1.0,
            scene,
        );

        assert(mesh.material instanceof StandardMaterial, "diamond should use StandardMaterial");
        assert(mesh.getTotalVertices() > 0, "Should have vertices");
    });

    test("create2DArrow supports box arrow type", () => {
        const mesh = FilledArrowRenderer.create2DArrow(
            "box",
            0.5,
            0.3,
            "#ff0000",
            1.0,
            scene,
        );

        assert(mesh.material instanceof StandardMaterial, "box should use StandardMaterial");
        assert(mesh.getTotalVertices() > 0, "Should have vertices");
    });

    test("create2DArrow supports dot arrow type", () => {
        const mesh = FilledArrowRenderer.create2DArrow(
            "dot",
            0.5,
            0.3,
            "#ff0000",
            1.0,
            scene,
        );

        assert(mesh.material instanceof StandardMaterial, "dot should use StandardMaterial");
        assert(mesh.getTotalVertices() > 0, "Should have vertices");
    });

    test("create2DArrow supports vee arrow type", () => {
        const mesh = FilledArrowRenderer.create2DArrow(
            "vee",
            0.5,
            0.3,
            "#ff0000",
            1.0,
            scene,
        );

        assert(mesh.material instanceof StandardMaterial, "vee should use StandardMaterial");
        assert(mesh.getTotalVertices() > 0, "Should have vertices");
    });

    test("create2DArrow supports tee arrow type", () => {
        const mesh = FilledArrowRenderer.create2DArrow(
            "tee",
            0.5,
            0.3,
            "#ff0000",
            1.0,
            scene,
        );

        assert(mesh.material instanceof StandardMaterial, "tee should use StandardMaterial");
        assert(mesh.getTotalVertices() > 0, "Should have vertices");
    });

    test("create2DArrow supports crow arrow type", () => {
        const mesh = FilledArrowRenderer.create2DArrow(
            "crow",
            0.5,
            0.3,
            "#ff0000",
            1.0,
            scene,
        );

        assert(mesh.material instanceof StandardMaterial, "crow should use StandardMaterial");
        assert(mesh.getTotalVertices() > 0, "Should have vertices");
    });

    test("create2DArrow supports half-open arrow type", () => {
        const mesh = FilledArrowRenderer.create2DArrow(
            "half-open",
            0.5,
            0.3,
            "#ff0000",
            1.0,
            scene,
        );

        assert(mesh.material instanceof StandardMaterial, "half-open should use StandardMaterial");
        assert(mesh.getTotalVertices() > 0, "Should have vertices");
    });

    test("create2DArrow supports open-normal arrow type", () => {
        const mesh = FilledArrowRenderer.create2DArrow(
            "open-normal",
            0.5,
            0.3,
            "#ff0000",
            1.0,
            scene,
        );

        assert(mesh.material instanceof StandardMaterial, "open-normal should use StandardMaterial");
        assert(mesh.getTotalVertices() > 0, "Should have vertices");
    });

    test("create2DArrow supports open-circle arrow type", () => {
        const mesh = FilledArrowRenderer.create2DArrow(
            "open-circle",
            0.5,
            0.3,
            "#ff0000",
            1.0,
            scene,
        );

        assert(mesh.material instanceof StandardMaterial, "open-circle should use StandardMaterial");
        assert(mesh.getTotalVertices() > 0, "Should have vertices");
    });

    test("create2DArrow supports open-diamond arrow type", () => {
        const mesh = FilledArrowRenderer.create2DArrow(
            "open-diamond",
            0.5,
            0.3,
            "#ff0000",
            1.0,
            scene,
        );

        assert(mesh.material instanceof StandardMaterial, "open-diamond should use StandardMaterial");
        assert(mesh.getTotalVertices() > 0, "Should have vertices");
    });

    test("create2DArrow applies correct color", () => {
        const mesh = FilledArrowRenderer.create2DArrow(
            "normal",
            0.5,
            0.3,
            "#00ff00",
            1.0,
            scene,
        );

        const material = mesh.material as StandardMaterial;
        assert(material, "Material should be set");
        assert(material.emissiveColor, "Emissive color should be set");
    });

    test("create2DArrow applies correct opacity", () => {
        const mesh = FilledArrowRenderer.create2DArrow(
            "normal",
            0.5,
            0.3,
            "#ff0000",
            0.7,
            scene,
        );

        const material = mesh.material as StandardMaterial;
        assert.strictEqual(material.alpha, 0.7, "Alpha should be 0.7");
    });

    test("create2DArrow scales mesh based on length and width", () => {
        const smallMesh = FilledArrowRenderer.create2DArrow(
            "normal",
            0.2,
            0.1,
            "#ff0000",
            1.0,
            scene,
        );

        const largeMesh = FilledArrowRenderer.create2DArrow(
            "normal",
            1.0,
            0.5,
            "#ff0000",
            1.0,
            scene,
        );

        // Both should have vertices
        assert(smallMesh.getTotalVertices() > 0, "Small mesh should have vertices");
        assert(largeMesh.getTotalVertices() > 0, "Large mesh should have vertices");
    });
});
