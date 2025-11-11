import {
    AbstractMesh,
    Color3,
    Effect,
    Engine,
    GreasedLineBaseMesh,
    GreasedLineMeshColorMode,
    GreasedLineMeshWidthDistribution,
    GreasedLineTools,
    Mesh,
    MeshBuilder,
    RawTexture,
    type Scene,
    ShaderMaterial,
    StandardMaterial,
    Vector3,
    VertexData,
} from "@babylonjs/core";
import {CreateGreasedLine} from "@babylonjs/core/Meshes/Builders/greasedLineBuilder";

import type {EdgeStyleConfig} from "../config";
import {EDGE_CONSTANTS} from "../constants/meshConstants";
import {CustomLineRenderer, type LineGeometry} from "./CustomLineRenderer";
import {FilledArrowRenderer} from "./FilledArrowRenderer";
import type {MeshCache} from "./MeshCache";

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

    static create(
        cache: MeshCache,
        options: EdgeMeshOptions,
        style: EdgeStyleConfig,
        scene: Scene,
    ): AbstractMesh {
        const cacheKey = `edge-style-${options.styleId}`;

        return cache.get(cacheKey, () => {
            if (style.line?.animationSpeed) {
                return this.createAnimatedLine(options, style, scene);
            }

            return this.createStaticLine(options, style, scene);
        });
    }

    static createArrowHead(
        cache: MeshCache,
        styleId: string,
        options: ArrowHeadOptions,
        scene: Scene,
    ): AbstractMesh | null {
        if (!options.type || options.type === "none") {
            return null;
        }

        const size = options.size ?? 1.0;
        const opacity = options.opacity ?? 1.0;
        const width = this.calculateArrowWidth() * size;
        const length = this.calculateArrowLength() * size;

        // Arrow type routing:
        // - Filled arrows: Use FilledArrowRenderer (uniform scaling shader)
        // - Outline arrows: Use CustomLineRenderer (perpendicular expansion shader, same as lines!)
        // - 3D billboard arrows: Use existing implementation (spheres)
        const FILLED_ARROWS = ["normal", "inverted", "diamond", "box", "dot"];
        const OUTLINE_ARROWS = ["empty", "open-diamond", "tee", "vee", "open", "half-open", "crow"];
        const BILLBOARD_ARROWS = ["open-dot", "sphere-dot", "sphere"];

        // Only billboard arrows need fresh mesh per edge
        // Filled arrows use thin instances with per-instance lineDirection attribute
        const needsFreshMesh = BILLBOARD_ARROWS.includes(options.type ?? "");

        const createMesh = (): Mesh => {
            let mesh: Mesh;

            // Route to appropriate renderer based on arrow type
            const arrowType = options.type ?? "";

            if (FILLED_ARROWS.includes(arrowType)) {
                // Filled arrows: Use FilledArrowRenderer with thin instances
                // lineDirection passed per-instance when creating thin instances
                mesh = this.createFilledArrow(arrowType, length, width, options.color, opacity, scene);
            } else if (OUTLINE_ARROWS.includes(arrowType)) {
                // Outline arrows: Use CustomLineRenderer (same shader as lines!)
                mesh = this.createOutlineArrow(arrowType, length, width, options.color, scene);
            } else if (BILLBOARD_ARROWS.includes(arrowType)) {
                // 3D billboard arrows: Use existing sphere-based implementation
                switch (options.type) {
                    case "open-dot":
                        mesh = this.createOpenDotArrow(length, width, options.color, scene);
                        break;
                    case "sphere-dot":
                        mesh = this.createSphereDotArrow(length, width, options.color, scene);
                        break;
                    case "sphere":
                        mesh = this.createSphereArrow(length, width, options.color, scene);
                        break;
                    default:
                        throw new Error(`Unsupported arrow type: ${options.type}`);
                }
            } else {
                throw new Error(`Unsupported arrow type: ${options.type}`);
            }

            mesh.visibility = opacity;
            return mesh;
        };

        // Some arrows don't work with instancing/caching, so create fresh mesh
        // (billboard arrows and perpendicular dot which needs per-edge orientation)
        if (needsFreshMesh) {
            return createMesh();
        }

        const cacheKey = `edge-arrowhead-v2-style-${styleId}`;

        // Filled arrows use THIN INSTANCES, not InstancedMesh
        // Return the base mesh directly so Edge can call thinInstanceAdd()
        if (FILLED_ARROWS.includes(options.type ?? "")) {
            let baseMesh = cache.meshCacheMap.get(cacheKey);
            if (!baseMesh) {
                // Create and cache the base mesh
                baseMesh = createMesh();
                baseMesh.name = cacheKey; // Set name to cache key for test compatibility
                // IMPORTANT: Do NOT set isVisible = false! It hides ALL thin instances.
                // Instead, move far away to hide the base mesh template.
                baseMesh.position.set(0, -10000, 0);
                cache.meshCacheMap.set(cacheKey, baseMesh);
            }

            return baseMesh; // Return base mesh, not an instance
        }

        // Outline arrows use regular instancing (InstancedMesh)
        // MeshCache.get() creates an instance via mesh.createInstance()
        return cache.get(cacheKey, createMesh);
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

    /**
     * Create an outline arrow using CustomLineRenderer (perpendicular expansion shader)
     * Uses the SAME shader as lines - guaranteed perfect alignment!
     */
    private static createOutlineArrow(
        type: string,
        length: number,
        width: number,
        color: string,
        scene: Scene,
    ): Mesh {
        let geometry: LineGeometry;

        // Generate appropriate line geometry
        switch (type) {
            case "empty":
                geometry = CustomLineRenderer.createEmptyArrowGeometry(length, width);
                break;
            case "open-diamond":
                geometry = CustomLineRenderer.createOpenDiamondArrowGeometry(length, width);
                break;
            case "tee":
                geometry = CustomLineRenderer.createTeeArrowGeometry(width);
                break;
            case "vee":
                geometry = CustomLineRenderer.createVeeArrowGeometry(length, width);
                break;
            case "open":
                geometry = CustomLineRenderer.createOpenArrowGeometry(length, width);
                break;
            case "half-open":
                geometry = CustomLineRenderer.createHalfOpenArrowGeometry(length, width);
                break;
            case "crow":
                geometry = CustomLineRenderer.createCrowArrowGeometry(length, width);
                break;
            default:
                throw new Error(`Unsupported outline arrow type: ${type}`);
        }

        // Create mesh from geometry using the SAME shader as lines
        return CustomLineRenderer.createFromGeometry(
            geometry,
            {
                width: width * 20, // Same scaling as lines
                color,
            },
            scene,
        );
    }

    private static createStaticLine(options: EdgeMeshOptions, style: EdgeStyleConfig, scene: Scene): Mesh {
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

            const mesh = CustomLineRenderer.create(
                {
                    points,
                    width: options.width * 20, // Scale factor to match GreasedLine sizing
                    color: options.color,
                    opacity: style.line?.opacity,
                    pattern: style.line?.type ?? "solid",
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

    // Normal arrow - XY plane triangle (vertical, facing camera)
    private static createNormalArrow(length: number, width: number, color: string, scene: Scene): Mesh {
        const mesh = new Mesh("normal-arrow", scene);

        // Define triangle vertices in XY plane (vertical triangle facing camera)
        // Tip at origin (0,0,0) - this will be positioned at node surface
        // Base extends BACK along -X (away from tip)
        // Use normalized dimensions - actual sizing handled by positioning
        const arrowLength = 1.0;
        const arrowWidth = 0.8;

        const positions = [
            0,
            0,
            0, // Vertex 0: Tip at origin
            -arrowLength,
            arrowWidth / 2,
            0, // Vertex 1: Top corner of base
            -arrowLength,
            -arrowWidth / 2,
            0, // Vertex 2: Bottom corner of base
        ];

        // Triangle indices (counter-clockwise winding when viewed from +Z/camera)
        const indices = [0, 1, 2];

        // Normals pointing in +Z direction (toward camera)
        const normals = [
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            0,
            1,
        ];

        // Apply vertex data
        const vertexData = new VertexData();
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.normals = normals;
        vertexData.applyToMesh(mesh);

        // Create material with same color as line
        const material = new StandardMaterial("arrow-material", scene);
        const colorObj = Color3.FromHexString(color);
        material.diffuseColor = colorObj;
        material.emissiveColor = colorObj;
        material.disableLighting = true;
        material.backFaceCulling = false; // Render both sides

        mesh.material = material;

        return mesh;
    }

    // Inverted arrow (points away from target) - wide base at surface, tip extends back along line
    private static createInvertedArrow(length: number, width: number, color: string, scene: Scene): Mesh {
        // Use CustomLineRenderer for perfect alignment with lines
        const geometry = CustomLineRenderer.createTriangularArrowGeometry(length, width, true);
        return CustomLineRenderer.createFromGeometry(
            geometry,
            {
                width: width * 20, // Same scaling as lines to match visual appearance
                color,
            },
            scene,
        );
    }

    // Dot arrow - screen-space disc matching GreasedLine's rendering
    private static createDotArrow(length: number, width: number, color: string, scene: Scene): Mesh {
        // Use CustomLineRenderer for perfect alignment with lines
        // Create a circular dot with radius = width/2 for proper sizing
        const geometry = CustomLineRenderer.createCircularDotGeometry(width / 2, 32);
        return CustomLineRenderer.createFromGeometry(
            geometry,
            {
                width: width * 20, // Same scaling as lines to match visual appearance
                color,
            },
            scene,
        );
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

    // Sphere-dot arrow - creates a filled circle that appears circular from all angles
    // Uses a 3D sphere which naturally appears as a circle regardless of viewing angle
    private static createSphereDotArrow(length: number, width: number, color: string, scene: Scene): Mesh {
        // Sphere-dot is a small variant (0.25x size for "dot" appearance)
        const sphereDiameter = length * EDGE_CONSTANTS.ARROW_SPHERE_DOT_DIAMETER_RATIO;

        // Create a 3D sphere
        // A sphere naturally appears as a filled circle from all viewing angles
        const mesh = MeshBuilder.CreateSphere(
            "sphere-dot-arrow",
            {
                diameter: sphereDiameter,
                segments: 16, // Lower segment count for performance (dots are small)
            },
            scene,
        );

        // Apply color
        const material = new StandardMaterial("sphere-dot-material", scene);
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

    // Open-dot arrow - creates a circle outline using GreasedLine
    // Uses GreasedLineTools.GetCircleLinePoints to create a circular path
    private static createOpenDotArrow(length: number, width: number, color: string, scene: Scene): Mesh {
        // Open-dot is a small variant (0.25x size for "dot" appearance)
        const circleDiameter = length * EDGE_CONSTANTS.ARROW_SPHERE_DOT_DIAMETER_RATIO;
        const circleRadius = circleDiameter / 2;

        // Generate circle points using GreasedLineTools
        const points = GreasedLineTools.GetCircleLinePoints(
            circleRadius, // radiusX
            32, // segments - smooth circle
        );

        // Create GreasedLine circle with thin outline
        const mesh = CreateGreasedLine(
            "open-dot-arrow",
            {
                points,
            },
            {
                color: Color3.FromHexString(color),
                width: 0.05, // Thin line width for circle outline
            },
            scene,
        );

        // Ensure material color is set correctly for instancing
        if (mesh.material) {
            const material = mesh.material as StandardMaterial;
            const colorObj = Color3.FromHexString(color);
            material.diffuseColor = colorObj;
            material.emissiveColor = colorObj;
            material.disableLighting = true;
        }

        // BILLBOARDMODE_X: Rotates around X-axis to maintain shape during vertical (up/down) camera movement
        // while allowing foreshortening during horizontal (left/right) camera rotation
        mesh.billboardMode = Mesh.BILLBOARDMODE_X;

        return mesh as Mesh;
    }

    // Diamond arrow - uses 3 points with varying widths to create filled diamond shape
    // Based on GetArrowCap technique: 2 points with widths create filled triangle
    // Diamond needs 3 points: tip (sharp point), middle (wide), base (sharp point)
    private static createDiamondArrow(length: number, width: number, color: string, scene: Scene): Mesh {
        // Use CustomLineRenderer for perfect alignment with lines
        const geometry = CustomLineRenderer.createDiamondArrowGeometry(length, width);
        return CustomLineRenderer.createFromGeometry(
            geometry,
            {
                width: width * 20, // Same scaling as lines to match visual appearance
                color,
            },
            scene,
        );
    }

    // Box arrow - modified GetArrowCap to create square instead of triangle
    private static createBoxArrow(length: number, width: number, color: string, scene: Scene): Mesh {
        // Use CustomLineRenderer for perfect alignment with lines
        const geometry = CustomLineRenderer.createBoxArrowGeometry(length, width);
        return CustomLineRenderer.createFromGeometry(
            geometry,
            {
                width: width * 20, // Same scaling as lines to match visual appearance
                color,
            },
            scene,
        );
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
            // Center-based arrows (sphere-like)
            case "open-dot":
            case "sphere-dot":
                return {
                    positioningMode: "center",
                    needsRotation: false,
                    positionOffset: 0,
                    scaleFactor: EDGE_CONSTANTS.ARROW_SPHERE_DOT_DIAMETER_RATIO, // 0.25 - small "dot" variant
                };
            case "sphere":
                return {
                    positioningMode: "center",
                    needsRotation: false,
                    positionOffset: 0,
                    scaleFactor: 1.0, // Full size
                };

            // Special tip-based arrows with custom positioning
            case "dot":
                return {
                    positioningMode: "center", // Dot is symmetric, position by center
                    needsRotation: false,
                    positionOffset: 0,
                };
            case "vee":
                return {
                    positioningMode: "tip",
                    needsRotation: true, // vee needs rotation
                    positionOffset: 0.5, // Center at midpoint, so front edge touches surface
                };

            // Filled arrows using FilledArrowRenderer (billboard shaders, no rotation)
            // These arrows have tip/front edge at origin, extending backward
            case "normal":
            case "inverted":
            case "diamond":
            case "box":
                return {
                    positioningMode: "tip",
                    needsRotation: false, // Billboard shaders handle orientation
                    positionOffset: 0, // Tip at origin, position mesh at surface
                };

            // Outline arrows using CustomLineRenderer (same positioning as old system)
            case "tee":
            case "open-diamond":
            case "empty":
            case "open":
            case "half-open":
            case "crow":
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

    // Empty arrow - hollow triangle using thin outline
    private static createEmptyArrow(length: number, width: number, color: string, scene: Scene): Mesh {
        // Reuse normal arrow geometry but with thin line width to create outline effect
        const cap = GreasedLineTools.GetArrowCap(
            new Vector3(0, 0, -length),
            new Vector3(0, 0, 1),
            length,
            width,
            width,
        );

        // Create outline by using thin line width
        const mesh = CreateGreasedLine(
            "lines",
            {
                points: cap.points,
                widths: cap.widths.map((w) => w * 0.15), // Thin outline
                widthDistribution: GreasedLineMeshWidthDistribution.WIDTH_DISTRIBUTION_START,
            },
            {
                color: Color3.FromHexString(color),
            },
            scene,
        );

        // Ensure material color is set correctly for instancing
        if (mesh.material) {
            const material = mesh.material as StandardMaterial;
            const colorObj = Color3.FromHexString(color);
            material.diffuseColor = colorObj;
            material.emissiveColor = colorObj;
            material.disableLighting = true;
        }

        return mesh as Mesh;
    }

    // Open-diamond arrow - hollow diamond shape
    private static createOpenDiamondArrow(length: number, width: number, color: string, scene: Scene): Mesh {
        // Diamond fits exactly within the allocated arrow space
        const diamondLength = length;

        // Create diamond outline path: tip -> left -> base -> right -> tip
        const points = [
            new Vector3(0, 0, -diamondLength), // Tip (forward)
            new Vector3(-width / 2, 0, -diamondLength / 2), // Left point (widest)
            new Vector3(0, 0, 0), // Base (at line connection)
            new Vector3(width / 2, 0, -diamondLength / 2), // Right point (widest)
            new Vector3(0, 0, -diamondLength), // Back to tip (close the shape)
        ];

        // Thin uniform line width for outline
        const mesh = CreateGreasedLine(
            "lines",
            {
                points,
            },
            {
                color: Color3.FromHexString(color),
                width: 0.08, // Thin line for outline
            },
            scene,
        );

        // Ensure material color is set correctly for instancing
        if (mesh.material) {
            const material = mesh.material as StandardMaterial;
            const colorObj = Color3.FromHexString(color);
            material.diffuseColor = colorObj;
            material.emissiveColor = colorObj;
            material.disableLighting = true;
        }

        return mesh as Mesh;
    }

    // Tee arrow - modified box arrow to create thin rectangle
    private static createTeeArrow(length: number, width: number, color: string, scene: Scene): Mesh {
        // Tee uses full allocated space along line direction
        // Width parameter controls perpendicular dimension
        const teeWidth = width * 1.25; // 1.25 times wider perpendicular to line
        const teeLength = length; // Full allocated space along line direction

        const points = [
            new Vector3(0, 0, -teeLength), // Back of box (half depth)
            new Vector3(0, 0, 0), // Front of box at surface
        ];

        // Keep width constant for both points to create parallel edges (rectangle)
        const widths = [
            teeWidth,
            teeWidth, // Back point: full width (1.25x)
            teeWidth,
            teeWidth, // Front point: full width (1.25x, not tapered to 0)
        ];

        const mesh = CreateGreasedLine(
            "lines",
            {
                points,
                widths,
                widthDistribution: GreasedLineMeshWidthDistribution.WIDTH_DISTRIBUTION_START,
            },
            {
                color: Color3.FromHexString(color),
            },
            scene,
        );

        // Ensure material color is set correctly for instancing
        if (mesh.material) {
            const material = mesh.material as StandardMaterial;
            const colorObj = Color3.FromHexString(color);
            material.diffuseColor = colorObj;
            material.emissiveColor = colorObj;
            material.disableLighting = true;
        }

        return mesh as Mesh;
    }

    // Open arrow - V-shape without back edge
    private static createOpenArrow(length: number, width: number, color: string, scene: Scene): Mesh {
        // V-shape: left arm -> tip -> right arm
        const points = [
            new Vector3(-width / 2, 0, -length), // Left arm
            new Vector3(0, 0, 0), // Tip
            new Vector3(width / 2, 0, -length), // Right arm
        ];

        const mesh = CreateGreasedLine(
            "lines",
            {
                points,
            },
            {
                color: Color3.FromHexString(color),
                width: width * 0.15, // Proportional line width
            },
            scene,
        );

        // Ensure material color is set correctly for instancing
        if (mesh.material) {
            const material = mesh.material as StandardMaterial;
            const colorObj = Color3.FromHexString(color);
            material.diffuseColor = colorObj;
            material.emissiveColor = colorObj;
            material.disableLighting = true;
        }

        return mesh as Mesh;
    }

    // Half-open arrow - asymmetric arrow (one side longer than the other)
    private static createHalfOpenArrow(length: number, width: number, color: string, scene: Scene): Mesh {
        const ratio = EDGE_CONSTANTS.ARROW_HALF_OPEN_RATIO;

        // One full arm, one half arm
        const points = [
            new Vector3(-width / 2, 0, -length), // Left arm (full)
            new Vector3(0, 0, 0), // Tip
            new Vector3(width / 2, 0, -length * ratio), // Right arm (half)
        ];

        const mesh = CreateGreasedLine(
            "lines",
            {
                points,
            },
            {
                color: Color3.FromHexString(color),
                width: width * 0.15, // Proportional line width
            },
            scene,
        );

        // Ensure material color is set correctly for instancing
        if (mesh.material) {
            const material = mesh.material as StandardMaterial;
            const colorObj = Color3.FromHexString(color);
            material.diffuseColor = colorObj;
            material.emissiveColor = colorObj;
            material.disableLighting = true;
        }

        return mesh as Mesh;
    }

    // Helper function similar to GetArrowCap but for vee shape
    // Creates geometry for a 90-degree V matching normal arrow dimensions
    private static getVeeCap(length: number, width: number): VertexData {
        // Calculate side length matching normal arrow (from tip to base corner)
        // Normal arrow: tip at (0,0,0), base corners at (±width/2, 0, -length)
        const sideLength = Math.sqrt(((width / 2) ** 2) + (length ** 2));

        // For 90-degree angle between arms, each arm at 45° from center axis
        // Left arm direction: (-1, 0, -1) normalized = (-0.707, 0, -0.707)
        // Right arm direction: (1, 0, -1) normalized = (0.707, 0, -0.707)
        // Verification: dot product = 0 (perpendicular)

        // Each arm extends sideLength units from tip
        const component = sideLength * Math.SQRT1_2; // ≈ 0.7071

        const positions = [
            // Left arm endpoint at 45° angle
            -component,
            0,
            -component,
            // Tip at surface
            0,
            0,
            0,
            // Right arm endpoint at 45° angle
            component,
            0,
            -component,
        ];

        const vertexData = new VertexData();
        vertexData.positions = positions;
        return vertexData;
    }

    // Vee arrow - shader-based billboard approach for consistent appearance
    // Based on GraphViz vee specification: 90-degree V shape
    private static createVeeArrow(length: number, width: number, color: string, scene: Scene): Mesh {
        // Register shaders if not already done
        this.registerShaders();

        // Vee fits exactly within the allocated arrow space
        const size = length;

        // Create quad geometry for the billboard
        const positions = [
            -1,
            -1,
            0, // Bottom-left
            1,
            -1,
            0, // Bottom-right
            1,
            1,
            0, // Top-right
            -1,
            1,
            0, // Top-left
        ];

        const uvs = [
            0,
            0, // Bottom-left
            1,
            0, // Bottom-right
            1,
            1, // Top-right
            0,
            1, // Top-left
        ];

        const indices = [
            0,
            1,
            2, // First triangle
            0,
            2,
            3, // Second triangle
        ];

        // Create mesh with vertex data
        const mesh = new Mesh("vee-arrow", scene);
        const vertexData = new VertexData();
        vertexData.positions = positions;
        vertexData.uvs = uvs;
        vertexData.indices = indices;
        vertexData.applyToMesh(mesh);

        // Create shader material
        const shaderMaterial = new ShaderMaterial(
            "veeArrowMaterial",
            scene,
            {
                vertex: "veeArrow",
                fragment: "veeArrow",
            },
            {
                attributes: ["position", "uv"],
                uniforms: ["worldViewProjection", "arrowColor", "lineWidth"],
            },
        );

        // Set uniforms
        const colorObj = Color3.FromHexString(color);
        shaderMaterial.setVector3("arrowColor", new Vector3(colorObj.r, colorObj.g, colorObj.b));
        shaderMaterial.setFloat("lineWidth", 0.10); // Doubled from 0.05 to 0.10

        // Enable alpha blending
        shaderMaterial.alpha = 1.0;
        shaderMaterial.alphaMode = Engine.ALPHA_COMBINE;
        shaderMaterial.backFaceCulling = false;

        mesh.material = shaderMaterial;

        // Enable cylindrical billboard mode (Y-axis rotation only)
        // Faces camera horizontally while showing vertical foreshortening
        mesh.billboardMode = Mesh.BILLBOARDMODE_Y;

        // Scale mesh to match arrow size
        mesh.scaling = new Vector3(size / 2, size / 2, 1);

        return mesh;
    }

    // Crow arrow - three-pronged fork (crow's foot)
    private static createCrowArrow(length: number, width: number, color: string, scene: Scene): Mesh {
        const angle = EDGE_CONSTANTS.ARROW_CROW_FORK_ANGLE * (Math.PI / 180);
        const spread = Math.tan(angle) * length;

        // Three prongs radiating from the tip
        const points = [
            // Left prong
            new Vector3(-spread, 0, -length),
            new Vector3(0, 0, 0),
            // Center prong
            new Vector3(0, 0, -length),
            new Vector3(0, 0, 0),
            // Right prong
            new Vector3(spread, 0, -length),
        ];

        const mesh = CreateGreasedLine(
            "lines",
            {
                points,
            },
            {
                color: Color3.FromHexString(color),
                width: width * 0.15, // Proportional line width
            },
            scene,
        );

        // Ensure material color is set correctly for instancing
        if (mesh.material) {
            const material = mesh.material as StandardMaterial;
            const colorObj = Color3.FromHexString(color);
            material.diffuseColor = colorObj;
            material.emissiveColor = colorObj;
            material.disableLighting = true;
        }

        return mesh as Mesh;
    }
}
