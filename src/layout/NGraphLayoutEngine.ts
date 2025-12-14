import ngraphCreateLayout, {Layout as NGraphLayout} from "ngraph.forcelayout";
import createGraph, {Graph as NGraph, Link as NGraphLink, Node as NGraphNode} from "ngraph.graph";
import random from "ngraph.random";

import type {Edge} from "../Edge";
import type {Node} from "../Node";
import {EdgePosition, LayoutEngine, Position} from "./LayoutEngine";

export class NGraphEngine extends LayoutEngine {
    static type = "ngraph";
    static maxDimensions = 3;
    ngraph: NGraph;
    ngraphLayout: NGraphLayout<NGraph>;

    static getOptionsForDimension(dimension: 2 | 3): object {
        return {dim: dimension};
    }
    nodeMapping = new Map<Node, NGraphNode>();
    edgeMapping = new Map<Edge, NGraphLink>();
    _settled = true;
    _stepCount = 0;
    _lastMoves: number[] = [];

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

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async init(): Promise<void> {}

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

    get isSettled(): boolean {
        return this._settled;
    }

    addNode(n: Node): void {
        const ngraphNode: NGraphNode = this.ngraph.addNode(n.id, {parentNode: n});
        this.nodeMapping.set(n, ngraphNode);
        this._settled = false;
        this._stepCount = 0;
        this._lastMoves = [];
    }

    addEdge(e: Edge): void {
        const ngraphEdge = this.ngraph.addLink(e.srcId, e.dstId, {parentEdge: this});
        this.edgeMapping.set(e, ngraphEdge);
        this._settled = false;
        this._stepCount = 0;
        this._lastMoves = [];
    }

    getNodePosition(n: Node): Position {
        const ngraphNode = this._getMappedNode(n);
        return this.ngraphLayout.getNodePosition(ngraphNode.id);
    }

    setNodePosition(n: Node, newPos: Position): void {
        const ngraphNode = this._getMappedNode(n);
        const currPos = this.ngraphLayout.getNodePosition(ngraphNode.id);
        currPos.x = newPos.x;
        currPos.y = newPos.y;
        currPos.z = newPos.z;
    }

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

    get nodes(): Iterable<Node> {
        // ...is this cheating?
        return this.nodeMapping.keys();
    }

    get edges(): Iterable<Edge> {
        return this.edgeMapping.keys();
    }

    pin(n: Node): void {
        const ngraphNode = this._getMappedNode(n);
        this.ngraphLayout.pinNode(ngraphNode, true);
    }

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
