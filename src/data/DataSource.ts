import {z} from "zod/v4";
import * as z4 from "zod/v4/core";

import {AdHocData} from "../config";
import {ErrorAggregator} from "./ErrorAggregator.js";

type DataSourceClass = new (opts: object) => DataSource;
const dataSourceRegistry = new Map<string, DataSourceClass>();
export interface DataSourceChunk {
    nodes: AdHocData[];
    edges: AdHocData[];
}

export abstract class DataSource {
    static readonly type: string;
    edgeSchema: z4.$ZodObject | null = null;
    nodeSchema: z4.$ZodObject | null = null;
    protected errorAggregator: ErrorAggregator;

    constructor(errorLimit = 100) {
        this.errorAggregator = new ErrorAggregator(errorLimit);
    }

    // abstract init(): Promise<void>;
    abstract sourceFetchData(): AsyncGenerator<DataSourceChunk, void, unknown>;

    /**
     * Get the error aggregator for this data source
     */
    getErrorAggregator(): ErrorAggregator {
        return this.errorAggregator;
    }

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

    async dataValidator(schema: z4.$ZodObject, obj: object): Promise<void> {
        const res = await z4.safeParseAsync(schema, obj);
        if (!res.success) {
            const errMsg = z.prettifyError(res.error);
            throw new TypeError(`Error while validating data in '${this.type}' data source:\n${errMsg}`);
        }
    }

    get type(): string {
        return (this.constructor as typeof DataSource).type;
    }

    static register<T extends DataSourceClass>(cls: T): T {
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
