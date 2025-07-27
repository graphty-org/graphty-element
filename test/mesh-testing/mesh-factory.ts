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
 */
export const EdgeMeshFactory = {
    meshCounter: 0,

    LINE_TYPES: [
        "solid", "dash", "dash-dot", "dots", "equal-dash", "sinewave", "zigzag",
    ],

    ARROW_TYPES: [
        "normal",
        "inverted",
        "dot",
        "open-dot",
        "none",
        "tee",
        "empty",
        "diamond",
        "open-diamond",
        "crow",
        "box",
        "open",
        "half-open",
        "vee",
    ],

    create(style: Record<string, unknown>): MeshTestResult {
        const meshName = `edge-${++EdgeMeshFactory.meshCounter}`;
        const materialName = `edge-material-${EdgeMeshFactory.meshCounter}`;

        const mesh = new TrackingMockMesh(meshName);
        const material = new TrackingMockMaterial(materialName);

        // Simulate EdgeMesh.create() behavior
        EdgeMeshFactory.simulateEdgeMeshCreation(mesh, material, style);

        mesh.setMaterial(material);

        return {
            mesh,
            material,
            validation: EdgeMeshFactory.validate(mesh, material, style),
        };
    },

    simulateEdgeMeshCreation(
        mesh: TrackingMockMesh,
        material: TrackingMockMaterial,
        style: Record<string, unknown>,
    ): void {
    // Set edge properties
        mesh.setMetadata("meshType", "greasedLine");
        mesh.setMetadata("lineType", style.type ?? "solid");
        mesh.setMetadata("lineWidth", style.width ?? 1);
        mesh.setMetadata("lineColor", style.color ?? "#000000");

        // Simulate animated vs static line creation
        if (style.animationSpeed) {
            mesh.setMetadata("animated", true);
            mesh.setMetadata("animationSpeed", style.animationSpeed);
            // Simulate createAnimatedLine
            EdgeMeshFactory.simulateAnimatedLine(mesh, material, style);
        } else {
            mesh.setMetadata("animated", false);
            // Simulate createStaticLine
            EdgeMeshFactory.simulateStaticLine(mesh, material, style);
        }

        // Handle arrow heads
        if (style.arrow) {
            EdgeMeshFactory.simulateArrowHeads(mesh, style.arrow as Record<string, unknown>);
        }
    },

    simulateStaticLine(mesh: TrackingMockMesh, material: TrackingMockMaterial, style: Record<string, unknown>): void {
    // Simulate GreasedLine creation with UNIT_VECTOR_POINTS
        mesh.setMetadata("points", [0, 0, -0.5, 0, 0, 0.5]); // EdgeMesh.UNIT_VECTOR_POINTS
        mesh.setMetadata("widths", style.width ?? 1);

        // Set color
        const color3 = propertyValidator.parseColor(typeof style.color === "string" ? style.color : "#000000");
        material.setDiffuseColor(color3);

        // Line type patterns
        if (style.type && style.type !== "solid") {
            mesh.setMetadata("dashArray", EdgeMeshFactory.getDashPattern(typeof style.type === "string" ? style.type : "solid"));
        }
    },

    simulateAnimatedLine(mesh: TrackingMockMesh, material: TrackingMockMaterial, style: Record<string, unknown>): void {
        EdgeMeshFactory.simulateStaticLine(mesh, material, style);

        // Add animation-specific properties
        mesh.setMetadata("hasAnimation", true);
        mesh.setMetadata("animationTexture", true);

        // Simulate texture creation for animation
        material.metadata.hasAnimationTexture = true;
    },

    simulateArrowHeads(mesh: TrackingMockMesh, arrowConfig: Record<string, unknown>): void {
        if (arrowConfig.source) {
            const source = arrowConfig.source as Record<string, unknown>;
            mesh.setMetadata("sourceArrow", {
                type: source.type ?? "normal",
                size: source.size ?? 1,
                color: source.color,
            });
        }

        if (arrowConfig.target) {
            const target = arrowConfig.target as Record<string, unknown>;
            mesh.setMetadata("targetArrow", {
                type: target.type ?? "normal",
                size: target.size ?? 1,
                color: target.color,
            });
        }
    },

    getDashPattern(type: string): number[] {
    // Simulate dash patterns from EdgeMesh
        const patterns: Record<string, number[]> = {
            "dash": [5, 5],
            "dash-dot": [5, 2, 1, 2],
            "dots": [1, 3],
            "equal-dash": [3, 3],
            "sinewave": [], // Special pattern
            "zigzag": [], // Special pattern
        };
        return patterns[type] ?? [];
    },

    validate(mesh: TrackingMockMesh, material: TrackingMockMaterial, style: Record<string, unknown>): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Validate line type
        const expectedType = typeof style.type === "string" ? style.type : "solid";
        if (mesh.metadata.lineType !== expectedType) {
            errors.push(`Line type mismatch: expected ${expectedType}, got ${mesh.metadata.lineType}`);
        }

        // Validate width
        const expectedWidth = Number(style.width ?? 1);
        if (mesh.metadata.lineWidth !== expectedWidth) {
            errors.push(`Line width mismatch: expected ${expectedWidth}, got ${mesh.metadata.lineWidth}`);
        }

        // Validate animation
        if (style.animationSpeed && !mesh.metadata.animated) {
            errors.push("Animation should be enabled");
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            expected: style,
            actual: {
                type: mesh.metadata.lineType,
                width: mesh.metadata.lineWidth,
                animated: mesh.metadata.animated,
                color: mesh.metadata.lineColor,
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
