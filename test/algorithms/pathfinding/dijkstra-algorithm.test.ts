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

            // Edge should use selector to filter path edges
            assert.ok(edgeLayer.edge.selector);
            assert.ok(edgeLayer.edge.selector.includes("isInPath"));
        });

        it("has node layer for path highlighting", () => {
            const styles = DijkstraAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            // Find node layer
            const nodeLayer = styles.layers.find((layer) => layer.node);
            assert.ok(nodeLayer);
            assert.ok(nodeLayer.node);

            // Node should use selector to filter path nodes
            assert.ok(nodeLayer.node.selector);
            assert.ok(nodeLayer.node.selector.includes("isInPath"));
        });

        it("edge style has distinct color for path", () => {
            const styles = DijkstraAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const edgeLayer = styles.layers.find((layer) => layer.edge);
            assert.ok(edgeLayer?.edge?.style);

            // Should have line styling for path edges
            assert.ok(edgeLayer.edge.style.line);
            assert.ok(edgeLayer.edge.style.line.color);
            assert.ok(edgeLayer.edge.style.line.width);
        });

        it("node style has distinct color and optional glow for path nodes", () => {
            const styles = DijkstraAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const nodeLayer = styles.layers.find((layer) => layer.node);
            assert.ok(nodeLayer?.node?.style);

            // Should have texture color for path nodes
            assert.ok(nodeLayer.node.style.texture);
            assert.ok(nodeLayer.node.style.texture.color);
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

    describe("JMESPath Selectors", () => {
        it("edge selector uses JMESPath syntax for path filtering", () => {
            const styles = DijkstraAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const edgeLayer = styles.layers.find((layer) => layer.edge);
            assert.ok(edgeLayer?.edge?.selector);

            // Should use JMESPath backtick syntax for boolean comparison
            const {selector} = edgeLayer.edge;
            assert.ok(
                selector.includes("algorithmResults.graphty.dijkstra.isInPath") ||
                selector.includes("`true`"),
            );
        });

        it("node selector uses JMESPath syntax for path filtering", () => {
            const styles = DijkstraAlgorithm.getSuggestedStyles();
            assert.ok(styles);

            const nodeLayer = styles.layers.find((layer) => layer.node);
            assert.ok(nodeLayer?.node?.selector);

            // Should use JMESPath backtick syntax for boolean comparison
            const {selector} = nodeLayer.node;
            assert.ok(
                selector.includes("algorithmResults.graphty.dijkstra.isInPath") ||
                selector.includes("`true`"),
            );
        });
    });
});
