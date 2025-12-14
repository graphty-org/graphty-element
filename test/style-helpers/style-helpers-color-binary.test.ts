import assert from "node:assert";

import {describe, it} from "vitest";

import {StyleHelpers} from "../../src/config";

describe("StyleHelpers.color.binary.blueHighlight", () => {
    it("returns Okabe-Ito blue (#0072B2) when highlighted", () => {
        const result = StyleHelpers.color.binary.blueHighlight(true);
        assert.strictEqual(result, "#0072B2");
    });

    it("returns light gray (#CCCCCC) when not highlighted", () => {
        const result = StyleHelpers.color.binary.blueHighlight(false);
        assert.strictEqual(result, "#CCCCCC");
    });
});

describe("StyleHelpers.color.binary.greenSuccess", () => {
    it("returns Okabe-Ito green (#009E73) when highlighted", () => {
        const result = StyleHelpers.color.binary.greenSuccess(true);
        assert.strictEqual(result, "#009E73");
    });

    it("returns medium gray (#999999) when not highlighted", () => {
        const result = StyleHelpers.color.binary.greenSuccess(false);
        assert.strictEqual(result, "#999999");
    });
});

describe("StyleHelpers.color.binary.orangeWarning", () => {
    it("returns Okabe-Ito orange (#E69F00) when highlighted", () => {
        const result = StyleHelpers.color.binary.orangeWarning(true);
        assert.strictEqual(result, "#E69F00");
    });

    it("returns light gray (#CCCCCC) when not highlighted", () => {
        const result = StyleHelpers.color.binary.orangeWarning(false);
        assert.strictEqual(result, "#CCCCCC");
    });
});

describe("StyleHelpers.color.binary.custom", () => {
    it("returns custom highlight color when highlighted", () => {
        const result = StyleHelpers.color.binary.custom(true, "#FF0000", "#000000");
        assert.strictEqual(result, "#FF0000");
    });

    it("returns custom muted color when not highlighted", () => {
        const result = StyleHelpers.color.binary.custom(false, "#FF0000", "#000000");
        assert.strictEqual(result, "#000000");
    });
});
