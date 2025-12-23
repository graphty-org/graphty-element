/**
 * WebLLM Provider - In-browser LLM using WebGPU.
 * Lazy-loads the @mlc-ai/web-llm package on demand.
 * @module ai/providers/WebLlmProvider
 */

import type {
    LlmProvider,
    LlmResponse,
    Message,
    ProviderOptions,
    StreamCallbacks,
    ToolCall,
    ToolDefinition,
} from "./types";

/** Progress callback type */
export type ProgressCallback = (progress: number, text: string) => void;

/** Model information */
export interface WebLlmModelInfo {
    /** Model identifier for WebLLM */
    id: string;
    /** Human-readable model name */
    name: string;
    /** Approximate model size (e.g., "500MB", "1.5GB") */
    size: string;
    /** Optional description */
    description?: string;
}

/** Available models with their metadata */
const AVAILABLE_MODELS: WebLlmModelInfo[] = [
    {
        id: "Llama-3.2-1B-Instruct-q4f32_1-MLC",
        name: "Llama 3.2 1B",
        size: "~500MB",
        description: "Fast, lightweight model suitable for quick responses",
    },
    {
        id: "Llama-3.2-3B-Instruct-q4f32_1-MLC",
        name: "Llama 3.2 3B",
        size: "~1.5GB",
        description: "Better quality responses with reasonable performance",
    },
    {
        id: "Phi-3.5-mini-instruct-q4f16_1-MLC",
        name: "Phi 3.5 Mini",
        size: "~2GB",
        description: "Good balance of quality and performance",
    },
    {
        id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
        name: "Qwen 2.5 1.5B",
        size: "~800MB",
        description: "Efficient model with good multilingual support",
    },
    {
        id: "SmolLM2-360M-Instruct-q4f16_1-MLC",
        name: "SmolLM2 360M",
        size: "~200MB",
        description: "Very small and fast, basic capabilities",
    },
];

// OpenAI API key names (snake_case required by API)
interface OpenAiRequestOptions {
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
    tools?: Record<string, unknown>[];
    tool_choice?: string;
}

interface OpenAiToolCall {
    id?: string;
    function?: {
        name?: string;
        arguments?: string | Record<string, unknown>;
    };
}

interface OpenAiMessage {
    role: string;
    content?: string | null;
    tool_call_id?: string;
    tool_calls?: OpenAiToolCall[];
}

interface OpenAiUsage {
    prompt_tokens?: number;
    completion_tokens?: number;
}

interface OpenAiResponse {
    choices?: {
        message?: {
            content?: string;
            tool_calls?: OpenAiToolCall[];
        };
        delta?: {
            content?: string;
            tool_calls?: OpenAiToolCall[];
        };
    }[];
    usage?: OpenAiUsage;
}

/**
 * LLM provider using WebLLM for in-browser inference via WebGPU.
 * No API key required - runs entirely in the browser.
 */
export class WebLlmProvider implements LlmProvider {
    readonly name = "webllm";
    readonly supportsStreaming = true;
    readonly supportsTools = true;
    readonly supportsSystemPromptWithTools = false; // Hermes models don't support custom system prompts with tools

    private model?: string;
    private maxTokens?: number;
    private temperature?: number;

    private progressCallbacks = new Set<ProgressCallback>();
    private initialized = false;
    private ready = false;
    private mockMode = false;

    // WebLLM engine instance (dynamically imported)
    private engine: unknown = null;

    /**
     * Check if WebGPU is available in the current browser.
     */
    static async isWebGPUAvailable(): Promise<boolean> {
        if (typeof navigator === "undefined") {
            return false;
        }

        try {
            // Check for WebGPU support
            if (!("gpu" in navigator)) {
                return false;
            }

            const {gpu} = navigator;
            if (!gpu) {
                return false;
            }

            const adapter = await gpu.requestAdapter();
            return Boolean(adapter);
        } catch {
            return false;
        }
    }

    /**
     * Get list of available models for WebLLM.
     */
    static getAvailableModels(): WebLlmModelInfo[] {
        return Array.from(AVAILABLE_MODELS);
    }

