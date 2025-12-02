/**
 * LLM Provider module - provides abstraction for different LLM providers.
 * @module ai/providers
 */

// Provider factory
import {MockLlmProvider} from "./MockLlmProvider";
import type {LlmProvider} from "./types";
import {VercelAiProvider, type VercelProviderType} from "./VercelAiProvider";
import {WebLlmProvider} from "./WebLlmProvider";

// Types
export type {
    LlmProvider,
    LlmResponse,
    Message,
    ProviderOptions,
    StreamCallbacks,
    ToolCall,
    ToolDefinition,
} from "./types";

// Providers
export {MockLlmProvider} from "./MockLlmProvider";
export type {VercelProviderType} from "./VercelAiProvider";
export {VercelAiProvider} from "./VercelAiProvider";
export type {ProgressCallback, WebLlmModelInfo} from "./WebLlmProvider";
export {WebLlmProvider} from "./WebLlmProvider";

/** All supported provider types */
export type ProviderType = VercelProviderType | "mock" | "webllm";

/**
 * Create an LLM provider instance.
 * @param type - The type of provider to create
 * @returns An LLM provider instance
 */
export function createProvider(type: ProviderType): LlmProvider {
    if (type === "mock") {
        return new MockLlmProvider();
    }

    if (type === "webllm") {
        return new WebLlmProvider();
    }

    return new VercelAiProvider(type);
}
