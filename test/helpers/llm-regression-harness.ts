/**
 * LLM Regression Test Harness
 * @module test/helpers/llm-regression-harness
 *
 * Core harness class for running LLM regression tests.
 * Sends prompts to real LLM providers and captures tool calls for verification.
 */

import {Color3} from "@babylonjs/core";

import {AiController} from "../../src/ai/AiController";
import {
    captureScreenshot,
    captureVideo,
    clearStyles,
    CommandRegistry,
    type CommandResult,
    describeProperty,
    findAndStyleEdges,
    findAndStyleNodes,
    findNodes,
    listAlgorithms,
    queryGraph,
    runAlgorithm,
    sampleData,
    setCameraPosition,
    setDimension,
    setImmersiveMode,
    setLayout,
    zoomToNodes,
} from "../../src/ai/commands";
import type {ToolCall} from "../../src/ai/providers/types";
import {VercelAiProvider} from "../../src/ai/providers/VercelAiProvider";
import type {Graph} from "../../src/Graph";
import {getLlmRegressionModel, getOpenAiApiKey} from "./llm-regression-env";
import {createMockGraphWithCustomData} from "./mock-graph-custom-data";

/**
 * Test graph fixture interface
 */
export interface TestGraphFixture {
    nodes: {id: string, data: Record<string, unknown>}[];
    edges: {source: string, target: string, data: Record<string, unknown>}[];
}

/**
 * Result of a single LLM regression test
 */
export interface LlmRegressionResult {
    /** The original prompt sent to the LLM */
    prompt: string;
    /** Whether a tool was called */
    toolWasCalled: boolean;
    /** Name of the tool that was called (or null if no tool call) */
    toolName: string | null;
    /** Parameters passed to the tool (or null if no tool call) */
    toolParams: Record<string, unknown> | null;
    /** Result of executing the command (or null if no tool call or execution failed) */
    commandResult: CommandResult | null;
    /** Text response from the LLM (if any) */
    llmText: string | null;
    /** Time taken to get the LLM response in milliseconds */
    latencyMs: number;
    /** Token usage from the LLM response */
    tokenUsage?: {prompt: number, completion: number};
    /** Error that occurred during execution */
    error?: Error;
}

/**
 * Expected test outcomes for flexible matching
 */
export interface TestExpectations {
    /** Expected tool name (can be single tool or array of acceptable tools) */
    expectedTool?: string | string[];
    /** Expected parameters (partial matching) */
    expectedParams?: Record<string, unknown>;
    /** Custom validation function */
    validate?: (result: LlmRegressionResult) => boolean;
}

/**
 * Options for retry behavior when API calls fail
 */
export interface RetryOptions {
    /** Maximum number of retry attempts (default: 2) */
    maxRetries?: number;
    /** Delay between retry attempts in milliseconds (default: 1000) */
    retryDelayMs?: number;
    /** Custom function to determine if an error should trigger a retry */
    retryOn?: (error: Error) => boolean;
}

/**
 * Default retry options
 */
const DEFAULT_RETRY_OPTIONS: Required<Omit<RetryOptions, "retryOn">> = {
    maxRetries: 2,
    retryDelayMs: 1000,
};

/**
 * Options for creating the LLM regression test harness
 */
export interface LlmRegressionTestHarnessOptions {
    /** Test graph fixture data */
    graphData?: TestGraphFixture;
    /** Provider type (currently only openai supported) */
    provider?: "openai";
    /** Model to use (defaults to gpt-4o-mini) */
    model?: string;
    /** Temperature setting (defaults to 0 for determinism) */
    temperature?: number;
}

/**
 * Captured tool call information from the provider
 */
interface CapturedToolCall {
    name: string;
    arguments: Record<string, unknown>;
}

/**
 * Custom provider wrapper that captures tool calls before execution
 */
class ToolCallCapturingProvider extends VercelAiProvider {
    capturedToolCalls: CapturedToolCall[] = [];
    capturedTokenUsage?: {prompt: number, completion: number};

    async generate(
        messages: Parameters<VercelAiProvider["generate"]>[0],
        tools: Parameters<VercelAiProvider["generate"]>[1],
        options?: Parameters<VercelAiProvider["generate"]>[2],
    ): ReturnType<VercelAiProvider["generate"]> {
        const result = await super.generate(messages, tools, options);

        // Capture tool calls
        this.capturedToolCalls = result.toolCalls.map((tc: ToolCall) => ({
            name: tc.name,
            arguments: tc.arguments,
        }));

        // Capture token usage
        if (result.usage) {
            this.capturedTokenUsage = {
                prompt: result.usage.promptTokens,
                completion: result.usage.completionTokens,
            };
        }

        return result;
    }

