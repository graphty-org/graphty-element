import {
    AbstractMesh,
    Camera,
    Color3,
    Effect,
    Engine,
    GreasedLineBaseMesh,
    GreasedLineMeshColorMode,
    Mesh,
    MeshBuilder,
    RawTexture,
    type Scene,
    ShaderMaterial,
    StandardMaterial,
    Vector3,
} from "@babylonjs/core";
import {CreateGreasedLine} from "@babylonjs/core/Meshes/Builders/greasedLineBuilder";

import type {EdgeStyleConfig} from "../config";
import {EDGE_CONSTANTS} from "../constants/meshConstants";
import {CustomLineRenderer} from "./CustomLineRenderer";
import {FilledArrowRenderer} from "./FilledArrowRenderer";
import type {MeshCache} from "./MeshCache";
import {PatternedLineMesh} from "./PatternedLineMesh";
import {PatternedLineRenderer} from "./PatternedLineRenderer";
import {Simple2DLineRenderer} from "./Simple2DLineRenderer";

export interface EdgeMeshOptions {
    styleId: string;
    width: number;
    color: string;
}

export interface ArrowHeadOptions {
    type?: string;
    width: number;
    color: string;
    size?: number; // Size multiplier (default 1.0)
    opacity?: number; // Opacity 0-1 (default 1.0)
}

