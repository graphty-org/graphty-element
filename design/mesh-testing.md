# Mesh Testing Approach: Direct Property Validation for Graphty

## Overview

This document outlines a comprehensive approach to testing graphty's rendering features through direct mesh property validation rather than visual testing. This approach provides faster, more reliable, and more precise validation of styling and rendering correctness.

## Problem Statement

Visual testing with screenshot comparison has several limitations:
- **Slow execution**: ~5 seconds per test
- **False positives**: Minor rendering differences cause failures
- **Limited precision**: Can't verify exact property values
- **Platform dependencies**: Different graphics drivers produce different results
- **Debugging difficulty**: Hard to identify specific failures

## Solution: Direct Mesh Property Validation

Instead of comparing pixels, we validate the 3D scene structure and mesh properties directly through BabylonJS APIs. This approach:
- Runs 10-100x faster than visual tests
- Provides exact property validation
- Eliminates false positives
- Works consistently across platforms
- Enables precise debugging

## Architecture

### Test Environment: Babylon.js NullEngine

The mesh testing approach will use Babylon.js's NullEngine, which provides several critical advantages:

- **No GPU Rendering**: Creates all meshes, materials, and scene graph structure without actual rendering
- **Fast Execution**: Eliminates GPU overhead, running 10-100x faster than WebGL engine
- **CI/CD Compatible**: Works in headless environments without graphics drivers
- **Full API Access**: All mesh properties, transformations, and scene management remain fully functional
- **Deterministic Results**: No rendering variations across different hardware

### Test Categories

1. **Scene Graph Structure Tests**: Validate mesh creation, hierarchy, and cleanup
2. **Style Computation Tests**: Verify style layer resolution and calculated values
3. **Data Flow Tests**: Test manager interactions and event propagation
4. **Mesh Property Tests**: Direct validation of materials, geometry, and transforms
5. **Animation Property Tests**: Validate animation setup and interpolation values
6. **Comprehensive Style Coverage Tests**: Systematic validation of all style combinations

### Key Testing Points

#### Node Styling Validation
- **Colors**: Material diffuseColor properties
- **Sizes**: Mesh scaling transforms
- **Shapes**: Mesh geometry types and names
- **Opacity**: Material alpha values
- **Textures**: DiffuseTexture assignments

#### Edge Styling Validation
- **Width**: GreasedLine width arrays
- **Colors**: GreasedLine color arrays
- **Arrow heads**: Arrow mesh existence and properties
- **Animation**: Material uniforms and dash properties

### Comprehensive Style Variation Testing with fast-check

To ensure complete coverage of all style combinations, we'll use fast-check for property-based testing. This approach generates test cases systematically and finds edge cases automatically.

#### Installing fast-check
```bash
npm install --save-dev fast-check
```

#### Defining Style Property Arbitraries

```typescript
// test/helpers/style-arbitraries.ts
import * as fc from 'fast-check';

// Basic value arbitraries
const colorArbitrary = fc.oneof(
  // Hex colors
  fc.hexaString({ minLength: 6, maxLength: 6 }).map(h => `#${h}`),
  // RGB colors
  fc.tuple(fc.nat(255), fc.nat(255), fc.nat(255))
    .map(([r, g, b]) => `rgb(${r},${g},${b})`),
  // RGBA colors
  fc.tuple(fc.nat(255), fc.nat(255), fc.nat(255), fc.float({ min: 0, max: 1 }))
    .map(([r, g, b, a]) => `rgba(${r},${g},${b},${a})`),
  // Named colors
  fc.constantFrom('red', 'green', 'blue', 'yellow', 'orange', 'purple'),
  // Dynamic expressions
  fc.constantFrom(
    '$expr(colors[type])',
    '$expr(stateColors[status])',
    '$expr(gradient(importance))'
  )
);

const sizeArbitrary = fc.oneof(
  // Numeric sizes
  fc.float({ min: 1, max: 100, noNaN: true }),
  // Common sizes
  fc.constantFrom(5, 10, 15, 20, 25, 30, 50),
  // Dynamic expressions
  fc.constantFrom(
    '$expr(degree * 5)',
    '$expr(Math.log(connections + 1) * 10)',
    '$expr(Math.sqrt(importance) * 20)',
    '$expr(centrality * 30)'
  )
);

const shapeArbitrary = fc.oneof(
  // Static shapes
  fc.constantFrom('sphere', 'box', 'cylinder', 'cone', 'torus', 'dodecahedron'),
  // Dynamic expressions
  fc.constantFrom(
    '$expr(shapes[type])',
    '$expr(categoryShapes[category])',
    '$expr(importance > 0.5 ? "sphere" : "box")'
  )
);

