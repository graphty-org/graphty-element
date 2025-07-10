import {Edge as LayoutEdge, kamadaKawaiLayout, Node as LayoutNode} from "@graphty/layout";
import {z} from "zod/v4";

import {SimpleLayoutConfig, SimpleLayoutEngine} from "./LayoutEngine";

export const KamadaKawaiLayoutConfig = z.strictObject({
    ... SimpleLayoutConfig.shape,
    dist: z.record(z.number(), z.record(z.number(), z.number())).or(z.null()).default(null),
    pos: z.record(z.number(), z.array(z.number()).min(1).max(3)).or(z.null()).default(null),
    weightProperty: z.string().optional(),
    scale: z.number().positive().default(1),
    center: z.array(z.number()).length(2).or(z.null()).default(null),
    dim: z.number().default(3),
});
export type KamadaKawaiLayoutConfigType = z.infer<typeof KamadaKawaiLayoutConfig>;
export type KamadaKawaiLayoutOpts = Partial<KamadaKawaiLayoutConfigType>;

export class KamadaKawaiLayout extends SimpleLayoutEngine {
    static type = "kamada-kawai";
    static maxDimensions = 3;
    scalingFactor = 50;
    config: KamadaKawaiLayoutConfigType;

    constructor(opts: KamadaKawaiLayoutOpts) {
        super(opts);
        this.config = KamadaKawaiLayoutConfig.parse(opts);
    }

    doLayout(): void {
        this.stale = false;
        const nodes = (): LayoutNode[] => this._nodes.map((n) => n.id as LayoutNode);
        const edges = (): LayoutEdge[] => this._edges.map((e) => [e.srcId, e.dstId] as LayoutEdge);

        this.positions = kamadaKawaiLayout(
            {nodes, edges},
            this.config.dist,
            this.config.pos,
            this.config.weightProperty,
            this.config.scale,
            this.config.center,
            this.config.dim,
        );
    }
}
