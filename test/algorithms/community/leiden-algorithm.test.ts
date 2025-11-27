import {assert, describe, it} from "vitest";

import {Algorithm} from "../../../src/algorithms/Algorithm";
import {LeidenAlgorithm} from "../../../src/algorithms/LeidenAlgorithm";

describe("LeidenAlgorithm", () => {
    describe("Algorithm Registration", () => {
        it("should be registered with namespace 'graphty' and type 'leiden'", () => {
            const LeidenClass = Algorithm.getClass("graphty", "leiden");
            assert.ok(LeidenClass);
            assert.strictEqual(LeidenClass, LeidenAlgorithm);
            assert.strictEqual(LeidenClass.namespace, "graphty");
            assert.strictEqual(LeidenClass.type, "leiden");
        });
    });

    describe("Suggested Styles", () => {
        it("has suggested styles defined", () => {
            assert.strictEqual(LeidenAlgorithm.hasSuggestedStyles(), true);
        });

        it("returns correct suggested styles structure", () => {
            const styles = LeidenAlgorithm.getSuggestedStyles();

            assert.ok(styles);
            assert.ok(styles.description);
            assert.strictEqual(styles.category, "grouping");
            assert.ok(Array.isArray(styles.layers));
            assert.strictEqual(styles.layers.length, 1);
        });

        it("layer has correct node calculatedStyle configuration", () => {
            const styles = LeidenAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const layer = styles.layers[0];
            assert.ok(layer);
            assert.ok(layer.node);
            assert.ok(layer.node.calculatedStyle);

            const {calculatedStyle} = layer.node;
            assert.deepStrictEqual(calculatedStyle.inputs, ["algorithmResults.graphty.leiden.communityId"]);
            assert.strictEqual(calculatedStyle.output, "style.texture.color");
        });

        it("uses categorical color mapping with StyleHelpers", () => {
            const styles = LeidenAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const layer = styles.layers[0];
            assert.ok(layer);
            assert.ok(layer.node);
            assert.ok(layer.node.calculatedStyle);

            const {expr} = layer.node.calculatedStyle;

            // Should use StyleHelpers.color.categorical.tolMuted
            assert.ok(expr.includes("StyleHelpers"));
            assert.ok(expr.includes("categorical"));
            assert.ok(expr.includes("tolMuted"));
            assert.ok(expr.includes("arguments[0]"));
        });

        it("layer has metadata", () => {
            const styles = LeidenAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const layer = styles.layers[0];
            assert.ok(layer);
            assert.ok(layer.metadata);
            assert.strictEqual(layer.metadata.name, "Leiden - Muted Colors");
            assert.ok(layer.metadata.description);
        });

        it("description explains community visualization", () => {
            const styles = LeidenAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.ok(styles.description);
            assert.ok(styles.description.toLowerCase().includes("communit"));
        });
    });

    describe("Categorical Color Mapping", () => {
        it("expression uses StyleHelpers", () => {
            const styles = LeidenAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const layer = styles.layers[0];
            assert.ok(layer.node?.calculatedStyle);

            const {expr} = layer.node.calculatedStyle;
            assert.ok(expr);

            // Should use StyleHelpers.color.categorical.tolMuted
            assert.ok(expr.includes("StyleHelpers"));
            assert.ok(expr.includes("tolMuted"));
        });

        it("uses community ID as input", () => {
            const styles = LeidenAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const layer = styles.layers[0];
            assert.ok(layer.node?.calculatedStyle);

            const {inputs} = layer.node.calculatedStyle;
            assert.ok(inputs);
            assert.strictEqual(inputs.length, 1);
            assert.strictEqual(inputs[0], "algorithmResults.graphty.leiden.communityId");
        });

        it("outputs to texture color", () => {
            const styles = LeidenAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const layer = styles.layers[0];
            assert.ok(layer.node?.calculatedStyle);

            const {output} = layer.node.calculatedStyle;
            assert.strictEqual(output, "style.texture.color");
        });
    });

    describe("Algorithm Metadata", () => {
        it("has correct namespace and type", () => {
            assert.strictEqual(LeidenAlgorithm.namespace, "graphty");
            assert.strictEqual(LeidenAlgorithm.type, "leiden");
        });

        it("is retrievable via Algorithm.getClass", () => {
            const AlgClass = Algorithm.getClass("graphty", "leiden");
            assert.strictEqual(AlgClass, LeidenAlgorithm);
        });

        it("suggested styles are retrievable via static method", () => {
            const styles = LeidenAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.ok(styles.layers);
        });
    });
});
