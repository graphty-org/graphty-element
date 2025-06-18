import {z} from "zod/v4";
import {ColorStyle, DeepPartial, GraphKnownFields, ImageData} from "./common";
import {GraphBehaviorOpts, GraphLayoutOpts} from "./GraphBehavior";

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

export const GraphStyle = z.strictObject({
    addDefaultStyle: z.boolean().default(true),
    background: GraphBackground.prefault({backgroundType: "color", color: "skyblue"}),
    effects: GraphEffects.optional(),
    startingCameraDistance: z.number().default(30), // TODO: replace with "zoomToFit: z.boolean()"
    layout: z.string().default("ngraph"),
    layoutOptions: z.object().optional(),
}).prefault({});

/* ******* REFACTOR EVERYTHING BELOW THIS LINE *********/
export const GraphOpts = z.strictObject({
    behavior: GraphBehaviorOpts,
    layout: GraphLayoutOpts,
    knownFields: GraphKnownFields,
});

export type GraphConfig = z.infer<typeof GraphOpts>;
export type GraphOptsType = DeepPartial<GraphConfig>

export function getConfig(o: object = {}): GraphConfig {
    return GraphOpts.parse(o);
}

