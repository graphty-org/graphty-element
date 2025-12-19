/**
 * Command Types Module - Interfaces for graph commands.
 * @module ai/commands/types
 */

import type {z} from "zod";

import type {Graph} from "../../Graph";
import type {AiStatus} from "../AiStatus";

/**
 * Result of executing a command.
 */
export interface CommandResult {
    /** Whether the command executed successfully */
    success: boolean;
    /** Human-readable message about the result */
    message: string;
    /** Optional data returned by the command */
    data?: unknown;
    /** IDs of nodes affected by the command */
    affectedNodes?: string[];
    /** IDs of edges affected by the command */
    affectedEdges?: string[];
}

/**
 * Context provided to command execution.
 */
export interface CommandContext {
    /** The graph instance to operate on */
    graph: Graph;
    /** Signal to check for cancellation */
    abortSignal: AbortSignal;
    /** Function to emit events */
    emitEvent: (type: string, data: unknown) => void;
    /** Function to update AI status */
    updateStatus: (updates: Partial<AiStatus>) => void;
}

/**
 * Example of how a command can be invoked.
 */
export interface CommandExample {
    /** Natural language input that should trigger this command */
    input: string;
    /** The parameters that should be extracted from the input */
    params: Record<string, unknown>;
}

/**
 * Definition of a graph command that can be executed via AI.
 */
export interface GraphCommand {
    /** Unique name of the command (used as tool name) */
    readonly name: string;
    /** Description of what the command does (used in LLM prompt) */
    readonly description: string;
    /** Zod schema defining the parameters */
    readonly parameters: z.ZodType;
    /** Examples of how the command can be invoked */
    readonly examples: CommandExample[];
    /**
     * Execute the command.
     * @param graph - The graph instance to operate on
     * @param params - Parameters parsed from user input
     * @param context - Optional execution context with abort signal and event emitter
     * @returns Promise resolving to the command result
     */
    execute(
        graph: Graph,
        params: Record<string, unknown>,
        context?: CommandContext,
    ): Promise<CommandResult>;
}
