import {z} from "zod/v4";
import {SimpleLayoutConfig, SimpleLayoutEngine} from "./LayoutEngine";
// @ts-expect-error graphty layout doesn't currently have types
import {spectralLayout} from "@graphty/layout";

export const SpectralLayoutConfig = SimpleLayoutConfig.extend({
    scale: z.number().positive().default(1),
    center: z.array(z.number()).length(2).or(z.null()).default(null),
    dim: z.number().default(2),
});
export type SpectralLayoutConfigType = z.infer<typeof SpectralLayoutConfig>
export type SpectralLayoutOpts = Partial<SpectralLayoutConfigType>

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
        // const numNodes = 15;
        // const nodes = Array.from({length: numNodes}, (_, i) => i);
        // const edges: Array<Array<number>> = [];

        // const numEdges = Math.floor(numNodes * 1.5);
        // for (let i = 0; i < numEdges; i++) {
        //     const a = Math.floor(Math.random() * numNodes);
        //     const b = Math.floor(Math.random() * numNodes);
        //     if (a !== b && !edges.some((e) => (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a))) {
        //         edges.push([a, b]);
        //     }
        // }

        // console.log("nodes", JSON.stringify(nodes.map((n) => {
        //     return {id: n};
        // })));
        // console.log("edges", JSON.stringify(edges.map((e) => {
        //     return {src: e[0], dst: e[1]};
        // })));
        // const graph = {nodes: () => nodes, edges: () => edges};

        const graph = {
            nodes: () => this._nodes.map((n) => n.id),
            edges: () => this._edges.map((e) => [e.srcId, e.dstId]),
        };

        this.positions = spectralLayout(
            graph,
            this.config.scale,
            this.config.center,
            this.config.dim,
        );
    }
}
