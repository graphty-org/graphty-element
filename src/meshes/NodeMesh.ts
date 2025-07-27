import {
    AbstractMesh,
    Color3,
    Mesh,
    MeshBuilder,
    Scene,
    StandardMaterial,
} from "@babylonjs/core";

import type {NodeStyleConfig} from "../config";
import {PolyhedronType, SHAPE_CONSTANTS} from "../constants/meshConstants";
import type {MeshCache} from "./MeshCache";

export interface NodeMeshOptions {
    styleId: string;
    is2D: boolean;
    size: number;
}

export interface NodeMeshCreateOptions {
    shape?: NodeStyleConfig["shape"];
    texture?: NodeStyleConfig["texture"];
    effect?: NodeStyleConfig["effect"];
}

type ShapeCreator = (size: number, scene?: Scene) => Mesh;

interface ColorObject {
    colorType: string;
    value?: string;
    opacity?: number;
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class NodeMesh {
    private static shapeCreators = new Map<string, ShapeCreator>();

    static {
        NodeMesh.registerShapeCreator("box", (size) => NodeMesh.createBox(size));
        NodeMesh.registerShapeCreator("sphere", (size) => NodeMesh.createSphere(size));
        NodeMesh.registerShapeCreator("cylinder", (size, scene) => NodeMesh.createCylinder(size, scene));
        NodeMesh.registerShapeCreator("cone", (size, scene) => NodeMesh.createCone(size, scene));
        NodeMesh.registerShapeCreator("capsule", (size, scene) => NodeMesh.createCapsule(size, scene));
        NodeMesh.registerShapeCreator("torus", (size, scene) => NodeMesh.createTorus(size, scene));
        NodeMesh.registerShapeCreator("torus-knot", (size, scene) => NodeMesh.createTorusKnot(size, scene));

        NodeMesh.registerShapeCreator("tetrahedron", (size, scene) => NodeMesh.createPolyhedron(PolyhedronType.TETRAHEDRON, size, scene));
        NodeMesh.registerShapeCreator("octahedron", (size, scene) => NodeMesh.createPolyhedron(PolyhedronType.OCTAHEDRON, size, scene));
        NodeMesh.registerShapeCreator("dodecahedron", (size, scene) => NodeMesh.createPolyhedron(PolyhedronType.DODECAHEDRON, size, scene));
        NodeMesh.registerShapeCreator("icosahedron", (size, scene) => NodeMesh.createPolyhedron(PolyhedronType.ICOSAHEDRON, size, scene));
        NodeMesh.registerShapeCreator("rhombicuboctahedron", (size, scene) => NodeMesh.createPolyhedron(PolyhedronType.RHOMBICUBOCTAHEDRON, size, scene));
        NodeMesh.registerShapeCreator("triangular-prism", (size, scene) => NodeMesh.createPolyhedron(PolyhedronType.TRIANGULAR_PRISM, size, scene));
        NodeMesh.registerShapeCreator("pentagonal-prism", (size, scene) => NodeMesh.createPolyhedron(PolyhedronType.PENTAGONAL_PRISM, size, scene));
        NodeMesh.registerShapeCreator("hexagonal-prism", (size, scene) => NodeMesh.createPolyhedron(PolyhedronType.HEXAGONAL_PRISM, size, scene));
        NodeMesh.registerShapeCreator("square-pyramid", (size, scene) => NodeMesh.createPolyhedron(PolyhedronType.SQUARE_PYRAMID, size, scene));
        NodeMesh.registerShapeCreator("pentagonal-pyramid", (size, scene) => NodeMesh.createPolyhedron(PolyhedronType.PENTAGONAL_PYRAMID, size, scene));
        NodeMesh.registerShapeCreator("triangular-dipyramid", (size, scene) => NodeMesh.createPolyhedron(PolyhedronType.TRIANGULAR_DIPYRAMID, size, scene));
        NodeMesh.registerShapeCreator("pentagonal-dipyramid", (size, scene) => NodeMesh.createPolyhedron(PolyhedronType.PENTAGONAL_DIPYRAMID, size, scene));
        NodeMesh.registerShapeCreator("elongated-square-dipyramid", (size, scene) => NodeMesh.createPolyhedron(PolyhedronType.ELONGATED_SQUARE_DIPYRAMID, size, scene));
        NodeMesh.registerShapeCreator("elongated-pentagonal-dipyramid", (size, scene) => NodeMesh.createPolyhedron(PolyhedronType.ELONGATED_PENTAGONAL_DIPYRAMID, size, scene));
        NodeMesh.registerShapeCreator("elongated-pentagonal-cupola", (size, scene) => NodeMesh.createPolyhedron(PolyhedronType.ELONGATED_PENTAGONAL_CUPOLA, size, scene));

        NodeMesh.registerShapeCreator("goldberg", (size, scene) => NodeMesh.createGoldberg(size, scene));
        NodeMesh.registerShapeCreator("icosphere", (size, scene) => NodeMesh.createIcoSphere(size, scene));
        NodeMesh.registerShapeCreator("geodesic", (size, scene) => NodeMesh.createGeodesic(size, scene));
        
        // Also register underscore versions for backward compatibility
        NodeMesh.registerShapeCreator("triangular_prism", (size, scene) => NodeMesh.createPolyhedron(PolyhedronType.TRIANGULAR_PRISM, size, scene));
        NodeMesh.registerShapeCreator("pentagonal_prism", (size, scene) => NodeMesh.createPolyhedron(PolyhedronType.PENTAGONAL_PRISM, size, scene));
        NodeMesh.registerShapeCreator("hexagonal_prism", (size, scene) => NodeMesh.createPolyhedron(PolyhedronType.HEXAGONAL_PRISM, size, scene));
        NodeMesh.registerShapeCreator("square_pyramid", (size, scene) => NodeMesh.createPolyhedron(PolyhedronType.SQUARE_PYRAMID, size, scene));
        NodeMesh.registerShapeCreator("pentagonal_pyramid", (size, scene) => NodeMesh.createPolyhedron(PolyhedronType.PENTAGONAL_PYRAMID, size, scene));
        NodeMesh.registerShapeCreator("triangular_dipyramid", (size, scene) => NodeMesh.createPolyhedron(PolyhedronType.TRIANGULAR_DIPYRAMID, size, scene));
        NodeMesh.registerShapeCreator("pentagonal_dipyramid", (size, scene) => NodeMesh.createPolyhedron(PolyhedronType.PENTAGONAL_DIPYRAMID, size, scene));
        NodeMesh.registerShapeCreator("elongated_square_dipyramid", (size, scene) => NodeMesh.createPolyhedron(PolyhedronType.ELONGATED_SQUARE_DIPYRAMID, size, scene));
        NodeMesh.registerShapeCreator("elongated_pentagonal_dipyramid", (size, scene) => NodeMesh.createPolyhedron(PolyhedronType.ELONGATED_PENTAGONAL_DIPYRAMID, size, scene));
        NodeMesh.registerShapeCreator("elongated_pentagonal_cupola", (size, scene) => NodeMesh.createPolyhedron(PolyhedronType.ELONGATED_PENTAGONAL_CUPOLA, size, scene));
    }

    static create(
        cache: MeshCache,
        options: NodeMeshOptions,
        createOptions: NodeMeshCreateOptions,
        scene?: Scene,
    ): AbstractMesh {
        const cacheKey = `node-style-${options.styleId}-${options.is2D ? "2d" : "3d"}`;

        return cache.get(cacheKey, () => {
            const mesh = this.createMeshWithoutCache(options, createOptions, scene);
            const material = this.createMaterial(createOptions, options.is2D, scene);
            mesh.material = material;

            if (createOptions.texture?.color && typeof createOptions.texture.color === "object" && "opacity" in createOptions.texture.color) {
                mesh.visibility = createOptions.texture.color.opacity ?? 1;
            }

            return mesh;
        });
    }

    static createMeshWithoutCache(
        options: NodeMeshOptions,
        createOptions: NodeMeshCreateOptions,
        scene?: Scene,
    ): Mesh {
        if (!createOptions.shape?.type) {
            throw new TypeError("shape with type required to create mesh");
        }

        const creator = this.shapeCreators.get(createOptions.shape.type);
        if (!creator) {
            throw new TypeError(`unknown shape: ${createOptions.shape.type}`);
        }

        const size = createOptions.shape.size ?? options.size;
        return creator(size, scene);
    }

    private static createMaterial(
        createOptions: NodeMeshCreateOptions,
        is2D: boolean,
        scene?: Scene,
    ): StandardMaterial {
        const mat = new StandardMaterial("defaultMaterial", scene);

        const color3 = this.extractColor(createOptions.texture?.color);

        if (color3) {
            if (is2D) {
                mat.disableLighting = true;
                mat.emissiveColor = color3;
            } else {
                mat.diffuseColor = color3;
            }
        }

        mat.wireframe = createOptions.effect?.wireframe ?? false;

        mat.freeze();
        return mat;
    }

    private static extractColor(color: unknown): Color3 | undefined {
        if (typeof color === "string") {
            return Color3.FromHexString(color === "##FFFFFF" ? "#FFFFFF" : color);
        }

        if (typeof color === "object" && color !== null) {
            const colorObj = color as ColorObject;
            if (colorObj.colorType === "solid" && colorObj.value) {
                return Color3.FromHexString(colorObj.value);
            }
        }

        return undefined;
    }

    static registerShapeCreator(type: string, creator: ShapeCreator): void {
        this.shapeCreators.set(type, creator);
    }

    private static createBox(size: number, scene?: Scene): Mesh {
        return MeshBuilder.CreateBox("box", {size}, scene);
    }

    private static createSphere(size: number, scene?: Scene): Mesh {
        return MeshBuilder.CreateSphere("sphere", {diameter: size}, scene);
    }

    private static createCylinder(size: number, scene?: Scene): Mesh {
        const actualSize = size;
        return MeshBuilder.CreateCylinder("cylinder", {
            height: actualSize * SHAPE_CONSTANTS.GOLDEN_RATIO,
            diameter: actualSize,
        }, scene);
    }

    private static createCone(size: number, scene?: Scene): Mesh {
        const actualSize = size;
        return MeshBuilder.CreateCylinder("cylinder", {
            height: actualSize * SHAPE_CONSTANTS.GOLDEN_RATIO,
            diameterTop: 0,
            diameterBottom: actualSize,
        }, scene);
    }

    private static createCapsule(_size: number, scene?: Scene): Mesh {
        return MeshBuilder.CreateCapsule("capsule", {}, scene);
    }

    private static createTorus(_size: number, scene?: Scene): Mesh {
        return MeshBuilder.CreateTorus("torus", {}, scene);
    }

    private static createTorusKnot(size: number, scene?: Scene): Mesh {
        const actualSize = size;
        return MeshBuilder.CreateTorusKnot("tk", {
            radius: actualSize * SHAPE_CONSTANTS.TORUSKNOT_RADIUS_MULTIPLIER,
            tube: actualSize * SHAPE_CONSTANTS.TORUSKNOT_TUBE_MULTIPLIER,
            radialSegments: SHAPE_CONSTANTS.TORUSKNOT_RADIAL_SEGMENTS,
        }, scene);
    }

    private static createPolyhedron(type: PolyhedronType, size: number, scene?: Scene): Mesh {
        return MeshBuilder.CreatePolyhedron("polyhedron", {
            size,
            type: type,
        }, scene);
    }

    private static createGoldberg(size: number, scene?: Scene): Mesh {
        return MeshBuilder.CreateGoldberg("goldberg", {
            size,
        }, scene);
    }

    private static createIcoSphere(size: number, scene?: Scene): Mesh {
        const actualSize = size;
        return MeshBuilder.CreateIcoSphere("icosphere", {
            radius: actualSize * SHAPE_CONSTANTS.ICOSPHERE_RADIUS_MULTIPLIER,
        }, scene);
    }

    private static createGeodesic(size: number, scene?: Scene): Mesh {
        return MeshBuilder.CreateGeodesic("geodesic", {
            size,
        }, scene);
    }
}
