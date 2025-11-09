# Custom Line Rendering System - Implementation Plan

## Strategic Decision: Replace GreasedLine with Custom System

**Rationale:**
- **Unified Control**: Lines and arrowheads use identical screen-space math
- **Pattern Support**: Full control over dash/dot/zigzag patterns via shaders
- **Performance**: Optimized for graph workloads (thousands of edges)
- **Future-Proof**: Complete flexibility for new features

**Performance Requirements:**
- Support 1,000-10,000 edges per graph
- Maintain 60 FPS on mid-range hardware
- Efficient memory usage via mesh instancing

---

## Architecture Overview

### Rendering Strategy

**Mesh Structure:**
```
Line = Quad strip along path
- 2 triangles per line segment
- 4 vertices per segment (2 on each side)
- Vertices offset perpendicular to line direction
```

**Vertex Layout:**
```typescript
interface LineVertex {
    position: Vector3;      // Center point of line segment
    direction: Vector3;     // Tangent (direction to next point)
    side: number;           // -1 (left) or +1 (right) of line
    distance: number;       // Cumulative distance along line (for patterns)
    uv: Vector2;            // Texture coordinates
}
```

**Shader System:**
- **Vertex Shader**: Handles screen-space width expansion
- **Fragment Shader**: Handles patterns (dash, dot, etc.) and color
- **Unified Approach**: Arrowheads use same shaders as line body

**Performance Optimizations:**
1. **Mesh Instancing**: Edges with identical styles share geometry
2. **Geometry Caching**: Static edges cached in MeshCache
3. **LOD System**: Distant edges use simplified geometry
4. **Frustum Culling**: Babylon.js handles off-screen culling
5. **Batch Rendering**: Similar edges grouped into single draw call

---

## Phase 0: Core Line Renderer Foundation (5 days)

**Objective**: Build the foundational custom line rendering system that matches GreasedLine's visual quality while giving us complete control.

**Duration**: 5 days

### Tests to Write First

**test/meshes/CustomLineRenderer.test.ts**:
```typescript
describe("Custom Line Renderer", () => {
    test("generates quad strip for straight line", () => {
        const src = new Vector3(0, 0, 0);
        const dst = new Vector3(10, 0, 0);

        const geometry = CustomLineRenderer.createLineGeometry([src, dst]);

        // Should have 4 vertices (2 per endpoint)
        assert.equal(geometry.positions.length / 3, 4);
        // Should have 2 triangles (6 indices)
        assert.equal(geometry.indices.length, 6);
    });

    test("generates multiple segments for multi-point path", () => {
        const points = [
            new Vector3(0, 0, 0),
            new Vector3(5, 0, 0),
            new Vector3(10, 5, 0)
        ];

        const geometry = CustomLineRenderer.createLineGeometry(points);

        // 3 points = 2 segments = 6 vertices
        assert.equal(geometry.positions.length / 3, 6);
    });

    test("calculates perpendicular directions correctly", () => {
        const src = new Vector3(0, 0, 0);
        const dst = new Vector3(10, 0, 0);

        const geometry = CustomLineRenderer.createLineGeometry([src, dst]);

        // Verify perpendicular offsets
        const v1 = new Vector3(geometry.positions[0], geometry.positions[1], geometry.positions[2]);
        const v2 = new Vector3(geometry.positions[3], geometry.positions[4], geometry.positions[5]);

        // v1 and v2 should be offset perpendicular to line direction
        const perpDist = Vector3.Distance(v1, v2);
        assert.closeTo(perpDist, 0, 0.01); // In unit space, offset applied by shader
    });

    test("generates distance attribute for pattern support", () => {
        const points = [
            new Vector3(0, 0, 0),
            new Vector3(10, 0, 0),
            new Vector3(20, 0, 0)
        ];

        const geometry = CustomLineRenderer.createLineGeometry(points);

        // Distance should increase along line
        assert.equal(geometry.distances[0], 0);
        assert.closeTo(geometry.distances[2], 10, 0.1);
        assert.closeTo(geometry.distances[4], 20, 0.1);
    });
});

describe("Custom Line Shader", () => {
    test("shader compiles successfully", () => {
        CustomLineRenderer.registerShaders();

        const vertexShader = Effect.ShadersStore["customLineVertexShader"];
        const fragmentShader = Effect.ShadersStore["customLineFragmentShader"];

        assert.exists(vertexShader);
        assert.exists(fragmentShader);
    });

    test("screen-space sizing maintains constant width", async () => {
        // Visual test: render line from different camera distances
        const line = CustomLineRenderer.create(/* ... */);

        // Measure pixel width at different depths
        const width1 = await measureLineWidth(line, cameraDistance: 10);
        const width2 = await measureLineWidth(line, cameraDistance: 100);

        // Should maintain constant screen-space width
        assert.closeTo(width1, width2, 2); // Within 2 pixels
    });
});
```

