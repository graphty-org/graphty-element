[@graphty/graphty-element](../../index.md) / [config](../index.md) / InferOptions

# Type Alias: InferOptions\<S\>

> **InferOptions**\<`S`\> = `{ [K in keyof S]: z.infer<S[K]["schema"]> }`

Defined in: [src/config/OptionsSchema.ts:63](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/config/OptionsSchema.ts#L63)

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
