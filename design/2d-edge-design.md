# 2D Edge Rendering Design

## Problem Statement

Current edge rendering uses screen-space shaders and billboarding optimized for 3D perspective cameras. In 2D orthographic mode with a fixed camera:
1. Billboarding is unnecessary (camera never rotates)
2. Screen-space sizing conflicts with world-space zoom behavior
3. Shader complexity adds overhead for no benefit

**User Requirement:** In 2D mode, zooming should behave like zooming an image - everything scales proportionally together (world-space sizing, not constant pixel width).

## Current State

### 3D Mode (Perspective Camera)
- **Solid lines:** CustomLineRenderer - screen-space shader, constant pixel width
- **Patterned lines:** PatternedLineRenderer - billboarded meshes, uses FilledArrowRenderer shader
- **Arrows:** FilledArrowRenderer - billboarded meshes with shader

### 2D Mode (Orthographic Camera) - Current Issues
- Uses same renderers as 3D mode
- Unnecessary billboarding (camera is fixed looking down at XY plane)
- Scaling conflicts between screen-space and world-space
- Added orthoScale/zoomFactor code to compensate (complex, buggy)

## Solution: Material-Based Differentiation (Not Separate Renderers)

### Key Insight
The ONLY difference between 2D and 3D rendering is:
- **Material:** StandardMaterial (2D flat) vs ShaderMaterial (3D billboarding)
- **Orientation:** Pre-rotated to XY plane (2D) vs shader-dynamic (3D)

**All geometry can be reused 100%!**

### Design Principle
**2D mode:** Reuse existing geometry + StandardMaterial + XY plane rotation
**3D mode:** Reuse existing geometry + ShaderMaterial with billboarding

### Architecture

```
EdgeMesh.create() / createArrowHead()
    |
    ├─ Create geometry (same for both modes)
    |
    ├─ is2DMode?
    |   ├─ YES → MaterialHelper.apply2DMaterial()
    |   └─ NO  → MaterialHelper.apply3DMaterial()
```

## Implementation Components

### 1. MaterialHelper (New)

**Purpose:** Central utility for applying materials based on mode

**Implementation:**

```typescript
class MaterialHelper {
    /**
     * Apply 2D material: StandardMaterial + rotate to XY plane
     * Geometry created in XZ plane (billboarding convention) is rotated to XY plane
     */
    static apply2DMaterial(
        mesh: Mesh,
        color: string,
        opacity: number,
        scene: Scene
    ): void {
        // Create simple material
        const material = new StandardMaterial(`2d-${mesh.name}`, scene);
        material.diffuseColor = Color3.FromHexString(color);
        material.alpha = opacity;
        material.backFaceCulling = false; // Show both sides in 2D
        mesh.material = material;

        // Rotate from XZ plane (billboarding default) to XY plane (2D view)
        // Camera looks down -Z axis, so rotate 90° around X-axis
        mesh.rotation.x = Math.PI / 2;

        // Mark as 2D for reference
        mesh.metadata = mesh.metadata || {};
        mesh.metadata.is2D = true;
    }

    /**
     * Apply 3D material: ShaderMaterial with billboarding
     * Uses FilledArrowRenderer shader for camera-facing geometry
     */
    static apply3DMaterial(
        mesh: Mesh,
        options: FilledArrowOptions,
        scene: Scene
    ): void {
        FilledArrowRenderer.applyShader(mesh, options, scene);
    }
}
```

**File:** `src/meshes/MaterialHelper.ts`

### 2. Simple2DLineRenderer (New - Only for Solid Lines)