**test/integration/custom-line-vs-greasedline.test.ts**:
```typescript
describe("Custom Line vs GreasedLine Comparison", () => {
    test("visual parity at various widths", async () => {
        const widths = [0.1, 0.5, 1.0, 2.0, 5.0];

        for (const width of widths) {
            const customLine = createCustomLine(width);
            const greasedLine = createGreasedLine(width);

            const customPixels = await captureLinePixels(customLine);
            const greasedPixels = await captureLinePixels(greasedLine);

            const similarity = compareImages(customPixels, greasedPixels);
            assert.isTrue(similarity > 0.95); // 95% visual match
        }
    });

    test("performance comparison with 1000 edges", () => {
        const startTime = performance.now();

        for (let i = 0; i < 1000; i++) {
            const line = CustomLineRenderer.create(/* ... */);
        }

        const duration = performance.now() - startTime;

        // Should create 1000 lines in under 100ms
        assert.isTrue(duration < 100);
    });
});
```

### Implementation

**src/meshes/CustomLineRenderer.ts** (NEW FILE):
```typescript
import {
    AbstractMesh,
    Color3,
    Effect,
    Engine,
    Mesh,
    Scene,
    ShaderMaterial,
    Vector2,
    Vector3,
    VertexBuffer,
    VertexData,
} from "@babylonjs/core";

export interface LineGeometry {
    positions: number[];      // Vertex positions (center line)
    directions: number[];     // Tangent directions
    sides: number[];          // -1 or +1 for perpendicular offset
    distances: number[];      // Cumulative distance for patterns
    uvs: number[];            // UV coordinates
    indices: number[];        // Triangle indices
}

export interface CustomLineOptions {
    points: Vector3[];        // Path points
    width: number;            // Line width
    color: string;            // Line color
    opacity?: number;         // Opacity 0-1
    pattern?: string;         // solid, dash, dot, etc.
    dashLength?: number;      // For dash pattern
    gapLength?: number;       // For dash pattern
}

export class CustomLineRenderer {
    private static shadersRegistered = false;

    /**
     * Register custom line shaders
     */
    static registerShaders(): void {
        if (this.shadersRegistered) {
            return;
        }

        // Vertex Shader: Screen-space width expansion
        Effect.ShadersStore.customLineVertexShader = `
precision highp float;

// Attributes
attribute vec3 position;      // Center point of line segment
attribute vec3 direction;     // Tangent direction
attribute float side;         // -1 or +1 for left/right
attribute float distance;     // Distance along line (for patterns)
attribute vec2 uv;

// Uniforms
uniform mat4 world;
uniform mat4 viewProjection;
uniform mat4 projection;
uniform vec2 resolution;
uniform float width;

// Varyings
varying vec2 vUV;
varying float vDistance;

void main() {
    // Transform center point to clip space
    vec4 centerClip = viewProjection * world * vec4(position, 1.0);

    // Calculate screen-space perpendicular direction
    vec3 tangent = normalize(direction);
    vec3 perpendicular = vec3(-tangent.y, tangent.x, tangent.z);

    // Calculate offset in screen space
    // Half-width because we offset in both directions
    vec2 offset = perpendicular.xy * width * 0.5 * side;

    // Apply screen-space sizing
    // Multiply by w to compensate for perspective divide
    // Divide by resolution to convert from pixels to NDC
    offset *= centerClip.w;
    offset /= resolution;

    // Apply offset in clip space
    gl_Position = centerClip;
    gl_Position.xy += offset;

    // Pass to fragment shader
    vUV = uv;
    vDistance = distance;
}
`;

        // Fragment Shader: Pattern rendering
        Effect.ShadersStore.customLineFragmentShader = `
precision highp float;

