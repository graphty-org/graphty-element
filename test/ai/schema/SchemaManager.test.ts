/**
 * SchemaManager Tests - Tests for schema lifecycle management.
 * @module test/ai/schema/SchemaManager.test
 */

import {assert, beforeEach, describe, it} from "vitest";

import {SchemaManager} from "../../../src/ai/schema/SchemaManager";
import type {Graph} from "../../../src/Graph";
import {createSchemaTestGraph} from "../../helpers/schema-test-graph";

describe("SchemaManager", () => {
    let graph: Graph;
    let schemaManager: SchemaManager;

    beforeEach(() => {
        graph = createSchemaTestGraph({nodeCount: 30});
        schemaManager = new SchemaManager(graph);
    });

    describe("extract()", () => {
        it("extracts schema from graph", () => {
            const schema = schemaManager.extract();

            assert.ok(schema.nodeProperties.length > 0, "Should have node properties");
            assert.ok(schema.edgeProperties.length > 0, "Should have edge properties");
            assert.strictEqual(schema.nodeCount, 30);
            assert.ok(schema.edgeCount > 0);
        });

        it("caches extracted schema", () => {
            const schema1 = schemaManager.extract();
            const schema2 = schemaManager.extract();

            // Should return same cached reference
            assert.strictEqual(schema1, schema2, "Should return cached schema");
        });
    });

    describe("getFormattedSchema()", () => {
        it("returns formatted schema as markdown", () => {
            const formatted = schemaManager.getFormattedSchema();

            assert.ok(typeof formatted === "string", "Should return a string");
            assert.ok(formatted.includes("Schema") || formatted.includes("##"), "Should contain markdown");
            assert.ok(formatted.includes("Node") || formatted.includes("node"), "Should reference nodes");
        });

        it("caches formatted schema", () => {
            const formatted1 = schemaManager.getFormattedSchema();
            const formatted2 = schemaManager.getFormattedSchema();

            // Should return same cached reference
            assert.strictEqual(formatted1, formatted2, "Should return cached formatted schema");
        });
    });

    describe("invalidateCache()", () => {
        it("clears cached schema", () => {
            // Extract first to populate cache
            const schema1 = schemaManager.extract();

            // Invalidate
            schemaManager.invalidateCache();

            // Extract again - should get new object (even if same content)
            const schema2 = schemaManager.extract();

            assert.notStrictEqual(schema1, schema2, "Should return new schema object after invalidation");
        });

        it("clears cached formatted schema", () => {
            // Format first to populate cache
            schemaManager.getFormattedSchema();

            // Verify cache is populated
            assert.ok(schemaManager.getSchema() !== null, "Schema should be cached before invalidation");

            // Invalidate
            schemaManager.invalidateCache();

            // Cache should be cleared
            assert.strictEqual(schemaManager.getSchema(), null, "Schema should be null after invalidation");

            // Format again - should recompute (and re-extract schema)
            const formatted = schemaManager.getFormattedSchema();
            assert.ok(formatted.length > 0, "Should produce formatted schema after invalidation");
        });
    });

    describe("getSchema()", () => {
        it("returns cached schema if available", () => {
            // First call to extract
            schemaManager.extract();

            // getSchema should return cached version
            const schema = schemaManager.getSchema();

            assert.ok(schema !== null, "Should return cached schema");
            assert.ok(schema.nodeProperties.length > 0);
        });

        it("returns null if not yet extracted", () => {
            // Don't extract first
            const schema = schemaManager.getSchema();

            assert.strictEqual(schema, null, "Should return null when cache is empty");
        });
    });

    describe("empty graph handling", () => {
        it("handles empty graphs gracefully", () => {
            const emptyGraph = createSchemaTestGraph({empty: true});
            const emptyManager = new SchemaManager(emptyGraph);

            const schema = emptyManager.extract();

            assert.strictEqual(schema.nodeCount, 0);
            assert.strictEqual(schema.edgeCount, 0);
            assert.deepStrictEqual(schema.nodeProperties, []);
            assert.deepStrictEqual(schema.edgeProperties, []);
        });

        it("formats empty schema without error", () => {
            const emptyGraph = createSchemaTestGraph({empty: true});
            const emptyManager = new SchemaManager(emptyGraph);

            const formatted = emptyManager.getFormattedSchema();

            assert.ok(typeof formatted === "string", "Should return a string");
            assert.ok(formatted.length > 0, "Should return non-empty string");
        });
    });

    describe("options pass-through", () => {
        it("passes options to SchemaExtractor", () => {
            const graphWithManyNodes = createSchemaTestGraph({nodeCount: 100});
            const limitedManager = new SchemaManager(graphWithManyNodes, {maxSampleSize: 10});

            const schema = limitedManager.extract();

            // Should still get valid schema with limited sampling
            assert.ok(schema.nodeProperties.length > 0, "Should extract properties from sample");
            assert.strictEqual(schema.nodeCount, 100, "Should report actual count");
        });
    });
});
