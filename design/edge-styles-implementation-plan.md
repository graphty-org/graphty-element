# Implementation Plan for Complete Edge Style System

## Overview

This plan implements the complete EdgeStyle configuration schema for graphty-element, adding 12 arrow types, 6 line patterns, arrow/line properties (size, color, opacity), bezier curves, tooltips, and optional glow effects. The implementation is broken into 8 focused phases that build incrementally, each delivering user-verifiable functionality.

**Total Scope**:
- CustomLineRenderer (quad-strip mesh with screen-space shaders) - ✅ **COMPLETED**
- 12 new arrow types
- 4 arrow properties (size, color, opacity, text)
- Arrow tail support (bidirectional arrows)
- 6 line patterns (dash, dot, sinewave, zigzag, etc.) - **3/6 completed in CustomLineRenderer**
- 2 line properties (opacity, bezier curves)
- Edge tooltips
- Optional glow effects

**Estimated Duration**: 16-21.5 days (includes Phase 1 enhancements: cylindrical billboarding + perspective tapering; excludes optional glow effects)

**Key Architectural Decision**: We have replaced GreasedLine with CustomLineRenderer, a custom line rendering system using quad-strip geometry and screen-space shaders. This provides:
- Complete control over line rendering and patterns
- Built-in pattern support via fragment shader (solid, dash, dot)
- Screen-space width consistency across all camera angles
- Native support for mesh instancing and caching
- Foundation for bezier curves via multi-segment geometry

## Core Requirements

The edge rendering system must satisfy these critical requirements:

1. **✅ High Performance** - Handle thousands of edges efficiently
   - Mesh instancing and caching
   - Batched rendering
   - GPU-accelerated shaders

2. **✅ No-Gap Guarantee** - Perfect alignment between lines and arrow heads at any viewing angle
   - Identical screen-space formulas in both shaders
   - Position arrows at exact line endpoints
   - **Current status**: Guaranteed via matching `* w / resolution` formula

3. **✅ Arbitrary Shapes** - Support both solid and outline arrows of any shape
   - Solid: `normal`, `inverted`, `diamond`, `box`, `dot` (FilledArrowRenderer)
   - Outline: `empty`, `open-diamond`, `tee`, `vee`, `open`, `half-open`, `crow` (CustomLineRenderer)

4. **✅ Line Patterns** - Multiple line rendering styles
   - Implemented: `solid`, `dash`, `dot` (Phase 0)
   - Planned: `dash-dot`, `equal-dash`, `sinewave`, `zigzag` (Phase 4)
   - Future: `bezier` curves (Phase 5)

5. **⚠️ Tangent Billboarding** - Arrows rotate around line axis to always show face to camera
   - **Current status**: Y-axis cylindrical billboarding (works only for horizontal lines)
   - **Required**: Tangent billboarding for all arrow types
   - **Implementation**: Align arrow with line direction, rotate around line axis to face camera
   - **Key constraint**: Arrow base must remain fixed at sphere surface (no gaps)
   - **Visual requirements**:
     - Tip points toward sphere intercept (along line direction)
     - Visible from ANY camera angle (never edge-on/invisible)
     - Base connects seamlessly to line (zero gap)
     - Tapers with distance (perspective sizing)
   - **Priority**: Phase 1 enhancement (see "Remaining Work" section)

6. **✅ Perspective Tapering** - Lines and arrows taper naturally with distance from camera
   - **Status**: IMPLEMENTED (2025-11-09)
   - **Implementation**: Removed `* w` compensation from both FilledArrowRenderer and CustomLineRenderer
   - **Alignment guarantee**: Maintained because both shaders apply same transformation
   - **Result**: Objects appear smaller when farther from camera (natural perspective)

**Status Summary**:
- ✅ Requirements 1-4, 6: Fully implemented
- ⚠️ Requirement 5: Tangent billboarding in progress (Y-axis approach implemented, needs upgrade to line-axis rotation)

## Phase Breakdown

### Phase 0: CustomLineRenderer Foundation ✅ **COMPLETED**

**Objective**: Replace GreasedLine with a custom line rendering system that gives complete control over rendering, patterns, and future arrow integration.

**Duration**: 3 days (completed)

**What Was Implemented**:

1. **Custom Geometry Generation** (`src/meshes/CustomLineRenderer.ts:179-233`)
   - Quad-strip mesh: 4 vertices per segment (2 at start, 2 at end)
   - Custom vertex attributes: `position`, `direction`, `side`, `distance`, `uv`
   - Proper bounding box calculation from actual vertex positions

2. **Screen-Space Vertex Shader** (`src/meshes/CustomLineRenderer.ts:64-125`)
   - Screen-space width expansion using `offset *= w / resolution` formula
   - Full instancing support via BabylonJS `#include<instancesVertex>`
   - Direction-based perpendicular calculation for consistent width

3. **Pattern Fragment Shader** (`src/meshes/CustomLineRenderer.ts:128-163`)
   - Pattern types: solid (0), dash (1), dot (2)
   - Distance-based pattern rendering using discard
   - Configurable dash/gap lengths

4. **Integration** (`src/meshes/EdgeMesh.ts:305-331`)
   - Feature flag: `USE_CUSTOM_RENDERER = true`
   - Integrated into EdgeMesh.createStaticLine()
   - Width scaling factor to match GreasedLine appearance

5. **Property-Based Testing** (`test/CustomLineRenderer.test.ts`)
   - 19 comprehensive tests using fast-check library
   - Tests validate geometry invariants, vertex counts, direction vectors
   - All tests passing with NaN/Infinity filtering

**Key Technical Achievements**:
- ✅ Fixed shader instancing support (required `finalWorld` matrix)
- ✅ Fixed bounding box culling (use actual vertex positions)
- ✅ Screen-space width rendering working correctly
- ✅ Pattern rendering via fragment shader discard
- ✅ Property-based tests validating geometry generation

**Impact on Future Phases**:
- Phase 1: Line opacity already implemented in shader; **Arrow heads MUST use CustomLineRenderer shader for perfect alignment**
- Phase 4: Solid, dash, dot patterns already implemented (3/6 patterns complete)
- Phase 5: Bezier curves will use CustomLineRenderer.createLineGeometry() with multi-point paths
- Phases 2-3: **Arrow heads will use CustomLineRenderer geometry generators feeding into same shader as lines** (see `design/custom-line-design.md`)

### Phase 1: Arrow Head Integration with CustomLineRenderer (2-3 days)

**⚠️ PARTIALLY COMPLETED (2025-11-09)** - Core architecture implemented, enhancements in progress.

**Objective**: Integrate arrow heads into CustomLineRenderer shader system to achieve perfect alignment with lines. **This is the critical solution to all our arrow head alignment problems** - by using the same shader for both lines and arrows, we guarantee identical screen-space math and perfect alignment at all camera angles.

**Duration**: 2-3 days (base implementation: 2 days ✅, enhancements: 1 day ⚠️)

**Status**:
- ✅ Two-shader architecture (FilledArrowRenderer + CustomLineRenderer)
- ✅ Filled arrows (normal, inverted, diamond, box, dot)
- ✅ Arrow positioning and alignment
- ⚠️ Cylindrical billboarding (planned - see "Remaining Work")
- ⚠️ Perspective tapering (planned - see "Remaining Work")

---

## ✅ Phase 1 Base Implementation Notes (COMPLETED)

**Note**: This section documents the completed base implementation. For pending enhancements (cylindrical billboarding, perspective tapering), see the "Remaining Work" section below.

**Architectural Pivot**: After detailed analysis in `design/custom-line-design.md`, we discovered that CustomLineRenderer's perpendicular expansion shader is NOT suitable for filled arrows. Instead, we implemented a **TWO-SHADER ARCHITECTURE**:

### Actual Implementation

**Two Renderers, Two Shaders**:

1. **FilledArrowRenderer** (`src/meshes/FilledArrowRenderer.ts`) - NEW
   - **Shader**: Uniform scaling shader with screen-space billboarding
   - **Formula**: `position.xy * size * pixelToClip * centerClip.w`
   - **Geometry**: Standard polygon meshes (triangles, not quad-strips)
   - **Arrows**: `normal`, `inverted`, `diamond`, `box`, `dot`
   - **Key Feature**: Extracts only position from mesh transform, ignores rotation → perfect billboarding

2. **CustomLineRenderer** (`src/meshes/CustomLineRenderer.ts`) - EXISTING
   - **Shader**: Perpendicular expansion shader (unchanged)
   - **Formula**: `offset * vertexClip.w / resolution` (existing)
   - **Geometry**: Quad-strip line meshes
   - **Arrows**: `empty`, `open-diamond`, `tee`, `vee`, `open`, `half-open`, `crow`
   - **Key Feature**: Works perfectly for outline arrows that need perpendicular expansion

### Files Changed

1. ✅ `src/meshes/FilledArrowRenderer.ts` - NEW FILE (318 lines)
   - `registerShaders()` - Registers billboard vertex + fragment shaders
   - `createTriangle(inverted, scene)` - XY plane triangle pointing +X
   - `createDiamond(scene)` - XY plane diamond
   - `createBox(scene)` - XY plane rectangle
   - `createCircle(scene, segments=32)` - XY plane circle
   - `applyShader(mesh, options, scene)` - Applies uniform scaling shader

2. ✅ `src/meshes/EdgeMesh.ts` - UPDATED
   - `createFilledArrow()` - Routes to FilledArrowRenderer (lines 287-327)
   - `createOutlineArrow()` - Routes to CustomLineRenderer (lines 329-376)
   - Updated imports to include `FilledArrowRenderer` and `VertexData`

3. ✅ `design/custom-line-design.md` - UPDATED
   - Documented the two-shader architecture rationale
   - Explained why perpendicular expansion doesn't work for filled shapes
   - Described the uniform scaling approach for filled arrows

### Testing

✅ **Visual Testing** (2025-11-09):
- Captured screenshots from 5 camera angles (start, left, top, top-left-1, top-left-2)
- Confirmed arrows billboard correctly from all angles
- Confirmed no duplicate arrows or positioning issues
- Arrow positioning: Base at line end, tip at sphere surface ✓
- Arrow orientation: Always faces camera ✓

**Test Files**:
- Screenshots: `tmp/screenshot-{angle}-2025-11-09_16-13-00.png`
- Test script: `test/helpers/capture-3d-debug-screenshots.ts`

### Why This Architecture?

**Problem with Single-Shader Approach** (original plan):
- CustomLineRenderer uses perpendicular expansion (`offset = perpendicular * width * 0.5 * side`)
- This causes filled triangles to have one thick vertex and one thin vertex → distortion
- See `design/custom-line-design.md` sections 3.1-3.3 for detailed analysis

**Solution with Two-Shader Approach**:
- Filled arrows: Uniform scaling (all vertices scaled equally) → perfect shapes
- Outline arrows: Perpendicular expansion (creates line thickness) → perfect outlines
- Both use same screen-space sizing formula → consistent appearance
- Both extract position correctly → no alignment issues

### Remaining Work

This phase focused on the **architecture and shader implementation**. The following enhancements are required to complete Phase 1:

#### Phase 1 Enhancements (Priority)

**1. Tangent Billboarding** ✅ **COMPLETED (2025-11-09)**

**Status**: WORKING - Arrows visible from all camera angles using tangent billboarding

**Implementation**: Tangent billboarding vertex shader in FilledArrowRenderer with per-instance line direction.

**Core Requirements** (All ✅):
1. ✅ Arrow tip points along line direction (toward sphere intercept)
2. ✅ Arrow rotates around line axis to face camera
3. ✅ Arrow visible from ANY camera angle (never edge-on)
4. ✅ Arrow base stays fixed at sphere surface (zero gap with line)

---

### CRITICAL LESSON LEARNED: Geometry Plane Requirements

**THE PROBLEM THAT TOOK HOURS TO DEBUG:**

Arrows were **completely invisible** from all angles despite shader compiling successfully and all data flowing correctly. The issue was **geometry plane choice**.

**Root Cause Analysis**:

The FilledArrowRenderer shader uses tangent billboarding with this coordinate system mapping:

```glsl
// Shader coordinate mapping (FilledArrowRenderer.ts lines 93-102)
vec3 forward = normalize(lineDirection);              // Arrow points along line
vec3 toCamera = normalize(cameraPosition - worldCenter);
vec3 right = normalize(cross(forward, toCamera));     // Perpendicular to line AND camera
vec3 up = cross(right, forward);                      // Faces camera

// Transform arrow vertex from local space to world space
vec3 worldOffset = position.x * forward + position.y * up + position.z * right;
```

**Coordinate System Mapping**:
- **Local X → World forward** (line direction, arrow points this way)
- **Local Y → World up** (toward camera, for billboard facing)
- **Local Z → World right** (perpendicular to both)

**Why XY Plane Failed** ❌:
```
Triangle in XY plane:
  Tip: (0, 0, 0)
  Bottom: (-1, -0.4, 0)
  Top: (-1, 0.4, 0)

Face normal: Points in ±Z direction

After shader mapping:
  ±Z normal → "right" direction (perpendicular to camera view)

Result: Arrow is EDGE-ON to camera → INVISIBLE
```

**Why XZ Plane Works** ✅:
```
Triangle in XZ plane:
  Tip: (0, 0, 0)
  Bottom: (-1, 0, -0.4)
  Top: (-1, 0, 0.4)

Face normal: Points in ±Y direction

After shader mapping:
  ±Y normal → "up" direction (toward camera)

Result: Arrow FACES camera → VISIBLE
```

**THE FIX** (FilledArrowRenderer.ts):

```typescript
// Triangle arrow - WRONG (XY plane):
const positions = [
    tip, 0, 0,              // Tip at origin
    base, -width/2, 0,      // Bottom corner (at base)
    base, width/2, 0,       // Top corner (at base)
];

// Triangle arrow - CORRECT (XZ plane):
const positions = [
    tip, 0, 0,              // Tip at origin
    base, 0, -width/2,      // Bottom corner (at base)
    base, 0, width/2,       // Top corner (at base)
];

// Diamond arrow - WRONG (XY plane):
const positions = [
    0, 0, 0,                // Front tip at origin
    -length/2, width/2, 0,  // Top (at middle)
    -length, 0, 0,          // Back tip
    -length/2, -width/2, 0, // Bottom (at middle)
];

// Diamond arrow - CORRECT (XZ plane):
const positions = [
    0, 0, 0,                // Front tip at origin
    -length/2, 0, width/2,  // Top (at middle)
    -length, 0, 0,          // Back tip
    -length/2, 0, -width/2, // Bottom (at middle)
];

// Box arrow - WRONG (XY plane):
const positions = [
    -length, halfWidth, 0,   // Top-left (back)
    0, halfWidth, 0,         // Top-right at origin (front)
    0, -halfWidth, 0,        // Bottom-right at origin (front)
    -length, -halfWidth, 0,  // Bottom-left (back)
];

// Box arrow - CORRECT (XZ plane):
const positions = [
    -length, 0, halfWidth,   // Top-left (back)
    0, 0, halfWidth,         // Top-right at origin (front)
    0, 0, -halfWidth,        // Bottom-right at origin (front)
    -length, 0, -halfWidth,  // Bottom-left (back)
];
```

**Circle Arrow Exception** (Already Correct):

Circle geometry is ALREADY in the YZ plane (perpendicular to line direction), which is correct:

```typescript
// Circle - CORRECT (YZ plane, X=0):
for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    positions.push(
        0,                         // X = 0 (no extent along line)
        Math.cos(angle) * radius,  // Y → up (toward camera)
        Math.sin(angle) * radius   // Z → right (perpendicular)
    );
}
```

Circle works because its face is perpendicular to the line direction (X axis), so it naturally faces the camera.

---

### RULE FOR FUTURE ARROW TYPES

**CRITICAL GEOMETRY RULE**:

For tangent billboarding in FilledArrowRenderer:
- **Filled polygons (triangle, diamond, box)**: MUST use **XZ plane (Y=0)**
- **Circles/discs**: Use **YZ plane (X=0)** (perpendicular to line)
- **General rule**: Face normal must map to the shader's "up" vector (toward camera)

