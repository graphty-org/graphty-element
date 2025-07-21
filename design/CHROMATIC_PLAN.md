# Chromatic Visual Testing Implementation Plan

## Overview
This document outlines the plan to implement Chromatic visual testing for the graphty-element project. The goal is to create a comprehensive visual regression testing suite that captures all graph visualization states and styles.

## Current Issues
1. **NodeStyles.stories.ts** was deleted, removing visual coverage for node styling
2. Visual tests need to cover all node shapes, edge styles, layouts, and interactive states
3. Tests must work with Chromatic's cloud rendering environment (no local URLs)

## Implementation Requirements

### 1. Story Organization
Create focused story files that test specific visual aspects:

```
stories/
├── NodeStyles.stories.ts      # All node shapes, colors, sizes, labels
├── EdgeStyles.stories.ts      # Edge styles, arrows, colors, widths
├── LabelStyles.stories.ts     # Label positioning, fonts, visibility
├── LayoutEngines.stories.ts   # Each layout algorithm visualization
├── InteractionStates.stories.ts # Hover, selection, dragging states
├── Performance.stories.ts     # Large graphs, stress tests
└── RealWorldExamples.stories.ts # Practical use cases
```

### 2. Node Styles Story Structure
The NodeStyles.stories.ts should include:

```typescript
// Test all node shapes
export const AllNodeShapes = {
  args: {
    data: createTestGraphWithAllShapes(),
    styles: [
      { selector: 'node[shape="sphere"]', style: { shape: 'sphere', color: '#ff0000' } },
      { selector: 'node[shape="cube"]', style: { shape: 'cube', color: '#00ff00' } },
      { selector: 'node[shape="cylinder"]', style: { shape: 'cylinder', color: '#0000ff' } },
      // ... all 10+ shapes
    ]
  }
};

// Test node sizes
export const NodeSizes = {
  args: {
    data: createSizeTestGraph(),
    styles: [
      { selector: 'node[size="small"]', style: { radius: 5 } },
      { selector: 'node[size="medium"]', style: { radius: 10 } },
      { selector: 'node[size="large"]', style: { radius: 20 } },
    ]
  }
};

// Test node colors and textures
export const NodeColorsAndTextures = {
  args: {
    data: createColorTestGraph(),
    styles: [
      { selector: 'node[type="gradient"]', style: { color: 'linear-gradient(#ff0000, #0000ff)' } },
      { selector: 'node[type="texture"]', style: { texture: 'https://example.com/texture.png' } },
      { selector: 'node[type="solid"]', style: { color: '#ffcc00' } },
    ]
  }
};
```

### 3. Test Data Requirements
All test data must use fully qualified URLs for Chromatic compatibility:

```typescript
// helpers.ts
export const TEST_DATA_BASE_URL = 'https://raw.githubusercontent.com/graphty-org/test-data/main/';

export function getTestDataUrl(filename: string): string {
  return `${TEST_DATA_BASE_URL}${filename}`;
}

// Example usage in stories
export const LargeGraph = {
  args: {
    dataUrl: getTestDataUrl('large-network.json'),
    layout: 'force-atlas2'
  }
};
```

### 4. Chromatic-Specific Configurations

#### Preview.ts Setup
```typescript
// .storybook/preview.ts
export const parameters = {
  chromatic: {
    // Capture after graph settles
    delay: 2000,
    // Disable animations for consistent snapshots
    pauseAnimationAtEnd: true,
    // Test multiple viewports
    viewports: [1200, 800],
  },
};

// Global decorators for consistent rendering
export const decorators = [
  (Story) => {
    // Ensure WebGL context is available
    // Set consistent camera position
    // Disable animations
    return Story();
  }
];
```

#### Story-Level Chromatic Config
```typescript
export const AnimatedLayout = {
  parameters: {
    chromatic: {
      delay: 5000, // Wait for animation to complete
      pauseAnimationAtEnd: true,
    }
  }
};
```

### 5. Visual Test Coverage Checklist

#### Node Coverage
- [ ] All shape types (sphere, cube, cylinder, cone, torus, etc.)
- [ ] Size variations (radius from 1 to 50)
- [ ] Color modes (solid, gradient, texture)
- [ ] Label positioning (center, above, below, auto)
- [ ] Icon support (Font Awesome, custom SVG)
- [ ] Selection states (selected, hovered, inactive)
- [ ] Visibility states (visible, hidden, transparent)

#### Edge Coverage
- [ ] Line styles (solid, dashed, dotted)
- [ ] Arrow types (none, forward, backward, both)
- [ ] Width variations (1-10px)
- [ ] Color modes (solid, gradient)
- [ ] Curve types (straight, curved, bezier)
- [ ] Label positioning along edges

#### Layout Coverage
- [ ] Force Atlas 2 (settled state)
- [ ] Spring Layout (settled state)
- [ ] Circular Layout
- [ ] Random Layout
- [ ] Kamada-Kawai
- [ ] NGraph layouts
- [ ] Custom layout with animation

#### Interaction States
- [ ] Node hover effects
- [ ] Edge hover effects
- [ ] Multi-selection
- [ ] Drag behavior
- [ ] Zoom levels (close, medium, far)
- [ ] Camera rotation angles

### 6. Implementation Steps

1. **Restore NodeStyles.stories.ts**
   - Create comprehensive node shape tests
   - Include all visual properties
   - Use consistent test data

2. **Create Missing Story Files**
   - InteractionStates.stories.ts
   - Performance.stories.ts
   - RealWorldExamples.stories.ts

3. **Update Helper Functions**
   - Create graph generators for each test scenario
   - Ensure all data URLs are external
   - Add utilities for common style patterns

4. **Configure Chromatic Delays**
   - Identify stories that need settling time
   - Add appropriate delays for animations
   - Ensure consistent snapshots

