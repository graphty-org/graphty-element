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
                // validate schema if it exists
                const outputPath = cv.output.split(".");
                const outputDataType = outputPath.shift();
                if (!outputDataType) {
                    throw new Error("error getting data type of output for calculated value");
                }

                const topSchema = this.schemas[outputDataType];
                let schema: z4.$ZodType | undefined = undefined;
                if (topSchema) {
                    // console.log("schema.def.shape", schema.def.shape);
                    // console.log("outputPath", outputPath);
                    schema = getSchemaItemFromPath(topSchema, outputPath);
                }

                cv.run(this.dataObjects as unknown as AdHocData, schema);
            }
        });

        return this.addData(dataType, watchedData, schema);
    }

    addData(dataType: string, data: AdHocData, schema?: z4.$ZodObject) {
        if (this.dataObjects[dataType] !== undefined) {
            throw new TypeError(`data type: ${dataType} already exists in change manager`);
        }

        this.dataObjects[dataType] = data;
        if (schema) {
            this.schemas[dataType] = schema;
        }

        return data;
    }

    addCalculatedValue(cv: CalculatedValue) {
        this.calculatedValues.add(cv);

        cv.inputs.forEach((i) => this.watchedInputs.set(i, cv));
    }
}

function getSchemaItemFromPath(schema: z4.$ZodType, path: string[]) {
    if (schema instanceof z4.$ZodOptional) {
        // @ts-expect-error unwrap exists on optional, not sure why it doesn't show up here
        schema = schema.unwrap();
    }

    const currentItem = path.shift();
    if (!currentItem) {
        return schema;
    }

    if (schema instanceof z4.$ZodObject) {
        // @ts-expect-error shape exists on object, not sure why it doesn't show up here
        const schemaItem = schema.shape[currentItem];
        return getSchemaItemFromPath(schemaItem, path);
    }

    throw new Error(`don't know how to retreive path for: ${currentItem}.${path.join(".")}`);
}
