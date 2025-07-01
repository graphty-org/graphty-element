import {z} from "zod/v4";

export const GraphKnownFields = z.object({
    nodeIdPath: z.string().default("id"),
    nodeWeightPath: z.string().or(z.null()).default(null),
    nodeTimePath: z.string().or(z.null()).default(null),
    edgeSrcIdPath: z.string().default("src"),
    edgeDstIdPath: z.string().default("dst"),
    edgeWeightPath: z.string().or(z.null()).default(null),
    edgeTimePath: z.string().or(z.null()).default(null),
});

export const DataConfig = z.strictObject({
    algorithms: z.array(z.string()).optional(),
    knownFields: GraphKnownFields.prefault({}),
    // schema: z4.$ZodObject,
});
