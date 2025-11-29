import {assert, describe, it} from "vitest";

import {Algorithm} from "../../../src/algorithms/Algorithm";
import {ConnectedComponentsAlgorithm} from "../../../src/algorithms/ConnectedComponentsAlgorithm";

describe("ConnectedComponentsAlgorithm", () => {
    describe("Algorithm Registration", () => {
        it("should be registered with namespace 'graphty' and type 'connected-components'", () => {
            const ConnectedComponentsClass = Algorithm.getClass("graphty", "connected-components");
            assert.ok(ConnectedComponentsClass);
            assert.strictEqual(ConnectedComponentsClass, ConnectedComponentsAlgorithm);
            assert.strictEqual(ConnectedComponentsClass.namespace, "graphty");
            assert.strictEqual(ConnectedComponentsClass.type, "connected-components");
        });
    });

    describe("Suggested Styles", () => {
        it("has suggested styles defined", () => {
            assert.strictEqual(ConnectedComponentsAlgorithm.hasSuggestedStyles(), true);
        });

        it("returns correct suggested styles structure", () => {
            const styles = ConnectedComponentsAlgorithm.getSuggestedStyles();

            assert.ok(styles);
            assert.ok(styles.description);
            assert.strictEqual(styles.category, "grouping");
            assert.ok(Array.isArray(styles.layers));
            assert.strictEqual(styles.layers.length, 1);
        });

        it("layer has correct node calculatedStyle configuration", () => {
            const styles = ConnectedComponentsAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const layer = styles.layers[0];
            assert.ok(layer);
            assert.ok(layer.node);
            assert.ok(layer.node.calculatedStyle);

            const {calculatedStyle} = layer.node;
            assert.deepStrictEqual(calculatedStyle.inputs, ["algorithmResults.graphty.connected-components.componentId"]);
            assert.strictEqual(calculatedStyle.output, "style.texture.color");
        });

        it("uses categorical color mapping with StyleHelpers.color.categorical.carbon", () => {
            const styles = ConnectedComponentsAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const layer = styles.layers[0];
            assert.ok(layer);
            assert.ok(layer.node);
            assert.ok(layer.node.calculatedStyle);

            const {expr} = layer.node.calculatedStyle;

            // Should use StyleHelpers.color.categorical.carbon
            assert.ok(expr.includes("StyleHelpers"));
            assert.ok(expr.includes("categorical"));
            assert.ok(expr.includes("carbon"));
            assert.ok(expr.includes("arguments[0]"));
        });

        it("layer has metadata", () => {
            const styles = ConnectedComponentsAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const layer = styles.layers[0];
            assert.ok(layer);
            assert.ok(layer.metadata);
            assert.strictEqual(layer.metadata.name, "Components - Carbon Colors");
            assert.ok(layer.metadata.description);
        });

        it("description explains component visualization", () => {
            const styles = ConnectedComponentsAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.ok(styles.description);
            assert.ok(styles.description.toLowerCase().includes("component"));
        });
    });

    describe("Categorical Color Mapping", () => {
        it("expression uses StyleHelpers", () => {
            const styles = ConnectedComponentsAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const layer = styles.layers[0];
            assert.ok(layer.node?.calculatedStyle);

            const {expr} = layer.node.calculatedStyle;
            assert.ok(expr);

            // Should use StyleHelpers.color.categorical.carbon
            assert.ok(expr.includes("StyleHelpers"));
            assert.ok(expr.includes("carbon"));
        });

        it("uses component ID as input", () => {
            const styles = ConnectedComponentsAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const layer = styles.layers[0];
            assert.ok(layer.node?.calculatedStyle);

            const {inputs} = layer.node.calculatedStyle;
            assert.ok(inputs);
            assert.strictEqual(inputs.length, 1);
            assert.strictEqual(inputs[0], "algorithmResults.graphty.connected-components.componentId");
        });

        it("outputs to texture color", () => {
            const styles = ConnectedComponentsAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const layer = styles.layers[0];
            assert.ok(layer.node?.calculatedStyle);

            const {output} = layer.node.calculatedStyle;
            assert.strictEqual(output, "style.texture.color");
        });
    });

    describe("Algorithm Metadata", () => {
        it("has correct namespace and type", () => {
            assert.strictEqual(ConnectedComponentsAlgorithm.namespace, "graphty");
            assert.strictEqual(ConnectedComponentsAlgorithm.type, "connected-components");
        });

        it("is retrievable via Algorithm.getClass", () => {
            const AlgClass = Algorithm.getClass("graphty", "connected-components");
            assert.strictEqual(AlgClass, ConnectedComponentsAlgorithm);
        });

        it("suggested styles are retrievable via static method", () => {
            const styles = ConnectedComponentsAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.ok(styles.layers);
        });
    });
});
