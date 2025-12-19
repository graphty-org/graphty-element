/**
 * SchemaCommands describeProperty Tests - Tests for the describeProperty command.
 * @module test/ai/commands/SchemaCommands.describeProperty.test
 */

import {assert, beforeEach, describe, it} from "vitest";

import {describeProperty} from "../../../src/ai/commands/SchemaCommands";
import type {CommandContext} from "../../../src/ai/commands/types";
import type {Graph} from "../../../src/Graph";
import {createMockGraphWithCustomData} from "../../helpers/mock-graph-custom-data";
import {createMockContext, createTestGraph} from "../../helpers/test-graph";

describe("describeProperty command", () => {
    let graph: Graph;
    let context: CommandContext;

    beforeEach(() => {
        graph = createTestGraph({nodes: 25, edges: 40});
        context = createMockContext(graph);
    });

    describe("string properties", () => {
        it("returns value distribution for string properties", async() => {
            const result = await describeProperty.execute(graph, {property: "data.type", target: "nodes"}, context);
            assert.strictEqual(result.success, true);
            const data = result.data as {
                property: string;
                type: string;
                distribution: Record<string, {count: number, percentage: number}>;
            };
            assert.strictEqual(data.property, "data.type");
            assert.strictEqual(data.type, "string");
            assert.ok(data.distribution);
            // Our test graph has server, client, router types
            assert.ok("server" in data.distribution || "client" in data.distribution || "router" in data.distribution);
        });

        it("includes percentages for string values", async() => {
            const result = await describeProperty.execute(graph, {property: "data.type", target: "nodes"}, context);
            assert.strictEqual(result.success, true);
            const data = result.data as {
                distribution: Record<string, {count: number, percentage: number}>;
            };
            // Check that percentages are included
            for (const value of Object.values(data.distribution)) {
                assert.ok(typeof value.count === "number");
                assert.ok(typeof value.percentage === "number");
                assert.ok(value.percentage >= 0 && value.percentage <= 100);
            }
        });

        it("respects limit parameter for unique values", async() => {
            // Create a graph with many unique string values
            const customGraph = createMockGraphWithCustomData({
                nodeCount: 50,
                nodeDataGenerator: (index) => ({
                    category: `category-${index}`,
                }),
            });
            const result = await describeProperty.execute(customGraph, {property: "category", target: "nodes", limit: 5}, context);
            assert.strictEqual(result.success, true);
            const data = result.data as {
                distribution: Record<string, {count: number, percentage: number}>;
                truncated: boolean;
            };
            // Should only show limit number of unique values
            assert.ok(Object.keys(data.distribution).length <= 5);
            assert.strictEqual(data.truncated, true);
        });
    });

    describe("number properties", () => {
        it("returns min/max/avg for number properties", async() => {
            const result = await describeProperty.execute(graph, {property: "weight", target: "edges"}, context);
            assert.strictEqual(result.success, true);
            const data = result.data as {
                property: string;
                type: string;
                statistics: {min: number, max: number, avg: number, median: number};
            };
            assert.strictEqual(data.type, "number");
            assert.ok(data.statistics);
            assert.ok(typeof data.statistics.min === "number");
            assert.ok(typeof data.statistics.max === "number");
            assert.ok(typeof data.statistics.avg === "number");
            assert.ok(data.statistics.min <= data.statistics.max);
        });

        it("includes histogram for number properties", async() => {
            const result = await describeProperty.execute(graph, {property: "weight", target: "edges"}, context);
            assert.strictEqual(result.success, true);
            const data = result.data as {
                histogram: {range: string, count: number}[];
            };
            assert.ok(Array.isArray(data.histogram));
            assert.ok(data.histogram.length > 0);
            for (const bin of data.histogram) {
                assert.ok(typeof bin.range === "string");
                assert.ok(typeof bin.count === "number");
            }
        });

        it("handles integer and float numbers", async() => {
            const customGraph = createMockGraphWithCustomData({
                nodeCount: 20,
                nodeDataGenerator: (index) => ({
                    intValue: index,
                    floatValue: index + 0.5,
                }),
            });

            // Test integer values
            const intResult = await describeProperty.execute(customGraph, {property: "intValue", target: "nodes"}, context);
            assert.strictEqual(intResult.success, true);
            const intData = intResult.data as {type: string};
            assert.strictEqual(intData.type, "number");

            // Test float values
            const floatResult = await describeProperty.execute(customGraph, {property: "floatValue", target: "nodes"}, context);
            assert.strictEqual(floatResult.success, true);
            const floatData = floatResult.data as {type: string};
            assert.strictEqual(floatData.type, "number");
        });
    });

    describe("boolean properties", () => {
        it("returns true/false counts for boolean properties", async() => {
            const customGraph = createMockGraphWithCustomData({
                nodeCount: 20,
                nodeDataGenerator: (index) => ({
                    isActive: index % 2 === 0,
                }),
            });

            const result = await describeProperty.execute(customGraph, {property: "isActive", target: "nodes"}, context);
            assert.strictEqual(result.success, true);
            const data = result.data as {
                property: string;
                type: string;
                distribution: {true: {count: number}, false: {count: number}};
            };
            assert.strictEqual(data.type, "boolean");
            assert.ok(data.distribution);
            assert.ok("true" in data.distribution);
            assert.ok("false" in data.distribution);
        });

        it("includes percentages for boolean values", async() => {
            const customGraph = createMockGraphWithCustomData({
                nodeCount: 20,
                nodeDataGenerator: (index) => ({
                    isActive: index % 4 === 0, // 25% true, 75% false
                }),
            });

            const result = await describeProperty.execute(customGraph, {property: "isActive", target: "nodes"}, context);
            assert.strictEqual(result.success, true);
            interface CountPercent {
                count: number;
                percentage: number;
            }
            const data = result.data as {
                distribution: {
                    true: CountPercent;
                    false: CountPercent;
                };
            };
            // Check percentages sum to 100
            const totalPercentage = data.distribution.true.percentage + data.distribution.false.percentage;
            assert.ok(Math.abs(totalPercentage - 100) < 0.1);
        });
    });

    describe("array properties", () => {
        it("returns unique values for array items", async() => {
            const customGraph = createMockGraphWithCustomData({
                nodeCount: 10,
                nodeDataGenerator: () => ({
                    tags: ["tag1", "tag2", "tag3"],
                }),
            });

            const result = await describeProperty.execute(customGraph, {property: "tags", target: "nodes"}, context);
            assert.strictEqual(result.success, true);
            const data = result.data as {
                type: string;
                itemType: string;
                uniqueItems: string[];
            };
            assert.strictEqual(data.type, "array");
            assert.ok(data.uniqueItems);
            assert.ok(data.uniqueItems.includes("tag1"));
        });

        it("includes array length statistics", async() => {
            const customGraph = createMockGraphWithCustomData({
                nodeCount: 10,
                nodeDataGenerator: (index) => ({
                    tags: Array.from({length: (index % 5) + 1}, (_, i) => `tag${i}`),
                }),
            });

            const result = await describeProperty.execute(customGraph, {property: "tags", target: "nodes"}, context);
            assert.strictEqual(result.success, true);
            const data = result.data as {
                type: string;
                lengthStatistics: {min: number, max: number, avg: number};
            };
            assert.ok(data.lengthStatistics);
            assert.ok(typeof data.lengthStatistics.min === "number");
            assert.ok(typeof data.lengthStatistics.max === "number");
            assert.ok(typeof data.lengthStatistics.avg === "number");
        });
    });

    describe("edge cases", () => {
        it("handles nested property paths", async() => {
            // data.type is a nested property in our test graph
            const result = await describeProperty.execute(graph, {property: "data.type", target: "nodes"}, context);
            assert.strictEqual(result.success, true);
            const data = result.data as {property: string};
            assert.strictEqual(data.property, "data.type");
        });

        it("returns not found for missing properties", async() => {
            const result = await describeProperty.execute(graph, {property: "nonexistent.prop", target: "nodes"}, context);
            assert.strictEqual(result.success, false);
            assert.ok(result.message.includes("not found"));
        });

        it("suggests available properties when not found", async() => {
            const result = await describeProperty.execute(graph, {property: "nonexistent", target: "nodes"}, context);
            assert.strictEqual(result.success, false);
            // Should suggest available properties
            assert.ok(result.message.includes("Available") || result.data !== undefined);
        });

        it("handles mixed type properties", async() => {
            const customGraph = createMockGraphWithCustomData({
                nodeCount: 10,
                nodeDataGenerator: (index) => ({
                    mixedValue: index % 2 === 0 ? "string" : 123,
                }),
            });

            const result = await describeProperty.execute(customGraph, {property: "mixedValue", target: "nodes"}, context);
            assert.strictEqual(result.success, true);
            const data = result.data as {type: string};
            assert.strictEqual(data.type, "mixed");
        });

        it("handles null values in property analysis", async() => {
            const customGraph = createMockGraphWithCustomData({
                nodeCount: 10,
                nodeDataGenerator: (index) => ({
                    nullableValue: index % 3 === 0 ? null : `value-${index}`,
                }),
            });

            const result = await describeProperty.execute(customGraph, {property: "nullableValue", target: "nodes"}, context);
            assert.strictEqual(result.success, true);
            const data = result.data as {nullCount: number};
            assert.ok(typeof data.nullCount === "number");
            assert.ok(data.nullCount > 0);
        });
    });

    describe("target parameter", () => {
        it("defaults to nodes when target not specified", async() => {
            const result = await describeProperty.execute(graph, {property: "data.type"}, context);
            assert.strictEqual(result.success, true);
            const data = result.data as {target: string};
            assert.strictEqual(data.target, "nodes");
        });

        it("analyzes edge properties when target is edges", async() => {
            const result = await describeProperty.execute(graph, {property: "weight", target: "edges"}, context);
            assert.strictEqual(result.success, true);
            const data = result.data as {target: string};
            assert.strictEqual(data.target, "edges");
        });
    });

    describe("command metadata", () => {
        it("has correct command metadata", () => {
            assert.strictEqual(describeProperty.name, "describeProperty");
            assert.ok(describeProperty.description.length > 0);
            assert.ok(Array.isArray(describeProperty.examples));
            assert.ok(describeProperty.examples.length > 0);

            // Verify examples have correct structure
            for (const example of describeProperty.examples) {
                assert.ok(typeof example.input === "string");
                assert.ok(typeof example.params === "object");
            }
        });

        it("has parameters schema", () => {
            assert.ok(describeProperty.parameters);
        });
    });
});
