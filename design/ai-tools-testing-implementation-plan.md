# Implementation Plan: AI Tools LLM Regression Testing

## Overview

This plan details the implementation of an automated LLM regression testing framework that verifies real LLM providers (OpenAI) correctly call our graph commands. The tests will run actual LLM API calls to ensure tool calling works correctly, catching regressions in prompt engineering, tool definitions, and parameter parsing.

**Key Deliverable**: A Vitest-based test harness that sends prompts to OpenAI's `gpt-4o-mini` and verifies the correct tools are called with appropriate parameters.

---

## Phase Breakdown

### Phase 1: Test Infrastructure Foundation

**Objective**: Create the core test harness, Vitest configuration, and environment variable handling for LLM regression tests.

**Tests to Write First**:

- `test/ai/llm-regression/harness.test.ts`: Unit tests for the harness itself
  ```typescript
  describe("LlmRegressionTestHarness", () => {
    it("creates harness with default configuration");
    it("configures OpenAI provider from environment");
    it("skips tests gracefully when API key not available");
    it("tracks tool calls made during execution");
    it("measures latency for each prompt");
    it("captures token usage from responses");
  });
  ```

**Implementation**:

- `test/helpers/llm-regression-harness.ts`: Core harness class
  ```typescript
  interface LlmRegressionResult {
    prompt: string;
    toolWasCalled: boolean;
    toolName: string | null;
    toolParams: Record<string, unknown> | null;
    commandResult: CommandResult | null;
    llmText: string | null;
    latencyMs: number;
    tokenUsage?: { prompt: number; completion: number };
    error?: Error;
  }

  interface LlmRegressionTestHarnessOptions {
    graphData: TestGraphFixture;
    provider?: "openai"; // Start with OpenAI only
    model?: string; // Default: "gpt-4o-mini"
    temperature?: number; // Default: 0 for determinism
  }

  class LlmRegressionTestHarness {
    static async create(options: LlmRegressionTestHarnessOptions): Promise<LlmRegressionTestHarness>;
    async testPrompt(prompt: string, expectations?: TestExpectations): Promise<LlmRegressionResult>;
    dispose(): void;
  }
  ```

- `test/helpers/llm-regression-env.ts`: Environment variable utilities
  ```typescript
  function getOpenAiApiKey(): string | undefined;
  function isLlmRegressionEnabled(): boolean;
  function skipIfNoApiKey(context: TestContext): void;
  ```

- Update `vitest.config.ts`: Add `llm-regression` project configuration
  ```typescript
  {
    test: {
      name: "llm-regression",
      include: ["test/ai/llm-regression/**/*.llm-regression.ts"],
      testTimeout: 60000, // LLM calls are slow
      hookTimeout: 30000,
      pool: "forks",
      maxConcurrency: 1, // Sequential to avoid rate limits
    },
  }
  ```

- Update `package.json`: Add npm scripts
  ```json
  {
    "test:llm-regression": "vitest run --project llm-regression",
    "test:llm-regression:watch": "vitest --project llm-regression"
  }
  ```

**Dependencies**:
- External: None (uses existing `@ai-sdk/openai`, `ai`, `vitest`)
- Internal: `VercelAiProvider`, `AiController`, `CommandRegistry`, `createMockGraphWithCustomData`

**Verification**:
1. Run: `npm run test:llm-regression`
2. Without `VITE_OPENAI_API_KEY`: Tests skip with informative message
3. With `VITE_OPENAI_API_KEY`: Harness unit tests pass

---

### Phase 2: Query Commands LLM Tests

**Objective**: Verify LLMs correctly call `queryGraph`, `findNodes`, and schema-related tools.

**Tests to Write First**:

- `test/ai/llm-regression/query-commands.llm-regression.ts`:
  ```typescript
  describe("Query Commands LLM Regression", () => {
    describe("queryGraph", () => {
      it("calls queryGraph for 'How many nodes are there?'", async () => {
        const result = await harness.testPrompt("How many nodes are there?");
        assert.ok(result.toolWasCalled);
        assert.strictEqual(result.toolName, "queryGraph");
        assert.deepInclude(result.toolParams, { query: "nodeCount" });
      });

      it("calls queryGraph for 'How many edges exist?'");
      it("calls queryGraph for 'What layout is being used?'");
      it("calls queryGraph for 'Give me a summary of the graph'");
    });

    describe("findNodes", () => {
      it("calls findNodes for 'Find all server nodes'");
      it("calls findNodes for 'Show nodes with type database'");
    });

    describe("sampleData", () => {
      it("calls sampleData for 'Show me some example nodes'");
      it("calls sampleData for 'Show 5 sample edges'");
    });

    describe("describeProperty", () => {
      it("calls describeProperty for 'What values does type have?'");
      it("calls describeProperty for 'Analyze the weight property on edges'");
    });
  });
  ```

