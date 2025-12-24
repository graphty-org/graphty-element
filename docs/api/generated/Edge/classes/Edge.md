[@graphty/graphty-element](../../index.md) / [Edge](../index.md) / Edge

# Class: Edge

Defined in: [src/Edge.ts:41](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Edge.ts#L41)

## Constructors

### Constructor

> **new Edge**(`graph`, `srcNodeId`, `dstNodeId`, `styleId`, `data`, `opts`): `Edge`

Defined in: [src/Edge.ts:85](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Edge.ts#L85)

#### Parameters

##### graph

[`GraphContext`](../../managers/interfaces/GraphContext.md) | [`Graph`](../../Graph/classes/Graph.md)

##### srcNodeId

[`NodeIdType`](../../Node/type-aliases/NodeIdType.md)

##### dstNodeId

[`NodeIdType`](../../Node/type-aliases/NodeIdType.md)

##### styleId

[`EdgeStyleId`](../../Styles/type-aliases/EdgeStyleId.md)

##### data

[`AdHocData`](../../config/type-aliases/AdHocData.md)

##### opts

`EdgeOpts` = `{}`

#### Returns

`Edge`

## Properties

### algorithmResults

> **algorithmResults**: [`AdHocData`](../../config/type-aliases/AdHocData.md)

Defined in: [src/Edge.ts:50](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Edge.ts#L50)

***

### arrowHeadText

> **arrowHeadText**: `RichTextLabel` \| `null` = `null`

Defined in: [src/Edge.ts:59](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Edge.ts#L59)

***

### arrowMesh

> **arrowMesh**: `AbstractMesh` \| `null` = `null`

Defined in: [src/Edge.ts:53](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Edge.ts#L53)

***

### arrowTailMesh

> **arrowTailMesh**: `AbstractMesh` \| `null` = `null`

Defined in: [src/Edge.ts:54](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Edge.ts#L54)

***

### arrowTailText

> **arrowTailText**: `RichTextLabel` \| `null` = `null`

Defined in: [src/Edge.ts:60](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Edge.ts#L60)

***

### changeManager

> **changeManager**: `ChangeManager`

Defined in: [src/Edge.ts:65](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Edge.ts#L65)

***

### data

> **data**: [`AdHocData`](../../config/type-aliases/AdHocData.md)

Defined in: [src/Edge.ts:49](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Edge.ts#L49)

***

### dstId

> **dstId**: [`NodeIdType`](../../Node/type-aliases/NodeIdType.md)

Defined in: [src/Edge.ts:45](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Edge.ts#L45)

***

### dstNode

> **dstNode**: [`Node`](../../Node/classes/Node.md)

Defined in: [src/Edge.ts:47](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Edge.ts#L47)

***

### id

> **id**: `string`

Defined in: [src/Edge.ts:46](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Edge.ts#L46)

***

### label

> **label**: `RichTextLabel` \| `null` = `null`

Defined in: [src/Edge.ts:58](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Edge.ts#L58)

***

### mesh

> **mesh**: `AbstractMesh` \| `PatternedLineMesh`

Defined in: [src/Edge.ts:52](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Edge.ts#L52)

***

### opts

> **opts**: `EdgeOpts`

Defined in: [src/Edge.ts:43](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Edge.ts#L43)

***

### parentGraph

> **parentGraph**: [`GraphContext`](../../managers/interfaces/GraphContext.md) \| [`Graph`](../../Graph/classes/Graph.md)

Defined in: [src/Edge.ts:42](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Edge.ts#L42)

***

### ray

> **ray**: `Ray`

Defined in: [src/Edge.ts:57](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Edge.ts#L57)

***

### srcId

> **srcId**: [`NodeIdType`](../../Node/type-aliases/NodeIdType.md)

Defined in: [src/Edge.ts:44](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Edge.ts#L44)

***

### srcNode

> **srcNode**: [`Node`](../../Node/classes/Node.md)

Defined in: [src/Edge.ts:48](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Edge.ts#L48)

***

### styleId

> **styleId**: [`EdgeStyleId`](../../Styles/type-aliases/EdgeStyleId.md)

Defined in: [src/Edge.ts:55](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Edge.ts#L55)

***

### styleUpdates

> **styleUpdates**: [`AdHocData`](../../config/type-aliases/AdHocData.md)

Defined in: [src/Edge.ts:51](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Edge.ts#L51)

## Methods

### addCalculatedStyle()

> **addCalculatedStyle**(`cv`): `void`

Defined in: [src/Edge.ts:218](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Edge.ts#L218)

#### Parameters

##### cv

`CalculatedValue`

#### Returns

`void`

***

### getInterceptPoints()

> **getInterceptPoints**(): `InterceptPoint`

Defined in: [src/Edge.ts:799](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Edge.ts#L799)

#### Returns

`InterceptPoint`

***

### transformArrowCap()

> **transformArrowCap**(): `EdgeLine`

Defined in: [src/Edge.ts:550](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Edge.ts#L550)

#### Returns

`EdgeLine`

***

### transformEdgeMesh()

> **transformEdgeMesh**(`srcPoint`, `dstPoint`): `void`

Defined in: [src/Edge.ts:532](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Edge.ts#L532)

#### Parameters

##### srcPoint

`Vector3`

##### dstPoint

`Vector3`

#### Returns

`void`

***

### update()

> **update**(): `void`

Defined in: [src/Edge.ts:222](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Edge.ts#L222)

#### Returns

`void`

***

### updateRays()

> `static` **updateRays**(`g`): `void`

Defined in: [src/Edge.ts:497](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Edge.ts#L497)

#### Parameters

##### g

[`GraphContext`](../../managers/interfaces/GraphContext.md) | [`Graph`](../../Graph/classes/Graph.md)

#### Returns

`void`

***

### updateStyle()

> **updateStyle**(`styleId`): `void`

Defined in: [src/Edge.ts:336](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Edge.ts#L336)

#### Parameters

##### styleId

[`EdgeStyleId`](../../Styles/type-aliases/EdgeStyleId.md)

#### Returns

`void`
