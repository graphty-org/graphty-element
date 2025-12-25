[@graphty/graphty-element](../../index.md) / [config](../index.md) / SuggestedStylesConfig

# Interface: SuggestedStylesConfig

Defined in: [src/config/SuggestedStyles.ts:118](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/config/SuggestedStyles.ts#L118)

Complete suggested styles configuration from an algorithm

## Properties

### category?

> `optional` **category**: `"path"` \| `"node-metric"` \| `"edge-metric"` \| `"grouping"` \| `"hierarchy"`

Defined in: [src/config/SuggestedStyles.ts:124](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/config/SuggestedStyles.ts#L124)

Category of visualization for grouping/filtering

***

### description?

> `optional` **description**: `string`

Defined in: [src/config/SuggestedStyles.ts:122](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/config/SuggestedStyles.ts#L122)

Overall description of the visualization strategy

***

### layers

> **layers**: [`SuggestedStyleLayer`](SuggestedStyleLayer.md)[]

Defined in: [src/config/SuggestedStyles.ts:120](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/config/SuggestedStyles.ts#L120)

Array of style layers to apply
