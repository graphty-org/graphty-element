/**
 * Progress information for an operation
 */
export interface OperationProgress {
    /**
     * Progress percentage (0-100)
     */
    percent: number;

    /**
     * Optional message describing current operation state
     */
    message?: string;

    /**
     * Optional phase identifier for multi-phase operations
     */
    phase?: string;

    /**
     * Timestamp when the operation started (milliseconds)
     */
    startTime: number;

    /**
     * Timestamp of last progress update (milliseconds)
     */
    lastUpdate?: number;
}

/**
 * Metadata associated with an operation
 */
export interface OperationMetadata {
    /**
     * Human-readable description of the operation
     */
    description?: string;

    /**
     * Timestamp when the operation was queued
     */
    timestamp?: number;

    /**
     * Source component or method that initiated the operation
     */
    source?: string;

    /**
     * Whether to skip automatic triggers for this operation
     */
    skipTriggers?: boolean;

    /**
     * Operation categories that this operation makes obsolete
     */
    obsoletes?: string[];

    /**
     * Function to determine if an operation should be obsoleted
     */
    shouldObsolete?: (operation: {
        category: string;
        id: string;
        metadata?: OperationMetadata;
    }) => boolean;

    /**
     * Skip obsoleting running operations (only obsolete queued)
     */
    skipRunning?: boolean;

    /**
     * Don't cancel operations that are >90% complete
     */
    respectProgress?: boolean;

    /**
     * Apply obsolescence rules to cascading dependent operations
     */
    cascading?: boolean;

    /**
     * Node selector for style operations
     */
    nodeSelector?: string;

    /**
     * Edge selector for style operations
     */
    edgeSelector?: string;
}

/**
 * Result of an operation execution
 */
export interface OperationResult<T = unknown> {
    /**
     * Whether the operation completed successfully
     */
    success: boolean;

    /**
     * Optional data returned by the operation
     */
    data?: T;

    /**
     * Error information if the operation failed
     */
    error?: {
        message: string;
        name?: string;
        stack?: string;
    };

    /**
     * Execution duration in milliseconds
     */
    duration?: number;
}

/**
 * Statistics about the operation queue
 */
export interface QueueStatistics {
    /**
     * Number of operations currently being executed
     */
    pending: number;

    /**
     * Number of operations waiting in the queue
     */
    size: number;

    /**
     * Whether the queue is paused
     */
    isPaused: boolean;

    /**
     * Total operations processed since initialization
     */
    totalProcessed?: number;

    /**
     * Number of operations that were cancelled/obsoleted
     */
    totalCancelled?: number;

    /**
     * Average operation duration in milliseconds
     */
    averageDuration?: number;
}

