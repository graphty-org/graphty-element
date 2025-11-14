import "../index.ts";

import type {Meta, StoryObj} from "@storybook/web-components-vite";

import {StyleTemplate} from "../src/config";
import {Graphty} from "../src/graphty-element";
import {edgeData, eventWaitingDecorator, nodeData} from "./helpers";

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
};

export const GraphML: Story = {
    args: {
        dataSource: "graphml",
        dataSourceConfig: {
            url: "https://raw.githubusercontent.com/chengw07/NetWalk/master/data/karate.GraphML",
        },
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
};
