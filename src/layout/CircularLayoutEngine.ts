import {SimpleLayoutEngine} from "./LayoutEngine";
import {circularLayout} from "@graphty/layout";

export class CircularLayout extends SimpleLayoutEngine {
    static type = "circle";
    scalingFactor = 100;

    doLayout(): void {
        this.stale = false;
        this.positions = circularLayout({
            nodes: () => this._nodes.map((n) => n.id),
            edges: () => this._edges.map((e) => [e.srcId, e.dstId]),
        });
    }
}
