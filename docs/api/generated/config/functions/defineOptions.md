[@graphty/graphty-element](../../index.md) / [config](../index.md) / defineOptions

# Function: defineOptions()

> **defineOptions**\<`S`\>(`schema`): `S`

Defined in: [src/config/OptionsSchema.ts:89](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/config/OptionsSchema.ts#L89)

Helper to define options with full type inference

## Type Parameters

### S

`S` *extends* [`OptionsSchema`](../type-aliases/OptionsSchema.md)

## Parameters

### schema

`S`

## Returns

`S`

## Example

```typescript
export const myOptions = defineOptions({
    dampingFactor: {
        schema: z.number().min(0).max(1).default(0.85),
        meta: {
            label: "Damping Factor",
            description: "Probability of following a link",
            step: 0.05,
        },
    },
});
```
