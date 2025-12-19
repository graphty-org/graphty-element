# Feature Design: Natural Language Control Interface for Graphty

## Overview

- **User Value**: Control complex graph visualizations through natural language commands (typed or spoken), eliminating the need to understand JMESPath selectors, API syntax, or navigate UI menus. This is especially valuable when immersed in WebXR environments where traditional interfaces are unavailable, and for users who want to explore graph data without learning a new API.

- **Technical Value**: Provides a flexible, extensible command execution framework that abstracts LLM providers, enabling future AI-powered features while maintaining clean separation between natural language processing and graph operations. The design follows existing architectural patterns (Manager, Registry, Observable) ensuring consistency with the codebase.

---

## Requirements

### Functional Requirements

| Requirement | Priority | Notes |
|-------------|----------|-------|
| Multi-LLM support (OpenAI, Anthropic, Gemini, in-browser) | Must | Use provider abstraction library |
| Text input | Must | Primary input method |
| Voice input | Must | Essential for WebXR |
| Secure API key management | Must | User-provided keys (BYOK pattern) |
| Style group operations | Must | "Find nodes with X, make them red" |
| Layout/algorithm control | Must | Switch layouts, run algorithms |
| Camera control | Must | Navigate, zoom, preset cameras |
| Mode switching (2D/3D/VR/AR) | Must | Dimension and immersion modes |
| Screenshot/video capture | Must | Media export commands |
| Extensible command framework | Must | Support future features |
| UI status for wrapper frameworks | Must | Loading states, progress indicators |

### Non-Functional Requirements

| Requirement | Priority | Notes |
|-------------|----------|-------|
| Streaming responses | Must | Reduce perceived latency |
| Command cancellation | Must | User can abort mid-execution |
| Error recovery with retry | Should | Graceful failure handling |
| Offline capability (WebLLM) | Should | In-browser LLM after model download |
| < 100ms UI response | Should | Throttled updates for smooth UX |

---

## Design Process & Decisions

### Phase 1: Codebase Architecture Analysis

Before designing the AI interface, we thoroughly explored the existing graphty-element architecture to ensure seamless integration.

#### Key Findings

**1. Core Architecture Pattern**
- `graphty-element.ts` is a thin Lit Web Component wrapper
- `Graph.ts` is the central orchestrator implementing `GraphContext` interface
- All logic belongs in Graph.ts, not the web component

**2. Manager System (10+ Specialized Managers)**

| Manager | Purpose | AI Integration Point |
|---------|---------|---------------------|
| `EventManager` | Pub/sub via Babylon.js Observables | Emit AI events |
| `OperationQueueManager` | Sequential ops with dependencies | Queue AI commands |
| `StyleManager` + `Styles` | JMESPath selectors, layer composition | Apply AI-generated styles |
| `LayoutManager` | Layout engine lifecycle | Switch layouts via AI |
| `DataManager` | Node/edge CRUD | Query graph state for context |
| `AlgorithmManager` | Execute registered algorithms | Run algorithms via AI |
| `CameraManager` | Camera types and input | Control camera via AI |
| `RenderManager` | Babylon.js engine/scene/camera | N/A (internal) |
| `UpdateManager` | Render loop, layout stepping | N/A (internal) |
| `StatsManager` | Performance profiling | N/A (internal) |
| `InputManager` | Mouse/touch/keyboard | Voice input adapter |

**3. Registry Patterns**
- `LayoutEngine.register(class)` / `LayoutEngine.get(type, options)`
- `Algorithm.register(class)` / `Algorithm.get(graph, namespace, type)`
- `DataSource.register(class)` / `DataSource.get(type, options)`

This pattern will be replicated for AI commands: `CommandRegistry.register(command)`

**4. Operation Queue System**
- Operations have categories with dependency ordering
- Supports batch mode via `graph.batchOperations(async () => { ... })`
- AbortSignal support for cancellation
- Post-execution triggers (e.g., data-add → layout-update)

**Decision**: AI commands will execute through the existing operation queue, ensuring proper sequencing with other graph operations.

**5. Style System (JMESPath-Based)**
- Selectors use JMESPath expressions against node/edge data
- Layer composition (last match wins)
- Calculated styles from algorithm results

Example selectors:
- `""` - matches all
- `"data.type == 'user'"` - match by data property
- `"algorithmResults.graphty.degree > 5"` - match by algorithm result

**Decision**: LLM will generate JMESPath selectors. System prompt will include selector syntax documentation.

**6. Camera Control**
- Dual camera support: 3D (orbit) and 2D (orthographic)
- State-based API: `getCameraState()`, `setCameraState(state, options)`
- Presets: built-in + user-defined
- Animation support with easing

**7. Capture Capabilities**
- Screenshots: `graph.captureScreenshot({ format, multiplier, destination })`
- Video: `graph.captureAnimation({ duration, fps, cameraMode, cameraPath })`

**8. No Existing Voice/Text NL Input**
- This is a greenfield opportunity
- InputManager handles mouse/touch/keyboard only

---

### Phase 2: LLM Abstraction Library Selection

#### Research Findings

| Library | Pros | Cons | Verdict |
|---------|------|------|---------|
| **Vercel AI SDK** | TypeScript-first, 15+ providers, unified API, streaming, tool calling, status states | Vercel ecosystem | **Selected** |
| ModelFusion | Vendor-neutral, comprehensive | Less adoption | Alternative |
| LangChain.js | Feature-rich, agents | Python-first, complex | Too heavy |
| AnyLLM | Simple abstraction | Limited features | Too simple |

#### Why Vercel AI SDK

1. **Provider Abstraction**: Swap providers by changing model identifier
2. **TypeScript Native**: Full type safety
3. **Status States**: `submitted`, `streaming`, `ready`, `error` - exactly what UI needs
4. **Tool Calling**: Native support for function calling across providers
5. **Streaming**: Built-in with throttling support (`experimental_throttle`)
6. **Active Maintenance**: Backed by Vercel, frequent updates

```typescript
// Example: Provider-agnostic code
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';

// Same code, different providers
const result = await generateText({
  model: openai('gpt-4o'),  // or anthropic('claude-3-5-sonnet')
  messages: [...],
  tools: [...],
});
```

**Decision**: Use Vercel AI SDK (`ai` package) with provider packages (`@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`).

---

### Phase 3: In-Browser LLM Selection

#### Research Findings

| Option | Technology | Performance | Models |
|--------|------------|-------------|--------|
| **WebLLM** | WebGPU | ~80% native | Llama 3, Phi 3, Gemma, Mistral, Qwen |
| Transformers.js | WASM/WebGPU | Good for NLP/vision | HuggingFace models |
| MediaPipe LLM | Google's runtime | Unknown | Google models |

#### Why WebLLM

1. **WebGPU Acceleration**: Near-native performance on supported hardware
2. **OpenAI-Compatible API**: Same interface as cloud providers
3. **Function Calling**: Modern models support tool use
4. **Web Worker Support**: Offloads computation from main thread
5. **IndexedDB Caching**: Download once, use repeatedly

```typescript
// WebLLM has OpenAI-compatible API
const response = await engine.chat.completions.create({
  messages: [...],
  tools: [...],
  tool_choice: 'auto',
});
```

**Trade-offs**:
- Initial download: 1-4GB depending on model
- Hardware requirements: WebGPU-capable browser
- Slower than cloud for complex queries

**Decision**: Support WebLLM as optional provider, lazy-loaded to avoid bundle bloat.

---

### Phase 4: Voice Input Technology

#### Research Findings

**Web Speech API** is the only viable browser-native option:

| Feature | Support | Notes |
|---------|---------|-------|
| Browser support | Chrome, Edge, Safari (partial) | Firefox lacks support |
| Continuous mode | Yes | Essential for WebXR |
| Interim results | Yes | Show transcription in progress |
| On-device | Chrome 120+ | Privacy-preserving option |
| Languages | 100+ | Configurable via `lang` property |

#### Implementation Considerations

```typescript
// TypeScript requires webkit prefix handling
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.continuous = true;        // Keep listening
recognition.interimResults = true;    // Show partial results
recognition.lang = 'en-US';

recognition.onresult = (event) => {
  const result = event.results[event.results.length - 1];
  const transcript = result[0].transcript;
  const isFinal = result.isFinal;
  // Handle transcript...
};
```

**WebXR Considerations**:
- Voice is primary input when immersed (no keyboard)
- May need wake word ("Hey Graphty...")
- Audio feedback via SpeechSynthesis for responses
- Ambient noise handling in VR/AR environments

**Decision**: Implement `VoiceInputAdapter` wrapping Web Speech API with WebXR-specific configuration options.

---

