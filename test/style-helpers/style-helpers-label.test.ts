import assert from "node:assert";

import {describe, it} from "vitest";

import {StyleHelpers} from "../../src/config";

describe("StyleHelpers.label.percentage", () => {
    it("converts 0.75 to '75%' with 0 decimals", () => {
        const result = StyleHelpers.label.percentage(0.75);
        assert.strictEqual(result, "75%");
    });

    it("converts 0.756 to '75.6%' with 1 decimal", () => {
        const result = StyleHelpers.label.percentage(0.756, 1);
        assert.strictEqual(result, "75.6%");
    });

    it("converts 0.756 to '75.60%' with 2 decimals", () => {
        const result = StyleHelpers.label.percentage(0.756, 2);
        assert.strictEqual(result, "75.60%");
    });

    it("handles 0", () => {
        const result = StyleHelpers.label.percentage(0);
        assert.strictEqual(result, "0%");
    });

    it("handles 1", () => {
        const result = StyleHelpers.label.percentage(1);
        assert.strictEqual(result, "100%");
    });

    it("handles values > 1", () => {
        const result = StyleHelpers.label.percentage(1.5);
        assert.strictEqual(result, "150%");
    });
});

describe("StyleHelpers.label.fixed", () => {
    it("formats 0.123456 to '0.12' with 2 decimals (default)", () => {
        const result = StyleHelpers.label.fixed(0.123456);
        assert.strictEqual(result, "0.12");
    });

    it("formats 0.123456 to '0.123' with 3 decimals", () => {
        const result = StyleHelpers.label.fixed(0.123456, 3);
        assert.strictEqual(result, "0.123");
    });

    it("formats 123.456 to '123.5' with 1 decimal", () => {
        const result = StyleHelpers.label.fixed(123.456, 1);
        assert.strictEqual(result, "123.5");
    });

    it("rounds correctly", () => {
        const result = StyleHelpers.label.fixed(1.235, 2);
        assert.strictEqual(result, "1.24");
    });
});

describe("StyleHelpers.label.scientific", () => {
    it("formats 123456 to scientific notation", () => {
        const result = StyleHelpers.label.scientific(123456);
        assert.strictEqual(result, "1.23e+5");
    });

    it("formats 0.000123 to scientific notation", () => {
        const result = StyleHelpers.label.scientific(0.000123);
        assert.strictEqual(result, "1.23e-4");
    });

    it("formats with custom decimals", () => {
        const result = StyleHelpers.label.scientific(123456, 3);
        assert.strictEqual(result, "1.235e+5");
    });
});

describe("StyleHelpers.label.compact", () => {
    it("formats 1000 to '1.0K'", () => {
        const result = StyleHelpers.label.compact(1000);
        assert.strictEqual(result, "1.0K");
    });

    it("formats 1500000 to '1.5M'", () => {
        const result = StyleHelpers.label.compact(1500000);
        assert.strictEqual(result, "1.5M");
    });

    it("formats 2500000000 to '2.5B'", () => {
        const result = StyleHelpers.label.compact(2500000000);
        assert.strictEqual(result, "2.5B");
    });

    it("formats numbers < 1000 without suffix", () => {
        const result = StyleHelpers.label.compact(123);
        assert.strictEqual(result, "123.0");
    });

    it("formats edge case 999", () => {
        const result = StyleHelpers.label.compact(999);
        assert.strictEqual(result, "999.0");
    });
});

describe("StyleHelpers.label.integer", () => {
    it("rounds 0.75 to '1'", () => {
        const result = StyleHelpers.label.integer(0.75);
        assert.strictEqual(result, "1");
    });

    it("rounds 123.4 to '123'", () => {
        const result = StyleHelpers.label.integer(123.4);
        assert.strictEqual(result, "123");
    });

    it("rounds 123.6 to '124'", () => {
        const result = StyleHelpers.label.integer(123.6);
        assert.strictEqual(result, "124");
    });

    it("handles exact integers", () => {
        const result = StyleHelpers.label.integer(42);
        assert.strictEqual(result, "42");
    });

    it("rounds negative numbers correctly", () => {
        const result = StyleHelpers.label.integer(-2.3);
        assert.strictEqual(result, "-2");
    });
});

