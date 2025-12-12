/**
 * AI Controller Module - Orchestrates LLM providers and command execution.
 * @module ai/AiController
 */

import type {AiEvent} from "../events";
import {type AiStatus, AiStatusManager, type StatusChangeCallback} from "./AiStatus";
import type {CommandRegistry} from "./commands";
import type {CommandContext, CommandResult} from "./commands/types";
import type {LlmProvider, Message, ToolCall} from "./providers/types";
import type {SchemaManager} from "./schema";

/** Event emitter callback type */
export type AiEventEmitter = (event: AiEvent) => void;

/** Options for creating an AiController */
export interface AiControllerOptions {
    /** The LLM provider to use */
    provider: LlmProvider;
    /** The command registry containing available commands */
    commandRegistry: CommandRegistry;
    /** The graph instance to operate on */
    graph: CommandContext["graph"];
    /** Optional event emitter for AI events */
    emitEvent?: AiEventEmitter;
    /** Optional schema manager for data schema in prompts */
    schemaManager?: SchemaManager | null;
}

/** Combined result from execution */
export interface ExecutionResult extends CommandResult {
    /** Raw response text from LLM (if any) */
    llmText?: string;
}

/**
 * Controller that orchestrates LLM providers and command execution.
 * Manages the conversation flow, command dispatch, and status updates.
 */
export class AiController {
    private provider: LlmProvider;
    private commandRegistry: CommandRegistry;
    private graph: CommandContext["graph"];
    private statusManager: AiStatusManager;
    private schemaManager: SchemaManager | null;
    private abortController: AbortController | null = null;
    private disposed = false;
    private emitEvent: AiEventEmitter | undefined;
    private currentInput: string | null = null;
    private startTime: number | null = null;
    private lastInput: string | null = null;
    private lastError: Error | null = null;

    constructor(options: AiControllerOptions) {
        this.provider = options.provider;
        this.commandRegistry = options.commandRegistry;
        this.graph = options.graph;
        this.statusManager = new AiStatusManager();
        this.schemaManager = options.schemaManager ?? null;
        this.emitEvent = options.emitEvent;

        // Subscribe to status changes to emit events
        this.statusManager.subscribe((status) => {
            this.emitAiEvent({
                type: "ai-status-change",
                status,
            });
        });
    }

    /**
     * Emit an AI event if an emitter is configured.
     */
    private emitAiEvent(event: AiEvent): void {
        if (this.emitEvent) {
            this.emitEvent(event);
        }
    }

    /**
     * Execute a natural language command.
     * @param input - The user's natural language input
     * @returns Promise resolving to the execution result
     */
    async execute(input: string): Promise<ExecutionResult> {
        // Log user input
        console.log("[AI] User input:", input);

        if (this.disposed) {
            return {
                success: false,
                message: "Controller has been disposed",
            };
        }

        // Track input for retry
        this.currentInput = input;
        this.lastInput = input;
        this.startTime = Date.now();
        this.lastError = null;

        // Create new abort controller for this execution
        this.abortController = new AbortController();

        // Emit command start event
        this.emitAiEvent({
            type: "ai-command-start",
            input,
            timestamp: this.startTime,
        });

        // Transition to submitted state
        this.statusManager.submit();

        try {
            // Build messages for LLM
            const messages: Message[] = this.buildMessages(input);

            // Get tool definitions from registry
            const tools = this.commandRegistry.toToolDefinitions();

            // Log AI request
            console.log("[AI] Request - Messages:", JSON.stringify(messages, null, 2));
            console.log("[AI] Request - Tools:", tools.map((t) => t.name).join(", "));

            // Transition to streaming state
            this.statusManager.startStreaming();

            // Call the LLM
            const response = await this.provider.generate(
                messages,
                tools,
                {signal: this.abortController.signal},
            );

            // Log AI response
            console.log("[AI] Response - Text:", response.text || "(no text)");
            const toolCallsLog = response.toolCalls.length > 0 ?
                response.toolCalls.map((tc) => `${tc.name}(${JSON.stringify(tc.arguments)})`).join(", ") :
                "(none)";
            console.log("[AI] Response - Tool calls:", toolCallsLog);

            // Append any text response and emit stream chunk event
            if (response.text) {
                this.statusManager.appendStreamedText(response.text);
                this.emitAiEvent({
                    type: "ai-stream-chunk",
                    text: response.text,
                    accumulated: response.text,
                });
            }

            // If no tool calls, return text response
            if (response.toolCalls.length === 0) {
                this.statusManager.complete();

                const result: ExecutionResult = {
                    success: true,
                    message: response.text || "No response from AI",
                    llmText: response.text,
                };

                // Emit complete event
                this.emitAiEvent({
                    type: "ai-command-complete",
                    result,
                    duration: Date.now() - this.startTime,
                });

                return result;
            }

            // Transition to executing state
            this.statusManager.startExecuting();

            // Execute tool calls
            const result = await this.executeToolCalls(response.toolCalls, response.text);

            // Complete
            this.statusManager.complete();

            // Emit complete event
            this.emitAiEvent({
                type: "ai-command-complete",
                result,
                duration: Date.now() - this.startTime,
            });

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorObj = error instanceof Error ? error : new Error(errorMessage);

            this.lastError = errorObj;

            this.statusManager.setError(errorObj, true);

            // Emit error event
            this.emitAiEvent({
                type: "ai-command-error",
                error: errorObj,
                input,
                canRetry: true,
            });

            return {
                success: false,
                message: `Error: ${errorMessage}`,
            };
        } finally {
            this.abortController = null;
            this.currentInput = null;
        }
    }

