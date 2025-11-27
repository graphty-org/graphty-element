import jmespath from "jmespath";

import type {AdHocData} from "../config";
import {DataSource} from "../data/DataSource";
import {Edge, EdgeMap} from "../Edge";
import type {LayoutEngine} from "../layout/LayoutEngine";
import {MeshCache} from "../meshes/MeshCache";
import {Node, NodeIdType} from "../Node";
import type {Styles} from "../Styles";
import type {EventManager} from "./EventManager";
import type {GraphContext} from "./GraphContext";
import type {Manager} from "./interfaces";

// Type guards for layout engines with optional removal methods
type LayoutEngineWithRemoveNode = LayoutEngine & {removeNode(node: Node): void};
type LayoutEngineWithRemoveEdge = LayoutEngine & {removeEdge(edge: Edge): void};

function hasRemoveNode(engine: LayoutEngine): engine is LayoutEngineWithRemoveNode {
    return "removeNode" in engine;
}

function hasRemoveEdge(engine: LayoutEngine): engine is LayoutEngineWithRemoveEdge {
    return "removeEdge" in engine;
}

/**
 * Manages all data operations for nodes and edges
 * Handles CRUD operations, caching, and data source loading
 */
export class DataManager implements Manager {
    // Node and edge collections
    nodes = new Map<string | number, Node>();
    edges = new Map<string | number, Edge>();
    nodeCache = new Map<NodeIdType, Node>();
    edgeCache = new EdgeMap();

    // Graph-level algorithm results storage
    graphResults?: AdHocData;

    // Mesh cache for performance
    meshCache: MeshCache;

    // GraphContext for creating nodes and edges
    private graphContext: GraphContext | null = null;

    // State management flags
    private shouldStartLayout = false;
    private shouldZoomToFit = false;

    // Buffer for edges added before their nodes exist
    private bufferedEdges: {
        edge: Record<string | number, unknown>;
        srcIdPath?: string;
        dstIdPath?: string;
    }[] = [];

    constructor(
        private eventManager: EventManager,
        private styles: Styles,
    ) {
        this.meshCache = new MeshCache();
    }

    /**
     * Update the styles reference when styles change
     */
    updateStyles(styles: Styles): void {
        this.styles = styles;
        // Re-apply styles to all existing nodes and edges
        this.applyStylesToExistingNodes();
        this.applyStylesToExistingEdges();
    }

    /**
     * Apply styles to all existing nodes
     */
    applyStylesToExistingNodes(): void {
        for (const n of this.nodes.values()) {
            // Run calculated values immediately since node data (including algorithmResults) is already populated
            // This sets values in n.styleUpdates (same as changeManager.dataObjects.style)
            n.changeManager.loadCalculatedValues(this.styles.getCalculatedStylesForNode(n.data), true);
            // Call update() to merge calculated style updates with the base style
            // update() checks styleUpdates and creates a new styleId that includes calculated values
            n.update();
        }
    }

    /**
     * Apply styles to all existing edges
     */
    applyStylesToExistingEdges(): void {
        for (const e of this.edges.values()) {
            const styleId = this.styles.getStyleForEdge(e.data, e.algorithmResults);
            e.updateStyle(styleId);
        }
    }

    /**
     * Set the GraphContext for creating nodes and edges
     */
    setGraphContext(context: GraphContext): void {
        this.graphContext = context;
    }

    /**
     * Set the layout engine reference for adding nodes/edges
     */
    private layoutEngine?: LayoutEngine;

    setLayoutEngine(engine: LayoutEngine | undefined): void {
        this.layoutEngine = engine;
    }

    async init(): Promise<void> {
        // DataManager doesn't need async initialization
        return Promise.resolve();
    }

    dispose(): void {
        // Clear all collections
        this.nodes.clear();
        this.edges.clear();
        this.nodeCache.clear();
        this.edgeCache.clear();

        // Clear graph-level results
        this.graphResults = undefined;

        // Clear mesh cache
        this.meshCache.clear();
    }

    // Node operations

    addNode(node: AdHocData, idPath?: string): void {
        this.addNodes([node], idPath);
    }

