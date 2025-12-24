[@graphty/graphty-element](../../index.md) / [config](../index.md) / SafeParseResult

# Type Alias: SafeParseResult\<T\>

> **SafeParseResult**\<`T`\> = \{ `data`: `T`; `success`: `true`; \} \| \{ `error`: `z.ZodError`; `success`: `false`; \}

Defined in: [src/config/OptionsSchema.ts:133](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/config/OptionsSchema.ts#L133)

Result type for safe parsing

## Type Parameters

### T

`T`
