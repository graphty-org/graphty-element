import {Edge as LayoutEdge, Node as LayoutNode, spiralLayout} from "@graphty/layout";
import {z} from "zod/v4";

import {SimpleLayoutConfig, SimpleLayoutEngine} from "./LayoutEngine";

export const SpiralLayoutConfig = z.strictObject({
    ... SimpleLayoutConfig.shape,
    scale: z.number().positive().default(1),
    center: z.array(z.number()).length(2).or(z.null()).default(null),
    dim: z.number().default(2),
    resolution: z.number().positive().default(0.35),
    equidistant: z.boolean().default(false),
});
export type SpiralLayoutConfigType = z.infer<typeof SpiralLayoutConfig>;
export type SpiralLayoutOpts = Partial<SpiralLayoutConfigType>;

export class SpiralLayout extends SimpleLayoutEngine {
    static type = "spiral";
    scalingFactor = 80;
    config: SpiralLayoutConfigType;

    constructor(opts: SpiralLayoutOpts) {
        super(opts);
        this.config = SpiralLayoutConfig.parse(opts);
    }

    doLayout(): void {
        this.stale = false;
        const nodes = () => this._nodes.map((n) => n.id as LayoutNode);
        const edges = () => this._edges.map((e) => [e.srcId, e.dstId] as LayoutEdge);

        this.positions = spiralLayout(
            {nodes, edges},
            this.config.scale,
            this.config.center,
            this.config.dim,
            this.config.resolution,
            this.config.equidistant,
        );
    }
}
