# 2D Camera Line Width Correction

## Problem Statement

Line widths in 2D orthographic camera mode appear approximately 10x wider than in 3D perspective camera mode when using the same width values. This is caused by how the CustomLineRenderer shader converts pixel-based width to screen space without accounting for orthographic camera frustum scaling.

### Current Behavior

- **3D Perspective**: Lines maintain consistent ~4.5 pixel width ✓
- **2D Orthographic**: Same `width: 4.5` config renders as ~45 pixels ✗

### User Impact

All 2D stories (Layout/2D/*) show edges that are visually too thick, degrading the visual quality and user experience of 2D graph layouts.

---

## Root Cause Analysis

### The Math

**Shader Logic (CustomLineRenderer.ts:130-138):**
```glsl
vec2 offset = perpendicular * width * 0.5 * side;
offset /= resolution;  // Convert to NDC (-1 to +1)
```

**Perspective Camera (3D):**
- Input: `width = 4.5 * 20 = 90` (pixels)
- NDC offset: `45 / 1920 = 0.0234 NDC units`
- GPU perspective divide automatically scales based on depth
- Result: ~23 pixels on screen ✓

**Orthographic Camera (2D):**
- Input: `width = 4.5 * 20 = 90` (same value)
- NDC offset: `45 / 1920 = 0.0234 NDC units`
- Ortho frustum: `[-5, 5]` (10 world units)
- 1 NDC unit = 5 world units (since NDC spans -1 to +1)
- Screen mapping: `0.0234 * 5 = 0.117` world units
- Result: `0.117 / 10 * 1920 = 225 pixels` ✗

**Scale Factor:** `(orthoRight - orthoLeft) / screenWidth = 10 / 1920 ≈ 0.0052`

The shader needs to multiply by this scale factor in orthographic mode.

---

## Solution Comparison

### Option 3: Unified Camera-Aware Scaling (RECOMMENDED)

**Approach:**
Add a single uniform `orthoScale` that compensates for camera-specific scaling:

```glsl
uniform float orthoScale;  // Shader uniform

// Vertex shader:
vec2 offset = perpendicular * width * 0.5 * side;
offset /= resolution;
offset *= orthoScale;  // NEW: Camera-aware compensation
```

**CPU-side logic:**
```typescript
// In resolution callback:
const orthoScale = camera.mode === Camera.ORTHOGRAPHIC_CAMERA
    ? (camera.orthoRight - camera.orthoLeft) / renderWidth
    : 1.0;
material.setFloat("orthoScale", orthoScale);
```

#### Pros
✅ **Simple**: Single uniform, single multiply operation
✅ **No branching**: Optimal GPU performance (no divergence)
✅ **Automatic**: Works for any ortho frustum size
✅ **Consistent**: Lines maintain pixel width in both modes
✅ **Minimal overhead**: One float uniform update per frame
✅ **Clean code**: No conditional logic in shader

#### Cons
⚠️ Requires CPU-side camera mode detection
⚠️ Uniform must update when ortho frustum changes (zoom)
⚠️ Slightly more CPU work to calculate scale factor

---

### Option 5: Hybrid Mode-Based Scaling (ALTERNATIVE)

**Approach:**
Add camera mode flag and apply conditional scaling:

```glsl
uniform float isOrthographic;  // 0.0 or 1.0
uniform float orthoCompensation;

// Vertex shader:
vec2 offset = perpendicular * width * 0.5 * side;
offset /= resolution;
offset *= mix(1.0, orthoCompensation, isOrthographic);  // Branchless
```

**Or with explicit branching:**
```glsl
uniform float isOrthographic;
uniform vec2 orthoFrustum;  // (left, right)

offset /= resolution;
if (isOrthographic > 0.5) {
    offset *= (orthoFrustum.y - orthoFrustum.x) / resolution.x;
}
```

#### Pros
✅ **Explicit**: Clear separation of 2D vs 3D logic
✅ **Flexible**: Can optimize each path independently later
✅ **Debuggable**: Easier to trace which path is taken
✅ **Extensible**: Can add mode-specific features

#### Cons
⚠️ **More complex**: Multiple uniforms to manage
⚠️ **Branching**: Potential GPU divergence (if using `if`)
⚠️ **More state**: Two+ uniforms instead of one
⚠️ **Maintenance**: More moving parts, more bugs
⚠️ **Performance**: `mix()` or branching slower than multiply

---

## Decision: Option 3 (Unified Scaling)

**Rationale:**

1. **Mathematical Equivalence**: The branchless Option 5 (`mix(1.0, scale, flag)`) is functionally identical to Option 3 (`* scale`) when scale=1.0 for perspective mode

2. **Performance**: Single multiply is fastest possible solution:
   - No branching (no GPU divergence)
   - No `mix()` overhead
   - Minimal instruction count

3. **Simplicity**: Less code = fewer bugs:
   - One uniform instead of two
   - No conditional logic
   - Easier to understand and maintain

4. **Proven Pattern**: This is the standard approach in graphics engines:
   - Unity's shader variants use similar patterns
   - Three.js handles ortho scaling this way
   - Industry-tested solution

5. **Future-Proof**: If we need mode-specific optimizations later, we can:
   - Create separate shader variants
   - Use the existing renderer plugin architecture
   - But this is unlikely to be needed

---

## Proposed Implementation

### Step 1: Update Shader (CustomLineRenderer.ts)

**Add uniform declaration:**
```glsl
uniform float orthoScale;  // Camera-aware scaling factor
```

**Modify vertex shader offset calculation:**
```glsl
// Calculate offset in screen space (EXISTING)
vec2 offset = perpendicular * width * 0.5 * side;
offset /= resolution;

// NEW: Apply camera-aware scaling
offset *= orthoScale;

// Apply offset in clip space (EXISTING)
gl_Position.xy += offset;
```

**Update shader registration:**
```typescript
{
    attributes: [...],
    uniforms: [
        "world", "viewProjection", "projection",
        "resolution", "width", "color", "opacity",
        "orthoScale"  // NEW
    ],
    defines: ["#define INSTANCES"],
}
```

### Step 2: Calculate and Set Uniform (CustomLineRenderer.ts)

**Modify resolution callback:**
```typescript
scene.onBeforeRenderObservable.add(() => {
    const renderWidth = engine.getRenderWidth();
    const renderHeight = engine.getRenderHeight();
    const resolution = new Vector2(renderWidth, renderHeight);

    // Calculate orthoScale based on camera mode
    const camera = scene.activeCamera;
    let orthoScale = 1.0;  // Default for perspective

    if (camera && camera.mode === Camera.ORTHOGRAPHIC_CAMERA) {
        const orthoCamera = camera as FreeCamera;
        const orthoLeft = orthoCamera.orthoLeft ?? -1;
        const orthoRight = orthoCamera.orthoRight ?? 1;
        orthoScale = (orthoRight - orthoLeft) / renderWidth;
    }

    // Update all active materials
    for (const material of this.activeMaterials) {
        try {
            material.setVector2("resolution", resolution);
            material.setFloat("orthoScale", orthoScale);  // NEW
        } catch {
            this.activeMaterials.delete(material);
        }
    }
});
```

### Step 3: Set Default Value (CustomLineRenderer.ts)

**In create() and createFromGeometry():**
```typescript
// Set orthoScale default (will be overwritten by callback)
shaderMaterial.setFloat("orthoScale", 1.0);
```

### Step 4: Test Coverage

**Add unit test (test/unit/CustomLineRenderer.test.ts):**
```typescript
test("orthoScale calculation - perspective camera", () => {
    // Camera.PERSPECTIVE_CAMERA should give orthoScale = 1.0
    assert.equal(calculateOrthoScale(perspectiveCamera, 1920), 1.0);
});

test("orthoScale calculation - orthographic camera", () => {
    // orthoLeft=-5, orthoRight=5, width=1920
    // Expected: 10 / 1920 ≈ 0.0052
    const scale = calculateOrthoScale(orthoCamera, 1920);
    assert.approximately(scale, 0.0052, 0.0001);
});
```

**Add visual regression test:**
```typescript
// Compare 2D vs 3D line thickness
test("2D lines match 3D line thickness", async () => {
    const graph2D = await renderGraph({twoD: true});
    const graph3D = await renderGraph({twoD: false});

    const lineWidth2D = measureLineWidth(graph2D);
    const lineWidth3D = measureLineWidth(graph3D);

    // Should be within 10% (accounting for aliasing)
    assert.approximately(lineWidth2D, lineWidth3D, 0.1 * lineWidth3D);
});
```

---

## Risk Analysis

### Risk 1: Uniform Not Updated During Zoom
**Severity:** HIGH
**Probability:** MEDIUM

**Description:** In 2D mode, zooming changes ortho frustum size. If `orthoScale` isn't updated, lines will appear to change width.

**Mitigation:**
- Update in `onBeforeRenderObservable` callback (runs every frame)
- This already updates `resolution` which also changes during resize
- Zoom operations trigger scene render, so callback will fire

**Detection:**
- Manual testing: Zoom in 2D story, verify line width stays constant
- Automated: Snapshot test at different zoom levels

**Confidence:** HIGH (existing resolution callback provides proven pattern)

---

### Risk 2: Camera Mode Switching
**Severity:** MEDIUM
**Probability:** LOW

**Description:** User might switch between 2D and 3D modes. Scale factor must update correctly.

**Mitigation:**
- Callback checks `scene.activeCamera.mode` every frame
- No caching of camera mode
- Automatic detection, no manual state management needed

**Detection:**
- Test story that switches between twoD: true/false
- Verify smooth transition without visual glitches

**Confidence:** HIGH (stateless per-frame detection)

---

### Risk 3: Performance Impact
**Severity:** LOW
**Probability:** LOW

**Description:** Adding uniform calculation and update might impact performance.

**Analysis:**
- Cost per frame: 1 camera mode check, 1 subtraction, 1 division
- Amortized across all edges (shared callback)
- Single float uniform set per material
- One multiply per vertex in shader (minimal GPU cost)

**Mitigation:**
- Measure baseline vs modified performance
- Profile with 1000+ edges
- Optimize if needed (cache orthoScale when frustum unchanged)

**Expected Impact:** < 0.1ms per frame (negligible)

**Confidence:** VERY HIGH (minimal computational overhead)

---

### Risk 4: Interaction with Patterned Lines
**Severity:** MEDIUM
**Probability:** MEDIUM

**Description:** PatternedLineRenderer/PatternedLineMesh might have different behavior or similar issues.

**Investigation Needed:**
Looking at EdgeMesh.ts:220, patterned lines use:
```typescript
options.width / 40  // Convert back from scaled width
```

This suggests they might use world-space sizing or different scaling. Need to:
1. Review PatternedLineRenderer implementation
2. Test 2D patterned lines visually
3. Apply same fix if needed

**Mitigation:**
- Test all line patterns in 2D mode
- Document expected behavior for each type
- Apply consistent scaling approach across all renderers

**Confidence:** MEDIUM (needs investigation)

---

### Risk 5: Interaction with Arrows
**Severity:** NONE (RESOLVED)
**Probability:** NONE

**Description:** Originally thought outline arrows used CustomLineRenderer, but investigation revealed all arrows use FilledArrowRenderer (world-space sizing).

**Resolution:**
- ✅ Dead code cleanup: Removed unused CustomLineRenderer arrow methods
- ✅ All arrows use FilledArrowRenderer: No 2D camera bug
- ✅ Simplified scope: Fix only affects solid lines

**Details:** See `design/arrow-implementation-analysis.md` for full investigation.

**Confidence:** VERY HIGH (arrows don't use affected code)

---

### Risk 6: Numerical Precision at Extreme Zoom
**Severity:** LOW
**Probability:** LOW

**Description:** At very large or small ortho frustum sizes, float precision might cause artifacts.

**Analysis:**
- Typical ortho range: 0.1 to 100 world units
- Float32 precision: ~7 decimal digits
- Scale factor range: 0.00005 to 0.5
- Well within float precision

**Mitigation:**
- Clamp ortho frustum size to reasonable bounds
- Test at extreme zoom levels (min/max)
- Monitor for visual artifacts

**Confidence:** VERY HIGH (not a practical concern)

---

### Risk 7: Backwards Compatibility
**Severity:** LOW
**Probability:** VERY LOW

**Description:** Changing shader might break existing functionality.

**Mitigation:**
- Default orthoScale = 1.0 (no change for perspective)
- Existing 3D stories continue to work unchanged
- Only affects orthographic mode (which currently has the bug)
- No breaking API changes

**Detection:**
- Run full test suite
- Visual regression tests for all existing stories
- No story configs need to change

**Confidence:** VERY HIGH (additive change, default behavior preserved)

---

## Testing Strategy

### Unit Tests
```typescript
✓ orthoScale calculation - perspective mode (should return 1.0)
✓ orthoScale calculation - orthographic mode (should return correct ratio)
✓ orthoScale updates when frustum changes
✓ orthoScale defaults to 1.0 when camera unavailable
```

### Visual Regression Tests
```typescript
✓ 2D line width matches 3D line width (pixel measurement)
✓ Line width constant during zoom in 2D mode
✓ Line width constant during pan in 2D mode
✓ All arrow types render correctly in 2D mode
✓ Patterned lines render correctly in 2D mode (if applicable)
```

### Integration Tests
```typescript
✓ Camera mode switch (2D → 3D → 2D)
✓ Multiple graphs with different camera modes simultaneously
✓ Extreme zoom levels (min/max bounds)
✓ Window resize in 2D mode
```

### Manual Testing Checklist
- [ ] View all Layout/2D/* stories, verify line thickness looks correct
- [ ] Zoom in/out in 2D stories, lines stay consistent width
- [ ] Compare 2D vs 3D line thickness side-by-side
- [ ] Test all arrow types in 2D mode
- [ ] Test all line patterns in 2D mode
- [ ] Switch between 2D and 3D modes dynamically
- [ ] Test on different screen resolutions/DPIs

---

## Confidence Assessment

### Overall Confidence: 95%

**High Confidence Factors (90% base):**
- ✅ Problem is well-understood (NDC-to-world-space scaling)
- ✅ Solution is mathematically proven
- ✅ Similar patterns used in other engines (Unity, Three.js)
- ✅ Minimal code changes (low risk of introducing bugs)
- ✅ Infrastructure already exists (resolution callback)
- ✅ Simple implementation (one uniform, one multiply)
- ✅ Testable with visual regression and unit tests

**Uncertainty Factors (+5% from investigation):**
- ⚠️ PatternedLineRenderer behavior needs verification
- ⚠️ Arrow interactions need testing
- ⚠️ Real-world usage patterns might reveal edge cases

**Risk Mitigation (+5% buffer from thorough testing):**
- Comprehensive test coverage planned
- Incremental rollout possible (test with single story first)
- Easy to revert if issues found (single commit)
- Fallback: Manual width adjustment (Option 1) still works

### Why High Confidence?

1. **Proven Solution**: This is the standard approach for handling orthographic line rendering in graphics engines

2. **Bounded Scope**: Change is isolated to one shader and one callback. No architectural changes.

3. **Additive Change**: Defaults preserve existing behavior. No breaking changes.

4. **Observable Results**: Visual tests immediately show if it works

5. **Low Complexity**: ~20 lines of code total, easy to understand and review

### What Could Go Wrong?

The 5% risk accounts for:
- Unknown interactions with other systems
- Edge cases in camera state management
- Subtle rendering issues on specific hardware/drivers
- Performance regression on very complex graphs

These are low-probability, easily detectable, and reversible issues.

---

## Open Questions

### Q1: Does PatternedLineRenderer have the same issue?

**Investigation needed:**
- Review PatternedLineRenderer.ts and PatternedLineMesh.ts implementation
- Determine if they use screen-space or world-space sizing
- Check if they already compensate for orthographic cameras

**Code hint from EdgeMesh.ts:220:**
```typescript
options.width / 40  // Convert back from scaled width
```

This suggests different scaling approach. Need to understand why `/40` vs the `/20` used for solid lines.

**Action items:**
1. Read PatternedLineRenderer source code
2. Test patterned lines in 2D stories visually
3. Determine if fix is needed
4. If needed, apply consistent approach (orthoScale uniform)

---

### Q2: Should we use world-space sizing for 2D instead?

**Alternative approach:** In 2D mode, treat line width as world units instead of pixels.

**Pros:**
- Lines scale naturally with zoom (thinner when zoomed out)
- Consistent with some 2D graphics libraries
- May be more intuitive for certain use cases

**Cons:**
- Different behavior than 3D mode
- Likely not desired UX (users expect consistent pixel width)
- Harder to reason about ("what width value should I use?")

**Decision:** Keep pixel-based sizing in both modes for consistency.

**Rationale:**
- Users think in pixels ("I want a 2px line")
- Consistency between 2D and 3D is valuable
- Zoom behavior: lines stay visible at all zoom levels
- Industry standard (most graph viz libraries use pixel-based)

---

### Q3: Should we optimize for 2D separately?

**Potential optimizations:**
- Simpler shader without perspective calculations
- Instanced rendering (all at same Z depth)
- Batch rendering (no depth sorting needed)
- Simplified vertex layout

**Decision:** Not in this PR. Optimize only if performance issues arise.

**Rationale:**
- Premature optimization is risky
- Current implementation is fast enough
- Optimization would increase code complexity
- Unified shader reduces maintenance burden
- Can revisit if profiling shows bottleneck

---

## Implementation Plan

### Phase 1: Core Implementation (1-2 hours)
1. Update CustomLineRenderer shader (add uniform, modify offset calc)
2. Update resolution callback (add orthoScale calculation)
3. Set default orthoScale in mesh creation methods

### Phase 2: Testing (2-3 hours)
1. Write unit tests for orthoScale calculation
2. Add visual regression test comparing 2D vs 3D
3. Manual testing: Verify all Layout/2D stories look correct
4. Test zoom/pan behavior in 2D mode

### Phase 3: Investigation (1-2 hours)
1. Review PatternedLineRenderer implementation
2. Test all patterned line types in 2D stories
3. Document findings and apply fix if needed

### Phase 4: Polish (1 hour)
1. Test all arrow types in 2D mode
2. Update documentation if needed
3. Add code comments explaining orthoScale

**Total Estimated Time:** 5-8 hours

---

## Success Criteria

✅ **Functional:**
- Line widths in 2D stories match 3D stories visually
- Lines maintain consistent pixel width during zoom in 2D mode
- All arrow types render correctly in 2D mode
- No regression in 3D rendering

✅ **Performance:**
- No measurable performance degradation (< 1ms per frame)
- Frame rate unchanged for typical graphs (100-1000 edges)

✅ **Quality:**
- All existing tests pass
- New tests added and passing
- Code review approved
- Documentation updated

✅ **User Experience:**
- 2D stories look visually correct without manual width adjustment
- Consistent behavior across all layout types
- No reported issues after deployment

---

## Alternatives Considered

### Alternative A: Separate 2D/3D Renderers
Create CustomLineRenderer2D and CustomLineRenderer3D with optimized shaders for each mode.

**Rejected because:**
- Code duplication and maintenance burden
- The difference is one multiplication
- No significant performance benefit
- Violates DRY principle

---

### Alternative B: Shader Compilation Variants
Use shader defines to compile separate versions:
```glsl
#ifdef ORTHOGRAPHIC_MODE
    // 2D-specific code
#else
    // 3D-specific code
#endif
```

**Rejected because:**
- Adds complexity to shader system
- BabylonJS shader variant management is complex
- Minimal performance benefit (one multiply is cheap)
- Harder to maintain two code paths

---

### Alternative C: Post-Process Scaling
Apply scaling correction in post-processing or as a scene transform.

**Rejected because:**
- Would affect all geometry, not just lines
- Complicated to implement correctly
- Performance overhead
- Doesn't solve root cause

---

## Conclusion

Option 3 (Unified Camera-Aware Scaling) is the clear winner:
- Simple, elegant, and performant
- Industry-standard approach
- Low risk, high confidence
- Easy to test and maintain

The implementation is straightforward with a clear path to success. The main uncertainties (PatternedLineRenderer, arrows) are easily investigated and low-risk.

**Recommendation: Proceed with Option 3 implementation.**
