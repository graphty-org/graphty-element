# Mesh Testing Approach: Tracking Mock Validation for Graphty

## Overview

This document outlines a comprehensive approach to testing graphty's rendering features through tracking mocks that record all configuration and drawing operations. This approach provides fast, precise validation of mesh creation, styling, and rendering operations without requiring actual pixel rendering.

## Problem Statement

Visual testing with screenshot comparison has several limitations:
- **Slow execution**: ~5 seconds per test
- **False positives**: Minor rendering differences cause failures
- **Limited precision**: Can't verify exact property values
- **Platform dependencies**: Different graphics drivers produce different results
- **Debugging difficulty**: Hard to identify specific failures

## Solution: Tracking Mock System

Instead of comparing pixels or just validating final state, we use tracking mocks that:
- **Record all operations**: Every method call, property set, and drawing command
- **Validate behavior**: Not just final state, but how we got there
- **Run fast**: No actual rendering, works with NullEngine
- **Provide precision**: Exact validation of all parameters
- **Enable debugging**: Complete operation history available

## Architecture

### Core Components

#### 1. Tracking Mocks

```typescript
// Meshes that record their configuration history
export class TrackingMockMesh {
  configurations: MeshConfiguration[] = [];
  
  setScaling(x: number, y: number, z: number) {
    this._record('setScaling', [x, y, z]);
    this.scaling.set(x, y, z);
  }
  
  // Returns complete configuration history
  getConfigurationHistory() {
    return this.configurations;
  }
}

// Textures that record drawing operations
export class TrackingMockTexture {
  drawingOperations: DrawingOperation[] = [];
  
  getContext() {
    return {
      strokeRect: (x, y, w, h) => {
        this.drawingOperations.push({
          type: 'strokeRect',
          x, y, w, h,
          strokeStyle: this.strokeStyle,
          lineWidth: this.lineWidth
        });
      }
      // ... other canvas methods
    };
  }
}
```

#### 2. Property Discovery System

Automatically discovers all style properties that affect mesh generation:

```typescript
export class StylePropertyDiscovery {
  // Parse schemas to find all properties
  static discoverFromSchema(schema: ZodSchema): PropertyMap {
    // Extract all properties and their types
  }
  
  // Analyze code to find property usage
  static discoverFromCode(sourceFiles: string[]): PropertyMap {
    // Find all style.get() calls
    // Find all mesh creation patterns
    // Map properties to mesh effects
  }
  
  // Generate test matrix
  static generateTestMatrix(): TestMatrix {
    return {
      node: {
        shape: ['sphere', 'box', 'cylinder', ...],
        color: ['#hex', 'rgb()', 'rgba()', 'named', ...],
        size: [0.1, 1, 10, 100, ...],
        opacity: [0, 0.5, 1, ...],
        // ... all discovered properties
      },
      edge: {
        width: [1, [1,2,1], ...],
        dash: [null, [5,5], [10,2,2,2], ...],
        // ... all edge properties
      },
      label: {
        text: ['', 'Label', '🎉', ...],
        borders: [[], [{width:2, color:'#f00'}], ...],
        // ... all label properties
      }
    };
  }
}
```

#### 3. Golden Master Tests

A small set of hand-crafted test cases that cover critical rendering scenarios:

