# Feature Design: Complete Edge Style Implementation

## Overview

**User Value**:
- Enhanced visualization capabilities with a comprehensive set of edge styling options
- Better alignment with industry-standard graph visualization tools (Graphviz, Cytoscape)
- Improved ability to differentiate edge types and convey semantic meaning through visual styling
- Support for curved edges, bidirectional arrows, and advanced visual effects
- Rich tooltips and labels for better edge annotation

**Technical Value**:
- Complete implementation of the EdgeStyle configuration schema (100% coverage)
- Establishes extensible patterns for future edge styling features
- Maintains consistency with existing mesh caching and rendering architecture
- Enables complex graph visualizations with production-grade styling capabilities

## Current State Analysis

### Implemented Features
Currently, graphty-element implements only basic edge styling:

**Arrow Types Implemented** (src/meshes/EdgeMesh.ts:69-88):
- `normal` - Standard filled triangular arrow (using GreasedLineTools.GetArrowCap)
- `none` - No arrowhead

**Line Types Implemented**:
- `solid` - Standard solid line (default)
- Animated lines (via `animationSpeed` property)

### Architecture Overview
- **EdgeMesh.ts**: Factory class for creating edge line and arrowhead meshes using Babylon.js GreasedLine system
- **Edge.ts**: Manages edge lifecycle, positioning, and style updates
- **EdgeStyle.ts**: Zod schema defining all available styles (config layer)
- **MeshCache**: Caching system for mesh instances (performance optimization)

## Requirements

Based on src/config/EdgeStyle.ts and referenced documentation, the following styles need implementation:

### Unimplemented Arrow Types (12 types)
From EdgeStyle.ts lines 6-23, the following arrow types are defined but not implemented:

1. **`inverted`** - Inverted/reversed triangle (triangle pointing away from target)
2. **`dot`** - Filled circular dot
3. **`open-dot`** (maps to `odot` in Graphviz) - Hollow/unfilled circle
4. **`tee`** - T-shaped line terminator (perpendicular line)
5. **`empty`** - Hollow/unfilled triangle
6. **`diamond`** - Filled diamond/rhombus shape
7. **`open-diamond`** (maps to `odiamond`) - Hollow/unfilled diamond
8. **`crow`** - Crow's foot notation (three lines forming a fork)
9. **`box`** - Filled rectangular shape
10. **`open`** - Open-ended V-shape (no back edge)
11. **`half-open`** - Partially open arrow (one side open)
12. **`vee`** - Wide V-shaped opening (wider angle than normal)

### Unimplemented Line Types (6 types)
From EdgeStyle.ts lines 33-42, the following line types are defined but not implemented:

1. **`dash`** - Dashed line pattern
2. **`dash-dot`** - Alternating dash and dot pattern
3. **`dots`** - Dotted line pattern
4. **`equal-dash`** - Evenly spaced dashes
5. **`sinewave`** - Wavy/sinusoidal line pattern
6. **`zigzag`** - Angular zigzag pattern

### Unimplemented Arrow Properties (4 properties)
From EdgeStyle.ts ArrowStyle schema (lines 25-31), the following properties are defined but not properly implemented:

1. **`size`** - Arrow size multiplier (currently ignored, uses line width instead)
2. **`color`** - Arrow-specific color (currently ignored, uses line color instead)
3. **`opacity`** - Arrow opacity (currently not implemented)
4. **`text`** - Text label on arrow (currently not implemented)

**Current Issue** (src/Edge.ts:105-108):
- Arrow creation ignores `size`, `color`, and `opacity` from ArrowStyle
- Uses `line.width` instead of `arrowHead.size`
- Uses `line.color` instead of `arrowHead.color`

### Unimplemented Line Properties (2 properties)
From EdgeStyle.ts LineStyle schema (lines 44-51):

1. **`opacity`** - Line transparency (defined but not implemented)
2. **`bezier`** - Curved edges using Bezier curves (defined but not implemented)

### Unimplemented Edge Features (3 features)
From EdgeStyle.ts EdgeStyle schema (lines 53-61):

1. **`arrowTail`** - Arrow at source node end (defined but completely unimplemented)
2. **`tooltip`** - Tooltip on hover (defined but likely not implemented)
3. **`effects: glow`** - Glow effect around edges (commented out, not implemented)

**Note**: `label` appears to be implemented (src/Edge.ts:129-131, 368-473) but needs verification that all RichTextStyle properties are supported.

### Visual Reference Sources
- **Graphviz Arrow Documentation**: https://graphviz.org/docs/attr-types/arrowType/
- **Cytoscape Style Manual**: https://manual.cytoscape.org/en/stable/Styles.html#available-shapes-and-line-styles
- **Babylon.js Glow Layer**: https://playground.babylonjs.com/#H1LRZ3#35

