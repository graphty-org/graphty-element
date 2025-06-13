import {z} from "zod/v4";
import {SimpleLayoutConfig, SimpleLayoutEngine} from "./LayoutEngine";
// @ts-expect-error graphty layout doesn't currently have types
import {circularLayout} from "@graphty/layout";

export const CircularLayoutConfig = z.strictObject({
    ... SimpleLayoutConfig.shape,
    scale: z.number().positive().default(1),
    center: z.array(z.number()).length(2).or(z.null()).default(null),
    dim: z.number().default(2),
});
export type CircularLayoutConfigType = z.infer<typeof CircularLayoutConfig>
export type CircularLayoutOpts = Partial<CircularLayoutConfigType>

export class CircularLayout extends SimpleLayoutEngine {
    static type = "circular";
    scalingFactor = 100;
    config: CircularLayoutConfigType;

    constructor(opts: CircularLayoutOpts) {
        super(opts);
        this.config = CircularLayoutConfig.parse(opts);
    }

    doLayout(): void {
        this.stale = false;
        const graph = {
            nodes: () => this._nodes.map((n) => n.id),
            edges: () => this._edges.map((e) => [e.srcId, e.dstId]),
        };

        this.positions = circularLayout(
            graph,
            this.config.scale,
            this.config.center,
            this.config.dim,
        );
    }
}