```typescript
export const GOLDEN_MASTERS = {
  node: [
    // Basic shapes with simple styling (27 tests)
    { name: 'sphere_red', style: { shape: 'sphere', color: '#ff0000', size: 10 } },
    { name: 'box_blue', style: { shape: 'box', color: '#0000ff', size: 5 } },
    { name: 'cylinder_green', style: { shape: 'cylinder', color: '#00ff00', size: 8 } },
    // ... all 27 shape types with basic colors
    
    // Material variations (15 tests)
    { name: 'sphere_gradient', style: { shape: 'sphere', color: { type: 'linear', colors: ['#ff0000', '#00ff00'] } } },
    { name: 'box_wireframe', style: { shape: 'box', wireframe: true, color: '#ffff00' } },
    { name: 'cylinder_transparent', style: { shape: 'cylinder', color: 'rgba(255,0,0,0.5)' } },
    // ... gradient, wireframe, transparency combinations
    
    // Effects combinations (10 tests)
    { name: 'sphere_glow', style: { shape: 'sphere', glow: { color: '#ff0000', strength: 2 } } },
    { name: 'box_outline', style: { shape: 'box', outline: { color: '#000000', width: 2 } } },
    // ... glow, outline, flat shading combinations
    
    // Size edge cases (5 tests)
    { name: 'sphere_tiny', style: { shape: 'sphere', size: 0.1 } },
    { name: 'sphere_huge', style: { shape: 'sphere', size: 100 } }
    // Total: ~57 node golden masters
  ],
  
  edge: [
    // Line type variations (7 tests)
    { name: 'solid_line', style: { width: 2, color: '#ff0000', type: 'solid' } },
    { name: 'dashed_line', style: { width: 3, color: '#00ff00', type: 'dash' } },
    { name: 'dotted_line', style: { width: 1, color: '#0000ff', type: 'dots' } },
    // ... all 7 line types
    
    // Arrow combinations (26 tests)
    { name: 'normal_arrow_source', style: { arrow: { source: { type: 'normal', size: 1.5 } } } },
    { name: 'diamond_arrow_target', style: { arrow: { target: { type: 'diamond', color: '#ff0000' } } } },
    // ... all 13 arrow types × 2 positions
    
    // Width and animation variations (10 tests)
    { name: 'thick_animated', style: { width: 10, animation: { speed: 2 } } },
    { name: 'variable_width', style: { width: [1, 5, 2, 8] } },
    // ... width and animation combinations
    
    // Complex combinations (5 tests)
    { name: 'full_featured', style: { 
      width: 3, type: 'dash', color: '#ff0000',
      arrow: { source: { type: 'dot' }, target: { type: 'normal' } },
      animation: { speed: 1.5 }
    }}
    // Total: ~48 edge golden masters
  ],
  
  label: [
    // Text content variations (10 tests)
    { name: 'simple_text', style: { text: 'Hello' } },
    { name: 'emoji_text', style: { text: '🎉 Celebration 🎊' } },
    { name: 'multiline_text', style: { text: 'Line 1\nLine 2\nLine 3' } },
    { name: 'empty_text', style: { text: '' } },
    // ... various text content and special characters
    
    // Font and styling variations (15 tests)
    { name: 'large_bold', style: { fontSize: 72, fontWeight: 'bold' } },
    { name: 'small_italic', style: { fontSize: 12, fontStyle: 'italic' } },
    { name: 'custom_font', style: { font: 'Arial', fontSize: 24 } },
    // ... font family, size, weight, style combinations
    
    // Background variations (15 tests)  
    { name: 'solid_background', style: { backgroundColor: '#ff0000' } },
    { name: 'gradient_background', style: { 
      backgroundGradient: { type: 'linear', colors: ['#ff0000', '#00ff00'] }
    }},
    { name: 'transparent_background', style: { backgroundColor: 'transparent' } },
    { name: 'rounded_corners', style: { backgroundColor: '#0000ff', cornerRadius: 10 } },
    // ... background color, gradient, padding, corner combinations
    
    // Border variations (20 tests)
    { name: 'single_border', style: { borders: [{ width: 2, color: '#ff0000' }] } },
    { name: 'double_border', style: { borders: [
      { width: 2, color: '#ff0000' },
      { width: 1, color: '#00ff00', spacing: 3 }
    ]}},
    { name: 'triple_border', style: { borders: [
      { width: 3, color: '#ff0000' },
      { width: 2, color: '#00ff00', spacing: 2 },
      { width: 1, color: '#0000ff', spacing: 1 }
    ]}},
    // ... single, double, triple, complex border combinations
    
    // Text effects variations (15 tests)
    { name: 'text_outline', style: { 
      textOutline: { width: 2, color: '#000000' }
    }},
    { name: 'text_shadow', style: { 
      textShadow: { color: 'rgba(0,0,0,0.5)', blur: 4, offsetX: 2, offsetY: 2 }
    }},
    { name: 'outline_and_shadow', style: {
      textOutline: { width: 1, color: '#ffffff' },
      textShadow: { color: 'rgba(0,0,0,0.8)', blur: 3 }
    }},
    // ... outline, shadow, combined effects
    
    // Speech bubble variations (10 tests)
    { name: 'bottom_pointer', style: { 
      pointer: { direction: 'bottom', width: 20, height: 15 }
    }},
    { name: 'curved_pointer', style: { 
      pointer: { direction: 'top', curve: true, offset: 0.3 }
    }},
    // ... pointer directions, curves, offsets
    
    // Badge variations (8 tests)
    { name: 'notification_badge', style: { 
      badge: { type: 'notification', count: 5 }
    }},
    { name: 'progress_badge', style: { 
      badge: { type: 'progress', progress: 0.75 }
    }},
    // ... different badge types and configurations
    
    // Animation variations (5 tests)
    { name: 'pulse_animation', style: { animation: { type: 'pulse', speed: 1.5 } } },
    { name: 'bounce_animation', style: { animation: { type: 'bounce', speed: 2 } } },
    // ... animation types and speeds
    
    // Complex combinations (5 tests)
    { name: 'kitchen_sink', style: {
      text: 'Complex Label',
      fontSize: 32,
      backgroundColor: '#333333',
      borders: [{ width: 2, color: '#ff0000' }],
      textOutline: { width: 1, color: '#ffffff' },
      pointer: { direction: 'bottom' },
      badge: { type: 'count', count: 3 }
    }}
    // Total: ~103 label golden masters
  ]
  
  // Grand total: ~208 golden masters across all types
};
```

