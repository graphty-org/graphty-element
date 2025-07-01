import {bfsLayout, Edge as LayoutEdge, Node as LayoutNode} from "@graphty/layout";
import {z} from "zod/v4";

import {SimpleLayoutConfig, SimpleLayoutEngine} from "./LayoutEngine";

export const BfsLayoutConfig = z.strictObject({
    ... SimpleLayoutConfig.shape,
    start: z.number().or(z.string()),
    align: z.enum(["vertical", "horizontal"]).default("vertical"),
    scale: z.number().positive().default(1),
    center: z.array(z.number()).length(2).or(z.null()).default(null),
});
export type BfsLayoutConfigType = z.infer<typeof BfsLayoutConfig>;
export type BfsLayoutOpts = Partial<BfsLayoutConfigType>;

export class BfsLayout extends SimpleLayoutEngine {
    static type = "bfs";
    scalingFactor = 20;
    config: BfsLayoutConfigType;

    constructor(opts: BfsLayoutOpts) {
        super(opts);
        this.config = BfsLayoutConfig.parse(opts);
    }

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