const opacityArbitrary = fc.oneof(
  // Numeric opacity
  fc.float({ min: 0, max: 1, noNaN: true }),
  // Common values
  fc.constantFrom(0, 0.25, 0.5, 0.75, 1),
  // Dynamic expressions
  fc.constantFrom(
    '$expr(importance)',
    '$expr(1 - age / maxAge)',
    '$expr(active ? 1 : 0.3)'
  )
);

const textureArbitrary = fc.oneof(
  // No texture
  fc.constant(null),
  // Local paths
  fc.constantFrom(
    'icon.png',
    'textures/metal.jpg',
    'assets/logo.svg'
  ),
  // URLs
  fc.webUrl().map(url => `${url}/texture.png`),
  // Dynamic expressions
  fc.constantFrom(
    '$expr(icons[type])',
    '$expr(textures[category])',
    '$expr(active ? "active.png" : "inactive.png")'
  )
);

// Complete node style arbitrary
export const nodeStyleArbitrary = fc.record({
  color: colorArbitrary,
  size: sizeArbitrary,
  shape: shapeArbitrary,
  opacity: opacityArbitrary,
  texture: fc.option(textureArbitrary, { nil: undefined })
}, { requiredKeys: [] });

// Edge style arbitraries
const widthArbitrary = fc.oneof(
  fc.float({ min: 0.5, max: 20, noNaN: true }),
  fc.constantFrom(1, 2, 3, 5, 8, 10),
  fc.constantFrom(
    '$expr(weight * 2)',
    '$expr(Math.sqrt(traffic))',
    '$expr(importance * 10)'
  )
);

const dashArbitrary = fc.oneof(
  fc.constant(null),
  // Common dash patterns
  fc.constantFrom([5, 5], [10, 5], [10, 2], [2, 2]),
  // Custom patterns
  fc.array(fc.nat({ max: 20 }), { minLength: 2, maxLength: 4 }),
  // Dynamic expressions
  fc.constantFrom(
    '$expr(patterns[type])',
    '$expr(active ? [10, 5] : null)'
  )
);

const arrowArbitrary = fc.oneof(
  fc.boolean(),
  fc.constantFrom('both', 'source', 'target', 'none')
);

const animationArbitrary = fc.oneof(
  fc.constant(null),
  fc.constantFrom('flow', 'pulse', 'dash'),
  fc.record({
    type: fc.constantFrom('flow', 'pulse', 'dash'),
    speed: fc.float({ min: 0.1, max: 5, noNaN: true }),
    direction: fc.constantFrom('forward', 'backward', 'both')
  })
);

export const edgeStyleArbitrary = fc.record({
  width: widthArbitrary,
  color: colorArbitrary,
  dash: dashArbitrary,
  arrow: arrowArbitrary,
  animation: animationArbitrary
}, { requiredKeys: [] });

// Label style arbitrary
export const labelStyleArbitrary = fc.record({
  text: fc.oneof(
    fc.string(),
    fc.constantFrom(
      '$expr(id)',
      '$expr(name || id)',
      '$expr(`${type}: ${id}`)',
      '$expr(formatLabel(this))'
    )
  ),
  fontSize: fc.nat({ min: 8, max: 32 }),
  color: colorArbitrary,
  backgroundColor: fc.option(colorArbitrary, { nil: undefined }),
  animation: fc.option(fc.constantFrom('rotate', 'fade', 'scale'), { nil: undefined })
}, { requiredKeys: [] });
```

#### Comprehensive Test Generation

```typescript
// test/mesh/comprehensive-style.test.ts
import * as fc from 'fast-check';
import { nodeStyleArbitrary, edgeStyleArbitrary } from '../helpers/style-arbitraries';

