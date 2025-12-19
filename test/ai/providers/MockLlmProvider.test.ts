import {assert, beforeEach, describe, expect, it} from "vitest";

import {MockLlmProvider} from "../../../src/ai/providers/MockLlmProvider";
import type {LlmResponse, StreamCallbacks} from "../../../src/ai/providers/types";

/** Create a StreamCallbacks object with no-op defaults and optional overrides */
function createCallbacks(overrides?: Partial<StreamCallbacks>): StreamCallbacks {
    return {
        onChunk: () => { /* no-op */ },
        onToolCall: () => { /* no-op */ },
        onToolResult: () => { /* no-op */ },
        onComplete: () => { /* no-op */ },
        onError: () => { /* no-op */ },
        ... overrides,
    };
}

describe("MockLlmProvider", () => {
    let provider: MockLlmProvider;

    beforeEach(() => {
        provider = new MockLlmProvider();
    });

    describe("initialization", () => {
        it("has correct name", () => {
            assert.strictEqual(provider.name, "mock");
        });

        it("supports streaming", () => {
            assert.strictEqual(provider.supportsStreaming, true);
        });

        it("supports tools", () => {
            assert.strictEqual(provider.supportsTools, true);
        });
    });

    describe("configure", () => {
        it("accepts options without throwing", () => {
            // Should not throw - configure is a no-op for mock but should accept any options
            provider.configure({apiKey: "test", model: "test-model"});
        });
    });

    describe("setResponse", () => {
        it("returns configured response for matching input", async() => {
            provider.setResponse("make red", {
                text: "Done",
                toolCalls: [{
                    id: "call_1",
                    name: "findAndStyleNodes",
                    arguments: {selector: "", style: {color: "#ff0000"}},
                }],
            });

            const response = await provider.generate(
                [{role: "user", content: "make red"}],
                [],
            );

            assert.strictEqual(response.toolCalls.length, 1);
            assert.strictEqual(response.toolCalls[0].name, "findAndStyleNodes");
            assert.deepStrictEqual(response.toolCalls[0].arguments, {
                selector: "",
                style: {color: "#ff0000"},
            });
        });

        it("returns configured response for partial match", async() => {
            provider.setResponse("make it blue", {
                text: "Changed to blue",
                toolCalls: [{
                    id: "call_1",
                    name: "findAndStyleNodes",
                    arguments: {selector: "", style: {color: "#0000ff"}},
                }],
            });

            const response = await provider.generate(
                [{role: "user", content: "please make it blue please"}],
                [],
            );

            assert.strictEqual(response.text, "Changed to blue");
            assert.strictEqual(response.toolCalls.length, 1);
        });

        it("returns default response for unmatched input", async() => {
            provider.setResponse("specific phrase", {
                text: "Specific response",
                toolCalls: [],
            });

            const response = await provider.generate(
                [{role: "user", content: "something completely different"}],
                [],
            );

            assert.ok(response.text.length > 0);
        });
    });

    describe("setDefaultResponse", () => {
        it("returns default response when no match found", async() => {
            const defaultResponse: LlmResponse = {
                text: "Default response",
                toolCalls: [],
            };
            provider.setDefaultResponse(defaultResponse);

            const response = await provider.generate(
                [{role: "user", content: "random input"}],
                [],
            );

            assert.strictEqual(response.text, "Default response");
            assert.deepStrictEqual(response.toolCalls, []);
        });
    });

    describe("setError", () => {
        it("throws configured error", async() => {
            provider.setError(new Error("Network error"));

            await expect(
                provider.generate([{role: "user", content: "test"}], []),
            ).rejects.toThrow(/Network error/);
        });

        it("throws error on streaming", async() => {
            provider.setError(new Error("Stream error"));

            const callbacks = createCallbacks({
                onError: (error) => {
                    assert.ok(error.message.includes("Stream error"));
                },
            });

            await expect(
                provider.generateStream([{role: "user", content: "test"}], [], callbacks),
            ).rejects.toThrow(/Stream error/);
        });
    });

    describe("clearError", () => {
        it("clears the configured error", async() => {
            provider.setError(new Error("Temporary error"));
            provider.clearError();

            // Should not throw after clearing
            const response = await provider.generate(
                [{role: "user", content: "test"}],
                [],
            );
            assert.ok(response.text);
        });
    });

    describe("generate", () => {
        it("returns text-only response", async() => {
            provider.setResponse("hello", {
                text: "Hello! How can I help?",
                toolCalls: [],
            });

            const response = await provider.generate(
                [{role: "user", content: "hello"}],
                [],
            );

            assert.strictEqual(response.text, "Hello! How can I help?");
            assert.deepStrictEqual(response.toolCalls, []);
        });

        it("returns response with multiple tool calls", async() => {
            provider.setResponse("red and zoom", {
                text: "Making changes",
                toolCalls: [
                    {id: "call_1", name: "findAndStyleNodes", arguments: {style: {color: "red"}}},
                    {id: "call_2", name: "zoomToFit", arguments: {}},
                ],
            });

            const response = await provider.generate(
                [{role: "user", content: "make nodes red and zoom to fit"}],
                [],
            );

            assert.strictEqual(response.toolCalls.length, 2);
            assert.strictEqual(response.toolCalls[0].name, "findAndStyleNodes");
            assert.strictEqual(response.toolCalls[1].name, "zoomToFit");
        });

        it("supports abort signal", async() => {
            const controller = new AbortController();
            controller.abort();

            await expect(
                provider.generate(
                    [{role: "user", content: "test"}],
                    [],
                    {signal: controller.signal},
                ),
            ).rejects.toThrow(/aborted/i);
        });
    });

    describe("generateStream", () => {
        it("streams text in chunks", async() => {
            provider.setResponse("test", {text: "Hello world", toolCalls: []});

            const chunks: string[] = [];
            const callbacks = createCallbacks({
                onChunk: (text) => chunks.push(text),
            });

            await provider.generateStream(
                [{role: "user", content: "test"}],
                [],
                callbacks,
            );

            assert.ok(chunks.length > 0);
            assert.strictEqual(chunks.join(""), "Hello world");
        });

        it("emits tool calls during streaming", async() => {
            provider.setResponse("action", {
                text: "Executing",
                toolCalls: [{
                    id: "call_1",
                    name: "testTool",
                    arguments: {param: "value"},
                }],
            });

            const toolCalls: {name: string, params: unknown}[] = [];
            const callbacks = createCallbacks({
                onToolCall: (name, params) => toolCalls.push({name, params}),
            });

            await provider.generateStream(
                [{role: "user", content: "perform action"}],
                [],
                callbacks,
            );

            assert.strictEqual(toolCalls.length, 1);
            assert.strictEqual(toolCalls[0].name, "testTool");
            assert.deepStrictEqual(toolCalls[0].params, {param: "value"});
        });

        it("calls onComplete with full response", async() => {
            const expectedResponse: LlmResponse = {
                text: "Complete response",
                toolCalls: [{id: "1", name: "tool", arguments: {}}],
            };
            provider.setResponse("complete", expectedResponse);

            let completedResponse: LlmResponse | undefined;
            const callbacks = createCallbacks({
                onComplete: (response) => {
                    completedResponse = response;
                },
            });

            await provider.generateStream(
                [{role: "user", content: "complete"}],
                [],
                callbacks,
            );

            assert.ok(completedResponse);
            assert.strictEqual(completedResponse.text, "Complete response");
            assert.strictEqual(completedResponse.toolCalls.length, 1);
        });

        it("calls onError when error is set", async() => {
            provider.setError(new Error("Stream failure"));

            let capturedError: Error | undefined;
            const callbacks = createCallbacks({
                onError: (error) => {
                    capturedError = error;
                },
            });

            await expect(
                provider.generateStream([{role: "user", content: "test"}], [], callbacks),
            ).rejects.toThrow();

            assert.ok(capturedError);
            assert.ok(capturedError.message.includes("Stream failure"));
        });

        it("respects abort signal", async() => {
            provider.setResponse("long", {text: "A very long response", toolCalls: []});

            const controller = new AbortController();
            const chunks: string[] = [];
            const callbacks = createCallbacks({
                onChunk: (text) => {
                    chunks.push(text);
                    controller.abort();
                },
            });

            await expect(
                provider.generateStream(
                    [{role: "user", content: "long"}],
                    [],
                    callbacks,
                    controller.signal,
                ),
            ).rejects.toThrow(/aborted/i);

            // Should have received some chunks before abort
            assert.ok(chunks.length > 0);
        });
    });

    describe("setDelay", () => {
        it("adds configurable delay to responses", async() => {
            provider.setDelay(50);
            provider.setResponse("test", {text: "Response", toolCalls: []});

            const startTime = Date.now();
            await provider.generate([{role: "user", content: "test"}], []);
            const elapsed = Date.now() - startTime;

            assert.ok(elapsed >= 45, `Expected delay of at least 45ms, got ${elapsed}ms`);
        });
    });

    describe("getCallHistory", () => {
        it("records all generate calls", async() => {
            await provider.generate([{role: "user", content: "first"}], []);
            await provider.generate([{role: "user", content: "second"}], []);

            const history = provider.getCallHistory();
            assert.strictEqual(history.length, 2);
            assert.strictEqual(history[0].messages[0].content, "first");
            assert.strictEqual(history[1].messages[0].content, "second");
        });

        it("records generateStream calls", async() => {
            const callbacks = createCallbacks();

            await provider.generateStream([{role: "user", content: "streamed"}], [], callbacks);

            const history = provider.getCallHistory();
            assert.strictEqual(history.length, 1);
            assert.strictEqual(history[0].messages[0].content, "streamed");
            assert.strictEqual(history[0].streaming, true);
        });
    });

    describe("clearCallHistory", () => {
        it("clears the call history", async() => {
            await provider.generate([{role: "user", content: "test"}], []);
            assert.strictEqual(provider.getCallHistory().length, 1);

            provider.clearCallHistory();
            assert.strictEqual(provider.getCallHistory().length, 0);
        });
    });
});
