import {assert, describe, test} from "vitest";

import {JsonDataSource} from "../../src/data/JsonDataSource.js";

describe("JsonDataSource streaming", () => {
    test("yields multiple chunks for large datasets", async() => {
        // Create large dataset (2500 nodes)
        const nodes = Array.from({length: 2500}, (_, i) => ({
            id: `n${i}`,
            value: Math.random(),
        }));

        const edges = [{src: "n0", dst: "n1"}];

        const source = new JsonDataSource({
            data: JSON.stringify({nodes, edges}),
            chunkSize: 1000,
        });

        const chunks = [];
        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        // Should have 3 chunks (1000, 1000, 500)
        assert.strictEqual(chunks.length, 3);
        assert.strictEqual(chunks[0].nodes.length, 1000);
        assert.strictEqual(chunks[1].nodes.length, 1000);
        assert.strictEqual(chunks[2].nodes.length, 500);

        // Edges only in first chunk
        assert.strictEqual(chunks[0].edges.length, 1);
        assert.strictEqual(chunks[1].edges.length, 0);
    });

    test("handles single chunk for small datasets", async() => {
        const nodes = [{id: "n1"}, {id: "n2"}];
        const edges = [{src: "n1", dst: "n2"}];

        const source = new JsonDataSource({
            data: JSON.stringify({nodes, edges}),
            chunkSize: 1000,
        });

        const chunks = [];
        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.strictEqual(chunks.length, 1);
        assert.strictEqual(chunks[0].nodes.length, 2);
        assert.strictEqual(chunks[0].edges.length, 1);
    });

    test("respects custom chunk size", async() => {
        const nodes = Array.from({length: 150}, (_, i) => ({id: `n${i}`}));
        const edges: {src: string, dst: string}[] = [];

        const source = new JsonDataSource({
            data: JSON.stringify({nodes, edges}),
            chunkSize: 50,
        });

        const chunks = [];
        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.strictEqual(chunks.length, 3);
        assert.strictEqual(chunks[0].nodes.length, 50);
        assert.strictEqual(chunks[1].nodes.length, 50);
        assert.strictEqual(chunks[2].nodes.length, 50);
    });
});
