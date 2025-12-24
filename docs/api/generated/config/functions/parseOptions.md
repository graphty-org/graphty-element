[@graphty/graphty-element](../../index.md) / [config](../index.md) / parseOptions

# Function: parseOptions()

> **parseOptions**\<`S`\>(`optionsSchema`, `options`): [`InferOptions`](../type-aliases/InferOptions.md)\<`S`\>

Defined in: [src/config/OptionsSchema.ts:122](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/config/OptionsSchema.ts#L122)

Validate and parse options using the schema

Uses Zod for validation, applying defaults from the schema.
Throws ZodError if validation fails.

## Type Parameters

### S

`S` *extends* [`OptionsSchema`](../type-aliases/OptionsSchema.md)

## Parameters

### optionsSchema

`S`

### options

[`PartialOptions`](../type-aliases/PartialOptions.md)\<`S`\>

## Returns

[`InferOptions`](../type-aliases/InferOptions.md)\<`S`\>

## Example

```typescript
const options = parseOptions(myOptionsSchema, { dampingFactor: 0.9 });
// options is fully typed with all defaults applied
```
