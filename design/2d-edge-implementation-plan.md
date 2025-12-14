# Implementation Plan for 2D Edge Rendering

## Overview

This plan implements world-space 2D edge rendering to replace the current screen-space approach in orthographic mode. The key insight is that 2D and 3D modes can share 100% of geometry - only materials and orientation differ. In 2D mode, edges use flat StandardMaterial meshes pre-rotated to the XY plane instead of billboard shaders, enabling proper zoom behavior where everything scales proportionally like zooming an image.

**Key Design Principle:** Material-based differentiation (not separate renderers) - reuse all geometry, just apply different materials and rotation.

## Phase Breakdown

### Phase 1: Foundation - MaterialHelper and Detection Logic
**Objective**: Create the central utility for applying 2D vs 3D materials and implement mode detection
**Duration**: 0.5 days

**Tests to Write First**:
- `test/meshes/MaterialHelper.test.ts`: Test material application
  ```typescript
  test("apply2DMaterial creates StandardMaterial and rotates to XY plane", () => {
    const mesh = new Mesh("test", scene);
    MaterialHelper.apply2DMaterial(mesh, "#ff0000", 0.8, scene);

    assert(mesh.material instanceof StandardMaterial);
    assert.strictEqual(mesh.rotation.x, Math.PI / 2);
    assert.strictEqual(mesh.metadata.is2D, true);
  });

  test("apply3DMaterial delegates to FilledArrowRenderer", () => {
    const mesh = FilledArrowRenderer.createTriangle(false, scene);
    MaterialHelper.apply3DMaterial(mesh, {size: 1.0, color: "#ff0000"}, scene);

    assert(mesh.material instanceof ShaderMaterial);
  });
  ```

- `test/meshes/EdgeMesh.test.ts`: Test 2D mode detection
  ```typescript
  test("is2DMode returns true for orthographic camera with twoD config", () => {
    const camera = new ArcRotateCamera("camera", 0, 0, 10, Vector3.Zero(), scene);
    camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
    const style = {graph: {twoD: true}};

    assert.strictEqual(EdgeMesh.is2DMode(scene, style), true);
  });

  test("is2DMode returns false for perspective camera", () => {
    const camera = new ArcRotateCamera("camera", 0, 0, 10, Vector3.Zero(), scene);
    camera.mode = Camera.PERSPECTIVE_CAMERA;
    const style = {graph: {twoD: true}};

    assert.strictEqual(EdgeMesh.is2DMode(scene, style), false);
  });
  ```

**Implementation**:
- `src/meshes/MaterialHelper.ts`: New file with two static methods
  ```typescript
  export class MaterialHelper {
    static apply2DMaterial(mesh: Mesh, color: string, opacity: number, scene: Scene): void;
    static apply3DMaterial(mesh: Mesh, options: FilledArrowOptions, scene: Scene): void;
  }
  ```

- `src/meshes/EdgeMesh.ts`: Add is2DMode() detection method
  ```typescript
  private static is2DMode(scene: Scene, style?: EdgeStyleConfig): boolean {
    const camera = scene.activeCamera;
    if (!camera) return false;
    const isOrtho = camera.mode === Camera.ORTHOGRAPHIC_CAMERA;
    const is2DGraph = style?.graph?.twoD === true;
    return isOrtho && is2DGraph;
  }
  ```

**Dependencies**:
- External: Babylon.js (StandardMaterial, ShaderMaterial)
- Internal: FilledArrowRenderer for 3D material application

**Verification**:
1. Run: `npm test -- MaterialHelper`
2. Expected: All material tests pass
3. Run: `npm test -- EdgeMesh`
4. Expected: Mode detection tests pass

### Phase 2: 2D Solid Lines - Simple2DLineRenderer
**Objective**: Implement world-space solid line rendering for 2D mode
**Duration**: 1 day

