import {assert, describe, it} from "vitest";

import {Algorithm} from "../../../src/algorithms/Algorithm";
import {StronglyConnectedComponentsAlgorithm} from "../../../src/algorithms/StronglyConnectedComponentsAlgorithm";

describe("StronglyConnectedComponentsAlgorithm", () => {
    describe("Algorithm Registration", () => {
        it("should be registered with namespace 'graphty' and type 'scc'", () => {
            const SCCClass = Algorithm.getClass("graphty", "scc");
            assert.ok(SCCClass);
            assert.strictEqual(SCCClass, StronglyConnectedComponentsAlgorithm);
            assert.strictEqual(SCCClass.namespace, "graphty");
            assert.strictEqual(SCCClass.type, "scc");
        });
    });

    describe("Suggested Styles", () => {
        it("has suggested styles defined", () => {
            assert.strictEqual(StronglyConnectedComponentsAlgorithm.hasSuggestedStyles(), true);
        });

        it("returns correct suggested styles structure", () => {
            const styles = StronglyConnectedComponentsAlgorithm.getSuggestedStyles();

            assert.ok(styles);
            assert.ok(styles.description);
            assert.strictEqual(styles.category, "grouping");
            assert.ok(Array.isArray(styles.layers));
            assert.strictEqual(styles.layers.length, 1);
        });

        it("layer has correct node calculatedStyle configuration", () => {
            const styles = StronglyConnectedComponentsAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const layer = styles.layers[0];
            assert.ok(layer);
            assert.ok(layer.node);
            assert.ok(layer.node.calculatedStyle);

            const {calculatedStyle} = layer.node;
            assert.deepStrictEqual(calculatedStyle.inputs, ["algorithmResults.graphty.scc.componentId"]);
            assert.strictEqual(calculatedStyle.output, "style.texture.color");
        });

        it("uses categorical color mapping with StyleHelpers.color.categorical.okabeIto", () => {
            const styles = StronglyConnectedComponentsAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const layer = styles.layers[0];
            assert.ok(layer);
            assert.ok(layer.node);
            assert.ok(layer.node.calculatedStyle);

            const {expr} = layer.node.calculatedStyle;

            // Should use StyleHelpers.color.categorical.okabeIto
            assert.ok(expr.includes("StyleHelpers"));
            assert.ok(expr.includes("categorical"));
            assert.ok(expr.includes("okabeIto"));
            assert.ok(expr.includes("arguments[0]"));
        });

        it("layer has metadata", () => {
            const styles = StronglyConnectedComponentsAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const layer = styles.layers[0];
            assert.ok(layer);
            assert.ok(layer.metadata);
            assert.strictEqual(layer.metadata.name, "SCC - Okabe-Ito Colors");
            assert.ok(layer.metadata.description);
        });

        it("description explains strongly connected component visualization", () => {
            const styles = StronglyConnectedComponentsAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.ok(styles.description);
            assert.ok(styles.description.toLowerCase().includes("strongly connected"));
        });
    });

    describe("Categorical Color Mapping", () => {
        it("expression uses StyleHelpers", () => {
            const styles = StronglyConnectedComponentsAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const layer = styles.layers[0];
            assert.ok(layer.node?.calculatedStyle);

            const {expr} = layer.node.calculatedStyle;
            assert.ok(expr);

            // Should use StyleHelpers.color.categorical.okabeIto
            assert.ok(expr.includes("StyleHelpers"));
            assert.ok(expr.includes("okabeIto"));
        });

        it("uses component ID as input", () => {
            const styles = StronglyConnectedComponentsAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const layer = styles.layers[0];
            assert.ok(layer.node?.calculatedStyle);

            const {inputs} = layer.node.calculatedStyle;
            assert.ok(inputs);
            assert.strictEqual(inputs.length, 1);
            assert.strictEqual(inputs[0], "algorithmResults.graphty.scc.componentId");
        });

        it("outputs to texture color", () => {
            const styles = StronglyConnectedComponentsAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const layer = styles.layers[0];
            assert.ok(layer.node?.calculatedStyle);

            const {output} = layer.node.calculatedStyle;
            assert.strictEqual(output, "style.texture.color");
        });
    });

    describe("Algorithm Metadata", () => {
        it("has correct namespace and type", () => {
            assert.strictEqual(StronglyConnectedComponentsAlgorithm.namespace, "graphty");
            assert.strictEqual(StronglyConnectedComponentsAlgorithm.type, "scc");
        });

        it("is retrievable via Algorithm.getClass", () => {
            const AlgClass = Algorithm.getClass("graphty", "scc");
            assert.strictEqual(AlgClass, StronglyConnectedComponentsAlgorithm);
        });

        it("suggested styles are retrievable via static method", () => {
            const styles = StronglyConnectedComponentsAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.ok(styles.layers);
        });
    });
});
