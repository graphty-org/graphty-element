---
layout: home

hero:
  name: Graphty
  text: 3D/2D Graph Visualization Web Component
  tagline: Build interactive graph visualizations with a powerful Web Component library built on Lit and Babylon.js
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: API Reference
      link: /api/
    - theme: alt
      text: Live Examples
      link: https://graphty-org.github.io/graphty-element/storybook/

features:
  - title: 3D Rendering
    details: Powered by Babylon.js for high-performance 3D graph visualization with WebGL and WebGPU support.
  - title: Multiple Layouts
    details: Choose from force-directed, hierarchical, circular, grid, and more layout algorithms for optimal graph presentation.
  - title: Extensible Architecture
    details: Plugin system for custom layouts, algorithms, and data sources. Build exactly what you need.
  - title: VR/AR Support
    details: WebXR-ready for immersive graph exploration in virtual and augmented reality environments.
---

## Quick Start

Install via npm:

```bash
npm install @graphty/graphty-element
```

Create your first graph:

```html
<script type="module">
  import '@graphty/graphty-element';
</script>

<graphty-element
  node-data='[{"id": "a"}, {"id": "b"}, {"id": "c"}]'
  edge-data='[{"source": "a", "target": "b"}, {"source": "b", "target": "c"}]'>
</graphty-element>
```

See it in action: [Basic Graph](https://graphty-org.github.io/graphty-element/storybook/?path=/story/graphty--graphty)
