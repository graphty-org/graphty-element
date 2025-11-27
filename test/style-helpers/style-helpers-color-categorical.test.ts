import assert from "node:assert";

import {describe, it} from "vitest";

import {StyleHelpers} from "../../src/config";

describe("StyleHelpers.color.categorical.okabeIto", () => {
    it("returns Orange (#E69F00) for category 0", () => {
        const result = StyleHelpers.color.categorical.okabeIto(0);
        assert.strictEqual(result, "#E69F00");
    });

    it("returns Sky Blue (#56B4E9) for category 1", () => {
        const result = StyleHelpers.color.categorical.okabeIto(1);
        assert.strictEqual(result, "#56B4E9");
    });

    it("returns Bluish Green (#009E73) for category 2", () => {
        const result = StyleHelpers.color.categorical.okabeIto(2);
        assert.strictEqual(result, "#009E73");
    });

    it("returns Yellow (#F0E442) for category 3", () => {
        const result = StyleHelpers.color.categorical.okabeIto(3);
        assert.strictEqual(result, "#F0E442");
    });

    it("returns Blue (#0072B2) for category 4", () => {
        const result = StyleHelpers.color.categorical.okabeIto(4);
        assert.strictEqual(result, "#0072B2");
    });

    it("returns Vermillion (#D55E00) for category 5", () => {
        const result = StyleHelpers.color.categorical.okabeIto(5);
        assert.strictEqual(result, "#D55E00");
    });

    it("returns Reddish Purple (#CC79A7) for category 6", () => {
        const result = StyleHelpers.color.categorical.okabeIto(6);
        assert.strictEqual(result, "#CC79A7");
    });

    it("returns Gray (#999999) for category 7", () => {
        const result = StyleHelpers.color.categorical.okabeIto(7);
        assert.strictEqual(result, "#999999");
    });

    it("wraps around for category 8 (returns Orange again)", () => {
        const result = StyleHelpers.color.categorical.okabeIto(8);
        assert.strictEqual(result, "#E69F00"); // Same as category 0
    });

    it("wraps around for category 10 (returns Bluish Green)", () => {
        const result = StyleHelpers.color.categorical.okabeIto(10);
        assert.strictEqual(result, "#009E73"); // Same as category 2
    });

    it("returns all 8 distinct colors for categories 0-7", () => {
        const colors = new Set<string>();
        for (let i = 0; i < 8; i++) {
            colors.add(StyleHelpers.color.categorical.okabeIto(i));
        }
        assert.strictEqual(colors.size, 8);
    });
});

describe("StyleHelpers.color.categorical.tolVibrant", () => {
    it("returns Blue (#0077BB) for category 0", () => {
        const result = StyleHelpers.color.categorical.tolVibrant(0);
        assert.strictEqual(result, "#0077BB");
    });

    it("returns Cyan (#33BBEE) for category 1", () => {
        const result = StyleHelpers.color.categorical.tolVibrant(1);
        assert.strictEqual(result, "#33BBEE");
    });

    it("returns Teal (#009988) for category 2", () => {
        const result = StyleHelpers.color.categorical.tolVibrant(2);
        assert.strictEqual(result, "#009988");
    });

    it("returns Gray (#BBBBBB) for category 6", () => {
        const result = StyleHelpers.color.categorical.tolVibrant(6);
        assert.strictEqual(result, "#BBBBBB");
    });

    it("wraps around for category 7 (returns Blue again)", () => {
        const result = StyleHelpers.color.categorical.tolVibrant(7);
        assert.strictEqual(result, "#0077BB");
    });

    it("returns all 7 distinct colors for categories 0-6", () => {
        const colors = new Set<string>();
        for (let i = 0; i < 7; i++) {
            colors.add(StyleHelpers.color.categorical.tolVibrant(i));
        }
        assert.strictEqual(colors.size, 7);
    });
});

describe("StyleHelpers.color.categorical.tolMuted", () => {
    it("returns Indigo (#332288) for category 0", () => {
        const result = StyleHelpers.color.categorical.tolMuted(0);
        assert.strictEqual(result, "#332288");
    });

    it("returns Cyan (#88CCEE) for category 1", () => {
        const result = StyleHelpers.color.categorical.tolMuted(1);
        assert.strictEqual(result, "#88CCEE");
    });

    it("returns Purple (#AA4499) for category 8", () => {
        const result = StyleHelpers.color.categorical.tolMuted(8);
        assert.strictEqual(result, "#AA4499");
    });

    it("wraps around for category 9 (returns Indigo again)", () => {
        const result = StyleHelpers.color.categorical.tolMuted(9);
        assert.strictEqual(result, "#332288");
    });

    it("returns all 9 distinct colors for categories 0-8", () => {
        const colors = new Set<string>();
        for (let i = 0; i < 9; i++) {
            colors.add(StyleHelpers.color.categorical.tolMuted(i));
        }
        assert.strictEqual(colors.size, 9);
    });
});

describe("StyleHelpers.color.categorical.carbon", () => {
    it("returns Purple (#6929C4) for category 0", () => {
        const result = StyleHelpers.color.categorical.carbon(0);
        assert.strictEqual(result, "#6929C4");
    });

    it("returns Blue (#1192E8) for category 1", () => {
        const result = StyleHelpers.color.categorical.carbon(1);
        assert.strictEqual(result, "#1192E8");
    });

    it("returns Red (#FA4D56) for category 4", () => {
        const result = StyleHelpers.color.categorical.carbon(4);
        assert.strictEqual(result, "#FA4D56");
    });

    it("wraps around for category 5 (returns Purple again)", () => {
        const result = StyleHelpers.color.categorical.carbon(5);
        assert.strictEqual(result, "#6929C4");
    });

    it("returns all 5 distinct colors for categories 0-4", () => {
        const colors = new Set<string>();
        for (let i = 0; i < 5; i++) {
            colors.add(StyleHelpers.color.categorical.carbon(i));
        }
        assert.strictEqual(colors.size, 5);
    });
});

describe("StyleHelpers.color.categorical.pastel", () => {
    it("returns Light orange (#FFD699) for category 0", () => {
        const result = StyleHelpers.color.categorical.pastel(0);
        assert.strictEqual(result, "#FFD699");
    });

    it("returns Light sky blue (#A8D8F0) for category 1", () => {
        const result = StyleHelpers.color.categorical.pastel(1);
        assert.strictEqual(result, "#A8D8F0");
    });

    it("returns Light gray (#CCCCCC) for category 7", () => {
        const result = StyleHelpers.color.categorical.pastel(7);
        assert.strictEqual(result, "#CCCCCC");
    });

    it("wraps around for category 8 (returns Light orange again)", () => {
        const result = StyleHelpers.color.categorical.pastel(8);
        assert.strictEqual(result, "#FFD699");
    });

    it("returns all 8 distinct colors for categories 0-7", () => {
        const colors = new Set<string>();
        for (let i = 0; i < 8; i++) {
            colors.add(StyleHelpers.color.categorical.pastel(i));
        }
        assert.strictEqual(colors.size, 8);
    });
});
