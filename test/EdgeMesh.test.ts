import {
    ArcRotateCamera,
    Camera,
    InstancedMesh,
    NullEngine,
    RawTexture,
    Scene,
    StandardMaterial,
    Vector3,
} from "@babylonjs/core";
import {assert, beforeEach, describe, test} from "vitest";

import {EDGE_CONSTANTS} from "../src/constants/meshConstants";
import {EdgeMesh} from "../src/meshes/EdgeMesh";
import {MeshCache} from "../src/meshes/MeshCache";

describe("EdgeMesh", () => {
    let scene: Scene;
    let meshCache: MeshCache;

    beforeEach(() => {
        const engine = new NullEngine();
        scene = new Scene(engine);
        meshCache = new MeshCache();
    });

    describe("Line Creation", () => {
        test("creates static line with correct properties", () => {
            const options = {
                styleId: "test-static",
                width: 0.5,
                color: "#FF0000",
            };
            const style = {line: {width: 0.5, color: "#FF0000"}, enabled: true};

            const mesh = EdgeMesh.create(meshCache, options, style, scene);

            assert.exists(mesh);
            assert.equal(mesh.name, "edge-style-test-static");

            const material = mesh.material as StandardMaterial;
            assert.exists(material);
        });

        test("creates animated line when animationSpeed is set", () => {
            const options = {
                styleId: "test-animated",
                width: 0.5,
                color: "#00FF00",
            };
            const style = {
                line: {
                    width: 0.5,
                    color: "#00FF00",
                    animationSpeed: 0.1,
                },
                enabled: true,
            };

            const mesh = EdgeMesh.create(meshCache, options, style, scene);

            assert.exists(mesh);
            assert.equal(mesh.name, "edge-style-test-animated");

            const material = mesh.material as StandardMaterial;
            assert.exists(material.emissiveTexture);
            assert.isTrue(material.disableLighting);
        });

        test("uses default color when not specified", () => {
            const options = {
                styleId: "test-default-color",
                width: EDGE_CONSTANTS.DEFAULT_LINE_WIDTH,
                color: EDGE_CONSTANTS.DEFAULT_LINE_COLOR,
            };
            const style = {line: {}, enabled: true};

            const mesh = EdgeMesh.create(meshCache, options, style, scene);

            assert.exists(mesh);
        });

        test("uses default width when not specified", () => {
            const options = {
                styleId: "test-default-width",
                width: EDGE_CONSTANTS.DEFAULT_LINE_WIDTH,
                color: "#FF0000",
            };
            const style = {line: {color: "#FF0000"}, enabled: true};

            const mesh = EdgeMesh.create(meshCache, options, style, scene);

            assert.exists(mesh);
        });

        test("animated line texture has correct scale", () => {
            const options = {
                styleId: "test-texture-scale",
                width: 0.5,
                color: "#0000FF",
            };
            const style = {
                line: {
                    width: 0.5,
                    color: "#0000FF",
                    animationSpeed: 0.1,
                },
                enabled: true,
            };

            const mesh = EdgeMesh.create(meshCache, options, style, scene);
            const material = mesh.material as StandardMaterial;

            // uScale is a property of RawTexture but not in the type definitions
            const texture = material.emissiveTexture as RawTexture & {uScale: number};
            assert.equal(texture.uScale, EDGE_CONSTANTS.MOVING_TEXTURE_U_SCALE);
        });
    });

    describe("Arrow Head", () => {
        test("creates arrow head with calculated dimensions", () => {
            const arrowMesh = EdgeMesh.createArrowHead(
                meshCache,
                "test-arrow",
                {type: "normal", width: 0.5, color: "#FF0000"},
                scene,
            );

            assert.exists(arrowMesh);
            assert.equal(arrowMesh.name, "filled-triangle-arrow");
        });

        test("returns null for 'none' type", () => {
            const arrowMesh = EdgeMesh.createArrowHead(
                meshCache,
                "test-no-arrow",
                {type: "none", width: 0.5, color: "#FF0000"},
                scene,
            );

            assert.isNull(arrowMesh);
        });

        test("returns null when type is not specified", () => {
            const arrowMesh = EdgeMesh.createArrowHead(
                meshCache,
                "test-no-type",
                {width: 0.5, color: "#FF0000"},
                scene,
            );

            assert.isNull(arrowMesh);
        });

        test("uses cache for arrow heads", () => {
            const options = {type: "normal" as const, width: 0.5, color: "#FF0000"};

            const arrow1 = EdgeMesh.createArrowHead(meshCache, "cached-arrow", options, scene);
            const arrow2 = EdgeMesh.createArrowHead(meshCache, "cached-arrow", options, scene);

            // Both should be instances from the same source mesh
            assert.exists(arrow1);
            assert.exists(arrow2);
            const instance1 = arrow1 as InstancedMesh;
            const instance2 = arrow2 as InstancedMesh;
            assert.equal(instance1.sourceMesh, instance2.sourceMesh);
        });

        test("creates different arrow for different styleId", () => {
            const options = {type: "normal" as const, width: 0.5, color: "#FF0000"};

            const arrow1 = EdgeMesh.createArrowHead(meshCache, "arrow1", options, scene);
            const arrow2 = EdgeMesh.createArrowHead(meshCache, "arrow2", options, scene);

            assert.notStrictEqual(arrow1, arrow2);
        });
    });

    describe("Helper Methods", () => {
        test("calculateArrowWidth returns default constant", () => {
            assert.equal(EdgeMesh.calculateArrowWidth(), 1.25); // DEFAULT_ARROW_WIDTH
        });

        test("calculateArrowLength returns default constant", () => {
            assert.equal(EdgeMesh.calculateArrowLength(), 0.5); // DEFAULT_ARROW_LENGTH
        });

        test("transformMesh positions and orients correctly", () => {
            const mesh = EdgeMesh.create(
                meshCache,
                {styleId: "test-transform", width: 0.25, color: "#FF0000"},
                {line: {width: 0.25, color: "#FF0000"}, enabled: true},
                scene,
            );

            const srcPoint = new Vector3(0, 0, 0);
            const dstPoint = new Vector3(4, 3, 0);

            EdgeMesh.transformMesh(mesh, srcPoint, dstPoint);

            assert.equal(mesh.position.x, 2); // midpoint x
            assert.equal(mesh.position.y, 1.5); // midpoint y
            assert.equal(mesh.position.z, 0); // midpoint z
            assert.equal(mesh.scaling.z, 5); // length = sqrt(4^2 + 3^2) = 5
        });

        test("transformMesh handles negative coordinates", () => {
            const mesh = EdgeMesh.create(
                meshCache,
                {styleId: "test-negative", width: 0.25, color: "#FF0000"},
                {line: {width: 0.25, color: "#FF0000"}, enabled: true},
                scene,
            );

            const srcPoint = new Vector3(-2, -2, -2);
            const dstPoint = new Vector3(2, 2, 2);

            EdgeMesh.transformMesh(mesh, srcPoint, dstPoint);

            assert.equal(mesh.position.x, 0); // midpoint
            assert.equal(mesh.position.y, 0); // midpoint
            assert.equal(mesh.position.z, 0); // midpoint
            assert.closeTo(mesh.scaling.z, Math.sqrt(48), 0.001); // length
        });
    });

    describe("Caching", () => {
        test("returns cached mesh for same styleId", () => {
            const options = {styleId: "cached-edge", width: 0.25, color: "#FF0000"};
            const style = {line: {width: 0.25, color: "#FF0000"}, enabled: true};

            const mesh1 = EdgeMesh.create(meshCache, options, style, scene);
            const mesh2 = EdgeMesh.create(meshCache, options, style, scene);

            // Both should be instances from the same source mesh
            const instance1 = mesh1 as InstancedMesh;
            const instance2 = mesh2 as InstancedMesh;
            assert.equal(instance1.sourceMesh, instance2.sourceMesh);
        });

        test("creates new mesh for different styleId", () => {
            const style = {line: {width: 0.25, color: "#FF0000"}, enabled: true};

            const mesh1 = EdgeMesh.create(
                meshCache,
                {styleId: "edge1", width: 0.25, color: "#FF0000"},
                style,
                scene,
            );
            const mesh2 = EdgeMesh.create(
                meshCache,
                {styleId: "edge2", width: 0.25, color: "#FF0000"},
                style,
                scene,
            );

            assert.notStrictEqual(mesh1, mesh2);
        });

        test("animated and static lines have different cache keys", () => {
            const options = {styleId: "same-edge", width: 0.25, color: "#FF0000"};

            const staticMesh = EdgeMesh.create(
                meshCache,
                options,
                {line: {width: 0.25, color: "#FF0000"}, enabled: true},
                scene,
            );

            // Clear cache to ensure new mesh creation
            meshCache.clear();

            const animatedMesh = EdgeMesh.create(
                meshCache,
                options,
                {line: {width: 0.25, color: "#FF0000", animationSpeed: 0.1}, enabled: true},
                scene,
            );

            assert.notEqual(staticMesh, animatedMesh);
            assert.equal(staticMesh.name, "edge-style-same-edge");
            assert.equal(animatedMesh.name, "edge-style-same-edge");
        });
    });

    describe("Animation", () => {
        test("animation observer is added to scene", () => {
            const initialObserverCount = scene.onBeforeRenderObservable.observers.length;

            EdgeMesh.create(
                meshCache,
                {styleId: "test-observer", width: 0.25, color: "#FF0000"},
                {line: {width: 0.25, color: "#FF0000", animationSpeed: 0.1}, enabled: true},
                scene,
            );

            assert.equal(
                scene.onBeforeRenderObservable.observers.length,
                initialObserverCount + 1,
            );
        });
    });

    describe("2D Mode Detection", () => {
        test("is2DMode returns true for orthographic camera with twoD metadata", () => {
            const camera = new ArcRotateCamera("camera", 0, 0, 10, Vector3.Zero(), scene);
            camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
            scene.activeCamera = camera;
            scene.metadata = {twoD: true};

            // @ts-expect-error - is2DMode is private but we need to test it
            assert.strictEqual(EdgeMesh.is2DMode(scene), true);
        });

        test("is2DMode returns false for perspective camera", () => {
            const camera = new ArcRotateCamera("camera", 0, 0, 10, Vector3.Zero(), scene);
            camera.mode = Camera.PERSPECTIVE_CAMERA;
            scene.activeCamera = camera;
            scene.metadata = {twoD: true};

            // @ts-expect-error - is2DMode is private but we need to test it
            assert.strictEqual(EdgeMesh.is2DMode(scene), false);
        });

        test("is2DMode returns false when twoD is false", () => {
            const camera = new ArcRotateCamera("camera", 0, 0, 10, Vector3.Zero(), scene);
            camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
            scene.activeCamera = camera;
            scene.metadata = {twoD: false};

            // @ts-expect-error - is2DMode is private but we need to test it
            assert.strictEqual(EdgeMesh.is2DMode(scene), false);
        });

        test("is2DMode returns false when twoD is not set", () => {
            const camera = new ArcRotateCamera("camera", 0, 0, 10, Vector3.Zero(), scene);
            camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
            scene.activeCamera = camera;
            scene.metadata = {};

            // @ts-expect-error - is2DMode is private but we need to test it
            assert.strictEqual(EdgeMesh.is2DMode(scene), false);
        });

        test("is2DMode returns false when no camera exists", () => {
            scene.activeCamera = null;
            scene.metadata = {twoD: true};

            // @ts-expect-error - is2DMode is private but we need to test it
            assert.strictEqual(EdgeMesh.is2DMode(scene), false);
        });

        test("is2DMode returns false when metadata is undefined", () => {
            const camera = new ArcRotateCamera("camera", 0, 0, 10, Vector3.Zero(), scene);
            camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
            scene.activeCamera = camera;
            scene.metadata = undefined;

            // @ts-expect-error - is2DMode is private but we need to test it
            assert.strictEqual(EdgeMesh.is2DMode(scene), false);
        });
    });
});