**Tests to Write First**:
- `test/meshes/Simple2DLineRenderer.test.ts`: Test geometry creation and updates
  ```typescript
  test("create generates rectangular mesh perpendicular to line direction", () => {
    const start = new Vector3(0, 0, 0);
    const end = new Vector3(1, 0, 0);
    const mesh = Simple2DLineRenderer.create(start, end, 0.1, "#ff0000", 1.0, scene);

    assert.strictEqual(mesh.getTotalVertices(), 4);
    assert.strictEqual(mesh.metadata.is2D, true);
    assert.strictEqual(mesh.metadata.is2DLine, true);
  });

  test("updatePositions recalculates vertices for new endpoints", () => {
    const mesh = Simple2DLineRenderer.create(
      new Vector3(0, 0, 0),
      new Vector3(1, 0, 0),
      0.1, "#ff0000", 1.0, scene
    );

    const newStart = new Vector3(0, 1, 0);
    const newEnd = new Vector3(1, 1, 0);
    Simple2DLineRenderer.updatePositions(mesh, newStart, newEnd);

    const positions = mesh.getVerticesData("position");
    assert(positions[1] > 0.9); // Y coordinate should be near 1
  });
  ```

- `test/integration/edge-2d-solid.test.ts`: Integration test with Edge class
  ```typescript
  test("Edge uses Simple2DLineRenderer in 2D mode", () => {
    const graph = createTestGraph({twoD: true});
    const edge = graph.addEdge("node1", "node2");

    assert(edge.mesh.metadata?.is2DLine);
    assert(edge.mesh.material instanceof StandardMaterial);
  });
  ```

**Implementation**:
- `src/meshes/Simple2DLineRenderer.ts`: New file
  ```typescript
  export class Simple2DLineRenderer {
    static create(
      start: Vector3, end: Vector3,
      width: number, color: string, opacity: number,
      scene: Scene
    ): Mesh;

    static updatePositions(mesh: Mesh, start: Vector3, end: Vector3): void;
  }
  ```

- `src/meshes/EdgeMesh.ts`: Update create() to route solid lines in 2D mode
  ```typescript
  // In EdgeMesh.create()
  if (lineType === "solid") {
    if (this.is2DMode(scene, style)) {
      return Simple2DLineRenderer.create(/* ... */);
    } else {
      // Existing CustomLineRenderer path
    }
  }
  ```

- `src/Edge.ts`: Update transformEdgeMesh() to handle 2D line updates
  ```typescript
  if (this.mesh.metadata?.is2DLine) {
    Simple2DLineRenderer.updatePositions(this.mesh, srcPoint, dstPoint);
  }
  ```

**Dependencies**:
- External: Babylon.js (Mesh, VertexData, StandardMaterial)
- Internal: Phase 1 (MaterialHelper for consistent material application)

**Verification**:
1. Run: `npm test -- Simple2DLineRenderer`
2. Expected: Geometry creation and update tests pass
3. Run: `npm test -- edge-2d-solid`
4. Expected: Integration tests show 2D solid lines render correctly
5. Manual: Start Storybook, verify solid lines scale with zoom in 2D mode

### Phase 3: 2D Patterned Lines
**Objective**: Enable patterned lines (dot, star, diamond, etc.) to work in 2D mode by passing is2DMode flag
**Duration**: 1 day

**Tests to Write First**:
- `test/meshes/PatternedLineRenderer.test.ts`: Test 2D mode flag handling
  ```typescript
  test("createPatternMesh applies 2D material when is2DMode is true", () => {
    const mesh = PatternedLineRenderer.createPatternMesh(
      "diamond", 0.1, "#ff0000", 1.0, scene,
      undefined, undefined,
      true // is2DMode
    );

    assert(mesh.material instanceof StandardMaterial);
    assert.strictEqual(mesh.rotation.x, Math.PI / 2);
    assert.strictEqual(mesh.metadata.is2D, true);
  });

  test("createPatternMesh applies 3D shader when is2DMode is false", () => {
    const mesh = PatternedLineRenderer.createPatternMesh(
      "diamond", 0.1, "#ff0000", 1.0, scene,
      undefined, undefined,
      false // is2DMode
    );

    assert(mesh.material instanceof ShaderMaterial);
  });
  ```

