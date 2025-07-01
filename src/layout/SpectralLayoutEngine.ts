import {Edge as LayoutEdge, Node as LayoutNode, spectralLayout} from "@graphty/layout";
import {z} from "zod/v4";

import {SimpleLayoutConfig, SimpleLayoutEngine} from "./LayoutEngine";

export const SpectralLayoutConfig = z.strictObject({
    ... SimpleLayoutConfig.shape,
    scale: z.number().positive().default(1),
    center: z.array(z.number()).length(2).or(z.null()).default(null),
    dim: z.number().default(2),
});
export type SpectralLayoutConfigType = z.infer<typeof SpectralLayoutConfig>;
export type SpectralLayoutOpts = Partial<SpectralLayoutConfigType>;

export class SpectralLayout extends SimpleLayoutEngine {
    static type = "spectral";
    scalingFactor = 100;
    config: SpectralLayoutConfigType;

    constructor(opts: SpectralLayoutOpts) {
        super(opts);
        this.config = SpectralLayoutConfig.parse(opts);
    }

    doLayout(): void {
        this.stale = false;
        const nodes = (): LayoutNode[] => this._nodes.map((n) => n.id as LayoutNode);
        const edges = (): LayoutEdge[] => this._edges.map((e) => [e.srcId, e.dstId] as LayoutEdge);

        this.positions = spectralLayout(
            {nodes, edges},
            this.config.scale,
            this.config.center,
            this.config.dim,
        );
    }
}
