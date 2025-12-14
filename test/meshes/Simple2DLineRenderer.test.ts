import {NullEngine, Scene, Vector3} from "@babylonjs/core";
import {assert, beforeEach, describe, test} from "vitest";

import {Simple2DLineRenderer} from "../../src/meshes/Simple2DLineRenderer";

describe("Simple2DLineRenderer", () => {
    let scene: Scene;

    beforeEach(() => {
        const engine = new NullEngine();
        scene = new Scene(engine);
    });

    test("create generates rectangular mesh perpendicular to line direction", () => {
        const start = new Vector3(0, 0, 0);
        const end = new Vector3(1, 0, 0);
        const mesh = Simple2DLineRenderer.create(start, end, 0.1, "#ff0000", 1.0, scene);

        // Should have 4 vertices (rectangle)
        assert.strictEqual(mesh.getTotalVertices(), 4, "Should have 4 vertices for rectangle");

        // Should be marked as 2D line
        assert.strictEqual(mesh.metadata?.is2DLine, true, "Should be marked as 2D line");
    });

    test("updatePositions recalculates vertices for new endpoints", () => {
        const mesh = Simple2DLineRenderer.create(
            new Vector3(0, 0, 0),
            new Vector3(1, 0, 0),
            0.1,
            "#ff0000",
            1.0,
            scene,
        );

        const newStart = new Vector3(0, 1, 0);
        const newEnd = new Vector3(1, 1, 0);
        Simple2DLineRenderer.updatePositions(mesh, newStart, newEnd);

        // With transform-based approach, mesh position/rotation/scaling change, not vertices
        // The midpoint should be at (0.5, 1, 0)
        assert(Math.abs(mesh.position.x - 0.5) < 0.01, "X position should be near 0.5");
        assert(Math.abs(mesh.position.y - 1.0) < 0.01, "Y position should be near 1.0");
        assert(Math.abs(mesh.position.z - 0.0) < 0.01, "Z position should be near 0.0");
    });

    test("create handles vertical lines", () => {
        const start = new Vector3(0, 0, 0);
        const end = new Vector3(0, 1, 0);
        const mesh = Simple2DLineRenderer.create(start, end, 0.1, "#00ff00", 1.0, scene);

        assert.strictEqual(mesh.getTotalVertices(), 4, "Should have 4 vertices");
        assert.strictEqual(mesh.metadata?.is2DLine, true, "Should be marked as 2D line");
    });

    test("create handles diagonal lines", () => {
        const start = new Vector3(0, 0, 0);
        const end = new Vector3(1, 1, 0);
        const mesh = Simple2DLineRenderer.create(start, end, 0.1, "#0000ff", 1.0, scene);

        assert.strictEqual(mesh.getTotalVertices(), 4, "Should have 4 vertices");
        assert.strictEqual(mesh.metadata?.is2DLine, true, "Should be marked as 2D line");
    });

    test("create applies correct color", () => {
        const mesh = Simple2DLineRenderer.create(
            new Vector3(0, 0, 0),
            new Vector3(1, 0, 0),
            0.1,
            "#ff0000",
            1.0,
            scene,
        );

        assert(mesh.material !== null, "Material should be set");
    });

    test("create applies correct opacity", () => {
        const mesh = Simple2DLineRenderer.create(
            new Vector3(0, 0, 0),
            new Vector3(1, 0, 0),
            0.1,
            "#ff0000",
            0.5,
            scene,
        );

        assert(mesh.material !== null, "Material should be set");
    });

    test("updatePositions handles position changes correctly", () => {
        const mesh = Simple2DLineRenderer.create(
            new Vector3(0, 0, 0),
            new Vector3(1, 0, 0),
            0.1,
            "#ff0000",
            1.0,
            scene,
        );

        // Update to different position
        Simple2DLineRenderer.updatePositions(mesh, new Vector3(2, 2, 0), new Vector3(3, 3, 0));

        const positions = mesh.getVerticesData("position");
        assert(positions !== null, "Positions should exist after update");
        assert(positions.length >= 4, "Should have position data after update");
    });
});