    /**
     * Configure the provider with options.
     */
    configure(options: ProviderOptions): void {
        if (options.model) {
            this.model = options.model;
        }

        if (options.maxTokens !== undefined) {
            this.maxTokens = options.maxTokens;
        }

        if (options.temperature !== undefined) {
            this.temperature = options.temperature;
        }
    }

    /**
     * Check if the provider is initialized.
     */
    get isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * Check if the provider is ready to generate responses.
     */
    get isReady(): boolean {
        return this.ready;
    }

    /**
     * Check if mock mode is enabled.
     */
    get isMockMode(): boolean {
        return this.mockMode;
    }

    /**
     * Enable mock mode for testing without WebGPU.
     */
    enableMockMode(): void {
        this.mockMode = true;
        this.initialized = true;
        this.ready = true;
    }

    /**
     * Disable mock mode.
     */
    disableMockMode(): void {
        this.mockMode = false;
        this.initialized = false;
        this.ready = false;
        this.engine = null;
    }

    /**
     * Register a progress callback for initialization.
     */
    onProgress(callback: ProgressCallback): void {
        this.progressCallbacks.add(callback);
    }

    /**
     * Remove a progress callback.
     */
    offProgress(callback: ProgressCallback): void {
        this.progressCallbacks.delete(callback);
    }

    /**
     * Emit progress to all registered callbacks (used for testing).
     */
    simulateProgress(progress: number, text: string): void {
        this.emitProgress(progress, text);
    }

    /**
     * Emit progress to all registered callbacks.
     */
    private emitProgress(progress: number, text: string): void {
        for (const callback of this.progressCallbacks) {
            callback(progress, text);
        }
    }

    /**
     * Initialize the WebLLM engine.
     * This lazy-loads the @mlc-ai/web-llm package and downloads the model.
     */
    async initialize(): Promise<void> {
        if (this.mockMode) {
            this.initialized = true;
            this.ready = true;
            return;
        }

        // Check WebGPU availability
        const webGpuAvailable = await WebLlmProvider.isWebGPUAvailable();
        if (!webGpuAvailable) {
            throw new Error(
                "WebGPU is not supported in this browser. " +
                "Please use Chrome 113+ or another WebGPU-enabled browser.",
            );
        }

        try {
            this.emitProgress(0, "Loading WebLLM module...");

            // Dynamically import @mlc-ai/web-llm
            let webllm;
            try {
                // @ts-expect-error - @mlc-ai/web-llm is an optional peer dependency loaded dynamically at runtime
                webllm = await import("@mlc-ai/web-llm");
            } catch {
                throw new Error(
                    "Failed to load @mlc-ai/web-llm. This is an optional dependency for in-browser AI. " +
                    "To use WebLLM, install it with: npm install @mlc-ai/web-llm",
                );
            }

            this.emitProgress(0.1, "Creating engine...");

            const modelId = this.model ?? "Llama-3.2-1B-Instruct-q4f32_1-MLC";

            // Create engine with progress callback
            this.engine = await webllm.CreateMLCEngine(modelId, {
                initProgressCallback: (report: {progress: number, text: string}) => {
                    // Map progress from 0.1 to 1.0 (reserve 0-0.1 for module loading)
                    const mappedProgress = 0.1 + (report.progress * 0.9);
                    this.emitProgress(mappedProgress, report.text);
                },
            });

            this.initialized = true;
            this.ready = true;
            this.emitProgress(1, "Model loaded successfully");
        } catch (error) {
            this.initialized = false;
            this.ready = false;
            throw error;
        }
    }

