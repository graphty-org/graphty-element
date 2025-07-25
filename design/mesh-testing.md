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

### Test Categories

1. **Scene Graph Structure Tests**: Validate mesh creation, hierarchy, and cleanup
2. **Style Computation Tests**: Verify style layer resolution and calculated values
3. **Data Flow Tests**: Test manager interactions and event propagation
4. **Mesh Property Tests**: Direct validation of materials, geometry, and transforms

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
  }
};

export function createTestGraph(element?: Element): Graph;
export function setupBasicGraph(): {graph: Graph, scene: Scene};
export function cleanupGraph(graph: Graph): void;
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

### Phase 3: Integration and Advanced Testing

#### 3.1 Algorithm Integration Tests
**File**: `test/mesh/algorithm-integration.test.ts`

Test algorithm results affecting styling:
- Degree-based node sizing
- Centrality-based coloring
- Community-based shape selection

#### 3.2 Layout Integration Tests
**File**: `test/mesh/layout-integration.test.ts`

Test layout algorithms with mesh validation:
- Position updates
- Transform applications
- Animation states

#### 3.3 Performance Boundary Tests
**File**: `test/mesh/performance.test.ts`

Test edge cases and performance:
- Large graph handling
- Memory cleanup
- Style computation performance

### Phase 4: Test Suite Integration

#### 4.1 npm Script Updates
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

#### 4.2 CI Integration
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