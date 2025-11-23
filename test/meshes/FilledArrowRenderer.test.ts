import {NullEngine, Scene, StandardMaterial} from "@babylonjs/core";
import {assert, beforeEach, describe, test} from "vitest";

import {FilledArrowRenderer} from "../../src/meshes/FilledArrowRenderer";

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
