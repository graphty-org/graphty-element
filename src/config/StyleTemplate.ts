import {z} from "zod/v4";
import {NodeStyle} from "./NodeStyle";
import {EdgeStyle} from "./EdgeStyle";
import {GraphStyle} from "./GraphStyle";
import {GraphKnownFields} from "./common";

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

export type StyleSchema = z.infer<typeof StyleTemplate>;
export type StyleSchemaV1 = z.infer<typeof StyleTemplateV1>;
export type StyleLayerType = z.infer<typeof StyleLayer>;
