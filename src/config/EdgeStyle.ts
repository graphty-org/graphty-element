import {Edge} from "../Edge";
import {z} from "zod/v4";
import {ColorStyle, TextBlockStyle} from "./common";

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
};
