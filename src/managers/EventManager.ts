import {Observable} from "@babylonjs/core";

import type {
    EdgeEvent,
    EventCallbackType,
    EventType,
    GraphDataLoadedEvent,
    GraphErrorEvent,
    GraphEvent,
    GraphGenericEvent,
    GraphSettledEvent,
    NodeEvent,
} from "../events";
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

    // Track observers for cleanup
    private observers = new Map<symbol, {
        type: "graph" | "node" | "edge";
        observable: Observable<any>;
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

    emitGraphSettled(graph: any): void {
        const event: GraphSettledEvent = {
            type: "graph-settled",
            graph,
        };
        this.graphObservable.notifyObservers(event);
    }

    emitGraphError(
        graph: any,
        error: Error,
        context: GraphErrorEvent["context"],
        details?: Record<string, unknown>,
    ): void {
        const event: GraphErrorEvent = {
            type: "error",
            graph,
            error,
            context,
            details,
        };
        this.graphObservable.notifyObservers(event);
    }

    emitGraphDataLoaded(
        graph: any,
        chunksLoaded: number,
        dataSourceType: string,
    ): void {
        const event: GraphDataLoadedEvent = {
            type: "data-loaded",
            graph,
            details: {
                chunksLoaded,
                dataSourceType,
            },
        };
        this.graphObservable.notifyObservers(event);
    }

    // Generic graph event emitter for internal events
    emitGraphEvent(type: string, data: any): void {
        const event = {type, ... data} as GraphGenericEvent;
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
            case "data-loaded": {
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
    waitFor(type: EventType, timeout?: number): Promise<GraphEvent | NodeEvent | EdgeEvent> {
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
        graph: any,
        details?: Record<string, unknown>,
    ): Promise<T> {
        let lastError: Error;

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
        throw lastError!;
    }

    // Getters for backward compatibility

    get graphObservables(): Observable<GraphEvent> {
        return this.graphObservable;
    }

    get nodeObservables(): Observable<NodeEvent> {
        return this.nodeObservable;
    }

    get edgeObservables(): Observable<EdgeEvent> {
        return this.edgeObservable;
    }
}
