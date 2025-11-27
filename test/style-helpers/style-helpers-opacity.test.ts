import assert from "node:assert";

import {describe, it} from "vitest";

import {StyleHelpers} from "../../src/config";

describe("StyleHelpers.opacity.linear", () => {
    it("returns minOpacity (0.1) for value 0 with default params", () => {
        const result = StyleHelpers.opacity.linear(0);
        assert.strictEqual(result, 0.1);
    });

    it("returns maxOpacity (1.0) for value 1 with default params", () => {
        const result = StyleHelpers.opacity.linear(1);
        assert.strictEqual(result, 1.0);
    });

    it("returns midpoint (0.55) for value 0.5 with default params", () => {
        const result = StyleHelpers.opacity.linear(0.5);
        assert.strictEqual(result, 0.55);
    });

    it("scales linearly with custom min and max", () => {
        const result = StyleHelpers.opacity.linear(0.5, 0, 1);
        assert.strictEqual(result, 0.5);
    });

    it("clamps negative values to minOpacity", () => {
        const result = StyleHelpers.opacity.linear(-0.5);
        assert.strictEqual(result, 0.1);
    });

    it("clamps values > 1 to maxOpacity", () => {
        const result = StyleHelpers.opacity.linear(1.5);
        assert.strictEqual(result, 1.0);
    });
});

describe("StyleHelpers.opacity.threshold", () => {
    it("returns belowOpacity (0.3) for value below threshold (0.5)", () => {
        const result = StyleHelpers.opacity.threshold(0.3);
        assert.strictEqual(result, 0.3);
    });

    it("returns aboveOpacity (1.0) for value at threshold (0.5)", () => {
        const result = StyleHelpers.opacity.threshold(0.5);
        assert.strictEqual(result, 1.0);
    });

    it("returns aboveOpacity (1.0) for value above threshold (0.5)", () => {
        const result = StyleHelpers.opacity.threshold(0.6);
        assert.strictEqual(result, 1.0);
    });

    it("works with custom threshold and opacities", () => {
        const belowResult = StyleHelpers.opacity.threshold(0.2, 0.3, 0.2, 0.8);
        assert.strictEqual(belowResult, 0.2);

        const aboveResult = StyleHelpers.opacity.threshold(0.4, 0.3, 0.2, 0.8);
        assert.strictEqual(aboveResult, 0.8);
    });

    it("handles edge case: value exactly at threshold", () => {
        const result = StyleHelpers.opacity.threshold(0.5, 0.5);
        assert.strictEqual(result, 1.0);
    });
});

describe("StyleHelpers.opacity.binary", () => {
    it("returns visibleOpacity (1.0) when visible", () => {
        const result = StyleHelpers.opacity.binary(true);
        assert.strictEqual(result, 1.0);
    });

    it("returns hiddenOpacity (0.0) when not visible", () => {
        const result = StyleHelpers.opacity.binary(false);
        assert.strictEqual(result, 0.0);
    });

    it("works with custom opacities", () => {
        const visible = StyleHelpers.opacity.binary(true, 0.8, 0.2);
        assert.strictEqual(visible, 0.8);

        const hidden = StyleHelpers.opacity.binary(false, 0.8, 0.2);
        assert.strictEqual(hidden, 0.2);
    });
});

describe("StyleHelpers.opacity.inverse", () => {
    it("returns maxOpacity (1.0) for value 0 with default params", () => {
        const result = StyleHelpers.opacity.inverse(0);
        assert.strictEqual(result, 1.0);
    });

    it("returns minOpacity (0.1) for value 1 with default params", () => {
        const result = StyleHelpers.opacity.inverse(1);
        assert.strictEqual(result, 0.1);
    });

    it("returns midpoint (0.55) for value 0.5 with default params", () => {
        const result = StyleHelpers.opacity.inverse(0.5);
        assert.strictEqual(result, 0.55);
    });

    it("inverts properly with custom min and max", () => {
        const result = StyleHelpers.opacity.inverse(0.2, 0, 1);
        assert.strictEqual(result, 0.8); // 0 + (1 - 0.2) * (1 - 0)
    });

    it("clamps negative values", () => {
        const result = StyleHelpers.opacity.inverse(-0.5);
        assert.strictEqual(result, 1.0);
    });

    it("clamps values > 1", () => {
        const result = StyleHelpers.opacity.inverse(1.5);
        assert.strictEqual(result, 0.1);
    });
});
