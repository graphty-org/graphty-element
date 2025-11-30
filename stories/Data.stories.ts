import "../index.ts";

import type {Meta, StoryObj} from "@storybook/web-components-vite";

import {StyleTemplate} from "../src/config";
import {Graphty} from "../src/graphty-element";
import {edgeData, eventWaitingDecorator, nodeData, waitForGraphSettled} from "./helpers";

const meta: Meta = {
    title: "Data",
    component: "graphty-element",
    decorators: [eventWaitingDecorator],
    parameters: {
        controls: {exclude: /^(#|_)/},
        chromatic: {
            delay: 500, // Allow Babylon.js render frames to complete (30 frames at 60fps)
        },
    },
};
export default meta;

type Story = StoryObj<Graphty>;

export const Basic: Story = {
    args: {
        nodeData,
        edgeData,
        layout: "ngraph", // Use deterministic layout for visual tests
        layoutConfig: {
            // circular layout is deterministic, no seed needed
        },
        // Add minimal styleTemplate just for preSteps
        styleTemplate: StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            behavior: {
                layout: {
                    preSteps: 8000, // Extra preSteps for data3.json (77 nodes) with ngraph
                },
            },
        }),
    },
};

export const Json: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json",
        },
    },
    play: async({canvasElement}) => {
        await waitForGraphSettled(canvasElement);
    },
};

export const ModifiedJson: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data2.json",
            edge: {
                path: "links",
            },
        },
        // Put edge field mappings in styleTemplate where they belong
        styleTemplate: StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            data: {
                knownFields: {
                    edgeSrcIdPath: "source",
                    edgeDstIdPath: "target",
                },
            },
            behavior: {
                layout: {
                    preSteps: 8000, // Extra preSteps for data2.json (80 nodes) with ngraph
                },
            },
        }),
    },
    play: async({canvasElement}) => {
        await waitForGraphSettled(canvasElement);
    },
};

export const GraphML: Story = {
    args: {
        dataSource: "graphml",
        dataSourceConfig: {
            url: "https://raw.githubusercontent.com/chengw07/NetWalk/master/data/karate.GraphML",
        },
    },
    play: async({canvasElement}) => {
        await waitForGraphSettled(canvasElement);
    },
};

export const CSV: Story = {
    args: {
        dataSource: "csv",
        dataSourceConfig: {
            data: `source,target,weight,protocol,latency,bandwidth,active,description
server-1,client-1,1.5,HTTP/2,15,1000.75,true,"Primary connection from server to client"
client-1,database-1,2.0,SQL,5,500.25,true,"Database queries from client"
server-1,database-1,0.8,TCP,2,2000.0,true,"Direct server-to-database connection"
server-1,cache-1,3.5,"Redis Protocol",1,1500.5,true,"Server to cache for fast access"
cache-1,database-1,1.2,Internal,3,800.0,true,"Cache miss fallback to database"
"node with spaces",cache-1,0.5,Unknown,50,100.0,false,"Connection from special node"
monitoring-1,server-1,0.3,Metrics,10,50.0,true,"Monitor server metrics"
monitoring-1,client-1,0.3,Metrics,10,50.0,true,"Monitor client metrics"
database-1,backup-1,0.7,Backup,20,300.0,true,"Database backup connection"
backup-1,backup-2,0.6,Sync,25,200.0,true,"Backup synchronization"`,
        },
    },
    play: async({canvasElement}) => {
        await waitForGraphSettled(canvasElement);
    },
};

