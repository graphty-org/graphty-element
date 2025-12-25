[@graphty/graphty-element](../../index.md) / [config](../index.md) / SafeParseResult

# Type Alias: SafeParseResult\<T\>

> **SafeParseResult**\<`T`\> = \{ `data`: `T`; `success`: `true`; \} \| \{ `error`: `z.ZodError`; `success`: `false`; \}

Defined in: [src/config/OptionsSchema.ts:137](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/config/OptionsSchema.ts#L137)

Result type for safe parsing

## Type Parameters

### T

`T`
