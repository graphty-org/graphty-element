import {createAnthropic} from "@ai-sdk/anthropic";
import {createGoogleGenerativeAI} from "@ai-sdk/google";
import {createOpenAI} from "@ai-sdk/openai";
import {generateText, type LanguageModel, type ModelMessage, streamText, type Tool} from "ai";

import type {
    LlmProvider,
    LlmResponse,
    Message,
    ProviderOptions,
    StreamCallbacks,
    ToolCall,
    ToolDefinition,
} from "./types";

/** Supported provider types */
export type VercelProviderType = "openai" | "anthropic" | "google";

/**
 * LLM provider implementation using the Vercel AI SDK.
 * Supports OpenAI, Anthropic, and Google providers.
 */
export class VercelAiProvider implements LlmProvider {
    readonly name: string;
    readonly supportsStreaming = true;
    readonly supportsTools = true;

    private apiKey?: string;
    private model?: string;
    private baseUrl?: string;
    private maxTokens?: number;
    private temperature?: number;
    private providerType: VercelProviderType;

    /**
     * Creates a new VercelAiProvider instance.
     * @param providerType - Type of provider (openai, anthropic, or google)
     */
    constructor(providerType: VercelProviderType) {
        this.name = providerType;
        this.providerType = providerType;
    }

    /**
     * Configure the provider with options.
     * @param options - Provider configuration options
     */
    configure(options: ProviderOptions): void {
        this.apiKey = options.apiKey;
        this.model = options.model;
        this.baseUrl = options.baseUrl;
        this.maxTokens = options.maxTokens;
        this.temperature = options.temperature;
    }

    /**
     * Get the configured model for the Vercel AI SDK.
     * @returns Language model instance
     */
    private getModel(): LanguageModel {
        if (!this.apiKey) {
            throw new Error(`API key not configured for ${this.name}`);
        }

        switch (this.providerType) {
            case "openai": {
                const openai = createOpenAI({apiKey: this.apiKey, baseURL: this.baseUrl});
                return openai(this.model ?? "gpt-4o");
            }
            case "anthropic": {
                const anthropic = createAnthropic({
                    apiKey: this.apiKey,
                    baseURL: this.baseUrl,
                    // Enable browser support - Anthropic requires this header for CORS
                    headers: {
                        "anthropic-dangerous-direct-browser-access": "true",
                    },
                });
                // Use claude-3-haiku as default - it's cost-effective and known to work well
                // claude-3-5-sonnet-20241022 has been deprecated in favor of newer naming conventions
                return anthropic(this.model ?? "claude-3-haiku-20240307");
            }
            case "google":
            default: {
                const google = createGoogleGenerativeAI({apiKey: this.apiKey, baseURL: this.baseUrl});
                return google(this.model ?? "gemini-2.0-flash");
            }
        }
    }

    /**
     * Generate a response from the LLM.
     * @param messages - Conversation messages
     * @param tools - Available tools for the LLM
     * @param options - Generation options
     * @param options.signal - Optional abort signal
     * @returns Promise resolving to LLM response
     */
    async generate(
        messages: Message[],
        tools: ToolDefinition[],
        options?: {signal?: AbortSignal},
    ): Promise<LlmResponse> {
        const model = this.getModel();
        const convertedMessages = this.convertMessages(messages);
        const convertedTools = this.convertTools(tools);

        const result = await generateText({
            model,
            messages: convertedMessages,
            tools: convertedTools,
            maxOutputTokens: this.maxTokens,
            temperature: this.temperature,
            abortSignal: options?.signal,
        });

        const {usage} = result;
        return {
            text: result.text,
            toolCalls: this.convertToolCalls(result.toolCalls),
            usage: usage.inputTokens !== undefined && usage.outputTokens !== undefined ?
                {promptTokens: usage.inputTokens, completionTokens: usage.outputTokens} :
                undefined,
        };
    }

