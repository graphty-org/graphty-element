import {MyEdgeStyle, MyNodeStyle} from "./helpers/styles.ts";
import {EdgeStyle, NodeStyle, colorToHex} from "../src/config.ts";
import {ErrorExtraFields, ErrorNodeOrEdge} from "./helpers/error-messages.ts";
import {assert, describe, it} from "vitest";
import {Styles} from "../src/Styles.ts";
import {ZodError} from "zod/v4";
import data2Edges from "./helpers/data2-edges.json";
import twoLayerTemplate from "./helpers/styles-two-layers.json";
import basicNodeStyle from "./helpers/styles-basic-node.json";
import basicEdgeStyle from "./helpers/styles-basic-edge.json";
import basicDualStyle from "./helpers/styles-basic-dual.json";
import basicSelector from "./helpers/styles-basic-selector.json";
import emptyStyle from "./helpers/styles-empty.json";
import emptyLayer from "./helpers/styles-empty-layer.json";
import badLayer from "./helpers/styles-bad-layer.json";

const ParsedMyNodeStyle = NodeStyle.parse(MyNodeStyle);
const ParsedMyEdgeStyle = EdgeStyle.parse(MyEdgeStyle);

describe("Styles", () => {
    it("exists and is a class", () => {
        assert.isFunction(Styles);
    });

    it("adds default style", () => {
        const s = Styles.default();

        assert.isTrue(s.config.graph.addDefaultStyle);

        assert.strictEqual(s.layers.length, 1);
        const nodeAppliedStyle = s.layers[0].node;
        const expectedNodeStyle = NodeStyle.parse({});
        assert.isDefined(nodeAppliedStyle);
        assert.deepStrictEqual(nodeAppliedStyle.style, expectedNodeStyle);
        assert.strictEqual(nodeAppliedStyle.selector, "");
        const edgeAppliedStyle = s.layers[0].edge;
        const expectedEdgeStyle = EdgeStyle.parse({});
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

                const style = s.getStyleForNode({id: "Mlle.Baptistine"});

                assert.deepStrictEqual(style, ParsedMyNodeStyle);
            });

            it("returns disabled style for node with no style", () => {
                // picks out three nodes to style...
                const s = Styles.fromObject(basicSelector);

                // ...and asks for the style of one of the nodes with no style
                const style = s.getStyleForNode({id: "CountessdeLo"});

                const expectedStyle = NodeStyle.parse({});
                expectedStyle.enabled = false;
                assert.deepStrictEqual(style, expectedStyle);
            });

            it("returns disabled style when no styles loaded", () => {
                const s = Styles.fromObject(emptyStyle);

                const style = s.getStyleForNode({id: "CountessdeLo"});

                const expectedStyle = NodeStyle.parse({});
                expectedStyle.enabled = false;
                assert.deepStrictEqual(style, expectedStyle);
            });

            it("overrides lower layers", () => {
                // const s = Styles.fromObject(TwoLayersOfNodeColors);
                const s = Styles.fromObject(twoLayerTemplate);

                const style = s.getStyleForNode({id: 1});

                assert.strictEqual(style.texture?.color, "#00F0");
            });
        });

        describe("addEdges", () => {
            it("throws on bad src path", () => {
                const s = Styles.fromObject(basicEdgeStyle);

                assert.throws(() => {
                    s.addEdges(data2Edges, "foo", "target"); // bad source path
                }, TypeError, "couldn't find edge source ID in first edge data element");
            });

            it("throws on bad dst path", () => {
                const s = Styles.fromObject(basicEdgeStyle);

                assert.throws(() => {
                    s.addEdges(data2Edges, "source", "foo"); // bad destination path
                }, TypeError, "couldn't find edge destination ID in first edge data element");
            });
        });

        describe("getStyleForEdge", () => {
            it("returns basic edge style", () => {
                const s = Styles.fromObject(basicEdgeStyle);
                s.addEdges(data2Edges, "source", "target");
                // s.addEdges(data2Edges);

                const style = s.getStyleForEdge("Mme.Magloire", "Mlle.Baptistine");

                assert.deepStrictEqual(style, ParsedMyEdgeStyle);
            });
        });
    });
});
