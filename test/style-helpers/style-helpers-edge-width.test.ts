import assert from "node:assert";

import {describe, it} from "vitest";

import {StyleHelpers} from "../../src/config";

describe("StyleHelpers.edgeWidth.linear", () => {
    it("returns minWidth (0.5) for value 0 with default params", () => {
        const result = StyleHelpers.edgeWidth.linear(0);
        assert.strictEqual(result, 0.5);
    });

    it("returns maxWidth (5) for value 1 with default params", () => {
        const result = StyleHelpers.edgeWidth.linear(1);
        assert.strictEqual(result, 5);
    });

    it("returns midpoint (2.75) for value 0.5 with default params", () => {
        const result = StyleHelpers.edgeWidth.linear(0.5);
        assert.strictEqual(result, 2.75);
    });

    it("scales linearly with custom min and max", () => {
        const result = StyleHelpers.edgeWidth.linear(0.5, 1, 10);
        assert.strictEqual(result, 5.5);
    });

    it("clamps negative values to minWidth", () => {
        const result = StyleHelpers.edgeWidth.linear(-0.5);
        assert.strictEqual(result, 0.5);
    });

    it("clamps values > 1 to maxWidth", () => {
        const result = StyleHelpers.edgeWidth.linear(1.5);
        assert.strictEqual(result, 5);
    });
});

describe("StyleHelpers.edgeWidth.log", () => {
    it("returns minWidth for value 0", () => {
        const result = StyleHelpers.edgeWidth.log(0);
        assert.strictEqual(result, 0.5);
    });

    it("returns maxWidth for value 1", () => {
        const result = StyleHelpers.edgeWidth.log(1);
        assert.strictEqual(result, 5);
    });

    it("scales logarithmically", () => {
        const result = StyleHelpers.edgeWidth.log(0.5, 0.5, 5);
        // Logarithmic scaling: should be between min and max
        assert.ok(result > 0.5 && result < 5, `Expected result ${result} to be between 0.5 and 5`);
    });
});

describe("StyleHelpers.edgeWidth.binary", () => {
    it("returns highlightWidth (3) when highlighted with defaults", () => {
        const result = StyleHelpers.edgeWidth.binary(true);
        assert.strictEqual(result, 3);
    });

    it("returns normalWidth (1) when not highlighted with defaults", () => {
        const result = StyleHelpers.edgeWidth.binary(false);
        assert.strictEqual(result, 1);
    });

    it("uses custom widths", () => {
        assert.strictEqual(StyleHelpers.edgeWidth.binary(true, 5, 2), 5);
        assert.strictEqual(StyleHelpers.edgeWidth.binary(false, 5, 2), 2);
    });
});

describe("StyleHelpers.edgeWidth.stepped", () => {
    it("maps to correct widths", () => {
        const widths = [0.5, 1, 2, 3, 5];

        assert.strictEqual(StyleHelpers.edgeWidth.stepped(0.0, widths), 0.5);
        assert.strictEqual(StyleHelpers.edgeWidth.stepped(0.1, widths), 0.5);
        assert.strictEqual(StyleHelpers.edgeWidth.stepped(0.3, widths), 1);
        assert.strictEqual(StyleHelpers.edgeWidth.stepped(0.5, widths), 2);
        assert.strictEqual(StyleHelpers.edgeWidth.stepped(0.7, widths), 3);
        assert.strictEqual(StyleHelpers.edgeWidth.stepped(0.9, widths), 5);
        assert.strictEqual(StyleHelpers.edgeWidth.stepped(1.0, widths), 5);
    });

    it("handles single width", () => {
        const result = StyleHelpers.edgeWidth.stepped(0.5, [2.5]);
        assert.strictEqual(result, 2.5);
    });
});