describe('Comprehensive Style Testing', () => {
  // Test all node style combinations
  test.prop([nodeStyleArbitrary], {
    numRuns: 1000, // Run 1000 random combinations
    seed: 12345,   // Reproducible tests
    verbose: true   // Log failing cases
  })('validates any node style combination', (style) => {
    const {graph, scene} = setupBasicGraph();
    
    // Apply random style
    graph.styles.setStyleLayers([
      {selector: '*', style}
    ]);
    
    // Add test node with random properties
    const nodeData = {
      id: 'test-node',
      type: 'server',
      importance: 0.7,
      connections: 5,
      degree: 3
    };
    graph.addNode(nodeData);
    
    // Validate mesh matches style
    const mesh = scene.getMeshById('node-test-node');
    validateNodeStyle(mesh, style, nodeData);
  });

  // Test style layer combinations
  test.prop([
    fc.array(
      fc.record({
        selector: selectorArbitrary,
        style: nodeStyleArbitrary
      }),
      { minLength: 1, maxLength: 10 }
    )
  ])('validates style layer precedence', (layers) => {
    const {graph, scene} = setupBasicGraph();
    
    graph.styles.setStyleLayers(layers);
    
    // Add nodes that match different selectors
    const testNodes = [
      {id: 'node1', type: 'server', status: 'active'},
      {id: 'node2', type: 'client', status: 'inactive'},
      {id: 'special', type: 'server', special: true}
    ];
    
    testNodes.forEach(node => graph.addNode(node));
    
    // Validate each node gets correct computed style
    testNodes.forEach(node => {
      const mesh = scene.getMeshById(`node-${node.id}`);
      const expectedStyle = computeExpectedStyle(node, layers);
      validateNodeStyle(mesh, expectedStyle, node);
    });
  });

  // Test edge cases and boundary values
  test.prop([
    fc.record({
      // Extreme values
      color: fc.oneof(
        fc.constant('#000000'), // Pure black
        fc.constant('#ffffff'), // Pure white
        fc.constant('rgba(0,0,0,0)'), // Fully transparent
        fc.constant('rgba(255,255,255,1)') // Fully opaque white
      ),
      size: fc.oneof(
        fc.constant(0.1), // Very small
        fc.constant(1000), // Very large
        fc.constant(Number.EPSILON) // Smallest positive
      ),
      opacity: fc.oneof(
        fc.constant(0),
        fc.constant(1),
        fc.constant(0.999999),
        fc.constant(0.000001)
      )
    })
  ])('handles edge case values correctly', (extremeStyle) => {
    const {graph, scene} = setupBasicGraph();
    
    graph.styles.setStyleLayers([
      {selector: '*', style: extremeStyle}
    ]);
    
    graph.addNode({id: 'extreme-node'});
    
    const mesh = scene.getMeshById('node-extreme-node');
    validateNodeStyle(mesh, extremeStyle, {id: 'extreme-node'});
  });
});

// Selector arbitrary for comprehensive selector testing
const selectorArbitrary = fc.oneof(
  // Universal
  fc.constant('*'),
  // Type selectors
  fc.constantFrom('node', 'edge'),
  // ID selectors
  fc.string({ minLength: 1, maxLength: 20 })
    .filter(s => /^[a-zA-Z][\w-]*$/.test(s))
    .map(id => `#${id}`),
  // Attribute selectors
  fc.record({
    attr: fc.constantFrom('type', 'status', 'category', 'level'),
    op: fc.constantFrom('=', '!=', '>', '<', '>=', '<=', '~=', '^=', '$='),
    value: fc.oneof(fc.string(), fc.nat(), fc.boolean())
  }).map(({attr, op, value}) => 
    `[${attr}${op}"${value}"]`
  ),
  // Compound selectors
  fc.tuple(
    fc.constantFrom('node', 'edge', ''),
    fc.array(
      fc.constantFrom('[type="server"]', '[status="active"]', '[important]'),
      { minLength: 1, maxLength: 3 }
    )
  ).map(([type, attrs]) => `${type}${attrs.join('')}`),
  // Complex expressions
  fc.constantFrom(
    'node[degree > 5][type="hub"]',
    'edge[weight >= 0.5]',
    '*[name ~= "test"]'
  )
);
```

#### Testing Specific Style Combinations

```typescript
// test/mesh/style-combinations.test.ts

describe('Specific Style Combination Coverage', () => {
  // Define all required combinations
  const requiredCombinations = [
    // Shape + Color combinations
    ...cartesianProduct(
      ['sphere', 'box', 'cylinder'],
      ['#ff0000', '#00ff00', '#0000ff']
    ).map(([shape, color]) => ({ shape, color })),
    
    // Size + Opacity combinations
    ...cartesianProduct(
      [5, 10, 20, 50],
      [0.25, 0.5, 0.75, 1]
    ).map(([size, opacity]) => ({ size, opacity })),
    
    // Dynamic expression combinations
    {
      color: '$expr(stateColors[state])',
      size: '$expr(importance * 20)',
      shape: '$expr(typeShapes[type])'
    }
  ];

  test.each(requiredCombinations)(
    'validates style combination %j',
    (style) => {
      const {graph, scene} = setupBasicGraph();
      
      graph.styles.setStyleLayers([
        {selector: '*', style}
      ]);
      
      // Test with appropriate node data for expressions
      const nodeData = {
        id: 'test',
        type: 'server',
        state: 'active',
        importance: 0.8
      };
      
      graph.addNode(nodeData);
      
      const mesh = scene.getMeshById('node-test');
      validateNodeStyle(mesh, style, nodeData);
    }
  );
});

