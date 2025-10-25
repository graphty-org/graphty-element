import PQueue from "p-queue";
import toposort from "toposort";

import {OBSOLESCENCE_RULES} from "../constants/obsolescence-rules";
import type {OperationMetadata, OperationProgress} from "../types/operations";
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
    metadata?: OperationMetadata;
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

export class OperationQueueManager implements Manager {
    private queue: PQueue;
    private pendingOperations = new Map<string, Operation>();
    private operationCounter = 0;
    private batchingEnabled = true;
    private currentBatch = new Set<string>();

    // Progress tracking
    private operationProgress = new Map<string, OperationProgress>();

    // Active operation controllers for cancellation
    private activeControllers = new Map<string, AbortController>();

    // Track running vs queued operations
    private runningOperations = new Map<string, Operation>();
    private queuedOperations = new Map<string, Operation>();

    // Deferred promise batching support
    private batchMode = false;
    private deferredPromises = new Map<string, {
        resolve: (value: void | PromiseLike<void>) => void;
        reject: (reason?: unknown) => void;
    }>();
    private batchOperations = new Set<string>();

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
        // Cancel all active operations
        this.activeControllers.forEach((controller) => {
            controller.abort();
        });

        this.queue.clear();
        this.pendingOperations.clear();
        this.operationProgress.clear();
        this.currentBatch.clear();
        this.activeControllers.clear();
        this.runningOperations.clear();
        this.queuedOperations.clear();
    }

    /**
     * Queue an operation for execution
     * Returns the operation ID
     */
    queueOperation(
        category: OperationCategory,
        execute: (context: OperationContext) => Promise<void> | void,
        options?: Partial<OperationMetadata>,
    ): string {
        const id = `op-${this.operationCounter++}`;
        const controller = new AbortController();

        // Initialize progress tracking with all fields
        this.operationProgress.set(id, {
            percent: 0,
            message: undefined,
            phase: undefined,
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
                ... options,
                timestamp: Date.now(),
            },
        };

        this.pendingOperations.set(id, operation);
        this.activeControllers.set(id, controller);

        // Handle batch mode differently
        if (this.batchMode) {
            // In batch mode: queue but don't execute yet
            this.batchOperations.add(id);

            // Store deferred promise handlers for later resolution
            // These will be resolved when exitBatchMode is called
            this.deferredPromises.set(id, {
                resolve: () => { /* Placeholder */ },
                reject: () => { /* Placeholder */ },
            });
        } else {
            // Normal mode: add to current batch for immediate execution
            this.currentBatch.add(id);

            // Apply obsolescence rules before scheduling
            this.applyObsolescenceRules(operation);

            // Schedule batch execution
            if (this.batchingEnabled) {
                // When batching is enabled, schedule batch execution on next microtask
                if (this.currentBatch.size === 1) {
                    queueMicrotask(() => {
                        this.executeBatch();
                    });
                }
            } else {
                // When batching is disabled, execute immediately
                queueMicrotask(() => {
                    this.executeBatch();
                });
            }
        }

        return id;
    }

    /**
     * Apply obsolescence rules for a new operation
     */
    private applyObsolescenceRules(newOperation: Operation): void {
        const {metadata} = newOperation;
        const defaultRule = OBSOLESCENCE_RULES[newOperation.category];
        // Only apply obsolescence if explicitly requested via metadata or default rules
        if (!metadata?.obsoletes &&
            !metadata?.shouldObsolete &&
            !metadata?.respectProgress &&
            !metadata?.skipRunning &&
            !defaultRule?.obsoletes) {
            return;
        }

        // Get obsolescence rules from metadata or defaults
        const customObsoletes = metadata?.obsoletes ?? [];
        const defaultObsoletes = defaultRule?.obsoletes ?? [];

        const categoriesToObsolete = [... new Set([... customObsoletes, ... defaultObsoletes])];
        const shouldObsolete = metadata?.shouldObsolete;
        const skipRunning = (metadata?.skipRunning ?? defaultRule?.skipRunning) ?? false;
        const respectProgress = (metadata?.respectProgress ?? defaultRule?.respectProgress) ?? true;

        // Check all operations for obsolescence
        const allOperations = [
            ... this.pendingOperations.values(),
            ... this.queuedOperations.values(),
            ... (skipRunning ? [] : this.runningOperations.values()),
        ];

        for (const operation of allOperations) {
            // Skip if it's the same operation
            if (operation.id === newOperation.id) {
                continue;
            }

            let shouldCancel = false;

            // Check category-based obsolescence
            if (categoriesToObsolete.includes(operation.category)) {
                shouldCancel = true;
            }

            // Check custom shouldObsolete function
            if (!shouldCancel && shouldObsolete) {
                shouldCancel = shouldObsolete({
                    category: operation.category,
                    id: operation.id,
                    metadata: operation.metadata,
                });
            }

            if (shouldCancel) {
                // Check progress if respectProgress is enabled
                if (respectProgress && this.runningOperations.has(operation.id)) {
                    const progress = this.operationProgress.get(operation.id);
                    if (progress && progress.percent > 90) {
                        // Don't cancel near-complete operations
                        continue;
                    }
                }

                // Cancel the operation
                const controller = this.activeControllers.get(operation.id);
                if (controller && !controller.signal.aborted) {
                    controller.abort();

                    // Emit obsolescence event
                    this.eventManager.emitGraphEvent("operation-obsoleted", {
                        id: operation.id,
                        category: operation.category,
                        reason: `Obsoleted by ${newOperation.category} operation`,
                        obsoletedBy: newOperation.id,
                    });

                    // Remove from pending/queued
                    this.pendingOperations.delete(operation.id);
                    this.queuedOperations.delete(operation.id);
                    this.currentBatch.delete(operation.id);
                }
            }
        }
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

        // Remove from pending and add to queued
        batchIds.forEach((id) => {
            const op = this.pendingOperations.get(id);
            if (op) {
                this.queuedOperations.set(id, op);
            }

            this.pendingOperations.delete(id);
        });

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
                        // Cleanup progress and controller after delay
                        setTimeout(() => {
                            this.operationProgress.delete(operation.id);
                            this.activeControllers.delete(operation.id);
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
        // Move from queued to running
        this.queuedOperations.delete(operation.id);
        this.runningOperations.set(operation.id, operation);

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
                // Remove from running on abort
                this.runningOperations.delete(operation.id);
                throw error; // Let p-queue handle abort errors
            }

            this.handleOperationError(operation, error);
        } finally {
            // Always remove from running operations
            this.runningOperations.delete(operation.id);
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
        // Cancel all active operations
        this.activeControllers.forEach((controller, id) => {
            if (!controller.signal.aborted) {
                controller.abort();
                this.eventManager.emitGraphEvent("operation-cancelled", {
                    id,
                    reason: "Queue cleared",
                });
            }
        });

        this.queue.clear();
        this.pendingOperations.clear();
        this.currentBatch.clear();
        this.runningOperations.clear();
        this.queuedOperations.clear();
    }

    /**
     * Disable batching (execute operations immediately)
     */
    disableBatching(): void {
        this.batchingEnabled = false;
    }

    enableBatching(): void {
        this.batchingEnabled = true;
        // TODO: Operations queued while batching was disabled will be executed
        // when waitForCompletion() is called
    }

    /**
     * Enter batch mode - operations will be queued but not executed
     */
    enterBatchMode(): void {
        this.batchMode = true;
        this.batchOperations.clear();
    }

    /**
     * Exit batch mode - execute all batched operations in dependency order
     */
    exitBatchMode(): void {
        if (!this.batchMode) {
            return;
        }

        this.batchMode = false;

        // Move all batched operations to currentBatch
        this.batchOperations.forEach((id) => {
            this.currentBatch.add(id);
        });

        // Clear batch operations set
        this.batchOperations.clear();

        // Clear deferred promises - no longer needed with simplified approach
        this.deferredPromises.clear();

        // Execute the batch normally
        this.executeBatch();
    }

    /**
     * Check if currently in batch mode
     */
    isInBatchMode(): boolean {
        return this.batchMode;
    }

    /**
     * Get count of deferred promises (for testing)
     */
    getDeferredPromiseCount(): number {
        return this.deferredPromises.size;
    }

    /**
     * Queue an operation and get a promise for its completion
     * Used for batch mode operations
     */
    queueOperationAsync(
        category: OperationCategory,
        execute: (context: OperationContext) => Promise<void> | void,
        options?: Partial<OperationMetadata>,
    ): Promise<void> {
        const id = this.queueOperation(category, execute, options);

        // In batch mode, return immediately - operations will execute when batch exits
        if (this.batchMode) {
            return Promise.resolve();
        }

        // In normal mode, wait for operation completion
        return this.waitForOperation(id);
    }

    /**
     * Wait for a specific operation to complete
     */
    private async waitForOperation(id: string): Promise<void> {
        while (
            this.pendingOperations.has(id) ||
            this.queuedOperations.has(id) ||
            this.runningOperations.has(id)
        ) {
            await new Promise((resolve) => setTimeout(resolve, 10));
        }
    }

    /**
     * Get the AbortController for a specific operation
     */
    getOperationController(operationId: string): AbortController | undefined {
        return this.activeControllers.get(operationId);
    }

    /**
     * Cancel a specific operation
     */
    cancelOperation(operationId: string): boolean {
        const controller = this.activeControllers.get(operationId);
        if (controller && !controller.signal.aborted) {
            controller.abort();

            // Emit cancellation event
            this.eventManager.emitGraphEvent("operation-cancelled", {
                id: operationId,
                reason: "Manual cancellation",
            });

            return true;
        }

        return false;
    }

    /**
     * Cancel all operations of a specific category
     */
    cancelByCategory(category: OperationCategory): number {
        let cancelledCount = 0;

        // Cancel pending operations
        this.pendingOperations.forEach((operation) => {
            if (operation.category === category) {
                if (this.cancelOperation(operation.id)) {
                    cancelledCount++;
                }
            }
        });

        return cancelledCount;
    }

    /**
     * Get current progress for an operation
     */
    getOperationProgress(operationId: string): OperationProgress | undefined {
        return this.operationProgress.get(operationId);
    }

    /**
     * Get all active operation IDs
     */
    getActiveOperations(): string[] {
        return Array.from(this.activeControllers.keys());
    }
}