export const GML: Story = {
    args: {
        dataSource: "gml",
        dataSourceConfig: {
            data: `Creator "Comprehensive GML Test File"
Version "1.0"
graph [
  comment "This file tests various GML features"
  directed 1

  node [
    id 1
    label "Server Node"
    type "server"
    priority 10
    active 1
    graphics [
      x 100.5
      y 200.3
      w 50.0
      h 30.0
      fill "#FF5733"
      outline "#000000"
    ]
  ]

  node [
    id 2
    label "Client Node"
    type "client"
    priority 5
    active 1
    graphics [
      x 300.0
      y 200.0
      w 40.0
      h 30.0
      fill "#33FF57"
    ]
  ]

  node [
    id 3
    label "Database"
    type "storage"
    priority 8
    active 0
    graphics [
      x 200.0
      y 100.0
      w 60.0
      h 40.0
      fill "#3357FF"
    ]
  ]

  node [
    id "node-4"
    label "String ID Node"
    type "special"
    priority 3
  ]

  node [
    id 5
    label "Nested Attributes Test"
    metadata [
      created "2024-01-01"
      modified "2024-01-15"
      tags [
        tag "production"
        tag "critical"
      ]
    ]
  ]

  edge [
    source 1
    target 2
    label "HTTP"
    weight 1.5
    bandwidth 100.0
    latency 15
    protocol "tcp"
  ]

  edge [
    source 2
    target 3
    label "SQL Query"
    weight 2.0
    bandwidth 50.0
    latency 5
    protocol "tcp"
  ]

  edge [
    source 1
    target 3
    label "Direct Connection"
    weight 0.8
    bandwidth 200.0
    latency 2
  ]

  edge [
    source 3
    target "node-4"
    label "String ID Edge"
    weight 1.0
  ]

  edge [
    source "node-4"
    target 5
    label "Mixed ID Types"
    weight 3.5
  ]
]`,
        },
    },
    play: async({canvasElement}) => {
        await waitForGraphSettled(canvasElement);
    },
};

export const GEXF: Story = {
    args: {
        dataSource: "gexf",
        dataSourceConfig: {
            data: `<?xml version="1.0" encoding="UTF-8"?>
<gexf xmlns="http://gexf.net/1.3"
      xmlns:viz="http://gexf.net/1.3/viz"
      version="1.3">
  <meta lastmodifieddate="2024-01-15">
    <creator>Comprehensive GEXF Test File</creator>
    <description>Tests various GEXF features including attributes and viz namespace</description>
  </meta>

  <graph mode="static" defaultedgetype="directed">
    <attributes class="node">
      <attribute id="0" title="type" type="string"/>
      <attribute id="1" title="priority" type="integer"/>
      <attribute id="2" title="score" type="float"/>
      <attribute id="3" title="active" type="boolean"/>
      <attribute id="4" title="bandwidth" type="double"/>
    </attributes>

    <attributes class="edge">
      <attribute id="0" title="protocol" type="string"/>
      <attribute id="1" title="latency" type="integer"/>
      <attribute id="2" title="reliability" type="float"/>
    </attributes>

    <nodes>
      <node id="server-1" label="Primary Server">
        <attvalues>
          <attvalue for="0" value="server"/>
          <attvalue for="1" value="10"/>
          <attvalue for="2" value="95.5"/>
          <attvalue for="3" value="true"/>
          <attvalue for="4" value="1000.75"/>
        </attvalues>
        <viz:position x="100.0" y="200.0" z="0.0"/>
        <viz:color r="255" g="87" b="51"/>
        <viz:size value="20.0"/>
      </node>

      <node id="client-1" label="Web Client">
        <attvalues>
          <attvalue for="0" value="client"/>
          <attvalue for="1" value="5"/>
          <attvalue for="2" value="88.3"/>
          <attvalue for="3" value="true"/>
          <attvalue for="4" value="500.25"/>
        </attvalues>
        <viz:position x="300.0" y="200.0" z="50.0"/>
        <viz:color r="51" g="255" b="87"/>
        <viz:size value="15.0"/>
      </node>

      <node id="db-1" label="PostgreSQL Database">
        <attvalues>
          <attvalue for="0" value="database"/>
          <attvalue for="1" value="8"/>
          <attvalue for="2" value="99.9"/>
          <attvalue for="3" value="true"/>
          <attvalue for="4" value="2000.0"/>
        </attvalues>
        <viz:position x="200.0" y="100.0" z="25.0"/>
        <viz:color r="51" g="87" b="255"/>
        <viz:size value="25.0"/>
      </node>

      <node id="cache-1" label="Redis Cache">
        <attvalues>
          <attvalue for="0" value="cache"/>
          <attvalue for="1" value="7"/>
          <attvalue for="2" value="92.1"/>
          <attvalue for="3" value="true"/>
          <attvalue for="4" value="1500.5"/>
        </attvalues>
        <viz:position x="150.0" y="300.0" z="-25.0"/>
        <viz:color r="255" g="193" b="7"/>
        <viz:size value="18.0"/>
      </node>

      <node id="inactive-node" label="Inactive Service">
        <attvalues>
          <attvalue for="0" value="service"/>
          <attvalue for="1" value="2"/>
          <attvalue for="2" value="45.0"/>
          <attvalue for="3" value="false"/>
          <attvalue for="4" value="100.0"/>
        </attvalues>
        <viz:position x="250.0" y="250.0" z="0.0"/>
        <viz:color r="128" g="128" b="128"/>
        <viz:size value="10.0"/>
      </node>
    </nodes>

    <edges>
      <edge id="e1" source="server-1" target="client-1" weight="1.5">
        <attvalues>
          <attvalue for="0" value="HTTP/2"/>
          <attvalue for="1" value="15"/>
          <attvalue for="2" value="99.5"/>
        </attvalues>
      </edge>

      <edge id="e2" source="client-1" target="db-1" weight="2.0">
        <attvalues>
          <attvalue for="0" value="SQL"/>
          <attvalue for="1" value="5"/>
          <attvalue for="2" value="99.9"/>
        </attvalues>
      </edge>

      <edge id="e3" source="server-1" target="db-1" weight="0.8">
        <attvalues>
          <attvalue for="0" value="TCP"/>
          <attvalue for="1" value="2"/>
          <attvalue for="2" value="99.99"/>
        </attvalues>
      </edge>

      <edge id="e4" source="server-1" target="cache-1" weight="3.5">
        <attvalues>
          <attvalue for="0" value="Redis Protocol"/>
          <attvalue for="1" value="1"/>
          <attvalue for="2" value="99.95"/>
        </attvalues>
      </edge>

      <edge id="e5" source="cache-1" target="db-1" weight="1.2">
        <attvalues>
          <attvalue for="0" value="Internal"/>
          <attvalue for="1" value="3"/>
          <attvalue for="2" value="99.8"/>
        </attvalues>
      </edge>

      <edge id="e6" source="inactive-node" target="cache-1" weight="0.5">
        <attvalues>
          <attvalue for="0" value="Unknown"/>
          <attvalue for="1" value="100"/>
          <attvalue for="2" value="50.0"/>
        </attvalues>
      </edge>
    </edges>
  </graph>
</gexf>`,
        },
    },
    play: async({canvasElement}) => {
        await waitForGraphSettled(canvasElement);
    },
};

