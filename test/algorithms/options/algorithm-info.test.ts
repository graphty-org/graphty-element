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
                assert.isObject(algo.zodOptionsSchema, "zodOptionsSchema should be an object");
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

        it("returns Zod schema for algorithms with zodOptionsSchema", () => {
            const info = getAllAlgorithmInfo();
            const pageRankInfo = info.find((i) => i.key === "graphty:pagerank");

            // Use explicit assertion that narrows the type
            if (!pageRankInfo) {
                assert.fail("PageRank algorithm should be found");
            }

            assert.isTrue(pageRankInfo.hasOptions, "PageRank should have options");
            assert.isObject(pageRankInfo.zodOptionsSchema, "PageRank should have zodOptionsSchema");
            // Verify it has expected options
            assert.property(pageRankInfo.zodOptionsSchema, "dampingFactor");
            assert.property(pageRankInfo.zodOptionsSchema, "maxIterations");
        });

        it("returns empty schema for algorithms without options", () => {
            const info = getAllAlgorithmInfo();
            const degreeInfo = info.find((i) => i.key === "graphty:degree");

            // Use explicit assertion that narrows the type
            if (!degreeInfo) {
                assert.fail("Degree algorithm should be found");
            }

            assert.isFalse(degreeInfo.hasOptions, "Degree should not have options");
            assert.deepStrictEqual(degreeInfo.zodOptionsSchema, {}, "Degree should have empty zodOptionsSchema");
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

        it("schema values match algorithm Zod schemas", () => {
            const schemas = getAllAlgorithmSchemas();

            // Check a specific algorithm with options
            const pagerankSchema = schemas.get("graphty:pagerank");
            const PageRankClass = Algorithm.getClass("graphty", "pagerank");

            assert.isDefined(pagerankSchema);
            assert.deepStrictEqual(pagerankSchema, PageRankClass?.getZodOptionsSchema());
        });

        it("returns empty schema for algorithms without Zod options", () => {
            const schemas = getAllAlgorithmSchemas();

            const degreeSchema = schemas.get("graphty:degree");
            assert.isDefined(degreeSchema);
            assert.deepStrictEqual(degreeSchema, {});
        });
    });

    describe("Algorithm static methods", () => {
        it("getZodOptionsSchema returns Zod schema for algorithms with zodOptionsSchema", () => {
            const PageRankClass = Algorithm.getClass("graphty", "pagerank");
            assert.isDefined(PageRankClass);

            if (PageRankClass) {
                const schema = PageRankClass.getZodOptionsSchema();
                assert.isObject(schema);
                assert.property(schema, "dampingFactor");
            }
        });

        it("getZodOptionsSchema returns empty object for algorithms without zodOptionsSchema", () => {
            const DegreeClass = Algorithm.getClass("graphty", "degree");
            assert.isDefined(DegreeClass);

            if (DegreeClass) {
                const schema = DegreeClass.getZodOptionsSchema();
                assert.deepStrictEqual(schema, {});
            }
        });

        it("hasZodOptions returns true for algorithms with zodOptionsSchema", () => {
            const PageRankClass = Algorithm.getClass("graphty", "pagerank");
            assert.isDefined(PageRankClass);
            if (PageRankClass) {
                assert.isTrue(PageRankClass.hasZodOptions());
            }
        });

        it("hasZodOptions returns false for algorithms without zodOptionsSchema", () => {
            const DegreeClass = Algorithm.getClass("graphty", "degree");
            assert.isDefined(DegreeClass);
            if (DegreeClass) {
                assert.isFalse(DegreeClass.hasZodOptions());
            }
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
