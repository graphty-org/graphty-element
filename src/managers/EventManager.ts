import {Observable} from "@babylonjs/core";

import type {
    DataLoadingCompleteEvent,
    DataLoadingErrorEvent,
    DataLoadingErrorSummaryEvent,
    DataLoadingProgressEvent,
    EdgeEvent,
    EventCallbackType,
    EventType,
    GraphDataAddedEvent,
    GraphDataLoadedEvent,
    GraphErrorEvent,
    GraphEvent,
    GraphGenericEvent,
    GraphLayoutInitializedEvent,
    GraphSettledEvent,
    NodeEvent,
} from "../events";
import type {Graph} from "../Graph";
import type {GraphContext} from "./GraphContext";
import type {Manager} from "./interfaces";

/**
 * Centralized event management for the Graph system
 * Handles all graph, node, and edge events with type safety
 */
export class EventManager implements Manager {
    // Observables for different event types
    private graphObservable = new Observable<GraphEvent>();
    private nodeObservable = new Observable<NodeEvent>();
    private edgeObservable = new Observable<EdgeEvent>();

    // Expose for testing and advanced usage
    get onGraphEvent(): Observable<GraphEvent> {
        return this.graphObservable;
    }

    get onGraphError(): Observable<GraphErrorEvent> {
        return this.graphObservable as Observable<GraphErrorEvent>;
    }

    // Track observers for cleanup
    // Using any here is required due to BabylonJS Observable/Observer type limitations
    private observers = new Map<symbol, {
        type: "graph" | "node" | "edge";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        observable: any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        observer: any;
    }>();

    // Error handling configuration
    private errorRetryCount = 3;
    private errorRetryDelay = 1000; // ms

    async init(): Promise<void> {
        // EventManager doesn't need async initialization
        return Promise.resolve();
    }

    dispose(): void {
        // Clear all observers
        for (const {observable, observer} of this.observers.values()) {
            observable.remove(observer);
        }
        this.observers.clear();

        // Clear observables
        this.graphObservable.clear();
        this.nodeObservable.clear();
        this.edgeObservable.clear();
    }

    // Graph Events

    emitGraphSettled(graph: Graph): void {
        const event: GraphSettledEvent = {
            type: "graph-settled",
            graph,
        };
        this.graphObservable.notifyObservers(event);
    }

    emitGraphError(
        graph: Graph | GraphContext | null,
        error: Error,
        context: GraphErrorEvent["context"],
        details?: Record<string, unknown>,
    ): void {
        const event: GraphErrorEvent = {
            type: "error",
            graph: graph as Graph | null,
            error,
            context,
            details,
        };
        this.graphObservable.notifyObservers(event);
    }

    emitGraphDataLoaded(
        graph: Graph | GraphContext,
        chunksLoaded: number,
        dataSourceType: string,
    ): void {
        const event: GraphDataLoadedEvent = {
            type: "data-loaded",
            graph: graph as Graph,
            details: {
                chunksLoaded,
                dataSourceType,
            },
        };
        this.graphObservable.notifyObservers(event);
    }

    emitDataAdded(
        dataType: "nodes" | "edges",
        count: number,
        shouldStartLayout: boolean,
        shouldZoomToFit: boolean,
    ): void {
        const event: GraphDataAddedEvent = {
            type: "data-added",
            dataType,
            count,
            shouldStartLayout,
            shouldZoomToFit,
        };
        this.graphObservable.notifyObservers(event);
    }

    emitLayoutInitialized(
        layoutType: string,
        shouldZoomToFit: boolean,
    ): void {
        const event: GraphLayoutInitializedEvent = {
            type: "layout-initialized",
            layoutType,
            shouldZoomToFit,
        };
        this.graphObservable.notifyObservers(event);
    }

    // Generic graph event emitter for internal events
    emitGraphEvent(type: string, data: Record<string, unknown>): void {
        const event = {type, ... data} as GraphGenericEvent;
        this.graphObservable.notifyObservers(event);
    }

    // Data Loading Events

    emitDataLoadingProgress(
        format: string,
        bytesProcessed: number,
        totalBytes: number | undefined,
        nodesLoaded: number,
        edgesLoaded: number,
        chunksProcessed: number,
    ): void {
        const event: DataLoadingProgressEvent = {
            type: "data-loading-progress",
            format,
            bytesProcessed,
            totalBytes,
            percentage: totalBytes ? (bytesProcessed / totalBytes) * 100 : undefined,
            nodesLoaded,
            edgesLoaded,
            chunksProcessed,
        };
        this.graphObservable.notifyObservers(event);
    }

    emitDataLoadingError(
        error: Error,
        context: DataLoadingErrorEvent["context"],
        format: string | undefined,
        details: {
            line?: number;
            nodeId?: unknown;
            edgeId?: string;
            canContinue: boolean;
        },
    ): void {
        const event: DataLoadingErrorEvent = {
            type: "data-loading-error",
            error,
            context,
            format,
            ... details,
        };
        this.graphObservable.notifyObservers(event);
    }

    emitDataLoadingErrorSummary(
        format: string,
        totalErrors: number,
        message: string,
        detailedReport: string,
        primaryCategory?: string,
        suggestion?: string,
    ): void {
        const event: DataLoadingErrorSummaryEvent = {
            type: "data-loading-error-summary",
            format,
            totalErrors,
            primaryCategory,
            message,
            suggestion,
            detailedReport,
        };
        this.graphObservable.notifyObservers(event);
    }

