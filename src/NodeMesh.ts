import {
    AbstractMesh,
    Color3,
    Mesh,
    MeshBuilder,
    StandardMaterial,
} from "@babylonjs/core";

import type {NodeStyleConfig} from "./config";
import {PolyhedronType, SHAPE_CONSTANTS} from "./constants/meshConstants";
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

type ShapeCreator = (size: number) => Mesh;

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class NodeMesh {
    private static shapeCreators = new Map<string, ShapeCreator>();

    static {
        NodeMesh.registerShapeCreator("box", (size) => NodeMesh.createBox(size));
        NodeMesh.registerShapeCreator("sphere", (size) => NodeMesh.createSphere(size));
        NodeMesh.registerShapeCreator("cylinder", (size) => NodeMesh.createCylinder(size));
        NodeMesh.registerShapeCreator("cone", (size) => NodeMesh.createCone(size));
        NodeMesh.registerShapeCreator("capsule", (size) => NodeMesh.createCapsule(size));
        NodeMesh.registerShapeCreator("torus", (size) => NodeMesh.createTorus(size));
        NodeMesh.registerShapeCreator("torus-knot", (size) => NodeMesh.createTorusKnot(size));

        NodeMesh.registerShapeCreator("tetrahedron", (size) => NodeMesh.createPolyhedron(PolyhedronType.TETRAHEDRON, size));
        NodeMesh.registerShapeCreator("octahedron", (size) => NodeMesh.createPolyhedron(PolyhedronType.OCTAHEDRON, size));
        NodeMesh.registerShapeCreator("dodecahedron", (size) => NodeMesh.createPolyhedron(PolyhedronType.DODECAHEDRON, size));
        NodeMesh.registerShapeCreator("icosahedron", (size) => NodeMesh.createPolyhedron(PolyhedronType.ICOSAHEDRON, size));
        NodeMesh.registerShapeCreator("rhombicuboctahedron", (size) => NodeMesh.createPolyhedron(PolyhedronType.RHOMBICUBOCTAHEDRON, size));
        NodeMesh.registerShapeCreator("triangular-prism", (size) => NodeMesh.createPolyhedron(PolyhedronType.TRIANGULAR_PRISM, size));
        NodeMesh.registerShapeCreator("pentagonal-prism", (size) => NodeMesh.createPolyhedron(PolyhedronType.PENTAGONAL_PRISM, size));
        NodeMesh.registerShapeCreator("hexagonal-prism", (size) => NodeMesh.createPolyhedron(PolyhedronType.HEXAGONAL_PRISM, size));
        NodeMesh.registerShapeCreator("square-pyramid", (size) => NodeMesh.createPolyhedron(PolyhedronType.SQUARE_PYRAMID, size));
        NodeMesh.registerShapeCreator("pentagonal-pyramid", (size) => NodeMesh.createPolyhedron(PolyhedronType.PENTAGONAL_PYRAMID, size));
        NodeMesh.registerShapeCreator("triangular-dipyramid", (size) => NodeMesh.createPolyhedron(PolyhedronType.TRIANGULAR_DIPYRAMID, size));
        NodeMesh.registerShapeCreator("pentagonal-dipyramid", (size) => NodeMesh.createPolyhedron(PolyhedronType.PENTAGONAL_DIPYRAMID, size));
        NodeMesh.registerShapeCreator("elongated-square-dipyramid", (size) => NodeMesh.createPolyhedron(PolyhedronType.ELONGATED_SQUARE_DIPYRAMID, size));
        NodeMesh.registerShapeCreator("elongated-pentagonal-dipyramid", (size) => NodeMesh.createPolyhedron(PolyhedronType.ELONGATED_PENTAGONAL_DIPYRAMID, size));
        NodeMesh.registerShapeCreator("elongated-pentagonal-cupola", (size) => NodeMesh.createPolyhedron(PolyhedronType.ELONGATED_PENTAGONAL_CUPOLA, size));

        NodeMesh.registerShapeCreator("goldberg", (size) => NodeMesh.createGoldberg(size));
        NodeMesh.registerShapeCreator("icosphere", (size) => NodeMesh.createIcoSphere(size));
        NodeMesh.registerShapeCreator("geodesic", (size) => NodeMesh.createGeodesic(size));
    }

    static create(
        cache: MeshCache,
        options: NodeMeshOptions,
        createOptions: NodeMeshCreateOptions,
    ): AbstractMesh {
        const cacheKey = `node-style-${options.styleId}-${options.is2D ? "2d" : "3d"}`;

        return cache.get(cacheKey, () => {
            const mesh = this.createMeshWithoutCache(options, createOptions);
            const material = this.createMaterial(createOptions, options.is2D);
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
    ): Mesh {
        if (!createOptions.shape?.type) {
            throw new TypeError("shape with type required to create mesh");
        }

        const creator = this.shapeCreators.get(createOptions.shape.type);
        if (!creator) {
            throw new TypeError(`unknown shape: ${createOptions.shape.type}`);
        }

        const size = createOptions.shape.size ?? options.size;
        return creator(size);
    }

    private static createMaterial(
        createOptions: NodeMeshCreateOptions,
        is2D: boolean,
    ): StandardMaterial {
        const mat = new StandardMaterial("defaultMaterial");

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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const colorObj = color as any;
            if (colorObj.colorType === "solid" && colorObj.value) {
                return Color3.FromHexString(colorObj.value);
            }
        }

        return undefined;
    }

    static registerShapeCreator(type: string, creator: ShapeCreator): void {
        this.shapeCreators.set(type, creator);
    }

    private static createBox(size: number): Mesh {
        return MeshBuilder.CreateBox("box", {size});
    }

    private static createSphere(size: number): Mesh {
        return MeshBuilder.CreateSphere("sphere", {diameter: size});
    }

    private static createCylinder(size: number): Mesh {
        const actualSize = size;
        return MeshBuilder.CreateCylinder("cylinder", {
            height: actualSize * SHAPE_CONSTANTS.GOLDEN_RATIO,
            diameter: actualSize,
        });
    }

    private static createCone(size: number): Mesh {
        const actualSize = size;
        return MeshBuilder.CreateCylinder("cylinder", {
            height: actualSize * SHAPE_CONSTANTS.GOLDEN_RATIO,
            diameterTop: 0,
            diameterBottom: actualSize,
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private static createCapsule(_size: number): Mesh {
        return MeshBuilder.CreateCapsule("capsule", {});
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private static createTorus(_size: number): Mesh {
        return MeshBuilder.CreateTorus("torus", {});
    }

    private static createTorusKnot(size: number): Mesh {
        const actualSize = size;
        return MeshBuilder.CreateTorusKnot("tk", {
            radius: actualSize * SHAPE_CONSTANTS.TORUSKNOT_RADIUS_MULTIPLIER,
            tube: actualSize * SHAPE_CONSTANTS.TORUSKNOT_TUBE_MULTIPLIER,
            radialSegments: SHAPE_CONSTANTS.TORUSKNOT_RADIAL_SEGMENTS,
        });
    }

    private static createPolyhedron(type: PolyhedronType, size: number): Mesh {
        return MeshBuilder.CreatePolyhedron("polyhedron", {
            size,
            type: type,
        });
    }

    private static createGoldberg(size: number): Mesh {
        return MeshBuilder.CreateGoldberg("goldberg", {
            size,
        });
    }

    private static createIcoSphere(size: number): Mesh {
        const actualSize = size;
        return MeshBuilder.CreateIcoSphere("icosphere", {
            radius: actualSize * SHAPE_CONSTANTS.ICOSPHERE_RADIUS_MULTIPLIER,
        });
    }

    private static createGeodesic(size: number): Mesh {
        return MeshBuilder.CreateGeodesic("geodesic", {
            size,
        });
    }
}