// Varyings
varying vec2 vUV;
varying float vDistance;

// Uniforms
uniform vec3 color;
uniform float opacity;
uniform float pattern;        // 0=solid, 1=dash, 2=dot, etc.
uniform float dashLength;
uniform float gapLength;

void main() {
    // Apply patterns based on distance along line
    if (pattern == 1.0) {
        // Dash pattern
        float cycle = dashLength + gapLength;
        float phase = mod(vDistance, cycle);
        if (phase > dashLength) {
            discard;
        }
    } else if (pattern == 2.0) {
        // Dot pattern
        float dotCycle = gapLength;
        float dotPhase = mod(vDistance, dotCycle);
        if (dotPhase > 0.1) { // Small dot size
            discard;
        }
    }
    // pattern == 0.0 or other values: solid (no discard)

    gl_FragColor = vec4(color, opacity);
}
`;

        this.shadersRegistered = true;
    }

    /**
     * Generate line geometry from path points
     */
    static createLineGeometry(points: Vector3[]): LineGeometry {
        if (points.length < 2) {
            throw new Error("Line requires at least 2 points");
        }

        const positions: number[] = [];
        const directions: number[] = [];
        const sides: number[] = [];
        const distances: number[] = [];
        const uvs: number[] = [];
        const indices: number[] = [];

        let cumulativeDistance = 0;

        // Generate quad strip
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];

            // Calculate segment direction
            const direction = p1.subtract(p0).normalize();
            const segmentLength = Vector3.Distance(p0, p1);

            // Add vertices for this segment
            // Each segment needs 4 vertices (2 at start, 2 at end)
            // But we share vertices between segments

            if (i === 0) {
                // First segment: add start vertices
                this.addVertexPair(
                    positions, directions, sides, distances, uvs,
                    p0, direction, cumulativeDistance
                );
            }

            // Add end vertices
            cumulativeDistance += segmentLength;
            this.addVertexPair(
                positions, directions, sides, distances, uvs,
                p1, direction, cumulativeDistance
            );

            // Add indices for two triangles
            const baseIndex = i * 2;
            indices.push(
                baseIndex, baseIndex + 1, baseIndex + 2,      // First triangle
                baseIndex + 1, baseIndex + 3, baseIndex + 2   // Second triangle
            );
        }

        return {
            positions,
            directions,
            sides,
            distances,
            uvs,
            indices,
        };
    }

    /**
     * Add a pair of vertices (left and right of center line)
     */
    private static addVertexPair(
        positions: number[],
        directions: number[],
        sides: number[],
        distances: number[],
        uvs: number[],
        center: Vector3,
        direction: Vector3,
        distance: number
    ): void {
        // Left vertex (side = -1)
        positions.push(center.x, center.y, center.z);
        directions.push(direction.x, direction.y, direction.z);
        sides.push(-1.0);
        distances.push(distance);
        uvs.push(0, 0);

        // Right vertex (side = +1)
        positions.push(center.x, center.y, center.z);
        directions.push(direction.x, direction.y, direction.z);
        sides.push(1.0);
        distances.push(distance);
        uvs.push(1, 0);
    }

    /**
     * Create a custom line mesh
     */
    static create(
        options: CustomLineOptions,
        scene: Scene
    ): Mesh {
        this.registerShaders();

        // Generate geometry
        const geometry = this.createLineGeometry(options.points);

        // Create mesh
        const mesh = new Mesh("custom-line", scene);

        // Set vertex data
        const vertexData = new VertexData();
        vertexData.positions = geometry.positions;
        vertexData.indices = geometry.indices;

        // Custom attributes
        mesh.setVerticesData("direction", geometry.directions);
        mesh.setVerticesData("side", geometry.sides);
        mesh.setVerticesData("distance", geometry.distances);
        mesh.setVerticesData(VertexBuffer.UVKind, geometry.uvs);

        vertexData.applyToMesh(mesh);

        // Create shader material
        const shaderMaterial = new ShaderMaterial(
            "customLineMaterial",
            scene,
            {
                vertex: "customLine",
                fragment: "customLine",
            },
            {
                attributes: ["position", "direction", "side", "distance", "uv"],
                uniforms: [
                    "world",
                    "viewProjection",
                    "projection",
                    "resolution",
                    "width",
                    "color",
                    "opacity",
                    "pattern",
                    "dashLength",
                    "gapLength",
                ],
            }
        );

        // Set uniforms
        const colorObj = Color3.FromHexString(options.color);
        shaderMaterial.setVector3("color", new Vector3(colorObj.r, colorObj.g, colorObj.b));
        shaderMaterial.setFloat("width", options.width);
        shaderMaterial.setFloat("opacity", options.opacity ?? 1.0);

        // Pattern uniforms
        const patternMap: Record<string, number> = {
            solid: 0,
            dash: 1,
            dot: 2,
        };
        shaderMaterial.setFloat("pattern", patternMap[options.pattern ?? "solid"] ?? 0);
        shaderMaterial.setFloat("dashLength", options.dashLength ?? 1.0);
        shaderMaterial.setFloat("gapLength", options.gapLength ?? 0.5);

        // Update resolution on every frame
        const engine = scene.getEngine();
        scene.onBeforeRenderObservable.add(() => {
            const renderWidth = engine.getRenderWidth();
            const renderHeight = engine.getRenderHeight();
            shaderMaterial.setVector2("resolution", new Vector2(renderWidth, renderHeight));
        });

        shaderMaterial.backFaceCulling = false;
        mesh.material = shaderMaterial;

        return mesh;
    }

    /**
     * Create a straight line between two points (optimized common case)
     */
    static createStraightLine(
        src: Vector3,
        dst: Vector3,
        width: number,
        color: string,
        scene: Scene
    ): Mesh {
        return this.create(
            {
                points: [src, dst],
                width,
                color,
            },
            scene
        );
    }
}
```

