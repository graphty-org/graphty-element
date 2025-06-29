import {get as deepGet} from "lodash";
import {assert, describe, it} from "vitest";

import {CalculatedValue} from "../src/CalculatedValue";
import {AdHocData, NodeStyle} from "../src/config";

describe("CalculatedValue", () => {
    it("exists", () => {
        assert.isFunction(CalculatedValue);
    });

    it("does a simple calculation", () => {
        const expr = `{
            const a = arguments[0];
            const b = arguments[1];
            return a + b * b;
        }`;
        const cv = new CalculatedValue(["data.obj.input1", "data.obj.input2"], "style.shape.size", expr);

        const data: Record<string, unknown> = {
            obj: {
                input1: 42,
                input2: 7,
            },
        };
        const style = NodeStyle.parse({});
        cv.run({style, algorithmResults: {}, data} as unknown as AdHocData);

        assert.strictEqual(deepGet(style, "shape.size"), 91);
    });
});
