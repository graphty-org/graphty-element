import {arfLayout, Edge as LayoutEdge, Node as LayoutNode} from "@graphty/layout";
import {z} from "zod/v4";

import {SimpleLayoutConfig, SimpleLayoutEngine} from "./LayoutEngine";

export const ArfLayoutConfig = z.strictObject({
    ... SimpleLayoutConfig.shape,
    pos: z.record(
        z.number(),
        z.array(z.number()),
    ).or(z.null()).default(null),
    scaling: z.number().positive().default(1),
    a: z.number().positive().default(1.1),
    maxIter: z.number().positive().default(1000),
    seed: z.number().positive().or(z.null()).default(null),
});
export type ArfLayoutConfigType = z.infer<typeof ArfLayoutConfig>;
export type ArfLayoutOpts = Partial<ArfLayoutConfigType>;

export class ArfLayout extends SimpleLayoutEngine {
    static type = "arf";
    static maxDimensions = 2;
    scalingFactor = 100;
    config: ArfLayoutConfigType;

    constructor(opts: ArfLayoutOpts) {
        super(opts);
        this.config = ArfLayoutConfig.parse(opts);
    }

    static getOptionsForDimension(dimension: 2 | 3): object | null {
        // Arf only supports 2D
        if (dimension > this.maxDimensions) {
            return null;
        }

        // Arf doesn't use 'dim' parameter
        return {};
    }

    doLayout(): void {
        this.stale = false;
        const nodes = (): LayoutNode[] => this._nodes.map((n) => n.id as LayoutNode);
        const edges = (): LayoutEdge[] => this._edges.map((e) => [e.srcId, e.dstId] as LayoutEdge);

        this.positions = arfLayout(
            {nodes, edges},
            this.config.pos,
            this.config.scaling,
            this.config.a,
            this.config.maxIter,
            this.config.seed,
        );
    }
}
