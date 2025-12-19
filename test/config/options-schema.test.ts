/**
 * @fileoverview Tests for the unified OptionsSchema system
 */

import {assert, describe, it} from "vitest";
import {z} from "zod/v4";

import {
    defineOptions,
    getDefaults,
    getOptionsFiltered,
    getOptionsGrouped,
    getOptionsMeta,
    hasOptions,
    parseOptions,
    safeParseOptions,
    toZodSchema,
} from "../../src/config/OptionsSchema";

describe("OptionsSchema", () => {
    // Sample schema for testing
    const sampleSchema = defineOptions({
        dampingFactor: {
            schema: z.number().min(0).max(1).default(0.85),
            meta: {
                label: "Damping Factor",
                description: "Probability of following a link",
                step: 0.05,
            },
        },
        maxIterations: {
            schema: z.number().int().min(1).max(1000).default(100),
            meta: {
                label: "Max Iterations",
                description: "Maximum iterations before stopping",
                advanced: true,
            },
        },
        tolerance: {
            schema: z.number().min(1e-10).max(0.1).default(1e-6),
            meta: {
                label: "Tolerance",
                description: "Convergence threshold",
                advanced: true,
                group: "convergence",
            },
        },
        enabled: {
            schema: z.boolean().default(true),
            meta: {
                label: "Enabled",
                description: "Whether the feature is enabled",
            },
        },
    });

    describe("defineOptions", () => {
        it("should return the schema unchanged", () => {
            // Verify the schema is a valid Zod schema by checking it can parse
            const result = sampleSchema.dampingFactor.schema.safeParse(0.5);
            assert.isTrue(result.success);
            assert.strictEqual(sampleSchema.dampingFactor.meta.label, "Damping Factor");
        });

        it("should preserve all metadata", () => {
            assert.strictEqual(sampleSchema.maxIterations.meta.advanced, true);
            assert.strictEqual(sampleSchema.tolerance.meta.group, "convergence");
            assert.strictEqual(sampleSchema.dampingFactor.meta.step, 0.05);
        });
    });

    describe("toZodSchema", () => {
        it("should create a valid Zod object schema", () => {
            const zodSchema = toZodSchema(sampleSchema);
            assert.isDefined(zodSchema);
            // Verify it's a valid object schema by parsing
            const result = zodSchema.safeParse({});
            assert.isTrue(result.success);
        });

        it("should include all fields from the options schema", () => {
            const zodSchema = toZodSchema(sampleSchema);
            const {shape} = zodSchema;
            assert.isDefined(shape.dampingFactor);
            assert.isDefined(shape.maxIterations);
            assert.isDefined(shape.tolerance);
            assert.isDefined(shape.enabled);
        });
    });

    describe("parseOptions", () => {
        it("should apply defaults when no options provided", () => {
            const options = parseOptions(sampleSchema, {});
            assert.strictEqual(options.dampingFactor, 0.85);
            assert.strictEqual(options.maxIterations, 100);
            assert.strictEqual(options.tolerance, 1e-6);
            assert.strictEqual(options.enabled, true);
        });

        it("should override defaults with provided values", () => {
            const options = parseOptions(sampleSchema, {
                dampingFactor: 0.9,
                maxIterations: 200,
            });
            assert.strictEqual(options.dampingFactor, 0.9);
            assert.strictEqual(options.maxIterations, 200);
            assert.strictEqual(options.tolerance, 1e-6); // default
        });

        it("should throw on invalid values", () => {
            assert.throws(() => {
                parseOptions(sampleSchema, {dampingFactor: 1.5}); // > max of 1
            });
        });

        it("should throw on invalid types", () => {
            assert.throws(() => {
                // @ts-expect-error - testing runtime validation
                parseOptions(sampleSchema, {dampingFactor: "not a number"});
            });
        });

        it("should validate integer constraint", () => {
            assert.throws(() => {
                parseOptions(sampleSchema, {maxIterations: 50.5}); // not an integer
            });
        });
    });

    describe("safeParseOptions", () => {
        it("should return success with valid options", () => {
            const result = safeParseOptions(sampleSchema, {dampingFactor: 0.9});
            assert.isTrue(result.success, "Expected parsing to succeed");
            assert.property(result, "data", "Expected result to have data property");
            // Type assertion needed because TypeScript doesn't narrow based on assert
            const successResult = result as {success: true, data: ReturnType<typeof parseOptions<typeof sampleSchema>>};
            assert.strictEqual(successResult.data.dampingFactor, 0.9);
        });

        it("should return error with invalid options", () => {
            const result = safeParseOptions(sampleSchema, {dampingFactor: 1.5});
            assert.isFalse(result.success, "Expected parsing to fail");
            assert.property(result, "error", "Expected result to have error property");
        });
    });

    describe("getDefaults", () => {
        it("should return all default values", () => {
            const defaults = getDefaults(sampleSchema);
            assert.strictEqual(defaults.dampingFactor, 0.85);
            assert.strictEqual(defaults.maxIterations, 100);
            assert.strictEqual(defaults.tolerance, 1e-6);
            assert.strictEqual(defaults.enabled, true);
        });
    });

    describe("hasOptions", () => {
        it("should return true for non-empty schema", () => {
            assert.isTrue(hasOptions(sampleSchema));
        });

        it("should return false for empty schema", () => {
            assert.isFalse(hasOptions({}));
        });
    });

    describe("getOptionsMeta", () => {
        it("should return metadata for all options", () => {
            const meta = getOptionsMeta(sampleSchema);
            assert.strictEqual(meta.size, 4);
            assert.strictEqual(meta.get("dampingFactor")?.label, "Damping Factor");
            assert.strictEqual(meta.get("maxIterations")?.advanced, true);
        });
    });

    describe("getOptionsFiltered", () => {
        it("should return only basic options when advanced=false", () => {
            const basic = getOptionsFiltered(sampleSchema, false);
            assert.isDefined(basic.dampingFactor);
            assert.isDefined(basic.enabled);
            assert.isUndefined(basic.maxIterations);
            assert.isUndefined(basic.tolerance);
        });

        it("should return only advanced options when advanced=true", () => {
            const advanced = getOptionsFiltered(sampleSchema, true);
            assert.isUndefined(advanced.dampingFactor);
            assert.isUndefined(advanced.enabled);
            assert.isDefined(advanced.maxIterations);
            assert.isDefined(advanced.tolerance);
        });
    });

    describe("getOptionsGrouped", () => {
        it("should group options by group property", () => {
            const groups = getOptionsGrouped(sampleSchema);

            // Ungrouped options (empty string key)
            assert.isTrue(groups.has(""));
            const ungrouped = groups.get("") ?? {};
            assert.isTrue("dampingFactor" in ungrouped);
            assert.isTrue("maxIterations" in ungrouped);
            assert.isTrue("enabled" in ungrouped);

            // Convergence group
            assert.isTrue(groups.has("convergence"));
            const convergence = groups.get("convergence") ?? {};
            assert.isTrue("tolerance" in convergence);
        });
    });

    describe("type inference", () => {
        it("should infer correct types", () => {
            const options = parseOptions(sampleSchema, {});

            // These should compile without errors - type checking
            const _dampingFactor: number = options.dampingFactor;
            const _maxIterations: number = options.maxIterations;
            const _tolerance: number = options.tolerance;
            const _enabled: boolean = options.enabled;

            // Use variables to avoid unused warnings
            assert.isNumber(_dampingFactor);
            assert.isNumber(_maxIterations);
            assert.isNumber(_tolerance);
            assert.isBoolean(_enabled);
        });
    });

    describe("complex types", () => {
        const complexSchema = defineOptions({
            mode: {
                schema: z.enum(["fast", "accurate", "balanced"]).default("balanced"),
                meta: {
                    label: "Mode",
                    description: "Algorithm mode",
                },
            },
            weights: {
                schema: z.array(z.number()).default([1, 1, 1]),
                meta: {
                    label: "Weights",
                    description: "Weight values",
                },
            },
            config: {
                schema: z.object({
                    nested: z.string().default("value"),
                }).default({nested: "value"}),
                meta: {
                    label: "Config",
                    description: "Nested configuration",
                },
            },
        });

        it("should handle enum types", () => {
            const options = parseOptions(complexSchema, {mode: "fast"});
            assert.strictEqual(options.mode, "fast");
        });

        it("should validate enum values", () => {
            assert.throws(() => {
                // @ts-expect-error - testing runtime validation
                parseOptions(complexSchema, {mode: "invalid"});
            });
        });

        it("should handle array types", () => {
            const options = parseOptions(complexSchema, {weights: [2, 3, 4]});
            assert.deepEqual(options.weights, [2, 3, 4]);
        });

        it("should handle nested object types", () => {
            const options = parseOptions(complexSchema, {
                config: {nested: "custom"},
            });
            assert.strictEqual(options.config.nested, "custom");
        });
    });

    describe("nullable and optional", () => {
        const nullableSchema = defineOptions({
            source: {
                schema: z.string().nullable().default(null),
                meta: {
                    label: "Source",
                    description: "Source node (null for auto)",
                },
            },
            target: {
                schema: z.string().optional(),
                meta: {
                    label: "Target",
                    description: "Target node (optional)",
                },
            },
        });

        it("should handle nullable defaults", () => {
            const options = parseOptions(nullableSchema, {});
            assert.isNull(options.source);
        });

        it("should allow null values", () => {
            const options = parseOptions(nullableSchema, {source: null});
            assert.isNull(options.source);
        });

        it("should handle optional fields", () => {
            const options = parseOptions(nullableSchema, {});
            assert.isUndefined(options.target);
        });
    });
});
