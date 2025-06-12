import {Edge} from "./Edge";
import {Graph} from "./Graph";
import {Node} from "./Node";
import color from "color-string";
import convert from "color-convert";
import {z} from "zod/v4";

export type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;

export type PartiallyOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** ******** COMMON STYLES ***********/

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

const ColorStyle = z.string().pipe(z.transform(colorToHex));
// TODO ColorScheme

const TextType = z.enum([
    "plain",
    "markdown",
    "html",
]);

const TextLocation = z.enum([
    "top",
    "top-right",
    "top-left",
    "left",
    "center",
    "right",
    "bottom",
    "bottom-left",
    "bottom-right",
    "automatic",
]);

const TextBlockStyle = z.strictObject({
    enabled: z.boolean().default(false),
    font: z.string().default("Arial"),
    textPath: z.string().or(z.null()).default(null),
    style: z.string().or(z.null()).default(null),
    size: z.number().default(12),
    textType: TextType.default("markdown"),
    color: ColorStyle.default("#000000FF"),
    background: ColorStyle.default("white"),
    location: TextLocation.default("center"),
    margin: z.number().positive().default(5),
});

/** ******** NODE STYLE ***********/

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

export type NodeMeshFactoryType = typeof Node.defaultNodeMeshFactory;

export const NodeStyle = z.strictObject({
    appearance: z.strictObject({
        opacity: z.number().min(0).max(1).default(1),
        color: ColorStyle.default("#D3D3D3FF"),
        gradient: z.strictObject({
            colors: z.array(ColorStyle.default("#000000FF")).default([]),
            direction: z.number().min(0).max(360).default(180),
        }).prefault({}),
        flatShaded: z.boolean().default(false),
        image: z.url().or(z.null()).default(null),
        logo: z.string().or(z.null()).default(null),
        glow: z.strictObject({
            color: ColorStyle.or(z.null()).default(null),
            strength: z.number().positive().default(1),
        }).prefault({}),
        outline: z.strictObject({
            color: ColorStyle.or(z.null()).default(null),
            width: z.number().positive().default(1),
        }).prefault({}),
        wireframe: z.boolean().default(false),
        size: z.number().min(0).default(1),
        type: NodeShapes.default("icosphere"),
        // advanced
        pieChart: z.string().or(z.null()).default(null), // TODO
        shader: z.url().or(z.null()).default(null), // https://doc.babylonjs.com/features/featuresDeepDive/materials/shaders/
        bumpmap: z.url().or(z.null()).default(null),
        // refraction
        // reflection
        // custom mesh https://doc.babylonjs.com/features/featuresDeepDive/mesh/creation/custom/custom
        // import mesh https://doc.babylonjs.com/typedoc/functions/BABYLON.ImportMeshAsync
    }).prefault({}),
    label: TextBlockStyle.prefault({location: "top-left"}),
    tooltip: TextBlockStyle.prefault({location: "top-right"}),
    enabled: z.boolean().default(true),
    nodeMeshFactory: z.instanceof(Function).default(() => Node.defaultNodeMeshFactory),
    // nodeMeshFactory: z.custom<NodeMeshFactoryType>((val) => val instanceof Function).default(() => Node.defaultNodeMeshFactory),
}).prefault({});

export type NodeStyleConfig = z.infer<typeof NodeStyle>;
export type NodeStyleOpts = DeepPartial<NodeStyleConfig>;

/** ******** EDGE STYLES ***********/

const ArrowType = z.enum([
    // https://graphviz.org/docs/attr-types/arrowType/
    // https://manual.cytoscape.org/en/stable/Styles.html#available-shapes-and-line-styles
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
]);

const ArrowStyle = z.strictObject({
    type: ArrowType.default("normal"),
    size: z.number().positive().default(1),
    color: ColorStyle.default("white"),
    opacity: z.number().min(0).max(1).default(1),
    text: TextBlockStyle.prefault({location: "top"}),
});

const LineType = z.enum([
    // https://manual.cytoscape.org/en/stable/Styles.html#available-shapes-and-line-styles
    "solid",
    "dash",
    "dash-dot",
    "dots",
    "equal-dash",
    "sinewave",
    "zigzag",
]);

