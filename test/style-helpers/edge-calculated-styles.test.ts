import {assert, beforeEach, describe, it} from "vitest";

import {CalculatedValue} from "../../src/CalculatedValue";
import {EdgeStyle, StyleTemplate} from "../../src/config";
import {Styles} from "../../src/Styles";

describe("Edge Calculated Styles", () => {
    let styles: Styles;

    beforeEach(() => {
        // Create a basic styles config with edge calculated styles
        const config = StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            graph: {
                addDefaultStyle: false,
            },
            layers: [
                {
                    edge: {
                        selector: "",
                        style: EdgeStyle.parse({}),
                        calculatedStyle: {
                            inputs: ["data.value"],
                            output: "style.line.width",
                            expr: "arguments[0] * 2",
                        },
                    },
                },
            ],
        });
        styles = new Styles(config);
    });

    it("getCalculatedStylesForEdge returns calculated values from edge layers", () => {
        const edgeData = {value: 5};
        const cvs = styles.getCalculatedStylesForEdge(edgeData);

        assert.equal(cvs.length, 1);
        assert.instanceOf(cvs[0], CalculatedValue);
        assert.deepEqual(cvs[0].inputs, ["data.value"]);
        assert.equal(cvs[0].output, "style.line.width");
    });

    it("getCalculatedStylesForEdge handles multiple calculated styles", () => {
        const config = StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            layers: [
                {
                    edge: {
                        selector: "",
                        style: EdgeStyle.parse({}),
                        calculatedStyle: {
                            inputs: ["data.value"],
                            output: "style.line.color",
                            expr: "'#FF0000'",
                        },
                    },
                },
                {
                    edge: {
                        selector: "",
                        style: EdgeStyle.parse({}),
                        calculatedStyle: {
                            inputs: ["data.weight"],
                            output: "style.line.width",
                            expr: "arguments[0] * 3",
                        },
                    },
                },
            ],
        });
        const multiStyles = new Styles(config);

        const edgeData = {value: 5, weight: 10};
        const cvs = multiStyles.getCalculatedStylesForEdge(edgeData);

        assert.equal(cvs.length, 2);
        assert.deepEqual(cvs[0].inputs, ["data.weight"]);
        assert.equal(cvs[0].output, "style.line.width");
        assert.deepEqual(cvs[1].inputs, ["data.value"]);
        assert.equal(cvs[1].output, "style.line.color");
    });

    it("getCalculatedStylesForEdge respects edge selector", () => {
        const config = StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            layers: [
                {
                    edge: {
                        selector: "value > `5`",
                        style: EdgeStyle.parse({}),
                        calculatedStyle: {
                            inputs: ["data.value"],
                            output: "style.line.width",
                            expr: "arguments[0] * 2",
                        },
                    },
                },
            ],
        });
        const selectiveStyles = new Styles(config);

        // Edge with value > 5 should get the calculated style
        const edgeData1 = {value: 10};
        const cvs1 = selectiveStyles.getCalculatedStylesForEdge(edgeData1);
        assert.equal(cvs1.length, 1);

        // Edge with value <= 5 should NOT get the calculated style
        const edgeData2 = {value: 3};
        const cvs2 = selectiveStyles.getCalculatedStylesForEdge(edgeData2);
        assert.equal(cvs2.length, 0);
    });

    it("getCalculatedStylesForEdge handles empty selector (matches all)", () => {
        const edgeData = {value: 5};
        const cvs = styles.getCalculatedStylesForEdge(edgeData);

        // Empty selector should match
        assert.equal(cvs.length, 1);
    });

    it("getCalculatedStylesForEdge returns empty array for layers without calculatedStyle", () => {
        const config = StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            layers: [
                {
                    edge: {
                        selector: "",
                        style: EdgeStyle.parse({
                            line: {width: 2, color: "#FF0000"},
                        }),
                    },
                },
            ],
        });
        const staticStyles = new Styles(config);

        const edgeData = {value: 5};
        const cvs = staticStyles.getCalculatedStylesForEdge(edgeData);

        assert.equal(cvs.length, 0);
    });

    it("getCalculatedStylesForEdge skips layers without edge config", () => {
        const config = StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            layers: [
                {
                    node: {
                        selector: "",
                        style: {},
                        calculatedStyle: {
                            inputs: ["data.value"],
                            output: "style.shape.size",
                            expr: "return arguments[0] * 2;",
                        },
                    },
                },
            ],
        });
        const nodeOnlyStyles = new Styles(config);

        const edgeData = {value: 5};
        const cvs = nodeOnlyStyles.getCalculatedStylesForEdge(edgeData);

        assert.equal(cvs.length, 0);
    });

    it("edge calculated styles use EdgeStyle schema", () => {
        const config = StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            layers: [
                {
                    edge: {
                        selector: "",
                        style: EdgeStyle.parse({}),
                        calculatedStyle: {
                            inputs: ["data.value"],
                            output: "style.line.width",
                            expr: "arguments[0] * 2",
                        },
                    },
                },
            ],
        });
        const edgeStyles = new Styles(config);

        const edgeData = {value: 5};
        const cvs = edgeStyles.getCalculatedStylesForEdge(edgeData);

        // Verify the calculated value can run with EdgeStyle schema
        const result = {} as Record<string, unknown>;
        result.style = {};
        result.data = edgeData;

        cvs[0].run(result);

        // Should have set the width
        assert.deepEqual(result, {
            style: {
                line: {
                    width: 10,
                },
            },
            data: edgeData,
        });
    });

    it("edge calculated styles support complex expressions with StyleHelpers", () => {
        const config = StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            layers: [
                {
                    edge: {
                        selector: "",
                        style: EdgeStyle.parse({}),
                        calculatedStyle: {
                            inputs: ["data.value"],
                            output: "style.line.color",
                            expr: "StyleHelpers.color.sequential.viridis(arguments[0] / 10)",
                        },
                    },
                },
            ],
        });
        const helperStyles = new Styles(config);

        const edgeData = {value: 5};
        const cvs = helperStyles.getCalculatedStylesForEdge(edgeData);

        // Run the calculated value
        const result = {} as Record<string, unknown>;
        result.style = {};
        result.data = edgeData;

        cvs[0].run(result);

        // Should have set a color from the viridis palette
        assert.property(result.style as Record<string, unknown>, "line");
        assert.property((result.style as Record<string, unknown>).line as Record<string, unknown>, "color");
        const {color} = ((result.style as Record<string, unknown>).line as Record<string, unknown>);
        assert.typeOf(color, "string");
        assert.match(color as string, /^#[0-9A-F]{6}$/i);
    });

    it("edge calculated styles support multiple inputs", () => {
        const config = StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            layers: [
                {
                    edge: {
                        selector: "",
                        style: EdgeStyle.parse({}),
                        calculatedStyle: {
                            inputs: ["data.source", "data.target"],
                            output: "style.line.width",
                            expr: "(arguments[0].length + arguments[1].length) / 2",
                        },
                    },
                },
            ],
        });
        const multiInputStyles = new Styles(config);

        const edgeData = {source: "Alice", target: "Bob"};
        const cvs = multiInputStyles.getCalculatedStylesForEdge(edgeData);

        // Run the calculated value
        const result = {} as Record<string, unknown>;
        result.style = {};
        result.data = edgeData;

        cvs[0].run(result);

        // Width should be average of string lengths: (5 + 3) / 2 = 4
        assert.deepEqual(result.style, {
            line: {
                width: 4,
            },
        });
    });

    it("edge calculated styles work with algorithm results", () => {
        const config = StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            layers: [
                {
                    edge: {
                        selector: "",
                        style: EdgeStyle.parse({}),
                        calculatedStyle: {
                            inputs: ["algorithmResults.betweenness"],
                            output: "style.line.width",
                            expr: "Math.max(1, arguments[0] * 10)",
                        },
                    },
                },
            ],
        });
        const algoStyles = new Styles(config);

        const edgeData = {src: "A", dst: "B"};
        const cvs = algoStyles.getCalculatedStylesForEdge(edgeData);

        // Run the calculated value with algorithm results
        const result = {} as Record<string, unknown>;
        result.style = {};
        result.algorithmResults = {betweenness: 0.5};

        cvs[0].run(result);

        // Width should be 0.5 * 10 = 5
        assert.deepEqual(result.style, {
            line: {
                width: 5,
            },
        });
    });

    // Skip: This test requires browser environment (window) for BabylonJS Graph
    it.skip("REGRESSION: edge styleUpdates Proxy merge preserves default arrowHead config", async() => {
        // Regression test for bug where lodash defaultsDeep() didn't properly enumerate
        // Proxy-wrapped styleUpdates, causing merged styles to lose arrowHead configuration
        const {Graph} = await import("../src/Graph");
        const {NullEngine} = await import("@babylonjs/core");

        const engine = new NullEngine();
        const graph = new Graph(engine, undefined, {
            dataSource: "json",
            dataSourceConfig: {
                data: {
                    nodes: [{id: "A"}, {id: "B"}],
                    edges: [{src: "A", dst: "B", value: 5}],
                },
            },
            styleTemplate: {
                graphtyTemplate: true,
                majorVersion: "1",
                graph: {
                    addDefaultStyle: true, // Ensures default edge style with arrowHead is added
                },
                layers: [
                    {
                        edge: {
                            selector: "",
                            style: {},
                            calculatedStyle: {
                                inputs: ["data.value"],
                                output: "style.line.width",
                                expr: "arguments[0] * 2",
                            },
                        },
                    },
                ],
            },
        });

        // Wait for graph to initialize
        await new Promise((resolve) => {
            setTimeout(resolve, 100);
        });

        // Get the edge
        const edges = Array.from(graph.getDataManager().edges.values());
        assert.equal(edges.length, 1, "Should have one edge");
        const edge = edges[0];

        // Trigger update (which will merge Proxy-wrapped styleUpdates with base style)
        edge.update();

        // Get the edge's style
        const {Styles} = await import("../src/Styles");
        const edgeStyle = Styles.getStyleForEdgeStyleId(edge.styleId);

        // Verify that arrowHead configuration was preserved after merge
        assert.ok(edgeStyle.arrowHead, "Edge style should have arrowHead config");
        assert.equal(edgeStyle.arrowHead.type, "normal", "ArrowHead type should be 'normal'");
        assert.ok(edgeStyle.arrowHead.size !== undefined, "ArrowHead size should be defined");
        assert.ok(edgeStyle.arrowHead.color, "ArrowHead color should be defined");

        // Verify calculated style was applied
        assert.equal(edgeStyle.line?.width, 10, "Calculated line width should be 10 (5 * 2)");

        // Cleanup
        graph.dispose();
        engine.dispose();
    });
});
