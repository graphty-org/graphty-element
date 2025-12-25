import {Edge as LayoutEdge, forceatlas2Layout, Node as LayoutNode} from "@graphty/layout";
import {z} from "zod/v4";

import {defineOptions, type OptionsSchema} from "../config";
import {SimpleLayoutConfig, SimpleLayoutEngine} from "./LayoutEngine";

/**
 * Zod-based options schema for ForceAtlas2 Layout
 */
export const forceAtlas2LayoutOptionsSchema = defineOptions({
    scalingFactor: {
        schema: z.number().min(1).max(1000).default(100),
        meta: {
            label: "Scaling Factor",
            description: "Multiplier for node positions",
        },
    },
    maxIter: {
        schema: z.number().int().positive().default(100),
        meta: {
            label: "Max Iterations",
            description: "Maximum number of simulation iterations",
        },
    },
    jitterTolerance: {
        schema: z.number().positive().default(1.0),
        meta: {
            label: "Jitter Tolerance",
            description: "Tolerance for position jitter",
            step: 0.1,
            advanced: true,
        },
    },
    scalingRatio: {
        schema: z.number().positive().default(2.0),
        meta: {
            label: "Scaling Ratio",
            description: "Ratio for force scaling",
            step: 0.1,
        },
    },
    gravity: {
        schema: z.number().positive().default(1.0),
        meta: {
            label: "Gravity",
            description: "Strength of center gravity",
            step: 0.1,
        },
    },
    distributedAction: {
        schema: z.boolean().default(false),
        meta: {
            label: "Distributed Action",
            description: "Use distributed attraction for hubs",
            advanced: true,
        },
    },
    strongGravity: {
        schema: z.boolean().default(false),
        meta: {
            label: "Strong Gravity",
            description: "Use stronger gravity to prevent escape",
            advanced: true,
        },
    },
    dissuadeHubs: {
        schema: z.boolean().default(false),
        meta: {
            label: "Dissuade Hubs",
            description: "Push hubs away from each other",
            advanced: true,
        },
    },
    linlog: {
        schema: z.boolean().default(false),
        meta: {
            label: "LinLog Mode",
            description: "Use logarithmic attraction",
            advanced: true,
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
    dim: {
        schema: z.number().int().min(2).max(3).default(2),
        meta: {
            label: "Dimensions",
            description: "Layout dimensionality (2D or 3D)",
        },
    },
});

export const ForceAtlas2LayoutConfig = z.strictObject({
    ... SimpleLayoutConfig.shape,
    pos: z.record(z.number(), z.array(z.number()).min(2).max(3)).or(z.null()).default(null),
    maxIter: z.number().positive().default(100),
    jitterTolerance: z.number().positive().default(1.0),
    scalingRatio: z.number().positive().default(2.0),
    gravity: z.number().positive().default(1.0),
    distributedAction: z.boolean().default(false),
    strongGravity: z.boolean().default(false),
    nodeMass: z.record(z.number(), z.number()).or(z.null()).default(null),
    nodeSize: z.record(z.number(), z.number()).or(z.null()).default(null),
    weightPath: z.string().or(z.null()).default(null),
    dissuadeHubs: z.boolean().default(false),
    linlog: z.boolean().default(false),
    seed: z.number().or(z.null()).default(null),
    dim: z.number().default(2),
});
export type ForceAtlas2LayoutConfigType = z.infer<typeof ForceAtlas2LayoutConfig>;
export type ForceAtlas2LayoutOpts = Partial<ForceAtlas2LayoutConfigType>;

/**
 * ForceAtlas2 layout engine for graph visualization with scaling and gravity options
 */
export class ForceAtlas2Layout extends SimpleLayoutEngine {
    static type = "forceatlas2";
    static maxDimensions = 3;
    static zodOptionsSchema: OptionsSchema = forceAtlas2LayoutOptionsSchema;
    scalingFactor = 100;
    config: ForceAtlas2LayoutConfigType;

    /**
     * Create a ForceAtlas2 layout engine
     * @param opts - Configuration options for the ForceAtlas2 algorithm
     */
    constructor(opts: ForceAtlas2LayoutOpts) {
        super(opts);
        this.config = ForceAtlas2LayoutConfig.parse(opts);
    }

    /**
     * Get dimension-specific options for ForceAtlas2 layout
     * @param dimension - The desired dimension (2 or 3)
     * @returns Options object with dim parameter
     */
    static getOptionsForDimension(dimension: 2 | 3): object {
        return {dim: dimension};
    }

    /**
     * Compute node positions using the ForceAtlas2 algorithm
     */
    doLayout(): void {
        this.stale = false;
        const nodes = (): LayoutNode[] => this._nodes.map((n) => n.id as LayoutNode);
        const edges = (): LayoutEdge[] => this._edges.map((e) => [e.srcId, e.dstId] as LayoutEdge);

        this.positions = forceatlas2Layout(
            {nodes, edges},
            this.config.pos,
            this.config.maxIter,
            this.config.jitterTolerance,
            this.config.scalingRatio,
            this.config.gravity,
            this.config.distributedAction,
            this.config.strongGravity,
            this.config.nodeMass,
            this.config.nodeSize,
            this.config.weightPath,
            this.config.dissuadeHubs,
            this.config.linlog,
            this.config.seed,
            this.config.dim,
        );
    }
}
