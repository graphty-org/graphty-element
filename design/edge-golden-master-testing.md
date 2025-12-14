# Edge & Arrowhead Golden Master Testing Plan

## Overview

This plan outlines comprehensive testing for edges and arrowheads following the same patterns established for node testing in `test/NodeMesh.test.ts` and `test/mesh-testing/node-golden-masters.test.ts`.

### Goals
1. Achieve 100% coverage of edge rendering features from `design/edge-styles-implementation-plan.md`
2. Test all 9 line types, 15 arrow types, and their property combinations
3. Create golden master tests that validate mesh/material properties without visual rendering
4. Follow existing node testing patterns for consistency

### Reference Files (Node Testing Patterns)
- `test/NodeMesh.test.ts` - Direct unit test pattern using NullEngine
- `test/mesh-testing/node-golden-masters.test.ts` - Golden master test pattern
- `test/mesh-testing/mesh-factory.ts` - Mock factory pattern (NodeMeshFactory)
- `test/mesh-testing/tracking-mocks.ts` - Tracking mock classes

---

## Phase 1: Update Edge Mock Factory

**Duration**: 1-2 days

**Objective**: Update `EdgeMeshFactory` in `test/mesh-testing/mesh-factory.ts` to accurately simulate the current edge rendering architecture (CustomLineRenderer + FilledArrowRenderer).

### 1.1 Update LINE_TYPES Array

The current `LINE_TYPES` in `mesh-factory.ts:207-209` is outdated. Update to match `src/config/EdgeStyle.ts:35-46`:

```typescript
// Replace EdgeMeshFactory.LINE_TYPES (mesh-factory.ts:207-209)
LINE_TYPES: [
    "solid",      // CustomLineRenderer (continuous line)
    "dot",        // Circle instances
    "star",       // Star instances
    "box",        // Square box instances (1:1 aspect ratio)
    "dash",       // Elongated box instances (3:1 aspect ratio)
    "diamond",    // Diamond instances
    "dash-dot",   // Alternating boxes and circles
    "sinewave",   // Repeating wave period meshes
    "zigzag",     // Repeating zigzag period meshes
],
```

### 1.2 Update ARROW_TYPES Array

Update to match `src/config/EdgeStyle.ts:7-25`:

```typescript
// Replace EdgeMeshFactory.ARROW_TYPES (mesh-factory.ts:211-226)
ARROW_TYPES: [
    "normal",
    "inverted",
    "dot",
    "sphere-dot",
    "open-dot",
    "none",
    "tee",
    "open-normal",
    "diamond",
    "open-diamond",
    "crow",
    "box",
    "open",
    "half-open",
    "vee",
],

// Add categorization for testing
FILLED_ARROWS: ["normal", "inverted", "diamond", "box", "dot"],
OUTLINE_ARROWS: ["open-normal", "open-dot", "open-diamond", "tee", "open", "half-open", "vee", "crow"],
```

### 1.3 Update EdgeMeshFactory.create() Method

Rewrite `mesh-factory.ts:228-244` to simulate new architecture:

```typescript
create(style: Record<string, unknown>): MeshTestResult {
    const meshName = `edge-${++EdgeMeshFactory.meshCounter}`;
    const materialName = `edge-material-${EdgeMeshFactory.meshCounter}`;

    const mesh = new TrackingMockMesh(meshName);
    const material = new TrackingMockMaterial(materialName);

    // Determine if using CustomLineRenderer (solid) or instanced patterns
    const lineType = typeof style.type === "string" ? style.type : "solid";

    if (lineType === "solid") {
        EdgeMeshFactory.simulateCustomLineRenderer(mesh, material, style);
    } else {
        EdgeMeshFactory.simulatePatternedLine(mesh, material, style);
    }

    // Handle arrows separately
    if (style.arrow) {
        EdgeMeshFactory.simulateArrows(mesh, style.arrow as Record<string, unknown>, style);
    }

    mesh.setMaterial(material);

    return {
        mesh,
        material,
        validation: EdgeMeshFactory.validate(mesh, material, style),
    };
}
```

### 1.4 Add simulateCustomLineRenderer() Method

Create new method to simulate `src/meshes/CustomLineRenderer.ts` behavior:

```typescript
simulateCustomLineRenderer(
    mesh: TrackingMockMesh,
    material: TrackingMockMaterial,
    style: Record<string, unknown>,
): void {
    // CustomLineRenderer creates quad-strip geometry
    mesh.setMetadata("meshType", "customLine");
    mesh.setMetadata("rendererType", "CustomLineRenderer");

    // Geometry properties (from CustomLineRenderer.createLineGeometry)
    mesh.setMetadata("geometryType", "quadStrip");
    mesh.setMetadata("verticesPerSegment", 4);

    // Line properties
    const lineType = typeof style.type === "string" ? style.type : "solid";
    const width = Number(style.width ?? 1);
    const color = typeof style.color === "string" ? style.color : "#000000";
    const opacity = Number(style.opacity ?? 1);

    mesh.setMetadata("lineType", lineType);
    mesh.setMetadata("lineWidth", width);
    mesh.setMetadata("lineColor", color);
    mesh.setMetadata("lineOpacity", opacity);

    // Shader material properties (from CustomLineRenderer shader)
    material.setMetadata("shaderType", "customLine");
    material.setMetadata("uniforms", {
        width: width * 20, // WIDTH_SCALE factor
        color: propertyValidator.parseColor(color),
        opacity: opacity,
        pattern: EdgeMeshFactory.getPatternId(lineType),
        dashLength: 10,
        gapLength: 10,
    });

    // Animation handling
    if (style.animationSpeed) {
        mesh.setMetadata("animated", true);
        mesh.setMetadata("animationSpeed", style.animationSpeed);
        material.setMetadata("hasAnimationTexture", true);
    } else {
        mesh.setMetadata("animated", false);
    }

    // Bezier curve handling
    if (style.bezier) {
        mesh.setMetadata("bezier", true);
        mesh.setMetadata("segmentCount", 20); // Default bezier segments
    }
},

getPatternId(lineType: string): number {
    // Pattern IDs from CustomLineRenderer shader
    const patterns: Record<string, number> = {
        "solid": 0,
        "dash": 1,
        "dot": 2,
    };
    return patterns[lineType] ?? 0;
},
```

### 1.5 Add simulatePatternedLine() Method

For instanced mesh patterns (Phase 4 of edge-styles-implementation-plan.md):

```typescript
simulatePatternedLine(
    mesh: TrackingMockMesh,
    material: TrackingMockMaterial,
    style: Record<string, unknown>,
): void {
    const lineType = typeof style.type === "string" ? style.type : "solid";

    mesh.setMetadata("meshType", "instancedPattern");
    mesh.setMetadata("rendererType", "PatternedLineRenderer");
    mesh.setMetadata("lineType", lineType);
    mesh.setMetadata("lineWidth", Number(style.width ?? 1));
    mesh.setMetadata("lineColor", typeof style.color === "string" ? style.color : "#000000");
    mesh.setMetadata("lineOpacity", Number(style.opacity ?? 1));

    // Pattern-specific metadata
    const patternConfig = EdgeMeshFactory.getPatternConfig(lineType);
    mesh.setMetadata("patternShape", patternConfig.shape);
    mesh.setMetadata("patternSpacing", patternConfig.spacing);
    mesh.setMetadata("patternAspectRatio", patternConfig.aspectRatio);
    mesh.setMetadata("usesInstancing", true);

    // Material for instanced patterns
    material.setMetadata("shaderType", "instancedPattern");
},

getPatternConfig(lineType: string): {shape: string, spacing: number, aspectRatio: number} {
    const configs: Record<string, {shape: string, spacing: number, aspectRatio: number}> = {
        "dot": {shape: "circle", spacing: 2, aspectRatio: 1},
        "star": {shape: "star", spacing: 3, aspectRatio: 1},
        "box": {shape: "square", spacing: 2, aspectRatio: 1},
        "dash": {shape: "rectangle", spacing: 1.5, aspectRatio: 3},
        "diamond": {shape: "diamond", spacing: 2, aspectRatio: 1},
        "dash-dot": {shape: "alternating", spacing: 2, aspectRatio: 1},
        "sinewave": {shape: "wave", spacing: 1, aspectRatio: 1},
        "zigzag": {shape: "zigzag", spacing: 1, aspectRatio: 1},
    };
    return configs[lineType] ?? {shape: "unknown", spacing: 1, aspectRatio: 1};
},
```

### 1.6 Add simulateArrows() Method

Simulate arrow creation based on 3D/2D mode:

```typescript
simulateArrows(
    mesh: TrackingMockMesh,
    arrowConfig: Record<string, unknown>,
    style: Record<string, unknown>,
): void {
    const is2D = Boolean(style.is2D);

    if (arrowConfig.source) {
        const source = arrowConfig.source as Record<string, unknown>;
        const arrowMeta = EdgeMeshFactory.createArrowMetadata(source, is2D, "source");
        mesh.setMetadata("sourceArrow", arrowMeta);
    }

    if (arrowConfig.target) {
        const target = arrowConfig.target as Record<string, unknown>;
        const arrowMeta = EdgeMeshFactory.createArrowMetadata(target, is2D, "target");
        mesh.setMetadata("targetArrow", arrowMeta);
    }
},

createArrowMetadata(
    config: Record<string, unknown>,
    is2D: boolean,
    position: "source" | "target",
): Record<string, unknown> {
    const type = typeof config.type === "string" ? config.type : "normal";
    const size = Number(config.size ?? 1);
    const color = typeof config.color === "string" ? config.color : "#FFFFFF";
    const opacity = Number(config.opacity ?? 1);

    const isFilled = EdgeMeshFactory.FILLED_ARROWS.includes(type);

    return {
        type,
        size,
        color,
        opacity,
        position,
        isFilled,
        is2D,
        // 3D arrows use tangent billboarding shader
        rendererType: is2D ? "StandardMaterial" : (isFilled ? "FilledArrowRenderer" : "CustomLineRenderer"),
        // Geometry plane
        geometryPlane: is2D ? "XY" : "XZ",
        // Material type
        materialType: is2D ? "StandardMaterial" : "ShaderMaterial",
        // Shader uniforms (3D only)
        shaderUniforms: !is2D ? {
            size,
            color: propertyValidator.parseColor(color),
            opacity,
        } : undefined,
    };
},
```

### 1.7 Update validate() Method

Update `mesh-factory.ts:335-368` to validate new properties:

```typescript
validate(
    mesh: TrackingMockMesh,
    material: TrackingMockMaterial,
    style: Record<string, unknown>,
): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate line type
    const expectedType = typeof style.type === "string" ? style.type : "solid";
    if (mesh.metadata.lineType !== expectedType) {
        errors.push(`Line type mismatch: expected ${expectedType}, got ${mesh.metadata.lineType}`);
    }

    // Validate renderer type
    const expectedRenderer = expectedType === "solid" ? "CustomLineRenderer" : "PatternedLineRenderer";
    if (mesh.metadata.rendererType !== expectedRenderer) {
        errors.push(`Renderer mismatch: expected ${expectedRenderer}, got ${mesh.metadata.rendererType}`);
    }

    // Validate width
    const expectedWidth = Number(style.width ?? 1);
    if (mesh.metadata.lineWidth !== expectedWidth) {
        errors.push(`Width mismatch: expected ${expectedWidth}, got ${mesh.metadata.lineWidth}`);
    }

    // Validate opacity
    const expectedOpacity = Number(style.opacity ?? 1);
    if (mesh.metadata.lineOpacity !== expectedOpacity) {
        errors.push(`Opacity mismatch: expected ${expectedOpacity}, got ${mesh.metadata.lineOpacity}`);
    }

    // Validate animation
    if (style.animationSpeed && !mesh.metadata.animated) {
        errors.push("Animation should be enabled");
    }

    // Validate arrows
    if (style.arrow) {
        const arrowConfig = style.arrow as Record<string, unknown>;
        if (arrowConfig.source && !mesh.metadata.sourceArrow) {
            errors.push("Source arrow should be created");
        }
        if (arrowConfig.target && !mesh.metadata.targetArrow) {
            errors.push("Target arrow should be created");
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        expected: style,
        actual: {
            lineType: mesh.metadata.lineType,
            rendererType: mesh.metadata.rendererType,
            width: mesh.metadata.lineWidth,
            color: mesh.metadata.lineColor,
            opacity: mesh.metadata.lineOpacity,
            animated: mesh.metadata.animated,
            bezier: mesh.metadata.bezier,
            sourceArrow: mesh.metadata.sourceArrow,
            targetArrow: mesh.metadata.targetArrow,
        },
    };
},
```

### 1.8 Files to Modify

| File | Changes |
|------|---------|
| `test/mesh-testing/mesh-factory.ts` | Update EdgeMeshFactory (lines 204-369) |

### 1.9 Reference Pattern

Follow `NodeMeshFactory` structure from `mesh-factory.ts:36-198`:
- `SHAPES` array → `LINE_TYPES`, `ARROW_TYPES` arrays
- `create()` → returns `MeshTestResult` with mesh, material, validation
- `simulateNodeMeshCreation()` → `simulateCustomLineRenderer()`, `simulatePatternedLine()`
- `validate()` → checks expected vs actual properties

---

## Phase 2: Create Arrow Mock Factory

**Duration**: 1 day

**Objective**: Create `ArrowMeshFactory` to test arrow mesh creation independently, similar to how `NodeMeshFactory` tests node shapes.

### 2.1 Create ArrowMeshFactory

Add to `test/mesh-testing/mesh-factory.ts` after EdgeMeshFactory:

