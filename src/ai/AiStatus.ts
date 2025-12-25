/**
 * AI Status Module - State machine for tracking AI command execution status.
 * @module ai/AiStatus
 */

/** Possible states for AI command execution */
export type AiState = "ready" | "submitted" | "streaming" | "executing" | "error";

/** Possible stages within processing */
export type AiStage = "processing" | "generating" | "executing";

/** Possible statuses for a tool call */
export type ToolCallStatusType = "pending" | "executing" | "complete" | "error";

/**
 * Status of a tool call being executed.
 */
export interface ToolCallStatus {
    /** Name of the tool being called */
    name: string;
    /** Current status of the tool call */
    status: ToolCallStatusType;
    /** Result of the tool call (if complete or error) */
    result?: unknown;
}

/**
 * Complete status object for AI command execution.
 * Provides all state needed for UI frameworks.
 */
export interface AiStatus {
    /** Current state of AI command execution */
    state: AiState;

    // Timing
    /** Timestamp when command was submitted */
    startTime?: number;
    /** Milliseconds since startTime */
    elapsed?: number;

    // Progress
    /** Current processing stage */
    stage?: AiStage;
    /** Human-readable message about current stage */
    stageMessage?: string;

    // Streaming content
    /** Accumulated streamed text from LLM */
    streamedText?: string;
    /** Status of tool calls being executed */
    toolCalls?: ToolCallStatus[];

    // Error handling
    /** Error that occurred during execution */
    error?: Error;
    /** Whether the command can be retried */
    canRetry?: boolean;

    // Control
    /** Whether the current operation can be cancelled */
    canCancel: boolean;
}

/** Callback type for status change subscriptions */
export type StatusChangeCallback = (status: AiStatus) => void;

/**
 * Manages AI command execution status with a state machine pattern.
 * Tracks state transitions, timing, streaming content, tool calls, and errors.
 */
export class AiStatusManager {
    private status: AiStatus;
    private listeners = new Set<StatusChangeCallback>();

    /**
     * Creates a new AiStatusManager instance.
     */
    constructor() {
        this.status = this.createInitialStatus();
    }

    /**
     * Get the current status (read-only reference).
     * @returns Current status object
     */
    get current(): Readonly<AiStatus> {
        return this.status;
    }

    /**
     * Create initial status state.
     * @returns Initial status object
     */
    private createInitialStatus(): AiStatus {
        return {
            state: "ready",
            canCancel: false,
        };
    }

    /**
     * Notify all listeners of a status change.
     */
    private notify(): void {
        for (const listener of this.listeners) {
            listener(this.status);
        }
    }

    /**
     * Submit a new command, transitioning from ready to submitted.
     */
    submit(): void {
        this.status = {
            state: "submitted",
            startTime: Date.now(),
            canCancel: true,
        };
        this.notify();
    }

    /**
     * Update the elapsed time based on startTime.
     */
    updateElapsed(): void {
        if (this.status.startTime !== undefined) {
            this.status = {
                ... this.status,
                elapsed: Date.now() - this.status.startTime,
            };
            // Note: We don't notify for elapsed updates to avoid excessive callbacks
            // UI can poll getSnapshot() if needed for real-time elapsed display
        }
    }

    /**
     * Set the current processing stage.
     * @param stage - The processing stage
     * @param message - Human-readable message about the stage
     */
    setStage(stage: AiStage, message: string): void {
        this.status = {
            ... this.status,
            stage,
            stageMessage: message,
        };
        this.notify();
    }

    /**
     * Start streaming, transitioning from submitted to streaming.
     */
    startStreaming(): void {
        this.status = {
            ... this.status,
            state: "streaming",
            streamedText: "",
            canCancel: true,
        };
        this.notify();
    }

    /**
     * Append text to the streamed content.
     * @param text - Text chunk to append
     */
    appendStreamedText(text: string): void {
        this.status = {
            ... this.status,
            streamedText: (this.status.streamedText ?? "") + text,
        };
        this.notify();
    }

    /**
     * Add a new tool call to track.
     * @param name - Name of the tool being called
     */
    addToolCall(name: string): void {
        const toolCalls = this.status.toolCalls ?? [];

        this.status = {
            ... this.status,
            toolCalls: [... toolCalls, {name, status: "pending"}],
        };
        this.notify();
    }

    /**
     * Update the status of a tool call.
     * @param name - Name of the tool call to update
     * @param status - New status for the tool call
     * @param result - Optional result data
     */
    updateToolCallStatus(name: string, status: ToolCallStatusType, result?: unknown): void {
        const {toolCalls} = this.status;

        if (!toolCalls) {
            return;
        }

        const index = toolCalls.findIndex((tc) => tc.name === name);

        if (index === -1) {
            return;
        }

        const updatedToolCalls = [... toolCalls];

        updatedToolCalls[index] = {
            ... updatedToolCalls[index],
            status,
            result,
        };

        this.status = {
            ... this.status,
            toolCalls: updatedToolCalls,
        };
        this.notify();
    }

    /**
     * Start executing commands, transitioning from streaming to executing.
     */
    startExecuting(): void {
        this.status = {
            ... this.status,
            state: "executing",
            canCancel: true,
        };
        this.notify();
    }

    /**
     * Complete execution, transitioning back to ready.
     */
    complete(): void {
        this.status = {
            ... this.status,
            state: "ready",
            canCancel: false,
        };
        this.notify();
    }

    /**
     * Set an error state.
     * @param error - The error that occurred
     * @param canRetry - Whether the command can be retried
     */
    setError(error: Error, canRetry: boolean): void {
        this.status = {
            ... this.status,
            state: "error",
            error,
            canRetry,
            canCancel: false,
        };
        this.notify();
    }

    /**
     * Reset to initial state.
     */
    reset(): void {
        this.status = this.createInitialStatus();
        this.notify();
    }

    /**
     * Get a snapshot (copy) of the current status.
     * @returns Copy of current status
     */
    getSnapshot(): AiStatus {
        return {... this.status};
    }

    /**
     * Subscribe to status changes.
     * @param callback - Function to call on status change
     * @returns Unsubscribe function
     */
    subscribe(callback: StatusChangeCallback): () => void {
        this.listeners.add(callback);

        return () => {
            this.listeners.delete(callback);
        };
    }
}
