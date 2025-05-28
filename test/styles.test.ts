import {BasicDualStyle, BasicEdgeStyle, BasicNodeStyle} from "./helpers/styles.ts";
import {ErrorExtraFields, ErrorNodeOrEdge} from "./helpers/error-messages.ts";
import {assert, describe, it} from "vitest";
import {Styles} from "../src/Styles.ts";
import {ZodError} from "zod/v4";
import {colorToHex} from "../src/config.ts";

describe("Styles", () => {
    it("exists and is a class", () => {
        assert.isFunction(Styles);
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
                console.log("s", s);
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
    });
});
