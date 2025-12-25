import {arfLayout, Edge as LayoutEdge, Node as LayoutNode} from "@graphty/layout";
import {z} from "zod/v4";

import {defineOptions, type OptionsSchema} from "../config";
import {SimpleLayoutConfig, SimpleLayoutEngine} from "./LayoutEngine";

/**
 * Zod-based options schema for ARF Layout
 */
export const arfLayoutOptionsSchema = defineOptions({
    scalingFactor: {
        schema: z.number().min(1).max(1000).default(100),
        meta: {
            label: "Scaling Factor",
            description: "Multiplier for node positions",
        },
    },
    scaling: {
        schema: z.number().positive().default(1),
        meta: {
            label: "Scaling",
            description: "Scale factor for the attractive force",
            step: 0.1,
        },
    },
    a: {
        schema: z.number().positive().default(1.1),
        meta: {
            label: "Attraction Ratio",
            description: "Ratio of attraction to repulsion",
            step: 0.1,
            advanced: true,
        },
    },
    maxIter: {
        schema: z.number().int().positive().default(1000),
        meta: {
            label: "Max Iterations",
            description: "Maximum number of iterations",
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

export const ArfLayoutConfig = z.strictObject({
    ... SimpleLayoutConfig.shape,
    pos: z.record(
        z.number(),
        z.array(z.number()),
    ).or(z.null()).default(null),
    scaling: z.number().positive().default(1),
    a: z.number().positive().default(1.1),
    maxIter: z.number().positive().default(1000),
    seed: z.number().positive().or(z.null()).default(null),
});
export type ArfLayoutConfigType = z.infer<typeof ArfLayoutConfig>;
export type ArfLayoutOpts = Partial<ArfLayoutConfigType>;

/**
 * ARF (Attractive-Repulsive Force) layout engine for 2D graph visualization
 */
export class ArfLayout extends SimpleLayoutEngine {
    static type = "arf";
    static maxDimensions = 2;
    static zodOptionsSchema: OptionsSchema = arfLayoutOptionsSchema;
    scalingFactor = 100;
    config: ArfLayoutConfigType;

    /**
     * Create an ARF layout engine
     * @param opts - Configuration options for the ARF algorithm
     */
    constructor(opts: ArfLayoutOpts) {
        super(opts);
        this.config = ArfLayoutConfig.parse(opts);
    }

    /**
     * Get dimension-specific options for ARF layout
     * @param dimension - The desired dimension (2 or 3)
     * @returns Empty object for 2D, null for 3D (unsupported)
     */
    static getOptionsForDimension(dimension: 2 | 3): object | null {
        // Arf only supports 2D
        if (dimension > this.maxDimensions) {
            return null;
        }

        // Arf doesn't use 'dim' parameter
        return {};
    }

    /**
     * Compute node positions using the ARF algorithm
     */
    doLayout(): void {
        this.stale = false;
        const nodes = (): LayoutNode[] => this._nodes.map((n) => n.id as LayoutNode);
        const edges = (): LayoutEdge[] => this._edges.map((e) => [e.srcId, e.dstId] as LayoutEdge);

        this.positions = arfLayout(
            {nodes, edges},
            this.config.pos,
            this.config.scaling,
            this.config.a,
            this.config.maxIter,
            this.config.seed,
        );
    }
}