- `test/integration/edge-2d-patterns.test.ts`: Integration test
  ```typescript
  test("Patterned edge uses 2D materials in 2D mode", () => {
    const graph = createTestGraph({twoD: true});
    const edge = graph.addEdge("node1", "node2", {
      line: {type: "diamond"}
    });

    const patternMesh = edge.mesh as PatternedLineMesh;
    assert(patternMesh.shapes[0].material instanceof StandardMaterial);
  });
  ```

**Implementation**:
- `src/meshes/PatternedLineRenderer.ts`: Add is2DMode parameter
  ```typescript
  static createPatternMesh(
    pattern: PatternType,
    width: number,
    color: string,
    opacity: number,
    scene: Scene,
    shapeType?: ShapeType,
    segmentLength?: number,
    is2DMode?: boolean, // NEW
  ): Mesh {
    // ... geometry creation (unchanged) ...

    if (is2DMode) {
      MaterialHelper.apply2DMaterial(mesh, color, opacity, scene);
    } else {
      // Existing 3D shader path
      FilledArrowRenderer.applyShader(mesh, {size, color, opacity}, scene);
    }

    return mesh;
  }
  ```

- `src/meshes/PatternedLineRenderer.ts`: Update create() to pass flag
  ```typescript
  static create(
    pattern: PatternType,
    start: Vector3, end: Vector3,
    width: number, color: string, opacity: number,
    scene: Scene,
    is2DMode?: boolean, // NEW
  ): PatternedLineMesh {
    // Pass is2DMode to createPatternMesh()
  }
  ```

- `src/meshes/EdgeMesh.ts`: Pass is2DMode flag to PatternedLineRenderer
  ```typescript
  // In EdgeMesh.create() for patterned lines
  return PatternedLineRenderer.create(
    lineType,
    /* start, end, width, color, opacity, */
    scene,
    this.is2DMode(scene, style), // Pass detection flag
  );
  ```

**Dependencies**:
- External: None
- Internal: Phase 1 (MaterialHelper), existing PatternedLineRenderer geometry

**Verification**:
1. Run: `npm test -- PatternedLineRenderer`
2. Expected: 2D material application tests pass
3. Run: `npm test -- edge-2d-patterns`
4. Expected: Pattern meshes use StandardMaterial in 2D mode
5. Manual: Test diamond, dot, star, zigzag patterns in 2D Storybook story

### Phase 4: 2D Arrow Heads
**Objective**: Enable all arrow types to render in 2D mode using flat materials
**Duration**: 1.5 days

**Tests to Write First**:
- `test/meshes/FilledArrowRenderer.test.ts`: Test 2D arrow creation
  ```typescript
  test("create2DArrow generates mesh with StandardMaterial", () => {
    const mesh = FilledArrowRenderer.create2DArrow(
      "normal", 0.5, 0.3, "#ff0000", 1.0, scene
    );

    assert(mesh.material instanceof StandardMaterial);
    assert.strictEqual(mesh.rotation.x, Math.PI / 2);
    assert.strictEqual(mesh.metadata.is2D, true);
  });

  test("create2DArrow supports all arrow types", () => {
    const types = ["normal", "inverted", "diamond", "box", "dot", "vee", "tee"];
    types.forEach(type => {
      const mesh = FilledArrowRenderer.create2DArrow(
        type, 0.5, 0.3, "#ff0000", 1.0, scene
      );
      assert(mesh.material instanceof StandardMaterial, `${type} should use StandardMaterial`);
    });
  });
  ```