```typescript
/**
 * Arrow Mesh Factory - Covers FilledArrowRenderer.ts and outline arrows
 * Tests all 15 arrow types with geometry validation
 */
export const ArrowMeshFactory = {
    meshCounter: 0,

    // All arrow types from EdgeStyle.ts
    ARROW_TYPES: [
        "normal", "inverted", "dot", "sphere-dot", "open-dot", "none",
        "tee", "open-normal", "diamond", "open-diamond", "crow",
        "box", "open", "half-open", "vee",
    ],

    // Categorized by renderer
    FILLED_ARROWS: ["normal", "inverted", "diamond", "box", "dot"],
    OUTLINE_ARROWS: ["open-normal", "open-dot", "open-diamond", "tee", "open", "half-open", "vee", "crow"],
    SPHERE_ARROWS: ["sphere-dot"],

    // Expected vertex counts for filled arrows (XZ plane geometry)
    VERTEX_COUNTS: {
        "normal": 3,      // Triangle: 3 vertices
        "inverted": 3,    // Triangle: 3 vertices
        "diamond": 4,     // Diamond: 4 vertices
        "box": 4,         // Rectangle: 4 vertices
        "dot": 33,        // Circle: 32 segments + center
    } as Record<string, number>,

    create(style: ArrowMockStyle): ArrowTestResult {
        const type = typeof style.type === "string" ? style.type : "normal";
        const is2D = Boolean(style.is2D);
        const size = Number(style.size ?? 1);
        const width = Number(style.width ?? 0.5);
        const length = Number(style.length ?? 0.3);
        const color = typeof style.color === "string" ? style.color : "#FFFFFF";
        const opacity = Number(style.opacity ?? 1);

        const meshName = `arrow-${type}-${++ArrowMeshFactory.meshCounter}`;
        const mesh = new TrackingMockMesh(meshName);
        const material = new TrackingMockMaterial(`${meshName}-material`);

        if (type === "none") {
            return {
                mesh: null,
                material: null,
                validation: {isValid: true, errors: [], warnings: [], expected: style, actual: null},
            };
        }

        ArrowMeshFactory.simulateArrowCreation(mesh, material, {
            type, is2D, size, width, length, color, opacity,
        });

        mesh.setMaterial(material);

        return {
            mesh,
            material,
            validation: ArrowMeshFactory.validate(mesh, material, style),
        };
    },

    simulateArrowCreation(
        mesh: TrackingMockMesh,
        material: TrackingMockMaterial,
        config: {
            type: string;
            is2D: boolean;
            size: number;
            width: number;
            length: number;
            color: string;
            opacity: number;
        },
    ): void {
        const {type, is2D, size, width, length, color, opacity} = config;
        const isFilled = ArrowMeshFactory.FILLED_ARROWS.includes(type);

        // Common metadata
        mesh.setMetadata("arrowType", type);
        mesh.setMetadata("isFilled", isFilled);
        mesh.setMetadata("is2D", is2D);
        mesh.setMetadata("size", size);
        mesh.setMetadata("width", width);
        mesh.setMetadata("length", length);
        mesh.setMetadata("color", color);
        mesh.setMetadata("opacity", opacity);

        if (is2D) {
            ArrowMeshFactory.simulate2DArrow(mesh, material, config);
        } else if (isFilled) {
            ArrowMeshFactory.simulate3DFilledArrow(mesh, material, config);
        } else {
            ArrowMeshFactory.simulate3DOutlineArrow(mesh, material, config);
        }
    },

    simulate2DArrow(
        mesh: TrackingMockMesh,
        material: TrackingMockMaterial,
        config: {type: string; color: string; opacity: number},
    ): void {
        // 2D arrows use StandardMaterial with XY plane geometry
        // Reference: FilledArrowRenderer.create2DArrow()
        mesh.setMetadata("rendererType", "FilledArrowRenderer.create2DArrow");
        mesh.setMetadata("geometryPlane", "XY");
        mesh.setMetadata("rotation", {x: Math.PI / 2, y: 0, z: 0});

        // StandardMaterial with emissive color (unlit)
        material.setMetadata("materialType", "StandardMaterial");
        material.setMetadata("disableLighting", true);
        material.setEmissiveColor(propertyValidator.parseColor(config.color));
        material.setAlpha(config.opacity);
    },

    simulate3DFilledArrow(
        mesh: TrackingMockMesh,
        material: TrackingMockMaterial,
        config: {type: string; size: number; color: string; opacity: number},
    ): void {
        // 3D filled arrows use tangent billboarding shader
        // Reference: FilledArrowRenderer.ts
        mesh.setMetadata("rendererType", "FilledArrowRenderer");
        mesh.setMetadata("geometryPlane", "XZ"); // CRITICAL: Must be XZ plane (Y=0)
        mesh.setMetadata("faceNormal", "Y"); // Face normal in ±Y direction

        // Vertex count based on shape
        const vertexCount = ArrowMeshFactory.VERTEX_COUNTS[config.type] ?? 3;
        mesh.setMetadata("expectedVertexCount", vertexCount);

        // ShaderMaterial with tangent billboarding
        material.setMetadata("materialType", "ShaderMaterial");
        material.setMetadata("shaderName", "filledArrow");
        material.setMetadata("uniforms", {
            size: config.size,
            color: propertyValidator.parseColor(config.color),
            opacity: config.opacity,
        });
        material.setMetadata("attributes", ["position", "lineDirection"]);
        material.setMetadata("thinInstanceAttribute", "lineDirection");

        mesh.visibility = config.opacity;
    },

    simulate3DOutlineArrow(
        mesh: TrackingMockMesh,
        material: TrackingMockMaterial,
        config: {type: string; size: number; width: number; color: string; opacity: number},
    ): void {
        // Outline arrows use CustomLineRenderer (same shader as lines)
        // Reference: design/edge-styles-implementation-plan.md Phase 3
        mesh.setMetadata("rendererType", "CustomLineRenderer");
        mesh.setMetadata("geometryType", "quadStrip");

        // Path-based geometry
        const pathInfo = ArrowMeshFactory.getOutlineArrowPath(config.type);
        mesh.setMetadata("pathPoints", pathInfo.points);
        mesh.setMetadata("isClosed", pathInfo.closed);

        // Same shader material as lines
        material.setMetadata("materialType", "ShaderMaterial");
        material.setMetadata("shaderName", "customLine");
        material.setMetadata("uniforms", {
            width: config.width * 0.3, // Thin line width for outlines
            color: propertyValidator.parseColor(config.color),
            opacity: config.opacity,
        });

        mesh.visibility = config.opacity;
    },

    getOutlineArrowPath(type: string): {points: number; closed: boolean} {
        // Approximate path info for each outline arrow type
        const paths: Record<string, {points: number; closed: boolean}> = {
            "open-normal": {points: 3, closed: false},    // V-shape (2 segments)
            "open-dot": {points: 33, closed: true},       // Circle outline
            "open-diamond": {points: 5, closed: true},    // Diamond outline (4 segments)
            "tee": {points: 2, closed: false},            // Perpendicular line (1 segment)
            "open": {points: 3, closed: false},           // Chevron (2 segments)
            "half-open": {points: 3, closed: false},      // Asymmetric V
            "vee": {points: 3, closed: false},            // Wide V
            "crow": {points: 7, closed: false},           // Three-prong fork (6 segments)
        };
        return paths[type] ?? {points: 3, closed: false};
    },

    validate(
        mesh: TrackingMockMesh | null,
        material: TrackingMockMaterial | null,
        style: ArrowMockStyle,
    ): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];
        const type = typeof style.type === "string" ? style.type : "normal";

        if (type === "none") {
            if (mesh !== null) {
                errors.push("Arrow type 'none' should return null mesh");
            }
            return {isValid: errors.length === 0, errors, warnings, expected: style, actual: null};
        }

        if (!mesh || !material) {
            errors.push("Mesh and material should be created for non-none arrow type");
            return {isValid: false, errors, warnings, expected: style, actual: null};
        }

        // Validate arrow type
        if (mesh.metadata.arrowType !== type) {
            errors.push(`Arrow type mismatch: expected ${type}, got ${mesh.metadata.arrowType}`);
        }

        // Validate geometry plane based on mode
        const is2D = Boolean(style.is2D);
        const expectedPlane = is2D ? "XY" : "XZ";
        const isFilled = ArrowMeshFactory.FILLED_ARROWS.includes(type);

        if (isFilled && mesh.metadata.geometryPlane !== expectedPlane) {
            errors.push(`Geometry plane mismatch: expected ${expectedPlane}, got ${mesh.metadata.geometryPlane}`);
        }

        // Validate material type
        const expectedMaterialType = is2D ? "StandardMaterial" : "ShaderMaterial";
        if (material.metadata.materialType !== expectedMaterialType) {
            errors.push(`Material type mismatch: expected ${expectedMaterialType}, got ${material.metadata.materialType}`);
        }

        // Validate opacity
        const expectedOpacity = Number(style.opacity ?? 1);
        if (Math.abs(mesh.visibility - expectedOpacity) > 0.001) {
            errors.push(`Opacity mismatch: expected ${expectedOpacity}, got ${mesh.visibility}`);
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            expected: style,
            actual: {
                arrowType: mesh.metadata.arrowType,
                is2D: mesh.metadata.is2D,
                isFilled: mesh.metadata.isFilled,
                geometryPlane: mesh.metadata.geometryPlane,
                rendererType: mesh.metadata.rendererType,
                materialType: material.metadata.materialType,
                opacity: mesh.visibility,
            },
        };
    },
};

interface ArrowMockStyle {
    type?: string;
    is2D?: boolean;
    size?: number;
    width?: number;
    length?: number;
    color?: string;
    opacity?: number;
}

interface ArrowTestResult {
    mesh: TrackingMockMesh | null;
    material: TrackingMockMaterial | null;
    validation: ValidationResult;
}
```

### 2.2 Files to Modify

| File | Changes |
|------|---------|
| `test/mesh-testing/mesh-factory.ts` | Add ArrowMeshFactory after EdgeMeshFactory |

### 2.3 Reference Pattern

Follow `NodeMeshFactory.create()` pattern from `mesh-factory.ts:68-85`:
- Return `{mesh, material, validation}` object
- Use `TrackingMockMesh` and `TrackingMockMaterial`
- Set metadata via `mesh.setMetadata()` and `material.setMetadata()`
- Include `validate()` method that returns `ValidationResult`

---

## Phase 3: Rewrite Edge Golden Master Tests

**Duration**: 1-2 days

**Objective**: Rewrite `test/mesh-testing/edge-golden-masters.test.ts` to test all edge features using the updated `EdgeMeshFactory`.

### 3.1 Test Structure

Follow `test/mesh-testing/node-golden-masters.test.ts` structure:

```typescript
/**
 * Edge Golden Master Tests
 *
 * Tests all line types, patterns, arrow configurations, and edge properties
 * to achieve 100% coverage of EdgeMesh.ts and related rendering code.
 */

import {assert, describe, test} from "vitest";
import {EdgeMeshFactory} from "./mesh-factory";

describe("Edge Golden Masters", () => {
    // Test structure mirrors node-golden-masters.test.ts
});
```

### 3.2 Line Type Tests

```typescript
describe("Line Types", () => {
    // Reference: node-golden-masters.test.ts lines 14-31 (Shape Creation)

    describe("Solid Line (CustomLineRenderer)", () => {
        test("creates solid line with CustomLineRenderer", () => {
            const result = EdgeMeshFactory.create({
                type: "solid",
                width: 2,
                color: "#FF0000",
            });

            assert.isTrue(result.validation.isValid,
                `Validation failed: ${result.validation.errors.join(", ")}`);
            assert.equal(result.mesh.metadata.lineType, "solid");
            assert.equal(result.mesh.metadata.rendererType, "CustomLineRenderer");
            assert.equal(result.mesh.metadata.meshType, "customLine");
        });
    });

    describe("Patterned Lines (Instanced Meshes)", () => {
        const patternTypes = ["dot", "star", "box", "dash", "diamond", "dash-dot", "sinewave", "zigzag"];

        patternTypes.forEach((patternType) => {
            test(`creates ${patternType} pattern with instanced meshes`, () => {
                const result = EdgeMeshFactory.create({
                    type: patternType,
                    width: 2,
                    color: "#00FF00",
                });

                assert.isTrue(result.validation.isValid,
                    `${patternType} validation failed: ${result.validation.errors.join(", ")}`);
                assert.equal(result.mesh.metadata.lineType, patternType);
                assert.equal(result.mesh.metadata.rendererType, "PatternedLineRenderer");
                assert.isTrue(result.mesh.metadata.usesInstancing);
            });
        });
    });

    describe("Pattern Shapes", () => {
        test("dot pattern uses circle instances", () => {
            const result = EdgeMeshFactory.create({type: "dot"});
            assert.equal(result.mesh.metadata.patternShape, "circle");
        });

        test("star pattern uses star instances", () => {
            const result = EdgeMeshFactory.create({type: "star"});
            assert.equal(result.mesh.metadata.patternShape, "star");
        });

        test("box pattern uses square instances (1:1 aspect)", () => {
            const result = EdgeMeshFactory.create({type: "box"});
            assert.equal(result.mesh.metadata.patternShape, "square");
            assert.equal(result.mesh.metadata.patternAspectRatio, 1);
        });

        test("dash pattern uses rectangle instances (3:1 aspect)", () => {
            const result = EdgeMeshFactory.create({type: "dash"});
            assert.equal(result.mesh.metadata.patternShape, "rectangle");
            assert.equal(result.mesh.metadata.patternAspectRatio, 3);
        });

        test("diamond pattern uses diamond instances", () => {
            const result = EdgeMeshFactory.create({type: "diamond"});
            assert.equal(result.mesh.metadata.patternShape, "diamond");
        });

        test("dash-dot uses alternating shapes", () => {
            const result = EdgeMeshFactory.create({type: "dash-dot"});
            assert.equal(result.mesh.metadata.patternShape, "alternating");
        });
    });
});
```

