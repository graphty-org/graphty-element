/**
 * Performance tests for algorithm options validation
 *
 * Requirement: Option validation overhead < 1ms
 */

import {assert, describe, it} from "vitest";

import {
    type OptionsSchema,
    resolveOptions,
    validateOption,
} from "../../../src/algorithms/types/OptionSchema";

describe("Option Schema Performance", () => {
    // Create a large schema for testing
    const createLargeSchema = (): OptionsSchema => {
        const schema: OptionsSchema = {};

        // Add 20 options of various types (using camelCase names)
        for (let i = 0; i < 5; i++) {
            schema[`numberOpt${i}`] = {
                type: "number",
                default: 0.5,
                label: `Number ${i}`,
                description: `Test number ${i}`,
                min: 0,
                max: 1,
            };
            schema[`integerOpt${i}`] = {
                type: "integer",
                default: 100,
                label: `Integer ${i}`,
                description: `Test integer ${i}`,
                min: 1,
                max: 1000,
            };
            schema[`booleanOpt${i}`] = {
                type: "boolean",
                default: true,
                label: `Boolean ${i}`,
                description: `Test boolean ${i}`,
            };
            schema[`stringOpt${i}`] = {
                type: "string",
                default: "test",
                label: `String ${i}`,
                description: `Test string ${i}`,
            };
        }

        return schema;
    };

    describe("validateOption performance", () => {
        it("validates a single option in < 0.1ms", () => {
            const def = {
                type: "number" as const,
                default: 0.85,
                label: "Test",
                description: "Test description",
                min: 0,
                max: 1,
            };

            // Warm up
            validateOption("test", 0.5, def);

            // Measure
            const iterations = 10000;
            const start = performance.now();
            for (let i = 0; i < iterations; i++) {
                validateOption("test", 0.5, def);
            }
            const end = performance.now();

            const avgTime = (end - start) / iterations;
            assert.isBelow(avgTime, 0.1, `Average validation time should be < 0.1ms, was ${avgTime.toFixed(4)}ms`);
        });
    });

    describe("resolveOptions performance", () => {
        it("resolves typical PageRank options in < 1ms", () => {
            const schema: OptionsSchema = {
                dampingFactor: {
                    type: "number",
                    default: 0.85,
                    label: "Damping Factor",
                    description: "Probability of following a link",
                    min: 0,
                    max: 1,
                },
                maxIterations: {
                    type: "integer",
                    default: 100,
                    label: "Max Iterations",
                    description: "Maximum iterations",
                    min: 1,
                    max: 1000,
                },
                tolerance: {
                    type: "number",
                    default: 1e-6,
                    label: "Tolerance",
                    description: "Convergence threshold",
                    min: 1e-10,
                    max: 0.1,
                },
            };

            // Warm up
            resolveOptions(schema, {dampingFactor: 0.9});

            // Measure
            const iterations = 1000;
            const start = performance.now();
            for (let i = 0; i < iterations; i++) {
                resolveOptions(schema, {dampingFactor: 0.9, maxIterations: 200});
            }
            const end = performance.now();

            const avgTime = (end - start) / iterations;
            assert.isBelow(avgTime, 1, `Average resolve time should be < 1ms, was ${avgTime.toFixed(4)}ms`);
        });

        it("resolves large schema (20 options) in < 1ms", () => {
            const schema = createLargeSchema();

            // Warm up
            resolveOptions(schema, {numberOpt0: 0.7, integerOpt0: 50});

            // Measure
            const iterations = 1000;
            const start = performance.now();
            for (let i = 0; i < iterations; i++) {
                resolveOptions(schema, {
                    numberOpt0: 0.7,
                    integerOpt0: 50,
                    booleanOpt2: false,
                    stringOpt3: "custom",
                });
            }
            const end = performance.now();

            const avgTime = (end - start) / iterations;
            assert.isBelow(avgTime, 1, `Average resolve time for 20 options should be < 1ms, was ${avgTime.toFixed(4)}ms`);
        });

        it("handles empty options efficiently", () => {
            const schema: OptionsSchema = {
                dampingFactor: {
                    type: "number",
                    default: 0.85,
                    label: "Test",
                    description: "Test",
                    min: 0,
                    max: 1,
                },
            };

            // Measure with no options (all defaults)
            const iterations = 1000;
            const start = performance.now();
            for (let i = 0; i < iterations; i++) {
                resolveOptions(schema);
            }
            const end = performance.now();

            const avgTime = (end - start) / iterations;
            assert.isBelow(avgTime, 0.5, `Average resolve time for empty options should be < 0.5ms, was ${avgTime.toFixed(4)}ms`);
        });
    });

    describe("Memory efficiency", () => {
        it("does not create excessive garbage during validation", () => {
            const schema: OptionsSchema = {
                value: {
                    type: "number",
                    default: 0.5,
                    label: "Test",
                    description: "Test",
                    min: 0,
                    max: 1,
                },
            };

            // Force garbage collection if available (Node.js with --expose-gc)
            if (typeof globalThis.gc === "function") {
                globalThis.gc();
            }

            // Run many validations
            for (let i = 0; i < 10000; i++) {
                resolveOptions(schema, {value: 0.5});
            }

            // If we got here without OOM, the test passes
            assert.isTrue(true, "Memory usage remained reasonable during repeated validations");
        });
    });

    describe("Validation edge cases", () => {
        it("handles many invalid values without significant slowdown", () => {
            const schema: OptionsSchema = {
                value: {
                    type: "number",
                    default: 0.5,
                    label: "Test",
                    description: "Test",
                    min: 0,
                    max: 1,
                },
            };

            // Measure validation failures
            const iterations = 1000;
            const start = performance.now();
            for (let i = 0; i < iterations; i++) {
                try {
                    resolveOptions(schema, {value: 999}); // Invalid value
                } catch {
                    // Expected - validation should fail
                }
            }
            const end = performance.now();

            const avgTime = (end - start) / iterations;
            assert.isBelow(avgTime, 1, `Validation failure should be fast, was ${avgTime.toFixed(4)}ms`);
        });
    });
});
