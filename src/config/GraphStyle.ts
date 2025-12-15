import {z} from "zod/v4";

import {ColorStyle, ImageData} from "./common";
import {DEFAULT_VIEW_MODE} from "./ViewMode";

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

/**
 * Zod schema for ViewMode type
 */
const ViewModeSchema = z.enum(["2d", "3d", "ar", "vr"]);

export const GraphStyle = z.strictObject({
    addDefaultStyle: z.boolean().default(true),
    background: GraphBackground.prefault({backgroundType: "color", color: "whitesmoke"}),
    effects: GraphEffects.optional(),
    startingCameraDistance: z.number().default(30), // TODO: replace with "zoomToFit: z.boolean()"
    layout: z.string().optional(), // No default - let Graph constructor set the default
    layoutOptions: z.looseObject({}).optional(),
    /**
     * View mode controls how the graph is rendered and displayed.
     * - "2d": Orthographic camera, fixed top-down view
     * - "3d": Perspective camera with orbit controls (default)
     * - "ar": Augmented reality mode using WebXR
     * - "vr": Virtual reality mode using WebXR
     */
    viewMode: ViewModeSchema.default(DEFAULT_VIEW_MODE),
    /**
     * @deprecated Use viewMode instead. twoD: true is equivalent to viewMode: "2d"
     */
    twoD: z.boolean().default(false),
});