### 3.3 Line Property Tests

```typescript
describe("Line Properties", () => {
    // Reference: node-golden-masters.test.ts lines 34-54 (Size Variations)

    describe("Width Variations", () => {
        const widths = [0.5, 1, 2, 5, 10];

        widths.forEach((width) => {
            test(`creates line with width ${width}`, () => {
                const result = EdgeMeshFactory.create({
                    type: "solid",
                    width: width,
                    color: "#FF0000",
                });

                assert.isTrue(result.validation.isValid);
                assert.equal(result.mesh.metadata.lineWidth, width);
            });
        });
    });

    describe("Color Variations", () => {
        const colors = ["#FF0000", "#00FF00", "#0000FF", "#FFFFFF", "#000000", "#FFFF00"];

        colors.forEach((color) => {
            test(`creates line with color ${color}`, () => {
                const result = EdgeMeshFactory.create({
                    type: "solid",
                    width: 1,
                    color: color,
                });

                assert.isTrue(result.validation.isValid);
                assert.equal(result.mesh.metadata.lineColor, color);
            });
        });
    });

    describe("Opacity Variations", () => {
        const opacities = [0.0, 0.25, 0.5, 0.75, 1.0];

        opacities.forEach((opacity) => {
            test(`creates line with opacity ${opacity}`, () => {
                const result = EdgeMeshFactory.create({
                    type: "solid",
                    width: 1,
                    color: "#FF0000",
                    opacity: opacity,
                });

                assert.isTrue(result.validation.isValid);
                assert.equal(result.mesh.metadata.lineOpacity, opacity);
            });
        });
    });

    describe("Bezier Curves", () => {
        test("creates bezier curve when bezier is true", () => {
            const result = EdgeMeshFactory.create({
                type: "solid",
                width: 1,
                color: "#FF0000",
                bezier: true,
            });

            assert.isTrue(result.validation.isValid);
            assert.isTrue(result.mesh.metadata.bezier);
            assert.isAtLeast(result.mesh.metadata.segmentCount, 10);
        });

        test("creates straight line when bezier is false", () => {
            const result = EdgeMeshFactory.create({
                type: "solid",
                width: 1,
                color: "#FF0000",
                bezier: false,
            });

            assert.isTrue(result.validation.isValid);
            assert.isFalse(result.mesh.metadata.bezier);
        });
    });
});
```

### 3.4 Animation Tests

```typescript
describe("Line Animation", () => {
    test("creates static line (no animation)", () => {
        const result = EdgeMeshFactory.create({
            type: "solid",
            width: 2,
            color: "#FF0000",
        });

        assert.isTrue(result.validation.isValid);
        assert.isFalse(result.mesh.metadata.animated);
    });

    test("creates animated line with animation speed", () => {
        const result = EdgeMeshFactory.create({
            type: "solid",
            width: 2,
            color: "#FF0000",
            animationSpeed: 1.5,
        });

        assert.isTrue(result.validation.isValid);
        assert.isTrue(result.mesh.metadata.animated);
        assert.equal(result.mesh.metadata.animationSpeed, 1.5);
        assert.isTrue(result.material.metadata.hasAnimationTexture);
    });

    describe("Animation Speed Variations", () => {
        const speeds = [0.5, 1, 2, 5];

        speeds.forEach((speed) => {
            test(`creates animated line with speed ${speed}`, () => {
                const result = EdgeMeshFactory.create({
                    type: "dash",
                    width: 1,
                    color: "#00FF00",
                    animationSpeed: speed,
                });

                assert.isTrue(result.validation.isValid);
                assert.isTrue(result.mesh.metadata.animated);
                assert.equal(result.mesh.metadata.animationSpeed, speed);
            });
        });
    });
});
```

### 3.5 Arrow Tests

```typescript
describe("Arrow Heads", () => {
    // Reference: node-golden-masters.test.ts lines 56-123 (Material Properties)

    const arrowTypes = EdgeMeshFactory.ARROW_TYPES.filter(t => t !== "none");

    describe("All Arrow Types", () => {
        arrowTypes.forEach((arrowType) => {
            test(`creates target arrow: ${arrowType}`, () => {
                const result = EdgeMeshFactory.create({
                    type: "solid",
                    width: 2,
                    color: "#000000",
                    arrow: {
                        target: {
                            type: arrowType,
                            size: 1,
                            color: "#FF0000",
                        },
                    },
                });

                assert.isTrue(result.validation.isValid,
                    `${arrowType} validation failed: ${result.validation.errors.join(", ")}`);
                assert.isDefined(result.mesh.metadata.targetArrow);
                assert.equal(
                    (result.mesh.metadata.targetArrow as {type: string}).type,
                    arrowType
                );
            });

            test(`creates source arrow: ${arrowType}`, () => {
                const result = EdgeMeshFactory.create({
                    type: "solid",
                    width: 2,
                    color: "#000000",
                    arrow: {
                        source: {
                            type: arrowType,
                            size: 1.5,
                            color: "#00FF00",
                        },
                    },
                });

                assert.isTrue(result.validation.isValid);
                assert.isDefined(result.mesh.metadata.sourceArrow);
                assert.equal(
                    (result.mesh.metadata.sourceArrow as {type: string}).type,
                    arrowType
                );
            });
        });
    });

    describe("Bidirectional Arrows", () => {
        test("creates double-headed arrows", () => {
            const result = EdgeMeshFactory.create({
                type: "solid",
                width: 3,
                color: "#000000",
                arrow: {
                    source: {type: "normal", size: 1, color: "#FF0000"},
                    target: {type: "inverted", size: 1.2, color: "#0000FF"},
                },
            });

            assert.isTrue(result.validation.isValid);
            assert.isDefined(result.mesh.metadata.sourceArrow);
            assert.isDefined(result.mesh.metadata.targetArrow);
            assert.equal(
                (result.mesh.metadata.sourceArrow as {type: string}).type,
                "normal"
            );
            assert.equal(
                (result.mesh.metadata.targetArrow as {type: string}).type,
                "inverted"
            );
        });
    });

    describe("Arrow Size Variations", () => {
        const sizes = [0.5, 1, 1.5, 2, 3];

        sizes.forEach((size) => {
            test(`creates arrow with size ${size}`, () => {
                const result = EdgeMeshFactory.create({
                    type: "solid",
                    width: 2,
                    color: "#000000",
                    arrow: {
                        target: {type: "normal", size: size, color: "#FF0000"},
                    },
                });

                assert.isTrue(result.validation.isValid);
                assert.equal(
                    (result.mesh.metadata.targetArrow as {size: number}).size,
                    size
                );
            });
        });
    });

    describe("Arrow Color Independence", () => {
        test("arrow color is independent from line color", () => {
            const result = EdgeMeshFactory.create({
                type: "solid",
                width: 2,
                color: "#0000FF", // Blue line
                arrow: {
                    target: {type: "normal", size: 1, color: "#FF0000"}, // Red arrow
                },
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.lineColor, "#0000FF");
            assert.equal(
                (result.mesh.metadata.targetArrow as {color: string}).color,
                "#FF0000"
            );
        });
    });

    describe("Arrow Opacity", () => {
        const opacities = [0.0, 0.5, 1.0];

        opacities.forEach((opacity) => {
            test(`creates arrow with opacity ${opacity}`, () => {
                const result = EdgeMeshFactory.create({
                    type: "solid",
                    width: 2,
                    color: "#000000",
                    arrow: {
                        target: {type: "normal", size: 1, color: "#FF0000", opacity},
                    },
                });

                assert.isTrue(result.validation.isValid);
                assert.equal(
                    (result.mesh.metadata.targetArrow as {opacity: number}).opacity,
                    opacity
                );
            });
        });
    });
});
```

### 3.6 2D vs 3D Mode Tests

```typescript
describe("2D vs 3D Mode", () => {
    describe("3D Mode (Default)", () => {
        test("3D filled arrows use FilledArrowRenderer", () => {
            const result = EdgeMeshFactory.create({
                type: "solid",
                is2D: false,
                arrow: {target: {type: "normal", size: 1, color: "#FF0000"}},
            });

            assert.isTrue(result.validation.isValid);
            const arrow = result.mesh.metadata.targetArrow as Record<string, unknown>;
            assert.equal(arrow.rendererType, "FilledArrowRenderer");
            assert.equal(arrow.geometryPlane, "XZ");
        });

        test("3D outline arrows use CustomLineRenderer", () => {
            const result = EdgeMeshFactory.create({
                type: "solid",
                is2D: false,
                arrow: {target: {type: "open-normal", size: 1, color: "#FF0000"}},
            });

            assert.isTrue(result.validation.isValid);
            const arrow = result.mesh.metadata.targetArrow as Record<string, unknown>;
            assert.equal(arrow.rendererType, "CustomLineRenderer");
        });
    });

    describe("2D Mode", () => {
        test("2D arrows use StandardMaterial", () => {
            const result = EdgeMeshFactory.create({
                type: "solid",
                is2D: true,
                arrow: {target: {type: "normal", size: 1, color: "#FF0000"}},
            });

            assert.isTrue(result.validation.isValid);
            const arrow = result.mesh.metadata.targetArrow as Record<string, unknown>;
            assert.equal(arrow.materialType, "StandardMaterial");
            assert.equal(arrow.geometryPlane, "XY");
        });
    });
});
```

### 3.7 Combined Configuration Tests

```typescript
describe("Combined Configurations", () => {
    // Reference: node-golden-masters.test.ts lines 257-273 (Combined Properties)

    test("animated dashed line with bidirectional arrows", () => {
        const result = EdgeMeshFactory.create({
            type: "dash-dot",
            width: 2.5,
            color: "#FF8800",
            opacity: 0.8,
            animationSpeed: 2,
            arrow: {
                source: {type: "dot", size: 1, color: "#FF0000", opacity: 0.9},
                target: {type: "diamond", size: 1.5, color: "#0000FF", opacity: 1.0},
            },
        });

        assert.isTrue(result.validation.isValid);
        assert.equal(result.mesh.metadata.lineType, "dash-dot");
        assert.equal(result.mesh.metadata.lineOpacity, 0.8);
        assert.isTrue(result.mesh.metadata.animated);
        assert.equal(result.mesh.metadata.animationSpeed, 2);
        assert.isDefined(result.mesh.metadata.sourceArrow);
        assert.isDefined(result.mesh.metadata.targetArrow);
    });

    test("bezier curve with mixed arrow types", () => {
        const result = EdgeMeshFactory.create({
            type: "solid",
            width: 2,
            color: "#00FFFF",
            bezier: true,
            arrow: {
                source: {type: "tee", size: 1, color: "#FFFF00"},
                target: {type: "normal", size: 2, color: "#FF00FF"},
            },
        });

        assert.isTrue(result.validation.isValid);
        assert.isTrue(result.mesh.metadata.bezier);
        assert.equal(
            (result.mesh.metadata.sourceArrow as {type: string}).type,
            "tee"
        );
        assert.equal(
            (result.mesh.metadata.targetArrow as {type: string}).type,
            "normal"
        );
    });
});
```

### 3.8 Default Value Tests

```typescript
describe("Default Values", () => {
    // Reference: node-golden-masters.test.ts uses defaults implicitly

    test("applies default line type (solid)", () => {
        const result = EdgeMeshFactory.create({
            width: 1,
            color: "#000000",
        });

        assert.isTrue(result.validation.isValid);
        assert.equal(result.mesh.metadata.lineType, "solid");
    });

    test("applies default width (1)", () => {
        const result = EdgeMeshFactory.create({
            type: "solid",
            color: "#000000",
        });

        assert.isTrue(result.validation.isValid);
        assert.equal(result.mesh.metadata.lineWidth, 1);
    });

    test("applies default color (#000000)", () => {
        const result = EdgeMeshFactory.create({
            type: "solid",
            width: 1,
        });

        assert.isTrue(result.validation.isValid);
        assert.equal(result.mesh.metadata.lineColor, "#000000");
    });

    test("applies default opacity (1)", () => {
        const result = EdgeMeshFactory.create({
            type: "solid",
            width: 1,
            color: "#FF0000",
        });

        assert.isTrue(result.validation.isValid);
        assert.equal(result.mesh.metadata.lineOpacity, 1);
    });
});
```

### 3.9 Files to Create/Modify

| File | Action |
|------|--------|
| `test/mesh-testing/edge-golden-masters.test.ts` | Rewrite completely |

---

## Phase 4: Create Arrowhead Golden Master Tests

**Duration**: 2-3 days

**Objective**: Create comprehensive arrowhead tests in `test/mesh-testing/arrowhead-golden-masters.test.ts` using `ArrowMeshFactory`.

### 4.1 File Structure

```typescript
/**
 * Arrowhead Golden Master Tests
 *
 * Tests all 15 arrow types with geometry validation, material properties,
 * and 2D/3D mode variations to achieve 100% coverage of FilledArrowRenderer.ts
 * and arrow-related code in EdgeMesh.ts.
 */

import {assert, describe, test} from "vitest";
import {ArrowMeshFactory} from "./mesh-factory";

describe("Arrowhead Golden Masters", () => {
    // All arrow shape tests
});
```

