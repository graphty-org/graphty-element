# Feature Design: Mesh-Based Patterned Lines

## Overview

- **User Value**: Rich, visually appealing edge patterns (dots, stars, dashes, zigzags, sinewaves) that maintain consistent appearance from all camera angles with natural perspective effects
- **Technical Value**: Reuses proven FilledArrowRenderer billboarding architecture; 35x faster than thin instances for position updates; extensible framework for future patterns

## Requirements

### Functional Requirements

1. **Pattern Types**
   - **Discrete patterns**: dot (circles), star, dash (elongated boxes), diamond
   - **Alternating patterns**: dash-dot (alternating dashes and dots)
   - **Connected patterns**: sinewave, zigzag (seamlessly connected meshes forming continuous waves)

2. **Visual Quality**
   - Tangential/cylindrical billboarding (always face camera)
   - Perspective foreshortening (smaller when farther from camera)
   - No gaps between connected pattern meshes (sinewave, zigzag)
   - Proper spacing for discrete patterns (close but not touching)

3. **Constraints**
   - Must not overlap starting node
   - Must not overlap arrowhead
   - **Adaptive mesh density** (user requirement):
     - Compress spacing until minimum threshold, then remove meshes
     - Expand spacing until maximum threshold, then add meshes
     - Dynamic adjustment as line length changes

4. **Performance**
   - Handle thousands of edges efficiently
   - Efficient updates during physics-based layout animation (60 FPS target)

### Non-Functional Requirements

1. **Extensibility**: Developers can easily add new pattern types with custom spacing configurations (not exposed to end users)
2. **Maintainability**: Pattern definitions are declarative and centralized
3. **Compatibility**: Works with existing EdgeStyle configuration system

---

## Critical Design Questions & Answers

### Q1: Mesh Cache vs Mesh Pool vs Mesh Instances?

**Answer**: **Individual Meshes** (no pool, no cache, no instances)

**Comparison of Approaches**:

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **MeshCache + Instances** | ✅ Shared geometry<br>✅ Auto caching | ❌ Can't have per-mesh shader uniforms (lineDirection)<br>❌ All instances share material | ❌ Not suitable |
| **Thin Instances** | ✅ Shared geometry<br>✅ Per-instance data | ❌ **35x slower** for position updates (proven in Edge.ts)<br>❌ Complex buffer API | ❌ Not suitable |
| **Individual Meshes** | ✅ **35x faster** position updates<br>✅ Per-mesh materials/uniforms<br>✅ Simple API | ❌ Higher memory<br>❌ More draw calls | ✅ **BEST** |
| **Mesh Pool** | ✅ All benefits of individual meshes<br>✅ Reuses meshes | ❌ More complexity<br>❌ Still duplicate geometry | ⚠️ Optional later |

**Evidence from existing code** (Edge.ts comments):
> "PERFORMANCE FIX: Create individual meshes for all arrow types
> Thin instances were causing 1,147ms bottleneck (35x slower than direct position updates)"

**Rationale**:
1. ✅ Proven 35x faster for position updates
2. ✅ Required for FilledArrowRenderer shader (needs per-mesh `lineDirection` uniform)
3. ✅ Simple implementation (no pool complexity)
4. ✅ Matches working demo approach (`tmp/mesh-based-patterned-line-demo.html`)

**Decision**: Start with individual meshes. Add mesh pooling later ONLY if profiling shows allocation bottleneck.

---

### Q2: How to Update Lines During Animation?

**The Problem**:
During physics simulation, edges move every frame:
- Source node: (-2, 0, 0) → (-2.1, 0.05, 0)
- Destination node: (3, 0, 0) → (3.2, -0.05, 0)
- **All pattern meshes must stay aligned with the line**

**Failed Approach** (broken `PatternedLineRenderer.ts`):
```typescript
// Parent mesh transformed via EdgeMesh.transformMesh()
const parent = new Mesh("patterned-line", scene);
EdgeMesh.transformMesh(parent, srcPoint, dstPoint);
  // ↑ This does: parent.scaling.z = lineLength

// Child pattern meshes in local space
for (let i = 0; i < count; i++) {
  child.parent = parent;
  child.position.z = localZ; // -0.5 to +0.5
  child.scaling.y = 1 / lineLength; // Try to compensate for parent scaling
}
```

**Why it failed**:
1. `EdgeMesh.transformMesh()` uses `parent.scaling.z = lineLength`
2. This **scales all children** along Z axis
3. Compensation (`child.scaling.y = 1/lineLength`) doesn't work with billboarding shaders
4. Can't set per-child shader uniforms with instances

---

**Correct Approach**: **World-Space Positioning** (like working demo)

**What the working demo does** (`tmp/mesh-based-patterned-line-demo.html:334-345`):
```javascript
// Each star positioned in world space
for (let i = 0; i < numStars; i++) {
  const x = startPos + i * spacing;
  star.position = new BABYLON.Vector3(x, 0, 0);
}

// No parent mesh!
// Each mesh is independent in world space
```

**For our dynamic lines**:
```typescript
class PatternedLineMesh {
  meshes: Mesh[];           // Individual pattern meshes (in world space)
  pattern: PatternType;
  lineDirection: Vector3;

  update(newStart: Vector3, newEnd: Vector3): void {
    // Calculate new positions along the line
    const positions = this.calculateMeshPositions(newStart, newEnd);
    const direction = newEnd.subtract(newStart).normalize();

    // Update each mesh position (world space)
    for (let i = 0; i < this.meshes.length; i++) {
      this.meshes[i].position = positions[i];  // Direct assignment
    }

    this.lineDirection = direction;  // Cached for shader updates
  }
}
```

**Key points**:
1. ✅ Pattern meshes in **world space** (not parented)
2. ✅ Positions calculated from line start/end points
3. ✅ Updated when line moves (Edge.update() calls PatternedLineMesh.update())
4. ✅ Each mesh has independent position/material
5. ✅ lineDirection updated per line (not per mesh) for billboarding

---

**Performance Analysis**:

**Worst case**: 1000 edges × 10 pattern meshes = 10,000 meshes to update per frame

**Per-mesh update cost**:
```typescript
// Calculate position: 1 subtract, 1 normalize, 1 scale, 1 add
const direction = end.subtract(start).normalize();
const position = start.add(direction.scale(distance));

// Set position: 1 vector assignment
mesh.position = position;

// Update shader uniform: 1 setVector3 call
material.setVector3("lineDirection", direction);
```

**Estimated cost per mesh**: ~0.1ms
**Total cost**: 10,000 × 0.1ms = 1,000ms ❌ **Too slow!**

**Optimization 1: Dirty Tracking** (already exists in Edge.ts:180-197)
```typescript
// Only update if nodes actually moved
const srcMoved = !this._lastSrcPos?.equalsWithEpsilon(srcPos, 0.001);
const dstMoved = !this._lastDstPos?.equalsWithEpsilon(dstPos, 0.001);

if (!srcMoved && !dstMoved) {
  return; // Skip update
}
```

**During physics**: ~30% of edges move per frame
**Cost with dirty tracking**: 1,000ms × 0.3 = 300ms ✅ **Acceptable!**

**Optimization 2: Batch Shader Updates**
```typescript
// All pattern meshes on same line share the same lineDirection
// Update once per frame for ALL meshes (not per mesh)
scene.onBeforeRenderObservable.add(() => {
  const cameraPos = scene.activeCamera.globalPosition;

  for (const patternLine of allActivePatternLines) {
    for (const mesh of patternLine.meshes) {
      const material = mesh.material as ShaderMaterial;
      material.setVector3("cameraPosition", cameraPos);
      material.setVector3("lineDirection", patternLine.lineDirection);
    }
  }
});
```

**Cost reduction**: 10,000 shader updates → 1,000 direction calculations
**New cost**: 300ms → ~100ms ✅ **Excellent!**

---

### Q3: XZ Plane or Other?

**Answer**: **XZ Plane (Y=0)** - Exactly like the working demo

**Evidence from working demo** (`tmp/mesh-based-patterned-line-demo.html:208`):
```javascript
// XZ plane (Y=0) so face normal points in ±Y direction (toward camera)
positions.push(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
//             ^^^^^^^^^^^^^^^^^^^^^^^^^^^  ^  ^^^^^^^^^^^^^^^^^^^^^^
//                     X varies            Y=0      Z varies
```

This is **XZ plane** (Y=0), exactly as designed!

