import {Edge as LayoutEdge, kamadaKawaiLayout, Node as LayoutNode} from "@graphty/layout";
import {z} from "zod/v4";

import {defineOptions, type OptionsSchema} from "../config";
import {SimpleLayoutConfig, SimpleLayoutEngine} from "./LayoutEngine";

/**
 * Zod-based options schema for Kamada-Kawai Layout
 */
export const kamadaKawaiLayoutOptionsSchema = defineOptions({
    scalingFactor: {
        schema: z.number().min(1).max(1000).default(50),
        meta: {
            label: "Scaling Factor",
            description: "Multiplier for node positions",
        },
    },
    scale: {
        schema: z.number().positive().default(1),
        meta: {
            label: "Scale",
            description: "Scale factor for the layout",
            step: 0.1,
        },
    },
    dim: {
        schema: z.number().int().min(2).max(3).default(3),
        meta: {
            label: "Dimensions",
            description: "Layout dimensionality (2D or 3D)",
        },
    },
    weightProperty: {
        schema: z.string().optional(),
        meta: {
            label: "Weight Property",
            description: "Edge property to use as weight",
            advanced: true,
        },
    },
});

export const KamadaKawaiLayoutConfig = z.strictObject({
    ... SimpleLayoutConfig.shape,
    dist: z.record(z.number(), z.record(z.number(), z.number())).or(z.null()).default(null),
    pos: z.record(z.number(), z.array(z.number()).min(1).max(3)).or(z.null()).default(null),
    weightProperty: z.string().optional(),
    scale: z.number().positive().default(1),
    center: z.array(z.number()).min(2).max(3).or(z.null()).default(null),
    dim: z.number().default(3),
});
export type KamadaKawaiLayoutConfigType = z.infer<typeof KamadaKawaiLayoutConfig>;
export type KamadaKawaiLayoutOpts = Partial<KamadaKawaiLayoutConfigType>;

/**
 * Kamada-Kawai layout engine using spring-embedder energy minimization
 */
export class KamadaKawaiLayout extends SimpleLayoutEngine {
    static type = "kamada-kawai";
    static maxDimensions = 3;
    static zodOptionsSchema: OptionsSchema = kamadaKawaiLayoutOptionsSchema;
    scalingFactor = 50;
    config: KamadaKawaiLayoutConfigType;

    /**
     * Create a Kamada-Kawai layout engine
     * @param opts - Configuration options including scale and dimensions
     */
    constructor(opts: KamadaKawaiLayoutOpts) {
        super(opts);
        this.config = KamadaKawaiLayoutConfig.parse(opts);
    }

    /**
     * Get dimension-specific options for Kamada-Kawai layout
     * @param dimension - The desired dimension (2 or 3)
     * @returns Options object with dim parameter
     */
    static getOptionsForDimension(dimension: 2 | 3): object {
        return {dim: dimension};
    }

    /**
     * Compute node positions using Kamada-Kawai algorithm
     */
    doLayout(): void {
        this.stale = false;
        const nodes = (): LayoutNode[] => this._nodes.map((n) => n.id as LayoutNode);
        const edges = (): LayoutEdge[] => this._edges.map((e) => [e.srcId, e.dstId] as LayoutEdge);

        this.positions = kamadaKawaiLayout(
            {nodes, edges},
            this.config.dist,
            this.config.pos,
            this.config.weightProperty,
            this.config.scale,
            this.config.center,
            this.config.dim,
        );
    }
}
