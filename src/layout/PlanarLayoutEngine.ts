import {Edge as LayoutEdge, Node as LayoutNode, planarLayout} from "@graphty/layout";
import {z} from "zod/v4";

import {SimpleLayoutConfig, SimpleLayoutEngine} from "./LayoutEngine";

export const PlanarLayoutConfig = z.strictObject({
    ... SimpleLayoutConfig.shape,
    scale: z.number().positive().default(1),
    center: z.array(z.number()).length(2).or(z.null()).default(null),
    dim: z.number().default(2),
    seed: z.number().or(z.null()).default(null),
});
export type PlanarLayoutConfigType = z.infer<typeof PlanarLayoutConfig>;
export type PlanarLayoutOpts = Partial<PlanarLayoutConfigType>;

export class PlanarLayout extends SimpleLayoutEngine {
    static type = "planar";
    static maxDimensions = 2;
    scalingFactor = 70;
    config: PlanarLayoutConfigType;

    constructor(opts: PlanarLayoutOpts) {
        super(opts);
        this.config = PlanarLayoutConfig.parse(opts);
    }

    doLayout(): void {
        this.stale = false;
        const nodes = (): LayoutNode[] => this._nodes.map((n) => n.id as LayoutNode);
        const edges = (): LayoutEdge[] => this._edges.map((e) => [e.srcId, e.dstId] as LayoutEdge);

        this.positions = planarLayout(
            {nodes, edges},
            this.config.scale,
            this.config.center,
            this.config.dim,
            this.config.seed,
        );
    }
}
