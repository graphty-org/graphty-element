[@graphty/graphty-element](../../index.md) / [config](../index.md) / InferOptions

# Type Alias: InferOptions\<S\>

> **InferOptions**\<`S`\> = `{ [K in keyof S]: z.infer<S[K]["schema"]> }`

Defined in: [src/config/OptionsSchema.ts:62](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/config/OptionsSchema.ts#L62)

Infer TypeScript types from an OptionsSchema

## Type Parameters

### S

`S` *extends* [`OptionsSchema`](OptionsSchema.md)

## Example

```typescript
const myOptions = defineOptions({
    threshold: {
        schema: z.number().default(0.5),
        meta: { label: "Threshold", description: "..." }
    }
});
type MyOptions = InferOptions\<typeof myOptions\>;
// MyOptions = { threshold: number }
```