- `test/integration/edge-2d-arrows.test.ts`: Integration test
  ```typescript
  test("Arrow head uses 2D material in 2D mode", () => {
    const graph = createTestGraph({twoD: true});
    const edge = graph.addEdge("node1", "node2", {
      arrowHead: {type: "diamond"}
    });

    assert(edge.arrowMesh.material instanceof StandardMaterial);
    assert.strictEqual(edge.arrowMesh.metadata.is2D, true);
  });
  ```

**Implementation**:
- `src/meshes/FilledArrowRenderer.ts`: Add create2DArrow() static method
  ```typescript
  static create2DArrow(
    type: string,
    length: number,
    width: number,
    color: string,
    opacity: number,
    scene: Scene,
  ): Mesh {
    // Reuse existing geometry creation (createNormal, createDiamond, etc.)
    const geometry = this.getGeometryForType(type, length, width);
    const mesh = new Mesh(`arrow-2d-${type}`, scene);
    geometry.applyToMesh(mesh);

    // Apply 2D material
    MaterialHelper.apply2DMaterial(mesh, color, opacity, scene);

    return mesh;
  }

  private static getGeometryForType(type: string, length: number, width: number): VertexData {
    // Extract geometry creation logic from existing methods
    switch (type) {
      case "normal": return this.createTriangleGeometry(false, length, width);
      case "diamond": return this.createDiamondGeometry(length, width);
      // ... etc
    }
  }
  ```

- `src/meshes/EdgeMesh.ts`: Update createArrowHead() routing
  ```typescript
  static createArrowHead(
    cache: MeshCache,
    styleId: string,
    options: ArrowHeadOptions,
    scene: Scene,
    style?: EdgeStyleConfig, // NEW: Need style for 2D detection
  ): AbstractMesh | null {
    const is2D = this.is2DMode(scene, style);

    if (FILLED_ARROWS.includes(options.type)) {
      if (is2D) {
        return FilledArrowRenderer.create2DArrow(
          options.type, length, width, options.color, opacity, scene
        );
      } else {
        return this.createFilledArrow(/* existing 3D path */);
      }
    }
    // ... handle other arrow types
  }
  ```

- `src/Edge.ts`: Update transformArrowCap() for 2D rotation
  ```typescript
  if (this.arrowMesh) {
    this.arrowMesh.position = arrowPosition;

    if (this.arrowMesh.metadata?.is2D) {
      // 2D: Simple Z-rotation to align with edge
      const direction = dstPoint.subtract(srcPoint);
      const angle = Math.atan2(direction.y, direction.x);
      this.arrowMesh.rotation.z = angle;
    } else {
      // 3D: Existing billboarding logic
      FilledArrowRenderer.setLineDirection(this.arrowMesh as Mesh, direction);
    }
  }
  ```

**Dependencies**:
- External: None
- Internal: Phase 1 (MaterialHelper), existing FilledArrowRenderer geometry methods

**Verification**:
1. Run: `npm test -- FilledArrowRenderer`
2. Expected: create2DArrow tests pass for all arrow types
3. Run: `npm test -- edge-2d-arrows`
4. Expected: Arrows use 2D materials and rotate correctly
5. Manual: Test all arrow types in 2D mode, verify alignment with edges

### Phase 5: Cleanup - Remove Scaling Code
**Objective**: Delete all orthoScale/zoomFactor compensation code now that 2D uses world-space sizing
**Duration**: 0.5 days

**Tests to Write First**:
- No new tests needed (removal phase)
- Verify existing tests still pass after removal

**Implementation**:
- `src/meshes/CustomLineRenderer.ts`: Remove orthoScale calculations
  ```typescript
  // DELETE lines 284-306: orthoScale calculation and application
  // Keep all other CustomLineRenderer functionality (still used for 3D solid lines)
  ```

- `src/Edge.ts`: Remove zoomFactor logic
  ```typescript
  // DELETE: _lastLoggedFrustum property
  // DELETE: zoomFactor calculations in transformArrowCap() (3 locations)
  // DELETE: Debug logging for frustum
  ```