**Purpose:** Render solid lines in 2D mode (CustomLineRenderer uses screen-space shader, can't be reused)

**Implementation:**
- Creates flat rectangular mesh in XY plane
- 4 vertices forming a quad perpendicular to line direction
- World-space width
- Uses MaterialHelper.apply2DMaterial() for consistency

```typescript
class Simple2DLineRenderer {
    static create(
        start: Vector3,
        end: Vector3,
        width: number,
        color: string,
        opacity: number,
        scene: Scene
    ): Mesh {
        // 1. Calculate line direction in XY plane
        const direction = end.subtract(start);
        const length = direction.length();
        const normalized = direction.normalize();

        // 2. Calculate perpendicular in XY plane (2D rotation)
        const perpendicular = new Vector3(-normalized.y, normalized.x, 0);

        // 3. Create 4 vertices for rectangular quad
        const halfWidth = width / 2;
        const positions = [
            ...start.add(perpendicular.scale(halfWidth)).asArray(),
            ...start.subtract(perpendicular.scale(halfWidth)).asArray(),
            ...end.add(perpendicular.scale(halfWidth)).asArray(),
            ...end.subtract(perpendicular.scale(halfWidth)).asArray(),
        ];

        // 4. Create mesh with VertexData
        const vertexData = new VertexData();
        vertexData.positions = positions;
        vertexData.indices = [0, 1, 2, 2, 1, 3]; // Two triangles
        vertexData.normals = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]; // All pointing up

        const mesh = new Mesh("solid-line-2d", scene);
        vertexData.applyToMesh(mesh);

        // 5. Apply 2D material (no rotation needed, already in XY plane)
        const material = new StandardMaterial("2d-line", scene);
        material.diffuseColor = Color3.FromHexString(color);
        material.alpha = opacity;
        material.backFaceCulling = false;
        mesh.material = material;

        mesh.metadata = {is2D: true, is2DLine: true};

        return mesh;
    }

    /**
     * Update positions of existing 2D line mesh
     * Called by Edge.transformEdgeMesh()
     */
    static updatePositions(
        mesh: Mesh,
        start: Vector3,
        end: Vector3
    ): void {
        // Recalculate vertices and update mesh
        // (Same calculation as create, but update existing mesh)
    }
}
```

**File:** `src/meshes/Simple2DLineRenderer.ts`

**Note:** This is the ONLY new renderer class needed. Patterns and arrows reuse existing geometry!

### 3. Modify PatternedLineRenderer (Existing)

**Changes:** Add `is2DMode` parameter and use MaterialHelper

```typescript
// In PatternedLineRenderer.createPatternMesh()
static createPatternMesh(
    pattern: PatternType,
    width: number,
    color: string,
    opacity: number,
    scene: Scene,
    shapeType?: ShapeType,
    segmentLength?: number,
    is2DMode?: boolean, // NEW PARAMETER
): Mesh {
    // ... existing geometry creation (100% unchanged) ...
    const geometry = this.getGeometryForPattern(pattern);
    const mesh = new Mesh(meshName, scene);
    geometry.applyToMesh(mesh);

    // MODIFIED: Material application based on mode
    if (is2DMode) {
        MaterialHelper.apply2DMaterial(mesh, color, opacity, scene);
    } else {
        // Existing 3D path
        const geometryDiameter = this.getGeometryDiameter(pattern, shapeType);
        const size = width / geometryDiameter;
        FilledArrowRenderer.applyShader(mesh, {size, color, opacity}, scene);
        const material = mesh.material as ShaderMaterial;
        this.activeMaterials.add(material);
    }

    return mesh;
}
```

### 4. Modify FilledArrowRenderer (Existing)

**Changes:** Add helper method for 2D arrow creation

```typescript
// In FilledArrowRenderer
static create2DArrow(
    type: string,
    length: number,
    width: number,
    color: string,
    opacity: number,
    scene: Scene
): Mesh {
    // Reuse existing geometry creation (createNormal, createDiamond, etc.)
    const geometry = this.getGeometryForType(type, length, width);
    const mesh = new Mesh(`arrow-2d-${type}`, scene);
    geometry.applyToMesh(mesh);

    // Apply 2D material
    MaterialHelper.apply2DMaterial(mesh, color, opacity, scene);

    return mesh;
}
```

## Routing Logic

### Detection Function

```typescript
// In EdgeMesh.ts
private static is2DMode(scene: Scene, style?: EdgeStyleConfig): boolean {
    const camera = scene.activeCamera;
    if (!camera) return false;

    // Check if camera is orthographic AND graph is configured for 2D
    const isOrtho = camera.mode === Camera.ORTHOGRAPHIC_CAMERA;
    const is2DGraph = style?.graph?.twoD === true;

    return isOrtho && is2DGraph;
}
```

### EdgeMesh.create()

```typescript
static create(
    cache: MeshCache,
    options: EdgeMeshOptions,
    style: EdgeStyleConfig,
    scene: Scene,
): AbstractMesh | PatternedLineMesh {
    const lineType = style.line?.type ?? "solid";
    const is2D = this.is2DMode(scene, style);

    console.log("[EdgeMesh.create] Creating line:", {lineType, is2D});

    if (lineType === "solid") {
        // SOLID LINES: Different paths for 2D vs 3D
        if (is2D) {
            // 2D: Use Simple2DLineRenderer (world-space mesh)
            return Simple2DLineRenderer.create(
                new Vector3(0, 0, 0), // Placeholder
                new Vector3(0, 0, 1),
                options.width,
                options.color,
                style.line?.opacity ?? 1.0,
                scene,
            );
        } else {
            // 3D: Keep CustomLineRenderer (screen-space shader)
            const cacheKey = `edge-style-${options.styleId}`;
            return cache.get(cacheKey, () => {
                if (style.line?.animationSpeed) {
                    return this.createAnimatedLine(options, style, scene);
                }
                return this.createStaticLine(options, style, scene, cache);
            });
        }
    } else {
        // PATTERNED LINES: Reuse PatternedLineRenderer, just pass is2D flag
        return PatternedLineRenderer.create(
            lineType as PatternType,
            new Vector3(0, 0, 0),
            new Vector3(0, 0, 1),
            options.width / 40,
            options.color,
            style.line?.opacity ?? 1.0,
            scene,
            is2D, // NEW: Pass is2D mode flag
        );
    }
}
```

**Key Changes:**
- Solid lines: Still have 2D vs 3D split (can't reuse CustomLineRenderer geometry)
- Patterned lines: SAME code path, just pass `is2D` flag to PatternedLineRenderer

### EdgeMesh.createArrowHead()

```typescript
static createArrowHead(
    cache: MeshCache,
    styleId: string,
    options: ArrowHeadOptions,
    scene: Scene,
    style?: EdgeStyleConfig, // Need to pass style to detect 2D mode
): AbstractMesh | null {
    if (!options.type || options.type === "none") {
        return null;
    }

    const is2D = this.is2DMode(scene, style);
    const size = options.size ?? 1.0;
    const opacity = options.opacity ?? 1.0;
    const width = this.calculateArrowWidth() * size;
    const length = this.calculateArrowLength() * size;

    const FILLED_ARROWS = ["normal", "inverted", "diamond", "box", "dot",
                           "vee", "tee", "half-open", "crow",
                           "open-normal", "open-diamond", "open-dot"];
    const BILLBOARD_ARROWS = ["sphere-dot", "sphere"];

    if (FILLED_ARROWS.includes(options.type)) {
        // FILLED ARROWS: Reuse geometry, just apply different material
        if (is2D) {
            // 2D: Use MaterialHelper for flat StandardMaterial
            console.log("[EdgeMesh.createArrowHead] Using 2D material for type:", options.type);
            return FilledArrowRenderer.create2DArrow(
                options.type,
                length,
                width,
                options.color,
                opacity,
                scene,
            );
        } else {
            // 3D: Use existing billboarding shader
            return this.createFilledArrow(options.type, length, width, options.color, opacity, scene);
        }
    } else if (BILLBOARD_ARROWS.includes(options.type)) {
        // Sphere arrows work in both 2D and 3D
        // ... existing sphere arrow logic
        return null;
    }

    return null;
}
```

## Edge Position Updates

The Simple2D renderers create meshes at placeholder positions. Edge.transformEdgeMesh() needs to handle updating them:

```typescript
// In Edge.ts
transformEdgeMesh(srcPoint: Vector3, dstPoint: Vector3): void {
    if (this.mesh instanceof PatternedLineMesh) {
        // Pattern lines (both 2D and 3D): Update mesh positions
        this.mesh.update(srcPoint, dstPoint);
    } else if (this.mesh.metadata?.is2DLine) {
        // 2D solid line: Update vertices directly
        Simple2DLineRenderer.updatePositions(this.mesh, srcPoint, dstPoint);
    } else {
        // 3D solid line: Transform via position/rotation/scaling
        EdgeMesh.transformMesh(this.mesh, srcPoint, dstPoint);
    }
}
```

## Arrow Orientation

For 2D arrows, rotation is simpler (only Z-axis rotation):

```typescript
// In Edge.ts transformArrowCap()
if (this.arrowMesh) {
    this.arrowMesh.position = arrowPosition;

    if (this.arrowMesh.metadata?.is2D) {
        // 2D arrow: Simple Z-rotation to align with edge direction
        const direction = dstPoint.subtract(srcPoint);
        const angle = Math.atan2(direction.y, direction.x);
        this.arrowMesh.rotation.z = angle;
    } else {
        // 3D arrow: Use existing billboarding logic
        FilledArrowRenderer.setLineDirection(this.arrowMesh as Mesh, direction);
    }
}
```

## Width Defaults

### 2D Mode
```typescript
const DEFAULT_2D_LINE_WIDTH = 0.05; // world units, tune after testing
const DEFAULT_2D_ARROW_WIDTH = 0.1; // world units, tune after testing
```

### 3D Mode
Keep existing defaults (optimized for screen-space/billboarding).

## Code Deletion

### Remove Scaling Code
1. **CustomLineRenderer.ts** - Delete orthoScale calculation (lines 284-306)
2. **Edge.ts** - Delete zoomFactor calculations in transformArrowCap() (3 locations)
3. **Edge.ts** - Delete `_lastLoggedFrustum` property and debug logging

### Keep CustomLineRenderer
- Still used for 3D solid lines
- Remove only the orthoScale/2D-specific code
- Keep screen-space shader logic intact

## Testing Plan

### Unit Tests
1. Test MaterialHelper.apply2DMaterial() - verify StandardMaterial creation and XY rotation
2. Test MaterialHelper.apply3DMaterial() - verify ShaderMaterial application
3. Test Simple2DLineRenderer creates correct geometry
4. Test PatternedLineRenderer with is2DMode=true uses MaterialHelper
5. Test FilledArrowRenderer.create2DArrow() for each arrow type
6. Test is2DMode() detection logic

### Visual Tests
1. Create 2D story with solid lines - verify world-space zoom
2. Create 2D story with patterned lines - verify consistency with arrows
3. Create 2D story with various arrow types - verify all render correctly
4. Test switching between 2D and 3D modes - verify correct renderer used
5. Verify 3D mode still works with existing renderers

### Stories to Add
```typescript
// stories/EdgeStyles.stories.ts

export const TwoDSolidWorld: Story = {
    args: {
        styleTemplate: templateCreator({
            graph: {twoD: true},
            edgeStyle: {
                line: {color: "darkgrey"},
                arrowHead: {type: "normal", color: "darkgrey"},
            },
        }),
    },
};

export const TwoDPatternsWorld: Story = {
    args: {
        styleTemplate: templateCreator({
            graph: {twoD: true},
            edgeStyle: {
                line: {type: "diamond", color: "darkgrey"},
                arrowHead: {type: "diamond", color: "darkgrey"},
            },
        }),
    },
};
```

## Migration Notes

### Breaking Changes
- 2D mode behavior changes from constant pixel width to world-space zoom
- Default widths may appear different in 2D mode
- Users relying on specific 2D visual appearance may need to adjust widths

### Backwards Compatibility
- 3D mode behavior unchanged
- Existing stories/tests for 3D mode should pass without changes
- Only 2D mode behavior changes

## Implementation Order

1. **Create MaterialHelper.ts** - Central utility for applying 2D vs 3D materials, no dependencies
2. **Create Simple2DLineRenderer.ts** - Only new renderer needed (for solid lines)
3. **Modify PatternedLineRenderer.createPatternMesh()** - Add is2DMode parameter, use MaterialHelper
4. **Modify FilledArrowRenderer** - Add create2DArrow() static method
5. **Add is2DMode() detection** - In EdgeMesh.ts
6. **Update EdgeMesh.create() routing** - Route solid lines to Simple2DLineRenderer in 2D, pass is2DMode to PatternedLineRenderer
7. **Update EdgeMesh.createArrowHead() routing** - Call FilledArrowRenderer.create2DArrow() in 2D mode
8. **Update Edge.transformEdgeMesh()** - Handle Simple2DLineRenderer.updatePositions() for 2D solid lines
9. **Update Edge.transformArrowCap()** - Handle simple Z-rotation for 2D arrows (check metadata.is2D)
10. **Delete scaling code** - Remove orthoScale/zoomFactor from CustomLineRenderer and Edge
11. **Add stories** - Test 2D rendering (solid lines, patterns, arrows)
12. **Manual testing** - Verify world-space zoom behavior
13. **Adjust default widths** - Tune for visual appearance

## Success Criteria

1. ✅ 2D mode uses flat meshes without billboarding
2. ✅ Zooming in 2D scales everything proportionally (like zooming an image)
3. ✅ Lines and arrows maintain consistent relative size in 2D
4. ✅ 3D mode unchanged (existing tests pass)
5. ✅ No scaling bugs (programmatic validation with console.log)
6. ✅ Performance improvement in 2D (no shader overhead)

## Open Questions

1. Should Simple2DLineRenderer support line thickness variations (tapering)?
   - **Decision:** No, keep it simple. Constant width.

2. Should we support animated lines in 2D mode?
   - **Decision:** Defer to future. Start with static lines.

3. How to handle edge labels in 2D vs 3D?
   - **Decision:** Out of scope for this design. Labels work the same.

## References

- Current implementation: `src/meshes/CustomLineRenderer.ts`
- Patterned lines: `src/meshes/PatternedLineRenderer.ts`
- Arrow rendering: `src/meshes/FilledArrowRenderer.ts`
- Edge management: `src/Edge.ts`