export const DOT: Story = {
    args: {
        dataSource: "dot",
        dataSourceConfig: {
            data: `// Comprehensive DOT Test File
// Tests various Graphviz DOT features

digraph ComprehensiveTest {
  // Graph attributes
  label="Comprehensive DOT Test\\nMultiple Features";
  rankdir=LR;

  /* Node definitions with various attributes */
  server [
    label="Primary Server",
    shape=box,
    style=filled,
    fillcolor="#FF5733",
    fontsize=14,
    type="server",
    priority=10
  ];

  client [
    label="Web Client",
    shape=ellipse,
    style="filled,rounded",
    fillcolor="#33FF57",
    fontsize=12,
    type="client",
    priority=5
  ];

  database [
    label="PostgreSQL Database",
    shape=box,
    style=filled,
    fillcolor="#3357FF",
    type="database",
    priority=8
  ];

  "node with spaces" [
    label="Quoted ID Node",
    shape=diamond,
    style=filled,
    fillcolor="#3357FF"
  ];

  cache [
    label="Redis\\nCache",
    shape=hexagon,
    style=filled,
    fillcolor=yellow
  ];

  // Subgraph for monitoring cluster
  subgraph cluster_monitoring {
    label="Monitoring Services";
    style=filled;
    color=lightgrey;

    metrics [
      label="Metrics Collector",
      shape=box,
      style="filled,dashed",
      fillcolor=lightgreen
    ];

    logs [
      label="Log Aggregator",
      shape=box,
      style="filled,dashed",
      fillcolor=lightcoral
    ];

    // Edge within subgraph
    metrics -> logs [label="forwards", weight=1.0];
  }

  // Subgraph for backup cluster
  subgraph cluster_backup {
    label="Backup Services";
    style=filled;
    color=lightblue;

    backup1 [label="Primary Backup"];
    backup2 [label="Secondary Backup"];

    backup1 -> backup2 [style=dotted, label="sync"];
  }

  /* Main edges with attributes */
  server -> client [
    label="HTTP/2",
    weight=1.5,
    color=red,
    style=bold,
    protocol="https",
    latency=15
  ];

  client -> database [
    label="SQL Queries",
    weight=2.0,
    color=blue,
    style=solid,
    protocol="tcp",
    latency=5
  ];

  server -> database [
    label="Direct\\nConnection",
    weight=0.8,
    color=green,
    style=dashed
  ];

  server -> cache [
    label="Cache Access",
    weight=3.5,
    color=orange,
    arrowhead=diamond
  ];

  cache -> database [
    label="Cache Miss",
    weight=1.2,
    color=purple,
    style=dotted
  ];

  "node with spaces" -> cache [
    label="Special Connection",
    weight=0.5
  ];

  // Connections to monitoring
  server -> metrics [label="send metrics", style=dashed, color=grey];
  client -> metrics [label="send metrics", style=dashed, color=grey];
  database -> logs [label="send logs", style=dashed, color=grey];

  // Connections to backup
  database -> backup1 [label="backup", style=bold, color=darkgreen];

  /* Multi-line comment explaining the architecture */
}`,
        },
        // Add minimal styleTemplate just for preSteps
        styleTemplate: StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            behavior: {
                layout: {
                    preSteps: 8000, // Extra preSteps for DOT with ngraph
                },
            },
        }),
    },
    play: async({canvasElement}) => {
        await waitForGraphSettled(canvasElement);
    },
};

