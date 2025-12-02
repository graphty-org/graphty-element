/**
 * AlgorithmCommands Tests - Tests for algorithm-related commands.
 * @module test/ai/commands/AlgorithmCommands.test
 */

// Import algorithms to register them
import "../../../src/algorithms";

import {assert, beforeEach, describe, it} from "vitest";

import {listAlgorithms, runAlgorithm} from "../../../src/ai/commands/AlgorithmCommands";
import type {CommandContext} from "../../../src/ai/commands/types";
import type {Graph} from "../../../src/Graph";
import {createMockContext, createTestGraph} from "../../helpers/test-graph";

describe("AlgorithmCommands", () => {
    let graph: Graph;
    let context: CommandContext;

    beforeEach(() => {
        graph = createTestGraph({nodes: 10, edges: 15});
        context = createMockContext(graph);
    });

    describe("runAlgorithm", () => {
        it("runs degree algorithm", async() => {
            const result = await runAlgorithm.execute(graph, {
                namespace: "graphty",
                type: "degree",
            }, context);
            assert.strictEqual(result.success, true);
            assert.ok(result.message.includes("degree"));
        });

        it("runs pagerank algorithm", async() => {
            const result = await runAlgorithm.execute(graph, {
                namespace: "graphty",
                type: "pagerank",
            }, context);
            assert.strictEqual(result.success, true);
            assert.ok(result.message.includes("pagerank"));
        });

        it("handles unknown namespace", async() => {
            const result = await runAlgorithm.execute(graph, {
                namespace: "unknown",
                type: "degree",
            }, context);
            assert.strictEqual(result.success, false);
            assert.ok(result.message.includes("not found") || result.message.includes("unknown"));
        });

        it("handles unknown type", async() => {
            const result = await runAlgorithm.execute(graph, {
                namespace: "graphty",
                type: "unknownAlgorithm",
            }, context);
            assert.strictEqual(result.success, false);
            assert.ok(result.message.includes("not found") || result.message.includes("unknown"));
        });

        it("has correct metadata", () => {
            assert.strictEqual(runAlgorithm.name, "runAlgorithm");
            assert.ok(runAlgorithm.description.length > 0);
            assert.ok(runAlgorithm.parameters);
            assert.ok(Array.isArray(runAlgorithm.examples));
            assert.ok(runAlgorithm.examples.length > 0);
        });
    });

    describe("listAlgorithms", () => {
        it("lists available algorithms", async() => {
            const result = await listAlgorithms.execute(graph, {}, context);
            assert.strictEqual(result.success, true);

            const data = result.data as {algorithms: string[]};
            assert.ok(Array.isArray(data.algorithms));
            assert.ok(data.algorithms.length > 0);
        });

        it("includes degree algorithm in list", async() => {
            const result = await listAlgorithms.execute(graph, {}, context);
            assert.strictEqual(result.success, true);

            const data = result.data as {algorithms: string[]};
            const hasDegreeLike = data.algorithms.some((alg) =>
                alg.toLowerCase().includes("degree"));
            assert.ok(hasDegreeLike);
        });

        it("can filter by namespace", async() => {
            const result = await listAlgorithms.execute(graph, {
                namespace: "graphty",
            }, context);
            assert.strictEqual(result.success, true);

            const data = result.data as {algorithms: string[]};
            assert.ok(Array.isArray(data.algorithms));
        });

        it("has correct metadata", () => {
            assert.strictEqual(listAlgorithms.name, "listAlgorithms");
            assert.ok(listAlgorithms.description.length > 0);
            assert.ok(listAlgorithms.parameters);
            assert.ok(Array.isArray(listAlgorithms.examples));
        });
    });
});
