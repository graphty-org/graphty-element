[@graphty/graphty-element](../../index.md) / [config](../index.md) / InferOptions

# Type Alias: InferOptions\<S\>

> **InferOptions**\<`S`\> = `{ [K in keyof S]: z.infer<S[K]["schema"]> }`

Defined in: [src/config/OptionsSchema.ts:63](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/config/OptionsSchema.ts#L63)

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