// Utility for cartesian product
function cartesianProduct<T>(...arrays: T[][]): T[][] {
  return arrays.reduce((acc, array) => 
    acc.flatMap(a => array.map(b => [...a, b])),
    [[]] as T[][]
  );
}
```

#### Shrinking and Debugging Failed Cases

```typescript
// fast-check automatically shrinks failing cases to minimal examples
test.prop([nodeStyleArbitrary], {
  numRuns: 1000,
  endOnFailure: false, // Continue to find all failures
  reporter: (runDetails) => {
    if (runDetails.failed) {
      console.log('Minimal failing case:', runDetails.counterexample);
      console.log('Seed to reproduce:', runDetails.seed);
    }
  }
})('finds minimal failing style combinations', (style) => {
  // Test implementation
});

// Custom shrinking for complex properties
const customStyleArbitrary = nodeStyleArbitrary.chain(style =>
  fc.record({
    ...style,
    // Ensure color and size are related
    size: style.color?.includes('red') 
      ? fc.constant(20) 
      : sizeArbitrary
  })
);
```

## Implementation Plan

### Phase 1: Test Infrastructure Setup

#### 1.1 Create Test Utilities Module
**File**: `test/helpers/mesh-testing-utils.ts`

```typescript
// Helper functions for common mesh validations
export function assertMeshColor(mesh: AbstractMesh, expectedHex: string, tolerance?: number): void;
export function assertMeshSize(mesh: AbstractMesh, expectedSize: number, tolerance?: number): void;
export function assertEdgeWidth(edgeMesh: AbstractMesh, expectedWidth: number, tolerance?: number): void;
export function getMeshShape(mesh: AbstractMesh): string;
export function assertMeshOpacity(mesh: AbstractMesh, expectedOpacity: number, tolerance?: number): void;
export function assertTextureApplied(mesh: AbstractMesh, expectedUrl?: string): void;
export function assertArrowHeadExists(scene: Scene, edgeId: string): AbstractMesh | null;
```

#### 1.2 Create Graph Test Fixtures
**File**: `test/helpers/graph-test-fixtures.ts`

```typescript
import { NullEngine } from '@babylonjs/core';
import { Graph } from '../../src/Graph';

// Standardized test data and graph setups
export const TestData = {
  nodes: {
    simple: [{id: 'a'}, {id: 'b'}],
    typed: [{id: 'server', type: 'server'}, {id: 'user', type: 'user'}],
    styled: [{id: 'red', color: '#ff0000'}, {id: 'blue', color: '#0000ff'}]
  },
  edges: {
    simple: [{source: 'a', target: 'b'}],
    typed: [{source: 'a', target: 'b', type: 'connection'}]
  },
  // Comprehensive style test data
  styleVariations: {
    allNodeShapes: ['sphere', 'box', 'cylinder', 'cone', 'torus', 'dodecahedron'],
    allEdgePatterns: ['solid', 'dashed', 'dotted', 'dashdot'],
    colorFormats: ['#ff0000', 'rgb(255,0,0)', 'rgba(255,0,0,0.5)', 'red']
  }
};

export function createTestGraph(options?: {
  engine?: NullEngine,
  element?: Element,
  enableStats?: boolean
}): Graph {
  const engine = options?.engine || new NullEngine();
  const element = options?.element || document.createElement('div');
  
  // Create graph with NullEngine
  const graph = new Graph(element, {
    engine: engine,
    stats: options?.enableStats || false,
    renderLoop: false  // Disable automatic rendering for tests
  });
  
  return graph;
}

export function setupBasicGraph(): {graph: Graph, scene: Scene, engine: NullEngine} {
  const engine = new NullEngine({
    renderWidth: 1920,
    renderHeight: 1080,
    deterministicLockstep: true
  });
  
  const graph = createTestGraph({ engine });
  const scene = graph.scene;
  
  return { graph, scene, engine };
}

export function cleanupGraph(graph: Graph): void {
  // Ensure all resources are properly disposed
  graph.clear();
  graph.dispose();
}