## Proposed Solution

### User Interface/API

No changes to the external API are required - the EdgeStyle configuration schema already defines all types. Users will configure styles using the existing approach:

```typescript
// Example usage - Complete edge styling
const style = {
  arrowHead: {
    type: "diamond",        // All 12 arrow types supported
    size: 1.5,              // Independent size control
    color: "#FF0000",       // Independent color control
    opacity: 0.8,           // Transparency support
    text: {                 // Optional text label on arrow
      text: "→",
      fontSize: 12,
      color: "#FFFFFF"
    }
  },
  arrowTail: {
    type: "tee",            // Source-end arrow styling
    size: 1.0,
    color: "#0000FF",
    opacity: 1.0
  },
  line: {
    type: "dash",           // All 6 line patterns supported
    width: 0.5,
    color: "#00FF00",
    opacity: 0.7,           // Line transparency
    animationSpeed: 0.1,    // Can combine with patterns
    bezier: true            // Curved edges
  },
  label: {
    enabled: true,
    text: "Connection",
    fontSize: 14,
    color: "#000000"
  },
  tooltip: {
    enabled: true,
    text: "Edge details here"
  }
  // effects: { glow: true }  // Future: glow effects
};
```

### Technical Architecture

#### Components

**1. EdgeMesh.ts Enhancements**

Add new static methods for arrow shape generation and advanced features:

```typescript
// New methods to add to EdgeMesh class
class EdgeMesh {
  // Existing: createArrowHead() - will be refactored to accept size, color, opacity

  // New arrow generation methods (one per shape type)
  private static createInvertedArrow(length: number, width: number): {points: number[], widths: number[]}
  private static createDotArrow(length: number, width: number, filled: boolean): {points: number[], widths: number[]}
  private static createTeeArrow(length: number, width: number): {points: number[], widths: number[]}
  private static createEmptyArrow(length: number, width: number): {points: number[], widths: number[]}
  private static createDiamondArrow(length: number, width: number, filled: boolean): {points: number[], widths: number[]}
  private static createCrowArrow(length: number, width: number): {points: number[], widths: number[]}
  private static createBoxArrow(length: number, width: number, filled: boolean): {points: number[], widths: number[]}
  private static createOpenArrow(length: number, width: number): {points: number[], widths: number[]}
  private static createHalfOpenArrow(length: number, width: number): {points: number[], widths: number[]}
  private static createVeeArrow(length: number, width: number): {points: number[], widths: number[]}

  // New line pattern generation methods
  private static createDashedLine(points: number[], dashLength: number, gapLength: number): number[]
  private static createDotDashLine(points: number[], dashLength: number, dotSpacing: number): number[]
  private static createDottedLine(points: number[], dotSpacing: number): number[]
  private static createSinewaveLine(points: number[], amplitude: number, frequency: number): number[]
  private static createZigzagLine(points: number[], amplitude: number, frequency: number): number[]

  // New bezier curve generation
  private static createBezierLine(srcPoint: Vector3, dstPoint: Vector3, controlPoints?: Vector3[]): number[]

  // Arrow property support (refactor existing methods)
  static createArrowHead(
    cache: MeshCache,
    styleId: string,
    options: ArrowHeadOptions & {size?: number, opacity?: number}, // Add size, opacity
    scene: Scene
  ): AbstractMesh | null

  // Arrow text label support
  private static createArrowText(
    arrow: AbstractMesh,
    textConfig: RichTextStyle,
    scene: Scene
  ): RichTextLabel
}
```

**2. Arrow Shape Geometry**

Each arrow type will be defined using GreasedLine point arrays and width distributions:

- **Filled shapes** (normal, inverted, dot, diamond, box): Use solid geometry with filled interiors
- **Hollow shapes** (empty, open-dot, open-diamond): Use outline-only geometry with transparent centers
- **Line-based shapes** (tee, open, crow, vee): Use pure line segments

**3. Line Pattern Implementation**

Line patterns will be implemented using two approaches:

**Approach A: Point Interpolation** (for dash, dot patterns)
- Modify the base point array to include gaps
- Use GreasedLine visibility features to create breaks

**Approach B: Geometry Generation** (for sinewave, zigzag)
- Generate additional interpolated points along the edge path
- Apply mathematical functions to offset points perpendicular to edge direction
- Use denser point arrays to create smooth curves

**4. Edge.ts Enhancements**

Significant additions required to support all features:

