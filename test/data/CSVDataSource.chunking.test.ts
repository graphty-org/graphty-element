import {assert, describe, test} from "vitest";

import {CSVDataSource} from "../../src/data/CSVDataSource.js";

describe("CSVDataSource paired files chunking", () => {
    test("yields multiple chunks for large paired files", async() => {
        // Create large CSV files
        const nodeCSV = [
            "id,label",
            ... Array.from({length: 2500}, (_, i) => `n${i},Node ${i}`),
        ].join("\n");

        const edgeCSV = [
            "source,target",
            ... Array.from({length: 100}, (_, i) => `n${i},n${i + 1}`),
        ].join("\n");

        // Create File objects
        const nodeFile = new File([nodeCSV], "nodes.csv", {type: "text/csv"});
        const edgeFile = new File([edgeCSV], "edges.csv", {type: "text/csv"});

        const source = new CSVDataSource({
            nodeFile,
            edgeFile,
            chunkSize: 1000,
        });

        const chunks = [];
        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        // Should have 3 chunks (1000, 1000, 500 nodes)
        assert.strictEqual(chunks.length, 3);
        assert.strictEqual(chunks[0].nodes.length, 1000);
        assert.strictEqual(chunks[1].nodes.length, 1000);
        assert.strictEqual(chunks[2].nodes.length, 500);

        // All edges should be in first chunk
        assert.strictEqual(chunks[0].edges.length, 100);
        assert.strictEqual(chunks[1].edges.length, 0);
        assert.strictEqual(chunks[2].edges.length, 0);
    });

    test("handles small paired files", async() => {
        const nodeCSV = "id,label\nn1,Node 1\nn2,Node 2";
        const edgeCSV = "source,target\nn1,n2";

        const nodeFile = new File([nodeCSV], "nodes.csv", {type: "text/csv"});
        const edgeFile = new File([edgeCSV], "edges.csv", {type: "text/csv"});

        const source = new CSVDataSource({
            nodeFile,
            edgeFile,
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
});
