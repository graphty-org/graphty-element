[@graphty/graphty-element](../../index.md) / [config](../index.md) / toZodSchema

# Function: toZodSchema()

> **toZodSchema**\<`S`\>(`optionsSchema`): `ZodObject`\<\{ \[K in string \| number \| symbol\]: S\[K\]\["schema"\] \}\>

Defined in: [src/config/OptionsSchema.ts:99](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/config/OptionsSchema.ts#L99)

Extract just the Zod object schema for validation

This creates a z.object() from the individual field schemas,
allowing standard Zod parsing/validation.

## Type Parameters

### S

`S` *extends* [`OptionsSchema`](../type-aliases/OptionsSchema.md)

## Parameters

### optionsSchema

`S`

## Returns

`ZodObject`\<\{ \[K in string \| number \| symbol\]: S\[K\]\["schema"\] \}\>
