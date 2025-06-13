import {z} from "zod/v4";
import {SimpleLayoutConfig, SimpleLayoutEngine} from "./LayoutEngine";
// @ts-expect-error graphty layout doesn't currently have types
import {kamadaKawaiLayout} from "@graphty/layout";

export const KamadaKawaiLayoutConfig = z.strictObject({
    ... SimpleLayoutConfig.shape,
    dist: z.record(z.number(), z.record(z.number(), z.number())).or(z.null()).default(null),
    pos: z.record(z.number(), z.array(z.number()).min(1).max(3)).or(z.null()).default(null),
    weightProperty: z.string().or(z.null()).default(null),
    scale: z.number().positive().default(1),
    center: z.array(z.number()).length(2).or(z.null()).default(null),
    dim: z.number().default(2),

});
export type KamadaKawaiLayoutConfigType = z.infer<typeof KamadaKawaiLayoutConfig>
export type KamadaKawaiLayoutOpts = Partial<KamadaKawaiLayoutConfigType>

export class KamadaKawaiLayout extends SimpleLayoutEngine {
    static type = "kamada-kawai";
    scalingFactor = 100;
    config: KamadaKawaiLayoutConfigType;

    constructor(opts: KamadaKawaiLayoutOpts) {
        super(opts);
        this.config = KamadaKawaiLayoutConfig.parse(opts);
    }

    doLayout(): void {
        this.stale = false;
        const graph = {
            nodes: () => this._nodes.map((n) => n.id),
            edges: () => this._edges.map((e) => [e.srcId, e.dstId]),
        };

        this.positions = kamadaKawaiLayout(
            graph,
            this.config.dist,
            this.config.pos,
            this.config.weightProperty,
            this.config.scale,
            this.config.center,
            this.config.dim,
        );
    }
}
