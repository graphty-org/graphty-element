import {assert, describe, it} from "vitest";
import {z} from "zod/v4";

import {AdHocData} from "../src/config";
import {DataSourceChunk} from "../src/data/DataSource";
import {JsonDataSource, JsonDataSourceConfig} from "../src/data/JsonDataSource";

describe("JsonDataSource", () => {
    it("exists", () => {
        assert.isFunction(JsonDataSource);
    });

    it("has 'json' type", () => {
        const data = "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json";
        const jdp = new JsonDataSource({data});
        assert.strictEqual(jdp.type, "json");
    });

    describe("config", () => {
        it("only requires 'data' property", () => {
            JsonDataSourceConfig.parse({data: "foo"});
        });
    });

    describe("sourceFetchData", () => {
        it("fetches data", async() => {
            const data = "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json";
            const jdp = new JsonDataSource({data});
            let ret: object[] = [];

            for await (const data of jdp.getData()) {
                ret = ret.concat(data);
            }

            assert.isArray(ret);
            assert.strictEqual(ret.length, 1);
            assert.isObject(ret[0]);
            assert.hasAllKeys(ret[0], ["nodes", "edges"]);
            const chunk = ret[0] as DataSourceChunk;
            assert.isArray(chunk.nodes);
            assert.isArray(chunk.edges);
            assert.deepStrictEqual(chunk.nodes[0], {
                group: 1,
                id: "Myriel",
            } as unknown as AdHocData);
            assert.deepStrictEqual(chunk.edges[0], {
                src: "Napoleon",
                dst: "Myriel",
                value: 1,
            } as unknown as AdHocData);
        });
    });

    describe("schema validation", () => {
        it("passes", async() => {
            const data = "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json";
            const schema = z.object({
                id: z.string(),
                group: z.number(),
            });
            const jdp = new JsonDataSource({data, node: {schema}});

            await jdp.getData().next();
        });

        it("fails", async() => {
            const data = "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json";
            const schema = z.object({
                id: z.boolean(), // wrong type
                group: z.number(),
            });
            const jdp = new JsonDataSource({data, node: {schema}});

            // Validation errors are now collected in ErrorAggregator instead of throwing
            const chunks = [];
            for await (const chunk of jdp.getData()) {
                chunks.push(chunk);
            }

            // Should have validation errors
            const errors = jdp.getErrorAggregator().getErrors();
            assert.isTrue(errors.length > 0, "Should have validation errors");
            assert.include(errors[0].message, "Validation failed");
        });
    });
});