**Implementation**:

- `test/ai/llm-regression/fixtures/test-graph-fixtures.ts`: Shared test data
  ```typescript
  export const serverNetworkFixture: TestGraphFixture = {
    nodes: [
      { id: "1", data: { type: "server", name: "web-01", status: "online" } },
      { id: "2", data: { type: "server", name: "db-01", status: "online" } },
      { id: "3", data: { type: "database", name: "postgres", status: "online" } },
      { id: "4", data: { type: "client", name: "app-01", status: "offline" } },
    ],
    edges: [
      { source: "1", target: "2", data: { weight: 0.8, latency: 5 } },
      { source: "2", target: "3", data: { weight: 1.0, latency: 2 } },
      { source: "4", target: "1", data: { weight: 0.3, latency: 100 } },
    ],
  };
  ```

**Dependencies**:
- Phase 1 complete
- Internal: `queryGraph`, `findNodes`, `sampleData`, `describeProperty` commands

**Verification**:
1. Run: `npm run test:llm-regression`
2. All query command tests pass (may have 1-2 flaky tests due to LLM variability)
3. Token usage logged shows reasonable consumption (~500-1000 tokens per test)

---

### Phase 3: Style Commands LLM Tests

**Objective**: Verify LLMs correctly call styling commands with appropriate selectors and style parameters.

**Tests to Write First**:

- `test/ai/llm-regression/style-commands.llm-regression.ts`:
  ```typescript
  describe("Style Commands LLM Regression", () => {
    describe("findAndStyleNodes", () => {
      it("calls findAndStyleNodes for 'Make all nodes red'", async () => {
        const result = await harness.testPrompt("Make all nodes red");
        assert.ok(result.toolWasCalled);
        assert.strictEqual(result.toolName, "findAndStyleNodes");
        // Flexible assertion - color could be "red", "#ff0000", "#FF0000", etc.
        assert.ok(result.toolParams?.style?.color);
      });

      it("calls findAndStyleNodes for 'Highlight server nodes in blue'");
      it("calls findAndStyleNodes for 'Make nodes bigger'");
      it("calls findAndStyleNodes for 'Make database nodes green and larger'");
    });

    describe("findAndStyleEdges", () => {
      it("calls findAndStyleEdges for 'Make all edges green'");
      it("calls findAndStyleEdges for 'Make high-weight edges thicker'");
      it("calls findAndStyleEdges for 'Color edges with latency > 50 as red'");
    });

    describe("clearStyles", () => {
      it("calls clearStyles for 'Remove all styling'");
      it("calls clearStyles for 'Clear the highlight style'");
    });
  });
  ```

**Implementation**:

- Extend `test/ai/llm-regression/fixtures/test-graph-fixtures.ts` if needed
- Add flexible assertion helpers to harness:
  ```typescript
  // Helper for color matching (accepts various formats)
  function isColorMatch(actual: unknown, expected: string): boolean;

  // Helper for partial object matching
  function includesParams(actual: Record<string, unknown>, expected: Partial<Record<string, unknown>>): boolean;
  ```

**Dependencies**:
- Phase 1, Phase 2 complete
- Internal: `findAndStyleNodes`, `findAndStyleEdges`, `clearStyles` commands

**Verification**:
1. Run: `npm run test:llm-regression`
2. Style command tests pass with flexible color/size matching
3. Selectors are reasonably formed (e.g., `type == 'server'` or similar)

---

### Phase 4: Layout and Camera Commands LLM Tests

**Objective**: Verify LLMs correctly call layout switching and camera positioning commands.

**Tests to Write First**:

- `test/ai/llm-regression/layout-commands.llm-regression.ts`:
  ```typescript
  describe("Layout Commands LLM Regression", () => {
    describe("setLayout", () => {
      it("calls setLayout for 'Use circular layout'", async () => {
        const result = await harness.testPrompt("Use circular layout");
        assert.ok(result.toolWasCalled);
        assert.strictEqual(result.toolName, "setLayout");
        assert.strictEqual(result.toolParams?.type, "circular");
      });

      it("calls setLayout for 'Switch to force-directed layout'");
      it("calls setLayout for 'Arrange nodes randomly'");
    });

    describe("setDimension", () => {
      it("calls setDimension for 'Switch to 2D view'");
      it("calls setDimension for 'Show in 3D'");
    });
  });
  ```