```typescript
export class Edge {
  // Existing properties
  arrowMesh: AbstractMesh | null = null;

  // New properties
  arrowTailMesh: AbstractMesh | null = null;        // Tail arrow at source
  arrowHeadLabel: RichTextLabel | null = null;      // Text on head arrow
  arrowTailLabel: RichTextLabel | null = null;      // Text on tail arrow
  tooltip: RichTextLabel | null = null;             // Hover tooltip
  glowLayer: GlowLayer | null = null;               // Optional glow effect

  // Updated constructor to handle:
  // - Arrow head size, color, opacity, text
  // - Arrow tail creation and styling
  // - Line opacity
  // - Bezier curve generation
  // - Tooltip creation

  // New methods
  private createTooltip(styleConfig: EdgeStyleConfig): RichTextLabel
  private applyOpacity(mesh: AbstractMesh, opacity: number): void
  private createBezierEdge(srcPoint: Vector3, dstPoint: Vector3): void

  // Updated methods
  update(): void                    // Handle bezier curves, tail arrows
  updateStyle(styleId: EdgeStyleId): void  // Update all new properties
}

#### Data Model

**New Constants** (add to src/constants/meshConstants.ts):

```typescript
export const EDGE_CONSTANTS = {
  // ... existing constants ...

  // Arrow shape dimensions
  ARROW_DOT_RADIUS_MULTIPLIER: 0.4,
  ARROW_DIAMOND_ASPECT_RATIO: 1.5,
  ARROW_BOX_ASPECT_RATIO: 1.0,
  ARROW_CROW_FORK_ANGLE: 30, // degrees
  ARROW_VEE_ANGLE: 60, // degrees (wider than normal ~45°)
  ARROW_HALF_OPEN_RATIO: 0.5,

  // Line pattern parameters
  DASH_LENGTH_MULTIPLIER: 3, // relative to line width
  DASH_GAP_MULTIPLIER: 2,
  DOT_LENGTH_MULTIPLIER: 0.5,
  DOT_GAP_MULTIPLIER: 1.5,
  SINEWAVE_AMPLITUDE_MULTIPLIER: 2,
  SINEWAVE_FREQUENCY_DEFAULT: 0.5, // cycles per unit length
  ZIGZAG_AMPLITUDE_MULTIPLIER: 2,
  ZIGZAG_FREQUENCY_DEFAULT: 1.0,

  // Bezier curve parameters
  BEZIER_CONTROL_POINT_OFFSET: 0.3, // Distance from line for automatic control points
  BEZIER_POINT_DENSITY: 20, // Points per unit length for smooth curves

  // Glow effect parameters
  GLOW_INTENSITY_DEFAULT: 0.5,
  GLOW_BLUR_KERNEL_SIZE: 64,

  // Opacity defaults
  DEFAULT_ARROW_OPACITY: 1.0,
  DEFAULT_LINE_OPACITY: 1.0,
} as const;
```

**No changes to EdgeStyle.ts** - configuration schema is already complete

#### Integration Points

1. **EdgeMesh.createArrowHead()** (src/meshes/EdgeMesh.ts:53-90)
   - Refactor to use switch statement on arrow type
   - Delegate to specific arrow generation methods
   - Maintain existing caching behavior

2. **EdgeMesh.create()** (src/meshes/EdgeMesh.ts:36-51)
   - Add line pattern generation logic
   - Handle both animated and patterned lines
   - Consider interaction: animated + patterned = animated pattern

3. **Edge constructor** (src/Edge.ts:66-132)
   - Add support for `arrowTail` alongside existing `arrowHead`
   - Create second arrow mesh when `arrowTail` is configured
   - Position tail arrow at source node intercept point

4. **Edge.transformArrowCap()** (src/Edge.ts:263-320)
   - Extend to handle both head and tail arrows
   - Calculate intercept points for both ends
   - Apply correct rotation (tail points away from source)

### Implementation Approach

Implementation will be broken into 10 phases for incremental delivery:

#### Phase 1: Arrow Property Support (1-2 days)
**Goal**: Fix existing arrow implementation to properly use size, color, and opacity properties

**Quick Win** - This is a critical foundation for all arrow work

1. Refactor `EdgeMesh.createArrowHead()` signature:
   - Accept `size`, `color`, `opacity` parameters
   - Apply size multiplier to arrow dimensions
   - Apply color to arrow material
   - Apply opacity/alpha to arrow material

2. Update `Edge` constructor and `updateStyle()`:
   - Pass `arrowHead.size` instead of `line.width`
   - Pass `arrowHead.color` instead of `line.color`
   - Pass `arrowHead.opacity`

3. Add unit tests for arrow properties
4. Create Storybook story demonstrating property control

**Deliverable**: Arrow head properly respects size, color, opacity configuration

#### Phase 2: Line Opacity (1 day)
**Goal**: Implement line transparency support

**Quick Win** - Simple addition

1. Update `EdgeMesh.create()` to apply opacity from `line.opacity`
2. Handle opacity for both static and animated lines
3. Ensure opacity works with line patterns (when implemented)
4. Add unit tests and Storybook story

**Deliverable**: Lines support transparency

#### Phase 3: Simple Filled Arrow Shapes (2-3 days)
**Goal**: Implement basic geometric arrows that use filled shapes

1. Implement arrow types:
   - `inverted` - Reuse normal arrow geometry, flip direction
   - `dot` - Generate circle points using trigonometry
   - `diamond` - Create rhombus from 4 corner points
   - `box` - Create rectangle from 4 corner points

2. Refactor `EdgeMesh.createArrowHead()` to use type-based routing
3. Add unit tests for each arrow type
4. Create Storybook stories showing all arrow types
5. Update visual regression tests

**Deliverable**: 4 new arrow types working with proper property support

#### Phase 4: Hollow and Line-Based Arrows (2-3 days)
**Goal**: Implement outline-only and line-based arrow shapes

1. Implement arrow types:
   - `empty` - Hollow triangle (outline only)
   - `open-dot` - Hollow circle
   - `open-diamond` - Hollow diamond
   - `tee` - Perpendicular line
   - `open` - V-shape without back edge
   - `half-open` - Asymmetric arrow
   - `vee` - Wide V-shape
   - `crow` - Three-pronged fork

2. Develop technique for hollow shapes using GreasedLine
3. Add unit tests and stories
4. Update visual regression tests

**Deliverable**: All 12 arrow types fully implemented

#### Phase 5: Arrow Tail Support (2 days)
**Goal**: Enable styling of both ends of edges

1. Add `arrowTailMesh` property to Edge class
2. Create tail arrow in Edge constructor when `arrowTail` configured
3. Modify `transformArrowCap()` to handle both head and tail
4. Add tail-specific intercept calculation
5. Handle tail rotation (points away from source, not toward destination)
6. Update cache keys to include tail configuration
7. Add unit tests and stories for bidirectional arrows

**Deliverable**: Full bidirectional arrow support (head + tail)

#### Phase 6: Dashed Line Patterns (2-3 days)
**Goal**: Implement line patterns that require point array manipulation

1. Implement line types:
   - `dash` - Standard dashed pattern
   - `dash-dot` - Dash-dot alternating pattern
   - `dots` - Dotted pattern
   - `equal-dash` - Evenly spaced dashes

2. Create point interpolation algorithm
3. Handle pattern scaling based on edge length
4. Ensure patterns work with line opacity
5. Test with various edge lengths and widths
6. Add unit tests and stories

**Deliverable**: 4 dashed/dotted line patterns working

#### Phase 7: Geometric Line Patterns (3-4 days)
**Goal**: Implement complex line patterns that require geometry generation

1. Implement line types:
   - `sinewave` - Sinusoidal curve pattern
   - `zigzag` - Angular zigzag pattern

2. Develop perpendicular offset algorithm
3. Implement point density calculation (ensure smooth curves)
4. Handle pattern parameterization (frequency, amplitude)
5. Optimize performance for long edges
6. Add unit tests and stories

**Deliverable**: All 6 line patterns fully implemented

#### Phase 8: Bezier Curved Edges (3-4 days)
**Goal**: Implement curved edges using Bezier curves

**High Value** - Major visual enhancement

1. Implement `createBezierLine()` in EdgeMesh:
   - Generate Bezier curve points from src/dst
   - Support automatic control point calculation
   - Support user-provided control points (future)
   - Optimize point density for visual quality

2. Update Edge class:
   - Detect `line.bezier` configuration
   - Generate bezier points instead of straight line
   - Handle arrow positioning on curves
   - Update ray calculation for curved edges

3. Test edge cases:
   - Very short edges
   - Self-loops (require special handling)
   - Multiple edges between same nodes

4. Add unit tests and Storybook stories

**Deliverable**: Edges support bezier curves

#### Phase 9: Arrow Text Labels & Tooltips (2-3 days)
**Goal**: Add text annotations to arrows and edge tooltips

1. Implement arrow text labels:
   - Create `arrowHeadLabel` and `arrowTailLabel` properties
   - Position labels on/near arrow heads
   - Use RichTextLabel for rendering
   - Handle label visibility and sizing

2. Implement edge tooltips:
   - Create `tooltip` property
   - Show on edge hover
   - Position at hover point or edge midpoint
   - Handle tooltip visibility state

3. Add unit tests and Storybook stories

**Deliverable**: Arrows can have text labels, edges can have tooltips

#### Phase 10: Glow Effects (Optional) (2-3 days)
**Goal**: Add glow effect support for edges

**Low Priority** - Visual polish feature

1. Research Babylon.js GlowLayer integration
2. Implement edge glow:
   - Add `glowLayer` property to Edge
   - Apply glow to edge mesh when configured
   - Support glow intensity configuration
   - Handle glow with transparency

3. Test performance impact
4. Add configuration to enable/disable globally
5. Add unit tests and Storybook story

**Deliverable**: Edges support optional glow effects

#### Phase 11: Polish and Documentation (2-3 days)
**Goal**: Ensure production readiness

1. Performance optimization
   - Profile all new features
   - Optimize geometry generation
   - Review cache effectiveness
   - Set performance budgets

2. Edge case handling
   - Very short edges
   - Self-loops
   - Overlapping nodes
   - Zero-width lines
   - Extreme opacity values

3. Documentation
   - Update CLAUDE.md with all new features
   - Add JSDoc comments to all new methods
   - Create comprehensive Storybook examples
   - Document all pattern parameters
   - Create migration guide for users

4. Final testing
   - Run full test suite
   - Visual regression test validation
   - Cross-browser testing
   - Performance testing with large graphs
   - Manual testing of all combinations

**Deliverable**: Production-ready, fully-documented implementation

## Acceptance Criteria

### Functional Requirements

**Arrow Types & Properties:**
- [ ] All 12 arrow types render correctly at various sizes and angles
- [ ] Arrow `size` property properly scales arrows independently from line width
- [ ] Arrow `color` property allows arrows to have different colors than lines
- [ ] Arrow `opacity` property supports transparency (0.0 to 1.0)
- [ ] Arrow `text` labels render on arrow heads when configured
- [ ] Arrow tail (`arrowTail`) can be configured independently from arrow head
- [ ] Arrows correctly position at node intersection points for all shapes
- [ ] Arrow properties work with all 12 arrow types

**Line Types & Properties:**
- [ ] All 6 line patterns render correctly for edges of varying lengths
- [ ] Line `opacity` property supports transparency
- [ ] Line `bezier` creates curved edges instead of straight lines
- [ ] Line patterns scale appropriately with edge width
- [ ] Line patterns work with opacity
- [ ] All styles work with animated edges (animationSpeed > 0)

**Edge Features:**
- [ ] Edge labels display correctly (verify all RichTextStyle properties)
- [ ] Edge tooltips appear on hover
- [ ] Tooltips disappear when not hovering
- [ ] Glow effects apply to edges when configured (optional)

**System Integration:**
- [ ] Mesh caching works correctly for all new arrow and line types
- [ ] Style changes (via `updateStyle()`) properly dispose and recreate meshes
- [ ] Bezier curves work with all arrow types
- [ ] Bezier curves handle self-loops correctly
- [ ] All features work in both 2D and 3D modes

### Visual Quality Requirements
- [ ] Arrow shapes match Graphviz reference visuals
- [ ] Arrow size scaling maintains proportions
- [ ] Arrow opacity blends correctly with background
- [ ] Arrow text labels are readable and properly positioned
- [ ] Line patterns are evenly distributed along edge length
- [ ] Hollow shapes have consistent outline thickness
- [ ] No visual artifacts at edge endpoints or arrow junctions
- [ ] Patterns remain stable during layout animations
- [ ] Bezier curves are smooth without visible segments
- [ ] Bezier curves maintain consistent curvature
- [ ] Tooltips are readable and properly positioned
- [ ] Glow effects don't cause performance degradation

### Performance Requirements
- [ ] New arrow types have < 5% performance impact vs current implementation
- [ ] Arrow property changes don't cause full mesh regeneration
- [ ] Line pattern generation completes in < 10ms for typical edges
- [ ] Bezier curve generation completes in < 15ms for typical edges
- [ ] Mesh caching reduces duplicate geometry creation by > 90%
- [ ] No memory leaks when switching styles repeatedly
- [ ] Tooltip show/hide has minimal performance impact
- [ ] Glow effects add < 10% overhead when enabled
- [ ] Graph with 1000 edges renders in < 3 seconds

### Code Quality Requirements
- [ ] Unit test coverage > 80% for new code
- [ ] All new arrow types have visual regression tests
- [ ] All new line patterns have visual regression tests
- [ ] TypeScript strict mode compliance maintained
- [ ] ESLint passes without disabling rules
- [ ] No increase in build bundle size > 10%

### Documentation Requirements
- [ ] JSDoc comments on all public methods
- [ ] Storybook stories demonstrating all 12 arrow types
- [ ] Storybook stories demonstrating all 6 line patterns
- [ ] Storybook story showing arrow property control (size, color, opacity)
- [ ] Storybook story showing arrow head + tail combinations
- [ ] Storybook story demonstrating bezier curves
- [ ] Storybook story showing arrow text labels
- [ ] Storybook story demonstrating edge tooltips
- [ ] Storybook story showing glow effects (if implemented)
- [ ] Updated CLAUDE.md with all new capabilities
- [ ] Migration guide for existing users
- [ ] Performance tuning guide

## Technical Considerations

### Performance

**Impact**:
- Additional arrow generation methods will increase initial parse time (minimal)
- Complex line patterns (sinewave, zigzag) will require more points, increasing vertex count
- Each unique arrow type requires separate mesh caching

**Mitigation**:
- Lazy generation - only create geometries for types actually used
- Point density optimization - use minimum points needed for visual quality
- Aggressive mesh caching - cache keyed on full style configuration
- LOD consideration - could simplify complex patterns at far zoom levels (future)

### Security

**Considerations**:
- All geometry generation uses validated configuration from Zod schemas
- No user-provided arbitrary code execution
- No external resource loading

**Measures**:
- Input validation via existing EdgeStyle schema
- Bounds checking on all generated coordinates
- Safe math operations (no division by zero, NaN handling)

### Compatibility

**Backward Compatibility**:
- ✅ No breaking changes to existing API
- ✅ Default behavior unchanged (`normal` arrow, `solid` line)
- ✅ Existing styles continue to work without modification
- ✅ Cache key format remains compatible

**Browser Compatibility**:
- ✅ Uses existing Babylon.js GreasedLine system (already cross-browser)
- ✅ No new WebGL features required
- ✅ Graceful degradation not needed (required features already present)

**Future Compatibility**:
- Architecture allows adding new arrow types without modifying core logic
- Pattern generation abstracted for potential WebGL shader optimization later
- Configuration schema can be extended with new properties (size variants, etc.)

### Testing

**Testing Strategy**:

1. **Unit Tests** (Vitest)
   - Test each arrow generation method with various dimensions
   - Test line pattern point generation algorithms
   - Test edge cases (zero width, very small/large sizes)
   - Test caching behavior for all types

2. **Visual Regression Tests** (Playwright + Chromatic)
   - Snapshot test for each arrow type at standard size
   - Snapshot test for each line pattern
   - Snapshot test for arrow head + tail combinations
   - Snapshot test for interaction with animated edges
   - Snapshot test for various edge lengths and angles

3. **Integration Tests**
   - Test style changes at runtime
   - Test with various layout algorithms
   - Test performance with large graphs (100+ edges)
   - Test memory cleanup on mesh disposal

4. **Manual Testing Checklist**
   - Verify visual accuracy against Graphviz reference
   - Test all arrow types on curved edges (if Bezier enabled)
   - Test all patterns with varying zoom levels
   - Test with different line widths (0.1 to 10)
   - Test color and opacity variations

## Risks and Mitigation

### Risk: Complex Geometry Generation Performance
**Impact**: High - Could make large graphs unusable
**Likelihood**: Medium
**Mitigation**:
- Early performance profiling with large test graphs (1000+ edges)
- Implement point density optimization algorithms
- Consider Web Worker for geometry generation if needed
- Fall back to simpler patterns for distant/small edges (LOD)
- Monitor and set max point limits per edge

### Risk: Hollow Shape Rendering Issues
**Impact**: Medium - Hollow arrows may not display correctly
**Likelihood**: Medium
**Mitigation**:
- Research GreasedLine transparency and outline-only rendering early
- Test prototype hollow shapes in isolation before full implementation
- Consider alternative: use thin outlined meshes instead of pure lines
- Document limitations if some hollow styles require approximations

### Risk: Pattern Distortion on Short Edges
**Impact**: Medium - Patterns may look wrong on very short edges
**Likelihood**: High
**Mitigation**:
- Implement minimum edge length threshold for patterns
- Scale pattern parameters based on edge length
- Fall back to solid line for very short edges (< 2 units)
- Add configuration option for pattern scaling behavior

### Risk: Cache Key Explosion
**Impact**: Low - Too many cache entries could increase memory
**Likelihood**: Low
**Mitigation**:
- Cache keys based on full style object (already planned)
- Implement cache size limits with LRU eviction
- Monitor cache hit rate in development
- Document recommended style reuse patterns

### Risk: Visual Inconsistency with Reference
**Impact**: Medium - Users expect Graphviz-like appearance
**Likelihood**: Medium
**Mitigation**:
- Create side-by-side comparison tool (Graphviz vs graphty-element)
- Include reference images in Storybook stories
- Iterate on geometry based on visual comparison
- Document intentional differences (if any)

### Risk: Testing Coverage Gaps
**Impact**: Medium - Bugs may slip into production
**Likelihood**: Medium
**Mitigation**:
- Mandate visual regression tests for every new arrow/line type
- Include edge case tests in unit test suite
- Use Chromatic for cross-browser visual validation
- Manual testing checklist for each release

### Risk: Bezier Curve Complexity
**Impact**: High - Bezier curves are complex and may have edge cases
**Likelihood**: Medium
**Mitigation**:
- Start with simple automatic control point generation
- Test extensively with various edge configurations
- Handle self-loops as special case
- Document limitations clearly
- Consider fallback to straight lines for problematic cases

### Risk: Tooltip Performance Impact
**Impact**: Medium - Tooltips may cause lag when hovering many edges
**Likelihood**: Low
**Mitigation**:
- Debounce tooltip show/hide events
- Limit tooltip rendering to one at a time
- Use lightweight rendering approach
- Profile with large graphs

### Risk: Glow Effect Performance
**Impact**: High - Glow can be expensive with many edges
**Likelihood**: High
**Mitigation**:
- Make glow optional and document performance impact
- Limit number of glowing edges
- Provide global enable/disable toggle
- Consider LOD approach (disable glow when zoomed out)
- Profile early and set clear limits

## Future Enhancements

### Short-term (Next 3-6 months)
1. **Advanced Bezier Control**
   - User-provided control points
   - Multiple control points for complex curves
   - Automatic curve routing to avoid nodes
   - Bundled edge routing

2. **Pattern Animation**
   - Animate dash patterns (marching ants effect)
   - Animated zigzag and sinewave
   - Direction indicators via animation
   - Speed control for pattern animation

3. **Custom Arrow Shapes**
   - User-defined arrow geometry via plugin system
   - SVG path import for arrow shapes
   - Unicode symbol arrows
   - Image-based arrows

4. **Advanced Glow Effects**
   - Animated glow (pulsing effect)
   - Color-changing glow
   - Glow intensity based on data properties

### Long-term (6+ months)
1. **Multi-segment Edges**
   - Support for edges with multiple line segments
   - Different patterns per segment
   - Conditional styling based on segment

2. **3D Arrow Variations**
   - Volumetric arrows (cones, pyramids)
   - 3D extrusion of arrow shapes
   - Depth-based styling

3. **Advanced Patterns**
   - Gradient patterns along edge length
   - Texture-based patterns
   - Procedural patterns via WebGL shaders

4. **Edge Bundling Support**
   - Bundle-aware pattern rendering
   - Shared arrow styling for bundles
   - Pattern continuity across bundle splits

5. **Performance Optimization**
   - WebGL shader-based pattern generation
   - Instanced rendering for repeated patterns
   - Adaptive LOD based on zoom level

## Implementation Estimate

| Phase | Description | Development | Testing | Total |
|-------|-------------|-------------|---------|-------|
| 1 | Arrow Property Support | 1 day | 0.5 day | 1.5 days |
| 2 | Line Opacity | 0.5 day | 0.5 day | 1 day |
| 3 | Simple Filled Arrows | 2 days | 1 day | 3 days |
| 4 | Hollow/Line Arrows | 2 days | 1 day | 3 days |
| 5 | Arrow Tail Support | 1.5 days | 0.5 day | 2 days |
| 6 | Dashed Line Patterns | 2 days | 1 day | 3 days |
| 7 | Geometric Line Patterns | 3 days | 1 day | 4 days |
| 8 | Bezier Curved Edges | 3 days | 1 day | 4 days |
| 9 | Arrow Text & Tooltips | 2 days | 1 day | 3 days |
| 10 | Glow Effects (Optional) | 2 days | 1 day | 3 days |
| 11 | Polish & Documentation | 2 days | 1 day | 3 days |
| **Total (without glow)** | | **19 days** | **9.5 days** | **28.5 days** |
| **Total (with glow)** | | **21 days** | **10.5 days** | **31.5 days** |

**Breakdown by Feature Category**:
- **Arrow Features** (Phases 1, 3, 4, 5, 9): 12 days
- **Line Features** (Phases 2, 6, 7, 8): 11 days
- **Visual Effects** (Phases 9, 10): 6 days
- **Polish** (Phase 11): 3 days

**Assumptions**:
- One developer working full-time
- Access to design reference materials and Babylon.js documentation
- No major blocking issues with GreasedLine capabilities
- Standard review and feedback cycles
- Glow effects are optional and can be deferred

**Confidence Level**: Medium (65%)
- Core rendering architecture is well-understood ✅
- Similar patterns exist in codebase (arrow rendering, labels) ✅
- Bezier curves add complexity and unknowns ⚠️
- Hollow shape rendering technique needs validation ⚠️
- Glow effect performance needs early testing ⚠️
- Tooltip interaction may have edge cases ⚠️

**Risk Factors**:
- Bezier curve edge cases (self-loops, overlapping) could add 2-3 days
- Glow performance issues could require optimization time (+1-2 days)
- Hollow shape rendering challenges could add 1-2 days
- Total contingency: +4-7 days

**Recommended Approach**:
1. **Phase 1-2 (Quick Wins)**: Complete first for immediate value (2.5 days)
2. **Phase 3-7 (Core Features)**: Arrow types and line patterns (15 days)
3. **Phase 8 (High Value)**: Bezier curves (4 days)
4. **Phase 9 (Medium Value)**: Text and tooltips (3 days)
5. **Phase 10 (Optional)**: Defer glow to later release if needed
6. **Phase 11 (Required)**: Polish and documentation (3 days)

**Minimum Viable Product (MVP)**: Phases 1-7, 11 = ~25 days
**Full Implementation**: Phases 1-11 = ~32 days

---

## Appendix: Arrow Type Visual Reference

Based on Graphviz documentation and screenshot:

| Type | Description | Shape Characteristics |
|------|-------------|----------------------|
| `normal` | Standard filled triangle | ✅ **IMPLEMENTED** - Solid triangle pointing to target |
| `inverted` | Reversed triangle | Solid triangle pointing away from target |
| `dot` | Filled circle | Solid circular dot at edge endpoint |
| `open-dot` | Hollow circle | Outlined circle (no fill) |
| `tee` | T-shaped terminator | Perpendicular line at edge end |
| `empty` | Hollow triangle | Triangle outline (no fill) |
| `diamond` | Filled diamond | Solid rhombus shape |
| `open-diamond` | Hollow diamond | Diamond outline (no fill) |
| `crow` | Crow's foot | Three lines forming a fork (database notation) |
| `box` | Filled rectangle | Solid rectangular shape |
| `open` | Open V-shape | V-shape with no back edge |
| `half-open` | Partial arrow | One side open, one side closed |
| `vee` | Wide V-shape | V with wider angle than normal |
| `none` | No arrow | ✅ **IMPLEMENTED** - No arrowhead rendered |

## Appendix: Line Type Visual Reference

Based on Cytoscape documentation:

| Type | Description | Pattern Characteristics |
|------|-------------|------------------------|
| `solid` | Standard line | ✅ **IMPLEMENTED** - Continuous unbroken line |
| `dash` | Dashed line | Alternating dashes and gaps |
| `dash-dot` | Dash-dot pattern | Long dash, short gap, dot, short gap, repeat |
| `dots` | Dotted line | Small evenly-spaced dots |
| `equal-dash` | Equal dashes | Evenly sized dashes with equal gaps |
| `sinewave` | Wavy line | Smooth sinusoidal curve |
| `zigzag` | Angular line | Sharp angular back-and-forth pattern |

---

## Summary

This design document specifies the complete implementation of the EdgeStyle configuration schema for graphty-element, covering:

- **12 arrow types** (inverted, dot, open-dot, tee, empty, diamond, open-diamond, crow, box, open, half-open, vee)
- **4 arrow properties** (size, color, opacity, text labels)
- **Arrow tail support** (bidirectional arrows)
- **6 line patterns** (dash, dash-dot, dots, equal-dash, sinewave, zigzag)
- **2 line properties** (opacity, bezier curves)
- **Edge features** (labels, tooltips, optional glow effects)

The implementation is divided into **11 phases** spanning **28.5-31.5 days** of development effort, with clear deliverables and acceptance criteria for each phase. The design prioritizes backward compatibility, performance, and incremental delivery.

**Quick wins** (Phases 1-2) can be delivered in 2.5 days to immediately fix existing arrow property issues.

**MVP scope** (Phases 1-7, 11) delivers all arrow types and line patterns in ~25 days.

**Full implementation** (all phases) provides complete EdgeStyle coverage in ~32 days.

---

**Document Version**: 2.0
**Author**: AI Design Assistant
**Date**: 2025-10-28
**Last Updated**: 2025-10-28
**Status**: Ready for Review - Complete Scope
**Changes from v1.0**: Added arrow properties, line opacity, bezier curves, tooltips, and glow effects to scope
