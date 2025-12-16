import {Mesh, NullEngine, Scene, ShaderMaterial, StandardMaterial} from "@babylonjs/core";
import {assert, beforeEach, describe, test} from "vitest";

import {MaterialHelper} from "../src/meshes/MaterialHelper";

describe("MaterialHelper", () => {
    let scene: Scene;

    beforeEach(() => {
        const engine = new NullEngine();
        scene = new Scene(engine);
    });

    describe("apply2DMaterial", () => {
        test("creates StandardMaterial and rotates to XY plane", () => {
            const mesh = new Mesh("test", scene);
            MaterialHelper.apply2DMaterial(mesh, "#ff0000", 0.8, scene);

            assert(mesh.material instanceof StandardMaterial);
            assert.strictEqual(mesh.rotation.x, Math.PI / 2);
            assert.strictEqual(mesh.metadata.is2D, true);
        });

        test("applies correct color to material", () => {
            const mesh = new Mesh("test", scene);
            MaterialHelper.apply2DMaterial(mesh, "#ff0000", 1.0, scene);

            const material = mesh.material as StandardMaterial;
            assert.exists(material.emissiveColor);
            // Red color (1, 0, 0)
            assert.closeTo(material.emissiveColor.r, 1.0, 0.01);
            assert.closeTo(material.emissiveColor.g, 0.0, 0.01);
            assert.closeTo(material.emissiveColor.b, 0.0, 0.01);
        });

        test("applies correct opacity to material", () => {
            const mesh = new Mesh("test", scene);
            MaterialHelper.apply2DMaterial(mesh, "#00ff00", 0.5, scene);

            const material = mesh.material as StandardMaterial;
            assert.closeTo(material.alpha, 0.5, 0.01);
        });

        test("handles different colors correctly", () => {
            const mesh = new Mesh("test", scene);
            MaterialHelper.apply2DMaterial(mesh, "#0000ff", 1.0, scene);

            const material = mesh.material as StandardMaterial;
            // Blue color (0, 0, 1)
            assert.closeTo(material.emissiveColor.r, 0.0, 0.01);
            assert.closeTo(material.emissiveColor.g, 0.0, 0.01);
            assert.closeTo(material.emissiveColor.b, 1.0, 0.01);
        });
    });

    describe("apply3DMaterial", () => {
        test("delegates to FilledArrowRenderer and creates ShaderMaterial", () => {
            // Use a simple mesh instead of createTriangle for this test
            const mesh = new Mesh("test", scene);
            MaterialHelper.apply3DMaterial(mesh, {size: 1.0, color: "#ff0000"}, scene);

            assert(mesh.material instanceof ShaderMaterial);
        });

        test("applies correct shader properties", () => {
            const mesh = new Mesh("test", scene);
            MaterialHelper.apply3DMaterial(
                mesh,
                {size: 2.0, color: "#00ff00", opacity: 0.7},
                scene,
            );

            const material = mesh.material as ShaderMaterial;
            assert.exists(material);
            assert.strictEqual(material.backFaceCulling, false);
        });
    });
});