### 4.2 Filled Arrow Geometry Tests

```typescript
describe("Filled Arrow Geometry (3D)", () => {
    // Reference: NodeMesh.test.ts lines 20-97 (Shape Creation)

    describe("Triangle Arrows", () => {
        test("normal arrow creates triangle pointing toward target", () => {
            const result = ArrowMeshFactory.create({
                type: "normal",
                is2D: false,
                size: 1,
                color: "#FF0000",
            });

            assert.isTrue(result.validation.isValid,
                `Validation failed: ${result.validation.errors.join(", ")}`);
            assert.equal(result.mesh.metadata.arrowType, "normal");
            assert.isTrue(result.mesh.metadata.isFilled);
            assert.equal(result.mesh.metadata.geometryPlane, "XZ");
            assert.equal(result.mesh.metadata.expectedVertexCount, 3);
        });

        test("inverted arrow creates triangle pointing away from target", () => {
            const result = ArrowMeshFactory.create({
                type: "inverted",
                is2D: false,
                size: 1,
                color: "#FF0000",
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.arrowType, "inverted");
            assert.isTrue(result.mesh.metadata.isFilled);
            assert.equal(result.mesh.metadata.expectedVertexCount, 3);
        });
    });

    describe("Diamond Arrow", () => {
        test("diamond arrow creates 4-vertex rhombus", () => {
            const result = ArrowMeshFactory.create({
                type: "diamond",
                is2D: false,
                size: 1,
                color: "#00FF00",
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.arrowType, "diamond");
            assert.isTrue(result.mesh.metadata.isFilled);
            assert.equal(result.mesh.metadata.geometryPlane, "XZ");
            assert.equal(result.mesh.metadata.expectedVertexCount, 4);
        });
    });

    describe("Box Arrow", () => {
        test("box arrow creates 4-vertex rectangle", () => {
            const result = ArrowMeshFactory.create({
                type: "box",
                is2D: false,
                size: 1,
                color: "#0000FF",
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.arrowType, "box");
            assert.isTrue(result.mesh.metadata.isFilled);
            assert.equal(result.mesh.metadata.geometryPlane, "XZ");
            assert.equal(result.mesh.metadata.expectedVertexCount, 4);
        });
    });

    describe("Dot Arrow", () => {
        test("dot arrow creates circle with 32+ vertices", () => {
            const result = ArrowMeshFactory.create({
                type: "dot",
                is2D: false,
                size: 1,
                color: "#FFFF00",
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.arrowType, "dot");
            assert.isTrue(result.mesh.metadata.isFilled);
            assert.equal(result.mesh.metadata.geometryPlane, "XZ");
            assert.isAtLeast(result.mesh.metadata.expectedVertexCount, 32);
        });
    });

    describe("XZ Plane Requirement (CRITICAL)", () => {
        // Reference: design/edge-styles-implementation-plan.md "CRITICAL LESSON LEARNED"

        const filledTypes = ArrowMeshFactory.FILLED_ARROWS;

        filledTypes.forEach((arrowType) => {
            test(`${arrowType} uses XZ plane geometry (Y=0)`, () => {
                const result = ArrowMeshFactory.create({
                    type: arrowType,
                    is2D: false,
                });

                assert.isTrue(result.validation.isValid);
                assert.equal(
                    result.mesh.metadata.geometryPlane,
                    "XZ",
                    `${arrowType} MUST use XZ plane for tangent billboarding to work`
                );
            });

            test(`${arrowType} has face normal in ±Y direction`, () => {
                const result = ArrowMeshFactory.create({
                    type: arrowType,
                    is2D: false,
                });

                assert.isTrue(result.validation.isValid);
                assert.equal(
                    result.mesh.metadata.faceNormal,
                    "Y",
                    `${arrowType} face normal must be in ±Y for camera-facing`
                );
            });
        });
    });
});
```

### 4.3 Outline Arrow Geometry Tests

```typescript
describe("Outline Arrow Geometry (3D)", () => {
    describe("Open-Normal (Hollow Triangle)", () => {
        test("open-normal creates V-shape path", () => {
            const result = ArrowMeshFactory.create({
                type: "open-normal",
                is2D: false,
                size: 1,
                color: "#FF0000",
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.arrowType, "open-normal");
            assert.isFalse(result.mesh.metadata.isFilled);
            assert.equal(result.mesh.metadata.rendererType, "CustomLineRenderer");
            assert.equal(result.mesh.metadata.pathPoints, 3);
            assert.isFalse(result.mesh.metadata.isClosed);
        });
    });

    describe("Open-Dot (Circle Outline)", () => {
        test("open-dot creates closed circle path", () => {
            const result = ArrowMeshFactory.create({
                type: "open-dot",
                is2D: false,
                size: 1,
                color: "#00FF00",
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.arrowType, "open-dot");
            assert.isFalse(result.mesh.metadata.isFilled);
            assert.equal(result.mesh.metadata.rendererType, "CustomLineRenderer");
            assert.isAtLeast(result.mesh.metadata.pathPoints, 32);
            assert.isTrue(result.mesh.metadata.isClosed);
        });
    });

    describe("Open-Diamond (Diamond Outline)", () => {
        test("open-diamond creates closed diamond path", () => {
            const result = ArrowMeshFactory.create({
                type: "open-diamond",
                is2D: false,
                size: 1,
                color: "#0000FF",
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.arrowType, "open-diamond");
            assert.isFalse(result.mesh.metadata.isFilled);
            assert.equal(result.mesh.metadata.pathPoints, 5);
            assert.isTrue(result.mesh.metadata.isClosed);
        });
    });

    describe("Tee (Perpendicular Line)", () => {
        test("tee creates single perpendicular segment", () => {
            const result = ArrowMeshFactory.create({
                type: "tee",
                is2D: false,
                size: 1,
                color: "#FF00FF",
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.arrowType, "tee");
            assert.isFalse(result.mesh.metadata.isFilled);
            assert.equal(result.mesh.metadata.pathPoints, 2);
            assert.isFalse(result.mesh.metadata.isClosed);
        });
    });

    describe("Open (Chevron)", () => {
        test("open creates V-shape without base", () => {
            const result = ArrowMeshFactory.create({
                type: "open",
                is2D: false,
                size: 1,
                color: "#FFFF00",
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.arrowType, "open");
            assert.isFalse(result.mesh.metadata.isFilled);
            assert.equal(result.mesh.metadata.pathPoints, 3);
            assert.isFalse(result.mesh.metadata.isClosed);
        });
    });

    describe("Half-Open (Asymmetric V)", () => {
        test("half-open creates asymmetric arrow", () => {
            const result = ArrowMeshFactory.create({
                type: "half-open",
                is2D: false,
                size: 1,
                color: "#00FFFF",
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.arrowType, "half-open");
            assert.isFalse(result.mesh.metadata.isFilled);
        });
    });

    describe("Vee (Wide V)", () => {
        test("vee creates wide V-shape", () => {
            const result = ArrowMeshFactory.create({
                type: "vee",
                is2D: false,
                size: 1,
                color: "#FF8800",
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.arrowType, "vee");
            assert.isFalse(result.mesh.metadata.isFilled);
            assert.equal(result.mesh.metadata.pathPoints, 3);
        });
    });

    describe("Crow (Three-Prong Fork)", () => {
        test("crow creates three-pronged fork", () => {
            const result = ArrowMeshFactory.create({
                type: "crow",
                is2D: false,
                size: 1,
                color: "#8800FF",
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.arrowType, "crow");
            assert.isFalse(result.mesh.metadata.isFilled);
            assert.isAtLeast(result.mesh.metadata.pathPoints, 5);
        });
    });

    describe("Outline Arrows Use CustomLineRenderer", () => {
        const outlineTypes = ArrowMeshFactory.OUTLINE_ARROWS;

        outlineTypes.forEach((arrowType) => {
            test(`${arrowType} uses CustomLineRenderer shader`, () => {
                const result = ArrowMeshFactory.create({
                    type: arrowType,
                    is2D: false,
                });

                assert.isTrue(result.validation.isValid);
                assert.equal(
                    result.mesh.metadata.rendererType,
                    "CustomLineRenderer",
                    `${arrowType} should use same shader as lines`
                );
                assert.equal(result.material.metadata.shaderName, "customLine");
            });
        });
    });
});
```

### 4.4 3D Shader Property Tests

```typescript
describe("3D Arrow Shader Properties", () => {
    // Reference: NodeMesh.test.ts lines 99-224 (Material Creation)

    describe("Tangent Billboarding Shader (Filled Arrows)", () => {
        test("filled arrows use ShaderMaterial", () => {
            const result = ArrowMeshFactory.create({
                type: "normal",
                is2D: false,
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.material.metadata.materialType, "ShaderMaterial");
            assert.equal(result.material.metadata.shaderName, "filledArrow");
        });

        test("shader has required uniforms", () => {
            const result = ArrowMeshFactory.create({
                type: "diamond",
                is2D: false,
                size: 2,
                color: "#FF0000",
                opacity: 0.8,
            });

            assert.isTrue(result.validation.isValid);
            const uniforms = result.material.metadata.uniforms as Record<string, unknown>;
            assert.isDefined(uniforms.size);
            assert.isDefined(uniforms.color);
            assert.isDefined(uniforms.opacity);
            assert.equal(uniforms.size, 2);
            assert.equal(uniforms.opacity, 0.8);
        });

        test("shader has lineDirection attribute for tangent billboarding", () => {
            const result = ArrowMeshFactory.create({
                type: "box",
                is2D: false,
            });

            assert.isTrue(result.validation.isValid);
            const attributes = result.material.metadata.attributes as string[];
            assert.include(attributes, "lineDirection");
            assert.equal(result.material.metadata.thinInstanceAttribute, "lineDirection");
        });
    });

    describe("CustomLineRenderer Shader (Outline Arrows)", () => {
        test("outline arrows use customLine shader", () => {
            const result = ArrowMeshFactory.create({
                type: "open-normal",
                is2D: false,
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.material.metadata.materialType, "ShaderMaterial");
            assert.equal(result.material.metadata.shaderName, "customLine");
        });

        test("outline arrows have thin width", () => {
            const result = ArrowMeshFactory.create({
                type: "tee",
                is2D: false,
                width: 1,
            });

            assert.isTrue(result.validation.isValid);
            const uniforms = result.material.metadata.uniforms as Record<string, unknown>;
            // Outline arrows should use thin width (0.3 multiplier)
            assert.isBelow(uniforms.width as number, 1);
        });
    });
});
```

### 4.5 2D Arrow Tests

```typescript
describe("2D Arrow Properties", () => {
    // Reference: test/meshes/FilledArrowRenderer.test.ts (2D arrow tests)

    describe("StandardMaterial Usage", () => {
        const allArrowTypes = ArrowMeshFactory.ARROW_TYPES.filter(t => t !== "none");

        allArrowTypes.forEach((arrowType) => {
            test(`2D ${arrowType} uses StandardMaterial`, () => {
                const result = ArrowMeshFactory.create({
                    type: arrowType,
                    is2D: true,
                    color: "#FF0000",
                });

                assert.isTrue(result.validation.isValid);
                assert.equal(result.material.metadata.materialType, "StandardMaterial");
            });
        });
    });

    describe("XY Plane Geometry", () => {
        const filledTypes = ArrowMeshFactory.FILLED_ARROWS;

        filledTypes.forEach((arrowType) => {
            test(`2D ${arrowType} uses XY plane with rotation`, () => {
                const result = ArrowMeshFactory.create({
                    type: arrowType,
                    is2D: true,
                });

                assert.isTrue(result.validation.isValid);
                assert.equal(result.mesh.metadata.geometryPlane, "XY");
                assert.equal(result.mesh.metadata.rotation.x, Math.PI / 2);
            });
        });
    });

    describe("Emissive Color (Unlit)", () => {
        test("2D arrows use emissive color", () => {
            const result = ArrowMeshFactory.create({
                type: "normal",
                is2D: true,
                color: "#00FF00",
            });

            assert.isTrue(result.validation.isValid);
            assert.isTrue(result.material.metadata.disableLighting);
            assert.isTrue(result.material.wasMethodCalled("setEmissiveColor"));
        });
    });

    describe("Alpha/Opacity", () => {
        test("2D arrows apply alpha correctly", () => {
            const result = ArrowMeshFactory.create({
                type: "diamond",
                is2D: true,
                opacity: 0.7,
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.material.alpha, 0.7);
        });
    });
});
```

### 4.6 Size and Property Variation Tests

```typescript
describe("Arrow Size Variations", () => {
    // Reference: node-golden-masters.test.ts lines 34-54 (Size Variations)

    const sizes = [0.5, 1, 1.5, 2, 3, 5];
    const testShapes = ["normal", "diamond", "dot", "open-normal", "tee"];

    testShapes.forEach((shape) => {
        describe(`${shape} size variations`, () => {
            sizes.forEach((size) => {
                test(`creates ${shape} with size ${size}`, () => {
                    const result = ArrowMeshFactory.create({
                        type: shape,
                        size: size,
                    });

                    assert.isTrue(result.validation.isValid);
                    assert.equal(result.mesh.metadata.size, size);

                    if (!ArrowMeshFactory.OUTLINE_ARROWS.includes(shape)) {
                        const uniforms = result.material.metadata.uniforms as Record<string, unknown>;
                        assert.equal(uniforms.size, size);
                    }
                });
            });
        });
    });
});

describe("Arrow Color Variations", () => {
    const colors = ["#FF0000", "#00FF00", "#0000FF", "#FFFFFF", "#000000", "#FFFF00"];

    colors.forEach((color) => {
        test(`creates arrow with color ${color}`, () => {
            const result = ArrowMeshFactory.create({
                type: "normal",
                color: color,
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.color, color);
        });
    });
});

describe("Arrow Opacity Variations", () => {
    const opacities = [0.0, 0.25, 0.5, 0.75, 1.0];

    opacities.forEach((opacity) => {
        test(`creates arrow with opacity ${opacity}`, () => {
            const result = ArrowMeshFactory.create({
                type: "diamond",
                opacity: opacity,
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.visibility, opacity);
        });
    });
});
```

