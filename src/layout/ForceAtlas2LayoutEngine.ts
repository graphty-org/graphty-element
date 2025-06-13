import {z} from "zod/v4";
import {SimpleLayoutConfig, SimpleLayoutEngine} from "./LayoutEngine";
// @ts-expect-error graphty layout doesn't currently have types
import {forceatlas2Layout} from "@graphty/layout";

export const ForceAtlas2LayoutConfig = z.strictObject({
    ... SimpleLayoutConfig.shape,
    pos: z.record(z.number(), z.array(z.number()).min(2).max(3)).or(z.null()).default(null),
    maxIter: z.number().positive().default(100),
    jitterTolerance: z.number().positive().default(1.0),
    scalingRatio: z.number().positive().default(2.0),
    gravity: z.number().positive().default(1.0),
    distributedAction: z.boolean().default(false),
    strongGravity: z.boolean().default(false),
    nodeMass: z.record(z.number(), z.number()).or(z.null()).default(null),
    nodeSize: z.record(z.number(), z.number()).or(z.null()).default(null),
    weightPath: z.string().or(z.null()).default(null),
    dissuadeHubs: z.boolean().default(false),
    linlog: z.boolean().default(false),
    seed: z.number().or(z.null()).default(null),
    dim: z.number().default(2),
});
export type ForceAtlas2LayoutConfigType = z.infer<typeof ForceAtlas2LayoutConfig>
export type ForceAtlas2LayoutOpts = Partial<ForceAtlas2LayoutConfigType>

export class ForceAtlas2Layout extends SimpleLayoutEngine {
    static type = "forceatlas2";
    scalingFactor = 100;
    config: ForceAtlas2LayoutConfigType;

    constructor(opts: ForceAtlas2LayoutOpts) {
        super(opts);
        this.config = ForceAtlas2LayoutConfig.parse(opts);
    }

    doLayout(): void {
        this.stale = false;
        const graph = {
            nodes: () => this._nodes.map((n) => n.id),
            edges: () => this._edges.map((e) => [e.srcId, e.dstId]),
        };

        this.positions = forceatlas2Layout(
            graph,
            this.config.pos,
            this.config.maxIter,
            this.config.jitterTolerance,
            this.config.scalingRatio,
            this.config.gravity,
            this.config.distributedAction,
            this.config.strongGravity,
            this.config.nodeMass,
            this.config.nodeSize,
            this.config.weightPath,
            this.config.dissuadeHubs,
            this.config.linlog,
            this.config.seed,
            this.config.dim,
        );
    }
}