### Phase 5: API Key Security (BYOK Pattern)

#### User Feedback

> "There are definitely other projects that have solved the problem of secure API key storage. Are there design patterns we can follow or popular/maintained packages we can use instead of implementing our own solution?"

#### Research Findings

**Industry Standard: BYOK (Bring Your Own Key)**

Major tools using BYOK:
- [GitHub Copilot](https://github.blog/changelog/2025-11-20-enterprise-bring-your-own-key-byok-for-github-copilot-is-now-in-public-preview/)
- [JetBrains AI](https://blog.jetbrains.com/ai/2025/11/bring-your-own-key-byok-is-coming-soon-to-jetbrains-ai/)
- [Warp Terminal](https://docs.warp.dev/support-and-billing/plans-and-pricing/bring-your-own-api-key)

**BYOK Principles**:
1. Keys stored **locally on user's device**, never sent to our servers
2. Users control their own API costs and provider relationships
3. Data flows directly between user and their chosen provider
4. Privacy enhanced—we never see their queries or API usage

**Existing Packages for Encrypted Storage**:

| Package | Downloads/week | Features |
|---------|---------------|----------|
| `encrypt-storage` | 200K+ | AES encryption, TypeScript, localStorage/sessionStorage |
| `secure-ls` | 150K+ | Multiple encryption (AES, DES, RC4), compression |
| `react-secure-storage` | 50K+ | React-specific, browser-unique keys |
| `@randlabs/encrypted-local-storage` | 10K+ | IndexedDB + WebCrypto |

**Security Reality**:
> "Nothing on the front end is entirely secure. The library's proposal is to make it difficult for the user to see the data through the console, but as the secret key is on the front end, if the user searches hard enough, they will end up finding it."
> — encrypt-storage documentation

**Decision**:
1. **Default**: Session-only storage (keys lost on page close) - highest security
2. **Optional**: Encrypted localStorage via `encrypt-storage` package for user convenience
3. **Document trade-offs** clearly so users can make informed decisions
4. **Recommend WebLLM** for maximum privacy (no API keys needed)

#### Storage Strategy

| Strategy | Persistence | Security | Use Case |
|----------|-------------|----------|----------|
| Session-only (default) | Page session | Highest | Most users, WebXR |
| Encrypted localStorage | Browser | Medium | Repeat users who accept tradeoffs |
| Environment variables | Build time | N/A | Development only |

---

### Phase 6: UI Status for Wrapper Frameworks

#### User Feedback

> "We are going to want higher-level UI frameworks that are wrapping graphty-element to show status that an AI request is pending and the status of sending/receiving/applying the request in case it takes a few seconds."

#### Research Findings

**AWS Cloudscape GenAI Loading States Pattern**:

Two-stage loading model:
1. **Processing Stage**: AI received prompt, no output yet
2. **Generation Stage**: Output tokens being generated (streaming)

Key recommendations:
- Use avatar + loading text for processing stage
- Streaming creates typing effect for generation
- Avoid animations for < 1 second operations (jarring)
- Pair visual indicators with accessible text labels

**Vercel AI SDK useChat Status**:

```typescript
// useChat returns status with these values:
type Status = 'submitted' | 'streaming' | 'ready' | 'error';

// Plus error state and control functions:
const { status, error, stop, reload } = useChat();
```

**Loading Time Guidelines** (from research):

| Duration | Indicator Type | Recommendation |
|----------|---------------|----------------|
| < 1s | None or subtle | Avoid jarring animations |
| 1-3s | Typing indicator | Show avatar + "Thinking..." |
| 3s+ | Progress text | Show stage: "Analyzing graph...", "Generating response..." |
| 10s+ | Detailed progress | Show tool calls being executed |

**Decision**: Implement `AiStatus` object with state machine, expose via events and synchronous getter. Include timing, progress details, streaming content, tool call status, and control flags.

---

## Proposed Solution

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         User Interface Layer                            │
├─────────────────────┬─────────────────────┬────────────────────────────┤
│  TextInputAdapter   │  VoiceInputAdapter  │    (Future Adapters)       │
│  (text box, inline) │  (Web Speech API)   │                            │
└─────────┬───────────┴─────────┬───────────┴────────────────────────────┘
          │                     │
          ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     AiManager (Graph Integration)                       │
│  - Follows existing Manager pattern                                     │
│  - Owns AiController lifecycle                                          │
│  - Registers built-in commands                                          │
└─────────┬───────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     AiController (Orchestrator)                         │
│  - Manages conversation context                                         │
│  - Routes to appropriate LLM provider                                   │
│  - Handles streaming responses                                          │
│  - Coordinates command execution                                        │
│  - Manages AiStatus state machine                                       │
│  - Emits events for UI integration                                      │
└─────────┬───────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       LLM Provider Layer                                │
├──────────────┬──────────────┬──────────────┬───────────────────────────┤
│   OpenAI     │   Anthropic  │   Gemini     │   WebLLM (in-browser)     │
│   Provider   │   Provider   │   Provider   │   Provider                │
└──────────────┴──────────────┴──────────────┴───────────────────────────┘
          │                                    (All via Vercel AI SDK interface)
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     Command Execution Layer                             │
├─────────────────────────────────────────────────────────────────────────┤
│  CommandRegistry: Maps LLM tool calls → Graph operations                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  GraphCommand Interface                                          │   │
│  │  - name: string                                                  │   │
│  │  - description: string (for LLM context)                         │   │
│  │  - parameters: ZodSchema (for structured output)                 │   │
│  │  - examples: CommandExample[] (for few-shot prompting)           │   │
│  │  - execute(graph, params, context): Promise<CommandResult>       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Built-in Command Categories:                                           │
│  ├─ StyleCommands (findAndStyleNodes, findAndStyleEdges, clearStyles)  │
│  ├─ LayoutCommands (setLayout, setDimension)                           │
│  ├─ ModeCommands (setImmersiveMode for VR/AR)                          │
│  ├─ AlgorithmCommands (runAlgorithm, listAlgorithms)                   │
│  ├─ CameraCommands (setCameraPosition, zoomToFit, zoomToNodes, preset) │
│  ├─ DataCommands (loadData, addNodes, removeNodes, findNodes)          │
│  ├─ CaptureCommands (screenshot, video)                                │
│  └─ QueryCommands (getNodeCount, describeGraph, getNodeTypes)          │
└─────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     Existing Graph Infrastructure                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │ StyleManager │  │LayoutManager │  │ CameraManager│  ...             │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
│                              │                                          │
│                              ▼                                          │
│                   ┌──────────────────────┐                             │
│                   │ OperationQueueManager │                             │
│                   └──────────────────────┘                             │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### User Interface / API

#### Web Component Properties

```typescript
<graphty-element
  ai-enabled
  ai-provider="openai"
  ai-model="gpt-4o"
></graphty-element>
```

#### Programmatic API

```typescript
const graph = document.querySelector('graphty-element').graph;

// Enable AI with configuration
graph.enableAiControl({
  provider: 'openai',
  model: 'gpt-4o',
  streamThrottleMs: 50,  // Default: 50ms (matches Vercel AI SDK)
});

// Set API key (session-only by default)
graph.aiController.setApiKey('openai', 'sk-...');

// Optional: Enable encrypted persistence
graph.aiController.enableKeyPersistence({
  encryptionKey: 'user-provided-passphrase',
  storage: 'localStorage'
});

// Send a command
const result = await graph.aiCommand("Make all nodes with degree > 5 red and larger");

// Send command with streaming feedback
await graph.aiCommand("Highlight the shortest path from A to B", {
  onProgress: (status) => console.log(status.stageMessage),
  onComplete: (result) => console.log('Done:', result)
});

// Cancel in-progress command
graph.cancelAiCommand();

// Retry last failed command
graph.retryLastAiCommand();

// Voice input
graph.startVoiceInput({ language: 'en-US', continuous: true });
graph.stopVoiceInput();
graph.isVoiceActive();

// Register custom command
graph.registerAiCommand({
  name: 'customAnalysis',
  description: 'Run custom analysis on selected nodes',
  parameters: z.object({ nodeIds: z.array(z.string()) }),
  execute: async (graph, params) => { /* ... */ }
});
```

---

### Technical Architecture

#### Component Structure

```
src/
├── ai/
│   ├── index.ts                    # Public exports
│   ├── AiManager.ts                # Manager for Graph integration
│   ├── AiController.ts             # Main orchestrator
│   ├── AiStatus.ts                 # Status state machine
│   │
│   ├── providers/
│   │   ├── index.ts                # Provider registry
│   │   ├── types.ts                # LlmProvider interface
│   │   ├── VercelAiProvider.ts     # Wraps AI SDK for cloud providers
│   │   └── WebLlmProvider.ts       # In-browser inference
│   │
│   ├── commands/
│   │   ├── index.ts                # CommandRegistry
│   │   ├── types.ts                # GraphCommand interface
│   │   ├── StyleCommands.ts        # Style-related commands
│   │   ├── LayoutCommands.ts       # Layout commands
│   │   ├── AlgorithmCommands.ts    # Algorithm commands
│   │   ├── CameraCommands.ts       # Camera commands
│   │   ├── DataCommands.ts         # Data manipulation
│   │   ├── CaptureCommands.ts      # Screenshot/video
│   │   └── QueryCommands.ts        # Information queries
│   │
│   ├── input/
│   │   ├── index.ts                # Input adapter registry
│   │   ├── types.ts                # InputAdapter interface
│   │   ├── TextInputAdapter.ts     # Text-based input
│   │   └── VoiceInputAdapter.ts    # Web Speech API wrapper
│   │
│   ├── prompt/
│   │   ├── SystemPromptBuilder.ts  # Builds context-aware prompts
│   │   └── templates/              # Prompt template files
│   │
│   └── keys/
│       └── ApiKeyManager.ts        # BYOK key management with encrypt-storage
```

#### Key Interfaces

```typescript
// LLM Provider Interface
interface LlmProvider {
  readonly name: string;
  readonly supportsStreaming: boolean;
  readonly supportsTools: boolean;

  configure(options: ProviderOptions): void;

  generate(
    messages: Message[],
    tools: ToolDefinition[],
    options?: GenerateOptions
  ): Promise<LlmResponse>;

  generateStream(
    messages: Message[],
    tools: ToolDefinition[],
    callbacks: StreamCallbacks,
    signal?: AbortSignal
  ): Promise<void>;
}

// Graph Command Interface
interface GraphCommand {
  readonly name: string;
  readonly description: string;
  readonly parameters: ZodSchema;
  readonly examples: CommandExample[];

  execute(
    graph: Graph,
    params: Record<string, unknown>,
    context: CommandContext
  ): Promise<CommandResult>;
}

interface CommandResult {
  success: boolean;
  message: string;
  data?: unknown;
  affectedNodes?: string[];
  affectedEdges?: string[];
}

// AI Status (for UI frameworks)
interface AiStatus {
  state: 'ready' | 'submitted' | 'streaming' | 'executing' | 'error';

  // Timing
  startTime?: number;
  elapsed?: number;

  // Progress
  stage?: 'processing' | 'generating' | 'executing';
  stageMessage?: string;

  // Streaming content
  streamedText?: string;
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

// Supporting Interfaces

interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCallId?: string;      // For tool responses
  toolCalls?: ToolCall[];   // For assistant tool invocations
}

interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

interface ToolDefinition {
  name: string;
  description: string;
  parameters: ZodSchema;
  examples?: CommandExample[];
}

interface CommandExample {
  input: string;           // Natural language input
  params: Record<string, unknown>;  // Expected tool parameters
}

interface CommandContext {
  graph: Graph;
  abortSignal: AbortSignal;
  operationQueue: OperationQueueManager;
  emitEvent: (type: string, data: unknown) => void;
  updateStatus: (updates: Partial<AiStatus>) => void;
}

interface ProviderOptions {
  apiKey?: string;
  model?: string;
  baseUrl?: string;        // For custom endpoints
  maxTokens?: number;
  temperature?: number;
}

interface GenerateOptions {
  maxTokens?: number;
  temperature?: number;
  signal?: AbortSignal;
}

interface StreamCallbacks {
  onChunk: (text: string) => void;
  onToolCall: (name: string, params: unknown) => void;
  onToolResult: (name: string, result: unknown) => void;
  onComplete: (response: LlmResponse) => void;
  onError: (error: Error) => void;
}

interface LlmResponse {
  text: string;
  toolCalls: ToolCall[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

interface InputAdapter {
  readonly type: 'text' | 'voice';
  readonly isActive: boolean;

  start(options?: InputOptions): void;
  stop(): void;
  onInput(callback: (input: string, isFinal: boolean) => void): void;
}

interface VoiceInputOptions extends InputOptions {
  language?: string;       // e.g., 'en-US'
  continuous?: boolean;    // Keep listening after each phrase
  interimResults?: boolean; // Show partial transcripts

  // WebXR-specific
  wakeWord?: string;       // e.g., 'Hey Graphty'
  wakeWordTimeout?: number; // ms to wait for command after wake word
  enableTTS?: boolean;     // Speak responses back
}
```

#### Status State Machine

```
┌─────────┐  user input   ┌───────────┐  stream starts  ┌───────────┐
│  ready  │ ────────────► │ submitted │ ──────────────► │ streaming │
└─────────┘               └───────────┘                 └───────────┘
     ▲                          │                            │
     │                          │ error                      │ complete
     │                          ▼                            ▼
     │                    ┌───────────┐               ┌───────────┐
     └────────────────────│   error   │               │ executing │
     │                    └───────────┘               └───────────┘
     │                                                       │
     │                                                       │ done
     └───────────────────────────────────────────────────────┘
```

#### Events for UI Integration

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

#### Usage Example: React Wrapper Component

This example shows how a higher-level React framework would consume the AiStatus to display loading states following Cloudscape GenAI patterns:

```typescript
import { useState, useEffect } from 'react';
import type { Graph, AiStatus } from '@graphty/graphty-element';

function GraphWithAiStatus({ graph }: { graph: Graph }) {
  const [aiStatus, setAiStatus] = useState<AiStatus>({
    state: 'ready',
    canCancel: false
  });

  useEffect(() => {
    const handler = (event: { status: AiStatus }) => setAiStatus(event.status);
    graph.on('ai-status-change', handler);
    return () => graph.off('ai-status-change', handler);
  }, [graph]);

  return (
    <div className="graph-container">
      <GraphtyElement graph={graph} />

      {/* Processing stage: AI received request, generating response */}
      {aiStatus.state === 'submitted' && (
        <LoadingIndicator>
          <AiAvatar />
          <span>Processing your request...</span>
        </LoadingIndicator>
      )}

      {/* Generation stage: Streaming response with typing effect */}
      {aiStatus.state === 'streaming' && (
        <StreamingResponse>
          <AiAvatar pulse />
          <TypewriterText text={aiStatus.streamedText} />
          {aiStatus.canCancel && (
            <Button onClick={() => graph.cancelAiCommand()}>Stop</Button>
          )}
        </StreamingResponse>
      )}

      {/* Execution stage: Applying changes to graph */}
      {aiStatus.state === 'executing' && (
        <ExecutionProgress>
          <span>{aiStatus.stageMessage || 'Applying changes...'}</span>
          <ToolCallList calls={aiStatus.toolCalls} />
        </ExecutionProgress>
      )}

      {/* Error state with retry option */}
      {aiStatus.state === 'error' && (
        <ErrorMessage>
          <span>Something went wrong</span>
          {aiStatus.canRetry && (
            <Button onClick={() => graph.retryLastAiCommand()}>Retry</Button>
          )}
        </ErrorMessage>
      )}
    </div>
  );
}
```

#### Alternative: Synchronous Status Polling

For frameworks that prefer polling over events:

```typescript
// Synchronous getter (always returns current state)
const status = graph.getAiStatus();

// Check periodically or on user interaction
if (status.state === 'ready') {
  // Safe to send new command
}
```

#### Loading State Duration Guidelines

Based on [Cloudscape GenAI patterns](https://cloudscape.design/patterns/genai/genai-loading-states/):

| Duration | Indicator Type | `stageMessage` Example |
|----------|---------------|------------------------|
| < 1s | None or subtle | (no message) |
| 1-3s | Typing indicator | "Thinking..." |
| 3s+ | Progress text | "Analyzing graph structure..." |
| 10s+ | Detailed progress | "Running betweenness centrality algorithm..." |

The `AiStatus.stageMessage` is automatically updated based on elapsed time and current operation.

---

### LLM Prompt Design

#### System Prompt Structure

```typescript
const systemPrompt = `
You are an AI assistant that controls a graph visualization system called Graphty.
You help users manipulate and explore graph data through natural language commands.

## Available Commands (Tools)

${commandDescriptions}

## Current Graph State

- Node count: ${nodeCount}
- Edge count: ${edgeCount}
- Current layout: ${currentLayout}
- Current dimension: ${is2D ? '2D' : '3D'}
- Available node properties: ${availableProperties}
- Algorithm results available: ${algorithmResults}

## Command Guidelines

1. When users ask to style nodes/edges, use findAndStyleNodes/findAndStyleEdges
2. For queries about the graph, use query commands first to understand the data
3. For complex operations, break them into multiple commands
4. Always confirm understanding before destructive operations (removing nodes)
5. If a request is ambiguous, ask for clarification

## Style Selector Syntax (JMESPath)

Selectors evaluate against node/edge data objects:
- Empty string "" matches all
- "data.type == 'user'" matches nodes where data.type equals 'user'
- "algorithmResults.graphty.degree > 5" matches high-degree nodes
- "data.category == 'A' && algorithmResults.graphty.betweenness > 0.5" compound

## Response Format

- When executing commands, provide brief feedback about what was done
- When queries return information, summarize it naturally
- Be concise—users are often in immersive environments
`;
```

#### Example Tool Definitions

```typescript
const tools: ToolDefinition[] = [
  {
    name: 'findAndStyleNodes',
    description: 'Find nodes matching criteria and apply styles to them',
    parameters: z.object({
      selector: z.string().describe('JMESPath selector to match nodes'),
      style: z.object({
        color: z.string().optional().describe('Hex color like #ff0000'),
        size: z.number().optional().describe('Relative size multiplier'),
        shape: z.enum(['sphere', 'cube', 'cone', 'cylinder', 'torus']).optional(),
        opacity: z.number().min(0).max(1).optional(),
      }),
      layerName: z.string().optional().describe('Name for the style layer'),
    }),
    examples: [
      {
        input: 'Make all nodes with type "server" blue and larger',
        params: {
          selector: "data.type == 'server'",
          style: { color: '#0066cc', size: 1.5 },
          layerName: 'highlighted-servers'
        }
      },
      {
        input: 'Highlight high-degree nodes in red',
        params: {
          selector: "algorithmResults.graphty.degree > 10",
          style: { color: '#ff0000', size: 2.0 },
          layerName: 'high-degree-highlight'
        }
      }
    ]
  },

  {
    name: 'setLayout',
    description: 'Change the graph layout algorithm',
    parameters: z.object({
      type: z.enum(['ngraph', 'd3-force', 'circular', 'random', 'fixed',
                    'bfs', 'bipartite', 'kamada-kawai', 'spectral', 'shell',
                    'spiral', 'spring', 'forceAtlas2']),
      options: z.record(z.unknown()).optional(),
    }),
    examples: [
      { input: 'Switch to circular layout', params: { type: 'circular' } },
      { input: 'Use force-directed', params: { type: 'ngraph' } }
    ]
  },

  {
    name: 'runAlgorithm',
    description: 'Run a graph algorithm and store results on nodes/edges',
    parameters: z.object({
      namespace: z.string().describe('Algorithm namespace, usually "graphty"'),
      type: z.string().describe('Algorithm type like "degree", "betweenness", "pagerank"'),
    }),
    examples: [
      { input: 'Calculate degree centrality', params: { namespace: 'graphty', type: 'degree' } }
    ]
  },

  {
    name: 'setCameraPosition',
    description: 'Move the camera to a position or load a preset',
    parameters: z.object({
      position: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
      target: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
      preset: z.enum(['top', 'front', 'side', 'isometric']).optional(),
      animate: z.boolean().optional().default(true),
      duration: z.number().optional().default(1000),
    }),
    examples: [
      { input: 'Show from top', params: { preset: 'top', animate: true } },
      { input: 'Reset camera', params: { preset: 'isometric' } }
    ]
  },

  {
    name: 'captureScreenshot',
    description: 'Take a screenshot of the current view',
    parameters: z.object({
      format: z.enum(['png', 'jpeg']).optional().default('png'),
      download: z.boolean().optional().default(true),
    }),
  },

  {
    name: 'queryGraph',
    description: 'Query information about the graph structure and data',
    parameters: z.object({
      query: z.enum([
        'nodeCount', 'edgeCount', 'nodeTypes', 'edgeTypes',
        'highDegreeNodes', 'connectedComponents', 'availableAlgorithms',
        'currentLayout', 'availableProperties'
      ])
    }),
  },

  {
    name: 'setDimension',
    description: 'Switch between 2D and 3D visualization',
    parameters: z.object({
      dimension: z.enum(['2d', '3d']),
    }),
  },

  {
    name: 'setImmersiveMode',
    description: 'Enter or exit VR/AR immersive modes (WebXR)',
    parameters: z.object({
      mode: z.enum(['vr', 'ar', 'exit']).describe('VR for virtual reality, AR for augmented reality, exit to return to normal'),
    }),
    examples: [
      { input: 'Enter VR mode', params: { mode: 'vr' } },
      { input: 'Switch to AR', params: { mode: 'ar' } },
      { input: 'Exit immersive mode', params: { mode: 'exit' } }
    ]
  },

  {
    name: 'captureVideo',
    description: 'Record a video of the graph visualization',
    parameters: z.object({
      duration: z.number().describe('Duration in milliseconds'),
      fps: z.number().optional().default(30),
      cameraMode: z.enum(['stationary', 'animated']).optional().default('stationary'),
      download: z.boolean().optional().default(true),
    }),
    examples: [
      { input: 'Record a 5 second video', params: { duration: 5000, fps: 30 } },
      { input: 'Capture 10 seconds of animation', params: { duration: 10000 } }
    ]
  },

  {
    name: 'findNodes',
    description: 'Find and return information about nodes matching criteria',
    parameters: z.object({
      selector: z.string().describe('JMESPath selector to match nodes'),
      limit: z.number().optional().default(10).describe('Maximum nodes to return'),
    }),
    examples: [
      { input: 'Find all server nodes', params: { selector: "data.type == 'server'" } },
      { input: 'Show me the top 5 highest degree nodes', params: { selector: "algorithmResults.graphty.degree > 0", limit: 5 } }
    ]
  },

  {
    name: 'zoomToNodes',
    description: 'Zoom camera to focus on specific nodes',
    parameters: z.object({
      selector: z.string().optional().describe('JMESPath selector for nodes to focus on'),
      nodeIds: z.array(z.string()).optional().describe('Specific node IDs to focus on'),
      padding: z.number().optional().default(1.2).describe('Padding multiplier around nodes'),
      animate: z.boolean().optional().default(true),
    }),
    examples: [
      { input: 'Zoom to the selected nodes', params: { selector: "selected == true" } },
      { input: 'Focus on node ABC', params: { nodeIds: ['ABC'] } }
    ]
  },
];
```

---

### Complete Prompt Examples

This section shows the actual prompts sent to the LLM and expected responses for each command type. Understanding this flow is critical for implementation.

#### Prompt Structure Overview

Every request to the LLM follows this structure:

```
┌─────────────────────────────────────────────────────────────────┐
│ SYSTEM MESSAGE                                                  │
│ ├─ Role description                                             │
│ ├─ Available tools (JSON Schema from Zod)                       │
│ ├─ Current graph state (dynamic context)                        │
│ ├─ JMESPath selector syntax guide                               │
│ └─ Response guidelines                                          │
├─────────────────────────────────────────────────────────────────┤
│ USER MESSAGE                                                    │
│ └─ Natural language command from user                           │
├─────────────────────────────────────────────────────────────────┤
│ ASSISTANT RESPONSE                                              │
│ ├─ Tool call(s) with parameters                                 │
│ └─ Brief natural language confirmation                          │
├─────────────────────────────────────────────────────────────────┤
│ TOOL RESULT (fed back to LLM)                                   │
│ └─ JSON result from command execution                           │
├─────────────────────────────────────────────────────────────────┤
│ ASSISTANT FINAL RESPONSE                                        │
│ └─ Summary of what was done (shown to user)                     │
└─────────────────────────────────────────────────────────────────┘
```

#### Complete System Prompt Template

```typescript
// This is the full system prompt sent to the LLM
const systemPrompt = `You are Graphty AI, an assistant that controls a graph visualization system.
You help users manipulate and explore graph data through natural language commands.

## Your Capabilities

You have access to the following tools to control the graph:

### Styling
- **findAndStyleNodes**: Apply visual styles (color, size, shape) to nodes matching a selector
- **findAndStyleEdges**: Apply visual styles to edges matching a selector
- **clearStyles**: Remove a named style layer

### Layout & Dimensions
- **setLayout**: Change the graph layout algorithm (ngraph, circular, etc.)
- **setDimension**: Switch between 2D and 3D visualization
- **setImmersiveMode**: Enter VR/AR mode or exit to normal view

### Camera
- **setCameraPosition**: Move camera to coordinates or a preset view
- **zoomToNodes**: Focus camera on specific nodes
- **zoomToFit**: Fit all nodes in view (use setCameraPosition with no params)

### Algorithms
- **runAlgorithm**: Execute graph algorithms (degree, betweenness, pagerank, etc.)

### Data & Queries
- **queryGraph**: Get information about the graph (node count, types, etc.)
- **findNodes**: Find and return details about nodes matching criteria

### Capture
- **captureScreenshot**: Take a screenshot
- **captureVideo**: Record a video

## Current Graph State

- **Node count**: ${nodeCount}
- **Edge count**: ${edgeCount}
- **Current layout**: ${currentLayout}
- **Dimension**: ${is2D ? '2D' : '3D'}
- **Node properties available**: ${nodeProperties.join(', ')}
- **Edge properties available**: ${edgeProperties.join(', ')}
- **Algorithm results on nodes**: ${algorithmResults.join(', ') || 'none'}

## JMESPath Selector Syntax

Selectors are JMESPath expressions evaluated against each node/edge object:

| Selector | Matches |
|----------|---------|
| \`""\` | All nodes/edges |
| \`"data.type == 'server'"\` | Nodes where data.type is 'server' |
| \`"data.category == 'A'"\` | Nodes in category A |
| \`"algorithmResults.graphty.degree > 5"\` | High-degree nodes (after running degree algorithm) |
| \`"algorithmResults.graphty.pagerank > 0.1"\` | High PageRank nodes |
| \`"data.name == 'specific-node'"\` | A specific named node |
| \`"data.weight > 100 && data.active == true"\` | Compound conditions |

## Response Guidelines

1. **Be concise** - Users may be in VR/AR where long text is hard to read
2. **Confirm actions** - Briefly state what you did after each command
3. **Ask for clarification** if the request is ambiguous
4. **Use multiple tools** when needed to fulfill complex requests
5. **Query first** if you need information to complete a styling request

## Examples

User: "Make all server nodes red"
→ Use findAndStyleNodes with selector "data.type == 'server'" and color "#ff0000"

User: "Highlight the most connected nodes"
→ First run degree algorithm, then style nodes with high degree

User: "Show me from the top"
→ Use setCameraPosition with preset "top"
`;
```

---

#### Example 1: Styling Nodes - "Make all X nodes red"

**User Input:**
```
"Make all server nodes red"
```

**Complete Messages Sent to LLM:**

```json
{
  "messages": [
    {
      "role": "system",
      "content": "You are Graphty AI... [full system prompt above with current state]"
    },
    {
      "role": "user",
      "content": "Make all server nodes red"
    }
  ],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "findAndStyleNodes",
        "description": "Find nodes matching criteria and apply styles to them",
        "parameters": {
          "type": "object",
          "properties": {
            "selector": {
              "type": "string",
              "description": "JMESPath selector to match nodes"
            },
            "style": {
              "type": "object",
              "properties": {
                "color": { "type": "string" },
                "size": { "type": "number" },
                "shape": { "type": "string", "enum": ["sphere", "cube", "cone", "cylinder", "torus"] },
                "opacity": { "type": "number", "minimum": 0, "maximum": 1 }
              }
            },
            "layerName": {
              "type": "string",
              "description": "Name for the style layer"
            }
          },
          "required": ["selector", "style"]
        }
      }
    }
    // ... other tools
  ],
  "tool_choice": "auto"
}
```

**LLM Response:**

```json
{
  "role": "assistant",
  "content": null,
  "tool_calls": [
    {
      "id": "call_abc123",
      "type": "function",
      "function": {
        "name": "findAndStyleNodes",
        "arguments": "{\"selector\": \"data.type == 'server'\", \"style\": {\"color\": \"#ff0000\"}, \"layerName\": \"server-highlight\"}"
      }
    }
  ]
}
```

**Tool Execution Result (fed back to LLM):**

```json
{
  "role": "tool",
  "tool_call_id": "call_abc123",
  "content": "{\"success\": true, \"message\": \"Styled 12 nodes matching selector\", \"affectedNodes\": [\"server-1\", \"server-2\", ...]}"
}
```

**LLM Final Response (shown to user):**

```json
{
  "role": "assistant",
  "content": "Done! I've made all 12 server nodes red."
}
```

---

#### Example 2: Fit All Nodes on Screen

**User Input:**
```
"Fit all the nodes on the screen"
```

**Messages Sent:**

```json
{
  "messages": [
    { "role": "system", "content": "[system prompt]" },
    { "role": "user", "content": "Fit all the nodes on the screen" }
  ]
}
```

**LLM Response:**

```json
{
  "tool_calls": [
    {
      "id": "call_xyz789",
      "function": {
        "name": "zoomToNodes",
        "arguments": "{\"selector\": \"\", \"padding\": 1.2, \"animate\": true}"
      }
    }
  ]
}
```

**Tool Result:**

```json
{
  "tool_call_id": "call_xyz789",
  "content": "{\"success\": true, \"message\": \"Camera zoomed to fit all 150 nodes\"}"
}
```

**Final Response:**

```
"I've adjusted the camera to fit all 150 nodes in view."
```

---

#### Example 3: Change Camera Angle

**User Input:**
```
"Show me the graph from above"
```

**LLM Response:**

```json
{
  "tool_calls": [
    {
      "id": "call_cam001",
      "function": {
        "name": "setCameraPosition",
        "arguments": "{\"preset\": \"top\", \"animate\": true, \"duration\": 1000}"
      }
    }
  ]
}
```

**Final Response:**

```
"Switched to top-down view."
```

---

#### Example 4: Complex Query - "Highlight the most important nodes"

**User Input:**
```
"Highlight the most important nodes in the network"
```

This requires multiple steps: run an algorithm first, then style based on results.

**LLM Response (multiple tool calls):**

```json
{
  "tool_calls": [
    {
      "id": "call_alg001",
      "function": {
        "name": "runAlgorithm",
        "arguments": "{\"namespace\": \"graphty\", \"type\": \"pagerank\"}"
      }
    }
  ]
}
```

**Tool Result:**

```json
{
  "tool_call_id": "call_alg001",
  "content": "{\"success\": true, \"message\": \"PageRank computed for 150 nodes\"}"
}
```

**LLM Second Response:**

```json
{
  "tool_calls": [
    {
      "id": "call_style001",
      "function": {
        "name": "findAndStyleNodes",
        "arguments": "{\"selector\": \"algorithmResults.graphty.pagerank > 0.02\", \"style\": {\"color\": \"#ffaa00\", \"size\": 2.0}, \"layerName\": \"important-nodes\"}"
      }
    }
  ]
}
```

**Final Response:**

```
"I ran PageRank analysis and highlighted the 15 most important nodes in orange. These are the nodes with the highest influence in your network."
```

---

#### Example 5: Change Layout

**User Input:**
```
"Arrange the nodes in a circle"
```

**LLM Response:**

```json
{
  "tool_calls": [
    {
      "id": "call_layout001",
      "function": {
        "name": "setLayout",
        "arguments": "{\"type\": \"circular\"}"
      }
    }
  ]
}
```

**Final Response:**

```
"Switched to circular layout. The nodes are now arranged in a circle."
```

---

#### Example 6: Query Information

**User Input:**
```
"How many nodes are there?"
```

**LLM Response:**

```json
{
  "tool_calls": [
    {
      "id": "call_query001",
      "function": {
        "name": "queryGraph",
        "arguments": "{\"query\": \"nodeCount\"}"
      }
    }
  ]
}
```

**Tool Result:**

```json
{
  "tool_call_id": "call_query001",
  "content": "{\"success\": true, \"data\": {\"nodeCount\": 150}}"
}
```

**Final Response:**

```
"There are 150 nodes in the graph."
```

---

#### Example 7: Take a Screenshot

**User Input:**
```
"Take a screenshot"
```

**LLM Response:**

```json
{
  "tool_calls": [
    {
      "id": "call_capture001",
      "function": {
        "name": "captureScreenshot",
        "arguments": "{\"format\": \"png\", \"download\": true}"
      }
    }
  ]
}
```

**Final Response:**

```
"Screenshot captured and downloading."
```

---

#### Example 8: Enter VR Mode

**User Input:**
```
"Enter VR mode"
```

**LLM Response:**

```json
{
  "tool_calls": [
    {
      "id": "call_vr001",
      "function": {
        "name": "setImmersiveMode",
        "arguments": "{\"mode\": \"vr\"}"
      }
    }
  ]
}
```

**Final Response:**

```
"Entering VR mode. Put on your headset to view the graph in virtual reality."
```

---

#### Example 9: Find Specific Nodes

**User Input:**
```
"Find all nodes connected to the main server"
```

**LLM Response:**

```json
{
  "tool_calls": [
    {
      "id": "call_find001",
      "function": {
        "name": "findNodes",
        "arguments": "{\"selector\": \"data.connectedTo == 'main-server'\", \"limit\": 20}"
      }
    }
  ]
}
```

**Tool Result:**

```json
{
  "tool_call_id": "call_find001",
  "content": "{\"success\": true, \"data\": {\"nodes\": [{\"id\": \"client-1\", \"data\": {...}}, ...], \"total\": 8}}"
}
```

**Final Response:**

```
"Found 8 nodes connected to the main server: client-1, client-2, database-1, cache-1, worker-1, worker-2, worker-3, and load-balancer."
```

---

#### Example 10: Complex Styling with Algorithm

**User Input:**
```
"Color the nodes by their degree - low degree blue, high degree red"
```

**LLM Response (Step 1 - Run Algorithm):**

```json
{
  "tool_calls": [
    {
      "id": "call_deg001",
      "function": {
        "name": "runAlgorithm",
        "arguments": "{\"namespace\": \"graphty\", \"type\": \"degree\"}"
      }
    }
  ]
}
```

**LLM Response (Step 2 - Apply Gradient Styling):**

```json
{
  "tool_calls": [
    {
      "id": "call_low001",
      "function": {
        "name": "findAndStyleNodes",
        "arguments": "{\"selector\": \"algorithmResults.graphty.degree <= 2\", \"style\": {\"color\": \"#0066ff\"}, \"layerName\": \"degree-low\"}"
      }
    },
    {
      "id": "call_med001",
      "function": {
        "name": "findAndStyleNodes",
        "arguments": "{\"selector\": \"algorithmResults.graphty.degree > 2 && algorithmResults.graphty.degree <= 5\", \"style\": {\"color\": \"#ffff00\"}, \"layerName\": \"degree-medium\"}"
      }
    },
    {
      "id": "call_high001",
      "function": {
        "name": "findAndStyleNodes",
        "arguments": "{\"selector\": \"algorithmResults.graphty.degree > 5\", \"style\": {\"color\": \"#ff0000\"}, \"layerName\": \"degree-high\"}"
      }
    }
  ]
}
```

**Final Response:**

```
"Done! I've colored the nodes by degree:
• Blue: Low connectivity (≤2 connections) - 45 nodes
• Yellow: Medium connectivity (3-5 connections) - 80 nodes
• Red: High connectivity (>5 connections) - 25 nodes"
```

---

#### Example 11: Switch to 2D View

**User Input:**
```
"Show this in 2D"
```

**LLM Response:**

```json
{
  "tool_calls": [
    {
      "id": "call_2d001",
      "function": {
        "name": "setDimension",
        "arguments": "{\"dimension\": \"2d\"}"
      }
    }
  ]
}
```

**Final Response:**

```
"Switched to 2D view."
```

---

#### Example 12: Record Video

**User Input:**
```
"Record a 10 second video of the graph"
```

**LLM Response:**

```json
{
  "tool_calls": [
    {
      "id": "call_vid001",
      "function": {
        "name": "captureVideo",
        "arguments": "{\"duration\": 10000, \"fps\": 30, \"cameraMode\": \"stationary\", \"download\": true}"
      }
    }
  ]
}
```

**Final Response:**

```
"Recording 10 seconds of video... Done! The video is downloading."
```

---

#### Example 13: Focus on Specific Nodes

**User Input:**
```
"Zoom in on the database nodes"
```

**LLM Response:**

```json
{
  "tool_calls": [
    {
      "id": "call_zoom001",
      "function": {
        "name": "zoomToNodes",
        "arguments": "{\"selector\": \"data.type == 'database'\", \"padding\": 1.5, \"animate\": true}"
      }
    }
  ]
}
```

**Final Response:**

```
"Zoomed in on the 3 database nodes."
```

---

#### Example 14: Clear Previous Styling

**User Input:**
```
"Remove the highlighting from the server nodes"
```

**LLM Response:**

```json
{
  "tool_calls": [
    {
      "id": "call_clear001",
      "function": {
        "name": "clearStyles",
        "arguments": "{\"layerName\": \"server-highlight\"}"
      }
    }
  ]
}
```

**Final Response:**

```
"Removed the server node highlighting."
```

---

#### Example 15: Ambiguous Request - LLM Asks for Clarification

**User Input:**
```
"Highlight the important ones"
```

**LLM Response (no tool call, asks for clarification):**

```json
{
  "content": "I can highlight important nodes in several ways:\n\n1. **By connectivity** - Nodes with many connections (degree centrality)\n2. **By influence** - Nodes that are central to information flow (betweenness)\n3. **By PageRank** - Nodes linked by other important nodes\n4. **By type** - A specific category of nodes\n\nWhich would you prefer, or should I use PageRank as a general measure of importance?"
}
```

---

#### Error Handling Example

**User Input:**
```
"Make the purple nodes bigger"
```

**Tool Result (no nodes matched):**

```json
{
  "tool_call_id": "call_err001",
  "content": "{\"success\": false, \"message\": \"No nodes matched selector 'data.color == purple'. Available node types: server, client, database, cache\"}"
}
```

**LLM Final Response:**

```
"I couldn't find any purple nodes. The available node types in your graph are: server, client, database, and cache. Would you like to style one of those instead?"
```

---

### Implementation Approach

#### Phase 1: Core Infrastructure (Foundation)

1. Create `AiManager` following existing Manager pattern with `init()` and `dispose()`
2. Implement `AiController` with basic orchestration and AiStatus state machine
3. Set up `CommandRegistry` with registration pattern matching LayoutEngine/Algorithm
4. Implement `LlmProvider` interface
5. Create `VercelAiProvider` wrapping AI SDK for OpenAI support
6. Implement `ApiKeyManager` with session-only storage (default)

#### Phase 2: Command Framework

1. Define `GraphCommand` interface and base class
2. Implement core commands:
   - `StyleCommands`: findAndStyleNodes, findAndStyleEdges, clearStyles
   - `LayoutCommands`: setLayout, setDimension
   - `ModeCommands`: setImmersiveMode (VR/AR/exit)
   - `CameraCommands`: setCameraPosition, zoomToFit, zoomToNodes, loadPreset
   - `QueryCommands`: getNodeCount, describeGraph, findNodes
3. Build `SystemPromptBuilder` with dynamic context injection
4. Create comprehensive tool definitions with Zod schemas
5. Wire commands to existing Graph methods via OperationQueueManager

#### Phase 3: Additional Providers

1. Add Anthropic support via `@ai-sdk/anthropic`
2. Add Gemini support via `@ai-sdk/google`
3. Implement `WebLlmProvider` for in-browser inference (lazy-loaded)
4. Add provider auto-selection based on key availability

#### Phase 4: Input Adapters

1. Implement `TextInputAdapter` with streaming support
2. Implement `VoiceInputAdapter` wrapping Web Speech API
3. Add voice configuration options (language, continuous mode)
4. Handle browser compatibility (webkit prefix, feature detection)

#### Phase 5: Advanced Features

1. Implement `AlgorithmCommands` (run, list, describe algorithms)
2. Implement `CaptureCommands` (screenshot, video)
3. Add conversation history management for multi-turn
4. Integrate `encrypt-storage` for optional key persistence
5. Add command confirmation for destructive operations

#### Phase 6: Polish & Documentation

1. Create comprehensive Storybook examples
2. Write API documentation
3. Add error recovery and retry logic
4. Performance optimization for streaming (throttling)
5. Unit and integration tests

---

## Implementation Guidance

This section provides additional detail for implementing the design.

### Provider Auto-Selection Logic

When no explicit provider is specified, auto-select based on available keys:

```typescript
function autoSelectProvider(keyManager: ApiKeyManager): string {
  // Priority order: user preference > cloud providers > in-browser
  const priority = ['openai', 'anthropic', 'google', 'webllm'];

  for (const provider of priority) {
    if (provider === 'webllm') {
      // WebLLM doesn't need a key, always available as fallback
      return 'webllm';
    }
    if (keyManager.getKey(provider)) {
      return provider;
    }
  }

  // No keys configured, default to WebLLM
  return 'webllm';
}
```

### Batch Operations for Complex Commands

Commands that modify multiple aspects of the graph should use batch mode to ensure atomic updates and proper event sequencing:

```typescript
// Inside a command's execute() method
async execute(graph: Graph, params: Params, context: CommandContext): Promise<CommandResult> {
  // Use batch for multi-step operations
  await graph.batchOperations(async () => {
    // Step 1: Run algorithm
    await graph.runAlgorithm('graphty', 'degree');

    // Step 2: Apply styles based on results
    await graph.setStyleTemplate({
      layers: [{
        node: {
          selector: 'algorithmResults.graphty.degree > 5',
          style: { color: params.highlightColor }
        }
      }]
    });
  });

  return { success: true, message: 'Applied styling based on degree centrality' };
}
```

### Error Categories

AI errors should include context categories matching the existing codebase pattern:

```typescript
type AiErrorContext =
  | 'provider-init'      // Failed to initialize LLM provider
  | 'provider-generate'  // LLM generation failed
  | 'command-validation' // Zod validation failed on LLM output
  | 'command-execution'  // Command execute() threw
  | 'voice-recognition'  // Web Speech API error
  | 'key-storage';       // API key storage/retrieval error

interface AiError extends Error {
  context: AiErrorContext;
  canRetry: boolean;
  originalError?: Error;
}
```

### Converting GraphCommand to ToolDefinition

The CommandRegistry should convert registered commands to LLM tool definitions:

```typescript
class CommandRegistry {
  private commands = new Map<string, GraphCommand>();

  register(command: GraphCommand): void {
    this.commands.set(command.name, command);
  }

  // Convert all commands to tool definitions for LLM
  toToolDefinitions(): ToolDefinition[] {
    return Array.from(this.commands.values()).map(cmd => ({
      name: cmd.name,
      description: cmd.description,
      parameters: cmd.parameters,
      examples: cmd.examples,
    }));
  }

  // Get command by name (called when LLM invokes a tool)
  get(name: string): GraphCommand | undefined {
    return this.commands.get(name);
  }
}
```

### Testing with Mock Provider

For deterministic testing, implement a mock provider:

```typescript
class MockLlmProvider implements LlmProvider {
  readonly name = 'mock';
  readonly supportsStreaming = true;
  readonly supportsTools = true;

  private responses: Map<string, LlmResponse> = new Map();

  // Configure expected responses for testing
  setResponse(inputPattern: string, response: LlmResponse): void {
    this.responses.set(inputPattern, response);
  }

  async generate(messages: Message[], tools: ToolDefinition[]): Promise<LlmResponse> {
    const lastMessage = messages[messages.length - 1];
    const input = lastMessage.content;

    // Find matching response
    for (const [pattern, response] of this.responses) {
      if (input.includes(pattern)) {
        return response;
      }
    }

    // Default: return empty response
    return { text: '', toolCalls: [] };
  }

  async generateStream(
    messages: Message[],
    tools: ToolDefinition[],
    callbacks: StreamCallbacks
  ): Promise<void> {
    const response = await this.generate(messages, tools);

    // Simulate streaming
    for (const char of response.text) {
      callbacks.onChunk(char);
      await new Promise(r => setTimeout(r, 10));
    }

    for (const call of response.toolCalls) {
      callbacks.onToolCall(call.name, call.arguments);
    }

    callbacks.onComplete(response);
  }
}
```

### File Creation Order

For implementation, create files in this order to satisfy dependencies:

```
Phase 1 (no dependencies):
1. src/ai/commands/types.ts          # GraphCommand, CommandResult interfaces
2. src/ai/providers/types.ts         # LlmProvider, Message interfaces
3. src/ai/AiStatus.ts                # AiStatus interface and state machine
4. src/ai/keys/ApiKeyManager.ts      # BYOK key management

Phase 2 (depends on Phase 1):
5. src/ai/commands/index.ts          # CommandRegistry
6. src/ai/providers/index.ts         # Provider registry
7. src/ai/providers/VercelAiProvider.ts
8. src/ai/prompt/SystemPromptBuilder.ts

Phase 3 (depends on Phase 2):
9. src/ai/AiController.ts            # Main orchestrator
10. src/ai/AiManager.ts              # Graph integration

Phase 4 (depends on Phase 3):
11. src/ai/commands/StyleCommands.ts
12. src/ai/commands/LayoutCommands.ts
13. src/ai/commands/ModeCommands.ts       # VR/AR/exit immersive
14. src/ai/commands/CameraCommands.ts
15. src/ai/commands/QueryCommands.ts
16. src/ai/commands/AlgorithmCommands.ts
17. src/ai/commands/CaptureCommands.ts
18. src/ai/commands/DataCommands.ts

Phase 5 (can be parallel):
19. src/ai/input/VoiceInputAdapter.ts
20. src/ai/providers/WebLlmProvider.ts
```

### Integration with Graph.ts

Add these methods to Graph.ts (the central orchestrator):

```typescript
// In Graph.ts

private aiManager?: AiManager;

// Called during graph initialization if AI is enabled
private async initAi(config: AiConfig): Promise<void> {
  this.aiManager = new AiManager();
  await this.aiManager.init(this.context, config);
}

// Public API methods delegate to AiManager
async aiCommand(input: string, options?: CommandOptions): Promise<CommandResult> {
  if (!this.aiManager) {
    throw new Error('AI not enabled. Call enableAiControl() first.');
  }
  return this.aiManager.execute(input, options);
}

enableAiControl(config: AiConfig): void {
  this.initAi(config);
}

disableAiControl(): void {
  this.aiManager?.dispose();
  this.aiManager = undefined;
}

getAiStatus(): AiStatus {
  return this.aiManager?.getStatus() ?? { state: 'ready', canCancel: false };
}

// Voice methods
startVoiceInput(options?: VoiceInputOptions): void {
  this.aiManager?.startVoice(options);
}

stopVoiceInput(): void {
  this.aiManager?.stopVoice();
}

isVoiceActive(): boolean {
  return this.aiManager?.isVoiceActive() ?? false;
}

cancelAiCommand(): void {
  this.aiManager?.cancel();
}

retryLastAiCommand(): Promise<CommandResult> {
  if (!this.aiManager) {
    throw new Error('AI not enabled');
  }
  return this.aiManager.retry();
}

registerAiCommand(command: GraphCommand): void {
  this.aiManager?.registerCommand(command);
}
```

### Conversation History Management

For multi-turn conversations, maintain a sliding window of messages:

```typescript
class ConversationHistory {
  private messages: Message[] = [];
  private maxMessages = 20;  // Keep last 20 messages

  add(message: Message): void {
    this.messages.push(message);

    // Trim to max, but always keep system message
    while (this.messages.length > this.maxMessages) {
      const firstNonSystem = this.messages.findIndex(m => m.role !== 'system');
      if (firstNonSystem > 0) {
        this.messages.splice(firstNonSystem, 1);
      } else {
        break;
      }
    }
  }

  getMessages(): Message[] {
    return [...this.messages];
  }

  clear(): void {
    // Keep only system message
    this.messages = this.messages.filter(m => m.role === 'system');
  }

  // Called when graph state changes significantly
  invalidateContext(): void {
    // Mark that context may be stale, rebuild system prompt
    const systemIdx = this.messages.findIndex(m => m.role === 'system');
    if (systemIdx >= 0) {
      this.messages.splice(systemIdx, 1);
    }
  }
}
```

---

## Acceptance Criteria

### Core Functionality

- [ ] Can send natural language commands and receive appropriate graph updates
- [ ] Multiple LLM providers work with identical user experience (OpenAI, Anthropic, Gemini)
- [ ] In-browser LLM (WebLLM) works offline after model download
- [ ] Voice input works in Chrome/Edge with Web Speech API
- [ ] API keys can be set programmatically (session-only by default)
- [ ] Optional encrypted persistence works with user-provided passphrase

### Command Coverage

- [ ] Can style nodes by selector: "make all nodes with type X red"
- [ ] Can style edges by selector: "make edges between type A and B thicker"
- [ ] Can change layouts: "switch to circular layout"
- [ ] Can switch dimensions: "show this in 2D"
- [ ] Can enter/exit VR/AR modes: "enter VR mode" / "switch to AR" / "exit immersive"
- [ ] Can control camera: "zoom in on node X" / "show from top"
- [ ] Can zoom to specific nodes: "focus on the high-degree nodes"
- [ ] Can run algorithms: "calculate betweenness centrality"
- [ ] Can capture screenshot: "take a screenshot"
- [ ] Can capture video: "record a 5 second video"
- [ ] Can query graph: "how many nodes are there?" / "what types exist?"
- [ ] Can find nodes: "find all server nodes"

### UI Integration

- [ ] `AiStatus` object provides all necessary state for UI
- [ ] `ai-status-change` event fires on every state transition
- [ ] Status includes timing, progress, streaming content, tool calls
- [ ] Streaming updates are throttled (default 50ms)
- [ ] `canCancel` flag correctly reflects cancellability
- [ ] `canRetry` flag correctly reflects retry possibility after errors

### User Experience

- [ ] Streaming responses show progress/thinking state
- [ ] Errors provide helpful feedback (not raw stack traces)
- [ ] Commands can be cancelled mid-execution
- [ ] Voice transcription shows interim results
- [ ] Loading indicators follow duration guidelines (1s, 3s, 10s thresholds)

### Extensibility

- [ ] Custom commands can be registered via `registerAiCommand()`
- [ ] Custom providers can be added via provider interface
- [ ] Prompt templates can be customized
- [ ] All commands validate inputs via Zod schemas

---

## Technical Considerations

### Performance

| Concern | Impact | Mitigation |
|---------|--------|------------|
| LLM Latency | 1-5s for cloud providers | Use streaming to show progress immediately |
| WebLLM Download | 1-4GB initial download | Show progress, cache in IndexedDB |
| Command Execution | Varies by operation | Use existing operation queue with priorities |
| Stream Events | Can fire rapidly | Built-in throttling (50ms default) |
| Voice Processing | Network latency | Show interim results, allow editing |

### Security

| Concern | Risk Level | Mitigation |
|---------|------------|------------|
| API Key Exposure | Medium | Session-only default, encrypted optional, clear documentation |
| Prompt Injection | Medium | Validate all LLM outputs via Zod schemas before execution |
| Data Privacy | Low-Medium | WebLLM option keeps all data local |
| XSS via LLM output | Low | Sanitize any user-visible content from LLM |

### Compatibility

| Area | Approach |
|------|----------|
| Browser Support | Voice requires Chrome/Edge; text commands work everywhere |
| Babylon.js | No changes to existing integration |
| Existing APIs | All commands use existing Graph public API |
| Breaking Changes | None—AI features are additive and optional |
| TypeScript | Full type safety with strict mode |

### Testing Strategy

| Type | Coverage |
|------|----------|
| Unit Tests | Command execution logic, provider interfaces, prompt building, status state machine |
| Integration Tests | Full flow from input to graph update |
| Mock Providers | Test with deterministic mock LLM responses |
| Visual Tests | Storybook stories for voice UI components |
| E2E Tests | Playwright tests for complete user flows |

---

## Risks and Mitigation

### Risk: LLM Response Quality

**Description**: LLMs may generate invalid commands, wrong selectors, or misunderstand user intent.

**Mitigation**:
- Strict Zod schema validation on all tool outputs—invalid responses rejected
- Comprehensive examples in tool definitions for few-shot learning
- Fallback prompts asking for clarification when intent unclear
- User confirmation for destructive operations (removing nodes)
- Option to preview command before execution

### Risk: Provider API Changes

**Description**: OpenAI, Anthropic, etc. may change their APIs breaking integration.

**Mitigation**:
- Vercel AI SDK abstracts provider differences—they handle compatibility
- Pin dependency versions for stability
- Comprehensive test suite catches regressions
- Provider interface allows quick adaptation if needed

### Risk: WebLLM Performance

**Description**: In-browser LLMs may be too slow or consume too much memory on lower-end devices.

**Mitigation**:
- Document minimum hardware requirements
- Offer quantized model options (smaller but faster)
- Graceful degradation to cloud providers
- Memory usage monitoring and warnings
- Lazy-load WebLLM to avoid bundle impact

### Risk: Voice Recognition Accuracy

**Description**: Web Speech API may misrecognize technical terms, node names, graph terminology.

**Mitigation**:
- Show interim transcripts for user correction
- Allow manual editing of transcript before execution
- Custom vocabulary hints where API supports it
- Fallback to text input always available
- Consider text-to-speech confirmation in WebXR

### Risk: Scope Creep

**Description**: Feature could grow unbounded with more commands, providers, and adapters.

**Mitigation**:
- Clear command interface makes additions isolated
- Phase-based implementation with defined checkpoints
- Core commands prioritized; advanced features in later phases
- Registry pattern keeps system modular

### Risk: Key Storage Security Perception

**Description**: Users may overestimate security of encrypted localStorage.

**Mitigation**:
- Session-only storage as default (highest security)
- Clear documentation about trade-offs
- Recommend WebLLM for maximum privacy
- Never claim "secure"—use "encrypted" and explain limitations

---

## Future Enhancements

1. **Multi-Turn Conversations**: Track conversation context for follow-up commands ("now make those nodes bigger")

2. **Command Macros**: Save sequences of commands as reusable macros ("run my analysis pipeline")

3. **Natural Language Queries**: Answer complex questions about graph structure ("what's the most connected node?", "are there any isolated clusters?")

4. **Autonomous Exploration**: AI suggests interesting patterns or anomalies in the data

5. **Voice Feedback (TTS)**: Speak responses back to user in WebXR mode via SpeechSynthesis

6. **Custom Model Fine-Tuning**: Fine-tune in-browser models on domain-specific vocabulary

7. **Collaborative AI**: Share AI sessions between multiple users viewing same graph

8. **Command History & Undo**: Track AI commands with full undo/redo support

9. **Visual Command Builder**: UI that shows what the AI understood and will execute before running

10. **Plugin Marketplace**: Community-contributed command packs for specific domains (biology, social networks, infrastructure)

---

## Dependencies

### Required Dependencies

```json
{
  "ai": "^4.0.0",                    // Vercel AI SDK core
  "@ai-sdk/openai": "^1.0.0",        // OpenAI provider
  "@ai-sdk/anthropic": "^1.0.0",     // Anthropic provider
  "@ai-sdk/google": "^1.0.0",        // Google/Gemini provider
  "zod": "^3.23.0",                  // Already in project
  "encrypt-storage": "^2.12.0"       // AES encryption for optional persistence
}
```

### Optional Dependencies

```json
{
  "@mlc-ai/web-llm": "^0.2.0"        // In-browser LLM (lazy loaded)
}
```

### Browser APIs Used

- `SpeechRecognition` / `webkitSpeechRecognition` — Voice input
- `SpeechSynthesis` — Optional TTS feedback for WebXR
- `IndexedDB` — WebLLM model caching
- `localStorage` / `sessionStorage` — API key persistence via encrypt-storage

---

## Implementation Estimate

| Phase | Description | Estimate |
|-------|-------------|----------|
| Phase 1 | Core infrastructure (AiManager, AiController, providers) | 3-4 days |
| Phase 2 | Command framework and basic commands | 4-5 days |
| Phase 3 | Additional providers (Anthropic, Gemini, WebLLM) | 2-3 days |
| Phase 4 | Input adapters (text, voice) | 2-3 days |
| Phase 5 | Advanced features (algorithms, capture, history) | 3-4 days |
| Phase 6 | Polish, documentation, testing | 3-4 days |
| **Total** | | **17-23 days** |

---

## Sources

### LLM Integration
- [Vercel AI SDK Documentation](https://ai-sdk.dev/docs/introduction)
- [Vercel AI SDK Chatbot UI Guide](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot) — Status states, streaming, error handling
- [WebLLM - In-Browser LLM Inference](https://github.com/mlc-ai/web-llm)
- [ModelFusion - TypeScript AI Library](https://github.com/vercel/modelfusion)

### BYOK Pattern & API Key Security
- [GitHub Copilot BYOK Announcement](https://github.blog/changelog/2025-11-20-enterprise-bring-your-own-key-byok-for-github-copilot-is-now-in-public-preview/)
- [JetBrains AI BYOK](https://blog.jetbrains.com/ai/2025/11/bring-your-own-key-byok-is-coming-soon-to-jetbrains-ai/)
- [Warp BYOK Documentation](https://docs.warp.dev/support-and-billing/plans-and-pricing/bring-your-own-api-key)
- [Why BYOK is Better for AI Apps](https://medium.com/@sebastienb/why-is-byok-better-for-ai-related-apps-9941ba1c27aa)
- [OpenAI API Key Best Practices](https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety)
- [encrypt-storage npm package](https://www.npmjs.com/package/encrypt-storage)
- [secure-ls npm package](https://www.npmjs.com/package/secure-ls)

### Voice Input
- [Web Speech API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Chrome Voice-Driven Web Apps](https://developer.chrome.com/blog/voice-driven-web-apps-introduction-to-the-web-speech-api)
- [SpeechRecognition API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition)

### UI/UX for AI Loading States
- [AWS Cloudscape GenAI Loading States](https://cloudscape.design/patterns/genai/genai-loading-states/) — Two-stage loading model, streaming indicators
- [Nine UX Best Practices for AI Chatbots](https://www.mindtheproduct.com/deep-dive-ux-best-practices-for-ai-chatbots/)
- [Chatbot UX Design Guide 2025](https://www.parallelhq.com/blog/chatbot-ux-design)
- [UX Design Patterns for Loading](https://www.pencilandpaper.io/articles/ux-pattern-analysis-loading-feedback)
