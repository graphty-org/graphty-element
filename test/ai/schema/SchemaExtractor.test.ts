/**
 * SchemaExtractor Tests - Tests for graph schema extraction.
 * @module test/ai/schema/SchemaExtractor.test
 */

import {assert, beforeEach, describe, it} from "vitest";

import {SchemaExtractor} from "../../../src/ai/schema/SchemaExtractor";
import type {Graph} from "../../../src/Graph";
import {createSchemaTestGraph} from "../../helpers/schema-test-graph";

describe("SchemaExtractor", () => {
    let graph: Graph;
    let extractor: SchemaExtractor;

    beforeEach(() => {
        graph = createSchemaTestGraph();
        extractor = new SchemaExtractor(graph);
    });

    describe("basic extraction", () => {
        it("extracts string properties from node data", () => {
            const schema = extractor.extract();

            const typeProperty = schema.nodeProperties.find((p) => p.name === "type");
            assert.ok(typeProperty, "Should find 'type' property");
            assert.strictEqual(typeProperty.type, "string");
            assert.strictEqual(typeProperty.nullable, false);
        });

        it("extracts number properties with min/max range", () => {
            const schema = extractor.extract();

            const ageProperty = schema.nodeProperties.find((p) => p.name === "age");
            assert.ok(ageProperty, "Should find 'age' property");
            // schema-infer distinguishes integers from floats
            assert.ok(
                ageProperty.type === "number" || ageProperty.type === "integer",
                `Expected 'number' or 'integer', got '${ageProperty.type}'`,
            );
            assert.ok(ageProperty.range, "Number property should have range");
            assert.ok(typeof ageProperty.range.min === "number");
            assert.ok(typeof ageProperty.range.max === "number");
            assert.ok(ageProperty.range.min <= ageProperty.range.max);
        });

        it("extracts boolean properties", () => {
            const schema = extractor.extract();

            const activeProperty = schema.nodeProperties.find((p) => p.name === "active");
            assert.ok(activeProperty, "Should find 'active' property");
            assert.strictEqual(activeProperty.type, "boolean");
        });

        it("extracts array properties and infers item type", () => {
            const schema = extractor.extract();

            const tagsProperty = schema.nodeProperties.find((p) => p.name === "tags");
            assert.ok(tagsProperty, "Should find 'tags' property");
            assert.strictEqual(tagsProperty.type, "array");
            assert.strictEqual(tagsProperty.itemType, "string");
        });
    });

    describe("type inference", () => {
        it("handles mixed types for same property", () => {
            // Create graph with mixed types for a property
            const mixedGraph = createSchemaTestGraph({mixedTypes: true});
            const mixedExtractor = new SchemaExtractor(mixedGraph);
            const schema = mixedExtractor.extract();

            const mixedProperty = schema.nodeProperties.find((p) => p.name === "value");
            assert.ok(mixedProperty, "Should find 'value' property");
            assert.strictEqual(mixedProperty.type, "mixed");
        });

        it("identifies enum-like strings (<=10 unique values)", () => {
            // Need enough samples to trigger enum detection (default requires 25)
            const enumGraph = createSchemaTestGraph({nodeCount: 30});
            // Use lower threshold for test
            const enumExtractor = new SchemaExtractor(enumGraph, {enumMinSampleSize: 5});
            const schema = enumExtractor.extract();

            // The 'type' property should have enumValues since there are limited unique values
            const typeProperty = schema.nodeProperties.find((p) => p.name === "type");
            assert.ok(typeProperty, "Should find 'type' property");
            assert.ok(typeProperty.enumValues, "String property with few unique values should have enumValues");
            assert.ok(typeProperty.enumValues.length <= 10);
        });

        it("does not set enumValues for strings with >10 unique values", () => {
            // Create graph with many unique string values
            const manyValuesGraph = createSchemaTestGraph({manyUniqueStrings: true});
            const manyExtractor = new SchemaExtractor(manyValuesGraph);
            const schema = manyExtractor.extract();

            const nameProperty = schema.nodeProperties.find((p) => p.name === "uniqueName");
            assert.ok(nameProperty, "Should find 'uniqueName' property");
            assert.strictEqual(nameProperty.type, "string");
            assert.strictEqual(nameProperty.enumValues, undefined, "Should not have enumValues for high cardinality strings");
        });
    });

    describe("nested properties", () => {
        it("handles nested properties with dot notation", () => {
            const schema = extractor.extract();

            // Find a nested property like "metadata.createdBy"
            const nestedProperty = schema.nodeProperties.find((p) => p.name === "metadata.createdBy");
            assert.ok(nestedProperty, "Should find nested 'metadata.createdBy' property");
            assert.strictEqual(nestedProperty.type, "string");
        });
    });

    describe("edge cases", () => {
        it("handles empty graphs gracefully", () => {
            const emptyGraph = createSchemaTestGraph({empty: true});
            const emptyExtractor = new SchemaExtractor(emptyGraph);
            const schema = emptyExtractor.extract();

            assert.strictEqual(schema.nodeCount, 0);
            assert.strictEqual(schema.edgeCount, 0);
            assert.deepStrictEqual(schema.nodeProperties, []);
            assert.deepStrictEqual(schema.edgeProperties, []);
        });

        it("handles null/undefined values", () => {
            const nullGraph = createSchemaTestGraph({nullValues: true});
            const nullExtractor = new SchemaExtractor(nullGraph);
            const schema = nullExtractor.extract();

            // Find property that has null values
            const nullableProperty = schema.nodeProperties.find((p) => p.name === "optional");
            assert.ok(nullableProperty, "Should find 'optional' property");
            assert.strictEqual(nullableProperty.nullable, true);
        });
    });

    describe("counts", () => {
        it("returns correct node and edge counts", () => {
            const schema = extractor.extract();

            assert.ok(schema.nodeCount > 0, "Should have nodes");
            assert.ok(schema.edgeCount >= 0, "Should have non-negative edge count");
            assert.strictEqual(typeof schema.nodeCount, "number");
            assert.strictEqual(typeof schema.edgeCount, "number");
        });
    });

    describe("edge properties", () => {
        it("extracts properties from edge data", () => {
            const schema = extractor.extract();

            // Edges should have weight property
            const weightProperty = schema.edgeProperties.find((p) => p.name === "weight");
            assert.ok(weightProperty, "Should find 'weight' property on edges");
            assert.strictEqual(weightProperty.type, "number");
        });

        it("extracts string properties from edges", () => {
            const schema = extractor.extract();

            const relationProperty = schema.edgeProperties.find((p) => p.name === "relation");
            assert.ok(relationProperty, "Should find 'relation' property on edges");
            assert.strictEqual(relationProperty.type, "string");
        });
    });

    describe("SchemaSummary structure", () => {
        it("returns properly structured SchemaSummary", () => {
            const schema = extractor.extract();

            // Verify structure
            assert.ok(Array.isArray(schema.nodeProperties), "nodeProperties should be an array");
            assert.ok(Array.isArray(schema.edgeProperties), "edgeProperties should be an array");
            assert.strictEqual(typeof schema.nodeCount, "number", "nodeCount should be a number");
            assert.strictEqual(typeof schema.edgeCount, "number", "edgeCount should be a number");
        });

        it("returns PropertySummary with required fields", () => {
            const schema = extractor.extract();

            const validTypes = ["string", "number", "integer", "boolean", "array", "object", "mixed", "unknown"];

            for (const prop of schema.nodeProperties) {
                assert.ok(typeof prop.name === "string", "PropertySummary.name should be a string");
                assert.ok(
                    validTypes.includes(prop.type),
                    `PropertySummary.type should be valid, got: ${prop.type}`,
                );
                assert.strictEqual(typeof prop.nullable, "boolean", "PropertySummary.nullable should be a boolean");
            }
        });
    });

    describe("performance constraints", () => {
        it("limits analysis to configurable sample size", () => {
            // Create a large graph
            const largeGraph = createSchemaTestGraph({nodeCount: 100, edgeCount: 200});
            const limitedExtractor = new SchemaExtractor(largeGraph, {maxSampleSize: 50});
            const schema = limitedExtractor.extract();

            // Schema should still be valid even with limited sampling
            assert.ok(schema.nodeProperties.length > 0, "Should extract node properties from sample");
            assert.strictEqual(schema.nodeCount, 100, "Should report actual node count");
            assert.strictEqual(schema.edgeCount, 200, "Should report actual edge count");
        });
    });
});