**How to verify geometry is correct**:
1. Arrow should be visible from ALL camera angles
2. Arrow should never appear edge-on (invisible)
3. Arrow face should always be oriented toward camera
4. Test by rotating camera around the graph

---

### Actual Shader Implementation

**Vertex Shader** (FilledArrowRenderer.ts lines 60-106):

```glsl
// Attributes
attribute vec3 position;      // Arrow geometry (XZ plane, pointing along +X)
attribute vec3 lineDirection; // Per-instance line direction

// Thin instance attributes (world matrix columns)
#ifdef THIN_INSTANCES
attribute vec4 world0;
attribute vec4 world1;
attribute vec4 world2;
attribute vec4 world3;
#endif

// Uniforms
uniform mat4 viewProjection;
uniform vec3 cameraPosition;
uniform float size;

void main() {
    // Construct world matrix from thin instance attributes
    #ifdef THIN_INSTANCES
    mat4 finalWorld = mat4(world0, world1, world2, world3);
    #else
    mat4 finalWorld = mat4(1.0);
    #endif

    // Extract arrow center position from world matrix
    vec3 worldCenter = vec3(finalWorld[3][0], finalWorld[3][1], finalWorld[3][2]);

    // Build camera-facing coordinate system aligned with line
    vec3 forward = normalize(lineDirection);              // Arrow points along line
    vec3 toCamera = normalize(cameraPosition - worldCenter);
    vec3 right = normalize(cross(forward, toCamera));     // Perpendicular to line AND camera
    vec3 up = cross(right, forward);                      // Completes orthonormal basis, faces camera

    // Transform arrow vertex from local space to world space
    // Local space: position in XZ plane (Y=0), pointing along +X
    // World space: aligned with line, facing camera
    vec3 worldOffset = position.x * forward + position.y * up + position.z * right;
    vec4 worldPos = vec4(worldCenter + worldOffset * size, 1.0);

    // Transform to clip space
    gl_Position = viewProjection * worldPos;
}
```

**Key Points**:
1. **Per-instance lineDirection**: Passed via thin instance attribute (registered in Edge.ts)
2. **Orthonormal basis**: forward (line), right (⊥ to line & camera), up (faces camera)
3. **Vertex transformation**: Maps XZ plane geometry to world-space billboard
4. **Size scaling**: Applied in world space before projection

---

### Critical BabylonJS Integration Details

**Thin Instance Buffer Updates** (Edge.ts lines 103-106):

```typescript
// CRITICAL: Notify BabylonJS that thin instance buffers have been updated!
// Without these calls, the GPU never receives the updated data
arrowMesh.thinInstanceBufferUpdated("matrix");
arrowMesh.thinInstanceBufferUpdated("lineDirection");
```

**Why this is required**:
- BabylonJS caches GPU buffer state
- After setting thin instance data, must call `thinInstanceBufferUpdated()`
- Without this, arrows render with stale/zero data (invisible or wrong orientation)

**Per-Instance Data Setup** (Edge.ts lines 83-101):

```typescript
private updateFilledArrowInstance(
    arrowMesh: Mesh,
    instanceIndex: number,
    position: Vector3,
    lineDirection: Vector3,
): void {
    // Create transformation matrix with ONLY translation
    // Rotation is handled by the shader via tangent billboarding
    const matrix = Matrix.Translation(position.x, position.y, position.z);

    // Update thin instance matrix
    arrowMesh.thinInstanceSetMatrixAt(instanceIndex, matrix);

    // Update lineDirection attribute (used by shader for tangent billboarding)
    arrowMesh.thinInstanceSetAttributeAt("lineDirection", instanceIndex, [
        lineDirection.x,
        lineDirection.y,
        lineDirection.z,
    ]);

    // CRITICAL: Notify BabylonJS that thin instance buffers have been updated!
    arrowMesh.thinInstanceBufferUpdated("matrix");
    arrowMesh.thinInstanceBufferUpdated("lineDirection");
}
```

**Thin Instance Attribute Registration** (FilledArrowRenderer.ts line 375):

```typescript
// Setup thin instance support for per-instance lineDirection
// Register the lineDirection attribute (vec3 = 3 floats)
mesh.thinInstanceRegisterAttribute("lineDirection", 3);
```

---

### Why This Maintains Zero Gap

1. **Arrow base positioned at sphere surface**: `worldCenter` extracted from instance matrix = sphere intercept point
2. **Line endpoint at same position**: Both line and arrow use same sphere intercept calculation
3. **Rotation around line axis**: Billboard rotation happens around axis passing through base point
4. **Base point ON rotation axis**: Rotation doesn't move the base, only orients the face
5. **Perfect alignment guaranteed**: Both positioned at identical 3D coordinate

---

### Files Changed for Tangent Billboarding

1. ✅ `src/meshes/FilledArrowRenderer.ts` (lines 60-106, 134-247)
   - Tangent billboarding vertex shader
   - Changed triangle/diamond/box from XY to XZ plane
   - Thin instance attribute registration

2. ✅ `src/Edge.ts` (lines 83-107)
   - `updateFilledArrowInstance()` method
   - Per-instance lineDirection updates
   - `thinInstanceBufferUpdated()` calls

3. ✅ Geometry plane fixes:
   - Triangle: XY → XZ (lines 149-154)
   - Diamond: XY → XZ (lines 192-196)
   - Box: XY → XZ (lines 232-236)
   - Circle: Already correct YZ plane (lines 267-275)

---

### Testing

✅ **Visual Verification** (2025-11-09):
- Arrow visible from all camera angles
- Arrow always faces camera (never edge-on)
- No gap between arrow and line
- Arrow points along line direction
- Verified with user: "holy shit! it works!"

**Debug Process**:
1. Added extensive console logging to track shader compilation, mesh state, arrow updates
2. Used Playwright MCP to inspect browser console
3. Discovered geometry plane issue through mathematical analysis of coordinate mappings
4. Fixed all polygon geometries to use XZ plane
5. Removed debug logging after verification

---

### Key Takeaway

**FOR ALL FUTURE FILLED ARROW TYPES**:

When adding new filled arrow shapes to FilledArrowRenderer:
1. Define geometry in **XZ plane (Y=0)**
2. Arrow points along **+X axis**
3. Face normal points in **±Y direction** (toward/away from camera)
4. Tip at origin (0, 0, 0), extends backward along -X
5. Test visibility from multiple camera angles before committing

**DO NOT** use XY plane for filled polygons - they will be invisible!

**2. Perspective Tapering** ✅ **COMPLETED (2025-11-09)**

~~Currently, arrows/lines use **anti-tapering** (constant screen-space size). Required: **perspective tapering** (objects farther from camera appear smaller).~~

**Implementation completed**: Removed `* w` compensation from both shaders.

**Implementation approach** - Remove `* w` compensation:

```glsl
// FilledArrowRenderer.ts:77 - CURRENT
gl_Position.xy += position.xy * size * pixelToClip * centerClip.w;

// FilledArrowRenderer.ts:77 - WITH TAPERING
gl_Position.xy += position.xy * size * pixelToClip;  // Remove * centerClip.w

// CustomLineRenderer.ts (similar change)
// CURRENT: offset *= vertexClip.w / resolution
// WITH TAPERING: offset /= resolution  // Remove * vertexClip.w
```

**Why alignment is maintained**:
- Both line and arrow positioned at same 3D coordinate (sphere surface)
- Both transform to same clip-space position (same x, y, z, **w**)
- Both calculate screen-space offset WITHOUT `w` compensation
- GPU applies perspective divide (`/= w`) to both identically
- Result: Both taper by exact same factor → perfect alignment maintained

**Files to update**:
- `src/meshes/FilledArrowRenderer.ts:77` - Remove `* centerClip.w`
- `src/meshes/CustomLineRenderer.ts` - Remove `* vertexClip.w` from offset calculation

**Testing**:
- Visual test at varying distances (should see size decrease with distance)
- Verify no gap between line and arrow at any distance
- Compare with anti-tapering mode

#### Future Phases

- Phase 2-3: Add remaining arrow types (dot-open, sphere variants, etc.)
- Phase 4: Line patterns (dash-dot, equal-dash, sinewave, zigzag)
- Phase 5: Bezier curves
- Phase 6: Tooltips and arrow text
- Phase 7: Polish and documentation

**See**: `design/custom-line-design.md` for complete architectural rationale.

---

**Core Principle**: Arrow heads are **specialized geometry** fed into the **same CustomLineRenderer shader** as lines. This ensures:
- ✅ Perfect alignment (identical screen-space formulas)
- ✅ Consistent perspective behavior
- ✅ Unified rendering path (better performance)
- ✅ One shader to maintain (not two)

**See**: `design/custom-line-design.md` for complete rationale and historical context of alignment problems.

---

## Arrow Alignment Architecture: The Unified Shader Solution

### The Alignment Challenge

**Historical Problem**: Previous attempts used different rendering technologies for lines vs arrows:
- Lines: GreasedLine → screen-space shader with formula `offset *= w / resolution`
- Arrows: StandardMaterial, billboard meshes, or separate GreasedLine instances

**Result**: Slight differences in screen-space math → misalignment at certain camera angles/distances.

### The Solution: Unified Geometry + Unified Shader

**Architecture Overview**:
```
Line Geometry          Arrow Geometry
    ↓                       ↓
createLineGeometry()   createLineGeometry()
    ↓                       ↓
LineGeometry           LineGeometry
    ↓                       ↓
    └──── mergeGeometries() ────┘
                ↓
         Combined Mesh
                ↓
     CustomLineRenderer Shader
       (ONE shader for both!)
```

### Mesh Architecture

**NOT Different Shaders**:
```
❌ OLD APPROACH:
Line Mesh (GreasedLine shader)  +  Arrow Mesh (Different shader)
= 2 draw calls per edge, potential misalignment, no instancing benefits
```

**Unified Shader (Separate Meshes)**:
```
✅ NEW APPROACH:
Line Mesh (CustomLineRenderer shader)  +  Arrow Mesh (CustomLineRenderer shader)
= 2 draw calls per edge, BUT with instancing:
  - All lines with same style share geometry → 1 draw call
  - All arrows of same type share geometry → 1 draw call per type
= ~2-10 draw calls for 1000 edges (instead of 2000!)
```

**Critical Insight**: Alignment guarantee comes from **same shader**, NOT merged geometry!

**Why Separate Meshes?**
- **Instancing**: Line geometry can be instanced across all edges with same style
- **Instancing**: Arrow geometry can be instanced across all edges with same arrow type
- **Performance**: With instancing, 1000 edges = ~10 draw calls (vs 1000 if merged, vs 2000 without instancing)
- **Alignment**: Still perfect because both use CustomLineRenderer shader with identical math

**Key Implementation Details**:
1. **Line mesh**: Base unit line geometry, CustomLineRenderer shader, instanced via world matrix
2. **Arrow mesh**: Base arrow geometry, CustomLineRenderer shader (SAME!), instanced via world matrix
3. **Arrow shapes defined as Vector3[] paths**: Triangle, circle, diamond, etc.
4. **Paths converted to LineGeometry**: Via `CustomLineRenderer.createLineGeometry()`
5. **Both use identical shader**: CustomLineRenderer's vertex + fragment shaders
6. **Position/rotation via world matrix**: BabylonJS instancing handles per-edge transforms

### Shader Strategy

**ONE Shader for Everything**:
```typescript
// CustomLineRenderer vertex shader (lines 64-125 in CustomLineRenderer.ts)
Effect.ShadersStore.customLineVertexShader = `
  // Handles BOTH line vertices AND arrow vertices
  vec4 vertexClip = viewProjection * finalWorld * vec4(position, 1.0);

  // Screen-space perpendicular calculation
  vec2 perpendicular = vec2(-screenDir.y, screenDir.x);
  vec2 offset = perpendicular * width * 0.5 * side;

  // THE KEY FORMULA (applied to all vertices uniformly):
  offset *= vertexClip.w;  // Compensate for perspective
  offset /= resolution;    // Convert to screen space

  gl_Position = vertexClip;
  gl_Position.xy += offset;
`;
```

**Why This Guarantees Alignment**:
- **Same formula** for line and arrow vertices
- **Same `w` value** for vertices at same 3D location
- **Same GPU perspective divide** applied uniformly
- **Mathematical guarantee**: If `w` is identical, screen-space offset is identical

### Perspective Behavior: Automatic Matching

**Current Behavior (Constant Screen-Space)**:
```
Line at z=10:  offset *= 10 / resolution → 10px wide
Arrow at z=10: offset *= 10 / resolution → 10px wide
Result: MATCH! (both compensate for same depth)

Line at z=50:  offset *= 50 / resolution → 10px wide
Arrow at z=50: offset *= 50 / resolution → 10px wide
Result: MATCH! (both compensate for same depth)
```

**With Perspective Tapering** (Phase 1 enhancement - see "Remaining Work" section):
```
Line at z=10:  offset / 10 (GPU divide) → 10px wide
Arrow at z=10: offset / 10 (GPU divide) → 10px wide
Result: MATCH! (both affected by same perspective)

Line at z=50:  offset / 50 (GPU divide) → 2px wide
Arrow at z=50: offset / 50 (GPU divide) → 2px wide
Result: MATCH! (both taper identically)
```

**No manual adjustment needed!** The shader formula automatically ensures arrows match lines at any depth, whether using anti-tapering (current) or perspective tapering (enhancement).

### Geometry Generation Strategy

**Arrow Types as Paths**:
```typescript
// Triangular arrow
const points = [
  new Vector3(0, 0, length),       // Tip
  new Vector3(-width/2, 0, 0),     // Left
  new Vector3(width/2, 0, 0),      // Right
  new Vector3(0, 0, length),       // Close
];
return CustomLineRenderer.createLineGeometry(points);

// Circular dot arrow
const points: Vector3[] = [];
for (let i = 0; i <= 32; i++) {
  const angle = (i / 32) * Math.PI * 2;
  points.push(new Vector3(
    Math.cos(angle) * radius,
    Math.sin(angle) * radius,
    0
  ));
}
return CustomLineRenderer.createLineGeometry(points);

// Diamond, box, etc. - all follow same pattern
```

**Key Insight**: `createLineGeometry()` converts ANY path into quad-strip geometry with correct vertex attributes (position, direction, side, distance). The shader then processes ALL vertices identically.

### Performance Optimization Strategy

**Shader Instancing Support**:
The CustomLineRenderer shader ALREADY supports BabylonJS instancing via:
```glsl
#include<instancesDeclaration>  // Declares instance variables
#include<instancesVertex>       // Computes finalWorld matrix
gl_Position = viewProjection * finalWorld * vec4(position, 1.0);  // Uses finalWorld
```

**BUT**: Different optimization strategies apply to lines vs arrows:

#### Lines: Geometry Batching (Not Traditional Instancing)

**Why not traditional instancing?**
- Each edge has UNIQUE vertex positions (different start/end points)
- Traditional instancing requires IDENTICAL geometry
- Can't use mesh.createInstance() or thin instances

