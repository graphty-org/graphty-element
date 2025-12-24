[@graphty/graphty-element](../../index.md) / [config](../index.md) / safeParseOptions

# Function: safeParseOptions()

> **safeParseOptions**\<`S`\>(`optionsSchema`, `options`): [`SafeParseResult`](../type-aliases/SafeParseResult.md)\<[`InferOptions`](../type-aliases/InferOptions.md)\<`S`\>\>

Defined in: [src/config/OptionsSchema.ts:142](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/config/OptionsSchema.ts#L142)

Safely parse options, returning a result object instead of throwing

## Type Parameters

### S

`S` *extends* [`OptionsSchema`](../type-aliases/OptionsSchema.md)

## Parameters

### optionsSchema

`S`

### options

[`PartialOptions`](../type-aliases/PartialOptions.md)\<`S`\>

## Returns

[`SafeParseResult`](../type-aliases/SafeParseResult.md)\<[`InferOptions`](../type-aliases/InferOptions.md)\<`S`\>\>

Object with success flag and either data or error
