/**
 * Input Adapter Types - Interfaces for input adapters.
 * @module ai/input/types
 */

/**
 * Options for starting an input adapter.
 */
export interface InputOptions {
    /** Whether to continue listening after each result (voice only) */
    continuous?: boolean;
    /** Whether to emit interim results as they arrive */
    interimResults?: boolean;
    /** Language code for speech recognition (e.g., "en-US") */
    language?: string;
}

/**
 * Callback function for input events.
 * @param input - The input text
 * @param isFinal - Whether this is the final result or an interim result
 */
export type InputCallback = (input: string, isFinal: boolean) => void;

/**
 * Interface for input adapters that can provide text input to the AI system.
 */
export interface InputAdapter {
    /** Type of input this adapter handles */
    readonly type: "text" | "voice";
    /** Whether this adapter is currently active (listening) */
    readonly isActive: boolean;
    /** Whether this adapter is supported in the current environment */
    readonly isSupported: boolean;
    /**
     * Start listening for input.
     * @param options - Optional configuration for the input session
     */
    start(options?: InputOptions): void;
    /** Stop listening for input. */
    stop(): void;
    /**
     * Register a callback for input events.
     * @param callback - Function called when input is received
     */
    onInput(callback: InputCallback): void;
    /** Clean up resources and remove all callbacks. */
    dispose(): void;
}
