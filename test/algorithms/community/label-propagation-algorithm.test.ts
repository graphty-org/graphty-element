import {assert, describe, it} from "vitest";

import {Algorithm} from "../../../src/algorithms/Algorithm";
import {LabelPropagationAlgorithm} from "../../../src/algorithms/LabelPropagationAlgorithm";

describe("LabelPropagationAlgorithm", () => {
    describe("Algorithm Registration", () => {
        it("should be registered with namespace 'graphty' and type 'label-propagation'", () => {
            const LabelPropagationClass = Algorithm.getClass("graphty", "label-propagation");
            assert.ok(LabelPropagationClass);
            assert.strictEqual(LabelPropagationClass, LabelPropagationAlgorithm);
            assert.strictEqual(LabelPropagationClass.namespace, "graphty");
            assert.strictEqual(LabelPropagationClass.type, "label-propagation");
        });
    });

    describe("Suggested Styles", () => {
        it("has suggested styles defined", () => {
            assert.strictEqual(LabelPropagationAlgorithm.hasSuggestedStyles(), true);
        });

        it("returns correct suggested styles structure", () => {
            const styles = LabelPropagationAlgorithm.getSuggestedStyles();

            assert.ok(styles);
            assert.ok(styles.description);
            assert.strictEqual(styles.category, "grouping");
            assert.ok(Array.isArray(styles.layers));
            assert.strictEqual(styles.layers.length, 1);
        });

        it("layer has correct node calculatedStyle configuration", () => {
            const styles = LabelPropagationAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const layer = styles.layers[0];
            assert.ok(layer);
            assert.ok(layer.node);
            assert.ok(layer.node.calculatedStyle);

            const {calculatedStyle} = layer.node;
            assert.deepStrictEqual(calculatedStyle.inputs, ["algorithmResults.graphty.label-propagation.communityId"]);
            assert.strictEqual(calculatedStyle.output, "style.texture.color");
        });

        it("uses categorical color mapping with StyleHelpers", () => {
            const styles = LabelPropagationAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const layer = styles.layers[0];
            assert.ok(layer);
            assert.ok(layer.node);
            assert.ok(layer.node.calculatedStyle);

            const {expr} = layer.node.calculatedStyle;

            // Should use StyleHelpers.color.categorical.pastel
            assert.ok(expr.includes("StyleHelpers"));
            assert.ok(expr.includes("categorical"));
            assert.ok(expr.includes("pastel"));
            assert.ok(expr.includes("arguments[0]"));
        });

        it("layer has metadata", () => {
            const styles = LabelPropagationAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const layer = styles.layers[0];
            assert.ok(layer);
            assert.ok(layer.metadata);
            assert.strictEqual(layer.metadata.name, "Label Propagation - Pastel Colors");
            assert.ok(layer.metadata.description);
        });

        it("description explains community visualization", () => {
            const styles = LabelPropagationAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.ok(styles.description);
            assert.ok(styles.description.toLowerCase().includes("communit"));
        });
    });

    describe("Categorical Color Mapping", () => {
        it("expression uses StyleHelpers", () => {
            const styles = LabelPropagationAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const layer = styles.layers[0];
            assert.ok(layer.node?.calculatedStyle);

            const {expr} = layer.node.calculatedStyle;
            assert.ok(expr);

            // Should use StyleHelpers.color.categorical.pastel
            assert.ok(expr.includes("StyleHelpers"));
            assert.ok(expr.includes("pastel"));
        });

        it("uses community ID as input", () => {
            const styles = LabelPropagationAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const layer = styles.layers[0];
            assert.ok(layer.node?.calculatedStyle);

            const {inputs} = layer.node.calculatedStyle;
            assert.ok(inputs);
            assert.strictEqual(inputs.length, 1);
            assert.strictEqual(inputs[0], "algorithmResults.graphty.label-propagation.communityId");
        });

        it("outputs to texture color", () => {
            const styles = LabelPropagationAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const layer = styles.layers[0];
            assert.ok(layer.node?.calculatedStyle);

            const {output} = layer.node.calculatedStyle;
            assert.strictEqual(output, "style.texture.color");
        });
    });

    describe("Algorithm Metadata", () => {
        it("has correct namespace and type", () => {
            assert.strictEqual(LabelPropagationAlgorithm.namespace, "graphty");
            assert.strictEqual(LabelPropagationAlgorithm.type, "label-propagation");
        });

        it("is retrievable via Algorithm.getClass", () => {
            const AlgClass = Algorithm.getClass("graphty", "label-propagation");
            assert.strictEqual(AlgClass, LabelPropagationAlgorithm);
        });

        it("suggested styles are retrievable via static method", () => {
            const styles = LabelPropagationAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.ok(styles.layers);
        });
    });
});
