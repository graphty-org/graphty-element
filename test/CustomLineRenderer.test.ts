/**
 * Property-Based Tests for CustomLineRenderer
 *
 * Tests the geometry generation logic using fast-check to verify mathematical
 * properties and invariants hold across a wide range of inputs.
 */

import {Vector3} from "@babylonjs/core";
import fc from "fast-check";
import {assert, describe, test} from "vitest";

import {CustomLineRenderer} from "../src/meshes/CustomLineRenderer";

describe("CustomLineRenderer Sinewave Geometry", () => {
    test("createSinewaveGeometry generates wave pattern", () => {
        const points = [
            new Vector3(0, 0, 0),
            new Vector3(10, 0, 0),
        ];
        const amplitude = 1.0;
        const frequency = 2.0;

        const wavePoints = CustomLineRenderer.createSinewaveGeometry(points, amplitude, frequency);

        // Should generate multiple points
        assert.isAtLeast(wavePoints.length, 10);

        // Points should vary in perpendicular direction (Y or Z)
        let hasVariation = false;
        for (const point of wavePoints) {
            if (Math.abs(point.y) > 0.01 || Math.abs(point.z) > 0.01) {
                hasVariation = true;
                break;
            }
        }
        assert.isTrue(hasVariation, "Sinewave should have perpendicular variation");
    });

    test("createSinewaveGeometry amplitude affects wave height", () => {
        const points = [
            new Vector3(0, 0, 0),
            new Vector3(10, 0, 0),
        ];

        const smallAmp = CustomLineRenderer.createSinewaveGeometry(points, 0.5, 2.0);
        const largeAmp = CustomLineRenderer.createSinewaveGeometry(points, 2.0, 2.0);

        // Find max deviation from line
        const getMaxDeviation = (pts: Vector3[]): number => {
            return pts.reduce((max, p) => Math.max(max, Math.abs(p.y), Math.abs(p.z)), 0);
        };

        const smallMax = getMaxDeviation(smallAmp);
        const largeMax = getMaxDeviation(largeAmp);

        assert.isAbove(largeMax, smallMax, "Larger amplitude should produce larger deviation");
    });

    test("createSinewaveGeometry frequency affects wave count", () => {
        const points = [
            new Vector3(0, 0, 0),
            new Vector3(10, 0, 0),
        ];

        const lowFreq = CustomLineRenderer.createSinewaveGeometry(points, 1.0, 1.0);
        const highFreq = CustomLineRenderer.createSinewaveGeometry(points, 1.0, 5.0);

        // Higher frequency should have more direction changes
        // Count zero crossings (approximation of frequency)
        const countCrossings = (pts: Vector3[]): number => {
            let crossings = 0;
            for (let i = 1; i < pts.length; i++) {
                // Check if perpendicular component crossed zero
                const prevPerp = Math.abs(pts[i - 1].y) > 0.001 ? pts[i - 1].y : pts[i - 1].z;
                const currPerp = Math.abs(pts[i].y) > 0.001 ? pts[i].y : pts[i].z;
                if ((prevPerp > 0 && currPerp < 0) || (prevPerp < 0 && currPerp > 0)) {
                    crossings++;
                }
            }
            return crossings;
        };

        const lowCrossings = countCrossings(lowFreq);
        const highCrossings = countCrossings(highFreq);

        assert.isAbove(highCrossings, lowCrossings, "Higher frequency should have more zero crossings");
    });

    test("createSinewaveGeometry throws for single point", () => {
        assert.throws(() => {
            CustomLineRenderer.createSinewaveGeometry([new Vector3(0, 0, 0)], 1.0, 1.0);
        }, /at least 2 points/i);
    });
});

