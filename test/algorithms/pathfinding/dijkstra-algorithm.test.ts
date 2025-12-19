import {assert, describe, it} from "vitest";

import {Algorithm} from "../../../src/algorithms/Algorithm";
import {DijkstraAlgorithm} from "../../../src/algorithms/DijkstraAlgorithm";

describe("DijkstraAlgorithm", () => {
    describe("Algorithm Registration", () => {
        it("should be registered with namespace 'graphty' and type 'dijkstra'", () => {
            const DijkstraClass = Algorithm.getClass("graphty", "dijkstra");
            assert.ok(DijkstraClass);
            assert.strictEqual(DijkstraClass, DijkstraAlgorithm);
            assert.strictEqual(DijkstraClass.namespace, "graphty");
            assert.strictEqual(DijkstraClass.type, "dijkstra");
        });
    });

    describe("Suggested Styles", () => {
        it("has suggested styles defined", () => {
            assert.strictEqual(DijkstraAlgorithm.hasSuggestedStyles(), true);
        });

        it("returns correct suggested styles structure", () => {
            const styles = DijkstraAlgorithm.getSuggestedStyles();

            assert.ok(styles);
            assert.ok(styles.description);
            assert.strictEqual(styles.category, "path");
            assert.ok(Array.isArray(styles.layers));
            // Should have layers for both edge and node highlighting
            assert.ok(styles.layers.length >= 2);
        });

        it("has edge layer for path highlighting", () => {
            const styles = DijkstraAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            // Find edge layer
            const edgeLayer = styles.layers.find((layer) => layer.edge);
            assert.ok(edgeLayer);
            assert.ok(edgeLayer.edge);

            // Edge should use calculatedStyle for dynamic color (colorblind-safe)
            assert.ok(edgeLayer.edge.calculatedStyle);
            assert.ok(edgeLayer.edge.calculatedStyle.inputs[0].includes("isInPath"));
        });

        it("has node layer for path highlighting", () => {
            const styles = DijkstraAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            // Find node layer
            const nodeLayer = styles.layers.find((layer) => layer.node);
            assert.ok(nodeLayer);
            assert.ok(nodeLayer.node);

            // Node should use calculatedStyle for dynamic color (colorblind-safe)
            assert.ok(nodeLayer.node.calculatedStyle);
            assert.ok(nodeLayer.node.calculatedStyle.inputs[0].includes("isInPath"));
        });

        it("edge style uses calculatedStyle for colorblind-safe color", () => {
            const styles = DijkstraAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const edgeLayer = styles.layers.find((layer) => layer.edge);
            assert.ok(edgeLayer?.edge);

            // Should use calculatedStyle with StyleHelpers
            assert.ok(edgeLayer.edge.calculatedStyle);
            assert.ok(edgeLayer.edge.calculatedStyle.expr.includes("StyleHelpers"));
            assert.ok(edgeLayer.edge.calculatedStyle.output.includes("color"));
            assert.ok(edgeLayer.edge.style);
            assert.ok(edgeLayer.edge.style.enabled);
        });

        it("node style uses calculatedStyle for colorblind-safe color", () => {
            const styles = DijkstraAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const nodeLayer = styles.layers.find((layer) => layer.node);
            assert.ok(nodeLayer?.node);

            // Should use calculatedStyle with StyleHelpers
            assert.ok(nodeLayer.node.calculatedStyle);
            assert.ok(nodeLayer.node.calculatedStyle.expr.includes("StyleHelpers"));
            assert.ok(nodeLayer.node.calculatedStyle.output.includes("color"));
        });

        it("layers have metadata", () => {
            const styles = DijkstraAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            for (const layer of styles.layers) {
                assert.ok(layer.metadata);
                assert.ok(layer.metadata.name);
            }
        });

        it("description explains path visualization", () => {
            const styles = DijkstraAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.ok(styles.description);
            assert.ok(styles.description.toLowerCase().includes("path"));
        });
    });

    describe("Algorithm Metadata", () => {
        it("has correct namespace and type", () => {
            assert.strictEqual(DijkstraAlgorithm.namespace, "graphty");
            assert.strictEqual(DijkstraAlgorithm.type, "dijkstra");
        });

        it("is retrievable via Algorithm.getClass", () => {
            const AlgClass = Algorithm.getClass("graphty", "dijkstra");
            assert.strictEqual(AlgClass, DijkstraAlgorithm);
        });

        it("suggested styles are retrievable via static method", () => {
            const styles = DijkstraAlgorithm.getSuggestedStyles();
            assert.ok(styles);
            assert.ok(styles.layers);
        });
    });

    describe("CalculatedStyle Inputs", () => {
        it("edge calculatedStyle input references correct algorithm result path", () => {
            const styles = DijkstraAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const edgeLayer = styles.layers.find((layer) => layer.edge);
            assert.ok(edgeLayer?.edge?.calculatedStyle);

            // Should reference algorithmResults.graphty.dijkstra.isInPath
            const input = edgeLayer.edge.calculatedStyle.inputs[0];
            assert.ok(input.includes("algorithmResults"));
            assert.ok(input.includes("graphty"));
            assert.ok(input.includes("dijkstra"));
            assert.ok(input.includes("isInPath"));
        });

        it("node calculatedStyle input references correct algorithm result path", () => {
            const styles = DijkstraAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const nodeLayer = styles.layers.find((layer) => layer.node);
            assert.ok(nodeLayer?.node?.calculatedStyle);

            // Should reference algorithmResults.graphty.dijkstra.isInPath
            const input = nodeLayer.node.calculatedStyle.inputs[0];
            assert.ok(input.includes("algorithmResults"));
            assert.ok(input.includes("graphty"));
            assert.ok(input.includes("dijkstra"));
            assert.ok(input.includes("isInPath"));
        });
    });
});
