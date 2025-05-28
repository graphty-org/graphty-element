import {DeepRequired} from "./util";
import {Edge} from "./Edge";
import type {Graph} from "./Graph";
import type {GraphEngineNames} from "./engine/GraphEngine";
import {Node} from "./Node";
import color from "color-string";
import convert from "color-convert";
// @ts-expect-error module is missing typescript definitions
import defaultsDeep from "lodash.defaultsdeep";
import {z} from "zod/v4";

/** * DEFAULTS ***/

export const defaultNodeStyleOpts: NodeStyleConfig = {
    size: 1,
    opacity: 1,
    wireframe: false,
    color: "lightgrey",
    shape: "icosphere",
    nodeMeshFactory: Node.defaultNodeMeshFactory,
    label: false,
};

export const defaultEdgeStyleOpts: EdgeStyleConfig = {
    type: "moving",
    color: "white",
    width: 0.25,
    arrowCap: false,
    movingLineOpts: {
        baseColor: "lightgrey",
    },
    edgeMeshFactory: Edge.defaultEdgeMeshFactory,
};

export const defaultGraphOpts: GraphConfig = {
    style: {
        node: defaultNodeStyleOpts,
        edge: defaultEdgeStyleOpts,
        skybox: "",
        startingCameraDistance: 30,
    },
    behavior: {
        node: {
            pinOnDrag: true,
        },
        fetchNodes: () => new Set(),
        fetchEdges: () => new Set(),
    },
    engine: {
        type: "ngraph",
        stepMultiplier: 1,
        preSteps: 0,
        minDelta: 0,
    },
};

export function getConfig(o: GraphOpts): GraphConfig {
    return defaultsDeep({}, o, defaultGraphOpts);
}

// shape:
/** * STYLES ***/
export const NodeShapes = z.enum([
    "box",
    "sphere",
    "cylinder",
    "cone",
    "capsule",
    "torus-knot",
    "tetrahedron",
    "octahedron",
    "dodecahedron",
    "icosahedron",
    "rhombicuboctahedron",
    "triangular_prism",
    "pentagonal_prism",
    "hexagonal_prism",
    "square_pyramid",
    "pentagonal_pyramid",
    "triangular_dipyramid",
    "pentagonal_dipyramid",
    "elongated_square_dypyramid",
    "elongated_pentagonal_dipyramid",
    "elongated_pentagonal_cupola",
    "goldberg",
    "icosphere",
    "geodesic",
]);

export function colorToHex(s: string): string | undefined {
    const c = color.get(s);
    console.log("c", c);
    if (c === null) {
        console.warn("invalid color:", s);
        return undefined;
    }

    let hex: string;
    switch (c.model) {
    case "rgb":
        hex = convert.rgb.hex(c.value[0], c.value[1], c.value[2]);
        break;
    case "hsl":
        hex = convert.hsl.hex(c.value[0], c.value[1], c.value[2]);
        break;
    case "hwb":
        hex = convert.hwb.hex(c.value[0], c.value[1], c.value[2]);
        break;
    default:
        console.warn("unknown color model", c.model);
        return undefined;
    }
    const alpha: number = c.value[3] ?? 1;
    console.log("alpha", alpha);
    const alphaStr: string = Math.round(alpha * 255).toString(16).padStart(2, "0").toUpperCase();
    console.log("alphaStr", alphaStr);

    return `#${hex}${alphaStr}`;
}

export const NodeStyle = z.strictObject({
    size: z.optional(z.number().min(0)),
    opacity: z.optional(z.number().min(0).max(1)),
    wireframe: z.optional(z.boolean()),
    color: z.optional(z.string().pipe(z.transform(colorToHex))),
    label: z.optional(z.boolean()),
    shape: z.optional(NodeShapes),
    // nodeMeshFactory?: NodeMeshFactory;
});

export const EdgeStyle = z.strictObject({});

export const AppliedNodeStyle = z.strictObject({
    selector: z.string(),
    style: NodeStyle,
});

export const AppliedEdgeStyle = z.strictObject({
    selector: z.string(),
    style: EdgeStyle,
});