// Test data generators for comprehensive coverage
export function* generateStyleCombinations() {
  const properties = ['color', 'size', 'shape', 'opacity'];
  const values = {
    color: ['#ff0000', '#00ff00', '#0000ff'],
    size: [5, 10, 20],
    shape: ['sphere', 'box', 'cylinder'],
    opacity: [0.5, 0.75, 1]
  };
  
  // Generate all combinations
  for (const color of values.color) {
    for (const size of values.size) {
      for (const shape of values.shape) {
        for (const opacity of values.opacity) {
          yield { color, size, shape, opacity };
        }
      }
    }
  }
}
```

#### 1.3 Test Configuration
**File**: `vitest.config.mesh-testing.ts`

```typescript
// Specific configuration for mesh testing
export default defineConfig({
  test: {
    name: 'mesh-testing',
    include: ['test/mesh/**/*.test.ts'],
    environment: 'jsdom',
    setupFiles: ['test/helpers/mesh-test-setup.ts']
  }
});
```

#### 1.4 NullEngine Setup
**File**: `test/helpers/mesh-test-setup.ts`

```typescript
import { NullEngine, Scene } from '@babylonjs/core';

// Global test engine setup
let globalEngine: NullEngine;
let globalScene: Scene;

export function setupTestEngine(): { engine: NullEngine, scene: Scene } {
  // Create NullEngine with specific options for testing
  globalEngine = new NullEngine({
    renderWidth: 1920,
    renderHeight: 1080,
    textureSize: 512,
    deterministicLockstep: true,  // Ensures deterministic behavior
    lockstepMaxSteps: 4
  });

  globalScene = new Scene(globalEngine);
  
  // Configure scene for testing
  globalScene.useRightHandedSystem = true;
  globalScene.autoClear = false;
  globalScene.blockMaterialDirtyMechanism = true; // Improves performance
  
  return { engine: globalEngine, scene: globalScene };
}

export function cleanupTestEngine(): void {
  if (globalScene) {
    globalScene.dispose();
    globalScene = null;
  }
  if (globalEngine) {
    globalEngine.dispose();
    globalEngine = null;
  }
}

// Vitest hooks
beforeEach(() => {
  setupTestEngine();
});

