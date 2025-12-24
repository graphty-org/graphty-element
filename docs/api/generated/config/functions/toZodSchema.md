[@graphty/graphty-element](../../index.md) / [config](../index.md) / toZodSchema

# Function: toZodSchema()

> **toZodSchema**\<`S`\>(`optionsSchema`): `ZodObject`\<\{ \[K in string \| number \| symbol\]: S\[K\]\["schema"\] \}\>

Defined in: [src/config/OptionsSchema.ts:99](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/config/OptionsSchema.ts#L99)

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
