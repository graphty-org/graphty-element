import * as z4 from "zod/v4/core";
import {z} from "zod/v4";

export const dataProviderRegistry: Map<string, DataProvider> = new Map();

export abstract class DataProvider {
    abstract readonly name: string;
    schema: z4.$ZodObject | null = null;

    // abstract init(): Promise<void>;
    abstract providerFetchData(): AsyncGenerator<object[], void, unknown>;

    async *getData(): AsyncGenerator<object[], void, unknown> {
        for await (const objs of this.providerFetchData()) {
            if (this.schema) {
                for (const obj of objs) {
                    await this.dataValidator(obj);
                }
            }

            yield objs;
        }
    }

    async dataValidator(obj: object) {
        if (this.schema) {
            // await z4.parseAsync(this.schema, obj);
            const res = await z4.safeParseAsync(this.schema, obj);
            if (!res.success) {
                const errMsg = z.prettifyError(res.error);
                throw new TypeError(`Error while validating data in '${this.name}' data provider:\n${errMsg}`);
            }
        }
    }

    static register() {

    }
}
