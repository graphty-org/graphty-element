import {assert} from "chai";
import {describe, test} from "vitest";

import {applyDeadzone} from "../../src/cameras/InputUtils";

describe("InputUtils", () => {
    describe("applyDeadzone", () => {
        test("should return 0 for values within deadzone threshold", () => {
            assert.equal(applyDeadzone(0), 0);
            assert.equal(applyDeadzone(0.1), 0);
            assert.equal(applyDeadzone(-0.1), 0);
            assert.equal(applyDeadzone(0.14), 0); // Just under default threshold
        });

        test("should return 0 for negative values within deadzone", () => {
            assert.equal(applyDeadzone(-0.05), 0);
            assert.equal(applyDeadzone(-0.14), 0);
        });

        test("should remap values outside deadzone to start from 0", () => {
            // At threshold (0.15), should return very small value (close to 0)
            const atThreshold = applyDeadzone(0.15 + 0.001);
            assert.isBelow(atThreshold, 0.01);
            assert.isAbove(atThreshold, 0);
        });

        test("should return 1 at maximum input", () => {
            // At max input (1.0), should return 1.0
            assert.approximately(applyDeadzone(1.0), 1.0, 0.0001);
        });

        test("should return -1 at minimum input", () => {
            // At min input (-1.0), should return -1.0
            assert.approximately(applyDeadzone(-1.0), -1.0, 0.0001);
        });

        test("should preserve sign for negative values", () => {
            const negative = applyDeadzone(-0.5);
            assert.isBelow(negative, 0);

            const positive = applyDeadzone(0.5);
            assert.isAbove(positive, 0);
        });

        test("should apply quadratic curve for smooth acceleration", () => {
            // Due to quadratic curve, values should be smaller than linear mapping
            // Linear would give: (0.5 - 0.15) / (1 - 0.15) = 0.412
            // Quadratic gives: 0.412^2 = 0.17
            const result = applyDeadzone(0.5);
            assert.isBelow(result, 0.3);
            assert.isAbove(result, 0.1);
        });

        test("should work with custom threshold", () => {
            // With threshold 0.3, values up to 0.29 should return 0
            assert.equal(applyDeadzone(0.2, 0.3), 0);
            assert.equal(applyDeadzone(0.29, 0.3), 0);

            // Values above threshold should work
            const result = applyDeadzone(0.5, 0.3);
            assert.isAbove(result, 0);
        });

        test("should handle threshold of 0", () => {
            // With no deadzone, any value should pass through (with quadratic curve)
            const result = applyDeadzone(0.5, 0);
            assert.approximately(result, 0.25, 0.0001); // 0.5^2 = 0.25
        });

        test("should handle edge case at exactly threshold", () => {
            // At exactly threshold, should return 0
            assert.equal(applyDeadzone(0.15, 0.15), 0);
            assert.equal(applyDeadzone(-0.15, 0.15), 0);
        });

        test("should be symmetric for positive and negative values", () => {
            const positive = applyDeadzone(0.7);
            const negative = applyDeadzone(-0.7);

            assert.approximately(positive, -negative, 0.0001);
        });
    });
});
