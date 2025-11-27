import {get as deepGet} from "lodash";
import {assert, describe, it} from "vitest";

import {CalculatedValue} from "../src/CalculatedValue";
import {AdHocData, NodeStyle} from "../src/config";

describe("CalculatedValue", () => {
    it("exists", () => {
        assert.isFunction(CalculatedValue);
    });

    it("does a simple calculation", () => {
        // Expression should be a simple expression (not a block statement)
        // arguments[0] is input1 (42), arguments[1] is input2 (7)
        // 42 + 7 * 7 = 42 + 49 = 91
        const expr = "arguments[0] + arguments[1] * arguments[1]";
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
