import {assert, describe, test} from "vitest";
import {z} from "zod/v4";

import {JsonDataSource} from "../../src/data/JsonDataSource.js";

describe("Validation error handling", () => {
    test("collects validation errors instead of throwing", async() => {
        const schema = z.object({
            id: z.string(),
            value: z.number(),
        });

        const data = {
            nodes: [
                {id: "n1", value: 42},
                {id: "n2", value: "invalid"}, // Type error
                {id: 3, value: 10}, // Type error
            ],
            edges: [],
        };

        const source = new JsonDataSource({
            data: JSON.stringify(data),
            node: {schema},
        });

        const chunks = [];
        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        const errors = source.getErrorAggregator().getErrors();
        assert.strictEqual(errors.length, 2, "Should have 2 validation errors");
        assert.include(errors[0].message, "value");
        assert.strictEqual(errors[0].category, "validation-error");

        // Should have filtered out invalid nodes, keeping only valid one
        assert.strictEqual(chunks.length, 1, "Should have 1 chunk");
        assert.strictEqual(chunks[0].nodes.length, 1, "Should have 1 valid node");
        assert.strictEqual(chunks[0].nodes[0].id, "n1");
    });

    test("stops processing after hitting error limit", async() => {
        // Create data with 150 validation errors, limit=100
        const nodes = Array.from({length: 150}, (_, i) => ({
            id: i, // Should be string, not number
            value: 10,
        }));

        const source = new JsonDataSource({
            data: JSON.stringify({nodes, edges: []}),
            node: {schema: z.object({id: z.string(), value: z.number()})},
            errorLimit: 100,
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const chunk of source.getData()) {
            // Process chunks
        }

        const errors = source.getErrorAggregator().getErrors();
        assert.strictEqual(errors.length, 100, "Should stop at error limit");
    });

    test("validates edges with schema", async() => {
        const edgeSchema = z.object({
            src: z.string(),
            dst: z.string(),
            weight: z.number(),
        });

        const data = {
            nodes: [{id: "n1"}, {id: "n2"}],
            edges: [
                {src: "n1", dst: "n2", weight: 1.5},
                {src: "n1", dst: "n2", weight: "invalid"}, // Type error
                {src: "n1", dst: "n2", weight: 2.0},
            ],
        };

        const source = new JsonDataSource({
            data: JSON.stringify(data),
            edge: {schema: edgeSchema},
        });

        const chunks = [];
        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        const errors = source.getErrorAggregator().getErrors();
        assert.strictEqual(errors.length, 1, "Should have 1 edge validation error");

        // Should have filtered out invalid edge, keeping only 2 valid ones
        assert.strictEqual(chunks[0].edges.length, 2);
    });
});
