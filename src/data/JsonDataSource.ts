import * as z4 from "zod/v4/core";
import {DataSource} from "./DataSource";
import {JSONParser} from "@streamparser/json";
import type {PartiallyOptional} from "../config";
import {z} from "zod/v4";

export const JsonDataSourceConfig = z.object({
    data: z.string(),
    edgesPath: z.string().default("nodes"),
    nodesPath: z.string().default("edges"),
    schema: z.custom<z4.$ZodObject>(),
});

export type JsonDataSourceConfigType = PartiallyOptional<z.infer<typeof JsonDataSourceConfig>, "edgesPath" | "nodesPath" | "schema">

export class JsonDataSource extends DataSource {
    name = "json";
    url: string;

    constructor(opts: JsonDataSourceConfigType) {
        super();

        opts = JsonDataSourceConfig.parse(opts);
        if (opts.schema) {
            this.schema = opts.schema;
        }

        this.url = opts.data;
    }

    async *SourceFetchData(): AsyncGenerator<object[], void, unknown> {
        let ret: object[] = [];

        const parser = new JSONParser();
        parser.onValue = ({value, stack}) => {
            if (stack.length !== 1) {
                return;
            }

            if (value instanceof Object) {
                ret.push(value);
            }
        };

        // TODO: fetch args
        const response = await fetch(this.url);
        // TODO: error handling
        if (!response.body) {
            throw new Error();
        }

        const reader = response.body.getReader();
        while (true) {
            const {done, value} = await reader.read();
            if (done) {
                break;
            }

            parser.write(value);

            if (ret.length > 3) {
                yield ret;
                ret = [];
            }
        }
    }
}