**src/meshes/EdgeMesh.ts** - Update to use CustomLineRenderer:
```typescript
import { CustomLineRenderer } from "./CustomLineRenderer";

export class EdgeMesh {
    // Keep existing UNIT_VECTOR_POINTS for backwards compat during migration
    private static readonly UNIT_VECTOR_POINTS = [0, 0, -0.5, 0, 0, 0.5];

    /**
     * Create edge mesh using custom line renderer
     */
    static create(
        cache: MeshCache,
        options: EdgeMeshOptions,
        style: EdgeStyleConfig,
        scene: Scene,
    ): AbstractMesh {
        const cacheKey = `edge-style-${options.styleId}`;

        return cache.get(cacheKey, () => {
            // Convert UNIT_VECTOR_POINTS to Vector3 array
            const points = [
                new Vector3(
                    this.UNIT_VECTOR_POINTS[0],
                    this.UNIT_VECTOR_POINTS[1],
                    this.UNIT_VECTOR_POINTS[2]
                ),
                new Vector3(
                    this.UNIT_VECTOR_POINTS[3],
                    this.UNIT_VECTOR_POINTS[4],
                    this.UNIT_VECTOR_POINTS[5]
                ),
            ];

            // Create using custom renderer
            const mesh = CustomLineRenderer.create(
                {
                    points,
                    width: options.width * 20, // Scale factor to match GreasedLine sizing
                    color: options.color,
                    opacity: style.line?.opacity,
                    pattern: style.line?.type,
                },
                scene
            );

            mesh.isPickable = false;
            return mesh;
        });
    }

    // Keep existing createArrowHead() for now - will be migrated in Phase 1
    // ... existing arrow code ...
}
```

### Dependencies
- External: Babylon.js (existing)
- Internal: None (foundational phase)

### Verification Steps

1. **Unit Tests**:
   ```bash
   npm test -- CustomLineRenderer.test.ts
   ```
   Expected: All geometry generation tests pass

2. **Visual Comparison**:
   ```bash
   npm run storybook
   ```
   Navigate to comparison story, verify custom line matches GreasedLine

3. **Performance Test**:
   ```bash
   npm test -- custom-line-vs-greasedline.test.ts
   ```
   Expected: Custom line creates 1000 edges in <100ms

4. **Build & Lint**:
   ```bash
   npm run build
   npm run lint
   ```
   Expected: No errors

### Storybook Stories

