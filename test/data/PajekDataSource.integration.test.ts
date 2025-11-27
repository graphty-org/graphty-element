import {readFileSync} from "node:fs";
import {join} from "node:path";

import {assert, describe, it} from "vitest";

import {PajekDataSource} from "../../src/data/PajekDataSource.js";

describe("PajekDataSource Integration Tests", () => {
    it("should load simple-graph.net file", async() => {
        const filePath = join(__dirname, "../helpers/simple-graph.net");
        const data = readFileSync(filePath, "utf-8");

        const source = new PajekDataSource({data});
        const gen = source.sourceFetchData();
        const chunk = await gen.next();

        assert.ok(chunk.value);
        assert.equal(chunk.value.nodes.length, 4);
        assert.equal(chunk.value.edges.length, 4);

        // Verify nodes
        assert.equal(chunk.value.nodes[0].id, "1");
        assert.equal(chunk.value.nodes[0].label, "Node A");
        assert.equal(chunk.value.nodes[0].x, 0.0);
        assert.equal(chunk.value.nodes[0].y, 1.0);
        assert.equal(chunk.value.nodes[0].z, 0.5);

        assert.equal(chunk.value.nodes[1].id, "2");
        assert.equal(chunk.value.nodes[1].label, "Node B");

        // Verify edges
        // First 2 edges are arcs (directed)
        assert.equal(chunk.value.edges[0].src, "1");
        assert.equal(chunk.value.edges[0].dst, "2");
        assert.equal(chunk.value.edges[0].directed, true);
        assert.equal(chunk.value.edges[0].weight, 1);

        assert.equal(chunk.value.edges[1].src, "2");
        assert.equal(chunk.value.edges[1].dst, "3");
        assert.equal(chunk.value.edges[1].directed, true);
        assert.equal(chunk.value.edges[1].weight, 2);

        // Last 2 edges are undirected
        assert.equal(chunk.value.edges[2].src, "3");
        assert.equal(chunk.value.edges[2].dst, "4");
        assert.equal(chunk.value.edges[2].directed, false);
        assert.equal(chunk.value.edges[2].weight, 1);

        assert.equal(chunk.value.edges[3].src, "1");
        assert.equal(chunk.value.edges[3].dst, "4");
        assert.equal(chunk.value.edges[3].directed, false);
    });

    it("should load mixed-graph.net file", async() => {
        const filePath = join(__dirname, "../helpers/mixed-graph.net");
        const data = readFileSync(filePath, "utf-8");

        const source = new PajekDataSource({data});
        const gen = source.sourceFetchData();
        const chunk = await gen.next();

        assert.ok(chunk.value);
        assert.equal(chunk.value.nodes.length, 5);
        assert.equal(chunk.value.edges.length, 6);

        // Verify mixed directed and undirected edges
        const directedCount = chunk.value.edges.filter((e) => e.directed).length;
        const undirectedCount = chunk.value.edges.filter((e) => !e.directed).length;

        assert.equal(directedCount, 3); // From *Arcs section
        assert.equal(undirectedCount, 3); // From *Edges section

        // Verify nodes with partial coordinates
        assert.equal(chunk.value.nodes[0].id, "1");
        assert.equal(chunk.value.nodes[0].x, 0.1);
        assert.equal(chunk.value.nodes[0].y, 0.2);
        assert.equal(chunk.value.nodes[0].z, 0.3);

        assert.equal(chunk.value.nodes[2].id, "3");
        assert.equal(chunk.value.nodes[2].label, "Charlie");
        // Node 3 has no coordinates
        assert.isUndefined(chunk.value.nodes[2].x);
    });
});
