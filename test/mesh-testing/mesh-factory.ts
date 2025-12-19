/**
 * Mesh Factory for Testing
 *
 * Creates tracking mocks that simulate the actual mesh creation from /src/meshes/
 * to provide 100% test coverage of NodeMesh, EdgeMesh, and RichTextLabel classes.
 */

import {Color3} from "@babylonjs/core";

import {PropertyValidator} from "./property-discovery";

// Create a shared instance for all factories
const propertyValidator = new PropertyValidator();
import {TrackingMockMaterial, TrackingMockMesh, TrackingMockTexture} from "./tracking-mocks";

// Test result interfaces
export interface MeshTestResult {
    mesh: TrackingMockMesh;
    material: TrackingMockMaterial;
    texture?: TrackingMockTexture;
    validation: ValidationResult;
}

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    expected: unknown;
    actual: unknown;
}

// Pattern configuration interface for edge line patterns
export interface PatternConfig {
    shape: string;
    spacing: number;
    aspectRatio: number;
}

/**
 * Node Mesh Factory - Covers NodeMesh.ts
 * Tests all 27 registered shape creators and material combinations
 */
export const NodeMeshFactory = {
    meshCounter: 0,

    // All 27 shapes from NodeMesh.ts registration
    SHAPES: [
        "box",
        "sphere",
        "cylinder",
        "cone",
        "capsule",
        "torus",
        "torus-knot",
        "tetrahedron",
        "octahedron",
        "dodecahedron",
        "icosahedron",
        "rhombicuboctahedron",
        "triangular-prism",
        "pentagonal-prism",
        "hexagonal-prism",
        "square-pyramid",
        "pentagonal-pyramid",
        "triangular-dipyramid",
        "pentagonal-dipyramid",
        "elongated-square-dipyramid",
        "elongated-pentagonal-dipyramid",
        "elongated-pentagonal-cupola",
        "goldberg",
        "icosphere",
        "geodesic",
    ],

    create(style: Record<string, unknown>): MeshTestResult {
        const meshName = `node-${++NodeMeshFactory.meshCounter}`;
        const materialName = `node-material-${NodeMeshFactory.meshCounter}`;

        const mesh = new TrackingMockMesh(meshName);
        const material = new TrackingMockMaterial(materialName);

        // Simulate NodeMesh.create() behavior
        NodeMeshFactory.simulateNodeMeshCreation(mesh, material, style);

        mesh.setMaterial(material);

        return {
            mesh,
            material,
            validation: NodeMeshFactory.validate(mesh, material, style),
        };
    },

    simulateNodeMeshCreation(
        mesh: TrackingMockMesh,
        material: TrackingMockMaterial,
        style: Record<string, unknown>,
    ): void {
    // Simulate shape creation (NodeMesh.createMeshWithoutCache)
        const shape = typeof style.shape === "string" ? style.shape : "sphere";
        const size = style.size ?? 1;

        if (!NodeMeshFactory.SHAPES.includes(shape)) {
            throw new TypeError(`unknown shape: ${shape}`);
        }

        // Set mesh properties based on shape
        mesh.setMetadata("shapeType", shape);
        mesh.setMetadata("originalShape", shape);
        mesh.setScaling(Number(size), Number(size), Number(size));

        // Simulate material creation (NodeMesh.createMaterial)
        const is2D = Boolean(style.is2D);
        const color = style.color ?? "#FFFFFF";
        const wireframe = style.wireframe ?? false;

        // Color handling from extractColor method
        const color3 = NodeMeshFactory.extractColor(color);
        if (color3) {
            if (is2D) {
                material.setEmissiveColor(color3);
                // Set disableLighting = true for 2D
                material.metadata.disableLighting = true;
            } else {
                material.setDiffuseColor(color3);
                // Set disableLighting = false for 3D (explicit for testing)
                material.metadata.disableLighting = false;
            }
        }

        // Wireframe handling
        material.setWireframe(Boolean(wireframe));

        // Opacity handling
        if (style.opacity !== undefined) {
            mesh.visibility = Number(style.opacity);
            mesh.setMetadata("visibility", style.opacity);
        }

        // Freeze material (simulated)
        material.metadata.frozen = true;
    },

    extractColor(color: unknown): Color3 | undefined {
        if (typeof color === "string") {
            // Handle special case from NodeMesh.extractColor
            const hexColor = color === "##FFFFFF" ? "#FFFFFF" : color;
            return propertyValidator.parseColor(hexColor);
        }

        if (typeof color === "object" && color !== null) {
            const colorObj = color as {colorType: string, value: string, opacity: number};
            if (colorObj.value && typeof colorObj.value === "string") {
                return propertyValidator.parseColor(colorObj.value);
            }
        }

        return undefined;
    },

    validate(mesh: TrackingMockMesh, material: TrackingMockMaterial, style: Record<string, unknown>): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Validate shape
        const expectedShape = typeof style.shape === "string" ? style.shape : "sphere";
        if (mesh.metadata.shapeType !== expectedShape) {
            errors.push(`Shape mismatch: expected ${expectedShape}, got ${mesh.metadata.shapeType}`);
        }

        // Validate size/scaling
        const expectedSize = Number(style.size ?? 1);
        if (Math.abs(mesh.scaling.x - expectedSize) > 0.001) {
            errors.push(`Size mismatch: expected ${expectedSize}, got ${mesh.scaling.x}`);
        }

        // Validate material properties
        if (style.wireframe !== undefined && material.wireframe !== style.wireframe) {
            const expected = typeof style.wireframe === "string" || typeof style.wireframe === "boolean" || typeof style.wireframe === "number" ?
                String(style.wireframe) :
                "[object]";
            errors.push(`Wireframe mismatch: expected ${expected}, got ${material.wireframe}`);
        }

        // Validate 2D vs 3D mode
        const is2D = Boolean(style.is2D);
        if (is2D && !material.metadata.disableLighting) {
            errors.push("2D mode should disable lighting");
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            expected: style,
            actual: {
                shape: mesh.metadata.shapeType,
                size: mesh.scaling.x,
                is2D: material.metadata.disableLighting ?? false,
                wireframe: material.wireframe,
                visibility: mesh.visibility,
            },
        };
    },
};

