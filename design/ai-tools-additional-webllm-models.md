# Adding Tool Calling Support for Additional WebLLM Models

## Background

In the current implementation, only Hermes models support tool calling in WebLLM. When attempting to use other models (SmolLM2, Qwen, Llama 3.2, Phi 3.5) with the `tools` parameter, WebLLM returns:

> "SmolLM2-360M-Instruct-q4f16_1-MLC is not supported for ChatCompletionRequest.tools. Currently, models that support function calling are: Hermes-2-Pro-Llama-3-8B-q4f16_1-MLC, Hermes-2-Pro-Llama-3-8B-q4f32_1-MLC, Hermes-2-Pro-Mistral-7B-q4f16_1-MLC, Hermes-3-Llama-3.1-8B-q4f32_1-MLC, Hermes-3-Llama-3.1-8B-q4f16_1-MLC"

Since tool calling is the only purpose of the LLM in our application, models that don't support tools are currently unusable.

## Research Findings

### Native Tool Calling Support by Model

| Model | Native Tool Support | Format | Quality | Size |
|-------|-------------------|--------|---------|------|
| **Qwen 2.5** | ✅ Yes | Hermes-style JSON | Good | 800MB-3.5GB |
| **SmolLM2** | ✅ Yes | `<tool_call>` XML tags | 27% BFCL | 200MB-1GB |
| **Llama 3.2** | ✅ Yes | JSON or pythonic | Good | 500MB-1.5GB |
| **Phi 3.5 Mini** | ⚠️ Unofficial | Prompt engineering | Unreliable | ~2GB |
| **Hermes** | ✅ Yes (WebLLM native) | OpenAI-style | Best | ~4GB |

### Why WebLLM Only Supports Hermes

The limitation is in WebLLM's implementation, not the models:

