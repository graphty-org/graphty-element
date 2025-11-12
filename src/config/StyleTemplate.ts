import {z} from "zod/v4";

import {DataConfig} from "./DataConfig";
import {EdgeStyle} from "./EdgeStyle";
import {GraphBehaviorOpts} from "./GraphBehavior";
import {GraphStyle} from "./GraphStyle";
import {NodeStyle} from "./NodeStyle";

const AllowedInputPaths = z.string().regex(/^data\.|algorithmResults\./);
const AllowedOuputPaths = z.string().startsWith("style.");

export const CalculatedStyle = z.strictObject({
    inputs: z.array(AllowedInputPaths),
    output: AllowedOuputPaths,
    expr: z.string(),
});

export type CalculatedStyleConfig = z.infer<typeof CalculatedStyle>;

export const AppliedNodeStyle = z.strictObject({
    selector: z.string(),
    style: NodeStyle,
    calculatedStyle: CalculatedStyle.optional(),
});

export const AppliedEdgeStyle = z.strictObject({
    selector: z.string(),
    style: EdgeStyle,
    calculatedStyle: CalculatedStyle.optional(),
});

export type AppliedNodeStyleConfig = z.infer<typeof AppliedNodeStyle>;
export type AppliedEdgeStyleConfig = z.infer<typeof AppliedEdgeStyle>;

const StyleLayerMetadata = z.strictObject({
    name: z.string(),
});

export const StyleLayer = z.strictObject({
    node: AppliedNodeStyle,
    edge: AppliedEdgeStyle,
    metadata: StyleLayerMetadata.optional(),
})
    .partial()
    .refine(
        (data) => !!data.node || !!data.edge,
        "StyleLayer requires either 'node' or 'edge'.",
    );

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
    data: DataConfig.prefault({}),
    behavior: GraphBehaviorOpts.prefault({}),
});

export const StyleTemplate = z.discriminatedUnion("majorVersion", [
    StyleTemplateV1,
]);

export type StyleSchema = z.infer<typeof StyleTemplate>;
export type StyleSchemaV1 = z.infer<typeof StyleTemplateV1>;
export type StyleLayerType = z.infer<typeof StyleLayer>;
