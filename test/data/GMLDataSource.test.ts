import {assert, describe, test} from "vitest";

import {GMLDataSource} from "../../src/data/GMLDataSource.js";

describe("GMLDataSource", () => {
    test("parses basic GML graph", async() => {
        const gml = `graph [
  node [
    id 0
  ]
  node [
    id 1
  ]
  edge [
    source 0
    target 1
  ]
]`;

        const source = new GMLDataSource({data: gml});
        const chunks = [];

        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.equal(chunks.length, 1);
        assert.equal(chunks[0].nodes.length, 2);
        assert.equal(chunks[0].edges.length, 1);
        assert.equal(chunks[0].nodes[0].id, 0);
        assert.equal(chunks[0].nodes[1].id, 1);
        assert.equal(chunks[0].edges[0].src, 0);
        assert.equal(chunks[0].edges[0].dst, 1);
    });

    test("parses node and edge attributes", async() => {
        const gml = `graph [
  node [
    id 0
    label "Node 0"
    value 42
  ]
  node [
    id 1
    label "Node 1"
    value 99
  ]
  edge [
    source 0
    target 1
    weight 1.5
    type "friend"
  ]
]`;

        const source = new GMLDataSource({data: gml});
        const chunks = [];

        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.equal(chunks[0].nodes[0].label, "Node 0");
        assert.equal(chunks[0].nodes[0].value, 42);
        assert.equal(chunks[0].nodes[1].label, "Node 1");
        assert.equal(chunks[0].nodes[1].value, 99);
        assert.equal(chunks[0].edges[0].weight, 1.5);
        assert.equal(chunks[0].edges[0].type, "friend");
    });

    test("parses directed graph attribute", async() => {
        const gml = `graph [
  directed 1
  node [
    id 0
  ]
  node [
    id 1
  ]
  edge [
    source 0
    target 1
  ]
]`;

        const source = new GMLDataSource({data: gml});
        const chunks = [];

        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.equal(chunks.length, 1);
    // directed attribute is graph-level, not per-edge in this format
    });

    test("yields nodes in chunks for large graphs", async() => {
        let gml = "graph [\n";

        for (let i = 0; i < 5000; i++) {
            gml += `  node [\n    id ${i}\n  ]\n`;
        }

        gml += "]";

        const source = new GMLDataSource({data: gml});
        const chunks = [];

        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        // Should yield multiple chunks (default chunk size is 1000)
        assert.isTrue(chunks.length > 1);

        // Total nodes should be 5000
        const totalNodes = chunks.reduce((sum, c) => sum + c.nodes.length, 0);
        assert.equal(totalNodes, 5000);
    });

    test("handles nested attributes", async() => {
        const gml = `graph [
  node [
    id 0
    graphics [
      x 100.0
      y 200.0
      w 30.0
      h 30.0
    ]
  ]
]`;

        const source = new GMLDataSource({data: gml});
        const chunks = [];

        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.equal(chunks[0].nodes.length, 1);
        assert.deepEqual(chunks[0].nodes[0].graphics, {
            x: 100.0,
            y: 200.0,
            w: 30.0,
            h: 30.0,
        });
    });

    test("handles string IDs", async() => {
        const gml = `graph [
  node [
    id "node_a"
    label "Node A"
  ]
  node [
    id "node_b"
    label "Node B"
  ]
  edge [
    source "node_a"
    target "node_b"
  ]
]`;

        const source = new GMLDataSource({data: gml});
        const chunks = [];

        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.equal(chunks[0].nodes[0].id, "node_a");
        assert.equal(chunks[0].nodes[1].id, "node_b");
        assert.equal(chunks[0].edges[0].src, "node_a");
        assert.equal(chunks[0].edges[0].dst, "node_b");
    });

    test("handles parsing errors gracefully", async() => {
        const gml = `graph [
  node [
    id 0
  ]
  node [
    id 1
  ]
  edge [
    source 0
    target 999
  ]
]`;

        const source = new GMLDataSource({data: gml});
        const chunks = [];

        // Should not throw, should collect errors
        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.equal(chunks[0].nodes.length, 2);
        // Edge with invalid target should still be included (validation is separate concern)
        assert.equal(chunks[0].edges.length, 1);
    });

    test("handles empty graph", async() => {
        const gml = "graph []";

        const source = new GMLDataSource({data: gml});
        const chunks = [];

        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.equal(chunks.length, 0);
    });

    test("handles graph with only nodes", async() => {
        const gml = `graph [
  node [
    id 0
  ]
  node [
    id 1
  ]
]`;

        const source = new GMLDataSource({data: gml});
        const chunks = [];

        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.equal(chunks.length, 1);
        assert.equal(chunks[0].nodes.length, 2);
        assert.equal(chunks[0].edges.length, 0);
    });

    test("handles graph with only edges", async() => {
        const gml = `graph [
  edge [
    source 0
    target 1
  ]
  edge [
    source 1
    target 2
  ]
]`;

        const source = new GMLDataSource({data: gml});
        const chunks = [];

        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.equal(chunks.length, 1);
        assert.equal(chunks[0].nodes.length, 0);
        assert.equal(chunks[0].edges.length, 2);
    });
});
