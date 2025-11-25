import {NullEngine, Scene, Vector3} from "@babylonjs/core";
import {assert, beforeEach, describe, test} from "vitest";

import type {EdgeStyleConfig} from "../src/config";
import {EdgeMesh} from "../src/meshes/EdgeMesh";
import {MeshCache} from "../src/meshes/MeshCache";

describe("Bezier Curve Edge Integration", () => {
    let scene: Scene;
    let meshCache: MeshCache;

    beforeEach(() => {
        const engine = new NullEngine();
        scene = new Scene(engine);
        meshCache = new MeshCache();
    });

    test("creates bezier curve mesh when bezier enabled", () => {
        const style: EdgeStyleConfig = {
            line: {
                width: 0.5,
                color: "#FF0000",
                bezier: true,
            },
            enabled: true,
        };

        const srcPoint = new Vector3(0, 0, 0);
        const dstPoint = new Vector3(10, 0, 0);

        const mesh = EdgeMesh.create(
            meshCache,
            {
                styleId: "bezier-test",
                width: style.line?.width ?? 0.25,
                color: style.line?.color ?? "#FFFFFF",
            },
            style,
            scene,
            srcPoint,
            dstPoint,
        );

        assert.exists(mesh, "Bezier mesh should be created");
        assert.isFalse(mesh.isDisposed(), "Mesh should not be disposed");
    });

    test("creates straight line mesh when bezier disabled", () => {
        const style: EdgeStyleConfig = {
            line: {
                width: 0.5,
                color: "#FF0000",
                bezier: false,
            },
            enabled: true,
        };

        const mesh = EdgeMesh.create(
            meshCache,
            {
                styleId: "straight-test",
                width: style.line?.width ?? 0.25,
                color: style.line?.color ?? "#FFFFFF",
            },
            style,
            scene,
        );

        assert.exists(mesh, "Straight line mesh should be created");
        assert.isFalse(mesh.isDisposed(), "Mesh should not be disposed");
    });

    test("bezier curve works with different positions", () => {
        const style: EdgeStyleConfig = {
            line: {
                width: 0.5,
                color: "#00FF00",
                bezier: true,
            },
            enabled: true,
        };

        const srcPoint = new Vector3(5, 5, 5);
        const dstPoint = new Vector3(15, 10, 8);

        const mesh = EdgeMesh.create(
            meshCache,
            {
                styleId: "bezier-position-test",
                width: style.line?.width ?? 0.25,
                color: style.line?.color ?? "#FFFFFF",
            },
            style,
            scene,
            srcPoint,
            dstPoint,
        );

        assert.exists(mesh, "Bezier mesh with custom positions should be created");
        assert.isFalse(mesh.isDisposed(), "Mesh should not be disposed");
    });

    test("bezier curve handles self-loops", () => {
        const style: EdgeStyleConfig = {
            line: {
                width: 0.5,
                color: "#0000FF",
                bezier: true,
            },
            enabled: true,
        };

        const point = new Vector3(5, 5, 5);

        const mesh = EdgeMesh.create(
            meshCache,
            {
                styleId: "bezier-selfloop-test",
                width: style.line?.width ?? 0.25,
                color: style.line?.color ?? "#FFFFFF",
            },
            style,
            scene,
            point,
            point,
        );

        assert.exists(mesh, "Bezier self-loop mesh should be created");
        assert.isFalse(mesh.isDisposed(), "Mesh should not be disposed");
    });

    test("bezier curve respects opacity setting", () => {
        const style: EdgeStyleConfig = {
            line: {
                width: 0.5,
                color: "#FF00FF",
                bezier: true,
                opacity: 0.5,
            },
            enabled: true,
        };

        const srcPoint = new Vector3(0, 0, 0);
        const dstPoint = new Vector3(10, 0, 0);

        const mesh = EdgeMesh.create(
            meshCache,
            {
                styleId: "bezier-opacity-test",
                width: style.line?.width ?? 0.25,
                color: style.line?.color ?? "#FFFFFF",
            },
            style,
            scene,
            srcPoint,
            dstPoint,
        );

        assert.exists(mesh, "Bezier mesh with opacity should be created");
        assert.closeTo(mesh.visibility, 0.5, 0.01, "Mesh should have correct opacity");
    });

    test("bezier curves are not cached (unique geometry per edge)", () => {
        const style: EdgeStyleConfig = {
            line: {
                width: 0.5,
                color: "#FFFF00",
                bezier: true,
            },
            enabled: true,
        };

        const srcPoint1 = new Vector3(0, 0, 0);
        const dstPoint1 = new Vector3(10, 0, 0);

        const mesh1 = EdgeMesh.create(
            meshCache,
            {
                styleId: "bezier-cache-test",
                width: style.line?.width ?? 0.25,
                color: style.line?.color ?? "#FFFFFF",
            },
            style,
            scene,
            srcPoint1,
            dstPoint1,
        );

        const srcPoint2 = new Vector3(5, 5, 5);
        const dstPoint2 = new Vector3(15, 10, 8);

        const mesh2 = EdgeMesh.create(
            meshCache,
            {
                styleId: "bezier-cache-test", // Same styleId
                width: style.line?.width ?? 0.25,
                color: style.line?.color ?? "#FFFFFF",
            },
            style,
            scene,
            srcPoint2,
            dstPoint2,
        );

        assert.exists(mesh1, "First bezier mesh should be created");
        assert.exists(mesh2, "Second bezier mesh should be created");
        assert.notEqual(mesh1, mesh2, "Bezier meshes should not be cached/reused");
    });

    test("bezier curve with very short distance", () => {
        const style: EdgeStyleConfig = {
            line: {
                width: 0.5,
                color: "#00FFFF",
                bezier: true,
            },
            enabled: true,
        };

        const srcPoint = new Vector3(0, 0, 0);
        const dstPoint = new Vector3(0.1, 0, 0);

        const mesh = EdgeMesh.create(
            meshCache,
            {
                styleId: "bezier-short-test",
                width: style.line?.width ?? 0.25,
                color: style.line?.color ?? "#FFFFFF",
            },
            style,
            scene,
            srcPoint,
            dstPoint,
        );

        assert.exists(mesh, "Bezier mesh for short distance should be created");
        assert.isFalse(mesh.isDisposed(), "Mesh should not be disposed");
    });
});
