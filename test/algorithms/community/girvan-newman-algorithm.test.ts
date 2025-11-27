import {assert, describe, it} from "vitest";

import {Algorithm} from "../../../src/algorithms/Algorithm";
// Import will be created in implementation
import {GirvanNewmanAlgorithm} from "../../../src/algorithms/GirvanNewmanAlgorithm";

describe("GirvanNewmanAlgorithm", () => {
    describe("Algorithm Registration", () => {
        it("should be registered with namespace 'graphty' and type 'girvan-newman'", () => {
            const GirvanNewmanClass = Algorithm.getClass("graphty", "girvan-newman");
            assert.ok(GirvanNewmanClass);
            assert.strictEqual(GirvanNewmanClass, GirvanNewmanAlgorithm);
            assert.strictEqual(GirvanNewmanClass.namespace, "graphty");
            assert.strictEqual(GirvanNewmanClass.type, "girvan-newman");
        });
    });

    describe("Suggested Styles", () => {
        it("has suggested styles defined", () => {
            assert.strictEqual(GirvanNewmanAlgorithm.hasSuggestedStyles(), true);
        });

        it("returns correct suggested styles structure", () => {
            const styles = GirvanNewmanAlgorithm.getSuggestedStyles();

            assert.ok(styles);
            assert.ok(styles.description);
            assert.strictEqual(styles.category, "grouping");
            assert.ok(Array.isArray(styles.layers));
            assert.strictEqual(styles.layers.length, 1);
        });

        it("layer has correct node calculatedStyle configuration", () => {
            const styles = GirvanNewmanAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const layer = styles.layers[0];
            assert.ok(layer);
            assert.ok(layer.node);
            assert.ok(layer.node.calculatedStyle);

            const {calculatedStyle} = layer.node;
            assert.deepStrictEqual(calculatedStyle.inputs, ["algorithmResults.graphty.girvan-newman.communityId"]);
            assert.strictEqual(calculatedStyle.output, "style.texture.color");
        });

        it("uses categorical color mapping with StyleHelpers", () => {
            const styles = GirvanNewmanAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const layer = styles.layers[0];
            assert.ok(layer);
            assert.ok(layer.node);
            assert.ok(layer.node.calculatedStyle);

            const {expr} = layer.node.calculatedStyle;

            // Should use StyleHelpers.color.categorical.tolVibrant
            assert.ok(expr.includes("StyleHelpers"));
            assert.ok(expr.includes("categorical"));
            assert.ok(expr.includes("tolVibrant"));
            assert.ok(expr.includes("arguments[0]"));
        });

        it("layer has metadata", () => {
            const styles = GirvanNewmanAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const layer = styles.layers[0];
            assert.ok(layer);
            assert.ok(layer.metadata);
            assert.strictEqual(layer.metadata.name, "Girvan-Newman - Vibrant Colors");
            assert.ok(layer.metadata.description);
        });

        it("description explains community visualization", () => {
            const styles = GirvanNewmanAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.ok(styles.description);
            assert.ok(styles.description.toLowerCase().includes("communit"));
        });
    });

    describe("Categorical Color Mapping", () => {
        it("expression uses StyleHelpers", () => {
            const styles = GirvanNewmanAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const layer = styles.layers[0];
            assert.ok(layer.node?.calculatedStyle);

            const {expr} = layer.node.calculatedStyle;
            assert.ok(expr);

            // Should use StyleHelpers.color.categorical.tolVibrant
            assert.ok(expr.includes("StyleHelpers"));
            assert.ok(expr.includes("tolVibrant"));
        });

        it("uses community ID as input", () => {
            const styles = GirvanNewmanAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const layer = styles.layers[0];
            assert.ok(layer.node?.calculatedStyle);

            const {inputs} = layer.node.calculatedStyle;
            assert.ok(inputs);
            assert.strictEqual(inputs.length, 1);
            assert.strictEqual(inputs[0], "algorithmResults.graphty.girvan-newman.communityId");
        });

        it("outputs to texture color", () => {
            const styles = GirvanNewmanAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const layer = styles.layers[0];
            assert.ok(layer.node?.calculatedStyle);

            const {output} = layer.node.calculatedStyle;
            assert.strictEqual(output, "style.texture.color");
        });
    });

    describe("Algorithm Metadata", () => {
        it("has correct namespace and type", () => {
            assert.strictEqual(GirvanNewmanAlgorithm.namespace, "graphty");
            assert.strictEqual(GirvanNewmanAlgorithm.type, "girvan-newman");
        });

        it("is retrievable via Algorithm.getClass", () => {
            const AlgClass = Algorithm.getClass("graphty", "girvan-newman");
            assert.strictEqual(AlgClass, GirvanNewmanAlgorithm);
        });

        it("suggested styles are retrievable via static method", () => {
            const styles = GirvanNewmanAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.ok(styles.layers);
        });
    });
});
