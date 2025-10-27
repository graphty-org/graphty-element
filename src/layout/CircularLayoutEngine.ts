import {circularLayout, Edge as LayoutEdge, Node as LayoutNode} from "@graphty/layout";
import {z} from "zod/v4";

import {SimpleLayoutConfig, SimpleLayoutEngine} from "./LayoutEngine";

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
