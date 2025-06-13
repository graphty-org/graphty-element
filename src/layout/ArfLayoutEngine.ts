import {z} from "zod/v4";
import {SimpleLayoutConfig, SimpleLayoutEngine} from "./LayoutEngine";
// @ts-expect-error graphty layout doesn't currently have types
import {arfLayout} from "@graphty/layout";

export const ArfLayoutConfig = SimpleLayoutConfig.extend({
//  * @param {Object} pos - Initial positions for nodes
//  * @param {number} scaling - Scale factor for positions
//  * @param {number} a - Strength of springs between connected nodes (should be > 1)
//  * @param {number} maxIter - Maximum number of iterations
//  * @param {number|null} seed - Random seed for initial positions
// function arfLayout(G, pos = null, scaling = 1, a = 1.1, maxIter = 1000, seed = null) {

    pos: z.record(
        z.number(),
        z.array(z.number()),
    ).or(z.null()).default(null),
    scaling: z.number().positive().default(1),
    a: z.number().positive().default(1.1),
    maxIter: z.number().positive().default(1000),
    seed: z.number().positive().or(z.null()).default(null),
});
export type ArfLayoutConfigType = z.infer<typeof ArfLayoutConfig>
export type ArfLayoutOpts = Partial<ArfLayoutConfigType>

export class ArfLayout extends SimpleLayoutEngine {
    static type = "arf";
    scalingFactor = 100;
    config: ArfLayoutConfigType;

    constructor(opts: ArfLayoutOpts) {
        super(opts);
        this.config = ArfLayoutConfig.parse(opts);
    }

    doLayout(): void {
        this.stale = false;
        const graph = {
            nodes: () => this._nodes.map((n) => n.id),
            edges: () => this._edges.map((e) => [e.srcId, e.dstId]),
        };

        console.log("rendering arf");
        this.positions = arfLayout(
            graph,
            this.config.pos,
            this.config.scaling,
            this.config.a,
            this.config.maxIter,
            this.config.seed,
        );
    }
}