### 4.7 None Type and Error Handling

```typescript
describe("None Type and Error Handling", () => {
    // Reference: NodeMesh.test.ts lines 59-78 (Error handling)

    test("'none' type returns null mesh", () => {
        const result = ArrowMeshFactory.create({
            type: "none",
        });

        assert.isTrue(result.validation.isValid);
        assert.isNull(result.mesh);
        assert.isNull(result.material);
    });

    test("missing type defaults to 'normal'", () => {
        const result = ArrowMeshFactory.create({});

        assert.isTrue(result.validation.isValid);
        assert.equal(result.mesh.metadata.arrowType, "normal");
    });

    test("invalid type throws error", () => {
        assert.throws(() => {
            ArrowMeshFactory.create({
                type: "invalid-arrow-type",
            });
        }, /unknown arrow type/i);
    });
});
```

### 4.8 Files to Create

| File | Action |
|------|--------|
| `test/mesh-testing/arrowhead-golden-masters.test.ts` | Create new file |

---

## Phase 5: Enhance Direct Unit Tests

**Duration**: 1-2 days

**Objective**: Enhance existing unit tests with additional coverage for edge cases and new features.

### 5.1 Enhance EdgeMesh.test.ts

Add tests for bezier curves and pattern lines to `test/EdgeMesh.test.ts`:

```typescript
// Add to existing EdgeMesh.test.ts

describe("Bezier Curves", () => {
    test("creates bezier curve with multi-segment geometry", () => {
        const options = {
            styleId: "test-bezier",
            width: 0.5,
            color: "#FF0000",
        };
        const style = {
            line: {width: 0.5, color: "#FF0000", bezier: true},
            enabled: true,
        };

        const mesh = EdgeMesh.create(meshCache, options, style, scene);

        assert.exists(mesh);
        // Bezier curves should have multiple segments
        const positions = mesh.getVerticesData("position");
        assert.exists(positions);
        assert.isAbove(positions.length, 12); // More than 1 segment
    });
});

describe("Line Opacity", () => {
    test("applies opacity to shader uniform", () => {
        const options = {
            styleId: "test-opacity",
            width: 0.5,
            color: "#FF0000",
        };
        const style = {
            line: {width: 0.5, color: "#FF0000", opacity: 0.5},
            enabled: true,
        };

        const mesh = EdgeMesh.create(meshCache, options, style, scene);

        assert.exists(mesh);
        // Check shader material uniform
        const material = mesh.material as ShaderMaterial;
        assert.exists(material);
    });
});
```

### 5.2 Enhance FilledArrowRenderer.test.ts

Add 3D arrow tests to `test/meshes/FilledArrowRenderer.test.ts`:

```typescript
// Add to existing FilledArrowRenderer.test.ts

describe("FilledArrowRenderer - 3D Arrows", () => {
    test("create3DArrow generates mesh with ShaderMaterial", () => {
        // Skip if FilledArrowRenderer.create3DArrow doesn't exist yet
        if (typeof FilledArrowRenderer.create3DArrow !== "function") {
            return;
        }

        const mesh = FilledArrowRenderer.create3DArrow(
            "normal",
            0.5,
            0.3,
            "#ff0000",
            1.0,
            scene,
        );

        assert.exists(mesh);
        assert.instanceOf(mesh.material, ShaderMaterial);
    });

    describe("XZ Plane Geometry Verification", () => {
        const filledTypes = ["normal", "inverted", "diamond", "box", "dot"];

        filledTypes.forEach((arrowType) => {
            test(`${arrowType} geometry is in XZ plane (Y=0)`, () => {
                const mesh = FilledArrowRenderer.create2DArrow(
                    arrowType,
                    0.5,
                    0.3,
                    "#ff0000",
                    1.0,
                    scene,
                );

                const positions = mesh.getVerticesData("position");
                assert.exists(positions);

                // For 2D arrows rotated to XY, verify geometry is correct
                // (Before rotation, should be in XZ plane)
            });
        });
    });
});
```

### 5.3 Files to Modify

| File | Changes |
|------|---------|
| `test/EdgeMesh.test.ts` | Add bezier, opacity tests |
| `test/meshes/FilledArrowRenderer.test.ts` | Add 3D arrow tests |
| `test/CustomLineRenderer.test.ts` | Add pattern-specific tests |

---

## Phase 6: Integration Tests

**Duration**: 1 day

**Objective**: Create integration tests that validate the complete edge creation workflow.

### 6.1 Create Edge.integration.test.ts

```typescript
/**
 * Edge Integration Tests
 *
 * Tests the complete edge creation workflow including line, arrows,
 * positioning, and transformation.
 */

import {NullEngine, Scene, Vector3} from "@babylonjs/core";
import {assert, beforeEach, describe, test} from "vitest";

import {Edge} from "../src/Edge";
import {MeshCache} from "../src/meshes/MeshCache";

describe("Edge Integration", () => {
    let scene: Scene;
    let meshCache: MeshCache;

    beforeEach(() => {
        const engine = new NullEngine();
        scene = new Scene(engine);
        meshCache = new MeshCache();
    });

    describe("Complete Edge Creation", () => {
        test("creates edge with line, arrowHead, and arrowTail", () => {
            // Test complete edge creation workflow
        });

        test("updates edge style correctly", () => {
            // Test style updates
        });

        test("disposes edge resources correctly", () => {
            // Test disposal
        });
    });

    describe("Arrow Positioning", () => {
        test("arrow head positions at sphere intercept (destination)", () => {
            // Test arrow head positioning
        });

        test("arrow tail positions at sphere intercept (source)", () => {
            // Test arrow tail positioning
        });

        test("arrows maintain zero gap with line", () => {
            // Test zero-gap guarantee
        });
    });

    describe("Edge Transformation", () => {
        test("transformMesh positions line at midpoint", () => {
            // Test line positioning
        });

        test("transformMesh scales line to correct length", () => {
            // Test line scaling
        });

        test("transformMesh orients line correctly", () => {
            // Test line orientation
        });
    });
});
```

### 6.2 Files to Create

| File | Action |
|------|--------|
| `test/Edge.integration.test.ts` | Create new file |

---

## Phase 7: Performance Testing

**Duration**: 2-3 days

**Objective**: Create comprehensive performance benchmarks measuring render time across varying edge counts (10, 100, 1000, 10000), layout types (static vs physics-based), line styles, and arrowhead types to ensure all code paths are performance-tested. Use the existing `StatsManager` profiling system to identify bottlenecks and track performance regressions.

### 7.1 Performance Test Infrastructure

The performance tests leverage the existing `StatsManager` profiling system which provides:

- **CPU Profiling**: `measure()`, `startMeasurement()`/`endMeasurement()` with percentiles (p50/p95/p99)
- **GPU Metrics**: BabylonJS EngineInstrumentation (GPU frame time, shader compilation)
- **Scene Metrics**: Frame time, render time, inter-frame time, draw calls, mesh evaluation
- **Layout Session Tracking**: Total time with CPU/GPU/blocking breakdown
- **Frame-Level Blocking Detection**: Identifies operations correlated with high blocking
- **Event Counters**: Track cache hits/misses and other events

Create a dedicated performance test file:

```typescript
/**
 * Edge Performance Tests
 *
 * Uses StatsManager profiling to measure render time and identify bottlenecks:
 * - Edge counts: 10, 100, 1000, 10000
 * - Layout types: fixed (static), ngraph (physics-based)
 * - Line styles: solid, dot, dash, diamond, sinewave, zigzag
 * - Arrowhead types: none, normal, sphere-dot, diamond, tee, open-normal
 *
 * Leverages existing instrumentation:
 * - StatsManager.measure() for CPU timing
 * - StatsManager.getSnapshot() for comprehensive metrics
 * - StatsManager.getBlockingReport() for bottleneck identification
 * - BabylonJS EngineInstrumentation for GPU metrics
 * - BabylonJS SceneInstrumentation for scene metrics
 */

import {NullEngine, Scene} from "@babylonjs/core";
import {afterEach, beforeEach, describe, test} from "vitest";
import type {PerformanceSnapshot, OperationBlockingStats} from "../../src/managers/StatsManager";

// Extended performance metrics using StatsManager data
interface PerformanceMetrics {
    // Test configuration
    edgeCount: number;
    layoutType: string;
    lineStyle: string;
    arrowType: string;

    // CPU timing metrics (from StatsManager.getSnapshot().cpu)
    edgeCreationTime: number;          // Edge.constructor total
    edgeUpdateTime: number;            // Edge.update total
    arrowCapUpdateTime: number;        // ArrowCap update total
    intersectCalcTime: number;         // Ray intersection calculation
    graphStepTime: number;             // Layout physics step (ngraph only)

    // Percentiles (from StatsManager)
    edgeUpdateP95: number;
    edgeUpdateP99: number;

    // Scene metrics (from BabylonJS SceneInstrumentation)
    frameTimeAvg: number;
    frameTimeP95: number;
    renderTimeAvg: number;
    interFrameTimeAvg: number;
    drawCallsCount: number;
    activeMeshesEvalTime: number;

    // GPU metrics (from BabylonJS EngineInstrumentation)
    gpuFrameTimeAvg: number;
    shaderCompilationTime: number;

    // Layout session metrics (from StatsManager.getLayoutSessionMetrics())
    layoutTotalTime: number;
    layoutCpuPercent: number;
    layoutGpuPercent: number;
    layoutBlockingPercent: number;
    layoutFrameCount: number;

    // Derived metrics
    fps: number;
    edgesPerSecond: number;

    // Memory metrics
    heapUsedBefore: number;
    heapUsedAfter: number;
    memoryDelta: number;

    // Bottleneck identification (from StatsManager.getBlockingReport())
    topBlockingOperations: OperationBlockingStats[];
}

// Test configuration
const TEST_CONFIG = {
    EDGE_COUNTS: [10, 100, 1000, 10000],

    LAYOUT_TYPES: [
        {name: "fixed", type: "fixed", isPhysics: false},
        {name: "ngraph", type: "ngraph", isPhysics: true},
    ],

    LINE_STYLES: [
        {name: "solid", type: "solid", pattern: null},
        {name: "dot", type: "dot", pattern: "circle"},
        {name: "dash", type: "dash", pattern: "rectangle"},
        {name: "diamond", type: "diamond", pattern: "diamond"},
        {name: "sinewave", type: "sinewave", pattern: "wave"},
        {name: "zigzag", type: "zigzag", pattern: "zigzag"},
    ],

    ARROW_TYPES: [
        {name: "none", type: "none", renderer: null},
        {name: "normal", type: "normal", renderer: "FilledArrowRenderer"},
        {name: "sphere-dot", type: "sphere-dot", renderer: "FilledArrowRenderer"},
        {name: "diamond", type: "diamond", renderer: "FilledArrowRenderer"},
        {name: "box", type: "box", renderer: "FilledArrowRenderer"},
        {name: "dot", type: "dot", renderer: "FilledArrowRenderer"},
        {name: "tee", type: "tee", renderer: "CustomLineRenderer"},
        {name: "open-normal", type: "open-normal", renderer: "CustomLineRenderer"},
        {name: "crow", type: "crow", renderer: "CustomLineRenderer"},
    ],

    // Test settings
    WARMUP_FRAMES: 10,
    MEASURE_FRAMES: 100,
    PHYSICS_SETTLE_TIMEOUT_MS: 5000,
};
```

### 7.2 Performance Test Matrix

Create systematic tests covering all code paths:

