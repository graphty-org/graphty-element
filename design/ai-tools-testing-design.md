# Feature Design: AI Tools Regression Testing

## Overview

- **User Value**: Confidence that LLM-powered graph commands work correctly with OpenAI, ensuring reliable natural language control of graph visualizations.
- **Technical Value**: Automated regression testing on every PR that catches tool calling failures and parameter mismatches before they reach production. Enables safe iteration on prompts and tool definitions.

## Requirements

Create regression tests that ACTUALLY call LLMs and ensure they know how to use our tools:

1. Send pre-defined prompts to LLMs through our AI system
2. Spy to see if the LLM calls the correct tool
3. Verify our tool returns the expected value

**Example lifecycle:**
- Prompt: "How many servers are there in this data?"
- LLM (OpenAI/Anthropic/Google) processes prompt
- LLM calls `queryGraph` or `findNodes` or `getSchema` tool
- Tool returns appropriate data (e.g., "There are 4 servers")

---

## Research: Testing Libraries for LLM Tool Calling

### Existing Libraries Evaluated

#### 1. **Evalite** (Recommended)
- **Repository**: [github.com/mattpocock/evalite](https://github.com/mattpocock/evalite)
- **Website**: [evalite.dev](https://www.evalite.dev/)
- **Description**: TypeScript-native eval runner, positioned as "Vitest for LLMs"
- **Key Features**:
  - Built on Vitest - familiar test ergonomics
  - Scored test cases instead of pass/fail
  - First-class trace capture for debugging
  - Local dev server with live reload
  - No vendor lock-in, works with any LLM
  - MIT licensed
- **Relevance**: Good for scoring LLM output quality, but may be overkill for binary "did it call the right tool?" tests

#### 2. **EvalKit**
- **Repository**: [github.com/evalkit/evalkit](https://github.com/evalkit/evalkit)
- **Website**: [evalkit.vercel.app](https://evalkit.vercel.app/)
- **Description**: TypeScript LLM evaluation library
- **Key Features**: Similar approach to Evalite with evaluation metrics

#### 3. **LangWatch**
- **Website**: [langwatch.ai](https://langwatch.ai/blog/introducing-the-evaluations-wizard-your-end-to-end-workflow-for-llm-testing)
- **Description**: CI/CD integration with Python and TypeScript SDKs
- **Key Features**: Parallel evaluation, cost/latency tracking, model comparison

#### 4. **DeepEval / Confident AI**
- **Repository**: [github.com/confident-ai/deepeval](https://github.com/confident-ai/deepeval)
- **Description**: LLM evaluation framework similar to Pytest
- **Key Features**: LLM tracing, execution hierarchy recording

### Recommended Approach: Custom Vitest-Based Framework

Given our specific requirements (tool calling verification, not output quality scoring), a **lightweight custom approach using Vitest** is recommended over adopting a full evaluation framework:

**Rationale:**
1. Our tests are binary: "Did the LLM call the correct tool with correct parameters?"
2. We already use Vitest extensively - maintaining consistency
3. Existing provider infrastructure (`VercelAiProvider`) handles LLM communication
4. Full eval frameworks add complexity for features we don't need (scoring, benchmarks)
5. We can integrate with Evalite later if needed for quality scoring

---

## Proposed Solution

### User Interface/API

Tests will be Vitest test files that:
1. Configure an LLM provider with API keys from environment
2. Send prompts through `AiController`
3. Assert on tool calls made and results returned

```typescript
// test/ai/llm-regression/query-commands.llm-regression.ts
import { describe, it, assert, beforeAll } from "vitest";
import { LlmRegressionTestHarness } from "../../helpers/llm-regression-harness";

describe("QueryCommands LLM Regression", () => {
  let harness: LlmRegressionTestHarness;

  beforeAll(async () => {
    harness = await LlmRegressionTestHarness.create({
      graphData: {
        nodes: [
          { id: "1", data: { type: "server", name: "web-01" } },
          { id: "2", data: { type: "server", name: "db-01" } },
          { id: "3", data: { type: "client", name: "app-01" } },
        ],
        edges: [
          { source: "1", target: "2", data: { weight: 0.8 } },
        ],
      },
    });
  });

  it("should call queryGraph for node count question", async () => {
    const result = await harness.testPrompt(
      "How many nodes are in this graph?",
      {
        expectedTool: "queryGraph",
        expectedParams: { query: "nodeCount" },
      }
    );

    assert.ok(result.toolWasCalled, "Tool was not called");
    assert.strictEqual(result.toolName, "queryGraph");
    assert.ok(result.commandResult?.success);
  });
});
```

### Technical Architecture

#### Components

1. **LlmRegressionTestHarness** (`test/helpers/llm-regression-harness.ts`)
   - Configures OpenAI provider with API key from environment
   - Manages graph instances with fixed test data
   - Captures tool calls and results
   - Provides simple assertion helpers

2. **Provider Configuration** (`.env.local`)
   ```
   VITE_OPENAI_API_KEY=sk-...
   ```

3. **Test Result Interface**
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
   ```

4. **Vitest Project Configuration**
   ```typescript
   // vitest.config.ts
   {
     projects: [
       // ... existing projects
       {
         name: "llm-regression",
         test: {
           include: ["test/ai/llm-regression/**/*.llm-regression.ts"],
           testTimeout: 60000, // LLM calls can be slow
           hookTimeout: 30000,
           pool: "forks", // Isolate for API rate limiting
           maxConcurrency: 1, // Sequential to avoid rate limits
         },
       },
     ],
   }
   ```

#### Data Model

**Test Case Definition:**
```typescript
interface LlmRegressionTestCase {
  /** Descriptive name for the test */
  name: string;
  /** Natural language prompt to send */
  prompt: string;
  /** Expected tool to be called (exact match) */
  expectedTool: string;
  /** Expected parameters (partial match - only check specified keys) */
  expectedParams?: Record<string, unknown>;
  /** Additional validation function */
  validate?: (result: LlmRegressionResult) => boolean;
  /** Skip specific providers for this test */
  skipProviders?: string[];
}
```

**Graph Test Fixture:**
```typescript
interface TestGraphFixture {
  nodes: Array<{ id: string; data: Record<string, unknown> }>;
  edges: Array<{ source: string; target: string; data?: Record<string, unknown> }>;
}
```

#### Integration Points

1. **Existing `VercelAiProvider`** - Already supports OpenAI, Anthropic, Google
2. **Existing `AiController`** - Orchestrates LLM → tool execution flow
3. **Existing `CommandRegistry`** - Contains all tool definitions
4. **Existing `Graph` class** - Mock/real graph for testing
5. **Existing test helpers** - `createMockGraphWithCustomData`

### Implementation Approach

#### Phase 1: Test Infrastructure
1. Create `LlmRegressionTestHarness` class
2. Add environment variable handling for API keys
3. Configure new Vitest project for LLM regression tests
4. Add npm script `test:llm-regression`

#### Phase 2: Query Commands Tests
1. `queryGraph` - node count, edge count, layout, summary
2. `findNodes` - selector matching
3. `getSchema` - schema discovery

#### Phase 3: Style Commands Tests
1. `findAndStyleNodes` - color, size, shape styling
2. `findAndStyleEdges` - edge styling
3. `clearStyles` - style removal

#### Phase 4: Layout & Camera Commands Tests
1. `setLayout` - layout changes
2. `setDimension` - 2D/3D switching
3. `setCameraPosition` - camera presets
4. `zoomToNodes` - zoom behavior

#### Phase 5: Schema Discovery Commands Tests
1. `sampleData` - data sampling
2. `describeProperty` - property analysis

#### Phase 6: Algorithm Commands Tests
1. `listAlgorithms` - algorithm listing
2. `runAlgorithm` - algorithm execution

#### Phase 7: Edge Cases & Multi-Tool Tests
1. Tests requiring multiple tool calls
2. Ambiguous prompts
3. Error handling

---

## Tools to Test and Suggested Prompts

### 1. Query Commands

| Tool | Test Prompt | Expected Params |
|------|-------------|-----------------|
| `queryGraph` | "How many nodes are in this graph?" | `{ query: "nodeCount" }` |
| `queryGraph` | "How many edges are there?" | `{ query: "edgeCount" }` |
| `queryGraph` | "What layout is the graph using?" | `{ query: "currentLayout" }` |
| `queryGraph` | "Give me a summary of the graph" | `{ query: "summary" }` |
| `findNodes` | "Find all server nodes" | `{ selector: "type == 'server'" }` |
| `findNodes` | "Show me nodes with degree greater than 3" | `{ selector: "degree > 3" }` |
| `getSchema` | "What types of nodes exist?" | `{ query: "nodeTypes" }` |
| `getSchema` | "What properties do edges have?" | `{ query: "edgeProperties" }` |

### 2. Style Commands

| Tool | Test Prompt | Expected Params (partial) |
|------|-------------|---------------------------|
| `findAndStyleNodes` | "Make all nodes red" | `{ selector: "", style: { color: ... } }` |
| `findAndStyleNodes` | "Highlight server nodes in blue" | `{ selector: "type == 'server'", style: { color: ... } }` |
| `findAndStyleNodes` | "Make nodes bigger" | `{ style: { size: ... } }` |
| `findAndStyleEdges` | "Make all edges green" | `{ selector: "", style: { color: ... } }` |
| `findAndStyleEdges` | "Make edges with high weight thicker" | `{ selector: "weight > 0.5", style: { width: ... } }` |
| `clearStyles` | "Remove all styling" | `{}` |
| `clearStyles` | "Clear the red-nodes style" | `{ layerName: "red-nodes" }` |

### 3. Layout Commands

| Tool | Test Prompt | Expected Params |
|------|-------------|-----------------|
| `setLayout` | "Use circular layout" | `{ type: "circular" }` |
| `setLayout` | "Switch to force-directed layout" | `{ type: "ngraph" }` or `{ type: "d3" }` |
| `setLayout` | "Arrange nodes randomly" | `{ type: "random" }` |
| `setDimension` | "Switch to 2D view" | `{ dimension: "2d" }` |
| `setDimension` | "Show in 3D" | `{ dimension: "3d" }` |

### 4. Camera Commands

| Tool | Test Prompt | Expected Params |
|------|-------------|-----------------|
| `setCameraPosition` | "Show the graph from above" | `{ preset: "topView" }` |
| `setCameraPosition` | "View from the side" | `{ preset: "sideView" }` |
| `setCameraPosition` | "Fit all nodes in view" | `{ preset: "fitToGraph" }` |
| `zoomToNodes` | "Zoom to fit all nodes" | `{ selector: "" }` |
| `zoomToNodes` | "Focus on server nodes" | `{ selector: "type == 'server'" }` |

### 5. Schema Discovery Commands

| Tool | Test Prompt | Expected Params |
|------|-------------|-----------------|
| `sampleData` | "Show me some example nodes" | `{ target: "nodes" }` |
| `sampleData` | "Show 5 sample edges" | `{ target: "edges", count: 5 }` |
| `describeProperty` | "What values does the type property have?" | `{ property: "type", target: "nodes" }` |
| `describeProperty` | "Analyze the weight property on edges" | `{ property: "weight", target: "edges" }` |

### 6. Algorithm Commands

| Tool | Test Prompt | Expected Params |
|------|-------------|-----------------|
| `listAlgorithms` | "What algorithms are available?" | `{}` |
| `listAlgorithms` | "List graphty algorithms" | `{ namespace: "graphty" }` |
| `runAlgorithm` | "Calculate the degree of each node" | `{ namespace: "graphty", type: "degree" }` |
| `runAlgorithm` | "Run pagerank" | `{ namespace: "graphty", type: "pagerank" }` |

### 7. Mode Commands

| Tool | Test Prompt | Expected Params |
|------|-------------|-----------------|
| `setImmersiveMode` | "Enter VR mode" | `{ mode: "vr" }` |
| `setImmersiveMode` | "Exit immersive mode" | `{ mode: "exit" }` |

### 8. Capture Commands

| Tool | Test Prompt | Expected Params |
|------|-------------|-----------------|
| `captureScreenshot` | "Take a screenshot" | `{}` |
| `captureScreenshot` | "Screenshot in JPEG format" | `{ format: "jpeg" }` |
| `captureVideo` | "Start recording" | `{ action: "start" }` |

---

## Acceptance Criteria

- [ ] Test harness runs tests against OpenAI (`gpt-4o-mini` for cost efficiency)
- [ ] API key is securely loaded from `VITE_OPENAI_API_KEY` environment variable
- [ ] Tests fail gracefully with clear error when API key is not available
- [ ] Each command has at least 2 regression test cases
- [ ] Test results include: tool called, parameters, command result, latency
- [ ] Tests run in CI/CD on every PR (requires OpenAI API key as secret)
- [ ] Test output is human-readable for debugging failures
- [ ] Test timeouts are appropriate for LLM response times (60s+)
- [ ] False positives are minimized through flexible parameter matching
- [ ] Fixed graph test data is used for reproducible results

---

## Technical Considerations

### Performance
- **Impact**: LLM calls add 2-10 seconds per test (~40 tests = 2-7 minutes total)
- **Mitigation**:
  - Use `gpt-4o-mini` for faster responses
  - Run tests sequentially to avoid rate limits
  - Cache provider instances across tests in same file

### Security
- **Considerations**: API keys must not be exposed in logs or test output
- **Measures**:
  - Load keys only from environment variables
  - Sanitize error messages before logging
  - Use `.env.local` (gitignored) for local development
  - Use CI/CD secrets for automated runs

### Compatibility
- **Backward compatibility**: No impact on existing tests
- **OpenAI compatibility**: Tests target OpenAI's tool calling behavior
  - Model: `gpt-4o-mini` for cost-effective testing
  - Uses existing `VercelAiProvider` infrastructure

### Testing Strategy
- **Unit tests**: Existing tests cover command execution with mock providers
- **Integration tests**: Existing tests cover full flow with mock providers
- **LLM Regression tests**: NEW - test actual LLM tool calling behavior
- **Manual testing**: `examples/ai-provider-test.html` for interactive testing

---

## Risks and Mitigation

### Risk: LLM Responses Are Non-Deterministic
**Mitigation**:
- Test for "tool was called" rather than exact text output
- Use flexible parameter matching (partial object comparison)
- Run tests multiple times if flaky, consider majority-pass
- Set temperature=0 for more deterministic responses

### Risk: API Costs
**Mitigation**:
- Use `gpt-4o-mini` (cost-effective model)
- Monitor token usage in test output
- Keep test prompts concise

### Risk: Rate Limiting
**Mitigation**:
- Run tests sequentially (not in parallel)
- Add configurable delays between tests if needed
- Handle rate limit errors gracefully with retries

### Risk: OpenAI API Changes
**Mitigation**:
- Pin to specific model version (`gpt-4o-mini`)
- Abstract provider interactions through existing VercelAiProvider
- Monitor for deprecation warnings

### Risk: Flaky Tests Due to LLM Variability
**Mitigation**:
- Focus on tool selection, not exact parameter values
- Allow alternative valid tool choices (e.g., "ngraph" OR "d3" for force layout)
- Use retry logic for intermittent failures
- Document expected variability

---

## Future Enhancements

1. **Multi-Provider Support**: Extend to Anthropic and Google for cross-provider compatibility testing
2. **Quality Scoring**: Integrate Evalite for output quality metrics beyond binary pass/fail
3. **Benchmark Tracking**: Track latency and cost over time across model updates
4. **Prompt Engineering Tests**: Test prompt variations to optimize tool selection accuracy
5. **Multi-Turn Conversations**: Test complex interactions requiring clarification
6. **Visual Regression**: Combine with screenshot capture for visual validation of style commands

---

## Design Decisions

1. **CI/CD Integration**: LLM regression tests will run on **every PR**
   - Requires `VITE_OPENAI_API_KEY` as CI/CD secret

2. **Provider Priority**: **OpenAI only** - tests will only run against OpenAI
   - Simplifies test infrastructure
   - Reduces API costs
   - Single point of truth for tool calling behavior

3. **Failure Handling**: Tests must pass for OpenAI - failures block PR merge

4. **Test Data**: **Fixed graph data** for deterministic, reproducible testing

---

## Implementation Estimate

- **Phase 1 (Infrastructure)**: 1-2 days
- **Phase 2-6 (Core Tests)**: 3-4 days
- **Phase 7 (Edge Cases)**: 1-2 days
- **Documentation & CI Setup**: 1 day

**Total: 6-9 days**

---

## Sources

- [Evalite - TypeScript LLM Testing](https://github.com/mattpocock/evalite)
- [EvalKit - TypeScript LLM Evaluation](https://github.com/evalkit/evalkit)
- [LangWatch - LLM Evaluation Platform](https://langwatch.ai/blog/introducing-the-evaluations-wizard-your-end-to-end-workflow-for-llm-testing)
- [DeepEval - LLM Evaluation Framework](https://github.com/confident-ai/deepeval)
- [Writing LLM Evals with Vercel AI and Vitest](https://xata.io/blog/llm-evals-with-vercel-ai-and-vitest)
- [Confident AI - LLM Testing Strategies](https://www.confident-ai.com/blog/llm-testing-in-2024-top-methods-and-strategies)