    /**
     * Get the last input that was executed.
     * @returns The last input or null if no command has been executed
     */
    getLastInput(): string | null {
        return this.lastInput;
    }

    /**
     * Get the last error that occurred.
     * @returns The last error or null if no error occurred
     */
    getLastError(): Error | null {
        return this.lastError;
    }

    /**
     * Clear the last error.
     */
    clearLastError(): void {
        this.lastError = null;
    }

    /**
     * Build the message array for the LLM.
     * @param input - User input
     * @returns Array of messages
     */
    private buildMessages(input: string): Message[] {
        const messages: Message[] = [];

        // Only include system prompt if provider supports it with tools
        // Some providers (like WebLLM with Hermes models) don't support custom system prompts with tool calling
        const supportsSystemPrompt = this.provider.supportsSystemPromptWithTools !== false;

        if (supportsSystemPrompt) {
            // Build a system prompt with available commands
            const commands = this.commandRegistry.getAll();
            const commandDescriptions = commands.map((cmd) =>
                `- ${cmd.name}: ${cmd.description}`,
            ).join("\n");

            // Build schema section if available
            const schemaSection = this.buildSchemaSection();

            const systemPrompt = `You are an AI assistant that helps users interact with a graph visualization.

Available commands:
${commandDescriptions}
${schemaSection}
When the user asks you to perform an action, use the appropriate tool. If no tool is needed, respond conversationally.`;

            messages.push({role: "system", content: systemPrompt});
        }

        messages.push({role: "user", content: input});

        return messages;
    }

    /**
     * Build the schema section for the system prompt.
     * @returns Formatted schema section or empty string if no schema
     */
    private buildSchemaSection(): string {
        if (!this.schemaManager) {
            return "";
        }

        const schema = this.schemaManager.getSchema();

        if (!schema || (schema.nodeCount === 0 && schema.edgeCount === 0)) {
            return "";
        }

        return `\n${this.schemaManager.getFormattedSchema()}\n`;
    }

