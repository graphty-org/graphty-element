/* eslint-disable @typescript-eslint/no-deprecated -- Testing legacy backward-compatible API */
import {assert, describe, it} from "vitest";

import {Algorithm} from "../../../src/algorithms/Algorithm";
import {BFSAlgorithm} from "../../../src/algorithms/BFSAlgorithm";
import {DFSAlgorithm} from "../../../src/algorithms/DFSAlgorithm";
import {DijkstraAlgorithm} from "../../../src/algorithms/DijkstraAlgorithm";
import {MaxFlowAlgorithm} from "../../../src/algorithms/MaxFlowAlgorithm";
import {MinCutAlgorithm} from "../../../src/algorithms/MinCutAlgorithm";
import {OptionValidationError} from "../../../src/algorithms/types/OptionSchema";
import {createMockGraph, getGraphResult, getNodeResult} from "../../helpers/mockGraph";

describe("Traversal & Path Algorithm Options", () => {
    describe("BFSAlgorithm", () => {
        describe("options schema", () => {
            it("has options defined", () => {
                assert.isTrue(BFSAlgorithm.hasOptions());
            });

            it("has source option", () => {
                const schema = BFSAlgorithm.getOptionsSchema();
                assert.isDefined(schema.source);
                assert.strictEqual(schema.source.type, "nodeId");
                assert.strictEqual(schema.source.default, null);
                assert.strictEqual(schema.source.required, false);
            });
        });

        describe("option defaults", () => {
            it("uses first node as source when none provided", async() => {
                const graph = await createMockGraph({
                    nodes: [{id: "A"}, {id: "B"}, {id: "C"}],
                    edges: [
                        {srcId: "A", dstId: "B"},
                        {srcId: "B", dstId: "C"},
                    ],
                });
                const algo = new BFSAlgorithm(graph);
                await algo.run();

                // Node A should be level 0 (it's the source)
                const levelA = getNodeResult(graph, "A", "graphty", "bfs", "level");
                assert.strictEqual(levelA, 0);
            });
        });

        describe("option validation", () => {
            it("accepts valid string source", async() => {
                const graph = await createMockGraph({
                    nodes: [{id: "A"}, {id: "B"}],
                    edges: [{srcId: "A", dstId: "B"}],
                });
                assert.doesNotThrow(() => new BFSAlgorithm(graph, {source: "B"}));
            });

            it("accepts valid number source", async() => {
                const graph = await createMockGraph({
                    nodes: [{id: 1}, {id: 2}],
                    edges: [{srcId: 1, dstId: 2}],
                });
                assert.doesNotThrow(() => new BFSAlgorithm(graph, {source: 2}));
            });

            it("rejects invalid source type", async() => {
                const graph = await createMockGraph();
                assert.throws(
                    // @ts-expect-error Testing invalid type
                    () => new BFSAlgorithm(graph, {source: {invalid: true}}),
                    OptionValidationError,
                    "must be a string or number",
                );
            });
        });

        describe("custom options in run()", () => {
            it("uses custom source node", async() => {
                const graph = await createMockGraph({
                    nodes: [{id: "A"}, {id: "B"}, {id: "C"}],
                    edges: [
                        {srcId: "A", dstId: "B"},
                        {srcId: "B", dstId: "C"},
                    ],
                });
                // Use B as source instead of A
                const algo = new BFSAlgorithm(graph, {source: "B"});
                await algo.run();

                // Node B should be level 0 (it's the custom source)
                const levelB = getNodeResult(graph, "B", "graphty", "bfs", "level");
                assert.strictEqual(levelB, 0);

                // Node A should be level 1
                const levelA = getNodeResult(graph, "A", "graphty", "bfs", "level");
                assert.strictEqual(levelA, 1);
            });
        });

        describe("backward compatibility", () => {
            it("configure() method still works", async() => {
                const graph = await createMockGraph({
                    nodes: [{id: "A"}, {id: "B"}, {id: "C"}],
                    edges: [
                        {srcId: "A", dstId: "B"},
                        {srcId: "B", dstId: "C"},
                    ],
                });
                const algo = new BFSAlgorithm(graph);

                algo.configure({source: "B"});
                await algo.run();

                // Node B should be level 0
                const levelB = getNodeResult(graph, "B", "graphty", "bfs", "level");
                assert.strictEqual(levelB, 0);
            });
        });

        describe("registry integration", () => {
            it("can be retrieved from registry with options", () => {
                const AlgoClass = Algorithm.getClass("graphty", "bfs");
                assert.isNotNull(AlgoClass);
                assert.isTrue(AlgoClass.hasOptions());
                assert.isDefined(AlgoClass.getOptionsSchema().source);
            });
        });
    });

    describe("DFSAlgorithm", () => {
        describe("options schema", () => {
            it("has options defined", () => {
                assert.isTrue(DFSAlgorithm.hasOptions());
            });

            it("has source option", () => {
                const schema = DFSAlgorithm.getOptionsSchema();
                assert.isDefined(schema.source);
                assert.strictEqual(schema.source.type, "nodeId");
                assert.strictEqual(schema.source.default, null);
                assert.strictEqual(schema.source.required, false);
            });
        });

        describe("option defaults", () => {
            it("uses first node as source when none provided", async() => {
                const graph = await createMockGraph({
                    nodes: [{id: "A"}, {id: "B"}, {id: "C"}],
                    edges: [
                        {srcId: "A", dstId: "B"},
                        {srcId: "B", dstId: "C"},
                    ],
                });
                const algo = new DFSAlgorithm(graph);
                await algo.run();

                // Node A should be discovery time 0 (it's the source)
                const timeA = getNodeResult(graph, "A", "graphty", "dfs", "discoveryTime");
                assert.strictEqual(timeA, 0);
            });
        });

        describe("option validation", () => {
            it("accepts valid string source", async() => {
                const graph = await createMockGraph({
                    nodes: [{id: "A"}, {id: "B"}],
                    edges: [{srcId: "A", dstId: "B"}],
                });
                assert.doesNotThrow(() => new DFSAlgorithm(graph, {source: "B"}));
            });

            it("accepts valid number source", async() => {
                const graph = await createMockGraph({
                    nodes: [{id: 1}, {id: 2}],
                    edges: [{srcId: 1, dstId: 2}],
                });
                assert.doesNotThrow(() => new DFSAlgorithm(graph, {source: 2}));
            });

            it("rejects invalid source type", async() => {
                const graph = await createMockGraph();
                assert.throws(
                    // @ts-expect-error Testing invalid type
                    () => new DFSAlgorithm(graph, {source: {invalid: true}}),
                    OptionValidationError,
                    "must be a string or number",
                );
            });
        });

        describe("custom options in run()", () => {
            it("uses custom source node", async() => {
                const graph = await createMockGraph({
                    nodes: [{id: "A"}, {id: "B"}, {id: "C"}],
                    edges: [
                        {srcId: "A", dstId: "B"},
                        {srcId: "B", dstId: "C"},
                    ],
                });
                // Use B as source instead of A
                const algo = new DFSAlgorithm(graph, {source: "B"});
                await algo.run();

                // Node B should be discovery time 0 (it's the custom source)
                const timeB = getNodeResult(graph, "B", "graphty", "dfs", "discoveryTime");
                assert.strictEqual(timeB, 0);
            });
        });

        describe("backward compatibility", () => {
            it("configure() method still works", async() => {
                const graph = await createMockGraph({
                    nodes: [{id: "A"}, {id: "B"}, {id: "C"}],
                    edges: [
                        {srcId: "A", dstId: "B"},
                        {srcId: "B", dstId: "C"},
                    ],
                });
                const algo = new DFSAlgorithm(graph);

                algo.configure({source: "B"});
                await algo.run();

                // Node B should be discovery time 0
                const timeB = getNodeResult(graph, "B", "graphty", "dfs", "discoveryTime");
                assert.strictEqual(timeB, 0);
            });
        });

        describe("registry integration", () => {
            it("can be retrieved from registry with options", () => {
                const AlgoClass = Algorithm.getClass("graphty", "dfs");
                assert.isNotNull(AlgoClass);
                assert.isTrue(AlgoClass.hasOptions());
                assert.isDefined(AlgoClass.getOptionsSchema().source);
            });
        });
    });

    describe("DijkstraAlgorithm", () => {
        describe("options schema", () => {
            it("has options defined", () => {
                assert.isTrue(DijkstraAlgorithm.hasOptions());
            });

            it("has source option", () => {
                const schema = DijkstraAlgorithm.getOptionsSchema();
                assert.isDefined(schema.source);
                assert.strictEqual(schema.source.type, "nodeId");
                assert.strictEqual(schema.source.default, null);
                assert.strictEqual(schema.source.required, false);
            });

            it("has target option", () => {
                const schema = DijkstraAlgorithm.getOptionsSchema();
                assert.isDefined(schema.target);
                assert.strictEqual(schema.target.type, "nodeId");
                assert.strictEqual(schema.target.default, null);
                assert.strictEqual(schema.target.required, false);
            });
        });

        describe("option defaults", () => {
            it("uses first and last nodes when none provided", async() => {
                const graph = await createMockGraph({
                    nodes: [{id: "A"}, {id: "B"}, {id: "C"}],
                    edges: [
                        {srcId: "A", dstId: "B"},
                        {srcId: "B", dstId: "C"},
                    ],
                });
                const algo = new DijkstraAlgorithm(graph);
                await algo.run();

                // A should be in path (it's the source)
                const isInPathA = getNodeResult(graph, "A", "graphty", "dijkstra", "isInPath");
                assert.isTrue(isInPathA);

                // C should be in path (it's the default target - last node)
                const isInPathC = getNodeResult(graph, "C", "graphty", "dijkstra", "isInPath");
                assert.isTrue(isInPathC);
            });
        });

        describe("option validation", () => {
            it("accepts valid string source and target", async() => {
                const graph = await createMockGraph({
                    nodes: [{id: "A"}, {id: "B"}],
                    edges: [{srcId: "A", dstId: "B"}],
                });
                assert.doesNotThrow(() => new DijkstraAlgorithm(graph, {source: "A", target: "B"}));
            });

            it("accepts valid number source and target", async() => {
                const graph = await createMockGraph({
                    nodes: [{id: 1}, {id: 2}],
                    edges: [{srcId: 1, dstId: 2}],
                });
                assert.doesNotThrow(() => new DijkstraAlgorithm(graph, {source: 1, target: 2}));
            });

            it("rejects invalid source type", async() => {
                const graph = await createMockGraph();
                assert.throws(
                    // @ts-expect-error Testing invalid type
                    () => new DijkstraAlgorithm(graph, {source: {invalid: true}}),
                    OptionValidationError,
                    "must be a string or number",
                );
            });

            it("rejects invalid target type", async() => {
                const graph = await createMockGraph();
                assert.throws(
                    // @ts-expect-error Testing invalid type
                    () => new DijkstraAlgorithm(graph, {target: {invalid: true}}),
                    OptionValidationError,
                    "must be a string or number",
                );
            });
        });

        describe("custom options in run()", () => {
            it("uses custom source and target", async() => {
                const graph = await createMockGraph({
                    nodes: [{id: "A"}, {id: "B"}, {id: "C"}, {id: "D"}],
                    edges: [
                        {srcId: "A", dstId: "B"},
                        {srcId: "B", dstId: "C"},
                        {srcId: "C", dstId: "D"},
                    ],
                });
                // Use B as source and C as target
                const algo = new DijkstraAlgorithm(graph, {source: "B", target: "C"});
                await algo.run();

                // B should be in path
                const isInPathB = getNodeResult(graph, "B", "graphty", "dijkstra", "isInPath");
                assert.isTrue(isInPathB);

                // C should be in path
                const isInPathC = getNodeResult(graph, "C", "graphty", "dijkstra", "isInPath");
                assert.isTrue(isInPathC);

                // A and D should NOT be in path
                const isInPathA = getNodeResult(graph, "A", "graphty", "dijkstra", "isInPath");
                assert.isFalse(isInPathA);
                const isInPathD = getNodeResult(graph, "D", "graphty", "dijkstra", "isInPath");
                assert.isFalse(isInPathD);
            });
        });

        describe("backward compatibility", () => {
            it("configure() method still works", async() => {
                const graph = await createMockGraph({
                    nodes: [{id: "A"}, {id: "B"}, {id: "C"}],
                    edges: [
                        {srcId: "A", dstId: "B"},
                        {srcId: "B", dstId: "C"},
                    ],
                });
                const algo = new DijkstraAlgorithm(graph);

                algo.configure({source: "B", target: "C"});
                await algo.run();

                // B should be in path
                const isInPathB = getNodeResult(graph, "B", "graphty", "dijkstra", "isInPath");
                assert.isTrue(isInPathB);
            });
        });

        describe("registry integration", () => {
            it("can be retrieved from registry with options", () => {
                const AlgoClass = Algorithm.getClass("graphty", "dijkstra");
                assert.isNotNull(AlgoClass);
                assert.isTrue(AlgoClass.hasOptions());
                assert.isDefined(AlgoClass.getOptionsSchema().source);
                assert.isDefined(AlgoClass.getOptionsSchema().target);
            });
        });
    });

    describe("MaxFlowAlgorithm", () => {
        describe("options schema", () => {
            it("has options defined", () => {
                assert.isTrue(MaxFlowAlgorithm.hasOptions());
            });

            it("has source option", () => {
                const schema = MaxFlowAlgorithm.getOptionsSchema();
                assert.isDefined(schema.source);
                assert.strictEqual(schema.source.type, "nodeId");
                assert.strictEqual(schema.source.default, null);
                assert.strictEqual(schema.source.required, false);
            });

            it("has sink option", () => {
                const schema = MaxFlowAlgorithm.getOptionsSchema();
                assert.isDefined(schema.sink);
                assert.strictEqual(schema.sink.type, "nodeId");
                assert.strictEqual(schema.sink.default, null);
                assert.strictEqual(schema.sink.required, false);
            });
        });

        describe("option defaults", () => {
            it("uses first and last nodes when none provided", async() => {
                const graph = await createMockGraph({
                    nodes: [{id: "A"}, {id: "B"}, {id: "C"}],
                    edges: [
                        {srcId: "A", dstId: "B", value: 5},
                        {srcId: "B", dstId: "C", value: 3},
                    ],
                });
                const algo = new MaxFlowAlgorithm(graph);
                await algo.run();

                // A should be marked as source
                const isSourceA = getNodeResult(graph, "A", "graphty", "max-flow", "isSource");
                assert.isTrue(isSourceA);

                // C should be marked as sink
                const isSinkC = getNodeResult(graph, "C", "graphty", "max-flow", "isSink");
                assert.isTrue(isSinkC);
            });
        });

        describe("option validation", () => {
            it("accepts valid string source and sink", async() => {
                const graph = await createMockGraph({
                    nodes: [{id: "A"}, {id: "B"}],
                    edges: [{srcId: "A", dstId: "B"}],
                });
                assert.doesNotThrow(() => new MaxFlowAlgorithm(graph, {source: "A", sink: "B"}));
            });

            it("accepts valid number source and sink", async() => {
                const graph = await createMockGraph({
                    nodes: [{id: 1}, {id: 2}],
                    edges: [{srcId: 1, dstId: 2}],
                });
                assert.doesNotThrow(() => new MaxFlowAlgorithm(graph, {source: 1, sink: 2}));
            });

            it("rejects invalid source type", async() => {
                const graph = await createMockGraph();
                assert.throws(
                    // @ts-expect-error Testing invalid type
                    () => new MaxFlowAlgorithm(graph, {source: {invalid: true}}),
                    OptionValidationError,
                    "must be a string or number",
                );
            });

            it("rejects invalid sink type", async() => {
                const graph = await createMockGraph();
                assert.throws(
                    // @ts-expect-error Testing invalid type
                    () => new MaxFlowAlgorithm(graph, {sink: {invalid: true}}),
                    OptionValidationError,
                    "must be a string or number",
                );
            });
        });

        describe("custom options in run()", () => {
            it("uses custom source and sink", async() => {
                const graph = await createMockGraph({
                    nodes: [{id: "A"}, {id: "B"}, {id: "C"}],
                    edges: [
                        {srcId: "A", dstId: "B", value: 5},
                        {srcId: "B", dstId: "C", value: 3},
                    ],
                });
                // Use B as source and C as sink
                const algo = new MaxFlowAlgorithm(graph, {source: "B", sink: "C"});
                await algo.run();

                // B should be marked as source
                const isSourceB = getNodeResult(graph, "B", "graphty", "max-flow", "isSource");
                assert.isTrue(isSourceB);

                // C should be marked as sink
                const isSinkC = getNodeResult(graph, "C", "graphty", "max-flow", "isSink");
                assert.isTrue(isSinkC);

                // A should NOT be source
                const isSourceA = getNodeResult(graph, "A", "graphty", "max-flow", "isSource");
                assert.isFalse(isSourceA);
            });
        });

        describe("backward compatibility", () => {
            it("configure() method still works", async() => {
                const graph = await createMockGraph({
                    nodes: [{id: "A"}, {id: "B"}, {id: "C"}],
                    edges: [
                        {srcId: "A", dstId: "B", value: 5},
                        {srcId: "B", dstId: "C", value: 3},
                    ],
                });
                const algo = new MaxFlowAlgorithm(graph);

                algo.configure({source: "B", sink: "C"});
                await algo.run();

                // B should be marked as source
                const isSourceB = getNodeResult(graph, "B", "graphty", "max-flow", "isSource");
                assert.isTrue(isSourceB);
            });
        });

        describe("registry integration", () => {
            it("can be retrieved from registry with options", () => {
                const AlgoClass = Algorithm.getClass("graphty", "max-flow");
                assert.isNotNull(AlgoClass);
                assert.isTrue(AlgoClass.hasOptions());
                assert.isDefined(AlgoClass.getOptionsSchema().source);
                assert.isDefined(AlgoClass.getOptionsSchema().sink);
            });
        });
    });

    describe("MinCutAlgorithm", () => {
        describe("options schema", () => {
            it("has options defined", () => {
                assert.isTrue(MinCutAlgorithm.hasOptions());
            });

            it("has source option", () => {
                const schema = MinCutAlgorithm.getOptionsSchema();
                assert.isDefined(schema.source);
                assert.strictEqual(schema.source.type, "nodeId");
                assert.strictEqual(schema.source.default, null);
                assert.strictEqual(schema.source.required, false);
            });

            it("has sink option", () => {
                const schema = MinCutAlgorithm.getOptionsSchema();
                assert.isDefined(schema.sink);
                assert.strictEqual(schema.sink.type, "nodeId");
                assert.strictEqual(schema.sink.default, null);
                assert.strictEqual(schema.sink.required, false);
            });

            it("has useGlobalMinCut option", () => {
                const schema = MinCutAlgorithm.getOptionsSchema();
                assert.isDefined(schema.useGlobalMinCut);
                assert.strictEqual(schema.useGlobalMinCut.type, "boolean");
                assert.strictEqual(schema.useGlobalMinCut.default, false);
            });
        });

        describe("option defaults", () => {
            it("uses global min cut when no source/sink provided", async() => {
                const graph = await createMockGraph({
                    nodes: [{id: "A"}, {id: "B"}, {id: "C"}, {id: "D"}],
                    edges: [
                        {srcId: "A", dstId: "B", value: 5},
                        {srcId: "B", dstId: "C", value: 1},
                        {srcId: "C", dstId: "D", value: 5},
                    ],
                });
                const algo = new MinCutAlgorithm(graph);
                await algo.run();

                // Cut value should be computed
                const cutValue = getGraphResult(graph, "graphty", "min-cut", "cutValue");
                assert.isDefined(cutValue);
                assert.isNumber(cutValue);
            });
        });

        describe("option validation", () => {
            it("accepts valid string source and sink", async() => {
                const graph = await createMockGraph({
                    nodes: [{id: "A"}, {id: "B"}],
                    edges: [{srcId: "A", dstId: "B"}],
                });
                assert.doesNotThrow(() => new MinCutAlgorithm(graph, {source: "A", sink: "B"}));
            });

            it("accepts valid number source and sink", async() => {
                const graph = await createMockGraph({
                    nodes: [{id: 1}, {id: 2}],
                    edges: [{srcId: 1, dstId: 2}],
                });
                assert.doesNotThrow(() => new MinCutAlgorithm(graph, {source: 1, sink: 2}));
            });

            it("accepts useGlobalMinCut boolean", async() => {
                const graph = await createMockGraph();
                assert.doesNotThrow(() => new MinCutAlgorithm(graph, {useGlobalMinCut: true}));
            });

            it("rejects invalid source type", async() => {
                const graph = await createMockGraph();
                assert.throws(
                    // @ts-expect-error Testing invalid type
                    () => new MinCutAlgorithm(graph, {source: {invalid: true}}),
                    OptionValidationError,
                    "must be a string or number",
                );
            });

            it("rejects invalid sink type", async() => {
                const graph = await createMockGraph();
                assert.throws(
                    // @ts-expect-error Testing invalid type
                    () => new MinCutAlgorithm(graph, {sink: {invalid: true}}),
                    OptionValidationError,
                    "must be a string or number",
                );
            });

            it("rejects invalid useGlobalMinCut type", async() => {
                const graph = await createMockGraph();
                assert.throws(
                    // @ts-expect-error Testing invalid type
                    () => new MinCutAlgorithm(graph, {useGlobalMinCut: "yes"}),
                    OptionValidationError,
                    "must be a boolean",
                );
            });
        });

        describe("custom options in run()", () => {
            it("uses custom source and sink for s-t cut", async() => {
                const graph = await createMockGraph({
                    nodes: [{id: "A"}, {id: "B"}, {id: "C"}],
                    edges: [
                        {srcId: "A", dstId: "B", value: 5},
                        {srcId: "B", dstId: "C", value: 3},
                    ],
                });
                // Use A as source and C as sink
                const algo = new MinCutAlgorithm(graph, {source: "A", sink: "C"});
                await algo.run();

                // Cut value should be computed
                const cutValue = getGraphResult(graph, "graphty", "min-cut", "cutValue");
                assert.isDefined(cutValue);
            });

            it("uses global min cut when explicitly set", async() => {
                const graph = await createMockGraph({
                    nodes: [{id: "A"}, {id: "B"}, {id: "C"}, {id: "D"}],
                    edges: [
                        {srcId: "A", dstId: "B", value: 5},
                        {srcId: "B", dstId: "C", value: 1},
                        {srcId: "C", dstId: "D", value: 5},
                    ],
                });
                const algo = new MinCutAlgorithm(graph, {useGlobalMinCut: true});
                await algo.run();

                // Cut value should be computed using Stoer-Wagner
                const cutValue = getGraphResult(graph, "graphty", "min-cut", "cutValue");
                assert.isDefined(cutValue);
            });
        });

        describe("backward compatibility", () => {
            it("configure() method still works", async() => {
                const graph = await createMockGraph({
                    nodes: [{id: "A"}, {id: "B"}, {id: "C"}],
                    edges: [
                        {srcId: "A", dstId: "B", value: 5},
                        {srcId: "B", dstId: "C", value: 3},
                    ],
                });
                const algo = new MinCutAlgorithm(graph);

                algo.configure({source: "A", sink: "C"});
                await algo.run();

                // Cut value should be computed
                const cutValue = getGraphResult(graph, "graphty", "min-cut", "cutValue");
                assert.isDefined(cutValue);
            });
        });

        describe("registry integration", () => {
            it("can be retrieved from registry with options", () => {
                const AlgoClass = Algorithm.getClass("graphty", "min-cut");
                assert.isNotNull(AlgoClass);
                assert.isTrue(AlgoClass.hasOptions());
                assert.isDefined(AlgoClass.getOptionsSchema().source);
                assert.isDefined(AlgoClass.getOptionsSchema().sink);
                assert.isDefined(AlgoClass.getOptionsSchema().useGlobalMinCut);
            });
        });
    });
});
