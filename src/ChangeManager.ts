import onChange from "on-change";
import * as z4 from "zod/v4/core";

import {CalculatedValue} from "./CalculatedValue";
import {AdHocData} from "./config";

export class ChangeManager {
    readonly watchedInputs = new Map<string, CalculatedValue>();
    readonly dataObjects: Record<string, AdHocData | undefined> = {};
    readonly calculatedValues = new Set<CalculatedValue>();
    readonly schemas: Record<string, z4.$ZodObject | undefined> = {};

    watch(dataType: string, data: AdHocData, schema?: z4.$ZodObject) {
        const watchedData = onChange(data, (path, value, prevVal /* applyData */) => {
            // ignore all the intermediate steps of setting a new deep path on
            // an object
            if (typeof value === "object" &&
                value !== null &&
                Object.keys(value).length === 0 &&
                prevVal === undefined
            ) {
                return;
            }

            // see if this data change triggers a calculated value,
            // and run the calculated value if it does
            const cv = this.watchedInputs.get(`${dataType}.${path}`);
            if (cv) {
                cv.run(this.dataObjects as unknown as AdHocData);
            }
        });

        return this.addData(dataType, watchedData, schema);
    }

    addData(dataType: string, data: AdHocData, schema?: z4.$ZodObject) {
        if (this.dataObjects[dataType] !== undefined) {
            throw new TypeError(`data type: ${dataType} already exists in change manager`);
        }

        this.dataObjects[dataType] = data;
        this.schemas[dataType] = schema;

        return data;
    }

    addCalculatedValue(cv: CalculatedValue) {
        this.calculatedValues.add(cv);

        cv.inputs.forEach((i) => this.watchedInputs.set(i, cv));
    }
}
