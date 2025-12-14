import {assert, describe, test} from "vitest";

import {CSVDataSource} from "../../src/data/CSVDataSource.js";

describe("CSVDataSource edge creation", () => {
    test("creates edge with all properties preserved", async() => {
        const csv = `source,target,weight,type,color
n1,n2,1.5,friend,#ff0000`;

        const source = new CSVDataSource({data: csv});
        const chunks = [];
        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        const edge = chunks[0].edges[0];
        assert.strictEqual(edge.src, "n1");
        assert.strictEqual(edge.dst, "n2");
        assert.strictEqual(edge.weight, 1.5);
        assert.strictEqual(edge.type, "friend");
        assert.strictEqual(edge.color, "#ff0000");
    });

    test("handles missing source gracefully", async() => {
        const csv = `source,target
,n2
n3,n4`;

        const source = new CSVDataSource({data: csv});
        const chunks = [];
        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        // First edge should be skipped due to missing source
        assert.strictEqual(chunks[0].edges.length, 1);
        assert.strictEqual(chunks[0].edges[0].src, "n3");

        const errors = source.getErrorAggregator().getErrors();
        assert.strictEqual(errors.length, 1);
        assert.include(errors[0].message, "Missing source");
    });

    test("handles missing target gracefully", async() => {
        const csv = `source,target
n1,
n3,n4`;

        const source = new CSVDataSource({data: csv});
        const chunks = [];
        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.strictEqual(chunks[0].edges.length, 1);
        assert.strictEqual(chunks[0].edges[0].src, "n3");

        const errors = source.getErrorAggregator().getErrors();
        assert.strictEqual(errors.length, 1);
        assert.include(errors[0].message, "Missing target");
    });

    test("converts source and target to strings", async() => {
        const csv = `source,target
123,456
true,false`;

        const source = new CSVDataSource({data: csv});
        const chunks = [];
        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.strictEqual(typeof chunks[0].edges[0].src, "string");
        assert.strictEqual(typeof chunks[0].edges[0].dst, "string");
        assert.strictEqual(chunks[0].edges[0].src, "123");
        assert.strictEqual(chunks[0].edges[1].src, "true");
    });
});