afterEach(() => {
  cleanupTestEngine();
});
```

### Phase 2: Core Test Implementation

#### 2.1 Node Styling Tests
**File**: `test/mesh/node-styling.test.ts`

Test categories:
- Color application from styles
- Size scaling from calculated values
- Shape selection based on node properties
- Opacity and transparency effects
- Texture loading and application
- Dynamic style updates

#### 2.2 Edge Styling Tests
**File**: `test/mesh/edge-styling.test.ts`

Test categories:
- Edge width from style properties
- Color application to GreasedLine
- Arrow head creation and styling
- Line animation properties
- Dash patterns and styling

#### 2.3 Style System Tests
**File**: `test/mesh/style-system.test.ts`

Test categories:
- JMESPath selector matching
- Style layer precedence
- Calculated value resolution
- Style caching performance
- Dynamic style updates

#### 2.4 Scene Structure Tests
**File**: `test/mesh/scene-structure.test.ts`

Test categories:
- Mesh creation and naming
- Parent-child relationships
- Cleanup after removal
- Material assignments
- Cache utilization

### Phase 3: Animation Testing

#### 3.1 Animation Property Validation
**File**: `test/mesh/animation.test.ts`

Animation testing requires special handling since animations change over time. Our approach:

##### Layout Animation Testing
```typescript
test('validates layout animation properties', async () => {
  const {graph, scene} = setupBasicGraph();
  
  // Add nodes and set animated layout
  graph.addNode({id: 'a', x: 0, y: 0, z: 0});
  graph.addNode({id: 'b', x: 100, y: 100, z: 0});
  
  // Configure animation
  graph.layoutManager.setAnimationDuration(1000); // 1 second
  graph.layoutManager.setEasingFunction('easeInOut');
  
  // Trigger layout change
  graph.setLayout('force-directed');
  
  // Test initial state
  const nodeA = scene.getMeshById('node-a');
  assertMeshPosition(nodeA, {x: 0, y: 0, z: 0});
  
  // Mock time progression (NullEngine allows time control)
  await mockAnimationFrame(250); // 25% complete
  const pos25 = getInterpolatedPosition(0, targetX, 0.25, 'easeInOut');
  assertMeshPosition(nodeA, pos25, 0.1);
  
  await mockAnimationFrame(500); // 50% complete
  const pos50 = getInterpolatedPosition(0, targetX, 0.5, 'easeInOut');
  assertMeshPosition(nodeA, pos50, 0.1);
  
  await mockAnimationFrame(1000); // 100% complete
  assertMeshPosition(nodeA, {x: targetX, y: targetY, z: targetZ});
});
```

##### Label Animation Testing
```typescript
test('validates label rotation animation', () => {
  const {graph, scene} = setupBasicGraph();
  
  graph.styles.setStyleLayers([
    {selector: '*', style: {
      label: {
        text: '$expr(id)',
        animation: 'rotate',
        animationSpeed: 2
      }
    }}
  ]);
  
  graph.addNode({id: 'rotating-label'});
  
  const labelMesh = scene.getMeshById('label-rotating-label');
  
  // Verify animation setup
  assert(labelMesh.metadata.animationType === 'rotate');
  assert(labelMesh.metadata.animationSpeed === 2);
  
  // Verify rotation update function exists
  assert(typeof labelMesh.metadata.updateRotation === 'function');
  
  // Test rotation at different time points
  const rotation0 = labelMesh.rotation.y;
  mockTime(1000); // 1 second later
  labelMesh.metadata.updateRotation(1000);
  const rotation1 = labelMesh.rotation.y;
  
  // Should have rotated: speed * time * 2PI
  const expectedRotation = rotation0 + (2 * 1 * Math.PI * 2);
  assert(Math.abs(rotation1 - expectedRotation) < 0.01);
});
```

##### Edge Flow Animation Testing
```typescript
test('validates edge flow animation properties', () => {
  const {graph, scene} = setupBasicGraph();
  
  graph.styles.setStyleLayers([
    {selector: 'edge', style: {
      animation: 'flow',
      animationSpeed: 0.5,
      dash: [10, 5]
    }}
  ]);
  
  graph.addNode({id: 'a'});
  graph.addNode({id: 'b'});
  graph.addEdge({source: 'a', target: 'b', id: 'flowing'});
  
  const edgeMesh = scene.getMeshById('edge-flowing') as GreasedLineMesh;
  const material = edgeMesh.greasedLineMaterial;
  
  // Verify dash pattern setup
  assert(material.dashCount === 2);
  assert.deepEqual(material.dashArray, [10, 5]);
  
  // Verify animation uniform exists
  assert(material.dashOffset !== undefined);
  
  // Test offset animation
  const offset0 = material.dashOffset;
  mockTime(2000); // 2 seconds at 0.5 speed = 1 full cycle
  updateEdgeAnimation(edgeMesh, 2000);
  const offset1 = material.dashOffset;
  
  // Should have completed one full cycle
  assert(Math.abs((offset1 - offset0) % 15) < 0.01); // 15 = pattern length
});
```

#### Animation Test Utilities
```typescript
// test/helpers/animation-test-utils.ts

export function mockAnimationFrame(targetTime: number): Promise<void> {
  // In NullEngine, we can control time progression
  return new Promise(resolve => {
    engine.getDeltaTime = () => targetTime - currentMockTime;
    currentMockTime = targetTime;
    scene.render();
    resolve();
  });
}

export function getInterpolatedPosition(
  start: number, 
  end: number, 
  progress: number, 
  easing: string
): number {
  const easedProgress = applyEasing(progress, easing);
  return start + (end - start) * easedProgress;
}