describe("StyleHelpers.label.substitute", () => {
    it("substitutes values into template", () => {
        const result = StyleHelpers.label.substitute("Score: {score}, Rank: {rank}", {
            score: 0.85,
            rank: 5,
        });
        assert.strictEqual(result, "Score: 0.85, Rank: 5");
    });

    it("handles missing keys by leaving placeholder", () => {
        const result = StyleHelpers.label.substitute("Value: {value}", {});
        assert.strictEqual(result, "Value: {value}");
    });

    it("handles multiple occurrences", () => {
        const result = StyleHelpers.label.substitute("{x} + {x} = {y}", {x: 2, y: 4});
        assert.strictEqual(result, "2 + 2 = 4");
    });
});

describe("StyleHelpers.label.rankLabel", () => {
    it("formats rank", () => {
        assert.strictEqual(StyleHelpers.label.rankLabel(1), "Rank: 1");
        assert.strictEqual(StyleHelpers.label.rankLabel(10), "Rank: 10");
    });
});

describe("StyleHelpers.label.scoreLabel", () => {
    it("formats score with label", () => {
        assert.strictEqual(StyleHelpers.label.scoreLabel(0.85, "PageRank"), "PageRank: 0.85");
        assert.strictEqual(StyleHelpers.label.scoreLabel(0.5, "Score"), "Score: 0.5");
    });
});

describe("StyleHelpers.label.communityLabel", () => {
    it("formats community ID", () => {
        assert.strictEqual(StyleHelpers.label.communityLabel(1), "Community 1");
        assert.strictEqual(StyleHelpers.label.communityLabel(42), "Community 42");
    });
});

describe("StyleHelpers.label.levelLabel", () => {
    it("formats level", () => {
        assert.strictEqual(StyleHelpers.label.levelLabel(1), "Level 1");
        assert.strictEqual(StyleHelpers.label.levelLabel(5), "Level 5");
    });
});

describe("StyleHelpers.label.ifAbove", () => {
    it("returns formatted value if above threshold", () => {
        const result = StyleHelpers.label.ifAbove(0.8, 0.5, (v) => v.toFixed(2));
        assert.strictEqual(result, "0.80");
    });

    it("returns null if below threshold", () => {
        const result = StyleHelpers.label.ifAbove(0.3, 0.5, (v) => v.toFixed(2));
        assert.strictEqual(result, null);
    });

    it("returns formatted value if equal to threshold", () => {
        const result = StyleHelpers.label.ifAbove(0.5, 0.5, (v) => v.toFixed(2));
        assert.strictEqual(result, "0.50");
    });
});

describe("StyleHelpers.label.topN", () => {
    it("returns formatted value if rank is in top N", () => {
        const result = StyleHelpers.label.topN(0.9, 3, 5, (v) => v.toFixed(2));
        assert.strictEqual(result, "0.90");
    });

    it("returns null if rank is not in top N", () => {
        const result = StyleHelpers.label.topN(0.5, 6, 5, (v) => v.toFixed(2));
        assert.strictEqual(result, null);
    });

    it("returns formatted value if rank equals N", () => {
        const result = StyleHelpers.label.topN(0.7, 5, 5, (v) => v.toFixed(2));
        assert.strictEqual(result, "0.70");
    });
});

describe("StyleHelpers.label.conditional", () => {
    it("returns true text if condition is true", () => {
        const result = StyleHelpers.label.conditional(true, "Yes", "No");
        assert.strictEqual(result, "Yes");
    });

    it("returns false text if condition is false", () => {
        const result = StyleHelpers.label.conditional(false, "Yes", "No");
        assert.strictEqual(result, "No");
    });
});