export interface ArrowGeometry {
    /** Whether arrow uses center positioning (sphere-like) or tip positioning (triangular) */
    positioningMode: "center" | "tip";
    /** Whether arrow mesh needs rotation to align with edge direction */
    needsRotation: boolean;
    /** Position offset from surface point (in units of arrow length) */
    positionOffset: number;
    /** Optional scale factor for variant arrows (e.g., "dot" variants are smaller) */
    scaleFactor?: number;
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class EdgeMesh {
    private static readonly UNIT_VECTOR_POINTS = [0, 0, -0.5, 0, 0, 0.5];
    private static shadersRegistered = false;

    /**
     * Feature flag: Use custom line renderer instead of GreasedLine
     * Set to true to test the new custom rendering system
     */
    private static readonly USE_CUSTOM_RENDERER = true;

    private static registerShaders(): void {
        if (this.shadersRegistered) {
            return;
        }

        // Register dot arrow screen-space vertex shader
        // Matches GreasedLine's screen-space expansion algorithm
        Effect.ShadersStore.dotArrowScreenSpaceVertexShader = `
precision highp float;

attribute vec3 position;
attribute vec2 uv;

uniform mat4 world;
uniform mat4 viewProjection;
uniform mat4 projection;
uniform vec2 grlResolution;
uniform float grlWidth;

varying vec2 vUV;

void main() {
    vUV = uv;

    // Get disc center in clip space
    vec4 centerClip = viewProjection * world * vec4(0.0, 0.0, 0.0, 1.0);

    // Simple circle in screen space - expand radially
    // position.xy is already a unit circle from the disc geometry
    vec2 offset = position.xy * grlWidth * 0.5;

    // Apply screen-space sizing
    // Multiply by w to compensate for perspective divide (GPU will divide by w)
    // Divide by resolution to convert from pixels to NDC (-1 to +1)
    offset *= centerClip.w;
    offset /= grlResolution;

    // Apply offset in clip space
    gl_Position = centerClip;
    gl_Position.xy += offset;
}
`;

        // Register dot arrow screen-space fragment shader
        Effect.ShadersStore.dotArrowScreenSpaceFragmentShader = `
precision highp float;

varying vec2 vUV;
uniform vec3 arrowColor;

void main() {
    // Center coordinates (-1 to +1)
    vec2 centered = vUV * 2.0 - 1.0;

    // SDF: distance from center
    float dist = length(centered);

    // Hard cutoff for uniform color
    if (dist > 1.0) {
        discard;
    }

    gl_FragColor = vec4(arrowColor, 1.0);
}
`;

        // Register vee arrow vertex shader
        // Simple billboard shader - mesh billboard mode handles camera facing
        Effect.ShadersStore.veeArrowVertexShader = `
precision highp float;

attribute vec3 position;
attribute vec2 uv;

uniform mat4 worldViewProjection;

varying vec2 vUV;

void main() {
    vUV = uv;
    gl_Position = worldViewProjection * vec4(position, 1.0);
}
`;

        // Register vee arrow fragment shader
        // Draws two lines forming a 90-degree V pointing right
        Effect.ShadersStore.veeArrowFragmentShader = `
precision highp float;

varying vec2 vUV;
uniform vec3 arrowColor;
uniform float lineWidth;

void main() {
    // Center coordinates (-1 to +1)
    vec2 centered = vUV * 2.0 - 1.0;

    // Tip of V points right at (1, 0)
    // Left arm goes to top-left (-1, 1)
    // Right arm goes to bottom-left (-1, -1)
    // This creates a > shape pointing right with 90-degree angle

    vec2 tip = vec2(1.0, 0.0);
    vec2 leftEnd = vec2(-1.0, 1.0);
    vec2 rightEnd = vec2(-1.0, -1.0);

    // Calculate distance to left arm line
    vec2 leftDir = normalize(leftEnd - tip);
    vec2 toPointLeft = centered - tip;
    float projLeft = dot(toPointLeft, leftDir);
    vec2 closestLeft = tip + leftDir * clamp(projLeft, 0.0, length(leftEnd - tip));
    float distLeft = length(centered - closestLeft);

    // Calculate distance to right arm line
    vec2 rightDir = normalize(rightEnd - tip);
    vec2 toPointRight = centered - tip;
    float projRight = dot(toPointRight, rightDir);
    vec2 closestRight = tip + rightDir * clamp(projRight, 0.0, length(rightEnd - tip));
    float distRight = length(centered - closestRight);

    // Take minimum distance to either line
    float dist = min(distLeft, distRight);

    // Discard if too far from either line
    if (dist > lineWidth) {
        discard;
    }

    gl_FragColor = vec4(arrowColor, 1.0);
}
`;

        this.shadersRegistered = true;
    }

    /**
     * Determine if 2D rendering mode should be used
     *
     * 2D mode is enabled when BOTH conditions are met:
     * 1. Camera is in orthographic mode
     * 2. Graph has twoD metadata set to true
     *
     * @param scene - Babylon.js scene
     * @returns true if 2D mode should be used
     */
    private static is2DMode(scene: Scene): boolean {
        const camera = scene.activeCamera;
        if (!camera) {
            return false;
        }

        const isOrtho = camera.mode === Camera.ORTHOGRAPHIC_CAMERA;
        // Check scene metadata for twoD flag (will be set by Graph)
        const is2DGraph = scene.metadata?.twoD === true;

        return isOrtho && is2DGraph;
    }

    static create(
        cache: MeshCache,
        options: EdgeMeshOptions,
        style: EdgeStyleConfig,
        scene: Scene,
    ): AbstractMesh | PatternedLineMesh {
        const lineType = style.line?.type ?? "solid";
        const PATTERNED_TYPES = ["dot", "star", "box", "dash", "diamond", "dash-dot", "sinewave", "zigzag"];

        console.log("[EdgeMesh.create] Called with lineType:", lineType, "isPatterned:", PATTERNED_TYPES.includes(lineType));

        // PHASE 5: Pattern lines use PatternedLineRenderer (individual meshes, no caching)
        // See: design/mesh-based-patterned-lines.md Phase 5
        // Note: Edge.transformArrowCap() provides start/end already adjusted for node surfaces and arrows
        if (PATTERNED_TYPES.includes(lineType)) {
            console.log("[EdgeMesh.create] Using PatternedLineRenderer for pattern:", lineType);
            return PatternedLineRenderer.create(
                lineType as "dot" | "star" | "box" | "dash" | "diamond" | "dash-dot" | "sinewave" | "zigzag",
                new Vector3(0, 0, -0.5), // Placeholder start (Edge.update() will set real positions)
                new Vector3(0, 0, 0.5), // Placeholder end (Edge.update() will set real positions)
                options.width / 40, // Convert back from scaled width - need /40 to match solid line thickness
                options.color,
                style.line?.opacity ?? 1.0,
                scene,
                this.is2DMode(scene), // Pass 2D mode detection flag
            );
        }

        // PHASE 2: Solid lines in 2D mode use Simple2DLineRenderer
        // 2D mode uses world-space StandardMaterial meshes instead of billboard shaders
        if (lineType === "solid" && this.is2DMode(scene)) {
            console.log("[EdgeMesh.create] Using Simple2DLineRenderer for 2D solid line");
            return Simple2DLineRenderer.create(
                new Vector3(0, 0, -0.5), // Placeholder start (Edge.update() will set real positions)
                new Vector3(0, 0, 0.5), // Placeholder end (Edge.update() will set real positions)
                options.width / 40, // Convert back from scaled width to match 3D line thickness
                options.color,
                style.line?.opacity ?? 1.0,
                scene,
            );
        }

        // Solid lines can use caching (3D mode only, since 2D is handled above)
        const cacheKey = `edge-style-${options.styleId}`;
        return cache.get(cacheKey, () => {
            if (style.line?.animationSpeed) {
                return this.createAnimatedLine(options, style, scene);
            }

            return this.createStaticLine(options, style, scene, cache);
        });
    }

    static createArrowHead(
        cache: MeshCache,
        styleId: string,
        options: ArrowHeadOptions,
        scene: Scene,
        _style?: EdgeStyleConfig, // NEW: Need style for 2D detection (unused - detection via scene)
    ): AbstractMesh | null {
        console.log("EdgeMesh.createArrowHead called:", {styleId, type: options.type, color: options.color});

        if (!options.type || options.type === "none") {
            console.log("EdgeMesh.createArrowHead returning null (no type or none)");
            return null;
        }

        const size = options.size ?? 1.0;
        const opacity = options.opacity ?? 1.0;
        const width = this.calculateArrowWidth() * size;
        const length = this.calculateArrowLength() * size;

        console.log("EdgeMesh.createArrowHead computed dimensions:", {size, opacity, width, length});

        // Detect 2D mode
        const is2D = this.is2DMode(scene);

        // Arrow type routing:
        // - Filled arrows: Use FilledArrowRenderer for ALL arrows (unified implementation)
        // - Billboard arrows: Only "sphere" type (3D sphere mesh)
        const FILLED_ARROWS = ["normal", "inverted", "diamond", "box", "dot", "vee", "tee", "half-open", "crow", "open-normal", "open-diamond", "open-dot", "sphere-dot"];
        const BILLBOARD_ARROWS = ["sphere"];

        // PERFORMANCE FIX: Create individual meshes for all arrow types
        // Thin instances were causing 1,147ms bottleneck (35x slower than direct position updates)
        // Individual meshes use direct position/rotation which is much faster for frequent updates

        let mesh: Mesh;
        const arrowType = options.type ?? "";

        if (FILLED_ARROWS.includes(arrowType)) {
            // Filled arrows: Same geometry, different materials (StandardMaterial for 2D, ShaderMaterial for 3D)
            console.log("Creating filled arrow:", arrowType, "is2D:", is2D);

            if (is2D) {
                // PHASE 4: Use 2D arrow creation (StandardMaterial, no shader, XY rotation)
                mesh = FilledArrowRenderer.create2DArrow(arrowType, length, width, options.color, opacity, scene);
            } else {
                // 3D mode: Use shader-based arrows (ShaderMaterial, billboard)
                mesh = this.createFilledArrow(arrowType, length, width, options.color, opacity, scene);
            }
        } else if (BILLBOARD_ARROWS.includes(arrowType)) {
            // 3D billboard arrows: Only "sphere" uses CreateSphere
            console.log("Creating billboard arrow:", arrowType);
            if (options.type === "sphere") {
                mesh = this.createSphereArrow(length, width, options.color, scene);
            } else {
                throw new Error(`Unsupported arrow type: ${options.type}`);
            }
        } else {
            console.log("Unknown arrow type, throwing error:", options.type);
            throw new Error(`Unsupported arrow type: ${options.type}`);
        }

        console.log("EdgeMesh.createArrowHead created mesh:", {name: mesh.name, vertices: mesh.getTotalVertices(), opacity});
        mesh.visibility = opacity;
        console.log("EdgeMesh.createArrowHead returning mesh");
        return mesh;
    }

    /**
     * Create a filled arrow base mesh using FilledArrowRenderer
     * Returns a cached mesh template with thin instance support.
     * lineDirection is set per-instance when creating thin instances.
     */
    private static createFilledArrow(
        type: string,
        length: number,
        width: number,
        color: string,
        opacity: number,
        scene: Scene,
    ): Mesh {
        let mesh: Mesh;

        // Create appropriate mesh geometry (all use normalized dimensions)
        switch (type) {
            case "normal":
                mesh = FilledArrowRenderer.createTriangle(false, scene);
                break;
            case "inverted":
                mesh = FilledArrowRenderer.createTriangle(true, scene);
                break;
            case "diamond":
                mesh = FilledArrowRenderer.createDiamond(scene);
                break;
            case "box":
                mesh = FilledArrowRenderer.createBox(scene);
                break;
            case "dot":
                mesh = FilledArrowRenderer.createCircle(scene);
                break;
            case "sphere-dot":
                // sphere-dot needs different handling for 2D vs 3D:
                // - 2D: shader-based filled circle (handled in createArrowHead)
                // - 3D: 3D sphere mesh (handled here)
                // Since createFilledArrow is only called in 3D mode, create 3D sphere

                // CRITICAL: The sphere size must match what positioning code expects
                // calculateArrowPosition() uses actualSize = length * scaleFactor
                // So we must create the sphere with diameter = length * scaleFactor
                const sphereDotGeometry = EdgeMesh.getArrowGeometry("sphere-dot");
                const sphereDotScaleFactor = sphereDotGeometry.scaleFactor ?? 1.0;
                const sphereDiameter = length * sphereDotScaleFactor; // e.g., 0.5 * 0.25 = 0.125

                const sphereMesh = MeshBuilder.CreateSphere(
                    "sphere-dot-arrow-3d",
                    {
                        diameter: sphereDiameter,
                        segments: 16,
                    },
                    scene,
                );
                const sphereMaterial = new StandardMaterial("sphere-dot-material-3d", scene);
                sphereMaterial.diffuseColor = Color3.FromHexString(color);
                sphereMaterial.emissiveColor = Color3.FromHexString(color);
                sphereMaterial.disableLighting = true;
                sphereMesh.material = sphereMaterial;
                sphereMesh.visibility = opacity;
                // Return directly - don't apply shader since this is a standard material mesh
                return sphereMesh;
            case "vee":
                mesh = FilledArrowRenderer.createVee(scene);
                break;
            case "tee":
                mesh = FilledArrowRenderer.createTee(scene);
                break;
            case "half-open":
                mesh = FilledArrowRenderer.createHalfOpen(scene);
                break;
            case "crow":
                mesh = FilledArrowRenderer.createCrow(scene);
                break;
            case "open-normal":
                mesh = FilledArrowRenderer.createOpenNormal(scene);
                break;
            case "open-diamond":
                mesh = FilledArrowRenderer.createOpenDiamond(scene);
                break;
            case "open-dot":
                mesh = FilledArrowRenderer.createOpenCircle(scene);
                break;
            default:
                throw new Error(`Unsupported filled arrow type: ${type}`);
        }

        // Apply the shader with world-space sizing
        // Size parameter is in world units (arrow length)
        return FilledArrowRenderer.applyShader(
            mesh,
            {
                size: length, // World-space length (e.g., 0.5 units)
                color,
                opacity,
            },
            scene,
        );
    }

    private static createStaticLine(
        options: EdgeMeshOptions,
        style: EdgeStyleConfig,
        scene: Scene,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Parameter kept for compatibility during Phase 0 refactor
        _cache: MeshCache,
    ): Mesh {
        // Use custom line renderer if flag is enabled
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Feature flag for toggling renderer implementation
        if (this.USE_CUSTOM_RENDERER) {
            const points = [
                new Vector3(
                    this.UNIT_VECTOR_POINTS[0],
                    this.UNIT_VECTOR_POINTS[1],
                    this.UNIT_VECTOR_POINTS[2],
                ),
                new Vector3(
                    this.UNIT_VECTOR_POINTS[3],
                    this.UNIT_VECTOR_POINTS[4],
                    this.UNIT_VECTOR_POINTS[5],
                ),
            ];

            const lineType = style.line?.type ?? "solid";

            console.log("[EdgeMesh] Creating line with CustomLineRenderer:", {
                lineType,
                color: options.color,
                width: options.width,
                scaledWidth: options.width * 20,
            });

            // CustomLineRenderer only handles solid lines
            // All patterns are handled by PatternedLineMesh
            const mesh = CustomLineRenderer.create(
                {
                    points,
                    width: options.width * 20, // Scale factor to match GreasedLine sizing
                    color: options.color,
                    opacity: style.line?.opacity,
                },
                scene,
            );

            // Apply opacity to mesh visibility (in addition to shader opacity)
            if (style.line?.opacity !== undefined) {
                mesh.visibility = style.line.opacity;
            }

            return mesh;
        }

        // Fallback to GreasedLine
        const mesh = CreateGreasedLine(
            "edge-plain",
            {
                points: this.UNIT_VECTOR_POINTS,
            },
            {
                color: Color3.FromHexString(options.color),
                width: options.width,
            },
            scene,
        );

        // Apply opacity if specified
        if (style.line?.opacity !== undefined) {
            mesh.visibility = style.line.opacity;
        }

        return mesh as Mesh;
    }

    private static createAnimatedLine(
        options: EdgeMeshOptions,
        style: EdgeStyleConfig,
        scene: Scene,
    ): Mesh {
        const baseColor = Color3.FromHexString(EDGE_CONSTANTS.MOVING_LINE_BASE_COLOR);
        const movingColor = Color3.FromHexString(options.color);

        const texture = this.createAnimatedTexture(baseColor, movingColor, scene);

        const mesh = CreateGreasedLine(
            "edge-moving",
            {
                points: this.UNIT_VECTOR_POINTS,
            },
            {
                width: options.width,
                colorMode: GreasedLineMeshColorMode.COLOR_MODE_MULTIPLY,
            },
            scene,
        );

        this.applyAnimatedTexture(mesh, texture, scene, style.line?.animationSpeed);

        // Apply opacity if specified
        if (style.line?.opacity !== undefined) {
            mesh.visibility = style.line.opacity;
        }

        return mesh as Mesh;
    }

    private static createAnimatedTexture(
        baseColor: Color3,
        movingColor: Color3,
        scene: Scene,
    ): RawTexture {
        const r1 = Math.floor(baseColor.r * 255);
        const g1 = Math.floor(baseColor.g * 255);
        const b1 = Math.floor(baseColor.b * 255);
        const r2 = Math.floor(movingColor.r * 255);
        const g2 = Math.floor(movingColor.g * 255);
        const b2 = Math.floor(movingColor.b * 255);

        const textureData = new Uint8Array([r1, g1, b1, r2, g2, b2]);

        const texture = new RawTexture(
            textureData,
            textureData.length / 3,
            1,
            Engine.TEXTUREFORMAT_RGB,
            scene,
            false,
            true,
            Engine.TEXTURE_NEAREST_NEAREST,
        );

        texture.wrapU = RawTexture.WRAP_ADDRESSMODE;
        texture.name = "moving-texture";

        return texture;
    }

    private static applyAnimatedTexture(
        mesh: GreasedLineBaseMesh,
        texture: RawTexture,
        scene: Scene,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _animationSpeed?: number,
    ): void {
        const material = mesh.material as StandardMaterial;
        material.emissiveTexture = texture;
        material.disableLighting = true;
        texture.uScale = EDGE_CONSTANTS.MOVING_TEXTURE_U_SCALE;

        scene.onBeforeRenderObservable.add(() => {
            texture.uOffset -= EDGE_CONSTANTS.MOVING_TEXTURE_ANIMATION_SPEED * scene.getAnimationRatio();
        });
    }

    // Sphere arrow - creates a 3D sphere that appears as a filled circle from all angles
    private static createSphereArrow(length: number, width: number, color: string, scene: Scene): Mesh {
        // Sphere fits exactly within the allocated arrow space
        const sphereDiameter = length;

        // Create a 3D sphere positioned at z=0 (node surface)
        // This will appear as a filled circle from all viewing angles
        const mesh = MeshBuilder.CreateSphere(
            "sphere-arrow",
            {
                diameter: sphereDiameter,
                segments: 16,
            },
            scene,
        );

        // Apply color
        const material = new StandardMaterial("sphere-material", scene);
        material.diffuseColor = Color3.FromHexString(color);
        material.emissiveColor = Color3.FromHexString(color);
        material.disableLighting = true;
        mesh.material = material;

        return mesh;
    }

    // Helper to create a circular texture with anti-aliasing (white circle on transparent background)
    private static createCircleTextureData(size: number): Uint8Array {
        const data = new Uint8Array(size * size * 4);
        const center = size / 2;
        const radius = (size / 2) - 1; // Leave 1 pixel margin for anti-aliasing

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const dx = (x - center) + 0.5;
                const dy = (y - center) + 0.5;
                const distance = Math.sqrt((dx * dx) + (dy * dy));
                const index = ((y * size) + x) * 4;

                // Anti-aliased edge: smooth transition over 1.5 pixels
                let alpha = 255;
                if (distance > radius) {
                    const edgeDistance = distance - radius;
                    if (edgeDistance < 1.5) {
                        // Smooth falloff for anti-aliasing
                        alpha = Math.max(0, Math.min(255, 255 * (1.5 - edgeDistance) / 1.5));
                    } else {
                        alpha = 0;
                    }
                }

                data[index] = 255; // R
                data[index + 1] = 255; // G
                data[index + 2] = 255; // B
                data[index + 3] = alpha; // A (anti-aliased)
            }
        }

