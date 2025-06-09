import {EdgePosition, LayoutEngine, Position} from "./LayoutEngine";
import type {Edge} from "../Edge";
import type {Node} from "../Node";
import {spiralLayout} from "@graphty/layout";

export class SpiralLayout extends LayoutEngine {
    static type = "spiral";
    #nodes: Node[] = [];
    #edges: Edge[] = [];
    stale = true;
    positions: Record<string | number, Array<number>> = {};
    scalingFactor = 50;

    // basic functionality
    async init() {}

    addNode(n: Node): void {
        this.#nodes.push(n);
        this.stale = true;
    };

    addEdge(e: Edge): void {
        this.#edges.push(e);
        this.stale = true;
    };

    getNodePosition(n: Node): Position {
        if (this.stale) {
            this.doLayout();
        }

        const positions = this.positions[n.id];

        return {x: positions[0] * this.scalingFactor, y: positions[1] * this.scalingFactor};
    };

    setNodePosition(n: Node, p: Position): void {
        n;
        p;
    };

    getEdgePosition(e: Edge): EdgePosition{
        if (this.stale) {
            this.doLayout();
        }

        const srcPos = this.positions[e.srcId];
        const dstPos = this.positions[e.dstId];

        return {
            src: {x: srcPos[0] * this.scalingFactor, y: srcPos[1] * this.scalingFactor},
            dst: {x: dstPos[0] * this.scalingFactor, y: dstPos[1] * this.scalingFactor},
        };
    };

    // for animated layouts
    step(): void {};

    pin(n: Node): void{
        n;
    };

    unpin(n: Node): void {
        n;
    };

    // properties
    get nodes(): Iterable<Node> {
        return this.#nodes;
    };

    get edges(): Iterable<Edge> {
        return this.#edges;
    };

    get isSettled(): boolean {
        return true;
    };

    doLayout(): void {
        this.stale = false;
        this.positions = spiralLayout({
            nodes: () => this.#nodes.map((n) => n.id),
            edges: () => this.#edges.map((e) => [e.srcId, e.dstId]),
        });
    }
}
