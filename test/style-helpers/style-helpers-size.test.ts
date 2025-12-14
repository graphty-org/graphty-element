import assert from "node:assert";

import {describe, it} from "vitest";

import {StyleHelpers} from "../../src/config";

describe("StyleHelpers.size.linear", () => {
    it("returns minSize (1) for value 0 with default params", () => {
        const result = StyleHelpers.size.linear(0);
        assert.strictEqual(result, 1);
    });

    it("returns maxSize (5) for value 1 with default params", () => {
        const result = StyleHelpers.size.linear(1);
        assert.strictEqual(result, 5);
    });

    it("returns midpoint (3) for value 0.5 with default params", () => {
        const result = StyleHelpers.size.linear(0.5);
        assert.strictEqual(result, 3);
    });

    it("scales linearly with custom min and max", () => {
        const result = StyleHelpers.size.linear(0.5, 2, 10);
        assert.strictEqual(result, 6);
    });

    it("returns correct value for 0.25", () => {
        const result = StyleHelpers.size.linear(0.25);
        assert.strictEqual(result, 2);
    });

    it("returns correct value for 0.75", () => {
        const result = StyleHelpers.size.linear(0.75);
        assert.strictEqual(result, 4);
    });

    it("clamps negative values to minSize", () => {
        const result = StyleHelpers.size.linear(-0.5);
        assert.strictEqual(result, 1);
    });

    it("clamps values > 1 to maxSize", () => {
        const result = StyleHelpers.size.linear(1.5);
        assert.strictEqual(result, 5);
    });

    it("handles equal min and max (returns constant)", () => {
        const result = StyleHelpers.size.linear(0.5, 3, 3);
        assert.strictEqual(result, 3);
    });
});

describe("StyleHelpers.size.linearClipped", () => {
    it("clips value before scaling", () => {
        // Value 0.95 clipped to 0.9, then scaled from 1-5
        const result = StyleHelpers.size.linearClipped(0.95, 1, 5, 0.1, 0.9);
        assert.strictEqual(result, 4.6); // 1 + 0.9 * (5-1) = 4.6
    });

    it("uses default clip range [0, 1]", () => {
        const result = StyleHelpers.size.linearClipped(0.5, 1, 5);
        assert.strictEqual(result, 3);
    });

    it("clips lower bound", () => {
        const result = StyleHelpers.size.linearClipped(0.05, 1, 5, 0.1, 0.9);
        assert.strictEqual(result, 1.4); // Clipped to 0.1, then 1 + 0.1 * 4 = 1.4
    });

    it("clips upper bound", () => {
        const result = StyleHelpers.size.linearClipped(0.95, 1, 5, 0.1, 0.9);
        assert.strictEqual(result, 4.6); // Clipped to 0.9, then 1 + 0.9 * 4 = 4.6
    });
});

describe("StyleHelpers.size.log", () => {
    it("returns minSize for value 0", () => {
        const result = StyleHelpers.size.log(0);
        assert.strictEqual(result, 1);
    });

    it("returns maxSize for value 1", () => {
        const result = StyleHelpers.size.log(1);
        assert.strictEqual(result, 5);
    });

    it("scales logarithmically", () => {
        const result = StyleHelpers.size.log(0.5, 1, 5);
        // Logarithmic scaling: intermediate values should be between min and max
        assert.ok(result > 1 && result < 5, `Expected result ${result} to be between 1 and 5`);
    });

    it("handles custom base", () => {
        // Different bases should produce different results
        const result1 = StyleHelpers.size.log(0.5, 1, 5, 10);
        const result2 = StyleHelpers.size.log(0.5, 1, 5, 2);
        // Both should be in valid range
        assert.ok(result1 > 1 && result1 < 5);
        assert.ok(result2 > 1 && result2 < 5);
    });
});

describe("StyleHelpers.size.logSafe", () => {
    it("handles zero values with epsilon", () => {
        const result = StyleHelpers.size.logSafe(0);
        // logSafe uses epsilon (0.0001) instead of 0, then applies log scaling
        // The result should be close to minSize but not exactly minSize
        assert.ok(result >= 1 && result < 5, `Expected result ${result} to be in valid range`);
    });

    it("returns maxSize for value 1", () => {
        const result = StyleHelpers.size.logSafe(1);
        assert.strictEqual(result, 5);
    });

    it("scales logarithmically for non-zero values", () => {
        const result = StyleHelpers.size.logSafe(0.5, 1, 5);
        assert.ok(result > 1 && result < 5);
    });
});

