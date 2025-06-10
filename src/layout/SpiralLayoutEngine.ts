import {SimpleLayoutEngine} from "./LayoutEngine";
import {spiralLayout} from "@graphty/layout";

export class SpiralLayout extends SimpleLayoutEngine {
    static type = "spiral";
    scalingFactor = 100;

    doLayout(): void {
        this.stale = false;
        this.positions = spiralLayout({
            nodes: () => this._nodes.map((n) => n.id),
            edges: () => this._edges.map((e) => [e.srcId, e.dstId]),
        });
    }
}
