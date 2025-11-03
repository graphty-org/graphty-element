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
    Vector2,
    Vector3,
    VertexBuffer,
    VertexData,
} from "@babylonjs/core";
import {CreateGreasedLine} from "@babylonjs/core/Meshes/Builders/greasedLineBuilder";

import type {EdgeStyleConfig} from "../config";
import {EDGE_CONSTANTS} from "../constants/meshConstants";
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

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class EdgeMesh {
    private static readonly UNIT_VECTOR_POINTS = [0, 0, -0.5, 0, 0, 0.5];
    private static shadersRegistered = false;

    private static registerShaders(): void {
        if (this.shadersRegistered) {
            return;
        }

        // Register dot arrow vertex shader
        // Simple billboard shader - mesh billboard mode handles camera facing
        Effect.ShadersStore.dotArrowVertexShader = `
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

        // Register dot arrow fragment shader
        // SDF circle with hard edge for uniform color
        Effect.ShadersStore.dotArrowFragmentShader = `
precision highp float;

varying vec2 vUV;
uniform vec3 arrowColor;

void main() {
    // Center coordinates (-1 to +1)
    vec2 centered = vUV * 2.0 - 1.0;

    // SDF: distance from center
    float dist = length(centered);

    // Hard cutoff for uniform color (no semi-transparent edge pixels)
    if (dist > 1.0) {
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
        const width = this.calculateArrowWidth(options.width) * size;
        const length = this.calculateArrowLength(options.width) * size;

        // Mesh caching strategy:
        // - Billboard arrows (open-dot, sphere-dot, sphere, dot) can't be cached (need billboard per edge)
        // - Triangular arrows (normal, inverted, diamond, box) CAN be cached
        const centerBasedArrows = ["open-dot", "sphere-dot", "sphere", "dot"];
        const needsFreshMesh = centerBasedArrows.includes(options.type ?? "");

        const createMesh = (): Mesh => {
            let mesh: Mesh;

            // Route to specific arrow generator
            switch (options.type) {
                case "normal":
                    mesh = this.createNormalArrow(length, width, options.color, scene);
                    break;
                case "inverted":
                    mesh = this.createInvertedArrow(length, width, options.color, scene);
                    break;
                case "dot":
                    mesh = this.createDotArrow(length, width, options.color, scene);
                    break;
                case "open-dot":
                    mesh = this.createOpenDotArrow(length, width, options.color, scene);
                    break;
                case "sphere-dot":
                    mesh = this.createSphereDotArrow(length, width, options.color, scene);
                    break;
                case "sphere":
                    mesh = this.createSphereArrow(length, width, options.color, scene);
                    break;
                case "diamond":
                    mesh = this.createDiamondArrow(length, width, options.color, scene);
                    break;
                case "box":
                    mesh = this.createBoxArrow(length, width, options.color, scene);
                    break;
                default:
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

        // Other arrow types can use caching for performance
        const cacheKey = `edge-arrowhead-style-${styleId}`;
        return cache.get(cacheKey, createMesh);
    }

    private static createStaticLine(options: EdgeMeshOptions, style: EdgeStyleConfig, scene: Scene): GreasedLineBaseMesh {
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

        return mesh;
    }

    private static createAnimatedLine(
        options: EdgeMeshOptions,
        style: EdgeStyleConfig,
        scene: Scene,
    ): GreasedLineBaseMesh {
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

        return mesh;
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

    // Normal arrow using GreasedLineTools (always camera-facing)
    private static createNormalArrow(length: number, width: number, color: string, scene: Scene): Mesh {
        const cap = GreasedLineTools.GetArrowCap(
            new Vector3(0, 0, -length),
            new Vector3(0, 0, 1),
            length,
            width,
            width,
        );

        const mesh = CreateGreasedLine(
            "lines",
            {
                points: cap.points,
                widths: cap.widths,
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

    // Inverted arrow (points away from target) - wide base at surface, tip extends back along line
    private static createInvertedArrow(length: number, width: number, color: string, scene: Scene): Mesh {
        // After lookAt(nodeCenter), -Z points toward node (along line direction), +Z points away
        // Line comes from outside moving in -Z direction (toward node)
        //
        // Normal arrow: wide at -length (inside node), narrow at 0 (surface)
        // Inverted arrow: wide at 0 (surface), narrow at -length (back along line, inside node)
        //
        // Both arrows extend in -Z direction, but inverted has widths reversed
        const points = [
            new Vector3(0, 0, -length), // First point: tip at -length (back along line)
            new Vector3(0, 0, 0), // Second point: base at surface
        ];

        // Widths for first point (tip at -length): narrow, for second point (base at 0): wide
        const widths = [
            0,
            0, // First point widths (tip - narrow)
            width,
            width, // Second point widths (base - wide)
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

    // Dot arrow - shader-based filled circle billboard
    // Uses custom shaders to create a 2D circle that appears as part of the edge line
    // Implements perspective-correct billboarding like GreasedLine
    private static createDotArrow(length: number, width: number, color: string, scene: Scene): Mesh {
        // Register shaders if not already done
        this.registerShaders();

        // Circle radius: length/2 ensures it touches both line endpoint and node surface
        const radius = length / 2;

        // Create quad geometry for the billboard
        // Vertices form a square from -1 to +1 in XY plane
        const positions = [
            -1, -1, 0,  // Bottom-left
            1, -1, 0,   // Bottom-right
            1, 1, 0,    // Top-right
            -1, 1, 0,   // Top-left
        ];

        // UV coordinates for fragment shader (0 to 1)
        const uvs = [
            0, 0,  // Bottom-left
            1, 0,  // Bottom-right
            1, 1,  // Top-right
            0, 1,  // Top-left
        ];

        // Two triangles to form the quad
        const indices = [
            0, 1, 2,  // First triangle
            0, 2, 3,  // Second triangle
        ];

        // Create mesh with vertex data
        const mesh = new Mesh("dot-arrow", scene);
        const vertexData = new VertexData();
        vertexData.positions = positions;
        vertexData.uvs = uvs;
        vertexData.indices = indices;
        vertexData.applyToMesh(mesh);

        // Create shader material with simple uniforms
        const shaderMaterial = new ShaderMaterial(
            "dotArrowMaterial",
            scene,
            {
                vertex: "dotArrow",
                fragment: "dotArrow",
            },
            {
                attributes: ["position", "uv"],
                uniforms: ["worldViewProjection", "arrowColor"],
            },
        );

        // Set color uniform
        const colorObj = Color3.FromHexString(color);
        shaderMaterial.setVector3("arrowColor", new Vector3(colorObj.r, colorObj.g, colorObj.b));

        // Enable alpha blending for anti-aliased edges
        shaderMaterial.alpha = 1.0;
        shaderMaterial.alphaMode = Engine.ALPHA_COMBINE;
        shaderMaterial.backFaceCulling = false;

        mesh.material = shaderMaterial;

        // Enable billboard mode so the dot always faces the camera (like GreasedLine screen-space behavior)
        mesh.billboardMode = Mesh.BILLBOARDMODE_ALL;

        // Scale mesh to match arrow size
        // Quad is 2 units wide (-1 to +1), so scale by radius to get correct size
        mesh.scaling = new Vector3(radius, radius, 1);

        return mesh;
    }

    // Sphere arrow - creates a 3D sphere that appears as a filled circle from all angles
    private static createSphereArrow(length: number, width: number, color: string, scene: Scene): Mesh {
        // Use the arrow length as the diameter (much smaller than arrow width)
        const sphereDiameter = length * 2;

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
        // The sphere must fit between the edge endpoint and node surface
        // Edge endpoint is at (dstPoint - length), node surface is at dstPoint
        // Available space is exactly 'length'
        // Sphere diameter equals length so it touches both line and node perfectly
        const sphereDiameter = length;

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
        // Circle radius equals length/2 so diameter touches both line and node perfectly
        // Same sizing as sphere-dot for consistency
        const circleRadius = length / 2;

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

        // Enable billboard mode so circle always faces camera
        mesh.billboardMode = Mesh.BILLBOARDMODE_ALL;

        return mesh as Mesh;
    }

    // Diamond arrow - uses 3 points with varying widths to create filled diamond shape
    // Based on GetArrowCap technique: 2 points with widths create filled triangle
    // Diamond needs 3 points: tip (narrow), middle (wide), base (zero)
    private static createDiamondArrow(length: number, width: number, color: string, scene: Scene): Mesh {
        const diamondLength = length * 1.5;

        // Three points along the arrow direction: tip, middle, base
        const points = [
            new Vector3(0, 0, -diamondLength), // Tip (forward)
            new Vector3(0, 0, -diamondLength / 2), // Middle (widest part)
            new Vector3(0, 0, 0), // Base (at line connection)
        ];

        // Widths: [widthUp, widthDown, widthStartUp, widthStartDown] per point pair
        // First pair (tip to middle): start small, expand to max
        // Second pair (middle to base): start at max, taper to zero
        const widths = [
            width * 0.5,
            width * 0.5, // Tip width (up/down)
            width,
            width, // Middle width (max - up/down)
            0,
            0, // Base width (zero - connects to line)
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

    // Box arrow - modified GetArrowCap to create square instead of triangle
    private static createBoxArrow(length: number, width: number, color: string, scene: Scene): Mesh {
        // Create a box by keeping both points with the same width (parallel edges instead of tapered)
        const points = [
            new Vector3(0, 0, -length), // Back of box
            new Vector3(0, 0, 0), // Front of box at surface
        ];

        // Keep width constant for both points to create parallel edges (square)
        const widths = [
            width,
            width, // Back point: full width
            width,
            width, // Front point: full width (not tapered to 0)
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

    static calculateArrowWidth(lineWidth: number): number {
        return Math.max(EDGE_CONSTANTS.ARROW_CAP_WIDTH_MULTIPLIER * lineWidth, EDGE_CONSTANTS.ARROW_CAP_WIDTH_MINIMUM);
    }

    static calculateArrowLength(lineWidth: number): number {
        return Math.max(lineWidth, EDGE_CONSTANTS.ARROW_CAP_LENGTH_MINIMUM);
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