export const CsvNeo4j: Story = {
    args: {
        dataSource: "csv",
        dataSourceConfig: {
            variant: "neo4j",
            data: `userId:ID,:LABEL,name,role
user-1,Person,Alice,admin
user-2,Person,Bob,user
user-3,Person,Carol,moderator
:START_ID,:END_ID,:TYPE,since,strength
user-1,user-2,KNOWS,2020,0.8
user-2,user-3,KNOWS,2021,0.6
user-1,user-3,MANAGES,2019,1.0`,
        },
        // Add minimal styleTemplate just for preSteps
        styleTemplate: StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            behavior: {
                layout: {
                    preSteps: 8000, // Extra preSteps for CSV with ngraph
                },
            },
        }),
    },
    play: async({canvasElement}) => {
        await waitForGraphSettled(canvasElement);
    },
};

export const CsvGephi: Story = {
    args: {
        dataSource: "csv",
        dataSourceConfig: {
            variant: "gephi",
            data: `Source,Target,Type,Weight,Label
server-1,client-1,Directed,1.5,HTTP Connection
client-1,database-1,Directed,2.0,SQL Query
server-1,database-1,Directed,0.8,Direct Access
server-1,cache-1,Directed,3.5,Cache Lookup
cache-1,database-1,Directed,1.2,Cache Miss`,
        },
        // Add minimal styleTemplate just for preSteps
        styleTemplate: StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            behavior: {
                layout: {
                    preSteps: 8000, // Extra preSteps for CSV with ngraph
                },
            },
        }),
    },
    play: async({canvasElement}) => {
        await waitForGraphSettled(canvasElement);
    },
};

export const CsvCytoscape: Story = {
    args: {
        dataSource: "csv",
        dataSourceConfig: {
            variant: "cytoscape",
            data: `source,target,interaction,score,confidence
protein-A,protein-B,binds,0.95,high
protein-B,protein-C,inhibits,0.75,medium
protein-A,protein-D,activates,0.88,high
protein-C,protein-D,regulates,0.65,low
protein-D,protein-A,feedback,0.70,medium`,
        },
        // Add minimal styleTemplate just for preSteps
        styleTemplate: StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            behavior: {
                layout: {
                    preSteps: 8000, // Extra preSteps for CSV with ngraph
                },
            },
        }),
    },
    play: async({canvasElement}) => {
        await waitForGraphSettled(canvasElement);
    },
};

export const CsvAdjacencyList: Story = {
    args: {
        dataSource: "csv",
        dataSourceConfig: {
            variant: "adjacency-list",
            data: `router-1,router-2:1.5,router-3:2.0,router-5:3.5
router-2,router-3:0.8,router-4:1.2
router-3,router-4:2.5,router-5:1.8
router-4,router-5:1.0
router-5,router-1:2.2`,
        },
        // Add minimal styleTemplate just for preSteps
        styleTemplate: StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            behavior: {
                layout: {
                    preSteps: 8000, // Extra preSteps for CSV with ngraph
                },
            },
        }),
    },
    play: async({canvasElement}) => {
        await waitForGraphSettled(canvasElement);
    },
};

