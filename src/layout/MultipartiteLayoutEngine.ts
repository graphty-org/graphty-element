import {z} from "zod/v4";
import {SimpleLayoutConfig, SimpleLayoutEngine} from "./LayoutEngine";
// @ts-expect-error graphty layout doesn't currently have types
import {multipartiteLayout} from "@graphty/layout";

export const MultipartiteLayoutConfig = z.strictObject({
    ... SimpleLayoutConfig.shape,
    // subsetKey: z.string().or(z.record(z.number(), z.array(z.string().or(z.number())))),
    subsetKey: z.record(z.string(), z.array(z.string().or(z.number()))),
    align: z.enum(["vertical", "horizontal"]).default("vertical"),
    scale: z.number().positive().default(1),
    center: z.array(z.number()).length(2).or(z.null()).default(null),
});
export type MultipartiteLayoutConfigType = z.infer<typeof MultipartiteLayoutConfig>;
export type MultipartiteLayoutOpts = Partial<MultipartiteLayoutConfigType>;

export class MultipartiteLayout extends SimpleLayoutEngine {
    static type = "multipartite";
    scalingFactor = 40;
    config: MultipartiteLayoutConfigType;

    constructor(opts: MultipartiteLayoutOpts) {
        super(opts);
        this.config = MultipartiteLayoutConfig.parse(opts);
    }

    doLayout(): void {
        this.stale = false;
        const graph = {
            nodes: () => this._nodes.map((n) => n.id),
            edges: () => this._edges.map((e) => [e.srcId, e.dstId]),
        };

        this.positions = multipartiteLayout(
            graph,
            this.config.subsetKey,
            this.config.align,
            this.config.scale,
            this.config.center,
        );
    }
}
