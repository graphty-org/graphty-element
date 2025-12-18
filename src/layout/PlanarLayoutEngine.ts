import {Edge as LayoutEdge, Node as LayoutNode, planarLayout} from "@graphty/layout";
import {z} from "zod/v4";

import {defineOptions, type OptionsSchema} from "../config";
import {SimpleLayoutConfig, SimpleLayoutEngine} from "./LayoutEngine";

/**
 * Zod-based options schema for Planar Layout
 */
export const planarLayoutOptionsSchema = defineOptions({
    scalingFactor: {
        schema: z.number().min(1).max(1000).default(70),
        meta: {
            label: "Scaling Factor",
            description: "Multiplier for node positions",
        },
    },
    scale: {
        schema: z.number().positive().default(1),
        meta: {
            label: "Scale",
            description: "Scale factor for the planar layout",
            step: 0.1,
        },
    },
    dim: {
        schema: z.number().int().min(2).max(2).default(2),
        meta: {
            label: "Dimensions",
            description: "Layout dimensionality (2D only for planar)",
        },
    },
    seed: {
        schema: z.number().nullable().default(null),
        meta: {
            label: "Random Seed",
            description: "Seed for reproducible layout",
            advanced: true,
        },
    },
});

export const PlanarLayoutConfig = z.strictObject({
    ... SimpleLayoutConfig.shape,
    scale: z.number().positive().default(1),
    center: z.array(z.number()).length(2).or(z.null()).default(null),
    dim: z.number().default(2),
    seed: z.number().or(z.null()).default(null),
});
export type PlanarLayoutConfigType = z.infer<typeof PlanarLayoutConfig>;
export type PlanarLayoutOpts = Partial<PlanarLayoutConfigType>;

export class PlanarLayout extends SimpleLayoutEngine {
    static type = "planar";
    static maxDimensions = 2;
    static zodOptionsSchema: OptionsSchema = planarLayoutOptionsSchema;
    scalingFactor = 70;
    config: PlanarLayoutConfigType;

    constructor(opts: PlanarLayoutOpts) {
        super(opts);
        this.config = PlanarLayoutConfig.parse(opts);
    }

    static getOptionsForDimension(dimension: 2 | 3): object {
        return {dim: dimension};
    }

    doLayout(): void {
        this.stale = false;
        const nodes = (): LayoutNode[] => this._nodes.map((n) => n.id as LayoutNode);
        const edges = (): LayoutEdge[] => this._edges.map((e) => [e.srcId, e.dstId] as LayoutEdge);

        this.positions = planarLayout(
            {nodes, edges},
            this.config.scale,
            this.config.center,
            this.config.dim,
            this.config.seed,
        );
    }
}
