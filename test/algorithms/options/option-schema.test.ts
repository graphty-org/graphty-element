import {assert, describe, it} from "vitest";

import {
    defineOptionsSchema,
    type OptionDefinition,
    type OptionsSchema,
    OptionValidationError,
    resolveOptions,
    validateOption,
} from "../../../src/algorithms/types/OptionSchema";

describe("OptionSchema", () => {
    describe("validateOption", () => {
        describe("number type", () => {
            const numberDef: OptionDefinition<number> = {
                type: "number",
                default: 0.5,
                label: "Test Number",
                description: "A test number",
                min: 0,
                max: 1,
            };

            it("accepts valid numbers", () => {
                assert.doesNotThrow(() => {
                    validateOption("test", 0.5, numberDef);
                });
                assert.doesNotThrow(() => {
                    validateOption("test", 0, numberDef);
                });
                assert.doesNotThrow(() => {
                    validateOption("test", 1, numberDef);
                });
            });

            it("rejects non-numbers", () => {
                assert.throws(
                    () => {
                        validateOption("test", "0.5", numberDef);
                    },
                    OptionValidationError,
                    "must be a number",
                );
                assert.throws(
                    () => {
                        validateOption("test", true, numberDef);
                    },
                    OptionValidationError,
                    "must be a number",
                );
            });

            it("rejects NaN", () => {
                assert.throws(
                    () => {
                        validateOption("test", NaN, numberDef);
                    },
                    OptionValidationError,
                    "must not be NaN",
                );
            });

            it("rejects Infinity", () => {
                assert.throws(
                    () => {
                        validateOption("test", Infinity, numberDef);
                    },
                    OptionValidationError,
                    "must be finite",
                );
                assert.throws(
                    () => {
                        validateOption("test", -Infinity, numberDef);
                    },
                    OptionValidationError,
                    "must be finite",
                );
            });

            it("enforces min constraint", () => {
                assert.throws(
                    () => {
                        validateOption("test", -0.1, numberDef);
                    },
                    OptionValidationError,
                    "must be >= 0",
                );
            });

            it("enforces max constraint", () => {
                assert.throws(
                    () => {
                        validateOption("test", 1.1, numberDef);
                    },
                    OptionValidationError,
                    "must be <= 1",
                );
            });
        });

        describe("integer type", () => {
            const integerDef: OptionDefinition<number> = {
                type: "integer",
                default: 100,
                label: "Test Integer",
                description: "A test integer",
                min: 1,
                max: 1000,
            };

            it("accepts valid integers", () => {
                assert.doesNotThrow(() => {
                    validateOption("test", 100, integerDef);
                });
                assert.doesNotThrow(() => {
                    validateOption("test", 1, integerDef);
                });
                assert.doesNotThrow(() => {
                    validateOption("test", 1000, integerDef);
                });
            });

            it("rejects non-integers", () => {
                assert.throws(
                    () => {
                        validateOption("test", 100.5, integerDef);
                    },
                    OptionValidationError,
                    "must be an integer",
                );
            });

            it("enforces min constraint", () => {
                assert.throws(
                    () => {
                        validateOption("test", 0, integerDef);
                    },
                    OptionValidationError,
                    "must be >= 1",
                );
            });

            it("enforces max constraint", () => {
                assert.throws(
                    () => {
                        validateOption("test", 1001, integerDef);
                    },
                    OptionValidationError,
                    "must be <= 1000",
                );
            });
        });

        describe("boolean type", () => {
            const booleanDef: OptionDefinition<boolean> = {
                type: "boolean",
                default: true,
                label: "Test Boolean",
                description: "A test boolean",
            };

            it("accepts valid booleans", () => {
                assert.doesNotThrow(() => {
                    validateOption("test", true, booleanDef);
                });
                assert.doesNotThrow(() => {
                    validateOption("test", false, booleanDef);
                });
            });

            it("rejects non-booleans", () => {
                assert.throws(
                    () => {
                        validateOption("test", "true", booleanDef);
                    },
                    OptionValidationError,
                    "must be a boolean",
                );
                assert.throws(
                    () => {
                        validateOption("test", 1, booleanDef);
                    },
                    OptionValidationError,
                    "must be a boolean",
                );
            });
        });

        describe("string type", () => {
            const stringDef: OptionDefinition<string> = {
                type: "string",
                default: "test",
                label: "Test String",
                description: "A test string",
            };

            it("accepts valid strings", () => {
                assert.doesNotThrow(() => {
                    validateOption("test", "hello", stringDef);
                });
                assert.doesNotThrow(() => {
                    validateOption("test", "", stringDef);
                });
            });

            it("rejects non-strings", () => {
                assert.throws(
                    () => {
                        validateOption("test", 123, stringDef);
                    },
                    OptionValidationError,
                    "must be a string",
                );
            });
        });

        describe("select type", () => {
            const selectDef: OptionDefinition<string> = {
                type: "select",
                default: "a",
                label: "Test Select",
                description: "A test select",
                options: [
                    {value: "a", label: "Option A"},
                    {value: "b", label: "Option B"},
                    {value: "c", label: "Option C"},
                ],
            };

            it("accepts valid select values", () => {
                assert.doesNotThrow(() => {
                    validateOption("test", "a", selectDef);
                });
                assert.doesNotThrow(() => {
                    validateOption("test", "b", selectDef);
                });
                assert.doesNotThrow(() => {
                    validateOption("test", "c", selectDef);
                });
            });

            it("rejects invalid select values", () => {
                assert.throws(
                    () => {
                        validateOption("test", "d", selectDef);
                    },
                    OptionValidationError,
                    "must be one of",
                );
            });

            it("throws for select with no options defined", () => {
                const emptySelectDef: OptionDefinition<string> = {
                    type: "select",
                    default: "a",
                    label: "Test",
                    description: "Test",
                };
                assert.throws(
                    () => {
                        validateOption("test", "a", emptySelectDef);
                    },
                    OptionValidationError,
                    "has no options defined",
                );
            });
        });

        describe("nodeId type", () => {
            const nodeIdDef: OptionDefinition<string | number> = {
                type: "nodeId",
                default: "node1",
                label: "Test NodeId",
                description: "A test node ID",
            };

            it("accepts string node IDs", () => {
                assert.doesNotThrow(() => {
                    validateOption("test", "node1", nodeIdDef);
                });
                assert.doesNotThrow(() => {
                    validateOption("test", "A", nodeIdDef);
                });
            });

            it("accepts numeric node IDs", () => {
                assert.doesNotThrow(() => {
                    validateOption("test", 1, nodeIdDef);
                });
                assert.doesNotThrow(() => {
                    validateOption("test", 42, nodeIdDef);
                });
            });

            it("rejects invalid node ID types", () => {
                assert.throws(
                    () => {
                        validateOption("test", true, nodeIdDef);
                    },
                    OptionValidationError,
                    "must be a string or number",
                );
                assert.throws(
                    () => {
                        validateOption("test", {id: 1}, nodeIdDef);
                    },
                    OptionValidationError,
                    "must be a string or number",
                );
            });
        });

        describe("required option", () => {
            const requiredDef: OptionDefinition<string> = {
                type: "string",
                default: "default",
                label: "Required",
                description: "A required option",
                required: true,
            };

            it("throws for null/undefined when required", () => {
                assert.throws(
                    () => {
                        validateOption("test", null, requiredDef);
                    },
                    OptionValidationError,
                    "is required",
                );
                assert.throws(
                    () => {
                        validateOption("test", undefined, requiredDef);
                    },
                    OptionValidationError,
                    "is required",
                );
            });
        });

        describe("optional (not required) option", () => {
            const optionalDef: OptionDefinition<string | null> = {
                type: "string",
                default: null,
                label: "Optional",
                description: "An optional option",
                required: false,
            };

            it("allows null/undefined for non-required options", () => {
                assert.doesNotThrow(() => {
                    validateOption("test", null, optionalDef);
                });
                assert.doesNotThrow(() => {
                    validateOption("test", undefined, optionalDef);
                });
            });
        });
    });

    describe("resolveOptions", () => {
        const testSchema: OptionsSchema = {
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
            normalized: {
                type: "boolean",
                default: true,
                label: "Normalized",
                description: "Normalize results",
            },
        };

        it("returns defaults when no options provided", () => {
            const resolved = resolveOptions(testSchema);
            assert.strictEqual(resolved.dampingFactor, 0.85);
            assert.strictEqual(resolved.maxIterations, 100);
            assert.strictEqual(resolved.normalized, true);
        });

        it("returns defaults when empty object provided", () => {
            const resolved = resolveOptions(testSchema, {});
            assert.strictEqual(resolved.dampingFactor, 0.85);
            assert.strictEqual(resolved.maxIterations, 100);
            assert.strictEqual(resolved.normalized, true);
        });

        it("overrides defaults with provided options", () => {
            const resolved = resolveOptions(testSchema, {
                dampingFactor: 0.9,
                maxIterations: 50,
            });
            assert.strictEqual(resolved.dampingFactor, 0.9);
            assert.strictEqual(resolved.maxIterations, 50);
            assert.strictEqual(resolved.normalized, true); // still default
        });

        it("validates provided options", () => {
            assert.throws(
                () => resolveOptions(testSchema, {dampingFactor: 1.5}),
                OptionValidationError,
                "must be <= 1",
            );
        });

        it("handles partial options correctly", () => {
            const resolved = resolveOptions(testSchema, {normalized: false});
            assert.strictEqual(resolved.dampingFactor, 0.85);
            assert.strictEqual(resolved.maxIterations, 100);
            assert.strictEqual(resolved.normalized, false);
        });
    });

    describe("defineOptionsSchema", () => {
        it("returns the schema unchanged", () => {
            const schema = defineOptionsSchema({
                value: {
                    type: "number",
                    default: 1,
                    label: "Value",
                    description: "Test value",
                },
            });

            assert.strictEqual(schema.value.type, "number");
            assert.strictEqual(schema.value.default, 1);
        });
    });

    describe("OptionValidationError", () => {
        it("includes option key in message", () => {
            const error = new OptionValidationError("myOption", "must be positive");
            assert.strictEqual(error.optionKey, "myOption");
            assert.include(error.message, "myOption");
            assert.include(error.message, "must be positive");
        });

        it("has correct name", () => {
            const error = new OptionValidationError("test", "error");
            assert.strictEqual(error.name, "OptionValidationError");
        });
    });
});
