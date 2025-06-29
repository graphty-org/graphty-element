import {get as deepGet, set as deepSet} from "lodash";

import {AdHocData} from "./config";

// interface CalculatedValueNodeData {
//     style: AdHocData,
//     data: AdHocData,
//     algorithmResults: AdHocData,
// }

// interface CalculatedValueEdgeData {
//     style: AdHocData,
//     data: AdHocData,
//     algorithmResults: AdHocData,
// }

// type CalculatedValueData = CalculatedValueNodeData | CalculatedValueEdgeData;

export class CalculatedValue {
    inputs: string[];
    output: string;
    expr: string;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    exprFn: Function;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    constructor(inputs: string[], output: string, expr: string | Function) {
        this.inputs = inputs;
        this.output = output;

        // extract the body of the function
        if (typeof expr === "function") {
            const fnStr = expr.toString();
            const fnBodyMatch = /[^{]+(\{[\s\S]*\})/.exec(fnStr);
            if (!fnBodyMatch?.[1]) {
                throw new Error("couldn't get function body from expression");
            }

            expr = fnBodyMatch[1];
            console.log("function body expr:", expr);
        }

        this.expr = expr;
        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        this.exprFn = Function(expr);
    }

    run(data: AdHocData) {
        // TODO: inputs can be: style.*, data.*, algorithm.*
        const args = this.inputs.map((i) => deepGet(data, i));
        console.log("args", args);
        const ret = this.exprFn(... args);
        console.log("data", JSON.stringify(data, null, 4));
        deepSet(data, this.output, ret);
    }
}
