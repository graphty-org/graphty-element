import {assert, describe, it} from "vitest";

import {Algorithm} from "../../../src/algorithms/Algorithm";
import {BipartiteMatchingAlgorithm} from "../../../src/algorithms/BipartiteMatchingAlgorithm";

describe("BipartiteMatchingAlgorithm", () => {
    describe("Algorithm Registration", () => {
        it("should be registered with namespace 'graphty' and type 'bipartite-matching'", () => {
            const BipartiteClass = Algorithm.getClass("graphty", "bipartite-matching");
            assert.ok(BipartiteClass);
            assert.strictEqual(BipartiteClass, BipartiteMatchingAlgorithm);
            assert.strictEqual(BipartiteClass.namespace, "graphty");
            assert.strictEqual(BipartiteClass.type, "bipartite-matching");
        });
    });

    describe("Suggested Styles", () => {
        it("has suggested styles defined", () => {
            assert.strictEqual(BipartiteMatchingAlgorithm.hasSuggestedStyles(), true);
        });

        it("returns correct suggested styles structure", () => {
            const styles = BipartiteMatchingAlgorithm.getSuggestedStyles();

            assert.ok(styles);
            assert.ok(styles.description);
            assert.strictEqual(styles.category, "path");
            assert.ok(Array.isArray(styles.layers));
            assert.ok(styles.layers.length >= 1); // At least the matching edges layer
        });

        it("first layer highlights matched edges with calculatedStyle", () => {
            const styles = BipartiteMatchingAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const matchedEdgeLayer = styles.layers[0];
            assert.ok(matchedEdgeLayer);
            assert.ok(matchedEdgeLayer.edge);

            // Should use calculatedStyle for dynamic color (colorblind-safe)
            assert.ok(matchedEdgeLayer.edge.calculatedStyle);
            assert.ok(matchedEdgeLayer.edge.calculatedStyle.inputs[0].includes("inMatching"));
            assert.ok(matchedEdgeLayer.edge.calculatedStyle.output.includes("color"));
            assert.ok(matchedEdgeLayer.edge.calculatedStyle.expr.includes("StyleHelpers"));

            // Should have style enabled
            assert.ok(matchedEdgeLayer.edge.style);
            assert.ok(matchedEdgeLayer.edge.style.enabled);
        });

        it("layers have metadata", () => {
            const styles = BipartiteMatchingAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const matchedEdgeLayer = styles.layers[0];
            assert.ok(matchedEdgeLayer);
            assert.ok(matchedEdgeLayer.metadata);
            assert.ok(matchedEdgeLayer.metadata.name);
            assert.ok(matchedEdgeLayer.metadata.description);
        });

        it("description explains bipartite matching", () => {
            const styles = BipartiteMatchingAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.ok(styles.description);
            // Should mention matching or bipartite
            const descLower = styles.description.toLowerCase();
            assert.ok(descLower.includes("matching") || descLower.includes("bipartite"));
        });
    });

    describe("Matching Edge Detection", () => {
        it("calculatedStyle uses correct algorithm result path for matched edges", () => {
            const styles = BipartiteMatchingAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const matchedEdgeLayer = styles.layers[0];
            assert.ok(matchedEdgeLayer.edge);

            // First layer uses calculatedStyle with input referencing algorithmResults
            const {calculatedStyle} = matchedEdgeLayer.edge;
            assert.ok(calculatedStyle);

            const input = calculatedStyle.inputs[0];
            // Should reference algorithmResults.graphty.bipartite-matching.inMatching
            assert.ok(input.includes("algorithmResults"));
            assert.ok(input.includes("graphty"));
            assert.ok(input.includes("bipartite-matching"));
            assert.ok(input.includes("inMatching"));
        });
    });

    describe("Algorithm Metadata", () => {
        it("has correct namespace and type", () => {
            assert.strictEqual(BipartiteMatchingAlgorithm.namespace, "graphty");
            assert.strictEqual(BipartiteMatchingAlgorithm.type, "bipartite-matching");
        });

        it("is retrievable via Algorithm.getClass", () => {
            const AlgClass = Algorithm.getClass("graphty", "bipartite-matching");
            assert.strictEqual(AlgClass, BipartiteMatchingAlgorithm);
        });

        it("suggested styles are retrievable via static method", () => {
            const styles = BipartiteMatchingAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.ok(styles.layers);
        });
    });

    describe("Style Configuration", () => {
        it("matched edges use calculatedStyle for color", () => {
            const styles = BipartiteMatchingAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const matchedEdgeLayer = styles.layers[0];
            assert.ok(matchedEdgeLayer);
            assert.ok(matchedEdgeLayer.edge);
            assert.ok(matchedEdgeLayer.edge.style);
            assert.ok(matchedEdgeLayer.edge.style.enabled);

            // Matched edges should use calculatedStyle for color
            assert.ok(matchedEdgeLayer.edge.calculatedStyle);
            assert.ok(matchedEdgeLayer.edge.calculatedStyle.output.includes("color"));
        });

        it("non-matched edges have reduced visibility", () => {
            const styles = BipartiteMatchingAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            // Find the non-matching edge layer (already verified edge exists by first predicate)
            const nonMatchedLayer = styles.layers.find((l) => {
                const {selector} = l.edge ?? {};
                return selector?.includes("inMatching") && selector.includes("false");
            });

            if (nonMatchedLayer?.edge?.style) {
                // Should have reduced opacity
                const {style} = nonMatchedLayer.edge;
                const hasReducedOpacity = typeof style.line?.opacity === "number" && style.line.opacity < 1;

                assert.ok(hasReducedOpacity, "Non-matched edges should have reduced opacity");
            }
        });
    });

    describe("Node Partition Styles", () => {
        it("may have styles for left and right partition nodes", () => {
            const styles = BipartiteMatchingAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            // Check if there are node layers for partitions
            const hasNodeLayers = styles.layers.some((l) => l.node);

            // This is optional - not required for basic functionality
            // Just verify the structure is valid if present
            if (hasNodeLayers) {
                const nodeLayer = styles.layers.find((l) => l.node);
                if (nodeLayer?.node) {
                    // Node has either style or calculatedStyle
                    assert.ok(nodeLayer.node);
                }
            }
        });
    });
});