    /**
     * Generate a response from the LLM.
     */
    async generate(
        messages: Message[],
        tools: ToolDefinition[],
        options?: {signal?: AbortSignal},
    ): Promise<LlmResponse> {
        if (options?.signal?.aborted) {
            throw new Error("Request was aborted");
        }

        if (this.mockMode) {
            return this.generateMock(messages, tools);
        }

        if (!this.initialized || !this.engine) {
            throw new Error("WebLLM not initialized. Call initialize() first.");
        }

        try {
            // Convert messages to OpenAI format (which WebLLM uses)
            const openaiMessages = this.convertMessages(messages);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const engine = this.engine as any;

            // Generate with tool support if tools are provided
            // OpenAI API requires snake_case keys
            /* eslint-disable camelcase */
            const requestOptions: OpenAiRequestOptions = {
                temperature: this.temperature ?? 0.7,
                max_tokens: this.maxTokens ?? 1024,
            };

            if (tools.length > 0) {
                requestOptions.tools = this.convertTools(tools);
                requestOptions.tool_choice = "auto";
            }

            const response = await engine.chat.completions.create({
                messages: openaiMessages,
                ... requestOptions,
            }) as OpenAiResponse;

            // Check for abort after async operation
            if (options?.signal?.aborted) {
                throw new Error("Request was aborted");
            }

            return this.convertResponse(response);
        } catch (error) {
            if (String(error).includes("aborted")) {
                throw new Error("Request was aborted");
            }

            throw error;
        }
    }

    /**
     * Generate a streaming response from the LLM.
     */
    async generateStream(
        messages: Message[],
        tools: ToolDefinition[],
        callbacks: StreamCallbacks,
        signal?: AbortSignal,
    ): Promise<void> {
        if (signal?.aborted) {
            throw new Error("Request was aborted");
        }

        if (this.mockMode) {
            await this.generateStreamMock(messages, tools, callbacks, signal);
            return;
        }

        if (!this.initialized || !this.engine) {
            throw new Error("WebLLM not initialized. Call initialize() first.");
        }

        try {
            const openaiMessages = this.convertMessages(messages);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const engine = this.engine as any;

            // OpenAI API requires snake_case keys
            /* eslint-disable camelcase */
            const requestOptions: OpenAiRequestOptions = {
                stream: true,
                temperature: this.temperature ?? 0.7,
                max_tokens: this.maxTokens ?? 1024,
            };

            if (tools.length > 0) {
                requestOptions.tools = this.convertTools(tools);
                requestOptions.tool_choice = "auto";
            }
            /* eslint-enable camelcase */

            const stream = await engine.chat.completions.create({
                messages: openaiMessages,
                ... requestOptions,
            });

            let accumulatedText = "";
            const toolCalls: ToolCall[] = [];

            for await (const chunk of stream as AsyncIterable<OpenAiResponse>) {
                if (signal?.aborted) {
                    throw new Error("Request was aborted");
                }

                const delta = chunk.choices?.[0]?.delta;
                if (!delta) {
                    continue;
                }

                // Handle text content
                if (delta.content) {
                    const content = String(delta.content);
                    accumulatedText += content;
                    callbacks.onChunk(content);
                }

                // Handle tool calls (snake_case from OpenAI API)
                const toolCallsArray = delta.tool_calls;
                if (toolCallsArray) {
                    for (const tc of toolCallsArray) {
                        if (tc.function?.name) {
                            const toolCall: ToolCall = {
                                id: tc.id ?? `call_${Date.now()}`,
                                name: tc.function.name,
                                arguments: typeof tc.function.arguments === "string" ?
                                    JSON.parse(tc.function.arguments) as Record<string, unknown> :
                                    tc.function.arguments ?? {},
                            };
                            toolCalls.push(toolCall);
                            callbacks.onToolCall(toolCall.name, toolCall.arguments);
                        }
                    }
                }
            }

            callbacks.onComplete({
                text: accumulatedText,
                toolCalls,
            });
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            callbacks.onError(err);
            throw error;
        }
    }

    /**
     * Validate the API key.
     * For WebLLM, no API key is needed, so this always returns true.
     */
    validateApiKey(): Promise<boolean> {
        return Promise.resolve(true);
    }

    /**
     * Dispose of the engine and free resources.
     */
    async dispose(): Promise<void> {
        if (this.engine) {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const engine = this.engine as any;
                if (typeof engine.unload === "function") {
                    await engine.unload();
                }
            } catch {
                // Ignore disposal errors
            }
        }