export const CsvNodeList: Story = {
    args: {
        dataSource: "csv",
        dataSourceConfig: {
            variant: "node-list",
            data: `id,name,type,priority,active,department,email
node-1,Alice Johnson,person,10,true,Engineering,alice@example.com
node-2,Bob Smith,person,8,true,Engineering,bob@example.com
node-3,Carol Williams,person,9,true,Product,carol@example.com
node-4,Dave Brown,person,7,false,Marketing,dave@example.com
node-5,Eve Davis,person,6,true,Sales,eve@example.com
node-6,Frank Miller,person,5,true,Support,frank@example.com
node-7,Grace Wilson,person,8,true,Engineering,grace@example.com
node-8,Henry Moore,person,4,false,HR,henry@example.com`,
        },
        // Add minimal styleTemplate just for preSteps
        styleTemplate: StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            behavior: {
                layout: {
                    preSteps: 8000, // Extra preSteps for CSV with ngraph
                },
            },
        }),
    },
    play: async({canvasElement}) => {
        await waitForGraphSettled(canvasElement);
    },
};

// JSON Variants
export const JsonD3: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: `data:application/json,${encodeURIComponent(JSON.stringify({
                nodes: [
                    {id: "server-1", type: "server", priority: 10},
                    {id: "client-1", type: "client", priority: 5},
                    {id: "database-1", type: "database", priority: 8},
                    {id: "cache-1", type: "cache", priority: 7},
                    {id: "api-1", type: "api", priority: 6},
                ],
                links: [
                    {source: "server-1", target: "client-1", weight: 1.5, protocol: "HTTP/2"},
                    {source: "client-1", target: "database-1", weight: 2.0, protocol: "SQL"},
                    {source: "server-1", target: "database-1", weight: 0.8, protocol: "TCP"},
                    {source: "server-1", target: "cache-1", weight: 3.5, protocol: "Redis"},
                    {source: "cache-1", target: "database-1", weight: 1.2, protocol: "Internal"},
                    {source: "api-1", target: "server-1", weight: 2.5, protocol: "REST"},
                ],
            }))}`,
            node: {
                path: "nodes",
            },
            edge: {
                path: "links",
            },
        },
        styleTemplate: StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            data: {
                knownFields: {
                    edgeSrcIdPath: "source",
                    edgeDstIdPath: "target",
                },
            },
            behavior: {
                layout: {
                    preSteps: 8000,
                },
            },
        }),
    },
    play: async({canvasElement}) => {
        await waitForGraphSettled(canvasElement);
    },
};

export const JsonCytoscapeJs: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: `data:application/json,${encodeURIComponent(JSON.stringify({
                elements: {
                    nodes: [
                        {data: {id: "protein-A", name: "Protein A", mass: 45.5}},
                        {data: {id: "protein-B", name: "Protein B", mass: 52.3}},
                        {data: {id: "protein-C", name: "Protein C", mass: 38.7}},
                        {data: {id: "protein-D", name: "Protein D", mass: 41.2}},
                        {data: {id: "protein-E", name: "Protein E", mass: 49.8}},
                    ],
                    edges: [
                        {data: {source: "protein-A", target: "protein-B", interaction: "binds", score: 0.95}},
                        {data: {source: "protein-B", target: "protein-C", interaction: "inhibits", score: 0.75}},
                        {data: {source: "protein-A", target: "protein-D", interaction: "activates", score: 0.88}},
                        {data: {source: "protein-C", target: "protein-D", interaction: "regulates", score: 0.65}},
                        {data: {source: "protein-D", target: "protein-A", interaction: "feedback", score: 0.70}},
                        {data: {source: "protein-E", target: "protein-C", interaction: "binds", score: 0.82}},
                    ],
                },
            }))}`,
            node: {
                path: "elements.nodes[].data",
            },
            edge: {
                path: "elements.edges[].data",
            },
        },
        styleTemplate: StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            data: {
                knownFields: {
                    edgeSrcIdPath: "source",
                    edgeDstIdPath: "target",
                },
            },
            behavior: {
                layout: {
                    preSteps: 8000,
                },
            },
        }),
    },
    play: async({canvasElement}) => {
        await waitForGraphSettled(canvasElement);
    },
};

