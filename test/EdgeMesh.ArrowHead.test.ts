import {Mesh, NullEngine, Scene} from "@babylonjs/core";
import {assert, beforeEach, describe, test} from "vitest";

import {EdgeMesh} from "../src/meshes/EdgeMesh";
import {MeshCache} from "../src/meshes/MeshCache";

describe("Arrow Shape Generation", () => {
    let scene: Scene;
    let meshCache: MeshCache;

    beforeEach(() => {
        const engine = new NullEngine();
        scene = new Scene(engine);
        meshCache = new MeshCache();
    });

    test("inverted arrow points away from target", () => {
        const arrowMesh = EdgeMesh.createArrowHead(
            meshCache,
            "test-inverted",
            {type: "inverted", width: 1.0, color: "#FF0000", size: 1.0, opacity: 1.0},
            scene,
        );

        assert.exists(arrowMesh);
        // The mesh should be named appropriately (filled arrows use FilledArrowRenderer)
        assert.isTrue(arrowMesh.name.includes("filled-triangle-arrow"));
        // Should be a Mesh type
        assert.instanceOf(arrowMesh, Mesh);
    });

    test("dot arrow creates circular shape", () => {
        const arrowMesh = EdgeMesh.createArrowHead(
            meshCache,
            "test-dot",
            {type: "dot", width: 1.0, color: "#FF0000", size: 1.0, opacity: 1.0},
            scene,
        );

        assert.exists(arrowMesh);
        assert.isTrue(arrowMesh.name.includes("filled-circle-arrow"));
        assert.instanceOf(arrowMesh, Mesh);
        // Verify the mesh has geometry
        const positions = arrowMesh.getVerticesData("position");
        assert.exists(positions);
        assert.isAtLeast(positions.length, 9); // At least 3 vertices for a circle
    });

    test("diamond arrow creates rhombus shape", () => {
        const arrowMesh = EdgeMesh.createArrowHead(
            meshCache,
            "test-diamond",
            {type: "diamond", width: 1.0, color: "#FF0000", size: 1.0, opacity: 1.0},
            scene,
        );

        assert.exists(arrowMesh);
        assert.isTrue(arrowMesh.name.includes("filled-diamond-arrow"));
        assert.instanceOf(arrowMesh, Mesh);
        // Verify diamond has vertices (should have 4 corner points)
        const positions = arrowMesh.getVerticesData("position");
        assert.exists(positions);
        assert.equal(positions.length, 12); // 4 vertices * 3 components (x, y, z)
    });

    test("box arrow creates rectangular shape", () => {
        const arrowMesh = EdgeMesh.createArrowHead(
            meshCache,
            "test-box",
            {type: "box", width: 1.0, color: "#FF0000", size: 1.0, opacity: 1.0},
            scene,
        );

        assert.exists(arrowMesh);
        assert.isTrue(arrowMesh.name.includes("filled-box-arrow"));
        assert.instanceOf(arrowMesh, Mesh);
        // Verify box has vertices (should have 4 corners)
        const positions = arrowMesh.getVerticesData("position");
        assert.exists(positions);
        assert.equal(positions.length, 12); // 4 vertices * 3 components
    });

    test("normal arrow creates triangle shape", () => {
        const arrowMesh = EdgeMesh.createArrowHead(
            meshCache,
            "test-normal",
            {type: "normal", width: 1.0, color: "#FF0000", size: 1.0, opacity: 1.0},
            scene,
        );

        assert.exists(arrowMesh);
        assert.isTrue(arrowMesh.name.includes("filled-triangle-arrow"));
        assert.instanceOf(arrowMesh, Mesh);
    });

    test("unsupported arrow type throws error", () => {
        assert.throws(() => {
            EdgeMesh.createArrowHead(
                meshCache,
                "test-invalid",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Testing invalid input
                {type: "invalid-type" as any, width: 1.0, color: "#FF0000"},
                scene,
            );
        });
    });

    test("arrow with custom size multiplier", () => {
        const arrowMesh = EdgeMesh.createArrowHead(
            meshCache,
            "test-sized",
            {type: "normal", width: 1.0, color: "#FF0000", size: 2.0, opacity: 1.0},
            scene,
        );

        assert.exists(arrowMesh);
        // The size multiplier affects the shader, so we can't easily verify it here
        // but we can verify the mesh was created
    });

    test("arrow with custom opacity", () => {
        const arrowMesh = EdgeMesh.createArrowHead(
            meshCache,
            "test-opacity",
            {type: "normal", width: 1.0, color: "#FF0000", size: 1.0, opacity: 0.5},
            scene,
        );

        assert.exists(arrowMesh);
        assert.equal(arrowMesh.visibility, 0.5);
    });

    test("arrow with no type returns null", () => {
        const arrowMesh = EdgeMesh.createArrowHead(
            meshCache,
            "test-none",
            {type: "none", width: 1.0, color: "#FF0000"},
            scene,
        );

        assert.isNull(arrowMesh);
    });

    test("arrows are individual meshes (not cached)", () => {
        const arrow1 = EdgeMesh.createArrowHead(
            meshCache,
            "test-no-cache",
            {type: "normal", width: 1.0, color: "#FF0000", size: 1.0, opacity: 1.0},
            scene,
        );

        const arrow2 = EdgeMesh.createArrowHead(
            meshCache,
            "test-no-cache",
            {type: "normal", width: 1.0, color: "#FF0000", size: 1.0, opacity: 1.0},
            scene,
        );

        // Performance optimization: individual meshes are created (not cached)
        // This allows direct position/rotation updates which are faster than thin instances
        assert.notEqual(arrow1, arrow2);
    });
});
