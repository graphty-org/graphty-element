import {
    Edge as D3Edge,
    forceCenter,
    forceLink,
    forceManyBody,
    forceSimulation,
    InputEdge as D3InputEdge,
    Node as D3Node,
} from "d3-force-3d";
import {z} from "zod/v4";

import {defineOptions, type OptionsSchema} from "../config";
import type {Edge} from "../Edge";
import type {Node, NodeIdType} from "../Node";
import {EdgePosition, LayoutEngine, Position} from "./LayoutEngine";

/**
 * Zod-based options schema for D3 Force Layout
 */
export const d3LayoutOptionsSchema = defineOptions({
    alphaMin: {
        schema: z.number().positive().default(0.1),
        meta: {
            label: "Alpha Min",
            description: "Minimum alpha before simulation stops",
            step: 0.01,
            advanced: true,
        },
    },
    alphaTarget: {
        schema: z.number().min(0).default(0),
        meta: {
            label: "Alpha Target",
            description: "Target alpha value",
            step: 0.01,
            advanced: true,
        },
    },
    alphaDecay: {
        schema: z.number().positive().default(0.0228),
        meta: {
            label: "Alpha Decay",
            description: "Rate of alpha decay per tick",
            step: 0.001,
            advanced: true,
        },
    },
    velocityDecay: {
        schema: z.number().positive().default(0.4),
        meta: {
            label: "Velocity Decay",
            description: "Velocity damping factor",
            step: 0.05,
        },
    },
});

interface D3InputNode extends Partial<D3Node> {
    id: NodeIdType;
}

function isD3Node(n: unknown): n is D3Node {
    if (typeof n === "object" &&
        n !== null &&
        "index" in n &&
        typeof n.index === "number" &&
        "x" in n &&
        typeof n.x === "number" &&
        "y" in n &&
        typeof n.y === "number" &&
        "z" in n &&
        typeof n.z === "number" &&
        "vx" in n &&
        typeof n.vx === "number" &&
        "vy" in n &&
        typeof n.vy === "number" &&
        "vz" in n &&
        typeof n.vz === "number") {
        return true;
    }

    return false;
}

export const D3LayoutConfig = z.strictObject({
    alphaMin: z.number().positive().default(0.1),
    alphaTarget: z.number().min(0).default(0),
    alphaDecay: z.number().positive().default(0.0228),
    velocityDecay: z.number().positive().default(0.4),
});

export type D3LayoutOptions = Partial<z.infer<typeof D3LayoutConfig>>;

function isD3Edge(e: unknown): e is D3Edge {
    if (typeof e === "object" &&
        e !== null &&
        Object.hasOwn(e, "index") &&
        "index" in e &&
        typeof e.index === "number" &&
        "source" in e &&
        isD3Node(e.source) &&
        "target" in e &&
        isD3Node(e.target)) {
        return true;
    }

    return false;
}

export class D3GraphEngine extends LayoutEngine {
    static type = "d3";
    static maxDimensions = 3;
    static zodOptionsSchema: OptionsSchema = d3LayoutOptionsSchema;
    d3ForceLayout: ReturnType<typeof forceSimulation>;
    d3AlphaMin: number;
    d3AlphaTarget: number;
    d3AlphaDecay: number;
    d3VelocityDecay: number;
    nodeMapping = new Map<Node, D3Node>();
    edgeMapping = new Map<Edge, D3Edge>();
    newNodeMap = new Map<Node, D3InputNode>();
    newEdgeMap = new Map<Edge, D3InputEdge>();
    reheat = false;

    get graphNeedsRefresh(): boolean {
        return !!this.newNodeMap.size || !!this.newEdgeMap.size;
    }