export const StyleLayer = z.strictObject({
    node: AppliedNodeStyle,
    edge: AppliedEdgeStyle,
})
    .partial()
    .refine(
        (data) => !!data.node || !!data.edge,
        "StyleLayer requires either 'node' or 'edge'.",
    );

export const StyleSchema = z.array(StyleLayer);
export type StyleSchemaType = z.infer<typeof StyleSchema>

/** * GRAPH TYPES ***/

export interface GraphOpts {
    style?: GraphStyleOpts,
    behavior?: GraphBehaviorOpts,
    engine?: GraphEngineOpts,
}

export type GraphConfig = DeepRequired<GraphOpts>;

export interface NodeObject {
    id: NodeIdType,
    metadata: object,
}

export interface EdgeObject {
    src: NodeIdType,
    dst: NodeIdType,
    metadata: object,
}

export type FetchNodes = (nodeIds: Set<NodeIdType>, g: Graph) => Set<NodeObject>;
export type FetchEdges = (node: Node, g: Graph) => Set<EdgeObject>;

export interface GraphStyleOpts {
    skybox?: string;
    node?: NodeStyleOpts;
    edge?: EdgeStyleOpts;
    startingCameraDistance: number;
}

export interface GraphBehaviorOpts {
    node?: NodeBehaviorOpts;
    fetchNodes?: FetchNodes;
    fetchEdges?: FetchEdges;
}

export interface GraphEngineOpts {
    type?: GraphEngineNames,
    preSteps?: number,
    stepMultiplier?: number,
    minDelta?: number,
}

/** * NODE TYPES ***/
export interface NodeObject {
    id: NodeIdType,
    metadata: object,
}

export type NodeIdType = string | number;
export type NodeMeshFactory = typeof Node.defaultNodeMeshFactory;

export interface NodeStyleOpts {
    size?: number;
    opacity?: number;
    wireframe?: boolean;
    color?: string;
    shape?: "box" | "sphere" | "cylinder" | "cone" | "capsule" | "torus-knot" | "tetrahedron" | "octahedron" | "dodecahedron" | "icosahedron" | "rhombicuboctahedron" | "triangular_prism" | "pentagonal_prism" | "hexagonal_prism" | "square_pyramid" | "pentagonal_pyramid" | "triangular_dipyramid" | "pentagonal_dipyramid" | "elongated_square_dypyramid" | "elongated_pentagonal_dipyramid" | "elongated_pentagonal_cupola" | "goldberg" | "icosphere" | "geodesic";
    nodeMeshFactory?: NodeMeshFactory;
    label?: boolean;
}

export interface NodeBehaviorOpts {
    pinOnDrag: boolean;
}

export type NodeStyleConfig = DeepRequired<NodeStyleOpts>;

/** * EDGE TYPES ***/
export interface EdgeObject {
    source: NodeIdType,
    target: NodeIdType,
    metadata: object,
}

export interface MovingLineOpts {
    baseColor?: string;
}

export interface EdgeStyleOpts {
    type?: "plain" | "moving";
    arrowCap?: boolean;
    color?: string;
    width?: number;
    movingLineOpts?: MovingLineOpts;
    edgeMeshFactory?: EdgeMeshFactory;
}

export type EdgeStyleConfig = DeepRequired<EdgeStyleOpts>;
export type EdgeMeshFactory = typeof Edge.defaultEdgeMeshFactory;

/** * DATA LOADING TYPES ***/

const defaultJsonDataOpts = {
    nodeListProp: "nodes",
    edgeListProp: "edges",
    nodeIdProp: "id",
    edgeSrcIdProp: "src",
    edgeDstIdProp: "dst",
};

export interface LoadJsonDataOpts {
    nodeListProp?: string;
    edgeListProp?: string;
    nodeIdProp?: string;
    edgeSrcIdProp?: string;
    edgeDstIdProp?: string;
    fetchOpts?: Parameters<typeof fetch>[1];
}

type LoadJsonDataConfig = DeepRequired<LoadJsonDataOpts>;

export function getJsonDataOpts(o: LoadJsonDataOpts): LoadJsonDataConfig {
    return defaultsDeep({}, o, defaultJsonDataOpts);
}
