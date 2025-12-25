import ngraphCreateLayout, {Layout as NGraphLayout} from "ngraph.forcelayout";
import createGraph, {Graph as NGraph, Link as NGraphLink, Node as NGraphNode} from "ngraph.graph";
import random from "ngraph.random";
import {z} from "zod/v4";

import {defineOptions, type OptionsSchema} from "../config";
import type {Edge} from "../Edge";
import type {Node} from "../Node";
import {EdgePosition, LayoutEngine, Position} from "./LayoutEngine";

/**
 * Zod-based options schema for NGraph Force Layout
 */
export const ngraphLayoutOptionsSchema = defineOptions({
    dim: {
        schema: z.number().int().min(2).max(3).default(3),
        meta: {
            label: "Dimensions",
            description: "Layout dimensionality (2D or 3D)",
        },
    },
    springLength: {
        schema: z.number().positive().default(30),
        meta: {
            label: "Spring Length",
            description: "Ideal spring length between connected nodes",
        },
    },
    springCoefficient: {
        schema: z.number().positive().default(0.0008),
        meta: {
            label: "Spring Coefficient",
            description: "Spring stiffness coefficient",
            step: 0.0001,
            advanced: true,
        },
    },
    gravity: {
        schema: z.number().default(-1.2),
        meta: {
            label: "Gravity",
            description: "Gravity strength (negative for repulsion)",
            step: 0.1,
        },
    },
    theta: {
        schema: z.number().positive().default(0.8),
        meta: {
            label: "Theta",
            description: "Barnes-Hut approximation parameter",
            step: 0.1,
            advanced: true,
        },
    },
    dragCoefficient: {
        schema: z.number().positive().default(0.02),
        meta: {
            label: "Drag Coefficient",
            description: "Velocity damping coefficient",
            step: 0.01,
            advanced: true,
        },
    },
    timeStep: {
        schema: z.number().positive().default(20),
        meta: {
            label: "Time Step",
            description: "Simulation time step size",
            advanced: true,
        },
    },
    seed: {
        schema: z.number().int().positive().nullable().default(null),
        meta: {
            label: "Random Seed",
            description: "Seed for reproducible layout",
            advanced: true,
        },
    },
});

/**
 * NGraph force-directed layout engine using ngraph.forcelayout
 */
export class NGraphEngine extends LayoutEngine {
    static type = "ngraph";
    static maxDimensions = 3;
    static zodOptionsSchema: OptionsSchema = ngraphLayoutOptionsSchema;
    ngraph: NGraph;
    ngraphLayout: NGraphLayout<NGraph>;

    /**
     * Get dimension-specific options for NGraph layout
     * @param dimension - The desired dimension (2 or 3)
     * @returns Options object with dim parameter
     */
    static getOptionsForDimension(dimension: 2 | 3): object {
        return {dim: dimension};
    }
    nodeMapping = new Map<Node, NGraphNode>();
    edgeMapping = new Map<Edge, NGraphLink>();
    _settled = true;
    _stepCount = 0;
    _lastMoves: number[] = [];

    /**
     * Create an NGraph layout engine
     * @param config - Configuration options for the NGraph simulation
     */
    constructor(config: object = {}) {
        super();
        this.ngraph = createGraph();

        // Cast config to a more specific type for property access
        const typedConfig = config as Record<string, unknown>;

        // Build ngraph configuration from provided config
        const ngraphConfig: Record<string, unknown> = {
            dimensions: typedConfig.dim !== undefined ? typedConfig.dim : 3,
        };

        // Map from layout config to ngraph parameters
        if (typedConfig.springLength !== undefined) {
            ngraphConfig.springLength = typedConfig.springLength;
        }

        if (typedConfig.springCoefficient !== undefined) {
            ngraphConfig.springCoefficient = typedConfig.springCoefficient;
        }

        if (typedConfig.gravity !== undefined) {
            ngraphConfig.gravity = typedConfig.gravity;
        }

        if (typedConfig.theta !== undefined) {
            ngraphConfig.theta = typedConfig.theta;
        }

        if (typedConfig.dragCoefficient !== undefined) {
            ngraphConfig.dragCoefficient = typedConfig.dragCoefficient;
        }

        if (typedConfig.timeStep !== undefined) {
            ngraphConfig.timeStep = typedConfig.timeStep;
        }

        // Add random number generator with seed if provided
        if (typedConfig.seed !== undefined && typeof typedConfig.seed === "number") {
            ngraphConfig.random = random(typedConfig.seed);
        }

        this.ngraphLayout = ngraphCreateLayout(this.ngraph, ngraphConfig);
    }

    /**
     * Initialize the layout engine
     *
     * NGraph layout is initialized in the constructor and doesn't require
     * additional async initialization.
     */
    async init(): Promise<void> {
        // No-op - NGraph layout is ready after construction
    }

