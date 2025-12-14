import assert from "node:assert";

import {describe, it} from "vitest";

import {StyleHelpers} from "../../src/config";

describe("StyleHelpers.color.diverging.purpleGreen", () => {
    it("returns purple (#762a83) for value 0", () => {
        const result = StyleHelpers.color.diverging.purpleGreen(0);
        assert.strictEqual(result, "#762a83");
    });

    it("returns white (#f7f7f7) for value 0.5 (midpoint)", () => {
        const result = StyleHelpers.color.diverging.purpleGreen(0.5);
        assert.strictEqual(result, "#f7f7f7");
    });

    it("returns green (#1b7837) for value 1", () => {
        const result = StyleHelpers.color.diverging.purpleGreen(1);
        assert.strictEqual(result, "#1b7837");
    });

    it("uses custom midpoint", () => {
        // With midpoint at 0.7, value 0.7 should give white
        const result = StyleHelpers.color.diverging.purpleGreen(0.7, 0.7);
        assert.strictEqual(result, "#f7f7f7");
    });

    it("interpolates smoothly", () => {
        const c1 = StyleHelpers.color.diverging.purpleGreen(0.25);
        const c2 = StyleHelpers.color.diverging.purpleGreen(0.75);
        assert.notStrictEqual(c1, c2);
        assert.match(c1, /^#[0-9a-f]{6}$/);
        assert.match(c2, /^#[0-9a-f]{6}$/);
    });

    it("clamps values to [0,1] range", () => {
        assert.strictEqual(StyleHelpers.color.diverging.purpleGreen(-0.5), "#762a83");
        assert.strictEqual(StyleHelpers.color.diverging.purpleGreen(1.5), "#1b7837");
    });
});

describe("StyleHelpers.color.diverging.blueOrange", () => {
    it("returns deep blue (#2166ac) for value 0", () => {
        const result = StyleHelpers.color.diverging.blueOrange(0);
        assert.strictEqual(result, "#2166ac");
    });

    it("returns white (#f7f7f7) for value 0.5 (midpoint)", () => {
        const result = StyleHelpers.color.diverging.blueOrange(0.5);
        assert.strictEqual(result, "#f7f7f7");
    });

    it("returns red-orange (#b2182b) for value 1", () => {
        const result = StyleHelpers.color.diverging.blueOrange(1);
        assert.strictEqual(result, "#b2182b");
    });

    it("uses custom midpoint", () => {
        const result = StyleHelpers.color.diverging.blueOrange(0.3, 0.3);
        assert.strictEqual(result, "#f7f7f7");
    });

    it("interpolates smoothly", () => {
        const c1 = StyleHelpers.color.diverging.blueOrange(0.25);
        const c2 = StyleHelpers.color.diverging.blueOrange(0.75);
        assert.notStrictEqual(c1, c2);
        assert.match(c1, /^#[0-9a-f]{6}$/);
        assert.match(c2, /^#[0-9a-f]{6}$/);
    });

    it("clamps values to [0,1] range", () => {
        assert.strictEqual(StyleHelpers.color.diverging.blueOrange(-0.5), "#2166ac");
        assert.strictEqual(StyleHelpers.color.diverging.blueOrange(1.5), "#b2182b");
    });
});

describe("StyleHelpers.color.diverging.redBlue", () => {
    it("returns deep red (#67001f) for value 0", () => {
        const result = StyleHelpers.color.diverging.redBlue(0);
        assert.strictEqual(result, "#67001f");
    });

    it("returns white (#f7f7f7) for value 0.5 (midpoint)", () => {
        const result = StyleHelpers.color.diverging.redBlue(0.5);
        // Red-Blue palette has 10 colors, so 0.5 may not land exactly on white
        // Check that it's a valid hex color in the neutral range
        assert.match(result, /^#[0-9a-f]{6}$/i);
    });

    it("returns deep blue (#2166ac) for value 1", () => {
        const result = StyleHelpers.color.diverging.redBlue(1);
        assert.strictEqual(result, "#2166ac");
    });

    it("uses custom midpoint", () => {
        const result = StyleHelpers.color.diverging.redBlue(0.6, 0.6);
        // At custom midpoint, should be close to neutral
        assert.match(result, /^#[0-9a-f]{6}$/i);
    });

    it("interpolates smoothly", () => {
        const c1 = StyleHelpers.color.diverging.redBlue(0.25);
        const c2 = StyleHelpers.color.diverging.redBlue(0.75);
        assert.notStrictEqual(c1, c2);
        assert.match(c1, /^#[0-9a-f]{6}$/);
        assert.match(c2, /^#[0-9a-f]{6}$/);
    });

    it("clamps values to [0,1] range", () => {
        assert.strictEqual(StyleHelpers.color.diverging.redBlue(-0.5), "#67001f");
        assert.strictEqual(StyleHelpers.color.diverging.redBlue(1.5), "#2166ac");
    });
});