        return data;
    }

    static calculateArrowWidth(): number {
        return EDGE_CONSTANTS.DEFAULT_ARROW_WIDTH;
    }

    static calculateArrowLength(): number {
        return EDGE_CONSTANTS.DEFAULT_ARROW_LENGTH;
    }

    /**
     * Get geometry metadata for an arrow type
     * This is the single source of truth for arrow positioning and line length calculations
     */
    static getArrowGeometry(arrowType: string): ArrowGeometry {
        switch (arrowType) {
            // Center-based arrows (all use same positioning, no scaling)
            case "dot":
            case "open-dot":
                return {
                    positioningMode: "center", // Symmetric, positioned by center
                    needsRotation: false,
                    positionOffset: 0,
                };

            case "sphere-dot":
                return {
                    positioningMode: "center", // Symmetric, positioned by center
                    needsRotation: false,
                    positionOffset: 0,
                    scaleFactor: 0.25, // Small dot-sized sphere (1/4 size)
                };

            case "sphere":
                return {
                    positioningMode: "center",
                    needsRotation: false,
                    positionOffset: 0,
                    scaleFactor: 1.0, // Full size (CreateSphere uses different sizing)
                };

            // Filled arrows using FilledArrowRenderer (billboard shaders, no rotation)
            // These arrows have tip/front edge at origin
            case "normal":
            case "vee":
            case "tee":
            case "half-open":
            case "crow":
            case "open-normal":
            case "open-diamond":
            case "diamond":
            case "box":
                return {
                    positioningMode: "tip",
                    needsRotation: false, // Billboard shaders handle orientation
                    positionOffset: 0, // Tip at origin, position mesh at surface
                };

            // Inverted arrow: geometry extends forward (+X), so we offset backward
            // to position the base (at +1.0) at the sphere surface
            // Note: subtract() in calculateArrowPosition means positive offset moves TOWARD sphere
            case "inverted":
                return {
                    positioningMode: "tip",
                    needsRotation: false, // Billboard shaders handle orientation
                    positionOffset: 1.0, // Move arrow backward (toward sphere) to place base at surface
                };

            // Outline arrows using CustomLineRenderer (same positioning as old system)
            case "open":
            default:
                return {
                    positioningMode: "tip",
                    needsRotation: true,
                    positionOffset: 0, // Tip positioned exactly at surface
                };
        }
    }

    /**
     * Calculate arrow mesh position given surface point and arrow properties
     */
    static calculateArrowPosition(
        surfacePoint: Vector3,
        direction: Vector3,
        arrowLength: number,
        geometry: ArrowGeometry,
    ): Vector3 {
        const scaleFactor = geometry.scaleFactor ?? 1.0;

        if (geometry.positioningMode === "center") {
            // Center-based: position center back by radius so front edge touches surface
            const actualSize = arrowLength * scaleFactor;
            const radius = actualSize / 2;
            return surfacePoint.subtract(direction.scale(radius));
        }

        // Tip-based: apply custom offset
        const offset = arrowLength * geometry.positionOffset;
        return surfacePoint.subtract(direction.scale(offset));
    }

    /**
     * Calculate where the line should end given arrow properties
     */
    static calculateLineEndpoint(
        surfacePoint: Vector3,
        direction: Vector3,
        arrowLength: number,
        geometry: ArrowGeometry,
    ): Vector3 {
        // Line gap equals actual arrow size (base size × scale factor)
        const scaleFactor = geometry.scaleFactor ?? 1.0;
        const actualSize = arrowLength * scaleFactor;
        return surfacePoint.subtract(direction.scale(actualSize));
    }

    static transformMesh(
        mesh: AbstractMesh,
        srcPoint: Vector3,
        dstPoint: Vector3,
    ): void {
        const delta = dstPoint.subtract(srcPoint);
        const midPoint = new Vector3(
            srcPoint.x + (delta.x / 2),
            srcPoint.y + (delta.y / 2),
            srcPoint.z + (delta.z / 2),
        );
        const length = delta.length();

        mesh.position = midPoint;
        mesh.lookAt(dstPoint);
        mesh.scaling.z = length;
    }

}
