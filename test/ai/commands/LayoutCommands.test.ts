/**
 * LayoutCommands Tests - Tests for layout-related commands.
 * @module test/ai/commands/LayoutCommands.test
 */

import {assert, beforeEach, describe, it} from "vitest";
import {z} from "zod";

import {setDimension, setLayout} from "../../../src/ai/commands/LayoutCommands";
import type {CommandContext} from "../../../src/ai/commands/types";
import type {Graph} from "../../../src/Graph";
import {createMockContext, createTestGraph} from "../../helpers/test-graph";

describe("LayoutCommands", () => {
    let graph: Graph;
    let context: CommandContext;

    beforeEach(() => {
        graph = createTestGraph();
        context = createMockContext(graph);
    });

    describe("setLayout", () => {
        it("switches to circular layout", async() => {
            const result = await setLayout.execute(graph, {type: "circular"}, context);
            assert.strictEqual(result.success, true);
            assert.ok(result.message.toLowerCase().includes("circular"));
        });

        it("switches to force-directed layout (ngraph)", async() => {
            const result = await setLayout.execute(graph, {type: "ngraph"}, context);
            assert.strictEqual(result.success, true);
            assert.ok(result.message.toLowerCase().includes("ngraph") || result.message.toLowerCase().includes("force"));
        });

        it("switches to random layout", async() => {
            const result = await setLayout.execute(graph, {type: "random"}, context);
            assert.strictEqual(result.success, true);
        });

        it("rejects invalid layout type", async() => {
            const result = await setLayout.execute(graph, {type: "nonexistent_layout_xyz"}, context);
            assert.strictEqual(result.success, false);
            assert.ok(result.message.toLowerCase().includes("invalid") ||
                      result.message.toLowerCase().includes("unknown") ||
                      result.message.toLowerCase().includes("not found") ||
                      result.message.toLowerCase().includes("error"));
        });

        it("accepts layout options", async() => {
            const result = await setLayout.execute(
                graph,
                {type: "circular", options: {radius: 100}},
                context,
            );
            assert.strictEqual(result.success, true);
        });
    });

    describe("setDimension", () => {
        it("switches to 2D", async() => {
            const result = await setDimension.execute(graph, {dimension: "2d"}, context);
            assert.strictEqual(result.success, true);
            assert.ok(result.message.toLowerCase().includes("2d"));
        });

        it("switches to 3D", async() => {
            const result = await setDimension.execute(graph, {dimension: "3d"}, context);
            assert.strictEqual(result.success, true);
            assert.ok(result.message.toLowerCase().includes("3d"));
        });

        it("handles dimension as number (2)", async() => {
            const result = await setDimension.execute(graph, {dimension: 2}, context);
            assert.strictEqual(result.success, true);
        });

        it("handles dimension as number (3)", async() => {
            const result = await setDimension.execute(graph, {dimension: 3}, context);
            assert.strictEqual(result.success, true);
        });
    });

    describe("setLayout metadata", () => {
        it("has correct name", () => {
            assert.strictEqual(setLayout.name, "setLayout");
        });

        it("has description", () => {
            assert.ok(setLayout.description.length > 0);
        });

        it("has parameters schema", () => {
            assert.ok(setLayout.parameters);
        });

        it("has examples", () => {
            assert.ok(Array.isArray(setLayout.examples));
        });
    });

    describe("setDimension metadata", () => {
        it("has correct name", () => {
            assert.strictEqual(setDimension.name, "setDimension");
        });

        it("has description", () => {
            assert.ok(setDimension.description.length > 0);
        });

        it("has parameters schema", () => {
            assert.ok(setDimension.parameters);
        });
    });

    /**
     * Regression test for Issue #3: Google API requires string enum values
     * Bug: The DimensionSchema used z.union([z.enum(["2d", "3d"]), z.literal(2), z.literal(3)])
     * which produced numeric enum values in the JSON Schema. Google's API only accepts
     * string values in enums, causing "Invalid value TYPE_STRING" errors.
     */
    describe("regression: schema enum values are strings for Google compatibility (Issue #3)", () => {
        it("setDimension dimension parameter should be string enum (not union with numbers)", () => {
            // Get the parameters schema and extract the dimension field
            const paramsSchema = setDimension.parameters as z.ZodObject<{dimension: z.ZodType}>;
            assert.ok(paramsSchema instanceof z.ZodObject, "parameters should be a ZodObject");

            // Access the shape to get the dimension schema
            const dimensionSchema = paramsSchema.shape.dimension;
            assert.ok(dimensionSchema, "dimension property should exist in schema");

            // The dimension schema should be a ZodEnum (string enum) not a ZodUnion
            // This ensures Google API compatibility (no numeric enum values)
            const def = dimensionSchema._def as {typeName: string};
            const {typeName} = def;

            // ZodEnum is good (strings only), ZodUnion might contain literals with numbers
            assert.ok(
                typeName === "ZodEnum",
                `dimension schema should be ZodEnum (string-only enum) for Google API compatibility, got: ${typeName}. ` +
                "If this is ZodUnion, it may contain numeric literals which Google's API rejects.",
            );
        });

        it("setDimension accepts both string forms ('2d' and '3d')", () => {
            // Verify the schema accepts the string forms
            const paramsSchema = setDimension.parameters;
            const result2d = paramsSchema.safeParse({dimension: "2d"});
            const result3d = paramsSchema.safeParse({dimension: "3d"});

            assert.strictEqual(result2d.success, true, "Should accept '2d' string");
            assert.strictEqual(result3d.success, true, "Should accept '3d' string");
        });

        it("setDimension schema does not have union type (which could contain numbers)", () => {
            // Access the parameters schema's shape
            const paramsSchema = setDimension.parameters as z.ZodObject<{dimension: z.ZodType}>;
            const dimensionSchema = paramsSchema.shape.dimension;

            // Check that it's not a union type (which was the source of the bug)
            const def = dimensionSchema._def as {typeName: string};
            const {typeName} = def;
            assert.notStrictEqual(
                typeName,
                "ZodUnion",
                "dimension schema should NOT be ZodUnion - unions with z.literal(2) and z.literal(3) " +
                "produce numeric enum values that Google's API rejects",
            );
        });
    });
});
