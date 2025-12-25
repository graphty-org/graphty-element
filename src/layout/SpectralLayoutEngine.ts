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

/**
 * Spectral layout engine using graph Laplacian eigenvectors
 */
export class SpectralLayout extends SimpleLayoutEngine {
    static type = "spectral";
    static maxDimensions = 2;
    static zodOptionsSchema: OptionsSchema = spectralLayoutOptionsSchema;
    scalingFactor = 100;
    config: SpectralLayoutConfigType;

    /**
     * Create a spectral layout engine
     * @param opts - Configuration options including scale and center
     */
    constructor(opts: SpectralLayoutOpts) {
        super(opts);
        this.config = SpectralLayoutConfig.parse(opts);
    }

    /**
     * Get dimension-specific options for spectral layout
     * @param dimension - The desired dimension (2 or 3)
     * @returns Options object with dim parameter or null for 3D (unsupported)
     */
    static getOptionsForDimension(dimension: 2 | 3): object | null {
        // Spectral layout only supports 2D
        if (dimension > this.maxDimensions) {
            return null;
        }

        return {dim: dimension};
    }

    /**
     * Compute node positions using spectral graph theory
     */
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
