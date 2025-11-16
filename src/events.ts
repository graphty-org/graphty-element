import type {NodeIdType} from "./config";
import type {Edge} from "./Edge";
import type {Graph} from "./Graph";
import type {Node} from "./Node";

export type EventType =
    GraphEventType |
    NodeEventType |
    EdgeEventType;
export type EventCallbackType = (evt: GraphEvent | NodeEvent | EdgeEvent) => void;

export type GraphEventType = GraphEvent["type"];
export type NodeEventType = NodeEvent["type"];
export type EdgeEventType = EdgeEvent["type"];

// graph events
export type GraphEvent = GraphSettledEvent | GraphErrorEvent | GraphDataLoadedEvent | GraphDataAddedEvent | GraphLayoutInitializedEvent | GraphGenericEvent | DataLoadingProgressEvent | DataLoadingErrorEvent | DataLoadingErrorSummaryEvent | DataLoadingCompleteEvent;

export interface GraphSettledEvent {
    type: "graph-settled";
    graph: Graph;
}

export interface GraphErrorEvent {
    type: "error";
    graph: Graph | null;
    error: Error;
    context: "init" | "data-loading" | "layout" | "algorithm" | "other";
    details?: Record<string, unknown>;
}

export interface GraphDataLoadedEvent {
    type: "data-loaded";
    graph: Graph;
    details: {
        chunksLoaded: number;
        dataSourceType: string;
    };
}

export interface GraphDataAddedEvent {
    type: "data-added";
    dataType: "nodes" | "edges";
    count: number;
    shouldStartLayout: boolean;
    shouldZoomToFit: boolean;
}

export interface GraphLayoutInitializedEvent {
    type: "layout-initialized";
    layoutType: string;
    shouldZoomToFit: boolean;
}

// Generic events for internal manager communication
export interface GraphGenericEvent {
    type: "render-initialized" | "manager-initialized" | "lifecycle-initialized" | "lifecycle-disposed" | "skybox-loaded"
        | "operation-queue-active" | "operation-queue-idle" | "operation-batch-complete"
        | "operation-start" | "operation-complete" | "operation-progress" | "operation-obsoleted";
    [key: string]: unknown;
}

// Data loading events
export interface DataLoadingProgressEvent {
    type: "data-loading-progress";
    format: string;
    bytesProcessed: number;
    totalBytes?: number;
    percentage?: number;
    nodesLoaded: number;
    edgesLoaded: number;
    chunksProcessed: number;
}

export interface DataLoadingErrorEvent {
    type: "data-loading-error";
    error: Error;
    context: "detection" | "validation" | "parsing";
    format?: string;
    line?: number;
    nodeId?: unknown;
    edgeId?: string;
    canContinue: boolean;
}

export interface DataLoadingErrorSummaryEvent {
    type: "data-loading-error-summary";
    format: string;
    totalErrors: number;
    primaryCategory?: string;
    message: string;
    suggestion?: string;
    detailedReport: string;
}

export interface DataLoadingCompleteEvent {
    type: "data-loading-complete";
    format: string;
    nodesLoaded: number;
    edgesLoaded: number;
    duration: number; // milliseconds
    errors: number;
    warnings: number;
    success: boolean;
}

// node events
export type NodeEvent = NodeGenericEvent | NodeAddEvent;

export interface NodeGenericEvent {
    type: "node-update-after" | "node-update-before";
    node: Node;
}

export interface NodeAddEvent {
    type: "node-add-before";
    nodeId: NodeIdType;
    metadata: object;
}

// edge events
export type EdgeEvent = EdgeGenericEvent | EdgeAddEvent;

export interface EdgeGenericEvent {
    type: "edge-update-after" | "edge-update-before";
    edge: Edge;
}

export interface EdgeAddEvent {
    type: "edge-add-before";
    srcNodeId: NodeIdType;
    dstNodeId: NodeIdType;
    metadata: object;
}