**Solution: Geometry Batching** (like GreasedLine's "instance mode")
```typescript
class EdgeBatchRenderer {
  // Batch edges by style to reduce draw calls
  batches: Map<string, Mesh[]>;

  createBatch(edges: Edge[], style: EdgeStyle): Mesh {
    // Merge all line geometries with same style into single mesh
    const geometries = edges.map(e =>
      CustomLineRenderer.createLineGeometry([e.src, e.dst])
    );

    return CustomLineRenderer.mergeBatch(geometries, style, scene);
  }
}
```

**How batching works**:
1. **Group edges** by style (color, width, pattern)
2. **Merge geometries** into single mesh per group
3. **Single draw call** per batch (not per edge)

#### Arrows: Traditional Instancing

**Why instancing works for arrows:**
- Same arrow geometry shared across edges
- Only position/rotation differs (world matrix)
- Perfect use case for mesh.createInstance()

```typescript
class ArrowInstanceManager {
  templates: Map<string, Mesh>;  // Base arrow meshes

  createArrow(type: string, position: Vector3, rotation: Quaternion): InstancedMesh {
    const template = this.getTemplate(type);  // Shared geometry
    const instance = template.createInstance(`arrow-${id}`);
    instance.position = position;
    instance.rotationQuaternion = rotation;
    return instance;  // GPU renders all instances in 1 draw call
  }
}
```

**Performance Math**:
```
1000 edges, 5 line styles, 3 arrow types:

Without batching:
  1000 lines × 1 draw call = 1000 draw calls
  1000 arrows × 1 draw call = 1000 draw calls
  Total: 2000 draw calls

With batching + instancing:
  5 line batches × 1 draw call = 5 draw calls
  3 arrow instances × 1 draw call = 3 draw calls
  Total: 8 draw calls (250x improvement!)
```

### Performance Benefits

| Metric | Old (Different Shaders) | New (Unified Shader) | Improvement |
|--------|------------------------|---------------------|-------------|
| Draw calls (1000 edges) | 2000 | 8-20 (batching/instancing) | **100-250x fewer** |
| Lines strategy | N/A | Geometry batching | Fewer draw calls |
| Arrows strategy | N/A | Traditional instancing | Single draw call per type |
| Shader switches | Yes (line vs arrow) | No (same shader) | Faster |
| Alignment issues | Possible | Impossible | 100% reliable |
| Memory per arrow | ~1000 bytes | ~100 bytes (instanced) | 90% reduction |

### BabylonJS ShaderMaterial Instancing Compatibility

**Question**: Will instancing work with our custom shader?

**Answer**: YES ✅ - The CustomLineRenderer shader is already properly configured for instancing.

**Required elements** (all present in CustomLineRenderer.ts:64-125):
1. ✅ `#include<instancesDeclaration>` - Declares instance variables
2. ✅ `#include<instancesVertex>` - Computes `finalWorld` matrix
3. ✅ `viewProjection * finalWorld * vec4(...)` - Uses `finalWorld` (not `world`)
4. ✅ `defines: ["#define INSTANCES"]` - Enables instancing support
5. ✅ `world` in uniforms array - Required by includes

**Known BabylonJS Issue (SOLVED)**:
- Early ShaderMaterial instancing had issues when using `world` matrix directly
- Solution: Use `finalWorld` computed by `#include<instancesVertex>`
- Our shader already uses `finalWorld` (line 93)

**What works**:
- ✅ **Arrow instancing**: `template.createInstance()` for arrows
- ✅ **Thin instances**: `mesh.thinInstanceAdd()` if needed
- ✅ **Geometry batching**: Merge multiple line geometries

**What doesn't work**:
- ❌ **Line instancing**: Can't instance unique geometries (different vertex positions)

**Implementation Note**:
The shader's instancing support enables **arrow** instancing and future optimizations, but **lines** will use geometry batching instead due to unique vertex positions per edge.

### Supported Arrow Types

All arrow types use the same unified shader approach:

**Filled Shapes** (closed paths with "thick" line width):
- Normal, Inverted, Diamond, Box, Dot, Sphere-dot, Sphere

**Outline Shapes** (closed paths with "thin" line width):
- Empty, Open-dot, Open-diamond

**Line-Based Shapes** (multi-segment paths):
- Tee, Open, Half-open, Vee, Crow

**All use**: `CustomLineRenderer.createLineGeometry()` → Same shader → Guaranteed alignment

---

**Tests to Write First**:

- `test/meshes/CustomLineArrows.test.ts`: Test arrow geometry generation with CustomLineRenderer
  ```typescript
  describe("CustomLineRenderer Arrow Geometry", () => {
    test("triangular arrow geometry generates correct vertex count", () => {
      const geometry = CustomLineRenderer.createTriangularArrowGeometry(1.0, 0.5, false);

      // Triangle: 4 points (closed), 2 segments, 4 vertices per segment = 8 vertices
      assert.equal(geometry.positions.length / 3, 8);
    });

    test("circular dot arrow generates smooth circle", () => {
      const geometry = CustomLineRenderer.createCircularDotGeometry(0.5, 32);

      // 32 segments = 33 points (closed), 32 segments, 4 vertices per segment
      assert.isTrue(geometry.positions.length / 3 > 32);
    });

    test("arrow mesh uses same shader as line mesh", () => {
      const lineMesh = CustomLineRenderer.create({
        points: [new Vector3(0, 0, 0), new Vector3(10, 0, 0)],
        width: 1.0,
        color: "#FF0000"
      }, scene);

      const arrowGeom = CustomLineRenderer.createTriangularArrowGeometry(1.0, 0.5, false);
      const arrowMesh = CustomLineRenderer.createFromGeometry(
        arrowGeom,
        { width: 1.0, color: "#FF0000" },
        scene
      );

      const lineMaterial = lineMesh.material as ShaderMaterial;
      const arrowMaterial = arrowMesh.material as ShaderMaterial;

      // CRITICAL: Both use same shader (guarantees alignment!)
      assert.equal(lineMaterial.name, "customLineMaterial");
      assert.equal(arrowMaterial.name, "customLineMaterial");
    });

    test("arrow and line can be instanced separately", () => {
      // Create first edge's meshes
      const line1 = CustomLineRenderer.create({
        points: [new Vector3(0,0,0), new Vector3(10,0,0)],
        width: 1.0, color: "#FF0000"
      }, scene);

      const arrow1 = EdgeMesh.createArrowHead(
        cache, "style1",
        { type: "normal", width: 1.0, color: "#FF0000" },
        scene
      );

      // Second edge can reuse same geometries (instancing)
      const line2 = cache.get("edge-style-1", () => line1);
      const arrow2 = cache.get("edge-arrowhead-style-1", () => arrow1);

      // Different instances can have different world matrices
      line2.position = new Vector3(20, 0, 0);
      arrow2.position = new Vector3(30, 0, 0);

      // But share same geometry (verified by checking they're instances)
      assert.isTrue(line1.geometry === line2.geometry);
      assert.isTrue(arrow1.geometry === arrow2.geometry);
    });
  });
  ```

- `test/Edge.properties.test.ts`: Integration test for arrow properties (line opacity tests removed - already complete in Phase 0)
  ```typescript
  describe("Edge with Arrow Properties", () => {
    test("edge uses arrow size instead of line width", () => {
      const style = {
        arrowHead: { type: "normal", size: 2.0, color: "#FF0000", opacity: 1.0 },
        line: { width: 0.5, color: "#00FF00" },
        enabled: true
      };

      const edge = createTestEdge(style);

      // Verify arrow was created with size=2.0, not width=0.5
      assert.exists(edge.arrowMesh);
      // Add specific assertions
    });
  });
  ```

**Implementation**:

- `src/meshes/CustomLineRenderer.ts`: Add arrow geometry generators
  ```typescript
  /**
   * Create triangular arrow geometry (normal or inverted)
   * Returns LineGeometry that can be fed into same shader as lines
   */
  static createTriangularArrowGeometry(
    length: number,
    width: number,
    inverted: boolean
  ): LineGeometry {
    const tip = inverted ? -length : length;
    const base = inverted ? 0 : 0;

    const points = [
      new Vector3(0, 0, tip),              // Tip
      new Vector3(-width/2, 0, base),      // Left corner
      new Vector3(width/2, 0, base),       // Right corner
      new Vector3(0, 0, tip),              // Close triangle
    ];

    // Use SAME createLineGeometry as lines!
    // This ensures arrow uses identical shader
    return this.createLineGeometry(points);
  }

  /**
   * Create circular dot arrow geometry
   */
  static createCircularDotGeometry(radius: number, segments: number = 32): LineGeometry {
    const points: Vector3[] = [];

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      points.push(new Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0
      ));
    }

    return this.createLineGeometry(points);
  }

  /**
   * Create diamond arrow geometry
   */
  static createDiamondArrowGeometry(length: number, width: number): LineGeometry {
    const points = [
      new Vector3(0, 0, length),           // Front tip
      new Vector3(-width/2, 0, 0),         // Left
      new Vector3(0, 0, -length),          // Back tip
      new Vector3(width/2, 0, 0),          // Right
      new Vector3(0, 0, length),           // Close diamond
    ];

    return this.createLineGeometry(points);
  }

  /**
   * Create box arrow geometry
   */
  static createBoxArrowGeometry(length: number, width: number): LineGeometry {
    const halfLength = length / 2;
    const halfWidth = width / 2;

    const points = [
      new Vector3(-halfWidth, 0, halfLength),   // Top-left
      new Vector3(halfWidth, 0, halfLength),    // Top-right
      new Vector3(halfWidth, 0, -halfLength),   // Bottom-right
      new Vector3(-halfWidth, 0, -halfLength),  // Bottom-left
      new Vector3(-halfWidth, 0, halfLength),   // Close box
    ];

    return this.createLineGeometry(points);
  }

  /**
   * Create mesh from LineGeometry
   * This is used for both lines and arrows - they use the SAME shader!
   */
  static createFromGeometry(
    geometry: LineGeometry,
    options: { width: number, color: string, opacity?: number },
    scene: Scene
  ): Mesh {
    this.registerShaders();

    const mesh = new Mesh("custom-line-geometry", scene);

    // Set vertex data
    const vertexData = new VertexData();
    vertexData.positions = geometry.positions;
    vertexData.indices = geometry.indices;
    vertexData.uvs = geometry.uvs;
    vertexData.applyToMesh(mesh);

    // Set custom attributes
    mesh.setVerticesData("direction", geometry.directions, false, 3);
    mesh.setVerticesData("side", geometry.sides, false, 1);
    mesh.setVerticesData("distance", geometry.distances, false, 1);

    // Create shader material (SAME shader used for lines!)
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
        defines: ["#define INSTANCES"], // Enable instancing
      }
    );

    // Set uniforms
    const colorObj = Color3.FromHexString(options.color);
    shaderMaterial.setVector3("color", new Vector3(colorObj.r, colorObj.g, colorObj.b));
    shaderMaterial.setFloat("width", options.width * 20);
    shaderMaterial.setFloat("opacity", options.opacity ?? 1.0);

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
  ```

  **Key Insight**: Arrow heads are just **paths** (triangle, circle, diamond, box) converted to quad-strip geometry using the **exact same** `createLineGeometry()` method as lines. This guarantees they use the same shader with identical math.

  **Summary of Unified Shader Architecture**:
  1. **Arrow shapes defined as Vector3[] paths** (geometry only)
  2. **Paths → LineGeometry** via `CustomLineRenderer.createLineGeometry()`
  3. **Separate meshes created**: Line mesh + Arrow mesh (both use CustomLineRenderer shader)
  4. **Geometry instanced**: Lines share geometry by style, arrows share by type
  5. **Position/rotation**: Handled via world matrix per edge
  6. **Result**: Perfect alignment, automatic perspective, **100-250x fewer draw calls via instancing**

- `src/Edge.ts`: Update arrow creation to use proper properties
  ```typescript
  // In constructor and updateStyle(), change from:
  this.arrowMesh = EdgeMesh.createArrowHead(
    this.context.getMeshCache(),
    String(this.styleId),
    {
      type: style.arrowHead?.type ?? "none",
      width: style.line?.width ?? 0.25,  // OLD: used line width
      color: style.line?.color ?? "#FFFFFF", // OLD: used line color
    },
    this.context.getScene(),
  );

  // To:
  this.arrowMesh = EdgeMesh.createArrowHead(
    this.context.getMeshCache(),
    String(this.styleId),
    {
      type: style.arrowHead?.type ?? "none",
      width: style.line?.width ?? 0.25,
      color: style.arrowHead?.color ?? style.line?.color ?? "#FFFFFF", // NEW: use arrow color
      size: style.arrowHead?.size ?? 1.0, // NEW: use arrow size
      opacity: style.arrowHead?.opacity ?? 1.0, // NEW: use arrow opacity
    },
    this.context.getScene(),
  );
  ```

- `src/constants/meshConstants.ts`: Add new constants
  ```typescript
  export const EDGE_CONSTANTS = {
    // ... existing constants ...

    // Opacity defaults
    DEFAULT_ARROW_OPACITY: 1.0,
    DEFAULT_LINE_OPACITY: 1.0,
  } as const;
  ```

**Dependencies**:
- External: None (uses existing Babylon.js)
- Internal: Existing EdgeMesh, Edge, MeshCache, CustomLineRenderer (for line opacity)

**Verification**:
1. Run: `npm test -- EdgeMesh.test.ts ArrowProperties.test.ts`
2. Expected: All tests pass, arrows scale/color independently
3. Build: `npm run build` - Expected: No errors
4. Lint: `npm run lint` - Expected: No new errors
5. Note: Line opacity tests already pass via CustomLineRenderer tests

**Storybook Stories** (CRITICAL - Must verify controls work):

Create/update `stories/EdgeStyles.stories.ts` with the following stories, each with working interactive controls:

1. **ArrowSize Story**:
   - Args: `styleTemplate: templateCreator({ edgeStyle: { arrowHead: { type: "normal", size: 2.0, color: "darkgrey" }, line: { width: 0.5, color: "darkgrey" } } })`
   - Controls to include: `["arrowHead.size", "line.width"]`
   - Verify: Adjusting `arrowHead.size` slider changes arrow size in real-time

2. **ArrowColor Story**:
   - Args: `styleTemplate: templateCreator({ edgeStyle: { arrowHead: { type: "normal", color: "#FF0000" }, line: { color: "#00FF00" } } })`
   - Controls to include: `["arrowHead.color", "line.color"]`
   - Verify: Color pickers change arrow and line colors independently

3. **ArrowOpacity Story**:
   - Args: `styleTemplate: templateCreator({ edgeStyle: { arrowHead: { type: "normal", opacity: 0.5, color: "darkgrey" }, line: { color: "darkgrey" } } })`
   - Controls to include: `["arrowHead.opacity"]`
   - Verify: Opacity slider makes arrows more/less transparent

4. **LineOpacity Story** (already working via CustomLineRenderer):
   - Args: `styleTemplate: templateCreator({ edgeStyle: { arrowHead: { type: "normal", color: "darkgrey" }, line: { opacity: 0.5, color: "darkgrey" } } })`
   - Controls to include: `["line.opacity"]`
   - Verify: Opacity slider makes lines more/less transparent
   - Note: This feature is already implemented in CustomLineRenderer shader

5. **CombinedOpacity Story**:
   - Args: `styleTemplate: templateCreator({ edgeStyle: { arrowHead: { type: "normal", opacity: 0.3, color: "darkgrey" }, line: { opacity: 0.7, color: "darkgrey" } } })`
   - Controls to include: `["arrowHead.opacity", "line.opacity"]`
   - Verify: Both sliders work independently

**argTypes Configuration**:
Add to `stories/EdgeStyles.stories.ts` meta:
```typescript
argTypes: {
  edgeLineWidth: {control: {type: "range", min: 0.1, max: 10, step: 0.1}, table: {category: "Line"}, name: "line.width"},
  edgeLineColor: {control: "color", table: {category: "Line"}, name: "line.color"},
  edgeLineOpacity: {control: {type: "range", min: 0, max: 1, step: 0.1}, table: {category: "Line"}, name: "line.opacity"},
  arrowSize: {control: {type: "range", min: 0.1, max: 5, step: 0.1}, table: {category: "Arrow"}, name: "arrowHead.size"},
  arrowColor: {control: "color", table: {category: "Arrow"}, name: "arrowHead.color"},
  arrowOpacity: {control: {type: "range", min: 0, max: 1, step: 0.1}, table: {category: "Arrow"}, name: "arrowHead.opacity"},
}
```

**IMPORTANT - helpers.ts Update**:
If not already present, add edge property handling to `stories/helpers.ts` renderFn():
```typescript
} else if (name.startsWith("line.") || name.startsWith("arrowHead.")) {
    // For edge properties
    if (t.edgeStyle) {
        deepSet(t, `edgeStyle.${name}`, val);
    } else if (t.layers) {
        deepSet(t, `layers[0].edge.style.${name}`, val);
    }
}
```

**Manual Verification** (Must complete before marking phase done):
1. Start Storybook: `npm run storybook`
2. Navigate to each story created above
3. For each story, adjust EVERY control and verify the graph updates in real-time
4. Test URL parameters work (e.g., `?args=arrowSize:4` should update the control AND the graph)
5. Take screenshots showing controls at different values to document they work

---

### Phase 2: Simple Arrow Shapes (3 days)

**Objective**: Implement 4 filled arrow shapes (inverted, dot, diamond, box) and refactor createArrowHead() to use type-based routing. This establishes the pattern for all future arrow types.

**Duration**: 3 days

**Tests to Write First**:

- `test/meshes/ArrowShapes.test.ts`: Test each arrow shape
  ```typescript
  describe("Arrow Shape Generation", () => {
    test("inverted arrow points away from target", () => {
      const arrowMesh = EdgeMesh.createArrowHead(
        meshCache,
        "test-inverted",
        { type: "inverted", width: 1.0, color: "#FF0000", size: 1.0, opacity: 1.0 },
        scene
      );

      assert.exists(arrowMesh);
      assert.equal(arrowMesh.name, "edge-arrowhead-style-test-inverted");
      // Verify geometry points in opposite direction
    });

    test("dot arrow creates circular shape", () => {
      const arrowMesh = EdgeMesh.createArrowHead(
        meshCache,
        "test-dot",
        { type: "dot", width: 1.0, color: "#FF0000", size: 1.0, opacity: 1.0 },
        scene
      );

      assert.exists(arrowMesh);
      // Verify circular geometry via point inspection
    });

    test("diamond arrow creates rhombus shape", () => {
      const arrowMesh = EdgeMesh.createArrowHead(
        meshCache,
        "test-diamond",
        { type: "diamond", width: 1.0, color: "#FF0000", size: 1.0, opacity: 1.0 },
        scene
      );

      assert.exists(arrowMesh);
      // Verify diamond has 4 corner points
    });

    test("box arrow creates rectangular shape", () => {
      const arrowMesh = EdgeMesh.createArrowHead(
        meshCache,
        "test-box",
        { type: "box", width: 1.0, color: "#FF0000", size: 1.0, opacity: 1.0 },
        scene
      );

      assert.exists(arrowMesh);
      // Verify rectangular geometry
    });

    test("unsupported arrow type throws error", () => {
      assert.throws(() => {
        EdgeMesh.createArrowHead(
          meshCache,
          "test-invalid",
          { type: "invalid-type", width: 1.0, color: "#FF0000" },
          scene
        );
      });
    });
  });
  ```

- `test/integration/arrow-rendering.test.ts`: Visual rendering test
  ```typescript
  describe("Arrow Rendering Integration", () => {
    test("all filled arrow types render without errors", async () => {
      const types = ["normal", "inverted", "dot", "diamond", "box"];

      for (const type of types) {
        const graph = createTestGraph();
        graph.styleTemplate = templateCreator({
          edgeStyle: { arrowHead: { type } }
        });

        await waitForGraphToSettle(graph);

        // Verify no rendering errors
        assert.equal(graph.edges.length > 0, true);
      }
    });
  });
  ```

**Implementation**:

- `src/meshes/EdgeMesh.ts`: Add arrow generation methods
  ```typescript
  export class EdgeMesh {
    // Refactor createArrowHead to route by type
    static createArrowHead(
      cache: MeshCache,
      styleId: string,
      options: ArrowHeadOptions,
      scene: Scene,
    ): AbstractMesh | null {
      if (!options.type || options.type === "none") {
        return null;
      }

      const cacheKey = `edge-arrowhead-style-${styleId}`;
      const size = options.size ?? 1.0;
      const opacity = options.opacity ?? 1.0;

      return cache.get(cacheKey, () => {
        const width = this.calculateArrowWidth(options.width) * size;
        const length = this.calculateArrowLength(options.width) * size;

        // Route to specific arrow geometry generator
        // NOTE: All generators return LineGeometry for use with CustomLineRenderer shader
        let arrowGeometry: LineGeometry;

        switch (options.type) {
          case "normal":
            arrowGeometry = CustomLineRenderer.createTriangularArrowGeometry(length, width, false);
            break;
          case "inverted":
            arrowGeometry = CustomLineRenderer.createTriangularArrowGeometry(length, width, true);
            break;
          case "dot":
            arrowGeometry = CustomLineRenderer.createCircularDotGeometry(width / 2, 32);
            break;
          case "diamond":
            arrowGeometry = CustomLineRenderer.createDiamondArrowGeometry(length, width);
            break;
          case "box":
            arrowGeometry = CustomLineRenderer.createBoxArrowGeometry(length, width);
            break;
          default:
            throw new Error(`Unsupported arrow type: ${options.type}`);
        }

        // Create mesh using CustomLineRenderer with arrow geometry
        // This uses the SAME shader as lines, guaranteeing alignment
        const mesh = CustomLineRenderer.createFromGeometry(
          arrowGeometry,
          {
            color: Color3.FromHexString(options.color),
          },
          scene,
        );

        mesh.visibility = opacity;
        return mesh;
      });
    }

    // NOTE: Arrow geometry generation methods have been moved to CustomLineRenderer
    // See CustomLineRenderer.createTriangularArrowGeometry(), createCircularDotGeometry(),
    // createDiamondArrowGeometry(), createBoxArrowGeometry(), etc.
    // These methods generate Vector3[] paths that are converted to LineGeometry
    // via CustomLineRenderer.createLineGeometry(), ensuring all arrows use the
    // SAME shader as lines for guaranteed alignment.
  }
  ```

- `src/constants/meshConstants.ts`: Add arrow shape constants
  ```typescript
  export const EDGE_CONSTANTS = {
    // ... existing constants ...

    // Arrow shape dimensions
    ARROW_DOT_RADIUS_MULTIPLIER: 0.4,
    ARROW_DIAMOND_ASPECT_RATIO: 1.5,
    ARROW_BOX_ASPECT_RATIO: 1.0,
  } as const;
  ```

**Dependencies**:
- External: None
- Internal: Phase 1 (arrow properties)

**Verification**:
1. Run: `npm test -- ArrowShapes.test.ts arrow-rendering.test.ts`
2. Expected: All arrow shape tests pass
3. Build: `npm run build` - Expected: No errors
4. Lint: `npm run lint` - Expected: No new errors

**Storybook Stories** (CRITICAL - Must verify controls work):

Add stories to `stories/EdgeStyles.stories.ts` for each arrow type with working controls:

1. **NormalArrowHead Story** (if not exists):
   - Args: `styleTemplate: templateCreator({ edgeStyle: { arrowHead: { type: "normal", color: "darkgrey" }, line: { color: "darkgrey" } } })`
   - Controls to include: `["arrowHead.size", "arrowHead.color"]`

2. **InvertedArrowHead Story**:
   - Args: `styleTemplate: templateCreator({ edgeStyle: { arrowHead: { type: "inverted", color: "darkgrey" }, line: { color: "darkgrey" } } })`
   - Controls to include: `["arrowHead.size", "arrowHead.color"]`
   - Verify: Arrow points away from target node

3. **DotArrowHead Story**:
   - Args: `styleTemplate: templateCreator({ edgeStyle: { arrowHead: { type: "dot", color: "darkgrey" }, line: { color: "darkgrey" } } })`
   - Controls to include: `["arrowHead.size", "arrowHead.color"]`
   - Verify: Circular arrow head renders

4. **DiamondArrowHead Story**:
   - Args: `styleTemplate: templateCreator({ edgeStyle: { arrowHead: { type: "diamond", color: "darkgrey" }, line: { color: "darkgrey" } } })`
   - Controls to include: `["arrowHead.size", "arrowHead.color"]`
   - Verify: Diamond/rhombus shape renders

5. **BoxArrowHead Story**:
   - Args: `styleTemplate: templateCreator({ edgeStyle: { arrowHead: { type: "box", color: "darkgrey" }, line: { color: "darkgrey" } } })`
   - Controls to include: `["arrowHead.size", "arrowHead.color"]`
   - Verify: Rectangular arrow head renders

**argTypes** should already be configured from Phase 1, no changes needed to meta.

**Manual Verification** (Must complete before marking phase done):
1. Start Storybook: `npm run storybook`
2. Navigate to Styles/Edge section
3. For EACH arrow type story:
   - Verify the arrow shape is clearly visible and correct
   - Adjust the `arrowHead.size` slider and verify arrow scales
   - Change the `arrowHead.color` and verify arrow color changes independently from line
4. Take screenshots of each arrow type at size=1.0 and size=3.0 to document

---

### Phase 3: Hollow & Line-Based Arrows + Arrow Tail (3 days)

**Objective**: Implement remaining 8 arrow types (empty, open-dot, open-diamond, tee, open, half-open, vee, crow) and add arrow tail support for bidirectional arrows.

**Duration**: 3 days

**Tests to Write First**:

- `test/meshes/HollowArrows.test.ts`: Test hollow arrow shapes
  ```typescript
  describe("Hollow Arrow Shapes", () => {
    test("empty arrow creates hollow triangle", () => {
      const arrowMesh = EdgeMesh.createArrowHead(
        meshCache,
        "test-empty",
        { type: "empty", width: 1.0, color: "#FF0000" },
        scene
      );

      assert.exists(arrowMesh);
      // Verify thin outline vs filled
    });

    test("open-dot arrow creates hollow circle", () => {
      const arrowMesh = EdgeMesh.createArrowHead(
        meshCache,
        "test-open-dot",
        { type: "open-dot", width: 1.0, color: "#FF0000" },
        scene
      );

      assert.exists(arrowMesh);
    });

    test("open-diamond arrow creates hollow diamond", () => {
      const arrowMesh = EdgeMesh.createArrowHead(
        meshCache,
        "test-open-diamond",
        { type: "open-diamond", width: 1.0, color: "#FF0000" },
        scene
      );

      assert.exists(arrowMesh);
    });

    test("tee arrow creates perpendicular line", () => {
      const arrowMesh = EdgeMesh.createArrowHead(
        meshCache,
        "test-tee",
        { type: "tee", width: 1.0, color: "#FF0000" },
        scene
      );

      assert.exists(arrowMesh);
    });

    test("open arrow creates V-shape", () => {
      const arrowMesh = EdgeMesh.createArrowHead(
        meshCache,
        "test-open",
        { type: "open", width: 1.0, color: "#FF0000" },
        scene
      );

      assert.exists(arrowMesh);
    });

    test("half-open arrow creates asymmetric arrow", () => {
      const arrowMesh = EdgeMesh.createArrowHead(
        meshCache,
        "test-half-open",
        { type: "half-open", width: 1.0, color: "#FF0000" },
        scene
      );

      assert.exists(arrowMesh);
    });

    test("vee arrow creates wide V-shape", () => {
      const arrowMesh = EdgeMesh.createArrowHead(
        meshCache,
        "test-vee",
        { type: "vee", width: 1.0, color: "#FF0000" },
        scene
      );

      assert.exists(arrowMesh);
    });

    test("crow arrow creates three-pronged fork", () => {
      const arrowMesh = EdgeMesh.createArrowHead(
        meshCache,
        "test-crow",
        { type: "crow", width: 1.0, color: "#FF0000" },
        scene
      );

      assert.exists(arrowMesh);
    });
  });
  ```

- `test/Edge.arrowTail.test.ts`: Test arrow tail support
  ```typescript
  describe("Arrow Tail Support", () => {
    test("creates tail arrow when arrowTail configured", () => {
      const style = {
        arrowHead: { type: "normal", color: "#FF0000" },
        arrowTail: { type: "tee", color: "#0000FF" },
        line: { width: 0.5 },
        enabled: true
      };

      const edge = createTestEdge(style);

      assert.exists(edge.arrowMesh);
      assert.exists(edge.arrowTailMesh);
    });

    test("tail arrow has independent styling", () => {
      const style = {
        arrowHead: { type: "normal", size: 1.0, color: "#FF0000", opacity: 1.0 },
        arrowTail: { type: "dot", size: 2.0, color: "#00FF00", opacity: 0.5 },
        line: { width: 0.5 },
        enabled: true
      };

      const edge = createTestEdge(style);

      assert.exists(edge.arrowMesh);
      assert.exists(edge.arrowTailMesh);
      assert.notEqual(edge.arrowMesh, edge.arrowTailMesh);
    });

    test("tail arrow positions at source node", () => {
      const edge = createTestEdge({
        arrowTail: { type: "normal" },
        enabled: true
      });

      edge.update();

      // Verify tail arrow is positioned at source intercept point
      assert.exists(edge.arrowTailMesh);
      // Add position assertions
    });

    test("tail arrow points away from source", () => {
      const edge = createTestEdge({
        arrowTail: { type: "normal" },
        enabled: true
      });

      edge.update();

      // Verify tail arrow rotation points away from source
      assert.exists(edge.arrowTailMesh);
      // Add rotation assertions
    });
  });
  ```

**Implementation**:

- `src/meshes/EdgeMesh.ts`: Add remaining arrow shapes
  ```typescript
  // Add to switch statement in createArrowHead():
  case "empty":
    arrowData = this.createEmptyArrow(length, width);
    break;
  case "open-dot":
    arrowData = this.createDotArrow(length, width, false); // hollow=false
    break;
  case "open-diamond":
    arrowData = this.createDiamondArrow(length, width, false);
    break;
  case "tee":
    arrowData = this.createTeeArrow(length, width);
    break;
  case "open":
    arrowData = this.createOpenArrow(length, width);
    break;
  case "half-open":
    arrowData = this.createHalfOpenArrow(length, width);
    break;
  case "vee":
    arrowData = this.createVeeArrow(length, width);
    break;
  case "crow":
    arrowData = this.createCrowArrow(length, width);
    break;

  // Implement each arrow method:
  private static createEmptyArrow(length: number, width: number): { points: number[], widths: number[] } {
    // Hollow triangle - reuse normal arrow logic but with thin line
    const cap = this.createNormalArrow(length, width);
    // Reduce all widths to create outline
    cap.widths = cap.widths.map(w => w * 0.2);
    return cap;
  }

  private static createTeeArrow(length: number, width: number): { points: number[], widths: number[] } {
    // Perpendicular line at edge end
    const points = [
      -width / 2, 0, 0,  // Left end of tee
      width / 2, 0, 0,   // Right end of tee
    ];
    const widths = [width * 0.3, width * 0.3];
    return { points, widths };
  }

  private static createOpenArrow(length: number, width: number): { points: number[], widths: number[] } {
    // V-shape without back edge
    const points = [
      -width / 2, 0, -length,  // Left arm
      0, 0, 0,                  // Tip
      width / 2, 0, -length,   // Right arm
    ];
    const widths = [width * 0.3, width * 0.3, width * 0.3];
    return { points, widths };
  }

  private static createHalfOpenArrow(length: number, width: number): { points: number[], widths: number[] } {
    // One side open, one side closed
    const ratio = EDGE_CONSTANTS.ARROW_HALF_OPEN_RATIO;
    const points = [
      -width / 2, 0, -length,      // Left arm (full)
      0, 0, 0,                      // Tip
      width / 2, 0, -length * ratio, // Right arm (half)
    ];
    const widths = [width * 0.3, width * 0.3, width * 0.3];
    return { points, widths };
  }

  private static createVeeArrow(length: number, width: number): { points: number[], widths: number[] } {
    // Wide V-shape
    const angle = EDGE_CONSTANTS.ARROW_VEE_ANGLE * Math.PI / 180;
    const veeWidth = Math.tan(angle) * length;

    const points = [
      -veeWidth / 2, 0, -length,  // Left arm
      0, 0, 0,                     // Tip
      veeWidth / 2, 0, -length,   // Right arm
    ];
    const widths = [width * 0.3, width * 0.3, width * 0.3];
    return { points, widths };
  }

  private static createCrowArrow(length: number, width: number): { points: number[], widths: number[] } {
    // Three-pronged fork (crow's foot)
    const angle = EDGE_CONSTANTS.ARROW_CROW_FORK_ANGLE * Math.PI / 180;
    const spread = Math.tan(angle) * length;

    const points = [
      // Left prong
      -spread, 0, -length,
      0, 0, 0,
      // Center prong
      0, 0, -length,
      0, 0, 0,
      // Right prong
      spread, 0, -length,
    ];
    const widths = Array(5).fill(width * 0.3);
    return { points, widths };
  }
  ```

- `src/Edge.ts`: Add arrow tail support
  ```typescript
  export class Edge {
    // Add property
    arrowTailMesh: AbstractMesh | null = null;

    constructor(/* ... */) {
      // ... existing code ...

      // Create arrow tail if configured
      if (style.arrowTail) {
        this.arrowTailMesh = EdgeMesh.createArrowHead(
          this.context.getMeshCache(),
          `${String(this.styleId)}-tail`,
          {
            type: style.arrowTail.type ?? "none",
            width: style.line?.width ?? 0.25,
            color: style.arrowTail.color ?? style.line?.color ?? "#FFFFFF",
            size: style.arrowTail.size ?? 1.0,
            opacity: style.arrowTail.opacity ?? 1.0,
          },
          this.context.getScene(),
        );
      }
    }

    updateStyle(styleId: EdgeStyleId): void {
      // ... existing code for arrow head ...

      // Update arrow tail
      if (this.arrowTailMesh && !this.arrowTailMesh.isDisposed()) {
        this.arrowTailMesh.dispose();
      }

      if (style.arrowTail) {
        this.arrowTailMesh = EdgeMesh.createArrowHead(
          this.context.getMeshCache(),
          `${String(styleId)}-tail`,
          {
            type: style.arrowTail.type ?? "none",
            width: style.line?.width ?? 0.25,
            color: style.arrowTail.color ?? style.line?.color ?? "#FFFFFF",
            size: style.arrowTail.size ?? 1.0,
            opacity: style.arrowTail.opacity ?? 1.0,
          },
          this.context.getScene(),
        );
      } else {
        this.arrowTailMesh = null;
      }
    }

    transformArrowCap(): EdgeLine {
      // ... existing arrow head code ...

      // Handle arrow tail
      if (this.arrowTailMesh) {
        const srcMesh = this.srcNode.mesh;
        const dstMesh = this.dstNode.mesh;

        // Create reverse ray for tail
        const tailRay = new Ray(dstMesh.position, srcMesh.position);
        const srcHitInfo = tailRay.intersectsMeshes([srcMesh]);

        if (srcHitInfo.length) {
          const srcPoint = srcHitInfo[0].pickedPoint;
          if (srcPoint) {
            this.arrowTailMesh.setEnabled(true);
            this.arrowTailMesh.position = srcPoint;
            // Tail points AWAY from source (toward destination)
            this.arrowTailMesh.lookAt(dstMesh.position);

            // Adjust edge start point to account for tail
            const style = Styles.getStyleForEdgeStyleId(this.styleId);
            if (style.arrowTail?.type && style.arrowTail.type !== "none") {
              const tailLen = EdgeMesh.calculateArrowLength(style.line?.width ?? 0.25);
              const direction = dstMesh.position.subtract(srcMesh.position).normalize();
              const adjustedSrcPoint = srcPoint.add(direction.scale(tailLen));

              return {
                srcPoint: adjustedSrcPoint,
                dstPoint: /* existing dstPoint or newEndPoint */,
              };
            }
          }
        }
      }

      return { srcPoint, dstPoint };
    }
  }
  ```

- `src/constants/meshConstants.ts`: Add arrow constants
  ```typescript
  export const EDGE_CONSTANTS = {
    // ... existing ...
    ARROW_CROW_FORK_ANGLE: 30, // degrees
    ARROW_VEE_ANGLE: 60, // degrees
    ARROW_HALF_OPEN_RATIO: 0.5,
  } as const;
  ```

**Dependencies**:
- External: None
- Internal: Phase 1 (arrow properties), Phase 2 (arrow shape pattern)

**Verification**:
1. Run: `npm test -- HollowArrows.test.ts Edge.arrowTail.test.ts`
2. Expected: All 12 arrow types work, arrow tail renders correctly
3. Build: `npm run build` - Expected: No errors
4. Lint: `npm run lint` - Expected: No new errors

**Storybook Stories** (CRITICAL - Must verify controls work):

**A. Add hollow/line arrow stories to `stories/EdgeStyles.stories.ts`:**

1. **EmptyArrowHead Story**:
   - Args: `styleTemplate: templateCreator({ edgeStyle: { arrowHead: { type: "empty", color: "darkgrey" }, line: { color: "darkgrey" } } })`
   - Controls to include: `["arrowHead.size", "arrowHead.color", "arrowHead.opacity"]`

2. **OpenDotArrowHead Story**:
   - Args: `styleTemplate: templateCreator({ edgeStyle: { arrowHead: { type: "open-dot", color: "darkgrey" }, line: { color: "darkgrey" } } })`
   - Controls to include: `["arrowHead.size", "arrowHead.color"]`

3. **OpenDiamondArrowHead Story**:
   - Args: `styleTemplate: templateCreator({ edgeStyle: { arrowHead: { type: "open-diamond", color: "darkgrey" }, line: { color: "darkgrey" } } })`
   - Controls to include: `["arrowHead.size", "arrowHead.color"]`

4. **TeeArrowHead Story**:
   - Args: `styleTemplate: templateCreator({ edgeStyle: { arrowHead: { type: "tee", color: "darkgrey" }, line: { color: "darkgrey" } } })`
   - Controls to include: `["arrowHead.size", "arrowHead.color"]`

5. **OpenArrowHead Story**:
   - Args: `styleTemplate: templateCreator({ edgeStyle: { arrowHead: { type: "open", color: "darkgrey" }, line: { color: "darkgrey" } } })`
   - Controls to include: `["arrowHead.size", "arrowHead.color"]`

6. **HalfOpenArrowHead Story**:
   - Args: `styleTemplate: templateCreator({ edgeStyle: { arrowHead: { type: "half-open", color: "darkgrey" }, line: { color: "darkgrey" } } })`
   - Controls to include: `["arrowHead.size", "arrowHead.color"]`

7. **VeeArrowHead Story**:
   - Args: `styleTemplate: templateCreator({ edgeStyle: { arrowHead: { type: "vee", color: "darkgrey" }, line: { color: "darkgrey" } } })`
   - Controls to include: `["arrowHead.size", "arrowHead.color"]`

8. **CrowArrowHead Story**:
   - Args: `styleTemplate: templateCreator({ edgeStyle: { arrowHead: { type: "crow", color: "darkgrey" }, line: { color: "darkgrey" } } })`
   - Controls to include: `["arrowHead.size", "arrowHead.color"]`

**B. Create new file `stories/BidirectionalArrows.stories.ts`:**

```typescript
const meta: Meta = {
    title: "Styles/Edge/Bidirectional",
    component: "graphty-element",
    render: renderFn,
    decorators: [eventWaitingDecorator],
    argTypes: {
        arrowHeadSize: {control: {type: "range", min: 0.1, max: 5, step: 0.1}, table: {category: "Head"}, name: "arrowHead.size"},
        arrowHeadColor: {control: "color", table: {category: "Head"}, name: "arrowHead.color"},
        arrowTailSize: {control: {type: "range", min: 0.1, max: 5, step: 0.1}, table: {category: "Tail"}, name: "arrowTail.size"},
        arrowTailColor: {control: "color", table: {category: "Tail"}, name: "arrowTail.color"},
    },
    // Default args with data source
    args: {
        styleTemplate: templateCreator({}),
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/cat-social-network-2.json",
        },
        layout: "ngraph",
        layoutConfig: { seed: 42 },
    },
};
```

Stories in BidirectionalArrows.stories.ts:

1. **BasicBidirectional Story**:
   - Args: Both normal arrows, different colors
   - Controls: `["arrowHead.size", "arrowHead.color", "arrowTail.size", "arrowTail.color"]`

2. **MixedTypes Story**:
   - Args: Normal head, tee tail
   - Controls: Same as above

3. **IndependentSizing Story**:
   - Args: Large head (size: 3.0), small tail (size: 0.5)
   - Controls: Size controls for both

**IMPORTANT - helpers.ts Update**:
Add arrowTail property handling to `stories/helpers.ts` renderFn():
```typescript
} else if (name.startsWith("line.") || name.startsWith("arrowHead.") || name.startsWith("arrowTail.")) {
    // For edge properties (including tail)
    if (t.edgeStyle) {
        deepSet(t, `edgeStyle.${name}`, val);
    } else if (t.layers) {
        deepSet(t, `layers[0].edge.style.${name}`, val);
    }
}
```

**Manual Verification** (Must complete before marking phase done):
1. Start Storybook: `npm run storybook`
2. Verify all 13 arrow types render with distinct shapes
3. For bidirectional stories:
   - Adjust head size/color and verify only head changes
   - Adjust tail size/color and verify only tail changes
   - Verify tail arrow points away from source node
4. Test URL parameters for bidirectional (e.g., `?args=arrowHeadSize:3;arrowTailSize:1`)
5. Take screenshots of all 13 arrow types and 3 bidirectional combinations

---

### Phase 4: Advanced Line Patterns (2 days)

**Objective**: Implement the remaining 4 advanced line patterns (dash-dot, equal-dash, sinewave, zigzag). Basic patterns (solid, dash, dot) are already implemented in CustomLineRenderer's fragment shader. This phase adds geometric patterns that require actual geometry modification.

**Duration**: 2 days (reduced from 4 days - 3/6 patterns already complete)

**Already Complete in Phase 0**:
- ✅ Solid pattern (pattern=0 in fragment shader)
- ✅ Dash pattern (pattern=1, configurable dashLength/gapLength)
- ✅ Dot pattern (pattern=2, uses distance-based discard)

**Remaining Patterns to Implement**:
- ❌ Dash-dot pattern (alternating dashes and dots)
- ❌ Equal-dash pattern (uniform dash/gap lengths)
- ❌ Sinewave pattern (smooth wave along line)
- ❌ Zigzag pattern (angular wave along line)

**Implementation Strategy**:
- Simple patterns (dash-dot, equal-dash): Add to CustomLineRenderer fragment shader
- Geometric patterns (sinewave, zigzag): Modify `CustomLineRenderer.createLineGeometry()` to generate wavy point paths

**Tests to Write First**:

- `test/meshes/LinePatterns.test.ts`: Test advanced line pattern generation (solid/dash/dot already tested in CustomLineRenderer.test.ts)
  ```typescript
  describe("Advanced Line Pattern Generation", () => {
    test("dash-dot pattern alternates dashes and dots", () => {
      const points = [new Vector3(0, 0, 0), new Vector3(10, 0, 0)];
      const mesh = CustomLineRenderer.create(
        { points, width: 1.0, color: "#FF0000", pattern: "dash-dot" },
        scene
      );

      assert.exists(mesh);
      // Verify shader has dash-dot pattern uniform set
    });

    test("equal-dash pattern creates uniform dashes", () => {
      const points = [new Vector3(0, 0, 0), new Vector3(10, 0, 0)];
      const mesh = CustomLineRenderer.create(
        { points, width: 1.0, color: "#FF0000", pattern: "equal-dash" },
        scene
      );

      assert.exists(mesh);
      // Verify equal dash/gap sizes in shader uniforms
    });

    test("sinewave pattern creates smooth wave", () => {
      const points = [new Vector3(0, 0, 0), new Vector3(10, 0, 0)];
      const geometry = CustomLineRenderer.createSinewaveGeometry(
        points,
        0.5,  // amplitude
        1.0   // frequency
      );

      // Should have more points than input (for smoothness)
      assert.isTrue(geometry.positions.length > points.length * 3);
      // Verify wave oscillation in positions
    });

    test("zigzag pattern creates angular pattern", () => {
      const points = [new Vector3(0, 0, 0), new Vector3(10, 0, 0)];
      const geometry = CustomLineRenderer.createZigzagGeometry(
        points,
        0.5,  // amplitude
        2.0   // frequency
      );

      // Should have more points than input
      assert.isTrue(geometry.positions.length > points.length * 3);
      // Verify angular changes in positions
    });

    test("patterns scale with edge length", () => {
      const shortEdge = [new Vector3(0, 0, 0), new Vector3(2, 0, 0)];
      const longEdge = [new Vector3(0, 0, 0), new Vector3(20, 0, 0)];

      const shortMesh = CustomLineRenderer.create(
        { points: shortEdge, width: 1.0, color: "#FF0000", pattern: "dash" },
        scene
      );
      const longMesh = CustomLineRenderer.create(
        { points: longEdge, width: 1.0, color: "#FF0000", pattern: "dash" },
        scene
      );

      // Both should render successfully with scaled patterns
      assert.exists(shortMesh);
      assert.exists(longMesh);
    });
  });
  ```

- `test/integration/line-patterns.test.ts`: Integration test
  ```typescript
  describe("Line Patterns Integration", () => {
    test("all line patterns render without errors", async () => {
      const patterns = ["solid", "dash", "dash-dot", "dots", "equal-dash", "sinewave", "zigzag"];

      for (const pattern of patterns) {
        const graph = createTestGraph();
        graph.styleTemplate = templateCreator({
          edgeStyle: { line: { type: pattern } }
        });

        await waitForGraphToSettle(graph);
        assert.equal(graph.edges.length > 0, true);
      }
    });

    test("patterns work with line opacity", async () => {
      const graph = createTestGraph();
      graph.styleTemplate = templateCreator({
        edgeStyle: { line: { type: "dash", opacity: 0.5 } }
      });

      await waitForGraphToSettle(graph);

      // Verify pattern rendered and opacity applied
      const edge = graph.edges[0];
      assert.equal(edge.mesh.visibility, 0.5);
    });
  });
  ```

**Implementation**:

**Strategy Overview**:
1. Shader-based patterns (dash-dot, equal-dash): Extend CustomLineRenderer fragment shader
2. Geometry-based patterns (sinewave, zigzag): Add geometry generation methods to CustomLineRenderer
3. Integration: Update EdgeMesh to pass pattern type to CustomLineRenderer

- `src/meshes/CustomLineRenderer.ts`: Extend fragment shader for new patterns
  ```typescript
  // Update fragment shader to support 6 pattern types:
  // 0=solid, 1=dash, 2=dot, 3=dash-dot, 4=equal-dash, 5=sinewave, 6=zigzag
  Effect.ShadersStore.customLineFragmentShader = `
precision highp float;

varying vec2 vUV;
varying float vDistance;

uniform vec3 color;
uniform float opacity;
uniform float pattern;        // 0-6 for different patterns
uniform float dashLength;
uniform float gapLength;

void main() {
    // Existing patterns (0, 1, 2) stay the same

    if (pattern == 3.0) {
        // Dash-dot pattern
        float cycle = dashLength + gapLength + 0.1 + gapLength;  // dash, gap, dot, gap
        float phase = mod(vDistance, cycle);

        if (phase < dashLength) {
            // In dash
        } else if (phase < dashLength + gapLength) {
            discard;  // First gap
        } else if (phase < dashLength + gapLength + 0.1) {
            // In dot
        } else {
            discard;  // Second gap
        }
    } else if (pattern == 4.0) {
        // Equal-dash (dash and gap have same length)
        float cycle = dashLength * 2.0;
        float phase = mod(vDistance, cycle);
        if (phase > dashLength) {
            discard;
        }
    }
    // Patterns 5 and 6 (sinewave, zigzag) use geometry, not shader discard

    gl_FragColor = vec4(color, opacity);
}
`;
  ```

- `src/meshes/CustomLineRenderer.ts`: Add geometry-based pattern generation
  ```typescript
  /**
   * Generate sinewave geometry along a path
   */
  static createSinewaveGeometry(
    points: Vector3[],
    amplitude: number,
    frequency: number
  ): Vector3[] {
    const result: Vector3[] = [];
    const totalSegments = (points.length - 1);

    for (let segIdx = 0; segIdx < totalSegments; segIdx++) {
      const p0 = points[segIdx];
      const p1 = points[segIdx + 1];
      const segmentDir = p1.subtract(p0);
      const segmentLength = segmentDir.length();
      const tangent = segmentDir.normalize();

      // Perpendicular for wave oscillation
      const perpendicular = new Vector3(-tangent.y, tangent.x, tangent.z);

      // Generate points along this segment with wave
      const pointsPerSegment = Math.ceil(segmentLength * 10);  // 10 points per unit
      for (let i = 0; i <= pointsPerSegment; i++) {
        const t = i / pointsPerSegment;
        const basePoint = p0.add(segmentDir.scale(t));

        // Apply sine wave
        const waveT = (segIdx + t) / totalSegments;
        const offset = Math.sin(waveT * frequency * Math.PI * 2) * amplitude;
        const finalPoint = basePoint.add(perpendicular.scale(offset));

        result.push(finalPoint);
      }
    }

    return result;
  }

  /**
   * Generate zigzag geometry along a path
   */
  static createZigzagGeometry(
    points: Vector3[],
    amplitude: number,
    frequency: number
  ): Vector3[] {
    const result: Vector3[] = [];
    const totalSegments = (points.length - 1);

    for (let segIdx = 0; segIdx < totalSegments; segIdx++) {
      const p0 = points[segIdx];
      const p1 = points[segIdx + 1];
      const segmentDir = p1.subtract(p0);
      const segmentLength = segmentDir.length();
      const tangent = segmentDir.normalize();

      const perpendicular = new Vector3(-tangent.y, tangent.x, tangent.z);

      // Generate zigzag points
      const pointsPerSegment = Math.ceil(frequency * 2);  // Zigzag corners
      for (let i = 0; i <= pointsPerSegment; i++) {
        const t = i / pointsPerSegment;
        const basePoint = p0.add(segmentDir.scale(t));

        // Alternate +/- for zigzag
        const offset = (i % 2 === 0 ? amplitude : -amplitude);
        const finalPoint = basePoint.add(perpendicular.scale(offset));

        result.push(finalPoint);
      }
    }

    return result;
  }
  ```

- `src/meshes/CustomLineRenderer.ts`: Update create() to handle patterns
  ```typescript
  static create(
    options: CustomLineOptions,
    scene: Scene
  ): Mesh {
    this.registerShaders();

    // Generate base points (may be modified for geometric patterns)
    let points = options.points;

    // Apply geometric patterns by modifying points
    if (options.pattern === "sinewave") {
      points = this.createSinewaveGeometry(
        points,
        options.width * 0.5,  // amplitude
        2.0  // frequency
      );
    } else if (options.pattern === "zigzag") {
      points = this.createZigzagGeometry(
        points,
        options.width * 0.5,  // amplitude
        3.0  // frequency
      );
    }

    // Generate geometry from points
    const geometry = this.createLineGeometry(points);

    // Create mesh and shader material (existing code continues...)
    const mesh = new Mesh("custom-line", scene);
    // ... rest of implementation
  }
  ```

- `src/constants/meshConstants.ts`: Add pattern constants
  ```typescript
  export const EDGE_CONSTANTS = {
    // ... existing ...

    // Line pattern parameters
    DASH_LENGTH_MULTIPLIER: 3,
    DASH_GAP_MULTIPLIER: 2,
    DOT_LENGTH_MULTIPLIER: 0.5,
    DOT_GAP_MULTIPLIER: 1.5,
    SINEWAVE_AMPLITUDE_MULTIPLIER: 2,
    SINEWAVE_FREQUENCY_DEFAULT: 0.5,
    ZIGZAG_AMPLITUDE_MULTIPLIER: 2,
    ZIGZAG_FREQUENCY_DEFAULT: 1.0,
  } as const;
  ```

**Dependencies**:
- External: None
- Internal: Phase 1 (line opacity)

**Verification**:
1. Run: `npm test -- LinePatterns.test.ts line-patterns.test.ts`
2. Expected: All line pattern tests pass
3. Build: `npm run build` - Expected: No errors
4. Lint: `npm run lint` - Expected: No new errors

**Storybook Stories** (CRITICAL - Must verify controls work):

Create new file `stories/LinePatterns.stories.ts`:

```typescript
const meta: Meta = {
    title: "Styles/Edge/Line Patterns",
    component: "graphty-element",
    render: renderFn,
    decorators: [eventWaitingDecorator],
    argTypes: {
        lineWidth: {control: {type: "range", min: 0.1, max: 5, step: 0.1}, table: {category: "Line"}, name: "line.width"},
        lineColor: {control: "color", table: {category: "Line"}, name: "line.color"},
        lineOpacity: {control: {type: "range", min: 0, max: 1, step: 0.1}, table: {category: "Line"}, name: "line.opacity"},
    },
    args: {
        styleTemplate: templateCreator({}),
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/cat-social-network-2.json",
        },
        layout: "ngraph",
        layoutConfig: { seed: 42 },
    },
};
```

Stories:

1. **SolidLine Story** (baseline):
   - Args: `styleTemplate: templateCreator({ edgeStyle: { line: { type: "solid", width: 0.5, color: "darkgrey" } } })`
   - Controls to include: `["line.width", "line.color", "line.opacity"]`

2. **DashedLine Story**:
   - Args: `styleTemplate: templateCreator({ edgeStyle: { line: { type: "dash", width: 0.5, color: "darkgrey" } } })`
   - Controls to include: `["line.width", "line.color"]`
   - Verify: Dashes are visible and spacing is proportional to width

3. **DashDotLine Story**:
   - Args: `styleTemplate: templateCreator({ edgeStyle: { line: { type: "dash-dot", width: 0.5, color: "darkgrey" } } })`
   - Controls to include: `["line.width", "line.color"]`
   - Verify: Alternating dash-dot pattern is clear

4. **DottedLine Story**:
   - Args: `styleTemplate: templateCreator({ edgeStyle: { line: { type: "dots", width: 0.5, color: "darkgrey" } } })`
   - Controls to include: `["line.width", "line.color"]`
   - Verify: Dots are evenly spaced

5. **EqualDashLine Story**:
   - Args: `styleTemplate: templateCreator({ edgeStyle: { line: { type: "equal-dash", width: 0.5, color: "darkgrey" } } })`
   - Controls to include: `["line.width", "line.color"]`
   - Verify: Dashes and gaps are equal length

6. **SinewaveLine Story**:
   - Args: `styleTemplate: templateCreator({ edgeStyle: { line: { type: "sinewave", width: 0.5, color: "darkgrey" } } })`
   - Controls to include: `["line.width", "line.color"]`
   - Verify: Smooth wave pattern is visible

7. **ZigzagLine Story**:
   - Args: `styleTemplate: templateCreator({ edgeStyle: { line: { type: "zigzag", width: 0.5, color: "darkgrey" } } })`
   - Controls to include: `["line.width", "line.color"]`
   - Verify: Angular zigzag pattern is clear

8. **PatternsWithArrows Story**:
   - Args: Dashed line with normal arrow head
   - Controls to include: `["line.width", "arrowHead.size"]`
   - Verify: Pattern and arrow both render correctly

**Manual Verification** (Must complete before marking phase done):
1. Start Storybook: `npm run storybook`
2. Navigate to Styles/Edge/Line Patterns section
3. For EACH pattern story:
   - Verify pattern is clearly visible and distinct
   - Adjust line width from 0.1 to 5 and verify pattern scales correctly
   - For patterns on very short edges (if visible), verify no distortion
   - For patterns on very long edges, verify pattern repeats correctly
4. Test that patterns work with arrows (PatternsWithArrows story)
5. Take screenshots of all 7 patterns at width=0.5 and width=2.0

---

### Phase 5: Bezier Curves (3 days)

**Objective**: Implement curved edges using Bezier curves with CustomLineRenderer. CustomLineRenderer's multi-segment geometry support makes bezier implementation straightforward - we just need to generate bezier curve points and pass them to CustomLineRenderer.createLineGeometry().

**Duration**: 3 days (reduced from 4 - CustomLineRenderer simplifies implementation)

**CustomLineRenderer Integration**: Bezier curves will use `CustomLineRenderer.create({ points: bezierPoints, ... })` where bezierPoints is an array of Vector3 points along the bezier curve. The existing quad-strip geometry generation in CustomLineRenderer already supports multi-segment paths.

**Tests to Write First**:

- `test/meshes/BezierCurves.test.ts`: Test bezier generation
  ```typescript
  describe("Bezier Curve Generation", () => {
    test("generates smooth curve between two points", () => {
      const src = new Vector3(0, 0, 0);
      const dst = new Vector3(10, 0, 0);

      const curvePoints = EdgeMesh.createBezierLine(src, dst);

      // Should have more points than straight line
      assert.isTrue(curvePoints.length > 6); // More than [src, dst]

      // First and last points should match input
      assert.closeTo(curvePoints[0], src.x, 0.01);
      assert.closeTo(curvePoints[curvePoints.length - 3], dst.x, 0.01);
    });

    test("automatic control points create natural curve", () => {
      const src = new Vector3(0, 0, 0);
      const dst = new Vector3(10, 10, 0);

      const curvePoints = EdgeMesh.createBezierLine(src, dst);

      // Curve should deviate from straight line
      const midIdx = Math.floor(curvePoints.length / 2 / 3) * 3;
      const midPoint = new Vector3(
        curvePoints[midIdx],
        curvePoints[midIdx + 1],
        curvePoints[midIdx + 2]
      );

      const straightMid = Vector3.Lerp(src, dst, 0.5);

      // Midpoint should not be on straight line
      assert.notCloseTo(midPoint.y, straightMid.y, 0.1);
    });

    test("point density creates smooth curves", () => {
      const src = new Vector3(0, 0, 0);
      const dst = new Vector3(100, 0, 0); // Long edge

      const curvePoints = EdgeMesh.createBezierLine(src, dst);

      // Should have density proportional to edge length
      const expectedPoints = 100 * EDGE_CONSTANTS.BEZIER_POINT_DENSITY;
      assert.closeTo(curvePoints.length / 3, expectedPoints, expectedPoints * 0.2);
    });

    test("handles very short edges gracefully", () => {
      const src = new Vector3(0, 0, 0);
      const dst = new Vector3(0.1, 0, 0); // Very short

      const curvePoints = EdgeMesh.createBezierLine(src, dst);

      // Should still generate valid curve
      assert.isTrue(curvePoints.length >= 6);
    });
  });
  ```

- `test/Edge.bezier.test.ts`: Integration test
  ```typescript
  describe("Bezier Edge Rendering", () => {
    test("edge renders as curve when bezier enabled", () => {
      const style = {
        line: { bezier: true, width: 0.5, color: "#FF0000" },
        enabled: true
      };

      const edge = createTestEdge(style);
      edge.update();

      // Verify edge mesh uses curved points
      assert.exists(edge.mesh);
      // Add specific curve verification
    });

    test("arrow positioning works on curved edges", () => {
      const style = {
        arrowHead: { type: "normal" },
        line: { bezier: true, width: 0.5 },
        enabled: true
      };

      const edge = createTestEdge(style);
      edge.update();

      // Arrow should position at end of curve, not straight line
      assert.exists(edge.arrowMesh);
      // Verify arrow position follows curve
    });

    test("patterns work on bezier curves", () => {
      const style = {
        line: { type: "dash", bezier: true, width: 0.5 },
        enabled: true
      };

      const edge = createTestEdge(style);
      edge.update();

      // Dash pattern should follow curve
      assert.exists(edge.mesh);
    });

    test("self-loops render as curves", () => {
      // Create edge where source === destination
      const selfLoopEdge = createSelfLoopEdge();
      selfLoopEdge.update();

      // Should render as loop, not straight line
      assert.exists(selfLoopEdge.mesh);
      // Verify loop geometry
    });
  });
  ```

**Implementation**:

- `src/meshes/EdgeMesh.ts`: Add bezier curve generation
  ```typescript
  // Add to create() method:
  static create(
    cache: MeshCache,
    options: EdgeMeshOptions,
    style: EdgeStyleConfig,
    scene: Scene,
    srcPoint?: Vector3,  // NEW: Optional override for bezier
    dstPoint?: Vector3,  // NEW: Optional override for bezier
  ): AbstractMesh {
    const cacheKey = `edge-style-${options.styleId}`;

    return cache.get(cacheKey, () => {
      // Determine base points
      let basePoints: number[];

      if (style.line?.bezier && srcPoint && dstPoint) {
        // Generate bezier curve
        basePoints = this.createBezierLine(srcPoint, dstPoint);
      } else {
        basePoints = this.UNIT_VECTOR_POINTS;
      }

      // Apply line pattern if specified
      if (style.line?.type && style.line.type !== "solid") {
        basePoints = this.applyLinePattern(basePoints, style.line.type, options.width);
      }

      // Create line
      if (style.line?.animationSpeed) {
        return this.createAnimatedLine(options, style, scene, basePoints);
      }

      return this.createStaticLine(options, scene, basePoints, style);
    });
  }

  // Bezier curve generation
  static createBezierLine(
    srcPoint: Vector3,
    dstPoint: Vector3,
    controlPoints?: Vector3[]
  ): number[] {
    // Handle self-loops (source === destination)
    if (srcPoint.equalsWithEpsilon(dstPoint, 0.01)) {
      return this.createSelfLoopCurve(srcPoint);
    }

    // Calculate automatic control points if not provided
    const controls = controlPoints || this.calculateControlPoints(srcPoint, dstPoint);

    // Determine point density based on curve length
    const estimatedLength = Vector3.Distance(srcPoint, dstPoint) * 1.5; // Curve is ~1.5x longer
    const numPoints = Math.max(
      10,
      Math.ceil(estimatedLength * EDGE_CONSTANTS.BEZIER_POINT_DENSITY)
    );

    const points: number[] = [];

    // Generate cubic Bezier curve points
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const point = this.cubicBezier(t, srcPoint, controls[0], controls[1], dstPoint);
      points.push(point.x, point.y, point.z);
    }

    return points;
  }

  // Calculate automatic control points for natural curve
  private static calculateControlPoints(src: Vector3, dst: Vector3): [Vector3, Vector3] {
    const direction = dst.subtract(src);
    const distance = direction.length();
    const perpendicular = new Vector3(-direction.y, direction.x, direction.z).normalize();

    // Offset control points perpendicular to line
    const offset = distance * EDGE_CONSTANTS.BEZIER_CONTROL_POINT_OFFSET;

    const midPoint = Vector3.Lerp(src, dst, 0.5);
    const control1 = Vector3.Lerp(src, midPoint, 0.5).add(perpendicular.scale(offset));
    const control2 = Vector3.Lerp(midPoint, dst, 0.5).add(perpendicular.scale(offset));

    return [control1, control2];
  }

  // Cubic Bezier formula
  private static cubicBezier(
    t: number,
    p0: Vector3,
    p1: Vector3,
    p2: Vector3,
    p3: Vector3
  ): Vector3 {
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;

    return p0.scale(uuu)
      .add(p1.scale(3 * uu * t))
      .add(p2.scale(3 * u * tt))
      .add(p3.scale(ttt));
  }

  // Self-loop curve (circular arc)
  private static createSelfLoopCurve(center: Vector3): number[] {
    const radius = 2.0; // Loop radius
    const segments = 32; // Smooth circle
    const points: number[] = [];

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = center.x + Math.cos(angle) * radius;
      const y = center.y + Math.sin(angle) * radius;
      const z = center.z;
      points.push(x, y, z);
    }

    return points;
  }
  ```

- `src/Edge.ts`: Update to use bezier when configured
  ```typescript
  update(): void {
    const lnk = this.context.getLayoutManager().layoutEngine?.getEdgePosition(this);
    if (!lnk) {
      return;
    }

    const style = Styles.getStyleForEdgeStyleId(this.styleId);

    // Get edge endpoints (accounting for arrows)
    const {srcPoint, dstPoint} = this.transformArrowCap();

    const finalSrcPoint = srcPoint || new Vector3(lnk.src.x, lnk.src.y, lnk.src.z);
    const finalDstPoint = dstPoint || new Vector3(lnk.dst.x, lnk.dst.y, lnk.dst.z);

    // If bezier is enabled, recreate mesh with bezier curve
    if (style.line?.bezier) {
      // Dispose old mesh if exists
      if (this.mesh && !this.mesh.isDisposed()) {
        this.mesh.dispose();
      }

      // Create new bezier mesh
      this.mesh = EdgeMesh.create(
        this.context.getMeshCache(),
        {
          styleId: `${String(this.styleId)}-bezier`,
          width: style.line?.width ?? 0.25,
          color: style.line?.color ?? "#FFFFFF",
        },
        style,
        this.context.getScene(),
        finalSrcPoint,
        finalDstPoint,
      );

      this.mesh.isPickable = false;
      this.mesh.metadata = { parentEdge: this };
    } else {
      // Standard straight line
      this.transformEdgeMesh(finalSrcPoint, finalDstPoint);
    }

    // Update label position if exists
    if (this.label) {
      const midPoint = new Vector3(
        (lnk.src.x + lnk.dst.x) / 2,
        (lnk.src.y + lnk.dst.y) / 2,
        ((lnk.src.z ?? 0) + (lnk.dst.z ?? 0)) / 2,
      );
      this.label.attachTo(midPoint, "center", 0);
    }
  }
  ```

- `src/constants/meshConstants.ts`: Add bezier constants
  ```typescript
  export const EDGE_CONSTANTS = {
    // ... existing ...

    // Bezier curve parameters
    BEZIER_CONTROL_POINT_OFFSET: 0.3,
    BEZIER_POINT_DENSITY: 20,
  } as const;
  ```

**Dependencies**:
- External: None
- Internal: Phase 1-4 (patterns should work on bezier curves)

**Verification**:
1. Run: `npm test -- BezierCurves.test.ts Edge.bezier.test.ts`
2. Expected: Bezier tests pass, curves render smoothly
3. Build: `npm run build` - Expected: No errors
4. Lint: `npm run lint` - Expected: No new errors

**Storybook Stories** (CRITICAL - Must verify controls work):

**A. Create new file `stories/BezierEdges.stories.ts`:**

```typescript
const meta: Meta = {
    title: "Styles/Edge/Bezier Curves",
    component: "graphty-element",
    render: renderFn,
    decorators: [eventWaitingDecorator],
    argTypes: {
        bezierEnabled: {control: "boolean", table: {category: "Bezier"}, name: "line.bezier"},
        lineWidth: {control: {type: "range", min: 0.1, max: 5, step: 0.1}, table: {category: "Line"}, name: "line.width"},
        arrowSize: {control: {type: "range", min: 0.1, max: 5, step: 0.1}, table: {category: "Arrow"}, name: "arrowHead.size"},
    },
    args: {
        styleTemplate: templateCreator({}),
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/cat-social-network-2.json",
        },
        layout: "ngraph",
        layoutConfig: { seed: 42 },
    },
};
```

Stories:

1. **StraightVsCurved Story**:
   - Args: Side-by-side comparison with bezier toggle
   - Controls to include: `["line.bezier", "line.width"]`
   - Verify: Toggle switches between straight and curved

2. **BezierWithArrows Story**:
   - Args: `styleTemplate: templateCreator({ edgeStyle: { line: { bezier: true, width: 0.5, color: "darkgrey" }, arrowHead: { type: "normal", color: "darkgrey" } } })`
   - Controls to include: `["arrowHead.size", "line.width"]`
   - Verify: Arrow follows curve end point and orientation

3. **BezierWithPatterns Story**:
   - Args: `styleTemplate: templateCreator({ edgeStyle: { line: { bezier: true, type: "dash", width: 0.5, color: "darkgrey" } } })`
   - Controls to include: `["line.width"]`
   - Verify: Dash pattern follows curve path

4. **BezierBidirectional Story**:
   - Args: Bezier curve with both arrow head and tail
   - Controls to include: `["arrowHead.size", "arrowTail.size"]`
   - Verify: Both arrows correctly positioned/oriented on curve

**B. Create new file `stories/SelfLoops.stories.ts`:**

```typescript
const meta: Meta = {
    title: "Styles/Edge/Self-Loops",
    component: "graphty-element",
    render: renderFn,
    decorators: [eventWaitingDecorator],
    argTypes: {
        arrowSize: {control: {type: "range", min: 0.1, max: 5, step: 0.1}, table: {category: "Arrow"}, name: "arrowHead.size"},
        lineWidth: {control: {type: "range", min: 0.1, max: 5, step: 0.1}, table: {category: "Line"}, name: "line.width"},
    },
    args: {
        // Need custom data with self-loop edges
        styleTemplate: templateCreator({}),
        nodeData: [{ id: "A" }, { id: "B" }],
        edgeData: [{ src: "A", dst: "A" }, { src: "A", dst: "B" }], // Self-loop on A
        layout: "circular",
    },
};
```

Stories:

1. **BasicSelfLoop Story**:
   - Args: Simple self-loop with arrow
   - Controls to include: `["arrowHead.size", "line.width"]`
   - Verify: Loop forms circle/arc, arrow points correctly

2. **SelfLoopWithPatterns Story**:
   - Args: Self-loop with dashed line
   - Controls to include: `["line.width"]`
   - Verify: Pattern follows loop path

3. **MultipleSelfLoops Story**:
   - Args: Graph with several self-loops
   - Verify: Each loop renders without overlap

**IMPORTANT - helpers.ts Update**:
Add bezier boolean handling to `stories/helpers.ts` renderFn() if needed (should work with existing edge property handling).

**Manual Verification** (Must complete before marking phase done):
1. Start Storybook: `npm run storybook`
2. Bezier stories:
   - Toggle bezier on/off and verify smooth curve vs straight line
   - Verify curves are smooth (no jagged edges)
   - Adjust line width and verify curve thickness changes
   - Verify arrows point in correct direction at curve ends
3. Self-loop stories:
   - Verify loops form complete circles/arcs
   - Verify arrows point correctly (typically into the node)
   - Verify patterns follow loop curvature
4. Test combinations:
   - Bezier + dash pattern
   - Bezier + bidirectional arrows
   - Bezier + opacity
5. Take screenshots of: straight vs curved, bezier with arrows, self-loops

---

### Phase 6: Tooltips & Arrow Text (3 days)

**Objective**: Add hover tooltips for edges and text labels on arrow heads/tails. This enables rich annotation of graph edges.

**Duration**: 3 days

**Tests to Write First**:

- `test/Edge.tooltip.test.ts`: Test tooltip functionality
  ```typescript
  describe("Edge Tooltips", () => {
    test("tooltip is created when configured", () => {
      const style = {
        tooltip: { enabled: true, text: "Test tooltip" },
        enabled: true
      };

      const edge = createTestEdge(style);

      assert.exists(edge.tooltip);
    });

    test("tooltip shows on hover", async () => {
      const edge = createTestEdgeWithTooltip();

      // Simulate hover
      edge.mesh.onPointerEnterObservable.notifyObservers(/* pointer info */);

      // Wait for tooltip to appear
      await waitForCondition(() => edge.tooltip?.isVisible);

      assert.isTrue(edge.tooltip?.isVisible);
    });

    test("tooltip hides when not hovering", async () => {
      const edge = createTestEdgeWithTooltip();

      // Show tooltip
      edge.mesh.onPointerEnterObservable.notifyObservers(/* pointer info */);
      await waitForCondition(() => edge.tooltip?.isVisible);

      // Hide tooltip
      edge.mesh.onPointerOutObservable.notifyObservers(/* pointer info */);
      await waitForCondition(() => !edge.tooltip?.isVisible);

      assert.isFalse(edge.tooltip?.isVisible);
    });

    test("tooltip text supports JMESPath queries", () => {
      const edgeData = { weight: 5, type: "dependency" };
      const style = {
        tooltip: { enabled: true, textPath: "weight" },
        enabled: true
      };

      const edge = createTestEdge(style, edgeData);

      // Verify tooltip text extracted from data
      assert.equal(edge.tooltip?.text, "5");
    });
  });
  ```

- `test/Edge.arrowText.test.ts`: Test arrow text labels
  ```typescript
  describe("Arrow Text Labels", () => {
    test("arrow head label is created when configured", () => {
      const style = {
        arrowHead: {
          type: "normal",
          text: { text: "→", fontSize: 12, color: "#FFFFFF" }
        },
        enabled: true
      };

      const edge = createTestEdge(style);

      assert.exists(edge.arrowHeadLabel);
    });

    test("arrow tail label is created when configured", () => {
      const style = {
        arrowTail: {
          type: "normal",
          text: { text: "←", fontSize: 12, color: "#FFFFFF" }
        },
        enabled: true
      };

      const edge = createTestEdge(style);

      assert.exists(edge.arrowTailLabel);
    });

    test("arrow labels position near arrow heads", () => {
      const edge = createTestEdgeWithArrowLabels();
      edge.update();

      // Label should be close to arrow mesh position
      const distance = Vector3.Distance(
        edge.arrowHeadLabel.position,
        edge.arrowMesh.position
      );

      assert.isTrue(distance < 2.0); // Within reasonable range
    });

    test("arrow labels update when edge moves", () => {
      const edge = createTestEdgeWithArrowLabels();

      edge.update();
      const initialPos = edge.arrowHeadLabel.position.clone();

      // Move nodes
      edge.srcNode.mesh.position.x += 5;
      edge.update();

      // Label should have moved
      assert.notEqual(edge.arrowHeadLabel.position.x, initialPos.x);
    });
  });
  ```

**Implementation**:

- `src/Edge.ts`: Add tooltip and arrow text properties
  ```typescript
  export class Edge {
    // ... existing properties ...

    arrowHeadLabel: RichTextLabel | null = null;
    arrowTailLabel: RichTextLabel | null = null;
    tooltip: RichTextLabel | null = null;
    private tooltipVisible = false;

    constructor(/* ... */) {
      // ... existing code ...

      // Create arrow head label if configured
      if (style.arrowHead?.text) {
        this.arrowHeadLabel = this.createArrowText(style.arrowHead.text);
      }

      // Create arrow tail label if configured
      if (style.arrowTail?.text) {
        this.arrowTailLabel = this.createArrowText(style.arrowTail.text);
      }

      // Create tooltip if configured
      if (style.tooltip?.enabled) {
        this.tooltip = this.createTooltip(style);
        this.setupTooltipHandlers();
      }
    }

    private createArrowText(textConfig: RichTextStyle): RichTextLabel {
      const labelText = this.extractLabelText(textConfig);

      const labelOptions: RichTextLabelOptions = {
        text: labelText,
        fontSize: textConfig.fontSize ?? 12,
        color: textConfig.color ?? "#FFFFFF",
        backgroundColor: textConfig.backgroundColor,
        attachPosition: "center",
        attachOffset: 0.5, // Slight offset from arrow
      };

      return new RichTextLabel(this.context.getScene(), labelOptions);
    }

    private createTooltip(styleConfig: EdgeStyleConfig): RichTextLabel {
      const tooltipText = this.extractLabelText(styleConfig.tooltip);

      const tooltipOptions: RichTextLabelOptions = {
        text: tooltipText,
        fontSize: styleConfig.tooltip?.fontSize ?? 14,
        color: styleConfig.tooltip?.color ?? "#000000",
        backgroundColor: styleConfig.tooltip?.backgroundColor ?? "#FFFFFF",
        attachPosition: "top",
        attachOffset: 1.0,
        borders: [{ width: 1, color: "#CCCCCC", spacing: 4 }],
      };

      const tooltip = new RichTextLabel(this.context.getScene(), tooltipOptions);
      tooltip.mesh.isVisible = false; // Initially hidden

      return tooltip;
    }

    private setupTooltipHandlers(): void {
      if (!this.tooltip) return;

      // Show tooltip on pointer enter
      this.mesh.onPointerEnterObservable.add(() => {
        if (this.tooltip) {
          this.tooltip.mesh.isVisible = true;
          this.tooltipVisible = true;
        }
      });

      // Hide tooltip on pointer out
      this.mesh.onPointerOutObservable.add(() => {
        if (this.tooltip) {
          this.tooltip.mesh.isVisible = false;
          this.tooltipVisible = false;
        }
      });
    }

    update(): void {
      // ... existing update code ...

      // Update arrow head label position
      if (this.arrowHeadLabel && this.arrowMesh) {
        const arrowPos = this.arrowMesh.position;
        this.arrowHeadLabel.attachTo(arrowPos, "top", 0.5);
      }

      // Update arrow tail label position
      if (this.arrowTailLabel && this.arrowTailMesh) {
        const tailPos = this.arrowTailMesh.position;
        this.arrowTailLabel.attachTo(tailPos, "bottom", 0.5);
      }

      // Update tooltip position (if visible)
      if (this.tooltip && this.tooltipVisible) {
        const lnk = this.context.getLayoutManager().layoutEngine?.getEdgePosition(this);
        if (lnk) {
          const midPoint = new Vector3(
            (lnk.src.x + lnk.dst.x) / 2,
            (lnk.src.y + lnk.dst.y) / 2,
            ((lnk.src.z ?? 0) + (lnk.dst.z ?? 0)) / 2,
          );
          this.tooltip.attachTo(midPoint, "top", 1.0);
        }
      }
    }

    updateStyle(styleId: EdgeStyleId): void {
      // ... existing code ...

      // Update arrow labels
      if (this.arrowHeadLabel) {
        this.arrowHeadLabel.dispose();
        this.arrowHeadLabel = null;
      }
      if (style.arrowHead?.text) {
        this.arrowHeadLabel = this.createArrowText(style.arrowHead.text);
      }

      if (this.arrowTailLabel) {
        this.arrowTailLabel.dispose();
        this.arrowTailLabel = null;
      }
      if (style.arrowTail?.text) {
        this.arrowTailLabel = this.createArrowText(style.arrowTail.text);
      }

      // Update tooltip
      if (this.tooltip) {
        this.tooltip.dispose();
        this.tooltip = null;
      }
      if (style.tooltip?.enabled) {
        this.tooltip = this.createTooltip(style);
        this.setupTooltipHandlers();
      }
    }

    // Ensure cleanup in dispose
    dispose(): void {
      if (this.arrowHeadLabel) {
        this.arrowHeadLabel.dispose();
      }
      if (this.arrowTailLabel) {
        this.arrowTailLabel.dispose();
      }
      if (this.tooltip) {
        this.tooltip.dispose();
      }
      // ... existing dispose code ...
    }
  }
  ```

**Dependencies**:
- External: None (uses existing RichTextLabel)
- Internal: All previous phases (tooltips/text work with all features)

**Verification**:
1. Run: `npm test -- Edge.tooltip.test.ts Edge.arrowText.test.ts`
2. Expected: Tooltip and arrow text tests pass
3. Build: `npm run build` - Expected: No errors
4. Lint: `npm run lint` - Expected: No new errors

**Storybook Stories** (CRITICAL - Must verify controls work):

**A. Create new file `stories/EdgeTooltips.stories.ts`:**

```typescript
const meta: Meta = {
    title: "Styles/Edge/Tooltips",
    component: "graphty-element",
    render: renderFn,
    decorators: [eventWaitingDecorator],
    argTypes: {
        tooltipEnabled: {control: "boolean", table: {category: "Tooltip"}, name: "tooltip.enabled"},
        tooltipText: {control: "text", table: {category: "Tooltip"}, name: "tooltip.text"},
        tooltipFontSize: {control: {type: "range", min: 8, max: 24, step: 1}, table: {category: "Tooltip"}, name: "tooltip.fontSize"},
    },
    args: {
        styleTemplate: templateCreator({}),
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/cat-social-network-2.json",
        },
        layout: "ngraph",
        layoutConfig: { seed: 42 },
    },
};
```

Stories:

1. **BasicTooltip Story**:
   - Args: `styleTemplate: templateCreator({ edgeStyle: { tooltip: { enabled: true, text: "Edge tooltip", fontSize: 14, color: "#000000", backgroundColor: "#FFFFFF" }, line: { color: "darkgrey" } } })`
   - Controls to include: `["tooltip.enabled", "tooltip.text", "tooltip.fontSize"]`
   - Verify: Hover over edge shows tooltip with correct text

2. **TooltipWithData Story**:
   - Args: Tooltip using JMESPath to show edge data (e.g., weight)
   - Controls to include: `["tooltip.enabled"]`
   - Verify: Tooltip shows dynamic data from edge

3. **StyledTooltip Story**:
   - Args: Tooltip with custom background, borders
   - Controls to include: `["tooltip.fontSize", "tooltip.color"]`
   - Verify: Tooltip styling applies correctly

**B. Create new file `stories/ArrowText.stories.ts`:**

```typescript
const meta: Meta = {
    title: "Styles/Edge/Arrow Text",
    component: "graphty-element",
    render: renderFn,
    decorators: [eventWaitingDecorator],
    argTypes: {
        arrowHeadText: {control: "text", table: {category: "Head"}, name: "arrowHead.text.text"},
        arrowHeadFontSize: {control: {type: "range", min: 8, max: 24, step: 1}, table: {category: "Head"}, name: "arrowHead.text.fontSize"},
        arrowTailText: {control: "text", table: {category: "Tail"}, name: "arrowTail.text.text"},
        arrowTailFontSize: {control: {type: "range", min: 8, max: 24, step: 1}, table: {category: "Tail"}, name: "arrowTail.text.fontSize"},
    },
    args: {
        styleTemplate: templateCreator({}),
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/cat-social-network-2.json",
        },
        layout: "ngraph",
        layoutConfig: { seed: 42 },
    },
};
```

Stories:

1. **ArrowHeadText Story**:
   - Args: `styleTemplate: templateCreator({ edgeStyle: { arrowHead: { type: "normal", text: { text: "→", fontSize: 14, color: "#FFFFFF" }, color: "darkgrey" }, line: { color: "darkgrey" } } })`
   - Controls to include: `["arrowHead.text.text", "arrowHead.text.fontSize"]`
   - Verify: Text appears near arrow head, changes with controls

2. **ArrowTailText Story**:
   - Args: `styleTemplate: templateCreator({ edgeStyle: { arrowTail: { type: "normal", text: { text: "←", fontSize: 14, color: "#FFFFFF" }, color: "darkgrey" }, line: { color: "darkgrey" } } })`
   - Controls to include: `["arrowTail.text.text", "arrowTail.text.fontSize"]`
   - Verify: Text appears near arrow tail

3. **BidirectionalWithText Story**:
   - Args: Both arrow head and tail with different text labels
   - Controls to include: `["arrowHead.text.text", "arrowTail.text.text"]`
   - Verify: Both labels visible and positioned correctly

4. **ArrowTextWithData Story**:
   - Args: Arrow text using JMESPath to show edge data
   - Verify: Labels show dynamic data

**IMPORTANT - helpers.ts Update**:
Add tooltip and text property handling to `stories/helpers.ts` renderFn():
```typescript
} else if (name.startsWith("line.") || name.startsWith("arrowHead.") || name.startsWith("arrowTail.") || name.startsWith("tooltip.")) {
    // For edge properties (including tooltip)
    if (t.edgeStyle) {
        deepSet(t, `edgeStyle.${name}`, val);
    } else if (t.layers) {
        deepSet(t, `layers[0].edge.style.${name}`, val);
    }
}
```

**Manual Verification** (Must complete before marking phase done):
1. Start Storybook: `npm run storybook`
2. Tooltip stories:
   - Hover over edges and verify tooltip appears
   - Move mouse away and verify tooltip disappears
   - Change tooltip text control and verify text updates on next hover
   - Change font size and verify tooltip size changes
3. Arrow text stories:
   - Verify text labels are visible near arrows
   - Change text content and verify labels update
   - Change font size and verify text scales
   - For bidirectional, verify both labels are distinct and positioned correctly
4. Test combinations:
   - Tooltips + arrow text (both should work)
   - Tooltips on bezier curves
   - Arrow text on different arrow types
5. Take screenshots of: tooltip on hover, arrow head text, bidirectional text labels

---

### Phase 7: Polish & Documentation (2 days)

**Objective**: Ensure production readiness through performance optimization, edge case handling, comprehensive documentation, and final testing.

**Duration**: 2 days

**Tasks**:

1. **Performance Optimization**:
   - Profile geometry generation for all arrow types and line patterns
   - Optimize bezier point density algorithm
   - Review mesh cache hit rates
   - Set performance budgets and add monitoring

2. **Edge Case Handling**:
   - Test and fix very short edges (< 1 unit)
   - Test and fix very long edges (> 100 units)
   - Handle zero-width lines gracefully
   - Handle opacity edge cases (0.0, 1.0)
   - Test self-loops with all arrow types
   - Test overlapping nodes

3. **Documentation**:
   - Update CLAUDE.md with all new features
   - Add JSDoc comments to all new methods
   - Create comprehensive Storybook examples
   - Document pattern parameters and constants
   - Create migration guide for users upgrading

4. **Final Testing**:
   - Run full test suite: `npm run test:all`
   - Visual regression test validation
   - Cross-browser testing (Chrome, Firefox, Safari)
   - Performance testing with large graphs (1000+ edges)
   - Manual testing of all feature combinations

**Tests to Write**:

- `test/edge-cases/EdgeCases.test.ts`: Edge case handling
  ```typescript
  describe("Edge Case Handling", () => {
    test("very short edges render correctly", () => {
      const graph = createTestGraph();
      // Create nodes very close together
      // Verify edges render without artifacts
    });

    test("very long edges render correctly", () => {
      const graph = createTestGraph();
      // Create nodes far apart
      // Verify patterns scale appropriately
    });

    test("self-loops work with all arrow types", () => {
      const arrowTypes = ["normal", "inverted", "dot", /* ... all types */];
      // Test each type on self-loop
    });

    test("zero opacity makes edges invisible", () => {
      const edge = createTestEdge({
        line: { opacity: 0.0 },
        arrowHead: { type: "normal", opacity: 0.0 }
      });

      assert.equal(edge.mesh.visibility, 0.0);
      assert.equal(edge.arrowMesh.visibility, 0.0);
    });

    test("patterns don't break on very short edges", () => {
      const style = { line: { type: "dash", width: 0.5 }, enabled: true };
      const edge = createVeryShortEdge(style);

      // Should fall back to solid or minimal pattern
      assert.exists(edge.mesh);
    });
  });
  ```

- `test/performance/EdgePerformance.test.ts`: Performance benchmarks
  ```typescript
  describe("Edge Rendering Performance", () => {
    test("1000 edges render in < 3 seconds", async () => {
      const startTime = performance.now();

      const graph = createGraphWith1000Edges();
      await waitForGraphToSettle(graph);

      const endTime = performance.now();
      const duration = endTime - startTime;

      assert.isTrue(duration < 3000, `Rendering took ${duration}ms`);
    });

    test("bezier generation completes in < 15ms per edge", () => {
      const src = new Vector3(0, 0, 0);
      const dst = new Vector3(100, 0, 0);

      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        EdgeMesh.createBezierLine(src, dst);
      }

      const endTime = performance.now();
      const avgTime = (endTime - startTime) / 100;

      assert.isTrue(avgTime < 15, `Bezier generation took ${avgTime}ms`);
    });

    test("mesh cache hit rate > 90%", () => {
      const graph = createGraphWith100Edges();
      // All edges use same style

      const cacheStats = graph.meshCache.getStats();
      const hitRate = cacheStats.hits / (cacheStats.hits + cacheStats.misses);

      assert.isTrue(hitRate > 0.9, `Cache hit rate: ${hitRate}`);
    });
  });
  ```

**Implementation**:

- `CLAUDE.md`: Update with new features
  ```markdown
  ## Edge Styling Capabilities

  ### Arrow Types
  Graphty-element supports 13 arrow types:
  - `normal` - Standard filled triangle
  - `inverted` - Reversed triangle
  - `dot` - Filled circle
  - `open-dot` - Hollow circle
  - ... (all 13 types)

  ### Arrow Properties
  - `size`: Arrow size multiplier (default: 1.0)
  - `color`: Arrow-specific color
  - `opacity`: Arrow transparency (0.0-1.0)
  - `text`: Text label on arrow

  ### Line Patterns
  - `solid` - Standard line
  - `dash` - Dashed pattern
  - ... (all 7 patterns)

  ### Bezier Curves
  Enable curved edges with `line.bezier: true`

  ### Tooltips
  Add hover tooltips with `tooltip.enabled: true`

  ## Performance Tuning

  ### Recommendations
  - Reuse edge styles for better cache performance
  - Limit bezier curves to < 500 edges
  - Use simpler arrow types for large graphs
  - Disable glow effects for > 200 edges

  ### Performance Budgets
  - Edge rendering: < 3s for 1000 edges
  - Bezier generation: < 15ms per edge
  - Cache hit rate: > 90%
  ```

- Update all JSDoc comments
- Create Storybook documentation pages
- Write migration guide

**Dependencies**:
- External: None
- Internal: All previous phases

**Verification**:
1. Run: `npm run test:all`
2. Expected: All tests pass, coverage > 80%
3. Run: `npm run lint`
4. Expected: No errors
5. Run: `npm run build`
6. Expected: Build succeeds, bundle size increase < 10%
7. Run: `npm run storybook`
8. Expected: All stories work, documentation complete

---

## Summary: Impact of CustomLineRenderer on Implementation

The completion of **Phase 0: CustomLineRenderer** has fundamentally changed this implementation plan in several important ways:

### Time Savings: 4.5 Days Reduction
- **Phase 0**: Completed (CustomLineRenderer implementation)
- **Phase 1**: Reduced from 2 days → 1.5 days (line opacity already complete)
- **Phase 4**: Reduced from 4 days → 2 days (3/6 patterns already complete)
- **Phase 5**: Reduced from 4 days → 3 days (multi-segment geometry support ready)
- **Total reduction**: 4.5 days saved from original 20-25 day estimate

### Architecture Benefits

**1. Unified Line Rendering**
- All line rendering now uses CustomLineRenderer's quad-strip geometry and screen-space shaders
- Consistent rendering behavior across all edge types
- Screen-space width ensures consistent pixel width at all camera angles

**2. Pattern Support Built-In**
- ✅ Solid, dash, dot patterns working via fragment shader discard
- ❌ Dash-dot, equal-dash need fragment shader extension
- ❌ Sinewave, zigzag need geometry modification

**3. Performance Optimizations**
- Full BabylonJS mesh instancing support (required `finalWorld` matrix)
- Proper bounding box calculation for frustum culling
- Property-based tests validating all geometry invariants

**4. Bezier Curve Foundation**
- `CustomLineRenderer.createLineGeometry()` already supports multi-point paths
- Bezier implementation just needs to generate curve points
- No special-case geometry code needed

### Implementation Strategy

**Shader-based patterns** (dash, dot, dash-dot, equal-dash):
- Modify fragment shader to discard pixels based on distance along line
- No geometry changes needed
- Efficient and performant

**Geometry-based patterns** (sinewave, zigzag, bezier):
- Generate modified point arrays
- Pass to `CustomLineRenderer.create({ points: modifiedPoints, ... })`
- Leverage existing quad-strip geometry generation

**Arrow heads**:
- Remain separate from line rendering (can use GreasedLine or custom shaders)
- Position at line endpoints using existing logic
- Consider future integration with CustomLineRenderer shaders

### What Remains

**Critical Path**:
1. Phase 1: Arrow property support (size, color, opacity)
2. Phases 2-3: Arrow shape implementations (11 new types)
3. Phase 4: Advanced patterns (4 remaining patterns)
4. Phase 5: Bezier curves (point generation + CustomLineRenderer integration)
5. Phases 6-7: Tooltips, polish, documentation

**Reduced Scope**:
- Line opacity ✅ Complete
- Basic patterns (solid/dash/dot) ✅ Complete
- Screen-space rendering ✅ Complete
- Mesh instancing support ✅ Complete

---

## Common Utilities Needed

### Geometry Utilities
**Location**: `src/utils/geometryUtils.ts`

**Purpose**: Shared geometric calculations used across arrow and line generation

```typescript
export class GeometryUtils {
  // Calculate distance along path
  static calculatePathLength(points: number[]): number

  // Get point at specific distance
  static getPointAtDistance(points: number[], distance: number): Vector3

  // Get tangent at distance
  static getTangentAtDistance(points: number[], distance: number): Vector3

  // Interpolate segment
  static interpolateSegment(points: number[], start: number, end: number): number[]

  // Perpendicular vector
  static getPerpendicular(direction: Vector3): Vector3
}
```

**Used by**:
- Line pattern generation (Phase 4)
- Bezier curve generation (Phase 5)
- Arrow positioning calculations (Phase 2-3)

### Pattern Utilities
**Location**: `src/utils/patternUtils.ts`

**Purpose**: Reusable pattern generation logic

```typescript
export class PatternUtils {
  // Calculate optimal pattern parameters based on edge length
  static calculatePatternParams(edgeLength: number, patternType: string): {
    dashLength: number,
    gapLength: number,
    frequency: number,
    amplitude: number
  }

  // Scale pattern to fit edge length
  static scalePattern(pattern: number[], targetLength: number): number[]
}
```

**Used by**:
- All line pattern types (Phase 4)

## External Libraries Assessment

### Consider Using: bezier-js
**Task**: Bezier curve generation (Phase 5)

**Reason**:
- Mature library with optimized bezier calculations
- Handles edge cases (self-intersections, cusps)
- Reduces implementation complexity

**Alternative**: Implement custom (current approach)
- Pros: No external dependency, full control
- Cons: More code to maintain, potential edge cases

**Recommendation**: Start with custom implementation, evaluate bezier-js if issues arise

### Consider Using: lodash.debounce
**Task**: Tooltip hover debouncing (Phase 6)

**Reason**:
- Standard debounce implementation
- Well-tested across browsers

**Alternative**: Custom debounce
- Pros: No dependency
- Cons: Need to handle edge cases

**Recommendation**: Use custom implementation (simple utility function)

## Risk Mitigation

### Risk: Hollow Shape Rendering
**Mitigation Strategy**:
- Prototype hollow shapes early in Phase 3
- If GreasedLine doesn't support hollow well, use thin outlines
- Document any approximations in CLAUDE.md

**Fallback Plan**:
Use thin line widths (0.2x base width) to simulate hollow shapes

### Risk: Bezier Performance on Large Graphs
**Mitigation Strategy**:
- Set point density based on edge length
- Implement maximum point limit per curve
- Add configuration to disable bezier for graphs > 500 edges

**Fallback Plan**:
Provide `line.bezier = "auto"` mode that disables on large graphs

### Risk: Pattern Distortion on Short Edges
**Mitigation Strategy**:
- Detect edges < 2 units and fall back to solid
- Scale pattern parameters proportionally
- Add minimum edge length threshold

**Fallback Plan**:
Automatically switch to solid lines for very short edges

### Risk: Tooltip Performance
**Mitigation Strategy**:
- Debounce hover events (100ms)
- Limit to one visible tooltip at a time
- Use simple RichTextLabel without complex features

**Fallback Plan**:
Make tooltips opt-in with clear performance warnings

## Success Metrics

### Code Quality
- [ ] Test coverage > 80% for new code
- [ ] All ESLint rules passing
- [ ] TypeScript strict mode compliance
- [ ] No console warnings in browser

### Performance
- [ ] 1000 edges render in < 3 seconds
- [ ] Mesh cache hit rate > 90%
- [ ] Bezier generation < 15ms per edge
- [ ] Bundle size increase < 10%

### Documentation
- [ ] All public methods have JSDoc
- [ ] CLAUDE.md updated with all features
- [ ] 20+ Storybook stories created
- [ ] Migration guide written

### User Verification
- [ ] All 13 arrow types render correctly
- [ ] All 7 line patterns work
- [ ] Bezier curves are smooth
- [ ] Tooltips appear on hover
- [ ] Arrow text labels are readable

## Implementation Timeline

| Week | Phase | Deliverable |
|------|-------|-------------|
| 1 | Phase 1 | Arrow & line properties working |
| 2 | Phase 2-3 | All 13 arrow types + bidirectional |
| 3 | Phase 4 | All 6 line patterns |
| 4 | Phase 5 | Bezier curves |
| 5 | Phase 6 | Tooltips & arrow text |
| 5 | Phase 7 | Polish & documentation |

**Total**: ~5 weeks (25 days)

---

**Document Version**: 1.0
**Author**: AI Implementation Planner
**Date**: 2025-10-28
**Status**: Ready for Review
