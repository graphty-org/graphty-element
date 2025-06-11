import {z} from "zod/v4";
import {SimpleLayoutConfig, SimpleLayoutEngine} from "./LayoutEngine";
// @ts-expect-error graphty layout doesn't currently have types
import {spiralLayout} from "@graphty/layout";

export const SpiralLayoutConfig = SimpleLayoutConfig.extend({
    scale: z.number().positive().default(1),
    center: z.array(z.number()).length(2).or(z.null()).default(null),
    dim: z.number().default(2),
    resolution: z.number().positive().default(0.35),
    equidistant: z.boolean().default(false),
});
export type SpiralLayoutConfigType = z.infer<typeof SpiralLayoutConfig>
export type SpiralLayoutOpts = Partial<SpiralLayoutConfigType>

export class SpiralLayout extends SimpleLayoutEngine {
    static type = "spiral";
    scalingFactor = 100;
    config: SpiralLayoutConfigType;

    constructor(opts: SpiralLayoutOpts) {
        super(opts);
        this.config = SpiralLayoutConfig.parse(opts);
    }

    doLayout(): void {
        this.stale = false;
        const graph = {
            nodes: () => this._nodes.map((n) => n.id),
            edges: () => this._edges.map((e) => [e.srcId, e.dstId]),
        };

        this.positions = spiralLayout(
            graph,
            this.config.scale,
            this.config.center,
            this.config.dim,
            this.config.resolution,
            this.config.equidistant,
        );
    }
}
