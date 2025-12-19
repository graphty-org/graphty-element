import {assert, describe, it} from "vitest";

import {Algorithm} from "../../../src/algorithms/Algorithm";
import {type OptionsSchema, OptionValidationError} from "../../../src/algorithms/types/OptionSchema";
import {createMockGraph} from "../../helpers/mockGraph";

/**
 * Test algorithm with options
 */
interface TestOptions extends Record<string, unknown> {
    dampingFactor: number;
    maxIterations: number;
    useCache: boolean;
}

class TestAlgorithmWithOptions extends Algorithm<TestOptions> {
    static namespace = "test";
    static type = "with-options";

    static optionsSchema: OptionsSchema = {
        dampingFactor: {
            type: "number",
            default: 0.85,
            label: "Damping Factor",
            description: "Probability of following a link",
            min: 0,
            max: 1,
            step: 0.05,
        },
        maxIterations: {
            type: "integer",
            default: 100,
            label: "Max Iterations",
            description: "Maximum iterations",
            min: 1,
            max: 1000,
            advanced: true,
        },
        useCache: {
            type: "boolean",
            default: true,
            label: "Use Cache",
            description: "Enable caching",
        },
    };

    // Expose options for testing
    getOptions(): TestOptions {
        return this.schemaOptions;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async run(): Promise<void> {
        // Store options in results for testing
        this.addGraphResult("dampingFactor", this.schemaOptions.dampingFactor);
        this.addGraphResult("maxIterations", this.schemaOptions.maxIterations);
        this.addGraphResult("useCache", this.schemaOptions.useCache);
    }
}

/**
 * Test algorithm without options (legacy pattern)
 */
class TestAlgorithmWithoutOptions extends Algorithm {
    static namespace = "test";
    static type = "without-options";

    async run(): Promise<void> {
        // No-op
    }
}

// Register test algorithms
Algorithm.register(TestAlgorithmWithOptions);
Algorithm.register(TestAlgorithmWithoutOptions);

describe("Algorithm Options", () => {
    describe("Algorithm with options schema", () => {
        it("uses default options when none provided", async() => {
            const graph = await createMockGraph();
            const algo = new TestAlgorithmWithOptions(graph);

            const opts = algo.getOptions();
            assert.strictEqual(opts.dampingFactor, 0.85);
            assert.strictEqual(opts.maxIterations, 100);
            assert.strictEqual(opts.useCache, true);
        });

        it("accepts valid custom options", async() => {
            const graph = await createMockGraph();
            const algo = new TestAlgorithmWithOptions(graph, {
                dampingFactor: 0.9,
                maxIterations: 50,
            });

            const opts = algo.getOptions();
            assert.strictEqual(opts.dampingFactor, 0.9);
            assert.strictEqual(opts.maxIterations, 50);
            assert.strictEqual(opts.useCache, true); // default
        });

        it("rejects invalid options at construction", async() => {
            const graph = await createMockGraph();

            assert.throws(
                () => new TestAlgorithmWithOptions(graph, {dampingFactor: 1.5}),
                OptionValidationError,
                "must be <= 1",
            );
        });

        it("rejects invalid option types", async() => {
            const graph = await createMockGraph();

            assert.throws(
                // @ts-expect-error - intentionally passing wrong type
                () => new TestAlgorithmWithOptions(graph, {maxIterations: "100"}),
                OptionValidationError,
                "must be a number",
            );
        });

        it("options are used in run()", async() => {
            const graph = await createMockGraph({
                nodes: [{id: "A"}],
                edges: [],
            });

            const algo = new TestAlgorithmWithOptions(graph, {
                dampingFactor: 0.75,
                maxIterations: 200,
                useCache: false,
            });

            await algo.run();

            const dm = graph.getDataManager();
            assert.strictEqual(dm.graphResults?.test?.["with-options"]?.dampingFactor, 0.75);
            assert.strictEqual(dm.graphResults?.test?.["with-options"]?.maxIterations, 200);
            assert.strictEqual(dm.graphResults?.test?.["with-options"]?.useCache, false);
        });
    });

    describe("Algorithm without options schema", () => {
        it("works with empty options", async() => {
            const graph = await createMockGraph();
            // Should not throw
            const algo = new TestAlgorithmWithoutOptions(graph);
            assert.isDefined(algo);
        });
    });

    describe("Static methods", () => {
        it("getOptionsSchema returns the schema", () => {
            const schema = TestAlgorithmWithOptions.getOptionsSchema();
            assert.isDefined(schema.dampingFactor);
            assert.strictEqual(schema.dampingFactor.type, "number");
            assert.strictEqual(schema.dampingFactor.default, 0.85);
        });

        it("hasOptions returns true for algorithms with options", () => {
            assert.isTrue(TestAlgorithmWithOptions.hasOptions());
        });

        it("hasOptions returns false for algorithms without options", () => {
            assert.isFalse(TestAlgorithmWithoutOptions.hasOptions());
        });

        it("getOptionsSchema returns empty object for algorithms without options", () => {
            const schema = TestAlgorithmWithoutOptions.getOptionsSchema();
            assert.deepStrictEqual(schema, {});
        });
    });

    describe("Algorithm.get factory", () => {
        it("creates algorithm instance via registry", async() => {
            const graph = await createMockGraph();
            const algo = Algorithm.get(graph, "test", "with-options");

            assert.isNotNull(algo);
            assert.strictEqual(algo.type, "with-options");
            assert.strictEqual(algo.namespace, "test");
        });
    });

    describe("Algorithm.getClass", () => {
        it("returns algorithm class with static methods", () => {
            const AlgoClass = Algorithm.getClass("test", "with-options");

            assert.isNotNull(AlgoClass);
            assert.isTrue(AlgoClass.hasOptions());
            assert.isDefined(AlgoClass.getOptionsSchema().dampingFactor);
        });

        it("returns null for unknown algorithm", () => {
            const AlgoClass = Algorithm.getClass("unknown", "algorithm");
            assert.isNull(AlgoClass);
        });
    });
});
