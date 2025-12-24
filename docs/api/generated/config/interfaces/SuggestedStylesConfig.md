[@graphty/graphty-element](../../index.md) / [config](../index.md) / SuggestedStylesConfig

# Interface: SuggestedStylesConfig

Defined in: [src/config/SuggestedStyles.ts:120](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/config/SuggestedStyles.ts#L120)

Complete suggested styles configuration from an algorithm

## Properties

### category?

> `optional` **category**: `"path"` \| `"node-metric"` \| `"edge-metric"` \| `"grouping"` \| `"hierarchy"`

Defined in: [src/config/SuggestedStyles.ts:126](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/config/SuggestedStyles.ts#L126)

Category of visualization for grouping/filtering

***

### description?

> `optional` **description**: `string`

Defined in: [src/config/SuggestedStyles.ts:124](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/config/SuggestedStyles.ts#L124)

Overall description of the visualization strategy

***

### layers

> **layers**: [`SuggestedStyleLayer`](SuggestedStyleLayer.md)[]

Defined in: [src/config/SuggestedStyles.ts:122](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/config/SuggestedStyles.ts#L122)

Array of style layers to apply