    /**
     * Execute a list of tool calls.
     * @param toolCalls - Tool calls to execute
     * @param llmText - Text response from LLM (if any)
     * @returns Combined execution result
     */
    private async executeToolCalls(toolCalls: ToolCall[], llmText?: string): Promise<ExecutionResult> {
        const results: CommandResult[] = [];

        for (const toolCall of toolCalls) {
            // Add tool call to status
            this.statusManager.addToolCall(toolCall.name);
            this.statusManager.updateToolCallStatus(toolCall.name, "executing");

            // Emit tool call event
            this.emitAiEvent({
                type: "ai-stream-tool-call",
                name: toolCall.name,
                params: toolCall.arguments,
            });

            try {
                const result = await this.executeToolCall(toolCall);

                results.push(result);

                // Update tool call status
                this.statusManager.updateToolCallStatus(
                    toolCall.name,
                    result.success ? "complete" : "error",
                    result.data ?? {message: result.message},
                );

                // Emit tool result event
                this.emitAiEvent({
                    type: "ai-stream-tool-result",
                    name: toolCall.name,
                    result: result.data ?? {message: result.message},
                    success: result.success,
                });

                // If any command fails, stop executing remaining
                if (!result.success) {
                    break;
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                const errorResult: CommandResult = {
                    success: false,
                    message: `Error executing ${toolCall.name}: ${errorMessage}`,
                };

                results.push(errorResult);

                this.statusManager.updateToolCallStatus(
                    toolCall.name,
                    "error",
                    {error: errorMessage},
                );

                // Emit tool result event for error
                this.emitAiEvent({
                    type: "ai-stream-tool-result",
                    name: toolCall.name,
                    result: {error: errorMessage},
                    success: false,
                });
                break;
            }
        }

        // Combine results
        return this.combineResults(results, llmText);
    }

    /**
     * Execute a single tool call.
     * @param toolCall - The tool call to execute
     * @returns Command result
     */
    private async executeToolCall(toolCall: ToolCall): Promise<CommandResult> {
        // Log command execution start
        console.log("[AI] Executing command:", toolCall.name);
        console.log("[AI] Raw arguments from LLM:", JSON.stringify(toolCall.arguments, null, 2));

        const command = this.commandRegistry.get(toolCall.name);

        if (!command) {
            console.log("[AI] Command result: FAILED - Unknown command");
            return {
                success: false,
                message: `Unknown command: ${toolCall.name}. Command not found in registry.`,
            };
        }

        // Validate and transform arguments through the command's Zod schema
        // This ensures: 1) valid data, 2) transforms applied (e.g., color names → hex),
        // 3) default values applied
        let validatedArguments: Record<string, unknown>;
        try {
            validatedArguments = command.parameters.parse(toolCall.arguments);
            console.log("[AI] Validated arguments:", JSON.stringify(validatedArguments, null, 2));
        } catch (validationError) {
            const errorMessage = validationError instanceof Error ?
                validationError.message :
                String(validationError);
            console.log("[AI] Command result: FAILED - Invalid arguments");
            console.log("[AI] Validation error:", errorMessage);
            return {
                success: false,
                message: `Invalid arguments for ${toolCall.name}: ${errorMessage}`,
            };
        }

        // Create execution context
        const context: CommandContext = {
            graph: this.graph,
            abortSignal: this.abortController?.signal ?? new AbortController().signal,
            emitEvent: (type: string, data: unknown) => {
                // Bridge from string-based events to AiEvent
                // Commands can emit events using simple type/data format
                console.log(`[AI] Command emitted event: ${type}`, data);
            },
            updateStatus: (updates) => {
                if (updates.stageMessage) {
                    this.statusManager.setStage("executing", updates.stageMessage);
                }
            },
        };

        // Execute the command with validated arguments
        const result = await command.execute(this.graph, validatedArguments, context);

        // Log command result
        console.log("[AI] Command result:", result.success ? "SUCCESS" : "FAILED");
        console.log("[AI] Command message:", result.message);
        if (result.data) {
            console.log("[AI] Command data:", JSON.stringify(result.data, null, 2));
        }

        return result;
    }

    /**
     * Combine multiple command results into a single result.
     * @param results - Results from executed commands
     * @param llmText - Optional text from LLM
     * @returns Combined execution result
     */
    private combineResults(results: CommandResult[], llmText?: string): ExecutionResult {
        if (results.length === 0) {
            return {
                success: true,
                message: llmText ?? "No commands executed",
                llmText,
            };
        }

        // Check if all succeeded
        const allSucceeded = results.every((r) => r.success);

        // Combine messages
        const messages = results.map((r) => r.message);

        if (llmText) {
            messages.unshift(llmText);
        }

        // Combine affected nodes/edges
        const affectedNodes = results
            .flatMap((r) => r.affectedNodes ?? [])
            .filter((v, i, a) => a.indexOf(v) === i); // Unique

        const affectedEdges = results
            .flatMap((r) => r.affectedEdges ?? [])
            .filter((v, i, a) => a.indexOf(v) === i); // Unique

        // Use data from last successful result (or last result)
        const lastResult = results.filter((r) => r.success).pop() ?? results[results.length - 1];

        return {
            success: allSucceeded,
            message: messages.join("\n"),
            data: lastResult.data,
            affectedNodes: affectedNodes.length > 0 ? affectedNodes : undefined,
            affectedEdges: affectedEdges.length > 0 ? affectedEdges : undefined,
            llmText,
        };
    }

    /**
     * Get the current status snapshot.
     * @returns Current AI status
     */
    getStatus(): AiStatus {
        return this.statusManager.getSnapshot();
    }

    /**
     * Subscribe to status changes.
     * @param callback - Function to call on status change
     * @returns Unsubscribe function
     */
    onStatusChange(callback: StatusChangeCallback): () => void {
        return this.statusManager.subscribe(callback);
    }

    /**
     * Cancel the current operation.
     */
    cancel(): void {
        if (this.abortController) {
            this.abortController.abort();

            // Emit cancelled event
            if (this.currentInput) {
                this.emitAiEvent({
                    type: "ai-command-cancelled",
                    input: this.currentInput,
                    reason: "user",
                });
            }
        }
    }

    /**
     * Dispose of the controller and clean up resources.
     */
    dispose(): void {
        this.disposed = true;
        this.cancel();
        this.statusManager.reset();
    }
}
