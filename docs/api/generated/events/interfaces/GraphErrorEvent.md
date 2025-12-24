[@graphty/graphty-element](../../index.md) / [events](../index.md) / GraphErrorEvent

# Interface: GraphErrorEvent

Defined in: [src/events.ts:28](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/events.ts#L28)

## Properties

### context

> **context**: `"xr"` \| `"layout"` \| `"init"` \| `"data-loading"` \| `"algorithm"` \| `"other"`

Defined in: [src/events.ts:32](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/events.ts#L32)

***

### details?

> `optional` **details**: `Record`\<`string`, `unknown`\>

Defined in: [src/events.ts:33](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/events.ts#L33)

***

### error

> **error**: `Error`

Defined in: [src/events.ts:31](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/events.ts#L31)

***

### graph

> **graph**: [`Graph`](../../Graph/classes/Graph.md) \| `null`

Defined in: [src/events.ts:30](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/events.ts#L30)

***

### type

> **type**: `"error"`

Defined in: [src/events.ts:29](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/events.ts#L29)