describe("CustomLineRenderer Zigzag Geometry", () => {
    test("createZigzagGeometry generates angular pattern", () => {
        const points = [
            new Vector3(0, 0, 0),
            new Vector3(10, 0, 0),
        ];
        const amplitude = 1.0;
        const frequency = 4;

        const zigzagPoints = CustomLineRenderer.createZigzagGeometry(points, amplitude, frequency);

        // Should generate multiple points
        assert.isAtLeast(zigzagPoints.length, frequency);

        // Points should alternate in perpendicular direction
        let hasVariation = false;
        for (const point of zigzagPoints) {
            if (Math.abs(point.y) > 0.01 || Math.abs(point.z) > 0.01) {
                hasVariation = true;
                break;
            }
        }
        assert.isTrue(hasVariation, "Zigzag should have perpendicular variation");
    });

    test("createZigzagGeometry amplitude affects zigzag height", () => {
        const points = [
            new Vector3(0, 0, 0),
            new Vector3(10, 0, 0),
        ];

        const smallAmp = CustomLineRenderer.createZigzagGeometry(points, 0.5, 4);
        const largeAmp = CustomLineRenderer.createZigzagGeometry(points, 2.0, 4);

        const getMaxDeviation = (pts: Vector3[]): number => {
            return pts.reduce((max, p) => Math.max(max, Math.abs(p.y), Math.abs(p.z)), 0);
        };

        const smallMax = getMaxDeviation(smallAmp);
        const largeMax = getMaxDeviation(largeAmp);

        assert.isAbove(largeMax, smallMax, "Larger amplitude should produce larger zigzag");
    });

    test("createZigzagGeometry points alternate sides", () => {
        const points = [
            new Vector3(0, 0, 0),
            new Vector3(10, 0, 0),
        ];

        const zigzagPoints = CustomLineRenderer.createZigzagGeometry(points, 1.0, 4);

        // Check that consecutive points alternate sides
        // First, determine which axis has the perpendicular offset
        let perpAxis: "y" | "z" = "y";
        for (const p of zigzagPoints) {
            if (Math.abs(p.y) > 0.001) {
                perpAxis = "y";
                break;
            }
            if (Math.abs(p.z) > 0.001) {
                perpAxis = "z";
                break;
            }
        }

        // Count sign changes
        let signChanges = 0;
        for (let i = 1; i < zigzagPoints.length; i++) {
            const prev = zigzagPoints[i - 1][perpAxis];
            const curr = zigzagPoints[i][perpAxis];
            if ((prev > 0.001 && curr < -0.001) || (prev < -0.001 && curr > 0.001)) {
                signChanges++;
            }
        }

        // Zigzag should have alternating signs
        assert.isAbove(signChanges, 0, "Zigzag should have alternating sides");
    });

    test("createZigzagGeometry throws for single point", () => {
        assert.throws(() => {
            CustomLineRenderer.createZigzagGeometry([new Vector3(0, 0, 0)], 1.0, 4);
        }, /at least 2 points/i);
    });
});

describe("CustomLineRenderer Mesh Creation", () => {
    test("create returns mesh with shader material", () => {
        const {NullEngine, Scene} = require("@babylonjs/core");
        const engine = new NullEngine();
        const scene = new Scene(engine);

        const mesh = CustomLineRenderer.create(
            {
                points: [new Vector3(0, 0, 0), new Vector3(10, 0, 0)],
                width: 2,
                color: "#ff0000",
            },
            scene,
        );

        assert.exists(mesh);
        assert.exists(mesh.material);

        mesh.dispose();
        scene.dispose();
        engine.dispose();
    });

    test("create sets custom vertex attributes", () => {
        const {NullEngine, Scene} = require("@babylonjs/core");
        const engine = new NullEngine();
        const scene = new Scene(engine);

        const mesh = CustomLineRenderer.create(
            {
                points: [new Vector3(0, 0, 0), new Vector3(10, 0, 0)],
                width: 2,
                color: "#00ff00",
            },
            scene,
        );

        // Check custom attributes exist
        const direction = mesh.getVerticesData("direction");
        const side = mesh.getVerticesData("side");
        const distance = mesh.getVerticesData("distance");
        const segmentStart = mesh.getVerticesData("segmentStart");
        const segmentEnd = mesh.getVerticesData("segmentEnd");

        assert.exists(direction, "direction attribute should exist");
        assert.exists(side, "side attribute should exist");
        assert.exists(distance, "distance attribute should exist");
        assert.exists(segmentStart, "segmentStart attribute should exist");
        assert.exists(segmentEnd, "segmentEnd attribute should exist");

        mesh.dispose();
        scene.dispose();
        engine.dispose();
    });

    test("create disables frustum culling", () => {
        const {NullEngine, Scene} = require("@babylonjs/core");
        const engine = new NullEngine();
        const scene = new Scene(engine);

        const mesh = CustomLineRenderer.create(
            {
                points: [new Vector3(0, 0, 0), new Vector3(10, 0, 0)],
                width: 2,
                color: "#0000ff",
            },
            scene,
        );

        assert.isTrue(mesh.alwaysSelectAsActiveMesh, "Frustum culling should be disabled");

        mesh.dispose();
        scene.dispose();
        engine.dispose();
    });

    test("createStraightLine is convenience method for two-point line", () => {
        const {NullEngine, Scene} = require("@babylonjs/core");
        const engine = new NullEngine();
        const scene = new Scene(engine);

        const mesh = CustomLineRenderer.createStraightLine(
            new Vector3(0, 0, 0),
            new Vector3(5, 5, 5),
            3,
            "#ffffff",
            scene,
            0.8,
        );

        assert.exists(mesh);
        assert.exists(mesh.material);

        mesh.dispose();
        scene.dispose();
        engine.dispose();
    });

    test("createFromGeometry creates mesh from pre-computed geometry", () => {
        const {NullEngine, Scene} = require("@babylonjs/core");
        const engine = new NullEngine();
        const scene = new Scene(engine);

        const geometry = CustomLineRenderer.createLineGeometry([
            new Vector3(0, 0, 0),
            new Vector3(10, 0, 0),
        ]);

        const mesh = CustomLineRenderer.createFromGeometry(
            geometry,
            {width: 2, color: "#ff00ff", opacity: 0.9},
            scene,
        );

        assert.exists(mesh);
        assert.exists(mesh.material);
        assert.isTrue(mesh.alwaysSelectAsActiveMesh);

        mesh.dispose();
        scene.dispose();
        engine.dispose();
    });
});

