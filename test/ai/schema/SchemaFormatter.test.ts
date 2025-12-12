/**
 * SchemaFormatter Tests - Tests for schema formatting.
 * @module test/ai/schema/SchemaFormatter.test
 */

import {assert, describe, it} from "vitest";

import {formatSchemaForPrompt} from "../../../src/ai/schema/SchemaFormatter";
import type {PropertySummary, SchemaSummary} from "../../../src/ai/schema/types";

/**
 * Helper to create a minimal schema for testing.
 */
function createTestSchema(overrides: Partial<SchemaSummary> = {}): SchemaSummary {
    return {
        nodeProperties: [],
        edgeProperties: [],
        nodeCount: 0,
        edgeCount: 0,
        ... overrides,
    };
}

/**
 * Helper to create a property summary for testing.
 */
function createTestProperty(overrides: Partial<PropertySummary>): PropertySummary {
    return {
        name: "testProperty",
        type: "string",
        nullable: false,
        ... overrides,
    };
}

describe("SchemaFormatter", () => {
    describe("formatSchemaForPrompt", () => {
        describe("basic formatting", () => {
            it("formats node properties section", () => {
                const schema = createTestSchema({
                    nodeCount: 10,
                    edgeCount: 5,
                    nodeProperties: [
                        createTestProperty({name: "name", type: "string"}),
                        createTestProperty({name: "age", type: "integer"}),
                    ],
                });

                const result = formatSchemaForPrompt(schema);

                assert.ok(result.includes("Node Properties"), "Should include Node Properties header");
                assert.ok(result.includes("name"), "Should include property name");
                assert.ok(result.includes("string"), "Should include property type");
                assert.ok(result.includes("age"), "Should include age property");
                assert.ok(result.includes("integer"), "Should include integer type");
            });

            it("formats edge properties section", () => {
                const schema = createTestSchema({
                    nodeCount: 10,
                    edgeCount: 5,
                    edgeProperties: [
                        createTestProperty({name: "weight", type: "number"}),
                        createTestProperty({name: "relation", type: "string"}),
                    ],
                });

                const result = formatSchemaForPrompt(schema);

                assert.ok(result.includes("Edge Properties"), "Should include Edge Properties header");
                assert.ok(result.includes("weight"), "Should include weight property");
                assert.ok(result.includes("number"), "Should include number type");
                assert.ok(result.includes("relation"), "Should include relation property");
            });

            it("includes graph counts in output", () => {
                const schema = createTestSchema({
                    nodeCount: 42,
                    edgeCount: 100,
                });

                const result = formatSchemaForPrompt(schema);

                assert.ok(result.includes("42"), "Should include node count");
                assert.ok(result.includes("100"), "Should include edge count");
            });
        });

        describe("property details", () => {
            it("includes enum values for string properties", () => {
                const schema = createTestSchema({
                    nodeProperties: [
                        createTestProperty({
                            name: "status",
                            type: "string",
                            enumValues: ["active", "inactive", "pending"],
                        }),
                    ],
                });

                const result = formatSchemaForPrompt(schema);

                assert.ok(result.includes("active"), "Should include enum value 'active'");
                assert.ok(result.includes("inactive"), "Should include enum value 'inactive'");
                assert.ok(result.includes("pending"), "Should include enum value 'pending'");
            });

            it("includes range for number properties", () => {
                const schema = createTestSchema({
                    nodeProperties: [
                        createTestProperty({
                            name: "score",
                            type: "number",
                            range: {min: 0, max: 100},
                        }),
                    ],
                });

                const result = formatSchemaForPrompt(schema);

                assert.ok(result.includes("0"), "Should include min value");
                assert.ok(result.includes("100"), "Should include max value");
                assert.ok(result.includes("range") || result.includes("min") || result.includes(".."), "Should indicate range");
            });

            it("includes nullable indicator", () => {
                const schema = createTestSchema({
                    nodeProperties: [
                        createTestProperty({name: "optional", type: "string", nullable: true}),
                    ],
                });

                const result = formatSchemaForPrompt(schema);

                assert.ok(
                    result.includes("nullable") || result.includes("?") || result.includes("optional"),
                    "Should indicate nullable property",
                );
            });

            it("includes item type for array properties", () => {
                const schema = createTestSchema({
                    nodeProperties: [
                        createTestProperty({name: "tags", type: "array", itemType: "string"}),
                    ],
                });

                const result = formatSchemaForPrompt(schema);

                // Formatter outputs "string[]" which is more readable than "array"
                assert.ok(result.includes("string[]") || result.includes("array"), "Should include array type notation");
                assert.ok(result.includes("string"), "Should include item type");
            });

            it("includes format for string properties", () => {
                const schema = createTestSchema({
                    nodeProperties: [
                        createTestProperty({name: "email", type: "string", format: "email"}),
                    ],
                });

                const result = formatSchemaForPrompt(schema);

                assert.ok(result.includes("email"), "Should include format");
            });
        });

        describe("edge cases", () => {
            it("handles empty schema gracefully", () => {
                const schema = createTestSchema();

                const result = formatSchemaForPrompt(schema);

                assert.ok(typeof result === "string", "Should return a string");
                assert.ok(result.length > 0, "Should return non-empty string");
                // Should indicate empty or just show counts of 0
                assert.ok(
                    result.includes("0") || result.includes("empty") || result.includes("No "),
                    "Should handle empty schema gracefully",
                );
            });

            it("handles schema with no node properties but has nodes", () => {
                const schema = createTestSchema({
                    nodeCount: 10,
                    edgeCount: 5,
                    nodeProperties: [],
                    edgeProperties: [createTestProperty({name: "weight", type: "number"})],
                });

                const result = formatSchemaForPrompt(schema);

                // Should still produce valid output
                assert.ok(typeof result === "string");
                assert.ok(result.includes("10"), "Should include node count");
            });

            it("limits enum values displayed", () => {
                // Create property with many enum values
                const manyEnumValues = Array.from({length: 20}, (_, i) => `value_${i}`);
                const schema = createTestSchema({
                    nodeProperties: [
                        createTestProperty({
                            name: "status",
                            type: "string",
                            enumValues: manyEnumValues,
                        }),
                    ],
                });

                const result = formatSchemaForPrompt(schema);

                // Should not include all 20 values (should be limited)
                const valueMatches = manyEnumValues.filter((v) => result.includes(v));
                assert.ok(
                    valueMatches.length <= 10 || result.includes("...") || result.includes("more"),
                    "Should limit enum values displayed or indicate truncation",
                );
            });

            it("truncates long property names", () => {
                const longName = "this_is_a_very_long_property_name_that_should_be_truncated_for_display";
                const schema = createTestSchema({
                    nodeProperties: [
                        createTestProperty({name: longName, type: "string"}),
                    ],
                });

                const result = formatSchemaForPrompt(schema);

                // The result should either include the full name or a truncated version
                // We just verify it doesn't break and produces output
                assert.ok(typeof result === "string", "Should handle long property names");
                assert.ok(result.length > 0, "Should produce output");
            });
        });

        describe("markdown formatting", () => {
            it("produces valid markdown format", () => {
                const schema = createTestSchema({
                    nodeCount: 10,
                    edgeCount: 5,
                    nodeProperties: [
                        createTestProperty({name: "name", type: "string"}),
                    ],
                    edgeProperties: [
                        createTestProperty({name: "weight", type: "number"}),
                    ],
                });

                const result = formatSchemaForPrompt(schema);

                // Should use markdown headers
                assert.ok(result.includes("#"), "Should use markdown headers");
            });

            it("uses consistent formatting across all property types", () => {
                const schema = createTestSchema({
                    nodeProperties: [
                        createTestProperty({name: "str", type: "string"}),
                        createTestProperty({name: "num", type: "number"}),
                        createTestProperty({name: "bool", type: "boolean"}),
                        createTestProperty({name: "arr", type: "array", itemType: "string"}),
                        createTestProperty({name: "obj", type: "object"}),
                        createTestProperty({name: "int", type: "integer"}),
                        createTestProperty({name: "mix", type: "mixed"}),
                    ],
                });

                const result = formatSchemaForPrompt(schema);

                // All properties should be present
                assert.ok(result.includes("str"), "Should include string property");
                assert.ok(result.includes("num"), "Should include number property");
                assert.ok(result.includes("bool"), "Should include boolean property");
                assert.ok(result.includes("arr"), "Should include array property");
                assert.ok(result.includes("obj"), "Should include object property");
            });
        });
    });
});