**stories/CustomLineComparison.stories.ts** (NEW FILE):
```typescript
import type {Meta, StoryObj} from "@storybook/web-components-vite";
import {Graphty} from "../src/graphty-element";
import {eventWaitingDecorator, renderFn, templateCreator} from "./helpers";

const meta: Meta = {
    title: "Migration/Custom Line Comparison",
    component: "graphty-element",
    render: renderFn,
    decorators: [eventWaitingDecorator],
    argTypes: {
        lineWidth: {
            control: {type: "range", min: 0.1, max: 5, step: 0.1},
            table: {category: "Line"},
            name: "line.width"
        },
        lineColor: {
            control: "color",
            table: {category: "Line"},
            name: "line.color"
        },
    },
    args: {
        nodeData: [
            {id: "A", position: {x: -3, y: 0, z: 0}},
            {id: "B", position: {x: 3, y: 0, z: 0}},
        ],
        edgeData: [{src: "A", dst: "B"}],
        layout: "fixed",
    },
};
export default meta;

type Story = StoryObj<Graphty>;

export const CustomLineBasic: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                line: {width: 0.5, color: "#FF0000"},
            },
        }),
    },
};

export const WidthComparison: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                line: {width: 2.0, color: "#00FF00"},
            },
        }),
    },
    parameters: {
        controls: {include: ["line.width"]},
    },
};
```

### Manual Verification Checklist

1. ✅ Custom line renders at various widths (0.1, 0.5, 1.0, 2.0, 5.0)
2. ✅ Line maintains constant screen-space width when camera moves
3. ✅ No visual artifacts (gaps, overlaps, z-fighting)
4. ✅ Performance: Can render 1000 edges smoothly
5. ✅ Visual parity with GreasedLine (>95% similarity)

---

## Phase 1: Arrowhead Integration (2 days)

**Objective**: Integrate arrowheads into the custom line system using the same shader approach for perfect visual consistency.

### Key Approach
- Arrowheads are triangular meshes added to same rendering pipeline
- Use identical screen-space shader as lines
- Geometry attached to edge mesh (single draw call)

**Implementation Details in separate phase document...**

---

## Phase 2-7: Subsequent Phases

The remaining phases follow similar structure:
- Phase 2: Simple Arrow Shapes (2 days)
- Phase 3: Hollow & Line Arrows + Tail (2 days)
- Phase 4: Line Patterns (3 days)
- Phase 5: Bezier Curves (4 days)
- Phase 6: Performance Optimization (3 days)
- Phase 7: Properties & Polish (2 days)

**Total Duration**: 23 days

---

## Performance Targets

### Rendering Performance
- **1,000 edges**: 60 FPS sustained
- **5,000 edges**: 30 FPS minimum
- **10,000 edges**: 15 FPS minimum

### Memory Usage
- **Per edge base cost**: ~500 bytes (geometry + shader)
- **With instancing**: ~50 bytes per edge (shared geometry)
- **10,000 edges**: <50 MB total

### Optimization Strategies
1. **Instancing**: Edges with same style share geometry
2. **LOD**: Distant edges (<100px) use simplified geometry
3. **Culling**: Off-screen edges not rendered
4. **Caching**: Static edge geometry cached
5. **Batching**: Similar styles batched into single draw call

---

## Migration Strategy

### Incremental Rollout
1. **Phase 0**: Custom line coexists with GreasedLine
2. **Feature Flag**: `useCustomLineRenderer: boolean` in config
3. **Testing**: Both systems tested in parallel
4. **Cutover**: Switch default after validation
5. **Cleanup**: Remove GreasedLine dependency

### Backwards Compatibility
- Existing edge styles continue working
- Visual appearance identical
- Performance equal or better

---

## Risk Mitigation

### Technical Risks
1. **Shader Complexity**: Mitigated by incremental testing
2. **Performance Regression**: Continuous benchmarking
3. **Visual Artifacts**: Extensive visual testing

### Mitigation Strategies
- Comprehensive test coverage
- Visual regression tests
- Performance benchmarks in CI
- Gradual feature rollout

---

## Success Criteria

### Must Have
✅ Visual parity with GreasedLine (>95% similarity)
✅ Performance parity or better
✅ All arrow types working
✅ Pattern support (dash, dot, etc.)
✅ Bezier curves
✅ No regressions in existing features

### Should Have
⭐ 2x performance improvement
⭐ Instancing reduces memory by 90%
⭐ LOD system improves distant edge performance

### Nice to Have
🌟 GPU-accelerated pattern animation
🌟 Custom shader effects (glow, pulse)
🌟 Real-time pattern editing