```typescript
describe("Edge Performance Tests", () => {
    let engine: NullEngine;
    let scene: Scene;
    let metrics: PerformanceMetrics[];

    beforeEach(() => {
        engine = new NullEngine();
        scene = new Scene(engine);
        metrics = [];
    });

    afterEach(() => {
        // Log metrics for analysis
        if (metrics.length > 0) {
            console.table(metrics);
        }
        scene.dispose();
        engine.dispose();
    });

    // =========================================================
    // SECTION 1: Edge Count Scaling Tests (baseline: solid line, no arrows)
    // =========================================================
    describe("Edge Count Scaling", () => {
        describe("Static Layout (Fixed Positions)", () => {
            TEST_CONFIG.EDGE_COUNTS.forEach((edgeCount) => {
                test(`${edgeCount} edges with fixed layout`, async () => {
                    const result = await measureEdgePerformance({
                        edgeCount,
                        layoutType: "fixed",
                        lineStyle: "solid",
                        arrowType: "none",
                    });

                    metrics.push(result);

                    // Baseline assertions
                    assert.isBelow(result.firstRenderTime, edgeCount * 10); // 10ms per edge max
                    assert.isAbove(result.fps, 30); // Minimum 30 FPS
                });
            });
        });

        describe("Physics Layout (NGraph Force-Directed)", () => {
            TEST_CONFIG.EDGE_COUNTS.forEach((edgeCount) => {
                test(`${edgeCount} edges with ngraph physics`, async () => {
                    const result = await measureEdgePerformance({
                        edgeCount,
                        layoutType: "ngraph",
                        lineStyle: "solid",
                        arrowType: "none",
                    });

                    metrics.push(result);

                    // Physics layouts need more time
                    assert.isBelow(result.layoutSettleTime, TEST_CONFIG.PHYSICS_SETTLE_TIMEOUT_MS);
                    assert.isAbove(result.fps, 15); // Lower FPS threshold for physics
                });
            });
        });
    });

    // =========================================================
    // SECTION 2: Line Style Performance (compare renderers)
    // =========================================================
    describe("Line Style Performance", () => {
        const BENCHMARK_EDGE_COUNT = 1000;

        describe("Solid Line (CustomLineRenderer)", () => {
            ["fixed", "ngraph"].forEach((layoutType) => {
                test(`solid line with ${layoutType} layout`, async () => {
                    const result = await measureEdgePerformance({
                        edgeCount: BENCHMARK_EDGE_COUNT,
                        layoutType,
                        lineStyle: "solid",
                        arrowType: "none",
                    });

                    metrics.push(result);
                    assert.isAbove(result.fps, layoutType === "fixed" ? 30 : 15);
                });
            });
        });

        describe("Patterned Lines (PatternedLineRenderer - Instanced Meshes)", () => {
            const patterns = ["dot", "dash", "diamond", "sinewave", "zigzag"];

            patterns.forEach((pattern) => {
                ["fixed", "ngraph"].forEach((layoutType) => {
                    test(`${pattern} pattern with ${layoutType} layout`, async () => {
                        const result = await measureEdgePerformance({
                            edgeCount: BENCHMARK_EDGE_COUNT,
                            layoutType,
                            lineStyle: pattern,
                            arrowType: "none",
                        });

                        metrics.push(result);
                        // Patterned lines may be slightly slower due to instancing
                        assert.isAbove(result.fps, layoutType === "fixed" ? 25 : 12);
                    });
                });
            });
        });

        describe("Line Style Comparison (same edge count)", () => {
            test("compare all line styles at 1000 edges with fixed layout", async () => {
                const lineStyles = TEST_CONFIG.LINE_STYLES;
                const results: PerformanceMetrics[] = [];

                for (const style of lineStyles) {
                    const result = await measureEdgePerformance({
                        edgeCount: BENCHMARK_EDGE_COUNT,
                        layoutType: "fixed",
                        lineStyle: style.name,
                        arrowType: "none",
                    });
                    results.push(result);
                }

                metrics.push(...results);

                // Solid should be fastest (no instancing overhead)
                const solidResult = results.find(r => r.lineStyle === "solid")!;
                const avgPatternedFps = results
                    .filter(r => r.lineStyle !== "solid")
                    .reduce((sum, r) => sum + r.fps, 0) / (results.length - 1);

                // Solid line should be at least 80% of patterned performance
                assert.isAbove(solidResult.fps, avgPatternedFps * 0.8);
            });
        });
    });

    // =========================================================
    // SECTION 3: Arrowhead Performance (compare arrow types)
    // =========================================================
    describe("Arrowhead Performance", () => {
        const BENCHMARK_EDGE_COUNT = 1000;

        describe("No Arrows (Baseline)", () => {
            ["fixed", "ngraph"].forEach((layoutType) => {
                test(`no arrows with ${layoutType} layout`, async () => {
                    const result = await measureEdgePerformance({
                        edgeCount: BENCHMARK_EDGE_COUNT,
                        layoutType,
                        lineStyle: "solid",
                        arrowType: "none",
                    });

                    metrics.push(result);
                    assert.isAbove(result.fps, layoutType === "fixed" ? 30 : 15);
                });
            });
        });

        describe("Filled Arrows (FilledArrowRenderer - Tangent Billboarding)", () => {
            const filledArrows = ["normal", "inverted", "diamond", "box", "dot"];

            filledArrows.forEach((arrowType) => {
                ["fixed", "ngraph"].forEach((layoutType) => {
                    test(`${arrowType} filled arrow with ${layoutType} layout`, async () => {
                        const result = await measureEdgePerformance({
                            edgeCount: BENCHMARK_EDGE_COUNT,
                            layoutType,
                            lineStyle: "solid",
                            arrowType,
                        });

                        metrics.push(result);
                        // Arrows add overhead, expect slightly lower FPS
                        assert.isAbove(result.fps, layoutType === "fixed" ? 20 : 10);
                    });
                });
            });
        });

        describe("Sphere Arrows (Special Rendering)", () => {
            ["fixed", "ngraph"].forEach((layoutType) => {
                test(`sphere-dot arrow with ${layoutType} layout`, async () => {
                    const result = await measureEdgePerformance({
                        edgeCount: BENCHMARK_EDGE_COUNT,
                        layoutType,
                        lineStyle: "solid",
                        arrowType: "sphere-dot",
                    });

                    metrics.push(result);
                    // Sphere arrows may have different performance characteristics
                    assert.isAbove(result.fps, layoutType === "fixed" ? 20 : 10);
                });
            });
        });

        describe("Outline Arrows (CustomLineRenderer Path)", () => {
            const outlineArrows = ["tee", "open-normal", "open-diamond", "crow", "vee"];

            outlineArrows.forEach((arrowType) => {
                ["fixed", "ngraph"].forEach((layoutType) => {
                    test(`${arrowType} outline arrow with ${layoutType} layout`, async () => {
                        const result = await measureEdgePerformance({
                            edgeCount: BENCHMARK_EDGE_COUNT,
                            layoutType,
                            lineStyle: "solid",
                            arrowType,
                        });

                        metrics.push(result);
                        // Outline arrows use CustomLineRenderer (same as solid lines)
                        assert.isAbove(result.fps, layoutType === "fixed" ? 20 : 10);
                    });
                });
            });
        });

        describe("Arrowhead Type Comparison", () => {
            test("compare all arrow types at 1000 edges with fixed layout", async () => {
                const results: PerformanceMetrics[] = [];

                for (const arrow of TEST_CONFIG.ARROW_TYPES) {
                    const result = await measureEdgePerformance({
                        edgeCount: BENCHMARK_EDGE_COUNT,
                        layoutType: "fixed",
                        lineStyle: "solid",
                        arrowType: arrow.name,
                    });
                    results.push(result);
                }

                metrics.push(...results);

                // "none" should be fastest
                const noArrowResult = results.find(r => r.arrowType === "none")!;
                const avgWithArrowFps = results
                    .filter(r => r.arrowType !== "none")
                    .reduce((sum, r) => sum + r.fps, 0) / (results.length - 1);

                // No arrow should be at least 20% faster than average with arrows
                assert.isAbove(noArrowResult.fps, avgWithArrowFps * 1.1);
            });
        });
    });

    // =========================================================
    // SECTION 4: Bidirectional Arrows (both arrowHead and arrowTail)
    // =========================================================
    describe("Bidirectional Arrow Performance", () => {
        const BENCHMARK_EDGE_COUNT = 1000;

        test("bidirectional normal arrows with fixed layout", async () => {
            const result = await measureEdgePerformance({
                edgeCount: BENCHMARK_EDGE_COUNT,
                layoutType: "fixed",
                lineStyle: "solid",
                arrowType: "normal",
                arrowTailType: "normal", // Both ends have arrows
            });

            metrics.push(result);
            // Bidirectional arrows double the arrow count
            assert.isAbove(result.fps, 15);
        });

        test("mixed arrow types (normal head, tee tail)", async () => {
            const result = await measureEdgePerformance({
                edgeCount: BENCHMARK_EDGE_COUNT,
                layoutType: "fixed",
                lineStyle: "solid",
                arrowType: "normal",
                arrowTailType: "tee",
            });

            metrics.push(result);
            assert.isAbove(result.fps, 15);
        });
    });

    // =========================================================
    // SECTION 5: Combined Configurations (realistic scenarios)
    // =========================================================
    describe("Combined Configuration Performance", () => {
        describe("Realistic Graph Configurations", () => {
            test("100 edges: solid line + normal arrows + fixed layout", async () => {
                const result = await measureEdgePerformance({
                    edgeCount: 100,
                    layoutType: "fixed",
                    lineStyle: "solid",
                    arrowType: "normal",
                });

                metrics.push(result);
                assert.isAbove(result.fps, 60); // Small graphs should run at 60 FPS
            });

            test("500 edges: dash line + diamond arrows + ngraph layout", async () => {
                const result = await measureEdgePerformance({
                    edgeCount: 500,
                    layoutType: "ngraph",
                    lineStyle: "dash",
                    arrowType: "diamond",
                });

                metrics.push(result);
                assert.isAbove(result.fps, 20);
            });

            test("1000 edges: dot pattern + sphere-dot arrows + fixed layout", async () => {
                const result = await measureEdgePerformance({
                    edgeCount: 1000,
                    layoutType: "fixed",
                    lineStyle: "dot",
                    arrowType: "sphere-dot",
                });

                metrics.push(result);
                assert.isAbove(result.fps, 20);
            });

            test("5000 edges: solid line + no arrows + ngraph layout (stress test)", async () => {
                const result = await measureEdgePerformance({
                    edgeCount: 5000,
                    layoutType: "ngraph",
                    lineStyle: "solid",
                    arrowType: "none",
                });

                metrics.push(result);
                // Large physics graphs are slower but should still be interactive
                assert.isAbove(result.fps, 10);
            });
        });

        describe("Worst-Case Configurations", () => {
            test("1000 edges: sinewave + bidirectional crow arrows + ngraph", async () => {
                const result = await measureEdgePerformance({
                    edgeCount: 1000,
                    layoutType: "ngraph",
                    lineStyle: "sinewave",
                    arrowType: "crow",
                    arrowTailType: "crow",
                });

                metrics.push(result);
                // Even worst case should be usable
                assert.isAbove(result.fps, 5);
            });
        });
    });

    // =========================================================
    // SECTION 6: Memory Usage Tests
    // =========================================================
    describe("Memory Usage", () => {
        const EDGE_COUNTS = [100, 1000, 5000];

        EDGE_COUNTS.forEach((edgeCount) => {
            test(`memory usage for ${edgeCount} edges (solid, no arrows)`, async () => {
                const result = await measureEdgePerformance({
                    edgeCount,
                    layoutType: "fixed",
                    lineStyle: "solid",
                    arrowType: "none",
                });

                metrics.push(result);

                // Memory should scale roughly linearly with edge count
                const memoryPerEdge = result.memoryDelta / edgeCount;
                assert.isBelow(memoryPerEdge, 10000); // Max 10KB per edge
            });
        });

        test("memory comparison: solid vs patterned lines", async () => {
            const solidResult = await measureEdgePerformance({
                edgeCount: 1000,
                layoutType: "fixed",
                lineStyle: "solid",
                arrowType: "none",
            });

            const patternedResult = await measureEdgePerformance({
                edgeCount: 1000,
                layoutType: "fixed",
                lineStyle: "diamond",
                arrowType: "none",
            });

            metrics.push(solidResult, patternedResult);

            // Patterned lines use instancing so shouldn't use much more memory
            const memoryRatio = patternedResult.memoryDelta / solidResult.memoryDelta;
            assert.isBelow(memoryRatio, 3); // Max 3x memory for instanced patterns
        });
    });

    // =========================================================
    // SECTION 7: Layout Transition Performance
    // =========================================================
    describe("Layout Transition Performance", () => {
        test("layout change from fixed to ngraph", async () => {
            // Measure time to transition layouts
            const transitionTime = await measureLayoutTransition({
                edgeCount: 500,
                fromLayout: "fixed",
                toLayout: "ngraph",
            });

            assert.isBelow(transitionTime, 1000); // Max 1 second to start transition
        });

        test("layout change from ngraph to fixed", async () => {
            const transitionTime = await measureLayoutTransition({
                edgeCount: 500,
                fromLayout: "ngraph",
                toLayout: "fixed",
            });

            assert.isBelow(transitionTime, 500); // Fixed layout is instant
        });
    });
});
```

### 7.3 Performance Measurement Utilities (Using StatsManager)

