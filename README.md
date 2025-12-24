# @graphty/graphty-element

[![npm version](https://img.shields.io/npm/v/@graphty/graphty-element.svg)](https://www.npmjs.com/package/@graphty/graphty-element)
[![CI/CD](https://github.com/graphty-org/graphty-element/actions/workflows/ci.yml/badge.svg)](https://github.com/graphty-org/graphty-element/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/graphty-org/graphty-element/badge.svg?branch=master)](https://coveralls.io/github/graphty-org/graphty-element?branch=master)
[![Documentation](https://img.shields.io/badge/docs-vitepress-blue)](https://graphty-org.github.io/graphty-element/)
[![Storybook](https://img.shields.io/badge/storybook-examples-ff4785)](https://graphty-org.github.io/graphty-element/storybook/)

A Web Component for 3D/2D graph visualization built with Lit and Babylon.js.

## Quick Start

```bash
npm install @graphty/graphty-element @babylonjs/core lit
```

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    graphty-element { width: 100vw; height: 100vh; display: block; }
  </style>
</head>
<body>
  <graphty-element id="graph"></graphty-element>
  <script type="module">
    import '@graphty/graphty-element';

    const graph = document.getElementById('graph');
    graph.nodeData = [
      { id: 1, label: 'Node 1' },
      { id: 2, label: 'Node 2' },
      { id: 3, label: 'Node 3' }
    ];
    graph.edgeData = [
      { src: 1, dst: 2 },
      { src: 2, dst: 3 },
      { src: 3, dst: 1 }
    ];
  </script>
</body>
</html>
```

## Documentation

- [Getting Started Guide](https://graphty-org.github.io/graphty-element/guide/getting-started)
- [Installation](https://graphty-org.github.io/graphty-element/guide/installation)
- [API Reference](https://graphty-org.github.io/graphty-element/api/)
- [Interactive Examples (Storybook)](https://graphty-org.github.io/graphty-element/storybook/)

## Features

- **3D and 2D Rendering** - Full 3D graph visualization with camera controls, or simplified 2D mode ([Camera Guide](https://graphty-org.github.io/graphty-element/guide/camera))
- **Multiple Layout Algorithms** - Force-directed, circular, hierarchical, and more ([Layouts Guide](https://graphty-org.github.io/graphty-element/guide/layouts))
- **Rich Styling System** - CSS-like styling with layers, selectors, and dynamic properties ([Styling Guide](https://graphty-org.github.io/graphty-element/guide/styling))
- **Interactive** - Node dragging, hover effects, selection, and custom behaviors ([Events Guide](https://graphty-org.github.io/graphty-element/guide/events))
- **Extensible** - Plugin architecture for custom layouts, algorithms, and data sources ([Extending Guide](https://graphty-org.github.io/graphty-element/guide/extending/))
- **Graph Algorithms** - Built-in algorithms for analysis ([Algorithms Guide](https://graphty-org.github.io/graphty-element/guide/algorithms))
- **VR/AR Support** - WebXR integration for immersive visualization ([VR/AR Guide](https://graphty-org.github.io/graphty-element/guide/vr-ar))

## Browser Support

Graphty works in all modern browsers that support Web Components:
- Chrome/Edge 88+
- Firefox 78+
- Safari 14+

## License

MIT

Inspired by [three-forcegraph](https://github.com/vasturiano/three-forcegraph).