- `test/ai/llm-regression/camera-commands.llm-regression.ts`:
  ```typescript
  describe("Camera Commands LLM Regression", () => {
    describe("setCameraPosition", () => {
      it("calls setCameraPosition for 'Show the graph from above'");
      it("calls setCameraPosition for 'View from the side'");
      it("calls setCameraPosition for 'Fit all nodes in view'");
    });

    describe("zoomToNodes", () => {
      it("calls zoomToNodes for 'Zoom to fit all nodes'");
      it("calls zoomToNodes for 'Focus on server nodes'");
    });
  });
  ```

**Dependencies**:
- Phase 1-3 complete
- Internal: `setLayout`, `setDimension`, `setCameraPosition`, `zoomToNodes` commands

**Verification**:
1. Run: `npm run test:llm-regression`
2. Layout type is correctly identified (circular, ngraph/d3, random)
3. Camera presets map correctly (topView, sideView, fitToGraph)

---

### Phase 5: Algorithm Commands LLM Tests

**Objective**: Verify LLMs correctly call algorithm listing and execution commands.

**Tests to Write First**:

- `test/ai/llm-regression/algorithm-commands.llm-regression.ts`:
  ```typescript
  describe("Algorithm Commands LLM Regression", () => {
    describe("listAlgorithms", () => {
      it("calls listAlgorithms for 'What algorithms are available?'");
      it("calls listAlgorithms for 'List graphty algorithms'");
    });

    describe("runAlgorithm", () => {
      it("calls runAlgorithm for 'Calculate the degree of each node'");
      it("calls runAlgorithm for 'Run pagerank'");
      it("calls runAlgorithm for 'Find connected components'");
    });
  });
  ```

**Dependencies**:
- Phase 1-4 complete
- Internal: `listAlgorithms`, `runAlgorithm` commands

**Verification**:
1. Run: `npm run test:llm-regression`
2. Algorithm names and namespaces correctly identified
3. Common algorithms (degree, pagerank) map to correct tool calls

---

### Phase 6: Mode and Capture Commands LLM Tests

**Objective**: Verify LLMs correctly call immersive mode and capture commands.

**Tests to Write First**:

- `test/ai/llm-regression/mode-commands.llm-regression.ts`:
  ```typescript
  describe("Mode Commands LLM Regression", () => {
    describe("setImmersiveMode", () => {
      it("calls setImmersiveMode for 'Enter VR mode'");
      it("calls setImmersiveMode for 'Exit immersive mode'");
    });
  });
  ```

- `test/ai/llm-regression/capture-commands.llm-regression.ts`:
  ```typescript
  describe("Capture Commands LLM Regression", () => {
    describe("captureScreenshot", () => {
      it("calls captureScreenshot for 'Take a screenshot'");
      it("calls captureScreenshot for 'Screenshot in JPEG format'");
    });

    describe("captureVideo", () => {
      it("calls captureVideo for 'Start recording'");
      it("calls captureVideo for 'Stop recording'");
    });
  });
  ```

**Dependencies**:
- Phase 1-5 complete
- Internal: `setImmersiveMode`, `captureScreenshot`, `captureVideo` commands

**Verification**:
1. Run: `npm run test:llm-regression`
2. Mode transitions correctly identified (vr, exit)
3. Capture format parameters correctly parsed

---

### Phase 7: Edge Cases and Multi-Tool Scenarios

**Objective**: Test complex scenarios, ambiguous prompts, error handling, and multi-tool sequences.

**Tests to Write First**:

- `test/ai/llm-regression/edge-cases.llm-regression.ts`:
  ```typescript
  describe("Edge Cases LLM Regression", () => {
    describe("ambiguous prompts", () => {
      it("handles 'change the view' with reasonable tool choice");
      it("handles 'make it pretty' with style-related tool");
      it("handles 'analyze the graph' with query or algorithm tool");
    });

    describe("complex prompts", () => {
      it("handles 'show me server nodes and make them blue'");
      // May call multiple tools or combine into one
    });

    describe("no-op prompts", () => {
      it("returns text response for 'hello'");
      it("returns text response for 'what can you do?'");
    });

    describe("invalid prompts", () => {
      it("handles gracefully when asked about non-existent features");
    });
  });
  ```

- `test/ai/llm-regression/retry-behavior.llm-regression.ts`:
  ```typescript
  describe("Retry Behavior", () => {
    it("retries on transient rate limit errors");
    it("respects maximum retry count");
  });
  ```

**Implementation**:

- Add retry logic to harness:
  ```typescript
  interface RetryOptions {
    maxRetries?: number; // Default: 2
    retryDelayMs?: number; // Default: 1000
    retryOn?: (error: Error) => boolean;
  }
  ```