**Dependencies**:
- External: None
- Internal: Phases 1-4 must be complete (2D mode fully working without scaling code)

**Verification**:
1. Run: `npm run lint`
2. Expected: No errors (unused variables removed)
3. Run: `npm test`
4. Expected: All tests pass (2D and 3D modes work correctly)
5. Grep: `grep -r "orthoScale\|zoomFactor" src/`
6. Expected: No matches in Edge.ts or CustomLineRenderer.ts

### Phase 6: Visual Testing and Stories
**Objective**: Create comprehensive Storybook stories to validate 2D rendering behavior
**Duration**: 1 day

**Tests to Write First**:
- `test/visual/2d-edges.visual.test.ts`: Visual regression tests
  ```typescript
  test("2D solid edges scale with zoom", async () => {
    const story = await page.goto("http://dev.ato.ms:9025/?path=/story/styles-edge--two-d-solid");
    const screenshot1 = await page.screenshot();

    // Zoom in
    await page.evaluate(() => {
      const graph = document.querySelector("graphty-element");
      graph.camera.radius *= 0.5;
    });

    const screenshot2 = await page.screenshot();
    // Verify edges appear thicker (world-space scaling)
  });

  test("2D patterned edges render correctly", async () => {
    await page.goto("http://dev.ato.ms:9025/?path=/story/styles-edge--two-d-patterns");
    const element = await page.locator("graphty-element");
    await element.screenshot({path: "tmp/2d-patterns.png"});
    // Visual validation
  });
  ```

**Implementation**:
- `stories/EdgeStyles.stories.ts`: Add 2D stories
  ```typescript
  export const TwoDSolidWorld: Story = {
    args: {
      styleTemplate: templateCreator({
        graph: {twoD: true},
        edgeStyle: {
          line: {color: "darkgrey", width: 0.05},
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
          line: {type: "diamond", color: "blue", width: 0.1},
          arrowHead: {type: "diamond", color: "blue"},
        },
      }),
    },
  };

  export const TwoDAllArrows: Story = {
    // Grid of all arrow types in 2D mode
  };

  export const TwoDZoomTest: Story = {
    // Interactive zoom test to verify world-space scaling
  };
  ```

- `test/helpers/capture-2d-screenshots.ts`: Helper script
  ```typescript
  // Capture screenshots of 2D stories for manual review
  // Similar to existing capture-3d-debug-screenshots.ts
  ```

**Dependencies**:
- External: Playwright, Storybook
- Internal: All previous phases (complete 2D implementation)

**Verification**:
1. Run: `npm run storybook`
2. Navigate to: TwoDSolidWorld story
3. Expected: Solid edges render as flat rectangles in XY plane
4. Action: Zoom in/out using mouse wheel
5. Expected: Edges scale proportionally with zoom (world-space behavior)
6. Navigate to: TwoDPatternsWorld story
7. Expected: Diamond patterns render as flat shapes, aligned with edges
8. Navigate to: TwoDAllArrows story
9. Expected: All arrow types render correctly in 2D mode

### Phase 7: Width Tuning and Documentation
**Objective**: Finalize default widths for 2D mode and document the new system
**Duration**: 0.5 days

**Tests to Write First**:
- `test/constants/meshConstants.test.ts`: Validate default values
  ```typescript
  test("2D default widths are defined", () => {
    assert(EDGE_CONSTANTS.DEFAULT_2D_LINE_WIDTH > 0);
    assert(EDGE_CONSTANTS.DEFAULT_2D_ARROW_WIDTH > 0);
  });
  ```

**Implementation**:
- `src/constants/meshConstants.ts`: Add 2D defaults
  ```typescript
  export const EDGE_CONSTANTS = {
    // ... existing constants ...

    // 2D mode defaults (world-space units)
    DEFAULT_2D_LINE_WIDTH: 0.05,
    DEFAULT_2D_ARROW_WIDTH: 0.1,
    DEFAULT_2D_ARROW_LENGTH: 0.15,
  };
  ```