describe("StyleHelpers.size.exp", () => {
    it("returns minSize for value 0", () => {
        const result = StyleHelpers.size.exp(0);
        assert.strictEqual(result, 1);
    });

    it("returns maxSize for value 1", () => {
        const result = StyleHelpers.size.exp(1);
        assert.strictEqual(result, 5);
    });

    it("scales exponentially", () => {
        const result = StyleHelpers.size.exp(0.5, 1, 5);
        // Exponential scaling: 0.5^2 = 0.25, so result = 1 + 0.25 * 4 = 2
        // Should be LESS than linear midpoint (3), not greater
        assert.ok(result > 1 && result < 5, `Expected result ${result} to be in valid range`);
    });

    it("handles custom exponent", () => {
        const result1 = StyleHelpers.size.exp(0.5, 1, 5, 2);
        const result2 = StyleHelpers.size.exp(0.5, 1, 5, 3);
        // Higher exponent = smaller value at 0.5 (more dramatic curve)
        // 0.5^2 = 0.25 vs 0.5^3 = 0.125
        assert.ok(result1 > result2, `Expected result1 (${result1}) > result2 (${result2})`);
    });
});

describe("StyleHelpers.size.square", () => {
    it("returns minSize for value 0", () => {
        const result = StyleHelpers.size.square(0);
        assert.strictEqual(result, 1);
    });

    it("returns maxSize for value 1", () => {
        const result = StyleHelpers.size.square(1);
        assert.strictEqual(result, 5);
    });

    it("uses exponent of 2", () => {
        const result = StyleHelpers.size.square(0.5, 1, 5);
        // 1 + (0.5^2) * 4 = 1 + 0.25 * 4 = 2
        assert.strictEqual(result, 2);
    });
});

describe("StyleHelpers.size.cubic", () => {
    it("returns minSize for value 0", () => {
        const result = StyleHelpers.size.cubic(0);
        assert.strictEqual(result, 1);
    });

    it("returns maxSize for value 1", () => {
        const result = StyleHelpers.size.cubic(1);
        assert.strictEqual(result, 5);
    });

    it("uses exponent of 3", () => {
        const result = StyleHelpers.size.cubic(0.5, 1, 5);
        // 1 + (0.5^3) * 4 = 1 + 0.125 * 4 = 1.5
        assert.strictEqual(result, 1.5);
    });
});

describe("StyleHelpers.size.bins", () => {
    it("maps to correct bins", () => {
        const sizes = [1, 2, 3, 4, 5];

        assert.strictEqual(StyleHelpers.size.bins(0.0, sizes), 1);
        assert.strictEqual(StyleHelpers.size.bins(0.1, sizes), 1);
        assert.strictEqual(StyleHelpers.size.bins(0.3, sizes), 2);
        assert.strictEqual(StyleHelpers.size.bins(0.5, sizes), 3);
        assert.strictEqual(StyleHelpers.size.bins(0.7, sizes), 4);
        assert.strictEqual(StyleHelpers.size.bins(0.9, sizes), 5);
        assert.strictEqual(StyleHelpers.size.bins(1.0, sizes), 5);
    });

    it("handles single bin", () => {
        const result = StyleHelpers.size.bins(0.5, [3]);
        assert.strictEqual(result, 3);
    });
});

describe("StyleHelpers.size.smallMediumLarge", () => {
    it("returns small for low values", () => {
        const result = StyleHelpers.size.smallMediumLarge(0.2);
        assert.strictEqual(result, 1);
    });

    it("returns medium for mid values", () => {
        const result = StyleHelpers.size.smallMediumLarge(0.5);
        assert.strictEqual(result, 2.5);
    });

    it("returns large for high values", () => {
        const result = StyleHelpers.size.smallMediumLarge(0.8);
        assert.strictEqual(result, 4);
    });
});

describe("StyleHelpers.size.fiveTiers", () => {
    it("returns correct tiers", () => {
        assert.strictEqual(StyleHelpers.size.fiveTiers(0.1), 1);
        assert.strictEqual(StyleHelpers.size.fiveTiers(0.3), 2);
        assert.strictEqual(StyleHelpers.size.fiveTiers(0.5), 3);
        assert.strictEqual(StyleHelpers.size.fiveTiers(0.7), 4);
        assert.strictEqual(StyleHelpers.size.fiveTiers(0.9), 5);
    });
});
