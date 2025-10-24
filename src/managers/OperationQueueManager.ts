import PQueue from "p-queue";
import toposort from "toposort";

import type {EventManager} from "./EventManager";
import type {Manager} from "./interfaces";

export interface ProgressContext {
    setProgress(percent: number): void;
    setMessage(message: string): void;
    setPhase(phase: string): void;
}

export interface OperationContext {
    signal: AbortSignal;
    progress: ProgressContext;
    id: string;
}

export interface Operation {
    id: string;
    category: OperationCategory;
    execute: (context: OperationContext) => Promise<void> | void;
    abortController?: AbortController;
    metadata?: {
        description?: string;
        timestamp?: number;
        source?: string;
    };
}

export type OperationCategory =
    | "style-init" // Initialize style template
    | "style-apply" // Apply styles to existing elements
    | "data-add" // Add nodes/edges
    | "data-remove" // Remove nodes/edges
    | "data-update" // Update node/edge properties
    | "layout-set" // Set layout engine
    | "layout-update" // Update layout positions
    | "algorithm-run" // Run graph algorithms
    | "camera-update" // Update camera position/mode
    | "render-update"; // Update rendering settings

export interface OperationProgress {
    percent: number;
    message?: string;
    phase?: string;
    startTime: number;
    lastUpdate: number;
}

export class OperationQueueManager implements Manager {
    private queue: PQueue;
    private pendingOperations = new Map<string, Operation>();
    private operationCounter = 0;
    private batchingEnabled = true;
    private currentBatch = new Set<string>();

    // Progress tracking
    private operationProgress = new Map<string, OperationProgress>();

    // Dependency graph based on actual manager dependencies
    private static readonly CATEGORY_DEPENDENCIES: [OperationCategory, OperationCategory][] = [
        // Style must be initialized before applying
        ["style-apply", "style-init"],

        // Data operations depend on style being ready
        ["data-add", "style-init"],
        ["data-update", "style-init"],

        // Layout depends on data existing
        ["layout-set", "data-add"],
        ["layout-update", "data-add"],

        // Algorithms depend on data
        ["algorithm-run", "data-add"],

        // Camera updates may depend on layout for zoom-to-fit
        ["camera-update", "layout-set"],

        // Render updates come last
        ["render-update", "style-apply"],
        ["render-update", "data-add"],
        ["render-update", "layout-update"],
    ];

    constructor(
        private eventManager: EventManager,
        options: {
            concurrency?: number;
            autoStart?: boolean;
            intervalCap?: number;
            interval?: number;
        } = {},
    ) {
        const queueOptions: {
            concurrency?: number;
            autoStart?: boolean;
            intervalCap?: number;
            interval?: number;
        } = {
            concurrency: options.concurrency ?? 1, // Sequential by default
            autoStart: options.autoStart ?? true,
        };

        if (options.intervalCap !== undefined) {
            queueOptions.intervalCap = options.intervalCap;
        }

        if (options.interval !== undefined) {
            queueOptions.interval = options.interval;
        }

        this.queue = new PQueue(queueOptions);

        // Listen for queue events
        this.queue.on("active", () => {
            this.eventManager.emitGraphEvent("operation-queue-active", {
                size: this.queue.size,
                pending: this.queue.pending,
            });
        });

        this.queue.on("idle", () => {
            this.eventManager.emitGraphEvent("operation-queue-idle", {});
        });
    }

    async init(): Promise<void> {
        // No initialization needed
    }

    dispose(): void {
        this.queue.clear();
        this.pendingOperations.clear();
        this.operationProgress.clear();
        this.currentBatch.clear();
    }

    /**
     * Queue an operation for execution
     */
    queueOperation(
        category: OperationCategory,
        execute: (context: OperationContext) => Promise<void> | void,
        options?: {
            description?: string;
        },
    ): string {
        const id = `op-${this.operationCounter++}`;
        const controller = new AbortController();

        // Initialize progress tracking
        this.operationProgress.set(id, {
            percent: 0,
            startTime: Date.now(),
            lastUpdate: Date.now(),
        });

        const operation: Operation = {
            id,
            category,
            execute: async(ctx) => {
                const result = execute(ctx);
                if (result instanceof Promise) {
                    await result;
                }
            },
            abortController: controller,
            metadata: {
                description: options?.description,
                timestamp: Date.now(),
            },
        };

        this.pendingOperations.set(id, operation);
        this.currentBatch.add(id);

        // Schedule batch execution on next microtask
        if (this.batchingEnabled && this.currentBatch.size === 1) {
            queueMicrotask(() => {
                this.executeBatch();
            });
        }

        return id;
    }

    /**
     * Execute all operations in the current batch
     */
    private executeBatch(): void {
        // Get all operations in current batch
        const batchIds = Array.from(this.currentBatch);
        this.currentBatch.clear();

        const operations = batchIds
            .map((id) => this.pendingOperations.get(id))
            .filter((op): op is Operation => op !== undefined);

        // Remove from pending
        batchIds.forEach((id) => this.pendingOperations.delete(id));

        if (operations.length === 0) {
            return;
        }

        // Sort operations by dependency order
        const sortedOperations = this.sortOperations(operations);

        // Add to queue with p-queue's signal support
        for (const operation of sortedOperations) {
            // queue.add always returns a promise
            void this.queue.add(
                async({signal}) => {
                    try {
                        const context: OperationContext = {
                            signal: signal ?? operation.abortController?.signal ?? new AbortController().signal,
                            progress: this.createProgressContext(operation.id, operation.category),
                            id: operation.id,
                        };
                        await this.executeOperation(operation, context);
                    } finally {
                        // Cleanup progress after delay
                        setTimeout(() => {
                            this.operationProgress.delete(operation.id);
                        }, 1000);
                    }
                },
                {
                    signal: operation.abortController?.signal,
                },
            ).catch((error: unknown) => {
                if (error && (error as Error).name === "AbortError") {
                    this.eventManager.emitGraphEvent("operation-obsoleted", {
                        id: operation.id,
                        category: operation.category,
                        reason: "Obsoleted by newer operation",
                    });
                }
            });
        }

        // Emit batch complete event after all operations
        this.eventManager.emitGraphEvent("operation-batch-complete", {
            operationCount: sortedOperations.length,
            operations: sortedOperations.map((op) => ({
                id: op.id,
                category: op.category,
                description: op.metadata?.description,
            })),
        });
    }