#### 4. Property-Based Random Tests

~200 property-based tests (50 per element type) generate random combinations to find edge cases:

```typescript
export const propertyTests = {
  // Node property tests (50 tests)
  node: {
    // Test: Any valid node style produces a valid mesh
    'valid node styles create valid meshes': () => {
      fc.assert(
        fc.property(nodeStyleArbitrary, (style) => {
          const { mesh, material } = createNodeWithMocks(style);
          
          // Should not throw
          expect(mesh).toBeDefined();
          expect(material).toBeDefined();
          
          // Basic invariants
          expect(mesh.scaling.x).toBeGreaterThan(0);
          expect(mesh.scaling.y).toBeGreaterThan(0);
          expect(mesh.scaling.z).toBeGreaterThan(0);
        }),
        { numRuns: 500 }
      );
    },
    
    // Test: Shape property maps correctly  
    'shape property creates correct mesh type': () => {
      fc.assert(
        fc.property(
          fc.constantFrom('sphere', 'box', 'cylinder', 'cone'),
          (shape) => {
            const { mesh } = createNodeWithMocks({ shape });
            expect(mesh.metadata.meshType).toBe(shape);
          }
        ),
        { numRuns: 100 }
      );
    },
    
    // Test: Size scaling is consistent
    'size property affects all scaling dimensions equally': () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0.1, max: 100 }),
          (size) => {
            const { mesh } = createNodeWithMocks({ size });
            expect(mesh.scaling.x).toBeCloseTo(size);
            expect(mesh.scaling.y).toBeCloseTo(size);
            expect(mesh.scaling.z).toBeCloseTo(size);
          }
        ),
        { numRuns: 200 }
      );
    },
    
    // Test: Color transformations
    'color property maps to material correctly': () => {
      fc.assert(
        fc.property(colorArbitrary, (color) => {
          const { material } = createNodeWithMocks({ color });
          const expectedColor = parseColor(color);
          expect(material.diffuseColor).toEqual(expectedColor);
        }),
        { numRuns: 300 }
      );
    },
    
    // ... 46 more node property tests
  },
  
  // Edge property tests (50 tests)
  edge: {
    'valid edge styles create valid meshes': () => {
      fc.assert(
        fc.property(edgeStyleArbitrary, (style) => {
          const { mesh, line } = createEdgeWithMocks(style);
          expect(mesh).toBeDefined();
          expect(line).toBeDefined();
        }),
        { numRuns: 500 }
      );
    },
    
    'arrow types create correct arrow meshes': () => {
      fc.assert(
        fc.property(
          fc.constantFrom('normal', 'diamond', 'dot', 'tee'),
          (arrowType) => {
            const { arrowMesh } = createEdgeWithMocks({ 
              arrow: { target: { type: arrowType } }
            });
            expect(arrowMesh.metadata.arrowType).toBe(arrowType);
          }
        ),
        { numRuns: 200 }
      );
    },
    
    // ... 48 more edge property tests
  },
  
  // Label property tests (50 tests)  
  label: {
    'valid label styles create valid meshes': () => {
      fc.assert(
        fc.property(labelStyleArbitrary, (style) => {
          const { mesh, material, texture } = createLabelWithMocks(style);
          
          // Should not throw
          expect(mesh).toBeDefined();
          expect(material).toBeDefined();
          expect(texture).toBeDefined();
          
          // Basic invariants
          expect(mesh.billboardMode).toBe(7); // Labels always face camera
          expect(mesh.scaling.x).toBeGreaterThan(0);
        }),
        { numRuns: 500 }
      );
    },
  
    // Test: Border drawing operations
    'borders render correctly': () => {
      fc.assert(
        fc.property(
          fc.array(borderConfigArbitrary, { maxLength: 5 }),
          (borders) => {
            const { texture } = createLabelWithMocks({ borders });
            
            // Validate drawing operations
            const strokeOps = texture.drawingOperations
              .filter(op => op.type === 'strokeRect');
            
            expect(strokeOps).toHaveLength(borders.length);
            
            // Validate cumulative offsets
            let expectedOffset = 0;
            borders.forEach((border, i) => {
              expectedOffset += border.spacing || 0;
              
              expect(strokeOps[i].x).toBe(expectedOffset);
              expect(strokeOps[i].strokeStyle).toBe(border.color);
              expect(strokeOps[i].lineWidth).toBe(border.width);
              
              expectedOffset += border.width;
            });
          }
        ),
        { numRuns: 200 }
      );
    },
    
    // Test: Text content is preserved
    'text content is rendered correctly': () => {
      fc.assert(
        fc.property(
          fc.stringOf(fc.char(), { maxLength: 100 }),
          (text) => {
            const { texture } = createLabelWithMocks({ text });
            const textOps = texture.drawingOperations
              .filter(op => op.type === 'fillText');
            
            if (text.length > 0) {
              expect(textOps).toHaveLength(1);
              expect(textOps[0].text).toBe(text);
            }
          }
        ),
        { numRuns: 300 }
      );
    },
    
    // ... 47 more label property tests
  },
  
  // Arrowhead property tests (50 tests)
  arrowhead: {
    'valid arrow configurations create valid meshes': () => {
      fc.assert(
        fc.property(arrowConfigArbitrary, (config) => {
          const { mesh } = createArrowWithMocks(config);
          expect(mesh).toBeDefined();
          expect(mesh.metadata.arrowType).toBe(config.type);
        }),
        { numRuns: 500 }
      );
    },
    
    // ... 49 more arrowhead property tests
  }
  
  // Total: ~200 property-based tests across all types
};
```

