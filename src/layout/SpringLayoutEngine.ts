import {Edge as LayoutEdge, Node as LayoutNode, springLayout} from "@graphty/layout";
import {z} from "zod/v4";

import {defineOptions, type OptionsSchema} from "../config";
import {SimpleLayoutConfig, SimpleLayoutEngine} from "./LayoutEngine";

/**
 * Zod-based options schema for Spring Layout
 */
export const springLayoutOptionsSchema = defineOptions({
    scalingFactor: {
        schema: z.number().min(1).max(1000).default(100),
        meta: {
            label: "Scaling Factor",
            description: "Multiplier for node positions",
        },
    },
    k: {
        schema: z.number().nullable().default(null),
        meta: {
            label: "Spring Constant",
            description: "Optimal distance between nodes (auto-calculated if null)",
            advanced: true,
        },
    },
    iterations: {
        schema: z.number().positive().default(50),
        meta: {
            label: "Iterations",
            description: "Number of spring simulation iterations",
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
    seed: {
        schema: z.number().positive().nullable().default(null),
        meta: {
            label: "Random Seed",
            description: "Seed for reproducible layout",
            advanced: true,
        },
    },
});

export const SpringLayoutConfig = z.strictObject({
    ... SimpleLayoutConfig.shape,
    k: z.number().or(z.null()).default(null),
    pos: z.record(
        z.number(),
        z.array(z.number()).min(2).max(3),
    ).or(z.null()).default(null),
    fixed: z.array(z.number()).or(z.null()).default(null),
    iterations: z.number().positive().default(50),
    scale: z.number().positive().default(1),
    center: z.array(z.number()).min(2).max(3).or(z.null()).default(null),
    dim: z.number().default(3),
    seed: z.number().positive().or(z.null()).default(null),
});
export type SpringLayoutConfigType = z.infer<typeof SpringLayoutConfig>;
export type SpringLayoutOpts = Partial<SpringLayoutConfigType>;

export class SpringLayout extends SimpleLayoutEngine {
    static type = "spring";
    static maxDimensions = 3;
    static zodOptionsSchema: OptionsSchema = springLayoutOptionsSchema;
    scalingFactor = 100;
    config: SpringLayoutConfigType;

    constructor(opts: SpringLayoutOpts) {
        super(opts);
        this.config = SpringLayoutConfig.parse(opts);
    }

    static getOptionsForDimension(dimension: 2 | 3): object {
        return {dim: dimension};
    }

    doLayout(): void {
        this.stale = false;
        const nodes = (): LayoutNode[] => this._nodes.map((n) => n.id as LayoutNode);
        const edges = (): LayoutEdge[] => this._edges.map((e) => [e.srcId, e.dstId] as LayoutEdge);

        this.positions = springLayout(
            {nodes, edges},
            this.config.k,
            this.config.pos,
            this.config.fixed,
            this.config.iterations,
            this.config.scale,
            this.config.center,
            this.config.dim,
            this.config.seed,
        );
    }
}
