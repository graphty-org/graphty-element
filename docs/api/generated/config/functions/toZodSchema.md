[@graphty/graphty-element](../../index.md) / [config](../index.md) / toZodSchema

# Function: toZodSchema()

> **toZodSchema**\<`S`\>(`optionsSchema`): `ZodObject`\<\{ \[K in string \| number \| symbol\]: S\[K\]\["schema"\] \}\>

Defined in: [src/config/OptionsSchema.ts:101](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/config/OptionsSchema.ts#L101)

Extract just the Zod object schema for validation

This creates a z.object() from the individual field schemas,
allowing standard Zod parsing/validation.

## Type Parameters

### S

`S` *extends* [`OptionsSchema`](../type-aliases/OptionsSchema.md)

## Parameters

### optionsSchema

`S`

Options schema to convert

## Returns

`ZodObject`\<\{ \[K in string \| number \| symbol\]: S\[K\]\["schema"\] \}\>

Zod object schema for validation
