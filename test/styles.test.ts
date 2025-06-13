import {BasicDualStyle, BasicEdgeStyle, BasicNodeSelector, BasicNodeStyle, MyEdgeStyle, MyNodeStyle} from "./helpers/styles.ts";
import {EdgeStyle, NodeStyle, colorToHex} from "../src/config.ts";
import {ErrorExtraFields, ErrorNodeOrEdge} from "./helpers/error-messages.ts";
import {assert, describe, it} from "vitest";
import {Styles} from "../src/Styles.ts";
import {ZodError} from "zod/v4";
import data2Edges from "./helpers/data2-edges.json";
import data2Nodes from "./helpers/data2-nodes.json";

const ParsedMyNodeStyle = NodeStyle.parse(MyNodeStyle);
const ParsedMyEdgeStyle = EdgeStyle.parse(MyEdgeStyle);

describe("Styles", () => {
    it("exists and is a class", () => {
        assert.isFunction(Styles);
    });

    it("adds default style", () => {
        const s = new Styles({addDefaultStyle: true});

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
            Styles.fromJson("[]");
        });
    });

    describe("fromObject", () => {
        it("accepts empty array", () => {
            Styles.fromObject([]);
        });
    });

    describe("StyleLayer", () => {
        it("throws on extra fields", () => {
            assert.throws(() => {
                Styles.fromJson("[{\"foo\": \"bar\"}]");
            }, ZodError, ErrorExtraFields);
        });

        it("throws on empty", () => {
            assert.throws(() => {
                Styles.fromJson("[{}]");
            }, ZodError, ErrorNodeOrEdge);
        });

        describe("for nodes", () => {
            it("accepts basic styling", () => {
                const s = Styles.fromObject(BasicNodeStyle);
                assert.lengthOf(s.layers, 1);
                // assert.strictEqual(s[0].node.style.color, "#C0FFEE");
            });
        });

        describe("for edges", () => {
            it("accepts basic styling", () => {
                Styles.fromObject(BasicEdgeStyle);
            });
        });

        describe("for nodes and edges", () => {
            it("accepts basic styling", () => {
                Styles.fromObject(BasicDualStyle);
            });
        });

        describe("colors", () => {
            it("converted by name", () => {
                assert.strictEqual(colorToHex("hotpink"), "#FF69B4FF");
            });

            it("converted by hex rgb", () => {
                assert.strictEqual(colorToHex("#c0ffee"), "#C0FFEEFF");
            });

            it("converted by hex rgba", () => {
                assert.strictEqual(colorToHex("#c0ffee00"), "#C0FFEE00");
            });

            it("converted by rgb", () => {
                assert.strictEqual(colorToHex("rgb(1, 3, 5)"), "#010305FF");
            });

            it("converted by rgba", () => {
                assert.strictEqual(colorToHex("rgba(200, 60, 60, 0.3)"), "#C83C3C4D");
            });

            it("converted by hsl", () => {
                assert.strictEqual(colorToHex("hsl(210, 79%, 30%)"), "#104C89FF");
            });

            it("converted by hsla", () => {
                assert.strictEqual(colorToHex("hsla(210, 79%, 30%, 0.4)"), "#104C8966");
            });

            it("converted by hwb", () => {
                assert.strictEqual(colorToHex("hwb(60, 3%, 60%)"), "#666608FF");
            });

            it("converted by hwba", () => {
                assert.strictEqual(colorToHex("hwb(60, 3%, 60%, 0.6)"), "#66660899");
            });
        });

        describe("addNodes", () => {
            it("picks node ids", () => {
                const s = Styles.fromObject(BasicNodeSelector);

                s.addNodes(data2Nodes);

                assert.lengthOf(s.layerSelectedNodes, 1);
                assert.lengthOf(s.layerSelectedNodes[0], 3);
                assert(s.layerSelectedNodes[0].has("Mlle.Baptistine"));
                assert(s.layerSelectedNodes[0].has("Mlle.Gillenormand"));
                assert(s.layerSelectedNodes[0].has("Mlle.Vaubois"));
            });

            it("all node ids", () => {
                const s = Styles.fromObject(BasicNodeStyle);

                s.addNodes(data2Nodes);

                assert.lengthOf(s.layerSelectedNodes, 1);
                assert.lengthOf(s.layerSelectedNodes[0], 77);
            });

            it("throws on bad node id path", () => {
                const s = Styles.fromObject(BasicNodeStyle);

                assert.throws(() => {
                    s.addNodes(data2Nodes, "asdf"); // bad node id path
                }, TypeError, "couldn't find node ID in first node data element");
            });
        });

        describe("getStyleForNode", () => {
            it("returns basic node style", () => {
                const s = Styles.fromObject(BasicNodeStyle);
                s.addNodes(data2Nodes);

                const style = s.getStyleForNode("Mlle.Baptistine");

                assert.deepStrictEqual(style, ParsedMyNodeStyle);
            });

            it("returns disabled style for node with no style", () => {
                // picks out three nodes to style...
                const s = Styles.fromObject(BasicNodeSelector);
                s.addNodes(data2Nodes);

                // ...and asks for the style of one of the nodes with no style
                const style = s.getStyleForNode("CountessdeLo");

                const expectedStyle = NodeStyle.parse({});
                expectedStyle.enabled = false;
                assert.deepStrictEqual(style, expectedStyle);
            });

            it("returns disabled style when no styles loaded", () => {
                const s = Styles.fromJson("[]");
                s.addNodes(data2Nodes);

                const style = s.getStyleForNode("CountessdeLo");

                const expectedStyle = NodeStyle.parse({});
                expectedStyle.enabled = false;
                assert.deepStrictEqual(style, expectedStyle);
            });
        });

        describe("addEdges", () => {
            it("throws on bad src path", () => {
                const s = Styles.fromObject(BasicEdgeStyle);

                assert.throws(() => {
                    s.addEdges(data2Edges, "foo", "target"); // bad source path
                }, TypeError, "couldn't find edge source ID in first edge data element");
            });

            it("throws on bad dst path", () => {
                const s = Styles.fromObject(BasicEdgeStyle);

                assert.throws(() => {
                    s.addEdges(data2Edges, "source", "foo"); // bad destination path
                }, TypeError, "couldn't find edge destination ID in first edge data element");
            });
        });

        describe("getStyleForEdge", () => {
            it("returns basic edge style", () => {
                const s = Styles.fromObject(BasicEdgeStyle);
                s.addEdges(data2Edges, "source", "target");
                // s.addEdges(data2Edges);

                const style = s.getStyleForEdge("Mme.Magloire", "Mlle.Baptistine");

                assert.deepStrictEqual(style, ParsedMyEdgeStyle);
            });
        });
    });
});
