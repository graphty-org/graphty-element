import type {AiStatus} from "./ai/AiStatus";
import type {CommandResult} from "./ai/commands/types";
import type {NodeIdType} from "./config";
import type {Edge} from "./Edge";
import type {Graph} from "./Graph";
import type {Node} from "./Node";

export type EventType =
    GraphEventType |
    NodeEventType |
    EdgeEventType |
    AiEventType;
export type EventCallbackType = (evt: GraphEvent | NodeEvent | EdgeEvent | AiEvent) => void;

export type GraphEventType = GraphEvent["type"];
export type NodeEventType = NodeEvent["type"];
export type EdgeEventType = EdgeEvent["type"];
export type AiEventType = AiEvent["type"];

// graph events
export type GraphEvent = GraphSettledEvent | GraphErrorEvent | GraphDataLoadedEvent | GraphDataAddedEvent | GraphLayoutInitializedEvent | CameraStateChangedEvent | GraphGenericEvent | DataLoadingProgressEvent | DataLoadingErrorEvent | DataLoadingErrorSummaryEvent | DataLoadingCompleteEvent | SelectionChangedEvent;

export interface GraphSettledEvent {
    type: "graph-settled";
    graph: Graph;
}

export interface GraphErrorEvent {
    type: "error";
    graph: Graph | null;
    error: Error;
    context: "init" | "data-loading" | "layout" | "algorithm" | "xr" | "other";
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

export interface CameraStateChangedEvent {
    type: "camera-state-changed";
    state: {
        position?: {x: number, y: number, z: number};
        target?: {x: number, y: number, z: number};
        zoom?: number;
        pan?: {x: number, y: number};
        [key: string]: unknown;
    };
}

// Generic events for internal manager communication
export interface GraphGenericEvent {
    type: "render-initialized" | "manager-initialized" | "lifecycle-initialized" | "lifecycle-disposed" | "skybox-loaded"
        | "operation-queue-active" | "operation-queue-idle" | "operation-batch-complete"
        | "operation-start" | "operation-complete" | "operation-progress" | "operation-obsoleted"
        | "animation-progress" | "animation-cancelled"
        | "screenshot-enhancing" | "screenshot-ready"
        | "style-changed";
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

// Selection events
export interface SelectionChangedEvent {
    type: "selection-changed";
    previousNode: Node | null;
    currentNode: Node | null;
    previousNodeId: string | number | null;
    currentNodeId: string | number | null;
}

// node events
export type NodeEvent = NodeGenericEvent | NodeAddEvent | NodeClickEvent | NodeHoverEvent | NodeDragStartEvent | NodeDragEndEvent;

export interface NodeGenericEvent {
    type: "node-update-after" | "node-update-before";
    node: Node;
}

export interface NodeAddEvent {
    type: "node-add-before";
    nodeId: NodeIdType;
    metadata: object;
}

/**
 * Emitted when a node is clicked.
 * @since 1.5.0
 */
export interface NodeClickEvent {
    type: "node-click";
    node: Node;
    data: Record<string, unknown>;
    event: PointerEvent;
}

/**
 * Emitted when the pointer enters a node (hover start).
 * @since 1.5.0
 */
export interface NodeHoverEvent {
    type: "node-hover";
    node: Node;
    data: Record<string, unknown>;
}

/**
 * Emitted when a node drag operation starts.
 * @since 1.5.0
 */
export interface NodeDragStartEvent {
    type: "node-drag-start";
    node: Node;
    position: {x: number, y: number, z: number};
}

/**
 * Emitted when a node drag operation ends.
 * @since 1.5.0
 */
export interface NodeDragEndEvent {
    type: "node-drag-end";
    node: Node;
    position: {x: number, y: number, z: number};
}

// edge events
export type EdgeEvent = EdgeGenericEvent | EdgeAddEvent | EdgeClickEvent;

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

/**
 * Emitted when an edge is clicked.
 * @since 1.5.0
 */
export interface EdgeClickEvent {
    type: "edge-click";
    edge: Edge;
    data: Record<string, unknown>;
    event: PointerEvent;
}

// AI events (Phase 7)
export type AiEvent =
    | AiStatusChangeEvent
    | AiCommandStartEvent
    | AiCommandCompleteEvent
    | AiCommandErrorEvent
    | AiCommandCancelledEvent
    | AiStreamChunkEvent
    | AiStreamToolCallEvent
    | AiStreamToolResultEvent
    | AiVoiceStartEvent
    | AiVoiceTranscriptEvent
    | AiVoiceEndEvent;

/** Main event for UI binding - single source of truth for AI status */
export interface AiStatusChangeEvent {
    type: "ai-status-change";
    status: AiStatus;
}

/** Emitted when an AI command starts processing */
export interface AiCommandStartEvent {
    type: "ai-command-start";
    input: string;
    timestamp: number;
}

/** Emitted when an AI command completes successfully */
export interface AiCommandCompleteEvent {
    type: "ai-command-complete";
    result: CommandResult;
    duration: number;
}

/** Emitted when an AI command encounters an error */
export interface AiCommandErrorEvent {
    type: "ai-command-error";
    error: Error;
    input: string;
    canRetry: boolean;
}

/** Emitted when an AI command is cancelled */
export interface AiCommandCancelledEvent {
    type: "ai-command-cancelled";
    input: string;
    reason: "user" | "timeout";
}

/** Emitted during streaming when text chunks arrive (throttled) */
export interface AiStreamChunkEvent {
    type: "ai-stream-chunk";
    text: string;
    accumulated: string;
}

/** Emitted when the LLM makes a tool call */
export interface AiStreamToolCallEvent {
    type: "ai-stream-tool-call";
    name: string;
    params: unknown;
}

/** Emitted when a tool call completes */
export interface AiStreamToolResultEvent {
    type: "ai-stream-tool-result";
    name: string;
    result: unknown;
    success: boolean;
}

/** Emitted when voice input starts */
export interface AiVoiceStartEvent {
    type: "ai-voice-start";
}

/** Emitted when voice transcript is available */
export interface AiVoiceTranscriptEvent {
    type: "ai-voice-transcript";
    transcript: string;
    isFinal: boolean;
}

/** Emitted when voice input ends */
export interface AiVoiceEndEvent {
    type: "ai-voice-end";
    reason: "user" | "timeout" | "error";
}
