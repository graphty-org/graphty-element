import * as z4 from "zod/v4/core";
import {z} from "zod/v4";

type DataSourceClass = new (opts: object) => DataSource
export const dataSourceRegistry: Map<string, DataSourceClass> = new Map();
export interface DataSourceChunk {
    nodes: object[],
    edges: object[]
}

export abstract class DataSource {
    static readonly type: string;
    edgeSchema: z4.$ZodObject | null = null;
    nodeSchema: z4.$ZodObject | null = null;

    // abstract init(): Promise<void>;
    abstract sourceFetchData(): AsyncGenerator<DataSourceChunk, void, unknown>;

    async *getData(): AsyncGenerator<DataSourceChunk, void, unknown> {
        for await (const chunk of this.sourceFetchData()) {
            if (this.nodeSchema) {
                for (const n of chunk.nodes) {
                    await this.dataValidator(this.nodeSchema, n);
                }
            }

            if (this.edgeSchema) {
                for (const e of chunk.edges) {
                    await this.dataValidator(this.edgeSchema, e);
                }
            }

            yield chunk;
        }
    }

    async dataValidator(schema: z4.$ZodObject, obj: object) {
        const res = await z4.safeParseAsync(schema, obj);
        if (!res.success) {
            const errMsg = z.prettifyError(res.error);
            throw new TypeError(`Error while validating data in '${this.type}' data source:\n${errMsg}`);
        }
    }

    get type() {
        return (this.constructor as typeof DataSource).type;
    }

    static register<T extends DataSourceClass>(cls: T) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const t: string = (cls as any).type;
        dataSourceRegistry.set(t, cls);
        return cls;
    }

    static get(type: string, opts: object = {}): DataSource | null {
        const SourceClass = dataSourceRegistry.get(type);
        if (SourceClass) {
            return new SourceClass(opts);
        }

        return null;
    }
}