5. **Add Viewport Tests**
   - Test responsive behavior
   - Ensure labels remain readable
   - Verify layout adjustments

### 7. Example Story Implementation

```typescript
// stories/NodeStyles.stories.ts
import type { Meta, StoryObj } from '@storybook/web-components';
import { GraphtyElement } from '../src/graphty-element';
import { createNodeShapeTestData, getTestDataUrl } from './helpers';

const meta: Meta<GraphtyElement> = {
  title: 'Visual Tests/Node Styles',
  component: 'graphty-element',
  parameters: {
    chromatic: { delay: 2000 },
  },
};

export default meta;
type Story = StoryObj<GraphtyElement>;

export const AllNodeShapes: Story = {
  args: {
    data: createNodeShapeTestData(),
    layout: 'circular',
    styles: [
      { selector: 'node', style: { radius: 15 } },
      { selector: 'node[shape="sphere"]', style: { shape: 'sphere', color: '#e74c3c' } },
      { selector: 'node[shape="cube"]', style: { shape: 'cube', color: '#3498db' } },
      { selector: 'node[shape="cylinder"]', style: { shape: 'cylinder', color: '#2ecc71' } },
      { selector: 'node[shape="cone"]', style: { shape: 'cone', color: '#f39c12' } },
      { selector: 'node[shape="torus"]', style: { shape: 'torus', color: '#9b59b6' } },
      { selector: 'node[shape="dodecahedron"]', style: { shape: 'dodecahedron', color: '#1abc9c' } },
      { selector: 'node[shape="icosahedron"]', style: { shape: 'icosahedron', color: '#e67e22' } },
      { selector: 'node[shape="octahedron"]', style: { shape: 'octahedron', color: '#95a5a6' } },
      { selector: 'node[shape="tetrahedron"]', style: { shape: 'tetrahedron', color: '#34495e' } },
      { selector: 'node[shape="pyramid"]', style: { shape: 'pyramid', color: '#16a085' } },
    ],
    node: {
      label: {
        visible: true,
        style: {
          color: 'white',
          fontSize: 12,
          fontWeight: 'bold'
        }
      }
    }
  },
  parameters: {
    chromatic: {
      delay: 3000, // Extra time for 3D shapes to render
    }
  }
};

export const NodeSizeGradient: Story = {
  args: {
    dataUrl: getTestDataUrl('size-test-graph.json'),
    layout: 'force-atlas2',
    styles: [
      { selector: 'node', style: { 
        radius: 'Math.max(5, Math.min(30, node.degree * 3))',
        color: 'hsl(' + node.degree * 10 + ', 70%, 50%)'
      }},
    ]
  }
};

export const NodeLabels: Story = {
  args: {
    data: createLabelTestData(),
    layout: 'circular',
    node: {
      label: {
        visible: true,
        position: 'center',
        style: {
          color: 'white',
          fontSize: 14,
          fontFamily: 'Arial',
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: 4
        }
      }
    },
    styles: [
      { selector: 'node[priority="high"]', style: { 
        radius: 20,
        label: { position: 'above', style: { fontSize: 18 } }
      }},
      { selector: 'node[priority="low"]', style: { 
        radius: 10,
        label: { visible: false }
      }},
    ]
  }
};
```

### 8. Test Data Generators

```typescript
// helpers.ts
export function createNodeShapeTestData() {
  const shapes = ['sphere', 'cube', 'cylinder', 'cone', 'torus', 
                  'dodecahedron', 'icosahedron', 'octahedron', 
                  'tetrahedron', 'pyramid'];
  
  return {
    nodes: shapes.map((shape, i) => ({
      id: `node-${shape}`,
      label: shape,
      shape: shape,
      x: Math.cos(i * 2 * Math.PI / shapes.length) * 100,
      y: Math.sin(i * 2 * Math.PI / shapes.length) * 100,
      z: 0
    })),
    edges: []
  };
}

export function createSizeTestGraph() {
  const sizes = [5, 10, 15, 20, 25, 30];
  return {
    nodes: sizes.map((size, i) => ({
      id: `node-size-${size}`,
      label: `Size ${size}`,
      degree: size / 5, // For computed radius
    })),
    edges: sizes.slice(0, -1).map((_, i) => ({
      id: `edge-${i}`,
      source: `node-size-${sizes[i]}`,
      target: `node-size-${sizes[i + 1]}`
    }))
  };
}
```

### 9. Success Criteria

1. **Visual Coverage**: Every visual property has at least one test
2. **Consistency**: All snapshots are deterministic (no flaky tests)
3. **Performance**: Tests complete within Chromatic timeout limits
4. **Documentation**: Each story clearly shows what it's testing
5. **Maintainability**: Helper functions make adding new tests easy

### 10. Troubleshooting Guide

#### Common Issues and Solutions

1. **Flaky Snapshots**
   - Increase chromatic.delay
   - Disable animations with pauseAnimationAtEnd
   - Use settled state detection

2. **WebGL Context Errors**
   - Ensure proper canvas cleanup between tests
   - Limit number of concurrent WebGL contexts
   - Use smaller test datasets

3. **Timeout Errors**
   - Reduce graph size for visual tests
   - Pre-calculate layouts where possible
   - Use simpler rendering options

4. **Missing Visual Elements**
   - Check that all URLs are external
   - Verify WebGL features are supported
   - Ensure proper camera positioning

## Next Steps

1. Implement NodeStyles.stories.ts following this plan
2. Run `npm run test:visual` to verify locally
3. Push to trigger Chromatic build
4. Review snapshots and adjust as needed
5. Continue with other story files

This plan provides a comprehensive approach to visual testing that ensures all aspects of the graphty-element visualization are properly tested and monitored for regressions.