import {assert, describe, it} from "vitest";

import {PajekDataSource} from "../../src/data/PajekDataSource.js";

describe("PajekDataSource", () => {
    describe("constructor", () => {
        it("should create instance with data string", () => {
            const source = new PajekDataSource({
                data: "*Vertices 1\n1 \"A\"\n",
            });
            assert.ok(source);
            assert.equal(source.type, "pajek");
        });

        it("should create instance with url", () => {
            const source = new PajekDataSource({
                url: "https://example.com/graph.net",
            });
            assert.ok(source);
        });

        it("should throw error if no data source provided", async() => {
            const source = new PajekDataSource({});
            let error: Error | null = null;
            try {
                const gen = source.sourceFetchData();
                await gen.next();
            } catch (err) {
                error = err as Error;
            }
            assert.ok(error);
            assert.match(error.message, /requires data, file, or url/i);
        });
    });

    describe("parsing vertices", () => {
        it("should parse simple vertices", async() => {
            const data = `*Vertices 2
1 "Node1"
2 "Node2"`;
            const source = new PajekDataSource({data});
            const gen = source.sourceFetchData();
            const chunk = await gen.next();

            assert.ok(chunk.value);
            assert.equal(chunk.value.nodes.length, 2);
            assert.equal(chunk.value.nodes[0].id, "1");
            assert.equal(chunk.value.nodes[0].label, "Node1");
            assert.equal(chunk.value.nodes[1].id, "2");
            assert.equal(chunk.value.nodes[1].label, "Node2");
        });

        it("should parse vertices with coordinates", async() => {
            const data = `*Vertices 3
1 "A" 0.1 0.2 0.3
2 "B" 0.4 0.5 0.6
3 "C" 1.0 2.0 3.0`;
            const source = new PajekDataSource({data});
            const gen = source.sourceFetchData();
            const chunk = await gen.next();

            assert.ok(chunk.value);
            assert.equal(chunk.value.nodes.length, 3);
            assert.equal(chunk.value.nodes[0].x, 0.1);
            assert.equal(chunk.value.nodes[0].y, 0.2);
            assert.equal(chunk.value.nodes[0].z, 0.3);
            assert.equal(chunk.value.nodes[2].x, 1.0);
            assert.equal(chunk.value.nodes[2].y, 2.0);
            assert.equal(chunk.value.nodes[2].z, 3.0);
        });

        it("should handle partial coordinates", async() => {
            const data = `*Vertices 2
1 "A" 0.1 0.2
2 "B"`;
            const source = new PajekDataSource({data});
            const gen = source.sourceFetchData();
            const chunk = await gen.next();

            assert.ok(chunk.value);
            assert.equal(chunk.value.nodes[0].x, 0.1);
            assert.equal(chunk.value.nodes[0].y, 0.2);
            assert.isUndefined(chunk.value.nodes[0].z);
            assert.isUndefined(chunk.value.nodes[1].x);
        });

        it("should convert 1-indexed IDs to strings", async() => {
            const data = `*Vertices 3
1 "First"
2 "Second"
3 "Third"`;
            const source = new PajekDataSource({data});
            const gen = source.sourceFetchData();
            const chunk = await gen.next();

            assert.ok(chunk.value);
            assert.equal(chunk.value.nodes[0].id, "1");
            assert.equal(chunk.value.nodes[1].id, "2");
            assert.equal(chunk.value.nodes[2].id, "3");
        });

        it("should handle vertices without labels", async() => {
            const data = `*Vertices 2
1
2`;
            const source = new PajekDataSource({data});
            const gen = source.sourceFetchData();
            const chunk = await gen.next();

            assert.ok(chunk.value);
            assert.equal(chunk.value.nodes.length, 2);
            assert.equal(chunk.value.nodes[0].id, "1");
            assert.isUndefined(chunk.value.nodes[0].label);
        });
    });

    describe("parsing arcs (directed edges)", () => {
        it("should parse arcs", async() => {
            const data = `*Vertices 2
1 "A"
2 "B"
*Arcs
1 2 1.0`;
            const source = new PajekDataSource({data});
            const gen = source.sourceFetchData();
            const chunk = await gen.next();

            assert.ok(chunk.value);
            assert.equal(chunk.value.edges.length, 1);
            assert.equal(chunk.value.edges[0].src, "1");
            assert.equal(chunk.value.edges[0].dst, "2");
            assert.equal(chunk.value.edges[0].directed, true);
            assert.equal(chunk.value.edges[0].weight, 1.0);
        });

        it("should parse multiple arcs", async() => {
            const data = `*Vertices 3
1 "A"
2 "B"
3 "C"
*Arcs
1 2 1.5
2 3 2.0
3 1 0.5`;
            const source = new PajekDataSource({data});
            const gen = source.sourceFetchData();
            const chunk = await gen.next();

            assert.ok(chunk.value);
            assert.equal(chunk.value.edges.length, 3);
            assert.equal(chunk.value.edges[0].weight, 1.5);
            assert.equal(chunk.value.edges[1].weight, 2.0);
            assert.equal(chunk.value.edges[2].weight, 0.5);
        });

        it("should handle arcs without weights", async() => {
            const data = `*Vertices 2
1 "A"
2 "B"
*Arcs
1 2`;
            const source = new PajekDataSource({data});
            const gen = source.sourceFetchData();
            const chunk = await gen.next();

            assert.ok(chunk.value);
            assert.equal(chunk.value.edges.length, 1);
            assert.isUndefined(chunk.value.edges[0].weight);
        });
    });

    describe("parsing edges (undirected)", () => {
        it("should parse edges", async() => {
            const data = `*Vertices 2
1 "A"
2 "B"
*Edges
1 2 1.0`;
            const source = new PajekDataSource({data});
            const gen = source.sourceFetchData();
            const chunk = await gen.next();

            assert.ok(chunk.value);
            assert.equal(chunk.value.edges.length, 1);
            assert.equal(chunk.value.edges[0].src, "1");
            assert.equal(chunk.value.edges[0].dst, "2");
            assert.equal(chunk.value.edges[0].directed, false);
            assert.equal(chunk.value.edges[0].weight, 1.0);
        });

        it("should parse multiple edges", async() => {
            const data = `*Vertices 3
1 "A"
2 "B"
3 "C"
*Edges
1 2 1.0
2 3 2.0`;
            const source = new PajekDataSource({data});
            const gen = source.sourceFetchData();
            const chunk = await gen.next();

            assert.ok(chunk.value);
            assert.equal(chunk.value.edges.length, 2);
            assert.equal(chunk.value.edges[0].directed, false);
            assert.equal(chunk.value.edges[1].directed, false);
        });
    });

    describe("mixed graphs", () => {
        it("should handle both arcs and edges", async() => {
            const data = `*Vertices 4
1 "A"
2 "B"
3 "C"
4 "D"
*Arcs
1 2 1.0
2 3 1.5
*Edges
3 4 2.0
1 4 1.0`;
            const source = new PajekDataSource({data});
            const gen = source.sourceFetchData();
            const chunk = await gen.next();

            assert.ok(chunk.value);
            assert.equal(chunk.value.edges.length, 4);

            // First two should be directed (arcs)
            assert.equal(chunk.value.edges[0].directed, true);
            assert.equal(chunk.value.edges[1].directed, true);

            // Last two should be undirected (edges)
            assert.equal(chunk.value.edges[2].directed, false);
            assert.equal(chunk.value.edges[3].directed, false);
        });
    });

    describe("chunking", () => {
        it("should respect chunkSize parameter", async() => {
            const data = `*Vertices 5
1 "A"
2 "B"
3 "C"
4 "D"
5 "E"`;
            const source = new PajekDataSource({data, chunkSize: 2});
            const gen = source.sourceFetchData();

            const chunk1 = await gen.next();
            assert.equal(chunk1.value?.nodes.length, 2);

            const chunk2 = await gen.next();
            assert.equal(chunk2.value?.nodes.length, 2);

            const chunk3 = await gen.next();
            assert.equal(chunk3.value?.nodes.length, 1);

            const chunk4 = await gen.next();
            assert.equal(chunk4.done, true);
        });

        it("should include all edges with first chunk", async() => {
            const data = `*Vertices 4
1 "A"
2 "B"
3 "C"
4 "D"
*Edges
1 2
2 3
3 4`;
            const source = new PajekDataSource({data, chunkSize: 2});
            const gen = source.sourceFetchData();

            const chunk1 = await gen.next();
            assert.equal(chunk1.value?.nodes.length, 2);
            assert.equal(chunk1.value?.edges.length, 3); // All edges with first chunk

            const chunk2 = await gen.next();
            assert.equal(chunk2.value?.nodes.length, 2);
            assert.equal(chunk2.value?.edges.length, 0); // No edges in subsequent chunks
        });
    });

    describe("error handling", () => {
        it("should handle malformed vertex lines gracefully", async() => {
            const data = `*Vertices 3
1 "A"
2 "B"
3 "C"`;
            const source = new PajekDataSource({data});
            const gen = source.sourceFetchData();
            const chunk = await gen.next();

            assert.ok(chunk.value);
            // All lines are valid
            assert.equal(chunk.value.nodes.length, 3);
            assert.equal(chunk.value.nodes[0].id, "1");
            assert.equal(chunk.value.nodes[1].id, "2");
            assert.equal(chunk.value.nodes[2].id, "3");
        });

        it("should handle malformed edge lines gracefully", async() => {
            const data = `*Vertices 3
1 "A"
2 "B"
3 "C"
*Edges
1 2 1.0
2 3 1.0
1 3 0.5`;
            const source = new PajekDataSource({data});
            const gen = source.sourceFetchData();
            const chunk = await gen.next();

            assert.ok(chunk.value);
            assert.equal(chunk.value.edges.length, 3);
        });

        it("should track errors in ErrorAggregator", async() => {
            const data = `*Vertices 2
1 "A"
2 "B"
*Edges
1 2`;
            const source = new PajekDataSource({data});
            const gen = source.sourceFetchData();
            await gen.next();

            const errorAggregator = source.getErrorAggregator();
            // Since all data is valid, no errors should be tracked
            assert.equal(errorAggregator.getErrorCount(), 0);
        });
    });

    describe("empty sections", () => {
        it("should handle vertices-only file", async() => {
            const data = `*Vertices 2
1 "A"
2 "B"`;
            const source = new PajekDataSource({data});
            const gen = source.sourceFetchData();
            const chunk = await gen.next();

            assert.ok(chunk.value);
            assert.equal(chunk.value.nodes.length, 2);
            assert.equal(chunk.value.edges.length, 0);
        });

        it("should handle empty arcs section", async() => {
            const data = `*Vertices 2
1 "A"
2 "B"
*Arcs
*Edges
1 2`;
            const source = new PajekDataSource({data});
            const gen = source.sourceFetchData();
            const chunk = await gen.next();

            assert.ok(chunk.value);
            assert.equal(chunk.value.edges.length, 1);
            assert.equal(chunk.value.edges[0].directed, false);
        });
    });

    describe("whitespace and comments", () => {
        it("should handle extra whitespace", async() => {
            const data = `*Vertices 2
  1   "A"
     2 "B"
*Edges
  1   2   1.0  `;
            const source = new PajekDataSource({data});
            const gen = source.sourceFetchData();
            const chunk = await gen.next();

            assert.ok(chunk.value);
            assert.equal(chunk.value.nodes.length, 2);
            assert.equal(chunk.value.edges.length, 1);
        });

        it("should handle blank lines", async() => {
            const data = `*Vertices 2

1 "A"

2 "B"

*Edges

1 2`;
            const source = new PajekDataSource({data});
            const gen = source.sourceFetchData();
            const chunk = await gen.next();

            assert.ok(chunk.value);
            assert.equal(chunk.value.nodes.length, 2);
            assert.equal(chunk.value.edges.length, 1);
        });
    });
});
