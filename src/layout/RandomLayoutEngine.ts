import {Edge as LayoutEdge, Node as LayoutNode, randomLayout} from "@graphty/layout";
import {z} from "zod/v4";

import {SimpleLayoutConfig, SimpleLayoutEngine} from "./LayoutEngine";

export const RandomLayoutConfig = z.strictObject({
    ... SimpleLayoutConfig.shape,
    center: z.array(z.number()).length(2).or(z.null()).default(null),
    dim: z.number().default(2),
    seed: z.number().positive().or(z.null()).default(null),
});
export type RandomLayoutConfigType = z.infer<typeof RandomLayoutConfig>;
export type RandomLayoutOpts = Partial<RandomLayoutConfigType>;

export class RandomLayout extends SimpleLayoutEngine {
    static type = "random";
    scalingFactor = 100;
    config: RandomLayoutConfigType;

    constructor(opts: RandomLayoutOpts) {
        super(opts);
        this.config = RandomLayoutConfig.parse(opts);
    }

    doLayout(): void {
        this.stale = false;
        const nodes = (): LayoutNode[] => this._nodes.map((n) => n.id as LayoutNode);
        const edges = (): LayoutEdge[] => this._edges.map((e) => [e.srcId, e.dstId] as LayoutEdge);

        this.positions = randomLayout(
            {nodes, edges},
            this.config.center,
            this.config.dim,
            this.config.seed,
        );
    }
}
