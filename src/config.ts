import {Edge} from "./Edge";
import {Graph} from "./Graph";
import {Node} from "./Node";
import color from "color-string";
import convert from "color-convert";
import {z} from "zod/v4";

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
    const alphaStr: string = Math.round(alpha * 255).toString(16).padStart(2, "0").toUpperCase();

    return `#${hex}${alphaStr}`;
}

export const NodeStyleOpts = z.strictObject({
    size: z.number().min(0).default(1),
    opacity: z.number().min(0).max(1).default(1),
    wireframe: z.boolean().default(false),
    color: z.string().pipe(z.transform(colorToHex)).default("#D3D3D3FF"),
    label: z.boolean().default(false),
    shape: NodeShapes.default("icosphere"),
    enabled: z.boolean().default(true),
    nodeMeshFactory: z.instanceof(Function).default(() => Node.defaultNodeMeshFactory),
});

export const MovingLineOpts = z.strictObject({
    baseColor: z.string().default("#D3D3D3FF"),
});

const EdgeType = z.enum([
    "plain",
    "moving",
]);

export const EdgeStyleOpts = z.strictObject({
    type: EdgeType.default("moving"),
    arrowCap: z.boolean().default(false),
    color: z.string().pipe(z.transform(colorToHex)).default("#FFFFFFFF"),
    width: z.number().default(0.25),
    movingLineOpts: MovingLineOpts.default(MovingLineOpts.parse({})),
    edgeMeshFactory: z.instanceof(Function).default(() => Edge.defaultEdgeMeshFactory),
});

export type EdgeStyleConfig = EdgeStyleOptsType;
export type EdgeMeshFactory = typeof Edge.defaultEdgeMeshFactory;

export const AppliedNodeStyle = z.strictObject({
    selector: z.string(),
    style: NodeStyleOpts,
});

export const AppliedEdgeStyle = z.strictObject({
    selector: z.string(),
    style: EdgeStyleOpts,
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

// style types
export type StyleSchemaType = z.infer<typeof StyleSchema>
export type StyleLayerType = z.infer<typeof StyleLayer>
export type NodeStyleOptsType = z.infer<typeof NodeStyleOpts>
export type EdgeStyleOptsType = z.infer<typeof EdgeStyleOpts>

/** * BEHAVIOR ***/
export const NodeBehaviorOpts = z.strictObject({
    pinOnDrag: z.boolean().default(true),
});

/** * GRAPH TYPES ***/
export const NodeId = z.string().or(z.number());
export type NodeIdType = z.infer<typeof NodeId>
export type NodeMeshFactory = typeof Node.defaultNodeMeshFactory;

export const NodeObject = z.object({
    id: NodeId,
    metadata: z.object(),
});

export const EdgeObject = z.object({
    src: NodeId,
    dst: NodeId,
    metadata: z.object(),
});

export const GraphKnownFields = z.object({
    nodeIdPath: z.string().default("id"),
    edgeSrcPath: z.string().default("src"),
    edgeDstPath: z.string().default("dst"),
});

export type NodeObjectType = z.infer<typeof NodeObject>
export type EdgeObjectType = z.infer<typeof EdgeObject>
export type GraphOptsType = z.infer<typeof GraphOpts>
export type GraphConfig = GraphOptsType;

export const GraphStyleOpts = z.strictObject({
    skybox: z.string().default(""),
    node: NodeStyleOpts.default(NodeStyleOpts.parse({})),
    edge: EdgeStyleOpts.default(EdgeStyleOpts.parse({})),
    startingCameraDistance: z.number().default(30),
});

export type FetchNodesFn = (nodeIds: Set<NodeIdType>, g: Graph) => Set<NodeObjectType>;
export type FetchEdgesFn = (node: Node, g: Graph) => Set<EdgeObjectType>;

export const GraphBehaviorOpts = z.strictObject({
    node: NodeBehaviorOpts.default(NodeBehaviorOpts.parse({})),
    fetchNodes: z.optional(z.instanceof(Function)),
    fetchEdges: z.optional(z.instanceof(Function)),
});

export const GraphEngineNames = z.enum([
    "ngraph",
    "d3",
]);

export const GraphEngineOpts = z.strictObject({
    type: GraphEngineNames.default("ngraph"),
    preSteps: z.number().default(0),
    stepMultiplier: z.number().default(1),
    minDelta: z.number().default(0),
});

// types
export type GraphEngineNamesType = z.infer<typeof GraphEngineNames>

/** * DATA LOADING TYPES ***/
export const LoadJsonDataOpts = z.strictObject({
    nodeListProp: z.string().default("nodes"),
    edgeListProp: z.string().default("edges"),
    nodeIdProp: z.string().default("id"),
    edgeSrcIdProp: z.string().default("src"),
    edgeDstIdProp: z.string().default("dst"),
    // fetchOpts?: Parameters<typeof fetch>[1];
    fetchOpts: z.object().default({}),
});

export type LoadJsonDataConfig = z.infer<typeof LoadJsonDataOpts>;

export function getJsonDataOpts(o: object = {}): LoadJsonDataConfig {
    return LoadJsonDataOpts.parse(o);
}

/** * CONFIG ***/
export const GraphOpts = z.strictObject({
    style: GraphStyleOpts.default(GraphStyleOpts.parse({})),
    behavior: GraphBehaviorOpts.default(GraphBehaviorOpts.parse({})),
    engine: GraphEngineOpts.default(GraphEngineOpts.parse({})),
    knownFields: GraphKnownFields.default(GraphKnownFields.parse({})),
});

export function getConfig(o: object = {}): GraphOptsType {
    return GraphOpts.parse(o);
}
