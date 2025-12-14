import assert from "node:assert";

import {describe, it} from "vitest";

import {StyleHelpers} from "../../src/config";

describe("StyleHelpers.color.sequential.viridis", () => {
    it("returns deep purple (#440154) for value 0", () => {
        const result = StyleHelpers.color.sequential.viridis(0);
        assert.strictEqual(result, "#440154");
    });

    it("returns bright yellow (#fde724) for value 1", () => {
        const result = StyleHelpers.color.sequential.viridis(1);
        assert.strictEqual(result, "#fde724");
    });

    it("returns teal for value 0.5", () => {
        const result = StyleHelpers.color.sequential.viridis(0.5);
        // 0.5 maps to halfway between indices 4 and 5: interpolate between #26828e and #1f9e89
        // Should be approximately #23908c
        assert.strictEqual(result, "#23908c");
    });

    it("interpolates smoothly between palette colors", () => {
        const c1 = StyleHelpers.color.sequential.viridis(0.25);
        const c2 = StyleHelpers.color.sequential.viridis(0.75);
        assert.notStrictEqual(c1, c2);
        // Values should be hex color strings
        assert.match(c1, /^#[0-9a-f]{6}$/);
        assert.match(c2, /^#[0-9a-f]{6}$/);
    });

    it("clamps negative values to 0", () => {
        const result = StyleHelpers.color.sequential.viridis(-0.5);
        assert.strictEqual(result, "#440154"); // Same as 0
    });

    it("clamps values > 1 to 1", () => {
        const result = StyleHelpers.color.sequential.viridis(1.5);
        assert.strictEqual(result, "#fde724"); // Same as 1
    });

    it("returns valid hex colors for all intermediate values", () => {
        for (let i = 0; i <= 10; i++) {
            const value = i / 10;
            const color = StyleHelpers.color.sequential.viridis(value);
            assert.match(color, /^#[0-9a-f]{6}$/);
        }
    });
});

describe("StyleHelpers.color.sequential.plasma", () => {
    it("returns deep blue (#0d0887) for value 0", () => {
        const result = StyleHelpers.color.sequential.plasma(0);
        assert.strictEqual(result, "#0d0887");
    });

    it("returns bright yellow (#f0f921) for value 1", () => {
        const result = StyleHelpers.color.sequential.plasma(1);
        assert.strictEqual(result, "#f0f921");
    });

    it("interpolates smoothly", () => {
        const c1 = StyleHelpers.color.sequential.plasma(0.25);
        const c2 = StyleHelpers.color.sequential.plasma(0.75);
        assert.notStrictEqual(c1, c2);
        assert.match(c1, /^#[0-9a-f]{6}$/);
        assert.match(c2, /^#[0-9a-f]{6}$/);
    });

    it("clamps values to [0,1] range", () => {
        assert.strictEqual(StyleHelpers.color.sequential.plasma(-0.5), "#0d0887");
        assert.strictEqual(StyleHelpers.color.sequential.plasma(1.5), "#f0f921");
    });
});

describe("StyleHelpers.color.sequential.inferno", () => {
    it("returns near black (#000004) for value 0", () => {
        const result = StyleHelpers.color.sequential.inferno(0);
        assert.strictEqual(result, "#000004");
    });

    it("returns bright yellow (#f7d13d) for value 1", () => {
        const result = StyleHelpers.color.sequential.inferno(1);
        assert.strictEqual(result, "#f7d13d");
    });

    it("interpolates smoothly", () => {
        const c1 = StyleHelpers.color.sequential.inferno(0.25);
        const c2 = StyleHelpers.color.sequential.inferno(0.75);
        assert.notStrictEqual(c1, c2);
        assert.match(c1, /^#[0-9a-f]{6}$/);
        assert.match(c2, /^#[0-9a-f]{6}$/);
    });

    it("clamps values to [0,1] range", () => {
        assert.strictEqual(StyleHelpers.color.sequential.inferno(-0.5), "#000004");
        assert.strictEqual(StyleHelpers.color.sequential.inferno(1.5), "#f7d13d");
    });
});

describe("StyleHelpers.color.sequential.blues", () => {
    it("returns very light blue (#f7fbff) for value 0", () => {
        const result = StyleHelpers.color.sequential.blues(0);
        assert.strictEqual(result, "#f7fbff");
    });

    it("returns deep blue (#08306b) for value 1", () => {
        const result = StyleHelpers.color.sequential.blues(1);
        assert.strictEqual(result, "#08306b");
    });

    it("interpolates smoothly", () => {
        const c1 = StyleHelpers.color.sequential.blues(0.25);
        const c2 = StyleHelpers.color.sequential.blues(0.75);
        assert.notStrictEqual(c1, c2);
        assert.match(c1, /^#[0-9a-f]{6}$/);
        assert.match(c2, /^#[0-9a-f]{6}$/);
    });

    it("clamps values to [0,1] range", () => {
        assert.strictEqual(StyleHelpers.color.sequential.blues(-0.5), "#f7fbff");
        assert.strictEqual(StyleHelpers.color.sequential.blues(1.5), "#08306b");
    });
});

describe("StyleHelpers.color.sequential.greens", () => {
    it("returns very light green (#f7fcf5) for value 0", () => {
        const result = StyleHelpers.color.sequential.greens(0);
        assert.strictEqual(result, "#f7fcf5");
    });

    it("returns dark green (#00441b) for value 1", () => {
        const result = StyleHelpers.color.sequential.greens(1);
        assert.strictEqual(result, "#00441b");
    });

    it("interpolates smoothly", () => {
        const c1 = StyleHelpers.color.sequential.greens(0.25);
        const c2 = StyleHelpers.color.sequential.greens(0.75);
        assert.notStrictEqual(c1, c2);
        assert.match(c1, /^#[0-9a-f]{6}$/);
        assert.match(c2, /^#[0-9a-f]{6}$/);
    });

    it("clamps values to [0,1] range", () => {
        assert.strictEqual(StyleHelpers.color.sequential.greens(-0.5), "#f7fcf5");
        assert.strictEqual(StyleHelpers.color.sequential.greens(1.5), "#00441b");
    });
});

describe("StyleHelpers.color.sequential.oranges", () => {
    it("returns very light orange (#fff5eb) for value 0", () => {
        const result = StyleHelpers.color.sequential.oranges(0);
        assert.strictEqual(result, "#fff5eb");
    });

    it("returns dark orange (#7f2704) for value 1", () => {
        const result = StyleHelpers.color.sequential.oranges(1);
        assert.strictEqual(result, "#7f2704");
    });

    it("interpolates smoothly", () => {
        const c1 = StyleHelpers.color.sequential.oranges(0.25);
        const c2 = StyleHelpers.color.sequential.oranges(0.75);
        assert.notStrictEqual(c1, c2);
        assert.match(c1, /^#[0-9a-f]{6}$/);
        assert.match(c2, /^#[0-9a-f]{6}$/);
    });

    it("clamps values to [0,1] range", () => {
        assert.strictEqual(StyleHelpers.color.sequential.oranges(-0.5), "#fff5eb");
        assert.strictEqual(StyleHelpers.color.sequential.oranges(1.5), "#7f2704");
    });
});
