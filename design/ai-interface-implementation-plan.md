# Implementation Plan for Natural Language Control Interface

## Overview

This plan implements the AI-powered natural language control interface for graphty-element as specified in the design document. The feature enables users to control graph visualizations through text and voice commands, with support for multiple LLM providers (OpenAI, Anthropic, Gemini, WebLLM).

The implementation follows existing codebase patterns:
- **Manager Pattern**: `AiManager` follows `EventManager`, `DataManager` pattern with `init()` and `dispose()`
- **Registry Pattern**: `CommandRegistry` follows `Algorithm.register()` / `LayoutEngine.register()` patterns
- **Observable Pattern**: AI events integrate with existing `EventManager` infrastructure
- **Operation Queue**: AI commands execute through `OperationQueueManager` for proper sequencing

## Key Principles

1. **Every phase ends with user-testable UI** - Either an HTML demo page or Storybook story that demonstrates the phase's functionality
2. **LLM integration is de-risked early** - Real provider connections are tested in Phase 2 to identify API/SDK issues before building on them
3. **Test-driven development** - Tests written before implementation in each phase

## Dependencies

### Required npm packages (to be added)
```json
{
  "ai": "^4.0.0",
  "@ai-sdk/openai": "^1.0.0",
  "@ai-sdk/anthropic": "^1.0.0",
  "@ai-sdk/google": "^1.0.0",
  "encrypt-storage": "^2.12.0"
}
```

### Optional (lazy-loaded)
```json
{
  "@mlc-ai/web-llm": "^0.2.0"
}
```

---

## Phase Breakdown

### Phase 1: Core Types & Multi-Provider LLM De-risking
**Objective**: Establish foundational types AND validate that we can successfully call multiple LLM providers (OpenAI, Anthropic, Google) with the Vercel AI SDK. This phase de-risks the most uncertain part of the implementation.

**Duration**: 3-4 days

**Tests to Write First**:

- `test/ai/providers/types.test.ts`: Validate type definitions compile correctly
  ```typescript
  import {assert, describe, it} from "vitest";
  import type {LlmProvider, Message, ToolCall, LlmResponse} from "../../../src/ai/providers/types";

  describe("Provider Types", () => {
    it("Message type has required fields", () => {
      const msg: Message = {
        role: "user",
        content: "test"
      };
      assert.strictEqual(msg.role, "user");
    });

    it("ToolCall type has required fields", () => {
      const call: ToolCall = {
        id: "call_123",
        name: "testTool",
        arguments: {foo: "bar"}
      };
      assert.strictEqual(call.name, "testTool");
    });
  });
  ```

- `test/ai/providers/VercelAiProvider.test.ts`: Real provider tests (some skipped without API keys)
  ```typescript
  import {assert, describe, it, beforeEach} from "vitest";
  import {VercelAiProvider} from "../../../src/ai/providers/VercelAiProvider";

  describe("VercelAiProvider", () => {
    describe("OpenAI", () => {
      it("initializes correctly", () => {
        const provider = new VercelAiProvider("openai");
        assert.strictEqual(provider.name, "openai");
        assert.strictEqual(provider.supportsStreaming, true);
        assert.strictEqual(provider.supportsTools, true);
      });

      it("throws without API key", async () => {
        const provider = new VercelAiProvider("openai");
        await assert.rejects(
          () => provider.generate([{role: "user", content: "test"}], []),
          /API key/
        );
      });

      // These tests require actual API keys - run manually or in integration tests
      it.skipIf(!process.env.OPENAI_API_KEY)("generates text response", async () => {
        const provider = new VercelAiProvider("openai");
        provider.configure({apiKey: process.env.OPENAI_API_KEY!, model: "gpt-4o-mini"});

        const response = await provider.generate(
          [{role: "user", content: "Say 'hello' and nothing else"}],
          []
        );

        assert.ok(response.text.toLowerCase().includes("hello"));
      });

      it.skipIf(!process.env.OPENAI_API_KEY)("handles tool calls", async () => {
        const provider = new VercelAiProvider("openai");
        provider.configure({apiKey: process.env.OPENAI_API_KEY!, model: "gpt-4o-mini"});

        const response = await provider.generate(
          [{role: "user", content: "Get the current weather in Paris"}],
          [{
            name: "getWeather",
            description: "Get weather for a city",
            parameters: z.object({city: z.string()})
          }]
        );

        assert.ok(response.toolCalls.length > 0);
        assert.strictEqual(response.toolCalls[0].name, "getWeather");
      });
    });

    describe("Anthropic", () => {
      it("initializes correctly", () => {
        const provider = new VercelAiProvider("anthropic");
        assert.strictEqual(provider.name, "anthropic");
      });

      it.skipIf(!process.env.ANTHROPIC_API_KEY)("generates text response", async () => {
        const provider = new VercelAiProvider("anthropic");
        provider.configure({apiKey: process.env.ANTHROPIC_API_KEY!, model: "claude-3-haiku-20240307"});

        const response = await provider.generate(
          [{role: "user", content: "Say 'hello' and nothing else"}],
          []
        );

        assert.ok(response.text.toLowerCase().includes("hello"));
      });
    });

    describe("Google", () => {
      it("initializes correctly", () => {
        const provider = new VercelAiProvider("google");
        assert.strictEqual(provider.name, "google");
      });

      it.skipIf(!process.env.GOOGLE_API_KEY)("generates text response", async () => {
        const provider = new VercelAiProvider("google");
        provider.configure({apiKey: process.env.GOOGLE_API_KEY!, model: "gemini-1.5-flash"});

        const response = await provider.generate(
          [{role: "user", content: "Say 'hello' and nothing else"}],
          []
        );

        assert.ok(response.text.toLowerCase().includes("hello"));
      });
    });
  });
  ```

- `test/ai/providers/MockLlmProvider.test.ts`: Mock provider for deterministic testing
  ```typescript
  import {assert, describe, it} from "vitest";
  import {MockLlmProvider} from "../../../src/ai/providers/MockLlmProvider";

  describe("MockLlmProvider", () => {
    it("returns configured responses", async () => {
      const provider = new MockLlmProvider();
      provider.setResponse("make red", {
        text: "Done",
        toolCalls: [{
          id: "call_1",
          name: "findAndStyleNodes",
          arguments: {selector: "", style: {color: "#ff0000"}}
        }]
      });

      const response = await provider.generate(
        [{role: "user", content: "make red"}],
        []
      );

      assert.strictEqual(response.toolCalls.length, 1);
      assert.strictEqual(response.toolCalls[0].name, "findAndStyleNodes");
    });

    it("supports streaming callbacks", async () => {
      const provider = new MockLlmProvider();
      provider.setResponse("test", {text: "Hello world", toolCalls: []});

      const chunks: string[] = [];
      await provider.generateStream(
        [{role: "user", content: "test"}],
        [],
        {
          onChunk: (text) => chunks.push(text),
          onToolCall: () => {},
          onToolResult: () => {},
          onComplete: () => {},
          onError: () => {},
        }
      );

      assert.ok(chunks.length > 0);
      assert.strictEqual(chunks.join(""), "Hello world");
    });
  });
  ```

**Implementation**:

- `src/ai/providers/types.ts`: Core LLM provider interfaces
  ```typescript
  import type {z} from "zod/v4";

  export interface Message {
    role: "system" | "user" | "assistant" | "tool";
    content: string;
    toolCallId?: string;
    toolCalls?: ToolCall[];
  }

  export interface ToolCall {
    id: string;
    name: string;
    arguments: Record<string, unknown>;
  }

  export interface ToolDefinition {
    name: string;
    description: string;
    parameters: z.ZodType;
  }

  export interface LlmResponse {
    text: string;
    toolCalls: ToolCall[];
    usage?: {promptTokens: number; completionTokens: number};
  }

  export interface StreamCallbacks {
    onChunk: (text: string) => void;
    onToolCall: (name: string, params: unknown) => void;
    onToolResult: (name: string, result: unknown) => void;
    onComplete: (response: LlmResponse) => void;
    onError: (error: Error) => void;
  }

  export interface ProviderOptions {
    apiKey?: string;
    model?: string;
    baseUrl?: string;
    maxTokens?: number;
    temperature?: number;
  }

  export interface LlmProvider {
    readonly name: string;
    readonly supportsStreaming: boolean;
    readonly supportsTools: boolean;
    configure(options: ProviderOptions): void;
    generate(messages: Message[], tools: ToolDefinition[], options?: {signal?: AbortSignal}): Promise<LlmResponse>;
    generateStream(messages: Message[], tools: ToolDefinition[], callbacks: StreamCallbacks, signal?: AbortSignal): Promise<void>;
  }
  ```

- `src/ai/providers/VercelAiProvider.ts`: Real provider using Vercel AI SDK
  ```typescript
  import {generateText, streamText} from "ai";
  import {createOpenAI} from "@ai-sdk/openai";
  import {createAnthropic} from "@ai-sdk/anthropic";
  import {createGoogleGenerativeAI} from "@ai-sdk/google";
  import type {LlmProvider, ProviderOptions, Message, ToolDefinition, LlmResponse, StreamCallbacks} from "./types";

  export class VercelAiProvider implements LlmProvider {
    readonly name: string;
    readonly supportsStreaming = true;
    readonly supportsTools = true;

    private apiKey?: string;
    private model?: string;
    private providerType: "openai" | "anthropic" | "google";

    constructor(providerType: "openai" | "anthropic" | "google") {
      this.name = providerType;
      this.providerType = providerType;
    }

    configure(options: ProviderOptions): void {
      this.apiKey = options.apiKey;
      this.model = options.model;
    }

    private getModel() {
      if (!this.apiKey) throw new Error(`API key not configured for ${this.name}`);

      switch (this.providerType) {
        case "openai":
          return createOpenAI({apiKey: this.apiKey})(this.model ?? "gpt-4o");
        case "anthropic":
          return createAnthropic({apiKey: this.apiKey})(this.model ?? "claude-3-5-sonnet-20241022");
        case "google":
          return createGoogleGenerativeAI({apiKey: this.apiKey})(this.model ?? "gemini-1.5-pro");
      }
    }

    async generate(messages: Message[], tools: ToolDefinition[], options?: {signal?: AbortSignal}): Promise<LlmResponse> {
      const result = await generateText({
        model: this.getModel(),
        messages: this.convertMessages(messages),
        tools: this.convertTools(tools),
        abortSignal: options?.signal,
      });

      return {
        text: result.text,
        toolCalls: this.convertToolCalls(result.toolCalls),
        usage: result.usage ? {
          promptTokens: result.usage.promptTokens,
          completionTokens: result.usage.completionTokens,
        } : undefined,
      };
    }

    async generateStream(messages: Message[], tools: ToolDefinition[], callbacks: StreamCallbacks, signal?: AbortSignal): Promise<void> {
      // Implementation using streamText
    }

    private convertMessages(messages: Message[]) { /* ... */ }
    private convertTools(tools: ToolDefinition[]) { /* ... */ }
    private convertToolCalls(toolCalls: any[]) { /* ... */ }
  }
  ```

