import {get as deepGet, set as deepSet} from "lodash";
import * as z4 from "zod/v4/core";

import {AdHocData, StyleHelpers} from "./config";

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

/**
 * Expression function type that accepts StyleHelpers and variable arguments.
 */
type ExpressionFunction = (styleHelpers: typeof StyleHelpers, ... args: unknown[]) => unknown;

/**
 * Represents a calculated value that computes outputs based on input data.
 */
export class CalculatedValue {
    inputs: string[];
    output: string;
    expr: string;
    exprFn: ExpressionFunction;

    /**
     * Creates a new calculated value instance.
     * @param inputs - Array of input property paths to extract from data
     * @param output - Output property path where result will be stored
     * @param expr - Expression string or function to compute the output
     */
    constructor(inputs: string[], output: string, expr: string | ((... args: unknown[]) => unknown)) {
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
        }

        this.expr = expr;
        // Create a function that has both StyleHelpers and arguments available in scope
        // We use ...args rest parameter which gets converted to the arguments object

        // Check if expr is a block statement (starts with {)
        // If so, extract the body and don't wrap in return()
        const trimmedExpr = expr.trim();
        const isBlockStatement = trimmedExpr.startsWith("{") && trimmedExpr.endsWith("}");

        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        this.exprFn = Function("StyleHelpers", "...args", isBlockStatement ?
            `const arguments = args; ${trimmedExpr}` :
            `const arguments = args; return (${expr});`) as ExpressionFunction;
    }

    /**
     * Executes the calculated value expression with the provided data.
     * @param data - Data object containing inputs and where output will be stored
     * @param schema - Optional Zod schema for validating the computed result
     */
    run(data: AdHocData, schema?: z4.$ZodType): void {
        // TODO: inputs can be: style.*, data.*, algorithm.*
        const args = this.inputs.map((i) => deepGet(data, i));
        let ret = this.exprFn(StyleHelpers, ... args);
        if (schema) {
            // @ts-expect-error parse exists on schema, not sure why it isn't found here
            ret = schema.parse(ret);
        }

        deepSet(data, this.output, ret);
    }
}
