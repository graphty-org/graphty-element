[@graphty/graphty-element](../../index.md) / [config](../index.md) / defineOptions

# Function: defineOptions()

> **defineOptions**\<`S`\>(`schema`): `S`

Defined in: [src/config/OptionsSchema.ts:89](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/config/OptionsSchema.ts#L89)

Helper to define options with full type inference

## Type Parameters

### S

`S` *extends* [`OptionsSchema`](../type-aliases/OptionsSchema.md)

## Parameters

### schema

`S`

Options schema definition

## Returns

`S`

The same schema with full type inference

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
