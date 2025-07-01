import {z} from "zod/v4";

import {GraphKnownFields} from "./common";

export const TemplateExpectedSchema = z.strictObject({
    knownFields: GraphKnownFields,
    // schema: z4.$ZodObject,
});

export const DataConfig = z.strictObject({
    algorithms: z.array(z.string()).optional(),
    knownFields: GraphKnownFields,
    // schema: z4.$ZodObject,
});
