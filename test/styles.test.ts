import {assert, describe, it} from "vitest";
import {ZodError} from "zod/v4";

import {colorToHex, defaultEdgeStyle, defaultNodeStyle, EdgeStyle, NodeStyle} from "../src/config";
import {Styles} from "../src/Styles";
import {ErrorExtraFields, ErrorNodeOrEdge} from "./helpers/error-messages";
import {MyEdgeStyle, MyNodeStyle} from "./helpers/styles.ts";
import badLayer from "./helpers/styles-bad-layer.json";
import basicDualStyle from "./helpers/styles-basic-dual.json";
import basicEdgeStyle from "./helpers/styles-basic-edge.json";
import basicNodeStyle from "./helpers/styles-basic-node.json";
import basicSelector from "./helpers/styles-basic-selector.json";
import defaultStyle from "./helpers/styles-default.json";
import emptyStyle from "./helpers/styles-empty.json";
import emptyLayer from "./helpers/styles-empty-layer.json";
import twoLayerTemplate from "./helpers/styles-two-layers.json";

const ParsedMyNodeStyle = NodeStyle.parse(MyNodeStyle);
const ParsedMyEdgeStyle = EdgeStyle.parse(MyEdgeStyle);

describe("Styles", () => {
    it("exists and is a class", () => {
        assert.isFunction(Styles);
    });

    it("adds default style", () => {
        const s = Styles.fromObject(defaultStyle);

        assert.isTrue(s.config.graph.addDefaultStyle);

        assert.strictEqual(s.layers.length, 1);
        const nodeAppliedStyle = s.layers[0].node;
        const expectedNodeStyle = NodeStyle.parse(defaultNodeStyle);
        assert.isDefined(nodeAppliedStyle);
        assert.deepStrictEqual(nodeAppliedStyle.style, expectedNodeStyle);
        assert.strictEqual(nodeAppliedStyle.selector, "");
        const edgeAppliedStyle = s.layers[0].edge;
        const expectedEdgeStyle = EdgeStyle.parse(defaultEdgeStyle);
        assert.isDefined(edgeAppliedStyle);
        assert.deepStrictEqual(edgeAppliedStyle.style, expectedEdgeStyle);
        assert.strictEqual(edgeAppliedStyle.selector, "");
    });

    describe("fromJson", () => {
        it("accepts empty json array", () => {
            Styles.fromJson("{\"graphtyTemplate\": true, \"majorVersion\": \"1\", \"layers\": []}");
        });
    });

    describe("fromObject", () => {
        it("accepts empty array", () => {
            Styles.fromObject({graphtyTemplate: true, majorVersion: "1", layers: []});
        });
    });

    describe("StyleLayer", () => {
        it("throws on extra fields", () => {
            assert.throws(() => {
                Styles.fromObject(badLayer);
            }, ZodError, ErrorExtraFields);
        });

        it("throws on empty", () => {
            assert.throws(() => {
                Styles.fromObject(emptyLayer);
            }, ZodError, ErrorNodeOrEdge);
        });

        describe("for nodes", () => {
            it("accepts basic styling", () => {
                const s = Styles.fromObject(basicNodeStyle);
                assert.lengthOf(s.layers, 1);
                // assert.strictEqual(s[0].node.style.color, "#C0FFEE");
            });
        });

        describe("for edges", () => {
            it("accepts basic styling", () => {
                Styles.fromObject(basicEdgeStyle);
            });
        });

        describe("for nodes and edges", () => {
            it("accepts basic styling", () => {
                Styles.fromObject(basicDualStyle);
            });
        });

        describe("colors", () => {
            it("converted by name", () => {
                assert.strictEqual(colorToHex("hotpink"), "#FF69B4");
            });

            it("converted by hex rgb", () => {
                assert.strictEqual(colorToHex("#c0ffee"), "#C0FFEE");
            });

            it("converted by hex rgba", () => {
                assert.strictEqual(colorToHex("#c0ffee00"), "#C0FFEE00");
            });

            it("converted by rgb", () => {
                assert.strictEqual(colorToHex("rgb(1, 3, 5)"), "#010305");
            });

            it("converted by rgba", () => {
                assert.strictEqual(colorToHex("rgba(200, 60, 60, 0.3)"), "#C83C3C4D");
            });

            it("converted by hsl", () => {
                assert.strictEqual(colorToHex("hsl(210, 79%, 30%)"), "#104D89");
            });

            it("converted by hsla", () => {
                assert.strictEqual(colorToHex("hsla(210, 79%, 30%, 0.4)"), "#104D8966");
            });

            it("converted by hwb", () => {
                assert.strictEqual(colorToHex("hwb(60, 3%, 60%)"), "#666608");
            });

            it("converted by hwba", () => {
                assert.strictEqual(colorToHex("hwb(60, 3%, 60%, 0.6)"), "#666608");
            });
        });

        describe("getStyleForNode", () => {
            it("returns basic node style", () => {
                const s = Styles.fromObject(basicNodeStyle);

                const styleId = s.getStyleForNode({id: "Mlle.Baptistine"});
                const style = Styles.getStyleForNodeStyleId(styleId);

                assert.deepStrictEqual(style, ParsedMyNodeStyle);
            });

            it("returns disabled style for node with no style", () => {
                // picks out three nodes to style...
                const s = Styles.fromObject(basicSelector);

                // ...and asks for the style of one of the nodes with no style
                const styleId = s.getStyleForNode({id: "CountessdeLo"});
                const style = Styles.getStyleForNodeStyleId(styleId);

                const expectedStyle = NodeStyle.parse({});
                expectedStyle.enabled = false;
                assert.deepStrictEqual(style, expectedStyle);
            });

            it("styles selected node", () => {
                // picks out three nodes to style...
                const s = Styles.fromObject(basicSelector);

                // ...and get one of the nodes with the new style
                const styledId = s.getStyleForNode({id: "Mlle.Baptistine"});
                const styled = Styles.getStyleForNodeStyleId(styledId);

                const expectedStyled = NodeStyle.parse({});
                expectedStyled.enabled = true;
                assert.deepStrictEqual(styled, ParsedMyNodeStyle);
            });

            it("returns disabled style when no styles loaded", () => {
                const s = Styles.fromObject(emptyStyle);

                const styleId = s.getStyleForNode({id: "CountessdeLo"});
                const style = Styles.getStyleForNodeStyleId(styleId);

                const expectedStyle = NodeStyle.parse({});
                expectedStyle.enabled = false;
                assert.deepStrictEqual(style, expectedStyle);
            });

            it("overrides lower layers", () => {
                // const s = Styles.fromObject(TwoLayersOfNodeColors);
                const s = Styles.fromObject(twoLayerTemplate);

                const styleId = s.getStyleForNode({id: 1});
                const style = Styles.getStyleForNodeStyleId(styleId);

                assert.strictEqual(style.texture?.color, "#00F0");
            });
        });

        describe("getStyleForEdge", () => {
            it("returns basic edge style", () => {
                const s = Styles.fromObject(basicEdgeStyle);

                const styleId = s.getStyleForEdge({src: "Mme.Magloire", dst: "Mlle.Baptistine"});
                const style = Styles.getStyleForEdgeStyleId(styleId);

                assert.deepStrictEqual(style, ParsedMyEdgeStyle);
            });
        });
    });
});
