import {Edge} from "./Edge";
import {Graph} from "./Graph";
import {Node} from "./Node";
import Color from "colorjs.io";
import {z} from "zod/v4";
// import * as z4 from "zod/v4/core";

export type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;

export type PartiallyOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** ******** COMMON STYLES ***********/

export function colorToHex(s: string): string | undefined {
    const color = new Color(s);
    let hex = color.to("srgb").toString({format: "hex"}).toUpperCase();
    if (hex.length === 4) {
        // XXX: BabylonJS only likes the long format of hex strings
        hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
    }

    return hex;
}

const ColorStyle = z.string().transform(colorToHex);
const AdvancedColorStyle = z.discriminatedUnion("colorType", [
    z.strictObject({
        colorType: z.literal("solid"),
        value: ColorStyle,
        opacity: z.number().min(0).max(1).optional(),
    }),
    z.strictObject({
        colorType: z.literal("gradient"),
        direction: z.number().min(0).max(360),
        colors: z.array(ColorStyle),
        opacity: z.number().min(0).max(1).optional(),
    }),
    z.strictObject({
        colorType: z.literal("radial-gradient"),
        colors: z.array(ColorStyle),
        opacity: z.number().min(0).max(1).optional(),
    }),
]);
// const ColorScheme = z.array(ColorStyle);

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
    // whether or not the text block gets rendered
    enabled: z.boolean().default(false),
    // the font family / type to use for text
    font: z.string().default("Arial"),
    // a jmespath pointing to the text to use for this block
    textPath: z.string().optional(),
    // underline, bold, italic, etc.
    style: z.string().optional(),
    // pixel height of the text
    size: z.number().default(12),
    // special formatting processor (html, markdown, etc.)
    textType: TextType.optional(),
    // color of the text
    color: ColorStyle.optional(),
    // color of the background behind the text
    background: AdvancedColorStyle.or(ColorStyle).optional(),
    // how much rounding for the background corners
    backgroundCornerRadius: z.number().optional(),
    // where to locate the text relative to it's parent
    location: TextLocation,
    // how much space to have between the text and the edge of the background
    margin: z.number().positive().default(5),
});

const HttpUrl = z.url({
    protocol: /^https?$/,
    // @ts-expect-error it exists in the source, not sure why TS complains about .domain not existing
    hostname: z.regexes.domain,
});

// "data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="
const EmbeddedBase64Image = z.string().startsWith("data:image/png;base64,");

const ImageData = HttpUrl.or(EmbeddedBase64Image);

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
    shape: z.strictObject({
        size: z.number().positive().optional(),
        type: NodeShapes.optional(),
        // custom mesh https://doc.babylonjs.com/features/featuresDeepDive/mesh/creation/custom/custom
        // import mesh https://doc.babylonjs.com/typedoc/functions/BABYLON.ImportMeshAsync
    }).optional(),
    texture: z.strictObject({
        color: AdvancedColorStyle.or(ColorStyle).optional(),
        image: z.url().optional(),
        icon: z.string().optional(),
        // pieChart: z.string().or(z.null()).default(null), // https://manual.cytoscape.org/en/stable/Styles.html#using-graphics-in-styles
        // shader: z.url().or(z.null()).default(null), // https://doc.babylonjs.com/features/featuresDeepDive/materials/shaders/
        // bumpmap: z.url().or(z.null()).default(null), // https://doc.babylonjs.com/features/featuresDeepDive/materials/using/moreMaterials/#bump-map
        // refraction // https://forum.babylonjs.com/t/how-to-make-a-semi-transparent-glass-ball-with-a-through-hole-with-albedotexture/27357/24
        // reflection // https://doc.babylonjs.com/features/featuresDeepDive/materials/using/reflectionTexture/
    }).optional(),
    effect: z.strictObject({
        glow: z.strictObject({ // https://doc.babylonjs.com/features/featuresDeepDive/mesh/glowLayer
            color: ColorStyle.optional(),
            strength: z.number().positive().optional(),
        }).optional(),
        outline: z.strictObject({ // https://forum.babylonjs.com/t/how-to-get-the-perfect-outline/31711
            color: ColorStyle.optional(),
            width: z.number().positive().optional(),
        }).optional(),
        wireframe: z.boolean().optional(),
        flatShaded: z.boolean().optional(),
    }).optional(),
    label: TextBlockStyle.prefault({location: "top-left", color: "black", background: "white"}).optional(),
    tooltip: TextBlockStyle.prefault({location: "top-right", color: "black", background: "white"}).optional(),
    enabled: z.boolean().default(true),
});

