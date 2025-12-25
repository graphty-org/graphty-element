[@graphty/graphty-element](../../index.md) / [config](../index.md) / safeParseOptions

# Function: safeParseOptions()

> **safeParseOptions**\<`S`\>(`optionsSchema`, `options`): [`SafeParseResult`](../type-aliases/SafeParseResult.md)\<[`InferOptions`](../type-aliases/InferOptions.md)\<`S`\>\>

Defined in: [src/config/OptionsSchema.ts:147](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/config/OptionsSchema.ts#L147)

Safely parse options, returning a result object instead of throwing

## Type Parameters

### S

`S` *extends* [`OptionsSchema`](../type-aliases/OptionsSchema.md)

## Parameters

### optionsSchema

`S`

Options schema to validate against

### options

[`PartialOptions`](../type-aliases/PartialOptions.md)\<`S`\>

Partial options to parse and validate

## Returns

[`SafeParseResult`](../type-aliases/SafeParseResult.md)\<[`InferOptions`](../type-aliases/InferOptions.md)\<`S`\>\>

Object with success flag and either data or error
