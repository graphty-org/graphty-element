import {assert, describe, it} from "vitest";

import {Algorithm} from "../../../src/algorithms/Algorithm";
import {KruskalAlgorithm} from "../../../src/algorithms/KruskalAlgorithm";

describe("KruskalAlgorithm", () => {
    describe("Algorithm Registration", () => {
        it("should be registered with namespace 'graphty' and type 'kruskal'", () => {
            const KruskalClass = Algorithm.getClass("graphty", "kruskal");
            assert.ok(KruskalClass);
            assert.strictEqual(KruskalClass, KruskalAlgorithm);
            assert.strictEqual(KruskalClass.namespace, "graphty");
            assert.strictEqual(KruskalClass.type, "kruskal");
        });
    });

    describe("Suggested Styles", () => {
        it("has suggested styles defined", () => {
            assert.strictEqual(KruskalAlgorithm.hasSuggestedStyles(), true);
        });

        it("returns correct suggested styles structure", () => {
            const styles = KruskalAlgorithm.getSuggestedStyles();

            assert.ok(styles);
            assert.ok(styles.description);
            assert.strictEqual(styles.category, "path");
            assert.ok(Array.isArray(styles.layers));
            assert.strictEqual(styles.layers.length, 2); // MST edges and non-MST edges
        });

        it("first layer highlights MST edges with calculated color", () => {
            const styles = KruskalAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const mstEdgeLayer = styles.layers[0];
            assert.ok(mstEdgeLayer);
            assert.ok(mstEdgeLayer.edge);

            // Should use calculatedStyle for color (colorblind-safe)
            assert.ok(mstEdgeLayer.edge.calculatedStyle);
            assert.ok(mstEdgeLayer.edge.calculatedStyle.inputs);
            assert.ok(mstEdgeLayer.edge.calculatedStyle.inputs[0].includes("inMST"));
            assert.ok(mstEdgeLayer.edge.calculatedStyle.output.includes("color"));
            assert.ok(mstEdgeLayer.edge.calculatedStyle.expr.includes("StyleHelpers"));

            // Should have style enabled
            assert.ok(mstEdgeLayer.edge.style);
            assert.ok(mstEdgeLayer.edge.style.enabled);
        });

        it("second layer dims non-MST edges", () => {
            const styles = KruskalAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const nonMstEdgeLayer = styles.layers[1];
            assert.ok(nonMstEdgeLayer);
            assert.ok(nonMstEdgeLayer.edge);

            // Should have selector for inMST == false
            assert.ok(nonMstEdgeLayer.edge.selector);
            assert.ok(nonMstEdgeLayer.edge.selector.includes("inMST"));

            // Should have reduced opacity for non-MST edges
            assert.ok(nonMstEdgeLayer.edge.style);
        });

        it("layers have metadata", () => {
            const styles = KruskalAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            // First layer
            const mstEdgeLayer = styles.layers[0];
            assert.ok(mstEdgeLayer);
            assert.ok(mstEdgeLayer.metadata);
            assert.ok(mstEdgeLayer.metadata.name);
            assert.ok(mstEdgeLayer.metadata.description);

            // Second layer
            const nonMstEdgeLayer = styles.layers[1];
            assert.ok(nonMstEdgeLayer);
            assert.ok(nonMstEdgeLayer.metadata);
            assert.ok(nonMstEdgeLayer.metadata.name);
            assert.ok(nonMstEdgeLayer.metadata.description);
        });

        it("description explains MST visualization", () => {
            const styles = KruskalAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.ok(styles.description);
            // Should mention minimum spanning tree or MST
            const descLower = styles.description.toLowerCase();
            assert.ok(descLower.includes("minimum") || descLower.includes("mst") || descLower.includes("spanning"));
        });
    });

    describe("MST Edge Detection", () => {
        it("calculatedStyle uses correct algorithm result path for MST edges", () => {
            const styles = KruskalAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const mstEdgeLayer = styles.layers[0];
            assert.ok(mstEdgeLayer.edge);

            // First layer uses calculatedStyle with input referencing algorithmResults
            const {calculatedStyle} = mstEdgeLayer.edge;
            assert.ok(calculatedStyle);

            const input = calculatedStyle.inputs[0];
            // Should reference algorithmResults.graphty.kruskal.inMST
            assert.ok(input.includes("algorithmResults"));
            assert.ok(input.includes("graphty"));
            assert.ok(input.includes("kruskal"));
            assert.ok(input.includes("inMST"));
        });

        it("selector uses correct algorithm result path for non-MST edges", () => {
            const styles = KruskalAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const nonMstEdgeLayer = styles.layers[1];
            assert.ok(nonMstEdgeLayer.edge);

            const {selector} = nonMstEdgeLayer.edge;
            assert.ok(selector);

            // Should reference algorithmResults.graphty.kruskal.inMST
            assert.ok(selector.includes("algorithmResults"));
            assert.ok(selector.includes("graphty"));
            assert.ok(selector.includes("kruskal"));
            assert.ok(selector.includes("inMST"));
        });
    });

    describe("Algorithm Metadata", () => {
        it("has correct namespace and type", () => {
            assert.strictEqual(KruskalAlgorithm.namespace, "graphty");
            assert.strictEqual(KruskalAlgorithm.type, "kruskal");
        });

        it("is retrievable via Algorithm.getClass", () => {
            const AlgClass = Algorithm.getClass("graphty", "kruskal");
            assert.strictEqual(AlgClass, KruskalAlgorithm);
        });

        it("suggested styles are retrievable via static method", () => {
            const styles = KruskalAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.ok(styles.layers);
        });
    });

    describe("Style Configuration", () => {
        it("MST edges use calculatedStyle for color", () => {
            const styles = KruskalAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const mstEdgeLayer = styles.layers[0];
            assert.ok(mstEdgeLayer);
            assert.ok(mstEdgeLayer.edge);
            assert.ok(mstEdgeLayer.edge.style);
            assert.ok(mstEdgeLayer.edge.style.enabled);

            // MST edges should use calculatedStyle for color
            assert.ok(mstEdgeLayer.edge.calculatedStyle);
            assert.ok(mstEdgeLayer.edge.calculatedStyle.output.includes("color"));
        });

        it("non-MST edges have reduced opacity", () => {
            const styles = KruskalAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const nonMstEdgeLayer = styles.layers[1];
            assert.ok(nonMstEdgeLayer);
            assert.ok(nonMstEdgeLayer.edge);
            assert.ok(nonMstEdgeLayer.edge.style);

            // Should have reduced opacity
            const {style} = nonMstEdgeLayer.edge;
            const hasReducedOpacity = typeof style.line?.opacity === "number" && style.line.opacity < 1;

            assert.ok(hasReducedOpacity, "Non-MST edges should have reduced opacity");
        });
    });
});
