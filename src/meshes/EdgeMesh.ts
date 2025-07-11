import {
    AbstractMesh,
    Color3,
    Engine,
    GreasedLineBaseMesh,
    GreasedLineMeshColorMode,
    GreasedLineMeshWidthDistribution,
    GreasedLineTools,
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

            return this.createStaticLine(options);
        });
    }

    static createArrowHead(
        cache: MeshCache,
        styleId: string,
        options: ArrowHeadOptions,
    ): AbstractMesh | null {
        if (!options.type || options.type === "none") {
            return null;
        }

        const cacheKey = `edge-arrowhead-style-${styleId}`;

        return cache.get(cacheKey, () => {
            const width = this.calculateArrowWidth(options.width);
            const length = this.calculateArrowLength(options.width);

            const cap = GreasedLineTools.GetArrowCap(
                new Vector3(0, 0, -length),
                new Vector3(0, 0, 1),
                length,
                width,
                width,
            );

            return CreateGreasedLine(
                "lines",
                {
                    points: cap.points,
                    widths: cap.widths,
                    widthDistribution: GreasedLineMeshWidthDistribution.WIDTH_DISTRIBUTION_START,
                },
                {
                    color: Color3.FromHexString(options.color),
                },
            );
        });
    }

    private static createStaticLine(options: EdgeMeshOptions): GreasedLineBaseMesh {
        return CreateGreasedLine(
            "edge-plain",
            {
                points: this.UNIT_VECTOR_POINTS,
            },
            {
                color: Color3.FromHexString(options.color),
                width: options.width,
            },
        );
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
        );

        this.applyAnimatedTexture(mesh, texture, scene, style.line?.animationSpeed);

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
