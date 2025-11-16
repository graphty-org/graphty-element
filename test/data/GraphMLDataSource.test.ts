import {assert, describe, test} from "vitest";

import {GraphMLDataSource} from "../../src/data/GraphMLDataSource.js";

describe("GraphMLDataSource", () => {
    test("parses basic GraphML", async() => {
        const xml = `<?xml version="1.0"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns">
  <graph edgedefault="undirected">
    <node id="n0"/>
    <node id="n1"/>
    <edge source="n0" target="n1"/>
  </graph>
</graphml>`;

        const source = new GraphMLDataSource({data: xml});
        const chunks = [];

        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.strictEqual(chunks.length, 1);
        assert.strictEqual(chunks[0].nodes.length, 2);
        assert.strictEqual(chunks[0].edges.length, 1);
        assert.strictEqual(chunks[0].nodes[0].id, "n0");
        assert.strictEqual(chunks[0].edges[0].src, "n0");
        assert.strictEqual(chunks[0].edges[0].dst, "n1");
    });

    test("parses key definitions and data elements", async() => {
        const xml = `<?xml version="1.0"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns">
  <key id="d0" for="node" attr.name="color" attr.type="string"/>
  <key id="d1" for="edge" attr.name="weight" attr.type="double"/>
  <graph>
    <node id="n0">
      <data key="d0">red</data>
    </node>
    <node id="n1">
      <data key="d0">blue</data>
    </node>
    <edge source="n0" target="n1">
      <data key="d1">1.5</data>
    </edge>
  </graph>
</graphml>`;

        const source = new GraphMLDataSource({data: xml});
        const chunks = [];

        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.strictEqual(chunks[0].nodes[0].color, "red");
        assert.strictEqual(chunks[0].nodes[1].color, "blue");
        assert.strictEqual(chunks[0].edges[0].weight, 1.5);
    });

    test("yields nodes in chunks for large graphs", async() => {
        // Create GraphML with 5000 nodes
        let xml = `<?xml version="1.0"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns">
  <graph>`;

        for (let i = 0; i < 5000; i++) {
            xml += `<node id="n${i}"/>`;
        }
        xml += "</graph></graphml>";

        const source = new GraphMLDataSource({data: xml});
        const chunks = [];

        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        // Should yield multiple chunks (default chunk size is 1000)
        assert.isTrue(chunks.length > 1);

        // Total nodes should be 5000
        const totalNodes = chunks.reduce((sum, c) => sum + c.nodes.length, 0);
        assert.strictEqual(totalNodes, 5000);
    });

    test("handles parsing errors gracefully", async() => {
        const xml = `<?xml version="1.0"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns">
  <graph>
    <node id="n0"/>
    <node id="n1"/>
    <edge source="n0" target="n999"/>
    <edge source="n1" target="n2"/>
  </graph>
</graphml>`;

        const source = new GraphMLDataSource({data: xml});
        const chunks = [];

        // Should not throw, should collect errors
        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.strictEqual(chunks[0].nodes.length, 2);
        // Both edges should be included (we don't validate node existence at parse time)
        assert.strictEqual(chunks[0].edges.length, 2);
    });

    test("parses nodes without edges", async() => {
        const xml = `<?xml version="1.0"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns">
  <graph>
    <node id="n0"/>
    <node id="n1"/>
  </graph>
</graphml>`;

        const source = new GraphMLDataSource({data: xml});
        const chunks = [];

        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.strictEqual(chunks[0].nodes.length, 2);
        assert.strictEqual(chunks[0].edges.length, 0);
    });

    test("handles empty graph", async() => {
        const xml = `<?xml version="1.0"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns">
  <graph/>
</graphml>`;

        const source = new GraphMLDataSource({data: xml});
        const chunks = [];

        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        // Should yield at least one empty chunk or no chunks
        assert.isTrue(chunks.length === 0 || (chunks.length === 1 && chunks[0].nodes.length === 0));
    });

    test("parses multiple data types correctly", async() => {
        const xml = `<?xml version="1.0"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns">
  <key id="d0" for="node" attr.name="intValue" attr.type="int"/>
  <key id="d1" for="node" attr.name="floatValue" attr.type="float"/>
  <key id="d2" for="node" attr.name="boolValue" attr.type="boolean"/>
  <key id="d3" for="node" attr.name="stringValue" attr.type="string"/>
  <graph>
    <node id="n0">
      <data key="d0">42</data>
      <data key="d1">3.14</data>
      <data key="d2">true</data>
      <data key="d3">hello</data>
    </node>
  </graph>
</graphml>`;

        const source = new GraphMLDataSource({data: xml});
        const chunks = [];

        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        const node = chunks[0].nodes[0];
        assert.strictEqual(node.intValue, 42);
        assert.strictEqual(node.floatValue, 3.14);
        assert.strictEqual(node.boolValue, true);
        assert.strictEqual(node.stringValue, "hello");
    });

    describe("yFiles GraphML support", () => {
        test("parses yFiles ShapeNode visual properties", async() => {
            const xml = `<?xml version="1.0"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns" xmlns:y="http://www.yworks.com/xml/graphml">
  <key id="d0" for="node" yfiles.type="nodegraphics"/>
  <graph>
    <node id="n0">
      <data key="d0">
        <y:ShapeNode>
          <y:Geometry x="100.0" y="200.0" width="60.0" height="30.0"/>
          <y:Fill color="#FFCC00" transparent="false"/>
          <y:BorderStyle color="#000000" type="line" width="2.0"/>
          <y:NodeLabel>Test Node</y:NodeLabel>
          <y:Shape type="rectangle"/>
        </y:ShapeNode>
      </data>
    </node>
  </graph>
</graphml>`;

            const source = new GraphMLDataSource({data: xml});
            const chunks = [];

            for await (const chunk of source.getData()) {
                chunks.push(chunk);
            }

            const node = chunks[0].nodes[0];
            assert.strictEqual(node.id, "n0");
            assert.strictEqual(node.position.x, 100.0);
            assert.strictEqual(node.position.y, 200.0);
            assert.strictEqual(node.position.z, 0);
            assert.strictEqual(node.width, 60.0);
            assert.strictEqual(node.height, 30.0);
            assert.strictEqual(node.color, "#FFCC00");
            assert.strictEqual(node.borderColor, "#000000");
            assert.strictEqual(node.borderWidth, 2.0);
            assert.strictEqual(node.label, "Test Node");
            assert.strictEqual(node.shape, "box"); // rectangle maps to box
        });

        test("parses yFiles PolyLineEdge visual properties", async() => {
            const xml = `<?xml version="1.0"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns" xmlns:y="http://www.yworks.com/xml/graphml">
  <key id="d0" for="edge" yfiles.type="edgegraphics"/>
  <graph>
    <node id="n0"/>
    <node id="n1"/>
    <edge id="e0" source="n0" target="n1">
      <data key="d0">
        <y:PolyLineEdge>
          <y:LineStyle color="#FF0000" type="line" width="3.0"/>
          <y:Arrows source="none" target="standard"/>
        </y:PolyLineEdge>
      </data>
    </edge>
  </graph>
</graphml>`;

            const source = new GraphMLDataSource({data: xml});
            const chunks = [];

            for await (const chunk of source.getData()) {
                chunks.push(chunk);
            }

            const edge = chunks[0].edges[0];
            assert.strictEqual(edge.src, "n0");
            assert.strictEqual(edge.dst, "n1");
            assert.strictEqual(edge.color, "#FF0000");
            assert.strictEqual(edge.width, 3.0);
            assert.strictEqual(edge.directed, true); // target arrow means directed
        });

        test("maps yFiles shape types to Graphty shapes", async() => {
            const xml = `<?xml version="1.0"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns" xmlns:y="http://www.yworks.com/xml/graphml">
  <key id="d0" for="node" yfiles.type="nodegraphics"/>
  <graph>
    <node id="n0">
      <data key="d0">
        <y:ShapeNode>
          <y:Geometry x="0.0" y="0.0" width="30.0" height="30.0"/>
          <y:Fill color="#FFFFFF"/>
          <y:Shape type="ellipse"/>
        </y:ShapeNode>
      </data>
    </node>
    <node id="n1">
      <data key="d0">
        <y:ShapeNode>
          <y:Geometry x="0.0" y="0.0" width="30.0" height="30.0"/>
          <y:Fill color="#FFFFFF"/>
          <y:Shape type="roundrectangle"/>
        </y:ShapeNode>
      </data>
    </node>
    <node id="n2">
      <data key="d0">
        <y:ShapeNode>
          <y:Geometry x="0.0" y="0.0" width="30.0" height="30.0"/>
          <y:Fill color="#FFFFFF"/>
          <y:Shape type="diamond"/>
        </y:ShapeNode>
      </data>
    </node>
  </graph>
</graphml>`;

            const source = new GraphMLDataSource({data: xml});
            const chunks = [];

            for await (const chunk of source.getData()) {
                chunks.push(chunk);
            }

            assert.strictEqual(chunks[0].nodes[0].shape, "sphere"); // ellipse -> sphere
            assert.strictEqual(chunks[0].nodes[1].shape, "box"); // roundrectangle -> box
            assert.strictEqual(chunks[0].nodes[2].shape, "box"); // diamond -> box (no direct mapping)
        });

        test("normalizes yFiles colors to standard hex format", async() => {
            const xml = `<?xml version="1.0"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns" xmlns:y="http://www.yworks.com/xml/graphml">
  <key id="d0" for="node" yfiles.type="nodegraphics"/>
  <graph>
    <node id="n0">
      <data key="d0">
        <y:ShapeNode>
          <y:Geometry x="0.0" y="0.0" width="30.0" height="30.0"/>
          <y:Fill color="#FFCC00"/>
        </y:ShapeNode>
      </data>
    </node>
  </graph>
</graphml>`;

            const source = new GraphMLDataSource({data: xml});
            const chunks = [];

            for await (const chunk of source.getData()) {
                chunks.push(chunk);
            }

            const node = chunks[0].nodes[0];
            // Color should be preserved in hex format
            assert.strictEqual(node.color, "#FFCC00");
            assert.match(node.color, /^#[0-9A-F]{6}$/);
        });

        test("handles GraphML without yFiles namespace", async() => {
            const xml = `<?xml version="1.0"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns">
  <graph>
    <node id="n0"/>
    <edge source="n0" target="n1"/>
  </graph>
</graphml>`;

            const source = new GraphMLDataSource({data: xml});
            const chunks = [];

            for await (const chunk of source.getData()) {
                chunks.push(chunk);
            }

            // Should still work for non-yFiles GraphML
            assert.strictEqual(chunks[0].nodes.length, 1);
            assert.strictEqual(chunks[0].edges.length, 1);
        });

        test("extracts node label from NodeLabel element", async() => {
            const xml = `<?xml version="1.0"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns" xmlns:y="http://www.yworks.com/xml/graphml">
  <key id="d0" for="node" yfiles.type="nodegraphics"/>
  <graph>
    <node id="n0">
      <data key="d0">
        <y:ShapeNode>
          <y:Geometry x="0.0" y="0.0" width="30.0" height="30.0"/>
          <y:NodeLabel>My Label</y:NodeLabel>
        </y:ShapeNode>
      </data>
    </node>
  </graph>
</graphml>`;

            const source = new GraphMLDataSource({data: xml});
            const chunks = [];

            for await (const chunk of source.getData()) {
                chunks.push(chunk);
            }

            assert.strictEqual(chunks[0].nodes[0].label, "My Label");
        });

        test("handles edge arrows (directed vs undirected)", async() => {
            const xml = `<?xml version="1.0"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns" xmlns:y="http://www.yworks.com/xml/graphml">
  <key id="d0" for="edge" yfiles.type="edgegraphics"/>
  <graph>
    <node id="n0"/>
    <node id="n1"/>
    <node id="n2"/>
    <edge id="e0" source="n0" target="n1">
      <data key="d0">
        <y:PolyLineEdge>
          <y:Arrows source="none" target="standard"/>
        </y:PolyLineEdge>
      </data>
    </edge>
    <edge id="e1" source="n1" target="n2">
      <data key="d0">
        <y:PolyLineEdge>
          <y:Arrows source="none" target="none"/>
        </y:PolyLineEdge>
      </data>
    </edge>
  </graph>
</graphml>`;

            const source = new GraphMLDataSource({data: xml});
            const chunks = [];

            for await (const chunk of source.getData()) {
                chunks.push(chunk);
            }

            assert.strictEqual(chunks[0].edges[0].directed, true); // has target arrow
            assert.strictEqual(chunks[0].edges[1].directed, false); // no arrows
        });
    });
});
