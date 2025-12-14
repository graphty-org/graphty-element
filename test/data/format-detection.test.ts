import {assert, describe, test} from "vitest";

import {detectFormat} from "../../src/data/format-detection.js";

describe("detectFormat", () => {
    test("detects GraphML from extension", () => {
        assert.strictEqual(detectFormat("graph.graphml", ""), "graphml");
    });

    test("detects GraphML from XML namespace", () => {
        const xml = "<?xml version=\"1.0\"?><graphml xmlns=\"http://graphml.graphdrawing.org/xmlns\">";
        assert.strictEqual(detectFormat("", xml), "graphml");
    });

    test("detects GEXF from namespace", () => {
        const xml = "<gexf xmlns=\"http://gexf.net/1.3\">";
        assert.strictEqual(detectFormat("", xml), "gexf");
    });

    test("detects CSV from extension", () => {
        assert.strictEqual(detectFormat("edges.csv", ""), "csv");
    });

    test("detects GML from content", () => {
        const gml = "graph [\n  node [\n    id 1\n  ]\n]";
        assert.strictEqual(detectFormat("", gml), "gml");
    });

    test("returns null for unknown format", () => {
        assert.strictEqual(detectFormat("unknown.xyz", "random content"), null);
    });

    test("detects JSON from content", () => {
        const json = "{ \"nodes\": [], \"edges\": [] }";
        assert.strictEqual(detectFormat("", json), "json");
    });

    test("detects Pajek from content", () => {
        const pajek = "*Vertices 3\n1 \"Node1\"\n2 \"Node2\"\n3 \"Node3\"";
        assert.strictEqual(detectFormat("", pajek), "pajek");
    });

    test("detects DOT from content", () => {
        const dot = "digraph G {\n  A -> B;\n}";
        assert.strictEqual(detectFormat("", dot), "dot");
    });

    test("handles .xml extension with GraphML namespace", () => {
        const xml = "<?xml version=\"1.0\"?><graphml xmlns=\"http://graphml.graphdrawing.org/xmlns\">";
        assert.strictEqual(detectFormat("graph.xml", xml), "graphml");
    });

    test("handles .xml extension with GEXF namespace", () => {
        const xml = "<gexf xmlns=\"http://gexf.net/1.3\">";
        assert.strictEqual(detectFormat("graph.xml", xml), "gexf");
    });
});