export function assertMeshPosition(
  mesh: AbstractMesh,
  expected: {x: number, y: number, z: number},
  tolerance = 0.01
): void {
  assert(Math.abs(mesh.position.x - expected.x) < tolerance);
  assert(Math.abs(mesh.position.y - expected.y) < tolerance);
  assert(Math.abs(mesh.position.z - expected.z) < tolerance);
}
```

### Phase 4: Integration and Advanced Testing

#### 4.1 Algorithm Integration Tests
**File**: `test/mesh/algorithm-integration.test.ts`

Test algorithm results affecting styling:
- Degree-based node sizing
- Centrality-based coloring
- Community-based shape selection

#### 4.2 Layout Integration Tests
**File**: `test/mesh/layout-integration.test.ts`

Test layout algorithms with mesh validation:
- Position updates
- Transform applications
- Animation states

#### 4.3 Performance Boundary Tests
**File**: `test/mesh/performance.test.ts`

Test edge cases and performance:
- Large graph handling
- Memory cleanup
- Style computation performance

### Phase 5: Test Suite Integration

#### 5.1 npm Script Updates
**File**: `package.json`

```json
{
  "scripts": {
    "test:mesh": "vitest --config vitest.config.mesh-testing.ts",
    "test:mesh:watch": "vitest --config vitest.config.mesh-testing.ts --watch",
    "test:unit": "vitest --project=default --project=mesh-testing",
    "test:all": "npm run test:unit && npm run test:storybook && npm run test:visual:critical"
  }
}
```

#### 5.2 CI Integration
Update CI to run mesh tests as primary validation, with reduced visual testing.

## Detailed Implementation Examples

### Node Color Validation

```typescript
test('node color styling from selector', () => {
  const {graph, scene} = setupBasicGraph();
  
  graph.styles.setStyleLayers([
    {selector: '[type="error"]', style: {color: '#ff0000'}},
    {selector: '[type="warning"]', style: {color: '#ffaa00'}},
  ]);
  
  graph.addNode({id: 'error1', type: 'error'});
  graph.addNode({id: 'warning1', type: 'warning'});
  
  const errorMesh = scene.getMeshById('node-error1');
  const warningMesh = scene.getMeshById('node-warning1');
  
  assertMeshColor(errorMesh, '#ff0000');
  assertMeshColor(warningMesh, '#ffaa00');
  
  cleanupGraph(graph);
});
```

### Dynamic Size Calculation

```typescript
test('calculated size values', () => {
  const {graph, scene} = setupBasicGraph();
  
  graph.styles.setStyleLayers([
    {selector: '*', style: {size: '$expr(importance * 20 + 5)'}},
  ]);
  
  graph.addNode({id: 'important', importance: 0.8}); // size = 21
  graph.addNode({id: 'normal', importance: 0.3});    // size = 11
  
  assertMeshSize(scene.getMeshById('node-important'), 21);
  assertMeshSize(scene.getMeshById('node-normal'), 11);
  
  cleanupGraph(graph);
});
```

### Edge Width Validation

```typescript
test('edge width from style properties', () => {
  const {graph, scene} = setupBasicGraph();
  
  graph.addNode({id: 'a'});
  graph.addNode({id: 'b'});
  
  graph.styles.setStyleLayers([
    {selector: 'edge[type="highway"]', style: {width: 8}},
    {selector: 'edge[type="street"]', style: {width: 3}},
  ]);
  
  graph.addEdge({source: 'a', target: 'b', id: 'road1', type: 'highway'});
  graph.addEdge({source: 'a', target: 'b', id: 'road2', type: 'street'});
  
  assertEdgeWidth(scene.getMeshById('edge-road1'), 8);
  assertEdgeWidth(scene.getMeshById('edge-road2'), 3);
  
  cleanupGraph(graph);
});
```

### Style Layer Precedence

```typescript
test('style layer precedence resolution', () => {
  const {graph, scene} = setupBasicGraph();
  
  graph.styles.setStyleLayers([
    {selector: '*', style: {color: '#cccccc', size: 5}},
    {selector: '[type="server"]', style: {color: '#0066cc'}},
    {selector: '[status="error"]', style: {color: '#ff0000'}},
    {selector: '[type="server"][status="error"]', style: {
      color: '#ff6600',
      size: '$expr(size * 1.5)'
    }},
  ]);
  
  graph.addNode({id: 'error-server', type: 'server', status: 'error', size: 10});
  
  const mesh = scene.getMeshById('node-error-server');
  
  // Combined rule should win
  assertMeshColor(mesh, '#ff6600');
  assertMeshSize(mesh, 15); // 10 * 1.5
  
  cleanupGraph(graph);
});
```

### Helper Function Implementation

```typescript
// test/helpers/mesh-testing-utils.ts
import {AbstractMesh, Color3, GreasedLineBaseMesh, StandardMaterial} from "@babylonjs/core";
import {assert} from "vitest";

export function assertMeshColor(
  mesh: AbstractMesh, 
  expectedHex: string, 
  tolerance = 0.01
): void {
  const material = mesh.material as StandardMaterial;
  const expected = Color3.FromHexString(expectedHex);
  const actual = material.diffuseColor;
  
  assert(Math.abs(actual.r - expected.r) < tolerance, 
    `Red component: expected ${expected.r}, got ${actual.r}`);
  assert(Math.abs(actual.g - expected.g) < tolerance,
    `Green component: expected ${expected.g}, got ${actual.g}`);
  assert(Math.abs(actual.b - expected.b) < tolerance,
    `Blue component: expected ${expected.b}, got ${actual.b}`);
}

