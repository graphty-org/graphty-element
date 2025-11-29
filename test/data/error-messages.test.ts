import {assert, describe, test} from "vitest";

import {CSVDataSource} from "../../src/data/CSVDataSource.js";
import {DOTDataSource} from "../../src/data/DOTDataSource.js";
import {GEXFDataSource} from "../../src/data/GEXFDataSource.js";
import {GMLDataSource} from "../../src/data/GMLDataSource.js";
import {GraphMLDataSource} from "../../src/data/GraphMLDataSource.js";
import {JsonDataSource} from "../../src/data/JsonDataSource.js";
import {PajekDataSource} from "../../src/data/PajekDataSource.js";

describe("Standardized error messages", () => {
    test("missing input error format - all DataSources", async() => {
        const sources = [
            new GraphMLDataSource({}),
            new GMLDataSource({}),
            new DOTDataSource({}),
            new GEXFDataSource({}),
            new PajekDataSource({}),
            new CSVDataSource({}),
        ];

        for (const source of sources) {
            let errorThrown = false;
            try {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                for await (const _chunk of source.getData()) {
                    // Should not get here
                }
            } catch (error) {
                errorThrown = true;
                assert.match(
                    (error as Error).message,
                    /DataSource requires data, file, or url/,
                    `Expected standardized error message for ${source.constructor.name}`,
                );
            }
            assert.strictEqual(errorThrown, true, `Expected error to be thrown for ${source.constructor.name}`);
        }
    });

    test("missing input error format - JsonDataSource", async() => {
        const source = new JsonDataSource({});
        let errorThrown = false;

        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            for await (const _chunk of source.getData()) {
                // Should not get here
            }
        } catch (error) {
            errorThrown = true;
            assert.match((error as Error).message, /DataSource requires data, file, or url/);
        }
        assert.strictEqual(errorThrown, true, "Expected error to be thrown");
    });

    test("network error includes retry count", async() => {
        const source = new GraphMLDataSource({
            url: "http://invalid-url-that-does-not-exist-graphty-test.example",
        });
        let errorThrown = false;

        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            for await (const _chunk of source.getData()) {
                // Should not get here
            }
        } catch (error) {
            errorThrown = true;
            assert.match((error as Error).message, /Failed to fetch .* after 3 attempts/);
        }
        assert.strictEqual(errorThrown, true, "Expected error to be thrown");
    });
});