export type NodeStyleConfig = z.infer<typeof NodeStyle>;
export const defaultNodeStyle: NodeStyleConfig = {
    shape: {
        type: "icosphere",
        size: 1,
    },
    texture: {
        color: "lightgrey",
    },
    enabled: true,
};

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
    type: LineType.optional(),
    animationSpeed: z.number().min(0).optional(),
    width: z.number().positive().optional(),
    color: ColorStyle.optional(),
    opacity: z.number().min(0).max(1).optional(),
    bezier: z.boolean().optional(),
});

export type EdgeMeshFactory = typeof Edge.defaultEdgeMeshFactory;

export const EdgeStyle = z.strictObject({
    arrowHead: ArrowStyle.optional(),
    arrowTail: ArrowStyle.optional(),
    line: LineStyle.optional(),
    label: TextBlockStyle.prefault({location: "top"}).optional(),
    tooltip: TextBlockStyle.prefault({location: "bottom"}).optional(),
    // effects: glow // https://playground.babylonjs.com/#H1LRZ3#35
    enabled: z.boolean().default(true),
    edgeMeshFactory: z.instanceof(Function).default(() => Edge.defaultEdgeMeshFactory),
});

export type EdgeStyleConfig = z.infer<typeof EdgeStyle>;
export const defaultEdgeStyle: EdgeStyleConfig = {
    line: {
        type: "solid",
        animationSpeed: 0.1,
        width: 0.25,
        color: "white",
    },
    enabled: true,
    edgeMeshFactory: Edge.defaultEdgeMeshFactory,
};

/** ******** GRAPH STYLES ***********/

const GraphBackgroundColor = z.strictObject({
    backgroundType: z.literal("color"),
    color: ColorStyle,
});

const GraphBackgroundSkybox = z.strictObject({
    backgroundType: z.literal("skybox"),
    data: ImageData,
});

const GraphBackground = z.discriminatedUnion("backgroundType", [
    GraphBackgroundColor,
    GraphBackgroundSkybox,
]);

const GraphEffects = z.strictObject({
    // https://doc.babylonjs.com/features/featuresDeepDive/postProcesses/motionBlurPostProcess/
    motionBlur: z.number().optional(),
    // https://doc.babylonjs.com/features/featuresDeepDive/postProcesses/dofLenseEffects/
    depthOfField: z.number().optional(),
    // https://doc.babylonjs.com/features/featuresDeepDive/postProcesses/SSRRenderingPipeline/
    screenSpaceReflections: z.boolean().optional(),
});

const GraphStyle = z.strictObject({
    addDefaultStyle: z.boolean().default(true),
    background: GraphBackground.prefault({backgroundType: "color", color: "skyblue"}),
    effects: GraphEffects.optional(),
    startingCameraDistance: z.number().default(30), // TODO: replace with "zoomToFit: z.boolean()"
    layout: z.string().default("ngraph"),
    layoutOptions: z.object().optional(),
}).prefault({});

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

export const GraphKnownFields = z.object({
    nodeIdPath: z.string().default("id"),
    nodeWeightPath: z.string().or(z.null()).default(null),
    nodeTimePath: z.string().or(z.null()).default(null),
    edgeSrcIdPath: z.string().default("src"),
    edgeDstIdPath: z.string().default("dst"),
    edgeWeightPath: z.string().or(z.null()).default(null),
    edgeTimePath: z.string().or(z.null()).default(null),
}).prefault({});

const TemplateExpectedSchema = z.strictObject({
    knownFields: GraphKnownFields,
    // schema: z4.$ZodObject,
});

const TemplateMetadata = z.strictObject({
    templateName: z.string().optional(),
    templateCreator: z.string().optional(),
    templateCreationTimestamp: z.iso.datetime().optional(),
    templateModificationTimestamp: z.iso.datetime().optional(),
});

export const StyleTemplateV1 = z.strictObject({
    graphtyTemplate: z.literal(true),
    majorVersion: z.literal("1"),
    metadata: TemplateMetadata.optional(),
    graph: GraphStyle.prefault({}),
    layers: z.array(StyleLayer).prefault([]),
    expectedSchema: TemplateExpectedSchema.optional(),
});

export const StyleTemplate = z.discriminatedUnion("majorVersion", [
    StyleTemplateV1,
]);

export type StyleSchema = z.infer<typeof StyleTemplate>
export type StyleSchemaV1 = z.infer<typeof StyleTemplateV1>
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

export type NodeObjectType = z.infer<typeof NodeObject>
export type EdgeObjectType = z.infer<typeof EdgeObject>
export type GraphKnownFieldsType = z.infer<typeof GraphKnownFields>
export type GraphConfig = z.infer<typeof GraphOpts>;
export type GraphOptsType = DeepPartial<GraphConfig>

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

/** * CONFIG ***/
export const GraphOpts = z.strictObject({
    behavior: GraphBehaviorOpts,
    layout: GraphLayoutOpts,
    knownFields: GraphKnownFields,
});

export function getConfig(o: object = {}): GraphConfig {
    return GraphOpts.parse(o);
}
