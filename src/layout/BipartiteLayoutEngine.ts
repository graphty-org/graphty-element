import {bipartiteLayout, Edge as LayoutEdge, Node as LayoutNode} from "@graphty/layout";
import {z} from "zod/v4";

import {SimpleLayoutConfig, SimpleLayoutEngine} from "./LayoutEngine";

export const BipartiteLayoutConfig = z.strictObject({
    ... SimpleLayoutConfig.shape,
    nodes: z.array(z.number().or(z.string())),
    align: z.enum(["vertical", "horizontal"]).default("vertical"),
    scale: z.number().positive().default(1),
    center: z.array(z.number()).length(2).or(z.null()).default(null),
    aspectRatio: z.number().positive().default(4 / 3),
});
export type BipartiteLayoutConfigType = z.infer<typeof BipartiteLayoutConfig>;
export type BipartiteLayoutOpts = Partial<BipartiteLayoutConfigType>;

export class BipartiteLayout extends SimpleLayoutEngine {
    static type = "bipartite";
    static maxDimensions = 2;
    scalingFactor = 40;
    config: BipartiteLayoutConfigType;

    constructor(opts: BipartiteLayoutOpts) {
        super(opts);
        this.config = BipartiteLayoutConfig.parse(opts);
    }

    static getOptionsForDimension(dimension: 2 | 3): object | null {
        // Bipartite only supports 2D
        if (dimension > this.maxDimensions) {
            return null;
        }
        // Bipartite doesn't use 'dim' parameter
        return {};
    }

    doLayout(): void {
        this.stale = false;
        const nodes = (): LayoutNode[] => this._nodes.map((n) => n.id as LayoutNode);
        const edges = (): LayoutEdge[] => this._edges.map((e) => [e.srcId, e.dstId] as LayoutEdge);

        this.positions = bipartiteLayout(
            {nodes, edges},
            this.config.nodes,
            this.config.align,
            this.config.scale,
            this.config.center,
            this.config.aspectRatio,
        );
    }
}