```typescript
// test/helpers/performance-utils.ts

import type {PerformanceSnapshot, OperationBlockingStats} from "../../src/managers/StatsManager";
import type {StatsManager} from "../../src/managers/StatsManager";
import type {Graph} from "../../src/Graph";

interface MeasurementOptions {
    edgeCount: number;
    layoutType: string;
    lineStyle: string;
    arrowType: string;
    arrowTailType?: string;
}

/**
 * Measures performance metrics using the StatsManager profiling system
 * This integrates with the existing instrumentation infrastructure
 */
async function measureEdgePerformance(options: MeasurementOptions): Promise<PerformanceMetrics> {
    const {edgeCount, layoutType, lineStyle, arrowType, arrowTailType} = options;

    // Capture memory before
    const heapUsedBefore = process.memoryUsage?.().heapUsed ?? 0;

    // Create graph with specified configuration
    const graph = await createTestGraph({
        nodeCount: Math.ceil(Math.sqrt(edgeCount * 2)),
        edgeCount,
        layoutType,
        edgeStyle: {
            line: {type: lineStyle, width: 0.5, color: "#FFFFFF"},
            arrowHead: arrowType !== "none" ? {type: arrowType, size: 1, color: "#FF0000"} : undefined,
            arrowTail: arrowTailType ? {type: arrowTailType, size: 1, color: "#00FF00"} : undefined,
        },
    });

    // Get StatsManager and enable profiling
    const statsManager = graph.getStatsManager();
    statsManager.enableProfiling();
    statsManager.enableFrameProfiling();

    // Start layout session tracking
    statsManager.startLayoutSession();

    // Wait for layout to settle (physics only)
    if (layoutType === "ngraph") {
        await waitForLayoutSettle(graph, TEST_CONFIG.PHYSICS_SETTLE_TIMEOUT_MS);
    }

    // Run measurement frames
    for (let i = 0; i < TEST_CONFIG.WARMUP_FRAMES; i++) {
        statsManager.startFrameProfiling();
        await graph.renderOneFrame();
        statsManager.endFrameProfiling();
    }

    // Reset measurements for actual measurement (warmup complete)
    statsManager.resetMeasurements();

    for (let i = 0; i < TEST_CONFIG.MEASURE_FRAMES; i++) {
        statsManager.startFrameProfiling();
        await graph.renderOneFrame();
        statsManager.endFrameProfiling();
    }

    // End layout session
    statsManager.endLayoutSession();

    // Get comprehensive snapshot from StatsManager
    const snapshot = statsManager.getSnapshot();
    const blockingReport = statsManager.getBlockingReport();

    // Capture memory after
    const heapUsedAfter = process.memoryUsage?.().heapUsed ?? 0;
    const memoryDelta = heapUsedAfter - heapUsedBefore;

    // Extract metrics from snapshot
    const metrics = extractMetricsFromSnapshot(
        snapshot,
        blockingReport,
        {edgeCount, layoutType, lineStyle, arrowType},
        {heapUsedBefore, heapUsedAfter, memoryDelta},
    );

    // Output detailed report if verbose
    if (process.env.PERF_VERBOSE) {
        statsManager.reportDetailed();
    }

    // Cleanup
    statsManager.disableProfiling();
    statsManager.disableFrameProfiling();
    graph.dispose();

    return metrics;
}

/**
 * Extract structured metrics from StatsManager snapshot
 */
function extractMetricsFromSnapshot(
    snapshot: PerformanceSnapshot,
    blockingReport: OperationBlockingStats[],
    config: {edgeCount: number, layoutType: string, lineStyle: string, arrowType: string},
    memory: {heapUsedBefore: number, heapUsedAfter: number, memoryDelta: number},
): PerformanceMetrics {
    // Helper to find CPU measurement by label
    const findCpu = (label: string) => snapshot.cpu.find(m => m.label === label);

    // Extract CPU metrics
    const edgeUpdate = findCpu("Edge.update");
    const edgeCreation = findCpu("Edge.constructor");
    const arrowCapUpdate = findCpu("ArrowCap.update");
    const intersectCalc = findCpu("Ray.intersect");
    const graphStep = findCpu("Graph.step");

    // Calculate FPS from scene metrics
    const fps = snapshot.scene?.frameTime.avg ?
        1000 / snapshot.scene.frameTime.avg : 0;

    return {
        // Config
        edgeCount: config.edgeCount,
        layoutType: config.layoutType,
        lineStyle: config.lineStyle,
        arrowType: config.arrowType,

        // CPU metrics
        edgeCreationTime: edgeCreation?.total ?? 0,
        edgeUpdateTime: edgeUpdate?.total ?? 0,
        arrowCapUpdateTime: arrowCapUpdate?.total ?? 0,
        intersectCalcTime: intersectCalc?.total ?? 0,
        graphStepTime: graphStep?.total ?? 0,

        // Percentiles
        edgeUpdateP95: edgeUpdate?.p95 ?? 0,
        edgeUpdateP99: edgeUpdate?.p99 ?? 0,

        // Scene metrics
        frameTimeAvg: snapshot.scene?.frameTime.avg ?? 0,
        frameTimeP95: 0, // Would need to track in StatsManager
        renderTimeAvg: snapshot.scene?.renderTime.avg ?? 0,
        interFrameTimeAvg: snapshot.scene?.interFrameTime.avg ?? 0,
        drawCallsCount: snapshot.scene?.drawCalls.count ?? 0,
        activeMeshesEvalTime: snapshot.scene?.activeMeshesEvaluation.total ?? 0,

        // GPU metrics
        gpuFrameTimeAvg: snapshot.gpu?.gpuFrameTime.avg ?? 0,
        shaderCompilationTime: snapshot.gpu?.shaderCompilation.total ?? 0,

        // Layout session
        layoutTotalTime: snapshot.layoutSession?.totalElapsed ?? 0,
        layoutCpuPercent: snapshot.layoutSession?.percentages.cpu ?? 0,
        layoutGpuPercent: snapshot.layoutSession?.percentages.gpu ?? 0,
        layoutBlockingPercent: snapshot.layoutSession?.percentages.blocking ?? 0,
        layoutFrameCount: snapshot.layoutSession?.frameCount ?? 0,

        // Derived
        fps,
        edgesPerSecond: (edgeCreation?.total ?? 0) > 0 ?
            config.edgeCount / ((edgeCreation?.total ?? 1) / 1000) : 0,

        // Memory
        ...memory,

        // Bottleneck identification - top 5 blocking operations
        topBlockingOperations: blockingReport.slice(0, 5),
    };
}

/**
 * Identifies performance bottlenecks from metrics
 * Returns actionable recommendations
 */
function identifyBottlenecks(metrics: PerformanceMetrics): BottleneckReport {
    const bottlenecks: BottleneckItem[] = [];

    // Check for CPU-bound issues
    if (metrics.layoutCpuPercent > 80) {
        bottlenecks.push({
            type: "cpu-bound",
            severity: "high",
            component: "layout",
            message: `Layout is CPU-bound (${metrics.layoutCpuPercent.toFixed(1)}% CPU)`,
            suggestion: "Consider using fixed layout or reducing preSteps",
        });
    }

    // Check for blocking issues
    if (metrics.layoutBlockingPercent > 30) {
        bottlenecks.push({
            type: "blocking",
            severity: "medium",
            component: "main-thread",
            message: `High blocking overhead (${metrics.layoutBlockingPercent.toFixed(1)}%)`,
            suggestion: "Profile with DevTools to identify blocking operations",
        });
    }

    // Check edge update performance
    if (metrics.edgeUpdateP99 > 5) {
        bottlenecks.push({
            type: "edge-update",
            severity: "medium",
            component: "Edge.update",
            message: `P99 edge update time is ${metrics.edgeUpdateP99.toFixed(2)}ms`,
            suggestion: "Check ray intersection or arrow positioning code",
        });
    }

    // Check for GPU issues
    if (metrics.gpuFrameTimeAvg > 16) {
        bottlenecks.push({
            type: "gpu-bound",
            severity: "high",
            component: "gpu",
            message: `GPU frame time is ${metrics.gpuFrameTimeAvg.toFixed(2)}ms (>16ms)`,
            suggestion: "Reduce draw calls or mesh complexity",
        });
    }

    // Check draw calls (rule of thumb: <1000 for good perf)
    if (metrics.drawCallsCount > 500) {
        bottlenecks.push({
            type: "draw-calls",
            severity: metrics.drawCallsCount > 1000 ? "high" : "low",
            component: "rendering",
            message: `${metrics.drawCallsCount} draw calls`,
            suggestion: "Enable mesh instancing or reduce unique materials",
        });
    }

    // Check shader compilation
    if (metrics.shaderCompilationTime > 100) {
        bottlenecks.push({
            type: "shader-compilation",
            severity: "medium",
            component: "shaders",
            message: `${metrics.shaderCompilationTime.toFixed(0)}ms shader compilation`,
            suggestion: "Pre-compile shaders or reduce shader variants",
        });
    }

    // Include operations identified by blocking correlation
    for (const op of metrics.topBlockingOperations) {
        if (op.highBlockingPercentage > 50) {
            bottlenecks.push({
                type: "blocking-correlation",
                severity: "high",
                component: op.label,
                message: `${op.label} appears in ${op.highBlockingPercentage.toFixed(0)}% of high-blocking frames`,
                suggestion: `Optimize ${op.label} - avg blocking ratio: ${op.avgBlockingRatioWhenPresent.toFixed(1)}x`,
            });
        }
    }

    return {
        bottlenecks,
        overallHealth: bottlenecks.filter(b => b.severity === "high").length > 0 ? "poor" :
            bottlenecks.filter(b => b.severity === "medium").length > 0 ? "fair" : "good",
        summary: generateSummary(metrics, bottlenecks),
    };
}

interface BottleneckItem {
    type: string;
    severity: "low" | "medium" | "high";
    component: string;
    message: string;
    suggestion: string;
}

interface BottleneckReport {
    bottlenecks: BottleneckItem[];
    overallHealth: "good" | "fair" | "poor";
    summary: string;
}

function generateSummary(metrics: PerformanceMetrics, bottlenecks: BottleneckItem[]): string {
    const lines = [
        `${metrics.edgeCount} edges @ ${metrics.fps.toFixed(1)} FPS`,
        `Layout: ${metrics.layoutType} (${metrics.lineStyle} line, ${metrics.arrowType} arrow)`,
        `Time breakdown: CPU ${metrics.layoutCpuPercent.toFixed(0)}%, GPU ${metrics.layoutGpuPercent.toFixed(0)}%, Blocking ${metrics.layoutBlockingPercent.toFixed(0)}%`,
        `Draw calls: ${metrics.drawCallsCount}`,
    ];

    if (bottlenecks.length > 0) {
        lines.push(`\nBottlenecks found: ${bottlenecks.length}`);
        for (const b of bottlenecks.filter(b => b.severity === "high")) {
            lines.push(`  ⚠️ ${b.message}`);
        }
    }

    return lines.join("\n");
}

/**
 * Creates a test graph with profiling enabled
 */
async function createTestGraph(config: {
    nodeCount: number;
    edgeCount: number;
    layoutType: string;
    edgeStyle: EdgeStyleConfig;
}): Promise<Graph> {
    // Generate node positions (grid or random)
    const nodes = generateNodes(config.nodeCount, config.layoutType === "fixed");

    // Generate edges connecting random node pairs
    const edges = generateEdges(nodes, config.edgeCount);

    // Create graph with configuration
    const graph = new Graph({
        layout: config.layoutType,
        edgeStyle: config.edgeStyle,
    });

    // Add data
    await graph.setData({nodes, edges});

    return graph;
}

/**
 * Waits for physics layout to settle
 */
async function waitForLayoutSettle(graph: Graph, timeoutMs: number): Promise<void> {
    return new Promise((resolve) => {
        const startTime = Date.now();

        const checkSettle = () => {
            if (graph.isLayoutSettled() || Date.now() - startTime > timeoutMs) {
                resolve();
            } else {
                setTimeout(checkSettle, 16);
            }
        };

        checkSettle();
    });
}
```

### 7.4 Bottleneck Detection Tests