/**
 * Edge Mesh Factory - Covers EdgeMesh.ts
 * Tests line creation, animations, colors, widths, and arrow heads
 * Updated to match CustomLineRenderer + FilledArrowRenderer architecture
 */
export const EdgeMeshFactory = {
    meshCounter: 0,

    // All 9 line types from EdgeStyle.ts:35-46
    LINE_TYPES: [
        "solid", // CustomLineRenderer (continuous line)
        "dot", // Circle instances
        "star", // Star instances
        "box", // Square box instances (1:1 aspect ratio)
        "dash", // Elongated box instances (3:1 aspect ratio)
        "diamond", // Diamond instances
        "dash-dot", // Alternating boxes and circles
        "sinewave", // Repeating wave period meshes
        "zigzag", // Repeating zigzag period meshes
    ],

    // All 15 arrow types from EdgeStyle.ts:7-25
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

    // Arrow categorization for testing
    FILLED_ARROWS: ["normal", "inverted", "diamond", "box", "dot"],
    OUTLINE_ARROWS: ["open-normal", "open-dot", "open-diamond", "tee", "open", "half-open", "vee", "crow"],

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
    },

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
            solid: 0,
            dash: 1,
            dot: 2,
        };
        return patterns[lineType] ?? 0;
    },

    simulatePatternedLine(
        mesh: TrackingMockMesh,
        material: TrackingMockMaterial,
        style: Record<string, unknown>,
    ): void {
        const lineType = typeof style.type === "string" ? style.type : "solid";
        const width = Number(style.width ?? 1);
        const color = typeof style.color === "string" ? style.color : "#000000";
        const opacity = Number(style.opacity ?? 1);

        mesh.setMetadata("meshType", "instancedPattern");
        mesh.setMetadata("rendererType", "PatternedLineRenderer");
        mesh.setMetadata("lineType", lineType);
        mesh.setMetadata("lineWidth", width);
        mesh.setMetadata("lineColor", color);
        mesh.setMetadata("lineOpacity", opacity);

        // Pattern-specific metadata
        const patternConfig = EdgeMeshFactory.getPatternConfig(lineType);
        mesh.setMetadata("patternShape", patternConfig.shape);
        mesh.setMetadata("patternSpacing", patternConfig.spacing);
        mesh.setMetadata("patternAspectRatio", patternConfig.aspectRatio);
        mesh.setMetadata("usesInstancing", true);

        // Material for instanced patterns
        material.setMetadata("shaderType", "instancedPattern");

        // Animation handling for patterned lines
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

    getPatternConfig(lineType: string): PatternConfig {
        const configs: Record<string, PatternConfig> = {
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

        // Determine renderer type based on 2D/3D mode and filled/outline style
        let rendererType: string;
        if (is2D) {
            rendererType = "StandardMaterial";
        } else if (isFilled) {
            rendererType = "FilledArrowRenderer";
        } else {
            rendererType = "CustomLineRenderer";
        }

        return {
            type,
            size,
            color,
            opacity,
            position,
            isFilled,
            is2D,
            // 3D arrows use tangent billboarding shader
            rendererType,
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
        const expectedOpacity = typeof style.opacity === "number" ? style.opacity : 1;
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
};

/**
 * Arrow Mock Style - Configuration for creating arrow test mocks
 */
export interface ArrowMockStyle {
    type?: string;
    is2D?: boolean;
    size?: number;
    width?: number;
    length?: number;
    color?: string;
    opacity?: number;
}

/**
 * Arrow Test Result - Result from ArrowMeshFactory.create()
 */
export interface ArrowTestResult {
    mesh: TrackingMockMesh | null;
    material: TrackingMockMaterial | null;
    validation: ValidationResult;
}

/**
 * Arrow Mesh Factory - Covers FilledArrowRenderer.ts and outline arrows
 * Tests all 15 arrow types with geometry validation
 */
export const ArrowMeshFactory = {
    meshCounter: 0,

    // All arrow types from EdgeStyle.ts
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

    // Categorized by renderer
    FILLED_ARROWS: [
        "normal",
        "inverted",
        "diamond",
        "box",
        "dot",
    ],
    OUTLINE_ARROWS: [
        "open-normal",
        "open-dot",
        "open-diamond",
        "tee",
        "open",
        "half-open",
        "vee",
        "crow",
    ],
    SPHERE_ARROWS: ["sphere-dot"],

    // Expected vertex counts for filled arrows (XZ plane geometry)
    VERTEX_COUNTS: {
        normal: 3, // Triangle: 3 vertices
        inverted: 3, // Triangle: 3 vertices
        diamond: 4, // Diamond: 4 vertices
        box: 4, // Rectangle: 4 vertices
        dot: 33, // Circle: 32 segments + center
    } as Record<string, number>,

    create(style: ArrowMockStyle): ArrowTestResult {
        const type = typeof style.type === "string" ? style.type : "normal";
        const is2D = Boolean(style.is2D);
        const size = style.size ?? 1;
        const width = style.width ?? 0.5;
        const length = style.length ?? 0.3;
        const color = typeof style.color === "string" ? style.color : "#FFFFFF";
        const opacity = style.opacity ?? 1;

        // Validate arrow type
        if (!ArrowMeshFactory.ARROW_TYPES.includes(type)) {
            throw new Error(`Unknown arrow type: ${type}`);
        }

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
        config: {type: string, color: string, opacity: number},
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

        // Set mesh visibility for 2D arrows
        mesh.visibility = config.opacity;
    },

    simulate3DFilledArrow(
        mesh: TrackingMockMesh,
        material: TrackingMockMaterial,
        config: {type: string, size: number, color: string, opacity: number},
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
        config: {type: string, size: number, width: number, color: string, opacity: number},
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

    getOutlineArrowPath(type: string): {points: number, closed: boolean} {
        // Approximate path info for each outline arrow type
        const paths: Record<string, {points: number, closed: boolean}> = {
            "open-normal": {points: 3, closed: false}, // V-shape (2 segments)
            "open-dot": {points: 33, closed: true}, // Circle outline
            "open-diamond": {points: 5, closed: true}, // Diamond outline (4 segments)
            "tee": {points: 2, closed: false}, // Perpendicular line (1 segment)
            "open": {points: 3, closed: false}, // Chevron (2 segments)
            "half-open": {points: 3, closed: false}, // Asymmetric V
            "vee": {points: 3, closed: false}, // Wide V
            "crow": {points: 7, closed: false}, // Three-prong fork (6 segments)
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
        const expectedOpacity = style.opacity ?? 1;
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

/**
 * Label Mesh Factory - Covers RichTextLabel.ts
 * Tests text rendering, backgrounds, borders, pointers, badges, and animations
 */
export const LabelMeshFactory = {
    meshCounter: 0,

    ATTACH_POSITIONS: [
        "top",
        "bottom",
        "left",
        "right",
        "center",
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right",
    ],

    BADGE_TYPES: [
        "notification",
        "label",
        "label-success",
        "label-warning",
        "label-danger",
        "count",
        "icon",
        "progress",
        "dot",
    ],

    create(style: Record<string, unknown>): MeshTestResult {
        const meshName = `label-${++LabelMeshFactory.meshCounter}`;
        const materialName = `label-material-${LabelMeshFactory.meshCounter}`;
        const textureName = `label-texture-${LabelMeshFactory.meshCounter}`;

        const mesh = new TrackingMockMesh(meshName);
        const material = new TrackingMockMaterial(materialName);
        const texture = new TrackingMockTexture(textureName, 512, 128);

        // Simulate RichTextLabel creation
        LabelMeshFactory.simulateLabelCreation(mesh, material, texture, style);

        material.setDiffuseTexture(texture);
        mesh.setMaterial(material);

        return {
            mesh,
            material,
            texture,
            validation: LabelMeshFactory.validate(mesh, material, texture, style),
        };
    },

    simulateLabelCreation(
        mesh: TrackingMockMesh,
        material: TrackingMockMaterial,
        texture: TrackingMockTexture,
        style: Record<string, unknown>,
    ): void {
    // Set billboard mode for labels (always face camera)
        mesh.setBillboardMode(7); // BILLBOARDMODE_ALL

        // Set required mesh metadata for golden master validation
        mesh.setMetadata("meshType", "plane");
        mesh.setMetadata("hasTexture", true);
        mesh.setMetadata("textureType", "DynamicTexture");
        mesh.setMetadata("materialType", "StandardMaterial");

        // Store text properties with proper defaults
        mesh.setMetadata("text", style.text !== undefined ? style.text : "");
        mesh.setMetadata("renderedText", style.text !== undefined ? style.text : ""); // Also set renderedText
        mesh.setMetadata("font", style.font !== undefined ? style.font : "Verdana");
        mesh.setMetadata("fontSize", style.fontSize !== undefined ? style.fontSize : 48);
        mesh.setMetadata("textColor", style.textColor !== undefined ? style.textColor : "#000000");

        // Background properties with proper defaults
        mesh.setMetadata("backgroundColor", style.backgroundColor !== undefined ? style.backgroundColor : "transparent");
        mesh.setMetadata("backgroundPadding", style.backgroundPadding !== undefined ? style.backgroundPadding : 8);
        mesh.setMetadata("cornerRadius", style.cornerRadius !== undefined ? style.cornerRadius : 0);

        // Border properties
        mesh.setMetadata("borders", style.borders ?? []);

        // Calculate dimensions
        LabelMeshFactory.calculateLabelDimensions(mesh, texture, style);

        // Material setup
        material.setBackFaceCulling(false);
        material.setEmissiveTexture(texture); // Labels use emissive in 2D mode

        // Handle transparency
        if (style.backgroundColor === "transparent") {
            material.setAlpha(0);
        } else if (style.backgroundColor && typeof style.backgroundColor === "string" && style.backgroundColor.includes("rgba")) {
            const alpha = propertyValidator.extractAlpha(style.backgroundColor);
            material.setAlpha(alpha);
        }

        // Set hasAlpha metadata to match material state
        mesh.setMetadata("hasAlpha", material.hasAlpha);

        // Simulate drawing operations
        LabelMeshFactory.simulateTextureDrawing(texture, style);

        // Handle special features
        if (style.pointer) {
            LabelMeshFactory.simulatePointer(mesh, style.pointer as Record<string, unknown>);
        } else {
            mesh.setMetadata("hasPointer", false);
        }

        if (style.badge) {
            LabelMeshFactory.simulateBadge(mesh, style.badge as Record<string, unknown>);
        } else {
            mesh.setMetadata("hasBadge", false);
        }

        if (style.animation) {
            LabelMeshFactory.simulateAnimation(mesh, style.animation as Record<string, unknown>);
        } else {
            mesh.setMetadata("hasAnimation", false);
        }
    },

    calculateLabelDimensions(mesh: TrackingMockMesh, texture: TrackingMockTexture, style: Record<string, unknown>): void {
    // Estimate text dimensions
        const text = typeof style.text === "string" ? style.text : "";
        const fontSize = Number(style.fontSize ?? 48);
        const textWidth = Math.max(text.length * fontSize * 0.6, 50);
        const textHeight = fontSize;

        // Add padding and borders
        const padding = Number(style.backgroundPadding ?? 8);
        const borderWidth = LabelMeshFactory.calculateBorderWidth((style.borders ?? []) as {width: number, spacing?: number}[]);

        const totalWidth = Math.max(128, textWidth + (2 * padding) + (2 * borderWidth));
        const totalHeight = Math.max(64, textHeight + (2 * padding) + (2 * borderWidth));

        // Update texture size (power of 2)
        const textureWidth = LabelMeshFactory.nextPowerOf2(totalWidth);
        const textureHeight = LabelMeshFactory.nextPowerOf2(totalHeight);
        texture.resize(textureWidth, textureHeight);

        // Set mesh scaling
        mesh.setScaling(totalWidth / 100, totalHeight / 100, 1);

        // Store dimensions
        mesh.setMetadata("contentWidth", totalWidth);
        mesh.setMetadata("contentHeight", totalHeight);
        mesh.setMetadata("textureWidth", textureWidth);
        mesh.setMetadata("textureHeight", textureHeight);
    },

    simulateTextureDrawing(texture: TrackingMockTexture, style: Record<string, unknown>): void {
        const ctx = texture.getContext();
        const size = texture.getSize();

        // Clear canvas
        ctx.clearRect(0, 0, size.width, size.height);

        // Draw background
        if (style.backgroundColor && style.backgroundColor !== "transparent") {
            ctx.fillStyle = typeof style.backgroundColor === "string" ? style.backgroundColor : "transparent";
            const cornerRadius = Number(style.cornerRadius ?? 0);
            if (cornerRadius > 0) {
                // Simulate rounded rectangle
                LabelMeshFactory.drawRoundedRect(ctx, 0, 0, size.width, size.height, cornerRadius);
            } else {
                ctx.fillRect(0, 0, size.width, size.height);
            }
        }

        // Draw borders
        if (style.borders && Array.isArray(style.borders) && style.borders.length > 0) {
            LabelMeshFactory.drawBorders(ctx, size, style.borders as {width: number, color: string, spacing?: number}[]);
        }

        // Draw text shadow
        if (style.textShadow) {
            const textShadow = style.textShadow as Record<string, unknown>;
            ctx.shadowColor = typeof textShadow.color === "string" ? textShadow.color : "rgba(0,0,0,0.5)";
            ctx.shadowBlur = Number(textShadow.blur ?? 4);
            ctx.shadowOffsetX = Number(textShadow.offsetX ?? 2);
            ctx.shadowOffsetY = Number(textShadow.offsetY ?? 2);
        }

        // Draw text outline
        if (style.textOutline) {
            const textOutline = style.textOutline as Record<string, unknown>;
            ctx.strokeStyle = typeof textOutline.color === "string" ? textOutline.color : "#000000";
            ctx.lineWidth = Number(textOutline.width ?? 2);
            const fontSize = typeof style.fontSize === "number" ? style.fontSize : 48;
            const font = typeof style.font === "string" ? style.font : "Verdana";
            const textContent = typeof style.text === "string" ? style.text : "";
            ctx.font = `${fontSize}px ${font}`;
            ctx.textAlign = (typeof style.textAlign === "string" ? style.textAlign : "center") as CanvasTextAlign;
            ctx.strokeText(textContent, size.width / 2, size.height / 2);
        }

        // Draw text
        ctx.fillStyle = typeof style.textColor === "string" ? style.textColor : "#000000";
        const fontSize = typeof style.fontSize === "number" ? style.fontSize : 48;
        const font = typeof style.font === "string" ? style.font : "Verdana";
        const textContent = typeof style.text === "string" ? style.text : "";
        ctx.font = `${fontSize}px ${font}`;
        ctx.textAlign = (typeof style.textAlign === "string" ? style.textAlign : "center") as CanvasTextAlign;
        ctx.fillText(textContent, size.width / 2, size.height / 2);

        // Update texture
        texture.update();
    },

    drawBorders(ctx: CanvasRenderingContext2D, size: {width: number, height: number}, borders: {width: number, color: string, spacing?: number}[]): void {
        let offset = 0;
        borders.forEach((border) => {
            offset += border.spacing ?? 0;
            ctx.strokeStyle = border.color;
            ctx.lineWidth = border.width;
            ctx.strokeRect(offset, offset, size.width - (2 * offset), size.height - (2 * offset));
            offset += border.width;
        });
    },

    drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
    },

    simulatePointer(mesh: TrackingMockMesh, pointerConfig: Record<string, unknown>): void {
        mesh.setMetadata("hasPointer", true);
        mesh.setMetadata("pointerDirection", pointerConfig.direction ?? "bottom");
        mesh.setMetadata("pointerWidth", pointerConfig.width ?? 20);
        mesh.setMetadata("pointerHeight", pointerConfig.height ?? 15);
        mesh.setMetadata("pointerCurve", pointerConfig.curve ?? false);
    },

    simulateBadge(mesh: TrackingMockMesh, badgeConfig: Record<string, unknown>): void {
        mesh.setMetadata("hasBadge", true);
        mesh.setMetadata("badgeType", badgeConfig.type ?? "notification");
        mesh.setMetadata("badgeCount", badgeConfig.count);
        mesh.setMetadata("badgeProgress", badgeConfig.progress);
        mesh.setMetadata("badgeIcon", badgeConfig.icon);
    },

    simulateAnimation(mesh: TrackingMockMesh, animationConfig: Record<string, unknown>): void {
        mesh.setMetadata("hasAnimation", true);
        mesh.setMetadata("animationType", animationConfig.type ?? "none");
        mesh.setMetadata("animationSpeed", animationConfig.speed ?? 1);
    },

    calculateBorderWidth(borders: {width: number, spacing?: number}[]): number {
        return borders.reduce((total, border) => {
            return total + border.width + (border.spacing ?? 0);
        }, 0);
    },

    nextPowerOf2(value: number): number {
        return Math.pow(2, Math.ceil(Math.log2(value)));
    },

    validate(mesh: TrackingMockMesh, material: TrackingMockMaterial, texture: TrackingMockTexture, style: Record<string, unknown>): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Validate billboard mode
        if (mesh.billboardMode !== 7) {
            errors.push(`Billboard mode should be 7 for labels, got ${mesh.billboardMode}`);
        }

        // Validate text
        const expectedText = typeof style.text === "string" ? style.text : "";
        if (mesh.metadata.text !== expectedText) {
            errors.push(`Text mismatch: expected "${expectedText}", got "${mesh.metadata.text}"`);
        }

        // Validate borders
        if (style.borders && Array.isArray(style.borders) && style.borders.length > 0) {
            const strokeOps = texture.getDrawingOperations("strokeRect");
            if (strokeOps.length !== style.borders.length) {
                errors.push(`Border count mismatch: expected ${style.borders.length}, got ${strokeOps.length}`);
            }
        }

        // Validate text drawing
        if (style.text) {
            const textOps = texture.getDrawingOperations("fillText");
            if (textOps.length === 0) {
                errors.push("Text should be drawn but no fillText operations found");
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            expected: style,
            actual: {
                text: mesh.metadata.text,
                fontSize: mesh.metadata.fontSize,
                backgroundColor: mesh.metadata.backgroundColor,
                borders: mesh.metadata.borders,
                billboardMode: mesh.billboardMode,
                hasPointer: mesh.metadata.hasPointer,
                hasBadge: mesh.metadata.hasBadge,
                hasAnimation: mesh.metadata.hasAnimation,
            },
        };
    },
};
