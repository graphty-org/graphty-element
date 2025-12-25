[@graphty/graphty-element](../../index.md) / [managers](../index.md) / Operation

# Interface: Operation

Defined in: [src/managers/OperationQueueManager.ts:27](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/OperationQueueManager.ts#L27)

## Properties

### abortController?

> `optional` **abortController**: `AbortController`

Defined in: [src/managers/OperationQueueManager.ts:31](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/OperationQueueManager.ts#L31)

***

### category

> **category**: [`OperationCategory`](../type-aliases/OperationCategory.md)

Defined in: [src/managers/OperationQueueManager.ts:29](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/OperationQueueManager.ts#L29)

***

### execute()

> **execute**: (`context`) => `void` \| `Promise`\<`void`\>

Defined in: [src/managers/OperationQueueManager.ts:30](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/OperationQueueManager.ts#L30)

#### Parameters

##### context

[`OperationContext`](OperationContext.md)

#### Returns

`void` \| `Promise`\<`void`\>

***

### id

> **id**: `string`

Defined in: [src/managers/OperationQueueManager.ts:28](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/OperationQueueManager.ts#L28)

***

### metadata?

> `optional` **metadata**: `OperationMetadata`

Defined in: [src/managers/OperationQueueManager.ts:32](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/OperationQueueManager.ts#L32)

***

### reject()?

> `optional` **reject**: (`reason?`) => `void`

Defined in: [src/managers/OperationQueueManager.ts:34](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/OperationQueueManager.ts#L34)

#### Parameters

##### reason?

`unknown`

#### Returns

`void`

***

### resolve()?

> `optional` **resolve**: (`value`) => `void`

Defined in: [src/managers/OperationQueueManager.ts:33](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/OperationQueueManager.ts#L33)

#### Parameters

##### value

`void` | `PromiseLike`\<`void`\>

#### Returns

`void`