export function assertMeshSize(
  mesh: AbstractMesh, 
  expectedSize: number, 
  tolerance = 0.001
): void {
  assert(Math.abs(mesh.scaling.x - expectedSize) < tolerance,
    `Size: expected ${expectedSize}, got ${mesh.scaling.x}`);
  assert(mesh.scaling.x === mesh.scaling.y, 'Scaling should be uniform');
  assert(mesh.scaling.y === mesh.scaling.z, 'Scaling should be uniform');
}

export function assertEdgeWidth(
  edgeMesh: AbstractMesh, 
  expectedWidth: number, 
  tolerance = 0.001
): void {
  assert(edgeMesh instanceof GreasedLineBaseMesh, 'Expected GreasedLineBaseMesh for edge');
  
  const widthData = edgeMesh.greasedLineMaterial.widths;
  const maxWidth = Math.max(...widthData);
  assert(Math.abs(maxWidth - expectedWidth) < tolerance,
    `Edge width: expected ${expectedWidth}, got ${maxWidth}`);
}

export function getMeshShape(mesh: AbstractMesh): string {
  if (mesh.metadata?.shape) {
    return mesh.metadata.shape;
  }
  
  const nameLower = mesh.name.toLowerCase();
  if (nameLower.includes('box')) return 'box';
  if (nameLower.includes('sphere')) return 'sphere';
  if (nameLower.includes('cylinder')) return 'cylinder';
  if (nameLower.includes('cone')) return 'cone';
  
  return 'unknown';
}

export function assertMeshOpacity(
  mesh: AbstractMesh, 
  expectedOpacity: number, 
  tolerance = 0.001
): void {
  const material = mesh.material as StandardMaterial;
  assert(Math.abs(material.alpha - expectedOpacity) < tolerance,
    `Opacity: expected ${expectedOpacity}, got ${material.alpha}`);
}

export function assertTextureApplied(
  mesh: AbstractMesh, 
  expectedUrl?: string
): void {
  const material = mesh.material as StandardMaterial;
  
  if (expectedUrl) {
    assert(material.diffuseTexture !== null, 'Expected texture to be applied');
    assert(material.diffuseTexture.url.includes(expectedUrl),
      `Expected texture URL to contain '${expectedUrl}', got '${material.diffuseTexture.url}'`);
  } else {
    assert(material.diffuseTexture !== null, 'Expected some texture to be applied');
  }
}
```

## Migration Strategy

### Phase 1: Parallel Implementation
- Implement mesh testing alongside existing visual tests
- Run both test suites to ensure equivalence
- Validate that mesh tests catch the same issues

### Phase 2: Coverage Analysis
- Map visual test coverage to mesh test coverage
- Identify critical visual scenarios that need preservation
- Create hybrid approach with minimal visual tests

### Phase 3: Primary Migration
- Make mesh tests the primary validation method
- Reduce visual tests to critical user-facing scenarios
- Update CI/CD pipelines

### Phase 4: Performance Optimization
- Optimize test execution speed
- Implement test parallelization
- Add performance monitoring

## Expected Benefits

### Performance Improvements
- **Test execution**: 10-100x faster than visual tests
- **CI pipeline**: Reduced from 20+ minutes to 2-3 minutes
- **Development feedback**: Instant test results during development

### Reliability Improvements
- **No false positives**: Exact property validation
- **Platform independence**: Consistent across different environments
- **Deterministic results**: Same results every time

### Developer Experience
- **Precise debugging**: Know exactly which property failed
- **Better error messages**: Specific value comparisons
- **Easier test maintenance**: No screenshot baseline management

## Success Metrics

- Test execution time reduced by 90%+
- Test flakiness reduced to <1%
- 100% coverage of style application scenarios
- Developer satisfaction with debugging experience
- CI pipeline stability improvement

## Future Enhancements

### Advanced Validation
- Mesh geometry verification for custom shapes
- Animation state validation
- Performance profiling integration

### Tool Integration
- VSCode extension for test debugging
- Visual test result comparison tools
- Automated test generation from style definitions

### Extended Coverage
- WebXR-specific mesh validation
- Multi-viewport testing
- Accessibility property validation

## Conclusion

This mesh testing approach provides a robust, fast, and reliable alternative to visual testing for validating graphty's rendering functionality. By testing the underlying 3D scene structure and properties directly, we can ensure rendering correctness while dramatically improving test performance and developer experience.

The implementation plan provides a clear path forward that can be executed incrementally, allowing for validation of the approach while maintaining existing test coverage.