    clearCaptured(): void {
        this.capturedToolCalls = [];
        this.capturedTokenUsage = undefined;
    }
}

/**
 * LLM Regression Test Harness
 *
 * Provides infrastructure for testing real LLM tool calling behavior.
 * Sends prompts to OpenAI's API and verifies correct tools are called.
 */
export class LlmRegressionTestHarness {
    private controller: AiController;
    private provider: ToolCallCapturingProvider;
    private graph: Graph;
    private disposed = false;

    private constructor(controller: AiController, provider: ToolCallCapturingProvider, graph: Graph) {
        this.controller = controller;
        this.provider = provider;
        this.graph = graph;
    }

    /**
     * Create a new harness instance.
     * @param options - Configuration options
     * @returns Promise resolving to the harness instance
     * @throws Error if API key is not available
     */
    static create(options: LlmRegressionTestHarnessOptions = {}): Promise<LlmRegressionTestHarness> {
        const apiKey = getOpenAiApiKey();
        if (!apiKey) {
            throw new Error("VITE_OPENAI_API_KEY environment variable is required for LLM regression tests");
        }

        // Create provider
        const provider = new ToolCallCapturingProvider("openai");
        provider.configure({
            apiKey,
            model: options.model ?? getLlmRegressionModel(),
            temperature: options.temperature ?? 0,
        });

        // Create graph from fixture or default
        const graph = LlmRegressionTestHarness.createGraphFromFixture(options.graphData);

        // Create command registry with all commands
        const registry = new CommandRegistry();
        LlmRegressionTestHarness.registerAllCommands(registry);

        // Create controller
        const controller = new AiController({
            provider,
            commandRegistry: registry,
            graph,
        });

        return Promise.resolve(new LlmRegressionTestHarness(controller, provider, graph));
    }

    /**
     * Create a mock graph from a test fixture.
     */
    private static createGraphFromFixture(fixture?: TestGraphFixture): Graph {
        if (!fixture) {
            // Create a simple default graph
            return createMockGraphWithCustomData({
                nodeCount: 5,
                edgeCount: 4,
                nodeDataGenerator: (i) => ({
                    type: i % 2 === 0 ? "server" : "database",
                    name: `node-${i}`,
                    status: "online",
                }),
                edgeDataGenerator: () => ({
                    weight: 1.0,
                }),
            });
        }

        // Create graph from fixture
        const nodeCount = fixture.nodes.length;
        const edgeCount = fixture.edges.length;

        return createMockGraphWithCustomData({
            nodeCount,
            edgeCount,
            nodeDataGenerator: (i) => {
                if (i < fixture.nodes.length) {
                    return fixture.nodes[i].data;
                }

                return {};
            },
            edgeDataGenerator: (i) => {
                if (i < fixture.edges.length) {
                    return fixture.edges[i].data;
                }

                return {};
            },
        });
    }

    /**
     * Register all available commands in the registry.
     */
    private static registerAllCommands(registry: CommandRegistry): void {
        // Query commands
        registry.register(queryGraph);
        registry.register(findNodes);
        registry.register(sampleData);
        registry.register(describeProperty);

        // Style commands
        registry.register(findAndStyleNodes);
        registry.register(findAndStyleEdges);
        registry.register(clearStyles);

        // Layout commands
        registry.register(setLayout);
        registry.register(setDimension);

        // Camera commands
        registry.register(setCameraPosition);
        registry.register(zoomToNodes);

        // Algorithm commands
        registry.register(listAlgorithms);
        registry.register(runAlgorithm);

        // Mode commands
        registry.register(setImmersiveMode);

        // Capture commands
        registry.register(captureScreenshot);
        registry.register(captureVideo);
    }