    /**
     * Sort operations based on category dependencies
     */
    private sortOperations(operations: Operation[]): Operation[] {
        // Group by category
        const operationsByCategory = new Map<OperationCategory, Operation[]>();
        operations.forEach((op) => {
            const ops = operationsByCategory.get(op.category) ?? [];
            ops.push(op);
            operationsByCategory.set(op.category, ops);
        });

        // Get unique categories
        const categories = Array.from(operationsByCategory.keys());

        // Build dependency edges for toposort
        const edges: [OperationCategory, OperationCategory][] = [];
        OperationQueueManager.CATEGORY_DEPENDENCIES.forEach(([dependent, dependency]) => {
            if (categories.includes(dependent) && categories.includes(dependency)) {
                edges.push([dependency, dependent]); // toposort expects [from, to]
            }
        });

        // Sort categories
        let sortedCategories: OperationCategory[];
        try {
            sortedCategories = toposort.array(categories, edges);
        } catch (error) {
            // Circular dependency detected
            console.error("Circular dependency detected:", error);
            sortedCategories = categories; // Fallback to original order
        }

        // Flatten operations in sorted category order
        const sortedOperations: Operation[] = [];
        sortedCategories.forEach((category) => {
            const categoryOps = operationsByCategory.get(category) ?? [];
            sortedOperations.push(... categoryOps);
        });

        return sortedOperations;
    }

    /**
     * Execute a single operation
     */
    private async executeOperation(operation: Operation, context: OperationContext): Promise<void> {
        this.eventManager.emitGraphEvent("operation-start", {
            id: operation.id,
            category: operation.category,
            description: operation.metadata?.description,
        });

        const startTime = performance.now();

        try {
            await operation.execute(context);

            // Mark as complete
            context.progress.setProgress(100);

            const duration = performance.now() - startTime;
            this.eventManager.emitGraphEvent("operation-complete", {
                id: operation.id,
                category: operation.category,
                duration,
            });
        } catch (error) {
            if (error && (error as Error).name === "AbortError") {
                throw error; // Let p-queue handle abort errors
            }

            this.handleOperationError(operation, error);
        }
    }

    /**
     * Create progress context for an operation
     */
    private createProgressContext(id: string, category: OperationCategory): ProgressContext {
        return {
            setProgress: (percent: number) => {
                const progress = this.operationProgress.get(id);
                if (progress) {
                    progress.percent = percent;
                    progress.lastUpdate = Date.now();
                    this.emitProgressUpdate(id, category, progress);
                }
            },
            setMessage: (message: string) => {
                const progress = this.operationProgress.get(id);
                if (progress) {
                    progress.message = message;
                    progress.lastUpdate = Date.now();
                    this.emitProgressUpdate(id, category, progress);
                }
            },
            setPhase: (phase: string) => {
                const progress = this.operationProgress.get(id);
                if (progress) {
                    progress.phase = phase;
                    progress.lastUpdate = Date.now();
                    this.emitProgressUpdate(id, category, progress);
                }
            },
        };
    }

    /**
     * Emit progress update event
     */
    private emitProgressUpdate(id: string, category: OperationCategory, progress: OperationProgress): void {
        this.eventManager.emitGraphEvent("operation-progress", {
            id,
            category,
            progress: progress.percent,
            message: progress.message,
            phase: progress.phase,
            duration: Date.now() - progress.startTime,
        });
    }

    /**
     * Handle operation errors
     */
    private handleOperationError(operation: Operation, error: unknown): void {
        this.eventManager.emitGraphError(
            null,
            error instanceof Error ? error : new Error(String(error)),
            "other",
            {
                operationId: operation.id,
                category: operation.category,
                description: operation.metadata?.description,
            },
        );
    }

    /**
     * Wait for all queued operations to complete
     */
    async waitForCompletion(): Promise<void> {
        // First, ensure any pending batch is queued
        if (this.currentBatch.size > 0) {
            this.executeBatch();
        }

        // Then wait for queue to be idle
        await this.queue.onIdle();
    }

    /**
     * Get queue statistics
     */
    getStats(): {
        pending: number;
        size: number;
        isPaused: boolean;
    } {
        return {
            pending: this.queue.pending,
            size: this.queue.size,
            isPaused: this.queue.isPaused,
        };
    }

    /**
     * Pause/resume queue execution
     */
    pause(): void {
        this.queue.pause();
    }

    resume(): void {
        this.queue.start();
    }

    /**
     * Clear all pending operations
     */
    clear(): void {
        this.queue.clear();
        this.pendingOperations.clear();
        this.currentBatch.clear();
    }

    /**
     * Disable batching (execute operations immediately)
     */
    disableBatching(): void {
        this.batchingEnabled = false;
    }

    enableBatching(): void {
        this.batchingEnabled = true;
    }
}