export const JsonSigma: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: `data:application/json,${encodeURIComponent(JSON.stringify({
                nodes: [
                    {key: "user-1", attributes: {label: "Alice", role: "admin", score: 95.5}},
                    {key: "user-2", attributes: {label: "Bob", role: "user", score: 78.3}},
                    {key: "user-3", attributes: {label: "Carol", role: "moderator", score: 88.7}},
                    {key: "user-4", attributes: {label: "Dave", role: "user", score: 82.1}},
                    {key: "user-5", attributes: {label: "Eve", role: "admin", score: 91.2}},
                ],
                edges: [
                    {source: "user-1", target: "user-2", weight: 0.8, type: "follows"},
                    {source: "user-2", target: "user-3", weight: 0.6, type: "follows"},
                    {source: "user-1", target: "user-3", weight: 1.0, type: "manages"},
                    {source: "user-3", target: "user-4", weight: 0.7, type: "follows"},
                    {source: "user-4", target: "user-5", weight: 0.5, type: "follows"},
                    {source: "user-5", target: "user-1", weight: 0.9, type: "manages"},
                ],
            }))}`,
            node: {
                path: "nodes",
            },
            edge: {
                path: "edges",
            },
        },
        styleTemplate: StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            data: {
                knownFields: {
                    nodeIdPath: "key",
                    edgeSrcIdPath: "source",
                    edgeDstIdPath: "target",
                },
            },
            behavior: {
                layout: {
                    preSteps: 8000,
                },
            },
        }),
    },
    play: async({canvasElement}) => {
        await waitForGraphSettled(canvasElement);
    },
};

export const JsonVisJs: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: `data:application/json,${encodeURIComponent(JSON.stringify({
                nodes: [
                    {id: 1, label: "Router-1", device: "router", uptime: 99.9},
                    {id: 2, label: "Router-2", device: "router", uptime: 98.5},
                    {id: 3, label: "Switch-1", device: "switch", uptime: 99.7},
                    {id: 4, label: "Switch-2", device: "switch", uptime: 97.8},
                    {id: 5, label: "Firewall-1", device: "firewall", uptime: 99.95},
                ],
                edges: [
                    {from: 1, to: 2, bandwidth: 1000, latency: 2},
                    {from: 2, to: 3, bandwidth: 500, latency: 5},
                    {from: 1, to: 3, bandwidth: 2000, latency: 1},
                    {from: 3, to: 4, bandwidth: 1500, latency: 3},
                    {from: 4, to: 5, bandwidth: 800, latency: 4},
                    {from: 5, to: 1, bandwidth: 1200, latency: 2},
                ],
            }))}`,
            node: {
                path: "nodes",
            },
            edge: {
                path: "edges",
            },
        },
        styleTemplate: StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            data: {
                knownFields: {
                    edgeSrcIdPath: "from",
                    edgeDstIdPath: "to",
                },
            },
            behavior: {
                layout: {
                    preSteps: 8000,
                },
            },
        }),
    },
    play: async({canvasElement}) => {
        await waitForGraphSettled(canvasElement);
    },
};

export const JsonNetworkX: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: `data:application/json,${encodeURIComponent(JSON.stringify({
                directed: true,
                multigraph: false,
                graph: {},
                nodes: [
                    {id: "A", type: "start", value: 10},
                    {id: "B", type: "middle", value: 20},
                    {id: "C", type: "middle", value: 15},
                    {id: "D", type: "middle", value: 25},
                    {id: "E", type: "end", value: 30},
                ],
                links: [
                    {source: "A", target: "B", weight: 1.5},
                    {source: "B", target: "C", weight: 2.0},
                    {source: "A", target: "C", weight: 0.8},
                    {source: "C", target: "D", weight: 3.5},
                    {source: "D", target: "E", weight: 1.2},
                    {source: "E", target: "A", weight: 2.5},
                ],
            }))}`,
            node: {
                path: "nodes",
            },
            edge: {
                path: "links",
            },
        },
        styleTemplate: StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            data: {
                knownFields: {
                    edgeSrcIdPath: "source",
                    edgeDstIdPath: "target",
                },
            },
            behavior: {
                layout: {
                    preSteps: 8000,
                },
            },
        }),
    },
    play: async({canvasElement}) => {
        await waitForGraphSettled(canvasElement);
    },
};

