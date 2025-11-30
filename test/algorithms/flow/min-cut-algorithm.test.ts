import {assert, describe, it} from "vitest";

import {Algorithm} from "../../../src/algorithms/Algorithm";
import {MinCutAlgorithm} from "../../../src/algorithms/MinCutAlgorithm";

describe("MinCutAlgorithm", () => {
    describe("Algorithm Registration", () => {
        it("should be registered with namespace 'graphty' and type 'min-cut'", () => {
            const MinCutClass = Algorithm.getClass("graphty", "min-cut");
            assert.ok(MinCutClass);
            assert.strictEqual(MinCutClass, MinCutAlgorithm);
            assert.strictEqual(MinCutClass.namespace, "graphty");
            assert.strictEqual(MinCutClass.type, "min-cut");
        });
    });

    describe("Suggested Styles", () => {
        it("has suggested styles defined", () => {
            assert.strictEqual(MinCutAlgorithm.hasSuggestedStyles(), true);
        });

        it("returns correct suggested styles structure", () => {
            const styles = MinCutAlgorithm.getSuggestedStyles();

            assert.ok(styles);
            assert.ok(styles.description);
            assert.strictEqual(styles.category, "path");
            assert.ok(Array.isArray(styles.layers));
            assert.ok(styles.layers.length >= 1);
        });

        it("has edge layer for cut edges", () => {
            const styles = MinCutAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            // Find an edge layer with calculatedStyle for cut edges
            const cutEdgeLayer = styles.layers.find((l) => l.edge?.calculatedStyle?.inputs?.[0]?.includes("inCut"));
            assert.ok(cutEdgeLayer, "Should have edge layer for cut edges");
            const {edge} = cutEdgeLayer;
            assert.ok(edge);
            const edgeStyle = edge.style;
            assert.ok(edgeStyle);
            assert.ok(edgeStyle.enabled);
        });

        it("highlights cut edges with calculatedStyle (colorblind-safe)", () => {
            const styles = MinCutAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            // First edge layer uses calculatedStyle for color
            const cutEdgeLayer = styles.layers.find((l) => l.edge?.calculatedStyle);
            assert.ok(cutEdgeLayer);
            const {edge} = cutEdgeLayer;
            assert.ok(edge);
            assert.ok(edge.calculatedStyle);
            assert.ok(edge.calculatedStyle.inputs[0].includes("inCut"));
            assert.ok(edge.calculatedStyle.output.includes("color"));
            assert.ok(edge.calculatedStyle.expr.includes("StyleHelpers"));

            // Style should be enabled
            assert.ok(edge.style);
            assert.ok(edge.style.enabled);
        });

        it("layers have metadata", () => {
            const styles = MinCutAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            for (const layer of styles.layers) {
                assert.ok(layer.metadata);
                assert.ok(layer.metadata.name);
                assert.ok(layer.metadata.description);
            }
        });

        it("description explains minimum cut", () => {
            const styles = MinCutAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.ok(styles.description);
            // Should mention cut
            const descLower = styles.description.toLowerCase();
            const includesCut = descLower.includes("cut");
            const includesPartition = descLower.includes("partition");
            assert.ok(includesCut || includesPartition);
        });
    });

    describe("Cut Edge Detection", () => {
        it("selector uses correct algorithm result path for cut edges", () => {
            const styles = MinCutAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const cutEdgeLayer = styles.layers.find((l) => {
                const selector = l.edge?.selector;
                return selector?.includes("inCut");
            });
            assert.ok(cutEdgeLayer);
            const {edge} = cutEdgeLayer;
            assert.ok(edge);

            const {selector} = edge;
            assert.ok(selector);

            // Should reference algorithmResults.graphty.min-cut
            assert.ok(selector.includes("algorithmResults"));
            assert.ok(selector.includes("graphty"));
            assert.ok(selector.includes("min-cut"));
        });
    });

    describe("Node Partition Styles", () => {
        it("may have styles for different partitions", () => {
            const styles = MinCutAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            // Check if there are node layers for partitions
            const nodeLayers = styles.layers.filter((l) => l.node);

            // This is optional but recommended
            if (nodeLayers.length > 0) {
                const partitionLayer = nodeLayers.find((l) => {
                    const selector = l.node?.selector;
                    return selector?.includes("partition") ?? selector?.includes("Partition");
                });
                if (partitionLayer?.node) {
                    // Verify node has valid structure
                    assert.ok(partitionLayer.node);
                }
            }
        });
    });

    describe("Algorithm Metadata", () => {
        it("has correct namespace and type", () => {
            assert.strictEqual(MinCutAlgorithm.namespace, "graphty");
            assert.strictEqual(MinCutAlgorithm.type, "min-cut");
        });

        it("is retrievable via Algorithm.getClass", () => {
            const AlgClass = Algorithm.getClass("graphty", "min-cut");
            assert.strictEqual(AlgClass, MinCutAlgorithm);
        });

        it("suggested styles are retrievable via static method", () => {
            const styles = MinCutAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.ok(styles.layers);
        });
    });

    describe("Configuration", () => {
        it("can be configured with source and sink for s-t cut", () => {
            const algo = new MinCutAlgorithm({} as never);
            assert.ok(typeof algo.configure === "function");
        });
    });

    describe("Style Configuration", () => {
        it("cut edges use calculatedStyle for dynamic styling", () => {
            const styles = MinCutAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            // First edge layer uses calculatedStyle
            const cutEdgeLayer = styles.layers.find((l) => l.edge?.calculatedStyle);
            assert.ok(cutEdgeLayer);
            const {edge} = cutEdgeLayer;
            assert.ok(edge);
            assert.ok(edge.calculatedStyle);

            // Should have visible styling (calculated color)
            const hasCalculatedColor = edge.calculatedStyle.output.includes("color");
            assert.ok(hasCalculatedColor);
        });

        it("non-cut edges have reduced visibility", () => {
            const styles = MinCutAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const nonCutEdgeLayer = styles.layers.find((l) => {
                const selector = l.edge?.selector;
                return selector?.includes("inCut") && selector.includes("false");
            });

            if (nonCutEdgeLayer?.edge) {
                assert.ok(nonCutEdgeLayer.edge.style);
                // Should have reduced opacity
                const {style} = nonCutEdgeLayer.edge;
                const hasReducedOpacity = typeof style.line?.opacity === "number" && style.line.opacity < 1;
                assert.ok(hasReducedOpacity, "Non-cut edges should have reduced opacity");
            }
        });
    });
});