        this.engine = null;
        this.initialized = false;
        this.ready = false;
        this.mockMode = false;
    }

    /**
     * Convert our Message format to OpenAI format.
     */
    private convertMessages(messages: Message[]): OpenAiMessage[] {
        /* eslint-disable camelcase */
        return messages.map((msg) => {
            if (msg.role === "tool") {
                // OpenAI API uses snake_case
                return {
                    role: "tool",
                    tool_call_id: msg.toolCallId ?? "",
                    content: msg.content,
                };
            }

            if (msg.role === "assistant" && msg.toolCalls?.length) {
                // OpenAI API uses snake_case
                return {
                    role: "assistant",
                    content: msg.content || null,
                    tool_calls: msg.toolCalls.map((tc) => ({
                        id: tc.id,
                        type: "function",
                        function: {
                            name: tc.name,
                            arguments: JSON.stringify(tc.arguments),
                        },
                    })),
                };
            }

            return {
                role: msg.role,
                content: msg.content,
            };
        });
        /* eslint-enable camelcase */
    }

    /**
     * Convert our ToolDefinition format to OpenAI function format.
     */
    private convertTools(tools: ToolDefinition[]): Record<string, unknown>[] {
        return tools.map((t) => ({
            type: "function",
            function: {
                name: t.name,
                description: t.description,
                parameters: t.parameters,
            },
        }));
    }

    /**
     * Convert OpenAI response format to our LlmResponse format.
     */
    private convertResponse(response: OpenAiResponse): LlmResponse {
        const choice = response.choices?.[0];
        const message = choice?.message ?? {};

        const toolCalls: ToolCall[] = [];
        // OpenAI API uses snake_case
        const responseToolCalls = message.tool_calls;
        if (responseToolCalls) {
            for (const tc of responseToolCalls) {
                toolCalls.push({
                    id: tc.id ?? `call_${Date.now()}`,
                    name: tc.function?.name ?? "",
                    arguments: typeof tc.function?.arguments === "string" ?
                        JSON.parse(tc.function.arguments) as Record<string, unknown> :
                        tc.function?.arguments ?? {},
                });
            }
        }

        // OpenAI API uses snake_case for usage fields
        const promptTokens = response.usage?.prompt_tokens;
        const completionTokens = response.usage?.completion_tokens;

        return {
            text: String(message.content ?? ""),
            toolCalls,
            usage: response.usage ?
                {
                    promptTokens: promptTokens ?? 0,
                    completionTokens: completionTokens ?? 0,
                } :
                undefined,
        };
    }

    /**
     * Generate a mock response for testing.
     */
    private generateMock(messages: Message[], tools: ToolDefinition[]): LlmResponse {
        // Find the last user message
        const reversedMessages = Array.from(messages).reverse();
        const userMessage = reversedMessages.find((m) => m.role === "user");
        const content = userMessage?.content ?? "";

        // Generate a simple response
        let text = `I understand you said: "${content.slice(0, 50)}${content.length > 50 ? "..." : ""}"`;
        const toolCalls: ToolCall[] = [];

        // If tools are available and input looks like a command, use a tool
        if (tools.length > 0 && content.toLowerCase().includes("help")) {
            text = "Here are the available commands:";
            // Don't actually call tools in basic mock
        }

        return {text, toolCalls};
    }

    /**
     * Generate a mock streaming response for testing.
     */
    private async generateStreamMock(
        messages: Message[],
        tools: ToolDefinition[],
        callbacks: StreamCallbacks,
        signal?: AbortSignal,
    ): Promise<void> {
        const response = this.generateMock(messages, tools);

        // Stream character by character with small delays
        for (const char of response.text) {
            if (signal?.aborted) {
                throw new Error("Request was aborted");
            }

            callbacks.onChunk(char);

            // Small delay to simulate streaming
            await new Promise((resolve) => setTimeout(resolve, 5));
        }

        // Emit tool calls
        for (const toolCall of response.toolCalls) {
            callbacks.onToolCall(toolCall.name, toolCall.arguments);
        }

        callbacks.onComplete(response);
    }
}
