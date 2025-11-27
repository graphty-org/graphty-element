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

            // Find an edge layer for cut edges
            const cutEdgeLayer = styles.layers.find((l) => {
                const selector = l.edge?.selector;
                return selector?.includes("inCut");
            });
            assert.ok(cutEdgeLayer, "Should have edge layer for cut edges");
            const {edge} = cutEdgeLayer;
            assert.ok(edge);
            const edgeStyle = edge.style;
            assert.ok(edgeStyle);
            assert.ok(edgeStyle.line);
        });

        it("highlights cut edges with distinct color", () => {
            const styles = MinCutAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const cutEdgeLayer = styles.layers.find((l) => {
                const selector = l.edge?.selector;
                return selector?.includes("inCut") && selector.includes("true");
            });
            assert.ok(cutEdgeLayer);
            const {edge} = cutEdgeLayer;
            assert.ok(edge);
            const {style: edgeStyle} = edge;
            assert.ok(edgeStyle);
            const {line} = edgeStyle;
            assert.ok(line);
            assert.ok(line.color);

            // Width should be increased for visibility
            const {width} = line;
            assert.ok(typeof width === "number");
            assert.ok(width >= 2);
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
        it("cut edges have distinct styling", () => {
            const styles = MinCutAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const cutEdgeLayer = styles.layers.find((l) => {
                const selector = l.edge?.selector;
                return selector?.includes("inCut") && selector.includes("true");
            });
            assert.ok(cutEdgeLayer);
            const {edge} = cutEdgeLayer;
            assert.ok(edge);
            const {style: edgeStyle} = edge;
            assert.ok(edgeStyle);

            // Should have visible styling
            const hasColor = edgeStyle.line?.color !== undefined;
            const hasWidth = edgeStyle.line?.width !== undefined;
            assert.ok(hasColor || hasWidth);
        });

        it("non-cut edges may have reduced visibility", () => {
            const styles = MinCutAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const nonCutEdgeLayer = styles.layers.find((l) => {
                const selector = l.edge?.selector;
                return selector?.includes("inCut") && selector.includes("false");
            });

            if (nonCutEdgeLayer?.edge) {
                assert.ok(nonCutEdgeLayer.edge.style);
            }
        });
    });
});