**Note**: The demo HTML has outdated comments saying "XY plane" (lines 35, 149, 387), but the ACTUAL CODE uses XZ plane. The code is what matters.

---

**Why XZ Plane (Y=0) Works**:

**Shader coordinate mapping** (FilledArrowRenderer.ts:85-93):
```glsl
vec3 forward = normalize(lineDirection);              // Arrow points along line
vec3 toCamera = normalize(cameraPosition - worldCenter);
vec3 right = normalize(cross(forward, toCamera));     // Perpendicular to line AND camera
vec3 up = cross(right, forward);                      // Faces camera

// Transform arrow vertex from local space to world space
vec3 worldOffset = position.x * forward + position.y * up + position.z * right;
```

**Coordinate system mapping**:
- **Local X → World forward** (line direction)
- **Local Y → World up** (toward camera) ← **This is why Y=0 works!**
- **Local Z → World right** (perpendicular)

**For XZ plane geometry (Y=0)**:
- Face normal points in ±Y direction (local space)
- Maps to "up" vector (toward camera) in world space
- **Result**: Mesh faces camera ✅

**If we used XY plane (Z=0)**:
- Face normal points in ±Z direction (local space)
- Maps to "right" vector (perpendicular to camera) in world space
- **Result**: Mesh is edge-on to camera (invisible) ❌

---

**Critical Rule for ALL Pattern Meshes**:

**MUST use XZ plane (Y=0)**:
- Circle: `positions.push(cos(θ), 0, sin(θ))`
- Star: `positions.push(cos(θ) * r, 0, sin(θ) * r)`
- Diamond: `positions = [0, 0, 0, -0.5, 0, 0.4, -1, 0, 0, -0.5, 0, -0.4]` (X and Z vary, Y=0)
- Box: `positions = [-1, 0, 0.4, 0, 0, 0.4, 0, 0, -0.4, -1, 0, -0.4]` (X and Z vary, Y=0)
- Sinewave: `positions.push(x, 0, sin(x))` (X varies, Y=0, Z=sine)
- Zigzag: `positions.push(x, 0, z)` (X varies, Y=0, Z=zigzag)

**Verification Checklist**:
- [ ] Y component is always 0
- [ ] X and Z components vary to create the shape
- [ ] Mesh is visible from all camera angles (test with screenshot script)
- [ ] Mesh faces camera (not edge-on)

---

### Q4: Cleanup Broken Implementation?

**Answer**: Yes, complete refactor of `PatternedLineRenderer.ts`

**Current State**:
- `src/meshes/PatternedLineRenderer.ts` - Broken implementation (uses parent/child hierarchy)
- `stories/PatternedLines.stories.ts` - Untracked file (`??` in gitStatus)
- `src/meshes/EdgeMesh.ts` - Has broken integration code (lines 206-214, 443-457)

