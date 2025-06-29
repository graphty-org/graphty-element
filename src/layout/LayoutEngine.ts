import {z} from "zod/v4";

import type {Edge} from "../Edge";
import type {Node} from "../Node";

export interface Position {
    x: number;
    y: number;
    z?: number;
}

export interface EdgePosition {
    src: Position;
    dst: Position;
}

type LayoutEngineClass = new (opts: object) => LayoutEngine;
const layoutEngineRegistry = new Map<string, LayoutEngineClass>();

export abstract class LayoutEngine {
    static type: string;

    // basic functionality
    abstract init(): Promise<void>;
    abstract addNode(n: Node): void;
    abstract addEdge(e: Edge): void;
    abstract getNodePosition(n: Node): Position;
    abstract setNodePosition(n: Node, p: Position): void;
    abstract getEdgePosition(e: Edge): EdgePosition;
    // for animated layouts
    abstract step(): void;
    abstract pin(n: Node): void;
    abstract unpin(n: Node): void;
    // properties
    abstract get nodes(): Iterable<Node>;
    abstract get edges(): Iterable<Edge>;
    abstract get isSettled(): boolean;

    addNodes(nodes: Node[]) {
        for (const n of nodes) {
            this.addNode(n);
        }
    }

    addEdges(edges: Edge[]) {
        for (const e of edges) {
            this.addEdge(e);
        }
    }

    get type() {
        return (this.constructor as typeof LayoutEngine).type;
    }

    static register<T extends LayoutEngineClass>(cls: T) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const t: string = (cls as any).type;
        layoutEngineRegistry.set(t, cls);
        return cls;
    }

    static get(type: string, opts: object = {}): LayoutEngine | null {
        const SourceClass = layoutEngineRegistry.get(type);
        if (SourceClass) {
            return new SourceClass(opts);
        }

        return null;
    }
}

export const SimpleLayoutConfig = z.looseObject({
    scalingFactor: z.number().default(100),
});
export type SimpleLayoutConfigType = z.infer<typeof SimpleLayoutConfig>;
export type SimpleLayoutOpts = Partial<SimpleLayoutConfigType>;

export abstract class SimpleLayoutEngine extends LayoutEngine {
    static type: string;
    protected _nodes: Node[] = [];
    protected _edges: Edge[] = [];
    stale = true;
    positions: Record<string | number, number[]> = {};
    scalingFactor = 100;

    constructor(opts: SimpleLayoutOpts = {}) {
        super();
        const config = SimpleLayoutConfig.parse(opts);
        this.scalingFactor = config.scalingFactor;
    }

    // basic functionality
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async init() {}

    addNode(n: Node): void {
        this._nodes.push(n);
        this.stale = true;
    };

    addEdge(e: Edge): void {
        this._edges.push(e);
        this.stale = true;
    };

    getNodePosition(n: Node): Position {
        if (this.stale) {
            this.doLayout();
        }

        return posToCoords(this.positions[n.id], this.scalingFactor);
    };

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setNodePosition(): void {};

    getEdgePosition(e: Edge): EdgePosition{
        if (this.stale) {
            this.doLayout();
        }

        return {
            src: posToCoords(this.positions[e.srcId], this.scalingFactor),
            dst: posToCoords(this.positions[e.dstId], this.scalingFactor),
        };
    };

    // for animated layouts
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    step(): void {};

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    pin(): void{};

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    unpin(): void {};

    // properties
    get nodes(): Iterable<Node> {
        return this._nodes;
    };

    get edges(): Iterable<Edge> {
        return this._edges;
    };

    readonly isSettled = true; ;

    abstract doLayout(): void;
}

function posToCoords(pos: number[], scale: number) {
    const x = pos[0] * scale;
    const y = pos[1] * scale;
    const z = (pos[2] ?? 0) * scale;
    // const z = pos[0] * scale;
    // const x = (pos[2] ?? 0) * scale;

    return {x, y, z};
}
