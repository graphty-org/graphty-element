import {Edge as LayoutEdge, Node as LayoutNode, spectralLayout} from "@graphty/layout";
import {z} from "zod/v4";

import {defineOptions, type OptionsSchema} from "../config";
import {SimpleLayoutConfig, SimpleLayoutEngine} from "./LayoutEngine";

/**
 * Zod-based options schema for Spectral Layout
 */
export const spectralLayoutOptionsSchema = defineOptions({
    scalingFactor: {
        schema: z.number().min(1).max(1000).default(100),
        meta: {
            label: "Scaling Factor",
            description: "Multiplier for node positions",
        },
    },
    scale: {
        schema: z.number().positive().default(1),
        meta: {
            label: "Scale",
            description: "Scale factor for the spectral layout",
            step: 0.1,
        },
    },
    dim: {
        schema: z.number().int().min(2).max(2).default(2),
        meta: {
            label: "Dimensions",
            description: "Layout dimensionality (2D only for spectral)",
        },
    },
});

export const SpectralLayoutConfig = z.strictObject({
    ... SimpleLayoutConfig.shape,
    scale: z.number().positive().default(1),
    center: z.array(z.number()).length(2).or(z.null()).default(null),
    dim: z.number().default(2),
});
export type SpectralLayoutConfigType = z.infer<typeof SpectralLayoutConfig>;
export type SpectralLayoutOpts = Partial<SpectralLayoutConfigType>;

export class SpectralLayout extends SimpleLayoutEngine {
    static type = "spectral";
    static maxDimensions = 2;
    static zodOptionsSchema: OptionsSchema = spectralLayoutOptionsSchema;
    scalingFactor = 100;
    config: SpectralLayoutConfigType;

    constructor(opts: SpectralLayoutOpts) {
        super(opts);
        this.config = SpectralLayoutConfig.parse(opts);
    }

    static getOptionsForDimension(dimension: 2 | 3): object {
        return {dim: dimension};
    }

    doLayout(): void {
        this.stale = false;
        const nodes = (): LayoutNode[] => this._nodes.map((n) => n.id as LayoutNode);
        const edges = (): LayoutEdge[] => this._edges.map((e) => [e.srcId, e.dstId] as LayoutEdge);

        this.positions = spectralLayout(
            {nodes, edges},
            this.config.scale,
            this.config.center,
            this.config.dim,
        );
    }
}
