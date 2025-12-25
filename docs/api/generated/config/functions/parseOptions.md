[@graphty/graphty-element](../../index.md) / [config](../index.md) / parseOptions

# Function: parseOptions()

> **parseOptions**\<`S`\>(`optionsSchema`, `options`): [`InferOptions`](../type-aliases/InferOptions.md)\<`S`\>

Defined in: [src/config/OptionsSchema.ts:126](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/config/OptionsSchema.ts#L126)

Validate and parse options using the schema

Uses Zod for validation, applying defaults from the schema.
Throws ZodError if validation fails.

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

[`InferOptions`](../type-aliases/InferOptions.md)\<`S`\>

Fully typed options with defaults applied

## Example

```typescript
const options = parseOptions(myOptionsSchema, { dampingFactor: 0.9 });
// options is fully typed with all defaults applied
```
