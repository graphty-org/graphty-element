[@graphty/graphty-element](../../index.md) / [config](../index.md) / getDefaults

# Function: getDefaults()

> **getDefaults**\<`S`\>(`optionsSchema`): [`InferOptions`](../type-aliases/InferOptions.md)\<`S`\>

Defined in: [src/config/OptionsSchema.ts:167](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/config/OptionsSchema.ts#L167)

Get default values from an options schema

Extracts the default value from each Zod schema definition.

## Type Parameters

### S

`S` *extends* [`OptionsSchema`](../type-aliases/OptionsSchema.md)

## Parameters

### optionsSchema

`S`

Options schema to extract defaults from

## Returns

[`InferOptions`](../type-aliases/InferOptions.md)\<`S`\>

Object with all default values