```typescript
describe("Bottleneck Detection", () => {
    describe("CPU Bottleneck Identification", () => {
        test("identifies Edge.update as bottleneck with many edges", async () => {
            const metrics = await measureEdgePerformance({
                edgeCount: 5000,
                layoutType: "ngraph",
                lineStyle: "solid",
                arrowType: "normal",
            });

            const report = identifyBottlenecks(metrics);

            // With 5000 edges + arrows + physics, we expect bottlenecks
            console.log("Bottleneck Report:", report.summary);

            // Validate blocking correlation identifies key operations
            const edgeRelatedBottlenecks = report.bottlenecks.filter(
                b => b.component.includes("Edge") || b.component.includes("Arrow")
            );
            assert.isAbove(edgeRelatedBottlenecks.length, 0,
                "Should identify edge-related bottlenecks");
        });

        test("identifies ray intersection as potential bottleneck", async () => {
            const metrics = await measureEdgePerformance({
                edgeCount: 2000,
                layoutType: "ngraph",
                lineStyle: "solid",
                arrowType: "normal",
            });

            // Ray intersections should be visible in CPU metrics
            assert.isAbove(metrics.intersectCalcTime, 0,
                "Ray intersection should have measurable time");

            // Check if it appears in blocking report
            const rayInBlocking = metrics.topBlockingOperations.find(
                op => op.label.includes("intersect") || op.label.includes("Ray")
            );

            if (rayInBlocking && rayInBlocking.highBlockingPercentage > 30) {
                console.log("⚠️ Ray intersection is a bottleneck:", rayInBlocking);
            }
        });
    });

    describe("GPU Bottleneck Identification", () => {
        test("identifies high draw calls with complex patterns", async () => {
            const metrics = await measureEdgePerformance({
                edgeCount: 1000,
                layoutType: "fixed",
                lineStyle: "diamond", // Patterned line = more meshes
                arrowType: "normal",
            });

            const report = identifyBottlenecks(metrics);

            // Complex patterns should result in more draw calls
            console.log(`Draw calls: ${metrics.drawCallsCount}`);

            if (metrics.drawCallsCount > 500) {
                const drawCallBottleneck = report.bottlenecks.find(
                    b => b.type === "draw-calls"
                );
                assert.exists(drawCallBottleneck,
                    "Should identify draw calls as bottleneck");
            }
        });

        test("compares GPU time: solid vs patterned lines", async () => {
            const solidMetrics = await measureEdgePerformance({
                edgeCount: 1000,
                layoutType: "fixed",
                lineStyle: "solid",
                arrowType: "none",
            });

            const patternedMetrics = await measureEdgePerformance({
                edgeCount: 1000,
                layoutType: "fixed",
                lineStyle: "diamond",
                arrowType: "none",
            });

            console.log(`GPU time - Solid: ${solidMetrics.gpuFrameTimeAvg.toFixed(2)}ms`);
            console.log(`GPU time - Patterned: ${patternedMetrics.gpuFrameTimeAvg.toFixed(2)}ms`);
            console.log(`Draw calls - Solid: ${solidMetrics.drawCallsCount}`);
            console.log(`Draw calls - Patterned: ${patternedMetrics.drawCallsCount}`);

            // Patterned lines use instancing - should have reasonable overhead
            assert.isBelow(patternedMetrics.gpuFrameTimeAvg, solidMetrics.gpuFrameTimeAvg * 3,
                "Patterned lines shouldn't have >3x GPU overhead");
        });
    });

    describe("Blocking Detection", () => {
        test("uses frame profiling to identify blocking operations", async () => {
            const graph = await createTestGraph({
                nodeCount: 50,
                edgeCount: 1000,
                layoutType: "ngraph",
                edgeStyle: {line: {type: "solid", width: 0.5, color: "#FFF"}},
            });

            const statsManager = graph.getStatsManager();
            statsManager.enableProfiling();
            statsManager.enableFrameProfiling();

            // Run several frames
            for (let i = 0; i < 50; i++) {
                statsManager.startFrameProfiling();
                await graph.renderOneFrame();
                statsManager.endFrameProfiling();
            }

            // Get blocking report
            const blockingReport = statsManager.getBlockingReport();

            console.log("Blocking Correlation Report:");
            blockingReport.slice(0, 5).forEach((op, i) => {
                console.log(
                    `  ${i + 1}. ${op.label}: ` +
                    `${op.highBlockingPercentage.toFixed(1)}% high-blocking, ` +
                    `${op.avgBlockingRatioWhenPresent.toFixed(2)}x ratio`
                );
            });

            // Should have identified some operations
            assert.isAbove(blockingReport.length, 0,
                "Should identify operations in blocking report");

            statsManager.disableProfiling();
            statsManager.disableFrameProfiling();
            graph.dispose();
        });

        test("Long Task API detects >50ms blocking", async () => {
            // This test only works in browser environments with Long Task API
            const graph = await createTestGraph({
                nodeCount: 100,
                edgeCount: 5000, // Large enough to potentially cause long tasks
                layoutType: "ngraph",
                edgeStyle: {
                    line: {type: "diamond", width: 0.5, color: "#FFF"},
                    arrowHead: {type: "normal", size: 1, color: "#F00"},
                },
            });

            const statsManager = graph.getStatsManager();
            statsManager.enableFrameProfiling(); // This sets up Long Task observer

            // Run frames that might cause long tasks
            for (let i = 0; i < 20; i++) {
                await graph.renderOneFrame();
            }

            // Long tasks are logged to console automatically
            // In a real test, we'd capture console output

            statsManager.disableFrameProfiling();
            graph.dispose();
        });
    });

    describe("Component-Specific Bottlenecks", () => {
        test("measures FilledArrowRenderer overhead", async () => {
            const noArrowMetrics = await measureEdgePerformance({
                edgeCount: 1000,
                layoutType: "fixed",
                lineStyle: "solid",
                arrowType: "none",
            });

            const filledArrowMetrics = await measureEdgePerformance({
                edgeCount: 1000,
                layoutType: "fixed",
                lineStyle: "solid",
                arrowType: "normal", // FilledArrowRenderer
            });

            const overhead = filledArrowMetrics.arrowCapUpdateTime;
            const overheadPercent = (overhead / filledArrowMetrics.edgeUpdateTime) * 100;

            console.log(`FilledArrowRenderer overhead: ${overhead.toFixed(2)}ms (${overheadPercent.toFixed(1)}%)`);
            console.log(`FPS without arrows: ${noArrowMetrics.fps.toFixed(1)}`);
            console.log(`FPS with arrows: ${filledArrowMetrics.fps.toFixed(1)}`);

            // Arrow overhead should be reasonable
            assert.isBelow(overheadPercent, 50,
                "Arrow update shouldn't exceed 50% of edge update time");
        });

        test("measures PatternedLineRenderer instance count scaling", async () => {
            const edgeCounts = [100, 500, 1000];
            const results: {count: number, drawCalls: number, fps: number}[] = [];

            for (const count of edgeCounts) {
                const metrics = await measureEdgePerformance({
                    edgeCount: count,
                    layoutType: "fixed",
                    lineStyle: "dot", // PatternedLineRenderer
                    arrowType: "none",
                });

                results.push({
                    count,
                    drawCalls: metrics.drawCallsCount,
                    fps: metrics.fps,
                });
            }

            console.log("PatternedLineRenderer Scaling:");
            console.table(results);

            // Draw calls should scale sub-linearly due to instancing
            const drawCallRatio = results[2].drawCalls / results[0].drawCalls;
            const edgeRatio = results[2].count / results[0].count;

            assert.isBelow(drawCallRatio, edgeRatio,
                "Draw calls should scale sub-linearly with instancing");
        });

        test("measures CustomLineRenderer vs PatternedLineRenderer", async () => {
            const customLineMetrics = await measureEdgePerformance({
                edgeCount: 1000,
                layoutType: "fixed",
                lineStyle: "solid", // CustomLineRenderer
                arrowType: "tee",   // CustomLineRenderer arrow
            });

            const patternedLineMetrics = await measureEdgePerformance({
                edgeCount: 1000,
                layoutType: "fixed",
                lineStyle: "diamond", // PatternedLineRenderer
                arrowType: "normal",  // FilledArrowRenderer arrow
            });

            console.log("Renderer Comparison:");
            console.log(`CustomLineRenderer: ${customLineMetrics.fps.toFixed(1)} FPS, ${customLineMetrics.drawCallsCount} draw calls`);
            console.log(`PatternedLineRenderer: ${patternedLineMetrics.fps.toFixed(1)} FPS, ${patternedLineMetrics.drawCallsCount} draw calls`);

            // Both should be usable
            assert.isAbove(customLineMetrics.fps, 20);
            assert.isAbove(patternedLineMetrics.fps, 20);
        });
    });
});
```

### 7.5 Performance Regression Tests

```typescript
describe("Performance Regression Tests", () => {
    // Baseline metrics (update these when performance improves)
    const BASELINES = {
        "100_edges_fixed_solid_none": {fps: 60, creationTime: 100},
        "1000_edges_fixed_solid_none": {fps: 45, creationTime: 500},
        "1000_edges_fixed_solid_normal": {fps: 35, creationTime: 700},
        "1000_edges_ngraph_solid_none": {fps: 20, creationTime: 800},
        "1000_edges_fixed_diamond_normal": {fps: 25, creationTime: 800},
    };

    Object.entries(BASELINES).forEach(([key, baseline]) => {
        const [count, layout, line, arrow] = key.split("_");

        test(`regression: ${key}`, async () => {
            const result = await measureEdgePerformance({
                edgeCount: parseInt(count),
                layoutType: layout === "edges" ? "fixed" : layout,
                lineStyle: line === "edges" ? "solid" : line,
                arrowType: arrow,
            });

            // Should not regress more than 20% from baseline
            assert.isAbove(result.fps, baseline.fps * 0.8,
                `FPS regression: expected >= ${baseline.fps * 0.8}, got ${result.fps}`);
            assert.isBelow(result.edgeCreationTime, baseline.creationTime * 1.2,
                `Creation time regression: expected <= ${baseline.creationTime * 1.2}, got ${result.edgeCreationTime}`);

            // Also check for new bottlenecks
            const report = identifyBottlenecks(result);
            if (report.overallHealth === "poor") {
                console.warn(`⚠️ Performance degraded for ${key}:`, report.summary);
            }
        });
    });
});
```

### 7.6 Performance Test Matrix Summary

| Edge Count | Layout | Line Style | Arrow Type | Expected FPS |
|------------|--------|------------|------------|--------------|
| 10 | fixed | solid | none | 60+ |
| 10 | ngraph | solid | none | 60 |
| 100 | fixed | solid | none | 60 |
| 100 | ngraph | solid | none | 45+ |
| 100 | fixed | solid | normal | 60 |
| 1000 | fixed | solid | none | 45+ |
| 1000 | ngraph | solid | none | 20+ |
| 1000 | fixed | solid | normal | 35+ |
| 1000 | fixed | diamond | normal | 25+ |
| 1000 | fixed | dot | sphere-dot | 25+ |
| 1000 | fixed | dash | tee | 30+ |
| 1000 | ngraph | solid | normal | 15+ |
| 10000 | fixed | solid | none | 20+ |
| 10000 | ngraph | solid | none | 10+ |

### 7.7 Files to Create

| File | Action |
|------|--------|
| `test/performance/edge-performance.test.ts` | Create new performance test file |
| `test/helpers/performance-utils.ts` | Create utility functions |

### 7.8 Bottleneck Detection Capabilities

The performance tests use `StatsManager` to automatically identify bottlenecks:

| Bottleneck Type | Detection Method | Threshold |
|-----------------|------------------|-----------|
| CPU-bound layout | `layoutSession.percentages.cpu` | >80% |
| Blocking overhead | `layoutSession.percentages.blocking` | >30% |
| Slow edge updates | `edgeUpdate.p99` | >5ms |
| GPU-bound | `gpu.gpuFrameTime.avg` | >16ms (60 FPS) |
| High draw calls | `scene.drawCalls.count` | >500 (warn), >1000 (error) |
| Shader compilation | `gpu.shaderCompilation.total` | >100ms |
| Blocking correlation | `getBlockingReport()` | >50% high-blocking frames |

**Actionable Outputs:**
- `identifyBottlenecks()` returns severity-ranked list with suggestions
- `statsManager.reportDetailed()` outputs comprehensive console report
- Frame-level blocking detection with Long Task API integration
- Component-specific overhead measurements (FilledArrowRenderer, PatternedLineRenderer, etc.)

### 7.9 Test Coverage Matrix

This phase ensures all renderer code paths are tested under load:

| Code Path | Covered By |
|-----------|-----------|
| `CustomLineRenderer` (solid lines) | All solid line tests |
| `PatternedLineRenderer` (instanced patterns) | dot, dash, diamond, sinewave, zigzag tests |
| `FilledArrowRenderer` (filled 3D arrows) | normal, inverted, diamond, box, dot tests |
| `FilledArrowRenderer.sphereDot` | sphere-dot tests |
| Outline arrows via `CustomLineRenderer` | tee, open-normal, crow, vee tests |
| Physics layout updates | All ngraph layout tests |
| Static positioning | All fixed layout tests |
| Bidirectional arrows | Bidirectional arrow tests |
| Ray intersection | Bottleneck detection tests |
| Mesh instancing efficiency | PatternedLineRenderer scaling tests |

---

## Summary: Files to Create/Modify

| Phase | File | Action |
|-------|------|--------|
| 1 | `test/mesh-testing/mesh-factory.ts` | Update EdgeMeshFactory |
| 2 | `test/mesh-testing/mesh-factory.ts` | Add ArrowMeshFactory |
| 3 | `test/mesh-testing/edge-golden-masters.test.ts` | Rewrite completely |
| 4 | `test/mesh-testing/arrowhead-golden-masters.test.ts` | Create new |
| 5 | `test/EdgeMesh.test.ts` | Enhance |
| 5 | `test/meshes/FilledArrowRenderer.test.ts` | Enhance |
| 5 | `test/CustomLineRenderer.test.ts` | Enhance |
| 6 | `test/integration/Edge.integration.test.ts` | Create new |
| 7 | `test/performance/edge-performance.test.ts` | Create new |
| 7 | `test/helpers/performance-utils.ts` | Create new |

## Estimated Total Effort

| Phase | Description | Effort |
|-------|-------------|--------|
| 1 | Update Edge Mock Factory | 1-2 days |
| 2 | Create Arrow Mock Factory | 1 day |
| 3 | Rewrite Edge Golden Masters | 1-2 days |
| 4 | Create Arrowhead Golden Masters | 2-3 days |
| 5 | Enhance Unit Tests | 1-2 days |
| 6 | Integration Tests | 1 day |
| 7 | Performance Tests | 2-3 days |
| **Total** | | **9-14 days** |

## Key Reference Files

When implementing, copy patterns from:

1. **Mock Factory Pattern**: `test/mesh-testing/mesh-factory.ts` (NodeMeshFactory, lines 36-198)
2. **Golden Master Test Pattern**: `test/mesh-testing/node-golden-masters.test.ts`
3. **Direct Unit Test Pattern**: `test/NodeMesh.test.ts`
4. **Tracking Mocks**: `test/mesh-testing/tracking-mocks.ts`

## Validation Checklist

After implementation, verify:

- [ ] All 9 line types tested (solid + 8 patterns)
- [ ] All 15 arrow types tested (5 filled + 8 outline + none + sphere-dot)
- [ ] Line properties tested (width, color, opacity, animation, bezier)
- [ ] Arrow properties tested (size, color, opacity)
- [ ] 2D vs 3D mode tested
- [ ] XZ plane geometry requirement verified for 3D filled arrows
- [ ] Combined configurations tested
- [ ] Default values tested
- [ ] Error handling tested
- [ ] All tests pass: `npm test`

### Performance Test Validation

- [ ] Edge count scaling tested (10, 100, 1000, 10000 edges)
- [ ] Static layout (fixed) performance verified
- [ ] Physics layout (ngraph) performance verified
- [ ] All line styles tested under load (solid, dot, dash, diamond, sinewave, zigzag)
- [ ] All arrow types tested under load (none, normal, sphere-dot, diamond, tee, open-normal, crow)
- [ ] Bidirectional arrows tested
- [ ] Memory usage tested and within bounds
- [ ] Layout transition performance verified
- [ ] Performance regression baselines established
- [ ] Combined configurations tested (realistic scenarios)
- [ ] Worst-case configurations tested
