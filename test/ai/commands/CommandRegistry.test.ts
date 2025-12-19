import {assert, beforeEach, describe, it} from "vitest";
import {z} from "zod";

import {CommandRegistry} from "../../../src/ai/commands";
import type {CommandContext, CommandResult, GraphCommand} from "../../../src/ai/commands/types";

// Helper to create a minimal command context for testing
function createMockContext(): CommandContext {
    return {
        graph: {} as CommandContext["graph"],
        abortSignal: new AbortController().signal,
        emitEvent: () => { /* no-op */ },
        updateStatus: () => { /* no-op */ },
    };
}

describe("CommandRegistry", () => {
    let registry: CommandRegistry;

    beforeEach(() => {
        registry = new CommandRegistry();
    });

    describe("register", () => {
        it("registers a command", () => {
            const command: GraphCommand = {
                name: "testCommand",
                description: "A test command",
                parameters: z.object({value: z.string()}),
                examples: [],
                execute: () => Promise.resolve({success: true, message: "done"}),
            };

            registry.register(command);
            assert.strictEqual(registry.get("testCommand")?.name, "testCommand");
        });

        it("registers command with examples", () => {
            const command: GraphCommand = {
                name: "setColor",
                description: "Set node color",
                parameters: z.object({color: z.string()}),
                examples: [
                    {input: "make it red", params: {color: "red"}},
                    {input: "color blue", params: {color: "blue"}},
                ],
                execute: () => Promise.resolve({success: true, message: "done"}),
            };

            registry.register(command);
            const retrieved = registry.get("setColor");
            assert.strictEqual(retrieved?.examples.length, 2);
        });

        it("throws on duplicate registration", () => {
            const command: GraphCommand = {
                name: "duplicate",
                description: "First command",
                parameters: z.object({}),
                examples: [],
                execute: () => Promise.resolve({success: true, message: "done"}),
            };

            registry.register(command);
            assert.throws(() => {
                registry.register(command);
            }, /already registered/i);
        });
    });

    describe("get", () => {
        it("retrieves registered command", () => {
            const command: GraphCommand = {
                name: "getWeather",
                description: "Get weather for a city",
                parameters: z.object({city: z.string()}),
                examples: [{input: "weather in Paris", params: {city: "Paris"}}],
                execute: () => Promise.resolve({success: true, message: "sunny"}),
            };

            registry.register(command);
            const retrieved = registry.get("getWeather");

            assert.ok(retrieved);
            assert.strictEqual(retrieved.name, "getWeather");
            assert.strictEqual(retrieved.description, "Get weather for a city");
        });

        it("returns undefined for non-existent command", () => {
            assert.strictEqual(registry.get("nonExistent"), undefined);
        });
    });

    describe("has", () => {
        it("returns true for registered command", () => {
            registry.register({
                name: "exists",
                description: "Exists",
                parameters: z.object({}),
                examples: [],
                execute: () => Promise.resolve({success: true, message: "done"}),
            });

            assert.strictEqual(registry.has("exists"), true);
        });

        it("returns false for non-existent command", () => {
            assert.strictEqual(registry.has("nonExistent"), false);
        });
    });

    describe("getAll", () => {
        it("returns all registered commands", () => {
            registry.register({
                name: "first",
                description: "First",
                parameters: z.object({}),
                examples: [],
                execute: () => Promise.resolve({success: true, message: "done"}),
            });
            registry.register({
                name: "second",
                description: "Second",
                parameters: z.object({}),
                examples: [],
                execute: () => Promise.resolve({success: true, message: "done"}),
            });

            const all = registry.getAll();
            assert.strictEqual(all.length, 2);
            assert.ok(all.some((c) => c.name === "first"));
            assert.ok(all.some((c) => c.name === "second"));
        });

        it("returns empty array when no commands registered", () => {
            const all = registry.getAll();
            assert.strictEqual(all.length, 0);
        });
    });

    describe("getNames", () => {
        it("returns names of all registered commands", () => {
            registry.register({
                name: "alpha",
                description: "Alpha",
                parameters: z.object({}),
                examples: [],
                execute: () => Promise.resolve({success: true, message: "done"}),
            });
            registry.register({
                name: "beta",
                description: "Beta",
                parameters: z.object({}),
                examples: [],
                execute: () => Promise.resolve({success: true, message: "done"}),
            });

            const names = registry.getNames();
            assert.ok(names.includes("alpha"));
            assert.ok(names.includes("beta"));
        });
    });

    describe("unregister", () => {
        it("removes a registered command", () => {
            registry.register({
                name: "toRemove",
                description: "To be removed",
                parameters: z.object({}),
                examples: [],
                execute: () => Promise.resolve({success: true, message: "done"}),
            });

            assert.strictEqual(registry.has("toRemove"), true);
            registry.unregister("toRemove");
            assert.strictEqual(registry.has("toRemove"), false);
        });

        it("does nothing for non-existent command", () => {
            // Should not throw
            registry.unregister("nonExistent");
        });
    });

    describe("clear", () => {
        it("removes all registered commands", () => {
            registry.register({
                name: "first",
                description: "First",
                parameters: z.object({}),
                examples: [],
                execute: () => Promise.resolve({success: true, message: "done"}),
            });
            registry.register({
                name: "second",
                description: "Second",
                parameters: z.object({}),
                examples: [],
                execute: () => Promise.resolve({success: true, message: "done"}),
            });

            registry.clear();
            assert.strictEqual(registry.getAll().length, 0);
        });
    });

    describe("toToolDefinitions", () => {
        it("converts commands to Vercel AI SDK tool format", () => {
            registry.register({
                name: "getWeather",
                description: "Get weather for a city",
                parameters: z.object({city: z.string()}),
                examples: [{input: "weather in Paris", params: {city: "Paris"}}],
                execute: () => Promise.resolve({success: true, message: "sunny"}),
            });

            const tools = registry.toToolDefinitions();
            assert.strictEqual(tools.length, 1);
            assert.strictEqual(tools[0].name, "getWeather");
            assert.strictEqual(tools[0].description, "Get weather for a city");
            assert.ok(tools[0].parameters);
        });

        it("converts multiple commands", () => {
            registry.register({
                name: "setLayout",
                description: "Set graph layout",
                parameters: z.object({type: z.string()}),
                examples: [],
                execute: () => Promise.resolve({success: true, message: "done"}),
            });
            registry.register({
                name: "setColor",
                description: "Set node color",
                parameters: z.object({color: z.string()}),
                examples: [],
                execute: () => Promise.resolve({success: true, message: "done"}),
            });

            const tools = registry.toToolDefinitions();
            assert.strictEqual(tools.length, 2);
        });
    });

    describe("command execution", () => {
        it("execute function receives correct parameters", async() => {
            let receivedParams: Record<string, unknown> | null = null;

            registry.register({
                name: "trackParams",
                description: "Track params",
                parameters: z.object({
                    color: z.string(),
                    size: z.number(),
                }),
                examples: [],
                execute: (_graph, params) => {
                    receivedParams = params;

                    return Promise.resolve({success: true, message: "tracked"});
                },
            });

            const command = registry.get("trackParams");
            const mockContext = createMockContext();
            await command?.execute(mockContext.graph, {color: "red", size: 10}, mockContext);

            assert.deepStrictEqual(receivedParams, {color: "red", size: 10});
        });

        it("execute function receives context", async() => {
            let receivedContext: CommandContext | undefined;

            registry.register({
                name: "trackContext",
                description: "Track context",
                parameters: z.object({}),
                examples: [],
                execute: (_graph, _params, context) => {
                    receivedContext = context;

                    return Promise.resolve({success: true, message: "tracked"});
                },
            });

            const command = registry.get("trackContext");
            const mockContext = createMockContext();
            await command?.execute(mockContext.graph, {}, mockContext);

            assert.ok(receivedContext);
            assert.ok(receivedContext.abortSignal);
        });

        it("execute function can return CommandResult with data", async() => {
            registry.register({
                name: "withData",
                description: "Returns data",
                parameters: z.object({}),
                examples: [],
                execute: (): Promise<CommandResult> => Promise.resolve({
                    success: true,
                    message: "got data",
                    data: {count: 42},
                    affectedNodes: ["node1", "node2"],
                }),
            });

            const command = registry.get("withData");
            const mockContext = createMockContext();
            const result = await command?.execute(mockContext.graph, {}, mockContext);

            assert.strictEqual(result?.success, true);
            assert.deepStrictEqual(result?.data, {count: 42});
            assert.deepStrictEqual(result?.affectedNodes, ["node1", "node2"]);
        });

        it("execute function can return failure result", async() => {
            registry.register({
                name: "failing",
                description: "Fails",
                parameters: z.object({}),
                examples: [],
                execute: (): Promise<CommandResult> => Promise.resolve({
                    success: false,
                    message: "Something went wrong",
                }),
            });

            const command = registry.get("failing");
            const mockContext = createMockContext();
            const result = await command?.execute(mockContext.graph, {}, mockContext);

            assert.strictEqual(result?.success, false);
            assert.strictEqual(result?.message, "Something went wrong");
        });
    });

    describe("complex parameters", () => {
        it("supports nested object parameters", () => {
            registry.register({
                name: "nested",
                description: "Nested params",
                parameters: z.object({
                    style: z.object({
                        color: z.string(),
                        size: z.number().optional(),
                    }),
                    selector: z.string(),
                }),
                examples: [],
                execute: () => Promise.resolve({success: true, message: "done"}),
            });

            const command = registry.get("nested");
            assert.ok(command);
        });

        it("supports array parameters", () => {
            registry.register({
                name: "withArray",
                description: "Array params",
                parameters: z.object({
                    nodeIds: z.array(z.string()),
                }),
                examples: [],
                execute: () => Promise.resolve({success: true, message: "done"}),
            });

            const command = registry.get("withArray");
            assert.ok(command);
        });

        it("supports optional parameters", () => {
            registry.register({
                name: "withOptional",
                description: "Optional params",
                parameters: z.object({
                    required: z.string(),
                    optional: z.string().optional(),
                    withDefault: z.number().default(10),
                }),
                examples: [],
                execute: () => Promise.resolve({success: true, message: "done"}),
            });

            const command = registry.get("withOptional");
            assert.ok(command);
        });

        it("supports enum parameters", () => {
            registry.register({
                name: "withEnum",
                description: "Enum params",
                parameters: z.object({
                    direction: z.enum(["up", "down", "left", "right"]),
                }),
                examples: [],
                execute: () => Promise.resolve({success: true, message: "done"}),
            });

            const command = registry.get("withEnum");
            assert.ok(command);
        });
    });
});
