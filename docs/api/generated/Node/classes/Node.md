[@graphty/graphty-element](../../index.md) / [Node](../index.md) / Node

# Class: Node

Defined in: [src/Node.ts:24](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Node.ts#L24)

## Constructors

### Constructor

> **new Node**(`graph`, `nodeId`, `styleId`, `data`, `opts`): `Node`

Defined in: [src/Node.ts:53](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Node.ts#L53)

#### Parameters

##### graph

[`GraphContext`](../../managers/interfaces/GraphContext.md) | [`Graph`](../../Graph/classes/Graph.md)

##### nodeId

[`NodeIdType`](../type-aliases/NodeIdType.md)

##### styleId

[`NodeStyleId`](../../Styles/type-aliases/NodeStyleId.md)

##### data

[`AdHocData`](../../config/type-aliases/AdHocData.md)\<`string` \| `number`\>

##### opts

`NodeOpts` = `{}`

#### Returns

`Node`

## Properties

### algorithmResults

> **algorithmResults**: [`AdHocData`](../../config/type-aliases/AdHocData.md)

Defined in: [src/Node.ts:29](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Node.ts#L29)

***

### changeManager

> **changeManager**: `ChangeManager`

Defined in: [src/Node.ts:38](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Node.ts#L38)

***

### data

> **data**: [`AdHocData`](../../config/type-aliases/AdHocData.md)\<`string` \| `number`\>

Defined in: [src/Node.ts:28](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Node.ts#L28)

***

### dragging

> **dragging**: `boolean` = `false`

Defined in: [src/Node.ts:34](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Node.ts#L34)

***

### dragHandler?

> `optional` **dragHandler**: `NodeDragHandler`

Defined in: [src/Node.ts:33](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Node.ts#L33)

***

### id

> **id**: [`NodeIdType`](../type-aliases/NodeIdType.md)

Defined in: [src/Node.ts:27](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Node.ts#L27)

***

### label?

> `optional` **label**: `RichTextLabel`

Defined in: [src/Node.ts:32](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Node.ts#L32)

***

### mesh

> **mesh**: `AbstractMesh`

Defined in: [src/Node.ts:31](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Node.ts#L31)

***

### opts

> **opts**: `NodeOpts`

Defined in: [src/Node.ts:26](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Node.ts#L26)

***

### parentGraph

> **parentGraph**: [`GraphContext`](../../managers/interfaces/GraphContext.md) \| [`Graph`](../../Graph/classes/Graph.md)

Defined in: [src/Node.ts:25](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Node.ts#L25)

***

### pinOnDrag

> **pinOnDrag**: `boolean`

Defined in: [src/Node.ts:36](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Node.ts#L36)

***

### size

> **size**: `number`

Defined in: [src/Node.ts:37](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Node.ts#L37)

***

### styleId

> **styleId**: [`NodeStyleId`](../../Styles/type-aliases/NodeStyleId.md)

Defined in: [src/Node.ts:35](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Node.ts#L35)

***

### styleUpdates

> **styleUpdates**: [`AdHocData`](../../config/type-aliases/AdHocData.md)

Defined in: [src/Node.ts:30](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Node.ts#L30)

## Methods

### addCalculatedStyle()

> **addCalculatedStyle**(`cv`): `void`

Defined in: [src/Node.ts:106](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Node.ts#L106)

#### Parameters

##### cv

`CalculatedValue`

#### Returns

`void`

***

### getPosition()

> **getPosition**(): `object`

Defined in: [src/Node.ts:382](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Node.ts#L382)

#### Returns

`object`

##### x

> **x**: `number`

##### y

> **y**: `number`

##### z

> **z**: `number`

***

### isPinned()

> **isPinned**(): `boolean`

Defined in: [src/Node.ts:390](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Node.ts#L390)

#### Returns

`boolean`

***

### isSelected()

> **isSelected**(): `boolean`

Defined in: [src/Node.ts:395](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Node.ts#L395)

#### Returns

`boolean`

***

### pin()

> **pin**(): `void`

Defined in: [src/Node.ts:238](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Node.ts#L238)

#### Returns

`void`

***

### unpin()

> **unpin**(): `void`

Defined in: [src/Node.ts:242](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Node.ts#L242)

#### Returns

`void`

***

### update()

> **update**(): `void`

Defined in: [src/Node.ts:110](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Node.ts#L110)

#### Returns

`void`

***

### updateStyle()

> **updateStyle**(`styleId`): `void`

Defined in: [src/Node.ts:151](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Node.ts#L151)

#### Parameters

##### styleId

[`NodeStyleId`](../../Styles/type-aliases/NodeStyleId.md)

#### Returns

`void`
