import {assert, describe, expect, it} from "vitest";
import {DataSourceChunk} from "../src/data/DataSource";
import {JsonDataSource, JsonDataSourceConfig} from "../src/data/JsonDataSource";
import {z} from "zod/v4";

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
            console.log("ret", ret);
            assert.isObject(ret[0]);
            assert.hasAllKeys(ret[0], ["nodes", "edges"]);
            const chunk = ret[0] as DataSourceChunk;
            assert.isArray(chunk.nodes);
            assert.isArray(chunk.edges);
            assert.deepStrictEqual(chunk.nodes[0], {
                group: 1,
                id: "Myriel",
            });
            assert.deepStrictEqual(chunk.edges[0], {
                src: "Napoleon",
                dst: "Myriel",
                value: 1,
            });
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

            await expect(jdp.getData().next()).rejects.toThrow(/Invalid input: expected boolean, received string/);
        });
    });
});
