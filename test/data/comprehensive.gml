Creator "Comprehensive GML Test File"
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
]
