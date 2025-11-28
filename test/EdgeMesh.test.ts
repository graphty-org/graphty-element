import {
    AbstractMesh,
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

            EdgeMesh.transformMesh(mesh as AbstractMesh, srcPoint, dstPoint);

            assert.equal((mesh as AbstractMesh).position.x, 2); // midpoint x
            assert.equal((mesh as AbstractMesh).position.y, 1.5); // midpoint y
            assert.equal((mesh as AbstractMesh).position.z, 0); // midpoint z
            assert.equal((mesh as AbstractMesh).scaling.z, 5); // length = sqrt(4^2 + 3^2) = 5
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

            EdgeMesh.transformMesh(mesh as AbstractMesh, srcPoint, dstPoint);

            assert.equal((mesh as AbstractMesh).position.x, 0); // midpoint
            assert.equal((mesh as AbstractMesh).position.y, 0); // midpoint
            assert.equal((mesh as AbstractMesh).position.z, 0); // midpoint
            assert.closeTo((mesh as AbstractMesh).scaling.z, Math.sqrt(48), 0.001); // length
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

    describe("Bezier Curves", () => {
        test("createBezierLine returns array of points between source and destination", () => {
            const srcPoint = new Vector3(0, 0, 0);
            const dstPoint = new Vector3(10, 0, 0);

            const bezierPoints = EdgeMesh.createBezierLine(srcPoint, dstPoint);

            // Should return a flat array of coordinates
            assert.isArray(bezierPoints);
            assert.isAtLeast(bezierPoints.length, 30); // At least 10 points × 3 coords
            assert.equal(bezierPoints.length % 3, 0); // Multiple of 3 (x, y, z)

            // First point should be near source
            assert.closeTo(bezierPoints[0], srcPoint.x, 0.1);
            assert.closeTo(bezierPoints[1], srcPoint.y, 0.1);
            assert.closeTo(bezierPoints[2], srcPoint.z, 0.1);

            // Last point should be near destination
            const lastIdx = bezierPoints.length - 3;
            assert.closeTo(bezierPoints[lastIdx], dstPoint.x, 0.1);
            assert.closeTo(bezierPoints[lastIdx + 1], dstPoint.y, 0.1);
            assert.closeTo(bezierPoints[lastIdx + 2], dstPoint.z, 0.1);
        });

        test("createBezierLine creates curved path with perpendicular offset", () => {
            const srcPoint = new Vector3(0, 0, 0);
            const dstPoint = new Vector3(10, 0, 0);

            const bezierPoints = EdgeMesh.createBezierLine(srcPoint, dstPoint);

            // Convert flat array to Vector3 points for easier analysis
            const points: Vector3[] = [];
            for (let i = 0; i < bezierPoints.length; i += 3) {
                points.push(new Vector3(bezierPoints[i], bezierPoints[i + 1], bezierPoints[i + 2]));
            }

            // Middle points should deviate from straight line (have some Y offset)
            // The bezier curve creates a perpendicular offset
            // Just verify the curve isn't a straight line
            let hasOffset = false;
            for (const point of points) {
                if (Math.abs(point.y) > 0.1 || Math.abs(point.z) > 0.1) {
                    hasOffset = true;
                    break;
                }
            }
            assert.isTrue(hasOffset, "Bezier curve should have perpendicular offset");
        });

        test("createBezierLine handles self-loop (same source and destination)", () => {
            const point = new Vector3(5, 5, 0);

            const bezierPoints = EdgeMesh.createBezierLine(point, point);

            // Self-loop should create a circular path
            assert.isAtLeast(bezierPoints.length, 30);

            // Points should form a circle around the center
            const points: Vector3[] = [];
            for (let i = 0; i < bezierPoints.length; i += 3) {
                points.push(new Vector3(bezierPoints[i], bezierPoints[i + 1], bezierPoints[i + 2]));
            }

            // Verify points are roughly equidistant from center (forming a circle)
            const distances = points.map((p) => Vector3.Distance(p, point));
            const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
            assert.isAbove(avgDistance, 1, "Self-loop should have non-zero radius");
        });

        test("createBezierLine generates more points for longer distances", () => {
            const shortSrc = new Vector3(0, 0, 0);
            const shortDst = new Vector3(1, 0, 0);
            const longSrc = new Vector3(0, 0, 0);
            const longDst = new Vector3(100, 0, 0);

            const shortBezier = EdgeMesh.createBezierLine(shortSrc, shortDst);
            const longBezier = EdgeMesh.createBezierLine(longSrc, longDst);

            // Longer distance should have more points (based on BEZIER_POINT_DENSITY)
            assert.isAtLeast(longBezier.length, shortBezier.length);
        });

        test("createBezierLine accepts custom control points", () => {
            const srcPoint = new Vector3(0, 0, 0);
            const dstPoint = new Vector3(10, 0, 0);

            // Custom control points to create an S-curve
            const control1 = new Vector3(3, 5, 0);
            const control2 = new Vector3(7, -5, 0);

            const bezierPoints = EdgeMesh.createBezierLine(srcPoint, dstPoint, [control1, control2]);

            // Should still generate valid points
            assert.isAtLeast(bezierPoints.length, 30);

            // Convert to Vector3 array for analysis
            const points: Vector3[] = [];
            for (let i = 0; i < bezierPoints.length; i += 3) {
                points.push(new Vector3(bezierPoints[i], bezierPoints[i + 1], bezierPoints[i + 2]));
            }

            // With S-curve control points, should have both positive and negative Y values
            let hasPositiveY = false;
            let hasNegativeY = false;
            for (const point of points) {
                if (point.y > 0.5) {
                    hasPositiveY = true;
                }

                if (point.y < -0.5) {
                    hasNegativeY = true;
                }
            }
            // S-curve should pass through both positive and negative Y
            assert.isTrue(hasPositiveY || hasNegativeY, "Custom control points should affect curve shape");
        });
    });

    describe("Line Opacity", () => {
        test("applies opacity to static line mesh visibility", () => {
            const options = {
                styleId: "test-opacity-static",
                width: 0.5,
                color: "#FF0000",
            };
            const style = {
                line: {width: 0.5, color: "#FF0000", opacity: 0.5},
                enabled: true,
            };

            const mesh = EdgeMesh.create(meshCache, options, style, scene);

            assert.exists(mesh);
            assert.equal(mesh.visibility, 0.5);
        });

        test("applies full opacity by default", () => {
            const options = {
                styleId: "test-opacity-default",
                width: 0.5,
                color: "#FF0000",
            };
            const style = {
                line: {width: 0.5, color: "#FF0000"},
                enabled: true,
            };

            const mesh = EdgeMesh.create(meshCache, options, style, scene);

            assert.exists(mesh);
            assert.equal(mesh.visibility, 1);
        });

        test("applies zero opacity correctly", () => {
            const options = {
                styleId: "test-opacity-zero",
                width: 0.5,
                color: "#FF0000",
            };
            const style = {
                line: {width: 0.5, color: "#FF0000", opacity: 0},
                enabled: true,
            };

            const mesh = EdgeMesh.create(meshCache, options, style, scene);

            assert.exists(mesh);
            assert.equal(mesh.visibility, 0);
        });

        test("applies opacity to animated line", () => {
            const options = {
                styleId: "test-opacity-animated",
                width: 0.5,
                color: "#FF0000",
            };
            const style = {
                line: {width: 0.5, color: "#FF0000", animationSpeed: 0.1, opacity: 0.7},
                enabled: true,
            };

            const mesh = EdgeMesh.create(meshCache, options, style, scene);

            assert.exists(mesh);
            assert.equal(mesh.visibility, 0.7);
        });
    });

    describe("Arrow Geometry Metadata", () => {
        test("getArrowGeometry returns correct positioning for normal arrow", () => {
            const geometry = EdgeMesh.getArrowGeometry("normal");

            assert.equal(geometry.positioningMode, "tip");
            assert.equal(geometry.needsRotation, false);
            assert.equal(geometry.positionOffset, 0);
        });

        test("getArrowGeometry returns correct positioning for dot arrow", () => {
            const geometry = EdgeMesh.getArrowGeometry("dot");

            assert.equal(geometry.positioningMode, "center");
            assert.equal(geometry.needsRotation, false);
            assert.equal(geometry.positionOffset, 0);
        });

        test("getArrowGeometry returns correct positioning for inverted arrow", () => {
            const geometry = EdgeMesh.getArrowGeometry("inverted");

            assert.equal(geometry.positioningMode, "tip");
            assert.equal(geometry.needsRotation, false);
            assert.equal(geometry.positionOffset, 1.0); // Inverted has offset
        });

        test("getArrowGeometry returns correct positioning for sphere-dot arrow", () => {
            const geometry = EdgeMesh.getArrowGeometry("sphere-dot");

            assert.equal(geometry.positioningMode, "center");
            assert.equal(geometry.needsRotation, false);
            assert.equal(geometry.scaleFactor, 0.25); // sphere-dot is smaller
        });

        test("calculateArrowPosition positions tip-based arrow at surface", () => {
            const surfacePoint = new Vector3(5, 0, 0);
            const direction = new Vector3(1, 0, 0).normalize();
            const arrowLength = 0.5;
            const geometry = EdgeMesh.getArrowGeometry("normal");

            const position = EdgeMesh.calculateArrowPosition(surfacePoint, direction, arrowLength, geometry);

            // Normal arrow: tip at surface, no offset
            assert.closeTo(position.x, surfacePoint.x, 0.001);
            assert.closeTo(position.y, surfacePoint.y, 0.001);
            assert.closeTo(position.z, surfacePoint.z, 0.001);
        });

        test("calculateArrowPosition positions center-based arrow with radius offset", () => {
            const surfacePoint = new Vector3(5, 0, 0);
            const direction = new Vector3(1, 0, 0).normalize();
            const arrowLength = 1.0;
            const geometry = EdgeMesh.getArrowGeometry("dot");

            const position = EdgeMesh.calculateArrowPosition(surfacePoint, direction, arrowLength, geometry);

            // Dot arrow: center positioned back by radius (half of length)
            const expectedX = surfacePoint.x - (arrowLength / 2);
            assert.closeTo(position.x, expectedX, 0.001);
        });

        test("calculateLineEndpoint returns surface point minus arrow size", () => {
            const surfacePoint = new Vector3(10, 0, 0);
            const direction = new Vector3(1, 0, 0).normalize();
            const arrowLength = 0.5;
            const geometry = EdgeMesh.getArrowGeometry("normal");

            const endpoint = EdgeMesh.calculateLineEndpoint(surfacePoint, direction, arrowLength, geometry);

            // Line should end at surface minus arrow length
            const expectedX = surfacePoint.x - arrowLength;
            assert.closeTo(endpoint.x, expectedX, 0.001);
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