### Test Environment: Babylon.js NullEngine

The tracking mocks work with NullEngine for:
- **No GPU overhead**: 10-100x faster than WebGL
- **Deterministic results**: No rendering variations
- **CI/CD compatibility**: Works in headless environments
- **Full API access**: All Babylon.js APIs available

### Validation Strategy

#### 1. Configuration Tracking
```typescript
// Validate mesh was configured correctly
const history = mesh.getConfigurationHistory();
expect(history).toContainEqual({
  method: 'setBillboardMode',
  args: [7],
  timestamp: expect.any(Number)
});
```

#### 2. Drawing Operation Validation
```typescript
// Validate canvas operations for labels
const analysis = texture.analyzeDrawingOperations();
expect(analysis.strokeColors).toContain('#ff0000');
expect(analysis.rectangles).toHaveLength(3); // 3 borders
```

#### 3. Property Transformation Testing
```typescript
// Validate style → mesh transformations
expect(material.diffuseColor).toEqual(parseColor(style.color));
expect(mesh.scaling).toEqual(new Vector3(style.size, style.size, style.size));
```

### Implementation Plan

1. **Create Tracking Mock Infrastructure**
   - TrackingMockMesh, TrackingMockMaterial, TrackingMockTexture
   - Operation recording and analysis utilities

2. **Implement Property Discovery**
   - Schema parser for style properties
   - Code analyzer for mesh creation patterns
   - Test matrix generator

3. **Define Golden Masters**
   - ~200 critical test cases across all element types
   - Cover comprehensive feature combinations and edge cases
   - Hand-validate expected values

4. **Setup Property-Based Tests**
   - ~50 property-based random tests per element type
   - Style arbitraries based on discovery
   - Invariant tests (no crashes, valid meshes)
   - Transformation tests (style → mesh mapping)
   - Relationship tests (size affects scaling, etc.)

5. **Create Test Helpers**
   - Mock setup/teardown utilities
   - Validation helpers
   - Analysis and reporting tools

### Benefits

1. **Fast Execution**: ~0.1ms per test vs 5000ms for visual tests
2. **Precise Validation**: Exact parameter checking, not fuzzy pixel matching
3. **Complete Coverage**: Property-based testing explores edge cases
4. **Easy Debugging**: Full operation history available
5. **Comprehensive**: ~200 golden masters + ~200 property tests for thorough coverage
6. **Extensible**: Easy to add new properties and validations

### Example Test Output

```
Comprehensive Mesh Test Results:
✓ Node golden masters: 57/57 passed
  - All 27 shape types validated
  - Material variations confirmed
  - Effect combinations working
✓ Edge golden masters: 48/48 passed  
  - Line type variations confirmed
  - Arrow combinations validated
  - Animation states working
✓ Label golden masters: 103/103 passed
  - Text content variations confirmed
  - Background styles validated
  - Border combinations working
  - Text effects confirmed
  - Speech bubble variations working
  - Badge configurations validated

✓ Property tests: 200/200 passed
  - Node: 50/50 property tests (25,000 random inputs)
  - Edge: 50/50 property tests (25,000 random inputs) 
  - Label: 50/50 property tests (25,000 random inputs)
  - Arrowhead: 50/50 property tests (25,000 random inputs)
  - Found 23 edge cases and validated fixes
  - Performance: All tests completed in 890ms

✓ Tracking mock validation:
  - 47,832 mesh configurations recorded
  - 23,156 drawing operations validated
  - 0 pixel-level comparisons needed

Coverage: 99.2% of style properties tested
Total test count: 408 tests
Total execution time: 890ms
```

This approach provides comprehensive mesh testing without the overhead and brittleness of visual testing, while maintaining high confidence in rendering correctness.