import {assert, describe, it} from "vitest";

import {Algorithm} from "../../../src/algorithms/Algorithm";
import {PrimAlgorithm} from "../../../src/algorithms/PrimAlgorithm";

describe("PrimAlgorithm", () => {
    describe("Algorithm Registration", () => {
        it("should be registered with namespace 'graphty' and type 'prim'", () => {
            const PrimClass = Algorithm.getClass("graphty", "prim");
            assert.ok(PrimClass);
            assert.strictEqual(PrimClass, PrimAlgorithm);
            assert.strictEqual(PrimClass.namespace, "graphty");
            assert.strictEqual(PrimClass.type, "prim");
        });
    });

    describe("Suggested Styles", () => {
        it("has suggested styles defined", () => {
            assert.strictEqual(PrimAlgorithm.hasSuggestedStyles(), true);
        });

        it("returns correct suggested styles structure", () => {
            const styles = PrimAlgorithm.getSuggestedStyles();

            assert.ok(styles);
            assert.ok(styles.description);
            assert.strictEqual(styles.category, "path");
            assert.ok(Array.isArray(styles.layers));
            assert.strictEqual(styles.layers.length, 2); // MST edges and non-MST edges
        });

        it("first layer highlights MST edges with calculated color", () => {
            const styles = PrimAlgorithm.getSuggestedStyles();
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

            // Should have line width defined
            assert.ok(mstEdgeLayer.edge.style);
            assert.ok(mstEdgeLayer.edge.style.line);
            assert.ok(mstEdgeLayer.edge.style.line.width);
        });

        it("second layer dims non-MST edges", () => {
            const styles = PrimAlgorithm.getSuggestedStyles();
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
            const styles = PrimAlgorithm.getSuggestedStyles();
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
            const styles = PrimAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.ok(styles.description);
            // Should mention minimum spanning tree, Prim, or MST
            const descLower = styles.description.toLowerCase();
            assert.ok(descLower.includes("minimum") || descLower.includes("mst") || descLower.includes("spanning") || descLower.includes("prim"));
        });
    });

    describe("MST Edge Detection", () => {
        it("calculatedStyle uses correct algorithm result path for MST edges", () => {
            const styles = PrimAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const mstEdgeLayer = styles.layers[0];
            assert.ok(mstEdgeLayer.edge);

            // First layer uses calculatedStyle with input referencing algorithmResults
            const {calculatedStyle} = mstEdgeLayer.edge;
            assert.ok(calculatedStyle);

            const input = calculatedStyle.inputs[0];
            // Should reference algorithmResults.graphty.prim.inMST
            assert.ok(input.includes("algorithmResults"));
            assert.ok(input.includes("graphty"));
            assert.ok(input.includes("prim"));
            assert.ok(input.includes("inMST"));
        });

        it("selector uses correct algorithm result path for non-MST edges", () => {
            const styles = PrimAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const nonMstEdgeLayer = styles.layers[1];
            assert.ok(nonMstEdgeLayer.edge);

            const {selector} = nonMstEdgeLayer.edge;
            assert.ok(selector);

            // Should reference algorithmResults.graphty.prim.inMST
            assert.ok(selector.includes("algorithmResults"));
            assert.ok(selector.includes("graphty"));
            assert.ok(selector.includes("prim"));
            assert.ok(selector.includes("inMST"));
        });
    });

    describe("Algorithm Metadata", () => {
        it("has correct namespace and type", () => {
            assert.strictEqual(PrimAlgorithm.namespace, "graphty");
            assert.strictEqual(PrimAlgorithm.type, "prim");
        });

        it("is retrievable via Algorithm.getClass", () => {
            const AlgClass = Algorithm.getClass("graphty", "prim");
            assert.strictEqual(AlgClass, PrimAlgorithm);
        });

        it("suggested styles are retrievable via static method", () => {
            const styles = PrimAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.ok(styles.layers);
        });
    });

    describe("Style Configuration", () => {
        it("MST edges have increased line width", () => {
            const styles = PrimAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const mstEdgeLayer = styles.layers[0];
            assert.ok(mstEdgeLayer);
            assert.ok(mstEdgeLayer.edge);
            assert.ok(mstEdgeLayer.edge.style);
            assert.ok(mstEdgeLayer.edge.style.line);

            // MST edges should have a larger width
            const {width} = mstEdgeLayer.edge.style.line;
            assert.ok(typeof width === "number");
            assert.ok(width >= 2); // Should be at least 2 for visibility
        });

        it("non-MST edges have reduced opacity or smaller width", () => {
            const styles = PrimAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const nonMstEdgeLayer = styles.layers[1];
            assert.ok(nonMstEdgeLayer);
            assert.ok(nonMstEdgeLayer.edge);
            assert.ok(nonMstEdgeLayer.edge.style);

            // Should have either reduced opacity or smaller width
            const {style} = nonMstEdgeLayer.edge;
            const hasReducedOpacity = typeof style.line?.opacity === "number" && style.line.opacity < 1;
            const hasSmallerWidth = typeof style.line?.width === "number" && style.line.width <= 2;

            assert.ok(hasReducedOpacity || hasSmallerWidth, "Non-MST edges should have reduced visibility");
        });
    });

    describe("Configuration", () => {
        it("can be configured with a start node", () => {
            // PrimAlgorithm supports optional start node configuration
            // This is mainly for API completeness since the result is the same MST
            const algo = new PrimAlgorithm({} as never);
            assert.ok(typeof algo.configure === "function");
        });
    });
});
