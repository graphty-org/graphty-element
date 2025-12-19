import {assert, describe, it} from "vitest";
import {z} from "zod";

import type {LlmProvider, LlmResponse, Message, ProviderOptions, StreamCallbacks, ToolCall, ToolDefinition} from "../../../src/ai/providers/types";

describe("Provider Types", () => {
    describe("Message", () => {
        it("has required fields for user message", () => {
            const msg: Message = {
                role: "user",
                content: "test message",
            };
            assert.strictEqual(msg.role, "user");
            assert.strictEqual(msg.content, "test message");
        });

        it("has required fields for assistant message", () => {
            const msg: Message = {
                role: "assistant",
                content: "response",
            };
            assert.strictEqual(msg.role, "assistant");
        });

        it("has required fields for system message", () => {
            const msg: Message = {
                role: "system",
                content: "system prompt",
            };
            assert.strictEqual(msg.role, "system");
        });

        it("has required fields for tool message", () => {
            const msg: Message = {
                role: "tool",
                content: "tool result",
                toolCallId: "call_123",
            };
            assert.strictEqual(msg.role, "tool");
            assert.strictEqual(msg.toolCallId, "call_123");
        });

        it("supports optional toolCalls for assistant messages", () => {
            const msg: Message = {
                role: "assistant",
                content: "",
                toolCalls: [
                    {
                        id: "call_1",
                        name: "testTool",
                        arguments: {key: "value"},
                    },
                ],
            };
            assert.strictEqual(msg.toolCalls?.length, 1);
            assert.strictEqual(msg.toolCalls?.[0].name, "testTool");
        });
    });

    describe("ToolCall", () => {
        it("has required fields", () => {
            const call: ToolCall = {
                id: "call_123",
                name: "testTool",
                arguments: {foo: "bar"},
            };
            assert.strictEqual(call.id, "call_123");
            assert.strictEqual(call.name, "testTool");
            assert.deepStrictEqual(call.arguments, {foo: "bar"});
        });

        it("supports complex arguments", () => {
            const call: ToolCall = {
                id: "call_456",
                name: "findAndStyleNodes",
                arguments: {
                    selector: "data.type == 'server'",
                    style: {color: "#ff0000", size: 2},
                },
            };
            assert.strictEqual(call.name, "findAndStyleNodes");
            assert.deepStrictEqual(call.arguments, {
                selector: "data.type == 'server'",
                style: {color: "#ff0000", size: 2},
            });
        });
    });

    describe("ToolDefinition", () => {
        it("has required fields with Zod schema", () => {
            const definition: ToolDefinition = {
                name: "getWeather",
                description: "Get current weather for a city",
                parameters: z.object({
                    city: z.string(),
                    units: z.enum(["celsius", "fahrenheit"]).optional(),
                }),
            };
            assert.strictEqual(definition.name, "getWeather");
            assert.strictEqual(definition.description, "Get current weather for a city");
            assert.ok(definition.parameters);
        });
    });

    describe("LlmResponse", () => {
        it("has required fields", () => {
            const response: LlmResponse = {
                text: "Hello, world!",
                toolCalls: [],
            };
            assert.strictEqual(response.text, "Hello, world!");
            assert.deepStrictEqual(response.toolCalls, []);
        });

        it("supports optional usage", () => {
            const response: LlmResponse = {
                text: "Response",
                toolCalls: [],
                usage: {
                    promptTokens: 10,
                    completionTokens: 20,
                },
            };
            assert.strictEqual(response.usage?.promptTokens, 10);
            assert.strictEqual(response.usage?.completionTokens, 20);
        });

        it("supports tool calls in response", () => {
            const response: LlmResponse = {
                text: "",
                toolCalls: [
                    {
                        id: "call_1",
                        name: "setLayout",
                        arguments: {type: "circular"},
                    },
                ],
            };
            assert.strictEqual(response.toolCalls.length, 1);
            assert.strictEqual(response.toolCalls[0].name, "setLayout");
        });
    });

    describe("StreamCallbacks", () => {
        it("has all required callback functions", () => {
            const callbacks: StreamCallbacks = {
                onChunk: (text: string) => {
                    assert.ok(typeof text === "string");
                },
                onToolCall: (name: string, params: unknown) => {
                    assert.ok(typeof name === "string");
                    assert.ok(params !== undefined);
                },
                onToolResult: (name: string, result: unknown) => {
                    assert.ok(typeof name === "string");
                    assert.ok(result !== undefined);
                },
                onComplete: (response: LlmResponse) => {
                    assert.ok(typeof response.text === "string");
                },
                onError: (error: Error) => {
                    assert.ok(error instanceof Error);
                },
            };

            // Verify all callbacks are functions
            assert.strictEqual(typeof callbacks.onChunk, "function");
            assert.strictEqual(typeof callbacks.onToolCall, "function");
            assert.strictEqual(typeof callbacks.onToolResult, "function");
            assert.strictEqual(typeof callbacks.onComplete, "function");
            assert.strictEqual(typeof callbacks.onError, "function");
        });
    });

    describe("ProviderOptions", () => {
        it("supports all optional fields", () => {
            const options: ProviderOptions = {
                apiKey: "sk-test",
                model: "gpt-4o",
                baseUrl: "https://api.example.com",
                maxTokens: 1000,
                temperature: 0.7,
            };
            assert.strictEqual(options.apiKey, "sk-test");
            assert.strictEqual(options.model, "gpt-4o");
            assert.strictEqual(options.baseUrl, "https://api.example.com");
            assert.strictEqual(options.maxTokens, 1000);
            assert.strictEqual(options.temperature, 0.7);
        });

        it("allows empty options", () => {
            const options: ProviderOptions = {};
            assert.strictEqual(options.apiKey, undefined);
            assert.strictEqual(options.model, undefined);
        });
    });

    describe("LlmProvider interface", () => {
        it("can be implemented", () => {
            // This test verifies the interface can be properly implemented
            const provider: LlmProvider = {
                name: "test-provider",
                supportsStreaming: true,
                supportsTools: true,
                configure(): void {
                    // Configuration implementation - options not used in test
                },
                generate(): Promise<LlmResponse> {
                    // Parameters not used in test
                    return Promise.resolve({
                        text: "test response",
                        toolCalls: [],
                    });
                },
                generateStream(): Promise<void> {
                    // Parameters not used in test
                    return Promise.resolve();
                },
                validateApiKey(): Promise<boolean> {
                    return Promise.resolve(true);
                },
            };

            assert.strictEqual(provider.name, "test-provider");
            assert.strictEqual(provider.supportsStreaming, true);
            assert.strictEqual(provider.supportsTools, true);
        });
    });
});