- `design/2d-edge-design.md`: Update with implementation notes
  ```markdown
  ## Implementation Notes

  ### Default Widths (Tuned Values)
  - Line width: 0.05 world units
  - Arrow width: 0.1 world units
  - Arrow length: 0.15 world units

  ### Migration Guide
  - 2D edges now use world-space sizing
  - Zoom behavior changed from constant pixel width to proportional scaling
  - Adjust width values if upgrading from old 2D implementation
  ```

- `CHANGELOG.md`: Document breaking changes
  ```markdown
  ## [Next Version]

  ### Breaking Changes
  - **2D Edge Rendering**: 2D mode now uses world-space sizing instead of screen-space
    - Edges scale proportionally with zoom (like zooming an image)
    - Default widths may appear different - adjust `line.width` if needed
    - Removed orthoScale/zoomFactor compensation code
  ```

**Dependencies**:
- External: None
- Internal: All previous phases (implementation complete, ready for final tuning)

**Verification**:
1. Run: `npm test -- meshConstants`
2. Expected: Default constant tests pass
3. Manual: Load multiple 2D stories, verify widths look reasonable
4. Manual: Test zoom behavior, verify edges remain visible at all zoom levels
5. Run: `npm run build`
6. Expected: Clean build with no warnings

## Common Utilities Needed

- **MaterialHelper** (Phase 1): Central utility for applying 2D vs 3D materials
  - Used by: PatternedLineRenderer, FilledArrowRenderer, Simple2DLineRenderer
  - Purpose: Ensure consistent material application across all renderers

- **Geometry extraction utilities** (Phase 4): Extract geometry creation from FilledArrowRenderer
  - Used by: create2DArrow() to reuse geometry definitions
  - Purpose: Avoid duplicating geometry code between 2D and 3D paths

## External Libraries Assessment

- **No new external libraries needed**: Implementation uses existing Babylon.js primitives
  - StandardMaterial: Built-in Babylon.js material for 2D rendering
  - VertexData: Existing geometry creation API (already used in codebase)
  - Math utilities: Standard JavaScript Math for 2D rotation calculations

## Risk Mitigation

- **Risk**: Breaking 3D rendering during 2D implementation
  - **Mitigation**: Run full test suite after each phase, maintain 3D code paths unchanged

- **Risk**: Performance regression from material switching
  - **Mitigation**: MaterialHelper uses simple logic, no complex computations; benchmark after Phase 3

- **Risk**: Arrow alignment issues in 2D mode
  - **Mitigation**: Phase 4 includes comprehensive arrow type tests; use visual regression tests

- **Risk**: Incorrect width defaults make edges too thick/thin
  - **Mitigation**: Phase 7 dedicated to tuning; gather user feedback from Storybook stories

- **Risk**: Removing scaling code breaks existing 2D implementations
  - **Mitigation**: Only remove in Phase 5 after all 2D rendering works; document as breaking change

## Implementation Order Rationale

1. **Phase 1 first**: Foundation utilities enable all subsequent work
2. **Phase 2-3 parallel-ready**: Solid lines and patterns are independent
3. **Phase 4 after 2-3**: Arrows depend on line rendering being stable
4. **Phase 5 after 1-4**: Only safe to remove old code after new system works
5. **Phase 6 validates all**: Visual testing catches issues missed by unit tests
6. **Phase 7 last**: Tuning requires complete implementation for context

## Success Metrics

- [ ] All unit tests pass (100% coverage for new code)
- [ ] All visual regression tests pass
- [ ] 3D mode unchanged (existing Storybook stories render identically)
- [ ] 2D mode demonstrates world-space zoom behavior
- [ ] No performance regression (benchmark 2D vs 3D rendering)
- [ ] Documentation complete (design doc, CHANGELOG, code comments)
- [ ] Zero TypeScript errors, zero ESLint warnings
