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
export const layoutEngineRegistry: Map<string, LayoutEngineClass> = new Map();

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

