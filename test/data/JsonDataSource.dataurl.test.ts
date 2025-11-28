import {assert, describe, test} from "vitest";

import {JsonDataSource} from "../../src/data/JsonDataSource";

describe("JsonDataSource - Data URL support", () => {
    test("should parse data URL encoded JSON", async() => {
        const testData = {
            nodes: [{id: "1"}, {id: "2"}],
            edges: [{source: "1", target: "2"}],
        };

        const dataUrl = `data:application/json,${encodeURIComponent(JSON.stringify(testData))}`;

        const source = new JsonDataSource({
            data: dataUrl,
            node: {path: "nodes"},
            edge: {path: "edges"},
        });

        const chunks = [];
        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.equal(chunks.length, 1, "Should have 1 chunk");
        assert.equal(chunks[0].nodes.length, 2, "Should have 2 nodes");
        assert.equal(chunks[0].edges.length, 1, "Should have 1 edge");
    });

    test("should handle data URL with Cytoscape.js format", async() => {
        const testData = {
            elements: {
                nodes: [{data: {id: "a"}}, {data: {id: "b"}}],
                edges: [{data: {source: "a", target: "b"}}],
            },
        };

        const dataUrl = `data:application/json,${encodeURIComponent(JSON.stringify(testData))}`;

        const source = new JsonDataSource({
            data: dataUrl,
            node: {path: "elements.nodes[*].data"},
            edge: {path: "elements.edges[*].data"},
        });

        const chunks = [];
        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.equal(chunks.length, 1, "Should have 1 chunk");
        assert.equal(chunks[0].nodes.length, 2, "Should have 2 nodes");
        assert.equal(chunks[0].edges.length, 1, "Should have 1 edge");
        assert.equal(chunks[0].nodes[0].id, "a", "First node should have id 'a'");
    });

    test("should still work with inline JSON string", async() => {
        const testData = {
            nodes: [{id: "1"}],
            edges: [],
        };

        const source = new JsonDataSource({
            data: JSON.stringify(testData),
            node: {path: "nodes"},
            edge: {path: "edges"},
        });

        const chunks = [];
        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.equal(chunks.length, 1, "Should have 1 chunk");
        assert.equal(chunks[0].nodes.length, 1, "Should have 1 node");
    });
});