    addNodes(nodes: Record<string | number, unknown>[], idPath?: string): void {
        // create path to node ids
        const query = idPath ?? this.styles.config.data.knownFields.nodeIdPath;

        // create nodes
        for (const node of nodes) {
            const nodeId = jmespath.search(node, query) as NodeIdType;

            if (this.nodeCache.get(nodeId)) {
                continue;
            }

            const styleId = this.styles.getStyleForNode(node as AdHocData);
            if (!this.graphContext) {
                throw new Error("GraphContext not set. Call setGraphContext before adding nodes.");
            }

            const n = new Node(this.graphContext, nodeId, styleId, node as AdHocData, {
                pinOnDrag: this.graphContext.getConfig().pinOnDrag,
            });
            this.nodeCache.set(nodeId, n);
            this.nodes.set(nodeId, n);

            // Add to layout engine if it exists
            if (this.layoutEngine) {
                this.layoutEngine.addNode(n);
            }

            // Emit node added event
            this.eventManager.emitNodeEvent("node-add-before", {
                nodeId,
                metadata: node,
            });
        }

        // Notify that nodes were added
        if (nodes.length > 0) {
            // Request layout start and zoom to fit
            this.shouldStartLayout = true;
            this.shouldZoomToFit = true;

            // Process any buffered edges whose nodes now exist
            this.processBufferedEdges();

            // Emit event to notify graph that data has been added
            this.eventManager.emitDataAdded("nodes", nodes.length, true, true);
        }
    }

    /**
     * Process buffered edges whose nodes now exist
     * Called after nodes are added to retry edge creation
     */
    private processBufferedEdges(): void {
        if (this.bufferedEdges.length === 0) {
            return;
        }

        // Try to process all buffered edges
        const stillBuffered: typeof this.bufferedEdges = [];

        for (const {edge, srcIdPath, dstIdPath} of this.bufferedEdges) {
            // get paths
            const srcQuery = srcIdPath ?? this.styles.config.data.knownFields.edgeSrcIdPath;
            const dstQuery = dstIdPath ?? this.styles.config.data.knownFields.edgeDstIdPath;

            const srcNodeId = jmespath.search(edge, srcQuery) as NodeIdType;
            const dstNodeId = jmespath.search(edge, dstQuery) as NodeIdType;

            // Check if both nodes now exist
            const srcNode = this.nodeCache.get(srcNodeId);
            const dstNode = this.nodeCache.get(dstNodeId);

            if (!srcNode || !dstNode) {
                // Nodes still don't exist, keep in buffer
                stillBuffered.push({edge, srcIdPath, dstIdPath});
                continue;
            }

            // Check if edge already exists
            if (this.edgeCache.get(srcNodeId, dstNodeId)) {
                continue;
            }

            // Create the edge now that both nodes exist
            const style = this.styles.getStyleForEdge(edge as AdHocData);
            const opts = {};
            if (!this.graphContext) {
                throw new Error("GraphContext not set. Call setGraphContext before adding edges.");
            }

            const e = new Edge(this.graphContext, srcNodeId, dstNodeId, style, edge as AdHocData, opts);
            this.edgeCache.set(srcNodeId, dstNodeId, e);
            this.edges.set(e.id, e);

            // Add to layout engine if it exists
            if (this.layoutEngine) {
                this.layoutEngine.addEdge(e);
            }

            // Emit edge added event
            this.eventManager.emitEdgeEvent("edge-add-before", {
                srcNodeId,
                dstNodeId,
                metadata: edge,
            });
        }

        // Update buffer with edges that still couldn't be processed
        this.bufferedEdges = stillBuffered;
    }

    getNode(nodeId: NodeIdType): Node | undefined {
        return this.nodes.get(nodeId);
    }

    removeNode(nodeId: NodeIdType): boolean {
        const node = this.nodes.get(nodeId);
        if (!node) {
            return false;
        }

        // Remove from collections
        this.nodes.delete(nodeId);
        this.nodeCache.delete(nodeId);

        // Remove from layout engine
        if (this.layoutEngine && hasRemoveNode(this.layoutEngine)) {
            this.layoutEngine.removeNode(node);
        }

        // TODO: Remove connected edges

        return true;
    }

    // Edge operations

    addEdge(edge: AdHocData, srcIdPath?: string, dstIdPath?: string): void {
        this.addEdges([edge], srcIdPath, dstIdPath);
    }

