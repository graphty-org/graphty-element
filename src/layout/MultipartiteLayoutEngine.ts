import {Edge as LayoutEdge, multipartiteLayout, Node as LayoutNode} from "@graphty/layout";
import {z} from "zod/v4";

import {defineOptions, type OptionsSchema} from "../config";
import {SimpleLayoutConfig, SimpleLayoutEngine} from "./LayoutEngine";

/**
 * Zod-based options schema for Multipartite Layout
 */
export const multipartiteLayoutOptionsSchema = defineOptions({
    scalingFactor: {
        schema: z.number().min(1).max(1000).default(40),
        meta: {
            label: "Scaling Factor",
            description: "Multiplier for node positions",
        },
    },
    align: {
        schema: z.enum(["vertical", "horizontal"]).default("vertical"),
        meta: {
            label: "Alignment",
            description: "Direction of multipartite partitions",
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

export const MultipartiteLayoutConfig = z.strictObject({
    ... SimpleLayoutConfig.shape,
    // subsetKey: z.string().or(z.record(z.number(), z.array(z.string().or(z.number())))),
    subsetKey: z.record(z.string(), z.array(z.string().or(z.number()))),
    align: z.enum(["vertical", "horizontal"]).default("vertical"),
    scale: z.number().positive().default(1),
    center: z.array(z.number()).length(2).or(z.null()).default(null),
});
export type MultipartiteLayoutConfigType = z.infer<typeof MultipartiteLayoutConfig>;
export type MultipartiteLayoutOpts = Partial<MultipartiteLayoutConfigType>;

export class MultipartiteLayout extends SimpleLayoutEngine {
    static type = "multipartite";
    static maxDimensions = 2;
    static zodOptionsSchema: OptionsSchema = multipartiteLayoutOptionsSchema;
    scalingFactor = 40;
    config: MultipartiteLayoutConfigType;

    constructor(opts: MultipartiteLayoutOpts) {
        super(opts);
        this.config = MultipartiteLayoutConfig.parse(opts);
    }

    static getOptionsForDimension(dimension: 2 | 3): object | null {
        // Multipartite only supports 2D
        if (dimension > this.maxDimensions) {
            return null;
        }

        // Multipartite doesn't use 'dim' parameter
        return {};
    }

    doLayout(): void {
        this.stale = false;
        const nodes = (): LayoutNode[] => this._nodes.map((n) => n.id as LayoutNode);
        const edges = (): LayoutEdge[] => this._edges.map((e) => [e.srcId, e.dstId] as LayoutEdge);

        this.positions = multipartiteLayout(
            {nodes, edges},
            this.config.subsetKey,
            this.config.align,
            this.config.scale,
            this.config.center,
        );
    }
}
