import {Edge as LayoutEdge, Node as LayoutNode, shellLayout} from "@graphty/layout";
import {z} from "zod/v4";

import {SimpleLayoutConfig, SimpleLayoutEngine} from "./LayoutEngine";

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
        const nodes = (): LayoutNode[] => this._nodes.map((n) => n.id as LayoutNode);
        const edges = (): LayoutEdge[] => this._edges.map((e) => [e.srcId, e.dstId] as LayoutEdge);

        this.positions = shellLayout(
            {nodes, edges},
            this.config.nlist,
            this.config.scale,
            this.config.center,
            this.config.dim,
        );
    }
}