1. **Hardcoded Template**: WebLLM only implemented the Hermes-specific tool calling template
2. **Beta Status**: Function calling is labeled "beta" ([Issue #526](https://github.com/mlc-ai/web-llm/issues/526))
3. **Parsing Issues**: Only Hermes outputs proper JSON; others return empty arrays ([Issue #712](https://github.com/mlc-ai/web-llm/issues/712))
4. **System Prompt Conflict**: Cannot supply custom system prompt with tools ([Issue #462](https://github.com/mlc-ai/web-llm/issues/462))

### Model-Specific Tool Calling Formats

#### Qwen 2.5
- Uses Hermes-style tool format
- Requires proper prompting via Qwen-Agent framework
- Documentation: https://qwen.readthedocs.io/en/latest/framework/function_call.html

#### SmolLM2
- Uses `<tool_call>` XML wrapper tags
- Output format: `<tool_call>[{"name": "func", "arguments": {...}}]</tool_call>`
- Requires regex parsing: `/<tool_call>(.*?)<\/tool_call>/`
- Documentation: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct/blob/main/instructions_function_calling.md

#### Llama 3.2
- Supports JSON-based and pythonic tool calling
- Fine-tuned for single, nested, and parallel function calls
- Uses `tool_chat_template_llama3.2_json.jinja` template
- Documentation: https://www.llama.com/docs/model-cards-and-prompt-formats/llama3_2/

#### Phi 3.5 Mini
- Microsoft does NOT officially support tool calling
- Community fine-tunes exist (e.g., `ayan-sh003/phi3.5-phunction-calling`)
- Requires careful prompt engineering with explicit JSON formatting instructions
- Unreliable results reported by users

## Proposed Solution: Tool Calling Abstraction Layer

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    WebLlmProvider.generate()                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              ToolCallingStrategy (interface)              │   │
│  │  - formatToolsForPrompt(tools: ToolDefinition[]): string │   │
│  │  - buildSystemPrompt(basePrompt: string): string         │   │
│  │  - parseToolCalls(response: string): ToolCall[]          │   │
│  │  - supportsNativeToolsApi(): boolean                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│         ┌────────────────────┼────────────────────┐             │
│         ▼                    ▼                    ▼             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐     │
│  │   Hermes    │    │   SmolLM2   │    │   Llama/Qwen    │     │
│  │  Strategy   │    │  Strategy   │    │    Strategy     │     │
│  │             │    │             │    │                 │     │
│  │ Uses native │    │ XML tags    │    │ JSON in prompt  │     │
│  │ tools API   │    │ + regex     │    │ + JSON parse    │     │
│  └─────────────┘    └─────────────┘    └─────────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Strategy Interface

```typescript
interface ToolCallingStrategy {
    /** Model IDs this strategy applies to */
    readonly modelPatterns: RegExp[];

    /** Whether to use WebLLM's native tools API */
    readonly supportsNativeToolsApi: boolean;

    /** Format tool definitions for inclusion in prompt */
    formatToolsForPrompt(tools: ToolDefinition[]): string;

    /** Build complete system prompt with tool instructions */
    buildSystemPrompt(basePrompt: string, tools: ToolDefinition[]): string;

    /** Parse tool calls from model response */
    parseToolCalls(response: string): ToolCall[];
}
```

### Implementation: HermesStrategy (Reference)

```typescript
class HermesStrategy implements ToolCallingStrategy {
    readonly modelPatterns = [/^Hermes-/];
    readonly supportsNativeToolsApi = true;

    formatToolsForPrompt(tools: ToolDefinition[]): string {
        // Not needed - uses native API
        return "";
    }

    buildSystemPrompt(basePrompt: string, tools: ToolDefinition[]): string {
        // Hermes doesn't support custom system prompts with tools
        return "";
    }

    parseToolCalls(response: string): ToolCall[] {
        // Not needed - native API returns structured data
        return [];
    }
}
```

### Implementation: SmolLM2Strategy

```typescript
class SmolLM2Strategy implements ToolCallingStrategy {
    readonly modelPatterns = [/^SmolLM2-/];
    readonly supportsNativeToolsApi = false;

    formatToolsForPrompt(tools: ToolDefinition[]): string {
        return JSON.stringify(tools.map(t => ({
            type: "function",
            function: {
                name: t.name,
                description: t.description,
                parameters: zodToJsonSchema(t.parameters),
            }
        })), null, 2);
    }

    buildSystemPrompt(basePrompt: string, tools: ToolDefinition[]): string {
        return `You are a function calling AI model. You are provided with function signatures within <tools></tools> XML tags.
You may call one or more functions to assist with the user query. Don't make assumptions about what values to plug into functions.

<tools>
${this.formatToolsForPrompt(tools)}
</tools>

For each function call return a json object with function name and arguments within <tool_call></tool_call> XML tags as follows:
<tool_call>
[{"name": "<function-name>", "arguments": {"<arg-name>": "<arg-value>"}}]
</tool_call>

${basePrompt}`;
    }

    parseToolCalls(response: string): ToolCall[] {
        const match = response.match(/<tool_call>([\s\S]*?)<\/tool_call>/);
        if (!match) return [];

        try {
            const calls = JSON.parse(match[1]) as Array<{name: string; arguments: Record<string, unknown>}>;
            return calls.map((c, i) => ({
                id: `call_${Date.now()}_${i}`,
                name: c.name,
                arguments: c.arguments,
            }));
        } catch {
            return [];
        }
    }
}
```

### Implementation: LlamaQwenStrategy

```typescript
class LlamaQwenStrategy implements ToolCallingStrategy {
    readonly modelPatterns = [/^Llama-3\.2-/, /^Qwen/];
    readonly supportsNativeToolsApi = false;

    formatToolsForPrompt(tools: ToolDefinition[]): string {
        return JSON.stringify(tools.map(t => ({
            type: "function",
            function: {
                name: t.name,
                description: t.description,
                parameters: zodToJsonSchema(t.parameters),
            }
        })), null, 2);
    }

    buildSystemPrompt(basePrompt: string, tools: ToolDefinition[]): string {
        return `You are a helpful assistant with access to the following functions.
Use them if required to answer the user's question.

Available functions:
${this.formatToolsForPrompt(tools)}

When you need to call a function, respond with ONLY a JSON object in this exact format:
{"name": "function_name", "arguments": {"arg1": "value1"}}

If you need to call multiple functions, respond with a JSON array:
[{"name": "func1", "arguments": {...}}, {"name": "func2", "arguments": {...}}]

${basePrompt}`;
    }

    parseToolCalls(response: string): ToolCall[] {
        // Try to parse as JSON array first
        try {
            const trimmed = response.trim();
            if (trimmed.startsWith('[')) {
                const calls = JSON.parse(trimmed) as Array<{name: string; arguments: Record<string, unknown>}>;
                return calls.map((c, i) => ({
                    id: `call_${Date.now()}_${i}`,
                    name: c.name,
                    arguments: c.arguments,
                }));
            }
            if (trimmed.startsWith('{')) {
                const call = JSON.parse(trimmed) as {name: string; arguments: Record<string, unknown>};
                return [{
                    id: `call_${Date.now()}`,
                    name: call.name,
                    arguments: call.arguments,
                }];
            }
        } catch {
            // Try to extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    const call = JSON.parse(jsonMatch[0]) as {name: string; arguments: Record<string, unknown>};
                    return [{
                        id: `call_${Date.now()}`,
                        name: call.name,
                        arguments: call.arguments,
                    }];
                } catch {
                    // Fall through
                }
            }
        }
        return [];
    }
}
```

### Modified WebLlmProvider.generate()

```typescript
async generate(
    messages: Message[],
    tools: ToolDefinition[],
    options?: {signal?: AbortSignal},
): Promise<LlmResponse> {
    const strategy = this.getStrategyForModel(this.model);

    if (strategy.supportsNativeToolsApi) {
        // Use existing WebLLM native tools API (Hermes models)
        return this.generateWithNativeTools(messages, tools, options);
    }

    // Use prompt-based tool calling for other models
    const systemPrompt = strategy.buildSystemPrompt(
        this.getBaseSystemPrompt(),
        tools
    );

    const messagesWithSystem: Message[] = [
        {role: "system", content: systemPrompt},
        ...messages,
    ];

    // Call WebLLM WITHOUT tools parameter
    const response = await this.engine.chat.completions.create({
        messages: this.convertMessages(messagesWithSystem),
        temperature: this.temperature ?? 0.7,
        max_tokens: this.maxTokens ?? 1024,
        // NO tools parameter - handled via prompt
    });

    const text = response.choices?.[0]?.message?.content ?? "";
    const toolCalls = strategy.parseToolCalls(text);

    return {
        text: toolCalls.length > 0 ? "" : text,
        toolCalls,
        usage: response.usage ? {
            promptTokens: response.usage.prompt_tokens ?? 0,
            completionTokens: response.usage.completion_tokens ?? 0,
        } : undefined,
    };
}
```

## Risks and Considerations

### Quality Concerns

| Model | BFCL Score | Notes |
|-------|-----------|-------|
| SmolLM2-1.7B | 27% | Low reliability; may hallucinate function names |
| SmolLM2-360M | Unknown (lower) | Too small for reliable tool calling |
| Llama 3.2 1B | Unknown | Small models struggle with structured output |
| Llama 3.2 3B | Better | Reasonable for simple tool calls |
| Qwen 2.5 1.5B | Unknown | Untested in this context |

### Implementation Risks

1. **JSON Parsing Failures**: Models may output malformed JSON, especially smaller ones
2. **Hallucinated Function Names**: Models may invent functions not in the tool list
3. **Argument Type Mismatches**: Models may provide wrong types for arguments
4. **Multi-turn Complexity**: Handling tool results and follow-up calls requires additional prompting
5. **Streaming Complications**: Parsing tool calls from streaming responses is complex

### Maintenance Burden

- Each strategy needs testing with real models
- Model updates may change output formats
- Need to track WebLLM model list changes
- Community model fine-tunes may behave differently

## Recommendation

### Option A: Implement Abstraction Layer (Recommended if smaller models are important)

**Effort**: Medium-High (2-3 days initial, ongoing maintenance)

**Implementation Priority**:
1. SmolLM2-1.7B (smallest working model, ~1GB)
2. Llama 3.2 3B (good balance of size/quality)
3. Qwen 2.5 1.5B (multilingual support)
4. Skip Phi 3.5 (unofficial support, unreliable)

**Benefits**:
- Models as small as 1GB for tool calling
- More choice for users with limited hardware
- Faster inference with smaller models

### Option B: Stick with Hermes Models Only

**Effort**: None

**Rationale**:
- Hermes models are specifically fine-tuned for tool calling
- Most reliable option
- WebLLM team may add native support for other models

**Drawbacks**:
- Minimum ~4GB download
- Fewer model choices

### Option C: Wait for WebLLM Updates

**Effort**: None (monitoring only)

Per [Issue #526](https://github.com/mlc-ai/web-llm/issues/526), WebLLM plans to:
- Integrate XGrammar for structural tags
- Enable reliable tool use with small models
- Add MCP-like examples

**Risk**: No timeline; may not happen for all models we want.

## References

- [Qwen Function Calling Documentation](https://qwen.readthedocs.io/en/latest/framework/function_call.html)
- [SmolLM2 Function Calling Instructions](https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct/blob/main/instructions_function_calling.md)
- [Llama 3.2 Model Cards](https://www.llama.com/docs/model-cards-and-prompt-formats/llama3_2/)
- [WebLLM GitHub - Function Calling Beta](https://github.com/mlc-ai/web-llm/issues/526)
- [WebLLM GitHub - Tool Calling Issues](https://github.com/mlc-ai/web-llm/issues/712)
- [WebLLM GitHub - System Prompt Limitations](https://github.com/mlc-ai/web-llm/issues/462)
- [Phi 3.5 Tool Calls Discussion](https://huggingface.co/microsoft/Phi-3.5-mini-instruct/discussions/7)