const LineStyle = z.strictObject({
    type: LineType.default("solid"),
    animationSpeed: z.number().min(0).default(0.1),
    width: z.number().positive().default(0.25),
    color: ColorStyle.default("#FFFFFFFF"),
    opacity: z.number().min(0).max(1).default(1),
    bezier: z.boolean().default(false),
}).prefault({});

export type EdgeMeshFactory = typeof Edge.defaultEdgeMeshFactory;

export const EdgeStyle = z.strictObject({
    arrowHead: ArrowStyle.prefault({type: "none"}),
    arrowTail: ArrowStyle.prefault({type: "none"}),
    line: LineStyle,
    label: TextBlockStyle.prefault({location: "top"}),
    tooltip: TextBlockStyle.prefault({location: "bottom"}),
    edgeMeshFactory: z.instanceof(Function).default(() => Edge.defaultEdgeMeshFactory),
}).prefault({});

export type EdgeStyleConfig = z.infer<typeof EdgeStyle>;
export type EdgeStyleOpts = DeepPartial<EdgeStyleConfig>;

/** ******** STYLE TEMPLATE ***********/

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
export type StyleLayerType = z.infer<typeof StyleLayer>

/** * BEHAVIOR ***/
export const NodeBehaviorOpts = z.strictObject({
    pinOnDrag: z.boolean().default(true),
}).prefault({});

/** * GRAPH TYPES ***/
export const NodeId = z.string().or(z.number());
export type NodeIdType = z.infer<typeof NodeId>

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
    nodeWeightPath: z.string().or(z.null()).default(null),
    nodeTimePath: z.string().or(z.null()).default(null),
    edgeSrcIdPath: z.string().default("src"),
    edgeDstIdPath: z.string().default("dst"),
    edgeWeightPath: z.string().or(z.null()).default(null),
    edgeTimePath: z.string().or(z.null()).default(null),
}).prefault({});

export type NodeObjectType = z.infer<typeof NodeObject>
export type EdgeObjectType = z.infer<typeof EdgeObject>
export type GraphKnownFieldsType = z.infer<typeof GraphKnownFields>
export type GraphConfig = z.infer<typeof GraphOpts>;
export type GraphOptsType = DeepPartial<GraphConfig>

export const GraphStyleOpts = z.strictObject({
    skybox: z.string().default(""),
    node: NodeStyle,
    edge: EdgeStyle,
    startingCameraDistance: z.number().default(30),
}).prefault({});

export type FetchNodesFn = (nodeIds: Set<NodeIdType>, g: Graph) => Set<NodeObjectType>;
export type FetchEdgesFn = (node: Node, g: Graph) => Set<EdgeObjectType>;

export const GraphBehaviorOpts = z.strictObject({
    node: NodeBehaviorOpts,
    fetchNodes: z.optional(z.instanceof(Function)),
    fetchEdges: z.optional(z.instanceof(Function)),
}).prefault({});

export const GraphLayoutOpts = z.strictObject({
    dimensions: z.number().min(2).max(3).default(3),
    type: z.string().default("ngraph"),
    preSteps: z.number().default(0),
    stepMultiplier: z.number().default(1),
    minDelta: z.number().default(0),
}).prefault({});

export const GraphStyleTemplateVersions = z.enum([
    "1.0.0",
]);

export const GraphBackground = z.discriminatedUnion("backgroundType", [
    z.strictObject({backgroundType: "color", color: z.string().pipe(z.transform(colorToHex)).default("#D3D3D3FF")}),
    z.strictObject({backgroundType: "skybox", skyboxUrl: z.url({
        protocol: /^https?$/,
        // @ts-expect-error it exists in the source, not sure why TS complains about .domain not existing
        hostname: z.regexes.domain,
    })}),
]);

// export const GraphStyleTemplate = z.strictObject({
//     version: GraphStyleTemplateVersions,
//     graph: z.strictObject({
//         layout: z.string(),
//         // background: GraphBackground.default(GraphBackground.parse({})),
//         knownFields: GraphKnownFields.default(GraphKnownFields.parse({})),
//     }),
//     layers: GraphStyleOpts,
// }).prefault({});

/** * CONFIG ***/
export const GraphOpts = z.strictObject({
    // data: GraphData.optional(),
    style: GraphStyleOpts,
    behavior: GraphBehaviorOpts,
    layout: GraphLayoutOpts,
    knownFields: GraphKnownFields,
});

export function getConfig(o: object = {}): GraphConfig {
    return GraphOpts.parse(o);
}
