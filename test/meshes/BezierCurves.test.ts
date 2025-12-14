import {Vector3} from "@babylonjs/core";
import {assert, describe, test} from "vitest";

import {EDGE_CONSTANTS} from "../../src/constants/meshConstants";
import {EdgeMesh} from "../../src/meshes/EdgeMesh";

describe("Bezier Curve Generation", () => {
    test("generates smooth curve between two points", () => {
        const src = new Vector3(0, 0, 0);
        const dst = new Vector3(10, 0, 0);

        const curvePoints = EdgeMesh.createBezierLine(src, dst);

        // Should have more points than straight line (more than just src and dst)
        assert.isTrue(curvePoints.length > 6, `Expected more than 6 points, got ${curvePoints.length}`);

        // First and last points should match input
        assert.closeTo(curvePoints[0], src.x, 0.01, "First X coordinate should match source");
        assert.closeTo(curvePoints[1], src.y, 0.01, "First Y coordinate should match source");
        assert.closeTo(curvePoints[2], src.z, 0.01, "First Z coordinate should match source");

        assert.closeTo(curvePoints[curvePoints.length - 3], dst.x, 0.01, "Last X coordinate should match destination");
        assert.closeTo(curvePoints[curvePoints.length - 2], dst.y, 0.01, "Last Y coordinate should match destination");
        assert.closeTo(curvePoints[curvePoints.length - 1], dst.z, 0.01, "Last Z coordinate should match destination");
    });

    test("automatic control points create natural curve", () => {
        const src = new Vector3(0, 0, 0);
        const dst = new Vector3(10, 10, 0);

        const curvePoints = EdgeMesh.createBezierLine(src, dst);

        // Curve should deviate from straight line
        const midIdx = Math.floor(curvePoints.length / 2 / 3) * 3;
        const midPoint = new Vector3(
            curvePoints[midIdx],
            curvePoints[midIdx + 1],
            curvePoints[midIdx + 2],
        );

        const straightMid = Vector3.Lerp(src, dst, 0.5);

        // Midpoint should not be on straight line
        // At least one coordinate should differ significantly
        const xDiff = Math.abs(midPoint.x - straightMid.x);
        const yDiff = Math.abs(midPoint.y - straightMid.y);
        const zDiff = Math.abs(midPoint.z - straightMid.z);

        assert.isTrue(
            xDiff > 0.1 || yDiff > 0.1 || zDiff > 0.1,
            `Curve midpoint should deviate from straight line (diffs: x=${xDiff}, y=${yDiff}, z=${zDiff})`,
        );
    });

    test("point density creates smooth curves", () => {
        const src = new Vector3(0, 0, 0);
        const dst = new Vector3(100, 0, 0); // Long edge

        const curvePoints = EdgeMesh.createBezierLine(src, dst);

        // Should have density proportional to edge length
        const distance = Vector3.Distance(src, dst);
        const estimatedLength = distance * 1.5; // Bezier curves are ~1.5x longer
        const expectedPoints = Math.max(10, Math.ceil(estimatedLength * EDGE_CONSTANTS.BEZIER_POINT_DENSITY));

        // Allow 20% tolerance
        assert.closeTo(
            curvePoints.length / 3,
            expectedPoints + 1, // +1 because we generate numPoints+1 points (0 to numPoints inclusive)
            (expectedPoints + 1) * 0.2,
            `Expected ~${expectedPoints + 1} points for ${distance} unit edge`,
        );
    });

    test("handles very short edges gracefully", () => {
        const src = new Vector3(0, 0, 0);
        const dst = new Vector3(0.1, 0, 0); // Very short

        const curvePoints = EdgeMesh.createBezierLine(src, dst);

        // Should still generate valid curve (minimum points)
        assert.isTrue(curvePoints.length >= 6, `Very short edges should have at least 6 values (2 points), got ${curvePoints.length}`);
    });

    test("handles self-loops (source === destination)", () => {
        const point = new Vector3(5, 5, 5);

        const curvePoints = EdgeMesh.createBezierLine(point, point);

        // Should generate circular loop
        assert.isTrue(curvePoints.length > 6, "Self-loop should have multiple points");

        // First and last points should be close (forming a loop)
        const firstPoint = new Vector3(curvePoints[0], curvePoints[1], curvePoints[2]);
        const lastPoint = new Vector3(
            curvePoints[curvePoints.length - 3],
            curvePoints[curvePoints.length - 2],
            curvePoints[curvePoints.length - 1],
        );

        assert.closeTo(
            Vector3.Distance(firstPoint, lastPoint),
            0,
            0.1,
            "Self-loop should start and end at same point",
        );
    });

    test("generated curve is continuous", () => {
        const src = new Vector3(0, 0, 0);
        const dst = new Vector3(10, 5, 3);

        const curvePoints = EdgeMesh.createBezierLine(src, dst);

        // Verify no discontinuities (no sudden jumps between adjacent points)
        const maxSegmentLength = 2.0; // Maximum reasonable distance between adjacent points

        for (let i = 3; i < curvePoints.length; i += 3) {
            const p1 = new Vector3(curvePoints[i - 3], curvePoints[i - 2], curvePoints[i - 1]);
            const p2 = new Vector3(curvePoints[i], curvePoints[i + 1], curvePoints[i + 2]);
            const distance = Vector3.Distance(p1, p2);

            assert.isTrue(
                distance < maxSegmentLength,
                `Discontinuity detected: segment ${i / 3} has length ${distance}`,
            );
        }
    });

    test("bezier curve is smooth (no sharp angles)", () => {
        const src = new Vector3(0, 0, 0);
        const dst = new Vector3(10, 0, 0);

        const curvePoints = EdgeMesh.createBezierLine(src, dst);

        // Check that the curve doesn't have sharp angles
        // Skip first and last segments (endpoints can have sharper angles)
        const minDotProduct = 0.5; // ~60 degrees maximum angle change

        for (let i = 6; i < curvePoints.length - 6; i += 3) {
            const p1 = new Vector3(curvePoints[i - 3], curvePoints[i - 2], curvePoints[i - 1]);
            const p2 = new Vector3(curvePoints[i], curvePoints[i + 1], curvePoints[i + 2]);
            const p3 = new Vector3(curvePoints[i + 3], curvePoints[i + 4], curvePoints[i + 5]);

            const dir1 = p2.subtract(p1).normalize();
            const dir2 = p3.subtract(p2).normalize();
            const dotProduct = Vector3.Dot(dir1, dir2);

            assert.isTrue(
                dotProduct > minDotProduct,
                `Sharp angle detected at segment ${i / 3}: dot product = ${dotProduct}`,
            );
        }
    });
});
