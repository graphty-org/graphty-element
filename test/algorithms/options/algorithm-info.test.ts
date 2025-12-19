import {assert, describe, it} from "vitest";

import {
    Algorithm,
    getAllAlgorithmInfo,
    getAllAlgorithmSchemas,
} from "../../../src/algorithms/index";

describe("Algorithm Info Utilities", () => {
    describe("getAllAlgorithmInfo", () => {
        it("returns an array of algorithm info objects", () => {
            const info = getAllAlgorithmInfo();
            assert.isArray(info);
            assert.isTrue(info.length > 0, "Should have registered algorithms");
        });

        it("each info object has required properties", () => {
            const info = getAllAlgorithmInfo();

            for (const algo of info) {
                assert.isString(algo.namespace, "namespace should be a string");
                assert.isString(algo.type, "type should be a string");
                assert.isString(algo.key, "key should be a string");
                assert.strictEqual(algo.key, `${algo.namespace}:${algo.type}`, "key should match namespace:type");
                assert.isObject(algo.schema, "schema should be an object");
                assert.isBoolean(algo.hasOptions, "hasOptions should be a boolean");
                assert.isBoolean(algo.hasSuggestedStyles, "hasSuggestedStyles should be a boolean");
            }
        });

        it("includes known algorithms", () => {
            const info = getAllAlgorithmInfo();
            const keys = info.map((i) => i.key);

            // Check for some known algorithms
            assert.include(keys, "graphty:degree");
            assert.include(keys, "graphty:dijkstra");
            assert.include(keys, "graphty:pagerank");
            assert.include(keys, "graphty:louvain");
        });
    });

    describe("getAllAlgorithmSchemas", () => {
        it("returns a Map", () => {
            const schemas = getAllAlgorithmSchemas();
            assert.instanceOf(schemas, Map);
        });

        it("has entries for all registered algorithms", () => {
            const schemas = getAllAlgorithmSchemas();
            const info = getAllAlgorithmInfo();

            assert.strictEqual(schemas.size, info.length);
        });

        it("schema values match algorithm schemas", () => {
            const schemas = getAllAlgorithmSchemas();

            // Check a specific algorithm
            const degreeSchema = schemas.get("graphty:degree");
            const DegreeClass = Algorithm.getClass("graphty", "degree");

            assert.isDefined(degreeSchema);
            assert.deepStrictEqual(degreeSchema, DegreeClass?.getOptionsSchema());
        });
    });

    describe("Export availability", () => {
        it("exports Algorithm class", () => {
            assert.isDefined(Algorithm);
            assert.isFunction(Algorithm);
        });

        it("exports getAllAlgorithmInfo function", () => {
            assert.isDefined(getAllAlgorithmInfo);
            assert.isFunction(getAllAlgorithmInfo);
        });

        it("exports getAllAlgorithmSchemas function", () => {
            assert.isDefined(getAllAlgorithmSchemas);
            assert.isFunction(getAllAlgorithmSchemas);
        });
    });
});
