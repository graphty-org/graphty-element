/**
 * Regression tests for arrowhead orientation bug
 *
 * This test suite verifies that the quaternion rotation logic for 2D arrowheads
 * produces the correct orientation for edges at various angles.
 *
 * The bug was that 2D arrowheads were only correct for horizontal edges due to
 * incorrect Euler angle rotation order (YXZ intrinsic). The fix uses quaternion
 * composition to properly apply rotations:
 * 1. First rotate 90° around X (to bring arrow from XZ plane to XY plane)
 * 2. Then rotate by edge angle around Z (to align with edge direction)
 *
 * Using quaternion composition qZ * qX ensures rotations are applied in the
 * correct order (X first, then Z in world space).
 */
import {Matrix, Quaternion, Vector3} from "@babylonjs/core";
import {assert, describe, test} from "vitest";

/**
 * Simulate the 2D arrow rotation using the same logic as Edge.transformArrowCap
 * Returns the world direction the arrow would point after rotation
 */
function compute2DArrowDirection(edgeAngle: number): Vector3 {
    // Arrow geometry points along local +X in XZ plane
    const localDirection = new Vector3(1, 0, 0);

    // Step 1: Rotation around X by 90° (brings arrow from XZ plane to XY plane)
    const qX = Quaternion.RotationAxis(Vector3.Right(), Math.PI / 2);
    // Step 2: Rotation around Z by angle (aligns arrow with edge direction in XY plane)
    const qZ = Quaternion.RotationAxis(Vector3.Forward(), edgeAngle);

    // Compose rotations: for "apply qX first, then qZ", use qZ * qX
    const qFinal = qZ.multiply(qX);

    // Create rotation matrix from quaternion
    const rotationMatrix = new Matrix();
    qFinal.toRotationMatrix(rotationMatrix);

    // Transform the local direction to world direction
    return Vector3.TransformNormal(localDirection, rotationMatrix).normalize();
}

/**
 * Calculate angle between two vectors in degrees
 */
function angleBetweenVectors(v1: Vector3, v2: Vector3): number {
    const dot = Vector3.Dot(v1.normalize(), v2.normalize());
    const clampedDot = Math.max(-1, Math.min(1, dot));
    return Math.acos(clampedDot) * (180 / Math.PI);
}

