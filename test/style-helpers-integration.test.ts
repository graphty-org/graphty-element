/**
 * Integration tests for CalculatedValue with StyleHelpers expressions.
 *
 * These tests verify that StyleHelpers expressions work correctly when executed
 * through the CalculatedValue system, covering the main expression patterns
 * used in graph visualizations.
 */
import {get as deepGet} from "lodash";
import {assert, describe, it} from "vitest";

import {CalculatedValue} from "../src/CalculatedValue";
import {AdHocData, EdgeStyle, NodeStyle} from "../src/config";

// Helper to get number value from style
function getNum(obj: object, path: string): number {
    return deepGet(obj, path) as number;
}

// Helper to get string value from style
function getStr(obj: object, path: string): string {
    return deepGet(obj, path) as string;
}

describe("StyleHelpers Integration", () => {
    describe("Sequential Color Expressions", () => {
        it("viridis gradient returns valid color", () => {
            const expr = "StyleHelpers.color.sequential.viridis(arguments[0])";
            const cv = new CalculatedValue(["data.value"], "style.texture.color", expr);

            const data = {value: 0.5};
            const style = NodeStyle.parse({});
            cv.run({style, algorithmResults: {}, data} as unknown as AdHocData);

            const color = getStr(style, "texture.color");
            assert.isString(color);
            assert.match(color, /^#[0-9a-f]{6}$/i, "Should return valid hex color");
        });

        it("plasma gradient returns valid color", () => {
            const expr = "StyleHelpers.color.sequential.plasma(arguments[0])";
            const cv = new CalculatedValue(["data.value"], "style.texture.color", expr);

            const data = {value: 0.75};
            const style = NodeStyle.parse({});
            cv.run({style, algorithmResults: {}, data} as unknown as AdHocData);

            const color = getStr(style, "texture.color");
            assert.isString(color);
            assert.match(color, /^#[0-9a-f]{6}$/i, "Should return valid hex color");
        });

        it("inferno gradient returns valid color", () => {
            const expr = "StyleHelpers.color.sequential.inferno(arguments[0])";
            const cv = new CalculatedValue(["data.value"], "style.texture.color", expr);

            const data = {value: 0.25};
            const style = NodeStyle.parse({});
            cv.run({style, algorithmResults: {}, data} as unknown as AdHocData);

            const color = getStr(style, "texture.color");
            assert.isString(color);
            assert.match(color, /^#[0-9a-f]{6}$/i, "Should return valid hex color");
        });
    });

    describe("Categorical Color Expressions", () => {
        it("okabeIto returns distinct colors for different categories", () => {
            const expr = "StyleHelpers.color.categorical.okabeIto(arguments[0])";
            const cv = new CalculatedValue(["data.communityId"], "style.texture.color", expr);

            const colors: string[] = [];
            for (let i = 0; i < 3; i++) {
                const data = {communityId: i};
                const style = NodeStyle.parse({});
                cv.run({style, algorithmResults: {}, data} as unknown as AdHocData);
                colors.push(getStr(style, "texture.color"));
            }

            assert.notStrictEqual(colors[0], colors[1], "Categories 0 and 1 should have different colors");
            assert.notStrictEqual(colors[1], colors[2], "Categories 1 and 2 should have different colors");
        });

        it("tolVibrant returns valid colors", () => {
            const expr = "StyleHelpers.color.categorical.tolVibrant(arguments[0])";
            const cv = new CalculatedValue(["data.communityId"], "style.texture.color", expr);

            const data = {communityId: 2};
            const style = NodeStyle.parse({});
            cv.run({style, algorithmResults: {}, data} as unknown as AdHocData);

            const color = getStr(style, "texture.color");
            assert.isString(color);
            assert.match(color, /^#[0-9a-f]{6}$/i, "Should return valid hex color");
        });
    });

    describe("Diverging Color Expressions", () => {
        it("purpleGreen with midpoint returns valid colors", () => {
            const expr = "StyleHelpers.color.diverging.purpleGreen(arguments[0], 0.5)";
            const cv = new CalculatedValue(["data.value"], "style.texture.color", expr);

            // Test below midpoint
            const styleLow = NodeStyle.parse({});
            cv.run({style: styleLow, algorithmResults: {}, data: {value: 0.2}} as unknown as AdHocData);
            const colorLow = getStr(styleLow, "texture.color");

            // Test above midpoint
            const styleHigh = NodeStyle.parse({});
            cv.run({style: styleHigh, algorithmResults: {}, data: {value: 0.8}} as unknown as AdHocData);
            const colorHigh = getStr(styleHigh, "texture.color");

            assert.isString(colorLow);
            assert.isString(colorHigh);
            assert.notStrictEqual(colorLow, colorHigh, "Colors below and above midpoint should differ");
        });

        it("blueOrange diverging gradient works", () => {
            const expr = "StyleHelpers.color.diverging.blueOrange(arguments[0], 0.5)";
            const cv = new CalculatedValue(["data.value"], "style.texture.color", expr);

            const style = NodeStyle.parse({});
            cv.run({style, algorithmResults: {}, data: {value: 0.9}} as unknown as AdHocData);

            const color = getStr(style, "texture.color");
            assert.isString(color);
            assert.match(color, /^#[0-9a-f]{6}$/i);
        });
    });

    describe("Binary Color Expressions", () => {
        it("blueHighlight returns different colors for true/false", () => {
            const expr = "StyleHelpers.color.binary.blueHighlight(arguments[0])";
            const cv = new CalculatedValue(["data.isHighlighted"], "style.texture.color", expr);

            const styleTrue = NodeStyle.parse({});
            cv.run({style: styleTrue, algorithmResults: {}, data: {isHighlighted: true}} as unknown as AdHocData);
            const colorTrue = getStr(styleTrue, "texture.color");

            const styleFalse = NodeStyle.parse({});
            cv.run({style: styleFalse, algorithmResults: {}, data: {isHighlighted: false}} as unknown as AdHocData);
            const colorFalse = getStr(styleFalse, "texture.color");

            assert.isString(colorTrue);
            assert.isString(colorFalse);
            assert.notStrictEqual(colorTrue, colorFalse, "True and false should have different colors");
        });

        it("greenSuccess and orangeWarning return valid colors", () => {
            const exprGreen = "StyleHelpers.color.binary.greenSuccess(arguments[0])";
            const cvGreen = new CalculatedValue(["data.success"], "style.texture.color", exprGreen);

            const style = NodeStyle.parse({});
            cvGreen.run({style, algorithmResults: {}, data: {success: true}} as unknown as AdHocData);

            const color = getStr(style, "texture.color");
            assert.isString(color);
            assert.match(color, /^#[0-9a-f]{6}$/i);
        });
    });

    describe("Size Expressions", () => {
        it("linear size scaling works correctly", () => {
            const expr = "StyleHelpers.size.linear(arguments[0], 1, 5)";
            const cv = new CalculatedValue(["data.value"], "style.shape.size", expr);

            const style = NodeStyle.parse({});
            cv.run({style, algorithmResults: {}, data: {value: 0.5}} as unknown as AdHocData);

            const size = getNum(style, "shape.size");
            assert.strictEqual(size, 3, "0.5 between 1-5 should yield 3");
        });

        it("logarithmic size scaling works", () => {
            const expr = "StyleHelpers.size.log(arguments[0], 1, 8)";
            const cv = new CalculatedValue(["data.value"], "style.shape.size", expr);

            const style = NodeStyle.parse({});
            cv.run({style, algorithmResults: {}, data: {value: 0.5}} as unknown as AdHocData);

            const size = getNum(style, "shape.size");
            assert.isNumber(size);
            assert.isAbove(size, 1);
            assert.isBelow(size, 8);
        });

        it("exponential size scaling works", () => {
            const expr = "StyleHelpers.size.exp(arguments[0], 1, 8, 3)";
            const cv = new CalculatedValue(["data.value"], "style.shape.size", expr);

            const style = NodeStyle.parse({});
            cv.run({style, algorithmResults: {}, data: {value: 0.5}} as unknown as AdHocData);

            const size = getNum(style, "shape.size");
            assert.isNumber(size);
            assert.isAbove(size, 1);
            assert.isBelow(size, 8);
        });

        it("smallMediumLarge returns discrete tiers", () => {
            const expr = "StyleHelpers.size.smallMediumLarge(arguments[0])";
            const cv = new CalculatedValue(["data.value"], "style.shape.size", expr);

            const sizes: number[] = [];
            for (const value of [0.1, 0.5, 0.9]) {
                const style = NodeStyle.parse({});
                cv.run({style, algorithmResults: {}, data: {value}} as unknown as AdHocData);
                sizes.push(getNum(style, "shape.size"));
            }

            assert.isBelow(sizes[0], sizes[1], "Small should be less than medium");
            assert.isBelow(sizes[1], sizes[2], "Medium should be less than large");
        });

        it("fiveTiers returns correct number of tiers", () => {
            const expr = "StyleHelpers.size.fiveTiers(arguments[0])";
            const cv = new CalculatedValue(["data.value"], "style.shape.size", expr);

            const sizes = new Set<number>();
            for (const value of [0.1, 0.3, 0.5, 0.7, 0.9]) {
                const style = NodeStyle.parse({});
                cv.run({style, algorithmResults: {}, data: {value}} as unknown as AdHocData);
                sizes.add(getNum(style, "shape.size"));
            }

            assert.strictEqual(sizes.size, 5, "Should have 5 distinct tier sizes");
        });
    });

    describe("Opacity Expressions", () => {
        it("linear opacity works correctly", () => {
            const expr = "StyleHelpers.opacity.linear(arguments[0])";
            const cv = new CalculatedValue(["data.value"], "style.texture.opacity", expr);

            const style = NodeStyle.parse({});
            cv.run({style, algorithmResults: {}, data: {value: 0.5}} as unknown as AdHocData);

            const opacity = getNum(style, "texture.opacity");
            assert.isNumber(opacity);
            assert.isAtLeast(opacity, 0);
            assert.isAtMost(opacity, 1);
        });

        it("binary opacity returns 0 or 1", () => {
            const expr = "StyleHelpers.opacity.binary(arguments[0])";
            const cv = new CalculatedValue(["data.visible"], "style.texture.opacity", expr);

            const styleTrue = NodeStyle.parse({});
            cv.run({style: styleTrue, algorithmResults: {}, data: {visible: true}} as unknown as AdHocData);
            const opacityTrue = getNum(styleTrue, "texture.opacity");

            const styleFalse = NodeStyle.parse({});
            cv.run({style: styleFalse, algorithmResults: {}, data: {visible: false}} as unknown as AdHocData);
            const opacityFalse = getNum(styleFalse, "texture.opacity");

            assert.strictEqual(opacityTrue, 1);
            assert.strictEqual(opacityFalse, 0);
        });
    });

    describe("Combined Expressions", () => {
        it("colorAndSize returns object with both properties", () => {
            const exprColor = "(result => result.color)(StyleHelpers.combined.colorAndSize(arguments[0]))";
            const exprSize = "(result => result.size)(StyleHelpers.combined.colorAndSize(arguments[0]))";

            const cvColor = new CalculatedValue(["data.value"], "style.texture.color", exprColor);
            const cvSize = new CalculatedValue(["data.value"], "style.shape.size", exprSize);

            const styleColor = NodeStyle.parse({});
            cvColor.run({style: styleColor, algorithmResults: {}, data: {value: 0.7}} as unknown as AdHocData);
            const color = getStr(styleColor, "texture.color");

            const styleSize = NodeStyle.parse({});
            cvSize.run({style: styleSize, algorithmResults: {}, data: {value: 0.7}} as unknown as AdHocData);
            const size = getNum(styleSize, "shape.size");

            assert.isString(color);
            assert.match(color, /^#[0-9a-f]{6}$/i);
            assert.isNumber(size);
            assert.isAbove(size, 0);
        });

        it("fullSpectrum returns color, size, and opacity", () => {
            const exprColor = "(result => result.color)(StyleHelpers.combined.fullSpectrum(arguments[0]))";
            const exprSize = "(result => result.size)(StyleHelpers.combined.fullSpectrum(arguments[0]))";
            const exprOpacity = "(result => result.opacity)(StyleHelpers.combined.fullSpectrum(arguments[0]))";

            const cvColor = new CalculatedValue(["data.value"], "style.texture.color", exprColor);
            const cvSize = new CalculatedValue(["data.value"], "style.shape.size", exprSize);
            const cvOpacity = new CalculatedValue(["data.value"], "style.texture.opacity", exprOpacity);

            const data = {value: 0.8};

            const styleColor = NodeStyle.parse({});
            cvColor.run({style: styleColor, algorithmResults: {}, data} as unknown as AdHocData);

            const styleSize = NodeStyle.parse({});
            cvSize.run({style: styleSize, algorithmResults: {}, data} as unknown as AdHocData);

            const styleOpacity = NodeStyle.parse({});
            cvOpacity.run({style: styleOpacity, algorithmResults: {}, data} as unknown as AdHocData);

            const resColor = getStr(styleColor, "texture.color");
            const resSize = getNum(styleSize, "shape.size");
            const resOpacity = getNum(styleOpacity, "texture.opacity");
            assert.isString(resColor);
            assert.isNumber(resSize);
            assert.isNumber(resOpacity);
        });

        it("edgeFlow returns color and width", () => {
            const exprColor = "(result => result.color)(StyleHelpers.combined.edgeFlow(arguments[0]))";
            const exprWidth = "(result => result.width)(StyleHelpers.combined.edgeFlow(arguments[0]))";

            const cvColor = new CalculatedValue(["data.value"], "style.line.color", exprColor);
            const cvWidth = new CalculatedValue(["data.value"], "style.line.width", exprWidth);

            const styleColor = EdgeStyle.parse({});
            cvColor.run({style: styleColor, algorithmResults: {}, data: {value: 0.5}} as unknown as AdHocData);
            const color = getStr(styleColor, "line.color");

            const styleWidth = EdgeStyle.parse({});
            cvWidth.run({style: styleWidth, algorithmResults: {}, data: {value: 0.5}} as unknown as AdHocData);
            const width = getNum(styleWidth, "line.width");

            assert.isString(color);
            assert.match(color, /^#[0-9a-f]{6}$/i);
            assert.isNumber(width);
            assert.isAbove(width, 0);
        });

        it("categoryAndImportance combines categorical color with size", () => {
            const exprColor = "(result => result.color)(StyleHelpers.combined.categoryAndImportance(arguments[0], arguments[1]))";
            const exprSize = "(result => result.size)(StyleHelpers.combined.categoryAndImportance(arguments[0], arguments[1]))";

            const cvColor = new CalculatedValue(
                ["data.communityId", "data.importance"],
                "style.texture.color",
                exprColor,
            );
            const cvSize = new CalculatedValue(
                ["data.communityId", "data.importance"],
                "style.shape.size",
                exprSize,
            );

            const data = {communityId: 2, importance: 0.7};

            const styleColor = NodeStyle.parse({});
            cvColor.run({style: styleColor, algorithmResults: {}, data} as unknown as AdHocData);

            const styleSize = NodeStyle.parse({});
            cvSize.run({style: styleSize, algorithmResults: {}, data} as unknown as AdHocData);

            const catColor = getStr(styleColor, "texture.color");
            const catSize = getNum(styleSize, "shape.size");
            assert.isString(catColor);
            assert.isNumber(catSize);
        });
    });

    describe("Block Statement Expressions", () => {
        it("block statement with return and StyleHelpers works", () => {
            const expr = "{ return StyleHelpers.color.sequential.viridis(arguments[0]) }";
            const cv = new CalculatedValue(["data.value"], "style.texture.color", expr);

            const style = NodeStyle.parse({});
            cv.run({style, algorithmResults: {}, data: {value: 0.6}} as unknown as AdHocData);

            const color = getStr(style, "texture.color");
            assert.isString(color);
            assert.match(color, /^#[0-9a-f]{6}$/i);
        });

        it("block statement with conditional logic works", () => {
            const expr = "{ if (arguments[0]) return '#009E73'; if (arguments[1]) return '#E69F00'; return '#999999'; }";
            const cv = new CalculatedValue(
                ["data.isSource", "data.isSink"],
                "style.texture.color",
                expr,
            );

            // Test source
            const styleSource = NodeStyle.parse({});
            cv.run({style: styleSource, algorithmResults: {}, data: {isSource: true, isSink: false}} as unknown as AdHocData);
            assert.strictEqual(deepGet(styleSource, "texture.color"), "#009E73");

            // Test sink
            const styleSink = NodeStyle.parse({});
            cv.run({style: styleSink, algorithmResults: {}, data: {isSource: false, isSink: true}} as unknown as AdHocData);
            assert.strictEqual(deepGet(styleSink, "texture.color"), "#E69F00");

            // Test neither
            const styleNeither = NodeStyle.parse({});
            cv.run({style: styleNeither, algorithmResults: {}, data: {isSource: false, isSink: false}} as unknown as AdHocData);
            assert.strictEqual(deepGet(styleNeither, "texture.color"), "#999999");
        });

        it("multiline block statement with math works", () => {
            const expr = `{
                let r = Math.round(255 * arguments[0]);
                let b = Math.round(255 * (1 - arguments[0]));
                return "rgb(" + r + ", 0," + b +")";
            }`;
            const cv = new CalculatedValue(["data.value"], "style.texture.color", expr);

            const style = NodeStyle.parse({});
            cv.run({style, algorithmResults: {}, data: {value: 0.5}} as unknown as AdHocData);

            const color = getStr(style, "texture.color");
            assert.isString(color);
            assert.match(color, /^rgb\(\d+, 0,\d+\)$/);
        });
    });

    describe("Animation Expressions", () => {
        it("interpolate with easeInOut works", () => {
            const expr = "StyleHelpers.animation.interpolate(1, 7, arguments[0], StyleHelpers.animation.easeInOut)";
            const cv = new CalculatedValue(["data.value"], "style.shape.size", expr);

            const style = NodeStyle.parse({});
            cv.run({style, algorithmResults: {}, data: {value: 0.5}} as unknown as AdHocData);

            const size = getNum(style, "shape.size");
            assert.isNumber(size);
            assert.isAbove(size, 1);
            assert.isBelow(size, 7);
        });
    });

    describe("Algorithm Result Path Expressions", () => {
        it("reads from algorithmResults path correctly", () => {
            const expr = "StyleHelpers.color.sequential.viridis(arguments[0])";
            const cv = new CalculatedValue(
                ["algorithmResults.graphty.degree.degreePct"],
                "style.texture.color",
                expr,
            );

            const style = NodeStyle.parse({});
            const algorithmResults = {
                graphty: {
                    degree: {
                        degreePct: 0.75,
                    },
                },
            };
            cv.run({style, algorithmResults, data: {}} as unknown as AdHocData);

            const color = getStr(style, "texture.color");
            assert.isString(color);
            assert.match(color, /^#[0-9a-f]{6}$/i);
        });
    });
});
