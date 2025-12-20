/* eslint-disable @typescript-eslint/no-deprecated -- Testing legacy backward-compatible API */
import {assert, describe, it} from "vitest";

import {Algorithm} from "../../../src/algorithms/Algorithm";
import {EigenvectorCentralityAlgorithm} from "../../../src/algorithms/EigenvectorCentralityAlgorithm";
import {HITSAlgorithm} from "../../../src/algorithms/HITSAlgorithm";
import {KatzCentralityAlgorithm} from "../../../src/algorithms/KatzCentralityAlgorithm";
import {OptionValidationError} from "../../../src/algorithms/types/OptionSchema";
import {createMockGraph, getNodeResult} from "../../helpers/mockGraph";

describe("Centrality Algorithm Options", () => {
    describe("EigenvectorCentralityAlgorithm", () => {
        describe("options schema", () => {
            it("has options defined", () => {
                assert.isTrue(EigenvectorCentralityAlgorithm.hasOptions());
            });

            it("has maxIterations option", () => {
                const schema = EigenvectorCentralityAlgorithm.getOptionsSchema();
                assert.isDefined(schema.maxIterations);
                assert.strictEqual(schema.maxIterations.type, "integer");
                assert.strictEqual(schema.maxIterations.default, 100);
                assert.strictEqual(schema.maxIterations.min, 1);
                assert.strictEqual(schema.maxIterations.max, 1000);
                assert.isTrue(schema.maxIterations.advanced);
            });

            it("has tolerance option", () => {
                const schema = EigenvectorCentralityAlgorithm.getOptionsSchema();
                assert.isDefined(schema.tolerance);
                assert.strictEqual(schema.tolerance.type, "number");
                assert.strictEqual(schema.tolerance.default, 1e-6);
                assert.strictEqual(schema.tolerance.min, 1e-10);
                assert.strictEqual(schema.tolerance.max, 0.01);
                assert.isTrue(schema.tolerance.advanced);
            });
        });

        describe("option defaults", () => {
            it("uses default options when none provided", async() => {
                const graph = await createMockGraph({
                    nodes: [{id: "A"}, {id: "B"}, {id: "C"}],
                    edges: [
                        {srcId: "A", dstId: "B"},
                        {srcId: "B", dstId: "C"},
                        {srcId: "C", dstId: "A"},
                    ],
                });
                const algo = new EigenvectorCentralityAlgorithm(graph);
                await algo.run();

                // Verify scores were calculated
                const score = getNodeResult(graph, "A", "graphty", "eigenvector", "score");
                assert.isDefined(score);
                assert.isNumber(score);
            });
        });

        describe("option validation", () => {
            it("accepts valid maxIterations", async() => {
                const graph = await createMockGraph();
                assert.doesNotThrow(() => new EigenvectorCentralityAlgorithm(graph, {maxIterations: 200}));
            });

            it("rejects maxIterations < 1", async() => {
                const graph = await createMockGraph();
                assert.throws(
                    () => new EigenvectorCentralityAlgorithm(graph, {maxIterations: 0}),
                    OptionValidationError,
                    "must be >= 1",
                );
            });

            it("rejects maxIterations > 1000", async() => {
                const graph = await createMockGraph();
                assert.throws(
                    () => new EigenvectorCentralityAlgorithm(graph, {maxIterations: 1001}),
                    OptionValidationError,
                    "must be <= 1000",
                );
            });

            it("rejects non-integer maxIterations", async() => {
                const graph = await createMockGraph();
                assert.throws(
                    () => new EigenvectorCentralityAlgorithm(graph, {maxIterations: 50.5}),
                    OptionValidationError,
                    "must be an integer",
                );
            });

            it("accepts valid tolerance", async() => {
                const graph = await createMockGraph();
                assert.doesNotThrow(() => new EigenvectorCentralityAlgorithm(graph, {tolerance: 0.001}));
            });

            it("rejects tolerance < 1e-10", async() => {
                const graph = await createMockGraph();
                assert.throws(
                    () => new EigenvectorCentralityAlgorithm(graph, {tolerance: 1e-11}),
                    OptionValidationError,
                    "must be >= ",
                );
            });

            it("rejects tolerance > 0.01", async() => {
                const graph = await createMockGraph();
                assert.throws(
                    () => new EigenvectorCentralityAlgorithm(graph, {tolerance: 0.1}),
                    OptionValidationError,
                    "must be <= 0.01",
                );
            });
        });

        describe("custom options in run()", () => {
            it("uses custom maxIterations", async() => {
                const graph = await createMockGraph({
                    nodes: [{id: "A"}, {id: "B"}, {id: "C"}],
                    edges: [
                        {srcId: "A", dstId: "B"},
                        {srcId: "B", dstId: "C"},
                        {srcId: "C", dstId: "A"},
                    ],
                });
                // Run with reduced iterations
                const algo = new EigenvectorCentralityAlgorithm(graph, {maxIterations: 5});
                await algo.run();

                // Verify scores were calculated
                const score = getNodeResult(graph, "A", "graphty", "eigenvector", "score");
                assert.isDefined(score);
            });
        });

        describe("registry integration", () => {
            it("can be retrieved from registry with options", () => {
                const AlgoClass = Algorithm.getClass("graphty", "eigenvector");
                assert.isNotNull(AlgoClass);
                assert.isTrue(AlgoClass.hasOptions());
                assert.isDefined(AlgoClass.getOptionsSchema().maxIterations);
                assert.isDefined(AlgoClass.getOptionsSchema().tolerance);
            });
        });
    });

    describe("KatzCentralityAlgorithm", () => {
        describe("options schema", () => {
            it("has options defined", () => {
                assert.isTrue(KatzCentralityAlgorithm.hasOptions());
            });

            it("has alpha option", () => {
                const schema = KatzCentralityAlgorithm.getOptionsSchema();
                assert.isDefined(schema.alpha);
                assert.strictEqual(schema.alpha.type, "number");
                assert.strictEqual(schema.alpha.default, 0.1);
                assert.strictEqual(schema.alpha.min, 0.01);
                assert.strictEqual(schema.alpha.max, 0.5);
                assert.strictEqual(schema.alpha.step, 0.01);
            });

            it("has beta option", () => {
                const schema = KatzCentralityAlgorithm.getOptionsSchema();
                assert.isDefined(schema.beta);
                assert.strictEqual(schema.beta.type, "number");
                assert.strictEqual(schema.beta.default, 1.0);
                assert.strictEqual(schema.beta.min, 0);
                assert.strictEqual(schema.beta.max, 10);
                assert.isTrue(schema.beta.advanced);
            });

            it("has maxIterations option", () => {
                const schema = KatzCentralityAlgorithm.getOptionsSchema();
                assert.isDefined(schema.maxIterations);
                assert.strictEqual(schema.maxIterations.type, "integer");
                assert.strictEqual(schema.maxIterations.default, 100);
                assert.strictEqual(schema.maxIterations.min, 1);
                assert.strictEqual(schema.maxIterations.max, 1000);
                assert.isTrue(schema.maxIterations.advanced);
            });

            it("has tolerance option", () => {
                const schema = KatzCentralityAlgorithm.getOptionsSchema();
                assert.isDefined(schema.tolerance);
                assert.strictEqual(schema.tolerance.type, "number");
                assert.strictEqual(schema.tolerance.default, 1e-6);
                assert.isTrue(schema.tolerance.advanced);
            });
        });

        describe("option defaults", () => {
            it("uses default options when none provided", async() => {
                const graph = await createMockGraph({
                    nodes: [{id: "A"}, {id: "B"}, {id: "C"}],
                    edges: [
                        {srcId: "A", dstId: "B"},
                        {srcId: "B", dstId: "C"},
                        {srcId: "C", dstId: "A"},
                    ],
                });
                const algo = new KatzCentralityAlgorithm(graph);
                await algo.run();

                // Verify scores were calculated
                const score = getNodeResult(graph, "A", "graphty", "katz", "score");
                assert.isDefined(score);
                assert.isNumber(score);
            });
        });

        describe("option validation", () => {
            it("accepts valid alpha", async() => {
                const graph = await createMockGraph();
                assert.doesNotThrow(() => new KatzCentralityAlgorithm(graph, {alpha: 0.2}));
            });

            it("rejects alpha < 0.01", async() => {
                const graph = await createMockGraph();
                assert.throws(
                    () => new KatzCentralityAlgorithm(graph, {alpha: 0.005}),
                    OptionValidationError,
                    "must be >= 0.01",
                );
            });

            it("rejects alpha > 0.5", async() => {
                const graph = await createMockGraph();
                assert.throws(
                    () => new KatzCentralityAlgorithm(graph, {alpha: 0.6}),
                    OptionValidationError,
                    "must be <= 0.5",
                );
            });

            it("accepts valid beta", async() => {
                const graph = await createMockGraph();
                assert.doesNotThrow(() => new KatzCentralityAlgorithm(graph, {beta: 2.0}));
            });

            it("rejects beta < 0", async() => {
                const graph = await createMockGraph();
                assert.throws(
                    () => new KatzCentralityAlgorithm(graph, {beta: -0.5}),
                    OptionValidationError,
                    "must be >= 0",
                );
            });

            it("rejects beta > 10", async() => {
                const graph = await createMockGraph();
                assert.throws(
                    () => new KatzCentralityAlgorithm(graph, {beta: 11}),
                    OptionValidationError,
                    "must be <= 10",
                );
            });

            it("rejects non-integer maxIterations", async() => {
                const graph = await createMockGraph();
                assert.throws(
                    () => new KatzCentralityAlgorithm(graph, {maxIterations: 100.5}),
                    OptionValidationError,
                    "must be an integer",
                );
            });
        });

        describe("custom options in run()", () => {
            it("uses custom alpha and beta", async() => {
                const graph = await createMockGraph({
                    nodes: [{id: "A"}, {id: "B"}, {id: "C"}],
                    edges: [
                        {srcId: "A", dstId: "B"},
                        {srcId: "B", dstId: "C"},
                        {srcId: "C", dstId: "A"},
                    ],
                });
                const algo = new KatzCentralityAlgorithm(graph, {alpha: 0.2, beta: 2.0});
                await algo.run();

                // Verify scores were calculated
                const score = getNodeResult(graph, "A", "graphty", "katz", "score");
                assert.isDefined(score);
            });
        });

        describe("registry integration", () => {
            it("can be retrieved from registry with options", () => {
                const AlgoClass = Algorithm.getClass("graphty", "katz");
                assert.isNotNull(AlgoClass);
                assert.isTrue(AlgoClass.hasOptions());
                assert.isDefined(AlgoClass.getOptionsSchema().alpha);
                assert.isDefined(AlgoClass.getOptionsSchema().beta);
            });
        });
    });

    describe("HITSAlgorithm", () => {
        describe("options schema", () => {
            it("has options defined", () => {
                assert.isTrue(HITSAlgorithm.hasOptions());
            });

            it("has maxIterations option", () => {
                const schema = HITSAlgorithm.getOptionsSchema();
                assert.isDefined(schema.maxIterations);
                assert.strictEqual(schema.maxIterations.type, "integer");
                assert.strictEqual(schema.maxIterations.default, 100);
                assert.strictEqual(schema.maxIterations.min, 1);
                assert.strictEqual(schema.maxIterations.max, 1000);
                assert.isTrue(schema.maxIterations.advanced);
            });

            it("has tolerance option", () => {
                const schema = HITSAlgorithm.getOptionsSchema();
                assert.isDefined(schema.tolerance);
                assert.strictEqual(schema.tolerance.type, "number");
                assert.strictEqual(schema.tolerance.default, 1e-6);
                assert.strictEqual(schema.tolerance.min, 1e-10);
                assert.strictEqual(schema.tolerance.max, 0.01);
                assert.isTrue(schema.tolerance.advanced);
            });
        });

        describe("option defaults", () => {
            it("uses default options when none provided", async() => {
                const graph = await createMockGraph({
                    nodes: [{id: "A"}, {id: "B"}, {id: "C"}],
                    edges: [
                        {srcId: "A", dstId: "B"},
                        {srcId: "B", dstId: "C"},
                        {srcId: "C", dstId: "A"},
                    ],
                });
                const algo = new HITSAlgorithm(graph);
                await algo.run();

                // Verify scores were calculated
                const hubScore = getNodeResult(graph, "A", "graphty", "hits", "hubScore");
                const authorityScore = getNodeResult(graph, "A", "graphty", "hits", "authorityScore");
                assert.isDefined(hubScore);
                assert.isDefined(authorityScore);
                assert.isNumber(hubScore);
                assert.isNumber(authorityScore);
            });
        });

        describe("option validation", () => {
            it("accepts valid maxIterations", async() => {
                const graph = await createMockGraph();
                assert.doesNotThrow(() => new HITSAlgorithm(graph, {maxIterations: 200}));
            });

            it("rejects maxIterations < 1", async() => {
                const graph = await createMockGraph();
                assert.throws(
                    () => new HITSAlgorithm(graph, {maxIterations: 0}),
                    OptionValidationError,
                    "must be >= 1",
                );
            });

            it("rejects maxIterations > 1000", async() => {
                const graph = await createMockGraph();
                assert.throws(
                    () => new HITSAlgorithm(graph, {maxIterations: 1001}),
                    OptionValidationError,
                    "must be <= 1000",
                );
            });

            it("rejects non-integer maxIterations", async() => {
                const graph = await createMockGraph();
                assert.throws(
                    () => new HITSAlgorithm(graph, {maxIterations: 50.5}),
                    OptionValidationError,
                    "must be an integer",
                );
            });

            it("accepts valid tolerance", async() => {
                const graph = await createMockGraph();
                assert.doesNotThrow(() => new HITSAlgorithm(graph, {tolerance: 0.001}));
            });

            it("rejects tolerance < 1e-10", async() => {
                const graph = await createMockGraph();
                assert.throws(
                    () => new HITSAlgorithm(graph, {tolerance: 1e-11}),
                    OptionValidationError,
                    "must be >= ",
                );
            });

            it("rejects tolerance > 0.01", async() => {
                const graph = await createMockGraph();
                assert.throws(
                    () => new HITSAlgorithm(graph, {tolerance: 0.1}),
                    OptionValidationError,
                    "must be <= 0.01",
                );
            });
        });

        describe("custom options in run()", () => {
            it("uses custom maxIterations", async() => {
                const graph = await createMockGraph({
                    nodes: [{id: "A"}, {id: "B"}, {id: "C"}],
                    edges: [
                        {srcId: "A", dstId: "B"},
                        {srcId: "B", dstId: "C"},
                        {srcId: "C", dstId: "A"},
                    ],
                });
                // Run with reduced iterations
                const algo = new HITSAlgorithm(graph, {maxIterations: 5});
                await algo.run();

                // Verify scores were calculated
                const hubScore = getNodeResult(graph, "A", "graphty", "hits", "hubScore");
                assert.isDefined(hubScore);
            });
        });

        describe("registry integration", () => {
            it("can be retrieved from registry with options", () => {
                const AlgoClass = Algorithm.getClass("graphty", "hits");
                assert.isNotNull(AlgoClass);
                assert.isTrue(AlgoClass.hasOptions());
                assert.isDefined(AlgoClass.getOptionsSchema().maxIterations);
                assert.isDefined(AlgoClass.getOptionsSchema().tolerance);
            });
        });
    });
});
