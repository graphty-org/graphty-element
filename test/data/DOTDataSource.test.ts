import {assert, describe, test} from "vitest";

import {DOTDataSource} from "../../src/data/DOTDataSource.js";

describe("DOTDataSource", () => {
    test("parses basic undirected graph", async() => {
        const dot = `graph {
  a;
  b;
  c;
  a -- b;
  b -- c;
}`;

        const source = new DOTDataSource({data: dot});
        const chunks = [];

        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.equal(chunks.length, 1);
        assert.equal(chunks[0].nodes.length, 3);
        assert.equal(chunks[0].edges.length, 2);
        assert.equal(chunks[0].nodes[0].id, "a");
        assert.equal(chunks[0].nodes[1].id, "b");
        assert.equal(chunks[0].nodes[2].id, "c");
        assert.equal(chunks[0].edges[0].src, "a");
        assert.equal(chunks[0].edges[0].dst, "b");
        assert.equal(chunks[0].edges[1].src, "b");
        assert.equal(chunks[0].edges[1].dst, "c");
    });

    test("parses basic directed graph", async() => {
        const dot = `digraph {
  a;
  b;
  c;
  a -> b;
  b -> c;
}`;

        const source = new DOTDataSource({data: dot});
        const chunks = [];

        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.equal(chunks.length, 1);
        assert.equal(chunks[0].nodes.length, 3);
        assert.equal(chunks[0].edges.length, 2);
        assert.equal(chunks[0].edges[0].src, "a");
        assert.equal(chunks[0].edges[0].dst, "b");
    });

    test("parses strict graph", async() => {
        const dot = `strict digraph {
  a -> b;
  b -> c;
}`;

        const source = new DOTDataSource({data: dot});
        const chunks = [];

        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.equal(chunks[0].edges.length, 2);
    });

    test("parses node attributes", async() => {
        const dot = `digraph {
  a [label="Node A", color="red", size=10];
  b [label="Node B", color="blue", size=20];
  a -> b;
}`;

        const source = new DOTDataSource({data: dot});
        const chunks = [];

        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.equal(chunks[0].nodes[0].id, "a");
        assert.equal(chunks[0].nodes[0].label, "Node A");
        assert.equal(chunks[0].nodes[0].color, "red");
        assert.equal(chunks[0].nodes[0].size, 10);
        assert.equal(chunks[0].nodes[1].id, "b");
        assert.equal(chunks[0].nodes[1].label, "Node B");
    });

    test("parses edge attributes", async() => {
        const dot = `digraph {
  a -> b [weight=1.5, label="edge1", color="green"];
  b -> c [weight=2.0, label="edge2"];
}`;

        const source = new DOTDataSource({data: dot});
        const chunks = [];

        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.equal(chunks[0].edges[0].weight, 1.5);
        assert.equal(chunks[0].edges[0].label, "edge1");
        assert.equal(chunks[0].edges[0].color, "green");
        assert.equal(chunks[0].edges[1].weight, 2.0);
        assert.equal(chunks[0].edges[1].label, "edge2");
    });

    test("parses quoted node IDs", async() => {
        const dot = `digraph {
  "node a";
  "node b";
  "node a" -> "node b";
}`;

        const source = new DOTDataSource({data: dot});
        const chunks = [];

        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.equal(chunks[0].nodes[0].id, "node a");
        assert.equal(chunks[0].nodes[1].id, "node b");
        assert.equal(chunks[0].edges[0].src, "node a");
        assert.equal(chunks[0].edges[0].dst, "node b");
    });

    test("parses graph with named graph ID", async() => {
        const dot = `digraph G {
  a -> b;
}`;

        const source = new DOTDataSource({data: dot});
        const chunks = [];

        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.equal(chunks[0].edges.length, 1);
    });

    test("parses implicit nodes from edges", async() => {
        const dot = `digraph {
  a -> b;
  b -> c;
}`;

        const source = new DOTDataSource({data: dot});
        const chunks = [];

        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        // Nodes should be inferred from edges
        assert.equal(chunks[0].nodes.length, 3);
        assert.equal(chunks[0].edges.length, 2);
    });

    test("handles comments", async() => {
        const dot = `digraph {
  // This is a comment
  a -> b; // inline comment
  /* multi-line
     comment */
  b -> c;
}`;

        const source = new DOTDataSource({data: dot});
        const chunks = [];

        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.equal(chunks[0].edges.length, 2);
    });

    test("yields nodes in chunks for large graphs", async() => {
        let dot = "digraph {\n";

        for (let i = 0; i < 5000; i++) {
            dot += `  n${i};\n`;
        }

        dot += "}";

        const source = new DOTDataSource({data: dot});
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

    test("handles subgraphs", async() => {
        const dot = `digraph {
  subgraph cluster_0 {
    a;
    b;
    a -> b;
  }
  subgraph cluster_1 {
    c;
    d;
    c -> d;
  }
  b -> c;
}`;

        const source = new DOTDataSource({data: dot});
        const chunks = [];

        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.equal(chunks[0].nodes.length, 4);
        assert.equal(chunks[0].edges.length, 3);
    });

    test("handles HTML-like labels", async() => {
        const dot = `digraph {
  a [label=<<B>Bold</B> text>];
  a -> b;
}`;

        const source = new DOTDataSource({data: dot});
        const chunks = [];

        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        // HTML-like labels should be preserved
        assert.equal(chunks[0].nodes[0].id, "a");
        assert.isTrue(chunks[0].nodes[0].label.includes("Bold"));
    });

    test("handles numeric node IDs", async() => {
        const dot = `digraph {
  1;
  2;
  3;
  1 -> 2;
  2 -> 3;
}`;

        const source = new DOTDataSource({data: dot});
        const chunks = [];

        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.equal(chunks[0].nodes.length, 3);
        assert.equal(chunks[0].edges.length, 2);
    });

    test("handles empty graph", async() => {
        const dot = "digraph {}";

        const source = new DOTDataSource({data: dot});
        const chunks = [];

        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.equal(chunks.length, 0);
    });
});
