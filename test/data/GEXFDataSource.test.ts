import {assert, describe, test} from "vitest";

import {GEXFDataSource} from "../../src/data/GEXFDataSource.js";

describe("GEXFDataSource", () => {
    test("parses basic GEXF", async() => {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<gexf xmlns="http://gexf.net/1.3" version="1.3">
  <graph mode="static" defaultedgetype="undirected">
    <nodes>
      <node id="n0" label="Node 0"/>
      <node id="n1" label="Node 1"/>
    </nodes>
    <edges>
      <edge id="e0" source="n0" target="n1"/>
    </edges>
  </graph>
</gexf>`;

        const source = new GEXFDataSource({data: xml});
        const chunks = [];

        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.equal(chunks.length, 1);
        assert.equal(chunks[0].nodes.length, 2);
        assert.equal(chunks[0].edges.length, 1);
        assert.equal(chunks[0].nodes[0].id, "n0");
        assert.equal(chunks[0].nodes[0].label, "Node 0");
        assert.equal(chunks[0].nodes[1].id, "n1");
        assert.equal(chunks[0].edges[0].src, "n0");
        assert.equal(chunks[0].edges[0].dst, "n1");
    });

    test("parses attributes from attvalues", async() => {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<gexf xmlns="http://gexf.net/1.3" version="1.3">
  <graph mode="static">
    <attributes class="node">
      <attribute id="0" title="color" type="string"/>
      <attribute id="1" title="size" type="integer"/>
    </attributes>
    <attributes class="edge">
      <attribute id="0" title="weight" type="float"/>
    </attributes>
    <nodes>
      <node id="n0" label="Node 0">
        <attvalues>
          <attvalue for="0" value="red"/>
          <attvalue for="1" value="10"/>
        </attvalues>
      </node>
      <node id="n1" label="Node 1">
        <attvalues>
          <attvalue for="0" value="blue"/>
          <attvalue for="1" value="20"/>
        </attvalues>
      </node>
    </nodes>
    <edges>
      <edge id="e0" source="n0" target="n1">
        <attvalues>
          <attvalue for="0" value="1.5"/>
        </attvalues>
      </edge>
    </edges>
  </graph>
</gexf>`;

        const source = new GEXFDataSource({data: xml});
        const chunks = [];

        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.equal(chunks[0].nodes[0].color, "red");
        assert.equal(chunks[0].nodes[0].size, 10);
        assert.equal(chunks[0].nodes[1].color, "blue");
        assert.equal(chunks[0].nodes[1].size, 20);
        assert.equal(chunks[0].edges[0].weight, 1.5);
    });

    test("parses viz namespace (position, color, size)", async() => {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<gexf xmlns="http://gexf.net/1.3" xmlns:viz="http://gexf.net/1.3/viz" version="1.3">
  <graph mode="static">
    <nodes>
      <node id="n0" label="Node 0">
        <viz:position x="100.0" y="200.0" z="0.0"/>
        <viz:color r="255" g="0" b="0" a="1.0"/>
        <viz:size value="10.0"/>
      </node>
      <node id="n1" label="Node 1">
        <viz:position x="300.0" y="400.0" z="0.0"/>
        <viz:color r="0" g="255" b="0" a="1.0"/>
        <viz:size value="20.0"/>
      </node>
    </nodes>
    <edges>
      <edge id="e0" source="n0" target="n1"/>
    </edges>
  </graph>
</gexf>`;

        const source = new GEXFDataSource({data: xml});
        const chunks = [];

        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.deepEqual(chunks[0].nodes[0].position, {x: 100.0, y: 200.0, z: 0.0});
        assert.deepEqual(chunks[0].nodes[0].color, {r: 255, g: 0, b: 0, a: 1.0});
        assert.equal(chunks[0].nodes[0].size, 10.0);
        assert.deepEqual(chunks[0].nodes[1].position, {x: 300.0, y: 400.0, z: 0.0});
        assert.deepEqual(chunks[0].nodes[1].color, {r: 0, g: 255, b: 0, a: 1.0});
        assert.equal(chunks[0].nodes[1].size, 20.0);
    });

    test("parses directed graph", async() => {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<gexf xmlns="http://gexf.net/1.3" version="1.3">
  <graph mode="static" defaultedgetype="directed">
    <nodes>
      <node id="n0"/>
      <node id="n1"/>
    </nodes>
    <edges>
      <edge id="e0" source="n0" target="n1" type="directed"/>
    </edges>
  </graph>
</gexf>`;

        const source = new GEXFDataSource({data: xml});
        const chunks = [];

        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.equal(chunks[0].edges.length, 1);
    // Edge type can be stored in metadata
    });

    test("yields nodes in chunks for large graphs", async() => {
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<gexf xmlns="http://gexf.net/1.3" version="1.3">
  <graph mode="static">
    <nodes>`;

        for (let i = 0; i < 5000; i++) {
            xml += `<node id="n${i}"/>`;
        }

        xml += `</nodes>
    <edges></edges>
  </graph>
</gexf>`;

        const source = new GEXFDataSource({data: xml});
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

    test("handles missing nodes element", async() => {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<gexf xmlns="http://gexf.net/1.3" version="1.3">
  <graph mode="static">
    <edges>
      <edge id="e0" source="n0" target="n1"/>
    </edges>
  </graph>
</gexf>`;

        const source = new GEXFDataSource({data: xml});
        const chunks = [];

        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.equal(chunks.length, 1);
        assert.equal(chunks[0].nodes.length, 0);
        assert.equal(chunks[0].edges.length, 1);
    });

    test("handles missing edges element", async() => {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<gexf xmlns="http://gexf.net/1.3" version="1.3">
  <graph mode="static">
    <nodes>
      <node id="n0"/>
      <node id="n1"/>
    </nodes>
  </graph>
</gexf>`;

        const source = new GEXFDataSource({data: xml});
        const chunks = [];

        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.equal(chunks.length, 1);
        assert.equal(chunks[0].nodes.length, 2);
        assert.equal(chunks[0].edges.length, 0);
    });

    test("handles empty graph", async() => {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<gexf xmlns="http://gexf.net/1.3" version="1.3">
  <graph mode="static">
  </graph>
</gexf>`;

        const source = new GEXFDataSource({data: xml});
        const chunks = [];

        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.equal(chunks.length, 0);
    });

    test("handles edge weight attribute", async() => {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<gexf xmlns="http://gexf.net/1.3" version="1.3">
  <graph mode="static">
    <nodes>
      <node id="n0"/>
      <node id="n1"/>
    </nodes>
    <edges>
      <edge id="e0" source="n0" target="n1" weight="2.5"/>
    </edges>
  </graph>
</gexf>`;

        const source = new GEXFDataSource({data: xml});
        const chunks = [];

        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.equal(chunks[0].edges[0].weight, 2.5);
    });
});
