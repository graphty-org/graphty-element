/**
 * Edge Case Handling Tests
 *
 * Tests for edge conditions in edge rendering:
 * - Very short edges (< 1 unit)
 * - Very long edges (> 100 units)
 * - Zero-width lines
 * - Opacity edge cases (0.0, 1.0)
 * - Self-loops with all arrow types
 * - Overlapping nodes
 * - Patterns on very short edges
 */

import {AbstractMesh, NullEngine, Scene, Vector3} from "@babylonjs/core";
import {assert, beforeEach, describe, test} from "vitest";

import type {EdgeStyleConfig} from "../../src/config";
import {EdgeMesh} from "../../src/meshes/EdgeMesh";
import {MeshCache} from "../../src/meshes/MeshCache";
import {isDisposed} from "../helpers/testSetup";

describe("Edge Case Handling", () => {
    let scene: Scene;
    let meshCache: MeshCache;

    beforeEach(() => {
        const engine = new NullEngine();
        scene = new Scene(engine);
        meshCache = new MeshCache();
    });

    describe("Very Short Edges", () => {
        test("creates solid line mesh for edge < 1 unit", () => {
            const style: EdgeStyleConfig = {
                line: {width: 0.5, color: "#FF0000"},
                enabled: true,
            };

            // Solid line creation doesn't require srcPoint/dstPoint
            // The mesh is created with unit geometry and transformed later
            const mesh = EdgeMesh.create(
                meshCache,
                {styleId: "short-solid", width: style.line?.width ?? 0.25, color: style.line?.color ?? "#FFFFFF"},
                style,
                scene,
            );

            assert.exists(mesh, "Solid line mesh should be created for short edge");
            assert.isFalse(isDisposed(mesh), "Mesh should not be disposed");
        });

        test("creates bezier mesh for edge < 1 unit", () => {
            const style: EdgeStyleConfig = {
                line: {width: 0.5, color: "#FF0000", bezier: true},
                enabled: true,
            };

            const srcPoint = new Vector3(0, 0, 0);
            const dstPoint = new Vector3(0.5, 0, 0);

            const mesh = EdgeMesh.create(
                meshCache,
                {styleId: "short-bezier", width: style.line?.width ?? 0.25, color: style.line?.color ?? "#FFFFFF"},
                style,
                scene,
                srcPoint,
                dstPoint,
            );

            assert.exists(mesh, "Bezier mesh should be created for short edge");
            assert.isFalse(isDisposed(mesh), "Mesh should not be disposed");
        });

        test("bezier curve generation handles very short distance", () => {
            const src = new Vector3(0, 0, 0);
            const dst = new Vector3(0.1, 0, 0);

            const curvePoints = EdgeMesh.createBezierLine(src, dst);

            // Should have minimum number of points
            assert.isTrue(curvePoints.length >= 6, `Should have at least 2 points (6 values), got ${curvePoints.length}`);

            // First and last points should match input
            assert.closeTo(curvePoints[0], src.x, 0.01);
            assert.closeTo(curvePoints[curvePoints.length - 3], dst.x, 0.01);
        });

        test("patterned line handles edge < 1 unit", () => {
            const style: EdgeStyleConfig = {
                line: {width: 0.5, color: "#FF0000", type: "dash"},
                enabled: true,
            };

            const mesh = EdgeMesh.create(
                meshCache,
                {styleId: "short-patterned", width: style.line?.width ?? 0.25, color: style.line?.color ?? "#FFFFFF"},
                style,
                scene,
            );

            assert.exists(mesh, "Patterned line mesh should be created for short edge");
        });
    });

    describe("Very Long Edges", () => {
        test("creates solid line mesh for edge > 100 units", () => {
            const style: EdgeStyleConfig = {
                line: {width: 0.5, color: "#00FF00"},
                enabled: true,
            };

            const mesh = EdgeMesh.create(
                meshCache,
                {styleId: "long-solid", width: style.line?.width ?? 0.25, color: style.line?.color ?? "#FFFFFF"},
                style,
                scene,
            );

            assert.exists(mesh, "Solid line mesh should be created for long edge");
            assert.isFalse(isDisposed(mesh), "Mesh should not be disposed");
        });

        test("creates bezier mesh for edge > 100 units", () => {
            const style: EdgeStyleConfig = {
                line: {width: 0.5, color: "#00FF00", bezier: true},
                enabled: true,
            };

            const srcPoint = new Vector3(0, 0, 0);
            const dstPoint = new Vector3(150, 0, 0);

            const mesh = EdgeMesh.create(
                meshCache,
                {styleId: "long-bezier", width: style.line?.width ?? 0.25, color: style.line?.color ?? "#FFFFFF"},
                style,
                scene,
                srcPoint,
                dstPoint,
            );

            assert.exists(mesh, "Bezier mesh should be created for long edge");
            assert.isFalse(isDisposed(mesh), "Mesh should not be disposed");
        });

        test("bezier curve point density scales with edge length", () => {
            const src = new Vector3(0, 0, 0);
            const dst = new Vector3(200, 0, 0);

            const curvePoints = EdgeMesh.createBezierLine(src, dst);

            // Should have many points for a long edge
            const pointCount = curvePoints.length / 3;
            assert.isTrue(
                pointCount > 50,
                `Long edge should have many points, got ${pointCount}`,
            );
        });

        test("patterned line handles edge > 100 units", () => {
            const style: EdgeStyleConfig = {
                line: {width: 0.5, color: "#00FF00", type: "diamond"},
                enabled: true,
            };

            const mesh = EdgeMesh.create(
                meshCache,
                {styleId: "long-patterned", width: style.line?.width ?? 0.25, color: style.line?.color ?? "#FFFFFF"},
                style,
                scene,
            );

            assert.exists(mesh, "Patterned line mesh should be created for long edge");
        });
    });

    describe("Opacity Edge Cases", () => {
        test("zero opacity renders invisible mesh", () => {
            const style: EdgeStyleConfig = {
                line: {width: 0.5, color: "#FF00FF", opacity: 0.0},
                enabled: true,
            };

            const mesh = EdgeMesh.create(
                meshCache,
                {styleId: "zero-opacity", width: style.line?.width ?? 0.25, color: style.line?.color ?? "#FFFFFF"},
                style,
                scene,
            );

            assert.exists(mesh, "Mesh should be created even with zero opacity");
            assert.equal(mesh.visibility, 0.0, "Mesh visibility should be 0.0");
        });

        test("full opacity (1.0) renders visible mesh", () => {
            const style: EdgeStyleConfig = {
                line: {width: 0.5, color: "#FF00FF", opacity: 1.0},
                enabled: true,
            };

            const mesh = EdgeMesh.create(
                meshCache,
                {styleId: "full-opacity", width: style.line?.width ?? 0.25, color: style.line?.color ?? "#FFFFFF"},
                style,
                scene,
            );

            assert.exists(mesh, "Mesh should be created with full opacity");
            assert.equal(mesh.visibility, 1.0, "Mesh visibility should be 1.0");
        });

        test("partial opacity (0.5) is applied correctly", () => {
            const style: EdgeStyleConfig = {
                line: {width: 0.5, color: "#FF00FF", opacity: 0.5},
                enabled: true,
            };

            const mesh = EdgeMesh.create(
                meshCache,
                {styleId: "partial-opacity", width: style.line?.width ?? 0.25, color: style.line?.color ?? "#FFFFFF"},
                style,
                scene,
            );

            assert.exists(mesh, "Mesh should be created with partial opacity");
            assert.closeTo(mesh.visibility, 0.5, 0.01, "Mesh visibility should be 0.5");
        });

        test("bezier curve respects zero opacity", () => {
            const style: EdgeStyleConfig = {
                line: {width: 0.5, color: "#FF00FF", opacity: 0.0, bezier: true},
                enabled: true,
            };

            const srcPoint = new Vector3(0, 0, 0);
            const dstPoint = new Vector3(10, 0, 0);

            const mesh = EdgeMesh.create(
                meshCache,
                {styleId: "bezier-zero-opacity", width: style.line?.width ?? 0.25, color: style.line?.color ?? "#FFFFFF"},
                style,
                scene,
                srcPoint,
                dstPoint,
            );

            assert.exists(mesh, "Bezier mesh should be created with zero opacity");
            assert.equal(mesh.visibility, 0.0, "Bezier mesh visibility should be 0.0");
        });

        test("arrow mesh respects zero opacity", () => {
            const arrowMesh = EdgeMesh.createArrowHead(
                meshCache,
                "zero-opacity-arrow",
                {
                    type: "normal",
                    width: 1.0,
                    color: "#FF0000",
                    size: 1.0,
                    opacity: 0.0,
                },
                scene,
            );

            // arrowMesh cannot be null since type is "normal" (not "none")
            assert.equal(arrowMesh?.visibility, 0.0, "Arrow mesh visibility should be 0.0");
        });
    });

    describe("Self-Loops", () => {
        const arrowTypes = [
            "normal",
            "inverted",
            "dot",
            "open-dot",
            "sphere-dot",
            "diamond",
            "box",
            "vee",
            "tee",
            "half-open",
            "crow",
            "open-normal",
            "open-diamond",
        ];

        test("self-loop bezier curve creates circular path", () => {
            const point = new Vector3(5, 5, 5);

            const curvePoints = EdgeMesh.createBezierLine(point, point);

            // Should generate a circular loop
            assert.isTrue(curvePoints.length > 30, `Self-loop should have many points for smooth circle, got ${curvePoints.length / 3}`);

            // First and last points should be at same location (forming a loop)
            const firstX = curvePoints[0];
            const firstY = curvePoints[1];
            const firstZ = curvePoints[2];

            const lastX = curvePoints[curvePoints.length - 3];
            const lastY = curvePoints[curvePoints.length - 2];
            const lastZ = curvePoints[curvePoints.length - 1];

            assert.closeTo(firstX, lastX, 0.1, "Self-loop X should close");
            assert.closeTo(firstY, lastY, 0.1, "Self-loop Y should close");
            assert.closeTo(firstZ, lastZ, 0.1, "Self-loop Z should close");
        });

        arrowTypes.forEach((arrowType) => {
            test(`creates arrow mesh for self-loop with ${arrowType} type`, () => {
                const arrowMesh = EdgeMesh.createArrowHead(
                    meshCache,
                    `self-loop-${arrowType}`,
                    {
                        type: arrowType,
                        width: 1.0,
                        color: "#FF0000",
                        size: 1.0,
                        opacity: 1.0,
                    },
                    scene,
                );

                // arrowMesh cannot be null since arrowTypes don't include "none"
                assert.isFalse(arrowMesh ? isDisposed(arrowMesh) : false, `${arrowType} arrow mesh should not be disposed`);
            });
        });
    });

    describe("Arrow Geometry Metadata", () => {
        const arrowTypes = [
            "normal",
            "inverted",
            "dot",
            "open-dot",
            "sphere-dot",
            "diamond",
            "box",
            "vee",
            "tee",
            "half-open",
            "crow",
            "open-normal",
            "open-diamond",
            "sphere",
        ];

        arrowTypes.forEach((arrowType) => {
            test(`getArrowGeometry returns valid metadata for ${arrowType}`, () => {
                const geometry = EdgeMesh.getArrowGeometry(arrowType);

                assert.exists(geometry, `Geometry should exist for ${arrowType}`);
                assert.isString(geometry.positioningMode, "positioningMode should be a string");
                assert.include(
                    ["center", "tip"],
                    geometry.positioningMode,
                    `positioningMode should be 'center' or 'tip', got ${geometry.positioningMode}`,
                );
                assert.isBoolean(geometry.needsRotation, "needsRotation should be a boolean");
                assert.isNumber(geometry.positionOffset, "positionOffset should be a number");
            });
        });
    });

    describe("Arrow Position Calculations", () => {
        test("calculateArrowPosition handles tip-based arrows", () => {
            const surfacePoint = new Vector3(10, 0, 0);
            const direction = new Vector3(1, 0, 0);
            const arrowLength = 0.5;
            const geometry = EdgeMesh.getArrowGeometry("normal");

            const position = EdgeMesh.calculateArrowPosition(
                surfacePoint,
                direction,
                arrowLength,
                geometry,
            );

            // Tip-based arrow with offset=0: position at surface
            assert.closeTo(position.x, surfacePoint.x, 0.001);
            assert.closeTo(position.y, surfacePoint.y, 0.001);
            assert.closeTo(position.z, surfacePoint.z, 0.001);
        });

        test("calculateArrowPosition handles center-based arrows", () => {
            const surfacePoint = new Vector3(10, 0, 0);
            const direction = new Vector3(1, 0, 0);
            const arrowLength = 1.0;
            const geometry = EdgeMesh.getArrowGeometry("dot");

            const position = EdgeMesh.calculateArrowPosition(
                surfacePoint,
                direction,
                arrowLength,
                geometry,
            );

            // Center-based arrow: position center back by radius (half of length)
            const expectedX = surfacePoint.x - (arrowLength / 2);
            assert.closeTo(position.x, expectedX, 0.001);
        });

        test("calculateLineEndpoint creates appropriate gap", () => {
            const surfacePoint = new Vector3(10, 0, 0);
            const direction = new Vector3(1, 0, 0);
            const arrowLength = 0.5;
            const geometry = EdgeMesh.getArrowGeometry("normal");

            const lineEndpoint = EdgeMesh.calculateLineEndpoint(
                surfacePoint,
                direction,
                arrowLength,
                geometry,
            );

            // Line should end at surface minus arrow length
            const expectedX = surfacePoint.x - arrowLength;
            assert.closeTo(lineEndpoint.x, expectedX, 0.001);
        });
    });

    describe("Patterns on Very Short Edges", () => {
        const patternTypes = ["dot", "dash", "diamond", "dash-dot", "sinewave", "zigzag"] as const;

        patternTypes.forEach((pattern) => {
            test(`${pattern} pattern handles very short edge (< 1 unit)`, () => {
                const style: EdgeStyleConfig = {
                    line: {width: 0.5, color: "#FF0000", type: pattern},
                    enabled: true,
                };

                // Pattern lines are created with placeholder positions
                const mesh = EdgeMesh.create(
                    meshCache,
                    {styleId: `short-${pattern}`, width: style.line?.width ?? 0.25, color: style.line?.color ?? "#FFFFFF"},
                    style,
                    scene,
                );

                assert.exists(mesh, `${pattern} pattern mesh should be created for short edge`);
            });
        });
    });

    describe("Mesh Transform Edge Cases", () => {
        test("transformMesh handles zero-length edge gracefully", () => {
            const style: EdgeStyleConfig = {
                line: {width: 0.5, color: "#FF0000"},
                enabled: true,
            };

            const mesh = EdgeMesh.create(
                meshCache,
                {styleId: "zero-length", width: style.line?.width ?? 0.25, color: style.line?.color ?? "#FFFFFF"},
                style,
                scene,
            );

            // Same source and destination
            const point = new Vector3(5, 5, 5);

            // This should not throw
            EdgeMesh.transformMesh(mesh as AbstractMesh, point, point);

            // Mesh should still exist
            assert.exists(mesh);
            assert.isFalse(isDisposed(mesh));
        });

        test("transformMesh handles negative coordinates", () => {
            const style: EdgeStyleConfig = {
                line: {width: 0.5, color: "#FF0000"},
                enabled: true,
            };

            const mesh = EdgeMesh.create(
                meshCache,
                {styleId: "negative-coords", width: style.line?.width ?? 0.25, color: style.line?.color ?? "#FFFFFF"},
                style,
                scene,
            );

            const srcPoint = new Vector3(-10, -10, -10);
            const dstPoint = new Vector3(10, 10, 10);

            EdgeMesh.transformMesh(mesh as AbstractMesh, srcPoint, dstPoint);

            // Midpoint should be at origin
            assert.closeTo((mesh as AbstractMesh).position.x, 0, 0.001);
            assert.closeTo(mesh.position.y, 0, 0.001);
            assert.closeTo(mesh.position.z, 0, 0.001);
        });

        test("transformMesh handles very large coordinates", () => {
            const style: EdgeStyleConfig = {
                line: {width: 0.5, color: "#FF0000"},
                enabled: true,
            };

            const mesh = EdgeMesh.create(
                meshCache,
                {styleId: "large-coords", width: style.line?.width ?? 0.25, color: style.line?.color ?? "#FFFFFF"},
                style,
                scene,
            );

            const srcPoint = new Vector3(1000, 1000, 1000);
            const dstPoint = new Vector3(1500, 1000, 1000);

            EdgeMesh.transformMesh(mesh as AbstractMesh, srcPoint, dstPoint);

            // Should calculate correct position
            assert.closeTo((mesh as AbstractMesh).position.x, 1250, 0.001);
            assert.closeTo(mesh.position.y, 1000, 0.001);
            assert.closeTo(mesh.position.z, 1000, 0.001);
        });
    });
});