- `src/ai/providers/MockLlmProvider.ts`: Mock for testing
- `src/ai/providers/index.ts`: Provider registry

**User-Testable Demo**: `examples/ai-provider-test.html`

Create an HTML page that allows testing each LLM provider:

```html
<!DOCTYPE html>
<html>
<head>
  <title>AI Provider Test - Graphty</title>
  <style>
    body { font-family: system-ui; max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
    .provider-section { margin: 2rem 0; padding: 1rem; border: 1px solid #ccc; border-radius: 8px; }
    .status { padding: 0.5rem; margin: 0.5rem 0; border-radius: 4px; }
    .status.success { background: #d4edda; color: #155724; }
    .status.error { background: #f8d7da; color: #721c24; }
    .status.pending { background: #fff3cd; color: #856404; }
    input[type="password"] { width: 300px; padding: 0.5rem; }
    button { padding: 0.5rem 1rem; margin: 0.5rem; cursor: pointer; }
    pre { background: #f4f4f4; padding: 1rem; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>🤖 AI Provider Test</h1>
  <p>Test each LLM provider to verify API connectivity and tool calling.</p>

  <div class="provider-section" id="openai-section">
    <h2>OpenAI</h2>
    <input type="password" id="openai-key" placeholder="sk-...">
    <button onclick="testProvider('openai')">Test OpenAI</button>
    <button onclick="testToolCall('openai')">Test Tool Calling</button>
    <div id="openai-status" class="status pending">Not tested</div>
    <pre id="openai-result"></pre>
  </div>

  <div class="provider-section" id="anthropic-section">
    <h2>Anthropic</h2>
    <input type="password" id="anthropic-key" placeholder="sk-ant-...">
    <button onclick="testProvider('anthropic')">Test Anthropic</button>
    <button onclick="testToolCall('anthropic')">Test Tool Calling</button>
    <div id="anthropic-status" class="status pending">Not tested</div>
    <pre id="anthropic-result"></pre>
  </div>

  <div class="provider-section" id="google-section">
    <h2>Google (Gemini)</h2>
    <input type="password" id="google-key" placeholder="AIza...">
    <button onclick="testProvider('google')">Test Google</button>
    <button onclick="testToolCall('google')">Test Tool Calling</button>
    <div id="google-status" class="status pending">Not tested</div>
    <pre id="google-result"></pre>
  </div>

  <script type="module">
    import {VercelAiProvider} from '../dist/ai/providers/VercelAiProvider.js';
    import {z} from 'zod/v4';

    window.testProvider = async (name) => {
      const keyInput = document.getElementById(`${name}-key`);
      const status = document.getElementById(`${name}-status`);
      const result = document.getElementById(`${name}-result`);

      status.className = 'status pending';
      status.textContent = 'Testing...';

      try {
        const provider = new VercelAiProvider(name);
        provider.configure({apiKey: keyInput.value});

        const response = await provider.generate(
          [{role: 'user', content: "Say 'hello' and nothing else"}],
          []
        );

        status.className = 'status success';
        status.textContent = '✓ Provider working!';
        result.textContent = JSON.stringify(response, null, 2);
      } catch (error) {
        status.className = 'status error';
        status.textContent = '✗ Error: ' + error.message;
        result.textContent = error.stack;
      }
    };

    window.testToolCall = async (name) => {
      const keyInput = document.getElementById(`${name}-key`);
      const status = document.getElementById(`${name}-status`);
      const result = document.getElementById(`${name}-result`);

      status.className = 'status pending';
      status.textContent = 'Testing tool calling...';

      try {
        const provider = new VercelAiProvider(name);
        provider.configure({apiKey: keyInput.value});

        const response = await provider.generate(
          [{role: 'user', content: 'What is the weather in Tokyo?'}],
          [{
            name: 'getWeather',
            description: 'Get current weather for a city',
            parameters: z.object({
              city: z.string().describe('City name'),
              units: z.enum(['celsius', 'fahrenheit']).optional()
            })
          }]
        );

        if (response.toolCalls.length > 0) {
          status.className = 'status success';
          status.textContent = '✓ Tool calling working!';
        } else {
          status.className = 'status error';
          status.textContent = '✗ No tool calls returned';
        }
        result.textContent = JSON.stringify(response, null, 2);
      } catch (error) {
        status.className = 'status error';
        status.textContent = '✗ Error: ' + error.message;
        result.textContent = error.stack;
      }
    };
  </script>
</body>
</html>
```

**Dependencies**:
- External: `ai`, `@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`, `zod` (already in project)
- Internal: None (foundational)

**Verification**:
1. Run: `npm test -- test/ai/providers/`
2. Run: `npm run build`
3. Open: `examples/ai-provider-test.html` in browser
4. **User Test**: Enter API keys for each provider and click "Test" buttons
5. Expected: Green success status for each provider with valid API key, tool calls return proper structure

---

### Phase 2: Command Infrastructure & Basic Controller
**Objective**: Build the command registry, status state machine, and basic controller that can execute commands from mock LLM responses.

**Duration**: 2-3 days

**AiStatus Interface** (explicit fields from design):

The `AiStatus` object provides all state needed for UI frameworks:

```typescript
interface AiStatus {
  state: 'ready' | 'submitted' | 'streaming' | 'executing' | 'error';

  // Timing
  startTime?: number;
  elapsed?: number;  // Milliseconds since startTime

  // Progress
  stage?: 'processing' | 'generating' | 'executing';
  stageMessage?: string;  // e.g., "Analyzing graph...", "Running betweenness centrality..."

  // Streaming content
  streamedText?: string;  // Accumulated streamed text
  toolCalls?: Array<{
    name: string;
    status: 'pending' | 'executing' | 'complete' | 'error';
    result?: unknown;
  }>;

  // Error handling
  error?: Error;
  canRetry?: boolean;

  // Control
  canCancel: boolean;
}
```

**Tests to Write First**:

- `test/ai/AiStatus.test.ts`: Status state machine
  ```typescript
  import {assert, describe, it} from "vitest";
  import {AiStatusManager} from "../../src/ai/AiStatus";

  describe("AiStatusManager", () => {
    it("starts in ready state", () => {
      const status = new AiStatusManager();
      assert.strictEqual(status.current.state, "ready");
      assert.strictEqual(status.current.canCancel, false);
    });

    it("transitions from ready to submitted", () => {
      const status = new AiStatusManager();
      status.submit("test input");
      assert.strictEqual(status.current.state, "submitted");
      assert.ok(status.current.startTime);
    });

    it("tracks elapsed time", () => {
      const status = new AiStatusManager();
      status.submit("test");
      // Simulate time passing
      status.updateElapsed();
      assert.ok(status.current.elapsed !== undefined);
      assert.ok(status.current.elapsed >= 0);
    });

    it("tracks stage and stageMessage", () => {
      const status = new AiStatusManager();
      status.submit("test");
      status.setStage("processing", "Analyzing graph structure...");
      assert.strictEqual(status.current.stage, "processing");
      assert.strictEqual(status.current.stageMessage, "Analyzing graph structure...");
    });

    it("accumulates streamed text", () => {
      const status = new AiStatusManager();
      status.submit("test");
      status.startStreaming();
      status.appendStreamedText("Hello ");
      status.appendStreamedText("world");
      assert.strictEqual(status.current.streamedText, "Hello world");
    });

    it("tracks tool call status", () => {
      const status = new AiStatusManager();
      status.submit("test");
      status.startStreaming();
      status.addToolCall("findAndStyleNodes");
      assert.strictEqual(status.current.toolCalls?.length, 1);
      assert.strictEqual(status.current.toolCalls?.[0].status, "pending");

      status.updateToolCallStatus("findAndStyleNodes", "executing");
      assert.strictEqual(status.current.toolCalls?.[0].status, "executing");

      status.updateToolCallStatus("findAndStyleNodes", "complete", {affectedNodes: 12});
      assert.strictEqual(status.current.toolCalls?.[0].status, "complete");
      assert.deepStrictEqual(status.current.toolCalls?.[0].result, {affectedNodes: 12});
    });

    it("transitions through full lifecycle", () => {
      const status = new AiStatusManager();
      status.submit("test");
      assert.strictEqual(status.current.state, "submitted");

      status.startStreaming();
      assert.strictEqual(status.current.state, "streaming");
      assert.strictEqual(status.current.canCancel, true);

      status.startExecuting();
      assert.strictEqual(status.current.state, "executing");

      status.complete();
      assert.strictEqual(status.current.state, "ready");
    });

    it("can transition to error from any state", () => {
      const status = new AiStatusManager();
      status.submit("test");
      status.setError(new Error("test error"), true);
      assert.strictEqual(status.current.state, "error");
      assert.strictEqual(status.current.canRetry, true);
    });

    it("notifies listeners on state change", () => {
      const status = new AiStatusManager();
      const states: string[] = [];
      status.subscribe((s) => states.push(s.state));

      status.submit("test");
      status.startStreaming();
      status.complete();

      assert.deepStrictEqual(states, ["submitted", "streaming", "ready"]);
    });
  });
  ```