    /**
     * Test a prompt and capture the results.
     * @param prompt - The natural language prompt to send
     * @param expectations - Optional expectations for validation
     * @param retryOptions - Optional retry configuration for handling transient errors
     * @returns Promise resolving to the test result
     */
    async testPrompt(
        prompt: string,
        expectations?: TestExpectations,
        retryOptions?: RetryOptions,
    ): Promise<LlmRegressionResult> {
        if (this.disposed) {
            throw new Error("Harness has been disposed");
        }

        const maxRetries = retryOptions?.maxRetries ?? DEFAULT_RETRY_OPTIONS.maxRetries;
        const retryDelayMs = retryOptions?.retryDelayMs ?? DEFAULT_RETRY_OPTIONS.retryDelayMs;
        const shouldRetry = retryOptions?.retryOn ?? this.defaultRetryCondition;

        let lastError: Error | undefined;
        let attempts = 0;
        const startTime = Date.now();

        while (attempts <= maxRetries) {
            // Clear any previously captured data for each attempt
            this.provider.clearCaptured();

            let error: Error | undefined;
            let commandResult: CommandResult | null = null;

            try {
                const executionResult = await this.controller.execute(prompt);
                commandResult = {
                    success: executionResult.success,
                    message: executionResult.message,
                    data: executionResult.data,
                    affectedNodes: executionResult.affectedNodes,
                    affectedEdges: executionResult.affectedEdges,
                };

                // Success - build and return result
                const latencyMs = Date.now() - startTime;
                const toolCalls = this.provider.capturedToolCalls;
                const firstToolCall = toolCalls.length > 0 ? toolCalls[0] : null;

                const result: LlmRegressionResult = {
                    prompt,
                    toolWasCalled: toolCalls.length > 0,
                    toolName: firstToolCall?.name ?? null,
                    toolParams: firstToolCall?.arguments ?? null,
                    commandResult,
                    llmText: commandResult.message,
                    latencyMs,
                    tokenUsage: this.provider.capturedTokenUsage,
                    error: undefined,
                };

                // Validate expectations if provided
                if (expectations) {
                    this.validateExpectations(result, expectations);
                }

                return result;
            } catch (e) {
                error = e instanceof Error ? e : new Error(String(e));
                lastError = error;

                // Check if we should retry
                if (attempts < maxRetries && shouldRetry(error)) {
                    attempts++;
                    // Wait before retrying
                    await this.delay(retryDelayMs);
                    continue;
                }

                // No more retries - return result with error
                const latencyMs = Date.now() - startTime;
                const toolCalls = this.provider.capturedToolCalls;
                const firstToolCall = toolCalls.length > 0 ? toolCalls[0] : null;

                const result: LlmRegressionResult = {
                    prompt,
                    toolWasCalled: toolCalls.length > 0,
                    toolName: firstToolCall?.name ?? null,
                    toolParams: firstToolCall?.arguments ?? null,
                    commandResult: null,
                    llmText: null,
                    latencyMs,
                    tokenUsage: this.provider.capturedTokenUsage,
                    error,
                };

                // Validate expectations if provided (may throw)
                if (expectations) {
                    this.validateExpectations(result, expectations);
                }

                return result;
            }
        }

        // This shouldn't be reached, but TypeScript needs it
        const latencyMs = Date.now() - startTime;
        return {
            prompt,
            toolWasCalled: false,
            toolName: null,
            toolParams: null,
            commandResult: null,
            llmText: null,
            latencyMs,
            error: lastError,
        };
    }

    /**
     * Default retry condition - retries on rate limit and transient errors.
     */
    private defaultRetryCondition(error: Error): boolean {
        const message = error.message.toLowerCase();
        return (
            message.includes("rate") ||
            message.includes("429") ||
            message.includes("503") ||
            message.includes("timeout") ||
            message.includes("econnreset")
        );
    }

    /**
     * Delay helper for retry logic.
     */
    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Validate result against expectations.
     * Throws an error if expectations are not met.
     */
    private validateExpectations(result: LlmRegressionResult, expectations: TestExpectations): void {
        // Check expected tool
        if (expectations.expectedTool !== undefined) {
            const expectedTools = Array.isArray(expectations.expectedTool) ?
                expectations.expectedTool :
                [expectations.expectedTool];

            if (!result.toolWasCalled) {
                throw new Error(`Expected tool call but none occurred. Expected one of: ${expectedTools.join(", ")}`);
            }

            if (result.toolName && !expectedTools.includes(result.toolName)) {
                throw new Error(
                    `Expected tool to be one of [${expectedTools.join(", ")}] but got "${result.toolName}"`,
                );
            }
        }

        // Check expected params (partial match)
        if (expectations.expectedParams !== undefined && result.toolParams !== null) {
            for (const [key, value] of Object.entries(expectations.expectedParams)) {
                if (result.toolParams[key] !== value) {
                    throw new Error(
                        `Expected param "${key}" to be ${JSON.stringify(value)} but got ${JSON.stringify(result.toolParams[key])}`,
                    );
                }
            }
        }

        // Run custom validation
        if (expectations.validate !== undefined) {
            if (!expectations.validate(result)) {
                throw new Error("Custom validation failed");
            }
        }
    }

    /**
     * Get the current graph instance.
     */
    getGraph(): Graph {
        return this.graph;
    }

    /**
     * Dispose the harness and clean up resources.
     */
    dispose(): void {
        if (!this.disposed) {
            this.controller.dispose();
            this.disposed = true;
        }
    }
}

/**
 * Named CSS colors mapping to their hex values.
 * Used for color normalization in isColorMatch.
 */
