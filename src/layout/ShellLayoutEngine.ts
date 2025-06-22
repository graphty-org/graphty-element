import {z} from "zod/v4";
import {SimpleLayoutConfig, SimpleLayoutEngine} from "./LayoutEngine";
// @ts-expect-error graphty layout doesn't currently have types
import {shellLayout} from "@graphty/layout";

export const ShellLayoutConfig = z.strictObject({
    ... SimpleLayoutConfig.shape,
    nlist: z.array(z.array(z.number())).or(z.null()).default(null),
    dim: z.number().default(2),
    center: z.array(z.number()).length(2).or(z.null()).default(null),
    scale: z.number().positive().default(1),
});
export type ShellLayoutConfigType = z.infer<typeof ShellLayoutConfig>;
export type ShellLayoutOpts = Partial<ShellLayoutConfigType>;

export class ShellLayout extends SimpleLayoutEngine {
    static type = "shell";
    scalingFactor = 100;
    config: ShellLayoutConfigType;

    constructor(opts: ShellLayoutOpts) {
        super(opts);
        this.config = ShellLayoutConfig.parse(opts);
    }

    doLayout(): void {
        this.stale = false;
        const graph = {
            nodes: () => this._nodes.map((n) => n.id),
            edges: () => this._edges.map((e) => [e.srcId, e.dstId]),
        };

        this.positions = shellLayout(
            graph,
            this.config.nlist,
            this.config.scale,
            this.config.center,
            this.config.dim,
        );
    }
}
