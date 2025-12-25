import PQueue from "p-queue";
import toposort from "toposort";

import {OBSOLESCENCE_RULES} from "../constants/obsolescence-rules";
import {GraphtyLogger, type Logger} from "../logging/GraphtyLogger.js";
import type {OperationMetadata, OperationProgress} from "../types/operations";
import type {EventManager} from "./EventManager";
import type {Manager} from "./interfaces";

// Constants for operation queue management
const PROGRESS_CANCELLATION_THRESHOLD = 90; // Progress threshold for respecting in-progress operations
const CLEANUP_DELAY_MS = 1000; // Delay before cleaning up operation progress tracking
const OPERATION_POLL_INTERVAL_MS = 10; // Polling interval for waitForCompletion

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
    resolve?: (value: void | PromiseLike<void>) => void;
    reject?: (reason?: unknown) => void;
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

/**
 * Manages a queue of graph operations with dependency resolution and batching
 * Ensures operations execute in the correct order based on their dependencies
 */
export class OperationQueueManager implements Manager {
    private queue: PQueue;
    private pendingOperations = new Map<string, Operation>();
    private operationCounter = 0;
    private batchingEnabled = true;
    private currentBatch = new Set<string>();
    private logger: Logger = GraphtyLogger.getLogger(["graphty", "operation"]);

    // Progress tracking
    private operationProgress = new Map<string, OperationProgress>();

    // Active operation controllers for cancellation
    private activeControllers = new Map<string, AbortController>();

    // Track running vs queued operations
    private runningOperations = new Map<string, Operation>();
    private queuedOperations = new Map<string, Operation>();

    // Track completed operation categories for cross-batch dependency resolution
    private completedCategories = new Set<OperationCategory>();

    // Batch mode support
    private batchMode = false;
    private batchOperations = new Set<string>();
    private batchPromises = new Map<string, Promise<void>>();

    // Trigger system
    private triggers = new Map<OperationCategory, ((metadata?: OperationMetadata) => {
        category: OperationCategory;
        execute: (context: OperationContext) => Promise<void> | void;
        description?: string;
    } | null)[]>();

    // Callback for when operations are queued (for testing)
    onOperationQueued?: (category: OperationCategory, description?: string) => void;

    // Check if layout engine exists (will be set by Graph)
    hasLayoutEngine?: () => boolean;

    // Dependency graph based on actual manager dependencies
    private static readonly CATEGORY_DEPENDENCIES: [OperationCategory, OperationCategory][] = [
        // Style must be initialized before applying
        ["style-apply", "style-init"],

        // Data operations depend on style being ready
        ["data-add", "style-init"],
        ["data-update", "style-init"],

        // Layout-set does NOT depend on data - it can create an empty layout engine
        // Data will be added to the layout engine when data-add runs later
        // ["layout-set", "data-add"], // REMOVED for stateless design

        // Layout-update DOES depend on data existing
        ["layout-update", "data-add"],
        // Layout-update depends on layout being set first
        ["layout-update", "layout-set"],

        // Algorithms depend on data
        ["algorithm-run", "data-add"],

        // Style application depends on algorithms (for calculated styles)
        ["style-apply", "algorithm-run"],

        // Camera updates may depend on layout for zoom-to-fit
        ["camera-update", "layout-set"],

        // Render updates come last
        ["render-update", "style-apply"],
        ["render-update", "data-add"],
        ["render-update", "layout-update"],
    ];

    // Post-execution triggers: operations that automatically trigger after other operations
    private static readonly POST_EXECUTION_TRIGGERS: Partial<Record<OperationCategory, OperationCategory[]>> = {
        "data-add": ["layout-update"],
        "data-remove": ["layout-update"],
        "data-update": ["layout-update"],
        "algorithm-run": ["style-apply"],
    };

