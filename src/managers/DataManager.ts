import jmespath from "jmespath";

import type {AdHocData} from "../config";
import {DataSource} from "../data/DataSource";
import {Edge, EdgeMap} from "../Edge";
import type {LayoutEngine} from "../layout/LayoutEngine";
import {MeshCache} from "../meshes/MeshCache";
import {Node, NodeIdType} from "../Node";
import type {Stats} from "../Stats";
import type {Styles} from "../Styles";
import type {EventManager} from "./EventManager";
import type {Manager} from "./interfaces";

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

    // Mesh cache for performance
    meshCache: MeshCache;

    // Reference to parent graph (temporary until full refactoring)
    private parentGraph: any;

    constructor(
        private eventManager: EventManager,
        private styles: Styles,
        private stats: Stats,
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
    private applyStylesToExistingNodes(): void {
        for (const n of this.nodes.values()) {
            const styleId = this.styles.getStyleForNode(n.data);
            n.changeManager.loadCalculatedValues(this.styles.getCalculatedStylesForNode(n.data));
            n.updateStyle(styleId);
        }
    }

    /**
     * Apply styles to all existing edges
     */
    private applyStylesToExistingEdges(): void {
        for (const e of this.edges.values()) {
            const styleId = this.styles.getStyleForEdge(e.data);
            e.updateStyle(styleId);
        }
    }

    /**
     * Set the parent graph reference
     * This is temporary until we complete the full refactoring
     */
    setParentGraph(graph: any): void {
        this.parentGraph = graph;
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
            const n = new Node(this.parentGraph, nodeId, styleId, node as AdHocData, {
                pinOnDrag: this.parentGraph?.pinOnDrag,
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
        if (nodes.length > 0 && this.parentGraph) {
            this.parentGraph.running = true;
            // Request zoom to fit when new nodes are added
            this.parentGraph.needsZoomToFit = true;
        }
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
        if (this.layoutEngine && "removeNode" in this.layoutEngine) {
            (this.layoutEngine as any).removeNode(node);
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

            const style = this.styles.getStyleForEdge(edge as AdHocData);
            const opts = {};
            const e = new Edge(this.parentGraph, srcNodeId, dstNodeId, style, edge as AdHocData, opts);
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
        if (edges.length > 0 && this.parentGraph) {
            this.parentGraph.running = true;
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
        if (this.layoutEngine && "removeEdge" in this.layoutEngine) {
            (this.layoutEngine as any).removeEdge(edge);
        }

        return true;
    }

    // Data source operations

    async addDataFromSource(type: string, opts: object = {}): Promise<void> {
        this.stats.loadTime.beginMonitoring();

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
                this.eventManager.emitGraphError(
                    this.parentGraph,
                    error instanceof Error ? error : new Error(String(error)),
                    "data-loading",
                    {chunksLoaded, dataSourceType: type},
                );

                throw new Error(`Failed to load data from source '${type}' after ${chunksLoaded} chunks: ${error instanceof Error ? error.message : String(error)}`);
            }

            this.stats.loadTime.endMonitoring();

            // Emit success event
            this.eventManager.emitGraphDataLoaded(this.parentGraph, chunksLoaded, type);
        } catch (error) {
            this.stats.loadTime.endMonitoring();

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

        // Clear mesh cache
        this.meshCache.clear();

        // TODO: Notify layout engine to clear
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
