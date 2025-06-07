import {assert, describe, expect, it} from "vitest";
import {JsonDataSource} from "../src/data/JsonDataSource.ts";
import {z} from "zod/v4";

describe("JsonDataSource", () => {
    it("exists", () => {
        assert.isFunction(JsonDataSource);
    });

    describe("sourceFetchData", () => {
        it("fetches data", async() => {
            const data = "https://raw.githubusercontent.com/apowers313/graphty/refs/heads/master/test/helpers/data2-nodes.json";
            const jdp = new JsonDataSource({data});
            let ret: object[] = [];

            for await (const data of jdp.getData()) {
                ret = ret.concat(data);
            }

            assert.strictEqual(ret.length, 77);
            assert.deepStrictEqual(ret[0], {
                group: 1,
                id: "Myriel",
            });
        });
    });

    describe("schema validation", () => {
        it("passes", async() => {
            const data = "https://raw.githubusercontent.com/apowers313/graphty/refs/heads/master/test/helpers/data2-nodes.json";
            const schema = z.object({
                id: z.string(),
                group: z.number(),
            });
            const jdp = new JsonDataSource({data, schema});

            await jdp.getData().next();
        });

        it("fails", async() => {
            const data = "https://raw.githubusercontent.com/apowers313/graphty/refs/heads/master/test/helpers/data2-nodes.json";
            const schema = z.object({
                id: z.boolean(), // wrong type
                group: z.number(),
            });
            const jdp = new JsonDataSource({data, schema});

            await expect(jdp.getData().next()).rejects.toThrow(/Invalid input: expected boolean, received string/);
        });
    });
});
