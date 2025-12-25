import {bfsLayout, Edge as LayoutEdge, Node as LayoutNode} from "@graphty/layout";
import {z} from "zod/v4";

import {defineOptions, type OptionsSchema} from "../config";
import {SimpleLayoutConfig, SimpleLayoutEngine} from "./LayoutEngine";

/**
 * Zod-based options schema for BFS Layout
 */
export const bfsLayoutOptionsSchema = defineOptions({
    scalingFactor: {
        schema: z.number().min(1).max(1000).default(20),
        meta: {
            label: "Scaling Factor",
            description: "Multiplier for node positions",
        },
    },
    start: {
        schema: z.union([z.string(), z.number()]),
        meta: {
            label: "Start Node",
            description: "Starting node for BFS traversal",
        },
    },
    align: {
        schema: z.enum(["vertical", "horizontal"]).default("vertical"),
        meta: {
            label: "Alignment",
            description: "Direction of BFS tree expansion",
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
});

export const BfsLayoutConfig = z.strictObject({
    ... SimpleLayoutConfig.shape,
    start: z.number().or(z.string()),
    align: z.enum(["vertical", "horizontal"]).default("vertical"),
    scale: z.number().positive().default(1),
    center: z.array(z.number()).length(2).or(z.null()).default(null),
});
export type BfsLayoutConfigType = z.infer<typeof BfsLayoutConfig>;
export type BfsLayoutOpts = Partial<BfsLayoutConfigType>;

/**
 * BFS (Breadth-First Search) layout engine for tree-like graph visualization
 */
export class BfsLayout extends SimpleLayoutEngine {
    static type = "bfs";
    static maxDimensions = 2;
    static zodOptionsSchema: OptionsSchema = bfsLayoutOptionsSchema;
    scalingFactor = 20;
    config: BfsLayoutConfigType;

    /**
     * Create a BFS layout engine
     * @param opts - Configuration options including start node and alignment
     */
    constructor(opts: BfsLayoutOpts) {
        super(opts);
        this.config = BfsLayoutConfig.parse(opts);
    }

    /**
     * Get dimension-specific options for BFS layout
     * @param dimension - The desired dimension (2 or 3)
     * @returns Empty object for 2D, null for 3D (unsupported)
     */
    static getOptionsForDimension(dimension: 2 | 3): object | null {
        // Bfs only supports 2D
        if (dimension > this.maxDimensions) {
            return null;
        }

        // Bfs doesn't use 'dim' parameter
        return {};
    }

    /**
     * Compute node positions using BFS traversal
     */
    doLayout(): void {
        this.stale = false;
        const nodes = (): LayoutNode[] => this._nodes.map((n) => n.id as LayoutNode);
        const edges = (): LayoutEdge[] => this._edges.map((e) => [e.srcId, e.dstId] as LayoutEdge);

        this.positions = bfsLayout(
            {nodes, edges},
            this.config.start,
            this.config.align,
            this.config.scale,
            this.config.center,
        );
    }
}
