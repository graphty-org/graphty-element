import {Edge as LayoutEdge, Node as LayoutNode, springLayout} from "@graphty/layout";
import {z} from "zod/v4";

import {SimpleLayoutConfig, SimpleLayoutEngine} from "./LayoutEngine";

export const SpringLayoutConfig = z.strictObject({
    ... SimpleLayoutConfig.shape,
    k: z.number().or(z.null()).default(null),
    pos: z.record(
        z.number(),
        z.array(z.number()),
    ).or(z.null()).default(null),
    fixed: z.array(z.number()).or(z.null()).default(null),
    iterations: z.number().positive().default(50),
    scale: z.number().positive().default(1),
    center: z.array(z.number()).length(2).or(z.null()).default(null),
    dim: z.number().default(3),
    seed: z.number().positive().or(z.null()).default(null),
});
export type SpringLayoutConfigType = z.infer<typeof SpringLayoutConfig>;
export type SpringLayoutOpts = Partial<SpringLayoutConfigType>;

export class SpringLayout extends SimpleLayoutEngine {
    static type = "spring";
    static maxDimensions = 3;
    scalingFactor = 100;
    config: SpringLayoutConfigType;

    constructor(opts: SpringLayoutOpts) {
        super(opts);
        this.config = SpringLayoutConfig.parse(opts);
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