describe("2D Arrow Quaternion Rotation Math", () => {
    const tolerance = 0.1; // degrees tolerance

    test("horizontal edge (0°) arrow points along +X", () => {
        const angle = 0;
        const expectedDir = new Vector3(1, 0, 0);
        const actualDir = compute2DArrowDirection(angle);

        const angleDiff = angleBetweenVectors(expectedDir, actualDir);
        assert(
            angleDiff < tolerance,
            `0° edge: Arrow direction differs by ${angleDiff.toFixed(3)}° from expected. ` +
            `Expected: (${expectedDir.x.toFixed(3)}, ${expectedDir.y.toFixed(3)}, ${expectedDir.z.toFixed(3)}), ` +
            `Actual: (${actualDir.x.toFixed(3)}, ${actualDir.y.toFixed(3)}, ${actualDir.z.toFixed(3)})`,
        );
    });

    test("vertical edge (90°) arrow points along +Y", () => {
        const angle = Math.PI / 2; // 90°
        const expectedDir = new Vector3(0, 1, 0);
        const actualDir = compute2DArrowDirection(angle);

        const angleDiff = angleBetweenVectors(expectedDir, actualDir);
        assert(
            angleDiff < tolerance,
            `90° edge: Arrow direction differs by ${angleDiff.toFixed(3)}° from expected. ` +
            `Expected: (${expectedDir.x.toFixed(3)}, ${expectedDir.y.toFixed(3)}, ${expectedDir.z.toFixed(3)}), ` +
            `Actual: (${actualDir.x.toFixed(3)}, ${actualDir.y.toFixed(3)}, ${actualDir.z.toFixed(3)})`,
        );
    });

    test("45° diagonal edge arrow points up-right", () => {
        const angle = Math.PI / 4; // 45°
        const expectedDir = new Vector3(1, 1, 0).normalize();
        const actualDir = compute2DArrowDirection(angle);

        const angleDiff = angleBetweenVectors(expectedDir, actualDir);
        assert(
            angleDiff < tolerance,
            `45° edge: Arrow direction differs by ${angleDiff.toFixed(3)}° from expected. ` +
            `Expected: (${expectedDir.x.toFixed(3)}, ${expectedDir.y.toFixed(3)}, ${expectedDir.z.toFixed(3)}), ` +
            `Actual: (${actualDir.x.toFixed(3)}, ${actualDir.y.toFixed(3)}, ${actualDir.z.toFixed(3)})`,
        );
    });

    test("135° diagonal edge arrow points up-left", () => {
        const angle = (3 * Math.PI) / 4; // 135°
        const expectedDir = new Vector3(-1, 1, 0).normalize();
        const actualDir = compute2DArrowDirection(angle);

        const angleDiff = angleBetweenVectors(expectedDir, actualDir);
        assert(
            angleDiff < tolerance,
            `135° edge: Arrow direction differs by ${angleDiff.toFixed(3)}° from expected. ` +
            `Expected: (${expectedDir.x.toFixed(3)}, ${expectedDir.y.toFixed(3)}, ${expectedDir.z.toFixed(3)}), ` +
            `Actual: (${actualDir.x.toFixed(3)}, ${actualDir.y.toFixed(3)}, ${actualDir.z.toFixed(3)})`,
        );
    });

    test("180° edge arrow points along -X", () => {
        const angle = Math.PI; // 180°
        const expectedDir = new Vector3(-1, 0, 0);
        const actualDir = compute2DArrowDirection(angle);

        const angleDiff = angleBetweenVectors(expectedDir, actualDir);
        assert(
            angleDiff < tolerance,
            `180° edge: Arrow direction differs by ${angleDiff.toFixed(3)}° from expected. ` +
            `Expected: (${expectedDir.x.toFixed(3)}, ${expectedDir.y.toFixed(3)}, ${expectedDir.z.toFixed(3)}), ` +
            `Actual: (${actualDir.x.toFixed(3)}, ${actualDir.y.toFixed(3)}, ${actualDir.z.toFixed(3)})`,
        );
    });

    test("-45° diagonal edge arrow points down-right", () => {
        const angle = -Math.PI / 4; // -45°
        const expectedDir = new Vector3(1, -1, 0).normalize();
        const actualDir = compute2DArrowDirection(angle);

        const angleDiff = angleBetweenVectors(expectedDir, actualDir);
        assert(
            angleDiff < tolerance,
            `-45° edge: Arrow direction differs by ${angleDiff.toFixed(3)}° from expected. ` +
            `Expected: (${expectedDir.x.toFixed(3)}, ${expectedDir.y.toFixed(3)}, ${expectedDir.z.toFixed(3)}), ` +
            `Actual: (${actualDir.x.toFixed(3)}, ${actualDir.y.toFixed(3)}, ${actualDir.z.toFixed(3)})`,
        );
    });

    test("all directions produce arrows in XY plane (Z=0)", () => {
        const angles = [0, Math.PI / 6, Math.PI / 4, Math.PI / 3, Math.PI / 2, Math.PI, -Math.PI / 2];
        const zTolerance = 0.0001;

        for (const angle of angles) {
            const dir = compute2DArrowDirection(angle);
            assert(
                Math.abs(dir.z) < zTolerance,
                `Angle ${(angle * 180 / Math.PI).toFixed(1)}°: Arrow Z component should be 0, got ${dir.z.toFixed(6)}`,
            );
        }
    });

    test("pentagon graph angles produce correct directions", () => {
        // Test the specific angles from a pentagon graph (which was used to debug the bug)
        const pentagonAngles = [
            {name: "A:B", angle: Math.atan2(0.93 - 3, 2.85 - 0), expected: new Vector3(2.85, -2.07, 0).normalize()},
            {name: "B:E", angle: Math.PI, expected: new Vector3(-1, 0, 0)}, // Horizontal left
            {name: "C:D", angle: Math.PI, expected: new Vector3(-1, 0, 0)}, // Horizontal left
            {name: "D:E", angle: Math.atan2(0.93 - (-2.43), -2.85 - (-1.76)), expected: new Vector3(-1.09, 3.36, 0).normalize()},
        ];

        for (const testCase of pentagonAngles) {
            const actualDir = compute2DArrowDirection(testCase.angle);
            const angleDiff = angleBetweenVectors(testCase.expected, actualDir);
            assert(
                angleDiff < tolerance,
                `${testCase.name}: Arrow direction differs by ${angleDiff.toFixed(3)}° from expected`,
            );
        }
    });
});

describe("Quaternion Rotation Correctness", () => {
    test("quaternion composition order matters (regression test)", () => {
        // This test verifies that qZ * qX produces different results than qX * qZ
        // The bug was caused by using the wrong order
        const angle = Math.PI / 2; // 90°

        const qX = Quaternion.RotationAxis(Vector3.Right(), Math.PI / 2);
        const qZ = Quaternion.RotationAxis(Vector3.Forward(), angle);

        // Correct order: qZ * qX (apply X first, then Z)
        const qCorrect = qZ.multiply(qX);
        // Wrong order: qX * qZ (apply Z first, then X) - this was the bug
        const qWrong = qX.multiply(qZ);

        assert(
            !qCorrect.equals(qWrong),
            "Quaternion multiplication order should matter - qZ*qX should differ from qX*qZ",
        );

        // Verify correct order gives expected result
        const localDir = new Vector3(1, 0, 0);
        const correctMatrix = new Matrix();
        qCorrect.toRotationMatrix(correctMatrix);
        const correctDir = Vector3.TransformNormal(localDir, correctMatrix).normalize();

        // For 90° rotation, arrow should point along +Y
        const expectedDir = new Vector3(0, 1, 0);
        const angleDiff = angleBetweenVectors(expectedDir, correctDir);
        assert(
            angleDiff < 0.1,
            `Correct rotation order should produce (0,1,0) direction. Got: (${correctDir.x.toFixed(3)}, ${correctDir.y.toFixed(3)}, ${correctDir.z.toFixed(3)})`,
        );
    });
});
