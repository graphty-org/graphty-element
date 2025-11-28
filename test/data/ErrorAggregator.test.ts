import {assert, beforeEach, describe, it} from "vitest";

import {type DataLoadingError, ErrorAggregator} from "../../src/data/ErrorAggregator.js";

describe("ErrorAggregator", () => {
    let aggregator: ErrorAggregator;

    beforeEach(() => {
        aggregator = new ErrorAggregator(100);
    });

    describe("addError", () => {
        it("should add errors and return true", () => {
            const error: DataLoadingError = {
                message: "Test error",
                line: 1,
            };

            const result = aggregator.addError(error);
            assert.strictEqual(result, true);
            assert.strictEqual(aggregator.getErrorCount(), 1);
        });

        it("should group errors by category", () => {
            aggregator.addError({
                message: "Error 1",
                category: "parse-error",
            });
            aggregator.addError({
                message: "Error 2",
                category: "parse-error",
            });
            aggregator.addError({
                message: "Error 3",
                category: "validation-error",
            });

            const summary = aggregator.getSummary();
            assert.strictEqual(summary.categories.size, 2);
            assert.strictEqual(summary.categories.get("parse-error")?.length, 2);
            assert.strictEqual(summary.categories.get("validation-error")?.length, 1);
        });

        it("should group errors by field", () => {
            aggregator.addError({
                message: "Error 1",
                field: "source",
                category: "missing-value",
            });
            aggregator.addError({
                message: "Error 2",
                field: "source",
                category: "missing-value",
            });
            aggregator.addError({
                message: "Error 3",
                field: "target",
                category: "missing-value",
            });

            const summary = aggregator.getSummary();
            assert.strictEqual(summary.totalErrors, 3);
        });

        it("should return false when error limit is reached", () => {
            const smallAggregator = new ErrorAggregator(2);

            assert.strictEqual(smallAggregator.addError({message: "Error 1"}), true);
            assert.strictEqual(smallAggregator.addError({message: "Error 2"}), true);
            assert.strictEqual(smallAggregator.addError({message: "Error 3"}), false);

            assert.strictEqual(smallAggregator.getErrorCount(), 2);
        });

        it("should handle errors without category as 'unknown'", () => {
            aggregator.addError({message: "Error without category"});

            const summary = aggregator.getSummary();
            assert.strictEqual(summary.categories.has("unknown"), true);
            assert.strictEqual(summary.categories.get("unknown")?.length, 1);
        });
    });

    describe("getSummary", () => {
        it("should identify primary category", () => {
            aggregator.addError({message: "E1", category: "parse-error"});
            aggregator.addError({message: "E2", category: "parse-error"});
            aggregator.addError({message: "E3", category: "parse-error"});
            aggregator.addError({message: "E4", category: "validation-error"});

            const summary = aggregator.getSummary();
            assert.strictEqual(summary.primaryCategory, "parse-error");
        });

        it("should generate message for missing column errors", () => {
            aggregator.addError({
                message: "Missing source",
                category: "missing-column",
                field: "source",
            });
            aggregator.addError({
                message: "Missing target",
                category: "missing-column",
                field: "target",
            });

            const summary = aggregator.getSummary();
            assert.match(summary.message, /missing column/i);
            assert.match(summary.suggestion ?? "", /source, target/i);
        });

        it("should generate message for parse errors", () => {
            for (let i = 0; i < 10; i++) {
                aggregator.addError({
                    message: `Parse error ${i}`,
                    category: "parse-error",
                    line: i,
                });
            }

            const summary = aggregator.getSummary();
            assert.match(summary.message, /parsing error/i);
            assert.match(summary.suggestion ?? "", /format.*encoding/i);
        });

        it("should generate message for missing value errors", () => {
            aggregator.addError({
                message: "Missing value",
                category: "missing-value",
                field: "id",
            });
            aggregator.addError({
                message: "Missing value",
                category: "missing-value",
                field: "name",
            });

            const summary = aggregator.getSummary();
            assert.match(summary.message, /missing required values/i);
            assert.match(summary.suggestion ?? "", /id, name/i);
        });

        it("should generate message for validation errors", () => {
            aggregator.addError({
                message: "Invalid type",
                category: "validation-error",
            });
            aggregator.addError({
                message: "Invalid format",
                category: "validation-error",
            });

            const summary = aggregator.getSummary();
            assert.match(summary.message, /validation error/i);
            assert.match(summary.suggestion ?? "", /format and types/i);
        });

        it("should handle no errors", () => {
            const summary = aggregator.getSummary();
            assert.strictEqual(summary.totalErrors, 0);
            assert.strictEqual(summary.message, "No errors");
        });

        it("should generate generic message for unknown category", () => {
            aggregator.addError({message: "Generic error 1"});
            aggregator.addError({message: "Generic error 2"});

            const summary = aggregator.getSummary();
            assert.match(summary.message, /Found \d+ errors/);
        });
    });

    describe("getUserFriendlyMessage", () => {
        it("should combine message and suggestion", () => {
            aggregator.addError({
                message: "Missing source column",
                category: "missing-column",
                field: "source",
            });

            const message = aggregator.getUserFriendlyMessage();
            assert.match(message, /missing column/i);
            assert.match(message, /Suggestion:/);
        });

        it("should not include suggestion when not available", () => {
            const message = aggregator.getUserFriendlyMessage();
            assert.strictEqual(message, "No errors");
        });
    });

    describe("getDetailedReport", () => {
        it("should include summary, suggestion, and error details", () => {
            aggregator.addError({
                message: "Parse error 1",
                category: "parse-error",
                line: 5,
            });
            aggregator.addError({
                message: "Parse error 2",
                category: "parse-error",
                line: 10,
                field: "name",
            });

            const report = aggregator.getDetailedReport();
            assert.match(report, /Found \d+ errors/);
            assert.match(report, /Suggestion:/);
            assert.match(report, /Detailed Errors/);
            assert.match(report, /PARSE-ERROR/);
            assert.match(report, /Parse error 1.*\[line 5\]/);
            assert.match(report, /Parse error 2.*\[line 10\].*\[field: name\]/);
        });

        it("should truncate error lists to 10 per category", () => {
            for (let i = 0; i < 15; i++) {
                aggregator.addError({
                    message: `Error ${i}`,
                    category: "test-category",
                });
            }

            const report = aggregator.getDetailedReport();
            assert.match(report, /and 5 more/);
        });

        it("should show multiple categories", () => {
            aggregator.addError({message: "E1", category: "cat1"});
            aggregator.addError({message: "E2", category: "cat2"});
            aggregator.addError({message: "E3", category: "cat1"});

            const report = aggregator.getDetailedReport();
            assert.match(report, /CAT1.*\(2 errors\)/s);
            assert.match(report, /CAT2.*\(1 errors\)/s);
        });
    });

    describe("hasReachedLimit", () => {
        it("should return false when below limit", () => {
            aggregator.addError({message: "Error 1"});
            assert.strictEqual(aggregator.hasReachedLimit(), false);
        });

        it("should return true when limit reached", () => {
            const smallAggregator = new ErrorAggregator(2);
            smallAggregator.addError({message: "Error 1"});
            smallAggregator.addError({message: "Error 2"});

            assert.strictEqual(smallAggregator.hasReachedLimit(), true);
        });
    });

    describe("getErrors", () => {
        it("should return copy of all errors", () => {
            const error1: DataLoadingError = {message: "Error 1"};
            const error2: DataLoadingError = {message: "Error 2"};

            aggregator.addError(error1);
            aggregator.addError(error2);

            const errors = aggregator.getErrors();
            assert.strictEqual(errors.length, 2);
            assert.deepStrictEqual(errors[0], error1);
            assert.deepStrictEqual(errors[1], error2);

            // Verify it's a copy
            errors.push({message: "Error 3"});
            assert.strictEqual(aggregator.getErrorCount(), 2);
        });
    });

    describe("clear", () => {
        it("should clear all errors and groups", () => {
            aggregator.addError({message: "E1", category: "cat1", field: "field1"});
            aggregator.addError({message: "E2", category: "cat2", field: "field2"});

            aggregator.clear();

            assert.strictEqual(aggregator.getErrorCount(), 0);
            const summary = aggregator.getSummary();
            assert.strictEqual(summary.totalErrors, 0);
            assert.strictEqual(summary.categories.size, 0);
        });
    });

    describe("edge cases", () => {
        it("should handle errors with line numbers", () => {
            aggregator.addError({
                message: "Error at line",
                line: 42,
                category: "test",
            });

            const errors = aggregator.getErrors();
            assert.strictEqual(errors[0].line, 42);

            const report = aggregator.getDetailedReport();
            assert.match(report, /\[line 42\]/);
        });

        it("should handle errors without line numbers", () => {
            aggregator.addError({
                message: "Error without line",
                category: "test",
            });

            const errors = aggregator.getErrors();
            assert.strictEqual(errors[0].line, undefined);
        });

        it("should handle mixed error categories", () => {
            aggregator.addError({message: "E1", category: "cat1"});
            aggregator.addError({message: "E2", category: "cat2"});
            aggregator.addError({message: "E3", category: "cat3"});
            aggregator.addError({message: "E4"}); // no category

            const summary = aggregator.getSummary();
            assert.strictEqual(summary.categories.size, 4); // cat1, cat2, cat3, unknown
        });
    });

    describe("realistic scenarios", () => {
        it("should handle CSV missing column scenario", () => {
            // Simulate parsing CSV without 'source' column
            for (let i = 1; i <= 23; i++) {
                aggregator.addError({
                    message: `Row ${i}: Missing source column`,
                    category: "missing-column",
                    field: "source",
                    line: i,
                });
            }

            const message = aggregator.getUserFriendlyMessage();
            assert.match(message, /Found 23 errors.*missing column/i);
            assert.match(message, /Suggestion.*source/i);
        });

        it("should handle malformed CSV scenario", () => {
            // Simulate parsing errors from malformed CSV
            for (let i = 1; i <= 15; i++) {
                aggregator.addError({
                    message: `Unclosed quote at line ${i}`,
                    category: "parse-error",
                    line: i,
                });
            }

            const summary = aggregator.getSummary();
            assert.match(summary.message, /parsing error/i);
            assert.match(summary.suggestion ?? "", /format.*encoding/i);
        });

        it("should handle validation failure scenario", () => {
            aggregator.addError({
                message: "Invalid node ID type",
                category: "validation-error",
                field: "id",
                line: 5,
            });
            aggregator.addError({
                message: "Invalid edge weight",
                category: "validation-error",
                field: "weight",
                line: 10,
            });

            const summary = aggregator.getSummary();
            assert.match(summary.message, /validation error/i);
        });
    });
});