    /**
     * Creates a new operation queue manager
     * @param eventManager - Event manager for emitting operation events
     * @param options - Queue configuration options
     * @param options.concurrency - Maximum concurrent operations (default: 1)
     * @param options.autoStart - Whether to auto-start the queue (default: true)
     * @param options.intervalCap - Maximum operations per interval
     * @param options.interval - Time interval in milliseconds
     */
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

    /**
     * Initialize the operation queue manager
     */
    async init(): Promise<void> {
        // No initialization needed
    }

    /**
     * Dispose the operation queue and cancel all active operations
     */
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
     * @param category - Category of the operation
     * @param execute - Function to execute for this operation
     * @param options - Optional metadata for the operation
     * @returns The unique operation ID
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

        this.logger.debug("Operation queued", {
            id,
            category,
            description: options?.description,
        });

        // Handle batch mode differently
        if (this.batchMode) {
            // In batch mode: queue but don't execute yet
            this.batchOperations.add(id);
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
     * @param newOperation - The new operation to check for obsolescence rules
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
                    if (progress && progress.percent >= PROGRESS_CANCELLATION_THRESHOLD) {
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

        if (operations.length > 0) {
            this.logger.debug("Executing operation batch", {
                operationCount: operations.length,
                categories: [... new Set(operations.map((op) => op.category))],
            });
        }

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
                        }, CLEANUP_DELAY_MS);
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
     * @param operations - Array of operations to sort
     * @returns Sorted array of operations in dependency order
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
            // Only add edge if:
            // 1. The dependent operation is in this batch
            // 2. The dependency hasn't already been completed in a previous batch
            // 3. The dependency is either in this batch OR needs to be waited for
            if (categories.includes(dependent) && !this.completedCategories.has(dependency)) {
                if (categories.includes(dependency)) {
                    // Both are in this batch - normal dependency
                    edges.push([dependency, dependent]); // toposort expects [from, to]
                }
                // If dependency is not in this batch and not completed, the dependent operation
                // may fail or produce incorrect results. In a truly stateless system, we should
                // either wait for the dependency or auto-queue it. For now, we allow it to proceed
                // and rely on the manager's internal checks (e.g., DataManager checking for styles).
            }
        });

        // Sort categories
        let sortedCategories: OperationCategory[];
        try {
            sortedCategories = toposort.array(categories, edges);
        } catch (error) {
            // Circular dependency detected - emit error event
            this.eventManager.emitGraphError(
                null,
                error instanceof Error ? error : new Error("Circular dependency detected"),
                "other",
                {categories, edges},
            );
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
     * @param operation - The operation to execute
     * @param context - Execution context with abort signal and progress tracking
     */
    private async executeOperation(operation: Operation, context: OperationContext): Promise<void> {
        // Move from queued to running
        this.queuedOperations.delete(operation.id);
        this.runningOperations.set(operation.id, operation);

        this.logger.debug("Operation started", {
            id: operation.id,
            category: operation.category,
            description: operation.metadata?.description,
        });

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

            // Mark category as completed for cross-batch dependency resolution
            this.completedCategories.add(operation.category);

            const duration = performance.now() - startTime;

            this.logger.debug("Operation completed", {
                id: operation.id,
                category: operation.category,
                duration: duration.toFixed(2),
            });

            this.eventManager.emitGraphEvent("operation-complete", {
                id: operation.id,
                category: operation.category,
                duration,
            });

            // Resolve the operation's promise
            if (operation.resolve) {
                operation.resolve();
            }

            // Trigger post-execution operations if not skipped
            if (!operation.metadata?.skipTriggers) {
                this.triggerPostExecutionOperations(operation);
            }
        } catch (error) {
            if (error && (error as Error).name === "AbortError") {
                // Reject the operation's promise
                if (operation.reject) {
                    operation.reject(error);
                }

                // Remove from running on abort
                this.runningOperations.delete(operation.id);
                throw error; // Let p-queue handle abort errors
            }

            // Reject the operation's promise
            if (operation.reject) {
                operation.reject(error);
            }

            this.handleOperationError(operation, error);
        } finally {
            // Always remove from running operations
            this.runningOperations.delete(operation.id);
        }
    }

    /**
     * Create progress context for an operation
     * @param id - Unique operation ID
     * @param category - Operation category
     * @returns Progress context for updating operation progress
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
     * @param id - Operation ID
     * @param category - Operation category
     * @param progress - Current progress state
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
     * @param operation - The operation that failed
     * @param error - The error that occurred
     */
    private handleOperationError(operation: Operation, error: unknown): void {
        this.logger.error(
            "Operation failed",
            error instanceof Error ? error : new Error(String(error)),
            {
                id: operation.id,
                category: operation.category,
                description: operation.metadata?.description,
            },
        );

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
     * @returns Current queue state including pending operations, size, and pause status
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

    /**
     * Resume queue execution after being paused
     */
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

    /**
     * Enable batching to group operations before execution
     */
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
    async exitBatchMode(): Promise<void> {
        if (!this.batchMode) {
            return;
        }

        this.batchMode = false;

        // Move all batched operations to currentBatch
        this.batchOperations.forEach((id) => {
            this.currentBatch.add(id);
        });

        // Collect all batch promises
        const promises = Array.from(this.batchPromises.values());

        // Clear batch tracking
        this.batchOperations.clear();
        this.batchPromises.clear();

        // Execute the batch
        this.executeBatch();

        // Wait for all operations to complete
        // Use allSettled to handle both resolved and rejected promises
        // Individual operation errors are already handled via handleOperationError
        await Promise.allSettled(promises);
    }

    /**
     * Check if currently in batch mode
     * @returns True if in batch mode, false otherwise
     */
    isInBatchMode(): boolean {
        return this.batchMode;
    }

    /**
     * Queue an operation and get a promise for its completion
     * Used for batch mode operations
     * @param category - Category of the operation
     * @param execute - Function to execute for this operation
     * @param options - Optional metadata for the operation
     * @returns Promise that resolves when the operation completes
     */
    queueOperationAsync(
        category: OperationCategory,
        execute: (context: OperationContext) => Promise<void> | void,
        options?: Partial<OperationMetadata>,
    ): Promise<void> {
        const id = this.queueOperation(category, execute, options);

        // Create promise that resolves when this specific operation completes
        const promise = new Promise<void>((resolve, reject) => {
            // Store resolvers with the operation
            const operation = this.pendingOperations.get(id);
            if (operation) {
                operation.resolve = resolve;
                operation.reject = reject;
            }
        });

        if (this.batchMode) {
            // In batch mode, track the promise for later
            this.batchPromises.set(id, promise);
            // Return immediately resolved promise to avoid deadlock
            // The actual operation will execute when exitBatchMode is called
            return Promise.resolve();
        }

        // Not in batch mode, execute normally
        this.executeBatch();
        return promise;
    }

    /**
     * Wait for a specific operation to complete
     * @param id - Operation ID to wait for
     */
    private async waitForOperation(id: string): Promise<void> {
        while (
            this.pendingOperations.has(id) ||
            this.queuedOperations.has(id) ||
            this.runningOperations.has(id)
        ) {
            await new Promise((resolve) => setTimeout(resolve, OPERATION_POLL_INTERVAL_MS));
        }
    }

    /**
     * Get the AbortController for a specific operation
     * @param operationId - ID of the operation
     * @returns The AbortController or undefined if not found
     */
    getOperationController(operationId: string): AbortController | undefined {
        return this.activeControllers.get(operationId);
    }

    /**
     * Cancel a specific operation
     * @param operationId - ID of the operation to cancel
     * @returns True if the operation was cancelled, false otherwise
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
     * Mark a category as completed (for satisfying cross-batch dependencies)
     * This is useful when a category's requirements are met through other means
     * (e.g., style-init is satisfied by constructor initialization)
     * @param category - The operation category to mark as completed
     */
    markCategoryCompleted(category: OperationCategory): void {
        this.completedCategories.add(category);
    }

    /**
     * Clear completed status for a category
     * This is useful when a category needs to be re-executed
     * (e.g., setStyleTemplate is called explicitly, overriding initial styles)
     * @param category - The operation category to clear
     */
    clearCategoryCompleted(category: OperationCategory): void {
        this.completedCategories.delete(category);
    }

    /**
     * Cancel all operations of a specific category
     * @param category - The operation category to cancel
     * @returns Number of operations cancelled
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
     * @param operationId - ID of the operation
     * @returns Progress information or undefined if not found
     */
    getOperationProgress(operationId: string): OperationProgress | undefined {
        return this.operationProgress.get(operationId);
    }

    /**
     * Get all active operation IDs
     * @returns Array of active operation IDs
     */
    getActiveOperations(): string[] {
        return Array.from(this.activeControllers.keys());
    }

    /**
     * Register a custom trigger for a specific operation category
     * @param category - Operation category to trigger on
     * @param trigger - Function that returns trigger configuration or null
     */
    registerTrigger(
        category: OperationCategory,
        trigger: (metadata?: OperationMetadata) => {
            category: OperationCategory;
            execute: (context: OperationContext) => Promise<void> | void;
            description?: string;
        } | null,
    ): void {
        if (!this.triggers.has(category)) {
            this.triggers.set(category, []);
        }

        const triggerArray = this.triggers.get(category);
        if (triggerArray) {
            triggerArray.push(trigger);
        }
    }

    /**
     * Trigger post-execution operations based on the completed operation
     * @param operation - The completed operation that may trigger other operations
     */
    private triggerPostExecutionOperations(operation: Operation): void {
        // Check for default triggers
        const defaultTriggers = OperationQueueManager.POST_EXECUTION_TRIGGERS[operation.category];

        // Check for custom triggers
        const customTriggers = this.triggers.get(operation.category) ?? [];

        // Process default triggers
        if (defaultTriggers) {
            for (const triggerCategory of defaultTriggers) {
                // Check prerequisites
                if (triggerCategory === "layout-update" && this.hasLayoutEngine && !this.hasLayoutEngine()) {
                    continue; // Skip if no layout engine
                }

                // Queue the triggered operation
                void this.queueTriggeredOperation(triggerCategory, operation.metadata);
            }
        }

        // Process custom triggers
        for (const trigger of customTriggers) {
            const result = trigger(operation.metadata);
            if (result) {
                // Queue the custom triggered operation
                void this.queueTriggeredOperation(
                    result.category,
                    operation.metadata,
                    result.execute,
                    result.description,
                );
            }
        }
    }

    /**
     * Queue a triggered operation
     * @param category - Category of the triggered operation
     * @param sourceMetadata - Metadata from the source operation
     * @param execute - Optional execution function
     * @param description - Optional description of the operation
     */
    private async queueTriggeredOperation(
        category: OperationCategory,
        sourceMetadata?: OperationMetadata,
        execute?: (context: OperationContext) => Promise<void> | void,
        description?: string,
    ): Promise<void> {
        // Notify test callback if set
        if (this.onOperationQueued) {
            this.onOperationQueued(category, description);
        }

        // Default execute function for layout-update
        if (!execute && category === "layout-update") {
            execute = (context: OperationContext) => {
                // This will be implemented by the Graph/LayoutManager
                context.progress.setMessage("Updating layout positions");
            };
        }

        if (!execute) {
            return; // No execute function provided
        }

        // Queue the operation
        await this.queueOperationAsync(
            category,
            execute,
            {
                description: description ?? `Triggered ${category}`,
                source: "trigger",
                skipTriggers: true, // Prevent trigger loops
            },
        );
    }
}

