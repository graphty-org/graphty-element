import {z} from "zod/v4";
import type {Edge} from "../Edge";
import type {Node} from "../Node";

export interface Position {
    x: number,
    y: number,
    z?: number,
}

export interface EdgePosition {
    src: Position,
    dst: Position,
}

type LayoutEngineClass = new (opts: object) => LayoutEngine
const layoutEngineRegistry: Map<string, LayoutEngineClass> = new Map();

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

    addNodes(nodes: Array<Node>) {
        for (const n of nodes) {
            this.addNode(n);
        }
    }

    addEdges(edges: Array<Edge>) {
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
    positions: Record<string | number, Array<number>> = {};
    scalingFactor = 100;

    constructor(opts: SimpleLayoutOpts = {}) {
        super();
        const config = SimpleLayoutConfig.parse(opts);
        this.scalingFactor = config.scalingFactor;
    }

    // basic functionality
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
        return this._nodes;
    };

    get edges(): Iterable<Edge> {
        return this._edges;
    };

    get isSettled(): boolean {
        return true;
    };

    abstract doLayout(): void;
}