- `test/ai/commands/CommandRegistry.test.ts`: Command registration
  ```typescript
  import {assert, describe, it, beforeEach} from "vitest";
  import {z} from "zod/v4";
  import {CommandRegistry} from "../../../src/ai/commands";
  import type {GraphCommand} from "../../../src/ai/commands/types";

  describe("CommandRegistry", () => {
    let registry: CommandRegistry;

    beforeEach(() => {
      registry = new CommandRegistry();
    });

    it("registers and retrieves commands", () => {
      const command: GraphCommand = {
        name: "testCommand",
        description: "A test command",
        parameters: z.object({value: z.string()}),
        examples: [],
        execute: async () => ({success: true, message: "done"}),
      };

      registry.register(command);
      assert.strictEqual(registry.get("testCommand")?.name, "testCommand");
    });

    it("converts commands to Vercel AI SDK tool format", () => {
      registry.register({
        name: "getWeather",
        description: "Get weather for a city",
        parameters: z.object({city: z.string()}),
        examples: [{input: "weather in Paris", params: {city: "Paris"}}],
        execute: async () => ({success: true, message: "sunny"}),
      });

      const tools = registry.toToolDefinitions();
      assert.strictEqual(tools.length, 1);
      assert.strictEqual(tools[0].name, "getWeather");
    });
  });
  ```

- `test/ai/AiController.test.ts`: Basic controller tests
  ```typescript
  import {assert, describe, it, beforeEach} from "vitest";
  import {z} from "zod/v4";
  import {AiController} from "../../src/ai/AiController";
  import {MockLlmProvider} from "../../src/ai/providers/MockLlmProvider";
  import {CommandRegistry} from "../../src/ai/commands";

  describe("AiController", () => {
    let controller: AiController;
    let mockProvider: MockLlmProvider;
    let registry: CommandRegistry;

    beforeEach(() => {
      mockProvider = new MockLlmProvider();
      registry = new CommandRegistry();
      controller = new AiController({provider: mockProvider, commandRegistry: registry});
    });

    it("processes text-only response", async () => {
      mockProvider.setResponse("hello", {
        text: "Hello! How can I help you with the graph?",
        toolCalls: [],
      });

      const result = await controller.execute("hello");
      assert.strictEqual(result.success, true);
      assert.ok(result.message.includes("Hello"));
    });

    it("executes tool calls from LLM", async () => {
      let executedWith: unknown = null;
      registry.register({
        name: "sayHello",
        description: "Say hello",
        parameters: z.object({name: z.string()}),
        examples: [],
        execute: async (graph, params) => {
          executedWith = params;
          return {success: true, message: `Hello, ${params.name}!`};
        },
      });

      mockProvider.setResponse("greet", {
        text: "",
        toolCalls: [{id: "1", name: "sayHello", arguments: {name: "World"}}],
      });

      const result = await controller.execute("greet someone");
      assert.deepStrictEqual(executedWith, {name: "World"});
      assert.strictEqual(result.success, true);
    });

    it("emits status changes during execution", async () => {
      const states: string[] = [];
      controller.onStatusChange((status) => states.push(status.state));

      mockProvider.setResponse("test", {text: "Done", toolCalls: []});
      await controller.execute("test");

      assert.ok(states.includes("submitted"));
      assert.ok(states.includes("ready"));
    });

    it("handles errors gracefully", async () => {
      mockProvider.setError(new Error("Network error"));

      const result = await controller.execute("test");
      assert.strictEqual(result.success, false);
      assert.ok(result.message.includes("error"));
    });
  });
  ```

**Implementation**:

- `src/ai/commands/types.ts`: Command interfaces
  ```typescript
  import type {z} from "zod/v4";
  import type {Graph} from "../../Graph";

  export interface CommandResult {
    success: boolean;
    message: string;
    data?: unknown;
    affectedNodes?: string[];
    affectedEdges?: string[];
  }

  export interface CommandContext {
    graph: Graph;
    abortSignal: AbortSignal;
    emitEvent: (type: string, data: unknown) => void;
    updateStatus: (updates: Partial<AiStatus>) => void;
  }

  export interface CommandExample {
    input: string;
    params: Record<string, unknown>;
  }

  export interface GraphCommand {
    readonly name: string;
    readonly description: string;
    readonly parameters: z.ZodType;
    readonly examples: CommandExample[];
    execute(
      graph: Graph,
      params: Record<string, unknown>,
      context: CommandContext
    ): Promise<CommandResult>;
  }
  ```

- `src/ai/commands/index.ts`: CommandRegistry
- `src/ai/AiStatus.ts`: Status state machine with subscriptions
- `src/ai/AiController.ts`: Basic orchestrator
- `src/ai/keys/ApiKeyManager.ts`: Session-only key storage

**User-Testable Demo**: `stories/ai/AiControllerDemo.stories.ts`

