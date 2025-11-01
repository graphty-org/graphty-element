import {
    AbstractMesh,
    Color3,
    Engine,
    GreasedLineBaseMesh,
    GreasedLineMeshColorMode,
    GreasedLineMeshWidthDistribution,
    GreasedLineTools,
    Mesh,
    MeshBuilder,
    RawTexture,
    type Scene,
    StandardMaterial,
    Vector3,
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

        // All arrow types use cache normally (StandardMaterial supports cloning)
        const cacheKey = `edge-arrowhead-style-${styleId}`;
        return cache.get(cacheKey, () => {
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
        });
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
        const material = mesh.material as StandardMaterial;
        if (material) {
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
        const material = mesh.material as StandardMaterial;
        if (material) {
            const colorObj = Color3.FromHexString(color);
            material.diffuseColor = colorObj;
            material.emissiveColor = colorObj;
            material.disableLighting = true;
        }

        return mesh as Mesh;
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

    // Dot arrow - 2D filled circle using thin disc mesh
    // Creates a thin cylinder (disc) that rotates with edge perspective (no billboard mode)
    // Uses StandardMaterial with emissive color to match GreasedLine's self-illuminated appearance
    private static createDotArrow(length: number, width: number, color: string, scene: Scene): Mesh {
        // Create a 2D filled circle using a disc (cylinder with height=0)
        // This will rotate with the edge perspective (no billboard mode)
        const radius = length / 2;

        const mesh = MeshBuilder.CreateCylinder(
            "dot-arrow",
            {
                diameter: radius * 2,
                height: 0.01, // Very thin disc (nearly 2D)
                tessellation: 32, // Smooth circle
            },
            scene,
        );

        // Create material with the specified color
        const material = new StandardMaterial("dot-arrow-mat", scene);
        material.diffuseColor = Color3.FromHexString(color);
        material.emissiveColor = Color3.FromHexString(color); // Self-illuminated like GreasedLine
        material.disableLighting = true; // Match GreasedLine's unlit appearance
        material.backFaceCulling = false; // Visible from both sides

        mesh.material = material;

        // Rotate to face along Z axis (default cylinder is along Y axis)
        // This matches the orientation that edge arrows use
        mesh.rotation.x = Math.PI / 2;

        return mesh;
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
        const material = mesh.material as StandardMaterial;
        if (material) {
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
        const material = mesh.material as StandardMaterial;
        if (material) {
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
        const material = mesh.material as StandardMaterial;
        if (material) {
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