// CSV Paired Files
export const CsvPairedFiles: Story = {
    args: {
        dataSource: "csv",
        dataSourceConfig: {
            nodeURL: `data:text/csv,${encodeURIComponent(`Id,Label,Type,Priority,Active
server-1,Primary Server,server,10,true
client-1,Web Client,client,5,true
database-1,PostgreSQL DB,database,8,true
cache-1,Redis Cache,cache,7,true
api-1,REST API,api,6,true
monitor-1,Monitoring Service,monitor,4,false`)}`,
            edgeURL: `data:text/csv,${encodeURIComponent(`Source,Target,Type,Weight,Protocol,Latency
server-1,client-1,Directed,1.5,HTTP/2,15
client-1,database-1,Directed,2.0,SQL,5
server-1,database-1,Directed,0.8,TCP,2
server-1,cache-1,Directed,3.5,Redis,1
cache-1,database-1,Directed,1.2,Internal,3
api-1,server-1,Directed,2.5,REST,10
monitor-1,server-1,Directed,0.3,Metrics,8
monitor-1,database-1,Directed,0.3,Metrics,8`)}`,
        },
        styleTemplate: StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            behavior: {
                layout: {
                    preSteps: 8000,
                },
            },
        }),
    },
    play: async({canvasElement}) => {
        await waitForGraphSettled(canvasElement);
    },
};

// Pajek NET Format
export const Pajek: Story = {
    args: {
        dataSource: "pajek",
        dataSourceConfig: {
            data: `*Vertices 8
1 "Server-1" 0.0 0.5 0.3
2 "Client-1" 0.2 0.8 0.1
3 "Database-1" 0.4 0.2 0.6
4 "Cache-1" 0.6 0.9 0.4
5 "API-1" 0.8 0.1 0.7
6 "Monitor-1" 0.3 0.6 0.2
7 "Load-Balancer" 0.7 0.3 0.8
8 "Queue-1" 0.1 0.4 0.5
*Arcs
1 2 1.5
2 3 2.0
1 3 0.8
1 4 3.5
4 3 1.2
5 1 2.5
6 1 0.3
6 3 0.3
7 1 1.0
1 8 0.7
*Edges
7 5 1.5
7 6 1.0
8 4 2.0`,
        },
        styleTemplate: StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            behavior: {
                layout: {
                    preSteps: 8000,
                },
            },
        }),
    },
    play: async({canvasElement}) => {
        await waitForGraphSettled(canvasElement);
    },
};