**Problems with Current Implementation**:
1. Uses parent/child hierarchy with rotation/scaling compensation (doesn't work)
2. Uses `createInstance()` which doesn't support per-mesh shader uniforms
3. Positions meshes in local space (gets stretched by `parent.scaling.z`)
4. Doesn't use FilledArrowRenderer shader (no billboarding)

**Cleanup Plan**:

**Phase 0: Remove Broken Code** (1.5 hours)
1. ✅ Delete ALL content from `PatternedLineRenderer.ts` (keep file shell)
2. ✅ Comment out broken integration in `EdgeMesh.ts` (lines 206-214, 443-457)
3. ✅ Run build to ensure no compilation errors
4. ✅ Run existing tests to ensure nothing broke

**What to Keep**:
- Pattern type definitions (enum values)
- File name and location

**What to Delete**:
- All geometry creation methods (use FilledArrowRenderer instead)
- Instance positioning logic (use world-space instead)
- Shader registration (use FilledArrowRenderer shader)
- Parent/child hierarchy code

---

## Code Integration Path

### Current Code Flow

**Edge Creation Flow** (where everything starts):
```
User creates edge via graph.addEdge()
    ↓
Edge constructor (src/Edge.ts:75-166)
    ├─ Line 115: EdgeMesh.createArrowHead() → arrowMesh
    ├─ Line 131: EdgeMesh.createArrowHead() → arrowTailMesh
    └─ Line 146: EdgeMesh.create() → mesh (LINE MESH)
              ↓
        EdgeMesh.create() (src/meshes/EdgeMesh.ts:199-226)
              ├─ Checks style.line.type
              ├─ Routes to CustomLineRenderer (solid lines)
              └─ Routes to PatternedLineRenderer (patterned lines) ← BROKEN
```

**Edge Update Flow** (every frame during physics):
```
Layout updates node positions
    ↓
Edge.update() (src/Edge.ts:168-232)
    ├─ Dirty check: Skip if nodes didn't move
    ├─ Line 203: transformArrowCap() → srcPoint, dstPoint
    │   └─ Calculates intercept points (excludes node radius)
    ├─ Line 206: transformEdgeMesh(srcPoint, dstPoint)
    │   └─ For solid lines: EdgeMesh.transformMesh()
    │       └─ Sets mesh position, rotation, scaling
    └─ Line 218: Update label position
```

### Integration Points

#### Point 1: EdgeMesh.create() - Line Type Routing

**Current Implementation** (EdgeMesh.ts:199-226):
```typescript
static create(
  cache: MeshCache,
  options: EdgeMeshOptions,
  style: EdgeStyleConfig,
  scene: Scene,
): AbstractMesh {
  const lineType = style.line?.type ?? "solid";
  const PATTERNED_TYPES = ["dot", "star", "dash", "diamond", "dash-dot", "sinewave", "zigzag"];

  // BROKEN: Returns Mesh, but should return PatternedLineMesh for patterns
  if (PATTERNED_TYPES.includes(lineType)) {
    return this.createStaticLine(options, style, scene, cache);
  }

  // Solid lines
  const cacheKey = `edge-style-${options.styleId}`;
  return cache.get(cacheKey, () => {
    return this.createStaticLine(options, style, scene, cache);
  });
}
```

**Updated Implementation**:
```typescript
static create(
  cache: MeshCache,
  options: EdgeMeshOptions,
  style: EdgeStyleConfig,
  scene: Scene,
): AbstractMesh | PatternedLineMesh {  // ← Return union type
  const lineType = style.line?.type ?? "solid";
  const PATTERNED_TYPES = ["dot", "star", "dash", "diamond", "dash-dot", "sinewave", "zigzag"];

  // Pattern lines: Use PatternedLineRenderer (NO CACHING)
  if (PATTERNED_TYPES.includes(lineType)) {
    return PatternedLineRenderer.create(
      lineType as PatternType,
      new Vector3(0, 0, -0.5), // Placeholder (Edge.update() will set real positions)
      new Vector3(0, 0, 0.5),
      options.width / 20,
      options.color,
      style.line?.opacity ?? 1.0,
      scene
    );
  }

  // Solid lines: Use CustomLineRenderer (NO CACHING - USE_CUSTOM_RENDERER = true)
  return this.createStaticLine(options, style, scene, cache);
}
```

**Key Changes**:
1. ✅ Return type: `AbstractMesh | PatternedLineMesh`
2. ✅ Route patterned types to `PatternedLineRenderer.create()`
3. ✅ NO caching for pattern lines (individual meshes, not instances)
4. ✅ Placeholder positions (Edge.update() will set real positions)

---

#### Point 2: Edge.update() - Position Updates

**Current Implementation** (Edge.ts:206-215):
```typescript
if (srcPoint && dstPoint) {
  this.transformEdgeMesh(srcPoint, dstPoint);
}

// ...

private transformEdgeMesh(srcPoint: Vector3, dstPoint: Vector3): void {
  EdgeMesh.transformMesh(this.mesh, srcPoint, dstPoint);
}
```

**Updated Implementation**:
```typescript
if (srcPoint && dstPoint) {
  this.transformEdgeMesh(srcPoint, dstPoint);
}

// ...

private transformEdgeMesh(srcPoint: Vector3, dstPoint: Vector3): void {
  // Check if mesh is PatternedLineMesh
  if (this.mesh instanceof PatternedLineMesh) {
    // Pattern lines: Update mesh positions in world space
    this.mesh.update(srcPoint, dstPoint);
  } else {
    // Solid lines: Transform via position/rotation/scaling
    EdgeMesh.transformMesh(this.mesh, srcPoint, dstPoint);
  }
}
```

**Key Changes**:
1. ✅ Type check: `instanceof PatternedLineMesh`
2. ✅ Pattern lines: Call `.update(srcPoint, dstPoint)`
3. ✅ Solid lines: Keep existing `transformMesh()` logic

---

#### Point 3: Edge.dispose() - Cleanup

**Current Implementation** (Edge.ts):
```typescript
dispose(): void {
  if (!this.mesh.isDisposed()) {
    this.mesh.dispose();
  }
  // ... dispose arrowMesh, arrowTailMesh, label ...
}
```

**Updated Implementation**:
```typescript
dispose(): void {
  // Pattern lines have custom dispose logic
  if (this.mesh instanceof PatternedLineMesh) {
    this.mesh.dispose(); // Disposes all child meshes
  } else if (!this.mesh.isDisposed()) {
    this.mesh.dispose();
  }

  // ... dispose arrowMesh, arrowTailMesh, label ...
}
```

---

#### Point 4: Edge.updateStyle() - Style Changes

**Current Implementation** (Edge.ts:234-299):
```typescript
updateStyle(styleId: EdgeStyleId): void {
  // ... skip if same style ...

  // Dispose old mesh
  if (!this.mesh.isDisposed()) {
    this.mesh.dispose();
  }

  // Recreate mesh
  this.mesh = EdgeMesh.create(
    this.context.getMeshCache(),
    { styleId: String(styleId), width: ..., color: ... },
    style,
    this.context.getScene()
  );
}
```

**Updated Implementation**:
```typescript
updateStyle(styleId: EdgeStyleId): void {
  // ... skip if same style ...

  // Dispose old mesh (works for both types)
  if (this.mesh instanceof PatternedLineMesh) {
    this.mesh.dispose();
  } else if (!this.mesh.isDisposed()) {
    this.mesh.dispose();
  }

  // Recreate mesh (EdgeMesh.create() routes correctly)
  this.mesh = EdgeMesh.create(
    this.context.getMeshCache(),
    { styleId: String(styleId), width: ..., color: ... },
    style,
    this.context.getScene()
  );
}
```

---

### How Pattern Lines Work with Existing Features

#### ✅ Arrowheads

**Question**: Do arrowheads work with patterned lines?

**Answer**: YES, no changes needed!

**How it works**:
1. Arrowheads are created independently in Edge constructor (lines 115-142)
2. `transformArrowCap()` calculates `srcPoint` and `dstPoint` (excludes node radius)
3. These points are used for BOTH arrowhead positioning AND line positioning
4. Pattern lines receive the same `srcPoint`/`dstPoint` as solid lines
5. Pattern mesh calculation already excludes arrowhead length (see `calculateDiscretePositions()`)

**Code**: No changes required to arrowhead logic!

---

#### ✅ Line Caching

**Question**: Do we need caching for pattern lines?

**Answer**: NO, intentionally avoid caching!

**Rationale**:
1. **Solid lines** (CustomLineRenderer): Currently NO caching when `USE_CUSTOM_RENDERER = true` (EdgeMesh.ts:427)
2. **Pattern lines** (PatternedLineRenderer): Use individual meshes (not instances), so caching doesn't apply
3. **Arrowheads**: Already skip caching for performance (EdgeMesh.ts:209 comment)

**Current caching code** (EdgeMesh.ts:218-226):
```typescript
const cacheKey = `edge-style-${options.styleId}`;
return cache.get(cacheKey, () => {
  // This code is bypassed when USE_CUSTOM_RENDERER = true
  return this.createStaticLine(options, style, scene, cache);
});
```

**Pattern lines**: Skip `cache.get()` entirely, return `PatternedLineMesh` directly

---

#### ✅ Parallel Solid Lines

**Question**: How do pattern lines work in parallel with solid CustomLineRenderer lines?

**Answer**: They coexist via type-based routing!

**Code Path Comparison**:

```typescript
// SOLID LINE PATH
EdgeStyle: { line: { type: "solid" } }
    ↓
EdgeMesh.create()
    ↓
lineType === "solid" → false (not in PATTERNED_TYPES)
    ↓
createStaticLine() → CustomLineRenderer.create()
    ↓
Returns: Mesh (AbstractMesh)
    ↓
Edge.update() → EdgeMesh.transformMesh(mesh, srcPoint, dstPoint)
    ↓
mesh.position = midPoint
mesh.lookAt(dstPoint)
mesh.scaling.z = length

// PATTERN LINE PATH
EdgeStyle: { line: { type: "star" } }
    ↓
EdgeMesh.create()
    ↓
lineType === "star" → true (in PATTERNED_TYPES)
    ↓
PatternedLineRenderer.create()
    ↓
Returns: PatternedLineMesh (NOT AbstractMesh)
    ↓
Edge.update() → mesh.update(srcPoint, dstPoint)
    ↓
Calculate positions in world space
Update each mesh.position directly
Update lineDirection for billboarding
```

**Key Insight**: The return type `AbstractMesh | PatternedLineMesh` allows both to coexist!

---

### Files to Modify

| File | Changes | Reason |
|------|---------|--------|
| `src/meshes/PatternedLineMesh.ts` | **CREATE NEW** | Main class for pattern lines |
| `src/meshes/PatternedLineRenderer.ts` | **REFACTOR ALL** | Delete broken code, rewrite geometry generators |
| `src/meshes/EdgeMesh.ts` | **UPDATE create()** | Return union type, route to PatternedLineRenderer |
| `src/Edge.ts` | **UPDATE update(), dispose(), updateStyle()** | Handle PatternedLineMesh type |
| `stories/PatternedLines.stories.ts` | **UPDATE** | Use new API |

---

### Type Safety Strategy

**Problem**: `Edge.mesh` can be either `AbstractMesh` (solid) or `PatternedLineMesh` (pattern)

**Solution**: Use `instanceof` type guard

```typescript
// Edge.ts property declaration
export class Edge {
  mesh: AbstractMesh | PatternedLineMesh;  // Union type

  // ...

  private transformEdgeMesh(srcPoint: Vector3, dstPoint: Vector3): void {
    if (this.mesh instanceof PatternedLineMesh) {
      // TypeScript knows this.mesh is PatternedLineMesh here
      this.mesh.update(srcPoint, dstPoint);
    } else {
      // TypeScript knows this.mesh is AbstractMesh here
      EdgeMesh.transformMesh(this.mesh, srcPoint, dstPoint);
    }
  }
}
```

**Benefits**:
1. ✅ Type-safe (TypeScript narrows types in each branch)
2. ✅ Runtime-safe (checks actual instance type)
3. ✅ No breaking changes (existing solid lines work unchanged)

---

## Refactoring Considerations

### Current State Analysis

**Files with Broken Implementation**:
1. `src/meshes/PatternedLineRenderer.ts` (445 lines)
   - Status: Broken implementation using parent/child hierarchy
   - Action: Complete rewrite
   - Reason: Architecture fundamentally flawed

2. `stories/PatternedLines.stories.ts`
   - Status: Untracked (`??` in git status)
   - Action: Update to use new API
   - Reason: References broken PatternedLineRenderer

3. `src/meshes/EdgeMesh.ts` (lines 206-214, 443-457)
   - Status: Broken integration code
   - Action: Update routing logic
   - Reason: Returns wrong type

### What to Keep vs Delete

#### PatternedLineRenderer.ts - DELETE ALL, KEEP ONLY:

**KEEP** (Move to new file):
```typescript
// Pattern type definitions
export type PatternType = "dot" | "star" | "dash" | "diamond" | "dash-dot" | "sinewave" | "zigzag";

// Pattern definition interfaces
interface ShapeDefinition { ... }
interface SpacingConfig { ... }
interface PatternDefinition { ... }

// Pattern registry
const PATTERN_DEFINITIONS: Record<PatternType, PatternDefinition> = { ... };
```

**DELETE** (All broken code):
```typescript
// ❌ Delete: Parent/child hierarchy code
const parent = new Mesh("patterned-line", scene);
child.parent = parent;
child.position.z = localZ;
child.scaling.y = 1 / lineLength;

// ❌ Delete: Instance-based approach
const instance = templateMesh.createInstance(...);
instance.rotation.x = Math.PI / 2;

// ❌ Delete: Mesh cache integration for patterns
const templateMesh = this.getOrCreateShapeTemplate(...);

// ❌ Delete: generatePatternInstances() - wrong approach

// ❌ Delete: All geometry creation methods (replace with FilledArrowRenderer-based)
private static createBaseMesh(...) { ... }
private static createCircleMesh(...) { ... }
private static createStarMesh(...) { ... }
```

**Total deletion**: ~400 lines of broken code

---

### Migration Strategy

#### Step 1: Feature Flag Approach

**Goal**: Allow gradual migration without breaking existing code

**Implementation**:
```typescript
// src/meshes/EdgeMesh.ts
const ENABLE_NEW_PATTERN_RENDERER = false; // Feature flag

static create(...): AbstractMesh | PatternedLineMesh {
  const PATTERNED_TYPES = ["dot", "star", "dash", "diamond", "dash-dot", "sinewave", "zigzag"];

  if (PATTERNED_TYPES.includes(lineType)) {
    if (ENABLE_NEW_PATTERN_RENDERER) {
      // NEW: Use refactored PatternedLineRenderer
      return PatternedLineRenderer.create(...);
    } else {
      // OLD: Use broken implementation (or fall back to solid line)
      console.warn("Pattern lines not yet implemented, using solid line");
      return this.createStaticLine(...);
    }
  }

  // Solid lines (unchanged)
  return this.createStaticLine(...);
}
```

**Timeline**:
1. Phase 0-1: Flag = false (broken code disabled, fall back to solid)
2. Phase 2-6: Flag = false (develop new implementation in parallel)
3. Phase 7: Flag = true (enable new implementation for testing)
4. After testing: Remove flag, delete broken code

---

#### Step 2: Incremental Refactoring Process

**Phase 0: Disable Broken Code** (1 hour)
```typescript
// 1. Comment out broken integration in EdgeMesh.ts
if (PATTERNED_TYPES.includes(lineType)) {
  // TEMP: Disabled broken pattern renderer
  console.warn("Pattern lines disabled during refactor, using solid line");
  return this.createStaticLine(options, style, scene, cache);
}

// 2. Rename broken file for backup
// git mv src/meshes/PatternedLineRenderer.ts src/meshes/PatternedLineRenderer.ts.backup

// 3. Verify build still works
// npm run build

// 4. Verify tests still pass
// npm test
```

**Phase 1-6: Implement New Code** (9-12 days)
- Develop in parallel to existing code
- No impact on production usage
- Feature flag keeps old behavior

**Phase 7: Enable and Test** (1-2 days)
```typescript
// 1. Set feature flag to true
const ENABLE_NEW_PATTERN_RENDERER = true;

// 2. Run all tests
npm run test:all

// 3. Run performance tests
npm run test:visual

// 4. Manual testing with Storybook
npm run storybook

// 5. If issues found: Set flag to false, debug, repeat
```

**Phase 8: Cleanup** (1 hour)
```typescript
// 1. Remove feature flag
// 2. Delete backup file
// rm src/meshes/PatternedLineRenderer.ts.backup
// 3. Update documentation
```

---

### Backwards Compatibility

**Question**: Will this break existing graphs?

**Answer**: NO - Backwards compatible!

**Why**:
1. **Solid lines unchanged**: `line.type = "solid"` uses same CustomLineRenderer
2. **Arrowheads unchanged**: No changes to arrowhead creation/positioning
3. **Edge API unchanged**: Edge constructor/update/dispose same signature
4. **Pattern fallback**: If patterns disabled, falls back to solid line

**Breaking changes**: NONE

**User-facing changes**:
- Pattern line types will START working (currently broken)
- Users who tried to use patterns and got errors will now see working patterns

**Migration path for users**:
```typescript
// Before (broken):
const style = { line: { type: "star" } }; // Didn't work

// After (works):
const style = { line: { type: "star" } }; // Now renders star pattern ✅
```

---

### Testing During Refactor

**Goal**: Ensure solid lines keep working while we refactor patterns

**Strategy**:

#### 1. Isolation Testing
```typescript
// Test solid lines separately from patterns
describe("CustomLineRenderer (Solid Lines)", () => {
  test("solid line renders correctly", () => {
    const style = { line: { type: "solid" } };
    // Should keep working throughout refactor
  });
});

describe("PatternedLineRenderer (Pattern Lines)", () => {
  test.skip("pattern lines (disabled during refactor)", () => {
    // Skip these tests until new implementation ready
  });
});
```

#### 2. Integration Testing
```typescript
// Test edge creation with both line types
describe("Edge Integration", () => {
  test("creates edge with solid line", () => {
    const edge = new Edge(..., { line: { type: "solid" } });
    expect(edge.mesh).toBeInstanceOf(Mesh);
  });

  test("creates edge with pattern line (fallback)", () => {
    const edge = new Edge(..., { line: { type: "star" } });
    // During refactor: Should fall back to solid
    expect(edge.mesh).toBeInstanceOf(Mesh);
  });
});
```

#### 3. Visual Regression Testing
```bash
# Capture baseline screenshots BEFORE refactor
npm run test:visual -- --update-snapshots

# During refactor: Verify solid lines unchanged
npm run test:visual

# Should pass (no changes to solid line rendering)
```

#### 4. Performance Testing
```bash
# Baseline before refactor
npm run test:visual:ultra

# During refactor: Ensure no regression
npm run test:visual:ultra

# Should maintain same FPS
```

---

### Rollback Strategy

**If refactor fails**: Easy rollback with feature flag

**Rollback steps**:
```typescript
// 1. Set feature flag to false
const ENABLE_NEW_PATTERN_RENDERER = false;

// 2. Verify tests pass
npm run test:all

// 3. Deploy with flag disabled
// Users see solid line fallback instead of broken patterns

// 4. Debug new implementation offline
// No user impact while fixing
```

**Safety net**:
- Feature flag allows instant rollback
- No changes to solid line code
- Broken pattern code disabled from start
- Can deploy incremental fixes without risk

---

### Refactoring Checklist

#### Phase 0: Preparation
- [ ] Create feature branch: `git checkout -b refactor/pattern-lines`
- [ ] Backup broken code: `git mv PatternedLineRenderer.ts PatternedLineRenderer.ts.backup`
- [ ] Add feature flag to EdgeMesh.ts
- [ ] Disable pattern line creation (fall back to solid)
- [ ] Run tests: `npm run test:all` (should pass)
- [ ] Commit: "refactor: disable broken pattern renderer"

#### Phase 1-6: Implementation
- [ ] Create `src/meshes/PatternedLineMesh.ts`
- [ ] Rewrite `src/meshes/PatternedLineRenderer.ts`
- [ ] Add unit tests for geometry generators
- [ ] Add unit tests for position calculation
- [ ] Add visual tests for all 7 patterns
- [ ] Keep feature flag disabled during development

#### Phase 7: Enable and Test
- [ ] Set feature flag to true
- [ ] Run all tests: `npm run test:all`
- [ ] Run visual tests: `npm run test:visual`
- [ ] Run performance tests: Profile 1000 edges
- [ ] Manual testing in Storybook
- [ ] Test from multiple camera angles
- [ ] Verify arrowheads work
- [ ] Verify adaptive density works

#### Phase 8: Cleanup
- [ ] Remove feature flag code
- [ ] Delete backup file
- [ ] Update CLAUDE.md documentation
- [ ] Add JSDoc comments
- [ ] Update Storybook examples
- [ ] Commit: "feat: implement mesh-based pattern lines"

---

### Risk Mitigation During Refactor

#### Risk 1: Breaking Solid Lines
**Mitigation**:
- ✅ Zero changes to CustomLineRenderer
- ✅ Integration tests verify solid lines unchanged
- ✅ Visual regression tests catch rendering changes
- ✅ Feature flag allows instant rollback

#### Risk 2: Integration Issues
**Mitigation**:
- ✅ Type safety via `AbstractMesh | PatternedLineMesh` union
- ✅ Minimal changes to Edge.ts (just `instanceof` checks)
- ✅ Incremental testing at each phase
- ✅ Can disable patterns without affecting edges

#### Risk 3: Performance Regression
**Mitigation**:
- ✅ Performance tests before/after refactor
- ✅ Profiling at each phase
- ✅ Early warning if FPS drops
- ✅ Can optimize before enabling

#### Risk 4: Incomplete Testing
**Mitigation**:
- ✅ Comprehensive test plan (unit + visual + performance)
- ✅ Manual testing checklist
- ✅ Screenshot comparison from 5 angles
- ✅ Load testing with 1000 edges

---

### Success Criteria for Refactor

**Must have (blocking)**:
- [ ] All existing tests pass (no regression)
- [ ] All 7 pattern types render correctly
- [ ] Arrowheads work with patterns
- [ ] Performance: 60 FPS with 1000 patterned edges
- [ ] No TypeScript errors
- [ ] No console warnings/errors

**Should have (not blocking)**:
- [ ] Visual regression tests pass from all angles
- [ ] Adaptive density works smoothly
- [ ] Documentation updated
- [ ] Examples in Storybook

**Nice to have**:
- [ ] Performance better than target (>60 FPS)
- [ ] Code coverage >80%
- [ ] Zero ESLint warnings

---

### Post-Refactor Cleanup

**After successful deployment**:
1. Delete backup file: `rm src/meshes/PatternedLineRenderer.ts.backup`
2. Remove feature flag code from EdgeMesh.ts
3. Close related issues/PRs
4. Update changelog
5. Tag release: `git tag v1.x.0`
6. Celebrate! 🎉

---

## Proposed Solution

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Edge.update()                       │
│  (Called every frame when nodes move during physics)       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │  Calculate srcPoint, dstPoint         │
        │  (Exclude node radius + arrow length) │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │  PatternedLineMesh.update()           │
        │  - Calculate mesh positions           │
        │  - Update mesh.position (world space) │
        │  - Update lineDirection               │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │  FilledArrowRenderer Shader           │
        │  (Runs every frame for billboarding)  │
        │  - Read cameraPosition uniform        │
        │  - Read lineDirection uniform         │
        │  - Billboard mesh to face camera      │
        └───────────────────────────────────────┘
```

### User Interface/API

**For End Users** (via EdgeStyle config):
```typescript
const style: EdgeStyleConfig = {
  line: {
    type: "star",  // or "dot", "dash", "diamond", "dash-dot", "sinewave", "zigzag"
    width: 0.1,
    color: "#FFD700",
    opacity: 1.0,
  },
  arrowHead: { type: "normal", color: "#FFD700" }
};
```

**For Developers** (internal pattern registry - not exposed to users):
```typescript
const PATTERN_DEFINITIONS = {
  dot: {
    shapes: [{ type: "circle", size: 1.0 }],
    spacing: { min: 0.2, ideal: 0.5, max: 1.0 },
    connected: false,
  },
  star: {
    shapes: [{ type: "star", size: 1.0, points: 5 }],
    spacing: { min: 0.3, ideal: 0.6, max: 1.2 },
    connected: false,
  },
  dash: {
    shapes: [{ type: "box", size: 1.0, aspectRatio: 3.0 }],
    spacing: { min: 0.2, ideal: 0.4, max: 0.8 },
    connected: false,
  },
  diamond: {
    shapes: [{ type: "diamond", size: 1.0 }],
    spacing: { min: 0.2, ideal: 0.5, max: 1.0 },
    connected: false,
  },
  "dash-dot": {
    shapes: [
      { type: "box", size: 1.0, aspectRatio: 3.0 },  // dash
      { type: "circle", size: 0.6 }                  // dot
    ],
    spacing: { min: 0.15, ideal: 0.3, max: 0.6 },
    connected: false,
  },
  sinewave: {
    shapes: [{ type: "sinewave-segment", size: 1.0, periods: 0.5 }],
    spacing: { min: 0, ideal: 0, max: 0 },  // Seamless connection
    connected: true,
  },
  zigzag: {
    shapes: [{ type: "zigzag-segment", size: 1.0, angle: 60 }],
    spacing: { min: 0, ideal: 0, max: 0 },  // Seamless connection
    connected: true,
  },
};
```

### Technical Architecture

#### Component 1: PatternedLineMesh (Main Class)

**Location**: `src/meshes/PatternedLineMesh.ts` (NEW FILE)

**Responsibilities**:
- Manage individual pattern meshes for one edge line
- Calculate mesh positions in world space
- Update mesh positions when line endpoints change
- Handle adaptive density (add/remove meshes as line length changes)

**Class Definition**:
```typescript
export class PatternedLineMesh {
  meshes: Mesh[] = [];              // Individual meshes in world space
  pattern: PatternType;
  lineDirection = new Vector3(1, 0, 0);
  private lastLength = 0;
  private scene: Scene;
  private width: number;
  private color: string;
  private opacity: number;

  constructor(
    pattern: PatternType,
    start: Vector3,
    end: Vector3,
    width: number,
    color: string,
    opacity: number,
    scene: Scene
  ) {
    this.pattern = pattern;
    this.scene = scene;
    this.width = width;
    this.color = color;
    this.opacity = opacity;

    this.createInitialMeshes(start, end);
  }

  update(start: Vector3, end: Vector3): void {
    const newLength = end.subtract(start).length();
    this.lineDirection = end.subtract(start).normalize();

    // Adaptive density: adjust mesh count if needed
    if (this.needsMeshCountAdjustment(newLength)) {
      this.adjustMeshCount(newLength);
    }

    // Update positions (world space)
    const positions = this.calculatePositions(start, end);
    for (let i = 0; i < this.meshes.length; i++) {
      this.meshes[i].position = positions[i];
    }

    this.lastLength = newLength;
  }

  dispose(): void {
    for (const mesh of this.meshes) {
      mesh.dispose();
    }
    this.meshes = [];
  }

  private needsMeshCountAdjustment(newLength: number): boolean {
    const pattern = PATTERN_DEFINITIONS[this.pattern];
    const currentCount = this.meshes.length;
    const optimalCount = this.calculateOptimalMeshCount(newLength, pattern);

    return Math.abs(currentCount - optimalCount) > 1; // Hysteresis: ±1 mesh
  }

  private adjustMeshCount(newLength: number): void {
    const pattern = PATTERN_DEFINITIONS[this.pattern];
    const optimalCount = this.calculateOptimalMeshCount(newLength, pattern);
    const currentCount = this.meshes.length;

    if (optimalCount > currentCount) {
      // Add meshes
      for (let i = 0; i < optimalCount - currentCount; i++) {
        const mesh = this.createPatternMesh();
        this.meshes.push(mesh);
      }
    } else if (optimalCount < currentCount) {
      // Remove meshes
      const toRemove = currentCount - optimalCount;
      for (let i = 0; i < toRemove; i++) {
        const mesh = this.meshes.pop();
        mesh?.dispose();
      }
    }
  }

  private calculatePositions(start: Vector3, end: Vector3): Vector3[] {
    const pattern = PATTERN_DEFINITIONS[this.pattern];

    if (pattern.connected) {
      return this.calculateConnectedPositions(start, end, pattern);
    } else {
      return this.calculateDiscretePositions(start, end, pattern);
    }
  }

  private calculateDiscretePositions(
    start: Vector3,
    end: Vector3,
    pattern: PatternDefinition
  ): Vector3[] {
    const direction = end.subtract(start).normalize();
    const totalLength = end.subtract(start).length();

    // Exclude zones (node radius + arrow length)
    const nodeRadius = 0.5;  // TODO: Get from node mesh
    const arrowLength = 0.5; // TODO: Get from EdgeMesh.calculateArrowLength()
    const availableLength = totalLength - nodeRadius - arrowLength;

    // Calculate spacing
    const meshCount = this.meshes.length;
    const totalShapeSize = pattern.shapes.reduce((sum, s) => sum + (s.size || 1.0), 0);
    const spacing = (availableLength - totalShapeSize * meshCount) / meshCount;

    // Distribute meshes
    const positions: Vector3[] = [];
    let distance = nodeRadius;

    for (let i = 0; i < meshCount; i++) {
      const shapeIndex = i % pattern.shapes.length;
      const shapeSize = pattern.shapes[shapeIndex].size || 1.0;

      distance += shapeSize / 2; // Move to center of shape
      positions.push(start.add(direction.scale(distance)));
      distance += shapeSize / 2 + spacing; // Move to next shape
    }

    return positions;
  }

  private calculateConnectedPositions(
    start: Vector3,
    end: Vector3,
    pattern: PatternDefinition
  ): Vector3[] {
    const direction = end.subtract(start).normalize();
    const totalLength = end.subtract(start).length();
    const segmentSize = pattern.shapes[0].size || 1.0;
    const meshCount = this.meshes.length;

    const positions: Vector3[] = [];
    for (let i = 0; i < meshCount; i++) {
      const distance = i * segmentSize;
      positions.push(start.add(direction.scale(distance)));
    }

    return positions;
  }

  private calculateOptimalMeshCount(
    lineLength: number,
    pattern: PatternDefinition
  ): number {
    if (pattern.connected) {
      const segmentSize = pattern.shapes[0].size || 1.0;
      return Math.ceil(lineLength / segmentSize);
    }

    const nodeRadius = 0.5;
    const arrowLength = 0.5;
    const availableLength = lineLength - nodeRadius - arrowLength;
    const totalShapeSize = pattern.shapes.reduce((sum, s) => sum + (s.size || 1.0), 0);

    // Try ideal spacing
    let meshCount = Math.floor(availableLength / (totalShapeSize + pattern.spacing.ideal));
    let actualSpacing = (availableLength - totalShapeSize * meshCount) / meshCount;

    // If spacing too small, reduce mesh count
    if (actualSpacing < pattern.spacing.min) {
      meshCount = Math.floor(availableLength / (totalShapeSize + pattern.spacing.min));
    }

    // If spacing too large, add more meshes
    if (actualSpacing > pattern.spacing.max) {
      meshCount = Math.ceil(availableLength / (totalShapeSize + pattern.spacing.max));
    }

    // Ensure minimum visibility (at least 3 meshes)
    return Math.max(3, meshCount);
  }

  private createPatternMesh(): Mesh {
    // Delegate to PatternedLineRenderer
    return PatternedLineRenderer.createPatternMesh(
      this.pattern,
      this.width,
      this.color,
      this.opacity,
      this.scene
    );
  }
}
```

#### Component 2: PatternedLineRenderer (Static Utility)

**Location**: `src/meshes/PatternedLineRenderer.ts` (REFACTOR EXISTING)

**Responsibilities**:
- Create PatternedLineMesh instances
- Generate pattern geometry (ALL use XZ plane, Y=0)
- Apply FilledArrowRenderer shader to pattern meshes
- Register camera callback for batched shader updates

**Class Definition**:
```typescript
export class PatternedLineRenderer {
  private static activeMaterials = new Set<ShaderMaterial>();
  private static cameraCallbackRegistered = false;

  static create(
    pattern: PatternType,
    start: Vector3,
    end: Vector3,
    width: number,
    color: string,
    opacity: number,
    scene: Scene
  ): PatternedLineMesh {
    // Register camera callback for batched shader updates
    this.registerCameraCallback(scene);

    return new PatternedLineMesh(pattern, start, end, width, color, opacity, scene);
  }

  static createPatternMesh(
    pattern: PatternType,
    width: number,
    color: string,
    opacity: number,
    scene: Scene
  ): Mesh {
    // Get geometry for pattern type
    const geometry = this.getGeometryForPattern(pattern);

    // Create mesh from geometry
    const mesh = new Mesh(`pattern-${pattern}`, scene);
    geometry.applyToMesh(mesh);

    // Apply FilledArrowRenderer shader
    const size = width * this.getSizeMultiplier(pattern);
    FilledArrowRenderer.applyShader(mesh, { size, color, opacity }, scene);

    // Track material for batched updates
    const material = mesh.material as ShaderMaterial;
    this.activeMaterials.add(material);

    return mesh;
  }

  private static getGeometryForPattern(pattern: PatternType): VertexData {
    switch (pattern) {
      case "dot":
        return this.createCircleGeometry();
      case "star":
        return this.createStarGeometry();
      case "dash":
        return this.createBoxGeometry(3.0); // aspect ratio 3:1
      case "diamond":
        return this.createDiamondGeometry();
      case "sinewave":
        return this.createSinewaveSegmentGeometry();
      case "zigzag":
        return this.createZigzagSegmentGeometry();
      default:
        throw new Error(`Unsupported pattern type: ${pattern}`);
    }
  }

  // ==========================================
  // GEOMETRY GENERATORS
  // ALL MUST USE XZ PLANE (Y=0)!
  // ==========================================

  private static createCircleGeometry(segments = 32): VertexData {
    const positions: number[] = [0, 0, 0]; // Center
    const indices: number[] = [];

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      // XZ plane (Y=0)
      positions.push(
        Math.cos(angle), // X
        0,               // Y = 0
        Math.sin(angle)  // Z
      );

      if (i < segments) {
        indices.push(0, i + 1, i + 2);
      }
    }

    const vertexData = new VertexData();
    vertexData.positions = positions;
    vertexData.indices = indices;
    return vertexData;
  }

  private static createStarGeometry(
    points = 5,
    innerRadius = 0.4,
    outerRadius = 1.0
  ): VertexData {
    const positions: number[] = [0, 0, 0]; // Center
    const indices: number[] = [];
    const totalPoints = points * 2;

    for (let i = 0; i <= totalPoints; i++) {
      const angle = (i / totalPoints) * Math.PI * 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      // XZ plane (Y=0)
      positions.push(
        Math.cos(angle) * radius, // X
        0,                        // Y = 0
        Math.sin(angle) * radius  // Z
      );

      if (i < totalPoints) {
        indices.push(0, i + 1, i + 2);
      }
    }

    const vertexData = new VertexData();
    vertexData.positions = positions;
    vertexData.indices = indices;
    return vertexData;
  }

  private static createBoxGeometry(aspectRatio = 1.0): VertexData {
    const length = 1.0;
    const width = length / aspectRatio;
    const halfLength = length / 2;
    const halfWidth = width / 2;

    // XZ plane (Y=0), centered at origin, extends along +/- X
    const positions = [
      -halfLength, 0,  halfWidth, // Top-left
       halfLength, 0,  halfWidth, // Top-right
       halfLength, 0, -halfWidth, // Bottom-right
      -halfLength, 0, -halfWidth, // Bottom-left
    ];

    const indices = [
      0, 1, 2, // First triangle
      0, 2, 3, // Second triangle
    ];

    const vertexData = new VertexData();
    vertexData.positions = positions;
    vertexData.indices = indices;
    return vertexData;
  }

  private static createDiamondGeometry(): VertexData {
    const length = 1.0;
    const width = 0.8;

    // XZ plane (Y=0)
    const positions = [
       0,          0, 0,         // Front tip
      -length / 2, 0,  width / 2, // Top
      -length,     0, 0,         // Back tip
      -length / 2, 0, -width / 2, // Bottom
    ];

    const indices = [
      0, 1, 2, // Top half
      0, 2, 3, // Bottom half
    ];

    const vertexData = new VertexData();
    vertexData.positions = positions;
    vertexData.indices = indices;
    return vertexData;
  }

  private static createSinewaveSegmentGeometry(
    segmentLength = 1.0,
    amplitude = 0.3,
    periods = 0.5
  ): VertexData {
    const positions: number[] = [];
    const indices: number[] = [];
    const segments = 20; // Smooth curve
    const thickness = amplitude * 0.2; // Line thickness

    // Generate sine wave vertices in XZ plane (Y=0)
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = t * segmentLength;
      const z = amplitude * Math.sin(2 * Math.PI * periods * t);

      // Create quad strip (two vertices per segment for thickness)
      positions.push(x, 0, z - thickness); // Bottom
      positions.push(x, 0, z + thickness); // Top
    }

    // Create triangle indices for quad strip
    for (let i = 0; i < segments; i++) {
      const base = i * 2;
      indices.push(base, base + 1, base + 2);
      indices.push(base + 1, base + 3, base + 2);
    }

    const vertexData = new VertexData();
    vertexData.positions = positions;
    vertexData.indices = indices;
    return vertexData;
  }

  private static createZigzagSegmentGeometry(
    segmentLength = 1.0,
    amplitude = 0.3,
    angle = 60
  ): VertexData {
    const positions: number[] = [];
    const indices: number[] = [];
    const thickness = amplitude * 0.2;

    // Calculate peak height from angle
    const peakHeight = Math.tan((angle * Math.PI) / 180) * (segmentLength / 2);

    // Zigzag points: 0 → peak → 0 → valley → 0 (XZ plane, Y=0)
    const points = [
      [0, 0, 0],                          // Start
      [segmentLength / 4, 0, peakHeight], // Peak
      [segmentLength / 2, 0, 0],          // Mid
      [(3 * segmentLength) / 4, 0, -peakHeight], // Valley
      [segmentLength, 0, 0],              // End
    ];

    // Create quad strip with thickness
    for (const [x, y, z] of points) {
      positions.push(x, y, z - thickness); // Bottom
      positions.push(x, y, z + thickness); // Top
    }

    // Create triangle indices
    for (let i = 0; i < points.length - 1; i++) {
      const base = i * 2;
      indices.push(base, base + 1, base + 2);
      indices.push(base + 1, base + 3, base + 2);
    }

    const vertexData = new VertexData();
    vertexData.positions = positions;
    vertexData.indices = indices;
    return vertexData;
  }

  private static getSizeMultiplier(pattern: PatternType): number {
    // Adjust size based on pattern type
    switch (pattern) {
      case "dot":
      case "diamond":
        return 1.0;
      case "star":
        return 1.2;
      case "dash":
        return 1.5;
      default:
        return 1.0;
    }
  }

  private static registerCameraCallback(scene: Scene): void {
    if (this.cameraCallbackRegistered) {
      return;
    }

    this.cameraCallbackRegistered = true;

    scene.onBeforeRenderObservable.add(() => {
      const camera = scene.activeCamera;
      if (!camera) {
        return;
      }

      const cameraPos = camera.globalPosition;

      // Update all active materials in one batch
      for (const material of this.activeMaterials) {
        try {
          material.setVector3("cameraPosition", cameraPos);
          // lineDirection is set per PatternedLineMesh, not here
        } catch {
          // Material was disposed, remove from set
          this.activeMaterials.delete(material);
        }
      }
    });
  }
}
```

#### Component 3: Pattern Definitions

**Location**: `src/meshes/PatternedLineRenderer.ts` (constants at top of file)

```typescript
export type PatternType = "dot" | "star" | "dash" | "diamond" | "dash-dot" | "sinewave" | "zigzag";