    /**
     * Generate a streaming response from the LLM.
     * @param messages - Conversation messages
     * @param tools - Available tools for the LLM
     * @param callbacks - Streaming callbacks for text and tool calls
     * @param signal - Optional abort signal
     */
    async generateStream(
        messages: Message[],
        tools: ToolDefinition[],
        callbacks: StreamCallbacks,
        signal?: AbortSignal,
    ): Promise<void> {
        const model = this.getModel();
        const convertedMessages = this.convertMessages(messages);
        const convertedTools = this.convertTools(tools);

        const result = streamText({
            model,
            messages: convertedMessages,
            tools: convertedTools,
            maxOutputTokens: this.maxTokens,
            temperature: this.temperature,
            abortSignal: signal,
        });

        let accumulatedText = "";
        const toolCalls: ToolCall[] = [];

        try {
            for await (const event of result.fullStream) {
                switch (event.type) {
                    case "text-delta":
                        accumulatedText += event.text;
                        callbacks.onChunk(event.text);
                        break;

                    case "tool-call": {
                        // Tool calls may have 'input' or 'args' depending on SDK version
                        let args: Record<string, unknown> = {};
                        if ("input" in event) {
                            ({input: args} = event as {input: Record<string, unknown>});
                        } else if ("args" in event) {
                            ({args} = event as unknown as {args: Record<string, unknown>});
                        }

                        const toolCall: ToolCall = {
                            id: event.toolCallId,
                            name: event.toolName,
                            arguments: args,
                        };
                        toolCalls.push(toolCall);
                        callbacks.onToolCall(event.toolName, args);
                        break;
                    }

                    case "tool-result": {
                        // Tool results may have 'output' or 'result' depending on SDK version
                        let output: unknown;
                        if ("output" in event) {
                            ({output} = event as {output: unknown});
                        } else if ("result" in event) {
                            ({result: output} = event as unknown as {result: unknown});
                        }

                        callbacks.onToolResult(event.toolName, output);
                        break;
                    }

                    case "error":
                        callbacks.onError(new Error(String(event.error)));
                        break;

                    default:
                        // Ignore other event types
                        break;
                }
            }

            // Get final usage from the result
            const finalUsage = await result.usage;

            callbacks.onComplete({
                text: accumulatedText,
                toolCalls,
                usage: finalUsage.inputTokens !== undefined && finalUsage.outputTokens !== undefined ?
                    {promptTokens: finalUsage.inputTokens, completionTokens: finalUsage.outputTokens} :
                    undefined,
            });
        } catch (error) {
            callbacks.onError(error instanceof Error ? error : new Error(String(error)));
            throw error;
        }
    }

    /**
     * Convert our Message format to Vercel AI SDK's ModelMessage format.
     * @param messages - Messages to convert
     * @returns Array of ModelMessage objects
     */
    private convertMessages(messages: Message[]): ModelMessage[] {
        return messages.map((msg): ModelMessage => {
            switch (msg.role) {
                case "system":
                    return {role: "system", content: msg.content};

                case "user":
                    return {role: "user", content: msg.content};

                case "assistant":
                    if (msg.toolCalls && msg.toolCalls.length > 0) {
                        return {
                            role: "assistant",
                            content: [
                                ... (msg.content ? [{type: "text" as const, text: msg.content}] : []),
                                ... msg.toolCalls.map((tc) => ({
                                    type: "tool-call" as const,
                                    toolCallId: tc.id,
                                    toolName: tc.name,
                                    input: tc.arguments,
                                })),
                            ],
                        };
                    }

                    return {role: "assistant", content: msg.content};

                case "tool":
                default:
                    return {
                        role: "tool",
                        content: [{
                            type: "tool-result" as const,
                            toolCallId: msg.toolCallId ?? "",
                            toolName: "", // Will be matched by toolCallId
                            output: {type: "text" as const, value: msg.content},
                        }],
                    };
            }
        });
    }

    /**
     * Convert our ToolDefinition format to Vercel AI SDK's tool format.
     * We create plain tool objects to avoid complex generic inference issues with the AI SDK's
     * tool() helper function which causes "Type instantiation is excessively deep" errors.
     * @param tools - Tool definitions to convert
     * @returns Record mapping tool names to Tool objects
     */
    private convertTools(tools: ToolDefinition[]): Record<string, Tool> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result: Record<string, any> = {};

        for (const t of tools) {
            // Create tool object directly without using the tool() helper
            // to avoid TypeScript's excessive type instantiation depth error
            result[t.name] = {
                description: t.description,
                inputSchema: t.parameters,
            };
        }

        return result as Record<string, Tool>;
    }

    /**
     * Convert Vercel AI SDK tool calls to our ToolCall format.
     * @param toolCalls - Tool calls from Vercel AI SDK
     * @returns Array of ToolCall objects
     */
    private convertToolCalls(
        toolCalls: {toolCallId: string, toolName: string, input?: unknown, args?: unknown}[] | undefined,
    ): ToolCall[] {
        if (!toolCalls) {
            return [];
        }

        return toolCalls.map((tc) => ({
            id: tc.toolCallId,
            name: tc.toolName,
            arguments: (tc.input ?? tc.args ?? {}) as Record<string, unknown>,
        }));
    }

    /**
     * Validate the configured API key by making a minimal API call.
     * This sends a simple prompt to verify the key works.
     * @returns Promise resolving to true if valid, false if invalid
     * @throws Error if not configured or network error occurs
     */
    async validateApiKey(): Promise<boolean> {
        try {
            await this.generate(
                [{role: "user", content: "hi"}],
                [],
                {},
            );

            return true;
        } catch (error) {
            // Check for authentication errors (401, 403, invalid_api_key, etc.)
            const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
            if (
                errorMessage.includes("401") ||
                errorMessage.includes("403") ||
                errorMessage.includes("unauthorized") ||
                (errorMessage.includes("invalid") && errorMessage.includes("key")) ||
                errorMessage.includes("authentication") ||
                errorMessage.includes("api key")
            ) {
                return false;
            }

            // Re-throw non-auth errors (network issues, etc.)
            throw error;
        }
    }
}
