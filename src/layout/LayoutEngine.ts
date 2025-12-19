import {z} from "zod/v4";

import type {OptionsSchema} from "../config";
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

/**
 * Interface for LayoutEngine class static members
 * Exported for use in type annotations when referencing layout classes
 */
export interface LayoutEngineStatics {
    type: string;
    maxDimensions: number;
    zodOptionsSchema?: OptionsSchema;
    getZodOptionsSchema(): OptionsSchema;
    hasZodOptions(): boolean;
}

export abstract class LayoutEngine {
    static type: string;
    static maxDimensions: number;
    config?: Record<string, unknown>;

    /**
     * NEW: Zod-based options schema for unified validation and UI metadata
     *
     * Subclasses should override this to define their configurable options
     * using the new Zod-based schema system.
     */
    static zodOptionsSchema?: OptionsSchema;

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

    addNodes(nodes: Node[]): void {
        for (const n of nodes) {
            this.addNode(n);
        }
    }

    addEdges(edges: Edge[]): void {
        for (const e of edges) {
            this.addEdge(e);
        }
    }

    get type(): string {
        return (this.constructor as typeof LayoutEngine).type;
    }

    static register<T extends LayoutEngineClass>(cls: T): T {
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

    static getOptionsForDimension(dimension: 2 | 3): object | null {
        // Check if this layout supports the requested dimension
        if (dimension > this.maxDimensions) {
            return null;
        }

        // Default implementation returns nothing - subclasses override to provide
        // dimension-specific options (e.g., { dim: 2 } or { twoD: true })
        return {};
    }

    static getOptionsForDimensionByType(type: string, dimension: 2 | 3): object | null {
        const SourceClass = layoutEngineRegistry.get(type);
        if (!SourceClass) {
            return null;
        }

        return ((SourceClass as unknown) as typeof LayoutEngine).getOptionsForDimension(dimension);
    }

    /**
     * Get the Zod-based options schema for this layout
     *
     * @returns The options schema, or an empty object if no schema defined
     */
    static getZodOptionsSchema(): OptionsSchema {
        return this.zodOptionsSchema ?? {};
    }

    /**
     * Check if this layout has a Zod-based options schema
     *
     * @returns true if the layout has options defined
     */
    static hasZodOptions(): boolean {
        return this.zodOptionsSchema !== undefined && Object.keys(this.zodOptionsSchema).length > 0;
    }

    /**
     * Get a list of all registered layout types
     */
    static getRegisteredTypes(): string[] {
        return Array.from(layoutEngineRegistry.keys());
    }

    /**
     * Get a layout class by type
     */
    static getClass(type: string): (LayoutEngineClass & LayoutEngineStatics) | null {
        return layoutEngineRegistry.get(type) as (LayoutEngineClass & LayoutEngineStatics) | null ?? null;
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

    static getOptionsForDimension(dimension: 2 | 3): object | null {
        // Check if this layout supports the requested dimension
        if (dimension > this.maxDimensions) {
            return null;
        }

        // Most simple layouts use 'dim' parameter
        return {dim: dimension};
    }

    // basic functionality
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async init(): Promise<void> {}

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

    readonly isSettled = true;

    abstract doLayout(): void;
}

interface Coords {
    x: number;
    y: number;
    z: number;
}

function posToCoords(pos: number[] | undefined, scale: number): Coords {
    if (!pos || pos.length === 0) {
        // Return default position if pos is undefined or empty
        return {x: 0, y: 0, z: 0};
    }

    const x = pos[0] * scale;
    const y = pos[1] * scale;
    const z = (pos[2] ?? 0) * scale;
    // const z = pos[0] * scale;
    // const x = (pos[2] ?? 0) * scale;

    return {x, y, z};
}
