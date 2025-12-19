import type {
    LlmProvider,
    LlmResponse,
    Message,
    ProviderOptions,
    StreamCallbacks,
    ToolDefinition,
} from "./types";

/** Records a call to the mock provider for inspection */
interface CallRecord {
    messages: Message[];
    tools: ToolDefinition[];
    streaming: boolean;
    timestamp: number;
}

/**
 * Mock LLM provider for deterministic testing.
 * Allows configuring specific responses for specific inputs.
 */
export class MockLlmProvider implements LlmProvider {
    readonly name = "mock";
    readonly supportsStreaming = true;
    readonly supportsTools = true;

    private responses = new Map<string, LlmResponse>();
    private defaultResponse: LlmResponse = {
        text: "This is a mock response.",
        toolCalls: [],
    };
    private configuredError: Error | null = null;
    private delay = 0;
    private callHistory: CallRecord[] = [];

    /**
     * Configure the provider (no-op for mock, but implements interface).
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    configure(_options: ProviderOptions): void {
        // Mock provider doesn't need configuration
    }

    /**
   * Set a response to return when the user message contains the given pattern.
   * @param pattern - String to match in user messages
   * @param response - Response to return
   */
    setResponse(pattern: string, response: LlmResponse): void {
        this.responses.set(pattern.toLowerCase(), response);
    }

    /**
   * Set the default response to return when no pattern matches.
   * @param response - Default response
   */
    setDefaultResponse(response: LlmResponse): void {
        this.defaultResponse = response;
    }

    /**
   * Set an error to throw on next generate/generateStream call.
   * @param error - Error to throw
   */
    setError(error: Error): void {
        this.configuredError = error;
    }

    /**
   * Clear any configured error.
   */
    clearError(): void {
        this.configuredError = null;
    }

    /**
   * Set a delay (in ms) before returning responses.
   * @param ms - Delay in milliseconds
   */
    setDelay(ms: number): void {
        this.delay = ms;
    }

    /**
   * Get the history of all calls made to this provider.
   */
    getCallHistory(): CallRecord[] {
        return [... this.callHistory];
    }

    /**
   * Clear the call history.
   */
    clearCallHistory(): void {
        this.callHistory = [];
    }

    /**
   * Find the response for a given message content.
   */
    private findResponse(messages: Message[]): LlmResponse {
    // Find the last user message
        const userMessage = [... messages].reverse().find((m) => m.role === "user");
        if (!userMessage) {
            return this.defaultResponse;
        }

        const content = userMessage.content.toLowerCase();

        // Check each pattern for a match
        for (const [pattern, response] of this.responses) {
            if (content.includes(pattern)) {
                return response;
            }
        }

        return this.defaultResponse;
    }

    /**
   * Generate a response (non-streaming).
   */
    async generate(
        messages: Message[],
        tools: ToolDefinition[],
        options?: {signal?: AbortSignal},
    ): Promise<LlmResponse> {
    // Record the call
        this.callHistory.push({
            messages,
            tools,
            streaming: false,
            timestamp: Date.now(),
        });

        // Check for abort
        if (options?.signal?.aborted) {
            throw new Error("Request was aborted");
        }

        // Check for configured error
        if (this.configuredError) {
            throw this.configuredError;
        }

        // Apply delay if configured
        if (this.delay > 0) {
            await new Promise((resolve) => setTimeout(resolve, this.delay));
        }

        // Check for abort again after delay
        if (options?.signal?.aborted) {
            throw new Error("Request was aborted");
        }

        return this.findResponse(messages);
    }

    /**
   * Generate a streaming response.
   * Simulates streaming by emitting text character by character.
   */
    async generateStream(
        messages: Message[],
        tools: ToolDefinition[],
        callbacks: StreamCallbacks,
        signal?: AbortSignal,
    ): Promise<void> {
    // Record the call
        this.callHistory.push({
            messages,
            tools,
            streaming: true,
            timestamp: Date.now(),
        });

        // Check for abort
        if (signal?.aborted) {
            throw new Error("Request was aborted");
        }

        // Check for configured error
        if (this.configuredError) {
            callbacks.onError(this.configuredError);
            throw this.configuredError;
        }

        const response = this.findResponse(messages);

        // Stream text in chunks
        const {text} = response;
        for (const char of text) {
            if (signal?.aborted) {
                throw new Error("Request was aborted");
            }

            callbacks.onChunk(char);

            // Small delay between chunks to simulate streaming
            if (this.delay > 0) {
                await new Promise((resolve) => setTimeout(resolve, this.delay / text.length));
            }
        }

        // Emit tool calls
        for (const toolCall of response.toolCalls) {
            if (signal?.aborted) {
                throw new Error("Request was aborted");
            }

            callbacks.onToolCall(toolCall.name, toolCall.arguments);
        }

        // Complete the stream
        callbacks.onComplete(response);
    }

    /**
   * Validate the API key.
   * For the mock provider, this always returns true unless an error is configured.
   * @returns Promise resolving to true if valid, false if invalid
   */
    validateApiKey(): Promise<boolean> {
        if (this.configuredError) {
            const errorMessage = this.configuredError.message.toLowerCase();
            if (
                errorMessage.includes("401") ||
                errorMessage.includes("403") ||
                errorMessage.includes("unauthorized") ||
                (errorMessage.includes("invalid") && errorMessage.includes("key")) ||
                errorMessage.includes("authentication") ||
                errorMessage.includes("api key")
            ) {
                return Promise.resolve(false);
            }

            return Promise.reject(this.configuredError);
        }

        return Promise.resolve(true);
    }
}