interface ShapeDefinition {
  type: "circle" | "star" | "box" | "diamond" | "sinewave-segment" | "zigzag-segment";
  size?: number;          // Base size multiplier (default 1.0)
  aspectRatio?: number;   // For elongated shapes (default 1.0)
  points?: number;        // For star (default 5)
  angle?: number;         // For zigzag (default 60)
  periods?: number;       // For sinewave (default 0.5)
}

interface SpacingConfig {
  min: number;   // Minimum spacing (below this, remove meshes)
  ideal: number; // Target spacing
  max: number;   // Maximum spacing (above this, add meshes)
}

interface PatternDefinition {
  shapes: ShapeDefinition[];
  spacing: SpacingConfig;
  connected: boolean;
}

const PATTERN_DEFINITIONS: Record<PatternType, PatternDefinition> = {
  dot: {
    shapes: [{ type: "circle", size: 1.0 }],
    spacing: { min: 0.2, ideal: 0.5, max: 1.0 },
    connected: false,
  },
  star: {
    shapes: [{ type: "star", size: 1.0, points: 5 }],
    spacing: { min: 0.3, ideal: 0.6, max: 1.2 },
    connected: false,
  },
  dash: {
    shapes: [{ type: "box", size: 1.0, aspectRatio: 3.0 }],
    spacing: { min: 0.2, ideal: 0.4, max: 0.8 },
    connected: false,
  },
  diamond: {
    shapes: [{ type: "diamond", size: 1.0 }],
    spacing: { min: 0.2, ideal: 0.5, max: 1.0 },
    connected: false,
  },
  "dash-dot": {
    shapes: [
      { type: "box", size: 1.0, aspectRatio: 3.0 },
      { type: "circle", size: 0.6 },
    ],
    spacing: { min: 0.15, ideal: 0.3, max: 0.6 },
    connected: false,
  },
  sinewave: {
    shapes: [{ type: "sinewave-segment", size: 1.0, periods: 0.5 }],
    spacing: { min: 0, ideal: 0, max: 0 },
    connected: true,
  },
  zigzag: {
    shapes: [{ type: "zigzag-segment", size: 1.0, angle: 60 }],
    spacing: { min: 0, ideal: 0, max: 0 },
    connected: true,
  },
};
```

---

## Implementation Plan

### Phase 0: Cleanup (1.5 hours)

**Goal**: Remove broken implementation, prepare clean slate

**Tasks**:
1. Delete ALL content from `src/meshes/PatternedLineRenderer.ts` (keep file shell and imports)
2. Comment out broken integration in `src/meshes/EdgeMesh.ts` (lines 206-214, 443-457)
3. Run `npm run build` to ensure no compilation errors
4. Run `npm test` to ensure existing tests still pass

**Deliverable**: Clean codebase, no broken references, build passes

---

### Phase 1: Core Infrastructure (2-3 days)

**Goal**: Create PatternedLineMesh class and geometry generators

**Day 1: PatternedLineMesh Class**
1. Create `src/meshes/PatternedLineMesh.ts`
2. Implement constructor, update(), dispose()
3. Implement basic position calculation (discrete patterns only)
4. Add unit tests for position calculation

**Day 2: Geometry Generators**
1. Refactor `src/meshes/PatternedLineRenderer.ts`
2. Implement geometry generators:
   - `createCircleGeometry()` - XZ plane
   - `createStarGeometry()` - XZ plane
   - `createBoxGeometry()` - XZ plane
   - `createDiamondGeometry()` - XZ plane
3. Add unit tests verifying Y=0 for all vertices

**Day 3: Billboarding Integration**
1. Integrate FilledArrowRenderer shader
2. Register camera callback for batched updates
3. Test billboarding from multiple angles
4. Use screenshot script to verify from 5 angles

**Deliverable**: Can create dot/star/dash/diamond patterns with billboarding

---

### Phase 2: Adaptive Density (1 day)

**Goal**: Implement mesh count adjustment based on line length

**Tasks**:
1. Implement `calculateOptimalMeshCount()`
2. Implement `needsMeshCountAdjustment()` with hysteresis
3. Implement `adjustMeshCount()` (add/remove meshes)
4. Add unit tests for adaptive density logic
5. Visual test: Create story showing line stretching/compressing

**Deliverable**: Meshes dynamically add/remove as line length changes

---

### Phase 3: Alternating Patterns (1 day)

**Goal**: Support dash-dot pattern (alternating shapes)

**Tasks**:
1. Update `createInitialMeshes()` to handle multiple shape types
2. Update `createPatternMesh()` to accept shape type parameter
3. Update `calculateDiscretePositions()` to alternate shapes
4. Add visual test for dash-dot pattern

**Deliverable**: Dash-dot pattern works

---

### Phase 4: Connected Patterns (2-3 days)

**Goal**: Support sinewave and zigzag patterns (seamless connection)

**Day 1: Sinewave**
1. Implement `createSinewaveSegmentGeometry()`
2. Verify endpoints align (unit test)
3. Implement `calculateConnectedPositions()`
4. Visual test: Verify no gaps between segments

**Day 2: Zigzag**
1. Implement `createZigzagSegmentGeometry()`
2. Verify endpoints align (unit test)
3. Visual test: Verify no gaps between segments

**Day 3: Testing & Refinement**
1. Test from multiple camera angles
2. Adjust amplitude/thickness for visual appeal
3. Performance test with 100 connected pattern edges

**Deliverable**: Sinewave and zigzag patterns work seamlessly

---

### Phase 5: Integration (1-2 hours)

**Goal**: Integrate with EdgeMesh and Edge classes

**EdgeMesh Integration**:
```typescript
// src/meshes/EdgeMesh.ts
static create(
  cache: MeshCache,
  options: EdgeMeshOptions,
  style: EdgeStyleConfig,
  scene: Scene
): AbstractMesh | PatternedLineMesh {
  const lineType = style.line?.type ?? "solid";
  const PATTERNED_TYPES = ["dot", "star", "dash", "diamond", "dash-dot", "sinewave", "zigzag"];

  if (PATTERNED_TYPES.includes(lineType)) {
    return PatternedLineRenderer.create(
      lineType as PatternType,
      new Vector3(0, 0, -0.5), // Placeholder (Edge.update() will set real positions)
      new Vector3(0, 0, 0.5),
      options.width / 20,
      options.color,
      style.line?.opacity ?? 1.0,
      scene
    );
  }

  // ... solid line handling ...
}
```

**Edge Integration**:
```typescript
// src/Edge.ts
export class Edge {
  mesh: AbstractMesh | PatternedLineMesh;