- Add flexible tool matching:
  ```typescript
  interface TestExpectations {
    expectedTool?: string | string[]; // Allow multiple valid tools
    expectedParams?: Record<string, unknown>;
    validate?: (result: LlmRegressionResult) => boolean;
  }
  ```

**Dependencies**:
- Phase 1-6 complete

**Verification**:
1. Run: `npm run test:llm-regression`
2. Edge cases don't crash, produce reasonable responses
3. Retry logic prevents flaky failures from rate limits

---

## Common Utilities Needed

| Utility | Purpose | Used In |
|---------|---------|---------|
| `skipIfNoApiKey()` | Skip test when env var missing | All test files |
| `isColorMatch(actual, expected)` | Flexible color comparison | Phase 3 (Style) |
| `includesParams(actual, expected)` | Partial object matching | All phases |
| `createHarnessForFixture(fixture)` | Factory for common fixtures | All phases |
| `logTestMetrics(results[])` | Summarize latency/tokens | Test teardown |

---

## External Libraries Assessment

| Task | Library | Recommendation |
|------|---------|----------------|
| LLM API calls | `@ai-sdk/openai` | Already using - no change |
| Test framework | `vitest` | Already using - add project |
| Retry logic | Built-in | Implement simple retry in harness |
| Color parsing | None needed | Simple regex for hex/named colors |
| Deep object comparison | `vitest` matchers | Use built-in `deepInclude` |

**Decision**: No new external dependencies needed. The existing infrastructure (`VercelAiProvider`, `AiController`, `vitest`) provides everything required.

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| **LLM Non-Determinism** | Use `temperature: 0`, allow alternative valid tools, flexible param matching |
| **Rate Limiting** | Sequential test execution, configurable delay, retry with backoff |
| **API Costs** | Use `gpt-4o-mini`, keep prompts short, log token usage |
| **Flaky Tests** | Allow 1 retry per test, document expected variability |
| **API Key Exposure** | Environment variables only, sanitize error messages |
| **OpenAI API Changes** | Pin model version, abstract through VercelAiProvider |
| **CI/CD Integration** | Require `VITE_OPENAI_API_KEY` secret, fail tests if not set |

---

## CI/CD Integration Notes

1. **GitHub Actions Secret**: Add `VITE_OPENAI_API_KEY` as repository secret
2. **Test Job Configuration**:
   ```yaml
   test-llm-regression:
     runs-on: ubuntu-latest
     env:
       VITE_OPENAI_API_KEY: ${{ secrets.VITE_OPENAI_API_KEY }}
     steps:
       - run: npm run test:llm-regression
   ```
3. **PR Requirements**: LLM regression tests must pass to merge
4. **Cost Monitoring**: Track token usage in CI logs

---

## File Structure Summary

```
test/
├── ai/
│   └── llm-regression/
│       ├── harness.test.ts                    # Phase 1
│       ├── query-commands.llm-regression.ts   # Phase 2
│       ├── style-commands.llm-regression.ts   # Phase 3
│       ├── layout-commands.llm-regression.ts  # Phase 4
│       ├── camera-commands.llm-regression.ts  # Phase 4
│       ├── algorithm-commands.llm-regression.ts # Phase 5
│       ├── mode-commands.llm-regression.ts    # Phase 6
│       ├── capture-commands.llm-regression.ts # Phase 6
│       ├── edge-cases.llm-regression.ts       # Phase 7
│       ├── retry-behavior.llm-regression.ts   # Phase 7
│       └── fixtures/
│           └── test-graph-fixtures.ts         # Phase 2
├── helpers/
│   ├── llm-regression-harness.ts              # Phase 1
│   └── llm-regression-env.ts                  # Phase 1
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Test Coverage | All 16 commands tested with 2+ prompts each |
| Pass Rate | >95% on repeated runs (accounting for LLM variability) |
| Latency | <5s average per test (gpt-4o-mini) |
| Token Usage | <1000 tokens average per test |
| CI Runtime | <5 minutes for full suite |
| False Positives | <5% (flexible matching reduces false failures) |

---

## Implementation Notes

### Temperature Setting
Set `temperature: 0` for maximum determinism. This reduces but does not eliminate variability.

### Model Selection
Use `gpt-4o-mini` for:
- Cost efficiency (~$0.15/1M input tokens, ~$0.60/1M output tokens)
- Speed (~2-3s response time)
- Reliability (well-tested, stable API)

### Flexible Matching Strategy
1. **Tool name**: Exact match required
2. **Parameters**:
   - Allow alternative valid values (e.g., "ngraph" OR "d3" for force layout)
   - Partial matching for nested objects
   - Case-insensitive for string values where appropriate
   - Color normalization (red → #ff0000)

### Test Isolation
Each test file creates its own harness instance with fresh graph data to ensure isolation.