// GraphMLYFiles: yFiles GraphML with 6 nodes in 3D space and 40x thicker edges
export const GraphMLYFiles: Story = {
    args: {
        dataSource: "graphml",
        dataSourceConfig: {
            data: `<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns" xmlns:y="http://www.yworks.com/xml/graphml">
  <key id="d0" for="node" yfiles.type="nodegraphics"/>
  <key id="d1" for="edge" yfiles.type="edgegraphics"/>
  <key id="d2" for="node" attr.name="z" attr.type="double"/>
  <graph id="G" edgedefault="directed">
    <!-- Left node at (-3, 0, 0) -->
    <node id="n1">
      <data key="d0">
        <y:ShapeNode>
          <y:Geometry x="-3.0" y="0.0" width="1.0" height="1.0"/>
          <y:Fill color="#4ECDC4" transparent="false"/>
          <y:BorderStyle color="#087F7B" type="line" width="1.0"/>
          <y:NodeLabel>Left</y:NodeLabel>
          <y:Shape type="ellipse"/>
        </y:ShapeNode>
      </data>
      <data key="d2">0.0</data>
    </node>

    <!-- Right node at (3, 0, 0) -->
    <node id="n2">
      <data key="d0">
        <y:ShapeNode>
          <y:Geometry x="3.0" y="0.0" width="1.0" height="1.0"/>
          <y:Fill color="#FF6B6B" transparent="false"/>
          <y:BorderStyle color="#C92A2A" type="line" width="1.0"/>
          <y:NodeLabel>Right</y:NodeLabel>
          <y:Shape type="ellipse"/>
        </y:ShapeNode>
      </data>
      <data key="d2">0.0</data>
    </node>

    <!-- Top node at (0, 3, 0) -->
    <node id="n3">
      <data key="d0">
        <y:ShapeNode>
          <y:Geometry x="0.0" y="3.0" width="1.0" height="1.0"/>
          <y:Fill color="#96CEB4" transparent="false"/>
          <y:BorderStyle color="#2F9E44" type="line" width="1.0"/>
          <y:NodeLabel>Top</y:NodeLabel>
          <y:Shape type="ellipse"/>
        </y:ShapeNode>
      </data>
      <data key="d2">0.0</data>
    </node>

    <!-- Bottom node at (0, -3, 0) -->
    <node id="n4">
      <data key="d0">
        <y:ShapeNode>
          <y:Geometry x="0.0" y="-3.0" width="1.0" height="1.0"/>
          <y:Fill color="#FFEAA7" transparent="false"/>
          <y:BorderStyle color="#E67700" type="line" width="1.0"/>
          <y:NodeLabel>Bottom</y:NodeLabel>
          <y:Shape type="ellipse"/>
        </y:ShapeNode>
      </data>
      <data key="d2">0.0</data>
    </node>

    <!-- Top-Right node at (2, 2, 0) -->
    <node id="n5">
      <data key="d0">
        <y:ShapeNode>
          <y:Geometry x="2.0" y="2.0" width="1.0" height="1.0"/>
          <y:Fill color="#A29BFE" transparent="false"/>
          <y:BorderStyle color="#6C5CE7" type="line" width="1.0"/>
          <y:NodeLabel>TR</y:NodeLabel>
          <y:Shape type="ellipse"/>
        </y:ShapeNode>
      </data>
      <data key="d2">0.0</data>
    </node>

    <!-- Bottom-Left node at (-2, -2, 0) -->
    <node id="n6">
      <data key="d0">
        <y:ShapeNode>
          <y:Geometry x="-2.0" y="-2.0" width="1.0" height="1.0"/>
          <y:Fill color="#FD79A8" transparent="false"/>
          <y:BorderStyle color="#E84393" type="line" width="1.0"/>
          <y:NodeLabel>BL</y:NodeLabel>
          <y:Shape type="ellipse"/>
        </y:ShapeNode>
      </data>
      <data key="d2">0.0</data>
    </node>

    <!-- Edges forming one connected component -->
    <edge id="e1" source="n1" target="n2">
      <data key="d1">
        <y:PolyLineEdge>
          <y:LineStyle color="#495057" type="line" width="2.0"/>
          <y:Arrows source="none" target="standard"/>
        </y:PolyLineEdge>
      </data>
    </edge>

    <edge id="e2" source="n1" target="n3">
      <data key="d1">
        <y:PolyLineEdge>
          <y:LineStyle color="#495057" type="line" width="2.0"/>
          <y:Arrows source="none" target="standard"/>
        </y:PolyLineEdge>
      </data>
    </edge>

    <edge id="e3" source="n2" target="n4">
      <data key="d1">
        <y:PolyLineEdge>
          <y:LineStyle color="#495057" type="line" width="2.0"/>
          <y:Arrows source="none" target="standard"/>
        </y:PolyLineEdge>
      </data>
    </edge>

    <edge id="e4" source="n3" target="n5">
      <data key="d1">
        <y:PolyLineEdge>
          <y:LineStyle color="#ADB5BD" type="line" width="1.5"/>
          <y:Arrows source="none" target="standard"/>
        </y:PolyLineEdge>
      </data>
    </edge>

    <edge id="e5" source="n4" target="n6">
      <data key="d1">
        <y:PolyLineEdge>
          <y:LineStyle color="#ADB5BD" type="line" width="1.5"/>
          <y:Arrows source="none" target="standard"/>
        </y:PolyLineEdge>
      </data>
    </edge>

    <edge id="e6" source="n5" target="n6">
      <data key="d1">
        <y:PolyLineEdge>
          <y:LineStyle color="#868E96" type="line" width="1.5"/>
          <y:Arrows source="none" target="standard"/>
        </y:PolyLineEdge>
      </data>
    </edge>
  </graph>
</graphml>`,
        },
        layout: "fixed",
    },
};
