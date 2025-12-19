/**
 * SystemPromptBuilder Schema Integration Tests.
 * @module test/ai/prompt/SystemPromptBuilder.schema.test
 */

import {assert, beforeEach, describe, it} from "vitest";

import {SystemPromptBuilder} from "../../../src/ai/prompt/SystemPromptBuilder";
import type {SchemaSummary} from "../../../src/ai/schema/types";
import type {Graph} from "../../../src/Graph";

/**
 * Create a minimal mock graph for testing.
 */
function createMockGraph(): Graph {
    return {
        getNodeCount: () => 10,
        getEdgeCount: () => 5,
        is2D: () => false,
        getLayoutManager: () => ({
            layoutEngine: {type: "ngraph"},
        }),
    } as unknown as Graph;
}

/**
 * Create a test schema summary.
 */
function createTestSchema(overrides: Partial<SchemaSummary> = {}): SchemaSummary {
    return {
        nodeProperties: [
            {name: "type", type: "string", nullable: false, enumValues: ["server", "client"]},
            {name: "age", type: "integer", nullable: false, range: {min: 1, max: 100}},
        ],
        edgeProperties: [
            {name: "weight", type: "number", nullable: false},
            {name: "relation", type: "string", nullable: false},
        ],
        nodeCount: 10,
        edgeCount: 5,
        ... overrides,
    };
}

describe("SystemPromptBuilder with schema", () => {
    let builder: SystemPromptBuilder;
    let mockGraph: Graph;

    beforeEach(() => {
        builder = new SystemPromptBuilder();
        mockGraph = createMockGraph();
        builder.setGraph(mockGraph);
    });

    describe("setSchema", () => {
        it("includes schema section when schema is set", () => {
            const schema = createTestSchema();
            builder.setSchema(schema);

            const prompt = builder.build();

            assert.ok(prompt.includes("Schema") || prompt.includes("schema"), "Should include schema section");
            assert.ok(prompt.includes("type"), "Should include property name from schema");
            assert.ok(prompt.includes("string"), "Should include property type from schema");
        });

        it("excludes schema section when schema is not set", () => {
            const prompt = builder.build();

            // Should not have schema-specific content like property definitions
            // It should still have basic graph state info though
            assert.ok(!prompt.includes("Node Properties:") && !prompt.includes("nodeProperties"),
                "Should not include node properties header");
        });

        it("formats schema in markdown", () => {
            const schema = createTestSchema();
            builder.setSchema(schema);

            const prompt = builder.build();

            // Should use markdown formatting
            assert.ok(prompt.includes("#"), "Should use markdown headers");
        });

        it("updates schema section when setSchema called again", () => {
            // Set initial schema
            const schema1 = createTestSchema({
                nodeProperties: [{name: "firstProp", type: "string", nullable: false}],
            });
            builder.setSchema(schema1);

            const prompt1 = builder.build();
            assert.ok(prompt1.includes("firstProp"), "Should include first schema property");

            // Update schema
            const schema2 = createTestSchema({
                nodeProperties: [{name: "secondProp", type: "number", nullable: false}],
            });
            builder.setSchema(schema2);

            const prompt2 = builder.build();
            assert.ok(prompt2.includes("secondProp"), "Should include second schema property");
            assert.ok(!prompt2.includes("firstProp"), "Should not include first schema property after update");
        });
    });

    describe("schema content", () => {
        it("includes node properties in schema section", () => {
            const schema = createTestSchema();
            builder.setSchema(schema);

            const prompt = builder.build();

            assert.ok(prompt.includes("type"), "Should include 'type' property");
            assert.ok(prompt.includes("age"), "Should include 'age' property");
        });

        it("includes edge properties in schema section", () => {
            const schema = createTestSchema();
            builder.setSchema(schema);

            const prompt = builder.build();

            assert.ok(prompt.includes("weight"), "Should include 'weight' edge property");
            assert.ok(prompt.includes("relation"), "Should include 'relation' edge property");
        });

        it("includes enum values in schema section", () => {
            const schema = createTestSchema();
            builder.setSchema(schema);

            const prompt = builder.build();

            assert.ok(prompt.includes("server"), "Should include enum value 'server'");
            assert.ok(prompt.includes("client"), "Should include enum value 'client'");
        });

        it("includes range information in schema section", () => {
            const schema = createTestSchema();
            builder.setSchema(schema);

            const prompt = builder.build();

            // Should include range info for 'age' property
            assert.ok(
                prompt.includes("1") && prompt.includes("100"),
                "Should include range values",
            );
        });
    });

    describe("integration with other sections", () => {
        it("schema section appears after stats section", () => {
            const schema = createTestSchema();
            builder.setSchema(schema);

            const prompt = builder.build({includeStats: true});

            // Find positions of sections
            const statsPos = prompt.indexOf("Current Graph State");
            const schemaPos = prompt.includes("Data Schema") ?
                prompt.indexOf("Data Schema") : prompt.indexOf("Schema");

            // Schema should come after stats (if both exist)
            if (statsPos !== -1 && schemaPos !== -1) {
                assert.ok(schemaPos > statsPos, "Schema section should appear after stats section");
            }
        });

        it("schema section is included with default build options", () => {
            const schema = createTestSchema();
            builder.setSchema(schema);

            const prompt = builder.build();

            assert.ok(prompt.includes("type"), "Should include schema properties with default options");
        });

        it("schema section respects includeSchema option when added", () => {
            const schema = createTestSchema();
            builder.setSchema(schema);

            // Build without schema even when set
            const prompt = builder.build({includeSchema: false});

            // Should not include schema-specific headers
            assert.ok(
                !prompt.includes("Data Schema") && !prompt.includes("Node Properties:"),
                "Should exclude schema when includeSchema is false",
            );
        });
    });

    describe("empty schema handling", () => {
        it("handles empty schema gracefully", () => {
            const emptySchema = createTestSchema({
                nodeProperties: [],
                edgeProperties: [],
                nodeCount: 0,
                edgeCount: 0,
            });
            builder.setSchema(emptySchema);

            const prompt = builder.build();

            // Should not throw and should produce valid output
            assert.ok(typeof prompt === "string", "Should return a string");
            assert.ok(prompt.length > 0, "Should produce non-empty prompt");
        });
    });

    describe("clearSchema", () => {
        it("clears schema when clearSchema is called", () => {
            const schema = createTestSchema();
            builder.setSchema(schema);

            let prompt = builder.build();
            assert.ok(prompt.includes("type"), "Should include schema before clear");

            builder.clearSchema();

            prompt = builder.build();
            // After clearing, schema-specific content should be gone
            assert.ok(
                !prompt.includes("Data Schema") && !prompt.includes("Node Properties:"),
                "Should not include schema after clearSchema",
            );
        });
    });
});