  update(): void {
    // ... existing dirty tracking ...

    const {srcPoint, dstPoint} = this.transformArrowCap();

    if (srcPoint && dstPoint) {
      if (this.mesh instanceof PatternedLineMesh) {
        this.mesh.update(srcPoint, dstPoint);
      } else {
        EdgeMesh.transformMesh(this.mesh, srcPoint, dstPoint);
      }
    }
  }

  dispose(): void {
    if (this.mesh instanceof PatternedLineMesh) {
      this.mesh.dispose();
    } else if (!this.mesh.isDisposed()) {
      this.mesh.dispose();
    }
    // ... rest of dispose ...
  }
}
```

**Deliverable**: Patterned lines work end-to-end in graph

---

### Phase 6: Performance Optimization (1-2 days)

**Goal**: Achieve 60 FPS with 1000 patterned edges during physics

**Optimizations**:
1. ✅ Dirty tracking (already exists in Edge.ts)
2. ✅ Batched shader updates (implemented in Phase 1)
3. ✅ Individual meshes (35x faster than thin instances)
4. Profile Edge.update() times
5. Profile PatternedLineMesh.update() times
6. Optimize hot paths if needed

**Performance Tests**:
```typescript
// test/performance/patterned-lines.perf.spec.ts
test("1000 patterned edges during physics", async () => {
  // Create 1000 edges with pattern="star"
  // Run physics for 100 frames
  // Assert: Average FPS > 55
  // Assert: Average frame time < 18ms
});
```

**Deliverable**: 60 FPS achieved with 1000 patterned edges

---

### Phase 7: Testing & Documentation (1-2 days)

**Visual Tests**:
```typescript
// stories/PatternedLines.stories.ts
export const AllPatterns: Story = {
  render: () => {
    // Grid of 7 graphs, one per pattern type
    // Each from multiple camera angles
  }
};

