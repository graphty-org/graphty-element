import {assert, describe, it} from "vitest";

import * as categorical from "../../src/utils/styleHelpers/color/categorical";
import * as diverging from "../../src/utils/styleHelpers/color/diverging";
import * as sequential from "../../src/utils/styleHelpers/color/sequential";
import * as combined from "../../src/utils/styleHelpers/combined";

describe("Combined Helpers", () => {
    describe("colorAndSize", () => {
        it("combines color and size for low values", () => {
            const result = combined.colorAndSize(0.0);
            assert.strictEqual(result.color, sequential.viridis(0.0));
            assert.strictEqual(result.size, 1);
        });

        it("combines color and size for high values", () => {
            const result = combined.colorAndSize(1.0);
            assert.strictEqual(result.color, sequential.viridis(1.0));
            assert.strictEqual(result.size, 5);
        });

        it("interpolates correctly for mid values", () => {
            const result = combined.colorAndSize(0.5);
            assert.strictEqual(result.color, sequential.viridis(0.5));
            assert.strictEqual(result.size, 3);
        });

        it("accepts custom color palette", () => {
            const result = combined.colorAndSize(0.5, sequential.plasma);
            assert.strictEqual(result.color, sequential.plasma(0.5));
            assert.strictEqual(result.size, 3);
        });

        it("accepts custom size range", () => {
            const result = combined.colorAndSize(0.5, sequential.viridis, 2, 10);
            assert.strictEqual(result.color, sequential.viridis(0.5));
            assert.strictEqual(result.size, 6);
        });
    });

    describe("colorAndOpacity", () => {
        it("combines color and opacity for low values", () => {
            const result = combined.colorAndOpacity(0.0);
            assert.strictEqual(result.color, sequential.viridis(0.0));
            assert.strictEqual(result.opacity, 0.1);
        });

        it("combines color and opacity for high values", () => {
            const result = combined.colorAndOpacity(1.0);
            assert.strictEqual(result.color, sequential.viridis(1.0));
            assert.strictEqual(result.opacity, 1.0);
        });

        it("interpolates opacity correctly", () => {
            const result = combined.colorAndOpacity(0.5);
            assert.strictEqual(result.color, sequential.viridis(0.5));
            assert.strictEqual(result.opacity, 0.55);
        });

        it("accepts custom opacity range", () => {
            const result = combined.colorAndOpacity(0.5, sequential.viridis, 0.2, 0.8);
            assert.strictEqual(result.opacity, 0.5);
        });
    });

    describe("sizeAndOpacity", () => {
        it("combines size and opacity without color", () => {
            const result = combined.sizeAndOpacity(0.5);
            assert.isUndefined(result.color);
            assert.strictEqual(result.size, 3);
            assert.isDefined(result.opacity);
            assert.approximately(result.opacity, 0.65, 0.01);
        });

        it("uses custom ranges", () => {
            const result = combined.sizeAndOpacity(0.5, 2, 8, 0.4, 0.9);
            assert.strictEqual(result.size, 5);
            assert.strictEqual(result.opacity, 0.65);
        });

        it("handles min values", () => {
            const result = combined.sizeAndOpacity(0.0);
            assert.strictEqual(result.size, 1);
            assert.strictEqual(result.opacity, 0.3);
        });

        it("handles max values", () => {
            const result = combined.sizeAndOpacity(1.0);
            assert.strictEqual(result.size, 5);
            assert.strictEqual(result.opacity, 1.0);
        });
    });

    describe("fullSpectrum", () => {
        it("combines all three dimensions", () => {
            const result = combined.fullSpectrum(0.8);
            assert.strictEqual(result.color, sequential.viridis(0.8));
            assert.strictEqual(result.size, 4.2);
            assert.isDefined(result.opacity);
            assert.approximately(result.opacity, 0.84, 0.01);
        });

        it("handles minimum values", () => {
            const result = combined.fullSpectrum(0.0);
            assert.strictEqual(result.color, sequential.viridis(0.0));
            assert.strictEqual(result.size, 1);
            assert.strictEqual(result.opacity, 0.2);
        });

        it("handles maximum values", () => {
            const result = combined.fullSpectrum(1.0);
            assert.strictEqual(result.color, sequential.viridis(1.0));
            assert.strictEqual(result.size, 5);
            assert.strictEqual(result.opacity, 1.0);
        });

        it("accepts all custom parameters", () => {
            const result = combined.fullSpectrum(0.5, sequential.plasma, 2, 10, 0.3, 0.9);
            assert.strictEqual(result.color, sequential.plasma(0.5));
            assert.strictEqual(result.size, 6);
            assert.isDefined(result.opacity);
            assert.approximately(result.opacity, 0.6, 0.01);
        });
    });

    describe("categoryAndImportance", () => {
        it("combines categorical color with continuous size", () => {
            const result = combined.categoryAndImportance(2, 0.8);
            assert.strictEqual(result.color, categorical.okabeIto(2));
            assert.strictEqual(result.size, 4.2);
        });

        it("handles different categories", () => {
            const cat0 = combined.categoryAndImportance(0, 0.5);
            const cat1 = combined.categoryAndImportance(1, 0.5);
            assert.notStrictEqual(cat0.color, cat1.color);
            assert.strictEqual(cat0.size, cat1.size);
        });

        it("handles different importance levels", () => {
            const low = combined.categoryAndImportance(0, 0.2);
            const high = combined.categoryAndImportance(0, 0.8);
            assert.strictEqual(low.color, high.color);
            assert.isDefined(low.size);
            assert.isDefined(high.size);
            assert.isBelow(low.size, high.size);
        });

        it("accepts custom categorical palette", () => {
            const result = combined.categoryAndImportance(2, 0.5, categorical.tolVibrant);
            assert.strictEqual(result.color, categorical.tolVibrant(2));
            assert.strictEqual(result.size, 3);
        });

        it("accepts custom size range", () => {
            const result = combined.categoryAndImportance(1, 0.5, categorical.okabeIto, 2, 10);
            assert.strictEqual(result.size, 6);
        });
    });

    describe("divergingWithSize", () => {
        it("combines diverging color with size", () => {
            const result = combined.divergingWithSize(0.8);
            assert.strictEqual(result.color, diverging.purpleGreen(0.8, 0.5));
            assert.strictEqual(result.size, 4.2);
        });

        it("handles below midpoint values", () => {
            const result = combined.divergingWithSize(0.2);
            assert.strictEqual(result.color, diverging.purpleGreen(0.2, 0.5));
            assert.strictEqual(result.size, 1.8);
        });

        it("handles above midpoint values", () => {
            const result = combined.divergingWithSize(0.8);
            assert.strictEqual(result.color, diverging.purpleGreen(0.8, 0.5));
            assert.strictEqual(result.size, 4.2);
        });

        it("accepts custom midpoint", () => {
            const result = combined.divergingWithSize(0.6, 0.6);
            assert.strictEqual(result.color, diverging.purpleGreen(0.6, 0.6));
            assert.strictEqual(result.size, 3.4);
        });

        it("accepts custom diverging palette", () => {
            const result = combined.divergingWithSize(0.7, 0.5, diverging.blueOrange);
            assert.strictEqual(result.color, diverging.blueOrange(0.7, 0.5));
            assert.strictEqual(result.size, 3.8);
        });
    });

    describe("edgeFlow", () => {
        it("combines color and width for edges", () => {
            const result = combined.edgeFlow(0.8);
            assert.strictEqual(result.color, sequential.viridis(0.8));
            // Default range is 0.2-20, so 0.8 * (20-0.2) + 0.2 = 16.04
            assert.strictEqual(result.width, 0.2 + (0.8 * (20 - 0.2)));
        });

        it("handles minimum flow", () => {
            const result = combined.edgeFlow(0.0);
            assert.strictEqual(result.color, sequential.viridis(0.0));
            // Default minWidth is 0.2
            assert.strictEqual(result.width, 0.2);
        });

        it("handles maximum flow", () => {
            const result = combined.edgeFlow(1.0);
            assert.strictEqual(result.color, sequential.viridis(1.0));
            // Default maxWidth is 20
            assert.strictEqual(result.width, 20);
        });

        it("accepts custom color palette", () => {
            const result = combined.edgeFlow(0.5, sequential.inferno);
            assert.strictEqual(result.color, sequential.inferno(0.5));
            // 0.5 * (20-0.2) + 0.2 = 10.1
            assert.strictEqual(result.width, 0.2 + (0.5 * (20 - 0.2)));
        });

        it("accepts custom width range", () => {
            const result = combined.edgeFlow(0.5, sequential.viridis, 1, 10);
            assert.strictEqual(result.width, 5.5);
        });
    });

    describe("edgeFlowFull", () => {
        it("combines all three dimensions for edges", () => {
            const result = combined.edgeFlowFull(0.8);
            assert.strictEqual(result.color, sequential.viridis(0.8));
            assert.strictEqual(result.width, 4.1);
            assert.isDefined(result.opacity);
            assert.approximately(result.opacity, 0.82, 0.01);
        });

        it("handles minimum values", () => {
            const result = combined.edgeFlowFull(0.0);
            assert.strictEqual(result.color, sequential.viridis(0.0));
            assert.strictEqual(result.width, 0.5);
            assert.strictEqual(result.opacity, 0.1);
        });

        it("handles maximum values", () => {
            const result = combined.edgeFlowFull(1.0);
            assert.strictEqual(result.color, sequential.viridis(1.0));
            assert.strictEqual(result.width, 5);
            assert.strictEqual(result.opacity, 1.0);
        });

        it("accepts all custom parameters", () => {
            const result = combined.edgeFlowFull(0.5, sequential.plasma, 1, 8, 0.2, 0.9);
            assert.strictEqual(result.color, sequential.plasma(0.5));
            assert.strictEqual(result.width, 4.5);
            assert.strictEqual(result.opacity, 0.55);
        });

        it("does not include opacity if undefined", () => {
            const result = combined.edgeFlowFull(0.5);
            assert.isDefined(result.opacity);
        });
    });

    describe("Return type completeness", () => {
        it("colorAndSize returns only color and size", () => {
            const result = combined.colorAndSize(0.5);
            assert.isDefined(result.color);
            assert.isDefined(result.size);
            assert.isUndefined(result.opacity);
        });

        it("colorAndOpacity returns only color and opacity", () => {
            const result = combined.colorAndOpacity(0.5);
            assert.isDefined(result.color);
            assert.isDefined(result.opacity);
            assert.isUndefined(result.size);
        });

        it("sizeAndOpacity returns only size and opacity", () => {
            const result = combined.sizeAndOpacity(0.5);
            assert.isUndefined(result.color);
            assert.isDefined(result.size);
            assert.isDefined(result.opacity);
        });

        it("fullSpectrum returns all three", () => {
            const result = combined.fullSpectrum(0.5);
            assert.isDefined(result.color);
            assert.isDefined(result.size);
            assert.isDefined(result.opacity);
        });
    });
});
