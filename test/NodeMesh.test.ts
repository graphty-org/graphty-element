import {InstancedMesh, Mesh, NullEngine, Scene, StandardMaterial} from "@babylonjs/core";
import {assert, beforeEach, describe, test} from "vitest";
import type {z} from "zod/v4";

import {NodeShapes} from "../src/config/NodeStyle";
import {PolyhedronType} from "../src/constants/meshConstants";
import {MeshCache} from "../src/MeshCache";
import {NodeMesh} from "../src/NodeMesh";

describe("NodeMesh", () => {
    let scene: Scene;
    let meshCache: MeshCache;

    beforeEach(() => {
        const engine = new NullEngine();
        scene = new Scene(engine);
        meshCache = new MeshCache();
    });

    describe("Shape Creation", () => {
        const shapeTests = [
            {shape: "box", expectedName: "box", sizeParam: "size"},
            {shape: "sphere", expectedName: "sphere", sizeParam: "diameter"},
            {shape: "cylinder", expectedName: "cylinder", sizeParam: "height", hasGoldenRatio: true},
            {shape: "cone", expectedName: "cylinder", sizeParam: "height", hasGoldenRatio: true},
            {shape: "capsule", expectedName: "capsule", noSizeParam: true},
            {shape: "torus", expectedName: "torus", noSizeParam: true},
            {shape: "torus-knot", expectedName: "tk", hasMultipliers: true},
            {shape: "tetrahedron", expectedName: "polyhedron", polyType: PolyhedronType.TETRAHEDRON},
            {shape: "octahedron", expectedName: "polyhedron", polyType: PolyhedronType.OCTAHEDRON},
            {shape: "dodecahedron", expectedName: "polyhedron", polyType: PolyhedronType.DODECAHEDRON},
            {shape: "icosahedron", expectedName: "polyhedron", polyType: PolyhedronType.ICOSAHEDRON},
            {shape: "rhombicuboctahedron", expectedName: "polyhedron", polyType: PolyhedronType.RHOMBICUBOCTAHEDRON},
            {shape: "triangular-prism", expectedName: "polyhedron", polyType: PolyhedronType.TRIANGULAR_PRISM},
            {shape: "pentagonal-prism", expectedName: "polyhedron", polyType: PolyhedronType.PENTAGONAL_PRISM},
            {shape: "hexagonal-prism", expectedName: "polyhedron", polyType: PolyhedronType.HEXAGONAL_PRISM},
            {shape: "square-pyramid", expectedName: "polyhedron", polyType: PolyhedronType.SQUARE_PYRAMID},
            {shape: "pentagonal-pyramid", expectedName: "polyhedron", polyType: PolyhedronType.PENTAGONAL_PYRAMID},
            {shape: "triangular-dipyramid", expectedName: "polyhedron", polyType: PolyhedronType.TRIANGULAR_DIPYRAMID},
            {shape: "pentagonal-dipyramid", expectedName: "polyhedron", polyType: PolyhedronType.PENTAGONAL_DIPYRAMID},
            {shape: "elongated-square-dipyramid", expectedName: "polyhedron", polyType: PolyhedronType.ELONGATED_SQUARE_DIPYRAMID},
            {shape: "elongated-pentagonal-dipyramid", expectedName: "polyhedron", polyType: PolyhedronType.ELONGATED_PENTAGONAL_DIPYRAMID},
            {shape: "elongated-pentagonal-cupola", expectedName: "polyhedron", polyType: PolyhedronType.ELONGATED_PENTAGONAL_CUPOLA},
            {shape: "goldberg", expectedName: "goldberg"},
            {shape: "icosphere", expectedName: "icosphere", hasRadiusMultiplier: true},
            {shape: "geodesic", expectedName: "geodesic"},
        ];

        test.each(shapeTests)("creates $shape shape correctly", ({shape, expectedName}) => {
            const mesh = NodeMesh.createMeshWithoutCache(
                {styleId: "test", is2D: false, size: 2},
                {shape: {type: shape as z.infer<typeof NodeShapes>, size: 2}},
            );

            assert.instanceOf(mesh, Mesh);
            assert.equal(mesh.name, expectedName);
        });

        test("throws error for unknown shape", () => {
            assert.throws(
                () => NodeMesh.createMeshWithoutCache(
                    {styleId: "test", is2D: false, size: 1},
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    {shape: {type: "unknown-shape" as any, size: 1}},
                ),
                "unknown shape: unknown-shape",
            );
        });

        test("throws error when shape is not provided", () => {
            assert.throws(
                () => NodeMesh.createMeshWithoutCache(
                    {styleId: "test", is2D: false, size: 1},
                    {},
                ),
                "shape with type required to create mesh",
            );
        });

        test("uses shape size over default size", () => {
            const mesh = NodeMesh.createMeshWithoutCache(
                {styleId: "test", is2D: false, size: 1},
                {shape: {type: "box", size: 3}},
            );

            assert.equal(mesh.name, "box");
        });

        test("falls back to default size when shape size is not provided", () => {
            const mesh = NodeMesh.createMeshWithoutCache(
                {styleId: "test", is2D: false, size: 2},
                {shape: {type: "box"}},
            );

            assert.equal(mesh.name, "box");
        });
    });

    describe("Material Creation", () => {
        test("creates 2D material with emissive color", () => {
            const mesh = NodeMesh.create(
                meshCache,
                {styleId: "test-2d", is2D: true, size: 1},
                {
                    shape: {type: "box", size: 1},
                    texture: {color: "#FF0000"},
                },
            );

            const material = mesh.material as StandardMaterial;
            assert.isTrue(material.disableLighting);
            assert.deepEqual(material.emissiveColor.toHexString(), "#FF0000");
        });

        test("creates 3D material with diffuse color", () => {
            const mesh = NodeMesh.create(
                meshCache,
                {styleId: "test-3d", is2D: false, size: 1},
                {
                    shape: {type: "box", size: 1},
                    texture: {color: "#00FF00"},
                },
            );

            const material = mesh.material as StandardMaterial;
            assert.isFalse(material.disableLighting);
            assert.deepEqual(material.diffuseColor.toHexString(), "#00FF00");
        });

        test("handles color string format", () => {
            const mesh = NodeMesh.create(
                meshCache,
                {styleId: "test-color-string", is2D: false, size: 1},
                {
                    shape: {type: "box", size: 1},
                    texture: {color: "#123456"},
                },
            );

            const material = mesh.material as StandardMaterial;
            assert.deepEqual(material.diffuseColor.toHexString(), "#123456");
        });

        test("handles color object format", () => {
            const mesh = NodeMesh.create(
                meshCache,
                {styleId: "test-color-object", is2D: false, size: 1},
                {
                    shape: {type: "box", size: 1},
                    texture: {color: {colorType: "solid", value: "#ABCDEF"}},
                },
            );

            const material = mesh.material as StandardMaterial;
            assert.deepEqual(material.diffuseColor.toHexString(), "#ABCDEF");
        });

        test("fixes double ## typo in color", () => {
            const mesh = NodeMesh.create(
                meshCache,
                {styleId: "test-typo", is2D: false, size: 1},
                {
                    shape: {type: "box", size: 1},
                    texture: {color: "##FFFFFF"},
                },
            );

            const material = mesh.material as StandardMaterial;
            assert.deepEqual(material.diffuseColor.toHexString(), "#FFFFFF");
        });

        test("applies wireframe effect", () => {
            const mesh = NodeMesh.create(
                meshCache,
                {styleId: "test-wireframe", is2D: false, size: 1},
                {
                    shape: {type: "box", size: 1},
                    effect: {wireframe: true},
                },
            );

            const material = mesh.material as StandardMaterial;
            assert.isTrue(material.wireframe);
        });

        test("wireframe defaults to false", () => {
            const mesh = NodeMesh.create(
                meshCache,
                {styleId: "test-no-wireframe", is2D: false, size: 1},
                {
                    shape: {type: "box", size: 1},
                },
            );

            const material = mesh.material as StandardMaterial;
            assert.isFalse(material.wireframe);
        });

        test("sets mesh visibility from opacity", () => {
            const mesh = NodeMesh.create(
                meshCache,
                {styleId: "test-opacity", is2D: false, size: 1},
                {
                    shape: {type: "box", size: 1},
                    texture: {color: {colorType: "solid", value: "#FF0000", opacity: 0.5}},
                },
            );

            assert.equal(mesh.visibility, 0.5);
        });

        test("material is frozen", () => {
            const mesh = NodeMesh.create(
                meshCache,
                {styleId: "test-frozen", is2D: false, size: 1},
                {
                    shape: {type: "box", size: 1},
                },
            );

            const material = mesh.material as StandardMaterial;
            assert.isTrue(material.isFrozen);
        });
    });

    describe("Caching", () => {
        test("returns cached mesh for same styleId", () => {
            const options = {styleId: "cached-style", is2D: false, size: 1};
            const createOptions = {shape: {type: "box" as const, size: 1}};

            const mesh1 = NodeMesh.create(meshCache, options, createOptions);
            const mesh2 = NodeMesh.create(meshCache, options, createOptions);

            // Both should be instances from the same source mesh
            const instance1 = mesh1 as InstancedMesh;
            const instance2 = mesh2 as InstancedMesh;
            assert.equal(instance1.sourceMesh, instance2.sourceMesh);
        });

        test("creates new mesh for different styleId", () => {
            const createOptions = {shape: {type: "box" as const, size: 1}};

            const mesh1 = NodeMesh.create(
                meshCache,
                {styleId: "style1", is2D: false, size: 1},
                createOptions,
            );
            const mesh2 = NodeMesh.create(
                meshCache,
                {styleId: "style2", is2D: false, size: 1},
                createOptions,
            );

            assert.notStrictEqual(mesh1, mesh2);
        });

        test("handles 2D vs 3D cache keys", () => {
            const createOptions = {shape: {type: "box" as const, size: 1}};

            const mesh2D = NodeMesh.create(
                meshCache,
                {styleId: "same-style", is2D: true, size: 1},
                createOptions,
            );
            const mesh3D = NodeMesh.create(
                meshCache,
                {styleId: "same-style", is2D: false, size: 1},
                createOptions,
            );

            assert.notStrictEqual(mesh2D, mesh3D);
        });
    });

    describe("Shape Registry", () => {
        test("can register custom shape creator", () => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const customCreator = (_size: number): Mesh => {
                return new Mesh("custom-shape", scene);
            };

            NodeMesh.registerShapeCreator("custom", customCreator);

            const mesh = NodeMesh.createMeshWithoutCache(
                {styleId: "test", is2D: false, size: 2},
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                {shape: {type: "custom" as any, size: 2}},
            );

            assert.equal(mesh.name, "custom-shape");
        });
    });
});
