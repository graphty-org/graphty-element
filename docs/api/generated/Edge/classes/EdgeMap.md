[@graphty/graphty-element](../../index.md) / [Edge](../index.md) / EdgeMap

# Class: EdgeMap

Defined in: [src/Edge.ts:1005](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Edge.ts#L1005)

## Constructors

### Constructor

> **new EdgeMap**(): `EdgeMap`

#### Returns

`EdgeMap`

## Properties

### map

> **map**: `Map`\<[`NodeIdType`](../../Node/type-aliases/NodeIdType.md), `Map`\<[`NodeIdType`](../../Node/type-aliases/NodeIdType.md), [`Edge`](Edge.md)\>\>

Defined in: [src/Edge.ts:1006](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Edge.ts#L1006)

## Accessors

### size

#### Get Signature

> **get** **size**(): `number`

Defined in: [src/Edge.ts:1040](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Edge.ts#L1040)

##### Returns

`number`

## Methods

### clear()

> **clear**(): `void`

Defined in: [src/Edge.ts:1065](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Edge.ts#L1065)

#### Returns

`void`

***

### delete()

> **delete**(`srcId`, `dstId`): `boolean`

Defined in: [src/Edge.ts:1049](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Edge.ts#L1049)

#### Parameters

##### srcId

[`NodeIdType`](../../Node/type-aliases/NodeIdType.md)

##### dstId

[`NodeIdType`](../../Node/type-aliases/NodeIdType.md)

#### Returns

`boolean`

***

### get()

> **get**(`srcId`, `dstId`): [`Edge`](Edge.md) \| `undefined`

Defined in: [src/Edge.ts:1031](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Edge.ts#L1031)

#### Parameters

##### srcId

[`NodeIdType`](../../Node/type-aliases/NodeIdType.md)

##### dstId

[`NodeIdType`](../../Node/type-aliases/NodeIdType.md)

#### Returns

[`Edge`](Edge.md) \| `undefined`

***

### has()

> **has**(`srcId`, `dstId`): `boolean`

Defined in: [src/Edge.ts:1008](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Edge.ts#L1008)

#### Parameters

##### srcId

[`NodeIdType`](../../Node/type-aliases/NodeIdType.md)

##### dstId

[`NodeIdType`](../../Node/type-aliases/NodeIdType.md)

#### Returns

`boolean`

***

### set()

> **set**(`srcId`, `dstId`, `e`): `void`

Defined in: [src/Edge.ts:1017](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/Edge.ts#L1017)

#### Parameters

##### srcId

[`NodeIdType`](../../Node/type-aliases/NodeIdType.md)

##### dstId

[`NodeIdType`](../../Node/type-aliases/NodeIdType.md)

##### e

[`Edge`](Edge.md)

#### Returns

`void`
