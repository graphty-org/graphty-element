import {z} from "zod/v4";
import {SimpleLayoutConfig, SimpleLayoutEngine} from "./LayoutEngine";
// @ts-expect-error graphty layout doesn't currently have types
import {bipartiteLayout} from "@graphty/layout";

export const BipartiteLayoutConfig = z.strictObject({
    ... SimpleLayoutConfig.shape,
    nodes: z.array(z.number().or(z.string())),
    align: z.enum(["vertical", "horizontal"]).default("vertical"),
    scale: z.number().positive().default(1),
    center: z.array(z.number()).length(2).or(z.null()).default(null),
    aspectRatio: z.number().positive().default(4 / 3),
});
export type BipartiteLayoutConfigType = z.infer<typeof BipartiteLayoutConfig>
export type BipartiteLayoutOpts = Partial<BipartiteLayoutConfigType>

export class BipartiteLayout extends SimpleLayoutEngine {
    static type = "bipartite";
    scalingFactor = 40;
    config: BipartiteLayoutConfigType;

    constructor(opts: BipartiteLayoutOpts) {
        super(opts);
        this.config = BipartiteLayoutConfig.parse(opts);
    }

    doLayout(): void {
        this.stale = false;
        const graph = {
            nodes: () => this._nodes.map((n) => n.id),
            edges: () => this._edges.map((e) => [e.srcId, e.dstId]),
        };

        this.positions = bipartiteLayout(
            graph,
            this.config.nodes,
            this.config.align,
            this.config.scale,
            this.config.center,
            this.config.aspectRatio,
        );
    }
}
