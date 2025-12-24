[@graphty/graphty-element](../../index.md) / [config](../index.md) / SuggestedStyleLayerMetadata

# Interface: SuggestedStyleLayerMetadata

Defined in: [src/config/SuggestedStyles.ts:96](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/config/SuggestedStyles.ts#L96)

Metadata for a suggested style layer

## Example

```typescript
const metadata: SuggestedStyleLayerMetadata = {
  name: "Degree - Viridis Gradient",
  description: "Colors nodes from purple (low) to yellow (high) based on degree",
  priority: 10
};
```

## Properties

### description?

> `optional` **description**: `string`

Defined in: [src/config/SuggestedStyles.ts:100](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/config/SuggestedStyles.ts#L100)

Optional description of what this style visualizes

***

### name

> **name**: `string`

Defined in: [src/config/SuggestedStyles.ts:98](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/config/SuggestedStyles.ts#L98)

Human-readable name for this style layer

***

### priority?

> `optional` **priority**: `number`

Defined in: [src/config/SuggestedStyles.ts:102](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/config/SuggestedStyles.ts#L102)

Priority for ordering when multiple algorithms suggest styles (higher = applied later)