const CSS_COLOR_NAMES: Record<string, string> = {
    red: "#ff0000",
    green: "#00ff00",
    blue: "#0000ff",
    yellow: "#ffff00",
    orange: "#ffa500",
    purple: "#800080",
    pink: "#ffc0cb",
    black: "#000000",
    white: "#ffffff",
    gray: "#808080",
    grey: "#808080",
    cyan: "#00ffff",
    magenta: "#ff00ff",
    brown: "#a52a2a",
    lime: "#00ff00",
    navy: "#000080",
    teal: "#008080",
    aqua: "#00ffff",
    maroon: "#800000",
    olive: "#808000",
    silver: "#c0c0c0",
    fuchsia: "#ff00ff",
    crimson: "#dc143c",
    coral: "#ff7f50",
    gold: "#ffd700",
    khaki: "#f0e68c",
    lavender: "#e6e6fa",
    salmon: "#fa8072",
    tomato: "#ff6347",
    turquoise: "#40e0d0",
    violet: "#ee82ee",
    indigo: "#4b0082",
};

/**
 * Normalize a color value to hex format for comparison.
 * Handles hex colors, CSS color names, and rgb/rgba values.
 *
 * @param color - The color value to normalize
 * @returns Normalized hex color in lowercase (e.g., "#ff0000") or null if invalid
 */
function normalizeColor(color: string): string | null {
    const trimmed = color.trim().toLowerCase();

    // Already hex format
    if (/^#[0-9a-f]{6}$/i.test(trimmed)) {
        return trimmed.toLowerCase();
    }

    // Short hex format - expand to full
    if (/^#[0-9a-f]{3}$/i.test(trimmed)) {
        const r = trimmed[1];
        const g = trimmed[2];
        const b = trimmed[3];
        return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
    }

    // Named color
    if (CSS_COLOR_NAMES[trimmed]) {
        return CSS_COLOR_NAMES[trimmed];
    }

    // Try to parse using Babylon.js Color3 (handles various formats)
    try {
        const color3 = Color3.FromHexString(trimmed);
        return color3.toHexString().toLowerCase();
    } catch {
        // Ignore parsing errors
    }

    // Try rgb/rgba format
    const rgbRegex = /rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/;
    const rgbMatch = rgbRegex.exec(trimmed);
    if (rgbMatch) {
        const r = parseInt(rgbMatch[1], 10).toString(16).padStart(2, "0");
        const g = parseInt(rgbMatch[2], 10).toString(16).padStart(2, "0");
        const b = parseInt(rgbMatch[3], 10).toString(16).padStart(2, "0");
        return `#${r}${g}${b}`;
    }

    return null;
}

/**
 * Check if two color values match, normalizing both to hex format.
 * Handles hex colors (#RGB, #RRGGBB), CSS color names, and rgb() values.
 *
 * @param actual - The actual color value from the LLM
 * @param expected - The expected color value (e.g., "red", "#ff0000")
 * @returns True if the colors match after normalization
 *
 * @example
 * isColorMatch("#FF0000", "red") // true
 * isColorMatch("rgb(255, 0, 0)", "#ff0000") // true
 * isColorMatch("#f00", "#FF0000") // true
 */
export function isColorMatch(actual: unknown, expected: string): boolean {
    if (typeof actual !== "string") {
        return false;
    }

    const normalizedActual = normalizeColor(actual);
    const normalizedExpected = normalizeColor(expected);

    if (!normalizedActual || !normalizedExpected) {
        return false;
    }

    return normalizedActual === normalizedExpected;
}

/**
 * Check if an object includes all expected parameters (partial matching).
 * Performs deep comparison for nested objects.
 *
 * @param actual - The actual parameters from the LLM response
 * @param expected - The expected parameters to match
 * @returns True if actual includes all expected key-value pairs
 *
 * @example
 * includesParams({a: 1, b: 2, c: 3}, {a: 1, b: 2}) // true
 * includesParams({style: {color: "red"}}, {style: {color: "red"}}) // true
 * includesParams({a: 1}, {a: 2}) // false
 */
export function includesParams(
    actual: Record<string, unknown> | null | undefined,
    expected: Partial<Record<string, unknown>>,
): boolean {
    if (!actual) {
        return false;
    }

    for (const [key, expectedValue] of Object.entries(expected)) {
        const actualValue = actual[key];

        if (expectedValue === undefined) {
            continue;
        }

        if (actualValue === undefined) {
            return false;
        }

        // Handle nested objects
        if (
            typeof expectedValue === "object" &&
            expectedValue !== null &&
            typeof actualValue === "object" &&
            actualValue !== null
        ) {
            if (!includesParams(
                actualValue as Record<string, unknown>,
                expectedValue as Record<string, unknown>,
            )) {
                return false;
            }

            continue;
        }

        // Direct comparison
        if (actualValue !== expectedValue) {
            return false;
        }
    }

    return true;
}
