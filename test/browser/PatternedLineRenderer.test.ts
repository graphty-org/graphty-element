import {ArcRotateCamera, Engine, Scene, ShaderMaterial, StandardMaterial, Vector3} from "@babylonjs/core";
import {assert, test} from "vitest";

import {PatternedLineRenderer} from "../../src/meshes/PatternedLineRenderer";

// Setup helper
function createTestScene(): {scene: Scene, engine: Engine, cleanup: () => void} {
    const canvas = document.createElement("canvas");
    const engine = new Engine(canvas, false);
    const scene = new Scene(engine);
    const camera = new ArcRotateCamera("camera", 0, 0, 10, Vector3.Zero(), scene);
    scene.activeCamera = camera;

    const cleanup = (): void => {
        scene.dispose();
        engine.dispose();
    };

    return {scene, engine, cleanup};
}

test("createPatternMesh applies 2D material when is2DMode is true", () => {
    const {scene, cleanup} = createTestScene();

    try {
        const mesh = PatternedLineRenderer.createPatternMesh(
            "diamond",
            0.1,
            "#ff0000",
            1.0,
            scene,
            undefined,
            undefined,
            true, // is2DMode
        );

        // Should use StandardMaterial (2D)
        assert(mesh.material instanceof StandardMaterial, "Expected StandardMaterial for 2D mode");

        // Should be rotated to XY plane
        assert.strictEqual(mesh.rotation.x, Math.PI / 2, "Expected rotation to XY plane");

        // Should have is2D metadata
        assert.strictEqual(mesh.metadata.is2D, true, "Expected is2D metadata to be true");
    } finally {
        cleanup();
    }
});

test("createPatternMesh applies 3D shader when is2DMode is false", () => {
    const {scene, cleanup} = createTestScene();

    try {
        const mesh = PatternedLineRenderer.createPatternMesh(
            "diamond",
            0.1,
            "#ff0000",
            1.0,
            scene,
            undefined,
            undefined,
            false, // is2DMode
        );

        // Should use ShaderMaterial (3D)
        assert(mesh.material instanceof ShaderMaterial, "Expected ShaderMaterial for 3D mode");

        // Should NOT have is2D metadata
        assert.strictEqual(mesh.metadata?.is2D, undefined, "Expected is2D metadata to be undefined in 3D mode");
    } finally {
        cleanup();
    }
});

test("createPatternMesh applies 3D shader when is2DMode is undefined (default)", () => {
    const {scene, cleanup} = createTestScene();

    try {
        const mesh = PatternedLineRenderer.createPatternMesh(
            "diamond",
            0.1,
            "#ff0000",
            1.0,
            scene,
            undefined,
            undefined,
            // is2DMode not provided (undefined)
        );

        // Should use ShaderMaterial (3D) by default
        assert(mesh.material instanceof ShaderMaterial, "Expected ShaderMaterial for default (3D) mode");
    } finally {
        cleanup();
    }
});

test("createPatternMesh works with all pattern types in 2D mode", () => {
    const {scene, cleanup} = createTestScene();

    try {
        const patterns = ["dot", "star", "diamond", "box", "dash"] as const;

        for (const pattern of patterns) {
            const mesh = PatternedLineRenderer.createPatternMesh(
                pattern,
                0.1,
                "#ff0000",
                1.0,
                scene,
                undefined,
                undefined,
                true, // is2DMode
            );

            assert(
                mesh.material instanceof StandardMaterial,
                `Expected StandardMaterial for pattern: ${pattern}`,
            );
            assert.strictEqual(
                mesh.metadata.is2D,
                true,
                `Expected is2D metadata for pattern: ${pattern}`,
            );
        }
    } finally {
        cleanup();
    }
});

test("createPatternMesh works with shape type override in 2D mode", () => {
    const {scene, cleanup} = createTestScene();

    try {
        // Create dash-dot pattern with specific shape type (for alternating patterns)
        const mesh = PatternedLineRenderer.createPatternMesh(
            "dash-dot",
            0.1,
            "#ff0000",
            1.0,
            scene,
            "circle", // Override with circle shape
            undefined,
            true, // is2DMode
        );

        assert(mesh.material instanceof StandardMaterial, "Expected StandardMaterial for 2D mode");
        assert.strictEqual(mesh.metadata.is2D, true, "Expected is2D metadata");
    } finally {
        cleanup();
    }
});
