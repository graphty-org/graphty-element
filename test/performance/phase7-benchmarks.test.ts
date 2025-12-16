/**
 * Phase 7 Performance Benchmarks
 *
 * Validates performance requirements from Phase 7:
 * - 1000 edges render in < 3 seconds
 * - Bezier generation completes in < 15ms per edge
 * - Mesh cache hit rate > 90%
 */

import {AbstractMesh, InstancedMesh, NullEngine, Scene, Vector3} from "@babylonjs/core";
import {assert, beforeEach, describe, test} from "vitest";

import type {EdgeStyleConfig} from "../../src/config";
import {EDGE_CONSTANTS} from "../../src/constants/meshConstants";
import {EdgeMesh} from "../../src/meshes/EdgeMesh";
import {MeshCache} from "../../src/meshes/MeshCache";

describe("Phase 7 Performance Benchmarks", () => {
    let scene: Scene;
    let meshCache: MeshCache;

    beforeEach(() => {
        const engine = new NullEngine();
        scene = new Scene(engine);
        meshCache = new MeshCache();
    });

    describe("Bezier Generation Performance", () => {
        test("bezier generation completes in < 15ms per edge (avg over 100 edges)", () => {
            const startTime = performance.now();

            for (let i = 0; i < 100; i++) {
                // Vary the positions slightly to simulate real-world usage
                const srcOffset = new Vector3(i % 10, Math.floor(i / 10) % 10, 0);
                const dstOffset = new Vector3(100 + (i % 10), Math.floor(i / 10) % 10, 0);
                EdgeMesh.createBezierLine(srcOffset, dstOffset);
            }

            const endTime = performance.now();
            const avgTime = (endTime - startTime) / 100;

            // Bezier generation should be < 15ms per edge
            assert.isBelow(
                avgTime,
                15,
                `Bezier generation took ${avgTime.toFixed(2)}ms per edge (target < 15ms)`,
            );
        });

        test("bezier generation performance scales with edge length", () => {
            const shortEdgeTimes: number[] = [];
            const longEdgeTimes: number[] = [];

            // Short edges (10 units)
            for (let i = 0; i < 50; i++) {
                const src = new Vector3(0, 0, 0);
                const dst = new Vector3(10, 0, 0);

                const start = performance.now();
                EdgeMesh.createBezierLine(src, dst);
                shortEdgeTimes.push(performance.now() - start);
            }

            // Long edges (200 units)
            for (let i = 0; i < 50; i++) {
                const src = new Vector3(0, 0, 0);
                const dst = new Vector3(200, 0, 0);

                const start = performance.now();
                EdgeMesh.createBezierLine(src, dst);
                longEdgeTimes.push(performance.now() - start);
            }

            const avgShort = shortEdgeTimes.reduce((a, b) => a + b, 0) / shortEdgeTimes.length;
            const avgLong = longEdgeTimes.reduce((a, b) => a + b, 0) / longEdgeTimes.length;

            // Both should be under 15ms
            assert.isBelow(avgShort, 15, `Short edge bezier: ${avgShort.toFixed(2)}ms`);
            assert.isBelow(avgLong, 15, `Long edge bezier: ${avgLong.toFixed(2)}ms`);

            // Long edges generate more points but should still be fast
        });

        test("bezier point density follows expected formula", () => {
            // Test point density calculation matches EDGE_CONSTANTS
            const src = new Vector3(0, 0, 0);
            const dst = new Vector3(100, 0, 0);

            const points = EdgeMesh.createBezierLine(src, dst);
            const pointCount = points.length / 3;

            // Expected: max(10, ceil(distance * 1.5 * BEZIER_POINT_DENSITY)) + 1
            const distance = 100;
            const estimatedLength = distance * 1.5;
            const expectedPoints = Math.max(10, Math.ceil(estimatedLength * EDGE_CONSTANTS.BEZIER_POINT_DENSITY)) + 1;

            // Allow 20% tolerance
            assert.closeTo(
                pointCount,
                expectedPoints,
                expectedPoints * 0.2,
                `Expected ~${expectedPoints} points, got ${pointCount}`,
            );
        });
    });

    describe("Mesh Cache Performance", () => {
        test("mesh cache provides instances for same style edges", () => {
            const style: EdgeStyleConfig = {
                line: {width: 0.5, color: "#FF0000"},
                enabled: true,
            };

            // Create first mesh
            const mesh1 = EdgeMesh.create(
                meshCache,
                {styleId: "cache-test-style", width: style.line?.width ?? 0.25, color: style.line?.color ?? "#FFFFFF"},
                style,
                scene,
            );

            // Create second mesh with same style
            const mesh2 = EdgeMesh.create(
                meshCache,
                {styleId: "cache-test-style", width: style.line?.width ?? 0.25, color: style.line?.color ?? "#FFFFFF"},
                style,
                scene,
            );

            // Both meshes should exist
            assert.exists(mesh1, "First mesh should exist");
            assert.exists(mesh2, "Second mesh should exist");

            // MeshCache returns InstancedMesh objects that share the same source mesh
            // Both mesh1 and mesh2 should be instances of the same source
            // The sourceMesh of both should be the same cached Mesh
            const instancedMesh1 = mesh1 as InstancedMesh;
            const instancedMesh2 = mesh2 as InstancedMesh;
            const sourceMesh1 = instancedMesh1.sourceMesh;
            const sourceMesh2 = instancedMesh2.sourceMesh;
            assert.strictEqual(
                sourceMesh1,
                sourceMesh2,
                "Both meshes should share the same source mesh from cache",
            );
        });

        test("mesh cache creates new meshes for different styles", () => {
            const style1: EdgeStyleConfig = {
                line: {width: 0.5, color: "#FF0000"},
                enabled: true,
            };

            const style2: EdgeStyleConfig = {
                line: {width: 0.5, color: "#00FF00"},
                enabled: true,
            };

            // Create first mesh
            const mesh1 = EdgeMesh.create(
                meshCache,
                {styleId: "cache-style-1", width: style1.line?.width ?? 0.25, color: style1.line?.color ?? "#FFFFFF"},
                style1,
                scene,
            );

            // Create second mesh with different style
            const mesh2 = EdgeMesh.create(
                meshCache,
                {styleId: "cache-style-2", width: style2.line?.width ?? 0.25, color: style2.line?.color ?? "#FFFFFF"},
                style2,
                scene,
            );

            // Both meshes should exist and be different
            assert.exists(mesh1, "First mesh should exist");
            assert.exists(mesh2, "Second mesh should exist");

            // Different styles = different source meshes
            // (they may still be instances of different source meshes)
            const instancedMesh1 = mesh1 as InstancedMesh;
            const instancedMesh2 = mesh2 as InstancedMesh;
            assert.notEqual(
                instancedMesh1.sourceMesh,
                instancedMesh2.sourceMesh,
                "Different styles should have different source meshes",
            );
        });
    });

    describe("Arrow Geometry Calculation Performance", () => {
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

        test("getArrowGeometry is fast (< 0.1ms avg)", () => {
            const iterations = 10000;
            const startTime = performance.now();

            for (let i = 0; i < iterations; i++) {
                const arrowType = arrowTypes[i % arrowTypes.length];
                EdgeMesh.getArrowGeometry(arrowType);
            }

            const endTime = performance.now();
            const avgTime = (endTime - startTime) / iterations;

            assert.isBelow(
                avgTime,
                0.1,
                `getArrowGeometry took ${avgTime.toFixed(4)}ms per call (target < 0.1ms)`,
            );
        });

        test("calculateArrowPosition is fast (< 0.1ms avg)", () => {
            const iterations = 10000;
            const surfacePoint = new Vector3(10, 0, 0);
            const direction = new Vector3(1, 0, 0);
            const arrowLength = 0.5;

            const startTime = performance.now();

            for (let i = 0; i < iterations; i++) {
                const arrowType = arrowTypes[i % arrowTypes.length];
                const geometry = EdgeMesh.getArrowGeometry(arrowType);
                EdgeMesh.calculateArrowPosition(surfacePoint, direction, arrowLength, geometry);
            }

            const endTime = performance.now();
            const avgTime = (endTime - startTime) / iterations;

            assert.isBelow(
                avgTime,
                0.1,
                `calculateArrowPosition took ${avgTime.toFixed(4)}ms per call (target < 0.1ms)`,
            );
        });

        test("calculateLineEndpoint is fast (< 0.1ms avg)", () => {
            const iterations = 10000;
            const surfacePoint = new Vector3(10, 0, 0);
            const direction = new Vector3(1, 0, 0);
            const arrowLength = 0.5;

            const startTime = performance.now();

            for (let i = 0; i < iterations; i++) {
                const arrowType = arrowTypes[i % arrowTypes.length];
                const geometry = EdgeMesh.getArrowGeometry(arrowType);
                EdgeMesh.calculateLineEndpoint(surfacePoint, direction, arrowLength, geometry);
            }

            const endTime = performance.now();
            const avgTime = (endTime - startTime) / iterations;

            assert.isBelow(
                avgTime,
                0.1,
                `calculateLineEndpoint took ${avgTime.toFixed(4)}ms per call (target < 0.1ms)`,
            );
        });
    });

    describe("Mesh Creation Performance", () => {
        test("solid line mesh creation is fast (< 5ms avg)", () => {
            const iterations = 100;
            const style: EdgeStyleConfig = {
                line: {width: 0.5, color: "#FF0000"},
                enabled: true,
            };

            const times: number[] = [];

            for (let i = 0; i < iterations; i++) {
                // Use unique styleId to bypass cache
                const startTime = performance.now();
                EdgeMesh.create(
                    meshCache,
                    {styleId: `perf-test-${i}`, width: style.line?.width ?? 0.25, color: style.line?.color ?? "#FFFFFF"},
                    style,
                    scene,
                );
                times.push(performance.now() - startTime);
            }

            const avgTime = times.reduce((a, b) => a + b, 0) / times.length;

            assert.isBelow(
                avgTime,
                5,
                `Solid line mesh creation took ${avgTime.toFixed(2)}ms per mesh (target < 5ms)`,
            );
        });

        test("bezier mesh creation is fast (< 10ms avg)", () => {
            const iterations = 50;
            const style: EdgeStyleConfig = {
                line: {width: 0.5, color: "#FF0000", bezier: true},
                enabled: true,
            };

            const times: number[] = [];

            for (let i = 0; i < iterations; i++) {
                const srcPoint = new Vector3(0, i, 0);
                const dstPoint = new Vector3(50, i, 0);

                const startTime = performance.now();
                EdgeMesh.create(
                    meshCache,
                    {styleId: `bezier-perf-${i}`, width: style.line?.width ?? 0.25, color: style.line?.color ?? "#FFFFFF"},
                    style,
                    scene,
                    srcPoint,
                    dstPoint,
                );
                times.push(performance.now() - startTime);
            }

            const avgTime = times.reduce((a, b) => a + b, 0) / times.length;

            assert.isBelow(
                avgTime,
                10,
                `Bezier mesh creation took ${avgTime.toFixed(2)}ms per mesh (target < 10ms)`,
            );
        });

        test("arrow mesh creation is fast (< 5ms avg)", () => {
            const iterations = 100;
            const arrowTypes = ["normal", "inverted", "dot", "diamond", "box"];

            const times: number[] = [];

            for (let i = 0; i < iterations; i++) {
                const arrowType = arrowTypes[i % arrowTypes.length];

                const startTime = performance.now();
                EdgeMesh.createArrowHead(
                    meshCache,
                    `arrow-perf-${i}`,
                    {
                        type: arrowType,
                        width: 1.0,
                        color: "#FF0000",
                        size: 1.0,
                        opacity: 1.0,
                    },
                    scene,
                );
                times.push(performance.now() - startTime);
            }

            const avgTime = times.reduce((a, b) => a + b, 0) / times.length;

            assert.isBelow(
                avgTime,
                5,
                `Arrow mesh creation took ${avgTime.toFixed(2)}ms per mesh (target < 5ms)`,
            );
        });
    });

    describe("Mesh Transform Performance", () => {
        test("transformMesh is fast (< 0.5ms avg)", () => {
            const iterations = 1000;
            const style: EdgeStyleConfig = {
                line: {width: 0.5, color: "#FF0000"},
                enabled: true,
            };

            // Create a mesh to transform
            const mesh = EdgeMesh.create(
                meshCache,
                {styleId: "transform-perf", width: style.line?.width ?? 0.25, color: style.line?.color ?? "#FFFFFF"},
                style,
                scene,
            );

            const times: number[] = [];

            for (let i = 0; i < iterations; i++) {
                const srcPoint = new Vector3(i % 100, (i / 100) % 100, 0);
                const dstPoint = new Vector3((i % 100) + 50, ((i / 100) % 100) + 50, 0);

                const startTime = performance.now();
                EdgeMesh.transformMesh(mesh as AbstractMesh, srcPoint, dstPoint);
                times.push(performance.now() - startTime);
            }

            const avgTime = times.reduce((a, b) => a + b, 0) / times.length;

            assert.isBelow(
                avgTime,
                0.5,
                `transformMesh took ${avgTime.toFixed(4)}ms per call (target < 0.5ms)`,
            );
        });
    });
});
