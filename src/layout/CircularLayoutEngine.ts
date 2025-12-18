import {circularLayout, Edge as LayoutEdge, Node as LayoutNode} from "@graphty/layout";
import {z} from "zod/v4";

import {defineOptions, type OptionsSchema} from "../config";
import {SimpleLayoutConfig, SimpleLayoutEngine} from "./LayoutEngine";

/**
 * NEW: Zod-based options schema with UI metadata for Circular Layout
 *
 * This is the new unified schema system that provides both Zod validation
 * and rich UI metadata for configuration interfaces.
 */
export const circularLayoutOptionsSchema = defineOptions({
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
            description: "Scale factor for the circular layout radius",
            step: 0.1,
        },
    },
    dim: {
        schema: z.number().int().min(2).max(3).default(2),
        meta: {
            label: "Dimensions",
            description: "Layout dimensionality (2D or 3D)",
        },
    },
});

// Legacy Zod config (kept for backward compatibility)
export const CircularLayoutConfig = z.strictObject({
    ... SimpleLayoutConfig.shape,
    scale: z.number().positive().default(1),
    center: z.array(z.number()).min(2).max(3).or(z.null()).default(null),
    dim: z.number().default(2),
});
export type CircularLayoutConfigType = z.infer<typeof CircularLayoutConfig>;
export type CircularLayoutOpts = Partial<CircularLayoutConfigType>;

export class CircularLayout extends SimpleLayoutEngine {
    static type = "circular";
    static maxDimensions = 3;

    /**
     * NEW: Zod-based options schema for unified validation and UI metadata
     */
    static zodOptionsSchema: OptionsSchema = circularLayoutOptionsSchema;

    scalingFactor = 80;
    config: CircularLayoutConfigType;

    constructor(opts: CircularLayoutOpts) {
        super(opts);
        this.config = CircularLayoutConfig.parse(opts);
    }

    static getOptionsForDimension(dimension: 2 | 3): object {
        return {dim: dimension};
    }

    doLayout(): void {
        this.stale = false;
        const nodes = (): LayoutNode[] => this._nodes.map((n) => n.id as LayoutNode);
        const edges = (): LayoutEdge[] => this._edges.map((e) => [e.srcId, e.dstId] as LayoutEdge);

        this.positions = circularLayout(
            {nodes, edges},
            this.config.scale,
            this.config.center,
            this.config.dim,
        );
    }
}