describe("CustomLineRenderer Geometry Generation", () => {
    // Helper to generate random Vector3 points
    // Filter out NaN/Infinity to avoid comparison issues
    const vector3Arb = fc.record({
        x: fc.float({min: Math.fround(-100), max: Math.fround(100), noNaN: true}),
        y: fc.float({min: Math.fround(-100), max: Math.fround(100), noNaN: true}),
        z: fc.float({min: Math.fround(-100), max: Math.fround(100), noNaN: true}),
    }).map(({x, y, z}) => new Vector3(x, y, z));

    describe("Basic Geometry Properties", () => {
        test("generates correct number of vertices for N points", () => {
            fc.assert(fc.property(
                fc.array(vector3Arb, {minLength: 2, maxLength: 10}),
                (points) => {
                    const geometry = CustomLineRenderer.createLineGeometry(points);
                    const numSegments = points.length - 1;
                    const expectedVertices = numSegments * 4; // 4 vertices per segment

                    assert.equal(geometry.positions.length, expectedVertices * 3); // 3 floats per vertex
                    assert.equal(geometry.directions.length, expectedVertices * 3);
                    assert.equal(geometry.sides.length, expectedVertices);
                    assert.equal(geometry.distances.length, expectedVertices);
                    assert.equal(geometry.uvs.length, expectedVertices * 2); // 2 floats per UV
                },
            ), {numRuns: 50});
        });

        test("generates correct number of indices for N points", () => {
            fc.assert(fc.property(
                fc.array(vector3Arb, {minLength: 2, maxLength: 10}),
                (points) => {
                    const geometry = CustomLineRenderer.createLineGeometry(points);
                    const numSegments = points.length - 1;
                    const expectedIndices = numSegments * 6; // 2 triangles × 3 indices per segment

                    assert.equal(geometry.indices.length, expectedIndices);
                },
            ), {numRuns: 50});
        });

        test("minimum case: 2 points creates exactly 1 quad (4 vertices, 6 indices)", () => {
            fc.assert(fc.property(
                vector3Arb,
                vector3Arb,
                (p1, p2) => {
                    const geometry = CustomLineRenderer.createLineGeometry([p1, p2]);

                    // 1 segment = 4 vertices
                    assert.equal(geometry.positions.length, 12); // 4 vertices × 3
                    assert.equal(geometry.sides.length, 4);

                    // 1 segment = 2 triangles = 6 indices
                    assert.equal(geometry.indices.length, 6);
                },
            ), {numRuns: 30});
        });
    });

    describe("Side Attribute Properties", () => {
        test("sides alternate [-1, +1, -1, +1] for each quad", () => {
            fc.assert(fc.property(
                fc.array(vector3Arb, {minLength: 2, maxLength: 5}),
                (points) => {
                    const geometry = CustomLineRenderer.createLineGeometry(points);

                    // Check pattern: -1, +1, -1, +1, -1, +1, ...
                    for (let i = 0; i < geometry.sides.length; i++) {
                        const expectedSide = (i % 2 === 0) ? -1 : 1;
                        assert.equal(geometry.sides[i], expectedSide, `Side at index ${i} should be ${expectedSide}`);
                    }
                },
            ), {numRuns: 30});
        });
    });

    describe("Direction Vector Properties", () => {
        test("each segment has identical direction vectors for all 4 vertices", () => {
            fc.assert(fc.property(
                fc.array(vector3Arb, {minLength: 2, maxLength: 5}),
                (points) => {
                    const geometry = CustomLineRenderer.createLineGeometry(points);

                    // Check each segment's 4 vertices
                    const numSegments = points.length - 1;
                    for (let seg = 0; seg < numSegments; seg++) {
                        const baseIdx = seg * 4 * 3; // 4 vertices × 3 floats per segment

                        // All 4 vertices in this segment should have same direction
                        for (let v = 1; v < 4; v++) {
                            const v0Idx = baseIdx;
                            const vIdx = baseIdx + (v * 3);

                            assert.approximately(
                                geometry.directions[vIdx],
                                geometry.directions[v0Idx],
                                0.0001,
                                `Direction X at vertex ${v} of segment ${seg}`,
                            );
                            assert.approximately(
                                geometry.directions[vIdx + 1],
                                geometry.directions[v0Idx + 1],
                                0.0001,
                                `Direction Y at vertex ${v} of segment ${seg}`,
                            );
                            assert.approximately(
                                geometry.directions[vIdx + 2],
                                geometry.directions[v0Idx + 2],
                                0.0001,
                                `Direction Z at vertex ${v} of segment ${seg}`,
                            );
                        }
                    }
                },
            ), {numRuns: 30});
        });

        test("direction vector equals actual segment vector (p1 - p0)", () => {
            fc.assert(fc.property(
                fc.array(vector3Arb, {minLength: 2, maxLength: 5}),
                (points) => {
                    const geometry = CustomLineRenderer.createLineGeometry(points);

                    // Check each segment
                    for (let i = 0; i < points.length - 1; i++) {
                        const expectedDir = points[i + 1].subtract(points[i]);
                        const dirIdx = i * 4 * 3; // First vertex of this segment

                        assert.approximately(
                            geometry.directions[dirIdx],
                            expectedDir.x,
                            0.0001,
                            `Segment ${i} direction X`,
                        );
                        assert.approximately(
                            geometry.directions[dirIdx + 1],
                            expectedDir.y,
                            0.0001,
                            `Segment ${i} direction Y`,
                        );
                        assert.approximately(
                            geometry.directions[dirIdx + 2],
                            expectedDir.z,
                            0.0001,
                            `Segment ${i} direction Z`,
                        );
                    }
                },
            ), {numRuns: 30});
        });
    });

    describe("Position Properties", () => {
        test("first 2 vertices of segment have start position, last 2 have end position", () => {
            fc.assert(fc.property(
                fc.array(vector3Arb, {minLength: 2, maxLength: 5}),
                (points) => {
                    const geometry = CustomLineRenderer.createLineGeometry(points);

                    for (let seg = 0; seg < points.length - 1; seg++) {
                        const p0 = points[seg];
                        const p1 = points[seg + 1];
                        const baseIdx = seg * 4 * 3;

                        // First 2 vertices (indices 0, 1) should be at p0
                        for (let v = 0; v < 2; v++) {
                            const vIdx = baseIdx + (v * 3);
                            assert.approximately(geometry.positions[vIdx], p0.x, 0.0001);
                            assert.approximately(geometry.positions[vIdx + 1], p0.y, 0.0001);
                            assert.approximately(geometry.positions[vIdx + 2], p0.z, 0.0001);
                        }

                        // Last 2 vertices (indices 2, 3) should be at p1
                        for (let v = 2; v < 4; v++) {
                            const vIdx = baseIdx + (v * 3);
                            assert.approximately(geometry.positions[vIdx], p1.x, 0.0001);
                            assert.approximately(geometry.positions[vIdx + 1], p1.y, 0.0001);
                            assert.approximately(geometry.positions[vIdx + 2], p1.z, 0.0001);
                        }
                    }
                },
            ), {numRuns: 30});
        });
    });

    describe("Distance Properties", () => {
        test("distance is monotonically increasing", () => {
            fc.assert(fc.property(
                fc.array(vector3Arb, {minLength: 2, maxLength: 5}),
                (points) => {
                    const geometry = CustomLineRenderer.createLineGeometry(points);

                    // Distance should never decrease
                    for (let i = 1; i < geometry.distances.length; i++) {
                        assert.isTrue(
                            geometry.distances[i] >= geometry.distances[i - 1],
                            `Distance should be monotonically increasing at index ${i}`,
                        );
                    }
                },
            ), {numRuns: 30});
        });

        test("distance starts at 0", () => {
            fc.assert(fc.property(
                fc.array(vector3Arb, {minLength: 2, maxLength: 5}),
                (points) => {
                    const geometry = CustomLineRenderer.createLineGeometry(points);
                    assert.equal(geometry.distances[0], 0);
                },
            ), {numRuns: 20});
        });

        test("vertices at segment boundaries have same distance", () => {
            fc.assert(fc.property(
                fc.array(vector3Arb, {minLength: 3, maxLength: 5}), // Need at least 2 segments
                (points) => {
                    const geometry = CustomLineRenderer.createLineGeometry(points);

                    // Check each segment boundary (where segments meet)
                    for (let seg = 0; seg < points.length - 2; seg++) {
                        // End of current segment (vertices 2, 3)
                        const endIdx1 = (seg * 4) + 2;
                        const endIdx2 = (seg * 4) + 3;

                        // Start of next segment (vertices 0, 1)
                        const startIdx1 = ((seg + 1) * 4);
                        const startIdx2 = ((seg + 1) * 4) + 1;

                        // All 4 vertices at the boundary should have the same distance
                        assert.approximately(
                            geometry.distances[endIdx1],
                            geometry.distances[endIdx2],
                            0.0001,
                        );
                        assert.approximately(
                            geometry.distances[startIdx1],
                            geometry.distances[startIdx2],
                            0.0001,
                        );
                        assert.approximately(
                            geometry.distances[endIdx1],
                            geometry.distances[startIdx1],
                            0.0001,
                        );
                    }
                },
            ), {numRuns: 30});
        });
    });

    describe("Index Properties", () => {
        test("all indices are within valid vertex range", () => {
            fc.assert(fc.property(
                fc.array(vector3Arb, {minLength: 2, maxLength: 10}),
                (points) => {
                    const geometry = CustomLineRenderer.createLineGeometry(points);
                    const numVertices = (points.length - 1) * 4;

                    for (const index of geometry.indices) {
                        assert.isTrue(
                            index >= 0 && index < numVertices,
                            `Index ${index} out of range [0, ${numVertices})`,
                        );
                    }
                },
            ), {numRuns: 30});
        });

        test("indices form valid triangles (groups of 3)", () => {
            fc.assert(fc.property(
                fc.array(vector3Arb, {minLength: 2, maxLength: 5}),
                (points) => {
                    const geometry = CustomLineRenderer.createLineGeometry(points);

                    // Should be divisible by 3
                    assert.equal(geometry.indices.length % 3, 0);

                    // Check winding order is consistent
                    for (let i = 0; i < geometry.indices.length; i += 3) {
                        const i0 = geometry.indices[i];
                        const i1 = geometry.indices[i + 1];
                        const i2 = geometry.indices[i + 2];

                        // Indices should not all be the same (degenerate triangle)
                        assert.isFalse(
                            i0 === i1 && i1 === i2,
                            `Degenerate triangle at indices ${i}, ${i + 1}, ${i + 2}`,
                        );
                    }
                },
            ), {numRuns: 30});
        });
    });

    describe("Edge Cases", () => {
        test("handles zero-length segments without crashing", () => {
            fc.assert(fc.property(
                vector3Arb,
                (point) => {
                    // Same point twice = zero-length segment
                    const geometry = CustomLineRenderer.createLineGeometry([point, point]);

                    // Should still generate geometry (4 vertices, 6 indices)
                    assert.equal(geometry.positions.length, 12);
                    assert.equal(geometry.indices.length, 6);

                    // Direction should be zero vector
                    assert.equal(geometry.directions[0], 0);
                    assert.equal(geometry.directions[1], 0);
                    assert.equal(geometry.directions[2], 0);
                },
            ), {numRuns: 20});
        });

        test("throws error for single point", () => {
            fc.assert(fc.property(
                vector3Arb,
                (point) => {
                    assert.throws(() => {
                        CustomLineRenderer.createLineGeometry([point]);
                    }, /at least 2 points/i);
                },
            ), {numRuns: 10});
        });

        test("throws error for empty array", () => {
            assert.throws(() => {
                CustomLineRenderer.createLineGeometry([]);
            }, /at least 2 points/i);
        });

        test("handles very small segments", () => {
            fc.assert(fc.property(
                vector3Arb,
                fc.float({min: Math.fround(0.0001), max: Math.fround(0.001), noNaN: true}),
                (start, epsilon) => {
                    const end = new Vector3(
                        start.x + epsilon,
                        start.y + epsilon,
                        start.z + epsilon,
                    );
                    const geometry = CustomLineRenderer.createLineGeometry([start, end]);

                    // Should still generate valid geometry
                    assert.equal(geometry.positions.length, 12);
                    assert.equal(geometry.indices.length, 6);
                },
            ), {numRuns: 20});
        });

        test("handles very large coordinates", () => {
            fc.assert(fc.property(
                fc.float({min: Math.fround(-10000), max: Math.fround(10000), noNaN: true}),
                fc.float({min: Math.fround(-10000), max: Math.fround(10000), noNaN: true}),
                fc.float({min: Math.fround(-10000), max: Math.fround(10000), noNaN: true}),
                (x, y, z) => {
                    const points = [
                        new Vector3(x, y, z),
                        new Vector3(x + 1000, y + 1000, z + 1000),
                    ];
                    const geometry = CustomLineRenderer.createLineGeometry(points);

                    assert.equal(geometry.positions.length, 12);
                    assert.equal(geometry.indices.length, 6);
                },
            ), {numRuns: 20});
        });
    });

    describe("UV Coordinates", () => {
        test("UVs are always in valid range [0, 1]", () => {
            fc.assert(fc.property(
                fc.array(vector3Arb, {minLength: 2, maxLength: 5}),
                (points) => {
                    const geometry = CustomLineRenderer.createLineGeometry(points);

                    for (let i = 0; i < geometry.uvs.length; i++) {
                        assert.isTrue(
                            geometry.uvs[i] >= 0 && geometry.uvs[i] <= 1,
                            `UV coordinate at index ${i} is ${geometry.uvs[i]}, should be in [0, 1]`,
                        );
                    }
                },
            ), {numRuns: 30});
        });
    });

    describe("Straight Line Properties", () => {
        test("all direction vectors are parallel for straight line", () => {
            fc.assert(fc.property(
                vector3Arb,
                vector3Arb,
                fc.integer({min: 2, max: 5}), // number of points
                (start, direction, numPoints) => {
                    // Create evenly spaced points along a straight line
                    const points = [];
                    for (let i = 0; i < numPoints; i++) {
                        points.push(new Vector3(
                            start.x + (direction.x * i),
                            start.y + (direction.y * i),
                            start.z + (direction.z * i),
                        ));
                    }

                    const geometry = CustomLineRenderer.createLineGeometry(points);
                    const numSegments = points.length - 1;

                    // All segments should have proportional direction vectors
                    // (scaled by segment length but same direction)
                    for (let seg = 1; seg < numSegments; seg++) {
                        const prevDirIdx = (seg - 1) * 4 * 3;
                        const currDirIdx = seg * 4 * 3;

                        const prevDir = new Vector3(
                            geometry.directions[prevDirIdx],
                            geometry.directions[prevDirIdx + 1],
                            geometry.directions[prevDirIdx + 2],
                        );
                        const currDir = new Vector3(
                            geometry.directions[currDirIdx],
                            geometry.directions[currDirIdx + 1],
                            geometry.directions[currDirIdx + 2],
                        );

                        // Skip if either direction is zero vector
                        if (prevDir.lengthSquared() < 0.0001 || currDir.lengthSquared() < 0.0001) {
                            return;
                        }

                        // Normalize and compare
                        const prevNorm = prevDir.normalize();
                        const currNorm = currDir.normalize();

                        assert.approximately(prevNorm.x, currNorm.x, 0.01);
                        assert.approximately(prevNorm.y, currNorm.y, 0.01);
                        assert.approximately(prevNorm.z, currNorm.z, 0.01);
                    }
                },
            ), {numRuns: 20});
        });
    });
});
