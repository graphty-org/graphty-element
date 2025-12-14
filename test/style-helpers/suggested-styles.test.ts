import {assert, describe, it} from "vitest";

import {Algorithm} from "../../src/algorithms/Algorithm";
import {DegreeAlgorithm} from "../../src/algorithms/DegreeAlgorithm";
import {AdHocData, SuggestedStylesConfig} from "../../src/config";

// DegreeAlgorithm auto-registers when imported

interface MockGraphOpts {
    dataPath?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function mockGraph(opts: MockGraphOpts = {}): Promise<any> {
    const nodes = new Map<string | number, AdHocData>();
    const edges = new Map<string | number, AdHocData>();

    if (typeof opts.dataPath === "string") {
        const imp = await import(opts.dataPath);
        for (const n of imp.nodes) {
            nodes.set(n.id, n);
        }
        for (const e of imp.edges) {
            edges.set(`${e.srcId}:${e.dstId}`, e);
        }
    }

    const layers: unknown[] = [];
    const fakeGraph = {
        nodes,
        edges,
        getDataManager() {
            return {
                nodes,
                edges,
            };
        },
        styles: {
            layers,
        },
        styleManager: {
            clearCache(): void {
                // Mock cache clear
            },
        },
        eventManager: {
            emitGraphEvent(): void {
                // Mock event emission
            },
        },
        applySuggestedStyles(algorithmKey: string | string[]): boolean {
            const keys = Array.isArray(algorithmKey) ? algorithmKey : [algorithmKey];
            let applied = false;

            for (const key of keys) {
                const [namespace, type] = key.split(":");
                const AlgorithmClass = Algorithm.getClass(namespace, type);

                if (!AlgorithmClass || !AlgorithmClass.hasSuggestedStyles()) {
                    continue;
                }

                const suggestedStyles = AlgorithmClass.getSuggestedStyles();
                if (suggestedStyles) {
                    layers.push(... suggestedStyles.layers);
                    applied = true;
                }
            }

            return applied;
        },
        getSuggestedStyles(algorithmKey: string): SuggestedStylesConfig | null {
            const [namespace, type] = algorithmKey.split(":");
            const AlgorithmClass = Algorithm.getClass(namespace, type);
            return AlgorithmClass?.getSuggestedStyles() ?? null;
        },
    };

    return fakeGraph;
}

describe("Suggested Styles Infrastructure", () => {
    describe("Algorithm.hasSuggestedStyles()", () => {
        it("returns true for algorithms with suggested styles", () => {
            assert.strictEqual(DegreeAlgorithm.hasSuggestedStyles(), true);
        });

        it("returns false for algorithms without suggested styles", () => {
            class NoStylesAlgorithm extends Algorithm {
                static namespace = "test";
                static type = "nostyles";
                async run(): Promise<void> {
                    // No-op
                }
            }

            assert.strictEqual(NoStylesAlgorithm.hasSuggestedStyles(), false);
        });
    });

    describe("Algorithm.getSuggestedStyles()", () => {
        it("returns config for algorithms with suggested styles", () => {
            const styles = DegreeAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.ok(Array.isArray(styles.layers));
            assert.strictEqual(styles.layers.length, 1);
            assert.strictEqual(styles.category, "node-metric");
        });

        it("returns null for algorithms without suggested styles", () => {
            class NoStylesAlgorithm extends Algorithm {
                static namespace = "test";
                static type = "nostyles";
                async run(): Promise<void> {
                    // No-op
                }
            }

            assert.strictEqual(NoStylesAlgorithm.getSuggestedStyles(), null);
        });
    });

    describe("Algorithm.getClass()", () => {
        it("returns registered algorithm class", () => {
            const AlgClass = Algorithm.getClass("graphty", "degree");
            assert.ok(AlgClass);
            assert.strictEqual(AlgClass, DegreeAlgorithm);
        });

        it("returns null for unregistered algorithm", () => {
            const AlgClass = Algorithm.getClass("nonexistent", "algorithm");
            assert.strictEqual(AlgClass, null);
        });
    });
});

describe("DegreeAlgorithm Suggested Styles", () => {
    it("has suggested styles defined", () => {
        assert.strictEqual(DegreeAlgorithm.hasSuggestedStyles(), true);
    });

    it("returns correct suggested styles structure", () => {
        const styles = DegreeAlgorithm.getSuggestedStyles();

        assert.ok(styles);
        assert.ok(styles.description);
        assert.strictEqual(styles.category, "node-metric");
        assert.ok(Array.isArray(styles.layers));
        assert.strictEqual(styles.layers.length, 1);
    });

    it("layer has correct node calculatedStyle configuration", () => {
        const styles = DegreeAlgorithm.getSuggestedStyles();
        assert.ok(styles);

        const layer = styles.layers[0];
        assert.ok(layer);
        assert.ok(layer.node);
        assert.ok(layer.node.calculatedStyle);

        const {calculatedStyle} = layer.node;
        assert.deepStrictEqual(calculatedStyle.inputs, ["algorithmResults.graphty.degree.degreePct"]);
        assert.strictEqual(calculatedStyle.output, "style.texture.color");
        assert.ok(calculatedStyle.expr.includes("arguments[0]"));
    });

    it("layer has metadata", () => {
        const styles = DegreeAlgorithm.getSuggestedStyles();
        assert.ok(styles);

        const layer = styles.layers[0];
        assert.ok(layer);
        assert.ok(layer.metadata);
        assert.strictEqual(layer.metadata.name, "Degree - Viridis Gradient");
        assert.ok(layer.metadata.description);
    });
});

describe("Graph.getSuggestedStyles()", () => {
    it("returns suggested styles for registered algorithm", async() => {
        const graph = await mockGraph();
        const styles = graph.getSuggestedStyles("graphty:degree");

        assert.ok(styles);
        assert.strictEqual(styles.category, "node-metric");
        assert.strictEqual(styles.layers.length, 1);
    });

    it("returns null for algorithm without suggested styles", async() => {
        const graph = await mockGraph();
        const styles = graph.getSuggestedStyles("nonexistent:algorithm");

        assert.strictEqual(styles, null);
    });
});

describe("Graph.applySuggestedStyles()", () => {
    it("applies suggested styles from single algorithm", async() => {
        const graph = await mockGraph();
        const applied = graph.applySuggestedStyles("graphty:degree");

        assert.strictEqual(applied, true);
        assert.strictEqual(graph.styles.layers.length, 1);

        const layer = graph.styles.layers[0];
        assert.ok(layer);
        assert.ok(layer.node);
        assert.ok(layer.node.calculatedStyle);
    });

    it("applies suggested styles from multiple algorithms", async() => {
        const graph = await mockGraph();

        // Register a second test algorithm with suggested styles
        class TestAlgorithm extends Algorithm {
            static namespace = "test";
            static type = "test";
            static suggestedStyles = (): SuggestedStylesConfig => ({
                layers: [{
                    node: {
                        selector: "",
                        style: {
                            enabled: true,
                        },
                    },
                    metadata: {
                        name: "Test Layer",
                    },
                }],
                description: "Test styles",
            });

            async run(): Promise<void> {
                // No-op
            }
        }

        Algorithm.register(TestAlgorithm);

        const applied = graph.applySuggestedStyles(["graphty:degree", "test:test"]);

        assert.strictEqual(applied, true);
        assert.strictEqual(graph.styles.layers.length, 2);
    });

    it("returns false when no algorithms have suggested styles", async() => {
        const graph = await mockGraph();
        const applied = graph.applySuggestedStyles("nonexistent:algorithm");

        assert.strictEqual(applied, false);
        assert.strictEqual(graph.styles.layers.length, 0);
    });

    it("handles empty algorithm key array", async() => {
        const graph = await mockGraph();
        const applied = graph.applySuggestedStyles([]);

        assert.strictEqual(applied, false);
        assert.strictEqual(graph.styles.layers.length, 0);
    });
});

describe("Integration: DegreeAlgorithm with Suggested Styles", () => {
    it("applies suggested styles to graph after algorithm run", async() => {
        const fakeGraph = await mockGraph({dataPath: "../helpers/data4.json"});
        const da = new DegreeAlgorithm(fakeGraph);

        // Run algorithm
        await da.run();

        // Verify algorithm results exist
        const node = fakeGraph.nodes.get("Mlle.Baptistine");

        assert.ok(node);
        assert.ok(node.algorithmResults);
        assert.ok(node.algorithmResults.graphty);
        assert.ok(node.algorithmResults.graphty.degree);
        assert.ok(typeof node.algorithmResults.graphty.degree.degreePct === "number");

        // Apply suggested styles
        const applied = fakeGraph.applySuggestedStyles("graphty:degree");
        assert.strictEqual(applied, true);

        // Verify styles were added
        assert.strictEqual(fakeGraph.styles.layers.length, 1);
        const layer = fakeGraph.styles.layers[0];
        assert.ok(layer.node);
        assert.ok(layer.node.calculatedStyle);

        // Verify calculatedStyle references the correct algorithm result
        const {inputs} = layer.node.calculatedStyle;
        assert.deepStrictEqual(inputs, ["algorithmResults.graphty.degree.degreePct"]);
    });
});
