import onChange from "on-change";
import * as z4 from "zod/v4/core";

import {CalculatedValue} from "./CalculatedValue";
import {AdHocData} from "./config";

/**
 * Manages reactive data changes and calculated values.
 */
export class ChangeManager {
    readonly watchedInputs = new Map<string, Set<CalculatedValue>>();
    readonly dataObjects: Record<string, AdHocData | undefined> = {};
    readonly calculatedValues = new Set<CalculatedValue>();
    readonly schemas: Record<string, z4.$ZodType | undefined> = {};

    /**
     * Creates a reactive proxy for data that triggers calculated values on changes.
     * @param dataType - Type identifier for the data
     * @param data - Data object to watch for changes
     * @param schema - Optional Zod schema for validation
     * @returns Proxied data object that triggers calculated values on changes
     */
    watch(dataType: string, data: AdHocData, schema?: z4.$ZodType): AdHocData {
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

            // see if this data change triggers calculated values,
            // and run the calculated values if it does
            const cvs = this.watchedInputs.get(`${dataType}.${path}`);
            // console.log("onChange:", this.watchedInputs, `${dataType}.${path}`, cvs);
            if (cvs) {
                // Run ALL calculated values watching this input path
                for (const cv of cvs) {
                    // find schema for validation, if it exists
                    const s = getSchema(this.schemas, cv.output);
                    cv.run(this.dataObjects as unknown as AdHocData, s);
                }
            }
        });

        // TODO: Consider whether schema should be passed here or obtained from local context
        return this.addData(dataType, watchedData, schema);
    }

    /**
     * Registers a data object with the change manager.
     * @param dataType - Type identifier for the data
     * @param data - Data object to register
     * @param schema - Optional Zod schema for validation
     * @returns The registered data object
     */
    addData(dataType: string, data: AdHocData, schema?: z4.$ZodType): AdHocData {
        if (this.dataObjects[dataType] !== undefined) {
            throw new TypeError(`data type: ${dataType} already exists in change manager`);
        }

        this.dataObjects[dataType] = data;
        if (schema) {
            this.schemas[dataType] = schema;
        }

        return data;
    }

    /**
     * Registers a calculated value to watch for input changes.
     * @param cv - Calculated value to register
     */
    addCalculatedValue(cv: CalculatedValue): void {
        this.calculatedValues.add(cv);

        // Add this calculated value to the set of CVs watching each input
        cv.inputs.forEach((i) => {
            let cvSet = this.watchedInputs.get(i);
            if (!cvSet) {
                cvSet = new Set<CalculatedValue>();
                this.watchedInputs.set(i, cvSet);
            }

            cvSet.add(cv);
        });
    }

    /**
     * Registers multiple calculated values at once.
     * @param cvs - Array of calculated values to register
     */
    addCalculatedValues(cvs: CalculatedValue[]): void {
        cvs.forEach((cv) => {
            this.addCalculatedValue(cv);
        });
    }

    /**
     * Loads calculated values, optionally running them immediately.
     * @param cvs - Array of calculated values to load
     * @param runImmediately - Whether to execute all calculated values immediately
     */
    loadCalculatedValues(cvs: CalculatedValue[], runImmediately = false): void {
        this.watchedInputs.clear();
        this.addCalculatedValues(cvs);

        // Optionally run all calculated values immediately
        // This is needed when calculated values are loaded after their input data is already populated
        if (runImmediately) {
            this.runAllCalculatedValues();
        }
    }

    /**
     * Run all calculated values immediately
     * This is needed when calculated values are loaded after their input data is already populated
     */
    runAllCalculatedValues(): void {
        for (const cv of this.calculatedValues) {
            const s = getSchema(this.schemas, cv.output);
            cv.run(this.dataObjects as unknown as AdHocData, s);
        }
    }
}

function getSchema(schemas: Record<string, z4.$ZodType | undefined>, output: string): z4.$ZodType | undefined {
    const outputPath = output.split(".");
    const outputDataType = outputPath.shift();
    if (!outputDataType) {
        throw new Error("error getting data type of output for calculated value");
    }

    const topSchema = schemas[outputDataType];
    if (!topSchema) {
        // console.log("schema.def.shape", schema.def.shape);
        // console.log("outputPath", outputPath);
        return undefined;
    }

    return getSchemaItemFromPath(topSchema, outputPath);
}

function getSchemaItemFromPath(schema: z4.$ZodType, path: string[]): z4.$ZodType | undefined {
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