```typescript
import type {Meta, StoryObj} from "@storybook/web-components";
import {html} from "lit";
import {AiController} from "../../src/ai/AiController";
import {MockLlmProvider} from "../../src/ai/providers/MockLlmProvider";
import {CommandRegistry} from "../../src/ai/commands";
import {z} from "zod/v4";

const meta: Meta = {
  title: "AI/Controller Demo",
  render: () => {
    // Setup mock provider with demo responses
    const provider = new MockLlmProvider();
    const registry = new CommandRegistry();

    // Register a simple demo command
    registry.register({
      name: "changeColor",
      description: "Change the demo box color",
      parameters: z.object({color: z.string()}),
      examples: [],
      execute: async (graph, params) => {
        const box = document.getElementById("demo-box");
        if (box) box.style.backgroundColor = params.color as string;
        return {success: true, message: `Changed color to ${params.color}`};
      },
    });

    // Configure mock responses
    provider.setResponse("red", {
      text: "Making it red!",
      toolCalls: [{id: "1", name: "changeColor", arguments: {color: "red"}}],
    });
    provider.setResponse("blue", {
      text: "Making it blue!",
      toolCalls: [{id: "1", name: "changeColor", arguments: {color: "blue"}}],
    });
    provider.setResponse("green", {
      text: "Making it green!",
      toolCalls: [{id: "1", name: "changeColor", arguments: {color: "green"}}],
    });

    const controller = new AiController({provider, commandRegistry: registry});

    // Wire up UI after render
    setTimeout(() => {
      const input = document.getElementById("ai-input") as HTMLInputElement;
      const button = document.getElementById("ai-submit") as HTMLButtonElement;
      const status = document.getElementById("ai-status")!;
      const response = document.getElementById("ai-response")!;

      controller.onStatusChange((s) => {
        status.textContent = `Status: ${s.state}`;
        status.className = `status ${s.state}`;
      });

      button.onclick = async () => {
        response.textContent = "Processing...";
        const result = await controller.execute(input.value);
        response.textContent = result.message;
      };
    }, 0);

    return html`
      <style>
        .demo-container { padding: 20px; font-family: system-ui; }
        #demo-box { width: 200px; height: 200px; background: #ccc; margin: 20px 0; transition: background 0.3s; }
        .status { padding: 8px; border-radius: 4px; margin: 10px 0; }
        .status.ready { background: #d4edda; }
        .status.submitted { background: #fff3cd; }
        .status.streaming { background: #cce5ff; }
        .status.executing { background: #d1ecf1; }
        .status.error { background: #f8d7da; }
        input { padding: 8px; width: 300px; }
        button { padding: 8px 16px; margin-left: 8px; }
      </style>
      <div class="demo-container">
        <h2>AI Controller Demo</h2>
        <p>Try commands like "make it red", "make it blue", or "make it green"</p>
        <div>
          <input id="ai-input" type="text" placeholder="Enter command...">
          <button id="ai-submit">Send</button>
        </div>
        <div id="ai-status" class="status ready">Status: ready</div>
        <div id="ai-response"></div>
        <div id="demo-box"></div>
      </div>
    `;
  },
};

export default meta;
export const Default: StoryObj = {};
```

**Dependencies**:
- External: `zod` (already in project)
- Internal: Phase 1 providers

**Verification**:
1. Run: `npm test -- test/ai/AiStatus.test.ts test/ai/commands/ test/ai/AiController.test.ts`
2. Run: `npm run storybook`
3. Navigate to: "AI / Controller Demo"
4. **User Test**: Type "make it red" and click Send - box should turn red
5. Expected: Status indicator shows transitions, box color changes

---

### Phase 3: Graph Integration & First Real Commands
**Objective**: Integrate AI controller with Graph class and implement the first real commands (queryGraph, setLayout, setImmersiveMode) that users can test with actual graph visualizations.

**Duration**: 3-4 days

**Tests to Write First**:

- `test/ai/AiManager.test.ts`: Graph integration
  ```typescript
  import {assert, describe, it, beforeEach} from "vitest";
  import {AiManager} from "../../src/ai/AiManager";
  import {createMockGraphContext} from "../helpers/mock-graph-context";

  describe("AiManager", () => {
    let manager: AiManager;

    beforeEach(async () => {
      const context = createMockGraphContext();
      manager = new AiManager();
      await manager.init(context, {provider: "mock"});
    });

    it("initializes with built-in commands", () => {
      const commands = manager.getRegisteredCommands();
      assert.ok(commands.includes("queryGraph"));
      assert.ok(commands.includes("setLayout"));
      assert.ok(commands.includes("setImmersiveMode"));
    });

    it("executes commands through context", async () => {
      const result = await manager.execute("How many nodes?");
      assert.strictEqual(result.success, true);
    });

    it("can set API keys", () => {
      manager.setApiKey("openai", "sk-test");
      // Should not throw
    });

    it("disposes cleanly", () => {
      manager.dispose();
      // Attempting to execute after dispose should throw
    });
  });
  ```

- `test/ai/commands/QueryCommands.test.ts`:
  ```typescript
  import {assert, describe, it, beforeEach} from "vitest";
  import {queryGraph} from "../../../src/ai/commands/QueryCommands";
  import {createTestGraph, createMockContext} from "../../helpers/test-graph";

  describe("QueryCommands", () => {
    let graph: Graph;
    let context: CommandContext;

    beforeEach(async () => {
      graph = await createTestGraph({nodes: 25, edges: 40});
      context = createMockContext(graph);
    });

    it("returns node count", async () => {
      const result = await queryGraph.execute(graph, {query: "nodeCount"}, context);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data?.nodeCount, 25);
    });

    it("returns edge count", async () => {
      const result = await queryGraph.execute(graph, {query: "edgeCount"}, context);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data?.edgeCount, 40);
    });

    it("returns current layout", async () => {
      const result = await queryGraph.execute(graph, {query: "currentLayout"}, context);
      assert.strictEqual(result.success, true);
      assert.ok(typeof result.data?.layout === "string");
    });
  });
  ```

- `test/ai/commands/LayoutCommands.test.ts`:
  ```typescript
  import {assert, describe, it, beforeEach} from "vitest";
  import {setLayout, setDimension} from "../../../src/ai/commands/LayoutCommands";

  describe("LayoutCommands", () => {
    let graph: Graph;
    let context: CommandContext;

    beforeEach(async () => {
      graph = await createTestGraph();
      context = createMockContext(graph);
    });

    it("switches to circular layout", async () => {
      const result = await setLayout.execute(graph, {type: "circular"}, context);
      assert.strictEqual(result.success, true);
      assert.ok(result.message.includes("circular"));
    });

    it("switches to 2D", async () => {
      const result = await setDimension.execute(graph, {dimension: "2d"}, context);
      assert.strictEqual(result.success, true);
    });

    it("rejects invalid layout type", async () => {
      const result = await setLayout.execute(graph, {type: "nonexistent"}, context);
      assert.strictEqual(result.success, false);
    });
  });
  ```

- `test/ai/commands/ModeCommands.test.ts`: VR/AR mode switching
  ```typescript
  import {assert, describe, it, beforeEach} from "vitest";
  import {setImmersiveMode} from "../../../src/ai/commands/ModeCommands";
  import {createTestGraph, createMockContext} from "../../helpers/test-graph";

  describe("ModeCommands", () => {
    let graph: Graph;
    let context: CommandContext;

    beforeEach(async () => {
      graph = await createTestGraph();
      context = createMockContext(graph);
    });

    it("enters VR mode", async () => {
      const result = await setImmersiveMode.execute(graph, {mode: "vr"}, context);
      // Note: May fail in non-WebXR environment, which is expected
      assert.ok(result.message.includes("VR") || result.message.includes("not supported"));
    });

    it("enters AR mode", async () => {
      const result = await setImmersiveMode.execute(graph, {mode: "ar"}, context);
      assert.ok(result.message.includes("AR") || result.message.includes("not supported"));
    });

    it("exits immersive mode", async () => {
      const result = await setImmersiveMode.execute(graph, {mode: "exit"}, context);
      assert.strictEqual(result.success, true);
      assert.ok(result.message.includes("exit") || result.message.includes("normal"));
    });
  });
  ```

**Implementation**:

- `src/ai/AiManager.ts`: Graph integration manager (implements Manager interface)
- `src/ai/commands/QueryCommands.ts`: queryGraph, findNodes
- `src/ai/commands/LayoutCommands.ts`: setLayout, setDimension
- `src/ai/commands/ModeCommands.ts`: setImmersiveMode (VR/AR/exit)
  ```typescript
  // ModeCommands.ts - setImmersiveMode command
  import {z} from "zod/v4";
  import type {GraphCommand, CommandResult, CommandContext} from "./types";
  import type {Graph} from "../../Graph";

  export const setImmersiveMode: GraphCommand = {
    name: "setImmersiveMode",
    description: "Enter or exit VR/AR immersive modes (WebXR)",
    parameters: z.object({
      mode: z.enum(["vr", "ar", "exit"]).describe(
        "VR for virtual reality, AR for augmented reality, exit to return to normal view"
      ),
    }),
    examples: [
      {input: "Enter VR mode", params: {mode: "vr"}},
      {input: "Switch to AR", params: {mode: "ar"}},
      {input: "Exit immersive mode", params: {mode: "exit"}},
      {input: "Leave VR", params: {mode: "exit"}},
    ],
    async execute(
      graph: Graph,
      params: {mode: "vr" | "ar" | "exit"},
      context: CommandContext
    ): Promise<CommandResult> {
      try {
        if (params.mode === "exit") {
          await graph.exitImmersiveMode?.();
          return {success: true, message: "Exited immersive mode, returned to normal view."};
        }

        const xrHelper = graph.getXRHelper?.();
        if (!xrHelper) {
          return {
            success: false,
            message: `WebXR is not available. ${params.mode.toUpperCase()} mode requires a WebXR-capable browser and device.`,
          };
        }

        if (params.mode === "vr") {
          await xrHelper.enterVR?.();
          return {success: true, message: "Entering VR mode. Put on your headset to view the graph in virtual reality."};
        } else {
          await xrHelper.enterAR?.();
          return {success: true, message: "Entering AR mode. Point your device to see the graph in augmented reality."};
        }
      } catch (error) {
        return {
          success: false,
          message: `Failed to enter ${params.mode.toUpperCase()} mode: ${(error as Error).message}`,
        };
      }
    },
  };
  ```
- `src/ai/prompt/SystemPromptBuilder.ts`: Build dynamic prompts with graph context
- Update `src/Graph.ts` with basic AI methods:
  - `enableAiControl(config)` - Enable AI with provider configuration
  - `disableAiControl()` - Disable AI and clean up resources
  - `aiCommand(input, options?)` - Send a natural language command
  - `getAiStatus()` - Get current AI status synchronously
  - `cancelAiCommand()` - Cancel in-progress command

**User-Testable Demo**: `stories/ai/AiGraphIntegration.stories.ts`

```typescript
import type {Meta, StoryObj} from "@storybook/web-components";
import {html} from "lit";
import "../../src/graphty-element";

const meta: Meta = {
  title: "AI/Graph Integration",
  render: (args) => {
    setTimeout(() => {
      const graphEl = document.querySelector("graphty-element");
      const graph = graphEl?.graph;
      if (!graph) return;

      // Enable AI with mock provider for demo
      graph.enableAiControl({provider: "mock"});

      // Wire up UI
      const input = document.getElementById("cmd-input") as HTMLInputElement;
      const submit = document.getElementById("cmd-submit") as HTMLButtonElement;
      const status = document.getElementById("cmd-status")!;
      const output = document.getElementById("cmd-output")!;

      // Configure mock responses that map to real commands
      const mockProvider = graph.getAiController()?.provider;
      if (mockProvider?.setResponse) {
        mockProvider.setResponse("how many", {
          text: "",
          toolCalls: [{id: "1", name: "queryGraph", arguments: {query: "nodeCount"}}],
        });
        mockProvider.setResponse("circular", {
          text: "Switching to circular layout",
          toolCalls: [{id: "1", name: "setLayout", arguments: {type: "circular"}}],
        });
        mockProvider.setResponse("force", {
          text: "Switching to force-directed layout",
          toolCalls: [{id: "1", name: "setLayout", arguments: {type: "ngraph"}}],
        });
        mockProvider.setResponse("2d", {
          text: "Switching to 2D view",
          toolCalls: [{id: "1", name: "setDimension", arguments: {dimension: "2d"}}],
        });
        mockProvider.setResponse("3d", {
          text: "Switching to 3D view",
          toolCalls: [{id: "1", name: "setDimension", arguments: {dimension: "3d"}}],
        });
      }

      submit.onclick = async () => {
        status.textContent = "Processing...";
        const result = await graph.aiCommand(input.value);
        status.textContent = result.success ? "✓ Success" : "✗ Failed";
        output.textContent = result.message + (result.data ? "\n" + JSON.stringify(result.data, null, 2) : "");
      };
    }, 500);

    return html`
      <style>
        .ai-panel { position: absolute; top: 10px; left: 10px; background: white; padding: 16px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); z-index: 100; max-width: 350px; }
        .ai-panel input { width: 200px; padding: 8px; }
        .ai-panel button { padding: 8px 12px; margin-left: 8px; }
        .ai-panel pre { background: #f4f4f4; padding: 8px; margin-top: 8px; font-size: 12px; max-height: 150px; overflow: auto; }
        .commands { font-size: 12px; color: #666; margin-top: 8px; }
      </style>
      <div style="width: 100%; height: 600px; position: relative;">
        <graphty-element
          data-url="https://raw.githubusercontent.com/graphty-js/graphty-element/main/test/helpers/cat-social-network-2.json"
          layout-type="ngraph"
        ></graphty-element>
        <div class="ai-panel">
          <h3 style="margin-top: 0;">🤖 AI Commands</h3>
          <div>
            <input id="cmd-input" type="text" placeholder="Enter command...">
            <button id="cmd-submit">Send</button>
          </div>
          <div id="cmd-status" style="margin-top: 8px;"></div>
          <pre id="cmd-output"></pre>
          <div class="commands">
            <strong>Try:</strong><br>
            • "how many nodes?"<br>
            • "circular layout"<br>
            • "force directed"<br>
            • "switch to 2d"<br>
            • "switch to 3d"
          </div>
        </div>
      </div>
    `;
  },
};

export default meta;
export const Default: StoryObj = {};
```

**Dependencies**:
- External: None new
- Internal: Phase 1-2

**Verification**:
1. Run: `npm test -- test/ai/AiManager.test.ts test/ai/commands/QueryCommands test/ai/commands/LayoutCommands`
2. Run: `npm run storybook`
3. Navigate to: "AI / Graph Integration"
4. **User Test**:
   - Type "how many nodes?" → Should see node count
   - Type "circular layout" → Graph should animate to circular layout
   - Type "switch to 2d" → Camera should change to 2D view
5. Expected: Real graph responds to AI commands

---

### Phase 4: End-to-End Command Testing with Real Graph
**Objective**: Create comprehensive browser-based tests that verify all AI commands work correctly against a real Graph instance with Babylon.js rendering. This phase catches integration issues that unit tests with mocks cannot detect.

**Duration**: 2-3 days

**Rationale**: Unit tests use mock graph contexts that don't fully exercise the real Graph API. For example, the mock `setStyleTemplate` may accept partial objects while the real implementation requires a complete `StyleSchema`. End-to-end tests ensure commands work in the actual runtime environment.

**Tests to Write First**:

- `test/browser/ai/commands-e2e.test.ts`: End-to-end tests for all commands
  ```typescript
  import {assert, describe, it, beforeEach, afterEach} from "vitest";
  import {page} from "@vitest/browser/context";

  describe("AI Commands End-to-End", () => {
    let graphElement: HTMLElement;

    beforeEach(async () => {
      // Create a real graphty-element in the browser
      document.body.innerHTML = `
        <graphty-element
          style="width: 800px; height: 600px;"
        ></graphty-element>
      `;
      graphElement = document.querySelector("graphty-element")!;

      // Wait for element to initialize
      await new Promise(resolve => setTimeout(resolve, 500));

      // Add test data
      const graph = (graphElement as any).graph;
      await graph.addNodes([
        {id: "A", label: "Node A", type: "server"},
        {id: "B", label: "Node B", type: "client"},
        {id: "C", label: "Node C", type: "server"},
        {id: "D", label: "Node D", type: "client"},
        {id: "E", label: "Node E", type: "router"},
      ]);
      await graph.addEdges([
        {src: "A", dst: "B"},
        {src: "A", dst: "C"},
        {src: "B", dst: "D"},
        {src: "C", dst: "E"},
        {src: "D", dst: "E"},
      ]);

      // Enable AI with mock provider
      await graph.enableAiControl({provider: "mock"});
    });

    afterEach(() => {
      document.body.innerHTML = "";
    });

    describe("queryGraph command", () => {
      it("returns correct node count from real graph", async () => {
        const graph = (graphElement as any).graph;
        const aiManager = graph.getAiManager();
        const provider = aiManager.getProvider();

        provider.setResponse("count nodes", {
          text: "",
          toolCalls: [{id: "1", name: "queryGraph", arguments: {query: "nodeCount"}}],
        });

        const result = await graph.aiCommand("count nodes");

        assert.strictEqual(result.success, true);
        assert.strictEqual(result.data?.nodeCount, 5);
      });

      it("returns correct edge count from real graph", async () => {
        const graph = (graphElement as any).graph;
        const aiManager = graph.getAiManager();
        const provider = aiManager.getProvider();

        provider.setResponse("count edges", {
          text: "",
          toolCalls: [{id: "1", name: "queryGraph", arguments: {query: "edgeCount"}}],
        });

        const result = await graph.aiCommand("count edges");

        assert.strictEqual(result.success, true);
        assert.strictEqual(result.data?.edgeCount, 5);
      });

      it("returns graph summary with all statistics", async () => {
        const graph = (graphElement as any).graph;
        const aiManager = graph.getAiManager();
        const provider = aiManager.getProvider();

        provider.setResponse("summary", {
          text: "",
          toolCalls: [{id: "1", name: "queryGraph", arguments: {query: "summary"}}],
        });

        const result = await graph.aiCommand("summary");

        assert.strictEqual(result.success, true);
        assert.ok(result.data?.nodeCount !== undefined);
        assert.ok(result.data?.edgeCount !== undefined);
      });
    });

    describe("setLayout command", () => {
      it("changes to circular layout", async () => {
        const graph = (graphElement as any).graph;
        const aiManager = graph.getAiManager();
        const provider = aiManager.getProvider();

        provider.setResponse("circular", {
          text: "",
          toolCalls: [{id: "1", name: "setLayout", arguments: {type: "circular"}}],
        });

        const result = await graph.aiCommand("circular");

        assert.strictEqual(result.success, true);

        // Verify layout actually changed
        const layoutManager = graph.getLayoutManager();
        assert.strictEqual(layoutManager.layoutEngine?.type, "circular");
      });

      it("changes to force-directed layout", async () => {
        const graph = (graphElement as any).graph;
        const aiManager = graph.getAiManager();
        const provider = aiManager.getProvider();

        provider.setResponse("force", {
          text: "",
          toolCalls: [{id: "1", name: "setLayout", arguments: {type: "ngraph"}}],
        });

        const result = await graph.aiCommand("force");

        assert.strictEqual(result.success, true);
        const layoutManager = graph.getLayoutManager();
        assert.strictEqual(layoutManager.layoutEngine?.type, "ngraph");
      });

      it("rejects invalid layout type with helpful error", async () => {
        const graph = (graphElement as any).graph;
        const aiManager = graph.getAiManager();
        const provider = aiManager.getProvider();

        provider.setResponse("invalid", {
          text: "",
          toolCalls: [{id: "1", name: "setLayout", arguments: {type: "nonexistent"}}],
        });

        const result = await graph.aiCommand("invalid");

        assert.strictEqual(result.success, false);
        assert.ok(result.message.includes("Invalid layout") || result.message.includes("not found"));
      });

      it("changes to spiral layout", async () => {
        const graph = (graphElement as any).graph;
        const aiManager = graph.getAiManager();
        const provider = aiManager.getProvider();

        provider.setResponse("spiral", {
          text: "",
          toolCalls: [{id: "1", name: "setLayout", arguments: {type: "spiral"}}],
        });

        const result = await graph.aiCommand("spiral");

        assert.strictEqual(result.success, true);
        const layoutManager = graph.getLayoutManager();
        assert.strictEqual(layoutManager.layoutEngine?.type, "spiral");
      });

      it("changes to shell layout", async () => {
        const graph = (graphElement as any).graph;
        const aiManager = graph.getAiManager();
        const provider = aiManager.getProvider();

        provider.setResponse("shell", {
          text: "",
          toolCalls: [{id: "1", name: "setLayout", arguments: {type: "shell"}}],
        });

        const result = await graph.aiCommand("shell");

        assert.strictEqual(result.success, true);
        const layoutManager = graph.getLayoutManager();
        assert.strictEqual(layoutManager.layoutEngine?.type, "shell");
      });
    });

    describe("setDimension command", () => {
      it("switches to 2D mode", async () => {
        const graph = (graphElement as any).graph;
        const aiManager = graph.getAiManager();
        const provider = aiManager.getProvider();

        // Ensure we start in 3D
        assert.strictEqual(graph.is2D(), false);

        provider.setResponse("2d", {
          text: "",
          toolCalls: [{id: "1", name: "setDimension", arguments: {dimension: "2d"}}],
        });

        const result = await graph.aiCommand("2d");

        assert.strictEqual(result.success, true);
        assert.strictEqual(graph.is2D(), true);
      });

      it("switches to 3D mode", async () => {
        const graph = (graphElement as any).graph;
        const aiManager = graph.getAiManager();
        const provider = aiManager.getProvider();

        // First switch to 2D
        provider.setResponse("2d", {
          text: "",
          toolCalls: [{id: "1", name: "setDimension", arguments: {dimension: "2d"}}],
        });
        await graph.aiCommand("2d");
        assert.strictEqual(graph.is2D(), true);

        // Now switch back to 3D
        provider.setResponse("3d", {
          text: "",
          toolCalls: [{id: "1", name: "setDimension", arguments: {dimension: "3d"}}],
        });

        const result = await graph.aiCommand("3d");

        assert.strictEqual(result.success, true);
        assert.strictEqual(graph.is2D(), false);
      });

      it("handles numeric dimension parameter (2)", async () => {
        const graph = (graphElement as any).graph;
        const aiManager = graph.getAiManager();
        const provider = aiManager.getProvider();

        provider.setResponse("flat", {
          text: "",
          toolCalls: [{id: "1", name: "setDimension", arguments: {dimension: 2}}],
        });

        const result = await graph.aiCommand("flat");

        assert.strictEqual(result.success, true);
        assert.strictEqual(graph.is2D(), true);
      });

      it("handles numeric dimension parameter (3)", async () => {
        const graph = (graphElement as any).graph;
        const aiManager = graph.getAiManager();
        const provider = aiManager.getProvider();

        // First switch to 2D
        provider.setResponse("2d", {
          text: "",
          toolCalls: [{id: "1", name: "setDimension", arguments: {dimension: "2d"}}],
        });
        await graph.aiCommand("2d");

        provider.setResponse("3d", {
          text: "",
          toolCalls: [{id: "1", name: "setDimension", arguments: {dimension: 3}}],
        });

        const result = await graph.aiCommand("3d");

        assert.strictEqual(result.success, true);
        assert.strictEqual(graph.is2D(), false);
      });
    });

    describe("setImmersiveMode command", () => {
      it("gracefully handles VR when WebXR not available", async () => {
        const graph = (graphElement as any).graph;
        const aiManager = graph.getAiManager();
        const provider = aiManager.getProvider();

        provider.setResponse("vr", {
          text: "",
          toolCalls: [{id: "1", name: "setImmersiveMode", arguments: {mode: "vr"}}],
        });

        const result = await graph.aiCommand("vr");

        // Should fail gracefully since WebXR is not available in test environment
        assert.ok(result.message.includes("VR") || result.message.includes("WebXR") || result.message.includes("not"));
      });

      it("gracefully handles AR when WebXR not available", async () => {
        const graph = (graphElement as any).graph;
        const aiManager = graph.getAiManager();
        const provider = aiManager.getProvider();

        provider.setResponse("ar", {
          text: "",
          toolCalls: [{id: "1", name: "setImmersiveMode", arguments: {mode: "ar"}}],
        });

        const result = await graph.aiCommand("ar");

        // Should fail gracefully since WebXR is not available in test environment
        assert.ok(result.message.includes("AR") || result.message.includes("WebXR") || result.message.includes("not"));
      });

      it("handles exit immersive mode", async () => {
        const graph = (graphElement as any).graph;
        const aiManager = graph.getAiManager();
        const provider = aiManager.getProvider();

        provider.setResponse("exit", {
          text: "",
          toolCalls: [{id: "1", name: "setImmersiveMode", arguments: {mode: "exit"}}],
        });

        const result = await graph.aiCommand("exit");

        assert.strictEqual(result.success, true);
        assert.ok(result.message.includes("exit") || result.message.includes("normal"));
      });
    });

    describe("multiple commands in sequence", () => {
      it("executes layout then dimension change", async () => {
        const graph = (graphElement as any).graph;
        const aiManager = graph.getAiManager();
        const provider = aiManager.getProvider();

        // Change layout
        provider.setResponse("circular", {
          text: "",
          toolCalls: [{id: "1", name: "setLayout", arguments: {type: "circular"}}],
        });
        await graph.aiCommand("circular");

        // Change dimension
        provider.setResponse("2d", {
          text: "",
          toolCalls: [{id: "1", name: "setDimension", arguments: {dimension: "2d"}}],
        });
        await graph.aiCommand("2d");

        // Verify both changes took effect
        const layoutManager = graph.getLayoutManager();
        assert.strictEqual(layoutManager.layoutEngine?.type, "circular");
        assert.strictEqual(graph.is2D(), true);
      });

      it("query works after layout change", async () => {
        const graph = (graphElement as any).graph;
        const aiManager = graph.getAiManager();
        const provider = aiManager.getProvider();

        // Change layout
        provider.setResponse("spiral", {
          text: "",
          toolCalls: [{id: "1", name: "setLayout", arguments: {type: "spiral"}}],
        });
        await graph.aiCommand("spiral");

        // Query should still work
        provider.setResponse("count", {
          text: "",
          toolCalls: [{id: "1", name: "queryGraph", arguments: {query: "nodeCount"}}],
        });
        const result = await graph.aiCommand("count");

        assert.strictEqual(result.success, true);
        assert.strictEqual(result.data?.nodeCount, 5);
      });
    });

    describe("error handling", () => {
      it("handles command execution errors gracefully", async () => {
        const graph = (graphElement as any).graph;
        const aiManager = graph.getAiManager();
        const provider = aiManager.getProvider();

        // Try to call a non-existent command
        provider.setResponse("bad", {
          text: "",
          toolCalls: [{id: "1", name: "nonExistentCommand", arguments: {}}],
        });

        const result = await graph.aiCommand("bad");

        assert.strictEqual(result.success, false);
        assert.ok(result.message.toLowerCase().includes("unknown") ||
                  result.message.toLowerCase().includes("not found"));
      });

      it("recovers after error and can execute new commands", async () => {
        const graph = (graphElement as any).graph;
        const aiManager = graph.getAiManager();
        const provider = aiManager.getProvider();

        // First, cause an error
        provider.setResponse("bad", {
          text: "",
          toolCalls: [{id: "1", name: "nonExistentCommand", arguments: {}}],
        });
        await graph.aiCommand("bad");

        // Now execute a valid command
        provider.setResponse("circular", {
          text: "",
          toolCalls: [{id: "1", name: "setLayout", arguments: {type: "circular"}}],
        });
        const result = await graph.aiCommand("circular");

        assert.strictEqual(result.success, true);
      });
    });
  });
  ```

- `test/browser/ai/commands-e2e-layouts.test.ts`: Comprehensive layout testing
  ```typescript
  import {assert, describe, it, beforeEach, afterEach} from "vitest";

  describe("AI Layout Commands - All Layout Types", () => {
    // Test each supported layout type
    const layoutTypes = [
      "circular",
      "ngraph",
      "random",
      "d3",
      "spiral",
      "shell",
      "spring",
      "planar",
      "kamada-kawai",
      "forceatlas2",
      "arf",
      "spectral",
      "bfs",
      "bipartite",
      "multipartite",
      "fixed",
    ];

    let graphElement: HTMLElement;

    beforeEach(async () => {
      document.body.innerHTML = `
        <graphty-element style="width: 800px; height: 600px;"></graphty-element>
      `;
      graphElement = document.querySelector("graphty-element")!;
      await new Promise(resolve => setTimeout(resolve, 500));

      const graph = (graphElement as any).graph;
      await graph.addNodes([
        {id: "A"}, {id: "B"}, {id: "C"}, {id: "D"}, {id: "E"},
      ]);
      await graph.addEdges([
        {src: "A", dst: "B"}, {src: "B", dst: "C"},
        {src: "C", dst: "D"}, {src: "D", dst: "E"},
      ]);
      await graph.enableAiControl({provider: "mock"});
    });

    afterEach(() => {
      document.body.innerHTML = "";
    });

    for (const layoutType of layoutTypes) {
      it(`can switch to ${layoutType} layout`, async () => {
        const graph = (graphElement as any).graph;
        const provider = graph.getAiManager().getProvider();

        provider.setResponse(layoutType, {
          text: "",
          toolCalls: [{id: "1", name: "setLayout", arguments: {type: layoutType}}],
        });

        const result = await graph.aiCommand(layoutType);

        // Some layouts may not be available in all environments
        if (result.success) {
          const layoutManager = graph.getLayoutManager();
          assert.strictEqual(layoutManager.layoutEngine?.type, layoutType);
        } else {
          // If layout fails, ensure it's a meaningful error
          assert.ok(result.message.length > 0);
        }
      });
    }
  });
  ```

**Implementation**:

No new source code needed - this phase focuses on testing existing implementations.

**Test Helpers to Create**:

- `test/helpers/e2e-graph-setup.ts`: Shared setup for e2e tests
  ```typescript
  export async function createE2EGraph(options?: {
    nodes?: Array<{id: string; [key: string]: unknown}>;
    edges?: Array<{src: string; dst: string}>;
    enableAi?: boolean;
  }): Promise<{element: HTMLElement; graph: Graph}> {
    document.body.innerHTML = `
      <graphty-element style="width: 800px; height: 600px;"></graphty-element>
    `;

    const element = document.querySelector("graphty-element")!;
    await new Promise(resolve => setTimeout(resolve, 500));

    const graph = (element as any).graph;

    if (options?.nodes) {
      await graph.addNodes(options.nodes);
    }
    if (options?.edges) {
      await graph.addEdges(options.edges);
    }
    if (options?.enableAi !== false) {
      await graph.enableAiControl({provider: "mock"});
    }

    return {element, graph};
  }

  export function cleanupE2EGraph(): void {
    document.body.innerHTML = "";
  }
  ```

**User-Testable Demo**: No new demo - this phase validates existing demos work correctly.

**Dependencies**:
- External: None
- Internal: Phase 1-3

**Verification**:
1. Run: `npm run test:default -- test/browser/ai/commands-e2e`
2. All tests should pass with real Graph instances
3. Any failures indicate integration bugs between commands and Graph API
4. Run: `npm run storybook` and manually verify demos still work
5. Expected: All AI commands work correctly against real Graph

---

### Phase 5: Style & Camera Commands with Real LLM
**(Previously Phase 4)**
**Objective**: Add style and camera commands, then test the full pipeline with real LLM providers.

**Duration**: 3-4 days

**Tests to Write First**:

- `test/ai/commands/StyleCommands.test.ts`:
  ```typescript
  describe("StyleCommands", () => {
    it("styles all nodes with empty selector", async () => {
      const result = await findAndStyleNodes.execute(graph, {
        selector: "",
        style: {color: "#ff0000"},
        layerName: "test",
      }, context);
      assert.strictEqual(result.success, true);
    });

    it("styles nodes matching selector", async () => {
      // Set type on some nodes
      const nodes = Array.from(graph.getDataManager().nodes.values());
      nodes[0].data.type = "server";
      nodes[1].data.type = "server";

      const result = await findAndStyleNodes.execute(graph, {
        selector: "data.type == 'server'",
        style: {color: "#0000ff", size: 2},
        layerName: "servers",
      }, context);

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.affectedNodes?.length, 2);
    });
  });
  ```

- `test/ai/commands/CameraCommands.test.ts`:
  ```typescript
  describe("CameraCommands", () => {
    it("applies camera preset", async () => {
      const result = await setCameraPosition.execute(graph, {
        preset: "top",
        animate: true,
      }, context);
      assert.strictEqual(result.success, true);
    });

    it("zooms to fit all nodes", async () => {
      const result = await zoomToNodes.execute(graph, {
        selector: "",
      }, context);
      assert.strictEqual(result.success, true);
    });
  });
  ```

- `test/ai/integration/real-llm.test.ts`: Integration test with real LLM (manual run)
  ```typescript
  describe.skipIf(!process.env.OPENAI_API_KEY)("Real LLM Integration", () => {
    it("executes natural language style command", async () => {
      graph.enableAiControl({provider: "openai"});
      graph.setAiApiKey("openai", process.env.OPENAI_API_KEY!);

      const result = await graph.aiCommand("Make all nodes red");

      assert.strictEqual(result.success, true);
      // Verify nodes are actually red
    });

    it("executes multi-step command", async () => {
      graph.enableAiControl({provider: "openai"});
      graph.setAiApiKey("openai", process.env.OPENAI_API_KEY!);

      const result = await graph.aiCommand("Switch to circular layout and show from top");
      assert.strictEqual(result.success, true);
    });
  });
  ```

**Implementation**:

- `src/ai/commands/StyleCommands.ts`: findAndStyleNodes, findAndStyleEdges, clearStyles
- `src/ai/commands/CameraCommands.ts`: setCameraPosition, zoomToNodes

**User-Testable Demo**: `stories/ai/AiRealLLM.stories.ts`

```typescript
import type {Meta, StoryObj} from "@storybook/web-components";
import {html} from "lit";

const meta: Meta = {
  title: "AI/Real LLM Test",
  render: () => {
    setTimeout(() => {
      const graphEl = document.querySelector("graphty-element");
      const graph = graphEl?.graph;
      if (!graph) return;

      const providerSelect = document.getElementById("provider") as HTMLSelectElement;
      const keyInput = document.getElementById("api-key") as HTMLInputElement;
      const connectBtn = document.getElementById("connect") as HTMLButtonElement;
      const input = document.getElementById("cmd-input") as HTMLInputElement;
      const submit = document.getElementById("cmd-submit") as HTMLButtonElement;
      const status = document.getElementById("status")!;
      const output = document.getElementById("output")!;

      connectBtn.onclick = () => {
        const provider = providerSelect.value as "openai" | "anthropic" | "google";
        graph.enableAiControl({provider});
        graph.setAiApiKey(provider, keyInput.value);
        status.textContent = `✓ Connected to ${provider}`;
        status.style.color = "green";
        submit.disabled = false;
      };

      submit.onclick = async () => {
        output.textContent = "Processing with real LLM...";
        try {
          const result = await graph.aiCommand(input.value);
          output.textContent = result.message + (result.data ? "\n" + JSON.stringify(result.data, null, 2) : "");
        } catch (error) {
          output.textContent = "Error: " + (error as Error).message;
        }
      };
    }, 500);

    return html`
      <style>
        .panel { position: absolute; top: 10px; left: 10px; background: white; padding: 16px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); z-index: 100; width: 380px; }
        .panel select, .panel input { padding: 8px; margin: 4px 0; }
        .panel button { padding: 8px 12px; margin: 4px; }
        .panel pre { background: #f4f4f4; padding: 8px; font-size: 12px; white-space: pre-wrap; }
      </style>
      <div style="width: 100%; height: 600px; position: relative;">
        <graphty-element
          data-url="https://raw.githubusercontent.com/graphty-js/graphty-element/main/test/helpers/cat-social-network-2.json"
          layout-type="ngraph"
        ></graphty-element>
        <div class="panel">
          <h3 style="margin-top: 0;">🤖 Real LLM Test</h3>
          <div>
            <select id="provider">
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="google">Google</option>
            </select>
            <input id="api-key" type="password" placeholder="API Key" style="width: 200px;">
            <button id="connect">Connect</button>
          </div>
          <div id="status" style="margin: 8px 0; font-size: 14px;"></div>
          <hr>
          <div>
            <input id="cmd-input" type="text" placeholder="Natural language command..." style="width: 250px;">
            <button id="cmd-submit" disabled>Send</button>
          </div>
          <pre id="output" style="min-height: 100px;"></pre>
          <div style="font-size: 12px; color: #666;">
            <strong>Try natural language:</strong><br>
            • "Make all nodes blue"<br>
            • "Switch to circular layout"<br>
            • "Show from top"<br>
            • "How many nodes are there?"<br>
            • "Highlight nodes with high degree"
          </div>
        </div>
      </div>
    `;
  },
};

export default meta;
export const Default: StoryObj = {};
```

**Dependencies**:
- External: None new
- Internal: Phase 1-3

**Verification**:
1. Run: `npm test -- test/ai/commands/StyleCommands test/ai/commands/CameraCommands`
2. Run: `npm run storybook`
3. Navigate to: "AI / Real LLM Test"
4. **User Test**:
   - Select provider, enter API key, click Connect
   - Type "Make all nodes red" → Nodes should turn red
   - Type "Show from top" → Camera should animate to top view
   - Type "Switch to circular" → Layout should change
5. Expected: Natural language commands work with real LLM

---

### Phase 6: Voice Input & Algorithm Commands
**(Previously Phase 5)**
**Objective**: Add voice input support and algorithm-related commands.

**Duration**: 2-3 days

**Tests to Write First**:

- `test/ai/input/VoiceInputAdapter.test.ts`:
  ```typescript
  describe("VoiceInputAdapter", () => {
    it("detects browser support", () => {
      const adapter = new VoiceInputAdapter();
      assert.strictEqual(typeof adapter.isSupported, "boolean");
    });

    it("handles unsupported gracefully", () => {
      // Mock no support
      const adapter = new VoiceInputAdapter();
      if (!adapter.isSupported) {
        adapter.start(); // Should not throw
        assert.strictEqual(adapter.isActive, false);
      }
    });
  });
  ```

- `test/ai/commands/AlgorithmCommands.test.ts`:
  ```typescript
  describe("AlgorithmCommands", () => {
    it("runs degree algorithm", async () => {
      const result = await runAlgorithm.execute(graph, {
        namespace: "graphty",
        type: "degree",
      }, context);
      assert.strictEqual(result.success, true);
    });

    it("lists available algorithms", async () => {
      const result = await listAlgorithms.execute(graph, {}, context);
      assert.strictEqual(result.success, true);
      assert.ok(result.data?.algorithms.includes("degree"));
    });
  });
  ```

**Implementation**:

- `src/ai/input/types.ts`: InputAdapter interface
  ```typescript
  interface InputAdapter {
    readonly type: 'text' | 'voice';
    readonly isActive: boolean;
    start(options?: InputOptions): void;
    stop(): void;
    onInput(callback: (input: string, isFinal: boolean) => void): void;
  }
  ```
- `src/ai/input/TextInputAdapter.ts`: Text input adapter for streaming text support
  ```typescript
  // Wraps text input with streaming support and interim results
  // Useful for "as-you-type" suggestions or preview functionality
  ```
- `src/ai/input/VoiceInputAdapter.ts`: Web Speech API wrapper
- `src/ai/commands/AlgorithmCommands.ts`: runAlgorithm, listAlgorithms
- Update `src/Graph.ts` with voice methods:
  - `startVoiceInput(options)`
  - `stopVoiceInput()`
  - `isVoiceActive()`

**User-Testable Demo**: `stories/ai/AiVoiceInput.stories.ts`

```typescript
import type {Meta, StoryObj} from "@storybook/web-components";
import {html} from "lit";

const meta: Meta = {
  title: "AI/Voice Input",
  render: () => {
    setTimeout(() => {
      const graphEl = document.querySelector("graphty-element");
      const graph = graphEl?.graph;
      if (!graph) return;

      graph.enableAiControl({provider: "mock"});

      const micBtn = document.getElementById("mic-btn") as HTMLButtonElement;
      const transcript = document.getElementById("transcript")!;
      const status = document.getElementById("voice-status")!;

      // Check support
      const adapter = graph.getVoiceAdapter?.();
      if (!adapter?.isSupported) {
        status.textContent = "Voice input not supported in this browser";
        micBtn.disabled = true;
        return;
      }

      let isListening = false;

      micBtn.onclick = () => {
        if (isListening) {
          graph.stopVoiceInput();
          micBtn.textContent = "🎤 Start Listening";
          micBtn.style.background = "";
          isListening = false;
        } else {
          graph.startVoiceInput({
            continuous: true,
            interimResults: true,
            onTranscript: (text, isFinal) => {
              transcript.textContent = text;
              if (isFinal) {
                graph.aiCommand(text);
              }
            },
          });
          micBtn.textContent = "⏹ Stop";
          micBtn.style.background = "#ff4444";
          isListening = true;
        }
      };
    }, 500);

    return html`
      <style>
        .voice-panel { position: absolute; top: 10px; left: 10px; background: white; padding: 16px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); z-index: 100; }
        #mic-btn { font-size: 18px; padding: 12px 24px; cursor: pointer; }
        #transcript { margin-top: 12px; padding: 8px; background: #f4f4f4; min-height: 40px; }
      </style>
      <div style="width: 100%; height: 600px; position: relative;">
        <graphty-element
          data-url="https://raw.githubusercontent.com/graphty-js/graphty-element/main/test/helpers/cat-social-network-2.json"
          layout-type="ngraph"
        ></graphty-element>
        <div class="voice-panel">
          <h3 style="margin-top: 0;">🎙️ Voice Input</h3>
          <div id="voice-status"></div>
          <button id="mic-btn">🎤 Start Listening</button>
          <div id="transcript"></div>
          <div style="margin-top: 12px; font-size: 12px; color: #666;">
            Speak commands like:<br>
            • "Make all nodes red"<br>
            • "Switch to circular layout"<br>
            • "Show from top"
          </div>
        </div>
      </div>
    `;
  },
};

export default meta;
export const Default: StoryObj = {};
```

**Dependencies**:
- External: None (uses browser APIs)
- Internal: Phase 1-4

**Verification**:
1. Run: `npm test -- test/ai/input/ test/ai/commands/AlgorithmCommands`
2. Run: `npm run storybook`
3. Navigate to: "AI / Voice Input"
4. **User Test** (in Chrome):
   - Click "Start Listening" and speak "make all nodes blue"
   - Should see transcript and nodes change color
5. Expected: Voice recognition works and executes commands

---

### Phase 7: Capture Commands, Key Persistence, Events & Polish
**(Previously Phase 6)**
**Objective**: Add screenshot/video capture commands, encrypted key persistence, explicit AI events, `retryLastAiCommand()`, and polish the full system.

**Duration**: 2-3 days

**AI Events** (explicit from design):

The following events are emitted for UI integration:

```typescript
type AiEventTypes = {
  // Main event for UI binding (single source of truth)
  'ai-status-change': { status: AiStatus };

  // Lifecycle events
  'ai-command-start': { input: string; timestamp: number };
  'ai-command-complete': { result: CommandResult; duration: number };
  'ai-command-error': { error: Error; input: string; canRetry: boolean };
  'ai-command-cancelled': { input: string; reason: 'user' | 'timeout' };

  // Streaming events (throttled)
  'ai-stream-chunk': { text: string; accumulated: string };
  'ai-stream-tool-call': { name: string; params: unknown };
  'ai-stream-tool-result': { name: string; result: unknown; success: boolean };

  // Voice events
  'ai-voice-start': void;
  'ai-voice-transcript': { transcript: string; isFinal: boolean };
  'ai-voice-end': { reason: 'user' | 'timeout' | 'error' };
};
```

**Tests to Write First**:

- `test/ai/commands/CaptureCommands.test.ts`:
  ```typescript
  describe("CaptureCommands", () => {
    it("captures screenshot", async () => {
      const result = await captureScreenshot.execute(graph, {
        format: "png",
        download: false,
      }, context);
      assert.strictEqual(result.success, true);
      assert.ok(result.data?.dataUrl?.startsWith("data:image/png"));
    });
  });
  ```

- `test/ai/keys/ApiKeyManager.persistence.test.ts`:
  ```typescript
  describe("ApiKeyManager Persistence", () => {
    it("persists with encryption", () => {
      const manager = new ApiKeyManager();
      manager.enablePersistence({encryptionKey: "test", storage: "localStorage"});
      manager.setKey("openai", "sk-test");

      const manager2 = new ApiKeyManager();
      manager2.enablePersistence({encryptionKey: "test", storage: "localStorage"});
      assert.strictEqual(manager2.getKey("openai"), "sk-test");
    });
  });
  ```

- `test/ai/AiController.events.test.ts`: Event emission tests
  ```typescript
  describe("AiController Events", () => {
    it("emits ai-status-change on state transitions", async () => {
      const events: AiStatus[] = [];
      graph.on("ai-status-change", (e) => events.push(e.status));

      await graph.aiCommand("test");

      assert.ok(events.some(e => e.state === "submitted"));
      assert.ok(events.some(e => e.state === "ready"));
    });

    it("emits ai-command-start with input and timestamp", async () => {
      let startEvent: {input: string; timestamp: number} | null = null;
      graph.on("ai-command-start", (e) => { startEvent = e; });

      await graph.aiCommand("make nodes red");

      assert.strictEqual(startEvent?.input, "make nodes red");
      assert.ok(startEvent?.timestamp > 0);
    });

    it("emits ai-command-complete with result and duration", async () => {
      let completeEvent: {result: CommandResult; duration: number} | null = null;
      graph.on("ai-command-complete", (e) => { completeEvent = e; });

      await graph.aiCommand("how many nodes?");

      assert.ok(completeEvent?.result.success);
      assert.ok(completeEvent?.duration >= 0);
    });

    it("emits ai-command-error with canRetry flag", async () => {
      mockProvider.setError(new Error("Network error"));
      let errorEvent: {error: Error; input: string; canRetry: boolean} | null = null;
      graph.on("ai-command-error", (e) => { errorEvent = e; });

      await graph.aiCommand("test");

      assert.ok(errorEvent?.error.message.includes("Network error"));
      assert.strictEqual(errorEvent?.canRetry, true);
    });

    it("emits ai-stream-chunk events during streaming", async () => {
      const chunks: string[] = [];
      graph.on("ai-stream-chunk", (e) => chunks.push(e.text));

      await graph.aiCommand("describe the graph");

      assert.ok(chunks.length > 0);
    });
  });
  ```

- `test/ai/AiController.retry.test.ts`: Retry functionality tests
  ```typescript
  describe("AiController Retry", () => {
    it("retryLastAiCommand() retries the last failed command", async () => {
      mockProvider.setError(new Error("Temporary error"));
      await graph.aiCommand("make nodes red");

      // Clear error, allow retry to succeed
      mockProvider.clearError();
      mockProvider.setResponse("make nodes red", {
        text: "Done",
        toolCalls: [{id: "1", name: "findAndStyleNodes", arguments: {selector: "", style: {color: "#ff0000"}}}],
      });

      const retryResult = await graph.retryLastAiCommand();
      assert.strictEqual(retryResult.success, true);
    });

    it("retryLastAiCommand() throws if no previous command", async () => {
      await assert.rejects(
        () => graph.retryLastAiCommand(),
        /No previous command/
      );
    });

    it("retryLastAiCommand() throws if AI not enabled", async () => {
      graph.disableAiControl();
      await assert.rejects(
        () => graph.retryLastAiCommand(),
        /AI not enabled/
      );
    });
  });
  ```

- `test/browser/ai/graph-ai-integration.test.ts`: Full browser integration tests

**Implementation**:

- `src/ai/commands/CaptureCommands.ts`: captureScreenshot, captureVideo
- Update `src/ai/keys/ApiKeyManager.ts` with `encrypt-storage` integration
- Add AI events to `src/events.ts` (all event types listed above)
- Update `src/ai/AiController.ts` to emit all events
- Update `src/Graph.ts` with `retryLastAiCommand()` method:
  ```typescript
  // In Graph.ts
  retryLastAiCommand(): Promise<CommandResult> {
    if (!this.aiManager) {
      throw new Error('AI not enabled. Call enableAiControl() first.');
    }
    return this.aiManager.retry();
  }
  ```
- Complete `src/ai/index.ts` public exports

**User-Testable Demo**: Update `stories/ai/AiRealLLM.stories.ts` with capture buttons and key persistence

Add to the Real LLM story:
```typescript
// Add "Remember Key" checkbox
<label>
  <input id="remember-key" type="checkbox"> Remember API key (encrypted)
</label>

// Add capture buttons
<button id="screenshot-btn">📷 Screenshot</button>
<button id="video-btn">🎬 Record 5s Video</button>
```

**Dependencies**:
- External: `encrypt-storage`
- Internal: All previous phases

**Verification**:
1. Run: `npm test -- test/ai/commands/CaptureCommands test/ai/keys/`
2. Run: `npm run storybook`
3. **User Test**:
   - Check "Remember API key", enter key, refresh page → Key should persist
   - Click Screenshot → Should download PNG
   - Type "Take a screenshot" → Should work via AI
4. Run: `npm run ready:commit`
5. Expected: All tests pass, build succeeds, lint clean

---

### Phase 8: WebLLM Provider & Final Documentation
**(Previously Phase 7)**
**Objective**: Add in-browser LLM support and finalize all Storybook documentation.

**Duration**: 2-3 days

**Tests to Write First**:

- `test/ai/providers/WebLlmProvider.test.ts`:
  ```typescript
  describe("WebLlmProvider", () => {
    it("lazy-loads module", () => {
      const provider = new WebLlmProvider();
      assert.strictEqual(provider.name, "webllm");
      // Should not have imported @mlc-ai/web-llm yet
    });

    it("reports initialization progress", async () => {
      const provider = new WebLlmProvider();
      const progress: number[] = [];
      provider.onProgress((p) => progress.push(p));
      // Would need WebGPU browser to fully test
    });
  });
  ```

**Implementation**:

- `src/ai/providers/WebLlmProvider.ts`: Lazy-loaded in-browser LLM
- Complete Storybook stories with all commands documented:
  - `stories/ai/AiCommands.mdx`: Command reference documentation
  - `stories/ai/AiProviders.stories.ts`: Provider comparison
  - `stories/ai/AiWebLLM.stories.ts`: In-browser LLM demo

**User-Testable Demo**: `stories/ai/AiWebLLM.stories.ts`

```typescript
const meta: Meta = {
  title: "AI/WebLLM (In-Browser)",
  render: () => {
    return html`
      <style>
        .webllm-panel { padding: 20px; max-width: 600px; }
        .progress-bar { width: 100%; height: 20px; background: #eee; margin: 10px 0; }
        .progress-fill { height: 100%; background: #4caf50; transition: width 0.3s; }
      </style>
      <div class="webllm-panel">
        <h2>🧠 In-Browser LLM (WebLLM)</h2>
        <p>Run LLMs entirely in your browser using WebGPU. No API key required!</p>
        <p><strong>Requirements:</strong> Chrome 113+ with WebGPU enabled</p>

        <div id="webgpu-check"></div>

        <select id="model-select">
          <option value="Llama-3.2-1B-Instruct-q4f32_1-MLC">Llama 3.2 1B (Fast, ~500MB)</option>
          <option value="Llama-3.2-3B-Instruct-q4f32_1-MLC">Llama 3.2 3B (Better, ~1.5GB)</option>
          <option value="Phi-3.5-mini-instruct-q4f16_1-MLC">Phi 3.5 Mini (Good balance)</option>
        </select>
        <button id="load-btn">Load Model</button>

        <div class="progress-bar">
          <div id="progress-fill" class="progress-fill" style="width: 0%"></div>
        </div>
        <div id="status">Select a model and click Load</div>

        <hr>
        <input id="prompt" type="text" placeholder="Enter prompt..." style="width: 400px;" disabled>
        <button id="generate-btn" disabled>Generate</button>
        <pre id="output" style="white-space: pre-wrap;"></pre>
      </div>
    `;
  },
};
```

**Dependencies**:
- External: `@mlc-ai/web-llm` (optional, lazy-loaded)
- Internal: All previous phases

**Verification**:
1. Run: `npm test -- test/ai/providers/WebLlmProvider`
2. Run: `npm run storybook`
3. Navigate to: "AI / WebLLM (In-Browser)"
4. **User Test** (Chrome with WebGPU):
   - Select model and click Load
   - Wait for download (progress bar)
   - Enter prompt and click Generate
5. Run: `npm run ready:commit`
6. Expected: Full test suite passes, all stories work

---

## Common Utilities Needed

| Utility | Purpose | Location |
|---------|---------|----------|
| `createMockGraphContext()` | Test helper for Graph-like context | `test/helpers/mock-graph-context.ts` |
| `createTestGraph()` | Creates Graph with test data | `test/helpers/test-graph.ts` |
| `createMockContext()` | Mock CommandContext for command tests | `test/helpers/test-graph.ts` |
| `throttle()` | Throttle streaming callbacks | `src/ai/utils/throttle.ts` |

## External Libraries Assessment

| Task | Library | Reason |
|------|---------|--------|
| LLM abstraction | Vercel AI SDK (`ai`) | TypeScript-native, 15+ providers, streaming, tool calling |
| Encrypted storage | `encrypt-storage` | Well-maintained, AES encryption, localStorage/sessionStorage |
| In-browser LLM | `@mlc-ai/web-llm` | WebGPU acceleration, OpenAI-compatible API |

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| LLM generates invalid commands | Strict Zod validation on all tool outputs |
| Provider API changes | Vercel AI SDK abstracts provider differences |
| WebLLM performance | Document requirements, offer quantized models, fallback to cloud |
| Voice recognition accuracy | Show interim transcripts, allow editing before execution |
| API key exposure | Session-only default, encrypted optional, clear documentation |

---

## Summary

| Phase | Focus | Duration | Demo/UI |
|-------|-------|----------|---------|
| 1 | Core Types & Multi-Provider De-risking | 3-4 days | `examples/ai-provider-test.html` |
| 2 | Command Infrastructure & Controller (AiStatus with all fields) | 2-3 days | Storybook: "AI/Controller Demo" |
| 3 | Graph Integration & First Commands (incl. ModeCommands/VR/AR) | 3-4 days | Storybook: "AI/Graph Integration" |
| 4 | **End-to-End Command Testing with Real Graph** | 2-3 days | Validates existing demos |
| 5 | Style & Camera Commands + Real LLM | 3-4 days | Storybook: "AI/Real LLM Test" |
| 6 | Voice Input & Algorithm Commands | 2-3 days | Storybook: "AI/Voice Input" |
| 7 | Capture, Events, Key Persistence & retryLastAiCommand | 2-3 days | Enhanced "AI/Real LLM Test" |
| 8 | WebLLM & Documentation | 2-3 days | Storybook: "AI/WebLLM" |

**Total Estimated Duration**: 20-27 days

## Key Changes from Original Plan

1. **LLM de-risking moved to Phase 1** - Real provider testing happens immediately to catch API/SDK issues early
2. **Every phase has user-testable UI** - Either HTML demo or Storybook story for validation
3. **Progressive complexity** - Start with mock provider demos, build to real LLM, then voice/offline
4. **Clear verification steps** - Each phase lists exactly what users should test
5. **ModeCommands for VR/AR** - Phase 3 includes `setImmersiveMode` command for VR/AR/exit modes (Must requirement)
6. **Explicit AiStatus fields** - Phase 2 now explicitly defines all AiStatus fields: elapsed, stage, stageMessage, streamedText, toolCalls
7. **Explicit AI events** - Phase 7 explicitly lists all event types (ai-status-change, ai-command-start, ai-stream-chunk, etc.)
8. **retryLastAiCommand()** - Phase 7 adds explicit implementation and tests for retry functionality
9. **disableAiControl()** - Phase 3 explicitly includes this method in Graph.ts additions
10. **End-to-End Command Testing (Phase 4)** - Browser-based tests verify all commands work against real Graph instances with Babylon.js rendering, catching integration issues that unit tests with mocks cannot detect

This phased approach ensures:
- Each phase delivers user-testable functionality
- LLM integration risk is identified early (Phase 1)
- Tests are written before implementation (TDD)
- Existing codebase patterns are followed consistently
- Risk is minimized through incremental delivery with validation at each step
- All design requirements are explicitly covered (VR/AR modes, status fields, events, retry)
- **Commands are verified against real Graph API** (Phase 4 E2E tests)
