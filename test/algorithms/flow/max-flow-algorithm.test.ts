import {assert, describe, it} from "vitest";

import {Algorithm} from "../../../src/algorithms/Algorithm";
import {MaxFlowAlgorithm} from "../../../src/algorithms/MaxFlowAlgorithm";

describe("MaxFlowAlgorithm", () => {
    describe("Algorithm Registration", () => {
        it("should be registered with namespace 'graphty' and type 'max-flow'", () => {
            const MaxFlowClass = Algorithm.getClass("graphty", "max-flow");
            assert.ok(MaxFlowClass);
            assert.strictEqual(MaxFlowClass, MaxFlowAlgorithm);
            assert.strictEqual(MaxFlowClass.namespace, "graphty");
            assert.strictEqual(MaxFlowClass.type, "max-flow");
        });
    });

    describe("Suggested Styles", () => {
        it("has suggested styles defined", () => {
            assert.strictEqual(MaxFlowAlgorithm.hasSuggestedStyles(), true);
        });

        it("returns correct suggested styles structure", () => {
            const styles = MaxFlowAlgorithm.getSuggestedStyles();

            assert.ok(styles);
            assert.ok(styles.description);
            assert.strictEqual(styles.category, "edge-metric");
            assert.ok(Array.isArray(styles.layers));
            assert.ok(styles.layers.length >= 1);
        });

        it("has edge layer with calculated style for flow", () => {
            const styles = MaxFlowAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            // Find an edge layer with calculatedStyle
            const edgeLayer = styles.layers.find((l) => l.edge?.calculatedStyle);
            assert.ok(edgeLayer, "Should have edge layer with calculatedStyle");
            assert.ok(edgeLayer.edge);
            assert.ok(edgeLayer.edge.calculatedStyle);

            // Check calculatedStyle uses flow percentage
            const {calculatedStyle} = edgeLayer.edge;
            assert.ok(calculatedStyle.inputs);
            assert.ok(calculatedStyle.inputs.some((input) => input.includes("max-flow")));
            assert.ok(calculatedStyle.output);
            assert.ok(calculatedStyle.expr);
        });

        it("uses edge width or color for flow visualization", () => {
            const styles = MaxFlowAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            // Find edge layers
            const edgeLayers = styles.layers.filter((l) => l.edge?.calculatedStyle);

            // At least one should use width or color
            const usesWidth = edgeLayers.some((l) => l.edge?.calculatedStyle?.output.includes("width"));
            const usesColor = edgeLayers.some((l) => l.edge?.calculatedStyle?.output.includes("color"));

            assert.ok(usesWidth || usesColor, "Should visualize flow via edge width or color");
        });

        it("layers have metadata", () => {
            const styles = MaxFlowAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            for (const layer of styles.layers) {
                assert.ok(layer.metadata);
                assert.ok(layer.metadata.name);
                assert.ok(layer.metadata.description);
            }
        });

        it("description explains max flow visualization", () => {
            const styles = MaxFlowAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.ok(styles.description);
            // Should mention flow
            const descLower = styles.description.toLowerCase();
            assert.ok(descLower.includes("flow"));
        });
    });

    describe("Flow Result Path", () => {
        it("calculated style uses correct algorithm result path", () => {
            const styles = MaxFlowAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const edgeLayer = styles.layers.find((l) => l.edge?.calculatedStyle);
            assert.ok(edgeLayer?.edge?.calculatedStyle);

            const {inputs} = edgeLayer.edge.calculatedStyle;
            assert.ok(inputs);

            // Should reference algorithmResults.graphty.max-flow
            const hasCorrectPath = inputs.some(
                (input) =>
                    input.includes("algorithmResults") && input.includes("graphty") && input.includes("max-flow"),
            );
            assert.ok(hasCorrectPath, "Should use correct algorithm result path");
        });
    });

    describe("Algorithm Metadata", () => {
        it("has correct namespace and type", () => {
            assert.strictEqual(MaxFlowAlgorithm.namespace, "graphty");
            assert.strictEqual(MaxFlowAlgorithm.type, "max-flow");
        });

        it("is retrievable via Algorithm.getClass", () => {
            const AlgClass = Algorithm.getClass("graphty", "max-flow");
            assert.strictEqual(AlgClass, MaxFlowAlgorithm);
        });

        it("suggested styles are retrievable via static method", () => {
            const styles = MaxFlowAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.ok(styles.layers);
        });
    });

    describe("Configuration", () => {
        it("can be configured with source and sink", () => {
            const algo = new MaxFlowAlgorithm({} as never);
            assert.ok(typeof algo.configure === "function");
        });
    });

    describe("StyleHelpers Integration", () => {
        it("uses StyleHelpers for edge width or color", () => {
            const styles = MaxFlowAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            // Find edge layers with calculatedStyle
            const edgeLayers = styles.layers.filter((l) => l.edge?.calculatedStyle);

            // At least one should use StyleHelpers
            const usesStyleHelpers = edgeLayers.some((l) => l.edge?.calculatedStyle?.expr.includes("StyleHelpers"));

            assert.ok(usesStyleHelpers, "Should use StyleHelpers for edge visualization");
        });
    });
});
