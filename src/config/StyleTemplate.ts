import {z} from "zod/v4";

import {DataConfig} from "./DataConfig";
import {EdgeStyle} from "./EdgeStyle";
import {GraphStyle} from "./GraphStyle";
import {NodeStyle} from "./NodeStyle";

export const AppliedNodeStyle = z.strictObject({
    selector: z.string(),
    style: NodeStyle,
});

export const AppliedEdgeStyle = z.strictObject({
    selector: z.string(),
    style: EdgeStyle,
});

const AllowedInputPaths = z.string().regex(/^data\.|algorithmData\./);
const AllowedOuputPaths = z.string().startsWith("style.");

export const CalculatedStyle = z.strictObject({
    inputs: z.array(AllowedInputPaths),
    output: AllowedOuputPaths,
    expr: z.string(),
});

export type CalculatedStyleConfig = z.infer<typeof CalculatedStyle>;

export const StyleLayer = z.strictObject({
    node: AppliedNodeStyle,
    edge: AppliedEdgeStyle,
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
    data: DataConfig.optional(),
});

export const StyleTemplate = z.discriminatedUnion("majorVersion", [
    StyleTemplateV1,
]);

export type StyleSchema = z.infer<typeof StyleTemplate>;
export type StyleSchemaV1 = z.infer<typeof StyleTemplateV1>;
export type StyleLayerType = z.infer<typeof StyleLayer>;