    /**
     * Advance the NGraph simulation by one step
     */
    step(): void {
        const ngraphSettled = this.ngraphLayout.step();
        const {lastMove} = this.ngraphLayout;
        const nodeCount = this.nodeMapping.size;
        const ratio = nodeCount > 0 ? lastMove / nodeCount : 0;

        this._stepCount++;

        // Keep track of last 10 moves for averaging
        this._lastMoves.push(ratio);
        if (this._lastMoves.length > 10) {
            this._lastMoves.shift();
        }

        // Calculate average movement over last 10 steps
        const avgMovement = this._lastMoves.length > 0 ?
            this._lastMoves.reduce((a, b) => a + b, 0) / this._lastMoves.length :
            0;

        // Use a more forgiving threshold or force settling after many steps
        const customThreshold = 0.05; // More forgiving than ngraph's 0.01
        const maxSteps = 1000; // Force settling after 1000 steps

        this._settled = ngraphSettled ||
                       avgMovement <= customThreshold ||
                       this._stepCount >= maxSteps;
    }

    /**
     * Check if the simulation has settled
     * @returns True if the simulation has settled
     */
    get isSettled(): boolean {
        return this._settled;
    }

    /**
     * Add a node to the NGraph simulation
     * @param n - The node to add
     */
    addNode(n: Node): void {
        const ngraphNode: NGraphNode = this.ngraph.addNode(n.id, {parentNode: n});
        this.nodeMapping.set(n, ngraphNode);
        this._settled = false;
        this._stepCount = 0;
        this._lastMoves = [];
    }

    /**
     * Add an edge to the NGraph simulation
     * @param e - The edge to add
     */
    addEdge(e: Edge): void {
        const ngraphEdge = this.ngraph.addLink(e.srcId, e.dstId, {parentEdge: this});
        this.edgeMapping.set(e, ngraphEdge);
        this._settled = false;
        this._stepCount = 0;
        this._lastMoves = [];
    }

    /**
     * Get the current position of a node
     * @param n - The node to get position for
     * @returns The node's position coordinates
     */
    getNodePosition(n: Node): Position {
        const ngraphNode = this._getMappedNode(n);
        return this.ngraphLayout.getNodePosition(ngraphNode.id);
    }

    /**
     * Set a node's position in the simulation
     * @param n - The node to set position for
     * @param newPos - The new position coordinates
     */
    setNodePosition(n: Node, newPos: Position): void {
        const ngraphNode = this._getMappedNode(n);
        const currPos = this.ngraphLayout.getNodePosition(ngraphNode.id);
        currPos.x = newPos.x;
        currPos.y = newPos.y;
        currPos.z = newPos.z;
    }

    /**
     * Get the position of an edge based on its endpoint positions
     * @param e - The edge to get position for
     * @returns The edge's source and destination positions
     */
    getEdgePosition(e: Edge): EdgePosition {
        const ngraphEdge = this._getMappedEdge(e);
        const pos = this.ngraphLayout.getLinkPosition(ngraphEdge.id);
        return {
            src: {
                x: pos.from.x,
                y: pos.from.y,
                z: pos.from.z,
            },
            dst: {
                x: pos.to.x,
                y: pos.to.y,
                z: pos.to.z,
            },
        };
    }

    /**
     * Get all nodes in the simulation
     * @returns Iterable of nodes
     */
    get nodes(): Iterable<Node> {
        // ...is this cheating?
        return this.nodeMapping.keys();
    }

    /**
     * Get all edges in the simulation
     * @returns Iterable of edges
     */
    get edges(): Iterable<Edge> {
        return this.edgeMapping.keys();
    }

    /**
     * Pin a node to its current position
     * @param n - The node to pin
     */
    pin(n: Node): void {
        const ngraphNode = this._getMappedNode(n);
        this.ngraphLayout.pinNode(ngraphNode, true);
    }

    /**
     * Unpin a node to allow it to move freely
     * @param n - The node to unpin
     */
    unpin(n: Node): void {
        const ngraphNode = this._getMappedNode(n);
        this.ngraphLayout.pinNode(ngraphNode, false);
    }

    private _getMappedNode(n: Node): NGraphNode {
        const ngraphNode = this.nodeMapping.get(n);
        if (!ngraphNode) {
            throw new Error("Internal error: Node not found in NGraphEngine");
        }

        return ngraphNode;
    }

    private _getMappedEdge(e: Edge): NGraphLink {
        const ngraphNode = this.edgeMapping.get(e);
        if (!ngraphNode) {
            throw new Error("Internal error: Edge not found in NGraphEngine");
        }

        return ngraphNode;
    }
}