// test/visual/patterned-lines.visual.spec.ts
for (const pattern of ["dot", "star", "dash", "diamond", "dash-dot", "sinewave", "zigzag"]) {
  test(`${pattern} pattern`, async () => {
    await captureScreenshots(pattern, ["start", "left", "top", "top-left-1", "top-left-2"]);
    await compareWithBaseline();
  });
}
```

**Unit Tests**:
```typescript
// test/meshes/PatternedLineMesh.test.ts
describe("PatternedLineMesh", () => {
  test("calculates discrete positions correctly", () => { ... });
  test("calculates connected positions correctly", () => { ... });
  test("adjusts mesh count with adaptive density", () => { ... });
  test("all geometries use XZ plane (Y=0)", () => {
    for (const pattern of patterns) {
      const geometry = createGeometry(pattern);
      const positions = geometry.positions;
      for (let i = 1; i < positions.length; i += 3) {
        assert.strictEqual(positions[i], 0, `Y must be 0 at index ${i}`);
      }
    }
  });
});
```

**Documentation**:
1. Update `CLAUDE.md` with pattern line usage examples
2. Add JSDoc comments to all public APIs
3. Update design doc with final implementation notes
4. Create examples in Storybook

**Deliverable**: All tests passing, documentation complete

---

## Timeline Summary

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| 0. Cleanup | 1.5 hours | Broken code removed |
| 1. Infrastructure | 2-3 days | Billboarding working |
| 2. Adaptive Density | 1 day | Dynamic mesh count |
| 3. Alternating Patterns | 1 day | Dash-dot working |
| 4. Connected Patterns | 2-3 days | Sinewave/zigzag working |
| 5. Integration | 1-2 hours | End-to-end working |
| 6. Performance | 1-2 days | 60 FPS achieved |
| 7. Testing | 1-2 days | All tests passing |

**Total: 9-12 days**

---

## Acceptance Criteria

- [ ] All 7 pattern types render correctly (dot, star, dash, diamond, dash-dot, sinewave, zigzag)
- [ ] Patterns face camera from all angles (billboarding works)
- [ ] Patterns show perspective foreshortening (smaller when farther)
- [ ] Connected patterns have no visible gaps (sinewave, zigzag)
- [ ] Discrete patterns maintain proper spacing (not touching)
- [ ] Patterns don't overlap nodes or arrowheads
- [ ] Adaptive density adjusts mesh count correctly (compress/expand, add/remove)
- [ ] Performance: 1000 patterned edges at 60 FPS during physics simulation
- [ ] All visual regression tests pass (from 5 camera angles)
- [ ] All performance tests pass
- [ ] All unit tests pass
- [ ] Documentation complete

---

## Technical Risks & Mitigation

### Risk 1: Geometry Plane Confusion
**Description**: Using wrong plane (XY instead of XZ) makes meshes invisible

**Mitigation**:
- ✅ Verification checklist in every geometry generator
- ✅ Unit test: Check Y=0 for all vertices
- ✅ Visual test: Verify visibility from all angles (screenshot script)
- ✅ Code review: All geometry creation must be reviewed

### Risk 2: Performance Degradation
**Description**: Too many position updates cause FPS drop below 60

**Mitigation**:
- ✅ Dirty tracking (already implemented in Edge.ts)
- ✅ Batch shader updates (reduce per-mesh overhead)
- ✅ Individual meshes (proven 35x faster than thin instances)
- ✅ Profile early and often
- ✅ Performance tests in CI

### Risk 3: Seamless Connection Gaps
**Description**: Sinewave/zigzag segments don't align perfectly, visible gaps at boundaries

**Mitigation**:
- ✅ Geometry endpoints MUST match exactly (unit test verification)
- ✅ Use consistent coordinate system (XZ plane, Y=0)
- ✅ Visual regression test specifically for gap detection
- ✅ Manual testing from multiple angles

### Risk 4: Adaptive Density Thrashing
**Description**: Line length oscillates near threshold, causing constant mesh add/remove

**Mitigation**:
- ✅ Hysteresis: ±1 mesh tolerance before adjusting
- ✅ Don't adjust on every frame, only when difference > threshold
- ✅ Performance test: Measure allocation rate during oscillating line length

---

## Key Design Decisions

### Decision 1: Individual Meshes (No Instances, No Pool)
**Rationale**:
- 35x faster for position updates (proven in Edge.ts)
- Required for per-mesh shader uniforms (lineDirection)
- Optimize for update speed (every frame) not creation speed (rare)

### Decision 2: World-Space Positioning (No Parent/Child)
**Rationale**:
- Simple: Direct position assignment
- Fast: No transform compensation needed
- Proven: Working demo uses this approach
- Compatible: Works with existing dirty tracking

### Decision 3: XZ Plane Geometry (Y=0)
**Rationale**:
- Matches working demo (verified in code)
- Face normal in ±Y maps to shader's "up" vector
- Proven to work with FilledArrowRenderer shader
- Consistent across all pattern types

### Decision 4: FilledArrowRenderer Shader
**Rationale**:
- Proven billboarding implementation
- Already tested from multiple angles
- Reuse existing shader optimization
- No need to reinvent billboarding logic

### Decision 5: Adaptive Density with Hysteresis
**Rationale**:
- Better visual quality (no sparse/compressed patterns)
- User requirement (compress/expand, add/remove)
- Minimal performance cost with hysteresis
- Provides consistent appearance across line lengths

### Decision 6: Batched Shader Updates
**Rationale**:
- Reduce overhead (1 camera query vs 10,000)
- All meshes on same line share lineDirection
- Proven pattern from FilledArrowRenderer
- Significant performance improvement

---

## Future Enhancements

1. **Custom User Patterns**: Allow users to define custom pattern shapes via callback
2. **Animated Patterns**: Move pattern meshes along line (marching ants effect)
3. **Gradient Patterns**: Vary mesh size/color along line length
4. **3D Patterns**: Helical or spiral patterns in 3D space
5. **Pattern Composition**: Combine multiple patterns on single line
6. **Bezier Support**: Apply patterns along curved bezier paths
7. **Mesh Pooling**: Add object pooling if profiling shows allocation bottleneck
8. **LOD Support**: Use fewer meshes for distant lines (frustum-based)

---

## Related Files

**Working Reference**:
- `tmp/mesh-based-patterned-line-demo.html` - Proven implementation (8 stars with billboarding)

**Core Implementation**:
- `src/meshes/PatternedLineMesh.ts` - NEW: Main class for pattern lines
- `src/meshes/PatternedLineRenderer.ts` - REFACTOR: Geometry generators and utilities
- `src/meshes/FilledArrowRenderer.ts` - REUSE: Billboarding shader
- `src/meshes/EdgeMesh.ts` - UPDATE: Integration point
- `src/Edge.ts` - UPDATE: Call PatternedLineMesh.update()

**Testing**:
- `stories/PatternedLines.stories.ts` - UPDATE: Visual examples
- `test/visual/patterned-lines.visual.spec.ts` - NEW: Visual regression tests
- `test/performance/patterned-lines.perf.spec.ts` - NEW: Performance tests
- `test/meshes/PatternedLineMesh.test.ts` - NEW: Unit tests