    constructor(anyOpts: D3LayoutOptions = {}) {
        super();

        const opts = D3LayoutConfig.parse(anyOpts);
        this.d3AlphaMin = opts.alphaMin;
        this.d3AlphaTarget = opts.alphaTarget;
        this.d3AlphaDecay = opts.alphaDecay;
        this.d3VelocityDecay = opts.velocityDecay;

        // https://github.com/vasturiano/d3-force-3d?tab=readme-ov-file#links
        const fl = forceLink();
        fl.strength(0.9);
        this.d3ForceLayout = forceSimulation()
            .numDimensions(3)
            .alpha(1)
            .force("link", fl)
            .force("charge", forceManyBody())
            .force("center", forceCenter())
            .force("dagRadial", null)
            .stop();
        this.d3ForceLayout.force("link").id((d) => (d as D3InputNode).id);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async init(): Promise<void> {}

    refresh(): void {
        if (this.graphNeedsRefresh || this.reheat) {
            // update nodes
            let nodeList: (D3Node | D3InputNode)[] = [... this.nodeMapping.values()];
            nodeList = nodeList.concat([... this.newNodeMap.values()]);
            this.d3ForceLayout
                .alpha(1) // re-heat the simulation
                .nodes(nodeList)
                .stop();

            // copy over new nodes
            for (const entry of this.newNodeMap.entries()) {
                const n = entry[0];
                const d3node = entry[1];
                if (!isD3Node(d3node)) {
                    throw new Error("Internal error: Node is not settled as a complete D3 Node");
                }

                this.nodeMapping.set(n, d3node);
            }
            this.newNodeMap.clear();

            // update edges
            let linkList: (D3Edge | D3InputEdge)[] = [... this.edgeMapping.values()];
            linkList = linkList.concat([... this.newEdgeMap.values()]);
            this.d3ForceLayout
                .force("link")
                .links(linkList);

            // copy over new edges
            for (const entry of this.newEdgeMap.entries()) {
                const e = entry[0];
                const d3edge = entry[1];
                if (!isD3Edge(d3edge)) {
                    throw new Error("Internal error: Edge is not settled as a complete D3 Edge");
                }

                this.edgeMapping.set(e, d3edge);
            }
            this.newEdgeMap.clear();
        }
    }

    step(): void {
        this.refresh();
        this.d3ForceLayout.tick();
    }

    get isSettled(): boolean {
        // If there are pending nodes/edges to be processed, we're not settled
        if (this.graphNeedsRefresh) {
            return false;
        }

        return this.d3ForceLayout.alpha() < this.d3AlphaMin;
    }

    addNode(n: Node): void {
        this.newNodeMap.set(n, {id: n.id});
    }

    addEdge(e: Edge): void {
        this.newEdgeMap.set(e, {
            source: e.srcId,
            target: e.dstId,
        });
    }

    get nodes(): Iterable<Node> {
        return this.nodeMapping.keys();
    }

    get edges(): Iterable<Edge> {
        return this.edgeMapping.keys();
    }

    getNodePosition(n: Node): Position {
        const d3node = this._getMappedNode(n);
        // if (d3node.x === undefined || d3node.y === undefined || d3node.z === undefined) {
        //     throw new Error("Internal error: Node not initialized in D3GraphEngine");
        // }

        return {
            x: d3node.x,
            y: d3node.y,
            z: d3node.z,
        };
    }

    setNodePosition(n: Node, newPos: Position): void {
        const d3node = this._getMappedNode(n);
        d3node.x = newPos.x;
        d3node.y = newPos.y;
        d3node.z = newPos.z ?? 0;
        this.reheat = true;
    }

    getEdgePosition(e: Edge): EdgePosition {
        const d3edge = this._getMappedEdge(e);

        return {
            src: {
                x: d3edge.source.x,
                y: d3edge.source.y,
                z: d3edge.source.z,
            },
            dst: {
                x: d3edge.target.x,
                y: d3edge.target.y,
                z: d3edge.target.z,
            },
        };
    }

    pin(n: Node): void {
        const d3node = this._getMappedNode(n);

        d3node.fx = d3node.x;
        d3node.fy = d3node.y;
        d3node.fz = d3node.z;
        this.reheat = true; // TODO: is this necessary?
    }

    unpin(n: Node): void {
        const d3node = this._getMappedNode(n);

        d3node.fx = undefined;
        d3node.fy = undefined;
        d3node.fz = undefined;
        this.reheat = true; // TODO: is this necessary?
    }

    private _getMappedNode(n: Node): D3Node {
        this.refresh(); // ensure consistent state

        const d3node = this.nodeMapping.get(n);
        if (!d3node) {
            throw new Error("Internal error: Node not found in D3GraphEngine");
        }

        return d3node;
    }

    private _getMappedEdge(e: Edge): D3Edge {
        this.refresh(); // ensure consistent state

        const d3edge = this.edgeMapping.get(e);
        if (!d3edge) {
            throw new Error("Internal error: Edge not found in D3GraphEngine");
        }

        return d3edge;
    }
}
