[@graphty/graphty-element](../../index.md) / [config](../index.md) / SafeParseResult

# Type Alias: SafeParseResult\<T\>

> **SafeParseResult**\<`T`\> = \{ `data`: `T`; `success`: `true`; \} \| \{ `error`: `z.ZodError`; `success`: `false`; \}

Defined in: [src/config/OptionsSchema.ts:133](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/config/OptionsSchema.ts#L133)

Result type for safe parsing

## Type Parameters

### T

`T`