    addEdges(edges: Record<string | number, unknown>[], srcIdPath?: string, dstIdPath?: string): void {
        // get paths
        const srcQuery = srcIdPath ?? this.styles.config.data.knownFields.edgeSrcIdPath;
        const dstQuery = dstIdPath ?? this.styles.config.data.knownFields.edgeDstIdPath;

        // create edges
        for (const edge of edges) {
            const srcNodeId = jmespath.search(edge, srcQuery) as NodeIdType;
            const dstNodeId = jmespath.search(edge, dstQuery) as NodeIdType;

            if (this.edgeCache.get(srcNodeId, dstNodeId)) {
                continue;
            }

            // Check if both nodes exist before creating edge
            const srcNode = this.nodeCache.get(srcNodeId);
            const dstNode = this.nodeCache.get(dstNodeId);

            if (!srcNode || !dstNode) {
                // Buffer this edge to be processed later when nodes exist
                this.bufferedEdges.push({edge, srcIdPath, dstIdPath});
                continue;
            }

            const style = this.styles.getStyleForEdge(edge as AdHocData);
            const opts = {};
            if (!this.graphContext) {
                throw new Error("GraphContext not set. Call setGraphContext before adding edges.");
            }

            const e = new Edge(this.graphContext, srcNodeId, dstNodeId, style, edge as AdHocData, opts);
            this.edgeCache.set(srcNodeId, dstNodeId, e);
            this.edges.set(e.id, e);

            // Add to layout engine if it exists
            if (this.layoutEngine) {
                this.layoutEngine.addEdge(e);
            }

            // Emit edge added event
            this.eventManager.emitEdgeEvent("edge-add-before", {
                srcNodeId,
                dstNodeId,
                metadata: edge,
            });
        }

        // Notify that edges were added
        if (edges.length > 0) {
            // Request layout start
            this.shouldStartLayout = true;
            // Emit event to notify graph that data has been added
            this.eventManager.emitDataAdded("edges", edges.length, true, false);
        }
    }

    getEdge(edgeId: string | number): Edge | undefined {
        return this.edges.get(edgeId);
    }

    getEdgeBetween(srcNodeId: NodeIdType, dstNodeId: NodeIdType): Edge | undefined {
        return this.edgeCache.get(srcNodeId, dstNodeId);
    }

    removeEdge(edgeId: string | number): boolean {
        const edge = this.edges.get(edgeId);
        if (!edge) {
            return false;
        }

        // Remove from collections
        this.edges.delete(edgeId);
        this.edgeCache.delete(edge.srcNode.id, edge.dstNode.id);

        // Remove from layout engine
        if (this.layoutEngine && hasRemoveEdge(this.layoutEngine)) {
            this.layoutEngine.removeEdge(edge);
        }

        return true;
    }

    // Data source operations

    async addDataFromSource(type: string, opts: object = {}): Promise<void> {
        try {
            const source = DataSource.get(type, opts);
            if (!source) {
                throw new TypeError(`No data source named: ${type}`);
            }

            let chunksLoaded = 0;
            try {
                for await (const chunk of source.getData()) {
                    this.addNodes(chunk.nodes);
                    this.addEdges(chunk.edges);
                    chunksLoaded++;
                }
            } catch (error) {
                // Emit error event with partial load information
                if (this.graphContext) {
                    this.eventManager.emitGraphError(
                        this.graphContext,
                        error instanceof Error ? error : new Error(String(error)),
                        "data-loading",
                        {chunksLoaded, dataSourceType: type},
                    );
                }

                throw new Error(`Failed to load data from source '${type}' after ${chunksLoaded} chunks: ${error instanceof Error ? error.message : String(error)}`);
            }

            // Emit success event
            if (this.graphContext) {
                this.eventManager.emitGraphDataLoaded(this.graphContext, chunksLoaded, type);
            }
        } catch (error) {
            // Re-throw if already a processed error
            if (error instanceof Error && error.message.includes("Failed to load data")) {
                throw error;
            }

            // Otherwise wrap and throw
            throw new Error(`Error initializing data source '${type}': ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    // Utility methods

    /**
     * Clear all data
     */
    clear(): void {
        // Remove all nodes and edges
        this.nodes.clear();
        this.edges.clear();
        this.nodeCache.clear();
        this.edgeCache.clear();

        // Clear graph-level results
        this.graphResults = undefined;

        // Clear mesh cache
        this.meshCache.clear();

        // TODO: Notify layout engine to clear
    }

    /**
     * Start label animations for all nodes
     * Called when layout has settled
     */
    startLabelAnimations(): void {
        for (const node of this.nodes.values()) {
            node.label?.startAnimation();
        }
    }

    /**
     * Get statistics about the data
     */
    getStats(): {
        nodeCount: number;
        edgeCount: number;
        cachedMeshes: number;
    } {
        return {
            nodeCount: this.nodes.size,
            edgeCount: this.edges.size,
            cachedMeshes: this.meshCache.size(),
        };
    }
}
