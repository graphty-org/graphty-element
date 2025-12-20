import {Edge as LayoutEdge, Node as LayoutNode, spiralLayout} from "@graphty/layout";
import {z} from "zod/v4";

import {defineOptions, type OptionsSchema} from "../config";
import {SimpleLayoutConfig, SimpleLayoutEngine} from "./LayoutEngine";

/**
 * Zod-based options schema for Spiral Layout
 */
export const spiralLayoutOptionsSchema = defineOptions({
    scalingFactor: {
        schema: z.number().min(1).max(1000).default(80),
        meta: {
            label: "Scaling Factor",
            description: "Multiplier for node positions",
        },
    },
    scale: {
        schema: z.number().positive().default(1),
        meta: {
            label: "Scale",
            description: "Scale factor for the spiral layout",
            step: 0.1,
        },
    },
    dim: {
        schema: z.number().int().min(2).max(2).default(2),
        meta: {
            label: "Dimensions",
            description: "Layout dimensionality (2D only for spiral)",
        },
    },
    resolution: {
        schema: z.number().positive().default(0.35),
        meta: {
            label: "Resolution",
            description: "Controls spacing between spiral turns",
            step: 0.05,
            advanced: true,
        },
    },
    equidistant: {
        schema: z.boolean().default(false),
        meta: {
            label: "Equidistant",
            description: "Place nodes at equal distances along the spiral",
            advanced: true,
        },
    },
});

export const SpiralLayoutConfig = z.strictObject({
    ... SimpleLayoutConfig.shape,
    scale: z.number().positive().default(1),
    center: z.array(z.number()).length(2).or(z.null()).default(null),
    dim: z.number().default(2),
    resolution: z.number().positive().default(0.35),
    equidistant: z.boolean().default(false),
});
export type SpiralLayoutConfigType = z.infer<typeof SpiralLayoutConfig>;
export type SpiralLayoutOpts = Partial<SpiralLayoutConfigType>;

export class SpiralLayout extends SimpleLayoutEngine {
    static type = "spiral";
    static maxDimensions = 2;
    static zodOptionsSchema: OptionsSchema = spiralLayoutOptionsSchema;
    scalingFactor = 80;
    config: SpiralLayoutConfigType;

    constructor(opts: SpiralLayoutOpts) {
        super(opts);
        this.config = SpiralLayoutConfig.parse(opts);
    }

    static getOptionsForDimension(dimension: 2 | 3): object | null {
        // Spiral layout only supports 2D
        if (dimension > this.maxDimensions) {
            return null;
        }

        return {dim: dimension};
    }

    doLayout(): void {
        this.stale = false;
        const nodes = (): LayoutNode[] => this._nodes.map((n) => n.id as LayoutNode);
        const edges = (): LayoutEdge[] => this._edges.map((e) => [e.srcId, e.dstId] as LayoutEdge);

        this.positions = spiralLayout(
            {nodes, edges},
            this.config.scale,
            this.config.center,
            this.config.dim,
            this.config.resolution,
            this.config.equidistant,
        );
    }
}
