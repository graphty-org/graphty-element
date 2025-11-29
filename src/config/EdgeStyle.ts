import {z} from "zod/v4";

import {EDGE_CONSTANTS} from "../constants/meshConstants";
import {ColorStyle} from "./common";
import {RichTextStyle} from "./RichTextStyle";

const ArrowType = z.enum([
    // https://graphviz.org/docs/attr-types/arrowType/
    // https://manual.cytoscape.org/en/stable/Styles.html#available-shapes-and-line-styles
    "normal",
    "inverted",
    "dot",
    "sphere-dot",
    "open-dot",
    "none",
    "tee",
    "open-normal",
    "diamond",
    "open-diamond",
    "crow",
    "box",
    "half-open",
    "vee",
]);

const ArrowStyle = z.strictObject({
    type: ArrowType.default("normal").optional(),
    size: z.number().positive().default(1).optional(),
    color: ColorStyle.default("white").optional(),
    opacity: z.number().min(0).max(1).default(1).optional(),
    text: RichTextStyle.optional(),
});

const LineType = z.enum([
    // Phase 4: Instanced Mesh Line Patterns
    "solid", // CustomLineRenderer (continuous line)
    "dot", // Circle instances
    "star", // Star instances
    "box", // Square box instances (1:1 aspect ratio)
    "dash", // Elongated box instances (3:1 aspect ratio)
    "diamond", // Diamond instances
    "dash-dot", // Alternating boxes and circles
    "sinewave", // Repeating wave period meshes
    "zigzag", // Repeating zigzag period meshes
]);

const LineStyle = z.strictObject({
    type: LineType.optional(),
    animationSpeed: z.number().min(0).optional(),
    width: z.number().positive().optional(),
    color: ColorStyle.optional(),
    opacity: z.number().min(0).max(1).optional(),
    bezier: z.boolean().optional(),
});

export const EdgeStyle = z.strictObject({
    arrowHead: ArrowStyle.optional(),
    arrowTail: ArrowStyle.optional(),
    line: LineStyle.optional(),
    label: RichTextStyle.prefault({location: "top"}).optional(),
    tooltip: RichTextStyle.prefault({location: "bottom"}).optional(),
    // effects: glow // https://playground.babylonjs.com/#H1LRZ3#35
    enabled: z.boolean().default(true).optional(),
});

export type EdgeStyleConfig = z.infer<typeof EdgeStyle>;
export const defaultEdgeStyle: EdgeStyleConfig = {
    line: {
        type: "solid",
        animationSpeed: 0,
        width: EDGE_CONSTANTS.DEFAULT_LINE_WIDTH,
        color: "darkgrey",
    },
    arrowHead: ArrowStyle.parse({
        type: "normal",
        color: "darkgrey",
    }),
    enabled: true,
};
