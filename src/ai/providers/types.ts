import type {z} from "zod";

/**
 * Represents a message in a conversation with an LLM.
 */
export interface Message {
    /** The role of the message sender */
    role: "system" | "user" | "assistant" | "tool";
    /** The content of the message */
    content: string;
    /** ID of the tool call this message is responding to (for tool role) */
    toolCallId?: string;
    /** Tool calls made by the assistant (for assistant role) */
    toolCalls?: ToolCall[];
}

/**
 * Represents a tool call made by the LLM.
 */
export interface ToolCall {
    /** Unique identifier for this tool call */
    id: string;
    /** Name of the tool to call */
    name: string;
    /** Arguments to pass to the tool */
    arguments: Record<string, unknown>;
}

/**
 * Defines a tool that can be called by the LLM.
 */
export interface ToolDefinition {
    /** Name of the tool */
    name: string;
    /** Description of what the tool does */
    description: string;
    /** Zod schema defining the parameters */
    parameters: z.ZodType;
}

/**
 * Response from an LLM generation.
 */
export interface LlmResponse {
    /** The text response from the LLM */
    text: string;
    /** Tool calls made by the LLM */
    toolCalls: ToolCall[];
    /** Token usage information */
    usage?: {
        promptTokens: number;
        completionTokens: number;
    };
}

/**
 * Callbacks for streaming LLM responses.
 */
export interface StreamCallbacks {
    /** Called when a text chunk is received */
    onChunk: (text: string) => void;
    /** Called when a tool call is initiated */
    onToolCall: (name: string, params: unknown) => void;
    /** Called when a tool call completes with a result */
    onToolResult: (name: string, result: unknown) => void;
    /** Called when generation is complete */
    onComplete: (response: LlmResponse) => void;
    /** Called when an error occurs */
    onError: (error: Error) => void;
}

/**
 * Configuration options for an LLM provider.
 */
export interface ProviderOptions {
    /** API key for authentication */
    apiKey?: string;
    /** Model identifier to use */
    model?: string;
    /** Base URL for API requests (for custom endpoints) */
    baseUrl?: string;
    /** Maximum tokens to generate */
    maxTokens?: number;
    /** Temperature for response generation (0-1) */
    temperature?: number;
}

/**
 * Interface for LLM providers.
 */
export interface LlmProvider {
    /** Name of the provider */
    readonly name: string;
    /** Whether this provider supports streaming responses */
    readonly supportsStreaming: boolean;
    /** Whether this provider supports tool/function calling */
    readonly supportsTools: boolean;
    /** Whether this provider supports custom system prompts with tools (default: true) */
    readonly supportsSystemPromptWithTools?: boolean;

    /**
     * Configure the provider with options.
     */
    configure(options: ProviderOptions): void;

    /**
     * Generate a response from the LLM.
     * @param messages - Conversation history
     * @param tools - Available tools for the LLM to use
     * @param options - Optional settings
     * @param options.signal - Optional abort signal for cancellation
     * @returns Promise resolving to the LLM response
     */
    generate(
        messages: Message[],
        tools: ToolDefinition[],
        options?: {signal?: AbortSignal},
    ): Promise<LlmResponse>;

    /**
     * Generate a streaming response from the LLM.
     * @param messages - Conversation history
     * @param tools - Available tools for the LLM to use
     * @param callbacks - Callbacks for streaming events
     * @param signal - Optional abort signal
     */
    generateStream(
        messages: Message[],
        tools: ToolDefinition[],
        callbacks: StreamCallbacks,
        signal?: AbortSignal,
    ): Promise<void>;

    /**
     * Validate the configured API key by making a minimal API call.
     * This consumes a small number of tokens but confirms the key is valid.
     * @returns Promise resolving to true if valid, false if invalid
     * @throws Error if not configured or network error occurs
     */
    validateApiKey(): Promise<boolean>;
}