    emitDataLoadingComplete(
        format: string,
        nodesLoaded: number,
        edgesLoaded: number,
        duration: number,
        errors: number,
        warnings: number,
        success: boolean,
    ): void {
        const event: DataLoadingCompleteEvent = {
            type: "data-loading-complete",
            format,
            nodesLoaded,
            edgesLoaded,
            duration,
            errors,
            warnings,
            success,
        };
        this.graphObservable.notifyObservers(event);
    }

    // Node Events

    emitNodeEvent(type: NodeEvent["type"], eventData: Omit<NodeEvent, "type">): void {
        const event = {type, ... eventData} as NodeEvent;
        this.nodeObservable.notifyObservers(event);
    }

    // Edge Events

    emitEdgeEvent(type: EdgeEvent["type"], eventData: Omit<EdgeEvent, "type">): void {
        const event = {type, ... eventData} as EdgeEvent;
        this.edgeObservable.notifyObservers(event);
    }

    // Event Listeners

    /**
     * Add a listener for a specific event type
     * Returns a symbol that can be used to remove the listener
     */
    addListener(type: EventType, callback: EventCallbackType): symbol {
        const id = Symbol("event-listener");

        switch (type) {
            case "graph-settled":
            case "error":
            case "data-loaded":
            case "data-added":
            case "layout-initialized":
            case "skybox-loaded":
            case "operation-queue-active":
            case "operation-queue-idle":
            case "operation-batch-complete":
            case "operation-start":
            case "operation-complete":
            case "operation-progress":
            case "operation-obsoleted":
            case "animation-progress":
            case "animation-cancelled":
            case "screenshot-enhancing":
            case "screenshot-ready":
            case "style-changed":
            case "camera-state-changed":
            case "data-loading-progress":
            case "data-loading-error":
            case "data-loading-error-summary":
            case "data-loading-complete": {
                const observer = this.graphObservable.add((event) => {
                    if (event.type === type) {
                        callback(event);
                    }
                });
                this.observers.set(id, {
                    type: "graph",
                    observable: this.graphObservable,
                    observer,
                });
                break;
            }

            case "node-update-after":
            case "node-update-before":
            case "node-add-before": {
                const observer = this.nodeObservable.add((event) => {
                    if (event.type === type) {
                        callback(event);
                    }
                });
                this.observers.set(id, {
                    type: "node",
                    observable: this.nodeObservable,
                    observer,
                });
                break;
            }

            case "edge-update-after":
            case "edge-update-before":
            case "edge-add-before": {
                const observer = this.edgeObservable.add((event) => {
                    if (event.type === type) {
                        callback(event);
                    }
                });
                this.observers.set(id, {
                    type: "edge",
                    observable: this.edgeObservable,
                    observer,
                });
                break;
            }

            default:
                throw new TypeError(`Unknown event type: ${type}`);
        }

        return id;
    }

    /**
     * Remove a listener by its ID
     */
    removeListener(id: symbol): boolean {
        const entry = this.observers.get(id);
        if (!entry) {
            return false;
        }

        entry.observable.remove(entry.observer);
        this.observers.delete(id);
        return true;
    }

    /**
     * Get the total number of registered listeners
     */
    listenerCount(): number {
        return this.observers.size;
    }

    /**
     * Add a one-time listener that automatically removes itself after firing
     */
    once(type: EventType, callback: EventCallbackType): symbol {
        const id = this.addListener(type, (event) => {
            callback(event);
            this.removeListener(id);
        });
        return id;
    }

    /**
     * Wait for a specific event to occur
     * Returns a promise that resolves with the event
     */
    waitFor(type: EventType, timeout?: number): Promise<GraphEvent | NodeEvent | EdgeEvent | import("../events").AiEvent> {
        return new Promise((resolve, reject) => {
            const timeoutId = timeout ? setTimeout(() => {
                this.removeListener(listenerId);
                reject(new Error(`Timeout waiting for event: ${type}`));
            }, timeout) : undefined;

            const listenerId = this.once(type, (event) => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }

                resolve(event);
            });
        });
    }

    // Error Handling with Retry

    /**
     * Execute an async operation with automatic retry on failure
     * Emits error events for each failure
     */
    async withRetry<T>(
        operation: () => Promise<T>,
        context: GraphErrorEvent["context"],
        graph: Graph | GraphContext | null,
        details?: Record<string, unknown>,
    ): Promise<T> {
        let lastError: Error | undefined;

        for (let attempt = 0; attempt < this.errorRetryCount; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));

                // Emit error event for this attempt
                this.emitGraphError(graph, lastError, context, {
                    ... details,
                    attempt: attempt + 1,
                    maxAttempts: this.errorRetryCount,
                });

                // Don't delay after the last attempt
                if (attempt < this.errorRetryCount - 1) {
                    // Exponential backoff
                    const delay = this.errorRetryDelay * Math.pow(2, attempt);
                    await new Promise((resolve) => setTimeout(resolve, delay));
                }
            }
        }

        // All attempts failed
        throw lastError ?? new Error("Operation failed with no recorded error");
    }
}
